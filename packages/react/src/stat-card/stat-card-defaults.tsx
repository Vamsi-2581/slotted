import { createContext, useContext } from 'react';

import type { StatCardDefaults, StatCardDefaultsProviderProps } from './stat-card.types';

const StatCardDefaultsContext = createContext<StatCardDefaults>({});

export function useStatCardDefaults(): StatCardDefaults {
  return useContext(StatCardDefaultsContext);
}

/**
 * An application decides once which way is good, how its numbers read, in
 * which language, and which frame and size its cards take. A card that states
 * any of those still wins: an explicit prop is never overridden by context.
 */
export function StatCardDefaultsProvider({ children, ...defaults }: StatCardDefaultsProviderProps) {
  const inherited = useStatCardDefaults();

  return (
    <StatCardDefaultsContext.Provider
      value={{
        fill: defaults.fill ?? inherited.fill,
        formatOptions: defaults.formatOptions ?? inherited.formatOptions,
        goodWhen: defaults.goodWhen ?? inherited.goodWhen,
        layout: defaults.layout ?? inherited.layout,
        locale: defaults.locale ?? inherited.locale,
        messages: { ...inherited.messages, ...defaults.messages },
        size: defaults.size ?? inherited.size,
      }}
    >
      {children}
    </StatCardDefaultsContext.Provider>
  );
}
