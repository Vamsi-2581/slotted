import { inject, InjectionToken } from '@angular/core';
import type { TimeGranularity } from '@slotted/core/date';

/** The type step the control sits at, matching the field around it. */
export type DateTimeFieldSize = 'sm' | 'md' | 'lg';

/**
 * How much frame the control shows. The three steps `text-field` set, so a form
 * holding a name and a datetime shows one frame twice rather than two frames.
 */
export type DateTimeFieldVariant = 'outline' | 'subtle' | 'plain';

/**
 * The question a consumer asks about the clock. Which variant of each — `h11`
 * or `h12`, `h23` or `h24` — is the locale's own, and `Intl` answers it.
 */
export type DateTimeFieldHourCycle = 12 | 24;

/** The words the family's own controls announce. */
export const DATE_TIME_FIELD_CLEAR_LABEL = 'Clear';
export const DATE_TIME_FIELD_DURATION_LABEL = 'Date and time as a duration from now';

export interface DateTimeFieldDefaults {
  /** Only `gregory` today. The axis exists so a second calendar can arrive. */
  calendar: 'gregory';
  clearLabel: string;
  /** The accessible name of the expression region. */
  durationLabel: string;
  /** `0` is Sunday. Unset asks the locale. */
  firstDayOfWeek: number | undefined;
  /** How much of the time half is written. The date half is always whole. */
  granularity: TimeGranularity;
  /** Unset means the locale decides both the cycle and its variant. */
  hourCycle: DateTimeFieldHourCycle | undefined;
  /** BCP 47. Unset means the runtime decides. */
  locale: string | undefined;
  /** Whether `+`, `-` and `=` open the duration expression. */
  relative: boolean;
  size: DateTimeFieldSize;
  /** Which zone answers "what is the time now". Unset means the runtime's own. */
  timeZone: string | undefined;
  variant: DateTimeFieldVariant;
  /** Two typed digits below this many years ahead are read as this century. */
  yearPivot: number | undefined;
}

const FALLBACK: DateTimeFieldDefaults = {
  calendar: 'gregory',
  clearLabel: DATE_TIME_FIELD_CLEAR_LABEL,
  durationLabel: DATE_TIME_FIELD_DURATION_LABEL,
  firstDayOfWeek: undefined,
  granularity: 'minute',
  hourCycle: undefined,
  locale: undefined,
  relative: true,
  size: 'md',
  timeZone: undefined,
  variant: 'outline',
  yearPivot: undefined,
};

export const DATE_TIME_FIELD_DEFAULTS = new InjectionToken<DateTimeFieldDefaults>(
  'slotted datetime field defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once what its datetimes look like, which locale writes
 * them, which clock they run on and which zone answers "now", rather than
 * repeating the same inputs on every control in a form. A control that states
 * any of them itself still wins.
 *
 * `locale` is the one worth setting first. Unset, each control asks the runtime
 * — which is the browser's locale, not the application's, and an application
 * served in Portuguese to a browser set to English writes `9/10/2026, 3:20 PM`
 * where it means `10/09/2026, 15:20`.
 */
export function provideDateTimeFieldDefaults(defaults: Partial<DateTimeFieldDefaults>) {
  return {
    provide: DATE_TIME_FIELD_DEFAULTS,
    useFactory: (): DateTimeFieldDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

/** What a datetime field renders as here, before it states anything itself. */
export function injectDateTimeFieldDefaults(): DateTimeFieldDefaults {
  return inject(DATE_TIME_FIELD_DEFAULTS);
}
