import { inject, InjectionToken } from '@angular/core';
import type { PlainDate } from '@slotted/core/date';

/** A run of days, either end of which may still be open while it is drawn. */
export interface DateRange {
  readonly start: PlainDate | null;
  readonly end: PlainDate | null;
}

/**
 * What the calendar holds, which depends on what it was asked to collect: one
 * date, a run of them, or a set.
 */
export type CalendarValue = PlainDate | DateRange | PlainDate[] | null;

/** How many dates the reader may choose. */
export type CalendarSelectionMode = 'single' | 'range' | 'multiple';

/** Which grid the calendar is showing. The heading walks up; Escape walks down. */
export type CalendarView = 'day' | 'month' | 'year';

/** What happens to a day belonging to the month either side. */
export type CalendarOutsideDays = 'shown' | 'selectable' | 'hidden';

/**
 * The calendar system the value is written in. One value today, and an axis
 * rather than a silence: a second calendar system is a second arithmetic, and
 * declaring the axis now is what keeps its arrival from being a contract break.
 */
export type CalendarCalendar = 'gregory';

/**
 * The two words the family's own triggers announce. They are constants rather
 * than strings built inside the component, because the only translation layer
 * this library has is the consumer's — a provider at the top of the
 * application, or an input on the instance.
 */
export const CALENDAR_PREVIOUS_LABEL = 'Previous month';
export const CALENDAR_NEXT_LABEL = 'Next month';

export interface CalendarDefaults {
  calendar: CalendarCalendar;
  firstDayOfWeek: number | undefined;
  fixedWeeks: boolean;
  locale: string | undefined;
  months: number;
  nextLabel: string;
  /**
   * Unset is not `shown`: a calendar showing one month draws the days either
   * side of it, and a calendar showing two would draw the same six days in
   * both grids. See the resolution in `calendar.ts`.
   */
  outsideDays: CalendarOutsideDays | undefined;
  previousLabel: string;
  timeZone: string | undefined;
  weekNumbers: boolean;
}

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

export const CALENDAR_DEFAULTS = new InjectionToken<CalendarDefaults>('slotted calendar defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

/**
 * An application decides once which locale writes its months, which day its
 * weeks start on, which zone answers "today" and whether its calendars keep a
 * fixed six-row grid — rather than repeating the same inputs on every instance.
 *
 * `fixedWeeks` is the one worth setting where calendars live in popovers: a
 * surface that grows a row between one press of "next" and the next moves the
 * target the reader was aiming at.
 */
export function provideCalendarDefaults(defaults: Partial<CalendarDefaults>) {
  return {
    provide: CALENDAR_DEFAULTS,
    useFactory: (): CalendarDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

/** What a calendar renders as here, before it states anything of its own. */
export function injectCalendarDefaults(): CalendarDefaults {
  return inject(CALENDAR_DEFAULTS);
}
