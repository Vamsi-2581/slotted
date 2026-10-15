# Toggle group and segmented control self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. The Scoring rule is followed: each
dimension names the one change that would most improve it and says whether it
was made.

Evidence paths are absolute where they are captures, and repository-relative
otherwise.

---

## 1. Icons

Neither family owns an intrinsic mark. `toggle-group`'s `icon` and
`segmented-control`'s `icon` are boxes the consumer fills — no chevron, no
check, no status glyph the family has to draw — so the glyph scale is not read
and no `forced-colors` rule is written for artwork. The box is sized from
`--slotted-control-icon-size-*`, so a mark shrinks with density like every
other control's.

The one glyph either family could have owned is Angular Material's check on the
selected toggle, and it is declined in writing
(`specs/components/toggle-group/contract.json`, `declined.selectionIndicator`):
one implementation ships it, and it costs reserved width on every item so the
label does not move when the state changes.

**The one change that would most improve it:** the harness draws four authored
SVGs rather than Lucide, so the marks on the page are not the marks a consumer
will use. Not made, and it is `icon`'s own recorded constraint — a framework-free
page cannot import Lucide, and a second copy of a maintained catalogue is worse.
The reference pages use Lucide, which is where a consumer meets the family.

## 2. Motion

Both sides of the rule are answered, and the reviewer asked for this one by
name.

| What moves | Duration | Easing | Why |
| --- | --- | --- | --- |
| The thumb, between segments | `--slotted-duration-medium` | `--slotted-easing-standard` | The one movement the pair owns: it says which segment was left. A thing that travels needs longer than a thing that changes colour. |
| The rules between segments | `--slotted-duration-medium` | `--slotted-easing-standard` | They fade on the thumb's own step so the two arrive together. |
| Ground, edge and ink on both families | `--slotted-control-transition-duration` | `--slotted-control-transition-easing` | Hover, press, checked and pressed are colour changes the eye follows. |
| Entering a press | `--slotted-duration-instant` | — | The press lands on the frame the pointer went down on and eases out at the control's own pace. |
| The thumb appearing | `--slotted-control-transition-duration`, opacity, `@starting-style` | — | With nothing checked there is no thumb, so the first selection fades it in rather than sliding it from an edge the reader never saw. |

`toggle-group` moves nothing, deliberately: a toggle changes colour. Every step
collapses to a single frame under `prefers-reduced-motion` through the theme's
own scale, and no literal duration exists in either sheet —
`packages/styles/src/motion.test.mjs` caught one (`200ms` as a fallback) and it
was removed.

**The one change that would most improve it:** the thumb's easing is
`standard` rather than `emphasized`. Deliberate and not changed: `emphasized`
overshoots, and a thumb that overshoots at the ends of a track leaves the track.

## 3. Responsiveness

`segmented-control` answers its own inline size: `condense="icons"` hides the
words below `20rem` and keeps the marks, with the words still in the DOM. The
container is declared on that shape alone and takes its parent's width, which
is the correction the first captures forced — `container-type: inline-size`
sized every content-width control as though it had no contents, and each stood
about one character wide. Recorded in the contract's `container.shapeReason`
and held by `segmented-control.styles.test.mjs`.

Both families shrink rather than pushing: `toggle-group`'s items are
`flex: 0 1 auto` with the item's own height as the floor, and
`segmented-control` is a grid with `min-inline-size: 0`. Read at 240, 420 and
720; the 240 capture of both is clean after the two corrections.

**The one change that would most improve it:** a second breakpoint that drops a
`segmented-control` to a `select` below its icon width. Not made, and declined
in writing to `select`: swapping one family for another at a width is the
consumer's decision, not the family's.

## 4. Refinement

Three defects were found by looking, not by a test, and all three are fixed:

1. **A coloured border inside a grey one.** The first pass framed
   `toggle-group`'s root *and* gave the pressed item its own edge. The root now
   states no border, no padding and no radius; the bar's frame is the items'
   own borders, overlapped by one border width so a shared column holds one
   line — `button-group`'s measured rule, because two borders a pixel apart
   render unevenly at 110%, 150% and 175% zoom.
2. **A ring drawn across the neighbours.** A focus ring held two pixels off its
   own edge crossed the labels either side of it in a joined bar and ran out
   through the track in a segmented control. Both now sit on the element's own
   edge.
3. **The thumb lost on a disabled track.** Painting the disabled track in the
   disabled ground made the thumb the same colour as what it sits on. The track
   keeps its ground; the edge and the words go grey.

Two more came from reading the states against each other: a segment's unchecked
ink was `text-muted`, a hair from `disabled-foreground`, so an available segment
and an unavailable one were the pair a reader could not tell apart; and hover
had nowhere darker to go once that was fixed, so it took a ground instead.

Both families are exactly `--slotted-control-height-*` tall, which the reviewer
asked for and which the `alignment` scene in each harness shows beside a
`text-field` and a `button` at all three steps.

**The one change that would most improve it:** at the bar's outer edge, a
pressed item's accent border sits directly against the neutral border of the
item beside it, so the bar's top line reads grey-accent-grey. Deliberate — it is
how a segmented bar is drawn — and not changed.

## 5. Tokens

Both sheets read the foundation and restate nothing. `toggle-group` declares 50
custom properties and `segmented-control` 61
(`packages/styles/src/*/…tokens.json`), every family-scoped one a consumer
override hook falling back to a foundation token, never to a literal or a
system colour. `packages/styles/src/fallbacks.test.mjs` caught the one
violation — a decorative `::before` reaching `ButtonBorder` — and it now
disappears instead of shouting.

The selected colour is the pair `docs/token-foundation.md` names for the chosen
row, card, option and toggle: `--slotted-tone-accent-border` around
`--slotted-tone-accent-subtle-active`, which is what `button` paints a pressed
ToggleButton with, so "on" is one colour across the system.

Two runtime properties were added to `packages/styles/src/runtime-properties.mjs`
with their reason — `--slotted-segmented-control-count` and `-index` — and they
are the first in the library that are **not** measured.

**The one change that would most improve it:** `--_travel` is a private
variable rather than a family token, so an application cannot retune the thumb's
duration alone. Not made: a theme retunes motion through the motion scale, and a
per-family duration token would be a second scale.

## 6. Patterns

Sourced, not recalled. Read on 10 September 2026:

- Radio Group — <https://www.w3.org/WAI/ARIA/apg/patterns/radio/>
- Toolbar — <https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/>
- Button, the toggle half — <https://www.w3.org/WAI/ARIA/apg/patterns/button/>

Both keyboard tables are transcribed key by key into the two contracts with the
effect, the focus destination and who implements each row, and the contract
tests hold them. `segmented-control` takes every row from the platform because
its segments are radios sharing a name; `toggle-group` takes movement from
`@slotted/core/focus` and activation from the platform.

The deliberate departures, with their cost:

- **`toggle-group` writes `aria-pressed` in single mode too**, where Angular
  Material switches the group to `radiogroup`. Cost: a screen reader says
  "pressed" rather than "2 of 4". Taken because a `radiogroup` whose children
  are pressed buttons is a group whose role and children disagree.
- **`segmented-control` is a radio group, not Primer's list of buttons.** Cost:
  the arrows move the value, so a reader cannot walk the segments without
  changing what is chosen — which is the Radio Group pattern's own behaviour
  and what a segmented control does.

## 7. Accessibility

Name, role, state, keyboard, focus, forced colours, reduced motion and target
are complete for every declared state, and the evidence is behavioural:
`packages/react/src/*/**.test.tsx` (54 tests) and
`packages/angular/*/src/*.spec.ts`.

- One tab stop per group; the ring survives in all three schemes, sits on the
  element's own edge, and is put out on the radio that holds focus so no family
  paints two rings.
- `aria-orientation` is written exactly where it says something: on a vertical
  toggle group, and on a horizontal segmented control because `radiogroup`
  already implies vertical.
- Read-only is enforced by the family, announced with `aria-readonly`, and does
  not look disabled.
- Neither family writes a `forced-colors` block: both read semantic tokens, and
  the theme maps them. A disabled pressed item keeps its edge, which is the only
  thing carrying "on" where the disabled ground is the page's own white.
- Target: an item is never narrower than it is tall; a segment is never narrower
  than `--slotted-target-min`, and its radio reaches the track's own edge so the
  target is the control's height rather than the thumb's.

**What this machine cannot verify:** a real screen reader, a touch device and a
physical high-contrast mode. What was checked in their place: the accessibility
tree through the rendered `aria-*` attributes in both bindings' tests, the
`high-contrast` scheme in captures, and `@media (pointer: coarse)` through the
theme's own block rather than a family rule.

## 8. Native API

React is React and Angular is Angular, and neither was levelled down.

- React: function components, `useId`, context for shared state, `render` on
  every public part, `ComponentPropsWithRef<'…'>` for every part's props,
  refs composed rather than replaced, `exactOptionalPropertyTypes` respected.
- Angular: standalone directives and components, `input()`/`output()`, `computed`
  for every derived value, `host` metadata rather than decorators, `inject()`,
  `HostAttributeToken` for `role`, `id`, `aria-label` and `aria-describedby`
  before the host bindings write, `takeUntilDestroyed`-equivalent teardown
  through `DestroyRef`, `ViewEncapsulation.None` with the one authored sheet.

The asymmetry is recorded rather than removed: `segmented-control` implements
`ControlValueAccessor` **and** `Validator` in Angular and nothing equivalent in
React, because React has no framework-level forms contract to implement; React
gets `render` and a defaults provider that Angular answers with directives and
`provideX()`.

**The one change that would most improve it:** React's `Segment` counts its
siblings by walking `children`, which finds nothing if a consumer wraps a
segment in a component of their own. Not changed: an element between the root
and a segment breaks the grid before it breaks the count, so the constraint is
the layout's and the walk only reports it.

## 9. Capability

Measured against the step 3 inventory
(`docs/history/designs/2026-09-10-toggle-segmented-capability-inventory.md`),
not against a scope paragraph — there was none, and §6 of the inventory wrote
one into `docs/process/build-order.md`.

Every table-stakes row is `adopt`, `adapt`, or a `decline` that names the family
that owns it instead: links → `tabs`, panels → `tabs`, multiple in a form →
`checkbox-group`, a dropdown fallback → `select`, five tones and
`focusableWhenDisabled` → `button`, a selection checkmark → the consumer, in two
lines. Both mutable values have a controlled and uncontrolled pair, a request
carrying a reason from the closed vocabulary, and a row in the state matrix.

Three capabilities no surveyed implementation has: a thumb correct on the first
server-rendered paint, a group that stands down inside a toolbar without being
told, and a change that says why it happened.

**The one change that would most improve it:** `toggle-group` has no
`orientation`-aware overflow — a bar with nine items in a narrow column clips
rather than wrapping or scrolling. Not made, and the reason is `button-group`'s
recorded one: a joined bar's shape is the whole point of it, and no surveyed
implementation flips that shape at a width the consumer cannot see coming.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`docs/history/designs/2026-09-10-toggle-segmented-design.md` §8 and §9, and
each answer is now code:

- controlled/uncontrolled with a reason: `@slotted/core/state` in both;
- defaults once: a React provider and an Angular token with `provideX()`;
- substitution: `render` in React, a directive on the consumer's own element in
  Angular;
- the consumer's handler composes rather than being replaced, and
  `preventDefault()` stops the change — tested in both;
- native element and imperative action: `ref` and `exportAs`; no invented
  handle, because `focus()` and `click()` are the element's own;
- SSR: `useId` and an application-scoped id factory; nothing read from layout;
- every state a consumer may style is in the DOM;
- Reactive Forms: `segmented-control` only, and `toggle-group`'s absence is
  written — it is not a form control.

**The one change that would most improve it:** neither family ships a
`FormData`-shaped story for Angular template forms. Not made: `ngModel` works
through the same `ControlValueAccessor` the reactive story exercises.

## 11. Documentation

Four reference pages, one per family per binding, each answering
`references/stories.md`: the import, the anatomy row by row, one demonstration
per declared scenario with the code that produced it, every input, every output,
the composition surface, at least three accessibility decisions, the tokens and
the anatomy as it reaches the DOM. `specs/reference-pages.test.mjs` and the four
`*.stories.test.ts` files hold all of it; every scene has a caption over the
forty-character floor that says what to look at rather than repeating the title.

**Read rendered, and measured.** Once the React Storybook had restarted and
could see both families, `tools/harness/audit.mjs` was run on all four pages at
1280 and at 620 — eight runs, all clean — and the pages were read at both
schemes. Four defects came out of the reading and none of them out of a test:

1. **The three sizes were stretched across the stage.** Thirty, thirty-four and
   thirty-eight pixels is four pixels between neighbours, and a control a
   thousand pixels wide hides a difference that small. They now sit side by side
   on a `row` stage, where the step reads at a glance.
2. **The form row put the field on its own line.** `text-field` is
   `inline-size: 100%` by design, so on a row stage it takes the whole line and
   pushed the two controls beside it onto a second one — which is the opposite
   of what a scene about shared height is for. The field is bounded by
   `.slotted-demo-measure`, and the three edges now line up.
3. **Four scenes stood below the audit's collapse floor** because the content
   chosen for them was too thin: a two-mark formatting bar, a vertical bar of
   three short words, a button that said "Salvar". They carry real content now —
   four marks, the labels an alignment control actually has, "Salvar fatura" —
   rather than an escape hatch, which is what `data-collapse-floor` would have
   been.
4. **The `in-a-form` scene had no layout at all**, recorded above under
   Refinement.

**What is not this pass's to fix.** The anatomy table's `PURPOSE` column is
clipped at the page's right edge. It reproduces identically on `radio-group`'s
page — a family that has been through its own gate — so it belongs to the shared
`api-table`, not to either family here. `audit.mjs`, which owns that question,
reports nothing, and `references/stories.md` explicitly allows wide content to
scroll inside its own container. Reported rather than changed: editing the
shared table would touch every family's page while another session is working in
this tree.

**The one change that would most improve it:** a demonstration of the thumb
actually travelling — every scene is a still, and the one motion this family
owns can only be seen by pressing a segment. Not made: a story cannot animate
itself on load without lying about what a reader would see.

---

## §18, both families

**Purpose, use and anti-use.** `toggle-group`: a set of two-state buttons
sharing one value — formatting, map layers, a filter row. Not a form control.
`segmented-control`: one choice out of a few, applied at once — a setting, a
view's own rendering. Not a navigation row and not a tab list; both are `tabs`.

**Anatomy.** `toggle-group`: `root`, `item`, `icon`, `label`.
`segmented-control`: `root`, `indicator`, `item`, `control`, `icon`, `label`.
Every part appears in both bindings, both harness fragments and both anatomy
tables.

**Controlled and uncontrolled.** Both: `value` / `defaultValue` /
`onValueChange` (React) and `value` / `defaultValue` / `valueChange` (Angular),
with the request carrying `pointer` or `keyboard`, the previous value and
`cancel()`. `toggle-group` holds `readonly string[]` in both modes so the two
bindings hold one shape; `segmented-control` holds `string | undefined` because
that is what a form submits.

**State matrix.** `toggle-group`: default, hover, active, focus-visible,
pressed, disabled — and the two that meet, pressed + disabled, which keeps both
facts. `segmented-control`: default, hover, active, focus-visible, checked,
disabled, invalid, readonly. Precedence is `STATE_PRECEDENCE`'s and
`packages/styles/src/states.test.mjs` holds it.

**Keyboard, focus, ARIA, touch, screen reader.** Both contracts carry the full
table; both bindings are tested against it. Touch is the theme's coarse-pointer
block. A screen reader is named above as unverifiable here.

**Recipes.** `size` × `variant` × `orientation` × `attached` × `fullWidth` for
`toggle-group`; `size` × `orientation` × `condense` × `fullWidth` for
`segmented-control`. All through tokens; no family invents a scale.

**Responsive, RTL, locale, reduced motion.** Container query on the condensing
shape; `:dir(rtl)` mirrors the thumb; every rule logical;
`prefers-reduced-motion` through the theme.

**Loading, empty, error, disabled, extreme content.** No loading state — neither
family performs an asynchronous action, and the item that needs one is
`button`'s. Empty: a toggle group with no value paints no pressed item, and a
segmented control with no value paints no thumb. Error: `invalid` on
`segmented-control`; `toggle-group` has no validity to report. Extreme content:
long, unbroken and right-to-left labels are a scene in both harnesses and a
demonstration on all four pages.

**SSR, performance, virtualization.** Both render on the server with no layout
read and no mismatch; the thumb's geometry is two numbers written at render.
Virtualization is not applicable to a set of two to six items.

**Tests shared between bindings.** The concepts are shared and the tests are per
binding, which is the repository's rule: 54 React tests and two Angular specs
covering the same behaviours.

**Changelog and migration.** Both families are new. No contract was broken, so
§18's migration clause has nothing to record.
