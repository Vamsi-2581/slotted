/// <reference lib="webworker" />

import type { CalibrationRun, ProbeName, ReadinessTransition } from '../contracts';
import { SCALE_PROFILES } from '../profiles';
import { createStrategy, type StrategySession } from '../query-contract';
import {
  type CalibrationStartRequest,
  type CalibrationWorkerEvent,
  type CalibrationWorkerRequest,
  serializeFailure,
  validateCalibrationRequest,
} from './protocol';

const PROBES: readonly ProbeName[] = [
  'orders-page',
  'customer-360',
  'inventory-ledger',
  'finance-summary',
  'historical-point-lookup',
];
const WORKER_BATCH_SIZE = 32;
function virtualBatchSize(browser: string): number {
  return browser === 'webkit' ? 4 : 32;
}

interface ActiveRun {
  readonly runId: string;
  session: StrategySession | undefined;
  cancelled: boolean;
}

let active: ActiveRun | undefined;

function emit(event: CalibrationWorkerEvent): void {
  self.postMessage(event);
}

function elapsed(started: number): number {
  return performance.now() - started;
}

function recordCount(request: CalibrationStartRequest): number {
  return Object.values(SCALE_PROFILES[request.profile].counts).reduce(
    (total, count) => total + count,
    0,
  );
}

async function waitForComplete(
  request: CalibrationStartRequest,
  run: ActiveRun,
  started: number,
): Promise<void> {
  for (;;) {
    if (run.cancelled) throw new Error(`Calibration ${request.runId} was cancelled`);
    if (elapsed(started) > request.timeoutMs) {
      throw new Error(`Calibration ${request.runId} exceeded ${request.timeoutMs}ms`);
    }
    const readiness = await run.session!.readiness();
    if (readiness.state === 'complete') return;
    if (readiness.state === 'failed') throw new Error('Materialization strategy failed');
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }
}

async function execute(request: CalibrationStartRequest, run: ActiveRun): Promise<void> {
  const profile = SCALE_PROFILES[request.profile];
  const started = performance.now();
  const totalRecords = recordCount(request);
  const readiness: ReadinessTransition[] = [];
  let processedRecords = 0;
  let maxWorkerBatchMs = 0;
  let nextProgress = Math.max(1, Math.ceil(totalRecords / 100));
  let materializationActive = true;

  const strategy = createStrategy(request.strategy, {
    databaseName: `nexora-${request.runId}`,
    batchSize: WORKER_BATCH_SIZE,
    virtualBatchSize: virtualBatchSize(request.browser),
  });
  run.session = await strategy.prepare(profile, {
    onBatch(sample) {
      if (sample.durationMs > maxWorkerBatchMs) {
        maxWorkerBatchMs = sample.durationMs;
        emit({ type: 'batch', runId: request.runId, ...sample });
      }
      if (!materializationActive) return;
      processedRecords = Math.min(totalRecords, processedRecords + sample.records);
      if (processedRecords >= nextProgress) {
        emit({
          type: 'progress',
          runId: request.runId,
          phase: 'materialization',
          completed: processedRecords,
          total: totalRecords,
        });
        nextProgress = processedRecords + Math.max(1, Math.ceil(totalRecords / 100));
      }
    },
    onReadiness(snapshot) {
      const transition = { state: snapshot.state, atMs: elapsed(started) };
      readiness.push(transition);
      emit({
        type: 'readiness',
        runId: request.runId,
        elapsedMs: transition.atMs,
        snapshot,
      });
    },
  });
  await waitForComplete(request, run, started);
  materializationActive = false;
  emit({
    type: 'progress',
    runId: request.runId,
    phase: 'materialization',
    completed: totalRecords,
    total: totalRecords,
  });

  const probes = [];
  for (const [index, probe] of PROBES.entries()) {
    if (run.cancelled) throw new Error(`Calibration ${request.runId} was cancelled`);
    const probeStarted = performance.now();
    const result = await run.session.runProbe(probe);
    if (result.completeness !== 'complete') {
      throw new Error(`${probe} remained ${result.completeness} after complete readiness`);
    }
    const metric = { probe, durationMs: performance.now() - probeStarted, result };
    probes.push(metric);
    emit({ type: 'probe', runId: request.runId, metric });
    emit({
      type: 'progress',
      runId: request.runId,
      phase: 'probe',
      completed: index + 1,
      total: PROBES.length,
    });
  }

  const storageBytes = await run.session.storageEstimate();
  const digest = await run.session.correctnessDigest();
  emit({ type: 'storage', runId: request.runId, bytes: storageBytes });
  emit({ type: 'digest', runId: request.runId, digest });

  const operationalReadyMs = readiness.find((item) => item.state === 'operational')?.atMs;
  const completeReadyMs = readiness.find((item) => item.state === 'complete')?.atMs;
  if (operationalReadyMs === undefined || completeReadyMs === undefined) {
    throw new Error('Strategy completed without operational and complete readiness transitions');
  }

  const result: CalibrationRun = {
    scenario: request.scenario,
    runId: request.runId,
    profile: request.profile,
    strategy: request.strategy,
    browser: request.browser,
    sample: request.sample,
    digest,
    readiness,
    metrics: {
      operationalReadyMs,
      completeReadyMs,
      maxWorkerBatchMs,
      maxMainThreadGapMs: 0,
      storageBytes,
      probes,
    },
  };

  await run.session.dispose();
  run.session = undefined;
  emit({ type: 'complete', runId: request.runId, run: result });
}

self.onmessage = (message: MessageEvent<CalibrationWorkerRequest>) => {
  const request = message.data;
  if (request.type === 'cancel') {
    if (active?.runId !== request.runId || active.cancelled) return;
    active.cancelled = true;
    const disposal = active.session ? active.session.dispose() : Promise.resolve();
    void disposal.finally(() => {
      emit({ type: 'cancelled', runId: request.runId });
    });
    return;
  }

  let validated: CalibrationStartRequest;
  try {
    validated = validateCalibrationRequest(request);
    if (active) throw new Error(`Worker is already running ${active.runId}`);
  } catch (error) {
    emit({
      type: 'failure',
      runId: request.runId,
      error: serializeFailure(error),
    });
    return;
  }

  const run: ActiveRun = { runId: validated.runId, session: undefined, cancelled: false };
  active = run;
  void execute(validated, run)
    .catch(async (error: unknown) => {
      await run.session?.dispose();
      if (!run.cancelled) {
        emit({ type: 'failure', runId: validated.runId, error: serializeFailure(error) });
      }
    })
    .finally(() => {
      if (active === run) active = undefined;
    });
};
