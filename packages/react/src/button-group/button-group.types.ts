import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from 'react';

import type { ButtonSize, ButtonTone, ButtonVariant } from '../button/button.types';

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
 * What an application sets once for every group under it. Each axis is
 * optional, so an application that standardises separation does not also
 * decide which of its groups are joined.
 */
export interface ButtonGroupDefaults {
  attached?: boolean | undefined;
  collapse?: ButtonGroupCollapse | undefined;
  gap?: ButtonGroupGap | undefined;
}

export interface ButtonGroupDefaultsProviderProps extends ButtonGroupDefaults {
  children: ReactNode;
}

export interface ButtonGroupRootProps extends HTMLAttributes<HTMLElement> {
  'data-part': string;
  'data-ui': string;
}

/**
 * The rule carries a part and no family identifier: `data-ui` names the family
 * on its root, and the separator is a part of the group rather than a family
 * of its own.
 */
export interface ButtonGroupSeparatorRootProps extends HTMLAttributes<HTMLElement> {
  'data-part': string;
}

/**
 * The three axes the group hands down to the buttons inside it, through the
 * button family's own defaults. A button that states one itself still wins:
 * how a group is laid out and how its buttons are painted are two questions,
 * and only the second one belongs to `button`.
 */
interface ButtonGroupPaintProps {
  size?: ButtonSize | undefined;
  tone?: ButtonTone | undefined;
  variant?: ButtonVariant | undefined;
}

export interface ButtonGroupProps extends ComponentPropsWithRef<'div'>, ButtonGroupPaintProps {
  /** Positions the buttons across the flow. */
  align?: ButtonGroupAlign | undefined;
  /** Joins the buttons into one shape: shared edges, outer corners only. */
  attached?: boolean | undefined;
  /** What happens when the container is narrower than the row. */
  collapse?: ButtonGroupCollapse | undefined;
  /** The group holds the line and its buttons share it in equal segments. */
  fullWidth?: boolean | undefined;
  /** Separation between buttons, as a step on the space scale. */
  gap?: ButtonGroupGap | undefined;
  /** Positions the buttons along the flow, which makes the group hold the line. */
  justify?: ButtonGroupJustify | undefined;
  orientation?: ButtonGroupOrientation | undefined;
  /** Renders the wiring into another element when a div is the wrong claim. */
  render?: ((props: ButtonGroupRootProps) => ReactNode) | undefined;
}

export interface ButtonGroupSeparatorProps extends ComponentPropsWithRef<'div'> {
  /**
   * Drops the rule out of the accessibility tree. Use it when the boundary is
   * cosmetic; a boundary that carries meaning is better said by a nested group
   * with a name of its own.
   */
  decorative?: boolean | undefined;
  render?: ((props: ButtonGroupSeparatorRootProps) => ReactNode) | undefined;
}
