import { inject, InjectionToken } from '@angular/core';
import type { TimeGranularity } from '@slotted/core/date';

/** The type step the control sits at, matching the field around it. */
export type TimeFieldSize = 'sm' | 'md' | 'lg';

/**
 * How much frame the control shows. The three steps `text-field` set, so a form
 * holding a name and a time shows one frame twice rather than two frames.
 */
export type TimeFieldVariant = 'outline' | 'subtle' | 'plain';

/**
 * The question a consumer asks about the clock. Which variant of each — `h11`
 * or `h12`, `h23` or `h24` — is the locale's own, and `Intl` answers it.
 */
export type TimeFieldHourCycle = 12 | 24;

/** The words the family's own controls announce. */
export const TIME_FIELD_CLEAR_LABEL = 'Clear';
export const TIME_FIELD_DURATION_LABEL = 'Time as a duration from now';
/** What the preview says after the time when a duration ran past midnight. */
export const TIME_FIELD_NEXT_DAY_LABEL = 'next day';

export interface TimeFieldDefaults {
  clearLabel: string;
  /** The accessible name of the expression region. */
  durationLabel: string;
  granularity: TimeGranularity;
  /** Unset means the locale decides both the cycle and its variant. */
  hourCycle: TimeFieldHourCycle | undefined;
  /** BCP 47. Unset means the runtime decides. */
  locale: string | undefined;
  nextDayLabel: string;
  /** Whether `+`, `-` and `=` open the duration expression. */
  relative: boolean;
  size: TimeFieldSize;
  /** Which zone answers "what time is it now". Unset means the runtime's own. */
  timeZone: string | undefined;
  variant: TimeFieldVariant;
}

const FALLBACK: TimeFieldDefaults = {
  clearLabel: TIME_FIELD_CLEAR_LABEL,
  durationLabel: TIME_FIELD_DURATION_LABEL,
  granularity: 'minute',
  hourCycle: undefined,
  locale: undefined,
  nextDayLabel: TIME_FIELD_NEXT_DAY_LABEL,
  relative: true,
  size: 'md',
  timeZone: undefined,
  variant: 'outline',
};

export const TIME_FIELD_DEFAULTS = new InjectionToken<TimeFieldDefaults>(
  'slotted time field defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once what its times look like, which locale writes
 * them, which clock they run on and which zone answers "now", rather than
 * repeating the same inputs on every control in a form. A control that states
 * any of them itself still wins.
 *
 * `locale` is the one worth setting first. Unset, each control asks the runtime
 * — which is the browser's locale, not the application's, and an application
 * served in Portuguese to a browser set to English writes `2:30 PM` where it
 * means `14:30`.
 */
export function provideTimeFieldDefaults(defaults: Partial<TimeFieldDefaults>) {
  return {
    provide: TIME_FIELD_DEFAULTS,
    useFactory: (): TimeFieldDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

/** What a time field renders as here, before it states anything of its own. */
export function injectTimeFieldDefaults(): TimeFieldDefaults {
  return inject(TIME_FIELD_DEFAULTS);
}
