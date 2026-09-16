import { createContext, useContext, useMemo } from 'react';

import type {
  TopNavigationDefaults,
  TopNavigationDefaultsProviderProps,
  TopNavigationMessages,
} from './top-navigation.types';

export const DEFAULT_TOP_NAVIGATION_MESSAGES: TopNavigationMessages = {
  account: 'Conta',
  closeSearch: 'Fechar procura',
  help: 'Ajuda',
  more: 'Mais',
  navigation: 'Navegação',
  notifications: 'Notificações',
  search: 'Procurar',
  skip: 'Saltar para o conteúdo',
};

/** The contract's defaults. */
export const TOP_NAVIGATION_FALLBACK: TopNavigationDefaults = {
  frame: true,
  landmark: true,
  messages: DEFAULT_TOP_NAVIGATION_MESSAGES,
  size: 'md',
};

const TopNavigationDefaultsContext = createContext<TopNavigationDefaults>(TOP_NAVIGATION_FALLBACK);

/** What a bar renders as here, before it states anything of its own. */
export function useTopNavigationDefaults(): TopNavigationDefaults {
  return useContext(TopNavigationDefaultsContext);
}

/**
 * An application decides once how its bars read — the size, the frame, the
 * words on the controls that have no visible text — rather than repeating it
 * on every bar in a product. A bar that states any of them itself still wins.
 */
export function TopNavigationDefaultsProvider({
  children,
  messages,
  ...defaults
}: TopNavigationDefaultsProviderProps) {
  const inherited = useTopNavigationDefaults();

  const value = useMemo<TopNavigationDefaults>(
    () => ({
      frame: defaults.frame ?? inherited.frame,
      landmark: defaults.landmark ?? inherited.landmark,
      messages: { ...inherited.messages, ...messages },
      size: defaults.size ?? inherited.size,
    }),
    [defaults.frame, defaults.landmark, defaults.size, inherited, messages],
  );

  return (
    <TopNavigationDefaultsContext.Provider value={value}>
      {children}
    </TopNavigationDefaultsContext.Provider>
  );
}
