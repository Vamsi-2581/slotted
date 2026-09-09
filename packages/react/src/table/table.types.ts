import type { ChangeRequest } from '@slotted/core/state';
import type {
  ComponentPropsWithRef,
  HTMLAttributes,
  ReactNode,
  RefCallback,
  RefObject,
} from 'react';

/** How much of a frame the set is given. The vocabulary `description-list` set. */
export type TableVariant = 'plain' | 'ruled' | 'framed';

/**
 * Whether the browser sizes the columns from their content or from what the
 * table states. `fixed` is what makes a stated width hold and a truncated cell
 * truncate at all.
 */
export type TableLayout = 'auto' | 'fixed';

export type TableSelectionMode = 'none' | 'single' | 'multiple';

/** Which edge a cell's content stands on, resolved logically. */
export type TableAlign = 'start' | 'center' | 'end';

/** What a value longer than its column does. None of the three removes it. */
export type TableText = 'wrap' | 'truncate' | 'nowrap';

/**
 * What a sticky header stays inside: the family's own scroller, or whatever
 * scrolls outside it — the page, an app shell, a scroll area.
 */
export type TableStickyTo = 'scroll' | 'page';

/** Which edge a column is pinned to while the table scrolls past it. */
export type TableSticky = 'start' | 'end';

export type TableSortDirection = 'ascending' | 'descending';

/**
 * Which column the rows are ordered by, and which way. The family holds it and
 * reorders nothing: the rows are the consumer's own children, so the consumer
 * applies the descriptor to its own array or its own query.
 */
export interface TableSortDescriptor {
  column: string;
  direction: TableSortDirection;
}

export type TableSortReason = Extract<
  ChangeRequest<TableSortDescriptor | null>['reason'],
  'pointer' | 'keyboard' | 'clear' | 'programmatic'
>;

export type TableSelectionReason = Extract<
  ChangeRequest<readonly string[]>['reason'],
  'pointer' | 'keyboard' | 'select' | 'clear' | 'programmatic'
>;

export type TableExpandedReason = Extract<
  ChangeRequest<readonly string[]>['reason'],
  'pointer' | 'keyboard' | 'programmatic'
>;

export type TableSortRequest = ChangeRequest<TableSortDescriptor | null>;
export type TableSelectionRequest = ChangeRequest<readonly string[]>;
export type TableExpandedRequest = ChangeRequest<readonly string[]>;

/**
 * The words the family says. One input rather than eight props: an application
 * translates them once, and a family that spread them across the root would
 * make seven of the eight a prop nobody sets.
 */
export interface TableLabels {
  /** The name of a row's own checkbox, joined to the row's value. */
  selectRow?: string;
  /** The name of the header checkbox, which states the count it covers. */
  selectAll?: string;
  expand?: string;
  collapse?: string;
  sortedAscending?: string;
  sortedDescending?: string;
  sortCleared?: string;
  /** The name of the scrolling region, raised only while the table overflows. */
  scroll?: string;
}

export type TableResolvedLabels = Required<TableLabels>;

/** What an application sets once for every table under it. */
export interface TableDefaults {
  columns?: number | undefined;
  labels?: TableLabels | undefined;
  layout?: TableLayout | undefined;
  selectionMode?: TableSelectionMode | undefined;
  stickyHeader?: boolean | undefined;
  stickyTo?: TableStickyTo | undefined;
  striped?: boolean | undefined;
  variant?: TableVariant | undefined;
}

export interface TableDefaultsProviderProps extends Omit<TableDefaults, 'labels'> {
  children?: ReactNode | undefined;
  labels?: TableLabels | undefined;
}

/** What `render` receives for the root, so it can be spread onto any element. */
export interface TableRootProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode | undefined;
  'data-layout': TableLayout;
  'data-loading'?: '' | undefined;
  'data-part': string;
  'data-sticky-header'?: '' | undefined;
  'data-sticky-to'?: TableStickyTo | undefined;
  'data-striped'?: '' | undefined;
  'data-ui': string;
  'data-variant': TableVariant;
  /**
   * Named here, unlike a part whose element the family never reads, because the
   * range and the select-all read the rows out of this element at the moment
   * they act. A consumer who substitutes the element still hands the family the
   * node those two questions are asked of.
   */
  ref: RefCallback<HTMLDivElement>;
}

export interface TableProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange'> {
  /**
   * How many columns the table renders. The spanning parts — the detail row,
   * the empty cell, the skeleton rows — need the number, and reading it from
   * the DOM would be nothing on the server and a count on the client.
   */
  columns?: number | undefined;
  defaultExpanded?: readonly string[] | undefined;
  defaultSort?: TableSortDescriptor | null | undefined;
  defaultValue?: readonly string[] | undefined;
  expanded?: readonly string[] | undefined;
  labels?: TableLabels | undefined;
  layout?: TableLayout | undefined;
  /** A refresh over rows already shown: `aria-busy`, and nothing moves. */
  loading?: boolean | undefined;
  onExpandedChange?: (value: readonly string[], request: TableExpandedRequest) => void;
  onSortChange?: (value: TableSortDescriptor | null, request: TableSortRequest) => void;
  onValueChange?: (value: readonly string[], request: TableSelectionRequest) => void;
  render?: ((props: TableRootProps) => ReactNode) | undefined;
  selectionMode?: TableSelectionMode | undefined;
  sort?: TableSortDescriptor | null | undefined;
  stickyHeader?: boolean | undefined;
  /**
   * What the sticky header stays inside. `page` releases the family's own
   * scroll container, so the table can no longer scroll sideways in its frame.
   */
  stickyTo?: TableStickyTo | undefined;
  striped?: boolean | undefined;
  value?: readonly string[] | undefined;
  variant?: TableVariant | undefined;
}

/** The one action a consumer cannot express declaratively. */
export interface TableHandle {
  /** Brings one row into view by the shortest movement that does it. */
  scrollToRow: (value: string) => void;
  /** Whether the table is wider than the box that holds it. */
  overflowing: () => boolean;
  /** Measures again, after rows arrive or a column changes width. */
  refresh: () => void;
}

export interface TableContextValue {
  columns: number;
  /** `page` means the family owns no scroller, so nothing is measured. */
  stickyTo: TableStickyTo;
  expanded: readonly string[];
  id: string;
  isExpanded: (value: string) => boolean;
  isSelected: (value: string) => boolean;
  labels: TableResolvedLabels;
  loading: boolean;
  requestSort: (column: string, source: unknown) => void;
  /** Every selectable row's value, in the order the body renders them. */
  rows: () => readonly string[];
  selectionMode: TableSelectionMode;
  sort: TableSortDescriptor | null;
  toggleExpanded: (value: string, source: unknown) => void;
  toggleSelected: (value: string, options: { range: boolean; source: unknown }) => void;
  toggleSelectAll: (source: unknown) => void;
  value: readonly string[];
}

export interface TableContentProps extends ComponentPropsWithRef<'table'> {
  handleRef?: RefObject<TableHandle | null> | undefined;
  /** The name the scrolling region takes while it overflows. */
  scrollLabel?: string | undefined;
  /** The element that names the scrolling region, which is usually the caption. */
  scrollLabelledBy?: string | undefined;
  /** Props for the scroller the family draws around the table. */
  scrollProps?: ComponentPropsWithRef<'div'> | undefined;
  /**
   * The total number of rows behind a paged or filtered table. Written as
   * `aria-rowcount` with `aria-rowindex` on every row, and only then: the
   * practice requires the pair exactly when the DOM is not the whole set.
   */
  totalRowCount?: number | undefined;
}

export interface TableRowContextValue {
  detailId: string;
  disabled: boolean;
  expanded: boolean;
  selected: boolean;
  value: string | undefined;
}

export interface TableRowProps extends ComponentPropsWithRef<'tr'> {
  disabled?: boolean | undefined;
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
  /**
   * The row's position in the whole set, one-based. Written as
   * `aria-rowindex`, and only where the table states a `totalRowCount`: the
   * practice warns that setting it on some rows and not others has devastating
   * effects on assistive technology.
   */
  rowIndex?: number | undefined;
  /** The row's key, required wherever selection or expansion is on. */
  value?: string | undefined;
}

/** Every axis a cell answers, shared by the three cell parts. */
export interface TableCellAxes {
  align?: TableAlign | undefined;
  numeric?: boolean | undefined;
  sticky?: TableSticky | undefined;
  text?: TableText | undefined;
}

export interface TableCellProps extends Omit<ComponentPropsWithRef<'td'>, 'align'>, TableCellAxes {}

export interface TableRowHeaderProps
  extends Omit<ComponentPropsWithRef<'th'>, 'align'>, TableCellAxes {}

export interface TableColumnHeaderProps
  extends Omit<ComponentPropsWithRef<'th'>, 'align'>, TableCellAxes {
  /** The column's own key, which the sort descriptor names. */
  column?: string | undefined;
}

export interface TableSortProps extends ComponentPropsWithRef<'button'> {
  /** Overrides the column the header states, where a header holds two. */
  column?: string | undefined;
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}

export type TableColumnActionsProps = ComponentPropsWithRef<'span'>;

export interface TableSelectProps extends Omit<ComponentPropsWithRef<'td'>, 'children'> {
  /** The row this checkbox chooses. Read from the row when it is not stated. */
  value?: string | undefined;
}

export type TableSelectAllProps = Omit<ComponentPropsWithRef<'th'>, 'children'>;

export interface TableExpanderProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  value?: string | undefined;
}

export interface TableDetailProps extends ComponentPropsWithRef<'tr'> {
  /** How many columns the detail spans. Defaults to the table's own count. */
  colSpan?: number | undefined;
  /** The row the detail belongs to. */
  value: string;
}

export interface TableEmptyProps extends ComponentPropsWithRef<'td'> {
  colSpan?: number | undefined;
}

export interface TableLoaderProps extends Omit<ComponentPropsWithRef<'tbody'>, 'children'> {
  /** How many skeleton rows a first load draws. */
  skeletonRows?: number | undefined;
  children?: ReactNode | undefined;
}

export type TableCaptionProps = ComponentPropsWithRef<'caption'>;
export type TableHeadProps = ComponentPropsWithRef<'thead'>;
export type TableBodyProps = ComponentPropsWithRef<'tbody'>;
export type TableSummaryProps = ComponentPropsWithRef<'tfoot'>;
export type TableFooterProps = ComponentPropsWithRef<'div'>;
