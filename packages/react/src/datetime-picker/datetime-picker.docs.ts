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

export const REACT_DATE_TIME_PICKER_TOKENS = dateTimePickerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned DateTime Picker decision',
}));

const imports: ReferenceImport = {
  source: "import { DateTimePicker, DateTimePickerDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
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
      'Writes the current datetime, both halves at once. It carries the clock — the second of the family’s two marks, and the only other place one earns its keep — and it is the zero case of the field’s own relative expression, for a reader who never discovers that + opens one.',
  },
  {
    part: 'presets',
    element: 'div',
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
      'Holds calendar, unredrawn: its grid, its three views, its roving focus and its own keyboard. The column never shrinks below the month, so it is the time panel that wraps when the room runs out.',
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
      'role="option", one whole time. It carries the time and nothing else: the day is the calendar’s to say, and repeating it ninety-six times would spend the whole column on one word.',
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
    element: 'div',
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
      id: 'datetime-picker-react-playground',
      label: 'Usage',
      language: 'tsx',
      source: `<Field>
  <FieldLabel>Início da consulta</FieldLabel>
  <DateTimePicker clearable locale="pt-BR" name="inicio" />
  <FieldDescription>A consulta começa nesta data e hora.</FieldDescription>
</Field>;`,
    }),
  },
  {
    id: 'panel',
    title: 'Two surfaces, one dialog',
    note: 'The only panel in the library that holds two widgets: a grid that calendar draws and a listbox that this family draws. Both are in the DOM at every width — a tablist that exists on a narrow container and not on a wide one tells assistive technology two different stories about the same component, which is the arrangement Kendo and MUI ship and this family declines.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-panel',
      label: 'The panel',
      language: 'tsx',
      source: `<DateTimePicker defaultOpen locale="pt-BR" />;`,
    }),
  },
  {
    id: 'open-to',
    title: 'Which surface focus opens on',
    note: 'openTo decides where focus lands, not what is drawn. Both surfaces are present either way, and the reading order is the value’s own — moving a whole calendar because focus starts elsewhere would make one setting look like a different component.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-open-to',
      label: 'Opening on the time',
      language: 'tsx',
      source: `<DateTimePicker locale="pt-BR" openTo="time" />;`,
    }),
  },
  {
    id: 'completeness',
    title: 'Completeness closes the panel, not a button',
    note: 'The press that leaves the value incomplete carries focus to the half that is missing; the press that completes it closes the panel; and a press on a value that was already whole changes one half and leaves the panel where it is — so a reader who opened a filled field to change both is not shut out by their first press. Ant adds needConfirm for this and Kendo adds Set.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-completeness',
      label: 'The three closings',
      language: 'tsx',
      source: `<>
  <DateTimePicker closeOnSelect="auto" locale="pt-BR" />
  <DateTimePicker closeOnSelect="always" locale="pt-BR" />
  <DateTimePicker closeOnSelect="never" locale="pt-BR" />
</>;`,
    }),
  },
  {
    id: 'seconds',
    title: 'Seconds',
    note: 'The field writes every second and the panel offers a half-minute step, which is eleven rows inside a bounded window rather than the 86 400 a whole day would be. The guard is on the length of the list — maxOptions — and not on the size of the step.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-seconds',
      label: 'A half-minute step',
      language: 'tsx',
      source: `<DateTimePicker granularity="second" locale="pt-BR" step={30} />;`,
    }),
  },
  {
    id: 'step',
    title: 'The step, and what it counts from',
    note: 'The base is min’s own time when min is stated and midnight when it is not — the platform’s rule for input[type=time], which no surveyed panel states at all. A step of 900 with a min of 09:07 offers 09:07, 09:22, 09:37, and the field still accepts 09:15 by typing.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-step',
      label: 'A quarter hour from 09:07',
      language: 'tsx',
      source: `<DateTimePicker
  locale="pt-BR"
  min={{ date: { year: 2026, month: 9, day: 10 }, time: { hour: 9, minute: 7, second: 0 } }}
  step={900}
/>;`,
    }),
  },
  {
    id: 'range-bounds',
    title: 'Two pairs of bounds, at the same time',
    note: 'min and max fence the whole value; minTime and maxTime fence every day inside the range. On min’s own day the list starts at min’s time, on max’s own day it stops at max’s, and on every day between it runs the repeating window — the rule MDN states for the platform and no surveyed script implements. MUI’s own validation page records that it cannot combine the two.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-range-bounds',
      label: 'A booking window',
      language: 'tsx',
      source: `<DateTimePicker
  max={{ date: { year: 2026, month: 12, day: 20 }, time: { hour: 12, minute: 0, second: 0 } }}
  maxTime={{ hour: 18, minute: 0, second: 0 }}
  min={{ date: { year: 2026, month: 9, day: 11 }, time: { hour: 14, minute: 0, second: 0 } }}
  minTime={{ hour: 9, minute: 0, second: 0 }}
/>;`,
    }),
  },
  {
    id: 'day-window',
    title: 'The list answers the day the reader is on',
    note: 'Not a day already committed. Arrow across the month and the list recomputes under the cursor, so a fully booked Saturday empties while the reader is still deciding. Ant recomputes disabledTime(date) only for a date already chosen, and cannot say this.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-day-window',
      label: 'A Saturday that closes early',
      language: 'tsx',
      source: `<DateTimePicker
  isTimeUnavailable={(time, date) => isSaturday(date) && time.hour >= 13}
  locale="pt-BR"
/>;`,
    }),
  },
  {
    id: 'unavailable',
    title: 'A refused row stays, unless the consumer hides it',
    note: 'A list that silently drops rows is a list whose step the reader cannot infer, so disabling is the default and hiding is the consumer’s choice. A day that offers nothing at all gets a sentence rather than an empty box.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-unavailable',
      label: 'Disable, and hide',
      language: 'tsx',
      source: `<>
  <DateTimePicker isTimeUnavailable={(time) => time.hour === 12} unavailableOptions="disable" />
  <DateTimePicker isTimeUnavailable={(time) => time.hour === 12} unavailableOptions="hide" />
</>;`,
    }),
  },
  {
    id: 'now',
    title: 'One press for the current datetime',
    note: 'Now writes both halves, and it is the zero case of the field’s own relative expression — drawn as a labelled control so a reader who never discovers that + opens one still has the press. It carries the clock, which is the second of the family’s two marks.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-now',
      label: 'The head control',
      language: 'tsx',
      source: `<DateTimePicker locale="pt-BR" nowLabel="Agora" />;`,
    }),
  },
  {
    id: 'relative',
    title: 'The expression, with the panel open',
    note: 'Alt+ArrowDown opens the panel and leaves focus in the field, so every key the segments had still works — §6 of the feature guide asks for exactly that, the panel complementing the typing rather than blocking it. Escape is staged: it abandons the expression first and the panel stays.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-relative',
      label: 'Typing while the panel shows',
      language: 'tsx',
      source: `<DateTimePicker
  defaultOpen
  locale="pt-BR"
  referenceDateTime={{
    date: { year: 2026, month: 9, day: 10 },
    time: { hour: 14, minute: 40, second: 0 },
  }}
/>;`,
    }),
  },
  {
    id: 'presets',
    title: 'The consumer’s own shortcuts',
    note: 'They sit in the head beside now, and they wrap inside the panel’s own width rather than stretching it — the band renders at the panel’s width and contributes nothing to it, so a long shortcut cannot widen the month.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-presets',
      label: 'Two shortcuts',
      language: 'tsx',
      source: `<DateTimePicker
  locale="pt-BR"
  presets={
    <>
      <Button onClick={tomorrowAtNine} size="sm" variant="ghost">
        Amanhã 09:00
      </Button>
      <Button onClick={mondayAtTwo} size="sm" variant="ghost">
        Segunda 14:00
      </Button>
    </>
  }
/>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'Size',
    note: 'The three steps the control can be. A picker inside a field takes the field’s step, and the panel’s rows follow the control scale so a dense panel shrinks its rows and its cap together.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-sizes',
      label: 'The three steps',
      language: 'tsx',
      source: `<>
  <DateTimePicker size="sm" />
  <DateTimePicker size="md" />
  <DateTimePicker size="lg" />
</>;`,
    }),
  },
  {
    id: 'variants',
    title: 'Variant',
    note: 'The frame is the field’s, so a form holding a name and a datetime shows one frame twice. plain shows nothing until it is used, which is what a dense table of appointments needs.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-variants',
      label: 'The three frames',
      language: 'tsx',
      source: `<>
  <DateTimePicker variant="outline" />
  <DateTimePicker variant="subtle" />
  <DateTimePicker variant="plain" />
</>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Placement',
    note: 'Where the panel hangs from the control. The layer arrives along the axis it opens on and never along the inline one, and the positioner flips it when there is no room — data-placement says what it resolved.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-placement',
      label: 'Above the control',
      language: 'tsx',
      source: `<DateTimePicker locale="pt-BR" placement="top-start" />;`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Read-only stays focusable and copyable and never looks disabled; disabled answers no key and no pointer and its trigger is a disabled button; invalid keeps its focus ring and retargets its colour. In the list, the chosen row outranks the highlight, the highlight outranks the pointer, and each weaker rule is guarded by specificity rather than by source order.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-states',
      label: 'The four states',
      language: 'tsx',
      source: `<>
  <DateTimePicker readOnly />
  <DateTimePicker disabled />
  <DateTimePicker required />
  <DateTimePicker invalid />
</>;`,
    }),
  },
  {
    id: 'forms',
    title: 'In a form',
    note: 'The value reaches a plain form post as YYYY-MM-DDTHH:mm:ss through the field’s own hidden input. The field around it supplies the label, the description and the error, and the control takes its size, its disabled state and its validity from that field unless it states its own.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-forms',
      label: 'A real form row',
      language: 'tsx',
      source: `<form action="/agendamentos" method="post">
  <Field>
    <FieldLabel>Início da consulta</FieldLabel>
    <DateTimePicker name="inicio" required />
    <FieldDescription>Horário de atendimento: das 9h às 18h.</FieldDescription>
  </Field>
</form>;`,
    }),
  },
  {
    id: 'narrow',
    title: 'Narrow',
    note: 'The two panels wrap in the value’s own order, with nothing hidden and no switch drawn. The time column takes the whole line it lands on, so the times read as a section rather than as a strip under a wide month — one flex rule answers both arrangements.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-narrow',
      label: 'A narrow panel',
      language: 'tsx',
      source: `<DateTimePicker defaultOpen locale="pt-BR" />;`,
    }),
  },
  {
    id: 'composition',
    title: 'Composition and escape hatches',
    note: 'The provider sets the locale, the clock, the step and every label once; renderOption draws one row the consumer’s own way; the footer takes their actions; and the handle reaches focus(), open() and close(). A control that states any default itself still wins.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-composition',
      label: 'Defaults once, and a row of its own',
      language: 'tsx',
      source: `<DateTimePickerDefaultsProvider locale="pt-BR" step={1800}>
  <DateTimePicker
    ref={handle}
    renderOption={({ label, time }) => (
      <>
        <span>{label}</span>
        <span>{seatsLeft(time)} vagas</span>
      </>
    )}
  />
</DateTimePickerDefaultsProvider>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Alt+ArrowDown opens the panel from a segment and leaves focus in the field. From the trigger, ArrowDown opens it and moves focus into the surface openTo names. Inside the list: the arrows, Home, End, type-ahead, and PageUp/PageDown across an hour boundary. Tab is contained inside the layer, and only one element of the grid is in the sequence — so the two surfaces are two stops rather than forty-three.',
    snippet: defineSnippet({
      id: 'datetime-picker-react-keyboard',
      label: 'Composing with the consumer’s own handler',
      language: 'tsx',
      source: `<DateTimePicker
  locale="pt-BR"
  onKeyDown={(event) => {
    if (event.key === 'Escape') noteDismissal();
  }}
/>;`,
    }),
  },
];

const api: ApiRow[] = apiRows([
  [
    'value',
    'PlainDateTime | null',
    '—',
    'DateTimePicker',
    'Present means the consumer owns the value.',
  ],
  [
    'defaultValue',
    'PlainDateTime | null',
    '—',
    'DateTimePicker',
    'The value the control starts from when nobody else writes one.',
  ],
  [
    'open',
    'boolean',
    '—',
    'DateTimePicker',
    'Present means the consumer owns whether the panel is showing.',
  ],
  [
    'defaultOpen',
    'boolean',
    'false',
    'DateTimePicker',
    'Whether the panel is showing before anyone presses anything.',
  ],
  [
    'highlighted',
    'DateTimePickerHighlight',
    '—',
    'DateTimePicker',
    'Where the reader is in the panel: one highlight for both surfaces, as { date, time }.',
  ],
  [
    'defaultHighlighted',
    'DateTimePickerHighlight',
    '—',
    'DateTimePicker',
    'Where the reader starts. Unset, the panel opens on the value’s day and the nearest step to the reference.',
  ],
  [
    'min',
    'PlainDateTime',
    '—',
    'DateTimePicker',
    'The earliest whole value: where the range starts.',
  ],
  ['max', 'PlainDateTime', '—', 'DateTimePicker', 'The latest whole value: where the range ends.'],
  [
    'minTime',
    'PlainTime',
    '—',
    'DateTimePicker',
    'The earliest time of every day inside the range, beside min rather than instead of it.',
  ],
  [
    'maxTime',
    'PlainTime',
    '—',
    'DateTimePicker',
    'The latest time of every day inside the range, beside max.',
  ],
  [
    'isDateUnavailable',
    '(date: PlainDate) => boolean',
    '—',
    'DateTimePicker',
    'Refuses a whole day. It reaches the calendar, which needs one answer per cell.',
  ],
  [
    'isTimeUnavailable',
    '(time: PlainTime, date: PlainDate) => boolean',
    '—',
    'DateTimePicker',
    'Refuses one time on one day. It takes the date so a Saturday can close earlier.',
  ],
  [
    'step',
    'number',
    '900',
    'DateTimePicker',
    'Seconds between two offered times. The base is min’s own time, or midnight.',
  ],
  [
    'options',
    'readonly PlainTime[]',
    '—',
    'DateTimePicker',
    'The times the panel offers, stated rather than stepped, in the consumer’s own order. A clinic open at 09:00, 09:20 and 13:45 cannot be written as a step.',
  ],
  [
    'maxOptions',
    'number',
    '1440',
    'DateTimePicker',
    'How many rows the list may reach — a whole day at a one-minute step. Beyond it the list is cut and says so.',
  ],
  [
    'unavailableOptions',
    "'disable' | 'hide'",
    'disable',
    'DateTimePicker',
    'What a refused row does. Disabling is the default because a list that drops rows hides its own step.',
  ],
  [
    'locale',
    'string',
    'the runtime’s',
    'DateTimePicker',
    'BCP 47. Reaches the field, the calendar and the list.',
  ],
  [
    'timeZone',
    'string',
    'the runtime’s',
    'DateTimePicker',
    'Which zone answers "what is the datetime now", and nothing else.',
  ],
  [
    'hourCycle',
    '12 | 24',
    'the locale’s',
    'DateTimePicker',
    'The question a consumer asks about the clock.',
  ],
  [
    'granularity',
    "'hour' | 'minute' | 'second'",
    'minute',
    'DateTimePicker',
    'How much of the time half is written.',
  ],
  [
    'calendar',
    "'gregory'",
    'gregory',
    'DateTimePicker',
    'One value today. The axis exists so a second calendar can arrive.',
  ],
  [
    'firstDayOfWeek',
    'number',
    'the locale’s',
    'DateTimePicker',
    '0 is Sunday. It reaches the calendar.',
  ],
  ['months', 'number', '1', 'DateTimePicker', 'How many months the calendar draws side by side.'],
  [
    'weekNumbers',
    'boolean',
    'false',
    'DateTimePicker',
    'Whether the calendar draws a column of week numbers.',
  ],
  [
    'referenceDateTime',
    'PlainDateTime',
    'now',
    'DateTimePicker',
    'The datetime an empty field steps from, and the time a day pressed in the calendar takes. One prop for both, because they are the same question.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'DateTimePicker',
    'The type step, matching the field around it.',
  ],
  [
    'variant',
    "'outline' | 'subtle' | 'plain'",
    'outline',
    'DateTimePicker',
    'How much frame the control shows.',
  ],
  [
    'placement',
    "'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end'",
    'bottom-start',
    'DateTimePicker',
    'Where the panel hangs from the control. The positioner flips it when there is no room.',
  ],
  [
    'openTo',
    "'date' | 'time'",
    'date',
    'DateTimePicker',
    'Which surface focus lands on when the panel opens. It decides focus, not what is drawn.',
  ],
  [
    'closeOnSelect',
    "'auto' | 'always' | 'never'",
    'auto',
    'DateTimePicker',
    'auto closes on the press that completed the value and stays open otherwise; always closes on any press that changes it; never closes on none.',
  ],
  [
    'disabled',
    'boolean',
    '—',
    'DateTimePicker',
    'Unstated rather than false, so an unset value defers to the surrounding field.',
  ],
  [
    'readOnly',
    'boolean',
    '—',
    'DateTimePicker',
    'Focusable, readable and copyable, and never mistakable for disabled.',
  ],
  [
    'invalid',
    'boolean',
    '—',
    'DateTimePicker',
    'Beside the validity the family owns: a value either pair of bounds or either predicate refuses is invalid whatever this says.',
  ],
  ['required', 'boolean', '—', 'DateTimePicker', 'Reaches the field’s group as aria-required.'],
  [
    'clearable',
    'boolean',
    'false',
    'DateTimePicker',
    'Draws the field’s clear button, which empties both halves.',
  ],
  [
    'relative',
    'boolean',
    'true',
    'DateTimePicker',
    'Whether +, - and = open the duration expression in the field.',
  ],
  [
    'name',
    'string',
    '—',
    'DateTimePicker',
    'The name a plain form post carries the ISO string under.',
  ],
  [
    'chooseLabel',
    'string',
    "'Choose date and time'",
    'DateTimePicker',
    'The trigger’s name while nothing is chosen.',
  ],
  [
    'changeLabel',
    'string',
    "'Change date and time'",
    'DateTimePicker',
    'The trigger’s name once something is, with the value in words after it.',
  ],
  ['nowLabel', 'string', "'Now'", 'DateTimePicker', 'The head control’s label.'],
  [
    'emptyLabel',
    'string',
    "'No time is available on this day.'",
    'DateTimePicker',
    'What the panel says when the day the reader is on offers no time at all.',
  ],
  [
    'truncatedLabel',
    'string',
    "'The list is cut short…'",
    'DateTimePicker',
    'What the panel’s accessible description says when the list has been cut at maxOptions — and it says where the rest of the times are, which is the field.',
  ],
  [
    'presets',
    'ReactNode',
    '—',
    'DateTimePicker',
    'The consumer’s own shortcuts, in the head beside now.',
  ],
  [
    'footer',
    'ReactNode',
    '—',
    'DateTimePicker',
    'The consumer’s own actions, under both surfaces.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: PlainDateTime | null, request: DateTimeFieldChangeRequest)',
    when: 'Before the value moves, and cancellable. It arrives from a press in either surface, from now, and from the field under the trigger — carrying the segments and the missing half when the field is what moved it. A value that has not moved emits nothing.',
  },
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: ChangeRequest<boolean>)',
    when: 'Before the panel opens or closes, with the reason: pointer for the trigger, keyboard for Alt+ArrowDown, escape and outsidePress for a dismissal, and select for the press that completed the value.',
  },
  {
    name: 'onHighlightedChange',
    payload:
      '(highlighted: DateTimePickerHighlight, request: ChangeRequest<DateTimePickerHighlight>)',
    when: 'When the reader moves through either surface — the day the calendar has focused or the time the list has highlighted, as one value. Moving the highlight never moves the value: the listbox pattern lists selection-following-focus as optional and warns it can degrade accessibility, and here it would fire one request per option.',
  },
];

const composition: ApiRow[] = apiRows([
  [
    'DateTimePickerDefaultsProvider',
    'component',
    '—',
    'application',
    'Sets locale, timeZone, hourCycle, granularity, step, maxOptions, placement, openTo, closeOnSelect, unavailableOptions, size, variant and every label once for everything under it.',
  ],
  [
    'renderOption',
    '(option: DateTimePickerOptionRender) => ReactNode',
    '—',
    'DateTimePicker',
    'Draws one row. The row is the family’s — its role, its states, its keyboard and its target size — and what is written inside it is the consumer’s: the time, the day it belongs to, the label, and whether it is selected, current or refused.',
  ],
  [
    'render',
    '(props: DateTimePickerRootProps) => ReactNode',
    '—',
    'DateTimePicker',
    'Substitutes the element the frame renders, with the ref carried in the props.',
  ],
  [
    'ref',
    'Ref<DateTimePickerHandle>',
    '—',
    'DateTimePicker',
    'focus() puts the reader on the first segment of the field, and open() and close() move the panel without a press.',
  ],
  [
    'onKeyDown',
    'KeyboardEventHandler',
    '—',
    'DateTimePicker',
    'Runs before the family acts, on the control, the trigger and the list. Calling preventDefault stops the family acting at all.',
  ],
]);

const accessibility: string[] = [
  'The panel is one role="dialog" holding a role="grid" and a role="listbox", which is the arrangement the APG’s own Date Picker Combobox example uses for its popup — and the trigger says aria-haspopup="dialog" to match. Both surfaces are in the DOM at every width, because a tablist whose membership depends on the viewport tells assistive technology one story on a wide screen and another on a narrow one.',
  'Only one element of the calendar grid is in the Tab sequence, which the Grid Pattern requires and calendar already implements, and the listbox is one stop for the same reason — so the two surfaces are two Tab stops rather than forty-three, and Tab is contained inside the layer while the panel is open.',
  'The trigger’s accessible name carries the chosen datetime, because focus returns to it when the panel closes: that is where the reader is told what was chosen, and the APG names it as an accessibility feature of its own example. The listbox carries its own name as well — the day its times belong to — because a dialog holding two widgets gives neither of them a name by position.',
  'Moving the highlight never moves the value. The listbox pattern lists selection-following-focus as optional and warns it can severely degrade accessibility; here a reader arrowing through ninety-six quarter-hours would emit ninety-six requests, each one a value a consumer may be writing to a server.',
  'Escape is staged in three steps rather than two: the field abandons an open expression first, then the calendar’s view walks down from year or month, and only then does the panel close and return focus to the trigger. dismissable-layer asks in the capture phase, so the decision is taken where the family can still refuse it.',
];

export const REACT_DATE_TIME_PICKER_DOCS = {
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
