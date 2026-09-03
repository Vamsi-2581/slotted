import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, ReactNode } from 'react';

/** Why the trail expanded. Only two things can ask: a press and a key. */
export type BreadcrumbExpandReason = 'pointer' | 'keyboard';

export type BreadcrumbChangeRequest = ChangeRequest<boolean>;

/**
 * What every trail on the page does before it states anything of its own. The
 * label is here because a translated application names its landmarks once, and
 * the three collapse numbers because how deep a trail may get before it folds
 * is a decision about the application rather than about one page.
 */
export interface BreadcrumbDefaults {
  itemsAfterCollapse?: number | undefined;
  itemsBeforeCollapse?: number | undefined;
  label?: string | undefined;
  maxItems?: number | undefined;
  /** The mark drawn between two crumbs. Absent, the stylesheet draws its own. */
  separator?: ReactNode | undefined;
}

export interface BreadcrumbDefaultsProviderProps extends BreadcrumbDefaults {
  children?: ReactNode;
}

export interface BreadcrumbRootProps extends ComponentPropsWithRef<'nav'> {
  'data-expanded': '' | undefined;
  'data-part': string;
  'data-ui': string;
}

export interface BreadcrumbListProps extends ComponentPropsWithRef<'ol'> {
  render?: ((props: BreadcrumbListRootProps) => ReactNode) | undefined;
}

export interface BreadcrumbListRootProps extends ComponentPropsWithRef<'ol'> {
  'data-part': string;
}

export interface BreadcrumbItemRootProps extends ComponentPropsWithRef<'li'> {
  'data-part': string;
}

export interface BreadcrumbItemProps extends ComponentPropsWithRef<'li'> {
  render?: ((props: BreadcrumbItemRootProps) => ReactNode) | undefined;
}

export interface BreadcrumbLinkRootProps extends ComponentPropsWithRef<'a'> {
  'data-part': string;
}

export interface BreadcrumbLinkProps extends ComponentPropsWithRef<'a'> {
  /** Substitutes the anchor — a router's own link, typically. */
  render?: ((props: BreadcrumbLinkRootProps) => ReactNode) | undefined;
}

export interface BreadcrumbPageRootProps extends ComponentPropsWithRef<'span'> {
  'aria-current': 'page';
  'data-part': string;
}

export interface BreadcrumbPageProps extends ComponentPropsWithRef<'span'> {
  render?: ((props: BreadcrumbPageRootProps) => ReactNode) | undefined;
}

export interface BreadcrumbProps extends ComponentPropsWithRef<'nav'> {
  /** The value an uncontrolled trail starts from, read once. */
  defaultExpanded?: boolean | undefined;
  /** Present means controlled, for the life of the component. */
  expanded?: boolean | undefined;
  /** How many crumbs survive at the end of a collapsed trail. */
  itemsAfterCollapse?: number | undefined;
  /** How many survive at its start. */
  itemsBeforeCollapse?: number | undefined;
  /** The landmark's own name, so a page's landmarks can be told apart. */
  label?: string | undefined;
  /** The count above which the trail collapses. `0` never collapses. */
  maxItems?: number | undefined;
  /** Called before the trail expands, with the request that carries the reason. */
  onExpandedChange?: ((expanded: boolean, request: BreadcrumbChangeRequest) => void) | undefined;
  render?: ((props: BreadcrumbRootProps) => ReactNode) | undefined;
  /** The mark between two crumbs. Absent, the stylesheet draws a rotated rule. */
  separator?: ReactNode | undefined;
}

/** What the trail tells the parts inside it. */
export interface BreadcrumbContextValue {
  expand: (reason: BreadcrumbExpandReason, source?: unknown) => void;
  expanded: boolean;
  /** The id of the item focus moves to once the ellipsis stops existing. */
  firstRevealedId: string;
  itemsAfterCollapse: number;
  itemsBeforeCollapse: number;
  maxItems: number;
  separator: ReactNode;
}

/** What one crumb is told by the list that laid it out. */
export interface BreadcrumbItemContextValue {
  hidden: boolean;
  /** The last item draws no separator, because there is nothing after it. */
  last: boolean;
  /** Set on the first crumb the ellipsis reveals, so focus can reach it. */
  revealedId: string | undefined;
}
