import { inject, InjectionToken } from '@angular/core';
import { durationLabel } from '@slotted/core/date';
import type { DateTimeRangeValue, PlainTime, TimeGranularity } from '@slotted/core/date';

/** A run of datetimes, either end of which may be open. */
export type DateTimeRange = DateTimeRangeValue;

/** Where the surface opens, before the positioner has read the room. */
export type DateTimeRangePickerPlacement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';

/**
 * Whether choosing closes the surface. `auto` closes when the work becomes
 * whole — by a press in a list, by `now` or by a preset — and stays open
 * while an end is still missing, because the next press has to reach the
 * same surface.
 */
export type DateTimeRangePickerCloseOnSelect = 'auto' | 'always' | 'never';

/** What a time a bound or the predicate refuses looks like in a list. */
export type DateTimeRangePickerUnavailableOptions = 'disable' | 'hide';

export type DateTimeRangePickerSize = 'sm' | 'md' | 'lg';
export type DateTimeRangePickerVariant = 'outline' | 'subtle' | 'plain';
export type DateTimeRangePickerHourCycle = 12 | 24;
export type DateTimeRangePickerCalendar = 'gregory';

/** The end being edited: the field and the panel carrying `data-current`. */
export type DateTimeRangePickerPosition = 'start' | 'end';

/** The highlighted option of each list. */
export interface DateTimeRangePickerHighlight {
  readonly start: PlainTime | null;
  readonly end: PlainTime | null;
}

/**
 * The words the family's own controls announce, as constants rather than
 * strings built inside the component: the only translation layer this library
 * has is the consumer's.
 */
export const DATETIME_RANGE_PICKER_CHOOSE_LABEL = 'Choose range';
export const DATETIME_RANGE_PICKER_CHANGE_LABEL = 'Change range';
export const DATETIME_RANGE_PICKER_CLEAR_LABEL = 'Clear range';
export const DATETIME_RANGE_PICKER_START_LABEL = 'Start';
export const DATETIME_RANGE_PICKER_END_LABEL = 'End';
export const DATETIME_RANGE_PICKER_NOW_LABEL = 'Now';
export const DATETIME_RANGE_PICKER_DONE_LABEL = 'Done';
/** `{end}` is the current end's label, `{day}` the day the list serves. */
export const DATETIME_RANGE_PICKER_HINT_LABELS: DateTimeRangePickerHintLabels = {
  choose: '{end}: choose a day',
  chooseTime: '{end}: choose a time on {day}',
  order: 'The end must come after the start',
  length: 'Outside the allowed length',
  unavailable: 'Crosses an unavailable day or time',
  bounds: 'Outside the allowed range',
};
export const DATETIME_RANGE_PICKER_EMPTY_LABEL = 'No time available';
export const DATETIME_RANGE_PICKER_TRUNCATED_LABEL =
  'Only the first times are listed; type the rest into the field';
/** A quarter of an hour, the step every surveyed panel defaults to within a factor of two. */
export const DATETIME_RANGE_PICKER_STEP = 900;
/** A whole day at a one-minute step: the finest whole-day list any surveyed implementation offers. */
export const DATETIME_RANGE_PICKER_MAX_OPTIONS = 1440;
/** One month: two lists stand beside the grid, and two months beside two lists do not fit in 720 pixels. */
export const DATETIME_RANGE_PICKER_MONTHS = 1;

/** "3 days 21 hr": the duration the band and the rows say, in the family's locale. */
export function dateTimeRangePickerLengthLabel(seconds: number, locale?: string): string {
  return durationLabel(seconds, locale);
}

/** "30 min to 4 hr", "at least 30 min", "at most 4 hr". */
export function dateTimeRangePickerLimitLabel(
  min: number | undefined,
  max: number | undefined,
  locale?: string,
): string {
  if (min !== undefined && max !== undefined) {
    return `${durationLabel(min, locale)} to ${durationLabel(max, locale)}`;
  }
  if (min !== undefined) return `at least ${durationLabel(min, locale)}`;
  if (max !== undefined) return `at most ${durationLabel(max, locale)}`;
  return '';
}

/**
 * What the hint says, in the product's own words. `{end}` is replaced by the
 * current end's label, `{day}` by the day the list serves.
 */
export interface DateTimeRangePickerHintLabels {
  /** While the current end has no date; `{end}` is replaced by its label. */
  choose: string;
  /** While the current end has a date and no time; `{end}` and `{day}` are replaced. */
  chooseTime: string;
  /** The work is whole and the end comes before the start. */
  order: string;
  /** The work is whole and its duration falls outside minLength or maxLength. */
  length: string;
  /** The work is whole and crosses an unavailable time or day. */
  unavailable: string;
  /** The work is whole and an end falls outside min or max. */
  bounds: string;
}

export interface DateTimeRangePickerDefaults {
  calendar: DateTimeRangePickerCalendar;
  changeLabel: string;
  chooseLabel: string;
  clearLabel: string;
  closeOnSelect: DateTimeRangePickerCloseOnSelect;
  emptyLabel: string;
  endLabel: string;
  firstDayOfWeek: number | undefined;
  granularity: TimeGranularity;
  hourCycle: DateTimeRangePickerHourCycle | undefined;
  /** "2 hr 30 min", in the product's own words; seconds in, and the family's locale. */
  lengthLabel: (seconds: number, locale: string | undefined) => string;
  /** "30 min to 4 hr": what the band says while a limit is set; seconds in, and the locale. */
  limitLabel: (
    min: number | undefined,
    max: number | undefined,
    locale: string | undefined,
  ) => string;
  locale: string | undefined;
  maxOptions: number;
  months: number;
  nowLabel: string;
  /** The button at the end of the footer that closes with what is written. */
  doneLabel: string;
  /** What the hint says: what to choose next, or what is wrong. */
  hintLabels: DateTimeRangePickerHintLabels;
  placement: DateTimeRangePickerPlacement;
  size: DateTimeRangePickerSize;
  startLabel: string;
  step: number;
  timeZone: string | undefined;
  truncatedLabel: string;
  unavailableOptions: DateTimeRangePickerUnavailableOptions;
  variant: DateTimeRangePickerVariant;
}

const FALLBACK: DateTimeRangePickerDefaults = {
  calendar: 'gregory',
  changeLabel: DATETIME_RANGE_PICKER_CHANGE_LABEL,
  chooseLabel: DATETIME_RANGE_PICKER_CHOOSE_LABEL,
  clearLabel: DATETIME_RANGE_PICKER_CLEAR_LABEL,
  closeOnSelect: 'auto',
  emptyLabel: DATETIME_RANGE_PICKER_EMPTY_LABEL,
  endLabel: DATETIME_RANGE_PICKER_END_LABEL,
  firstDayOfWeek: undefined,
  granularity: 'minute',
  hourCycle: undefined,
  lengthLabel: dateTimeRangePickerLengthLabel,
  limitLabel: dateTimeRangePickerLimitLabel,
  locale: undefined,
  maxOptions: DATETIME_RANGE_PICKER_MAX_OPTIONS,
  months: DATETIME_RANGE_PICKER_MONTHS,
  nowLabel: DATETIME_RANGE_PICKER_NOW_LABEL,
  doneLabel: DATETIME_RANGE_PICKER_DONE_LABEL,
  hintLabels: DATETIME_RANGE_PICKER_HINT_LABELS,
  placement: 'bottom-start',
  size: 'md',
  startLabel: DATETIME_RANGE_PICKER_START_LABEL,
  step: DATETIME_RANGE_PICKER_STEP,
  timeZone: undefined,
  truncatedLabel: DATETIME_RANGE_PICKER_TRUNCATED_LABEL,
  unavailableOptions: 'disable',
  variant: 'outline',
};

export const DATETIME_RANGE_PICKER_DEFAULTS = new InjectionToken<DateTimeRangePickerDefaults>(
  'slotted datetime range picker defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once what its times look like, what step its lists
 * offer, how a duration is written and what its controls announce — rather
 * than repeating the same inputs on every picker in a form.
 */
export function provideDateTimeRangePickerDefaults(
  defaults: Partial<Omit<DateTimeRangePickerDefaults, 'hintLabels'>> & {
    hintLabels?: Partial<DateTimeRangePickerHintLabels>;
  },
) {
  return {
    provide: DATETIME_RANGE_PICKER_DEFAULTS,
    useFactory: (): DateTimeRangePickerDefaults => ({
      ...FALLBACK,
      ...defaults,
      hintLabels: { ...FALLBACK.hintLabels, ...defaults.hintLabels },
    }),
  };
}

/** What a datetime range picker renders as here, before it states anything of its own. */
export function injectDateTimeRangePickerDefaults(): DateTimeRangePickerDefaults {
  return inject(DATETIME_RANGE_PICKER_DEFAULTS);
}
