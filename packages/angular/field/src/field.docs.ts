import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import fieldTokens from '@slotted/styles/field/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_FIELD_TOKENS = fieldTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Field decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  provideFieldDefaults,\n  SlField,\n  SlFieldControl,\n  SlFieldCounter,\n  SlFieldDescription,\n  SlFieldError,\n  SlFieldLabel,\n} from '@slotted/angular/field';",
  selector: '[slField]',
  exportAs: 'slField',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element the consumer wrote — a div',
    required: true,
    purpose:
      'The field. Carries data-ui="field", the three axes, and data-disabled, data-invalid, data-required and data-readonly. It is its own container, so the side label reflows on the field’s width rather than the window’s.',
  },
  {
    part: 'label',
    element: 'label[slFieldLabel]',
    required: false,
    purpose:
      'Names the control, with for pointing at the derived control identifier. The APG’s naming practice calls the explicit association the one with the broadest support and the implicit one — wrapping the control — the form some assistive technologies fail to treat as a name.',
  },
  {
    part: 'mark',
    element: 'span, drawn inside the label',
    required: false,
    purpose:
      'The necessity marker the label draws itself: an asterisk, or (required) and (optional) as words. The glyph is aria-hidden because aria-required already carries the semantics; the words are not, because they are information.',
  },
  {
    part: 'control',
    element: 'the element carrying slFieldControl',
    required: false,
    purpose:
      'A control the library does not own. Controls this library ships inject SlField and need no directive. The field gives it an identifier, a description, aria-invalid, aria-required, disabled and readonly, and overwrites nothing the consumer wrote — each written value is read with HostAttributeToken before the binding is computed.',
  },
  {
    part: 'counter',
    element: 'the element carrying slFieldCounter',
    required: false,
    purpose:
      'A count the page owns, at the end of the label row — where Carbon puts it. It carries its own data-invalid, because a count can pass its limit before validation has run.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One field with every axis on it, driven by the controls below the canvas. Switch labelPlacement to side and narrow the window: below 320 pixels of its own width the field stacks again.',
    snippet: defineSnippet({
      id: 'field-angular-playground',
      language: 'angular',
      label: 'A field, its label and its help',
      source:
        '<div slField required>\n  <label slFieldLabel>E-mail</label>\n  <input slFieldControl type="email" />\n  <span slFieldDescription>Usaremos este endereço para a cobrança.</span>\n</div>',
    }),
  },
  {
    id: 'necessity',
    title: 'Saying which answers are required',
    note: 'The asterisk is the convention; the words are what a form of mostly optional fields needs, because marking the two that are required leaves the rest ambiguous. Both forms come from the same input.',
    snippet: defineSnippet({
      id: 'field-angular-necessity',
      language: 'angular',
      label: 'A mark, two words, or nothing',
      source:
        '<div slField required>…</div>\n<div slField required requiredMark="text">…</div>\n<div slField requiredMark="text">…</div>',
    }),
  },
  {
    id: 'placement',
    title: 'The label above the control, or beside it',
    note: 'Drag the narrow column’s edge, or read it at 360 pixels: the side label stacks below 320 pixels of the field’s own width, so the same field reflows in a drawer and stays beside its control in a page grid.',
    snippet: defineSnippet({
      id: 'field-angular-placement',
      language: 'angular',
      label: 'A side label that stacks when the field is narrow',
      source:
        '<div slField labelPlacement="side">\n  <label slFieldLabel>Razão social</label>\n  <input slFieldControl />\n</div>',
    }),
  },
  {
    id: 'sizes',
    title: 'The step the field sits at',
    note: 'Three steps matching the control the field wraps, and every one of them reads the control type scale — set the toolbar to dense and the label, the message and the counter step down together.',
    snippet: defineSnippet({
      id: 'field-angular-sizes',
      language: 'angular',
      label: 'Three steps, all answering density',
      source:
        '<div slField size="sm">…</div>\n<div slField size="md">…</div>\n<div slField size="lg">…</div>',
    }),
  },
  {
    id: 'states',
    title: 'The four states a field can be in',
    note: 'The label never turns red when the field is invalid: the error already says so in words and in colour, and a red marker on a red label is a marker nobody can see. Read-only stays legible and focusable; disabled is muted to a measured colour rather than faded.',
    snippet: defineSnippet({
      id: 'field-angular-states',
      language: 'angular',
      label: 'Every state unset by default, and native where the word means native',
      source:
        '<div slField invalid required>\n  <label slFieldLabel>CNPJ</label>\n  <input slFieldControl />\n  <span slFieldError>Faltam seis dígitos.</span>\n</div>\n\n<div slField disabled>…</div>\n<div slField readOnly>…</div>',
    }),
  },
  {
    id: 'messages',
    title: 'Help, errors, and the line held open for one',
    note: 'Both messages are inline-message roots the field renders around what the page wrote, so the error carries a clipped “Error:” a screen reader reads first. The right-hand column keeps its line with reserve, so the button below does not move when the error arrives.',
    snippet: defineSnippet({
      id: 'field-angular-messages',
      language: 'angular',
      label: 'A description, an error, and a warning that is not one',
      source:
        '<div slField [invalid]="submitted">\n  <input slFieldControl />\n  <span slFieldDescription>Somente números.</span>\n  <span slFieldError reserve live="polite">{{ errors.cnpj }}</span>\n</div>\n\n<span slFieldError tone="warning">A senha é válida, mas fácil de adivinhar.</span>',
    }),
  },
  {
    id: 'counter',
    title: 'Counting what the page is counting',
    note: 'The count sits in the label row’s spare column, so it never shares a row with the error and never adds one. It turns at its own limit rather than at the field’s, because a count passes its maximum before validation runs.',
    snippet: defineSnippet({
      id: 'field-angular-counter',
      language: 'angular',
      label: 'The page owns the number; the field owns where it sits',
      source:
        '<div slField [invalid]="value.length > 140">\n  <label slFieldLabel>Descrição pública</label>\n  <span slFieldCounter [invalid]="value.length > 140">{{ value.length }}/140</span>\n  <textarea slFieldControl [(ngModel)]="value" rows="3"></textarea>\n</div>',
    }),
  },
  {
    id: 'content',
    title: 'Content the field did not choose',
    note: 'A German compound with no break opportunity, a container digest in the description, and an Arabic field in a right-to-left document — the label breaks rather than sliding under the control, and the necessity word never breaks.',
    snippet: defineSnippet({
      id: 'field-angular-content',
      language: 'angular',
      label: 'A label no language can break, and a mirrored field',
      source:
        '<div slField labelPlacement="side" lang="ar" dir="rtl">\n  <label slFieldLabel>رقم التعريف الضريبي</label>\n  <input slFieldControl />\n</div>',
    }),
  },
  {
    id: 'composition',
    title: 'Composition and escape hatches',
    note: 'provideFieldDefaults sets the whole application’s fields once, exportAs hands a template the identifiers the field derived, and slFieldControl wires a control the library does not own without wrapping it in anything.',
    snippet: defineSnippet({
      id: 'field-angular-composition',
      language: 'ts',
      label: 'One decision for the application, and one control of your own',
      source:
        "bootstrapApplication(App, {\n  providers: [\n    provideFieldDefaults({\n      size: 'sm',\n      requiredMark: 'text',\n      necessityWords: { optional: '(opcional)' },\n    }),\n  ],\n});",
    }),
  },
  {
    id: 'accessibility',
    title: 'What a reader hears, in order',
    note: 'Turn a screen reader on and enter the control: the label, then “required”, then the help, then the error — one name, one description built from two elements in a fixed order, and no asterisk read aloud.',
    snippet: defineSnippet({
      id: 'field-angular-accessibility',
      language: 'angular',
      label: 'The four identifiers, and the two that are read',
      source:
        '<div data-ui="field" data-part="root">\n  <label data-part="label" for="cnpj-control">\n    CNPJ<span aria-hidden="true" data-part="mark">*</span>\n  </label>\n  <input\n    data-part="control"\n    id="cnpj-control"\n    aria-describedby="cnpj-description cnpj-error"\n    aria-invalid="true"\n    aria-required="true"\n  />\n</div>',
    }),
  },
];

export const ANGULAR_FIELD_DOCS = {
  field: {
    imports,
    anatomy,
    scenes,
    api: apiRows([
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'slField',
        'The type step, matching the control the field wraps. Label, message and counter all read the control type scale, which the theme restates per density',
      ],
      [
        'labelPlacement',
        "'top' | 'side'",
        'top',
        'slField',
        'Where the label sits. side reflows to top below 320 pixels of the field’s own inline size, which is a container query rather than a viewport one',
      ],
      [
        'requiredMark',
        "'mark' | 'text' | 'none'",
        'mark',
        'slField',
        'How necessity is said: an asterisk, the words (required) and (optional), or nothing — for a form that says once that every field is required',
      ],
      [
        'necessityWords',
        '{ required?: string; optional?: string }',
        '(required) / (optional)',
        'slField, provideFieldDefaults',
        'The two words requiredMark="text" writes, merged over the inherited pair so one can be replaced alone',
      ],
      [
        'required',
        'boolean',
        '—',
        'slField',
        'Unstated rather than false. Reaches the control as aria-required and never as the native required, which would engage browser constraint validation and change submit behaviour',
      ],
      [
        'invalid',
        'boolean',
        '—',
        'slField, slFieldCounter',
        'On the field: unstated rather than false, writing aria-invalid on the control and data-invalid on the field, with the label deliberately not repainted. On the counter: the count has passed its limit, which happens before validation runs, so it is the counter’s own state and defaults to false',
      ],
      [
        'disabled',
        'boolean',
        'from the group, then the token',
        'slField, provideFieldDefaults',
        'Unstated rather than false, so a field defers to the slFieldGroup around it. Stated, it wins, and it reaches the control as the native attribute',
      ],
      [
        'readOnly',
        'boolean',
        'from the group, then the token',
        'slField, provideFieldDefaults',
        'Unstated rather than false. Reaches the control as the native readonly, which stays focusable and copyable',
      ],
      [
        'id',
        'string',
        'generated',
        'slField',
        'A static attribute, read with HostAttributeToken, that becomes the base for <id>-control, <id>-label, <id>-description and <id>-error. Generated by an application-scoped factory when unstated, so two applications in one server process do not collide',
      ],
      [
        'tone',
        "'accent' | 'secondary' | 'success' | 'warning' | 'danger'",
        'secondary on slFieldDescription, danger on slFieldError',
        'slFieldDescription, slFieldError',
        'Both messages are inline-message roots and take its five tones, so a warning that does not block submission is the same part in another tone',
      ],
      [
        'mark',
        "'glyph' | 'dot'",
        'glyph',
        'slFieldDescription, slFieldError',
        'Which mark the message draws. A field’s messages draw the tone’s own silhouette at the type’s size: help has none, an error draws the same mark as the alert about it; dot asks for one neutral bullet instead',
      ],
      [
        'live',
        "'off' | 'polite' | 'assertive'",
        'off',
        'slFieldDescription, slFieldError',
        'Whether the message announces itself. off by default, because a message already on the page when it loads is announced by nothing whatever role it carries',
      ],
      [
        'reserve',
        'boolean',
        'false',
        'slFieldDescription, slFieldError',
        'Holds one line box open whether or not there is a message, so a form that renders its error unconditionally does not move when the error arrives',
      ],
    ]),
    composition: apiRows([
      [
        'exportAs="slField"',
        'SlField',
        '—',
        'slField',
        'Hands the template the instance, so a page can point its own element at ids().control, ids().description or ids().error without inventing an identifier. There is no imperative method beyond it: the family holds no state and moves nothing',
      ],
      [
        'slFieldControl',
        'directive',
        '—',
        'any control element',
        'Wires a control the library does not own, on the consumer’s own element. Controls this library ships inject SlField themselves and need no directive, because one that wires itself cannot be written wrong',
      ],
      [
        'provideFieldDefaults()',
        '{ size, labelPlacement, requiredMark, necessityWords, disabled, readOnly }',
        '—',
        'an application or a route',
        'The six decisions an application takes once. slFieldGroup answers the same source for its own subtree, so a compact or disabled section is one attribute rather than one per field',
      ],
      [
        'ng-content',
        'projected content',
        '—',
        'slField',
        'The label, the counter and the two message markers are selected by name; everything else — the control, and anything beside it — is projected as written',
      ],
    ]),
    accessibility: [
      'There is no WAI-ARIA APG pattern for a field. Four documents cover it between them: the APG’s Providing Accessible Names and Descriptions practice (w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) for the label and the description, the HTML specification for label[for] and fieldset[disabled], and WCAG 2.2 Understanding 3.3.1 Error Identification and 3.3.2 Labels or Instructions for the error and the help.',
      'The label is associated explicitly. The APG’s naming practice records that the implicit form — wrapping the control in the label — is one some combinations of assistive technology and browser fail to treat as an accessible name at all, so the field derives an identifier and points for at it rather than nesting.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field. A consumer who writes required on the control keeps it, because every written attribute is read with HostAttributeToken before the binding that would replace it. disabled and readonly are native, because removing a control from the tab order and from submission is what those two words mean.',
      'The accessible description is the help and then the error, in that order, whatever order the page wrote them in. Two known slots have one correct reading order, so the field states it rather than reading it from the DOM.',
      'The necessity marker is hidden and the necessity words are not. A reader working through a form of twenty required fields does not need to hear “asterisk” twenty times, and aria-required already says it; (optional), by contrast, is information nobody else supplies.',
      'The error is text in the flow of the page, which is what WCAG 2.2 SC 3.3.1 requires. It is never a tooltip, and because it is an inline-message it also carries the severity as a clipped word — so a reader who cannot see the red ink still hears “Error:” before the sentence.',
      'live defaults to off. A message already present when the page finishes loading is announced by nothing whatever role it carries, so a form that raises the error after submit writes live="polite" and the reader hears it once.',
    ],
    snippets: [
      defineSnippet({
        id: 'field-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source:
          '<div\n  data-ui="field"\n  data-part="root"\n  data-size="md"\n  data-label-placement="top"\n  data-required-mark="mark"\n  data-required\n  data-invalid\n>\n  <label data-part="label" for="cnpj-control">\n    CNPJ<span aria-hidden="true" data-part="mark">*</span>\n  </label>\n  <span data-part="counter">14/18</span>\n  <input data-part="control" id="cnpj-control" aria-invalid="true" aria-required="true" />\n  <p data-ui="inline-message" data-part="root" data-tone="secondary" id="cnpj-description">\n    <span data-part="text">Somente números.</span>\n  </p>\n</div>',
      }),
      defineSnippet({
        id: 'field-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source:
          "[data-ui='field'] {\n  --slotted-field-row-gap: var(--slotted-space-2);\n  --slotted-field-column-gap: var(--slotted-space-6);\n  --slotted-field-label-inline-size: 10rem;\n  --slotted-field-mark-color: var(--slotted-tone-accent-text);\n}",
      }),
    ],
  },
} as const;
