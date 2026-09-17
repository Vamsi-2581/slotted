import type { ProbeName, ProbeResult, ScaleProfile } from '../contracts';
import { generateCalibrationBatches, GENERATION_ORDER } from '../generate';
import type { CalibrationRecord, RecordBatch } from '../records';
import type { MaterializationStrategy, StrategyObserver, StrategyOptions } from '../query-contract';
import { DatabaseStrategySession, executeStoredProbe, executeVirtualProbe } from './database';

const RECENT_WINDOW_MS = 365 * 86_400_000;

function isOperationalRecord(record: CalibrationRecord, cutoff: number): boolean {
  if (
    record.table === 'customers' ||
    record.table === 'contacts' ||
    record.table === 'suppliers' ||
    record.table === 'skus'
  ) {
    return true;
  }
  if (Date.parse(record.createdAt) >= cutoff) return true;
  switch (record.table) {
    case 'salesOrders':
      return (
        record.status === 'draft' || record.status === 'confirmed' || record.status === 'picking'
      );
    case 'purchaseOrders':
      return (
        record.status === 'draft' ||
        record.status === 'issued' ||
        record.status === 'partially-received'
      );
    case 'invoices':
      return record.status === 'open' || record.status === 'overdue';
    case 'supportTickets':
      return record.status === 'open' || record.status === 'waiting-customer';
    default:
      return false;
  }
}

class HybridSession extends DatabaseStrategySession {
  private readonly virtualCache = new Map<ProbeName, ProbeResult>();

  async initialize(): Promise<void> {
    await this.open();
    const cutoff = Date.parse(this.profile.demoTime) - RECENT_WINDOW_MS;
    for (const batch of generateCalibrationBatches(this.profile, this.batchSize)) {
      const operational = batch.records.filter((record) => isOperationalRecord(record, cutoff));
      if (operational.length > 0) {
        await this.writeBatch({ ...batch, records: operational });
      }
      if (
        batch.table === 'customers' ||
        batch.table === 'contacts' ||
        batch.table === 'suppliers' ||
        batch.table === 'skus'
      ) {
        if (this.committedCounts[batch.table] === this.profile.counts[batch.table]) {
          this.markTableComplete(batch.table);
        }
      }
    }
    this.setReadiness('operational');
    this.setPendingPartitions(1);
    this.startBackground(async () => {
      for (const batch of generateCalibrationBatches(this.profile, this.batchSize)) {
        if (this.disposed) return;
        const historical = batch.records.filter((record) => !isOperationalRecord(record, cutoff));
        if (historical.length > 0) {
          await this.writeBatch({ ...batch, records: historical } satisfies RecordBatch);
        }
      }
      for (const table of GENERATION_ORDER) this.markTableComplete(table);
      this.setPendingPartitions(0);
      this.setReadiness('complete');
    });
  }

  override async runProbe(name: ProbeName): Promise<ProbeResult> {
    if (this.requiredTablesReady(name)) {
      return executeStoredProbe(this.database, this.profile, name);
    }
    const cached = this.virtualCache.get(name);
    if (cached) return cached;
    const result = await executeVirtualProbe(this.profile, name);
    this.virtualCache.set(name, result);
    return result;
  }
}

export function createHybridStrategy(options: StrategyOptions): MaterializationStrategy {
  return {
    name: 'hybrid',
    async prepare(profile: ScaleProfile, observer: StrategyObserver) {
      const session = new HybridSession(
        'hybrid',
        profile,
        observer,
        options.databaseName,
        options.batchSize ?? 512,
      );
      await session.initialize();
      return session;
    },
  };
}
