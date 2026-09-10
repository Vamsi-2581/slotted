# Time field and time picker design

Written before either family was coded, as
`.claude/skills/component/references/frameworks.md` and step 5 of
`.claude/skills/component/skill.md` require. It records the decisions and what
each one costs; the inventory that produced them is
`docs/superpowers/specs/2026-09-10-time-capability-inventory.md`.

Wave 7 answered where these two families sit in
`docs/superpowers/specs/2026-09-09-date-design.md` §11, and what wave 8 owes in
§12. Neither is reopened here.

---

## 1. Where the arithmetic lives

`packages/core/src/date`, beside the date arithmetic, under the entry point
`@slotted/core/date` that already exists. Nothing is added to
`packages/core/package.json` or `packages/core/vite.config.ts`, and nothing
enters the `src/index.ts` barrel: importing a button still does not pull a
clock.

Four changes, three of them new files.

| Module                | Holds                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `plain-time.ts` (new) | `PlainTime`, its arithmetic, its ISO shape, and the seconds-of-day form the panel steps in.                                |
| `time-format.ts` (new)| One time, in one locale: the pattern, the placeholders, the day-period names, the parser, and the four hour cycles.        |
| `duration.ts` (new)   | The relative expression: its grammar, its parser, and resolving one against a time.                                       |
| `segments.ts` (changed) | The entry model, widened from three fields to seven.                                                                     |

### The segment engine is widened, not copied

`segments.ts` steps a number inside a range, wraps it, takes typed digits and
ends a run when no further digit fits. It knows nothing about what a field
means, so the four time fields are a wider union and four rows in `fieldRange`.

Three signatures change, and all three change **additively**, so no call site in
`date-field` is edited by this session:

- `SegmentState` gains `hour`, `minute`, `second` and `dayPeriod`, each
  `number | null`. `EMPTY_SEGMENTS` gains four nulls, and `segmentsOf(date)`
  returns them null.
- the reference parameter becomes `SegmentReference`, which is a `PlainDate`
  with the four time fields and the hour cycle **optional**. A `PlainDate` is
  assignable to it, so every existing call compiles unchanged, and
  `reference[field]` — which is how an empty segment finds the value it steps
  from — keeps working for all seven fields.
- `fieldRange(field, context)` takes `year`, `month` and `hourCycle`, all
  optional. Without a year and a month the day's maximum is 31, which is stated
  rather than assumed; `date-field` passes both and is unaffected.

`withDayHeld` — the rule that keeps 31 across February — runs only when the
changed field is a date field. A stepped hour has no held day.

**Cost.** One `SegmentState` now describes a half-typed date, a half-typed time,
or both. That is the shape `datetime-field` needs to exist at all: two states
side by side would make "the reader is typing" two questions with two answers.
The price is four properties that are always `null` in `date-field`, which is
visible in the type a `date-field` request carries and is documented there.

### Four hour cycles, not a boolean

`Intl.DateTimeFormat.prototype.resolvedOptions().hourCycle` answers `h11`,
`h12`, `h23` or `h24`. The four are four different ranges for one segment:

| Cycle | Hour range | Written by                        |
| ----- | ---------- | --------------------------------- |
| `h11` | 0–11       | `ja-JP`, with a day period        |
| `h12` | 1–12       | `en-US`, with a day period        |
| `h23` | 0–23       | `pt-BR`, `de-DE`                  |
| `h24` | 1–24       | a small set of locales            |

The public axis stays `hourCycle: 12 | 24`, because that is the question a
consumer asks; which variant of each the locale writes is the locale's. A
consumer who states `12` in `ja-JP` gets `h11`, and the hour segment runs from
zero.

**Cost.** Four rows where React Aria has two, and one more thing a test has to
cover. The alternative is writing `12` where `ja-JP` writes `0`, which is wrong
in a way nobody notices until a Japanese reader reports it.

### The day period is a segment, and it is not typed as digits

`dayPeriod` is a spin button over a range of two, so `ArrowUp`, `ArrowDown`,
`Home` and `End` need no special case. It holds `0` or `1` and announces the
locale's own name through `aria-valuetext`, which is exactly what the spinbutton
pattern asks for when `aria-valuenow` is not user-friendly.

Digits do not apply to it. `typeDayPeriod` takes a letter and matches it against
the first letter of each of the locale's two names, which is the rule the
platform's own control uses.

---

## 2. The relative expression

The reviewer's brief for wave 8, recorded in
`2026-09-09-date-design.md` §12: a time written as a duration from now, resolved
in view before it is accepted. No surveyed implementation ships it.

### What it is

Pressing `+`, `-` or `=` on any segment replaces the segments with one
expression region — a real `input`, so a mobile keyboard opens and the platform
supplies text editing — and a preview beside it. The preview is a live region:
it names the time the expression resolves to as the reader types, before
anything commits.

```
┌──────────────────────────────┐
│ +40m              →  15:20   │
└──────────────────────────────┘
```

`Enter` commits the resolved time and the segments come back holding it.
`Escape` abandons it and the segments come back exactly as they were. Blur
behaves as the segments' own run does: it commits when the expression resolves
and abandons when it does not.

### The grammar

Symbols and unit letters, because those are what a numeric keyboard offers in
every locale. The locale's own words are not parsed, and the placeholder says
what the field takes.

| Written    | Read as                    |
| ---------- | -------------------------- |
| `+40`      | 40 minutes from now        |
| `+40m`     | the same                   |
| `-15`      | 15 minutes ago             |
| `1h30`     | 1 hour 30 minutes from now |
| `1:30`     | the same                   |
| `2h`       | 2 hours from now           |
| `90s`      | 90 seconds from now        |
| `0` or `=` | now                        |

A bare number is minutes: it is the unit a booking flow asks in, and it is what
`step` is written in everywhere else in this pair.

**The anchor is always now.** Not the value the field holds. One rule, stated
once, and it is the brief's own wording. `referenceTime` states the anchor
explicitly, which is what makes a story and a test deterministic.

### Midnight

`+90m` at `23:00` resolves to `00:30`, which is a different day — and this
library holds no day beside a `PlainTime`. The resolution is not hidden:

- the preview carries `data-crosses-midnight` and draws the marker the
  stylesheet gives it;
- the announcement names it, so a screen-reader user hears it too;
- the request carries `crossesMidnight: true`, so a consumer holding a
  `PlainDateTime` beside this field knows to add a day.

No surveyed implementation says anything at all here. `datetime-field` in the
next session is the first consumer of the flag.

### It is never the only way in

Every time the expression can write is reachable by typing the segments and by
the arrows, and the current time is one labelled control at the head of the
panel. A reader who never discovers `+` loses a shortcut and no capability.

---

## 3. Anatomy

### `time-field`

| Part           | Element  | Always | For                                                                  |
| -------------- | -------- | ------ | -------------------------------------------------------------------- |
| `root`         | `div`    | yes    | The frame. Carries `data-ui`, the axes and the states.               |
| `segments`     | `div`    | yes    | `role="group"`, the thing that tells a reader the parts are one time.|
| `segment`      | `div`    | yes    | One `role="spinbutton"` per field, in the locale's order.            |
| `literal`      | `span`   | yes    | The separator the locale writes, `aria-hidden`.                      |
| `duration`     | `input`  | no     | The relative expression, while one is being written.                 |
| `preview`      | `span`   | no     | What the expression resolves to. A polite live region.               |
| `value-text`   | `span`   | yes    | The whole time in words, hidden, naming the group.                   |
| `start`, `end` | `span`   | no     | The consumer's own slots.                                            |
| `clear`        | `button` | no     | Empties the value and returns focus to the first segment.            |
| `hidden-input` | `input`  | yes    | `HH:mm:ss` for a plain form post.                                    |

The frame is not the control: the element carrying `data-ui` is a `div` with no
role, and `role="group"` is on the row of segments. That is the arrangement the
APG's spin-button example names, and the one `date-field` already ships.

### `time-picker`

| Part           | Element  | Always | For                                                                  |
| -------------- | -------- | ------ | -------------------------------------------------------------------- |
| `root`         | `div`    | yes    | The frame.                                                           |
| `control`      | `div`    | yes    | The field and the trigger, and the box the positioner measures.      |
| `trigger`      | `button` | yes    | Opens the panel. Its name carries the chosen time.                   |
| `positioner`   | `div`    | no     | The layer, portalled. Carries `data-ui` too, as `select` does.       |
| `content`      | `div`    | no     | The panel: one `role="listbox"`, at every step.                      |
| `head`         | `div`    | no     | Where `now` and the consumer's presets sit.                          |
| `now`          | `button` | no     | Writes the current time. The zero case of the expression.            |
| `presets`      | `div`    | no     | The consumer's own shortcuts.                                        |
| `list`         | `div`    | no     | The rows, and the only thing that scrolls.                           |
| `option`       | `div`    | no     | `role="option"`, one whole time.                                     |
| `empty`        | `div`    | no     | Drawn when no time is available at all.                              |
| `footer`       | `div`    | no     | The consumer's own actions.                                          |

The picker composes `time-field` and redraws nothing of it. The field keeps its
own `data-ui`; this family owns the control box, the trigger in the field's
`end` slot, and the layer.

---

## 4. The panel

### Why a listbox and not a grid

A list of times at a step is a list. `calendar` is a `grid` because a month has
rows and columns that both mean something; a column of times has one axis. The
family therefore composes the layer modules `select` composes — `positioner`,
`presence`, `portal`, `dismissable-layer`, `typeahead` — and none of `calendar`.

### One shape

A listbox of whole times, at every step and every granularity. The trigger says
`aria-haspopup="listbox"` in every configuration the family has, so there is no
second role to get wrong and no state in which the panel is something else.

Two other shapes were drawn and withdrawn at the visual gate, both on the
reviewer's reading, and both are recorded in the contract rather than forgotten:

- **A column per unit**, which MUI and Ant both ship. It exists to express a
  precision a list cannot — a day at a one-second step is 86 400 rows — and
  this library already expresses that, in the control the panel hangs from:
  every hour, minute and second is typed, stepped, paged, bounded and cleared
  in the field. `docs/component-features.md` §6 asks for exactly that
  relationship, the panel complementing the typing. Columns would have been a
  second and worse way to a value the family already reaches: three scroll
  surfaces where one press should be, a value null until every column has been
  visited, a second keyboard axis, and a popup that stops being a listbox.
- **An hour heading over the rows.** It was written, rendered and read: the
  hour is already on every row, so the heading repeated what the reader was
  reading and spent a row of an eight-row list doing it. Every surveyed
  implementation ships a plain list, and this is why.

### Two props, and the columns are answered rather than avoided

A column panel exists to express two things a stepped list cannot, and both are
answered without it.

**A precision finer than the step** is the field's. Every hour, minute and
second is typed, stepped, paged, bounded and cleared there, and
`docs/component-features.md` §6 asks for exactly that relationship.

**A set of times no single step describes** is `options`: the consumer hands the
panel the times they mean, in the order they mean them, and the bounds and the
predicate still mark what is refused. A clinic open at 09:00, 09:20 and 13:45
cannot be written as a step, and `isTimeUnavailable` only subtracts from times
that fall on one. Seconds on a surface are the same prop — `00:00:15`,
`00:00:30`, `00:00:45` is a list, where a day of seconds is not.

The step therefore has no floor. One was written at this gate — a minute — and
withdrawn on the reviewer's reading: a thirty-second step inside a five-minute
window is eleven rows, and a floor refused that window along with the day it was
aimed at. **The guard belongs on the length of the list**, which is
`maxOptions`, defaulting to 1440 — a whole day at a one-minute step, the finest
whole-day list any surveyed implementation offers. Beyond it the list is cut,
the list carries `data-truncated`, the panel's accessible description says the
rest is typed, and a consumer who means a longer list raises the cap.

**The panel's step is not the field's arrows.** `input[type=time]` ties the two;
this family does not. A minute arrow moving fifteen at a time would put `:07`
out of reach of the arrows, and the field's promise is that every value is
reachable there.

### The length of the list, answered without a row

Ninety-six rows is a length, not a shape. Three things answer it and none of
them costs a row:

- the panel opens on the chosen time, or the nearest step to now;
- type-ahead jumps to a typed one;
- `PageUp` and `PageDown` move one hour boundary each — back from the middle of
  an hour lands on the top of that hour, so each press crosses exactly one.

### Where it opens

On the chosen time. When nothing is chosen, on the nearest step to now. When
that time is refused, on the first available option.
`scrollIntoView({ block: 'nearest' })` on open and on every highlight move.

### The step base

`min` when it is stated, midnight when it is not. That is the platform's own
rule for `input[type=time]`, and no surveyed panel states its base at all. A
`step` of 900 seconds with `min` `09:07` offers `09:07`, `09:22`, `09:37`.

A value off the step is not invalid: the field still accepts `09:15` by typing,
and the family reports `invalid` only when a bound or the predicate refuses it.

### Selection does not follow focus

Moving the highlight does not move the value; `Enter`, `Space` and a press do.
The APG lists selection-following-focus as optional and warns it can degrade
accessibility; here it would fire one request per option as a reader arrows
through ninety-six of them, each one a value a consumer may be writing to a
server.

### Precedence between the painted states

`disabled`, then `selected`, then `current`, then `hover` — and each weaker rule
carries a `:not()` for every stronger state it can meet, because **specificity
and not source order** is what decides between them. `:hover` with one `:not()`
outweighs a plain `[data-selected]`, so the chosen row turned grey under the
pointer however far down the file its own rule stood. Found by the reviewer at
the visual gate; `packages/styles/src/states.test.mjs` guards the `disabled` half
of `STATE_PRECEDENCE` and nothing else.

The chosen row still answers the pointer, one step along its own tone — measured
on the default theme, `rgb(29 78 216)` at rest and `rgb(42 91 220)` under it.
A row that swapped colour family under the pointer read as a different row.

---

## 5. Keyboard

### `time-field` segments — the spin-button pattern

Read at <https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/> on 10 September
2026. Every key in the pattern's own table, with what this family does and where
focus lands.

| Key             | Pattern says                          | Here                                                           | Focus            |
| --------------- | ------------------------------------- | -------------------------------------------------------------- | ---------------- |
| `ArrowUp`       | increases the value                   | steps the segment by one, wrapping inside it                    | stays            |
| `ArrowDown`     | decreases the value                   | steps by minus one, wrapping inside it                          | stays            |
| `Home`          | sets the value to its minimum         | the segment's minimum                                           | stays            |
| `End`           | sets the value to its maximum         | the segment's maximum                                           | stays            |
| `PageUp`        | optional, a larger step               | hour 3, minute 15, second 15, day period 1                      | stays            |
| `PageDown`      | optional, a larger step               | the same, negative                                              | stays            |
| printable       | only characters the value can hold    | digits in hour, minute and second; the two name letters in the day period | advances when no further digit fits |
| `ArrowRight`    | not in the pattern                    | the next segment in writing order                               | moves            |
| `ArrowLeft`     | not in the pattern                    | the previous segment in writing order                           | moves            |
| `Backspace`     | text editing                          | empties the segment                                             | stays            |
| `Delete`        | text editing                          | empties the segment                                             | stays            |
| `+`, `-`, `=`   | not in the pattern                    | opens the relative expression                                   | moves to it      |

**Departures, with their cost.**

- **The page steps.** The APG example steps every spin button by five. Fifteen
  minutes is the page a reader of a time field means, and it is the step a
  quarter-hour panel uses, so the two agree. Three hours is a quarter of a
  twelve-hour cycle. The cost is a reader who learned five from another spin
  button on the page.
- **No arrow buttons.** The APG's own example is deprecated for its visible
  increment and decrement buttons, which duplicate keys the reader already has.
  Its roles, its wrapping rule and its `aria-valuetext` guidance are taken whole.
- **The arrows across.** The pattern has no key for moving between spin buttons,
  because its example is one. `ArrowRight` and `ArrowLeft` are logical: in a
  right-to-left document the arrow that walks forward is the one pointing along
  the writing direction.
- **A key the field acts on is consumed.** Not only defaulted — stopped. The
  reason is recorded in `date-field`'s contract and inherited unchanged: an
  application's single-key shortcut guard tests for `input`, `textarea` and
  `contenteditable`, and a `div` with `role="spinbutton"` is none of the three.

### `time-picker`

| Key                     | Where              | Effect                                                                   |
| ----------------------- | ------------------ | ------------------------------------------------------------------------ |
| `Alt`+`ArrowDown`       | a segment          | opens the panel; focus stays in the field and typing keeps working        |
| `Enter`, `Space`, `ArrowDown` | the trigger  | opens the panel and moves focus into the list, onto the selected option   |
| `ArrowUp`, `ArrowDown`  | the list           | the previous or next option, per the listbox pattern                      |
| `Home`, `End`           | the list           | the first or last option                                                  |
| digits                  | the list           | type-ahead, through `@slotted/core/typeahead`                             |
| `Enter`, `Space`        | an option          | selects it; closes when `closeOnSelect` says so                           |
| `PageDown`, `PageUp`    | the list           | the first option of the next or previous hour                             |
| `Escape`                | anywhere open      | closes and returns focus to the trigger                                   |
| `Tab`                   | while open         | contained inside the control and the panel                                |

Read at <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/> on 10 September
2026. The pattern's own rule for where focus lands when a listbox receives it —
the selected option, or the first when none is selected — is taken whole.

`Alt`+`ArrowDown` carries the platform note `date-picker` records: ChromeOS
turns it into `PageDown` before the browser sees it, so the trigger button is
always drawn and the chord is a shortcut rather than the only way in.

`Escape` is staged the way the briefing describes: `dismissable-layer` asks in
the capture phase, so the family decides there. While an expression is open in
the field, `Escape` abandons the expression and the panel stays.

---

## 6. State

| Value        | Controlled  | Uncontrolled       | Request          | Reasons                                                    |
| ------------ | ----------- | ------------------ | ---------------- | ---------------------------------------------------------- |
| the time     | `value`     | `defaultValue`     | `onValueChange`  | `keyboard`, `pointer`, `select`, `clear`, `blur`, `programmatic` |
| the panel    | `open`      | `defaultOpen`      | `onOpenChange`   | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`  |

The request carries the value, the value it replaces, the segments, the reason,
`crossesMidnight`, and the originating event. `segments` and `crossesMidnight`
are what no surveyed implementation can say: a half-typed time, and a duration
that ran past a day.

The segments always commit and the value is always a request. A consumer who
owns the value does not own the half of a time being typed, and a run of digits
moves the display without moving the value — typing `2` then `3` into an hour
passes through `2`, which is a time the arithmetic accepts and nobody meant.

---

## 7. States in the DOM

`default`, `hover`, `active`, `focus-visible`, `disabled`, `invalid`,
`readonly`, `required` on both families, and `open` on the picker. Precedence is
`STATE_PRECEDENCE`, unchanged.

| Attribute               | On                | Says                                                     |
| ----------------------- | ----------------- | -------------------------------------------------------- |
| `data-field`            | `segment`         | which of the four fields it holds                         |
| `data-placeholder`      | `segment`         | it has no value and is drawing its placeholder            |
| `data-cycle`            | `root`            | `12` or `24`, so a stylesheet can answer the day period   |
| `data-granularity`      | `root`            | `hour`, `minute` or `second`                              |
| `data-crosses-midnight` | `preview`         | the expression resolved into the next day                 |
| `data-relative`         | `root`            | an expression is open in place of the segments            |
| `data-current`          | `option`          | the highlight                                             |
| `data-selected`         | `option`          | the chosen value                                          |
| `data-placement`        | `positioner`      | the side and alignment the positioner resolved            |
| `data-presentation`     | `positioner`      | `popover` or `sheet`                                      |

---

## 8. Integration — React

Every line of the table in `references/frameworks.md`, answered.

| Question                                                     | Answer                                                                                                                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request with a reason | `value` / `defaultValue` / `onValueChange(value, request)` on both, and `open` / `defaultOpen` / `onOpenChange` on the picker.            |
| Defaults set once for the whole application                  | `TimeFieldDefaultsProvider` with `useTimeFieldDefaults`, and the same pair for the picker. Locale, time zone, hour cycle, granularity, step, size, variant, placement, `closeOnSelect`, and every label. |
| Substituting the rendered element of each public part        | `render` on the root of both, receiving the props and the `ref`. The option's content is a `renderOption` slot on the picker.             |
| The consumer's own handler still runs                        | `onKeyDown`, `onPaste` and `onClick` are called first and the family stands down when `defaultPrevented` is set.                          |
| Reaching the native element and the imperative action        | `ref` gives `TimeFieldHandle` — `focus()`, `clear()`, `activeField` — and `TimePickerHandle` — `focus()`, `open()`, `close()`.            |
| Server render without a hydration mismatch                   | `useId` for every identifier; the current time is read in an effect, never during render, exactly as `date-field` reads today.            |
| Every state a consumer may style, in the DOM                 | The `data-*` vocabulary in §7, written by the contract test.                                                                              |
| Part props typed as the native element's, extended           | `ComponentPropsWithRef<'div'>` on both roots, with `defaultValue`, `onChange` and `ref` replaced.                                         |

## 9. Integration — Angular

| Question                                                     | Answer                                                                                                                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form the ecosystem expects       | `model()` for `value` and for `open`; `output()` for `valueChange` carrying the request with its reason.                                  |
| Reactive Forms and template forms                            | `ControlValueAccessor` on both, and `Validator` on both: `timeParse`, `timeMin`, `timeMax`, `timeUnavailable`. Angular Material's timepicker is the only surveyed implementation that validates, and it reports three of these four. |
| Defaults set once                                            | `SLOTTED_TIME_FIELD_DEFAULTS` and `provideTimeFieldDefaults()`, and the same pair for the picker.                                         |
| A template reaching the instance                             | `exportAs: 'slTimeField'` and `exportAs: 'slTimePicker'`.                                                                                 |
| Substituting projected content, kept lazy                    | Named `ng-content` slots for `start`, `end`, `presets` and `footer`; `NgTemplateOutlet` for the option's content, because it is re-rendered per option. |
| Zoneless change detection and `OnPush`                       | Signals throughout, `computed` for every derived value, and no `markForCheck`.                                                            |
| Every subscription and listener torn down                    | `DestroyRef` for the layer, the positioner and the media query; `takeUntilDestroyed` for the form control's stream.                       |
| A static attribute the consumer wrote surviving the host     | Read with `HostAttributeToken` before the host binding writes over it, which is the rule `menu` recorded and `toolbar` paid for.          |
| An entry point others depend on staying a single class       | `@slotted/angular/time-field` and `@slotted/angular/time-picker`; the picker imports the field only through its entry point.              |

## 10. Both

The consumer's explicit value wins over the field around it, over the provider
and over anything derived. The platform is preferred where it reaches:
`input[type=time]` is refused for the reason `date-field` refuses
`input[type=date]` — it cannot be styled past its closed state, its panel is
drawn by the operating system and answers no scheme, no density and no
direction, and its field order is the browser's locale rather than the
application's. The cost is the whole key table and the whole panel, and a hidden
input carrying `HH:mm:ss` so a plain form post still works.

---

## 11. What this costs, and what is deferred

| Decision                                     | Cost                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| One `SegmentState` for date and time         | Four always-null properties in a `date-field` request. Paid back by `datetime-field` in the next session. |
| Four hour cycles                             | Four ranges and four tests where a boolean would have been one.                                          |
| The relative expression                      | A second entry mode, its parser, its live region, and the midnight flag no other family needs yet.        |
| One panel shape                              | A consumer wanting a reader to pick seconds from a surface builds it: the field at `granularity="second"` beside a panel at a minute step. Two lines, and no second family. |
| No selection-following-focus                 | One more key press to choose from the panel. Paid for by not firing ninety-six requests.                  |
| The step floors at a minute                  | A panel of thirty-second slots is refused. It is the price of one shape, and the field types every second regardless. |
| `time-range-picker` deferred to wave 8       | A pair of times is a composition of a value the Core now has, which is the same weighing `date-range-picker` already carries. The line is added to `docs/build-order.md` wave 8. |
| The locale's own duration words not parsed   | `+40m` works in every locale and `daqui a 40 minutos` works in none. G6 in the inventory; the placeholder states the grammar. |
