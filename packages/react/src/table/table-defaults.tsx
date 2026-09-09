import { createContext, useContext } from 'react';

import type {
  TableDefaults,
  TableDefaultsProviderProps,
  TableLabels,
  TableResolvedLabels,
} from './table.types';

/**
 * The words the family says when nothing else says them. They are English
 * because the package is, and every one of them is replaceable in two places:
 * once for an application, through the provider below, and once for a table.
 *
 * `selectRow` and `selectAll` are the halves of a name the family completes: a
 * row's checkbox is named for the row it chooses, and the header's states the
 * count it covers.
 */
export const DEFAULT_TABLE_LABELS: TableResolvedLabels = {
  collapse: 'Hide details',
  expand: 'Show details',
  scroll: 'Table, scrollable',
  selectAll: 'Select all rows',
  selectRow: 'Select row',
  sortCleared: 'sorting removed',
  sortedAscending: 'sorted ascending',
  sortedDescending: 'sorted descending',
};

/**
 * An explicit value wins, and an absent one defers. Spreading two objects would
 * not do it: a property written as `undefined` is a property, and it would
 * overwrite the answer the provider had already given.
 */
export function resolveLabels(...sources: (TableLabels | undefined)[]): TableResolvedLabels {
  const answered: TableResolvedLabels = { ...DEFAULT_TABLE_LABELS };
  for (const source of sources) {
    for (const key of Object.keys(source ?? {}) as (keyof TableLabels)[]) {
      answered[key] = source?.[key] ?? answered[key];
    }
  }
  return answered;
}

const TableDefaultsContext = createContext<TableDefaults>({});

export function useTableDefaults(): TableDefaults {
  return useContext(TableDefaultsContext);
}

/**
 * An application decides once how its tables are framed, how they select and
 * what their controls are called. A table that states any of it itself still
 * wins: an explicit prop is never overridden by context.
 */
export function TableDefaultsProvider({ children, ...defaults }: TableDefaultsProviderProps) {
  const inherited = useTableDefaults();

  return (
    <TableDefaultsContext.Provider
      value={{
        columns: defaults.columns ?? inherited.columns,
        labels: resolveLabels(inherited.labels, defaults.labels),
        layout: defaults.layout ?? inherited.layout,
        selectionMode: defaults.selectionMode ?? inherited.selectionMode,
        stickyHeader: defaults.stickyHeader ?? inherited.stickyHeader,
        stickyTo: defaults.stickyTo ?? inherited.stickyTo,
        striped: defaults.striped ?? inherited.striped,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </TableDefaultsContext.Provider>
  );
}
