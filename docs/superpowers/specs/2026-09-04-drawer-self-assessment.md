# Drawer self-assessment

Written against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18, before the release gate. The survey is in
`2026-09-04-drawer-capability-inventory.md` and the decisions are in
`2026-09-04-drawer-design.md`; neither is repeated here.

Every dimension names the one change that would most improve it, and says
whether it was made. A page of eleven passes and no named improvements has not
been written.

---

## 1. Icons

The family owns one mark: the grip on the separator, drawn as a rounded bar in
`packages/styles/src/drawer/drawer.css` from `--slotted-border-strong`, turned
by the side rather than composited from two shapes. The close button's ✕ is a
mask from `--slotted-icon-x`, never a character. No mark is direction-sensitive,
so nothing mirrors: the grip is a bar across the axis the panel moves in, and
that axis is chosen by `side` rather than by the reading direction.

Under forced colours the grip takes `CanvasText` without a rule of its own,
because `--slotted-border-strong` is remapped by the theme. The `::after` that
draws it carries **no** system colour of its own, which
`packages/styles/src/fallbacks.test.mjs` requires of every decorative rule:
unthemed decoration disappears rather than shouting.

**The one change:** the grip's hover colour is `--slotted-text-muted`, which is
a text token doing a border's job. A `--slotted-border-strong-hover` step does
not exist in the foundation, and adding one is a change to ground every family
stands on — so it was **not made**, and the family reads the nearest honest
token instead.

## 2. Motion

Four transitions, all from the motion scale, all named in one place:
`--_move` resolves to `medium`/`enter` while open, `short`/`exit` while closed,
and `instant` while `data-dragging`. The scrim fades, the panel slides, and an
inline drawer's own measure is what moves. Nothing loops, so nothing needs the
explicit stop `docs/token-foundation.md` requires of infinite animation; reduced
motion is inherited from the theme, which collapses all four scale durations.

The panel slides and does not fade, which is the one departure from `dialog`:
that family fades and scales because a centred panel has nowhere to come from,
while a drawer arrives from outside the layer and its position already carries
the whole change. Adding opacity would make one motion read as two.

State pairs that do **not** transition, and why: `data-loading` on and off is a
content swap the reader asked for, and animating it would delay the content;
`data-dragging` on and off deliberately removes the transition rather than
adding one, because an extent that eased toward every pointer position would lag
the hand by the whole duration.

**The one change:** a bottom sheet released between two snap points lands on the
nearest one instantly, because the extent's transition is the same `--_move`
that the drag turned off, and the release does not turn it back on before
committing. The fix is one frame of bookkeeping in both bindings, and it was
**not made** — the value is correct and only the arrival is abrupt, which is the
smaller of the two defects a rushed fix could produce.

## 3. Responsiveness

The family declares **no container query and no viewport query**, and that is a
decision rather than an omission: the one thing a drawer would query is its
mode, and the breakpoint at which a product moves from a persistent sidebar to
an overlay is an application decision. A family owning a viewport media query is
what this dimension refuses; a container query cannot answer it either, because
an overlay drawer has no place in the layout to measure. Fluent, MUI and Angular
Material all document the consumer binding it, and so does this family — the
`mode` scene on both reference pages carries the two lines.

What the family does answer is its own clamp. `min(var(--_extent), 100%)` makes
a panel wider than the layer fill it, which is what a side drawer does on a
phone; the 240-pixel capture shows it full-bleed with the page gone.

Read at 240, 420 and 720 across nine scenes, in three schemes, three densities
and both directions. The captures are listed under §11 below.

**The one change:** at a width the panel is clamped to, its inner edge draws a
one-pixel line at the very edge of the viewport, which on a phone is a stray
line under the browser chrome. `size="full"` — the step a consumer chooses for
that on purpose — has the border removed, and that **was made**; the clamped
case is left, because CSS cannot compare a resolved length to its container and
the four container queries that would answer it (one per step, since a container
condition cannot hold a custom property) buy one hairline at the extreme edge.

## 4. Refinement

The visual loop found four defects no test could, and all four were corrected
before the stylesheet was committed:

- **Every rule stopped short of the panel's edge.** The separator was a column
  of the panel's grid, and a line cannot cross an opaque box. It is a row on a
  block side, where it crosses no rule, and an overlay on an inline side, where
  the rows keep clear of it with `max(the padding, the separator)`.
- **The panel had no visible edge.** The repository ships no global
  `box-sizing` reset, so the border sat a pixel outside the extent asked for —
  and under `inline` the root clips at that extent, so the edge separating the
  drawer from the page beside it disappeared entirely.
- **The grip hung in the panel's white**, a dozen pixels from the edge it moves,
  attached to nothing the eye could find. It is flush with that edge now.
- **The focus ring erased the grip.** The inset ring lands exactly on a flush
  grip, so focus colours the mark as well as drawing the ring.

Density is answered the way this library requires and no further:
`docs/token-foundation.md` says a family answers density **only** by reading a
token the theme restates per density, and the three scales that do all name a
control. The close button's height and its glyph move; the panel's inset is on
the space scale and does not. That is the same answer `dialog` gives, and it is
deliberate rather than overlooked.

**The one change:** the header's row gap and the footer's action gap are both
`--slotted-space-5`, which reads correctly at `md` and slightly loose at `sm`,
where the panel's own inset drops a step. Tying the gap to the same step as the
inset would fix it, and it was **not made** — the two are different distances
(one between rows of words, one between controls) and collapsing them into one
variable to fix a small looseness would be the kind of shared value that later
has to be split again.

## 5. Tokens

Seventy-one custom properties, listed in `packages/styles/src/drawer/drawer.tokens.json`
and checked against the stylesheet by `packages/styles/src/tokens.test.mjs`.
Every family token falls back to a foundation token; every literal is one of the
documented exemptions (`0`, `100%`, `transparent`, `none`) or a foundation
fallback.

`--slotted-drawer-extent` is the one token worth naming. It is both a
theme-owned decision — an application setting one measure for every drawer
writes it on `[data-ui='drawer']` — and the channel each binding writes the
reader's own measure on. That is why it is in `tokens.json` and **not** in
`packages/styles/src/runtime-properties.mjs`: that file is for values no theme
could hold ("where is the arrow"), and a panel's measure is not one of them.

The four step tokens `--slotted-drawer-extent-sm|md|lg|xl` are the scale the
`size` axis chooses between, so a theme retunes a step rather than a family
inventing a second scale.

**The one change:** `--_grip-length` is `--slotted-space-10`, a spacing step
used as the length of a mark. A glyph scale would name it better, and it was
**not made** — the mark is a proportion of the panel's edge rather than an icon,
and `avatar` already established that a proportion of a box is geometry rather
than a token.

## 6. Patterns

Two patterns, both sourced on 4 September 2026 and transcribed key by key in
`2026-09-04-drawer-design.md` §7 and §8, and item by item in
`specs/components/drawer/contract.json`:

- <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/> — Dialog (Modal),
  which applies to `mode="overlay"`;
- <https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/> — Window Splitter,
  which the separator answers.

Ten keys, each with its effect, its focus destination and the module that
answers it, held by `specs/components/drawer/contract.test.mjs` and exercised in
both bindings' specs.

Three deliberate departures, each with its cost written:

| Departure | Cost |
| --------- | ---- |
| `Enter` collapses to `minExtent` rather than closing the drawer | A reader following the pattern literally expects the pane to disappear. Escape already closes, and a separator that removed itself on Enter would leave nothing to press again |
| No `aria-valuetext` | A reader hears "40" rather than "40 per cent". The string would have to be built from a locale this family does not take, and a hard-coded per-cent sign is wrong where the sign is placed differently |
| No `F6` | The optional key cycles panes, and a drawer has one. The page behind it is either inert or reached with `Tab` |

The platform's own `<dialog>` is declined for the reason `dialog` records — the
top layer paints above everything regardless of `z-index`, so a `select` opened
inside would render behind the drawer it belongs to — and for a second reason of
this family's own: an inline drawer could not be a `<dialog>` at all, so the
family would need two mechanisms where the `mode` axis exists to have one.

**The one change:** the separator's `aria-valuenow` is a percentage of the
layer, which is what the pattern calls typical, and a reader resizing a sidebar
would rather hear pixels. It was **not made**: pixels are not a range, and the
pattern's `aria-valuemin`/`aria-valuemax` pair has to bound the same unit.

## 7. Accessibility

Name, role, state, keyboard, focus, forced colours, reduced motion and target
size are complete for every state the contract declares.

The two decisions worth restating:

- **The panel writes `role="dialog"` only under `overlay`.** Under `inline` it
  writes no role at all, because a navigation drawer is a `navigation` landmark
  and a filter panel is `complementary`, and a family that cannot know which one
  guesses wrong half the time. Both reference pages show the consumer naming it.
- **`aria-modal` and `inert` travel together.** `modal` is fixed at `false`
  under `inline`, so a panel in the flow cannot claim a mark the APG calls
  severe when the background stays reachable. The trigger drops
  `aria-haspopup` there for the same reason.

The closed panel is `inert` in both modes, which is the gap MUI's `persistent`
variant leaves: a drawer the eye reads as closed keeps its controls out of the
tab sequence and out of the accessibility tree.

Target size: the close button is `--slotted-control-height-md` rather than the
size of its mark, and the separator is `--slotted-target-min` thick. Both clear
24 × 24, and the theme grows the control again under `pointer: coarse`.

**What this machine could not check.** No screen reader, no touch device and no
real screen were available. The separator's announcement — name, orientation and
a number from 0 to 100 — is asserted in both specs from the DOM rather than
heard, and the drag gesture is exercised with synthesised pointer events rather
than a finger. Both are named here rather than implied.

**The one change:** a live region announcing the extent as the reader arrows
through snap points would tell them which stop they landed on. It was **not
made**: `docs/component-features.md` §3 gives that to `live-announcer`, the
separator's own value already changes on every press, and a second announcement
for the same fact is the duplication that module exists to prevent.

## 8. Native API

React is React and Angular is Angular, and neither was levelled down.

React ships a provider that renders no DOM, because the trigger is written in
place while the layer is portalled out; `render` on every part;
`ComponentPropsWithRef<'…'>` as the base of every part's props; `useId` for the
four identifiers; a handle with `open()`, `close(result)` and `focus()` and
nothing more.

Angular ships `model()` for both mutable values, `output()` for both requests
and for `closed`, `computed` for everything derived, `host` metadata rather than
decorators, `exportAs`, `inject()`, `OnPush` with no `markForCheck`, and
`HostAttributeToken` so a consumer's own `aria-label` on `<sl-drawer>` survives
and reaches the panel.

Two asymmetries are recorded rather than removed:

- Angular has no `defaultOpen`, because a `model()` is both halves at once. Its
  stories spec says so where it declines to hand the state model to
  `apiMetadataErrors`.
- Angular's host is the portal's origin whether a trigger exists or not; React
  has to use the trigger, and falls back to the document when a layer is opened
  from code.

Neither binding implements `ControlValueAccessor`, and the integration table
says why in one sentence: a drawer holds no value a form submits, and a form
*inside* one is the consumer's own.

**The one change:** React's `DrawerPanel` takes `render` for the panel and
offers no way to substitute the layer element. It was **not made** — the layer
is `position: fixed` with a computed z-index and a portal, and a consumer who
replaced it would be replacing the one element the family cannot function
without. The panel is the element a consumer actually needs to change.

## 9. Capability

Measured against the step-3 inventory rather than against the scope paragraph.
Every table-stakes row is `adopt` or `adapt`; the inventory has no `decline`
row, so none owes a replacement. Six capabilities the field does not have are in
§3 of that document, and four gaps it does not close are in §4.

Both mutable values have a controlled and uncontrolled pair, a request carrying
a reason, and a row in the state matrix:

| Value | Controlled | Uncontrolled | Request | Reasons |
| ----- | ---------- | ------------ | ------- | ------- |
| `open` | `open` | `defaultOpen` | `onOpenChange` | `pointer`, `keyboard`, `dismiss`, `escape`, `outsidePress`, `programmatic` |
| `extent` | `extent` | `defaultExtent` | `onExtentChange` | `pointer`, `keyboard`, `programmatic` |

`extent` is a new word in `specs/contract.schema.mjs`, added in its own commit
before the family with `packages/core/src/extent` beside it. It binds a second
family already: `splitter`, wave 8, holds the same value between two panes and
answers the same pattern.

**The one change:** `mount="lazy"` and `mount="eager"` are declared, tested and
never demonstrated — the scenario list has no scene for them, because the axis
is invisible in a picture. It was **not made** as a scene; it is documented in
the API table with the sentence that says what each value costs, which is what a
consumer choosing between them needs.

## 10. Ecosystem integration

Both integration tables in `.claude/skills/component/references/frameworks.md`
are answered line by line in `2026-09-04-drawer-design.md` §10 and §11. Every
line has a file that answers it or a sentence naming why the family does not
need it; no line is blank.

The three that matter most, and where they are:

- **Defaults set once.** `DrawerDefaultsProvider` / `useDrawerDefaults` and
  `provideDrawerDefaults()` / `DRAWER_DEFAULTS`, over the same seven axes. Both
  bindings' specs assert that an explicit value still wins.
- **The consumer's handler composes.** It runs first, and `preventDefault()`
  refuses the family's own behaviour. Asserted in `drawer.test.tsx`.
- **Every state a consumer may style is in the DOM.** `data-open`,
  `data-loading`, `data-dragging` and the seven axes, asserted in both specs
  against the contract.

**The one change:** an application cannot set `minExtent`, `maxExtent` or
`snapPoints` once through the provider, only per instance. It was **not made**:
the seven axes in the provider are appearance and policy, while the three
limits are about a particular panel's content, and a product-wide floor for
every drawer regardless of what is in it is a value nobody could choose well.

## 11. Documentation

Two reference pages, fifteen scenarios each, every one with a caption saying
what to look at and the two or three lines a consumer would actually write.
Anatomy names all eleven parts; the API table carries every declared default and
both halves of both state models; the events table carries five outputs on the
Angular page and three on the React one; composition and accessibility are their
own sections. `specs/reference-pages.test.mjs` and `referencePageErrors` both
pass, and every snippet is Prettier-formatted.

**The pages were read rendered, after the first published version of them was
broken and the reviewer found it.** What was wrong, and what it cost:

- **The page could not be scrolled and one click emptied it.** Fifteen
  demonstrations stood open as *modal* layers. A modal layer locks the document
  scroll and reads every press elsewhere as an outside press, so `body` carried
  `overflow: hidden` on a page twenty-three thousand pixels tall, and one click
  anywhere closed fifteen panels at once. `dialog` had met this and written the
  recipe — a scene that exists to be looked at is not modal, does not take focus
  and cannot be dismissed — and these stories were written before that recipe
  existed and never picked it up.
- **Adopting it was blocked by a defect of the family**, which is why the fix
  reaches past the stories: the scrim was gated on `modal`, so a non-modal
  demonstration lost the scrim that is half its picture. `modal` decides what
  happens to the page *behind* the scrim and never what is painted, which is how
  `dialog` draws it. Both bindings, the contract and both pages changed with it.
- **Two scenes put an inline drawer in half a page.** The panel alone is
  eighteen rems and the half was 275 pixels, so the page beside it was squeezed
  to its own padding — 32 pixels of box holding 32 pixels of inset. Both pages
  had it; only the Angular measurement caught it, because its paragraph
  overflowed by thirteen pixels where React's did not. Those two scenes take one
  column now, which is what `stories.md` says of a family that answers its own
  width.

After the corrections, measured on both pages at 1280 and 620: **22 stages, no
collapsed element, no overflowing box, no sideways scroll**, `body` scrolling
normally, and a click changing nothing. Read at 1280 in light and in dark: the
inline scene, the resize scene and the modal pair.

`tools/harness/audit.mjs` reports no finding on either page at either width, but
its result is weaker than it looks on a page this long: it measures as soon as
the first stage appears and saw four of the twenty-two. The numbers above come
from the same measurement run after the page settles, which is the gap this
family leaves for whoever touches that tool next.

What was also read: the harness page,
`tools/harness/out/drawer.html`, nine scenes across the axes below.

| Capture | Read for |
| ------- | -------- |
| `page-behind`, light / dark / high-contrast at 420 | the panel, the scrim, the rules, the edge in each scheme |
| `page-behind`, light at 240 | the clamp, and the page disappearing behind a full-bleed panel |
| `page-behind`, light dense at 420 | what density moves, and what it does not |
| `side-start`, light at 420 and rtl at 420 | the mirrored layout, and the separator on the mirrored edge |
| `side-start`, focus on `[data-part='resizer']` | the ring, and the grip inside it |
| `side-start`, dark, focus on `[data-part='close']` | the ring on a tinted surface |
| `sheet`, light at 420; dark with the resizer focused | the leading corners, the grip above the header |
| `side-top`, light at 420 | the other block edge, and its corners |
| `inline-open` and `inline-closed`, light at 420 | the flow box, its edge, and the collapse to nothing |
| `content`, light at 420 | a hostile string, and a body longer than the layer |
| `loading`, light at 420 | the floor, and a header that stays operable |
| `nested`, light at 420 | two layers, one stack |

**The one change:** `audit.mjs` measuring after the page settles rather than at
the first stage it sees, so its clean result on a twenty-two-stage page means
what a reader takes it to mean. It was **not made** here — it is a shared tool,
and changing its timing while another lane is mid-write in the same package is
the kind of fix that lands on somebody else's failure. It is written in
`docs/BUILD-LOG.md` as a debt with the evidence attached.

---

## Against `docs/component-features.md` §18

**1. Purpose, uses and anti-uses.** A panel for a secondary task, a detail or a
filter set, from an edge of the layer or of the layout. Not a dialog: a dialog
interrupts to hold one task and returns; a drawer stands beside the work. Not a
popover: a popover is anchored to an element and this is anchored to an edge.
Not `floating-window`: a panel that a reader moves and resizes freely in two
axes is wave 8.

**2. Anatomy.** Eleven parts, listed in `contract.json` and on both pages:
`root`, `trigger`, `backdrop`, `panel`, `resizer`, `header`, `title`,
`description`, `body`, `footer`, `close`.

**3. Controlled and uncontrolled, with reasons.** The table under §9 above. The
request is cancellable, and one guard covers all five ways to close.

**4. State matrix.**

| State | Attribute | Where it comes from | What it changes |
| ----- | --------- | ------------------- | --------------- |
| `open` | `data-open` | the state model | the slide, the scrim's opacity, an inline drawer's measure, and `inert` |
| `loading` | `data-loading` | the `loading` input | the body's floor and its `aria-busy` |
| `dragging` | `data-dragging` | the separator's pointer capture | the transition, which is removed, and the grip's colour |
| `hover` | `:hover` | the pointer | the close button's fill, the separator's ground and its grip |
| `active` | `:active` | the pointer | the close button's fill, one step further |
| `focus-visible` | `:focus-visible` | the keyboard | the ring on the close button and on the separator, and the grip's colour |

Precedence: `loading` does not suppress hover or press, because nothing is
disabled while a drawer is loading — the header, the close button, Escape and
the separator all stay operable, and a drawer a reader cannot leave is the worse
failure. `dragging` removes the transition rather than painting over a weaker
state, so it competes with none of them.

**5. Keyboard, focus, ARIA, touch and screen reader.** Ten keys, documented in
`contract.json` and asserted in both specs. Focus is contained under
`overlay` + `modal`, entered on open under `overlay` only, and restored in both
modes. Touch: `touch-action: none` on the separator so a drag is not read as a
scroll; the theme grows every control under `pointer: coarse`. Screen reader:
not exercised — §7 above says so.

**6. Recipes by size, density and variant.** `size` is five steps of the family's
own scale; density moves the controls through the theme's control geometry; there
is no `variant`, because a drawer is one surface and a tone on it would be a
second answer to what `alert` already says inside the body.

**7. Responsive, RTL, locale and reduced motion.** `min(var(--_extent), 100%)`
is the clamp; the mode switch is the consumer's; the whole layout is logical and
one `:dir(rtl)` rule flips the exit slide; reduced motion is inherited. Locale:
the family holds no formatted value, and the one number it announces is a bare
0-to-100 — §6 above records the cost.

**8. Loading, empty, error, disabled and extreme content.** Loading is a state.
Empty is `result-state`, which owns the seven statuses and their marks; the
composition is on both pages. Error is the consumer's own content. Disabled is
not a state a drawer has: a panel nobody may open is a panel nobody renders.
Extreme content is the `content` scene and the harness's own scene — a
ninety-character unbroken token and a body longer than the layer.

**9. SSR, performance and virtualization.** `useId` on React and an
application-scoped id factory on Angular, so server and client sequences match.
The portal container is resolved in an effect, so the server renders the trigger
and nothing else. `mount="active"` builds the layer only while it is open, and
one `ResizeObserver` exists per drawer that has a measure, only while it has
one. Virtualization is a collection's capability, and a drawer holds no
collection.

**10. Examples.** Fifteen scenarios per page, listed under §11 above.

**11. Behavioural tests shared between bindings.** 33 in React and 26 in Angular,
against the same contract file, plus four apiece checking the reference pages. Both assert the anatomy, the axes, the five
close sources, the two modes, the separator's wiring, all seven separator keys,
the drag and its dismissal rule, the loading state and the defaults provider.

**12. Changelog, stability and migration.** The family is new; nothing migrates.
The two contracts it changes outside itself are the `extent` capability in
`specs/contract.schema.mjs` and the `shell` primitive in the workbench, both
landed in their own commits before the family, and both additive.
