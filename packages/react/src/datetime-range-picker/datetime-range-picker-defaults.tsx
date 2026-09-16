import { durationLabel } from '@slotted/core/date';
import { createContext, useContext } from 'react';

import type {
  DateTimeRangePickerDefaults,
  DateTimeRangePickerDefaultsProviderProps,
  DateTimeRangePickerHintLabels,
} from './datetime-range-picker.types';

/**
 * The words the family's own controls announce, as constants rather than
 * strings built inside the component: the only translation layer this library
 * has is the consumer's. The second name is the frame the two times and the
 * duration are spoken inside: focus returns to the trigger when the surface
 * closes, and "Change range, 12 September 2026 at 14:00 – 16 September 2026 at 11:00,
 * 3 days 21 hr" is what tells the
 * reader what happened.
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

/** One month: two lists stand beside the grid, and two months beside two lists do not fit in 720 pixels. */
export const DATETIME_RANGE_PICKER_MONTHS = 1;

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

const DateTimeRangePickerDefaultsContext = createContext<DateTimeRangePickerDefaults>(FALLBACK);

/** What a time range picker renders as here, before it states anything of its own. */
export function useDateTimeRangePickerDefaults(): DateTimeRangePickerDefaults {
  return useContext(DateTimeRangePickerDefaultsContext);
}

/**
 * An application decides once what its times look like, what step its lists
 * offer, how a duration is written and what its controls announce — rather
 * than repeating the same props on every picker in a form. A picker that
 * states any of them itself still wins.
 */
export function DateTimeRangePickerDefaultsProvider({
  children,
  ...defaults
}: DateTimeRangePickerDefaultsProviderProps) {
  const inherited = useDateTimeRangePickerDefaults();

  return (
    <DateTimeRangePickerDefaultsContext.Provider
      value={{
        calendar: defaults.calendar ?? inherited.calendar,
        changeLabel: defaults.changeLabel ?? inherited.changeLabel,
        chooseLabel: defaults.chooseLabel ?? inherited.chooseLabel,
        clearLabel: defaults.clearLabel ?? inherited.clearLabel,
        closeOnSelect: defaults.closeOnSelect ?? inherited.closeOnSelect,
        emptyLabel: defaults.emptyLabel ?? inherited.emptyLabel,
        endLabel: defaults.endLabel ?? inherited.endLabel,
        firstDayOfWeek: defaults.firstDayOfWeek ?? inherited.firstDayOfWeek,
        granularity: defaults.granularity ?? inherited.granularity,
        hourCycle: defaults.hourCycle ?? inherited.hourCycle,
        lengthLabel: defaults.lengthLabel ?? inherited.lengthLabel,
        limitLabel: defaults.limitLabel ?? inherited.limitLabel,
        locale: defaults.locale ?? inherited.locale,
        maxOptions: defaults.maxOptions ?? inherited.maxOptions,
        months: defaults.months ?? inherited.months,
        nowLabel: defaults.nowLabel ?? inherited.nowLabel,
        doneLabel: defaults.doneLabel ?? inherited.doneLabel,
        hintLabels: { ...inherited.hintLabels, ...defaults.hintLabels },
        placement: defaults.placement ?? inherited.placement,
        size: defaults.size ?? inherited.size,
        startLabel: defaults.startLabel ?? inherited.startLabel,
        step: defaults.step ?? inherited.step,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        truncatedLabel: defaults.truncatedLabel ?? inherited.truncatedLabel,
        unavailableOptions: defaults.unavailableOptions ?? inherited.unavailableOptions,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </DateTimeRangePickerDefaultsContext.Provider>
  );
}
