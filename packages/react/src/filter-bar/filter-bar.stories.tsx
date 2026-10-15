import {
  createFilterGroupPredicate,
  createSearchPredicate,
  fromFilterBarParams,
  setFilter,
  toFilterBarParams,
} from '@slotted/core/filter';
import type { FilterGroup } from '@slotted/core/filter';
import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Badge } from '../badge';
import { Button } from '../button';
import { Layer } from '../drawer/drawer-demo';
import { CodeBlock } from '../code-block';
import { Grid, Scene } from '../field/field-demo';
import { SlottedProvider } from '../i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import {
  Table,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableContent,
  TableHead,
  TableRow,
  TableRowHeader,
} from '../table';
import { FilterBar } from './filter-bar';
import { REACT_FILTER_BAR_DOCS, REACT_FILTER_BAR_TOKENS } from './filter-bar.docs';
import type { FilterBarField, FilterBarHandle, FilterBarProps } from './filter-bar.types';

/* ── The listing: orders of a Brazilian marketplace ──────────────────────── */

interface Order {
  id: string;
  customer: string;
  status: 'paid' | 'pending' | 'refunded' | 'cancelled';
  amount: number;
  channel: 'web' | 'app' | 'marketplace';
  created: string;
  priority: boolean;
  company: 'acme' | 'solaris';
}

const ORDERS: Order[] = [
  {
    id: 'PED-48211',
    customer: 'Ana Souza',
    status: 'paid',
    amount: 1250.9,
    channel: 'web',
    created: '2026-09-12',
    company: 'acme',
    priority: true,
  },
  {
    id: 'PED-48212',
    customer: 'Bruno Lima',
    status: 'pending',
    amount: 89.9,
    channel: 'app',
    created: '2026-09-12',
    company: 'acme',
    priority: false,
  },
  {
    id: 'PED-48219',
    customer: 'Mariana Costa',
    status: 'refunded',
    amount: 412,
    channel: 'marketplace',
    created: '2026-09-11',
    company: 'solaris',
    priority: false,
  },
  {
    id: 'PED-48223',
    customer: 'Solaris Fretes',
    status: 'paid',
    amount: 18240,
    channel: 'web',
    created: '2026-09-10',
    company: 'solaris',
    priority: true,
  },
  {
    id: 'PED-48230',
    customer: 'Carla Menezes',
    status: 'cancelled',
    amount: 59.9,
    channel: 'app',
    created: '2026-09-09',
    company: 'acme',
    priority: false,
  },
  {
    id: 'PED-48231',
    customer: 'Diana Ferreira',
    status: 'paid',
    amount: 320,
    channel: 'marketplace',
    created: '2026-09-08',
    company: 'solaris',
    priority: false,
  },
  {
    id: 'PED-48237',
    customer: 'Eduardo Ramos',
    status: 'pending',
    amount: 2380.5,
    channel: 'web',
    created: '2026-09-07',
    company: 'acme',
    priority: true,
  },
  {
    id: 'PED-48240',
    customer: 'Fernanda Alves',
    status: 'paid',
    amount: 148,
    channel: 'app',
    created: '2026-09-05',
    company: 'acme',
    priority: false,
  },
];

const STATUSES = [
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
];

const CHANNELS = [
  { label: 'Web', value: 'web' },
  { label: 'App', value: 'app' },
  { label: 'Marketplace', value: 'marketplace' },
];

const FIELDS: FilterBarField[] = [
  { icon: 'circle', key: 'status', kind: 'set', label: 'Status', options: STATUSES, pinned: true },
  { icon: 'person', key: 'customer', kind: 'text', label: 'Customer', pinned: true },
  { key: 'amount', kind: 'number', label: 'Amount', min: 0, step: 0.01 },
  { key: 'channel', kind: 'set', label: 'Channel', options: CHANNELS },
  { icon: 'calendar', key: 'created', kind: 'date', label: 'Created', section: 'Dates' },
  { icon: 'star', key: 'priority', kind: 'boolean', label: 'Priority' },
];

const PAID_OVER_100: FilterGroup = {
  join: 'and',
  rules: [
    { field: 'status', filter: setFilter(['paid']) },
    {
      field: 'amount',
      filter: {
        kind: 'number',
        join: 'and',
        conditions: [{ operator: 'greaterThan', value: 100 }],
      },
    },
  ],
};

const APPLIED: FilterGroup = {
  join: 'and',
  rules: [
    { field: 'status', filter: setFilter(['paid', 'refunded']) },
    {
      field: 'amount',
      filter: {
        kind: 'number',
        join: 'and',
        conditions: [{ operator: 'greaterThan', value: 100 }],
      },
    },
    {
      field: 'created',
      filter: {
        kind: 'date',
        join: 'and',
        conditions: [{ operator: 'between', value: '2026-09-01', end: '2026-09-14' }],
      },
    },
    { field: 'channel', filter: setFilter(['web', 'app']) },
  ],
};

const NESTED: FilterGroup = {
  join: 'and',
  rules: [
    { field: 'status', filter: setFilter(['paid']) },
    {
      join: 'or',
      rules: [
        {
          field: 'amount',
          filter: {
            kind: 'number',
            join: 'and',
            conditions: [{ operator: 'greaterThan', value: 1000 }],
          },
        },
        {
          field: 'priority',
          filter: { kind: 'boolean', join: 'and', conditions: [{ operator: 'is', value: true }] },
        },
      ],
    },
  ],
};

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_FILTER_BAR_DOCS.filterBar.scenes, {
    playground: Playground,
    listing: Listing,
    pinned: Pinned,
    chips: Chips,
    builder: Builder,
    groups: Groups,
    manual: Manual,
    required: Required,
    presets: Presets,
    query: Query,
    url: Url,
    count: Count,
    narrow: Narrow,
    sticky: Sticky,
    states: States,
    content: Content,
    keyboard: Keyboard,
  });

const meta = {
  title: 'Components/FilterBar',
  component: FilterBar,
  args: { fields: FIELDS },
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'FilterBar',
        description:
          'Uma barra sobre uma listagem que edita uma árvore de condições — busca, pills fixados, chips aplicados, construtor E/OU, presets, contagem, e o estado numa URL — sobre o motor de @slotted/core/filter.',
        framework: 'React',
        ...REACT_FILTER_BAR_DOCS.filterBar,
        tokens: REACT_FILTER_BAR_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The bar with the builder's drawer opened inside the theme root the workbench
 * draws under. An application carries `data-slotted-theme` on the document,
 * so the shared portal root is inside it; a reference page carries it on the
 * preview, and a drawer portalled to the body would fall outside the theme.
 */
function ThemedFilterBar({ ref, ...props }: FilterBarProps) {
  const [container, setContainer] = useState<Element | null>(null);
  const attach = useCallback(
    (handle: FilterBarHandle | null) => {
      setContainer(handle?.root?.closest('[data-slotted-theme]') ?? null);
      if (typeof ref === 'function') ref(handle);
      else if (ref) ref.current = handle;
    },
    [ref],
  );
  return <FilterBar {...props} container={props.container ?? container} ref={attach} />;
}

const read = (row: Order, field: string) => row[field as keyof Order];
const money = new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' });

/** The bar, the rows it keeps, and the count — the three things every scene shares. */
function useKept(initial: FilterGroup | null, initialQuery = '') {
  const [filter, setFilterValue] = useState<FilterGroup | null>(initial);
  const [query, setQuery] = useState(initialQuery);
  const kept = useMemo(() => {
    const keep = createFilterGroupPredicate(filter, read);
    const find = createSearchPredicate(query, read, ['customer', 'id']);
    return ORDERS.filter((row) => keep(row) && find(row));
  }, [filter, query]);
  return { filter, kept, query, setFilter: setFilterValue, setQuery };
}

function OrdersTable({ rows }: { rows: Order[] }) {
  return (
    <Table columns={5} variant="framed">
      <TableContent>
        <TableHead>
          <TableRow>
            <TableColumnHeader>Order</TableColumnHeader>
            <TableColumnHeader>Customer</TableColumnHeader>
            <TableColumnHeader>Status</TableColumnHeader>
            <TableColumnHeader>Channel</TableColumnHeader>
            <TableColumnHeader numeric>Amount</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((order) => (
            <TableRow key={order.id} value={order.id}>
              <TableRowHeader>{order.id}</TableRowHeader>
              <TableCell>{order.customer}</TableCell>
              <TableCell>
                <Badge
                  tone={
                    order.status === 'paid'
                      ? 'success'
                      : order.status === 'cancelled'
                        ? 'danger'
                        : 'secondary'
                  }
                >
                  {STATUSES.find((entry) => entry.value === order.status)?.label}
                </Badge>
              </TableCell>
              <TableCell>
                {CHANNELS.find((entry) => entry.value === order.channel)?.label}
              </TableCell>
              <TableCell numeric>{money.format(order.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}

function Orders(
  props: Partial<FilterBarProps> & { initial?: FilterGroup | null; withTable?: boolean },
) {
  const { initial = PAID_OVER_100, withTable = false, ...rest } = props;
  const { filter, kept, query, setFilter: set, setQuery } = useKept(initial);
  return (
    <>
      <ThemedFilterBar
        count={kept.length}
        fields={FIELDS}
        onQueryChange={setQuery}
        onValueChange={set}
        query={query}
        total={ORDERS.length}
        value={filter}
        {...rest}
      />
      {withTable ? <OrdersTable rows={kept} /> : null}
    </>
  );
}

export const Playground: Story = {
  args: { apply: 'live', chipLimit: 6, disabled: false, loading: false, size: 'md', sticky: false },
  argTypes: {
    apply: { control: 'radio', options: ['live', 'manual'] },
    chipLimit: { control: 'number' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Orders {...args} fields={FIELDS} initial={APPLIED} withTable />
    </div>
  ),
};

export const Listing: Story = {
  parameters: scenario('listing'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A barra e a tabela sobre as mesmas linhas"
        note="A árvore é aplicada pelo consumidor; a tabela encolhe e a contagem diz 3 de 8. Abra o pill Status e troque os valores."
      >
        <Orders withTable />
      </Scene>
    </Grid>
  ),
};

export const Pinned: Story = {
  parameters: scenario('pinned'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="pinned: Status com condição, Customer vazio"
        note="Status, fixado e com condição, é um chip no seu lugar; Customer, fixado e vazio, é um pill tracejado — prima-o e ele passa a chip, com o valor aberto. Amount, não fixado, é um chip depois dos fixados."
      >
        <Orders />
      </Scene>
    </Grid>
  ),
};

export const Chips: Story = {
  parameters: scenario('chips'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="chipLimit={2} com quatro condições aplicadas"
        note="Cada chip em segmentos: o operador abre um menu, o valor um popover só com o operando, o X remove. Dois chips à vista e os outros atrás de +2 more; um campo que a aplicação não declara fica inválido e removível. Add filter cria um chip tracejado até ter valor."
      >
        <Orders
          chipLimit={2}
          initial={{
            ...APPLIED,
            rules: [...APPLIED.rules, { field: 'region', filter: setFilter(['south']) }],
          }}
        />
      </Scene>
    </Grid>
  ),
};

function BuilderDemo({ container }: { container: Element }) {
  const bar = useRef<FilterBarHandle | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Orders
        container={container}
        defaultOpen={false}
        onOpenChange={setOpen}
        open={open}
        ref={bar}
        withTable
      />
      <div className="slotted-demo-row">
        <Button onClick={() => bar.current?.open()} variant="outline">
          Abrir o construtor pelo handle
        </Button>
      </div>
    </>
  );
}

export const Builder: Story = {
  parameters: scenario('builder'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="O construtor"
        note="Filters (n), abaixo de 36rem, um chip de grupo e o handle abrem a árvore inteira no drawer: uma linha por regra, o grupo aninhado numa caixa. Numa aplicação o drawer cobre a página; aqui, a caixa tracejada."
      >
        <Layer>{(container) => <BuilderDemo container={container} />}</Layer>
      </Scene>
    </Grid>
  ),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Status paid e (Amount > 1000 ou Priority)"
        note="O grupo aninhado é um chip com a frase entre parênteses; abra-o e o construtor mostra o segundo nível numa caixa com a junção Any, dentro da caixa tracejada."
      >
        <Layer>{(container) => <Orders container={container} initial={NESTED} withTable />}</Layer>
      </Scene>
    </Grid>
  ),
};

export const Manual: Story = {
  parameters: scenario('manual'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label='apply="manual"'
        note="Remova um chip ou escreva na busca: a raiz fica dirty e a tabela não muda até Apply. Reset descarta."
      >
        <Orders apply="manual" initial={APPLIED} withTable />
      </Scene>
    </Grid>
  ),
};

const COMPANY: FilterBarField = {
  defaultValue: setFilter(['acme']),
  key: 'company',
  kind: 'set',
  label: 'Company',
  options: [
    { label: 'Acme', value: 'acme' },
    { label: 'Solaris', value: 'solaris' },
  ],
  required: true,
};

export const Required: Story = {
  parameters: scenario('required'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Company é obrigatório, com default Acme"
        note="Clear all devolve Company a Acme e apaga o resto; abra o pill e Clear está desligado. Em manual, um Company vazio recusa Apply."
      >
        <Orders
          apply="manual"
          fields={[COMPANY, ...FIELDS]}
          initial={{
            join: 'and',
            rules: [{ field: 'company', filter: setFilter(['acme']) }, ...PAID_OVER_100.rules],
          }}
        />
      </Scene>
    </Grid>
  ),
};

function PresetsDemo() {
  const [preset, setPreset] = useState<string | null>('paid');
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <>
      <Orders
        onPresetChange={setPreset}
        onPresetSave={(value) => setSaved(JSON.stringify(value))}
        preset={preset}
        presets={[
          { key: 'paid', label: 'Paid over R$ 100', value: PAID_OVER_100 },
          { key: 'urgent', label: 'Urgent this month', value: NESTED },
        ]}
        initial={PAID_OVER_100}
      />
      {saved ? <p>Pedido para guardar: {saved}</p> : null}
    </>
  );
}

export const Presets: Story = {
  parameters: scenario('presets'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Duas vistas guardadas"
        note="Escolha Urgent this month e a árvore troca; remova um chip e a raiz fica dirty com a vista ainda escolhida. Save as view… no construtor entrega a árvore à aplicação."
      >
        <PresetsDemo />
      </Scene>
    </Grid>
  ),
};

export const Query: Story = {
  parameters: scenario('query'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label='queryDelay={120} · shortcut="/"'
        note="Escreva ana: a tabela responde 120ms depois da última tecla. Escape limpa. Pressione / fora de um campo e o foco vem para a busca."
      >
        <Orders initial={null} queryDelay={120} shortcut="/" withTable />
      </Scene>
    </Grid>
  ),
};

function UrlDemo() {
  const { filter, kept, query, setFilter: set, setQuery } = useKept(PAID_OVER_100, 'ana');
  const params = toFilterBarParams({ filter, query }).toString();
  const restored = fromFilterBarParams(params);
  return (
    <>
      <ThemedFilterBar
        count={kept.length}
        fields={FIELDS}
        onQueryChange={setQuery}
        onValueChange={set}
        query={query}
        total={ORDERS.length}
        value={filter}
      />
      <CodeBlock code={`?${params}`} copy={false} defaultWrap language="text" />
      <p>
        Lido de volta: {restored.filter ? `${restored.filter.rules.length} regras` : 'sem filtro'},
        query "{restored.query}"
      </p>
    </>
  );
}

export const Url: Story = {
  parameters: scenario('url'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A query string por baixo da barra"
        note="Cada edição reescreve ?f=and(…)&q=; a linha abaixo é o que fromFilterBarParams lê de volta."
      >
        <UrlDemo />
      </Scene>
    </Grid>
  ),
};

export const Count: Story = {
  parameters: scenario('count'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="128 de 3.412"
        note="As figuras são da língua em vigor — pt-BR separa milhares com ponto. A parte é aria-live: uma mudança no filtro é ouvida como o seu efeito."
      >
        <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale="pt-BR">
          <ThemedFilterBar count={128} fields={FIELDS} total={3412} value={PAID_OVER_100} />
        </SlottedProvider>
      </Scene>
      <Scene
        label="loading"
        note="A contagem dá lugar ao spinner e aria-busy; os controles ficam, Apply desliga-se."
      >
        <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale="pt-BR">
          <ThemedFilterBar count={128} fields={FIELDS} loading total={3412} value={PAID_OVER_100} />
        </SlottedProvider>
      </Scene>
    </Grid>
  ),
};

export const Narrow: Story = {
  parameters: scenario('narrow'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A barra num telefone"
        note="Numa sala de 375px a barra é uma linha que desliza: Filters (n), os chips — cada um com o campo, o valor com as palavras do operador e o X — e os pills vazios. O chip cortado na borda diz que a linha continua; tocar num valor abre o construtor com o cartão dessa regra aberto."
      >
        <div className="slotted-demo-room" data-room="phone">
          <div className="slotted-demo-viewport" data-scroll data-size="tall">
            <Orders initial={APPLIED} withTable />
          </div>
        </div>
      </Scene>
      <Scene
        label="O construtor num telefone"
        note="Com menos de 30rem o construtor lista cartões: a frase de cada regra e o X; tocar na frase abre o cartão e empilha campo, operador e valor a toda a largura, um de cada vez. Um grupo aninhado é um trilho na aresta, não uma caixa."
      >
        <div className="slotted-demo-room" data-room="phone">
          <Layer size="screen">
            {(container) => <Orders container={container} defaultOpen initial={NESTED} />}
          </Layer>
        </div>
      </Scene>
    </Grid>
  ),
};

export const Sticky: Story = {
  parameters: scenario('sticky'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="sticky sobre uma lista longa"
        note="Role dentro do palco: a barra cola no topo do rolador e a tabela passa por baixo dela."
      >
        <div className="slotted-demo-viewport" data-layout="page" data-scroll data-size="tall">
          <>
            <Orders initial={null} sticky />
            <OrdersTable rows={[...ORDERS, ...ORDERS, ...ORDERS]} />
          </>
        </div>
      </Scene>
    </Grid>
  ),
};

const COMPANY_EMPTY: FilterGroup = {
  join: 'and',
  rules: [
    {
      field: 'company',
      filter: { kind: 'set', join: 'and', conditions: [{ operator: 'anyOf', value: [] }] },
    },
  ],
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={1}>
      <Scene label="disabled" note="Todos os controles desligados; a largura mantém-se.">
        <ThemedFilterBar count={128} disabled fields={FIELDS} total={3412} value={PAID_OVER_100} />
      </Scene>
      <Scene label="loading" note="Os controles ficam; a contagem é um spinner.">
        <ThemedFilterBar count={128} fields={FIELDS} loading total={3412} value={PAID_OVER_100} />
      </Scene>
      <Scene
        label="readOnly"
        note="Cada condição alcançável pelas setas e legível; nenhuma se altera. Sem X, add, clear nem pills vazios; os segmentos levam aria-disabled e a toolbar diz Read only."
      >
        <ThemedFilterBar count={128} fields={FIELDS} readOnly total={3412} value={PAID_OVER_100} />
      </Scene>
      <Scene
        label="Obrigatório sem valor"
        note="Company, obrigatório, é um chip tracejado sem X enquanto não tem valor; pressione Apply e ele recusa, leva data-invalid e a aresta de danger, e a recusa é anunciada."
      >
        <ThemedFilterBar
          apply="manual"
          fields={[{ ...COMPANY, defaultValue: undefined }, ...FIELDS]}
          value={COMPANY_EMPTY}
        />
      </Scene>
    </Grid>
  ),
};

const CITIES: FilterBarField = {
  key: 'city',
  kind: 'set',
  label: 'المدينة',
  options: [
    { label: 'الرياض', value: 'riyadh' },
    { label: 'جدة', value: 'jeddah' },
  ],
};

const TAGS: FilterBarField = {
  key: 'tags',
  kind: 'set',
  label: 'Tags',
  options: Array.from({ length: 11 }, (_, index) => ({
    label: `tag-${index + 1}`,
    value: `tag-${index + 1}`,
  })),
};

const LONG_AND_UNKNOWN: FilterGroup = {
  join: 'and',
  rules: [
    {
      field: 'tags',
      filter: setFilter(Array.from({ length: 11 }, (_, index) => `tag-${index + 1}`)),
    },
    { field: 'region', filter: setFilter(['south']) },
  ],
};

const ARABIC: FilterGroup = {
  join: 'and',
  rules: [
    { field: 'city', filter: setFilter(['riyadh']) },
    {
      field: 'created',
      filter: {
        kind: 'date',
        join: 'and',
        conditions: [{ operator: 'after', value: '2026-09-01' }],
      },
    },
  ],
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Uma frase de onze valores, e um campo desconhecido"
        note="O chip de Tags escreve dois valores e +9, e leva a lista inteira no title e no nome; o chip de region, um campo que a aplicação não declara, fica inválido e removível."
      >
        <ThemedFilterBar fields={[...FIELDS, TAGS]} value={LONG_AND_UNKNOWN} />
      </Scene>
      <Scene
        label="dir=rtl"
        note="O rótulo árabe fica ao lado da data ISO sem a reordenar: nome e frase são duas corridas isoladas."
      >
        <div dir="rtl">
          <ThemedFilterBar
            fields={[CITIES, { key: 'created', kind: 'date', label: 'تاريخ الإنشاء' }]}
            value={ARABIC}
          />
        </div>
      </Scene>
    </Grid>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Tab três vezes, setas, Delete"
        note="Tab: busca, toolbar, chips. Setas entre os pills; Enter abre; nos chips, Delete remove e o foco segue para o próximo."
      >
        <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale="pt-BR">
          <Orders initial={APPLIED} messages={{ search: 'Buscar pedidos' }}>
            <Select items={[{ label: 'Mais recentes', value: 'recent' }]} size="md" value="recent">
              <SelectTrigger aria-label="Ordenar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </Orders>
        </SlottedProvider>
      </Scene>
    </Grid>
  ),
};
