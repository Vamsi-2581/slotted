import { SlButton } from '@slotted/angular/button';
import { SlInline } from '@slotted/angular/inline';
import { SlLink } from '@slotted/angular/link';
import { SlStack } from '@slotted/angular/stack';
import { SlText } from '@slotted/angular/typography';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlScrollArea, SlScrollAreaContent } from './scroll-area';
import { provideScrollAreaDefaults } from './scroll-area-defaults';
import { ANGULAR_SCROLL_AREA_DOCS, ANGULAR_SCROLL_AREA_TOKENS } from './scroll-area.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_SCROLL_AREA_DOCS.scenes, {
    playground: Playground,
    axis: Axis,
    scrollbars: Scrollbars,
    fade: Fade,
    gutter: Gutter,
    overscroll: Overscroll,
    maximum: Maximum,
    keyboard: Keyboard,
    content: Content,
    composition: Composition,
    print: Print,
    accessibility: Accessibility,
  }) as never;

const meta: Meta<Record<string, never>> = {
  title: 'Components/ScrollArea',
  component: SlScrollArea,
  decorators: [
    moduleMetadata({
      imports: [SlScrollArea, SlScrollAreaContent, SlButton, SlInline, SlLink, SlStack, SlText],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Scroll Area',
        description:
          'A scrollport and the box that frames it. The scrollbar is the platform’s, themed through scrollbar-color; the keyboard is the platform’s too. What the family adds is the measurement of whether the content overflows — published on the frame in logical names and painted as a veil that needs no ink — and the tab stop and name a scrolling region owes, written only while there is something to scroll.',
        framework: 'Angular',
        ...ANGULAR_SCROLL_AREA_DOCS,
        tokens: ANGULAR_SCROLL_AREA_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<Record<string, never>>;

/**
 * The content a scroll area is demonstrated with: one product, the billing
 * back office the other families already live in. The React page carries the
 * same six notes, the same regions and the same paths, so the two pages read
 * as one family rather than as two.
 */
const RELEASES = [
  [
    '2026.9.2 — Faturação',
    'Uma fatura emitida antes de 1 de setembro mantém as linhas de imposto antigas, e uma nota de crédito sobre ela passa a carregar as mesmas.',
  ],
  [
    '2026.9.1 — Faturação',
    'Uma subscrição que muda de plano a meio do ciclo é rateada ao dia e já não à hora. Sete clientes foram cobrados duas vezes pelo mesmo dia e foram reembolsados.',
  ],
  [
    '2026.8.29 — Acessos',
    'A sessão de início de sessão único expira com a do fornecedor de identidade em vez de ao fim de oito horas fixas.',
  ],
  [
    '2026.8.22 — Exportações',
    'Uma exportação com mais de cinquenta mil linhas é entregue por correio eletrónico em vez de descarregada, e o pedido passa a dizê-lo antes de ser feito.',
  ],
  [
    '2026.8.15 — Relatórios',
    'O relatório mensal passa a incluir as regiões sem consumo, com zero, em vez de as omitir.',
  ],
  [
    '2026.8.8 — Cobranças',
    'Um lembrete de cobrança não é enviado a um cliente cuja fatura está em disputa aberta.',
  ],
];

const notes = (count = RELEASES.length) =>
  `<div slStack gap="4">${RELEASES.slice(0, count)
    .map(
      ([title, note]) => `<div slStack gap="1">
        <p slText size="sm" weight="semibold">${title}</p>
        <p slText size="sm" tone="muted">${note}</p>
      </div>`,
    )
    .join('')}</div>`;

const fits = `<div slStack gap="1">
    <p slText size="sm" weight="semibold">2026.9.2 — Faturação</p>
    <p slText size="sm" tone="muted">Três linhas que cabem inteiras.</p>
    <p slText size="sm" tone="muted">Nada a rolar.</p>
  </div>`;

const REGIONS = [
  'sa-east-1',
  'eu-west-3',
  'eu-central-1',
  'ap-southeast-1',
  'us-east-2',
  'us-west-2',
  'ap-southeast-2',
  'ca-central-1',
  'ap-northeast-1',
];

const regions = `<div slInline gap="5" wrap="nowrap">${REGIONS.map(
  (region) => `<p slText size="sm" wrap="nowrap">${region}</p>`,
).join('')}</div>`;

const LOG = [
  '2026-09-11 14:02 · sa-east-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-sa-east-1.pdf',
  '2026-09-11 14:02 · eu-west-3 · https://billing.example.com/invoices/2026-09/consolidated-statement-eu-west-3.pdf',
  '2026-09-11 14:03 · ap-southeast-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-ap-southeast-1.pdf',
  '2026-09-11 14:03 · us-east-2 · https://billing.example.com/invoices/2026-09/consolidated-statement-us-east-2.pdf',
  '2026-09-11 14:04 · ap-southeast-2 · https://billing.example.com/invoices/2026-09/consolidated-statement-ap-southeast-2.pdf',
  '2026-09-11 14:04 · ca-central-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-ca-central-1.pdf',
  '2026-09-11 14:05 · ap-northeast-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-ap-northeast-1.pdf',
  '2026-09-11 14:05 · us-west-2 · https://billing.example.com/invoices/2026-09/consolidated-statement-us-west-2.pdf',
  '2026-09-11 14:06 · eu-central-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-eu-central-1.pdf',
  '2026-09-11 14:06 · sa-east-1 · https://billing.example.com/invoices/2026-08/consolidated-statement-sa-east-1.pdf',
];

const log = `<div slStack gap="1">${LOG.map(
  (line) => `<p slText size="sm" tone="muted" wrap="nowrap">${line}</p>`,
).join('')}</div>`;

const paths = `<div slStack gap="1">
    <p slText size="sm" wrap="nowrap">https://billing.example.com/invoices/2026-09/consolidated-statement-sa-east-1.pdf</p>
    <p slText size="sm" wrap="nowrap">https://billing.example.com/invoices/2026-09/consolidated-statement-eu-west-3.pdf</p>
    <p slText size="sm" wrap="nowrap">https://billing.example.com/invoices/2026-08/consolidated-statement-sa-east-1.pdf</p>
  </div>`;

const translated =
  '<p slText size="sm" tone="muted">Die Abonnementänderung innerhalb eines Abrechnungszeitraums wird tagesgenau und nicht mehr stundengenau anteilig berechnet. Sieben Kunden wurden zweimal für denselben Tag belastet und haben eine Erstattung erhalten. Die Sitzung der Einmalanmeldung läuft zusammen mit der des Identitätsanbieters ab und nicht mehr nach festen acht Stunden.</p>';

/**
 * A bounded, framed area. The bound and the frame are workbench primitives
 * because a story may not paint inline, and the frame is on the host — the
 * element the veil is not on — which is the anatomy decision the page shows.
 */
const framed = (attributes: string, body: string) =>
  `<div slScrollArea class="slotted-demo-bound slotted-demo-frame" ${attributes}>
    <div slScrollAreaContent>${body}</div>
  </div>`;

const scene = (label: string, note: string, body: string) =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, body: string) =>
  `<div class="slotted-demo-grid" data-columns="${columns}">${body}</div>`;

export const Playground: Story = {
  parameters: scenario('playground'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Notas de versão · block · auto · both',
        'A configuração por omissão: um eixo, a barra da plataforma, o véu nas duas pontas. Role até ao fim e o véu de baixo levanta; volte ao início e o de cima desaparece.',
        framed('label="Notas de versão"', notes()),
      ),
    ),
  }),
};

export const Axis: Story = {
  parameters: scenario('axis'),
  render: () => ({
    template: grid(
      1,
      scene(
        'block — o eixo por omissão',
        'Só o eixo de bloco rola. O eixo em linha fica preso, por isso uma linha comprida quebra em vez de fugir para o lado.',
        framed('label="Notas de versão"', notes()),
      ) +
        scene(
          'inline — uma fila que passa da caixa',
          'O véu cai na ponta que o leitor ainda não alcançou, e espelha com o documento: em RTL fica à esquerda. A barra horizontal é a da plataforma.',
          `<div slScrollArea axis="inline" class="slotted-demo-frame" label="Regiões">
            <div slScrollAreaContent>${regions}</div>
          </div>`,
        ) +
        scene(
          'both — um registo mais largo e mais alto do que a caixa',
          'Quatro véus, e as duas máscaras multiplicam-se nos cantos. O quadrado entre as duas barras é desenhado pelo sistema. Use os botões para o levar ao meio.',
          `<div slStack gap="4">
            ${framed('axis="both" #both="slScrollArea" label="Registo de exportações"', log)}
            <div slInline gap="3">
              <button slButton size="sm" variant="outline" (click)="both.scrollTo({ block: 40, inline: 60 })">Ao meio</button>
              <button slButton size="sm" variant="outline" (click)="both.scrollToEdge('block-start'); both.scrollToEdge('inline-start')">Ao início</button>
            </div>
          </div>`,
        ),
    ),
  }),
};

export const Scrollbars: Story = {
  parameters: scenario('scrollbars'),
  render: () => ({
    template: grid(
      2,
      scene(
        'auto',
        'A barra aparece quando há o que rolar e reserva o seu espaço desde o início, para nada se mexer quando aparece.',
        framed('label="Notas de versão"', notes()),
      ) +
        scene(
          'always',
          'A calha fica reservada e desenhada mesmo em conteúdo que cabe inteiro. É overflow: scroll, a forma da plataforma dizer o mesmo.',
          framed('label="Notas de versão" scrollbars="always"', notes(2)),
        ) +
        scene(
          'hover',
          'A calha fica, a barra não se pinta até um ponteiro ou o teclado estarem lá dentro. É a metade em CSS daquilo em que o Radix e o Mantine gastam um temporizador.',
          framed('label="Notas de versão" scrollbars="hover"', notes()),
        ) +
        scene(
          'none',
          'Sem barra e sem calha. O conteúdo continua a rolar por roda, toque, teclado e scrollTo, e o véu passa a ser a única coisa a dizer que há mais.',
          framed('label="Notas de versão" scrollbars="none"', notes()),
        ),
    ),
  }),
};

export const Fade: Story = {
  parameters: scenario('fade'),
  render: () => ({
    template: grid(
      3,
      scene(
        'both',
        'Escurece o que o leitor já passou e o que ainda tem pela frente. As duas pontas leem-se como uma ideia só. Role um pouco para ver as duas.',
        framed('label="Notas de versão"', notes()),
      ) +
        scene(
          'end',
          'Só a ponta para onde há mais conteúdo. O início da lista fica nítido, para quem prefere não escurecer o que já foi lido.',
          framed('fade="end" label="Notas de versão"', notes()),
        ) +
        scene(
          'none',
          'Nenhum véu, e nenhuma máscara: a barra fica sozinha a dizer que há mais, e a área não paga uma camada de composição.',
          framed('fade="none" label="Notas de versão"', notes()),
        ),
    ),
  }),
};

export const Gutter: Story = {
  parameters: scenario('gutter'),
  render: () => ({
    template: grid(
      3,
      scene(
        'auto',
        'O recuo chega até à moldura. No momento em que o conteúdo crescer para lá da caixa, a barra aparece e empurra o texto para a esquerda.',
        framed('gutter="auto" label="Notas de versão"', fits),
      ) +
        scene(
          'stable — por omissão',
          'Uma largura de barra fica guardada à direita desde o início, por isso nada se mexe quando ela aparece.',
          framed('label="Notas de versão"', fits),
        ) +
        scene(
          'both-edges',
          'A mesma largura dos dois lados, para uma coluna centrada continuar centrada quer a barra esteja quer não.',
          framed('gutter="both-edges" label="Notas de versão"', fits),
        ),
    ),
  }),
};

/**
 * A page that scrolls, with an area inside it: the workbench's scrolling
 * stage, inset by a surface, with enough lines either side of the area that
 * scrolling the page is visibly a different movement from scrolling the area.
 */
const page = (body: string) =>
  `<div class="slotted-demo-scroll">
    <div class="slotted-demo-surface">
      <div slStack gap="4">
        <p slText size="sm" tone="muted">Esta página rola. Role-a até chegar à área.</p>
        <p slText size="sm" tone="muted">Depois role a área até ao fim, e continue.</p>
        ${body}
        <p slText size="sm" tone="muted">Esta linha está por baixo da área, na página.</p>
        <p slText size="sm" tone="muted">E esta também.</p>
        <p slText size="sm" tone="muted">E esta é a última linha da página.</p>
      </div>
    </div>
  </div>`;

export const Overscroll: Story = {
  parameters: scenario('overscroll'),
  render: () => ({
    template: grid(
      2,
      scene(
        'contain — por omissão',
        'Chegue ao fim da área e continue a rolar: a página por trás fica quieta. Uma região limitada cujo último centímetro move a página é o defeito que a propriedade veio resolver.',
        page(
          `<div slScrollArea class="slotted-demo-frame" label="Notas de versão" maxBlockSize="7rem">
            <div slScrollAreaContent>${notes(2)}</div>
          </div>`,
        ),
      ) +
        scene(
          'auto',
          'O mesmo gesto encadeia para a página, que é o que o navegador faz por omissão. Um consumidor que queira isso di-lo.',
          page(
            `<div slScrollArea class="slotted-demo-frame" label="Notas de versão" maxBlockSize="7rem" overscroll="auto">
              <div slScrollAreaContent>${notes(2)}</div>
            </div>`,
          ),
        ),
    ),
  }),
};

export const Maximum: Story = {
  parameters: scenario('maximum'),
  render: () => ({
    props: { count: 2, total: RELEASES.length, releases: RELEASES },
    template: grid(
      1,
      scene(
        'maxBlockSize — 12rem',
        'Com duas notas a área tem a altura das duas e não rola. Acrescente notas: cresce até aos doze rem e passa a rolar, e a região com nome e ponto de tabulação aparece no mesmo instante em que o transbordo aparece.',
        `<div slStack gap="4">
          <div slScrollArea class="slotted-demo-frame" label="Notas de versão" maxBlockSize="12rem">
            <div slScrollAreaContent>
              <div slStack gap="4">
                @for (release of releases.slice(0, count); track release[0]) {
                  <div slStack gap="1">
                    <p slText size="sm" weight="semibold">{{ release[0] }}</p>
                    <p slText size="sm" tone="muted">{{ release[1] }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
          <div slInline gap="3">
            <button slButton size="sm" variant="outline" [disabled]="count >= total" (click)="count = count + 1">Acrescentar uma nota</button>
            <button slButton size="sm" variant="outline" [disabled]="count <= 1" (click)="count = count - 1">Tirar uma</button>
          </div>
        </div>`,
      ),
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Tab chega à região; o resto é da plataforma',
        'Prima Tab até à área e depois as setas, PageDown, End e Home. A família não escreve nenhuma destas teclas — escreve só o ponto de tabulação que as torna alcançáveis.',
        framed('label="Notas de versão"', notes()),
      ) +
        scene(
          '[tabbable]="false" — um filho já recebe o foco',
          'A ligação lá dentro já é um ponto de tabulação, e um segundo na porta de rolagem seria um que não faz nada. O Tab vai direto à ligação; o ponteiro continua a poder focar a área.',
          framed(
            'label="Notas de versão" [tabbable]="false"',
            `<div slStack gap="4">
              <p slText size="sm" tone="muted">A nota completa está em <a slLink href="#notas-de-versao">notas de versão 2026.9</a>, que abre na mesma página.</p>
              ${notes()}
            </div>`,
          ),
        ),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: grid(
      3,
      scene(
        'Três caminhos sem quebra',
        'Um token que não quebra rola no eixo em linha e é velado onde sai da caixa. A barra horizontal aparece por baixo dos três.',
        framed('axis="both" label="Ficheiros exportados"', paths),
      ) +
        scene(
          'Uma tradução com o dobro do comprimento',
          'Quebra e rola no eixo de bloco, como qualquer texto. O véu cai sobre a palavra que está a sair, não sobre um recuo.',
          framed('label="Änderungsprotokoll"', translated),
        ) +
        scene(
          'Três linhas que cabem',
          'Nada transborda, por isso a área é uma caixa como outra qualquer: sem véu, sem barra, sem ponto de tabulação e sem papel.',
          framed('label="Notas de versão"', fits),
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { block: 0 },
    template: grid(
      1,
      scene(
        'exportAs, scrollChange e o elemento do consumidor',
        'Os botões movem a área pela instância e nada em volta dela se mexe — reveal move o contentor sozinho, ao contrário de scrollIntoView. A posição é emitida em cada rolagem, e a moldura é uma section do próprio consumidor.',
        `<div slStack gap="4">
          <section slScrollArea #area="slScrollArea" class="slotted-demo-bound slotted-demo-frame" label="Notas de versão" (scrollChange)="block = $event.position.block">
            <div slScrollAreaContent>
              <div slStack gap="4">
                ${notes(4)}
                <p slText size="sm" weight="semibold"><span #last>2026.8.8 — Cobranças, a última linha</span></p>
              </div>
            </div>
          </section>
          <div slInline gap="3">
            <button slButton size="sm" variant="outline" (click)="area.scrollToEdge('block-end')">Fim</button>
            <button slButton size="sm" variant="outline" (click)="area.scrollToEdge('block-start')">Início</button>
            <button slButton size="sm" variant="outline" (click)="area.reveal(last)">Revelar a última linha</button>
            <p slText size="sm" tone="muted">{{ block | number: '1.0-0' }} px desde o início</p>
          </div>
        </div>`,
      ),
    ),
  }),
};

export const Print: Story = {
  parameters: scenario('print'),
  render: () => ({
    template: grid(
      1,
      scene(
        'No papel, tudo',
        'Abra a pré-visualização de impressão desta página: a área larga o máximo e o recorte na consulta de impressão e imprime as seis notas, não as duas que estavam à vista. Nenhuma das cinco implementações pesquisadas o faz.',
        framed('label="Notas de versão"', notes()),
      ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  decorators: [
    moduleMetadata({ providers: [provideScrollAreaDefaults({ label: 'Conteúdo com rolagem' })] }),
  ],
  render: () => ({
    template: grid(
      3,
      scene(
        'Transborda — uma região com nome',
        'role=region, tabindex=0 e o nome do fornecedor: «Conteúdo com rolagem». Um leitor de ecrã ouve o nome ao entrar e usa as setas do próprio navegador.',
        framed('', notes()),
      ) +
        scene(
          'Cabe — nada',
          'Sem papel, sem nome, sem ponto de tabulação. Um ponto de tabulação em conteúdo que cabe é um que não faz nada, e uma página com oito áreas teria oito.',
          framed('', fits),
        ) +
        scene(
          'Nomeada pelo título — labelledBy',
          'O título por cima é o nome da região, na ordem em que o nome se resolve: labelledBy, depois label, depois o fornecedor.',
          `<div slStack gap="3">
            <p slText id="notas-titulo" size="sm" weight="semibold">Notas de versão</p>
            ${framed('labelledBy="notas-titulo"', notes())}
          </div>`,
        ),
    ),
  }),
};
