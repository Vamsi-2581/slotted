import { createContext, useContext, useMemo } from 'react';

import type {
  StatusIndicatorDefaults,
  StatusIndicatorDefaultsProviderProps,
} from './status-indicator.types';

const StatusIndicatorDefaultsContext = createContext<StatusIndicatorDefaults>({});

export function useStatusIndicatorDefaults(): StatusIndicatorDefaults {
  return useContext(StatusIndicatorDefaultsContext);
}

/**
 * An application decides once how its statuses are marked, how large they are,
 * whether they announce, and what each of the six is called in the language it
 * ships. A single indicator that states any of those still wins: an explicit
 * prop is never overridden by context.
 *
 * The wording is the reason this provider matters more than most. Six words
 * appear on every page of a product, and the alternative to setting them once
 * is a translation call at every call site — which is what a team ends up
 * writing when the family hard-codes English, as Fluent's presence badge does.
 *
 * The tables merge rather than replace, so a page that renames one status
 * keeps the five its parent named.
 */
export function StatusIndicatorDefaultsProvider({
  children,
  labels,
  live,
  mark,
  size,
}: StatusIndicatorDefaultsProviderProps) {
  const inherited = useStatusIndicatorDefaults();
  const value = useMemo(
    () => ({
      labels:
        labels === undefined && inherited.labels === undefined
          ? undefined
          : { ...inherited.labels, ...labels },
      live: live ?? inherited.live,
      mark: mark ?? inherited.mark,
      size: size ?? inherited.size,
    }),
    [labels, live, mark, size, inherited],
  );

  return (
    <StatusIndicatorDefaultsContext.Provider value={value}>
      {children}
    </StatusIndicatorDefaultsContext.Provider>
  );
}
