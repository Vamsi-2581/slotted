import {
  createContext,
  useContext,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';

import { Checkbox } from '../checkbox';
import { Glyph, Icon } from '../icon';
import { Skeleton } from '../skeleton';
import { Tooltip } from '../tooltip';
import { TooltipContent, TooltipLayer, TooltipTrigger } from '../tooltip/tooltip-parts';
import { useTable } from './table';
import type {
  TableBodyProps,
  TableCaptionProps,
  TableCellAxes,
  TableCellProps,
  TableColumnActionsProps,
  TableColumnHeaderProps,
  TableDetailProps,
  TableEmptyProps,
  TableExpanderProps,
  TableFooterProps,
  TableHeadProps,
  TableLoaderProps,
  TableRowContextValue,
  TableRowHeaderProps,
  TableRowProps,
  TableSelectAllProps,
  TableSelectProps,
  TableSortProps,
  TableSummaryProps,
} from './table.types';

const TableRowContext = createContext<TableRowContextValue | undefined>(undefined);
const TableColumnContext = createContext<string | undefined>(undefined);

/** Which column this part is inside, for the parts that name one. */
export function useTableColumn(): string | undefined {
  return useContext(TableColumnContext);
}

/** What the row around this part is, for the parts that belong to one. */
export function useTableRow(): TableRowContextValue {
  const context = useContext(TableRowContext);
  if (context === undefined) {
    throw new Error('TableSelect, TableExpander and TableRowHeader belong inside TableRow.');
  }
  return context;
}

/**
 * The four axes every cell answers, written once. `numeric` and `align` are two
 * facts rather than one axis: a number is set in tabular figures whichever way
 * it is aligned, and a right-aligned label is not a number.
 */
function cellAttributes(
  { align, blockAlign, numeric, sticky, stickyOffset, text }: TableCellAxes,
  style?: CSSProperties | undefined,
) {
  return {
    ...(align === undefined ? {} : { 'data-align': align }),
    ...(blockAlign === undefined ? {} : { 'data-block-align': blockAlign }),
    ...(numeric === true ? { 'data-numeric': '' } : {}),
    ...(sticky === undefined ? {} : { 'data-sticky': sticky }),
    ...(text === undefined ? {} : { 'data-text': text }),
    /* The offset joins the consumer's own style rather than replacing it: a
       pinned cell is still a cell somebody may have given a width. */
    ...(stickyOffset === undefined && style === undefined
      ? {}
      : {
          style: {
            ...style,
            ...(stickyOffset === undefined ? {} : { '--slotted-table-sticky-inset': stickyOffset }),
          } as CSSProperties,
        }),
  };
}

/**
 * The table's name, and the element the platform already associates with it. A
 * `caption` is the accessible name whether it is read or hidden, so a consumer
 * who hides it with `visually-hidden` loses the picture and keeps the name —
 * and the family writes no `aria-labelledby` restating what the browser states.
 */
export function TableCaption({ ref, ...props }: TableCaptionProps) {
  return <caption {...props} data-part="caption" ref={ref} />;
}

export function TableHead({ ref, ...props }: TableHeadProps) {
  return <thead {...props} data-part="head" ref={ref} />;
}

export function TableBody({ ref, ...props }: TableBodyProps) {
  return <tbody {...props} data-part="body" ref={ref} />;
}

/**
 * The `tfoot`, which the HTML Standard calls the column summaries of the table:
 * a total, a count, a unit. It is not the `TableFooter`, which is the bar
 * outside the table holding the consumer's own controls.
 */
export function TableSummary({ ref, ...props }: TableSummaryProps) {
  return <tfoot {...props} data-part="summary" ref={ref} />;
}

/**
 * The bar under the table and inside its frame, where a paged listing puts its
 * control. It is a sibling of the scroller rather than a child, so a table
 * scrolled sideways does not take its pagination with it.
 */
export function TableFooter({ ref, ...props }: TableFooterProps) {
  return <div {...props} data-part="footer" ref={ref} />;
}

/**
 * One record. It carries `data-selected` and `data-expanded` for the stylesheet
 * and `data-value` for the range and the select-all, which read the rows out of
 * the DOM at the moment they act.
 *
 * A row is not selectable under the `table` role, so it carries no
 * `aria-selected`: the state is painted here and announced by the checkbox that
 * owns it.
 */
export function TableRow({
  children,
  disabled,
  ref,
  render,
  rowIndex,
  value,
  ...nativeProps
}: TableRowProps) {
  const table = useTable();
  const selected = value !== undefined && table.isSelected(value);
  const expanded = value !== undefined && table.isExpanded(value);

  const rowProps = {
    ...nativeProps,
    children,
    ...(disabled === true ? { 'data-disabled': '' } : {}),
    ...(expanded ? { 'data-expanded': '' } : {}),
    'data-part': 'row',
    ...(selected ? { 'data-selected': '' } : {}),
    ...(value === undefined ? {} : { 'data-value': value }),
    ...(rowIndex === undefined ? {} : { 'aria-rowindex': rowIndex }),
  };

  const context: TableRowContextValue = {
    detailId: `${table.id}detail${value ?? ''}`,
    disabled: disabled === true,
    expanded,
    selected,
    value,
  };

  return (
    <TableRowContext.Provider value={context}>
      {render === undefined ? <tr {...rowProps} ref={ref} /> : render(rowProps)}
    </TableRowContext.Provider>
  );
}

/** Two refs on one element: the family's, and whatever the consumer passed. */
function attach<T>(node: T, ...refs: (Ref<T> | undefined)[]) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node);
    else if (ref !== null && ref !== undefined) ref.current = node;
  }
}

/**
 * The words the header itself holds, read when the layer mounts to show them
 * rather than kept in state beside them: the layer is built on opening, so the
 * reading is of the header as it is at that moment.
 */
function HeaderHint({ header }: { header: RefObject<HTMLElement | null> }) {
  return <>{(header.current?.textContent ?? '').trim()}</>;
}

/**
 * A column's name. `scope="col"` is what makes a screen reader repeat it for
 * every cell under it, and `aria-sort` is written here and on no other header.
 *
 * A name cut by its own box — `text="truncate"` on a column with no room —
 * reads `Op…` to the eye while the whole of it is still what a screen reader
 * repeats under every cell. The hint closes that gap: it opens only while the
 * name is measured as cut, which a header that wraps or fits never is, and it
 * is shown rather than read — `describes="none"`, because the header already
 * states the words.
 */
export function TableColumnHeader({
  align,
  blockAlign,
  children,
  column,
  numeric,
  ref,
  scope,
  sticky,
  stickyOffset,
  style,
  text,
  ...nativeProps
}: TableColumnHeaderProps) {
  const table = useTable();
  const node = useRef<HTMLElement | null>(null);
  const sorted = column !== undefined && table.sort?.column === column;

  const headerProps = {
    ...nativeProps,
    ...cellAttributes({ align, blockAlign, numeric, sticky, stickyOffset, text }, style),
    ...(sorted ? { 'aria-sort': table.sort?.direction } : {}),
    children,
    'data-part': 'column-header',
    scope: scope ?? 'col',
  };

  return (
    <TableColumnContext.Provider value={column}>
      <Tooltip describes="none" openOn="hover" side="bottom" whenClipped>
        <TooltipTrigger
          {...(headerProps as object)}
          render={(hint) => (
            <th
              {...(hint as object)}
              ref={(element: HTMLElement | null) => {
                hint.ref?.(element);
                node.current = element;
                attach(element, ref);
              }}
            />
          )}
        />
        <TooltipLayer>
          <TooltipContent>
            <HeaderHint header={node} />
          </TooltipContent>
        </TooltipLayer>
      </Tooltip>
    </TableColumnContext.Provider>
  );
}

/**
 * The cell that identifies the record, which a screen reader repeats in each of
 * the cells beside it. It states no colour of its own, so a selected record's
 * name turns with the row and a disabled one dims with it.
 */
export function TableRowHeader({
  align,
  blockAlign,
  numeric,
  ref,
  scope,
  sticky,
  stickyOffset,
  style,
  text,
  ...nativeProps
}: TableRowHeaderProps) {
  return (
    <th
      {...nativeProps}
      {...cellAttributes({ align, blockAlign, numeric, sticky, stickyOffset, text }, style)}
      data-part="row-header"
      ref={ref}
      scope={scope ?? 'row'}
    />
  );
}

export function TableCell({
  align,
  blockAlign,
  numeric,
  ref,
  sticky,
  stickyOffset,
  style,
  text,
  ...nativeProps
}: TableCellProps) {
  return (
    <td
      {...nativeProps}
      {...cellAttributes({ align, blockAlign, numeric, sticky, stickyOffset, text }, style)}
      data-part="cell"
      ref={ref}
    />
  );
}

/**
 * The column's name wrapped in a button, which is what the APG's own sortable
 * example does. The cycle is ascending, descending, then none — the third state
 * a reader who sorted by accident needs.
 *
 * The consumer's own `onClick` runs first and is composed rather than replaced:
 * a handler that prevents the default keeps the sort from moving.
 */
export function TableSort({
  children,
  column,
  onClick,
  ref,
  render,
  ...nativeProps
}: TableSortProps) {
  const table = useTable();
  const inherited = useContext(TableColumnContext);
  const key = column ?? inherited;

  function press(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || key === undefined) return;
    table.requestSort(key, event);
  }

  const sortProps = {
    ...nativeProps,
    /* The direction mark follows the name: one chevron the stylesheet turns
       over for ascending and shows, muted, under the pointer on an unsorted
       column. */
    children: (
      <>
        {children}
        <Icon>
          <Glyph name="chevron-down" />
        </Icon>
      </>
    ),
    'data-part': 'sort',
    onClick: press,
    type: 'button' as const,
  };

  return render === undefined ? <button {...sortProps} ref={ref} /> : render(sortProps);
}

/**
 * The slot beside a column's name for the controls it carries: a filter
 * trigger, a column menu, a help hint. The family holds the place and the
 * geometry; what a filter means is the consumer's query.
 */
export function TableColumnActions({ ref, ...props }: TableColumnActionsProps) {
  return <span {...props} data-part="column-actions" ref={ref} />;
}

/**
 * A row's own checkbox, in the cell the family lays out. The control is
 * `checkbox`'s: the cell is this family's and the chooser is not, which is the
 * division `list-item` recorded.
 *
 * `Shift` while pressing selects every row from the anchor to this one, by
 * pointer and with `Space` alike — the gesture a file list, a mail client and
 * React Aria's own table all use.
 */
export function TableSelect({
  align,
  blockAlign,
  numeric,
  ref,
  sticky,
  stickyOffset,
  style,
  text,
  value,
  ...nativeProps
}: TableSelectProps) {
  const table = useTable();
  const row = useTableRow();
  const key = value ?? row.value;

  return (
    <td
      {...nativeProps}
      {...cellAttributes({ align, blockAlign, numeric, sticky, stickyOffset, text }, style)}
      data-part="selection"
      ref={ref}
    >
      <Checkbox
        aria-label={table.t('selectRow', { row: key ?? '' }).trim()}
        checked={key !== undefined && table.isSelected(key)}
        disabled={row.disabled}
        onCheckedChange={(_checked, request) => {
          if (key === undefined) return;
          const source = request.source as { shiftKey?: boolean } | undefined;
          table.toggleSelected(key, { range: source?.shiftKey === true, source: request.source });
        }}
      />
    </td>
  );
}

/**
 * The header's checkbox. It covers the rows in the DOM, is indeterminate while
 * some of them are selected, and states the count it covers in its own name — a
 * selection over a whole result set is a decision only the consumer's query can
 * make.
 */
export function TableSelectAll({
  align,
  blockAlign,
  numeric,
  ref,
  sticky,
  stickyOffset,
  style,
  text,
  ...nativeProps
}: TableSelectAllProps) {
  const table = useTable();
  const selected = table.value.length;

  return (
    <th
      {...nativeProps}
      {...cellAttributes({ align, blockAlign, numeric, sticky, stickyOffset, text }, style)}
      data-part="selection"
      ref={ref}
      scope="col"
    >
      <Checkbox
        aria-label={table.t('selectAll', { count: selected })}
        checked={selected > 0 && selected === table.rows().length}
        indeterminate={selected > 0 && selected < table.rows().length}
        onCheckedChange={(_checked, request) => table.toggleSelectAll(request.source)}
      />
    </th>
  );
}

/**
 * The Disclosure pattern, borrowed whole: a `button` carrying `aria-expanded`
 * and naming the row it opens.
 */
export function TableExpander({ onClick, ref, value, ...nativeProps }: TableExpanderProps) {
  const table = useTable();
  const row = useTableRow();
  const key = value ?? row.value;
  const open = key !== undefined && table.isExpanded(key);

  function press(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || key === undefined) return;
    table.toggleExpanded(key, event);
  }

  return (
    <button
      {...nativeProps}
      aria-controls={row.detailId}
      aria-expanded={open}
      aria-label={nativeProps['aria-label'] ?? (open ? table.t('collapse') : table.t('expand'))}
      /* The chevron is drawn unless the consumer wrote content of their own. */
      children={
        nativeProps.children ?? (
          <Icon>
            <Glyph name="chevron-right" />
          </Icon>
        )
      }
      data-part="expander"
      onClick={press}
      ref={ref}
      type="button"
    />
  );
}

/**
 * One row holding one cell that spans the table. It is not rendered while it is
 * closed, so nothing is in the DOM that a reader is told about and cannot
 * reach, and the expander says `aria-expanded="false"` in that state.
 */
export function TableDetail({
  children,
  colSpan,
  ref,
  value,
  ...nativeProps
}: TableDetailProps): ReactNode {
  const table = useTable();
  if (!table.isExpanded(value)) return null;

  return (
    <tr {...nativeProps} data-part="detail" id={`${table.id}detail${value}`} ref={ref}>
      <td colSpan={colSpan ?? table.columns} data-part="cell">
        {children}
      </td>
    </tr>
  );
}

/**
 * What is shown when there is nothing. It takes a `result-state`, whose status
 * axis already separates an empty set from a set a filter emptied — a second
 * empty shape here would be a second answer to a question a family answers.
 */
export function TableEmpty({ colSpan, ref, ...nativeProps }: TableEmptyProps) {
  const table = useTable();
  return <td {...nativeProps} colSpan={colSpan ?? table.columns} data-part="empty" ref={ref} />;
}

/**
 * The skeleton rows of a first load: the table's shape before its content. A
 * refresh over rows already read is the other state and is not this one —
 * `loading` on the table dims the body and moves nothing.
 */
export function TableLoader({ children, ref, skeletonRows, ...nativeProps }: TableLoaderProps) {
  const table = useTable();

  return (
    <tbody {...nativeProps} aria-hidden data-part="loader" ref={ref}>
      {children ??
        Array.from({ length: skeletonRows ?? 5 }, (_unused, row) => (
          <tr data-part="row" key={row}>
            {Array.from({ length: table.columns }, (_cell, column) => (
              <td data-part="cell" key={column}>
                <Skeleton inlineSize="100%" loading />
              </td>
            ))}
          </tr>
        ))}
    </tbody>
  );
}
