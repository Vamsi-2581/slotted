import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlField, SlFieldControl, SlFieldDescription, SlFieldLabel } from '@slotted/angular/field';
import type { FieldNecessity, FieldSize } from '@slotted/angular/field';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlFieldGroup } from './field-group';
import type { FieldGroupOrientation } from './field-group';
import {
  SlFieldGroupDescription,
  SlFieldGroupError,
  SlFieldGroupLegend,
} from './field-group-parts';
import { ANGULAR_FIELD_GROUP_DOCS, ANGULAR_FIELD_GROUP_TOKENS } from './field-group.docs';

interface FieldGroupStoryArgs {
  orientation: FieldGroupOrientation;
  required: boolean;
  necessity: FieldNecessity;
  size: FieldSize;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_FIELD_GROUP_DOCS.fieldGroup.scenes, {
    playground: Playground,
    orientation: Orientation,
    states: States,
    messages: Messages,
    provision: Provision,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const DIRECTIVES = [
  SlField,
  SlFieldControl,
  SlFieldDescription,
  SlFieldLabel,
  SlFieldGroup,
  SlFieldGroupDescription,
  SlFieldGroupError,
  SlFieldGroupLegend,
];

const meta: Meta<FieldGroupStoryArgs> = {
  title: 'Components/Field Group',
  component: SlFieldGroup,
  decorators: [moduleMetadata({ imports: DIRECTIVES })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Field Group',
        description:
          'A set of fields under one name, in a native fieldset — so the group role, the accessible name and the disabling of every control inside all arrive from the platform rather than from ARIA.',
        framework: 'Angular',
        ...ANGULAR_FIELD_GROUP_DOCS.fieldGroup,
        tokens: ANGULAR_FIELD_GROUP_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<FieldGroupStoryArgs>;

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

const address = `
  <div slField>
    <label slFieldLabel>Logradouro</label>
    <input slFieldControl value="Avenida Paulista, 1000" />
  </div>
  <div slField>
    <label slFieldLabel>Município</label>
    <input slFieldControl value="São Paulo" />
  </div>`;

const vigencia = `
  <div slField>
    <label slFieldLabel>Início</label>
    <input slFieldControl type="date" value="2026-03-01" />
  </div>
  <div slField>
    <label slFieldLabel>Fim</label>
    <input slFieldControl type="date" value="2027-02-28" />
  </div>`;

export const Playground: Story = {
  args: {
    orientation: 'vertical',
    required: false,
    necessity: 'mark',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `
      <div class="slotted-demo-stage" data-layout="block">
        <fieldset
          slFieldGroup
          [size]="size"
          [orientation]="orientation"
          [necessity]="necessity"
          [required]="required"
        >
          <legend slFieldGroupLegend>Endereço de cobrança</legend>
          <span slFieldGroupDescription>Precisamos dele para emitir a nota fiscal.</span>
          ${address}
        </fieldset>
      </div>`,
  }),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A column, which is what a form is',
        'One field under the next, at the distance the group owns. There is no gap input: a group that took one would be a second Stack that also happens to draw a legend.',
        `<fieldset slFieldGroup>
           <legend slFieldGroupLegend>Endereço de cobrança</legend>
           ${address}
         </fieldset>`,
      ) +
        scene(
          'A row, and the same row in a narrow column',
          'A row wraps rather than squeezing: each field keeps enough width to hold a date, and the second one drops to the next line instead of clipping what is being typed into it.',
          `<fieldset slFieldGroup orientation="horizontal">
             <legend slFieldGroupLegend>Vigência do contrato</legend>
             ${vigencia}
           </fieldset>` +
            measure(`<fieldset slFieldGroup orientation="horizontal">
               <legend slFieldGroupLegend>Vigência do contrato</legend>
               ${vigencia}
             </fieldset>`),
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
        'Disabled, in one attribute',
        'Try to type into either control: the browser refuses, because a disabled fieldset disables its descendants and nothing was passed down. The legend and the labels are muted by the family, which the attribute alone would not reach.',
        `<fieldset slFieldGroup disabled>
           <legend slFieldGroupLegend>Repasse automático</legend>
           <span slFieldGroupDescription>
             Disponível depois que uma conta bancária for cadastrada.
           </span>
           <div slField>
             <label slFieldLabel>Dia do repasse</label>
             <input slFieldControl value="5" />
           </div>
           <div slField necessity="words">
             <label slFieldLabel>Valor mínimo</label>
             <input slFieldControl value="R$ 250,00" />
           </div>
         </fieldset>`,
      ) +
        scene(
          'Invalid, about the set rather than about a control',
          '“Choose at least one” is a fact about the group: no control in it is individually wrong, so the message belongs to the fieldset and its id goes there rather than on any checkbox.',
          `<fieldset slFieldGroup invalid required>
             <legend slFieldGroupLegend>Nacionalidade</legend>
             <span slFieldGroupDescription>Marque todas as que se aplicam.</span>
             <span slFieldGroupError>Escolha ao menos uma nacionalidade.</span>
             <label for="ng-nat-br"><input id="ng-nat-br" type="checkbox" /> Brasileira</label>
             <label for="ng-nat-pt"><input id="ng-nat-pt" type="checkbox" /> Portuguesa</label>
           </fieldset>`,
        ),
    ),
  }),
};

export const Messages: Story = {
  parameters: scenario('messages'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Before the set, not after it',
        'A group’s help is read on the way in, so it sits between the legend and the first field. A single field’s help sits after its control, which is the opposite order and the right one for each.',
        `<fieldset slFieldGroup id="billing">
           <legend slFieldGroupLegend>Endereço de cobrança</legend>
           <span slFieldGroupDescription>Precisamos dele para emitir a nota fiscal.</span>
           <div slField>
             <label slFieldLabel>CEP</label>
             <input slFieldControl value="01310-100" />
             <span slFieldDescription>Somente números.</span>
           </div>
         </fieldset>`,
      ) +
        scene(
          'A warning about a section, and a line held open',
          'Both messages take inline-message’s five tones, so a warning that does not block submission is the same part in another tone. reserve keeps the fields below from moving when the error arrives.',
          `<fieldset slFieldGroup>
             <legend slFieldGroupLegend>Notificações</legend>
             <span slFieldGroupError tone="warning">
               Sem um e-mail verificado, só o aviso no aplicativo será enviado.
             </span>
             <label for="ng-notify-email">
               <input id="ng-notify-email" type="checkbox" /> Por e-mail
             </label>
             <label for="ng-notify-app">
               <input id="ng-notify-app" type="checkbox" checked /> No aplicativo
             </label>
           </fieldset>`,
        ),
    ),
  }),
};

export const Provision: Story = {
  parameters: scenario('provision'),
  render: () => ({
    template: grid(
      2,
      scene(
        'One attribute for the whole section',
        'The group sets the step, the placement and the necessity style for every field inside it. Nothing is repeated per field, and nothing had to be threaded through by the page.',
        `<fieldset slFieldGroup size="sm" labelPlacement="side" required necessity="words">
           <legend slFieldGroupLegend>Dados fiscais</legend>
           <div slField required>
             <label slFieldLabel>CNPJ</label>
             <input slFieldControl value="12.345.678/0001-90" />
           </div>
           <div slField>
             <label slFieldLabel>Inscrição estadual</label>
             <input slFieldControl />
           </div>
         </fieldset>`,
      ) +
        scene(
          'And the one field that says otherwise',
          'A field that states its own value wins over the group, which is the same rule a control follows against its field: the explicit value always wins, and absence is what defers.',
          `<fieldset slFieldGroup size="sm">
             <legend slFieldGroupLegend>Dados fiscais</legend>
             <div slField>
               <label slFieldLabel>CNPJ</label>
               <input slFieldControl value="12.345.678/0001-90" />
             </div>
             <div slField size="lg">
               <label slFieldLabel>Razão social</label>
               <input slFieldControl value="Sirius Group Tecnologia" />
             </div>
           </fieldset>`,
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
        'The page’s heading, inside the legend',
        'The heading keeps its own type and loses only the block break, so the necessity words stay on its line. A reader hears the question once rather than as a heading and then again as a group name.',
        `<fieldset slFieldGroup size="lg" required necessity="words">
           <legend slFieldGroupLegend><h2>Qual é a sua nacionalidade?</h2></legend>
           <span slFieldGroupDescription>
             Se você tem dupla nacionalidade, marque todas as opções relevantes.
           </span>
           <label for="ng-head-br"><input id="ng-head-br" type="checkbox" /> Brasileira</label>
           <label for="ng-head-pt"><input id="ng-head-pt" type="checkbox" /> Portuguesa</label>
         </fieldset>`,
      ) +
        scene(
          'A legend no language can break, in a narrow column',
          'A fieldset arrives from the user agent with a min-inline-size of min-content, which would refuse to shrink below the widest control; the family removes it, so the group fits the column and the legend wraps.',
          measure(`<fieldset slFieldGroup size="sm">
             <legend slFieldGroupLegend lang="de">Kraftfahrzeug-Haftpflichtversicherung</legend>
             <span slFieldGroupDescription>
               sha256:9f2b7c41a8d3e05f6c1b4a97e2d80f3c5b6a1d4e7f0938271a6b5c4d3e2f1a09
             </span>
             <div slField>
               <label slFieldLabel>Nummer</label>
               <input slFieldControl value="HV-2026-0041" />
             </div>
           </fieldset>`),
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A section inside a section',
        'The inner group inherits the step the outer one decided and restates only the necessity style, so a nested set is a difference from its parent rather than a repetition of it.',
        `<fieldset slFieldGroup size="sm">
           <legend slFieldGroupLegend>Contrato</legend>
           <div slField required necessity="words">
             <label slFieldLabel>Número</label>
             <input slFieldControl value="CT-2026-0041" />
           </div>
           <fieldset slFieldGroup orientation="horizontal" necessity="none">
             <legend slFieldGroupLegend>Vigência</legend>
             ${vigencia}
           </fieldset>
         </fieldset>`,
      ) +
        scene(
          'The identifiers, handed back to the template',
          'exportAs gives the page the group instance, so a link elsewhere on the page can point at the legend the group named without the page inventing an identifier of its own.',
          `<fieldset slFieldGroup #payments="slFieldGroup" id="payments">
             <legend slFieldGroupLegend>Formas de pagamento</legend>
             <label for="ng-pay-pix"><input id="ng-pay-pix" type="checkbox" checked /> Pix</label>
             <label for="ng-pay-boleto"><input id="ng-pay-boleto" type="checkbox" /> Boleto</label>
           </fieldset>
           <a [href]="'#' + payments.ids().legend">Ir para as formas de pagamento</a>`,
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
        'Tab into either checkbox and listen',
        'The group’s name and its two messages are read before the checkbox’s own label, because all three live on the fieldset. Nothing here writes a role, an aria-label or an aria-describedby onto a control.',
        `<fieldset slFieldGroup id="nationality" invalid required>
           <legend slFieldGroupLegend>Nacionalidade</legend>
           <span slFieldGroupDescription>Marque todas as que se aplicam.</span>
           <span slFieldGroupError live="polite">Escolha ao menos uma nacionalidade.</span>
           <label for="ng-a11y-br"><input id="ng-a11y-br" type="checkbox" /> Brasileira</label>
           <label for="ng-a11y-pt"><input id="ng-a11y-pt" type="checkbox" /> Portuguesa</label>
         </fieldset>`,
      ) +
        scene(
          'The marker on the set, and nothing on the fields',
          'required is a fact about one value, so it marks the legend and stops there. Neither field below carries an asterisk, because the group cannot know which of them the requirement is about.',
          `<fieldset slFieldGroup required>
             <legend slFieldGroupLegend>Contato de emergência</legend>
             <div slField>
               <label slFieldLabel>Telefone</label>
               <input slFieldControl value="(11) 90000-0000" />
             </div>
             <div slField>
               <label slFieldLabel>E-mail</label>
               <input slFieldControl type="email" value="contato@sirius.com.br" />
             </div>
           </fieldset>`,
        ),
    ),
  }),
};
