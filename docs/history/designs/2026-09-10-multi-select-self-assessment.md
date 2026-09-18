# `multi-select` — self-assessment

Against `.claude/skills/component/references/rubric.md`, eleven dimensions, and
against `docs/component-features.md` §18. Inventory in
`2026-09-10-multi-select-capability-inventory.md`, decisions in
`2026-09-10-multi-select-design.md`.

The rubric's scoring rule is followed: each dimension names the one change that
would most improve it and says whether it was made.

## 1. Icons

Four marks, every one a mask from a glyph token: the chevron
(`--slotted-icon-chevron-down`), the clear cross (`--slotted-icon-x`), the check
on a chosen option (`--slotted-icon-check`) and the plus on the offer to add
what was typed (`--slotted-icon-plus`). No character is used as an icon.
`packages/styles/src/masked-glyph.test.mjs` holds the `forced-color-adjust: none`
on all four, and the `forced-colors` block adds the create mark beside the check.

The chevron is mirrored by nothing, because it points down on both sides of the
mirror; the row's arrows are keyboard, not artwork.

**The one change:** the offer to add a value drew the same check as a chosen
option, which said "this is in the set" about something that is not. It now
draws the plus. **Made**, and the reason is in the stylesheet beside the rule.

## 2. Motion

Three transitions, each carrying information, and one deliberate absence.

- The frame transitions `background-color`, `border-color` and `box-shadow` on
  the control's own duration and easing, which is what makes hover, open,
  invalid and disabled read as one control changing.
- The chevron rotates 180° when the popup opens: the one movement on the closed
  control, and the only thing that says it opens at all.
- The popup arrives along the axis it opens on, as a keyframe animation rather
  than a transition, for the reason `select` and `combobox` record: the
  positioner writes `data-side` in the same style update as the layer opens, so
  a transition would set out from the wrong side's closed style.
- Chips arriving and leaving carry **no** transition. A chip that faded in would
  delay the row's reflow behind it, and the reader has just pressed a key.

Reduced motion drops the movement and keeps the fade, from the shared block.
Nothing loops.

**The one change:** reorder is a state change the eye has to follow and it is not
animated, because a transition across a DOM reorder needs a measured FLIP on
every press. What the eye follows instead is the focus ring, which travels with
the chip, and the announcement, which names the new position. **Not made**, and
recorded in `contract.reorder.motion` rather than left unsaid. It is the first
thing to revisit if the library ever grows a FLIP helper in `packages/core`.

## 3. Responsiveness

The control answers its own inline size in two ways, and neither is a viewport
query.

- The row **wraps**, so the frame grows by whole rows to three and then scrolls.
  Measured at `comfortable`: one row 34, three rows 86, and the cap is exact —
  box 84, scrollport 84, content 140 with sixteen values.
- Under **120 pixels** the chips withdraw and the counter answers instead. It is
  `createWidthGate` and not `container-type: inline-size`, because a container
  type would stop the frame's own width depending on its contents — which is
  exactly how a control that is not `fullWidth` is measured. `select` recorded
  the same finding.

Read at 240, 420 and 720, in three schemes, three densities and both directions.
At 240 the nine-value control shows three whole rows and no sliver; the long
service names truncate inside their chips; the popup messages stay inside the
surface.

**The one change:** `align-content: center` on a scrolling box pushed the first
three chips above the scrollport with no way back to them at 240 pixels. It is
now `safe center`, which falls back to `start` exactly when the content
overflows. **Made.**

## 4. Refinement

Read every capture at full size in both schemes, including the four state
captures. The frame, the chips and the two buttons share one rhythm: the chips
are four pixels apart, the row is four pixels from the actions, and the actions
are two apart from each other.

Four defects came out of the reading rather than out of a test:

1. A **scrollbar inside the control's own frame** — a bar in a field frame takes
   width from the chips, moves them when it appears and paints a second edge
   inside the control's own. The scrolling is kept and the bar refused.
2. A **fourth row as a four-pixel sliver**: the three-row cap counts rows, gaps
   and air, and the row was a content box.
3. **`empty` and `status` hanging out of both sides** of a `width="content"`
   popup, because `min(12rem, 100%)` collapses during intrinsic sizing.
4. The **`+N` chip drawn exactly like a value**, so it read as a value named
   "+3". It now wears `tag`'s outline variant.

Focus: the frame carries the ring for the field, a chip carries its own with two
pixels of offset, and the frame gives up its outline while a chip's ring is
inside it, so one focus is never two rings. Disabled stays legible rather than
faded. Nothing shifts by a pixel between states.

**The one change:** the last chip stood two pixels from the clear button while
the chips stood four from each other — the boundary between the values and what
acts on them was tighter than the rhythm inside it. Whichever part follows the
row now takes the row's own gap. **Made.**

## 5. Tokens

113 declared, generated from the sheet by the same regex `tokens.test.mjs` uses,
so the list and the stylesheet cannot disagree. Every family token falls back to
a foundation token or to one of the documented exemptions. No literal outside
them, no parallel scale: the control geometry, the type, the glyph sizes, the
motion durations and the radii are all read directly.

Two arithmetic values are private custom properties rather than tokens, because
they are geometry rather than decisions: `--_row-air`, the air above and below a
row, and `--_row-size`, one row's height.

**The one change:** `--_row-air` was a flat space step, and it made a control
holding one chip two pixels taller than an empty one at `dense` — a form of
mixed fields went ragged the moment a value was chosen. It is now the smaller of
the step and the room the control's own height leaves. Measured after: 34/34,
28/28, 26/26. **Made.** The one density it cannot close is `sm` with `dense`,
where the control is 24 pixels and the chip inside it is 24; the two pixels are
recorded in the sheet.

## 6. Patterns

Two pages, both fetched and transcribed on 2026-09-10, not recalled:

- [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — the input, its
  role, `aria-expanded`, `aria-controls`, `aria-activedescendant`,
  `aria-autocomplete`, and both key tables.
- [Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), the **layout grid**
  half, which names this control by example: "a list of recipients for a message
  may be a grid where each cell contains a link that represents a recipient."

The itemised comparison is in the design §4.1 to §4.4 — every requirement, every
key, with what this family does. Twenty-one keys are in `contract.keyboard`, each
with its effect, where focus lands, and whether the source is the pattern, the
grid, the platform or this family.

Three departures, each with what it costs and which surveyed implementations
agree, in `contract.departures`: selection does not follow focus, `Enter` does
not close, and focus sits on the cell rather than on the remove button inside it.

**The one change:** the first version answered `ArrowDown` and `ArrowUp` from the
grid as well as from the popup, which is two grids under four arrows. The row is
now one DOM row, so the cross-axis keys have nothing to do and belong to the
popup alone. **Made**, and it is the decision the whole anatomy rests on.

## 7. Accessibility

One tab stop: the field. Every chip, both buttons and the popup are outside the
tab sequence, which is what the combobox pattern asks of a popup indicator and
the grid pattern of a layout grid.

Names: the field takes the `field`'s own `label` element natively; the grid
carries the count; a chip carries `Remove {label}`, and `{label}, position N of
M` while reorder is on, so its place is heard as well as seen.

Announced, not only drawn: a value added with the count now held, a value
removed with the label that left and the count that is left, a value moved with
its new position, and the limit when it is reached. Four sentences, through
`createLiveAnnouncer`.

Forced colours: the highlight takes `Highlight`/`HighlightText`, every masked
glyph keeps `forced-color-adjust: none`, and the `plain` variant takes a
`ButtonBorder` back so a borderless control is still a control.

**The one change:** a full control silently ignored a press, which is a control
the reader presses again — PrimeNG's and Zag's failure both. Unchosen options now
answer `aria-disabled`, the root carries `data-complete`, the counter says the
number, and one live message says the limit was reached. **Made.**

**Not verifiable here:** a real screen reader, a touch device and a 400% zoom.
What was checked in their place: the accessibility tree through the roles and
attributes the two specs assert, the `forced-colors` block read against the
theme's own mapping, and every target floored at `--slotted-target-min` by
`inner-control.test.mjs`.

## 8. Native API

React is React: function components, `useId` for every identifier, context for
the compound family, `render` per part, `ComponentPropsWithRef` for part props,
composed handlers, and a `ref` handle for the five imperative actions.

Angular is Angular: standalone components, `input()`/`model()`/`output()`
signals, `computed` for derived state, `host` metadata rather than
`@HostBinding`, `ViewEncapsulation.None` with the one authored sheet,
`exportAs`, `inject()`, `HostAttributeToken` for an `id` the consumer wrote, and
`takeUntilDestroyed`/`DestroyRef` for every handle.

Neither imitates the other. The asymmetry is recorded rather than levelled: the
Angular binding has a `Validator` reporting `required`, `tooMany` and
`duplicate` that React has no equivalent of, and React has a `render` prop that
Angular answers with projection.

**The one change:** `MultiSelectControl`'s `render` dropped the ref the width
gate measures the frame with, which would have lost the narrow-width behaviour
silently — the failure `toolbar` recorded when it replaced a positioner's
anchor. The ref is now in the props `render` receives. **Made.**

## 9. Capability

Against the inventory, not against the scope paragraph. Twenty-five table-stakes
rows: twenty-three `adopt` or `adapt`, one `decline` naming the two lines of
consumer code that replace it (`select all`), one `defer` naming the module and
the wave (`virtualization` → `collection`).

The six the scope paragraph named all ship: removable chips, creation, limits,
duplicates, reorder and paste. So do eight the paragraph did not: editing a chip
in place, a delimiter key, a blur commit, a value predicate, hiding chosen
options, a counter, the refusal report and the `chosen` band.

Four mutable values, each with a controlled and uncontrolled pair, a request
carrying a reason from the closed vocabulary, and a row in the state matrix:
`selection`, `value`, `open`, `current`. The keyboard table is checked key by
key against both patterns, with the focus destination on every row.

Differentiators shipped: keyboard reorder that none of the eight has; arrows that
follow the writing direction, which Zag and Material both get wrong; a limit that
is a validity rather than a silence; a measured `+N` rather than a declared one;
and three schemes and three densities on a chip row.

**The one change:** the family was going to ship `chips` and stop, since that is
what the scope paragraph could be read as asking. The inventory put the field
beside it and found eight more capabilities two or more implementations ship.
**Made** — the inventory ran before any code, which is what produced them.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered in the design, §7 and §8,
line by line. In the implementation:

- React: defaults once through `MultiSelectDefaultsProvider`; every part takes
  `render`; the consumer's handler runs first and a `preventDefault` stands the
  family down; `ref` to the input and a named handle; `useId` and no layout read
  during render; every state in the DOM as `data-*`; part props are the native
  element's, extended.
- Angular: `model()` for all four values and an `output()` carrying the reason
  beside each; `ControlValueAccessor` **and** `Validator`; an injection token and
  `provideMultiSelectDefaults()`; `exportAs`; projected content; signals
  throughout with no `markForCheck`; `takeUntilDestroyed`; `HostAttributeToken`;
  one class per entry point.

Forms: one hidden input per value under the same name in React, so a plain
`FormData` receives several values under one key and a native `reset()` restores
them; a form control in Angular.

**The one change:** `onValueRefuse` did not exist, and a duplicate, a value past
the limit and a value the predicate turned down all vanished — the four silences
the inventory found in the field. One event now carries the values and the cause.
**Made.**

## 11. Documentation

Two pages written against `references/stories.md`: the import, the anatomy of all
twenty-five parts, nineteen demonstrations — one per declared scenario — each
with a title, a caption and the code that produced it, the full API table with
every declared default, the event table, the composition table, four
accessibility decisions, the anatomy as it reaches the DOM, and the theming
snippet.

One domain across both pages, as the reference asks: an incident report, with
real service names, real labels and real responders.

`referencePageErrors`, `apiMetadataErrors`, `scenarioCoverageErrors` and
`snippetFormatErrors` all pass in both frameworks — 6 story tests each.

**Both pages have been read rendered**, after the reviewer restarted both
Storybooks. Each was audited at 1280 and 620 through `tools/harness/audit.mjs` —
**32 stages, no collapsed sliver and no overflow** on either, at either width —
and read as pictures at 1280 in light and in dark, in nine slices covering all
27 000 pixels.

Seven defects came out of that reading, and every one is the kind the dimension
exists to catch: invisible offline, obvious in the picture.

1. **The page did not answer at its own address.** `title: 'Components/MultiSelect'`
   generates the id `components-multiselect--reference`, where every instruction
   in this repository addresses a family's page as `components-<family>--reference`
   and every neighbour — `Components/Description List` — spaces the words. The
   title is now `Components/Multi Select`.
2. **Ten demonstrations sat in a mostly empty canvas.** The viewport box is there
   to give a layer room, and the popup is closed on the reference page by design,
   so a scene with no layer was a 34-pixel control at the top of a 208-pixel box.
   The box is now only as tall as it needs to be: thirteen rems while a popup is
   open, four rems when none is, and no box at all for a scene that never opens
   one.
3. **Half the scenes were two or three columns wide**, and at a third of the page
   the chips truncated to `chec… ×`. `references/stories.md` says a family that
   reflows, wraps or truncates takes one column. Every scene now does.
4. **The ring and the waiting rows were not painted at all.** The family renders
   `data-ui="spinner"` and `data-ui="skeleton"` and imported neither sheet, so
   the ring measured **0 × 0** on the rendered page with no border and no
   animation. Both sheets are now imported in React and listed in the Angular
   `styleUrls`; measured after: 18 × 18 with `slotted-spinner-turn` running, and
   three skeleton rows on the open surface.
5. **A caption said something the picture did not.** "The surface waits as rows
   the height of an option" stood over a surface that also held a matched option,
   because a control that is loading keeps what it has already found. The caption
   now says that.

6. **The Angular form scene threw at runtime.** `SlField` is the attribute
   directive `[slField]`, not an element: `<sl-field>` instantiated nothing and
   the `slFieldLabel` beside it then injected a provider that was never created —
   `NG0201`, and the whole story replaced by Storybook's error box. It is now
   `<div slField>`, in the story and in the snippet a reader would paste. No
   offline test caught it, and none could: the story specs read the returned
   `props` and `template` and never compile the template.
7. **One scene's controls were a third of the width they should be.** Two fields
   inside `.slotted-demo-stack`, whose `justify-items: start` shrink-wraps its
   children: the field div took its max-content width and the controls filled
   192 pixels of a 676-pixel stage. The fields now sit directly on the stage,
   which stretches them. Measured after, on both pages: 32 scenes, and the only
   control narrower than its stage is the 360-pixel one the narrow-width
   demonstration exists for.

**The one change:** the API tables scroll sideways and the last column is cut
until the reader scrolls. It is not this family's — the workbench declares column
minima of 17, 20 and 26 characters that together exceed the 710-pixel content
column, `combobox`'s page measures identically, and the decision is written in
`workbench.css`: "the table already scrolls; a column that is too narrow to read
does not." **Not made**, because taking it would alter sixty pages on another
lane's watch. It is reported instead.

## §18, criteria by criteria

1. **Purpose, uses and anti-uses.** A frame of chosen values with a field that
   adds more. Not for one value of a known set — that is `select`; not for one
   typed value — that is `combobox`. The boundary is written in the design §1.
2. **Anatomy.** Twenty-five parts, stable, in the contract and in both pages.
3. **Controlled and uncontrolled.** Four values, each with both modes and a
   request carrying a reason. Reasons: six for the selection, six for the text,
   eight for the popup, three for the highlight.
4. **State matrix.** Thirteen states, nine of them attributes. `complete` says a
   full control, from the vocabulary's own second reading of the word.
   Precedence is the shared order, held by `states.test.mjs`.
5. **Keyboard, focus, ARIA, touch, screen reader.** Twenty-one keys documented
   and tested; focus rules including the three-step removal; roles and
   attributes asserted in both bindings. Touch: every target floored at
   `--slotted-target-min`, and the theme grows controls under
   `(pointer: coarse)`. A real screen reader and a real touch device are the two
   things this machine cannot check.
6. **Recipes.** Three sizes, three variants, three densities, three schemes — all
   through tokens, none through a family scale.
7. **Responsive, RTL, locale, reduced motion.** The wrap, the narrow-width gate,
   logical properties throughout, a locale-sensitive filter and duplicate rule,
   and the shared reduced-motion block. The RTL capture is a true mirror,
   including the create offer's quotes, which needed `unicode-bidi: plaintext`.
8. **Loading, empty, error, disabled, extreme content.** All five, in the harness
   and on both pages.
9. **SSR, performance, virtualization.** `useId` and no layout read during
   render; the collapse and the width gate are effects; virtualization is
   deferred to the collection engine with the reason written.
10. **Examples.** Nineteen demonstrations per page, in one real domain.
11. **Shared behavioural tests.** 27 in React, 16 in Angular, over the same
    conceptual contract.
12. **Changelog and migration.** No contract break: the family is new. What it
    takes from `select` and `combobox` is written in the inventory §5, and
    neither of their contracts changes.

## Shared tooling this family found, and fixed

Each is its own commit, before the family's own, as the briefing requires.

- `packages/core/src/focus/arrow-navigation.ts` answered a **modified** arrow, so
  the ring consumed `Alt`+arrow and moved focus where a chip should have moved.
  Nothing failed loudly. Fixed with a test.
- Seven ratchets in `packages/styles` enumerate families by hand and listed none
  of this one: `chip-preview`, `inner-control`, `option-mark`, `overlay-motion`,
  `plain-variant`, `selection-block`, `waiting`. `chip-preview` needed a real
  generalisation — two hosts with their own row selector, a gap assertion that
  follows one alias hop to the space scale, and the `chosen` band checked per
  host. It immediately found a genuine defect: this family's option-label rule
  was unscoped and reached a chip's own `label` part inside the control.
- `tools/storybook-workbench/src/scenarios.tsx` typed a contract default as
  `string | number | boolean`, so a family could not declare `null` for a value
  whose absence is the behaviour, or a list for a setting that is plural. Both
  are honest defaults and both now type.

## Known problems

- The API tables scroll sideways on every family's page, this one included: the
  workbench declares column minima of 17, 20 and 26 characters that together
  exceed the 710-pixel content column, and the last column is cut until the
  reader scrolls. Measured identically on `combobox`'s page. It is a written
  decision of the shared tool — "the table already scrolls; a column that is too
  narrow to read does not" — and changing it would alter sixty pages on another
  lane's watch, so it is reported rather than taken.
- At `size="sm"` with `density="dense"` a control holding a chip is 26 pixels
  where an empty one is 24, because a chip cannot be shorter than the target its
  remove control needs. Recorded in the sheet beside the rule.
- In `high-contrast` the invalid border is indistinguishable from the default
  one, because that scheme paints every border black. It is the theme's decision
  and every framed control in the library shares it.
- **The story specs never compile a story's template.** They read the returned
  `props` and `template` and assert on their shape, so an Angular template that
  cannot be compiled — a directive selector written as an element, in this
  family's case — passes every offline check and fails only in the browser.
  Generalising the checker to mount each story in a TestBed is a change to a
  shared tool that every family's spec runs, and it is reported rather than taken
  in the middle of two other lanes.
- `select` and `combobox` render `data-ui="spinner"` and `data-ui="skeleton"`
  and import neither sheet, exactly as this family did: the ring measures 0 × 0
  on `select`'s own reference page. Neither binding is this session's to edit;
  the repair is the two import lines now in `multi-select.tsx`.
- `select.css:1409` and `combobox.css:878` carry the same
  `min-inline-size: min(12rem, 100%)` this family had to repair, and both offer
  `width="content"`. Neither sheet is this session's to edit; the repair is the
  three declarations now in `multi-select.css`.
