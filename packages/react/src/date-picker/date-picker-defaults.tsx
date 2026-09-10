import { createContext, useContext } from 'react';

import type { DatePickerDefaults, DatePickerDefaultsProviderProps } from './date-picker.types';

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

const DatePickerDefaultsContext = createContext<DatePickerDefaults>(FALLBACK);

/** What a date picker renders as here, before it states anything of its own. */
export function useDatePickerDefaults(): DatePickerDefaults {
  return useContext(DatePickerDefaultsContext);
}

/**
 * An application decides once which locale writes its dates, which zone answers
 * "today", where its surfaces open and what its triggers are called — rather
 * than repeating the same props on every picker in a form.
 */
export function DatePickerDefaultsProvider({
  children,
  ...defaults
}: DatePickerDefaultsProviderProps) {
  const inherited = useDatePickerDefaults();

  return (
    <DatePickerDefaultsContext.Provider
      value={{
        calendar: defaults.calendar ?? inherited.calendar,
        changeLabel: defaults.changeLabel ?? inherited.changeLabel,
        chooseLabel: defaults.chooseLabel ?? inherited.chooseLabel,
        closeOnSelect: defaults.closeOnSelect ?? inherited.closeOnSelect,
        locale: defaults.locale ?? inherited.locale,
        placement: defaults.placement ?? inherited.placement,
        size: defaults.size ?? inherited.size,
        timeZone: defaults.timeZone ?? inherited.timeZone,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </DatePickerDefaultsContext.Provider>
  );
}
