import type { MessageFamily } from '../translator';
import type { Message } from '../types';

/** Every word `calendar` writes on its own. */
export interface CalendarMessages {
  readonly next: Message;
  readonly previous: Message;
}

export const en: CalendarMessages = {
  next: 'Next month',
  previous: 'Previous month',
};

export const calendarMessages: MessageFamily<'calendar', CalendarMessages> = {
  name: 'calendar',
  base: en,
};
