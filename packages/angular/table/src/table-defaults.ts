import { inject, Injectable, InjectionToken } from '@angular/core';

/** How much of a frame the set is given. The vocabulary `description-list` set. */
export type TableVariant = 'plain' | 'ruled' | 'framed';

/**
 * Whether the browser sizes the columns from their content or from what the
 * table states. `fixed` is what makes a stated width hold and a truncated cell
 * truncate at all.
 */
export type TableLayout = 'auto' | 'fixed';

export type TableSelectionMode = 'none' | 'single' | 'multiple';

/**
 * What a sticky header stays inside: the family's own scroller, or whatever
 * scrolls outside it — the page, an app shell, a scroll area.
 */
export type TableStickyTo = 'scroll' | 'page';

/** Which edge a cell's content stands on, resolved logically. */
export type TableAlign = 'start' | 'center' | 'end';

/** What a value longer than its column does. None of the three removes it. */
export type TableText = 'wrap' | 'truncate' | 'nowrap';

/** Which edge a column is pinned to while the table scrolls past it. */
export type TableSticky = 'start' | 'end';

export type TableSortDirection = 'ascending' | 'descending';

/**
 * Which column the rows are ordered by, and which way. The family holds it and
 * reorders nothing: the rows are the consumer's own, written in the template,
 * so the consumer applies the descriptor to its own array or its own query.
 */
export interface TableSortDescriptor {
  column: string;
  direction: TableSortDirection;
}

export type TableSortReason = 'pointer' | 'keyboard' | 'clear' | 'programmatic';
export type TableSelectionReason = 'pointer' | 'keyboard' | 'select' | 'clear' | 'programmatic';
export type TableExpandedReason = 'pointer' | 'keyboard' | 'programmatic';

/**
 * The words the family says. One input rather than eight: an application
 * translates them once, and a family that spread them across the root would
 * make seven of the eight an input nobody sets.
 */
export interface TableLabels {
  collapse: string;
  expand: string;
  scroll: string;
  selectAll: string;
  selectRow: string;
  sortCleared: string;
  sortedAscending: string;
  sortedDescending: string;
}

export interface TableDefaults {
  columns: number;
  labels: TableLabels;
  layout: TableLayout;
  selectionMode: TableSelectionMode;
  stickyFooter: boolean;
  stickyHeader: boolean;
  stickyTo: TableStickyTo;
  striped: boolean;
  variant: TableVariant;
}

/**
 * The words the family says when nothing else says them. They are English
 * because the package is, and every one is replaceable in two places: once for
 * an application, through the provider below, and once for a table.
 */
export const TABLE_LABELS: TableLabels = {
  collapse: 'Hide details',
  expand: 'Show details',
  scroll: 'Table, scrollable',
  selectAll: 'Select all rows',
  selectRow: 'Select row',
  sortCleared: 'sorting removed',
  sortedAscending: 'sorted ascending',
  sortedDescending: 'sorted descending',
};

const FALLBACK: TableDefaults = {
  columns: 1,
  labels: TABLE_LABELS,
  layout: 'auto',
  selectionMode: 'none',
  stickyFooter: false,
  stickyHeader: false,
  stickyTo: 'scroll',
  striped: false,
  variant: 'ruled',
};

export const TABLE_DEFAULTS = new InjectionToken<TableDefaults>('slotted table defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

/**
 * An application decides once how its tables are framed, how they select and
 * what their controls are called, rather than repeating the same inputs on
 * every listing screen. A table that states any of them itself still wins.
 */
export function provideTableDefaults(defaults: Partial<TableDefaults>) {
  return {
    provide: TABLE_DEFAULTS,
    useFactory: (): TableDefaults => ({
      ...FALLBACK,
      ...defaults,
      labels: { ...TABLE_LABELS, ...(defaults.labels ?? {}) },
    }),
  };
}

export function injectTableDefaults(): TableDefaults {
  return inject(TABLE_DEFAULTS);
}

/**
 * Application-scoped rather than module-scoped, for the reason `field` records:
 * a module-level counter produces colliding sequences when two applications
 * render in one server process, and the server and the client sequences must
 * match for hydration.
 */
@Injectable({ providedIn: 'root' })
export class SlTableIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-table-${this.count}`;
  }
}
