import { relativeLuminance } from './color';
import type { Oklch } from './color';
import { fmt } from './format';

/**
 * A lightness limit that holds a contrast ratio for every hue and chroma.
 *
 * The relative luminance of an OKLCH colour depends on its hue and chroma as
 * well as on `l`: white text holds 4.5:1 up to l 0.568 at chroma 0, and the
 * limit moves by about ±0.13 × chroma with the hue. A bound is a least-squares
 * fit of the exact limit over chroma 0–`maxChroma` and every hue, moved by the
 * fit's largest error toward the safe side, so it never admits a colour the
 * exact limit refuses. `l + c·(T1 + c·(T2 + c·T3))`, each `Tp` a fourth-order
 * Fourier series in the hue.
 */
export interface Bound {
  readonly side: 'ceiling' | 'floor';
  readonly l: number;
  readonly k: readonly number[];
}

export const BOUND_POWERS = 3;
export const BOUND_HARMONICS = 4;
const TERMS = 1 + 2 * BOUND_HARMONICS;

function basis(h: number): number[] {
  const radians = (h * Math.PI) / 180;
  const values = [1];
  for (let n = 1; n <= BOUND_HARMONICS; n += 1) {
    values.push(Math.cos(n * radians), Math.sin(n * radians));
  }
  return values;
}

export function boundValue(bound: Bound, c: number, h: number): number {
  const trig = basis(h);
  let total = 0;
  for (let power = BOUND_POWERS; power >= 1; power -= 1) {
    let term = 0;
    for (let j = 0; j < TERMS; j += 1) term += (bound.k[(power - 1) * TERMS + j] ?? 0) * trig[j]!;
    total = c * (term + total);
  }
  return bound.l + total;
}

export function applyBounds(color: Oklch, bounds: readonly Bound[] = []): Oklch {
  let { l } = color;
  for (const bound of bounds) {
    const limit = boundValue(bound, color.c, color.h);
    l = bound.side === 'ceiling' ? Math.min(l, limit) : Math.max(l, limit);
  }
  return { l, c: color.c, h: color.h };
}

function termCss(bound: Bound, power: number): string {
  const k = (j: number) => fmt(bound.k[(power - 1) * TERMS + j] ?? 0);
  const parts = [k(0)];
  for (let n = 1; n <= BOUND_HARMONICS; n += 1) {
    parts.push(`${k(2 * n - 1)} * cos(calc(h * ${n}deg))`, `${k(2 * n)} * sin(calc(h * ${n}deg))`);
  }
  return `(${parts.join(' + ')})`;
}

/** The limit as a `calc()` over the `c` and `h` channel keywords of a relative colour. */
export function boundCss(bound: Bound): string {
  let inner = `c * ${termCss(bound, BOUND_POWERS)}`;
  for (let power = BOUND_POWERS - 1; power >= 1; power -= 1) {
    inner = `c * (${termCss(bound, power)} + ${inner})`;
  }
  return `calc(${fmt(bound.l)} + ${inner})`;
}

/** The exact limit at one hue and chroma, by bisection on lightness. */
function exactLimit(h: number, c: number, target: number, side: Bound['side']): number {
  let low = 0;
  let high = 1;
  for (let step = 0; step < 40; step += 1) {
    const middle = (low + high) / 2;
    const { raw, clipped } = relativeLuminance({ l: middle, c, h });
    if (side === 'ceiling') {
      if (Math.max(raw, clipped) <= target) low = middle;
      else high = middle;
    } else if (Math.min(raw, clipped) >= target) high = middle;
    else low = middle;
  }
  return side === 'ceiling' ? low : high;
}

function features(c: number, h: number): number[] {
  const trig = basis(h);
  const row: number[] = [];
  for (let power = 1; power <= BOUND_POWERS; power += 1) {
    for (const value of trig) row.push(c ** power * value);
  }
  return row;
}

function leastSquares(rows: number[][], targets: number[]): number[] {
  const size = rows[0]!.length;
  const a = Array.from({ length: size }, () => Array<number>(size).fill(0));
  const b = Array<number>(size).fill(0);
  rows.forEach((row, index) => {
    for (let i = 0; i < size; i += 1) {
      b[i]! += row[i]! * targets[index]!;
      for (let j = 0; j < size; j += 1) a[i]![j]! += row[i]! * row[j]!;
    }
  });
  for (let i = 0; i < size; i += 1) {
    let pivot = i;
    for (let r = i + 1; r < size; r += 1)
      if (Math.abs(a[r]![i]!) > Math.abs(a[pivot]![i]!)) pivot = r;
    [a[i], a[pivot]] = [a[pivot]!, a[i]!];
    [b[i], b[pivot]] = [b[pivot]!, b[i]!];
    for (let r = 0; r < size; r += 1) {
      if (r === i) continue;
      const factor = a[r]![i]! / a[i]![i]!;
      for (let col = i; col < size; col += 1) a[r]![col]! -= factor * a[i]![col]!;
      b[r]! -= factor * b[i]!;
    }
  }
  return b.map((value, i) => value / a[i]![i]!);
}

/**
 * The bound for a target relative luminance: a ceiling keeps the colour at or
 * under it, a floor at or over it. Coefficients are rounded before the error
 * is measured, so the shift covers the rounding as well as the fit.
 */
export function fitBound(target: number, side: Bound['side'], maxChroma = 0.25): Bound {
  const origin = exactLimit(0, 0, target, side);
  const rows: number[][] = [];
  const offsets: number[] = [];
  for (let c = 0; c <= maxChroma + 1e-9; c += 0.01) {
    for (let h = 0; h < 360; h += 3) {
      rows.push(features(c, h));
      offsets.push(exactLimit(h, c, target, side) - origin);
    }
  }
  const k = leastSquares(rows, offsets).map((value) => Number(value.toFixed(5)));
  let worst = 0;
  rows.forEach((row, index) => {
    const predicted = row.reduce((sum, value, j) => sum + value * k[j]!, 0);
    const error = side === 'ceiling' ? predicted - offsets[index]! : offsets[index]! - predicted;
    worst = Math.max(worst, error);
  });
  const l =
    side === 'ceiling'
      ? Math.floor((origin - worst - 0.001) * 1e4) / 1e4
      : Math.ceil((origin + worst + 0.001) * 1e4) / 1e4;
  return { side, l, k };
}
