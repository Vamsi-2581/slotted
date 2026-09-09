import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlButton } from '@slotted/angular/button';
import { SlCard } from '@slotted/angular/card';
import { SlSkeleton } from '@slotted/angular/skeleton';
import { SlTextField } from '@slotted/angular/text-field';
import { SlText } from '@slotted/angular/typography';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlAlertDialog, SlDialog } from './dialog';
import type {
  DialogFullScreen,
  DialogMount,
  DialogPlacement,
  DialogScroll,
  DialogSize,
} from './dialog-defaults';
import {
  SlAlertDialogAction,
  SlAlertDialogCancel,
  SlAlertDialogIcon,
  SlDialogBody,
  SlDialogClose,
  SlDialogDescription,
  SlDialogFooter,
  SlDialogHeader,
  SlDialogTitle,
  SlDialogTrigger,
} from './dialog-parts';
import { ANGULAR_DIALOG_DOCS, ANGULAR_DIALOG_TOKENS } from './dialog.docs';

interface DialogStoryArgs {
  escape: 'close' | 'none';
  fullScreen: DialogFullScreen;
  loading: boolean;
  modal: boolean;
  mount: DialogMount;
  outsidePress: 'close' | 'none';
  placement: DialogPlacement;
  scroll: DialogScroll;
  size: DialogSize;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_DIALOG_DOCS.dialog.scenes, {
    playground: Playground,
    sizes: Sizes,
    placement: Placement,
    scroll: Scroll,
    surface: Surface,
    fullScreen: FullScreen,
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

export const DIALOG_IMPORTS = [
  SlDialog,
  SlAlertDialog,
  SlDialogTrigger,
  SlDialogHeader,
  SlDialogTitle,
  SlDialogDescription,
  SlDialogBody,
  SlDialogFooter,
  SlDialogClose,
  SlAlertDialogIcon,
  SlAlertDialogCancel,
  SlAlertDialogAction,
  SlButton,
  SlCard,
  SlText,
  SlTextField,
  SlSkeleton,
];

const meta: Meta<DialogStoryArgs> = {
  title: 'Components/Dialog',
  decorators: [moduleMetadata({ imports: DIALOG_IMPORTS })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Dialog',
        description:
          'A window over the page, and the scrim that says the page is out of reach. One cancellable request for all six ways it can close, a panel whose actions stay on screen however long the body is, and a layer that keeps the theme of the region it was opened from.',
        framework: 'Angular',
        ...ANGULAR_DIALOG_DOCS.dialog,
        tokens: ANGULAR_DIALOG_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<DialogStoryArgs>;

/**
 * A box the layer opens inside, so a demonstration is a panel in a scene rather
 * than a full-page overlay over the reference page it documents. `contain: paint`
 * on the primitive is what makes it the containing block for the fixed layer;
 * in an application that containing block is the viewport.
 */
export const layer = (body: string) =>
  `<div class="slotted-demo-viewport" data-size="tall" #box>${body}</div>`;

export const scene = (label: string, note: string, body: string, layout = 'block') =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}">${body}</div>
  </section>`;

export const grid = (columns: 1 | 2 | 3, body: string) =>
  `<div class="slotted-demo-grid" data-columns="${columns}">${body}</div>`;

/**
 * What a demonstration that stands open has to say for itself.
 *
 * A modal layer takes the page over: `dismissable-layer` writes `inert` on every
 * sibling up to the document root and locks the document scroll, and a page
 * carrying a dozen of them at once is a page nobody can scroll or click. The
 * first published version of these stories did exactly that — one press
 * anywhere closed every panel at once, because each of them read it as a press
 * outside itself.
 *
 * So a scene that exists to be *looked at* is not modal, does not take focus and
 * cannot be dismissed. Nothing here changes the picture: `modal` decides what
 * happens to the page behind the scrim, never what the panel looks like. A scene
 * that exists to be *operated* keeps its real behaviour and is opened from a
 * trigger, one at a time — which is also what the reader does in an application.
 */
const STILL = '[modal]="false" [initialFocus]="false" escape="none" outsidePress="none"';

const panel = (
  attributes = '',
  {
    body = '<p slText size="sm">Um diálogo guarda uma tarefa. A linha do meio é a única que rola.</p>',
    description = 'O nome é visível para todo o espaço de trabalho.',
    footer = `<footer slDialogFooter>
      <button slButton size="sm" variant="ghost" tone="secondary">Cancelar</button>
      <button slButton size="sm">Salvar</button>
    </footer>`,
    title = 'Editar projeto',
  } = {},
) =>
  layer(`<sl-dialog [container]="box" [open]="true" ${STILL} ${attributes}>
    <header slDialogHeader>
      <h2 slDialogTitle>${title}</h2>
      <p slDialogDescription>${description}</p>
      <button slDialogClose></button>
    </header>
    ${body === '' ? '' : `<div slDialogBody>${body}</div>`}
    ${footer}
  </sl-dialog>`);

export const Playground: Story = {
  args: {
    escape: 'close',
    fullScreen: 'narrow',
    loading: false,
    modal: true,
    mount: 'active',
    outsidePress: 'close',
    placement: 'center',
    scroll: 'content',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: layer(`<button slButton [slDialogTrigger]="d">Editar projeto</button>
      <sl-dialog
        #d="slDialog"
        [container]="box"
        [size]="size"
        [placement]="placement"
        [scroll]="scroll"
        [mount]="mount"
        [fullScreen]="fullScreen"
        [modal]="modal"
        [escape]="escape"
        [outsidePress]="outsidePress"
        [loading]="loading"
      >
        <header slDialogHeader>
          <h2 slDialogTitle>Editar projeto</h2>
          <p slDialogDescription>O nome é visível para todo o espaço.</p>
          <button slDialogClose></button>
        </header>
        <div slDialogBody>
          <input slTextField aria-label="Nome" value="Redesign da home" />
        </div>
        <footer slDialogFooter>
          <button slButton size="sm" variant="ghost" tone="secondary">Cancelar</button>
          <button slButton size="sm">Salvar</button>
        </footer>
      </sl-dialog>`),
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: grid(
      2,
      scene(
        'sm, for a question',
        'Twenty-four rems. Wide enough for one sentence and two actions, narrow enough that the eye does not have to travel to read it.',
        panel('size="sm" fullScreen="never"', { title: 'Arquivar projeto' }),
      ) +
        scene(
          'xl, for a form',
          'Fifty-six rems. The step a two-column form needs; below it the columns stack and the panel reads as one long list of fields.',
          panel('size="xl" fullScreen="never"', { title: 'Editar faturamento' }),
        ),
    ),
  }),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => ({
    template: grid(
      2,
      scene(
        'center',
        'The default. Right for a panel whose height is settled before the reader touches it — a confirmation, a form with a fixed set of fields.',
        panel('fullScreen="never"'),
      ) +
        scene(
          'top',
          'The panel keeps its distance from the start edge as it grows, so a textarea that gains a line does not slide the whole panel up under the cursor.',
          panel('placement="top" fullScreen="never"', { title: 'Comentário' }),
        ),
    ),
  }),
};

const LONG = `<p slText size="sm">
  A linha do meio é o único trilho que rola. Limitada, ela rola; ilimitada, empurraria o rodapé
  para fora da tela e o leitor não alcançaria o botão. Radix e React Aria não entregam layout
  algum, então esse é o resultado padrão de seguir o exemplo de qualquer uma das duas. Um
  terceiro parágrafo, para que haja o que rolar. E um quarto. E um quinto, abaixo da dobra.
</p>`;

export const Scroll: Story = {
  parameters: scenario('scroll'),
  render: () => ({
    template: grid(
      2,
      scene(
        'content — the body scrolls',
        'The header and the actions hold still while the middle row moves. This is the default, and it is the whole reason the panel is a three-row grid bounded to the layer.',
        panel('fullScreen="never"', { body: LONG, title: 'Termos de uso' }),
      ) +
        scene(
          'viewport — the panel scrolls',
          'For content that is read rather than acted on. The scrim stays where it is while the panel moves under it, because it is the other cell of the layer’s grid rather than a child of the box that scrolls.',
          panel('scroll="viewport" fullScreen="never"', { body: LONG, title: 'Termos de uso' }),
        ),
    ),
  }),
};

export const Surface: Story = {
  parameters: scenario('surface'),
  render: () => ({
    template: grid(
      2,
      scene(
        'panel — the family paints it',
        'The default: a raised surface, a border that survives forced colours, a radius, a shadow, and the three rows that keep the actions on screen however long the body is.',
        panel('fullScreen="never"'),
      ) +
        scene(
          'plain — you paint it',
          'No ground, no border, no radius, no shadow, no rows and no padding. The portal, the scrim, the focus containment and the dismissal policy are all still here; only the picture is yours.',
          layer(`<sl-dialog [container]="box" [open]="true" ${STILL} surface="plain" fullScreen="never">
            <div slCard fill="elevated">
              <h2 slDialogTitle>Um card, dentro da layer</h2>
              <p slDialogDescription>
                A família não pinta nada aqui. Escape ainda fecha, o foco ainda fica contido.
              </p>
            </div>
          </sl-dialog>`),
        ),
    ),
  }),
};

export const FullScreen: Story = {
  parameters: scenario('fullScreen'),
  render: () => ({
    template: grid(
      2,
      scene(
        'never',
        'The panel keeps its margins, its radius and its measure at every width. Right for a confirmation, which reads as an interruption rather than as a page.',
        panel('fullScreen="never" size="sm"'),
      ) +
        scene(
          'always',
          'Edge to edge: no margins, no radius and no border, because a panel that covers the layer hides the scrim and the edge would separate it from nothing.',
          panel('fullScreen="always"'),
        ) +
        scene(
          "fullscreenToggle — the reader's own word",
          'Press the mark beside the ✕: the panel takes the layer and the mark becomes its opposite, because a mark on a control says what the next press does. The axis above is what the consumer chose in advance; this is what the reader chose while reading.',
          panel('fullScreen="never" fullscreenToggle'),
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
        'Press Abrir modal: the scroll locks, everything outside the layer goes inert, and Tab wraps inside the panel. It is opened from a trigger because a modal layer takes the whole page over, and a page showing several at once would be lying about what one does.',
        layer(`<button slButton [slDialogTrigger]="d">Abrir modal</button>
          <sl-dialog #d="slDialog" [container]="box" fullScreen="never">
            <header slDialogHeader>
              <h2 slDialogTitle>Modal</h2>
              <p slDialogDescription>A rolagem está travada e o resto da página está inert.</p>
              <button slDialogClose></button>
            </header>
          </sl-dialog>`),
      ) +
        scene(
          /* A raw brace in template text opens an ICU expansion, so the
             attribute is written with the entity and reads as `{`. */
          'modal=&#123;false&#125; — and no aria-modal',
          'Nothing is inert, nothing is locked and focus is not contained, so the panel writes no aria-modal. The APG warns that marking a dialog modal without all of that is worse for a screen-reader reader than not marking it at all — and it is why every still demonstration on this page is this one.',
          panel('fullScreen="never"', { title: 'Detalhes' }),
        ),
    ),
  }),
};

export const Policy: Story = {
  parameters: scenario('policy'),
  render: () => ({
    props: {
      open: true,
      saving: true,
      refuse(this: { saving: boolean }, request: { value: boolean; cancel: () => void }) {
        if (!request.value && this.saving) request.cancel();
      },
    },
    template: grid(
      3,
      scene(
        'Three ways out',
        'Press Abrir, then Escape, the scrim or the ✕: each closes it, and each carries its own reason — escape, outsidePress, dismiss. The scrim decides on the click, so a selection dragged out of the panel and let go over it closes nothing.',
        layer(`<button slButton [slDialogTrigger]="a">Abrir</button>
          <sl-dialog #a="slDialog" [container]="box" fullScreen="never">
            <header slDialogHeader>
              <h2 slDialogTitle>Editar projeto</h2>
              <p slDialogDescription>Escape, a scrim e o ✕ são as três saídas.</p>
              <button slDialogClose></button>
            </header>
          </sl-dialog>`),
      ) +
        scene(
          'One guard, six ways out',
          'Press Escape, click the scrim, then the ✕: all three are refused by the same handler, because they are one request carrying a reason rather than four callbacks. Let the save finish and the same three work.',
          layer(`<button slButton size="sm" variant="outline" (click)="saving = !saving">
        {{ saving ? 'Terminar de salvar' : 'Voltar a salvar' }}
      </button>
      <button slButton size="sm" variant="ghost" [disabled]="open" (click)="open = true">
        Abrir de novo
      </button>
      <sl-dialog
        [container]="box"
        [(open)]="open"
        fullScreen="never"
        [modal]="false"
        [initialFocus]="false"
        (openChangeRequest)="refuse($event)"
      >
        <header slDialogHeader>
          <h2 slDialogTitle>Salvando</h2>
          <p slDialogDescription>
            Escape, um clique fora e o ✕ estão todos recusados pelo mesmo handler.
          </p>
          <button slDialogClose></button>
        </header>
      </sl-dialog>`),
          'stack',
        ) +
        scene(
          'outsidePress="none"',
          'The scrim is not a way out: a press on it does nothing, while Escape and the ✕ still close it. For a form a stray click must not throw away.',
          layer(`<button slButton [slDialogTrigger]="n">Abrir</button>
          <sl-dialog #n="slDialog" [container]="box" fullScreen="never" outsidePress="none">
            <header slDialogHeader>
              <h2 slDialogTitle>Editar projeto</h2>
              <p slDialogDescription>A scrim não fecha; Escape e o ✕ fecham.</p>
              <button slDialogClose></button>
            </header>
          </sl-dialog>`),
        ),
    ),
  }),
};

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => ({
    template: grid(
      2,
      scene(
        'The first tabbable element',
        'The default, and the pattern’s own. Tab from here and the ring never leaves the panel; Escape closes it and the ring is back on the trigger, not on the top of the page.',
        layer(`<button slButton [slDialogTrigger]="d">Abrir</button>
          <sl-dialog #d="slDialog" [container]="box" fullScreen="never">
            <header slDialogHeader>
              <h2 slDialogTitle>Renomear</h2>
              <p slDialogDescription>O foco entra e volta.</p>
              <button slDialogClose></button>
            </header>
            <div slDialogBody><input slTextField aria-label="Nome" /></div>
          </sl-dialog>`),
      ) +
        scene(
          'An element the consumer names',
          'Press Convidar: the caret starts in the second field rather than the first, because initialFocus takes an element. Opened from a trigger, because where focus goes on open cannot be shown by a panel that was already open.',
          layer(`<button slButton [slDialogTrigger]="d">Convidar alguém</button>
            <sl-dialog #d="slDialog" [container]="box" [initialFocus]="email" size="lg" fullScreen="never">
            <header slDialogHeader>
              <h2 slDialogTitle>Convidar alguém</h2>
              <p slDialogDescription>O foco não cai no primeiro campo, e sim no segundo.</p>
              <button slDialogClose></button>
            </header>
            <div slDialogBody>
              <input slTextField aria-label="Time" value="Equipe de produto" />
              <input #email slTextField aria-label="E-mail" />
            </div>
          </sl-dialog>`),
        ),
    ),
  }),
};

export const Loading: Story = {
  parameters: scenario('loading'),
  render: () => ({
    template: scene(
      'Open before its content arrived',
      'The body carries aria-busy and holds a floor, so the panel does not jump when the data lands. The ✕ and Escape both still work: a dialog a reader cannot leave is the worse failure.',
      panel('loading fullScreen="never"', {
        body: '<span slSkeleton shape="text"></span><span slSkeleton shape="text"></span>',
        description: 'Buscando os itens da fatura.',
        title: 'Fatura 4471',
      }),
    ),
  }),
};

export const Nested: Story = {
  parameters: scenario('nested'),
  render: () => ({
    template: scene(
      'A confirmation over a dialog',
      'Press Cancelar assinatura, then Escape once: only the confirmation closes, because dismissable-layer asks the topmost layer and stops there. The depth comes from the single stack, so neither layer states a z-index.',
      layer(`<sl-dialog [container]="box" [open]="true" ${STILL} size="lg" fullScreen="never">
        <header slDialogHeader>
          <h2 slDialogTitle>Faturamento</h2>
          <p slDialogDescription>A camada de baixo.</p>
          <button slDialogClose></button>
        </header>
        <div slDialogBody>
          <button slButton size="sm" tone="danger" variant="outline" [slDialogTrigger]="inner">
            Cancelar assinatura
          </button>
          <sl-alert-dialog #inner="slAlertDialog" [container]="box">
            <header slDialogHeader>
              <span slAlertDialogIcon></span>
              <h2 slDialogTitle>Cancelar a assinatura?</h2>
              <p slDialogDescription>A cobrança para no fim do período.</p>
            </header>
            <footer slDialogFooter>
              <button slButton size="sm" variant="outline" tone="secondary" slAlertDialogCancel>
                Manter
              </button>
              <button slButton size="sm" tone="danger" slAlertDialogAction>
                Cancelar assinatura
              </button>
            </footer>
          </sl-alert-dialog>
        </div>
      </sl-dialog>`),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A title with nowhere to break',
        'Sixty-two characters and no space in any of them. Without overflow-wrap the centred panel would widen past both edges of the layer at once, and neither edge would be reachable.',
        panel('size="sm" fullScreen="never"', {
          body: '',
          description:
            'Bestätigungsdialog für unwiderrufliche Aktionen mit einer außergewöhnlich langen Beschreibung.',
          footer: '',
          title: 'deployment-pipeline-eu-west-1-production-rollback-2026-09-04T01',
        }),
      ) +
        scene(
          'A panel with no body at all',
          'A header and a footer with nothing between them draw one rule, not two: every rule belongs to the row below it. When the two rows together are taller than the layer, the layer scrolls.',
          panel('size="sm" fullScreen="never"', {
            body: '',
            description: 'O projeto sai do espaço de trabalho.',
            title: 'Arquivar projeto',
          }),
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { result: undefined as string | undefined },
    template: grid(
      2,
      scene(
        'The trigger is the consumer’s own button',
        'slDialogTrigger is a directive on a slButton, so the wiring — aria-haspopup, aria-expanded, aria-controls and the press — lands on the library’s own control. Nothing is wrapped and nothing is reimplemented.',
        layer(`<button slButton variant="outline" tone="secondary" [slDialogTrigger]="d">
            Editar projeto
          </button>
          <sl-dialog #d="slDialog" [container]="box" size="sm" fullScreen="never">
            <header slDialogHeader>
              <h2 slDialogTitle>Editar projeto</h2>
              <p slDialogDescription>O gatilho é um slButton.</p>
              <button slDialogClose></button>
            </header>
          </sl-dialog>`),
      ) +
        scene(
          'Opening from code, and reading the result',
          'A template reference variable reaches the instance, so openDialog() and close(result) are available anywhere in the template. The result arrives on (closed), which is afterClosed() as an output.',
          layer(`<button slButton size="sm" variant="outline" (click)="d.openDialog()">
            Abrir do código
          </button>
          <p slText size="sm">{{ result === undefined ? 'Sem resultado ainda.' : 'Resultado: ' + result }}</p>
          <sl-dialog #d="slDialog" [container]="box" size="sm" fullScreen="never" (closed)="result = $event">
            <header slDialogHeader>
              <h2 slDialogTitle>Sem gatilho</h2>
              <p slDialogDescription>Aberto por openDialog(), fechado com um resultado.</p>
            </header>
            <footer slDialogFooter>
              <button slButton size="sm" slDialogClose value="salvo">Salvar</button>
            </footer>
          </sl-dialog>`),
          'stack',
        ),
    ),
  }),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  render: () => ({
    template: scene(
      'Eight decisions, taken once',
      'provideDialogDefaults sets the size, the placement and the full-screen policy for everything under the injector; a dialog that states one of them itself still wins, because an explicit consumer value always does.',
      panel('size="lg" fullScreen="never"', { title: 'Do próprio diálogo' }),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    template: scene(
      'Tab, Shift+Tab and Escape',
      'Tab from the last control and the ring lands on the first, not on the page behind. Escape closes and focus is back on the trigger. Both are @slotted/core/focus, because the platform’s dialog element is declined.',
      layer(`<button slButton [slDialogTrigger]="d">Abrir e tabular</button>
        <sl-dialog #d="slDialog" [container]="box" fullScreen="never">
          <header slDialogHeader>
            <h2 slDialogTitle>Três paradas de tabulação</h2>
            <p slDialogDescription>
              O ✕, o campo e o botão. Tab no último volta para o primeiro.
            </p>
            <button slDialogClose></button>
          </header>
          <div slDialogBody><input slTextField aria-label="Nome" /></div>
          <footer slDialogFooter><button slButton size="sm">Salvar</button></footer>
        </sl-dialog>`),
    ),
  }),
};
