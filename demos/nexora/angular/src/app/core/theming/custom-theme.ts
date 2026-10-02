import {
  applyTheme,
  extendTheme,
  type Density,
  type FontFaceDefinition,
  type Theme,
  type ThemeOverrides,
} from '@slotted/theme';
import defaultTheme from '@slotted/themes/default';

import type { Customisation, FontId } from './customisation';
import { nexoraTheme } from './nexora-themes';
import { facesOf, fontFamily } from './theme-faces';

/**
 * The builder: a customisation is compiled into a theme by `extendTheme` on
 * the chosen catalogue theme, so the result is a theme of the same shape as
 * the five it starts from, validated against the same contract and written
 * by the same `renderTheme`. Each axis writes one set of tokens:
 *
 * | axis | tokens |
 * | --- | --- |
 * | radius | `--slotted-radius-xs…lg` as ¼, ½, ¾ and 1 of the value; `--slotted-control-radius`; the corner of every family a theme sets |
 * | body | `--slotted-font-family-sans`, `--slotted-control-font-family`, the badge's face; the family's `@font-face` |
 * | heading | `--slotted-font-family-heading`, the alert title's face; the family's `@font-face` |
 * | scale | `--slotted-font-size-xs…4xl` and each density's `--slotted-control-font-size-*`, as a share of the library's |
 * | border | `--slotted-border-width-thin`, `-medium`, `-thick`, `--slotted-control-border-width`, the families' own line widths |
 * | shadow | per light and dark scheme, `--slotted-shadow-xs…lg` and `--slotted-control-shadow`; high contrast keeps its rings |
 * | motion | `--slotted-duration-*` and the easings |
 * | cards | the card's and the stat card's line, shadow and ground |
 * | chart | `--slotted-chart-color-1…8` |
 *
 * An axis writes the whole set, whatever the theme under it declared: a
 * corner the theme set on one family follows the slider too.
 */

type Base = NonNullable<ThemeOverrides['base']>;
type Components = NonNullable<ThemeOverrides['components']>;
type SchemeValues = NonNullable<NonNullable<ThemeOverrides['schemes']>['light']>;
type DensityValues = NonNullable<NonNullable<ThemeOverrides['densities']>[Density]>;

const LIBRARY = defaultTheme.base as Readonly<Record<string, string>>;
const SIZE_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;
const round = (value: number) => Math.round(value * 10_000) / 10_000;

function radius(px: number): { base: Base; components: Components } {
  return {
    base: {
      '--slotted-radius-xs': `${round(px / 4)}px`,
      '--slotted-radius-sm': `${round(px / 2)}px`,
      '--slotted-radius-md': `${round((px * 3) / 4)}px`,
      '--slotted-radius-lg': `${px}px`,
      '--slotted-control-radius': 'var(--slotted-radius-sm)',
    },
    components: {
      '--slotted-card-radius': 'var(--slotted-radius-lg)',
      '--slotted-stat-card-radius': 'var(--slotted-radius-lg)',
      '--slotted-chart-card-radius': 'var(--slotted-radius-lg)',
      '--slotted-chart-bar-radius': 'var(--slotted-radius-sm)',
      '--slotted-badge-radius': 'var(--slotted-radius-sm)',
      '--slotted-table-radius': 'var(--slotted-radius-md)',
      '--slotted-alert-radius': 'var(--slotted-radius-md)',
      '--slotted-select-content-radius': 'var(--slotted-radius-lg)',
    },
  };
}

function body(id: FontId): { base: Base; components: Components; fonts: FontFaceDefinition[] } {
  return {
    base: {
      '--slotted-font-family-sans': fontFamily(id).stack,
      '--slotted-control-font-family': 'var(--slotted-font-family-sans)',
    },
    components: { '--slotted-badge-font-family': 'var(--slotted-control-font-family)' },
    fonts: facesOf(id),
  };
}

function heading(id: FontId): {
  base: Base;
  components: Components;
  fonts: FontFaceDefinition[];
} {
  return {
    base: { '--slotted-font-family-heading': fontFamily(id).stack },
    components: { '--slotted-alert-title-font-family': 'var(--slotted-font-family-heading)' },
    fonts: facesOf(id),
  };
}

function scale(percent: number): {
  base: Base;
  densities: Partial<Record<Density, DensityValues>>;
} {
  const factor = percent / 100;
  const base = Object.fromEntries(
    SIZE_STEPS.map((step) => {
      const token = `--slotted-font-size-${step}`;
      return [token, `${round(Number.parseFloat(LIBRARY[token]!) * factor)}rem`];
    }),
  ) as Base;
  const densities = Object.fromEntries(
    Object.entries(defaultTheme.densities ?? {}).map(([density, values]) => [
      density,
      Object.fromEntries(
        Object.entries(values as Record<string, string>)
          .filter(([token]) => token.startsWith('--slotted-control-font-size-'))
          .map(([token, value]) => [token, `${round(Number.parseFloat(value) * factor)}px`]),
      ),
    ]),
  ) as Partial<Record<Density, DensityValues>>;
  return { base, densities };
}

function border(px: number): { base: Base; components: Components } {
  return {
    base: {
      '--slotted-border-width-thin': `${px}px`,
      '--slotted-border-width-medium': `${px === 1 ? 1.5 : px}px`,
      '--slotted-border-width-thick': `${px + 1}px`,
      '--slotted-control-border-width': 'var(--slotted-border-width-thin)',
    },
    components: {
      '--slotted-badge-border-width': 'var(--slotted-border-width-thin)',
      '--slotted-alert-border-width': 'var(--slotted-border-width-thin)',
      '--slotted-table-border-width': 'var(--slotted-border-width-thin)',
    },
  };
}

const NO_SHADOW: SchemeValues = {
  '--slotted-shadow-xs': 'none',
  '--slotted-shadow-sm': 'none',
  '--slotted-shadow-md': 'none',
  '--slotted-shadow-lg': 'none',
  '--slotted-control-shadow': 'none',
};
const STRONG_SHADOW: Readonly<Record<'light' | 'dark', SchemeValues>> = {
  light: {
    '--slotted-shadow-xs': '0 1px 3px rgb(15 23 42 / 0.14)',
    '--slotted-shadow-sm': '0 3px 8px -1px rgb(15 23 42 / 0.18), 0 1px 3px rgb(15 23 42 / 0.12)',
    '--slotted-shadow-md':
      '0 12px 24px -6px rgb(15 23 42 / 0.25), 0 4px 8px -4px rgb(15 23 42 / 0.15)',
    '--slotted-shadow-lg':
      '0 24px 48px -12px rgb(15 23 42 / 0.35), 0 8px 16px -8px rgb(15 23 42 / 0.20)',
    '--slotted-control-shadow': '0 2px 4px rgb(15 23 42 / 0.14)',
  },
  dark: {
    '--slotted-shadow-xs': '0 1px 3px rgb(0 0 0 / 0.55)',
    '--slotted-shadow-sm': '0 3px 8px -1px rgb(0 0 0 / 0.65), 0 1px 3px rgb(0 0 0 / 0.5)',
    '--slotted-shadow-md': '0 12px 24px -6px rgb(0 0 0 / 0.75), 0 4px 8px -4px rgb(0 0 0 / 0.55)',
    '--slotted-shadow-lg': '0 24px 48px -12px rgb(0 0 0 / 0.85), 0 8px 16px -8px rgb(0 0 0 / 0.6)',
    '--slotted-control-shadow': '0 2px 4px rgb(0 0 0 / 0.6)',
  },
};
const SHADOW_TOKENS = Object.keys(NO_SHADOW);

function shadow(choice: NonNullable<Customisation['shadow']>): ThemeOverrides['schemes'] {
  const values = (scheme: 'light' | 'dark'): SchemeValues => {
    if (choice === 'none') return NO_SHADOW;
    if (choice === 'strong') return STRONG_SHADOW[scheme];
    const library = defaultTheme.schemes?.[scheme] as Readonly<Record<string, string>>;
    return Object.fromEntries(
      SHADOW_TOKENS.map((token) => [token, library[token]!]),
    ) as SchemeValues;
  };
  return { light: values('light'), dark: values('dark') };
}

function motion(choice: NonNullable<Customisation['motion']>): Base {
  const library = (token: string) => LIBRARY[token]!;
  if (choice === 'off') {
    return {
      '--slotted-duration-instant': '1ms',
      '--slotted-duration-short': '1ms',
      '--slotted-duration-medium': '1ms',
      '--slotted-duration-long': '1ms',
    };
  }
  const easings = {
    '--slotted-easing-standard': library('--slotted-easing-standard'),
    '--slotted-easing-exit': library('--slotted-easing-exit'),
  };
  if (choice === 'reduced') {
    return {
      '--slotted-duration-short': '60ms',
      '--slotted-duration-medium': '100ms',
      '--slotted-duration-long': '160ms',
      ...easings,
      '--slotted-easing-enter': 'var(--slotted-easing-standard)',
      '--slotted-easing-emphasized': 'var(--slotted-easing-standard)',
    };
  }
  return {
    ...Object.fromEntries(
      ['instant', 'short', 'medium', 'long'].map((step) => [
        `--slotted-duration-${step}`,
        library(`--slotted-duration-${step}`),
      ]),
    ),
    ...easings,
    '--slotted-easing-enter': library('--slotted-easing-enter'),
    '--slotted-easing-emphasized': library('--slotted-easing-emphasized'),
  };
}

function cards(choice: NonNullable<Customisation['cards']>): Components {
  const line = choice === 'bordered' ? 'var(--slotted-border-width-thin)' : '0px';
  const rest = choice === 'elevated' ? 'var(--slotted-shadow-md)' : 'none';
  const ground =
    choice === 'flat' ? 'var(--slotted-surface-sunken)' : 'var(--slotted-surface-raised)';
  return {
    '--slotted-card-border-width': line,
    '--slotted-card-border-color': 'var(--slotted-border-subtle)',
    '--slotted-card-shadow': rest,
    '--slotted-card-shadow-hover':
      choice === 'elevated'
        ? 'var(--slotted-shadow-lg)'
        : choice === 'flat'
          ? 'none'
          : 'var(--slotted-shadow-xs)',
    '--slotted-card-background': ground,
    '--slotted-stat-card-border-width': line,
    '--slotted-stat-card-border-color': 'var(--slotted-border-subtle)',
    '--slotted-stat-card-shadow': rest,
    '--slotted-stat-card-background': ground,
  };
}

const ACCENT_SERIES = [
  'var(--slotted-tone-accent-solid)',
  'color-mix(in oklch, var(--slotted-tone-accent-solid) 55%, var(--slotted-surface))',
  'var(--slotted-tone-accent-text)',
  'color-mix(in oklch, var(--slotted-tone-accent-solid) 30%, var(--slotted-surface))',
  'var(--slotted-tone-accent-border)',
  'color-mix(in oklch, var(--slotted-tone-accent-text) 60%, var(--slotted-surface))',
  'var(--slotted-text-muted)',
  'var(--slotted-border-strong)',
];

function chart(choice: NonNullable<Customisation['chart']>): Components {
  return Object.fromEntries(
    ACCENT_SERIES.map((accent, index) => [
      `--slotted-chart-color-${index + 1}`,
      choice === 'accent' ? accent : `var(--slotted-data-${index + 1})`,
    ]),
  ) as Components;
}

/** The overrides a customisation writes; an axis left to the theme writes nothing. */
export function customOverrides(customisation: Customisation): ThemeOverrides {
  const base: Record<string, string> = {};
  const components: Record<string, string> = {};
  const fonts: FontFaceDefinition[] = [];
  let schemes: ThemeOverrides['schemes'];
  let densities: ThemeOverrides['densities'];
  if (customisation.radius !== null) {
    const written = radius(customisation.radius);
    Object.assign(base, written.base);
    Object.assign(components, written.components);
  }
  for (const written of [
    customisation.body === null ? null : body(customisation.body),
    customisation.heading === null ? null : heading(customisation.heading),
  ]) {
    if (written === null) continue;
    Object.assign(base, written.base);
    Object.assign(components, written.components);
    fonts.push(...written.fonts.filter((face) => !fonts.includes(face)));
  }
  if (customisation.scale !== null) {
    const written = scale(customisation.scale);
    Object.assign(base, written.base);
    densities = written.densities;
  }
  if (customisation.border !== null) {
    const written = border(customisation.border);
    Object.assign(base, written.base);
    Object.assign(components, written.components);
  }
  if (customisation.shadow !== null) schemes = shadow(customisation.shadow);
  if (customisation.motion !== null) Object.assign(base, motion(customisation.motion));
  if (customisation.cards !== null) Object.assign(components, cards(customisation.cards));
  if (customisation.chart !== null) Object.assign(components, chart(customisation.chart));

  const overrides: { -readonly [K in keyof ThemeOverrides]: ThemeOverrides[K] } = {};
  if (Object.keys(base).length > 0) overrides.base = base as Base;
  if (Object.keys(components).length > 0) overrides.components = components as Components;
  if (fonts.length > 0) overrides.fonts = fonts;
  if (schemes !== undefined) overrides.schemes = schemes;
  if (densities !== undefined) overrides.densities = densities;
  return overrides;
}

/** The theme a customisation of a catalogue theme compiles to, under `name`. */
export function customTheme(themeId: string, customisation: Customisation, name: string): Theme {
  return extendTheme(nexoraTheme(themeId), customOverrides(customisation), { name });
}

/**
 * Compiles a customisation into `document` under `name`. A second call with
 * the same name replaces the sheet in place (`applyTheme`); the returned
 * function removes it while this call is still the latest.
 */
export function applyCustomTheme(
  themeId: string,
  customisation: Customisation,
  name: string,
  document: Document,
): { readonly theme: Theme; readonly dispose: () => void } {
  const theme = customTheme(themeId, customisation, name);
  return { theme, dispose: applyTheme(theme, { document }) };
}
