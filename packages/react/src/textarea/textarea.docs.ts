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

export const REACT_TEXTAREA_TOKENS = textareaTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Textarea decision',
}));

const imports: ReferenceImport = {
  source: "import { Textarea, TextareaDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'textarea, or the element render returns',
    required: true,
    purpose:
      'The control and the frame at once. Carries data-ui="textarea", the three axes, data-auto-size, and data-disabled, data-invalid and data-readonly. text-field wraps its input because two buttons have to sit inside one border; nothing surveyed puts an adornment inside a textarea, and the corner is where the resize handle goes.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls below the canvas. Turn autoSize on and type: the box grows to the ceiling and then scrolls.',
    snippet: defineSnippet({
      id: 'textarea-react-playground',
      language: 'tsx',
      label: 'A control, its label and its help',
      source: `<Field>
  <FieldLabel>Observações</FieldLabel>
  <Textarea rows={3} placeholder="Descreva o que aconteceu" />
  <FieldDescription>Aparece no histórico do chamado.</FieldDescription>
</Field>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'The block padding is derived rather than chosen — half of what is left when one line box comes out of the control height — so a one-row textarea is exactly as tall as an input of the same step, at every density.',
    snippet: defineSnippet({
      id: 'textarea-react-sizes',
      language: 'tsx',
      label: 'Three steps, and the field that outranks them',
      source: `<Textarea size="sm" rows={2} />;
<Textarea size="md" rows={2} />;
<Textarea size="lg" rows={2} />;

// Inside a field the field decides, and the control follows.
<Field size="sm">
  <Textarea />
</Field>;`,
    }),
  },
  {
    id: 'variants',
    title: 'How much frame the control shows',
    note: 'The same three frames the single-line control paints, against the same tokens: one that takes the ground it is placed on, one that sinks into the page, and one that shows nothing until it is used.',
    snippet: defineSnippet({
      id: 'textarea-react-variants',
      language: 'tsx',
      label: 'Three frames, and a payload in monospace',
      source: `<Textarea variant="outline" />;
<Textarea variant="subtle" />;
<Textarea variant="plain" />;

// Tabular figures and the monospaced family, for a payload or a template.
<Textarea mono variant="subtle" defaultValue='{ "pedido": 20260442 }' />;`,
    }),
  },
  {
    id: 'auto-size',
    title: 'Growing with the content',
    note: 'Nothing is measured on the main thread: CSS field-sizing grows the box, rows is the floor and maxRows the ceiling. Type past four lines in the first example and the control scrolls rather than pushing the page.',
    snippet: defineSnippet({
      id: 'textarea-react-auto-size',
      language: 'tsx',
      label: 'A floor, a ceiling, and no measurement',
      source: `<Textarea autoSize rows={1} maxRows={4} />;

// The ceiling has a default and cannot be removed: a control that grows
// forever pushes the page out from under the caret.
<Textarea autoSize />;`,
    }),
  },
  {
    id: 'resize',
    title: 'The handle in the corner',
    note: 'block is the default rather than the platform’s both, because a control wider than its field breaks the field’s own grid. The handle is withdrawn entirely while autoSize is on, since the two would disagree on the next keystroke.',
    snippet: defineSnippet({
      id: 'textarea-react-resize',
      language: 'tsx',
      label: 'Three axes, and the one that withdraws it',
      source: `<Textarea resize="block" />;
<Textarea resize="none" />;
<Textarea resize="both" />;

// autoSize wins: the handle is withdrawn rather than left to fight.
<Textarea autoSize resize="both" />;`,
    }),
  },
  {
    id: 'states',
    title: 'The four states the control paints',
    note: 'Read-only keeps full-strength ink and its handle, because the commonest thing a read-only textarea holds is a value someone has to copy; disabled loses the handle as well, since a handle on a control nobody can type in is a handle that lies.',
    snippet: defineSnippet({
      id: 'textarea-react-states',
      language: 'tsx',
      label: 'Every state unset by default',
      source: `// Unstated rather than false, so the control defers to its field.
<Textarea invalid />;
<Textarea readOnly defaultValue="Somente leitura" />;
<Textarea disabled defaultValue="Desativado" />;`,
    }),
  },
  {
    id: 'count',
    title: 'Counting what has been typed',
    note: 'The control counts and the field draws it in the spare column of the label row, so a count that appears on the first keystroke never shares a row with the error and pushes it — which is where Angular Material puts it.',
    snippet: defineSnippet({
      id: 'textarea-react-count',
      language: 'tsx',
      label: 'A count bound to the value',
      source: `<Field>
  <FieldLabel>Observações</FieldLabel>
  <Textarea showCount maxLength={280} autoSize rows={2} />
</Field>;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A pasted token with no break in it — a signed URL, a certificate, a container digest — wraps instead of taking the page’s horizontal scrollbar with it, and nothing is removed from the value.',
    snippet: defineSnippet({
      id: 'textarea-react-content',
      language: 'tsx',
      label: 'Unbreakable, translated and right-to-left',
      source: `<Textarea defaultValue={jwt} rows={3} />;

// overflow-wrap: anywhere in the stylesheet, so the whole string stays
// selectable, copyable and reachable with the caret.
<Textarea dir="rtl" defaultValue="مرحبا بالعالم" rows={3} />;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The provider carries the four decisions an application takes once; render substitutes the element; ref reaches the textarea, which already has focus, select and setSelectionRange.',
    snippet: defineSnippet({
      id: 'textarea-react-composition',
      language: 'tsx',
      label: 'A provider, a ref, and a form',
      source: `<TextareaDefaultsProvider resize="none" variant="subtle">
  <Textarea autoSize />
</TextareaDefaultsProvider>;

const ref = useRef<HTMLTextAreaElement>(null);
<Textarea ref={ref} name="notes" form="ticket" />;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and what it deliberately does not',
    note: 'Enter makes a line and never submits — the difference WAI-ARIA notes between a single-line and a multi-line control — and Tab leaves the control rather than inserting a tab, so a keyboard user is never trapped in a comment box.',
    snippet: defineSnippet({
      id: 'textarea-react-keyboard',
      language: 'tsx',
      label: 'Enter makes a line; the form is submitted elsewhere',
      source: `<form onSubmit={onSubmit}>
  <Textarea name="notes" rows={3} />
  <Button type="submit">Enviar</Button>
</form>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: string, request: ChangeRequest<string>)',
    when: 'Before the value moves. The request carries the new value, the value it replaces, the reason — always "keyboard", because the control’s own editing surface is the only thing that can move it — the originating event, and cancel(), which refuses the move before anything commits.',
  },
  {
    name: 'onChange, onInput, onFocus, onBlur',
    payload: 'the element’s own events',
    when: 'Whenever the element fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, and always runs.',
  },
];

export const REACT_TEXTAREA_DOCS = {
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
        'Textarea',
        'Present means the consumer owns the value, for the life of the component. Absent, the element owns it and a native form reset restores it',
      ],
      [
        'defaultValue',
        'string',
        '—',
        'Textarea',
        'What an uncontrolled control starts from, read once and written to the element as the native attribute',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'Textarea, TextareaDefaultsProvider',
        'The type step, read from the field first when there is one. The block padding is derived from it, so a one-row control matches an input of the same step at every density',
      ],
      [
        'variant',
        "'outline' | 'subtle' | 'plain'",
        'outline',
        'Textarea, TextareaDefaultsProvider',
        'How much frame the control shows — the three the single-line control paints, against the same tokens',
      ],
      [
        'mono',
        'boolean',
        'false',
        'Textarea, TextareaDefaultsProvider',
        'Sets the value in the monospaced family with tabular figures, for a payload, a template or a diff',
      ],
      [
        'resize',
        "'block' | 'none' | 'both'",
        'block',
        'Textarea, TextareaDefaultsProvider',
        'Which way the handle may drag. block rather than the platform’s both, because a control wider than its field breaks the field’s grid. Withdrawn entirely while autoSize is on',
      ],
      [
        'autoSize',
        'boolean',
        'false',
        'Textarea',
        'Grows with the content through CSS field-sizing rather than a measurement on the main thread. rows becomes the floor and maxRows the ceiling',
      ],
      [
        'rows',
        'number',
        '3',
        'Textarea',
        'The starting height, and the floor while autoSize is on. Three rather than the platform’s two, because a two-row box reads as a mistyped input',
      ],
      [
        'maxRows',
        'number',
        '12',
        'Textarea',
        'The ceiling autoSize grows to, after which the control scrolls. It cannot be removed: a control that grows forever pushes the page out from under the caret',
      ],
      [
        'showCount',
        'boolean',
        'false',
        'Textarea',
        'Publishes the length of the value to the field around it, which draws the count in the spare column of its label row',
      ],
      [
        'countMax',
        'number',
        'maxLength',
        'Textarea',
        'The limit the count is measured against. Set without maxLength it is a soft limit the value may pass',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'Textarea',
        'Unstated rather than false, so the control defers to the field around it. Stated, it wins, and it is the native attribute',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'Textarea',
        'Unstated rather than false. The native readonly, which stays focusable, selectable and submitted, and keeps its handle',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'Textarea',
        'Unstated rather than false. Writes aria-invalid and data-invalid on the control',
      ],
      [
        'required',
        'boolean',
        '—',
        'Textarea',
        'The element’s own attribute, passed straight through and never written by the family. A field marks necessity with aria-required instead',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props: TextareaRootProps) => ReactNode',
        '—',
        'Textarea',
        'Substitutes the element and hands it every attribute, including the two custom properties the row counts travel in. The props are typed against HTMLAttributes<HTMLElement> so they can be spread onto anything',
      ],
      [
        'ref',
        'Ref<HTMLTextAreaElement>',
        '—',
        'Textarea',
        'Reaches the element. focus(), select() and setSelectionRange() are the platform’s, so no imperative handle is invented for them',
      ],
      [
        'TextareaDefaultsProvider',
        '{ size, variant, mono, resize }',
        '—',
        'a subtree',
        'The four decisions an application takes once. size is the one a field outranks, so a control inside a field takes the field’s step',
      ],
      [
        'useField()',
        '() => FieldContextValue | undefined',
        '—',
        'inside a Field',
        'What the control reads to wire itself: the identifier, the description, the four shared states and the channel it publishes its count on',
      ],
    ]),
    accessibility: [
      'There is no WAI-ARIA APG pattern for a multi-line text control: the APG lists thirty patterns and none of them is a textarea, so the sources are the HTML specification for the element and the ARIA textbox role, whose aria-multiline the native element supplies on its own.',
      'The control takes its name from the field’s label, through for pointing at the identifier the field derived, and its description through aria-describedby merged after anything the consumer wrote.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour; a consumer who wants it writes required on the control and it survives. disabled and readonly are native, because that is what those two words mean.',
      'Enter makes a line and never submits. WAI-ARIA records that as the difference between a single-line and a multi-line text control, and a comment box that submitted a form on Enter would lose what was being written.',
      'Tab leaves the control. Nothing is bound to a key, so a keyboard user is never held inside a comment box by a shortcut the family invented.',
      'Growing with the content is CSS rather than script, so a reader using a screen reader hears no change and a reader who has asked for reduced motion sees none: the box has a new height, and nothing animates to it.',
    ],
    snippets: [
      defineSnippet({
        id: 'textarea-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<textarea
  data-ui="textarea"
  data-part="root"
  data-size="md"
  data-variant="outline"
  data-resize="none"
  data-auto-size=""
  rows={2}
  style={{ '--slotted-textarea-rows': 2, '--slotted-textarea-max-rows': 6 }}
/>;`,
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
