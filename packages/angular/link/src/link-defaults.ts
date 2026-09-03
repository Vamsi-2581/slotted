import { inject, InjectionToken } from '@angular/core';

import type { LinkUnderline, LinkVariant } from './link.constants';

/**
 * What every link on the page looks like before it states anything of its own.
 * `externalHint` is here as well as on the instance because it is the family's
 * one string, and a translated application sets a string once.
 */
export interface LinkDefaults {
  externalHint?: string;
  underline?: LinkUnderline;
  variant?: LinkVariant;
  visited?: boolean;
}

export const LINK_DEFAULTS_TOKEN = new InjectionToken<LinkDefaults>('slotted link defaults', {
  providedIn: 'root',
  factory: (): LinkDefaults => ({}),
});

/**
 * An application decides once whether its links are underlined, how they are
 * painted, whether a followed destination is marked, and what a new tab is
 * called in the language it ships. A link that states any of those itself
 * still wins: an explicit input is never overridden by the token.
 */
export function provideLinkDefaults(defaults: LinkDefaults) {
  return { provide: LINK_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectLinkDefaults(): LinkDefaults {
  return inject(LINK_DEFAULTS_TOKEN);
}
