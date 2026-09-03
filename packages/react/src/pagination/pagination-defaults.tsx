import { createContext, useContext } from 'react';

import type { PaginationDefaults, PaginationDefaultsProviderProps } from './pagination.types';

const PaginationDefaultsContext = createContext<PaginationDefaults>({});

export function usePaginationDefaults(): PaginationDefaults {
  return useContext(PaginationDefaultsContext);
}

/**
 * An application decides once how wide its rows of pages are, how many items a
 * page holds, what the controls are called in the language it ships, and
 * whether a page change is announced. A paginator that states any of those
 * itself still wins: an explicit prop is never overridden by context.
 *
 * `labels` is merged rather than replaced, so an application translating one
 * sentence keeps the other seven.
 */
export function PaginationDefaultsProvider({
  children,
  ...defaults
}: PaginationDefaultsProviderProps) {
  const inherited = usePaginationDefaults();

  return (
    <PaginationDefaultsContext.Provider
      value={{
        boundaryCount: defaults.boundaryCount ?? inherited.boundaryCount,
        defaultPageSize: defaults.defaultPageSize ?? inherited.defaultPageSize,
        label: defaults.label ?? inherited.label,
        labels: { ...inherited.labels, ...defaults.labels },
        live: defaults.live ?? inherited.live,
        pageSizeOptions: defaults.pageSizeOptions ?? inherited.pageSizeOptions,
        siblingCount: defaults.siblingCount ?? inherited.siblingCount,
      }}
    >
      {children}
    </PaginationDefaultsContext.Provider>
  );
}
