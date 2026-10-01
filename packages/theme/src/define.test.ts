import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { defineTheme, extendTheme, flattenTheme, type ThemeDefinition } from './define';
import { recipes } from './recipes';

// jsdom's `URL` (the test environment's global) rejects a `file:` base, so this
// resolves the path with `node:path` rather than `new URL(..., import.meta.url)`.
const values = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../themes/src/default/values.json'), 'utf8'),
) as Omit<ThemeDefinition, 'name' | 'seeds' | 'recipe'> & { name?: string };

const SEEDS = {
  accent: '#1d4ed8',
  neutral: '#64748b',
  success: '#15803d',
  warning: '#facc15',
  danger: '#dc2626',
};

const definition = (overrides: Partial<ThemeDefinition> = {}): ThemeDefinition => ({
  ...values,
  name: 'test',
  seeds: SEEDS,
  recipe: recipes.standard,
  ...overrides,
});

describe('defineTheme', () => {
  it('returns a frozen theme', () => {
    const theme = defineTheme(definition());
    expect(theme.kind).toBe('slotted-theme');
    expect(Object.isFrozen(theme)).toBe(true);
    expect(Object.isFrozen(theme.seeds)).toBe(true);
  });

  it('refuses a name a selector cannot carry', () => {
    for (const name of ['my theme', 'a"b', 'Default', '1st', '']) {
      expect(() => defineTheme(definition({ name })), name).toThrow(/is not \[a-z\]\[a-z0-9-\]\*/);
    }
  });

  it('refuses a seed in another notation', () => {
    expect(() => defineTheme(definition({ seeds: { ...SEEDS, accent: 'red' } }))).toThrow(
      'seed accent "red" is neither #rrggbb nor oklch(L C H)',
    );
  });

  it('accepts a component token a family reads and refuses one no family reads', () => {
    expect(() =>
      defineTheme(definition({ components: { '--slotted-text-field-radius': '0px' } })),
    ).not.toThrow();
    expect(() =>
      defineTheme(
        definition({
          components: { '--slotted-nope-radius': '0px' } as NonNullable<
            ThemeDefinition['components']
          >,
        }),
      ),
    ).toThrow('components contains --slotted-nope-radius, which no family reads');
  });

  it('reports a contract token the theme leaves out', () => {
    const { ['--slotted-space-1']: _dropped, ...base } = values.base as Record<string, string>;
    expect(() => defineTheme(definition({ base }))).toThrow('base is missing --slotted-space-1');
  });

  it('refuses a component value that could close the rule it is written into', () => {
    expect(() =>
      defineTheme(
        definition({
          components: { '--slotted-card-radius': '0px; } .evil { color: red' },
        }),
      ),
    ).toThrow(
      'components --slotted-card-radius is "0px; } .evil { color: red", which contains an unquoted ;, { or }',
    );
  });

  it('refuses a font field that could close the rule it is written into, and keeps a legitimate one', () => {
    expect(() =>
      defineTheme(definition({ fonts: [{ family: 'X', src: 'url(a); } .evil { color: red' }] })),
    ).toThrow(
      'fonts[0].src is "url(a); } .evil { color: red", which contains an unquoted ;, { or }',
    );
    expect(() =>
      defineTheme(
        definition({
          fonts: [{ family: 'X', src: 'url("a;b.woff2") format("woff2")', weight: '100 900' }],
        }),
      ),
    ).not.toThrow();
  });
});

describe('flattenTheme', () => {
  const schemes = values.schemes as Record<string, Record<string, string>>;
  const flat = flattenTheme(
    defineTheme(
      definition({
        schemes: {
          ...schemes,
          dark: { ...schemes['dark'], '--slotted-scrim': 'rgb(0 0 0 / 0.5)' },
        },
      }),
    ),
  );

  it('writes a derived colour as hex and an alias as var()', () => {
    expect(flat.schemes['light']!['--slotted-tone-accent-solid']).toMatch(/^#[0-9a-f]{6}$/);
    expect(flat.schemes['light']!['--slotted-control-surface']).toBe('var(--slotted-surface)');
  });

  it('lets a scheme value win over the recipe', () => {
    expect(flat.schemes['dark']!['--slotted-scrim']).toBe('rgb(0 0 0 / 0.5)');
  });
});

describe('extendTheme', () => {
  it('merges seeds, keeps the rest, and appends rules', () => {
    const parent = defineTheme(definition({ rules: ['[data-ui="card"] { border-radius: 0; }'] }));
    const child = extendTheme(
      parent,
      {
        seeds: { accent: '#e11d48' },
        rules: ['[data-ui="button"] { border-radius: 999px; }'],
      },
      { name: 'child' },
    );
    expect(child.name).toBe('child');
    expect(child.seeds.accent).toBe('#e11d48');
    expect(child.seeds.neutral).toBe(SEEDS.neutral);
    expect(child.rules).toHaveLength(2);
    expect(child.base).toEqual(parent.base);
  });
});
