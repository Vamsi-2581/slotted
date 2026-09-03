import { createContext, useContext } from 'react';

import type { BreadcrumbDefaults, BreadcrumbDefaultsProviderProps } from './breadcrumb.types';

const BreadcrumbDefaultsContext = createContext<BreadcrumbDefaults>({});

export function useBreadcrumbDefaults(): BreadcrumbDefaults {
  return useContext(BreadcrumbDefaultsContext);
}

/**
 * An application decides once what its trails are called, how deep they may get
 * before they fold, and what is drawn between two crumbs. A trail that states
 * any of those itself still wins: an explicit prop is never overridden by
 * context.
 */
export function BreadcrumbDefaultsProvider({
  children,
  ...defaults
}: BreadcrumbDefaultsProviderProps) {
  const inherited = useBreadcrumbDefaults();

  return (
    <BreadcrumbDefaultsContext.Provider
      value={{
        itemsAfterCollapse: defaults.itemsAfterCollapse ?? inherited.itemsAfterCollapse,
        itemsBeforeCollapse: defaults.itemsBeforeCollapse ?? inherited.itemsBeforeCollapse,
        label: defaults.label ?? inherited.label,
        maxItems: defaults.maxItems ?? inherited.maxItems,
        separator: defaults.separator ?? inherited.separator,
      }}
    >
      {children}
    </BreadcrumbDefaultsContext.Provider>
  );
}
