import { InjectionToken, inject } from '@angular/core';

export type PaginationPageReason = 'pointer' | 'keyboard' | 'programmatic';
export type PaginationPageSizeReason = 'select' | 'programmatic';
export type PaginationLive = 'polite' | 'off';

/** The wording every control carries, so an application translates once. */
export interface PaginationLabels {
  first: string;
  last: string;
  next: string;
  page: (page: number) => string;
  pageSize: string;
  previous: string;
  range: (start: number, end: number, count: number) => string;
  summary: (page: number, pages: number) => string;
}

export const PAGINATION_DEFAULT_LABELS: PaginationLabels = {
  first: 'First page',
  last: 'Last page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  pageSize: 'Rows per page',
  previous: 'Previous page',
  range: (start, end, count) => (count === 0 ? 'No results' : `${start}–${end} of ${count}`),
  summary: (page, pages) => `Page ${page} of ${pages}`,
};

export const PAGINATION_DEFAULT_LABEL = 'Pagination';
export const PAGINATION_DEFAULT_PAGE_SIZE = 20;
export const PAGINATION_DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface PaginationDefaults {
  boundaryCount?: number;
  defaultPageSize?: number;
  label?: string;
  labels?: Partial<PaginationLabels>;
  live?: PaginationLive;
  pageSizeOptions?: readonly number[];
  siblingCount?: number;
}

export const PAGINATION_DEFAULTS_TOKEN = new InjectionToken<PaginationDefaults>(
  'slotted pagination defaults',
  { providedIn: 'root', factory: (): PaginationDefaults => ({}) },
);

/**
 * An application decides once how wide its rows of pages are, how many items a
 * page holds, what the controls are called in the language it ships, and
 * whether a page change is announced. A paginator that states any of those
 * itself still wins: an explicit input is never overridden by the token.
 */
export function providePaginationDefaults(defaults: PaginationDefaults) {
  return { provide: PAGINATION_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectPaginationDefaults(): PaginationDefaults {
  return inject(PAGINATION_DEFAULTS_TOKEN);
}
