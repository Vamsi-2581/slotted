import multiSelectTokens from '@slotted/styles/multi-select/tokens.json';
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

export const ANGULAR_MULTI_SELECT_TOKENS = multiSelectTokens.map((name) => ({
  name,
  purpose: 'Theme-owned MultiSelect decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlMultiSelect, SlMultiSelectGroup, SlMultiSelectItem, SlMultiSelectSeparator } from '@slotted/angular/multi-select';",
  selector:
    'sl-multi-select, sl-multi-select-group, sl-multi-select-item, sl-multi-select-separator',
  exportAs: 'slMultiSelect, slMultiSelectGroup, slMultiSelectItem, slMultiSelectSeparator',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'sl-multi-select, the host element itself',
    required: true,
    purpose:
      'The frame, carrying data-ui="multi-select". It draws the border, the shadow, the focus ring and every state, and it is the only control in the library whose height is not a token: it grows by whole rows of chips to three, then scrolls.',
  },
  {
    part: 'control',
    element: 'div with role="grid"',
    required: true,
    purpose:
      'The layout grid the chips and the field live in. The APG names this exact control — "a list of recipients for a message may be a grid where each cell contains a link that represents a recipient" — and one element of a layout grid is in the page tab sequence.',
  },
  {
    part: 'chips',
    element: 'div with role="row"',
    required: true,
    purpose:
      'One DOM row, however many lines it draws. The wrap is CSS, so the reading order stays linear and ArrowDown and ArrowUp are left free for the popup. It scrolls past three rows and draws no scrollbar: a bar inside a field frame reads as a panel that got into a control.',
  },
  {
    part: 'field',
    element: 'span with role="gridcell"',
    required: true,
    purpose:
      'The last cell of the row, holding the caret. It wraps with the chips rather than being pushed to a line of its own, and it asks for a word of width while keeping a floor of two characters.',
  },
  {
    part: 'input',
    element: 'input with role="combobox"',
    required: true,
    purpose:
      "A real text input, so every text-editing key, the caret, the selection, IME and autofill stay the browser's. It is the control's one tab stop and carries aria-expanded, aria-controls and aria-activedescendant.",
  },
  {
    part: 'counter',
    element: 'span',
    required: false,
    purpose:
      'How many values are held against the limit that holds them. Drawn only where it answers something — while max is set, or while the frame is too narrow for a chip — because a counter with nothing to count against is furniture.',
  },
  {
    part: 'busy',
    element: 'span',
    required: false,
    purpose:
      'The ring, standing where the chevron stands while an answer is travelling: the chevron says the popup opens, and it does not open onto anything yet. The arc is the shared spinner sheet’s.',
  },
  {
    part: 'clear',
    element: 'button',
    required: false,
    purpose:
      'Takes the whole set out at once, under the reason clear. Present only while clearable is set and the control holds something.',
  },
  {
    part: 'trigger',
    element: 'button',
    required: true,
    purpose:
      'Opens and closes the popup with the pointer. tabindex="-1": the combobox pattern excludes the popup indicator from the page tab sequence by name.',
  },
  {
    part: 'arrow',
    element: 'span',
    required: true,
    purpose:
      'The chevron inside the trigger, drawn as a mask from the glyph scale and turned over while the popup is open.',
  },
  {
    part: 'positioner',
    element: 'div, written by the layer template',
    required: true,
    purpose:
      'The layer, portalled to the end of the document. It carries data-ui="multi-select" a second time, because a stylesheet cannot reach a subtree that has left its own root.',
  },
  {
    part: 'content',
    element: 'div with role="listbox" and aria-multiselectable',
    required: true,
    purpose:
      'The painted surface. It is multi-selectable and selection does not follow focus, which is where this family knowingly leaves the combobox pattern — the departure and its cost are in the contract.',
  },
  {
    part: 'chosen',
    element: 'div',
    required: false,
    purpose:
      'Every chosen value, at the top of the surface, whatever the row in the control did with them. It is what keeps overflow="collapse" honest: the +N chip summarises and this band is where the whole set stays reachable.',
  },
  {
    part: 'group',
    element: 'div with role="group"',
    required: false,
    purpose:
      'A set of options with a name. A group whose every option was filtered away renders nothing: a heading with no options under it says a category matched when none did.',
  },
  {
    part: 'group-label',
    element: 'div',
    required: false,
    purpose: 'The name of a group, which the group points at with aria-labelledby.',
  },
  {
    part: 'item',
    element: 'div with role="option"',
    required: true,
    purpose:
      'One option, and the one that decides whether it belongs in the results: it compares its own label against the query and renders nothing when it does not match. An option the set already holds is still an option — pressing it takes the value back out.',
  },
  {
    part: 'indicator',
    element: 'span',
    required: true,
    purpose:
      'The check on a chosen option, and the plus on the offer to add what was typed. The check says a value is in the set; the plus says nothing is yet.',
  },
  {
    part: 'icon',
    element: 'span',
    required: false,
    purpose: 'The mark in an option’s first column, for a list whose rows are recognisable.',
  },
  {
    part: 'label',
    element: 'span',
    required: true,
    purpose:
      'What the reader chooses by, clamped to two lines. Scoped to the option: a chip in the control carries a label of its own, and an unscoped rule reached it.',
  },
  {
    part: 'match',
    element: 'mark, the match part of the highlight family, whose root sits inside label',
    required: false,
    purpose:
      'The span the query found, painted by the shared highlight sheet so every list a reader types into says the same thing about the same span.',
  },
  {
    part: 'description',
    element: 'span',
    required: false,
    purpose: 'A second line under an option’s label, for what the label alone cannot say.',
  },
  {
    part: 'separator',
    element: 'hr with role="separator"',
    required: false,
    purpose: 'A line between two sets of options.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose:
      'The message for a query nothing answered. It keeps the surface’s measure rather than collapsing, so nothing jumps when results land.',
  },
  {
    part: 'status',
    element: 'div with role="status"',
    required: true,
    purpose:
      'The live region, and the loading row. A reader who cannot see the list still hears how many options answered their query.',
  },
  {
    part: 'placeholder',
    element: 'div holding skeleton rows',
    required: false,
    purpose:
      'The wait, as the shape of the list that is coming. Hidden from assistive technology, because the status row beside it is the live region.',
  },
];

const accessibility = [
  'The control is one tab stop. The combobox pattern excludes the popup indicator from the page tab sequence and the grid pattern puts one element of a layout grid in it — the field is that element, and every chip and both buttons carry tabindex="-1".',
  'The chips are a layout grid with one row: the APG names this control by example, and one DOM row is what leaves ArrowDown and ArrowUp free for the popup. Focus lands on the cell rather than on the remove button inside it, and Delete and Backspace do what the button does.',
  'The popup writes aria-multiselectable and selection does not follow focus, which is a knowing departure from the combobox pattern’s own note. Every implementation surveyed on 2026-09-10 makes the same one, and the cost is written in the contract.',
  'What happens is said as well as drawn: a value added with the count now held, a value removed with the label that left and the count that is left, a value moved with its new position, and the limit when it is reached.',
];
const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls under the canvas. Add a service, take one back out, and watch the row grow by whole rows rather than by pixels.',
    snippet: defineSnippet({
      id: 'multi-select-angular-playground',
      language: 'angular',
      label: 'A frame of chosen values, and a field that adds more',
      source: `<sl-multi-select
  aria-label="Affected services"
  placeholder="Add a service"
  [defaultValue]="['checkout-api']"
>
  <sl-multi-select-item value="checkout-api" label="checkout-api" />
  <sl-multi-select-item value="payments-worker" label="payments-worker" />
</sl-multi-select>`,
    }),
  },
  {
    id: 'chips',
    title: 'The chips, and where they live',
    note: 'Inside the frame, beside the caret, because this control holds a real input. Each chip is a tag: the same pill, the same remove control, the same geometry stated once in tag.css.',
    snippet: defineSnippet({
      id: 'multi-select-angular-chips',
      language: 'angular',
      label: 'The set is an array, and the order is the reader’s',
      source: `<sl-multi-select aria-label="Affected services" [(value)]="services">
  <sl-multi-select-item value="checkout-api" label="checkout-api" />
</sl-multi-select>`,
    }),
  },
  {
    id: 'creation',
    title: 'Creating a value the list does not hold',
    note: 'With creatable, the offer stands as an option — ArrowDown reaches it, aria-activedescendant names it and Enter takes it — and its mark is the plus rather than the check, because nothing is in the set yet.',
    snippet: defineSnippet({
      id: 'multi-select-angular-creation',
      language: 'angular',
      label: 'Text becomes a value, under the reason submit',
      source: `<sl-multi-select aria-label="Labels" creatable (valueChangeRequest)="onLabels($event)">
  <sl-multi-select-item value="regression" label="regression" />
</sl-multi-select>`,
    }),
  },
  {
    id: 'limit',
    title: 'A limit that is a validity, not a silence',
    note: 'At the limit the counter takes the accent, the root carries data-complete, every unchosen option answers aria-disabled, and what was refused leaves through valueRefuse instead of vanishing.',
    snippet: defineSnippet({
      id: 'multi-select-angular-limit',
      language: 'angular',
      label: 'What the control refuses, and how it says so',
      source: `<sl-multi-select aria-label="Responders" [max]="3" (valueRefuse)="warn($event)">
  <sl-multi-select-item value="ana.pereira" label="Ana Pereira" />
</sl-multi-select>`,
    }),
  },
  {
    id: 'duplicates',
    title: 'Duplicates',
    note: 'The comparison is locale-sensitive, so P1 is already held when p1 is typed. The refusal moves focus to the chip that holds it: the reader is shown where their value is instead of being told nothing happened.',
    snippet: defineSnippet({
      id: 'multi-select-angular-duplicates',
      language: 'angular',
      label: 'Refused by default, allowed on request',
      source: `<sl-multi-select aria-label="Labels" creatable locale="pt-BR" />

<sl-multi-select aria-label="Labels" allowDuplicates creatable />`,
    }),
  },
  {
    id: 'reorder',
    title: 'Reorder, by keyboard first',
    note: 'Alt with an arrow moves the focused chip one place, following the writing direction; Alt+Home and Alt+End take it to either end. The set is unchanged and the request carries keyboard, so a consumer persisting an order listens for exactly that.',
    snippet: defineSnippet({
      id: 'multi-select-angular-reorder',
      language: 'angular',
      label: 'The one reason reorder emits',
      source: `<sl-multi-select aria-label="Rollback order" reorderable (valueChangeRequest)="onOrder($event)" />`,
    }),
  },
  {
    id: 'paste',
    title: 'Pasting many values at once',
    note: 'One list of delimiters serves the key and the paste split, so a control cannot accept a comma-separated list from the clipboard and refuse it from the keyboard. Past the limit, the rest is reported rather than dropped.',
    snippet: defineSnippet({
      id: 'multi-select-angular-paste',
      language: 'angular',
      label: 'The separators, and what a long paste does',
      source: `<sl-multi-select aria-label="Notify" addOnPaste creatable [delimiters]="[',', ';']" [max]="5" />`,
    }),
  },
  {
    id: 'editing',
    title: 'Editing a chip in place',
    note: 'Enter on a focused chip turns its cell into a field, Enter commits and Escape reverts — which is the grid pattern’s own answer for a cell holding editable content. The commit is one transition, not a removal and an addition.',
    snippet: defineSnippet({
      id: 'multi-select-angular-editing',
      language: 'angular',
      label: 'A chip that can be corrected rather than retyped',
      source: `<sl-multi-select aria-label="Labels" creatable editable [defaultValue]="['payments-worker']" />`,
    }),
  },
  {
    id: 'filtering',
    title: 'Filtering, and the mark',
    note: 'The default comparison is locale-sensitive and the mark shows the span the collator matched, rather than a naive substring that would disagree with it. chosenOptions decides whether a value already held stays in the list.',
    snippet: defineSnippet({
      id: 'multi-select-angular-filtering',
      language: 'angular',
      label: 'Three answers, and which one each asks for',
      source: `<sl-multi-select aria-label="Services" locale="pt-BR" />

<sl-multi-select aria-label="Services" [filter]="startsWith" />

<sl-multi-select aria-label="Services" chosenOptions="hide" [filter]="null" />`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups',
    note: 'A set of options under a heading the group points at with aria-labelledby. A group whose every option was filtered away leaves the surface entirely, so a heading never claims a category matched when none did.',
    snippet: defineSnippet({
      id: 'multi-select-angular-groups',
      language: 'angular',
      label: 'Options under a name',
      source: `<sl-multi-select aria-label="Affected services">
  <sl-multi-select-group label="Payments">
    <sl-multi-select-item value="checkout-api" label="checkout-api" />
  </sl-multi-select-group>
  <sl-multi-select-separator />
  <sl-multi-select-group label="Platform">
    <sl-multi-select-item value="auth-gateway" label="auth-gateway" />
  </sl-multi-select-group>
</sl-multi-select>`,
    }),
  },
  {
    id: 'overflow',
    title: 'Overflow, and access to the whole set',
    note: 'wrap grows by rows to three and then scrolls, keeping every chip in the DOM. collapse is one line high for a table row: what did not fit becomes a counting chip that opens the popup, whose band holds every value.',
    snippet: defineSnippet({
      id: 'multi-select-angular-overflow',
      language: 'angular',
      label: 'Two answers, and where each belongs',
      source: `<sl-multi-select aria-label="Services" overflow="wrap" />

<sl-multi-select aria-label="Services" overflow="collapse" />`,
    }),
  },
  {
    id: 'sizes',
    title: 'Sizes',
    note: 'The three control steps, from the geometry every control in the library reads. An empty control is exactly the height of a text field beside it on the same form; a chip is what changes that.',
    snippet: defineSnippet({
      id: 'multi-select-angular-sizes',
      language: 'angular',
      label: 'The three steps',
      source: `<sl-multi-select aria-label="Services" size="sm" />
<sl-multi-select aria-label="Services" size="md" />
<sl-multi-select aria-label="Services" size="lg" />`,
    }),
  },
  {
    id: 'variants',
    title: 'Variants',
    note: 'outline for a form, subtle for a panel that already has a ground, and plain for a table cell — where an edge and a resting shadow would draw a cell that is not there.',
    snippet: defineSnippet({
      id: 'multi-select-angular-variants',
      language: 'angular',
      label: 'Three frames, three contexts',
      source: `<sl-multi-select aria-label="Services" variant="outline" />
<sl-multi-select aria-label="Services" variant="subtle" />
<sl-multi-select aria-label="Services" variant="plain" />`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'disabled answers nothing and keeps its values legible; readOnly keeps the caret and the copy and withholds the popup and every remove control; invalid retints the border and the focus ring together.',
    snippet: defineSnippet({
      id: 'multi-select-angular-states',
      language: 'angular',
      label: 'What each state withholds',
      source: `<sl-multi-select aria-label="Services" disabled />
<sl-multi-select aria-label="Services" readOnly />
<sl-multi-select aria-label="Services" invalid required />`,
    }),
  },
  {
    id: 'loading-and-empty',
    title: 'Loading, and nothing found',
    note: 'While an answer travels the control shows the ring where the chevron stood and the popup shows rows the height of an option — the shape of the list that is coming. A query nothing answered keeps the surface’s measure rather than collapsing it.',
    snippet: defineSnippet({
      id: 'multi-select-angular-loading',
      language: 'angular',
      label: 'The wait, and the answer that was not there',
      source: `<sl-multi-select aria-label="Services" loading />

<sl-multi-select aria-label="Services" emptyLabel="No service by that name" />`,
    }),
  },
  {
    id: 'long-content',
    title: 'Content the family did not choose',
    note: 'A forty-character service name truncates inside its chip and stays whole in the accessibility tree; the row wraps rather than pushing the frame wider; and under 120 pixels there is no chip at all and the counter answers instead.',
    snippet: defineSnippet({
      id: 'multi-select-angular-long-content',
      language: 'angular',
      label: 'Truncation removes nothing from the DOM',
      source: `<sl-multi-select
  aria-label="Affected services"
  [defaultValue]="['notification-relay-eu-west-1-canary']"
/>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Backspace from an empty field moves to the last chip and removes nothing; a second press removes it. Delete takes the focused chip out, the arrows walk the row, and a printable character sends the reader back to the field.',
    snippet: defineSnippet({
      id: 'multi-select-angular-keyboard',
      language: 'angular',
      label: 'One tab stop, and the keys inside it',
      source: `<sl-multi-select aria-label="Affected services" [closeOnSelect]="false" [loop]="false" />`,
    }),
  },
  {
    id: 'form',
    title: 'In a form',
    note: 'One hidden input per value, all under the same name, and a ControlValueAccessor with a Validator beside it — so a Reactive Form sees required, tooMany and duplicate without the consumer writing one.',
    snippet: defineSnippet({
      id: 'multi-select-angular-form',
      language: 'angular',
      label: 'Several values under one key, and a validator',
      source: `<div slField [invalid]="services.invalid">
  <label slFieldLabel>Affected services</label>
  <sl-multi-select name="services" required [formControl]="services" [max]="3" />
  <span slFieldError>Name at least one service</span>
</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition, and the defaults an application sets once',
    note: 'An injection token carries the axes and the eight sentences, exportAs reaches the instance from the template, and projected options keep their own content.',
    snippet: defineSnippet({
      id: 'multi-select-angular-composition',
      language: 'angular',
      label: 'Set once, reached from the template',
      source: `<sl-multi-select #services="slMultiSelect" aria-label="Affected services" />

<button type="button" (click)="services.focus()">Add a service</button>`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'readonly string[]',
    '—',
    'sl-multi-select',
    'The chosen values, in the order the reader chose them. A model, so [(value)] binds both ways.',
  ],
  [
    'defaultValue',
    'readonly string[]',
    '—',
    'sl-multi-select',
    'The set an unbound control starts from, read once in ngOnInit.',
  ],
  [
    'inputValue',
    'string',
    '—',
    'sl-multi-select',
    'The characters in the field. A model; it is emptied whenever a value is committed.',
  ],
  ['open', 'boolean', '—', 'sl-multi-select', 'Whether the popup is shown. A model.'],
  [
    'highlightedValue',
    'string | null',
    '—',
    'sl-multi-select',
    'The option the highlight is on, which is not an option that is chosen. A model.',
  ],
  [
    'items',
    'MultiSelectItems',
    '—',
    'sl-multi-select',
    'Values and labels declared up front, so a chip can be labelled before its option has rendered.',
  ],
  [
    'filter',
    'MultiSelectFilter',
    '—',
    'sl-multi-select',
    'The comparison. Absent asks for the locale-sensitive contains; null turns filtering off for a list a server has already filtered.',
  ],
  [
    'locale',
    'string',
    '—',
    'sl-multi-select',
    'BCP 47, for the comparison the filter and the duplicate rule make.',
  ],
  [
    'validateValue',
    '(text, values) => boolean',
    '—',
    'sl-multi-select',
    'Whether text the reader typed may become a value at all. What it turns down leaves through valueRefuse as invalid.',
  ],
  [
    'name',
    'string',
    '—',
    'sl-multi-select',
    'The submission name. One hidden input per value carries it.',
  ],
  [
    'form',
    'string',
    '—',
    'sl-multi-select',
    'The form the hidden inputs belong to, for a control rendered outside it.',
  ],
  ['placeholder', 'string', '—', 'sl-multi-select', 'What the field shows while it is empty.'],
  [
    'total',
    'number',
    '—',
    'sl-multi-select',
    'How many options the collection holds, for aria-setsize on a windowed list.',
  ],
  [
    'max',
    'number | null',
    'null',
    'sl-multi-select',
    'The most values the set may hold. null is no limit, and over it the Validator reports tooMany.',
  ],
  [
    'delimiters',
    'readonly string[]',
    ',',
    'sl-multi-select',
    'The characters that commit the typed text, and split a paste. One list serves both.',
  ],
  [
    'creatable',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether text the reader typed may become a value.',
  ],
  [
    'editable',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether Enter on a chip turns its cell into a field.',
  ],
  [
    'reorderable',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether Alt with an arrow moves the focused chip along the row.',
  ],
  [
    'allowDuplicates',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether the same value may be held twice.',
  ],
  [
    'addOnPaste',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether a paste carrying delimiters becomes several values.',
  ],
  [
    'commitOnBlur',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether pending text is committed when the reader leaves the control.',
  ],
  [
    'overflow',
    "'wrap' | 'collapse'",
    'wrap',
    'sl-multi-select',
    'Whether the row grows by rows to three and scrolls, or stays one line and counts what did not fit.',
  ],
  [
    'chosenOptions',
    "'show' | 'hide'",
    'show',
    'sl-multi-select',
    'Whether an option already held stays in the list with a check, or leaves it.',
  ],
  [
    'clearable',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether the clear button is drawn while the control holds something.',
  ],
  [
    'closeOnSelect',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether taking a value closes the popup. False, because the set is built by several presses.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'sl-multi-select', 'Whether Escape closes the popup.'],
  [
    'closeOnOutsidePress',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether a press outside the layer closes it.',
  ],
  [
    'loop',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether the highlight wraps past the ends of the list.',
  ],
  [
    'highlightMatch',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether the span the query matched is marked.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'sl-multi-select',
    'The control step, from the shared control geometry.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'sl-multi-select',
    'The frame: an edge, a ground, or neither.',
  ],
  [
    'side',
    "'bottom' | 'top' | 'inline-start' | 'inline-end' | 'left' | 'right'",
    'bottom',
    'sl-multi-select',
    'Which side of the control the popup hangs from.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'sl-multi-select',
    'How the popup lines up along that side.',
  ],
  [
    'width',
    "'anchor' | 'content'",
    'anchor',
    'sl-multi-select',
    'Whether the popup is the control’s width or its own.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'sl-multi-select',
    'When the layer exists: only while open, from the first open, or from the start.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'sl-multi-select',
    'The positioning strategy the layer uses.',
  ],
  [
    'sideOffset',
    'number',
    '4',
    'sl-multi-select',
    'The distance between the control and the popup.',
  ],
  ['alignOffset', 'number', '0', 'sl-multi-select', 'The shift along the aligned edge.'],
  [
    'collisionPadding',
    'number',
    '8',
    'sl-multi-select',
    'How close to the viewport edge the popup may come before it moves.',
  ],
  [
    'flip',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether the popup takes the other side when it does not fit.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether the popup slides along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether the popup hides when the control scrolls out of its clipping ancestor.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether the layer is portalled to the end of the document.',
  ],
  [
    'fullWidth',
    'boolean',
    'true',
    'sl-multi-select',
    'Whether the frame takes the width it is given.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether the control answers anything at all.',
  ],
  [
    'readOnly',
    'boolean',
    'false',
    'sl-multi-select',
    'Whether the values may be read and copied but not changed.',
  ],
  ['required', 'boolean', 'false', 'sl-multi-select', 'Whether an empty set is a validity error.'],
  ['invalid', 'boolean', 'false', 'sl-multi-select', 'Whether the control is drawn in error.'],
  ['loading', 'boolean', 'false', 'sl-multi-select', 'Whether an answer is travelling.'],
  ['clearLabel', 'string', 'Clear', 'sl-multi-select', 'The accessible name of the clear button.'],
  [
    'chosenLabel',
    'string',
    '{count} chosen',
    'sl-multi-select',
    'The row’s own name, and the counter’s text while the frame is too narrow for a chip.',
  ],
  [
    'countLabel',
    'string',
    '{count} results',
    'sl-multi-select',
    'What the live region says about the number of options that matched.',
  ],
  [
    'counterLabel',
    'string',
    '{count} of {max}',
    'sl-multi-select',
    'The counter’s text while max is set.',
  ],
  ['createLabel', 'string', 'Add “{query}”', 'sl-multi-select', 'The offer to add what was typed.'],
  [
    'emptyLabel',
    'string',
    'No matches',
    'sl-multi-select',
    'The message for a query nothing answered.',
  ],
  [
    'loadingLabel',
    'string',
    'Loading…',
    'sl-multi-select',
    'What the live region says while an answer is travelling.',
  ],
  [
    'removeLabel',
    'string',
    'Remove {label}',
    'sl-multi-select',
    'The accessible name of a chip’s remove button.',
  ],
  [
    'reorderLabel',
    'string',
    '{label}, position {position} of {count}',
    'sl-multi-select',
    'A chip’s accessible name while reorder is on, so its place is heard as well as seen.',
  ],
  [
    'triggerLabel',
    'string',
    'Show options',
    'sl-multi-select',
    'The accessible name of the trigger.',
  ],
  ['value', 'string', '—', 'sl-multi-select-item', 'The option’s key, and what enters the set.'],
  [
    'label',
    'string',
    '—',
    'sl-multi-select-item',
    'What the reader sees, what the filter compares and what the mark splits. An input rather than projected content, because both need the text before the view exists.',
  ],
  ['disabled', 'boolean', '—', 'sl-multi-select-item', 'Whether the option can be taken.'],
  ['description', 'string', '—', 'sl-multi-select-item', 'A second line under the label.'],
  ['icon', 'string', '—', 'sl-multi-select-item', 'The mark in the option’s first column.'],
  [
    'position',
    'number',
    '—',
    'sl-multi-select-item',
    'The option’s place in a windowed collection, for aria-posinset.',
  ],
  ['label', 'string', '—', 'sl-multi-select-group', 'The name of the group.'],
]);

const events: EventRow[] = [
  {
    name: 'valueChange',
    payload: 'readonly string[]',
    when: 'The set moved, as the two-way half of [(value)].',
  },
  {
    name: 'valueChangeRequest',
    payload: 'ChangeRequest<readonly string[]>',
    when: 'The same move, with the reason on it: select from an option, submit from typed text, remove from one value leaving, clear from all of them, keyboard from a reorder, and programmatic from a method.',
  },
  {
    name: 'valueRefuse',
    payload: '{ values: readonly string[]; cause: "duplicate" | "limit" | "invalid" }',
    when: 'One or more values did not get in. It holds no state and cancels nothing — the values never entered the set, and this says which and on what grounds.',
  },
  {
    name: 'inputValueChange',
    payload: 'string',
    when: 'The text in the field moved, as the two-way half of [(inputValue)]. inputValueChangeRequest carries the reason.',
  },
  {
    name: 'openChange',
    payload: 'boolean',
    when: 'The popup opened or closed. openChangeRequest carries the reason: pointer, keyboard, escape, outsidePress, select, dismiss, blur or programmatic.',
  },
  {
    name: 'highlightedValueChange',
    payload: 'string | null',
    when: 'The highlight moved. It is not a selection: moving it chooses nothing, and highlightedValueChangeRequest carries the reason.',
  },
  {
    name: 'loadMore',
    payload: 'void',
    when: 'The last option came into view, so there is more to fetch.',
  },
];

const composition = apiRows([
  [
    'provideMultiSelectDefaults()',
    'Provider',
    '—',
    'Application',
    'Every axis and all eight sentences the family speaks, provided once in a bootstrap or a route. A binding written on one control still wins over it.',
  ],
  [
    'exportAs',
    'slMultiSelect',
    '—',
    'sl-multi-select',
    'The instance, for a template that needs focus(), setOpen(), admit(), remove(), move() or scrollToKey().',
  ],
  [
    'ControlValueAccessor',
    'NG_VALUE_ACCESSOR',
    '—',
    'sl-multi-select',
    'formControl, formControlName and ngModel all move the whole set, and the form’s disabled state reaches the control.',
  ],
  [
    'Validator',
    'NG_VALIDATORS',
    '—',
    'sl-multi-select',
    'required, tooMany and duplicate reach a Reactive Form without the consumer writing a validator. React has no equivalent, and the asymmetry is recorded rather than levelled away.',
  ],
  [
    'ng-content',
    'projection',
    '—',
    'sl-multi-select',
    'Options, groups and separators are the consumer’s content, so their own control flow decides what the list holds.',
  ],
]);

const code = defineSnippet({
  id: 'multi-select-angular-anatomy',
  language: 'angular',
  label: 'The anatomy as it reaches the DOM',
  source: `<sl-multi-select
  data-ui="multi-select"
  data-part="root"
  data-size="md"
  data-variant="outline"
  data-overflow="wrap"
  data-full-width
>
  <div data-part="control" role="grid" aria-label="Affected services, 1 chosen">
    <div data-part="chips" role="row">
      <span data-ui="tag" data-part="root" data-size="sm" role="gridcell" tabindex="-1">
        <span data-part="body"><span data-part="label">checkout-api</span></span>
        <button data-part="remove" type="button" tabindex="-1"></button>
      </span>
      <span data-part="field" role="gridcell">
        <input data-part="input" type="text" role="combobox" aria-autocomplete="list" />
      </span>
    </div>
  </div>
  <button data-part="trigger" type="button" tabindex="-1">
    <span data-part="arrow"></span>
  </button>
</sl-multi-select>`,
});

const theming = defineSnippet({
  id: 'multi-select-theming',
  language: 'css',
  label: 'What an application retunes',
  source: `[data-ui='multi-select'] {
  --slotted-multi-select-radius: var(--slotted-radius-md);
  --slotted-multi-select-highlight: var(--slotted-tone-accent-surface);
  --slotted-multi-select-counter-complete-color: var(--slotted-tone-warning-text);
}

/* The chips are tags, and they are retuned under the identifier every chip in
   the library shares rather than under this family's — so a consumer who
   lightens a chip label lightens it everywhere at once. */
[data-ui='tag'] {
  --slotted-tag-font-weight: var(--slotted-font-weight-regular);
}`,
});

export const ANGULAR_MULTI_SELECT_DOCS = {
  'multi-select': {
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
