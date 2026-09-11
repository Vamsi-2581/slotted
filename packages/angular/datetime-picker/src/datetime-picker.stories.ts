import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SlField, SlFieldDescription, SlFieldError, SlFieldLabel } from '@slotted/angular/field';
import { plainDate, plainDateTime, plainTime } from '@slotted/core/date';
import type { PlainDate, PlainDateTime, PlainTime } from '@slotted/core/date';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlDateTimePicker } from './datetime-picker';
import type {
  DateTimePickerCloseOnSelect,
  DateTimePickerOpenTo,
  DateTimePickerPlacement,
  DateTimePickerSize,
  DateTimePickerVariant,
} from './datetime-picker-defaults';
import {
  SlDateTimePickerFooter,
  SlDateTimePickerOption,
  SlDateTimePickerPresets,
} from './datetime-picker-parts';
import {
  ANGULAR_DATE_TIME_PICKER_DOCS,
  ANGULAR_DATE_TIME_PICKER_TOKENS,
} from './datetime-picker.docs';

interface DateTimePickerStoryArgs {
  clearable: boolean;
  closeOnSelect: DateTimePickerCloseOnSelect;
  locale: string;
  openTo: DateTimePickerOpenTo;
  placement: DateTimePickerPlacement;
  size: DateTimePickerSize;
  step: number;
  variant: DateTimePickerVariant;
}

/** A consultation on a Thursday afternoon, and the clinic it belongs to. */
const CONSULTATION: PlainDateTime = plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20));
/** Stated rather than read from the clock, so every scene reads the same twice. */
const REFERENCE: PlainDateTime = plainDateTime(plainDate(2026, 9, 10), plainTime(14, 40));

const CLINIC = {
  max: plainDateTime(plainDate(2026, 12, 20), plainTime(12, 0)),
  maxTime: plainTime(18, 0),
  min: plainDateTime(plainDate(2026, 9, 11), plainTime(14, 0)),
  minTime: plainTime(9, 0),
};

/** A clinic's own hours: no step describes them, and `options` states them. */
const HOURS: PlainTime[] = [
  plainTime(9, 0),
  plainTime(9, 20),
  plainTime(11, 40),
  plainTime(13, 45),
  plainTime(16, 0),
];

const isSaturday = (date: PlainDate) =>
  new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() === 6;

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_DATE_TIME_PICKER_DOCS.dateTimePicker.scenes, {
    playground: Playground,
    panel: Panel,
    'open-to': OpenTo,
    completeness: Completeness,
    seconds: Seconds,
    step: Step,
    'range-bounds': RangeBounds,
    'day-window': DayWindow,
    unavailable: Unavailable,
    now: Now,
    relative: Relative,
    presets: Presets,
    sizes: Sizes,
    variants: Variants,
    placement: Placement,
    states: States,
    forms: Forms,
    narrow: Narrow,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const DIRECTIVES = [
  ReactiveFormsModule,
  SlDateTimePicker,
  SlDateTimePickerFooter,
  SlDateTimePickerOption,
  SlDateTimePickerPresets,
  SlField,
  SlFieldDescription,
  SlFieldError,
  SlFieldLabel,
];

const meta: Meta<DateTimePickerStoryArgs> = {
  title: 'Components/DateTimePicker',
  component: SlDateTimePicker,
  decorators: [moduleMetadata({ imports: DIRECTIVES })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'DateTime Picker',
        description:
          'The only family in the library that holds two surfaces at once: a month and a list of times, inside one dialog, over a field that still types every segment. The decision it owes is which of the two focus opens on — and what happens to the other when the reader finishes the first. The answer is the value’s own completeness: the press that leaves it half written carries focus to the missing half, and the press that finishes it closes the panel.',
        framework: 'Angular',
        ...ANGULAR_DATE_TIME_PICKER_DOCS.dateTimePicker,
        tokens: ANGULAR_DATE_TIME_PICKER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<DateTimePickerStoryArgs>;

/**
 * One demonstration: what it is called, what to look at, and the stage that
 * owns the distance between the examples on it. Every story below composes this
 * rather than laying itself out, so no two examples can end up against each
 * other and no story reaches for an inline style.
 */
const scene = (
  label: string,
  note: string,
  body: string,
  layout: 'block' | 'row' | 'stack' | 'prose' = 'stack',
  collapseFloor?: number,
) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div
      class="slotted-demo-stage"
      data-layout="${layout}"
      ${collapseFloor === undefined ? '' : `data-collapse-floor="${String(collapseFloor)}"`}
    >${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, scenes: string) =>
  `<div class="slotted-demo-grid" data-columns="${String(columns)}">${scenes}</div>`;

/** A narrow column, for showing what a control does below 320 pixels. */
const measure = (body: string) => `<div class="slotted-demo-measure">${body}</div>`;

/**
 * Every open panel needs room under it, and the stage is what gives it. This
 * one holds a month and a column of times, so it is a screen rather than the
 * tall box a single listbox needs.
 */
const stage = (body: string) =>
  `<div class="slotted-demo-viewport" data-size="screen">${body}</div>`;

/** The two pairs of bounds, written once for the scenes that need them. */
const BOUNDS = '[min]="min" [max]="max" [minTime]="minTime" [maxTime]="maxTime"';

export const Playground: Story = {
  args: {
    clearable: true,
    closeOnSelect: 'auto',
    locale: 'pt-BR',
    openTo: 'date',
    placement: 'bottom-start',
    size: 'md',
    step: 900,
    variant: 'outline',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...args, reference: REFERENCE },
    template: `
      <div class="slotted-demo-stage" data-layout="block">
        <div slField>
          <label slFieldLabel>Início da consulta</label>
          <div
            slDateTimePicker
            name="inicio"
            [locale]="locale"
            [size]="size"
            [variant]="variant"
            [placement]="placement"
            [openTo]="openTo"
            [closeOnSelect]="closeOnSelect"
            [step]="step"
            [clearable]="clearable"
            [referenceDateTime]="reference"
          ></div>
          <span slFieldDescription>Escolha no painel ou escreva no campo.</span>
        </div>
      </div>`,
  }),
};

export const Panel: Story = {
  parameters: scenario('panel'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      1,
      scene(
        'Um diálogo, duas superfícies',
        'Uma grelha que o SlCalendar desenha e uma listbox que esta família desenha, lado a lado dentro do mesmo role=dialog. As duas estão no DOM em qualquer largura: um tablist que existe num contentor estreito e não num largo conta duas histórias diferentes do mesmo componente à tecnologia assistiva.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             aria-label="Início"
             [step]="1800"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ),
    ),
  }),
};

export const OpenTo: Story = {
  parameters: scenario('open-to'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      2,
      scene(
        'O foco abre na data',
        'O predefinido, e a ordem em que o próprio valor se lê. O leitor chega ao dia do valor, com a roving focus do calendário já no sítio.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             openTo="date"
             aria-label="Abre na data"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ) +
        scene(
          'O foco abre na hora',
          'Para uma agenda cujo dia já está decidido. openTo decide o foco e não o desenho: as duas superfícies continuam presentes, porque mover um mês inteiro por causa de uma definição faria a mesma família parecer duas.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               openTo="time"
               aria-label="Abre na hora"
               [defaultValue]="value"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const Completeness: Story = {
  parameters: scenario('completeness'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      2,
      scene(
        'Metade escrita: o foco vai à que falta',
        'Um dia escolhido sobre um campo vazio deixa o valor por acabar, e o painel fica — com o foco já na lista. A banda no topo diz o que o leitor tem até agora, e desenha a metade que falta como espaço reservado.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             closeOnSelect="auto"
             aria-label="Por acabar"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ) +
        scene(
          'Valor inteiro: o painel fecha',
          'A prensa que completa o valor fecha o painel e devolve o foco ao gatilho, cujo nome acessível carrega o que foi escolhido. É a razão pela qual esta família não precisa do needConfirm do Ant nem do Set do Kendo.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               closeOnSelect="auto"
               aria-label="Fecha ao completar"
               [defaultValue]="value"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ) +
        scene(
          'always',
          'Qualquer prensa que mude o valor fecha o painel, mesmo quando ele já estava inteiro. Para um fluxo onde trocar de dia é uma decisão e não uma exploração.',
          `<div
             slDateTimePicker
             locale="pt-BR"
             closeOnSelect="always"
             aria-label="Sempre"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ) +
        scene(
          'never',
          'O painel só fecha por Escape, por uma prensa fora dele ou pelo gatilho. Para um painel embebido num formulário que confirma noutro sítio — o slot do rodapé existe para isso.',
          `<div
             slDateTimePicker
             locale="pt-BR"
             closeOnSelect="never"
             aria-label="Nunca"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ),
    ),
  }),
};

export const Seconds: Story = {
  parameters: scenario('seconds'),
  render: () => ({
    props: {
      value: plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20, 30)),
      reference: REFERENCE,
      from: plainTime(15, 20),
      to: plainTime(15, 25),
    },
    template: grid(
      1,
      scene(
        'Meio minuto dentro de uma janela',
        'O campo escreve cada segundo e a lista oferece um passo de 30 segundos — onze linhas dentro de uma janela limitada, e não as 86 400 que um dia inteiro seria. A guarda é sobre o comprimento da lista, maxOptions, e nunca sobre o tamanho do passo.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             granularity="second"
             defaultOpen
             aria-label="Segundos"
             [step]="30"
             [minTime]="from"
             [maxTime]="to"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ),
    ),
  }),
};

export const Step: Story = {
  parameters: scenario('step'),
  render: () => ({
    props: {
      base: plainDateTime(plainDate(2026, 9, 10), plainTime(9, 7)),
      ceiling: plainDateTime(plainDate(2026, 9, 12), plainTime(11, 0)),
      hours: HOURS,
      chosen: plainDateTime(plainDate(2026, 9, 10), plainTime(11, 40)),
      reference: REFERENCE,
    },
    template: grid(
      2,
      scene(
        'Contado a partir do limite inferior',
        'min às 09:07 com um passo de quinze minutos oferece 09:07, 09:22, 09:37 — a regra da própria plataforma para input[type=time], que nenhum painel pesquisado enuncia.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             aria-label="Base"
             [min]="base"
             [max]="ceiling"
             [step]="900"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ) +
        scene(
          'Horários que nenhum passo descreve',
          '09:00, 09:20, 11:40, 13:45, 16:00. options enuncia-os na ordem do consumidor, e o campo ao lado continua a aceitar qualquer hora entre duas linhas.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               aria-label="Horários da clínica"
               [options]="hours"
               [defaultValue]="chosen"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const RangeBounds: Story = {
  parameters: scenario('range-bounds'),
  render: () => ({
    props: {
      ...CLINIC,
      firstDay: plainDateTime(plainDate(2026, 9, 11), plainTime(14, 0)),
      middleDay: plainDateTime(plainDate(2026, 9, 15), plainTime(10, 0)),
      reference: REFERENCE,
    },
    template: grid(
      2,
      scene(
        'O primeiro dia é parcial',
        'No próprio dia de min a lista começa em min e não em minTime: 11 de setembro abre às 14:00 e não às 09:00. Os dois pares valem ao mesmo tempo, e é esta combinação que a página de validação do MUI regista não conseguir entregar.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             aria-label="Primeiro dia"
             ${BOUNDS}
             [step]="3600"
             [defaultValue]="firstDay"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ) +
        scene(
          'Um dia do meio corre a janela inteira',
          '15 de setembro vai das 09:00 às 18:00 — a janela que se repete todos os dias dentro do intervalo. O dia de max corre até 12:00 e para aí, e nenhum dos dois limites precisa de ser reescrito por dia.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               aria-label="Dia do meio"
               ${BOUNDS}
               [step]="3600"
               [defaultValue]="middleDay"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const DayWindow: Story = {
  parameters: scenario('day-window'),
  render: () => ({
    props: {
      closesEarly: (time: PlainTime, date: PlainDate) => isSaturday(date) && time.hour >= 13,
      closedAllDay: (_time: PlainTime, date: PlainDate) => isSaturday(date),
      saturday: plainDateTime(plainDate(2026, 9, 12), plainTime(10, 0)),
      reference: REFERENCE,
    },
    template: grid(
      2,
      scene(
        'O sábado fecha às 13:00',
        'A lista responde ao dia onde o leitor está, e não ao dia já escolhido. Ande com as setas pelo mês e a coluna recalcula-se debaixo do cursor. O disabledTime(date) do Ant só é chamado para uma data já confirmada, e não consegue dizer isto.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             aria-label="Sábado"
             [isTimeUnavailable]="closesEarly"
             [step]="3600"
             [defaultValue]="saturday"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ) +
        scene(
          'Um dia sem hora nenhuma',
          'Uma frase em vez de uma caixa vazia. O MUI não desenha nada aqui e o Ant desenha uma coluna vazia, e as duas coisas leem-se como um componente partido.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               unavailableOptions="hide"
               emptyLabel="Não há horário disponível neste dia."
               aria-label="Dia fechado"
               [isTimeUnavailable]="closedAllDay"
               [step]="3600"
               [defaultValue]="saturday"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const Unavailable: Story = {
  parameters: scenario('unavailable'),
  render: () => ({
    props: {
      isLunch: (time: PlainTime) => time.hour === 12,
      value: CONSULTATION,
      reference: REFERENCE,
    },
    template: grid(
      2,
      scene(
        'Desactivar: o predefinido',
        'A hora de almoço continua na lista, recusada e legível. Uma lista que apaga linhas em silêncio é uma lista cujo passo o leitor não consegue inferir.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             unavailableOptions="disable"
             aria-label="Almoço desactivado"
             [isTimeUnavailable]="isLunch"
             [step]="1800"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ) +
        scene(
          'Esconder: a escolha do consumidor',
          'Para uma agenda com dezenas de linhas recusadas, onde o ruído custa mais do que o passo. Um dia inteiro sem horas continua a receber a frase e não uma coluna vazia.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               unavailableOptions="hide"
               aria-label="Almoço escondido"
               [isTimeUnavailable]="isLunch"
               [step]="1800"
               [defaultValue]="value"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const Now: Story = {
  parameters: scenario('now'),
  render: () => ({
    props: { reference: REFERENCE },
    template: grid(
      1,
      scene(
        'Uma prensa, as duas metades',
        'Agora escreve a data e a hora de uma vez, e é o caso zero da própria expressão relativa do campo — desenhado como um controlo rotulado, para o leitor que nunca descobre que + abre uma. Carrega o relógio, que é a segunda das duas marcas da família.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             nowLabel="Agora"
             aria-label="Agora"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ),
    ),
  }),
};

export const Relative: Story = {
  parameters: scenario('relative'),
  render: () => ({
    props: { reference: REFERENCE },
    template: grid(
      1,
      scene(
        'Escrever com o painel aberto',
        'Alt+Seta para baixo abre o painel e deixa o foco no campo, portanto cada tecla que os segmentos tinham continua a funcionar — inclusive +, que abre a expressão de duração. Escape é encenado: abandona primeiro a expressão, e o painel fica.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             aria-label="Expressão"
             [relative]="true"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ),
    ),
  }),
};

export const Presets: Story = {
  parameters: scenario('presets'),
  render: () => ({
    props: { reference: REFERENCE },
    template: grid(
      1,
      scene(
        'Os atalhos do consumidor',
        'Ficam na banda de topo, ao lado de Agora, e quebram dentro da largura do painel em vez de a esticarem: a banda desenha-se à largura do painel e não contribui nada para ela. Esta família não traz uma lista própria — «amanhã às nove» é um relógio de negócio, e adivinhá-lo seria adivinhar uma indústria.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             aria-label="Com atalhos"
             [referenceDateTime]="reference"
           >
             <div slDateTimePickerPresets>
               <button type="button">Amanhã 09:00</button>
               <button type="button">Segunda 14:00</button>
             </div>
           </div>`,
        ),
      ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      2,
      scene(
        'Os três degraus do controlo',
        'Tipo, altura e recheio interno, e a caixa do gatilho segue cada um. Um picker dentro de um field toma o degrau do field.',
        `<div slDateTimePicker locale="pt-BR" size="sm" aria-label="Pequeno" [defaultValue]="value"></div>
         <div slDateTimePicker locale="pt-BR" size="md" aria-label="Padrão" [defaultValue]="value"></div>
         <div slDateTimePicker locale="pt-BR" size="lg" aria-label="Grande" [defaultValue]="value"></div>`,
      ) +
        scene(
          'O painel segue o degrau',
          'As linhas da lista e o tecto da coluna descem juntos, para que um painel denso não fique com onze linhas de altura de uma e o mesmo número de linhas visíveis.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               size="sm"
               defaultOpen
               aria-label="Painel pequeno"
               [defaultValue]="value"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => ({
    props: { value: CONSULTATION },
    template: grid(
      2,
      scene(
        'outline e subtle',
        'A moldura é a do campo, portanto um formulário com um nome e um datetime mostra a mesma moldura duas vezes. subtle troca a borda por uma superfície.',
        `<div slDateTimePicker locale="pt-BR" variant="outline" aria-label="Outline" [defaultValue]="value"></div>
         <div slDateTimePicker locale="pt-BR" variant="subtle" aria-label="Subtle" [defaultValue]="value"></div>`,
      ) +
        scene(
          'plain',
          'Nada até ser usado, que é o que uma tabela densa de marcações precisa. O foco e o hover continuam a desenhar-se, porque um controlo invisível que não responde não é um controlo.',
          `<div slDateTimePicker locale="pt-BR" variant="plain" size="sm" aria-label="Entrada" [defaultValue]="value"></div>
           <div slDateTimePicker locale="pt-BR" variant="plain" size="sm" aria-label="Saída" [defaultValue]="value"></div>`,
          'row',
        ),
    ),
  }),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      2,
      scene(
        'Por baixo, alinhado ao início',
        'O predefinido. A camada chega pelo eixo em que abre e nunca pelo eixo inline, e data-placement diz o que o posicionador resolveu.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             placement="bottom-start"
             aria-label="Em baixo"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ) +
        scene(
          'Uma preferência que o posicionador vira',
          'Aqui o controlo pede top-start e não tem espaço nenhum por cima dentro desta caixa, portanto a camada resolve-se por baixo e data-placement diz bottom-start. A preferência é um pedido e não uma garantia.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               placement="top-start"
               aria-label="Em cima"
               [defaultValue]="value"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      2,
      scene(
        'Só leitura e desactivado',
        'Só leitura continua focável e copiável e nunca se parece com desactivado; o gatilho fica, e não abre. Desactivado não responde a tecla nem a ponteiro, e o gatilho é um button desactivado.',
        `<div slDateTimePicker locale="pt-BR" readOnly aria-label="Só leitura" [defaultValue]="value"></div>
         <div slDateTimePicker locale="pt-BR" disabled aria-label="Desactivado" [defaultValue]="value"></div>`,
      ) +
        scene(
          'Obrigatório e inválido',
          'Obrigatório chega ao grupo do campo como aria-required. Inválido mantém o anel de foco e muda-lhe a cor — e continua inválido quando o valor cai fora de qualquer um dos dois pares de limites.',
          `<div slDateTimePicker locale="pt-BR" required aria-label="Obrigatório" [defaultValue]="value"></div>
           <div slDateTimePicker locale="pt-BR" invalid aria-label="Inválido" [defaultValue]="value"></div>`,
        ) +
        scene(
          'Escolhido, corrente e apontado',
          'Na lista, a linha escolhida ganha ao realce, o realce ganha ao ponteiro, e cada regra mais fraca é guardada por especificidade e não por ordem de escrita.',
          stage(
            `<div
               slDateTimePicker
               locale="pt-BR"
               defaultOpen
               openTo="time"
               aria-label="Estados da lista"
               [step]="1800"
               [defaultValue]="value"
               [referenceDateTime]="reference"
             ></div>`,
          ),
        ),
    ),
  }),
};

export const Forms: Story = {
  parameters: scenario('forms'),
  render: () => ({
    props: {
      form: new FormGroup({
        inicio: new FormControl<PlainDateTime | null>(CONSULTATION),
      }),
      reference: REFERENCE,
    },
    template: grid(
      1,
      scene(
        'Um formulário reativo',
        'O picker escreve o mesmo controlo que um datetime-field nu escreveria, portanto formControlName funciona no picker sem um segundo accessor — e o valor chega também a um post de formulário simples como YYYY-MM-DDTHH:mm:ss.',
        `<form [formGroup]="form">
           <div slField>
             <label slFieldLabel>Início da consulta</label>
             <div
               slDateTimePicker
               locale="pt-BR"
               formControlName="inicio"
               name="inicio"
               required
               [referenceDateTime]="reference"
             ></div>
             <span slFieldDescription>Valor do controlo: {{ form.value.inicio | json }}</span>
           </div>
         </form>`,
      ),
    ),
  }),
};

export const Narrow: Story = {
  parameters: scenario('narrow'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      2,
      scene(
        'O controlo debaixo de 320 pixels',
        'A linha de sete campos quebra entre as duas metades e nunca dentro de uma, e o gatilho fica onde estava: no fim do campo, do lado da leitura.',
        measure(
          `<div slDateTimePicker locale="pt-BR" aria-label="Estreito" [defaultValue]="value"></div>`,
        ),
      ) +
        scene(
          'O painel numa coluna',
          'As duas superfícies quebram na ordem do próprio valor, sem nada escondido e sem interruptor nenhum desenhado. A coluna das horas ocupa a linha inteira onde cai, para que se leia como uma secção e não como uma tira.',
          stage(
            measure(
              `<div
                 slDateTimePicker
                 locale="pt-BR"
                 defaultOpen
                 aria-label="Painel estreito"
                 [defaultValue]="value"
                 [referenceDateTime]="reference"
               ></div>`,
            ),
          ),
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      2,
      scene(
        'Uma linha desenhada pelo consumidor',
        'Um ng-template marcado com slDateTimePickerOption desenha o que está dentro da linha, pelo NgTemplateOutlet; a linha continua a ser da família — o papel, os estados, o teclado e o alvo de toque.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             openTo="time"
             aria-label="Linha própria"
             [step]="1800"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           >
             <ng-template slDateTimePickerOption let-time let-label="label" let-selected="selected">
               <span>{{ label }}</span>
               @if (selected) {
                 <span>·</span>
               }
             </ng-template>
           </div>`,
        ),
      ) +
        scene(
          'A instância que um template alcança, e um rodapé',
          'exportAs dá ao template o próprio componente: focus() põe o leitor no primeiro segmento do campo, e openSurface() e closeSurface() movem o painel sem uma prensa. O rodapé é do consumidor — a família não precisa de nenhum, porque a completude do valor fecha o painel.',
          `<div
             slDateTimePicker
             #inicio="slDateTimePicker"
             locale="pt-BR"
             closeOnSelect="never"
             aria-label="Com instância"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           >
             <div slDateTimePickerFooter>
               <button type="button">Confirmar</button>
             </div>
           </div>
           <button type="button" (click)="inicio.focus()">Focar</button>
           <button type="button" (click)="inicio.openSurface()">Abrir</button>
           <button type="button" (click)="inicio.closeSurface()">Fechar</button>`,
          'row',
          40,
        ),
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: { value: CONSULTATION, reference: REFERENCE },
    template: grid(
      1,
      scene(
        'Duas paragens de Tab, e não quarenta e três',
        'Só um elemento da grelha está na sequência de Tab, como o padrão de grelha exige, e a listbox é uma paragem pela mesma razão; com o painel aberto, Tab fica contido dentro da camada. Alt+Seta para baixo abre o painel a partir de um segmento e deixa o foco no campo; do gatilho, Seta para baixo abre-o e leva o foco à superfície que openTo nomeia. Dentro da lista: as setas, Home, End, a escrita por antecipação, e PageUp e PageDown através de uma fronteira de hora.',
        stage(
          `<div
             slDateTimePicker
             locale="pt-BR"
             defaultOpen
             aria-label="Teclado"
             [defaultValue]="value"
             [referenceDateTime]="reference"
           ></div>`,
        ),
      ),
    ),
  }),
};
