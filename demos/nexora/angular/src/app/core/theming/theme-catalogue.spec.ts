import {
  checkScheme,
  evaluateRecipe,
  parseSeed,
  ruleErrors,
  SCHEMES,
  SEED_NAMES,
  type Oklch,
  type SeedName,
  type Theme,
} from '@slotted/theme';
import defaultTheme from '@slotted/themes/default';
import { describe, expect, it } from 'vitest';

import { BRAND_PRESETS, NEUTRAL_PRESETS } from './appearance';
import { nexoraTheme } from './nexora-themes';
import { fontFamily } from './theme-faces';
import { DEFAULT_THEME_ID, RUNTIME_THEME_IDS, THEME_CATALOGUE } from './theme-catalogue';

const changed = (
  values: Readonly<Record<string, string>> | undefined,
  reference: Readonly<Record<string, string>> | undefined,
) => Object.keys(values ?? {}).filter((name) => values![name] !== reference?.[name]);

const familyOf = (token: string) =>
  /^--slotted-(stat-card|text-field|segmented-control|[a-z]+)-/.exec(token)![1];

const parsed = (seeds: Readonly<Record<SeedName, string>>) =>
  Object.fromEntries(SEED_NAMES.map((name) => [name, parseSeed(seeds[name])!])) as Record<
    SeedName,
    Oklch
  >;

const failures = (theme: Theme, seeds: Partial<Record<SeedName, string>>) =>
  SCHEMES.flatMap((scheme) =>
    checkScheme(
      evaluateRecipe(theme.recipe, parsed({ ...theme.seeds, ...seeds }), scheme),
      scheme,
    ).map((failure) => `${scheme}: ${failure}`),
  );

describe('theme catalogue', () => {
  it('names one definition per entry, and only the runtime themes leave `default`', () => {
    expect(THEME_CATALOGUE.map((entry) => nexoraTheme(entry.id).name)).toEqual(
      THEME_CATALOGUE.map((entry) => entry.id),
    );
    expect(RUNTIME_THEME_IDS).toEqual([
      'nexora-friendly',
      'nexora-brutalist',
      'nexora-editorial',
      'nexora-terminal',
    ]);
    expect(nexoraTheme(DEFAULT_THEME_ID)).toBe(defaultTheme);
  });

  /**
   * The corner the builder's slider starts at is the theme's own largest
   * radius; Standard's accent is Nexora's violet, every other theme keeps the
   * seed its sheet declares.
   */
  it('states each theme’s own corner and accent as its definition does', () => {
    for (const entry of THEME_CATALOGUE) {
      expect(`${entry.radius}px`, entry.id).toBe(
        nexoraTheme(entry.id).base?.['--slotted-radius-lg'],
      );
    }
    expect(THEME_CATALOGUE.map((entry) => entry.accent)).toEqual([
      '#7c3aed',
      null,
      null,
      null,
      null,
    ]);
  });

  /**
   * A theme is a personality, not a tint: each one carries its five seeds and
   * a recipe of its own, rewrites the scales, the schemes and the densities,
   * dresses the families through their own tokens, adds rules where no token
   * reaches and brings its typeface.
   */
  it.each(RUNTIME_THEME_IDS)('%s exercises every layer of the theme model', (id) => {
    const theme = nexoraTheme(id);
    expect(SEED_NAMES.filter((name) => theme.seeds[name] === defaultTheme.seeds[name])).toEqual([]);
    expect(
      SCHEMES.flatMap((scheme) =>
        Object.keys(theme.recipe[scheme]).filter(
          (name) =>
            JSON.stringify(theme.recipe[scheme][name]) !==
            JSON.stringify(defaultTheme.recipe[scheme][name]),
        ),
      ).length,
    ).toBeGreaterThanOrEqual(4);
    expect(changed(theme.base, defaultTheme.base).length).toBeGreaterThanOrEqual(30);
    for (const scheme of SCHEMES) {
      expect(
        changed(theme.schemes?.[scheme], defaultTheme.schemes?.[scheme]).length,
        scheme,
      ).toBeGreaterThanOrEqual(scheme === 'high-contrast' ? 8 : 12);
    }
    expect(
      changed(theme.densities?.comfortable, defaultTheme.densities?.comfortable).length,
    ).toBeGreaterThanOrEqual(6);
    const components = Object.keys(theme.components ?? {});
    expect(components.length).toBeGreaterThanOrEqual(15);
    expect(new Set(components.map(familyOf)).size).toBeGreaterThanOrEqual(6);
    expect(theme.rules?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(theme.fonts?.length ?? 0).toBeGreaterThanOrEqual(1);
  });

  it.each(RUNTIME_THEME_IDS)('%s draws the chart in a palette of its own in every scheme', (id) => {
    const theme = nexoraTheme(id);
    for (const scheme of SCHEMES) {
      const palette = Array.from(
        { length: 8 },
        (_, index) => theme.schemes?.[scheme]?.[`--slotted-data-${index + 1}` as never],
      );
      expect(new Set(palette).size, scheme).toBe(8);
      expect(
        palette.filter(
          (color, index) =>
            color === defaultTheme.schemes?.[scheme]?.[`--slotted-data-${index + 1}` as never],
        ),
        scheme,
      ).toEqual([]);
    }
  });

  /**
   * recipe-checks' floors hold for every theme in every scheme: with its own
   * seeds, and with each brand and grey a reader can lay over them.
   */
  it.each(THEME_CATALOGUE.map((entry) => entry.id))(
    '%s keeps every text, border and solid at its floor in the three schemes',
    (id) => {
      const theme = nexoraTheme(id);
      expect(failures(theme, {})).toEqual([]);
      for (const brand of BRAND_PRESETS) {
        for (const neutral of NEUTRAL_PRESETS) {
          const seeds = {
            accent: brand.color,
            ...(neutral.color === null ? {} : { neutral: neutral.color }),
          };
          expect(failures(theme, seeds), `${brand.id} × ${neutral.id}`).toEqual([]);
        }
      }
    },
  );

  /**
   * A ground, a line and a hover are one neutral family: in every theme, with
   * its own neutral and with each grey a reader can lay over it, the lines and
   * the hovers carry the ground's hue (±20°) and at least its chroma, wherever
   * the ground's chroma (≥ 0.01) gives it a hue.
   */
  it.each(THEME_CATALOGUE.map((entry) => entry.id))(
    '%s tints its lines and hovers as it tints its grounds',
    (id) => {
      const theme = nexoraTheme(id);
      const greys = [
        null,
        ...NEUTRAL_PRESETS.flatMap((preset) => (preset.color === null ? [] : [preset.color])),
      ];
      let tinted = 0;
      for (const grey of greys) {
        for (const scheme of ['light', 'dark'] as const) {
          const values = evaluateRecipe(
            theme.recipe,
            parsed({ ...theme.seeds, ...(grey === null ? {} : { neutral: grey }) }),
            scheme,
          );
          const ground = values['--slotted-surface']!;
          if (ground.c < 0.01) continue;
          tinted += 1;
          for (const token of [
            '--slotted-border-subtle',
            '--slotted-tone-secondary-subtle-hover',
            '--slotted-control-border-color',
          ]) {
            const value = values[token]!;
            const hue = Math.abs(value.h - ground.h) % 360;
            expect(
              Math.min(hue, 360 - hue),
              `${grey ?? 'own'} ${scheme} ${token}`,
            ).toBeLessThanOrEqual(20);
            expect(value.c, `${grey ?? 'own'} ${scheme} ${token}`).toBeGreaterThanOrEqual(
              ground.c * 0.99,
            );
          }
        }
      }
      expect(tinted).toBeGreaterThanOrEqual(4);
    },
  );

  /**
   * A grey the reader picks has to read as a choice beside the theme's own:
   * every pair of greys offered — the four presets and the themes' own — is
   * apart by 25° of hue or 0.01 of chroma (OKLCH).
   */
  it('offers greys apart from one another and from every theme’s own', () => {
    const greys = [
      ...NEUTRAL_PRESETS.flatMap((preset) => (preset.color === null ? [] : [preset.color])),
      ...RUNTIME_THEME_IDS.map((id) => nexoraTheme(id).seeds.neutral),
    ];
    for (const [index, a] of greys.entries()) {
      for (const b of greys.slice(index + 1)) {
        const [x, y] = [parseSeed(a)!, parseSeed(b)!];
        const hue = Math.abs(x.h - y.h) % 360;
        const apart = Math.min(hue, 360 - hue) >= 25 || Math.abs(x.c - y.c) >= 0.01;
        expect(apart, `${a} beside ${b}`).toBe(true);
      }
    }
  });

  /**
   * ADR 0004: a theme rule selects by the families' public hooks and reads
   * only tokens. `defineTheme` holds every rule given as text to that policy,
   * so each theme here exists only because its rules passed it;
   * `ruleErrors` is the same check, read directly.
   */
  it('selects in its rules by the families’ public hooks only, and reads only tokens', () => {
    for (const id of RUNTIME_THEME_IDS) {
      for (const rule of nexoraTheme(id).rules ?? []) {
        expect(ruleErrors(String(rule)), id).toEqual([]);
      }
    }
  });

  /**
   * Terminal's prompt before the selected tab is decoration: its alternative
   * text is empty, so the tab's accessible name stays its label. Its tables
   * are striped in a ground mixed from its own line, the neutral family every
   * ground and line of the theme shares.
   */
  it('draws Terminal’s prompt out of the tab’s name, and its stripe from its line', () => {
    const terminal = nexoraTheme('nexora-terminal');
    expect((terminal.rules ?? []).join('\n')).toMatch(/content: '> ' \/ '';/);
    expect(terminal.components?.['--slotted-table-row-surface-stripe']).toBe(
      'color-mix(in oklab, var(--slotted-border-subtle) 45%, var(--slotted-surface))',
    );
  });

  /**
   * Faces are the contract's tokens, taken from the families the builder
   * offers; each theme declares the `@font-face` of every face it names, and
   * no rule writes a face of its own.
   */
  it('sets every face through the font tokens, from the builder’s families', () => {
    for (const entry of THEME_CATALOGUE) {
      const theme = nexoraTheme(entry.id);
      const resolve = (value: string | undefined) =>
        value === 'var(--slotted-font-family-sans)'
          ? theme.base?.['--slotted-font-family-sans']
          : value;
      expect(theme.base?.['--slotted-font-family-sans'], entry.id).toBe(
        fontFamily(entry.body).stack,
      );
      expect(resolve(theme.base?.['--slotted-font-family-heading']), entry.id).toBe(
        fontFamily(entry.heading).stack,
      );
      expect((theme.fonts ?? []).map((font) => font.family).sort(), entry.id).toEqual(
        [...new Set([entry.body, entry.heading])]
          .flatMap((id) => (fontFamily(id).face === null ? [] : [fontFamily(id).face!.family]))
          .sort(),
      );
    }
    for (const id of RUNTIME_THEME_IDS) {
      expect((nexoraTheme(id).rules ?? []).join('\n'), id).not.toMatch(/font-family\s*:/);
    }
  });
});
