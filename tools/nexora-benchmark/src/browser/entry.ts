import type { CalibrationRun } from '../contracts';
import {
  createRunState,
  reduceWorkerEvent,
  type CalibrationStartRequest,
  type CalibrationWorkerEvent,
  type CalibrationWorkerRequest,
  validateCalibrationRequest,
} from './protocol';

declare global {
  interface Window {
    runNexoraCalibration(request: CalibrationStartRequest): Promise<CalibrationRun>;
    nexoraCalibrationReady: Promise<void>;
  }
}

function failureFromEvent(event: Extract<CalibrationWorkerEvent, { type: 'failure' }>): Error {
  const error = new Error(event.error.message);
  error.name = event.error.name;
  if (event.error.stack) error.stack = event.error.stack;
  return error;
}

async function runNexoraCalibration(request: CalibrationStartRequest): Promise<CalibrationRun> {
  const validated = validateCalibrationRequest(request);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  let state = createRunState(validated.runId);
  let lastHeartbeat = performance.now();
  let maxMainThreadGapMs = 0;
  const heartbeatMs = 10;
  const heartbeat = window.setInterval(() => {
    const current = performance.now();
    maxMainThreadGapMs = Math.max(maxMainThreadGapMs, current - lastHeartbeat - heartbeatMs);
    lastHeartbeat = current;
  }, heartbeatMs);

  return new Promise<CalibrationRun>((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      window.clearInterval(heartbeat);
      worker.terminate();
      callback();
    };
    const timeout = window.setTimeout(() => {
      const cancellation: CalibrationWorkerRequest = { type: 'cancel', runId: validated.runId };
      worker.postMessage(cancellation);
      finish(() => reject(new Error(`Calibration ${validated.runId} timed out`)));
    }, validated.timeoutMs);

    worker.onerror = (event) => {
      finish(() =>
        reject(new Error(event.message || `Calibration ${validated.runId} worker failed`)),
      );
    };
    worker.onmessage = (message: MessageEvent<CalibrationWorkerEvent>) => {
      try {
        const event = message.data;
        state = reduceWorkerEvent(state, event);
        switch (event.type) {
          case 'complete': {
            const run = event.run;
            finish(() =>
              resolve({
                ...run,
                metrics: { ...run.metrics, maxMainThreadGapMs },
              }),
            );
            break;
          }
          case 'failure':
            finish(() => reject(failureFromEvent(event)));
            break;
          case 'cancelled':
            finish(() => reject(new Error(`Calibration ${validated.runId} was cancelled`)));
            break;
        }
      } catch (error) {
        finish(() => reject(error instanceof Error ? error : new Error(String(error))));
      }
    };

    worker.postMessage(validated satisfies CalibrationWorkerRequest);
  });
}

window.runNexoraCalibration = runNexoraCalibration;
window.nexoraCalibrationReady = Promise.resolve();
