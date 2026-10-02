import { extendTheme, type Theme } from '@slotted/theme';
import defaultTheme from '@slotted/themes/default';

/**
 * The themes a reader can choose from. Each one is a module built on the
 * library's own theme with `extendTheme`; none of them names a family's
 * private property, and the rules select only `data-ui` and `data-part`.
 *
 * `default` is the stylesheet `styles.css` imports (`@slotted/themes/default.css`);
 * the other three are compiled at runtime by `applyTheme`, each once, the first
 * time it is used (`PreferencesStore.useThemes`), and coexist on the page, each
 * scoped by `data-slotted-theme`.
 */

/** Larger radii, diffuse shadows, a warm neutral. */
const soft = extendTheme(
  defaultTheme,
  {
    seeds: { neutral: '#7d6f63' },
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

/** No radius, tables ruled in the strong border, button labels in spaced capitals. */
const sharp = extendTheme(
  defaultTheme,
  {
    base: {
      '--slotted-radius-xs': '0px',
      '--slotted-radius-sm': '0px',
      '--slotted-radius-md': '0px',
      '--slotted-radius-lg': '0px',
      '--slotted-control-letter-spacing': '0.06em',
    },
    components: {
      '--slotted-table-border-color': 'var(--slotted-border-strong)',
      '--slotted-data-grid-border-color': 'var(--slotted-border-strong)',
    },
    rules: [
      `[data-ui='button'] {
  text-transform: uppercase;
}`,
    ],
  },
  { name: 'nexora-sharp' },
);

/**
 * Serif headings, a looser line, a stone neutral. The contract has no token for
 * a heading face, so the rule writes the system serif stack itself, against
 * ADR 0004's "a theme rule reads only tokens" (LIBRARY-FEEDBACK.md, row "the
 * contract has no token for a heading face"). No font is downloaded.
 */
const editorial = extendTheme(
  defaultTheme,
  {
    seeds: { neutral: '#78716c' },
    base: {
      '--slotted-line-height-xs': '1.5',
      '--slotted-line-height-sm': '1.55',
      '--slotted-line-height-md': '1.65',
      '--slotted-line-height-lg': '1.65',
      '--slotted-line-height-xl': '1.5',
    },
    rules: [
      `[data-ui='page-header'] [data-part='heading'],
[data-ui='section'] [data-part='heading'],
[data-ui='dialog'] [data-part='title'],
[data-ui='drawer'] [data-part='title'],
[data-ui='alert'] [data-part='title'] {
  font-family: ui-serif, 'Iowan Old Style', 'Charter', Georgia, Cambria, 'Times New Roman', serif;
  letter-spacing: 0;
}`,
    ],
  },
  { name: 'nexora-editorial' },
);

export interface NexoraTheme {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly theme: Theme;
}

export const NEXORA_THEMES: readonly NexoraTheme[] = [
  {
    id: 'default',
    label: 'Standard',
    description: 'The library’s own theme: compact radii, quiet shadows.',
    theme: defaultTheme,
  },
  {
    id: 'nexora-soft',
    label: 'Soft',
    description: 'Rounder corners, diffuse shadows and a warm grey.',
    theme: soft,
  },
  {
    id: 'nexora-sharp',
    label: 'Sharp',
    description: 'Square corners, ruled tables and capitalised buttons.',
    theme: sharp,
  },
  {
    id: 'nexora-editorial',
    label: 'Editorial',
    description: 'Serif headings, airier lines and a stone grey.',
    theme: editorial,
  },
];

export const DEFAULT_THEME_ID = 'default';

/**
 * The themes `applyTheme` puts on the page. `default` is left out: its sheet is
 * already in `styles.css`, in the same layer, and a second copy at runtime
 * would repeat the same rules.
 */
export const RUNTIME_THEMES: readonly Theme[] = NEXORA_THEMES.filter(
  (entry) => entry.id !== DEFAULT_THEME_ID,
).map((entry) => entry.theme);

/** The catalogue entry for `id`, or the default's when the catalogue no longer has it. */
export function nexoraTheme(id: string | undefined): NexoraTheme {
  return NEXORA_THEMES.find((entry) => entry.id === id) ?? NEXORA_THEMES[0]!;
}
