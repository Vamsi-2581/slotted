import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import checkboxGroupTokens from '@slotted/styles/checkbox-group/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_CHECKBOX_GROUP_TOKENS = checkboxGroupTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Checkbox Group decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  provideCheckboxGroupDefaults,\n  SlCheckboxGroup,\n} from '@slotted/angular/checkbox-group';",
  selector: '[slCheckboxGroup]',
  exportAs: 'slCheckboxGroup',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element carrying slCheckboxGroup',
    required: true,
    purpose:
      'The only part. It arranges the boxes, holds the selection, and carries data-ui="checkbox-group", the two axes and data-disabled, data-invalid and data-readonly. Its role is group, withdrawn inside a field group whose fieldset and legend already name the set. It is also where formControlName goes: the value accessor and the validator are both on this element.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One set with every axis on it, driven by the controls below the canvas. Tick two options and watch the array in the actions panel: the order is the set’s, never the click order.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-playground',
      language: 'angular',
      label: 'A set of choices and the array behind it',
      source: `<div slCheckboxGroup name="days" [allValues]="days" [defaultValue]="['mon']">
  <div slCheckbox value="mon">Segunda</div>
  <div slCheckbox value="wed">Quarta</div>
  <div slCheckbox value="fri">Sexta</div>
</div>`,
    }),
  },
  {
    id: 'orientation',
    title: 'How the choices flow',
    note: 'A horizontal set wraps rather than scrolling or clipping, because a row whose last option nobody can see is worse than two rows — and the distance between two choices is twice the distance between a box and its own label.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-orientation',
      language: 'angular',
      label: 'Stacked, and in a row that wraps',
      source: `<div slCheckboxGroup orientation="vertical">
  <div slCheckbox value="mon">Segunda</div>
</div>

<div slCheckboxGroup orientation="horizontal">
  <div slCheckbox value="mon">Segunda</div>
  <div slCheckbox value="tue">Terça</div>
</div>`,
    }),
  },
  {
    id: 'tile',
    title: 'A set of framed choices',
    note: 'The variant belongs to the group, not to each box: a set with one plain choice among four tiles is a set nobody meant to write. Arrangement is not the group’s — Grid already owns columns, minItemWidth and a stretching alignment, so tiles in a row come out the same width and the same height.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-tile',
      language: 'angular',
      label: 'The group frames, Grid arranges',
      source: `<div slCheckboxGroup variant="tile" [defaultValue]="['pix']">
  <div slGrid minItemWidth="sm">
    <div slCheckbox value="pix">
      Pix
      <p slCheckboxDescription>Compensação imediata.</p>
    </div>
    <div slCheckbox value="card">
      Cartão de crédito
      <p slCheckboxDescription>Parcelamento em até doze vezes.</p>
    </div>
  </div>
</div>`,
    }),
  },
  {
    id: 'parent',
    title: 'One box that commands the set',
    note: 'The parent is derived and never entered: ticked when every value is selected, mixed between the two, and its request replaces the whole selection rather than toggling a value of its own.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-parent',
      language: 'angular',
      label: 'allValues is what makes a parent possible',
      source: `<div slCheckboxGroup [allValues]="days" [defaultValue]="['mon']">
  <div slCheckbox parent>Todos os dias</div>
  <div slCheckbox value="mon">Segunda</div>
  <div slCheckbox value="tue">Terça</div>
</div>`,
    }),
  },
  {
    id: 'states',
    title: 'What the group says to every box in it',
    note: 'Each of the four is unstated rather than false, so a group defers to the field around it and a box defers to the group; stated anywhere, it wins from there down and every box paints it.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-states',
      language: 'angular',
      label: 'Four states, decided once for the set',
      source: `<div slCheckboxGroup invalid required>
  <div slCheckbox value="a">Escolha ao menos uma</div>
</div>

<div slCheckboxGroup readOnly [defaultValue]="['a']">
  <div slCheckbox value="a">Contratado</div>
</div>

<div slCheckboxGroup disabled>
  <div slCheckbox value="a">Indisponível</div>
</div>`,
    }),
  },
  {
    id: 'count',
    title: 'How many of them are chosen',
    note: 'The number reaches the field’s label row through the channel a text field opened for characters, so a reader finds "2/5" where they already look for a count rather than in a sentence under the set.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-count',
      language: 'angular',
      label: 'A count in the spare column of the label row',
      source: `<div slField>
  <label slFieldLabel>Dias de coleta</label>
  <div slCheckboxGroup showCount [allValues]="days">
    <div slCheckbox value="mon">Segunda</div>
    <div slCheckbox value="wed">Quarta</div>
  </div>
</div>`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a group of fields, and in a reactive form',
    note: 'The fieldset and its legend are what group and name the set, so this group withdraws its own role — and the same element takes formControlName, because the accessor and the validator both live on the root.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-field',
      language: 'angular',
      label: 'The legend names the set; the form owns the value',
      source: `<fieldset slFieldGroup required>
  <legend slFieldGroupLegend>Notificações</legend>
  <div slCheckboxGroup required formControlName="alerts">
    <div slCheckbox value="approved">Pedido aprovado</div>
    <div slCheckbox value="refused">Pedido recusado</div>
  </div>
</fieldset>`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A set of long options keeps every box on the first line of its own label, a narrow column turns a horizontal set into a stack without a media query, and a right-to-left set mirrors whole rather than rearranging.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-content',
      language: 'angular',
      label: 'Long options, and a narrow column',
      source: `<div slCheckboxGroup orientation="horizontal">
  <div slCheckbox value="a">
    Autorizo o uso dos dados de navegação para personalizar as recomendações
  </div>
  <div slCheckbox value="b">E também para medir o alcance das campanhas</div>
</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The token carries the three decisions an application takes once, exportAs reaches the instance, and the root is the consumer’s own element — so a set of choices can be a real list.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-composition',
      language: 'angular',
      label: 'A set of choices that is a real list',
      source: `<ul slCheckboxGroup class="slotted-demo-list" [defaultValue]="['a']">
  <li slCheckbox value="a">Um item</li>
  <li slCheckbox value="b">E outro abaixo dele</li>
</ul>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and who implements it',
    note: 'Every box is its own tab stop and Space toggles it, because a checkbox is one choice made on its own — which is exactly what tells this family apart from a radio group, where the whole set is one stop.',
    snippet: defineSnippet({
      id: 'checkbox-group-angular-keyboard',
      language: 'angular',
      label: 'One tab stop per box, and no key bound by the family',
      source: `<!-- The group binds no key at all: each box is a native checkbox, so Tab
     reaches every one of them and Space toggles the one that has focus. -->
<div slCheckboxGroup>
  <div slCheckbox value="a">Tab até aqui</div>
  <div slCheckbox value="b">E de novo até aqui</div>
</div>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(valueChange)',
    payload: 'ChangeRequest<readonly string[]>',
    when: 'Before the selection moves. The request carries the new array, the array it replaces, the reason — "pointer" or "keyboard", recovered from the box’s click — the originating event, and cancel(), which refuses the move before anything commits. There is no [(value)], because a two-way binding has one slot and can carry none of those.',
  },
  {
    name: 'ControlValueAccessor and Validator',
    payload: 'readonly string[]',
    when: 'Whenever the selection moves under a formControl, formControlName or ngModel written on the root. The group also validates the set: required means "choose at least one", which no single box can see.',
  },
];

export const ANGULAR_CHECKBOX_GROUP_DOCS = {
  checkboxGroup: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'value',
        'readonly string[]',
        '—',
        'SlCheckboxGroup',
        'Present means the consumer owns the selection. Absent, the group owns it and starts from defaultValue — or from the form control bound to the root',
      ],
      [
        'defaultValue',
        'readonly string[]',
        '[]',
        'SlCheckboxGroup',
        'The selection an uncontrolled group starts from, read once when the directive initialises rather than in its constructor',
      ],
      [
        'allValues',
        'readonly string[]',
        '—',
        'SlCheckboxGroup',
        'Every value the group commands. It is what makes a parent box possible — checked is every value selected and mixed is some of them — and what keeps the selection in the set’s order rather than in click order',
      ],
      [
        'variant',
        "'plain' | 'tile'",
        'plain',
        'SlCheckboxGroup, provideCheckboxGroupDefaults',
        'How every choice in the set is drawn, handed down the way size is. A tile frames each choice and makes its whole surface the target. Arrangement stays Grid’s',
      ],
      [
        'orientation',
        "'vertical' | 'horizontal'",
        'vertical',
        'SlCheckboxGroup, provideCheckboxGroupDefaults',
        'How the choices flow. A horizontal set wraps rather than scrolling: a set of options is not a scroll region',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'SlCheckboxGroup, provideCheckboxGroupDefaults',
        'The type step, handed to every box. Read from the field or field group first, then from the token',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        'SlCheckboxGroup, provideCheckboxGroupDefaults',
        'Which side of its own label each box is on, decided once for the set so the controls line up with each other',
      ],
      [
        'name',
        'string',
        '—',
        'SlCheckboxGroup',
        'The submission name every box shares when it states none of its own. A checkbox group needs no generated name: checkboxes are not grouped by name the way radios are',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'SlCheckboxGroup',
        'Unstated rather than false. Reaches every box as the native attribute. A disabled form control sets it too, through setDisabledState',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'SlCheckboxGroup',
        'Unstated rather than false. Every box keeps its tab stop, its ring and its contrast, announces aria-readonly, and every change is refused',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'SlCheckboxGroup',
        'Unstated rather than false. Writes aria-invalid on the group and on every box, and data-invalid on both roots',
      ],
      [
        'required',
        'boolean',
        'from the field, or false',
        'SlCheckboxGroup',
        'Unstated rather than false. Writes aria-required on the group and makes the group’s Validator demand a non-empty selection. It is never the native attribute, which on a checkbox would demand that one particular box be ticked',
      ],
      [
        'showCount',
        'boolean',
        'false',
        'SlCheckboxGroup',
        'Publishes how many of allValues are selected to the field around the group, which draws it in the spare column of its label row',
      ],
    ]),
    composition: apiRows([
      [
        'exportAs="slCheckboxGroup"',
        'SlCheckboxGroup',
        '—',
        'a template',
        'Reaches the instance, and with it the resolved axes and the selection a template may want to read',
      ],
      [
        'ControlValueAccessor and Validator',
        'formControl, formControlName, ngModel',
        '—',
        'the host element',
        'Both are on the root, so a form binding goes where the consumer already writes the directive. required becomes a validator over the set, which is the integration React has no equivalent of',
      ],
      [
        'provideCheckboxGroupDefaults()',
        '{ size, orientation, labelPlacement }',
        '—',
        'an injector',
        'The three decisions an application takes once. size is outranked by the field around the group',
      ],
      [
        'the host element',
        'any element',
        '—',
        'SlCheckboxGroup',
        'Angular pays one element for the root and React pays none: the host is the wrapper, so a set of choices can be a ul with each box written as a li',
      ],
      [
        'role',
        'string',
        'group, or none inside a field group',
        'the host element',
        'A role the consumer wrote as a static attribute wins over both, because it is read before the host binding computes',
      ],
    ]),
    accessibility: [
      'There is no APG pattern for a group of checkboxes: the APG’s Checkbox pattern covers one box, and grouping is a naming question rather than a keyboard one. The sources are the ARIA group role and the APG’s Providing Accessible Names and Descriptions practice (w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).',
      'Every box is its own tab stop and Space toggles the one that has focus. That is the whole keyboard model, and it is the platform’s: a checkbox is one choice made on its own, which is what tells this family apart from a radio group, where the set is a single stop and the arrows move the choice.',
      'The role is conditional. A field group is a fieldset with a legend, which is already a named group; a role="group" inside it, named by the same legend, announces the same set twice. Inside one, this group renders no role at all.',
      'aria-required on the group, never the native required on a box. The native attribute on a checkbox demands that one particular box be ticked, which is not what "choose at least one" means — and that sentence is a fact about the array, which is why the group and not the box is the Validator.',
      'Read-only is enforced rather than borrowed, because the platform has no readonly for a checkbox: every box refuses the activation, aria-readonly announces it, and every tab stop and focus ring survives.',
      'The parent box is derived from the set rather than kept as a state of its own, so it can never disagree with what its children show. It reports aria-checked="mixed" through the platform’s indeterminate property, and its request replaces the selection instead of adding a value nobody chose.',
    ],
    snippets: [
      defineSnippet({
        id: 'checkbox-group-angular-defaults',
        language: 'ts',
        label: 'The three decisions an application takes once',
        source: `import { provideCheckboxGroupDefaults } from '@slotted/angular/checkbox-group';

bootstrapApplication(App, {
  providers: [provideCheckboxGroupDefaults({ orientation: 'horizontal', size: 'sm' })],
});`,
      }),
      defineSnippet({
        id: 'checkbox-group-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="checkbox-group"
  data-part="root"
  data-size="md"
  data-orientation="vertical"
  role="group"
>
  <div data-ui="checkbox" data-part="root" data-checked>…</div>
</div>`,
      }),
      defineSnippet({
        id: 'checkbox-group-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='checkbox-group'] {
  --slotted-checkbox-group-gap: var(--slotted-space-5);
}`,
      }),
    ],
  },
} as const;
