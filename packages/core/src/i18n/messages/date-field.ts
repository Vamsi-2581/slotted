import type { MessageFamily } from '../translator';
import type { Message } from '../types';

/** Every word `date-field` writes on its own. */
export interface DateFieldMessages {
  readonly clear: Message;
}

export const en: DateFieldMessages = {
  clear: 'Clear',
};

export const dateFieldMessages: MessageFamily<'dateField', DateFieldMessages> = {
  name: 'dateField',
  base: en,
};
