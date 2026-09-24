import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import checkboxTokens from '@slotted/styles/checkbox/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_CHECKBOX_TOKENS = checkboxTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Checkbox decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  provideCheckboxDefaults,\n  SlCheckbox,\n  SlCheckboxDescription,\n} from '@slotted/angular/checkbox';",
  selector: '[slCheckbox]',
  exportAs: 'slCheckbox',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element carrying slCheckbox',
    required: true,
    purpose:
      'The two-column grid: the box in one column, the label and the description in the other. Carries data-ui="checkbox", the two axes and data-checked, data-indeterminate, data-disabled, data-invalid and data-readonly. It has no role — the native control is the only thing announced — and it is the element a consumer writes formControlName on.',
  },
  {
    part: 'control',
    element: 'input type="checkbox", in the component’s template',
    required: true,
    purpose:
      'The control. Holds the value, the name and the identifier, and draws the box itself with appearance: none. It is reached through exportAs rather than through a template reference, because the element belongs to the component: box.inputElement gives focus() and click().',
  },
  {
    part: 'indicator',
    element: 'span',
    required: true,
    purpose:
      'The mark, drawn as a mask from the glyph scale over the control: the check for checked, the dash for mixed. It is a sibling and not a pseudo-element, because Firefox renders neither ::before nor ::after on an input, and it takes no pointer events.',
  },
  {
    part: 'label',
    element: 'label, in the component’s template',
    required: false,
    purpose:
      'Names the control through for, and carries the target and the hover wash: a 24-pixel square around the box, and a wash behind the box and the text that stands half the control gap off the box and half as far again past the text. It hugs its text, so the empty row beside it does not toggle the box. Its content is the default ng-content slot, so anything a consumer projects becomes the accessible name. Rendered when nothing is projected as well; the wash then closes around the box. Projected content that is only hidden text — a [slVisuallyHidden] naming a bare box in a table row or a data list — marks the root data-label-hidden, and the wash closes the same way.',
  },
  {
    part: 'description',
    element: 'the element carrying slCheckboxDescription',
    required: false,
    purpose:
      'Help text under the label, projected into a named slot outside the label and wired with aria-describedby. Outside on purpose: inside, it would join the accessible name, and clicking a paragraph of help would toggle the value.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One box with every axis on it, driven by the controls below the canvas. Click the label, not only the box: the target runs from the square to the end of the text.',
    snippet: defineSnippet({
      id: 'checkbox-angular-playground',
      language: 'angular',
      label: 'A box, its label and its help',
      source: `<div slCheckbox defaultChecked>
  Enviar recibo
  <p slCheckboxDescription>Enviaremos o recibo por e-mail.</p>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the box sits at',
    note: 'The square is the control glyph scale, so the three steps shrink together with the type and the gap when the toolbar switches to dense — and the label keeps its 24-pixel target at every one of them.',
    snippet: defineSnippet({
      id: 'checkbox-angular-sizes',
      language: 'angular',
      label: 'Three steps, all answering density',
      source: `<div slCheckbox size="sm">Compacto</div>
<div slCheckbox size="md">Padrão</div>
<div slCheckbox size="lg">Confortável</div>

<!-- Inside a group or a field, that decides and the box follows. -->
<div slCheckboxGroup size="sm">
  <div slCheckbox value="a">Compacto porque o grupo é</div>
</div>`,
    }),
  },
  {
    id: 'tile',
    title: 'The choice as a framed surface',
    note: 'Click anywhere inside a tile, not only the box: the label’s hit area stretches over the whole surface, so the target is the frame. Chosen says it with a two-pixel accent edge as well as a tint, because the high-contrast scheme flattens every tint to white and only the width survives.',
    snippet: defineSnippet({
      id: 'checkbox-angular-tile',
      language: 'angular',
      label: 'A row of framed choices, laid out by Grid',
      source: `<!-- The tile frames one choice. Grid arranges them, because it already
     owns columns, minItemWidth and a stretching alignment. -->
<div slGrid minItemWidth="sm">
  <div slCheckbox variant="tile" value="backup">
    Backup diário
    <p slCheckboxDescription>Uma cópia por dia, guardada por trinta dias.</p>
  </div>
  <div slCheckbox variant="tile" value="audit">
    Registro de auditoria
    <p slCheckboxDescription>Quem mudou o quê, e quando.</p>
  </div>
</div>`,
    }),
  },
  {
    id: 'states',
    title: 'Every state the box paints',
    note: 'Read-only keeps full-strength ink, its ring and its tab stop, because the value is real and still submitted; disabled loses all three. Invalid thickens the border as well as reddening it, because the high-contrast scheme paints every border the same black.',
    snippet: defineSnippet({
      id: 'checkbox-angular-states',
      language: 'angular',
      label: 'Every shared state unset by default',
      source: `<!-- Unstated rather than false, so the box defers to its group or field. -->
<div slCheckbox invalid>Escolha ao menos uma</div>
<div slCheckbox readOnly defaultChecked>Contratado</div>
<div slCheckbox disabled>Indisponível</div>`,
    }),
  },
  {
    id: 'indeterminate',
    title: 'The mixed state, and the box that commands a set',
    note: 'Mixed is a state and never a third value: the form still submits a boolean. Tick the parent and the whole set follows; untick one child and the parent goes back to the dash on its own.',
    snippet: defineSnippet({
      id: 'checkbox-angular-indeterminate',
      language: 'angular',
      label: 'A state a consumer owns, and one a group derives',
      source: `<!-- Owned by the consumer: the box draws the dash and submits nothing new. -->
<div slCheckbox indeterminate>Parcialmente marcado</div>

<!-- Derived by the group: checked when every value is selected, mixed
     between, and its request replaces the whole selection. -->
<div slCheckboxGroup [allValues]="days">
  <div slCheckbox parent>Todos os dias</div>
  <div slCheckbox value="mon">Segunda</div>
</div>`,
    }),
  },
  {
    id: 'placement',
    title: 'Which side of its label the box is on',
    note: 'start pushes the box to the end of the row, which is where a settings list puts a control — and it is why the column is a fraction rather than the label’s own width: five boxes have to line up with each other.',
    snippet: defineSnippet({
      id: 'checkbox-angular-placement',
      language: 'angular',
      label: 'The box first, or the label first',
      source: `<div slCheckbox labelPlacement="end">A caixa antes do rótulo</div>
<div slCheckbox labelPlacement="start">A caixa depois do rótulo</div>`,
    }),
  },
  {
    id: 'description',
    title: 'Saying more than the label does',
    note: 'The description aligns under the label rather than under the box, in both placements and both writing directions, and it is announced as the control’s description rather than as part of its name.',
    snippet: defineSnippet({
      id: 'checkbox-angular-description',
      language: 'angular',
      label: 'Help that is described, not named',
      source: `<div slCheckbox>
  Receber avisos por e-mail
  <p slCheckboxDescription>Um resumo por dia, e nunca mais de um.</p>
</div>`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a field, and in a reactive form',
    note: 'The box reads the field for its step and its four shared states and never for its identifier, and the same element is where formControlName goes — the value accessor is on the root.',
    snippet: defineSnippet({
      id: 'checkbox-angular-field',
      language: 'angular',
      label: 'A set of boxes under one legend, bound to a form',
      source: `<fieldset slFieldGroup required>
  <legend slFieldGroupLegend>Notificações</legend>
  <div slCheckboxGroup name="alerts" formControlName="alerts">
    <div slCheckbox value="approved">Pedido aprovado</div>
    <div slCheckbox value="refused">Pedido recusado</div>
  </div>
</fieldset>`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A label that wraps to three lines keeps the box on the first of them rather than in the middle of the block, an unbroken token breaks instead of taking the page with it, and a right-to-left label mirrors the whole row.',
    snippet: defineSnippet({
      id: 'checkbox-angular-content',
      language: 'angular',
      label: 'Long, unbroken and right-to-left',
      source: `<div slCheckbox>
  Concordo em receber comunicações sobre alterações contratuais e prazos de entrega.
  <p slCheckboxDescription>A caixa continua na primeira linha do rótulo.</p>
</div>

<div slCheckbox dir="rtl">أوافق على تلقي رسائل حول التغييرات في العقد.</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The token carries the two decisions an application takes once, exportAs reaches the instance and the native element behind it, and the root is the consumer’s own element rather than one the family renders.',
    snippet: defineSnippet({
      id: 'checkbox-angular-composition',
      language: 'angular',
      label: 'A provider, and the element behind the instance',
      source: `<!-- exportAs reaches the instance; inputElement reaches the input,
     which already has focus() and click(). -->
<div slCheckbox #box="slCheckbox">Uma caixa</div>
<button type="button" (click)="box.inputElement.focus()">Focar</button>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and who implements it',
    note: 'Space toggles and Enter submits the form, and neither is a listener this family writes: the control is a native checkbox, so the whole table is the platform’s and arrives translated and mirrored for free.',
    snippet: defineSnippet({
      id: 'checkbox-angular-keyboard',
      language: 'angular',
      label: 'No key is bound, and the reason is recovered from the click',
      source: `<!-- Space and a pointer arrive as one click. A click synthesised by the
     keyboard reports no detail, which is how the reason is told apart
     without a key listener existing anywhere in the family. -->
<div slCheckbox (checkedChange)="log($event.reason)">Marque com o teclado</div>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(checkedChange)',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the box moves. The request carries the new state, the state it replaces, the reason — "pointer" or "keyboard", recovered from the click’s detail — the originating event, and cancel(), which refuses the move before anything commits, including the platform’s own toggle. There is no [(checked)], because a two-way binding has one slot and can carry none of those.',
  },
  {
    name: 'ControlValueAccessor',
    payload: 'boolean',
    when: 'Whenever the box moves under a formControl, formControlName or ngModel written on the root. The same movement, through the integration Angular expects, so a form gets it without listening to the output at all.',
  },
];

export const ANGULAR_CHECKBOX_DOCS = {
  checkbox: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'checked',
        'boolean',
        '—',
        'SlCheckbox',
        'Present means the consumer owns the state. Absent, the box owns it and starts from defaultChecked; inside a group with a value, the group owns it instead',
      ],
      [
        'defaultChecked',
        'boolean',
        'false',
        'SlCheckbox',
        'What an uncontrolled box starts from, read once when the directive initialises rather than in its constructor — Angular binds inputs after construction',
      ],
      [
        'indeterminate',
        'boolean',
        'false',
        'SlCheckbox',
        'The mixed state. It is a state and never a third value of checked: the submitted value stays boolean, and the platform agrees — indeterminate is an IDL property written from script',
      ],
      [
        'parent',
        'boolean',
        'false',
        'SlCheckbox',
        'Commands the whole set its group was given in allValues. Checked when every value is selected, mixed when some are, and its request replaces the selection rather than toggling one value',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'SlCheckbox, provideCheckboxDefaults',
        'The type step. Read from the group first, then the field or field group, then the token. The square is the control glyph scale, which the theme restates per density',
      ],
      [
        'variant',
        "'plain' | 'tile'",
        'plain',
        'SlCheckbox, provideCheckboxDefaults',
        'How the choice is drawn. A tile frames it and makes the whole surface the target; the label keeps naming the control, so the keyboard and the accessible name are unchanged. Read from the group first, then the injected defaults',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        'SlCheckbox, provideCheckboxDefaults',
        'Which side of its own label the box is on. Never inherited from a field: that family’s labelPlacement answers where a field’s label sits relative to its control',
      ],
      [
        'disabled',
        'boolean',
        'from the group or field, or false',
        'SlCheckbox',
        'Unstated rather than false. Reaches the input as the native attribute, which is what removes it from the tab order and from submission. A disabled form control sets it too',
      ],
      [
        'readOnly',
        'boolean',
        'from the group or field, or false',
        'SlCheckbox',
        'Unstated rather than false. The platform has no readonly for a checkbox, so the family refuses the activation and writes aria-readonly; the box keeps its tab stop, its ring and its contrast',
      ],
      [
        'invalid',
        'boolean',
        'from the group or field, or false',
        'SlCheckbox',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the root, which thickens the border as well as reddening it',
      ],
      [
        'required',
        'boolean',
        '—',
        'the host element',
        'The element’s own attribute, read as a static attribute and passed through untouched. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
      [
        'name / value',
        'string',
        '— / on',
        'SlCheckbox',
        'The submission pair. Inside a group, name comes from the group when the box states none, and value is what the group’s selection holds',
      ],
    ]),
    composition: apiRows([
      [
        'exportAs="slCheckbox"',
        'SlCheckbox',
        '—',
        'a template',
        'Reaches the instance, and inputElement reaches the input behind it: focus() and click() are the element’s own, so no imperative handle is invented for what the platform already ships',
      ],
      [
        'slCheckboxDescription',
        'directive',
        '—',
        'a projected element',
        'A named slot outside the label. It is a directive on the consumer’s own element, so a p, a span or an inline-message all work and none of them loses its own semantics',
      ],
      [
        'provideCheckboxDefaults()',
        '{ size, labelPlacement }',
        '—',
        'an injector',
        'The two decisions an application takes once. Both are outranked by the group and by the field around the box',
      ],
      [
        'ControlValueAccessor',
        'formControl, formControlName, ngModel',
        '—',
        'the host element',
        'The accessor is on the root, so a form binding goes where the consumer already writes the directive. setDisabledState is honoured, and blur marks the control touched',
      ],
      [
        'the host element',
        'any element',
        '—',
        'SlCheckbox',
        'Angular pays one element for the root and React pays none: a component’s host is the wrapper, so the consumer chooses what the root is — a div, a li, a label of their own',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Checkbox (w3.org/WAI/ARIA/apg/patterns/checkbox/), and every item of it is answered by the platform: role, aria-checked with its mixed value, Space to toggle, Enter left to the form, and disabled behaviour. The family writes no key listener, which is why the behaviour arrives already translated and already mirrored in a right-to-left document.',
      'The label names the control through for, pointing at an identifier the component generates when the consumer writes none as a static attribute. The description is projected outside the label and reaches the control through aria-describedby, so help text is described rather than named.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour; a consumer who wants it writes required on the host and it survives untouched, because it is read as a static attribute before any binding computes. disabled is native, because that is what the word means.',
      'Read-only has no platform answer for a checkbox, so it is enforced rather than borrowed: the activation is refused on the click a pointer and Space share, aria-readonly announces it, and the box keeps its tab stop, its focus ring and its full contrast — a read-only value is real, and it must not look disabled.',
      'Refusing the activation is also what keeps a controlled box honest, and the reason nothing here writes the element: the HTML standard’s canceled activation behaviour for a checkbox is checked = !checked rather than a restore, so a correction made inside the listener would be toggled back out from under it.',
      'The invalid state is never colour alone. In the high-contrast scheme the theme paints the danger border the same black as every other border, so the box thickens its edge as well, and the sentence that says what is wrong is the field group’s error rather than the box’s colour.',
      'The target is not the square alone. A 24-pixel square around the box meets WCAG 2.2 SC 2.5.8 at every size and density, where the box is fourteen pixels at size="sm"; the label extends it to the end of the text, and the hover wash lights exactly that area. The row keeps its line height: the target is drawn around the box, not laid out beside it.',
    ],
    snippets: [
      defineSnippet({
        id: 'checkbox-angular-defaults',
        language: 'ts',
        label: 'The two decisions an application takes once',
        source: `import { provideCheckboxDefaults } from '@slotted/angular/checkbox';

bootstrapApplication(App, {
  providers: [provideCheckboxDefaults({ labelPlacement: 'start', size: 'sm' })],
});`,
      }),
      defineSnippet({
        id: 'checkbox-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div data-ui="checkbox" data-part="root" data-size="md" data-label-placement="end" data-checked>
  <input data-part="control" type="checkbox" id="terms" checked />
  <span data-part="indicator"></span>
  <label data-part="label" for="terms">Aceito os termos</label>
  <p data-part="description" id="terms-description">Enviaremos o recibo.</p>
</div>`,
      }),
      defineSnippet({
        id: 'checkbox-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='checkbox'] {
  --slotted-checkbox-size: 18px;
  --slotted-checkbox-radius: var(--slotted-radius-xs);
  --slotted-checkbox-checked-background: var(--slotted-tone-success-solid);
  --slotted-checkbox-mark-inset: 3px;
}`,
      }),
    ],
  },
} as const;
