import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import textareaTokens from '@slotted/styles/textarea/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_TEXTAREA_TOKENS = textareaTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Textarea decision',
}));

const imports: ReferenceImport = {
  source: "import { provideTextareaDefaults, SlTextarea } from '@slotted/angular/textarea';",
  selector: 'textarea[slTextarea]',
  exportAs: 'slTextarea',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'textarea[slTextarea]',
    required: true,
    purpose:
      'The control and the frame at once. Carries data-ui="textarea", the three axes, data-auto-size, and data-disabled, data-invalid and data-readonly. It is the ControlValueAccessor as well, so the control belongs in a reactive form as it stands. text-field wraps its input because two buttons have to sit inside one border; nothing surveyed puts an adornment inside a textarea.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls below the canvas. Turn autoSize on and type: the box grows to the ceiling and then scrolls.',
    snippet: defineSnippet({
      id: 'textarea-angular-playground',
      language: 'angular',
      label: 'A control, its label and its help',
      source: `<div slField>
  <label slFieldLabel>Observações</label>
  <textarea slTextarea [rows]="3" placeholder="Descreva o que aconteceu"></textarea>
  <span slFieldDescription>Aparece no histórico do chamado.</span>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'The block padding is derived rather than chosen — half of what is left when one line box comes out of the control height — so a one-row textarea is exactly as tall as an input of the same step, at every density.',
    snippet: defineSnippet({
      id: 'textarea-angular-sizes',
      language: 'angular',
      label: 'Three steps, and the field that outranks them',
      source: `<textarea slTextarea size="sm" [rows]="2"></textarea>
<textarea slTextarea size="lg" [rows]="2"></textarea>

<!-- Inside a field the field decides, and the control follows. -->
<div slField size="sm">
  <textarea slTextarea></textarea>
</div>`,
    }),
  },
  {
    id: 'variants',
    title: 'How much frame the control shows',
    note: 'The same three frames the single-line control paints, against the same tokens: one that takes the ground it is placed on, one that sinks into the page, and one that shows nothing until it is used.',
    snippet: defineSnippet({
      id: 'textarea-angular-variants',
      language: 'angular',
      label: 'Three frames, and a payload in monospace',
      source: `<textarea slTextarea variant="subtle"></textarea>
<textarea slTextarea variant="plain"></textarea>

<!-- Tabular figures and the monospaced family, for a payload. -->
<textarea slTextarea mono variant="subtle"></textarea>`,
    }),
  },
  {
    id: 'auto-size',
    title: 'Growing with the content',
    note: 'Nothing is measured on the main thread: CSS field-sizing grows the box, rows is the floor and maxRows the ceiling. Type past four lines in the first example and the control scrolls rather than pushing the page.',
    snippet: defineSnippet({
      id: 'textarea-angular-auto-size',
      language: 'angular',
      label: 'A floor, a ceiling, and no measurement',
      source: `<textarea slTextarea autoSize [rows]="1" [maxRows]="4"></textarea>

<!-- The ceiling has a default and cannot be removed: a control that grows
     forever pushes the page out from under the caret. -->
<textarea slTextarea autoSize></textarea>`,
    }),
  },
  {
    id: 'resize',
    title: 'The handle in the corner',
    note: 'block is the default rather than the platform’s both, because a control wider than its field breaks the field’s own grid. The handle is withdrawn entirely while autoSize is on, since the two would disagree on the next keystroke.',
    snippet: defineSnippet({
      id: 'textarea-angular-resize',
      language: 'angular',
      label: 'Three axes, and the one that withdraws it',
      source: `<textarea slTextarea resize="none"></textarea>
<textarea slTextarea resize="both"></textarea>

<!-- autoSize wins: the handle is withdrawn rather than left to fight. -->
<textarea slTextarea autoSize resize="both"></textarea>`,
    }),
  },
  {
    id: 'states',
    title: 'The four states the control paints',
    note: 'Read-only keeps full-strength ink and its handle, because the commonest thing a read-only textarea holds is a value someone has to copy; disabled loses the handle as well, since a handle on a control nobody can type in is a handle that lies.',
    snippet: defineSnippet({
      id: 'textarea-angular-states',
      language: 'angular',
      label: 'Every state unset by default',
      source: `<!-- Unstated rather than false, so the control defers to its field. -->
<textarea slTextarea invalid></textarea>
<textarea slTextarea readonly>Somente leitura</textarea>
<textarea slTextarea disabled>Desativado</textarea>`,
    }),
  },
  {
    id: 'count',
    title: 'Counting what has been typed',
    note: 'The control counts and the field draws it in the spare column of the label row, so a count that appears on the first keystroke never shares a row with the error and pushes it — which is where Angular Material puts it.',
    snippet: defineSnippet({
      id: 'textarea-angular-count',
      language: 'angular',
      label: 'A count bound to the value',
      source: `<div slField>
  <label slFieldLabel>Observações</label>
  <textarea slTextarea showCount maxlength="280" autoSize [rows]="2"></textarea>
</div>`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A pasted token with no break in it — a signed URL, a certificate, a container digest — wraps instead of taking the page’s horizontal scrollbar with it, and nothing is removed from the value.',
    snippet: defineSnippet({
      id: 'textarea-angular-content',
      language: 'angular',
      label: 'Unbreakable, translated and right-to-left',
      source: `<textarea slTextarea [rows]="3">{{ jwt }}</textarea>

<!-- overflow-wrap: anywhere in the stylesheet, so the whole string stays
     selectable, copyable and reachable with the caret. -->
<textarea slTextarea dir="rtl" [rows]="3">مرحبا بالعالم</textarea>`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'provideTextareaDefaults carries the four decisions an application takes once; exportAs reaches the instance, and textareaElement is the native element with focus, select and setSelectionRange already on it.',
    snippet: defineSnippet({
      id: 'textarea-angular-composition',
      language: 'angular',
      label: 'A token, a reactive form, and the element itself',
      source: `<!-- ControlValueAccessor: the control belongs in a form as it stands. -->
<textarea slTextarea [formControl]="notes" autoSize></textarea>

<!-- exportAs, for the element the template has to reach. -->
<textarea slTextarea #campo="slTextarea"></textarea>
<button type="button" (click)="campo.textareaElement.select()">Selecionar</button>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and what it deliberately does not',
    note: 'Enter makes a line and never submits — the difference WAI-ARIA notes between a single-line and a multi-line control — and Tab leaves the control rather than inserting a tab, so a keyboard user is never trapped in a comment box.',
    snippet: defineSnippet({
      id: 'textarea-angular-keyboard',
      language: 'angular',
      label: 'Enter makes a line; the form is submitted elsewhere',
      source: `<form (ngSubmit)="enviar()">
  <textarea slTextarea [formControl]="notes" [rows]="3"></textarea>
  <button slButton type="submit">Enviar</button>
</form>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(valueChange)',
    payload: 'ChangeRequest<string>',
    when: 'Before the value moves. The request carries the new value, the value it replaces, the reason — always "keyboard", because the control’s own editing surface is the only thing that can move it — the originating event, and cancel(), which refuses the move before anything commits.',
  },
  {
    name: 'ControlValueAccessor',
    payload: 'the form’s own value and touched state',
    when: 'Whenever the value moves and the request was not cancelled, and on blur for touched. It is the two-way binding the ecosystem expects, and the reason there is no [(value)]: a two-way binding has one slot and can carry neither a reason nor cancel().',
  },
];

export const ANGULAR_TEXTAREA_DOCS = {
  textarea: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'value',
        'string',
        '—',
        'slTextarea',
        'Present means the consumer owns the value, and it is written onto the element the way a form’s value is. Absent, the element owns it',
      ],
      [
        'defaultValue',
        'string',
        '—',
        'slTextarea',
        'What the control starts from when nobody else writes one. Read after the inputs are bound, which is the only moment it exists',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'slTextarea, provideTextareaDefaults',
        'The type step, read from the field first when there is one. The block padding is derived from it, so a one-row control matches an input of the same step at every density',
      ],
      [
        'variant',
        "'outline' | 'subtle' | 'plain'",
        'outline',
        'slTextarea, provideTextareaDefaults',
        'How much frame the control shows — the three the single-line control paints, against the same tokens',
      ],
      [
        'mono',
        'boolean',
        'false',
        'slTextarea, provideTextareaDefaults',
        'Sets the value in the monospaced family with tabular figures, for a payload, a template or a diff',
      ],
      [
        'resize',
        "'block' | 'none' | 'both'",
        'block',
        'slTextarea, provideTextareaDefaults',
        'Which way the handle may drag. block rather than the platform’s both, because a control wider than its field breaks the field’s grid. Withdrawn entirely while autoSize is on',
      ],
      [
        'autoSize',
        'boolean',
        'false',
        'slTextarea',
        'Grows with the content through CSS field-sizing rather than a measurement on the main thread, which is what cdkTextareaAutosize does. rows becomes the floor and maxRows the ceiling',
      ],
      [
        'rows',
        'number',
        '3',
        'slTextarea',
        'The starting height, and the floor while autoSize is on. Three rather than the platform’s two, because a two-row box reads as a mistyped input',
      ],
      [
        'maxRows',
        'number',
        '12',
        'slTextarea',
        'The ceiling autoSize grows to, after which the control scrolls. It cannot be removed: a control that grows forever pushes the page out from under the caret',
      ],
      [
        'showCount',
        'boolean',
        'false',
        'slTextarea',
        'Publishes the length of the value to the field around it, which draws the count in the spare column of its label row',
      ],
      [
        'countMax',
        'number',
        'maxlength',
        'slTextarea',
        'The limit the count is measured against. Set without maxlength it is a soft limit the value may pass',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'slTextarea',
        'Unstated rather than false, so the control defers to the field around it and to a disabled reactive form control. Stated, it wins, and it is the native attribute',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'slTextarea',
        'Unstated rather than false. The native readonly, which stays focusable, selectable and submitted, and keeps its handle. A static readonly the consumer wrote is read before the binding computes',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'slTextarea',
        'Unstated rather than false. Writes aria-invalid and data-invalid on the control',
      ],
      [
        'required',
        'boolean',
        '—',
        'the textarea element',
        'The element’s own attribute, never written by the family. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
    ]),
    composition: apiRows([
      [
        'the directive itself',
        'slTextarea',
        '—',
        'the consumer’s own textarea',
        'One element and one part: every native attribute, listener and form binding stays on the element the consumer wrote',
      ],
      [
        'exportAs',
        "'slTextarea'",
        '—',
        'a template',
        'Reaches the instance. textareaElement is the native element, which already has focus(), select() and setSelectionRange()',
      ],
      [
        'provideTextareaDefaults()',
        '{ size, variant, mono, resize }',
        '—',
        'an injector',
        'The four decisions an application takes once. size is the one a field outranks, so a control inside a field takes the field’s step',
      ],
      [
        'ControlValueAccessor',
        'formControl, formControlName, ngModel',
        '—',
        'slTextarea',
        'The control belongs in a reactive form and a template form as it stands. There is no Validator: the family owns no validity, and form does',
      ],
    ]),
    accessibility: [
      'There is no WAI-ARIA APG pattern for a multi-line text control: the APG lists thirty patterns and none of them is a textarea, so the sources are the HTML specification for the element and the ARIA textbox role, whose aria-multiline the native element supplies on its own.',
      'The control takes its name from the field’s label, through for pointing at the identifier the field derived, and its description through aria-describedby merged after anything the consumer wrote.',
      'aria-required, never the native required. A host binding beats a static attribute in Angular, so every value the consumer wrote — id, aria-describedby, aria-invalid, aria-required, readonly — is read before the binding computes and is never written over.',
      'Enter makes a line and never submits. WAI-ARIA records that as the difference between a single-line and a multi-line text control, and a comment box that submitted a form on Enter would lose what was being written.',
      'Tab leaves the control. Nothing is bound to a key, so a keyboard user is never held inside a comment box by a shortcut the family invented.',
      'Growing with the content is CSS rather than script, so a reader using a screen reader hears no change and a reader who has asked for reduced motion sees none: the box has a new height, and nothing animates to it.',
    ],
    snippets: [
      defineSnippet({
        id: 'textarea-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<textarea
  data-ui="textarea"
  data-part="root"
  data-size="md"
  data-variant="outline"
  data-resize="none"
  data-auto-size
  rows="2"
  style="--slotted-textarea-rows: 2; --slotted-textarea-max-rows: 6"
></textarea>`,
      }),
      defineSnippet({
        id: 'textarea-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='textarea'] {
  --slotted-textarea-border-color: var(--slotted-tone-secondary-border);
  --slotted-textarea-line-height: var(--slotted-line-height-lg);
  --slotted-textarea-rows: 4;
  --slotted-textarea-max-rows: 16;
}`,
      }),
    ],
  },
} as const;
