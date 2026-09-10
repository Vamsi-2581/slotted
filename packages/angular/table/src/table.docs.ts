import tableTokens from '@slotted/styles/table/tokens.json';
import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_TABLE_TOKENS = tableTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Table decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  SlTable,\n  SlTableBody,\n  SlTableCaption,\n  SlTableCell,\n  SlTableColumnActions,\n  SlTableColumnHeader,\n  SlTableContent,\n  SlTableDetail,\n  SlTableEmpty,\n  SlTableExpander,\n  SlTableFooter,\n  SlTableHead,\n  SlTableLoader,\n  SlTableRow,\n  SlTableRowHeader,\n  SlTableSelect,\n  SlTableSelectAll,\n  SlTableSort,\n  SlTableSummary,\n  provideTableDefaults,\n} from '@slotted/angular/table';",
  selector: 'div[slTable]',
  exportAs: 'slTable',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div[slTable], exportAs="slTable"',
    required: true,
    purpose:
      'The frame, and your own div. It carries every axis and holds what must not move when the table is scrolled sideways: the border, the radius and the footer bar.',
  },
  {
    part: 'scroll',
    element: 'div[slTableContent], exportAs="slTableContent"',
    required: true,
    purpose:
      'The scroller, and the element a sticky header resolves against. It becomes a named region with a tab stop only while the table overflows.',
  },
  {
    part: 'table',
    element: 'table, drawn by slTableContent',
    required: true,
    purpose:
      'The tabular structure itself. Angular pays one element for the host and draws the other in its template, which is why one directive owns both.',
  },
  {
    part: 'caption',
    element: 'caption[slTableCaption]',
    required: false,
    purpose:
      'The table name, and the accessible name whether it is read or hidden. The family writes no aria-labelledby restating what the browser already states.',
  },
  {
    part: 'head',
    element: 'thead[slTableHead]',
    required: false,
    purpose: 'The header row group. It sticks to the scroller when stickyHeader is on.',
  },
  {
    part: 'body',
    element: 'tbody[slTableBody]',
    required: true,
    purpose: 'The rows. A table may hold more than one, which is how a set is grouped by section.',
  },
  {
    part: 'summary',
    element: 'tfoot[slTableSummary]',
    required: false,
    purpose:
      'The column summaries, which is the HTML Standard own word for a tfoot: a total, a count, a unit. It is not the footer bar.',
  },
  {
    part: 'footer',
    element: 'div[slTableFooter]',
    required: false,
    purpose:
      'The bar under the table and inside the frame, where a paged listing puts its control. It is a sibling of the scroller, so a table scrolled sideways does not take its pagination with it.',
  },
  {
    part: 'row',
    element: 'tr[slTableRow], exportAs="slTableRow"',
    required: true,
    purpose:
      'One record. It carries data-selected and data-expanded for the stylesheet and data-value for the range and the select-all.',
  },
  {
    part: 'column-header',
    element: 'th[slTableColumnHeader]',
    required: false,
    purpose:
      'A column name, scoped to its column. It carries aria-sort when it is the sorted one, and on no other header.',
  },
  {
    part: 'row-header',
    element: 'th[slTableRowHeader]',
    required: false,
    purpose:
      'The cell that identifies the record, scoped to its row, which a screen reader repeats in each cell beside it.',
  },
  {
    part: 'cell',
    element: 'td[slTableCell]',
    required: true,
    purpose: 'One value, and the four axes a cell answers: align, numeric, text and sticky.',
  },
  {
    part: 'sort',
    element: 'button[slTableSort]',
    required: false,
    purpose:
      'The column name wrapped in a button, which is what the APG sortable example does. The whole header is the target.',
  },
  {
    part: 'column-actions',
    element: 'span[slTableColumnActions]',
    required: false,
    purpose:
      'The slot beside a column name for the controls it carries: a filter trigger, a column menu, a help hint. The family holds the place; the query is yours.',
  },
  {
    part: 'filter',
    element: 'button[slTableFilter]',
    required: false,
    purpose:
      'The trigger the family draws in that slot, and everything behind it. It marks itself while the column is filtered and states the count in its own name.',
  },
  {
    part: 'filter-panel',
    element: 'div',
    required: false,
    purpose:
      'The surface the trigger opens: a search, the values, and the two actions. It edits a draft — nothing reaches you until Apply.',
  },
  {
    part: 'filter-search',
    element: 'div',
    required: false,
    purpose:
      'The field that narrows the values, on a fold that ignores case and diacritics. It appears once there are searchThreshold values.',
  },
  {
    part: 'filter-list',
    element: 'div',
    required: false,
    purpose:
      'The values, scrolling inside the panel rather than making the panel taller than the screen.',
  },
  {
    part: 'filter-option',
    element: 'div',
    required: false,
    purpose:
      'One value, its checkbox and its count. The first is the covering checkbox, which answers for exactly what the search left.',
  },
  {
    part: 'filter-empty',
    element: 'p',
    required: false,
    purpose: 'The word shown when the search matches nothing, so the panel is never a blank box.',
  },
  {
    part: 'filter-actions',
    element: 'div',
    required: false,
    purpose: 'The footer: Clear at the leading edge and Apply at the trailing one.',
  },
  {
    part: 'selection',
    element: 'td[slTableSelect] and th[slTableSelectAll]',
    required: false,
    purpose:
      'The cell holding the checkbox, in the header and in every row. The cell is this family and the chooser is slCheckbox, named by a visually hidden label.',
  },
  {
    part: 'expander',
    element: 'button[slTableExpander]',
    required: false,
    purpose:
      'Opens and closes one row detail, carrying aria-expanded and aria-controls. It is the APG Disclosure pattern, borrowed whole.',
  },
  {
    part: 'detail',
    element: 'tr[slTableDetail]',
    required: false,
    purpose:
      'The open row detail, one cell spanning every column. Control flow in the template keeps a closed one out of the DOM, which a host element cannot do for itself.',
  },
  {
    part: 'empty',
    element: 'td[slTableEmpty]',
    required: false,
    purpose:
      'What is shown when there is nothing, spanning every column. It takes an slResultState, which already separates an empty set from a set a filter emptied.',
  },
  {
    part: 'loader',
    element: 'tbody[slTableLoader]',
    required: false,
    purpose:
      'The skeleton rows of a first load: the table shape before its content. A refresh over rows already read is the other state and dims the body instead.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'Every axis on one table, driven by the controls below the canvas. Change the variant, turn the stripes on, then narrow the window: the table scrolls inside its own frame rather than pushing the page over.',
    snippet: defineSnippet({
      id: 'table-angular-playground',
      language: 'angular',
      label: 'A table',
      source:
        '<div slTable [columns]="3">\n  <div slTableContent>\n    <caption slTableCaption>\n      Invoices\n    </caption>\n    <thead slTableHead>\n      <tr slTableRow>\n        <th slTableColumnHeader>Invoice</th>\n        <th slTableColumnHeader>Client</th>\n        <th slTableColumnHeader numeric>Amount</th>\n      </tr>\n    </thead>\n    <tbody slTableBody>\n      @for (invoice of invoices(); track invoice.id) {\n        <tr slTableRow [value]="invoice.id">\n          <th slTableRowHeader>{{ invoice.id }}</th>\n          <td slTableCell>{{ invoice.client }}</td>\n          <td slTableCell numeric>{{ invoice.amount }}</td>\n        </tr>\n      }\n    </tbody>\n  </div>\n</div>',
    }),
  },
  {
    id: 'variant',
    title: 'Nothing, a rule, or a frame',
    note: 'Plain is the form that belongs inside a card, where the card already draws the box. Ruled puts a hairline between records. Framed is the listing screen: the set reads as one object, and the footer bar sits inside it.',
    snippet: defineSnippet({
      id: 'table-angular-variant',
      language: 'angular',
      label: 'The three presentations',
      source:
        '<div slTable variant="plain"></div>\n<div slTable variant="ruled"></div>\n<div slTable variant="framed"></div>',
    }),
  },
  {
    id: 'striped',
    title: 'A stripe to carry the eye across',
    note: 'Off by default, because a stripe costs a row its own state colours. It is mixed from the ink at five per cent, one step under the header band, and every state is painted over it: a striped row that is selected reads as selected.',
    snippet: defineSnippet({
      id: 'table-angular-striped',
      language: 'angular',
      label: 'Zebra rows',
      source: '<div slTable striped></div>',
    }),
  },
  {
    id: 'sorting',
    title: 'Ordered by one column, and said out loud',
    note: 'Press a header: ascending, then descending, then none. The family holds the descriptor and reorders nothing — the rows are yours — so apply it to your own array or send it to your query. The change is announced, because aria-sort alone is silent.',
    snippet: defineSnippet({
      id: 'table-angular-sorting',
      language: 'angular',
      label: 'Sorting your own array',
      source:
        '<div slTable [(sort)]="sort">\n  <div slTableContent>\n    <thead slTableHead>\n      <tr slTableRow>\n        <th slTableColumnHeader column="client">\n          <button slTableSort>Client</button>\n        </th>\n      </tr>\n    </thead>\n    <tbody slTableBody>\n      @for (invoice of sorted(); track invoice.id) {\n        <tr slTableRow [value]="invoice.id"></tr>\n      }\n    </tbody>\n  </div>\n</div>',
    }),
  },
  {
    id: 'column-controls',
    title: 'A filter, beside the name it filters',
    note: 'The family draws the filter: a trigger on the column boundary and a panel that searches, covers what the search left, counts what you counted, and edits a draft. Nothing reaches you until Apply — Escape and a press outside put back the set the panel opened with. What the set means is still your query.',
    snippet: defineSnippet({
      id: 'table-angular-column-controls',
      language: 'angular',
      label: 'A column that sorts and filters',
      source:
        '<th slTableColumnHeader column="client">\n  <button slTableSort>Client</button>\n  <span slTableColumnActions>\n    <span slTableFilter columnLabel="client" [options]="clients" [(value)]="chosen"></span>\n  </span>\n</th>',
    }),
  },
  {
    id: 'selection',
    title: 'Choosing records, and what all means',
    note: 'Hold Shift and press a second checkbox to take everything between. The header checkbox covers the rows in the DOM and says how many in its own name — a selection over a whole result set is a decision only your query can make.',
    snippet: defineSnippet({
      id: 'table-angular-selection',
      language: 'angular',
      label: 'Rows a bulk action acts on',
      source:
        '<div slTable selectionMode="multiple" [(value)]="chosen">\n  <div slTableContent>\n    <thead slTableHead>\n      <tr slTableRow>\n        <th slTableSelectAll></th>\n        <th slTableColumnHeader>Invoice</th>\n      </tr>\n    </thead>\n    <tbody slTableBody>\n      <tr slTableRow value="INV-1042">\n        <td slTableSelect></td>\n        <th slTableRowHeader>INV-1042</th>\n      </tr>\n    </tbody>\n  </div>\n</div>',
    }),
  },
  {
    id: 'expansion',
    title: 'A record with more to say',
    note: 'The expander is the Disclosure pattern: a button carrying aria-expanded and naming the row it opens. Control flow in the template keeps a closed detail out of the DOM, which is the one asymmetry with React and belongs to the frameworks rather than the family.',
    snippet: defineSnippet({
      id: 'table-angular-expansion',
      language: 'angular',
      label: 'A row that opens',
      source:
        '<tr slTableRow [value]="invoice.id" #row="slTableRow">\n  <td slTableCell><button slTableExpander></button></td>\n  <th slTableRowHeader>{{ invoice.id }}</th>\n</tr>\n@if (row.expanded()) {\n  <tr slTableDetail [value]="invoice.id">\n    Issued 12 August, due 11 September.\n  </tr>\n}',
    }),
  },
  {
    id: 'sticky',
    title: 'A header, a summary and a column that stay',
    note: 'stickyHeader holds the head against the top of the scroller and stickyFooter holds the summary against the bottom of it, so the total is on screen at the first row and the last. stickyTo says which box that is: this table own scroller, or whatever scrolls outside it. A pinned column darkens its edge exactly while something is hidden under it, and all of it mirrors in a right-to-left document.',
    snippet: defineSnippet({
      id: 'table-angular-sticky',
      language: 'angular',
      label: 'Pinned at four edges',
      source:
        '<div slTable stickyHeader stickyFooter stickyTo="page">\n  <div slTableContent>\n    <thead slTableHead>\n      <tr slTableRow>\n        <th slTableColumnHeader sticky="start">Invoice</th>\n        <th slTableColumnHeader sticky="end"></th>\n      </tr>\n    </thead>\n    <tfoot slTableSummary>\n      <tr slTableRow>\n        <td slTableCell colSpan="4" sticky="start">48 invoices</td>\n        <td slTableCell numeric>{{ total() }}</td>\n      </tr>\n    </tfoot>\n  </div>\n</div>',
    }),
  },
  {
    id: 'scroll',
    title: 'Wider than the space it has',
    note: 'The scroller takes a tab stop, a role and a name only while it overflows, so a table that fits costs a keyboard reader nothing. Tab to it and the arrow keys, Page keys, Home and End all scroll it.',
    snippet: defineSnippet({
      id: 'table-angular-scroll',
      language: 'angular',
      label: 'Naming the region',
      source: '<div slTableContent scrollLabel="Invoices, scrollable"></div>',
    }),
  },
  {
    id: 'alignment',
    title: 'Where a value stands, and how its digits line up',
    note: 'Alignment is logical, so a column aligned to the end is on the right in English and on the left in Arabic. Numeric is a separate fact: it sets tabular figures, and aligns to the end unless you say otherwise.',
    snippet: defineSnippet({
      id: 'table-angular-alignment',
      language: 'angular',
      label: 'Numbers under numbers',
      source:
        '<td slTableCell numeric>9,802.75</td>\n<td slTableCell align="center">EU</td>\n<td slTableCell align="end">12 Aug</td>',
    }),
  },
  {
    id: 'text',
    title: 'A value longer than its column',
    note: 'Wrap breaks an unbroken token — a hash, a URL, an identifier — rather than letting it set the column width. Truncate keeps one line with the whole value still in the DOM. Nowrap never breaks. None of the three removes anything.',
    snippet: defineSnippet({
      id: 'table-angular-text',
      language: 'angular',
      label: 'The three treatments',
      source:
        '<div slTable layout="fixed">\n  <div slTableContent>\n    <tbody slTableBody>\n      <tr slTableRow>\n        <td slTableCell text="wrap">{{ hash }}</td>\n        <td slTableCell text="truncate">{{ note }}</td>\n        <td slTableCell text="nowrap">12 Aug 2026</td>\n      </tr>\n    </tbody>\n  </div>\n</div>',
    }),
  },
  {
    id: 'footer',
    title: 'The totals, and the page',
    note: 'Two different feet. The summary is a tfoot inside the table, where a total belongs beside the column it totals. The footer is a bar outside it and inside the frame, which is where the paging control goes and where it does not scroll sideways.',
    snippet: defineSnippet({
      id: 'table-angular-footer',
      language: 'angular',
      label: 'A total and a paginator',
      source:
        '<div slTable>\n  <div slTableContent [totalRowCount]="128">\n    <tfoot slTableSummary>\n      <tr slTableRow>\n        <td slTableCell numeric>11,061.25</td>\n      </tr>\n    </tfoot>\n  </div>\n  <div slTableFooter>\n    <span>3 of 128 invoices</span>\n    <nav slPagination [count]="128" [pageSize]="3"></nav>\n  </div>\n</div>',
    }),
  },
  {
    id: 'empty-and-loading',
    title: 'Nothing yet, nothing at all, and something arriving',
    note: 'A first load draws skeleton rows, so the shape is visible before the content. A refresh over rows already read writes aria-busy and dims them without moving anything — a reader looking at row forty stays there.',
    snippet: defineSnippet({
      id: 'table-angular-empty-and-loading',
      language: 'angular',
      label: 'The three states of an empty body',
      source:
        '@if (loading() && rows().length === 0) {\n  <tbody slTableLoader [skeletonRows]="5"></tbody>\n} @else if (rows().length === 0) {\n  <tbody slTableBody>\n    <tr slTableRow>\n      <td slTableEmpty>\n        <section slResultState status="no-results"></section>\n      </td>\n    </tr>\n  </tbody>\n} @else {\n  <tbody slTableBody></tbody>\n}',
    }),
  },
  {
    id: 'density',
    title: 'The same table, three sizes',
    note: 'The row reads the control height, the cell reads the control inset and the type reads the control step, so one theme decision retunes the rows, the buttons and the fields together. Density changes the size and never the meaning.',
    snippet: defineSnippet({
      id: 'table-angular-density',
      language: 'angular',
      label: 'A dense region',
      source: '<div data-density="dense">\n  <div slTable></div>\n</div>',
    }),
  },
  {
    id: 'content',
    title: 'Content the table did not choose',
    note: 'A forty-character identifier, a translated header twice as long as its English, a cell holding a tag and a link. The table is a grid of your own content, so the parts hold whatever a record needs rather than a string.',
    snippet: defineSnippet({
      id: 'table-angular-content',
      language: 'angular',
      label: 'A cell that is not a string',
      source:
        '<td slTableCell>\n  <span slTag tone="danger">Overdue</span>\n</td>\n<th slTableRowHeader>\n  <a slLink [href]="\'/invoices/\' + invoice.id">{{ invoice.id }}</a>\n</th>',
    }),
  },
  {
    id: 'listing',
    title: 'The screen this is reached for',
    note: 'Sorting, selection with a bulk action, a filter in a header, an identifier pinned at the start and actions pinned at the end, a paging control in the footer. Every piece beside the table is another family, composed rather than built in.',
    snippet: defineSnippet({
      id: 'table-angular-listing',
      language: 'angular',
      label: 'A listing screen',
      source:
        '<div\n  slTable\n  variant="framed"\n  stickyHeader\n  selectionMode="multiple"\n  [columns]="5"\n  [(value)]="chosen"\n  [(sort)]="sort"\n>\n  <div slTableContent [totalRowCount]="128"></div>\n  <div slTableFooter>\n    <nav slPagination [count]="128"></nav>\n  </div>\n</div>',
    }),
  },
  {
    id: 'composition',
    title: 'Setting the family once, and reaching past it',
    note: 'provideTableDefaults sets the frame, the layout and the words for everything under that injector, and a table that states an axis itself still wins. Every part is a directive on your own element, so nothing is wrapped that you did not write.',
    snippet: defineSnippet({
      id: 'table-angular-composition',
      language: 'ts',
      label: 'An application deciding once',
      source:
        "bootstrapApplication(App, {\n  providers: [\n    provideTableDefaults({\n      variant: 'framed',\n      stickyHeader: true,\n      labels: { selectAll: 'Selecionar tudo' },\n    }),\n  ],\n});",
    }),
  },
  {
    id: 'keyboard',
    title: 'Every control is its own tab stop',
    note: 'A table is not a composite widget, so the family binds no key: Tab reaches the scroller, then each sort button, checkbox and expander in DOM order. Shift with Space on a checkbox takes the range, which is the one gesture the family adds.',
    snippet: defineSnippet({
      id: 'table-angular-keyboard',
      language: 'angular',
      label: 'Nothing to wire',
      source:
        '<!-- Enter and Space activate the buttons the family renders. -->\n<!-- Shift + Space on a row checkbox selects from the anchor. -->\n<!-- The scroller answers the arrow, Page, Home and End keys. -->',
    }),
  },
  {
    id: 'accessibility',
    title: 'What a reader hears',
    note: 'The caption names the table, scope ties every value to its column and its record, aria-sort says the order and the announcer says it changed. A paged table states aria-rowcount so row three of twenty is row three of four hundred.',
    snippet: defineSnippet({
      id: 'table-angular-accessibility',
      language: 'angular',
      label: 'A paged table saying how large it is',
      source:
        '<div slTableContent [totalRowCount]="412">\n  <tbody slTableBody>\n    <tr slTableRow value="INV-1042" [rowIndex]="41">\n      <th slTableRowHeader>INV-1042</th>\n    </tr>\n  </tbody>\n</div>',
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'sortChange',
    payload: 'TableSortDescriptor | null',
    when: 'The two-way half of the model: the column and the direction, or null when the third press clears it.',
  },
  {
    name: 'sortChangeRequest',
    payload: 'ChangeRequest<TableSortDescriptor | null>',
    when: 'The same transition with the reason — pointer, keyboard, clear or programmatic — the value it replaces and cancel().',
  },
  {
    name: 'valueChange',
    payload: 'readonly string[]',
    when: 'The chosen rows, in the collection order rather than the order they were pressed.',
  },
  {
    name: 'valueChangeRequest',
    payload: 'ChangeRequest<readonly string[]>',
    when: 'The selection with its reason: select for a range or a select-all, clear when the set is emptied, pointer otherwise.',
  },
  {
    name: 'expandedChange',
    payload: 'readonly string[]',
    when: 'The rows whose detail is open, after the press that opened or closed one.',
  },
  {
    name: 'expandedChangeRequest',
    payload: 'ChangeRequest<readonly string[]>',
    when: 'The same transition, with the reason and the originating event.',
  },
];

export const ANGULAR_TABLE_DOCS = {
  table: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'sort',
        'model<TableSortDescriptor | null>',
        'null',
        'slTable',
        'The column the rows are ordered by, two-way',
      ],
      [
        'defaultSort',
        'model initial value',
        'null',
        'slTable',
        'The order an unbound table starts in: the model own initial value',
      ],
      [
        'value',
        'model<readonly string[]>',
        '[]',
        'slTable',
        'The chosen rows, two-way, and the value a form control holds',
      ],
      [
        'defaultValue',
        'model initial value',
        '[]',
        'slTable',
        'The rows an unbound table starts with',
      ],
      [
        'expanded',
        'model<readonly string[]>',
        '[]',
        'slTable',
        'The rows whose detail is open, two-way',
      ],
      [
        'defaultExpanded',
        'model initial value',
        '[]',
        'slTable',
        'The details an unbound table starts with',
      ],
      [
        'variant',
        "'plain' | 'ruled' | 'framed'",
        'ruled',
        'slTable',
        'How much of a frame the set is given',
      ],
      ['striped', 'boolean', 'false', 'slTable', 'A tinted ground on every second record'],
      [
        'stickyHeader',
        'boolean',
        'false',
        'slTable',
        'Whether the header stays while the body scrolls',
      ],
      [
        'stickyFooter',
        'boolean',
        'false',
        'slTable',
        'Whether the summary rows stay while the body scrolls. It pins the tfoot and not the footer bar, which never scrolls.',
      ],
      [
        'stickyTo',
        "'scroll' | 'page'",
        'scroll',
        'slTable',
        'What the header stays inside: this table own scroller, or whatever scrolls outside it. page releases the scroller, so the table stops scrolling sideways in its frame.',
      ],
      [
        'options',
        'readonly TableFilterOption[]',
        '—',
        'slTableFilter',
        'The values the column can be filtered to, each with an optional count of its own',
      ],
      [
        'value',
        'readonly string[]',
        '[]',
        'slTableFilter',
        'The set the column is filtered to. Two-way through [(value)], and valueChange fires once, on Apply.',
      ],
      [
        'searchThreshold',
        'number',
        '8',
        'slTableFilter',
        'How many values bring a search with them. searchable states it outright.',
      ],
      [
        'cellAlign',
        "'start' | 'center' | 'end'",
        'center',
        'slTable',
        'Where every cell content sits in a row as tall as its tallest cell. A cell states blockAlign to answer differently.',
      ],
      [
        'layout',
        "'auto' | 'fixed'",
        'auto',
        'slTable',
        'Whether the browser sizes the columns from their content or from what you state',
      ],
      [
        'selectionMode',
        "'none' | 'single' | 'multiple'",
        'none',
        'slTable',
        'How many records may be chosen at once',
      ],
      ['columns', 'number', '1', 'slTable', 'How many columns the spanning parts span'],
      [
        'loading',
        'boolean',
        'false',
        'slTable',
        'A refresh over rows already shown: aria-busy, and nothing moves',
      ],
      [
        'labels',
        'Partial<TableLabels>',
        '—',
        'slTable',
        'The eight words the family says, translated once',
      ],
      ['skeletonRows', 'number', '5', 'slTableLoader', 'How many skeleton rows a first load draws'],
      [
        'totalRowCount',
        'number',
        '—',
        'slTableContent',
        'The size of the set behind a page, written as aria-rowcount',
      ],
      [
        'scrollLabel',
        'string',
        '—',
        'slTableContent',
        'The name the scrolling region takes while it overflows',
      ],
      [
        'scrollLabelledBy',
        'string',
        '—',
        'slTableContent',
        'The element that names the region instead, usually the caption',
      ],
      [
        'value',
        'string',
        '—',
        'slTableRow',
        'The record key the selection and the expansion are held by',
      ],
      [
        'disabled',
        'boolean',
        'false',
        'slTableRow',
        'A record the reader may not choose; it leaves the set the header covers',
      ],
      [
        'rowIndex',
        'number',
        '—',
        'slTableRow',
        'The record position in the whole set, written as aria-rowindex',
      ],
      [
        'column',
        'string',
        '—',
        'slTableColumnHeader, slTableSort',
        'The column key the sort descriptor names',
      ],
      [
        'align',
        "'start' | 'center' | 'end'",
        'start',
        'the three cell parts',
        'Which edge the value stands on, resolved logically',
      ],
      [
        'numeric',
        'boolean',
        'false',
        'the three cell parts',
        'Tabular figures, and the end edge unless align says otherwise',
      ],
      [
        'blockAlign',
        "'start' | 'center' | 'end'",
        'center',
        'the three cell parts and both selection cells',
        'Where this cell content sits in its row, overriding the table own cellAlign',
      ],
      [
        'text',
        "'wrap' | 'truncate' | 'nowrap'",
        'wrap',
        'the three cell parts',
        'What a value longer than its column does',
      ],
      [
        'sticky',
        "'start' | 'end'",
        'start',
        'the three cell parts and both selection cells',
        'Which edge the column is pinned to while the table scrolls past it',
      ],
      [
        'stickyOffset',
        'string',
        '0',
        'the three cell parts and both selection cells',
        'Where the pinned column stops, as a CSS length. Two columns pinned to the same edge need the second to state how wide the first is — beside a selection column that is --slotted-table-selection-size, which is 3rem.',
      ],
      [
        'colSpan',
        'number',
        '—',
        'slTableDetail, slTableEmpty',
        'How many columns the part spans, defaulting to the table own count',
      ],
    ]),
    composition: apiRows([
      [
        'exportAs',
        'slTable, slTableRow, slTableContent',
        '—',
        'every part',
        'Reaches the instance from the template: row.expanded(), table.rows(), content.scrollToRow()',
      ],
      [
        'provideTableDefaults()',
        'Partial<TableDefaults>',
        '—',
        'Application',
        'Sets the frame, the layout, the selection and the words once; an input on the table still wins',
      ],
      [
        'ControlValueAccessor',
        'readonly string[]',
        '—',
        'slTable',
        'The selection as a form value: [formControl] or [(ngModel)] on the table itself',
      ],
      [
        'ng-content',
        'projected',
        '—',
        'slTableContent',
        'Your caption, header, body, summary and footer are projected into the table the directive draws',
      ],
      [
        'SL_TABLE_PARTS',
        'readonly Type[]',
        '—',
        'a standalone component',
        'Every part in one import, for a template that uses most of them',
      ],
    ]),
    accessibility: [
      'The role is table and not grid, and the difference is the whole boundary with data-grid. The APG says a table "is not an interactive widget. Thus, its cells are not focusable or selectable", so every control inside is its own tab stop and the family binds no key. Column resizing, virtualisation, multi-column sort and row activation all need the grid pattern and are deferred to the family that has it.',
      'Every role comes from the platform: table, thead, tbody, tfoot, tr, th and td already carry table, rowgroup, row, columnheader, rowheader and cell. The family writes none of them, and it writes no aria-labelledby either — a caption is the accessible name by the browser own rule, whether it is visible or visually hidden.',
      'scope="col" on a column header and scope="row" on a row header are what make a screen reader repeat the column name and the record name in each cell. They are the two attributes §12 of the feature guide asks for by name.',
      'aria-sort is written on the sorted header and removed from every other, because ARIA has no way to state a sort level and a second sorted column would be silent or a lie. The change is also announced politely with the column and the direction: a property that changes silently is a change no reader hears.',
      'A row is not selectable under this role, so it carries no aria-selected. The state is painted with data-selected and announced by the checkbox that owns it, whose name is a visually hidden label rather than an aria-label on the wrapper — the wrapper is not the control.',
      'aria-rowcount and aria-rowindex are written exactly when you state a total larger than the DOM, which is what the Grid and Table Properties practice requires. The practice warns that writing aria-rowindex on some rows and not others has devastating effects, so the family writes neither unless you state both.',
      'The scroller becomes a region with a tab stop and a name only while the table overflows, measured after the first render rather than assumed. A wide table with no tab stop is unreachable without a pointer — a WCAG 2.2 level A failure — and a tab stop on a table that fits is one a reader presses for nothing.',
      'The expander is the Disclosure pattern: a button with aria-expanded and aria-controls naming the detail row. Your own @if keeps a closed detail out of the DOM, because a component whose host is the tr cannot remove that tr from inside itself and an empty row is a row a screen reader still counts.',
      'A selected row is said by its ground and its ink together, and by the checkbox mark. R1 of this repository forbids the rail two families reached for, and in the high-contrast scheme every tone ground is the page own white — so the mark is what survives.',
    ],
    snippets: [
      defineSnippet({
        id: 'table-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source:
          '<div data-ui="table" data-part="root" data-variant="framed" data-layout="auto">\n  <div data-part="scroll">\n    <table data-part="table">\n      <caption data-part="caption">\n        Invoices\n      </caption>\n      <thead data-part="head">\n        <tr data-part="row">\n          <th data-part="selection" scope="col"></th>\n          <th data-part="column-header" scope="col" aria-sort="ascending">\n            <button data-part="sort" type="button">Invoice</button>\n          </th>\n        </tr>\n      </thead>\n      <tbody data-part="body">\n        <tr data-part="row" data-value="INV-1042" data-selected>\n          <td data-part="selection"></td>\n          <th data-part="row-header" scope="row">INV-1042</th>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div data-part="footer"></div>\n</div>',
      }),
      defineSnippet({
        id: 'table-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source:
          "[data-ui='table'] {\n  --slotted-table-row-min-block-size: 40px;\n  --slotted-table-row-surface-hover: var(--slotted-tone-accent-subtle-hover);\n  --slotted-table-header-surface: var(--slotted-surface-sunken);\n  --slotted-table-border-color: var(--slotted-border-strong);\n}",
      }),
    ],
  },
} as const;
