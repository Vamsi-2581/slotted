import { inject, InjectionToken } from '@angular/core';
import type { TimeGranularity } from '@slotted/core/date';
import type { TimeFieldHourCycle } from '@slotted/angular/time-field';

export type TimePickerSize = 'sm' | 'md' | 'lg';
export type TimePickerVariant = 'outline' | 'subtle' | 'plain';

/** Where the surface opens, before the positioner has read the room. */
export type TimePickerPlacement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';

/**
 * Whether choosing a time closes the surface. `auto` closes, because one press
 * chooses a whole time — there is no second half to come back for.
 */
export type TimePickerCloseOnSelect = 'auto' | 'always' | 'never';

/** What a time a bound or the predicate refuses looks like in the list. */
export type TimePickerUnavailableOptions = 'disable' | 'hide';

export const TIME_PICKER_CHOOSE_LABEL = 'Choose time';
export const TIME_PICKER_CHANGE_LABEL = 'Change time';
export const TIME_PICKER_NOW_LABEL = 'Now';
export const TIME_PICKER_EMPTY_LABEL = 'No time available';
export const TIME_PICKER_TRUNCATED_LABEL =
  'Only the first times are listed; type the rest into the field';

/**
 * A quarter of an hour, which is the slot a booking flow asks in and the step
 * every surveyed panel defaults to within a factor of two.
 */
export const TIME_PICKER_STEP = 900;

/**
 * How long the list may get: a whole day at a one-minute step, which is the
 * finest whole-day list any surveyed implementation offers. A day at a
 * one-second step is 86 400 rows and a configuration mistake rather than a
 * list; it is cut rather than handed to the DOM.
 */
export const TIME_PICKER_MAX_OPTIONS = 1440;

export interface TimePickerDefaults {
  changeLabel: string;
  chooseLabel: string;
  closeOnSelect: TimePickerCloseOnSelect;
  emptyLabel: string;
  granularity: TimeGranularity;
  hourCycle: TimeFieldHourCycle | undefined;
  locale: string | undefined;
  maxOptions: number;
  nowLabel: string;
  placement: TimePickerPlacement;
  size: TimePickerSize;
  step: number;
  timeZone: string | undefined;
  truncatedLabel: string;
  unavailableOptions: TimePickerUnavailableOptions;
  variant: TimePickerVariant;
}

const FALLBACK: TimePickerDefaults = {
  changeLabel: TIME_PICKER_CHANGE_LABEL,
  chooseLabel: TIME_PICKER_CHOOSE_LABEL,
  closeOnSelect: 'auto',
  emptyLabel: TIME_PICKER_EMPTY_LABEL,
  granularity: 'minute',
  hourCycle: undefined,
  locale: undefined,
  maxOptions: TIME_PICKER_MAX_OPTIONS,
  nowLabel: TIME_PICKER_NOW_LABEL,
  placement: 'bottom-start',
  size: 'md',
  step: TIME_PICKER_STEP,
  timeZone: undefined,
  truncatedLabel: TIME_PICKER_TRUNCATED_LABEL,
  unavailableOptions: 'disable',
  variant: 'outline',
};

export const TIME_PICKER_DEFAULTS = new InjectionToken<TimePickerDefaults>(
  'slotted time picker defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once what step its panels offer and what its controls
 * announce, rather than repeating the same inputs on every picker in a product.
 * A picker that states any of them itself still wins.
 *
 * `step` is the one worth setting first: a product books in twenty-minute slots
 * and a quarter-hour default puts a panel of the wrong times in front of every
 * reader.
 */
export function provideTimePickerDefaults(defaults: Partial<TimePickerDefaults>) {
  return {
    provide: TIME_PICKER_DEFAULTS,
    useFactory: (): TimePickerDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

/** What a time picker renders as here, before it states anything of its own. */
export function injectTimePickerDefaults(): TimePickerDefaults {
  return inject(TIME_PICKER_DEFAULTS);
}
