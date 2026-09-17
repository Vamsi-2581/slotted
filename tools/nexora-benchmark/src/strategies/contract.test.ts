import 'fake-indexeddb/auto';

import { afterEach, describe, expect, it } from 'vitest';

import type { ReadinessState, StrategyName } from '../contracts';
import { SCALE_PROFILES } from '../profiles';
import { createStrategy, type StrategyObserver, type StrategySession } from '../query-contract';
import { DatabaseStrategySession, databaseExists } from './database';

let sequence = 0;
const sessions: StrategySession[] = [];
const STRATEGY_CONTRACT_TIMEOUT_MS = 30_000;
const STRATEGY_COMPLETION_TIMEOUT_MS = 25_000;

interface Prepared {
  readonly databaseName: string;
  readonly session: StrategySession;
  readonly states: ReadinessState[];
  readonly batchSizes: number[];
}

async function prepareSmoke(
  name: StrategyName,
  options: {
    readonly pauseAfterOperational?: boolean;
    readonly virtualBatchSize?: number;
  } = {},
): Promise<Prepared> {
  const databaseName = `nexora-contract-${name}-${sequence++}`;
  const states: ReadinessState[] = [];
  const batchSizes: number[] = [];
  const observer: StrategyObserver = {
    onBatch(sample) {
      batchSizes.push(sample.records);
    },
    onReadiness(snapshot) {
      states.push(snapshot.state);
    },
  };
  const session = await createStrategy(name, {
    databaseName,
    batchSize: 37,
    ...(options.virtualBatchSize === undefined
      ? {}
      : { virtualBatchSize: options.virtualBatchSize }),
    pauseAfterOperational: options.pauseAfterOperational ?? false,
  }).prepare(SCALE_PROFILES.smoke, observer);
  sessions.push(session);
  return { databaseName, session, states, batchSizes };
}

async function waitForComplete(session: StrategySession): Promise<void> {
  const deadline = Date.now() + STRATEGY_COMPLETION_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const readiness = await session.readiness();
    if (readiness.state === 'complete') return;
    if (readiness.state === 'failed') throw new Error('Strategy entered failed readiness');
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Strategy did not reach complete readiness');
}

let expectedDigest: Promise<string> | undefined;
function referenceDigest(): Promise<string> {
  expectedDigest ??= (async () => {
    const { session } = await prepareSmoke('full');
    await waitForComplete(session);
    return session.correctnessDigest();
  })();
  return expectedDigest;
}

afterEach(async () => {
  await Promise.all(sessions.splice(0).map((session) => session.dispose()));
});

describe.each(['full', 'partitioned', 'on-demand', 'hybrid'] as const)('%s strategy', (name) => {
  it(
    'exposes no fabricated totals at operational readiness',
    { timeout: STRATEGY_CONTRACT_TIMEOUT_MS },
    async () => {
      const { session } = await prepareSmoke(name);
      const page = await session.runProbe('orders-page');

      expect(page.visibleRecords).toHaveLength(50);
      expect(page.total).toBe(SCALE_PROFILES.smoke.counts.salesOrders);
      expect(page.completeness).toBe('complete');
      if (name === 'on-demand') {
        expect((await session.readiness()).committedCounts.salesOrders).toBe(0);
      }
    },
  );

  it(
    'converges on the completed full-strategy digest',
    { timeout: STRATEGY_CONTRACT_TIMEOUT_MS },
    async () => {
      const { session } = await prepareSmoke(name);
      await waitForComplete(session);

      expect(await session.correctnessDigest()).toBe(await referenceDigest());
    },
  );
});

describe('shared strategy lifecycle', () => {
  it('keeps on-demand locator-first and instruments bounded virtual generation', async () => {
    const { session, batchSizes } = await prepareSmoke('on-demand', { virtualBatchSize: 2 });
    const readiness = await session.readiness();

    expect(Object.values(readiness.committedCounts)).toEqual(
      Array(Object.keys(readiness.committedCounts).length).fill(0),
    );
    expect(batchSizes).toEqual([]);
    const locatorBytes = await session.storageEstimate();
    expect(locatorBytes).toBeGreaterThan(0);
    expect(locatorBytes).toBeLessThan(10_000);

    await session.runProbe('orders-page');

    expect(batchSizes.length).toBeGreaterThan(0);
    expect(Math.max(...batchSizes)).toBeLessThanOrEqual(2);
    expect(batchSizes.reduce((total, size) => total + size, 0)).toBeLessThan(200);
    expect(await session.storageEstimate()).toBeGreaterThan(locatorBytes);
  });

  it('propagates the original background failure through readiness', async () => {
    const observer: StrategyObserver = { onBatch() {}, onReadiness() {} };
    class FailingSession extends DatabaseStrategySession {
      fail(): void {
        this.startBackground(async () => {
          throw new Error('partition write failed');
        });
      }
    }
    const session = new FailingSession(
      'partitioned',
      SCALE_PROFILES.smoke,
      observer,
      `nexora-contract-failure-${sequence++}`,
      37,
    );
    await session.open();
    session.fail();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    await expect(session.readiness()).rejects.toThrow('partition write failed');
    await session.dispose();
  });

  it(
    'publishes monotonic readiness and bounded writes',
    { timeout: STRATEGY_CONTRACT_TIMEOUT_MS },
    async () => {
      const { session, states, batchSizes } = await prepareSmoke('partitioned');
      await waitForComplete(session);

      const rank: Record<ReadinessState, number> = {
        empty: 0,
        operational: 1,
        complete: 2,
        failed: 3,
      };
      expect(states).toContain('operational');
      expect(states.at(-1)).toBe('complete');
      expect(
        states.every((state, index) => index === 0 || rank[state] >= rank[states[index - 1]!]),
      ).toBe(true);
      expect(Math.max(...batchSizes)).toBeLessThanOrEqual(37);
    },
  );

  it('uses stable pagination tie-breakers and resolves a deep historical ID', async () => {
    const { session } = await prepareSmoke('hybrid');
    const firstPage = await session.runProbe('orders-page');
    const secondPage = await session.runProbe('orders-page');
    const historical = await session.runProbe('historical-point-lookup');

    expect(secondPage).toEqual(firstPage);
    expect(new Set(firstPage.visibleRecords).size).toBe(50);
    expect(historical.completeness).toBe('complete');
    expect(historical.visibleRecords).toHaveLength(1);
  });

  it('reports not-ready instead of inventing an uncommitted historical result', async () => {
    const { session } = await prepareSmoke('partitioned', { pauseAfterOperational: true });

    expect(await session.runProbe('historical-point-lookup')).toMatchObject({
      visibleRecords: [],
      total: 0,
      completeness: 'not-ready',
    });
  });

  it('deletes its isolated database on dispose', async () => {
    const prepared = await prepareSmoke('full');
    expect(await databaseExists(prepared.databaseName)).toBe(true);

    await prepared.session.dispose();
    sessions.splice(sessions.indexOf(prepared.session), 1);

    expect(await databaseExists(prepared.databaseName)).toBe(false);
  });
});
