# Time field and time picker capability inventory

Produced before either family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. Both are new:
`specs/components/time-field/` and `specs/components/time-picker/` do not exist.
`docs/build-order.md` wave 7 carries the scope paragraph for the chain
`time-field` → `time-picker` → `datetime-field` → `datetime-picker`; this
inventory covers the first two, and §6 records what it adds to that paragraph.

One inventory covers two families because the panel behind the picker exists to
write the field's value, and splitting it would decide the value twice.

Sources were read on 10 September 2026.

---

## 1. Surveyed

Eight implementations, chosen so they disagree: the platform, two accessibility
patterns, a headless behaviour library, the only surveyed answer written for
Angular, and three opinionated design systems that answer the entry question in
three different ways — a segmented field, a text input, and a combobox.

| Implementation        | Calls it                                                  | Read at                                                                                                                            |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| HTML Standard / MDN   | `input[type=time]`                                        | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time>                                                   |
| WAI-ARIA APG          | Spinbutton Pattern                                        | <https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/>                                                                             |
| WAI-ARIA APG          | Listbox Pattern                                           | <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/>                                                                                |
| React Aria Components | `TimeField` + `DateInput` + `DateSegment`                 | <https://react-spectrum.adobe.com/react-aria/TimeField.html>                                                                       |
| Angular Material      | `MatTimepicker`, `MatTimepickerInput`, `MatTimepickerToggle` | `src/material/timepicker/timepicker.{md,ts}` and `timepicker-input.ts` in `angular/components`, `main` branch                    |
| MUI X                 | `TimePicker`, `DigitalClock`, `MultiSectionDigitalClock`  | <https://mui.com/x/react-date-pickers/time-picker/> and <https://mui.com/x/react-date-pickers/digital-clock/>                       |
| Ant Design 6.6.3      | `TimePicker`, `TimePicker.RangePicker`                    | <https://ant.design/components/time-picker>                                                                                        |
| Fluent UI React v9    | `TimePicker` (a `Combobox` of generated options)          | `packages/react-components/react-timepicker-compat/library/src/components/TimePicker/TimePicker.types.ts`, `master`                |
| Carbon                | `TimePicker` + `TimePickerSelect`                         | `packages/react/src/components/TimePicker/TimePicker.tsx`, `main`                                                                  |

The three entry shapes, because the same capability hides under each:

- **Segmented.** React Aria and the platform give one editable part per unit.
  The value is a domain value and there is no text to parse.
- **Text.** Carbon is an `input[type=text]` with `pattern` and `maxLength=5`
  beside two `select`s for the day period and the zone; Angular Material is a
  text input that parses through a `DateAdapter` and reports
  `matTimepickerParse` on failure; Ant is a text input over a column panel.
- **Combobox.** Fluent generates options between `startHour` and `endHour` at
  `increment` and lets `freeform` parse anything typed.

---

## 2. Table stakes

Every capability two or more surveyed implementations ship. `TF` marks
`time-field`, `TP` marks `time-picker`.

| #   | Capability                                                     | Who ships it                                                     | Verdict                     | Reason                                                                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | One editable part per unit, typed and stepped                  | MDN, React Aria, APG spinbutton                                  | adopt · TF                  | `packages/core/src/date/segments.ts` already steps a number in a range, wraps it, takes digits and ends a run. Hour, minute and second are a wider union and four rows in `fieldRange`.                                                                     |
| 2   | 12- or 24-hour cycle taken from the locale                     | MDN, React Aria (`hourCycle`), MUI (`ampm`), Ant (`use12Hours`), Fluent (`hour12`), Angular Material (date formats) | adapt · TF TP | Adopted, and widened: the four cycles `Intl` resolves are `h11`, `h12`, `h23` and `h24`, and a boolean cannot say which. The public axis stays `12 \| 24` and the locale decides which variant of each. §3 D3.                                            |
| 3   | Granularity — whether seconds exist                            | React Aria (`granularity`), MUI (`views`), Ant (`format`), MDN (`step`), Fluent (`showSeconds`) | adopt · TF TP | `granularity: 'hour' \| 'minute' \| 'second'`, defaulting to `minute`, which is React Aria's name and the platform's default.                                                                                                                              |
| 4   | Lower and upper bound                                          | MDN (`min`/`max`), React Aria, Angular Material, MUI (`minTime`/`maxTime`), Fluent (`startHour`/`endHour`) | adopt · TF TP | `min` and `max`, as `PlainTime`. Reported through `aria-valuemin` and `aria-valuemax` on the segment the bound applies to, as the spinbutton pattern requires.                                                                                              |
| 5   | Arbitrary refused times                                        | MUI (`shouldDisableTime`), Ant (`disabledTime`)                  | adopt · TF TP               | `isTimeUnavailable(time)`, the name `date-field` already uses for the same question. A predicate answers a lunch break, a booked slot and a closed shop; three lists of numbers answer only the ones that fall on a unit boundary.                          |
| 6   | A step between offered values                                  | MDN (`step`), Angular Material (`interval`), MUI (`timeStep`/`timeSteps`), Ant (`hourStep`/`minuteStep`/`secondStep`), Fluent (`increment`) | adopt · TP | One `step`, in seconds, which is the platform's unit. Angular Material's `"90m"` string and Ant's three numbers are the same number said differently; a number of seconds is the one both can be written as.                                               |
| 7   | A panel of times behind the field                              | Angular Material, MUI, Ant, Fluent                               | adopt · TP                  | A list at a step is a `listbox`, not a `grid`. It composes the layer modules `select` composes and redraws no calendar.                                                                                                                                     |
| 8   | Unavailable options hidden rather than disabled                | MUI (`skipDisabled`), Ant (`hideDisabledOptions`)                | adopt · TP                  | `unavailableOptions: 'disable' \| 'hide'`, defaulting to `disable`, because a list that silently drops rows is a list whose step the reader cannot infer.                                                                                                  |
| 9   | Typing works while the panel exists                            | Angular Material, Ant, Fluent (`freeform`), Carbon               | adopt · TF TP               | `docs/component-features.md` §6 states it: the panel complements and does not block. The field under the picker is the same `time-field`, fully typable, and the panel never takes DOM focus away from it until the reader asks.                            |
| 10  | Clearing the value                                             | Ant (`allowClear`), Fluent (`clearable`), MUI (`clearable`)      | adopt · TF TP               | `clearable`, the control `date-field` already draws, in the same slot with the same label resolution.                                                                                                                                                       |
| 11  | A placeholder that states the shape                            | MDN, React Aria (`placeholderValue`), Ant, Carbon (`hh:mm`)      | adapt · TF                  | Taken from `Intl.DisplayNames` in the reader's own language rather than from a hard-coded `hh:mm`, which is what `date-field` does for `dd/mm/aaaa`. React Aria's `placeholderValue` is a different question — which time an empty field steps from — and is adopted as `referenceTime`. |
| 12  | `disabled`, `readOnly`, `required`, `invalid`                  | all eight                                                        | adopt · TF TP               | Unstated rather than `false`, so an unset value defers to the surrounding `field`.                                                                                                                                                                          |
| 13  | Form integration                                               | MDN (native), Angular Material (`ControlValueAccessor` + `Validator`), MUI, Ant | adopt · TF TP | React posts through a hidden input carrying `HH:mm:ss`, the decision `date-field` and `currency-field` already took. Angular implements `ControlValueAccessor` and `Validator`, reporting `timeParse`, `timeMin`, `timeMax` and `timeUnavailable`.        |
| 14  | A control that writes the current time                         | Ant (`showNow`), MUI (`actionBar` `now`)                          | adapt · TP                  | Shipped as the zero case of the relative entry in §3 D1 rather than as a separate button: `now` is `+0`. The panel draws it as a labelled control at the head, so a reader who never discovers the expression still has the one press.                       |
| 15  | The panel opens on the chosen value                            | Angular Material, MUI, Ant                                        | adopt · TP                  | And on the nearest step to now when nothing is chosen, and on the first available option when that is refused. `scrollIntoView({ block: 'nearest' })` on open and on every highlight move, which is what `select` already does.                             |
| 16  | Several columns for a fine step                                | MUI (`MultiSectionDigitalClock`), Ant                            | decline · owned by `time-field` | Adopted, drawn, and withdrawn at the visual gate on the reviewer's reading — the delta is §7. Columns exist to express a precision a list cannot (86 400 rows at a one-second step), and this library expresses it in the control the panel hangs from: the field types, steps, pages, bounds and clears every second. `docs/component-features.md` §6 asks for exactly that relationship. What columns exist for is answered by two props instead: the field types every second, and `options` (table stakes 18) hands the panel any set of times — seconds included, in any order, on no step at all. The step has no floor; the guard is `maxOptions`, on the length of the list. |
| 17  | Confirming before the value commits                            | Ant (`needConfirm`), MUI (`actionBar` `accept`)                  | adapt · TP                  | `closeOnSelect` and the `footer` slot, the pair `date-picker` already has. The field needs no confirmation of its own: a typed run commits when the run ends, never inside it.                                                                              |
| 18  | Consumer-written options and option content                    | Ant (`cellRender`), Angular Material (custom `mat-option`), MUI (slots) | adopt · TP            | `options` states the list of times explicitly, in the consumer's own order, and the option's content is a render slot in React and an `ng-template` in Angular. It carries more weight than the survey gives it: with columns declined, this is what makes an irregular set and a second-level set expressible, and §7 records that it reached the contract only after the reviewer asked. |
| 19  | Opening the panel from the keyboard                            | Angular Material, MUI                                            | adopt · TP                  | `Alt`+`ArrowDown`, the chord `date-picker` took, with the same recorded cost: ChromeOS turns it into `PageDown` before the browser sees it, so the trigger button is always drawn and the chord is only a shortcut.                                          |
| 20  | A pair of times, start and end                                 | Ant (`TimePicker.RangePicker`), MUI (`TimeRangePicker`, Pro)     | defer to `time-range-picker`, wave 8 | The same weighing `docs/build-order.md` already applied to `date-range-picker`: a pair is a specialised composition of a value the Core has, not a value the Core cannot say. The line is added to wave 8 beside `date-range-picker` in the same commit. |
| 21  | The time zone shown beside the value                           | React Aria (`hideTimeZone`, `ZonedDateTime`)                     | decline                     | One implementation, and the briefing's own decision: what this library holds is the wall-clock value the reader typed. An application that knows the zone writes its label into the field's `end` slot, which is two lines and already exists.                |
| 22  | Selection while the reader scrolls a column                    | Ant (`changeOnScroll`)                                           | decline                     | One implementation. A value that moves because a wheel turned is a value nobody asked to change, and the same list answers a press and an arrow key. Recorded rather than silent.                                                                            |
| 23  | A read-only input that suppresses the virtual keyboard         | Ant (`inputReadOnly`)                                            | decline                     | One implementation, and `readOnly` already says it for every family in this library. A control that is typable but refuses a keyboard is a state the vocabulary has no word for.                                                                             |

---

## 3. Differentiators

What the best surveyed implementation offers that the others do not, and what
this library can offer because of what it already owns.

| ID  | Differentiator                                                                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **A time written as a duration from now, resolved in view before it is accepted.** Typing `+`, `-` or `=` on any segment opens one expression region in place of them; `+40m`, `1h30`, `-15` and `0` are read as the reader types, and the time they resolve to is drawn beside the expression before `Enter` commits it. `Escape` abandons it and the segments come back untouched. No surveyed implementation offers it, and it is the request `docs/superpowers/specs/2026-09-09-date-design.md` §12 records from the reviewer. |
| D2  | **The segments are the state and the value is derived.** A time with an hour and no minute exists while a reader is typing, and `value` is `null` for it — which is not the same as an empty field. Every surveyed implementation holds a whole time or nothing and cannot say the difference. Inherited from `date-field`, and new for time.                                     |
| D3  | **Four hour cycles, not a boolean.** `Intl` resolves `h11`, `h12`, `h23` and `h24`. `ja-JP` writes midnight as `午前0時` and the hour segment runs 0 to 11; a `12`/`true` boolean writes `12` there and is wrong in a way nobody notices until a Japanese reader reports it. The public axis is still `12 \| 24`; which variant of each is the locale's.                        |
| D4  | **A duration that passes midnight says so.** `+90m` at `23:00` resolves to `00:30`, which is a different day — and this library holds no day beside the time. The resolved preview carries `data-crosses-midnight`, the announcement names it, and the request carries `crossesMidnight` so a consumer holding a `PlainDateTime` knows to add one. No surveyed implementation says anything at all.                          |
| D5  | **The panel never takes the field away.** Angular Material moves DOM focus into the dropdown and Ant's panel replaces the entry; here the field stays typable with the panel open, the panel's highlight follows what is typed, and `docs/component-features.md` §6 is satisfied literally rather than approximately.                                                            |
| D6  | **Three colour schemes, three densities, logical properties and two first-class bindings.** No surveyed implementation ships a high-contrast scheme, and none ships the same conceptual contract in React and in Angular without one of the two being a wrapper.                                                                                                                 |
| D7  | **The value is a `PlainTime` and never an instant.** The type every surveyed implementation gets wrong at a daylight boundary is the one this library refuses to hold. Decided in wave 7, recorded in `docs/build-briefing.md`.                                                                                                                                                  |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| ID  | Gap                                                                        | The answer here                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | A step that does not divide the hour — a seven-minute slot                  | The step base is `min` when it is stated and midnight when it is not, which is the platform's own rule for `input[type=time]` and the only one the surveyed panels do not state at all.                                  |
| G2  | Second granularity at a one-second step                                     | 86 400 rows is not a list, and the guard is on the length rather than on the step: `maxOptions` defaults to 1440 — a whole day at a one-minute step — the list is cut there, and `data-truncated` says so. Seconds *are* choosable from the panel, by stating them: `options` takes `00:00:15`, `00:00:30`, `00:00:45`. |
| G3  | Every option refused — `min` above `max`, or a predicate that says no       | The panel draws an empty state naming that no time is available, rather than an empty box the reader reads as a broken component. MUI draws nothing; Ant draws an empty column.                                          |
| G4  | A long day-period name                                                      | `es-MX` writes `a.m.`, and a locale can write a word. The day-period part is sized from the widest of the two names the locale actually uses rather than from two characters, and the column does not clip.              |
| G5  | Typing while the panel is open                                              | The highlight follows the typed value on every keystroke, so the panel is a picture of the field rather than a second source of truth. Angular Material does this; MUI does not.                                         |
| G9  | Ninety-six rows of digits                                                   | An hour heading over them was drawn and withdrawn: the hour is on every row already. What answers the length costs no row — the panel opens on the chosen time, type-ahead jumps, and `PageUp`/`PageDown` move one hour boundary each. |
| G6  | A relative expression written in the reader's own language                  | The grammar is the symbols and the unit letters — `+`, `-`, `h`, `m`, `s`, and `:` — because those are what a numeric keyboard offers in every locale. The locale's own words are not parsed, and the placeholder says so. |
| G7  | An unreachable value: `step` 900 with `min` `09:07`                         | The panel offers `09:07`, `09:22`, `09:37`; the field still accepts `09:15` by typing, and the family reports `invalid` only when a bound or the predicate refuses it, never because the value is off the panel's step.  |
| G8  | A reader who never discovers the expression                                 | The relative entry is a shortcut, never the only way in. Every value it can write is reachable by typing the segments, by the arrows, and — for the current time — by a labelled control at the head of the panel.        |

---

## 5. What the invocation named, weighed here

| Named                                                | Where it is answered                                                                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core rather than Extended                            | `docs/component-features.md` §Time e DateTime Picker already carries the reason and the date it changed. Nothing to re-decide.                              |
| No new segment engine                                | Table stakes 1. `segments.ts` is generalised rather than copied: one `SegmentState` holds both halves, which is what `datetime-field` needs to exist at all. |
| The panel is a `listbox`, not a `grid`               | Table stakes 7 and 16.                                                                                                                                     |
| `PlainTime`, never an instant                        | D7, and table stakes 21.                                                                                                                                   |
| More inventive than the surveyed field               | D1, D3 and D4.                                                                                                                                             |
| Least contact with shared files                      | `@slotted/core/date` is already an entry point and already builds `packages/core/src/date/*`, so neither `packages/core/package.json` nor `vite.config.ts` changes. |

---

## 6. What this adds to the scope paragraph

`docs/build-order.md` wave 7 describes the chain and stops at what each family
is. The capabilities above that the paragraph does not name, and that ship
anyway:

- the relative expression and its resolved preview (D1, D4);
- the four hour cycles (D3);
- `granularity`, `step`, `min`, `max`, `isTimeUnavailable`,
  `unavailableOptions` (table stakes 3, 4, 5, 6, 8);
- one panel shape, with the column panel declined and the step floored at a
  minute (table stakes 16, G2, §7);
- the empty state when no time is available (G3);
- `time-range-picker` deferred to wave 8 beside `date-range-picker` (table
  stakes 20).

The paragraph is updated with these in the same commit as the contract.

---

## 7. What the visual gate changed

Three findings from the reviewer, all against the rendered picture, and all
answered here rather than left for a later pass.

| Finding                                                                 | What it changed                                                                                                                                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The two-column panel is neither robust nor pleasant                     | Withdrawn. Table stakes 16 becomes a `decline` owned by `time-field`, the step floors at a minute, and the family ships one listbox at every step. An hour heading was then drawn as a replacement and withdrawn too: it repeated the hour every row carries. |
| Icons, prefixes and text must sit on one axis                           | Measured rather than judged: every mark in the field sits on the cap band to within half a pixel, and the one that did not was the preview's chevron — drawn at the control glyph size, sixteen pixels beside a nine-pixel capital, and centred on the line box rather than on the letters. It is now `1cap` and carries the `vertical-align` formula the briefing records. |
| A selected option turns a strange colour under the pointer              | A precedence defect, and a real one: `:hover` with one `:not()` outweighs a plain `[data-selected]`, so hover beat selection whatever the source order said. Every weaker rule now guards against each stronger state, the chosen row answers the pointer one step along its own tone, and `packages/styles/src/states.test.mjs` — which read the prose above a rule as part of its selector — was fixed first, in its own commit. |

### Second round

The reviewer read the withdrawal and asked the right question: removing the
columns is not the same as answering what they were for. It was not, and two
things were missing.

| Finding                                                          | What it changed                                                                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Seconds could not be chosen from any surface                     | The step's one-minute floor is withdrawn, and `options` states a second-level set outright. A thirty-second step inside a bounded window is now eleven rows, which is what the floor had been refusing along with the day. |
| Irregular times could not be expressed at all                    | `options` reached the contract. Table stakes 18 said `adopt` and it had never been written down — an inventory-to-contract drift, and the kind the rubric's Capability dimension exists to catch. |
| The list could still be asked for 86 400 rows                    | `maxOptions`, defaulting to 1440, with `data-truncated` in the DOM and the fact in the panel's accessible description. The guard is on the length, where it belongs. |
