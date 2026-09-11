import { createContext, useContext } from 'react';

import type { PageDefaults, PageDefaultsProviderProps } from './page.types';

/** The strings the family says before an application says otherwise. */
export const DEFAULT_PAGE_MESSAGES = {
  footer: 'Ações da página',
} as const;

const FALLBACK: PageDefaults = {
  ground: 'sunken',
  inset: 6,
  landmark: 'main',
  messages: DEFAULT_PAGE_MESSAGES,
  scroll: 'ancestor',
  width: 'wide',
};

const PageDefaultsContext = createContext<PageDefaults>(FALLBACK);

/** What a page renders as here, before it states anything of its own. */
export function usePageDefaults(): PageDefaults {
  return useContext(PageDefaultsContext);
}

/**
 * An application decides once how its pages are laid out — the measure, the
 * inset, who scrolls, the ground — rather than repeating the same props on
 * every route. A page that states any of them itself still wins.
 */
export function PageDefaultsProvider({
  children,
  messages,
  ...defaults
}: PageDefaultsProviderProps) {
  const inherited = usePageDefaults();

  return (
    <PageDefaultsContext.Provider
      value={{
        ground: defaults.ground ?? inherited.ground,
        inset: defaults.inset ?? inherited.inset,
        landmark: defaults.landmark ?? inherited.landmark,
        messages: { ...inherited.messages, ...messages },
        scroll: defaults.scroll ?? inherited.scroll,
        width: defaults.width ?? inherited.width,
      }}
    >
      {children}
    </PageDefaultsContext.Provider>
  );
}
