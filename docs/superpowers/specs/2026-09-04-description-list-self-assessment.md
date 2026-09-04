# Description List — self-assessment

Against `.claude/skills/component/references/rubric.md` and section 18 of
`docs/component-features.md`. Every dimension names the one change that would
most improve it, and says whether it was made.

Evidence read: the harness page at
`tools/harness/out/description-list.html`; captures in light, dark and
high-contrast at 420, light at 240 and 720, dense, right-to-left, `--focus` on
the toggle and on the copy control, `--hover` and `--active` on the copy
control, and `--zoom 200`. The React reference page was read rendered at 1280
and 720, light and dark, with every code drawer opened, plus two stories in
`viewMode=story` and one at `density:dense`. `tools/harness/audit.mjs` reports
no finding at 1280 or at 620.

## 1. Icons

Three marks, all geometry from glyph tokens: the clipboard, the check that
replaces it for two seconds, and the chevron the reveal toggle turns rather than
swaps. The clipboard did not exist — the bare-mark set held no such glyph — so
`--slotted-icon-copy` was added to the token contract and the default theme in
its own commit, because rule 3 of `docs/token-foundation.md` refuses a character
standing in for an icon. Every mask paints `currentcolor`, which becomes a
system colour under forced colours. No mark is direction-sensitive: the chevron
points down and up, and the right-to-left capture shows the same component
mirrored rather than rearranged.

**The one change:** make the placeholder a glyph token so a theme can replace
the mark. **Not made** — the placeholder is a rule 0.75em wide and one border
width thick, which is a proportion of the type it stands in for. Geometry is not
artwork, and a token would invite a theme to put a character back.

## 2. Motion

Four transitions, all from the motion scale through
`--slotted-control-transition-duration` and `-easing`: the copy control's colour
and its ground on hover and press, the same colour on the finished state, and
the chevron's rotation on reveal. Nothing loops, so nothing has to stop under
reduced motion; the theme collapses the durations in one query.

Every state pair, and whether it moves: rest ↔ hover transitions (colour and
ground); rest ↔ press transitions (ground); rest ↔ finished transitions the
colour and swaps the mask instantly, because a mask cannot interpolate and the
colour carries the change; clamped ↔ revealed does **not** transition.

**The one change:** animate the clamped-to-revealed height with
`interpolate-size: allow-keywords`. **Not made** — the thing that changes is a
paragraph of text, and growing it over 200ms moves the following rows under the
reader's eye while they are reading the line that caused it. The chevron
transitions instead, which is the part the eye is already on.

## 3. Responsiveness

The root declares `container-type: inline-size` and the container name
`slotted-description-list`; the grid is one element in, because an element is a
query container for its descendants and not for itself. Four thresholds, all
literals as rule 4 requires: three columns to two at 48rem, two to one at 34rem,
row to stack at 26rem, and row to stack at 34rem for a list whose terms carry
hints.

Read at 240, 420 and 720, and at 200% zoom. Nothing overflows at 240; the
narrow-column story shows the same panel at 360 pixels.

**The one change:** a span is stated in tracks, so a pair asking for two columns
of a list the reflow had collapsed to one spanned past the last track and grid
invented the tracks it was asked for — the list grew two implicit columns and
went on drawing two pairs to a row at every width, in a picture that was a
correct rendering of the wrong grid. **Made**: every query that changes the
count now changes the spans with it, and
`description-list.styles.test.mjs` refuses the pairing.

## 4. Refinement

Read every capture at full size in both schemes, including the four state
captures. Three defects the pictures found and no test could:

- A hint is a sentence and a term is two words, so a hint left to size its own
  column took the whole fourteen-rem maximum: the label column stood at 224
  pixels in a 420-pixel panel, for one sentence. The hint is now held out of the
  track's intrinsic width by size containment, the terms decide the column, a
  twelve-rem floor keeps it habitable, and a list with hints gives up the row
  arrangement eight rem earlier than one without. **Made.**
- The copy control's inline negative margin put its focus ring through the last
  word of the value it belonged beside. **Made**: only the block axis gives its
  padding back.
- The distance from a value to its control followed the density down to four
  pixels, which left the focus ring two pixels from the text. It now holds at
  eight in every density, while the term-to-value distance still follows.
  **Made.**

**The one change:** a grid track put the copy control at the far edge of the row
the moment the value wrapped, so a three-line checksum ended two lines above its
own button. **Made**: a description with nothing but a value and a control is a
block, so the control follows the last line in inline flow; the grid stays for
the ones with a toggle on a second row.

Holds at 200% zoom: the floor, the breakpoints and the term width are all in
`rem`, so the whole arrangement scales together rather than reflowing.

## 5. Tokens

Seventy-one custom properties, every one of them listed in
`description-list.tokens.json` and checked against the stylesheet. Every family
token falls back to a foundation token; none reaches a system colour except
through one. Density is answered by reading `--slotted-control-gap-md`,
`--slotted-control-padding-inline-md`, `--slotted-control-font-size-md` and
`--slotted-control-icon-size-md`, which the theme restates per density.

Three literals, each with its reason in the contract: two container breakpoints,
which CSS forbids a custom property inside, and the placeholder's width, which is
a proportion of the type. The clamp count is a runtime custom property written
by the binding — a value only the consumer knows — and not a design token, which
is the route `skeleton` takes for its geometry.

**The one change:** the distance between two column groups was a fixed two rem,
the one distance on the page that never answered the density axis. **Made**: it
is three times the distance a term stands from its own value, and follows it.

## 6. Patterns

The WAI-ARIA APG has **no** pattern for a description list. The claim is
recorded with the evidence rather than asserted: `w3.org/WAI/ARIA/apg/patterns/`
read 2026-09-04 lists twenty-nine patterns — accordion, alert, alertdialog,
breadcrumb, button, carousel, checkbox, combobox, dialog-modal, disclosure,
feed, grid, landmarks, link, listbox, menu-button, menubar, meter, radio,
slider, slider-multithumb, spinbutton, switch, table, tabs, toolbar, tooltip,
treegrid, treeview, windowsplitter — and none of them is this.

The platform is the specification instead. HTML Standard §4.4.9: a `dl` holds
either groups of `dt` followed by `dd`, or `div` elements each holding such a
group. HTML-AAM 1.0 (WD 2026-08-29): `dl` → `list`, `dt` → `term`, `dd` →
`definition`, with an editorial note that the `dl` mapping may change with
w3c/aria#1662. MDN records that authoring the ARIA `term` and `definition` roles
by hand changes how VoiceOver announces the construct, so the family writes no
role at all.

One pattern is borrowed, and transcribed rather than recalled — the APG
Disclosure pattern, read 2026-09-03: *keyboard, with focus on the control:*
`Enter` activates the control and toggles the visibility of the content;
`Space` does the same. *Roles, states and properties:* the element that shows
and hides the content has role `button`; it carries `aria-expanded="true"` while
the content is visible and `"false"` while it is hidden; `aria-controls` is
optional. Checked item by item: the toggle is a native `button` (pass —
`description-list-parts.tsx`, `description-list.ts`), carries `aria-expanded`
bound to the revealed state (pass — asserted in both suites), and writes no
`aria-controls` (deliberate departure: the content it reveals is the text
immediately before it in the same cell, and a reference to a `span` a reader is
already inside adds a relationship without adding information).

Two departures with their cost written: no `aria-controls`, above; and the row
action named by `aria-describedby` rather than by GOV.UK's repeated visually
hidden text — the cost is that a reader hears the term as a description after
the link's own name rather than as part of it, and that a hint inside the same
`dt` is read with it.

**The one change:** cite the APG Button pattern for the copy control as well.
**Not made** — it is a native `button` with a name and no state, and the pattern
would add nothing the element does not already carry.

## 7. Accessibility

Name, role, state, keyboard, focus, forced colours, reduced motion and reading
order, for every state the contract declares.

- No role is written anywhere in the family; the elements carry theirs.
- The row action is named by its own term. A consumer's own `aria-describedby`
  is composed with, never replaced — in React by reading the incoming prop, in
  Angular by reading `HostAttributeToken('aria-describedby')`. Both are asserted.
- A missing value is drawn and said: the mark is `aria-hidden`, and the reason is
  real text in a `visually-hidden` sibling.
- Both controls are native buttons; `Tab`, `Enter` and `Space` are the platform's
  and the family adds no key. Reading order is DOM order, which is why
  column-first flow is declined.
- The copy control's hit area is `--slotted-target-min` (24 pixels) in both axes,
  taken by padding and given back by a block-axis negative margin so the row
  keeps its rhythm.
- Focus rings read on every surface, including the framed variant's tinted term
  cell; captured focused in dark, where the ring is the accent border step.
- A finished copy is announced politely through `@slotted/core/live-announcer`
  rather than a region this family owns, so two copies in one update are both
  heard, and it changes its mark as well as its colour.

**The one change:** announce the reveal as well as the copy. **Not made** —
`aria-expanded` on the toggle already says it at the moment the reader presses
it, and a live message would say it twice.

**What this machine cannot verify:** no screen reader, no touch device and no
real screen were used. What was checked in their place: the accessible names and
relations are asserted in both test suites, the target size is measured against
the foundation token, and the announcement path is the shared announcer's, which
has its own tests.

## 8. Native API

React: function components, `useId` for the term identifier, context for what
the list decided, `render` on every part but the `dl`, `ComponentPropsWithRef`
for every part's props, `ref` reaching each element, and `exactOptionalPropertyTypes`
respected — the labels are resolved key by key rather than spread, because a
property written as `undefined` is a property and would overwrite the provider's
answer.

Angular: standalone components and directives, `input()` and `output()` signals,
`computed` for every derived value, host metadata rather than `@HostBinding`,
`ViewEncapsulation.None` with the one authored stylesheet, `exportAs` on all six,
`inject()` throughout, `HostAttributeToken` so a static `id` or
`aria-describedby` survives, `DestroyRef` for the one timer, and `OnPush` with no
`markForCheck` anywhere.

Native attributes and events reach the element that owns them in both: asserted
with `lang`, `title`, `id` and a consumer `onClick` in React, and with a static
`id` and `aria-describedby` in Angular.

**The one change:** expose an imperative `copy()` handle. **Not made** —
revealing is declarative through `revealed`, and copying is
`navigator.clipboard.writeText`, which a consumer already has. A handle would be
a second way to call one platform method.

## 9. Capability

Measured against `2026-09-03-description-list-capability-inventory.md`, not
against the scope paragraph.

Twelve table-stakes rows: ten adopted or adapted, two declined — `size` to the
density axis and the list title to `card`, each naming its owner. Four
single-source capabilities recorded with their reasons: Ant's colon, PatternFly's
auto-fit, PatternFly's help popover (deferred to `popover`, wave 5) and
PatternFly's inline grid. Three more declines carry owners in the contract:
column-first flow, loading (to `skeleton`) and row emphasis.

Seven differentiators shipped, including the two the inventory called the
family's own: terms sharing one subgrid track, and reflow on the component's own
inline size. Eight gap rows, six answered in the family and two declined with
the family that owns them.

One mutable value, `revealed`, with a controlled and uncontrolled pair, a request
carrying one of three reasons, and a row in the state matrix. One action,
`copyable`, deliberately without a state model, because the clipboard belongs to
the platform. The keyboard table is checked key by key against the sourced
pattern, including the focus destination — which is "stays on the control" for
all three, because nothing here removes the element a reader is on.

**The one change:** ship the help popover PatternFly puts on a term. **Deferred**
to `popover`, wave 5, in writing. The half that needs no layer — a sentence under
the name — ships now as the `hint` part.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`2026-09-03-description-list-design.md`. Every line has a file or a sentence.

The two bindings are deliberately not the same size. Angular takes an explicit
`empty` input; React additionally reads nullish children as a missing value,
because that is what a template produces for a field a server did not send, and
Angular cannot inspect projected content without reading the DOM after a render.
Levelling both down to the input would have removed the case that matters most
in React to make the two look alike.

**The one change:** implement `ControlValueAccessor` in Angular. **Not
applicable, and recorded as such** — nothing here holds a value a consumer
submits, so the interface would be implemented over nothing.

## 11. Documentation

Both pages carry the import, the eleven-row anatomy, thirteen captioned
demonstrations with the code that produced each, every input with its type and
default, both outputs with their payload and moment, the composition surface,
seven accessibility statements and the public tokens.

The React page was read rendered, not from the story file, at 1280 and 720, in
light and dark, with every code drawer opened. Two defects that only the picture
shows were corrected: the three-column scene draws two in a stage narrower than
the 48rem three columns need, and the caption said otherwise; and the
placeholder scene's two rows draw the same rule and differ only in what a screen
reader hears, which is the point rather than an omission.

`tools/harness/audit.mjs` reports no collapsed element and no overflow at 1280 or
620. The Props table is 918 pixels in a 710-pixel container and scrolls inside
it, which is the workbench's own pattern — `breadcrumb`'s is 851 in the same
container — and not something this family introduced.

**The one change:** read the Angular page rendered. **Not made, and it is the one
thing outstanding**: the Angular Storybook reads its entry-point directories once
at startup, so the running server on 6007 does not know
`@slotted/angular/description-list` exists and the page renders no stage. A
restart interrupts the other session working in this worktree, so it is raised at
the gate rather than taken.

## Section 18 — the definition of done

1. **Purpose, use and anti-use.** Pairs of a term and its description, read
   rather than edited: the details panel of a dense application. Not a table —
   a table's columns mean the same thing down every row and these terms differ.
   Not a form — nothing holds a value a consumer submits.
2. **Anatomy.** Eleven parts: `root`, `list`, `item`, `term`, `hint`,
   `description`, `value`, `placeholder`, `copy`, `toggle`, `action`. Public and
   stable, selected by `data-part`.
3. **Controlled and uncontrolled.** `revealed` / `defaultRevealed` /
   `onRevealedChange` (`revealedChange` in Angular). Presence of the controlled
   value decides the mode for the life of the component. The request carries the
   new value, the value it replaces, one of `pointer`, `keyboard` or
   `programmatic`, and the originating event, and cancelling it commits nothing.
   Copying emits after the fact and carries the text, the reason and whether the
   platform accepted it.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible` on both
   controls; `revealed` on the description; `complete` on the copy control for
   two seconds. Precedence: hover and press hold themselves back for `:enabled`
   and for `[data-complete]`, so a finished copy does not answer hover.
5. **Keyboard, focus, ARIA, touch, screen reader.** `Tab`, `Enter` and `Space`,
   all the platform's, documented in the contract with their focus destination
   and asserted in both suites. Touch: the copy control is 24 pixels in both
   axes and grows under `pointer: coarse` through the theme's own block. Screen
   reader: not verified on this machine; stated above.
6. **Recipes.** `layout`, `columns` and `variant` through `data-*` attributes and
   tokens; density through the four control scales; no family-owned size step.
7. **Responsive, RTL, locale, reduced motion.** Four container-query thresholds;
   every rule logical, verified in the right-to-left capture; no locale-dependent
   behaviour — the family formats nothing; reduced motion inherited from the
   theme, with no infinite animation to stop.
8. **Loading, empty, error, disabled, extreme content.** Loading is `skeleton` in
   the value slot, proven in the composition story. Empty is the `placeholder`
   part. There is no error state: a read-only pair cannot be invalid, and a
   value that failed to load is the consumer's own message in the slot. Disabled
   is the platform's on both controls. Extreme content — a 64-character hash, a
   German compound, a right-to-left pair — has a scene in the harness and a
   demonstration on both pages.
9. **SSR, performance, virtualization.** React generates identifiers with
   `useId` and reads no layout during render; Angular generates them from an
   application-scoped factory so a server and its client agree. Nothing measures,
   observes or subscribes; the only timer is the copied state's, cleared on
   destroy. Virtualization is not applicable: a details panel is tens of rows,
   and a collection that needs it is `listbox`'s question.
10. **Examples.** Thirteen demonstrations per page, including the family in a
    card beside `status-indicator`, `tag`, `skeleton` and `link`, content the
    family did not choose, and the keyboard.
11. **Behavioural tests shared between bindings.** Twenty-six in React, twenty in
    Angular, asserting the same outcomes: the elements and parts, no invented
    role, the axis resolution order, the term width custom property, the span
    clamp, the clamp keeping every character, the uncontrolled and controlled
    reveal, the reason and its cancellation, the placeholder and its words, the
    three copy outcomes, and the composed `aria-describedby`.
12. **Changelog and migration.** A new family: nothing to migrate. Three shared
    additions ship with it, each additive and in its own commit — the `copyable`
    capability and the `data-revealed` attribute in `specs/contract.schema.mjs`,
    and `--slotted-icon-copy` in the token contract and the default theme. One
    shared fix: the workbench's API table no longer demands `gap`, `align` and
    `justify` from every family that declares `arrangement`.
