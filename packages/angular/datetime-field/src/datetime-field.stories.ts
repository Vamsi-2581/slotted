import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SlField, SlFieldDescription, SlFieldError, SlFieldLabel } from '@slotted/angular/field';
import { plainDate, plainDateTime, plainTime } from '@slotted/core/date';
import type { PlainDate, PlainDateTime, PlainTime } from '@slotted/core/date';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlDateTimeField } from './datetime-field';
import type {
  DateTimeFieldHourCycle,
  DateTimeFieldSize,
  DateTimeFieldVariant,
} from './datetime-field-defaults';
import { SlDateTimeFieldEnd, SlDateTimeFieldStart } from './datetime-field-parts';
import {
  ANGULAR_DATE_TIME_FIELD_DOCS,
  ANGULAR_DATE_TIME_FIELD_TOKENS,
} from './datetime-field.docs';

interface DateTimeFieldStoryArgs {
  clearable: boolean;
  granularity: 'hour' | 'minute' | 'second';
  hourCycle: DateTimeFieldHourCycle | undefined;
  locale: string;
  relative: boolean;
  size: DateTimeFieldSize;
  variant: DateTimeFieldVariant;
}

/** A consultation on a Thursday afternoon, and the clinic it belongs to. */
const CONSULTATION: PlainDateTime = plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20));
const WITH_SECONDS: PlainDateTime = plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20, 45));
const MIDNIGHT_HALF: PlainDateTime = plainDateTime(plainDate(2026, 9, 10), plainTime(0, 30));
/** Stated rather than read from the clock, so every scene reads the same twice. */
const REFERENCE: PlainDateTime = plainDateTime(plainDate(2026, 9, 10), plainTime(14, 40));
const LAST_NIGHT_OF_THE_MONTH: PlainDateTime = plainDateTime(
  plainDate(2026, 9, 30),
  plainTime(23, 0),
);
const END_OF_JANUARY: PlainDateTime = plainDateTime(plainDate(2026, 1, 31), plainTime(15, 20));

const CLINIC = {
  max: plainDateTime(plainDate(2026, 12, 20), plainTime(12, 0)),
  maxTime: plainTime(18, 0),
  min: plainDateTime(plainDate(2026, 9, 11), plainTime(14, 0)),
  minTime: plainTime(9, 0),
};

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_DATE_TIME_FIELD_DOCS.dateTimeField.scenes, {
    playground: Playground,
    locale: Locale,
    'hour-cycle': HourCycle,
    granularity: Granularity,
    incomplete: Incomplete,
    relative: Relative,
    'rolls-day': RollsDay,
    sizes: Sizes,
    variants: Variants,
    range: Range,
    unavailable: Unavailable,
    narrow: Narrow,
    states: States,
    clear: Clear,
    adornments: Adornments,
    forms: Forms,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const DIRECTIVES = [
  ReactiveFormsModule,
  SlDateTimeField,
  SlDateTimeFieldEnd,
  SlDateTimeFieldStart,
  SlField,
  SlFieldDescription,
  SlFieldError,
  SlFieldLabel,
];

const meta: Meta<DateTimeFieldStoryArgs> = {
  title: 'Components/DateTimeField',
  component: SlDateTimeField,
  decorators: [moduleMetadata({ imports: DIRECTIVES })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'DateTime Field',
        description:
          'A date and a time typed as one value, one field at a time, in the order the reader’s own locale writes both halves — and, when the reader would rather say "two days from now", a duration resolved in view before it is accepted. It is not a date field beside a time field: one group, one value, and one run of typing that crosses from the year into the hour. The control belongs in a reactive form, and reports the half that is still missing as validity of its own.',
        framework: 'Angular',
        ...ANGULAR_DATE_TIME_FIELD_DOCS.dateTimeField,
        tokens: ANGULAR_DATE_TIME_FIELD_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<DateTimeFieldStoryArgs>;

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
  /**
   * How small this scene's subject may legitimately be, in pixels.
   * `tools/harness/audit.mjs` reports anything under 96 pixels in a wide stage
   * as collapsed, which is right for a demonstration and wrong for a row of
   * small buttons.
   */
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

export const Playground: Story = {
  args: {
    clearable: true,
    granularity: 'minute',
    hourCycle: undefined,
    locale: 'pt-BR',
    relative: true,
    size: 'md',
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
            slDateTimeField
            name="inicio"
            [locale]="locale"
            [size]="size"
            [variant]="variant"
            [granularity]="granularity"
            [hourCycle]="hourCycle"
            [clearable]="clearable"
            [relative]="relative"
            [referenceDateTime]="reference"
          ></div>
          <span slFieldDescription>A consulta começa nesta data e hora.</span>
        </div>
      </div>`,
  }),
};

export const Locale: Story = {
  parameters: scenario('locale'),
  render: () => ({
    props: { value: CONSULTATION },
    template: grid(
      2,
      scene(
        'pt-BR',
        'Dia, mês, ano e depois a hora, com uma vírgula entre as duas metades — tudo vindo de um só Intl.DateTimeFormat.',
        `<div slDateTimeField locale="pt-BR" aria-label="Início" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" aria-label="Início vazio"></div>`,
      ) +
        scene(
          'en-US',
          'The month leads, and a sixth field appears: the day period, whose spoken value is AM or PM because 0 and 1 are not names.',
          `<div slDateTimeField locale="en-US" aria-label="Starts" [defaultValue]="value"></div>
           <div slDateTimeField locale="en-US" aria-label="Empty"></div>`,
        ) +
        scene(
          'ja-JP',
          'O ano vem primeiro e a fronteira entre as metades é só um espaço — por isso nada é desenhado ali e o intervalo da própria linha faz a separação.',
          `<div slDateTimeField locale="ja-JP" aria-label="開始" [defaultValue]="value"></div>
           <div slDateTimeField locale="ja-JP" aria-label="空"></div>`,
        ) +
        scene(
          'fr-FR',
          'Mesma ordem do pt-BR e fronteira diferente: um espaço em vez da vírgula. Duas famílias separadas nunca saberiam qual das duas o locale escreve.',
          `<div slDateTimeField locale="fr-FR" aria-label="Début" [defaultValue]="value"></div>
           <div slDateTimeField locale="fr-FR" aria-label="Vide"></div>`,
        ),
    ),
  }),
};

export const HourCycle: Story = {
  parameters: scenario('hour-cycle'),
  render: () => ({
    props: { value: MIDNIGHT_HALF },
    template: grid(
      2,
      scene(
        'Doze, em en-US',
        'h12: a hora corre de 1 a 12 e a meia-noite escreve-se 12 AM.',
        `<div slDateTimeField locale="en-US" aria-label="Twelve" [hourCycle]="12" [defaultValue]="value"></div>`,
      ) +
        scene(
          'Doze, em ja-JP',
          'h11: o mesmo eixo, e a hora corre de 0 a 11. Um booleano teria escrito 12 aqui.',
          `<div slDateTimeField locale="ja-JP" aria-label="Eleven" [hourCycle]="12" [defaultValue]="value"></div>`,
        ) +
        scene(
          'Vinte e quatro',
          'h23: nenhum período do dia, e a hora corre de 0 a 23.',
          `<div slDateTimeField locale="en-US" aria-label="Twenty-four" [hourCycle]="24" [defaultValue]="value"></div>`,
        ) +
        scene(
          'O que o locale quer',
          'Sem eixo declarado, cada controlo pergunta ao Intl e recebe o que o próprio locale do leitor escreve.',
          `<div slDateTimeField locale="pt-BR" aria-label="Locale" [defaultValue]="value"></div>
           <div slDateTimeField locale="en-US" aria-label="Locale en" [defaultValue]="value"></div>`,
        ),
    ),
  }),
};

export const Granularity: Story = {
  parameters: scenario('granularity'),
  render: () => ({
    props: { value: CONSULTATION, withSeconds: WITH_SECONDS },
    template: grid(
      1,
      scene(
        'Três profundidades, e uma metade que nunca encolhe',
        'A granularidade governa a metade da hora. A metade da data é sempre inteira: um datetime sem dia é uma data, e essa família é o date-field.',
        `<div slDateTimeField locale="pt-BR" granularity="hour" aria-label="Hora" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" granularity="minute" aria-label="Minuto" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" granularity="second" aria-label="Segundo" [defaultValue]="withSeconds"></div>`,
      ),
    ),
  }),
};

export const Incomplete: Story = {
  parameters: scenario('incomplete'),
  render: () => ({
    props: {
      form: new FormGroup({
        inicio: new FormControl<PlainDateTime | null>(null),
      }),
      reference: REFERENCE,
    },
    template: grid(
      2,
      scene(
        'Metade escrita, e a que falta dita em voz alta',
        'Escreva só a data e saia do controlo com Tab. O valor é null, como em toda a implementação pesquisada — e qual das metades falta é o que nenhuma delas consegue dizer.',
        `<div slDateTimeField locale="pt-BR" aria-label="Por acabar" [referenceDateTime]="reference"></div>`,
      ) +
        scene(
          'O erro que um formulário reativo lê',
          'slottedDateTimeIncomplete chega com a metade em falta dentro dele, e o dateTimeIncomplete do Kendo — a única implementação pesquisada que valida — não a carrega.',
          `<form [formGroup]="form">
             <div slField [invalid]="form.controls.inicio.touched && form.controls.inicio.invalid">
               <label slFieldLabel>Início</label>
               <div slDateTimeField locale="pt-BR" formControlName="inicio"></div>
               <span slFieldDescription>Erros: {{ form.controls.inicio.errors | json }}</span>
             </div>
           </form>`,
        ),
    ),
  }),
};

export const Relative: Story = {
  parameters: scenario('relative'),
  render: () => ({
    props: { reference: REFERENCE },
    template: grid(
      2,
      scene(
        'Carregue em + e escreva uma duração',
        '+40m, 1h30, +2d, +1w, -15, 0. A âncora é sempre agora e nunca o valor que o campo segura, e o que a expressão resolve é desenhado ao lado antes de Enter aceitar seja o que for.',
        `<div slDateTimeField locale="pt-BR" aria-label="Duração" [referenceDateTime]="reference"></div>`,
      ) +
        scene(
          'Tudo o que ela escreve é alcançável sem ela',
          'A expressão é um atalho e nunca a única entrada: o mesmo valor escreve-se a dígitos, passo a passo ou por página.',
          `<div slDateTimeField locale="pt-BR" aria-label="Sem duração" [relative]="false" [referenceDateTime]="reference"></div>`,
        ),
    ),
  }),
};

export const RollsDay: Story = {
  parameters: scenario('rolls-day'),
  render: () => ({
    props: { lastNight: LAST_NIGHT_OF_THE_MONTH },
    template: grid(
      1,
      scene(
        '+2h às 23:00 do último dia do mês',
        'É aqui que a bandeira crossesMidnight do time-field se gasta. Ali, uma PlainTime não tem dia ao lado e só pode levantar um aviso; aqui o dia existe, portanto a duração move-o e a pré-visualização escreve a data nova e levanta-a da hora ao lado.',
        `<div slDateTimeField locale="pt-BR" aria-label="Vira o dia" [referenceDateTime]="lastNight"></div>`,
      ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    props: { value: CONSULTATION },
    template: grid(
      2,
      scene(
        'Por si',
        'Três degraus de tipo, altura e recheio interno, todos das escalas de controlo que o tema redeclara por densidade.',
        `<div slDateTimeField locale="pt-BR" size="sm" aria-label="Pequeno" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" size="md" aria-label="Padrão" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" size="lg" aria-label="Grande" [defaultValue]="value"></div>`,
      ) +
        scene(
          'Dentro de um field',
          'O controlo toma o degrau do field em vez do seu próprio predefinido, portanto uma linha de formulário não fica com dois tamanhos.',
          `<div slField size="sm">
             <label slFieldLabel>Início</label>
             <div slDateTimeField locale="pt-BR" [defaultValue]="value"></div>
           </div>
           <div slField size="lg">
             <label slFieldLabel>Fim</label>
             <div slDateTimeField locale="pt-BR" [defaultValue]="value"></div>
           </div>`,
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
        'Na página',
        'outline toma o chão onde está, subtle afunda-se nele, e plain não mostra nada em repouso.',
        `<div slDateTimeField locale="pt-BR" variant="outline" aria-label="Outline" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" variant="subtle" aria-label="Subtle" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" variant="plain" aria-label="Plain" [defaultValue]="value"></div>`,
      ) +
        scene(
          'Numa linha densa',
          'plain é o que uma tabela de marcações quer: nada até o ponteiro ou o teclado chegarem.',
          `<div slDateTimeField locale="pt-BR" variant="plain" size="sm" aria-label="Entrada" [defaultValue]="value"></div>
           <div slDateTimeField locale="pt-BR" variant="plain" size="sm" aria-label="Saída" [defaultValue]="value"></div>`,
          'row',
        ),
    ),
  }),
};

export const Range: Story = {
  parameters: scenario('range'),
  render: () => ({
    props: {
      ...CLINIC,
      inside: plainDateTime(plainDate(2026, 9, 15), plainTime(10, 0)),
      outsideWindow: plainDateTime(plainDate(2026, 9, 15), plainTime(20, 0)),
      beforeStart: CONSULTATION,
      firstDay: plainDateTime(plainDate(2026, 9, 11), plainTime(10, 0)),
    },
    template: grid(
      2,
      scene(
        'Dentro das duas cercas',
        '15 de setembro às 10:00 está depois de min e dentro da janela que se repete todos os dias. Os dois pares valem ao mesmo tempo.',
        `<div
           slDateTimeField
           locale="pt-BR"
           aria-label="Dentro"
           [min]="min"
           [max]="max"
           [minTime]="minTime"
           [maxTime]="maxTime"
           [defaultValue]="inside"
         ></div>`,
      ) +
        scene(
          'Fora da janela do dia',
          '20:00 num dia dentro do intervalo é recusado por maxTime e reportado como slottedDateTimeWindow, mesmo estando muito antes de max.',
          `<div
             slDateTimeField
             locale="pt-BR"
             aria-label="Fora da janela"
             [min]="min"
             [max]="max"
             [minTime]="minTime"
             [maxTime]="maxTime"
             [defaultValue]="outsideWindow"
           ></div>`,
        ) +
        scene(
          'Antes do início do intervalo',
          '10 de setembro está dentro da janela diária e antes de min — recusado pelo par do valor inteiro, e reportado como slottedDateTimeRange.',
          `<div
             slDateTimeField
             locale="pt-BR"
             aria-label="Antes"
             [min]="min"
             [max]="max"
             [minTime]="minTime"
             [maxTime]="maxTime"
             [defaultValue]="beforeStart"
           ></div>`,
        ) +
        scene(
          'O primeiro dia é parcial',
          'No próprio dia de min a janela começa em min e não em minTime — a regra que o MDN enuncia para a plataforma e que nenhum script pesquisado implementa.',
          `<div
             slDateTimeField
             locale="pt-BR"
             aria-label="Primeiro dia"
             [min]="min"
             [max]="max"
             [minTime]="minTime"
             [maxTime]="maxTime"
             [defaultValue]="firstDay"
           ></div>`,
        ),
    ),
  }),
};

export const Unavailable: Story = {
  parameters: scenario('unavailable'),
  render: () => ({
    props: {
      isSunday: (date: PlainDate) =>
        new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() === 0,
      isLunch: (time: PlainTime) => time.hour === 12,
      sunday: plainDateTime(plainDate(2026, 9, 13), plainTime(10, 0)),
      lunch: plainDateTime(plainDate(2026, 9, 15), plainTime(12, 30)),
    },
    template: grid(
      2,
      scene(
        'Um domingo fechado',
        'isDateUnavailable responde por um dia inteiro. É a pergunta que uma célula de calendário faz, e não se deriva de um predicado de datetime sem percorrer cada passo daquele dia.',
        `<div
           slDateTimeField
           locale="pt-BR"
           aria-label="Domingo"
           [isDateUnavailable]="isSunday"
           [defaultValue]="sunday"
         ></div>`,
      ) +
        scene(
          'Uma hora de almoço',
          'isTimeUnavailable recebe também o dia, para que um sábado feche mais cedo do que uma terça. Ambos reportam slottedDateTimeUnavailable.',
          `<div
             slDateTimeField
             locale="pt-BR"
             aria-label="Almoço"
             [isTimeUnavailable]="isLunch"
             [defaultValue]="lunch"
           ></div>`,
        ),
    ),
  }),
};

export const Narrow: Story = {
  parameters: scenario('narrow'),
  render: () => ({
    props: { withSeconds: WITH_SECONDS, value: CONSULTATION },
    template: grid(
      2,
      scene(
        'A linha quebra entre as metades',
        'Sete campos não cabem numa coluna estreita em locale nenhum, e a linha quebra entre as duas caixas e nunca dentro de uma. Sem container query: a quebra vale em qualquer largura.',
        measure(
          `<div slDateTimeField locale="pt-BR" granularity="second" aria-label="Estreito" [defaultValue]="withSeconds"></div>`,
        ),
      ) +
        scene(
          'A vírgula fica no fim da linha',
          'A fronteira que o locale escreve é desenhada no fim da primeira metade, e não entre as duas — por isso uma quebra deixa-a onde uma vírgula numa frase ficaria.',
          measure(
            `<div slDateTimeField locale="en-US" aria-label="Narrow" [defaultValue]="value"></div>`,
          ),
        ),
    ),
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    props: {
      value: CONSULTATION,
      endOfJanuary: END_OF_JANUARY,
      reference: REFERENCE,
      outside: plainDateTime(plainDate(2026, 9, 15), plainTime(20, 0)),
      ...CLINIC,
    },
    template: grid(
      2,
      scene(
        'Só leitura e desactivado',
        'Só leitura continua focável e copiável e nunca se parece com desactivado. Desactivado não responde a tecla nem a ponteiro — e num formulário reativo chega por setDisabledState e não por esta entrada.',
        `<div slDateTimeField locale="pt-BR" readOnly aria-label="Só leitura" [defaultValue]="value"></div>
         <div slDateTimeField locale="pt-BR" disabled aria-label="Desactivado" [defaultValue]="value"></div>`,
      ) +
        scene(
          'Inválido e obrigatório, dentro de um field',
          'A mensagem é do field e o estado é do controlo. A cor sozinha nunca diz inválido.',
          `<div slField invalid>
             <label slFieldLabel>Início da consulta</label>
             <div
               slDateTimeField
               locale="pt-BR"
               [min]="min"
               [max]="max"
               [minTime]="minTime"
               [maxTime]="maxTime"
               [defaultValue]="outside"
             ></div>
             <span slFieldError>Escolha um horário dentro do expediente.</span>
           </div>
           <div slField required>
             <label slFieldLabel>Fim da consulta</label>
             <div slDateTimeField locale="pt-BR"></div>
           </div>`,
        ) +
        scene(
          'Incompleto é mais baixo do que inválido',
          'Um tom de aviso, um degrau abaixo do perigo que o valor recusado recebe — porque nada do que o leitor escreveu está errado, apenas por acabar. E cede a inválido quando os dois são verdade.',
          `<div slDateTimeField locale="pt-BR" aria-label="Incompleto" [referenceDateTime]="reference"></div>`,
        ) +
        scene(
          'O dia que um mês curto não segurou',
          '31 de janeiro a passar para fevereiro é 28, e a passar outra vez é 31 de março — o dia pedido sobrevive ao mês que não o comportou.',
          `<div slDateTimeField locale="pt-BR" aria-label="Janeiro" [defaultValue]="endOfJanuary"></div>`,
        ),
    ),
  }),
};

export const Clear: Story = {
  parameters: scenario('clear'),
  render: () => ({
    props: { value: CONSULTATION },
    template: grid(
      2,
      scene(
        'Um botão, as duas metades',
        'Não há controlo que limpe um lado só: meia metade não é um valor que esta família segure. O foco volta ao primeiro segmento.',
        `<div
           slDateTimeField
           locale="pt-BR"
           clearable
           [messages]="{ clear: 'Limpar' }"
           aria-label="Com valor"
           [defaultValue]="value"
         ></div>`,
      ) +
        scene(
          'Só quando há o que limpar',
          'O botão só aparece com algo escrito e com o controlo editável, para que a moldura não guarde um espaço que nunca é usado.',
          `<div slDateTimeField locale="pt-BR" clearable aria-label="Vazio"></div>
           <div
             slDateTimeField
             locale="pt-BR"
             clearable
             readOnly
             aria-label="Só leitura"
             [defaultValue]="value"
           ></div>`,
        ),
    ),
  }),
};

export const Adornments: Story = {
  parameters: scenario('adornments'),
  render: () => ({
    props: { value: CONSULTATION },
    template: grid(
      2,
      scene(
        'Uma marca antes do valor',
        'Uma directiva no elemento do próprio consumidor, portanto nada perde a semântica e qualquer ícone lá dentro é dimensionado pela escala de glifos do controlo.',
        `<div slDateTimeField locale="pt-BR" aria-label="Com marca" [defaultValue]="value">
           <span slDateTimeFieldStart>em</span>
         </div>`,
      ) +
        scene(
          'Um fuso depois dele',
          'O valor é uma hora de parede e não carrega fuso nenhum; uma aplicação que o conhece escreve o rótulo aqui. É também o slot onde o datetime-picker põe o seu gatilho.',
          `<div slDateTimeField locale="pt-BR" aria-label="Com fuso" [defaultValue]="value">
             <span slDateTimeFieldEnd>BRT</span>
           </div>`,
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
    },
    template: grid(
      1,
      scene(
        'Um formulário reativo',
        'ControlValueAccessor lê e escreve o controlo, e Validator reporta slottedDateTimeIncomplete, slottedDateTimeRange, slottedDateTimeWindow e slottedDateTimeUnavailable — validade que nada fora deste controlo consegue ver. É o ponto de integração que o React não tem equivalente.',
        `<form [formGroup]="form">
           <div slField>
             <label slFieldLabel>Início da consulta</label>
             <div slDateTimeField locale="pt-BR" formControlName="inicio" name="inicio" required></div>
             <span slFieldDescription>Valor do controlo: {{ form.value.inicio | json }}</span>
           </div>
         </form>`,
      ),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    props: { value: CONSULTATION, withSeconds: WITH_SECONDS },
    template: grid(
      2,
      scene(
        'Um período do dia longo',
        'es-MX escreve a. m. e p. m., e a caixa é dimensionada pelo mais largo dos dois nomes que o locale usa — não por dois caracteres, que cortariam o primeiro.',
        `<div slDateTimeField locale="es-MX" aria-label="Español" [hourCycle]="12" [defaultValue]="value"></div>`,
      ) +
        scene(
          'Direita para a esquerda',
          'Cada metade é o seu próprio trecho bidireccional, por isso os dígitos leem-se da esquerda para a direita dentro de uma página espelhada. A alternativa foi uma captura que lia 30:14 — uma hora que ninguém escreveu.',
          `<div slDateTimeField locale="ar-EG" aria-label="العربية" [defaultValue]="value"></div>`,
        ) +
        scene(
          'Sete campos e um sistema de numeração próprio',
          'Os dígitos que o locale escreve são lidos de volta pelo mesmo analisador que os escreveu, em qualquer granularidade.',
          `<div
             slDateTimeField
             locale="ja-JP"
             granularity="second"
             aria-label="日本語"
             [defaultValue]="withSeconds"
           ></div>`,
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { value: CONSULTATION },
    template: grid(
      1,
      scene(
        'A instância que um template alcança',
        'exportAs dá ao template o próprio componente: focus() põe o leitor no primeiro segmento, focusEntry() no primeiro campo ainda por preencher, e clear() esvazia as duas metades com a razão clear. provideDateTimeFieldDefaults declara o relógio uma vez para tudo o que está por baixo, e provideSlotted a língua.',
        `<div
           slDateTimeField
           #inicio="slDateTimeField"
           locale="pt-BR"
           aria-label="Com instância"
           [defaultValue]="value"
         ></div>
         <button type="button" (click)="inicio.focus()">Focar</button>
         <button type="button" (click)="inicio.focusEntry()">Primeiro vazio</button>
         <button type="button" (click)="inicio.clear()">Limpar</button>`,
        'row',
        40,
      ),
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: { value: WITH_SECONDS, reference: REFERENCE },
    template: grid(
      1,
      scene(
        'Ponha o foco nele e experimente',
        'As setas atravessam a fronteira entre as metades numa linha só — do ano para a hora e de volta; PageUp move o ano 10, o mês 5, o dia 5, a hora 3, o minuto 15 e o segundo 15; Home e End levam um campo ao seu próprio limite; Backspace esvazia um; e +, - ou = abrem uma duração. Cada tecla em que o campo age é parada, para que um atalho de página nunca dispare enquanto um leitor escreve.',
        `<div
           slDateTimeField
           locale="pt-BR"
           granularity="second"
           clearable
           aria-label="Teclado"
           [referenceDateTime]="reference"
           [defaultValue]="value"
         ></div>`,
      ),
    ),
  }),
};
