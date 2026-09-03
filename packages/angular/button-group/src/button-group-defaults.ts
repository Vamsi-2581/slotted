import { inject, InjectionToken } from '@angular/core';

/**
 * A step on the space scale. Separation is chosen from the scale rather than
 * stated as a length, so a theme retunes every group at once and no family
 * invents a rhythm of its own. `0` is the absence of separation.
 */
export type ButtonGroupGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * Across the flow. `auto` is a value rather than an absent one: a row of
 * controls and a column of them want opposite answers, so the family gives
 * each axis the one it needs — centred in a row, stretched in a column.
 */
export type ButtonGroupAlign = 'auto' | 'start' | 'center' | 'end' | 'stretch';

/** Along the flow. Asking for it makes the group hold the line it distributes. */
export type ButtonGroupJustify = 'start' | 'center' | 'end' | 'between';

/** What happens when the container is narrower than the row. */
export type ButtonGroupCollapse = 'wrap' | 'nowrap' | 'stack';

/**
 * How a group is laid out here, before it states anything of its own. Every
 * axis is optional, so an application that standardises separation does not
 * also decide which of its groups are joined.
 */
export interface ButtonGroupDefaults {
  attached?: boolean;
  collapse?: ButtonGroupCollapse;
  gap?: ButtonGroupGap;
}

export const BUTTON_GROUP_DEFAULTS_TOKEN = new InjectionToken<ButtonGroupDefaults>(
  'slotted button group defaults',
  { providedIn: 'root', factory: (): ButtonGroupDefaults => ({}) },
);

/**
 * An application decides once how its action groups are spaced and shaped,
 * rather than repeating the same three inputs across a product. A group that
 * states an axis itself still wins: an explicit input is never overridden by
 * the token.
 */
export function provideButtonGroupDefaults(defaults: ButtonGroupDefaults) {
  return { provide: BUTTON_GROUP_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectButtonGroupDefaults(): ButtonGroupDefaults {
  return inject(BUTTON_GROUP_DEFAULTS_TOKEN);
}
