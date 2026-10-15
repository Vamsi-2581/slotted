import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { observeChartTheme } from './theme';

/**
 * `observeChartTheme` schedules its re-read on `requestAnimationFrame`, which
 * Vitest does not fake by default. Faking it here lets the test advance the
 * one pending frame deterministically instead of waiting on a real one.
 */
function useFrames() {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
}

describe('observeChartTheme', () => {
  beforeEach(() => {
    useFrames();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the theme again when a theme stylesheet is applied', () => {
    const element = document.createElement('div');
    document.body.append(element);
    let reads = 0;
    const stop = observeChartTheme(element, () => {
      reads += 1;
    });

    document.dispatchEvent(
      new CustomEvent('slotted-themechange', { detail: { name: 'x', applied: true } }),
    );
    vi.advanceTimersToNextFrame();

    stop();
    element.remove();
    expect(reads).toBe(1);
  });
});
