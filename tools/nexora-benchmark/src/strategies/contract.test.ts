import 'fake-indexeddb/auto';

import { afterEach, describe, expect, it } from 'vitest';

import type { ReadinessState, StrategyName } from '../contracts';
import { SCALE_PROFILES } from '../profiles';
import { createStrategy, type StrategyObserver, type StrategySession } from '../query-contract';
import { databaseExists } from './database';

let sequence = 0;
const sessions: StrategySession[] = [];

interface Prepared {
  readonly databaseName: string;
  readonly session: StrategySession;
  readonly states: ReadinessState[];
  readonly batchSizes: number[];
}

async function prepareSmoke(
  name: StrategyName,
  options: { readonly pauseAfterOperational?: boolean } = {},
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
    pauseAfterOperational: options.pauseAfterOperational ?? false,
  }).prepare(SCALE_PROFILES.smoke, observer);
  sessions.push(session);
  return { databaseName, session, states, batchSizes };
}

async function waitForComplete(session: StrategySession): Promise<void> {
  for (let attempt = 0; attempt < 2_000; attempt += 1) {
    const readiness = await session.readiness();
    if (readiness.state === 'complete') return;
    if (readiness.state === 'failed') throw new Error('Strategy entered failed readiness');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
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
  it('exposes no fabricated totals at operational readiness', async () => {
    const { session } = await prepareSmoke(name);
    const page = await session.runProbe('orders-page');

    expect(page.visibleRecords).toHaveLength(50);
    expect(page.total).toBe(SCALE_PROFILES.smoke.counts.salesOrders);
    expect(page.completeness).toBe('complete');
    if (name === 'on-demand') {
      expect((await session.readiness()).committedCounts.salesOrders).toBe(0);
    }
  });

  it('converges on the completed full-strategy digest', async () => {
    const { session } = await prepareSmoke(name);
    await waitForComplete(session);

    expect(await session.correctnessDigest()).toBe(await referenceDigest());
  });
});

describe('shared strategy lifecycle', () => {
  it('publishes monotonic readiness and bounded writes', async () => {
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
  });

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
