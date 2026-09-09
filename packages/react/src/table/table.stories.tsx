import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';

import { IconButton } from '../button';
import { Checkbox } from '../checkbox';
import { Link } from '../link';
import { Pagination, PaginationItems, PaginationNext, PaginationPrevious } from '../pagination';
import { Popover, PopoverBody, PopoverContent, PopoverLayer, PopoverTrigger } from '../popover';
import { ResultState, ResultStateContent, ResultStateTitle } from '../result-state';
import { Tag } from '../tag';
import { Table } from './table';
import { TableContent } from './table-content';
import { TableDefaultsProvider } from './table-defaults';
import {
  TableBody,
  TableCaption,
  TableCell,
  TableColumnActions,
  TableColumnHeader,
  TableDetail,
  TableEmpty,
  TableExpander,
  TableFooter,
  TableHead,
  TableLoader,
  TableRow,
  TableRowHeader,
  TableSelect,
  TableSelectAll,
  TableSort,
  TableSummary,
} from './table-parts';
import type { TableSortDescriptor } from './table.types';
import { REACT_TABLE_DOCS, REACT_TABLE_TOKENS } from './table.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_TABLE_DOCS.table.scenes, {
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

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Table',
        description:
          'The platform tabular structure, with sorting, selection, expansion and a place for a paging control. The listing screen of a dense application.',
        framework: 'React',
        ...REACT_TABLE_DOCS.table,
        tokens: REACT_TABLE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Invoice {
  amount: number;
  client: string;
  id: string;
  issued: string;
  owner: string;
  status: 'Paid' | 'Overdue' | 'Draft';
}

const INVOICES: Invoice[] = [
  {
    amount: 1240,
    client: 'Northwind Trading',
    id: 'INV-1042',
    issued: '12 Aug',
    owner: 'A. Marchetti',
    status: 'Paid',
  },
  {
    amount: 18.5,
    client: 'Cascade Logistics',
    id: 'INV-1043',
    issued: '19 Aug',
    owner: 'P. Okonkwo',
    status: 'Overdue',
  },
  {
    amount: 9802.75,
    client: 'Bright Harbor',
    id: 'INV-1044',
    issued: '28 Aug',
    owner: 'L. Ferreira',
    status: 'Draft',
  },
  {
    amount: 430,
    client: 'Halcyon Press',
    id: 'INV-1045',
    issued: '3 Sep',
    owner: 'S. Nakamura',
    status: 'Paid',
  },
];

const MONEY = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2 });

const TONE = { Draft: 'secondary', Overdue: 'danger', Paid: 'success' } as const;

/**
 * The artwork the demonstrations put in a trigger. It is authored here rather
 * than imported, because a story is the one place a consumer supplies their own
 * mark: the family sizes what stands in its slot and draws none of it.
 */
function Funnel() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  );
}

function Ellipsis() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

/**
 * Every stage here is `block`: the table fills the box it is given, and a stage
 * that shrink-wrapped it would report a width no consumer imposes.
 */
function Scene({
  children,
  label,
  note,
}: {
  children: React.ReactNode;
  label: string;
  note: string;
}) {
  return (
    <section className="slotted-demo-scene">
      <header className="slotted-demo-scene__header">
        <span className="slotted-demo-scene__label">{label}</span>
        <span className="slotted-demo-scene__note">{note}</span>
      </header>
      <div className="slotted-demo-stage" data-align="start" data-layout="block">
        {children}
      </div>
    </section>
  );
}

/** The descriptor applied to your own array, which is the whole of client sorting. */
function sortRows(rows: readonly Invoice[], sort: TableSortDescriptor | null): readonly Invoice[] {
  if (sort === null) return rows;
  const direction = sort.direction === 'ascending' ? 1 : -1;
  return [...rows].sort((left, right) => {
    const a = left[sort.column as keyof Invoice];
    const b = right[sort.column as keyof Invoice];
    if (typeof a === 'number' && typeof b === 'number') return (a - b) * direction;
    return String(a).localeCompare(String(b)) * direction;
  });
}

function Invoices({
  rows = INVOICES,
  ...props
}: React.ComponentProps<typeof Table> & { rows?: readonly Invoice[] }) {
  return (
    <Table columns={4} {...props}>
      <TableContent>
        <TableCaption>Invoices issued this quarter</TableCaption>
        <TableHead>
          <TableRow>
            <TableColumnHeader>Invoice</TableColumnHeader>
            <TableColumnHeader>Client</TableColumnHeader>
            <TableColumnHeader>Status</TableColumnHeader>
            <TableColumnHeader numeric>Amount</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((invoice) => (
            <TableRow key={invoice.id} value={invoice.id}>
              <TableRowHeader>{invoice.id}</TableRowHeader>
              <TableCell>{invoice.client}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}

export const Playground: Story = {
  args: { layout: 'auto', striped: false, variant: 'ruled' },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Invoices {...args} />
    </div>
  ),
};

export const Variant: Story = {
  parameters: scenario('variant'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label='variant="plain"'
        note="No frame and no rules: the form that belongs inside a card, where the card already draws the box and a second edge would be two boxes."
      >
        <Invoices variant="plain" rows={INVOICES.slice(0, 2)} />
      </Scene>
      <Scene
        label='variant="ruled"'
        note="The default. A hairline between records and none around the set, so a table in a page of prose reads as a table rather than as a panel."
      >
        <Invoices variant="ruled" rows={INVOICES.slice(0, 2)} />
      </Scene>
      <Scene
        label='variant="framed"'
        note="The set is one object: a border, a radius that clips the corners, and the footer bar inside it. This is the listing screen form."
      >
        <Invoices variant="framed" rows={INVOICES.slice(0, 2)} />
      </Scene>
    </div>
  ),
};

export const Striped: Story = {
  parameters: scenario('striped'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="striped"
        note="Mixed from the ink at five per cent, one step under the header band, so the stripe carries the eye across a wide row without becoming a second header."
      >
        <Invoices striped variant="framed" />
      </Scene>
      <Scene
        label="striped, with a record chosen"
        note="Every state is painted over the stripe rather than under it: the second record is striped and chosen, and it reads as chosen."
      >
        <Invoices defaultValue={['INV-1043']} selectionMode="multiple" striped variant="framed">
          {null}
        </Invoices>
      </Scene>
    </div>
  ),
};

function SortingDemo() {
  const [sort, setSort] = useState<TableSortDescriptor | null>({
    column: 'client',
    direction: 'ascending',
  });
  const rows = useMemo(() => sortRows(INVOICES, sort), [sort]);

  return (
    <Table columns={3} onSortChange={setSort} sort={sort} variant="framed">
      <TableContent>
        <TableHead>
          <TableRow>
            <TableColumnHeader column="id">
              <TableSort>Invoice</TableSort>
            </TableColumnHeader>
            <TableColumnHeader column="client">
              <TableSort>Client</TableSort>
            </TableColumnHeader>
            <TableColumnHeader column="amount" numeric>
              <TableSort>Amount</TableSort>
            </TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((invoice) => (
            <TableRow key={invoice.id} value={invoice.id}>
              <TableRowHeader>{invoice.id}</TableRowHeader>
              <TableCell>{invoice.client}</TableCell>
              <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}

export const Sorting: Story = {
  parameters: scenario('sorting'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Three presses, three answers"
        note="Ascending, then descending, then none — the third state a reader who sorted by accident needs. The mark is drawn on the sorted column and revealed on the others under the pointer or under focus."
      >
        <SortingDemo />
      </Scene>
    </div>
  ),
};

/**
 * The trigger, the surface it opens and the rules it applies are three
 * different owners. This family holds the place; `popover` holds the layer, its
 * dismissal and its focus; and the rules are the consumer's own state — which
 * is what makes the demonstration a demonstration rather than a dead button.
 */
function StatusFilter({
  chosen,
  onChange,
}: {
  chosen: readonly string[];
  onChange: (next: readonly string[]) => void;
}) {
  return (
    <Popover portal={false}>
      <PopoverTrigger
        render={(triggerProps) => (
          <button {...triggerProps} aria-label="Filter by status" type="button">
            <Funnel />
          </button>
        )}
      />
      <PopoverLayer>
        <PopoverContent aria-label="Filter by status">
          <PopoverBody>
            {(['Paid', 'Overdue', 'Draft'] as const).map((status) => (
              <Checkbox
                checked={chosen.includes(status)}
                key={status}
                onCheckedChange={(checked) =>
                  onChange(checked ? [...chosen, status] : chosen.filter((held) => held !== status))
                }
              >
                {status}
              </Checkbox>
            ))}
          </PopoverBody>
        </PopoverContent>
      </PopoverLayer>
    </Popover>
  );
}

function ColumnControlsDemo() {
  const [statuses, setStatuses] = useState<readonly string[]>([]);
  const rows = useMemo(
    () =>
      statuses.length === 0
        ? INVOICES
        : INVOICES.filter((invoice) => statuses.includes(invoice.status)),
    [statuses],
  );

  return (
    <Table columns={3} variant="framed">
      <TableContent>
        <TableHead>
          <TableRow>
            <TableColumnHeader column="id">
              <TableSort>Invoice</TableSort>
            </TableColumnHeader>
            <TableColumnHeader>Client</TableColumnHeader>
            <TableColumnHeader>
              Status
              <TableColumnActions>
                <StatusFilter chosen={statuses} onChange={setStatuses} />
              </TableColumnActions>
            </TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableEmpty>No invoices match this filter</TableEmpty>
            </TableRow>
          ) : (
            rows.map((invoice) => (
              <TableRow key={invoice.id} value={invoice.id}>
                <TableRowHeader>{invoice.id}</TableRowHeader>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>
                  <Tag tone={TONE[invoice.status]}>{invoice.status}</Tag>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContent>
    </Table>
  );
}

export const ColumnControls: Story = {
  parameters: scenario('column-controls'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="A column that sorts, and a column that filters"
        note="Press the funnel: the trigger opens a Popover, the checkboxes are your own state, and the rows below answer them. The header that sorts answers the pointer with a ground; the one that only carries a filter does not, because it is not a target."
      >
        <ColumnControlsDemo />
      </Scene>
    </div>
  ),
};

function SelectionDemo() {
  const [chosen, setChosen] = useState<readonly string[]>(['INV-1043']);

  return (
    <Table
      columns={4}
      onValueChange={setChosen}
      selectionMode="multiple"
      value={chosen}
      variant="framed"
    >
      <TableContent>
        <TableHead>
          <TableRow>
            <TableSelectAll />
            <TableColumnHeader>Invoice</TableColumnHeader>
            <TableColumnHeader>Client</TableColumnHeader>
            <TableColumnHeader numeric>Amount</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {INVOICES.map((invoice) => (
            <TableRow disabled={invoice.status === 'Draft'} key={invoice.id} value={invoice.id}>
              <TableSelect />
              <TableRowHeader>{invoice.id}</TableRowHeader>
              <TableCell>{invoice.client}</TableCell>
              <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
      <TableFooter>
        <span>{chosen.length} chosen</span>
      </TableFooter>
    </Table>
  );
}

export const Selection: Story = {
  parameters: scenario('selection'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Shift takes the span between"
        note="Press one checkbox, then hold Shift and press another: everything between the two joins the set. The draft record is disabled, so it stays out of the set the header covers."
      >
        <SelectionDemo />
      </Scene>
    </div>
  ),
};

function ExpansionDemo() {
  return (
    <Table columns={4} defaultExpanded={['INV-1043']} variant="framed">
      <TableContent>
        <TableHead>
          <TableRow>
            <TableColumnHeader />
            <TableColumnHeader>Invoice</TableColumnHeader>
            <TableColumnHeader>Client</TableColumnHeader>
            <TableColumnHeader numeric>Amount</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {INVOICES.slice(0, 3).map((invoice) => (
            <>
              <TableRow key={invoice.id} value={invoice.id}>
                <TableCell>
                  <TableExpander />
                </TableCell>
                <TableRowHeader>{invoice.id}</TableRowHeader>
                <TableCell>{invoice.client}</TableCell>
                <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
              </TableRow>
              <TableDetail key={`${invoice.id}-detail`} value={invoice.id}>
                Issued {invoice.issued} by {invoice.owner}. Two reminders sent.
              </TableDetail>
            </>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}

export const Expansion: Story = {
  parameters: scenario('expansion'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="A record with more to say"
        note="The expander sits in a gutter of its own, so every identifier stands in one column whether or not its record has a detail. A closed detail is not in the DOM at all."
      >
        <ExpansionDemo />
      </Scene>
    </div>
  ),
};

function Wide({ children, ...props }: React.ComponentProps<typeof Table>) {
  return (
    <Table columns={5} variant="framed" {...props}>
      <TableContent scrollProps={{ style: { maxBlockSize: '12rem' } }}>
        <TableHead>
          <TableRow>
            <TableColumnHeader sticky="start" text="nowrap">
              Invoice
            </TableColumnHeader>
            <TableColumnHeader text="nowrap">Client</TableColumnHeader>
            <TableColumnHeader text="nowrap">Owner</TableColumnHeader>
            <TableColumnHeader text="nowrap">Issued</TableColumnHeader>
            <TableColumnHeader numeric text="nowrap">
              Amount
            </TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...INVOICES, ...INVOICES].map((invoice, index) => (
            <TableRow key={`${invoice.id}-${index}`} value={`${invoice.id}-${index}`}>
              <TableRowHeader sticky="start" text="nowrap">
                {invoice.id}
              </TableRowHeader>
              <TableCell text="nowrap">{invoice.client}</TableCell>
              <TableCell text="nowrap">{invoice.owner}</TableCell>
              <TableCell text="nowrap">{invoice.issued}</TableCell>
              <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
      {children}
    </Table>
  );
}

export const Sticky: Story = {
  parameters: scenario('sticky'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="stickyHeader, and a column pinned at the start"
        note="Scroll down and the header stays against the scroller rather than against the page. Scroll sideways and the pinned column darkens its edge, which is the affordance that appears exactly while something is hidden under it."
      >
        <Wide stickyHeader />
      </Scene>
    </div>
  ),
};

export const Scroll: Story = {
  parameters: scenario('scroll'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="A table wider than its box"
        note="Tab into the page: the scroller takes a stop of its own, named, and the arrow keys scroll it. Widen the window until the table fits and the stop disappears, because a table that fits needs none."
      >
        <Wide />
      </Scene>
    </div>
  ),
};

export const Alignment: Story = {
  parameters: scenario('alignment'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="align, and numeric"
        note="The first column stands at the start, the second in the middle, the third at the end, and the fourth is numeric: tabular figures, and the end edge inferred. Switch the toolbar to RTL and every one of them mirrors."
      >
        <Table columns={4} variant="framed">
          <TableContent>
            <TableHead>
              <TableRow>
                <TableColumnHeader>Client</TableColumnHeader>
                <TableColumnHeader align="center">Region</TableColumnHeader>
                <TableColumnHeader align="end">Issued</TableColumnHeader>
                <TableColumnHeader numeric>Amount</TableColumnHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.map((invoice) => (
                <TableRow key={invoice.id} value={invoice.id}>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell align="center">EU</TableCell>
                  <TableCell align="end">{invoice.issued}</TableCell>
                  <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContent>
        </Table>
      </Scene>
    </div>
  ),
};

export const Text: Story = {
  parameters: scenario('text'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label='text="wrap", "truncate" and "nowrap"'
        note="The hash breaks inside its column rather than setting the column width. The note ends in an ellipsis with every character still in the DOM. The timestamp is never broken, because a broken date is a wrong date."
      >
        <Table columns={3} layout="fixed" variant="framed">
          <TableContent>
            <TableHead>
              <TableRow>
                <TableColumnHeader>Commit</TableColumnHeader>
                <TableColumnHeader>Note</TableColumnHeader>
                <TableColumnHeader>Recorded</TableColumnHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow value="commit">
                <TableCell text="wrap">9f2c1ab84de07615c3b9a0d5e8471fca2b6d09e3</TableCell>
                <TableCell text="truncate">
                  Quarterly reconciliation for the Northwind Trading account, prepared by the
                  finance team and approved on the fourteenth.
                </TableCell>
                <TableCell text="nowrap">12 Aug 2026, 09:41</TableCell>
              </TableRow>
            </TableBody>
          </TableContent>
        </Table>
      </Scene>
    </div>
  ),
};

export const Footer: Story = {
  parameters: scenario('footer'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="A summary inside, a paginator under"
        note="The total sits in a tfoot beside the column it totals, and the paging control sits in a bar outside the table and inside the frame — where it does not scroll sideways with the columns."
      >
        <Table columns={3} variant="framed">
          <TableContent totalRowCount={128}>
            <TableHead>
              <TableRow>
                <TableColumnHeader>Invoice</TableColumnHeader>
                <TableColumnHeader>Client</TableColumnHeader>
                <TableColumnHeader numeric>Amount</TableColumnHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.slice(0, 3).map((invoice, index) => (
                <TableRow key={invoice.id} rowIndex={index + 1} value={invoice.id}>
                  <TableRowHeader>{invoice.id}</TableRowHeader>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableSummary>
              <TableRow>
                <TableCell colSpan={2}>3 of 128 invoices</TableCell>
                <TableCell numeric>{MONEY.format(11061.25)}</TableCell>
              </TableRow>
            </TableSummary>
          </TableContent>
          <TableFooter>
            <span>Page 1 of 43</span>
            <Pagination count={128} defaultPage={1} pageSize={3}>
              <PaginationPrevious />
              <PaginationItems />
              <PaginationNext />
            </Pagination>
          </TableFooter>
        </Table>
      </Scene>
    </div>
  ),
};

export const EmptyAndLoading: Story = {
  parameters: scenario('empty-and-loading'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="A first load"
        note="Skeleton rows draw the table shape before its content, so the page does not jump when the rows arrive. Nothing here is announced: the rows are aria-hidden until they are real."
      >
        <Table columns={3} variant="framed">
          <TableContent>
            <TableHead>
              <TableRow>
                <TableColumnHeader>Invoice</TableColumnHeader>
                <TableColumnHeader>Client</TableColumnHeader>
                <TableColumnHeader numeric>Amount</TableColumnHeader>
              </TableRow>
            </TableHead>
            <TableLoader skeletonRows={3} />
          </TableContent>
        </Table>
      </Scene>
      <Scene
        label="A refresh over rows already read"
        note="aria-busy on the table and the body dimmed: every column keeps its width and the reader keeps their place. Swapping these rows for skeletons would take both."
      >
        <Invoices loading rows={INVOICES.slice(0, 2)} variant="framed" />
      </Scene>
      <Scene
        label="Nothing to show"
        note="The empty cell spans the table and takes a ResultState, which already tells an empty set from a set a filter emptied — so this family owns no word for either."
      >
        <Table columns={3} variant="framed">
          <TableContent>
            <TableHead>
              <TableRow>
                <TableColumnHeader>Invoice</TableColumnHeader>
                <TableColumnHeader>Client</TableColumnHeader>
                <TableColumnHeader numeric>Amount</TableColumnHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableEmpty>
                  <ResultState status="no-results">
                    <ResultStateContent>
                      <ResultStateTitle>No invoices match this filter</ResultStateTitle>
                    </ResultStateContent>
                  </ResultState>
                </TableEmpty>
              </TableRow>
            </TableBody>
          </TableContent>
        </Table>
      </Scene>
    </div>
  ),
};

export const Density: Story = {
  parameters: scenario('density'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="comfortable, compact and dense"
        note="Each region states its own density. The row height, the cell inset and the type step all come from the control scale, so one theme decision moves the rows, the buttons and the fields together."
      >
        <div className="slotted-demo-stack">
          {(['comfortable', 'compact', 'dense'] as const).map((density) => (
            <div data-density={density} key={density}>
              <Invoices rows={INVOICES.slice(0, 2)} variant="framed" />
            </div>
          ))}
        </div>
      </Scene>
    </div>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="A cell is not a string"
        note="The record name is a Link, the status is a Tag, and a translated header is twice as long as its English. The table is a grid of your own content, so every part holds what a record needs."
      >
        <Table columns={4} variant="framed">
          <TableContent>
            <TableHead>
              <TableRow>
                <TableColumnHeader>Rechnungsnummer</TableColumnHeader>
                <TableColumnHeader>Auftraggeber</TableColumnHeader>
                <TableColumnHeader>Zahlungsstatus</TableColumnHeader>
                <TableColumnHeader numeric>Betrag</TableColumnHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.map((invoice) => (
                <TableRow key={invoice.id} value={invoice.id}>
                  <TableRowHeader>
                    <Link href={`#${invoice.id}`}>{invoice.id}</Link>
                  </TableRowHeader>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>
                    <Tag tone={TONE[invoice.status]}>{invoice.status}</Tag>
                  </TableCell>
                  <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContent>
        </Table>
      </Scene>
    </div>
  ),
};

function ListingDemo() {
  const [chosen, setChosen] = useState<readonly string[]>([]);
  const [sort, setSort] = useState<TableSortDescriptor | null>(null);
  const rows = useMemo(() => sortRows(INVOICES, sort), [sort]);

  return (
    <Table
      columns={6}
      onSortChange={setSort}
      onValueChange={setChosen}
      selectionMode="multiple"
      sort={sort}
      stickyHeader
      value={chosen}
      variant="framed"
    >
      <TableContent totalRowCount={128}>
        <TableHead>
          <TableRow>
            <TableSelectAll />
            <TableColumnHeader column="id" sticky="start" text="nowrap">
              <TableSort>Invoice</TableSort>
            </TableColumnHeader>
            <TableColumnHeader column="client">
              <TableSort>Client</TableSort>
              <TableColumnActions>
                <button aria-label="Filter by client" type="button">
                  <Funnel />
                </button>
              </TableColumnActions>
            </TableColumnHeader>
            <TableColumnHeader>Status</TableColumnHeader>
            <TableColumnHeader column="amount" numeric>
              <TableSort>Amount</TableSort>
            </TableColumnHeader>
            <TableColumnHeader align="center" sticky="end">
              <span data-ui="visually-hidden">Actions</span>
            </TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((invoice, index) => (
            <TableRow key={invoice.id} rowIndex={index + 1} value={invoice.id}>
              <TableSelect />
              <TableRowHeader sticky="start" text="nowrap">
                {invoice.id}
              </TableRowHeader>
              <TableCell text="nowrap">{invoice.client}</TableCell>
              <TableCell>
                <Tag tone={TONE[invoice.status]}>{invoice.status}</Tag>
              </TableCell>
              <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
              <TableCell align="center" sticky="end">
                <IconButton
                  aria-label={`Actions for ${invoice.id}`}
                  size="sm"
                  tone="secondary"
                  variant="ghost"
                >
                  <Ellipsis />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
      <TableFooter>
        <span>{chosen.length === 0 ? '4 of 128 invoices' : `${chosen.length} chosen`}</span>
        <Pagination count={128} defaultPage={1} pageSize={4}>
          <PaginationPrevious />
          <PaginationItems />
          <PaginationNext />
        </Pagination>
      </TableFooter>
    </Table>
  );
}

export const Listing: Story = {
  parameters: scenario('listing'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Everything at once"
        note="Sorting, selection, a filter in a header, the identifier pinned at the start and the actions at the end, and a paging control in the footer. Every piece beside the table is another family, composed rather than built in."
      >
        <ListingDemo />
      </Scene>
    </div>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="An application deciding once"
        note="The provider sets the frame and the words for everything below it. The second table states its own variant, and an explicit prop is never overridden by context."
      >
        <TableDefaultsProvider striped variant="framed">
          <div className="slotted-demo-stack">
            <Invoices rows={INVOICES.slice(0, 2)} />
            <Invoices rows={INVOICES.slice(0, 2)} variant="plain" />
          </div>
        </TableDefaultsProvider>
      </Scene>
    </div>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Tab, and nothing else to learn"
        note="A table is not a composite widget, so each control is its own stop: the scroller, then every sort button, checkbox and expander in DOM order. Hold Shift with Space on a checkbox to take the range."
      >
        <SelectionDemo />
      </Scene>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="A page of a larger set"
        note="aria-rowcount says how large the whole set is and aria-rowindex says where each record sits in it, so row two of four is heard as row forty-two of a hundred and twenty-eight. Both are written only because this table states a total."
      >
        <Table columns={3} variant="framed">
          <TableContent totalRowCount={128}>
            <TableCaption>Invoices, page 11 of 32</TableCaption>
            <TableHead>
              <TableRow>
                <TableColumnHeader>Invoice</TableColumnHeader>
                <TableColumnHeader>Client</TableColumnHeader>
                <TableColumnHeader numeric>Amount</TableColumnHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.slice(0, 3).map((invoice, index) => (
                <TableRow key={invoice.id} rowIndex={41 + index} value={invoice.id}>
                  <TableRowHeader>{invoice.id}</TableRowHeader>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell numeric>{MONEY.format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContent>
        </Table>
      </Scene>
    </div>
  ),
};
