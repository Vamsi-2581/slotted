import selectTokens from '@slotted/styles/select/tokens.json';
import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_SELECT_TOKENS = selectTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Select decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, rendered by SelectTrigger',
    required: true,
    purpose:
      'The frame the reader sees, carrying data-ui="select". It draws the border, the shadow, the focus ring and every state, exactly as text-field\'s frame does — a ring can only be drawn by an ancestor of whatever took focus.',
  },
  {
    part: 'trigger',
    element: 'button with role="combobox"',
    required: true,
    purpose:
      'The control. It fills the frame, keeps DOM focus for the whole interaction, and carries aria-expanded, aria-controls and aria-activedescendant.',
  },
  {
    part: 'value',
    element: 'span, rendered by SelectValue',
    required: true,
    purpose:
      'What the control shows: the chosen label, a summary of several, or the placeholder. data-placeholder while nothing is chosen; data-unmatched when a value could not be resolved to a label.',
  },
  {
    part: 'arrow',
    element: 'span',
    required: true,
    purpose:
      "The chevron, drawn as a mask from the glyph scale and turned over while the popup is open. It is placed against the frame's end and is inert: the trigger's own padding runs underneath it, so a press there still opens the popup.",
  },
  {
    part: 'busy',
    element: 'span',
    required: false,
    purpose:
      "The ring, standing where the chevron stands while an answer is travelling: the chevron says the popup opens, and it does not open onto anything yet. The arc is the shared `spinner` sheet's, worn as `data-ui` beside this part, so the family says only where it stands and how big it is.",
  },
  {
    part: 'tags',
    element: 'span',
    required: false,
    purpose:
      'The chosen values, as the chips they are, standing over the trigger rather than inside it — a remove control inside a button is a control inside a control. Each chip is a `tag`, and one more chip counts what did not fit, measured by `createCollapse`. Only a multiple selection draws it.',
  },
  {
    part: 'summary',
    element: 'span',
    required: false,
    purpose:
      "What a control under 120px says instead of chips — '3 selected'. It lives inside the value, so the trigger is named by it whichever of the two is drawn, and it is taken out of sight rather than out of the tree while the chips are shown.",
  },
  {
    part: 'clear',
    element: 'button',
    required: false,
    purpose:
      'Takes the selection back. Present only while clearable is set and something is chosen, and a sibling of the trigger rather than a child — a focusable descendant of a combobox is a widget inside a widget.',
  },
  {
    part: 'positioner',
    element: 'div, rendered by SelectContent',
    required: true,
    purpose:
      'The layer, portalled to the end of the document. It carries data-ui="select" a second time, because a stylesheet cannot reach a subtree that has left its own root; the positioner writes its position onto it, and it is what scales and fades.',
  },
  {
    part: 'content',
    element: 'div with role="listbox"',
    required: true,
    purpose:
      'The painted surface. It owns the three columns every option passes through, is bounded by the height the positioner reports, and scrolls inside it.',
  },
  {
    part: 'group',
    element: 'div with role="group"',
    required: false,
    purpose:
      "A set of options with a name. It spans every column and inherits them, so its options keep the list's columns rather than starting a second set.",
  },
  {
    part: 'group-label',
    element: 'div',
    required: false,
    purpose:
      'The name of a group, which the group points at with aria-labelledby — required of every option group by the listbox pattern.',
  },
  {
    part: 'item',
    element: 'div with role="option"',
    required: true,
    purpose:
      "One option. Not a button: the pattern's option is not separately focusable, and a button here would add a tab stop the pattern excludes by name. data-current is the highlight, data-selected is the choice.",
  },
  {
    part: 'indicator',
    element: 'span',
    required: true,
    purpose:
      'The check in the last column. Its box is reserved whether or not the mark is drawn, so a list does not shift as the reader moves through it.',
  },
  {
    part: 'icon',
    element: 'span',
    required: false,
    purpose:
      "The artwork in the first column, from a glyph token or the consumer's own element. It is not the check: a country's flag and the mark saying it is chosen are two facts about one row.",
  },
  {
    part: 'label',
    element: 'span',
    required: true,
    purpose:
      "The option's words, and the only column that gives way. It wraps to two lines and then truncates, with the whole string still in the DOM.",
  },
  {
    part: 'description',
    element: 'span',
    required: false,
    purpose: 'The line under the label, for the qualifier a label has no room for.',
  },
  {
    part: 'separator',
    element: 'div with role="separator"',
    required: false,
    purpose: 'A line between two runs of options. Not focusable and not interactive.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose:
      'What the popup says when it holds no options. It opens onto a sentence rather than onto nothing, and emptyLabel has a default so a family that says nothing still says something.',
  },
  {
    part: 'status',
    element: 'div with role="status"',
    required: false,
    purpose:
      "What the popup says while an answer is travelling. It keeps the popup's measure, so nothing jumps when the options land.",
  },
  {
    part: 'placeholder',
    element: 'div',
    required: false,
    purpose:
      'Three rows the height of an option, drawn by the shared `skeleton` sheet while an answer is travelling, so the surface a reader is looking at is the shape of the list that is coming. Hidden from assistive technology: the status row beside it is the live region.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One select with every axis on it, driven by the controls under the canvas. Change size, variant and width and watch the control and its popup answer together.',
    snippet: defineSnippet({
      id: 'select-react-playground',
      language: 'tsx',
      label: 'A control, and the options it opens',
      source: `<Select>
  <SelectTrigger aria-label="Fruit">
    <SelectValue placeholder="Choose a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="blueberry">Blueberry</SelectItem>
  </SelectContent>
</Select>;`,
    }),
  },
  {
    id: 'selection',
    title: 'Controlled and uncontrolled',
    note: 'The left one owns its own value; the right one hands it to the page, and the request carries the reason so a consumer can tell a press from a key.',
    snippet: defineSnippet({
      id: 'select-react-selection',
      language: 'tsx',
      label: 'Who owns the value',
      source: `<Select defaultValue="blueberry">…</Select>;

<Select value={fruit} onValueChange={(next, request) => setFruit(next, request.reason)}>
  …
</Select>;`,
    }),
  },
  {
    id: 'placeholder',
    title: 'Placeholder and unresolved values',
    note: 'Nothing chosen shows the placeholder in the muted step. A value the collection cannot name shows the value itself, which is what an async list holds for one render.',
    snippet: defineSnippet({
      id: 'select-react-placeholder',
      language: 'tsx',
      label: 'Empty, and holding a value it cannot name',
      source: `<SelectValue placeholder="Choose a fruit" />;

<Select defaultValue="usr_8f21c0" items={known}>
  …
</Select>;`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups, icons and descriptions',
    note: 'Two named groups with a line between them. Every label starts on the same line whether or not its option carries artwork, because the column belongs to the list.',
    snippet: defineSnippet({
      id: 'select-react-groups',
      language: 'tsx',
      label: 'A list with sections',
      source: `<SelectContent>
  <SelectGroup label="Berries">
    <SelectItem description="In season until September" value="raspberry">
      Raspberry
    </SelectItem>
  </SelectGroup>
  <SelectSeparator />
  <SelectGroup label="Citrus">
    <SelectItem value="pomelo">Pomelo</SelectItem>
  </SelectGroup>
</SelectContent>;`,
    }),
  },
  {
    id: 'multiple',
    title: 'Multiple selection',
    note: 'The popup stays open as options are taken, and the control shows the first label and how many more. Space toggles without closing, which is the listbox pattern’s own model.',
    snippet: defineSnippet({
      id: 'select-react-multiple',
      language: 'tsx',
      label: 'Several values, summarised',
      source: `<Select multiple defaultValue={['apple', 'cherry']}>
  <SelectTrigger aria-label="Fruit">
    <SelectValue>{(values) => \`\${values.length} chosen\`}</SelectValue>
  </SelectTrigger>
  …
</Select>;`,
    }),
  },
  {
    id: 'clearable',
    title: 'Clearable',
    note: 'The clear button appears only once something is chosen, and focus goes back to the control it belonged to rather than to the document.',
    snippet: defineSnippet({
      id: 'select-react-clearable',
      language: 'tsx',
      label: 'Taking the choice back',
      source: `<Select clearable defaultValue="apple" onValueChange={(next, request) => log(request.reason)}>
  …
</Select>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'Sizes',
    note: 'Three steps, and every one of them reads control geometry — so a select beside a text field of the same size is the same height to the pixel.',
    snippet: defineSnippet({
      id: 'select-react-sizes',
      language: 'tsx',
      label: 'The three control steps',
      source: `<Select size="sm">…</Select>;
<Select size="md">…</Select>;
<Select size="lg">…</Select>;`,
    }),
  },
  {
    id: 'variants',
    title: 'Variants',
    note: 'outline on the page, subtle where a form sinks into its card, and plain for a table cell that is only a control while it is being used.',
    snippet: defineSnippet({
      id: 'select-react-variants',
      language: 'tsx',
      label: 'How much frame the control shows',
      source: `<Select variant="outline">…</Select>;
<Select variant="subtle">…</Select>;
<Select variant="plain">…</Select>;`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Required, invalid, read-only and disabled side by side. Read-only keeps its value legible and refuses to open; disabled answers nothing at all.',
    snippet: defineSnippet({
      id: 'select-react-states',
      language: 'tsx',
      label: 'What the control refuses, and how it says so',
      source: `<Select invalid>…</Select>;
<Select readOnly defaultValue="apple">
  …
</Select>;
<Select disabled defaultValue="apple">
  …
</Select>;`,
    }),
  },
  {
    id: 'loading-and-empty',
    title: 'Loading and empty',
    note: 'A popup with nothing in it opens onto a sentence rather than onto a two-pixel box, and a loading one keeps that measure so nothing jumps when the options land.',
    snippet: defineSnippet({
      id: 'select-react-loading-and-empty',
      language: 'tsx',
      label: 'Two states no surveyed implementation draws',
      source: `<Select loading>
  <SelectContent status="Fetching teams…">{options}</SelectContent>
</Select>;

<SelectContent empty="No teams yet">{[]}</SelectContent>;`,
    }),
  },
  {
    id: 'long-content',
    title: 'Content the family did not choose',
    note: 'A translated label, an unbroken identifier and a hundred options. The label clamps at two lines with the whole string still in the DOM, and the token breaks inside the option.',
    snippet: defineSnippet({
      id: 'select-react-long-content',
      language: 'tsx',
      label: 'Long, translated and unbroken',
      source: `<SelectItem value="urn">urn:acme:catalogue:9f2c41ab8de07c5511903fbe</SelectItem>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Placement and width',
    note: 'The popup hangs from the start edge of its control and is as wide as it. width="content" lets it size to its own options, for a list with descriptions.',
    snippet: defineSnippet({
      id: 'select-react-placement',
      language: 'tsx',
      label: 'Where the popup goes, and how wide it is',
      source: `<Select align="end" side="top" width="content">
  …
</Select>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'Keyboard',
    note: 'Focus never leaves the button: the arrows, Home, End and the page keys move aria-activedescendant, and typing jumps to the first option that begins with it.',
    snippet: defineSnippet({
      id: 'select-react-keyboard',
      language: 'tsx',
      label: 'What the reader can reach without a pointer',
      source: `<Select loop={false} typeahead typeaheadTimeout={500}>
  …
</Select>;`,
    }),
  },
  {
    id: 'form',
    title: 'In a form',
    note: 'Inside a field, with a label, a description and an error. name renders a hidden native select, so a plain form submits and reset() restores.',
    snippet: defineSnippet({
      id: 'select-react-form',
      language: 'tsx',
      label: 'A control a form can submit',
      source: `<Field invalid required>
  <FieldLabel>Fruit</FieldLabel>
  <Select name="fruit">
    <SelectTrigger>
      <SelectValue placeholder="Choose a fruit" />
    </SelectTrigger>
    <SelectContent>{options}</SelectContent>
  </Select>
  <FieldError>Choose one.</FieldError>
</Field>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition',
    note: 'Defaults set once for a whole application, a summary the consumer writes, and the frame replaced with an element of their own through render.',
    snippet: defineSnippet({
      id: 'select-react-composition',
      language: 'tsx',
      label: 'What a consumer can replace',
      source: `<SelectDefaultsProvider size="sm" variant="subtle" width="content">
  <Select ref={handle}>
    <SelectTrigger render={(props) => <label {...props} />}>
      <SelectValue>{(values, labels) => labels.join(', ')}</SelectValue>
    </SelectTrigger>
    …
  </Select>
</SelectDefaultsProvider>;`,
    }),
  },
];

const api = apiRows([
  [
    'value',
    'string | string[] | null',
    '—',
    'Select',
    'The chosen value, or values. Present means the consumer owns it.',
  ],
  [
    'defaultValue',
    'string | string[] | null',
    '—',
    'Select',
    'What an uncontrolled select starts from, read once.',
  ],
  [
    'open',
    'boolean',
    '—',
    'Select',
    'Whether the popup is showing. Present means the consumer owns it.',
  ],
  ['defaultOpen', 'boolean', 'false', 'Select', 'Whether an uncontrolled select starts open.'],
  [
    'highlightedValue',
    'string | null',
    '—',
    'Select',
    'The option the highlight is on, which is not the option that is chosen.',
  ],
  [
    'defaultHighlightedValue',
    'string | null',
    '—',
    'Select',
    'Where an uncontrolled highlight starts.',
  ],
  [
    'items',
    'SelectItems',
    '—',
    'Select',
    'Labels for values, so a closed control can name one the popup never rendered.',
  ],
  [
    'name',
    'string',
    '—',
    'Select',
    'The submission name. Renders a hidden native select carrying it.',
  ],
  [
    'form',
    'string',
    '—',
    'Select',
    'The form this control submits with, when it is not the enclosing one.',
  ],
  [
    'total',
    'number',
    '—',
    'Select',
    'How many options the whole collection holds, for aria-setsize.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'Select',
    'The control step. Unset asks the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'Select',
    'How much frame the control shows.',
  ],
  [
    'side',
    "'bottom' | 'top' | 'inline-start' | 'inline-end'",
    'bottom',
    'Select',
    'Which edge of the control the popup hangs from.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'Select',
    'Where the popup lines up along that edge.',
  ],
  [
    'width',
    "'anchor' | 'content'",
    'anchor',
    'Select',
    'As wide as the control, or as wide as its own options.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'Select',
    'When the layer exists: only while open, from the first open, or from the start.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'Select',
    'How the positioner places the layer.',
  ],
  ['multiple', 'boolean', 'false', 'Select', 'Whether more than one option may be chosen.'],
  [
    'clearable',
    'boolean',
    'false',
    'Select',
    'Whether a clear button appears once something is chosen.',
  ],
  ['loop', 'boolean', 'false', 'Select', 'Whether the arrows wrap at the ends of the list.'],
  ['typeahead', 'boolean', 'true', 'Select', 'Whether typing jumps to the first matching option.'],
  [
    'typeaheadTimeout',
    'number',
    '500',
    'Select',
    'How long a typed sequence stays open, in milliseconds.',
  ],
  [
    'closeOnSelect',
    'boolean',
    'true',
    'Select',
    'Whether taking an option closes the popup. Ignored while multiple is set.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'Select', 'Whether Escape closes the popup.'],
  ['closeOnOutsidePress', 'boolean', 'true', 'Select', 'Whether a press outside closes the popup.'],
  [
    'flip',
    'boolean',
    'true',
    'Select',
    'Whether the popup may move to the opposite side when it does not fit.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'Select',
    'Whether the popup may slide along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'Select',
    'Whether the popup hides once its control has scrolled out of view.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'Select',
    'Whether the layer is portalled out of the control’s subtree.',
  ],
  [
    'fullWidth',
    'boolean',
    'true',
    'Select',
    'Whether the control fills its field, or shrinks to its widest value.',
  ],
  ['disabled', 'boolean', 'false', 'Select', 'Answers nothing. Unset asks the field around it.'],
  [
    'readOnly',
    'boolean',
    'false',
    'Select',
    'Keeps its value legible and refuses to open. Unset asks the field.',
  ],
  ['required', 'boolean', 'false', 'Select', 'Announced with aria-required. Unset asks the field.'],
  [
    'invalid',
    'boolean',
    'false',
    'Select',
    'Retargets the focus ring and the border. Unset asks the field.',
  ],
  [
    'loading',
    'boolean',
    'false',
    'Select',
    'Paints the status row and sets aria-busy on the listbox.',
  ],
  ['sideOffset', 'number', '4', 'Select', 'The gap between the control and the popup, in pixels.'],
  [
    'alignOffset',
    'number',
    '0',
    'Select',
    'How far the popup slides along its own side, in pixels.',
  ],
  [
    'collisionPadding',
    'number',
    '8',
    'Select',
    'How close to the viewport edge the popup may come.',
  ],
  ['clearLabel', 'string', 'Clear selection', 'Select', 'The accessible name of the clear button.'],
  [
    'removeLabel',
    'string',
    'Remove {label}',
    'Select',
    "The accessible name of a chip's remove control. `{label}` is the value's own label.",
  ],
  [
    'summaryLabel',
    'string',
    '{count} selected',
    'Select',
    'What a control too narrow for chips says instead. `{count}` is how many are chosen.',
  ],
  ['emptyLabel', 'string', 'No options', 'Select', 'What the popup says when it holds no options.'],
  [
    'loadingLabel',
    'string',
    'Loading…',
    'Select',
    'What the popup says while an answer is travelling.',
  ],
  [
    'placeholder',
    'ReactNode',
    '—',
    'SelectValue',
    'What the control shows while nothing is chosen.',
  ],
  [
    'children',
    '(values, labels) => ReactNode',
    '—',
    'SelectValue',
    'The summary, when the family’s own is not the right one.',
  ],
  ['empty', 'ReactNode', '—', 'SelectContent', 'Replaces emptyLabel for this popup.'],
  ['status', 'ReactNode', '—', 'SelectContent', 'Replaces loadingLabel for this popup.'],
  [
    'value',
    'string',
    '—',
    'SelectItem',
    'The option’s key: what is submitted and what the request carries.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'SelectItem',
    'Announced, kept in the collection, skipped by every movement key.',
  ],
  ['description', 'ReactNode', '—', 'SelectItem', 'The line under the label.'],
  ['icon', 'ReactNode', '—', 'SelectItem', 'The artwork in the first column.'],
  [
    'textValue',
    'string',
    '—',
    'SelectItem',
    'What typeahead matches on, when the label is not plain text.',
  ],
  [
    'position',
    'number',
    '—',
    'SelectItem',
    'This option’s place in the whole collection, for aria-posinset.',
  ],
  [
    'label',
    'ReactNode',
    '—',
    'SelectGroup',
    'The group’s name, which it points at with aria-labelledby.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: string | string[] | null, request: ChangeRequest)',
    when: 'Before the selection moves. request.reason is pointer, keyboard, clear, select or programmatic, and request.cancel() refuses the change.',
  },
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: ChangeRequest)',
    when: 'Before the popup opens or closes. The reason separates a selection from a dismissal: select, escape, outsidePress, pointer, keyboard, dismiss, blur or programmatic.',
  },
  {
    name: 'onHighlightedValueChange',
    payload: '(value: string | null, request: ChangeRequest)',
    when: 'Before the highlight moves, whether the pointer or a key moved it. The reason is pointer, keyboard or programmatic.',
  },
];

const composition = apiRows([
  [
    'SelectDefaultsProvider',
    'component',
    '—',
    'Application',
    'Every axis and every sentence the family speaks, set once in a bootstrap. A select that states one of them itself still wins.',
  ],
  [
    'render',
    '(props) => ReactNode',
    '—',
    'SelectTrigger, SelectContent',
    'Replaces the frame, or the layer. The button and the listbox carry the role and the wiring, and are not replaceable for that reason.',
  ],
  [
    'ref',
    'Ref<SelectHandle>',
    '—',
    'Select',
    'focus(), open(), close() and scrollToKey(value) — the actions a consumer cannot express declaratively, and no more.',
  ],
  [
    'ref',
    'Ref<HTMLButtonElement>',
    '—',
    'SelectTrigger',
    'The button itself, for a consumer who needs the element rather than the behaviour.',
  ],
  [
    'native props',
    'ComponentPropsWithRef<…>',
    '—',
    'every part',
    'Each part extends its own element’s props. A consumer’s onClick, onKeyDown or aria-label reaches the element that owns it, and the family’s handler composes with it rather than replacing it.',
  ],
]);

const accessibility = [
  'The control is a button with role="combobox", aria-haspopup="listbox" and aria-expanded, and the popup is role="listbox" with role="option" on every row — the three pages of the pattern this family cites.',
  'DOM focus never leaves the button. The highlighted option is named by aria-activedescendant and carries data-current; the chosen options carry aria-selected and data-selected, which is the distinction the listbox pattern draws between where the reader is and what they chose.',
  'A disabled option is announced with aria-disabled, keeps its place in the collection, and is skipped by every movement key including typeahead — so a reader cannot reach by typing a row the family would refuse.',
  'The trigger takes its accessible name from the field’s label through aria-labelledby, because a button is not reliably reached by a label element; a select outside a field takes aria-label.',
  'Tab commits the highlighted option and moves on, which the APG’s select-only example states and notes differs from a native select. Escape closes without committing anything.',
];

const code = defineSnippet({
  id: 'select-react-anatomy',
  language: 'tsx',
  label: 'The anatomy as it reaches the DOM',
  source: `<div
  data-ui="select"
  data-part="root"
  data-size="md"
  data-variant="outline"
  data-full-width
  data-open
>
  <button
    data-part="trigger"
    type="button"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded="true"
    aria-controls="listbox-id"
    aria-activedescendant="option-blueberry"
  >
    <span data-part="value">Blueberry</span>
  </button>
  <button data-part="clear" type="button" aria-label="Clear selection"></button>
  <span data-part="arrow"></span>
</div>;

<div
  data-ui="select"
  data-part="positioner"
  data-side="bottom"
  data-align="start"
  data-width="anchor"
  data-open
>
  <div data-part="content" role="listbox" id="listbox-id">
    <div data-part="group" role="group" aria-labelledby="group-id">
      <div data-part="group-label" id="group-id">
        Berries
      </div>
      <div
        data-part="item"
        role="option"
        id="option-blueberry"
        data-value="blueberry"
        aria-selected="true"
        data-selected
        data-current
      >
        <span data-part="label">Blueberry</span>
        <span data-part="indicator"></span>
      </div>
    </div>
  </div>
</div>;`,
});

const theming = defineSnippet({
  id: 'select-theming',
  language: 'css',
  label: 'What an application retunes',
  source: `[data-ui='select'] {
  --slotted-select-radius: var(--slotted-radius-md);
  --slotted-select-highlight: var(--slotted-tone-accent-surface);
  --slotted-select-highlight-ring: var(--slotted-tone-accent-border);
  --slotted-select-selected-color: var(--slotted-tone-accent-text);
  --slotted-select-measure: 20rem;
}`,
});

export const REACT_SELECT_DOCS = {
  select: {
    accessibility,
    anatomy,
    api,
    composition,
    events,
    imports,
    scenes,
    snippets: [code, theming],
  },
};
