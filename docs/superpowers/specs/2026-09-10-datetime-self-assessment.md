# DateTime field and datetime picker self-assessment

Written against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18, before the release gate. The rubric's scoring
rule is followed literally: for each of the eleven dimensions, the one change
that would most improve it is named, and whether it was made.

Evidence is a path, a test or a number. Nothing here is asserted without one.

Captures read for this assessment, at `/tmp`:

- `datetime-field-{light,dark,high-contrast}-comfortable-ltr-420.png`,
  `datetime-field-light-comfortable-ltr-240.png`,
  `datetime-field-light-dense-ltr-420.png`,
  `datetime-field-light-comfortable-rtl-420.png`
- the same six for `datetime-picker`
- `datetime-field-focus-data-part-segment-{light,dark}-comfortable-ltr-420.png`
- `datetime-picker-focus-data-part-trigger-{light,dark}-comfortable-ltr-420.png`,
  `datetime-picker-focus-data-part-option-light-comfortable-ltr-420.png`,
  `datetime-picker-hover-data-part-option-light-comfortable-ltr-420.png`
- `datetime-picker-presets-light-comfortable-ltr-720.png`, the scene the band's
  own geometry was measured in

---

## 1. Icons

Two marks in the whole pair, and the family adds no glyph to the scale: the
trigger draws `--slotted-icon-calendar`, which is the mark
`input[type=datetime-local]` draws for the same control, and `now` draws
`--slotted-icon-clock`, which the hour chain added in the previous wave. Both
are masks from the theme's scale; no rule draws a character through `content`.

The pair of panel labels an earlier pass drew — `Data` and `Hora`, each with a
mark set in eleven-pixel text — is gone. Two marks that small were decoration
twice over: a month grid is a date and a column of times is times, which is why
none of the four surveyed panels labels either.

`forced-color-adjust: none` is on each masked glyph, so the mark survives a
system background. Neither mark turns in a right-to-left document, and neither
should: a calendar and a clock have no direction.

**The one change that would most improve it:** the `now` control was a bare
accent-coloured word with a twelve-pixel mark glued to it, and it read as a
link. **Made:** it is a bordered quiet control at `--slotted-control-height-sm`,
with the mark at the control glyph size. Two follow-on defects were found and
fixed in the same pass — a `GrayText` system colour on a mask, which
`packages/styles/src/fallbacks.test.mjs` refuses, and a border that vanished in
dark because it read `--slotted-border-subtle` instead of
`--slotted-control-border-color`.

## 2. Motion

Three transitions, each carrying information: the field's frame under
`--slotted-control-transition-duration`, the option's ground under the same, and
the layer's entrance under `--slotted-duration-medium` with
`--slotted-easing-enter`. Every duration and easing is a token.

The layer's entrance is a keyframe animation rather than a transition, for the
reason `select` records and `time-picker` repeats: a transition starts from the
style the browser computed last, and the positioner writes `data-side` in the
same style update as the family opens the layer.

`prefers-reduced-motion: reduce` keeps the fade and drops the movement, and no
animation loops.

**State pairs that do not transition, and why:** the segments' focus band, which
must be instant because it says which field the next key will move; the
expression replacing the segments, which is a change of mode rather than of
value; and the two panels' reflow, which is a layout answer rather than a
gesture.

**The one change that would most improve it:** the list did not move at all when
the panel opened — it opened at midnight whatever the value was, so a reader who
had chosen 15:30 read 00:00 to 03:30 and had to scroll six hours to their own
time. **Made:** the row carrying the highlight is revealed on open and whenever
the list is next resized, in both bindings
(`packages/react/src/datetime-picker/datetime-picker.tsx`,
`packages/angular/datetime-picker/src/datetime-picker.ts`). The scroll is not
smooth, for the reason `time-picker` recorded: a smooth scroll there fights a
reader who is already scrolling.

## 3. Responsiveness

Two reflows, and neither is a threshold.

The field's row of seven segments wraps **between the halves and never inside
one**, at every width, because each half is a box and flexbox breaks a line
between two items. The boundary literal the locale writes is drawn at the end of
the first half, so a break leaves the comma where a comma in a sentence goes.
Read in `datetime-field-light-comfortable-ltr-240.png`.

The panel's two surfaces are a wrapping flex row: two columns where the
positioner measured room for both, one where it did not. There is no container
query, and the reason is structural rather than a preference — a surface
shrink-wrapped from a calendar has no width of its own to ask about. The time
panel carries `flex: 1 1 7rem`, so it is the narrow column beside the month and
takes the whole line when it wraps.

Density changes size and not meaning: the list's row height and its cap are read
from the same control scale, so a dense panel shrinks its rows and the number of
rows it shows together. Read in `datetime-picker-light-dense-ltr-420.png`.

**The one change that would most improve it:** the head band stretched the whole
panel — and with it the column of times — whenever a consumer's shortcut was
long, because a grid track sizes to the widest thing in it. **Made:**
`inline-size: 0; min-inline-size: 100%` with `box-sizing: border-box`, so the
band renders at the panel's width and contributes nothing to it. The
`border-box` half is load-bearing and says so in the stylesheet: under
`content-box` the band came out twelve pixels wider than its track and pushed
`now` six pixels past the panel's edge.

## 4. Refinement

Everything in the panel begins and ends on one gutter. Measured on the default
theme at `comfortable`, 720 pixels: the surface's inner edges are 32 and 405.4,
and the month's column, the page trigger inside it, the list's column and the
head band all begin and end there. The band's own `padding-inline` was removed
to get there — two edges that almost line up read worse than two that plainly do
not.

The head band's rule now sits six pixels under the controls above it, which is
the step the footer already kept between its own rule and its buttons, so the
two bands hold the surface symmetrically. Measured after the change: the `now`
control ends at 4574, the rule is at 4580, the panels begin at 4585.

The list is capped at seven and a half rows on purpose. The half is the point
wherever the cap applies: a list cut on a row boundary looks like the whole
list, and a reader who cannot see that ninety-six times are available never
scrolls for them.

**The one change that would most improve it:** the calendar's own heading was
clipped at both ends in a dense panel — three causes, all in another family's
stylesheet. **Made**, under the standing authorisation to fix defects found in
this session: a dead `text-overflow: ellipsis` on a flex container, a
`justify-content: center` that clipped both ends instead of one, and no width
floor under `contain: inline-size`. All three are in
`packages/styles/src/calendar/calendar.css` with the lesson in
`docs/BUILD-LOG.md`.

## 5. Tokens

89 declared tokens for the field and 79 for the picker, each named in its
`.tokens.json`, and `packages/styles/src/tokens.test.mjs` proves the list and
the stylesheet agree — it passes for both families. Every value the family reads
that is not theme-owned is a runtime custom property with its prefix registered.

No colour, radius, shadow, duration or easing is written as a literal. The two
places a number appears are geometry the theme has no opinion about: the list's
cap in rows, and the `7rem` flex basis under the time panel.

**The one change that would most improve it:** `--slotted-datetime-picker-list-block-size`
was the only way for a consumer to change how tall the list is, and it read as
an implementation detail. **Not made:** it stays a token rather than becoming a
prop, because the height of a panel is a theme decision and every other surface
in the library treats it as one. Recorded rather than left silent.

## 6. Patterns

The field is the APG's spin-button pattern, one `role="group"` over seven
`role="spinbutton"` fields, with exactly one in the tab sequence.

The panel is the APG's **Date Picker Combobox** popup — `role="dialog"` holding
a `role="grid"` and a `role="listbox"` — and the trigger says
`aria-haspopup="dialog"` to match. Both surfaces are in the DOM at every width.
A tablist that exists on a narrow container and not on a wide one tells
assistive technology two different stories about the same component; that is the
arrangement Kendo and MUI ship, and the contract declines it in writing
(`declined.tabs`).

Selection does not follow the highlight. The listbox pattern lists that as
optional and warns it can severely degrade accessibility; here a reader arrowing
through ninety-six quarter-hours would emit ninety-six change requests.

**The one change that would most improve it:** the family owed a decision about
which surface opens first and what happens to the other. **Made:** the value's
own completeness decides — the press that leaves the value half written carries
focus to the missing half, the press that completes it closes the panel, and a
press on a value that was already whole leaves the panel open. It is in the
contract as `focusRule` with five named cases, and it is why `declined.confirmButton`
can be declined where Ant needs `needConfirm` and Kendo needs Set.

## 7. Accessibility

- One group, one accessible name, and the name is the whole datetime in words.
  Two groups would have made "what is the reader typing" two questions with two
  answers.
- `aria-valuetext` on every segment, because the day period's `aria-valuenow` is
  0 or 1 and neither is a name in any language.
- The half that is missing is said out loud: in the group's own words, on the
  root as `data-incomplete`, on the request, and in Angular as
  `slottedDateTimeIncomplete` carrying the missing half. Every surveyed
  implementation reports an empty control and loses what was written; Kendo's
  own `dateTimeIncomplete` cannot say which half.
- Two Tab stops in the panel rather than forty-three: one element of the grid is
  in the sequence, which the Grid Pattern requires, and the listbox is one stop
  for the same reason. Tab is contained inside the layer while it is open.
- The trigger's accessible name carries the chosen datetime, because focus
  returns there when the panel closes.
- Escape is staged in three steps — the expression, then the calendar's view,
  then the panel — and the layer asks in the capture phase so the family can
  still refuse it.

**The one change that would most improve it:** the listbox had no name of its
own, and a dialog holding two widgets gives neither of them a name by position.
**Made:** the list is named with the day its times belong to, through
`format.describeDate(listDate, 'short')`.

## 8. Native API

Both bindings pass every unknown prop to the frame, and neither hides a platform
API. React keeps `render`, a `ref` handle and the consumer's own `onKeyDown`,
which runs before the family acts and can stop it with `preventDefault`. Angular
keeps `(keydown)` on the host for the same reason, plus `exportAs` for
`focus()`, `focusEntry()`, `clear()`, `openSurface()` and `closeSurface()`.

The value reaches a plain form post as `YYYY-MM-DDTHH:mm:ss` through a hidden
input, which is `input[type=datetime-local]`'s own value format — no adapter and
nothing reading the control.

**The one change that would most improve it:** a React consumer had no way to
draw one row of the list. **Made:** `renderOption` in React and a
`slDateTimePickerOption` template in Angular, each handed the time, the day, the
label and the three states, with the row itself — role, states, keyboard and
target size — staying the family's.

## 9. Capability

Eight differentiators from the inventory shipped, and the three that carry the
family are:

1. **Two pairs of bounds at once.** `min`/`max` fence the whole value and
   `minTime`/`maxTime` fence every day inside the range, with the first and last
   day partial. It is the rule MDN states for the platform, no surveyed script
   implements it, and MUI's own validation page records that it cannot combine
   the two. `dayWindow` in `packages/core/src/date/plain-date-time.ts`, with
   tests.
2. **The list answers the day the reader is on**, not a day already committed —
   so a fully booked Saturday empties while the reader is still arrowing through
   the month. Ant's `disabledTime(date)` is called only for a date already
   chosen.
3. **A datetime written as a duration.** `+2d`, `+1w`, `1h30`, `-15`, `0`,
   resolved in view before Enter accepts it, with the resolved date lifted out
   of the time beside it when the duration moved the day. No surveyed
   implementation parses a duration at all.

**The one change that would most improve it:** the panel offered no way to state
times a step cannot describe. **Made:** `options` takes the consumer's own list —
a clinic open at 09:00, 09:20, 11:40, 13:45 and 16:00 — in their own order, and
`maxOptions` caps what a step can build at a whole day of minutes.

## 10. Ecosystem integration

Both integration tables in `references/frameworks.md` are answered line by line
in the design document. React: `createControllable` for all three mutable
values, `useId`, a defaults provider, a `render` prop and a `ref` handle.
Angular: `input()`/`output()` signals, `computed`, `effect` with `untracked`,
`HostAttributeToken` for a written `aria-label`, `afterNextRender` for anything
that reads the DOM, `DestroyRef` for teardown, `NgTemplateOutlet` for the per-row
template, `ViewEncapsulation.None`, and `ControlValueAccessor` + `Validator` on
the field — which the picker composes rather than re-implementing, so
`formControlName` works on the picker with no second accessor.

The asymmetry is recorded rather than levelled away: Angular has the form
integration and React has no equivalent of it; React has `render` and Angular
has `exportAs`.

**The one change that would most improve it:** the Angular picker reported no
validity of its own. **Not made, and it needs none:** it composes
`SlDateTimeField`, whose validator already reports all four errors for the value
the picker writes. Verified by the Angular specs for the picker inside a
reactive form.

## 11. Documentation

Four reference pages, one per binding per family, each with the import, the
anatomy, one captioned demonstration per declared scenario with the code that
produced it, the API, the events, the composition surface and the accessibility
decisions. 19 scenarios for the field and 20 for the picker, in a clinic's
booking flow rather than as specimens.

`specs/reference-pages.test.mjs`'s contract is met by all four, and each page's
own test file asserts scenario coverage, API metadata against the contract,
the reference-page contract and snippet formatting: 8 checks in React and 8 in
Angular, all passing.

`tools/harness/audit.mjs` measures all four pages at 1280 and 620 pixels with no
finding.

**The one change that would most improve it:** the audit was reading eleven of
the picker page's thirty-nine stages and reporting a clean page — it settled
while Storybook was still mounting blocks, which only mount as they come into
view. **Made:** the wait is now for the count to stop growing **and** for the
document to have been walked to its end, a viewport at a time. Every family's
audit sees the whole page from here.

---

## Section 18, point by point

1. **Purpose, uses and anti-uses.** The field is a date and a time typed as one
   value; the picker is that field plus the two surfaces worth one press. The
   anti-use is an instant: this family holds wall-clock values, never a zoned
   moment, and a booking that must survive a timezone change stores the zone
   beside the value.
2. **Anatomy and stable parts.** Thirteen parts for the field, sixteen for the
   picker, each declared in its contract and drawn in the harness fragment —
   10 scenes for the field, 15 for the picker.
3. **Controlled and uncontrolled contract.** One mutable value for the field;
   three for the picker — the value, the panel and the highlight — each with its
   pair, its request, its reasons and what it carries. The highlight is one
   value for both surfaces (`{ date, time }`), because the reader is in one
   place and two models would be two names for it.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `disabled`,
   `invalid`, `readonly`, `required`; plus `open`, `selected` and `current` on
   the picker. In the list the chosen row outranks the highlight and the
   highlight outranks the pointer, and each weaker rule is guarded by
   specificity rather than by source order.
5. **Keyboard, focus, ARIA, touch and screen reader.** Documented in the design
   §5 and tested in both bindings. The arrows cross the boundary between the
   halves in one run, which two nested fields could not do; `Alt+ArrowDown`
   opens the panel and leaves focus in the field. Touch: the target minimum is
   recovered outside the paint on every inner control.
6. **Recipes by size, density and variant.** Three sizes, three variants, three
   densities, all from the control scales; the panel's row height and cap are
   counted in the same unit.
7. **Responsive, RTL, locale, reduced motion.** All four answered above. Each
   half is its own bidi run, so the digits read left to right inside a mirrored
   page — the alternative was a capture that read `30:14`, a time nobody wrote.
8. **Loading, empty, error, disabled, extreme content.** No loading state: the
   list is arithmetic and never travels. Empty is a sentence rather than an
   empty box, which is what MUI and Ant both leave. Error is the field's and the
   control's together; disabled is legible rather than faded; extreme content is
   a day-period name written as a word, a seven-segment row at 240 pixels, and a
   list cut at `maxOptions` that says so.
9. **SSR, performance, virtualization.** No layout and no clock is read during
   render; identifiers are `useId` and Angular's own. The list is capped rather
   than virtualized, and the cap is the reason: a whole day at a one-minute step
   is the longest list this family will ever build.
10. **Examples.** 19 scenarios for the field and 20 for the picker, each a real
    screen — a clinic's opening hours, a Saturday that closes early, a booking
    window that is partial on its first day.
11. **Behavioural tests shared between the bindings.** 34 + 32 in React, 61 in
    Angular, over the same conceptual contract, plus 40 contract tests and 205
    date tests in `@slotted/core`.
12. **Changelog and migration.** Two new families, one widened duration engine
    and one widened segment engine. Both widenings are additive, so no
    `date-field` or `time-field` call site moves; the cost is written in the
    design §1.

---

## What is not verified here

- **The sheet presentation**, and touch generally. This machine has no touch
  device; the query, the DOM attribute and the stylesheet are exercised, and the
  behaviour on a finger is not.
- **A screen reader.** The roles, names, values and the live region are asserted
  in the tests and in the accessibility tree; how a particular reader announces
  the missing half is not.
- **The CJK scenes in the captures.** This machine has no CJK font, so `ja-JP`
  draws empty boxes in the harness images. The scene proves the field order and
  the boundary literal; the glyphs render on a machine that has the font.
- **One transient audit finding.** A single run against the Angular picker page
  reported five overflows in the panel scene; two later runs and a direct
  measurement of all twenty positioners on that page found none. It is one frame
  after the audit's own scroll, before Angular re-measures an open layer, and it
  is recorded rather than dismissed.
