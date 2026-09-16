import { inject, InjectionToken } from '@angular/core';
import { durationLabel } from '@slotted/core/date';
import type { PlainTime, TimeGranularity, TimeRangeValue } from '@slotted/core/date';

/** A run of times, either end of which may be open. */
export type TimeRange = TimeRangeValue;

/** Where the surface opens, before the positioner has read the room. */
export type TimeRangePickerPlacement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';

/**
 * Whether choosing closes the surface. `auto` closes when the work becomes
 * whole — by a press in a list, by `now` or by a preset — and stays open
 * while an end is still missing, because the next press has to reach the
 * same surface.
 */
export type TimeRangePickerCloseOnSelect = 'auto' | 'always' | 'never';

/** What a time a bound or the predicate refuses looks like in a list. */
export type TimeRangePickerUnavailableOptions = 'disable' | 'hide';

export type TimeRangePickerSize = 'sm' | 'md' | 'lg';
export type TimeRangePickerVariant = 'outline' | 'subtle' | 'plain';
export type TimeRangePickerHourCycle = 12 | 24;

/** The end being edited: the field and the panel carrying `data-current`. */
export type TimeRangePickerPosition = 'start' | 'end';

/** The highlighted option of each list. */
export interface TimeRangePickerHighlight {
  readonly start: PlainTime | null;
  readonly end: PlainTime | null;
}

/**
 * The words the family's own controls announce, as constants rather than
 * strings built inside the component: the only translation layer this library
 * has is the consumer's.
 */
export const TIME_RANGE_PICKER_CHOOSE_LABEL = 'Choose range';
export const TIME_RANGE_PICKER_CHANGE_LABEL = 'Change range';
export const TIME_RANGE_PICKER_CLEAR_LABEL = 'Clear range';
export const TIME_RANGE_PICKER_START_LABEL = 'Start';
export const TIME_RANGE_PICKER_END_LABEL = 'End';
export const TIME_RANGE_PICKER_NOW_LABEL = 'Now';
export const TIME_RANGE_PICKER_DONE_LABEL = 'Done';
/** `{end}` is the current end's label. */
export const TIME_RANGE_PICKER_HINT_LABELS: TimeRangePickerHintLabels = {
  choose: '{end}: choose a time',
  order: 'The end must come after the start',
  length: 'Outside the allowed length',
  unavailable: 'Crosses an unavailable time',
  bounds: 'Outside the allowed range',
};
export const TIME_RANGE_PICKER_EMPTY_LABEL = 'No time available';
export const TIME_RANGE_PICKER_TRUNCATED_LABEL =
  'Only the first times are listed; type the rest into the field';
/** A quarter of an hour, the step every surveyed panel defaults to within a factor of two. */
export const TIME_RANGE_PICKER_STEP = 900;
/** A whole day at a one-minute step: the finest whole-day list any surveyed implementation offers. */
export const TIME_RANGE_PICKER_MAX_OPTIONS = 1440;

/** "2 hr 30 min": the duration the band and the rows say, in the family's locale. */
export function timeRangePickerLengthLabel(seconds: number, locale?: string): string {
  return durationLabel(seconds, locale);
}

/** "30 min to 4 hr", "at least 30 min", "at most 4 hr". */
export function timeRangePickerLimitLabel(
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
 * current end's label.
 */
export interface TimeRangePickerHintLabels {
  /** While the current end is missing; `{end}` is replaced by its label. */
  choose: string;
  /** The work is whole and the end comes before the start. */
  order: string;
  /** The work is whole and its duration falls outside minLength or maxLength. */
  length: string;
  /** The work is whole and crosses an unavailable time. */
  unavailable: string;
  /** The work is whole and an end falls outside min or max. */
  bounds: string;
}

export interface TimeRangePickerDefaults {
  changeLabel: string;
  chooseLabel: string;
  clearLabel: string;
  closeOnSelect: TimeRangePickerCloseOnSelect;
  emptyLabel: string;
  endLabel: string;
  granularity: TimeGranularity;
  hourCycle: TimeRangePickerHourCycle | undefined;
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
  nowLabel: string;
  /** The button at the end of the footer that closes with what is written. */
  doneLabel: string;
  /** What the hint says: what to choose next, or what is wrong. */
  hintLabels: TimeRangePickerHintLabels;
  placement: TimeRangePickerPlacement;
  size: TimeRangePickerSize;
  startLabel: string;
  step: number;
  timeZone: string | undefined;
  truncatedLabel: string;
  unavailableOptions: TimeRangePickerUnavailableOptions;
  variant: TimeRangePickerVariant;
}

const FALLBACK: TimeRangePickerDefaults = {
  changeLabel: TIME_RANGE_PICKER_CHANGE_LABEL,
  chooseLabel: TIME_RANGE_PICKER_CHOOSE_LABEL,
  clearLabel: TIME_RANGE_PICKER_CLEAR_LABEL,
  closeOnSelect: 'auto',
  emptyLabel: TIME_RANGE_PICKER_EMPTY_LABEL,
  endLabel: TIME_RANGE_PICKER_END_LABEL,
  granularity: 'minute',
  hourCycle: undefined,
  lengthLabel: timeRangePickerLengthLabel,
  limitLabel: timeRangePickerLimitLabel,
  locale: undefined,
  maxOptions: TIME_RANGE_PICKER_MAX_OPTIONS,
  nowLabel: TIME_RANGE_PICKER_NOW_LABEL,
  doneLabel: TIME_RANGE_PICKER_DONE_LABEL,
  hintLabels: TIME_RANGE_PICKER_HINT_LABELS,
  placement: 'bottom-start',
  size: 'md',
  startLabel: TIME_RANGE_PICKER_START_LABEL,
  step: TIME_RANGE_PICKER_STEP,
  timeZone: undefined,
  truncatedLabel: TIME_RANGE_PICKER_TRUNCATED_LABEL,
  unavailableOptions: 'disable',
  variant: 'outline',
};

export const TIME_RANGE_PICKER_DEFAULTS = new InjectionToken<TimeRangePickerDefaults>(
  'slotted time range picker defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once what its times look like, what step its lists
 * offer, how a duration is written and what its controls announce — rather
 * than repeating the same inputs on every picker in a form.
 */
export function provideTimeRangePickerDefaults(
  defaults: Partial<Omit<TimeRangePickerDefaults, 'hintLabels'>> & {
    hintLabels?: Partial<TimeRangePickerHintLabels>;
  },
) {
  return {
    provide: TIME_RANGE_PICKER_DEFAULTS,
    useFactory: (): TimeRangePickerDefaults => ({
      ...FALLBACK,
      ...defaults,
      hintLabels: { ...FALLBACK.hintLabels, ...defaults.hintLabels },
    }),
  };
}

/** What a time range picker renders as here, before it states anything of its own. */
export function injectTimeRangePickerDefaults(): TimeRangePickerDefaults {
  return inject(TIME_RANGE_PICKER_DEFAULTS);
}
