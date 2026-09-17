import '@slotted/styles/data-grid/data-grid.css';

import { writeToClipboard } from '@slotted/core/clipboard';
import { createRowMetrics, nextSelection, virtualWindow } from '@slotted/core/collection';
import { createDragController, type DragController } from '@slotted/core/drag';
import { createFilterGroupPredicate, ruleFor, withoutRuleFor } from '@slotted/core/filter';
import type { FilterDescriptor } from '@slotted/core/filter';
import {
  applyQuery,
  cellText,
  cellValue,
  columnRange,
  columnTemplate,
  emptyQuery,
  FILTER_ROW,
  GROUP_ROW_PREFIX,
  HEADER_ROW,
  isGroupCursorRow,
  moveCursor,
  normalizeColumnState,
  rangeBounds,
  rangeCells,
  rangeEdges,
  rangeToText,
  RESIZE_STEP,
  resolveColumns,
  rowRange,
  sameCell,
  settleCursor,
  SUMMARY_ROW,
  wholeRange,
  withColumnFilter,
  withColumnHidden,
  withColumnMoved,
  withColumnPinned,
  withColumnWidth,
  withoutFilters,
  withSort,
  withSortPress,
  zoneOf,
  type CursorGrid,
  type CursorIntent,
  type GridCell,
  type GridColumn,
  type GridColumnState,
  type GridNode,
  type GridQuery,
  type GridRange,
  type SortDirection,
} from '@slotted/core/grid';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createScrollAffordance } from '@slotted/core/overflow';
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';

import { Button } from '../button';
import {
  ResultState,
  ResultStateActions,
  ResultStateDescription,
  ResultStateTitle,
} from '../result-state';
import { DataGridBody, DataGridLoader, DataGridSummary } from './data-grid-body';
import {
  DataGridInternalContext,
  type DataGridInternal,
  type EditSession,
} from './data-grid-context';
import { fill, resolveLabels, useDataGridDefaults } from './data-grid-defaults';
import { DataGridHead } from './data-grid-header';
import {
  EXPANDER_COLUMN,
  EXPANDER_WIDTH,
  FOCUSABLE,
  insideWidget,
  SELECTION_COLUMN,
  SELECTION_WIDTH,
  SIMPLE_WIDGET,
} from './data-grid-constants';
import { defaultCellContent, defaultEditor } from './data-grid-editors';
import type {
  DataGridCellContext,
  DataGridEditorContext,
  DataGridExpandedGroups,
  DataGridHandle,
  DataGridProps,
  DataGridReason,
} from './data-grid.types';
import { useModel } from './use-model';

const DEFAULT_ROW_HEIGHT = 34;
const VIRTUALIZE_ROWS_FROM = 100;
const VIRTUALIZE_COLUMNS_FROM = 20;
/** The viewport assumed until the scroller is measured. */
const PROVISIONAL_VIEWPORT = 600;
const COLUMN_OVERSCAN_PX = 400;

function sameQuery(a: GridQuery, b: GridQuery) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function sameState(a: GridColumnState, b: GridColumnState) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function sameKeys(a: readonly string[] | 'all', b: readonly string[] | 'all') {
  if (a === 'all' || b === 'all') return a === b;
  return a.length === b.length && a.every((key, index) => key === b[index]);
}
function sameRange(a: GridRange | null, b: GridRange | null) {
  if (!a || !b) return a === b;
  return sameCell(a.anchor, b.anchor) && sameCell(a.focus, b.focus);
}
function sameSelection(a: string | readonly string[] | null, b: string | readonly string[] | null) {
  if (Array.isArray(a) && Array.isArray(b)) return sameKeys(a, b);
  return a === b;
}

/**
 * A grid of data: the composite widget `table` declined to be. It owns the
 * rows, applies the query, walks the cells with one cursor, edits in place,
 * and lets the reader arrange the columns.
 */
export function DataGrid<Row>({
  activatable,
  cellRenderers,
  columnGroups,
  columnState: columnStateProp,
  columns,
  current: currentProp,
  defaultColumnState,
  defaultCurrent,
  defaultExpanded,
  defaultExpandedGroups,
  defaultQuery,
  defaultRange,
  defaultValue,
  disabledKeys,
  editMode,
  editorRenderers,
  error,
  expandable,
  expanded: expandedProp,
  expandedGroups: expandedGroupsProp,
  filterDebounce,
  filterRow,
  footer,
  handle,
  hasMore,
  height,
  label,
  labelledBy,
  labels,
  loadMoreThreshold,
  loading,
  locale,
  mode,
  onActivate,
  onColumnStateChange,
  onCurrentChange,
  onEditCancel,
  onEditCommit,
  onEditStart,
  onExpandedChange,
  onExpandedGroupsChange,
  onKeyDown,
  onLoadMore,
  onManageColumns,
  onQueryChange,
  onRangeChange,
  onRetry,
  onValueChange,
  overscan,
  pageSizes,
  query: queryProp,
  range: rangeProp,
  ref,
  renderCell,
  renderDetail,
  renderEditor,
  renderEmpty,
  renderFilterOperand,
  renderGroup,
  renderHeader,
  rowHeight,
  rowKey,
  rows,
  selectionMode,
  showRange,
  skeletonRows,
  stickyHeader,
  stickyTo,
  striped,
  style,
  timeZone,
  totalCount,
  value: valueProp,
  variant,
  virtualize,
  ...nativeProps
}: DataGridProps<Row>) {
  const defaults = useDataGridDefaults();
  const id = useId();
  /* `pageSizes` is a default the page-size control a consumer places in the
     footer reads through `useDataGridDefaults`; the grid itself pages by the
     query's own size. */
  void pageSizes;
  const root = useRef<HTMLDivElement | null>(null);
  const scroll = useRef<HTMLDivElement | null>(null);

  /* ── Resolution ─────────────────────────────────────────────────────── */
  const resolvedLabels = useMemo(
    () => resolveLabels(defaults.labels, labels),
    [defaults.labels, labels],
  );
  const resolvedVariant = variant ?? defaults.variant ?? 'ruled';
  const resolvedStriped = striped ?? defaults.striped ?? false;
  const resolvedSticky = stickyHeader ?? defaults.stickyHeader ?? true;
  const resolvedStickyTo = stickyTo ?? defaults.stickyTo ?? 'scroll';
  const resolvedSelection = selectionMode ?? defaults.selectionMode ?? 'none';
  const resolvedEditMode = editMode ?? defaults.editMode ?? 'cell';
  const resolvedFilterRow = filterRow ?? defaults.filterRow ?? false;
  const resolvedVirtualize = virtualize ?? defaults.virtualize ?? 'auto';
  const resolvedRowHeight = rowHeight ?? defaults.rowHeight;
  const resolvedOverscan = overscan ?? defaults.overscan ?? 6;
  const resolvedDebounce = filterDebounce ?? defaults.filterDebounce ?? 300;
  const resolvedThreshold = loadMoreThreshold ?? defaults.loadMoreThreshold ?? 20;
  const resolvedSkeleton = skeletonRows ?? defaults.skeletonRows ?? 8;
  const resolvedLocale = locale ?? defaults.locale;
  const resolvedActivatable = activatable ?? false;
  const resolvedMode =
    mode ?? (totalCount !== undefined || hasMore !== undefined ? 'server' : 'client');

  const rowKeyOf = useCallback(
    (row: Row) =>
      typeof rowKey === 'function'
        ? rowKey(row)
        : String((row as Record<keyof Row, unknown>)[rowKey]),
    [rowKey],
  );
  const formatOptions = useMemo(
    () => ({
      locale: resolvedLocale,
      timeZone,
      booleans: { true: resolvedLabels.filterYes, false: resolvedLabels.filterNo },
    }),
    [resolvedLocale, timeZone, resolvedLabels.filterYes, resolvedLabels.filterNo],
  );
  const textOf = useCallback(
    (column: GridColumn<Row>, row: Row) => cellText(column, row, formatOptions),
    [formatOptions],
  );
  const disabledSet = useMemo(() => new Set(disabledKeys ?? []), [disabledKeys]);
  const isDisabled = useCallback((key: string) => disabledSet.has(key), [disabledSet]);
  const isEditable = useCallback(
    (column: GridColumn<Row>, row: Row) => {
      if (disabledSet.has(rowKeyOf(row))) return false;
      const editable = column.editable;
      return typeof editable === 'function' ? editable(row) : editable === true;
    },
    [disabledSet, rowKeyOf],
  );
  const anyEditable = useMemo(() => columns.some((column) => column.editable), [columns]);
  const isExpandable = useCallback(
    (row: Row) => {
      if (!renderDetail) return false;
      if (expandable === undefined) return true;
      return typeof expandable === 'function' ? expandable(row) : expandable;
    },
    [expandable, renderDetail],
  );

  /* ── Models ─────────────────────────────────────────────────────────── */
  const [query, requestQuery] = useModel<GridQuery, { change: string }>(
    queryProp,
    defaultQuery ?? emptyQuery(),
    onQueryChange as never,
    sameQuery,
  );
  const normalizedState = useMemo(
    () => normalizeColumnState(columnStateProp ?? defaultColumnState, columns),
    [columnStateProp, columns],
  );
  const [columnState, requestColumnState] = useModel<GridColumnState, { change: string }>(
    columnStateProp === undefined ? undefined : normalizedState,
    normalizedState,
    onColumnStateChange as never,
    sameState,
  );
  const effectiveState = useMemo(
    () => normalizeColumnState(columnState, columns),
    [columnState, columns],
  );
  const [value, requestValue] = useModel<string | readonly string[] | null>(
    valueProp,
    defaultValue ?? (resolvedSelection === 'multiple' ? [] : null),
    onValueChange,
    sameSelection,
  );
  const [range, requestRange] = useModel<GridRange | null>(
    rangeProp,
    defaultRange ?? null,
    onRangeChange,
    sameRange,
  );
  const [current, requestCurrent] = useModel<GridCell | null>(
    currentProp,
    defaultCurrent ?? null,
    onCurrentChange,
    sameCell,
  );
  const [expanded, requestExpanded] = useModel<readonly string[]>(
    expandedProp,
    defaultExpanded ?? [],
    onExpandedChange,
    sameKeys,
  );
  const [expandedGroups, requestExpandedGroups] = useModel<DataGridExpandedGroups>(
    expandedGroupsProp,
    defaultExpandedGroups ?? 'all',
    onExpandedGroupsChange,
    sameKeys,
  );

  /* ── Columns ────────────────────────────────────────────────────────── */
  const hasSelectionColumn = resolvedSelection === 'single' || resolvedSelection === 'multiple';
  const hasExpanderColumn = renderDetail !== undefined;
  const gutters = useMemo(() => {
    const list: number[] = [];
    if (hasSelectionColumn) list.push(SELECTION_WIDTH);
    if (hasExpanderColumn) list.push(EXPANDER_WIDTH);
    return list;
  }, [hasSelectionColumn, hasExpanderColumn]);
  const leading = gutters.reduce((sum, width) => sum + width, 0);
  const resolved = useMemo(
    () => resolveColumns(columns, effectiveState, { leading }),
    [columns, effectiveState, leading],
  );
  const resolvedById = useMemo(
    () => new Map(resolved.map((column) => [column.id, column])),
    [resolved],
  );
  const columnIds = useMemo(
    () => [
      ...(hasSelectionColumn ? [SELECTION_COLUMN] : []),
      ...(hasExpanderColumn ? [EXPANDER_COLUMN] : []),
      ...resolved.map((column) => column.id),
    ],
    [hasSelectionColumn, hasExpanderColumn, resolved],
  );
  const template = useMemo(() => columnTemplate(resolved, gutters), [resolved, gutters]);

  /* ── The applied query ──────────────────────────────────────────────── */
  const result = useMemo(() => {
    if (resolvedMode === 'server') {
      const nodes: GridNode<Row>[] = rows.map((row, index) => ({
        kind: 'row',
        key: rowKeyOf(row),
        row,
        index:
          (query.page && 'index' in query.page ? query.page.index * query.page.size : 0) + index,
        groups: [],
      }));
      return {
        nodes,
        rows,
        total: totalCount ?? null,
        hasMore: hasMore ?? false,
        aggregates: {} as Record<string, unknown>,
      };
    }
    const applied = applyQuery(rows, columns, query, {
      rowKey: rowKeyOf,
      expandedGroups,
      locale: resolvedLocale,
      timeZone,
      booleans: formatOptions.booleans,
    });
    return { ...applied, total: applied.total };
  }, [
    resolvedMode,
    rows,
    columns,
    query,
    rowKeyOf,
    expandedGroups,
    resolvedLocale,
    timeZone,
    formatOptions.booleans,
    totalCount,
    hasMore,
  ]);
  const nodes = result.nodes;
  const total = result.total;
  const summaryColumns = useMemo(() => columns.filter((column) => column.aggregate), [columns]);
  const hasSummary = summaryColumns.length > 0 && resolvedMode === 'client';
  const headerRowCount =
    1 + (columnGroups && columnGroups.length > 0 ? 1 : 0) + (resolvedFilterRow ? 1 : 0);

  /* ── Cursor axis ────────────────────────────────────────────────────── */
  const cursorRows = useMemo(() => {
    const list = [HEADER_ROW];
    if (resolvedFilterRow) list.push(FILTER_ROW);
    for (const node of nodes)
      list.push(node.kind === 'group' ? `${GROUP_ROW_PREFIX}${node.key}` : node.key);
    if (hasSummary) list.push(SUMMARY_ROW);
    return list;
  }, [nodes, resolvedFilterRow, hasSummary]);
  const bodyStart = 1 + (resolvedFilterRow ? 1 : 0);
  const bodyEnd = bodyStart + nodes.length;

  /* ── Virtual rows ───────────────────────────────────────────────────── */
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [measuredRow, setMeasuredRow] = useState<number | null>(null);
  const [rowSizes, setRowSizes] = useState<ReadonlyMap<number, number>>(new Map());
  const autoRows = resolvedRowHeight === 'auto';
  const rowSize =
    typeof resolvedRowHeight === 'number' ? resolvedRowHeight : (measuredRow ?? DEFAULT_ROW_HEIGHT);
  const windowsRows =
    resolvedVirtualize === true ||
    (resolvedVirtualize === 'auto' && nodes.length > VIRTUALIZE_ROWS_FROM);
  const metrics = useMemo(() => {
    if (!autoRows) return undefined;
    return createRowMetrics(nodes.map((_node, index) => rowSizes.get(index) ?? rowSize));
  }, [autoRows, nodes, rowSizes, rowSize]);
  const rowWindow = useMemo(() => {
    if (!windowsRows) {
      return { startIndex: 0, endIndex: nodes.length, startOffset: 0, totalSize: 0 };
    }
    /* Before the scroller is measured the window is provisional — a screen's
       worth of rows — rather than the whole set: a grid of ten thousand rows
       mounted every one of them once, on its first paint, and windowed only
       from the second. */
    const win = virtualWindow({
      itemCount: nodes.length,
      itemSize: rowSize,
      metrics,
      overscan: resolvedOverscan,
      scrollOffset: Math.max(0, scrollTop),
      viewportSize: viewport.height || PROVISIONAL_VIEWPORT,
    });
    return {
      startIndex: win.startIndex,
      endIndex: win.endIndex,
      startOffset: win.startOffset,
      totalSize: win.totalSize,
    };
  }, [windowsRows, viewport.height, nodes.length, rowSize, metrics, resolvedOverscan, scrollTop]);
  const mountedNodes = useMemo(
    () => (windowsRows ? nodes.slice(rowWindow.startIndex, rowWindow.endIndex) : nodes),
    [windowsRows, nodes, rowWindow.startIndex, rowWindow.endIndex],
  );
  /** Rows the cursor needs mounted whatever the window says. */
  const [pinnedRows, setPinnedRows] = useState<readonly string[]>([]);

  /* ── Virtual columns ────────────────────────────────────────────────── */
  const middle = useMemo(() => resolved.filter((column) => column.pinned === null), [resolved]);
  const windowsColumns =
    resolvedVirtualize === true ||
    (resolvedVirtualize === 'auto' && middle.length > VIRTUALIZE_COLUMNS_FROM);
  const mountedColumns = useMemo(() => {
    if (!windowsColumns || viewport.width === 0) return resolved;
    const gutterWidth = gutters.reduce((sum, width) => sum + width, 0);
    const startZone = resolved
      .filter((column) => column.pinned === 'start')
      .reduce((sum, column) => sum + column.width, 0);
    const endZone = resolved
      .filter((column) => column.pinned === 'end')
      .reduce((sum, column) => sum + column.width, 0);
    const from = scrollLeft - COLUMN_OVERSCAN_PX;
    const to = scrollLeft + viewport.width - endZone + COLUMN_OVERSCAN_PX;
    let offset = gutterWidth + startZone;
    const kept = new Set<string>();
    for (const column of middle) {
      const end = offset + column.width;
      if (end >= from && offset <= to) kept.add(column.id);
      offset = end;
    }
    return resolved.filter(
      (column) =>
        column.pinned !== null ||
        kept.has(column.id) ||
        (current !== null && current.column === column.id),
    );
  }, [windowsColumns, viewport.width, resolved, gutters, scrollLeft, middle, current]);

  /* ── Selection ──────────────────────────────────────────────────────── */
  const selectableKeys = useMemo(() => {
    const source = resolvedMode === 'client' ? result.rows : rows;
    return source.map(rowKeyOf).filter((key) => !disabledSet.has(key));
  }, [resolvedMode, result.rows, rows, rowKeyOf, disabledSet]);
  const selectedList = useMemo<readonly string[]>(
    () =>
      Array.isArray(value) ? value : value === null || value === undefined ? [] : [value as string],
    [value],
  );
  const selectedSet = useMemo(() => new Set(selectedList), [selectedList]);
  const anchor = useRef<string | undefined>(undefined);
  const isSelected = useCallback((key: string) => selectedSet.has(key), [selectedSet]);
  const selectedCount = selectedList.filter((key) => selectableKeys.includes(key)).length;
  const allState: 'none' | 'some' | 'all' =
    selectedCount === 0 ? 'none' : selectedCount >= selectableKeys.length ? 'all' : 'some';

  const commitSelection = useCallback(
    (selected: readonly string[], reason: DataGridReason, source: unknown) => {
      const next = resolvedSelection === 'multiple' ? selected : (selected[0] ?? null);
      requestValue(next, reason, source);
    },
    [resolvedSelection, requestValue],
  );
  const toggleSelected = useCallback(
    (key: string, options: { range?: boolean; source?: unknown; reason?: DataGridReason }) => {
      if (resolvedSelection === 'none' || resolvedSelection === 'range' || disabledSet.has(key))
        return;
      const outcome = nextSelection({
        action: options.range ? 'range' : 'toggle',
        mode: resolvedSelection,
        selected: selectedList,
        keys: selectableKeys,
        key,
        anchor: anchor.current,
        disabled: (candidate) => disabledSet.has(candidate),
      });
      if (!options.range) anchor.current = key;
      if (outcome.changed)
        commitSelection(outcome.selected, options.reason ?? 'pointer', options.source);
    },
    [resolvedSelection, disabledSet, selectedList, selectableKeys, commitSelection],
  );
  const toggleAll = useCallback(
    (source?: unknown) => {
      if (resolvedSelection !== 'multiple') return;
      const outcome = nextSelection({
        action: 'all',
        mode: 'multiple',
        selected: selectedList,
        keys: selectableKeys,
      });
      if (outcome.changed) commitSelection(outcome.selected, 'select', source);
    },
    [resolvedSelection, selectedList, selectableKeys, commitSelection],
  );

  /* ── Cursor grid and range ──────────────────────────────────────────── */
  const pageRows = Math.max(1, Math.floor((viewport.height || 400) / rowSize) - 1);
  const cursorGrid = useMemo<CursorGrid>(
    () => ({ rows: cursorRows, columns: columnIds, pageSize: pageRows, bodyStart, bodyEnd }),
    [cursorRows, columnIds, pageRows, bodyStart, bodyEnd],
  );
  const bounds = useMemo(
    () => (resolvedSelection === 'range' ? rangeBounds(cursorGrid, range) : null),
    [resolvedSelection, cursorGrid, range],
  );
  const rangeInfo = useCallback(
    (cell: GridCell) => rangeEdges(cursorGrid, bounds, cell),
    [cursorGrid, bounds],
  );
  const [rangeDragging, setRangeDragging] = useState(false);
  const rangeAnchor = useRef<GridCell | null>(null);

  const beginRange = useCallback(
    (cell: GridCell, extend: boolean, source: unknown) => {
      if (resolvedSelection !== 'range' || !isBodyRow(cell.row)) return;
      const from = extend && range ? range.anchor : cell;
      rangeAnchor.current = from;
      requestRange({ anchor: from, focus: cell }, 'pointer', source);
    },
    [resolvedSelection, range, requestRange],
  );
  const extendRange = useCallback(
    (cell: GridCell, source: unknown) => {
      if (resolvedSelection !== 'range' || !isBodyRow(cell.row)) return;
      const from = rangeAnchor.current ?? range?.anchor ?? cell;
      requestRange({ anchor: from, focus: cell }, 'pointer', source);
    },
    [resolvedSelection, range, requestRange],
  );

  /* ── Announcer ──────────────────────────────────────────────────────── */
  const announce = useCallback((message: string) => {
    getLiveAnnouncer(root.current?.ownerDocument).announce(message);
  }, []);

  /* ── Focus ──────────────────────────────────────────────────────────── */
  const [focused, setFocused] = useState(false);
  const pendingFocus = useRef<GridCell | null>(null);
  const focusCellNow = useCallback((cell: GridCell) => {
    const element = root.current?.querySelector<HTMLElement>(
      `[data-row="${CSS.escape(cell.row)}"] [data-column="${CSS.escape(cell.column)}"]`,
    );
    if (!element) return false;
    /* The pattern's first combination — one simple widget takes the focus in
       the cell's place — is a rule for the body. A header's menu trigger and
       a group row's toggle are secondary controls of a cell that is itself the
       target; Enter reaches them. */
    const structural =
      element.matches('[data-part="column-header"], [data-part="filter-cell"]') ||
      element.querySelector('[data-part="group-toggle"]') !== null;
    const widgets = structural ? [] : [...element.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const single = widgets.length === 1 && widgets[0]!.matches(SIMPLE_WIDGET) ? widgets[0]! : null;
    (single ?? element).focus({ preventScroll: false });
    return true;
  }, []);

  const setCurrent = useCallback(
    (cell: GridCell, reason: DataGridReason, source?: unknown) => {
      if (!sameCell(cell, current)) requestCurrent(cell, reason, source);
      pendingFocus.current = cell;
      if (isBodyRow(cell.row) && !cursorRows.includes(cell.row)) return;
      /* Mount the row the cursor moves to when the window does not hold it. */
      const index = cursorRows.indexOf(cell.row) - bodyStart;
      if (
        windowsRows &&
        index >= 0 &&
        (index < rowWindow.startIndex || index >= rowWindow.endIndex)
      ) {
        setPinnedRows([cell.row]);
        const offset = metrics ? metrics.offsetOf(index) : index * rowSize;
        scroll.current?.scrollTo({ top: offset - viewport.height / 2 + rowSize });
      }
    },
    [
      current,
      requestCurrent,
      cursorRows,
      bodyStart,
      windowsRows,
      rowWindow,
      metrics,
      rowSize,
      viewport.height,
    ],
  );

  useLayoutEffect(() => {
    const cell = pendingFocus.current;
    if (!cell) return;
    if (focusCellNow(cell)) pendingFocus.current = null;
  });

  /* The cursor survives its row leaving: same index, same column. */
  const lastRowIndex = useRef(0);
  useEffect(() => {
    if (current && cursorRows.includes(current.row)) {
      lastRowIndex.current = cursorRows.indexOf(current.row);
      if (columnIds.includes(current.column)) return;
    }
    if (!current) return;
    const settled = settleCursor(cursorGrid, current, lastRowIndex.current);
    if (settled && !sameCell(settled, current)) {
      requestCurrent(settled, 'programmatic');
      if (focused) pendingFocus.current = settled;
    } else if (!settled && focused) {
      root.current?.querySelector<HTMLElement>('[data-part="empty"] [tabindex]')?.focus();
    }
  }, [cursorGrid, cursorRows, columnIds, current, requestCurrent, focused]);

  /* ── Sorting and filtering ──────────────────────────────────────────── */
  const sortOf = useCallback(
    (columnId: string) => {
      const index = query.sort.findIndex((key) => key.column === columnId);
      if (index === -1) return null;
      return { direction: query.sort[index]!.direction, index: index + 1 };
    },
    [query.sort],
  );
  const labelOf = useCallback(
    (columnId: string) => resolvedById.get(columnId)?.column.label ?? columnId,
    [resolvedById],
  );
  const announceSort = useCallback(
    (next: GridQuery) => {
      if (next.sort.length === 0) {
        announce(resolvedLabels.sortCleared);
        return;
      }
      const order = next.sort
        .map((key) =>
          fill(
            key.direction === 'ascending'
              ? resolvedLabels.sortAscending
              : resolvedLabels.sortDescending,
            {
              column: labelOf(key.column),
            },
          ),
        )
        .join(', ');
      announce(fill(resolvedLabels.sortedBy, { order }));
    },
    [announce, resolvedLabels, labelOf],
  );
  const pressSort = useCallback(
    (columnId: string, append: boolean, source?: unknown, reason: DataGridReason = 'pointer') => {
      const column = resolvedById.get(columnId);
      if (!column || !column.sortable) return;
      const move = withSortPress(query, columnId, append);
      requestQuery(move.query, reason, source, { change: move.change });
      announceSort(move.query);
    },
    [resolvedById, query, requestQuery, announceSort],
  );
  const setSort = useCallback(
    (columnId: string, direction: SortDirection | null, source?: unknown) => {
      const move = withSort(query, columnId, direction);
      requestQuery(move.query, 'pointer', source, { change: move.change });
      announceSort(move.query);
    },
    [query, requestQuery, announceSort],
  );
  const filterOf = useCallback(
    (columnId: string) => ruleFor(query.filter, columnId) ?? null,
    [query.filter],
  );
  const setFilter = useCallback(
    (
      columnId: string,
      filter: FilterDescriptor | null,
      reason: DataGridReason,
      source?: unknown,
    ) => {
      const move = withColumnFilter(query, columnId, filter);
      requestQuery(move.query, reason, source, { change: move.change });
    },
    [query, requestQuery],
  );
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const countsCache = useRef(new Map<string, ReadonlyMap<string, number>>());
  const countsFor = useCallback(
    (columnId: string) => {
      const key = `${columnId}|${JSON.stringify(query.filter)}|${query.search}|${rows.length}`;
      const cached = countsCache.current.get(key);
      if (cached) return cached;
      const column = columns.find((entry) => entry.id === columnId);
      const counts = new Map<string, number>();
      if (column) {
        const rest = withoutRuleFor(query.filter, columnId);
        const read = (row: Row, field: string) => {
          const target = columns.find((entry) => entry.id === field);
          return target ? cellValue(target, row) : undefined;
        };
        const match = createFilterGroupPredicate<Row>(rest.rules.length ? rest : null, read, {
          locale: resolvedLocale,
        });
        for (const row of rows) {
          if (!match(row)) continue;
          const raw = cellValue(column, row);
          for (const entry of Array.isArray(raw) ? raw : [raw]) {
            if (entry === null || entry === undefined || entry === '') continue;
            const text = String(entry);
            counts.set(text, (counts.get(text) ?? 0) + 1);
          }
        }
      }
      countsCache.current = new Map([[key, counts]]);
      return counts;
    },
    [columns, query.filter, query.search, rows, resolvedLocale],
  );

  /* ── Column moves ───────────────────────────────────────────────────── */
  const requestState = useCallback(
    (next: GridColumnState, change: string, reason: DataGridReason, source?: unknown) => {
      requestColumnState(next, reason, source, { change });
    },
    [requestColumnState],
  );
  const pin = useCallback(
    (columnId: string, zone: 'start' | 'end' | null, source?: unknown) => {
      requestState(withColumnPinned(effectiveState, columnId, zone), 'pinned', 'pointer', source);
    },
    [effectiveState, requestState],
  );
  const hide = useCallback(
    (columnId: string, source?: unknown) => {
      requestState(withColumnHidden(effectiveState, columnId, true), 'hidden', 'pointer', source);
    },
    [effectiveState, requestState],
  );
  const resizeTo = useCallback(
    (columnId: string, width: number, reason: DataGridReason, source?: unknown) => {
      const column = columns.find((entry) => entry.id === columnId);
      if (!column) return;
      const next = withColumnWidth(effectiveState, column, width);
      requestState(next, 'width', reason, source);
      if (reason === 'keyboard') {
        announce(
          fill(resolvedLabels.resized, {
            column: column.label,
            width: next.widths[columnId] ?? width,
          }),
        );
      }
    },
    [columns, effectiveState, requestState, announce, resolvedLabels.resized],
  );
  const resizeBy = useCallback(
    (columnId: string, delta: number, source?: unknown) => {
      const column = resolvedById.get(columnId);
      if (!column || !column.resizable) return;
      resizeTo(columnId, column.width + delta, 'keyboard', source);
    },
    [resolvedById, resizeTo],
  );
  const autofit = useCallback(
    (columnId: string, source?: unknown) => {
      const element = root.current;
      const column = resolvedById.get(columnId);
      if (!element || !column) return;
      let widest = 0;
      for (const cell of element.querySelectorAll<HTMLElement>(
        `[data-column="${CSS.escape(columnId)}"]`,
      )) {
        const inner = cell.firstElementChild as HTMLElement | null;
        const width = inner ? inner.scrollWidth : cell.scrollWidth;
        const padding =
          cell.offsetWidth -
          cell.clientWidth +
          parseFloat(getComputedStyle(cell).paddingInlineStart) +
          parseFloat(getComputedStyle(cell).paddingInlineEnd);
        widest = Math.max(
          widest,
          width + padding + (cell.getAttribute('role') === 'columnheader' ? 32 : 0),
        );
      }
      if (widest > 0) resizeTo(columnId, Math.ceil(widest), 'keyboard', source);
    },
    [resolvedById, resizeTo],
  );
  const moveColumn = useCallback(
    (columnId: string, direction: -1 | 1, source?: unknown) => {
      const column = resolvedById.get(columnId);
      if (!column || !column.reorderable) return;
      const zone = zoneOf(resolved, columnId);
      const index = zone.indexOf(columnId);
      const target = index + direction;
      if (target < 0 || target >= zone.length) return;
      requestState(
        withColumnMoved(effectiveState, columnId, target, zone),
        'order',
        'keyboard',
        source,
      );
    },
    [resolvedById, resolved, effectiveState, requestState],
  );
  const [resizing, setResizing] = useState<string | null>(null);

  /* ── Reordering by drag ─────────────────────────────────────────────── */
  const [dragState, setDragState] = useState<{
    dragging: string | null;
    target: string | null;
    offset: number | null;
  }>({
    dragging: null,
    target: null,
    offset: null,
  });
  const drag = useRef<DragController | null>(null);
  const latest = useRef({ resolved, effectiveState, requestState, gutters, labelOf });
  latest.current = { resolved, effectiveState, requestState, gutters, labelOf };
  const draggables = useRef(new Map<string, () => void>());
  const swallowClick = useRef(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const controller = createDragController({
      document: element.ownerDocument,
      preview: false,
      autoScroll: false,
      onDrop: ({ items, target, reason, event }) => {
        if (target.kind !== 'between') return;
        const { resolved: list, effectiveState: state, requestState: request } = latest.current;
        const columnId = items[0]!;
        const zone = zoneOf(list, columnId);
        const from = zone.indexOf(columnId);
        const to = target.index > from ? target.index - 1 : target.index;
        request(
          withColumnMoved(state, columnId, to, zone),
          'order',
          reason === 'keyboard' ? 'keyboard' : 'pointer',
          event,
        );
      },
    });
    const zoneItems = (zone: 'start' | 'middle' | 'end') => () =>
      latest.current.resolved
        .filter((column) => (zone === 'middle' ? column.pinned === null : column.pinned === zone))
        .map((column) => column.id);
    const headerOf = (columnId: string) =>
      element.querySelector(`[data-part="column-header"][data-column="${CSS.escape(columnId)}"]`);
    for (const zone of ['start', 'middle', 'end'] as const) {
      controller.registerContainer({
        key: zone,
        items: zoneItems(zone),
        orientation: 'horizontal',
        element: () => element.querySelector('[data-part="header-row"]:last-of-type'),
        itemElement: headerOf,
        label: () => zone,
        itemLabel: (columnId) => latest.current.labelOf(columnId),
      });
    }
    let wasDragging = false;
    const unsubscribe = controller.subscribe((state) => {
      if (state.status !== 'dragging') {
        /* The click the browser fires after a drop is the drag's, not a press
           on the header: read live, a reordered column came back sorted. */
        if (wasDragging) swallowClick.current = true;
        wasDragging = false;
        setDragState({ dragging: null, target: null, offset: null });
        return;
      }
      wasDragging = true;
      const target = state.target && state.target.kind === 'between' ? state.target : null;
      let offset: number | null = null;
      let over: string | null = null;
      if (target) {
        const zoneList = zoneItems(target.container as 'start' | 'middle' | 'end')();
        const scroller = scroll.current;
        const first = zoneList[Math.min(target.index, zoneList.length - 1)];
        const header = first ? headerOf(first) : null;
        if (header && scroller) {
          const box = header.getBoundingClientRect();
          const origin = scroller.getBoundingClientRect();
          const atEnd = target.index >= zoneList.length;
          const rtl = getComputedStyle(scroller).direction === 'rtl';
          const edge = atEnd !== rtl ? box.right : box.left;
          offset = rtl
            ? origin.right - edge + scroller.scrollLeft
            : edge - origin.left + scroller.scrollLeft;
          over = zoneList[target.index] ?? null;
        }
      }
      setDragState({ dragging: state.items[0] ?? null, target: over, offset });
    });
    drag.current = controller;
    const attached = draggables.current;
    return () => {
      unsubscribe();
      for (const detach of attached.values()) detach();
      attached.clear();
      controller.destroy();
      drag.current = null;
    };
  }, []);

  const attachDraggable = useCallback((node: HTMLElement | null, columnId: string) => {
    const controller = drag.current;
    const previous = draggables.current.get(columnId);
    if (previous) {
      previous();
      draggables.current.delete(columnId);
    }
    if (!node || !controller) return;
    const column = latest.current.resolved.find((entry) => entry.id === columnId);
    if (!column || !column.reorderable) return;
    const zone = column.pinned ?? 'middle';
    const detach = controller.attachDraggable(node, {
      container: zone,
      key: columnId,
      handle: () => node,
      distance: 6,
    });
    draggables.current.set(columnId, detach);
  }, []);

  /* ── Expansion ──────────────────────────────────────────────────────── */
  const expandedSet = useMemo(() => new Set(expanded), [expanded]);
  const isExpanded = useCallback((key: string) => expandedSet.has(key), [expandedSet]);
  const toggleExpanded = useCallback(
    (key: string, source?: unknown, reason: DataGridReason = 'pointer') => {
      const next = expandedSet.has(key)
        ? expanded.filter((entry) => entry !== key)
        : [...expanded, key];
      requestExpanded(next, reason, source);
    },
    [expandedSet, expanded, requestExpanded],
  );
  const groupKeys = useMemo(
    () => nodes.filter((node) => node.kind === 'group').map((node) => node.key),
    [nodes],
  );
  const toggleGroup = useCallback(
    (key: string, source?: unknown, reason: DataGridReason = 'pointer') => {
      const open = expandedGroups === 'all' || expandedGroups.includes(key);
      let next: DataGridExpandedGroups;
      if (expandedGroups === 'all') {
        /* Closing one group under `all` names every other open group. Groups
           below the closed one are not listed, so they open again with it. */
        next = groupKeys.filter((entry) => entry !== key && !entry.startsWith(`${key}/`));
      } else {
        next = open ? expandedGroups.filter((entry) => entry !== key) : [...expandedGroups, key];
      }
      requestExpandedGroups(next, reason, source);
    },
    [expandedGroups, groupKeys, requestExpandedGroups],
  );

  /* ── Editing ────────────────────────────────────────────────────────── */
  const [edit, setEdit] = useState<EditSession | null>(null);
  const editRef = useRef(edit);
  editRef.current = edit;
  const rowOf = useCallback(
    (key: string) => {
      const node = nodes.find((entry) => entry.kind === 'row' && entry.key === key);
      return node && node.kind === 'row' ? node.row : undefined;
    },
    [nodes],
  );

  const startEdit = useCallback(
    (cell: GridCell, seed: string | null = null) => {
      const row = rowOf(cell.row);
      const column = columns.find((entry) => entry.id === cell.column);
      if (!row || !column || !isEditable(column, row)) return;
      const editing =
        resolvedEditMode === 'row'
          ? columns.filter((entry) => isEditable(entry, row)).map((entry) => entry.id)
          : [cell.column];
      const originals: Record<string, unknown> = {};
      for (const columnId of editing) {
        const target = columns.find((entry) => entry.id === columnId)!;
        originals[columnId] = cellValue(target, row);
      }
      const drafts = { ...originals };
      if (seed !== null) drafts[cell.column] = column.kind === 'number' ? Number(seed) : seed;
      setEdit({ cell, columns: editing, drafts, originals, status: 'editing', messages: {}, seed });
      onEditStart?.(cell);
      pendingFocus.current = cell;
    },
    [rowOf, columns, isEditable, resolvedEditMode, onEditStart],
  );
  const setDraft = useCallback((columnId: string, draft: unknown) => {
    setEdit((session) =>
      session
        ? { ...session, drafts: { ...session.drafts, [columnId]: draft }, status: 'editing' }
        : session,
    );
  }, []);
  const cancelEdit = useCallback(() => {
    const session = editRef.current;
    if (!session) return;
    setEdit(null);
    onEditCancel?.(session.cell);
    pendingFocus.current = session.cell;
  }, [onEditCancel]);

  const nextEditableCell = useCallback(
    (cell: GridCell, move: 'down' | 'next' | 'previous'): GridCell | null => {
      if (move === 'down') {
        const next = moveCursor(cursorGrid, cell, 'down');
        return sameCell(next, cell) || !isBodyRow(next.row) ? null : next;
      }
      const row = rowOf(cell.row);
      if (!row) return null;
      const editable = columnIds.filter((columnId) => {
        const column = columns.find((entry) => entry.id === columnId);
        return column !== undefined && isEditable(column, row);
      });
      const index = editable.indexOf(cell.column);
      const target = editable[index + (move === 'next' ? 1 : -1)];
      return target ? { row: cell.row, column: target } : null;
    },
    [cursorGrid, rowOf, columnIds, columns, isEditable],
  );

  const commitEdit = useCallback(
    (
      reason: 'keyboard' | 'pointer' | 'blur' | 'programmatic',
      options: { move?: 'down' | 'next' | 'previous' | 'stay' } = {},
    ) => {
      const session = editRef.current;
      if (!session || session.status === 'pending') return;
      const row = rowOf(session.cell.row);
      if (!row) {
        setEdit(null);
        return;
      }
      const changes: Record<string, unknown> = {};
      for (const columnId of session.columns) {
        if (!Object.is(session.drafts[columnId], session.originals[columnId]))
          changes[columnId] = session.drafts[columnId];
      }
      const after = () => {
        const move = options.move ?? 'stay';
        const target = move === 'stay' ? null : nextEditableCell(session.cell, move);
        setEdit(null);
        if (target) {
          setCurrent(target, 'keyboard');
          if (resolvedEditMode === 'cell' && move !== 'down') startEdit(target);
        } else pendingFocus.current = session.cell;
      };
      if (Object.keys(changes).length === 0) {
        after();
        return;
      }
      const validate = async () => {
        const messages: Record<string, string> = {};
        for (const columnId of Object.keys(changes)) {
          const column = columns.find((entry) => entry.id === columnId)!;
          const parsed = column.parse ? column.parse(changes[columnId], row) : changes[columnId];
          changes[columnId] = parsed;
          const message = column.validate ? await column.validate(parsed, row) : null;
          if (message) messages[columnId] = message;
        }
        return messages;
      };
      const run = async () => {
        setEdit((state) => (state ? { ...state, status: 'pending' } : state));
        const messages = await validate();
        if (Object.keys(messages).length > 0) {
          setEdit((state) => (state ? { ...state, status: 'invalid', messages } : state));
          pendingFocus.current = session.cell;
          return;
        }
        const primary =
          session.cell.column in changes ? session.cell.column : Object.keys(changes)[0]!;
        try {
          await onEditCommit?.({
            key: session.cell.row,
            column: primary,
            value: changes[primary],
            previous: session.originals[primary],
            row,
            reason,
            changes,
          });
          after();
        } catch (failure) {
          const message =
            failure instanceof Error && failure.message
              ? failure.message
              : resolvedLabels.editFailed;
          setEdit((state) =>
            state ? { ...state, status: 'invalid', messages: { [primary]: message } } : state,
          );
          pendingFocus.current = session.cell;
        }
      };
      void run();
    },
    [
      rowOf,
      nextEditableCell,
      setCurrent,
      resolvedEditMode,
      startEdit,
      columns,
      onEditCommit,
      resolvedLabels.editFailed,
    ],
  );

  /* A row that changes under an open editor is a conflict, not a refresh. */
  useEffect(() => {
    const session = editRef.current;
    if (!session || session.status === 'pending') return;
    const row = rowOf(session.cell.row);
    if (!row) return;
    const conflicts: Record<string, string> = {};
    for (const columnId of session.columns) {
      const column = columns.find((entry) => entry.id === columnId);
      if (column && !Object.is(cellValue(column, row), session.originals[columnId])) {
        conflicts[columnId] = resolvedLabels.editConflict;
      }
    }
    if (Object.keys(conflicts).length > 0) {
      setEdit({ ...session, status: 'invalid', messages: { ...session.messages, ...conflicts } });
    }
  }, [rows, rowOf, columns, resolvedLabels.editConflict]);

  const activate = useCallback(
    (key: string, reason: 'pointer' | 'keyboard', event: unknown) => {
      onActivate?.({ key, reason, event });
    },
    [onActivate],
  );

  /* ── Scrolling and measuring ────────────────────────────────────────── */
  useEffect(() => {
    const scroller = scroll.current;
    if (!scroller) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrollTop(scroller.scrollTop);
      setScrollLeft(Math.abs(scroller.scrollLeft));
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    /* Guarded like `@slotted/core/overflow` guards it: a test document has
       no observer, and a grid that never learns its viewport windows nothing
       and stays correct. */
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            setViewport({ width: scroller.clientWidth, height: scroller.clientHeight });
          });
    observer?.observe(scroller);
    setViewport({ width: scroller.clientWidth, height: scroller.clientHeight });
    const affordance = createScrollAffordance(scroller, {
      orientation: () => 'horizontal',
      onChange: (state) => {
        scroller.toggleAttribute('data-overflowing', state.overflowing);
        scroller.toggleAttribute('data-at-start', state.overflowing && state.atStart);
        scroller.toggleAttribute('data-at-end', state.overflowing && state.atEnd);
      },
    });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      affordance.destroy();
    };
  }, []);

  /* The row height, read once from the first mounted row. */
  const measureRow = useCallback(
    (index: number, node: HTMLElement | null) => {
      if (!node) return;
      const height = node.getBoundingClientRect().height;
      if (height === 0) return;
      if (typeof resolvedRowHeight !== 'number' && measuredRow === null)
        setMeasuredRow(Math.round(height));
      if (autoRows) {
        setRowSizes((sizes) =>
          sizes.get(index) === height ? sizes : new Map(sizes).set(index, height),
        );
      }
    },
    [resolvedRowHeight, measuredRow, autoRows],
  );

  /* Load more when the window nears the end. */
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;
    const remaining = nodes.length - rowWindow.endIndex;
    if (
      windowsRows
        ? remaining <= resolvedThreshold
        : scrollTop + viewport.height >=
          (scroll.current?.scrollHeight ?? 0) - rowSize * resolvedThreshold
    ) {
      onLoadMore();
    }
  }, [
    onLoadMore,
    hasMore,
    loading,
    nodes.length,
    rowWindow.endIndex,
    windowsRows,
    resolvedThreshold,
    scrollTop,
    viewport.height,
    rowSize,
  ]);

  /* ── Keyboard ───────────────────────────────────────────────────────── */
  const rtl = () => (root.current ? getComputedStyle(root.current).direction === 'rtl' : false);

  const copyRange = useCallback(
    async (cell: GridCell) => {
      const cells = bounds ? rangeCells(cursorGrid, bounds) : [[cell]];
      const text = rangeToText(cells, (target) => {
        const row = rowOf(target.row);
        const column = columns.find((entry) => entry.id === target.column);
        return row && column ? textOf(column, row) : '';
      });
      const outcome = await writeToClipboard(text, root.current?.ownerDocument);
      if (outcome !== 'refused') {
        announce(
          fill(resolvedLabels.copied, { count: cells.reduce((sum, line) => sum + line.length, 0) }),
        );
      }
    },
    [bounds, cursorGrid, rowOf, columns, textOf, announce, resolvedLabels.copied],
  );

  const onCellKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, cell: GridCell) => {
      if (event.defaultPrevented) return;
      const session = editRef.current;
      const target = event.target as HTMLElement;
      const cellElement = event.currentTarget;
      const insideWidget = target !== cellElement;
      const key = event.key;
      const mirror = rtl();

      /* Inside an editor: the editor's own keys, then commit and cancel. */
      if (session && sameCell(session.cell, cell)) {
        if (key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          cancelEdit();
          return;
        }
        if (key === 'Enter') {
          event.preventDefault();
          commitEdit('keyboard', { move: resolvedEditMode === 'cell' ? 'down' : 'stay' });
          return;
        }
        if (key === 'Tab') {
          const next = nextEditableCell(cell, event.shiftKey ? 'previous' : 'next');
          if (next) {
            event.preventDefault();
            commitEdit('keyboard', { move: event.shiftKey ? 'previous' : 'next' });
          } else {
            commitEdit('keyboard', { move: 'stay' });
          }
          return;
        }
        if (key === 'F2') {
          event.preventDefault();
          commitEdit('keyboard', { move: 'stay' });
          return;
        }
        return;
      }
      if (session && session.columns.includes(cell.column) && session.cell.row === cell.row) {
        /* Another cell of a row in edit. */
        if (key === 'Escape') {
          event.preventDefault();
          cancelEdit();
          return;
        }
        if (key === 'Enter') {
          event.preventDefault();
          commitEdit('keyboard', { move: 'stay' });
          return;
        }
        if (key === 'Tab') return;
        return;
      }

      /* Inside a widget the cursor entered: Escape returns to the cell, Tab cycles. */
      if (insideWidget && !target.matches(SIMPLE_WIDGET)) {
        if (key === 'Escape') {
          event.preventDefault();
          cellElement.focus();
        } else if (key === 'Tab') {
          const widgets = [...cellElement.querySelectorAll<HTMLElement>(FOCUSABLE)];
          if (widgets.length > 1) {
            const index = widgets.indexOf(target);
            const next =
              widgets[(index + (event.shiftKey ? -1 : 1) + widgets.length) % widgets.length];
            event.preventDefault();
            next?.focus();
          }
        }
        return;
      }

      const header = cell.row === HEADER_ROW;
      const column = resolvedById.get(cell.column);
      const row = isBodyRow(cell.row) ? rowOf(cell.row) : undefined;
      const intents: Record<string, CursorIntent> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: mirror ? 'end' : 'start',
        ArrowRight: mirror ? 'start' : 'end',
        Home: event.ctrlKey || event.metaKey ? 'first' : 'rowStart',
        End: event.ctrlKey || event.metaKey ? 'last' : 'rowEnd',
        PageUp: 'pageUp',
        PageDown: 'pageDown',
      };

      /* Column operations, on a header. */
      if (header && column) {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          (key === 'ArrowLeft' || key === 'ArrowRight')
        ) {
          event.preventDefault();
          const grow = (key === 'ArrowRight') !== mirror;
          resizeBy(cell.column, grow ? RESIZE_STEP : -RESIZE_STEP, event);
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'Enter') {
          event.preventDefault();
          autofit(cell.column, event);
          return;
        }
        if (event.altKey && (key === 'ArrowLeft' || key === 'ArrowRight')) {
          event.preventDefault();
          const forward = (key === 'ArrowRight') !== mirror;
          moveColumn(cell.column, forward ? 1 : -1, event);
          pendingFocus.current = cell;
          return;
        }
        if ((event.ctrlKey || event.metaKey) && key === 'Enter') {
          event.preventDefault();
          setMenuOpen(cell.column);
          return;
        }
        if (key === 'Enter' || key === ' ') {
          if (insideWidget) return;
          event.preventDefault();
          pressSort(cell.column, event.shiftKey, event, 'keyboard');
          return;
        }
      }

      /* Group rows open and close with the horizontal arrows. */
      if (
        isGroupCursorRow(cell.row) &&
        (key === 'ArrowRight' || key === 'ArrowLeft') &&
        !event.shiftKey
      ) {
        const groupKey = cell.row.slice(GROUP_ROW_PREFIX.length);
        const open = expandedGroups === 'all' || expandedGroups.includes(groupKey);
        const opening = (key === 'ArrowRight') !== mirror;
        if (opening !== open) {
          event.preventDefault();
          toggleGroup(groupKey, event, 'keyboard');
          return;
        }
      }
      if (
        row &&
        cell.column === EXPANDER_COLUMN &&
        (key === 'ArrowRight' || key === 'ArrowLeft') &&
        !event.shiftKey &&
        isExpandable(row)
      ) {
        const open = expandedSet.has(cell.row);
        const opening = (key === 'ArrowRight') !== mirror;
        if (opening !== open) {
          event.preventDefault();
          toggleExpanded(cell.row, event, 'keyboard');
          return;
        }
      }

      /* Selection keys. */
      if (key === ' ' && event.shiftKey && row) {
        event.preventDefault();
        if (resolvedSelection === 'range') {
          const line = rowRange(cursorGrid, cell.row);
          if (line) requestRange(line, 'keyboard', event);
        } else toggleSelected(cell.row, { range: false, source: event, reason: 'keyboard' });
        return;
      }
      if (
        key === ' ' &&
        (event.ctrlKey || event.metaKey) &&
        resolvedSelection === 'range' &&
        column
      ) {
        event.preventDefault();
        const line = columnRange(cursorGrid, cell.column);
        if (line) requestRange(line, 'keyboard', event);
        return;
      }
      if ((key === 'a' || key === 'A') && (event.ctrlKey || event.metaKey) && !insideWidget) {
        if (resolvedSelection === 'multiple') {
          event.preventDefault();
          const outcome = nextSelection({
            action: 'all',
            mode: 'multiple',
            selected: selectedList,
            keys: selectableKeys,
          });
          if (outcome.changed || selectedCount < selectableKeys.length)
            commitSelection(selectableKeys, 'select', event);
          return;
        }
        if (resolvedSelection === 'range') {
          event.preventDefault();
          const all = wholeRange(cursorGrid);
          if (all) requestRange(all, 'keyboard', event);
          return;
        }
      }
      if ((key === 'c' || key === 'C') && (event.ctrlKey || event.metaKey) && !insideWidget) {
        const selection = cellElement.ownerDocument.getSelection();
        if (selection && selection.toString().length > 0) return;
        event.preventDefault();
        void copyRange(cell);
        return;
      }
      if (key === 'Escape' && resolvedSelection === 'range' && range) {
        event.preventDefault();
        requestRange(null, 'clear', event);
        return;
      }

      /* Entering a cell: the editor, or the widgets inside. */
      if (row && column && (key === 'Enter' || key === 'F2')) {
        const editable = isEditable(column.column, row);
        if (editable && !insideWidget) {
          event.preventDefault();
          startEdit(cell);
          return;
        }
        const widgets = cellElement.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!insideWidget && widgets.length > 0) {
          event.preventDefault();
          widgets[0]!.focus();
          return;
        }
        if (key === 'Enter' && resolvedActivatable && !insideWidget) {
          event.preventDefault();
          activate(cell.row, 'keyboard', event);
          return;
        }
      }
      if (
        row &&
        column &&
        !insideWidget &&
        key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        (column.kind === 'text' || column.kind === 'number') &&
        isEditable(column.column, row)
      ) {
        if (column.kind === 'number' && !/[0-9.,-]/.test(key)) return;
        event.preventDefault();
        startEdit(cell, key);
        return;
      }

      const intent = intents[key];
      if (!intent) return;
      if (
        insideWidget &&
        (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End') &&
        target.matches('input, textarea')
      ) {
        return;
      }
      event.preventDefault();
      const next = moveCursor(cursorGrid, cell, intent);
      if (event.shiftKey && key.startsWith('Arrow')) {
        if (resolvedSelection === 'range' && isBodyRow(next.row)) {
          const from = range?.anchor ?? cell;
          requestRange({ anchor: from, focus: next }, 'keyboard', event);
        } else if (
          resolvedSelection === 'multiple' &&
          (key === 'ArrowUp' || key === 'ArrowDown') &&
          isBodyRow(next.row)
        ) {
          toggleSelected(next.row, { range: true, source: event, reason: 'keyboard' });
        }
      }
      if (!sameCell(next, cell)) setCurrent(next, 'keyboard', event);
    },
    [
      cancelEdit,
      commitEdit,
      resolvedEditMode,
      nextEditableCell,
      resolvedById,
      rowOf,
      resizeBy,
      autofit,
      moveColumn,
      pressSort,
      expandedGroups,
      toggleGroup,
      isExpandable,
      expandedSet,
      toggleExpanded,
      resolvedSelection,
      cursorGrid,
      requestRange,
      toggleSelected,
      selectedList,
      selectableKeys,
      selectedCount,
      commitSelection,
      copyRange,
      range,
      isEditable,
      startEdit,
      resolvedActivatable,
      activate,
      setCurrent,
    ],
  );

  /* ── Pointer ────────────────────────────────────────────────────────── */
  const onCellPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>, cell: GridCell) => {
      if (event.button !== 0) return;
      swallowClick.current = false;
      const session = editRef.current;
      if (
        session &&
        !sameCell(session.cell, cell) &&
        !(session.cell.row === cell.row && session.columns.includes(cell.column))
      ) {
        commitEdit('blur', { move: 'stay' });
      }
      if (!sameCell(cell, current)) requestCurrent(cell, 'pointer', event);
      if (resolvedSelection === 'range' && isBodyRow(cell.row)) {
        if (!insideWidget(event)) {
          beginRange(cell, event.shiftKey, event);
          setRangeDragging(true);
        }
      }
    },
    [commitEdit, current, requestCurrent, resolvedSelection, beginRange],
  );
  const onCellPointerEnter = useCallback(
    (event: PointerEvent<HTMLElement>, cell: GridCell) => {
      if (rangeDragging && event.buttons === 1) extendRange(cell, event);
    },
    [rangeDragging, extendRange],
  );
  useEffect(() => {
    if (!rangeDragging) return;
    const end = () => setRangeDragging(false);
    const doc = root.current?.ownerDocument ?? document;
    doc.addEventListener('pointerup', end);
    doc.addEventListener('pointercancel', end);
    return () => {
      doc.removeEventListener('pointerup', end);
      doc.removeEventListener('pointercancel', end);
    };
  }, [rangeDragging]);

  const onCellClick = useCallback(
    (event: MouseEvent<HTMLElement>, cell: GridCell) => {
      if (swallowClick.current) {
        swallowClick.current = false;
        return;
      }
      if (insideWidget(event)) return;
      if (cell.row === HEADER_ROW && resolvedById.get(cell.column)?.sortable) {
        pressSort(cell.column, event.shiftKey, event, 'pointer');
        return;
      }
      if (isGroupCursorRow(cell.row)) {
        toggleGroup(cell.row.slice(GROUP_ROW_PREFIX.length), event);
        return;
      }
      if (isBodyRow(cell.row) && resolvedSelection === 'single' && !disabledSet.has(cell.row)) {
        toggleSelected(cell.row, { range: false, source: event });
      }
    },
    [resolvedById, pressSort, toggleGroup, resolvedSelection, disabledSet, toggleSelected],
  );
  const onCellDoubleClick = useCallback(
    (event: MouseEvent<HTMLElement>, cell: GridCell) => {
      if (insideWidget(event)) return;
      const row = rowOf(cell.row);
      const column = columns.find((entry) => entry.id === cell.column);
      if (!row) return;
      if (column && isEditable(column, row) && !resolvedActivatable) {
        startEdit(cell);
        return;
      }
      if (resolvedActivatable) activate(cell.row, 'pointer', event);
      else if (column && isEditable(column, row)) startEdit(cell);
    },
    [rowOf, columns, isEditable, resolvedActivatable, startEdit, activate],
  );
  const onCellFocus = useCallback(
    (cell: GridCell) => {
      setFocused(true);
      if (!sameCell(cell, current)) requestCurrent(cell, 'programmatic');
    },
    [current, requestCurrent],
  );
  const onCellBlur = useCallback(() => {
    /* Blur inside the grid is followed by a focus inside it; the flag is
       cleared only when focus leaves the root, below. */
  }, []);
  const onRootBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (!next || !event.currentTarget.contains(next)) {
        setFocused(false);
        const session = editRef.current;
        if (session && session.status === 'editing') {
          /* Focus leaving the grid commits the draft, as leaving a field does. */
          commitEdit('blur', { move: 'stay' });
        }
      }
    },
    [commitEdit],
  );

  /* ── Renderers ──────────────────────────────────────────────────────── */
  const renderCellContent = useCallback(
    (context: DataGridCellContext<Row>) => {
      const own = cellRenderers?.[context.column.id];
      if (own) return own(context);
      if (renderCell) return renderCell(context);
      return defaultCellContent(context);
    },
    [cellRenderers, renderCell],
  );
  const renderEditorContent = useCallback(
    (context: DataGridEditorContext<Row>): ReactNode => {
      const own = editorRenderers?.[context.column.id];
      if (own) return own(context);
      if (renderEditor) return renderEditor(context);
      return defaultEditor(context, resolvedLabels, resolvedLocale);
    },
    [editorRenderers, renderEditor, resolvedLabels, resolvedLocale],
  );

  /* ── Handle ─────────────────────────────────────────────────────────── */
  const scrollToRowKey = useCallback(
    (key: string, align: 'start' | 'center' | 'end' | 'nearest' = 'nearest') => {
      const index = nodes.findIndex((node) => node.key === key);
      const scroller = scroll.current;
      if (index === -1 || !scroller) return;
      const offset = metrics ? metrics.offsetOf(index) : index * rowSize;
      const head = scroller.querySelector<HTMLElement>('[data-part="head"]')?.offsetHeight ?? 0;
      let top = offset;
      if (align === 'center') top = offset - viewport.height / 2 + rowSize;
      else if (align === 'end') top = offset - viewport.height + rowSize + head;
      else if (align === 'nearest') {
        const visibleTop = scroller.scrollTop;
        const visibleBottom = visibleTop + viewport.height - head;
        if (offset >= visibleTop && offset + rowSize <= visibleBottom) return;
        top = offset < visibleTop ? offset : offset - viewport.height + rowSize + head;
      }
      scroller.scrollTo({ top: Math.max(0, top) });
      if (windowsRows) setPinnedRows([key]);
    },
    [nodes, metrics, rowSize, viewport.height, windowsRows],
  );
  const scrollToColumnId = useCallback(
    (columnId: string) => {
      const scroller = scroll.current;
      const column = resolvedById.get(columnId);
      if (!scroller || !column || column.pinned) return;
      let offset = gutters.reduce((sum, width) => sum + width, 0);
      for (const entry of resolved) {
        if (entry.id === columnId) break;
        if (entry.pinned === null || entry.pinned === 'start') offset += entry.width;
      }
      const startZone =
        resolved
          .filter((entry) => entry.pinned === 'start')
          .reduce((sum, entry) => sum + entry.width, 0) +
        gutters.reduce((sum, width) => sum + width, 0);
      const endZone = resolved
        .filter((entry) => entry.pinned === 'end')
        .reduce((sum, entry) => sum + entry.width, 0);
      const left = Math.abs(scroller.scrollLeft);
      if (offset < left + startZone) scroller.scrollTo({ left: offset - startZone });
      else if (offset + column.width > left + viewport.width - endZone)
        scroller.scrollTo({ left: offset + column.width - viewport.width + endZone });
    },
    [resolvedById, gutters, resolved, viewport.width],
  );
  useImperativeHandle(
    handle,
    (): DataGridHandle => ({
      focusCell: (cell) => setCurrent(cell, 'programmatic'),
      scrollToRow: scrollToRowKey,
      scrollToColumn: scrollToColumnId,
      scrollToCell: (cell) => {
        scrollToRowKey(cell.row);
        scrollToColumnId(cell.column);
      },
      startEdit: (cell) => {
        setCurrent(cell, 'programmatic');
        startEdit(cell);
      },
      stopEdit: (options) =>
        options?.commit === false ? cancelEdit() : commitEdit('programmatic'),
      autofit: (columnId) => {
        for (const column of columnId ? [columnId] : resolved.map((entry) => entry.id))
          autofit(column);
      },
      getVisibleRows: () => (resolvedMode === 'client' ? result.rows : rows),
      selectAll: () => commitSelection(selectableKeys, 'programmatic', undefined),
      clearSelection: () => commitSelection([], 'programmatic', undefined),
      get element() {
        return root.current;
      },
    }),
    [
      setCurrent,
      scrollToRowKey,
      scrollToColumnId,
      startEdit,
      cancelEdit,
      commitEdit,
      resolved,
      autofit,
      resolvedMode,
      result.rows,
      rows,
      commitSelection,
      selectableKeys,
    ],
  );

  /* ── Root ───────────────────────────────────────────────────────────── */
  const attachRoot = useCallback(
    (node: HTMLDivElement | null) => {
      root.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const rangeSummary = useMemo(() => {
    if (!bounds) return null;
    return `${bounds.rowEnd - bounds.rowStart + 1} × ${bounds.columnEnd - bounds.columnStart + 1}`;
  }, [bounds]);

  const status: 'rows' | 'empty' | 'no-results' | 'error' | 'loading' = error
    ? 'error'
    : loading && rows.length === 0
      ? 'loading'
      : nodes.length > 0
        ? 'rows'
        : query.filter || query.search.trim()
          ? 'no-results'
          : 'empty';

  const internal = useMemo<DataGridInternal<Row>>(
    () => ({
      id,
      labels: resolvedLabels,
      locale: resolvedLocale,
      timeZone,
      columns,
      resolved,
      resolvedById,
      columnIds,
      mountedColumns,
      columnsWindowed: windowsColumns,
      query,
      nodes,
      total,
      selectionMode: resolvedSelection,
      editMode: resolvedEditMode,
      filterRow: resolvedFilterRow,
      activatable: resolvedActivatable,
      rowKeyOf,
      textOf,
      valueOf: cellValue,
      isEditable,
      anyEditable,
      isDisabled,
      isExpandable,
      current,
      focused,
      setCurrent,
      isSelected,
      selectedCount,
      toggleSelected,
      toggleAll,
      allState,
      selectableCount: selectableKeys.length,
      rangeBounds: bounds,
      rangeInfo,
      beginRange,
      extendRange,
      rangeDragging,
      isExpanded,
      toggleExpanded,
      toggleGroup,
      sortOf,
      pressSort,
      setSort,
      filterOf,
      setFilter,
      filterOpen,
      setFilterOpen,
      menuOpen,
      setMenuOpen,
      filterDebounce: resolvedDebounce,
      countsFor,
      pin,
      hide,
      resizeBy,
      resizeTo,
      autofit,
      moveColumn,
      resizing,
      setResizing,
      dragging: dragState.dragging,
      dropTarget: dragState.target,
      dropOffset: dragState.offset,
      attachDraggable,
      onManageColumns,
      edit,
      startEdit,
      setDraft,
      commitEdit,
      cancelEdit,
      activate,
      renderCellContent,
      renderEditorContent,
      renderHeaderContent: renderHeader,
      renderDetail,
      renderGroup,
      renderFilterOperand: renderFilterOperand as never,
      onCellPointerDown,
      onCellPointerEnter,
      onCellClick,
      onCellDoubleClick,
      onCellKeyDown,
      onCellFocus,
      onCellBlur,
      announce,
      detailId: (key: string) => `${id}detail-${key}`,
      rangeSummary,
    }),
    [
      id,
      resolvedLabels,
      resolvedLocale,
      timeZone,
      columns,
      resolved,
      resolvedById,
      columnIds,
      mountedColumns,
      windowsColumns,
      query,
      nodes,
      total,
      resolvedSelection,
      resolvedEditMode,
      resolvedFilterRow,
      resolvedActivatable,
      rowKeyOf,
      textOf,
      isEditable,
      anyEditable,
      isDisabled,
      isExpandable,
      current,
      focused,
      setCurrent,
      isSelected,
      selectedCount,
      toggleSelected,
      toggleAll,
      allState,
      selectableKeys.length,
      bounds,
      rangeInfo,
      beginRange,
      extendRange,
      rangeDragging,
      isExpanded,
      toggleExpanded,
      toggleGroup,
      sortOf,
      pressSort,
      setSort,
      filterOf,
      setFilter,
      filterOpen,
      menuOpen,
      resolvedDebounce,
      countsFor,
      pin,
      hide,
      resizeBy,
      resizeTo,
      autofit,
      moveColumn,
      resizing,
      dragState,
      attachDraggable,
      onManageColumns,
      edit,
      startEdit,
      setDraft,
      commitEdit,
      cancelEdit,
      activate,
      renderCellContent,
      renderEditorContent,
      renderHeader,
      renderDetail,
      renderGroup,
      renderFilterOperand,
      onCellPointerDown,
      onCellPointerEnter,
      onCellClick,
      onCellDoubleClick,
      onCellKeyDown,
      onCellFocus,
      onCellBlur,
      announce,
      rangeSummary,
    ],
  );

  const rootStyle = {
    ...style,
    '--slotted-data-grid-template': template,
    ...(height === undefined
      ? {}
      : { '--slotted-data-grid-block-size': typeof height === 'number' ? `${height}px` : height }),
  } as CSSProperties;
  const bodyStyle = windowsRows
    ? ({
        '--slotted-data-grid-window-total': `${rowWindow.totalSize}px`,
        '--slotted-data-grid-window-start': `${rowWindow.startOffset}px`,
      } as CSSProperties)
    : undefined;

  const rangeText = (() => {
    if (showRange === false || !query.page || nodes.length === 0) return null;
    const start = ('index' in query.page ? query.page.index * query.page.size : 0) + 1;
    const shown =
      resolvedMode === 'client' ? nodes.filter((node) => node.kind === 'row').length : rows.length;
    const last = start + shown - 1;
    return total === null || total < 0
      ? fill(resolvedLabels.rangeUnknown, { start, end: last })
      : fill(resolvedLabels.range, {
          start,
          end: last,
          total: total.toLocaleString(resolvedLocale),
        });
  })();

  const emptyContent = (() => {
    if (status === 'rows' || status === 'loading') return null;
    const kind = status;
    if (renderEmpty) return renderEmpty(kind);
    const title =
      kind === 'error'
        ? resolvedLabels.error
        : kind === 'no-results'
          ? resolvedLabels.noResults
          : resolvedLabels.empty;
    return (
      <ResultState reach="section" status={kind} tabIndex={-1}>
        <ResultStateTitle>{title}</ResultStateTitle>
        {kind === 'error' && error ? (
          <ResultStateDescription>{error}</ResultStateDescription>
        ) : null}
        {kind === 'no-results' || (kind === 'error' && onRetry) ? (
          <ResultStateActions>
            {kind === 'no-results' ? (
              <Button
                onClick={(event) => {
                  const move = withoutFilters(query);
                  requestQuery(move.query, 'clear', event, { change: move.change });
                }}
                size="sm"
                tone="secondary"
                variant="outline"
              >
                {resolvedLabels.clearFilters}
              </Button>
            ) : (
              <Button onClick={() => onRetry?.()} size="sm" tone="secondary" variant="outline">
                {resolvedLabels.retry}
              </Button>
            )}
          </ResultStateActions>
        ) : null}
      </ResultState>
    );
  })();

  return (
    <DataGridInternalContext.Provider value={internal as DataGridInternal<unknown>}>
      <div
        {...nativeProps}
        aria-busy={loading && rows.length > 0 ? true : undefined}
        aria-colcount={columnIds.length}
        aria-label={label ?? (labelledBy ? undefined : resolvedLabels.grid)}
        aria-labelledby={labelledBy}
        aria-multiselectable={
          resolvedSelection === 'multiple' || resolvedSelection === 'range' ? true : undefined
        }
        aria-rowcount={(total === null ? -1 : total) + headerRowCount + (hasSummary ? 1 : 0)}
        data-part="root"
        data-rows={autoRows ? 'auto' : 'fixed'}
        data-ui="data-grid"
        data-variant={resolvedVariant}
        onBlur={onRootBlur}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          drag.current?.handleKeydown(event.nativeEvent);
        }}
        ref={attachRoot}
        role="grid"
        style={rootStyle}
        {...(resolvedStriped ? { 'data-striped': '' } : {})}
        {...(resolvedSticky ? { 'data-sticky-header': '' } : {})}
        {...(resolvedFilterRow ? { 'data-filter-row': '' } : {})}
        {...(resolvedStickyTo === 'page' ? { 'data-sticky-to': 'page' } : {})}
      >
        <div data-part="scroll" ref={scroll}>
          <DataGridHead<Row> columnGroups={columnGroups} headerRowCount={headerRowCount} />
          {status === 'loading' ? (
            <DataGridLoader<Row> rows={resolvedSkeleton} />
          ) : (
            <DataGridBody<Row>
              bodyStyle={bodyStyle}
              empty={emptyContent}
              firstIndex={windowsRows ? rowWindow.startIndex : 0}
              headerRowCount={headerRowCount}
              measureRow={autoRows || measuredRow === null ? measureRow : undefined}
              nodes={mountedNodes}
              pinnedRows={pinnedRows}
              allNodes={nodes}
            />
          )}
          {hasSummary && status === 'rows' ? (
            <DataGridSummary<Row>
              aggregates={result.aggregates}
              rowIndex={headerRowCount + (total ?? nodes.length) + 1}
            />
          ) : null}
          {dragState.offset !== null ? (
            <div
              aria-hidden
              data-part="drop-indicator"
              style={
                { '--slotted-data-grid-drop-offset': `${dragState.offset}px` } as CSSProperties
              }
            />
          ) : null}
        </div>
        {footer !== undefined || rangeText !== null || (hasMore && onLoadMore) ? (
          <div data-part="footer">
            {rangeText !== null ? <span data-range="">{rangeText}</span> : null}
            {footer}
            {hasMore && onLoadMore && footer === undefined ? (
              <div>
                <Button
                  disabled={loading === true}
                  onClick={() => onLoadMore()}
                  size="sm"
                  tone="secondary"
                  variant="outline"
                >
                  {resolvedLabels.loadMore}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </DataGridInternalContext.Provider>
  );
}

function isBodyRow(row: string): boolean {
  return row !== HEADER_ROW && row !== FILTER_ROW && row !== SUMMARY_ROW && !isGroupCursorRow(row);
}

export { isBodyRow };
