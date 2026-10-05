/**
 * The builder's axes, as data the store reads back from storage: each axis is
 * `null` while the chosen theme's own value holds. The values are compiled
 * into a theme by `custom-theme.ts`, which only the store and the appearance
 * section load, by `import()`.
 */
export const RADIUS_RANGE = { min: 0, max: 24, step: 2 } as const;
/** The families of `theme-faces.ts`, by id. */
export const FONT_IDS = [
  'geist',
  'inter',
  'nunito',
  'source-sans',
  'outfit',
  'source-serif',
  'fraunces',
  'jetbrains-mono',
] as const;
export const SCALE_CHOICES = [90, 100, 112] as const;
export const BORDER_CHOICES = [1, 2] as const;
export const SHADOW_CHOICES = ['none', 'soft', 'strong'] as const;
export const MOTION_CHOICES = ['normal', 'reduced', 'off'] as const;
export const CARD_CHOICES = ['bordered', 'elevated', 'flat'] as const;
export const TAB_CHOICES = ['underline', 'pill'] as const;
export const CHART_CHOICES = ['palette', 'accent'] as const;

export type FontId = (typeof FONT_IDS)[number];
export type ScaleChoice = (typeof SCALE_CHOICES)[number];
export type BorderChoice = (typeof BORDER_CHOICES)[number];
export type ShadowChoice = (typeof SHADOW_CHOICES)[number];
export type MotionChoice = (typeof MOTION_CHOICES)[number];
export type CardChoice = (typeof CARD_CHOICES)[number];
export type TabChoice = (typeof TAB_CHOICES)[number];
export type ChartChoice = (typeof CHART_CHOICES)[number];

export interface Customisation {
  /** The largest corner in px, `RADIUS_RANGE` in its steps; the smaller corners are its fractions. */
  readonly radius: number | null;
  /** The face of the text and the controls. */
  readonly body: FontId | null;
  /** The face of the headings and titles. */
  readonly heading: FontId | null;
  /** Percent of the library's type sizes. */
  readonly scale: ScaleChoice | null;
  /** The thin line, in px. */
  readonly border: BorderChoice | null;
  readonly shadow: ShadowChoice | null;
  readonly motion: MotionChoice | null;
  /** How a card and a stat card stand off the page: a line, a shadow, or a sunken fill. */
  readonly cards: CardChoice | null;
  /** The line tabs' selected item: underlined by the marker, or a pill on the accent's ground. */
  readonly tabs: TabChoice | null;
  /** The chart's series: the theme's data palette, or shades of the accent. */
  readonly chart: ChartChoice | null;
}

export type CustomisationAxis = keyof Customisation;

export const NO_CUSTOMISATION: Customisation = {
  radius: null,
  body: null,
  heading: null,
  scale: null,
  border: null,
  shadow: null,
  motion: null,
  cards: null,
  tabs: null,
  chart: null,
};

const AXES = Object.keys(NO_CUSTOMISATION) as CustomisationAxis[];

const isRadius = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= RADIUS_RANGE.min &&
  value <= RADIUS_RANGE.max &&
  (value - RADIUS_RANGE.min) % RADIUS_RANGE.step === 0;

const choice = <T>(choices: readonly T[], value: unknown): T | null =>
  choices.includes(value as T) ? (value as T) : null;

/**
 * A customisation read back from storage, axis by axis: a value the builder
 * does not offer is the theme's own again, and the other axes hold.
 */
export function readCustomisation(value: unknown): Customisation {
  if (typeof value !== 'object' || value === null) return NO_CUSTOMISATION;
  const stored = value as Partial<Record<CustomisationAxis, unknown>>;
  return {
    radius: isRadius(stored.radius) ? stored.radius : null,
    body: choice(FONT_IDS, stored.body),
    heading: choice(FONT_IDS, stored.heading),
    scale: choice(SCALE_CHOICES, stored.scale),
    border: choice(BORDER_CHOICES, stored.border),
    shadow: choice(SHADOW_CHOICES, stored.shadow),
    motion: choice(MOTION_CHOICES, stored.motion),
    cards: choice(CARD_CHOICES, stored.cards),
    tabs: choice(TAB_CHOICES, stored.tabs),
    chart: choice(CHART_CHOICES, stored.chart),
  };
}

/** The axes a reader has set, in the builder's order. */
export function customisedAxes(customisation: Customisation): CustomisationAxis[] {
  return AXES.filter((axis) => customisation[axis] !== null);
}

export function isCustomised(customisation: Customisation): boolean {
  return customisedAxes(customisation).length > 0;
}
