import type { MessageFamily } from '../translator';
import type { Message } from '../types';

/** Every word `calendar` writes on its own. */
export interface CalendarMessages {
  /** The paging buttons over the day grid, which step a month. */
  readonly nextMonth: Message;
  readonly previousMonth: Message;
  /** The paging buttons over the month grid, which step a year. */
  readonly nextYear: Message;
  readonly previousYear: Message;
  /** The paging buttons over the year grid, which step a page of years. */
  readonly nextYears: Message;
  readonly previousYears: Message;
}

export const en: CalendarMessages = {
  nextMonth: 'Next month',
  previousMonth: 'Previous month',
  nextYear: 'Next year',
  previousYear: 'Previous year',
  nextYears: 'Next years',
  previousYears: 'Previous years',
};

export const calendarMessages: MessageFamily<'calendar', CalendarMessages> = {
  name: 'calendar',
  base: en,
};
