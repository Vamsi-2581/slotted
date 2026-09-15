export type ProfileId = 'smoke' | 'canonical' | 'enterprise';

export type StrategyName = 'full' | 'partitioned' | 'on-demand' | 'hybrid';

export type ReadinessState = 'empty' | 'operational' | 'complete' | 'failed';

export type ProbeName =
  | 'orders-page'
  | 'customer-360'
  | 'inventory-ledger'
  | 'finance-summary'
  | 'historical-point-lookup';

export interface ScaleCounts {
  readonly customers: number;
  readonly contacts: number;
  readonly suppliers: number;
  readonly skus: number;
  readonly salesOrders: number;
  readonly salesOrderLines: number;
  readonly stockMovements: number;
  readonly purchaseOrders: number;
  readonly invoices: number;
  readonly payments: number;
  readonly supportTickets: number;
}

export interface ScaleProfile {
  readonly id: ProfileId;
  readonly seed: string;
  readonly demoTime: string;
  readonly counts: ScaleCounts;
}

export interface ProbeResult {
  readonly probe: ProbeName;
  readonly visibleRecords: readonly string[];
  readonly total: number;
  readonly completeness: 'complete' | 'not-ready';
  readonly digest: string;
}

export interface ReadinessTransition {
  readonly state: ReadinessState;
  readonly atMs: number;
}

export interface ProbeMetric {
  readonly probe: ProbeName;
  readonly durationMs: number;
  readonly result: ProbeResult;
}

export interface StrategyMetrics {
  readonly operationalReadyMs: number;
  readonly completeReadyMs: number;
  readonly maxWorkerBatchMs: number;
  readonly maxMainThreadGapMs: number;
  readonly storageBytes: number;
  readonly probes: readonly ProbeMetric[];
}

export interface CalibrationRun {
  readonly scenario: 'nexora-materialization-calibration-v1';
  readonly runId: string;
  readonly profile: ProfileId;
  readonly strategy: StrategyName;
  readonly browser: string;
  readonly sample: number;
  readonly digest: string;
  readonly readiness: readonly ReadinessTransition[];
  readonly metrics: StrategyMetrics;
}

export interface CalibrationBudget {
  readonly profile: ProfileId;
  readonly strategy: StrategyName;
  readonly operationalReadyMs: number;
  readonly completeReadyMs: number;
  readonly maxWorkerBatchMs: number;
  readonly maxMainThreadGapMs: number;
  readonly storageBytes: number;
  readonly probeP95Ms: Readonly<Record<ProbeName, number>>;
}
