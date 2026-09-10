# Date field, calendar and date picker design

The decisions the three families rest on, taken before either binding was
written. The capability inventory that justifies them is
`2026-09-09-date-capability-inventory.md`; this document records what was
decided, and what each decision costs.

---

## 1. Where the arithmetic lives

**`packages/core/src/date`, reached as `@slotted/core/date`.** Not beside
`collection`, and not inside any of the three families.

Not inside a family, because three families need it and the two bindings of
each need to agree about it. `packages/core/src/number` records the same reason
for the same shape: two bindings that each decided what `1.234` means would
disagree, and here two bindings that each decided what "one month after 31
January" means would disagree about a value a form posts.

Not beside `collection`, because `collection` answers one question — how a set
of rows is keyed, filtered, navigated and selected — and the briefing's rule
for `packages/core` is that each module owns one question and none imports
another. A calendar month is not a collection: it is a grid whose cells are
derived from an arithmetic, and putting the arithmetic under `collection` would
make every consumer of `moveIndex` pull a Gregorian calendar. The grid's own
navigation is a second, separate matter, answered in §5 below.

An entry point of its own is also what `PROJECT-PRD.md` §23.1 asks for by name:
importing a button must not load a date picker. `date` follows `currency`
exactly — a build entry in `packages/core/vite.config.ts`, a subpath in
`packages/core/package.json`, and deliberately **not** re-exported from
`packages/core/src/index.ts`, which is where `currency` already sits and is why
a barrel import does not drag a currency parser into a page with no money on it.

### What the module holds, and what it refuses

No dependency. `@internationalized/date` is 25 kB for a problem that is 250
lines when the calendar is Gregorian, and the briefing states that
`@floating-ui/dom` is the only runtime dependency of `@slotted/core`. Adding a
second is a decision that binds every family, and this one does not earn it.

| Concern                                                | Where                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| The value type, `PlainDate` — `{ year, month, day }`   | `date/plain-date.ts`                                        |
| Day arithmetic, comparison, clamping, ISO 8601         | `date/plain-date.ts`                                        |
| Month and year stepping, with the clamp rule of §4     | `date/plain-date.ts`                                        |
| Segment order, literals and placeholders per locale    | `date/format.ts`, from `Intl.DateTimeFormat.formatToParts`  |
| Parsing typed and pasted text                          | `date/format.ts`                                            |
| Month names, weekday names, first day of the week      | `date/format.ts`, from `Intl` and `Intl.Locale`             |
| The six-by-seven grid of a month, and ISO week numbers | `date/grid.ts`                                              |

`PlainDate` is a plain object rather than a class: it crosses a props boundary
in React and a signal in Angular, it is compared by value, and a class would
put an `instanceof` check between a consumer's object and the library's.

The arithmetic is a proleptic Gregorian day count — the same one
`Date.UTC(y, m, d)` performs — with the year taken from the object rather than
from an instant, so no zone can move a date across midnight. `Date` is used as
a calculator, never as a value.

`timeZone` exists on all three families for exactly one question: which day is
today. It defaults to the runtime's own zone. It is not part of the value.

---

## 2. Three families, and why not one or two

| Family        | What it is                                                  | Depends on             |
| ------------- | ----------------------------------------------------------- | ---------------------- |
| `date-field`  | A segmented text control that holds one date.               | `@slotted/core/date`   |
| `calendar`    | A month grid that holds one date, a range, or a set.        | `@slotted/core/date`   |
| `date-picker` | A `date-field`, a trigger, and a `calendar` in a popover.   | both, plus the overlay |

Each of the first two is useful alone, and the field is unambiguous evidence:
an expiry date wants a field with no calendar, and a booking page wants a
calendar with no field. `date-picker` composes them and adds nothing a consumer
could not compose, which is what makes it worth shipping — the composition is
five parts of wiring, focus return and an accessible name, and every product
would otherwise write it again.

`date-picker` renders the other two families' parts. The briefing's rule
applies without change: it destructures the `ref` out of what `render` gives it
and attaches it beside its own, because that ref is the anchor the positioner
measures.

---

## 3. Anatomy

### `date-field`

| Part          | Element  | Always | For                                                        |
| ------------- | -------- | ------ | ---------------------------------------------------------- |
| `root`        | `div`    | yes    | The frame. `data-ui="date-field"`. No role.                |
| `segments`    | `div`    | yes    | `role="group"`, the accessible name of the whole date.     |
| `segment`     | `div`    | yes    | `role="spinbutton"`, one per date field. Roving `tabindex`. |
| `literal`     | `span`   | yes    | The separator the locale writes. `aria-hidden`.            |
| `start`       | `span`   | no     | The consumer's slot before the segments.                   |
| `end`         | `span`   | no     | The consumer's slot after them.                            |
| `clear`       | `button` | no     | Empties the value.                                         |
| `hidden-input`| `input`  | yes    | `type="hidden"`, the ISO string a form posts.              |

The frame is not the control, exactly as `text-field` decided: `role="group"`
is on `segments`, and the clear button is its sibling rather than its child.

### `calendar`

| Part            | Element  | Always | For                                                                     |
| --------------- | -------- | ------ | ----------------------------------------------------------------------- |
| `root`          | `div`    | yes    | `data-ui="calendar"`. The container query lives here.                    |
| `header`        | `div`    | yes    | The heading row.                                                        |
| `previous`      | `button` | yes    | One page back, in the current view.                                     |
| `next`          | `button` | yes    | One page forward.                                                       |
| `heading`       | `button` | yes    | The month and year. Pressing it goes up a view. `aria-live="polite"`.   |
| `grids`         | `div`    | yes    | Holds one or more months.                                               |
| `grid`          | `table`  | yes    | `role="grid"` is implied by `table`; `aria-labelledby` the heading.      |
| `grid-caption`  | `caption`| yes    | The month's own name, visually hidden when the heading already says it.  |
| `week-headers`  | `tr`     | yes    | The weekday row.                                                        |
| `week-header`   | `th`     | yes    | `scope="col"`, `abbr` carrying the full weekday name.                   |
| `week`          | `tr`     | yes    | One week.                                                               |
| `week-number`   | `th`     | no     | `scope="row"`, the ISO week number.                                     |
| `cell`          | `td`     | yes    | The grid cell. Holds the roving `tabindex`.                             |
| `day`           | `span`   | yes    | The number the reader reads, and what `data-today` marks.               |
| `months`        | `div`    | no     | The month view's own grid.                                              |
| `years`         | `div`    | no     | The year view's own grid.                                               |
| `period`        | `button` | no     | One month or one year in those two views.                              |

The `table` carries the grid role because the APG's own example says the row,
column-header and cell roles are then implied and must not be written.

### `date-picker`

| Part         | Element  | Always | For                                                              |
| ------------ | -------- | ------ | ---------------------------------------------------------------- |
| `root`       | `div`    | yes    | `data-ui="date-picker"`.                                         |
| `control`    | `div`    | yes    | The field and the trigger, in one frame.                         |
| `trigger`    | `button` | yes    | Opens the popup. Its accessible name carries the selected date.  |
| `positioner` | `div`    | yes    | What the positioner writes its custom properties on.             |
| `content`    | `div`    | yes    | The popup surface. `role="dialog"`.                              |
| `presets`    | `div`    | no     | The consumer's own shortcuts.                                    |
| `footer`     | `div`    | no     | The consumer's own actions.                                      |
| `arrow`      | `span`   | no     | The pointer to the anchor.                                       |

The `date-field` and `calendar` roots appear inside `control` and `content`
respectively, keeping their own `data-ui`, which is what lets one stylesheet
rule reach a calendar wherever it stands.

---

## 4. State, and the one behaviour nobody else has

Three mutable values across the three families, each with a model.

| Family        | Capability | Controlled | Uncontrolled     | Request           | Reasons                                                    |
| ------------- | ---------- | ---------- | ---------------- | ----------------- | ---------------------------------------------------------- |
| `date-field`  | `value`    | `value`    | `defaultValue`   | `onValueChange`   | `keyboard`, `clear`, `blur`, `programmatic`                |
| `calendar`    | `value`    | `value`    | `defaultValue`   | `onValueChange`   | `pointer`, `keyboard`, `clear`, `programmatic`             |
| `calendar`    | `current`  | `focusedDate` | `defaultFocusedDate` | `onFocusedDateChange` | `pointer`, `keyboard`, `programmatic`               |
| `date-picker` | `value`    | `value`    | `defaultValue`   | `onValueChange`   | `pointer`, `keyboard`, `select`, `clear`, `programmatic`   |
| `date-picker` | `open`     | `open`     | `defaultOpen`    | `onOpenChange`    | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`  |

`calendar` separates the date the reader is **on** from the date the reader has
**chosen**, and the capability vocabulary already has the word: `current` is
where the reader is. Every surveyed implementation holds both, and three of the
seven let the consumer own the focused one.

### The typed day is remembered

The gap §4 of the inventory names. A reader on 31 January who steps the month
forward is shown 28 February, because 31 February does not exist; every
surveyed implementation then throws the 31 away, so stepping forward twice more
lands on 30 April instead of 31 March.

`stepMonth` in `@slotted/core/date` returns the clamped date **and** the day
that was asked for. The family keeps the asked-for day beside the value and
offers it back on the next step, so 31 → 28 → 31 → 30 → 31. It is discarded the
moment the reader types a day or picks one from the grid, because that is a new
intention.

The clamp is announced: `live-announcer` says the resulting date whenever a
step clamped it, which is the only way a screen-reader user learns that the
28th is not the 31st they asked for.

### A partly typed date

The field holds segments; the value is `null` until every segment is filled.
The request carries the segments alongside the value, so a consumer saving a
draft has something to save. This is what makes the empty state and the
partly-typed state two different things rather than one, which no surveyed
implementation distinguishes.

### The two-digit year

The year segment is four digits whatever the locale's short format writes, and
two typed digits resolve through a pivot stated in the contract: a value at or
below the current year's last two digits plus 20 is this century, and anything
above it is the last. Stated rather than inferred, and reachable as `yearPivot`
for the product that needs a different one — a birth date wants every two-digit
year in the past.

---

## 5. Keyboard, from the pattern

Sourced from
<https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/>
and
<https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/examples/datepicker-spinbuttons/>,
read on 9 September 2026.

### `date-field` segments — spin-button pattern

| Key                       | Effect                                                          | Focus after   |
| ------------------------- | --------------------------------------------------------------- | ------------- |
| `ArrowUp` / `ArrowDown`   | One step, wrapping inside the segment.                          | unchanged     |
| `PageUp` / `PageDown`     | Five steps for day and month; ten years for year.               | unchanged     |
| `Home` / `End`            | The segment's minimum / maximum.                                | unchanged     |
| `ArrowRight` / `ArrowLeft`| The next / previous segment in writing order.                   | that segment  |
| a digit                   | Fills the segment; advances when no further digit can fit.      | next segment  |
| `Backspace` / `Delete`    | Empties the segment to its placeholder.                         | unchanged     |
| `Ctrl`/`Cmd` + `V`        | Parses the pasted text as a whole date.                         | unchanged     |

`PageUp`/`PageDown` on the year is the one departure from the APG example,
which steps every spin button by five. Five years is not a page of years, and
the year is the segment a reader is most often far from; ten is the step the
year view's own grid uses, so the two agree. The cost: a reader who learned
"five" from another spin button on the page finds ten here.

The APG example is marked deprecated. What is deprecated is its **visible arrow
buttons**, which duplicate keys the reader already has; its roles, its wrapping
rules and its `aria-valuetext` guidance are the spin-button pattern's and are
adopted whole. No arrow buttons are drawn.

### `calendar` day view — grid pattern

| Key                          | Effect                                                       | Focus after                                     |
| ---------------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| `ArrowUp` / `ArrowDown`      | Same weekday, previous / next week.                          | that day; pages the month when it leaves        |
| `ArrowLeft` / `ArrowRight`   | Previous / next day, mirrored under `dir="rtl"`.             | that day                                        |
| `Home` / `End`               | First / last day of the displayed week.                      | that day                                        |
| `PageUp` / `PageDown`        | Previous / next month, same day number, clamped to the last. | that day                                        |
| `Shift` + `PageUp`/`PageDown`| The same month a year back / forward.                        | that day                                        |
| `Enter` / `Space`            | Selects the focused date.                                    | unchanged, or the trigger inside `date-picker`  |

An unavailable date is focusable and not selectable — `aria-disabled`, never
`disabled` — so the reader can read why it is out and arrow past it.

### `calendar` month and year views

The same keys, over a four-column grid: `ArrowUp`/`ArrowDown` moves four,
`PageUp`/`PageDown` moves a year in the month view and ten years in the year
view. `Escape` from either goes back down a view rather than out of the
component, and `date-picker` therefore does not see the key until the calendar
is in its day view — which is the staging the briefing already records for
`dismissable-layer`: the family simply does not call `setOpen`.

### `date-picker`

| Key                    | Effect                                                     |
| ---------------------- | ---------------------------------------------------------- |
| `Alt` + `ArrowDown`    | Opens the popup from the field.                            |
| `Escape`               | Closes, and returns focus to the trigger.                  |
| `Tab`                  | Contained inside the popup while it is open.               |

Angular Material records the platform note this inherits: ChromeOS turns
`Alt`+`ArrowDown` into `PageDown` before the browser sees it. The trigger button
is therefore the guaranteed path and the chord is a shortcut, never the only
way in.

### Roving focus

`calendar` uses `createRovingTabindex` from `@slotted/core/focus` for the one
cell in the tab sequence, and its own two-dimensional movement rather than
`moveIndex` from `collection`: a month grid moves by seven and pages by a
calendar month, and neither is an index arithmetic.

---

## 6. Composition, and what the overlay is made of

`date-picker` composes `presence`, `portal`, `positioner`, `dismissable-layer`
and `focus` from `packages/core`, as the briefing requires, and rewrites none of
them. On a coarse pointer below the width where a popover fits, the content
takes the sheet presentation §2.7 of the feature guide asks for; that is a
container-query and `pointer: coarse` decision in the stylesheet, and the DOM
does not change.

---

## 7. Integration — React

| Question                                                          | Answered by                                                                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request with a reason?    | Each row of §4, through `createControllable` from `@slotted/core/state`.                                       |
| Application-wide defaults?                                        | `DateFieldDefaults`, `CalendarDefaults`, `DatePickerDefaults` providers, and a hook each, following `text-field-defaults.tsx`. They carry `locale`, `timeZone`, `firstDayOfWeek`, `yearPivot` and every label. |
| Substitute the rendered element of each part?                     | `render` on every part listed in §3.                                                                          |
| Consumer's handler still runs?                                    | Composed: the consumer's `onKeyDown`, `onClick`, `onPaste` and `onBlur` run before the family acts, as `text-field.tsx` does with `onChange`. |
| Native element and imperative action?                             | `ref` on every part; a handle with `focus()`, `open()`, `close()` and `focusDate()`.                          |
| Server render without a mismatch?                                 | `useId` for every relation. Nothing reads layout during render. `today` is resolved in an effect, not in the render, because a server and a browser in different zones disagree about it. |
| Every state a consumer may style in the DOM?                      | §8 below.                                                                                                     |
| Native props type?                                                | `ComponentPropsWithRef<'div' \| 'button' \| 'table' \| 'td'>` per part, extended, never a subset.             |

## 8. Integration — Angular

| Question                                                | Answered by                                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form?                       | `input()` for the controlled value, `output<ChangeRequest<…>>()` for the request. No `model()`: one slot cannot carry a reason, a previous value and `cancel()`. `text-field-input.ts` records the same decision. |
| Reactive Forms and template forms?                      | `ControlValueAccessor` on `SlDateFieldInput` and on `SlDatePicker`, plus `Validator` for `min`, `max` and `isDateUnavailable`, which is validity the family owns and no other validator can see. |
| Application-wide defaults?                              | An injection token and `provideDateFieldDefaults()`, `provideCalendarDefaults()`, `provideDatePickerDefaults()`. |
| Template reaches the instance?                          | `exportAs` on every directive and component.                                                                    |
| Substitute projected content, kept lazy?               | Named `ng-content` slots for `start`, `end`, `presets` and `footer`; `NgTemplateOutlet` for the day cell, which is re-rendered per page. |
| Zoneless and `OnPush`?                                  | Signals throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`.                                        |
| Every subscription torn down?                           | `DestroyRef` for the layer, the positioner and the announcer.                                                    |
| A static attribute survives the host bindings?          | `HostAttributeToken` for `id`, `aria-describedby`, `aria-label`, `aria-invalid`, `aria-required`, `readonly`, and `data-part` where `date-picker` puts its trigger on another family's part — the erasure the briefing records for `menu`. |
| Single class per entry point?                           | `@slotted/angular/date-field`, `/calendar`, `/date-picker`; `date-picker` imports the other two through their public entry points only. |

The asymmetry, recorded rather than levelled: Angular ships `Validator` and
React does not, because React has no equivalent integration point. React ships
`render` on twenty parts and Angular ships four projection slots and one
template outlet, because a directive cannot render a box around its own host.

## 9. States in the DOM

| Attribute            | On                | Means                                                     |
| -------------------- | ----------------- | --------------------------------------------------------- |
| `data-disabled`      | root, cell, segment | Not operable.                                            |
| `data-readonly`      | root              | Readable, not changeable.                                 |
| `data-invalid`       | root              | Fails a rule; retargets the focus ring.                   |
| `data-required`      | root              |                                                           |
| `data-selected`      | cell              | The chosen date, or a date inside the chosen range.       |
| `data-open`          | `date-picker` root| The popup is showing.                                     |
| `data-today`         | `day`             | Today, as a mark the reader sees apart from selection.    |
| `data-outside-month` | cell              | A day from the adjacent month.                            |
| `data-unavailable`   | cell              | Refused by the predicate.                                 |
| `data-range-start` / `data-range-end` / `data-in-range` | cell | The three parts of a range. |

`data-today`, `data-outside-month`, `data-unavailable` and the three range
attributes are family attributes rather than entries in the shared state
vocabulary: none of them is a state a consumer's control can be in, and adding
six words to `STATE_ATTRIBUTES` for one family would put a calendar's grammar
into every other family's schema. `data-selected` is the shared vocabulary's,
and it carries the meaning the vocabulary already has.

`current` is a capability here and not a state. The date the reader is on is
the cell holding the roving `tabindex`, and focus is already what says so;
writing `data-current` beside it would be a second, weaker copy of the same
fact. Today is not where the reader is, so it takes an attribute of its own.

## 10. What this costs

- A non-Gregorian calendar is not available until a later wave adds values to
  the `calendar` axis. A product shipping to Thailand or Saudi Arabia in a
  local calendar cannot use these families today, and the axis is what keeps
  that from being a contract break when it lands.
- The arithmetic is this library's rather than a well-tested dependency's. The
  test file is the mitigation and it is not free: leap years, the Gregorian
  proleptic boundary, the ISO week rule at a year boundary, and the clamped
  step in both directions are all cases the module has to hold itself.
- `date-picker` renders two other families' parts, so a contract change in
  either is a change here. That is the price of composing rather than
  duplicating, and it is the price `select` and `combobox` already pay.

---

## 11. Where time, datetime and a range go

Asked at the visual gate, answered here so no later family has to decide it
twice.

| Family              | Wave | What it is                                                        | Value                        |
| ------------------- | ---- | ----------------------------------------------------------------- | ---------------------------- |
| `date-field`        | 7    | A segmented date.                                                 | `PlainDate`                  |
| `calendar`          | 7    | A month grid.                                                     | `PlainDate`, a set, or a run |
| `date-picker`       | 7    | The two of them, behind a trigger.                                | `PlainDate`                  |
| `time-field`        | 8    | The same segmented control, with hour, minute and second fields.  | `PlainTime`                  |
| `time-picker`       | 8    | `time-field` and a panel of times behind a trigger.               | `PlainTime`                  |
| `datetime-field`    | 8    | `date-field` and `time-field` in one frame, one group, one value. | `PlainDateTime`              |
| `datetime-picker`   | 8    | `datetime-field`, a calendar and a time panel behind one trigger. | `PlainDateTime`              |
| `date-range-picker` | 8    | Two fields and the calendar's own `range` mode behind a trigger.  | a run of `PlainDate`         |

**The segment engine already takes them.** `packages/core/src/date/segments.ts`
knows nothing about what a field means: it steps a number inside a range, wraps
it, takes typed digits and ends a run when no further digit fits. `fieldRange`
is the only place the three date fields are named, and `DateFieldName` is a
union of three strings today because wave 7 has three fields — not because the
engine has three. Adding hour, minute and second is a wider union and three
rows in that function.

**Three value types, and no fourth.** `PlainTime` is `{ hour, minute, second }`
and `PlainDateTime` is a `PlainDate` beside a `PlainTime`. A zoned instant is
deliberately not one of them: it is the type every surveyed implementation gets
wrong at a daylight boundary, and a library that holds one owes an answer for
the hour that happens twice and the hour that never happens. What this library
holds is the wall-clock value the reader typed; converting it to an instant is
the application's, against the zone the application knows.

**`time-picker` is not a calendar.** The panel behind it is a list of times at
the step the consumer set, which is `listbox` rather than `grid`, so it composes
`select`'s machinery and not this family's. `datetime-picker` is the one family
that holds both surfaces, and the decision it owes is which one opens first.

## 12. The brief for wave 8

Recorded from the reviewer at the visual gate: the date, time and datetime
families are to be **more inventive** than the surveyed field, where the
interface is worth improving rather than matching.

The three openings this session found and did not take, because each is a
family wave 8 owns:

- **A time is a duration from something.** Every surveyed time picker offers a
  list of instants and leaves "forty minutes from now" to the reader's
  arithmetic. A field that accepts a relative expression — and shows what it
  resolved to before committing — is the one thing a booking flow asks for and
  none of them ships.
- **A range has a length, and the length is what the reader is choosing.** Six
  of the seven draw two dates and never the number between them. A range that
  says "4 nights" while it is being drawn is answering the reader's actual
  question.
- **A calendar knows what is in it.** A day cell that can carry a density mark
  — how full, how expensive, how busy — turns a picker into the view a product
  already draws by hand beside it. `calendar` ships the `data-*` hook for it in
  wave 7 and draws nothing; the mark is wave 8's.
