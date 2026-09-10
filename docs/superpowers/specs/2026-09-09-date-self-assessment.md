# Date field, calendar and date picker — self-assessment

The eleven dimensions of `.claude/skills/component/references/rubric.md`, and
the twelve criteria of `docs/component-features.md` §18, for the three families
of wave 7. Written against the shipped code, not against the plan.

The rubric's scoring rule is the one this document is held to: for each
dimension, the one change that would most improve it, and whether it was made.

---

## 1. Icons

Three marks, all masks from glyph tokens and none of them a character: the
field's clear (`--slotted-icon-x`), the calendar's two page triggers and its
heading (`--slotted-icon-chevron-right`, `--slotted-icon-chevron-down`), and
the picker's trigger (`--slotted-icon-calendar`). The chevron on `previous` is
the `next` artwork turned, and `:dir(rtl)` swaps them, so one token serves both
document directions.

**The change that would most improve it, and it was made:** the picker's
trigger drew a chevron, which is `select`'s promise — a list opens here — and
the wrong one: what opens is a month. `--slotted-icon-calendar` was added to
`glyphs.json`, to `packages/tokens/src/contract.json` and to
`docs/token-foundation.md` with the reason, and the mark no longer rotates on
open: the state is `aria-expanded` and the surface itself, and the trigger goes
on saying what kind of value it holds.

Adding it surfaced a defect another lane had left: `--slotted-icon-search` was
in the contract and the glyph table and not in the layer count, so
`scripts/verify-token-foundation.test.mjs` was already red. Both were repaired.

## 2. Motion

The layer fades and arrives along the axis it opens on, on
`--slotted-duration-medium` with `--slotted-easing-enter`, as a keyframe rather
than a transition — the reason `select` records: the positioner writes
`data-side` in the same style update as the family opens the layer, so a
transition would set out from the wrong side. The exit is a transition on
`--slotted-duration-short`. Under `prefers-reduced-motion` the movement drops
and the fade stays. Nothing loops.

Everything else that changes state — a segment taking focus, a day taking the
pointer, a trigger's ground — transitions on the control scale.

**The change that would most improve it, and it was made:** the calendar's
heading carried `transition: transform` and nothing ever transformed it. Dead
declarations are how a sheet stops being readable; it was removed.

## 3. Responsiveness

The calendar answers its own inline size and not the viewport. It is the one
family here that reflows, and the reflow is **arithmetic rather than a step**:
the cell is `100cqi` divided by the columns there are, bounded above by the
control height and below by `--slotted-target-min`. A month that no longer fits
beside another wraps under it. Nothing is withdrawn at any width.

Read at 240, 420 and 720 pixels, in all three densities.

**The change that would most improve it, and it was made:** the first version
had a literal 620-pixel breakpoint that hid the second month, and a 320-pixel
one that set `--_cell-size` on the container itself. Neither worked, and one
could not: a container query and a `cqi` unit resolve against an **ancestor**
container, so the root sizing itself from its own width did nothing at all —
the 240-pixel capture showed a full-size calendar overflowing its stage with a
rule in the sheet that looked like it prevented exactly that. And no literal
can be right at three densities: seven comfortable columns are 238 pixels and
seven dense ones 182.

## 4. Refinement

Read at full size in light, dark and high contrast, at three widths, in both
directions, at `comfortable` and `dense`, and with `--focus` on the roving day
and the roving segment.

Four defects the pictures found, all corrected:

| What the capture showed                                                     | What it was                                                                  |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| The heading drawn as `d`, one character, with the grid overflowing under it  | `inline-size: fit-content` under `contain: inline-size` — a contained root has no contents to be sized by |
| The range band rubbed out under the pointer, one cell at a time              | The day's own ground covered the band's two rules; the day now stops one rule short of the cell, in every cell |
| Today and focus drawn as the same ring                                       | Two facts with one shape; today is a dot now and focus is the ring             |
| 195 pixels of empty ground to the right of the popup                         | The footer's `flex-basis: 100%` against a shrink-wrapped container; the surface is a grid of `auto` tracks now |

**The one change left, and it was made:** the range's two ends were round on
all four corners, so a run read as three separate marks rather than one. The
inner corners are square now, with the guard for a one-day range, which is both
ends at once.

### What the reviewer found afterwards, in the browser

Six more defects, none of which a capture of the harness had shown, because
four were behaviour and two were in scenes the harness did not have.

| What was reported                                                    | What it was                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A press on the field gave no feedback, and the cursor stayed default | `:focus-visible` never matches a `div` focused by a pointer; the frame and the segment answer `:focus` now                                    |
| The day lost focus while the day was being typed                     | `withDayHeld` clamped against a month halfway through a run, and `daysInMonth` answers `0` for month `0`                                      |
| Pressing `1` anywhere in the field left the field                    | A `div[role=spinbutton]` is invisible to every "is the target editable" guard, so Storybook's own `focusNav: 1` fired; both families stop the propagation of every key they consume |
| Today's dot sat against the digit                                    | No gap between the two; `--slotted-space-1` between them                                                                                      |
| Two chosen days side by side touched at their rounded corners        | The day filled the cell edge to edge; it recedes by a hairline, and by none inside a run                                                      |
| The range's ends showed half a border outside the run                | The band was half a cell wide with a border of its own; it is the whole cell now, tinted from the accent's `text` role, with no edge          |
| Choosing a day in the second month of a pair moved the pair          | The page followed the focused date; it is a value of its own, re-anchored by whole pages only when focus leaves the span                      |

Two more the rendered reference pages showed, and neither test nor capture
could:

| What the page showed                                              | What it was                                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| A range across a month boundary painted twice in a pair of months | September's grid ends in October and October's begins in September; `outsideDays` resolves to `hidden` above one month now |
| A white diamond loose below the picker's surface                  | The `arrow` part was absolutely positioned and never given a side; the part is gone, as no surface anchored to a field has one |

## 5. Tokens

Every value a theme may retune is a token. Three `tokens.json` files, derived
from the stylesheets and checked by `packages/styles/src/tokens.test.mjs`.
There are no literals outside the documented exemptions; the two numbers that
look like literals are the column counts of the three views — `7`, `4` and `4`
— which are the shape of a week and of a page of months rather than values a
theme retunes, and the contract records that.

The one new foundation token is `--slotted-icon-calendar`, justified at the
visual gate before it was written, as the briefing requires of anything that
changes ground other families stand on.

**The change that would most improve it, and it was made:** the calendar's
cell size was going to be a component-layer token. It is not one: it reads
`--slotted-control-height-md`, because a calendar cell is a control the reader
presses and one drawn to a different rhythm from the buttons above it reads as
a second component. The component layer is still Avatar's alone.

## 6. Patterns

Two APG sources, read on 9 September 2026 and transcribed key by key into
`specs/components/*/contract.json` and
`docs/superpowers/specs/2026-09-09-date-design.md` §5:

- <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/>
- <https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/examples/datepicker-spinbuttons/>

The grid role is on a real `table`, so `row`, `columnheader` and `gridcell` are
implied and are deliberately not written — the example's own note, and a test
asserts it in both bindings. The three fields are spin buttons in a group whose
name is the whole date.

**The one deliberate departure, with its cost written:** `PageUp`/`PageDown`
step the year by ten rather than by the pattern's five. Five years is not a
page of years, and ten is the step the calendar's own year view uses, so the
two agree. The cost — a reader who learned five from another spin button on the
page — is in `contract.json` under `departures`.

The APG example is marked deprecated for its **visible arrow buttons**, which
duplicate keys the reader already has. None is drawn; the roles, the wrapping
rules and the `aria-valuetext` guidance are taken whole.

## 7. Accessibility

Name, role, state, keyboard, focus, forced colours and target size are complete
for every state the three contracts declare. The specific decisions:

- The group's accessible name is the whole date in words, from a hidden element
  the group's own `aria-labelledby` points at — the example's own technique.
- A month announces its name rather than its number: "nine" is not September in
  any language a reader is thinking in.
- The calendar's heading is a polite live region, because paging with a key
  changes nothing that focus lands on.
- A column header shows the locale's narrow weekday and carries the full name
  in `abbr`.
- A refused date keeps `aria-disabled` and stays focusable, and is struck
  through as well as dimmed — colour alone says nothing under forced colours.
- Every state that matters is a shape as well as a colour: today is a dot,
  focus is a ring, a range is a band bracketed by two solid ends and two rules
  in the accent border, and the `high-contrast` scheme was captured to check it.
- The touch target is recovered outside the paint wherever the drawn box falls
  under 24 pixels, in all three families.

**Not verifiable on this machine:** a real screen reader, a real touch device
and the operating system's own high-contrast mode. What was checked in their
place: the accessibility attributes in both bindings' specs, the
`forced-colors` block in each stylesheet, the `high-contrast` scheme captures,
and `packages/styles/src/masked-glyph.test.mjs`.

**The change that would most improve it, and it was made:** today and focus
were one ring. A reader arrowing onto today saw a single box and could not tell
which of the two facts it was.

## 8. Native API

React is React: `useId`, context providers, `render` on the root of each
family, `ref` to a named handle, props typed as the native element's extended,
and the consumer's `onKeyDown` and `onPaste` composed rather than replaced.

Angular is Angular: standalone components, `input()`/`output()` signals,
`computed`, `host` metadata, `exportAs`, `HostAttributeToken` before every host
binding that could write over a consumer's attribute, `DestroyRef` for the
layer, and `OnPush` throughout.

**The asymmetry, recorded rather than levelled:** `SlDateField` implements
`ControlValueAccessor` **and** `Validator` — `min`, `max` and
`isDateUnavailable` are validity this control owns and no other validator can
see — and React has no equivalent of either. React has `render` on the root and
a handle; Angular has `exportAs`, projection slots and a signal-typed instance.

**The change that would most improve it, and it was made:** a controlled
`[value]` on the Angular field only ever reached the control once, in
`ngOnInit`, so the picker wrote a date the field never showed. An `effect`
syncs it now, and only when the value names a different date — written on every
change detection it would throw away a half-typed date on the keystroke that
completes a different one.

## 9. Capability

Measured against the inventory, not against the scope paragraph. Every
table-stakes row is `adopt` or `adapt` except:

| Declined or deferred                     | What owns it instead                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| A non-Gregorian calendar system          | Nothing today. It is an axis with one value, so its arrival is not a contract break. Wave 8. |
| Time-of-day granularity                  | `time-field`, wave 8. The segment engine already takes hour, minute and second fields.  |
| A zoned value type                       | Nothing. `timeZone` answers "what is today" and the value has no zone; §11 of the design records the reasoning. |
| Opening the surface on focus             | Two lines of consumer code, from the imperative handle the family already exposes.      |

Four mutable values across the three families, each with a controlled and
uncontrolled pair, a request carrying a reason, and a row in the state matrix:
`value` on all three, `current` (the focused date) on the calendar, and `open`
on the picker.

**The change that would most improve it, and it was made:** a run of typed
digits moved the value on every keystroke, so typing `2026` into a year asked a
consumer four times and passed through the years 2, 20 and 202. The request now
arrives when a run ends — on the digit that fills a field, on the key that
leaves it, or on blur, where a short year resolves through the pivot.

## 10. Ecosystem integration

Both integration tables in `references/frameworks.md` are answered line by line
in §7 and §8 of the design document, and every line has a file behind it.

The three points worth naming: a form gets the value with no JavaScript, from a
hidden ISO input in the field; an application sets the locale, the zone and the
pivot once, through a provider in React and an injection token in Angular; and
a reactive form drives the Angular control through `ControlValueAccessor` and
reports the family's own rules through `Validator`.

**The change that would most improve it, and it was made:** the picker's
`Alt`+`ArrowDown` chord was being eaten by the field's own segment handler,
which stepped the day on it. `Alt` with an arrow is not the field's chord, and
the field leaves it alone now.

## 11. Documentation

Six reference pages — three families, two frameworks — each with the import,
the anatomy row by row, one captioned demonstration per declared scenario with
the code that produced it, the inputs, the outputs, the composition surface and
at least three accessibility decisions. Thirty-seven scenes in all. Every
snippet is Prettier-formatted and checked.

**Not done, and it is the honest gap:** the rendered pages have not been read.
`specs/reference-pages.test.mjs` and each family's stories spec pass, which
proves the pages exist and hold what the contract declares — but the defects
dimension 11 exists to catch are the ones only a browser shows. Both Storybooks
need a restart before they can be read: React because the new subpath exports
in `packages/styles/package.json` are invisible to a running Vite server, and
Angular because it reads the entry-point directories once, at startup.

`node tools/harness/audit.mjs` on the six URLs is the first thing to run after
that restart.

---

## §18 — the twelve criteria

1. **Purpose, uses and anti-uses.** Each page's description and the inventory's
   §2. The anti-use is stated where it matters: a `time-picker` is not a
   calendar, and its panel is a `listbox`.
2. **Anatomy and stable parts.** Eight, seventeen and eight parts, declared in
   the contracts and documented row by row on six pages.
3. **Controlled/uncontrolled and events with a reason.** Four mutable values,
   four models, and one closed reason vocabulary.
4. **State matrix.** In each contract under `stateAttributes` and
   `dataAttributes`, and drawn in the harness fragments.
5. **Keyboard, focus, ARIA, touch, screen reader.** §5 of the design, key by
   key, with a test per key in both bindings.
6. **Size, density, variant recipes from tokens.** Three sizes and three
   variants on the field and the picker; the calendar takes its size from the
   control scale and its density from the theme.
7. **Responsive, RTL, locale, reduced motion.** All four, and the locale is the
   deepest of them: order, separators, placeholder, month names, weekday names
   and the first day of the week all come from `Intl`.
8. **Loading, empty, error, disabled, extreme content.** Empty is a real state
   here and not the absence of one — a half-typed date. Long month names, a
   four-hundred-year jump and a hundred refused dates are all in the stories.
9. **SSR, performance, virtualisation.** `useId` and a sequence counter for
   identity; today is resolved after the first paint in both bindings, because
   a server and a browser in different zones disagree about it. The predicate
   runs once per visible cell.
10. **Examples, composition, edge cases, theming, in context.** Thirty-seven
    scenes, each captioned with what to look at.
11. **Behavioural tests shared between the bindings.** 34 and 28 for the field,
    33 and 30 for the calendar, 21 and 20 for the picker, over the same
    conceptual contract.
12. **Changelog, stability, migration.** Three new families; nothing breaks,
    because nothing depended on them. The one future break the axes prevent is
    a second calendar system.
