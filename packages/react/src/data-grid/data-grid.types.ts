import type { FilterDescriptor, FilterJoin, FilterOperator } from '@slotted/core/filter';
import type {
  GridCell,
  GridColumn,
  GridColumnGroup,
  GridColumnState,
  GridColumnStateChange,
  GridNode,
  GridQuery,
  GridQueryChange,
  GridRange,
  ResolvedGridColumn,
} from '@slotted/core/grid';
import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export type DataGridVariant = 'plain' | 'ruled' | 'framed';
export type DataGridStickyTo = 'scroll' | 'page';
export type DataGridSelectionMode = 'none' | 'single' | 'multiple' | 'range';
export type DataGridEditMode = 'cell' | 'row';
export type DataGridMode = 'client' | 'server';
export type DataGridVirtualize = 'auto' | boolean;
export type DataGridRowHeight = number | 'auto';

export type DataGridReason = 'pointer' | 'keyboard' | 'clear' | 'select' | 'programmatic';

/** The request a query change carries: the value, plus which part of it moved. */
export interface DataGridQueryRequest extends ChangeRequest<GridQuery> {
  readonly change: GridQueryChange;
}

export interface DataGridColumnStateRequest extends ChangeRequest<GridColumnState> {
  readonly change: GridColumnStateChange;
}

export type DataGridExpandedGroups = readonly string[] | 'all';

/** The words the family says. Every one of them is replaceable per application and per grid. */
export interface DataGridResolvedLabels {
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
  filterJoins: Record<FilterJoin, string>;
  filterOperators: Record<FilterOperator, string>;
  filterSymbols: Record<FilterOperator, string>;
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

export type DataGridLabels = Partial<
  Omit<DataGridResolvedLabels, 'filterJoins' | 'filterOperators' | 'filterSymbols'>
> & {
  filterJoins?: Partial<Record<FilterJoin, string>> | undefined;
  filterOperators?: Partial<Record<FilterOperator, string>> | undefined;
  filterSymbols?: Partial<Record<FilterOperator, string>> | undefined;
};

/** What an application sets once. */
export interface DataGridDefaults {
  variant?: DataGridVariant | undefined;
  striped?: boolean | undefined;
  stickyHeader?: boolean | undefined;
  stickyTo?: DataGridStickyTo | undefined;
  selectionMode?: DataGridSelectionMode | undefined;
  editMode?: DataGridEditMode | undefined;
  filterRow?: boolean | undefined;
  virtualize?: DataGridVirtualize | undefined;
  rowHeight?: DataGridRowHeight | undefined;
  overscan?: number | undefined;
  pageSizes?: readonly number[] | undefined;
  filterDebounce?: number | undefined;
  loadMoreThreshold?: number | undefined;
  skeletonRows?: number | undefined;
  locale?: string | undefined;
  labels?: DataGridLabels | undefined;
}

export interface DataGridDefaultsProviderProps extends DataGridDefaults {
  children?: ReactNode | undefined;
}

/** What a cell renderer is handed. */
export interface DataGridCellContext<Row> {
  readonly row: Row;
  readonly rowKey: string;
  readonly column: GridColumn<Row>;
  readonly value: unknown;
  readonly text: string;
  /** Whether the cursor stands on this cell. */
  readonly current: boolean;
  readonly selected: boolean;
}

export interface DataGridEditorContext<Row> extends DataGridCellContext<Row> {
  /** The draft as it stands. */
  readonly draft: unknown;
  readonly setDraft: (draft: unknown) => void;
  readonly commit: () => void;
  readonly cancel: () => void;
  readonly invalid: boolean;
  readonly message: string | null;
}

export interface DataGridHeaderContext<Row> {
  readonly column: GridColumn<Row>;
  readonly resolved: ResolvedGridColumn<Row>;
  readonly sorted: 'ascending' | 'descending' | null;
  readonly sortIndex: number | null;
  readonly filtered: boolean;
}

export interface DataGridGroupContext<Row> {
  readonly node: Extract<GridNode<Row>, { kind: 'group' }>;
  readonly column: GridColumn<Row>;
  readonly toggle: () => void;
}

export interface DataGridFilterOperandContext {
  readonly column: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
  readonly setValue: (value: unknown) => void;
  readonly apply: () => void;
  readonly label: string;
}

export interface DataGridEditCommit<Row> {
  readonly key: string;
  readonly column: string;
  readonly value: unknown;
  readonly previous: unknown;
  readonly row: Row;
  readonly reason: 'keyboard' | 'pointer' | 'blur' | 'programmatic';
  /** Every changed value of the row, in row mode. */
  readonly changes: Readonly<Record<string, unknown>>;
}

export interface DataGridActivateEvent {
  readonly key: string;
  readonly reason: 'pointer' | 'keyboard';
  readonly event: unknown;
}

/** The imperative surface: what a consumer cannot express declaratively. */
export interface DataGridHandle {
  focusCell(cell: GridCell): void;
  scrollToRow(key: string, align?: 'start' | 'center' | 'end' | 'nearest'): void;
  scrollToColumn(id: string): void;
  scrollToCell(cell: GridCell): void;
  startEdit(cell: GridCell): void;
  stopEdit(options?: { commit?: boolean }): void;
  autofit(column?: string): void;
  getVisibleRows(): readonly unknown[];
  selectAll(): void;
  clearSelection(): void;
  readonly element: HTMLDivElement | null;
}

export interface DataGridProps<Row>
  extends
    Omit<
      ComponentPropsWithRef<'div'>,
      'children' | 'defaultValue' | 'onChange' | 'onSelect' | 'role'
    >,
    DataGridDefaults {
  /* ── Data ───────────────────────────────────────────────────────────── */
  rows: readonly Row[];
  /** A field name, or a function of the row. */
  rowKey: keyof Row | ((row: Row) => string);
  columns: readonly GridColumn<Row>[];
  columnGroups?: readonly GridColumnGroup[] | undefined;
  /** `client` applies the query to `rows`; `server` draws `rows` as given. Inferred from `totalCount` and `hasMore`. */
  mode?: DataGridMode | undefined;
  /** The whole set's size in `server` mode, when it is known. */
  totalCount?: number | undefined;
  /** Whether a page past this one exists, in `server` mode with an unknown total. */
  hasMore?: boolean | undefined;
  loading?: boolean | undefined;
  /** The message of a failed load; draws the error state. */
  error?: string | null | undefined;
  onRetry?: (() => void) | undefined;
  onLoadMore?: (() => void) | undefined;
  /** Rows a consumer has disabled: not selectable, not editable. */
  disabledKeys?: readonly string[] | undefined;

  /* ── Query ──────────────────────────────────────────────────────────── */
  query?: GridQuery | undefined;
  defaultQuery?: GridQuery | undefined;
  onQueryChange?: ((query: GridQuery, request: DataGridQueryRequest) => void) | undefined;

  /* ── Columns ────────────────────────────────────────────────────────── */
  columnState?: GridColumnState | undefined;
  defaultColumnState?: Partial<GridColumnState> | undefined;
  onColumnStateChange?:
    ((state: GridColumnState, request: DataGridColumnStateRequest) => void) | undefined;
  /** Called when the column menu asks for the manager; the consumer opens `column-manager`. */
  onManageColumns?: (() => void) | undefined;

  /* ── Selection ──────────────────────────────────────────────────────── */
  value?: string | readonly string[] | null | undefined;
  defaultValue?: string | readonly string[] | null | undefined;
  onValueChange?:
    | ((
        value: string | readonly string[] | null,
        request: ChangeRequest<string | readonly string[] | null>,
      ) => void)
    | undefined;
  range?: GridRange | null | undefined;
  defaultRange?: GridRange | null | undefined;
  onRangeChange?:
    ((range: GridRange | null, request: ChangeRequest<GridRange | null>) => void) | undefined;

  /* ── Cursor ─────────────────────────────────────────────────────────── */
  current?: GridCell | null | undefined;
  defaultCurrent?: GridCell | null | undefined;
  onCurrentChange?:
    ((cell: GridCell | null, request: ChangeRequest<GridCell | null>) => void) | undefined;

  /* ── Expansion ──────────────────────────────────────────────────────── */
  expanded?: readonly string[] | undefined;
  defaultExpanded?: readonly string[] | undefined;
  onExpandedChange?:
    ((expanded: readonly string[], request: ChangeRequest<readonly string[]>) => void) | undefined;
  expandedGroups?: DataGridExpandedGroups | undefined;
  defaultExpandedGroups?: DataGridExpandedGroups | undefined;
  onExpandedGroupsChange?:
    | ((expanded: DataGridExpandedGroups, request: ChangeRequest<DataGridExpandedGroups>) => void)
    | undefined;
  /** Whether a row has a detail to open; the detail itself comes from `renderDetail`. */
  expandable?: boolean | ((row: Row) => boolean) | undefined;

  /* ── Editing and activation ─────────────────────────────────────────── */
  onEditStart?: ((cell: GridCell) => void) | undefined;
  onEditCommit?: ((commit: DataGridEditCommit<Row>) => void | Promise<void>) | undefined;
  onEditCancel?: ((cell: GridCell) => void) | undefined;
  activatable?: boolean | undefined;
  onActivate?: ((event: DataGridActivateEvent) => void) | undefined;

  /* ── Rendering ──────────────────────────────────────────────────────── */
  renderCell?: ((context: DataGridCellContext<Row>) => ReactNode) | undefined;
  renderEditor?: ((context: DataGridEditorContext<Row>) => ReactNode) | undefined;
  renderHeader?: ((context: DataGridHeaderContext<Row>) => ReactNode) | undefined;
  renderDetail?: ((row: Row, key: string) => ReactNode) | undefined;
  renderGroup?: ((context: DataGridGroupContext<Row>) => ReactNode) | undefined;
  renderEmpty?: ((status: 'empty' | 'no-results' | 'error') => ReactNode) | undefined;
  renderFilterOperand?: ((context: DataGridFilterOperandContext) => ReactNode) | undefined;
  /** Renderers per column, keyed by id; a per-column renderer wins over the grid's. */
  cellRenderers?:
    Readonly<Record<string, (context: DataGridCellContext<Row>) => ReactNode>> | undefined;
  editorRenderers?:
    Readonly<Record<string, (context: DataGridEditorContext<Row>) => ReactNode>> | undefined;
  /** The bar under the grid: pagination, a count, load more. */
  footer?: ReactNode | undefined;
  /** Whether the footer states the range. Default: when the query pages. */
  showRange?: boolean | undefined;
  /** The accessible name, or the id of the element that names the grid. */
  label?: string | undefined;
  labelledBy?: string | undefined;
  /** A name to announce and to persist by. */
  handle?: React.RefObject<DataGridHandle | null> | undefined;
  timeZone?: string | undefined;
}

export interface DataGridContextValue<Row> {
  readonly id: string;
  readonly labels: DataGridResolvedLabels;
  readonly locale: string | undefined;
  readonly timeZone: string | undefined;
  readonly columns: readonly GridColumn<Row>[];
  readonly resolved: readonly ResolvedGridColumn<Row>[];
  readonly query: GridQuery;
  readonly selectionMode: DataGridSelectionMode;
  readonly editMode: DataGridEditMode;
}

export type DataGridFilterDraft = FilterDescriptor | null;
