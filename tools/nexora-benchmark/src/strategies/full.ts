import { generateCalibrationBatches, GENERATION_ORDER } from '../generate';
import type { CalibrationRecord, RecordBatch, RecordTable } from '../records';
import type { MaterializationStrategy, StrategyObserver, StrategyOptions } from '../query-contract';
import type { ScaleProfile } from '../contracts';
import { DatabaseStrategySession } from './database';

class FullSession extends DatabaseStrategySession {
  async initialize(): Promise<void> {
    await this.open();
    const records: Record<RecordTable, CalibrationRecord[]> = {
      customers: [],
      contacts: [],
      suppliers: [],
      skus: [],
      salesOrders: [],
      salesOrderLines: [],
      stockMovements: [],
      purchaseOrders: [],
      invoices: [],
      payments: [],
      supportTickets: [],
    };
    const batches: RecordBatch[] = [];
    for (const batch of generateCalibrationBatches(this.profile, this.batchSize)) {
      records[batch.table].push(...batch.records);
      batches.push(batch);
    }

    const started = typeof performance === 'undefined' ? 0 : performance.now();
    await this.database.transaction(
      'rw',
      GENERATION_ORDER.map((table) => this.database.records(table)),
      async () => {
        for (const table of GENERATION_ORDER) {
          await this.database.records(table).bulkPut(records[table]);
        }
      },
    );
    const elapsed = (typeof performance === 'undefined' ? 0 : performance.now()) - started;
    const perBatch = batches.length === 0 ? 0 : elapsed / batches.length;
    for (const batch of batches) this.trackCommittedBatch(batch, perBatch);
    this.markAllTablesComplete();
    this.setReadiness('operational');
    this.setReadiness('complete');
  }
}

export function createFullStrategy(options: StrategyOptions): MaterializationStrategy {
  return {
    name: 'full',
    async prepare(profile: ScaleProfile, observer: StrategyObserver) {
      const session = new FullSession(
        'full',
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
