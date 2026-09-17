import { inject, Injectable, InjectionToken } from '@angular/core';

import { DEFAULT_LEVELS } from '@slotted/core/outline';

/** The row height step, on the control scale. */
export type TableOfContentsSize = 'sm' | 'md' | 'lg';

/**
 * The column beside a page, the bar under its title, or the trigger with the
 * current label that opens the list under it. Not decided by width: a sidebar
 * column is narrower than a phone's bar, so the width does not say which one
 * the consumer wants.
 */
export type TableOfContentsLayout = 'vertical' | 'horizontal' | 'collapsed';

/** What a press does to the URL. `push` and `replace` write `history`; `none` leaves it. */
export type TableOfContentsHistory = 'push' | 'replace' | 'none';

/** Why the current target moved. `scroll` is the observer answering the position. */
export type TableOfContentsValueReason = 'scroll' | 'pointer' | 'keyboard' | 'programmatic';

/** Why the collapsed list opened or closed. */
export type TableOfContentsOpenReason =
  'pointer' | 'keyboard' | 'select' | 'escape' | 'outsidePress' | 'programmatic';

/** One entry of the list, when the list is given as data. */
export interface TableOfContentsItemData {
  /** The target's id, without the hash. */
  id: string;
  label: string;
  children?: readonly TableOfContentsItemData[] | undefined;
}

/** The strings the family writes itself, replaceable once per application. */
export interface TableOfContentsMessages {
  /** The landmark's name when the consumer gives none, and the collapsed trigger's fixed text. */
  navigation: string;
}

/** What an application sets once for every list under it. */
export interface TableOfContentsDefaults {
  history: TableOfContentsHistory;
  landmark: boolean;
  layout: TableOfContentsLayout;
  levels: readonly [number, number];
  messages: TableOfContentsMessages;
  numbered: boolean;
  offset: number;
  size: TableOfContentsSize;
  sticky: boolean;
}

export const DEFAULT_TABLE_OF_CONTENTS_MESSAGES: TableOfContentsMessages = {
  navigation: 'Nesta página',
};

/** The contract's defaults. */
export const TABLE_OF_CONTENTS_FALLBACK: TableOfContentsDefaults = {
  history: 'push',
  landmark: true,
  layout: 'vertical',
  levels: DEFAULT_LEVELS,
  messages: DEFAULT_TABLE_OF_CONTENTS_MESSAGES,
  numbered: false,
  offset: 0,
  size: 'md',
  sticky: false,
};

export const TABLE_OF_CONTENTS_DEFAULTS = new InjectionToken<TableOfContentsDefaults>(
  'slotted table-of-contents defaults',
  { providedIn: 'root', factory: () => TABLE_OF_CONTENTS_FALLBACK },
);

/**
 * An application decides once how its lists read — the levels a document
 * outlines, whether the column pins, what a press does to the URL — rather
 * than repeating it on every page. A list that states any of them itself
 * still wins.
 */
export function provideTableOfContentsDefaults(
  defaults: Partial<Omit<TableOfContentsDefaults, 'messages'>> & {
    messages?: Partial<TableOfContentsMessages>;
  },
) {
  return {
    provide: TABLE_OF_CONTENTS_DEFAULTS,
    useFactory: (): TableOfContentsDefaults => ({
      ...TABLE_OF_CONTENTS_FALLBACK,
      ...defaults,
      messages: { ...TABLE_OF_CONTENTS_FALLBACK.messages, ...defaults.messages },
    }),
  };
}

export function injectTableOfContentsDefaults(): TableOfContentsDefaults {
  return inject(TABLE_OF_CONTENTS_DEFAULTS);
}

@Injectable({ providedIn: 'root' })
export class SlTableOfContentsIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-table-of-contents-${this.count}`;
  }
}
