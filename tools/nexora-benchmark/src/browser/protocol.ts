import type {
  CalibrationRun,
  ProbeMetric,
  ProfileId,
  ReadinessTransition,
  StrategyName,
} from '../contracts';
import type { ReadinessSnapshot } from '../query-contract';

export const CALIBRATION_SCENARIO = 'nexora-materialization-calibration-v1' as const;

export interface CalibrationStartRequest {
  readonly type: 'start';
  readonly scenario: typeof CALIBRATION_SCENARIO;
  readonly runId: string;
  readonly profile: ProfileId;
  readonly strategy: StrategyName;
  readonly browser: string;
  readonly sample: number;
  readonly timeoutMs: number;
}

export interface CalibrationCancelRequest {
  readonly type: 'cancel';
  readonly runId: string;
}

export type CalibrationWorkerRequest = CalibrationStartRequest | CalibrationCancelRequest;

export interface SerializedFailure {
  readonly name: string;
  readonly message: string;
  readonly stack?: string;
}

export type CalibrationWorkerEvent =
  | {
      readonly type: 'progress';
      readonly runId: string;
      readonly phase: 'materialization' | 'probe';
      readonly completed: number;
      readonly total: number;
    }
  | {
      readonly type: 'readiness';
      readonly runId: string;
      readonly elapsedMs: number;
      readonly snapshot: ReadinessSnapshot;
    }
  | {
      readonly type: 'batch';
      readonly runId: string;
      readonly records: number;
      readonly durationMs: number;
    }
  | { readonly type: 'probe'; readonly runId: string; readonly metric: ProbeMetric }
  | { readonly type: 'storage'; readonly runId: string; readonly bytes: number }
  | { readonly type: 'digest'; readonly runId: string; readonly digest: string }
  | { readonly type: 'complete'; readonly runId: string; readonly run: CalibrationRun }
  | { readonly type: 'cancelled'; readonly runId: string }
  | { readonly type: 'failure'; readonly runId: string; readonly error: SerializedFailure };

export interface CalibrationRunState {
  readonly runId: string;
  readonly status: 'running' | 'complete' | 'cancelled' | 'failed';
  readonly progress?: {
    readonly phase: 'materialization' | 'probe';
    readonly completed: number;
    readonly total: number;
  };
  readonly readiness: readonly ReadinessTransition[];
  readonly batchDurations: readonly number[];
  readonly probes: readonly ProbeMetric[];
  readonly storageBytes?: number;
  readonly digest?: string;
  readonly run?: CalibrationRun;
  readonly failure?: SerializedFailure;
}

const PROFILE_IDS = new Set<ProfileId>(['smoke', 'canonical', 'enterprise']);
const STRATEGIES = new Set<StrategyName>(['full', 'partitioned', 'on-demand', 'hybrid']);

export function validateCalibrationRequest(
  request: CalibrationWorkerRequest,
): CalibrationStartRequest {
  if (request.type !== 'start') throw new TypeError('Expected a calibration start request');
  if (request.scenario !== CALIBRATION_SCENARIO) {
    throw new RangeError(`Unsupported calibration scenario: ${String(request.scenario)}`);
  }
  if (request.runId.trim().length === 0) throw new RangeError('runId cannot be empty');
  if (!PROFILE_IDS.has(request.profile)) {
    throw new RangeError(`Unsupported calibration profile: ${String(request.profile)}`);
  }
  if (!STRATEGIES.has(request.strategy)) {
    throw new RangeError(`Unsupported materialization strategy: ${String(request.strategy)}`);
  }
  if (request.browser.trim().length === 0) throw new RangeError('browser cannot be empty');
  if (!Number.isSafeInteger(request.sample) || request.sample <= 0) {
    throw new RangeError('sample must be a positive safe integer');
  }
  if (!Number.isSafeInteger(request.timeoutMs) || request.timeoutMs <= 0) {
    throw new RangeError('timeoutMs must be a positive safe integer');
  }
  return request;
}

export function serializeFailure(error: unknown): SerializedFailure {
  if (error instanceof Error) {
    return error.stack
      ? { name: error.name, message: error.message, stack: error.stack }
      : { name: error.name, message: error.message };
  }
  return { name: 'Error', message: String(error) };
}

export function createRunState(runId: string): CalibrationRunState {
  if (runId.trim().length === 0) throw new RangeError('runId cannot be empty');
  return {
    runId,
    status: 'running',
    readiness: [],
    batchDurations: [],
    probes: [],
  };
}

export function reduceWorkerEvent(
  state: CalibrationRunState,
  event: CalibrationWorkerEvent,
): CalibrationRunState {
  if (event.runId !== state.runId) {
    throw new Error(`Worker event ${event.runId} does not belong to ${state.runId}`);
  }
  if (state.status !== 'running') throw new Error(`Run ${state.runId} is already terminal`);

  switch (event.type) {
    case 'progress': {
      if (
        !Number.isSafeInteger(event.completed) ||
        !Number.isSafeInteger(event.total) ||
        event.completed < 0 ||
        event.total <= 0 ||
        event.completed > event.total
      ) {
        throw new RangeError(`Invalid worker progress ${event.completed}/${event.total}`);
      }
      if (
        state.progress?.phase === event.phase &&
        (event.completed < state.progress.completed || event.total !== state.progress.total)
      ) {
        throw new Error(
          `Worker progress regressed from ${state.progress.completed}/${state.progress.total} to ${event.completed}/${event.total}`,
        );
      }
      return {
        ...state,
        progress: {
          phase: event.phase,
          completed: event.completed,
          total: event.total,
        },
      };
    }
    case 'readiness': {
      const previous = state.readiness.at(-1);
      const rank = { empty: 0, operational: 1, complete: 2, failed: 3 } as const;
      if (previous && rank[event.snapshot.state] < rank[previous.state]) {
        throw new Error(
          `Worker readiness regressed from ${previous.state} to ${event.snapshot.state}`,
        );
      }
      return {
        ...state,
        readiness: [...state.readiness, { state: event.snapshot.state, atMs: event.elapsedMs }],
      };
    }
    case 'batch':
      return { ...state, batchDurations: [...state.batchDurations, event.durationMs] };
    case 'probe':
      return { ...state, probes: [...state.probes, event.metric] };
    case 'storage':
      return { ...state, storageBytes: event.bytes };
    case 'digest':
      return { ...state, digest: event.digest };
    case 'complete':
      return { ...state, status: 'complete', run: event.run };
    case 'cancelled':
      return { ...state, status: 'cancelled' };
    case 'failure':
      return { ...state, status: 'failed', failure: event.error };
  }
}
