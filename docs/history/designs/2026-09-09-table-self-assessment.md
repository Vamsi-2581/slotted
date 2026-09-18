# Table self-assessment

Against `.claude/skills/component/references/rubric.md` and §18 of
`docs/component-features.md`. Every dimension names the one change that would
most improve it and says whether it was made.

Evidence: the harness at `/home/dreco/dev/slotted/tools/harness/out/table.html`,
the captures in `/tmp/claude-1000/table-shots/`, the contract at
`specs/components/table/contract.json` (27 cases), the React binding
(22 cases), the Angular binding (17 cases), and the two reference pages.

---

## 1. Icons

Two marks, both masks from glyph tokens: `--slotted-icon-chevron-down` for the
sort direction, turned a half turn for ascending, and
`--slotted-icon-chevron-right` for the expander, turned a quarter turn when the
detail opens and mirrored under `:dir(rtl)`. Neither is a character. Both keep
their ink under forced colours through `forced-color-adjust: none` inside the
`forced-colors` block, which is where `masked-glyph.test.mjs` requires it.

**Would most improve it:** a dedicated unsorted mark — the double chevron every
data grid draws — instead of the sorted glyph shown muted.
**Made:** no. It would add a token to the foundation for one family, and the
muted-then-revealed treatment says the same thing with the scale that exists.
The cost is written in the design document: a pointer discovers sortability
first, and the button's accessible name says it either way.

## 2. Motion

Three transitions, each on a change the eye follows: the sort mark's rotation
and opacity, the expander's rotation, and the ground under a hovered control.
All read `--slotted-control-transition-duration` and
`--slotted-control-transition-easing`, so `prefers-reduced-motion` collapses
them through the theme. Nothing loops. `motion.test.mjs` passes; the first
version wrote `120ms` as a fallback literal and it was rejected, correctly.

**Would most improve it:** animating the detail row's height on open.
**Made:** no. The row is a table row, and a `tr` cannot be transitioned between
`0fr` and `1fr` the way `collapsible`'s grid track can; the alternative is
measuring the content, which is the thing `collapsible` records as wrong.

## 3. Responsiveness

The family answers its own inline size by scrolling rather than by reflowing,
which is what §12 asks of a table and what the card transformation is declined
for. Read at 240, 420 and 720: the table clips at the frame with a column cut
mid-word, which is itself the cue, and nothing overflows the root. It declares
no container query, so it takes a `block` stage.

**Would most improve it:** a `priority` axis dropping low-priority columns
below a width.
**Made:** no, and it is declined by name to `column-manager` in wave 8, which
is the family that can refuse to hide a mandatory column. Hiding a column here
would also remove content from the DOM, which the briefing forbids.

## 4. Refinement

Four defects came from the captures rather than from a test, and each is fixed
with the cause written beside it: the sort mark sat at the top of its line
(`stretch` resolving to `flex-start` under a stated block size); the expander
sat at the top of its own box (`place-content` aligns lines, not items); the
same expander stood two pixels under the identifier it opens (a 24-pixel target
beside a 19.5-pixel line, now pulled back with a negative block margin); and the
header band came from `--slotted-tone-secondary-surface`, which is calibrated to
enclose a chip and read blue and heavy across a page.

The header controls were rearranged for the same reason: every control now sits
on its column's trailing boundary, so the header row is one line of triggers
rather than marks at a different distance in each column.

**Would most improve it:** the focus ring on the sort button is drawn inward and
lands on the header's bottom rule at the boundary between the two.
**Made:** no. Drawing it outward puts half the ring outside the frame on the
first column, which is worse; the inward ring is the same compromise `list-item`
records. It is named here so the next reader does not have to find it.

## 5. Tokens

61 tokens read, all through family tokens over foundation values, with no
literal outside the documented exemptions. `docs/product/prd.md` §8 and §13.1 name
`table.row.height` and `table.row.hover.background` as the two decisions an
application retunes: both exist as `--slotted-table-row-min-block-size` and
`--slotted-table-row-surface-hover`, over the control scale and the tone step.

Two grounds are mixed rather than taken from a scale — the header band at 8% of
the ink and the stripe at 5% — because no token holds a ground between the
surface and the tone, and the foundation's own answer where that happens is to
mix one from an ink at a small share. The mix is into the surface rather than
into transparency, because a sticky cell copies the row's ground with
`background-color: inherit` and a translucent one shows the scrolled rows
through the column that exists to cover them.

**Would most improve it:** a foundation step between `--slotted-surface` and a
tone's `surface`, so the band and the stripe were tokens rather than mixes.
**Made:** no. A new step in a theme scale is ground every family stands on, and
the briefing requires it to be justified at the gate before it is written. It is
raised there.

## 6. Patterns

Sourced from `content/patterns/table/table-pattern.html` in `w3c/aria-practices`
and from the Grid and Table Properties practice, both read on 9 September 2026.
The finding that decides the family is that the pattern has **no** keyboard
section: a table "is not an interactive widget. Thus, its cells are not
focusable or selectable", so every control inside is its own tab stop.

Every role comes from the platform and the family writes none. `aria-sort` is on
the sorted header and no other; `aria-rowcount` and `aria-rowindex` are written
exactly when the consumer states a total larger than the DOM; the expander
borrows the Disclosure pattern whole. The one departure — `Shift` with a
checkbox press for a range — is recorded with its cost.

**Would most improve it:** nothing outstanding. The itemised comparison is in
§2 of the design document, and each item is held by a contract test.

## 7. Accessibility

Exercised in the harness with focus captures for the sort control, the expander
and the scrolling region; the states the browser owns — hover, and the sticky
header during a scroll — are named here as exercised live rather than
photographed.

The scroller takes `role="region"`, `tabindex="0"` and a name only while it
overflows, measured by `@slotted/core/overflow`. A selected row is said by its
ground, its ink and the checkbox's own mark: R1 forbids a rail, and in the
`high-contrast` scheme every tone ground is the page's own white, so the mark is
what survives. A row carries no `aria-selected`, because under this role it is
not selectable.

**Would most improve it:** a screen-reader pass on the announcement, to hear
whether "Client, sorted ascending" arrives before or after the reordered rows.
**Made:** no — this machine cannot run one. It is raised at the gate as the
thing that was not verified here.

## 8. Native API

React is React: function components, `useId`, context, `render` on the parts a
consumer substitutes, `ComponentPropsWithRef` per part, handlers composed rather
than replaced. Angular is Angular: `model()`, `output()`, `computed`, `input()`
with transforms, host metadata, `exportAs` on every directive, `inject()`, and
`@slotted/angular/checkbox` imported through its entry point.

Two asymmetries are recorded rather than levelled: the Angular selection is a
`ControlValueAccessor`, which no surveyed Angular table offers, and a closed
detail leaves the DOM through the consumer's `@if` there and through a `null`
return in React.

**Would most improve it:** `TableContent`'s `scrollProps` is a props bag, which
is the one place React reaches an element by prop rather than by part.
**Made:** no. The alternative is a fourth wrapper component for a box the
consumer never writes; the bag is typed as the element's own props.

## 9. Capability

Measured against the step 3 inventory, not the scope paragraph. Every
table-stakes row is `adopt`, `adapt`, or a `decline` naming the family that owns
it: `data-grid` for the four grid-pattern capabilities, `pagination` for the
page, `filter-bar` for the typed rules, `column-manager` for visibility,
`action-bar` for bulk actions, `data-list` for the card layout, the density axis
for size, `drag-and-drop` for reordering.

Three mutable values, each with a controlled and uncontrolled pair, a request
carrying a reason from the closed vocabulary, and a row in the state matrix. The
inventory gained two rows after the visual gate, both from the reviewer's own
question: the per-column control slot and the footer bar. Each was a place a
consumer would otherwise have had to reach past the family for.

**Would most improve it:** a `sortRows` helper in `@slotted/core`, so client-side
sorting were three lines rather than a comparator the consumer writes.
**Made:** no, and it is the one I would reconsider first. It sits on the line
between holding a descriptor and owning the data, and the reference page shows
the comparator instead.

## 10. Ecosystem integration

Both integration tables in `references/frameworks.md` are answered line by line
in §8 and §9 of the design document, and every line has a file that answers it.
Defaults are set once through `TableDefaultsProvider` and `provideTableDefaults()`;
the imperative surface is `scrollToRow()`, `overflowing()` and `refresh()`
through a handle in React and `exportAs` in Angular; every state a consumer may
style is in the DOM.

**Would most improve it:** an Angular `Validator` beside the
`ControlValueAccessor`, so a required selection reported its own validity.
**Made:** no. The family holds no rule about how many rows a form needs, and
inventing `minSelected` would be a validation vocabulary this family does not
own.

## 11. Documentation

Both pages carry the import, the anatomy of all 19 parts, 19 captioned
demonstrations with their source, the full input table, the outputs, the
composition surface, nine accessibility decisions, the public tokens and the
anatomy as it reaches the DOM. `referencePageErrors` and the snippet formatter
pass on both.

**Would most improve it:** reading the two pages rendered at 1280 and 620, in
light and dark, with every code drawer open.
**Made:** partly. `tools/harness/audit.mjs` reports no collapsed or overflowing
element on either page, and the React `listing` story was read at 1280 — which
is where the row action and the paginator were found unrendered and fixed. The
full docs page still reports six stages where nineteen scenes are declared,
which is the restart both Storybooks need when a family lands. That restart is
the reviewer's, and it is the first item at the gate.

---

## §18, definition of done

1. **Purpose, uses, anti-uses.** A table of moderate data. The anti-use is the
   grid pattern, and the four capabilities that need it are deferred by name.
2. **Anatomy.** 19 parts, listed in the contract and in both pages.
3. **Controlled and uncontrolled.** Three values, three models, each with a
   request carrying a reason from the closed vocabulary.
4. **State matrix.** `hover`, `active`, `focus-visible`, `selected`, `expanded`,
   `disabled`, `loading`, resolved in the `STATE_PRECEDENCE` order — a disabled
   row answers no pointer state, and a selected row hovered stays selected.
5. **Keyboard, focus, ARIA, touch, screen reader.** The keyboard is the
   platform's and is tabled in the contract with the focus destination for each
   key. Targets are at least 24 pixels and grow under `pointer: coarse` through
   the theme. A screen-reader pass was not run here.
6. **Size, density, variant, tone.** No size axis, by decision; three variants;
   every density answered through the control scale.
7. **Responsive, RTL, locale, reduced motion.** Scroll rather than reflow; every
   rule logical, read in `rtl` at 420 and 720; durations from the motion scale.
8. **Loading, empty, error, disabled, extreme content.** A first load and a
   refresh are two states and are drawn differently; the empty cell takes a
   `result-state`; a disabled row leaves the set the header covers; an unbroken
   forty-character token has three treatments and none removes it.
9. **SSR, performance, virtualisation.** No layout read during render — the
   overflow measurement runs after mount, and the row list is read inside event
   handlers. Virtualisation is deferred to `data-grid` with the reason.
10. **Examples.** 19 demonstrations per page, including a full listing screen.
11. **Shared behavioural tests.** 22 in React, 17 in Angular, over the same
    conceptual contract.
12. **Changelog and migration.** A new family: nothing to migrate. The one
    contract change outside it is `sort` entering the shared capability
    vocabulary, in its own commit with its own test.
