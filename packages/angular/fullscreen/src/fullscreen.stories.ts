import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePresentation, lucideX } from '@ng-icons/lucide';
import { SlCard, SlCardBody, SlCardHeader } from '@slotted/angular/card';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { SlSparkline } from '@slotted/angular/sparkline';
import { SlHeading, SlText } from '@slotted/angular/typography';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';

import { SlFullscreen, SlFullscreenIcon, SlFullscreenTrigger } from './fullscreen';
import { provideFullscreenDefaults } from './fullscreen-defaults';
import { ANGULAR_FULLSCREEN_DOCS, ANGULAR_FULLSCREEN_TOKENS } from './fullscreen.docs';

interface FullscreenStoryArgs {
  mode: 'auto' | 'layout';
  navigationUI: 'auto' | 'show' | 'hide';
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_FULLSCREEN_DOCS.fullscreen.scenes, {
    playground: Playground,
    layout: Layout,
    controlled: Controlled,
    error: ErrorState,
    overlays: Overlays,
    document: DocumentRegion,
    keyboard: Keyboard,
    trigger: Trigger,
    iconOnly: IconOnly,
    outside: Outside,
    composition: Composition,
  }) as never;

/** The consumer's panel: a card with a title, a figure and a chart. */
const panel = (control = '<button slFullscreenTrigger iconOnly></button>', extra = '') => `
  <article slCard>
    <header slCardHeader>
      <div class="slotted-demo-row">
        <h3 slHeading size="lg">Receita por mês</h3>
        ${control}
      </div>
      <p slText size="sm" tone="muted">Jan – Jun 2026 · R$ mil · R$ 2,9 mi no semestre</p>
    </header>
    <div slCardBody>
      <span slSparkline [data]="revenue" label="Receita de janeiro a junho" size="lg" type="bar"></span>
      ${extra}
    </div>
  </article>`;

const REVENUE = [412, 468, 431, 522, 497, 588];

/* Components compile their template ahead of time, so they read constants
   rather than the function the story templates call. The status line of a
   demo sits in the card body, so it stays in view while the panel is full
   screen. */
const OPEN = `
  <article slCard>
    <header slCardHeader>
      <div class="slotted-demo-row">
        <h3 slHeading size="lg">Receita por mês</h3>`;
const BODY = `
      </div>
      <p slText size="sm" tone="muted">Jan – Jun 2026 · R$ mil · R$ 2,9 mi no semestre</p>
    </header>
    <div slCardBody>
      <span slSparkline [data]="revenue" label="Receita de janeiro a junho" size="lg" type="bar"></span>`;
const HEAD_ICON = `${OPEN}<button slFullscreenTrigger iconOnly></button>${BODY}`;
const HEAD_OUTLINE = `${OPEN}<button slFullscreenTrigger variant="outline"></button>${BODY}`;
const CLOSE = `
    </div>
  </article>`;

/** The page holds the state, and prints each request's reason. */
@Component({
  selector: 'fullscreen-controlled-demo',
  standalone: true,
  imports: [
    SlCard,
    SlCardBody,
    SlCardHeader,
    SlFullscreen,
    SlFullscreenTrigger,
    SlHeading,
    SlSparkline,
    SlText,
  ],
  template: `
    <section
      slFullscreen
      [(fullscreen)]="presenting"
      (fullscreenChangeRequest)="
        log.set([($event.value ? 'enter' : 'exit') + ' · ' + $event.reason].concat(log()))
      "
    >
      ${HEAD_ICON}
      <p slText size="sm" tone="muted">
        {{ log().length === 0 ? 'Nenhum pedido ainda.' : log().slice(0, 4).join(' — ') }}
      </p>
      ${CLOSE}
    </section>
  `,
})
class ControlledDemo {
  readonly presenting = signal(false);
  readonly log = signal<string[]>([]);
  readonly revenue = REVENUE;
}

/** Prints the last refusal. */
@Component({
  selector: 'fullscreen-error-demo',
  standalone: true,
  imports: [
    SlCard,
    SlCardBody,
    SlCardHeader,
    SlFullscreen,
    SlFullscreenTrigger,
    SlHeading,
    SlSparkline,
    SlText,
  ],
  template: `
    <section slFullscreen (fullscreenError)="kind.set($event.kind)">
      ${HEAD_ICON}
      <p slText size="sm" tone="muted">
        {{
          kind() === null
            ? 'O navegador ainda não recusou nada.'
            : 'Último erro: ' + kind() + ' — a região entrou no layout.'
        }}
      </p>
      ${CLOSE}
    </section>
  `,
})
class ErrorDemo {
  readonly kind = signal<string | null>(null);
  readonly revenue = REVENUE;
}

/** Prints the reason of the last request. */
@Component({
  selector: 'fullscreen-keyboard-demo',
  standalone: true,
  imports: [
    SlCard,
    SlCardBody,
    SlCardHeader,
    SlFullscreen,
    SlFullscreenTrigger,
    SlHeading,
    SlSparkline,
    SlText,
  ],
  template: `
    <section slFullscreen mode="layout" (fullscreenChangeRequest)="reason.set($event.reason)">
      ${HEAD_OUTLINE}
      <p slText size="sm" tone="muted">Última razão: {{ reason() }}</p>
      ${CLOSE}
    </section>
  `,
})
class KeyboardDemo {
  readonly reason = signal('—');
  readonly revenue = REVENUE;
}

const DIRECTIVES = [
  ControlledDemo,
  ErrorDemo,
  KeyboardDemo,
  NgIcon,
  SlCard,
  SlCardBody,
  SlCardHeader,
  SlFullscreen,
  SlFullscreenIcon,
  SlFullscreenTrigger,
  SlHeading,
  SlSelect,
  SlSelectItem,
  SlSparkline,
  SlText,
];

const meta: Meta<FullscreenStoryArgs> = {
  title: 'Components/Fullscreen',
  component: SlFullscreen,
  decorators: [
    applicationConfig({ providers: [provideIcons({ lucidePresentation, lucideX })] }),
    moduleMetadata({ imports: DIRECTIVES }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Fullscreen',
        description:
          'A region the reader can give the whole screen — by the Fullscreen API where the page may ask, fixed over the page where it may not — and the control whose words and mark follow the state. Escape in native full screen stays the browser’s.',
        framework: 'Angular',
        ...ANGULAR_FULLSCREEN_DOCS.fullscreen,
        tokens: ANGULAR_FULLSCREEN_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<FullscreenStoryArgs>;

const scene = (
  label: string,
  note: string,
  body: string,
  layout: 'block' | 'row' | 'stack' | 'prose' = 'block',
  floor?: number,
) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}"${floor === undefined ? '' : ` data-collapse-floor="${String(floor)}"`}>${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, scenes: string) =>
  `<div class="slotted-demo-grid" data-columns="${String(columns)}">${scenes}</div>`;

export const Playground: Story = {
  args: { mode: 'auto', navigationUI: 'auto' },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...args, revenue: REVENUE },
    template: `
      <div class="slotted-demo-stage" data-layout="block">
        <section slFullscreen [mode]="mode" [navigationUI]="navigationUI">${panel()}</section>
      </div>`,
  }),
};

export const Layout: Story = {
  parameters: scenario('layout'),
  render: () => ({
    props: { revenue: REVENUE },
    template: scene(
      'mode=layout',
      'Press the control: the panel is fixed over this page, the page stops scrolling, and Escape or the control gives it back.',
      `<section slFullscreen mode="layout">${panel('<button slFullscreenTrigger variant="outline"></button>')}</section>`,
    ),
  }),
};

export const Controlled: Story = {
  parameters: scenario('controlled'),
  render: () => ({
    template: scene(
      '[(fullscreen)] + fullscreenChangeRequest',
      'The page holds the value; the line under the panel prints the reason of every request, escape included.',
      `<fullscreen-controlled-demo />`,
    ),
  }),
};

export const ErrorState: Story = {
  name: 'Error',
  parameters: scenario('error'),
  render: () => ({
    template: scene(
      'fullscreenError',
      'Inside Storybook’s preview frame the browser may refuse; the line prints the kind, and the panel is full screen in the layout either way.',
      `<fullscreen-error-demo />`,
    ),
  }),
};

export const Overlays: Story = {
  parameters: scenario('overlays'),
  render: () => ({
    props: { revenue: REVENUE },
    template: scene(
      'sl-select inside the region',
      'Enter full screen, then open the period: the list opens inside the region, above the chart.',
      `<section slFullscreen>${panel(
        undefined,
        `<sl-select aria-label="Período" [value]="'6m'">
          <sl-select-item value="3m">Últimos 3 meses</sl-select-item>
          <sl-select-item value="6m">Últimos 6 meses</sl-select-item>
          <sl-select-item value="12m">Últimos 12 meses</sl-select-item>
        </sl-select>`,
      )}</section>`,
    ),
  }),
};

export const DocumentRegion: Story = {
  name: 'Document',
  parameters: scenario('document'),
  render: () => ({
    template: scene(
      'The application root as the region',
      'The directive sits on the outermost element of this story and the control takes its instance: the whole story goes full screen.',
      `<div slFullscreen #app="slFullscreen" class="slotted-demo-stack">
        <div class="slotted-demo-row">
          <button [slFullscreenTrigger]="app" variant="outline">
            {{ app.fullscreen() ? 'Sair do modo apresentação' : 'Modo apresentação' }}
          </button>
          <p slText size="sm" tone="muted">
            {{ app.supported() ? 'A API está disponível.' : 'Sem API: a história vai para o layout.' }}
          </p>
        </div>
      </div>`,
      'stack',
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    template: scene(
      'Tab · Space · Enter · Escape',
      'Space prints keyboard; a click prints pointer; Escape in the layout prints escape. While full screen, Tab stays inside the panel.',
      `<fullscreen-keyboard-demo />`,
    ),
  }),
};

export const Trigger: Story = {
  parameters: scenario('trigger'),
  render: () => ({
    template: grid(
      2,
      scene(
        'ghost',
        'Bare until hovered, for a bar that is already framed.',
        `<button slFullscreenTrigger size="sm"></button><button slFullscreenTrigger></button><button slFullscreenTrigger size="lg"></button>`,
        'row',
      ) +
        scene(
          'outline',
          'Its own edge and ground, for a control over content.',
          `<button slFullscreenTrigger size="sm" variant="outline"></button><button slFullscreenTrigger variant="outline"></button><button slFullscreenTrigger size="lg" variant="outline"></button>`,
          'row',
        ) +
        scene(
          'In full screen',
          'The words and the mark say what the press does next. The region here starts in the layout; the control inside brings it back.',
          `<div slFullscreen #shown="slFullscreen" mode="layout"></div>
          <button [slFullscreenTrigger]="shown"></button>
          <button [slFullscreenTrigger]="shown" variant="outline"></button>`,
          'row',
        ) +
        scene(
          'disabled',
          'Legible, and the press is refused.',
          `<button slFullscreenTrigger disabled></button><button slFullscreenTrigger disabled variant="outline"></button>`,
          'row',
        ),
    ),
  }),
};

export const IconOnly: Story = {
  parameters: scenario('iconOnly'),
  render: () => ({
    template: scene(
      'iconOnly',
      'Square from the control height; the words stay as the accessible name in both states.',
      `<button slFullscreenTrigger iconOnly size="sm"></button>
      <button slFullscreenTrigger iconOnly></button>
      <button slFullscreenTrigger iconOnly size="lg"></button>
      <button slFullscreenTrigger iconOnly variant="outline"></button>`,
      'row',
      // A square control is as wide as it is tall, 30 to 38 pixels by step.
      24,
    ),
  }),
};

export const Outside: Story = {
  parameters: scenario('outside'),
  render: () => ({
    props: { revenue: REVENUE },
    template: scene(
      'exportAs + [slFullscreenTrigger]',
      'The control in the bar drives the section below; the control inside the section takes the reader back.',
      `<div class="slotted-demo-row">
          <p slText size="sm" tone="muted">Painel de vendas</p>
          <button [slFullscreenTrigger]="chart" variant="outline"></button>
        </div>
        <section slFullscreen #chart="slFullscreen" mode="layout">${panel()}</section>`,
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  decorators: [
    applicationConfig({
      providers: [
        provideFullscreenDefaults({
          size: 'sm',
          messages: { enter: 'Tela cheia', exit: 'Sair da tela cheia' },
        }),
      ],
    }),
  ],
  render: () => ({
    props: { revenue: REVENUE },
    template: scene(
      'Provider, a label and a mark of the consumer',
      'The provider sets the step and the Portuguese messages; the control says Apresentar and Terminar and changes its mark with the state.',
      `<div class="slotted-demo-measure">
        <section slFullscreen #fs="slFullscreen" mode="layout">${panel(
          `<button slFullscreenTrigger variant="outline">
            <ng-icon slFullscreenIcon [name]="fs.fullscreen() ? 'lucideX' : 'lucidePresentation'" />
            {{ fs.fullscreen() ? 'Terminar' : 'Apresentar' }}
          </button>`,
        )}</section>
      </div>`,
    ),
  }),
};
