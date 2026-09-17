import type { FilterGroup } from '@slotted/core/filter';
import {
  emptyQuery,
  parseColumnState,
  serializeColumnState,
  withColumnFilter,
  withFilter,
  withPageIndex,
  withSearch,
  type GridCell,
  type GridColumn,
  type GridColumnState,
  type GridQuery,
  type GridRange,
} from '@slotted/core/grid';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Badge } from '../badge';
import { Button } from '../button';
import { FilterBar } from '../filter-bar';
import { Pagination, PaginationItems, PaginationNext, PaginationPrevious } from '../pagination';
import { Text } from '../typography';
import { TextField } from '../text-field';
import { DataGrid } from './data-grid';
import { DataGridDefaultsProvider } from './data-grid-defaults';
import { REACT_DATA_GRID_DOCS, REACT_DATA_GRID_TOKENS } from './data-grid.docs';
import type { DataGridHandle, DataGridProps } from './data-grid.types';

/* ── The domain: shipments ─────────────────────────────────────────────── */

interface Shipment {
  id: string;
  customer: string;
  destination: string;
  carrier: string;
  weight: number | null;
  status: string;
  shipped: string;
  eta: string;
  cost: number;
  priority: boolean;
}

const CUSTOMERS = [
  'Aurora Textiles',
  'Bloom & Co.',
  'Nordwind Logistik GmbH',
  'Casa Verde',
  'Helios Solar',
  'Ondina Marine',
  'Sociedade Portuguesa de Distribuição Farmacêutica e Logística Hospitalar, Lda.',
  'Kestrel Aerospace',
  'Zafiro Cerámica',
  'Mól & Fils',
  'Vesta Foods',
  'Ærøskøbing Bryggeri',
];
const DESTINATIONS = [
  'Porto, PT',
  'Lyon, FR',
  'Hamburg, DE',
  'Sevilla, ES',
  'Athens, GR',
  'Genova, IT',
  'Vila Nova de Gaia, PT',
  'Reykjavík, IS',
  'Kraków, PL',
  'Dublin, IE',
];
const CARRIERS = ['DHL', 'UPS', 'FedEx', 'Maersk', 'DB Schenker'];
const STATUSES = ['In transit', 'Delivered', 'Delayed', 'Customs', 'Returned'];

/** A deterministic generator, so every render of a scene is the same picture. */
function shipments(count: number, seed = 7): Shipment[] {
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)]!;
  return Array.from({ length: count }, (_unused, index) => {
    const day = 1 + Math.floor(random() * 28);
    const hour = Math.floor(random() * 24);
    const weight = random() < 0.06 ? null : Math.round(random() * 20000) / 10;
    return {
      id: `SHP-${20481 + index}`,
      customer: pick(CUSTOMERS),
      destination: pick(DESTINATIONS),
      carrier: pick(CARRIERS),
      weight,
      status: pick(STATUSES),
      shipped: `2026-09-${String(day).padStart(2, '0')}`,
      eta: `2026-09-${String(Math.min(28, day + 3 + Math.floor(random() * 6))).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00`,
      cost: Math.round((weight ?? 40) * (4 + random() * 8) * 100) / 100,
      priority: random() < 0.3,
    };
  });
}

const EIGHT = shipments(8);
const FIFTY = shipments(50);
const TEN_THOUSAND = shipments(10_000, 3);

const money = (value: unknown) =>
  typeof value === 'number'
    ? `€ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '';
const kilograms = (value: unknown) =>
  typeof value === 'number'
    ? `${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`
    : '—';

const StatusBadge = ({ status }: { status: string }) => (
  <Badge
    tone={
      status === 'Delivered'
        ? 'success'
        : status === 'Delayed'
          ? 'danger'
          : status === 'Customs'
            ? 'warning'
            : 'secondary'
    }
    variant="soft"
  >
    {status}
  </Badge>
);

const columns: GridColumn<Shipment>[] = [
  { id: 'id', label: 'Tracking', rowHeader: true, width: 132, text: 'nowrap' },
  { id: 'customer', label: 'Customer', width: 200, editable: true },
  { id: 'destination', label: 'Destination', width: 160, editable: true },
  {
    id: 'carrier',
    label: 'Carrier',
    kind: 'set',
    width: 130,
    options: CARRIERS.map((value) => ({ value, label: value })),
    editable: true,
  },
  {
    id: 'weight',
    label: 'Weight',
    kind: 'number',
    width: 120,
    format: kilograms,
    aggregate: 'sum',
    editable: true,
    validate: (value) =>
      typeof value === 'number' && value < 0 ? 'A weight is not negative' : null,
  },
  {
    id: 'status',
    label: 'Status',
    kind: 'set',
    width: 130,
    options: STATUSES.map((value) => ({ value, label: value })),
  },
  { id: 'shipped', label: 'Shipped', kind: 'date', width: 150 },
  { id: 'eta', label: 'ETA', kind: 'datetime', width: 210 },
  { id: 'cost', label: 'Cost', kind: 'number', width: 130, format: money, aggregate: 'sum' },
  { id: 'priority', label: 'Priority', kind: 'boolean', width: 100 },
];

const withStatusBadges = {
  status: ({ value }: { value: unknown }) => <StatusBadge status={String(value)} />,
};

/* ── Scaffolding ───────────────────────────────────────────────────────── */

const Scene = ({ children, label, note }: { children: ReactNode; label: string; note: string }) => (
  <section className="slotted-demo-scene">
    <header className="slotted-demo-scene__header">
      <span className="slotted-demo-scene__label">{label}</span>
      <span className="slotted-demo-scene__note">{note}</span>
    </header>
    <div className="slotted-demo-stage" data-layout="block">
      {children}
    </div>
  </section>
);

/**
 * A grid owns a screen's worth of decisions, and its picture depends on its
 * width: it stands on a stage, in a desktop-wide room, in a screen- or
 * card-sized viewport, and takes the viewport's height. What a demonstration
 * says beside the grid — a status line, a control — stands on the same stage
 * above the room, so the stage owns the gap between the two.
 */
const Screen = ({
  before,
  children,
  size = 'screen',
}: {
  before?: ReactNode;
  children: ReactNode;
  size?: 'screen' | 'tall';
}) => (
  <div className="slotted-demo-stage" data-layout="block">
    {before}
    <div className="slotted-demo-room" data-room="desktop">
      <div className="slotted-demo-viewport" data-size={size}>
        {children}
      </div>
    </div>
  </div>
);

const Shipments = (props: Partial<DataGridProps<Shipment>>) => (
  <DataGrid<Shipment>
    cellRenderers={withStatusBadges}
    columns={columns}
    height="100%"
    label="Shipments"
    rowKey="id"
    rows={FIFTY}
    variant="framed"
    {...props}
  />
);

/* ── Stories ───────────────────────────────────────────────────────────── */

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_DATA_GRID_DOCS.dataGrid.scenes, {
    accessibility: Accessibility,
    activation: Activation,
    'column-groups': ColumnGroups,
    'column-menu': ColumnMenu,
    'column-state': ColumnState,
    columns: Columns,
    content: Content,
    density: Density,
    detail: Detail,
    editing: Editing,
    'editing-row': EditingRow,
    'empty-and-loading': EmptyAndLoading,
    'filter-bar': WithFilterBar,
    'filter-panel': FilterPanel,
    'filter-row': FilterRow,
    grouping: Grouping,
    keyboard: Keyboard,
    'load-more': LoadMore,
    pagination: PaginationScene,
    pinning: Pinning,
    playground: Playground,
    range: Range,
    reorder: Reorder,
    resize: Resize,
    search: Search,
    selection: Selection,
    server: Server,
    sorting: Sorting,
    summary: Summary,
    text: TextTreatment,
    validation: Validation,
    variant: Variant,
    virtualization: Virtualization,
  });

const meta = {
  title: 'Components/Data grid',
  args: { columns, rowKey: 'id', rows: FIFTY } as never,
  component: DataGrid,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Data grid',
        description:
          'The composite widget for large, interactive tabular data: one cursor over every cell, a query the grid applies or a server answers, columns the reader arranges, and editing in place.',
        framework: 'React',
        ...REACT_DATA_GRID_DOCS.dataGrid,
        tokens: REACT_DATA_GRID_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    selectionMode: 'multiple',
    striped: false,
    variant: 'framed',
    filterRow: false,
    editMode: 'cell',
  } as never,
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <Screen>
      <Shipments {...(args as Partial<DataGridProps<Shipment>>)} />
    </Screen>
  ),
};

export const Columns: Story = {
  parameters: scenario('columns'),
  render: () => (
    <Screen size="tall">
      <Shipments rows={EIGHT} />
    </Screen>
  ),
};

export const ColumnGroups: Story = {
  parameters: scenario('column-groups'),
  render: () => (
    <Screen size="tall">
      <Shipments
        columnGroups={[
          { id: 'shipment', label: 'Shipment', columns: ['id', 'customer', 'destination'] },
          { id: 'timing', label: 'Timing', columns: ['shipped', 'eta'] },
          { id: 'money', label: 'Charges', columns: ['weight', 'cost'] },
        ]}
        rows={EIGHT}
      />
    </Screen>
  ),
};

const SortingDemo = () => {
  const [query, setQuery] = useState<GridQuery>({
    ...emptyQuery(),
    sort: [
      { column: 'carrier', direction: 'ascending' },
      { column: 'weight', direction: 'descending' },
    ],
  });
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          Order: {query.sort.map((key) => `${key.column} ${key.direction}`).join(', ') || 'none'}
        </Text>
      }
    >
      <Shipments onQueryChange={setQuery} query={query} rows={FIFTY.slice(0, 12)} />{' '}
    </Screen>
  );
};

export const Sorting: Story = { parameters: scenario('sorting'), render: () => <SortingDemo /> };

export const FilterPanel: Story = {
  parameters: scenario('filter-panel'),
  render: () => (
    <Screen size="tall">
      <Shipments
        defaultCurrent={{ row: 'header', column: 'customer' }}
        defaultQuery={
          withColumnFilter(emptyQuery(), 'customer', {
            kind: 'text',
            join: 'or',
            conditions: [
              { operator: 'contains', value: 'nord' },
              { operator: 'startsWith', value: 'B' },
            ],
          }).query
        }
      />
    </Screen>
  ),
};

export const FilterRow: Story = {
  parameters: scenario('filter-row'),
  render: () => (
    <Screen>
      <Shipments
        defaultQuery={
          withColumnFilter(emptyQuery(), 'status', {
            kind: 'set',
            join: 'and',
            conditions: [{ operator: 'anyOf', value: ['Delayed', 'Customs'] }],
          }).query
        }
        filterRow
      />
    </Screen>
  ),
};

const FilterBarDemo = () => {
  const [query, setQuery] = useState<GridQuery>(
    withColumnFilter(emptyQuery(), 'carrier', {
      kind: 'set',
      join: 'and',
      conditions: [{ operator: 'anyOf', value: ['DHL', 'UPS'] }],
    }).query,
  );
  return (
    <Screen
      size="tall"
      before={
        <FilterBar
          fields={[
            { key: 'customer', label: 'Customer', kind: 'text' },
            {
              key: 'carrier',
              label: 'Carrier',
              kind: 'set',
              options: CARRIERS.map((value) => ({ value, label: value })),
            },
            {
              key: 'status',
              label: 'Status',
              kind: 'set',
              options: STATUSES.map((value) => ({ value, label: value })),
            },
            { key: 'weight', label: 'Weight', kind: 'number' },
            { key: 'shipped', label: 'Shipped', kind: 'date' },
          ]}
          onQueryChange={(text) => setQuery(withSearch(query, text).query)}
          onValueChange={(filter: FilterGroup | null) => setQuery(withFilter(query, filter).query)}
          query={query.search}
          value={query.filter}
        />
      }
    >
      <Shipments onQueryChange={setQuery} query={query} />{' '}
    </Screen>
  );
};

export const WithFilterBar: Story = {
  parameters: scenario('filter-bar'),
  render: () => <FilterBarDemo />,
};

const SearchDemo = () => {
  const [query, setQuery] = useState<GridQuery>({ ...emptyQuery(), search: 'gaia' });
  return (
    <Screen
      size="tall"
      before={
        <TextField
          aria-label="Search shipments"
          onValueChange={(text) => setQuery(withSearch(query, text).query)}
          placeholder="Search shipments"
          value={query.search}
        />
      }
    >
      <Shipments onQueryChange={setQuery} query={query} />{' '}
    </Screen>
  );
};

export const Search: Story = { parameters: scenario('search'), render: () => <SearchDemo /> };

const SelectionDemo = () => {
  const [value, setValue] = useState<string | readonly string[] | null>(['SHP-20482', 'SHP-20483']);
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          Selected: {Array.isArray(value) ? value.join(', ') || 'nothing' : String(value)}
        </Text>
      }
    >
      <Shipments
        onValueChange={setValue}
        rows={FIFTY.slice(0, 12)}
        selectionMode="multiple"
        value={value}
      />{' '}
    </Screen>
  );
};

export const Selection: Story = {
  parameters: scenario('selection'),
  render: () => <SelectionDemo />,
};

const RangeDemo = () => {
  const [range, setRange] = useState<GridRange | null>({
    anchor: { row: 'SHP-20482', column: 'customer' },
    focus: { row: 'SHP-20484', column: 'weight' },
  });
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          {range
            ? `${range.anchor.row}/${range.anchor.column} → ${range.focus.row}/${range.focus.column}`
            : 'No range'}
        </Text>
      }
    >
      <Shipments
        defaultCurrent={{ row: 'SHP-20484', column: 'weight' }}
        onRangeChange={setRange}
        range={range}
        rows={FIFTY.slice(0, 12)}
        selectionMode="range"
      />{' '}
    </Screen>
  );
};

export const Range: Story = { parameters: scenario('range'), render: () => <RangeDemo /> };

const EditingDemo = ({ editMode }: { editMode: 'cell' | 'row' }) => {
  const [rows, setRows] = useState(() => FIFTY.slice(0, 8));
  const [log, setLog] = useState<string[]>([]);
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          {log.length === 0 ? 'Nothing committed yet' : log.slice(-3).join(' · ')}
        </Text>
      }
    >
      <Shipments
        defaultCurrent={{ row: 'SHP-20481', column: 'customer' }}
        editMode={editMode}
        onEditCommit={async ({ key, changes }) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setRows((current) =>
            current.map((row) => (row.id === key ? { ...row, ...changes } : row)),
          );
          setLog((current) => [...current, `${key}: ${Object.keys(changes).join(', ')}`]);
        }}
        rows={rows}
      />{' '}
    </Screen>
  );
};

export const Editing: Story = {
  parameters: scenario('editing'),
  render: () => <EditingDemo editMode="cell" />,
};
export const EditingRow: Story = {
  parameters: scenario('editing-row'),
  render: () => <EditingDemo editMode="row" />,
};

export const Validation: Story = {
  parameters: scenario('validation'),
  render: () => (
    <Screen size="tall">
      <Shipments
        defaultCurrent={{ row: 'SHP-20481', column: 'weight' }}
        onEditCommit={({ column }) =>
          column === 'destination'
            ? Promise.reject(new Error('The shipping service is offline'))
            : undefined
        }
        rows={FIFTY.slice(0, 8)}
      />
    </Screen>
  ),
};

const ActivationDemo = () => {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          {opened ? `Opened ${opened}` : 'Double press a row, or Enter on its tracking cell'}
        </Text>
      }
    >
      <Shipments
        activatable
        defaultCurrent={{ row: 'SHP-20481', column: 'id' }}
        onActivate={({ key }) => setOpened(key)}
        rows={FIFTY.slice(0, 8)}
      />{' '}
    </Screen>
  );
};

export const Activation: Story = {
  parameters: scenario('activation'),
  render: () => <ActivationDemo />,
};

export const Pinning: Story = {
  parameters: scenario('pinning'),
  render: () => (
    <Screen size="tall">
      <Shipments
        defaultColumnState={{ pinned: { start: ['id'], end: ['priority'] } }}
        selectionMode="multiple"
      />
    </Screen>
  ),
};

const ColumnStateDemo = ({ scenarioId }: { scenarioId: string }) => {
  const [state, setState] = useState<Partial<GridColumnState> | undefined>(
    scenarioId === 'reorder'
      ? { order: ['id', 'carrier', 'customer'] }
      : { widths: { customer: 260 } },
  );
  const [last, setLast] = useState('');
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          {last || 'Drag a handle, or a header; or use the keyboard on the header cell'}
        </Text>
      }
    >
      <Shipments
        columnState={state as GridColumnState}
        defaultCurrent={{ row: 'header', column: 'customer' }}
        onColumnStateChange={(next, request) => {
          setState(next);
          setLast(`${request.change} by ${request.reason}: ${serializeColumnState(next, columns)}`);
        }}
        rows={FIFTY.slice(0, 8)}
      />{' '}
    </Screen>
  );
};

export const Resize: Story = {
  parameters: scenario('resize'),
  render: () => <ColumnStateDemo scenarioId="resize" />,
};
export const Reorder: Story = {
  parameters: scenario('reorder'),
  render: () => <ColumnStateDemo scenarioId="reorder" />,
};

const ColumnMenuDemo = () => {
  const [managing, setManaging] = useState(false);
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          {managing
            ? 'Manage columns asked for: the application opens its column-manager here'
            : 'Hover a header, or Ctrl+Enter on it'}
        </Text>
      }
    >
      <Shipments
        defaultCurrent={{ row: 'header', column: 'carrier' }}
        onManageColumns={() => setManaging(true)}
        rows={FIFTY.slice(0, 8)}
      />{' '}
    </Screen>
  );
};

export const ColumnMenu: Story = {
  parameters: scenario('column-menu'),
  render: () => <ColumnMenuDemo />,
};

const SavedViewDemo = () => {
  const [text, setText] = useState(
    'o=id,cost,customer;w=customer:240;h=eta,priority;ps=id;pe=cost',
  );
  const state = useMemo(() => parseColumnState(text), [text]);
  return (
    <Screen
      size="tall"
      before={<TextField aria-label="Saved view" mono onValueChange={setText} value={text} />}
    >
      <Shipments
        columnState={state}
        onColumnStateChange={(next) => setText(serializeColumnState(next, columns))}
        rows={FIFTY.slice(0, 8)}
      />{' '}
    </Screen>
  );
};

export const ColumnState: Story = {
  parameters: scenario('column-state'),
  render: () => <SavedViewDemo />,
};

export const Grouping: Story = {
  parameters: scenario('grouping'),
  render: () => (
    <Screen>
      <Shipments
        defaultQuery={{
          ...emptyQuery(),
          group: ['carrier', 'status'],
          sort: [{ column: 'id', direction: 'ascending' }],
        }}
        rows={FIFTY.slice(0, 24)}
      />
    </Screen>
  ),
};

export const Summary: Story = {
  parameters: scenario('summary'),
  render: () => (
    <Screen size="tall">
      <Shipments rows={FIFTY.slice(0, 10)} />
    </Screen>
  ),
};

export const Detail: Story = {
  parameters: scenario('detail'),
  render: () => (
    <Screen size="tall">
      <Shipments
        defaultExpanded={['SHP-20481']}
        renderDetail={(row) => (
          <div className="slotted-demo-stack">
            <Text size="sm">
              {row.customer} · {row.destination} · {row.carrier}
            </Text>
            <Text size="sm" tone="muted">
              Shipped {row.shipped}, expected {row.eta.replace('T', ' ')}. {kilograms(row.weight)}{' '}
              at {money(row.cost)}.
            </Text>
          </div>
        )}
        rows={FIFTY.slice(0, 8)}
      />
    </Screen>
  ),
};

const VirtualizationDemo = () => {
  const handle = useRef<DataGridHandle | null>(null);
  return (
    <Screen
      before={
        <div className="slotted-demo-row">
          <Button
            onClick={() => handle.current?.scrollToRow('SHP-25480', 'center')}
            size="sm"
            tone="secondary"
            variant="outline"
          >
            Scroll to row 5,000
          </Button>
          <Button
            onClick={() => handle.current?.focusCell({ row: 'SHP-30480', column: 'customer' })}
            size="sm"
            tone="secondary"
            variant="outline"
          >
            Focus the last row
          </Button>
        </div>
      }
    >
      <Shipments handle={handle} rows={TEN_THOUSAND} selectionMode="multiple" />{' '}
    </Screen>
  );
};

export const Virtualization: Story = {
  parameters: scenario('virtualization'),
  render: () => <VirtualizationDemo />,
};

/** A server that answers a query in 400 milliseconds, from the ten thousand rows. */
function useShipmentServer(size: number) {
  const [query, setQuery] = useState<GridQuery>(emptyQuery({ index: 0, size }));
  const [page, setPage] = useState<{ rows: Shipment[]; total: number }>({ rows: [], total: 0 });
  const [pending, setPending] = useState(true);
  const [failing, setFailing] = useState(false);
  const request = useRef(0);
  useEffect(() => {
    const id = (request.current += 1);
    setPending(true);
    const timer = setTimeout(async () => {
      const { applyQuery } = await import('@slotted/core/grid');
      if (id !== request.current) return;
      if (failing) {
        setPending(false);
        return;
      }
      const applied = applyQuery(TEN_THOUSAND, columns, query, { rowKey: (row) => row.id });
      setPage({
        rows: applied.nodes.flatMap((node) => (node.kind === 'row' ? [node.row] : [])),
        total: applied.total,
      });
      setPending(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, failing]);
  return { query, setQuery, page, pending, failing, setFailing };
}

const ServerDemo = () => {
  const server = useShipmentServer(25);
  return (
    <Screen
      before={
        <Text size="sm" tone="muted">
          {server.pending
            ? 'Fetching…'
            : `${server.page.total.toLocaleString('en-US')} shipments on the server`}
        </Text>
      }
    >
      <Shipments
        error={server.failing ? 'The shipments service timed out' : null}
        loading={server.pending}
        onQueryChange={server.setQuery}
        onRetry={() => server.setFailing(false)}
        query={server.query}
        rows={server.page.rows}
        selectionMode="multiple"
        totalCount={server.page.total}
      />{' '}
    </Screen>
  );
};

export const Server: Story = { parameters: scenario('server'), render: () => <ServerDemo /> };

const PaginationDemo = () => {
  const [query, setQuery] = useState<GridQuery>(emptyQuery({ index: 0, size: 8 }));
  const pageCount = Math.ceil(FIFTY.length / 8);
  void pageCount;
  return (
    <Screen>
      <Shipments
        footer={
          <Pagination
            count={FIFTY.length}
            onPageChange={(page) => setQuery(withPageIndex(query, page - 1).query)}
            page={(query.page && 'index' in query.page ? query.page.index : 0) + 1}
            pageSize={8}
          >
            <PaginationPrevious />
            <PaginationItems />
            <PaginationNext />
          </Pagination>
        }
        /* A paged grid is as tall as its page: a frame taller than eight
           rows left the room under them empty. */
        height={undefined}
        onQueryChange={setQuery}
        query={query}
      />
    </Screen>
  );
};

export const PaginationScene: Story = {
  parameters: scenario('pagination'),
  render: () => <PaginationDemo />,
};

const LoadMoreDemo = () => {
  const [count, setCount] = useState(20);
  const [pending, setPending] = useState(false);
  const rows = useMemo(() => TEN_THOUSAND.slice(0, count), [count]);
  const loadMore = useCallback(() => {
    if (pending) return;
    setPending(true);
    setTimeout(() => {
      setCount((current) => Math.min(TEN_THOUSAND.length, current + 20));
      setPending(false);
    }, 400);
  }, [pending]);
  return (
    <Screen size="tall">
      <Shipments
        hasMore={count < 200}
        loading={pending}
        onLoadMore={loadMore}
        query={{ ...emptyQuery(), page: { cursor: String(count), size: 20 } }}
        rows={rows}
        virtualize={false}
      />
    </Screen>
  );
};

export const LoadMore: Story = {
  parameters: scenario('load-more'),
  render: () => <LoadMoreDemo />,
};

export const EmptyAndLoading: Story = {
  parameters: scenario('empty-and-loading'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Nothing yet"
        note="A grid before the first shipment exists: the empty result-state under the header, held to the frame."
      >
        <Screen size="tall">
          <Shipments rows={[]} />
        </Screen>
      </Scene>
      <Scene
        label="Nothing after the filter"
        note="The query left nothing; Clear filters empties filter and search in one request with the reason clear."
      >
        <Screen size="tall">
          <Shipments defaultQuery={{ ...emptyQuery(), search: 'no such shipment' }} />
        </Screen>
      </Scene>
      <Scene label="A failed load" note="The message and Try again, which calls onRetry.">
        <Screen size="tall">
          <Shipments
            error="The shipments service timed out after 30 seconds"
            onRetry={() => undefined}
            rows={[]}
          />
        </Screen>
      </Scene>
      <Scene
        label="A first load"
        note="Skeleton rows the visible columns wide; a refresh over rows already shown would dim them instead."
      >
        <Screen size="tall">
          <Shipments loading rows={[]} />
        </Screen>
      </Scene>
    </div>
  ),
};

export const Variant: Story = {
  parameters: scenario('variant'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="plain"
        note="No band under the header and no rules: the grid reads as part of the page it stands on."
      >
        <Screen size="tall">
          <Shipments rows={EIGHT} variant="plain" />
        </Screen>
      </Scene>
      <Scene label="ruled" note="A rule between rows and the band under the header; no frame.">
        <Screen size="tall">
          <Shipments rows={EIGHT} variant="ruled" />
        </Screen>
      </Scene>
      <Scene
        label="framed, striped"
        note="The border, the radius and every second row tinted under every state."
      >
        <Screen size="tall">
          <Shipments rows={EIGHT} striped variant="framed" />
        </Screen>
      </Scene>
    </div>
  ),
};

const AWKWARD: Shipment[] = [
  {
    ...EIGHT[0]!,
    id: 'SHP-20490',
    customer: 'Sociedade Portuguesa de Distribuição Farmacêutica e Logística Hospitalar, Lda.',
    destination: 'Vila Nova de Gaia, PT',
  },
  {
    ...EIGHT[1]!,
    id: 'SHP-20491',
    customer: 'https://example.com/customers/0a8f1c2d-very-long-unbroken-identifier-token',
    weight: null,
  },
  {
    ...EIGHT[2]!,
    id: 'SHP-20492',
    customer: 'مؤسسة النور للتجارة العامة',
    destination: 'Dubai, AE',
  },
  { ...EIGHT[3]!, id: 'SHP-20493', customer: '', destination: 'Reykjavík, IS', cost: 0 },
];

export const TextTreatment: Story = {
  parameters: scenario('text'),
  render: () => (
    <Screen size="tall">
      <Shipments
        columns={columns.map((column) =>
          column.id === 'customer'
            ? { ...column, text: 'wrap', width: 260 }
            : column.id === 'destination'
              ? { ...column, text: 'nowrap', width: 120 }
              : column,
        )}
        rowHeight="auto"
        rows={AWKWARD}
      />
    </Screen>
  ),
};

export const Density: Story = {
  parameters: scenario('density'),
  render: () => (
    <Screen size="tall">
      <Shipments rows={FIFTY.slice(0, 10)} selectionMode="multiple" />
    </Screen>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Screen size="tall">
      <Shipments disabledKeys={['SHP-20492']} rows={AWKWARD} selectionMode="multiple" />
    </Screen>
  ),
};

const KeyboardDemo = () => {
  const [cell, setCell] = useState<GridCell | null>({ row: 'SHP-20481', column: 'customer' });
  return (
    <Screen
      size="tall"
      before={
        <Text size="sm" tone="muted">
          {cell ? `Cursor on ${cell.row}, ${cell.column}` : 'No cursor'}
        </Text>
      }
    >
      <Shipments
        current={cell}
        onCurrentChange={setCell}
        renderDetail={(row) => <Text size="sm">{row.customer}</Text>}
        rows={FIFTY.slice(0, 8)}
        selectionMode="multiple"
      />{' '}
    </Screen>
  );
};

export const Keyboard: Story = { parameters: scenario('keyboard'), render: () => <KeyboardDemo /> };

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <DataGridDefaultsProvider
      labels={{ selectAllFiltered: 'Select all {count} shipments', grid: 'Shipments' }}
    >
      <Screen size="tall">
        <Shipments
          defaultQuery={{
            ...emptyQuery(),
            sort: [
              { column: 'carrier', direction: 'ascending' },
              { column: 'cost', direction: 'descending' },
            ],
          }}
          defaultValue={['SHP-20482']}
          label={undefined}
          rows={FIFTY.slice(0, 8)}
          selectionMode="multiple"
        />
      </Screen>
    </DataGridDefaultsProvider>
  ),
};
