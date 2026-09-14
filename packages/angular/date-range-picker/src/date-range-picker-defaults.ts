import { inject, InjectionToken } from '@angular/core';

export type { DateRange } from '@slotted/angular/calendar';

/** Where the surface opens, before the positioner has read the room. */
export type DateRangePickerPlacement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';

/**
 * Whether choosing closes the surface. `auto` closes when the run becomes
 * whole — by the second press, or by a preset — and stays open after the
 * first, because the second press has to reach the same surface.
 */
export type DateRangePickerCloseOnSelect = 'auto' | 'always' | 'never';

export type DateRangePickerSize = 'sm' | 'md' | 'lg';
export type DateRangePickerVariant = 'outline' | 'subtle' | 'plain';
export type DateRangePickerCalendar = 'gregory';

/**
 * What the length counts. A booking counts nights and a leave request counts
 * days, and the same pair of dates gives 4 or 5: the family names the unit
 * rather than choosing for the product. `days` counts both ends.
 */
export type DateRangePickerCount = 'days' | 'nights';

/** The end being edited: the field carrying `data-current`, and the end the next press in the grid writes. */
export type DateRangePickerPosition = 'start' | 'end';

/**
 * The two names the trigger takes, before and after a range is chosen. The
 * second one is the frame the two dates and the length are spoken inside:
 * focus returns to the trigger when the surface closes, and "Change range,
 * 12 September – 16 September 2026, 4 nights" is what tells the reader what
 * happened.
 */
export const DATE_RANGE_PICKER_CHOOSE_LABEL = 'Choose range';
export const DATE_RANGE_PICKER_CHANGE_LABEL = 'Change range';
export const DATE_RANGE_PICKER_CLEAR_LABEL = 'Clear range';
export const DATE_RANGE_PICKER_START_LABEL = 'Start';
export const DATE_RANGE_PICKER_END_LABEL = 'End';

const UNIT: Record<DateRangePickerCount, [string, string]> = {
  days: ['day', 'days'],
  nights: ['night', 'nights'],
};

/** "1 day", "4 nights": the number the band says while the run is drawn. */
export function dateRangePickerLengthLabel(count: number, unit: DateRangePickerCount): string {
  const [one, many] = UNIT[unit];
  return `${String(count)} ${count === 1 ? one : many}`;
}

/** "2 to 7 nights", "at least 2 nights", "at most 7 nights". */
export function dateRangePickerLimitLabel(
  min: number | undefined,
  max: number | undefined,
  unit: DateRangePickerCount,
): string {
  const [one, many] = UNIT[unit];
  if (min !== undefined && max !== undefined) {
    return `${String(min)} to ${String(max)} ${max === 1 ? one : many}`;
  }
  if (min !== undefined) return `at least ${String(min)} ${min === 1 ? one : many}`;
  if (max !== undefined) return `at most ${String(max)} ${max === 1 ? one : many}`;
  return '';
}

export interface DateRangePickerDefaults {
  calendar: DateRangePickerCalendar;
  changeLabel: string;
  chooseLabel: string;
  clearLabel: string;
  closeOnSelect: DateRangePickerCloseOnSelect;
  count: DateRangePickerCount;
  endLabel: string;
  lengthLabel: (count: number, unit: DateRangePickerCount) => string;
  limitLabel: (
    min: number | undefined,
    max: number | undefined,
    unit: DateRangePickerCount,
  ) => string;
  locale: string | undefined;
  months: number;
  placement: DateRangePickerPlacement;
  size: DateRangePickerSize;
  startLabel: string;
  timeZone: string | undefined;
  variant: DateRangePickerVariant;
}

const FALLBACK: DateRangePickerDefaults = {
  calendar: 'gregory',
  changeLabel: DATE_RANGE_PICKER_CHANGE_LABEL,
  chooseLabel: DATE_RANGE_PICKER_CHOOSE_LABEL,
  clearLabel: DATE_RANGE_PICKER_CLEAR_LABEL,
  closeOnSelect: 'auto',
  count: 'days',
  endLabel: DATE_RANGE_PICKER_END_LABEL,
  lengthLabel: dateRangePickerLengthLabel,
  limitLabel: dateRangePickerLimitLabel,
  locale: undefined,
  months: 2,
  placement: 'bottom-start',
  size: 'md',
  startLabel: DATE_RANGE_PICKER_START_LABEL,
  timeZone: undefined,
  variant: 'outline',
};

export const DATE_RANGE_PICKER_DEFAULTS = new InjectionToken<DateRangePickerDefaults>(
  'slotted date range picker defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once which locale writes its dates, what a run
 * counts, what its triggers are called and how many months it shows — rather
 * than repeating the same inputs on every picker in a form.
 */
export function provideDateRangePickerDefaults(defaults: Partial<DateRangePickerDefaults>) {
  return {
    provide: DATE_RANGE_PICKER_DEFAULTS,
    useFactory: (): DateRangePickerDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

/** What a range picker renders as here, before it states anything of its own. */
export function injectDateRangePickerDefaults(): DateRangePickerDefaults {
  return inject(DATE_RANGE_PICKER_DEFAULTS);
}
