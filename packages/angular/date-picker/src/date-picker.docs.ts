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

export const ANGULAR_DATE_PICKER_TOKENS = datePickerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Date Picker decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlDatePicker, SlDatePickerPresets, SlDatePickerFooter } from '@slotted/angular/date-picker';",
  selector: '[slDatePicker]',
  exportAs: 'slDatePicker',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the consumer’s own element',
    required: true,
    purpose:
      'The box the family is selected by. Carries data-ui="date-picker", the axes, data-open and the state attributes. The consumer writes this element, so its classes, its attributes and its own directives are its own.',
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
      'Opens the surface, from inside the field’s slDateFieldEnd slot. Its accessible name carries the chosen date in words, because focus returns here when the surface closes and this is where the reader is told what happened. Always drawn: ChromeOS eats the Alt+ArrowDown chord before the browser sees it.',
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
      id: 'date-picker-angular-playground',
      label: 'Usage',
      language: 'angular',
      source: `<div slField>
  <label slFieldLabel>Vencimento</label>
  <div slDatePicker locale="pt-BR" name="vencimento" (valueChange)="onValue($event)"></div>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'Size',
    note: 'The three steps the field takes, with the trigger following: its box is the glyph plus a step of air, bounded by the frame, exactly as every other inner control in the library.',
    snippet: defineSnippet({
      id: 'date-picker-angular-sizes',
      label: 'The three steps',
      language: 'angular',
      source: `<div slDatePicker size="sm"></div>
<div slDatePicker size="md"></div>
<div slDatePicker size="lg"></div>`,
    }),
  },
  {
    id: 'variants',
    title: 'Variant',
    note: 'How much frame the control shows at rest. The trigger keeps its mark in all three, because what it says — this holds a date — does not change with how much border there is.',
    snippet: defineSnippet({
      id: 'date-picker-angular-variants',
      label: 'The three frames',
      language: 'angular',
      source: `<div slDatePicker variant="outline"></div>
<div slDatePicker variant="subtle"></div>
<div slDatePicker variant="plain"></div>`,
    }),
  },
  {
    id: 'placement',
    title: 'Where the surface opens',
    note: 'A preference rather than a promise: the positioner reads the room and flips the surface when it would not fit, and data-placement on the layer says where it ended up.',
    snippet: defineSnippet({
      id: 'date-picker-angular-placement',
      label: 'Placement',
      language: 'angular',
      source: `<div slDatePicker placement="bottom-start"></div>
<div slDatePicker placement="top-end"></div>`,
    }),
  },
  {
    id: 'range-bounds',
    title: 'Bounds',
    note: 'min and max fence both halves at once: the field refuses a date outside them and the grid stops the reader at the edge, from one pair of props.',
    snippet: defineSnippet({
      id: 'date-picker-angular-range-bounds',
      label: 'min and max',
      language: 'angular',
      source: `<div slDatePicker [min]="first" [max]="last"></div>`,
    }),
  },
  {
    id: 'unavailable',
    title: 'Days that are refused',
    note: 'One predicate reaches the field and the grid. A refused date makes the control invalid when it is typed, and cannot be pressed when it is shown.',
    snippet: defineSnippet({
      id: 'date-picker-angular-unavailable',
      label: 'A predicate',
      language: 'angular',
      source: `<div slDatePicker [isDateUnavailable]="isWeekend"></div>`,
    }),
  },
  {
    id: 'presets',
    title: 'Shortcuts and actions',
    note: 'The two slots the consumer fills. This family ships no preset list: the labels and the ranges are the product’s, and a list in the contract would be the library guessing at a business calendar.',
    snippet: defineSnippet({
      id: 'date-picker-angular-presets',
      label: 'Presets and footer',
      language: 'angular',
      source: `<div slDatePicker>
  <div slDatePickerPresets>
    <button type="button" (click)="today()">Hoje</button>
  </div>
  <div slDatePickerFooter>
    <button type="button" (click)="apply()">Aplicar</button>
  </div>
</div>`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Disabled and read-only both take the trigger out of the tab sequence, because a surface that opens onto a grid nothing answers is worse than no surface. Invalid retargets the ring on both halves at once.',
    snippet: defineSnippet({
      id: 'date-picker-angular-states',
      label: 'The four states',
      language: 'angular',
      source: `<div slDatePicker readOnly></div>
<div slDatePicker invalid></div>
<div slDatePicker disabled></div>
<div slDatePicker required></div>`,
    }),
  },
  {
    id: 'forms',
    title: 'In a form',
    note: 'The field’s hidden input carries the value as an ISO string under the name prop, so a plain form post sends 2026-09-09 whether the reader typed it or pressed it.',
    snippet: defineSnippet({
      id: 'date-picker-angular-forms',
      label: 'A plain form post',
      language: 'angular',
      source: `<form action="/reservas" method="post">
  <div slDatePicker name="entrada" required></div>
  <button type="submit">Reservar</button>
</form>`,
    }),
  },
  {
    id: 'narrow',
    title: 'On a finger, in a narrow viewport',
    note: 'Below 480 pixels on a coarse pointer the surface becomes a sheet attached to the bottom edge. The DOM does not change — data-presentation says which one it is — so the decision is testable without a device.',
    snippet: defineSnippet({
      id: 'date-picker-angular-narrow',
      label: 'Sheet',
      language: 'angular',
      source: `<div slDatePicker fixedWeeks></div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition and escape hatches',
    note: 'A provider sets the zone and the placement once, provideSlotted the language and the two trigger names; the ref hands back focus(), open() and close(); and the value is a request a consumer may refuse before anything commits.',
    snippet: defineSnippet({
      id: 'date-picker-angular-composition',
      label: 'Provider and exportAs',
      language: 'angular',
      source: `<div slDatePicker #picker="slDatePicker" locale="pt-BR" (valueChange)="$event.cancel()"></div>
<button type="button" (click)="picker.openSurface()">Abrir</button>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Alt+ArrowDown opens from the field and Escape closes and returns focus to the trigger — unless the calendar is showing months or years, in which case Escape walks it down a view and the surface stays.',
    snippet: defineSnippet({
      id: 'date-picker-angular-keyboard',
      label: 'The keys',
      language: 'angular',
      source: `<!-- Alt + ArrowDown  opens the surface from the field -->
<!-- Escape           walks a view down, or closes and returns focus -->
<!-- Tab              stays inside the surface while it is open -->
<div slDatePicker></div>`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'PlainDate | DateRange | PlainDate[] | null',
    '—',
    'SlDatePicker',
    'What the picker holds, which depends on selectionMode. Present means the consumer owns it.',
  ],
  [
    'defaultValue',
    'PlainDate | DateRange | PlainDate[] | null',
    '—',
    'SlDatePicker',
    'What it starts from when nobody else writes one. Read once.',
  ],
  [
    'open',
    'boolean',
    '—',
    'SlDatePicker',
    'Whether the surface is showing. Present means the consumer owns it.',
  ],
  ['defaultOpen', 'boolean', 'false', 'SlDatePicker', 'Whether it opens already showing.'],
  [
    'min',
    'PlainDate',
    '—',
    'SlDatePicker',
    'The earliest date either half accepts. One prop fences the field and the grid.',
  ],
  ['max', 'PlainDate', '—', 'SlDatePicker', 'The latest date either half accepts.'],
  [
    'isDateUnavailable',
    '(date: PlainDate) => boolean',
    '—',
    'SlDatePicker',
    'Refuses particular dates in both halves: typed, it makes the control invalid; shown, it cannot be pressed.',
  ],
  [
    'selectionMode',
    "'single' | 'range' | 'multiple'",
    'single',
    'SlDatePicker',
    'How many dates the reader may choose, and what the value then is.',
  ],
  ['months', 'number', '1', 'SlDatePicker', 'How many months the surface draws side by side.'],
  [
    'defaultView',
    "'day' | 'month' | 'year'",
    'day',
    'SlDatePicker',
    'The view the surface opens on.',
  ],
  ['weekNumbers', 'boolean', 'false', 'SlDatePicker', 'Draws the ISO week number in the grid.'],
  [
    'fixedWeeks',
    'boolean',
    'true',
    'SlDatePicker',
    'Six rows whatever the month needs. On by default here, because a surface that grows a row under the pointer moves the target.',
  ],
  [
    'placement',
    "'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end'",
    'bottom-start',
    'SlDatePicker',
    'Where the surface prefers to open. The positioner flips it when it would not fit.',
  ],
  [
    'closeOnSelect',
    "'auto' | 'always' | 'never'",
    'auto',
    'SlDatePicker',
    'auto closes for one date and stays open for a range or a set, which is the only combination that is not a trap.',
  ],
  [
    'locale',
    'string',
    'the language in force',
    'SlDatePicker',
    'BCP 47. Reaches both halves: the field’s order and the grid’s month names.',
  ],
  ['timeZone', 'string', 'the runtime’s', 'SlDatePicker', 'Which zone answers "what is today".'],
  ['firstDayOfWeek', 'number', 'the locale’s', 'SlDatePicker', '0 is Sunday.'],
  [
    'yearPivot',
    'number',
    '20',
    'SlDatePicker',
    'How a two-digit typed year resolves in the field.',
  ],
  [
    'calendar',
    "'gregory'",
    'gregory',
    'SlDatePicker',
    'The calendar system. One value today, and an axis rather than a silence.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'SlDatePicker',
    'The type step, matching the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'SlDatePicker',
    'How much frame the control shows at rest.',
  ],
  [
    'disabled',
    'boolean',
    '—',
    'SlDatePicker',
    'Takes the trigger out of the tab sequence as well as the segments.',
  ],
  [
    'readOnly',
    'boolean',
    '—',
    'SlDatePicker',
    'Readable and not changeable, and the trigger is out: a surface onto a grid nothing answers is worse than no surface.',
  ],
  ['invalid', 'boolean', '—', 'SlDatePicker', 'Retargets the focus ring on both halves.'],
  ['required', 'boolean', '—', 'SlDatePicker', 'Reaches the field’s group as aria-required.'],
  ['clearable', 'boolean', 'false', 'SlDatePicker', 'Draws the field’s clear button.'],
  [
    'name',
    'string',
    '—',
    'SlDatePicker',
    'The name the hidden input carries the ISO string under.',
  ],
  [
    'messages',
    'Partial<DatePickerMessages>',
    '—',
    'SlDatePicker',
    'Words laid over the language in force, key by key: the trigger’s name while nothing is chosen (choose), and once a date is (change, with the date in its {date} slot).',
  ],
  [
    'slDatePickerPresets',
    'Directive',
    '—',
    'SlDatePicker',
    'The consumer’s own shortcuts, beside the grid, as a directive on their own element.',
  ],
  [
    'slDatePickerFooter',
    'Directive',
    '—',
    'SlDatePicker',
    'The consumer’s own actions, under the surface, as a directive on their own element.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'valueChange',
    payload: 'ChangeRequest<CalendarValue>',
    when: 'Before the value moves, and cancellable, whichever half moved it: the request’s reason is keyboard when it was typed and pointer or keyboard when it was chosen in the grid. There is no two-way [(value)]: one slot could carry none of that.',
  },
  {
    name: 'openChange',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the surface opens or closes, and cancellable. The reason says which: pointer for the trigger, keyboard for the chord, escape for the key, outsidePress for a press elsewhere, and select for a date that closed it.',
  },
];

const composition: ApiRow[] = apiRows([
  [
    'provideDatePickerDefaults',
    'Provider',
    '—',
    'application',
    'Sets timeZone, placement, closeOnSelect, calendar, size and variant once for everything under the injector.',
  ],
  [
    'exportAs',
    'slDatePicker',
    '—',
    'SlDatePicker',
    'Hands a template the instance, so focus(), openSurface() and closeSurface() are reachable without a component of its own.',
  ],
  [
    'ng-content slots',
    'slDatePickerPresets, slDatePickerFooter',
    '—',
    'SlDatePicker',
    'The two places a consumer fills, as directives on their own elements, so a button, a list or a toolbar all keep their own semantics.',
  ],
]);

const accessibility: string[] = [
  'The trigger’s accessible name carries the chosen date in words. Focus returns to it when the surface closes, so it is where a screen-reader user is told what happened — which the APG names as an accessibility feature of its own example.',
  'Escape is staged. dismissable-layer listens in the capture phase, so a handler inside the surface would already have lost it; the family decides there instead, and walks the calendar down a view rather than closing while a month or year grid is showing.',
  'The chord is a shortcut and never the only way in. Angular Material records why: ChromeOS turns Alt+ArrowDown into PageDown before the browser sees it, so the trigger button is always drawn.',
  'The surface is a role="dialog" with the same name as the trigger, and the trigger points aria-controls at it only while it is showing — an idref to an element that is not there is worse than none.',
  'Both halves refuse the same dates from one predicate and one pair of bounds, so a date the grid will not accept is not one the field quietly takes.',
];

export const ANGULAR_DATE_PICKER_DOCS = {
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
