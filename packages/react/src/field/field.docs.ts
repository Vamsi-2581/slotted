import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
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
    "import {\n  Field,\n  FieldAction,\n  FieldControl,\n  FieldCounter,\n  FieldDefaultsProvider,\n  FieldDescription,\n  FieldError,\n  FieldHeader,\n  FieldHelp,\n  FieldIndicator,\n  FieldLabel,\n} from '@slotted/react';",
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
    part: 'header',
    element: 'div, or the element render returns',
    required: false,
    purpose:
      'The label row, when the label has company: the help, an indicator, an action and the counter. It aligns them on the label’s first baseline, wraps when it runs out of room, and puts the action and the count at its end. A field whose label stands alone writes the label on the root and no header.',
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
      'The necessity marker the label draws itself: an asterisk on a required field, (optional) on the fields a reader may skip, or both words. The glyph is aria-hidden because aria-required already carries the semantics; the words are not, because they are information.',
  },
  {
    part: 'help',
    element: 'button, fixed',
    required: false,
    purpose:
      'A circle-question glyph beside the label that opens the field’s help in a tooltip — on hover, on keyboard focus, and on a press, which pins it until a second press, Escape or a press elsewhere. A hidden node inside it carries the same words, so the button and the control are described by the help whether the tooltip is open or not.',
  },
  {
    part: 'indicator',
    element: 'span, or the element render returns',
    required: false,
    purpose:
      'What qualifies the field — Beta, Pro, New — as one or more Badges after the label. Outside the label, so the necessity mark stays against the last word; in the control’s description, so a reader on the control hears it.',
  },
  {
    part: 'action',
    element: 'button type="button", or the element render returns',
    required: false,
    purpose:
      'A link or a button at the end of the label row: Forgot password?, Generate. Accent ink that darkens a third of the way on hover with the underline drawn, two thirds on press. The field does not disable it with the control.',
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
      'The count, at the end of the label row — where Carbon puts it — and inside the header when there is one. The control publishes it and the field draws it; a page that counts words or bytes writes its own. It joins the control’s description, and carries its own data-invalid, because a count can pass its limit before validation has run.',
  },
];

const events: EventRow[] = [
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: TooltipChangeRequest)',
    when: 'On FieldHelp, before the hint opens or closes, once per transition. The reason is pointer for a hover or a press, keyboard for focus, Enter or Space, escape, blur or programmatic, and cancel() refuses the change.',
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
    note: 'The asterisk is the convention. A form where most fields are required marks the exception instead — optional writes (optional) on the fields a reader may skip and nothing on the rest — and words names both sides. All four answers come from one axis an application sets once.',
    snippet: defineSnippet({
      id: 'field-react-necessity',
      language: 'tsx',
      label: 'A mark, a word on the optional fields, both words, or nothing',
      source:
        '// The glyph is aria-hidden; aria-required on the control says it once.\n<Field required>…</Field>;\n\n// (optional) on the fields a reader may skip, nothing on the rest.\n<Field necessity="optional">…</Field>;\n\n// (required) on a required field, (optional) on one that is not.\n<Field necessity="words" required>\n  …\n</Field>;',
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
    id: 'header',
    title: 'The label row: help, indicator, action and count',
    note: 'Hover the circle, or tab to it: the hint opens. Press it and it stays until a second press, which is what a finger needs. The row is as tall as the label with or without them, aligns on the label’s baseline, and in a narrow field sends the action and the count to a line of their own.',
    snippet: defineSnippet({
      id: 'field-react-header',
      language: 'tsx',
      label: 'A header around the label and what stands beside it',
      source:
        '<Field required>\n  <FieldHeader>\n    <FieldLabel>Senha</FieldLabel>\n    <FieldHelp>No mínimo oito caracteres, com letras e números.</FieldHelp>\n    <FieldAction render={(props) => <a {...props} href="/recuperar" />}>\n      Esqueceu a senha?\n    </FieldAction>\n  </FieldHeader>\n  <FieldControl type="password" />\n</Field>;\n\n<Field>\n  <FieldHeader>\n    <FieldLabel>Endpoint da API</FieldLabel>\n    <FieldIndicator>\n      <Badge size="sm" tone="accent" variant="soft">\n        Beta\n      </Badge>\n    </FieldIndicator>\n  </FieldHeader>\n  <FieldControl />\n</Field>;',
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
        '<FieldDefaultsProvider necessityWords={{ optional: \'(opcional)\' }} necessity="words" size="sm">\n  <App />\n</FieldDefaultsProvider>;\n\n// A control the library does not own, wired without a wrapper.\nfunction MoneyInput() {\n  const field = useField();\n  return <input id={field?.ids.control} aria-describedby={field?.describedBy} />;\n}',
    }),
  },
  {
    id: 'accessibility',
    title: 'What a reader hears, in order',
    note: 'Turn a screen reader on and enter the control: the label, then “required”, then the indicator, the help behind the icon, the description, the count and the error — one name, one description in a fixed order, and no asterisk read aloud.',
    snippet: defineSnippet({
      id: 'field-react-accessibility',
      language: 'tsx',
      label: 'The identifiers, and the ones that are read',
      source:
        '<div data-ui="field" data-part="root">\n  <div data-part="header">\n    <label data-part="label" for="cnpj-control">\n      CNPJ\n      <span aria-hidden="true" data-part="mark">\n        *\n      </span>\n    </label>\n    <button aria-describedby="cnpj-help" aria-label="More information" data-part="help">\n      <span data-part="help-text" hidden id="cnpj-help">\n        Somente números.\n      </span>\n    </button>\n  </div>\n  <input\n    aria-describedby="cnpj-help cnpj-description cnpj-error"\n    aria-invalid="true"\n    aria-required="true"\n    id="cnpj-control"\n  />\n</div>;',
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
        'necessity',
        "'mark' | 'optional' | 'words' | 'none'",
        'mark',
        'Field',
        'How necessity is said: an asterisk on a required field, (optional) on the fields a reader may skip, both words, or nothing — for a form that says once that every field is required',
      ],
      [
        'necessityWords',
        '{ required?: string; optional?: string }',
        '(required) / (optional)',
        'Field, FieldDefaultsProvider',
        'The two words necessity="optional" and necessity="words" write, merged over the inherited pair so one can be replaced alone',
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
        'The base every identifier is derived from — <id>-control, <id>-label, <id>-indicator, <id>-help, <id>-description, <id>-counter, <id>-error. Generated with useId when unstated',
      ],
      [
        'children',
        'ReactNode',
        '—',
        'FieldHelp',
        'The help. Written once, it reaches the tooltip and the hidden node that describes the button and the control',
      ],
      [
        'open',
        'boolean',
        '—',
        'FieldHelp',
        'Whether the hint is showing, controlled. Pair it with onOpenChange; leave both unset and the help owns the state',
      ],
      [
        'defaultOpen',
        'boolean',
        'false',
        'FieldHelp',
        'Whether the hint starts open, read once when the help owns the state',
      ],
      [
        'side',
        "'top' | 'bottom' | 'inline-start' | 'inline-end' | 'left' | 'right'",
        'top',
        'FieldHelp',
        'Where the hint opens, flipping when there is no room',
      ],
      [
        'aria-label',
        'string',
        'helpLabel',
        'FieldHelp',
        'The accessible name of the help control. Unstated, it is the provider’s helpLabel; stated, it wins for this control alone',
      ],
      [
        'helpLabel',
        'string',
        'More information',
        'FieldDefaultsProvider, FieldGroup',
        'The accessible name of every help control under it, so an application translates it once',
      ],
      [
        'type',
        "'button' | 'submit' | 'reset'",
        'button',
        'FieldAction',
        'button by default, so the action never submits the form it sits in. A link rendered through render receives the props without it',
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
        "'glyph' | 'dot' | 'none'",
        'none',
        'FieldDescription, FieldError',
        'Which mark the message draws. A field’s messages draw none: a silhouette repeated under every control of a form is texture rather than a warning, and the tone is said by the ink and the weight of the sentence. glyph asks for the tone’s own silhouette at the type’s size and dot for one neutral bullet',
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
    events,
    composition: apiRows([
      [
        'render',
        '(props) => ReactNode',
        '—',
        'Field, FieldHeader, FieldLabel, FieldIndicator, FieldAction, FieldControl, FieldCounter',
        'Substitutes the rendered element and hands it every attribute. A textarea as the control, an output as the counter, a link as the action, a fieldset as the field. The props are typed against HTMLAttributes<HTMLElement> so they can be spread onto any element, which is what makes the substitution real. FieldHelp is fixed: its button carries the name, the description and the control of the tooltip, and all three are the family’s',
      ],
      [
        'onClick and the pointer and focus handlers',
        'native',
        '—',
        'FieldHelp, FieldAction',
        'The consumer’s handler runs first and the family’s after it, unless the consumer called preventDefault',
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
        '{ size, labelPlacement, necessity, necessityWords, helpLabel, disabled, readOnly }',
        '—',
        'a subtree',
        'The seven decisions an application takes once. FieldGroup renders one for the fields inside it, so a compact or disabled section is one attribute rather than one per field',
      ],
      [
        'ref',
        'Ref<HTMLElement>',
        '—',
        'every part',
        'Reaches the default element — on FieldHelp, the button. A part rendered through render is written by the consumer, so they attach their own ref to it. There is no imperative handle: the one state the family holds, the hint, is open and onOpenChange',
      ],
    ]),
    accessibility: [
      'There is no WAI-ARIA APG pattern for a field. Four documents cover it between them: the APG’s Providing Accessible Names and Descriptions practice (w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) for the label and the description, the HTML specification for label[for] and fieldset[disabled], and WCAG 2.2 Understanding 3.3.1 Error Identification and 3.3.2 Labels or Instructions for the error and the help.',
      'The label is associated explicitly. The APG’s naming practice records that the implicit form — wrapping the control in the label — is one some combinations of assistive technology and browser fail to treat as an accessible name at all, so the field derives an identifier and points for at it rather than nesting.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field. A consumer who wants it writes required on the control themselves and it survives, because an explicit value on the control always wins. disabled and readonly are native, because removing a control from the tab order and from submission is what those two words mean.',
      'The accessible description is the indicator, the help behind the icon, the description, the count and the error, in that order, whatever order the page wrote them in. Known slots have one correct reading order, and deriving it from registration order would make what a reader hears depend on when an effect ran. The count is there because docs/component-features.md §2.8 requires a counter related to its control by identifier.',
      'The help, the indicator and the action stand beside the label, never inside it. A button is labelable content, which HTML forbids inside a label other than the control it labels, and a press on it would reach the label and move focus to the control instead of opening the hint.',
      'The help is a toggletip. A tooltip alone opens on a coarse pointer only by a long press, because a tap is the trigger’s own action; the help has no other action, so a press opens it and a second press closes it. Its words also sit in a hidden node inside the button, which describes the button and the control while the tooltip is closed — a directly referenced hidden element still enters the description — and the tooltip itself describes nothing, so the hint is never read twice.',
      'A disabled field leaves its help and its action operable. The help is often where the reason the field is off is written.',
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
          '<div\n  data-ui="field"\n  data-part="root"\n  data-size="md"\n  data-label-placement="top"\n  data-necessity="mark"\n  data-required\n  data-invalid\n>\n  <label data-part="label" for="cnpj-control">\n    CNPJ\n    <span aria-hidden="true" data-part="mark">\n      *\n    </span>\n  </label>\n  <span data-part="counter">14/18</span>\n  <input data-part="control" id="cnpj-control" aria-invalid="true" aria-required="true" />\n  <p data-ui="inline-message" data-part="root" data-tone="secondary" id="cnpj-description">\n    <span data-part="text">Somente números.</span>\n  </p>\n</div>;',
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
