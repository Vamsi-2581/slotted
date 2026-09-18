import type { FilterJoin, FilterOperator } from '@slotted/core/filter';
import type {
  CsvOptions,
  GridCell,
  GridColumn,
  GridColumnState,
  GridColumnStateChange,
  GridNode,
  GridQuery,
  GridQueryChange,
  GridRange,
  ResolvedGridColumn,
} from '@slotted/core/grid';
import type { ChangeRequest } from '@slotted/core/state';
import { inject, Injectable, InjectionToken } from '@angular/core';

export type DataGridVariant = 'plain' | 'ruled' | 'framed';
export type DataGridStickyTo = 'scroll' | 'page';
export type DataGridSelectionMode = 'none' | 'single' | 'multiple' | 'range';
export type DataGridEditMode = 'cell' | 'row';
export type DataGridMode = 'client' | 'server';
export type DataGridVirtualize = 'auto' | boolean;
export type DataGridRowHeight = number | 'auto';
export type DataGridReason = 'pointer' | 'keyboard' | 'clear' | 'select' | 'programmatic';
export type DataGridExpandedGroups = readonly string[] | 'all';
export type DataGridSelection = string | readonly string[] | null;

export interface DataGridDataSourceResult<Row> {
  readonly rows: readonly Row[];
  /** The whole set's size, when known. */
  readonly total?: number | undefined;
  /** Whether a page past this one exists, when the total is not known. */
  readonly hasMore?: boolean | undefined;
}

export interface DataGridDataSource<Row> {
  getRows(
    query: GridQuery,
    options: { readonly signal: AbortSignal },
  ): Promise<DataGridDataSourceResult<Row>>;
  /** Answers kept, by query. Default 20; 0 keeps none. */
  readonly cacheSize?: number | undefined;
}

export interface DataGridPinnedRows {
  readonly top?: readonly string[] | undefined;
  readonly bottom?: readonly string[] | undefined;
}

export interface DataGridRowsReorderEvent {
  readonly key: string;
  /** The row's index in `rows`. */
  readonly from: number;
  /** The index the row takes in `rows` once moved. */
  readonly to: number;
  readonly reason: 'pointer' | 'keyboard';
  readonly event?: Event | undefined;
}

export interface DataGridExportOptions extends CsvOptions {
  /** Default `export.csv`. */
  readonly filename?: string | undefined;
  /** `visible`: the rows the query left (every page in client mode; the received page in server mode). `selected`: the selected rows, in the grid's order. Default `visible`. */
  readonly rows?: 'visible' | 'selected' | undefined;
  /** `visible`: the columns not hidden, in the reader's order. `all`: every column the model declares. Default `visible`. */
  readonly columns?: 'visible' | 'all' | undefined;
}

/** The request a query change carries: the value, plus which part of it moved. */
export interface DataGridQueryRequest extends ChangeRequest<GridQuery> {
  readonly change: GridQueryChange;
}

export interface DataGridColumnStateRequest extends ChangeRequest<GridColumnState> {
  readonly change: GridColumnStateChange;
}

export interface DataGridEditCommit<Row = unknown> {
  readonly key: string;
  readonly column: string;
  readonly value: unknown;
  readonly previous: unknown;
  readonly row: Row;
  readonly reason: 'keyboard' | 'pointer' | 'blur' | 'programmatic';
  readonly changes: Readonly<Record<string, unknown>>;
  /** A promise the consumer hands back keeps the cell pending until it settles. */
  wait(promise: Promise<void>): void;
}

export interface DataGridActivateEvent {
  readonly key: string;
  readonly reason: 'pointer' | 'keyboard';
  readonly event: unknown;
}

/** What a projected cell template is handed. */
export interface DataGridCellContext<Row = unknown> {
  readonly $implicit: Row;
  readonly row: Row;
  readonly key: string;
  readonly column: GridColumn<Row>;
  readonly value: unknown;
  readonly text: string;
  readonly current: boolean;
  readonly selected: boolean;
}

export interface DataGridEditorContext<Row = unknown> extends DataGridCellContext<Row> {
  readonly draft: unknown;
  readonly setDraft: (draft: unknown) => void;
  readonly commit: () => void;
  readonly cancel: () => void;
  readonly invalid: boolean;
  readonly message: string | null;
}

export interface DataGridHeaderContext<Row = unknown> {
  readonly $implicit: GridColumn<Row>;
  readonly column: GridColumn<Row>;
  readonly resolved: ResolvedGridColumn<Row>;
  readonly sorted: 'ascending' | 'descending' | null;
  readonly sortIndex: number | null;
  readonly filtered: boolean;
}

export interface DataGridGroupContext<Row = unknown> {
  readonly $implicit: Extract<GridNode<Row>, { kind: 'group' }>;
  readonly node: Extract<GridNode<Row>, { kind: 'group' }>;
  readonly column: GridColumn<Row>;
  readonly toggle: () => void;
}

export interface DataGridFilterOperandContext {
  readonly $implicit: unknown;
  readonly column: string;
  readonly operator: string;
  readonly value: unknown;
  readonly setValue: (value: unknown) => void;
  readonly apply: () => void;
  readonly label: string;
}

export type { GridCell, GridRange };

export interface DataGridLabels {
  selectRow: string;
  selectAll: string;
  selectAllFiltered: string;
  selectAllPage: string;
  expand: string;
  collapse: string;
  expandGroup: string;
  collapseGroup: string;
  groupCount: string;
  sortedBy: string;
  sortAscending: string;
  sortDescending: string;
  sortCleared: string;
  sortAscendingAction: string;
  sortDescendingAction: string;
  sortClearAction: string;
  columnMenu: string;
  pinStart: string;
  pinEnd: string;
  unpin: string;
  hide: string;
  autofit: string;
  manageColumns: string;
  resized: string;
  resize: string;
  reorderRow: string;
  rowMoved: string;
  filter: string;
  filterClear: string;
  filterApply: string;
  filterCleared: string;
  filterOperator: string;
  filterValue: string;
  filterFrom: string;
  filterTo: string;
  filterJoin: string;
  filterAny: string;
  filterYes: string;
  filterNo: string;
  filterResults: string;
  filterJoins: Partial<Record<FilterJoin, string>>;
  filterOperators: Partial<Record<FilterOperator, string>>;
  filterSymbols: Partial<Record<FilterOperator, string>>;
  edit: string;
  save: string;
  cancel: string;
  editConflict: string;
  editFailed: string;
  copied: string;
  empty: string;
  noResults: string;
  clearFilters: string;
  error: string;
  retry: string;
  loadMore: string;
  range: string;
  rangeUnknown: string;
  grid: string;
  scroll: string;
}

export interface DataGridDefaults {
  variant: DataGridVariant;
  striped: boolean;
  stickyHeader: boolean;
  stickyTo: DataGridStickyTo;
  selectionMode: DataGridSelectionMode;
  editMode: DataGridEditMode;
  filterRow: boolean;
  virtualize: DataGridVirtualize;
  rowHeight: DataGridRowHeight | undefined;
  overscan: number;
  pageSizes: readonly number[];
  filterDebounce: number;
  loadMoreThreshold: number;
  skeletonRows: number;
  locale: string | undefined;
  labels: DataGridLabels;
}

/**
 * The words the family says when nothing else says them. `{count}`,
 * `{column}`, `{order}`, `{width}`, `{start}`, `{end}` and `{total}` are the
 * slots the binding fills.
 */
export const DATA_GRID_LABELS: DataGridLabels = {
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
  pinStart: 'Pin to start',
  pinEnd: 'Pin to end',
  unpin: 'Unpin',
  hide: 'Hide column',
  autofit: 'Fit to content',
  manageColumns: 'Manage columns',
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
  /** Typographic characters, not glyphs; the button's name says the operator in full. */
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
export function resolveDataGridLabels(
  ...layers: readonly (Partial<DataGridLabels> | undefined)[]
): DataGridLabels {
  const resolved: DataGridLabels = {
    ...DATA_GRID_LABELS,
    filterJoins: { ...DATA_GRID_LABELS.filterJoins },
    filterOperators: { ...DATA_GRID_LABELS.filterOperators },
    filterSymbols: { ...DATA_GRID_LABELS.filterSymbols },
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
export function fillLabel(label: string, slots: Record<string, string | number>): string {
  return label.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in slots ? String(slots[name]) : match,
  );
}

const FALLBACK: DataGridDefaults = {
  variant: 'ruled',
  striped: false,
  stickyHeader: true,
  stickyTo: 'scroll',
  selectionMode: 'none',
  editMode: 'cell',
  filterRow: false,
  virtualize: 'auto',
  rowHeight: undefined,
  overscan: 6,
  pageSizes: [25, 50, 100],
  filterDebounce: 300,
  loadMoreThreshold: 20,
  skeletonRows: 8,
  locale: undefined,
  labels: DATA_GRID_LABELS,
};

export const DATA_GRID_DEFAULTS = new InjectionToken<DataGridDefaults>(
  'slotted data-grid defaults',
  {
    providedIn: 'root',
    factory: () => FALLBACK,
  },
);

/**
 * An application decides once how its grids are framed, how they select, how
 * they edit and what their controls are called. A grid that states any of
 * them itself still wins.
 */
export function provideDataGridDefaults(
  defaults: Partial<Omit<DataGridDefaults, 'labels'>> & { labels?: Partial<DataGridLabels> },
) {
  return {
    provide: DATA_GRID_DEFAULTS,
    useFactory: (): DataGridDefaults => ({
      ...FALLBACK,
      ...defaults,
      labels: resolveDataGridLabels(defaults.labels),
    }),
  };
}

export function injectDataGridDefaults(): DataGridDefaults {
  return inject(DATA_GRID_DEFAULTS);
}

/** Application-scoped, so the server and the client produce the same sequence. */
@Injectable({ providedIn: 'root' })
export class SlDataGridIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-data-grid-${this.count}`;
  }
}
