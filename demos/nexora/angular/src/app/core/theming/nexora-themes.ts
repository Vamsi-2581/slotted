import { applyTheme, extendTheme, type Theme } from '@slotted/theme';
import defaultTheme from '@slotted/themes/default';

import { catalogueTheme, DEFAULT_THEME_ID } from './theme-catalogue';

/**
 * The definitions of the catalogue in `theme-catalogue.ts`. Each one is built
 * on the library's own theme with `extendTheme`; none of them names a family's
 * private property, and the rules select only `data-ui`.
 *
 * This module is loaded with `import()` and nothing imports it statically from
 * the initial bundle: `extendTheme` validates against the whole token contract
 * and the default theme object comes with it (LIBRARY-FEEDBACK.md, row "a
 * theme built at runtime").
 */

const neutral = (id: string) => ({ neutral: catalogueTheme(id).neutral! });

/** Larger radii, diffuse shadows, a rose-taupe neutral. */
const soft = extendTheme(
  defaultTheme,
  {
    seeds: neutral('nexora-soft'),
    base: {
      '--slotted-radius-xs': '4px',
      '--slotted-radius-sm': '8px',
      '--slotted-radius-md': '12px',
      '--slotted-radius-lg': '16px',
    },
    schemes: {
      light: {
        '--slotted-shadow-xs': '0 1px 3px rgb(41 32 24 / 0.05)',
        '--slotted-shadow-sm':
          '0 2px 8px -2px rgb(41 32 24 / 0.08), 0 1px 3px rgb(41 32 24 / 0.05)',
        '--slotted-shadow-md':
          '0 8px 20px -6px rgb(41 32 24 / 0.12), 0 2px 6px -2px rgb(41 32 24 / 0.06)',
        '--slotted-shadow-lg':
          '0 18px 40px -12px rgb(41 32 24 / 0.18), 0 6px 14px -6px rgb(41 32 24 / 0.08)',
      },
      dark: {
        '--slotted-shadow-xs': '0 1px 3px rgb(0 0 0 / 0.35)',
        '--slotted-shadow-sm': '0 2px 8px -2px rgb(0 0 0 / 0.45), 0 1px 3px rgb(0 0 0 / 0.30)',
        '--slotted-shadow-md':
          '0 8px 20px -6px rgb(0 0 0 / 0.55), 0 2px 6px -2px rgb(0 0 0 / 0.35)',
        '--slotted-shadow-lg':
          '0 18px 40px -12px rgb(0 0 0 / 0.65), 0 6px 14px -6px rgb(0 0 0 / 0.40)',
      },
    },
  },
  { name: 'nexora-soft' },
);

/**
 * No radius, tables ruled in the strong border, button and badge labels in
 * spaced capitals. The tracking is the control token, declared on the two
 * families the rule capitalises, so tabs, toggles and segmented controls keep
 * their lower case at the default tracking.
 */
const sharp = extendTheme(
  defaultTheme,
  {
    base: {
      '--slotted-radius-xs': '0px',
      '--slotted-radius-sm': '0px',
      '--slotted-radius-md': '0px',
      '--slotted-radius-lg': '0px',
    },
    components: {
      '--slotted-table-border-color': 'var(--slotted-border-strong)',
      '--slotted-data-grid-border-color': 'var(--slotted-border-strong)',
    },
    rules: [
      `[data-ui='button'],
[data-ui='badge'] {
  --slotted-control-letter-spacing: 0.06em;
  letter-spacing: var(--slotted-control-letter-spacing);
  text-transform: uppercase;
}`,
    ],
  },
  { name: 'nexora-sharp' },
);

/**
 * Serif headings, a looser line, a sage neutral. The heading face is the
 * contract's `--slotted-font-family-heading`, which every heading of the
 * typography family and the title part of twenty families read; the stack is
 * the system's own serif, so no font is downloaded.
 */
const editorial = extendTheme(
  defaultTheme,
  {
    seeds: neutral('nexora-editorial'),
    base: {
      '--slotted-font-family-heading':
        "ui-serif, 'Iowan Old Style', 'Charter', Georgia, Cambria, 'Times New Roman', serif",
      '--slotted-line-height-xs': '1.5',
      '--slotted-line-height-sm': '1.55',
      '--slotted-line-height-md': '1.65',
      '--slotted-line-height-lg': '1.65',
      '--slotted-line-height-xl': '1.5',
    },
  },
  { name: 'nexora-editorial' },
);

const THEMES: Readonly<Record<string, Theme>> = {
  [DEFAULT_THEME_ID]: defaultTheme,
  'nexora-soft': soft,
  'nexora-sharp': sharp,
  'nexora-editorial': editorial,
};

/** The definition of a catalogue theme, or the default's when the catalogue no longer has it. */
export function nexoraTheme(id: string): Theme {
  return THEMES[catalogueTheme(id).id]!;
}

/** Compiles a runtime theme's sheet into `document`; the returned function removes it. */
export function applyNexoraTheme(id: string, document: Document): () => void {
  return applyTheme(nexoraTheme(id), { document });
}
