# Breadcrumb, Pagination and Stepper — self-assessment

Eleven dimensions from `.claude/skills/component/references/rubric.md`. Each
names the one change that would most improve it, and says whether it was made.
Then section 18 of `docs/component-features.md`, family by family.

## 1. Icons

Two glyph masks are drawn from the scale, both by pagination: one chevron for a
step and two for an end, painted with `currentColor` so each follows the state
its button is in. The stepper draws a check on a finished step and a bare cross
on a failed one — bare marks rather than the scale's circled alert, because
`docs/token-foundation.md` says the status glyphs carry their own container and
the marker is already a container.

Breadcrumb owns no glyph at all, which the invocation required. Its separator is
a one-pixel rule rotated into a slash — geometry, not a character and not a
mask — drawn the way the APG's own example draws it, and mirrored from
`:dir(rtl)`. Its ellipsis, and pagination's, is the character U+2026 rendered as
text: rule 3 forbids drawing an *icon* from a character, and U+2026 stands in
for nothing — it is the typographic mark for omitted content, which is exactly
what the control holds. It also survives `forced-colors`, where every painted
decoration is replaced by the page's own background.

`--slotted-icon-chevrons-right` was added to the foundation for this work, in
lockstep across the contract, the theme and the documentation.

**Most improving change:** the stepper's `loading` step shows no motion of its
own — the trigger stops answering and the announcement says "checking", but
nothing spins. **Not made:** a spinner belongs to `progress-indicator`, which is
being built in parallel, and inventing a second one here would be the defect
this library keeps finding.

## 2. Motion

Every state change the eye follows transitions, and every duration comes from
the scale through `--slotted-control-transition-duration`. The stepper's marker
transitions its fill, its border, its colour and its press scale; the connector
transitions with them, so walking a step forward reads as one movement rather
than four. Pagination transitions background, border and colour on every
control. Breadcrumb transitions colour and the underline that arrives with the
pointer.

Nothing loops, so nothing needs to stop under reduced motion; the four
motion-scale durations collapse to `1ms` from the theme, which is inherited
rather than restated. No literal duration exists in any of the three
stylesheets, which `packages/styles/src/motion.test.mjs` holds.

Deliberate absences: the stepper does not animate between panels — a fade
delays reading, and Angular Material's animation is declined in the contract
with that reason — and the breadcrumb does not animate the expansion, because
five crumbs appearing is a layout change rather than a value moving.

**Most improving change:** the press feedback on a stepper marker is a scale
that snaps in and eases out, which is the asymmetry a press wants; pagination's
press is a fill change with no such asymmetry. **Not made:** the two families
are different shapes — a 34-pixel disc invites a squeeze and a rectangular chip
does not — and matching them would be consistency for its own sake.

## 3. Responsiveness

All three families answer their own inline size. Pagination and stepper each
declare `container-type: inline-size` with their own `container-name`, so a
paginator under a table in a split pane compacts while the same paginator on a
full page does not.

- Pagination below 22rem: the numbered row gives way to "Page 3 of 24", both
  always rendered and exactly one displayed; the page size takes the whole line
  and its select stretches with it.
- Stepper below 30rem: a horizontal flow becomes a column, which is the
  composition change section 2.7 asks for rather than a smaller row.
- Breadcrumb has no breakpoint: the trail wraps, and a crumb wider than the
  trail truncates. A wrapping row needs no query.

Read at 240, 420 and 720 pixels in every capture. Three defects came out of the
narrow captures and are fixed: a cursor paginator that hid its only sentence, a
lone trigger orphaned on a second line, and a chevron left floating in the gap
when the page-size label stretched.

**Most improving change:** the stepper's reflow breakpoint is one number for
every step count, and twelve steps need a column sooner than three do. **Not
made:** a breakpoint that varies with the count cannot be written — a container
query reads no custom property — and the alternative is a prop that asks the
consumer to measure their own text.

## 4. Refinement

Roughly thirty captures read at full size across three schemes, three widths,
three densities and both directions, plus focus captures in light and dark. Six
defects were found by looking and could not have been found by a test:

1. hidden crumbs that still rendered, because `display: flex` on the item beat
   the user agent's own `[hidden] { display: none }`;
2. an ellipsis sitting on the baseline instead of the optical centre;
3. a disabled pagination trigger painted the same grey as its rest state;
4. a cursor paginator that hid its only sentence at 240 pixels;
5. a stepper connector drawn as a stub against the next marker, because nothing
   can position around a label whose width nothing knows;
6. a finished step drawing its number and its check on top of each other, two
   status rules having outranked the rule that hides the number.

The detail named after the last pass and then changed: the pending marker's ring
read at about 1.2:1 against the surface, so four pending markers in a six-step
row all but disappeared. It now takes `--slotted-control-border-color`, which
holds the 3:1 a non-text element needs, while the connector stays at
`--slotted-border-subtle` — the track behind a flow is decoration and may be
fainter than the frame of a marker.

**Most improving change:** in the `high-contrast` scheme the untravelled
connector is black and the travelled one is the accent, so the pending track
reads heavier than the finished one. **Not made:** the theme maps
`--slotted-border-subtle` to black in that scheme, a family second-guessing its
own theme's palette is what the foundation exists to prevent, and the four
statuses are still separated by fill and glyph rather than by colour. Raised at
the gate as the one thing a reviewer should look at.

## 5. Tokens

Every visual decision reaches a foundation token. Breadcrumb reads 39 custom
properties, pagination 44, stepper 48, and each family's `tokens.json` matches
its stylesheet exactly, which `packages/styles/src/tokens.test.mjs` holds. No
component token falls back to a system colour, which
`packages/styles/src/fallbacks.test.mjs` holds.

Three literals are recorded with their reasons in the contracts: the separator's
skew angle, which is a shape and not a step on a scale; and the two container
breakpoints, which cannot be tokens because `@container (min-width: var(--x))`
is invalid CSS — rule 4 of the foundation.

The component token layer was not touched. The stepper's marker is sized from
the control scale and everything else is derived from it, so a theme that
retunes control geometry moves the whole stepper together instead of leaving the
connector behind.

**Most improving change:** `--slotted-stepper-marker-size` defaults to
`--slotted-control-height-md`, which makes a 34-pixel disc at comfortable and 26
at dense — a marker that holds two digits comfortably at one density and tightly
at another. **Not made:** the alternative is a fourth density-varying scale in
the component layer, and the bar Avatar cleared for that is a size no semantic
token can be retuned to give. A marker is a control-sized box.

## 6. Patterns

The APG Breadcrumb pattern was read at
<https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/> and its example at
`.../examples/breadcrumb/`. Its keyboard table is "Not applicable"; its two
attributes are a name on the `nav` and `aria-current="page"` on the last link,
and both are implemented. Its example's reasoning for drawing the separator in
CSS is the reasoning this family drew it with.

The APG pattern index was enumerated at
<https://www.w3.org/WAI/ARIA/apg/patterns/> — thirty patterns, and neither
`pagination` nor `stepper` is among them. For both, the sourced guidance is
WAI-ARIA 1.2 `aria-current`, read at
<https://www.w3.org/TR/wai-aria-1.2/#aria-current>, which names both cases by
name: "a `page` token used to indicate a link within a set of pagination links"
and "a `step` token used to indicate a link within a step indicator for a
step-based process."

Every key in all three keyboard tables names its effect and its focus
destination, and every one is marked `platform` or `family`. The one departure
with a written cost is the stepper's refusal of `role="tablist"`: section 7 of
`docs/component-features.md` forbids it in the Tabs entry itself, and the cost —
no "tab 2 of 5" announcement, no tab-specific navigation — is written in the
contract and answered by the visually hidden status.

**Most improving change:** the stepper's arrow keys are not in any sourced
pattern; they come from the CDK, which is an implementation rather than a
specification. **Made:** they were narrowed to match Tab exactly rather than
inventing a roving model, and the contract says so key by key.

## 7. Accessibility

Every control has a name. The two landmarks are named. `aria-current` is written
with the specification's own value in all three families. The stepper announces
"Cart, Step 2 of 4, current" through a visually hidden run inside each header,
so a reader hears the position and the status rather than the number in the
circle. A step a linear flow has not opened keeps its tab stop and says
`aria-disabled`, so it stays discoverable.

Pagination announces a page change once, politely, through the range; the label
is not re-announced. A disabled trigger in link mode renders no `href`, which is
what stops a middle click as well as a left one.

Forced colours: each family restates only what it paints itself. The masks keep
their paint through `forced-color-adjust` on the mark alone, inheriting the
colour the system already forced onto the button, so the family names no system
colour where the theme is the one that knows them.

**Most improving change:** none of this was heard through a screen reader.
**Not made — and it cannot be on this machine.** Raised at the gate: the three
announcements to verify are the stepper's status run, pagination's live region
after a page change, and the breadcrumb ellipsis's count.

## 8. Native API

React uses function components, `useId`, context for compound state, a `render`
prop on every part, and `ComponentPropsWithRef` for each part's props. The one
exception is documented in the type itself: a pagination trigger is a `button`
or an `a` depending on `itemHref`, and the two elements' prop types disagree on
every event handler, so the shared surface is `HTMLAttributes<HTMLElement>` and
anything specific to one of them reaches the element through `render`.

Angular uses standalone components and directives, `input()`, `output()` and
`computed()` throughout, `host` metadata rather than `@HostBinding`,
`ViewEncapsulation.None` with the one authored stylesheet, `exportAs` on every
part, `inject()` over constructor parameters, `HostAttributeToken` so a static
`aria-label` survives the host binding, and `contentChildren` where the parent
has to see the whole set.

Native props, events and consumer values reach the element that owns them, and
every handler composes rather than replaces.

**Most improving change:** the Angular families do not implement
`ControlValueAccessor`. **Not made, and correct:** none of the three holds a
form value — a trail is text, a paginator is navigation, and the wizard's forms
are the consumer's.

## 9. Capability

Measured against the step 3 inventory, not the scope paragraph. Every
table-stakes row is `adopt`, `adapt`, or a `decline` naming the family that owns
it instead: `skeleton` for a loading trail, `menu` for an overlay collapse the
family replaced with in-place expansion, `progress-indicator` for a bar, `tabs`
for the role, `select` for the styled listbox the paginator renders natively
until wave 6, and the application for a keyboard shortcut WCAG 2.2 2.1.4 makes
its responsibility.

Every mutable value has a controlled and uncontrolled pair, a request carrying a
reason, and a row in the state matrix: the trail's collapse, the paginator's
page and page size, the stepper's step. Two moves the families make on their own
carry `programmatic` — the clamp when a collection shrinks, and the page that
follows a change of page size.

Four capabilities nobody asked for: a collapse that expands in place without an
overlay; a paginator whose row keeps one length and one width at every page; a
stepper that is also a read-only progress indicator, which the field ships as a
separate component; and a linear flow refused by cancelling the change request
the library already defines, where Zag needs two bespoke hooks.

**Most improving change:** pagination has no jump-to-page control, so reaching
page 4 000 of 10 000 takes the address bar. **Not made:** the ellipsis is
announced to nobody in every surveyed implementation, a jump-to-page is a
different widget with its own validation, and the first and last triggers
already reach the ends.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`2026-09-03-breadcrumb-pagination-stepper-design.md` §5, including the three
lines where the bindings are deliberately not the same shape:

- React maps children to tell a crumb it is the last; Angular writes the same
  fact back onto queried content children.
- React's imperative surface is a hook read from context; Angular's is the
  instance through `exportAs`.
- React hands a consumer an advance handler; Angular puts `slStepperNext` on
  their own button, which is what `matStepperNext` already taught Angular
  consumers.

An application sets defaults once in both: a context provider in React, an
injection token and `provideXDefaults()` in Angular. Both merge `labels` rather
than replacing them, so translating one sentence keeps the others.

**Most improving change:** the Angular families are not exercised in a Reactive
Form, because none of them belongs in one. **Not made, and the asymmetry is
recorded rather than levelled:** React has no equivalent of `ControlValueAccessor`
to level down to.

## 11. Documentation

Six reference pages, one per family per binding, each carrying the import, the
anatomy for every declared part, one captioned demonstration per declared
scenario with the code that produced it, every input with its default, the event
table each state model obliges, the composition surface and the accessibility
decisions. `specs/reference-pages.test.mjs` and `referencePageErrors` hold all of
it, and every snippet is Prettier-formatted.

**Most improving change:** the pages were checked against the contract by their
own specs, not read rendered at 1280 and 720 in both schemes. **Not made in this
session** — see the gate. This is the one step of the skill that is not complete,
and it is the step that finds the empty canvas, the collision and the clipped
table.

## Section 18, family by family

### Breadcrumb

- **Anatomy:** `root` (nav), `list` (ol), `item` (li), `link` (a), `page` (span),
  `separator` (span, aria-hidden), `ellipsis` (button).
- **Controlled and uncontrolled:** the collapse, as `expanded` /
  `defaultExpanded` / `onExpandedChange`, reasons `pointer` and `keyboard`. It
  is a value a consumer can own because an application may persist the reader's
  choice.
- **State matrix:** default, hover, active, focus-visible on a crumb; `expanded`
  on the root. `aria-current` paints the current page and is mirrored into no
  `data-current`, because the attribute is the fact.
- **Density and direction:** the type, the gap and the target come from the
  control scale, so all three densities answer. The separator mirrors from
  `:dir(rtl)`; the trail runs the other way from the flow direction alone.
- **Loading, empty, error, extreme content:** loading is `skeleton`'s, inside a
  crumb. A trail of one crumb draws no separator. There is no error state — a
  trail cannot fail. A crumb wider than the trail truncates and keeps its string.

### Pagination

- **Anatomy:** thirteen parts, twelve optional — `root`, `list`, `item`, `page`,
  `ellipsis`, `summary`, `first`, `previous`, `next`, `last`, `status`,
  `page-size`, `page-size-label`.
- **Controlled and uncontrolled:** the page, as `page` / `defaultPage` /
  `onPageChange`, and the page size, as `pageSize` / `defaultPageSize` /
  `onPageSizeChange`. Both because a table's query state is the consumer's and
  usually lives in the URL.
- **State matrix:** default, hover, active, focus-visible, `disabled`,
  `loading`. Both stronger states outrank `current`, so the chip keeps its shape
  and loses its accent while the row is inert.
- **Density and direction:** the target, the type and the glyph come from the
  control scale. Three rules mirror the chevrons, from `:dir()`.
- **Loading, empty, error, extreme content:** `loading` refuses every move and
  keeps the row's size; an empty collection says "No results"; a total the
  server does not know draws no numbers at all; ten thousand pages keep one row
  length and one target width through tabular figures.

### Stepper

- **Anatomy:** ten parts — `root`, `list`, `item`, `trigger`, `marker`, `label`,
  `description`, `status`, `separator`, `panel`. Advancing is a handler on the
  consumer's own button, not a part.
- **Controlled and uncontrolled:** the step, as `step` / `defaultStep` /
  `onStepChange`, reasons `pointer`, `keyboard`, `programmatic`. A wizard's step
  usually lives in the consumer's route.
- **State matrix:** default, hover, active, focus-visible, `current`,
  `complete`, `invalid`, `disabled`, `loading`. `invalid` outranks `complete`;
  `current` outranks `complete`; a current step keeps its number where a
  finished one shows a check.
- **Density and direction:** marker, gap and type come from the control scale.
  The inline arrows follow the reading direction and the block arrows never
  mirror, because `dir` does not mirror the block axis.
- **Loading, empty, error, extreme content:** `loading` stops the trigger
  answering and adds "checking" to the announcement; `invalid` fills the marker
  and draws a cross; a flow of one step draws no connector; twelve steps become
  a column below the breakpoint rather than twelve two-character labels.
