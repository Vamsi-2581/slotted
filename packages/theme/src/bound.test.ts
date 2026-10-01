import { describe, expect, it } from 'vitest';

import { applyBounds, boundCss, boundValue, fitBound } from './bound';
import { relativeLuminance } from './color';

const WHITE_TEXT_AA = 1.05 / 4.5 - 0.05;

describe('fitBound', () => {
  const ceiling = fitBound(WHITE_TEXT_AA, 'ceiling', 0.25);

  it('has 27 coefficients', () => {
    expect(ceiling.k).toHaveLength(27);
  });

  it('never lets a colour under the ceiling exceed the target luminance', () => {
    for (let h = 0; h < 360; h += 7) {
      for (let c = 0; c <= 0.25; c += 0.025) {
        const l = boundValue(ceiling, c, h);
        const { raw, clipped } = relativeLuminance({ l, c, h });
        expect(Math.max(raw, clipped), `h ${h} c ${c}`).toBeLessThanOrEqual(WHITE_TEXT_AA + 1e-9);
      }
    }
  });

  it('stays within 0.03 of the exact ceiling', () => {
    expect(boundValue(ceiling, 0, 0)).toBeGreaterThan(0.568 - 0.03);
  });

  it('keeps a floor above the target luminance', () => {
    const target = 4.5 * (0.0105 + 0.05) - 0.05;
    const floor = fitBound(target, 'floor', 0.25);
    for (let h = 0; h < 360; h += 11) {
      for (let c = 0; c <= 0.25; c += 0.05) {
        const { raw, clipped } = relativeLuminance({ l: boundValue(floor, c, h), c, h });
        expect(Math.min(raw, clipped)).toBeGreaterThanOrEqual(target - 1e-9);
      }
    }
  });
});

describe('applyBounds', () => {
  it('lowers lightness above a ceiling and leaves it below', () => {
    const bound = { side: 'ceiling' as const, l: 0.5, k: Array(27).fill(0) };
    expect(applyBounds({ l: 0.7, c: 0.1, h: 30 }, [bound]).l).toBe(0.5);
    expect(applyBounds({ l: 0.4, c: 0.1, h: 30 }, [bound]).l).toBe(0.4);
  });
});

describe('boundCss', () => {
  it('writes the polynomial in Horner form over the colour channels', () => {
    const k = Array(27).fill(0);
    k[0] = 0.1;
    k[1] = -0.2;
    expect(boundCss({ side: 'ceiling', l: 0.5, k })).toBe(
      'calc(0.5 + c * ((0.1 + -0.2 * cos(calc(h * 1deg)) + 0 * sin(calc(h * 1deg)) + 0 * cos(calc(h * 2deg)) + 0 * sin(calc(h * 2deg)) + 0 * cos(calc(h * 3deg)) + 0 * sin(calc(h * 3deg)) + 0 * cos(calc(h * 4deg)) + 0 * sin(calc(h * 4deg))) + c * ((0 + 0 * cos(calc(h * 1deg)) + 0 * sin(calc(h * 1deg)) + 0 * cos(calc(h * 2deg)) + 0 * sin(calc(h * 2deg)) + 0 * cos(calc(h * 3deg)) + 0 * sin(calc(h * 3deg)) + 0 * cos(calc(h * 4deg)) + 0 * sin(calc(h * 4deg))) + c * (0 + 0 * cos(calc(h * 1deg)) + 0 * sin(calc(h * 1deg)) + 0 * cos(calc(h * 2deg)) + 0 * sin(calc(h * 2deg)) + 0 * cos(calc(h * 3deg)) + 0 * sin(calc(h * 3deg)) + 0 * cos(calc(h * 4deg)) + 0 * sin(calc(h * 4deg))))))',
    );
  });
});
