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
  /** The theme's own neutral seed, `#rrggbb`; `null` keeps the library default's. */
  readonly neutral: string | null;
}

export const DEFAULT_THEME_ID = 'default';

export const THEME_CATALOGUE: readonly ThemeEntry[] = [
  {
    id: DEFAULT_THEME_ID,
    label: 'Standard',
    description: 'The library’s own theme: compact radii, quiet shadows.',
    neutral: null,
  },
  {
    id: 'nexora-soft',
    label: 'Soft',
    description: 'Rounder corners, diffuse shadows and a rose-taupe grey.',
    neutral: '#846f6c',
  },
  {
    id: 'nexora-sharp',
    label: 'Sharp',
    description: 'Square corners, ruled tables, capitalised buttons and badges.',
    neutral: null,
  },
  {
    id: 'nexora-editorial',
    label: 'Editorial',
    description: 'Serif headings, airier lines and a sage grey.',
    neutral: '#6e7366',
  },
];

/** The themes compiled at runtime; `default` is the sheet `styles.css` imports. */
export const RUNTIME_THEME_IDS: readonly string[] = THEME_CATALOGUE.filter(
  (entry) => entry.id !== DEFAULT_THEME_ID,
).map((entry) => entry.id);

/** The catalogue entry for `id`, or the default's when the catalogue no longer has it. */
export function catalogueTheme(id: unknown): ThemeEntry {
  return THEME_CATALOGUE.find((entry) => entry.id === id) ?? THEME_CATALOGUE[0]!;
}
