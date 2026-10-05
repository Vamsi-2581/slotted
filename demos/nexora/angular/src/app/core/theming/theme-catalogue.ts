import type { FontId } from './customisation';

/**
 * The themes a reader can choose from, as data: what the store and the
 * preferences page need before any theme is compiled. The definitions are in
 * `nexora-themes.ts`, which only `PreferencesStore.useThemes` and the
 * appearance section load, so `extendTheme` and the default theme object stay
 * out of the initial bundle.
 */
export interface ThemeEntry {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /**
   * The accent `html` carries while the reader keeps the theme's own brand,
   * `#rrggbb`; `null` leaves the seed the theme's sheet declares.
   */
  readonly accent: string | null;
  /** The theme's own largest corner, in px: where the builder's corner slider starts. */
  readonly radius: number;
  /** The theme's own faces for the text and the headings, as the font pickers name them. */
  readonly body: FontId;
  readonly heading: FontId;
}

export const DEFAULT_THEME_ID = 'default';

export const THEME_CATALOGUE: readonly ThemeEntry[] = [
  {
    id: DEFAULT_THEME_ID,
    label: 'Standard',
    description: 'The library’s own theme in Nexora violet: Geist, compact corners, quiet shadows.',
    accent: '#7c3aed',
    radius: 8,
    body: 'geist',
    heading: 'geist',
  },
  {
    id: 'nexora-friendly',
    label: 'Friendly',
    description: 'Pill controls, a rounded face a size up, wide soft shadows, in rose and blush.',
    accent: null,
    radius: 20,
    body: 'nunito',
    heading: 'nunito',
  },
  {
    id: 'nexora-brutalist',
    label: 'Brutalist',
    description: 'Square corners, 2 px ink lines, hard offset shadows, mono capitals, no motion.',
    accent: null,
    radius: 0,
    body: 'inter',
    heading: 'jetbrains-mono',
  },
  {
    id: 'nexora-editorial',
    label: 'Editorial',
    description:
      'Serif text on a wide scale, generous space, hairlines, no shadows, wine on paper.',
    accent: null,
    radius: 4,
    body: 'source-serif',
    heading: 'fraunces',
  },
  {
    id: 'nexora-terminal',
    label: 'Terminal',
    description: 'Mono everywhere, dense rows, 2 px corners, phosphor green and a neon chart.',
    accent: null,
    radius: 2,
    body: 'jetbrains-mono',
    heading: 'jetbrains-mono',
  },
];

/** The themes compiled at runtime; `default` is the sheet `styles.css` imports. */
export const RUNTIME_THEME_IDS: readonly string[] = THEME_CATALOGUE.filter(
  (entry) => entry.id !== DEFAULT_THEME_ID,
).map((entry) => entry.id);

/**
 * The builder's output, under two names: the saved customisation, and the
 * candidate the preferences page is editing. `html` names the candidate while
 * the page is open, so the whole application is drawn in it before Save;
 * Discard and leaving the page bring back `html` naming the saved one.
 */
export const CUSTOM_THEME_ID = 'nexora-custom';
export const DRAFT_THEME_ID = 'nexora-custom-draft';

/** The catalogue entry for `id`, or the default's when the catalogue no longer has it. */
export function catalogueTheme(id: unknown): ThemeEntry {
  return THEME_CATALOGUE.find((entry) => entry.id === id) ?? THEME_CATALOGUE[0]!;
}
