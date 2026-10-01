import { inject, InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';
import type { CascaderCheckedStrategy, CascaderLayoutAxis } from '@slotted/core/cascader';

export type { CascaderCheckedStrategy, CascaderLayoutAxis };
export type CascaderSize = 'sm' | 'md' | 'lg';
export type CascaderVariant = 'outline' | 'subtle' | 'plain';
export type CascaderSelectionMode = 'single' | 'multiple';
export type CascaderExpandOn = 'press' | 'hover';
/** A scalar for one choice, a list for many — the shape `tree` and `listbox` settled. */
export type CascaderValue = string | null | readonly string[];

/** Every string the family prints or announces. */
export interface CascaderLabels {
  placeholder: string;
  clear: string;
  remove: string;
  summary: string;
  search: string;
  searchPlaceholder: string;
  root: string;
  back: string;
  breadcrumb: string;
  empty: string;
  noResults: string;
  result: string;
  results: string;
  loading: string;
  failed: string;
  retry: string;
}

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

/** Every decision an application takes once rather than per instance. */
export interface CascaderDefaults {
  size: CascaderSize;
  variant: CascaderVariant;
  fullWidth: boolean;
  layout: CascaderLayoutAxis;
  selectionMode: CascaderSelectionMode;
  selectable: 'leaf' | 'any';
  checkedStrategy: CascaderCheckedStrategy;
  expandOn: CascaderExpandOn;
  closeOnSelect: boolean;
  search: boolean;
  clearable: boolean;
  portal: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  separator: string;
  hoverDelay: number;
  maxColumns: number;
  maxCrumbs: number;
  labels: CascaderLabels;
}

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

export const CASCADER_DEFAULTS = new InjectionToken<CascaderDefaults>('CASCADER_DEFAULTS', {
  providedIn: 'root',
  factory: () => CASCADER_FALLBACK,
});

/** Sets every axis and every label once, in the bootstrap or on a route. */
export function provideCascaderDefaults(
  defaults: Partial<Omit<CascaderDefaults, 'labels'>> & { labels?: Partial<CascaderLabels> },
): Provider {
  return {
    provide: CASCADER_DEFAULTS,
    useValue: {
      ...CASCADER_FALLBACK,
      ...defaults,
      labels: { ...CASCADER_LABELS, ...defaults.labels },
    },
  };
}

export function injectCascaderDefaults(): CascaderDefaults {
  return inject(CASCADER_DEFAULTS);
}
