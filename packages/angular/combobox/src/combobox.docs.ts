import comboboxTokens from '@slotted/styles/combobox/tokens.json';
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

export const ANGULAR_COMBOBOX_TOKENS = comboboxTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Combobox decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlCombobox, SlComboboxGroup, SlComboboxItem, SlComboboxSeparator } from '@slotted/angular/combobox';",
  selector: 'sl-combobox, sl-combobox-group, sl-combobox-item, sl-combobox-separator',
  exportAs: 'slCombobox, slComboboxGroup, slComboboxItem, slComboboxSeparator',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'sl-combobox, the host element itself',
    required: true,
    purpose:
      'The frame the reader sees, carrying data-ui="combobox". It draws the border, the shadow, the focus ring and every state — the same frame text-field and select use, from the same tokens.',
  },
  {
    part: 'input',
    element: 'input with role="combobox"',
    required: true,
    purpose:
      "A real text input, so every text-editing key, the caret, the selection, IME and autofill stay the browser's. It keeps DOM focus for the whole interaction.",
  },
  {
    part: 'trigger',
    element: 'button',
    required: true,
    purpose:
      'Opens and closes the popup with the pointer. tabindex="-1": the pattern excludes the popup indicator from the page tab sequence by name.',
  },
  {
    part: 'arrow',
    element: 'span',
    required: true,
    purpose:
      'The chevron inside the trigger, drawn as a mask and turned over while the popup is open.',
  },
  {
    part: 'busy',
    element: 'span',
    required: false,
    purpose:
      "The ring, standing where the chevron stands while an answer is travelling: the chevron says the popup opens, and it does not open onto anything yet. The arc is the shared `spinner` sheet's, worn as `data-ui` beside this part, so the family says only where it stands and how big it is.",
  },
  {
    part: 'clear',
    element: 'button',
    required: false,
    purpose:
      'Takes both contracts back — the text and the chosen key — and returns focus to the field.',
  },
  {
    part: 'positioner',
    element: 'div, built into the portal when the popup opens',
    required: true,
    purpose:
      'The layer. It carries data-ui="combobox" a second time, because a stylesheet cannot reach a subtree that has left its own root.',
  },
  {
    part: 'content',
    element: 'div with role="listbox"',
    required: true,
    purpose:
      'The painted surface, holding the options that survived the filter. Bounded by the height the positioner reports, and it scrolls inside it.',
  },
  {
    part: 'group',
    element: 'sl-combobox-group with role="group"',
    required: false,
    purpose:
      'A set of options with a name. A group whose every option was filtered away is hidden with them.',
  },
  {
    part: 'group-label',
    element: 'div',
    required: false,
    purpose: 'The name of a group, which the group points at with aria-labelledby.',
  },
  {
    part: 'item',
    element: 'sl-combobox-item with role="option"',
    required: true,
    purpose:
      'One option, and the one that decides whether it belongs in the results: it compares its own label against the query and hides itself when it does not match.',
  },
  {
    part: 'indicator',
    element: 'span',
    required: true,
    purpose: 'The check in the last column, on the option that was committed.',
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
      'The option’s words. It wraps to two lines and then truncates, with the whole string still in the DOM.',
  },
  {
    part: 'match',
    element: 'mark',
    required: false,
    purpose:
      'The span of the label the query matched, found with the same collator the filter used. It is the only visual answer to "why is this option in my results".',
  },
  {
    part: 'description',
    element: 'span',
    required: false,
    purpose: 'The line under the label, for the qualifier a label has no room for.',
  },
  {
    part: 'separator',
    element: 'sl-combobox-separator with role="separator"',
    required: false,
    purpose: 'A line between two runs of options.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose: 'What the popup says when nothing matched.',
  },
  {
    part: 'status',
    element: 'div with role="status" and aria-live="polite"',
    required: true,
    purpose:
      'The loading row and the live region at once: a reader who cannot see the list still hears how many options answered their query.',
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
    note: 'One combobox with every axis on it, driven by the controls under the canvas. Type into it and watch the list, the marks and the count answer together.',
    snippet: defineSnippet({
      id: 'combobox-angular-playground',
      language: 'angular',
      label: 'An input, and the options it filters',
      source: `<sl-combobox aria-label="Fruit" placeholder="Search fruit">
  <sl-combobox-item value="blueberry" label="Blueberry" />
  <sl-combobox-item value="raspberry" label="Raspberry" />
</sl-combobox>`,
    }),
  },
  {
    id: 'filtering',
    title: 'Filtering, and the mark',
    note: 'The default comparison is locale-sensitive, so resume finds Resumé — and the mark shows the span the collator matched rather than a naive substring that would disagree with it.',
    snippet: defineSnippet({
      id: 'combobox-angular-filtering',
      language: 'angular',
      label: 'Three answers, and which one each asks for',
      source: `<sl-combobox locale="pt-BR">…</sl-combobox>
<sl-combobox [filter]="startsWith">…</sl-combobox>
<sl-combobox [filter]="null">…</sl-combobox>`,
    }),
  },
  {
    id: 'autocomplete',
    title: 'Autocomplete',
    note: 'The pattern’s own three values. both writes the rest of the first match into the field as a selected range, so the next character replaces it and Backspace withdraws it.',
    snippet: defineSnippet({
      id: 'combobox-angular-autocomplete',
      language: 'angular',
      label: 'What the field does as the reader types',
      source: `<sl-combobox autocomplete="none">…</sl-combobox>
<sl-combobox autocomplete="list">…</sl-combobox>
<sl-combobox autocomplete="both">…</sl-combobox>`,
    }),
  },
  {
    id: 'custom-value',
    title: 'A value that is not on the list',
    note: 'With allowsCustomValue the typed text commits as the value. Without it, Enter puts the text back to the committed option’s label — the pattern’s own "reverts".',
    snippet: defineSnippet({
      id: 'combobox-angular-custom-value',
      language: 'angular',
      label: 'Inventing a value, or refusing to',
      source: `<sl-combobox allowsCustomValue [(value)]="label">…</sl-combobox>`,
    }),
  },
  {
    id: 'creation',
    title: 'Adding a value the list does not hold',
    note: 'With creatable, the last option offers to add what was typed once nothing matched. It is an option — ArrowDown reaches it, Enter takes it — and taking it emits create with the query and selects nothing: the collection is the consumer’s.',
    snippet: defineSnippet({
      id: 'combobox-angular-creation',
      language: 'angular',
      label: 'Offering to add what was typed',
      source: `<sl-combobox creatable (create)="add($event.query)">…</sl-combobox>`,
    }),
  },
  {
    id: 'async',
    title: 'Asynchronous results',
    note: 'Debounce the fetch, not the family: a component that delayed its own request would delay a controlled consumer’s re-render and drop characters between them.',
    snippet: defineSnippet({
      id: 'combobox-angular-async',
      language: 'angular',
      label: 'A search a page owns',
      source: `<sl-combobox
  [filter]="null"
  [loading]="pending()"
  [(inputValue)]="query"
  (loadMore)="fetchNextPage()"
>
  …
</sl-combobox>`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups',
    note: 'Two named groups. A group whose every option was filtered away disappears with them, so a heading never claims a category matched when none did.',
    snippet: defineSnippet({
      id: 'combobox-angular-groups',
      language: 'angular',
      label: 'Results with sections',
      source: `<sl-combobox aria-label="Produce">
  <sl-combobox-group label="Berries">
    <sl-combobox-item value="blueberry" label="Blueberry" />
  </sl-combobox-group>
  <sl-combobox-group label="Citrus">
    <sl-combobox-item value="pomelo" label="Pomelo" />
  </sl-combobox-group>
</sl-combobox>`,
    }),
  },
  {
    id: 'clearable',
    title: 'Clearable',
    note: 'One press takes both contracts back — the text and the chosen key — and focus returns to the field rather than to the document.',
    snippet: defineSnippet({
      id: 'combobox-angular-clearable',
      language: 'angular',
      label: 'Emptying the field',
      source: `<sl-combobox clearable clearLabel="Clear the search">…</sl-combobox>`,
    }),
  },
  {
    id: 'sizes',
    title: 'Sizes',
    note: 'Three steps, every one reading control geometry — so a combobox beside a text field of the same size is the same height to the pixel.',
    snippet: defineSnippet({
      id: 'combobox-angular-sizes',
      language: 'angular',
      label: 'The three control steps',
      source: `<sl-combobox size="sm">…</sl-combobox>
<sl-combobox size="md">…</sl-combobox>
<sl-combobox size="lg">…</sl-combobox>`,
    }),
  },
  {
    id: 'variants',
    title: 'Variants',
    note: 'outline on the page, subtle where a form sinks into its card, and plain for a table cell that is only a control while it is being used.',
    snippet: defineSnippet({
      id: 'combobox-angular-variants',
      language: 'angular',
      label: 'How much frame the control shows',
      source: `<sl-combobox variant="outline">…</sl-combobox>
<sl-combobox variant="subtle">…</sl-combobox>
<sl-combobox variant="plain">…</sl-combobox>`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Required, invalid, read-only and disabled. Read-only keeps the caret, the selection and the copy, and withholds only the popup — which is the family’s to withhold, because the pattern has no readonly.',
    snippet: defineSnippet({
      id: 'combobox-angular-states',
      language: 'angular',
      label: 'What the control refuses, and how it says so',
      source: `<sl-combobox [invalid]="true">…</sl-combobox>
<sl-combobox [readOnly]="true">…</sl-combobox>
<sl-combobox [disabled]="true">…</sl-combobox>`,
    }),
  },
  {
    id: 'empty',
    title: 'Nothing matched, and still travelling',
    note: 'A query with no answers opens onto a sentence. A query whose answer is in flight keeps the same measure, so nothing jumps when the results land.',
    snippet: defineSnippet({
      id: 'combobox-angular-empty',
      language: 'angular',
      label: 'The two states the field spends most time in',
      source: `<sl-combobox emptyLabel="Try a different spelling" loadingLabel="Searching…">…</sl-combobox>`,
    }),
  },
  {
    id: 'long-content',
    title: 'Content the family did not choose',
    note: 'A translated label, an unbroken identifier and two hundred options. The label clamps at two lines with the whole string in the DOM, and the mark sits inside the token that broke.',
    snippet: defineSnippet({
      id: 'combobox-angular-long-content',
      language: 'angular',
      label: 'Long, translated and unbroken',
      source: `<sl-combobox-item value="urn" label="urn:acme:catalogue:9f2c41ab8de07c5511903fbe" />`,
    }),
  },
  {
    id: 'keyboard',
    title: 'Keyboard',
    note: 'The arrows and the page keys move the highlight without moving the caret; Home, End, Backspace and Delete are never intercepted, which the pattern asks for by name.',
    snippet: defineSnippet({
      id: 'combobox-angular-keyboard',
      language: 'angular',
      label: 'What the family binds, and what it leaves alone',
      source: `<sl-combobox openOn="input" [autoHighlight]="false" [loop]="false">…</sl-combobox>`,
    }),
  },
  {
    id: 'form',
    title: 'In a Reactive Form',
    note: 'A ControlValueAccessor and a Validator: required is reported, and so is a typed string that matches no option when a custom value is not allowed — a state no native input can describe.',
    snippet: defineSnippet({
      id: 'combobox-angular-form',
      language: 'angular',
      label: 'A control a form owns',
      source: `<sl-field [required]="true">
  <label slFieldLabel>Reviewer</label>
  <sl-combobox [formControl]="reviewer" [required]="true" aria-label="Reviewer">
    <sl-combobox-item value="amanda" label="Amanda Okoro" />
  </sl-combobox>
</sl-field>`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition',
    note: 'Defaults and all five sentences provided once for a whole application, which is where an application translates them.',
    snippet: defineSnippet({
      id: 'combobox-angular-composition',
      language: 'ts',
      label: 'What a consumer can replace',
      source: `providers: [
  provideComboboxDefaults({
    countLabel: '{count} pessoas',
    emptyLabel: 'Nada encontrado',
    size: 'sm',
  }),
];`,
    }),
  },
];

const api = apiRows([
  [
    'inputValue',
    'model<string>',
    '—',
    'sl-combobox',
    'The characters in the field. Two-way, and not the chosen key.',
  ],
  [
    'value',
    'model<string | null>',
    'null',
    'sl-combobox',
    'The chosen option’s key. Two-way, and a ControlValueAccessor for Reactive Forms.',
  ],
  [
    'defaultValue',
    'string | null',
    '—',
    'sl-combobox',
    'What an unbound value starts from, read once at init. It seeds the key and not the text.',
  ],
  ['open', 'model<boolean>', 'false', 'sl-combobox', 'Whether the popup is showing.'],
  [
    'highlightedValue',
    'model<string | null>',
    'null',
    'sl-combobox',
    'The option the highlight is on, which is not the option that is chosen.',
  ],
  ['placeholder', 'string', '—', 'sl-combobox', 'What the field shows while it is empty.'],
  [
    'filter',
    '((label, query) => boolean) | null',
    '—',
    'sl-combobox',
    'The comparison. Unset asks for the library’s locale-sensitive contains; null turns filtering off.',
  ],
  ['locale', 'string', '—', 'sl-combobox', 'BCP 47, for the comparison the default filter makes.'],
  [
    'items',
    'ComboboxItems',
    '—',
    'sl-combobox',
    'Labels for values, so a closed control can name one the popup never rendered.',
  ],
  [
    'name',
    'string',
    '—',
    'sl-combobox',
    'The submission name. Renders a hidden input carrying the chosen key.',
  ],
  [
    'form',
    'string',
    '—',
    'sl-combobox',
    'The form this control submits with, when it is not the enclosing one.',
  ],
  [
    'total',
    'number',
    '—',
    'sl-combobox',
    'How many options the whole collection holds, for aria-setsize.',
  ],
  [
    'autocomplete',
    "'none' | 'list' | 'both'",
    'list',
    'sl-combobox',
    'The pattern’s own three values for aria-autocomplete.',
  ],
  [
    'openOn',
    "'input' | 'focus' | 'manual'",
    'input',
    'sl-combobox',
    'When the popup opens on its own.',
  ],
  [
    'allowsCustomValue',
    'boolean',
    'false',
    'sl-combobox',
    'Whether the typed text may commit as the value.',
  ],
  [
    'autoHighlight',
    'boolean',
    'false',
    'sl-combobox',
    'Whether the first match is highlighted as soon as the popup opens.',
  ],
  [
    'highlightMatch',
    'boolean',
    'true',
    'sl-combobox',
    'Whether the span the query matched is marked inside each label.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'sl-combobox',
    'The control step. Unset asks the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'sl-combobox',
    'How much frame the control shows.',
  ],
  [
    'side',
    "'bottom' | 'top' | 'inline-start' | 'inline-end'",
    'bottom',
    'sl-combobox',
    'Which edge of the control the popup hangs from.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'sl-combobox',
    'Where the popup lines up along that edge.',
  ],
  [
    'width',
    "'anchor' | 'content'",
    'anchor',
    'sl-combobox',
    'As wide as the control, or as wide as its own options.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'sl-combobox',
    'When the layer is built: only while open, from the first open, or from the start.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'sl-combobox',
    'How the positioner places the layer.',
  ],
  [
    'clearable',
    'boolean',
    'true',
    'sl-combobox',
    'Whether a clear button appears once the field holds something.',
  ],
  ['loop', 'boolean', 'false', 'sl-combobox', 'Whether the arrows wrap at the ends of the list.'],
  ['closeOnSelect', 'boolean', 'true', 'sl-combobox', 'Whether taking an option closes the popup.'],
  ['closeOnEscape', 'boolean', 'true', 'sl-combobox', 'Whether Escape closes the popup.'],
  [
    'closeOnOutsidePress',
    'boolean',
    'true',
    'sl-combobox',
    'Whether a press outside closes the popup.',
  ],
  [
    'flip',
    'boolean',
    'true',
    'sl-combobox',
    'Whether the popup may move to the opposite side when it does not fit.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'sl-combobox',
    'Whether the popup may slide along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'sl-combobox',
    'Whether the popup hides once its control has scrolled out of view.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'sl-combobox',
    'Whether the layer is built at the end of the document.',
  ],
  [
    'fullWidth',
    'boolean',
    'true',
    'sl-combobox',
    'Whether the control fills its field, or shrinks to its own width.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'sl-combobox',
    'Answers nothing. Unset asks the field, and the form’s own disabled state.',
  ],
  [
    'readOnly',
    'boolean',
    'false',
    'sl-combobox',
    'Keeps the caret and the copy, and withholds the popup. Unset asks the field.',
  ],
  [
    'required',
    'boolean',
    'false',
    'sl-combobox',
    'The native attribute, and a validity the Validator reports.',
  ],
  [
    'invalid',
    'boolean',
    'false',
    'sl-combobox',
    'Retargets the focus ring and the border. Unset asks the field.',
  ],
  [
    'loading',
    'boolean',
    'false',
    'sl-combobox',
    'Paints the status row and sets aria-busy on the listbox.',
  ],
  [
    'sideOffset',
    'number',
    '4',
    'sl-combobox',
    'The gap between the control and the popup, in pixels.',
  ],
  [
    'alignOffset',
    'number',
    '0',
    'sl-combobox',
    'How far the popup slides along its own side, in pixels.',
  ],
  [
    'collisionPadding',
    'number',
    '8',
    'sl-combobox',
    'How close to the viewport edge the popup may come.',
  ],
  ['clearLabel', 'string', 'Clear', 'sl-combobox', 'The accessible name of the clear button.'],
  [
    'createLabel',
    'string',
    'Create \u201c{query}\u201d',
    'sl-combobox',
    'The offer to add what was typed. `{query}` is the text.',
  ],
  [
    'emptyLabel',
    'string',
    'No matches',
    'sl-combobox',
    'What the popup says when nothing matched.',
  ],
  [
    'loadingLabel',
    'string',
    'Loading…',
    'sl-combobox',
    'What the popup says while an answer is travelling.',
  ],
  [
    'triggerLabel',
    'string',
    'Show options',
    'sl-combobox',
    'The accessible name of the button that opens the popup.',
  ],
  [
    'countLabel',
    'string',
    '{count} results',
    'sl-combobox',
    'The sentence the live region announces. {count} becomes the number.',
  ],
  [
    'value',
    'string',
    '—',
    'sl-combobox-item',
    'The option’s key: what is submitted and what the request carries.',
  ],
  [
    'label',
    'string',
    '—',
    'sl-combobox-item',
    'What the reader sees, what the filter compares, and what the mark splits.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'sl-combobox-item',
    'Announced, kept in the collection, skipped by every movement key.',
  ],
  ['description', 'string', '—', 'sl-combobox-item', 'The line under the label.'],
  [
    'icon',
    'string',
    '—',
    'sl-combobox-item',
    'A glyph token name, drawn as a mask in the first column.',
  ],
  [
    'position',
    'number',
    '—',
    'sl-combobox-item',
    'This option’s place in the whole collection, for aria-posinset.',
  ],
  [
    'label',
    'string',
    '—',
    'sl-combobox-group',
    'The group’s name, which it points at with aria-labelledby.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'inputValueChange',
    payload: 'string',
    when: 'The two-way half of the text model, after the change is committed.',
  },
  {
    name: 'inputValueChangeRequest',
    payload: 'ChangeRequest<string>',
    when: 'Before the text moves. reason is keyboard while the reader types, select when an option was taken, clear, blur or programmatic.',
  },
  {
    name: 'valueChangeRequest',
    payload: 'ChangeRequest<string | null>',
    when: 'Before the chosen key moves. Typing emits only the text request; committing an option emits both, each with reason select.',
  },
  {
    name: 'openChangeRequest',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the popup opens or closes, with the reason that separates a selection from a dismissal.',
  },
  {
    name: 'highlightedValueChangeRequest',
    payload: 'ChangeRequest<string | null>',
    when: 'Before the highlight moves, and when the filter takes the highlighted option away.',
  },
  {
    name: 'loadMore',
    payload: 'void',
    when: 'The end of the rendered list came into view. The consumer fetches the next page; the family holds no cursor of its own.',
  },
];

const composition = apiRows([
  [
    'provideComboboxDefaults()',
    'Provider',
    '—',
    'Application',
    'Every axis and all five sentences the family speaks, provided once in a bootstrap or a route.',
  ],
  [
    'exportAs',
    'slCombobox',
    '—',
    'sl-combobox',
    'The instance, for a template that needs focus(), setOpen() or scrollToKey().',
  ],
  [
    'ControlValueAccessor',
    'NG_VALUE_ACCESSOR',
    '—',
    'sl-combobox',
    'formControl, formControlName and ngModel all move the chosen key, and the form’s disabled state reaches the control.',
  ],
  [
    'Validator',
    'NG_VALIDATORS',
    '—',
    'sl-combobox',
    'required, and a typed string that matches no option while allowsCustomValue is off — a state no native input can describe.',
  ],
  [
    'native attributes',
    'placeholder, maxlength, autocapitalize…',
    '—',
    'sl-combobox',
    'The input keeps every native attribute the host forwards to it, and the reader keeps every text-editing key.',
  ],
]);

const accessibility = [
  'The input is role="combobox" with aria-autocomplete, aria-expanded and aria-controls; the popup is role="listbox" with role="option" on every row. The trigger button is out of the page tab sequence, which the pattern requires by name.',
  'DOM focus never leaves the input, so every text-editing key stays the browser’s: Home, End, the caret arrows, Backspace and Delete are never intercepted. The highlight moves through aria-activedescendant instead, and the caret does not move with it.',
  'Escape has both of the steps the pattern names: open, it closes and keeps what was typed; closed, it puts the text back to the committed label, and a second press clears the selection.',
  'The status row is a polite live region as well as the loading message, so a reader who cannot see the list hears how many options answered — and hears "Loading…" rather than silence while the answer travels.',
  'Tab commits nothing: a highlight the reader arrowed past is not a choice they made, which is where this family parts company with select. A completion string still standing is a choice, and Tab accepts it.',
];

const code = defineSnippet({
  id: 'combobox-angular-anatomy',
  language: 'angular',
  label: 'The anatomy as it reaches the DOM',
  source: `<sl-combobox data-ui="combobox" data-part="root" data-size="md" data-open>
  <input
    data-part="input"
    type="text"
    role="combobox"
    aria-autocomplete="list"
    aria-expanded="true"
  />
  <button data-part="clear" type="button" aria-label="Clear"></button>
  <button data-part="trigger" type="button" tabindex="-1" aria-label="Show options">
    <span data-part="arrow"></span>
  </button>
</sl-combobox>`,
});

const theming = defineSnippet({
  id: 'combobox-theming',
  language: 'css',
  label: 'What an application retunes',
  source: `[data-ui='combobox'] {
  --slotted-combobox-radius: var(--slotted-radius-md);
  --slotted-combobox-highlight: var(--slotted-tone-accent-surface);
  --slotted-combobox-measure: 28rem;
}

/* The span a query matched is the shared mark, painted once for every
   list a reader types into, and retuned under its own identifier. */
[data-ui='highlight'] {
  --slotted-highlight-background: var(--slotted-tone-warning-surface);
}`,
});

export const ANGULAR_COMBOBOX_DOCS = {
  combobox: {
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
