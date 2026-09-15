import { describe, expect, it } from 'vitest';

import type { CalibrationWorkerRequest } from './protocol';
import {
  createRunState,
  reduceWorkerEvent,
  serializeFailure,
  validateCalibrationRequest,
} from './protocol';

const validRequest: CalibrationWorkerRequest = {
  type: 'start',
  scenario: 'nexora-materialization-calibration-v1',
  runId: 'run-17',
  profile: 'smoke',
  strategy: 'partitioned',
  browser: 'chromium',
  sample: 1,
  timeoutMs: 30_000,
};

describe('calibration browser protocol', () => {
  it('rejects events belonging to another run', () => {
    const state = createRunState('run-17');
    expect(() =>
      reduceWorkerEvent(state, {
        type: 'readiness',
        runId: 'run-18',
        elapsedMs: 10,
        snapshot: {
          state: 'operational',
          committedCounts: {
            customers: 0,
            contacts: 0,
            suppliers: 0,
            skus: 0,
            salesOrders: 0,
            salesOrderLines: 0,
            stockMovements: 0,
            purchaseOrders: 0,
            invoices: 0,
            payments: 0,
            supportTickets: 0,
          },
          committedPartitions: 0,
          pendingPartitions: 1,
        },
      }),
    ).toThrow('Worker event run-18 does not belong to run-17');
  });

  it('validates the named scenario and all bounded request fields', () => {
    expect(validateCalibrationRequest(validRequest)).toEqual(validRequest);
    expect(() =>
      validateCalibrationRequest({
        ...validRequest,
        scenario: 'other-scenario' as typeof validRequest.scenario,
      }),
    ).toThrow('Unsupported calibration scenario: other-scenario');
    expect(() => validateCalibrationRequest({ ...validRequest, timeoutMs: 0 })).toThrow(
      'timeoutMs must be a positive safe integer',
    );
    expect(() => validateCalibrationRequest({ ...validRequest, sample: -1 })).toThrow(
      'sample must be a positive safe integer',
    );
  });

  it('rejects progress regression', () => {
    const started = reduceWorkerEvent(createRunState('run-17'), {
      type: 'progress',
      runId: 'run-17',
      phase: 'materialization',
      completed: 3,
      total: 10,
    });

    expect(() =>
      reduceWorkerEvent(started, {
        type: 'progress',
        runId: 'run-17',
        phase: 'materialization',
        completed: 2,
        total: 10,
      }),
    ).toThrow('Worker progress regressed from 3/10 to 2/10');
  });

  it('retains only the maximum batch duration instead of growing main-thread history', () => {
    const slower = reduceWorkerEvent(createRunState('run-17'), {
      type: 'batch',
      runId: 'run-17',
      records: 512,
      durationMs: 12,
    });
    const faster = reduceWorkerEvent(slower, {
      type: 'batch',
      runId: 'run-17',
      records: 512,
      durationMs: 4,
    });

    expect(faster.maxWorkerBatchMs).toBe(12);
  });

  it('makes cancellation terminal for the correlated run', () => {
    const cancelled = reduceWorkerEvent(createRunState('run-17'), {
      type: 'cancelled',
      runId: 'run-17',
    });
    expect(cancelled.status).toBe('cancelled');
    expect(() =>
      reduceWorkerEvent(cancelled, {
        type: 'progress',
        runId: 'run-17',
        phase: 'probe',
        completed: 1,
        total: 5,
      }),
    ).toThrow('Run run-17 is already terminal');
  });

  it('serializes failures without losing their type and message', () => {
    expect(serializeFailure(new TypeError('broken calibration'))).toEqual({
      name: 'TypeError',
      message: 'broken calibration',
      stack: expect.stringContaining('TypeError: broken calibration'),
    });
    expect(serializeFailure('worker stopped')).toEqual({
      name: 'Error',
      message: 'worker stopped',
    });
  });
});
