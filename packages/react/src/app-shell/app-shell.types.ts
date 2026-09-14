import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefObject } from 'react';

/**
 * Which region reaches the corner of the screen. `banner` spans the full width
 * and the navigation starts below it; `nav` spans the full height and the
 * banner starts beside it. The grid changes where a region is drawn and never
 * where it is written, so the focus order is the same under both.
 */
export type AppShellPrimary = 'banner' | 'nav';

/**
 * Which surface carries which plane. `inset` paints the frame — banner,
 * navigation, footer — with the sunken ground and makes the content a raised
 * card with a radius and an edge; `flush` is the other way round, edge to edge,
 * separated by a rule. `flush` is what every surveyed implementation ships, and
 * it is the arrangement a grid or a table that owns the whole column wants.
 */
export type AppShellCanvas = 'inset' | 'flush';

/**
 * How the navigation region occupies space. `inline` makes it a column of the
 * grid, `overlay` takes it out of the grid and over the content as a
 * dismissable layer, and `auto` is `inline` at or above the shell's own
 * `overlayAt` inline size and `overlay` below it.
 */
export type AppShellNavMode = 'inline' | 'overlay' | 'auto';

/**
 * How the secondary pane occupies space: the navigation's pair, resolved on the
 * same width. A detail pane at 1280 pixels is a column and at 600 is a layer.
 */
export type AppShellAsideMode = 'inline' | 'overlay' | 'auto';

/** Which end of the line the navigation region sits at. Logical, so the layout mirrors. */
export type AppShellNavSide = 'start' | 'end';

/**
 * What a closed inline navigation leaves behind. `rail` keeps a strip the width
 * of a target, which keeps the destinations reachable and the region in the tab
 * order; `hidden` takes the region out of the layout and out of the tab order.
 */
export type AppShellCollapsedTo = 'rail' | 'hidden';

/** A step on the region's own width scale. A theme retunes a step; it cannot retune `240px`. */
export type AppShellSize = 'sm' | 'md' | 'lg';

/**
 * Who scrolls. `content` makes the shell the height it was given and lets only
 * the content column scroll; `document` lets the shell grow and the document
 * scroll, and the banner travels with it.
 */
export type AppShellScroll = 'content' | 'document';

/** Whether a dismissal source closes the overlaid navigation. */
export type AppShellDismissPolicy = 'close' | 'none';

/** Why the navigation region opened or closed. */
export type AppShellOpenReason =
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'select' | 'resize' | 'programmatic';

/** Why the secondary pane opened or closed. No `select`: a pane has no destinations. */
export type AppShellAsideOpenReason = Exclude<AppShellOpenReason, 'select'>;

/** The strings the family says on the reader's behalf. */
export interface AppShellMessages {
  /** The accessible name of the navigation landmark. */
  nav: string;
  /** The accessible name of the toggle while the region is closed. */
  open: string;
  /** The accessible name of the toggle while the region is open. */
  close: string;
  /** The accessible name of the secondary pane. */
  aside: string;
  /** The accessible name of the pane's toggle while the pane is closed. */
  openAside: string;
  /** The accessible name of the pane's toggle while the pane is open. */
  closeAside: string;
  /** The label of the skip link that jumps to the content. */
  skipToMain: string;
  /** The label of the skip link that jumps to the navigation. */
  skipToNav: string;
  /** The label of the skip link that jumps to the secondary pane. */
  skipToAside: string;
}

/** What an application sets once for every shell under it. */
export interface AppShellDefaults {
  asideMode: AppShellAsideMode;
  asideSize: AppShellSize;
  canvas: AppShellCanvas;
  closeOnNavigate: boolean;
  collapsedTo: AppShellCollapsedTo;
  dividers: boolean;
  escape: AppShellDismissPolicy;
  messages: AppShellMessages;
  modal: boolean;
  navMode: AppShellNavMode;
  navSide: AppShellNavSide;
  navSize: AppShellSize;
  outsidePress: AppShellDismissPolicy;
  primary: AppShellPrimary;
  scroll: AppShellScroll;
}

export interface AppShellDefaultsProviderProps extends Partial<Omit<AppShellDefaults, 'messages'>> {
  children?: ReactNode | undefined;
  messages?: Partial<AppShellMessages> | undefined;
}

/**
 * The request the shell makes before the navigation region moves. Cancel it and
 * nothing commits; read `reason` to tell the reader's own choice from the one
 * the layout forced.
 */
export interface AppShellOpenRequest extends Omit<ChangeRequest<boolean>, 'reason'> {
  reason: AppShellOpenReason;
}

/** The request the shell makes before the secondary pane moves. */
export interface AppShellAsideOpenRequest extends Omit<ChangeRequest<boolean>, 'reason'> {
  reason: AppShellAsideOpenReason;
}

/** The imperative actions a consumer cannot express declaratively. */
export interface AppShellHandle {
  /** Asks to show the navigation region, with the reason `programmatic`. */
  openNav: () => void;
  /** Asks to hide it, with the reason `programmatic`. */
  closeNav: () => void;
  /** Asks to show the secondary pane, with the reason `programmatic`. */
  openAside: () => void;
  /** Asks to hide it, with the reason `programmatic`. */
  closeAside: () => void;
  /** Moves focus into the content region, which is where a skip link sends it. */
  focusMain: () => void;
  /** The root element, once it is in the document. */
  readonly root: HTMLElement | null;
}

/** What every part of the family reads from the shell around it. */
export interface AppShellContextValue {
  /** The resolved pane mode, which is `auto` answered against the shell's own width. */
  asideMode: Exclude<AppShellAsideMode, 'auto'> | undefined;
  asideOpen: boolean;
  asideSize: AppShellSize;
  canvas: AppShellCanvas;
  closeOnNavigate: boolean;
  collapsedTo: AppShellCollapsedTo;
  dividers: boolean;
  escape: AppShellDismissPolicy;
  messages: AppShellMessages;
  modal: boolean;
  /** The resolved mode, which is `auto` answered against the shell's own width. */
  navMode: Exclude<AppShellNavMode, 'auto'> | undefined;
  navSide: AppShellNavSide;
  navSize: AppShellSize;
  open: boolean;
  outsidePress: AppShellDismissPolicy;
  primary: AppShellPrimary;
  scroll: AppShellScroll;
  /** The ids the toggles and the regions use to point at each other. */
  navId: string;
  toggleId: string;
  mainId: string;
  asideId: string;
  asideToggleId: string;
  /** Asks to move the navigation region. A consumer's own handler runs first and may cancel. */
  setOpen: (next: boolean, reason: AppShellOpenReason, source?: unknown) => void;
  /** Asks to move the secondary pane. */
  setAsideOpen: (next: boolean, reason: AppShellAsideOpenReason, source?: unknown) => void;
  /** A region says it exists, so a skip link is never written to a target nobody rendered. */
  register: (region: 'nav' | 'main' | 'aside') => () => void;
  /** The nodes the layer and the focus scope need, and nothing else reads. */
  nodes: {
    aside: HTMLElement | null;
    asideToggle: HTMLElement | null;
    banner: HTMLElement | null;
    footer: HTMLElement | null;
    main: HTMLElement | null;
    nav: HTMLElement | null;
    toggle: HTMLElement | null;
  };
}

/** What `render` receives for the root. */
export interface AppShellRootProps extends HTMLAttributes<HTMLElement> {
  'data-aside-mode'?: 'inline' | 'overlay' | undefined;
  'data-aside-size': AppShellSize;
  'data-canvas': AppShellCanvas;
  'data-collapsed-to': AppShellCollapsedTo;
  'data-dividers'?: '' | undefined;
  'data-nav-mode'?: 'inline' | 'overlay' | undefined;
  'data-nav-side': AppShellNavSide;
  'data-nav-size': AppShellSize;
  'data-open'?: '' | undefined;
  'data-part': string;
  'data-primary': AppShellPrimary;
  'data-scroll': AppShellScroll;
  'data-ui': 'app-shell';
}

type Native<T extends keyof HTMLElementTagNameMap> = Omit<
  ComponentPropsWithRef<T>,
  'children' | 'className' | 'style'
>;

interface Common {
  children?: ReactNode | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export interface AppShellProps extends Omit<Native<'div'>, 'ref'>, Common {
  asideMode?: AppShellAsideMode | undefined;
  /** The controlled value of the secondary pane. */
  asideOpen?: boolean | undefined;
  asideSize?: AppShellSize | undefined;
  canvas?: AppShellCanvas | undefined;
  /** A click on an `a[href]` inside the overlaid region asks to close, with the reason `select`. */
  closeOnNavigate?: boolean | undefined;
  collapsedTo?: AppShellCollapsedTo | undefined;
  /** The uncontrolled starting value of the pane, read once. */
  defaultAsideOpen?: boolean | undefined;
  /** The uncontrolled starting value, read once. */
  defaultNavOpen?: boolean | undefined;
  dividers?: boolean | undefined;
  escape?: AppShellDismissPolicy | undefined;
  /** Strings for this shell, over the provider's and over the family's own. */
  messages?: Partial<AppShellMessages> | undefined;
  /** Whether the overlaid region contains focus and makes the rest of the shell `inert`. */
  modal?: boolean | undefined;
  /** The controlled value. Passing anything but `undefined` puts the shell in controlled mode. */
  navOpen?: boolean | undefined;
  navMode?: AppShellNavMode | undefined;
  navSide?: AppShellNavSide | undefined;
  navSize?: AppShellSize | undefined;
  onAsideOpenChange?: ((open: boolean, request: AppShellAsideOpenRequest) => void) | undefined;
  onNavOpenChange?: ((open: boolean, request: AppShellOpenRequest) => void) | undefined;
  outsidePress?: AppShellDismissPolicy | undefined;
  primary?: AppShellPrimary | undefined;
  ref?: RefObject<AppShellHandle | null> | ((handle: AppShellHandle | null) => void) | undefined;
  /** Substitutes the rendered element, keeping every attribute and listener. */
  render?: ((props: AppShellRootProps) => ReactNode) | undefined;
  scroll?: AppShellScroll | undefined;
}

export interface AppShellBannerProps extends Native<'header'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellBrandProps extends Native<'div'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellActionsProps extends Native<'div'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellCentreProps extends Native<'div'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellNavProps extends Native<'nav'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellNavSectionProps extends Native<'div'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellMainProps extends Native<'main'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellAsideProps extends Native<'aside'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellAsideSectionProps extends Native<'div'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellAsideToggleProps extends Native<'button'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellFooterProps extends Native<'footer'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
export interface AppShellNavToggleProps extends Native<'button'>, Common {
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
