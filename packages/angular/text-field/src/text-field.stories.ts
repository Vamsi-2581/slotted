import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  SlField,
  SlFieldCounter,
  SlFieldDescription,
  SlFieldError,
  SlFieldLabel,
} from '@slotted/angular/field';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlTextField } from './text-field';
import type { TextFieldSize, TextFieldVariant } from './text-field-defaults';
import { SlTextFieldInput } from './text-field-input';
import { SlTextFieldEnd, SlTextFieldStart } from './text-field-parts';
import { ANGULAR_TEXT_FIELD_DOCS, ANGULAR_TEXT_FIELD_TOKENS } from './text-field.docs';

interface TextFieldStoryArgs {
  clearable: boolean;
  mono: boolean;
  revealable: boolean;
  size: TextFieldSize;
  variant: TextFieldVariant;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_TEXT_FIELD_DOCS.textField.scenes, {
    playground: Playground,
    sizes: Sizes,
    variants: Variants,
    adornments: Adornments,
    actions: Actions,
    states: States,
    count: Count,
    types: Types,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const DIRECTIVES = [
  ReactiveFormsModule,
  SlField,
  SlFieldCounter,
  SlFieldDescription,
  SlFieldError,
  SlFieldLabel,
  SlTextField,
  SlTextFieldEnd,
  SlTextFieldInput,
  SlTextFieldStart,
];

const meta: Meta<TextFieldStoryArgs> = {
  title: 'Components/TextField',
  component: SlTextField,
  decorators: [moduleMetadata({ imports: DIRECTIVES })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Text Field',
        description:
          'One line of text and everything that sits inside its border — an adornment, a clear button, a password toggle — around an input that keeps the value, the identifier and every native attribute.',
        framework: 'Angular',
        ...ANGULAR_TEXT_FIELD_DOCS.textField,
        tokens: ANGULAR_TEXT_FIELD_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<TextFieldStoryArgs>;

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

/** A narrow column, for showing what a control does below 320 pixels. */
const measure = (body: string) => `<div class="slotted-demo-measure">${body}</div>`;

export const Playground: Story = {
  args: {
    clearable: true,
    mono: false,
    revealable: false,
    size: 'md',
    variant: 'outline',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `
      <div class="slotted-demo-stage" data-layout="block">
        <div slField>
          <label slFieldLabel>E-mail</label>
          <div
            slTextField
            [size]="size"
            [variant]="variant"
            [mono]="mono"
            [clearable]="clearable"
            [revealable]="revealable"
          >
            <input slTextFieldInput type="email" placeholder="voce@empresa.com.br" />
          </div>
          <span slFieldDescription>Usaremos este endereço para a cobrança.</span>
        </div>
      </div>`,
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: grid(
      2,
      scene(
        'The three steps on their own',
        'Height, inline padding, type and glyph all come from the control scales, so switching the toolbar to dense shrinks each step whole rather than in parts.',
        `<div slTextField size="sm"><input slTextFieldInput defaultValue="Compacto" /></div>
         <div slTextField size="md"><input slTextFieldInput defaultValue="Padrão" /></div>
         <div slTextField size="lg"><input slTextFieldInput defaultValue="Confortável" /></div>`,
      ) +
        scene(
          'Inside a field, the field decides',
          'A small field holding a medium control is a field and a control disagreeing about one row, so the control reads the field’s step before the application token’s.',
          `<div slField size="sm">
             <label slFieldLabel>Código</label>
             <div slTextField><input slTextFieldInput defaultValue="SR-4412" /></div>
           </div>
           <div slField size="lg">
             <label slFieldLabel>Razão social</label>
             <div slTextField><input slTextFieldInput defaultValue="Sirius Group" /></div>
           </div>`,
        ),
    ),
  }),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A frame that takes the ground it is placed on',
        'outline paints no ground of its own, so the same control looks right on a page, inside a card and inside a sunken panel without a second token.',
        `<div slTextField><input slTextFieldInput defaultValue="outline" /></div>
         <div slTextField variant="subtle"><input slTextFieldInput defaultValue="subtle" /></div>`,
      ) +
        scene(
          'A cell that is only a control while it is used',
          'plain shows no border at rest and keeps exactly the same box, so a table row does not reflow when the pointer crosses it. Hover one and the edge arrives.',
          `<div slTextField variant="plain" mono>
             <input slTextFieldInput defaultValue="20260442" />
           </div>
           <div slTextField variant="plain">
             <input slTextFieldInput defaultValue="Reembolso da nota" />
           </div>`,
        ),
    ),
  }),
};

export const Adornments: Story = {
  parameters: scenario('adornments'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A mark before the value and a unit after it',
        'Neither is ever squeezed: the value gives up width first, because the value is the part that can scroll. Switch the toolbar to rtl and R$ stays R$.',
        `<div slTextField>
           <span slTextFieldStart>R$</span>
           <input slTextFieldInput inputmode="decimal" defaultValue="1.480,00" />
           <span slTextFieldEnd>BRL</span>
         </div>
         <div slTextField>
           <span slTextFieldStart>&#64;</span>
           <input slTextFieldInput defaultValue="ada.lovelace" />
         </div>`,
      ) +
        scene(
          'An adornment on the consumer’s own element',
          'Every part but the two buttons is a directive, so a span, an icon or a kbd all work and none of them loses its own semantics or its own attributes.',
          `<div slTextField size="sm">
             <span slTextFieldStart>%</span>
             <input slTextFieldInput defaultValue="12,5" inputmode="decimal" />
           </div>
           <div slTextField>
             <input slTextFieldInput type="search" placeholder="Buscar pedidos" />
             <span slTextFieldEnd>⌘K</span>
           </div>`,
        ),
    ),
  }),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Clear, and where focus lands after it',
        'The button is drawn only once there is something to clear. Press it: the value goes, the request says reason “clear”, and focus returns to the control rather than staying on a button that has just vanished.',
        `<div slTextField clearable>
           <input slTextFieldInput type="search" defaultValue="nota fiscal 2026" />
         </div>
         <div slTextField clearable>
           <input slTextFieldInput placeholder="Nada para limpar ainda" />
         </div>`,
      ) +
        scene(
          'Reveal, and the caret it does not move',
          'Put the caret in the middle of the password and press the toggle: the type swaps and the caret stays. aria-pressed carries the state, so the label never changes with it.',
          `<div slTextField revealable>
             <input
               slTextFieldInput
               type="password"
               autocomplete="current-password"
               defaultValue="senha-secreta"
             />
           </div>
           <div slTextField clearable revealable>
             <input slTextFieldInput type="password" defaultValue="outra-senha" />
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
        'Invalid, and what says so besides the border',
        'The border is the quietest part of it: aria-invalid announces the state and the field’s error says it in words, because in the high-contrast scheme the border cannot carry it at all.',
        `<div slField invalid>
           <label slFieldLabel>CNPJ</label>
           <div slTextField><input slTextFieldInput defaultValue="12.345.678/0001" /></div>
           <span slFieldError>Faltam seis dígitos.</span>
         </div>`,
      ) +
        scene(
          'Read-only is not disabled',
          'Read-only keeps full-strength ink, stays focusable and copyable and is still submitted; disabled is muted to a measured colour rather than faded, so a disabled form still says what it holds.',
          `<div slTextField>
             <input slTextFieldInput readonly defaultValue="Somente leitura" />
           </div>
           <div slTextField>
             <input slTextFieldInput disabled defaultValue="Desativado" />
           </div>
           <div slTextField>
             <span slTextFieldStart>R$</span>
             <input slTextFieldInput disabled defaultValue="1.480,00" />
           </div>`,
        ),
    ),
  }),
};

export const Count: Story = {
  parameters: scenario('count'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A limit the browser enforces',
        'The control counts and the field draws it in the spare column of its label row, so a count that appears on the first keystroke never pushes the message below it.',
        `<div slField>
           <label slFieldLabel>Assunto</label>
           <div slTextField>
             <input
               slTextFieldInput
               showCount
               maxlength="60"
               defaultValue="Reembolso da nota 2026-0442"
             />
           </div>
           <span slFieldDescription>Aparece na lista de chamados.</span>
         </div>`,
      ) +
        scene(
          'A limit the browser does not',
          'countMax without maxlength is a soft limit: the value may pass it, and the counter turns red before validation has run — which is the only moment the count is being read.',
          `<div slField>
             <label slFieldLabel>Apelido público</label>
             <div slTextField>
               <input slTextFieldInput showCount countMax="16" defaultValue="Ada Lovelace Byron" />
             </div>
           </div>
           <div slField>
             <label slFieldLabel>Descrição</label>
             <span slFieldCounter>3 palavras</span>
             <div slTextField>
               <input slTextFieldInput showCount defaultValue="entrega em atraso" />
             </div>
           </div>`,
        ),
    ),
  }),
};

export const Types: Story = {
  parameters: scenario('types'),
  render: () => ({
    template: grid(
      2,
      scene(
        'The type, and what travels with it',
        'A phone field that offers the wrong keyboard on a phone is a field nobody fills in twice, so inputmode, enterkeyhint and autocomplete all reach the element untouched.',
        `<div slTextField>
           <input slTextFieldInput type="email" autocomplete="email" defaultValue="ada@sirius.com.br" />
         </div>
         <div slTextField>
           <input slTextFieldInput type="tel" inputmode="tel" defaultValue="+55 11 98765-4321" />
         </div>
         <div slTextField>
           <input slTextFieldInput type="url" enterkeyhint="go" defaultValue="https://sirius.com.br" />
         </div>`,
      ) +
        scene(
          'Search, and the decoration the family withdrew',
          'WebKit adds its own clear button to a search input; the family draws one of its own, so the platform’s is withdrawn rather than left to sit beside it.',
          `<div slTextField clearable>
             <input slTextFieldInput type="search" enterkeyhint="search" defaultValue="nota fiscal" />
           </div>
           <div slTextField mono>
             <input slTextFieldInput defaultValue="ghp_9Xk2LmQ4pR7tV0wZ" />
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
        'Longer than the box, and unbreakable',
        'The value ellipsises rather than clipping mid-glyph, and nothing is removed from the DOM: the whole string stays selectable, copyable and reachable with the caret.',
        `<div slTextField>
           <input
             slTextFieldInput
             defaultValue="Kraftfahrzeug-Haftpflichtversicherungsnummer-2026-0442-XZ"
           />
         </div>
         <div slTextField>
           <input slTextFieldInput placeholder="Digite o número da nota fiscal, com série e subsérie" />
         </div>`,
      ) +
        scene(
          'At 240 pixels, and in the other direction',
          'The value surrenders width first while the adornments keep their target size, so the clear button stays hittable in a drawer as narrow as a phone.',
          measure(
            `<div slTextField clearable>
               <span slTextFieldStart>R$</span>
               <input slTextFieldInput defaultValue="1.480.320.559,00" />
             </div>`,
          ) +
            measure(
              `<div slTextField clearable>
                 <input slTextFieldInput dir="rtl" defaultValue="مرحبا بالعالم" />
               </div>`,
            ),
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { email: new FormControl('ada@sirius.com.br') },
    template: grid(
      2,
      scene(
        'A control that belongs in a reactive form',
        'ControlValueAccessor is the two-way binding the ecosystem expects, and it is why there is no [(value)]: a two-way binding has one slot and can carry neither a reason nor cancel().',
        `<div slTextField clearable>
           <input slTextFieldInput [formControl]="email" type="email" />
         </div>`,
      ) +
        scene(
          'Reaching the instance, and the element under it',
          'exportAs hands the template the directive, and inputElement is the native element — which already has focus, select and setSelectionRange, so no handle is invented for them.',
          `<div slTextField>
             <input slTextFieldInput #campo="slTextFieldInput" defaultValue="Selecione tudo" />
           </div>
           <button type="button" (click)="campo.inputElement.select()">Selecionar</button>`,
        ),
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Tab reaches the value, then each button',
        'Both buttons are real buttons in the tab order, each with its own ring inside the frame — so tabbing from the value moves something visible rather than leaving one ring around the whole box. Nothing is bound to Escape.',
        `<div slTextField clearable revealable>
           <input slTextFieldInput type="password" defaultValue="senha-secreta" />
         </div>
         <div slTextField clearable>
           <input slTextFieldInput type="search" defaultValue="pressione Tab" />
         </div>`,
      ),
    ),
  }),
};
