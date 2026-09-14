import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import dateRangePickerTokens from '@slotted/styles/date-range-picker/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_DATE_RANGE_PICKER_TOKENS = dateRangePickerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Date Range Picker decision',
}));

const imports: ReferenceImport = {
  source:
    "import { DateRangePicker, DateRangePickerDefaultsProvider, DateRangePickerPreset } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The box the family is selected by. Carries data-ui="date-range-picker", the axes, data-count, data-open and the state attributes. className, style and every native attribute reach it.',
  },
  {
    part: 'control',
    element: 'div',
    required: true,
    purpose:
      'The frame, and what the positioner measures. It draws the one border the two fields inside — each a date-field in variant="plain" — do not, and answers hover, focus and invalid once for both.',
  },
  {
    part: 'start',
    element: 'div',
    required: true,
    purpose:
      'Holds the start field. Carries data-current while the start is the end being edited, painted as an underline while the surface is open or focus is inside the frame.',
  },
  {
    part: 'separator',
    element: 'span',
    required: true,
    purpose: 'A dash between the two ends, aria-hidden: each field already names itself.',
  },
  {
    part: 'end',
    element: 'div',
    required: true,
    purpose: 'Holds the end field, and carries data-current while the end is being edited.',
  },
  {
    part: 'clear',
    element: 'button',
    required: false,
    purpose:
      'Empties both ends with the clear reason. Drawn with clearable, and the only clear in the frame: two fields each with their own would be three answers to one question.',
  },
  {
    part: 'trigger',
    element: 'button',
    required: true,
    purpose:
      'Opens the surface. Its accessible name carries both ends in words and the length, because focus returns here when the surface closes. Always drawn: ChromeOS eats the Alt+ArrowDown chord before the browser sees it.',
  },
  {
    part: 'positioner',
    element: 'div',
    required: false,
    purpose:
      'The layer the surface stands on, and what packages/core/src/positioner writes its position and custom properties onto. Carries data-presentation: popover, or sheet on a coarse pointer below 480 pixels.',
  },
  {
    part: 'content',
    element: 'div',
    required: false,
    purpose:
      'The painted surface, carrying role="dialog" and the same name as the trigger. Capped by the room the positioner measured, so two months that do not fit beside each other wrap.',
  },
  {
    part: 'head',
    element: 'div',
    required: false,
    purpose:
      'The band over the grid: the two ends as they stand, the length, and the limit. It renders at the surface’s width and contributes nothing to it.',
  },
  {
    part: 'head-start',
    element: 'span',
    required: false,
    purpose:
      'The start, written short. data-placeholder while there is none; data-pending while what it shows is the pending end rather than a chosen one.',
  },
  {
    part: 'head-end',
    element: 'span',
    required: false,
    purpose: 'The end, written short, with the same two attributes.',
  },
  {
    part: 'length',
    element: 'span',
    required: false,
    purpose:
      '"4 nights": the length of the run the pending end would close, or of the value. A polite live region, so a screen reader hears it on every arrow. data-pending while it is a proposal.',
  },
  {
    part: 'limit',
    element: 'span',
    required: false,
    purpose:
      '"2 to 7 nights": what minLength and maxLength allow, drawn while either is set. A rule the grid enforces is a rule the band names.',
  },
  {
    part: 'panels',
    element: 'div',
    required: false,
    purpose:
      'The shortcuts and the calendar as a wrapping row: beside each other where there is room, the grid under the shortcuts where there is not.',
  },
  {
    part: 'presets',
    element: 'div',
    required: false,
    purpose:
      'The consumer’s own shortcuts. This family ships the button each one is and the column they stand in, never the list: "last 7 days" is a business calendar.',
  },
  {
    part: 'preset',
    element: 'button, or the element render returns',
    required: false,
    purpose:
      'One shortcut, DateRangePickerPreset. Writes its range with the select reason and carries data-selected while the value equals it.',
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
    note: 'Check-in and check-out in one frame, driven by the controls below the canvas. Type into either field, or press the trigger and choose two days — the band above the grid says how many nights the run is while it is still being drawn.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-playground',
      label: 'Usage',
      language: 'tsx',
      source: `<Field>
  <FieldLabel>Estadia</FieldLabel>
  <DateRangePicker
    count="nights"
    locale="pt-BR"
    onValueChange={setValue}
    startName="checkin"
    endName="checkout"
    value={value}
  />
</Field>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'Size',
    note: 'The three steps the frame takes. The two fields, the dash, the trigger and its hit box all follow the control scales, so a range in a dense table shrinks whole rather than in parts.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-sizes',
      label: 'The three steps',
      language: 'tsx',
      source: `<>
  <DateRangePicker size="sm" />
  <DateRangePicker size="md" />
  <DateRangePicker size="lg" />
</>;`,
    }),
  },
  {
    id: 'variants',
    title: 'Variant',
    note: 'How much frame the control shows at rest. One frame for two fields: the fields inside are plain, and the frame answers hover, focus and invalid once for both, through the tokens the fields read rather than through their parts.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-variants',
      label: 'The three frames',
      language: 'tsx',
      source: `<>
  <DateRangePicker variant="outline" />
  <DateRangePicker variant="subtle" />
  <DateRangePicker variant="plain" />
</>;`,
    }),
  },
  {
    id: 'length',
    title: 'The length, while the run is drawn',
    note: 'Open the surface and choose a check-in: the band now follows the pointer, and the keyboard, saying "4 nights" for the day the run would close on. count decides what is counted — a stay counts nights, a leave request counts days — and the same two dates give 4 or 5.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-length',
      label: 'Nights and days',
      language: 'tsx',
      source: `<>
  <DateRangePicker count="nights" />
  <DateRangePicker count="days" />
</>;`,
    }),
  },
  {
    id: 'limits',
    title: 'Limits, explained',
    note: 'A stay of two to seven nights. With a check-in chosen, the grid refuses the days that would break the rule and the band says the rule; typed past it, the frame goes invalid. minLength and maxLength count in the unit count names.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-limits',
      label: 'Two to seven nights',
      language: 'tsx',
      source: `<DateRangePicker count="nights" maxLength={7} minLength={2} />;`,
    }),
  },
  {
    id: 'unavailable',
    title: 'Unavailable days',
    note: 'The room is taken from the 15th to the 18th. Choose a check-in before it: the grid refuses the nights past the first taken one, because a stay is contiguous. contiguous={false} lets a run jump over a blocked day, for a rule that is about the ends and not the nights between.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-unavailable',
      label: 'A blocked run',
      language: 'tsx',
      source: `<DateRangePicker isDateUnavailable={(date) => date.day >= 15 && date.day <= 18} />;`,
    }),
  },
  {
    id: 'presets',
    title: 'Presets',
    note: 'The stays a hotel offers by name. Each is a DateRangePickerPreset with its own range; pressing one writes the value and closes, and the one equal to the value is marked. The list is the product’s.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-presets',
      label: 'Named stays',
      language: 'tsx',
      source: `<DateRangePicker
  presets={
    <>
      <DateRangePickerPreset value={weekend}>Fim de semana</DateRangePickerPreset>
      <DateRangePickerPreset value={() => week(today)}>Uma semana</DateRangePickerPreset>
    </>
  }
/>;`,
    }),
  },
  {
    id: 'open-end',
    title: 'An open end',
    note: 'A check-in and no check-out is a value — { start, end: null } — written in the field where the reader sees it. Open the surface over it and the first press closes the run. required asks for both ends.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-open-end',
      label: 'From a date on',
      language: 'tsx',
      source: `<DateRangePicker defaultValue={{ start: checkin, end: null }} clearable />;`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Read-only keeps the value legible and copyable and takes the buttons out; disabled takes everything out and the dates stay readable; a check-out before its check-in is invalid on the end field and on the frame, and nothing is swapped; required reaches both fields.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-states',
      label: 'The four',
      language: 'tsx',
      source: `<>
  <DateRangePicker readOnly />
  <DateRangePicker disabled />
  <DateRangePicker value={{ start: checkout, end: checkin }} />
  <DateRangePicker required />
</>;`,
    }),
  },
  {
    id: 'forms',
    title: 'Forms',
    note: 'A plain form post sends two ISO strings under startName and endName, whether the reader typed them or pressed them. Choose a stay and submit.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-forms',
      label: 'Two names',
      language: 'tsx',
      source: `<form onSubmit={reserve}>
  <DateRangePicker endName="checkout" startName="checkin" required />
  <Button type="submit">Reservar</Button>
</form>;`,
    }),
  },
  {
    id: 'narrow',
    title: 'Narrow',
    note: 'In a column narrower than two dates the check-out drops to a second line and the trigger stays on the first; the surface is capped by the room there is and the second month wraps under the first. On a coarse pointer below 480 pixels it becomes a sheet.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-narrow',
      label: 'In a narrow column',
      language: 'tsx',
      source: `<div className="slotted-demo-measure">
  <DateRangePicker />
</div>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition',
    note: 'One provider sets the unit, the months, the locale and every label for the application. The handle opens, closes and focuses one end; position and onPositionChange let a consumer own which end the next press writes.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-composition',
      label: 'Set once, and the handle',
      language: 'tsx',
      source: `<DateRangePickerDefaultsProvider count="nights" locale="pt-BR" months={1}>
  <DateRangePicker ref={handle} />
</DateRangePickerDefaultsProvider>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Alt+ArrowDown opens from either field and leaves focus there. Enter on the trigger opens on the cell of the end being edited; every arrow in the grid moves the pending end and the band says the length; Enter twice writes the run. Escape walks a view down first, then closes and abandons a half-drawn run.',
    snippet: defineSnippet({
      id: 'date-range-picker-react-keyboard',
      label: 'The keys',
      language: 'tsx',
      source: `// Alt + ArrowDown  opens the surface from either field
// Enter, Space     on the trigger: opens on the current end
// arrows           move the pending end; the band says the length
// Enter, Space     first press starts the run, second press writes it
// Escape           walks a view down, or closes and abandons the draft
// Tab              stays inside the surface while it is open`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'DateRange | null',
    '—',
    'DateRangePicker',
    '{ start, end }, each end nullable. Present means the consumer owns it. Both ends null is null.',
  ],
  [
    'defaultValue',
    'DateRange | null',
    '—',
    'DateRangePicker',
    'What it starts from when nobody else writes one. Read once.',
  ],
  [
    'open',
    'boolean',
    '—',
    'DateRangePicker',
    'Whether the surface is showing. Present means the consumer owns it.',
  ],
  ['defaultOpen', 'boolean', 'false', 'DateRangePicker', 'Whether it opens already showing.'],
  [
    'position',
    "'start' | 'end'",
    '—',
    'DateRangePicker',
    'The end being edited: the field carrying data-current, and the end the next press in the grid writes. Present means the consumer owns it.',
  ],
  ['defaultPosition', "'start' | 'end'", 'start', 'DateRangePicker', 'Where editing starts.'],
  [
    'min',
    'PlainDate',
    '—',
    'DateRangePicker',
    'The earliest date any of the three accepts. Crossed with the value: the start field cannot step past the end, nor the end before the start.',
  ],
  ['max', 'PlainDate', '—', 'DateRangePicker', 'The latest date any of the three accepts.'],
  [
    'isDateUnavailable',
    '(date: PlainDate) => boolean',
    '—',
    'DateRangePicker',
    'Refuses particular dates. Typed inside a run, it makes the control invalid; shown, the day cannot be pressed.',
  ],
  [
    'contiguous',
    'boolean',
    'true',
    'DateRangePicker',
    'Whether a run may cross an unavailable day. On, and with a start chosen, the days beyond the first unavailable one are refused too; the search runs once per start, up to maxLength days or 366.',
  ],
  [
    'minLength',
    'number',
    '—',
    'DateRangePicker',
    'The shortest run allowed, in the unit count names. The grid refuses shorter ones and the band names the limit.',
  ],
  ['maxLength', 'number', '—', 'DateRangePicker', 'The longest run allowed.'],
  [
    'count',
    "'days' | 'nights'",
    'days',
    'DateRangePicker',
    'What the length counts. days counts both ends; nights counts the gaps between them. The same day at both ends is 1 day or 0 nights.',
  ],
  [
    'lengthLabel',
    '(count: number, unit) => string',
    '"4 nights"',
    'DateRangePicker',
    'What the band says for a length, in the product’s own words.',
  ],
  [
    'limitLabel',
    '(min, max, unit) => string',
    '"2 to 7 nights"',
    'DateRangePicker',
    'What the band says for the limits.',
  ],
  [
    'months',
    'number',
    '2',
    'DateRangePicker',
    'How many months the surface draws. They wrap when they do not fit.',
  ],
  ['weekNumbers', 'boolean', 'false', 'DateRangePicker', 'Draws the ISO week number in the grid.'],
  [
    'fixedWeeks',
    'boolean',
    'true',
    'DateRangePicker',
    'Six rows whatever the month needs, so a press of "next" moves no target.',
  ],
  [
    'placement',
    "'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end'",
    'bottom-start',
    'DateRangePicker',
    'Where the surface prefers to open. The positioner flips it when it would not fit.',
  ],
  [
    'closeOnSelect',
    "'auto' | 'always' | 'never'",
    'auto',
    'DateRangePicker',
    'auto closes when the run becomes whole — by the second press, or by a preset — and stays open after the first.',
  ],
  [
    'locale',
    'string',
    'the runtime’s',
    'DateRangePicker',
    'BCP 47. Reaches the two fields, the band and the grid.',
  ],
  ['timeZone', 'string', 'the runtime’s', 'DateRangePicker', 'Which zone answers "what is today".'],
  ['firstDayOfWeek', 'number', 'the locale’s', 'DateRangePicker', '0 is Sunday.'],
  [
    'yearPivot',
    'number',
    '20',
    'DateRangePicker',
    'How a two-digit typed year resolves in either field.',
  ],
  [
    'calendar',
    "'gregory'",
    'gregory',
    'DateRangePicker',
    'The calendar system. One value today, and an axis rather than a silence.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'DateRangePicker',
    'The type step, matching the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'DateRangePicker',
    'How much frame the control shows at rest.',
  ],
  [
    'disabled',
    'boolean',
    '—',
    'DateRangePicker',
    'Takes the two buttons out of the tab sequence as well as the segments.',
  ],
  [
    'readOnly',
    'boolean',
    '—',
    'DateRangePicker',
    'Readable and not changeable, and the buttons are out.',
  ],
  [
    'invalid',
    'boolean',
    '—',
    'DateRangePicker',
    'The consumer’s word, beside the family’s own: an end before its start, a bound broken, a run over an unavailable day or a length outside the limits is invalid whatever this says.',
  ],
  ['required', 'boolean', '—', 'DateRangePicker', 'Reaches both fields as aria-required.'],
  [
    'clearable',
    'boolean',
    'false',
    'DateRangePicker',
    'Draws one clear on the frame, which empties both ends.',
  ],
  ['clearLabel', 'string', 'Clear range', 'DateRangePicker', 'The clear button’s name.'],
  [
    'chooseLabel',
    'string',
    'Choose range',
    'DateRangePicker',
    'The trigger’s name while nothing is chosen.',
  ],
  [
    'changeLabel',
    'string',
    'Change range',
    'DateRangePicker',
    'The trigger’s name once a run is chosen, before the two dates and the length.',
  ],
  [
    'startLabel',
    'string',
    'Start',
    'DateRangePicker',
    'The start field’s accessible name, and the band’s placeholder for it.',
  ],
  [
    'endLabel',
    'string',
    'End',
    'DateRangePicker',
    'The end field’s accessible name, and the band’s placeholder for it.',
  ],
  [
    'startName',
    'string',
    '—',
    'DateRangePicker',
    'The name the start’s hidden input carries the ISO string under.',
  ],
  [
    'endName',
    'string',
    '—',
    'DateRangePicker',
    'The name the end’s hidden input carries the ISO string under.',
  ],
  [
    'presets',
    'ReactNode',
    '—',
    'DateRangePicker',
    'The consumer’s own shortcuts, as DateRangePickerPreset elements.',
  ],
  ['footer', 'ReactNode', '—', 'DateRangePicker', 'The consumer’s own actions, under the surface.'],
  [
    'value',
    'DateRange | (() => DateRange)',
    '—',
    'DateRangePickerPreset',
    'The range the press writes, or a function resolving it at the press — "next weekend" is computed when it is chosen, not when the page rendered.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: DateRange | null, request: ChangeRequest<DateRange | null>)',
    when: 'Before the value moves, and cancellable. The reason is keyboard or blur when an end was typed, select when the grid closed the run or a preset wrote it, and clear for the clear button. The first press in the grid emits nothing: it is a draft.',
  },
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: ChangeRequest<boolean>)',
    when: 'Before the surface opens or closes, and cancellable. pointer for the trigger, keyboard for the chord, escape for the key, outsidePress for a press elsewhere, and select for a run that closed it.',
  },
  {
    name: 'onPositionChange',
    payload: "(position: 'start' | 'end', request: ChangeRequest<'start' | 'end'>)",
    when: 'Before the current end moves. pointer or keyboard when focus entered a field, select when a press in the grid or a preset moved it, clear for the clear button.',
  },
];

const composition: ApiRow[] = apiRows([
  [
    'DateRangePickerDefaultsProvider',
    'component',
    '—',
    'application',
    'Sets locale, timeZone, calendar, months, count, lengthLabel, limitLabel, closeOnSelect, placement, size, variant and every label once for everything under it.',
  ],
  [
    'DateRangePickerPreset',
    'component',
    '—',
    'presets',
    'One shortcut inside presets. Takes every button prop, composes onClick, and takes render to substitute its element.',
  ],
  [
    'render',
    '(props: DateRangePickerRootProps) => ReactNode',
    '—',
    'DateRangePicker',
    'Substitutes the element the root renders. The props carry the ref, which the positioner measures its anchor through.',
  ],
  [
    'ref',
    'Ref<DateRangePickerHandle>',
    '—',
    'DateRangePicker',
    'focus(position?) puts the reader on one end, the current one by default; open() and close() move the surface without a controlled prop.',
  ],
  [
    'onKeyDown',
    'KeyboardEventHandler',
    '—',
    'DateRangePicker',
    'Runs before the chord is read, and calling preventDefault stops it — which is how a page keeps Alt+ArrowDown for itself.',
  ],
]);

const accessibility: string[] = [
  'The trigger’s accessible name carries both ends in words and the length — "Change range, 12 September 2026 – 16 September 2026, 4 nights". Focus returns to it when the surface closes, so it is where a screen-reader user is told what happened.',
  'The length is a polite live region. A sighted reader sees "4 nights" follow the pointer; a screen-reader user hears it follow every arrow, which is the same information at the same moment.',
  'The two fields name themselves — startLabel and endLabel reach their groups — and the dash between them is aria-hidden. Each field keeps its own three spin buttons and its own keyboard.',
  'Escape is staged. dismissable-layer listens in the capture phase, so the family decides there: the calendar walks a view down first, and only then does the surface close and the half-drawn run get abandoned.',
  'A half-drawn run never reaches a form. The first press is a draft the band shows and no request carries; the second press emits the whole run. An open end that was typed is a value, because the reader saw it in the field.',
  'The surface is a role="dialog" with the same name as the trigger, and the trigger points aria-controls at it only while it is showing. Only one cell of the grid is in the Tab sequence, as the Grid Pattern requires.',
];

export const REACT_DATE_RANGE_PICKER_DOCS = {
  dateRangePicker: {
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
