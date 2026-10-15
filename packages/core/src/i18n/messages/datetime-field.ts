import type { MessageFamily } from '../translator';
import type { Message } from '../types';

/** Every word `datetime-field` writes on its own. */
export interface DatetimeFieldMessages {
  readonly clear: Message;
  readonly duration: Message;
}

export const en: DatetimeFieldMessages = {
  clear: 'Clear',
  duration: 'Date and time as a duration from now',
};

export const datetimeFieldMessages: MessageFamily<'datetimeField', DatetimeFieldMessages> = {
  name: 'datetimeField',
  base: en,
};
