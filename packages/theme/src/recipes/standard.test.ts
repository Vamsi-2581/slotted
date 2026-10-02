import { describe, expect, it } from 'vitest';

import { parseSeed, toLinearSrgb } from '../color';
import { evaluateRecipe, SCHEMES, SEED_NAMES, type SeedName } from '../recipe';
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

  /**
   * Every card, popover, dialog, menu, toast and page is painted with one of
   * these grounds, so a neutral seed that leaves them achromatic recolours the
   * lines and the text and leaves the panels where they were. The tint is read
   * where an sRGB screen paints it: inside the gamut, at the seed's hue. The
   * light inverse ground is the dark tooltip, which follows the seed at 0.95 of
   * its chroma and is not one of the grounds this holds.
   */
  const GROUNDS = [
    '--slotted-surface',
    '--slotted-surface-raised',
    '--slotted-surface-sunken',
    '--slotted-control-surface',
  ];
  const TINTED = { light: GROUNDS, dark: [...GROUNDS, '--slotted-surface-inverse'] };

  it('tints every neutral ground with a strongly tinted neutral seed in light and dark', () => {
    const misses: string[] = [];
    for (const neutral of ['#7c3aed', '#0e7490', '#846f6c']) {
      const seed = parseSeed(neutral)!;
      for (const scheme of ['light', 'dark'] as const) {
        const values = evaluateRecipe(standard, { ...base, neutral: seed }, scheme);
        for (const token of TINTED[scheme]) {
          const ground = values[token]!;
          const turn = Math.abs(((ground.h - seed.h + 540) % 360) - 180);
          const inside = toLinearSrgb(ground).every((channel) => channel >= 0 && channel <= 1);
          if (ground.c < 0.005 || turn > 15 || !inside)
            misses.push(
              `${neutral} ${scheme} ${token}: c ${ground.c.toFixed(4)}, ${turn.toFixed(0)}° from the seed, ${inside ? 'in' : 'out of'} sRGB`,
            );
        }
      }
    }
    expect(misses).toEqual([]);
  });

  it('keeps the high-contrast grounds achromatic for any neutral seed', () => {
    const values = evaluateRecipe(
      standard,
      { ...base, neutral: parseSeed('#7c3aed')! },
      'high-contrast',
    );
    for (const token of [...GROUNDS, '--slotted-surface-inverse']) expect(values[token]!.c).toBe(0);
  });
});
