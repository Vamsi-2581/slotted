# Dialog and Alert Dialog self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. The rubric's scoring rule is answered for
each: the one change that would most improve it, and whether it was made.

The family is `dialog`, with two members — `dialog` and `alertDialog` — under one
`data-ui`. The reason is in
`2026-09-04-dialog-and-alert-dialog-design.md` §1.

---

## 1. Icons

Three marks, all geometry from glyph tokens, none of them a character: the ✕ on
the close button from `--slotted-icon-x`, and the alert member's tone mark from
`--slotted-icon-circle-alert`, `--slotted-icon-triangle-alert`,
`--slotted-icon-circle-check` or `--slotted-icon-circle-info` depending on the
tone. Each is a `mask-image`, so it takes `currentcolor` and survives forced
colours, where the tone's ground becomes one system colour and the silhouette is
all that is left. Nothing here is direction-sensitive: an ✕ and a circle are
symmetric, so the right-to-left capture needed no mirrored artwork.

**The one change that would most improve it:** the alert mark is sized from
`--slotted-font-size-3xl` — the type scale — rather than from a glyph scale,
because the control glyph scale tops out at 18 pixels and a mark that carries a
whole panel is not a control's glyph. **Not made.** Adding a fifth scale to the
foundation is a change to ground every family stands on, and
`docs/token-foundation.md` sets a bar for that which one family's mark does not
clear. `result-state` reads its own marks the same way, so the pattern is at
least consistent rather than invented here.

## 2. Motion

Four transitions, all from the motion scale, none handwritten: the scrim's
opacity, and the panel's opacity, `scale` and `translate`. Arriving takes
`--slotted-duration-medium` on `--slotted-easing-enter`; leaving takes
`--slotted-duration-short` on `--slotted-easing-exit`, because a reader who has
decided to close is waiting. `packages/styles/src/motion.test.mjs` refuses a time
literal anywhere in the sheet, including inside a `var()` fallback, so the
theme's reduced-motion block reaches all four.

The state pairs that do **not** transition, and why: hover and press on the close
button transition their colours only, through
`--slotted-control-transition-duration`; nothing loops, so nothing needs the
explicit stop the foundation requires of infinite animation.

One correction the captures found: the closed state hid the layer at the first
frame of an exit `presence` was still holding the node mounted for. The root now
carries `transition: content-visibility … allow-discrete`, which is what makes
`mount="eager"` and `mount="lazy"` animate out at all.

**The one change that would most improve it:** the panel arrived with a
`translate` of eight pixels from the block-start, which is a direction chosen
rather than derived — there is nothing for a centred panel's movement to be
*from*. **Made:** a centred panel now grows into place with opacity and scale
alone, and only `placement="top"` translates, because a panel hung off the start
edge does have an edge to come from. Growing from the trigger instead was
considered and refused: it needs the trigger's box measured at open, which is a
layout read this family otherwise does not do, and it has no answer at all for a
layer opened from code.

## 3. Responsiveness

The layer declares `container-type: inline-size` and `container-name:
slotted-dialog` on its root, and the panel — a descendant — is what the query
sizes. That is the two-element split `docs/build-briefing.md` records, and it is
also why the family answers a *portal container's* width rather than the
window's: a dialog inside an application shell's own stacking context is as
narrow as that shell.

The breakpoint is `30rem`, written as a literal because
`@container (max-inline-size: var(--x))` is invalid CSS.

Read at 240, 420 and 720 pixels, and at `dense`. At 240 with `fullScreen="narrow"`
— the default — the panel fills the layer and the footer's actions stack; with
`fullScreen="never"` it keeps its margins and the title wraps to two lines, which
is the case the `hostile-content` scene exists to show.

**The one change that would most improve it:** the layer's own padding is one
step at every width, so at 240 pixels with `fullScreen="never"` the panel is 168
pixels wide inside a 240-pixel layer. **Made:** the default is `narrow`, so the
ordinary case goes edge-to-edge below the breakpoint and the cramped one is what
a consumer has to ask for.

## 4. Refinement

Read at full size in `light`, `dark` and `high-contrast`, at `comfortable` and
`dense`, mirrored, and with `--focus`, `--hover` and `--active` on the close
button in both schemes.

Four corrections came out of the pictures, and none of them could have come from
a test:

- **A panel with no body had no row that could shrink.** `auto` rows do not, so a
  header and a footer taller than the layer pushed the actions past its bottom
  edge. The viewport now scrolls as the last resort in both scroll modes.
- **Full screen left the panel floating.** The padding was gone and the panel was
  still centred with the scrim above and below it, because a percentage block
  size resolves against a grid area `safe center` had already sized to the
  content. `align-content: stretch` was the missing half.
- **The panel's edge could not be found in the dark scheme.** `#1c1c20` on black
  at 62%, with every shadow token black on black. The outer edge moved to
  `--slotted-border-strong` — the foundation's own name for the line between two
  surfaces — while the header and footer rules stayed on the subtle step, which
  is the line inside one surface.
- **An alert dialog drew two rules as one.** With no body between them, the
  header's bottom rule and the footer's top rule stacked into two pixels. Every
  rule now belongs to the row below it, which makes the count right for every
  combination a consumer can write.

The states, judged against each other: the focus ring is inset by
`--slotted-focus-ring-offset` so it sits inside the close button's own box rather
than being clipped by the panel's `overflow: hidden`; hover is a subtle tone
wash that reads at a glance without shouting; press goes one step darker on the
same token pair; nothing shifts by a pixel between the three, because all three
paint colour and none paints geometry.

One correction a reader found after the release gate, and it was three numbers
doing one job: the header, the body and the footer all carried the same block
inset. The body is prose and the inset is what its air is for; the header is a
title block whose line height already carries some, and stacking its bottom inset
against the body's put forty pixels between a description and the paragraph it
introduces; the footer is a row of controls, and a control carries its own height
— twenty above and below a thirty-four pixel button is a seventy-four pixel bar
for one line. Three named insets now, one reason each, and the panel is
forty-six pixels shorter at `md` for it.

**The one change that would most improve it, with another hour:** the close
button's negative inline-end margin pulls its box past the panel's padding so
the *glyph* lines up with the title's inset, and the value is one space step
rather than a computed half-difference — so it is correct at `md` and
approximately correct at `sm`, where the panel's padding is one step tighter.
**Not made.** The measurement to do it properly is `(control height − glyph
size) / 2`, which is available in CSS and would replace one legible declaration
with a three-token `calc` for a difference the captures do not show at 2× scale.
It is written here rather than in a comment because the next size step added to
this family is where it starts to matter.

## 5. Tokens

Sixty-eight tokens, listed in `packages/styles/src/dialog/dialog.tokens.json` and
checked against the stylesheet by `packages/styles/src/tokens.test.mjs`. Thirteen
of them are the family's own — `--slotted-dialog-scrim`, `-surface`,
`-border-color`, `-rule-color`, `-radius`, `-footer-surface`, `-title-color`,
`-description-color`, `-body-color`, `-color`, and three for the close button —
and every one falls back to a foundation token, never to a literal outside the
documented exemptions and never to a system colour.

The family adds nothing to the component layer of
`docs/token-foundation.md`. The five size steps are local custom properties
(`--_measure`) composed from `rem` values, which is geometry rather than a scale
a theme retunes; a consumer who needs an exact measure writes `max-inline-size`
on the content part.

**The one change that would most improve it:** the measure was a private
property, so the five steps were the only widths the family had and a consumer
who needed a sixth had nothing to set. **Made.** Every step now reads
`--slotted-dialog-measure` as its own fallback, so an explicit measure wins over
whichever step was asked for, and it is set per instance with a style attribute,
per region with a rule, or once for an application in the theme. It is on both
theming snippets and in the composition table.

The five steps themselves stay stated in the stylesheet rather than composed from
a foundation scale, and that is a deliberate departure: there is no width scale
in the foundation, and adding one for one family is the component-layer bar
`docs/token-foundation.md` sets and Avatar cleared for a reason this family does
not have. The token above is what makes the absence of that scale cost nothing.

## 6. Patterns

Sourced from the WAI-ARIA Authoring Practices on 4 September 2026, not from
recall: <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/> and
<https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/>. The itemised comparison
is in the design document §7 and in `specs/components/dialog/contract.json`,
which carries the whole keyboard table with the focus destination of every key.

Every row passes. Two deliberate departures, each with its cost written:

- **`aria-modal` is not written for a non-modal layer.** The APG's own note says
  a dialog marked modal without the application actually preventing interaction
  has "severe negative ramifications" for the readers who rely on the mark, so
  `modal={false}` writes neither `aria-modal` nor `inert`. The cost is that a
  non-modal dialog is reachable by Tab from the page behind it — which is what a
  non-modal dialog is.
- **The platform's `<dialog>` element is declined.** The full argument and its
  cost are in the capability inventory §2. In short: the top layer paints above
  everything regardless of `z-index`, and every other overlay in this library is
  stacked with `--slotted-z-index-*` plus `--slotted-layer-depth`, so a `select`
  opened inside a `<dialog>` would paint behind the dialog it belongs to. The
  cost is that containment, inertness and Escape are JavaScript here, and a page
  with scripting disabled has no dialog at all.

**The one change that would most improve it:** nothing in the pattern is
outstanding. What would improve the *comparison* is a test that reads the
contract's keyboard table and drives each key against both bindings, rather than
the two suites asserting the same behaviours in their own words. **Not made:** a
cross-binding driver is shared tooling no family owns yet, and inventing it
inside this family is the coupling the briefing refuses.

## 7. Accessibility

Name, role, state, keyboard, focus, forced colours, reduced motion and target
size are complete for every state the contract declares, and each is exercised
by a test rather than asserted.

- **Name and description:** `aria-labelledby` and `aria-describedby` are written
  only for parts actually rendered, because a reference to an id nothing carries
  is worse than no accessible name at all. A consumer's own `aria-label` survives
  and suppresses `aria-labelledby`. The alert member *requires* a description and
  throws without one.
- **Keyboard:** Tab and Shift+Tab wrap inside the layer while modal; Escape
  reaches the topmost layer only, and a layer that refuses stops the request
  reaching the one beneath it.
- **Focus:** in on open — first tabbable, the panel itself, or an element the
  consumer names; the alert member's default is the cancel action. Out on close,
  to the element that held it, or to that element's nearest connected ancestor
  when the dialog deleted the row it was opened from.
- **Forced colours:** every token the family reads is remapped by the theme. The
  one rule the family writes is the panel's border at the thick step, because
  `--slotted-scrim` becomes an opaque `Canvas` there and a panel separated only
  by a shadow — every shadow token is `none` — would have no edge at all.
- **Target size:** the close button is `--slotted-control-height-md` square
  rather than the size of its 16-pixel mark, so it clears the WCAG 2.2 minimum of
  24 × 24 in both axes, and the theme grows it again under `pointer: coarse`.

**What this machine cannot verify, and what was checked instead:** no screen
reader, no touch device and no real display were available. What stands in its
place: `inert` on every sibling up to the document root, which is the one
attribute that answers both the pointer and the accessibility tree; the role,
`aria-modal` and both id relationships asserted in 76 behavioural tests across
the two bindings; and the forced-colours rule read in a `high-contrast` capture,
which is the scheme and not the operating system's mode. A reader with a screen
reader should exercise the announcement on open.

**The one change that would most improve it:** `initialFocus="container"`
focuses the panel, and the panel then needs a `tabindex` the family writes and
takes back — which `createFocusScope` does, and which means the panel is briefly
focusable in a way a consumer inspecting the DOM would not expect. **Made
differently:** the scope gives the attribute back on destroy and leaves a
consumer's own `tabindex` alone, which is tested.

## 8. Native API

React is React and Angular is Angular, and the design document §9 and §10 answer
both integration tables line by line.

React: function components, `useId`, context for the family and a second for the
application's defaults, `render` on every part including the panel,
`ComponentPropsWithRef<'…'>` as the base of every part's props, `exactOptionalPropertyTypes`
respected throughout, a `ref` handle with exactly the three actions a consumer
cannot express declaratively, and consumer handlers composed rather than
replaced — `preventDefault()` refuses the family's own behaviour.

Angular: standalone components and directives, `model()` for the two-way value,
`output()` for the request and the result, `computed` for everything derived,
`host` metadata rather than decorators, `exportAs`, `inject()`,
`ViewEncapsulation.None` over the one authored stylesheet, `HostAttributeToken`
for a consumer's `aria-label`, and `DestroyRef` for every listener.

**The asymmetries, recorded rather than levelled:** React has a no-DOM provider
component because context needs one and the trigger renders outside the portal;
Angular has none, because a template reference variable plus `exportAs` links the
two. Angular has a third output, `(closed)`, which is `afterClosed()` without the
service. Angular's host element is the portal's *origin*, so the layer inherits
the theme of the region it was written in whether a trigger exists or not; React
uses the trigger, and falls back to the document when a dialog is opened from
code.

`ControlValueAccessor` is not implemented, and the reason is that a dialog holds
no value a form submits. A form *inside* a dialog is the consumer's own, and the
layer neither wraps nor intercepts it.

**The one change that would most improve it:** React's portal origin. **Not
made:** the honest fix is a marker node in the consumer's tree, which is DOM they
did not write — the same objection that kept sentinel nodes out of the focus
scope. It is written on the reference page and in the design document instead.

## 9. Capability

Measured against the inventory in
`2026-09-04-dialog-and-alert-dialog-capability-inventory.md`, not against the
scope paragraph — which was one sentence about `packages/core/src/focus`.

Twenty-six table-stakes rows. Every one is `adopt` or `adapt` except five
declines and two defers, and each of the seven names the family that owns the
capability instead or writes the composition that replaces it:

- `<dialog>` and its top layer — declined, with the z-index argument and the
  three smaller costs, and the condition under which it is revisited.
- A service that instantiates a component — declined, with the three lines of
  `@if` and signals that replace it and the one thing that is genuinely lost.
- `scrollStrategy` — declined; three of its four values describe nothing a
  viewport-anchored layer can do.
- A scroll cue on the body — declined; `scroll-state()` is limited availability,
  the same ground `collapsible` declined `interpolate-size` on.
- Drag and resize — deferred to `floating-window`, wave 8.
- Edge placement and gestures — deferred to `drawer`, wave 5 item 4.

The one mutable value, `open`, has a controlled and an uncontrolled name, a
request carrying one of seven reasons, a cancel, and a row in the state matrix.
The result rides on that request rather than declaring a second state model, and
the contract says why.

Seven differentiators and seven gaps, each with the answer the family ships.

Two capabilities were added after the release gate, both from questions a reader
asked of the pages rather than of the code, and both cheap because the anatomy
was already right:

- **`surface="plain"`.** `render` substitutes the element the panel is drawn on
  and not the drawing, so the layer could not be wrapped around a box the
  consumer paints. The axis turns the family's own paint off and keeps everything
  that is not paint. It is what a headless library ships by default, offered here
  as an axis rather than as the only shape.
- **A column for a consumer's own header content.** The header places four parts;
  anything else auto-placed into whichever cell was free — column one whenever no
  icon was rendered, which is where an alert dialog's mark goes. A status
  indicator beside a title therefore moved as soon as a tone was set. Everything
  unplaced now lands in the words column, aligned with the title, and
  `justify-self: start` keeps it from stretching across the column and painting
  its ground the full width, which the first capture showed.

**The one change that would most improve it:** a `Dialog.createHandle()`
equivalent — Base UI's detached trigger, which lets a trigger live outside the
provider. **Not made:** React's context already reaches every descendant, and a
trigger that is not one is the imperative handle's job, which the family ships.
Angular has no such limitation at all.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered in writing in the design
document, every line with the file that answers it. Two lines are answered `no`
with a reason: Angular's Reactive Forms, because a dialog holds no value a form
submits, and React's `ControlValueAccessor` equivalent for the same reason.

An application sets the family's defaults once in both ecosystems —
`DialogDefaultsProvider` and `provideDialogDefaults()` — over the same eight
axes. Angular Material is the only surveyed implementation with an equivalent,
and neither binding was levelled down to the other's shape.

Every state a consumer may style is in the DOM: `data-open`, `data-loading`, and
the seven axes as `data-*`, on the layer where a consumer's selector can reach
them.

**The one change that would most improve it:** an application-wide portal
container. **Made, and it already existed:** `setPortalContainer()` from
`@slotted/core/portal` names one for the whole document, and the `container`
input names one for a single layer. Both are on the reference pages.

## 11. Documentation

Four pages: Dialog and AlertDialog, React and Angular. Fourteen demonstrations on
one and eight on the other, each with a title, a caption saying what to look at,
and the two or three lines a consumer would actually write. Anatomy rows for
every part the contract declares; API rows for every declared default, checked
by `apiMetadataErrors`; an events table; a composition table; and seven
accessibility paragraphs, each naming a decision rather than a virtue.

Every demonstration opens its layer **inside its scene**, through the same
`container` prop an application shell uses. Without it a reference page for an
overlay family is either a wall of trigger buttons or a full-page layer drawn
over the documentation. The primitive that makes it possible —
`.slotted-demo-viewport[data-size="tall"]` — was added to the workbench with its
own test, in its own commit, as the briefing requires of every shared tool.

**The defect a reader found and no test could.** The first published version of
these pages left a dozen modal layers standing open at once. Each one locked the
document scroll, wrote `inert` on every sibling up to the root, and read any
press on the page as a press outside itself — so the page could not be scrolled,
nothing on it could be clicked, and one press emptied it. Every offline check
passed: the scenarios were covered, the snippets formatted, the API tables
complete. It was found by opening the page.

The rule that came out of it: **a scene that exists to be looked at is not
modal, does not take focus and cannot be dismissed; a scene that exists to be
operated is opened from a trigger, one at a time.** `modal` decides what happens
to the page behind the scrim and never what the panel looks like, so the picture
is unchanged. `AlertDialog` fixes `modal` at true — the pattern's own rule — so
every one of its demonstrations is behind a trigger, which is what Radix's own
page does and what a reader does in an application.

`packages/react/src/dialog/dialog.page.test.tsx` renders every story on both
pages and asserts three things a docs page owes the page it is drawn on: the
body scroll is not locked, nothing at the top level is `inert`, and a press on
the page around a demonstration does not close it. It is the check that would
have found this first.

**Still not closed:** the pages have still not been read rendered by this
machine. Both Storybook servers are running and both predate the family, so `iframe.html?viewMode=docs&id=components-dialog--reference`
navigates away rather than rendering — `tools/harness/audit.mjs` fails on it and
succeeds on `collapsible` on the same server, which is exactly the restart
`docs/build-briefing.md` says a new family needs. The restart interrupts the
other lane, so it is asked for at the gate rather than taken.

---

## Against `docs/component-features.md` §18

**1. Purpose, uses and anti-uses.** A window over the page for one task, and a
confirmation for one irreversible decision. Anti-uses, each with the family that
owns it: a panel anchored to an element is `popover`; one pinned to an edge with
gestures is `drawer`; a modeless movable window is `floating-window`; a message
that does not interrupt is `alert` or `toast`.

**2. Anatomy.** Eleven parts for `dialog` and twelve for `alertDialog`, in the
contract and on all four pages. Stable, and each named by `data-part`.

**3. Controlled and uncontrolled, with a reason.** `open` / `defaultOpen` /
`onOpenChange` in React; `[(open)]` plus `(openChangeRequest)` in Angular. Seven
reasons, one per source, and a `cancel()` that refuses before anything commits.
The mode is decided once, by `@slotted/core/state`, so the two bindings cannot
disagree about which one they are in.

**4. State matrix.** `open` and `loading` as attributes; `hover`, `active` and
`focus-visible` on the close, cancel and action controls. Precedence is the
shared order, and `packages/styles/src/states.test.mjs` holds it: no hover or
active rule paints without holding itself back for `disabled`.

**5. Keyboard, focus, ARIA, touch, screen reader.** The whole modal-dialog table
in the contract with each key's focus destination; 76 behavioural tests across
the two bindings. Touch and screen reader are the two this machine cannot
exercise, named above with what stands in their place.

**6. Recipes through tokens.** Five sizes, two placements, two scroll modes,
three full-screen policies, five tones, three densities, three schemes. Every
visual decision reaches a token; thirteen family tokens are the retuning surface,
and the theming snippet on each page shows four of them.

**7. Responsive, RTL, locale, reduced motion.** A container query at a literal
breakpoint; logical properties throughout, checked by
`packages/styles/src/logical.test.mjs` and photographed mirrored; no locale-bound
behaviour, because the family formats nothing; reduced motion inherited from the
theme's collapse of the four motion-scale durations.

**8. Loading, empty, error, disabled, extreme content.** Loading is a state with
`aria-busy`, a floor under the body and every way out still operable. Empty is
the consumer's — a panel with no body draws one rule rather than two, which is
tested and photographed. Error is not this family's: a form inside a dialog
reports its own. Disabled is not this family's either; the layer is open or it is
not. Extreme content is a scene in the harness and a demonstration on both pages.

**9. SSR, performance, virtualisation.** React renders the trigger on the server
and nothing else — the portal is resolved in an effect — so there is no hydration
mismatch; every id comes from `useId`. `mount="active"` keeps a closed dialog's
content out of the document entirely, and `lazy` builds it on the first open.
Virtualisation is not applicable: a dialog holds no collection.

**10. Examples.** Twenty-two demonstrations across the two members, including the
family in a real context, content it did not choose, composition with `Button`,
`TextField` and `Skeleton`, a dialog inside a dialog, and the keyboard.

**11. Behavioural tests shared between the bindings.** 41 in React and 35 in
Angular, asserting the same behaviours: the anatomy each member declares, read
from the contract file itself; the reasons; the cancellable request; the
dismissal policies; focus in and out; the ARIA relationships; and the two things
the alert member refuses.

**12. Changelog, stability, migration.** Both members are new; nothing is being
migrated and no contract outside this family changed. What did change outside it
is additive and recorded in its own commit: a scene flag in the harness builder,
a height variant on a workbench primitive, and `createFocusScope` in
`packages/core/src/focus`.
