import { DEFAULT_DASHBOARD_GRID_LABELS } from '@slotted/core/dashboard-grid';
import { createContext, useContext } from 'react';

import type {
  DashboardGridDefaults,
  DashboardGridDefaultsProviderProps,
} from './dashboard-grid.types';

export const DASHBOARD_GRID_FALLBACK: DashboardGridDefaults = {
  columns: 12,
  editBar: true,
  headingLevel: 3,
  labels: DEFAULT_DASHBOARD_GRID_LABELS,
};

const DashboardGridDefaultsContext = createContext<DashboardGridDefaults>(DASHBOARD_GRID_FALLBACK);

/** What a dashboard renders as here, before it states anything of its own. */
export function useDashboardGridDefaults(): DashboardGridDefaults {
  return useContext(DashboardGridDefaultsContext);
}

/**
 * An application decides once how many columns its dashboards have, whether
 * the family draws the edit bar, the level of a widget's title and what the
 * family says. A grid that states any of it itself still wins, and a nested
 * provider overrides only what it names.
 */
export function DashboardGridDefaultsProvider({
  children,
  labels,
  ...rest
}: DashboardGridDefaultsProviderProps) {
  const inherited = useDashboardGridDefaults();
  return (
    <DashboardGridDefaultsContext.Provider
      value={{
        columns: rest.columns ?? inherited.columns,
        editBar: rest.editBar ?? inherited.editBar,
        headingLevel: rest.headingLevel ?? inherited.headingLevel,
        labels: { ...inherited.labels, ...labels },
      }}
    >
      {children}
    </DashboardGridDefaultsContext.Provider>
  );
}
