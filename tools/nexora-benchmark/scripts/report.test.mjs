import assert from 'node:assert/strict';

import { describe, test } from 'vitest';

import { parseArguments } from './calibrate.mjs';
import {
  aggregateRuns,
  deriveBudgets,
  deriveDurationBudget,
  median,
  nearestRankP95,
  qualifyStrategy,
  recommendMaterialization,
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
});
