import { describe, expect, it } from 'vitest';

import { parseSeed } from '../color';
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
});
