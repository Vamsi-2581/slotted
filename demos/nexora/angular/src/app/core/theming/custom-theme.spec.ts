import { renderTheme, SCHEMES } from '@slotted/theme';
import defaultTheme from '@slotted/themes/default';
import { describe, expect, it } from 'vitest';

import { customOverrides, customTheme } from './custom-theme';
import {
  CARD_CHOICES,
  CHART_CHOICES,
  FONT_IDS,
  MOTION_CHOICES,
  NO_CUSTOMISATION,
  SCALE_CHOICES,
  SHADOW_CHOICES,
  TAB_CHOICES,
  type Customisation,
} from './customisation';
import { nexoraTheme, TAB_STYLES } from './nexora-themes';
import { THEME_CATALOGUE } from './theme-catalogue';

const set = (axes: Partial<Customisation>): Customisation => ({ ...NO_CUSTOMISATION, ...axes });

describe('customTheme', () => {
  /**
   * The builder is `extendTheme` on the chosen theme: every value of every
   * axis, on every theme of the catalogue, is a theme `defineTheme` accepts
   * and `renderTheme` writes — no build step between a choice and its sheet.
   * About 160 compiles of 30–50 ms each: the test states its own time limit.
   */
  it('compiles every value of every axis on every theme', () => {
    const values: Partial<Customisation>[] = [
      { radius: 0 },
      { radius: 24 },
      ...FONT_IDS.map((body) => ({ body })),
      ...FONT_IDS.map((heading) => ({ heading })),
      ...SCALE_CHOICES.map((scale) => ({ scale })),
      { border: 1 },
      { border: 2 },
      ...SHADOW_CHOICES.map((shadow) => ({ shadow })),
      ...MOTION_CHOICES.map((motion) => ({ motion })),
      ...CARD_CHOICES.map((cards) => ({ cards })),
      ...TAB_CHOICES.map((tabs) => ({ tabs })),
      ...CHART_CHOICES.map((chart) => ({ chart })),
      {
        radius: 16,
        body: 'nunito',
        heading: 'fraunces',
        scale: 90,
        border: 2,
        shadow: 'strong',
        motion: 'reduced',
        cards: 'flat',
        tabs: 'pill',
        chart: 'accent',
      },
    ];
    for (const entry of THEME_CATALOGUE) {
      for (const axes of values) {
        const theme = customTheme(entry.id, set(axes), 'nexora-custom');
        expect(theme.name).toBe('nexora-custom');
        expect(renderTheme(theme)).toContain('[data-slotted-theme="nexora-custom"]');
      }
    }
  }, 60_000);

  it('writes nothing for an axis left to the theme', () => {
    expect(customOverrides(NO_CUSTOMISATION)).toEqual({});
    const theme = customTheme('nexora-brutalist', NO_CUSTOMISATION, 'nexora-custom');
    const { name: _a, kind: _b, ...own } = nexoraTheme('nexora-brutalist');
    const { name: _c, kind: _d, ...built } = theme;
    expect(built).toEqual(own);
  });

  /** One expectation per axis: the token the axis names and the value it writes. */
  it('moves the tokens each axis names', () => {
    const radius = customOverrides(set({ radius: 12 }));
    expect(radius.base).toMatchObject({
      '--slotted-radius-xs': '3px',
      '--slotted-radius-sm': '6px',
      '--slotted-radius-md': '9px',
      '--slotted-radius-lg': '12px',
      '--slotted-control-radius': 'var(--slotted-radius-sm)',
    });
    expect(radius.components).toMatchObject({
      '--slotted-card-radius': 'var(--slotted-radius-lg)',
    });

    const serif = customOverrides(set({ body: 'source-serif', heading: 'fraunces' }));
    expect(serif.base?.['--slotted-font-family-sans']).toMatch(/^'Source Serif 4 Variable',/);
    expect(serif.base?.['--slotted-control-font-family']).toBe('var(--slotted-font-family-sans)');
    expect(serif.base?.['--slotted-font-family-heading']).toMatch(/^'Fraunces Variable',/);
    expect(serif.fonts?.map((font) => font.family)).toEqual([
      'Source Serif 4 Variable',
      'Fraunces Variable',
    ]);
    const same = customOverrides(set({ body: 'outfit', heading: 'outfit' }));
    expect(same.fonts?.map((font) => font.family)).toEqual(['Outfit Variable']);
    const geist = customOverrides(set({ body: 'geist' }));
    expect(geist.base?.['--slotted-font-family-sans']).toMatch(/^'Geist Variable',/);
    expect(geist.fonts).toBeUndefined();

    const scale = customOverrides(set({ scale: 112 }));
    expect(scale.base?.['--slotted-font-size-md']).toBe('0.98rem');
    expect(scale.base?.['--slotted-font-size-4xl']).toBe('2.24rem');
    expect(scale.densities?.comfortable?.['--slotted-control-font-size-md']).toBe('14.56px');
    expect(scale.densities?.dense?.['--slotted-control-font-size-md']).toBeDefined();

    expect(customOverrides(set({ border: 2 })).base).toMatchObject({
      '--slotted-border-width-thin': '2px',
      '--slotted-border-width-thick': '3px',
      '--slotted-control-border-width': 'var(--slotted-border-width-thin)',
    });

    const flat = customOverrides(set({ shadow: 'none' }));
    for (const scheme of ['light', 'dark'] as const) {
      expect(flat.schemes?.[scheme]?.['--slotted-shadow-md']).toBe('none');
      expect(flat.schemes?.[scheme]?.['--slotted-control-shadow']).toBe('none');
    }
    expect(flat.schemes?.['high-contrast']).toBeUndefined();
    expect(customOverrides(set({ shadow: 'soft' })).schemes?.light?.['--slotted-shadow-md']).toBe(
      defaultTheme.schemes?.light?.['--slotted-shadow-md'],
    );

    expect(customOverrides(set({ motion: 'off' })).base).toMatchObject({
      '--slotted-duration-short': '1ms',
      '--slotted-duration-long': '1ms',
    });
    expect(customOverrides(set({ motion: 'reduced' })).base?.['--slotted-duration-medium']).toBe(
      '100ms',
    );

    expect(customOverrides(set({ cards: 'elevated' })).components).toMatchObject({
      '--slotted-card-border-width': '0px',
      '--slotted-card-shadow': 'var(--slotted-shadow-md)',
      '--slotted-stat-card-shadow': 'var(--slotted-shadow-md)',
    });
    expect(customOverrides(set({ cards: 'flat' })).components).toMatchObject({
      '--slotted-card-background': 'var(--slotted-surface-sunken)',
      '--slotted-card-shadow': 'none',
    });
    expect(customOverrides(set({ chart: 'accent' })).components).toMatchObject({
      '--slotted-chart-color-1': 'var(--slotted-tone-accent-solid)',
    });
    expect(customOverrides(set({ chart: 'palette' })).components).toMatchObject({
      '--slotted-chart-color-1': 'var(--slotted-data-1)',
    });
  });

  /**
   * The tabs axis is the same two styles a catalogue theme draws its tabs
   * with: the marker's and the track's tokens, and the rule no token reaches.
   * Its rule comes after the theme's own in the same layer, so an underline
   * laid over Friendly's pill undoes it.
   */
  it('draws the selected tab as an underline or a pill, over any theme', () => {
    const pill = customOverrides(set({ tabs: 'pill' }));
    expect(pill.components).toMatchObject({
      '--slotted-tabs-marker-color': 'transparent',
      '--slotted-tabs-hover-marker-color': 'transparent',
      '--slotted-tabs-track-color': 'transparent',
    });
    expect(pill.rules).toEqual([TAB_STYLES.pill.rule]);
    expect(pill.rules![0]).toMatch(/border-radius: var\(--slotted-radius-full\)/);

    const underline = customOverrides(set({ tabs: 'underline' }));
    expect(underline.components).toMatchObject({
      '--slotted-tabs-marker-color': 'var(--slotted-tone-accent-solid)',
      '--slotted-tabs-track-color': 'var(--slotted-border-subtle)',
    });
    expect(underline.rules).toEqual([TAB_STYLES.underline.rule]);
    expect(underline.rules![0]).toMatch(/background-color: transparent;/);

    expect(nexoraTheme('nexora-friendly').rules).toContain(TAB_STYLES.pill.rule);
    const css = renderTheme(customTheme('nexora-friendly', set({ tabs: 'underline' }), 'x'));
    expect(css.lastIndexOf('background-color: transparent;')).toBeGreaterThan(
      css.indexOf('background-color: var(--slotted-tone-accent-surface);'),
    );
  });

  /**
   * An axis moves every token of its kind a theme of the catalogue sets: a
   * corner, a face, a line weight or a shadow a theme wrote on one family
   * follows the builder too, so no theme keeps a corner the slider cannot
   * reach. A token that only names a token the axis writes follows it already.
   */
  it('reaches every token of its kind a catalogue theme declares', () => {
    const all = set({
      radius: 10,
      body: 'geist',
      heading: 'geist',
      border: 1,
      shadow: 'soft',
      motion: 'normal',
      cards: 'bordered',
    });
    const overrides = customOverrides(all);
    const reached = new Set([
      ...Object.keys(overrides.base ?? {}),
      ...Object.keys(overrides.components ?? {}),
      ...SCHEMES.flatMap((scheme) => Object.keys(overrides.schemes?.[scheme] ?? {})),
    ]);
    const KINDS = /(radius|font-family|border-width|shadow|duration|easing)$/;
    /* The fixed ends of the radius scale, the loops of indeterminate indicators and the code face. */
    const SKIPPED = /^--slotted-(radius-(none|full)|duration-loop|font-family-mono)/;
    for (const entry of THEME_CATALOGUE) {
      const theme = nexoraTheme(entry.id);
      const declared: [string, string][] = [
        ...Object.entries(theme.base ?? {}),
        ...Object.entries(theme.components ?? {}),
        ...(['light', 'dark'] as const).flatMap((scheme) =>
          Object.entries(theme.schemes?.[scheme] ?? {}),
        ),
      ];
      const follows = (value: string) => {
        const named = /^var\((--slotted-[a-z0-9-]+)\)$/.exec(value)?.[1];
        return named !== undefined && reached.has(named);
      };
      expect(
        declared
          .filter(([token]) => KINDS.test(token) && !SKIPPED.test(token))
          .filter(([token, value]) => !reached.has(token) && !follows(value))
          .map(([token]) => token),
        entry.id,
      ).toEqual([]);
    }
  });
});
