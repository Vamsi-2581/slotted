import { createContext, useContext } from 'react';

import type {
  MarkdownDefaults,
  MarkdownDefaultsProviderProps,
  MarkdownLabels,
} from './markdown.types';

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

const MarkdownDefaultsContext = createContext<MarkdownDefaults>({});

export function useMarkdownDefaults(): MarkdownDefaults {
  return useContext(MarkdownDefaultsContext);
}

/**
 * An application decides once how its documents treat links, alerts, anchors
 * and URLs, and what the family's strings say in its language. A document
 * that states any of them itself still wins; a nested provider narrows the
 * decision for one part of the page, and its labels merge over the outer ones.
 */
export function MarkdownDefaultsProvider({ children, ...defaults }: MarkdownDefaultsProviderProps) {
  const inherited = useMarkdownDefaults();

  return (
    <MarkdownDefaultsContext.Provider
      value={{
        alerts: defaults.alerts ?? inherited.alerts,
        allow: defaults.allow ?? inherited.allow,
        external: defaults.external ?? inherited.external,
        headingAnchors: defaults.headingAnchors ?? inherited.headingAnchors,
        isExternal: defaults.isExternal ?? inherited.isExternal,
        labels: { ...inherited.labels, ...defaults.labels },
        transformUrl: defaults.transformUrl ?? inherited.transformUrl,
      }}
    >
      {children}
    </MarkdownDefaultsContext.Provider>
  );
}
