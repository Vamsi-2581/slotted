import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import dateTimePickerTokens from '@slotted/styles/datetime-picker/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_DATE_TIME_PICKER_TOKENS = dateTimePickerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned DateTime Picker decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlDateTimePicker, SlDateTimePickerOption, SlDateTimePickerPresets, SlDateTimePickerFooter } from '@slotted/angular/datetime-picker';",
  selector: '[slDateTimePicker]',
  exportAs: 'slDateTimePicker',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element the directive is on',
    required: true,
    purpose:
      'The frame. Carries data-ui="datetime-picker", the axes and the state attributes. It has no role: the control inside holds the field and the trigger, and the panel is a layer of its own.',
  },
  {
    part: 'control',
    element: 'div',
    required: true,
    purpose:
      'The box the positioner measures, and nothing else. It draws no frame — the datetime-field inside draws its own — and it is where Alt+ArrowDown is heard.',
  },
  {
    part: 'trigger',
    element: 'button',
    required: true,
    purpose:
      'Opens the panel, from inside the field’s end slot. aria-haspopup="dialog", aria-expanded while the panel is showing, and an accessible name that carries the chosen datetime — because focus returns here when the panel closes, so this is where the reader is told what was chosen. It draws the calendar mark, which is the mark input[type=datetime-local] draws for the same control.',
  },
  {
    part: 'positioner',
    element: 'div',
    required: false,
    purpose:
      'The layer, portalled to the end of the document. It carries data-ui as well, because a stylesheet cannot reach a subtree that is no longer inside the root. data-placement says where the positioner put it and data-presentation says whether it is a popover or a sheet.',
  },
  {
    part: 'content',
    element: 'div',
    required: false,
    purpose:
      'role="dialog", which is the role the APG’s own Date Picker Combobox example gives its popup. It holds a grid and a listbox, and its accessible name is the same one the trigger carries.',
  },
  {
    part: 'head',
    element: 'div',
    required: false,
    purpose:
      'The band above both surfaces, with a rule under it: what the reader has chosen so far, the consumer’s own shortcuts, and now. It renders at the panel’s width and contributes nothing to it, so a row of shortcuts cannot stretch the month.',
  },
  {
    part: 'head-value',
    element: 'span',
    required: false,
    purpose:
      'The value as it stands, with the half the reader has not written drawn as its placeholder beside the half they have. It is the one thing neither surface can show: a reader who chose a day and is now reading a column of times otherwise has nothing telling them which day those times belong to.',
  },
  {
    part: 'now',
    element: 'button',
    required: false,
    purpose:
      'Writes the current datetime, both halves at once. It carries the clock — the second of the family’s two marks — and it is the zero case of the field’s own relative expression, for a reader who never discovers that + opens one.',
  },
  {
    part: 'presets',
    element: 'the consumer’s own element, marked slDateTimePickerPresets',
    required: false,
    purpose:
      'The consumer’s own shortcuts, in the head beside now. This family ships no list of them: "tomorrow at nine" is a business clock, and a library that guessed at one would be guessing at an industry.',
  },
  {
    part: 'panels',
    element: 'div',
    required: false,
    purpose:
      'The two tracks, as a wrapping flex row. Two columns where the positioner measured room for both, one where it did not — and no container query, because a surface shrink-wrapped from a calendar has no width of its own to ask about.',
  },
  {
    part: 'date-panel',
    element: 'div',
    required: false,
    purpose:
      'Holds SlCalendar, unredrawn: its grid, its three views, its roving focus and its own keyboard. The column never shrinks below the month, so it is the time panel that wraps when the room runs out.',
  },
  {
    part: 'time-panel',
    element: 'div',
    required: false,
    purpose:
      'Holds the list. Beside the month it is the narrow column; wrapped onto a line of its own it takes the whole line, so the times read as a section rather than as a strip.',
  },
  {
    part: 'list',
    element: 'div',
    required: false,
    purpose:
      'role="listbox" over the times available on the day the reader is on, with its own accessible name naming that day. It is the only thing in the panel that scrolls, and data-truncated says the configuration asked for more rows than maxOptions allows.',
  },
  {
    part: 'option',
    element: 'div',
    required: false,
    purpose:
      'role="option", one whole time. It carries the time and nothing else: the day is the calendar’s to say, and repeating it ninety-six times would spend the whole column on one word. A slDateTimePickerOption template draws what is inside it.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose:
      'Drawn when the day the reader is on offers no time at all — a closed Saturday, a window the two bounds leave empty, a predicate that refuses every step. It is a sentence rather than an empty box: MUI draws nothing here and Ant draws an empty column, and both read as a broken component.',
  },
  {
    part: 'footer',
    element: 'the consumer’s own element, marked slDateTimePickerFooter',
    required: false,
    purpose:
      'The consumer’s own actions, under both surfaces. The family needs none — the value’s own completeness closes the panel — and the slot is here for a flow that wants a deliberate confirmation anyway.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls below the canvas. Open it: the calendar and the list are both there, the head says what you have so far, and the panel closes on the press that finishes the value.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-playground',
      label: 'Usage',
      language: 'angular',
      source: `<div slField>
  <label slFieldLabel>Início da consulta</label>
  <div slDateTimePicker name="inicio" locale="pt-BR" [clearable]="true"></div>
  <span slFieldDescription>A consulta começa nesta data e hora.</span>
</div>`,
    }),
  },
  {
    id: 'panel',
    title: 'Two surfaces, one dialog',
    note: 'The only panel in the library that holds two widgets: a grid that SlCalendar draws and a listbox that this family draws. Both are in the DOM at every width — a tablist that exists on a narrow container and not on a wide one tells assistive technology two different stories about the same component, which is the arrangement Kendo and MUI ship and this family declines.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-panel',
      label: 'The panel',
      language: 'angular',
      source: `<div slDateTimePicker locale="pt-BR" [defaultOpen]="true"></div>`,
    }),
  },
  {
    id: 'open-to',
    title: 'Which surface focus opens on',
    note: 'openTo decides where focus lands, not what is drawn. Both surfaces are present either way, and the reading order is the value’s own — moving a whole calendar because focus starts elsewhere would make one setting look like a different component.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-open-to',
      label: 'Opening on the time',
      language: 'angular',
      source: `<div slDateTimePicker openTo="time" locale="pt-BR"></div>`,
    }),
  },
  {
    id: 'completeness',
    title: 'Completeness closes the panel, not a button',
    note: 'The press that leaves the value incomplete carries focus to the half that is missing; the press that completes it closes the panel; and a press on a value that was already whole changes one half and leaves the panel where it is — so a reader who opened a filled field to change both is not shut out by their first press. Ant adds needConfirm for this and Kendo adds Set.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-completeness',
      label: 'The three closings',
      language: 'angular',
      source: `<div slDateTimePicker closeOnSelect="auto"></div>
<div slDateTimePicker closeOnSelect="always"></div>
<div slDateTimePicker closeOnSelect="never"></div>`,
    }),
  },
  {
    id: 'seconds',
    title: 'Seconds',
    note: 'The field writes every second and the panel offers a half-minute step, which is eleven rows inside a bounded window rather than the 86 400 a whole day would be. The guard is on the length of the list — maxOptions — and not on the size of the step.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-seconds',
      label: 'A half-minute step',
      language: 'angular',
      source: `<div slDateTimePicker granularity="second" [step]="30"></div>`,
    }),
  },
  {
    id: 'step',
    title: 'The step, and what it counts from',
    note: 'The base is min’s own time when min is stated and midnight when it is not — the platform’s rule for input[type=time], which no surveyed panel states at all. A step of 900 with a min of 09:07 offers 09:07, 09:22, 09:37, and the field still accepts 09:15 by typing.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-step',
      label: 'A quarter hour from 09:07',
      language: 'angular',
      source: `<div slDateTimePicker [min]="opensAt0907" [step]="900"></div>`,
    }),
  },
  {
    id: 'range-bounds',
    title: 'Two pairs of bounds, at the same time',
    note: 'min and max fence the whole value; minTime and maxTime fence every day inside the range. On min’s own day the list starts at min’s time, on max’s own day it stops at max’s, and on every day between it runs the repeating window — the rule MDN states for the platform and no surveyed script implements. MUI’s own validation page records that it cannot combine the two.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-range-bounds',
      label: 'A booking window',
      language: 'angular',
      source: `<div
  slDateTimePicker
  [min]="clinicOpens"
  [max]="clinicCloses"
  [minTime]="nine"
  [maxTime]="six"
></div>`,
    }),
  },
  {
    id: 'day-window',
    title: 'The list answers the day the reader is on',
    note: 'Not a day already committed. Arrow across the month and the list recomputes under the cursor, so a fully booked Saturday empties while the reader is still deciding. Ant recomputes disabledTime(date) only for a date already chosen, and cannot say this.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-day-window',
      label: 'A Saturday that closes early',
      language: 'angular',
      source: `<div slDateTimePicker [isTimeUnavailable]="closesEarlyOnSaturday"></div>`,
    }),
  },
  {
    id: 'unavailable',
    title: 'A refused row stays, unless the consumer hides it',
    note: 'A list that silently drops rows is a list whose step the reader cannot infer, so disabling is the default and hiding is the consumer’s choice. A day that offers nothing at all gets a sentence rather than an empty box.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-unavailable',
      label: 'Disable, and hide',
      language: 'angular',
      source: `<div slDateTimePicker unavailableOptions="disable" [isTimeUnavailable]="isLunch"></div>
<div slDateTimePicker unavailableOptions="hide" [isTimeUnavailable]="isLunch"></div>`,
    }),
  },
  {
    id: 'now',
    title: 'One press for the current datetime',
    note: 'Now writes both halves, and it is the zero case of the field’s own relative expression — drawn as a labelled control so a reader who never discovers that + opens one still has the press. It carries the clock, which is the second of the family’s two marks.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-now',
      label: 'The head control',
      language: 'angular',
      source: `<div slDateTimePicker nowLabel="Agora" locale="pt-BR"></div>`,
    }),
  },
  {
    id: 'relative',
    title: 'The expression, with the panel open',
    note: 'Alt+ArrowDown opens the panel and leaves focus in the field, so every key the segments had still works — section 6 of the feature guide asks for exactly that, the panel complementing the typing rather than blocking it. Escape is staged: it abandons the expression first and the panel stays.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-relative',
      label: 'Typing while the panel shows',
      language: 'angular',
      source: `<div slDateTimePicker locale="pt-BR" [defaultOpen]="true" [referenceDateTime]="reference"></div>`,
    }),
  },
  {
    id: 'presets',
    title: 'The consumer’s own shortcuts',
    note: 'They sit in the head beside now, and they wrap inside the panel’s own width rather than stretching it — the band renders at the panel’s width and contributes nothing to it, so a long shortcut cannot widen the month.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-presets',
      label: 'Two shortcuts',
      language: 'angular',
      source: `<div slDateTimePicker locale="pt-BR">
  <div slDateTimePickerPresets>
    <button slButton size="sm" variant="ghost" type="button" (click)="tomorrowAtNine()">
      Amanhã 09:00
    </button>
    <button slButton size="sm" variant="ghost" type="button" (click)="mondayAtTwo()">
      Segunda 14:00
    </button>
  </div>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'Size',
    note: 'The three steps the control can be. A picker inside a field takes the field’s step, and the panel’s rows follow the control scale so a dense panel shrinks its rows and its cap together.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-sizes',
      label: 'The three steps',
      language: 'angular',
      source: `<div slDateTimePicker size="sm"></div>
<div slDateTimePicker size="md"></div>
<div slDateTimePicker size="lg"></div>`,
    }),
  },
  {
    id: 'variants',
    title: 'Variant',
    note: 'The frame is the field’s, so a form holding a name and a datetime shows one frame twice. plain shows nothing until it is used, which is what a dense table of appointments needs.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-variants',
      label: 'The three frames',
      language: 'angular',
      source: `<div slDateTimePicker variant="outline"></div>
<div slDateTimePicker variant="subtle"></div>
<div slDateTimePicker variant="plain"></div>`,
    }),
  },
  {
    id: 'placement',
    title: 'Placement',
    note: 'Where the panel hangs from the control. The layer arrives along the axis it opens on and never along the inline one, and the positioner flips it when there is no room — data-placement says what it resolved.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-placement',
      label: 'Above the control',
      language: 'angular',
      source: `<div slDateTimePicker placement="top-start" locale="pt-BR"></div>`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Read-only stays focusable and copyable and never looks disabled; disabled answers no key and no pointer and its trigger is a disabled button; invalid keeps its focus ring and retargets its colour. In the list, the chosen row outranks the highlight, the highlight outranks the pointer, and each weaker rule is guarded by specificity rather than by source order.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-states',
      label: 'The four states',
      language: 'angular',
      source: `<div slDateTimePicker readOnly></div>
<div slDateTimePicker disabled></div>
<div slDateTimePicker required></div>
<div slDateTimePicker invalid></div>`,
    }),
  },
  {
    id: 'forms',
    title: 'In a form',
    note: 'The control belongs in a reactive form through the field it composes, and the value also reaches a plain form post as YYYY-MM-DDTHH:mm:ss through that field’s hidden input. The field around it supplies the label, the description and the error, and the control takes its size, its disabled state and its validity from that field unless it states its own.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-forms',
      label: 'A real form row',
      language: 'angular',
      source: `<form [formGroup]="form">
  <div slField>
    <label slFieldLabel>Início da consulta</label>
    <div slDateTimePicker formControlName="inicio" locale="pt-BR"></div>
    <span slFieldDescription>Horário de atendimento: das 9h às 18h.</span>
  </div>
</form>`,
    }),
  },
  {
    id: 'narrow',
    title: 'Narrow',
    note: 'The two panels wrap in the value’s own order, with nothing hidden and no switch drawn. The time column takes the whole line it lands on, so the times read as a section rather than as a strip under a wide month — one flex rule answers both arrangements.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-narrow',
      label: 'A narrow panel',
      language: 'angular',
      source: `<div slDateTimePicker locale="pt-BR" [defaultOpen]="true"></div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition and escape hatches',
    note: 'provideDateTimePickerDefaults sets the locale, the clock, the step and every label once; a slDateTimePickerOption template draws one row the consumer’s own way; slDateTimePickerFooter takes their actions; and exportAs reaches focus(), openSurface() and closeSurface(). A control that states any default itself still wins.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-composition',
      label: 'A row of its own',
      language: 'angular',
      source: `<div slDateTimePicker locale="pt-BR">
  <ng-template slDateTimePickerOption let-time let-label="label">
    <span>{{ label }}</span>
    <span>{{ seatsLeft(time) }} vagas</span>
  </ng-template>
</div>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Alt+ArrowDown opens the panel from a segment and leaves focus in the field. From the trigger, ArrowDown opens it and moves focus into the surface openTo names. Inside the list: the arrows, Home, End, type-ahead, and PageUp/PageDown across an hour boundary. Tab is contained inside the layer, and only one element of the grid is in the sequence — so the two surfaces are two stops rather than forty-three.',
    snippet: defineSnippet({
      id: 'datetime-picker-angular-keyboard',
      label: 'A listener that runs before the family',
      language: 'angular',
      source: `<div slDateTimePicker locale="pt-BR" (keydown)="note($event)"></div>`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'PlainDateTime | null',
    '—',
    'SlDateTimePicker',
    'Present means the consumer owns the value. The control asks and waits rather than moving it.',
  ],
  [
    'defaultValue',
    'PlainDateTime | null',
    '—',
    'SlDateTimePicker',
    'The value the control starts from when nobody else writes one. Read once, in ngOnInit.',
  ],
  [
    'open',
    'boolean',
    '—',
    'SlDateTimePicker',
    'Present means the consumer owns whether the panel is showing.',
  ],
  [
    'defaultOpen',
    'boolean',
    'false',
    'SlDateTimePicker',
    'Whether the panel is showing before anyone presses anything.',
  ],
  [
    'highlighted',
    'DateTimePickerHighlight',
    '—',
    'SlDateTimePicker',
    'Where the reader is in the panel: one highlight for both surfaces, as { date, time }.',
  ],
  [
    'defaultHighlighted',
    'DateTimePickerHighlight',
    '—',
    'SlDateTimePicker',
    'Where the reader starts. Unset, the panel opens on the value’s day and the nearest step to the reference.',
  ],
  [
    'min',
    'PlainDateTime',
    '—',
    'SlDateTimePicker',
    'The earliest whole value: where the range starts.',
  ],
  [
    'max',
    'PlainDateTime',
    '—',
    'SlDateTimePicker',
    'The latest whole value: where the range ends.',
  ],
  [
    'minTime',
    'PlainTime',
    '—',
    'SlDateTimePicker',
    'The earliest time of every day inside the range, beside min rather than instead of it.',
  ],
  [
    'maxTime',
    'PlainTime',
    '—',
    'SlDateTimePicker',
    'The latest time of every day inside the range, beside max.',
  ],
  [
    'isDateUnavailable',
    '(date: PlainDate) => boolean',
    '—',
    'SlDateTimePicker',
    'Refuses a whole day. It reaches the calendar, which needs one answer per cell.',
  ],
  [
    'isTimeUnavailable',
    '(time: PlainTime, date: PlainDate) => boolean',
    '—',
    'SlDateTimePicker',
    'Refuses one time on one day. It takes the date so a Saturday can close earlier.',
  ],
  [
    'step',
    'number',
    '900',
    'SlDateTimePicker',
    'Seconds between two offered times. The base is min’s own time, or midnight.',
  ],
  [
    'options',
    'readonly PlainTime[]',
    '—',
    'SlDateTimePicker',
    'The times the panel offers, stated rather than stepped, in the consumer’s own order. A clinic open at 09:00, 09:20 and 13:45 cannot be written as a step.',
  ],
  [
    'maxOptions',
    'number',
    '1440',
    'SlDateTimePicker',
    'How many rows the list may reach — a whole day at a one-minute step. Beyond it the list is cut and says so.',
  ],
  [
    'unavailableOptions',
    "'disable' | 'hide'",
    'disable',
    'SlDateTimePicker',
    'What a refused row does. Disabling is the default because a list that drops rows hides its own step.',
  ],
  [
    'locale',
    'string',
    'runtime',
    'SlDateTimePicker',
    'BCP 47. Reaches the field, the calendar and the list.',
  ],
  [
    'timeZone',
    'string',
    'runtime',
    'SlDateTimePicker',
    'Which zone answers "what is the datetime now", and nothing else.',
  ],
  [
    'hourCycle',
    '12 | 24',
    'locale',
    'SlDateTimePicker',
    'The question a consumer asks about the clock.',
  ],
  [
    'granularity',
    "'hour' | 'minute' | 'second'",
    'minute',
    'SlDateTimePicker',
    'How much of the time half is written.',
  ],
  [
    'calendar',
    "'gregory'",
    'gregory',
    'SlDateTimePicker',
    'One value today. The axis exists so a second calendar can arrive.',
  ],
  [
    'firstDayOfWeek',
    'number',
    'locale',
    'SlDateTimePicker',
    '0 is Sunday. It reaches the calendar.',
  ],
  ['months', 'number', '1', 'SlDateTimePicker', 'How many months the calendar draws side by side.'],
  [
    'weekNumbers',
    'boolean',
    'false',
    'SlDateTimePicker',
    'Whether the calendar draws a column of week numbers.',
  ],
  [
    'referenceDateTime',
    'PlainDateTime',
    'now',
    'SlDateTimePicker',
    'The datetime an empty field steps from, and the time a day pressed in the calendar takes. One input for both, because they are the same question.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'SlDateTimePicker',
    'The type step, matching the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'SlDateTimePicker',
    'How much frame the control shows.',
  ],
  [
    'placement',
    "'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end'",
    'bottom-start',
    'SlDateTimePicker',
    'Where the panel hangs from the control. The positioner flips it when there is no room.',
  ],
  [
    'openTo',
    "'date' | 'time'",
    'date',
    'SlDateTimePicker',
    'Which surface focus lands on when the panel opens. It decides focus, not what is drawn.',
  ],
  [
    'closeOnSelect',
    "'auto' | 'always' | 'never'",
    'auto',
    'SlDateTimePicker',
    'auto closes on the press that completed the value and stays open otherwise; always closes on any press that changes it; never closes on none.',
  ],
  [
    'disabled',
    'boolean',
    '—',
    'SlDateTimePicker',
    'Unstated rather than false, so an unset value defers to the surrounding field.',
  ],
  [
    'readOnly',
    'boolean',
    '—',
    'SlDateTimePicker',
    'Focusable, readable and copyable, and never mistakable for disabled.',
  ],
  [
    'invalid',
    'boolean',
    '—',
    'SlDateTimePicker',
    'Beside the validity the field owns: a value either pair of bounds or either predicate refuses is invalid whatever this says.',
  ],
  ['required', 'boolean', '—', 'SlDateTimePicker', 'Reaches the field’s group as aria-required.'],
  [
    'clearable',
    'boolean',
    'false',
    'SlDateTimePicker',
    'Draws the field’s clear button, which empties both halves.',
  ],
  [
    'relative',
    'boolean',
    'true',
    'SlDateTimePicker',
    'Whether +, - and = open the duration expression in the field.',
  ],
  [
    'name',
    'string',
    '—',
    'SlDateTimePicker',
    'The name a plain form post carries the ISO string under.',
  ],
  [
    'chooseLabel',
    'string',
    'Choose date and time',
    'SlDateTimePicker',
    'The trigger’s name while nothing is chosen.',
  ],
  [
    'changeLabel',
    'string',
    'Change date and time',
    'SlDateTimePicker',
    'The trigger’s name once something is, with the value in words after it.',
  ],
  ['nowLabel', 'string', 'Now', 'SlDateTimePicker', 'The head control’s label.'],
  [
    'emptyLabel',
    'string',
    'No time is available on this day.',
    'SlDateTimePicker',
    'What the panel says when the day the reader is on offers no time at all.',
  ],
  [
    'truncatedLabel',
    'string',
    'The list is cut short…',
    'SlDateTimePicker',
    'What the panel’s accessible description says when the list has been cut at maxOptions — and it says where the rest of the times are, which is the field.',
  ],
  [
    'slDateTimePickerPresets',
    'directive',
    '—',
    'SlDateTimePickerPresets',
    'The consumer’s own shortcuts, in the head beside now, on their own element.',
  ],
  [
    'slDateTimePickerFooter',
    'directive',
    '—',
    'SlDateTimePickerFooter',
    'The consumer’s own actions, under both surfaces, on their own element.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'valueChange',
    payload: 'ChangeRequest<PlainDateTime | null> with the field’s own segments',
    when: 'Before the value moves, and cancellable. It arrives from a press in either surface, from now, and from the field under the trigger — carrying the segments and the missing half when the field is what moved it. A value that has not moved emits nothing.',
  },
  {
    name: 'openChange',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the panel opens or closes, with the reason: pointer for the trigger, keyboard for Alt+ArrowDown, escape and outsidePress for a dismissal, and select for the press that completed the value.',
  },
  {
    name: 'highlightedChange',
    payload: 'ChangeRequest<DateTimePickerHighlight>',
    when: 'When the reader moves through either surface — the day the calendar has focused or the time the list has highlighted, as one value. Moving the highlight never moves the value: the listbox pattern lists selection-following-focus as optional and warns it can degrade accessibility, and here it would fire one request per option.',
  },
];

const composition: ApiRow[] = apiRows([
  [
    'provideDateTimePickerDefaults',
    'provider',
    '—',
    'application',
    'Sets locale, timeZone, hourCycle, granularity, step, maxOptions, placement, openTo, closeOnSelect, unavailableOptions, size, variant and every label once for everything under it. A control that states any of them itself still wins.',
  ],
  [
    'slDateTimePickerOption',
    'ng-template',
    '—',
    'SlDateTimePickerOption',
    'Draws one row, through NgTemplateOutlet — the case a per-item template is for. The context carries the time as $implicit, plus date, label, selected, current and unavailable. The row itself stays the family’s: its role, its states, its keyboard and its target size.',
  ],
  [
    'exportAs',
    'slDateTimePicker',
    '—',
    'SlDateTimePicker',
    'A template reaches the instance for focus(), openSurface() and closeSurface(), and reads the derived value and highlight signals.',
  ],
  [
    'ControlValueAccessor',
    'interface',
    '—',
    'SlDateTimeField',
    'Reached through the field this family composes: the picker writes the same control a bare datetime field would, so formControlName works on the picker without a second accessor.',
  ],
  [
    '(keydown)',
    'EventListener',
    '—',
    'SlDateTimePicker',
    'The family handles the keys on the host, so a consumer’s own listener on the same element runs first — which is the composition React gets by calling the consumer’s handler before acting.',
  ],
]);

const accessibility: string[] = [
  'The panel is one role="dialog" holding a role="grid" and a role="listbox", which is the arrangement the APG’s own Date Picker Combobox example uses for its popup — and the trigger says aria-haspopup="dialog" to match. Both surfaces are in the DOM at every width, because a tablist whose membership depends on the viewport tells assistive technology one story on a wide screen and another on a narrow one.',
  'Only one element of the calendar grid is in the Tab sequence, which the Grid Pattern requires and SlCalendar already implements, and the listbox is one stop for the same reason — so the two surfaces are two Tab stops rather than forty-three, and Tab is contained inside the layer while the panel is open.',
  'The trigger’s accessible name carries the chosen datetime, because focus returns to it when the panel closes: that is where the reader is told what was chosen, and the APG names it as an accessibility feature of its own example. The listbox carries its own name as well — the day its times belong to — because a dialog holding two widgets gives neither of them a name by position.',
  'Moving the highlight never moves the value. The listbox pattern lists selection-following-focus as optional and warns it can severely degrade accessibility; here a reader arrowing through ninety-six quarter-hours would emit ninety-six requests, each one a value a consumer may be writing to a server.',
  'Escape is staged in three steps rather than two: the field abandons an open expression first, then the calendar’s view walks down from year or month, and only then does the panel close and return focus to the trigger. The dismissable layer asks in the capture phase, so the decision is taken where the family can still refuse it.',
];

export const ANGULAR_DATE_TIME_PICKER_DOCS = {
  dateTimePicker: {
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
