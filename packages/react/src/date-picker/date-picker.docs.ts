import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import datePickerTokens from '@slotted/styles/date-picker/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_DATE_PICKER_TOKENS = datePickerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Date Picker decision',
}));

const imports: ReferenceImport = {
  source: "import { DatePicker, DatePickerDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The box the family is selected by. Carries data-ui="date-picker", the axes, data-open and the state attributes. className, style and every native attribute reach it.',
  },
  {
    part: 'control',
    element: 'div',
    required: true,
    purpose:
      'What the positioner measures, and nothing else. It draws no frame: the date-field inside draws its own, and a second border here would be a second place to fix one defect.',
  },
  {
    part: 'trigger',
    element: 'button',
    required: true,
    purpose:
      'Opens the surface, from inside the field’s end slot. Its accessible name carries the chosen date in words, because focus returns here when the surface closes and this is where the reader is told what happened. Always drawn: ChromeOS eats the Alt+ArrowDown chord before the browser sees it.',
  },
  {
    part: 'positioner',
    element: 'div',
    required: true,
    purpose:
      'The layer the surface stands on, and what packages/core/src/positioner writes its position and custom properties onto. It takes no pointer of its own, so a press meant for the page is not swallowed by the frame around the surface.',
  },
  {
    part: 'content',
    element: 'div',
    required: true,
    purpose:
      'The painted surface, carrying role="dialog" and the same name as the trigger. It is sized by the calendar inside it rather than by the control it hangs from: a month is seven columns wide and a field is as wide as the form.',
  },
  {
    part: 'presets',
    element: 'div',
    required: false,
    purpose:
      'The consumer’s own shortcuts, in a column beside the grid. This family ships no list of them — "last 7 days" is a business calendar, and a library that guessed at one would be guessing at a fiscal year.',
  },
  {
    part: 'footer',
    element: 'div',
    required: false,
    purpose: 'The consumer’s own actions, under whatever the surface is holding.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'A field, a trigger and a calendar, driven by the controls below the canvas. Type into the field, or press the trigger and arrow around the grid — both write the same value.',
    snippet: defineSnippet({
      id: 'date-picker-react-playground',
      label: 'Usage',
      language: 'tsx',
      source: `<Field>
  <FieldLabel>Vencimento</FieldLabel>
  <DatePicker locale="pt-BR" name="vencimento" onValueChange={setValue} value={value} />
</Field>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'Size',
    note: 'The three steps the field takes, with the trigger following: its box is the glyph plus a step of air, bounded by the frame, exactly as every other inner control in the library.',
    snippet: defineSnippet({
      id: 'date-picker-react-sizes',
      label: 'The three steps',
      language: 'tsx',
      source: `<>
  <DatePicker size="sm" />
  <DatePicker size="md" />
  <DatePicker size="lg" />
</>;`,
    }),
  },
  {
    id: 'variants',
    title: 'Variant',
    note: 'How much frame the control shows at rest. The trigger keeps its mark in all three, because what it says — this holds a date — does not change with how much border there is.',
    snippet: defineSnippet({
      id: 'date-picker-react-variants',
      label: 'The three frames',
      language: 'tsx',
      source: `<>
  <DatePicker variant="outline" />
  <DatePicker variant="subtle" />
  <DatePicker variant="plain" />
</>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Where the surface opens',
    note: 'A preference rather than a promise: the positioner reads the room and flips the surface when it would not fit, and data-placement on the layer says where it ended up.',
    snippet: defineSnippet({
      id: 'date-picker-react-placement',
      label: 'Placement',
      language: 'tsx',
      source: `<>
  <DatePicker placement="bottom-start" />
  <DatePicker placement="top-end" />
</>;`,
    }),
  },
  {
    id: 'range-bounds',
    title: 'Bounds',
    note: 'min and max fence both halves at once: the field refuses a date outside them and the grid stops the reader at the edge, from one pair of props.',
    snippet: defineSnippet({
      id: 'date-picker-react-range-bounds',
      label: 'min and max',
      language: 'tsx',
      source: `<DatePicker max={{ year: 2026, month: 12, day: 31 }} min={{ year: 2026, month: 1, day: 1 }} />;`,
    }),
  },
  {
    id: 'unavailable',
    title: 'Days that are refused',
    note: 'One predicate reaches the field and the grid. A refused date makes the control invalid when it is typed, and cannot be pressed when it is shown.',
    snippet: defineSnippet({
      id: 'date-picker-react-unavailable',
      label: 'A predicate',
      language: 'tsx',
      source: `<DatePicker isDateUnavailable={(date) => isWeekend(date)} />;`,
    }),
  },
  {
    id: 'presets',
    title: 'Shortcuts and actions',
    note: 'The two slots the consumer fills. This family ships no preset list: the labels and the ranges are the product’s, and a list in the contract would be the library guessing at a business calendar.',
    snippet: defineSnippet({
      id: 'date-picker-react-presets',
      label: 'Presets and footer',
      language: 'tsx',
      source: `<DatePicker
  footer={<Button onClick={apply}>Aplicar</Button>}
  presets={<Button onClick={() => setValue(today)}>Hoje</Button>}
/>;`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Disabled and read-only both take the trigger out of the tab sequence, because a surface that opens onto a grid nothing answers is worse than no surface. Invalid retargets the ring on both halves at once.',
    snippet: defineSnippet({
      id: 'date-picker-react-states',
      label: 'The four states',
      language: 'tsx',
      source: `<>
  <DatePicker readOnly />
  <DatePicker invalid />
  <DatePicker disabled />
  <DatePicker required />
</>;`,
    }),
  },
  {
    id: 'forms',
    title: 'In a form',
    note: 'The field’s hidden input carries the value as an ISO string under the name prop, so a plain form post sends 2026-09-09 whether the reader typed it or pressed it.',
    snippet: defineSnippet({
      id: 'date-picker-react-forms',
      label: 'A plain form post',
      language: 'tsx',
      source: `<form action="/reservas" method="post">
  <DatePicker name="entrada" required />
  <Button type="submit">Reservar</Button>
</form>;`,
    }),
  },
  {
    id: 'narrow',
    title: 'On a finger, in a narrow viewport',
    note: 'Below 480 pixels on a coarse pointer the surface becomes a sheet attached to the bottom edge. The DOM does not change — data-presentation says which one it is — so the decision is testable without a device.',
    snippet: defineSnippet({
      id: 'date-picker-react-narrow',
      label: 'Sheet',
      language: 'tsx',
      source: `<DatePicker fixedWeeks />;`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition and escape hatches',
    note: 'A provider sets the zone and the placement once, SlottedProvider the language and the two trigger names; the ref hands back focus(), open() and close(); and the value is a request a consumer may refuse before anything commits.',
    snippet: defineSnippet({
      id: 'date-picker-react-composition',
      label: 'Provider and handle',
      language: 'tsx',
      source: `<DatePickerDefaultsProvider timeZone="America/Sao_Paulo">
  <DatePicker ref={handle} onValueChange={(value, request) => request.cancel()} />
</DatePickerDefaultsProvider>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Alt+ArrowDown opens from the field and Escape closes and returns focus to the trigger — unless the calendar is showing months or years, in which case Escape walks it down a view and the surface stays.',
    snippet: defineSnippet({
      id: 'date-picker-react-keyboard',
      label: 'The keys',
      language: 'tsx',
      source: `// Alt + ArrowDown  opens the surface from the field
// Escape           walks a view down, or closes and returns focus
// Tab              stays inside the surface while it is open
// the grid's own keys, once focus is in it`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'PlainDate | DateRange | PlainDate[] | null',
    '—',
    'DatePicker',
    'What the picker holds, which depends on selectionMode. Present means the consumer owns it.',
  ],
  [
    'defaultValue',
    'PlainDate | DateRange | PlainDate[] | null',
    '—',
    'DatePicker',
    'What it starts from when nobody else writes one. Read once.',
  ],
  [
    'open',
    'boolean',
    '—',
    'DatePicker',
    'Whether the surface is showing. Present means the consumer owns it.',
  ],
  ['defaultOpen', 'boolean', 'false', 'DatePicker', 'Whether it opens already showing.'],
  [
    'min',
    'PlainDate',
    '—',
    'DatePicker',
    'The earliest date either half accepts. One prop fences the field and the grid.',
  ],
  ['max', 'PlainDate', '—', 'DatePicker', 'The latest date either half accepts.'],
  [
    'isDateUnavailable',
    '(date: PlainDate) => boolean',
    '—',
    'DatePicker',
    'Refuses particular dates in both halves: typed, it makes the control invalid; shown, it cannot be pressed.',
  ],
  [
    'selectionMode',
    "'single' | 'range' | 'multiple'",
    'single',
    'DatePicker',
    'How many dates the reader may choose, and what the value then is.',
  ],
  ['months', 'number', '1', 'DatePicker', 'How many months the surface draws side by side.'],
  [
    'defaultView',
    "'day' | 'month' | 'year'",
    'day',
    'DatePicker',
    'The view the surface opens on.',
  ],
  ['weekNumbers', 'boolean', 'false', 'DatePicker', 'Draws the ISO week number in the grid.'],
  [
    'fixedWeeks',
    'boolean',
    'true',
    'DatePicker',
    'Six rows whatever the month needs. On by default here, because a surface that grows a row under the pointer moves the target.',
  ],
  [
    'placement',
    "'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end'",
    'bottom-start',
    'DatePicker',
    'Where the surface prefers to open. The positioner flips it when it would not fit.',
  ],
  [
    'closeOnSelect',
    "'auto' | 'always' | 'never'",
    'auto',
    'DatePicker',
    'auto closes for one date and stays open for a range or a set, which is the only combination that is not a trap.',
  ],
  [
    'locale',
    'string',
    'the language in force',
    'DatePicker',
    'BCP 47. Reaches both halves: the field’s order and the grid’s month names.',
  ],
  ['timeZone', 'string', 'the runtime’s', 'DatePicker', 'Which zone answers "what is today".'],
  ['firstDayOfWeek', 'number', 'the locale’s', 'DatePicker', '0 is Sunday.'],
  ['yearPivot', 'number', '20', 'DatePicker', 'How a two-digit typed year resolves in the field.'],
  [
    'calendar',
    "'gregory'",
    'gregory',
    'DatePicker',
    'The calendar system. One value today, and an axis rather than a silence.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'DatePicker',
    'The type step, matching the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'DatePicker',
    'How much frame the control shows at rest.',
  ],
  [
    'disabled',
    'boolean',
    '—',
    'DatePicker',
    'Takes the trigger out of the tab sequence as well as the segments.',
  ],
  [
    'readOnly',
    'boolean',
    '—',
    'DatePicker',
    'Readable and not changeable, and the trigger is out: a surface onto a grid nothing answers is worse than no surface.',
  ],
  ['invalid', 'boolean', '—', 'DatePicker', 'Retargets the focus ring on both halves.'],
  ['required', 'boolean', '—', 'DatePicker', 'Reaches the field’s group as aria-required.'],
  ['clearable', 'boolean', 'false', 'DatePicker', 'Draws the field’s clear button.'],
  ['name', 'string', '—', 'DatePicker', 'The name the hidden input carries the ISO string under.'],
  [
    'messages',
    'Partial<DatePickerMessages>',
    '—',
    'DatePicker',
    'Words laid over the language in force, key by key: the trigger’s name while nothing is chosen (choose), and once a date is (change, with the date in its {date} slot).',
  ],
  ['presets', 'ReactNode', '—', 'DatePicker', 'The consumer’s own shortcuts, beside the grid.'],
  ['footer', 'ReactNode', '—', 'DatePicker', 'The consumer’s own actions, under the surface.'],
]);

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: CalendarValue, request: ChangeRequest<CalendarValue>)',
    when: 'Before the value moves, and cancellable, whichever half moved it: the request’s reason is keyboard when it was typed and pointer or keyboard when it was chosen in the grid.',
  },
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: ChangeRequest<boolean>)',
    when: 'Before the surface opens or closes, and cancellable. The reason says which: pointer for the trigger, keyboard for the chord, escape for the key, outsidePress for a press elsewhere, and select for a date that closed it.',
  },
];

const composition: ApiRow[] = apiRows([
  [
    'DatePickerDefaultsProvider',
    'component',
    '—',
    'application',
    'Sets timeZone, placement, closeOnSelect, calendar, size and variant once for everything under it.',
  ],
  [
    'render',
    '(props: DatePickerRootProps) => ReactNode',
    '—',
    'DatePicker',
    'Substitutes the element the root renders. The props carry the ref, which the positioner measures its anchor through.',
  ],
  [
    'ref',
    'Ref<DatePickerHandle>',
    '—',
    'DatePicker',
    'focus() puts the reader on the first segment; open() and close() move the surface without a controlled prop.',
  ],
  [
    'onKeyDown',
    'KeyboardEventHandler',
    '—',
    'DatePicker',
    'Runs before the chord is read, and calling preventDefault stops it — which is how a page keeps Alt+ArrowDown for itself.',
  ],
]);

const accessibility: string[] = [
  'The trigger’s accessible name carries the chosen date in words. Focus returns to it when the surface closes, so it is where a screen-reader user is told what happened — which the APG names as an accessibility feature of its own example.',
  'Escape is staged. dismissable-layer listens in the capture phase, so a handler inside the surface would already have lost it; the family decides there instead, and walks the calendar down a view rather than closing while a month or year grid is showing.',
  'The chord is a shortcut and never the only way in. Angular Material records why: ChromeOS turns Alt+ArrowDown into PageDown before the browser sees it, so the trigger button is always drawn.',
  'The surface is a role="dialog" with the same name as the trigger, and the trigger points aria-controls at it only while it is showing — an idref to an element that is not there is worse than none.',
  'Both halves refuse the same dates from one predicate and one pair of bounds, so a date the grid will not accept is not one the field quietly takes.',
];

export const REACT_DATE_PICKER_DOCS = {
  datePicker: {
    accessibility,
    anatomy,
    api,
    composition,
    events,
    imports,
    scenes,
    snippets: [],
  },
};
