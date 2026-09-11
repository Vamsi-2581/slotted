# Page, page-header and section self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. The Scoring rule is followed: each
dimension names the one change that would most improve it and says whether it
was made.

Evidence paths are absolute where they are captures and repository-relative
otherwise. `$SCRATCH` is
`/tmp/claude-1000/-home-dreco-dev-slotted/059546e4-5393-4621-a0af-e6929feeebcb/scratchpad`.
The reference pages were read on private Storybooks at `http://127.0.0.1:6016`
(React) and `http://127.0.0.1:6017` (Angular), because the shared servers on
6006 and 6007 started before these directories existed and answer 404 for
them until restarted.

---

## 1. Icons

Three glyphs enter the theme for this family: `--slotted-icon-arrow-left` for
the way back, `--slotted-icon-pin` and `--slotted-icon-pin-off` for the pin.
The toggle's chevron is the theme's own `chevron-down`, rotated by state. Every
glyph is a mask over `currentcolor`, sized from the control's icon scale, and
`forced-colors` keeps it through `forced-color-adjust: none` because a masked
background is what forced colours remove first.

The pressed pin draws `pin-off`: the button says what the next press does, as
the toggle's chevron says which way the area will go. `aria-pressed` carries the
state; the glyph is not asked to.

**The one change that would most improve it:** the record navigation draws no
glyph of its own — the consumer's `IconButton` with a chevron does. Not made,
deliberately: two arrows are two buttons the consumer names and disables, and a
family that owned them would own the record model too.

## 2. Motion

| What moves | Duration | Easing | Why |
| --- | --- | --- | --- |
| The root's sticky offset, on reveal and on snap | `--slotted-duration-medium` | `--slotted-easing-standard` | The area travels the height of itself; a thing that travels needs the longer step. |
| The header area's track, `1fr` to `0fr`, by the control | `--slotted-duration-medium` | `--slotted-easing-standard` | The content's own height at every frame, nothing measured, as `collapsible` folds. |
| The area's opacity, with the track | `--slotted-duration-medium` | `--slotted-easing-standard` | Ink that fades while the box closes reads as one movement, not two. |
| The toggle's chevron | `--slotted-control-transition-duration` | `--slotted-control-transition-easing` | The control's own step, like every other control. |
| The footer entering and leaving | `--slotted-duration-medium` | `--slotted-easing-standard` | Held through its exit by `presence`; the status is what the sheet transitions on. |

The heading's size does not transition between expanded and snapped: text
re-rasterised on every frame of a `font-size` change blurs and settles with a
jolt, which the reviewer read as a tilt, so the step is a cut. No shadow moves
either; the chrome's edge is one hairline in every state.

No literal duration exists in any of the three sheets;
`packages/styles/src/motion.test.mjs` caught two fallbacks (`200ms`, `120ms`)
and they were removed. Every step collapses to a frame under
`prefers-reduced-motion` through the theme's scale.

**The one change that would most improve it:** the reveal is an offset
transition on a sticky root, and `inset-block-start` is a layout property, so
every frame of it lays the root out again. A `transform` would not, but a
transformed sticky root would not stick where the sheet says it does. Not
changed; the transition is one step long and the root is one element.

## 3. Responsiveness

Three widths are answered. Above 640 pixels every part has its place on the
title row; below it the breadcrumbs go and the way back stays, the title steps
down one size, the toolbar folds into its menu, the record navigation takes the
line under the title, and the figure stacks over the content. At 240 pixels the
harness capture holds: the heading wraps and clamps, the marks wrap, the actions
wrap under. The title is `flex: 1 1 20rem` with a floor of 60 % of the row, which
is what stopped it collapsing to one character beside a wide toolbar in the
second harness round.

The page answers its own width axis — `measure`, `content`, `wide`, `full` —
through `container`, and every other family's decision about line length is
left to it, as the briefing requires.

Two things outside this family bound the narrow picture. `table` under
`stickyTo="page"` is `max-content` and widens a narrow page, so the
demonstrations held under the chrome show three columns and the narrowest two;
it is recorded in `docs/build-order.md` under this family's entry. `tabs`
revealed its selected tab with `scrollIntoView`, which scrolled every ancestor
and brought a page whose header was taller than its scroller down by a tab's
height on mount; `@slotted/core/overflow` now scrolls only the container along
its own axis, and `tabs` and `toolbar` inherit it.

**The one change that would most improve it:** the record navigation wrapping
alone to a line of its own when the title, the actions and the arrows do not fit
together. Not made: it would need the actions and the arrows in one box, which
is an anatomy change, and the line it takes is where sap.f puts navigation
actions on a phone too.

## 4. Refinement

Defects found by looking, not by a test, and fixed:

- The pill straddled the rule and covered the first line of the area under it;
  the title area and the area now each reserve half a pill.
- `data-when="snapped"` parts showed while expanded because the rule lost to the
  heading's own; the rule now carries six attributes and sits after it.
- The heading's `-webkit-box` clamp reported a width it did not paint, and the
  marks ran past the container; the snapped heading is a block with `nowrap`.
- The description's placeholder was a `div` inside a `p`, which the parser
  closes early; the skeleton's root is a `span` there.
- The header never snapped in Storybook: the observer watched the whole
  scrollport and the covered area still counted as in. Its top edge now moves
  down by what stands above the area — found by the browser probe, not by any
  fake.
- `collapse="manual"` had the engine's rule and not the sheet's; the root now
  states offset zero for it.
- A scroller with a border held the root one pixel below the measured edge, and
  `stuck()` never said so; it measures against the padding edge now.
- An open code drawer widened the scenes column of the reference page by 37
  pixels; the workbench's scenes track can shrink to nothing now, with a test.

Found by the reviewer on the restarted Storybook, and fixed:

- Collapsing by the control after a reveal expanded and collapsed the header
  without end: the observer reported the area in while the root travelled back
  to its offset, the report emptied the track, the content shortened and the
  scroll moved. The engine ignores that report until the area is out again or
  the reader scrolls up, ignores a folded area's empty box altogether, and
  asks the area to collapse on the crossing only — the observer is rebuilt
  when the title changes height, and its first report repeats a fact that in
  Angular landed between the control and the binding. A second cause hid
  under the first: the title grows by a few pixels as the reveal begins,
  everything under it moves by as much, and scroll anchoring moved the scroll
  position by the same few pixels — a scroll event the reader did not make,
  which ended the reveal the instant it began. Nothing under the page's scroll
  part anchors the scroll now, and the engine holds a reveal through a scroll
  of up to 24 pixels in the 400 milliseconds after it began. A third came out
  under a stress probe that scrolls in 6-pixel steps: an area the control
  folded while the page was scrolled came back into view, folded over a
  transition, shortened the content, moved the scroll, and the observer
  reported again — the header flickered all the way up. The fold is instant
  now and the scroll position moves up by what the flow lost as the fold
  lands, before paint, so nothing on screen moves; and a folded header that is
  stuck opens in place when the control asks.
- The tabs floated between the pill's rule and the edge: the tabs grid kept a
  row gap under a list with no panel beside it. One explicit row now; the
  list's line is the header's edge.
- Pinned and scrolled to the end, a short section's header rose over the
  chrome: it shared the chrome's z-index and came later in the DOM. The root
  now stands three steps above every other sticky thing on the page.
- The chrome's edge was a rule inside the container that stopped short of the
  header's edge, with a shadow under it and the tabs' own track shorter still.
  The edge is now the root's own full-width border in every state, the pill's
  rule above tabs is drawn wider than the container and clipped by the root,
  the tabs' track is transparent so the edge is their line, and the shadow is
  gone. The tabs grid carried three gaps around empty side columns, which is
  why its track was inset; the parts that fill those columns carry the gap now.
- Collapsed by the control the area kept a 27-pixel band under the title, the
  half pill its columns reserved; the reservation goes with the content.
- The heading clamped at three lines and nothing bounded the subheading or the
  description; two and three lines now, the whole string kept.
- The way back stood beside the breadcrumbs and said what their first crumb
  said; it yields to them and returns below 640 pixels.

**The one change that would most improve it:** the snapped title's marks and
subheading share one line, and with five marks the line wraps to two. Not made:
five marks on a bar is the content scene's extreme case, and clipping a mark
would remove content from the DOM's picture.

## 5. Tokens

Every colour, space, radius, duration and type step comes from the foundation:
`--slotted-surface`, `--slotted-surface-sunken`, `--slotted-border-subtle`,
the control scales for the pill, `--slotted-heading-*` and
`--slotted-line-height-*` for the two title sizes, `--slotted-z-index-sticky`
for the root. Three families publish twenty-one public tokens between them and
each is listed on the reference page.

Three runtime properties are the family's own and are registered in
`packages/styles/src/runtime-properties.mjs`: `--slotted-page-header-collapse`
on the root, `--slotted-page-sticky-top` on whatever scrolls, and
`--slotted-page-sticky-bottom` on the page. The first is the one number a
stylesheet needs and only script can measure; the second is the briefing's new
decision, read by `section` and bridged into `table`'s own property.

**The one change that would most improve it:** the ground `section` paints
under its sticky header is `--slotted-page-ground`, a property the page writes,
and a section outside a page falls back to the surface. A section on a sunken
canvas outside a page would paint white over grey. Not made: a section that is
sticky and not in a page is the exception the fallback exists for, and the
consumer sets the property.

## 6. Patterns

The APG's Landmark Regions pattern gives the page its `main` and each section
with a heading its `region`, named by `aria-labelledby`; a section with no
heading is a plain `section`. The toggle is the Disclosure pattern: a `button`
with `aria-expanded` and `aria-controls` pointing at the area. The pin is a
toggle button with `aria-pressed`. The heading level comes from `typography`'s
outline, stepped once by the page body and once by every section body, and a
consumer's stated level wins.

Read in the source on 2026-09-10: Landmark Regions, Disclosure, Button.

**The one change that would most improve it:** the area's own `region` role
while expanded. Not made: the area is content of the page, not a landmark of
its own, and a region a scroll removes would be a landmark that comes and goes.

## 7. Accessibility

- Landmarks: one `main` per page, or none under `landmark="none"`; a region per
  section with a heading; the footer named `Ações da página` through
  `messages.footer`. Verified in the browser on the accessibility scene of each
  page.
- Heading list: `h1` for the order, `h2` for each section, `h3` for what a
  section body holds. Verified by the React and Angular unit tests and by the
  probe (`a11y: heading is an h1 inside a main`).
- The toggle and the pin are native buttons with names from `messages` and the
  states above; both were pressed with real key events through the browser
  probe (`Enter` reopens, `Space` collapses) in both frameworks.
- `aria-busy` on the body and the header while loading; the placeholders are
  `aria-hidden` skeleton text and the actions stay pressable.
- Truncation never removes content: the snapped heading keeps the whole string
  in `title` and in the DOM; `data-when` parts are hidden from the tree only in
  the state they do not apply to.
- Focus: the pill's two buttons sit on the chrome's edge with the control's own
  ring at the control's own offset (`page-header-default-focus-data-part-toggle-*`
  in `$SCRATCH/shots`). A header collapsed by the control removes the area from
  the tab sequence through `inert`.

**The one change that would most improve it:** announcing the snap. Not made,
on purpose: a scroll-driven change is not an event a reader asked for, and a
live region that fires on every scroll is noise.

## 8. Native API

React: `Page` renders `main` (or what `render` returns); every part renders a
plain element with the consumer's `className`, `style`, `ref` and native props
merged, `onClick` on the toggle and the pin runs before the family's and
`preventDefault()` refuses the move. `PageHeaderHeading` takes `render` for a
consumer's input, and the family keeps the rank through `role="heading"` and
`aria-level`. `usePage()` and `usePageHeader()` expose the resolved state.

Angular: directives on the consumer's own elements (`[slPage]`,
`[slPageHeader]`, `[slSection]` and their parts), `model()` for `expanded` and
`pinned`, `expandedRequest` and `pinnedRequest` carrying a `ChangeRequest` with
its reason, `exportAs` for the instance and its `expand`, `collapseArea`, `pin`,
`unpin`; `(click)`, `(focus)` and `(keydown)` are the element's own.

**The one change that would most improve it:** a `ref` handle on the React
header for `expand`, `collapse`, `pin`, `unpin`. Made: `PageHeaderHandle`.

## 9. Capability

The inventory in `docs/superpowers/specs/2026-09-10-page-capability-inventory.md`
surveyed SAP Fiori's Dynamic Page, Fluent, Material, Carbon, Atlassian and the
reviewer's own implementation. Table stakes shipped: the always-visible title
area, the header area that collapses on scroll and re-opens, the toggle, the pin,
a snapped title distinct from the expanded one, record navigation, tabs under
the header, the floating footer, loading, four widths, two grounds, a page that
is its own scroller and one that is not, `fill` for master–detail. The
differentiator nobody asked for: `revealed` — the area brought back in place
while scrolled, ending on the next scroll, which Fiori has and the reviewer's
implementation did not.

Anchor navigation is declined in writing to `anchor-nav` (wave 8). A `subtitle`
in the footer is declined to the consumer's own text.

**The one change that would most improve it:** a header taller than the
scrollport. Made: the engine scrolls to the top rather than revealing an area
taller than 60 % of the scrollport, which would hold nothing under the title.

## 10. Ecosystem integration

Both integration tables in `references/frameworks.md` are answered in
`docs/superpowers/specs/2026-09-10-page-design.md`. In the reference pages the
family stands with `toolbar` (overflow into a menu, `ToolbarOverflow` in
place), `breadcrumb`, `tabs`, `avatar`, `tag`, `description-list`, `table`
with `stickyHeader` and `stickyTo="page"` reading the bridged offset,
`collapsible`, `drawer` (a page inside a panel with `landmark="none"`),
`skeleton` for the placeholders, `container` for the width, `typography` for
the outline, `switch` for the footer's presence.

**The one change that would most improve it:** a second layer of sticky
things under a sticky section header — a table's column header, a nested
section, a consumer's aside — stopping under the section's header rather than
under the page's. Made, after the reviewer asked what two stacked stickies
would do: a sticky section measures its header and its body republishes
`--slotted-page-sticky-top` as page plus header, and re-bridges the table's
offset, so every layer reads one property name and layers add up. A consumer's
own sticky part inside the body reads the same property and needs no number.

## 11. Documentation

Two reference pages per family, six in all, each with the import, the anatomy,
one captioned demonstration per declared scenario with the snippet that made
it, the inputs, the outputs, the composition surface and the accessibility
decisions. Read rendered at 1280 and 620 pixels through the audit, and scene by
scene at 1280 in light and at 720 in dark through `$SCRATCH/sb/*`. Every
snippet is held to Prettier by the stories tests; every scenario is held to the
contract by `scenarioCoverageErrors`.

The behavioural probe that found the observer defect is
`$SCRATCH/behaviour.mjs`: 36 checks in React and 33 in Angular, all passing,
covering collapse by scroll, reveal, manual collapse, the pin in four states,
keyboard, record navigation, loading, the footer's presence, the section headers
under the chrome and the 360-pixel column.

**The one change that would most improve it:** a scene that reads the reasons
off the request as they happen. Made: the accessibility scene of the
page-header page logs each `ChangeRequest` with its reason as the reader
scrolls and presses. After the review, a scene for the sticky layers — a
section in a section, a table in that — on both section pages, and the
anatomy scene of the header page says that the way back is written and yields.
The stress probe that found the fold is `$SCRATCH/stress.mjs`: six sweeps of
the scroll, a toggle mid-scroll and a hover around the threshold, with every
attribute flip logged; a pass is one flip per crossing.

---

## Against §18

**Anatomy.** `page`: `root`, `scroll`, `body`, `footer`, `actions`.
`page-header`: `root`, `title-area`, `nav`, `back`, `breadcrumbs`, `title-row`,
`visual`, `title`, `heading`, `marks`, `subheading`, `actions`, `navigation`,
`header-area`, `figure`, `content`, `description`, `controls`, `toggle`, `pin`,
`tabs`. `section`: `root`, `header`, `title`, `eyebrow`, `heading`,
`description`, `actions`, `body`.

**Controlled and uncontrolled.** `expanded` and `pinned` on the header are
each a state model: `expanded` / `defaultExpanded` / `onExpandedChange` with the
reasons `pointer`, `keyboard`, `scroll`, `programmatic`; `pinned` /
`defaultPinned` / `onPinnedChange` with `pointer`, `keyboard`, `programmatic`.
`scroll` is new to the shared schema, because the area collapsing as the reader
scrolls is a change the consumer did not make and may refuse. The footer's
presence is controlled by its mount (React) or its `open` input (Angular).

**State matrix.** `expanded` × `scrolled` × `revealed` × `pinned`, with
`collapse` deciding which of them a scroll may touch: under `scroll`, a scroll
past the area sets `scrolled` and asks for `expanded=false`; the toggle while
scrolled sets `revealed` and the next scroll of more than two pixels ends it; the
pin holds the root at zero and counts the area into the chrome; `manual` never
lets a scroll touch `expanded`. Every combination was driven in the browser by
the probe.

**Density and direction.** Every measure comes from the control scales, so the
three densities move the pill, the gaps and the type without a rule of their
own; every offset is logical, and the `rtl` capture mirrors the way back, the
pill and the navigation rule.

**Loading.** `data-loading` on the root, `aria-busy` on the body and the
header, skeleton text of 12, 20 and 40 characters in the heading, the subheading
and the description, the actions pressable throughout.

**Empty.** A header with one heading and nothing else leaves no vacancy: the
nav row, the area, the pill and the tabs exist only when written. A section
with no header is a plain `section`, no region and no name.

**Error.** The family has no invalid state; a page that fails to load is the
consumer's `result-state` in the body.

**Extreme content.** A nine-word title clamps at three lines expanded and one
line snapped with the whole string in `title`; five marks wrap to a second row;
a subheading of ninety characters wraps; a 360-pixel column folds the toolbar,
drops the breadcrumbs and moves the arrows under the title; a header area taller
than 60 % of the scrollport goes to the top instead of revealing.

**Captures and tests.** Harness: `tools/harness/out/{page,page-header,section}.html`,
captures in `$SCRATCH/shots`. Reference pages: `$SCRATCH/sb/{page,pageheader,section}-{react,angular}/scene-*.png`,
`$SCRATCH/sb/*-{light,dark}-{1280,720}.png`, probe states in
`$SCRATCH/sb/behaviour-{react,angular}/`. Tests: `specs/components/{page,page-header,section}/contract.test.mjs`
(16, 21, 13), `packages/styles/src/{page,page-header,section}/*.styles.test.mjs`
(11, 17, 10), `packages/core/src/sticky-header/sticky-header.test.ts` (12),
`packages/react/src/{page,page-header,section}/*.test.{tsx,ts}` (50),
`packages/angular/{page,page-header,section}/src/*.spec.ts` (41),
`packages/storybook-workbench/src/workbench.styles.test.mjs` (35).
