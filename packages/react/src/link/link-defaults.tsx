import { createContext, useContext } from 'react';

import type { LinkDefaults, LinkDefaultsProviderProps } from './link.types';

const LinkDefaultsContext = createContext<LinkDefaults>({});

export function useLinkDefaults(): LinkDefaults {
  return useContext(LinkDefaultsContext);
}

/**
 * An application decides once whether its links are underlined, how they are
 * painted, whether a followed destination is marked, and what a new tab is
 * called in the language it ships. A link that states any of those itself
 * still wins: an explicit prop is never overridden by context.
 */
export function LinkDefaultsProvider({ children, ...defaults }: LinkDefaultsProviderProps) {
  const inherited = useLinkDefaults();

  return (
    <LinkDefaultsContext.Provider
      value={{
        externalHint: defaults.externalHint ?? inherited.externalHint,
        underline: defaults.underline ?? inherited.underline,
        variant: defaults.variant ?? inherited.variant,
        visited: defaults.visited ?? inherited.visited,
      }}
    >
      {children}
    </LinkDefaultsContext.Provider>
  );
}
