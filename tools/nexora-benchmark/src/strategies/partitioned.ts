import type { ScaleProfile } from '../contracts';
import { generateCalibrationBatches, GENERATION_ORDER } from '../generate';
import type { MaterializationStrategy, StrategyObserver, StrategyOptions } from '../query-contract';
import { DatabaseStrategySession } from './database';

class PartitionedSession extends DatabaseStrategySession {
  async initialize(pauseAfterOperational: boolean): Promise<void> {
    await this.open();
    let resolveOperational!: () => void;
    const operational = new Promise<void>((resolve) => {
      resolveOperational = resolve;
    });
    this.setPendingPartitions(1);
    const background = this.startBackground(async () => {
      for (const batch of generateCalibrationBatches(this.profile, this.batchSize)) {
        if (this.disposed) return;
        await this.writeBatch(batch);
        if (this.committedCounts[batch.table] === this.profile.counts[batch.table]) {
          this.markTableComplete(batch.table);
        }
        if (
          batch.table === 'salesOrders' &&
          this.committedCounts.salesOrders === this.profile.counts.salesOrders
        ) {
          this.setReadiness('operational');
          resolveOperational();
          if (pauseAfterOperational) return;
        }
      }
      for (const table of GENERATION_ORDER) this.markTableComplete(table);
      this.setPendingPartitions(0);
      this.setReadiness('complete');
      resolveOperational();
    });
    await Promise.race([operational, background]);
  }
}

export function createPartitionedStrategy(options: StrategyOptions): MaterializationStrategy {
  return {
    name: 'partitioned',
    async prepare(profile: ScaleProfile, observer: StrategyObserver) {
      const session = new PartitionedSession(
        'partitioned',
        profile,
        observer,
        options.databaseName,
        options.batchSize ?? 512,
      );
      await session.initialize(options.pauseAfterOperational ?? false);
      return session;
    },
  };
}
