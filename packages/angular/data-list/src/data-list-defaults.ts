import { inject, InjectionToken } from '@angular/core';
import {
  DEFAULT_DATA_LIST_FIELDS,
  DEFAULT_DATA_LIST_LABELS,
  type DataListLabels,
} from '@slotted/core/data-list';
import type { GridQuery, GridQueryChange } from '@slotted/core/grid';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';

export type DataListVariant = 'plain' | 'ruled' | 'framed';
export type DataListSize = 'sm' | 'md' | 'lg';
export type DataListSelectionMode = 'none' | 'single' | 'multiple';
export type DataListMode = 'client' | 'server';

/** `string | null` in `single` and `none`, the keys in `multiple`: the union `table` holds. */
export type DataListSelection = string | null | readonly string[];

export type DataListReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'select' | 'clear' | 'programmatic'
>;

export interface DataListQueryRequest extends ChangeRequest<GridQuery> {
  /** Which part of the query moved, so a consumer refetches on sort and debounces on search. */
  readonly change: GridQueryChange;
}

export interface DataListExpandedRequest extends ChangeRequest<readonly string[]> {
  /** The record whose disclosure was pressed. */
  readonly key: string;
}

export interface DataListActivateEvent<Row = unknown> {
  readonly key: string;
  readonly row: Row;
  readonly reason: 'pointer' | 'keyboard';
  readonly event: Event;
}

export type DataListEmptyStatus = 'empty' | 'no-results' | 'error';

export interface DataListDefaults {
  variant: DataListVariant;
  size: DataListSize;
  fields: number;
  selectionMode: DataListSelectionMode;
  skeletonRows: number;
  loadingDelay: number;
  loadingMinDuration: number;
  locale: string | undefined;
  labels: DataListLabels;
}

const FALLBACK: DataListDefaults = {
  variant: 'ruled',
  size: 'md',
  fields: DEFAULT_DATA_LIST_FIELDS,
  selectionMode: 'none',
  skeletonRows: 5,
  loadingDelay: 200,
  loadingMinDuration: 400,
  locale: undefined,
  labels: DEFAULT_DATA_LIST_LABELS,
};

export const DATA_LIST_DEFAULTS = new InjectionToken<DataListDefaults>(
  'slotted data-list defaults',
  {
    providedIn: 'root',
    factory: () => FALLBACK,
  },
);

/**
 * An application states the family's defaults once. A list that states its
 * own value still wins, and labels merge word by word.
 */
export function provideDataListDefaults(
  defaults: Partial<Omit<DataListDefaults, 'labels'>> & { labels?: Partial<DataListLabels> },
) {
  return {
    provide: DATA_LIST_DEFAULTS,
    useFactory: (): DataListDefaults => ({
      ...FALLBACK,
      ...Object.fromEntries(Object.entries(defaults).filter(([, value]) => value !== undefined)),
      labels: { ...FALLBACK.labels, ...defaults.labels },
    }),
  };
}

export function injectDataListDefaults(): DataListDefaults {
  return inject(DATA_LIST_DEFAULTS);
}
