import type { ProbeName, ProbeResult, ScaleProfile } from '../contracts';
import { executeVirtualProbe, DatabaseStrategySession } from './database';
import { generateCalibrationBatches, GENERATION_ORDER } from '../generate';
import type { MaterializationStrategy, StrategyObserver, StrategyOptions } from '../query-contract';

const MASTER_TABLES = new Set(['customers', 'contacts', 'suppliers', 'skus'] as const);

export class OnDemandSession extends DatabaseStrategySession {
  private readonly probeCache = new Map<ProbeName, ProbeResult>();

  async initialize(): Promise<void> {
    await this.open();
    for (const batch of generateCalibrationBatches(this.profile, this.batchSize)) {
      if (
        !MASTER_TABLES.has(batch.table as typeof MASTER_TABLES extends Set<infer T> ? T : never)
      ) {
        break;
      }
      await this.writeBatch(batch);
      if (this.committedCounts[batch.table] === this.profile.counts[batch.table]) {
        this.markTableComplete(batch.table);
      }
    }
    await this.database.metadata.put({
      key: 'deterministic-locator',
      value: JSON.stringify({ seed: this.profile.seed, counts: this.profile.counts }),
    });
    for (const table of GENERATION_ORDER) this.markTableAvailable(table);
    this.setReadiness('operational');
    this.setReadiness('complete');
  }

  override async runProbe(name: ProbeName): Promise<ProbeResult> {
    const cached = this.probeCache.get(name);
    if (cached) return cached;
    const result = executeVirtualProbe(this.profile, name);
    this.probeCache.set(name, result);
    await this.database.metadata.put({ key: `probe:${name}`, value: JSON.stringify(result) });
    return result;
  }
}

export function createOnDemandStrategy(options: StrategyOptions): MaterializationStrategy {
  return {
    name: 'on-demand',
    async prepare(profile: ScaleProfile, observer: StrategyObserver) {
      const session = new OnDemandSession(
        'on-demand',
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
