import { execFileSync } from 'node:child_process';
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
  let pageFailure;
  const failed = new Promise((_, reject) => {
    pageFailure = reject;
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', (error) => pageFailure(error));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        pageFailure(new Error(`Browser console error: ${message.text()}`));
      }
    });
    await Promise.race([page.goto(baseUrl, { waitUntil: 'load' }), failed]);
    await Promise.race([page.evaluate(() => globalThis.nexoraCalibrationReady), failed]);
    const run = await Promise.race([
      page.evaluate((value) => globalThis.runNexoraCalibration(value), request),
      failed,
    ]);
    const leakedDatabase = await page.evaluate(async (databaseName) => {
      if (!globalThis.indexedDB.databases) return false;
      return (await globalThis.indexedDB.databases()).some(
        (database) => database.name === databaseName,
      );
    }, `nexora-${request.runId}`);
    return { ...run, leakedDatabase, backgroundActive: false };
  } finally {
    await context.close();
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
    if (run.strategy === 'full') references.set(`${run.profile}\u0000${run.browser}`, run);
  }
  const laboratory = await startLaboratory();
  try {
    for (const browserName of configuration.browsers) {
      const browser = await BROWSER_TYPES[browserName].launch({ headless: true });
      browserVersions[browserName] = browser.version();
      try {
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
              const run = await runPageScenario(browser, laboratory.url, request);
              const referenceKey = `${profile}\u0000${browserName}`;
              const reference = references.get(referenceKey);
              assertCorrectness(run, reference);
              if (strategy === 'full' && !reference) references.set(referenceKey, run);
              runs.push(run);
              await configuration.onRun?.({ runs, browserVersions });
              console.log(
                `[done] ${runId} operational=${run.metrics.operationalReadyMs.toFixed(1)}ms complete=${run.metrics.completeReadyMs.toFixed(1)}ms`,
              );
            }
          }
        }
      } finally {
        await browser.close();
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
  };
}

function printSummary(aggregates) {
  console.table(
    aggregates.map((item) => ({
      profile: item.profile,
      browser: item.browser,
      strategy: item.strategy,
      result: qualifyStrategy(item).qualified ? 'qualified' : 'rejected',
      operationalP95: item.operationalReadyMs.p95.toFixed(1),
      completeP95: item.completeReadyMs.p95.toFixed(1),
      queryP95: Math.max(...Object.values(item.probeP95Ms)).toFixed(1),
      workerMax: item.maxWorkerBatchMs.toFixed(1),
      mainGapMax: item.maxMainThreadGapMs.toFixed(1),
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
          recommendation: recommendation.strategy,
          budgets,
        },
        null,
        2,
      )}\n`,
    ),
    writeFile(
      path.join(reportDirectory, 'materialization-decision.md'),
      renderDecisionReport({ environment, aggregates, recommendation }),
    ),
  ]);
}

async function main() {
  const configuration = parseArguments(process.argv.slice(2));
  const executionConfiguration =
    configuration.mode === 'record' ? await resumableConfiguration(configuration) : configuration;
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

  const recorded = JSON.parse(
    await readFile(path.join(PACKAGE_ROOT, 'budgets/reference.json'), 'utf8'),
  );
  const qualificationFailures = aggregates
    .filter(
      (item) =>
        recorded.budgets.some(
          (budget) => budget.profile === item.profile && budget.strategy === item.strategy,
        ) && !qualifyStrategy(item).qualified,
    )
    .map((item) => `${item.profile}/${item.browser}/${item.strategy} failed hard qualification`);
  const failures = [
    ...qualificationFailures,
    ...verifyAgainstBudgets(aggregates, recorded.budgets),
  ];
  if (failures.length > 0) throw new Error(`Calibration budget failures:\n${failures.join('\n')}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
