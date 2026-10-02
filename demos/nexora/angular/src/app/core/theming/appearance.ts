import { seedStyle, type SeedName } from '@slotted/theme/seeds';

/** The brand colours offered as one press; `custom` keeps a colour of the reader's own. */
export const BRAND_PRESETS = [
  { id: 'violet', label: 'Violet', color: '#7c3aed' },
  { id: 'blue', label: 'Blue', color: '#2563eb' },
  { id: 'emerald', label: 'Emerald', color: '#059669' },
  { id: 'amber', label: 'Amber', color: '#d97706' },
  { id: 'rose', label: 'Rose', color: '#e11d48' },
  { id: 'graphite', label: 'Graphite', color: '#3f3f46' },
] as const;
export type BrandPresetId = (typeof BRAND_PRESETS)[number]['id'];

export interface BrandPreference {
  readonly preset: BrandPresetId | 'custom';
  /** The reader's own colour, `#rrggbb`; kept while a preset is chosen, so Custom brings it back. */
  readonly custom: string;
}

export const DEFAULT_BRAND: BrandPreference = { preset: 'violet', custom: '#7c3aed' };

/**
 * The grey every surface, border and muted text is derived from. `theme`
 * writes no seed, so the theme's own neutral holds; the three colours are
 * apart from every theme's own (`theme-catalogue.spec.ts`).
 */
export const NEUTRAL_PRESETS = [
  { id: 'theme', label: 'Theme’s own', color: null },
  { id: 'cool', label: 'Cool', color: '#64748b' },
  { id: 'warm', label: 'Warm', color: '#78716c' },
  { id: 'pure', label: 'Pure', color: '#737373' },
] as const;
export type NeutralPresetId = (typeof NEUTRAL_PRESETS)[number]['id'];
export const DEFAULT_NEUTRAL: NeutralPresetId = 'theme';

export function brandColor(brand: BrandPreference): string {
  if (brand.preset === 'custom') return brand.custom;
  return BRAND_PRESETS.find((preset) => preset.id === brand.preset)?.color ?? DEFAULT_BRAND.custom;
}

export function isNeutralPreset(value: unknown): value is NeutralPresetId {
  return NEUTRAL_PRESETS.some((preset) => preset.id === value);
}

/** The seeds a brand and a neutral write, in the shape `slThemeScope` and `seedStyle` take. */
export function appearanceSeeds(
  brand: BrandPreference,
  neutral: NeutralPresetId,
): Partial<Record<SeedName, string>> {
  const color = NEUTRAL_PRESETS.find((preset) => preset.id === neutral)?.color ?? null;
  return color === null
    ? { accent: brandColor(brand) }
    : { accent: brandColor(brand), neutral: color };
}

/**
 * A brand read back from storage, each half checked on its own. A known preset
 * holds, and a custom colour `seedStyle` refuses is replaced by the default's.
 * An unknown preset, or `custom` with a refused colour, reads as the default.
 */
export function readBrand(value: unknown): BrandPreference {
  if (typeof value !== 'object' || value === null) return DEFAULT_BRAND;
  const { preset, custom } = value as Partial<Record<keyof BrandPreference, unknown>>;
  const color = isSeed(custom) ? custom : null;
  if (BRAND_PRESETS.some((entry) => entry.id === preset)) {
    return { preset: preset as BrandPresetId, custom: color ?? DEFAULT_BRAND.custom };
  }
  return preset === 'custom' && color !== null ? { preset, custom: color } : DEFAULT_BRAND;
}

/** Whether `seedStyle` takes `value` as a seed: `#rgb`, `#rrggbb` or `oklch(L C H)`. */
export function isSeed(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    seedStyle({ accent: value });
    return true;
  } catch {
    return false;
  }
}
