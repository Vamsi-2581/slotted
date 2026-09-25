import type { ChangeRequest } from '@slotted/core/state';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from 'react';

/** The control height step of everything in the bar. */
export type TopNavigationSize = 'sm' | 'md' | 'lg';

/**
 * Which step of the bar's width folds an item into the panel: `low` folds
 * first, under 1024 pixels; `medium` under 600; `high` under 480.
 */
export type TopNavigationPriority = 'high' | 'medium' | 'low';

/** Why the panel opened or closed. */
export type TopNavigationMoreReason = Extract<
  ChangeRequest<unknown>['reason'],
  'pointer' | 'keyboard' | 'select' | 'escape' | 'outsidePress' | 'resize' | 'programmatic'
>;

/** Why the search opened or closed. */
export type TopNavigationSearchReason = Extract<
  ChangeRequest<unknown>['reason'],
  'pointer' | 'keyboard' | 'escape' | 'blur' | 'resize' | 'programmatic'
>;

/** Why the current destination moved. */
export type TopNavigationValueReason = Extract<
  ChangeRequest<unknown>['reason'],
  'pointer' | 'keyboard' | 'programmatic'
>;

export type TopNavigationMoreRequest = ChangeRequest<boolean>;
export type TopNavigationSearchRequest = ChangeRequest<boolean>;
export type TopNavigationValueRequest = ChangeRequest<string | null>;

/** The strings the family writes itself, replaceable once per application. */
export interface TopNavigationMessages {
  /** The navigation landmark's name when the consumer gives none. */
  navigation: string;
  /** The name of the button that opens the panel; the count of what folded is appended. */
  more: string;
  /** The name of the button that opens the search. */
  search: string;
  /** The name of the button that closes the search. */
  closeSearch: string;
  /** The name of the help control when the consumer gives none. */
  help: string;
  /** The name of the notifications control when the consumer gives none. */
  notifications: string;
  /** The name of the account control when the consumer gives none. */
  account: string;
  /** The skip link's text. */
  skip: string;
}

/** What an application sets once for every bar under it. */
export interface TopNavigationDefaults {
  frame: boolean;
  landmark: boolean;
  messages: TopNavigationMessages;
  size: TopNavigationSize;
}

export interface TopNavigationDefaultsProviderProps extends Partial<
  Omit<TopNavigationDefaults, 'messages'>
> {
  children?: ReactNode | undefined;
  messages?: Partial<TopNavigationMessages> | undefined;
}

/** What the root hands every part under it. */
export interface TopNavigationContextValue {
  /** The priorities the bar's width has folded, as a set: empty while everything fits. */
  folded: ReadonlySet<TopNavigationPriority>;
  /** Whether the width is under the medium step, where the search is its toggle and the context moves to the panel. */
  narrow: boolean;
  /** Whether the width is under the high step, where help moves to the panel. */
  narrowest: boolean;
  /** The values of the folded items, in DOM order. */
  collapsed: readonly string[];
  /** Whether a folded item holds the current destination. */
  currentFolded: boolean;
  /** Whether the panel has anything to show: a folded item, or the context or help at the high step. */
  panelHolds: boolean;
  messages: TopNavigationMessages;
  moreOpen: boolean;
  /** Whether the panel is present: open, or on its way out. */
  panelPresent: boolean;
  searchOpen: boolean;
  size: TopNavigationSize;
  value: string | null;
  ids: { panelId: string; moreId: string };
  /** The panel and its list, once they are in the document, so a folded part can render into them. */
  panelNode: HTMLElement | null;
  panelListNode: HTMLElement | null;
  /** The button that opens the panel, so Escape can return focus to it. */
  moreNode: HTMLElement | null;
  hasSearch: boolean;
  /** Whether the bar has a context to move into the panel at the medium step, and a help at the high one. */
  hasContext: boolean;
  hasHelp: boolean;
  /** Asks the panel to open or close. */
  setMoreOpen: (open: boolean, reason: TopNavigationMoreReason, source?: unknown) => void;
  /** Asks the search to open or close. */
  setSearchOpen: (open: boolean, reason: TopNavigationSearchReason, source?: unknown) => void;
  /** Asks the current destination to move. */
  select: (value: string, reason: TopNavigationValueReason, source?: unknown) => void;
  /** An item says what it is, so the root can count what folded and find the current one. */
  registerItem: (value: string, priority: TopNavigationPriority, current: boolean) => () => void;
  setPanelNode: (node: HTMLElement | null) => void;
  setPanelListNode: (node: HTMLElement | null) => void;
  setMoreNode: (node: HTMLElement | null) => void;
  setHasSearch: (present: boolean) => void;
  setHasContext: (present: boolean) => void;
  setHasHelp: (present: boolean) => void;
  /** The search region, so the toggle can move focus into it. */
  searchNode: HTMLElement | null;
  setSearchNode: (node: HTMLElement | null) => void;
  searchToggleNode: HTMLElement | null;
  setSearchToggleNode: (node: HTMLElement | null) => void;
}

/** What an item hands its own link or trigger. */
export interface TopNavigationItemContextValue {
  value: string;
  priority: TopNavigationPriority;
  /** Whether the width has folded this item into the panel. */
  collapsed: boolean;
  current: boolean;
  disabled: boolean;
  setCurrent: (current: boolean) => void;
}

export interface TopNavigationRootProps extends HTMLAttributes<HTMLElement> {
  /** The root is what the three width gates measure, so `render` has to attach it. */
  ref: (node: HTMLElement | null) => void;
  'data-frame'?: '' | undefined;
  'data-part': string;
  'data-search-open'?: '' | undefined;
  'data-size': TopNavigationSize;
  'data-ui': string;
}

export interface TopNavigationProps extends Omit<
  ComponentPropsWithRef<'header'>,
  'onChange' | 'defaultValue' | 'ref'
> {
  /** The panel an uncontrolled bar starts with, read once. */
  defaultMoreOpen?: boolean | undefined;
  /** The search an uncontrolled bar starts with, read once. */
  defaultSearchOpen?: boolean | undefined;
  /** The current destination an uncontrolled bar starts with, read once. */
  defaultValue?: string | null | undefined;
  /**
   * Whether the root paints its own ground, rule and inset. Unstated, it does
   * on its own and does not inside `app-shell`, whose banner already paints.
   */
  frame?: boolean | undefined;
  /**
   * Whether the root is a `header` landmark. Unstated, it is one on its own
   * and a `div` inside `app-shell`'s banner, which is already the landmark.
   */
  landmark?: boolean | undefined;
  /** The strings the family writes itself. */
  messages?: Partial<TopNavigationMessages> | undefined;
  /** Present means the consumer owns the panel. */
  moreOpen?: boolean | undefined;
  /** Called when the set of folded items changes, with their values and the reason `resize`. */
  onCollapseChange?: ((values: readonly string[], reason: 'resize') => void) | undefined;
  /** Called before the panel moves, with the request that carries the reason. */
  onMoreOpenChange?: ((open: boolean, request: TopNavigationMoreRequest) => void) | undefined;
  /** Called before the search moves. */
  onSearchOpenChange?: ((open: boolean, request: TopNavigationSearchRequest) => void) | undefined;
  /** Called before the current destination moves. */
  onValueChange?: ((value: string | null, request: TopNavigationValueRequest) => void) | undefined;
  /** The imperative surface. */
  ref?:
    | RefObject<TopNavigationHandle | null>
    | ((handle: TopNavigationHandle | null) => void)
    | undefined;
  /** Renders the root into another element. */
  render?: ((props: TopNavigationRootProps) => ReactNode) | undefined;
  /** Present means the consumer owns the search. */
  searchOpen?: boolean | undefined;
  size?: TopNavigationSize | undefined;
  /** The id of the element the skip link jumps to. Absent, no skip link is rendered. */
  skipTo?: string | undefined;
  /** Present means the consumer owns the current destination. */
  value?: string | null | undefined;
}

/** The imperative surface: what a consumer cannot say declaratively. */
export interface TopNavigationHandle {
  /** Focuses the first control in the bar. */
  focus: () => void;
  /** Opens the search where it is a toggle, and focuses the field either way. */
  focusSearch: () => void;
  /** Opens the panel, with the reason `programmatic`. */
  openMore: () => void;
  /** Closes the panel, with the reason `programmatic`. */
  closeMore: () => void;
  /** The root element, once it is in the document. */
  readonly root: HTMLElement | null;
}

export interface TopNavigationPartProps extends ComponentPropsWithRef<'div'> {
  render?:
    ((props: HTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}

export interface TopNavigationSpanPartProps extends ComponentPropsWithRef<'span'> {
  render?:
    ((props: HTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}

export interface TopNavigationHomeProps extends ComponentPropsWithRef<'a'> {
  /** Renders the mark and the name into another element: a router's link. */
  render?:
    ((props: AnchorHTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}

export interface TopNavigationNavProps extends ComponentPropsWithRef<'nav'> {
  render?:
    ((props: HTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}

export interface TopNavigationListProps extends ComponentPropsWithRef<'ul'> {
  render?:
    ((props: HTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}

export interface TopNavigationItemRootProps extends HTMLAttributes<HTMLElement> {
  'data-collapsed'?: '' | undefined;
  'data-current'?: '' | undefined;
  'data-disabled'?: '' | undefined;
  'data-part': string;
  'data-priority': TopNavigationPriority;
  'data-value': string;
}

export interface TopNavigationItemProps extends ComponentPropsWithRef<'li'> {
  /** The row and everything in it refuse interaction. */
  disabled?: boolean | undefined;
  /** Which step of the width folds this item. Unstated, `medium`. */
  priority?: TopNavigationPriority | undefined;
  render?: ((props: TopNavigationItemRootProps) => ReactNode) | undefined;
  /** The item's identity: what `value` names it by. */
  value: string;
}

export interface TopNavigationLinkRootProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'aria-current' | 'aria-disabled'
> {
  'aria-current'?: 'page' | undefined;
  'aria-disabled'?: 'true' | undefined;
  'data-current'?: '' | undefined;
  'data-part': string;
}

export interface TopNavigationLinkProps extends Omit<
  ComponentPropsWithRef<'a'>,
  'aria-current' | 'aria-disabled'
> {
  /**
   * Whether this is the current destination, stated on the row itself — what
   * a router's own link writes. It wins over the root's `value`.
   */
  current?: boolean | undefined;
  /** Renders the row into another element: a router's link. */
  render?: ((props: TopNavigationLinkRootProps) => ReactNode) | undefined;
}

export interface TopNavigationTriggerRootProps extends ButtonHTMLAttributes<HTMLElement> {
  'data-part': string;
  type: 'button';
}

export interface TopNavigationTriggerProps extends ComponentPropsWithRef<'button'> {
  render?: ((props: TopNavigationTriggerRootProps) => ReactNode) | undefined;
}

export interface TopNavigationSearchProps extends ComponentPropsWithRef<'div'> {
  render?:
    ((props: HTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}

/** What `render` receives for an icon-only control the family names and marks. */
export interface TopNavigationControlRootProps extends ButtonHTMLAttributes<HTMLElement> {
  'aria-label'?: string | undefined;
  'data-part': string;
  type?: 'button' | undefined;
}

export interface TopNavigationControlProps extends ComponentPropsWithRef<'button'> {
  render?: ((props: TopNavigationControlRootProps) => ReactNode) | undefined;
}

export interface TopNavigationActionProps extends ComponentPropsWithRef<'a'> {
  /** Renders the control into another element: a router's link, a button another family wraps. */
  render?:
    ((props: AnchorHTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}

export interface TopNavigationHelpProps extends ComponentPropsWithRef<'a'> {
  /** Renders the control into another element: a `button` that opens a panel, a router's link. */
  render?:
    ((props: AnchorHTMLAttributes<HTMLElement> & { 'data-part': string }) => ReactNode) | undefined;
}
