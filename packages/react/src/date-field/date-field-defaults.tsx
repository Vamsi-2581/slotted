import { createContext, useContext } from 'react';

import type { DateFieldDefaults, DateFieldDefaultsProviderProps } from './date-field.types';

/**
 * The one word the family's own button announces. It is a constant rather than
 * a string built inside the component, because the only translation layer this
 * library has is the consumer's — a provider at the top of the application, or
 * a prop on the control.
 */
export const DATE_FIELD_CLEAR_LABEL = 'Clear';

/**
 * Two typed digits up to twenty years ahead of this year are this century, and
 * anything above them is the last: `30` is 2030 and `80` is 1980 in 2026.
 *
 * A birth-date field sets it to `0`, and then only a year already past can be
 * typed in two digits. The number is stated rather than inferred because the
 * alternative is two bindings guessing, differently, at what `26` means.
 */
export const DATE_FIELD_YEAR_PIVOT = 20;

const FALLBACK: DateFieldDefaults = {
  calendar: 'gregory',
  clearLabel: DATE_FIELD_CLEAR_LABEL,
  firstDayOfWeek: undefined,
  locale: undefined,
  size: 'md',
  timeZone: undefined,
  variant: 'outline',
  yearPivot: DATE_FIELD_YEAR_PIVOT,
};

const DateFieldDefaultsContext = createContext<DateFieldDefaults>(FALLBACK);

/** What a date field renders as here, before it states anything of its own. */
export function useDateFieldDefaults(): DateFieldDefaults {
  return useContext(DateFieldDefaultsContext);
}

/**
 * An application decides once what its dates look like, which locale writes
 * them, which zone answers "today" and how a two-digit year resolves, rather
 * than repeating the same props on every control in a form. A control that
 * states any of them itself still wins.
 *
 * `locale` is the one worth setting first. Unset, each control asks the runtime
 * — which is the browser's locale, not the application's, and an application
 * served in Portuguese to a browser set to English writes its dates in the
 * American order.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a control
 * inside a field takes the field's step and this provider answers only outside
 * one.
 */
export function DateFieldDefaultsProvider({
  children,
  ...defaults
}: DateFieldDefaultsProviderProps) {
  const inherited = useDateFieldDefaults();

  return (
    <DateFieldDefaultsContext.Provider
      value={{
        calendar: defaults.calendar ?? inherited.calendar,
        clearLabel: defaults.clearLabel ?? inherited.clearLabel,
        firstDayOfWeek: defaults.firstDayOfWeek ?? inherited.firstDayOfWeek,
        locale: defaults.locale ?? inherited.locale,
        size: defaults.size ?? inherited.size,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        variant: defaults.variant ?? inherited.variant,
        yearPivot: defaults.yearPivot ?? inherited.yearPivot,
      }}
    >
      {children}
    </DateFieldDefaultsContext.Provider>
  );
}
