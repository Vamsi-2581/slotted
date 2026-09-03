import { createContext, useContext } from 'react';

import type {
  CurrencyFieldDefaults,
  CurrencyFieldDefaultsProviderProps,
} from './currency-field.types';

/**
 * The two words the family's own buttons announce. They are constants rather
 * than strings built inside the component, because the only translation layer
 * this library has is the consumer's — a provider at the top of the
 * application, or a prop on the control.
 */
export const CURRENCY_FIELD_INCREMENT_LABEL = 'Increase';
export const CURRENCY_FIELD_DECREMENT_LABEL = 'Decrease';

const FALLBACK: CurrencyFieldDefaults = {
  align: 'end',
  clamp: 'blur',
  currency: undefined,
  currencyDisplay: 'symbol',
  decrementLabel: CURRENCY_FIELD_DECREMENT_LABEL,
  entry: 'cents',
  formatOn: 'change',
  incrementLabel: CURRENCY_FIELD_INCREMENT_LABEL,
  locale: undefined,
  size: 'md',
  stepper: 'none',
  variant: 'outline',
};

const CurrencyFieldDefaultsContext = createContext<CurrencyFieldDefaults>(FALLBACK);

/** What a currency field renders as here, before it states anything of its own. */
export function useCurrencyFieldDefaults(): CurrencyFieldDefaults {
  return useContext(CurrencyFieldDefaultsContext);
}

/**
 * An application decides once which currency it charges in, which locale it
 * writes in and how its amounts are typed, rather than repeating the same props
 * on every amount in a form. A control that states any of them itself still
 * wins.
 *
 * `currency` is the one worth setting first, and the only one a field cannot be
 * built without: a product has one currency in nine screens out of ten, and the
 * tenth states its own.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a control
 * inside a field takes the field's step and this provider answers only outside
 * one.
 */
export function CurrencyFieldDefaultsProvider({
  children,
  ...defaults
}: CurrencyFieldDefaultsProviderProps) {
  const inherited = useCurrencyFieldDefaults();

  return (
    <CurrencyFieldDefaultsContext.Provider
      value={{
        align: defaults.align ?? inherited.align,
        clamp: defaults.clamp ?? inherited.clamp,
        currency: defaults.currency ?? inherited.currency,
        currencyDisplay: defaults.currencyDisplay ?? inherited.currencyDisplay,
        decrementLabel: defaults.decrementLabel ?? inherited.decrementLabel,
        entry: defaults.entry ?? inherited.entry,
        formatOn: defaults.formatOn ?? inherited.formatOn,
        incrementLabel: defaults.incrementLabel ?? inherited.incrementLabel,
        locale: defaults.locale ?? inherited.locale,
        size: defaults.size ?? inherited.size,
        stepper: defaults.stepper ?? inherited.stepper,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </CurrencyFieldDefaultsContext.Provider>
  );
}
