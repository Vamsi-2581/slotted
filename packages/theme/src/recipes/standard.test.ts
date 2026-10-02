import { describe, expect, it } from 'vitest';

import { fromSrgb, parseSeed, toLinearSrgb, type Oklch } from '../color';
import { evaluateRecipe, SCHEMES, SEED_NAMES, type Scheme, type SeedName } from '../recipe';
import { checkScheme, seedGrid } from '../recipe-checks';
import { standard } from './standard';

const DEFAULT_SEEDS: Record<SeedName, string> = {
  accent: '#1d4ed8',
  neutral: '#64748b',
  success: '#15803d',
  warning: '#facc15',
  danger: '#dc2626',
};
const base = Object.fromEntries(
  SEED_NAMES.map((name) => [name, parseSeed(DEFAULT_SEEDS[name])!]),
) as Record<SeedName, NonNullable<ReturnType<typeof parseSeed>>>;

describe('recipes.standard', () => {
  it('derives the same 61 tokens in every scheme', () => {
    for (const scheme of SCHEMES) expect(Object.keys(standard[scheme])).toHaveLength(61);
  });

  it('meets every ratio for every seed of the grid, one seed varied at a time', () => {
    const failures = new Set<string>();
    for (const scheme of SCHEMES) {
      for (const name of SEED_NAMES) {
        for (const seed of seedGrid()) {
          const values = evaluateRecipe(standard, { ...base, [name]: seed }, scheme);
          for (const failure of checkScheme(values, scheme)) {
            failures.add(`${scheme} ${name} ${failure}`);
          }
        }
      }
    }
    expect([...failures].slice(0, 20)).toEqual([]);
  });

  /** The rule a token comes from, through its aliases and its hover mixes. */
  const origin = (scheme: Scheme, token: string) => {
    let rule = standard[scheme][token];
    while (rule && !('seed' in rule))
      rule = standard[scheme]['alias' in rule ? rule.alias : rule.mix];
    return rule;
  };
  const NEUTRAL = Object.fromEntries(
    SCHEMES.map((scheme) => [
      scheme,
      Object.keys(standard[scheme]).filter((token) => origin(scheme, token)?.seed === 'neutral'),
    ]),
  ) as Record<Scheme, string[]>;
  const inside = (color: Oklch) =>
    toLinearSrgb(color).every((channel) => channel >= -1e-9 && channel <= 1 + 1e-9);
  /** What an sRGB screen paints: every channel clipped to 0–1, read back unquantised. */
  const painted = (color: Oklch) => {
    const [r, g, b] = toLinearSrgb(color).map((channel) => {
      const linear = Math.min(1, Math.max(0, channel));
      return linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;
    });
    return fromSrgb(r!, g!, b!);
  };
  const turn = (color: Oklch, seed: Oklch) => Math.abs(((color.h - seed.h + 540) % 360) - 180);

  /**
   * A fixed `h` is what gave a neutral token the slate reference's hue offset
   * instead of the seed's own: the one `a66d725d` removed. A tolerance alone
   * does not guard the regression, because a wide enough one would still pass
   * a small fixed offset — so the rule itself is read, not only the colour it
   * paints.
   */
  it('derives every neutral rule with no fixed hue offset', () => {
    const offenders: string[] = [];
    for (const scheme of SCHEMES) {
      for (const [token, rule] of Object.entries(standard[scheme])) {
        if ('seed' in rule && rule.seed === 'neutral' && 'h' in rule) offenders.push(`${scheme} ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * A neutral seed recolours every line, highlight, ink and ground it derives,
   * or a page painted with it reads two colours at once: the pink seed of a
   * Nexora theme left the highlights a fixed slate share of it, and the step
   * from a pink ground to them read green. Each token is read where an sRGB
   * screen paints it — inside the gamut, so the hue `evaluateRecipe` computes
   * is the one on screen — and it carries the seed's hue and some of its
   * chroma. The tolerance is 1°, not the fixed offsets `a66d725d` removed
   * (text +8°, inverse/on-solid +7°, border-strong −6°): what is left is
   * rounding at the sRGB gamut edge, read above on the rule itself.
   */
  it('gives every neutral token the hue and a share of the chroma of a tinted neutral seed', () => {
    const misses: string[] = [];
    for (const neutral of ['#e8a0b8', '#db2777', '#846f6c', '#0e7490', '#7c3aed']) {
      const seed = parseSeed(neutral)!;
      for (const scheme of ['light', 'dark'] as const) {
        const values = evaluateRecipe(standard, { ...base, neutral: seed }, scheme);
        for (const token of NEUTRAL[scheme]) {
          const screen = painted(values[token]!);
          if (!inside(values[token]!) || screen.c < 0.005 || turn(screen, seed) > 1)
            misses.push(
              `${neutral} ${scheme} ${token}: c ${screen.c.toFixed(4)}, ${turn(screen, seed).toFixed(2)}° from the seed, ${inside(values[token]!) ? 'in' : 'out of'} sRGB`,
            );
        }
      }
    }
    expect(misses).toEqual([]);
  });

  it('keeps every neutral token inside sRGB for every neutral seed of the grid', () => {
    const misses = new Set<string>();
    for (const scheme of SCHEMES) {
      for (const seed of seedGrid()) {
        const values = evaluateRecipe(standard, { ...base, neutral: seed }, scheme);
        for (const token of NEUTRAL[scheme])
          if (!inside(values[token]!)) misses.add(`${scheme} ${token}`);
      }
    }
    expect([...misses]).toEqual([]);
  });

  /**
   * The fills and lines drawn over a ground. Each one holds at least the
   * ground's chroma, so the step from the ground to it points at the seed's
   * hue: with less, the step points at the opposite hue, and a hover on a pink
   * ground reads green. A hover mix is the fill it lightens and is not one.
   */
  const OVER_GROUNDS = [
    '--slotted-border-subtle',
    '--slotted-border-strong',
    '--slotted-control-border-color',
    '--slotted-disabled-border',
    '--slotted-disabled-background',
    '--slotted-tone-secondary-surface',
    '--slotted-tone-secondary-solid',
    '--slotted-tone-secondary-solid-active',
    '--slotted-tone-secondary-border',
    '--slotted-tone-secondary-subtle-hover',
    '--slotted-tone-secondary-subtle-active',
  ];
  const GROUNDS = ['--slotted-surface', '--slotted-surface-raised', '--slotted-surface-sunken'];

  it('gives every neutral fill and line at least the chroma of the grounds it is drawn on', () => {
    const misses = new Set<string>();
    for (const scheme of ['light', 'dark'] as const) {
      for (const seed of seedGrid()) {
        const values = evaluateRecipe(standard, { ...base, neutral: seed }, scheme);
        const ground = Math.max(...GROUNDS.map((token) => values[token]!.c));
        for (const token of OVER_GROUNDS)
          if (values[token]!.c < ground - 1e-9) misses.add(`${scheme} ${token}`);
      }
    }
    expect([...misses]).toEqual([]);
  });

  it('keeps the high-contrast grounds achromatic for any neutral seed', () => {
    const values = evaluateRecipe(
      standard,
      { ...base, neutral: parseSeed('#7c3aed')! },
      'high-contrast',
    );
    for (const token of [...GROUNDS, '--slotted-control-surface', '--slotted-surface-inverse'])
      expect(values[token]!.c).toBe(0);
  });
});
