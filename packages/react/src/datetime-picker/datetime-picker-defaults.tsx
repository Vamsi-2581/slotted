import { createContext, useContext } from 'react';

import type {
  DateTimePickerDefaults,
  DateTimePickerDefaultsProviderProps,
} from './datetime-picker.types';

/**
 * The words the family's own controls announce. They are constants rather than
 * strings built inside the component, because the only translation layer this
 * library has is the consumer's — a provider at the top of the application, or
 * a prop on the control.
 */
export const DATE_TIME_PICKER_CHOOSE_LABEL = 'Choose date and time';
export const DATE_TIME_PICKER_CHANGE_LABEL = 'Change date and time';
export const DATE_TIME_PICKER_NOW_LABEL = 'Now';
export const DATE_TIME_PICKER_EMPTY_LABEL = 'No time is available on this day.';
export const DATE_TIME_PICKER_TRUNCATED_LABEL =
  'The list is cut short. Times past the end are typed into the field.';

/**
 * A whole day at a one-minute step, which is the finest whole-day list any
 * surveyed implementation offers. A day at a one-second step is 86 400 rows and
 * is a configuration mistake rather than a list.
 */
export const DATE_TIME_PICKER_MAX_OPTIONS = 1440;

const FALLBACK: DateTimePickerDefaults = {
  calendar: 'gregory',
  changeLabel: DATE_TIME_PICKER_CHANGE_LABEL,
  chooseLabel: DATE_TIME_PICKER_CHOOSE_LABEL,
  closeOnSelect: 'auto',
  emptyLabel: DATE_TIME_PICKER_EMPTY_LABEL,
  granularity: 'minute',
  hourCycle: undefined,
  locale: undefined,
  maxOptions: DATE_TIME_PICKER_MAX_OPTIONS,
  nowLabel: DATE_TIME_PICKER_NOW_LABEL,
  openTo: 'date',
  placement: 'bottom-start',
  size: 'md',
  step: 900,
  timeZone: undefined,
  truncatedLabel: DATE_TIME_PICKER_TRUNCATED_LABEL,
  unavailableOptions: 'disable',
  variant: 'outline',
};

const DateTimePickerDefaultsContext = createContext<DateTimePickerDefaults>(FALLBACK);

/** What a datetime picker renders as here, before it states anything itself. */
export function useDateTimePickerDefaults(): DateTimePickerDefaults {
  return useContext(DateTimePickerDefaultsContext);
}

/**
 * An application decides once how its datetime pickers behave — which locale
 * writes them, which clock they run on, which step the list offers, which
 * surface focus opens on — rather than repeating the same props on every
 * control in a form. A control that states any of them itself still wins.
 */
export function DateTimePickerDefaultsProvider({
  children,
  ...defaults
}: DateTimePickerDefaultsProviderProps) {
  const inherited = useDateTimePickerDefaults();

  return (
    <DateTimePickerDefaultsContext.Provider
      value={{
        calendar: defaults.calendar ?? inherited.calendar,
        changeLabel: defaults.changeLabel ?? inherited.changeLabel,
        chooseLabel: defaults.chooseLabel ?? inherited.chooseLabel,
        closeOnSelect: defaults.closeOnSelect ?? inherited.closeOnSelect,
        emptyLabel: defaults.emptyLabel ?? inherited.emptyLabel,
        granularity: defaults.granularity ?? inherited.granularity,
        hourCycle: defaults.hourCycle ?? inherited.hourCycle,
        locale: defaults.locale ?? inherited.locale,
        maxOptions: defaults.maxOptions ?? inherited.maxOptions,
        nowLabel: defaults.nowLabel ?? inherited.nowLabel,
        openTo: defaults.openTo ?? inherited.openTo,
        placement: defaults.placement ?? inherited.placement,
        size: defaults.size ?? inherited.size,
        step: defaults.step ?? inherited.step,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        truncatedLabel: defaults.truncatedLabel ?? inherited.truncatedLabel,
        unavailableOptions: defaults.unavailableOptions ?? inherited.unavailableOptions,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </DateTimePickerDefaultsContext.Provider>
  );
}
