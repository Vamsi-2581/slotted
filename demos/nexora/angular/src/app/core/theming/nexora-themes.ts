import {
  applyTheme,
  extendTheme,
  SCHEMES,
  type Density,
  type Derivation,
  type Recipe,
  type Scheme,
  type Theme,
  type ThemeOverrides,
} from '@slotted/theme';
import defaultTheme from '@slotted/themes/default';

import { facesOf, fontFamily } from './theme-faces';
import { catalogueTheme, DEFAULT_THEME_ID } from './theme-catalogue';

/**
 * The definitions of the catalogue in `theme-catalogue.ts`. Each one is built
 * on the library's own theme with `extendTheme`, and each one writes every
 * layer of the model:
 *
 * - `seeds` — its five colours;
 * - `recipe` — the library's derivations with some of them moved: richer or
 *   quieter tints, darker grounds or ink lines at the library's share of the
 *   neutral's chroma, an accent drawn as a light solid under dark ink. A
 *   ground, a line and a hover keep one neutral family: no theme gives one of
 *   them another share of the seed's chroma or another hue;
 * - `base` — the type scale, the weights, the spacing rhythm, the corners,
 *   the line weights and the motion;
 * - `schemes` — the shadows and the chart palette of each scheme;
 * - `densities` — the controls' heights, insets and sizes;
 * - `components` — the families' own tokens: cards, stat cards, tables, tabs,
 *   badges, alerts, charts, select panels;
 * - `rules` — what no token reaches, selecting only the families' attributes;
 * - `fonts` — the `@font-face` of the face it brings.
 *
 * This module is loaded with `import()` and nothing imports it statically from
 * the initial bundle: `extendTheme` validates against the whole token contract
 * and the default theme object comes with it (LIBRARY-FEEDBACK.md, row "a
 * theme built at runtime").
 */

type Edits = Partial<Record<Scheme, Readonly<Record<string, Derivation>>>>;

/** The library's recipe with `edits` laid over it, scheme by scheme. */
function recipe(...edits: Edits[]): Recipe {
  return Object.fromEntries(
    SCHEMES.map((scheme) => [
      scheme,
      Object.assign({}, defaultTheme.recipe[scheme], ...edits.map((edit) => edit[scheme] ?? {})),
    ]),
  ) as Recipe;
}

/**
 * The library's derivation of `token` at another lightness. The share of the
 * seed's chroma and its ceiling stay the library's, so a ground, a line and a
 * hover moved this way keep one neutral family: the same hue, the same share.
 */
function relight(scheme: Scheme, token: string, l: number): Derivation {
  const rule = defaultTheme.recipe[scheme][token];
  if (rule === undefined || !('seed' in rule))
    throw new Error(`${scheme} ${token} is not a seed derivation`);
  return { ...rule, l };
}

/** The library's derivation of `token` with `factor` times its share of the seed's chroma. */
function rescale(scheme: Scheme, token: string, factor: number): Derivation {
  const rule = defaultTheme.recipe[scheme][token];
  if (rule === undefined || !('seed' in rule))
    throw new Error(`${scheme} ${token} is not a seed derivation`);
  return { ...rule, c: { scale: rule.c.scale * factor, max: rule.c.max } };
}

/** The given parts of the given tones' soft grounds at `factor` times the library's chroma. */
const tints = (
  tones: readonly string[],
  factor: number,
  parts: readonly string[] = ['surface', 'subtle-hover', 'subtle-active'],
): Edits =>
  Object.fromEntries(
    (['light', 'dark'] as const).map((scheme) => [
      scheme,
      Object.fromEntries(
        tones.flatMap((tone) =>
          parts.map((part) => {
            const token = `--slotted-tone-${tone}-${part}`;
            return [token, rescale(scheme, token, factor)];
          }),
        ),
      ),
    ]),
  );

/**
 * The accent drawn the way the library draws the warning: a light solid under
 * dark ink, calibrated over the same seed grid. The text, the border and the
 * surfaces of the accent stay the accent's own.
 */
const LIGHT_SOLID_ACCENT: Edits = Object.fromEntries(
  SCHEMES.map((scheme) => [
    scheme,
    Object.fromEntries(
      ['solid', 'solid-hover', 'solid-active', 'on-solid'].map((state) => {
        const rule = defaultTheme.recipe[scheme][`--slotted-tone-warning-${state}`]!;
        const accent: Derivation =
          'seed' in rule
            ? { ...rule, seed: 'accent' }
            : 'mix' in rule
              ? { ...rule, mix: rule.mix.replace('-warning-', '-accent-') }
              : { alias: rule.alias.replace('-warning-', '-accent-') };
        return [`--slotted-tone-accent-${state}`, accent];
      }),
    ),
  ]),
);

/**
 * The two ways a theme draws the line tabs' selected item: underlined by the
 * family's marker on its track, or a pill on the accent's surface with no
 * marker and no track. Each is the marker's and the track's tokens and the
 * one rule no token reaches, and each rule undoes the other's: the later of
 * the two in `slotted.theme-rules` wins, so the builder's choice holds over a
 * theme's own.
 */
export const TAB_STYLES = {
  underline: {
    components: {
      '--slotted-tabs-marker-color': 'var(--slotted-tone-accent-solid)',
      '--slotted-tabs-hover-marker-color': 'var(--slotted-border-strong)',
      '--slotted-tabs-track-color': 'var(--slotted-border-subtle)',
    },
    rule: `[data-ui='tabs'][data-variant='line'] [data-part='item'][data-selected] {
  background-color: transparent;
  border-radius: 0;
}`,
  },
  pill: {
    components: {
      '--slotted-tabs-marker-color': 'transparent',
      '--slotted-tabs-hover-marker-color': 'transparent',
      '--slotted-tabs-track-color': 'transparent',
    },
    rule: `[data-ui='tabs'][data-variant='line'] [data-part='item'][data-selected] {
  background-color: var(--slotted-tone-accent-surface);
  border-radius: var(--slotted-radius-full);
}`,
  },
} as const;

/** The library's type sizes, in rem, from xs to 4xl. */
const SIZE_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;
const sizes = (rem: readonly number[]) =>
  Object.fromEntries(
    SIZE_STEPS.map((step, index) => [`--slotted-font-size-${step}`, `${rem[index]}rem`]),
  );
const lineHeights = (values: readonly number[]) =>
  Object.fromEntries(
    SIZE_STEPS.map((step, index) => [`--slotted-line-height-${step}`, String(values[index])]),
  );
/** The spacing scale from step 1 to 12, in rem. */
const spaces = (rem: readonly number[]) =>
  Object.fromEntries(rem.map((value, index) => [`--slotted-space-${index + 1}`, `${value}rem`]));
const radii = (xs: number, sm: number, md: number, lg: number) => ({
  '--slotted-radius-xs': `${xs}px`,
  '--slotted-radius-sm': `${sm}px`,
  '--slotted-radius-md': `${md}px`,
  '--slotted-radius-lg': `${lg}px`,
});
const durations = (short: string, medium: string, long: string) => ({
  '--slotted-duration-short': short,
  '--slotted-duration-medium': medium,
  '--slotted-duration-long': long,
});
const shadows = (xs: string, sm: string, md: string, lg: string, control: string) => ({
  '--slotted-shadow-xs': xs,
  '--slotted-shadow-sm': sm,
  '--slotted-shadow-md': md,
  '--slotted-shadow-lg': lg,
  '--slotted-control-shadow': control,
});
const palette = (colors: readonly string[]) =>
  Object.fromEntries(colors.map((color, index) => [`--slotted-data-${index + 1}`, color]));

type DensityValues = NonNullable<ThemeOverrides['densities']>[Density];
/** Each density of the library's, with `change` applied to its pixel values. */
function densities(change: (token: string, px: number, density: Density) => number) {
  const out: Partial<Record<Density, DensityValues>> = {};
  for (const [density, values] of Object.entries(defaultTheme.densities ?? {}) as [
    Density,
    Record<string, string>,
  ][]) {
    out[density] = Object.fromEntries(
      Object.entries(values)
        .filter(([token]) => token.startsWith('--slotted-control-'))
        .map(([token, value]) => [
          token,
          `${Math.round(change(token, Number.parseFloat(value), density) * 100) / 100}px`,
        ]),
    ) as DensityValues;
  }
  return out;
}

/**
 * Friendly: everything a control is becomes a pill, the type is Nunito at
 * 112 % of the library's sizes, the space a step looser, the shadows wide and
 * tinted with the rose, the motion a little springy. A rose-grey neutral
 * tints every ground, line and hover alike, the accent's hovers carry two
 * and a half times the library's tint, cards float on a shadow without a
 * line, and tabs are pills too.
 */
const friendly = extendTheme(
  defaultTheme,
  {
    seeds: {
      accent: '#e0457b',
      neutral: '#a0687a',
      success: '#16a37a',
      warning: '#f59e0b',
      danger: '#e5484d',
    },
    recipe: recipe(tints(['accent'], 2.5, ['subtle-hover', 'subtle-active'])),
    base: {
      '--slotted-font-family-sans': fontFamily('nunito').stack,
      ...sizes([0.84, 0.91, 0.98, 1.12, 1.26, 1.4, 1.68, 2.24]),
      ...lineHeights([1.5, 1.55, 1.6, 1.55, 1.45, 1.35, 1.25, 1.15]),
      '--slotted-font-weight-medium': '600',
      '--slotted-font-weight-semibold': '750',
      ...spaces([0.125, 0.25, 0.4375, 0.5625, 0.875, 1.125, 1.5, 1.75, 2.25, 2.75, 3.5, 4.5]),
      ...radii(6, 10, 14, 20),
      '--slotted-control-radius': 'var(--slotted-radius-full)',
      ...durations('180ms', '280ms', '420ms'),
      '--slotted-easing-standard': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      '--slotted-easing-enter': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--slotted-easing-emphasized': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--slotted-selection-size-sm': '16px',
      '--slotted-selection-size-md': '18px',
      '--slotted-selection-size-lg': '20px',
      '--slotted-selection-halo-opacity': '0.18',
    },
    schemes: {
      light: {
        ...shadows(
          '0 1px 2px rgb(190 70 110 / 0.08)',
          '0 2px 6px -1px rgb(190 70 110 / 0.12), 0 1px 2px rgb(190 70 110 / 0.06)',
          '0 10px 24px -8px rgb(190 70 110 / 0.22), 0 3px 8px -3px rgb(190 70 110 / 0.10)',
          '0 22px 48px -14px rgb(190 70 110 / 0.30), 0 8px 18px -8px rgb(190 70 110 / 0.12)',
          '0 2px 6px -2px rgb(190 70 110 / 0.25)',
        ),
        '--slotted-scrim': 'rgb(80 30 50 / 0.35)',
        ...palette([
          '#d6336c',
          '#f76707',
          '#0ca678',
          '#7048e8',
          '#f59f00',
          '#1c7ed6',
          '#74b816',
          '#ae3ec9',
        ]),
      },
      dark: {
        ...shadows(
          '0 1px 3px rgb(0 0 0 / 0.40)',
          '0 4px 10px -2px rgb(0 0 0 / 0.50)',
          '0 14px 30px -10px rgb(0 0 0 / 0.65), 0 4px 10px -4px rgb(0 0 0 / 0.40)',
          '0 28px 56px -16px rgb(0 0 0 / 0.75), 0 10px 20px -10px rgb(0 0 0 / 0.45)',
          '0 2px 8px -2px rgb(0 0 0 / 0.55)',
        ),
        '--slotted-scrim': 'rgb(20 8 14 / 0.6)',
        ...palette([
          '#f06595',
          '#ff922b',
          '#38d9a9',
          '#9775fa',
          '#fcc419',
          '#4dabf7',
          '#a9e34b',
          '#da77f2',
        ]),
      },
      'high-contrast': {
        ...palette([
          '#a61e4d',
          '#b23a0b',
          '#087f5b',
          '#5f3dc4',
          '#8f5b00',
          '#1864ab',
          '#4d7c0f',
          '#862e9c',
        ]),
      },
    },
    densities: densities((token, px) => {
      if (token.includes('font-size')) return px * 1.12;
      if (token.includes('height') || token.includes('padding-inline')) return px + 4;
      if (token.includes('icon-size') || token.includes('gap')) return px + 2;
      return px;
    }),
    components: {
      '--slotted-card-border-width': '0px',
      '--slotted-card-shadow': 'var(--slotted-shadow-md)',
      '--slotted-card-shadow-hover': 'var(--slotted-shadow-lg)',
      '--slotted-card-padding-block': 'var(--slotted-space-7)',
      '--slotted-card-padding-inline': 'var(--slotted-space-7)',
      '--slotted-stat-card-border-width': '0px',
      '--slotted-stat-card-shadow': 'var(--slotted-shadow-md)',
      '--slotted-stat-card-padding-block': 'var(--slotted-space-7)',
      '--slotted-stat-card-padding-inline': 'var(--slotted-space-7)',
      '--slotted-badge-radius': 'var(--slotted-radius-full)',
      '--slotted-badge-font-weight': 'var(--slotted-font-weight-semibold)',
      ...TAB_STYLES.pill.components,
      '--slotted-table-radius': 'var(--slotted-radius-lg)',
      '--slotted-table-header-surface': 'var(--slotted-tone-accent-surface)',
      '--slotted-alert-radius': 'var(--slotted-radius-lg)',
      '--slotted-alert-border-width': '0px',
      '--slotted-select-content-radius': 'var(--slotted-radius-lg)',
      '--slotted-chart-bar-radius': 'var(--slotted-radius-sm)',
      '--slotted-chart-line-width': '3px',
      '--slotted-chart-marker-size': '10px',
      '--slotted-chart-card-radius': 'var(--slotted-radius-lg)',
    },
    rules: [
      TAB_STYLES.pill.rule,
      `[data-ui='button']:active {
  transform: scale(0.97);
}`,
    ],
    fonts: facesOf('nunito'),
  },
  { name: 'nexora-friendly' },
);

/**
 * Brutalist: no corner anywhere, every line 2 px and in ink, shadows hard and
 * offset in the ink of the scheme, Inter for the text and JetBrains Mono for
 * the headings on a steep scale, labels in spaced capitals, and no motion. The accent is a yellow
 * solid under black ink; the table's head is a band of it.
 */
const brutalist = extendTheme(
  defaultTheme,
  {
    seeds: {
      accent: '#ffd400',
      neutral: '#5e5e68',
      success: '#00a651',
      warning: '#ff7a00',
      danger: '#e5141e',
    },
    recipe: recipe(LIGHT_SOLID_ACCENT, {
      light: {
        '--slotted-border-subtle': relight('light', '--slotted-border-subtle', 0.32),
        '--slotted-control-border-color': relight('light', '--slotted-control-border-color', 0.28),
        '--slotted-border-strong': relight('light', '--slotted-border-strong', 0.16),
      },
      dark: {
        '--slotted-surface': relight('dark', '--slotted-surface', 0.13),
        '--slotted-surface-raised': relight('dark', '--slotted-surface-raised', 0.17),
        '--slotted-surface-sunken': relight('dark', '--slotted-surface-sunken', 0.1),
        '--slotted-border-subtle': relight('dark', '--slotted-border-subtle', 0.74),
        '--slotted-control-border-color': relight('dark', '--slotted-control-border-color', 0.8),
        '--slotted-border-strong': relight('dark', '--slotted-border-strong', 0.93),
      },
    }),
    base: {
      '--slotted-font-family-sans': fontFamily('inter').stack,
      '--slotted-font-family-mono': fontFamily('jetbrains-mono').stack,
      '--slotted-font-family-heading': fontFamily('jetbrains-mono').stack,
      ...sizes([0.75, 0.8125, 0.875, 1.0625, 1.25, 1.5, 1.875, 2.5]),
      ...lineHeights([1.35, 1.4, 1.45, 1.35, 1.2, 1.15, 1.1, 1.05]),
      '--slotted-font-weight-medium': '600',
      '--slotted-font-weight-semibold': '800',
      ...spaces([0.125, 0.25, 0.375, 0.5, 0.75, 1.125, 1.375, 1.75, 2.25, 2.75, 3.5, 4.5]),
      ...radii(0, 0, 0, 0),
      '--slotted-border-width-thin': '2px',
      '--slotted-border-width-medium': '2px',
      '--slotted-border-width-thick': '3px',
      ...durations('1ms', '1ms', '1ms'),
      '--slotted-selection-halo-opacity': '0',
      '--slotted-highlight-tint-opacity': '0.14',
    },
    schemes: {
      light: {
        ...shadows(
          '2px 2px 0 var(--slotted-text)',
          '3px 3px 0 var(--slotted-text)',
          '5px 5px 0 var(--slotted-text)',
          '8px 8px 0 var(--slotted-text)',
          '3px 3px 0 var(--slotted-text)',
        ),
        '--slotted-scrim': 'rgb(0 0 0 / 0.7)',
        ...palette([
          '#111111',
          '#e63312',
          '#1f4bd8',
          '#e0a100',
          '#00994a',
          '#7a7a7a',
          '#9b1fd8',
          '#0090ad',
        ]),
      },
      dark: {
        ...shadows(
          '2px 2px 0 var(--slotted-text)',
          '3px 3px 0 var(--slotted-text)',
          '5px 5px 0 var(--slotted-text)',
          '8px 8px 0 var(--slotted-text)',
          '3px 3px 0 var(--slotted-text)',
        ),
        '--slotted-scrim': 'rgb(0 0 0 / 0.8)',
        ...palette([
          '#ffd400',
          '#ff5a36',
          '#5b8cff',
          '#f5f5f5',
          '#2ee87a',
          '#a3a3a3',
          '#c77dff',
          '#29d3f2',
        ]),
      },
      'high-contrast': {
        ...shadows(
          '2px 2px 0 #000000',
          '3px 3px 0 #000000',
          '5px 5px 0 #000000',
          '8px 8px 0 #000000',
          '3px 3px 0 #000000',
        ),
        ...palette([
          '#000000',
          '#b3200a',
          '#1238a8',
          '#8a5a00',
          '#006b32',
          '#4a4a4a',
          '#6a0fa0',
          '#006f86',
        ]),
      },
    },
    densities: densities((token, px) => {
      if (token.includes('height')) return px + 2;
      if (token.includes('padding-inline')) return px + 4;
      return px;
    }),
    components: {
      '--slotted-card-border-color': 'var(--slotted-border-strong)',
      '--slotted-card-shadow': 'var(--slotted-shadow-md)',
      '--slotted-card-shadow-hover': 'var(--slotted-shadow-lg)',
      '--slotted-stat-card-border-color': 'var(--slotted-border-strong)',
      '--slotted-stat-card-shadow': 'var(--slotted-shadow-sm)',
      '--slotted-stat-card-value-font-size': 'var(--slotted-font-size-3xl)',
      '--slotted-badge-radius': 'var(--slotted-radius-xs)',
      '--slotted-badge-border-width': 'var(--slotted-border-width-thin)',
      '--slotted-badge-font-family': 'var(--slotted-font-family-mono)',
      '--slotted-badge-font-weight': 'var(--slotted-font-weight-semibold)',
      '--slotted-tabs-marker-color': 'var(--slotted-text)',
      '--slotted-tabs-selected-color': 'var(--slotted-text)',
      '--slotted-tabs-track-color': 'var(--slotted-border-strong)',
      '--slotted-table-border-color': 'var(--slotted-border-strong)',
      '--slotted-table-header-surface': 'var(--slotted-tone-accent-solid)',
      '--slotted-alert-title-font-family': 'var(--slotted-font-family-mono)',
      '--slotted-chart-bar-radius': 'var(--slotted-radius-none)',
      '--slotted-chart-line-width': '3px',
      '--slotted-chart-grid-color': 'var(--slotted-border-subtle)',
      '--slotted-select-content-shadow': 'var(--slotted-shadow-md)',
      '--slotted-select-content-border-color': 'var(--slotted-border-strong)',
    },
    rules: [
      `[data-ui='button'],
[data-ui='badge'],
[data-ui='tabs'] [data-part='tab'],
[data-ui='table'] [data-part='column-header'] {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

[data-ui='table'] [data-part='column-header'] {
  color: var(--slotted-tone-accent-on-solid);
}

[data-ui='badge'][data-shape='pill'] {
  border-radius: var(--slotted-badge-radius);
}

[data-ui='button']:active {
  box-shadow: none;
  transform: translate(3px, 3px);
}`,
    ],
    fonts: facesOf('inter', 'jetbrains-mono'),
  },
  { name: 'nexora-brutalist' },
);

/**
 * Editorial: Source Serif for the text and Fraunces for the headings on a
 * wide scale, the space a quarter looser, hairline corners, no shadow at
 * all, a stone neutral that warms every ground and line alike, status tints
 * at half the library's chroma, and a wine accent. Cards are open and airy,
 * the table's head carries no band, tabs are underlined in ink, and badges
 * and column heads are set in small capitals.
 *
 * A text field is a ruled line, as on a printed form: the field has no
 * ground, and its line is in ink, darker under the pointer and in the danger
 * border when invalid, at 3:1 or more on its ground in every scheme (the
 * family's tokens); the line is only the bottom edge, with no corner
 * whatever corner the builder chooses, focus thickens it in the ring's
 * colour behind a transparent outline that forced colours paint, and an
 * invalid field takes the danger tint under its line (rules). The family
 * points the ring's colour at the invalid one on an invalid field, so focus
 * on it draws the line in that colour. Every other control keeps the
 * library's ring.
 */
const editorial = extendTheme(
  defaultTheme,
  {
    seeds: {
      accent: '#8a1538',
      neutral: '#8a7658',
      success: '#3f6b3a',
      warning: '#b06d00',
      danger: '#a3231f',
    },
    recipe: recipe(tints(['success', 'warning', 'danger'], 0.5)),
    base: {
      '--slotted-font-family-sans': fontFamily('source-serif').stack,
      '--slotted-font-family-heading': fontFamily('fraunces').stack,
      ...sizes([0.75, 0.8125, 0.9375, 1.0625, 1.3125, 1.625, 2.125, 2.875]),
      ...lineHeights([1.5, 1.55, 1.65, 1.6, 1.35, 1.25, 1.15, 1.08]),
      ...spaces([0.125, 0.25, 0.375, 0.5, 0.9375, 1.25, 1.5625, 1.875, 2.5, 3.125, 3.75, 5]),
      ...radii(1, 2, 3, 4),
      ...durations('160ms', '260ms', '400ms'),
      '--slotted-easing-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
      '--slotted-control-font-weight': 'var(--slotted-font-weight-medium)',
    },
    schemes: {
      light: {
        ...shadows('none', 'none', 'none', 'none', 'none'),
        '--slotted-scrim': 'rgb(40 30 20 / 0.4)',
        ...palette([
          '#8a1538',
          '#2f4f6f',
          '#b7791f',
          '#5b7a3a',
          '#6b5b7b',
          '#a0522d',
          '#3f7f7a',
          '#7a6a58',
        ]),
      },
      dark: {
        ...shadows('none', 'none', 'none', 'none', 'none'),
        '--slotted-scrim': 'rgb(10 8 6 / 0.65)',
        ...palette([
          '#d4708a',
          '#86a8cc',
          '#e0a84f',
          '#9fbf7a',
          '#b3a0c7',
          '#d9895e',
          '#7fbfb8',
          '#bfae99',
        ]),
      },
      'high-contrast': {
        ...palette([
          '#6b0f28',
          '#1d3550',
          '#7a4f0e',
          '#3b5222',
          '#4a3d57',
          '#72381c',
          '#255450',
          '#4f4437',
        ]),
      },
    },
    densities: densities((token, px) => {
      if (token.includes('height')) return px + 2;
      if (token.includes('padding-inline')) return px + 3;
      if (token.includes('font-size')) return px + 1;
      return px;
    }),
    components: {
      '--slotted-card-padding-block': 'var(--slotted-space-8)',
      '--slotted-card-padding-inline': 'var(--slotted-space-8)',
      '--slotted-card-region-gap': 'var(--slotted-space-5)',
      '--slotted-stat-card-padding-block': 'var(--slotted-space-7)',
      '--slotted-stat-card-padding-inline': 'var(--slotted-space-7)',
      '--slotted-stat-card-value-font-size': 'var(--slotted-font-size-4xl)',
      '--slotted-stat-card-value-line-height': 'var(--slotted-line-height-4xl)',
      '--slotted-table-header-surface': 'transparent',
      '--slotted-table-border-color': 'var(--slotted-border-strong)',
      '--slotted-table-row-min-block-size': '44px',
      '--slotted-tabs-marker-color': 'var(--slotted-text)',
      '--slotted-tabs-selected-color': 'var(--slotted-text)',
      '--slotted-badge-radius': 'var(--slotted-radius-xs)',
      '--slotted-badge-font-weight': 'var(--slotted-font-weight-regular)',
      '--slotted-alert-title-font-family': 'var(--slotted-font-family-heading)',
      '--slotted-chart-bar-radius': 'var(--slotted-radius-xs)',
      '--slotted-chart-line-width': '1.5px',
      '--slotted-section-heading-size-md': 'var(--slotted-font-size-2xl)',
      '--slotted-text-field-background': 'transparent',
      '--slotted-text-field-border-color': 'var(--slotted-border-strong)',
      '--slotted-text-field-hover-border-color': 'var(--slotted-text)',
      '--slotted-text-field-invalid-border-color': 'var(--slotted-tone-danger-border)',
    },
    rules: [
      `[data-ui='badge'],
[data-ui='table'] [data-part='column-header'],
[data-ui='tabs'] [data-part='tab'] {
  font-variant-caps: all-small-caps;
  letter-spacing: 0.04em;
}

[data-ui='badge'][data-shape='pill'] {
  border-radius: var(--slotted-badge-radius);
}

[data-ui='text-field'][data-part='root']:not([data-variant='plain']) {
  border-radius: var(--slotted-radius-none);
  border-width: 0 0 var(--slotted-control-border-width);
}

[data-ui='text-field'][data-part='root']:has(> [data-part='input']:focus-visible) {
  border-block-end-color: var(--slotted-focus-ring-color);
  box-shadow: inset 0 calc(-1 * var(--slotted-border-width-thick)) 0 var(--slotted-focus-ring-color);
  outline: var(--slotted-border-width-thick) solid transparent;
}

[data-ui='text-field'][data-part='root'][data-invalid] {
  background-color: var(--slotted-tone-danger-surface);
}`,
    ],
    fonts: facesOf('source-serif', 'fraunces'),
  },
  { name: 'nexora-editorial' },
);

/**
 * Terminal: JetBrains Mono for everything, a small flat scale, spacing three
 * quarters of the library's, 2 px corners, and a phosphor-green solid under
 * dark ink. Built for the dark scheme — grounds darker than the library's in
 * a green-grey neutral, a glow in the
 * accent for elevation, a neon chart — while light and high contrast keep
 * every floor. Labels are lower case; the selected tab reads as a prompt,
 * which stays out of its accessible name; striped tables band their rows in
 * a ground mixed from the theme's own line.
 */
const terminal = extendTheme(
  defaultTheme,
  {
    seeds: {
      accent: '#3ddc5f',
      neutral: '#2f6b66',
      success: '#00b8a9',
      warning: '#ffb000',
      danger: '#ff4d5e',
    },
    recipe: recipe(LIGHT_SOLID_ACCENT, {
      dark: {
        '--slotted-surface': relight('dark', '--slotted-surface', 0.155),
        '--slotted-surface-raised': relight('dark', '--slotted-surface-raised', 0.185),
        '--slotted-surface-sunken': relight('dark', '--slotted-surface-sunken', 0.125),
      },
    }),
    base: {
      '--slotted-font-family-mono': fontFamily('jetbrains-mono').stack,
      '--slotted-font-family-sans': fontFamily('jetbrains-mono').stack,
      ...sizes([0.6875, 0.75, 0.8125, 0.875, 1, 1.125, 1.25, 1.5]),
      ...lineHeights([1.35, 1.4, 1.45, 1.4, 1.3, 1.25, 1.2, 1.15]),
      '--slotted-font-weight-semibold': '700',
      ...spaces([0.0625, 0.1875, 0.25, 0.375, 0.5, 0.75, 0.875, 1, 1.25, 1.5, 2, 2.5]),
      ...radii(1, 2, 2, 2),
      ...durations('80ms', '120ms', '180ms'),
      '--slotted-easing-standard': 'linear',
      '--slotted-easing-enter': 'cubic-bezier(0, 0, 0.2, 1)',
      '--slotted-easing-emphasized': 'cubic-bezier(0, 0, 0.2, 1)',
      '--slotted-control-font-weight': 'var(--slotted-font-weight-medium)',
    },
    schemes: {
      light: {
        ...shadows(
          'none',
          '0 0 0 1px var(--slotted-border-subtle)',
          '0 0 0 1px var(--slotted-border-strong)',
          '0 0 0 1px var(--slotted-border-strong), 0 12px 24px -12px rgb(0 0 0 / 0.3)',
          'none',
        ),
        '--slotted-scrim': 'rgb(0 20 10 / 0.5)',
        ...palette([
          '#0a8f2a',
          '#0086a8',
          '#c000a0',
          '#b36b00',
          '#6a2cff',
          '#d42a2a',
          '#5f8a00',
          '#00875a',
        ]),
      },
      dark: {
        ...shadows(
          '0 0 0 1px color-mix(in oklch, var(--slotted-tone-accent-solid) 14%, transparent)',
          '0 0 0 1px color-mix(in oklch, var(--slotted-tone-accent-solid) 22%, transparent), 0 0 8px color-mix(in oklch, var(--slotted-tone-accent-solid) 10%, transparent)',
          '0 0 0 1px color-mix(in oklch, var(--slotted-tone-accent-solid) 32%, transparent), 0 0 16px color-mix(in oklch, var(--slotted-tone-accent-solid) 16%, transparent)',
          '0 0 0 1px color-mix(in oklch, var(--slotted-tone-accent-solid) 40%, transparent), 0 0 32px color-mix(in oklch, var(--slotted-tone-accent-solid) 22%, transparent)',
          'none',
        ),
        '--slotted-scrim': 'rgb(0 10 4 / 0.7)',
        ...palette([
          '#39ff14',
          '#00e5ff',
          '#ff2bd6',
          '#ffb000',
          '#a66cff',
          '#ff5f5f',
          '#c6ff00',
          '#00ffa3',
        ]),
      },
      'high-contrast': {
        ...palette([
          '#005c00',
          '#005a73',
          '#86006f',
          '#7a4900',
          '#4b14c9',
          '#9e1414',
          '#3f5c00',
          '#005c3d',
        ]),
      },
    },
    densities: densities((token, px) => {
      /* The contract's floor: a control is never below the 24 px target. */
      if (token.includes('height')) return Math.max(24, px - 6);
      if (token.includes('padding-inline')) return px - 3;
      if (token.includes('gap')) return Math.max(2, px - 2);
      return px;
    }),
    components: {
      '--slotted-card-border-color': 'var(--slotted-border-strong)',
      '--slotted-card-padding-block': 'var(--slotted-space-6)',
      '--slotted-card-padding-inline': 'var(--slotted-space-6)',
      '--slotted-stat-card-border-color': 'var(--slotted-border-strong)',
      '--slotted-stat-card-value-font-size': 'var(--slotted-font-size-3xl)',
      '--slotted-table-header-surface': 'transparent',
      '--slotted-table-row-min-block-size': '28px',
      '--slotted-table-cell-padding-inline': 'var(--slotted-space-5)',
      '--slotted-table-row-surface-stripe':
        'color-mix(in oklab, var(--slotted-border-subtle) 45%, var(--slotted-surface))',
      '--slotted-tabs-marker-color': 'var(--slotted-tone-accent-text)',
      '--slotted-tabs-selected-color': 'var(--slotted-tone-accent-text)',
      '--slotted-badge-radius': 'var(--slotted-radius-xs)',
      '--slotted-badge-font-weight': 'var(--slotted-font-weight-regular)',
      '--slotted-alert-border-width': 'var(--slotted-border-width-thin)',
      '--slotted-chart-bar-radius': 'var(--slotted-radius-none)',
      '--slotted-chart-line-width': '1.5px',
      '--slotted-chart-marker-size': '6px',
      '--slotted-select-content-shadow': 'var(--slotted-shadow-lg)',
    },
    rules: [
      `[data-ui='button'],
[data-ui='tabs'] [data-part='tab'],
[data-ui='table'] [data-part='column-header'] {
  text-transform: lowercase;
}

[data-ui='tabs'] [data-part='item'][data-selected] [data-part='label']::before {
  content: '> ' / '';
}

[data-ui='badge'][data-shape='pill'] {
  border-radius: var(--slotted-badge-radius);
}`,
    ],
    fonts: facesOf('jetbrains-mono'),
  },
  { name: 'nexora-terminal' },
);

const THEMES: Readonly<Record<string, Theme>> = {
  [DEFAULT_THEME_ID]: defaultTheme,
  'nexora-friendly': friendly,
  'nexora-brutalist': brutalist,
  'nexora-editorial': editorial,
  'nexora-terminal': terminal,
};

/** The definition of a catalogue theme, or the default's when the catalogue no longer has it. */
export function nexoraTheme(id: string): Theme {
  return THEMES[catalogueTheme(id).id]!;
}

/** Compiles a runtime theme's sheet into `document`; the returned function removes it. */
export function applyNexoraTheme(id: string, document: Document): () => void {
  return applyTheme(nexoraTheme(id), { document });
}
