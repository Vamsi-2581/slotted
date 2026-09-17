import type { FilterDescriptor } from '@slotted/core/filter';
import type {
  GridCell,
  GridColumn,
  GridNode,
  GridQuery,
  RangeBounds,
  ResolvedGridColumn,
  SortDirection,
} from '@slotted/core/grid';
import { createContext, useContext } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';

import type {
  DataGridCellContext,
  DataGridEditMode,
  DataGridEditorContext,
  DataGridGroupContext,
  DataGridHeaderContext,
  DataGridReason,
  DataGridResolvedLabels,
  DataGridSelectionMode,
} from './data-grid.types';

/** The editing session, as the body reads it. */
export interface EditSession {
  readonly cell: GridCell;
  /** Every cell of the row in row mode, the one cell in cell mode. */
  readonly columns: readonly string[];
  readonly drafts: Readonly<Record<string, unknown>>;
  /** The values when the session opened, to say what changed and to detect a conflict. */
  readonly originals: Readonly<Record<string, unknown>>;
  readonly status: 'editing' | 'pending' | 'invalid';
  readonly messages: Readonly<Record<string, string>>;
  /** The key that opened the editor, typed into it as its first character. */
  readonly seed: string | null;
}

/**
 * Everything a part needs from the root. One object, one context: the parts
 * are private to the family and re-render with the grid.
 */
export interface DataGridInternal<Row> {
  readonly id: string;
  readonly labels: DataGridResolvedLabels;
  readonly locale: string | undefined;
  readonly timeZone: string | undefined;
  readonly columns: readonly GridColumn<Row>[];
  readonly resolved: readonly ResolvedGridColumn<Row>[];
  readonly resolvedById: ReadonlyMap<string, ResolvedGridColumn<Row>>;
  /** The visible columns' ids, the cursor's column axis. */
  readonly columnIds: readonly string[];
  /** The ids mounted in the DOM: the pinned ones and the window over the middle. */
  readonly mountedColumns: readonly ResolvedGridColumn<Row>[];
  readonly columnsWindowed: boolean;
  readonly query: GridQuery;
  readonly nodes: readonly GridNode<Row>[];
  readonly total: number | null;
  readonly selectionMode: DataGridSelectionMode;
  readonly editMode: DataGridEditMode;
  readonly filterRow: boolean;
  readonly activatable: boolean;
  readonly rowKeyOf: (row: Row) => string;
  readonly textOf: (column: GridColumn<Row>, row: Row) => string;
  readonly valueOf: (column: GridColumn<Row>, row: Row) => unknown;
  readonly isEditable: (column: GridColumn<Row>, row: Row) => boolean;
  readonly anyEditable: boolean;
  readonly isDisabled: (key: string) => boolean;
  readonly isExpandable: (row: Row) => boolean;

  /* cursor */
  readonly current: GridCell | null;
  readonly focused: boolean;
  readonly setCurrent: (cell: GridCell, reason: DataGridReason, source?: unknown) => void;

  /* selection */
  readonly isSelected: (key: string) => boolean;
  readonly selectedCount: number;
  readonly toggleSelected: (
    key: string,
    options: { range?: boolean; source?: unknown; reason?: DataGridReason },
  ) => void;
  readonly toggleAll: (source?: unknown) => void;
  readonly allState: 'none' | 'some' | 'all';
  readonly selectableCount: number;
  readonly rangeBounds: RangeBounds | null;
  readonly rangeInfo: (cell: GridCell) => { inside: boolean; edges: readonly string[] };
  readonly beginRange: (cell: GridCell, extend: boolean, source: unknown) => void;
  readonly extendRange: (cell: GridCell, source: unknown) => void;
  readonly rangeDragging: boolean;

  /* expansion */
  readonly isExpanded: (key: string) => boolean;
  readonly toggleExpanded: (key: string, source?: unknown, reason?: DataGridReason) => void;
  readonly toggleGroup: (key: string, source?: unknown, reason?: DataGridReason) => void;

  /* sorting and filtering */
  readonly sortOf: (id: string) => { direction: SortDirection; index: number } | null;
  readonly pressSort: (
    id: string,
    append: boolean,
    source?: unknown,
    reason?: DataGridReason,
  ) => void;
  readonly setSort: (id: string, direction: SortDirection | null, source?: unknown) => void;
  readonly filterOf: (id: string) => FilterDescriptor | null;
  readonly setFilter: (
    id: string,
    filter: FilterDescriptor | null,
    reason: DataGridReason,
    source?: unknown,
  ) => void;
  readonly filterOpen: string | null;
  readonly setFilterOpen: (id: string | null) => void;
  readonly menuOpen: string | null;
  readonly setMenuOpen: (id: string | null) => void;
  readonly filterDebounce: number;
  /** Counts of a set column's values over the rows every other rule kept. */
  readonly countsFor: (id: string) => ReadonlyMap<string, number>;

  /* columns */
  readonly pin: (id: string, zone: 'start' | 'end' | null, source?: unknown) => void;
  readonly hide: (id: string, source?: unknown) => void;
  readonly resizeBy: (id: string, delta: number, source?: unknown) => void;
  readonly resizeTo: (id: string, width: number, reason: DataGridReason, source?: unknown) => void;
  readonly autofit: (id: string, source?: unknown) => void;
  readonly moveColumn: (id: string, direction: -1 | 1, source?: unknown) => void;
  readonly resizing: string | null;
  readonly setResizing: (id: string | null) => void;
  readonly dragging: string | null;
  readonly dropTarget: string | null;
  readonly dropOffset: number | null;
  readonly attachDraggable: (element: HTMLElement | null, id: string) => void;
  readonly onManageColumns: (() => void) | undefined;

  /* editing */
  readonly edit: EditSession | null;
  readonly startEdit: (cell: GridCell, seed?: string | null) => void;
  readonly setDraft: (column: string, draft: unknown) => void;
  readonly commitEdit: (
    reason: 'keyboard' | 'pointer' | 'blur' | 'programmatic',
    options?: { move?: 'down' | 'next' | 'previous' | 'stay' },
  ) => void;
  readonly cancelEdit: () => void;
  readonly activate: (key: string, reason: 'pointer' | 'keyboard', event: unknown) => void;

  /* rendering */
  readonly renderCellContent: (context: DataGridCellContext<Row>) => ReactNode;
  readonly renderEditorContent: (context: DataGridEditorContext<Row>) => ReactNode;
  readonly renderHeaderContent: ((context: DataGridHeaderContext<Row>) => ReactNode) | undefined;
  readonly renderDetail: ((row: Row, key: string) => ReactNode) | undefined;
  readonly renderGroup: ((context: DataGridGroupContext<Row>) => ReactNode) | undefined;
  readonly renderFilterOperand:
    | ((context: {
        column: string;
        operator: string;
        value: unknown;
        setValue: (value: unknown) => void;
        apply: () => void;
        label: string;
      }) => ReactNode)
    | undefined;

  /* events composed on cells */
  readonly onCellPointerDown: (event: PointerEvent<HTMLElement>, cell: GridCell) => void;
  readonly onCellPointerEnter: (event: PointerEvent<HTMLElement>, cell: GridCell) => void;
  readonly onCellClick: (event: MouseEvent<HTMLElement>, cell: GridCell) => void;
  readonly onCellDoubleClick: (event: MouseEvent<HTMLElement>, cell: GridCell) => void;
  readonly onCellKeyDown: (event: KeyboardEvent<HTMLElement>, cell: GridCell) => void;
  readonly onCellFocus: (cell: GridCell) => void;
  readonly onCellBlur: (cell: GridCell) => void;

  readonly announce: (message: string) => void;
  readonly detailId: (key: string) => string;
  readonly rangeSummary: string | null;
}

export const DataGridInternalContext = createContext<DataGridInternal<unknown> | undefined>(
  undefined,
);

export function useDataGridInternal<Row = unknown>(): DataGridInternal<Row> {
  const context = useContext(DataGridInternalContext);
  if (context === undefined)
    throw new Error('Every DataGrid part must be rendered inside DataGrid.');
  return context as DataGridInternal<Row>;
}
