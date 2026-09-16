import { durationLabel } from '@slotted/core/date';
import { createContext, useContext } from 'react';

import type {
  TimeRangePickerDefaults,
  TimeRangePickerDefaultsProviderProps,
  TimeRangePickerHintLabels,
} from './time-range-picker.types';

/**
 * The words the family's own controls announce, as constants rather than
 * strings built inside the component: the only translation layer this library
 * has is the consumer's. The second name is the frame the two times and the
 * duration are spoken inside: focus returns to the trigger when the surface
 * closes, and "Change range, 14:00 – 16:30, 2 hr 30 min" is what tells the
 * reader what happened.
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

const TimeRangePickerDefaultsContext = createContext<TimeRangePickerDefaults>(FALLBACK);

/** What a time range picker renders as here, before it states anything of its own. */
export function useTimeRangePickerDefaults(): TimeRangePickerDefaults {
  return useContext(TimeRangePickerDefaultsContext);
}

/**
 * An application decides once what its times look like, what step its lists
 * offer, how a duration is written and what its controls announce — rather
 * than repeating the same props on every picker in a form. A picker that
 * states any of them itself still wins.
 */
export function TimeRangePickerDefaultsProvider({
  children,
  ...defaults
}: TimeRangePickerDefaultsProviderProps) {
  const inherited = useTimeRangePickerDefaults();

  return (
    <TimeRangePickerDefaultsContext.Provider
      value={{
        changeLabel: defaults.changeLabel ?? inherited.changeLabel,
        chooseLabel: defaults.chooseLabel ?? inherited.chooseLabel,
        clearLabel: defaults.clearLabel ?? inherited.clearLabel,
        closeOnSelect: defaults.closeOnSelect ?? inherited.closeOnSelect,
        emptyLabel: defaults.emptyLabel ?? inherited.emptyLabel,
        endLabel: defaults.endLabel ?? inherited.endLabel,
        granularity: defaults.granularity ?? inherited.granularity,
        hourCycle: defaults.hourCycle ?? inherited.hourCycle,
        lengthLabel: defaults.lengthLabel ?? inherited.lengthLabel,
        limitLabel: defaults.limitLabel ?? inherited.limitLabel,
        locale: defaults.locale ?? inherited.locale,
        maxOptions: defaults.maxOptions ?? inherited.maxOptions,
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
    </TimeRangePickerDefaultsContext.Provider>
  );
}
