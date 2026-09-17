import { inject, Injectable, InjectionToken } from '@angular/core';

/** Every section in the flow with a heading each, or a strip with one section shown. */
export type DetailPanelLayout = 'stacked' | 'tabs';

/** Which side the aside column takes above 640 pixels; `none` when the consumer renders no aside. */
export type DetailPanelAside = 'end' | 'start' | 'none';

/** The heading rank the page-header defaults to. Stacked sections take the rank below. */
export type DetailPanelLevel = '1' | '2' | '3';

/** The page-header's size default, the sections' size, the body's gap and inset. */
export type DetailPanelSize = 'sm' | 'md' | 'lg';

/** Who scrolls: the host, or the root itself. */
export type DetailPanelScroll = 'ancestor' | 'self';

/** Under `tabs`, when a section's content exists. Inert under `stacked`. */
export type DetailPanelMount = 'active' | 'lazy' | 'eager';

/** Whether the record is there. Under either failure the columns give way to the message. */
export type DetailPanelStatus = 'ready' | 'not-found' | 'error';

/** Why the current section moved. */
export type DetailPanelSectionReason = 'pointer' | 'keyboard' | 'programmatic';

/** The strings the family says on the reader's behalf. */
export interface DetailPanelMessages {
  /** The aside's accessible name. */
  aside: string;
  /** What the root is called while loading and the heading has no words yet. */
  loading: string;
}

export interface DetailPanelDefaults {
  aside: DetailPanelAside;
  layout: DetailPanelLayout;
  level: DetailPanelLevel;
  messages: DetailPanelMessages;
  mount: DetailPanelMount;
  scroll: DetailPanelScroll;
  size: DetailPanelSize;
}

/** The strings the family says before an application says otherwise. */
export const DEFAULT_DETAIL_PANEL_MESSAGES: DetailPanelMessages = {
  aside: 'Detalhes',
  loading: 'A carregar o registo',
};

const FALLBACK: DetailPanelDefaults = {
  aside: 'end',
  layout: 'stacked',
  level: '2',
  messages: DEFAULT_DETAIL_PANEL_MESSAGES,
  mount: 'active',
  scroll: 'ancestor',
  size: 'md',
};

export const DETAIL_PANEL_DEFAULTS = new InjectionToken<DetailPanelDefaults>(
  'slotted detail-panel defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once how its records read — stacked or tabbed, the
 * aside's side, the rank, the size, who scrolls — rather than repeating them
 * on every screen. A panel that states any of them itself still wins.
 */
export function provideDetailPanelDefaults(
  defaults: Partial<Omit<DetailPanelDefaults, 'messages'>> & {
    messages?: Partial<DetailPanelMessages>;
  },
) {
  return {
    provide: DETAIL_PANEL_DEFAULTS,
    useFactory: (): DetailPanelDefaults => ({
      ...FALLBACK,
      ...defaults,
      messages: { ...FALLBACK.messages, ...defaults.messages },
    }),
  };
}

export function injectDetailPanelDefaults(): DetailPanelDefaults {
  return inject(DETAIL_PANEL_DEFAULTS);
}

@Injectable({ providedIn: 'root' })
export class SlDetailPanelIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-detail-panel-${this.count}`;
  }
}
