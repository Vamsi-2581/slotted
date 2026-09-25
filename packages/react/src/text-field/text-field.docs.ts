import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import textFieldTokens from '@slotted/styles/text-field/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_TEXT_FIELD_TOKENS = textFieldTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Text Field decision',
}));

const imports: ReferenceImport = {
  source: "import { TextField, TextFieldDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The frame. Carries data-ui="text-field", the two axes, and data-disabled, data-invalid and data-readonly. It has no role: a textbox may hold only non-interactive children, so the buttons are the control’s siblings and the box around them announces nothing. className and style reach this element.',
  },
  {
    part: 'input',
    element: 'input',
    required: true,
    purpose:
      'The control. Holds the value, the identifier and every native attribute a consumer wrote — type, autoComplete, inputMode, enterKeyHint, pattern, maxLength, name, form, required. ref reaches it, so focus(), select() and setSelectionRange() need no handle of their own.',
  },
  {
    part: 'start',
    element: 'span',
    required: false,
    purpose:
      'An adornment before the value in the reading direction: a currency mark, an icon, an @. It is its own bidi run, so R$ stays R$ in a right-to-left document, and any icon inside it is sized from the control’s own glyph scale.',
  },
  {
    part: 'end',
    element: 'span',
    required: false,
    purpose: 'An adornment after the value in the reading direction: a unit, a domain, a suffix.',
  },
  {
    part: 'clear',
    element: 'button',
    required: false,
    purpose:
      'Empties the value with reason "clear" and returns focus to the control. Drawn only when there is something to clear and the reader may change it, and never smaller than 24 CSS pixels.',
  },
  {
    part: 'reveal',
    element: 'button',
    required: false,
    purpose:
      'Turns a password from dots into characters and back, holding the caret where it was. Its name does not change with its state — the APG’s rule for a toggle — and aria-pressed carries the state.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls below the canvas. Type into it: the clear button appears only once there is something to clear.',
    snippet: defineSnippet({
      id: 'text-field-react-playground',
      language: 'tsx',
      label: 'A control, its label and its help',
      source: `<Field>
  <FieldLabel>E-mail</FieldLabel>
  <TextField type="email" placeholder="voce@empresa.com.br" clearable />
  <FieldDescription>Usaremos este endereço para a cobrança.</FieldDescription>
</Field>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'Three steps, and inside a field the control takes the field’s rather than its own: a small field holding a medium control is a field and a control disagreeing about one row.',
    snippet: defineSnippet({
      id: 'text-field-react-sizes',
      language: 'tsx',
      label: 'Three steps, all answering density',
      source: `<TextField size="sm" />;
<TextField size="md" />;
<TextField size="lg" />;

// Inside a field the field decides, and the control follows.
<Field size="sm">
  <TextField />
</Field>;`,
    }),
  },
  {
    id: 'variants',
    title: 'How much frame the control shows',
    note: 'outline takes the ground it is placed on, subtle sinks into the page, and plain shows nothing until the pointer or the caret arrives — which is what a dense table cell needs.',
    snippet: defineSnippet({
      id: 'text-field-react-variants',
      language: 'tsx',
      label: 'Three frames, one box',
      source: `<TextField variant="outline" />;
<TextField variant="subtle" />;

// A cell that is only a control while it is being used. The box never
// changes, so the row does not reflow when the pointer crosses it.
<TextField variant="plain" mono />;`,
    }),
  },
  {
    id: 'adornments',
    title: 'What sits inside the border',
    note: 'start and end name the reading direction rather than a side, so the currency mark stays before the amount in Arabic as well. Neither of them is ever squeezed: the value gives up width first.',
    snippet: defineSnippet({
      id: 'text-field-react-adornments',
      language: 'tsx',
      label: 'A mark before the value and a unit after it',
      source: `<TextField start="R$" end="BRL" inputMode="decimal" />;

// Anything renders: an icon, a kbd, a button, a select.
<TextField
  start={
    <Icon>
      <Search />
    </Icon>
  }
  type="search"
/>;`,
    }),
  },
  {
    id: 'actions',
    title: 'The two buttons the family draws',
    note: 'Both are real buttons inside the frame, both keep the caret, and both are held to the 24-pixel minimum. Tab into the field and press Tab again: the ring moves to the button rather than staying around the box.',
    snippet: defineSnippet({
      id: 'text-field-react-actions',
      language: 'tsx',
      label: 'Clear, and reveal',
      source: `// Emits onValueChange with reason "clear", then focuses the control.
<TextField clearable defaultValue="nota fiscal 2026" type="search" />;

// aria-pressed carries the state; the label never changes with it.
<TextField revealable type="password" autoComplete="current-password" />;`,
    }),
  },
  {
    id: 'states',
    title: 'The four states the frame paints',
    note: 'Read-only keeps full-strength ink and only its ground changes, because the value is real and still submitted; disabled is muted to a measured colour rather than faded, so a disabled form still says what it holds.',
    snippet: defineSnippet({
      id: 'text-field-react-states',
      language: 'tsx',
      label: 'Every state unset by default, and native where the word means native',
      source: `// Unstated rather than false, so the control defers to its field.
<TextField invalid />;
<TextField readOnly defaultValue="Somente leitura" />;
<TextField disabled defaultValue="Desativado" />;

// A control inside a disabled fieldset is painted too, because the
// stylesheet matches :disabled beside the attribute.`,
    }),
  },
  {
    id: 'count',
    title: 'Counting what has been typed',
    note: 'The control counts and the field places it, in the spare column of the label row. Pass countMax without maxLength and the limit becomes a soft one: the value may pass it, and the counter turns before validation runs.',
    snippet: defineSnippet({
      id: 'text-field-react-count',
      language: 'tsx',
      label: 'A hard limit, and a soft one',
      source: `<Field>
  <FieldLabel>Assunto</FieldLabel>
  <TextField showCount maxLength={60} />
</Field>;

// A limit the browser does not enforce: the value may pass it.
<Field>
  <TextField showCount countMax={16} />
</Field>;`,
    }),
  },
  {
    id: 'types',
    title: 'What kind of text this is',
    note: 'type is the element’s own, and so is everything that travels with it. A phone field that offers the wrong keyboard on a phone is a field nobody fills in twice.',
    snippet: defineSnippet({
      id: 'text-field-react-types',
      language: 'tsx',
      label: 'The six types, and the attributes that go with them',
      source: `<TextField type="email" autoComplete="email" inputMode="email" />;
<TextField type="tel" autoComplete="tel" inputMode="tel" />;
<TextField type="url" inputMode="url" enterKeyHint="go" />;
<TextField type="search" clearable enterKeyHint="search" />;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A value longer than the control ellipsises rather than clipping mid-glyph; an unbroken token scrolls, which is the platform’s answer; and at 240 pixels the value surrenders width while the adornments keep their target size.',
    snippet: defineSnippet({
      id: 'text-field-react-content',
      language: 'tsx',
      label: 'Long, translated and right-to-left',
      source: `<TextField defaultValue="Kraftfahrzeug-Haftpflichtversicherungsnummer-2026" />;

// Nothing is removed from the DOM: the whole value stays selectable,
// copyable and reachable with the caret.
<TextField dir="rtl" defaultValue="مرحبا بالعالم" clearable />;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The provider carries the five decisions an application takes once; render substitutes the frame; ref reaches the element, which already has focus, select and setSelectionRange.',
    snippet: defineSnippet({
      id: 'text-field-react-composition',
      language: 'tsx',
      label: 'A provider, a ref, and a substituted frame',
      source: `<TextFieldDefaultsProvider variant="subtle" clearLabel="Limpar">
  <TextField clearable />
</TextFieldDefaultsProvider>;

const ref = useRef<HTMLInputElement>(null);
<TextField ref={ref} onFocus={() => ref.current?.select()} />;

// The frame becomes the consumer's own element, with every attribute.
<TextField render={(props) => <label {...props} />} />;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and what it deliberately does not',
    note: 'Tab reaches the value, then each button in turn. Nothing is bound to Escape: some user agents clear a search input on it, and a control that swallowed the key inside a dialog would be one a keyboard user cannot leave.',
    snippet: defineSnippet({
      id: 'text-field-react-keyboard',
      language: 'tsx',
      label: 'No key is bound, and the buttons are real buttons',
      source: `// Enter submits the form the element belongs to — the platform's
// behaviour for a single-line control, left alone.
<form onSubmit={onSubmit}>
  <TextField name="q" type="search" clearable />
</form>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: string, request: ChangeRequest<string>)',
    when: 'Before the value moves. The request carries the new value, the value it replaces, the reason — "keyboard" for an edit made in the control, "clear" for the clear button — the originating event, and cancel(), which refuses the move before anything commits.',
  },
  {
    name: 'onRevealedChange',
    payload: '(revealed: boolean, request: ChangeRequest<boolean>)',
    when: 'Before the password toggle moves, with reason "pointer" or "keyboard" recovered from the click. A form that hides the password again on blur owns this bit.',
  },
  {
    name: 'onChange, onInput, onFocus, onBlur',
    payload: 'the element’s own events',
    when: 'Whenever the element fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, and always runs.',
  },
];

export const REACT_TEXT_FIELD_DOCS = {
  textField: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'value',
        'string',
        '—',
        'TextField',
        'Present means the consumer owns the value, for the life of the component. Absent, the element owns it and a native form reset restores it',
      ],
      [
        'defaultValue',
        'string',
        '—',
        'TextField',
        'What an uncontrolled control starts from, read once and written to the element as the native attribute',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'TextField, TextFieldDefaultsProvider',
        'The type step, read from the field first when there is one, then from the provider. Height, padding, type and glyph all come from the control scales the theme restates per density',
      ],
      [
        'variant',
        "'outline' | 'subtle' | 'plain'",
        'outline',
        'TextField, TextFieldDefaultsProvider',
        'How much frame the control shows. plain paints no border at rest and keeps the same box, which is what a dense table cell needs',
      ],
      [
        'mono',
        'boolean',
        'false',
        'TextField, TextFieldDefaultsProvider',
        'Sets the value in the monospaced family with tabular figures, for identifiers, hashes and keys',
      ],
      [
        'clearable',
        'boolean',
        'false',
        'TextField',
        'Draws a button that empties the value with reason "clear" and returns focus to the control. It is withdrawn when the value is empty, disabled or read-only',
      ],
      [
        'revealable',
        'boolean',
        'false',
        'TextField',
        'Draws a toggle that turns a password into characters. It appears only on type="password" and is withdrawn when the control is disabled',
      ],
      [
        'revealed',
        'boolean',
        '—',
        'TextField',
        'Present means the consumer owns whether the password is showing. defaultRevealed is the uncontrolled half',
      ],
      [
        'showCount',
        'boolean',
        'false',
        'TextField',
        'Publishes the length of the value to the field around it, which draws the count in the spare column of its label row',
      ],
      [
        'countMax',
        'number',
        'maxLength',
        'TextField',
        'The limit the count is measured against. Set without maxLength it is a soft limit: the value may pass it and the counter turns before validation runs',
      ],
      [
        'start',
        'ReactNode',
        '—',
        'TextField',
        'An adornment before the value in the reading direction. It is its own bidi run, and an icon inside it is sized from the control’s glyph scale',
      ],
      [
        'end',
        'ReactNode',
        '—',
        'TextField',
        'An adornment after the value in the reading direction',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'TextField',
        'Unstated rather than false, so the control defers to the field around it. Stated, it wins, and it is the native attribute: out of the tab order and out of submission',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'TextField',
        'Unstated rather than false. The native readonly, which stays focusable, selectable and submitted',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'TextField',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the frame',
      ],
      [
        'required',
        'boolean',
        '—',
        'TextField',
        'The element’s own attribute, passed straight through and never written by the family. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
      [
        'type',
        "'text' | 'search' | 'email' | 'url' | 'tel' | 'password'",
        'text',
        'TextField',
        'The element’s own type. Any other string an input accepts still reaches the element',
      ],
      [
        'clearLabel / revealLabel',
        'string',
        'Clear / Show password',
        'TextField, TextFieldDefaultsProvider',
        'What the two buttons announce. The reveal label does not change with its state — aria-pressed carries that — and both are set once for an application',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props: TextFieldRootProps) => ReactNode',
        '—',
        'TextField',
        'Substitutes the frame and hands it every attribute. The props are typed against HTMLAttributes<HTMLElement>, so they can be spread onto a label or a fieldset. The input is fixed: substituting the element that holds the value, the identifier and the wiring would leave the family with nothing to be',
      ],
      [
        'ref',
        'Ref<HTMLInputElement>',
        '—',
        'TextField',
        'Reaches the input. focus(), select() and setSelectionRange() are the element’s own, so no imperative handle is invented for what the platform already ships',
      ],
      [
        'className / style',
        'string / CSSProperties',
        '—',
        'TextField',
        'Reach the frame, because the frame is what a consumer sees. Every other native prop reaches the input',
      ],
      [
        'TextFieldDefaultsProvider',
        '{ size, variant, mono, clearLabel, revealLabel }',
        '—',
        'a subtree',
        'The five decisions an application takes once. size is the one a field outranks, so a control inside a field takes the field’s step',
      ],
      [
        'useField()',
        '() => FieldContextValue | undefined',
        '—',
        'inside a Field',
        'What the control reads to wire itself: the identifier, the description, the four shared states, and the channel it publishes its count on. A control that wires itself cannot be written wrong',
      ],
    ]),
    accessibility: [
      'There is no WAI-ARIA APG pattern for a text field: the APG lists thirty patterns and none of them is a single-line text input, so the sources are the HTML specification for the element, the APG’s Providing Accessible Names and Descriptions practice (w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) for the name, and the ARIA textbox role for what may sit inside it.',
      'The frame carries no role. WAI-ARIA requires the children of a textbox to be non-interactive and presentational, so the clear and reveal buttons are the control’s siblings inside a box that announces nothing, rather than children of the control.',
      'The control takes its name from the field’s label, through for pointing at the identifier the field derived. The APG’s naming practice records that the implicit form — wrapping the control in the label — is one some combinations of assistive technology and browser fail to treat as a name at all.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field; a consumer who wants it writes required on the control and it survives untouched. disabled and readonly are native, because that is what those two words mean.',
      'Both buttons are real buttons with names an application translates once, and both are at least 24 CSS pixels wide — WCAG 2.2 SC 2.5.8 — at every step and every density. The reveal toggle keeps one label and carries its state in aria-pressed, which is the APG’s rule for a toggle.',
      'Nothing is bound to Escape. Some user agents clear a search input on the key; a control that swallowed it inside a dialog would be a control a keyboard user cannot leave, and WCAG 2.1.4 exists for the class of defect single-key shortcuts produce.',
      'The invalid state is never colour alone: aria-invalid announces it, the field’s error says it in words, and inline-message writes a clipped “Error:” before the sentence. In the high-contrast scheme the border cannot carry it at all, which is why it never has to.',
    ],
    snippets: [
      defineSnippet({
        id: 'text-field-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div data-ui="text-field" data-part="root" data-size="md" data-variant="outline">
  <span data-part="start">R$</span>
  <input data-part="input" id="valor-control" aria-describedby="valor-description" />
  <button data-part="clear" type="button" aria-label="Clear">
    <span data-ui="icon" data-part="root" aria-hidden="true">
      <svg data-part="glyph" data-glyph="x" aria-hidden="true"></svg>
    </span>
  </button>
  <span data-part="end">BRL</span>
</div>;`,
      }),
      defineSnippet({
        id: 'text-field-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='text-field'] {
  --slotted-text-field-border-color: var(--slotted-tone-secondary-border);
  --slotted-text-field-hover-border-color: var(--slotted-tone-accent-solid);
  --slotted-text-field-radius: var(--slotted-radius-md);
  --slotted-text-field-autofill-background: var(--slotted-tone-success-surface);
}`,
      }),
    ],
  },
} as const;
