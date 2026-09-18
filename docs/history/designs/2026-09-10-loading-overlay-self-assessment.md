# Loading overlay self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. Each dimension names the one change that
would most improve it and says whether it was made.

Captures live in `/tmp` under `loading-overlay-<scheme>-<density>-<dir>-<width>.png`;
the harness page is `tools/harness/out/loading-overlay.html`.

---

## 1. Icons

The family draws no artwork of its own. Its one mark is
`progress-indicator`'s loader, rendered **contained** — M3's 38-in-48 ratio —
and every other glyph on the page belongs to whatever the consumer covered.

**The change that would most improve it, and it was made:** the mark was
uncontained at first. Two things came of that and both were found in captures.
The shape turns, and a turning box overflows the box that holds it — 2 to 9
pixels of scrollable overflow measured on the live page, rising and falling on
the beat of the animation, which the panel answered with a scrollbar that
flickered for as long as the wait lasted. And in the smallest regions, where the
panel gives up its ground, the mark sits directly on the wash: on a dark scheme
a light blue on near black reads, on a light one a dark blue on a dark tint does
not. `contained` answers both, at the 3:1 `progress-indicator` holds between a
contained shape and its container.

Forced colours: the family writes no `forced-colors` rule, which is the
briefing's own decision. The panel's edge is `--slotted-border-subtle` and is
drawn in every scheme, so when the theme drops the shadow and turns the scrim
opaque the edge is what still separates the panel from what is behind it.

## 2. Motion

One transition: the wash fades in on `--slotted-duration-medium` with
`--slotted-easing-enter`, and out on `--slotted-duration-short` with
`--slotted-easing-exit`. Nothing moves. A panel that slid would be a dialog's
entrance, and this layer arrives while the reader is looking at the thing it
covers — the eye should find it, not follow it. Every state pair the family can
move between is `blocking ↔ not blocking`, and that is the pair the fade is for.

**The change that would most improve it, and it was made:** the entrance was a
keyframe, copied from `menu`. A keyframe on the open rule fires on every first
paint, including a layer that was already blocking when the page loaded, and the
first capture caught a half-faded wash with the covered text reading straight
through the panel. Both directions are transitions now, and the scrim is in the
document from the moment the family is — which is what gives a transition a
previous style to start from, and what makes an already-open layer simply be
there.

Reduced motion: the two durations collapse to `1ms` through the theme's own
`prefers-reduced-motion` block. The family loops nothing; the mark's own
animation stops in the sheet that draws it.

**Open, and raised at the gate rather than fixed:** the reviewer reports that
the scrim in this family, in `dialog` and in `drawer` steps darker at the moment
the fade ends. It does not reproduce here. Measured twice on the live page —
software rasterisation and GPU rasterisation, sampling the composited pixel from
before the fade to three seconds after — the wash reaches `rgb(147 150 159)` at
60 ms and never changes again. §Open questions below names the likeliest cause
and the one-line experiment that would confirm it.

## 3. Responsiveness

The family answers its own inline **and block** size. `scrim` is the query
container, with `container-type: size`; the root is deliberately not, because
`container-type` applies containment and the root's other child is the
consumer's own content.

Three arrangements, chosen by the region:

| The region                                                        | The panel                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| taller than 168px                                                 | a column: mark, label, description, control, centred  |
| 168px or shorter, wider than 260px                                | a bar: mark, the two lines beside it, control at the end |
| 220px or narrower, 88px or shorter, or short and under 260px wide | the mark alone, and the panel gives up its ground     |

Each number was set by a capture rather than chosen: 168 by a panel taller than
the card it was centred in, 260 by a bar at 240 pixels that broke a sentence into
two-word lines, 88 by the height of a bar plus its own padding.

**The change that would most improve it, and it was made:** the bar shrink-wrapped
and its text column resolved narrower than the sentence in it — "Importing 4 812
rows" broke across two lines beside a control with room to spare on both sides.
The bar now takes a floor of `min(region, 18rem)` and gives the slack to the text
track, so the two arrangements agree about how wide a panel wants to be and the
region still decides how wide it may be.

Read at 240, 420 and 720 pixels in the harness, and at 620 and 1280 on both
reference pages.

## 4. Refinement

Read at full size in light, dark and high contrast at 420; light at 240; dense
at 420; RTL at 420; and four scenes at 720. States photographed: hover, press
and focus on the control, in light, and focus in dark. `loading` and its absence
are two scenes of their own (`region`, `revealed`).

What the captures corrected:

- the two lines were as far apart as the control was from both, so the panel read
  as four evenly spaced objects; the gap between them is now nothing and what
  separates them is the leading the two line boxes already carry, which scales
  with the type at every step;
- a one-line bar sat its words at the top of a 34-pixel block, because a grid
  distributes a spanning item's excess across the tracks it spans and row two was
  empty; a bar with one line now takes both rows and centres;
- hover was drawn with the sunken surface, which on a raised panel is one or two
  per cent away from the ground under it — invisible; it is the neutral subtle
  pair every other unfilled control in the library answers with;
- `sm`, `md` and `lg` were four pixels of padding and four of mark apart and
  photographed as three pictures nobody could tell apart; the type joined the
  axis, on the control font-size scale, which is also what carries `dense` into
  the panel;
- a one-word label produced a portrait card taller than it was wide, so the panel
  has a floor three marks across, derived from the mark's own scale.

**The change that would most improve it, and it was made:** the panel's lift was
one step below `dialog`'s and `drawer`'s, and it read as part of the wash rather
than as something standing in front of it. Every surface in this library that
floats over a scrim takes `--slotted-shadow-lg`; this one does now.

Focus ring: 2px at 2px offset, clear of the control's own edge in both schemes,
and it changes no layout. Zoom to 200% was not exercised on a real screen — see
§Open questions.

## 5. Tokens

`packages/styles/src/loading-overlay/loading-overlay.tokens.json` lists 46
properties. Six belong to this family:

| Hook                                | Why it is not an alias                                          |
| ----------------------------------- | ----------------------------------------------------------------- |
| `--slotted-loading-overlay-scrim`   | A product may want its overlays lighter than its dialogs         |
| `--slotted-loading-overlay-blur`    | No scale in the foundation measures a blur                       |
| `--slotted-loading-overlay-surface` | The panel's ground, retunable apart from every other raised surface |
| `--slotted-loading-overlay-radius`  | The panel's corner                                               |
| `--slotted-loading-overlay-measure` | No scale measures a panel's reading width                        |
| `--slotted-loading-overlay-inset`   | The distance the panel keeps from the region's edges             |

Everything else is read directly. **The change that would most improve it, and it
was made:** the first draft had fifteen hooks, nine of which aliased a semantic
token — `--slotted-loading-overlay-color` for `--slotted-text`, and so on. Button
emptied the component layer by reading `--slotted-control-*` directly and this
family follows it.

Two literals, both recorded beside the rule that holds them: the blur radius
(3px, no scale measures it) and the three container breakpoints (a container
condition cannot hold a custom property).

## 6. Patterns

**Source:** the WAI-ARIA APG pattern index, <https://www.w3.org/WAI/ARIA/apg/patterns/>,
read 2026-09-10. It publishes no pattern for a loading overlay, a busy region or
a blocking layer. That is recorded in the contract rather than approximated:
claiming the Dialog pattern would import focus containment, `aria-modal` and a
close affordance into a component that is not a dialog and holds no reader-owned
open state.

The normative guidance the family does follow, item by item:

| Source                                          | What it asks                                                                                          | Where                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| ARIA 1.2 `progressbar`                          | "set `aria-busy` to `true` on the region until it is finished loading"                                | `root`, region scope                  |
| ARIA 1.2 `status`                               | implicit `aria-live="polite"`, implicit `aria-atomic`, never focused                                  | `announcement`                        |
| ARIA 1.2 `aria-modal`                           | "mark all other contents as inert" when a modal element is displayed                                  | page scope, via `dismissable-layer`   |
| ARIA 1.2 `aria-modal`                           | inherits only into `dialog` and `alertdialog`                                                          | not written — this layer is neither   |
| HTML `inert`                                    | "removed from the tab order and accessibility tree"; Baseline since April 2023                        | `content`                             |

Keyboard, declared in the contract and tested in both bindings: `Tab` leaves the
layer in region scope and wraps in page scope; `Shift+Tab` wraps in page scope;
`Escape` asks to cancel, and is bound only while a control exists for it to ask;
`Enter` and `Space` are the platform's own on the control. The covered content
answers no key at all, which is the point.

**Deliberate departure, with its cost:** page scope makes the document inert and
writes no `aria-modal`. The cost is that a screen reader gets no "modal" hint —
which is correct, because the layer is not a dialog and marking it one would
promise a dialog's semantics it does not have.

**The change that would most improve it, and it was made:** the first draft bound
`Escape` unconditionally. A key that appears to do something and does nothing is
worse than a key nobody bound.

## 7. Accessibility

- **Name and role.** The layer has neither, deliberately: it is not a dialog and
  not an alert. What speaks is one `role="status"` holding one sentence.
- **State.** `aria-busy` on the region in region scope; nothing in page scope,
  because the busy region would be the document root.
- **Announcement.** One per overlay, emptied rather than replaced when the wait
  ends — emptying a live region announces nothing, so a wait says one thing
  unless `loadedLabel` asks for a second. The two painted lines carry
  `aria-hidden`, so the same sentence is not heard twice. `live="off"` renders no
  live region at all.
- **Keyboard and focus.** The covered subtree is `inert`. Focus is read before it
  goes inert: inside, it moves to the control or to the panel itself and returns
  where it came from; elsewhere, nothing moves. Both halves are tested in both
  bindings.
- **Colour.** Nothing is carried by colour alone — the wash, the panel and the
  mark are all geometry, and the words are in the live region.
- **Forced colours and reduced motion.** Inherited from the theme; the family
  writes no rule for either, and the panel's edge is what survives when the
  shadow is dropped and the scrim goes opaque.

**The change that would most improve it, and it was made:** the covered content
was reachable. `inert` is the one capability the two surveyed implementations
that document accessibility both decline — Quasar states outright that "the
content it covers stays in the accessibility tree and remains focusable" and asks
the developer to solve it; Mantine says the same. This family solves it, and pays
for it with the `content` wrapper §3 of the design document argues for.

## 8. Native API

React is React and Angular is Angular, and the asymmetries are recorded rather
than levelled:

| React                                       | Angular                                              |
| ------------------------------------------- | ------------------------------------------------------ |
| `LoadingOverlayDefaultsProvider` + hook     | `provideLoadingOverlayDefaults()` + injection token  |
| `render` / `renderCancel`                   | a bare attribute selector; `[slLoadingOverlayCancel]` |
| `indicator` node prop                       | `[slLoadingOverlayIndicator]` projection slot        |
| `ref` to the region                         | `exportAs="slLoadingOverlay"`, including `painted()` |
| props are `ComponentPropsWithRef<'div'>`    | native attributes stay on the consumer's own element |

Angular's selector is a bare attribute, so the region is the element the page
already has — a `section`, a `form`, a list item — and the family inserts nothing
around it. React cannot do that and offers `render` instead.

No `ControlValueAccessor`: the family holds no value and belongs in no form. A
form control that blocked its own form would be a contradiction.

**The change that would most improve it, and it was made:** `LoadingOverlayCancelProps`
declares `children` as required rather than optional — the one place these part
props differ from the native element's. Without it, a consumer spreading them
into this library's own `Button` was told the spread might supply no children,
which is the exact composition the page recommends.

## 9. Capability

Measured against `2026-09-10-loading-overlay-capability-inventory.md`, not
against the scope paragraph. Eighteen table-stakes rows: fifteen `adopt` or
`adapt`, one `defer to toast`, three `decline` — each naming the family that owns
the capability instead or the two lines that replace it.

What shipped beyond the guide's sentence: two scopes, three veils, three sizes,
a live axis, `delay` and `minDuration`, `onReveal`, a cancel request with two
reasons, `Escape`, a replaceable mark, a replaceable control, an application-wide
provider in both bindings, and the focus move nobody else makes.

`loading` holds no state model, and that is the decision §4 of the design
document argues: the value is the consumer's own fact, and a family that could
move it would render a reachable region while the request was still in flight.
It is the shape `skeleton` and `progress-indicator` already hold and the reason
`removable` and `measurement` are declared immutable in the shared schema.

**The change that would most improve it, and it was made:** the first draft had
no `shapes` scenario and no bar arrangement — a panel that was always a column,
which meant a family that could not cover a table row without spilling out of it.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in §8 of the
design document. Every line has a place or a sentence; none is blank.

**The change that would most improve it, and it was made:** the Angular indicator
slot was a bare attribute with no directive behind it, which meant the component
could not tell whether a consumer had projected a mark at all — and the two cases
need different layout, because a determinate bar has no intrinsic width to be
centred at. `SlLoadingOverlayIndicator` exists so a content query can ask.

## 11. Documentation

Two reference pages, thirteen demonstrations each, one per declared scenario,
every one with a caption saying what to look at and the code that produced it.
Read rendered — not as story files — at 1280 and 620 pixels, in light, on both
ports. `tools/harness/audit.mjs` reports no finding on either page at either
width.

What reading them corrected: three identical captions on the `sizes` scenes; a
`timing` scene whose canvas showed nothing about timing; a determinate bar drawn
as a two-pixel dash; a long file name that never actually broke because the
region was wide; a covered region 312 pixels wide inside a 1306-pixel stage,
which made the `cancel` bar wrap a sentence it had room for.

**The change that would most improve it, and it was made:** the `timing` scene
showed one region with the durations set, which demonstrates nothing on its own.
It shows a pair now, driven by one boolean that flips every nine hundred
milliseconds: on the left the layer paints on every flip, on the right it paints
on none of them.

---

## Section 18, item by item

1. **Purpose, use and anti-use.** Covers content that is already there and must
   not be touched. Not for content that has not arrived — that is `skeleton` —
   and not for a wait that does not block, which is `progress-indicator`'s
   `placement="page"` bar. Page scope is refused for a local operation, which is
   the guide's own warning.
2. **Anatomy.** Nine parts, in the contract and on both pages.
3. **Controlled and uncontrolled.** None: `loading` is the consumer's fact and
   the family never moves it. The one request is `onCancel`, carrying `dismiss`
   or `escape`, committing nothing.
4. **State matrix.** `default`, `loading`, and on the control `hover`, `active`,
   `focus-visible`, `disabled`. Precedence is the shared order: the control's
   hover and press hold themselves back for `disabled`.
5. **Keyboard, focus, ARIA, touch, screen reader.** §6 and §7 above; tested in
   both bindings. Touch: the control reads the control scale, which the theme's
   own validation keeps above the WCAG target minimum, and grows under
   `pointer: coarse` with every other control.
6. **Size, density, variant, tone via tokens.** Three sizes moving three things
   each; density through the control scale; no tone, because a wait has one.
7. **Responsive, RTL, locale, reduced motion.** §3 and §2. RTL captured at 420 —
   the bar mirrors, the mark moves to the trailing edge, and it is the same
   component. No locale-sensitive value: the family formats nothing.
8. **Loading, empty, error, disabled, extreme content.** Loading is the family.
   Empty and error belong to `result-state`. Disabled applies to the control and
   is captured. Extreme content: a translated sentence and an unbroken token,
   both on both pages and in the harness.
9. **SSR, performance, virtualization.** `useId` for identifiers; no layout read
   during render; the timing machine schedules no timer in its default
   configuration, verified by a test that spies on `setTimeout`. Nothing to
   virtualize.
10. **Examples.** Thirteen demonstrations per page, in one product's domain.
11. **Behavioural tests shared between bindings.** 29 in React, 25 in Angular,
    asserting the same facts: the content stays and goes inert, the announcement
    empties, the request commits nothing, focus moves and returns, the durations
    hold, page scope claims no busy region.
12. **Changelog and migration.** A new family: nothing to migrate.

---

## Open questions raised at the gate

**The scrim's step, reported in three families.** It does not reproduce in this
environment. Measured on the live page in two configurations — software
rasterisation, then `--use-gl=angle --use-angle=swiftshader
--enable-gpu-rasterization` — sampling the composited pixel from before the fade
to three seconds after: `255,255,255` before, `147,150,159` from 60 ms onward,
unchanged. Since it is reported across `dialog`, `drawer` and this family, and
all three fade a translucent background with an `opacity` transition, the
likeliest cause is the compositor: Chrome promotes an element with a running
opacity transition to its own layer and blends the translucent background there,
then removes the layer when the transition ends and re-blends. The experiment
that would confirm it is one declaration — `will-change: opacity` on the scrim,
which keeps the layer promoted for the element's whole life. If it fixes it, the
decision binds three families' stylesheets and a permanently promoted layer per
overlay, which is a foundation-level call and not this family's to make alone.

**Two things this machine cannot check:** a real screen reader on the
announcement and the focus move, and 200% browser zoom. Checked in their place:
the accessibility tree assertions in both binding suites, and the captures at 240
pixels, which is the narrowest the harness offers.

**Outside this family, and reported rather than touched:** `pnpm test:docs` fails
on five snippets in `packages/react/src/upload` and `packages/angular/upload`,
both untracked and mid-write in the other lane. Everything else in `pnpm check`
passes.
