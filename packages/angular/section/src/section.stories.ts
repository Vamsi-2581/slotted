import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlAvatar } from '@slotted/angular/avatar';
import { SlButton } from '@slotted/angular/button';
import {
  SlCollapsible,
  SlCollapsibleHeader,
  SlCollapsiblePanel,
  SlCollapsibleTrigger,
} from '@slotted/angular/collapsible';
import {
  SlDescriptionList,
  SlDescriptionListDescription,
  SlDescriptionListItem,
  SlDescriptionListTerm,
} from '@slotted/angular/description-list';
import { SlLink } from '@slotted/angular/link';
import { SlPage, SlPageBody, SlPageFooter } from '@slotted/angular/page';
import {
  SlPageHeader,
  SlPageHeaderActions,
  SlPageHeaderArea,
  SlPageHeaderBack,
  SlPageHeaderContent,
  SlPageHeaderControls,
  SlPageHeaderDescription,
  SlPageHeaderHeading,
  SlPageHeaderMarks,
  SlPageHeaderNav,
  SlPageHeaderPin,
  SlPageHeaderSubheading,
  SlPageHeaderTitle,
  SlPageHeaderTitleArea,
  SlPageHeaderTitleRow,
  SlPageHeaderToggle,
  SlPageHeaderVisual,
} from '@slotted/angular/page-header';
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
import { SlTag, SlTagBody } from '@slotted/angular/tag';
import { SlHeadingLevel, SlText } from '@slotted/angular/typography';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlSection } from './section';
import type { SectionGround, SectionLevel, SectionSize } from './section-defaults';
import { provideSectionDefaults } from './section-defaults';
import {
  SlSectionActions,
  SlSectionBody,
  SlSectionDescription,
  SlSectionEyebrow,
  SlSectionHeader,
  SlSectionHeading,
  SlSectionTitle,
} from './section-parts';
import { ANGULAR_SECTION_DOCS, ANGULAR_SECTION_TOKENS } from './section.docs';

const MONEY = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const KINDS = [
  ['Pneu radial 295/80 R22.5 Michelin X Multi Z', 'Pneu 295/80 R22.5', 2980],
  ['Pneu radial 275/80 R22.5 Bridgestone R268', 'Pneu 275/80 R22.5', 2640],
  ['Câmara de ar 22.5 Pirelli', 'Câmara 22.5', 190],
  ['Protetor de câmara 22.5', 'Protetor 22.5', 85],
  ['Serviço de recapagem a frio', 'Recapagem a frio', 1240],
  ['Alinhamento e balanceamento, eixo', 'Alinhamento, eixo', 320],
] as const;
const LINES = Array.from({ length: 36 }, (_, index) => {
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

const PROPS = { history: HISTORY, lines: LINES, some: LINES.slice(0, 8), more: LINES.slice(0, 24) };

const HEADER = `<header slPageHeader>
  <div slPageHeaderTitleArea>
    <div slPageHeaderNav><a slPageHeaderBack href="#pedidos">Pedidos de compra</a></div>
    <div slPageHeaderTitleRow>
      <span slPageHeaderVisual><span slAvatar name="Aurora Logística" shape="square" size="lg" tone="accent"></span></span>
      <div slPageHeaderTitle>
        <h1 slPageHeaderHeading>Pedido de compra PC-2026-004521</h1>
        <span slPageHeaderMarks><span slTag tone="warning" shape="pill" size="sm"><span slTagBody>Em análise</span></span></span>
        <p slPageHeaderSubheading>Aurora Logística Ltda · CNPJ 12.345.678/0001-90</p>
      </div>
      <div slPageHeaderActions>
        <button slButton variant="outline">Reprovar</button>
        <button slButton tone="accent">Aprovar</button>
      </div>
    </div>
  </div>
  <div slPageHeaderArea>
    <div slPageHeaderContent>
      <p slPageHeaderDescription>Reposição de pneus radiais aro 22.5 para a frota de Cariacica. Entrega prevista para 24 de setembro de 2026.</p>
    </div>
  </div>
  <div slPageHeaderControls>
    <button slPageHeaderToggle></button>
    <button slPageHeaderPin></button>
  </div>
</header>`;

function TABLE(rows = 'lines', sticky = true) {
  /* Three columns for a header held under the page chrome (the table is then
     as wide as its content), four otherwise. */
  const unit = !sticky;
  return `<div slTable [columns]="${unit ? 4 : 3}" variant="ruled" ${sticky ? 'stickyHeader stickyTo="page"' : ''}>
  <div slTableContent>
    <caption slTableCaption>Itens do pedido</caption>
    <thead slTableHead>
      <tr slTableRow>
        <th slTableColumnHeader>Código</th>
        <th slTableColumnHeader>Descrição</th>
        <th slTableColumnHeader numeric>${unit ? 'Quantidade' : 'Qtd.'}</th>
        ${unit ? '<th slTableColumnHeader numeric>Unitário</th>' : ''}
      </tr>
    </thead>
    <tbody slTableBody>
      @for (line of ${rows}; track line.code) {
        <tr slTableRow [value]="line.code">
          <th slTableRowHeader>{{ line.code }}</th>
          <td slTableCell>{{ ${unit ? 'line.description' : 'line.short'} }}</td>
          <td slTableCell numeric>{{ line.quantity }}</td>
          ${unit ? '<td slTableCell numeric>{{ line.unit }}</td>' : ''}
        </tr>
      }
    </tbody>
  </div>
</div>`;
}

function ITEMS(attributes = '', body = TABLE('some', false)) {
  return `<section slSection id="itens" ${attributes}>
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
  <div slSectionBody>${body}</div>
</section>`;
}

function CONDITIONS(attributes = '') {
  return `<section slSection id="condicoes" ${attributes}>
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
        <dt slDescriptionListTerm>Frete</dt>
        <dd slDescriptionListDescription>CIF, por conta do fornecedor</dd>
      </div>
    </div>
  </div>
</section>`;
}

function HISTORY_SECTION(attributes = '') {
  return `<section slSection id="historico" ${attributes}>
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

function FLEET(override = false) {
  return `<section slSection size="lg">
  <div slSectionHeader>
    <div slSectionTitle>
      <div slSectionHeading>Frota</div>
      <p slSectionDescription>A rank the outline gave: level 2 inside a page.</p>
    </div>
  </div>
  <div slSectionBody>
    <section slSection>
      <div slSectionHeader>
        <div slSectionTitle>
          <div slSectionHeading>Veículos pesados</div>
          <p slSectionDescription>One deeper: level 3, without being told.</p>
        </div>
      </div>
      <div slSectionBody>
        <section slSection size="sm" ${override ? 'level="5"' : ''}>
          <div slSectionHeader>
            <div slSectionTitle>
              <div slSectionHeading>Cavalos mecânicos</div>
              <p slSectionDescription>${override ? 'level="5": the consumer’s word over the outline.' : 'One deeper again: level 4.'}</p>
            </div>
          </div>
          <div slSectionBody><p slText size="sm">Scania R 450 · Volvo FH 540 · Mercedes Actros 2651</p></div>
        </section>
      </div>
    </section>
  </div>
</section>`;
}

const FOOTER = `<footer slPageFooter>
  <button slButton variant="ghost">Cancelar</button>
  <button slButton tone="accent">Enviar para aprovação</button>
</footer>`;

function viewport(body: string, size = 'screen') {
  return `<div class="slotted-demo-viewport" data-layout="page" data-scroll data-size="${size}">${body}</div>`;
}

function page(body: string, attributes = '', footer = false) {
  return viewport(
    `<main slPage ${attributes}>${HEADER}<div slPageBody>${body}</div>${footer ? FOOTER : ''}</main>`,
  );
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

interface SectionStoryArgs {
  divider: boolean;
  ground: SectionGround;
  level: SectionLevel;
  size: SectionSize;
  sticky: boolean;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_SECTION_DOCS.section.scenes, {
    playground: Playground,
    anatomy: Anatomy,
    level: Level,
    size: Size,
    separation: Separation,
    sticky: Sticky,
    nested: Nested,
    content: Content,
    composition: Composition,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

const meta: Meta<SectionStoryArgs> = {
  title: 'Components/Section',
  decorators: [
    moduleMetadata({
      imports: [
        SlSection,
        SlSectionHeader,
        SlSectionTitle,
        SlSectionEyebrow,
        SlSectionHeading,
        SlSectionDescription,
        SlSectionActions,
        SlSectionBody,
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
        SlPageHeaderArea,
        SlPageHeaderContent,
        SlPageHeaderDescription,
        SlPageHeaderControls,
        SlPageHeaderToggle,
        SlPageHeaderPin,
        SlAvatar,
        SlTag,
        SlTagBody,
        SlButton,
        SlLink,
        SlCollapsible,
        SlCollapsibleHeader,
        SlCollapsibleTrigger,
        SlCollapsiblePanel,
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
        SlHeadingLevel,
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Section',
        description:
          'One unit of content inside a page: a header — eyebrow, heading, description, actions — and a body one outline step deeper. A region when it has a heading, a sticky header under the page chrome when asked, and never a card.',
        framework: 'Angular',
        ...ANGULAR_SECTION_DOCS.section,
        tokens: ANGULAR_SECTION_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<SectionStoryArgs>;

export const Playground: Story = {
  args: { divider: true, ground: 'none', level: 'auto', size: 'md', sticky: false },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...PROPS, ...args },
    template: page(
      `<div slStack [gap]="9">
  ${ITEMS('[size]="size" [level]="level" [ground]="ground" [divider]="divider" [sticky]="sticky"', TABLE())}
  ${CONDITIONS('[size]="size" [level]="level" [ground]="ground" [divider]="divider" [sticky]="sticky"')}
</div>`,
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
        'Every part, written out',
        'The eyebrow with the count, the heading at level 2 because the page steps the outline, the description under it, two actions at the end of the row, and the body with the first rows of the table.',
        viewport(`<main slPage><div slPageBody>${ITEMS('divider')}</div></main>`, 'tall'),
      ),
    ),
  }),
};

export const Level: Story = {
  parameters: scenario('level'),
  render: () => ({
    template: grid(
      2,
      scene(
        'The outline decides',
        'Inside a page body the first section is level 2, the one inside it 3, the one inside that 4 — none of them told, because the body of each carries slHeadingLevel. The headings here are divs, so the role and the level are written; an h2 would be left alone.',
        `<div slHeadingLevel>${FLEET()}</div>`,
      ) +
        scene(
          'level="5" on the innermost',
          'The consumer’s rank wins over the outline. It skips one, which the HTML Standard forbids, and the level rendered is still the one stated.',
          `<div slHeadingLevel>${FLEET(true)}</div>`,
        ),
    ),
  }),
};

export const Size: Story = {
  parameters: scenario('size'),
  render: () => ({
    template: grid(
      3,
      scene(
        'sm',
        'A group inside a form or a pane: the heading on md, the description on sm, the eyebrow the same xs at every size.',
        CONDITIONS('size="sm"'),
      ) +
        scene(
          'md, the default',
          'A section of a page: the heading on lg. Size says nothing about rank — every one of these is a level 1 here, outside a page.',
          CONDITIONS('size="md"'),
        ) +
        scene(
          'lg',
          'The one section a screen is about: the heading on xl, a step under a page header’s own title.',
          CONDITIONS('size="lg"'),
        ),
    ),
  }),
};

export const Separation: Story = {
  parameters: scenario('separation'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Three sections, three separations',
        'On the sunken canvas: the first separated by the stack’s gap alone, the second by a divider under its header, the third by a surface with an edge and a radius — and no shadow, no hover, because a section is not a card.',
        page(
          `<div slStack [gap]="9">${CONDITIONS()}${ITEMS('divider')}${HISTORY_SECTION('ground="surface"')}</div>`,
        ),
      ),
    ),
  }),
};

export const Sticky: Story = {
  parameters: scenario('sticky'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Headers that stay under the page chrome',
        'Scroll: the page header snaps, then the first section’s header stops under it, and the second pushes the first away. Pin the page header and every section header stops lower — the page publishes where its chrome ends.',
        page(
          `<div slStack [gap]="9">${ITEMS('divider sticky', TABLE())}${CONDITIONS('divider sticky')}${HISTORY_SECTION('divider sticky')}</div>`,
          '',
          true,
        ),
      ) +
        scene(
          'Without a page',
          'In a plain scrolling box the property is absent, so the header sticks to the top of the box. The ground it paints falls back to the surface.',
          viewport(
            `<div class="slotted-demo-page">${ITEMS('divider sticky', TABLE('more', false))}</div>`,
            'tall',
          ),
        ),
    ),
  }),
};

export const Nested: Story = {
  parameters: scenario('nested'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Three depths, three ranks',
        'Frota holds Veículos pesados, which holds Cavalos mecânicos. Each body steps the outline for the next, and every rule the family owns reaches its parts as a child, so the lg heading of the outer styles nothing of the inner.',
        viewport(`<main slPage ground="surface"><div slPageBody>${FLEET()}</div></main>`, 'tall'),
      ),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A nine-word heading and a long eyebrow',
        'The heading wraps to two lines and the eyebrow wraps in small capitals; the description keeps its measure of seventy characters and the actions wrap under the title.',
        `<section slSection divider>
  <div slSectionHeader>
    <div slSectionTitle>
      <span slSectionEyebrow>Anexo IV — Especificações técnicas obrigatórias do contrato</span>
      <h2 slSectionHeading>Requisitos de homologação, garantia, recapagem e descarte ambientalmente adequado dos pneus fornecidos</h2>
      <p slSectionDescription>Der Lieferant gewährleistet die Rückverfolgbarkeit jeder Reifencharge über die gesamte Vertragslaufzeit und übernimmt die fachgerechte Entsorgung gemäß den geltenden Umweltvorschriften.</p>
    </div>
    <div slSectionActions><button slButton size="sm" variant="outline">Descarregar anexo</button></div>
  </div>
  <div slSectionBody><p slText size="sm">…</p></div>
</section>`,
      ) +
        scene(
          'The same section in a 360-pixel column, and one with nothing but a body',
          'The row wraps and the actions take a line of their own. Below it, a section with no header is a plain section: no region, no name, no vacancy where the header would be.',
          `<div class="slotted-demo-measure">
  <div slStack [gap]="8">
    ${CONDITIONS('divider')}
    <section slSection><div slSectionBody><p slText size="sm">Só o corpo. Nenhuma região, nenhum nome.</p></div></section>
  </div>
</div>`,
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
        'A table, a collapsible and a description list under one sticky header',
        'The body steps the outline, so the collapsible’s header is a level under the section’s. Scroll: the section header stays over all three, and the table’s own column header stops under it.',
        page(
          `<section slSection divider sticky>
  <div slSectionHeader>
    <div slSectionTitle>
      <span slSectionEyebrow>36 itens</span>
      <h2 slSectionHeading>Itens e condições</h2>
    </div>
  </div>
  <div slSectionBody>
    <div slStack [gap]="6">
      ${TABLE('more')}
      <div slCollapsible level="3" variant="framed">
        <h3 slCollapsibleHeader><button slCollapsibleTrigger description="4 condições">Condições comerciais</button></h3>
        <div slCollapsiblePanel>
          <div slDescriptionList [columns]="2">
            <div slDescriptionListItem>
              <dt slDescriptionListTerm>Prazo de pagamento</dt>
              <dd slDescriptionListDescription>45 dias contra a fatura</dd>
            </div>
            <div slDescriptionListItem>
              <dt slDescriptionListTerm>Garantia</dt>
              <dd slDescriptionListDescription>24 meses ou 120.000 km</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
          '',
          true,
        ),
      ),
    ),
  }),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  decorators: [
    moduleMetadata({
      providers: [provideSectionDefaults({ divider: true, ground: 'surface', size: 'sm' })],
    }),
  ],
  render: () => ({
    props: PROPS,
    template: grid(
      2,
      scene(
        'Four decisions an application takes once',
        'provideSectionDefaults carries size, divider, ground and sticky for every section under it. The second section says ground="none" itself and wins.',
        `<div slStack [gap]="6">${CONDITIONS()}${CONDITIONS('ground="none"')}</div>`,
      ) +
        scene(
          'A linked heading, and a hash link to the section',
          'The heading directive sits on the consumer’s own link: the family keeps the rank through role="heading" and aria-level, and the id. The link below reaches the section by hash and lands under the page chrome.',
          `<div slStack [gap]="6">
  <section slSection id="historico-ligado">
    <div slSectionHeader>
      <div slSectionTitle><a slLink slSectionHeading href="#historico-ligado">Histórico de aprovações</a></div>
    </div>
    <div slSectionBody><p slText size="sm">{{ history[0].what }}</p></div>
  </section>
  <a slLink href="#historico-ligado">Ir ao histórico</a>
</div>`,
        ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    props: PROPS,
    template: grid(
      1,
      scene(
        'Regions in the landmark list, ranks in the heading list',
        'Open the landmark list: main, then a region per section named by its heading. Open the heading list: h1 for the order, h2 for each section. Follow the link at the top: the section lands under the chrome, not behind it.',
        page(
          `<div slStack [gap]="9">
  <p slText size="sm"><a slLink href="#historico">Ir ao histórico de aprovações</a></p>
  ${ITEMS('divider', TABLE('lines', false))}
  ${CONDITIONS('divider')}
  ${HISTORY_SECTION('divider')}
</div>`,
          '',
          true,
        ),
      ),
    ),
  }),
};
