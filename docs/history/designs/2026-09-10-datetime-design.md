# Datetime field and datetime picker design

Written before either family was coded, as
`.claude/skills/component/references/frameworks.md` and step 5 of
`.claude/skills/component/skill.md` require. It records the decisions and what
each one costs; the inventory that produced them is
`docs/history/designs/2026-09-10-datetime-capability-inventory.md`.

Wave 7 answered where these two families sit, in
`docs/history/designs/2026-09-09-date-design.md` §11, and the previous session
widened the segment engine for them, in
`docs/history/designs/2026-09-10-time-design.md` §1. Neither is reopened here.

---

## 1. Where the arithmetic lives

`packages/core/src/date`, under the entry point `@slotted/core/date` that
already exists. Nothing is added to `packages/core/package.json` or
`packages/core/vite.config.ts`, and nothing enters the `src/index.ts` barrel.

Three changes, two of them new files.

| Module                     | Holds                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `plain-date-time.ts` (new) | `PlainDateTime`, its comparison, its bounds, its ISO shape, and the projection of a bound onto one day.             |
| `datetime-format.ts` (new) | One datetime, in one locale: the combined pattern, the parser, and the whole value in words.                        |
| `duration.ts` (changed)    | Two more unit letters, `d` and `w`, and the resolution of an expression against a whole datetime.                   |

### `PlainDateTime` is nested, and the halves keep their own names

```ts
interface PlainDateTime {
  readonly date: PlainDate;
  readonly time: PlainTime;
}
```

Not six flat fields. Every function the two halves already have — `addDays`,
`clampDate`, `compareDate`, `daysInMonth`, `secondsOfDay`, `addSeconds`,
`isTimeInRange` — applies to `value.date` or `value.time` unchanged, and the
picker hands each half to the surface that owns it without projecting anything.
A flat shape would need a projection at every call site and would invite a
second copy of arithmetic that already exists twice over.

**Cost.** `Temporal.PlainDateTime` is flat, so a consumer converting to it
writes `{ ...value.date, ...value.time }`. One line, and it is on the reference
page.

### The format pipeline is combined, not concatenated

`createDateTimeFormat` asks `Intl.DateTimeFormat` for both halves at once and
reads `formatToParts`. That is the only way to learn three things a pair of
separate formatters cannot say: the order of the two halves, which `ja-JP`
writes as `2026/09/10 15:20` and some locales invert; the literal between them,
which `pt-BR`, `en-US` and `de-DE` write as `, `, `fr-FR`, `ja-JP` and `zh-CN`
write as a bare space, and `ko-KR` writes as the full stop its own date form
ends with; and whether the day period lands after the time or before the hour.

`format.ts` and `time-format.ts` are not touched. `datetime-format.ts` builds
its own pattern from the combined parts and delegates every per-field question —
widths, digits, day-period names, the display hour, the two parsers — to the two
formats it holds.

### The expression gains days and weeks

`duration.ts` widens **additively**, exactly as `segments.ts` did: `TOKEN`
accepts `d` and `w` beside `h`, `m` and `s`, `SECONDS` and `ORDER` gain two
rows, and `NEXT_DOWN` gains `w → d` and `d → h`. Every existing call compiles
unchanged, `parseDuration('+40m')` answers what it answered, and `time-field`'s
grammar is a subset it already refuses to exceed — a `d` typed into a
`time-field` was refused before this change and is refused after it, because
`time-field` states its own unit set.

`resolveRelativeDateTime(anchor, seconds)` is the new entry: it adds the seconds
to the time, takes the `days` that `addSeconds` already reports, and adds them
to the date. **This is where `crossesMidnight` is spent.** `time-field` raises
the flag because a `PlainTime` has no day beside it and the request is the only
place the fact can be said; here the day exists, so the crossing is not a flag,
it is the value.

**Cost.** The datetime request therefore does **not** carry `crossesMidnight`.
A consumer migrating a handler from `time-field` finds the property gone and
the answer already applied.

---

## 2. `datetime-field`

### One group, one row, one state

The field draws its own row of segments from the shared engine. It does not
nest a `date-field` and a `time-field`.

Three reasons, and each is a thing the nested arrangement cannot do:

- **One `role="group"` and one value.** Two nested family roots are two groups,
  two values and two `SegmentState`s, and "the reader is typing" becomes two
  questions with two answers. The previous session widened one `SegmentState` to
  seven fields precisely so this family would need only one.
- **One pattern.** The order of the halves and the literal between them come
  from one combined formatter. Two independent fields cannot learn either.
- **One run of typing.** A digit that fills the last date segment advances into
  the first time segment, and `ArrowRight` walks from the day into the hour.
  Across two roots, both stop at the boundary.

**Cost.** The row's markup and its key handling are written a third time, once
per binding. What is not written a third time is everything below the markup:
the pattern, the digits, the placeholders, the stepping, the wrapping, the held
day, the year pivot, the hour cycle, the day-period names and the relative
parser all live in `@slotted/core/date` and are called, not copied.

### Anatomy

| Part           | Element  | Always | For                                                                     |
| -------------- | -------- | ------ | ------------------------------------------------------------------------- |
| `root`         | `div`    | yes    | The frame. Carries `data-ui`, the axes and the states.                  |
| `segments`     | `div`    | yes    | `role="group"`, the thing that tells a reader the parts are one value.  |
| `half`         | `span`   | yes    | One half, and the only place the row is allowed to break.               |
| `segment`      | `div`    | yes    | One `role="spinbutton"` per field, in the locale's order.               |
| `literal`      | `span`   | yes    | The separator the locale writes, `aria-hidden`.                         |
| `duration`     | `input`  | no     | The relative expression, while one is being written.                    |
| `preview`      | `span`   | no     | What the expression resolves to. A polite live region.                  |
| `preview-date` | `span`   | no     | The date half of the preview, when the expression moved the day.        |
| `value-text`   | `span`   | yes    | The whole datetime in words, hidden, naming the group.                  |
| `start`, `end` | `span`   | no     | The consumer's own slots.                                               |
| `clear`        | `button` | no     | Empties both halves and returns focus to the first segment.             |
| `hidden-input` | `input`  | yes    | `YYYY-MM-DDTHH:mm:ss`, which is `input[type=datetime-local]`'s own.     |

The frame is not the control: `data-ui` sits on a `div` with no role, and
`role="group"` sits on the row of segments. That is the arrangement the APG's
spin-button example names and the one both sibling fields already ship.

### The two halves are one row, and the row wraps between them

Each half is one box carrying `data-half="date"` or `data-half="time"`, and the
row is a wrapping flex row of exactly two items. The boundary has to be a box
rather than a rule: flexbox breaks a line between any two items and offers no
way to forbid one place. The row wraps at every width rather than under a
container query, so no locale, granularity or size can overflow the frame and
no threshold has to guess where the content stops fitting.

The literal the locale writes between the halves — a comma in `pt-BR`, `en-US`
and `de-DE`, a bare space in `fr-FR`, `ja-JP` and `zh-CN` — sits at the end of
the *first* half and carries `data-boundary`, so
a wrap leaves it at the end of its line the way a comma in a sentence goes. A
boundary the locale writes as whitespace is not drawn at all, and the row's own
column gap separates the halves instead.

Nothing is clipped and nothing is removed — the rule `calendar` already states
for a month that stops fitting.

A locale that writes the time before the date wraps at the same boundary,
because the boundary is where the two halves meet and not where the date ends.

### The missing half is said out loud

`value` is `null` until both halves are whole, which is what every surveyed
implementation reports. What none of them can report is **which** half is
missing, and this family reports it three times over:

- `data-incomplete="date"` or `data-incomplete="time"` on the root, while some
  segment is written and the value is not whole;
- `segments` on the request, carrying all seven fields;
- `dateTimeIncomplete` from the Angular validator, beside `dateTimeParse`.

`data-incomplete` is absent when the field is empty. An empty field is not an
incomplete one, and a stylesheet that painted both the same would mark every
untouched form.

### The relative expression

Inherited from `time-field` whole, and widened by its two new units.

| Written    | Read as                        |
| ---------- | ------------------------------ |
| `+40`      | 40 minutes from now            |
| `+40m`     | the same                       |
| `2h`       | 2 hours from now               |
| `+2d`      | 2 days from now, same time     |
| `+1w`      | 7 days from now, same time     |
| `1d6h`     | a day and six hours from now   |
| `-15`      | 15 minutes ago                 |
| `0` or `=` | now                            |

The anchor is always now, never the value the field holds — one rule, stated
once, and `referenceDateTime` states it explicitly for a story and a test. The
preview names the whole resolved datetime, and names the date only when it
differs from today, so `+40m` reads `15:20` and `+2d` reads `12 Sep, 14:40`.

`relative={false}` removes the mode. Every value it can write is reachable by
typing the segments and by the arrow keys, so a reader who never discovers `+`
loses a shortcut and no capability.

### Keyboard

The spin-button pattern, read at
<https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/> on 10 September 2026, and
transcribed key by key in `time-field`'s contract. Every row is inherited
unchanged; three are widened.

| Key                | Here                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `ArrowUp`/`Down`   | Steps the segment by one, wrapping inside it.                                            |
| `Home`/`End`       | The segment's minimum or maximum.                                                        |
| `PageUp`/`Down`    | Year 10, month 5, day 5, hour 3, minute 15, second 15, day period 1.                     |
| printable          | Digits in every numeric field; the two name letters in the day period.                   |
| `ArrowRight`/`Left`| The next or previous segment in writing order, **across the two halves**.                |
| `Backspace`/`Del`  | Empties the segment.                                                                     |
| `+`, `-`, `=`      | Opens the relative expression.                                                           |

**The widened rows, and their cost.** The page steps are the two siblings' own,
taken unchanged: year 10, month 5 and day 5 from `date-field`, hour 3, minute
15, second 15 and day period 1 from `time-field`. Two fields drawing the same
segment and paging it differently would be one behaviour with two answers.

What remains is a disagreement with `calendar`, which pages by the month it
draws rather than by a unit: `PageDown` on a day segment moves five days and
`PageDown` in the grid moves a month. A segment pages by its own unit and a grid
pages by what it draws, and neither is the only way to either value. The cost is
a reader who learns one page step in the field and meets another in the panel.

Everything else is `time-field`'s table, including the rule that a key the field
acts on is stopped rather than only defaulted, for the reason `date-field`
recorded: a single-key shortcut guard tests for `input`, `textarea` and
`contenteditable`, and a `div` with `role="spinbutton"` is none of the three.

---

## 3. `datetime-picker`

### One dialog, two surfaces, and neither is hidden

The panel is one layer carrying `role="dialog"`, the role the APG's own Date
Picker Combobox example gives its popup — read at
<https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/>
on 10 September 2026. Inside it sit a `grid`, which is `calendar`, and a
`listbox`, which is the list of times. Both are always in the DOM.

Two arrangements were considered and one was refused.

- **Tabs, one surface at a time.** Kendo's popup and MUI's mobile picker both
  do it. Refused because the arrangement would have to change with the
  container width, and a `tablist` that exists on a narrow screen and not on a
  wide one tells assistive technology two different stories about the same
  component. The DOM does not change with the width in this library; the
  stylesheet decides the presentation, which is the rule both sibling pickers
  already carry.
- **Side by side, stacking when narrow.** Taken. `panels` is a wrapping flex
  row: two tracks where there is room, one where there is not, in the value's
  own order both times.

  **No container query, and that is a decision rather than an omission.** The
  surface is shrink-wrapped from a calendar and a list and capped by the room
  the positioner measured, so it has no width of its own to ask about;
  `container-type: inline-size` would give it one by making its inline size
  independent of its contents, which is the opposite of what a panel sized to a
  calendar needs. The briefing's two-element split answers a family whose query
  changes its own grid — the answer here is to need no query, which is the same
  technique `datetime-field` uses on its halves and the reflow-by-proportion
  `calendar` already states.

  `openTo` therefore paints nothing. The reading order of the two surfaces is
  the value's own in every configuration, and moving a whole calendar because
  focus starts elsewhere would make one setting look like a different
  component. What answers the narrow case is `scrollIntoView` on the surface
  focus lands in — the call the list already makes on every highlight move.

**Cost.** Stacked, the panel is tall, and in the sheet presentation the reader
scrolls from the calendar to the list. The list is shortened there — fewer
visible rows, in the stylesheet — and nothing is removed. The alternative cost
was a lie to a screen reader in one of the two arrangements.

### Anatomy

| Part          | Element  | Always | For                                                                    |
| ------------- | -------- | ------ | ------------------------------------------------------------------------ |
| `root`        | `div`    | yes    | The frame.                                                             |
| `control`     | `div`    | yes    | The field and the trigger, and the box the positioner measures.        |
| `trigger`     | `button` | yes    | Opens the panel. Its name carries the chosen datetime.                 |
| `positioner`  | `div`    | no     | The layer, portalled. Carries `data-ui` too, as `select` does.         |
| `content`     | `div`    | no     | `role="dialog"`. The surface.                                          |
| `panels`      | `div`    | no     | The two tracks, as a wrapping flex row.                                |
| `date-panel`  | `div`    | no     | Holds `calendar`. It names itself; nothing is drawn over it.           |
| `time-panel`  | `div`    | no     | Holds the list. It names itself too.                                   |
| `head`        | `div`    | no     | The band: what the reader has so far, `now`, and the consumer's presets.|
| `head-value`  | `span`   | no     | The value as it stands, with the missing half as its placeholder.      |
| `now`         | `button` | no     | Writes the current datetime, both halves.                              |
| `presets`     | `div`    | no     | The consumer's own shortcuts.                                          |
| `list`        | `div`    | no     | `role="listbox"`, the rows, and the only thing that scrolls.           |
| `option`      | `div`    | no     | `role="option"`, one whole time on the day the reader is on.           |
| `empty`       | `div`    | no     | Drawn when the day offers no time at all.                              |
| `footer`      | `div`    | no     | The consumer's own actions.                                            |

The picker composes `datetime-field` and `calendar` and redraws neither. It owns
the control box, the trigger in the field's `end` slot, the layer, and the list.

### The head band, and why the surfaces carry no labels

The two surfaces were labelled `Data` and `Hora`, each with a mark, and both
were decoration: a month grid is a date and a column of times is times, which is
why none of the four surveyed panels labels either — and a mark small enough to
sit in a line of eleven-pixel text is a mark nobody can read. Withdrawn on the
reviewer's reading at the visual gate.

What the head says instead is the one thing neither surface can show: **what the
reader has chosen so far**, with the half they have not written drawn as its
placeholder beside the half they have. A reader who chose a day and is now
reading a column of times otherwise has nothing telling them which day those
times belong to, and no surveyed panel says it at all. The rule under the band
is what makes it a band rather than a line of text floating over two columns.

**The band renders at the panel's width and contributes nothing to it.** A grid
track sizes to the widest thing in it, so a row of the consumer's own shortcuts
stretched the whole panel and the column of times with it. `inline-size: 0` takes
the band out of that measurement and `min-inline-size: 100%` puts it back at the
track's own width, so the two surfaces decide how wide the panel is and the band
wraps inside whatever they decide. The `footer` carries the same pair, for the
same reason.

**The two marks, and no third.** They sit on the two controls that do something
with them: `--slotted-icon-calendar` on the trigger, which is the mark
`input[type=datetime-local]` draws for the same control, and
`--slotted-icon-clock` on `now`, at the control glyph size, because that is the
control that writes a time. No glyph is added to the scale.

### Focus follows the missing half

This is the decision the family owes, and it is one sentence:

> **The press that leaves the value incomplete carries focus to the half that is
> missing. The press that completes the value closes the panel.**

It answers both halves of the question — which surface opens first, and what
happens to the other when the reader finishes the first.

| Situation                                        | What happens                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Panel opens, nothing chosen                      | Focus lands where `openTo` says, defaulting to the calendar.           |
| A day is pressed, the time half is empty         | Focus moves to the list, onto the option nearest `referenceDateTime`.  |
| A time is pressed, the date half is empty        | Focus moves to the calendar, onto the day it has focused.              |
| The press made the value whole                   | The panel closes and focus returns to the trigger.                     |
| The value was already whole                      | The panel stays open and focus stays where the reader put it.          |

The last row is the one no surveyed implementation gets right. Ant adds a
confirm button under `showTime` and Kendo adds Set, both because a day pressed
in a calendar is not a whole datetime. Neither is needed once the value's own
completeness is the rule — and a reader who opened a filled field to change
both halves is not shut out by their first press.

`closeOnSelect` states it as an axis: `auto` is the rule above, `always` closes
on any press that changes the value, `never` closes on nothing. The `footer`
slot still takes a consumer's own button, and `Escape`, an outside press and the
trigger always close.

### The list answers the day the reader is on

The times offered are computed against `value.date` when the value has a date
half, and against the calendar's focused day when it does not. Arrowing across a
day whose window is closed empties the list and draws the empty state, while the
reader is still deciding. Ant recomputes `disabledTime(date)` only for a date
already committed, so its panel cannot say this.

### Two bounds, and the day they meet on

`min` and `max` bound the whole value. `minTime` and `maxTime` bound the time on
every day. **Both apply**, which MUI's own validation page says it cannot do:
"you cannot use `maxDateTime` and `maxTime` together. `maxDateTime` will
override the `maxTime` behavior."

For the day `d`, the list runs between:

```
earliest = max(minTime ?? 00:00:00,  d equals min.date ? min.time : 00:00:00)
latest   = min(maxTime ?? 23:59:59,  d equals max.date ? max.time : 23:59:59)
```

which is the platform's own rule, stated by MDN for `input[type=datetime-local]`
and implemented by none of the surveyed scripts: "the time of day is only
constrained on the first and last dates in the range." A day before `min.date`
or after `max.date` is refused whole, and the calendar greys it.

`isDateUnavailable(date)` answers a whole day and feeds the calendar.
`isTimeUnavailable(time, date)` answers one time on one day and feeds the list.
Two predicates and not one, because a day-level answer cannot be derived from a
datetime-level predicate without probing every step of that day.

A held value outside the bounds is reported `invalid` and is not moved. Safari
clamps on selection, which MDN records; a value the reader wrote is not the
family's to rewrite.

### The step, and what it counts from

`step` in seconds, defaulting to 900, with the base rule `time-picker` states:
`min`'s time when `min` is stated, midnight when it is not. `options` states an
irregular list outright, and `maxOptions` caps the length at 1440. All four are
`time-picker`'s, unchanged, because the list is the same list on a known day.

The panel's step is not the field's arrows, for the reason `time-picker`
records: a minute arrow moving fifteen at a time would put `:07` out of reach,
and the field's promise is that every value is reachable there.

### Keyboard

| Key                            | Where            | Effect                                                                  |
| ------------------------------ | ---------------- | ------------------------------------------------------------------------- |
| `Alt`+`ArrowDown`              | a segment        | Opens the panel; focus stays in the field and typing keeps working.     |
| `Enter`, `Space`, `ArrowDown`  | the trigger      | Opens the panel and moves focus to the surface `openTo` names.          |
| the grid pattern's own keys    | the calendar     | `calendar`'s, unchanged, including the three views.                     |
| `ArrowUp`, `ArrowDown`         | the list         | The previous or next option.                                            |
| `Home`, `End`                  | the list         | The first or last option.                                               |
| `PageUp`, `PageDown`           | the list         | The first option of the previous or next hour.                          |
| digits                         | the list         | Type-ahead, through `@slotted/core/typeahead`.                          |
| `Enter`, `Space`               | an option        | Selects it; then the rule in _Focus follows the missing half_.           |
| `Tab`                          | while open       | Between the two surfaces and the footer, contained inside the layer.    |
| `Escape`                       | anywhere open    | The calendar's view first, then the panel; focus returns to the trigger. |

Read at <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/> and
<https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/>
on 10 September 2026. The dialog example's own Tab rule is taken whole: only one
element of the grid is in the Tab sequence, which the Grid Pattern requires and
`calendar` already implements, so the two surfaces are two Tab stops rather than
forty-three.

`Escape` is staged the way the briefing describes. `dismissable-layer` asks in
the capture phase, so the family decides there: while the calendar shows its
month or year view, the view walks down and the panel is not asked to close;
while an expression is open in the field, the expression is abandoned and the
panel stays.

`Alt`+`ArrowDown` carries the platform note both siblings record: ChromeOS turns
it into `PageDown` before the browser sees it, so the trigger is always drawn
and the chord is a shortcut rather than the only way in.

### Selection does not follow focus

Moving the highlight does not move the value; `Enter`, `Space` and a press do.
`time-picker`'s reason holds unchanged: the APG lists it as optional and warns
it can degrade accessibility, and here a reader arrowing through ninety-six
options would emit ninety-six requests.

---

## 4. State

| Value           | Controlled    | Uncontrolled         | Request                | Reasons                                                             |
| --------------- | ------------- | -------------------- | ---------------------- | --------------------------------------------------------------------- |
| the datetime    | `value`       | `defaultValue`       | `onValueChange`        | `keyboard`, `pointer`, `select`, `clear`, `blur`, `programmatic`    |
| the panel       | `open`        | `defaultOpen`        | `onOpenChange`         | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`           |
| where the reader is | `highlighted` | `defaultHighlighted` | `onHighlightedChange` | `pointer`, `keyboard`, `programmatic`                              |

**One highlight, not two.** A two-surface panel has one answer to "where is the
reader", and it is a datetime: the day the calendar has focused beside the time
the list has highlighted. `highlighted` is `{ date, time }` with a `null` time
while the list is empty, the calendar receives `highlighted.date` as its
`focusedDate`, and the list receives `highlighted.time`. Two models would be two
names for one place, and the contract schema holds one `current` capability for
exactly this reason.

The request carries the value, the value it replaces, the segments, the reason
and the originating event. It does **not** carry `crossesMidnight`: the flag
exists in `time-field` because a `PlainTime` has no day, and here the crossing
is already in the value.

The segments always commit and the value is always a request. A run of digits
moves the display without moving the value: typing `2` then `3` into an hour
passes through `2`, which is a time the arithmetic accepts and nobody meant.

---

## 5. States in the DOM

`default`, `hover`, `active`, `focus-visible`, `disabled`, `invalid`,
`readonly`, `required` on both families, and `open`, `selected` and `current` on
the picker. Precedence is `STATE_PRECEDENCE`, unchanged, with the guard
`time-picker` records: every weaker rule carries a `:not()` for each stronger
state it can meet, because specificity rather than source order decides.

| Attribute            | On             | Says                                                          |
| -------------------- | -------------- | --------------------------------------------------------------- |
| `data-field`         | `segment`      | Which of the seven fields it holds.                           |
| `data-half`          | `segment`      | `date` or `time`, and where the row may wrap.                 |
| `data-placeholder`   | `segment`      | It has no value and is drawing its placeholder.               |
| `data-incomplete`    | `root`         | `date` or `time` — the half that is missing.                  |
| `data-cycle`         | `root`         | `12` or `24`.                                                 |
| `data-granularity`   | `root`         | `hour`, `minute` or `second`.                                 |
| `data-relative`      | `root`         | An expression is open in place of the segments.               |
| `data-resolved`      | `preview`      | The preview holds a datetime the expression resolves to.      |
| `data-rolls-day`     | `preview`      | The expression resolved onto a different day.                 |
| `data-current`       | `option`       | The highlight.                                                |
| `data-selected`      | `option`       | The chosen value.                                             |
| `data-truncated`     | `list`         | The list stops short of the configuration, at `maxOptions`.   |
| `data-placement`     | `positioner`   | The side and alignment the positioner resolved.               |
| `data-presentation`  | `positioner`   | `popover` or `sheet`.                                         |
| `data-open-to`       | `content`      | Which surface the panel opened focus on. It paints nothing.   |

---

## 6. Integration — React

Every line of the table in `references/frameworks.md`, answered.

| Question                                                       | Answer                                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request with a reason  | `value` / `defaultValue` / `onValueChange(value, request)` on both; `open` / `defaultOpen` / `onOpenChange` and `highlighted` / `defaultHighlighted` / `onHighlightedChange` on the picker.                                                |
| Defaults set once for the whole application                     | `DateTimeFieldDefaultsProvider` with `useDateTimeFieldDefaults`, and the same pair for the picker. Locale, time zone, hour cycle, granularity, step, size, variant, placement, `openTo`, `closeOnSelect`, `maxOptions` and every label.    |
| Substituting the rendered element of each public part           | `render` on the root of both. The option's content is `renderOption`; the day cell's content stays `calendar`'s own slot.                                                                                                                  |
| The consumer's own handler still runs                           | `onKeyDown`, `onPaste` and `onClick` are called first, and the family stands down when `defaultPrevented` is set.                                                                                                                          |
| Reaching the native element and the imperative action           | `ref` gives `DateTimeFieldHandle` — `focus()`, `clear()`, `activeField` — and `DateTimePickerHandle` — `focus()`, `open()`, `close()`.                                                                                                     |
| Server render without a hydration mismatch                      | `useId` for every identifier; now is read in an effect, never during render, exactly as both siblings do.                                                                                                                                  |
| Every state a consumer may style, in the DOM                    | The `data-*` vocabulary in §5, written by the contract test.                                                                                                                                                                              |
| Part props typed as the native element's, extended              | `ComponentPropsWithRef<'div'>` on both roots, with `defaultValue`, `onChange` and `ref` replaced.                                                                                                                                          |

## 7. Integration — Angular

| Question                                                     | Answer                                                                                                                                                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form the ecosystem expects       | `model()` for `value`, `open` and `highlighted`; `output()` for the requests carrying a reason.                                                                                                                                    |
| Reactive Forms and template forms                            | `ControlValueAccessor` on both and `Validator` on both: `dateTimeParse`, `dateTimeIncomplete`, `dateTimeMin`, `dateTimeMax`, `dateTimeUnavailable`. Kendo is the only surveyed implementation that validates, and it reports three. |
| Defaults set once                                            | `SLOTTED_DATE_TIME_FIELD_DEFAULTS` and `provideDateTimeFieldDefaults()`, and the same pair for the picker.                                                                                                                          |
| A template reaching the instance                             | `exportAs: 'slDateTimeField'` and `exportAs: 'slDateTimePicker'`.                                                                                                                                                                  |
| Substituting projected content, kept lazy                    | Named `ng-content` slots for `start`, `end`, `presets` and `footer`; `NgTemplateOutlet` for the option's content, because it is re-rendered per option.                                                                             |
| Zoneless change detection and `OnPush`                       | Signals throughout, `computed` for every derived value, and no `markForCheck`.                                                                                                                                                     |
| Every subscription and listener torn down                    | `DestroyRef` for the layer, the positioner and the media query; `takeUntilDestroyed` for the form control's stream.                                                                                                                 |
| A static attribute the consumer wrote surviving the host     | Read with `HostAttributeToken` before the host binding writes over it, which is the rule `menu` recorded and `toolbar` paid for.                                                                                                    |
| An entry point others depend on staying a single class       | `@slotted/angular/datetime-field` and `@slotted/angular/datetime-picker`; the picker imports the field and the calendar only through their entry points.                                                                            |

## 8. Both

The consumer's explicit value wins over the field around it, over the provider
and over anything derived. The platform is preferred where it reaches:
`input[type=datetime-local]` is refused for the reason both siblings refuse
their own native input — it cannot be styled past its closed state, its panel is
drawn by the operating system and answers no scheme, no density and no
direction, and its field order is the browser's locale rather than the
application's. The cost is the whole key table and the whole panel, and a hidden
input carrying `YYYY-MM-DDTHH:mm:ss` so a plain form post still works.

---

## 9. What this costs, and what is deferred

| Decision                                       | Cost                                                                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `PlainDateTime` is nested                      | A consumer converting to `Temporal.PlainDateTime` spreads two halves. One line, documented.                                       |
| The field draws its own row                    | The markup and the key handling are written a third time per binding. Everything below the markup is called from `@slotted/core/date`. |
| Two predicates rather than one                 | A consumer refusing a whole day writes it twice if their rule is really about times. The alternative was probing 1440 times per cell. |
| `min`/`max` and `minTime`/`maxTime` together   | Four bounds to explain instead of two, and a projection rule the reference page has to state. It is the capability MUI declines.  |
| Both surfaces always present                   | A tall panel when the container is narrow, and a scroll in the sheet. The alternative was a `tablist` whose membership depended on the viewport. |
| Completeness closes the panel                  | A reader editing a whole value closes the panel themselves, through `Escape`, an outside press or the trigger. Ant and Kendo spend a button on this instead. |
| The segment page steps are the siblings'       | They disagree with `calendar`'s month page. Neither is the only way to either value.                                             |
| No `crossesMidnight` on the request            | A handler migrated from `time-field` finds the property gone, because the crossing is already applied to the value.               |
| `datetime-range-picker` deferred to wave 8     | A pair is a composition of a value the Core now has, which is the weighing `date-range-picker` and `time-range-picker` already carry. The line is added to `docs/process/build-order.md` wave 8. |
| Milliseconds not held                          | `PlainTime` has no field for them and one surveyed implementation offers them. A consumer needing them holds the value beside this one. |
