import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCreditCard, lucideFileText, lucideSend } from '@ng-icons/lucide';
import { SlAvatar } from '@slotted/angular/avatar';
import { SlButton } from '@slotted/angular/button';
import {
  SlCollapsible,
  SlCollapsibleHeader,
  SlCollapsiblePanel,
  SlCollapsibleTrigger,
} from '@slotted/angular/collapsible';
import { SlIcon } from '@slotted/angular/icon';
import { SlLink } from '@slotted/angular/link';
import {
  SlResultState,
  SlResultStateContent,
  SlResultStateDescription,
  SlResultStateTitle,
} from '@slotted/angular/result-state';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import {
  SlTimeline,
  SlTimelineActions,
  SlTimelineActor,
  SlTimelineDescription,
  SlTimelineEmpty,
  SlTimelineGroup,
  SlTimelineGroupList,
  SlTimelineItem,
  SlTimelineList,
  SlTimelineMarker,
  SlTimelineOpposite,
  SlTimelineTime,
  SlTimelineTitle,
} from './timeline';
import type {
  TimelineGrowing,
  TimelineMode,
  TimelineOrder,
  TimelineOrientation,
  TimelinePlacement,
  TimelineSize,
  TimelineTimeFormat,
  TimelineTone,
  TimelineVariant,
} from './timeline.constants';
import { provideTimelineDefaults } from './timeline.constants';
import { ANGULAR_TIMELINE_DOCS, ANGULAR_TIMELINE_TOKENS } from './timeline.docs';

interface TimelineStoryArgs {
  autoComplete: boolean;
  growing: TimelineGrowing;
  mode: TimelineMode;
  order: TimelineOrder;
  orientation: TimelineOrientation;
  placement: TimelinePlacement;
  size: TimelineSize;
  timeFormat: TimelineTimeFormat;
  tone: TimelineTone;
  variant: TimelineVariant;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_TIMELINE_DOCS.timeline.scenes, {
    playground: Playground,
    feed: Feed,
    placement: Placement,
    orientation: Orientation,
    order: Order,
    statuses: Statuses,
    appearance: Appearance,
    groups: Groups,
    growing: Growing,
    fresh: Fresh,
    timestamps: Timestamps,
    content: Content,
    composition: Composition,
    empty: Empty,
    keyboard: Keyboard,
  }) as never;

const IMPORTS = [
  NgIcon,
  SlAvatar,
  SlButton,
  SlCollapsible,
  SlCollapsibleHeader,
  SlCollapsiblePanel,
  SlCollapsibleTrigger,
  SlIcon,
  SlLink,
  SlResultState,
  SlResultStateContent,
  SlResultStateDescription,
  SlResultStateTitle,
  SlTimeline,
  SlTimelineActions,
  SlTimelineActor,
  SlTimelineDescription,
  SlTimelineEmpty,
  SlTimelineGroup,
  SlTimelineGroupList,
  SlTimelineItem,
  SlTimelineList,
  SlTimelineMarker,
  SlTimelineOpposite,
  SlTimelineTime,
  SlTimelineTitle,
];

/** One moment, so the relative readings on the page never drift from the captions. */
const NOW = Date.UTC(2026, 8, 14, 15, 32);

const meta: Meta<TimelineStoryArgs> = {
  title: 'Components/Timeline',
  component: SlTimeline,
  decorators: [
    moduleMetadata({
      imports: IMPORTS,
      providers: [
        provideIcons({ lucideCreditCard, lucideFileText, lucideSend }),
        provideTimelineDefaults({ locale: 'pt-BR', now: NOW, timeZone: 'America/Sao_Paulo' }),
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Timeline',
        description:
          'Uma lista ordenada de eventos sobre uma linha, com hora de máquina, ator, marcador e ações — e, em modo feed, o padrão Feed do APG.',
        framework: 'Angular',
        ...ANGULAR_TIMELINE_DOCS.timeline,
        tokens: ANGULAR_TIMELINE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<TimelineStoryArgs>;

/**
 * One demonstration: what it is called, what to look at, and the stage that
 * owns the distance between the examples on it. Every story below composes
 * this rather than laying itself out.
 */
const scene = (label: string, note: string, body: string) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const glyph = (name: string) =>
  `<span slIcon slTimelineMarker><ng-icon aria-hidden="true" name="${name}"></ng-icon></span>`;
const ANA = `<span slAvatar name="Ana Ribeiro" size="xs" tone="accent"></span>`;
const SOLARIS = `<span slAvatar name="Solaris Fretes" shape="square" size="xs" tone="secondary"></span>`;

/** The invoice every scene that does not need its own events is drawn from. */
const invoice = (item: 'li' | 'article' = 'li', current = true) => `
  <${item} slTimelineItem time="2026-09-08T12:12:00Z" title="Fatura criada" description="Rascunho INV-4821 para Solaris Fretes, 12 linhas.">
    <div slTimelineActor>${ANA} Ana Ribeiro</div>
  </${item}>
  <${item} slTimelineItem time="2026-09-08T12:15:00Z" title="Enviada ao cliente" description="Para faturacao@solarisfretes.example, com o PDF anexo.">
    ${glyph('lucideSend')}
  </${item}>
  <${item} slTimelineItem time="2026-09-11T11:30:00Z" title="Pagamento falhou" description="Cartão terminado em 4421 recusado pelo emissor." tone="danger">
    ${glyph('lucideCreditCard')}
    <div slTimelineActions>
      <button slButton size="sm" variant="outline" type="button">Repetir pagamento</button>
      <button slButton size="sm" tone="secondary" variant="ghost" type="button">Contactar cliente</button>
    </div>
  </${item}>
  <${item} slTimelineItem time="2026-09-14T13:32:00Z" title="Paga" description="R$ 18.240,00 por transferência bancária." tone="success" ${current ? 'current' : ''}>
    <div slTimelineActor>${SOLARIS} Solaris Fretes</div>
  </${item}>`;

const FIRST_TWO = `
  <li slTimelineItem time="2026-09-08T12:12:00Z" title="Fatura criada" description="Rascunho INV-4821 para Solaris Fretes, 12 linhas.">
    <div slTimelineActor>${ANA} Ana Ribeiro</div>
  </li>
  <li slTimelineItem time="2026-09-08T12:15:00Z" title="Enviada ao cliente" description="Para faturacao@solarisfretes.example, com o PDF anexo.">
    ${glyph('lucideSend')}
  </li>`;

const LAST_TWO = `
  <li slTimelineItem time="2026-09-11T11:30:00Z" title="Pagamento falhou" description="Cartão terminado em 4421 recusado pelo emissor." tone="danger">
    ${glyph('lucideCreditCard')}
    <div slTimelineActions>
      <button slButton size="sm" variant="outline" type="button">Repetir pagamento</button>
      <button slButton size="sm" tone="secondary" variant="ghost" type="button">Contactar cliente</button>
    </div>
  </li>
  <li slTimelineItem time="2026-09-14T13:32:00Z" title="Paga" description="R$ 18.240,00 por transferência bancária." tone="success" current>
    <div slTimelineActor>${SOLARIS} Solaris Fretes</div>
  </li>`;

const NEWEST_FIRST = `
  <article slTimelineItem time="2026-09-14T13:32:00Z" title="Paga" description="R$ 18.240,00 por transferência bancária." tone="success">
    <div slTimelineActor>${SOLARIS} Solaris Fretes</div>
  </article>
  <article slTimelineItem time="2026-09-11T11:30:00Z" title="Pagamento falhou" description="Cartão terminado em 4421 recusado pelo emissor." tone="danger">
    ${glyph('lucideCreditCard')}
  </article>
  <article slTimelineItem time="2026-09-08T12:15:00Z" title="Enviada ao cliente">${glyph('lucideSend')}</article>
  <article slTimelineItem time="2026-09-08T12:12:00Z" title="Fatura criada">
    <div slTimelineActor>${ANA} Ana Ribeiro</div>
  </article>`;

const TRACKING = `
  <li slTimelineItem time="2026-09-12T19:40:00Z" title="Pedido confirmado"></li>
  <li slTimelineItem time="2026-09-13T12:05:00Z" title="Embalado no armazém de São Paulo"></li>
  <li slTimelineItem time="2026-09-14T10:20:00Z" title="Em trânsito" description="Saiu do centro de Campinas no caminhão 118." current></li>
  <li slTimelineItem title="Saiu para entrega"></li>
  <li slTimelineItem title="Entregue" description="À espera da confirmação da transportadora." loading></li>`;

const tracking = (attributes = '') =>
  `<div slTimeline label="Rastreio da encomenda" tone="accent" autoComplete ${attributes}><ol slTimelineList>${TRACKING}</ol></div>`;

const RELEASES = [
  [
    '2026-06-02T00:00:00Z',
    'Junho de 2026',
    '2.12 — Faturas recorrentes',
    'Agendas, pausas e modelos por cliente.',
  ],
  [
    '2026-07-20T00:00:00Z',
    'Julho de 2026',
    '2.13 — Multimoeda',
    'Faturas na moeda do cliente, liquidadas na sua.',
  ],
  [
    '2026-09-14T00:00:00Z',
    'Setembro de 2026',
    '2.14 — Novas tentativas de pagamento',
    'Um cartão recusado volta a ser tentado num calendário que o cliente vê.',
  ],
] as const;

const releases = (attributes = '') =>
  `<div slTimeline label="Histórico de versões" tone="accent" variant="solid" ${attributes}><ol slTimelineList>${RELEASES.map(
    ([value, label, title, description]) =>
      `<li slTimelineItem title="${title}" description="${description}"><div slTimelineOpposite><time slTimelineTime value="${value}">${label}</time></div></li>`,
  ).join('')}</ol></div>`;

export const Playground: Story = {
  args: {
    autoComplete: false,
    growing: 'none',
    mode: 'list',
    order: 'oldest-first',
    orientation: 'vertical',
    placement: 'end',
    size: 'md',
    timeFormat: 'absolute',
    tone: 'secondary',
    variant: 'outline',
  },
  argTypes: {
    growing: { control: 'radio', options: ['none', 'button', 'scroll'] },
    mode: { control: 'radio', options: ['list', 'feed'] },
    order: { control: 'radio', options: ['oldest-first', 'newest-first'] },
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    placement: { control: 'radio', options: ['end', 'start', 'alternate'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    timeFormat: { control: 'radio', options: ['absolute', 'relative'] },
    tone: { control: 'select', options: ['secondary', 'accent', 'success', 'warning', 'danger'] },
    variant: { control: 'radio', options: ['solid', 'outline', 'subtle', 'plain'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `
<div class="slotted-demo-stage" data-layout="block">
  <div
    slTimeline
    label="Atividade da fatura"
    [autoComplete]="autoComplete"
    [growing]="growing"
    [mode]="mode"
    [order]="order"
    [orientation]="orientation"
    [placement]="placement"
    [size]="size"
    [timeFormat]="timeFormat"
    [tone]="tone"
    [variant]="variant"
  >
    @if (mode === 'feed') {
      <div slTimelineList>${invoice('article')}</div>
    } @else {
      <ol slTimelineList>${invoice()}</ol>
    }
  </div>
</div>`,
  }),
};

export const Feed: Story = {
  parameters: scenario('feed'),
  render: () => ({
    props: {
      loading: false,
      more: [] as { time: string; title: string; description?: string }[],
      load(this: {
        loading: boolean;
        more: { time: string; title: string; description?: string }[];
      }) {
        this.loading = true;
        window.setTimeout(() => {
          this.more = [
            { time: '2026-09-14T13:33:00Z', title: 'Recibo enviado' },
            {
              description: 'Pelo cliente, no portal.',
              time: '2026-09-14T14:02:00Z',
              title: 'Recibo transferido',
            },
          ];
          this.loading = false;
        }, 900);
      },
    },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'mode="feed" · growing="button" · [count]="12"',
    'Um div com role=feed e artigos com tabindex, posição e tamanho do conjunto. Tab para em cada evento; PageDown e PageUp saltam entre eles; carregar mais acrescenta ao fim e a posição de cada artigo continua a contar.',
    `<div slTimeline label="Atividade da conta" mode="feed" growing="button" order="newest-first" timeFormat="relative" [count]="12" [loading]="loading" (loadMoreRequest)="load()">
      <div slTimelineList>
        ${NEWEST_FIRST}
        @for (event of more; track event.title) {
          <article slTimelineItem [time]="event.time" [title]="event.title" [description]="event.description"></article>
        }
      </div>
    </div>`,
  )}
</div>`,
  }),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'placement="end" com [slTimelineOpposite]',
    'A hora do outro lado da linha, numa coluna de largura fixa: a leitura clássica, com os títulos alinhados entre si.',
    releases(),
  )}
  ${scene(
    'placement="start"',
    'A fila espelhada: o corpo antes da linha e alinhado a ela, o lado oposto depois. Num documento RTL é a mesma linha invertida, porque a grelha é lógica.',
    `<div slTimeline label="Atividade da fatura" placement="start"><ol slTimelineList>${FIRST_TWO}</ol></div>`,
  )}
  ${scene(
    'placement="alternate"',
    'A linha ao meio e os eventos a revezar-se. Reduza o palco abaixo de 480 px: alternate cai para um lado só e a data passa para a linha acima do corpo.',
    releases('placement="alternate"'),
  )}
</div>`,
  }),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'orientation="horizontal"',
    'Colunas iguais, a linha ao longo do centro dos marcadores, e rolagem no eixo em linha quando não cabe. Abaixo de 480 px da sua própria largura volta a ser uma coluna.',
    tracking('orientation="horizontal"'),
  )}
  ${scene(
    'orientation="horizontal" [reflow]="false"',
    'A mesma fila sem refluxo: em qualquer largura continua a rolar de lado, que é o que um consumidor quer numa barra de etapas.',
    tracking('orientation="horizontal" [reflow]="false"'),
  )}
</div>`,
  }),
};

export const Order: Story = {
  parameters: scenario('order'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="2">
  ${scene(
    'order="oldest-first"',
    'O passado está antes do atual: os dois primeiros ficam concluídos e a linha depois do atual traceja.',
    tracking(),
  )}
  ${scene(
    'order="newest-first"',
    'O mesmo array escrito ao contrário pelo consumidor. O passado está depois do atual, e é lá que autoComplete corta; nada foi reordenado.',
    `<div slTimeline label="Rastreio" tone="accent" autoComplete order="newest-first"><ol slTimelineList>
      <li slTimelineItem title="Entregue" description="À espera da confirmação da transportadora." loading></li>
      <li slTimelineItem title="Saiu para entrega"></li>
      <li slTimelineItem time="2026-09-14T10:20:00Z" title="Em trânsito" current></li>
      <li slTimelineItem time="2026-09-13T12:05:00Z" title="Embalado no armazém de São Paulo"></li>
      <li slTimelineItem time="2026-09-12T19:40:00Z" title="Pedido confirmado"></li>
    </ol></div>`,
  )}
</div>`,
  }),
};

export const Statuses: Story = {
  parameters: scenario('statuses'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'complete · current · pendente · loading',
    'Um disco cheio com check, um alvo, um anel com um ponto e o anel do spinner. Em alto contraste os quatro continuam quatro formas.',
    tracking(),
  )}
</div>`,
  }),
};

const TONES = ['secondary', 'accent', 'success', 'warning', 'danger'];
const swatches = (variant: string) =>
  `<div slTimeline label="Variante ${variant}" variant="${variant}"><ol slTimelineList>${TONES.map(
    (tone) => `<li slTimelineItem title="${tone}" tone="${tone}"></li>`,
  ).join('')}</ol></div>`;
const twoEvents = (attributes: string) =>
  `<div slTimeline label="Atividade da fatura" ${attributes}><ol slTimelineList>${FIRST_TWO}</ol></div>`;

export const Appearance: Story = {
  parameters: scenario('appearance'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="2">
  ${scene('variant="outline"', 'O anel oco, na tinta do tom; o fundo da página tapa a linha dentro dele.', swatches('outline'))}
  ${scene('variant="solid"', 'Um disco cheio na tinta do tom.', swatches('solid'))}
  ${scene('variant="subtle"', 'A omissão: um núcleo sólido num disco suave do próprio tom.', swatches('subtle'))}
  ${scene('variant="plain"', 'Só o núcleo, enfiado na linha, para uma fila de commits ou um log.', swatches('plain'))}
</div>
<div class="slotted-demo-grid" data-columns="1">
  ${scene('size="sm"', 'Ponto de 11 px e tipo de 12 px, com o ritmo entre eventos a acompanhar.', twoEvents('size="sm"'))}
  ${scene('size="md"', 'A omissão: ponto de 13 px, do tamanho do spinner, sobre o tipo de 13 px do controlo médio.', twoEvents(''))}
  ${scene('size="lg"', 'Ponto de 15 px e tipo de 14 px; a densidade restata os três.', twoEvents('size="lg"'))}
</div>`,
  }),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'collapsible · [defaultOpen] · [level]',
    'Hoje aberto, a semana passada fechada, agosto sem gatilho. A linha quebra em cada heading, e a lista fechada continua no DOM.',
    `<div slTimeline label="Atividade da fatura" [level]="3" timeFormat="relative">
      <ol slTimelineList>
        <li slTimelineGroup label="Hoje" collapsible>
          <ol slTimelineGroupList>
            <li slTimelineItem time="2026-09-14T13:32:00Z" title="Paga" tone="success"></li>
            <li slTimelineItem time="2026-09-14T13:33:00Z" title="Recibo enviado"></li>
          </ol>
        </li>
        <li slTimelineGroup label="Semana passada" collapsible [defaultOpen]="false">
          <ol slTimelineGroupList>
            <li slTimelineItem time="2026-09-11T11:30:00Z" title="Pagamento falhou" tone="danger"></li>
            <li slTimelineItem time="2026-09-08T12:15:00Z" title="Enviada ao cliente"></li>
          </ol>
        </li>
        <li slTimelineGroup label="Agosto">
          <ol slTimelineGroupList>
            <li slTimelineItem time="2026-08-27T14:00:00Z" timeLabel="27 de ago." title="Cliente adicionado"></li>
            <li slTimelineItem time="2026-08-29T18:30:00Z" timeLabel="29 de ago." title="Tabela de preços acordada"></li>
          </ol>
        </li>
      </ol>
    </div>`,
  )}
</div>`,
  }),
};

export const Growing: Story = {
  parameters: scenario('growing'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="2">
  ${scene('growing="button"', 'Um botão no fim do carregado; enquanto loading, o anel e a mensagem no mesmo sítio.', twoEvents('growing="button"'))}
  ${scene('growing="button" loading', 'O botão deu lugar ao anel: a lista está aria-busy e nada pode ser pedido duas vezes.', twoEvents('growing="button" loading'))}
</div>`,
  }),
};

export const Fresh: Story = {
  parameters: scenario('fresh'),
  render: () => ({
    props: { held: 3 },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    '[freshCount]="3" · (revealRequest)',
    'Três eventos à espera atrás da pílula, anunciados uma vez. Pressione-a: o consumidor junta-os ao array e a contagem volta a zero.',
    `<div slTimeline label="Atividade da conta" mode="feed" order="newest-first" timeFormat="relative" [freshCount]="held" (revealRequest)="held = 0">
      <div slTimelineList>${NEWEST_FIRST}</div>
    </div>`,
  )}
</div>`,
  }),
};

export const Timestamps: Story = {
  parameters: scenario('timestamps'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'timeZone="America/Sao_Paulo" · "UTC" · valor de parede',
    'O mesmo instante 13:32Z escrito em dois fusos, e um valor sem fuso escrito como está — nunca convertido.',
    `<div slTimeline label="Fusos"><ol slTimelineList>
      <li slTimelineItem time="2026-09-14T13:32:00Z" title="Instante" description="America/Sao_Paulo"></li>
      <li slTimelineItem time="2026-09-14T10:32" title="Valor de parede" description="Escrito como está: 10:32 é 10:32"></li>
    </ol></div>
    <div slTimeline label="Fusos" timeZone="UTC"><ol slTimelineList>
      <li slTimelineItem time="2026-09-14T13:32:00Z" title="Instante" description="UTC"></li>
    </ol></div>`,
  )}
  ${scene(
    'timeFormat="relative" · now',
    'Há 2 horas, há 3 dias, há 6 dias — e o absoluto em title, ao passar o ponteiro. now vem de provideTimelineDefaults, para o servidor e o cliente escreverem a mesma coisa.',
    `<div slTimeline label="Atividade" mode="feed" order="newest-first" timeFormat="relative"><div slTimelineList>${NEWEST_FIRST}</div></div>`,
  )}
</div>`,
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'nove palavras · token sem quebra · árabe · avatar no marcador · sem título',
    'O título quebra dentro da sua coluna e o marcador fica na primeira linha; a referência quebra em qualquer sítio; o árabe lê da direita; o avatar enche o anel; o evento sem título é rotulado pelo ator.',
    `<div slTimeline label="Atividade da fatura"><ol slTimelineList>
      <li slTimelineItem time="2026-09-10T20:45:00Z" title="Aprovou a cotação revista do programa de remessas transfronteiriças da Solaris Fretes" description="Referência TRX-2026-09-10-000000000000000000000000000000000000000000000000000000000000-A">
        <span slTimelineMarker slAvatar name="Ana Ribeiro" size="xs" tone="accent"></span>
      </li>
      <li slTimelineItem time="2026-09-11T11:30:00Z">
        <span slTimelineTitle dir="rtl" lang="ar">تم إرسال الفاتورة إلى العميل</span>
        <span slTimelineDescription dir="rtl" lang="ar">مع ملف PDF مرفق.</span>
      </li>
      <li slTimelineItem time="2026-09-12T13:00:00Z" description="Adicionou uma nota sem título.">
        <div slTimelineActor>${ANA} Ana Ribeiro</div>
      </li>
    </ol></div>`,
  )}
  ${scene(
    '360 px',
    'A mesma lista numa coluna estreita: a hora desce para a sua própria linha e o título fica com a medida inteira.',
    `<div class="slotted-demo-measure"><div slTimeline label="Atividade da fatura"><ol slTimelineList>${LAST_TWO}</ol></div></div>`,
  )}
</div>`,
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'a[slLink] no título · [slCollapsible] no corpo · button[slButton] nas ações · #list="slTimelineList"',
    'Cada parte é uma família que já existe: o título é um link, a resposta do emissor é uma collapsible, as ações são botões. O botão fora da lista chama list.focusItem(2) pela referência exportada.',
    `<div slTimeline label="Atividade da fatura" mode="feed">
      <div slTimelineList #list="slTimelineList">
        <article slTimelineItem time="2026-09-11T11:30:00Z" description="Cartão terminado em 4421 recusado pelo emissor." tone="danger">
          ${glyph('lucideCreditCard')}
          <a slTimelineTitle slLink href="#fatura-4821">Pagamento falhou</a>
          <div slCollapsible variant="plain">
            <h4 slCollapsibleHeader><button slCollapsibleTrigger>Ver resposta do emissor</button></h4>
            <div slCollapsiblePanel>Código 05: não honrar. Segunda tentativa agendada para 18 de setembro.</div>
          </div>
          <div slTimelineActions>
            <button slButton size="sm" variant="outline" type="button">Repetir pagamento</button>
            <button slButton size="sm" tone="secondary" variant="ghost" type="button">Contactar cliente</button>
          </div>
        </article>
        <article slTimelineItem time="2026-09-12T13:00:00Z" title="Segundo aviso enviado" tone="warning">${glyph('lucideFileText')}</article>
        <article slTimelineItem time="2026-09-14T13:32:00Z" title="Paga" tone="success" current>
          <div slTimelineActor>${SOLARIS} Solaris Fretes</div>
        </article>
      </div>
    </div>
    <div class="slotted-demo-row"><button slButton size="sm" variant="outline" type="button" (click)="list.focusItem(2)">Focar o terceiro artigo</button></div>`,
  )}
</div>`,
  }),
};

export const Empty: Story = {
  parameters: scenario('empty'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="2">
  ${scene('sem itens', 'A mensagem da família no lugar da lista, na cor muda, centrada.', `<div slTimeline label="Atividade da fatura"><ol slTimelineList></ol></div>`)}
  ${scene(
    '[slTimelineEmpty] com [slResultState]',
    'O que o consumidor projetar: um result-state com uma ação, porque uma lista vazia é um sítio para começar.',
    `<div slTimeline label="Atividade da fatura">
      <ol slTimelineList></ol>
      <div slTimelineEmpty slResultState reach="inline" status="empty">
        <div slResultStateContent>
          <p slResultStateTitle>Ainda sem eventos</p>
          <p slResultStateDescription>A primeira fatura aparece aqui assim que for criada.</p>
        </div>
      </div>
    </div>`,
  )}
</div>`,
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'feed · Tab · PageDown · PageUp · Control+End · Control+Home',
    'Foque o botão antes do feed e siga com Tab: cada artigo é uma paragem com anel. PageDown salta ao artigo seguinte mesmo a partir de um botão dentro dele; Control+End aterra no botão depois do feed.',
    `<div class="slotted-demo-row"><button slButton size="sm" variant="outline" type="button">Antes do feed</button></div>
    <div slTimeline label="Atividade da fatura" mode="feed"><div slTimelineList>${invoice('article')}</div></div>
    <div class="slotted-demo-row"><button slButton size="sm" variant="outline" type="button">Depois do feed</button></div>`,
  )}
</div>`,
  }),
};
