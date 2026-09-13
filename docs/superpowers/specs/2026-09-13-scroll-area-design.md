# Scroll Area design

Step 5 of `.claude/skills/component/SKILL.md`. Decisions and their costs, taken
after `2026-09-13-scroll-area-capability-inventory.md` and before any code.

`splitter` needs no design document in this pass: the rebuild
`docs/build-order.md` orders for it was delivered on 2026-09-11, and section 6
of the inventory states that this family's arrival alters none of its
decisions.

---

## 1. Responsibility

**The family is the scrollport.** One element that clips and scrolls, the
measurement of whether it does, the four edges of that measurement in the DOM,
the affordance drawn from it, and the wiring a scrolling region owes a keyboard.

It is not a layout, not a list, not a virtualiser, and not a scrollbar painter.

## 2. Anatomy

| Part | Element | Always present | What it is |
| --- | --- | --- | --- |
| `root` | `div` | yes | The scrollport. Carries `data-ui="scroll-area"`, the overflow rules, the maximum size, the gutter, the mask, the measurement and the region wiring |
| `content` | `div` | no | The inset that scrolls with the content, for a consumer who wants one |

Two parts, and the second is optional. Base UI, Zag and Chakra each ship six;
four of the six — `scrollbar`, `thumb`, `corner`, and the `viewport`/`root`
split that exists to hold them — are the parts a drawn scrollbar needs, and this
family does not draw one.

**Why the root scrolls rather than a `viewport` inside it.** A separate viewport
buys one thing: a non-scrolling box to hang an affordance on. Section 5 below
draws the affordance with a mask on the scrollport itself, which needs no such
box. What the merge buys is the Angular directive form: `<div slScrollArea>` is
a complete scroll area on an element the consumer already had, which is how the
CDK ships `cdkScrollable` and is the one integration point Angular has here that
React does not.

**The cost.** A consumer who wants the fade over a ground the family does not
own — a sticky header inside the area, say — cannot put one element between the
clip and the fade, because they are the same element. The composition is stated
on the reference page: nest a second scroll area, or set
`--slotted-scroll-area-fade-size: 0` and draw the affordance from the four edge
attributes, which are published on the same element.

**Why `content` is optional.** Padding on a scrollport is not applied at the end
edge of the scrollable overflow in every engine, so an inset that must survive a
scroll to the end has to be on an element inside it. A consumer whose content
already carries its own inset renders no `content` at all, and the family works
as one element.

## 3. Axes

| Axis | Values | Default | Meaning |
| --- | --- | --- | --- |
| `axis` | `block`, `inline`, `both` | `block` | Which axes scroll. Logical, so a vertical writing mode needs no second vocabulary |
| `scrollbars` | `auto`, `always`, `hover`, `none` | `auto` | `auto` is `overflow: auto`; `always` is `overflow: scroll`; `hover` paints the bar transparent until the pointer or the keyboard is inside; `none` is `scrollbar-width: none` and leaves scrolling untouched |
| `gutter` | `auto`, `stable`, `both-edges` | `stable` | `scrollbar-gutter`. `stable` by default because content that shifts sideways the moment it grows past the box is the defect the property was added for |
| `fade` | `both`, `end`, `none` | `both` | Where the overflow affordance is drawn |
| `overscroll` | `contain`, `auto`, `none` | `contain` | `overscroll-behavior` on the scrollport |

`maxBlockSize` and `maxInlineSize` are values rather than axes: any CSS length,
written to the scrollport, which is Mantine's `ScrollArea.Autosize` as a
declaration instead of a second component.

## 4. State, and why there is none

The contract declares `overflow`, `appearance` and `wiring`, and **no
`stateModel`**, because the family holds no mutable value.

The scroll position is the argument, and `specs/contract.schema.mjs` already
made it for the `overflow` capability it declares:

> The set that does not fit is read from the layout, so a consumer who owned it
> could assert that a bar fits when the browser says it does not, and the DOM
> would then contradict the model. What the consumer gets instead is the fact —
> the count in the DOM and a callback when it changes.

A controlled `scrollTop` is that contradiction exactly: the browser moves it on
a wheel, a fling, a `Tab` into a child, an anchor navigation, a focus
restoration and a printed page, and a consumer holding the value would have to
accept every one of those or fight the platform. So:

- the position is **reported**, by `onScrollChange`, and is never requested;
- the overflow and its four edges are **reported**, by `onOverflowChange`, and
  appear in the DOM for CSS;
- moving the scroller is an **imperative action**, on the handle, which is what
  `docs/component-features.md` §2.2 reserves for `focus()`, `open()` and
  `scrollToKey()`.

No new word enters the shared vocabulary, and no shared schema changes.

## 5. The affordance is a mask, not a gradient

The fade is four `mask-image` layers on the scrollport, composed with
`mask-composite: intersect`, each one a `linear-gradient` whose opaque length is
`--slotted-scroll-area-fade-size` and whose transparent end is toggled to zero
length by the edge attribute for that side.

Three reasons, and the first is `table`'s own written refusal:

> A gradient at the trailing edge would fade the pinned column with everything
> else, which is the one thing that must stay crisp; a shadow needs an ink no
> scale holds.

1. **A mask needs no ink.** A gradient drawn over the content has to be the
   colour of the ground beneath it, so it is wrong on every surface but one, in
   every scheme but one. A mask fades the content to transparent, so the ground
   shows through whatever the ground is.
2. **Four edges, one element.** Two pseudo-elements cannot answer four sides. A
   mask has as many layers as it needs, and the scrollport is the element that
   already knows which edges have more behind them.
3. **It cannot scroll away.** A pseudo-element positioned inside a scrollport
   scrolls with it. The mask applies to the border box and stays.

Under `forced-colors: active` the mask is removed: the system owns the palette
there, a veil over system text is a legibility loss with nothing bought, and
`docs/build-briefing.md` says a family writes no `forced-colors` rule unless it
paints something the theme cannot reach — this is that case, and the rule is
one line that removes rather than adds.

Where the browser has scroll-driven timelines the same opacity is driven by the
scroll position instead of switched at the edge, inside
`@supports (animation-timeline: scroll())`, so the fade grows as the reader
leaves the edge rather than appearing whole. The property is not Baseline
(`https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline`), which is
why it is an enhancement over a floor that is already correct, and why the
floor is the thing the harness is judged on.

The transition between the two states comes from the motion scale, and a fade
that appears instantly is the state change the eye is meant to follow.

## 6. Keyboard and the region

There is no APG pattern. The requirement is SC 2.1.1, tested by the
`scrollable-region-focusable` rule, and it lands on the platform first:

| Key | Effect | Precondition | Source |
| --- | --- | --- | --- |
| `Tab` | Reaches the scrollport | Only while it overflows and has no focusable child that is already reachable | family |
| `ArrowUp` / `ArrowDown` | Scrolls one line along the block axis | The scrollport has focus | platform |
| `ArrowLeft` / `ArrowRight` | Scrolls one line along the inline axis | The scrollport has focus | platform |
| `PageUp` / `PageDown` | Scrolls one page along the block axis | The scrollport has focus | platform |
| `Home` / `End` | Scrolls to the start or the end | The scrollport has focus | platform |
| `Space` / `Shift`+`Space` | Scrolls one page | The scrollport has focus and no child took the key | platform |

The family writes not one of the six movements. It writes the tab stop, and the
tab stop owes a name:

```
role="region"  aria-label | aria-labelledby  tabindex="0"
```

all three present **only while the content overflows**, measured rather than
assumed, which is the pattern `packages/react/src/prose/prose-scroll.tsx`
already ships in this repository and Adrian Roselli's answer to the axe rule.

Base UI and Zag both write `role="presentation"` beside the tab stop. That
satisfies the rule that is tested and breaks SC 4.1.2, which is not: a reader
tabbing into it is told nothing about what they have entered. The name resolves
in one order — `labelledBy`, then `label`, then the label a
`ScrollAreaDefaultsProvider` sets — so a family-wide default answers it once for
a product that has fifty of them.

**The cost.** A page with eight scroll areas gains up to eight tab stops. That
is the cost of the criterion rather than of this decision, and it is bounded the
only two ways available: the wiring is absent while the content fits, and a
consumer who knows the content is reachable another way sets `tabbable={false}`
and carries the reason.

## 7. Printing

`@media print` releases `max-block-size`, `max-inline-size` and the clipping, so
a printed page carries the whole content. None of the five surveyed
implementations does this, and `docs/component-features.md` §4 names printing in
this family's own sentence.

## 8. The shared module

`@slotted/core/overflow` measures one axis:
`createScrollAffordance(container, { orientation })`. This family needs both at
once, and two handles on one element would mean two `ResizeObserver`s and two
scroll listeners measuring the same box.

It gains `createScrollEdges(container, { onChange })`, additive, built from the
`overflowState` function already there, in **its own commit before the family**,
as `docs/build-briefing.md` requires of every shared tool:

- one listener and one observer for both axes;
- the physical-to-logical mapping read from `writing-mode` and cached, and
  recomputed on resize rather than on scroll, because a writing mode does not
  change during a scroll and `getComputedStyle` on every scroll event is a
  layout read per frame;
- the right-to-left normalisation already in `overflowState`, which reads the
  magnitude of `scrollLeft` and so calls the inline start the inline start in
  both directions.

Nothing already exported changes. `tabs`, `table` and `prose` keep the
single-axis function they use.

## 9. React

| Question | Answered by |
| --- | --- |
| Controlled and uncontrolled pair, request with a reason | **No mutable value**, for the reason in section 4. `onScrollChange(position)` and `onOverflowChange(state)` report; nothing is requested and nothing can be cancelled |
| Defaults set once for the application | `ScrollAreaDefaultsProvider` and `useScrollAreaDefaults`, holding `axis`, `scrollbars`, `gutter`, `fade`, `overscroll` and `label` |
| Substituting the rendered element of each part | `render` on `ScrollArea` and on `ScrollArea.Content` |
| The consumer's handler still runs | `onScroll` is composed, never replaced; the family's listener is passive and registered on the element, and the prop is called with the same event |
| Reaching the native element and the imperative action | `ref` gives `ScrollAreaHandle`: `element`, `scrollTo`, `scrollToEdge`, `reveal`, `refresh`, `state` |
| Server rendering without a hydration mismatch | No layout read during render. The region wiring is written in the first effect after mount, which is the first moment a browser can say whether the content overflows; the server renders a plain scrollport and hydration finds the same DOM. `useId` for the generated label id |
| Every state a consumer may style is in the DOM | `data-overflowing` with the axis as its value, and `data-at-block-start`, `data-at-block-end`, `data-at-inline-start`, `data-at-inline-end` |
| Each part's props type is the native element's, extended | `ComponentPropsWithRef<'div'>` |

## 10. Angular

| Question | Answered by |
| --- | --- |
| Two-way value in the signal form | **None**, for the reason in section 4. `output()` carries `scrollChange` and `overflowChange` |
| Reactive Forms and template forms | **No.** A scrollport holds no value a form submits, so `ControlValueAccessor` would be an empty implementation of an interface a consumer would then expect to work |
| Defaults set once for the application | `SCROLL_AREA_DEFAULTS` and `provideScrollAreaDefaults()` |
| A template reaching the instance | `exportAs: 'slScrollArea'` |
| Substituting projected content, kept lazy | `ng-content` on the component form; the directive form projects nothing, because the element and its children are already the consumer's |
| Zoneless change detection and `OnPush` | Signals throughout. The measurement writes a signal from the observer callback; nothing calls `markForCheck` |
| Every subscription and listener torn down | `DestroyRef`, and the handle's own `destroy` |
| A static attribute the consumer wrote survives the host bindings | `HostAttributeToken` for `role`, `aria-label` and `tabindex`. A consumer who wrote `role="log"` on the element keeps it, which is the same promise `ProseScroll` keeps on the React side |
| A single class per entry point | `@slotted/angular/scroll-area` |

**The asymmetry, recorded rather than levelled.** Angular ships two forms — a
directive for an element the consumer already has, and a component for the
composed case. React ships one component with `render`, which covers the same
ground in the idiom React has. Neither ecosystem is made to imitate the other.

## 11. Tokens

Family tokens, each falling back to a foundation token, none of them stated as a
literal:

| Token | Falls back to | For |
| --- | --- | --- |
| `--slotted-scroll-area-thumb-color` | `--slotted-border-strong` | The scrollbar thumb, at the non-text ratio the foundation holds that step to |
| `--slotted-scroll-area-track-color` | `--slotted-surface-sunken` | The scrollbar track |
| `--slotted-scroll-area-fade-size` | `--slotted-space-8` | How far the affordance reaches in from an edge |

**Density.** The family answers density by holding still. Nothing it draws is a
control, and the one thing it does draw is a veil over the consumer's own
content: scaling it with density would change how much content is hidden rather
than how much space is used. The content inside the area carries its own
density, from the tokens its own families read, which is what the harness's
`--density dense` capture shows.

## 12. Declined, each with the family or the composition that owns it

| Capability | Owner |
| --- | --- |
| A drawn scrollbar with a thumb and a corner | The platform, through `scrollbar-color` and `scrollbar-width`. The composition for a product that needs pixel control is two declarations on the part, written on the reference page |
| `scrollHideDelay` | Nothing. It tunes a timer that does not exist here |
| Virtualising a long list | `data-grid`, wave 8 |
| A dispatcher reporting every scroll in the application | `packages/core/src/positioner`, which already answers the one question it is asked |
| Scroll snapping | The consumer. `scroll-snap-type` on the part and `scroll-snap-align` on the children is the whole of it, and a family that owned it would be a carousel |
| Persisting a scroll position across a remount | The consumer, in two lines: `onScrollChange` writes it, `handle.scrollTo` puts it back |
