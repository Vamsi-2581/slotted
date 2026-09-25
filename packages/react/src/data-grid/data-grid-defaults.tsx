import { createContext, useContext, useMemo } from 'react';

import type {
  DataGridDefaults,
  DataGridDefaultsProviderProps,
  DataGridLabels,
  DataGridResolvedLabels,
} from './data-grid.types';

/**
 * The words the family says when nothing else says them. English because the
 * package is; replaceable once for an application through the provider, and
 * once per grid. `{count}`, `{column}`, `{order}`, `{width}`, `{start}`,
 * `{end}` and `{total}` are the slots a binding fills.
 */
export const DEFAULT_DATA_GRID_LABELS: DataGridResolvedLabels = {
  selectRow: 'Select row',
  selectAll: 'Select all rows',
  selectAllFiltered: 'Select all {count} rows',
  selectAllPage: 'Select the {count} rows on this page',
  expand: 'Show details',
  collapse: 'Hide details',
  expandGroup: 'Expand group',
  collapseGroup: 'Collapse group',
  groupCount: '{count} rows',
  sortedBy: 'Sorted by {order}',
  sortAscending: '{column} ascending',
  sortDescending: '{column} descending',
  sortCleared: 'sorting removed',
  sortAscendingAction: 'Sort ascending',
  sortDescendingAction: 'Sort descending',
  sortClearAction: 'Remove sort',
  columnMenu: 'Column menu',
  columnHelp: 'About {column}',
  pinStart: 'Pin to start',
  pinEnd: 'Pin to end',
  unpin: 'Unpin',
  hide: 'Hide column',
  columnHidden: '{column} hidden',
  autofit: 'Fit to content',
  autofitAll: 'Fit all columns',
  manageColumns: 'Manage columns',
  popinHeader: 'Details',
  resized: '{column}, {width} pixels',
  resize: 'Resize column',
  reorderRow: 'Reorder {row}',
  rowMoved: '{row} moved to position {position}',
  filter: 'Filter',
  filterClear: 'Clear',
  filterApply: 'Apply',
  filterCleared: 'filter removed',
  filterOperator: 'Condition',
  filterValue: 'Value',
  filterFrom: 'From',
  filterTo: 'To',
  filterJoin: 'Match',
  filterAny: 'Any',
  filterYes: 'Yes',
  filterNo: 'No',
  filterResults: '{count} rows match',
  filterJoins: { and: 'And', or: 'Or' },
  filterOperators: {
    contains: 'Contains',
    notContains: 'Does not contain',
    equals: 'Equals',
    notEquals: 'Does not equal',
    startsWith: 'Begins with',
    endsWith: 'Ends with',
    greaterThan: 'Greater than',
    greaterThanOrEqual: 'Greater than or equal to',
    lessThan: 'Less than',
    lessThanOrEqual: 'Less than or equal to',
    between: 'Between',
    is: 'Is',
    isNot: 'Is not',
    before: 'Before',
    after: 'After',
    anyOf: 'Is any of',
    noneOf: 'Is none of',
    empty: 'Is empty',
    notEmpty: 'Is not empty',
  },
  /**
   * One typographic character per operator, for the filter row's symbol
   * button. They are text and not glyphs: `⊃` and `≠` carry meaning as
   * characters, the way `kbd` writes `⌘`, and the button's accessible name
   * says the operator in full.
   */
  filterSymbols: {
    contains: '⊃',
    notContains: '⊅',
    equals: '=',
    notEquals: '≠',
    startsWith: '^',
    endsWith: '$',
    greaterThan: '>',
    greaterThanOrEqual: '≥',
    lessThan: '<',
    lessThanOrEqual: '≤',
    between: '↔',
    is: '=',
    isNot: '≠',
    before: '<',
    after: '>',
    anyOf: '∈',
    noneOf: '∉',
    empty: '∅',
    notEmpty: '∄',
  },
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  editConflict: 'This value changed while you were editing',
  editFailed: 'The change could not be saved',
  copied: '{count} cells copied',
  empty: 'No rows',
  noResults: 'No rows match the current filters',
  clearFilters: 'Clear filters',
  error: 'The rows could not be loaded',
  retry: 'Try again',
  loadMore: 'Load more',
  range: '{start}–{end} of {total}',
  rangeUnknown: '{start}–{end}',
  grid: 'Data grid',
  scroll: 'Data grid, scrollable',
};

const LABEL_MAPS = ['filterJoins', 'filterOperators', 'filterSymbols'] as const;

/** An explicit value wins and an absent one defers; the three maps merge entry by entry. */
export function resolveLabels(
  ...layers: readonly (DataGridLabels | undefined)[]
): DataGridResolvedLabels {
  const resolved: DataGridResolvedLabels = {
    ...DEFAULT_DATA_GRID_LABELS,
    filterJoins: { ...DEFAULT_DATA_GRID_LABELS.filterJoins },
    filterOperators: { ...DEFAULT_DATA_GRID_LABELS.filterOperators },
    filterSymbols: { ...DEFAULT_DATA_GRID_LABELS.filterSymbols },
  };
  for (const layer of layers) {
    if (!layer) continue;
    for (const [key, value] of Object.entries(layer)) {
      if (value === undefined) continue;
      if ((LABEL_MAPS as readonly string[]).includes(key)) {
        Object.assign(resolved[key as (typeof LABEL_MAPS)[number]], value);
      } else {
        (resolved as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }
  return resolved;
}

/** Fills `{name}` slots in a label. */
export function fill(label: string, slots: Record<string, string | number>): string {
  return label.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in slots ? String(slots[name]) : match,
  );
}

const DataGridDefaultsContext = createContext<DataGridDefaults>({});

export function DataGridDefaultsProvider({ children, ...defaults }: DataGridDefaultsProviderProps) {
  const parent = useContext(DataGridDefaultsContext);
  /* Rebuilt on every render of the provider, which is rare: a provider stands
     at the top of an application and its props do not move. */
  const merged: DataGridDefaults = { ...parent };
  for (const [key, entry] of Object.entries(defaults)) {
    if (entry !== undefined) (merged as Record<string, unknown>)[key] = entry;
  }
  if (parent.labels || defaults.labels)
    merged.labels = resolveLabels(parent.labels, defaults.labels);
  const value = useMemo(() => merged, [JSON.stringify(merged)]);
  return (
    <DataGridDefaultsContext.Provider value={value}>{children}</DataGridDefaultsContext.Provider>
  );
}

export function useDataGridDefaults(): DataGridDefaults {
  return useContext(DataGridDefaultsContext);
}
