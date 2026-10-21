import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList } from '@ng-icons/lucide';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import {
  SlBreadcrumb,
  SlBreadcrumbItem,
  SlBreadcrumbLink,
  SlBreadcrumbList,
  SlBreadcrumbPage,
} from '@slotted/angular/breadcrumb';
import { SlButton, SlIconButton } from '@slotted/angular/button';
import {
  SlDescriptionList,
  SlDescriptionListDescription,
  SlDescriptionListItem,
  SlDescriptionListTerm,
} from '@slotted/angular/description-list';
import { SlMenuItem } from '@slotted/angular/menu';
import { SlPage, SlPageBody, SlPageFooter } from '@slotted/angular/page';
import {
  SlSection,
  SlSectionActions,
  SlSectionBody,
  SlSectionDescription,
  SlSectionEyebrow,
  SlSectionHeader,
  SlSectionHeading,
  SlSectionTitle,
} from '@slotted/angular/section';
import { SlStack } from '@slotted/angular/stack';
import {
  SlTable,
  SlTableBody,
  SlTableCaption,
  SlTableCell,
  SlTableColumnHeader,
  SlTableContent,
  SlTableHead,
  SlTableRow,
  SlTableRowHeader,
} from '@slotted/angular/table';
import { SlTab, SlTabList, SlTabs } from '@slotted/angular/tabs';
import { SlTag, SlTagBody } from '@slotted/angular/tag';
import { SlToolbar, SlToolbarItem, SlToolbarOverflow } from '@slotted/angular/toolbar';
import { SlText } from '@slotted/angular/typography';
import { Component, input, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlPageHeader } from './page-header';
import type { PageHeaderCollapse, PageHeaderLevel, PageHeaderSize } from './page-header-defaults';
import { providePageHeaderDefaults } from './page-header-defaults';
import {
  SlPageHeaderActions,
  SlPageHeaderArea,
  SlPageHeaderBack,
  SlPageHeaderBreadcrumbs,
  SlPageHeaderContent,
  SlPageHeaderControls,
  SlPageHeaderDescription,
  SlPageHeaderFigure,
  SlPageHeaderHeading,
  SlPageHeaderMarks,
  SlPageHeaderNav,
  SlPageHeaderNavigation,
  SlPageHeaderPin,
  SlPageHeaderProgress,
  SlPageHeaderSubheading,
  SlPageHeaderTabs,
  SlPageHeaderTitle,
  SlPageHeaderTitleArea,
  SlPageHeaderTitleRow,
  SlPageHeaderToggle,
  SlPageHeaderVisual,
} from './page-header-parts';
import { ANGULAR_PAGE_HEADER_DOCS, ANGULAR_PAGE_HEADER_TOKENS } from './page-header.docs';

/* ── One purchase order, in full ─────────────────────────────────────────── */

const MONEY = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface OrderLine {
  code: string;
  description: string;
  short: string;
  quantity: number;
  unit: string;
}

const KINDS = [
  ['Pneu radial 295/80 R22.5 Michelin X Multi Z', 'Pneu 295/80 R22.5', 2980],
  ['Pneu radial 275/80 R22.5 Bridgestone R268', 'Pneu 275/80 R22.5', 2640],
  ['Câmara de ar 22.5 Pirelli', 'Câmara 22.5', 190],
  ['Protetor de câmara 22.5', 'Protetor 22.5', 85],
  ['Serviço de recapagem a frio', 'Recapagem a frio', 1240],
  ['Alinhamento e balanceamento, eixo', 'Alinhamento, eixo', 320],
] as const;

const LINES: OrderLine[] = Array.from({ length: 36 }, (_, index) => {
  const [description, short, unit] = KINDS[index % KINDS.length] as (typeof KINDS)[number];
  return {
    code: `SKU-${String(7891234 + index * 17).padStart(7, '0')}`,
    description,
    short,
    quantity: 4 + ((index * 7) % 20),
    unit: MONEY.format(unit),
  };
});

const HISTORY = [
  ['02/09/2026 09:14', 'Marina Duarte', 'Solicitou aprovação com três cotações anexadas.'],
  ['03/09/2026 11:02', 'Carlos Prado', 'Aprovou o orçamento dentro da alçada da gerência.'],
  ['04/09/2026 16:40', 'Jurídico', 'Devolveu com ressalvas sobre a cláusula de reajuste.'],
  ['05/09/2026 10:21', 'Marina Duarte', 'Reenviou com a cláusula corrigida pelo fornecedor.'],
  ['08/09/2026 08:55', 'Carlos Prado', 'Aprovou a versão corrigida.'],
  ['09/09/2026 14:30', 'Financeiro', 'Reservou o valor no orçamento do centro de custo.'],
  ['10/09/2026 09:00', 'Sistema', 'Aguardando emissão da ordem de compra.'],
].map(([when, who, what]) => ({ when, who, what }));

const RECORDS = ['PC-2026-004519', 'PC-2026-004520', 'PC-2026-004521', 'PC-2026-004522'];

const CHEVRON_LEFT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>`;
const CHEVRON_RIGHT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>`;

/* ── Template fragments ──────────────────────────────────────────────────── */

function NAV(breadcrumbs = true) {
  return `<div slPageHeaderNav>
  <a slPageHeaderBack href="#pedidos">Pedidos de compra</a>
  ${
    breadcrumbs
      ? `<div slPageHeaderBreadcrumbs>
    <nav slBreadcrumb>
      <ol slBreadcrumbList>
        <li slBreadcrumbItem><a slBreadcrumbLink href="#compras">Compras</a></li>
        <li slBreadcrumbItem><a slBreadcrumbLink href="#pedidos">Pedidos</a></li>
        <li slBreadcrumbItem><span slBreadcrumbPage>PC-2026-004521</span></li>
      </ol>
    </nav>
  </div>`
      : ''
  }
</div>`;
}

function TITLE(heading = 'Pedido de compra PC-2026-004521') {
  return `<div slPageHeaderTitle>
  <h1 slPageHeaderHeading>${heading}</h1>
  <span slPageHeaderMarks>
    <span slTag tone="warning" shape="pill" size="sm"><span slTagBody>Em análise</span></span>
  </span>
  <p slPageHeaderSubheading>Aurora Logística Ltda · CNPJ 12.345.678/0001-90</p>
</div>`;
}

function ACTIONS(full = true) {
  return `<div slPageHeaderActions>
  <div slToolbar aria-label="Ações do pedido" overflow="menu">
    ${
      full
        ? `<div slToolbarItem [slToolbarItemCounterpart]="duplicar">
      <button slButton variant="ghost">Duplicar</button>
    </div>
    <div slToolbarItem [slToolbarItemCounterpart]="imprimir">
      <button slButton variant="ghost">Imprimir</button>
    </div>
    <div slToolbarItem [slToolbarItemCounterpart]="exportar">
      <button slButton variant="outline">Exportar</button>
    </div>`
        : ''
    }
    <div slToolbarItem [slToolbarItemCounterpart]="reprovar">
      <button slButton variant="outline">Reprovar</button>
    </div>
    <div slToolbarItem><button slButton tone="accent">Aprovar</button></div>
    <sl-toolbar-overflow />
  </div>
</div>
<ng-template #duplicar><button slMenuItem>Duplicar</button></ng-template>
<ng-template #imprimir><button slMenuItem>Imprimir</button></ng-template>
<ng-template #exportar><button slMenuItem>Exportar</button></ng-template>
<ng-template #reprovar><button slMenuItem>Reprovar</button></ng-template>`;
}

const NAVIGATION = `<div slPageHeaderNavigation>
  <button slIconButton aria-label="Pedido anterior" variant="ghost">${CHEVRON_LEFT}</button>
  <button slIconButton aria-label="Pedido seguinte" variant="ghost">${CHEVRON_RIGHT}</button>
</div>`;

const FACTS = `<div slDescriptionList [columns]="3" layout="stack">
  <div slDescriptionListItem>
    <dt slDescriptionListTerm>Total</dt>
    <dd slDescriptionListDescription>R$ 148.320,00</dd>
  </div>
  <div slDescriptionListItem>
    <dt slDescriptionListTerm>Itens</dt>
    <dd slDescriptionListDescription>36</dd>
  </div>
  <div slDescriptionListItem>
    <dt slDescriptionListTerm>Comprador</dt>
    <dd slDescriptionListDescription>Marina Duarte</dd>
  </div>
  <div slDescriptionListItem>
    <dt slDescriptionListTerm>Entrega</dt>
    <dd slDescriptionListDescription>24 de setembro de 2026</dd>
  </div>
</div>`;

function AREA(figure = false) {
  return `<div slPageHeaderArea>
  ${figure ? `<div slPageHeaderFigure><span slAvatar name="Pneu radial" shape="square" size="xl" tone="secondary"></span></div>` : ''}
  <div slPageHeaderContent>
    <p slPageHeaderDescription>
      Reposição de pneus radiais aro 22.5 para a frota de Cariacica. Entrega prevista para 24 de
      setembro de 2026, com pagamento a 45 dias contra a fatura.
    </p>
    ${FACTS}
  </div>
</div>`;
}

function CONTROLS(pin = true) {
  return `<div slPageHeaderControls>
  <button slPageHeaderToggle></button>
  ${pin ? '<button slPageHeaderPin></button>' : ''}
</div>`;
}

const TABS = `<div slPageHeaderTabs>
  <div slTabs defaultValue="itens">
    <div slTabList aria-label="Secções do pedido">
      <div slTab value="resumo">Resumo</div>
      <div slTab value="itens">Itens</div>
      <div slTab value="historico">Histórico</div>
    </div>
  </div>
</div>`;

/* What stands before the title: the kind of record as an icon, the supplier's mark as an image, or initials. */
const ICON_VISUAL = `<span slPageHeaderVisual><span slAvatar name="Pedido de compra" shape="square" size="lg" tone="accent"><span slAvatarFallback><ng-icon name="lucideClipboardList"></ng-icon></span></span></span>`;
const IMAGE_VISUAL = `<span slPageHeaderVisual><span slAvatar name="Aurora Logística" shape="square" size="lg" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Crect width=%2764%27 height=%2764%27 rx=%2714%27 fill=%27%231d4ed8%27/%3E%3Ccircle cx=%2724%27 cy=%2736%27 r=%2714%27 fill=%27%2360a5fa%27/%3E%3Ccircle cx=%2742%27 cy=%2728%27 r=%2714%27 fill=%27%23bfdbfe%27 fill-opacity=%27.9%27/%3E%3C/svg%3E"></span></span>`;
const INITIALS_VISUAL = `<span slPageHeaderVisual><span slAvatar name="Aurora Logística" shape="square" size="lg" tone="accent"></span></span>`;

function HEADER(
  attributes = '',
  options: {
    breadcrumbs?: boolean;
    figure?: boolean;
    full?: boolean;
    navigation?: boolean;
    pin?: boolean;
    tabs?: boolean;
    visual?: 'icon' | 'image' | 'initials' | false;
  } = {},
) {
  return `<header slPageHeader ${attributes}>
  <div slPageHeaderTitleArea>
    ${NAV(options.breadcrumbs !== false)}
    <div slPageHeaderTitleRow>
      ${options.visual === false ? '' : options.visual === 'image' ? IMAGE_VISUAL : options.visual === 'initials' ? INITIALS_VISUAL : ICON_VISUAL}
      ${TITLE()}
      ${ACTIONS(options.full !== false)}
      ${options.navigation === false ? '' : NAVIGATION}
    </div>
  </div>
  ${AREA(options.figure === true)}
  ${CONTROLS(options.pin !== false)}
  ${options.tabs === false ? '' : TABS}
</header>`;
}

function TABLE(rows = 'lines', sticky = true, compact = false) {
  /* Two columns for a narrow pane, three for a header held under the page
     chrome (the table is then as wide as its content), four otherwise. One
     return and no local: the Angular compiler evaluates this for a template. */
  return `<div slTable [columns]="${compact ? 2 : sticky ? 3 : 4}" variant="ruled" ${sticky ? 'stickyHeader stickyTo="page"' : ''}>
  <div slTableContent>
    <caption slTableCaption>Itens do pedido</caption>
    <thead slTableHead>
      <tr slTableRow>
        ${compact ? '' : '<th slTableColumnHeader>Código</th>'}
        <th slTableColumnHeader>Descrição</th>
        <th slTableColumnHeader numeric>${compact || sticky ? 'Qtd.' : 'Quantidade'}</th>
        ${compact || sticky ? '' : '<th slTableColumnHeader numeric>Unitário</th>'}
      </tr>
    </thead>
    <tbody slTableBody>
      @for (line of ${rows}; track line.code) {
        <tr slTableRow [value]="line.code">
          ${compact ? '<th slTableRowHeader>{{ line.short }}</th>' : '<th slTableRowHeader>{{ line.code }}</th>'}
          ${compact ? '' : sticky ? '<td slTableCell>{{ line.short }}</td>' : '<td slTableCell>{{ line.description }}</td>'}
          <td slTableCell numeric>{{ line.quantity }}</td>
          ${compact || sticky ? '' : '<td slTableCell numeric>{{ line.unit }}</td>'}
        </tr>
      }
    </tbody>
  </div>
</div>`;
}

function SECTIONS(sticky = false, compact = false) {
  return `<section slSection id="itens" divider ${sticky ? 'sticky' : ''}>
  <div slSectionHeader>
    <div slSectionTitle>
      <span slSectionEyebrow>36 itens</span>
      <h2 slSectionHeading>Itens do pedido</h2>
      <p slSectionDescription>Quantidades e preços unitários conforme a cotação aceite em 2 de setembro.</p>
    </div>
    <div slSectionActions>
      <button slButton size="sm" variant="outline">Exportar</button>
      <button slButton size="sm" tone="accent">Adicionar item</button>
    </div>
  </div>
  <div slSectionBody>${TABLE('lines', sticky, compact)}</div>
</section>
<section slSection id="condicoes" divider ${sticky ? 'sticky' : ''}>
  <div slSectionHeader>
    <div slSectionTitle><h2 slSectionHeading>Condições comerciais</h2></div>
    <div slSectionActions><button slButton size="sm" variant="ghost">Editar</button></div>
  </div>
  <div slSectionBody>
    <div slDescriptionList [columns]="2">
      <div slDescriptionListItem>
        <dt slDescriptionListTerm>Prazo de pagamento</dt>
        <dd slDescriptionListDescription>45 dias contra a fatura</dd>
      </div>
      <div slDescriptionListItem>
        <dt slDescriptionListTerm>Centro de custo</dt>
        <dd slDescriptionListDescription>Frota Sudeste · CC 4120</dd>
      </div>
      <div slDescriptionListItem>
        <dt slDescriptionListTerm>Frete</dt>
        <dd slDescriptionListDescription>CIF, por conta do fornecedor</dd>
      </div>
      <div slDescriptionListItem>
        <dt slDescriptionListTerm>Garantia</dt>
        <dd slDescriptionListDescription>24 meses ou 120.000 km</dd>
      </div>
    </div>
  </div>
</section>
<section slSection id="historico" divider ${sticky ? 'sticky' : ''}>
  <div slSectionHeader>
    <div slSectionTitle>
      <span slSectionEyebrow>7 eventos</span>
      <h2 slSectionHeading>Histórico de aprovações</h2>
    </div>
  </div>
  <div slSectionBody>
    <div slStack [gap]="4">
      @for (event of history; track event.when) {
        <p slText size="sm"><strong>{{ event.when }} · {{ event.who }}</strong> — {{ event.what }}</p>
      }
    </div>
  </div>
</section>`;
}

const FOOTER = `<footer slPageFooter>
  <button slButton variant="ghost">Cancelar</button>
  <button slButton variant="outline">Guardar rascunho</button>
  <button slButton tone="accent">Enviar para aprovação</button>
</footer>`;

function viewport(body: string, size = 'screen') {
  return `<div class="slotted-demo-viewport" data-layout="page" data-scroll data-size="${size}">${body}</div>`;
}

function screen(
  header: string,
  options: { compact?: boolean; footer?: boolean; page?: string; sticky?: boolean } = {},
) {
  return viewport(`<main slPage ${options.page || ''}>
  ${header}
  <div slPageBody>${SECTIONS(options.sticky === true, options.compact === true)}</div>
  ${options.footer === false ? '' : FOOTER}
</main>`);
}

function scene(label: string, note: string, body: string, layout = 'block') {
  return `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}">${body}</div>
  </section>`;
}

function grid(columns: 1 | 2 | 3, scenes: string) {
  return `<div class="slotted-demo-grid" data-columns="${columns}">${scenes}</div>`;
}

const PROPS = { history: HISTORY, lines: LINES, reasons: [] as string[] };

/* ── A record navigator with state of its own ──────────────────────────── */

@Component({
  selector: 'sl-page-header-records-demo',
  standalone: true,
  imports: [
    SlPage,
    SlPageBody,
    SlPageFooter,
    SlPageHeader,
    SlPageHeaderTitleArea,
    SlPageHeaderNav,
    SlPageHeaderBack,
    SlPageHeaderTitleRow,
    SlPageHeaderVisual,
    SlPageHeaderTitle,
    SlPageHeaderHeading,
    SlPageHeaderMarks,
    SlPageHeaderSubheading,
    SlPageHeaderActions,
    SlPageHeaderNavigation,
    SlPageHeaderArea,
    SlPageHeaderContent,
    SlPageHeaderControls,
    SlPageHeaderToggle,
    SlPageHeaderPin,
    SlSection,
    SlSectionHeader,
    SlSectionTitle,
    SlSectionEyebrow,
    SlSectionHeading,
    SlSectionDescription,
    SlSectionActions,
    SlSectionBody,
    SlStack,
    SlText,
    SlTable,
    SlTableContent,
    SlTableCaption,
    SlTableHead,
    SlTableBody,
    SlTableRow,
    SlTableColumnHeader,
    SlTableRowHeader,
    SlTableCell,
    SlDescriptionList,
    SlDescriptionListItem,
    SlDescriptionListTerm,
    SlDescriptionListDescription,
    SlAvatar,
    SlAvatarFallback,
    NgIcon,
    SlTag,
    SlTagBody,
    SlButton,
    SlIconButton,
  ],
  template: viewport(`<main slPage>
  <header slPageHeader>
    <div slPageHeaderTitleArea>
      <div slPageHeaderNav><a slPageHeaderBack href="#pedidos">Pedidos de compra</a></div>
      <div slPageHeaderTitleRow>
        <span slPageHeaderVisual><span slAvatar name="Aurora Logística" shape="square" size="lg" tone="accent"></span></span>
        <div slPageHeaderTitle>
          <h1 slPageHeaderHeading>Pedido de compra {{ record() }}</h1>
          <span slPageHeaderMarks>
            <span slTag [tone]="index() % 2 === 0 ? 'warning' : 'success'" shape="pill" size="sm">
              <span slTagBody>{{ index() % 2 === 0 ? 'Em análise' : 'Aprovado' }}</span>
            </span>
          </span>
          <p slPageHeaderSubheading>{{ index() + 1 }} de {{ records.length }} · Aurora Logística Ltda</p>
        </div>
        <div slPageHeaderActions>
          <button slButton variant="outline">Reprovar</button>
          <button slButton tone="accent">Aprovar</button>
        </div>
        <div slPageHeaderNavigation>
          <button slIconButton aria-label="Pedido anterior" variant="ghost" [disabled]="index() === 0" (click)="previous()">${CHEVRON_LEFT}</button>
          <button slIconButton aria-label="Pedido seguinte" variant="ghost" [disabled]="index() === records.length - 1" (click)="next()">${CHEVRON_RIGHT}</button>
        </div>
      </div>
    </div>
    <div slPageHeaderArea><div slPageHeaderContent>${FACTS}</div></div>
    ${CONTROLS()}
  </header>
  <div slPageBody>${SECTIONS()}</div>
  ${FOOTER}
</main>`),
})
class RecordsDemo {
  readonly records = RECORDS;
  readonly index = signal(2);
  readonly record = () => this.records[this.index()];
  readonly history = HISTORY;
  readonly lines = LINES;
  previous() {
    this.index.update((current) => Math.max(0, current - 1));
  }
  next() {
    this.index.update((current) => Math.min(this.records.length - 1, current + 1));
  }
}

/* ── The header that is still loading ──────────────────────────────────── */

@Component({
  selector: 'sl-page-header-loading-demo',
  standalone: true,
  imports: [
    SlPage,
    SlPageBody,
    SlPageHeader,
    SlPageHeaderTitleArea,
    SlPageHeaderNav,
    SlPageHeaderBack,
    SlPageHeaderTitleRow,
    SlPageHeaderTitle,
    SlPageHeaderHeading,
    SlPageHeaderMarks,
    SlPageHeaderSubheading,
    SlPageHeaderActions,
    SlPageHeaderArea,
    SlPageHeaderContent,
    SlPageHeaderDescription,
    SlPageHeaderControls,
    SlPageHeaderToggle,
    SlPageHeaderPin,
    SlStack,
    SlText,
    SlTag,
    SlTagBody,
    SlButton,
    SlDescriptionList,
    SlDescriptionListItem,
    SlDescriptionListTerm,
    SlDescriptionListDescription,
  ],
  template: `<div slStack [gap]="4">
    <button slButton size="sm" variant="outline" (click)="reload()">Carregar de novo</button>
    ${viewport(
      `<main slPage>
      <header slPageHeader [loading]="loading()">
        <div slPageHeaderTitleArea>
          <div slPageHeaderNav><a slPageHeaderBack href="#pedidos">Pedidos de compra</a></div>
          <div slPageHeaderTitleRow>
            ${TITLE()}
            <div slPageHeaderActions>
              <button slButton variant="outline">Reprovar</button>
              <button slButton tone="accent">Aprovar</button>
            </div>
          </div>
        </div>
        ${AREA()}
        ${CONTROLS()}
      </header>
      <div slPageBody>
        @if (loading()) {
          <p slText size="sm">A carregar o pedido…</p>
        } @else {
          ${FACTS}
        }
      </div>
    </main>`,
      'tall',
    )}
    @if (loading()) {
      <button slButton size="sm" tone="accent" (click)="loading.set(false)">Chegou</button>
    }
  </div>`,
})
class LoadingDemo {
  readonly loading = signal(true);
  reload() {
    this.loading.set(true);
    window.setTimeout(() => this.loading.set(false), 1600);
  }
}

/* ── A refresh on the chrome's edge ────────────────────────────────────── */

@Component({
  selector: 'sl-page-header-progress-demo',
  standalone: true,
  imports: [
    SlPage,
    SlPageBody,
    SlPageHeader,
    SlPageHeaderTitleArea,
    SlPageHeaderNav,
    SlPageHeaderBack,
    SlPageHeaderTitleRow,
    SlPageHeaderTitle,
    SlPageHeaderHeading,
    SlPageHeaderMarks,
    SlPageHeaderSubheading,
    SlPageHeaderActions,
    SlPageHeaderArea,
    SlPageHeaderContent,
    SlPageHeaderDescription,
    SlPageHeaderControls,
    SlPageHeaderToggle,
    SlPageHeaderPin,
    SlPageHeaderProgress,
    SlPageHeaderTabs,
    SlTabs,
    SlTabList,
    SlTab,
    SlStack,
    SlText,
    SlTag,
    SlTagBody,
    SlButton,
    SlDescriptionList,
    SlDescriptionListItem,
    SlDescriptionListTerm,
    SlDescriptionListDescription,
  ],
  template: `<div slStack [gap]="4">
    <div class="slotted-demo-row">
      <button slButton size="sm" variant="outline" (click)="refresh()">Atualizar o pedido</button>
    </div>
    ${viewport(
      `<main slPage>
      <header slPageHeader>
        <div slPageHeaderTitleArea>
          <div slPageHeaderNav><a slPageHeaderBack href="#pedidos">Pedidos de compra</a></div>
          <div slPageHeaderTitleRow>
            ${TITLE()}
            <div slPageHeaderActions>
              <button slButton variant="outline">Reprovar</button>
              <button slButton tone="accent">Aprovar</button>
            </div>
          </div>
        </div>
        ${AREA()}
        ${CONTROLS()}
        <div slPageHeaderProgress [loading]="refreshing()"></div>
        @if (tabs()) {
          ${TABS}
        }
      </header>
      <div slPageBody>${FACTS}</div>
    </main>`,
      'tall',
    )}
  </div>`,
})
class ProgressDemo {
  readonly tabs = input(true);
  readonly refreshing = signal(false);
  refresh() {
    this.refreshing.set(true);
    window.setTimeout(() => this.refreshing.set(false), 1600);
  }
}

/* ── The instance's own methods ────────────────────────────────────────── */

@Component({
  selector: 'sl-page-header-handle-demo',
  standalone: true,
  imports: [
    SlPageHeader,
    SlPageHeaderTitleArea,
    SlPageHeaderTitleRow,
    SlPageHeaderTitle,
    SlPageHeaderHeading,
    SlButton,
    SlStack,
  ],
  template: `<div slStack [gap]="4">
    <header slPageHeader level="2" size="sm">
      <div slPageHeaderTitleArea>
        <div slPageHeaderTitleRow>
          <div slPageHeaderTitle>
            <input
              slPageHeaderHeading
              aria-label="Título do pedido"
              [value]="title()"
              (input)="title.set($any($event.target).value)"
            />
          </div>
        </div>
      </div>
    </header>
    <p slText size="sm">
      O título é do consumidor; o nível e o identificador continuam da família.
    </p>
  </div>`,
})
class EditableDemo {
  readonly title = signal('Pedido de compra PC-2026-004521');
}

interface PageHeaderStoryArgs {
  collapse: PageHeaderCollapse;
  expanded: boolean;
  level: PageHeaderLevel;
  loading: boolean;
  pinned: boolean;
  size: PageHeaderSize;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_PAGE_HEADER_DOCS.pageHeader.scenes, {
    playground: Playground,
    anatomy: Anatomy,
    collapse: Collapse,
    pin: Pin,
    when: When,
    size: Size,
    navigation: Navigation,
    actions: Actions,
    tabs: TabsScene,
    loading: Loading,
    progress: Progress,
    content: Content,
    narrow: Narrow,
    composition: Composition,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

const meta: Meta<PageHeaderStoryArgs> = {
  title: 'Components/PageHeader',
  decorators: [
    moduleMetadata({
      imports: [
        SlPageHeader,
        SlPageHeaderTitleArea,
        SlPageHeaderNav,
        SlPageHeaderBack,
        SlPageHeaderBreadcrumbs,
        SlPageHeaderTitleRow,
        SlPageHeaderVisual,
        SlPageHeaderTitle,
        SlPageHeaderHeading,
        SlPageHeaderMarks,
        SlPageHeaderSubheading,
        SlPageHeaderActions,
        SlPageHeaderNavigation,
        SlPageHeaderArea,
        SlPageHeaderFigure,
        SlPageHeaderContent,
        SlPageHeaderDescription,
        SlPageHeaderControls,
        SlPageHeaderToggle,
        SlPageHeaderPin,
        SlPageHeaderTabs,
        SlPage,
        SlPageBody,
        SlPageFooter,
        SlSection,
        SlSectionHeader,
        SlSectionTitle,
        SlSectionEyebrow,
        SlSectionHeading,
        SlSectionDescription,
        SlSectionActions,
        SlSectionBody,
        SlBreadcrumb,
        SlBreadcrumbList,
        SlBreadcrumbItem,
        SlBreadcrumbLink,
        SlBreadcrumbPage,
        SlAvatar,
        SlAvatarFallback,
        NgIcon,
        SlTag,
        SlTagBody,
        SlToolbar,
        SlToolbarItem,
        SlToolbarOverflow,
        SlMenuItem,
        SlButton,
        SlIconButton,
        SlTabs,
        SlTabList,
        SlTab,
        SlDescriptionList,
        SlDescriptionListItem,
        SlDescriptionListTerm,
        SlDescriptionListDescription,
        SlTable,
        SlTableContent,
        SlTableCaption,
        SlTableHead,
        SlTableBody,
        SlTableRow,
        SlTableColumnHeader,
        SlTableRowHeader,
        SlTableCell,
        SlStack,
        SlText,
        RecordsDemo,
        LoadingDemo,
        ProgressDemo,
        EditableDemo,
      ],
      providers: [provideIcons({ lucideClipboardList })],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Page header',
        description:
          'The shell of a screen’s top: a title area that never leaves, a header area that scrolls away under it and comes back, a pill of controls on the chrome’s edge, and a slot for tabs. SAP Fiori’s Dynamic Page, rebuilt on one sticky root.',
        framework: 'Angular',
        ...ANGULAR_PAGE_HEADER_DOCS.pageHeader,
        tokens: ANGULAR_PAGE_HEADER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<PageHeaderStoryArgs>;

export const Playground: Story = {
  args: {
    collapse: 'scroll',
    expanded: true,
    level: '1',
    loading: false,
    pinned: false,
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...PROPS, ...args },
    template: screen(
      HEADER(
        '[(expanded)]="expanded" [(pinned)]="pinned" [size]="size" [level]="level" [collapse]="collapse" [loading]="loading"',
      ),
    ),
  }),
};

export const Anatomy: Story = {
  parameters: scenario('anatomy'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Every part, at rest',
        'The nav row — the way back is written too, and yields to the breadcrumbs beside it; narrow the stage below 600 pixels and it returns — the title row with visual — the supplier’s mark as an image here, the kind of record as an icon on the other screens, initials where nothing else exists — heading, mark, subheading, actions and record navigation, the area with the description and the facts, the pill on the edge, and the tabs. Scroll the screen to see which of them stay.',
        screen(HEADER('', { figure: true, visual: 'image' })),
      ),
    ),
  }),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => ({
    props: { ...PROPS, reasons: [] as string[] },
    template: grid(
      1,
      scene(
        'collapse="scroll", the default',
        'Scroll down: the area slides under the title and the request says scroll. Press the chevron while scrolled: the area comes back in place, revealed, until the next scroll. Scroll to the top: it returns on its own.',
        `<div slStack [gap]="4">
          ${screen(HEADER("(expandedRequest)=\"reasons.unshift($event.reason + ' → ' + ($event.value ? 'aberto' : 'fechado'))\""))}
          <p slText size="sm" tone="muted">{{ reasons.length === 0 ? 'Nenhum pedido ainda.' : 'Razões: ' + reasons.slice(0, 6).join(' · ') }}</p>
        </div>`,
      ) +
        scene(
          'The toggle at rest',
          'Without scrolling, press the chevron: the area folds as a grid track — the content’s own height at every frame — and its controls leave the tab sequence. Press again and it unfolds.',
          viewport(
            `<main slPage>${HEADER('', { tabs: false })}<div slPageBody><p slText size="sm">Conteúdo curto: nada rola, e só o controlo recolhe a área.</p></div></main>`,
            'tall',
          ),
        ) +
        scene(
          'collapse="manual"',
          'The whole header stays while the page scrolls — sap.f’s preserveHeaderStateOnScroll. Only the chevron, the pin and the application move the area, and the pill is then the one way to take it out of the way.',
          screen(HEADER('collapse="manual"')),
        ),
    ),
  }),
};

export const Pin: Story = {
  parameters: scenario('pin'),
  render: () => ({
    props: { ...PROPS, pinned: true },
    template: grid(
      1,
      scene(
        'Pinned from the start, and bound',
        'Scroll: the whole header stays and the table’s header stops under it, lower than it would. Let go while scrolled: the area stays revealed until the next scroll. Press the chevron while pinned: the pin lets go first.',
        `<div slStack [gap]="4">
          ${screen(HEADER('[(pinned)]="pinned"'))}
          <p slText size="sm" tone="muted">pinned: {{ pinned }} — o valor é do template e sobrevive a uma nova visita.</p>
        </div>`,
      ),
    ),
  }),
};

export const When: Story = {
  parameters: scenario('when'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Two headings, one at a time',
        'Expanded, the report’s full title and its subtitle; scrolled, the short title alone, and the accessibility tree holds one heading either way. Scroll down and up to watch the swap.',
        viewport(`<main slPage>
  <header slPageHeader>
    <div slPageHeaderTitleArea>
      <div slPageHeaderNav><a slPageHeaderBack href="#relatorios">Relatórios</a></div>
      <div slPageHeaderTitleRow>
        <div slPageHeaderTitle>
          <h1 slPageHeaderHeading data-when="expanded">Relatório de conformidade fiscal do terceiro trimestre</h1>
          <h1 slPageHeaderHeading data-when="snapped">Conformidade fiscal · T3</h1>
          <span slPageHeaderMarks><span slTag tone="success" shape="pill" size="sm"><span slTagBody>Publicado</span></span></span>
          <p slPageHeaderSubheading data-when="expanded">Consolidado das 14 filiais, gerado em 10 de setembro de 2026 às 06:00</p>
        </div>
        <div slPageHeaderActions><button slButton variant="outline">Exportar PDF</button></div>
      </div>
    </div>
    <div slPageHeaderArea>
      <div slPageHeaderContent>
        <p slPageHeaderDescription>Apuração de ICMS, PIS e COFINS por filial, com as divergências apontadas pela auditoria interna e o prazo de regularização de cada uma.</p>
      </div>
    </div>
    ${CONTROLS()}
  </header>
  <div slPageBody>${SECTIONS()}</div>
</main>`),
      ),
    ),
  }),
};

function SIZED(size: string, level: string, note: string) {
  return `<header slPageHeader size="${size}" level="${level}" collapse="manual">
  <div slPageHeaderTitleArea>
    <div slPageHeaderTitleRow>
      <div slPageHeaderTitle>
        <h${level} slPageHeaderHeading>Notas fiscais de entrada</h${level}>
        <p slPageHeaderSubheading>${note}</p>
      </div>
      <div slPageHeaderActions><button slButton tone="accent" size="${size}">Importar XML</button></div>
    </div>
  </div>
</header>`;
}

export const Size: Story = {
  parameters: scenario('size'),
  render: () => ({
    template: grid(
      1,
      scene(
        'sm',
        'A header inside a pane or a drawer: the title on the xl step, the snapped title on md. Here it is an h2, because the pane is not the page — size and rank are two decisions.',
        SIZED('sm', '2', 'sm — 1.125rem, an h2 inside a pane'),
      ) +
        scene(
          'md, the default',
          'The title of a screen, on the 2xl step; snapped it drops to lg. Everything geometric — the pill, the gaps, the padding — comes from the control scales, so a dense page tightens rather than shrinks.',
          SIZED('md', '1', 'md — 1.25rem, the default'),
        ) +
        scene(
          'lg',
          'The landing screen of a module: 3xl, snapped to xl. The actions step with it when the consumer asks; the header itself never sizes another family’s control.',
          SIZED('lg', '1', 'lg — 1.5rem, the landing screen of a module'),
        ),
    ),
  }),
};

export const Navigation: Story = {
  parameters: scenario('navigation'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Four orders, one screen',
        'The arrows change the record in place: heading, mark and subheading follow, the first and the last arrow disable at the ends. Scroll first, then move: the header stays where the scroll left it.',
        '<sl-page-header-records-demo />',
      ),
    ),
  }),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Six actions in a toolbar that folds',
        'Drag the stage narrower by its corner: Duplicar, Imprimir and Exportar fold into the toolbar’s menu first, Reprovar next, and Aprovar — the one with no counterpart — never leaves the row.',
        viewport(
          `<main slPage>${HEADER('', { navigation: false, tabs: false })}<div slPageBody><p slText size="sm">Redimensione o palco: o transbordo é do toolbar, não do cabeçalho.</p></div></main>`,
          'tall',
        ),
      ) +
        scene(
          'Two actions and no toolbar',
          'A header with a primary and a secondary action needs no toolbar: two buttons in the slot, and the row wraps them under the title when the width runs out.',
          viewport(
            `<main slPage>
  <header slPageHeader>
    <div slPageHeaderTitleArea>
      ${NAV()}
      <div slPageHeaderTitleRow>
        ${TITLE()}
        <div slPageHeaderActions>
          <button slButton variant="outline">Reprovar</button>
          <button slButton tone="accent">Aprovar</button>
        </div>
      </div>
    </div>
    ${AREA()}
    ${CONTROLS()}
  </header>
  <div slPageBody><p slText size="sm">Duas ações, sem menu.</p></div>
</main>`,
            'tall',
          ),
        ),
    ),
  }),
};

export const TabsScene: Story = {
  name: 'Tabs',
  parameters: scenario('tabs'),
  render: () => ({
    props: { ...PROPS, tab: 'itens' },
    template: grid(
      1,
      scene(
        'Tabs that stay under the title',
        'Scroll until the area has gone: the tabs sit under the title with the rule between. Switch tabs there: the body changes and the header does not move, because the tabs are the root’s last row and the root is what sticks.',
        viewport(`<main slPage>
  <header slPageHeader>
    <div slPageHeaderTitleArea>
      <div slPageHeaderNav><a slPageHeaderBack href="#pedidos">Pedidos de compra</a></div>
      <div slPageHeaderTitleRow>
        ${TITLE()}
        <div slPageHeaderActions>
          <button slButton variant="outline">Reprovar</button>
          <button slButton tone="accent">Aprovar</button>
        </div>
      </div>
    </div>
    <div slPageHeaderArea><div slPageHeaderContent>${FACTS}</div></div>
    ${CONTROLS()}
    <div slPageHeaderTabs>
      <div slTabs [(value)]="tab">
        <div slTabList aria-label="Secções do pedido">
          <div slTab value="itens">Itens (36)</div>
          <div slTab value="historico">Histórico (7)</div>
          <div slTab value="anexos">Anexos (3)</div>
        </div>
      </div>
    </div>
  </header>
  <div slPageBody>
    @switch (tab) {
      @case ('itens') { ${TABLE()} }
      @case ('historico') {
        <div slStack [gap]="4">
          @for (event of history; track event.when) {
            <p slText size="sm"><strong>{{ event.when }} · {{ event.who }}</strong> — {{ event.what }}</p>
          }
        </div>
      }
      @default {
        <div slStack [gap]="4">
          <p slText size="sm">cotacao-aurora-2026-09.pdf · 412 kB</p>
          <p slText size="sm">cotacao-michelin-2026-09.pdf · 388 kB</p>
          <p slText size="sm">parecer-juridico-04-09.pdf · 1,2 MB</p>
        </div>
      }
    }
  </div>
  ${FOOTER}
</main>`),
      ),
    ),
  }),
};

export const Loading: Story = {
  parameters: scenario('loading'),
  render: () => ({
    template: grid(
      1,
      scene(
        'The title has not arrived',
        'The heading, the subheading and the description stand as skeleton text of their own width — 24, 32 and 40 characters — while the actions stay pressable and the root says aria-busy. Press Chegou: nothing under them moves.',
        '<sl-page-header-loading-demo />',
      ),
    ),
  }),
};

export const Progress: Story = {
  parameters: scenario('progress'),
  render: () => ({
    template: grid(
      1,
      scene(
        'A refresh, over the edge the pill straddles',
        "Press Atualizar: after 200 ms an indeterminate bar grows out of the line the pill straddles, above the tabs and not on the tab strip's own edge, where it would read as the selected tab's indicator. The header and the order stay readable, nothing moves, and the bar holds for at least 400 ms.",
        '<sl-page-header-progress-demo />',
      ) +
        scene(
          "With no tabs, on the header's own hairline",
          "Without tabs the line where the chrome ends is the root's hairline, and the bar covers it the whole width of the header. Scroll until the header snaps: the bar stays on the snapped edge, because it keeps its place beside the controls.",
          '<sl-page-header-progress-demo [tabs]="false" />',
        ),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'A nine-word title, five marks, a long subheading',
        'Expanded, the title wraps and clamps at two lines; the marks wrap to a second row; the subheading wraps. Scroll: the bar holds the title to one line and the subheading to another.',
        viewport(`<main slPage>
  <header slPageHeader>
    <div slPageHeaderTitleArea>
      <div slPageHeaderNav><a slPageHeaderBack href="#contratos">Contratos de fornecimento continuado</a></div>
      <div slPageHeaderTitleRow>
        <div slPageHeaderTitle>
          <h1 slPageHeaderHeading title="Renovação do contrato de fornecimento continuado de pneus, câmaras e serviços de recapagem para a frota pesada da regional Sudeste">
            Renovação do contrato de fornecimento continuado de pneus, câmaras e serviços de recapagem para a frota pesada da regional Sudeste
          </h1>
          <span slPageHeaderMarks>
            <span slTag tone="warning" shape="pill" size="sm"><span slTagBody>Em análise jurídica</span></span>
            <span slTag tone="accent" shape="pill" size="sm"><span slTagBody>Renovação</span></span>
            <span slTag tone="secondary" shape="pill" size="sm"><span slTagBody>Sudeste</span></span>
            <span slTag tone="danger" shape="pill" size="sm"><span slTagBody>Vence em 12 dias</span></span>
            <span slTag tone="success" shape="pill" size="sm"><span slTagBody>Garantia ativa</span></span>
          </span>
          <p slPageHeaderSubheading>Aurora Logística Ltda · Michelin do Brasil · Vigência 01/10/2026 – 30/09/2028 · Gestor: Marina Duarte · Renovação automática desativada</p>
        </div>
        <div slPageHeaderActions>
          <button slButton variant="outline">Enviar ao jurídico</button>
          <button slButton tone="accent">Aprovar renovação</button>
        </div>
      </div>
    </div>
    <div slPageHeaderArea>
      <div slPageHeaderContent>
        <p slPageHeaderDescription>Zweijährige Verlängerung des Rahmenvertrags für Reifen, Schläuche und Runderneuerungsdienste; die Konditionen der ersten Laufzeit bleiben bestehen, die Preisgleitklausel wird an den Index des dritten Quartals gekoppelt.</p>
      </div>
    </div>
    ${CONTROLS()}
  </header>
  <div slPageBody>${SECTIONS()}</div>
  ${FOOTER}
</main>`),
      ) +
        scene(
          'The least a header can be',
          'One heading and nothing else. No nav row, no area, no pill: the parts that are not written leave no vacancy behind, because the stylesheet asks the DOM and not an input.',
          `<header slPageHeader>
  <div slPageHeaderTitleArea>
    <div slPageHeaderTitleRow>
      <div slPageHeaderTitle><h1 slPageHeaderHeading>Painel</h1></div>
    </div>
  </div>
</header>`,
        ),
    ),
  }),
};

export const Narrow: Story = {
  parameters: scenario('narrow'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'The same header in a 360-pixel column',
        'Below 600 pixels the breadcrumbs go and the way back stays, the title steps down a size, the toolbar folds its actions and the arrows take the row under the title. Scroll inside the column: the bar is still one line.',
        `<div class="slotted-demo-measure">${screen(HEADER('', { figure: true }), { compact: true })}</div>`,
      ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Page, sticky sections, sticky table header, footer',
        'Scroll: the header snaps, then each section’s header stops under the chrome, and inside the first the table’s column header stops under that. Pin the header and everything stops lower. The footer waits at the bottom throughout.',
        screen(HEADER(), { sticky: true }),
      ) +
        scene(
          'A header that is not a page’s',
          'Outside a page the rows take the content width and the header still sticks to whatever scrolls — here, a plain box. A detail pane in a master–detail layout is this.',
          viewport(
            `<div class="slotted-demo-page">
  ${HEADER('level="2" size="sm"', { breadcrumbs: false, navigation: false, tabs: false, visual: false })}
  <div slStack [gap]="4">
    @for (line of lines.slice(0, 12); track line.code) {
      <p slText size="sm">{{ line.code }} · {{ line.description }}</p>
    }
  </div>
</div>`,
            'tall',
          ),
        ),
    ),
  }),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  decorators: [
    moduleMetadata({
      providers: [
        providePageHeaderDefaults({
          collapse: 'manual',
          level: '2',
          size: 'sm',
        }),
      ],
    }),
  ],
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Three decisions an application takes once',
        'providePageHeaderDefaults carries collapse, level and size for every header under it — here manual. A header that states any of them itself still wins: this one says size="md". The words come from the language in force.',
        viewport(
          `<main slPage>${HEADER('size="md" #h="slPageHeader"', { navigation: false, tabs: false })}<div slPageBody>
  <div slStack [gap]="2">
    <p slText size="sm">Hover the pill: the names are the catalog’s. The four buttons move the header through the instance with the reason programmatic.</p>
    <div slStack [gap]="2">
      <button slButton size="sm" variant="outline" (click)="h.collapseArea()">collapseArea()</button>
      <button slButton size="sm" variant="outline" (click)="h.expand()">expand()</button>
      <button slButton size="sm" variant="outline" (click)="h.pin()">pin()</button>
      <button slButton size="sm" variant="outline" (click)="h.unpin()">unpin()</button>
    </div>
  </div>
</div></main>`,
          'tall',
        ),
      ) +
        scene(
          'An editable heading',
          'The heading directive sits on the consumer’s own input: the family keeps the rank through role="heading" and aria-level, and the identifier, while the words are the reader’s to change.',
          '<sl-page-header-handle-demo />',
        ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    props: { ...PROPS, reasons: [] as string[] },
    template: grid(
      1,
      scene(
        'Tab through it, then read the reasons',
        'Tab walks the way back, the breadcrumbs, the actions, the arrows, the chevron, the pin, then the buttons inside the area. Press Enter on the chevron and read keyboard; click it and read pointer; scroll and read scroll. Collapse it, then Tab into the section below and back up: the area was inert.',
        `<div slStack [gap]="4">
          ${screen(HEADER('(expandedRequest)="reasons.unshift($event.reason)" (pinnedRequest)="reasons.unshift(\'pin \' + $event.reason)"'))}
          <p slText size="sm" tone="muted">{{ reasons.length === 0 ? 'Nenhum pedido ainda.' : 'Razões: ' + reasons.slice(0, 8).join(' · ') }}</p>
        </div>`,
      ),
    ),
  }),
};
