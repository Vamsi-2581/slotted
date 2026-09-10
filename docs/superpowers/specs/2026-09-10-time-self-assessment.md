# Time field and time picker self-assessment

Written against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18, before the release gate. The rubric's scoring
rule is followed literally: for each of the eleven dimensions, the one change
that would most improve it is named, and whether it was made.

Evidence is a path, a test or a number. Nothing here is asserted without one.

---

## 1. Icons

Every mark is a mask from the theme's glyph scale, and no `content` draws a
character. The family added one glyph, `--slotted-icon-clock`, with its reason
in `docs/token-foundation.md` beside the one `--slotted-icon-calendar` already
carries; `packages/themes/default/src/glyphs.json` maps it to `clock` and the
theme build writes it.

Two direction-sensitive marks turn with the document: the preview's chevron
through `:dir(rtl)`, which is the selector `link` and `pagination` both record,
and the trigger's clock does not turn because a clock has no direction.
`forced-colors` keeps both: `forced-color-adjust: none` on each masked glyph, so
the mark survives where a system background would otherwise replace it.

**The one change that would most improve it:** the preview's chevron was drawn
at the control glyph size — sixteen pixels beside a nine-pixel capital — and
centred on the line box rather than on the letters. **Made:** it is `1cap`, the
size `status-indicator` already uses for a mark inside a line of text, with the
`vertical-align` formula `docs/build-briefing.md` records.

## 2. Motion

Three transitions, each carrying information: the frame's border and shadow
under `--slotted-control-transition-duration`, the option's ground under the
same, and the layer's entrance under `--slotted-duration-medium` with
`--slotted-easing-enter`. Every duration and easing is a token; none is written
as a number.

The layer's entrance is a keyframe animation rather than a transition, for the
reason `select` records: a transition starts from the style the browser computed
last, and the positioner writes `data-side` in the same style update as the
family opens the layer. A layer written open in static markup — the harness — is
simply there, which is why the captures are still.

`prefers-reduced-motion: reduce` keeps the fade and drops the movement, and no
animation loops.

**State pairs that do not transition, and why:** the segments' focus band, which
must be instant because it says which field a key will move; the expression
replacing the segments, which is a change of mode rather than of value; and the
day period's two values, which are a step rather than a slide.

**The one change that would most improve it:** the panel's rows do not animate
their arrival, so a list that scrolls to the chosen time on open jumps to it.
**Not made:** the scroll is `scrollIntoView({ block: 'nearest' })` at open, and a
smooth scroll there would fight a reader who is already scrolling. Recorded
rather than left silent.

## 3. Responsiveness

The field answers its own inline size without a container query: its segments
are sized from the digits they hold in `ch`, and the row shrinks by dropping the
adornments' air rather than by wrapping. Read at 240, 420 and 720 pixels —
`tools/harness/out/time-field.html`, every scene, nothing wraps and nothing is
cut.

The panel answers the anchor's width, floored at 11rem so a narrow field never
produces a column too tight to read a time in and capped at 20rem so a wide form
never stretches one column across a page. Below 480 pixels on a coarse pointer
it takes the sheet presentation, and the DOM says which it is in
(`data-presentation`) so the decision is testable without a device.

The list's cap is counted in row pitches rather than in control heights, which
is the correction the dense capture forced: the first version shrank the cap and
not the rows, and showed six options at `dense` where `comfortable` showed nine.

**The one change that would most improve it:** the sheet presentation has been
reasoned about and not seen, because this machine has no touch device.
**Not made** — it is named under _What is not verified here_ below.

## 4. Refinement

Captures read at full size, in `light`, `dark` and `high-contrast`, at 240 and
420, at `dense`, and in `rtl`; plus focus captures for the segment, the
expression, the clear button, the trigger and the highlighted option.

Six corrections came out of that loop and are listed in
`docs/superpowers/specs/2026-09-10-time-capability-inventory.md` §7. The three
the reviewer found are there too, with what each changed.

Measured rather than judged: every mark in the field sits on the cap band of the
text beside it to within half a pixel — the start adornment, the clear glyph,
the trigger glyph, the literal, the day period and the end slot all read 0, and
the clear and trigger glyphs read 0.5 at `sm`. The method is a probe of `1cap`
and `1ex` against each mark's centre, which is the same arithmetic the briefing's
own decision was measured with.

**The one change that would most improve it:** at rest the list showed eight
rows cut flush at the panel's edge, which reads as the whole list. **Made:** the
cap is eight and a half row pitches, so the half-row says the list continues.

## 5. Tokens

`packages/styles/src/time-field/time-field.tokens.json` and its picker sibling
are generated from the stylesheets and checked by
`packages/styles/src/tokens.test.mjs`, which fails when either disagrees. Every
family token falls back to a foundation token; the two literals are declared in
each contract under `literals` with their reasons.

`--slotted-icon-clock` is the one addition to a shared scale, and it is a
primitive with the same shape as the eight glyphs beside it.
`scripts/verify-token-foundation.test.mjs` counts the layer and now reads 86.

**The one change that would most improve it:** `--slotted-space-px` does not
exist and a hairline gap between rows wanted one. **Made differently:** the gap
is `--slotted-space-1`, a real step, rather than a new token for one family.

## 6. Patterns

Two patterns, both read on 10 September 2026 and transcribed key by key into
`docs/superpowers/specs/2026-09-10-time-design.md` §5:

- <https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/> for the field;
- <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/> for the panel.

Every key in each table is bound, and each contract's `keyboard` array carries
it. Four departures are written with their cost in `time-field`'s `departures`
block: the page steps, the absent arrow buttons, the arrows across, and the three
characters that open a duration. The picker's own departure — `PageUp` and
`PageDown` moving an hour, which the listbox pattern has no key for — is in
`hourJump`.

The platform is preferred where it reaches, and where it is refused the cost is
written: `input[type=time]` is refused for the reason `date-field` refuses
`input[type=date]`, and the cost is the whole key table, the whole panel and a
hidden input.

**The one change that would most improve it:** the pattern's own example is
deprecated, and a family that took it whole would inherit visible arrow buttons.
**Made:** the roles, the wrapping rule and the `aria-valuetext` guidance are
taken; the buttons are not drawn, and the departure says so.

## 7. Accessibility

Name, role, state, keyboard, focus, forced colours, reduced motion and reading
order are each answered and each tested:

- the row of segments is a `group` whose accessible name is the whole time in
  words, and each field a `spinbutton` with `aria-valuenow`, `aria-valuemin`,
  `aria-valuemax` and `aria-valuetext`. The day period is why `aria-valuetext`
  is not optional: `aria-valuenow` there is 0 or 1;
- the expression is a real `input` with its own name, and its preview is a
  polite live region — a reader is being asked to accept a value they did not
  write;
- the panel is a `listbox` with real focus and a roving tabindex, and the
  pattern's rule for where focus lands is taken whole;
- a truncated list says so in `data-truncated` and in the panel's accessible
  description;
- `forced-colors` keeps every mask and gives the chosen row a system pair the
  operating system guarantees legible together.

Exercised in the browser at the visual gate and asserted in 41 React and 24
Angular behavioural tests for the field, and 34 and 22 for the picker.

**The one change that would most improve it:** `invalid` is not distinguishable
in the `high-contrast` scheme. **Not made** — it is the theme's mapping and
`date-field` behaves identically, measured side by side. Reported below rather
than fixed inside one family.

## 8. Native API

React is React and Angular is Angular, and neither imitates the other. Both
integration tables in `references/frameworks.md` are answered line by line in
the design document §8 and §9.

The asymmetry the rubric asks to be recorded rather than levelled away:
**Angular implements `ControlValueAccessor` and `Validator`** — `slottedTimeRange`
and `slottedTimeUnavailable` are validity this control owns and no other
validator can see — and React has no equivalent integration point. React's own
`render`, `renderOption` and `ref` handle have no Angular equivalent either;
Angular answers them with `exportAs`, `ng-content` and an `ng-template`.

Native props, events and refs survive in both: `ComponentPropsWithRef<'div'>` on
each React root, host bindings and `HostAttributeToken` on each Angular host —
which is what keeps a consumer's own `aria-label` from being written over.

**The one change that would most improve it:** the two bindings could have been
levelled to the smaller shape so they looked alike. **Not made, deliberately.**

## 9. Capability

Measured against the step 3 inventory rather than against the scope paragraph.
Twenty-three table-stakes rows: nineteen `adopt` or `adapt`, one deferred to
`time-range-picker` in wave 8, and three declined with the family or the
composition that owns each instead.

The one decline that had to be earned is the column panel, and it was earned
twice: once by the field, which types every second, and once by `options`, which
states any set of times a step cannot describe. The second half only reached the
contract because the reviewer asked what covered seconds and irregular times —
recorded in the inventory §7, second round, as an inventory-to-contract drift.

Every mutable value has a controlled and uncontrolled pair, a request carrying a
reason, and a row in the state matrix: one for the field, three for the picker.
Two differentiators no surveyed implementation ships: a time written as a
duration, resolved in view, and a midnight crossing said out loud.

**The one change that would most improve it:** `options` was marked `adopt` in
the inventory and never written into the contract. **Made**, with `maxOptions`
and `data-truncated` beside it, and the step's floor withdrawn.

## 10. Ecosystem integration

Every line of both tables is answered with the file that answers it. In
particular:

- an application sets defaults once in both — `TimeFieldDefaultsProvider` and
  `provideTimeFieldDefaults`, and the same pair for the picker;
- the Angular control belongs in a reactive form and in a template form;
- a consumer's own handler runs before the family acts, in both — React calls it
  first, Angular handles the keys on the host so a listener on the same element
  runs first;
- every state a consumer may style is in the DOM, written by the contract test;
- the server render mismatches nothing: `useId` in React, a module counter in
  Angular, and the clock read after the first paint in both.

**The one change that would most improve it:** the picker's `renderOption` had
no Angular counterpart in the first draft. **Made:** `SlTimePickerOption`, an
`ng-template` with the time as `$implicit` — which is the case
`references/frameworks.md` names `NgTemplateOutlet` for.

## 11. Documentation

Four reference pages, read rendered rather than as source, at 1280 and 620
pixels and at `dense`:

- <http://localhost:6006/iframe.html?viewMode=docs&id=components-timefield--reference>
- <http://localhost:6006/iframe.html?viewMode=docs&id=components-timepicker--reference>
- <http://localhost:6007/iframe.html?viewMode=docs&id=components-timefield--reference>
- <http://localhost:6007/iframe.html?viewMode=docs&id=components-timepicker--reference>

Twelve `tools/harness/audit.mjs` runs, all exit 0, at 32, 25, 31 and 25 stages.

Each page carries the import, one anatomy row per declared part, one captioned
demonstration per declared scenario with the code that produced it, every input,
every output, the composition surface, five accessibility decisions, the token
list and the code. `referencePageErrors` holds each of those and passes.

**The one change that would most improve it:** `audit.mjs` measured a docs page
as soon as one stage existed, and a page mounting its blocks one at a time had
two of twenty-five by then — a clean exit on a page it had barely seen.
**Made, in the shared tool and in its own commit:** the wait is now for the
stage count to stop growing, `hasSettled` is a pure function, and
`tools/harness/audit.test.mjs` puts five cases to it. The first run after the
fix immediately found four real findings the old wait had hidden.

---

## Section 18, point by point

1. **Purpose, uses and anti-uses.** The field is a time typed one part at a
   time; the picker is that field plus the times worth one press. The anti-use
   is a duration — `01:30` meaning "an hour and a half" is not a time of day,
   and this family holds a clock value.
2. **Anatomy and stable parts.** Eleven parts for the field, twelve for the
   picker, each declared in its contract and drawn in the harness fragment.
3. **Controlled and uncontrolled contract.** One mutable value for the field,
   three for the picker, each with its pair, its request and its reasons. The
   reason a request is not emitted when the value has not moved is
   `docs/state-and-events.md`, and it is written in the field's event row.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `disabled`,
   `invalid`, `readonly`, `required`; plus `open`, `selected` and `current` on
   the picker. Precedence is `STATE_PRECEDENCE`, and the picker's contract adds
   `statePrecedence` because specificity rather than source order is what
   decides between painted states — the defect the reviewer found.
5. **Keyboard, focus, ARIA, touch and screen reader.** Documented in the design
   §5 and tested in both bindings. Touch: the target minimum is recovered
   outside the paint on every inner control, and the sheet presentation answers
   a coarse pointer.
6. **Recipes by size, density and variant.** Three sizes, three variants, three
   densities, all from the control scales, and the panel's row height and cap
   counted in the same unit so density changes size and not meaning.
7. **Responsive, RTL, locale, reduced motion.** All four answered above. The
   right-to-left correction — a clock time is a numeric run and renders left to
   right inside an Arabic paragraph — is in `docs/BUILD-LOG.md` with its lesson.
8. **Loading, empty, error, disabled, extreme content.** No loading state: the
   list is built from arithmetic and never travels. Empty is a sentence, error
   is the field's and the control's together, disabled is legible rather than
   faded, and extreme content is a day period written as a word and a
   second-granularity field at 240 pixels.
9. **SSR, performance, virtualization.** No layout is read during render and no
   clock either; identifiers are `useId` and a module counter. The list is
   capped at 1440 rows rather than virtualized, and the cap is why: a day at a
   one-minute step is the longest list this family will build.
10. **Examples.** Seventeen scenarios for the field and eighteen for the picker,
    each a real screen rather than a specimen — a clinic's hours, a shift, a
    booking, a video timecode.
11. **Behavioural tests shared between the bindings.** 41 + 34 in React, 24 + 22
    in Angular, over the same conceptual contract.
12. **Changelog and migration.** Two new families and one widened engine. The
    engine change is additive, so no `date-field` call site moves; the four
    always-`null` properties a `date-field` request now carries are documented
    in the design §1 as the cost.

---

## What is not verified here

- **The sheet presentation**, and touch generally. This machine has no touch
  device; the query, the DOM attribute and the stylesheet are exercised, and the
  behaviour on a finger is not.
- **A screen reader.** The roles, names, values and live region are asserted in
  the tests and in the accessibility tree; how a particular reader announces the
  preview is not.
- **The CJK scenes in the captures.** This machine has no CJK font, so `ja-JP`
  draws empty boxes in the harness images. The scene proves the field order and
  the 0-to-11 hour; the glyphs render on a machine that has the font.
- **`invalid` in `high-contrast`.** Not distinguishable, and `date-field`
  behaves identically — measured side by side. It is the theme's mapping of
  `--slotted-tone-danger-border` in that scheme, and it is a theme decision
  rather than a family one.
