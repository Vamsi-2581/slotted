import { inject, InjectionToken } from '@angular/core';

import type {
  StatusIndicatorLabels,
  StatusIndicatorLive,
  StatusIndicatorMark,
  StatusIndicatorSize,
} from './status-indicator.constants';

/**
 * What every status in an application looks like, and what it is called,
 * before any one of them states anything of its own. The wording belongs here
 * more than anywhere else: it is the same six words on every page, in the
 * language the application ships, and a team should decide it once rather than
 * write a translation call at every call site.
 */
export interface StatusIndicatorDefaults {
  labels?: StatusIndicatorLabels;
  live?: StatusIndicatorLive;
  mark?: StatusIndicatorMark;
  size?: StatusIndicatorSize;
}

export const STATUS_INDICATOR_DEFAULTS_TOKEN = new InjectionToken<StatusIndicatorDefaults>(
  'slotted status indicator defaults',
  { providedIn: 'root', factory: (): StatusIndicatorDefaults => ({}) },
);

/**
 * An application decides once how its statuses are marked, how large they are,
 * whether they announce, and what each of the six is called. An indicator that
 * states any of those still wins: an explicit input is never overridden by the
 * token.
 */
export function provideStatusIndicatorDefaults(defaults: StatusIndicatorDefaults) {
  return { provide: STATUS_INDICATOR_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectStatusIndicatorDefaults(): StatusIndicatorDefaults {
  return inject(STATUS_INDICATOR_DEFAULTS_TOKEN);
}
