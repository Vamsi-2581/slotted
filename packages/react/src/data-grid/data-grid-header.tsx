import {
  FILTER_ROW,
  HEADER_ROW,
  POPIN_COLUMN_ID,
  sameCell,
  type GridColumnGroup,
  type ResolvedGridColumn,
} from '@slotted/core/grid';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';

import { Checkbox } from '../checkbox';
import { Glyph, Icon } from '../icon';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '../menu';
import { Popover, PopoverBody, PopoverContent, PopoverLayer, PopoverTrigger } from '../popover';
import { Tooltip } from '../tooltip';
import { TooltipContent, TooltipLayer, TooltipTrigger } from '../tooltip/tooltip-parts';
import {
  cellStyle,
  columnAttributes,
  DRAG_COLUMN,
  EXPANDER_COLUMN,
  SELECTION_COLUMN,
} from './data-grid-constants';
import { useDataGridInternal } from './data-grid-context';
import { fill } from './data-grid-defaults';
import { DataGridFilterCell, DataGridFilterPanel } from './data-grid-filter';
import type { DataGridColumn } from './data-grid.types';

interface HeadProps {
  columnGroups: readonly GridColumnGroup[] | undefined;
  headerRowCount: number;
}

/** The room between the header and the menu it opens: one space step, so the surface does not sit on the header's rule. */
const MENU_OFFSET = 4;

export function DataGridHead<Row>({ columnGroups, headerRowCount }: HeadProps) {
  const grid = useDataGridInternal<Row>();
  const gutterCount = grid.columnIds.length - grid.resolved.length;
  const hasGroups = columnGroups !== undefined && columnGroups.length > 0;

  return (
    <div data-part="head" role="rowgroup">
      {hasGroups ? (
        <div aria-rowindex={1} data-part="header-row" role="row">
          {groupCells(grid.mountedColumns, columnGroups, gutterCount)}
        </div>
      ) : null}
      <div
        aria-rowindex={hasGroups ? 2 : 1}
        data-part="header-row"
        data-row={HEADER_ROW}
        role="row"
      >
        {grid.columnIds.includes(SELECTION_COLUMN) ? <SelectAllCell /> : null}
        {grid.columnIds.includes(DRAG_COLUMN) ? (
          <div
            aria-colindex={grid.columnIds.indexOf(DRAG_COLUMN) + 1}
            data-column={DRAG_COLUMN}
            data-part="column-header"
            role="columnheader"
            style={
              {
                '--slotted-data-grid-column': String(grid.columnIds.indexOf(DRAG_COLUMN) + 1),
              } as CSSProperties
            }
            tabIndex={-1}
          >
            <span />
          </div>
        ) : null}
        {grid.columnIds.includes(EXPANDER_COLUMN) ? (
          <div
            aria-colindex={grid.columnIds.indexOf(EXPANDER_COLUMN) + 1}
            data-column={EXPANDER_COLUMN}
            data-part="column-header"
            role="columnheader"
            style={
              {
                '--slotted-data-grid-column': String(grid.columnIds.indexOf(EXPANDER_COLUMN) + 1),
              } as CSSProperties
            }
            tabIndex={-1}
          >
            <span />
          </div>
        ) : null}
        {grid.mountedColumns.map((column) => (
          <ColumnHeader<Row> column={column} key={column.id} />
        ))}
        {grid.popinColumns.length > 0 ? (
          /* The pop-in's column, named for a reader and given no track. */
          <div
            aria-colindex={grid.popinIndex}
            data-column={POPIN_COLUMN_ID}
            data-part="popin-header"
            role="columnheader"
          >
            {grid.labels.popinHeader}
          </div>
        ) : null}
      </div>
      {grid.filterRow ? (
        <div aria-rowindex={headerRowCount} data-part="filter-row" data-row={FILTER_ROW} role="row">
          {grid.columnIds.includes(SELECTION_COLUMN) ? (
            <div
              aria-colindex={1}
              data-column={SELECTION_COLUMN}
              data-part="filter-cell"
              role="gridcell"
              tabIndex={-1}
            />
          ) : null}
          {grid.columnIds.includes(DRAG_COLUMN) ? (
            <div
              aria-colindex={grid.columnIds.indexOf(DRAG_COLUMN) + 1}
              data-column={DRAG_COLUMN}
              data-part="filter-cell"
              role="gridcell"
              tabIndex={-1}
            />
          ) : null}
          {grid.columnIds.includes(EXPANDER_COLUMN) ? (
            <div
              aria-colindex={grid.columnIds.indexOf(EXPANDER_COLUMN) + 1}
              data-column={EXPANDER_COLUMN}
              data-part="filter-cell"
              role="gridcell"
              tabIndex={-1}
            />
          ) : null}
          {grid.mountedColumns.map((column) => (
            <DataGridFilterCell<Row> column={column} key={column.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A row of group headings over the columns they span. A group spans its
 * columns wherever they are laid out, so the reader who moved one column of
 * a group past another sees the group re-drawn around what is left together;
 * a column no group names spans itself and shows nothing.
 */
function groupCells<Row>(
  columns: readonly ResolvedGridColumn<Row>[],
  groups: readonly GridColumnGroup[],
  offset: number,
): ReactNode[] {
  const cells: ReactNode[] = [];
  let index = 0;
  while (index < columns.length) {
    const column = columns[index]!;
    const group = groups.find((entry) => entry.columns.includes(column.id));
    let span = 1;
    if (group) {
      while (index + span < columns.length && group.columns.includes(columns[index + span]!.id))
        span += 1;
    }
    const first = column.index + offset;
    const style: Record<string, string> = {
      '--slotted-data-grid-column': `${first} / ${first + span}`,
    };
    if (column.pinned) style['--slotted-data-grid-pin-offset'] = `${column.pinOffset}px`;
    cells.push(
      <div
        aria-colindex={first}
        aria-colspan={span}
        data-part="column-group"
        key={group ? `${group.id}:${column.id}` : column.id}
        role="columnheader"
        style={style as CSSProperties}
        tabIndex={-1}
        {...(column.pinned ? { 'data-pinned': column.pinned } : {})}
      >
        <span>{group?.label ?? ''}</span>
      </div>,
    );
    index += span;
  }
  return cells;
}

function SelectAllCell() {
  const grid = useDataGridInternal();
  const cell = { row: HEADER_ROW, column: SELECTION_COLUMN };
  const current =
    grid.current !== null &&
    grid.current.row === HEADER_ROW &&
    grid.current.column === SELECTION_COLUMN;
  const name = fill(
    grid.total !== null && grid.total > grid.selectableCount
      ? grid.labels.selectAllPage
      : grid.labels.selectAllFiltered,
    {
      count: grid.selectableCount,
    },
  );
  return (
    <div
      aria-colindex={1}
      data-column={SELECTION_COLUMN}
      data-part="selection"
      role="gridcell"
      style={{ '--slotted-data-grid-column': '1' } as CSSProperties}
      tabIndex={current || sameCell(cell, grid.tabStop) ? 0 : -1}
      onFocus={() => grid.onCellFocus(cell)}
      onKeyDown={(event) => grid.onCellKeyDown(event, cell)}
      onPointerDown={(event) => grid.onCellPointerDown(event, cell)}
      {...(current ? { 'data-current': '' } : {})}
    >
      {grid.selectionMode === 'multiple' ? (
        <Checkbox
          aria-label={name}
          checked={grid.allState === 'all'}
          indeterminate={grid.allState === 'some'}
          onCheckedChange={(_checked, request) => grid.toggleAll(request.source)}
          tabIndex={current ? 0 : -1}
        />
      ) : null}
    </div>
  );
}

function ColumnHeader<Row>({ column }: { column: ResolvedGridColumn<Row> }) {
  const grid = useDataGridInternal<Row>();
  const cell = { row: HEADER_ROW, column: column.id };
  const index = grid.columnIds.indexOf(column.id) + 1;
  const current =
    grid.current !== null && grid.current.row === HEADER_ROW && grid.current.column === column.id;
  const sort = grid.sortOf(column.id);
  const filter = grid.filterOf(column.id);
  const filtered = filter !== null;
  const multiSort = grid.query.sort.length > 1;
  const menuOpen = grid.menuOpen === column.id;
  const attachDraggable = grid.attachDraggable;
  /* One ref for the node's life. A ref callback written inline is a new
     function every render, and React answers a new ref by calling the old one
     with null and the new one with the node: the header was detached from the
     drag controller and re-attached on every render — including the render
     the press itself caused, which threw the press away before it could
     travel. Read live: no header could be dragged with a pointer. */
  const anchorRef = useRef<(node: HTMLElement | null) => void>(() => undefined);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const setNode = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
    anchorRef.current(node);
  }, []);
  useEffect(() => {
    attachDraggable(nodeRef.current, column.id);
    return () => attachDraggable(null, column.id);
  }, [attachDraggable, column.id]);

  const description = column.column.description;
  const descriptionId = `${grid.id}-description-${column.id}`;
  const help = (column.column as DataGridColumn<Row>).help;

  const content = grid.renderHeaderContent
    ? grid.renderHeaderContent({
        column: column.column,
        resolved: column,
        sorted: sort?.direction ?? null,
        sortIndex: sort?.index ?? null,
        filtered,
      })
    : column.column.label;

  return (
    <DataGridFilterPanel<Row> column={column}>
      {(anchor) => {
        anchorRef.current = anchor;
        return (
          <div
            {...columnAttributes(column)}
            aria-colindex={index}
            aria-describedby={description ? descriptionId : undefined}
            aria-sort={sort && sort.index === 1 ? sort.direction : undefined}
            data-part="column-header"
            role="columnheader"
            style={cellStyle(column, index)}
            tabIndex={current || sameCell(cell, grid.tabStop) ? 0 : -1}
            onClick={(event) => grid.onCellClick(event, cell)}
            onContextMenu={(event) => grid.onHeaderContextMenu(event, column.id)}
            onFocus={(event) => {
              if (event.target === event.currentTarget) grid.onCellFocus(cell);
            }}
            onKeyDown={(event) => grid.onCellKeyDown(event, cell)}
            onPointerDown={(event) => grid.onCellPointerDown(event, cell)}
            ref={setNode}
            {...(column.sortable ? { 'data-sortable': '' } : {})}
            {...(sort ? { 'data-sorted': sort.direction } : {})}
            {...(filtered ? { 'data-filtered': '' } : {})}
            {...(current ? { 'data-current': '' } : {})}
            {...(grid.dragging === column.id ? { 'data-dragging': '' } : {})}
            {...(grid.dropTarget === column.id ? { 'data-drop-target': '' } : {})}
            {...(grid.resizing === column.id ? { 'data-resizing': '' } : {})}
          >
            <ColumnName label={column.column.label}>{content}</ColumnName>
            {sort ? (
              <span
                aria-hidden
                data-part="sort"
                {...(multiSort ? { 'data-index': String(sort.index) } : {})}
              >
                {/* The stylesheet turns the chevron over for ascending; the
                    index of a key past the first is its own text before it. */}
                <Icon>
                  <Glyph name="chevron-down" />
                </Icon>
              </span>
            ) : null}
            {description ? (
              <span aria-hidden="true" data-part="column-description" id={descriptionId}>
                {description}
              </span>
            ) : null}
            <span data-part="column-actions">
              {description || help !== undefined ? (
                <ColumnHelp<Row> column={column} description={description} help={help} />
              ) : null}
              {column.filterable ? (
                <FilterTrigger<Row> column={column} filtered={filtered} />
              ) : null}
              <ColumnMenu<Row>
                column={column}
                descriptionId={description ? descriptionId : undefined}
                open={menuOpen}
              />
            </span>
            {column.resizable ? <Resizer<Row> column={column} /> : null}
          </div>
        );
      }}
    </DataGridFilterPanel>
  );
}

/**
 * The column's name, and the hint it opens when the column is too narrow to
 * show it.
 *
 * Every column name here truncates, and a name cut to `Op…` is unreadable
 * until something says the words: the header's accessible name already carries
 * them, so the reader hears the whole of it and only the eye is short. The
 * hint fills that gap and nothing else — `describes="none"`, because a
 * reference to words the header already states has the reader hear them twice.
 *
 * A name that fits opens nothing, which is the difference between this and a
 * `title` on every header.
 */
function ColumnName({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Tooltip describes="none" openOn="hover" side="bottom" whenClipped>
      <TooltipTrigger render={(hint) => <span {...hint} />}>{children}</TooltipTrigger>
      <TooltipLayer>
        <TooltipContent>{label}</TooltipContent>
      </TooltipLayer>
    </Tooltip>
  );
}

/**
 * What the column is, on a press: the description and the consumer's help, in
 * a popover opened by click, Enter and Space, never by hover. The button is
 * always shown, because a coarse pointer has no hover to reveal it.
 */
function ColumnHelp<Row>({
  column,
  description,
  help,
}: {
  column: ResolvedGridColumn<Row>;
  description: string | undefined;
  help: ReactNode;
}) {
  const grid = useDataGridInternal<Row>();
  const name = fill(grid.labels.columnHelp, { column: column.column.label });
  return (
    <Popover align="start" side="bottom" size="sm">
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            aria-label={name}
            data-part="column-help"
            onClick={(event) => {
              event.stopPropagation();
              props.onClick?.(event as never);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            tabIndex={-1}
            type="button"
          >
            <Icon>
              <Glyph name="circle-question" />
            </Icon>
          </button>
        )}
      />
      <PopoverLayer>
        <PopoverContent aria-label={name}>
          <PopoverBody>
            {description ? <div>{description}</div> : null}
            {help}
          </PopoverBody>
        </PopoverContent>
      </PopoverLayer>
    </Popover>
  );
}

function FilterTrigger<Row>({
  column,
  filtered,
}: {
  column: ResolvedGridColumn<Row>;
  filtered: boolean;
}) {
  const grid = useDataGridInternal<Row>();
  const open = grid.filterOpen === column.id;
  if (!filtered && !open) return null;
  return (
    <button
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={`${grid.labels.filter} ${column.column.label}`}
      data-part="filter"
      onClick={(event) => {
        event.stopPropagation();
        grid.setFilterOpen(open ? null : column.id);
      }}
      onPointerDown={(event) => event.stopPropagation()}
      tabIndex={-1}
      type="button"
      {...(filtered ? { 'data-filtered': '' } : {})}
      {...(open ? { 'data-open': '' } : {})}
    >
      <Icon>
        <Glyph name="funnel" />
      </Icon>
    </button>
  );
}

/**
 * The column's own menu: sort, filter, pin, hide, fit, manage. Opened by its
 * trigger or by `Ctrl+Enter` on the header, under the trigger; by a context
 * menu on the header, at the press or on the header cell, focus returning to
 * the header. Its trigger is revealed by the pointer and by the cursor, and
 * keeps its room always.
 */
function ColumnMenu<Row>({
  column,
  descriptionId,
  open,
}: {
  column: ResolvedGridColumn<Row>;
  descriptionId: string | undefined;
  open: boolean;
}) {
  const grid = useDataGridInternal<Row>();
  const labels = grid.labels;
  const sort = grid.sortOf(column.id);
  const name = column.column.label;
  const anchored = grid.menuAnchor !== null && grid.menuAnchor.column === column.id;

  return (
    <Menu
      anchor={anchored ? grid.menuAnchor!.anchor : null}
      finalFocus={anchored ? grid.menuAnchor!.returnTo : undefined}
      onOpenChange={(next) => grid.setMenuOpen(next ? column.id : null)}
      open={open}
      sideOffset={MENU_OFFSET}
      size="sm"
    >
      <MenuTrigger
        render={(props) => (
          <button
            {...props}
            aria-label={`${labels.columnMenu}, ${name}`}
            data-part="column-menu"
            onPointerDown={(event) => {
              event.stopPropagation();
              props.onPointerDown?.(event as never);
            }}
            onClick={(event) => {
              event.stopPropagation();
              grid.anchorToButton();
              props.onClick?.(event as never);
            }}
            tabIndex={-1}
            type="button"
            {...(open ? { 'data-open': '' } : {})}
          >
            <Icon>
              <Glyph name="ellipsis" />
            </Icon>
          </button>
        )}
      />
      <MenuContent aria-describedby={descriptionId}>
        {column.column.description ? (
          <div aria-hidden data-part="column-menu-description">
            {column.column.description}
          </div>
        ) : null}
        {column.sortable ? (
          <>
            <MenuItem
              disabled={
                sort?.direction === 'ascending' && sort.index === 1 && grid.query.sort.length === 1
              }
              onSelect={(event) => grid.setSort(column.id, 'ascending', event)}
            >
              {labels.sortAscendingAction}
            </MenuItem>
            <MenuItem
              disabled={
                sort?.direction === 'descending' && sort.index === 1 && grid.query.sort.length === 1
              }
              onSelect={(event) => grid.setSort(column.id, 'descending', event)}
            >
              {labels.sortDescendingAction}
            </MenuItem>
            <MenuItem
              disabled={sort === null}
              onSelect={(event) => grid.setSort(column.id, null, event)}
            >
              {labels.sortClearAction}
            </MenuItem>
            <MenuSeparator />
          </>
        ) : null}
        {column.filterable ? (
          <MenuItem onSelect={() => grid.setFilterOpen(column.id)}>{`${labels.filter}…`}</MenuItem>
        ) : null}
        <MenuItem
          disabled={column.pinned === 'start'}
          onSelect={(event) => grid.pin(column.id, 'start', event)}
        >
          {labels.pinStart}
        </MenuItem>
        <MenuItem
          disabled={column.pinned === 'end'}
          onSelect={(event) => grid.pin(column.id, 'end', event)}
        >
          {labels.pinEnd}
        </MenuItem>
        {column.pinned ? (
          <MenuItem onSelect={(event) => grid.pin(column.id, null, event)}>{labels.unpin}</MenuItem>
        ) : null}
        <MenuSeparator />
        {column.resizable ? (
          <>
            <MenuItem onSelect={(event) => grid.autofit(column.id, event.reason, event)}>
              {labels.autofit}
            </MenuItem>
            <MenuItem onSelect={(event) => grid.autofit(null, event.reason, event)}>
              {labels.autofitAll}
            </MenuItem>
          </>
        ) : null}
        {column.hideable ? (
          <MenuItem onSelect={(event) => grid.hide(column.id, event, event.reason)}>
            {labels.hide}
          </MenuItem>
        ) : null}
        {grid.onManageColumns ? (
          <MenuItem
            onSelect={() => grid.onManageColumns?.()}
          >{`${labels.manageColumns}…`}</MenuItem>
        ) : null}
      </MenuContent>
    </Menu>
  );
}

/**
 * The pointer's handle. `aria-hidden` and no tab stop: the keyboard resizes
 * from the header cell, and a focusable handle inside a composite widget
 * would be a second tab stop. Escape during a drag restores the width the
 * drag started from; a double press fits the column to its content, and with
 * Shift every resizable column.
 */
function Resizer<Row>({ column }: { column: ResolvedGridColumn<Row> }) {
  const grid = useDataGridInternal<Row>();
  const [session, setSession] = useState<{
    startX: number;
    startWidth: number;
    rtl: boolean;
  } | null>(null);
  const latest = useRef(session);
  latest.current = session;

  useEffect(() => {
    if (!session) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      grid.resizeTo(column.id, session.startWidth, 'pointer');
      setSession(null);
      grid.setResizing(null);
    };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, [session, grid, column.id]);

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    /* The header's own box and not the column's stated width: a flex column
       is as wide as the room left over, and a drag that started from the
       stated width jumped to it on the first move. */
    const header = event.currentTarget.closest('[data-part="column-header"]');
    setSession({
      startX: event.clientX,
      startWidth: header ? Math.round(header.getBoundingClientRect().width) : column.width,
      rtl,
    });
    grid.setResizing(column.id);
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = latest.current;
    if (!state) return;
    const delta = (event.clientX - state.startX) * (state.rtl ? -1 : 1);
    grid.resizeTo(column.id, state.startWidth + delta, 'pointer', event);
  };
  const up = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!latest.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setSession(null);
    grid.setResizing(null);
  };

  return (
    <div
      aria-hidden
      data-part="resizer"
      /* A press on the handle is a resize, never the header's sort: the
         click the browser fires after the pointer is released stops here. */
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.stopPropagation();
        grid.autofit(event.shiftKey ? null : column.id, 'pointer', event);
      }}
      onPointerCancel={up}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      title={grid.labels.resize}
      {...(session ? { 'data-resizing': '' } : {})}
    />
  );
}
