import { RATING_INSIGHT_THRESHOLDS } from '@slotted/core/rating';
import { createContext, useContext } from 'react';

import type { RatingDefaults, RatingMessages, RatingProviderProps } from './rating.types';

/**
 * The strings the family writes when nothing overrides them, in Portuguese,
 * equal to the contract's `messages`. Plurals are ICU `plural` blocks and the
 * spectrum lines keep no-break spaces around `±` and `e`.
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

const FALLBACK: RatingDefaults = {
  size: 'md',
  tone: 'warning',
  max: 5,
  clearable: true,
  messages: RATING_MESSAGES,
  insightThresholds: RATING_INSIGHT_THRESHOLDS,
  locale: undefined,
};

const RatingDefaultsContext = createContext<RatingDefaults>(FALLBACK);

/** What a rating renders as here, before it states anything of its own. */
export function useRatingDefaults(): RatingDefaults {
  return useContext(RatingDefaultsContext);
}

/**
 * An application decides once the step, the tone, the scale, whether a press
 * on the checked symbol clears it, the words and the locale. An instance that
 * states any of them still wins; `messages` and `insightThresholds` merge key
 * by key, so a provider that renames one string keeps the others.
 */
export function RatingProvider({ children, ...defaults }: RatingProviderProps) {
  const inherited = useRatingDefaults();

  return (
    <RatingDefaultsContext.Provider
      value={{
        size: defaults.size ?? inherited.size,
        tone: defaults.tone ?? inherited.tone,
        max: defaults.max ?? inherited.max,
        clearable: defaults.clearable ?? inherited.clearable,
        messages: { ...inherited.messages, ...defaults.messages },
        insightThresholds: { ...inherited.insightThresholds, ...defaults.insightThresholds },
        locale: defaults.locale ?? inherited.locale,
      }}
    >
      {children}
    </RatingDefaultsContext.Provider>
  );
}
