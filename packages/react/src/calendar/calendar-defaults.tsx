import { createContext, useContext } from 'react';

import type { CalendarDefaults, CalendarDefaultsProviderProps } from './calendar.types';

/**
 * The two words the family's own triggers announce. They are constants rather
 * than strings built inside the component, because the only translation layer
 * this library has is the consumer's — a provider at the top of the
 * application, or a prop on the instance.
 */
export const CALENDAR_PREVIOUS_LABEL = 'Previous month';
export const CALENDAR_NEXT_LABEL = 'Next month';

const FALLBACK: CalendarDefaults = {
  calendar: 'gregory',
  firstDayOfWeek: undefined,
  fixedWeeks: false,
  locale: undefined,
  months: 1,
  nextLabel: CALENDAR_NEXT_LABEL,
  outsideDays: undefined,
  previousLabel: CALENDAR_PREVIOUS_LABEL,
  timeZone: undefined,
  weekNumbers: false,
};

const CalendarDefaultsContext = createContext<CalendarDefaults>(FALLBACK);

/** What a calendar renders as here, before it states anything of its own. */
export function useCalendarDefaults(): CalendarDefaults {
  return useContext(CalendarDefaultsContext);
}

/**
 * An application decides once which locale writes its months, which day its
 * weeks start on, which zone answers "today" and whether its calendars keep a
 * fixed six-row grid — rather than repeating the same props on every instance.
 *
 * `fixedWeeks` is the one worth setting where calendars live in popovers: a
 * surface that grows a row between one press of "next" and the next moves the
 * target the reader was aiming at.
 */
export function CalendarDefaultsProvider({ children, ...defaults }: CalendarDefaultsProviderProps) {
  const inherited = useCalendarDefaults();

  return (
    <CalendarDefaultsContext.Provider
      value={{
        calendar: defaults.calendar ?? inherited.calendar,
        firstDayOfWeek: defaults.firstDayOfWeek ?? inherited.firstDayOfWeek,
        fixedWeeks: defaults.fixedWeeks ?? inherited.fixedWeeks,
        locale: defaults.locale ?? inherited.locale,
        months: defaults.months ?? inherited.months,
        nextLabel: defaults.nextLabel ?? inherited.nextLabel,
        outsideDays: defaults.outsideDays ?? inherited.outsideDays,
        previousLabel: defaults.previousLabel ?? inherited.previousLabel,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        weekNumbers: defaults.weekNumbers ?? inherited.weekNumbers,
      }}
    >
      {children}
    </CalendarDefaultsContext.Provider>
  );
}
