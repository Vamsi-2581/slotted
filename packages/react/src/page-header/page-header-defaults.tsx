import { createContext, useContext } from 'react';

import type {
  PageHeaderDefaults,
  PageHeaderDefaultsProviderProps,
  PageHeaderMessages,
} from './page-header.types';

/** The strings the family says before an application says otherwise. */
export const DEFAULT_PAGE_HEADER_MESSAGES: PageHeaderMessages = {
  expand: 'Expandir cabeçalho',
  collapse: 'Recolher cabeçalho',
  pin: 'Fixar cabeçalho',
  unpin: 'Soltar cabeçalho',
  headerArea: 'Cabeçalho da página',
};

const FALLBACK: PageHeaderDefaults = {
  collapse: 'scroll',
  level: '1',
  messages: DEFAULT_PAGE_HEADER_MESSAGES,
  size: 'md',
};

const PageHeaderDefaultsContext = createContext<PageHeaderDefaults>(FALLBACK);

/** What a page header renders as here, before it states anything of its own. */
export function usePageHeaderDefaults(): PageHeaderDefaults {
  return useContext(PageHeaderDefaultsContext);
}

/**
 * An application decides once how its page headers behave — the size, the
 * rank, whether a scroll collapses the area, and the words the two controls
 * say — rather than repeating them on every screen. A header that states any
 * of them itself still wins.
 */
export function PageHeaderDefaultsProvider({
  children,
  messages,
  ...defaults
}: PageHeaderDefaultsProviderProps) {
  const inherited = usePageHeaderDefaults();

  return (
    <PageHeaderDefaultsContext.Provider
      value={{
        collapse: defaults.collapse ?? inherited.collapse,
        level: defaults.level ?? inherited.level,
        messages: { ...inherited.messages, ...messages },
        size: defaults.size ?? inherited.size,
      }}
    >
      {children}
    </PageHeaderDefaultsContext.Provider>
  );
}
