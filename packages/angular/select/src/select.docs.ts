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

export const ANGULAR_SELECT_TOKENS = selectTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Select decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlSelect, SlSelectGroup, SlSelectItem, SlSelectSeparator, SlSelectValue } from '@slotted/angular/select';",
  selector: 'sl-select, sl-select-group, sl-select-item, sl-select-separator, [slSelectValue]',
  exportAs: 'slSelect, slSelectGroup, slSelectItem, slSelectSeparator',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'sl-select, the host element itself',
    required: true,
    purpose:
      'The frame the reader sees, carrying data-ui="select". It draws the border, the shadow, the focus ring and every state — the same frame text-field uses, from the same tokens.',
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
    element: 'span',
    required: true,
    purpose:
      'What the control shows: the chosen label, a summary of several, or the placeholder. An ng-template with slSelectValue replaces the summary. data-placeholder while nothing is chosen; data-unmatched when a value could not be resolved.',
  },
  {
    part: 'arrow',
    element: 'span',
    required: true,
    purpose:
      "The chevron, drawn as a mask and turned over while the popup is open. It is placed against the frame's end and is inert: the trigger's own padding runs underneath it.",
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
      'Takes the selection back. Present only while clearable is set and something is chosen, and a sibling of the trigger rather than a child.',
  },
  {
    part: 'positioner',
    element: 'div, built into the portal when the popup opens',
    required: true,
    purpose:
      'The layer. It carries data-ui="select" a second time, because a stylesheet cannot reach a subtree that has left its own root, and its content is an ng-template — so a hundred options are not constructed until the popup is.',
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
    element: 'sl-select-group with role="group"',
    required: false,
    purpose: 'A set of options with a name, which it points at with aria-labelledby.',
  },
  {
    part: 'group-label',
    element: 'div',
    required: false,
    purpose: 'The name of a group — required of every option group by the listbox pattern.',
  },
  {
    part: 'item',
    element: 'sl-select-item with role="option"',
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
    purpose: 'The artwork in the first column, from a glyph token named by the icon input.',
  },
  {
    part: 'label',
    element: 'span',
    required: true,
    purpose:
      'The option’s words, and the only column that gives way. It wraps to two lines and then truncates, with the whole string still in the DOM.',
  },
  {
    part: 'description',
    element: 'span',
    required: false,
    purpose: 'The line under the label, for the qualifier a label has no room for.',
  },
  {
    part: 'separator',
    element: 'sl-select-separator with role="separator"',
    required: false,
    purpose: 'A line between two runs of options.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose:
      'What the popup says when it holds no options. It opens onto a sentence rather than onto nothing.',
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
      id: 'select-angular-playground',
      language: 'angular',
      label: 'A control, and the options it opens',
      source: `<sl-select aria-label="Fruit" placeholder="Choose a fruit">
  <sl-select-item value="apple">Apple</sl-select-item>
  <sl-select-item value="blueberry">Blueberry</sl-select-item>
</sl-select>`,
    }),
  },
  {
    id: 'selection',
    title: 'Two-way, and the request',
    note: 'The model moves the value in both directions; the request output arrives first and carries the reason, so a page can tell a press from a key — or refuse the change.',
    snippet: defineSnippet({
      id: 'select-angular-selection',
      language: 'angular',
      label: 'Who owns the value',
      source: `<sl-select [(value)]="fruit" (valueChangeRequest)="log($event.reason)">…</sl-select>`,
    }),
  },
  {
    id: 'placeholder',
    title: 'Placeholder and unresolved values',
    note: 'Nothing chosen shows the placeholder in the muted step. A value the collection cannot name shows the value itself, which is what an async list holds for one render.',
    snippet: defineSnippet({
      id: 'select-angular-placeholder',
      language: 'angular',
      label: 'Empty, and holding a value it cannot name',
      source: `<sl-select placeholder="Choose a fruit" [items]="known" [value]="'usr_8f21c0'">…</sl-select>`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups, icons and descriptions',
    note: 'Two named groups with a line between them. Every label starts on the same line whether or not its option carries artwork, because the column belongs to the list.',
    snippet: defineSnippet({
      id: 'select-angular-groups',
      language: 'angular',
      label: 'A list with sections',
      source: `<sl-select aria-label="Produce">
  <sl-select-group label="Berries">
    <sl-select-item value="raspberry" description="In season until September">
      Raspberry
    </sl-select-item>
  </sl-select-group>
  <sl-select-separator />
  <sl-select-group label="Citrus">
    <sl-select-item value="pomelo">Pomelo</sl-select-item>
  </sl-select-group>
</sl-select>`,
    }),
  },
  {
    id: 'multiple',
    title: 'Multiple selection',
    note: 'The popup stays open as options are taken, and the control shows the first label and how many more. Space toggles without closing, which is the listbox pattern’s own model.',
    snippet: defineSnippet({
      id: 'select-angular-multiple',
      language: 'angular',
      label: 'Several values, summarised',
      source: `<sl-select multiple [(value)]="fruit">
  <ng-template slSelectValue let-values>{{ values.length }} chosen</ng-template>
  <sl-select-item value="apple">Apple</sl-select-item>
</sl-select>`,
    }),
  },
  {
    id: 'clearable',
    title: 'Clearable',
    note: 'The clear button appears only once something is chosen, and focus goes back to the control it belonged to rather than to the document.',
    snippet: defineSnippet({
      id: 'select-angular-clearable',
      language: 'angular',
      label: 'Taking the choice back',
      source: `<sl-select clearable [(value)]="fruit">…</sl-select>`,
    }),
  },
  {
    id: 'sizes',
    title: 'Sizes',
    note: 'Three steps, and every one of them reads control geometry — so a select beside a text field of the same size is the same height to the pixel.',
    snippet: defineSnippet({
      id: 'select-angular-sizes',
      language: 'angular',
      label: 'The three control steps',
      source: `<sl-select size="sm">…</sl-select>
<sl-select size="md">…</sl-select>
<sl-select size="lg">…</sl-select>`,
    }),
  },
  {
    id: 'variants',
    title: 'Variants',
    note: 'outline on the page, subtle where a form sinks into its card, and plain for a table cell that is only a control while it is being used.',
    snippet: defineSnippet({
      id: 'select-angular-variants',
      language: 'angular',
      label: 'How much frame the control shows',
      source: `<sl-select variant="outline">…</sl-select>
<sl-select variant="subtle">…</sl-select>
<sl-select variant="plain">…</sl-select>`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Required, invalid, read-only and disabled side by side. Read-only keeps its value legible and refuses to open; disabled answers nothing at all.',
    snippet: defineSnippet({
      id: 'select-angular-states',
      language: 'angular',
      label: 'What the control refuses, and how it says so',
      source: `<sl-select invalid>…</sl-select>
<sl-select readOnly [value]="'apple'">…</sl-select>
<sl-select disabled [value]="'apple'">…</sl-select>`,
    }),
  },
  {
    id: 'loading-and-empty',
    title: 'Loading and empty',
    note: 'A popup with nothing in it opens onto a sentence rather than onto a two-pixel box, and a loading one keeps that measure so nothing jumps when the options land.',
    snippet: defineSnippet({
      id: 'select-angular-loading-and-empty',
      language: 'angular',
      label: 'Two states no surveyed implementation draws',
      source: `<sl-select loading loadingLabel="Fetching teams…">…</sl-select>
<sl-select emptyLabel="No teams yet"></sl-select>`,
    }),
  },
  {
    id: 'long-content',
    title: 'Content the family did not choose',
    note: 'A translated label, an unbroken identifier and a hundred options. The label clamps at two lines with the whole string still in the DOM, and the token breaks inside the option.',
    snippet: defineSnippet({
      id: 'select-angular-long-content',
      language: 'angular',
      label: 'Long, translated and unbroken',
      source: `<sl-select-item value="urn">urn:acme:catalogue:9f2c41ab8de07c5511903fbe</sl-select-item>`,
    }),
  },
  {
    id: 'placement',
    title: 'Placement and width',
    note: 'The popup hangs from the start edge of its control and is as wide as it. width="content" lets it size to its own options, for a list with descriptions.',
    snippet: defineSnippet({
      id: 'select-angular-placement',
      language: 'angular',
      label: 'Where the popup goes, and how wide it is',
      source: `<sl-select side="top" align="end" width="content">…</sl-select>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'Keyboard',
    note: 'Focus never leaves the button: the arrows, Home, End and the page keys move aria-activedescendant, and typing jumps to the first option that begins with it.',
    snippet: defineSnippet({
      id: 'select-angular-keyboard',
      language: 'angular',
      label: 'What the reader can reach without a pointer',
      source: `<sl-select typeahead [typeaheadTimeout]="500" [loop]="false">…</sl-select>`,
    }),
  },
  {
    id: 'form',
    title: 'In a Reactive Form',
    note: 'The control is a ControlValueAccessor and a Validator, so formControl moves the value and required is reported by the family — the hidden native select always holds an option, so the browser cannot answer it.',
    snippet: defineSnippet({
      id: 'select-angular-form',
      language: 'angular',
      label: 'A control a form owns',
      source: `<sl-field required>
  <label slFieldLabel>Fruit</label>
  <sl-select [formControl]="fruit" required aria-label="Fruit">
    <sl-select-item value="apple">Apple</sl-select-item>
  </sl-select>
  <span slFieldError>Choose one.</span>
</sl-field>`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition',
    note: 'Defaults provided once for a whole application, a summary the consumer writes as a template, and the instance reached from the template through exportAs.',
    snippet: defineSnippet({
      id: 'select-angular-composition',
      language: 'ts',
      label: 'What a consumer can replace',
      source: `providers: [provideSelectDefaults({ size: 'sm', variant: 'subtle', width: 'content' })];`,
    }),
  },
];

const api = apiRows([
  [
    'value',
    'model<string | string[] | null>',
    'null',
    'sl-select',
    'The chosen value, or values. Two-way, and a ControlValueAccessor for Reactive Forms.',
  ],
  ['open', 'model<boolean>', 'false', 'sl-select', 'Whether the popup is showing.'],
  [
    'highlightedValue',
    'model<string | null>',
    'null',
    'sl-select',
    'The option the highlight is on, which is not the option that is chosen.',
  ],
  ['placeholder', 'string', '—', 'sl-select', 'What the control shows while nothing is chosen.'],
  [
    'items',
    'SelectItems',
    '—',
    'sl-select',
    'Labels for values, so a closed control can name one the popup never rendered.',
  ],
  [
    'name',
    'string',
    '—',
    'sl-select',
    'The submission name. Renders a hidden native select carrying it.',
  ],
  [
    'form',
    'string',
    '—',
    'sl-select',
    'The form this control submits with, when it is not the enclosing one.',
  ],
  [
    'total',
    'number',
    '—',
    'sl-select',
    'How many options the whole collection holds, for aria-setsize.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'sl-select',
    'The control step. Unset asks the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'sl-select',
    'How much frame the control shows.',
  ],
  [
    'side',
    "'bottom' | 'top' | 'inline-start' | 'inline-end'",
    'bottom',
    'sl-select',
    'Which edge of the control the popup hangs from.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'sl-select',
    'Where the popup lines up along that edge.',
  ],
  [
    'width',
    "'anchor' | 'content'",
    'anchor',
    'sl-select',
    'As wide as the control, or as wide as its own options.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'sl-select',
    'When the layer is built: only while open, from the first open, or from the start.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'sl-select',
    'How the positioner places the layer.',
  ],
  ['multiple', 'boolean', 'false', 'sl-select', 'Whether more than one option may be chosen.'],
  [
    'clearable',
    'boolean',
    'false',
    'sl-select',
    'Whether a clear button appears once something is chosen.',
  ],
  ['loop', 'boolean', 'false', 'sl-select', 'Whether the arrows wrap at the ends of the list.'],
  [
    'typeahead',
    'boolean',
    'true',
    'sl-select',
    'Whether typing jumps to the first matching option.',
  ],
  [
    'typeaheadTimeout',
    'number',
    '500',
    'sl-select',
    'How long a typed sequence stays open, in milliseconds.',
  ],
  [
    'closeOnSelect',
    'boolean',
    'true',
    'sl-select',
    'Whether taking an option closes the popup. Ignored while multiple is set.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'sl-select', 'Whether Escape closes the popup.'],
  [
    'closeOnOutsidePress',
    'boolean',
    'true',
    'sl-select',
    'Whether a press outside closes the popup.',
  ],
  [
    'flip',
    'boolean',
    'true',
    'sl-select',
    'Whether the popup may move to the opposite side when it does not fit.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'sl-select',
    'Whether the popup may slide along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'sl-select',
    'Whether the popup hides once its control has scrolled out of view.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'sl-select',
    'Whether the layer is built at the end of the document.',
  ],
  [
    'fullWidth',
    'boolean',
    'true',
    'sl-select',
    'Whether the control fills its field, or shrinks to its widest value.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'sl-select',
    'Answers nothing. Unset asks the field, and the form’s own disabled state.',
  ],
  [
    'readOnly',
    'boolean',
    'false',
    'sl-select',
    'Keeps its value legible and refuses to open. Unset asks the field.',
  ],
  [
    'required',
    'boolean',
    'false',
    'sl-select',
    'Announced with aria-required, and reported as a validity by the Validator.',
  ],
  [
    'invalid',
    'boolean',
    'false',
    'sl-select',
    'Retargets the focus ring and the border. Unset asks the field.',
  ],
  [
    'loading',
    'boolean',
    'false',
    'sl-select',
    'Paints the status row and sets aria-busy on the listbox.',
  ],
  [
    'sideOffset',
    'number',
    '4',
    'sl-select',
    'The gap between the control and the popup, in pixels.',
  ],
  [
    'alignOffset',
    'number',
    '0',
    'sl-select',
    'How far the popup slides along its own side, in pixels.',
  ],
  [
    'collisionPadding',
    'number',
    '8',
    'sl-select',
    'How close to the viewport edge the popup may come.',
  ],
  [
    'clearLabel',
    'string',
    'Clear selection',
    'sl-select',
    'The accessible name of the clear button.',
  ],
  [
    'removeLabel',
    'string',
    'Remove {label}',
    'sl-select',
    "The accessible name of a chip's remove control. `{label}` is the value's own label.",
  ],
  [
    'summaryLabel',
    'string',
    '{count} selected',
    'sl-select',
    'What a control too narrow for chips says instead. `{count}` is how many are chosen.',
  ],
  [
    'emptyLabel',
    'string',
    'No options',
    'sl-select',
    'What the popup says when it holds no options.',
  ],
  [
    'loadingLabel',
    'string',
    'Loading…',
    'sl-select',
    'What the popup says while an answer is travelling.',
  ],
  [
    'value',
    'string',
    '—',
    'sl-select-item',
    'The option’s key: what is submitted and what the request carries.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'sl-select-item',
    'Announced, kept in the collection, skipped by every movement key.',
  ],
  ['description', 'string', '—', 'sl-select-item', 'The line under the label.'],
  [
    'icon',
    'string',
    '—',
    'sl-select-item',
    'A glyph token name, drawn as a mask in the first column.',
  ],
  [
    'textValue',
    'string',
    '—',
    'sl-select-item',
    'What typeahead matches on, when the label is not plain text.',
  ],
  [
    'position',
    'number',
    '—',
    'sl-select-item',
    'This option’s place in the whole collection, for aria-posinset.',
  ],
  [
    'label',
    'string',
    '—',
    'sl-select-group',
    'The group’s name, which it points at with aria-labelledby.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'valueChange',
    payload: 'string | string[] | null',
    when: 'The two-way half of the model, after the change is committed.',
  },
  {
    name: 'valueChangeRequest',
    payload: 'ChangeRequest<string | string[] | null>',
    when: 'Before the selection moves. reason is pointer, keyboard, clear, select or programmatic, and cancel() refuses the change.',
  },
  {
    name: 'openChange',
    payload: 'boolean',
    when: 'The two-way half of the open model.',
  },
  {
    name: 'openChangeRequest',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the popup opens or closes. The reason separates a selection from a dismissal: select, escape, outsidePress, pointer, keyboard, dismiss, blur or programmatic.',
  },
  {
    name: 'highlightedValueChangeRequest',
    payload: 'ChangeRequest<string | null>',
    when: 'Before the highlight moves, whether the pointer or a key moved it.',
  },
];

const composition = apiRows([
  [
    'provideSelectDefaults()',
    'Provider',
    '—',
    'Application',
    'Every axis and every sentence the family speaks, provided once in a bootstrap or a route. A select that states one of them itself still wins.',
  ],
  [
    'slSelectValue',
    'ng-template',
    '—',
    'sl-select',
    'The summary, when the family’s own is not the right one. Its context carries the values and the labels the family resolved.',
  ],
  [
    'exportAs',
    'slSelect',
    '—',
    'sl-select',
    'The instance, for a template that needs focus(), setOpen() or scrollToKey().',
  ],
  [
    'ControlValueAccessor',
    'NG_VALUE_ACCESSOR',
    '—',
    'sl-select',
    'formControl, formControlName and ngModel all move the value, and the form’s disabled state reaches the control.',
  ],
  [
    'Validator',
    'NG_VALIDATORS',
    '—',
    'sl-select',
    'required is reported by the family: the hidden native select always holds an option, so the browser cannot answer the question.',
  ],
]);

const accessibility = [
  'The control is a button with role="combobox", aria-haspopup="listbox" and aria-expanded, and the popup is role="listbox" with role="option" on every row — the three pages of the pattern this family cites.',
  'DOM focus never leaves the button. The highlighted option is named by aria-activedescendant and carries data-current; the chosen options carry aria-selected and data-selected, which is the distinction the listbox pattern draws between where the reader is and what they chose.',
  'A disabled option is announced with aria-disabled, keeps its place in the collection, and is skipped by every movement key including typeahead — so a reader cannot reach by typing a row the family would refuse.',
  'The trigger takes its accessible name from the field’s label through aria-labelledby, because a button is not reliably reached by a label element; a select outside a field takes aria-label, which the host forwards.',
  'Tab commits the highlighted option and moves on, which the APG’s select-only example states and notes differs from a native select. Escape closes without committing anything.',
];

const code = defineSnippet({
  id: 'select-angular-anatomy',
  language: 'angular',
  label: 'The anatomy as it reaches the DOM',
  source: `<sl-select data-ui="select" data-part="root" data-size="md" data-variant="outline" data-open>
  <button
    data-part="trigger"
    type="button"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded="true"
    aria-activedescendant="option-blueberry"
  >
    <span data-part="value">Blueberry</span>
  </button>
  <span data-part="arrow"></span>
</sl-select>`,
});

const theming = defineSnippet({
  id: 'select-theming',
  language: 'css',
  label: 'What an application retunes',
  source: `[data-ui='select'] {
  --slotted-select-radius: var(--slotted-radius-md);
  --slotted-select-highlight: var(--slotted-tone-accent-surface);
  --slotted-select-highlight-ring: var(--slotted-tone-accent-border);
  --slotted-select-measure: 20rem;
}`,
});

export const ANGULAR_SELECT_DOCS = {
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
