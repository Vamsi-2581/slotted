import assert from 'node:assert/strict';

import { describe, test } from 'vitest';

import {
  classifyResourceFailure,
  memoryFloorForStrategy,
  parseArguments,
  parseMemoryInfo,
  selectApplicableBudgets,
  strategiesForBudgets,
} from './calibrate.mjs';
import {
  aggregateRuns,
  deriveBudgets,
  deriveDurationBudget,
  median,
  nearestRankP95,
  qualifyStrategy,
  recommendMaterialization,
  renderDecisionReport,
} from './report.mjs';

const probes = [
  'orders-page',
  'customer-360',
  'inventory-ledger',
  'finance-summary',
  'historical-point-lookup',
];

function run(overrides = {}) {
  const strategy = overrides.strategy ?? 'full';
  const duration = overrides.duration ?? 10;
  return {
    scenario: 'nexora-materialization-calibration-v1',
    runId: `${strategy}-${overrides.browser ?? 'chromium'}-${overrides.sample ?? 1}`,
    profile: overrides.profile ?? 'smoke',
    strategy,
    browser: overrides.browser ?? 'chromium',
    sample: overrides.sample ?? 1,
    digest: overrides.digest ?? 'reference-digest',
    readiness: [
      { state: 'empty', atMs: 0 },
      { state: 'operational', atMs: duration },
      { state: 'complete', atMs: duration },
    ],
    metrics: {
      operationalReadyMs: overrides.operationalReadyMs ?? duration,
      completeReadyMs: overrides.completeReadyMs ?? duration,
      maxWorkerBatchMs: overrides.maxWorkerBatchMs ?? duration,
      maxMainThreadGapMs: overrides.maxMainThreadGapMs ?? duration,
      storageBytes: overrides.storageBytes ?? 1_000,
      probes: probes.map((probe) => ({
        probe,
        durationMs: overrides.probeDurationMs ?? duration,
        result: {
          probe,
          visibleRecords: ['record-1'],
          total: 1,
          completeness: overrides.completeness ?? 'complete',
          digest: `${probe}-digest`,
        },
      })),
    },
  };
}

function strategyAggregate(overrides = {}) {
  return {
    profile: 'smoke',
    browser: 'chromium',
    strategy: 'full',
    samples: 3,
    digestMatches: true,
    queryDigestsMatch: true,
    readinessTruthful: true,
    failedRuns: 0,
    failureReasons: [],
    leakedDatabases: 0,
    backgroundActive: 0,
    operationalReadyMs: { median: 10, p95: 10 },
    completeReadyMs: { median: 10, p95: 10 },
    maxWorkerBatchMs: 10,
    maxMainThreadGapMs: 10,
    storageBytes: { median: 10, p95: 10 },
    probeP95Ms: Object.fromEntries(probes.map((probe) => [probe, 10])),
    ...overrides,
  };
}

function failedRun(overrides = {}) {
  return {
    scenario: 'nexora-materialization-calibration-v1',
    runId: 'enterprise-chromium-full-1',
    profile: 'enterprise',
    strategy: 'full',
    browser: 'chromium',
    sample: 1,
    failed: true,
    failure: {
      kind: 'host-memory-ceiling',
      message: 'host memory safety ceiling reached',
    },
    observed: { availableMemoryBytes: 4_000_000_000, swapFreeBytes: 0 },
    ...overrides,
  };
}

describe('report statistics', () => {
  test('calculates median and nearest-rank p95 without interpolation', () => {
    assert.equal(median([1, 3, 2, 4]), 2.5);
    assert.equal(nearestRankP95([1, 2, 3, 4, 100]), 100);
  });

  test('aggregates samples per profile, browser, and strategy', () => {
    const aggregates = aggregateRuns([
      run({ sample: 1, duration: 10 }),
      run({ sample: 2, duration: 20 }),
      run({ sample: 3, duration: 90 }),
    ]);
    assert.equal(aggregates.length, 1);
    assert.deepEqual(aggregates[0].operationalReadyMs, { median: 20, p95: 90 });
    assert.equal(aggregates[0].probeP95Ms['orders-page'], 90);
  });

  test('retains a resource-rejected candidate without inventing performance metrics', () => {
    const [aggregate] = aggregateRuns([
      failedRun(),
      run({ profile: 'enterprise', strategy: 'partitioned' }),
    ]);
    assert.equal(aggregate.strategy, 'full');
    assert.equal(aggregate.failedRuns, 1);
    assert.equal(aggregate.operationalReadyMs.p95, null);
    assert.deepEqual(qualifyStrategy(aggregate), {
      qualified: false,
      reasons: [
        'one or more calibration runs failed: host-memory-ceiling (1/1 runs) — host memory safety ceiling reached',
      ],
    });
  });
});

describe('strategy qualification and recommendation', () => {
  test('rejects a fast strategy with a mismatched digest', () => {
    const candidate = strategyAggregate({ strategy: 'full', digestMatches: false });
    assert.deepEqual(qualifyStrategy(candidate), {
      qualified: false,
      reasons: ['correctness digest differs from the reference strategy'],
    });
  });

  test('rejects worker or main-thread blocking above 50ms', () => {
    assert.deepEqual(
      qualifyStrategy(strategyAggregate({ maxWorkerBatchMs: 51, maxMainThreadGapMs: 80 })),
      {
        qualified: false,
        reasons: ['worker batch exceeded 50ms', 'main-thread heartbeat gap exceeded 50ms'],
      },
    );
  });

  test('ranks qualified strategies lexicographically by measured priorities, not name', () => {
    const recommendation = recommendMaterialization([
      strategyAggregate({ strategy: 'full', maxMainThreadGapMs: 20 }),
      strategyAggregate({ strategy: 'hybrid', maxMainThreadGapMs: 9 }),
      strategyAggregate({ strategy: 'on-demand', maxMainThreadGapMs: 11 }),
    ]);
    assert.equal(recommendation.strategy, 'hybrid');
  });
});

describe('budget derivation', () => {
  test('rounds recorded p95 budgets to the next 10 milliseconds with 25% headroom', () => {
    assert.equal(deriveDurationBudget(81), 110);
  });

  test('uses the worst engine p95 and rounds storage to a full MiB', () => {
    const budgets = deriveBudgets([
      strategyAggregate({ browser: 'chromium', operationalReadyMs: { median: 40, p95: 40 } }),
      strategyAggregate({
        browser: 'firefox',
        operationalReadyMs: { median: 81, p95: 81 },
        storageBytes: { median: 1_100_000, p95: 1_100_000 },
      }),
    ]);
    assert.equal(budgets[0].operationalReadyMs, 110);
    assert.equal(budgets[0].storageBytes, 2 * 1024 * 1024);
  });

  test('does not publish a budget for a strategy rejected by any recorded engine', () => {
    const budgets = deriveBudgets([
      strategyAggregate({ browser: 'chromium', strategy: 'full' }),
      strategyAggregate({
        browser: 'firefox',
        strategy: 'full',
        failedRuns: 1,
        failureReasons: ['host-memory-ceiling (1/1 runs) — limit reached'],
      }),
    ]);

    assert.deepEqual(budgets, []);
  });
});

describe('decision report', () => {
  test('records the selected locator-first parameters instead of hybrid defaults', () => {
    const aggregate = strategyAggregate({ strategy: 'on-demand' });
    const report = renderDecisionReport({
      environment: {
        gitCommit: 'abc123',
        benchmarkSourceDirty: true,
        os: 'linux',
        arch: 'x64',
        node: 'v24',
        playwright: '1.63.0',
        seed: 'seed',
        samples: 3,
        cpu: 'cpu',
        logicalCores: 4,
        memoryBytes: 1,
        browserVersions: { chromium: '1' },
      },
      runs: [{ strategy: 'on-demand' }, { strategy: 'on-demand' }, { strategy: 'full' }],
      aggregates: [aggregate],
      recommendation: recommendMaterialization([aggregate]),
    });

    assert.match(report, /Git HEAD marker.*`abc123`/);
    assert.match(report, /tracked benchmark source changes: yes/);
    assert.match(report, /Selected-strategy samples: 2/);
    assert.match(report, /Non-selected candidate samples retained: 1/);
    assert.match(report, /locator-first/);
    assert.match(report, /32-record.*Chromium and Firefox/);
    assert.match(report, /4-record.*WebKit/);
    assert.doesNotMatch(report, /12-month hybrid operational window/);
    assert.doesNotMatch(report, /Recorded from commit/);
  });
});

describe('calibration CLI arguments', () => {
  test('forces the deterministic Chromium smoke matrix', () => {
    assert.deepEqual(parseArguments(['--mode=smoke', '--profile=enterprise', '--samples=9']), {
      mode: 'smoke',
      profiles: ['smoke'],
      samples: 1,
      browsers: ['chromium'],
    });
  });

  test('rejects unknown modes, profiles, browsers, and sample counts', () => {
    assert.throws(() => parseArguments(['--mode=quick']), /Unsupported mode: quick/);
    assert.throws(
      () => parseArguments(['--mode=record', '--profile=tiny']),
      /Unsupported profile: tiny/,
    );
    assert.throws(
      () => parseArguments(['--mode=record', '--browser=edge']),
      /Unsupported browser: edge/,
    );
    assert.throws(() => parseArguments(['--mode=record', '--samples=0']), /positive safe integer/);
  });

  test('parses Linux available and swap memory for the resource guard', () => {
    assert.deepEqual(parseMemoryInfo('MemAvailable:    5242880 kB\nSwapFree:         65536 kB\n'), {
      availableMemoryBytes: 5_368_709_120,
      swapFreeBytes: 67_108_864,
    });
  });

  test('keeps an 8 GiB floor for materializers and a 4 GiB floor for locator-first reads', () => {
    assert.equal(memoryFloorForStrategy('full'), 8 * 1024 ** 3);
    assert.equal(memoryFloorForStrategy('partitioned'), 8 * 1024 ** 3);
    assert.equal(memoryFloorForStrategy('hybrid'), 8 * 1024 ** 3);
    assert.equal(memoryFloorForStrategy('on-demand'), 4 * 1024 ** 3);
  });

  test('classifies quota exhaustion but leaves unrelated browser errors terminal', () => {
    const quota = new Error('AbortError: QuotaExceededError');
    quota.name = 'AbortError';
    assert.deepEqual(classifyResourceFailure(quota), {
      kind: 'indexeddb-quota-exceeded',
      message: 'AbortError: QuotaExceededError',
    });
    assert.equal(classifyResourceFailure(new TypeError('page crashed')), null);
  });

  test('classifies the laboratory deadline without swallowing unrelated timeouts', () => {
    assert.deepEqual(
      classifyResourceFailure(
        new Error('page.evaluate: Calibration canonical-firefox-partitioned-1 timed out'),
      ),
      {
        kind: 'calibration-timeout',
        message: 'page.evaluate: Calibration canonical-firefox-partitioned-1 timed out',
      },
    );
    assert.equal(classifyResourceFailure(new Error('navigation timed out')), null);
  });

  test('verifies only requested-profile strategies that have recorded budgets', () => {
    const budgets = [
      { profile: 'canonical', strategy: 'on-demand' },
      { profile: 'canonical', strategy: 'on-demand' },
      { profile: 'enterprise', strategy: 'on-demand' },
      { profile: 'enterprise', strategy: 'hybrid' },
    ];
    const applicable = selectApplicableBudgets(budgets, ['canonical']);

    assert.deepEqual(applicable, budgets.slice(0, 2));
    assert.deepEqual(strategiesForBudgets(applicable), ['on-demand']);
  });
});
