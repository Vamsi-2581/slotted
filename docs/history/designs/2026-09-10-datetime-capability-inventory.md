# Datetime field and datetime picker capability inventory

Produced before either family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. Both are new:
`specs/components/datetime-field/` and `specs/components/datetime-picker/` do
not exist. `docs/process/build-order.md` wave 7 carries the scope paragraph for the
chain `time-field` → `time-picker` → `datetime-field` → `datetime-picker`; this
inventory covers the last two, and §6 records what it adds to that paragraph.

One inventory covers two families for the reason the time inventory gives: the
two surfaces behind the picker exist to write the field's value, and splitting
them would decide that value twice.

Sources were read on 10 September 2026.

---

## 1. Surveyed

Eight implementations, chosen so they disagree about the one question this pair
owes an answer to — where a datetime is written. The platform and one
accessibility library say it is typed and there is no time surface at all; three
design systems say it is two surfaces in one panel; one says the two surfaces
are tabs; one ships no such family and tells a consumer to compose two.

| Implementation        | Calls it                                        | Read at                                                                                                    |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| HTML Standard / MDN   | `input[type=datetime-local]`                    | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local>                 |
| WAI-ARIA APG          | Spinbutton, Listbox and Dialog (Modal) Patterns | <https://www.w3.org/WAI/ARIA/apg/patterns/>                                                                |
| React Aria Components | `DatePicker` with `granularity`                 | <https://react-spectrum.adobe.com/react-aria/DatePicker.html>                                              |
| MUI X                 | `DateTimePicker`                                | <https://mui.com/x/react-date-pickers/date-time-picker/> and <https://mui.com/x/react-date-pickers/validation/> |
| Ant Design 6.6.3      | `DatePicker` with `showTime`                    | <https://ant.design/components/date-picker>                                                                |
| Kendo UI for Angular  | `DateTimePicker`                                | <https://www.telerik.com/kendo-angular-ui/components/dateinputs/datetimepicker/> and its API reference      |
| Angular Material      | no such family                                  | `src/material/timepicker/timepicker.md` in `angular/components`, `main` branch                             |
| PrimeNG               | `DatePicker` with `showTime`                    | <https://primeng.org/datepicker>                                                                           |

The four answers to where a datetime is written, because the same capability
hides under each:

- **Typed, and one surface.** React Aria's `DatePicker` at
  `granularity="minute"` draws hour and minute segments in the same
  `DateInput`, and its documented anatomy puts nothing but `<Calendar />` in the
  popover. The time has no surface.
- **Two surfaces, side by side.** MUI X draws the calendar and a digital clock
  beside each other on a pointer device; Ant draws the calendar with time
  columns to its right; PrimeNG draws spinners under the calendar.
- **Two surfaces, one at a time.** Kendo's popup has a Date tab and a Time tab,
  chosen by `defaultTab`, with Cancel and Set below them.
- **No family.** Angular Material ships a datepicker and a timepicker and its
  own documentation states the composition: bind both to one value, and "the
  datepicker will set the entire date object while the timepicker will only
  modify the time portion of it".

---

## 2. Table stakes

Every capability two or more surveyed implementations ship. `DTF` marks
`datetime-field`, `DTP` marks `datetime-picker`.

| #   | Capability                                         | Who ships it                                                                 | Verdict                                   | Reason                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | One value holding both halves                      | MDN, React Aria, MUI, Ant, Kendo, PrimeNG                                    | adopt · DTF DTP                           | `PlainDateTime`, a `PlainDate` beside a `PlainTime`, which is the shape `docs/history/designs/2026-09-09-date-design.md` §11 already named. Every function the two halves already have applies to each half unchanged.                                                                       |
| 2   | A segmented field where both halves are typed      | MDN, React Aria, Kendo (`DateInput`)                                         | adopt · DTF                               | `packages/core/src/date/segments.ts` was widened to seven fields in the previous session for exactly this. One `SegmentState` holds a half-typed date, a half-typed time, or both.                                                                                                            |
| 3   | The locale's own order for the whole value         | MDN (the browser's own), React Aria, Kendo (`format`)                        | adopt · DTF                               | `Intl.DateTimeFormat` with both halves stated; `formatToParts` names the order, the separators, and the literal between the date and the time. No table of orders is shipped, which is the rule `format.ts` and `time-format.ts` already follow.                                              |
| 4   | 12- or 24-hour cycle                               | React Aria (`hourCycle`), MUI (`ampm`), Ant, PrimeNG (`hourFormat`), Kendo   | adopt · DTF DTP                           | The four cycles `Intl` resolves, behind the public `12 \| 24` axis, unchanged from `time-field`.                                                                                                                                                                                              |
| 5   | Granularity — which time units exist               | React Aria (`granularity`), MUI (`views`), Ant (`showTime.format`), PrimeNG  | adopt · DTF DTP                           | `granularity: 'hour' \| 'minute' \| 'second'`, governing the time half. The date half is always whole: a datetime without a day is a date, and `date-field` is that family.                                                                                                                    |
| 6   | Bounds on the whole value                          | MDN (`min`/`max`), MUI (`minDateTime`/`maxDateTime`), Kendo, PrimeNG         | adopt · DTF DTP                           | `min` and `max`, as `PlainDateTime`.                                                                                                                                                                                                                                                          |
| 7   | A time window that repeats on every day            | MUI (`minTime`/`maxTime`), Ant (`disabledTime`)                              | adapt · DTF DTP                           | `minTime` and `maxTime`, as `PlainTime` — **and they combine with `min` and `max`**, which MUI documents that it cannot: "you cannot use `maxDateTime` and `maxTime` together. `maxDateTime` will override the `maxTime` behavior". The two are different questions and both are answered. D3. |
| 8   | Arbitrary refused days and times                   | MUI (`shouldDisableDate`, `shouldDisableTime`), Ant (`disabledDate`, `disabledTime`), Kendo (`disabledDates`), PrimeNG | adopt · DTF DTP  | `isDateUnavailable(date)` answers a whole day, which is what the calendar needs and what a datetime predicate cannot supply without probing every step of that day. `isTimeUnavailable(time, date)` answers one time on one day, which is Ant's `disabledTime(date)` shape written as a predicate. |
| 9   | A step between the offered times                   | MDN (`step`, in seconds), MUI (`timeSteps`), Kendo (`steps`), Ant, PrimeNG   | adopt · DTP                               | One `step`, in seconds, with the base rule `time-picker` already states: `min` when it is stated, midnight when it is not.                                                                                                                                                                     |
| 10  | A panel holding both surfaces                      | MUI, Ant, Kendo, PrimeNG                                                     | adopt · DTP                               | One layer, one `role="dialog"`, a `grid` and a `listbox` inside it. The two roles already belong to `calendar` and to `time-picker`'s panel, and neither is redrawn.                                                                                                                          |
| 11  | Which surface the panel opens on                   | MUI (`openTo`), Kendo (`defaultTab`)                                         | adapt · DTP                               | `openTo: 'date' \| 'time'`, defaulting to `date`. Both surfaces are present; `openTo` decides where focus lands, not what is drawn. §3 D5.                                                                                                                                                     |
| 12  | Confirming before the value commits                | Ant (`needConfirm`, automatic under `showTime`), Kendo (Cancel and Set), MUI (`actionBar`), Angular Material (its own accessibility guidance) | adapt · DTP | Answered by the value's own completeness rather than by a button: the panel closes on the press that **completes** the value, and stays open otherwise. The `footer` slot still takes a consumer's own button. §3 D6.                                                                       |
| 13  | Clearing the value                                 | Ant (`allowClear`), Kendo (`clearButton`), MUI (`clearable`), PrimeNG        | adopt · DTF DTP                           | `clearable`, in the same slot with the same label resolution the chain already uses. Clearing empties both halves: half a value is not a value this family holds.                                                                                                                              |
| 14  | `disabled`, `readOnly`, `required`, `invalid`      | all eight                                                                    | adopt · DTF DTP                           | Unstated rather than `false`, so an unset value defers to the surrounding `field`.                                                                                                                                                                                                             |
| 15  | Form integration                                   | MDN (native), Kendo (`ControlValueAccessor` and validators), MUI, Ant, PrimeNG | adopt · DTF DTP                         | React posts through a hidden input carrying `YYYY-MM-DDTHH:mm:ss`, which is `input[type=datetime-local]`'s own value format. Angular implements `ControlValueAccessor` and `Validator`, reporting `dateTimeParse`, `dateTimeIncomplete`, `dateTimeMin`, `dateTimeMax` and `dateTimeUnavailable`. |
| 16  | A control that writes the current datetime         | Ant (`showNow`), MUI (`actionBar` `now`)                                     | adopt · DTP                               | `now` at the head of the panel, writing both halves. It is the zero case of the relative expression, drawn as one labelled control for a reader who never discovers `=`.                                                                                                                       |
| 17  | The time a bare day takes, and the datetime an empty field steps from | Ant (`showTime.defaultOpenValue`), MUI (`referenceDate`), React Aria (`placeholderValue`) | adopt · DTF DTP | `referenceDateTime`. One prop answers both questions, because they are the same question: which datetime the family assumes where the reader has stated nothing.                                                                                                                              |
| 18  | Opening the panel from the keyboard                | MUI, Kendo, Angular Material                                                 | adopt · DTP                               | `Alt`+`ArrowDown`, with the ChromeOS note `date-picker` and `time-picker` both record: the chord is a shortcut and the trigger button is always drawn.                                                                                                                                          |
| 19  | A different presentation on a small screen         | Kendo (`adaptiveMode`, an action sheet), MUI (a mobile picker)               | adopt · DTP                               | The sheet presentation both sibling pickers already ship, below 480 px on a coarse pointer, decided in the stylesheet.                                                                                                                                                                          |
| 20  | Seconds                                            | MUI (`views`), Ant, PrimeNG (`showSeconds`), MDN (`step`)                    | adopt · DTF DTP                           | `granularity="second"`. Milliseconds are declined: Ant is the only surveyed implementation with `disabledMilliseconds`, and `PlainTime` has no field for them.                                                                                                                                 |
| 21  | A pair of datetimes, start and end                 | MUI (`DateTimeRangePicker`, Pro), Ant (`RangePicker` under `showTime`)       | defer to `datetime-range-picker`, wave 8  | The weighing `docs/process/build-order.md` already applied to `date-range-picker` and to `time-range-picker`: a pair is a specialised composition of a value the Core now has, not a value the Core cannot say. The line is added to wave 8 beside the other two, in the same commit.                   |
| 22  | The value carrying a time zone                     | React Aria (`ZonedDateTime`, `hideTimeZone`), MUI (`timezone`)               | decline                                   | The briefing's own decision, taken in wave 7 and binding here by name: what this library holds is the wall-clock value the reader wrote. An application that knows the zone converts against it, and writes its label into the field's `end` slot.                                              |
| 23  | Several values at once                             | Ant, which refuses it under `showTime`                                       | decline                                   | One implementation, and it declines the combination itself. A set of days is `calendar`'s `selectionMode="multiple"`; a set of datetimes is not a value this chain holds, and nothing in the survey ships one.                                                                                  |
| 24  | Views for month and year inside the panel          | MUI (`views`), Kendo (`calendarType`), PrimeNG (`view`)                      | adopt · DTP                               | `calendar` already ships the three views and the roving focus between them, and `date-picker` already stages `Escape` down through them. Both behaviours are inherited by composing the family rather than by redrawing it.                                                                     |

---

## 3. Differentiators

| ID  | Differentiator                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **One `SegmentState` holds both halves, so a half-written datetime exists.** A reader who has typed a day and no hour is in a state every surveyed implementation stores as `null` and cannot describe. Here the request carries the segments, the field carries `data-incomplete="date"` or `data-incomplete="time"`, and the Angular validator reports `dateTimeIncomplete` rather than an empty control. This is what the previous session widened `segments.ts` for, and this family is the first to spend it. |
| D2  | **The relative expression gains a day.** `time-field` resolves `+90m` at `23:00` to `00:30` and can only raise a flag, because a `PlainTime` has no day beside it: the request carries `crossesMidnight` and names `datetime-field` as its first consumer. Here the day exists, so the expression rolls into it and says so. The grammar widens by two letters — `d` for days and `w` for weeks — so `+2d`, `+1w` and `+90m` are one entry mode over a whole datetime. No surveyed implementation parses a duration at all. |
| D3  | **A whole-value bound and a per-day window, at the same time.** MUI documents the limitation in its own validation page. A booking flow states both — no earlier than tomorrow at 09:00, and never outside 09:00 to 18:00 on any day — and here both are honoured, because they are two questions and the family asks both. §4 G1 is what falls out of it.                                                                                                                                                        |
| D4  | **The list of times answers the day the reader is on.** Ant recomputes `disabledTime(date)` only for a date already committed. Here the list is computed against the date half the value holds, or the day the calendar has focused when it holds none, so arrowing across a fully booked Saturday empties the list and draws the empty state while the reader is still deciding.                                                                                                                              |
| D5  | **Both surfaces exist for every reader, in every arrangement.** Kendo's tabs and MUI's mobile tabs hide one surface behind the other; a tablist whose membership depends on the viewport tells assistive technology one thing on a wide screen and another on a narrow one. Here the DOM does not change with the width: the two surfaces sit side by side where there is room and stack where there is not, and `openTo` decides where focus lands rather than what exists.                                     |
| D6  | **Completeness closes the panel, not a button.** Ant adds a confirm button under `showTime` because a day pressed in a calendar is not a whole datetime; Kendo adds Set for the same reason. The rule here needs no control: the panel closes on the press that made the value whole, and stays open when the value was already whole — so a reader who opened a filled field to change both halves is not shut out by the first press.                                                                          |
| D7  | **Three colour schemes, three densities, logical properties, and two first-class bindings.** No surveyed implementation ships a high-contrast scheme, and none ships one conceptual contract in React and in Angular without one of the two being a wrapper.                                                                                                                                                                                                                                                    |
| D8  | **`PlainDateTime`, never an instant.** The type every surveyed implementation that holds one gets wrong at a daylight boundary. Decided in wave 7, recorded in `docs/build-briefing.md`, and binding here by name.                                                                                                                                                                                                                                                                                             |

---

## 4. Gaps

| ID  | Gap                                                                                                    | The answer here                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | The first and last day of a bounded range hold a partial day                                          | MDN states the platform's own rule — "the time of day is only constrained on the first and last dates in the range" — and no surveyed script implementation implements it. Here it falls out of D3: on `min`'s own day the list starts at `min`'s time, on `max`'s own day it stops at `max`'s time, and on every day between it runs from `minTime` to `maxTime`. |
| G2  | A day on which no time at all is available                                                            | The calendar cannot know it without probing every step of that day, so `isDateUnavailable` answers the day and the list answers the time. When the day the reader is on offers nothing, the list draws the empty state rather than an empty box, which is `time-picker`'s answer to the same question. |
| G3  | A reader who writes one half and leaves                                                               | The value stays `null`, the field says which half is missing in the DOM, the request carries the segments, and the Angular validator reports `dateTimeIncomplete`. Every surveyed implementation reports an empty control and loses what was written.                                                    |
| G4  | A filled value opened for editing                                                                     | The first press must not close the panel on a reader who came to change both halves. D6 states the rule: `auto` closes on the press that completed the value, and a value that was already whole is not completed by anything.                                                                          |
| G5  | Daylight saving time                                                                                  | There is none to answer, by construction. A wall-clock value has no offset, so the hour that happens twice and the hour that never happens are the application's, against the zone the application knows. Every surveyed implementation that holds an instant owes an answer here and none states one.  |
| G6  | Seven segments in a 240-pixel container                                                               | The row wraps between the two halves and never inside one. Each segment carries `data-half`, so the stylesheet has a real boundary to break at, and no segment is clipped or removed. A locale that writes the time before the date wraps at the same boundary, because the boundary is the pattern's.  |
| G7  | A day chosen while the time half is empty                                                             | The time half takes `referenceDateTime`'s time rather than midnight, so a day pressed in the calendar produces a datetime a reader recognises. Midnight is the platform's answer and is wrong for every booking flow; Ant reached the same conclusion with `showTime.defaultOpenValue`.                  |
| G8  | The bounds change while a value is held                                                               | A held value outside the new bounds is reported `invalid` and is not silently moved. Safari clamps a value to the range on selection, which MDN records; a value the reader wrote is not the family's to rewrite.                                                                                        |

---

## 5. What the invocation named, weighed here

| Named                                                                      | Where it is answered                                                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `datetime-field` is a frame, a group and one value                         | Table stakes 1, 2 and 3, and D1.                                                                                  |
| `PlainDateTime` is a `PlainDate` beside a `PlainTime`                      | Table stakes 1. The nested shape, so every existing function applies to each half unchanged.                       |
| `datetime-picker` is the only family holding two surfaces                  | Table stakes 10, 11 and 24, and D5.                                                                                |
| Which surface opens first                                                  | Table stakes 11: both are present, `openTo` decides where focus lands, and it defaults to `date`.                  |
| What happens to the other when the reader finishes the first               | D6 and G4: the reader is carried to the second surface, and the panel closes on the press that completes the value. |
| Composing what the time chain delivers                                     | The engine, the format pipeline, the list arithmetic and the layer modules are all consumed; §6 records what is new. |

---

## 6. What this adds to the scope paragraph

`docs/process/build-order.md` wave 7 describes the chain and stops at what each family
is. The capabilities above that the paragraph does not name, and that ship
anyway:

- `min`, `max`, `minTime`, `maxTime` combined, and the partial first and last
  day that follows from them (table stakes 6 and 7, D3, G1);
- `isDateUnavailable` and `isTimeUnavailable(time, date)` as two predicates
  rather than one (table stakes 8);
- `referenceDateTime`, answering both the step-from datetime and the time a
  bare day takes (table stakes 17, G7);
- the relative expression widened with days and weeks, consuming the
  `crossesMidnight` flag `time-field` raises (D2);
- `openTo`, and the rule that both surfaces exist in every arrangement (table
  stakes 11, D5);
- `closeOnSelect` decided by the value's completeness (table stakes 12, D6, G4);
- the incomplete half, in the DOM, in the request and in the Angular validator
  (D1, G3);
- `datetime-range-picker` deferred to wave 8 beside `date-range-picker` and
  `time-range-picker` (table stakes 21).

The paragraph is updated with these in the same commit as the contract.
