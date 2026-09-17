import type { ProbeName, ProbeResult, ScaleProfile } from '../contracts';
import { executeVirtualProbe, DatabaseStrategySession } from './database';
import { GENERATION_ORDER } from '../generate';
import type { MaterializationStrategy, StrategyObserver, StrategyOptions } from '../query-contract';

export class OnDemandSession extends DatabaseStrategySession {
  private readonly probeCache = new Map<ProbeName, ProbeResult>();

  constructor(
    name: 'on-demand',
    profile: ScaleProfile,
    observer: StrategyObserver,
    databaseName: string,
    batchSize: number,
    private readonly virtualBatchSize: number,
  ) {
    super(name, profile, observer, databaseName, batchSize);
  }

  async initialize(): Promise<void> {
    await this.open();
    await this.writeMetadata(
      'deterministic-locator',
      JSON.stringify({
        seed: this.profile.seed,
        counts: this.profile.counts,
        materialization: 'locator-first',
      }),
    );
    for (const table of GENERATION_ORDER) this.markTableAvailable(table);
    this.setReadiness('operational');
    this.setReadiness('complete');
  }

  override async runProbe(name: ProbeName): Promise<ProbeResult> {
    const cached = this.probeCache.get(name);
    if (cached) return cached;
    const result = await executeVirtualProbe(
      this.profile,
      name,
      this.virtualBatchSize,
      this.observer.onBatch,
    );
    this.probeCache.set(name, result);
    await this.writeMetadata(`probe:${name}`, JSON.stringify(result));
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
        options.virtualBatchSize ?? options.batchSize ?? 512,
      );
      await session.initialize();
      return session;
    },
  };
}
