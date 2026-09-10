import { createContext, useContext } from 'react';

import type { TimePickerDefaults, TimePickerDefaultsProviderProps } from './time-picker.types';

/**
 * The words the family's own controls announce, as constants rather than
 * strings built inside the component: the only translation layer this library
 * has is the consumer's.
 */
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

const TimePickerDefaultsContext = createContext<TimePickerDefaults>(FALLBACK);

/** What a time picker renders as here, before it states anything of its own. */
export function useTimePickerDefaults(): TimePickerDefaults {
  return useContext(TimePickerDefaultsContext);
}

/**
 * An application decides once what its times look like, what step its panels
 * offer and what its controls announce, rather than repeating the same props on
 * every picker in a product. A picker that states any of them itself still
 * wins.
 *
 * `step` is the one worth setting first: a product books in twenty-minute slots
 * and a quarter-hour default puts a panel of the wrong times in front of every
 * reader.
 */
export function TimePickerDefaultsProvider({
  children,
  ...defaults
}: TimePickerDefaultsProviderProps) {
  const inherited = useTimePickerDefaults();

  return (
    <TimePickerDefaultsContext.Provider
      value={{
        changeLabel: defaults.changeLabel ?? inherited.changeLabel,
        chooseLabel: defaults.chooseLabel ?? inherited.chooseLabel,
        closeOnSelect: defaults.closeOnSelect ?? inherited.closeOnSelect,
        emptyLabel: defaults.emptyLabel ?? inherited.emptyLabel,
        granularity: defaults.granularity ?? inherited.granularity,
        hourCycle: defaults.hourCycle ?? inherited.hourCycle,
        locale: defaults.locale ?? inherited.locale,
        maxOptions: defaults.maxOptions ?? inherited.maxOptions,
        nowLabel: defaults.nowLabel ?? inherited.nowLabel,
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
    </TimePickerDefaultsContext.Provider>
  );
}
