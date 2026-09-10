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
  filter: 'Filter',
  filterApply: 'Apply',
  filterCleared: 'filter removed',
  filterClear: 'Clear',
  filterConditionAdded: 'second condition added',
  filterEmpty: 'No values match',
  filterFrom: 'From',
  filterJoin: 'Match',
  filterJoins: { and: 'And', or: 'Or' },
  filterMatches: 'values match',
  filterOperandsNone: 'no value needed',
  filterOperandsOne: 'one value',
  filterOperandsTwo: 'two values',
  filterOperator: 'Condition',
  /**
   * Keyed by the engine's operator rather than by kind, so a column of dates
   * and a column of numbers read one word for `between`. An application that
   * translates them replaces the entries it names and keeps the rest, which is
   * what `resolveLabels` merges for.
   */
  filterOperators: {
    after: 'After',
    anyOf: 'Is any of',
    before: 'Before',
    between: 'Between',
    contains: 'Contains',
    empty: 'Is empty',
    endsWith: 'Ends with',
    equals: 'Equals',
    greaterThan: 'Greater than',
    greaterThanOrEqual: 'Greater than or equal to',
    is: 'Is',
    isNot: 'Is not',
    lessThan: 'Less than',
    lessThanOrEqual: 'Less than or equal to',
    noneOf: 'Is none of',
    notContains: 'Does not contain',
    notEmpty: 'Is not empty',
    notEquals: 'Does not equal',
    startsWith: 'Begins with',
  },
  filterSearch: 'Search values',
  filterSelectAll: 'All',
  filterTo: 'To',
  filterValue: 'Value',

  scroll: 'Table, scrollable',
  selectAll: 'Select all rows',
  selectRow: 'Select row',
  sortCleared: 'sorting removed',
  sortedAscending: 'sorted ascending',
  sortedDescending: 'sorted descending',
};

/** The two labels that are maps, and are therefore merged rather than replaced. */
const LABEL_MAPS = ['filterJoins', 'filterOperators'] as const;

/**
 * An explicit value wins, and an absent one defers. Spreading two objects would
 * not do it: a property written as `undefined` is a property, and it would
 * overwrite the answer the provider had already given.
 */
export function resolveLabels(...sources: (TableLabels | undefined)[]): TableResolvedLabels {
  const answered: TableResolvedLabels = { ...DEFAULT_TABLE_LABELS };
  for (const map of LABEL_MAPS) answered[map] = { ...DEFAULT_TABLE_LABELS[map] };

  for (const source of sources) {
    for (const key of Object.keys(source ?? {}) as (keyof TableLabels)[]) {
      const said = source?.[key];
      if (said === undefined) continue;
      /* An application that renames one operator keeps the other eighteen. A
         shallow assignment here would leave a panel with one word and a column
         of raw operator keys beside it. */
      if (typeof said === 'object')
        Object.assign(answered[key as (typeof LABEL_MAPS)[number]], said);
      else answered[key] = said as never;
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
        cellAlign: defaults.cellAlign ?? inherited.cellAlign,
        columns: defaults.columns ?? inherited.columns,
        labels: resolveLabels(inherited.labels, defaults.labels),
        layout: defaults.layout ?? inherited.layout,
        selectionMode: defaults.selectionMode ?? inherited.selectionMode,
        stickyFooter: defaults.stickyFooter ?? inherited.stickyFooter,
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
