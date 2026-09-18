# `tags-input` — self-assessment

Written 2026-09-14 after both bindings, both reference pages and the automatic
gates. Inventory in `2026-09-14-tags-input-capability-inventory.md`, design in
`2026-09-14-tags-input-design.md`. Every dimension names the one change that
would most improve it, and says whether it was made.

## Evidence

- Harness: `tools/harness/out/tags-input.html`. Captures read: light, dark and
  high-contrast at 420; light at 240; light dense; light rtl — nine scenes each
  — plus focus on the input (`anatomy`), on a chip (`rows`, dark) and on the
  clear button (`states`). The invalid chip, the locked chip, the read-only
  row, the collapsed row at rest and expanded, the narrow frame, the limit
  counter at rest and complete, and the `data-current` edge are all in scenes.
- Contract: `specs/components/tags-input/contract.json`, 27 tests.
- Core: `packages/core/src/tags/tags.test.ts`, 17 tests.
- React: `packages/react/src/tags-input/tags-input.test.tsx`, 28 tests;
  `tags-input.stories.test.ts`, 4.
- Angular: `packages/angular/tags-input/src/tags-input.spec.ts`, 18 tests;
  `tags-input.stories.spec.ts`, 4.
- Reference pages: React read at 1280 and 720 in light and dark, docs and story
  views, every code drawer open; `tools/harness/audit.mjs` clean at 1280 and
  620 (29 stages, no finding). Angular page not read: the running Storybook on
  6007 predates the entry point and needs a restart.

## 1. Icons

The alert mark on an invalid chip is `--slotted-icon-circle-alert` as a mask in
`tag`'s `start` slot, painted `currentcolor`, `forced-color-adjust: none` in
forced colours; the clear button draws `--slotted-icon-x`; the chip's remove
control is `tag`'s. No character is an icon.

**Improvement:** a mark on the `+N` count chip so a pointer reader sees it is
pressable. Not made: the outline variant already separates it from a value,
and a plus is not a glyph the scale holds for this meaning.

## 2. Motion

The frame's border, ground and lift transition on focus over
`--slotted-control-transition-duration`; the `data-current` edge on the chip
that answered a duplicate holds for `--slotted-duration-long`, read from the
computed style rather than a literal. No transition on chip arrival, reorder
or the collapsed row expanding — each recorded with its reason in the contract
(`motion`).

**Improvement:** a transition on the `data-current` edge leaving. Made: the
edge is `tag`'s own `--_border`, and `tag.css` already transitions
`border-color`.

## 3. Responsiveness

The row wraps to three lines and scrolls; under 120 pixels `createWidthGate`
withdraws the chips and the counter answers; `overflow="collapse"` keeps one
line and expands while focus is inside. Read at 240 (chips truncate, the field
takes its own line when it must), 420 and 720.

**Improvement:** the narrow-column demonstration on the reference page shows
360 pixels, not 120, because the workbench has no primitive narrower than
`.slotted-demo-measure`. Not made in this session: the honest caption says
what the stage shows and the harness `overflow` scene shows the 104-pixel
frame; a `data-width="cell"` on the measure primitive is a workbench change in
its own commit.

## 4. Refinement

Read every capture at full size. The frame is `text-field`'s arithmetic; a
control with one row of chips is the height of an empty one at every density
and every size, and the chip keeps two pixels of air at every step. That is
the correction the reviewer asked for at the release gate: `tag` keeps a
12-pixel type and a two-pixel inset while the control falls from 34 pixels to
26, so at `dense` the chip stood edge to edge and at `sm` taller than the
frame — `multi-select` recorded the same and called it the honest price. Here
the chip's block inset yields to the room the frame has (`--_chip-inset`,
clamped to `tag`'s own step), the type stays legible, and the remove control
keeps its 24-pixel target through `tag`'s halo. The counter sits on the
frame's centre line beside two rows; the clear button's glyph ends where the
text begins on the other side. Read-only chips keep full ink and differ from
disabled ones, which was the correction taken from the first capture.

**Improvement:** at `lg` the small chips read light inside the 38-pixel frame.
Not made: the chip is a chip and not a control, and `multi-select` made the
same call; a chip step that followed the frame would be a second chip scale.

## 5. Tokens

`packages/styles/src/tags-input/tags-input.tokens.json` lists the 81
properties the sheet reads; every family token falls back to a semantic or
control token; the one literal in the sheet is the `0px` floor in a `max()`,
which the foundation exempts. `--slotted-tags-input-icon-size-min` and
`--slotted-tags-input-action-size` are the two family tokens the inner-control
rule asks for.

**Improvement:** made. The first cut set `tag`'s private `--_inset-block` and
`--_border` from this sheet, which `chip-preview.test.mjs` refuses of a host.
`tag.css` now reads two public tokens — `--slotted-tag-inset-block` and
`--slotted-tag-border-color` — and the host sets them on its row; the same
change went into `multi-select.css`, at the reviewer's request, with the
geometry that keeps a chip inside a `dense` frame.

## 6. Patterns

The Grid pattern's layout-grid half, item by item, in the design document §4:
roles, the one tab stop, arrows mirrored under `rtl`, `Home`/`End`, the
editable-cell `Enter`/`Escape`, the alphanumeric branch. Two departures with
their cost in the contract: `ArrowDown`/`ArrowUp` unanswered on a one-row grid,
and focus on the cell rather than on the remove button inside it. The combobox
pattern is not cited, because the input opens nothing.

**Improvement:** `PageUp`/`PageDown` over a long row. Not made: the pattern
marks them optional, and one DOM row that scrolls by focus has no page.

## 7. Accessibility

One tab stop; a description on the row naming `Delete` and, when editable,
`Enter`; `aria-invalid` and a description on an invalid cell, and the same
reason as the input's custom validity; announcements for add (with the reason
when invalid), remove (with the count left), move, duplicate, limit and copy;
focus after a removal by `createRemovalFocus`; forced colours keep both masks.
Tested in jsdom for the attributes and the focus destinations; a screen reader
and a touch device were not available on this machine.

**Improvement:** the invalid chip's `title` is a pointer-only affordance. Made
partly: the description carries the same text for assistive technology; a
visible message is the field's error, which the consumer writes.

## 8. Native API

React: props are `ComponentPropsWithRef<'input'>` less the family's axes;
`ref` is the input, `handleRef` the handle, `render` the frame; every handler
composes. Angular: `model()` for `value` and `inputValue`, `output()` for each
request, `ControlValueAccessor` and `Validator`, `exportAs`, `HostAttributeToken`
for `id`. The visible input keeps `type`, `pattern`, `list`, `inputmode`,
`autocomplete`, `placeholder`, `required` while empty, and `setCustomValidity`.

**Improvement:** Angular's `validateValue` where React says `validate`, because
`validate()` is the `Validator` interface's own method on the component. Not
levelled: recorded in the contract (`validity.angularInput`) and on the page.

## 9. Capability

Against the inventory: every table-stakes row is `adopt`, `adapt`, a `decline`
naming the composition, or a `defer` naming the family. Both mutable values
have a controlled and uncontrolled pair and a reasoned request; the differentiators
— held invalid values, platform validation, keyboard reorder, direction-aware
arrows, the collapsed row that opens on focus, copying the list — are each a
scene on the page. Nine parts, seven states, fifteen axes.

**Improvement:** `Ctrl+A` selecting every chip for one `Delete`. Not made: the
inventory declines chip selection with the composition (`Ctrl+X` per chip),
and the clear button already takes the whole list.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` answered in the design document §8
and §9. Defaults once in both bindings; the Angular control belongs in a
Reactive Form and reports `invalidValues` by name; the React control blocks a
native submit through `setCustomValidity`; `field` supplies id, description,
error and states in both.

**Improvement:** a React `useTagsInputValidity()` hook exposing the verdicts
for a consumer who owns `value`. Not made: the consumer owns `validate` and
can run it; the DOM carries `data-invalid` per chip for anything else.

## 11. Documentation

Twenty scenes per page, one per contract scenario; import, anatomy, inputs
with every default, outputs for both models and the two reports, composition,
five accessibility decisions, the DOM anatomy and the theming snippet. React
page read rendered at 1280 and 720 in both schemes, docs and story views,
drawers open; audit clean at 1280 and 620. Two corrections came from reading
it: a snippet wider than its drawer, and the example address `jhon@company`,
which the platform's email grammar accepts — it is `jhon.company` now,
everywhere the family claims the browser refuses it.

**Improvement:** the Angular page read rendered. Not possible in this session
without a Storybook restart, which the briefing says to ask for at the gate.

## Section 18, in order

1. **Purpose.** A list of texts the reader brings — addresses, identifiers,
   keywords. Anti-use: a set of known options, which is `multi-select`.
2. **Anatomy.** `root`, `control`, `chips`, `field`, `input`, `message`,
   `counter`, `clear`, `hint`; the chip is `tag`.
3. **Contract.** `value`/`defaultValue`/`onValueChange` with `submit`,
   `remove`, `clear`, `keyboard`, `programmatic`; `inputValue`/
   `defaultInputValue`/`onInputValueChange` with `keyboard`, `submit`, `clear`,
   `blur`, `programmatic`. Uncontrolled reads the initial value once.
4. **State matrix.** `disabled` > `readonly` > `invalid` on the root;
   `complete` at the limit; `expanded` while collapsed and focused; `current`
   on the chip that answered a duplicate; per chip `data-invalid`,
   `data-disabled`.
5. **Keyboard, focus, ARIA.** Contract `keyboard` (19 keys) and `focus`;
   tested in both bindings.
6. **Recipes.** `size`, `variant`, three densities through the control scales.
7. **Responsive, RTL, locale, reduced motion.** §3 above; arrows mirrored;
   duplicates by `Intl.Collator`; no looping motion.
8. **Loading, empty, error, extreme content.** No loading state — nothing
   travels; empty is the placeholder; error is the held invalid chip; a
   60-character value truncates in the DOM.
9. **SSR.** `useId`; nothing measured during render; effects for the gate and
   the collapse.
10. **Examples.** Twenty scenes, one domain.
11. **Shared behavioural tests.** The same scenarios in both suites.
12. **Migration.** New family; nothing breaks.
