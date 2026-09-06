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

export const REACT_CHECKBOX_TOKENS = checkboxTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Checkbox decision',
}));

const imports: ReferenceImport = {
  source: "import { Checkbox, CheckboxDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The two-column grid: the box in one column, the label and the description in the other. Carries data-ui="checkbox", the two axes and data-checked, data-indeterminate, data-disabled, data-invalid and data-readonly. It has no role — the native control is the only thing announced. className and style reach this element.',
  },
  {
    part: 'control',
    element: 'input type="checkbox"',
    required: true,
    purpose:
      'The control. Holds the value, the name, the identifier and every native attribute a consumer wrote — form, required, autoFocus, every aria-* and every handler. It draws the box itself with appearance: none, and ref reaches it, so focus() and click() need no handle of their own.',
  },
  {
    part: 'indicator',
    element: 'span',
    required: true,
    purpose:
      'The mark, drawn as a mask from the glyph scale over the control: the check for checked, the dash for mixed. It is a sibling and not a pseudo-element, because Firefox renders neither ::before nor ::after on an input, and it takes no pointer events, so the control underneath answers every click.',
  },
  {
    part: 'label',
    element: 'label',
    required: false,
    purpose:
      'Names the control through for, and carries the target: the gap between the box and the text is its own padding, and it is never shorter than 24 CSS pixels. Absent when the checkbox has no children, for a box named by aria-label in a table header.',
  },
  {
    part: 'description',
    element: 'p',
    required: false,
    purpose:
      'Help text under the label, aligned to the label rather than to the box and wired with aria-describedby. It is outside the label on purpose: inside, it would join the accessible name, and clicking a paragraph of help would toggle the value.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One box with every axis on it, driven by the controls below the canvas. Click the label, not only the box: the target runs from the square to the end of the text.',
    snippet: defineSnippet({
      id: 'checkbox-react-playground',
      language: 'tsx',
      label: 'A box, its label and its help',
      source: `<Checkbox description="Enviaremos o recibo por e-mail." defaultChecked>
  Enviar recibo
</Checkbox>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the box sits at',
    note: 'The square is the control glyph scale, so the three steps shrink together with the type and the gap when the toolbar switches to dense — and the label keeps its 24-pixel target at every one of them.',
    snippet: defineSnippet({
      id: 'checkbox-react-sizes',
      language: 'tsx',
      label: 'Three steps, all answering density',
      source: `<Checkbox size="sm">Compacto</Checkbox>;
<Checkbox size="md">Padrão</Checkbox>;
<Checkbox size="lg">Confortável</Checkbox>;

// Inside a field or a group, that decides and the box follows.
<CheckboxGroup size="sm">
  <Checkbox value="a">Compacto porque o grupo é</Checkbox>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'tile',
    title: 'The choice as a framed surface',
    note: 'Click anywhere inside a tile, not only the box: the label’s hit area stretches over the whole surface, so the target is the frame. Chosen says it with a two-pixel accent edge as well as a tint, because the high-contrast scheme flattens every tint to white and only the width survives.',
    snippet: defineSnippet({
      id: 'checkbox-react-tile',
      language: 'tsx',
      label: 'A row of framed choices, laid out by Grid',
      source: `// The tile frames one choice. Grid arranges them, because it already
// owns columns, minItemWidth and a stretching alignment.
<Grid minItemWidth="sm">
  <Checkbox
    description="Uma cópia por dia, guardada por trinta dias."
    variant="tile"
    value="backup"
  >
    Backup diário
  </Checkbox>
  <Checkbox description="Quem mudou o quê, e quando." variant="tile" value="audit">
    Registro de auditoria
  </Checkbox>
</Grid>;`,
    }),
  },
  {
    id: 'states',
    title: 'Every state the box paints',
    note: 'Read-only keeps full-strength ink, its ring and its tab stop, because the value is real and still submitted; disabled loses all three. Invalid thickens the border as well as reddening it, because the high-contrast scheme paints every border the same black.',
    snippet: defineSnippet({
      id: 'checkbox-react-states',
      language: 'tsx',
      label: 'Every shared state unset by default',
      source: `// Unstated rather than false, so the box defers to its group or field.
<Checkbox invalid>Escolha ao menos uma</Checkbox>;
<Checkbox readOnly defaultChecked>
  Contratado
</Checkbox>;
<Checkbox disabled>Indisponível</Checkbox>;

// A box inside a disabled fieldset is painted too: the stylesheet
// matches :disabled beside the mirrored attribute.`,
    }),
  },
  {
    id: 'indeterminate',
    title: 'The mixed state, and the box that commands a set',
    note: 'Mixed is a state and never a third value: the form still submits a boolean. Tick the parent and the whole set follows; untick one child and the parent goes back to the dash on its own.',
    snippet: defineSnippet({
      id: 'checkbox-react-indeterminate',
      language: 'tsx',
      label: 'A state a consumer owns, and one a group derives',
      source: `// Owned by the consumer: the box draws the dash and submits nothing new.
<Checkbox indeterminate>Parcialmente marcado</Checkbox>;

// Derived by the group: checked when every value is selected, mixed
// between, and its request replaces the whole selection.
<CheckboxGroup allValues={['mon', 'tue', 'wed']}>
  <Checkbox parent>Todos os dias</Checkbox>
  <Checkbox value="mon">Segunda</Checkbox>
</CheckboxGroup>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Which side of its label the box is on',
    note: 'start pushes the box to the end of the row, which is where a settings list puts a control — and it is why the column is a fraction rather than the label’s own width: five boxes have to line up with each other.',
    snippet: defineSnippet({
      id: 'checkbox-react-placement',
      language: 'tsx',
      label: 'The box first, or the label first',
      source: `<Checkbox labelPlacement="end">A caixa antes do rótulo</Checkbox>;
<Checkbox labelPlacement="start">A caixa depois do rótulo</Checkbox>;

// Never inherited from a field: that family's labelPlacement answers
// where a field's label sits relative to its control.`,
    }),
  },
  {
    id: 'description',
    title: 'Saying more than the label does',
    note: 'The description aligns under the label rather than under the box, in both placements and both writing directions, and it is announced as the control’s description rather than as part of its name.',
    snippet: defineSnippet({
      id: 'checkbox-react-description',
      language: 'tsx',
      label: 'Help that is described, not named',
      source: `<Checkbox description="Um resumo por dia, e nunca mais de um.">Receber avisos por e-mail</Checkbox>;`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a field, and inside a group of fields',
    note: 'The box reads the field for its step and its four shared states and never for its identifier: it owns its own label, and a field’s label would name the same control twice.',
    snippet: defineSnippet({
      id: 'checkbox-react-field',
      language: 'tsx',
      label: 'A set of boxes under one legend',
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
    note: 'A label that wraps to three lines keeps the box on the first of them rather than in the middle of the block, an unbroken token breaks instead of taking the page with it, and a right-to-left label mirrors the whole row.',
    snippet: defineSnippet({
      id: 'checkbox-react-content',
      language: 'tsx',
      label: 'Long, unbroken and right-to-left',
      source: `<Checkbox description="A caixa continua na primeira linha do rótulo.">
  Concordo em receber comunicações sobre alterações contratuais, prazos de entrega e mudanças na
  política de devolução.
</Checkbox>;

<Checkbox dir="rtl">أوافق على تلقي رسائل حول التغييرات في العقد.</Checkbox>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The provider carries the two decisions an application takes once; render substitutes the root so a box can be a list item; ref reaches the element, which already has focus and click.',
    snippet: defineSnippet({
      id: 'checkbox-react-composition',
      language: 'tsx',
      label: 'A provider, a ref, and a substituted root',
      source: `<CheckboxDefaultsProvider labelPlacement="start" size="sm">
  <Checkbox>Herda os dois</Checkbox>
</CheckboxDefaultsProvider>;

const ref = useRef<HTMLInputElement>(null);
<Checkbox ref={ref} onCheckedChange={() => ref.current?.focus()} />;

// The root becomes the consumer's own element, with every attribute.
<Checkbox render={(props) => <li {...props} />}>Um item</Checkbox>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and who implements it',
    note: 'Space toggles and Enter submits the form, and neither is a listener this family writes: the control is a native checkbox, so the whole table is the platform’s and arrives translated and mirrored for free.',
    snippet: defineSnippet({
      id: 'checkbox-react-keyboard',
      language: 'tsx',
      label: 'No key is bound, and the reason is recovered from the click',
      source: `// Space and a pointer arrive as one click. A click synthesised by the
// keyboard reports no detail, which is how the reason is told apart
// without a key listener existing anywhere in the family.
<Checkbox
  onCheckedChange={(checked, request) => {
    console.log(request.reason); // "keyboard" | "pointer"
  }}
/>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onCheckedChange',
    payload: '(checked: boolean, request: ChangeRequest<boolean>)',
    when: 'Before the box moves. The request carries the new state, the state it replaces, the reason — "pointer" or "keyboard", recovered from the click’s detail — the originating event, and cancel(), which refuses the move before anything commits, including the platform’s own toggle.',
  },
  {
    name: 'onChange, onClick, onFocus, onBlur',
    payload: 'the element’s own events',
    when: 'Whenever the element fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, and always runs. A consumer who calls preventDefault() in onClick stops the change as well.',
  },
];

export const REACT_CHECKBOX_DOCS = {
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
        'Checkbox',
        'Present means the consumer owns the state, for the life of the component. Absent, the element owns it and a native form reset restores it. Inside a group with a value, the group owns it instead',
      ],
      [
        'defaultChecked',
        'boolean',
        'false',
        'Checkbox',
        'What an uncontrolled box starts from, read once and written to the element as the native attribute',
      ],
      [
        'indeterminate',
        'boolean',
        'false',
        'Checkbox',
        'The mixed state. It is a state and never a third value of checked: the submitted value stays boolean, and the platform agrees — indeterminate is an IDL property that leaves checked alone',
      ],
      [
        'parent',
        'boolean',
        'false',
        'Checkbox',
        'Commands the whole set its group was given in allValues. Checked when every value is selected, mixed when some are, and its request replaces the selection rather than toggling one value',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'Checkbox, CheckboxDefaultsProvider',
        'The type step. Read from the group first, then the field or field group, then the provider. The square is the control glyph scale, which the theme restates per density',
      ],
      [
        'variant',
        "'plain' | 'tile'",
        'plain',
        'Checkbox, CheckboxDefaultsProvider',
        'How the choice is drawn. A tile frames it and makes the whole surface the target; the label keeps naming the control, so the keyboard and the accessible name are unchanged. Read from the group first, then the provider',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        'Checkbox, CheckboxDefaultsProvider',
        'Which side of its own label the box is on. Never inherited from a field: that family’s labelPlacement answers where a field’s label sits relative to its control',
      ],
      [
        'disabled',
        'boolean',
        'from the group or field, or false',
        'Checkbox',
        'Unstated rather than false. The native attribute, which is what removes the control from the tab order and from submission',
      ],
      [
        'readOnly',
        'boolean',
        'from the group or field, or false',
        'Checkbox',
        'Unstated rather than false. The platform has no readonly for a checkbox, so the family refuses the change and writes aria-readonly; the box keeps its tab stop, its ring and its contrast',
      ],
      [
        'invalid',
        'boolean',
        'from the group or field, or false',
        'Checkbox',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the root, which thickens the border as well as reddening it',
      ],
      [
        'required',
        'boolean',
        '—',
        'Checkbox',
        'The element’s own attribute, passed straight through and never written by the family. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
      [
        'description',
        'ReactNode',
        '—',
        'Checkbox',
        'Help text under the label, wired with aria-describedby and kept outside the label so it is described rather than named',
      ],
      [
        'name / value',
        'string',
        '— / on',
        'Checkbox',
        'The element’s own submission pair. Inside a group, name comes from the group when the box states none, and value is what the group’s selection holds',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props: CheckboxRootProps) => ReactNode',
        '—',
        'Checkbox',
        'Substitutes the root and hands it every attribute. The props are typed against HTMLAttributes<HTMLElement>, so they can be spread onto a li or a label. The control is fixed: substituting the element that holds the value and the platform’s keyboard would leave the family with nothing to be',
      ],
      [
        'ref',
        'Ref<HTMLInputElement>',
        '—',
        'Checkbox',
        'Reaches the input. focus() and click() are the element’s own, so no imperative handle is invented for what the platform already ships',
      ],
      [
        'className / style',
        'string / CSSProperties',
        '—',
        'Checkbox',
        'Reach the root, because the root is what a consumer sees. Every other native prop reaches the input',
      ],
      [
        'CheckboxDefaultsProvider',
        '{ size, labelPlacement }',
        '—',
        'a subtree',
        'The two decisions an application takes once. Both are outranked by the group and by the field around the box',
      ],
      [
        'useField()',
        '() => FieldContextValue | undefined',
        '—',
        'inside a Field',
        'What the box reads to wire itself: the four shared states, the description and the step. It never reads the identifier — the box owns its own label, and a field’s label would name the same control twice',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Checkbox (w3.org/WAI/ARIA/apg/patterns/checkbox/), and every item of it is answered by the platform: role, aria-checked with its mixed value, Space to toggle, Enter left to the form, and disabled behaviour. The family writes no key listener, which is why the behaviour arrives already translated and already mirrored in a right-to-left document.',
      'The label names the control through for, pointing at an identifier the control generates when the consumer writes none. The description is outside the label and reaches the control through aria-describedby, so help text is described rather than named and clicking a paragraph of it toggles nothing.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field; a consumer who wants it writes required on the box and it survives untouched. disabled is native, because that is what the word means.',
      'Read-only has no platform answer for a checkbox, so it is enforced rather than borrowed: the change is refused on the click a pointer and Space share, aria-readonly announces it, and the box keeps its tab stop, its focus ring and its full contrast — a read-only value is real, and it must not look disabled.',
      'The invalid state is never colour alone. In the high-contrast scheme the theme paints the danger border the same black as every other border, so the box thickens its edge as well, and the sentence that says what is wrong is the field group’s error rather than the box’s colour.',
      'The target is the whole label row, not the square. At the dense step with size="sm" the box is twelve pixels, under WCAG 2.2 SC 2.5.8’s twenty-four, so the label carries a minimum block size and owns the gap between itself and the box — the correction the theme cannot make on the family’s behalf.',
      'The mark survives forced colors. It is a mask over a background colour, and forced colors overrides both, so the family restates the pair in system colours — the one rule it writes that the theme cannot reach.',
    ],
    snippets: [
      defineSnippet({
        id: 'checkbox-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div data-ui="checkbox" data-part="root" data-size="md" data-label-placement="end" data-checked>
  <input
    data-part="control"
    type="checkbox"
    id="terms"
    aria-describedby="terms-description"
    checked
  />
  <span data-part="indicator" />
  <label data-part="label" for="terms">
    Aceito os termos
  </label>
  <p data-part="description" id="terms-description">
    Enviaremos o recibo por e-mail.
  </p>
</div>;`,
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
