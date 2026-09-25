import { inject, InjectionToken } from '@angular/core';

/**
 * Which region reaches the corner of the screen. `banner` spans the full width
 * and the navigation starts below it; `nav` spans the full height and the
 * banner starts beside it. The grid changes where a region is drawn and never
 * where it is written, so the focus order is the same under both.
 */
export type AppShellPrimary = 'banner' | 'nav';

/**
 * Which surface carries which plane. `inset` paints the frame with the sunken
 * ground and makes the content a raised card; `flush` is the other way round,
 * edge to edge, separated by a rule.
 */
export type AppShellCanvas = 'inset' | 'flush';

/**
 * How the navigation region occupies space. `auto` is `inline` at or above the
 * shell's own `APP_SHELL_OVERLAY_AT` inline size and `overlay` below it.
 */
export type AppShellNavMode = 'inline' | 'overlay' | 'auto';

/** How the secondary pane occupies space: the navigation's pair, resolved on the same width. */
export type AppShellAsideMode = 'inline' | 'overlay' | 'auto';

/** Which end of the line the navigation region sits at. Logical, so the layout mirrors. */
export type AppShellNavSide = 'start' | 'end';

/** What a closed inline navigation leaves behind. */
export type AppShellCollapsedTo = 'rail' | 'hidden';

/** A step on the region's own width scale. */
export type AppShellSize = 'sm' | 'md' | 'lg';

/** Who scrolls: the content column, or the document. */
export type AppShellScroll = 'content' | 'document';

/** Whether a dismissal source closes the overlaid navigation. */
export type AppShellDismissPolicy = 'close' | 'none';

/** Why the navigation region opened or closed. */
export type AppShellOpenReason =
  | 'pointer'
  | 'keyboard'
  | 'escape'
  | 'outsidePress'
  | 'back'
  | 'select'
  | 'resize'
  | 'programmatic';

/** Why the secondary pane opened or closed. No `select`: a pane has no destinations. */
export type AppShellAsideOpenReason = Exclude<AppShellOpenReason, 'select'>;

/** The request the shell makes before the region moves. Cancel it and nothing commits. */
export interface AppShellOpenRequest {
  readonly value: boolean;
  readonly previous: boolean;
  readonly reason: AppShellOpenReason;
  readonly source?: unknown;
  readonly cancelled: boolean;
  cancel(): void;
}

/** The strings the family says on the reader's behalf. */
export interface AppShellMessages {
  nav: string;
  open: string;
  close: string;
  aside: string;
  openAside: string;
  closeAside: string;
  skipToMain: string;
  skipToNav: string;
  skipToAside: string;
}

export interface AppShellDefaults {
  asideMode: AppShellAsideMode;
  asideSize: AppShellSize;
  canvas: AppShellCanvas;
  closeOnNavigate: boolean;
  collapsedTo: AppShellCollapsedTo;
  dividers: boolean;
  escape: AppShellDismissPolicy;
  /** The platform's way back — a phone's gesture, a browser's button — closes a modal layer. */
  back: AppShellDismissPolicy;
  messages: AppShellMessages;
  modal: boolean;
  navMode: AppShellNavMode;
  navSide: AppShellNavSide;
  navSize: AppShellSize;
  outsidePress: AppShellDismissPolicy;
  primary: AppShellPrimary;
  scroll: AppShellScroll;
}

/** The strings the family says before an application says otherwise. */
export const DEFAULT_APP_SHELL_MESSAGES: AppShellMessages = {
  nav: 'Navegação principal',
  open: 'Abrir navegação',
  close: 'Fechar navegação',
  aside: 'Painel lateral',
  openAside: 'Abrir painel lateral',
  closeAside: 'Fechar painel lateral',
  skipToMain: 'Saltar para o conteúdo',
  skipToNav: 'Saltar para a navegação',
  skipToAside: 'Saltar para o painel lateral',
};

const FALLBACK: AppShellDefaults = {
  asideMode: 'auto',
  asideSize: 'md',
  canvas: 'inset',
  closeOnNavigate: true,
  collapsedTo: 'rail',
  dividers: true,
  escape: 'close',
  back: 'close',
  messages: DEFAULT_APP_SHELL_MESSAGES,
  modal: true,
  navMode: 'auto',
  navSide: 'start',
  navSize: 'md',
  outsidePress: 'close',
  primary: 'banner',
  scroll: 'content',
};

export const APP_SHELL_DEFAULTS = new InjectionToken<AppShellDefaults>(
  'slotted app shell defaults',
  {
    providedIn: 'root',
    factory: () => FALLBACK,
  },
);

/**
 * An application decides once how its shell is arranged — which region reaches
 * the corner, which plane the content sits on, how the navigation behaves when
 * the space runs out — rather than repeating the same inputs on every route. A
 * shell that states any of them itself still wins.
 */
export function provideAppShellDefaults(
  defaults: Partial<Omit<AppShellDefaults, 'messages'>> & { messages?: Partial<AppShellMessages> },
) {
  return {
    provide: APP_SHELL_DEFAULTS,
    useFactory: (): AppShellDefaults => ({
      ...FALLBACK,
      ...defaults,
      messages: { ...FALLBACK.messages, ...defaults.messages },
    }),
  };
}

/** What a shell renders as here, before it states anything of its own. */
export function injectAppShellDefaults(): AppShellDefaults {
  return inject(APP_SHELL_DEFAULTS);
}
