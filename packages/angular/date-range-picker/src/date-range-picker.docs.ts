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

export const ANGULAR_DATE_RANGE_PICKER_TOKENS = dateRangePickerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Date Range Picker decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlDateRangePicker, SlDateRangePickerPreset, SlDateRangePickerPresets, SlDateRangePickerFooter } from '@slotted/angular/date-range-picker';",
  selector: '[slDateRangePicker]',
  exportAs: 'slDateRangePicker',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the consumer’s own element',
    required: true,
    purpose:
      'The box the family is selected by. Carries data-ui="date-range-picker", the axes, data-count, data-open and the state attributes. The consumer writes this element, so its classes, its attributes and its own directives are its own.',
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
    element: 'the consumer’s own button',
    required: false,
    purpose:
      'One shortcut, the slDateRangePickerPreset directive. Writes its range with the select reason and carries data-selected while the value equals it.',
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
      id: 'date-range-picker-angular-playground',
      label: 'Usage',
      language: 'angular',
      source: `<div slField>
  <label slFieldLabel>Estadia</label>
  <div
    slDateRangePicker
    count="nights"
    locale="pt-BR"
    startName="checkin"
    endName="checkout"
    [value]="value"
    (valueChange)="value = $event.value"
  ></div>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'Size',
    note: 'The three steps the frame takes. The two fields, the dash, the trigger and its hit box all follow the control scales, so a range in a dense table shrinks whole rather than in parts.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-sizes',
      label: 'The three steps',
      language: 'angular',
      source: `<div slDateRangePicker size="sm"></div>
<div slDateRangePicker size="md"></div>
<div slDateRangePicker size="lg"></div>`,
    }),
  },
  {
    id: 'variants',
    title: 'Variant',
    note: 'How much frame the control shows at rest. One frame for two fields: the fields inside are plain, and the frame answers hover, focus and invalid once for both, through the tokens the fields read rather than through their parts.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-variants',
      label: 'The three frames',
      language: 'angular',
      source: `<div slDateRangePicker variant="outline"></div>
<div slDateRangePicker variant="subtle"></div>
<div slDateRangePicker variant="plain"></div>`,
    }),
  },
  {
    id: 'length',
    title: 'The length, while the run is drawn',
    note: 'Open the surface and choose a check-in: the band now follows the pointer, and the keyboard, saying "4 nights" for the day the run would close on. count decides what is counted — a stay counts nights, a leave request counts days — and the same two dates give 4 or 5.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-length',
      label: 'Nights and days',
      language: 'angular',
      source: `<div slDateRangePicker count="nights"></div>
<div slDateRangePicker count="days"></div>`,
    }),
  },
  {
    id: 'limits',
    title: 'Limits, explained',
    note: 'A stay of two to seven nights. With a check-in chosen, the grid refuses the days that would break the rule and the band says the rule; typed past it, the frame goes invalid. minLength and maxLength count in the unit count names.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-limits',
      label: 'Two to seven nights',
      language: 'angular',
      source: `<div slDateRangePicker count="nights" [minLength]="2" [maxLength]="7"></div>`,
    }),
  },
  {
    id: 'unavailable',
    title: 'Unavailable days',
    note: 'The room is taken from the 15th to the 18th. Choose a check-in before it: the grid refuses the nights past the first taken one, because a stay is contiguous. contiguous={false} lets a run jump over a blocked day, for a rule that is about the ends and not the nights between.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-unavailable',
      label: 'A blocked run',
      language: 'angular',
      source: `<div slDateRangePicker [isDateUnavailable]="isTaken"></div>`,
    }),
  },
  {
    id: 'presets',
    title: 'Presets',
    note: 'The stays a hotel offers by name. Each is a DateRangePickerPreset with its own range; pressing one writes the value and closes, and the one equal to the value is marked. The list is the product’s.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-presets',
      label: 'Named stays',
      language: 'angular',
      source: `<div slDateRangePicker>
  <div slDateRangePickerPresets>
    <button [slDateRangePickerPreset]="weekend">Fim de semana</button>
    <button [slDateRangePickerPreset]="week">Uma semana</button>
  </div>
</div>`,
    }),
  },
  {
    id: 'open-end',
    title: 'An open end',
    note: 'A check-in and no check-out is a value — { start, end: null } — written in the field where the reader sees it. Open the surface over it and the first press closes the run. required asks for both ends.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-open-end',
      label: 'From a date on',
      language: 'angular',
      source: `<div slDateRangePicker clearable [defaultValue]="{ start: checkin, end: null }"></div>`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Read-only keeps the value legible and copyable and takes the buttons out; disabled takes everything out and the dates stay readable; a check-out before its check-in is invalid on the end field and on the frame, and nothing is swapped; required reaches both fields.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-states',
      label: 'The four',
      language: 'angular',
      source: `<div slDateRangePicker readOnly></div>
<div slDateRangePicker disabled></div>
<div slDateRangePicker [value]="reversed"></div>
<div slDateRangePicker required></div>`,
    }),
  },
  {
    id: 'forms',
    title: 'Forms',
    note: 'A plain form post sends two ISO strings under startName and endName, whether the reader typed them or pressed them. Choose a stay and submit.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-forms',
      label: 'Two names',
      language: 'angular',
      source: `<form [formGroup]="reservation" (ngSubmit)="reserve()">
  <div slDateRangePicker formControlName="stay" startName="checkin" endName="checkout"></div>
  <button type="submit">Reservar</button>
</form>`,
    }),
  },
  {
    id: 'narrow',
    title: 'Narrow',
    note: 'In a column narrower than two dates the frame stays one line: each date clips its own digits at its edge and scrolls the field the reader steps into back into view, and the trigger stays where it is. The surface is capped by the room there is and the second month wraps under the first. On a coarse pointer below 480 pixels it becomes a sheet.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-narrow',
      label: 'In a narrow column',
      language: 'angular',
      source: `<div class="slotted-demo-measure">
  <div slDateRangePicker></div>
</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition',
    note: 'One provider sets the unit, the months, the locale and every label for the application. The handle opens, closes and focuses one end; position and onPositionChange let a consumer own which end the next press writes.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-composition',
      label: 'Set once, and the handle',
      language: 'angular',
      source: `<div
  slDateRangePicker
  #picker="slDateRangePicker"
  [position]="position"
  (positionChange)="position = $event.value"
></div>
<button type="button" (click)="picker.openSurface()">Abrir</button>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Alt+ArrowDown opens from either field and leaves focus there. Enter on the trigger opens on the cell of the end being edited; every arrow in the grid moves the pending end and the band says the length; Enter twice writes the run. Escape walks a view down first, then closes and abandons a half-drawn run.',
    snippet: defineSnippet({
      id: 'date-range-picker-angular-keyboard',
      label: 'The keys',
      language: 'angular',
      source: `<!-- Alt + ArrowDown  opens the surface from either field -->
<!-- Enter, Space     on the trigger: opens on the current end -->
<!-- arrows           move the pending end; the band says the length -->
<!-- Enter, Space     first press starts the run, second press writes it -->
<!-- Escape           walks a view down, or closes and abandons the draft -->
<div slDateRangePicker></div>`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'DateRange | null',
    '—',
    'SlDateRangePicker',
    '{ start, end }, each end nullable. Present means the consumer owns it. Both ends null is null.',
  ],
  [
    'defaultValue',
    'DateRange | null',
    '—',
    'SlDateRangePicker',
    'What it starts from when nobody else writes one. Read once.',
  ],
  [
    'open',
    'boolean',
    '—',
    'SlDateRangePicker',
    'Whether the surface is showing. Present means the consumer owns it.',
  ],
  ['defaultOpen', 'boolean', 'false', 'SlDateRangePicker', 'Whether it opens already showing.'],
  [
    'position',
    "'start' | 'end'",
    '—',
    'SlDateRangePicker',
    'The end being edited: the field carrying data-current, and the end the next press in the grid writes. Present means the consumer owns it.',
  ],
  ['defaultPosition', "'start' | 'end'", 'start', 'SlDateRangePicker', 'Where editing starts.'],
  [
    'min',
    'PlainDate',
    '—',
    'SlDateRangePicker',
    'The earliest date any of the three accepts. Crossed with the value: the start field cannot step past the end, nor the end before the start.',
  ],
  ['max', 'PlainDate', '—', 'SlDateRangePicker', 'The latest date any of the three accepts.'],
  [
    'isDateUnavailable',
    '(date: PlainDate) => boolean',
    '—',
    'SlDateRangePicker',
    'Refuses particular dates. Typed inside a run, it makes the control invalid; shown, the day cannot be pressed.',
  ],
  [
    'contiguous',
    'boolean',
    'true',
    'SlDateRangePicker',
    'Whether a run may cross an unavailable day. On, and with a start chosen, the days beyond the first unavailable one are refused too; the search runs once per start, up to maxLength days or 366.',
  ],
  [
    'minLength',
    'number',
    '—',
    'SlDateRangePicker',
    'The shortest run allowed, in the unit count names. The grid refuses shorter ones and the band names the limit.',
  ],
  ['maxLength', 'number', '—', 'SlDateRangePicker', 'The longest run allowed.'],
  [
    'count',
    "'days' | 'nights'",
    'days',
    'SlDateRangePicker',
    'What the length counts. days counts both ends; nights counts the gaps between them. The same day at both ends is 1 day or 0 nights.',
  ],
  [
    'lengthLabel',
    '(count: number, unit) => string',
    '"4 nights"',
    'SlDateRangePicker',
    'What the band says for a length, in the product’s own words.',
  ],
  [
    'limitLabel',
    '(min, max, unit) => string',
    '"2 to 7 nights"',
    'SlDateRangePicker',
    'What the band says for the limits.',
  ],
  [
    'months',
    'number',
    '2',
    'SlDateRangePicker',
    'How many months the surface draws. They wrap when they do not fit.',
  ],
  [
    'weekNumbers',
    'boolean',
    'false',
    'SlDateRangePicker',
    'Draws the ISO week number in the grid.',
  ],
  [
    'fixedWeeks',
    'boolean',
    'true',
    'SlDateRangePicker',
    'Six rows whatever the month needs, so a press of "next" moves no target.',
  ],
  [
    'placement',
    "'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end'",
    'bottom-start',
    'SlDateRangePicker',
    'Where the surface prefers to open. The positioner flips it when it would not fit.',
  ],
  [
    'closeOnSelect',
    "'auto' | 'always' | 'never'",
    'auto',
    'SlDateRangePicker',
    'auto closes when the run becomes whole — by the second press, or by a preset — and stays open after the first.',
  ],
  [
    'locale',
    'string',
    'the runtime’s',
    'SlDateRangePicker',
    'BCP 47. Reaches the two fields, the band and the grid.',
  ],
  [
    'timeZone',
    'string',
    'the runtime’s',
    'SlDateRangePicker',
    'Which zone answers "what is today".',
  ],
  ['firstDayOfWeek', 'number', 'the locale’s', 'SlDateRangePicker', '0 is Sunday.'],
  [
    'yearPivot',
    'number',
    '20',
    'SlDateRangePicker',
    'How a two-digit typed year resolves in either field.',
  ],
  [
    'calendar',
    "'gregory'",
    'gregory',
    'SlDateRangePicker',
    'The calendar system. One value today, and an axis rather than a silence.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'SlDateRangePicker',
    'The type step, matching the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'SlDateRangePicker',
    'How much frame the control shows at rest.',
  ],
  [
    'disabled',
    'boolean',
    '—',
    'SlDateRangePicker',
    'Takes the two buttons out of the tab sequence as well as the segments.',
  ],
  [
    'readOnly',
    'boolean',
    '—',
    'SlDateRangePicker',
    'Readable and not changeable, and the buttons are out.',
  ],
  [
    'invalid',
    'boolean',
    '—',
    'SlDateRangePicker',
    'The consumer’s word, beside the family’s own: an end before its start, a bound broken, a run over an unavailable day or a length outside the limits is invalid whatever this says.',
  ],
  ['required', 'boolean', '—', 'SlDateRangePicker', 'Reaches both fields as aria-required.'],
  [
    'clearable',
    'boolean',
    'false',
    'SlDateRangePicker',
    'Draws one clear on the frame, which empties both ends.',
  ],
  ['clearLabel', 'string', 'Clear range', 'SlDateRangePicker', 'The clear button’s name.'],
  [
    'chooseLabel',
    'string',
    'Choose range',
    'SlDateRangePicker',
    'The trigger’s name while nothing is chosen.',
  ],
  [
    'changeLabel',
    'string',
    'Change range',
    'SlDateRangePicker',
    'The trigger’s name once a run is chosen, before the two dates and the length.',
  ],
  [
    'startLabel',
    'string',
    'Start',
    'SlDateRangePicker',
    'The start field’s accessible name, and the band’s placeholder for it.',
  ],
  [
    'endLabel',
    'string',
    'End',
    'SlDateRangePicker',
    'The end field’s accessible name, and the band’s placeholder for it.',
  ],
  [
    'startName',
    'string',
    '—',
    'SlDateRangePicker',
    'The name the start’s hidden input carries the ISO string under.',
  ],
  [
    'endName',
    'string',
    '—',
    'SlDateRangePicker',
    'The name the end’s hidden input carries the ISO string under.',
  ],
  [
    'slDateRangePickerPresets',
    'Directive',
    '—',
    'SlDateRangePicker',
    'The consumer’s own shortcuts, as a directive on their own element holding slDateRangePickerPreset buttons.',
  ],
  [
    'slDateRangePickerFooter',
    'Directive',
    '—',
    'SlDateRangePicker',
    'The consumer’s own actions, under the surface, as a directive on their own element.',
  ],
  [
    'slDateRangePickerPreset',
    'DateRange | (() => DateRange)',
    '—',
    'SlDateRangePickerPreset',
    'The range the press writes, or a function resolving it at the press — "next weekend" is computed when it is chosen, not when the page rendered.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'valueChange',
    payload: 'ChangeRequest<DateRange | null>',
    when: 'Before the value moves, and cancellable. The reason is keyboard or blur when an end was typed, select when the grid closed the run or a preset wrote it, and clear for the clear button. The first press in the grid emits nothing: it is a draft. There is no two-way [(value)]: one slot could carry none of that; a form control carries it instead.',
  },
  {
    name: 'openChange',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the surface opens or closes, and cancellable. pointer for the trigger, keyboard for the chord, escape for the key, outsidePress for a press elsewhere, and select for a run that closed it.',
  },
  {
    name: 'positionChange',
    payload: "ChangeRequest<'start' | 'end'>",
    when: 'Before the current end moves. pointer or keyboard when focus entered a field, select when a press in the grid or a preset moved it, clear for the clear button.',
  },
];

const composition: ApiRow[] = apiRows([
  [
    'provideDateRangePickerDefaults',
    'Provider',
    '—',
    'application',
    'Sets locale, timeZone, calendar, months, count, lengthLabel, limitLabel, closeOnSelect, placement, size, variant and every label once for everything under the injector.',
  ],
  [
    'ControlValueAccessor and Validator',
    'formControl, formControlName, ngModel',
    '—',
    'SlDateRangePicker',
    'The whole { start, end } is the control’s value, and the family reports what no other validator can see: slottedDateRangeOrder, slottedDateRangeMin, slottedDateRangeMax, slottedDateRangeUnavailable and slottedDateRangeLength.',
  ],
  [
    'exportAs',
    'slDateRangePicker',
    '—',
    'SlDateRangePicker',
    'Hands a template the instance, so focus(position?), openSurface(), closeSurface() and choose(range) are reachable without a component of its own.',
  ],
  [
    'ng-content slots',
    'slDateRangePickerPresets, slDateRangePickerFooter',
    '—',
    'SlDateRangePicker',
    'The two places a consumer fills, as directives on their own elements, so a button, a list or a toolbar all keep their own semantics.',
  ],
  [
    'slDateRangePickerPreset',
    'Directive on button',
    '—',
    'presets',
    'One shortcut on the consumer’s own button: it takes the range, writes data-part and type, and composes the click — a handler that calls preventDefault keeps the value where it was.',
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

export const ANGULAR_DATE_RANGE_PICKER_DOCS = {
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
