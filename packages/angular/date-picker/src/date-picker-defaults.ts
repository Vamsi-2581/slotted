import { inject, InjectionToken } from '@angular/core';

/** Where the surface opens, before the positioner has read the room. */
export type DatePickerPlacement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';

/**
 * Whether choosing a date closes the surface.
 *
 * `auto` closes for one date and stays open for a range or a set, which is the
 * only combination that is not a trap: a second press has to reach the same
 * surface.
 */
export type DatePickerCloseOnSelect = 'auto' | 'always' | 'never';

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerVariant = 'outline' | 'subtle' | 'plain';
export type DatePickerCalendar = 'gregory';

/**
 * The two names the trigger takes, before and after a date is chosen.
 *
 * They are two strings rather than one that changes, because the second one is
 * the frame the date is spoken inside: focus returns to the trigger when the
 * surface closes, and "Change date, 9 September 2026" is what tells the reader
 * what happened. The APG's own example names this as an accessibility feature.
 */
export const DATE_PICKER_CHOOSE_LABEL = 'Choose date';
export const DATE_PICKER_CHANGE_LABEL = 'Change date';

export interface DatePickerDefaults {
  calendar: DatePickerCalendar;
  changeLabel: string;
  chooseLabel: string;
  closeOnSelect: DatePickerCloseOnSelect;
  locale: string | undefined;
  placement: DatePickerPlacement;
  size: DatePickerSize;
  timeZone: string | undefined;
  variant: DatePickerVariant;
}

const FALLBACK: DatePickerDefaults = {
  calendar: 'gregory',
  changeLabel: DATE_PICKER_CHANGE_LABEL,
  chooseLabel: DATE_PICKER_CHOOSE_LABEL,
  closeOnSelect: 'auto',
  locale: undefined,
  placement: 'bottom-start',
  size: 'md',
  timeZone: undefined,
  variant: 'outline',
};

export const DATE_PICKER_DEFAULTS = new InjectionToken<DatePickerDefaults>(
  'slotted date picker defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once which locale writes its dates, which zone answers
 * "today", where its surfaces open and what its triggers are called — rather
 * than repeating the same inputs on every picker in a form.
 */
export function provideDatePickerDefaults(defaults: Partial<DatePickerDefaults>) {
  return {
    provide: DATE_PICKER_DEFAULTS,
    useFactory: (): DatePickerDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

/** What a date picker renders as here, before it states anything of its own. */
export function injectDatePickerDefaults(): DatePickerDefaults {
  return inject(DATE_PICKER_DEFAULTS);
}
