# Tooltip and Popover — self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. For each dimension: the one change that
would most improve it, and whether it was made.

Evidence paths are absolute where a reader has to open them.

---

## 1. Icons

The families own one glyph between them: the popover's close control, drawn as a
mask from `--slotted-icon-x` — real geometry from the foundation's glyph set,
never a character. The arrow is not an icon: it is a rotated square carrying the
surface's own background and border, which is what lets its two outward edges
continue the panel's outline rather than sit beside it. Under `forced-colors`
both keep working through the theme's own remapping, and neither family writes a
`forced-colors` rule, because neither paints anything the theme cannot reach —
`--slotted-surface-inverse` becomes `CanvasText` and `--slotted-text-inverse`
becomes `Canvas`, so an inverse tooltip inverts rather than disappears.

Direction-sensitive artwork: there is none. The arrow's geometry is the same
square at every side; what changes is which corner is rounded and which two
edges carry the border, and that is decided by `data-side`, which is physical.
The right-to-left captures show it staying put.

**The one change:** give the close control a `slIcon`/`Icon` composition point so
a product can swap the mark. **Not made** — `icon` owns consumer artwork and the
close control's mark is the family's own, the same boundary `result-state` drew
for its status marks. A consumer who needs another mark writes their own button
in the header, which is why `close` is an optional part.

## 2. Motion

Both layers scale and fade from `--slotted-positioner-transform-origin`, so the
eye is told which control the layer came from. Entering takes
`--slotted-duration-medium` with `--slotted-easing-enter`; leaving takes
`--slotted-duration-short` with `--slotted-easing-exit`, so a layer reads as
placed rather than thrown. Every duration is a motion token, which is what puts
all four inside the theme's one `prefers-reduced-motion` query;
`packages/styles/src/motion.test.mjs` refuses a literal.

The property is `scale` rather than `transform: scale()`, for two reasons that
are both in the stylesheet: the positioner was told to leave `transform` alone
so the family could animate, and a consumer animating `translate` of their own
is then not fighting it. The harness proves the second — its layers are centred
with `translate` while the family scales.

`presence` completes an exit in the same task under reduced motion instead of
waiting for an animation that will not run, and it has a timer past the declared
duration for the case where the engine never fires the event at all.

State pairs, and whether each transitions: closed→open and open→closed animate,
because a layer arriving instantly reads as a rendering fault. `data-side`
changing under a flip does **not** animate: the layer is somewhere else, not
moving, and interpolating would draw it sliding across the anchor. The close
control's hover and press transition on `--slotted-control-transition-duration`,
which is the control scale every other family uses.

**The one change:** animate the arrow's own position when a flip changes the
side. **Not made** — the flip is a jump, not a move, and animating it would draw
an arrow travelling across a panel that is no longer where it was.

## 3. Responsiveness

Neither family declares a container query, and neither needs one: a layer is
`max-content` wide, capped by its own measure token and capped again by
`min(measure, var(--slotted-positioner-available-width))` — the room the engine
says is actually left. The 240-pixel captures show the long sentence, the
unbroken token and the Arabic string all narrowing and wrapping inside the
stage; the first run of that capture showed a 288-pixel tooltip clipped by the
stage, which was a defect of the harness rather than of the family and is fixed
by writing the available width the positioner would have written.

The popover's body is bounded by
`--slotted-positioner-available-height` less the layer's own padding, and
scrolls; the header and the footer keep their height. That is the one place a
layer answers its own room rather than the viewport's.

Long, translated and stateful content: `packages/styles/src/tooltip/tooltip.harness.html`
scene `content` and `packages/styles/src/popover/popover.harness.html` scene
`content`, read at 240, 420 and 720.

**The one change:** a `sm` popover that would be narrower than its own header
row should drop the description to its own line rather than squeezing the title.
**Made** — the header is a two-column grid with the title and the description
both in column one and the close control spanning from row one, so the
description wraps under the title and never beside the close control.

## 4. Refinement

Every capture in `/tmp/tooltip-*.png` and `/tmp/popover-*.png` was read at full
size: light, dark and high-contrast at 420, light at 240, dense at 420, rtl at
420, and the detail scenes at 720. The close control was photographed in
`focus-visible`, `hover` and `active`, in light and dark.

Three things changed because the picture said so, and none of them because a
test did:

- The arrow was painted **behind** the surface, and a bordered tooltip then read
  as a box with a triangle stuck to it: the surface's own border ran straight
  across the arrow's base. It is painted over the surface now, with the border
  on its two outward-facing edges and the tip rounded to `--slotted-radius-xs`,
  so the outline is continuous and the point matches the corner it sits beside.
- The tooltip's elevation dropped from `--slotted-shadow-sm` to `-xs`. The
  `surface` variant read heavier than the `inverse` one beside it, because an
  inverse box hides its own shadow. The three overlay families are now a ladder:
  a hint at `xs`, a panel at `md`, and `lg` left for the modal dialog.
- The popover's body cut its last line in half against the footer's rule, which
  read as a rendering fault rather than as "there is more". It carries a scroll
  shadow made of two covers that scroll with the content and two shadows that
  stay with the box, inked with the panel's own text colour at twelve per cent
  — so each edge shades only while there is something past it.

The focus ring on the close control sits `--slotted-focus-ring-offset` from the
button and about six pixels from the panel's inner edge, which the 720 capture
confirms; hover is a `secondary` subtle fill that reads at a glance without
shouting; press goes one step further; nothing shifts by a pixel between them,
because the fill is a background rather than a border.

**The one change:** the small and medium tooltips differ by one pixel of type
and two of padding, which is a difference a reader can only see by comparing.
**Not made, and stated instead** — the control type scale is 12, 13 and 14
pixels and both steps read it; inventing a larger gap would be a scale of this
family's own, which is what the token foundation exists to prevent. What `sm`
buys is the tighter padding in a dense row, and the `sizes` capture at
`--density dense` is where it shows.

## 5. Tokens

Thirty-four `--slotted-*` in `tooltip.tokens.json`, fifty-seven in
`popover.tokens.json`, every one traced to a foundation token or to a documented
literal. The family tokens are `--slotted-tooltip-*` and `--slotted-popover-*`,
each falling back to a foundation value, so a theme retunes the family without
either stylesheet changing.

Two literals, both recorded: the measures (`18rem`, `14rem`, `16rem`, `20rem`,
`24rem`) and the arrow sizes. The measures are literals because
`docs/build-briefing.md` gives measure to `container` and to it alone, so no
scale here can hold one — the reason is in `contract.json` under `measure` and
in the stylesheet beside the declaration.

Density is answered through the control scales rather than through a rule: the
tooltip reads `--slotted-control-padding-inline-*`, `--slotted-control-gap-*`
and `--slotted-control-font-size-*`, so `comfortable`, `compact` and `dense`
each produce a tighter hint rather than a smaller one. The popover's own inset
is on the space scale, as `card`'s and `alert`'s are, and density moves what it
holds — the close control, the footer's buttons, the fields in the body.

**The one change:** the runtime properties the stylesheets read —
`--slotted-positioner-*` and `--slotted-layer-depth` — were being filed as
theme-owned tokens by `packages/styles/src/tokens.test.mjs`, which would have
put them on both reference pages as decisions a theme can retune. **Made, in its
own commit before either family**: `packages/styles/src/runtime-properties.mjs`
names them once with the reason, and a second test asserts none reaches a
`tokens.json`. The `toast` lane has already appended its own to that list.

## 6. Patterns

`https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/`, read 4 September 2026, with
its own notice transcribed into `contract.patternStatus`: the pattern is work in
progress and has no task force consensus. Its keyboard table is one key,
`Escape`, and the family binds it through `dismissable-layer`; the three notes
are answered as well — focus stays on the trigger, a tooltip opened by focus
dismisses on blur, and one opened by the pointer stays while the pointer is over
the trigger or the layer. The settled requirement for the same behaviour is WCAG
2.2 SC 1.4.13, and each of Dismissible, Hoverable and Persistent is answered by
a named mechanism in `contract.criterion`, not by a sentence saying it was
considered.

`https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/` for the popover, with
the difference stated rather than implied: there is no popover pattern, the
tooltip page names the non-modal dialog for a surface holding focusable
elements, and everything the dialog pattern says about modality is deliberately
not taken. `aria-modal` is never written, nothing becomes `inert`, the page
keeps scrolling and focus is not contained.

Deliberate departures, each with its cost written: the platform's Popover API
and top layer are declined (inventory §2.4 — a page with JavaScript disabled
opens nothing, and an application's own top-layer overlay outranks every Slotted
layer); `modal` is declined and named to `dialog`; opening on hover is declined
and named to `preview-card`; `closeOnScroll` is declined with the reason.

**The one change:** the tooltip's `describes="label"` writes
`aria-labelledby`, which the APG pattern does not mention. **Made and recorded**
— the pattern names only `aria-describedby`, and the most common tooltip in a
product is on an icon-only button that has no other name. The cost is that the
layer must be in the document before it is opened, so the axis forces
`mount="eager"` rather than silently producing a control announced as "button".

## 7. Accessibility

Name, role and state: `role="tooltip"` on one surface and `role="dialog"` on the
other; `aria-describedby` or `aria-labelledby` from the tooltip's trigger;
`aria-expanded`, `aria-haspopup="dialog"` and `aria-controls` on the popover's;
`aria-labelledby` and `aria-describedby` on the panel only when a title and a
description exist. A popover with no title gets no `aria-labelledby` at all —
the family invents no name, and both pages say to write `aria-label` instead.
Tests: `packages/react/src/popover/popover.test.tsx` and
`packages/angular/popover/src/popover.spec.ts`.

Keyboard and focus: the tooltip's layer is never in the tab sequence and holds
nothing focusable, which is the pattern's own requirement. The popover takes
focus on open — the panel itself, so a reader hears its name before its
contents — returns it to the trigger on close unless the reader moved it
themselves, and answers `initialFocus` and `finalFocus` for the two cases a real
panel needs. Both bindings have a test for each.

The two focus guards are the answer to the question every surveyed library
leaves open: `Tab` past the last control in a layer that lives at the end of the
document. It closes and returns to the trigger, so the reading order continues
down the page rather than jumping to the browser chrome.

Forced colours and reduced motion: both inherited from the theme, neither family
writing a rule. Touch: a long press opens the hint and a tap does not, and both
reference pages say the consequence out loud rather than hiding it — a fact
reachable only by long press is a fact half a product's readers will not find.

**What this machine cannot verify.** No screen reader was run, and no touch
device. What was checked instead: the accessibility relationships are asserted
by 70 behavioural tests across the two frameworks, the roles and properties are
sourced from the APG page rather than from recall, and the high-contrast and
`forced-colors` behaviour is read from the theme's own mapping table rather than
assumed.

**The one change:** announce the tooltip's text through `live-announcer` when it
opens, for a reader whose screen reader does not follow `aria-describedby` on
focus. **Not made** — every surveyed implementation relies on the description
relationship, `live-announcer`'s own module documentation says it is not a
narration API, and announcing would duplicate what the relationship already
says for the readers that do follow it.

## 8. Native API

React: function components, `useId`, context for the compound family, `render`
on every part, `ComponentPropsWithRef` per part, `ref` reaching the element and a
handle for `open()`, `close()` and `reposition()`. Every listener composes with
the consumer's — theirs first, and the family's skipped if they called
`preventDefault`; a test asserts it in both families.

Angular: standalone directives on the consumer's own elements, `input()`,
`model()` and `output()` signals, `computed` for every resolved axis, host
metadata rather than `@HostBinding`, `inject()` throughout,
`ViewEncapsulation.None` with the one authored stylesheet on the part that can
carry `styleUrl`, `exportAs` on every part, `DestroyRef` tearing down all four
core handles and every timer, and `HostAttributeToken` reading an `aria-label`
the consumer wrote on the close control before the provider's is used.

The two bindings are deliberately not identical. React portals with
`createPortal` and Angular builds the layer from an `ng-template`, because
`mount="active"` means the layer exists only while it is open and an Angular
component cannot remove its own host — the shape `ng-template[slCollapsibleContent]`
already uses here. React exposes `render`; Angular does not need it, because the
directive is already on the consumer's element.

**The one change:** Angular's `initialFocus` and `finalFocus` take an element or
a selector, where React also takes a ref. **Not made** — a ref is React's own
shape for reaching an element and Angular's is a template reference variable,
which reaches the component instance and is passed as the element. Levelling
either down would be the failure this dimension exists to catch.

## 9. Capability

Measured against
`docs/superpowers/specs/2026-09-04-tooltip-and-popover-capability-inventory.md`,
not against the scope paragraph. Twenty-four shared table-stakes rows, fifteen
for the tooltip and seventeen for the popover; every one `adopt` or `adapt`
except five `decline`s, and each of those names the family that owns the
capability instead — `dialog` for `modal` and the backdrop, `preview-card` for
opening on hover, `popover` for interactive tooltip content — or gives the
reason, as `closeOnScroll` does.

Both mutable values have a controlled and uncontrolled pair, a request carrying
one of a closed vocabulary of reasons, a `cancel()` that refuses it, and a row in
the state matrix. Both keyboard tables are sourced key by key with the focus
destination for each.

Six differentiators, and the two that matter most are not features either
binding invented: a layer that keeps the theme, scheme, density and direction of
the region it was opened from, which no surveyed library does; and logical sides
that resolve at every measurement, which only Base UI ships. Eight gaps, each
with the answer this pair ships — the disabled control, touch, extreme content, a
panel taller than the room, two layers at once, reduced motion, an interrupted
interaction, and server rendering.

**The one change:** the popover has no `openOnHover`, so a rich hover surface
has no home until wave 8. **Not made, and named** — `docs/component-features.md`
§8 gives that to Preview Card / Hover Card, and two families opening on hover
would be two answers to one question. A consumer who needs it today composes it:
`openOn` is the tooltip's axis, and a controlled popover with the consumer's own
hover handlers is four lines.

## 10. Ecosystem integration

Both tables in `.claude/skills/component/references/frameworks.md` are answered
line by line in the design document, and every line has a file behind it.

React: the controlled pair and the request; `TooltipDefaultsProvider` and
`PopoverDefaultsProvider` for defaults set once, the first also holding the group
window because a value held per tooltip could not say what "the next one" means;
`render` per part; composing handlers; `ref` and the handle; `useId` and nothing
measured during render; every state a consumer may style in the DOM;
`ComponentPropsWithRef` per part.

Angular: `model()` and `output()`; no `ControlValueAccessor`, because neither
family is a form control and neither holds a value a form would submit — a
control inside a popover reaches its own form untouched; `TOOLTIP_DEFAULTS` and
`POPOVER_DEFAULTS` with `provideTooltipDefaults()` and
`providePopoverDefaults()`, and `provideSlottedPortalContainer()` for the portal;
`exportAs` on every part; `ng-template` for content that must stay lazy;
`OnPush` and signals throughout with no `markForCheck`; `DestroyRef` for every
handle, listener and timer; `HostAttributeToken` for the consumer's own
`aria-label`; one class per entry point, importing nothing of the other.

The asymmetries are recorded rather than levelled: Angular's provider also
scopes the group window through DI, which React does structurally; React's
`render` has no Angular counterpart because the element is already the
consumer's.

**The one change:** an application cannot yet set the portal container from
React and Angular with one call. **Made** — both providers take a container and
both call `setPortalContainer` from `@slotted/core/portal`, which is per
document, so the two bindings share the answer rather than each holding one.

## 11. Documentation

Four reference pages, eleven demonstrations each, every one with the code that
produced it: import, anatomy, demonstrations, inputs, outputs, composition,
accessibility, public tokens and code. `referencePageErrors` passes for all
four, `apiMetadataErrors` finds every declared default documented, and every
curated snippet is Prettier-formatted and checked.

Every demonstration opens inside `.slotted-demo-viewport` with the portal
switched off, so a layer opened in one scene cannot draw over the scene above
it; the one scene per family that keeps the portal says so in its caption,
because that is the default an application gets.

**Read rendered, and five defects came out of it that no offline test could
see.** The reviewer restarted both Storybook servers; the four pages were then
read at 1280 and at 620, in light and in dark, with every code drawer opened.

- Every demonstration was **a mostly empty canvas**: a 34-pixel button at the
  top of a 352-pixel box. The workbench gained `data-size="layer"` and a
  `data-place` attribute — an anchored family wants its trigger centred, a
  family that pins something to an edge wants the opposite — and the scenes that
  are about what a layer *looks like* now open it, so the page shows the family
  rather than the button that opens it.
- **The `surface` variant was demonstrated on white.** A painted ground wrapped
  *around* the viewport is invisible, because the viewport paints
  `--slotted-surface` over it. The ground is painted on the box now, and the
  trigger on it is a solid button, because an outline one in the page's own text
  colour is unreadable on a dark surface.
- **The arrow was an unstyled div on every popover demonstration.** The
  stylesheet selects it as a direct child of the layer and the stories had
  written it inside the panel. Both bindings now have a test asserting the
  arrow's parent is the layer, and both anatomy tables say where it goes.
- **A 24rem panel ran 343 pixels out of a 273-pixel box.** `contain: paint`
  clips what escapes and is not what a positioning engine walks — it reads
  `overflow` — so the layer was told the whole viewport was available. The
  workbench viewport is a real clipping ancestor now, and the layer narrows the
  way it already does inside an application's own `overflow: hidden`.
- **The Angular pages showed no layers at all**, because `[open]="true"` had
  been added to the React stories alone.

`tools/harness/audit.mjs` now reports no finding on any of the eight
combinations — both families, both frameworks, 1280 and 620.

**The one change:** the popover's `placement` scene still asks the reader to
press six buttons to see six sides, where the tooltip's shows four at once.
**Not made** — six open panels around one row overlap, and the alternative is
six scenes for one axis. The caption says which button to press.

---

## Against `docs/component-features.md` §18

**Anatomy.** `tooltip`: `root`, `content`, `arrow`. `popover`: `root`,
`content`, `header`, `title`, `description`, `body`, `footer`, `close`, `arrow`,
`focus-guard`. The trigger and the anchor are the consumer's own elements and
are deliberately not parts — sixteen stylesheets here key on
`[data-part='root']`, so claiming another family's root would unstyle it.

**Controlled and uncontrolled.** One mutable value each. React: `open` /
`defaultOpen` / `onOpenChange(open, request)`. Angular: `[(open)]` /
`openChangeRequest`. The mode is decided once, by `createControllable`, so the
two bindings cannot disagree about which one they are in. Reasons: the tooltip
emits `pointer`, `keyboard`, `escape`, `blur` and `programmatic`; the popover
`pointer`, `keyboard`, `escape`, `outsidePress`, `dismiss` and `programmatic`.
A press that takes a tooltip away reports `pointer` whether it landed on the
trigger or the page, because from the reader's side it is one gesture.

**State matrix.** `default` and `open` for the tooltip; `default`, `hover`,
`active`, `focus-visible` and `open` for the popover, the middle three belonging
to the close control. Precedence: the close control's hover and active are
guarded with `:enabled`, so a disabled control answers neither.
`packages/styles/src/states.test.mjs` holds it.

**A deliberate departure from §2.5.** Neither family declares a `disabled`
visual state while both hold the `disabled` capability. A disabled layer never
opens, so under the default `mount` there is no element to carry
`data-disabled`; declaring the state would put a selector in the contract that
selects a box no reader ever sees. The capability is observable where it
happens, and both bindings have a test for it.

**Density and direction.** Three densities through the control scales; `dir`
answered by logical properties everywhere except the arrow, whose inputs are
physical and whose exemption is one selector wide in
`packages/styles/src/logical.test.mjs`. The right-to-left captures are where the
two mirroring defects were found and fixed.

**Loading, empty, error and extreme content.** Neither family holds a loading or
an error state: a tooltip is a sentence and a popover is a container for the
consumer's own content, which brings its own. Extreme content is answered and
photographed: a sentence past the measure, a 45-character unbroken token, a
right-to-left string on a left-to-right page and the reverse, a title long
enough to wrap beside the close control, and a body taller than the room.

**SSR.** Nothing touches `document` at import time, ids come from `useId` and
from an application-scoped factory, nothing is measured during render, and a
layer with `mount="active"` renders nothing on the server.

---

## What was verified, and what was not

```
node --test specs/components/tooltip/*.test.mjs specs/components/popover/*.test.mjs   38 passed
node --test packages/styles/src/*.test.mjs                                            18 passed
node --test specs/reference-pages.test.mjs specs/story-layout.test.mjs                 5 passed
pnpm --filter @slotted/react test  (src/tooltip src/popover)                          39 passed
ng test slotted-angular  (tooltip and popover specs)                                  31 passed
```

Read as images: `/tmp/tooltip-{light,dark,high-contrast}-*-420.png`,
`/tmp/tooltip-light-comfortable-ltr-240.png`,
`/tmp/tooltip-light-dense-ltr-420.png`, `/tmp/tooltip-light-comfortable-rtl-420.png`,
`/tmp/tooltip-{variant,sides}-light-comfortable-ltr-720.png`, and the same set
for `popover`, plus `/tmp/popover-anatomy-{focus,hover,active}-data-part-close-*.png`.

```
tools/harness/audit.mjs on both pages of both families, at 1280 and 620   no findings
```

Not verified: a screen reader, and a touch device.

Outside this pair, and not this lane's: `specs/legacy-ledger.test.mjs` fails on a
missing `specs/components/dialog/contract.json`, and `pnpm check:affected`
reports typecheck errors in `packages/react/src/toolbar`, `.../typography` and
`.../visually-hidden` stories. Both are another session mid-write in this
worktree.
