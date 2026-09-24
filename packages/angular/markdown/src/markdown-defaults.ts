import { inject, InjectionToken } from '@angular/core';
import type { MarkdownAlertType, MarkdownNode, MarkdownUrlKind } from '@slotted/core/markdown';

/** Where a link that leaves the application opens. */
export type MarkdownExternal = 'new-tab' | 'same-tab';

/** Every string the family writes itself, for translation. */
export interface MarkdownLabels {
  empty: string;
  error: string;
  retry: string;
  loading: string;
  footnotes: string;
  backReference: (number: number, occurrence: number) => string;
  anchor: (heading: string) => string;
  alerts: Record<MarkdownAlertType, string>;
}

/** What an application sets once for every document under it. */
export interface MarkdownDefaults {
  alerts?: boolean | undefined;
  allow?: readonly string[] | undefined;
  external?: MarkdownExternal | undefined;
  headingAnchors?: boolean | undefined;
  isExternal?: ((href: string) => boolean) | undefined;
  labels?: Partial<MarkdownLabels> | undefined;
  transformUrl?:
    ((url: string, kind: MarkdownUrlKind, node: MarkdownNode) => string | null) | undefined;
}

/** The family's own strings, in the language the library ships its fallbacks in. */
export const MARKDOWN_LABELS: MarkdownLabels = {
  alerts: {
    caution: 'Caution',
    important: 'Important',
    note: 'Note',
    tip: 'Tip',
    warning: 'Warning',
  },
  anchor: (heading) => `Link to section: ${heading}`,
  backReference: (number, occurrence) =>
    occurrence > 1 ? `Back to reference ${number}-${occurrence}` : `Back to reference ${number}`,
  empty: 'This document has no content yet.',
  error: 'The document could not be loaded.',
  footnotes: 'Footnotes',
  loading: 'Loading document',
  retry: 'Try again',
};

export const MARKDOWN_DEFAULTS = new InjectionToken<MarkdownDefaults>('slotted markdown defaults', {
  providedIn: 'root',
  factory: (): MarkdownDefaults => ({}),
});

/**
 * An application decides once how its documents treat links, alerts, anchors
 * and URLs, and what the family's strings say in its language. A document
 * that states any of them itself still wins.
 */
export function provideMarkdownDefaults(defaults: MarkdownDefaults) {
  return { provide: MARKDOWN_DEFAULTS, useValue: defaults };
}

export function injectMarkdownDefaults(): MarkdownDefaults {
  return inject(MARKDOWN_DEFAULTS);
}
