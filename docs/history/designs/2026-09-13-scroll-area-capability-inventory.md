# Scroll Area capability inventory

Step 3 of `.claude/skills/component/SKILL.md`, produced from the field before
reading any implementation in this repository and before the design.

Mode: **create**. `specs/components/scroll-area/` does not exist.

The invocation names a pair. `splitter` is in **rebuild** mode by
`docs/process/build-order.md`, and the rebuild it orders was delivered on 2026-09-11 at
schema 5: `specs/components/splitter/contract.json` declares `schemaVersion: 5`,
`specs/legacy-families.json` is empty, and the inventory, design and
self-assessment are in `docs/history/designs/2026-09-11-splitter-*.md` and
`2026-09-12-splitter-and-drawer-self-assessment.md`. Section 6 below states the
delta this family's arrival produces in it.

---

## 1. Surveyed

Seven sources, chosen to disagree with each other: two headless behaviour
libraries, one state-machine library and the design system built on it, one
opinionated design system, the platform's own answer in an Angular idiom, and
the accessibility rule that judges all of them.

| Source | What it calls the family | Read at |
| --- | --- | --- |
| Radix Primitives | ScrollArea — `Root`, `Viewport`, `Scrollbar`, `Thumb`, `Corner` | `https://www.radix-ui.com/primitives/docs/components/scroll-area` and `packages/react/scroll-area/src/scroll-area.tsx` on `main` |
| Base UI | ScrollArea — `Root`, `Viewport`, `Content`, `Scrollbar`, `Thumb`, `Corner` | `https://base-ui.com/react/components/scroll-area` and `packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx` on `master` |
| Zag.js | scroll-area machine — `root`, `viewport`, `content`, `scrollbar`, `thumb`, `corner` | `packages/machines/scroll-area/src/scroll-area.connect.ts` on `main` |
| Chakra UI v3 | ScrollArea — same six parts, plus `variant`, `size`, `colorPalette` | `https://chakra-ui.com/docs/components/scroll-area` |
| Mantine | ScrollArea, ScrollArea.Autosize | `https://mantine.dev/core/scroll-area/` and `https://mantine.dev/llms/core-scroll-area.md` |
| Angular CDK | `cdkScrollable`, `ScrollDispatcher`, `ViewportRuler`, `cdk-virtual-scroll-viewport` | `https://material.angular.dev/cdk/scrolling/overview` |
| The platform | `overflow`, `scrollbar-width`, `scrollbar-color`, `scrollbar-gutter`, `overscroll-behavior`, `scroll-behavior`, scroll-driven timelines | MDN, per property, cited at each row below |

**There is no APG pattern for this family.** The WAI-ARIA Authoring Practices
index holds no Scroll Area, and no ARIA role describes a scroll container. The
governing requirements are the platform's and WCAG's:

- WCAG 2.2 SC 2.1.1 Keyboard, Level A —
  `https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html`. Content that
  scrolls has to be scrollable by keyboard.
- The `scrollable-region-focusable` rule, which is how that criterion is
  tested — `https://accessibilityinsights.io/info-examples/web/scrollable-region-focusable/`,
  cited in Base UI's own source at
  `ScrollAreaViewport.tsx` line 365.
- SC 4.1.2 Name, Role, Value, which is what the tab stop then owes: an element
  in the tab sequence with no accessible name is announced as nothing.
- Chrome's keyboard-focusable scrollers, which supply the tab stop and not the
  name, only in Chrome, and only when the scroller has no focusable children
  — `https://developer.chrome.com/blog/keyboard-focusable-scrollers`,
  `https://chromestatus.com/feature/5231964663578624`. Shipped in 127,
  withdrawn for web compatibility, re-enabled from 130 onward by staged
  rollout. The family cannot rely on it.

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability | Who ships it | Verdict | Reason |
| --- | --- | --- | --- |
| A scrollbar drawn by the library — a `scrollbar` element with a `thumb` inside it, the native bar hidden underneath | Radix, Base UI, Zag, Chakra, Mantine | **adapt** | The capability is a scrollbar that answers the theme in three schemes. The mechanism is the native scrollbar, themed by `scrollbar-color` and `scrollbar-width`, which reached Baseline in December 2025 (`https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color`). Section 5 states what this costs |
| Hiding the native scrollbar with `scrollbar-width: none` and `::-webkit-scrollbar { display: none }` | Radix (injects it in a `<style>` tag), Base UI, Zag, Mantine | **decline** | It is the mechanism of the row above and not a capability. `docs/component-features.md` §4 requires the opposite of this family in one sentence: scroll, keyboard, touch, momentum, focus and printing stay native, and the scrollbar is *progressively enhanced*. Hiding it removes the trough click, the right-click scrollbar menu, the platform's own overlay fade and the bar a reader recognises |
| A visibility policy for the scrollbar: `auto`, `always`, `hover`, `scroll`, `never` | Radix `type`, Mantine `type`, Chakra `variant`, Zag | **adapt** | Four values, each expressible natively: `auto` is `overflow: auto`; `always` is `overflow: scroll`; `hover` paints `scrollbar-color` transparent at rest and themed under `:hover, :focus-within`; `none` is `scrollbar-width: none`. `scroll` — visible only while scrolling — is folded into `hover`, because it is what a platform overlay scrollbar already does on its own |
| `scrollHideDelay` | Radix (600 ms), Mantine | **decline** | It exists to tune a JavaScript timer that hides a drawn scrollbar. A native overlay scrollbar owns its own timing, and the CSS swap in the row above has no timer to tune. Nothing in the consumer's code moves: a product that sets the delay today deletes the line |
| Choosing which axes scroll | Mantine `scrollbars: 'x' \| 'y' \| 'xy' \| false`, Radix and Base UI by rendering one `Scrollbar` per orientation, Zag | **adapt** | One `axis` axis — `block`, `inline`, `both` — named logically, so a vertical writing mode needs no second vocabulary |
| Scrollbar thickness | Mantine `scrollbarSize`, Chakra `size` | **adapt** | `scrollbar-width` takes `auto` and `thin` and no length, so the family ships the two steps the platform has rather than a pixel. Cost in section 5 |
| Reserving the scrollbar's space so content does not shift when it appears | Mantine `offsetScrollbars: true \| 'x' \| 'y' \| 'present'` | **adopt** | `scrollbar-gutter`, Baseline since December 2024 (`https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter`), with `stable both-edges` for the symmetric case Mantine's `true` approximates with padding |
| `overscroll-behavior` on the viewport | Mantine `overscrollBehavior`, and the property itself | **adopt** | `contain` is the default: a bounded region inside a page that chains its last inch of scroll to the page is the defect the property was added for (`https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior`) |
| The overflow state in the DOM, for the consumer's own CSS | Base UI — seven attributes, `data-has-overflow-x/-y`, `data-overflow-x-start/-end`, `data-overflow-y-start/-end`, `data-scrolling`; Zag — six, `data-overflow-x/-y`, `data-at-top/-bottom/-left/-right` | **adapt** | Adopted with a logical vocabulary. Zag's four edges are physical and mirror wrongly in a right-to-left document; Base UI's `x`/`y` name axes that a vertical writing mode swaps. This library writes `data-at-block-start`, `data-at-block-end`, `data-at-inline-start`, `data-at-inline-end`, and `data-overflowing` with the axis as its value |
| A callback carrying the scroll position | Mantine `onScrollPositionChange({ x, y })` | **adopt** | One request per change, and no request for a position equal to the last one |
| A callback per edge reached | Mantine `onTopReached`, `onBottomReached`, `onLeftReached`, `onRightReached` | **adapt** | Four callbacks for one fact. One `onOverflowChange` carries the whole state — overflowing, and which edges are showing — which is the shape `@slotted/core/overflow` already returns and `table` and `prose` already consume |
| A reference to the scrolling element, for `scrollTo` | Mantine `viewportRef`, Radix and Base UI by `ref` on `Viewport`, CDK `CdkScrollable.scrollTo` | **adopt** | An imperative handle with `scrollTo`, `reveal(element)`, `refresh()` and the viewport element itself. `reveal` comes from `@slotted/core/overflow`, which scrolls the container along its own axis and never its ancestors, and which drops to `behavior: 'auto'` under `prefers-reduced-motion` — a programmatic smooth scroll is outside the query that collapses the duration scale |
| Scrolling only past a maximum size | Mantine `ScrollArea.Autosize`, with `onOverflowChange` | **adopt** | `maxBlockSize` and `maxInlineSize`, written as the CSS maximum on the viewport. `docs/component-features.md` §4 names it: *tamanho máximo* |
| A `content` element inside the viewport | Base UI, Zag, Chakra | **adopt** | The inset belongs to content that scrolls, not to the box that clips; padding on the scrollport is not applied at its end edge in every engine, and a fade drawn over the scrollport needs an element that is not the scrollport |
| A `corner` element where two scrollbars meet | Radix, Base UI, Zag, Chakra | **decline** | The browser draws the corner between two native scrollbars. The part exists in all four only because all four hid the bars and had to redraw the gap |
| A tab stop on the scrolling element | Base UI (`tabIndex: 0` when either axis overflows), Zag (same) | **adapt, and corrected** | Both write `role="presentation"` beside the tab stop, which puts an element in the tab sequence with no name and no role — SC 2.1.1 answered by breaking SC 4.1.2. This family uses the pattern `prose` already ships: `role="region"`, a name, and `tabindex="0"`, written **only while the content actually overflows** |
| Right-to-left support | Radix `dir` on the Root, Zag through its own direction context | **adapt** | No prop. Logical properties throughout, and `@slotted/core/overflow` already normalises the negative `scrollLeft` a right-to-left scroller reports |
| Virtualising a long list | CDK `cdk-virtual-scroll-viewport` | **defer to `data-grid`, wave 8** | `docs/process/build-order.md` gives virtualisation to the collection families; `docs/component-features.md` §2.10 states it as a capability of collections rather than a component beside them. A scroll area holds whatever it is given and does not own a data model |
| A service that reports every scroll in the application | CDK `ScrollDispatcher` | **decline** | It answers "which ancestor of this overlay scrolled", which is a positioning question, and `packages/core/src/positioner` already answers it for the only families that ask |

## 3. Differentiators

| Capability | Nobody in the field | This library |
| --- | --- | --- |
| A scrollbar that is still a scrollbar | Four of the four drawn-scrollbar implementations lose the trough click, the scrollbar context menu, the platform's overlay behaviour and the bar's appearance before hydration | The native bar, themed through the token foundation in `light`, `dark` and `high-contrast`, and left to the system under `forced-colors` |
| A logical edge vocabulary | Zag names `top`, `bottom`, `left`, `right`; Base UI names `x` and `y` | `block-start`, `block-end`, `inline-start`, `inline-end`. A right-to-left document and a vertical writing mode read the same four attributes, and the stylesheet writes each rule once |
| The overflow affordance painted, not only announced | Base UI and Zag expose the edge attributes and paint nothing; Radix and Mantine expose neither | The family paints the fade itself, from the same measurement, with a duration from the motion scale — and where the browser has scroll-driven timelines it moves the fade continuously with the scroll instead of switching it at the edge |
| A named scrolling region | Base UI and Zag ship an unnamed tab stop; Radix and Mantine ship no tab stop at all | `role="region"` with a name, present only while the region overflows, so a page of eight areas has no tab stop that does nothing |
| Three densities | None of the five has a density axis | The gutter, the fade depth and the scrollbar step follow density like every other family here |
| An Angular form that is not a wrapper | CDK ships `cdkScrollable` as a directive; every other source is React-only | A directive, `slScrollArea`, so an existing element in an Angular template becomes the scroll area without gaining a `div` around it — and a component for the composed form |

## 4. Gaps

What no surveyed implementation handles and a real product still hits.

| Gap | What happens in the field | This family |
| --- | --- | --- |
| Printing | All five keep `overflow: auto` and a fixed size on paper, so a printed page carries the visible slice and silently drops the rest. `docs/component-features.md` §4 names printing in the family's own sentence and no surveyed implementation answers it | `@media print` releases the maximum and the clipping, so the whole content prints |
| A single unbroken token | A vertical-only area given a long URL is clipped on the inline axis with no scrollbar and no way to reach the rest | The viewport keeps the scrollport on the axes it was given; the family states the one declaration a consumer adds for an unbreakable string, and the harness carries the scene |
| Content that stops overflowing | Mantine's `Autosize` reports it through `onOverflowChange`; the others leave the tab stop, the gutter and the affordance in place | The tab stop, the name and the fade are all conditional on the same measurement. The gutter is not, by choice: `stable` is what stops the content shifting when overflow starts |
| Nested scroll areas | `contain` is opt-in in Mantine and absent in the rest, so the inner area's last inch scrolls the outer one | `contain` is the default, stated once |
| A scroll position that must survive a remount | None of the five | Declined as state, and answered by composition: the family reports the position and the handle sets it, so two lines in the consumer persist it. The alternative — a `restoreKey` — makes the family own storage, which is what `docs/state-and-events.md` refuses for a value the platform holds |
| 400% zoom and reflow | Not addressed by any of the five | Captured at 240 pixels, and the maximum is stated in `rem` so it grows with the text |

## 5. The cost of the native scrollbar

Written here rather than left implied, as `docs/component-features.md` §18 and
`references/patterns.md` both require of a deliberate departure.

1. **No pixel thickness.** `scrollbar-width` has `auto`, `thin` and `none`.
   Mantine's `scrollbarSize={10}` and Chakra's four sizes have no equivalent.
   A product that needs a six-pixel bar cannot have one.
2. **No radius, no inset, no margin on the thumb.** `scrollbar-color` paints a
   thumb and a track and nothing else. The rounded, inset thumb the four
   drawn-scrollbar implementations ship is not reachable.
3. **Two colours, not nine states.** A drawn thumb can carry hover, active and
   dragging. `scrollbar-color` swaps on the container's own `:hover` and
   `:focus-within`, so the thumb's own hover is the platform's.
4. **The corner is the platform's.** Where both axes scroll, the square between
   the two bars is painted by the system and takes the track colour at best.
5. **What is bought.** The trough click and its page jump, the scrollbar
   context menu, the system's overlay fade and reserved-space behaviour, the
   correct bar before JavaScript has run or when it never runs, a printed page
   that is not a screenshot of a viewport, and no `ResizeObserver` and no
   scroll listener per thumb. `docs/component-features.md` §4 asks for exactly
   this trade in the family's own sentence.

If a product needs (1) through (4), the composition is written rather than
implied: the viewport is a part, the consumer sets `scrollbar-width: none` on
it and draws a bar of their own against the four edge attributes the family
already publishes.

## 6. Delta for `splitter`

`splitter` shipped on 2026-09-11 against
`docs/history/designs/2026-09-11-splitter-capability-inventory.md`. Put beside
the field again for this pass, nothing in that inventory changes, and this
family's arrival takes no row from it:

- The bar holds a position and no scrollport, so no capability moves between
  the two families.
- A pane that scrolls composes: `scroll-area` inside the element `splitter`
  sizes. The two never nest their state, because `splitter` writes only
  `--slotted-splitter-value` on that element and reads nothing back from it.
- `app-shell`, wave 8, is the consumer that holds both — regions from the
  shell, the bar between two of them, a scroll area inside each.

## 7. Consumers already in the tree

Three families wrote a scroll affordance of their own before this one existed,
each from `@slotted/core/overflow`:

- `prose` — `ProseScroll`, the conditional named region, in
  `packages/react/src/prose/prose-scroll.tsx`;
- `table` — `data-overflowing`, `data-at-start` and `data-at-end` on its
  `scroll` part;
- `tabs` — `data-overflowing` on its list, with paging controls.

None of them is this session's to edit, and none is rewritten here. Each takes
the family when it is next opened, and the note belongs in that family's scope
in `docs/process/build-order.md`.
