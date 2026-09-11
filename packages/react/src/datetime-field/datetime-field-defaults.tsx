import { createContext, useContext } from 'react';

import type {
  DateTimeFieldDefaults,
  DateTimeFieldDefaultsProviderProps,
} from './datetime-field.types';

/**
 * The words the family's own controls announce. They are constants rather than
 * strings built inside the component, because the only translation layer this
 * library has is the consumer's — a provider at the top of the application, or
 * a prop on the control.
 */
export const DATE_TIME_FIELD_CLEAR_LABEL = 'Clear';
export const DATE_TIME_FIELD_DURATION_LABEL = 'Date and time as a duration from now';

const FALLBACK: DateTimeFieldDefaults = {
  calendar: 'gregory',
  clearLabel: DATE_TIME_FIELD_CLEAR_LABEL,
  durationLabel: DATE_TIME_FIELD_DURATION_LABEL,
  firstDayOfWeek: undefined,
  granularity: 'minute',
  hourCycle: undefined,
  locale: undefined,
  relative: true,
  size: 'md',
  timeZone: undefined,
  variant: 'outline',
  yearPivot: undefined,
};

const DateTimeFieldDefaultsContext = createContext<DateTimeFieldDefaults>(FALLBACK);

/** What a datetime field renders as here, before it states anything of its own. */
export function useDateTimeFieldDefaults(): DateTimeFieldDefaults {
  return useContext(DateTimeFieldDefaultsContext);
}

/**
 * An application decides once what its datetimes look like, which locale writes
 * them, which clock they run on and which zone answers "now", rather than
 * repeating the same props on every control in a form. A control that states
 * any of them itself still wins.
 *
 * `locale` is the one worth setting first. Unset, each control asks the runtime
 * — which is the browser's locale, not the application's, and an application
 * served in Portuguese to a browser set to English writes `9/10/2026, 3:20 PM`
 * where it means `10/09/2026, 15:20`.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a control
 * inside a field takes the field's step and this provider answers only outside
 * one.
 */
export function DateTimeFieldDefaultsProvider({
  children,
  ...defaults
}: DateTimeFieldDefaultsProviderProps) {
  const inherited = useDateTimeFieldDefaults();

  return (
    <DateTimeFieldDefaultsContext.Provider
      value={{
        calendar: defaults.calendar ?? inherited.calendar,
        clearLabel: defaults.clearLabel ?? inherited.clearLabel,
        durationLabel: defaults.durationLabel ?? inherited.durationLabel,
        firstDayOfWeek: defaults.firstDayOfWeek ?? inherited.firstDayOfWeek,
        granularity: defaults.granularity ?? inherited.granularity,
        hourCycle: defaults.hourCycle ?? inherited.hourCycle,
        locale: defaults.locale ?? inherited.locale,
        relative: defaults.relative ?? inherited.relative,
        size: defaults.size ?? inherited.size,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        variant: defaults.variant ?? inherited.variant,
        yearPivot: defaults.yearPivot ?? inherited.yearPivot,
      }}
    >
      {children}
    </DateTimeFieldDefaultsContext.Provider>
  );
}
