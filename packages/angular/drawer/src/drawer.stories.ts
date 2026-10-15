import { SlButton } from '@slotted/angular/button';
import { SlSkeleton } from '@slotted/angular/skeleton';
import { SlTextField } from '@slotted/angular/text-field';
import { SlText } from '@slotted/angular/typography';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlDrawer } from './drawer';
import type { DrawerMode, DrawerMount, DrawerSide, DrawerSize } from './drawer-defaults';
import {
  SlDrawerBody,
  SlDrawerClose,
  SlDrawerDescription,
  SlDrawerFooter,
  SlDrawerHeader,
  SlDrawerResizer,
  SlDrawerTitle,
  SlDrawerTrigger,
} from './drawer-parts';
import { ANGULAR_DRAWER_DOCS, ANGULAR_DRAWER_TOKENS } from './drawer.docs';

interface DrawerStoryArgs {
  escape: 'close' | 'none';
  loading: boolean;
  modal: boolean;
  mode: DrawerMode;
  mount: DrawerMount;
  outsidePress: 'close' | 'none';
  side: DrawerSide;
  size: DrawerSize;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_DRAWER_DOCS.drawer.scenes, {
    playground: Playground,
    mode: Mode,
    side: Side,
    size: Size,
    resize: Resize,
    snapPoints: SnapPoints,
    sheet: Sheet,
    scrimFrom: ScrimFrom,
    keyboard: Keyboard,
    modal: Modal,
    policy: Policy,
    focus: Focus,
    loading: Loading,
    nested: Nested,
    content: Content,
    composition: Composition,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

export const DRAWER_IMPORTS = [
  SlDrawer,
  SlDrawerTrigger,
  SlDrawerHeader,
  SlDrawerTitle,
  SlDrawerDescription,
  SlDrawerBody,
  SlDrawerFooter,
  SlDrawerClose,
  SlDrawerResizer,
  SlButton,
  SlText,
  SlTextField,
  SlSkeleton,
];

const meta: Meta<DrawerStoryArgs> = {
  title: 'Components/Drawer',
  decorators: [moduleMetadata({ imports: DRAWER_IMPORTS })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Drawer',
        description:
          'A panel that comes in from an edge, and either covers the page or stands beside it. One axis decides which, so a breakpoint can change it without taking the panel’s scroll position and focus with it; one cancellable request covers every way it closes; and the edge a reader drags is a separator a keyboard can move.',
        framework: 'Angular',
        ...ANGULAR_DRAWER_DOCS.drawer,
        tokens: ANGULAR_DRAWER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<DrawerStoryArgs>;

/**
 * A box an overlay drawer opens inside, so a demonstration is a panel in a
 * scene rather than a full-page layer over the reference page it documents.
 * `contain: paint` on the primitive is what makes it the containing block for
 * the fixed layer; in an application that containing block is the viewport.
 */
let layers = 0;
/**
 * Each box has its own template reference. Two scenes in one grid are one
 * template, and a shared `#box` resolved every `[container]="box"` to the
 * first: the second scene's drawer opened inside the first scene's box.
 */
const layer = (body: string, size: 'tall' | 'screen' = 'tall') => {
  layers += 1;
  const ref = `box${layers}`;
  return `<div class="slotted-demo-viewport" data-size="${size}" #${ref}>${body.replaceAll(
    '[container]="box"',
    `[container]="${ref}"`,
  )}</div>`;
};

/**
 * The shape an inline drawer lives in: the consumer's own two-track grid. It is
 * written out rather than hidden, because it is what replaces Angular
 * Material's `push` — the page reflows because this grid says so, not because
 * the family wrote a margin on an element it does not own.
 */
const shell = (body: string) =>
  `<div class="slotted-demo-viewport" data-size="tall" data-layout="shell">${body}</div>`;

const scene = (label: string, note: string, body: string, layout = 'block') =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}">${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, body: string) =>
  `<div class="slotted-demo-grid" data-columns="${columns}">${body}</div>`;

const page = (
  text = 'Sem scrim, sem portal e sem z-index. O conteúdo ao lado reflui porque o grid do consumidor diz isso.',
) =>
  `<main>
    <p slText size="sm" tone="muted">${text}</p>
  </main>`;

/**
 * What a demonstration that stands open has to say for itself.
 *
 * A modal layer takes the page over: `dismissable-layer` writes `inert` on
 * every sibling up to the document root and locks the document scroll, and a
 * page carrying fifteen of them at once is a page nobody can scroll or click.
 * The first published version of these stories did exactly that — twenty-one
 * panels open, `body { overflow: hidden }` on a page twenty-three thousand
 * pixels tall, and one press anywhere closing fifteen of them at once, because
 * each read it as a press outside itself.
 *
 * So a scene that exists to be *looked at* is not modal, does not take focus
 * and cannot be dismissed. Nothing here changes the picture: the scrim belongs
 * to the layer rather than to the dismissal policy, so `modal` decides only
 * what happens to the page behind it. A scene that exists to be *operated*
 * keeps its real behaviour and is opened from a trigger, one at a time.
 */
const STILL = '[modal]="false" escape="none" outsidePress="none" [initialFocus]="false"';

const panel = (
  attributes = '',
  {
    body = '<p slText size="sm">Um drawer guarda uma tarefa secundária. A linha do meio é a que rola.</p>',
    description = 'Emitida em 12 de agosto, vence em 11 dias.',
    footer = `<footer slDrawerFooter>
      <button slButton size="sm" variant="ghost" tone="secondary">Cancelar</button>
      <button slButton size="sm">Salvar</button>
    </footer>`,
    resizer = '',
    title = 'Fatura 4471',
  } = {},
) =>
  layer(`<sl-drawer [container]="box" [open]="true" ${STILL} ${attributes}>
    <header slDrawerHeader>
      <h2 slDrawerTitle>${title}</h2>
      ${description === '' ? '' : `<p slDrawerDescription>${description}</p>`}
      <button slDrawerClose></button>
    </header>
    ${body === '' ? '' : `<div slDrawerBody>${body}</div>`}
    ${footer}
    ${resizer}
  </sl-drawer>`);

/**
 * The navigation a product would actually have: real labels, real counts and
 * one awkward row, a queue with nothing in it. The React page has carried it
 * since its inline scenes were rewritten; this page kept three placeholder
 * words and no separator until the reviewer compared the two.
 */
const NAVIGATION = `<p slText size="sm" weight="semibold">Contas a receber</p>
  <p slText size="sm">Vencidas · 14</p>
  <p slText size="sm">A vencer em 7 dias · 32</p>
  <p slText size="sm">Em conciliação · 3</p>
  <p slText size="sm" tone="muted">Contestações · nenhuma</p>
  <p slText size="sm" tone="muted">Baixas automáticas não conciliadas desde 02/09</p>`;

/** The invoice the navigation leads to. */
const WORKBENCH = `<main>
  <p slText size="lg" weight="semibold">NF-e 20 483 · Metalúrgica Boa Vista Ltda</p>
  <p slText size="sm" tone="muted">
    Emitida em 02/09/2026 · vence em 02/10/2026 · R$ 18 420,00 · vencida há 9 dias
  </p>
  <p slText size="sm" tone="muted">
    Arraste a aresta da barra lateral: a medida que ela publica é a mesma que este layout aplica.
  </p>
</main>`;

export const Playground: Story = {
  args: {
    escape: 'close',
    loading: false,
    modal: true,
    mode: 'overlay',
    mount: 'active',
    outsidePress: 'close',
    side: 'end',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: layer(`<button slButton [slDrawerTrigger]="d">Abrir detalhes</button>
      <sl-drawer
        #d="slDrawer"
        [container]="box"
        [mode]="mode"
        [side]="side"
        [size]="size"
        [mount]="mount"
        [modal]="modal"
        [escape]="escape"
        [outsidePress]="outsidePress"
        [loading]="loading"
      >
        <header slDrawerHeader>
          <h2 slDrawerTitle>Fatura 4471</h2>
          <p slDrawerDescription>Emitida em 12 de agosto.</p>
          <button slDrawerClose></button>
        </header>
        <div slDrawerBody>
          <input slTextField aria-label="Observação" value="Aguardando conciliação" />
        </div>
        <footer slDrawerFooter>
          <button slButton size="sm" variant="ghost" tone="secondary">Cancelar</button>
          <button slButton size="sm">Salvar</button>
        </footer>
      </sl-drawer>`),
  }),
};

export const Mode: Story = {
  parameters: scenario('mode'),
  render: () => ({
    template: grid(
      1,
      scene(
        'overlay — a layer over the page',
        'Portalled, fixed to the viewport, with a scrim and the whole dismissal policy. In an application the containing block is the viewport; here it is the dashed box.',
        panel(),
      ) +
        scene(
          'inline — a panel beside it',
          'Sem portal, sem scrim e sem z-index: é uma barra lateral de verdade, com o separador na aresta e a fatura ao lado. A página reflui porque o grid do consumidor diz isso, que é o que substitui o push do Angular Material e o persistent do MUI.',
          shell(
            `<sl-drawer mode="inline" side="start" size="sm" [open]="true" [extent]="0.34">
              <header slDrawerHeader><h2 slDrawerTitle>Recebíveis</h2></header>
              <nav slDrawerBody aria-label="Contas">${NAVIGATION}</nav>
              <div slDrawerResizer></div>
            </sl-drawer>` + WORKBENCH,
          ),
        ),
    ),
  }),
};

export const Side: Story = {
  parameters: scenario('side'),
  render: () => ({
    template: grid(
      2,
      scene(
        'end — the default',
        'The edge a detail panel comes from in a left-to-right document, and the other one in a mirrored document. Switch the direction in the toolbar: the whole panel mirrors, including the separator.',
        panel('size="sm"'),
      ) +
        scene(
          'bottom — a sheet',
          'The sheet keeps the two corners the reader can see and puts the separator above the header, which is where a hand looks for it. A side drawer keeps no corners at all: it reads as a wall rather than as a card.',
          panel('side="bottom" size="sm"', {
            description: '',
            resizer: '<div slDrawerResizer></div>',
            title: 'Filtrar faturas',
          }),
        ),
    ),
  }),
};

export const Size: Story = {
  parameters: scenario('size'),
  render: () => ({
    template: grid(
      2,
      scene(
        'sm — for a summary',
        'Eighteen rems. Wide enough for a definition list and two actions, narrow enough that the page behind it is still legible under the scrim.',
        panel('size="sm"'),
      ) +
        scene(
          'xl — for a form',
          'Forty rems, and a title one step larger to match. The step a two-column form needs; below it the columns stack and the panel reads as one long list of fields.',
          panel('size="xl"', { title: 'Editar dados de faturamento' }),
        ),
    ),
  }),
};

export const Resize: Story = {
  parameters: scenario('resize'),
  render: () => ({
    template: grid(
      1,
      scene(
        'A separator, not a prop',
        'A aresta é o controlo, e vê-se sem lhe tocar: duas hairlines com a pega ao meio, que correm a calha inteira sob a mão. Chegue lá com Tab e use as setas — dezasseis pixels por toque, sessenta e quatro com Shift — Home e End vão aos limites, Enter colapsa e repõe, e o duplo clique volta à medida do passo de tamanho. O resizer do Ant e o arrasto do Vaul são só de ponteiro.',
        shell(
          `<sl-drawer mode="inline" side="start" [open]="true" [extent]="0.32" [minExtent]="0.18">
            <header slDrawerHeader><h2 slDrawerTitle>Recebíveis</h2></header>
            <nav slDrawerBody aria-label="Contas">${NAVIGATION}</nav>
            <div slDrawerResizer></div>
          </sl-drawer>` +
            page(
              'A medida pública é uma fração da caixa em que o painel é medido, e é ela que vira aria-valuenow.',
            ),
        ),
      ),
    ),
  }),
};

export const SnapPoints: Story = {
  parameters: scenario('snapPoints'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Three heights, all reachable by keyboard',
        'A snap point is a stop of the same separator, so an arrow moves between them and Home and End reach the first and last. Dragging the edge below the first stop asks to close, carrying pointer.',
        panel('side="bottom" [extent]="0.3" [snapPoints]="[0.3, 0.6, 0.95]"', {
          body: '<p slText size="sm">Arraste a borda, ou use as setas: as paradas são 30%, 60% e 95%.</p>',
          description: '',
          footer: '',
          resizer: '<div slDrawerResizer></div>',
          title: 'Filtros',
        }),
      ),
    ),
  }),
};

/** Thirty customers, which is more than a phone shows, so the body scrolls. */
const CUSTOMERS = [
  'Acme Logística · R$ 12 480,00',
  'Banco Horizonte · R$ 3 920,50',
  'Casa Verde Alimentos · R$ 845,00',
  'Distribuidora Norte · R$ 27 300,00',
  'Estúdio Lume · R$ 1 150,00',
  'Farmácia Popular do Centro · R$ 6 712,30',
  'Gráfica Aurora · R$ 2 004,90',
  'Hotel Mirante · R$ 18 960,00',
  'Instituto Raiz · R$ 540,00',
  'Jardins da Serra · R$ 9 870,00',
  'Klabin Embalagens · R$ 31 225,75',
  'Laboratório Vitta · R$ 4 380,00',
  'Lojas Maré Alta · R$ 7 410,00',
  'Metalúrgica Boa Vista · R$ 18 420,00',
  'Nativa Cosméticos · R$ 2 980,40',
  'Oficina do Pão · R$ 612,00',
  'Papelaria Central · R$ 1 845,90',
  'Química Serrana · R$ 22 130,00',
  'Rede Solar Engenharia · R$ 48 900,00',
  'Supermercado Bom Preço · R$ 11 204,65',
  'Têxtil Vale Verde · R$ 5 330,00',
  'Usina Pedra Branca · R$ 63 750,00',
  'Viação Litoral · R$ 3 118,20',
  'Xavier & Filhos Advogados · R$ 9 000,00',
  'Zanella Transportes · R$ 14 675,00',
  'Água Clara Saneamento · R$ 27 480,00',
  'Brisa Hotelaria · R$ 4 190,00',
  'Cooperativa Campo Aberto · R$ 16 320,00',
  'Delta Informática · R$ 2 240,00',
  'Eco Embalagens · R$ 8 905,10',
]
  .map((line) => `<p slText size="sm">${line}</p>`)
  .join('');

const FILTERS = `<p slText size="sm">Período: últimos 30 dias</p>
  <p slText size="sm">Status: em aberto, vencidas</p>
  <p slText size="sm">Responsável: Marina Duarte</p>`;

export const Sheet: Story = {
  parameters: scenario('sheet'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Content height — the default on a block side',
        'Three filters and a footer, and nothing under them. No size is written: on top and bottom the panel measures what it holds, and on a layer wider than forty rems it stops there and stands centred on the scrim.',
        panel('side="bottom"', {
          body: FILTERS,
          description: '',
          resizer: '<div slDrawerResizer></div>',
          title: 'Filtrar faturas',
        }),
      ) +
        scene(
          'Operate it — touch, fling, tap the grabber',
          "It opens at half the layer; the height of its content is the second stop. Drag the body with a finger, or with touch emulation in the browser's device mode: up grows it to its content before the list scrolls, down with the list at its top moves the sheet, and a fling past 500 px/s goes to the next stop or closes. A mouse drags the grabber, and a click on it walks the two stops.",
          layer(
            `<button slButton [slDrawerTrigger]="sheet">Clientes em aberto</button>
            <sl-drawer #sheet="slDrawer" [container]="box" side="bottom" [snapPoints]="[0.5]" [extent]="0.5">
              <div slDrawerResizer></div>
              <header slDrawerHeader>
                <h2 slDrawerTitle>Clientes com faturas em aberto</h2>
                <button slDrawerClose></button>
              </header>
              <div slDrawerBody>${CUSTOMERS}</div>
              <footer slDrawerFooter>
                <button slButton size="sm" variant="ghost" tone="secondary">Limpar</button>
                <button slButton size="sm">Aplicar</button>
              </footer>
            </sl-drawer>`,
            'screen',
          ),
        ),
    ),
  }),
};

export const ScrimFrom: Story = {
  parameters: scenario('scrimFrom'),
  render: () => ({
    props: { zone: 'Zona Sul' },
    template: grid(
      1,
      scene(
        'Undimmed up to the middle stop',
        'The sheet rests at a quarter of the layer with the page undimmed: the three zone buttons still answer. Tap the grabber, or press the arrows on it, to climb to sixty and ninety-five per cent — the scrim fades in from the middle stop, and a press on it no longer reaches the page.',
        layer(
          `<div class="slotted-demo-stack">
            <p slText size="sm" tone="muted">Região selecionada: {{ zone }}</p>
            <div class="slotted-demo-row">
              <button slButton size="sm" variant="outline" (click)="zone = 'Zona Norte'">Zona Norte</button>
              <button slButton size="sm" variant="outline" (click)="zone = 'Centro'">Centro</button>
              <button slButton size="sm" variant="outline" (click)="zone = 'Zona Sul'">Zona Sul</button>
            </div>
          </div>
          <sl-drawer
            [container]="box"
            [open]="true"
            [modal]="false"
            escape="none"
            outsidePress="none"
            [initialFocus]="false"
            side="bottom"
            [extent]="0.25"
            [snapPoints]="[0.25, 0.6, 0.95]"
            [scrimFrom]="0.6"
          >
            <div slDrawerResizer></div>
            <header slDrawerHeader><h2 slDrawerTitle>Entregas na região</h2></header>
            <div slDrawerBody>${CUSTOMERS}</div>
          </sl-drawer>`,
          'screen',
        ),
      ),
    ),
  }),
};

/**
 * The keyboard a desktop screen does not have. The button writes the property
 * the binding writes from `visualViewport`, on the box the layer is portalled
 * into; the layer inherits it.
 */
export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: { keyboard: false },
    template: grid(
      1,
      scene(
        'The sheet recedes by what the keyboard covers',
        'On a phone, focus the field: the layer reads the band the keyboard covers from the visual viewport and the sheet lands above the keys, footer included. On this screen the button writes the same 260 pixels the binding would.',
        `<div class="slotted-demo-stack">
          <button
            slButton
            size="sm"
            variant="outline"
            (click)="keyboard = !keyboard; keyboard ? keyboardBox.style.setProperty('--slotted-keyboard-inset', '260px') : keyboardBox.style.removeProperty('--slotted-keyboard-inset')"
          >
            {{ keyboard ? 'Esconder o teclado simulado' : 'Simular um teclado de 260 px' }}
          </button>
          <div class="slotted-demo-viewport" data-size="screen" #keyboardBox>
            <sl-drawer [container]="keyboardBox" [open]="true" ${STILL} side="bottom">
              <header slDrawerHeader>
                <h2 slDrawerTitle>Enviar lembrete</h2>
                <button slDrawerClose></button>
              </header>
              <div slDrawerBody>
                <input slTextField aria-label="Nota para o cliente" value="Pagamento previsto para sexta" />
              </div>
              <footer slDrawerFooter>
                <button slButton size="sm" variant="ghost" tone="secondary">Cancelar</button>
                <button slButton size="sm">Salvar</button>
              </footer>
            </sl-drawer>
          </div>
        </div>`,
      ),
    ),
  }),
};

export const Modal: Story = {
  parameters: scenario('modal'),
  render: () => ({
    template: grid(
      2,
      scene(
        'modal — the page is out of reach',
        'Press Open: the scroll locks, everything outside the layer goes inert, and Tab wraps inside the panel. It is opened from a trigger because a modal layer takes the whole page over, and a page showing several at once would be lying about what one does.',
        layer(`<button slButton [slDrawerTrigger]="m">Abrir modal</button>
          <sl-drawer #m="slDrawer" [container]="box" size="sm">
            <header slDrawerHeader>
              <h2 slDrawerTitle>Modal</h2>
              <p slDrawerDescription>A rolagem está travada e o resto da página está inert.</p>
              <button slDrawerClose></button>
            </header>
          </sl-drawer>`),
      ) +
        scene(
          'modal="false" — and no aria-modal',
          'Nothing is inert, nothing is locked and focus is not contained, so the panel writes no aria-modal. The scrim stays: it belongs to the layer rather than to the dismissal policy, and it is why every still demonstration on this page can be this one.',
          panel('size="sm"', { title: 'Detalhes' }),
        ),
    ),
  }),
};

export const Policy: Story = {
  parameters: scenario('policy'),
  render: () => ({
    props: {
      guard: (request: { cancel(): void; value: boolean }) => request.value || request.cancel(),
    },
    template: grid(
      1,
      scene(
        'One guard, every way out',
        'Press Escape, the ✕ or the scrim: each one asks, and the same handler refuses all three. Angular Material’s disableClose refuses two of them and cannot refuse the third.',
        layer(`<sl-drawer
          [container]="box"
          [open]="true"
          size="sm"
          [modal]="false"
          [initialFocus]="false"
          (openChangeRequest)="guard($event)"
        >
          <header slDrawerHeader>
            <h2 slDrawerTitle>Salvando</h2>
            <p slDrawerDescription>Escape, o ✕ e um clique fora são todos recusados.</p>
            <button slDrawerClose></button>
          </header>
          <div slDrawerBody>
            <p slText size="sm">Uma única guarda cobre as cinco formas de fechar.</p>
          </div>
        </sl-drawer>`),
      ),
    ),
  }),
};

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => ({
    template: grid(
      1,
      scene(
        'An overlay drawer takes focus',
        'Press the trigger: initialFocus names the field rather than the first tabbable element, which here is the close button. Tab wraps inside the panel while it is modal, and Escape gives focus back to the trigger it came from.',
        layer(`<button slButton [slDrawerTrigger]="f">Buscar faturas</button>
          <sl-drawer #f="slDrawer" [container]="box" size="sm" [initialFocus]="search">
          <header slDrawerHeader>
            <h2 slDrawerTitle>Buscar faturas</h2>
            <button slDrawerClose></button>
          </header>
          <div slDrawerBody>
            <input #search slTextField aria-label="Buscar" />
          </div>
        </sl-drawer>`),
      ) +
        scene(
          'An inline drawer takes none',
          'Nothing moves when it opens: a sidebar that stole focus every time a breakpoint crossed would be unusable. It still gives focus back when it closes under the reader’s hands.',
          shell(
            `<sl-drawer mode="inline" side="start" size="sm" [open]="true">
              <header slDrawerHeader><h2 slDrawerTitle>Coleções</h2></header>
              <div slDrawerBody>
                <button slButton size="sm" variant="ghost">Todas</button>
              </div>
            </sl-drawer>` +
              page('Angular Material faz a mesma separação: autoFocus é false no modo side.'),
          ),
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
        'Open before the content arrived',
        'The body carries aria-busy and keeps a floor, so the panel does not jump to size when the data lands. The header, the ✕ and Escape all stay operable.',
        panel('size="sm" [loading]="true"', {
          body: '<sl-skeleton shape="text" /><sl-skeleton shape="text" />',
          description: '',
        }),
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
        'A drawer opened from a drawer',
        'Escape reaches the topmost layer only, and a layer that refuses stops the request reaching the one beneath. The depth comes from the single stack dismissable-layer keeps, so nothing here states a z-index.',
        panel('', {
          body: `<button slButton size="sm" variant="outline" [slDrawerTrigger]="inner">Ver o item 3</button>
            <sl-drawer #inner="slDrawer" [container]="box" size="sm">
              <header slDrawerHeader>
                <h2 slDrawerTitle>Item 3</h2>
                <button slDrawerClose></button>
              </header>
              <div slDrawerBody>
                <p slText size="sm">Escape fecha este, e deixa o de baixo aberto.</p>
              </div>
            </sl-drawer>`,
          description: '',
          footer: '',
          title: 'Pedido 118',
        }),
      ),
    ),
  }),
};

const LONG = `<p slText size="sm">
  A linha do meio é o único trilho que rola. Limitada, ela rola; ilimitada, empurraria o rodapé
  para fora da tela e o leitor não alcançaria o botão. MUI e Angular Material não entregam layout
  algum, então esse é o resultado padrão de seguir o exemplo de qualquer uma das duas. Um terceiro
  parágrafo, para que haja o que rolar. E um quarto, que já está abaixo da dobra.
</p>`;

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A string the family did not choose',
        'Um token de noventa caracteres sem espaços quebra em vez de alargar o painel: a medida mínima é zero e a quebra é permitida em qualquer ponto.',
        panel('size="sm"', {
          description: '',
          footer: '',
          title: 'relatorio-de-conciliacao-bancaria-consolidado-2026-08.csv',
        }),
      ) +
        scene(
          'A body longer than the layer',
          'The header and the actions hold still while the middle row moves. This is the whole reason the panel is a three-row grid bounded to the layer.',
          panel('size="sm"', { body: LONG, description: '', title: 'Termos de uso' }),
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: grid(
      1,
      scene(
        'The trigger is the library’s button',
        'The directive goes on the consumer’s own element, so it carries aria-expanded, aria-controls, aria-haspopup and the id without anything being wrapped.',
        layer(`<button slButton variant="outline" tone="secondary" [slDrawerTrigger]="d">
            Abrir detalhes
          </button>
          <sl-drawer #d="slDrawer" [container]="box" size="sm">
            <header slDrawerHeader>
              <h2 slDrawerTitle>Fatura 4471</h2>
              <button slDrawerClose></button>
            </header>
            <div slDrawerBody>
              <p slText size="sm">O gatilho é o botão da biblioteca, com a fiação por cima.</p>
            </div>
          </sl-drawer>`),
      ) +
        scene(
          'The panel’s content is the consumer’s landmark',
          'An inline drawer writes no role, because a navigation drawer is a navigation landmark and a filter panel is complementary. The projected element is where the consumer says which.',
          shell(
            `<sl-drawer mode="inline" side="start" size="sm" [open]="true">
              <header slDrawerHeader><h2 slDrawerTitle>Seções</h2></header>
              <nav slDrawerBody aria-label="Seções">
                <p slText size="sm">Resumo</p>
                <p slText size="sm">Histórico</p>
              </nav>
            </sl-drawer>` + page('O corpo aqui é um nav, não um div com role.'),
          ),
        ),
    ),
  }),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  render: () => ({
    template: grid(
      2,
      scene(
        'What the provider decides',
        'side, size, mode, mount, modal, escape and outsidePress, set once for an injector instead of repeated on every drawer in a product.',
        panel('side="start" size="sm"', { description: '' }),
      ) +
        scene(
          'What the consumer decides anyway',
          'An explicit value always wins over a provider, over inference and over derived state — the same rule every family in the library follows.',
          panel('side="end" size="md"', { description: '' }),
        ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    template: grid(
      1,
      scene(
        'What the title is wired to',
        'It names the panel through aria-labelledby and it names the separator too, which is the Window Splitter pattern’s own rule: a separator is named for the pane it sizes.',
        shell(
          `<sl-drawer mode="inline" side="start" [open]="true" [extent]="0.35">
            <header slDrawerHeader><h2 slDrawerTitle>Coleções</h2></header>
            <div slDrawerBody>
              <p slText size="sm">
                O separador anuncia o nome do painel, a orientação e a medida de 0 a 100.
              </p>
            </div>
            <div slDrawerResizer></div>
          </sl-drawer>` +
            page(
              'Fechado, o painel recebe inert: o colapso que o olho lê e a ordem de foco concordam.',
            ),
        ),
      ),
    ),
  }),
};
