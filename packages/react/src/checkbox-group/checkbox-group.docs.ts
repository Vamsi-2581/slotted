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

export const REACT_CHECKBOX_GROUP_TOKENS = checkboxGroupTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Checkbox Group decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Checkbox, CheckboxGroup, CheckboxGroupDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The only part. It arranges the boxes, holds the selection, and carries data-ui="checkbox-group", the two axes and data-disabled, data-invalid and data-readonly. Its role is group, and it is withdrawn inside a field group, whose fieldset and legend already name the set. The boxes inside are the checkbox family: nothing in this stylesheet selects into that one.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One set with every axis on it, driven by the controls below the canvas. Tick two options and watch the array in the actions panel: the order is the set’s, never the click order.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-playground',
      language: 'tsx',
      label: 'A set of choices and the array behind it',
      source: `<CheckboxGroup allValues={['mon', 'wed', 'fri']} defaultValue={['mon']} name="days">
  <Checkbox value="mon">Segunda</Checkbox>
  <Checkbox value="wed">Quarta</Checkbox>
  <Checkbox value="fri">Sexta</Checkbox>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'orientation',
    title: 'How the choices flow',
    note: 'A horizontal set wraps rather than scrolling or clipping, because a row whose last option nobody can see is worse than two rows — and the distance between two choices is twice the distance between a box and its own label.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-orientation',
      language: 'tsx',
      label: 'Stacked, and in a row that wraps',
      source: `<CheckboxGroup orientation="vertical">
  <Checkbox value="mon">Segunda</Checkbox>
</CheckboxGroup>;

<CheckboxGroup orientation="horizontal">
  <Checkbox value="mon">Segunda</Checkbox>
  <Checkbox value="tue">Terça</Checkbox>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'tile',
    title: 'A set of framed choices',
    note: 'The variant belongs to the group, not to each box: a set with one plain choice among four tiles is a set nobody meant to write. Arrangement is not the group’s — Grid already owns columns, minItemWidth and a stretching alignment, so tiles in a row come out the same width and the same height.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-tile',
      language: 'tsx',
      label: 'The group frames, Grid arranges',
      source: `<CheckboxGroup defaultValue={['pix']} variant="tile">
  <Grid minItemWidth="sm">
    <Checkbox description="Compensação imediata." value="pix">
      Pix
    </Checkbox>
    <Checkbox description="Parcelamento em até doze vezes." value="card">
      Cartão de crédito
    </Checkbox>
  </Grid>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'parent',
    title: 'One box that commands the set',
    note: 'The parent is derived and never entered: ticked when every value is selected, mixed between the two, and its request replaces the whole selection rather than toggling a value of its own.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-parent',
      language: 'tsx',
      label: 'allValues is what makes a parent possible',
      source: `<CheckboxGroup allValues={['mon', 'tue', 'wed']} defaultValue={['mon']}>
  <Checkbox parent>Todos os dias</Checkbox>
  <Checkbox value="mon">Segunda</Checkbox>
  <Checkbox value="tue">Terça</Checkbox>
  <Checkbox value="wed">Quarta</Checkbox>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'states',
    title: 'What the group says to every box in it',
    note: 'Each of the four is unstated rather than false, so a group defers to the field around it and a box defers to the group; stated anywhere, it wins from there down and every box paints it.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-states',
      language: 'tsx',
      label: 'Four states, decided once for the set',
      source: `<CheckboxGroup invalid required>
  <Checkbox value="a">Escolha ao menos uma</Checkbox>
</CheckboxGroup>;

// Read-only keeps every tab stop and refuses every change; disabled is
// the native attribute and removes the boxes from the form.
<CheckboxGroup readOnly defaultValue={['a']} />;
<CheckboxGroup disabled />;`,
    }),
  },
  {
    id: 'count',
    title: 'How many of them are chosen',
    note: 'The number reaches the field’s label row through the channel a text field opened for characters, so a reader finds "2/5" where they already look for a count rather than in a sentence under the set.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-count',
      language: 'tsx',
      label: 'A count in the spare column of the label row',
      source: `<Field>
  <FieldLabel>Dias de coleta</FieldLabel>
  <CheckboxGroup allValues={['mon', 'wed', 'fri']} showCount>
    <Checkbox value="mon">Segunda</Checkbox>
    <Checkbox value="wed">Quarta</Checkbox>
    <Checkbox value="fri">Sexta</Checkbox>
  </CheckboxGroup>
</Field>;`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a group of fields',
    note: 'The fieldset and its legend are what group and name the set, so this group withdraws its own role rather than announcing the same set twice — and a disabled fieldset disables every box with nothing passed down.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-field',
      language: 'tsx',
      label: 'The legend names the set; the group holds it',
      source: `<FieldGroup required>
  <FieldGroupLegend>Notificações</FieldGroupLegend>
  <CheckboxGroup name="alerts">
    <Checkbox value="approved">Pedido aprovado</Checkbox>
    <Checkbox value="refused">Pedido recusado</Checkbox>
  </CheckboxGroup>
</FieldGroup>;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A set of long options keeps every box on the first line of its own label, a narrow column turns a horizontal set into a stack without a media query, and a right-to-left set mirrors whole rather than rearranging.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-content',
      language: 'tsx',
      label: 'Long options, and a narrow column',
      source: `<CheckboxGroup orientation="horizontal">
  <Checkbox value="a">
    Autorizo o uso dos dados de navegação para personalizar as recomendações
  </Checkbox>
  <Checkbox value="b">E também para medir o alcance das campanhas</Checkbox>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The provider carries the three decisions an application takes once, render substitutes the root so a set can be a real list, and useCheckboxGroup reads the same state a box reads.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-composition',
      language: 'tsx',
      label: 'A provider, a substituted root, and the hook a box reads',
      source: `<CheckboxGroupDefaultsProvider orientation="horizontal" size="sm">
  <CheckboxGroup>
    <Checkbox value="a">Herda os três</Checkbox>
  </CheckboxGroup>
</CheckboxGroupDefaultsProvider>;

// The root becomes a real list, and each box a list item.
<CheckboxGroup render={(props) => <ul {...props} />}>
  <Checkbox render={(props) => <li {...props} />} value="a">
    Um item
  </Checkbox>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and who implements it',
    note: 'Every box is its own tab stop and Space toggles it, because a checkbox is one choice made on its own — which is exactly what tells this family apart from a radio group, where the whole set is one stop.',
    snippet: defineSnippet({
      id: 'checkbox-group-react-keyboard',
      language: 'tsx',
      label: 'One tab stop per box, and no key bound by the family',
      source: `// The group binds no key at all: each box is a native checkbox, so Tab
// reaches every one of them and Space toggles the one that has focus.
<CheckboxGroup allValues={['a', 'b']}>
  <Checkbox value="a">Tab até aqui</Checkbox>
  <Checkbox value="b">E de novo até aqui</Checkbox>
</CheckboxGroup>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: readonly string[], request: ChangeRequest<readonly string[]>)',
    when: 'Before the selection moves. The request carries the new array, the array it replaces, the reason — "pointer" or "keyboard", recovered from the box’s click — the originating event, and cancel(), which refuses the move before anything commits, including the platform’s own toggle.',
  },
  {
    name: 'onCheckedChange, on each box',
    payload: '(checked: boolean, request: ChangeRequest<boolean>)',
    when: 'Before that one box moves, and before the group’s own request is built. Cancelling it stops the group as well, which is what lets one option refuse to be chosen without the set knowing about it.',
  },
];

export const REACT_CHECKBOX_GROUP_DOCS = {
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
        'CheckboxGroup',
        'Present means the consumer owns the selection, for the life of the component. Absent, the group owns it and starts from defaultValue',
      ],
      [
        'defaultValue',
        'readonly string[]',
        '[]',
        'CheckboxGroup',
        'The selection an uncontrolled group starts from, read once',
      ],
      [
        'allValues',
        'readonly string[]',
        '—',
        'CheckboxGroup',
        'Every value the group commands. It is what makes a parent box possible — checked is every value selected and mixed is some of them, and neither can be derived from a selection alone — and it is what keeps the selection in the set’s order rather than in click order',
      ],
      [
        'variant',
        "'plain' | 'tile'",
        'plain',
        'CheckboxGroup, CheckboxGroupDefaultsProvider',
        'How every choice in the set is drawn, handed down the way size is. A tile frames each choice and makes its whole surface the target. Arrangement stays Grid’s',
      ],
      [
        'orientation',
        "'vertical' | 'horizontal'",
        'vertical',
        'CheckboxGroup, CheckboxGroupDefaultsProvider',
        'How the choices flow. A horizontal set wraps rather than scrolling: a set of options is not a scroll region',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'CheckboxGroup, CheckboxGroupDefaultsProvider',
        'The type step, handed to every box. Read from the field or field group first, then from the provider',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        'CheckboxGroup, CheckboxGroupDefaultsProvider',
        'Which side of its own label each box is on, decided once for the set so the controls line up with each other',
      ],
      [
        'name',
        'string',
        '—',
        'CheckboxGroup',
        'The submission name every box shares when it states none of its own. A checkbox group needs no generated name: checkboxes are not grouped by name the way radios are',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'CheckboxGroup',
        'Unstated rather than false. Reaches every box as the native attribute, which is what removes them from the tab order and from submission',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'CheckboxGroup',
        'Unstated rather than false. Every box keeps its tab stop, its ring and its contrast, announces aria-readonly, and refuses every change',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'CheckboxGroup',
        'Unstated rather than false. Writes aria-invalid on the group and on every box, and data-invalid on both roots',
      ],
      [
        'required',
        'boolean',
        'from the field, or false',
        'CheckboxGroup',
        'Unstated rather than false. Writes aria-required on the group. It is never the native attribute, which on a checkbox would demand that one particular box be ticked',
      ],
      [
        'showCount',
        'boolean',
        'false',
        'CheckboxGroup',
        'Publishes how many of allValues are selected to the field around the group, which draws it in the spare column of its label row',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props: CheckboxGroupRootProps) => ReactNode',
        '—',
        'CheckboxGroup',
        'Substitutes the root and hands it every attribute. The props are typed against HTMLAttributes<HTMLElement>, so a set of choices can be a real ul with each box rendered as a li',
      ],
      [
        'useCheckboxGroup()',
        '() => CheckboxGroupContextValue | undefined',
        '—',
        'inside a CheckboxGroup',
        'What a box reads to know whether it is selected, what its step is, and how to ask for a change. It is undefined outside a group, which is what lets one Checkbox serve a bare consent box and a member of a set',
      ],
      [
        'CheckboxGroupDefaultsProvider',
        '{ size, orientation, labelPlacement }',
        '—',
        'a subtree',
        'The three decisions an application takes once. size is outranked by the field around the group',
      ],
      [
        'className / style',
        'string / CSSProperties',
        '—',
        'CheckboxGroup',
        'Reach the root. Every other native prop reaches it too, because the root is the only element this family renders',
      ],
      [
        'role',
        'string',
        'group, or none inside a field group',
        'CheckboxGroup',
        'A consumer’s own role wins over both. The group withdraws its role inside a field group because a fieldset with a legend is already a named group, and a second one named by the same legend is the same set announced twice',
      ],
    ]),
    accessibility: [
      'There is no APG pattern for a group of checkboxes: the APG’s Checkbox pattern covers one box, and grouping is a naming question rather than a keyboard one. The sources are the ARIA group role and the APG’s Providing Accessible Names and Descriptions practice (w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).',
      'Every box is its own tab stop and Space toggles the one that has focus. That is the whole keyboard model, and it is the platform’s: a checkbox is one choice made on its own, which is exactly what tells this family apart from a radio group, where the set is a single stop and the arrows move the choice.',
      'The role is conditional. A field group is a fieldset with a legend, which is already a named group to assistive technology; a role="group" inside it, named by the same legend, announces the same set twice. Inside one, this group renders no role at all and the legend does the naming.',
      'aria-required on the group, never the native required on a box. The native attribute on a checkbox demands that one particular box be ticked, which is not what "choose at least one" means, and it engages browser constraint validation the library must not impose.',
      'Read-only is enforced rather than borrowed, because the platform has no readonly for a checkbox: every box refuses the change on the click a pointer and Space share, aria-readonly announces it, and every tab stop and focus ring survives.',
      'The parent box is derived from the set rather than kept as a state of its own, so it can never disagree with what its children show. It reports aria-checked="mixed" through the platform’s indeterminate property, and its request replaces the selection instead of adding a value nobody chose.',
    ],
    snippets: [
      defineSnippet({
        id: 'checkbox-group-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="checkbox-group"
  data-part="root"
  data-size="md"
  data-orientation="vertical"
  role="group"
>
  <div data-ui="checkbox" data-part="root" data-checked>
    …
  </div>
</div>;`,
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
