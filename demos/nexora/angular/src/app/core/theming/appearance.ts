import { seedStyle, type SeedName } from '@slotted/theme';

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
 * writes no seed, so the theme's own neutral holds.
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
 * A brand read back from storage, or the default when it is not one: an
 * unknown preset, or a custom colour `seedStyle` refuses.
 */
export function readBrand(value: unknown): BrandPreference {
  if (typeof value !== 'object' || value === null) return DEFAULT_BRAND;
  const { preset, custom } = value as Partial<Record<keyof BrandPreference, unknown>>;
  const known = preset === 'custom' || BRAND_PRESETS.some((entry) => entry.id === preset);
  if (!known || typeof custom !== 'string') return DEFAULT_BRAND;
  const brand = { preset, custom } as BrandPreference;
  try {
    seedStyle({ accent: brandColor(brand) });
    seedStyle({ accent: brand.custom });
  } catch {
    return DEFAULT_BRAND;
  }
  return brand;
}
