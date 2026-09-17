import type {
  ProbeName,
  ProbeResult,
  ReadinessState,
  ScaleCounts,
  ScaleProfile,
  StrategyName,
} from './contracts';
import { createFullStrategy } from './strategies/full';
import { createHybridStrategy } from './strategies/hybrid';
import { createOnDemandStrategy } from './strategies/on-demand';
import { createPartitionedStrategy } from './strategies/partitioned';

export interface ReadinessSnapshot {
  readonly state: ReadinessState;
  readonly committedCounts: Readonly<ScaleCounts>;
  readonly committedPartitions: number;
  readonly pendingPartitions: number;
}

export interface StrategyObserver {
  onBatch(sample: { readonly records: number; readonly durationMs: number }): void;
  onReadiness(snapshot: ReadinessSnapshot): void;
}

export interface StrategySession {
  readiness(): Promise<ReadinessSnapshot>;
  runProbe(name: ProbeName): Promise<ProbeResult>;
  correctnessDigest(): Promise<string>;
  storageEstimate(): Promise<number>;
  dispose(): Promise<void>;
}

export interface MaterializationStrategy {
  readonly name: StrategyName;
  prepare(profile: ScaleProfile, observer: StrategyObserver): Promise<StrategySession>;
}

export interface StrategyOptions {
  readonly databaseName: string;
  readonly batchSize?: number;
  readonly virtualBatchSize?: number;
  readonly pauseAfterOperational?: boolean;
}

export function createStrategy(
  name: StrategyName,
  options: StrategyOptions,
): MaterializationStrategy {
  switch (name) {
    case 'full':
      return createFullStrategy(options);
    case 'partitioned':
      return createPartitionedStrategy(options);
    case 'on-demand':
      return createOnDemandStrategy(options);
    case 'hybrid':
      return createHybridStrategy(options);
  }
}
