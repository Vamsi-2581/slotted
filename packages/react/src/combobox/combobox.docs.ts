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

export const REACT_COMBOBOX_TOKENS = comboboxTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Combobox decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxSeparator } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, rendered by ComboboxInput',
    required: true,
    purpose:
      'The frame the reader sees, carrying data-ui="combobox". It draws the border, the shadow, the focus ring and every state — the same frame text-field and select use, from the same tokens.',
  },
  {
    part: 'input',
    element: 'input with role="combobox"',
    required: true,
    purpose:
      "A real text input, so every text-editing key, the caret, the selection, IME and autofill stay the browser's. It keeps DOM focus for the whole interaction and carries aria-autocomplete, aria-expanded and aria-activedescendant.",
  },
  {
    part: 'trigger',
    element: 'button',
    required: true,
    purpose:
      'Opens and closes the popup with the pointer. tabindex="-1": the pattern excludes the popup indicator from the page tab sequence by name, so a reader tabbing through a form meets the input once and not twice.',
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
      'Takes both contracts back — the text and the chosen key. Present only while clearable is set and the field holds something.',
  },
  {
    part: 'positioner',
    element: 'div, rendered by ComboboxContent',
    required: true,
    purpose:
      'The layer, portalled to the end of the document. It carries data-ui="combobox" a second time, because a stylesheet cannot reach a subtree that has left its own root.',
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
      'One option, and the one that decides whether it belongs in the results: it compares its own label against the query and renders nothing when it does not match.',
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
    purpose: "The artwork in the first column, from a glyph token or the consumer's own element.",
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
      'The span of the label the query matched, found with the same collator the filter used. It is the only visual answer to "why is this option in my results", and no surveyed implementation draws it.',
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
    purpose: 'A line between two runs of options.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose:
      'What the popup says when nothing matched. It opens onto a sentence rather than onto a two-pixel box.',
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
      id: 'combobox-react-playground',
      language: 'tsx',
      label: 'An input, and the options it filters',
      source: `<Combobox>
  <ComboboxInput aria-label="Fruit" placeholder="Search fruit" />
  <ComboboxContent>
    <ComboboxItem value="blueberry">Blueberry</ComboboxItem>
    <ComboboxItem value="raspberry">Raspberry</ComboboxItem>
  </ComboboxContent>
</Combobox>;`,
    }),
  },
  {
    id: 'filtering',
    title: 'Filtering, and the mark',
    note: 'The default comparison is locale-sensitive, so resume finds Resumé — and the mark shows the span the collator matched rather than a naive substring that would disagree with it.',
    snippet: defineSnippet({
      id: 'combobox-react-filtering',
      language: 'tsx',
      label: 'Three answers, and which one each asks for',
      source: `<Combobox locale="pt-BR">…</Combobox>;

<Combobox filter={(label, query) => label.toLowerCase().startsWith(query.toLowerCase())}>
  …
</Combobox>;

<Combobox filter={null}>…</Combobox>;`,
    }),
  },
  {
    id: 'autocomplete',
    title: 'Autocomplete',
    note: 'The pattern’s own three values. both writes the rest of the first match into the field as a selected range, so the next character replaces it and Backspace withdraws it.',
    snippet: defineSnippet({
      id: 'combobox-react-autocomplete',
      language: 'tsx',
      label: 'What the field does as the reader types',
      source: `<Combobox autocomplete="none">…</Combobox>;
<Combobox autocomplete="list">…</Combobox>;
<Combobox autocomplete="both">…</Combobox>;`,
    }),
  },
  {
    id: 'custom-value',
    title: 'A value that is not on the list',
    note: 'With allowsCustomValue the typed text commits as the value. Without it, Enter puts the text back to the committed option’s label — the pattern’s own "reverts".',
    snippet: defineSnippet({
      id: 'combobox-react-custom-value',
      language: 'tsx',
      label: 'Inventing a value, or refusing to',
      source: `<Combobox allowsCustomValue onValueChange={(next, request) => add(next, request.reason)}>
  …
</Combobox>;`,
    }),
  },
  {
    id: 'creation',
    title: 'Adding a value the list does not hold',
    note: 'With onCreate, the last option offers to add what was typed once nothing matched. It is an option — ArrowDown reaches it, Enter takes it — and taking it reports the query and selects nothing: the collection is the consumer’s, and only it knows whether this one can grow.',
    snippet: defineSnippet({
      id: 'combobox-react-creation',
      language: 'tsx',
      label: 'Offering to add what was typed',
      source: `<Combobox onCreate={(query) => add(query)}>…</Combobox>;`,
    }),
  },
  {
    id: 'async',
    title: 'Asynchronous results',
    note: 'Debounce the fetch, not the family: a component that delayed its own request would delay a controlled consumer’s re-render and drop characters between them.',
    snippet: defineSnippet({
      id: 'combobox-react-async',
      language: 'tsx',
      label: 'Three lines that debounce a search',
      source: `const [query, setQuery] = useState('');
const deferred = useDeferredValue(query);
const { data, isPending } = useQuery({ queryKey: ['people', deferred], queryFn: search });

<Combobox
  filter={null}
  inputValue={query}
  loading={isPending}
  onInputValueChange={setQuery}
  onLoadMore={fetchNextPage}
>
  …
</Combobox>;`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups',
    note: 'Two named groups. A group whose every option was filtered away disappears with them, so a heading never claims a category matched when none did.',
    snippet: defineSnippet({
      id: 'combobox-react-groups',
      language: 'tsx',
      label: 'Results with sections',
      source: `<ComboboxContent>
  <ComboboxGroup label="Berries">
    <ComboboxItem value="blueberry">Blueberry</ComboboxItem>
  </ComboboxGroup>
  <ComboboxGroup label="Citrus">
    <ComboboxItem value="pomelo">Pomelo</ComboboxItem>
  </ComboboxGroup>
</ComboboxContent>;`,
    }),
  },
  {
    id: 'clearable',
    title: 'Clearable',
    note: 'One press takes both contracts back — the text and the chosen key — and focus returns to the field rather than to the document.',
    snippet: defineSnippet({
      id: 'combobox-react-clearable',
      language: 'tsx',
      label: 'Emptying the field',
      source: `<Combobox clearable clearLabel="Clear the search">
  …
</Combobox>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'Sizes',
    note: 'Three steps, every one reading control geometry — so a combobox beside a text field of the same size is the same height to the pixel.',
    snippet: defineSnippet({
      id: 'combobox-react-sizes',
      language: 'tsx',
      label: 'The three control steps',
      source: `<Combobox size="sm">…</Combobox>;
<Combobox size="md">…</Combobox>;
<Combobox size="lg">…</Combobox>;`,
    }),
  },
  {
    id: 'variants',
    title: 'Variants',
    note: 'outline on the page, subtle where a form sinks into its card, and plain for a table cell that is only a control while it is being used.',
    snippet: defineSnippet({
      id: 'combobox-react-variants',
      language: 'tsx',
      label: 'How much frame the control shows',
      source: `<Combobox variant="outline">…</Combobox>;
<Combobox variant="subtle">…</Combobox>;
<Combobox variant="plain">…</Combobox>;`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Required, invalid, read-only and disabled. Read-only keeps the caret, the selection and the copy, and withholds only the popup — which is the family’s to withhold, because the pattern has no readonly.',
    snippet: defineSnippet({
      id: 'combobox-react-states',
      language: 'tsx',
      label: 'What the control refuses, and how it says so',
      source: `<Combobox invalid>…</Combobox>;
<Combobox readOnly defaultInputValue="Blueberry">
  …
</Combobox>;
<Combobox disabled defaultInputValue="Blueberry">
  …
</Combobox>;`,
    }),
  },
  {
    id: 'empty',
    title: 'Nothing matched, and still travelling',
    note: 'A query with no answers opens onto a sentence. A query whose answer is in flight keeps the same measure, so nothing jumps when the results land.',
    snippet: defineSnippet({
      id: 'combobox-react-empty',
      language: 'tsx',
      label: 'The two states the field spends most time in',
      source: `<ComboboxContent empty="Try a different spelling" status="Searching…" />;`,
    }),
  },
  {
    id: 'long-content',
    title: 'Content the family did not choose',
    note: 'A translated label, an unbroken identifier and two hundred options. The label clamps at two lines with the whole string in the DOM, and the mark sits inside the token that broke.',
    snippet: defineSnippet({
      id: 'combobox-react-long-content',
      language: 'tsx',
      label: 'Long, translated and unbroken',
      source: `<ComboboxItem textValue="urn:acme:catalogue:9f2c41ab" value="urn">
  urn:acme:catalogue:9f2c41ab8de07c5511903fbe
</ComboboxItem>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'Keyboard',
    note: 'The arrows and the page keys move the highlight without moving the caret; Home, End, Backspace and Delete are never intercepted, which the pattern asks for by name.',
    snippet: defineSnippet({
      id: 'combobox-react-keyboard',
      language: 'tsx',
      label: 'What the family binds, and what it leaves alone',
      source: `<Combobox autoHighlight={false} loop={false} openOn="input">
  …
</Combobox>;`,
    }),
  },
  {
    id: 'form',
    title: 'In a form',
    note: 'Inside a field, with a label, a description and an error. name renders a hidden input carrying the chosen key — never the typed text, which is the other contract.',
    snippet: defineSnippet({
      id: 'combobox-react-form',
      language: 'tsx',
      label: 'A control a form can submit',
      source: `<Field required>
  <FieldLabel>Reviewer</FieldLabel>
  <Combobox name="reviewer">
    <ComboboxInput placeholder="Search people" />
    <ComboboxContent>{options}</ComboboxContent>
  </Combobox>
</Field>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition',
    note: 'Defaults and every sentence set once for an application, the frame replaced through render, and the imperative handle for what a consumer cannot say declaratively.',
    snippet: defineSnippet({
      id: 'combobox-react-composition',
      language: 'tsx',
      label: 'What a consumer can replace',
      source: `<ComboboxDefaultsProvider countLabel="{count} pessoas" emptyLabel="Nada encontrado" size="sm">
  <Combobox ref={handle}>
    <ComboboxInput render={(props) => <label {...props} />} />…
  </Combobox>
</ComboboxDefaultsProvider>;`,
    }),
  },
];

const api = apiRows([
  [
    'inputValue',
    'string',
    '—',
    'Combobox',
    'The characters in the field. Present means the consumer owns them.',
  ],
  [
    'defaultInputValue',
    'string',
    '—',
    'Combobox',
    'What an uncontrolled field starts with, read once.',
  ],
  [
    'value',
    'string | null',
    '—',
    'Combobox',
    'The chosen option’s key, which is not the typed text.',
  ],
  ['defaultValue', 'string | null', '—', 'Combobox', 'What an uncontrolled combobox starts from.'],
  [
    'open',
    'boolean',
    '—',
    'Combobox',
    'Whether the popup is showing. Present means the consumer owns it.',
  ],
  ['defaultOpen', 'boolean', 'false', 'Combobox', 'Whether an uncontrolled combobox starts open.'],
  [
    'highlightedValue',
    'string | null',
    '—',
    'Combobox',
    'The option the highlight is on, which is not the option that is chosen.',
  ],
  [
    'defaultHighlightedValue',
    'string | null',
    '—',
    'Combobox',
    'Where an uncontrolled highlight starts.',
  ],
  [
    'filter',
    '((label, query) => boolean) | null',
    '—',
    'Combobox',
    'The comparison. Unset asks for the library’s locale-sensitive contains; null turns filtering off for a list a server has already filtered.',
  ],
  ['locale', 'string', '—', 'Combobox', 'BCP 47, for the comparison the default filter makes.'],
  [
    'items',
    'ComboboxItems',
    '—',
    'Combobox',
    'Labels for values, so a closed control can name one the popup never rendered.',
  ],
  [
    'name',
    'string',
    '—',
    'Combobox',
    'The submission name. Renders a hidden input carrying the chosen key.',
  ],
  [
    'form',
    'string',
    '—',
    'Combobox',
    'The form this control submits with, when it is not the enclosing one.',
  ],
  [
    'total',
    'number',
    '—',
    'Combobox',
    'How many options the whole collection holds, for aria-setsize.',
  ],
  [
    'autocomplete',
    "'none' | 'list' | 'both'",
    'list',
    'Combobox',
    'The pattern’s own three values for aria-autocomplete.',
  ],
  [
    'openOn',
    "'input' | 'focus' | 'manual'",
    'input',
    'Combobox',
    'When the popup opens on its own.',
  ],
  [
    'allowsCustomValue',
    'boolean',
    'false',
    'Combobox',
    'Whether the typed text may commit as the value.',
  ],
  [
    'autoHighlight',
    'boolean',
    'false',
    'Combobox',
    'Whether the first match is highlighted as soon as the popup opens.',
  ],
  [
    'highlightMatch',
    'boolean',
    'true',
    'Combobox',
    'Whether the span the query matched is marked inside each label.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'Combobox',
    'The control step. Unset asks the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'Combobox',
    'How much frame the control shows.',
  ],
  [
    'side',
    "'bottom' | 'top' | 'inline-start' | 'inline-end'",
    'bottom',
    'Combobox',
    'Which edge of the control the popup hangs from.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'Combobox',
    'Where the popup lines up along that edge.',
  ],
  [
    'width',
    "'anchor' | 'content'",
    'anchor',
    'Combobox',
    'As wide as the control, or as wide as its own options.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'Combobox',
    'When the layer exists: only while open, from the first open, or from the start.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'Combobox',
    'How the positioner places the layer.',
  ],
  [
    'clearable',
    'boolean',
    'true',
    'Combobox',
    'Whether a clear button appears once the field holds something.',
  ],
  ['loop', 'boolean', 'false', 'Combobox', 'Whether the arrows wrap at the ends of the list.'],
  ['closeOnSelect', 'boolean', 'true', 'Combobox', 'Whether taking an option closes the popup.'],
  ['closeOnEscape', 'boolean', 'true', 'Combobox', 'Whether Escape closes the popup.'],
  [
    'closeOnOutsidePress',
    'boolean',
    'true',
    'Combobox',
    'Whether a press outside closes the popup.',
  ],
  [
    'flip',
    'boolean',
    'true',
    'Combobox',
    'Whether the popup may move to the opposite side when it does not fit.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'Combobox',
    'Whether the popup may slide along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'Combobox',
    'Whether the popup hides once its control has scrolled out of view.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'Combobox',
    'Whether the layer is portalled out of the control’s subtree.',
  ],
  [
    'fullWidth',
    'boolean',
    'true',
    'Combobox',
    'Whether the control fills its field, or shrinks to its own width.',
  ],
  ['disabled', 'boolean', 'false', 'Combobox', 'Answers nothing. Unset asks the field around it.'],
  [
    'readOnly',
    'boolean',
    'false',
    'Combobox',
    'Keeps the caret and the copy, and withholds the popup. Unset asks the field.',
  ],
  [
    'required',
    'boolean',
    'false',
    'Combobox',
    'The native attribute, and a validity the Angular binding reports. Unset asks the field.',
  ],
  [
    'invalid',
    'boolean',
    'false',
    'Combobox',
    'Retargets the focus ring and the border. Unset asks the field.',
  ],
  [
    'loading',
    'boolean',
    'false',
    'Combobox',
    'Paints the status row and sets aria-busy on the listbox.',
  ],
  [
    'sideOffset',
    'number',
    '4',
    'Combobox',
    'The gap between the control and the popup, in pixels.',
  ],
  [
    'alignOffset',
    'number',
    '0',
    'Combobox',
    'How far the popup slides along its own side, in pixels.',
  ],
  [
    'collisionPadding',
    'number',
    '8',
    'Combobox',
    'How close to the viewport edge the popup may come.',
  ],
  ['clearLabel', 'string', 'Clear', 'Combobox', 'The accessible name of the clear button.'],
  [
    'createLabel',
    'string',
    'Create \u201c{query}\u201d',
    'Combobox',
    'The offer to add what was typed. `{query}` is the text.',
  ],
  ['emptyLabel', 'string', 'No matches', 'Combobox', 'What the popup says when nothing matched.'],
  [
    'loadingLabel',
    'string',
    'Loading…',
    'Combobox',
    'What the popup says while an answer is travelling.',
  ],
  [
    'triggerLabel',
    'string',
    'Show options',
    'Combobox',
    'The accessible name of the button that opens the popup.',
  ],
  [
    'countLabel',
    'string',
    '{count} results',
    'Combobox',
    'The sentence the live region announces. {count} becomes the number.',
  ],
  ['empty', 'ReactNode', '—', 'ComboboxContent', 'Replaces emptyLabel for this popup.'],
  [
    'status',
    'ReactNode',
    '—',
    'ComboboxContent',
    'Replaces the status row’s message for this popup.',
  ],
  [
    'value',
    'string',
    '—',
    'ComboboxItem',
    'The option’s key: what is submitted and what the request carries.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'ComboboxItem',
    'Announced, kept in the collection, skipped by every movement key.',
  ],
  [
    'textValue',
    'string',
    '—',
    'ComboboxItem',
    'What the filter compares and what the mark splits, when the children are not a string.',
  ],
  ['description', 'ReactNode', '—', 'ComboboxItem', 'The line under the label.'],
  ['icon', 'ReactNode', '—', 'ComboboxItem', 'The artwork in the first column.'],
  [
    'position',
    'number',
    '—',
    'ComboboxItem',
    'This option’s place in the whole collection, for aria-posinset.',
  ],
  [
    'label',
    'ReactNode',
    '—',
    'ComboboxGroup',
    'The group’s name, which it points at with aria-labelledby.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'onInputValueChange',
    payload: '(value: string, request: ChangeRequest)',
    when: 'Before the text moves. reason is keyboard while the reader types, select when an option was taken, clear, blur or programmatic.',
  },
  {
    name: 'onValueChange',
    payload: '(value: string | null, request: ChangeRequest)',
    when: 'Before the chosen key moves. Typing emits only the text request; committing an option emits both, each with reason select.',
  },
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: ChangeRequest)',
    when: 'Before the popup opens or closes. The reason separates a selection from a dismissal: select, escape, outsidePress, dismiss, blur, pointer, keyboard or programmatic.',
  },
  {
    name: 'onHighlightedValueChange',
    payload: '(value: string | null, request: ChangeRequest)',
    when: 'Before the highlight moves, whether a key or the pointer moved it, and when the filter takes the highlighted option away.',
  },
  {
    name: 'onLoadMore',
    payload: '()',
    when: 'The end of the rendered list came into view. The consumer fetches the next page; the family holds no cursor of its own.',
  },
];

const composition = apiRows([
  [
    'ComboboxDefaultsProvider',
    'component',
    '—',
    'Application',
    'Every axis and all five sentences the family speaks, set once in a bootstrap — which is where an application translates them.',
  ],
  [
    'render',
    '(props) => ReactNode',
    '—',
    'ComboboxInput, ComboboxContent',
    'Replaces the frame, or the layer. The input and the listbox carry the role and the wiring, and are not replaceable for that reason.',
  ],
  [
    'ref',
    'Ref<ComboboxHandle>',
    '—',
    'Combobox',
    'focus(), open(), close() and scrollToKey(value) — the actions a consumer cannot express declaratively.',
  ],
  [
    'ref',
    'Ref<HTMLInputElement>',
    '—',
    'ComboboxInput',
    'The input itself, for a consumer who needs the caret or the selection.',
  ],
  [
    'native props',
    'ComponentPropsWithRef<…>',
    '—',
    'every part',
    'Each part extends its own element’s props. A consumer’s onKeyDown, placeholder, maxLength or aria-label reaches the element that owns it, and the family’s handler composes with it rather than replacing it.',
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
  id: 'combobox-react-anatomy',
  language: 'tsx',
  label: 'The anatomy as it reaches the DOM',
  source: `<div
  data-ui="combobox"
  data-part="root"
  data-size="md"
  data-variant="outline"
  data-full-width
  data-open
>
  <input
    data-part="input"
    type="text"
    role="combobox"
    aria-autocomplete="list"
    aria-expanded="true"
    aria-controls="listbox-id"
    aria-activedescendant="option-blueberry"
    value="berr"
  />
  <button data-part="clear" type="button" aria-label="Clear"></button>
  <button data-part="trigger" type="button" tabindex="-1" aria-label="Show options">
    <span data-part="arrow"></span>
  </button>
</div>;

<div data-ui="combobox" data-part="positioner" data-side="bottom" data-align="start" data-open>
  <div data-part="content" role="listbox" id="listbox-id">
    <div data-part="item" role="option" id="option-blueberry" data-value="blueberry" data-current>
      <span data-part="label">
        Blue<mark data-part="match">berr</mark>y
      </span>
      <span data-part="indicator"></span>
    </div>
    <div data-part="status" role="status" aria-live="polite">
      3 results
    </div>
  </div>
</div>;`,
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
  --slotted-highlight-color: var(--slotted-tone-warning-text);
}`,
});

export const REACT_COMBOBOX_DOCS = {
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
