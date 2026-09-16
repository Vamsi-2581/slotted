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

export const REACT_MULTI_SELECT_TOKENS = multiSelectTokens.map((name) => ({
  name,
  purpose: 'Theme-owned MultiSelect decision',
}));

const imports: ReferenceImport = {
  source:
    "import { MultiSelect, MultiSelectContent, MultiSelectControl, MultiSelectGroup, MultiSelectItem, MultiSelectSeparator } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, rendered by MultiSelectControl',
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
    element: 'div, rendered by MultiSelectContent',
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

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls under the canvas. Add a service, take one back out, and watch the row grow by whole rows rather than by pixels.',
    snippet: defineSnippet({
      id: 'multi-select-react-playground',
      language: 'tsx',
      label: 'A frame of chosen values, and a field that adds more',
      source: `<MultiSelect defaultValue={['checkout-api']}>
  <MultiSelectControl aria-label="Affected services" placeholder="Add a service" />
  <MultiSelectContent aria-label="Affected services">
    <MultiSelectItem value="checkout-api">checkout-api</MultiSelectItem>
    <MultiSelectItem value="payments-worker">payments-worker</MultiSelectItem>
  </MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'chips',
    title: 'The chips, and where they live',
    note: 'Inside the frame, beside the caret, because this control holds a real input. Each chip is a tag: the same pill, the same remove control, the same geometry stated once in tag.css.',
    snippet: defineSnippet({
      id: 'multi-select-react-chips',
      language: 'tsx',
      label: 'The set is an array, and the order is the reader’s',
      source: `const [services, setServices] = useState(['checkout-api', 'payments-worker']);

<MultiSelect onValueChange={setServices} value={services}>
  <MultiSelectControl aria-label="Affected services" />
  <MultiSelectContent aria-label="Affected services">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'creation',
    title: 'Creating a value the list does not hold',
    note: 'With creatable, the offer stands as an option — ArrowDown reaches it, aria-activedescendant names it and Enter takes it — and its mark is the plus rather than the check, because nothing is in the set yet.',
    snippet: defineSnippet({
      id: 'multi-select-react-creation',
      language: 'tsx',
      label: 'Text becomes a value, under the reason submit',
      source: `<MultiSelect
  creatable
  onValueChange={(labels, request) => {
    if (request.reason === 'submit') report(labels);
  }}
>
  <MultiSelectControl aria-label="Labels" placeholder="Add a label" />
  <MultiSelectContent aria-label="Labels">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'limit',
    title: 'A limit that is a validity, not a silence',
    note: 'At the limit the counter takes the accent, the root carries data-complete, every unchosen option answers aria-disabled, and what was refused leaves through onValueRefuse instead of vanishing.',
    snippet: defineSnippet({
      id: 'multi-select-react-limit',
      language: 'tsx',
      label: 'What the control refuses, and how it says so',
      source: `<MultiSelect
  max={3}
  onValueRefuse={(values, { cause }) => {
    if (cause === 'limit') warn(\`Only three responders: \${values.join(', ')} were not added\`);
  }}
>
  <MultiSelectControl aria-label="Responders" />
  <MultiSelectContent aria-label="Responders">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'duplicates',
    title: 'Duplicates',
    note: 'The comparison is locale-sensitive, so P1 is already held when p1 is typed. The refusal moves focus to the chip that holds it: the reader is shown where their value is instead of being told nothing happened.',
    snippet: defineSnippet({
      id: 'multi-select-react-duplicates',
      language: 'tsx',
      label: 'Refused by default, allowed on request',
      source: `<MultiSelect creatable locale="pt-BR">
  …
</MultiSelect>;

<MultiSelect allowDuplicates creatable>
  …
</MultiSelect>;`,
    }),
  },
  {
    id: 'reorder',
    title: 'Reorder, by keyboard first',
    note: 'Alt with an arrow moves the focused chip one place, following the writing direction; Alt+Home and Alt+End take it to either end. The set is unchanged and the request carries keyboard, so a consumer persisting an order listens for exactly that.',
    snippet: defineSnippet({
      id: 'multi-select-react-reorder',
      language: 'tsx',
      label: 'The one reason reorder emits',
      source: `<MultiSelect
  onValueChange={(order, request) => {
    if (request.reason === 'keyboard') saveOrder(order);
  }}
  reorderable
>
  <MultiSelectControl aria-label="Runbook steps" />
  <MultiSelectContent aria-label="Runbook steps">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'paste',
    title: 'Pasting many values at once',
    note: 'One list of delimiters serves the key and the paste split, so a control cannot accept a comma-separated list from the clipboard and refuse it from the keyboard. Past the limit, the rest is reported rather than dropped.',
    snippet: defineSnippet({
      id: 'multi-select-react-paste',
      language: 'tsx',
      label: 'The separators, and what a long paste does',
      source: `<MultiSelect addOnPaste creatable delimiters={[',', ';']} max={5}>
  <MultiSelectControl aria-label="Notify" placeholder="Paste a list" />
  <MultiSelectContent aria-label="Notify">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'editing',
    title: 'Editing a chip in place',
    note: 'Enter on a focused chip turns its cell into a field, Enter commits and Escape reverts — which is the grid pattern’s own answer for a cell holding editable content. The commit is one transition, not a removal and an addition.',
    snippet: defineSnippet({
      id: 'multi-select-react-editing',
      language: 'tsx',
      label: 'A chip that can be corrected rather than retyped',
      source: `<MultiSelect creatable editable defaultValue={['payments-worker']}>
  <MultiSelectControl aria-label="Labels" />
  <MultiSelectContent aria-label="Labels">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'filtering',
    title: 'Filtering, and the mark',
    note: 'The default comparison is locale-sensitive and the mark shows the span the collator matched, rather than a naive substring that would disagree with it. chosenOptions decides whether a value already held stays in the list.',
    snippet: defineSnippet({
      id: 'multi-select-react-filtering',
      language: 'tsx',
      label: 'Three answers, and which one each asks for',
      source: `<MultiSelect locale="pt-BR">…</MultiSelect>;

<MultiSelect filter={(label, query) => label.startsWith(query)}>…</MultiSelect>;

<MultiSelect chosenOptions="hide" filter={null}>
  …
</MultiSelect>;`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups',
    note: 'A set of options under a heading the group points at with aria-labelledby. A group whose every option was filtered away leaves the surface entirely, so a heading never claims a category matched when none did.',
    snippet: defineSnippet({
      id: 'multi-select-react-groups',
      language: 'tsx',
      label: 'Options under a name',
      source: `<MultiSelectContent aria-label="Affected services">
  <MultiSelectGroup label="Payments">
    <MultiSelectItem value="checkout-api">checkout-api</MultiSelectItem>
  </MultiSelectGroup>
  <MultiSelectSeparator />
  <MultiSelectGroup label="Platform">
    <MultiSelectItem value="auth-gateway">auth-gateway</MultiSelectItem>
  </MultiSelectGroup>
</MultiSelectContent>;`,
    }),
  },
  {
    id: 'overflow',
    title: 'Overflow, and access to the whole set',
    note: 'wrap grows by rows to three and then scrolls, keeping every chip in the DOM. collapse is one line high for a table row: what did not fit becomes a counting chip that opens the popup, whose band holds every value.',
    snippet: defineSnippet({
      id: 'multi-select-react-overflow',
      language: 'tsx',
      label: 'Two answers, and where each belongs',
      source: `<MultiSelect overflow="wrap">…</MultiSelect>;

<MultiSelect overflow="collapse">…</MultiSelect>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'Sizes',
    note: 'The three control steps, from the geometry every control in the library reads. An empty control is exactly the height of a text field beside it on the same form; a chip is what changes that.',
    snippet: defineSnippet({
      id: 'multi-select-react-sizes',
      language: 'tsx',
      label: 'The three steps',
      source: `<MultiSelect size="sm">…</MultiSelect>;
<MultiSelect size="md">…</MultiSelect>;
<MultiSelect size="lg">…</MultiSelect>;`,
    }),
  },
  {
    id: 'variants',
    title: 'Variants',
    note: 'outline for a form, subtle for a panel that already has a ground, and plain for a table cell — where an edge and a resting shadow would draw a cell that is not there.',
    snippet: defineSnippet({
      id: 'multi-select-react-variants',
      language: 'tsx',
      label: 'Three frames, three contexts',
      source: `<MultiSelect variant="outline">…</MultiSelect>;
<MultiSelect variant="subtle">…</MultiSelect>;
<MultiSelect variant="plain">…</MultiSelect>;`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'disabled answers nothing and keeps its values legible; readOnly keeps the caret and the copy and withholds the popup and every remove control; invalid retints the border and the focus ring together.',
    snippet: defineSnippet({
      id: 'multi-select-react-states',
      language: 'tsx',
      label: 'What each state withholds',
      source: `<MultiSelect disabled>…</MultiSelect>;
<MultiSelect readOnly>…</MultiSelect>;
<MultiSelect invalid required>
  …
</MultiSelect>;`,
    }),
  },
  {
    id: 'loading-and-empty',
    title: 'Loading, and nothing found',
    note: 'While an answer travels the control shows the ring where the chevron stood and the popup shows rows the height of an option — the shape of the list that is coming. A query nothing answered keeps the surface’s measure rather than collapsing it.',
    snippet: defineSnippet({
      id: 'multi-select-react-loading',
      language: 'tsx',
      label: 'The wait, and the answer that was not there',
      source: `<MultiSelect loading>…</MultiSelect>;

<MultiSelectContent empty="No service by that name" />;`,
    }),
  },
  {
    id: 'long-content',
    title: 'Content the family did not choose',
    note: 'A forty-character service name truncates inside its chip and stays whole in the accessibility tree; the row wraps rather than pushing the frame wider; and under 120 pixels there is no chip at all and the counter answers instead.',
    snippet: defineSnippet({
      id: 'multi-select-react-long-content',
      language: 'tsx',
      label: 'Truncation removes nothing from the DOM',
      source: `<MultiSelect defaultValue={['notification-relay-eu-west-1-canary']}>
  <MultiSelectControl aria-label="Affected services" />
  <MultiSelectContent aria-label="Affected services">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Backspace from an empty field moves to the last chip and removes nothing; a second press removes it. Delete takes the focused chip out, the arrows walk the row, and a printable character sends the reader back to the field.',
    snippet: defineSnippet({
      id: 'multi-select-react-keyboard',
      language: 'tsx',
      label: 'One tab stop, and the keys inside it',
      source: `<MultiSelect closeOnSelect={false} loop={false}>
  <MultiSelectControl aria-label="Affected services" />
  <MultiSelectContent aria-label="Affected services">…</MultiSelectContent>
</MultiSelect>;`,
    }),
  },
  {
    id: 'form',
    title: 'In a form',
    note: 'One hidden input per value, all under the same name, so a plain FormData receives several values under one key and a native reset() restores them. The field carries the label, the description and the error by ID.',
    snippet: defineSnippet({
      id: 'multi-select-react-form',
      language: 'tsx',
      label: 'Several values under one key',
      source: `<Field invalid>
  <FieldLabel>Affected services</FieldLabel>
  <MultiSelect name="services" required>
    <MultiSelectControl />
    <MultiSelectContent aria-label="Affected services">…</MultiSelectContent>
  </MultiSelect>
  <FieldError>Name at least one service</FieldError>
</Field>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition, and the defaults an application sets once',
    note: 'A provider carries the axes and the eight sentences the family speaks, render replaces the frame while keeping the measurement, and the handle answers the actions a prop cannot express.',
    snippet: defineSnippet({
      id: 'multi-select-react-composition',
      language: 'tsx',
      label: 'Set once, replaced where it matters',
      source: `<MultiSelectDefaultsProvider removeLabel="Remover {label}" size="sm" variant="subtle">
  <MultiSelect ref={handle}>
    <MultiSelectControl render={(props) => <fieldset {...props} />} />
    <MultiSelectContent aria-label="Affected services">…</MultiSelectContent>
  </MultiSelect>
</MultiSelectDefaultsProvider>;`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'readonly string[]',
    '—',
    'MultiSelect',
    'The chosen values, in the order the reader chose them. Controlled.',
  ],
  [
    'defaultValue',
    'readonly string[]',
    '—',
    'MultiSelect',
    'The set an unbound control starts from, read once.',
  ],
  [
    'inputValue',
    'string',
    '—',
    'MultiSelect',
    'The characters in the field. Controlled; it is emptied whenever a value is committed.',
  ],
  [
    'defaultInputValue',
    'string',
    '—',
    'MultiSelect',
    'The text an unbound field starts from, read once.',
  ],
  ['open', 'boolean', '—', 'MultiSelect', 'Whether the popup is shown. Controlled.'],
  ['defaultOpen', 'boolean', '—', 'MultiSelect', 'Whether an unbound popup starts open.'],
  [
    'highlightedValue',
    'string | null',
    '—',
    'MultiSelect',
    'The option the highlight is on, which is not an option that is chosen. Controlled.',
  ],
  [
    'defaultHighlightedValue',
    'string | null',
    '—',
    'MultiSelect',
    'Where an unbound highlight starts.',
  ],
  [
    'items',
    'MultiSelectItems',
    '—',
    'MultiSelect',
    'Values and labels declared up front, so a chip can be labelled before its option has rendered.',
  ],
  [
    'filter',
    'MultiSelectFilter',
    '—',
    'MultiSelect',
    'The comparison. Absent asks for the locale-sensitive contains; null turns filtering off for a list a server has already filtered.',
  ],
  [
    'locale',
    'string',
    '—',
    'MultiSelect',
    'BCP 47, for the comparison the filter and the duplicate rule make.',
  ],
  [
    'validateValue',
    '(text, values) => boolean',
    '—',
    'MultiSelect',
    'Whether text the reader typed may become a value at all. What it turns down leaves through onValueRefuse as invalid.',
  ],
  [
    'name',
    'string',
    '—',
    'MultiSelect',
    'The submission name. One hidden input per value carries it.',
  ],
  [
    'form',
    'string',
    '—',
    'MultiSelect',
    'The form the hidden inputs belong to, for a control rendered outside it.',
  ],
  [
    'total',
    'number',
    '—',
    'MultiSelect',
    'How many options the collection holds, for aria-setsize on a windowed list.',
  ],
  [
    'max',
    'number | null',
    'null',
    'MultiSelect',
    'The most values the set may hold. null is no limit.',
  ],
  [
    'delimiters',
    'readonly string[]',
    ',',
    'MultiSelect',
    'The characters that commit the typed text, and split a paste. One list serves both.',
  ],
  [
    'creatable',
    'boolean',
    'false',
    'MultiSelect',
    'Whether text the reader typed may become a value.',
  ],
  [
    'editable',
    'boolean',
    'false',
    'MultiSelect',
    'Whether Enter on a chip turns its cell into a field.',
  ],
  [
    'reorderable',
    'boolean',
    'false',
    'MultiSelect',
    'Whether Alt with an arrow moves the focused chip along the row.',
  ],
  [
    'allowDuplicates',
    'boolean',
    'false',
    'MultiSelect',
    'Whether the same value may be held twice.',
  ],
  [
    'addOnPaste',
    'boolean',
    'true',
    'MultiSelect',
    'Whether a paste carrying delimiters becomes several values.',
  ],
  [
    'commitOnBlur',
    'boolean',
    'true',
    'MultiSelect',
    'Whether pending text is committed when the reader leaves the control.',
  ],
  [
    'overflow',
    "'wrap' | 'collapse'",
    'wrap',
    'MultiSelect',
    'Whether the row grows by rows to three and scrolls, or stays one line and counts what did not fit.',
  ],
  [
    'chosenOptions',
    "'show' | 'hide'",
    'show',
    'MultiSelect',
    'Whether an option already held stays in the list with a check, or leaves it.',
  ],
  [
    'clearable',
    'boolean',
    'true',
    'MultiSelect',
    'Whether the clear button is drawn while the control holds something.',
  ],
  [
    'closeOnSelect',
    'boolean',
    'false',
    'MultiSelect',
    'Whether taking a value closes the popup. False, because the set is built by several presses.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'MultiSelect', 'Whether Escape closes the popup.'],
  [
    'closeOnOutsidePress',
    'boolean',
    'true',
    'MultiSelect',
    'Whether a press outside the layer closes it.',
  ],
  [
    'loop',
    'boolean',
    'false',
    'MultiSelect',
    'Whether the highlight wraps past the ends of the list.',
  ],
  [
    'highlightMatch',
    'boolean',
    'true',
    'MultiSelect',
    'Whether the span the query matched is marked.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'MultiSelect',
    'The control step, from the shared control geometry.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'MultiSelect',
    'The frame: an edge, a ground, or neither.',
  ],
  [
    'side',
    "'bottom' | 'top' | 'inline-start' | 'inline-end' | 'left' | 'right'",
    'bottom',
    'MultiSelect',
    'Which side of the control the popup hangs from.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'MultiSelect',
    'How the popup lines up along that side.',
  ],
  [
    'width',
    "'anchor' | 'content'",
    'anchor',
    'MultiSelect',
    'Whether the popup is the control’s width or its own.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'MultiSelect',
    'When the layer exists: only while open, from the first open, or from the start.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'MultiSelect',
    'The positioning strategy the layer uses.',
  ],
  ['sideOffset', 'number', '4', 'MultiSelect', 'The distance between the control and the popup.'],
  ['alignOffset', 'number', '0', 'MultiSelect', 'The shift along the aligned edge.'],
  [
    'collisionPadding',
    'number',
    '8',
    'MultiSelect',
    'How close to the viewport edge the popup may come before it moves.',
  ],
  [
    'flip',
    'boolean',
    'true',
    'MultiSelect',
    'Whether the popup takes the other side when it does not fit.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'MultiSelect',
    'Whether the popup slides along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'MultiSelect',
    'Whether the popup hides when the control scrolls out of its clipping ancestor.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'MultiSelect',
    'Whether the layer is portalled to the end of the document.',
  ],
  ['fullWidth', 'boolean', 'true', 'MultiSelect', 'Whether the frame takes the width it is given.'],
  ['disabled', 'boolean', 'false', 'MultiSelect', 'Whether the control answers anything at all.'],
  [
    'readOnly',
    'boolean',
    'false',
    'MultiSelect',
    'Whether the values may be read and copied but not changed.',
  ],
  ['required', 'boolean', 'false', 'MultiSelect', 'Whether an empty set is a validity error.'],
  ['invalid', 'boolean', 'false', 'MultiSelect', 'Whether the control is drawn in error.'],
  ['loading', 'boolean', 'false', 'MultiSelect', 'Whether an answer is travelling.'],
  ['clearLabel', 'string', 'Clear', 'MultiSelect', 'The accessible name of the clear button.'],
  [
    'chosenLabel',
    'string',
    '{count} chosen',
    'MultiSelect',
    'The row’s own name, and the counter’s text while the frame is too narrow for a chip.',
  ],
  [
    'countLabel',
    'string',
    '{count} results',
    'MultiSelect',
    'What the live region says about the number of options that matched.',
  ],
  [
    'counterLabel',
    'string',
    '{count} of {max}',
    'MultiSelect',
    'The counter’s text while max is set.',
  ],
  ['createLabel', 'string', 'Add “{query}”', 'MultiSelect', 'The offer to add what was typed.'],
  [
    'emptyLabel',
    'string',
    'No matches',
    'MultiSelect',
    'The message for a query nothing answered.',
  ],
  [
    'loadingLabel',
    'string',
    'Loading…',
    'MultiSelect',
    'What the live region says while an answer is travelling.',
  ],
  [
    'removeLabel',
    'string',
    'Remove {label}',
    'MultiSelect',
    'The accessible name of a chip’s remove button.',
  ],
  [
    'reorderLabel',
    'string',
    '{label}, position {position} of {count}',
    'MultiSelect',
    'A chip’s accessible name while reorder is on, so its place is heard as well as seen.',
  ],
  ['triggerLabel', 'string', 'Show options', 'MultiSelect', 'The accessible name of the trigger.'],
  [
    'render',
    '(props) => ReactNode',
    '—',
    'MultiSelectControl',
    'Replaces the frame around the control, keeping the ref the width gate measures.',
  ],
  [
    'chosen',
    'boolean',
    '—',
    'MultiSelectContent',
    'Whether the band of chosen values is drawn at the top of the surface.',
  ],
  ['empty', 'ReactNode', '—', 'MultiSelectContent', 'What stands where the empty message would.'],
  [
    'status',
    'ReactNode',
    '—',
    'MultiSelectContent',
    'What the live region says, replacing the count.',
  ],
  ['value', 'string', '—', 'MultiSelectItem', 'The option’s key, and what enters the set.'],
  ['disabled', 'boolean', '—', 'MultiSelectItem', 'Whether the option can be taken.'],
  ['description', 'ReactNode', '—', 'MultiSelectItem', 'A second line under the label.'],
  ['icon', 'ReactNode', '—', 'MultiSelectItem', 'The mark in the option’s first column.'],
  [
    'textValue',
    'string',
    '—',
    'MultiSelectItem',
    'What the filter compares, for an option whose children are not text.',
  ],
  [
    'position',
    'number',
    '—',
    'MultiSelectItem',
    'The option’s place in a windowed collection, for aria-posinset.',
  ],
  ['label', 'ReactNode', '—', 'MultiSelectGroup', 'The name of the group.'],
]);

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: readonly string[], request: ChangeRequest<readonly string[]>)',
    when: 'The set moved. The request carries the reason: select from an option, submit from typed text, remove from one value leaving, clear from all of them, keyboard from a reorder, and programmatic from the handle.',
  },
  {
    name: 'onValueRefuse',
    payload: '(values: readonly string[], details: { cause: "duplicate" | "limit" | "invalid" })',
    when: 'One or more values did not get in. It holds no state and cancels nothing — the values never entered the set, and this says which and on what grounds.',
  },
  {
    name: 'onInputValueChange',
    payload: '(value: string, request: ChangeRequest<string>)',
    when: 'The text in the field moved: keyboard while typing, select or submit when a commit empties it, clear from Escape or the clear button, blur when leaving commits it.',
  },
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: ChangeRequest<boolean>)',
    when: 'The popup opened or closed, under pointer, keyboard, escape, outsidePress, select, dismiss, blur or programmatic.',
  },
  {
    name: 'onHighlightedValueChange',
    payload: '(value: string | null, request: ChangeRequest<string | null>)',
    when: 'The highlight moved, under pointer, keyboard or programmatic. It is not a selection: moving it chooses nothing.',
  },
  {
    name: 'onLoadMore',
    payload: '()',
    when: 'The last option came into view, so there is more to fetch.',
  },
];

const composition = apiRows([
  [
    'MultiSelectDefaultsProvider',
    'component',
    '—',
    'Application',
    'Every axis and all eight sentences the family speaks, set once in a bootstrap — which is where an application translates them. A consumer’s own prop always wins over the provider, and the provider over the built-in default.',
  ],
  [
    'render',
    '(props) => ReactNode',
    '—',
    'MultiSelectControl, MultiSelectContent',
    'Replaces the frame, or the layer — and it receives the ref the width gate measures the frame with. A part that dropped it would lose the narrow-width behaviour silently, which is the failure toolbar recorded when it replaced a positioner’s anchor.',
  ],
  [
    'ref',
    'Ref<MultiSelectHandle>',
    '—',
    'MultiSelect',
    'focus(), open(), close(), scrollToKey(value) and setValue(values, reason) — the actions a consumer cannot express declaratively, and nothing more.',
  ],
  [
    'native props',
    'ComponentPropsWithRef',
    '—',
    'MultiSelectControl',
    'Anything written on the control lands on the input, and the consumer’s own onKeyDown, onChange, onBlur and onPaste run first. A handler that calls preventDefault stands the family down for that key.',
  ],
  [
    'data-*',
    'attributes',
    '—',
    'every part',
    'Every state a consumer may style is in the DOM: data-open, data-disabled, data-readonly, data-invalid, data-required, data-loading, data-selected, data-current and data-complete.',
  ],
]);

const accessibility = [
  'The control is one tab stop. The combobox pattern excludes the popup indicator from the page tab sequence and the grid pattern puts one element of a layout grid in it — the field is that element, and every chip and both buttons carry tabindex="-1".',
  'The chips are a layout grid with one row: the APG names this control by example, and one DOM row is what leaves ArrowDown and ArrowUp free for the popup. Focus lands on the cell rather than on the remove button inside it, and Delete and Backspace do what the button does.',
  'The popup writes aria-multiselectable and selection does not follow focus, which is a knowing departure from the combobox pattern’s own note. Every implementation surveyed on 2026-09-10 makes the same one, and the cost is written in the contract.',
  'What happens is said as well as drawn: a value added with the count now held, a value removed with the label that left and the count that is left, a value moved with its new position, and the limit when it is reached.',
];

const code = defineSnippet({
  id: 'multi-select-react-anatomy',
  language: 'tsx',
  label: 'The anatomy as it reaches the DOM',
  source: `<div
  data-ui="multi-select"
  data-part="root"
  data-size="md"
  data-variant="outline"
  data-overflow="wrap"
  data-full-width
>
  <div data-part="control" role="grid" aria-label="Affected services, 2 chosen">
    <div data-part="chips" role="row">
      <span data-ui="tag" data-part="root" data-size="sm" role="gridcell" tabindex="-1">
        <span data-part="body">
          <span data-part="label">checkout-api</span>
        </span>
        <button
          data-part="remove"
          type="button"
          tabindex="-1"
          aria-label="Remove checkout-api"
        ></button>
      </span>
      <span data-part="field" role="gridcell">
        <input
          data-part="input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="true"
          aria-controls="listbox-id"
        />
      </span>
    </div>
  </div>
  <button data-part="clear" type="button" aria-label="Clear"></button>
  <button data-part="trigger" type="button" tabindex="-1" aria-label="Show options">
    <span data-part="arrow"></span>
  </button>
</div>;

<div data-ui="multi-select" data-part="positioner" data-side="bottom" data-align="start" data-open>
  <div data-part="content" role="listbox" aria-multiselectable="true" id="listbox-id">
    <div data-part="chosen">
      <span data-ui="tag" data-part="root" data-size="sm">
        <span data-part="body">
          <span data-part="label">checkout-api</span>
        </span>
      </span>
    </div>
    <div
      data-part="item"
      role="option"
      aria-selected="true"
      data-selected
      data-value="checkout-api"
    >
      <span data-part="label">checkout-api</span>
      <span data-part="indicator"></span>
    </div>
    <div data-part="status" role="status" aria-live="polite">
      8 results
    </div>
  </div>
</div>;`,
});

const theming = defineSnippet({
  id: 'multi-select-theming',
  language: 'css',
  label: 'What an application retunes',
  source: `[data-ui='multi-select'] {
  --slotted-multi-select-radius: var(--slotted-radius-md);
  --slotted-multi-select-highlight: var(--slotted-tone-accent-surface);
  --slotted-multi-select-counter-complete-color: var(--slotted-tone-warning-text);
  --slotted-multi-select-measure: 28rem;
}

/* The chips are tags, and they are retuned under the identifier every chip in
   the library shares rather than under this family's — so a consumer who
   lightens a chip label lightens it everywhere at once. */
[data-ui='tag'] {
  --slotted-tag-font-weight: var(--slotted-font-weight-regular);
}`,
});

export const REACT_MULTI_SELECT_DOCS = {
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
