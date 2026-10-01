import { createContext, useContext } from 'react';

import type {
  CascaderDefaults,
  CascaderDefaultsProviderProps,
  CascaderLabels,
} from './cascader.types';

export const CASCADER_LABELS: CascaderLabels = {
  placeholder: 'Choose…',
  clear: 'Clear selection',
  remove: 'Remove {label}',
  summary: '{count} selected',
  search: 'Search',
  searchPlaceholder: 'Search…',
  root: 'All',
  back: 'Back to {label}',
  breadcrumb: 'Path',
  empty: 'Nothing here',
  noResults: 'Nothing matches “{query}”.',
  result: '{count} result',
  results: '{count} results',
  loading: 'Loading…',
  failed: 'Could not load {label}.',
  retry: 'Try again',
};

export const CASCADER_FALLBACK: CascaderDefaults = {
  size: 'md',
  variant: 'outline',
  fullWidth: true,
  layout: 'auto',
  selectionMode: 'single',
  selectable: 'leaf',
  checkedStrategy: 'all',
  expandOn: 'press',
  closeOnSelect: true,
  search: false,
  clearable: true,
  portal: true,
  disabled: false,
  readOnly: false,
  required: false,
  invalid: false,
  separator: '/',
  hoverDelay: 150,
  maxColumns: 3,
  maxCrumbs: 4,
  labels: CASCADER_LABELS,
};

const CascaderDefaultsContext = createContext<CascaderDefaults>(CASCADER_FALLBACK);

export function useCascaderDefaults(): CascaderDefaults {
  return useContext(CascaderDefaultsContext);
}

/** Sets every axis once for a subtree. A cascader that states one itself still wins. */
export function CascaderDefaultsProvider({
  children,
  labels,
  ...overrides
}: CascaderDefaultsProviderProps) {
  const inherited = useCascaderDefaults();
  const value: CascaderDefaults = { ...inherited, labels: { ...inherited.labels, ...labels } };
  for (const [key, given] of Object.entries(overrides)) {
    if (given !== undefined) (value as unknown as Record<string, unknown>)[key] = given;
  }
  return (
    <CascaderDefaultsContext.Provider value={value}>{children}</CascaderDefaultsContext.Provider>
  );
}
