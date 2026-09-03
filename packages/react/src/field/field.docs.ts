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

export const REACT_FIELD_TOKENS = fieldTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Field decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  Field,\n  FieldControl,\n  FieldCounter,\n  FieldDefaultsProvider,\n  FieldDescription,\n  FieldError,\n  FieldLabel,\n} from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The field. Carries data-ui="field", the three axes, and data-disabled, data-invalid, data-required and data-readonly. It is its own container, so the side label reflows on the field’s width rather than the window’s.',
  },
  {
    part: 'label',
    element: 'label',
    required: false,
    purpose:
      'Names the control, with for pointing at the derived control identifier. The APG’s naming practice calls the explicit association the one with the broadest support and the implicit one — wrapping the control — the form some assistive technologies fail to treat as a name.',
  },
  {
    part: 'mark',
    element: 'span, inside the label',
    required: false,
    purpose:
      'The necessity marker the label draws itself: an asterisk, or (required) and (optional) as words. The glyph is aria-hidden because aria-required already carries the semantics; the words are not, because they are information.',
  },
  {
    part: 'control',
    element: 'input, or the element render returns',
    required: false,
    purpose:
      'A control the library does not own, wired by FieldControl. Controls this library ships read the field themselves and need no wrapper. The field gives it an identifier, a description, aria-invalid, aria-required, disabled and readonly, and overwrites nothing the consumer stated.',
  },
  {
    part: 'counter',
    element: 'span, or the element render returns',
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
      id: 'field-react-playground',
      language: 'tsx',
      label: 'A field, its label and its help',
      source:
        '<Field required>\n  <FieldLabel>E-mail</FieldLabel>\n  <FieldControl type="email" />\n  <FieldDescription>Usaremos este endereço para a cobrança.</FieldDescription>\n</Field>;',
    }),
  },
  {
    id: 'necessity',
    title: 'Saying which answers are required',
    note: 'The asterisk is the convention; the words are what a form of mostly optional fields needs, because marking the two that are required leaves the rest ambiguous. Both forms come from the same axis.',
    snippet: defineSnippet({
      id: 'field-react-necessity',
      language: 'tsx',
      label: 'A mark, two words, or nothing',
      source:
        '// The glyph is aria-hidden; aria-required on the control says it once.\n<Field required>…</Field>;\n\n// (required) on a required field, (optional) on one that is not.\n<Field required requiredMark="text">\n  …\n</Field>;\n<Field requiredMark="text">…</Field>;',
    }),
  },
  {
    id: 'placement',
    title: 'The label above the control, or beside it',
    note: 'Drag the narrow column’s edge, or read it at 360 pixels: the side label stacks below 320 pixels of the field’s own width, so the same field reflows in a drawer and stays beside its control in a page grid.',
    snippet: defineSnippet({
      id: 'field-react-placement',
      language: 'tsx',
      label: 'A side label that stacks when the field is narrow',
      source:
        '<Field labelPlacement="side">\n  <FieldLabel>Razão social</FieldLabel>\n  <FieldControl />\n</Field>;',
    }),
  },
  {
    id: 'sizes',
    title: 'The step the field sits at',
    note: 'Three steps matching the control the field wraps, and every one of them reads the control type scale — set the toolbar to dense and the label, the message and the counter step down together.',
    snippet: defineSnippet({
      id: 'field-react-sizes',
      language: 'tsx',
      label: 'Three steps, all answering density',
      source:
        '<Field size="sm">…</Field>;\n<Field size="md">…</Field>;\n<Field size="lg">…</Field>;',
    }),
  },
  {
    id: 'states',
    title: 'The four states a field can be in',
    note: 'The label never turns red when the field is invalid: the error already says so in words and in colour, and a red marker on a red label is a marker nobody can see. Read-only stays legible and focusable; disabled is muted to a measured colour rather than faded.',
    snippet: defineSnippet({
      id: 'field-react-states',
      language: 'tsx',
      label: 'Every state unset by default, and native where the word means native',
      source:
        '// aria-invalid on the control, and the error joins its aria-describedby.\n<Field invalid required>\n  <FieldLabel>CNPJ</FieldLabel>\n  <FieldControl />\n  <FieldError>Faltam seis dígitos.</FieldError>\n</Field>;\n\n// disabled and readOnly are the native attributes; required is aria-required.\n<Field disabled>…</Field>;\n<Field readOnly>…</Field>;',
    }),
  },
  {
    id: 'messages',
    title: 'Help, errors, and the line held open for one',
    note: 'Both messages are inline-message roots, so the error carries a clipped “Error:” a screen reader reads first. The right-hand column renders its error unconditionally with reserve, so the button below it does not move when the error arrives.',
    snippet: defineSnippet({
      id: 'field-react-messages',
      language: 'tsx',
      label: 'A description, an error, and a warning that is not one',
      source:
        '<Field invalid>\n  <FieldControl />\n  <FieldDescription>Somente números.</FieldDescription>\n  <FieldError reserve>{errors.cnpj}</FieldError>\n</Field>;\n\n// A warning that does not block submission is the same part in another tone.\n<FieldError tone="warning">A senha é válida, mas fácil de adivinhar.</FieldError>;',
    }),
  },
  {
    id: 'counter',
    title: 'Counting what the page is counting',
    note: 'The count sits in the label row’s spare column, so it never shares a row with the error and never adds one. It turns at its own limit rather than at the field’s, because a count passes its maximum before validation runs.',
    snippet: defineSnippet({
      id: 'field-react-counter',
      language: 'tsx',
      label: 'The page owns the number; the field owns where it sits',
      source:
        'const over = value.length > 140;\n\n<Field invalid={over}>\n  <FieldLabel>Descrição pública</FieldLabel>\n  <FieldCounter invalid={over}>{`${value.length}/140`}</FieldCounter>\n  <FieldControl render={(props) => <textarea {...props} />} />\n</Field>;',
    }),
  },
  {
    id: 'content',
    title: 'Content the field did not choose',
    note: 'A German compound with no break opportunity, a container digest in the description, and an Arabic field in a right-to-left document — the label breaks rather than sliding under the control, and the necessity word never breaks.',
    snippet: defineSnippet({
      id: 'field-react-content',
      language: 'tsx',
      label: 'A label no language can break, and a mirrored field',
      source:
        '<Field dir="rtl" labelPlacement="side" lang="ar">\n  <FieldLabel>رقم التعريف الضريبي</FieldLabel>\n  <FieldControl />\n</Field>;',
    }),
  },
  {
    id: 'composition',
    title: 'Composition and escape hatches',
    note: 'The provider sets the whole application’s fields once, render substitutes any part’s element, and useField lets a control this library does not own take the wiring without a wrapper around it.',
    snippet: defineSnippet({
      id: 'field-react-composition',
      language: 'tsx',
      label: 'One decision for the application, and one control of your own',
      source:
        '<FieldDefaultsProvider necessityWords={{ optional: \'(opcional)\' }} requiredMark="text" size="sm">\n  <App />\n</FieldDefaultsProvider>;\n\n// A control the library does not own, wired without a wrapper.\nfunction MoneyInput() {\n  const field = useField();\n  return <input id={field?.ids.control} aria-describedby={field?.describedBy} />;\n}',
    }),
  },
  {
    id: 'accessibility',
    title: 'What a reader hears, in order',
    note: 'Turn a screen reader on and enter the control: the label, then “required”, then the help, then the error — one name, one description built from two elements in a fixed order, and no asterisk read aloud.',
    snippet: defineSnippet({
      id: 'field-react-accessibility',
      language: 'tsx',
      label: 'The four identifiers, and the two that are read',
      source:
        '<div data-ui="field" data-part="root">\n  <label data-part="label" for="cnpj-control">\n    CNPJ\n    <span aria-hidden="true" data-part="mark">\n      *\n    </span>\n  </label>\n  <input\n    aria-describedby="cnpj-description cnpj-error"\n    aria-invalid="true"\n    aria-required="true"\n    id="cnpj-control"\n  />\n</div>;',
    }),
  },
];

export const REACT_FIELD_DOCS = {
  field: {
    imports,
    anatomy,
    scenes,
    api: apiRows([
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'Field',
        'The type step, matching the control the field wraps. Label, message and counter all read the control type scale, which the theme restates per density',
      ],
      [
        'labelPlacement',
        "'top' | 'side'",
        'top',
        'Field',
        'Where the label sits. side reflows to top below 320 pixels of the field’s own inline size, which is a container query rather than a viewport one',
      ],
      [
        'requiredMark',
        "'mark' | 'text' | 'none'",
        'mark',
        'Field',
        'How necessity is said: an asterisk, the words (required) and (optional), or nothing — for a form that says once that every field is required',
      ],
      [
        'necessityWords',
        '{ required?: string; optional?: string }',
        '(required) / (optional)',
        'Field, FieldDefaultsProvider',
        'The two words requiredMark="text" writes, merged over the inherited pair so one can be replaced alone',
      ],
      [
        'required',
        'boolean',
        '—',
        'Field',
        'Unstated rather than false. Writes aria-required on the control and never the native required, which would engage browser constraint validation and change submit behaviour',
      ],
      [
        'invalid',
        'boolean',
        '—',
        'Field, FieldCounter',
        'On the field: unstated rather than false, writing aria-invalid on the control and data-invalid on the field, with the label deliberately not repainted. On the counter: the count has passed its limit, which happens before validation runs, so it is the counter’s own state and defaults to false',
      ],
      [
        'disabled',
        'boolean',
        'from the group, then the provider',
        'Field, FieldDefaultsProvider',
        'Unstated rather than false, so a field defers to the FieldGroup around it. Stated, it wins, and it reaches the control as the native attribute',
      ],
      [
        'readOnly',
        'boolean',
        'from the group, then the provider',
        'Field, FieldDefaultsProvider',
        'Unstated rather than false. Reaches the control as the native readonly, which stays focusable and copyable',
      ],
      [
        'id',
        'string',
        'generated',
        'Field',
        'The base every identifier is derived from — <id>-control, <id>-label, <id>-description, <id>-error. Generated with useId when unstated',
      ],
      [
        'tone',
        "'accent' | 'secondary' | 'success' | 'warning' | 'danger'",
        'secondary on FieldDescription, danger on FieldError',
        'FieldDescription, FieldError',
        'Both messages are inline-message roots and take its five tones, so a warning that does not block submission is the same part in another tone',
      ],
      [
        'mark',
        "'glyph' | 'dot'",
        'dot',
        'FieldDescription, FieldError',
        'Which mark the message draws. A field’s messages are bullets in the tone’s ink, so a description and an error start on one left edge; glyph asks for the tone’s own silhouette back',
      ],
      [
        'live',
        "'off' | 'polite' | 'assertive'",
        'off',
        'FieldDescription, FieldError',
        'Whether the message announces itself. off by default, because a message already on the page when it loads is announced by nothing whatever role it carries',
      ],
      [
        'reserve',
        'boolean',
        'false',
        'FieldDescription, FieldError',
        'Holds one line box open whether or not there is a message, so a form that renders its error unconditionally does not move when the error arrives',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props) => ReactNode',
        '—',
        'Field, FieldLabel, FieldControl, FieldCounter',
        'Substitutes the rendered element and hands it every attribute. A textarea as the control, an output as the counter, a fieldset as the field. The props are typed against HTMLAttributes<HTMLElement> so they can be spread onto any element, which is what makes the substitution real',
      ],
      [
        'useField()',
        '() => FieldContextValue | undefined',
        '—',
        'any component inside a Field',
        'The identifiers, the description and the four states, so a control this library does not own wires itself instead of being wrapped. undefined outside a field, which is what lets the same control work alone',
      ],
      [
        'FieldDefaultsProvider',
        '{ size, labelPlacement, requiredMark, necessityWords, disabled, readOnly }',
        '—',
        'a subtree',
        'The six decisions an application takes once. FieldGroup renders one for the fields inside it, so a compact or disabled section is one attribute rather than one per field',
      ],
      [
        'ref',
        'Ref<HTMLElement>',
        '—',
        'every part',
        'Reaches the default element. A part rendered through render is written by the consumer, so they attach their own ref to it. There is no imperative handle either way: the family holds no state and moves nothing',
      ],
    ]),
    accessibility: [
      'There is no WAI-ARIA APG pattern for a field. Four documents cover it between them: the APG’s Providing Accessible Names and Descriptions practice (w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) for the label and the description, the HTML specification for label[for] and fieldset[disabled], and WCAG 2.2 Understanding 3.3.1 Error Identification and 3.3.2 Labels or Instructions for the error and the help.',
      'The label is associated explicitly. The APG’s naming practice records that the implicit form — wrapping the control in the label — is one some combinations of assistive technology and browser fail to treat as an accessible name at all, so the field derives an identifier and points for at it rather than nesting.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field. A consumer who wants it writes required on the control themselves and it survives, because an explicit value on the control always wins. disabled and readonly are native, because removing a control from the tab order and from submission is what those two words mean.',
      'The accessible description is the help and then the error, in that order, whatever order the page wrote them in. Two known slots have one correct reading order, and deriving it from registration order would make what a reader hears depend on when an effect ran.',
      'The necessity marker is hidden and the necessity words are not. A reader working through a form of twenty required fields does not need to hear “asterisk” twenty times, and aria-required already says it; (optional), by contrast, is information nobody else supplies.',
      'The error is text in the flow of the page, which is what WCAG 2.2 SC 3.3.1 requires. It is never a tooltip, and because it is an inline-message it also carries the severity as a clipped word — so a reader who cannot see the red ink still hears “Error:” before the sentence.',
      'live defaults to off. A message already present when the page finishes loading is announced by nothing whatever role it carries, so a form that raises the error after submit sets live="polite" and the reader hears it once rather than on every render.',
    ],
    snippets: [
      defineSnippet({
        id: 'field-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source:
          '<div\n  data-ui="field"\n  data-part="root"\n  data-size="md"\n  data-label-placement="top"\n  data-required-mark="mark"\n  data-required\n  data-invalid\n>\n  <label data-part="label" for="cnpj-control">\n    CNPJ\n    <span aria-hidden="true" data-part="mark">\n      *\n    </span>\n  </label>\n  <span data-part="counter">14/18</span>\n  <input data-part="control" id="cnpj-control" aria-invalid="true" aria-required="true" />\n  <p data-ui="inline-message" data-part="root" data-tone="secondary" id="cnpj-description">\n    <span data-part="text">Somente números.</span>\n  </p>\n</div>;',
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
