import { SlIconButton } from '@slotted/angular/button';
import { SlLink } from '@slotted/angular/link';
import {
  SlPagination,
  SlPaginationItems,
  SlPaginationNext,
  SlPaginationPrevious,
} from '@slotted/angular/pagination';
import {
  SlResultState,
  SlResultStateContent,
  SlResultStateTitle,
} from '@slotted/angular/result-state';
import { SlTag, SlTagBody } from '@slotted/angular/tag';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlTable } from './table';
import { SlTableContent } from './table-content';
import { SL_TABLE_PARTS } from './table-parts';
import { ANGULAR_TABLE_DOCS, ANGULAR_TABLE_TOKENS } from './table.docs';

interface TableStoryArgs {
  layout: 'auto' | 'fixed';
  striped: boolean;
  variant: 'plain' | 'ruled' | 'framed';
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_TABLE_DOCS.table.scenes, {
    playground: Playground,
    variant: Variant,
    striped: Striped,
    sorting: Sorting,
    'column-controls': ColumnControls,
    selection: Selection,
    expansion: Expansion,
    sticky: Sticky,
    listing: Listing,
    scroll: Scroll,
    alignment: Alignment,
    text: Text,
    footer: Footer,
    'empty-and-loading': EmptyAndLoading,
    density: Density,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
    accessibility: Accessibility,
  }) as never;

const meta: Meta<TableStoryArgs> = {
  title: 'Components/Table',
  component: SlTable,
  decorators: [
    moduleMetadata({
      imports: [
        SlTable,
        SlTableContent,
        ...SL_TABLE_PARTS,
        SlLink,
        SlPagination,
        SlPaginationItems,
        SlPaginationNext,
        SlPaginationPrevious,
        SlResultState,
        SlResultStateContent,
        SlResultStateTitle,
        SlIconButton,
        SlTag,
        SlTagBody,
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Table',
        description:
          'The platform tabular structure, with sorting, selection, expansion and a place for a paging control. The listing screen of a dense application.',
        framework: 'Angular',
        ...ANGULAR_TABLE_DOCS.table,
        tokens: ANGULAR_TABLE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<TableStoryArgs>;

/**
 * One demonstration: what it is called, what to look at, and the stage that
 * owns the distance between the examples on it. Every story below composes this
 * rather than laying itself out, so no two examples end up against each other
 * and no story reaches for an inline style.
 */
const scene = (label: string, note: string, body: string) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-align="start" data-layout="block">${body}</div>
  </section>`;

const INVOICES = [
  {
    amount: '1,240.00',
    client: 'Northwind Trading',
    id: 'INV-1042',
    issued: '12 Aug',
    owner: 'A. Marchetti',
    status: 'Paid',
    tone: 'success',
  },
  {
    amount: '18.50',
    client: 'Cascade Logistics',
    id: 'INV-1043',
    issued: '19 Aug',
    owner: 'P. Okonkwo',
    status: 'Overdue',
    tone: 'danger',
  },
  {
    amount: '9,802.75',
    client: 'Bright Harbor',
    id: 'INV-1044',
    issued: '28 Aug',
    owner: 'L. Ferreira',
    status: 'Draft',
    tone: 'secondary',
  },
  {
    amount: '430.00',
    client: 'Halcyon Press',
    id: 'INV-1045',
    issued: '3 Sep',
    owner: 'S. Nakamura',
    status: 'Paid',
    tone: 'success',
  },
];

const HEAD = `
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader>Invoice</th>
          <th slTableColumnHeader>Client</th>
          <th slTableColumnHeader>Status</th>
          <th slTableColumnHeader numeric>Amount</th>
        </tr>
      </thead>`;

const BODY = `
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id) {
          <tr slTableRow [value]="invoice.id">
            <th slTableRowHeader>{{ invoice.id }}</th>
            <td slTableCell>{{ invoice.client }}</td>
            <td slTableCell>{{ invoice.status }}</td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
          </tr>
        }
      </tbody>`;

const table = (attributes: string, inner = HEAD + BODY) => `
  <div slTable [columns]="4" ${attributes}>
    <div slTableContent>${inner}</div>
  </div>`;

const FILTER = `
  <span slTableColumnActions>
    <button type="button" aria-label="Filter by client">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
    </button>
  </span>`;

export const Playground: Story = {
  args: { layout: 'auto', striped: false, variant: 'ruled' },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...args, invoices: INVOICES },
    template: `
<div class="slotted-demo-stage" data-layout="block">
  <div slTable [columns]="4" [variant]="variant" [layout]="layout" [striped]="striped">
    <div slTableContent>
      <caption slTableCaption>Invoices issued this quarter</caption>${HEAD}${BODY}
    </div>
  </div>
</div>`,
  }),
};

export const Variant: Story = {
  parameters: scenario('variant'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 2) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'variant="plain"',
    'No frame and no rules: the form that belongs inside a card, where the card already draws the box and a second edge would be two boxes.',
    table('variant="plain"'),
  )}
  ${scene(
    'variant="ruled"',
    'The default. A hairline between records and none around the set, so a table in a page of prose reads as a table rather than as a panel.',
    table('variant="ruled"'),
  )}
  ${scene(
    'variant="framed"',
    'The set is one object: a border, a radius that clips the corners, and the footer bar inside it. This is the listing screen form.',
    table('variant="framed"'),
  )}
</div>`,
  }),
};

export const Striped: Story = {
  parameters: scenario('striped'),
  render: () => ({
    props: { invoices: INVOICES },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'striped',
    'Mixed from the ink at five per cent, one step under the header band, so the stripe carries the eye across a wide row without becoming a second header.',
    table('variant="framed" striped'),
  )}
  ${scene(
    'striped, with a record chosen',
    'Every state is painted over the stripe rather than under it: the second record is striped and chosen, and it reads as chosen.',
    table('variant="framed" striped selectionMode="multiple" [value]="[\'INV-1043\']"'),
  )}
</div>`,
  }),
};

export const Sorting: Story = {
  parameters: scenario('sorting'),
  render: () => ({
    props: { invoices: INVOICES, sort: { column: 'client', direction: 'ascending' } },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Three presses, three answers',
    'Ascending, then descending, then none — the third state a reader who sorted by accident needs. The mark is drawn on the sorted column and revealed on the others under the pointer or under focus.',
    `
  <div slTable [columns]="4" variant="framed" [(sort)]="sort">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader column="id"><button slTableSort>Invoice</button></th>
          <th slTableColumnHeader column="client"><button slTableSort>Client</button></th>
          <th slTableColumnHeader>Status</th>
          <th slTableColumnHeader column="amount" numeric><button slTableSort>Amount</button></th>
        </tr>
      </thead>${BODY}
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const ColumnControls: Story = {
  parameters: scenario('column-controls'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 3) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'A column that sorts and filters',
    'Both controls stand on the column boundary, so the header row reads as one line of triggers. The slot holds the trigger; what the filter keeps and drops is your own query.',
    `
  <div slTable [columns]="4" variant="framed">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader column="id"><button slTableSort>Invoice</button></th>
          <th slTableColumnHeader column="client">
            <button slTableSort>Client</button>${FILTER}
          </th>
          <th slTableColumnHeader>Status${FILTER}</th>
          <th slTableColumnHeader numeric>Amount</th>
        </tr>
      </thead>${BODY}
    </div>
  </div>`,
  )}
</div>`,
  }),
};

const SELECTABLE = `
  <div slTable [columns]="5" variant="framed" selectionMode="multiple" [(value)]="chosen">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableSelectAll></th>
          <th slTableColumnHeader>Invoice</th>
          <th slTableColumnHeader>Client</th>
          <th slTableColumnHeader>Status</th>
          <th slTableColumnHeader numeric>Amount</th>
        </tr>
      </thead>
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id) {
          <tr slTableRow [value]="invoice.id" [disabled]="invoice.status === 'Draft'">
            <td slTableSelect></td>
            <th slTableRowHeader>{{ invoice.id }}</th>
            <td slTableCell>{{ invoice.client }}</td>
            <td slTableCell>{{ invoice.status }}</td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
          </tr>
        }
      </tbody>
    </div>
    <div slTableFooter><span>{{ chosen.length }} chosen</span></div>
  </div>`;

export const Selection: Story = {
  parameters: scenario('selection'),
  render: () => ({
    props: { chosen: ['INV-1043'], invoices: INVOICES },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Shift takes the span between',
    'Press one checkbox, then hold Shift and press another: everything between the two joins the set. The draft record is disabled, so it stays out of the set the header covers.',
    SELECTABLE,
  )}
</div>`,
  }),
};

export const Expansion: Story = {
  parameters: scenario('expansion'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 3) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'A record with more to say',
    'The expander sits in a gutter of its own, so every identifier stands in one column whether or not its record has a detail. Control flow in the template keeps a closed detail out of the DOM entirely.',
    `
  <div slTable [columns]="5" variant="framed" [expanded]="['INV-1043']">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader></th>
          <th slTableColumnHeader>Invoice</th>
          <th slTableColumnHeader>Client</th>
          <th slTableColumnHeader>Status</th>
          <th slTableColumnHeader numeric>Amount</th>
        </tr>
      </thead>
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id) {
          <tr slTableRow [value]="invoice.id" #row="slTableRow">
            <td slTableCell><button slTableExpander></button></td>
            <th slTableRowHeader>{{ invoice.id }}</th>
            <td slTableCell>{{ invoice.client }}</td>
            <td slTableCell>{{ invoice.status }}</td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
          </tr>
          @if (row.expanded()) {
            <tr slTableDetail [value]="invoice.id">
              Issued {{ invoice.issued }} by {{ invoice.owner }}. Two reminders sent.
            </tr>
          }
        }
      </tbody>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

const WIDE = `
  <div slTable [columns]="5" variant="framed" [stickyHeader]="sticky">
    <div slTableContent [scrollLabel]="'Invoices, scrollable'">
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader sticky="start" text="nowrap">Invoice</th>
          <th slTableColumnHeader text="nowrap">Client</th>
          <th slTableColumnHeader text="nowrap">Owner</th>
          <th slTableColumnHeader text="nowrap">Issued</th>
          <th slTableColumnHeader numeric text="nowrap">Amount</th>
        </tr>
      </thead>
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id + invoice.issued) {
          <tr slTableRow [value]="invoice.id + invoice.issued">
            <th slTableRowHeader sticky="start" text="nowrap">{{ invoice.id }}</th>
            <td slTableCell text="nowrap">{{ invoice.client }}</td>
            <td slTableCell text="nowrap">{{ invoice.owner }}</td>
            <td slTableCell text="nowrap">{{ invoice.issued }}</td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
          </tr>
        }
      </tbody>
    </div>
  </div>`;

export const Sticky: Story = {
  parameters: scenario('sticky'),
  render: () => ({
    props: { invoices: [...INVOICES, ...INVOICES], sticky: true },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'stickyHeader, and a column pinned at the start',
    'Scroll down and the header stays against the scroller rather than against the page. Scroll sideways and the pinned column darkens its edge, which is the affordance that appears exactly while something is hidden under it.',
    WIDE,
  )}
</div>`,
  }),
};

export const Scroll: Story = {
  parameters: scenario('scroll'),
  render: () => ({
    props: { invoices: INVOICES, sticky: false },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'A table wider than its box',
    'Tab into the page: the scroller takes a stop of its own, named, and the arrow keys scroll it. Widen the window until the table fits and the stop disappears, because a table that fits needs none.',
    WIDE,
  )}
</div>`,
  }),
};

export const Alignment: Story = {
  parameters: scenario('alignment'),
  render: () => ({
    props: { invoices: INVOICES },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'align, and numeric',
    'The first column stands at the start, the second in the middle, the third at the end, and the fourth is numeric: tabular figures, and the end edge inferred. Switch the toolbar to RTL and every one of them mirrors.',
    `
  <div slTable [columns]="4" variant="framed">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader>Client</th>
          <th slTableColumnHeader align="center">Region</th>
          <th slTableColumnHeader align="end">Issued</th>
          <th slTableColumnHeader numeric>Amount</th>
        </tr>
      </thead>
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id) {
          <tr slTableRow [value]="invoice.id">
            <td slTableCell>{{ invoice.client }}</td>
            <td slTableCell align="center">EU</td>
            <td slTableCell align="end">{{ invoice.issued }}</td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
          </tr>
        }
      </tbody>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const Text: Story = {
  parameters: scenario('text'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'text="wrap", "truncate" and "nowrap"',
    'The hash breaks inside its column rather than setting the column width. The note ends in an ellipsis with every character still in the DOM. The timestamp is never broken, because a broken date is a wrong date.',
    `
  <div slTable [columns]="3" variant="framed" layout="fixed">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader>Commit</th>
          <th slTableColumnHeader>Note</th>
          <th slTableColumnHeader>Recorded</th>
        </tr>
      </thead>
      <tbody slTableBody>
        <tr slTableRow value="commit">
          <td slTableCell text="wrap">9f2c1ab84de07615c3b9a0d5e8471fca2b6d09e3</td>
          <td slTableCell text="truncate">Quarterly reconciliation for the Northwind Trading account, prepared by the finance team and approved on the fourteenth.</td>
          <td slTableCell text="nowrap">12 Aug 2026, 09:41</td>
        </tr>
      </tbody>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const Footer: Story = {
  parameters: scenario('footer'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 3) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'A summary inside, a paginator under',
    'The total sits in a tfoot beside the column it totals, and the paging control sits in a bar outside the table and inside the frame — where it does not scroll sideways with the columns.',
    `
  <div slTable [columns]="4" variant="framed">
    <div slTableContent [totalRowCount]="128">
      ${HEAD}${BODY}
      <tfoot slTableSummary>
        <tr slTableRow>
          <td slTableCell [attr.colspan]="3">3 of 128 invoices</td>
          <td slTableCell numeric>11,061.25</td>
        </tr>
      </tfoot>
    </div>
    <div slTableFooter>
      <span>Page 1 of 43</span>
      <nav slPagination [count]="128" [pageSize]="3">
        <button slPaginationPrevious type="button"></button>
        <sl-pagination-items></sl-pagination-items>
        <button slPaginationNext type="button"></button>
      </nav>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const EmptyAndLoading: Story = {
  parameters: scenario('empty-and-loading'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 2) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'A first load',
    'Skeleton rows draw the table shape before its content, so the page does not jump when the rows arrive. Nothing here is announced: the rows are aria-hidden until they are real.',
    `
  <div slTable [columns]="4" variant="framed">
    <div slTableContent>${HEAD}
      <tbody slTableLoader [skeletonRows]="3"></tbody>
    </div>
  </div>`,
  )}
  ${scene(
    'A refresh over rows already read',
    'aria-busy on the table and the body dimmed: every column keeps its width and the reader keeps their place. Swapping these rows for skeletons would take both.',
    table('variant="framed" loading'),
  )}
  ${scene(
    'Nothing to show',
    'The empty cell spans the table and takes a result state, which already tells an empty set from a set a filter emptied — so this family owns no word for either.',
    `
  <div slTable [columns]="4" variant="framed">
    <div slTableContent>${HEAD}
      <tbody slTableBody>
        <tr slTableRow>
          <td slTableEmpty>
            <section slResultState status="no-results">
              <div slResultStateContent>
                <h3 slResultStateTitle>No invoices match this filter</h3>
              </div>
            </section>
          </td>
        </tr>
      </tbody>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const Density: Story = {
  parameters: scenario('density'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 2) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'comfortable, compact and dense',
    'Each region states its own density. The row height, the cell inset and the type step all come from the control scale, so one theme decision moves the rows, the buttons and the fields together.',
    `
  <div class="slotted-demo-stack">
    <div data-density="comfortable">${table('variant="framed"')}</div>
    <div data-density="compact">${table('variant="framed"')}</div>
    <div data-density="dense">${table('variant="framed"')}</div>
  </div>`,
  )}
</div>`,
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    props: { invoices: INVOICES },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'A cell is not a string',
    'The record name is a link, the status is a tag, and a translated header is twice as long as its English. The table is a grid of your own content, so every part holds what a record needs.',
    `
  <div slTable [columns]="4" variant="framed">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader>Rechnungsnummer</th>
          <th slTableColumnHeader>Auftraggeber</th>
          <th slTableColumnHeader>Zahlungsstatus</th>
          <th slTableColumnHeader numeric>Betrag</th>
        </tr>
      </thead>
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id) {
          <tr slTableRow [value]="invoice.id">
            <th slTableRowHeader><a slLink [href]="'#' + invoice.id">{{ invoice.id }}</a></th>
            <td slTableCell>{{ invoice.client }}</td>
            <td slTableCell><span slTag [tone]="invoice.tone"><span slTagBody>{{ invoice.status }}</span></span></td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
          </tr>
        }
      </tbody>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const Listing: Story = {
  parameters: scenario('listing'),
  render: () => ({
    props: { chosen: [], invoices: INVOICES, sort: null },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Everything at once',
    'Sorting, selection, a filter in a header, the identifier pinned at the start and the actions at the end, and a paging control in the footer. Every piece beside the table is another family, composed rather than built in.',
    `
  <div slTable [columns]="6" variant="framed" stickyHeader selectionMode="multiple" [(value)]="chosen" [(sort)]="sort">
    <div slTableContent [totalRowCount]="128">
      <thead slTableHead>
        <tr slTableRow>
          <th slTableSelectAll></th>
          <th slTableColumnHeader column="id" sticky="start" text="nowrap"><button slTableSort>Invoice</button></th>
          <th slTableColumnHeader column="client">
            <button slTableSort>Client</button>${FILTER}
          </th>
          <th slTableColumnHeader>Status</th>
          <th slTableColumnHeader column="amount" numeric><button slTableSort>Amount</button></th>
          <th slTableColumnHeader sticky="end" align="center">
            <span data-ui="visually-hidden" data-part="root">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id; let index = $index) {
          <tr slTableRow [value]="invoice.id" [rowIndex]="index + 1">
            <td slTableSelect></td>
            <th slTableRowHeader sticky="start" text="nowrap">{{ invoice.id }}</th>
            <td slTableCell text="nowrap">{{ invoice.client }}</td>
            <td slTableCell><span slTag [tone]="invoice.tone"><span slTagBody>{{ invoice.status }}</span></span></td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
            <td slTableCell sticky="end" align="center">
              <button slIconButton variant="ghost" tone="secondary" size="sm" type="button" [attr.aria-label]="'Actions for ' + invoice.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </td>
          </tr>
        }
      </tbody>
    </div>
    <div slTableFooter>
      <span>{{ chosen.length === 0 ? '4 of 128 invoices' : chosen.length + ' chosen' }}</span>
      <nav slPagination [count]="128" [pageSize]="4">
        <button slPaginationPrevious type="button"></button>
        <sl-pagination-items></sl-pagination-items>
        <button slPaginationNext type="button"></button>
      </nav>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 2) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Reaching the instance from the template',
    'exportAs gives the template the row, the table and the scroller: a row knows whether it is expanded, and the scroller can bring a record into view. provideTableDefaults sets the frame and the words once for the whole application.',
    `
  <div slTable [columns]="4" variant="framed" #table="slTable">
    <div slTableContent #content="slTableContent">${HEAD}${BODY}</div>
    <div slTableFooter>
      <span>{{ table.rows().length }} records in the DOM</span>
      <button type="button" (click)="content.scrollToRow('INV-1042')">Show INV-1042</button>
    </div>
  </div>`,
  )}
</div>`,
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: { chosen: [], invoices: INVOICES },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Tab, and nothing else to learn',
    'A table is not a composite widget, so each control is its own stop: the scroller, then every sort button, checkbox and expander in DOM order. Hold Shift with Space on a checkbox to take the range.',
    SELECTABLE,
  )}
</div>`,
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    props: { invoices: INVOICES.slice(0, 3) },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'A page of a larger set',
    'aria-rowcount says how large the whole set is and aria-rowindex says where each record sits in it, so row two of four is heard as row forty-two of a hundred and twenty-eight. Both are written only because this table states a total.',
    `
  <div slTable [columns]="4" variant="framed">
    <div slTableContent [totalRowCount]="128">
      <caption slTableCaption>Invoices, page 11 of 32</caption>${HEAD}
      <tbody slTableBody>
        @for (invoice of invoices; track invoice.id; let index = $index) {
          <tr slTableRow [value]="invoice.id" [rowIndex]="41 + index">
            <th slTableRowHeader>{{ invoice.id }}</th>
            <td slTableCell>{{ invoice.client }}</td>
            <td slTableCell>{{ invoice.status }}</td>
            <td slTableCell numeric>{{ invoice.amount }}</td>
          </tr>
        }
      </tbody>
    </div>
  </div>`,
  )}
</div>`,
  }),
};
