import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium, firefox, webkit } from 'playwright';
import { createServer } from 'vite';

import {
  aggregateRuns,
  deriveBudgets,
  qualifyStrategy,
  recommendMaterialization,
  renderDecisionReport,
  verifyAgainstBudgets,
} from './report.mjs';

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPOSITORY_ROOT = path.resolve(PACKAGE_ROOT, '../..');
const MODES = new Set(['smoke', 'record', 'verify']);
const PROFILES = new Set(['smoke', 'canonical', 'enterprise']);
const BROWSERS = new Set(['chromium', 'firefox', 'webkit']);
const STRATEGIES = ['full', 'partitioned', 'on-demand', 'hybrid'];
const BROWSER_TYPES = { chromium, firefox, webkit };
const require = createRequire(import.meta.url);
const PROGRESS_FILE = path.join(REPOSITORY_ROOT, '.codex/progress/nexora-calibration-runs.json');
const MATERIALIZER_MEMORY_FLOOR = 8 * 1024 * 1024 * 1024;
const LOCATOR_MEMORY_FLOOR = 4 * 1024 * 1024 * 1024;
const HOST_SWAP_FLOOR = 256 * 1024 * 1024;
const BENCHMARK_SOURCE_PATHS = [
  'tools/nexora-benchmark/package.json',
  'tools/nexora-benchmark/scripts',
  'tools/nexora-benchmark/src',
  'tools/nexora-benchmark/tsconfig.json',
  'tools/nexora-benchmark/tsconfig.worker.json',
  'tools/nexora-benchmark/vite.config.ts',
  'tools/nexora-benchmark/vitest.config.ts',
];

class HostMemoryCeilingError extends Error {
  constructor(runId, observed) {
    super(
      `${runId} reached the host memory safety ceiling (${observed.availableMemoryBytes} available bytes, ${observed.swapFreeBytes} swap bytes)`,
    );
    this.name = 'HostMemoryCeilingError';
    this.observed = observed;
  }
}

export function classifyResourceFailure(error) {
  if (error instanceof HostMemoryCeilingError) {
    return {
      kind: 'host-memory-ceiling',
      message: error.message,
      observed: error.observed,
    };
  }
  if (
    error instanceof Error &&
    (error.name === 'QuotaExceededError' || /QuotaExceededError/i.test(error.message))
  ) {
    return { kind: 'indexeddb-quota-exceeded', message: error.message };
  }
  if (error instanceof Error && /\bCalibration \S+ timed out\b/.test(error.message)) {
    return { kind: 'calibration-timeout', message: error.message };
  }
  return null;
}

export function parseMemoryInfo(contents) {
  const values = Object.fromEntries(
    contents
      .trim()
      .split('\n')
      .map((line) => {
        const match = /^(MemAvailable|SwapFree):\s+(\d+)\s+kB$/.exec(line.trim());
        return match ? [match[1], Number(match[2]) * 1024] : [];
      })
      .filter((entry) => entry.length === 2),
  );
  if (!Number.isFinite(values.MemAvailable) || !Number.isFinite(values.SwapFree)) {
    throw new Error('Unable to parse MemAvailable and SwapFree from /proc/meminfo');
  }
  return {
    availableMemoryBytes: values.MemAvailable,
    swapFreeBytes: values.SwapFree,
  };
}

export function memoryFloorForStrategy(strategy) {
  return strategy === 'on-demand' ? LOCATOR_MEMORY_FLOOR : MATERIALIZER_MEMORY_FLOOR;
}

function hostMemoryGuard(runId, strategy) {
  const availableMemoryFloor = memoryFloorForStrategy(strategy);
  let interval;
  const promise = new Promise((_, reject) => {
    interval = setInterval(() => {
      const observed = parseMemoryInfo(readFileSync('/proc/meminfo', 'utf8'));
      if (
        observed.availableMemoryBytes < availableMemoryFloor &&
        observed.swapFreeBytes < HOST_SWAP_FLOOR
      ) {
        reject(new HostMemoryCeilingError(runId, observed));
      }
    }, 1_000);
  });
  return { promise, stop: () => clearInterval(interval) };
}

function option(arguments_, name) {
  return arguments_.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function commaList(value) {
  return [
    ...new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseArguments(arguments_) {
  const known = new Set(['mode', 'profile', 'samples', 'browser']);
  for (const argument of arguments_) {
    const match = /^--([^=]+)=/.exec(argument);
    if (!match || !known.has(match[1])) throw new RangeError(`Unsupported argument: ${argument}`);
  }
  const mode = option(arguments_, 'mode') ?? 'smoke';
  if (!MODES.has(mode)) throw new RangeError(`Unsupported mode: ${mode}`);
  if (mode === 'smoke') {
    return { mode, profiles: ['smoke'], samples: 1, browsers: ['chromium'] };
  }

  const profiles = commaList(
    option(arguments_, 'profile') ?? (mode === 'record' ? 'canonical,enterprise' : 'canonical'),
  );
  for (const profile of profiles) {
    if (!PROFILES.has(profile)) throw new RangeError(`Unsupported profile: ${profile}`);
  }
  const browsers = commaList(option(arguments_, 'browser') ?? 'chromium,firefox,webkit');
  for (const browser of browsers) {
    if (!BROWSERS.has(browser)) throw new RangeError(`Unsupported browser: ${browser}`);
  }
  const samples = Number(option(arguments_, 'samples') ?? 3);
  if (!Number.isSafeInteger(samples) || samples <= 0) {
    throw new RangeError('samples must be a positive safe integer');
  }
  return { mode, profiles, samples, browsers };
}

function timeoutFor(profile) {
  if (profile === 'smoke') return 120_000;
  if (profile === 'canonical') return 1_200_000;
  return 2_700_000;
}

async function runPageScenario(browser, baseUrl, request) {
  const context = await browser.newContext();
  let memoryGuard;
  let pageFailure;
  const failed = new Promise((_, reject) => {
    pageFailure = reject;
  });
  try {
    const page = await context.newPage();
    memoryGuard = hostMemoryGuard(request.runId, request.strategy);
    page.on('pageerror', (error) => pageFailure(error));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        pageFailure(new Error(`Browser console error: ${message.text()}`));
      }
    });
    await Promise.race([page.goto(baseUrl, { waitUntil: 'load' }), failed, memoryGuard.promise]);
    await Promise.race([
      page.evaluate(() => globalThis.nexoraCalibrationReady),
      failed,
      memoryGuard.promise,
    ]);
    const run = await Promise.race([
      page.evaluate((value) => globalThis.runNexoraCalibration(value), request),
      failed,
      memoryGuard.promise,
    ]);
    const leakedDatabase = await page.evaluate(async (databaseName) => {
      if (!globalThis.indexedDB.databases) return false;
      return (await globalThis.indexedDB.databases()).some(
        (database) => database.name === databaseName,
      );
    }, `nexora-${request.runId}`);
    return { ...run, leakedDatabase, backgroundActive: false };
  } finally {
    memoryGuard?.stop();
    await context.close().catch(() => {});
  }
}

function assertCorrectness(run, reference) {
  if (run.metrics.probes.some((probe) => probe.result.completeness !== 'complete')) {
    throw new Error(`${run.runId} returned an incomplete probe as a completed run`);
  }
  if (!reference) return;
  if (run.digest !== reference.digest) {
    throw new Error(`${run.runId} correctness digest differs from ${reference.runId}`);
  }
  const referenceProbes = new Map(
    reference.metrics.probes.map((probe) => [probe.probe, probe.result.digest]),
  );
  for (const probe of run.metrics.probes) {
    if (probe.result.digest !== referenceProbes.get(probe.probe)) {
      throw new Error(`${run.runId} ${probe.probe} digest differs from ${reference.runId}`);
    }
  }
}

async function startLaboratory() {
  const server = await createServer({
    root: PACKAGE_ROOT,
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') {
    await server.close();
    throw new Error('Vite did not expose its ephemeral TCP port');
  }
  return { server, url: `http://127.0.0.1:${address.port}/` };
}

export async function runCalibrationMatrix(configuration) {
  const strategies = configuration.strategies ?? STRATEGIES;
  const targetRunIds = new Set(
    configuration.browsers.flatMap((browserName) =>
      configuration.profiles.flatMap((profile) =>
        strategies.flatMap((strategy) =>
          Array.from(
            { length: configuration.samples },
            (_, index) => `${profile}-${browserName}-${strategy}-${index + 1}`,
          ),
        ),
      ),
    ),
  );
  const runs = (configuration.existingRuns ?? []).filter((run) => targetRunIds.has(run.runId));
  const browserVersions = { ...(configuration.existingBrowserVersions ?? {}) };
  const references = new Map();
  for (const run of runs) {
    if (!run.failed && !references.has(`${run.profile}\u0000${run.browser}`)) {
      references.set(`${run.profile}\u0000${run.browser}`, run);
    }
  }
  const laboratory = await startLaboratory();
  try {
    for (const browserName of configuration.browsers) {
      for (const profile of configuration.profiles) {
        for (const strategy of strategies) {
          for (let sample = 1; sample <= configuration.samples; sample += 1) {
            const runId = `${profile}-${browserName}-${strategy}-${sample}`;
            if (runs.some((run) => run.runId === runId)) {
              console.log(`[skip] ${runId}`);
              continue;
            }
            console.log(`[start] ${runId}`);
            const request = {
              type: 'start',
              scenario: 'nexora-materialization-calibration-v1',
              runId,
              profile,
              strategy,
              browser: browserName,
              sample,
              timeoutMs: timeoutFor(profile),
            };
            const browser = await BROWSER_TYPES[browserName].launch({ headless: true });
            browserVersions[browserName] = browser.version();
            let run;
            try {
              try {
                run = await runPageScenario(browser, laboratory.url, request);
              } catch (error) {
                const failure = classifyResourceFailure(error);
                if (!failure) throw error;
                run = {
                  scenario: request.scenario,
                  runId,
                  profile,
                  strategy,
                  browser: browserName,
                  sample,
                  failed: true,
                  failure: {
                    kind: failure.kind,
                    message: failure.message,
                  },
                };
                if (failure.observed) run.observed = failure.observed;
              }
            } finally {
              await browser.close();
            }
            const referenceKey = `${profile}\u0000${browserName}`;
            const reference = references.get(referenceKey);
            if (!run.failed) {
              assertCorrectness(run, reference);
              if (!reference) references.set(referenceKey, run);
            }
            runs.push(run);
            await configuration.onRun?.({ runs, browserVersions });
            if (run.failed) {
              console.log(`[reject] ${runId} ${run.failure.message}`);
            } else {
              console.log(
                `[done] ${runId} operational=${run.metrics.operationalReadyMs.toFixed(1)}ms complete=${run.metrics.completeReadyMs.toFixed(1)}ms`,
              );
            }
          }
        }
      }
    }
  } finally {
    await laboratory.server.close();
  }
  return {
    runs: runs.sort((left, right) => left.runId.localeCompare(right.runId)),
    browserVersions,
  };
}

function gitCommit() {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPOSITORY_ROOT,
    encoding: 'utf8',
  }).trim();
}

function benchmarkSourceDirty() {
  return (
    execFileSync(
      'git',
      ['status', '--porcelain', '--untracked-files=no', '--', ...BENCHMARK_SOURCE_PATHS],
      {
        cwd: REPOSITORY_ROOT,
        encoding: 'utf8',
      },
    ).trim().length > 0
  );
}

async function resumableConfiguration(configuration) {
  const sourceCommit = gitCommit();
  let progress;
  try {
    progress = JSON.parse(await readFile(PROGRESS_FILE, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const reusable = progress?.sourceCommit === sourceCommit;
  const persist = async ({ runs, browserVersions }) => {
    await mkdir(path.dirname(PROGRESS_FILE), { recursive: true });
    await writeFile(
      PROGRESS_FILE,
      `${JSON.stringify(
        {
          sourceCommit,
          configuration: {
            profiles: configuration.profiles,
            browsers: configuration.browsers,
            samples: configuration.samples,
          },
          browserVersions,
          runs,
        },
        null,
        2,
      )}\n`,
    );
  };
  return {
    ...configuration,
    existingRuns: reusable ? progress.runs : [],
    existingBrowserVersions: reusable ? progress.browserVersions : {},
    onRun: persist,
  };
}

function environmentFor(configuration, browserVersions) {
  const packageJson = require('playwright/package.json');
  return {
    recordedAt: new Date().toISOString(),
    os: `${os.platform()} ${os.release()}`,
    arch: os.arch(),
    cpu: os.cpus()[0]?.model ?? 'unknown',
    logicalCores: os.cpus().length,
    memoryBytes: os.totalmem(),
    node: process.version,
    playwright: packageJson.version,
    browserVersions,
    profiles: configuration.profiles,
    seed: 'nexora-calibration-v1',
    samples: configuration.samples,
    gitCommit: gitCommit(),
    benchmarkSourceDirty: benchmarkSourceDirty(),
  };
}

function printSummary(aggregates) {
  const fixed = (value) => (value === null ? '—' : value.toFixed(1));
  console.table(
    aggregates.map((item) => ({
      profile: item.profile,
      browser: item.browser,
      strategy: item.strategy,
      result: qualifyStrategy(item).qualified ? 'qualified' : 'rejected',
      operationalP95: fixed(item.operationalReadyMs.p95),
      completeP95: fixed(item.completeReadyMs.p95),
      queryP95: fixed(
        item.samples === item.failedRuns ? null : Math.max(...Object.values(item.probeP95Ms)),
      ),
      workerMax: fixed(item.maxWorkerBatchMs),
      mainGapMax: fixed(item.maxMainThreadGapMs),
      bytesP95: item.storageBytes.p95,
      reasons: qualifyStrategy(item).reasons.join('; '),
    })),
  );
}

async function writeRecordedEvidence({ runs, aggregates, recommendation, budgets, environment }) {
  const baselineDirectory = path.join(PACKAGE_ROOT, 'baselines');
  const budgetDirectory = path.join(PACKAGE_ROOT, 'budgets');
  const reportDirectory = path.join(PACKAGE_ROOT, 'reports');
  await Promise.all([
    mkdir(baselineDirectory, { recursive: true }),
    mkdir(budgetDirectory, { recursive: true }),
    mkdir(reportDirectory, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(
      path.join(baselineDirectory, 'reference.json'),
      `${JSON.stringify(
        {
          scenario: 'nexora-materialization-calibration-v1',
          environment,
          runs,
          aggregates,
          recommendation,
        },
        null,
        2,
      )}\n`,
    ),
    writeFile(
      path.join(budgetDirectory, 'reference.json'),
      `${JSON.stringify(
        {
          scenario: 'nexora-materialization-calibration-v1',
          sourceCommit: environment.gitCommit,
          benchmarkSourceDirty: environment.benchmarkSourceDirty,
          recommendation: recommendation.strategy,
          budgets,
        },
        null,
        2,
      )}\n`,
    ),
    writeFile(
      path.join(reportDirectory, 'materialization-decision.md'),
      renderDecisionReport({ environment, runs, aggregates, recommendation }),
    ),
  ]);
}

export function selectApplicableBudgets(budgets, profiles) {
  const requested = new Set(profiles);
  return budgets.filter((budget) => requested.has(budget.profile));
}

export function strategiesForBudgets(budgets) {
  return [...new Set(budgets.map((budget) => budget.strategy))].sort();
}

async function main() {
  const configuration = parseArguments(process.argv.slice(2));
  let recorded;
  let applicableBudgets;
  let executionConfiguration = configuration;
  if (configuration.mode === 'record') {
    executionConfiguration = await resumableConfiguration(configuration);
  } else if (configuration.mode === 'verify') {
    recorded = JSON.parse(
      await readFile(path.join(PACKAGE_ROOT, 'budgets/reference.json'), 'utf8'),
    );
    applicableBudgets = selectApplicableBudgets(recorded.budgets, configuration.profiles);
    if (applicableBudgets.length === 0) {
      throw new Error(`No recorded budgets apply to ${configuration.profiles.join(', ')}`);
    }
    executionConfiguration = {
      ...configuration,
      strategies: strategiesForBudgets(applicableBudgets),
    };
  }
  const measured = await runCalibrationMatrix(executionConfiguration);
  const aggregates = aggregateRuns(measured.runs);
  const recommendation = recommendMaterialization(aggregates);
  printSummary(aggregates);

  if (configuration.mode === 'smoke') {
    const rejected = aggregates.filter((item) => !qualifyStrategy(item).qualified);
    if (rejected.length > 0) throw new Error('Smoke calibration produced rejected strategies');
    return;
  }

  if (configuration.mode === 'record') {
    if (!recommendation.strategy) throw new Error('No materialization strategy qualified');
    const environment = environmentFor(configuration, measured.browserVersions);
    await writeRecordedEvidence({
      runs: measured.runs,
      aggregates,
      recommendation,
      budgets: deriveBudgets(aggregates),
      environment,
    });
    return;
  }

  const qualificationFailures = aggregates
    .filter(
      (item) =>
        applicableBudgets.some(
          (budget) => budget.profile === item.profile && budget.strategy === item.strategy,
        ) && !qualifyStrategy(item).qualified,
    )
    .map((item) => `${item.profile}/${item.browser}/${item.strategy} failed hard qualification`);
  const failures = [
    ...qualificationFailures,
    ...verifyAgainstBudgets(aggregates, applicableBudgets),
  ];
  if (failures.length > 0) throw new Error(`Calibration budget failures:\n${failures.join('\n')}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
