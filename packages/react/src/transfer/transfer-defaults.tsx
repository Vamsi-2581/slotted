import { createContext, useContext } from 'react';

import type {
  TransferDefaults,
  TransferDefaultsProviderProps,
  TransferLabels,
} from './transfer.types';

/** The words the family says before an application says otherwise. */
export const DEFAULT_TRANSFER_LABELS: TransferLabels = {
  source: 'Available',
  target: 'Chosen',
  search: 'Search {pane}',
  selectAll: 'Select all in {pane}',
  count: '{total} items',
  countSelected: '{selected} of {total} selected',
  countFiltered: '{shown} of {total} shown',
  paneCount: '{pane} ({total})',
  panes: 'Lists',
  empty: 'No items',
  noResults: 'No matches',
  loading: 'Loading…',
  actions: 'Move items',
  moveToTarget: 'Add',
  moveAllToTarget: 'Add all',
  moveToSource: 'Remove',
  moveAllToSource: 'Remove all',
  reorder: 'Order',
  moveUp: 'Up',
  moveDown: 'Down',
  moved: '{count} moved to {pane}',
  movedOne: '{item} moved to {pane}',
  reordered: '{item} moved to position {position}',
};

const FALLBACK: TransferDefaults = {
  size: 'md',
  layout: 'auto',
  searchable: true,
  selectAll: true,
  reorderable: false,
  rows: 8,
  labels: DEFAULT_TRANSFER_LABELS,
};

const TransferDefaultsContext = createContext<TransferDefaults>(FALLBACK);

/** What a transfer renders as here, before it states anything of its own. */
export function useTransferDefaults(): TransferDefaults {
  return useContext(TransferDefaultsContext);
}

/**
 * An application decides once how its transfers look and what they say. A
 * transfer that states any of it itself still wins, and a nested provider
 * overrides only what it names.
 */
export function TransferDefaultsProvider({
  children,
  labels,
  ...rest
}: TransferDefaultsProviderProps) {
  const inherited = useTransferDefaults();
  return (
    <TransferDefaultsContext.Provider
      value={{
        layout: rest.layout ?? inherited.layout,
        reorderable: rest.reorderable ?? inherited.reorderable,
        rows: rest.rows ?? inherited.rows,
        searchable: rest.searchable ?? inherited.searchable,
        selectAll: rest.selectAll ?? inherited.selectAll,
        size: rest.size ?? inherited.size,
        labels: { ...inherited.labels, ...labels },
      }}
    >
      {children}
    </TransferDefaultsContext.Provider>
  );
}

/** Fills `{name}` slots in a label. */
export function fillLabel(label: string, slots: Record<string, string | number>): string {
  return label.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in slots ? String(slots[name]) : match,
  );
}
