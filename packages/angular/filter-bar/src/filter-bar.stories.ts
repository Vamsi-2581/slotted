import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { SlBadge } from '@slotted/angular/badge';
import { SlButton } from '@slotted/angular/button';
import { SlCodeBlock } from '@slotted/angular/code-block';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import {
  SlTable,
  SlTableBody,
  SlTableCell,
  SlTableColumnHeader,
  SlTableContent,
  SlTableHead,
  SlTableRow,
  SlTableRowHeader,
} from '@slotted/angular/table';
import {
  createFilterGroupPredicate,
  createSearchPredicate,
  fromFilterBarParams,
  setFilter,
  toFilterBarParams,
} from '@slotted/core/filter';
import type { FilterGroup } from '@slotted/core/filter';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlFilterBar, SlFilterBarEnd, SlFilterBarOperand } from './filter-bar';
import type { FilterBarApply, FilterBarField, FilterBarSize } from './filter-bar.constants';
import { provideFilterBarDefaults } from './filter-bar.constants';
import { ANGULAR_FILTER_BAR_DOCS, ANGULAR_FILTER_BAR_TOKENS } from './filter-bar.docs';

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
  { key: 'status', kind: 'set', label: 'Status', options: STATUSES, pinned: true },
  { key: 'customer', kind: 'text', label: 'Customer', pinned: true },
  { key: 'amount', kind: 'number', label: 'Amount', min: 0, step: 0.01 },
  { key: 'channel', kind: 'set', label: 'Channel', options: CHANNELS },
  { key: 'created', kind: 'date', label: 'Created', section: 'Dates' },
  { key: 'priority', kind: 'boolean', label: 'Priority' },
];

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

const WITH_UNKNOWN: FilterGroup = {
  ...APPLIED,
  rules: [...APPLIED.rules, { field: 'region', filter: setFilter(['south']) }],
};

const COMPANY_FIRST: FilterGroup = {
  join: 'and',
  rules: [{ field: 'company', filter: setFilter(['acme']) }, ...PAID_OVER_100.rules],
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

const PRESETS = [
  { key: 'paid', label: 'Paid over R$ 100', value: PAID_OVER_100 },
  { key: 'urgent', label: 'Urgent this month', value: NESTED },
];

const read = (row: Order, field: string) => row[field as keyof Order];
const money = new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' });

const themeRootOf = (host: ElementRef<HTMLElement>) =>
  host.nativeElement.closest('[data-slotted-theme]');

/** A bare bar on the page: the same theme root for its drawer, read from the page once. */
@Component({
  selector: 'sl-filter-bar-themed',
  standalone: true,
  imports: [SlFilterBar],
  template: `<div
    slFilterBar
    [apply]="apply()"
    [container]="themeRoot"
    [count]="count()"
    [disabled]="disabled()"
    [fields]="fields()"
    [loading]="loading()"
    [locale]="locale()"
    [total]="total()"
    [value]="value()"
  ></div>`,
})
class ThemedBar {
  readonly fields = input.required<readonly FilterBarField[]>();
  readonly value = input<FilterGroup | null>(null);
  readonly apply = input<FilterBarApply | undefined>(undefined);
  readonly count = input<number | undefined>(undefined);
  readonly total = input<number | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly themeRoot = themeRootOf(inject<ElementRef<HTMLElement>>(ElementRef));
}

/** The rows a table draws: the listing after the tree and the query. */
@Component({
  selector: 'sl-filter-bar-orders-table',
  standalone: true,
  imports: [
    SlBadge,
    SlTable,
    SlTableBody,
    SlTableCell,
    SlTableColumnHeader,
    SlTableContent,
    SlTableHead,
    SlTableRow,
    SlTableRowHeader,
  ],
  template: `
    <div slTable [columns]="5" variant="framed" [stickyHeader]="stickyHeader()">
      <div slTableContent>
        <thead slTableHead>
          <tr slTableRow>
            <th slTableColumnHeader>Order</th>
            <th slTableColumnHeader>Customer</th>
            <th slTableColumnHeader>Status</th>
            <th slTableColumnHeader>Channel</th>
            <th slTableColumnHeader numeric>Amount</th>
          </tr>
        </thead>
        <tbody slTableBody>
          @for (order of rows(); track $index) {
            <tr slTableRow [value]="order.id">
              <th slTableRowHeader>{{ order.id }}</th>
              <td slTableCell>{{ order.customer }}</td>
              <td slTableCell>
                <span slBadge [tone]="tone(order)">{{ statusLabel(order) }}</span>
              </td>
              <td slTableCell>{{ channelLabel(order) }}</td>
              <td slTableCell numeric>{{ money.format(order.amount) }}</td>
            </tr>
          }
        </tbody>
      </div>
    </div>
  `,
})
class OrdersTable {
  readonly rows = input.required<readonly Order[]>();
  readonly stickyHeader = input(false);
  protected readonly money = money;
  protected tone(order: Order) {
    return order.status === 'paid'
      ? 'success'
      : order.status === 'cancelled'
        ? 'danger'
        : 'secondary';
  }
  protected statusLabel(order: Order) {
    return STATUSES.find((entry) => entry.value === order.status)?.label;
  }
  protected channelLabel(order: Order) {
    return CHANNELS.find((entry) => entry.value === order.channel)?.label;
  }
}

/**
 * The bar, the rows it keeps, and the count — the three things every scene
 * shares. The tree and the query are the component's own signals; the bar
 * asks, the component moves them, and the predicates from `@slotted/core/filter`
 * shrink the listing.
 */
@Component({
  selector: 'sl-filter-bar-orders',
  standalone: true,
  imports: [OrdersTable, SlCodeBlock, SlFilterBar],
  template: `
    <div class="slotted-demo-stack">
      <div
        slFilterBar
        #bar="slFilterBar"
        locale="pt-BR"
        [apply]="apply()"
        [chipLimit]="chipLimit()"
        [container]="container() ?? themeRoot"
        [count]="kept().length"
        [disabled]="disabled()"
        [fields]="fields()"
        [loading]="loading()"
        [(open)]="open"
        [(preset)]="preset"
        [presets]="presets()"
        [(query)]="query"
        [queryDelay]="queryDelay()"
        [savePresetEnabled]="savePresetEnabled()"
        [shortcut]="shortcut()"
        [size]="size()"
        [sticky]="sticky()"
        [total]="orders.length"
        [(value)]="filter"
        (savePreset)="saved.set($event)"
      ></div>
      @if (withTable()) {
        <sl-filter-bar-orders-table [rows]="kept()" [stickyHeader]="sticky()" />
      }
      @if (withParams()) {
        <div slCodeBlock [code]="'?' + params()" [copy]="false" defaultWrap language="text"></div>
        <p>Lido de volta: {{ restored() }}</p>
      }
      @if (saved(); as tree) {
        <p>Pedido para guardar: {{ json(tree) }}</p>
      }
    </div>
  `,
})
class Orders implements OnInit {
  readonly fields = input<readonly FilterBarField[]>(FIELDS);
  readonly initial = input<FilterGroup | null>(PAID_OVER_100);
  readonly initialQuery = input('');
  readonly apply = input<FilterBarApply | undefined>(undefined);
  readonly chipLimit = input<number | undefined>(undefined);
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly presets = input<typeof PRESETS | undefined>(undefined);
  readonly initialPreset = input<string | null>(null);
  readonly queryDelay = input<number | undefined>(undefined);
  readonly savePresetEnabled = input(false);
  readonly shortcut = input<string | null | undefined>(undefined);
  readonly size = input<FilterBarSize | undefined>(undefined);
  readonly sticky = input(false);
  readonly withTable = input(false);
  readonly withParams = input(false);

  readonly orders = ORDERS;
  /**
   * The theme root the workbench draws under, for the builder's drawer. An
   * application carries `data-slotted-theme` on the document, so the shared
   * portal root is inside it; a reference page carries it on the preview.
   */
  readonly themeRoot = themeRootOf(inject<ElementRef<HTMLElement>>(ElementRef));
  /** A box of the scene's own for the drawer, instead of the theme root. */
  readonly container = input<Element | null>(null);
  readonly filter = signal<FilterGroup | null>(null);
  readonly query = signal('');
  readonly preset = signal<string | null>(null);
  readonly open = signal(false);
  readonly saved = signal<FilterGroup | null>(null);

  readonly kept = computed(() => {
    const keep = createFilterGroupPredicate(this.filter(), read);
    const find = createSearchPredicate(this.query(), read, ['customer', 'id']);
    return ORDERS.filter((row) => keep(row) && find(row));
  });
  readonly params = computed(() =>
    toFilterBarParams({ filter: this.filter(), query: this.query() }).toString(),
  );
  readonly restored = computed(() => {
    const back = fromFilterBarParams(this.params());
    return `${back.filter ? `${back.filter.rules.length} regras` : 'sem filtro'}, query "${back.query}"`;
  });

  /* Where the scene starts; the bar owns every move after that. */
  ngOnInit() {
    this.filter.set(this.initial());
    this.query.set(this.initialQuery());
    this.preset.set(this.initialPreset());
  }

  json(tree: FilterGroup) {
    return JSON.stringify(tree);
  }
}

interface FilterBarStoryArgs {
  apply: FilterBarApply;
  chipLimit: number;
  disabled: boolean;
  loading: boolean;
  size: FilterBarSize;
  sticky: boolean;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_FILTER_BAR_DOCS.filterBar.scenes, {
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
  }) as never;

const IMPORTS = [
  Orders,
  OrdersTable,
  ThemedBar,
  SlButton,
  SlFilterBar,
  SlFilterBarEnd,
  SlFilterBarOperand,
  SlSelect,
  SlSelectItem,
];

/** Every scene reads the same fields and trees. */
const DATA = {
  applied: APPLIED,
  arabic: ARABIC,
  arabicFields: [
    CITIES,
    { key: 'created', kind: 'date', label: 'تاريخ الإنشاء' },
  ] as FilterBarField[],
  companyEmpty: COMPANY_EMPTY,
  companyEmptyFields: [{ ...COMPANY, defaultValue: undefined }, ...FIELDS] as FilterBarField[],
  companyFields: [COMPANY, ...FIELDS] as FilterBarField[],
  companyFirst: COMPANY_FIRST,
  fields: FIELDS,
  longAndUnknown: LONG_AND_UNKNOWN,
  longFields: [...FIELDS, TAGS] as FilterBarField[],
  nested: NESTED,
  paidOver100: PAID_OVER_100,
  presets: PRESETS,
  tripled: [...ORDERS, ...ORDERS, ...ORDERS],
  withUnknown: WITH_UNKNOWN,
};

const meta: Meta<FilterBarStoryArgs> = {
  title: 'Components/FilterBar',
  component: SlFilterBar,
  decorators: [moduleMetadata({ imports: IMPORTS })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'FilterBar',
        description:
          'Uma barra sobre uma listagem que edita uma árvore de condições — busca, pills fixados, chips aplicados, construtor E/OU, presets, contagem, e o estado numa URL — sobre o motor de @slotted/core/filter.',
        framework: 'Angular',
        ...ANGULAR_FILTER_BAR_DOCS.filterBar,
        tokens: ANGULAR_FILTER_BAR_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<FilterBarStoryArgs>;

/**
 * One demonstration: what it is called, what to look at, and the stage that
 * owns the distance between the examples on it.
 */
const scene = (label: string, note: string, body: string, layout = 'block') => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}">${body}</div>
  </section>`;

const one = (label: string, note: string, body: string, layout = 'block') =>
  `<div class="slotted-demo-grid" data-columns="1">${scene(label, note, body, layout)}</div>`;

export const Playground: Story = {
  args: { apply: 'live', chipLimit: 6, disabled: false, loading: false, size: 'md', sticky: false },
  argTypes: {
    apply: { control: 'radio', options: ['live', 'manual'] },
    chipLimit: { control: 'number' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...args, ...DATA },
    template: `
<div class="slotted-demo-stage" data-layout="block">
  <sl-filter-bar-orders
    [apply]="apply"
    [chipLimit]="chipLimit"
    [disabled]="disabled"
    [initial]="applied"
    [loading]="loading"
    [size]="size"
    [sticky]="sticky"
    [withTable]="true"
  />
</div>`,
  }),
};

export const Listing: Story = {
  parameters: scenario('listing'),
  render: () => ({
    props: DATA,
    template: one(
      'A barra e a tabela sobre as mesmas linhas',
      'A árvore é aplicada pelo consumidor; a tabela encolhe e a contagem diz 3 de 8. Abra o pill Status e troque os valores.',
      `<sl-filter-bar-orders [withTable]="true" />`,
    ),
  }),
};

export const Pinned: Story = {
  parameters: scenario('pinned'),
  render: () => ({
    props: DATA,
    template: one(
      'pinned: Status cheio, Customer vazio',
      'O pill cheio leva a borda e o fundo de acento com a frase; o vazio é um contorno. Amount, não fixado, é um chip.',
      `<sl-filter-bar-orders />`,
    ),
  }),
};

export const Chips: Story = {
  parameters: scenario('chips'),
  render: () => ({
    props: DATA,
    template: one(
      'chipLimit="2" com quatro regras aplicadas',
      'Dois chips à vista, os outros dois atrás de +2 more; um chip de um campo que a aplicação não declara fica inválido e removível.',
      `<sl-filter-bar-orders [chipLimit]="2" [initial]="withUnknown" />`,
    ),
  }),
};

export const Builder: Story = {
  parameters: scenario('builder'),
  render: () => ({
    props: DATA,
    template: one(
      'O construtor',
      'Add filter escolhe um campo e abre a sua regra; o chip abre a mesma; Filters (n), abaixo de 36rem, e openBuilder() abrem a árvore inteira no drawer. Numa aplicação o drawer cobre a página; aqui, a caixa tracejada.',
      `<div class="slotted-demo-viewport" data-size="tall" #box>
        <div class="slotted-demo-stack">
          <sl-filter-bar-orders #orders [container]="box" [withTable]="true" />
          <div class="slotted-demo-row">
            <button slButton variant="outline" type="button" (click)="orders.open.set(true)">Abrir o construtor por fora</button>
          </div>
        </div>
      </div>`,
    ),
  }),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => ({
    props: DATA,
    template: one(
      'Status paid e (Amount > 1000 ou Priority)',
      'O grupo aninhado é um chip com a frase entre parênteses; abra-o e o construtor mostra o segundo nível numa caixa com a junção Any, dentro da caixa tracejada.',
      `<div class="slotted-demo-viewport" data-size="tall" #box>
        <sl-filter-bar-orders [container]="box" [initial]="nested" [withTable]="true" />
      </div>`,
    ),
  }),
};

export const Manual: Story = {
  parameters: scenario('manual'),
  render: () => ({
    props: DATA,
    template: one(
      'apply="manual"',
      'Remova um chip ou escreva na busca: a raiz fica dirty e a tabela não muda até Apply. Reset descarta.',
      `<sl-filter-bar-orders apply="manual" [initial]="applied" [withTable]="true" />`,
    ),
  }),
};

export const Required: Story = {
  parameters: scenario('required'),
  render: () => ({
    props: DATA,
    template: one(
      'Company é obrigatório, com default Acme',
      'Clear all devolve Company a Acme e apaga o resto; abra o pill e Clear está desligado. Em manual, um Company vazio recusa Apply.',
      `<sl-filter-bar-orders apply="manual" [fields]="companyFields" [initial]="companyFirst" />`,
    ),
  }),
};

export const Presets: Story = {
  parameters: scenario('presets'),
  render: () => ({
    props: DATA,
    template: one(
      'Duas vistas guardadas',
      'Escolha Urgent this month e a árvore troca; remova um chip e a raiz fica dirty com a vista ainda escolhida. Save as view… no construtor entrega a árvore à aplicação.',
      `<sl-filter-bar-orders initialPreset="paid" [presets]="presets" [savePresetEnabled]="true" />`,
    ),
  }),
};

export const Query: Story = {
  parameters: scenario('query'),
  render: () => ({
    props: DATA,
    template: one(
      'queryDelay="120" · shortcut="/"',
      'Escreva ana: a tabela responde 120ms depois da última tecla. Escape limpa. Pressione / fora de um campo e o foco vem para a busca.',
      `<sl-filter-bar-orders [initial]="null" [queryDelay]="120" shortcut="/" [withTable]="true" />`,
    ),
  }),
};

export const Url: Story = {
  parameters: scenario('url'),
  render: () => ({
    props: DATA,
    template: one(
      'A query string por baixo da barra',
      'Cada edição reescreve ?f=and(…)&q=; a linha abaixo é o que fromFilterBarParams lê de volta.',
      `<sl-filter-bar-orders initialQuery="ana" [withParams]="true" />`,
    ),
  }),
};

export const Count: Story = {
  parameters: scenario('count'),
  render: () => ({
    props: DATA,
    template: `<div class="slotted-demo-grid" data-columns="1">
      ${scene(
        '128 de 3.412',
        'As figuras são do locale — pt-BR separa milhares com ponto. A parte é aria-live: uma mudança no filtro é ouvida como o seu efeito.',
        `<sl-filter-bar-themed [count]="128" [fields]="fields" locale="pt-BR" [total]="3412" [value]="paidOver100" />`,
      )}
      ${scene(
        'loading',
        'A contagem dá lugar ao spinner e aria-busy; os controles ficam, Apply desliga-se.',
        `<sl-filter-bar-themed [count]="128" [fields]="fields" [loading]="true" locale="pt-BR" [total]="3412" [value]="paidOver100" />`,
      )}
    </div>`,
  }),
};

export const Narrow: Story = {
  parameters: scenario('narrow'),
  render: () => ({
    props: DATA,
    template: one(
      'A mesma barra a 22rem',
      'Abaixo de 36rem os pills e os chips dobram atrás de Filters (4); a busca ocupa a linha inteira e a contagem a última. Redimensione o palco para ver a composição média e a larga.',
      `<div class="slotted-demo-measure"><sl-filter-bar-orders [initial]="applied" /></div>`,
    ),
  }),
};

export const Sticky: Story = {
  parameters: scenario('sticky'),
  render: () => ({
    props: DATA,
    template: one(
      'sticky sobre uma lista longa',
      'Role dentro do palco: a barra cola no topo do rolador e a tabela passa por baixo dela.',
      `<div class="slotted-demo-viewport" data-layout="page" data-scroll data-size="tall">
        <div class="slotted-demo-stack">
          <sl-filter-bar-orders [initial]="null" [sticky]="true" />
          <sl-filter-bar-orders-table [rows]="tripled" />
        </div>
      </div>`,
    ),
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    props: DATA,
    template: `<div class="slotted-demo-grid" data-columns="1">
      ${scene(
        'disabled',
        'Todos os controles desligados; a largura mantém-se.',
        `<sl-filter-bar-themed [count]="128" [disabled]="true" [fields]="fields" [total]="3412" [value]="paidOver100" />`,
      )}
      ${scene(
        'loading',
        'Os controles ficam; a contagem é um spinner.',
        `<sl-filter-bar-themed [count]="128" [fields]="fields" [loading]="true" [total]="3412" [value]="paidOver100" />`,
      )}
      ${scene(
        'Obrigatório sem valor',
        'Pressione Apply: o pill Company sem valor recusa, leva data-invalid e a borda de danger, e o foco vai para ele.',
        `<sl-filter-bar-themed apply="manual" [fields]="companyEmptyFields" [value]="companyEmpty" />`,
      )}
    </div>`,
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    props: DATA,
    template: `<div class="slotted-demo-grid" data-columns="1">
      ${scene(
        'Uma frase de onze valores, e um campo desconhecido',
        'O chip de Tags trunca em 18rem e leva a frase inteira no title; o chip de region, um campo que a aplicação não declara, fica inválido e removível.',
        `<sl-filter-bar-themed [fields]="longFields" [value]="longAndUnknown" />`,
      )}
      ${scene(
        'dir=rtl',
        'O rótulo árabe fica ao lado da data ISO sem a reordenar: nome e frase são duas corridas isoladas.',
        `<div dir="rtl"><sl-filter-bar-themed [fields]="arabicFields" [value]="arabic" /></div>`,
      )}
    </div>`,
  }),
};

export const Keyboard: Story = {
  decorators: [
    moduleMetadata({
      imports: IMPORTS,
      providers: [
        provideFilterBarDefaults({
          labels: { add: 'Adicionar filtro', clear: 'Limpar tudo', search: 'Buscar pedidos' },
        }),
      ],
    }),
  ],
  parameters: scenario('keyboard'),
  render: () => ({
    props: {
      ...DATA,
      /* Read when the bar binds, once the preview that carries the theme is on the page. */
      get themeRoot() {
        return document.querySelector('[data-slotted-theme]');
      },
    },
    template: one(
      'Tab três vezes, setas, Delete',
      'Tab: busca, toolbar, chips. Setas entre os pills; Enter abre; nos chips, Delete remove e o foco segue para o próximo.',
      `<div slFilterBar [container]="themeRoot" count="3" [fields]="fields" locale="pt-BR" total="8" [value]="applied">
        <sl-select slFilterBarEnd aria-label="Ordenar" size="md" value="recent" [items]="[{ label: 'Mais recentes', value: 'recent' }]">
          <sl-select-item value="recent">Mais recentes</sl-select-item>
        </sl-select>
      </div>`,
    ),
  }),
};
