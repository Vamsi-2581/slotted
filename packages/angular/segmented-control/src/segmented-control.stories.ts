import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlignCenter,
  lucideAlignLeft,
  lucideAlignRight,
  lucideChartColumn,
  lucideMap,
  lucideTable,
} from '@ng-icons/lucide';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { SlButton } from '@slotted/angular/button';
import { SlField, SlFieldDescription, SlFieldLabel } from '@slotted/angular/field';
import { SlTextField } from '@slotted/angular/text-field';
import { SlText } from '@slotted/angular/typography';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';

import { SlSegmentedControl } from './segmented-control';
import type {
  SegmentedControlCondense,
  SegmentedControlOrientation,
  SegmentedControlSize,
} from './segmented-control-defaults';
import { SlSegment, SlSegmentIcon } from './segmented-control-parts';
import {
  ANGULAR_SEGMENTED_CONTROL_DOCS,
  ANGULAR_SEGMENTED_CONTROL_TOKENS,
} from './segmented-control.docs';

interface SegmentedControlStoryArgs {
  condense: SegmentedControlCondense;
  disabled: boolean;
  fullWidth: boolean;
  invalid: boolean;
  orientation: SegmentedControlOrientation;
  readOnly: boolean;
  required: boolean;
  size: SegmentedControlSize;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_SEGMENTED_CONTROL_DOCS.segmentedControl.scenes, {
    playground: Playground,
    sizes: Sizes,
    orientation: Orientation,
    states: States,
    iconOnly: IconOnly,
    condense: Condense,
    width: Width,
    field: InsideAField,
    form: InAForm,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const DIRECTIVES = [
  NgIcon,
  ReactiveFormsModule,
  SlButton,
  SlField,
  SlFieldDescription,
  SlFieldLabel,
  SlSegment,
  SlSegmentIcon,
  SlSegmentedControl,
  SlText,
  SlTextField,
];

const meta: Meta<SegmentedControlStoryArgs> = {
  title: 'Components/SegmentedControl',
  component: SlSegmentedControl,
  decorators: [
    applicationConfig({
      providers: [
        provideIcons({
          lucideAlignCenter,
          lucideAlignLeft,
          lucideAlignRight,
          lucideChartColumn,
          lucideMap,
          lucideTable,
        }),
      ],
    }),
    moduleMetadata({ imports: DIRECTIVES }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Segmented Control',
        description:
          'One choice out of a few, applied at once, on a track. Every segment is a real radio sharing one name, so the platform supplies the whole keyboard, the submitted value and the position a screen reader announces — and the thumb’s place is arithmetic rather than measured.',
        framework: 'Angular',
        ...ANGULAR_SEGMENTED_CONTROL_DOCS.segmentedControl,
        tokens: ANGULAR_SEGMENTED_CONTROL_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<SegmentedControlStoryArgs>;

const scene = (
  label: string,
  note: string,
  body: string,
  layout: 'block' | 'row' | 'stack' | 'prose' = 'block',
) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}">${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, scenes: string) =>
  `<div class="slotted-demo-grid" data-columns="${String(columns)}">${scenes}</div>`;

const measure = (body: string) => `<div class="slotted-demo-measure">${body}</div>`;

const RANGE = `<label slSegment value="day">Dia</label>
  <label slSegment value="week">Semana</label>
  <label slSegment value="month">Mês</label>`;

const VIEW = `<label slSegment value="grid">Grade</label>
  <label slSegment value="list">Lista</label>`;

export const Playground: Story = {
  args: {
    condense: 'none',
    disabled: false,
    fullWidth: false,
    invalid: false,
    orientation: 'horizontal',
    readOnly: false,
    required: false,
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `
      <div class="slotted-demo-stage" data-layout="block">
        <div
          slSegmentedControl
          aria-label="Período do gráfico"
          defaultValue="week"
          [size]="size"
          [orientation]="orientation"
          [condense]="condense"
          [fullWidth]="fullWidth"
          [disabled]="disabled"
          [readOnly]="readOnly"
          [invalid]="invalid"
          [required]="required"
        >
          ${RANGE}
        </div>
      </div>`,
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: grid(
      1,
      scene(
        'The three steps',
        'The track measures its segments back from the control height, so the whole control is the same height as every other control at that step and at every density.',
        `<div slSegmentedControl aria-label="Visualização pequena" size="sm" defaultValue="grid">${VIEW}</div>
         <div slSegmentedControl aria-label="Visualização média" size="md" defaultValue="grid">${VIEW}</div>
         <div slSegmentedControl aria-label="Visualização grande" size="lg" defaultValue="grid">${VIEW}</div>`,
      ) +
        scene(
          'In the row it shares with a field and a button',
          'This is the reason the height is measured back rather than added to: a control two pixels prouder than the field beside it is the defect nobody can name and everybody sees.',
          `<div slTextField><input slTextFieldInput value="INV-2048" aria-label="Número da fatura" /></div>
           <div slSegmentedControl aria-label="Moeda" defaultValue="brl">
             <label slSegment value="brl">BRL</label>
             <label slSegment value="usd">USD</label>
           </div>
           <button slButton tone="secondary" variant="outline">Salvar</button>`,
          'row',
        ),
    ),
  }),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Along the line',
        'aria-orientation is written here because radiogroup already implies vertical, so the attribute says something exactly when the set flows the other way.',
        `<div slSegmentedControl aria-label="Período em linha" defaultValue="week">${RANGE}</div>`,
      ) +
        scene(
          'Down the page',
          'The thumb travels in the block axis and the rules between the segments turn with it. The platform moves the choice with both pairs of arrows either way.',
          `<div slSegmentedControl aria-label="Pagamento" orientation="vertical" defaultValue="invoice">
             <label slSegment value="card">Cartão</label>
             <label slSegment value="transfer">Transferência</label>
             <label slSegment value="invoice">Boleto</label>
           </div>`,
        ),
    ),
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    template: grid(
      2,
      scene(
        'One segment out of action',
        'An unavailable segment loses its ink and keeps its place. Point at the two beside it: a live segment answers with a neutral ground, and the chosen one does not answer at all.',
        `<div slSegmentedControl aria-label="Plano com um indisponível" defaultValue="starter">
           <label slSegment value="starter">Inicial</label>
           <label slSegment value="team">Equipe</label>
           <label slSegment value="enterprise" disabled>Corporativo</label>
         </div>`,
      ) +
        scene(
          'The whole control out of action',
          'The track keeps its ground so the thumb still reads against it: a reader learns which of the three was chosen even in a control they cannot change.',
          `<div slSegmentedControl aria-label="Plano indisponível" disabled defaultValue="team">
             <label slSegment value="starter">Inicial</label>
             <label slSegment value="team">Equipe</label>
             <label slSegment value="enterprise">Corporativo</label>
           </div>`,
        ) +
        scene(
          'Read-only',
          'It keeps every colour and every tab stop and refuses the change on the click a pointer and Space share, because a radio has no readonly and it must not look disabled.',
          `<div slSegmentedControl aria-label="Plano somente leitura" readOnly defaultValue="team">
             <label slSegment value="starter">Inicial</label>
             <label slSegment value="team">Equipe</label>
             <label slSegment value="enterprise">Corporativo</label>
           </div>`,
        ) +
        scene(
          'Invalid, with nothing chosen',
          'The track takes the danger edge and the focus ring is pointed at the same step, so the outline and its shadow move together instead of being repainted rule by rule.',
          `<div slSegmentedControl aria-label="Plano inválido" invalid required>
             <label slSegment value="starter">Inicial</label>
             <label slSegment value="team">Equipe</label>
             <label slSegment value="enterprise">Corporativo</label>
           </div>`,
        ),
    ),
  }),
};

export const IconOnly: Story = {
  parameters: scenario('iconOnly'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Marks without words',
        'A segment with only a mark draws square and takes its name from the aria-label, which the family reads from the host and writes onto the radio that holds the focus.',
        `<div slSegmentedControl aria-label="Alinhamento" defaultValue="center">
           <label slSegment value="start" aria-label="Início">
             <ng-icon slSegmentIcon name="lucideAlignLeft" />
           </label>
           <label slSegment value="center" aria-label="Centro">
             <ng-icon slSegmentIcon name="lucideAlignCenter" />
           </label>
           <label slSegment value="end" aria-label="Fim">
             <ng-icon slSegmentIcon name="lucideAlignRight" />
           </label>
         </div>`,
      ) +
        scene(
          'At the smallest step',
          'The thumb is shorter than the control, so the radio reaches the track&#39;s own edge: the target stays the control&#39;s full height even where the thumb is eighteen pixels.',
          `<div slSegmentedControl aria-label="Alinhamento pequeno" size="sm" defaultValue="center">
             <label slSegment value="start" aria-label="Início">
               <ng-icon slSegmentIcon name="lucideAlignLeft" />
             </label>
             <label slSegment value="center" aria-label="Centro">
               <ng-icon slSegmentIcon name="lucideAlignCenter" />
             </label>
           </div>`,
        ),
    ),
  }),
};

export const Condense: Story = {
  parameters: scenario('condense'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Room for its words',
        'Above the breakpoint the control shows the mark and the label together, which is what a page header has room for and what a reader reads fastest.',
        `<div slSegmentedControl aria-label="Relatório largo" condense="icons" defaultValue="table">
           <label slSegment value="table"><ng-icon slSegmentIcon name="lucideTable" />Tabela</label>
           <label slSegment value="chart"><ng-icon slSegmentIcon name="lucideChartColumn" />Gráfico</label>
           <label slSegment value="map"><ng-icon slSegmentIcon name="lucideMap" />Mapa</label>
         </div>`,
      ) +
        scene(
          'Narrower than its words',
          'The same control in a sidebar keeps its marks and hides its words. They are hidden and not removed, so each segment is announced exactly as it was at the wider size.',
          measure(
            `<div slSegmentedControl aria-label="Relatório estreito" condense="icons" defaultValue="table">
               <label slSegment value="table"><ng-icon slSegmentIcon name="lucideTable" />Tabela</label>
               <label slSegment value="chart"><ng-icon slSegmentIcon name="lucideChartColumn" />Gráfico</label>
               <label slSegment value="map"><ng-icon slSegmentIcon name="lucideMap" />Mapa</label>
             </div>`,
          ),
        ),
    ),
  }),
};

export const Width: Story = {
  parameters: scenario('width'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Every column is the widest label’s',
        'Left alone the track shrinks to its content and the columns stay equal, which is the rule Carbon states — taken from the layout here rather than measured by script.',
        `<div slSegmentedControl aria-label="Situação" defaultValue="all">
           <label slSegment value="all">Todas</label>
           <label slSegment value="draft">Rascunho</label>
           <label slSegment value="sent">Enviada</label>
           <label slSegment value="overdue">Vencida</label>
           <label slSegment value="paid">Paga</label>
         </div>`,
      ) +
        scene(
          'Sharing the whole line',
          'fullWidth spreads the same equal columns across the line the control was given, so a filter above a table lines up with the table&#39;s own edges.',
          `<div slSegmentedControl aria-label="Entrega" fullWidth defaultValue="afternoon">
             <label slSegment value="morning">Manhã</label>
             <label slSegment value="afternoon">Tarde</label>
             <label slSegment value="evening">Noite</label>
           </div>`,
        ),
    ),
  }),
};

export const InsideAField: Story = {
  parameters: scenario('field'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Labelled and described by its field',
        'The control takes its step and its state from the field and gives it back something to name: the label points at the set, and the description reaches it through aria-describedby.',
        `<div slField>
           <label slFieldLabel>Moeda da fatura</label>
           <div slSegmentedControl name="currency" defaultValue="brl">
             <label slSegment value="brl">BRL</label>
             <label slSegment value="usd">USD</label>
             <label slSegment value="eur">EUR</label>
           </div>
           <p slFieldDescription>A conversão usa a cotação do dia da emissão.</p>
         </div>`,
      ) +
        scene(
          'A field at the large step',
          'size comes from the field unless the control states its own, and invalid arrives the same way — one decision taken once, on the row that owns the label.',
          `<div slField size="lg">
             <label slFieldLabel>Prazo</label>
             <div slSegmentedControl name="speed" defaultValue="standard">
               <label slSegment value="standard">Padrão</label>
               <label slSegment value="express">Expresso</label>
             </div>
           </div>`,
        ),
    ),
  }),
};

export const InAForm: Story = {
  parameters: scenario('form'),
  render: () => ({
    props: { currency: new FormControl<string | null>(null) },
    template: grid(
      1,
      scene(
        'Owned by a reactive form, and validated',
        'The control writes the value, reports touched on blur and answers setDisabledState; required is validated over the set, which no single segment could see on its own.',
        `<div slSegmentedControl aria-label="Moeda" required [formControl]="currency">
           <label slSegment value="brl">BRL</label>
           <label slSegment value="usd">USD</label>
           <label slSegment value="eur">EUR</label>
         </div>
         <p slText size="sm" tone="muted">
           valor: {{ currency.value ?? '—' }} · válido: {{ currency.valid }}
         </p>`,
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
        'A label longer than its column',
        'Every column is equal, so the longer label clips at the ellipsis rather than making one segment wider than the rest — and its whole string stays in the DOM.',
        measure(
          `<div slSegmentedControl aria-label="Frequência" fullWidth defaultValue="now">
             <label slSegment value="now">Imediatamente</label>
             <label slSegment value="digest">Uma vez por dia, no resumo da noite</label>
           </div>`,
        ),
      ) +
        scene(
          'A mirrored label inside a page that is not',
          'An Arabic segment reads right to left without the control mirroring around it, because the direction belongs to the text and the thumb follows the track.',
          `<div slSegmentedControl aria-label="Idioma" defaultValue="ar">
             <label slSegment value="ar"><span dir="rtl">العربية</span></label>
             <label slSegment value="en">English</label>
           </div>`,
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
        'Every part is a directive on the consumer’s own element',
        'The label is the consumer&#39;s: its attributes and listeners stay as written, and the family adds the radio, the words and the wiring rather than the element itself.',
        `<div slSegmentedControl aria-label="Visualização do consumidor" defaultValue="grid">
           <label slSegment value="grid" data-testid="grid">Grade</label>
           <label slSegment value="list">Lista</label>
         </div>`,
      ) +
        scene(
          'A template reaches the instance',
          'exportAs hands the control over, so a template reads selection() and checkedIndex() from the family rather than holding a second copy of the same state.',
          `<div slSegmentedControl #view="slSegmentedControl" aria-label="Visualização exportada" defaultValue="grid">
             <label slSegment value="grid">Grade</label>
             <label slSegment value="list">Lista</label>
           </div>
           <p slText size="sm" tone="muted">
             escolhido: {{ view.selection() }} · índice: {{ view.checkedIndex() }}
           </p>`,
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
        'Nothing chosen yet',
        'Tab lands on the first segment and there is no thumb to see; press an arrow or Space and it fades in where it belongs rather than sliding from an edge nobody saw.',
        `<div slSegmentedControl aria-label="Envio sem escolha">
           <label slSegment value="standard">Padrão</label>
           <label slSegment value="express">Expresso</label>
           <label slSegment value="overnight">Noturno</label>
         </div>`,
      ) +
        scene(
          'With a choice already made',
          'Tab lands on the checked segment, and both pairs of arrows move focus and the choice together and wrap at the ends. Every row of that table is the platform&#39;s.',
          `<div slSegmentedControl aria-label="Envio com escolha" defaultValue="express">
             <label slSegment value="standard">Padrão</label>
             <label slSegment value="express">Expresso</label>
             <label slSegment value="overnight">Noturno</label>
           </div>`,
        ),
    ),
  }),
};
