import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';

import { SlField } from './field';
import { provideFieldDefaults } from './field-defaults';
import type { FieldLabelPlacement, FieldRequiredMark, FieldSize } from './field-defaults';
import { SlFieldDescription, SlFieldError } from './field-messages';
import { SlFieldControl, SlFieldLabel } from './field-parts';
import { SlFieldCounter } from './field-counter';
import { ANGULAR_FIELD_DOCS, ANGULAR_FIELD_TOKENS } from './field.docs';

interface FieldStoryArgs {
  labelPlacement: FieldLabelPlacement;
  required: boolean;
  requiredMark: FieldRequiredMark;
  size: FieldSize;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_FIELD_DOCS.field.scenes, {
    playground: Playground,
    necessity: Necessity,
    placement: Placement,
    sizes: Sizes,
    states: States,
    messages: Messages,
    counter: Counter,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const DIRECTIVES = [
  SlField,
  SlFieldControl,
  SlFieldCounter,
  SlFieldDescription,
  SlFieldError,
  SlFieldLabel,
];

const meta: Meta<FieldStoryArgs> = {
  title: 'Components/Field',
  component: SlField,
  decorators: [moduleMetadata({ imports: DIRECTIVES })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Field',
        description:
          'One control, its name, its necessity, its help and its error — and the four identifiers that bind them, derived from one base so nothing has to be coordinated between siblings.',
        framework: 'Angular',
        ...ANGULAR_FIELD_DOCS.field,
        tokens: ANGULAR_FIELD_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<FieldStoryArgs>;

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

/** A narrow column, for showing what a field does below 320 pixels. */
const measure = (body: string) => `<div class="slotted-demo-measure">${body}</div>`;

export const Playground: Story = {
  args: {
    labelPlacement: 'top',
    required: true,
    requiredMark: 'mark',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `
      <div class="slotted-demo-stage" data-layout="block">
        <div
          slField
          [size]="size"
          [labelPlacement]="labelPlacement"
          [requiredMark]="requiredMark"
          [required]="required"
        >
          <label slFieldLabel>E-mail</label>
          <input slFieldControl type="email" placeholder="voce@empresa.com.br" />
          <span slFieldDescription>Usaremos este endereço para a cobrança.</span>
        </div>
      </div>`,
  }),
};

export const Necessity: Story = {
  parameters: scenario('necessity'),
  render: () => ({
    template: grid(
      2,
      scene(
        'The asterisk, and the field that carries none',
        'The mark is drawn by the label rather than written by the page, so it cannot be forgotten — and it is aria-hidden, because aria-required on the control already says it.',
        `<div slField required>
           <label slFieldLabel>CNPJ</label>
           <input slFieldControl value="12.345.678/0001-90" />
         </div>
         <div slField>
           <label slFieldLabel>Inscrição estadual</label>
           <input slFieldControl />
         </div>`,
      ) +
        scene(
          'The words, for a form where most fields are optional',
          'Marking the two required fields in a form of twenty optional ones leaves the other eighteen ambiguous. requiredMark="text" names both sides, and the two words come from the token.',
          `<div slField required requiredMark="text">
             <label slFieldLabel>CNPJ</label>
             <input slFieldControl value="12.345.678/0001-90" />
           </div>
           <div slField requiredMark="text">
             <label slFieldLabel>Inscrição estadual</label>
             <input slFieldControl />
           </div>`,
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
        'Beside the control, in a page-width form',
        'The label takes a track of its own and the control the rest. A label of twelve words wraps inside its track and stays level with the control’s first line rather than sliding under it.',
        `<div slField labelPlacement="side">
           <label slFieldLabel>Razão social</label>
           <input slFieldControl value="Sirius Group Tecnologia" />
         </div>
         <div slField labelPlacement="side">
           <label slFieldLabel>Endereço de correspondência da matriz</label>
           <input slFieldControl value="Avenida Paulista, 1000" />
         </div>`,
      ) +
        scene(
          'The same two fields, in a 320-pixel column',
          'Nothing changed but the width the field has. The container query is on the field itself, so a form in a drawer stacks while the same markup in a page grid does not.',
          measure(`<div slField labelPlacement="side">
             <label slFieldLabel>Razão social</label>
             <input slFieldControl value="Sirius Group Tecnologia" />
           </div>`) +
            measure(`<div slField labelPlacement="side">
             <label slFieldLabel>Endereço de correspondência da matriz</label>
             <input slFieldControl value="Avenida Paulista, 1000" />
           </div>`),
        ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Three steps, matching the control',
        'A field is not a control and has no height of its own; what steps is the type of the label, the message and the counter, so a field sits level with the control it wraps.',
        (['sm', 'md', 'lg'] as const)
          .map(
            (size) => `<div slField size="${size}">
               <label slFieldLabel>Apelido — ${size}</label>
               <input slFieldControl value="${size}" />
               <span slFieldDescription>Aparece nos relatórios.</span>
             </div>`,
          )
          .join(''),
      ) +
        scene(
          'Every step answers the density switch',
          'Set the toolbar to dense: all three steps read the control type scale, which is one of the three the theme restates per density, so a field in a dense table shrinks whole rather than in parts.',
          `<div slField size="lg">
             <label slFieldLabel>Descrição da unidade</label>
             <input slFieldControl value="Matriz — São Paulo" />
             <span slFieldDescription>Aparece no cabeçalho dos relatórios.</span>
           </div>
           <div slField size="sm">
             <label slFieldLabel>Centro de custo</label>
             <input slFieldControl value="CC-4021" />
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
        'Invalid, and what stays the colour it was',
        'Only the message turns. The label keeps its ink because the error already says the same thing in words and in colour, and a red marker on a red label is a marker nobody can see.',
        `<div slField invalid required>
           <label slFieldLabel>CNPJ</label>
           <input slFieldControl value="12.345.678" />
           <span slFieldDescription>Somente números, com filial e dígito.</span>
           <span slFieldError>Faltam seis dígitos.</span>
         </div>`,
      ) +
        scene(
          'Read-only, and disabled',
          'Read-only stays focusable and copyable and looks nothing like disabled, which is muted to a colour the theme measures rather than faded by opacity — a label nobody can read is a field nobody can identify.',
          `<div slField readOnly>
             <label slFieldLabel>Identificador da conta</label>
             <input slFieldControl value="acc_9f2b7c41" />
             <span slFieldDescription>Gerado na criação da conta e copiável.</span>
           </div>
           <div slField disabled required>
             <label slFieldLabel>Centro de custo</label>
             <input slFieldControl value="Escolha uma unidade primeiro" />
             <span slFieldDescription>Disponível depois que a unidade for escolhida.</span>
           </div>`,
        ),
    ),
  }),
};

export const Messages: Story = {
  parameters: scenario('messages'),
  render: () => ({
    props: { submitted: false },
    template: grid(
      2,
      scene(
        'Help, an error, and a warning that is neither',
        'All three are inline-message roots. The error carries a clipped “Error:” a screen reader reads before the sentence, and the warning is the same part in another tone rather than a member of its own.',
        `<div slField>
           <label slFieldLabel>Senha</label>
           <input slFieldControl type="password" value="paulista1000" />
           <span slFieldDescription>Entre 8 e 64 caracteres, com ao menos um número.</span>
           <span slFieldError tone="warning">A senha é válida, mas fácil de adivinhar.</span>
         </div>`,
      ) +
        scene(
          'The line held open before the error arrives',
          'Press the button twice and watch the button itself: reserve keeps one line box of the error’s own leading whether or not there is a message, so nothing below the field moves when the error appears.',
          `<div slField [invalid]="submitted">
             <label slFieldLabel>Telefone</label>
             <input slFieldControl value="(11) 90000-0000" />
             <span slFieldError reserve live="polite">{{ submitted ? 'Informe o nono dígito.' : '' }}</span>
           </div>
           <button type="button" (click)="submitted = !submitted">
             {{ submitted ? 'Limpar o erro' : 'Enviar' }}
           </button>`,
        ),
    ),
  }),
};

export const Counter: Story = {
  parameters: scenario('counter'),
  render: () => ({
    props: {
      value:
        'Integramos folha, ponto e benefícios em um só lugar, com fechamento contábil por competência.',
    },
    template: grid(
      2,
      scene(
        'Type past the limit and watch the row above',
        'The count sits in the label row’s spare column, so it never shares a row with the error and never adds one. It turns at its own limit, which a count reaches before the form has decided anything.',
        `<div slField [invalid]="value.length > 140">
           <label slFieldLabel>Descrição pública</label>
           <span slFieldCounter [invalid]="value.length > 140">{{ value.length }}/140</span>
           <textarea
             slFieldControl
             rows="3"
             [value]="value"
             (input)="value = $any($event.target).value"
           ></textarea>
           @if (value.length > 140) {
             <span slFieldError>Corte {{ value.length - 140 }} caracteres.</span>
           }
         </div>`,
      ) +
        scene(
          'The same counter beside a side label',
          'Label, control and count share the first row, each in a track of its own — the count stays at the end of the row rather than dropping under the control.',
          `<div slField labelPlacement="side">
             <label slFieldLabel>Assunto</label>
             <span slFieldCounter>12/60</span>
             <input slFieldControl value="Fatura março" />
           </div>`,
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
        'A label no language can break, and a digest for a description',
        'Both break rather than overflowing, and the whole string stays in the DOM and findable by a page search. The necessity word never breaks: it is the one part of a label that is always a word.',
        measure(`<div slField labelPlacement="side" required requiredMark="text">
             <label slFieldLabel lang="de">Kraftfahrzeug-Haftpflichtversicherungsnummer</label>
             <input slFieldControl />
             <span slFieldDescription>
               sha256:9f2b7c41a8d3e05f6c1b4a97e2d80f3c5b6a1d4e7f0938271a6b5c4d3e2f1a09
             </span>
           </div>`),
      ) +
        scene(
          'The same field, mirrored',
          'Every distance is logical, so the label, the marker and the counter change sides together. Switch the toolbar to rtl and the two fields here read the same way round.',
          `<div slField invalid lang="ar" dir="rtl">
             <label slFieldLabel>رقم التعريف الضريبي</label>
             <span slFieldCounter>3/14</span>
             <input slFieldControl value="٣٠٠" />
             <span slFieldError prefix="خطأ:">الرقم غير مكتمل.</span>
           </div>`,
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  decorators: [
    applicationConfig({
      providers: [
        provideFieldDefaults({
          necessityWords: { optional: '(opcional)', required: '(obrigatório)' },
          requiredMark: 'text',
          size: 'sm',
        }),
      ],
    }),
  ],
  render: () => ({
    template: grid(
      2,
      scene(
        'One decision for every field in the application',
        'provideFieldDefaults sets the step, the necessity style and both words once. A field that states its own still wins, which is the same rule the control follows against the field.',
        `<div slField required>
           <label slFieldLabel>CNPJ</label>
           <input slFieldControl value="12.345.678/0001-90" />
         </div>
         <div slField>
           <label slFieldLabel>Inscrição estadual</label>
           <input slFieldControl />
         </div>`,
      ) +
        scene(
          'The identifiers, handed back to the template',
          'exportAs gives the page the field instance, so an anchor elsewhere can point at the control the field named without the page inventing an identifier of its own.',
          `<div slField #money="slField" id="money">
             <label slFieldLabel>Valor da parcela</label>
             <span slFieldCounter>1 de 12</span>
             <input slFieldControl inputmode="decimal" value="R$ 1.250,00" />
             <span slFieldDescription>Debitado no dia 5 de cada mês.</span>
           </div>
           <a [href]="'#' + money.ids().control">Ir para o valor da parcela</a>`,
        ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Tab into the control and listen',
        'A screen reader reads the label, then “required”, then the help, then the error — one name, one description built from two elements in a fixed order, and no asterisk read aloud.',
        `<div slField id="cnpj" invalid required>
           <label slFieldLabel>CNPJ</label>
           <input slFieldControl value="12.345.678" />
           <span slFieldDescription>Somente números, com filial e dígito.</span>
           <span slFieldError live="polite">Faltam seis dígitos.</span>
         </div>`,
      ) +
        scene(
          'Click the label, not the control',
          'The association is explicit — for pointing at the derived identifier — so the click moves focus into the control. The implicit form, wrapping the control in the label, is the one the APG records as unreliable.',
          `<div slField id="account">
             <label slFieldLabel>Identificador da conta</label>
             <input slFieldControl value="acc_9f2b7c41" />
             <span slFieldDescription>
               Clique no rótulo acima: o foco entra no campo, sem nenhum JavaScript.
             </span>
           </div>`,
        ),
    ),
  }),
};
