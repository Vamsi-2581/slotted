import { createContext, useContext } from 'react';

import type {
  ColumnManagerDefaults,
  ColumnManagerLabels,
  ColumnManagerProviderProps,
} from './column-manager.types';

/** The words the family says before an application says otherwise. */
export const DEFAULT_COLUMN_MANAGER_LABELS: ColumnManagerLabels = {
  title: 'Columns',
  search: 'Search columns',
  noResults: 'No columns match',
  showAll: 'Show all',
  reset: 'Restore defaults',
  apply: 'Apply',
  cancel: 'Cancel',
  pinnedStart: 'Pinned to start',
  unpinned: 'Columns',
  pinnedEnd: 'Pinned to end',
  pin: 'Pin {column}',
  pinStart: 'Pin to start',
  pinEnd: 'Pin to end',
  unpin: 'Unpin',
  reorder: 'Reorder {column}',
  moved: '{column} moved to position {position}',
  required: 'Required',
  hiddenBySpace: 'Hidden for space',
  inRow: 'Shown in row',
  hiddenCountOne: '1 hidden column',
  hiddenCountOther: '{count} hidden columns',
  visibleCount: '{visible} of {total} shown',
};

const FALLBACK: ColumnManagerDefaults = {
  presentation: 'popover',
  apply: 'live',
  labels: DEFAULT_COLUMN_MANAGER_LABELS,
};

const ColumnManagerDefaultsContext = createContext<ColumnManagerDefaults>(FALLBACK);

/** What a column manager renders as here, before it states anything of its own. */
export function useColumnManagerDefaults(): ColumnManagerDefaults {
  return useContext(ColumnManagerDefaultsContext);
}

/**
 * An application decides once where its managers stand, whether they apply at
 * once, and what they say. A manager that states any of them itself still wins.
 */
export function ColumnManagerProvider({
  apply,
  children,
  labels,
  presentation,
}: ColumnManagerProviderProps) {
  const inherited = useColumnManagerDefaults();
  return (
    <ColumnManagerDefaultsContext.Provider
      value={{
        apply: apply ?? inherited.apply,
        labels: { ...inherited.labels, ...labels },
        presentation: presentation ?? inherited.presentation,
      }}
    >
      {children}
    </ColumnManagerDefaultsContext.Provider>
  );
}

/** Fills `{name}` slots in a label. */
export function fillLabel(label: string, slots: Record<string, string | number>): string {
  return label.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in slots ? String(slots[name]) : match,
  );
}
