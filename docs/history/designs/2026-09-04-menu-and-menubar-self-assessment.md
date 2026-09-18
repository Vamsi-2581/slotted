# Menu and Menubar self-assessment

Against `.claude/skills/component/references/rubric.md`, dimension by dimension,
and then against `docs/component-features.md` §18. The capability inventory is
`2026-09-04-menu-and-menubar-capability-inventory.md` and the decisions are
`2026-09-04-menu-and-menubar-design.md`; neither is restated here.

Evidence paths are relative to the repository root. The captures are in
`/tmp/claude-1000/-home-dreco-dev-slotted/c6c7a0d7-a78a-4df6-a87b-604057a71a61/scratchpad/shots/`,
named `<family>-<scene>-<scheme>-<density>-<direction>-<width>.png`.

## 1. Icons

Every mark is real geometry from the glyph scale: the check
(`--slotted-icon-check`), the radio dot (`--slotted-icon-dot`) and the submenu
chevron (`--slotted-icon-chevron-right`), each drawn as a mask with
`background-color: currentColor` — `packages/styles/src/menu/menu.css`. The
chevron mirrors with `:dir(rtl)` and `scale: -1 1`, which
`menu-anatomy-light-comfortable-rtl-420.png` shows pointing at the inline start.
The item's own icon cell holds either a glyph token or the consumer's element,
as `alert`'s does, so a consumer's SVG is centred rather than cut into the shape
of a mask.

**The one change that would most improve it:** the marks took the muted colour,
which made a disabled item's icon indistinguishable from an enabled one's —
`--slotted-text-muted` and `--slotted-disabled-foreground` are four points apart
in the light scheme. **Made:** the mark now inherits the item's own colour, so it
fades with the label and reddens with a `danger` tone.

## 2. Motion

The layer scales and fades from `--slotted-positioner-transform-origin`, on
`--slotted-duration-short` out and `-medium` in, with the enter and exit easings
— the grammar `tooltip` and `popover` already use, so three anchored layers do
not open three different ways. An item transitions `background-color` and
`color` on the control transition duration, which is what makes the highlight
follow the pointer rather than blink after it. Nothing loops, so there is no
infinite animation to stop under reduced motion, and every duration is a
motion-scale token, which is what collapses them under
`prefers-reduced-motion` — `packages/styles/src/motion.test.mjs` holds it.

**The one change that would most improve it:** a submenu opening could grow from
the parent item rather than from its own edge. **Not made:** the positioner
writes one transform origin per layer and it is already the anchor's edge; a
second origin would be the family second-guessing the engine. The submenu's
grace area, not its animation, is what makes it feel deliberate.

## 3. Responsiveness

The family answers the room it is given rather than the viewport: the surface is
capped by `min(measure, --slotted-positioner-available-width)` and bounded by
`--slotted-positioner-available-height`, both written by the engine, and it
scrolls inside that bound — `menu-scrolling-light-comfortable-ltr-420.png`. At
240 pixels the surface holds, the labels wrap and the shortcut column keeps its
width — `menu-anatomy-light-comfortable-ltr-240.png`. The bar wraps rather than
clipping: at 240 pixels a bar of four translated titles put its last trigger
outside the header, and `flex-wrap: wrap` is the answer until `toolbar` brings
overflow — `menubar-content-light-comfortable-ltr-240.png`.

**The one change that would most improve it:** the menu declares no container
query of its own. **Not made, deliberately:** a menu's width is decided by the
engine and its own measure, not by its parent's width, so a container query
would be a second answer to a question the positioner already answers.

## 4. Refinement

Read at full size in light, dark and high contrast at 420, at 240, at dense, in
right-to-left, and with focus photographed on an enabled item (light) and on a
disabled one (dark). Three defects were found by looking and fixed:

1. The highlight ran edge to edge, so its rounded corners were invisible. The
   surface now carries an inline inset and the highlight is a pill inside it.
2. Every mark sat two pixels above the text beside it. Measured rather than
   nudged: `block-size: 1lh` resolves against the *mark's own* line-height, and
   the item had left the line box at `normal`. The item now states the line box
   every cell inherits — `menu.css`, `[data-part='item']`.
3. A description sat solid against its label. A `row-gap` of one space step
   separates them, so the two lines read as a command and its explanation.

The focus ring is inset by its own width, so nothing moves when it appears;
`menu-states-focus-…-light-…-420.png` shows it at the pill's edge. Disabled
items stay legible rather than faded to grey-on-grey, and a disabled item that
takes focus answers with the theme's disabled ground instead of the highlight.

**The one change that would most improve it:** the mark alignment above.
**Made**, and the guard that keeps it from coming back is in dimension 11.

## 5. Tokens

`packages/styles/src/menu/menu.tokens.json` and `menubar.tokens.json` are
generated from what the stylesheets read and checked by
`packages/styles/src/tokens.test.mjs`. Every family token falls back to a
foundation token: the surface to `--slotted-surface-raised`, the highlight to
the neutral tone's two subtle steps, the item's geometry to control geometry —
height, inset, type, glyph and gap — so density moves the menu without a rule of
its own. The two literals are the arrow-free layer's own `0` and the private
`--_` variables the fallbacks test exempts. Nothing restates a scale.

**The one change that would most improve it:** the surface's measure is three
literal rem values rather than a scale. **Not made:** measure belongs to
`container`, and `tooltip` and `popover` record the same decision; three named
steps are the family's own tokens and a theme retunes them by name.

## 6. Patterns

Sourced, not recalled: the WAI-ARIA **Menu and Menubar Pattern** and **Menu
Button Pattern**, read on 2026-09-04, transcribed key by key into the design
document §4 and into `specs/components/menu/contract.json`'s `keyboard` array —
twelve keys, each with its effect, its focus destination and its source. Every
role, property and state the pattern lists is answered in the same table,
including the four notes. Two optional behaviours are taken (`ArrowUp` opening
onto the last item, `Space` changing a checkbox item without closing) and one
recommended variant is taken (the neighbouring menu opens with focus left on the
trigger). One departure is written with its cost: the submenu is portalled, so
it is not the DOM sibling of its parent item, and the relationship is carried by
`aria-controls` and `aria-haspopup` instead.

**The one change that would most improve it:** the pattern's note 3 — Escape
returning focus to an invoking context — is answered by `finalFocus` in the
contract and is not yet an input in either binding. **Not made:** no consumer
has an invoking context to return to until `context-menu` lands, and the
contract records where it will live.

## 7. Accessibility

Exercised in the live harness and in both test suites. The item is a native
`button` with `role="menuitem"`; a disabled item keeps `tabindex` and takes
`aria-disabled`, because the pattern wants disabled commands findable and the
native attribute would remove them from the ring —
`packages/react/src/menu/menu.test.tsx` and
`packages/angular/menu/src/menu.spec.ts` both hold it. The surface is named by
its trigger, groups are named by the label inside them, options report
`aria-checked`, and a shortcut is announced with `aria-keyshortcuts` while its
printed legend is `aria-hidden`, so the item's name stays the command. A layer
kept by `mount="lazy"` or `"eager"` carries `inert`, so a closed surface holds
nothing in the tab order or in the accessibility tree. Forced colours get one
rule, for the one thing the theme cannot reach: the highlight is this family's
selection indicator, and every tone surface becomes `Canvas` without it.

**The one change that would most improve it:** a screen-reader pass on a real
machine. **Not made — it cannot be made here**, and it is the one item raised at
the gate below.

## 8. Native API

React is React: function components, `useId`, context for the compound family,
`render` for element substitution, `ComponentPropsWithRef` on every part's own
props, a callback ref so a consumer's `Button` takes it, and handlers that
compose rather than replace. Angular is Angular: standalone components and
directives, `input()`, `model()`, `output()`, `computed`, host metadata,
`ViewEncapsulation.None`, `exportAs`, `inject()`, `HostAttributeToken` for the
attribute that decides an item's role, `DestroyRef` for every listener, and a
trigger that is a directive on the consumer's own control rather than a prop
that replaces it. The asymmetry is recorded rather than levelled: React nests
components for a submenu, Angular nests `<sl-menu>` elements and puts
`slMenuTriggerFor` on the item.

**The one change that would most improve it:** the Angular binding had `mount`
as an input that did nothing. **Made:** `active`, `lazy` and `eager` are now
honoured, with the layer built once and kept, and `inert` while it is closed.

## 9. Capability

Measured against the inventory rather than against the scope paragraph. Every
table-stakes row is `adopt`, `adapt`, or a `decline` naming the family that owns
it instead — modality to `dialog`, the arrow to `popover`, secondary click and
long press to `context-menu`, filtering to `combobox`, virtualization to the
collection engine in wave 6. Three mutable values each have a controlled and an
uncontrolled pair, a request carrying a reason and a row in the state matrix:
the surface's `open`, an option's `checked`, a group's `value`. The keyboard
table is the pattern's, key by key. The differentiators are shipped rather than
listed: the shortcut resolved for the platform and announced with
`aria-keyshortcuts`, three densities, three schemes, and two first-class
bindings.

**The one change that would most improve it:** the family declared a `loading`
state that no binding could set. **Made:** `loading` is an input on the surface
in both bindings, writing `aria-busy` and `data-loading`, and it is in the
contract's defaults and in both API tables.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered in the design document
§6 and §7, line by line, with the file that answers each. React: a defaults
provider that also sets the portal container, `render` on every substitutable
part, composed handlers, `useId` for identifiers, a `useMenu` handle carrying
`open()`, `close()` and `focus()`, and the `data-*` vocabulary the contract
declares. Angular: `provideMenuDefaults` and `provideMenubarDefaults`, `model()`
for two-way values with `*ChangeRequest` outputs carrying the reason, `exportAs`
on every part, `ng-content` projection, zoneless-safe signals, and teardown
through `DestroyRef`. The one line answered `no` is Reactive Forms: a menu is a
list of commands, not a control with a value a form submits, and `checkbox` is
the family a form uses.

**The one change that would most improve it:** the bar's state was declared as
the `value` capability, which obliged every page to document a `defaultValue`
input Angular does not have. **Made:** the capability is `selection`, which is
what a bar choosing one of its menus does, and the contract test says why.

## 11. Documentation

Four reference pages: React and Angular, menu and menubar. Each carries the
import, the anatomy row by row, one demonstration per declared scenario with a
caption saying what to look at and a Prettier-checked snippet, the API table
with every declared default, the events with their payload and their moment,
the composition surface, four accessibility decisions, the DOM anatomy and the
stylesheet an application would write. `specs/reference-pages.test.mjs` and the
four stories specs hold all of it.

Read rendered rather than in source: `components-menu--commands`,
`--states`, `--groups` and `components-menubar--bar` at 1280 and 720 pixels on
`http://localhost:6006`. Three defects were found by looking and by measuring,
and fixed: the demonstrations stood in mostly empty canvases (now `data-place`
holds the control at the top of a `layer`-sized box, and paired scenes take two
columns); a vertical bar in half a page left its menus no room and the label
column collapsed to zero, which `tools/harness/audit.mjs` reported (that scene
is one column now); and the Angular icons scene painted with an inline style,
which `specs/reference-pages.test.mjs` refuses (the mark is content).

**The one change that would most improve it:** the recurring mark-alignment
defect was invisible to every offline test and had been found by eye three
times. **Made:** `tools/harness/audit.mjs` now measures every mask-drawn mark
against the first line of the text beside it and fails past one pixel, with
`tools/harness/audit.test.mjs` holding the judgement.

## Against `docs/component-features.md` §18

1. **Purpose, use and anti-use.** A list of commands opened from a control, an
   item or a bar. Not navigation, not a `select`: items are commands. Written on
   both reference pages and in the contract's `declined` block.
2. **Anatomy and public parts.** Twelve parts for `menu`, two for `menubar`,
   each named in the contract, drawn in the stylesheet, rendered by both
   bindings and documented row by row.
3. **Controlled and uncontrolled contract.** `open`, `checked` and the radio
   group's `value` in `menu`; the open menu's name in `menubar`. Each has a
   request carrying one of the closed reasons, cancellable before it commits.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `open`,
   `disabled`, `checked`, `loading`, resolved by `STATE_PRECEDENCE`: disabled
   beats hover and press, and a disabled item answers focus quietly rather than
   not at all.
5. **Keyboard, focus, ARIA, touch and screen reader.** The pattern's twelve
   keys, roving focus with disabled items kept in the ring, focus returning to
   whatever opened the surface, `Tab` leaving the stack and landing past the
   control. Touch: a press opens, and a submenu's item opens on press as well as
   on hover. Screen reader: unverified here, and raised at the gate.
6. **Recipes by size, density, variant and tone through tokens.** Three sizes,
   three densities from control geometry, five tones on an item.
7. **Responsive, right-to-left, locale and reduced motion.** The surface answers
   the room the engine reports; both inline axes mirror; typeahead compares with
   `Intl.Collator` at base sensitivity; every duration collapses under reduced
   motion.
8. **Loading, empty, error, disabled and extreme content.** A `loading` surface
   with `aria-busy`, an `empty` part that keeps the measure, disabled at both
   the family and the item, and a content scene with a long translated label, a
   description and an unbroken URL.
9. **SSR, performance and virtualization.** `useId` for every identifier and no
   layout read during render, so a hydrating page does not diverge; the layer is
   built only when it is open under the default mount; virtualization is
   deferred to the collection engine with the reason written.
10. **Examples.** Fourteen scenarios for `menu` and eight for `menubar`, each
    demonstrated on both frameworks' pages.
11. **Behavioural tests shared between bindings.** 46 React tests and 34 Angular
    tests, written against the same outcomes rather than the same
    implementation.
12. **Changelog and migration.** Both families are new, so nothing breaks. The
    two additions to `packages/core` are additive and named in the contract's
    `adds` block.
