import { computed, inject, Injectable, signal } from '@angular/core';

import { DemoStore } from '../demo/demo.store';

const WINDOW_MS = 60_000;

/** Degraded when the demo says so, or when something answered 503 in the last minute. */
@Injectable({ providedIn: 'root' })
export class TransportHealth {
  private readonly demo = inject(DemoStore);
  private readonly lastFailure = signal<number | null>(null);
  private readonly tick = signal(0);

  readonly degraded = computed(() => {
    this.tick();
    const last = this.lastFailure();
    return (
      this.demo.info()?.latency === 'degraded' ||
      (last !== null && performance.now() - last < WINDOW_MS)
    );
  });

  reportFailure(): void {
    this.lastFailure.set(performance.now());
    setTimeout(() => this.tick.update((n) => n + 1), WINDOW_MS + 50);
  }
}
