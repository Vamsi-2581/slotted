import { createContext, useContext } from 'react';

import type { NumberFieldDefaults, NumberFieldDefaultsProviderProps } from './number-field.types';

/**
 * The two words the family's own buttons announce. They are constants rather
 * than strings built inside the component, because the only translation layer
 * this library has is the consumer's — a provider at the top of the
 * application, or a prop on the control.
 */
export const NUMBER_FIELD_INCREMENT_LABEL = 'Increase';
export const NUMBER_FIELD_DECREMENT_LABEL = 'Decrease';

const FALLBACK: NumberFieldDefaults = {
  clamp: 'blur',
  decrementLabel: NUMBER_FIELD_DECREMENT_LABEL,
  formatOn: 'change',
  incrementLabel: NUMBER_FIELD_INCREMENT_LABEL,
  locale: undefined,
  size: 'md',
  stepper: 'stacked',
  variant: 'outline',
};

const NumberFieldDefaultsContext = createContext<NumberFieldDefaults>(FALLBACK);

/** What a number field renders as here, before it states anything of its own. */
export function useNumberFieldDefaults(): NumberFieldDefaults {
  return useContext(NumberFieldDefaultsContext);
}

/**
 * An application decides once what its number fields look like, which locale
 * they are written in and what their two buttons are called, rather than
 * repeating the same props on every amount in a form. A control that states any
 * of them itself still wins.
 *
 * `locale` is the one worth setting first: it decides the decimal separator,
 * the grouping and the numbering system, and a form where one field reads
 * `1.234` as a thousand and another as one point two three four is a form that
 * loses money.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a control
 * inside a field takes the field's step and this provider answers only outside
 * one.
 */
export function NumberFieldDefaultsProvider({
  children,
  ...defaults
}: NumberFieldDefaultsProviderProps) {
  const inherited = useNumberFieldDefaults();

  return (
    <NumberFieldDefaultsContext.Provider
      value={{
        clamp: defaults.clamp ?? inherited.clamp,
        decrementLabel: defaults.decrementLabel ?? inherited.decrementLabel,
        formatOn: defaults.formatOn ?? inherited.formatOn,
        incrementLabel: defaults.incrementLabel ?? inherited.incrementLabel,
        locale: defaults.locale ?? inherited.locale,
        size: defaults.size ?? inherited.size,
        stepper: defaults.stepper ?? inherited.stepper,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </NumberFieldDefaultsContext.Provider>
  );
}
