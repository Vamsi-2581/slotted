import { createContext, useContext } from 'react';

import type {
  DateRangePickerCount,
  DateRangePickerDefaults,
  DateRangePickerDefaultsProviderProps,
} from './date-range-picker.types';

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

const DateRangePickerDefaultsContext = createContext<DateRangePickerDefaults>(FALLBACK);

/** What a range picker renders as here, before it states anything of its own. */
export function useDateRangePickerDefaults(): DateRangePickerDefaults {
  return useContext(DateRangePickerDefaultsContext);
}

/**
 * An application decides once which locale writes its dates, what a run
 * counts, what its triggers are called and how many months it shows — rather
 * than repeating the same props on every picker in a form.
 */
export function DateRangePickerDefaultsProvider({
  children,
  ...defaults
}: DateRangePickerDefaultsProviderProps) {
  const inherited = useDateRangePickerDefaults();

  return (
    <DateRangePickerDefaultsContext.Provider
      value={{
        calendar: defaults.calendar ?? inherited.calendar,
        changeLabel: defaults.changeLabel ?? inherited.changeLabel,
        chooseLabel: defaults.chooseLabel ?? inherited.chooseLabel,
        clearLabel: defaults.clearLabel ?? inherited.clearLabel,
        closeOnSelect: defaults.closeOnSelect ?? inherited.closeOnSelect,
        count: defaults.count ?? inherited.count,
        endLabel: defaults.endLabel ?? inherited.endLabel,
        lengthLabel: defaults.lengthLabel ?? inherited.lengthLabel,
        limitLabel: defaults.limitLabel ?? inherited.limitLabel,
        locale: defaults.locale ?? inherited.locale,
        months: defaults.months ?? inherited.months,
        placement: defaults.placement ?? inherited.placement,
        size: defaults.size ?? inherited.size,
        startLabel: defaults.startLabel ?? inherited.startLabel,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </DateRangePickerDefaultsContext.Provider>
  );
}
