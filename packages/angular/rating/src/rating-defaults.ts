import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { RATING_INSIGHT_THRESHOLDS } from '@slotted/core/rating';
import type { RatingInsightThresholds } from '@slotted/core/rating';

/** The step the symbols and the text beside them sit at. */
export type RatingSize = 'sm' | 'md' | 'lg';

/**
 * The colour a lit symbol takes. `secondary` is outside the axis: its solid
 * step is a ground, and a lit star painted in it reads as an unlit one.
 */
export type RatingTone = 'accent' | 'success' | 'warning' | 'danger';

/** The smallest move of the input member: a whole symbol, or half of one. */
export type RatingStep = 1 | 0.5;

/** How the display member draws a value: every symbol, one symbol, or one symbol and a histogram. */
export type RatingDisplayVariant = 'full' | 'compact' | 'histogram';

/** How the summary draws a distribution: one bar per level, or columns over the scale with the mean. */
export type RatingSummaryVariant = 'bars' | 'spectrum';

/**
 * Every sentence the family writes, in the ICU subset `formatRatingMessage`
 * reads: `{value}` and the other names are replaced by the number in the
 * locale's digits, and `{count, plural, one {…} other {…}}` picks the form the
 * locale's plural rules choose, `#` standing for the number.
 */
export interface RatingMessages {
  /** The accessible name of each radio. */
  itemLabel: string;
  /** The accessible name of the display. */
  displayLabel: string;
  /** The accessible name of the display when it carries a count. */
  displayLabelWithCount: string;
  /** The scale beside the summary's figure. */
  scale: string;
  /** The count under the summary's figure. */
  summaryCount: string;
  /** The count of a summary nobody has rated yet. */
  summaryEmpty: string;
  /** The count of a spectrum whose mean is trustworthy. */
  spectrumCount: string;
  /** The count of a spectrum whose margin reaches half a level. */
  spectrumUncertain: string;
  /** The accessible name of each level or column. */
  levelLabel: string;
  /** The accessible name of the list of levels. */
  distributionLabel: string;
  positive: string;
  neutral: string;
  negative: string;
  divided: string;
  few: string;
  consensus: string;
  mixed: string;
}

/**
 * The contract's `messages`, word for word; the spec asserts the equality.
 * The spectrum's two counts keep `± 0,04` and `2,0 e 4,5` on one line with
 * no-break spaces.
 */
export const RATING_MESSAGES: RatingMessages = {
  itemLabel: '{value} de {max}',
  displayLabel: 'Avaliação {value} de {max}',
  displayLabelWithCount:
    'Avaliação {value} de {max}, {count, plural, =0 {# avaliações} one {# avaliação} other {# avaliações}}',
  scale: 'de {max}',
  summaryCount:
    'Com base em {count, plural, =0 {# avaliações} one {# avaliação} other {# avaliações}}',
  summaryEmpty: 'Ainda sem avaliações',
  spectrumCount:
    '{count, plural, =0 {# avaliações} one {# avaliação} other {# avaliações}} · margem de\u00a0±\u00a0{margin}',
  spectrumUncertain:
    '{count, plural, =0 {# avaliações} one {# avaliação} other {# avaliações}} · média incerta, entre {low}\u00a0e\u00a0{high}',
  levelLabel:
    '{level, plural, one {# estrela} other {# estrelas}}: {count, plural, =0 {# avaliações} one {# avaliação} other {# avaliações}}, {share}',
  distributionLabel: 'Distribuição por estrelas',
  positive: '{share} positivas',
  neutral: '{share} neutras',
  negative: '{share} negativas',
  divided: 'Opiniões divididas',
  few: 'Poucas avaliações',
  consensus: 'Consenso forte',
  mixed: 'Opiniões variadas',
};

export interface RatingDefaults {
  size: RatingSize;
  tone: RatingTone;
  max: number;
  clearable: boolean;
  messages: RatingMessages;
  insightThresholds: RatingInsightThresholds;
  /** The locale numbers are written in. Unset, the document's `lang`, then the runtime's. */
  locale: string | undefined;
}

/** What `provideRating()` takes: every key optional, and the two records partial. */
export type RatingDefaultsInput = Partial<
  Omit<RatingDefaults, 'messages' | 'insightThresholds'>
> & {
  messages?: Partial<RatingMessages>;
  insightThresholds?: Partial<RatingInsightThresholds>;
};

const FALLBACK: RatingDefaults = {
  size: 'md',
  tone: 'warning',
  max: 5,
  clearable: true,
  messages: RATING_MESSAGES,
  insightThresholds: RATING_INSIGHT_THRESHOLDS,
  locale: undefined,
};

export const SL_RATING_DEFAULTS = new InjectionToken<RatingDefaults>('slotted rating defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

/**
 * An application decides once how its ratings read — the step, the tone, the
 * scale, whether a press on the chosen star empties it, the words and the
 * thresholds of the summary's conclusion. A message or a threshold left out
 * keeps the family's; an instance that states any of them still wins.
 */
export function provideRating(defaults: RatingDefaultsInput) {
  return {
    provide: SL_RATING_DEFAULTS,
    useFactory: (): RatingDefaults => ({
      ...FALLBACK,
      ...defaults,
      messages: { ...RATING_MESSAGES, ...defaults.messages },
      insightThresholds: { ...RATING_INSIGHT_THRESHOLDS, ...defaults.insightThresholds },
    }),
  };
}

/** What a rating renders as here, before it states anything of its own. */
export function injectRatingDefaults(): RatingDefaults {
  return inject(SL_RATING_DEFAULTS);
}

/**
 * The locale a member writes numbers in when neither the instance nor the
 * application names one: the document's `lang`, which is what a page already
 * declares its language with.
 */
export function injectDocumentLocale(): string | undefined {
  const lang = inject(DOCUMENT, { optional: true })?.documentElement?.lang;
  return lang === undefined || lang === '' ? undefined : lang;
}

/**
 * One sequence for every application in the page, not one per application.
 *
 * The generated value is the `name` the radios group by, and grouping is by
 * name across the whole document when there is no form: two applications on
 * one page — every story on a Storybook docs page is its own application —
 * each counting from one gave two ratings the same name, and checking a star
 * in one unchecked the other. `field` scopes its counter to the application
 * because its identifiers must match between server and client; this one is
 * written through an attribute binding, which the client rewrites after
 * hydration, so a sequence shared by the realm costs nothing there.
 */
let sequence = 0;

@Injectable({ providedIn: 'root' })
export class SlRatingIdFactory {
  next() {
    sequence += 1;
    return `slotted-rating-${sequence}`;
  }
}

/** A whole count, with the locale's grouping. */
export function formatCount(count: number, locale: string | undefined): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(count);
}

/** A number written into a custom property, to a fixed number of places. */
export function cssNumber(value: number, places: number): string {
  return String(Number(value.toFixed(places)));
}
