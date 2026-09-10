import { createContext, useContext } from 'react';

import type { TimeFieldDefaults, TimeFieldDefaultsProviderProps } from './time-field.types';

/**
 * The words the family's own controls announce. They are constants rather than
 * strings built inside the component, because the only translation layer this
 * library has is the consumer's — a provider at the top of the application, or
 * a prop on the control.
 */
export const TIME_FIELD_CLEAR_LABEL = 'Clear';
export const TIME_FIELD_DURATION_LABEL = 'Time as a duration from now';
/** What the preview says after the time when a duration ran past midnight. */
export const TIME_FIELD_NEXT_DAY_LABEL = 'next day';

const FALLBACK: TimeFieldDefaults = {
  clearLabel: TIME_FIELD_CLEAR_LABEL,
  durationLabel: TIME_FIELD_DURATION_LABEL,
  granularity: 'minute',
  hourCycle: undefined,
  locale: undefined,
  nextDayLabel: TIME_FIELD_NEXT_DAY_LABEL,
  relative: true,
  size: 'md',
  timeZone: undefined,
  variant: 'outline',
};

const TimeFieldDefaultsContext = createContext<TimeFieldDefaults>(FALLBACK);

/** What a time field renders as here, before it states anything of its own. */
export function useTimeFieldDefaults(): TimeFieldDefaults {
  return useContext(TimeFieldDefaultsContext);
}

/**
 * An application decides once what its times look like, which locale writes
 * them, which clock they run on and which zone answers "now", rather than
 * repeating the same props on every control in a form. A control that states
 * any of them itself still wins.
 *
 * `locale` is the one worth setting first. Unset, each control asks the runtime
 * — which is the browser's locale, not the application's, and an application
 * served in Portuguese to a browser set to English writes `2:30 PM` where it
 * means `14:30`.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a control
 * inside a field takes the field's step and this provider answers only outside
 * one.
 */
export function TimeFieldDefaultsProvider({
  children,
  ...defaults
}: TimeFieldDefaultsProviderProps) {
  const inherited = useTimeFieldDefaults();

  return (
    <TimeFieldDefaultsContext.Provider
      value={{
        clearLabel: defaults.clearLabel ?? inherited.clearLabel,
        durationLabel: defaults.durationLabel ?? inherited.durationLabel,
        granularity: defaults.granularity ?? inherited.granularity,
        hourCycle: defaults.hourCycle ?? inherited.hourCycle,
        locale: defaults.locale ?? inherited.locale,
        nextDayLabel: defaults.nextDayLabel ?? inherited.nextDayLabel,
        relative: defaults.relative ?? inherited.relative,
        size: defaults.size ?? inherited.size,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </TimeFieldDefaultsContext.Provider>
  );
}
