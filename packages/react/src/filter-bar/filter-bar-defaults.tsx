import { createContext, useContext } from 'react';

import type {
  FilterBarDefaults,
  FilterBarDefaultsProviderProps,
  FilterBarLabels,
} from './filter-bar.types';

/**
 * The words the family ships. The operator names are the same map `table`
 * translates, so an application that has translated one has translated both.
 */
export const FILTER_BAR_LABELS: FilterBarLabels = {
  bar: 'Filter',
  filters: 'Filters',
  builder: 'Filters',
  search: 'Search',
  add: 'Add filter',
  clear: 'Clear all',
  clearRule: 'Clear',
  apply: 'Apply',
  reset: 'Reset',
  done: 'Done',
  cancel: 'Cancel',
  summary: 'Filters ({count})',
  more: '+{count} more',
  less: 'Show less',
  preset: 'Saved view',
  presetNone: 'No saved view',
  savePreset: 'Save as view…',
  addRule: 'Add rule',
  addGroup: 'Add group',
  removeRule: 'Remove rule',
  removeGroup: 'Remove group',
  joins: { and: 'and', or: 'or' },
  matchAll: 'All',
  matchAny: 'Any',
  matches: 'Match {join} of the following',
  where: 'Where',
  field: 'Field',
  operator: 'Operator',
  value: 'Value',
  from: 'From',
  to: 'To',
  count: '{count} of {total}',
  countOnly: '{count}',
  removed: '{field} filter removed',
  cleared: 'Filters cleared',
  required: '{field} needs a value',
  unknownField: 'Unknown field {field}',
  remove: 'Remove',
  noValue: 'Select value',
  incomplete: 'incomplete',
  moreValues: '+{count}',
  readOnly: 'Read only',
  appliedCount: '{count} filters applied',
  operators: {
    contains: 'contains',
    notContains: 'does not contain',
    equals: 'equals',
    notEquals: 'does not equal',
    startsWith: 'starts with',
    endsWith: 'ends with',
    empty: 'is empty',
    notEmpty: 'is not empty',
    greaterThan: 'greater than',
    greaterThanOrEqual: 'at least',
    lessThan: 'less than',
    lessThanOrEqual: 'at most',
    between: 'between',
    is: 'is',
    isNot: 'is not',
    before: 'before',
    after: 'after',
    anyOf: 'any of',
    noneOf: 'none of',
  } as FilterBarLabels['operators'],
};

const FilterBarDefaultsContext = createContext<FilterBarDefaults>({});

export function useFilterBarDefaults(): FilterBarDefaults {
  return useContext(FilterBarDefaultsContext);
}

/** The labels the family resolves to, with the application's words over the shipped ones. */
export function resolveFilterBarLabels(
  ...layers: (Partial<FilterBarLabels> | undefined)[]
): FilterBarLabels {
  let resolved: FilterBarLabels = FILTER_BAR_LABELS;
  for (const layer of layers) {
    if (!layer) continue;
    resolved = {
      ...resolved,
      ...layer,
      joins: { ...resolved.joins, ...layer.joins },
      operators: { ...resolved.operators, ...layer.operators },
    };
  }
  return resolved;
}

/**
 * An application decides once how its bars apply, how long the query waits,
 * how many chips show, which key reaches the search, and what the family says
 * in the language it ships. A bar that states any of those itself still wins.
 */
export function FilterBarDefaultsProvider({
  children,
  ...defaults
}: FilterBarDefaultsProviderProps) {
  const inherited = useFilterBarDefaults();

  return (
    <FilterBarDefaultsContext.Provider
      value={{
        apply: defaults.apply ?? inherited.apply,
        chipLimit: defaults.chipLimit ?? inherited.chipLimit,
        labels: resolveFilterBarLabels(inherited.labels, defaults.labels),
        queryDelay: defaults.queryDelay ?? inherited.queryDelay,
        shortcut: defaults.shortcut === undefined ? inherited.shortcut : defaults.shortcut,
        size: defaults.size ?? inherited.size,
      }}
    >
      {children}
    </FilterBarDefaultsContext.Provider>
  );
}

/** `{count}` and friends, written into a label. */
export function fill(template: string, values: Record<string, string | number | undefined>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
