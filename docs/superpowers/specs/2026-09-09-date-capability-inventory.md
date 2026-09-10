# Date field, calendar and date picker capability inventory

Produced before the three families were designed or coded, as
`.claude/skills/component/references/capability.md` requires. All three are new:
`specs/components/date-field/`, `specs/components/calendar/` and
`specs/components/date-picker/` do not exist, and `docs/build-order.md` wave 7
lists the chain `date-field` → `calendar` → `date-picker` with no scope
paragraph. The paragraph written from this inventory lands in the same commit.

One inventory covers three families because they share one arithmetic and one
locale format, and splitting it would decide that arithmetic three times.

Sources were read on 9 September 2026.

---

## 1. Surveyed

Seven implementations, chosen so they disagree: the platform, the norm, a
headless behaviour library for React, a framework-agnostic state machine, the
only surveyed answer written for Angular, and two opinionated design systems
that answer the text-entry question in opposite ways.

| Implementation             | Calls it                                                                    | Read at                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML Standard / MDN        | `input[type=date]`                                                          | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date>                                                               |
| WAI-ARIA APG               | Date Picker Dialog Example; (Deprecated) Date Picker Spin Button Example    | <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/> and <https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/examples/datepicker-spinbuttons/> |
| React Aria Components      | `DateField` + `DateInput` + `DateSegment`; `Calendar`; `DatePicker`         | <https://react-spectrum.adobe.com/react-aria/DateField.html>, `Calendar.html`, `DatePicker.html`                                                |
| Zag.js 1.43.3 / Ark UI 5.39.1 | `date-picker` machine; `DatePicker.*` parts                                 | <https://zagjs.com/components/react/date-picker> and <https://ark-ui.com/docs/components/date-picker>                                           |
| Angular Material           | `MatDatepicker`, `MatDatepickerInput`, `MatDatepickerToggle`, `MatCalendar` | `src/material/datepicker/datepicker.md` in `angular/components`, `main` branch                                                                 |
| MUI X                      | `DatePicker`, `DateField`, `DateCalendar`                                   | <https://mui.com/x/react-date-pickers/date-picker/>                                                                                            |
| Carbon Design System       | Date picker: simple, single, range                                          | <https://carbondesignsystem.com/components/date-picker/usage/>                                                                                 |
| `@internationalized/date`  | `CalendarDate`, `CalendarDateTime`, `ZonedDateTime`                         | <https://react-spectrum.adobe.com/internationalized/date/index.html>                                                                           |

Two of the seven do not ship a keyboard-editable segmented field at all: Carbon
types into one plain text input parsed by flatpickr, and Angular Material types
into one plain input parsed by a `DateAdapter`. The other four do. That is the
single largest disagreement in the field, and §2 resolves it.

`@internationalized/date` is listed as a source rather than as an
implementation: three of the seven (React Aria, Zag, Ark) are built on it, so
counting it separately would count one answer three times.

---

## 2. Table stakes

Every capability two or more surveyed implementations ship.

### The arithmetic and the format — shared by all three families

| Capability                                                   | Who ships it                                            | Verdict  | Reason                                                                                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A calendar date with no time and no zone as the value type   | React Aria, Zag/Ark, MUI X, `input[type=date]`          | `adopt`  | The value is a domain value, not a formatted string, and §2.9 of the feature guide says so. `Date` is an instant and cannot hold 29 February without a zone deciding which one it is. |
| ISO 8601 `YYYY-MM-DD` as the serialized form                 | React Aria (`name` submits ISO), platform (`value`)     | `adopt`  | The one string the platform, a form post and a query parameter all already agree on.                                                                                          |
| Locale-driven field order and separators                     | React Aria, Zag/Ark, MUI X, platform                    | `adopt`  | `Intl.DateTimeFormat.prototype.formatToParts` names the order and the literals; the same technique `packages/core/src/number` uses for a number.                              |
| Localized month and weekday names, long and short            | all seven                                               | `adopt`  | From `Intl.DateTimeFormat`, not a table this library ships.                                                                                                                  |
| Locale-driven first day of the week                          | React Aria, Zag/Ark, Angular Material, MUI X            | `adopt`  | `Intl.Locale.prototype.getWeekInfo` where the engine has it, with a CLDR-derived fallback table for the region.                                                              |
| `min` / `max` bound                                          | all seven                                               | `adopt`  | Named `min` and `max`, as the platform names them.                                                                                                                           |
| Arbitrary unavailable dates by predicate                     | React Aria (`isDateUnavailable`), Zag/Ark, Angular Material (`dateFilter`), MUI X (`shouldDisableDate`) | `adopt` | One predicate, named `isDateUnavailable`, shared by all three families.                                                                                                       |
| Non-Gregorian calendar systems                               | React Aria, Zag/Ark (via `@internationalized/date`)     | `decline` | Owned by nothing in this library today, and the cost is a second calendar arithmetic. Declined **with a named replacement**: the `date-field` and `calendar` contracts take a `calendar` axis whose only value is `"gregory"`, so the axis exists, the DOM says which calendar is drawn, and a later wave adds values without a contract break. Recorded again in the design document as the one deferred capability. |
| Time-of-day granularity (`hour`, `minute`, `second`)         | React Aria, MUI X                                       | `defer to time-field` | Wave 8 owns `time-picker` (`docs/build-order.md`). The segment engine written here takes hour, minute and second fields at no extra cost, so the deferral is a family boundary rather than a missing mechanism. |
| Time zone as an explicit input                               | React Aria, Zag                                         | `decline` | A date with no time has no zone. The one place a zone is needed is "what is today", and that is answered by a `timeZone` input on the three families rather than by a zoned value type. |

### `date-field`

| Capability                                                        | Who ships it                                     | Verdict  | Reason                                                                                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Segmented entry: one focusable field per date part                 | React Aria, Zag/Ark, MUI X, APG spin-button example | `adopt`  | The two implementations that do not (Carbon, Angular Material) are the two that make the reader retype the whole date to fix one digit, and both then need a format hint in the label to be usable. |
| `role="spinbutton"` per segment, in a `role="group"`               | APG spin-button example, React Aria              | `adapt`  | Adopted whole, with the APG's own correction: the example is deprecated for its **arrow buttons**, not for its roles, and the roles are what a screen reader reads. The group carries a hidden string naming the whole date, as the example's accessibility notes require. |
| `ArrowUp` / `ArrowDown` step one, and wrap within the segment      | APG, React Aria, Zag/Ark, MUI X                  | `adopt`  | The APG example wraps December to January and the last day of the month to the first, without carrying into the next segment.                                                     |
| `PageUp` / `PageDown` step by five                                 | APG spin-button example                          | `adapt`  | The APG's step of five is the spin-button pattern's, and it is adopted for day and month. For the year segment five years is not a page, so year pages by ten — recorded as a departure. |
| `Home` / `End` to the segment's minimum and maximum                | APG, React Aria                                  | `adopt`  |                                                                                                                                                                                   |
| `ArrowLeft` / `ArrowRight` between segments, mirrored in RTL       | React Aria, Zag/Ark, MUI X                       | `adopt`  | The keys are physical; the order they walk is the writing order, so `dir="rtl"` swaps them.                                                                                        |
| Typing digits fills the segment and advances when it is full       | React Aria, Zag/Ark, MUI X                       | `adopt`  | Typing `3` in a month segment waits, because `30` is not a month but `03` needs no wait; typing `4` after it is `34`, which is not a month either, so the segment takes `4` and advances. |
| `Backspace` / `Delete` empties one segment back to its placeholder | React Aria, MUI X                                | `adopt`  | A field with an empty segment has no value, and that is not the same as a cleared field.                                                                                          |
| Paste a whole date into the field                                  | React Aria, MUI X, Carbon (whole input)          | `adopt`  | Parsed by the locale format first, then by ISO 8601. A date copied from a spreadsheet or from a URL both land.                                                                     |
| A placeholder that shows the format                                | all seven                                        | `adopt`  | Drawn from the format's own field names in the reader's locale (`dd/mm/aaaa` in pt-BR), never a hardcoded `mm/dd/yyyy`.                                                            |
| A hidden ISO input so a plain form post carries the value          | React Aria (`name`), platform                    | `adopt`  | `currency-field` already declares `hiddenValueInput: true`; the same decision.                                                                                                    |
| `disabled`, `readOnly`, `required`, `invalid`                      | all seven                                        | `adopt`  | The shared field vocabulary; `field` owns the wiring, as it does for every control.                                                                                               |
| A clear control                                                    | Zag/Ark (`ClearTrigger`), MUI X, Carbon          | `adopt`  | With the `clear` reason the change vocabulary already holds.                                                                                                                      |

### `calendar`

| Capability                                                        | Who ships it                                       | Verdict  | Reason                                                                                                                                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `role="grid"` on a real `table`, with `th` column headers        | APG dialog example, React Aria, Angular Material   | `adopt`  | The APG note is explicit: on a `table`, `row`, `columnheader` and `gridcell` are implied and are not written.                                                                |
| Roving `tabindex` across the days: exactly one cell in the tab order | APG, React Aria, Zag/Ark                          | `adopt`  |                                                                                                                                                                             |
| Full APG grid keyboard, including `PageUp`/`PageDown` by month and `Shift` by year | APG, React Aria, Zag/Ark              | `adopt`  | Transcribed key by key in the design document.                                                                                                                              |
| `abbr` on the column header carrying the full weekday name         | APG (named as an accessibility feature)            | `adopt`  | The visible header is two characters; the screen reader hears "Monday".                                                                                                     |
| The heading as a `aria-live="polite"` region                       | APG, React Aria                                    | `adopt`  | Paging the month with a key changes nothing focus lands on, so nothing else announces it.                                                                                    |
| `today` marked apart from `selected`                               | all seven; §6 of the feature guide requires it     | `adopt`  | Two different facts, and a reader who has selected today must still see both.                                                                                                |
| Days from the adjacent months, dimmed                              | Angular Material, MUI X, Carbon, Zag/Ark           | `adopt`  | With an axis deciding whether they are selectable, because the field disagrees: Zag/Ark makes it an option, Angular Material does not draw them at all.                       |
| Previous / next month triggers                                     | all seven                                          | `adopt`  |                                                                                                                                                                             |
| Month and year views, reached from the heading                     | Zag/Ark (`view`), MUI X (`views`), Angular Material (`startView`) | `adopt` | A reader entering a birth date must not press "previous month" four hundred times. Three views: `day`, `month`, `year`.                                                       |
| More than one month visible at a time                              | React Aria (`visibleDuration`), Zag/Ark (`numOfMonths`), MUI X | `adapt` | Adopted as a `months` axis, and paired with the family's own container query so two months become one below the width where two do not fit.                                   |
| Week numbers                                                       | Zag/Ark, MUI X (`displayWeekNumber`)               | `adopt`  | ISO 8601 week numbering; a `weekNumbers` axis, off by default.                                                                                                              |
| Fixed six-week grid, so paging does not resize the surface         | Zag/Ark (`fixedWeeks`), MUI X (`fixedWeekNumber`)  | `adopt`  | Default on inside `date-picker`, because a popover that changes height under the pointer moves the target.                                                                    |
| Range and multiple selection                                       | Zag/Ark, MUI X, Carbon                             | `adapt`  | The `calendar` family ships `selectionMode` with all three values, because the grid is where the work is. The `date-range-picker` family in wave 8 is then the field and the popover, not a second calendar. |
| Per-date decoration from the consumer                              | Angular Material (`dateClass`)                     | `adopt`  | As a `data-*` attribute the consumer's own predicate sets, rather than a class: a class is not contract here.                                                                |

### `date-picker`

| Capability                                                     | Who ships it                                    | Verdict  | Reason                                                                                                                                                     |
| -------------------------------------------------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A field and a calendar behind a trigger                        | all seven                                       | `adopt`  | Composed from the two families above and from `packages/core`, never rewritten.                                                                             |
| `Escape` closes and returns focus to the trigger               | APG, React Aria, Zag/Ark                        | `adopt`  | Through `dismissable-layer`, whose capture-phase rule the briefing already records.                                                                         |
| The trigger's accessible name carries the selected date        | APG (named as an accessibility feature)         | `adopt`  | "Change date, 9 September 2026" rather than "Choose date", so focus returning to the trigger confirms what was chosen.                                       |
| `Alt`+`ArrowDown` opens the popup from the field               | Angular Material, React Aria                    | `adapt`  | Adopted, and paired with the platform note Angular Material records: ChromeOS turns that chord into `PageDown`, so the trigger button is the guaranteed path and the chord is the shortcut. |
| Closing on selection                                           | Zag/Ark (`closeOnSelect`), MUI X                | `adopt`  | An axis, default on for single selection and off for the others, which is the only combination that is not a trap.                                          |
| Presets ("today", "last 7 days")                               | Zag/Ark, Carbon                                 | `adapt`  | Not a preset list this family holds, but a `preset` part the consumer fills — the labels and the ranges are the product's, and a list of them in the contract would be this library guessing at a business calendar. |
| Modal on a coarse pointer                                      | Angular Material (`touchUi`), MUI X, Carbon     | `adopt`  | §2.7 of the feature guide asks for it by name: popover on the desktop, sheet in a narrow viewport.                                                            |
| Opening on focus                                               | Carbon, MUI X (`openOnFocus`-like behaviour)    | `decline` | Declined because it takes the keyboard away from the field: a reader who tabs in to type is given a grid instead. The composition that replaces it is two lines — the consumer calls `open()` from the field's own `onFocus`, which the imperative handle already exposes. |

---

## 3. Differentiators

| What                                                                    | Why this library can offer it                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A calendar that is correct at three densities                           | No surveyed implementation has a density axis at all. A calendar is the densest grid in a component library — seven columns of two-digit numbers — and `dense` is where it either holds or collapses. The 44-pixel coarse-pointer floor the theme emits keeps the touch target while the type shrinks. |
| A calendar that is correct in `high-contrast` and in `forced-colors`     | Every surveyed implementation paints `selected`, `today`, `range-start`, `range-end`, `in-range`, `unavailable` and `outside-month` with colour. Under forced colours that is one colour. This family pairs each state with an edge or a mark, as the token foundation requires, so all seven read when the palette is replaced. |
| Segment entry and a grid in one family pair, in **two** frameworks       | React Aria has the segmented field and no Angular; Angular Material has Angular and no segmented field. This is the only surveyed pairing that would ship both, with `ControlValueAccessor` on the Angular side and `render` on the React side.                                            |
| No date library in the consumer's bundle                                | Three of the seven require `@internationalized/date` (about 25 kB minified) and one requires a `DateAdapter` plus `date-fns`, `luxon` or `moment`. The arithmetic here is a proleptic Gregorian day count in about 250 lines with no dependency, which is what PRD §23.1 asks for by name. |
| Two months that become one because the component is narrow, not the page | `container-type: inline-size` on the calendar root. Every surveyed multi-month calendar is told how many months to draw and keeps drawing them into an overflow.                                                                                                                          |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap                                                                                                                | What this family does                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A partially typed date.** Every surveyed segmented field holds a value or holds nothing; a date with a day and a month and no year is neither. | The field holds the segments, and the value is `null` until all three are filled. The request carries the segments too, so a consumer can save a draft. The state model names it: `value` moves only when the date is whole.                                              |
| **31 January, then the month is stepped to February.** React Aria and MUI X clamp silently to 28; the reader who wanted 31 March presses `ArrowUp` twice more and is at 30 April. | The day is clamped and the fact is announced through the live region, and the *typed* day is remembered: stepping the month from a clamped February back to March restores 31. This is the one behaviour in the three families that no surveyed implementation has. |
| **The reader's locale writes a two-digit year.** `en-US` short format is `9/9/26`, and 26 is not 2026.              | The year segment is always four digits regardless of what the locale's short format writes, and typing two digits into it resolves through a documented pivot rather than a guess. The pivot is stated in the contract, not inferred.                                    |
| **A date that arrives from a server as `2026-09-09T00:00:00Z`.** Every surveyed implementation either takes it and shifts it a day west of Greenwich, or refuses it. | The value type is a plain date, and the parser refuses an instant rather than truncating one. The error names the fix. The `timeZone` input exists for the one question that needs it, "what is today".                                                                  |
| **A long month name in a narrow calendar.** `setembro de 2026` in a 240-pixel popover; `Wednesday` abbreviated to two characters that collide in some locales. | The heading takes the locale's own long format and the container query drops it to the short one below the width where it wraps. The column header takes whatever length `Intl` gives for the locale's narrow weekday and never truncates it, because a truncated weekday is not a weekday. |
| **A hundred unavailable dates.** The predicate runs per cell, per render, in every surveyed implementation.         | The predicate runs once per visible cell and the result is held with the grid, so paging a month is 42 calls rather than 42 per keystroke.                                                                                                                              |

---

## Exit condition

A reader who knows this family from React Aria, from Ark UI, from Angular
Material or from MUI X can point at one thing that is missing — a non-Gregorian
calendar — and find it in §2 with its reason, its named replacement (`calendar`
axis with one value today) and the wave that takes it. Everything else the field
ships is `adopt` or `adapt`.
