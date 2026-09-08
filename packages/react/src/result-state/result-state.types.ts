import type { ComponentPropsWithRef, ReactNode } from 'react';

/**
 * What the region is reporting. Seven values rather than one component per
 * semantic, which is what the guide's section 17 asks of `empty-state` and
 * `error-state`.
 *
 * It is not a tone. Two pairs share one — `empty`, `no-results` and
 * `not-found` are all secondary, `forbidden` and `offline` are both warning —
 * so naming the axis `tone` would have made `forbidden` and `offline` one
 * value.
 */
export type ResultStateStatus =
  'empty' | 'no-results' | 'not-found' | 'error' | 'forbidden' | 'offline' | 'success';

/**
 * Which scope the message applies to, which is the axis `alert` already
 * speaks: a row inside a cell, a panel inside a card, the whole route. The
 * geometry follows from the scope; a size axis would say the same message can
 * be drawn large or small, which is not the choice a consumer is making.
 */
export type ResultStateReach = 'inline' | 'section' | 'page';

/** Whether the region reads centred or from the inline edge. */
export type ResultStateAlign = 'center' | 'start';

/**
 * Whether the text announces itself, and how loudly. The default is `polite`,
 * where `alert`'s is `off`: WCAG 2.2's Understanding document for SC 4.1.3
 * names this family's own text as its example of a status message, and a
 * result state is by definition the outcome of an operation.
 */
export type ResultStateLive = 'off' | 'polite' | 'assertive';

/** What an application sets once for every result state under it. */
export interface ResultStateDefaults {
  align: ResultStateAlign;
  live: ResultStateLive;
  reach: ResultStateReach;
  status: ResultStateStatus;
}

export interface ResultStateDefaultsProviderProps extends Partial<ResultStateDefaults> {
  children?: ReactNode | undefined;
}

/** Props the family writes on whichever element `render` returns for a part. */
export interface ResultStatePartProps extends ComponentPropsWithRef<'div'> {
  'data-part': string;
}

export interface ResultStateRootProps extends ComponentPropsWithRef<'section'> {
  'data-align': ResultStateAlign;
  'data-live': ResultStateLive;
  'data-part': string;
  'data-reach': ResultStateReach;
  'data-status': ResultStateStatus;
  'data-ui': string;
}

export interface ResultStateContentProps extends ComponentPropsWithRef<'div'> {
  /** Renders the announcing region into another element. */
  render?: ((props: ResultStatePartProps) => ReactNode) | undefined;
}

export interface ResultStateTitleProps extends ComponentPropsWithRef<'div'> {
  /**
   * Renders the title into the element the page means. A heading puts the
   * region in the document outline, which is right for a full-page 404 and
   * wrong for the empty state of one card in a grid of twelve — only the page
   * knows which.
   */
  render?: ((props: ResultStatePartProps) => ReactNode) | undefined;
}

export interface ResultStateDescriptionProps extends ComponentPropsWithRef<'p'> {
  render?: ((props: ResultStatePartProps & ComponentPropsWithRef<'p'>) => ReactNode) | undefined;
}

export interface ResultStateActionsProps extends ComponentPropsWithRef<'div'> {
  render?: ((props: ResultStatePartProps) => ReactNode) | undefined;
}

export interface ResultStateFooterProps extends ComponentPropsWithRef<'div'> {
  render?: ((props: ResultStatePartProps) => ReactNode) | undefined;
}

export interface ResultStateProps extends Omit<ComponentPropsWithRef<'section'>, 'children'> {
  children?: ReactNode | undefined;
  /** Defaults to the provider, then to `empty`. */
  status?: ResultStateStatus | undefined;
  /** Defaults to the provider, then to `section`. */
  reach?: ResultStateReach | undefined;
  /** Defaults to the provider, then to `center`. */
  align?: ResultStateAlign | undefined;
  /** Defaults to the provider, then to `polite`. */
  live?: ResultStateLive | undefined;
  /**
   * The page's own illustration. It is projected into the box the family
   * draws, so it keeps the height the reach gives it — which is what stops an
   * illustration that has not loaded from moving the title and the actions
   * when it arrives. Unstated, the box is withdrawn by the stylesheet and the
   * region is a title, a description and an action (RS1): the family draws no
   * picture of its own, because a tone glyph alone above a title is the
   * pattern R5 refuses.
   */
  media?: ReactNode | undefined;
  /**
   * Renders the box into another element — a `div` inside a table cell, a
   * `main` for a route that is nothing but this region.
   */
  render?: ((props: ResultStateRootProps) => ReactNode) | undefined;
}
