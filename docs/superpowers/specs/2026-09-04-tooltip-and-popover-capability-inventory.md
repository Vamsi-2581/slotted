# Tooltip and Popover capability inventory

Produced before either family was designed or read, as
`.claude/skills/component/references/capability.md` requires. Both families are
new. `docs/build-order.md` lists them as items 1 and 2 of wave 5, after the
overlay infrastructure delivered on 3 September 2026; item 1 carries a scope
paragraph and item 2 carries none, so the paragraph written from this inventory
lands in the same commit.

They are inventoried together because `docs/build-schedule.md` puts them in one
session for one reason: they are the same positioning with two dismissal
policies, and deciding that twice produces two answers.

Sources were read on 4 September 2026.

---

## 1. Surveyed

| Implementation                | Calls it                                                                                                                             | Read at                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| WAI-ARIA APG                  | Tooltip Pattern (marked work in progress, no task force consensus); no Popover pattern — the closest official guidance is Dialog (Modal) | <https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/>, <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>                                         |
| WCAG 2.2                      | SC 1.4.13 Content on Hover or Focus — Dismissible, Hoverable, Persistent                                                                | <https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html>                                                                          |
| The platform                  | Popover API: `popover`, `popovertarget`, states `auto` / `manual` / `hint`, light dismiss, top layer, `toggle` event. Baseline 2025.    | <https://developer.mozilla.org/en-US/docs/Web/API/Popover_API>, <https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using>                  |
| Radix Primitives              | `Tooltip.Provider/Root/Trigger/Portal/Content/Arrow`; `Popover.Root/Trigger/Anchor/Portal/Content/Close/Arrow`                          | <https://www.radix-ui.com/primitives/docs/components/tooltip>, <https://www.radix-ui.com/primitives/docs/components/popover>                          |
| Base UI 1.7.0                 | `Tooltip.Provider/Root/Trigger/Portal/Positioner/Popup/Arrow`; `Popover.Root/Trigger/Portal/Backdrop/Positioner/Popup/Arrow/Title/Description/Close` | <https://base-ui.com/react/components/tooltip>, <https://base-ui.com/react/components/popover>                                       |
| Ark UI 5.39.1 (Zag)           | `Tooltip.Root/Trigger/Positioner/Content/Arrow/ArrowTip`; `Popover.Root/Trigger/Indicator/Anchor/Positioner/Content/Title/Description/CloseTrigger/Arrow` | <https://ark-ui.com/docs/components/tooltip>, <https://ark-ui.com/docs/components/popover>                                       |
| React Aria Components (Adobe) | `TooltipTrigger/Tooltip/OverlayArrow`; `DialogTrigger/Popover/Dialog/OverlayArrow`                                                      | <https://react-spectrum.adobe.com/react-aria/Tooltip.html>, <https://react-spectrum.adobe.com/react-aria/Popover.html>                                |

The seven disagree on purpose. The APG and WCAG say what the tooltip owes a
reader; the platform says what the browser now does without a library; Radix,
Base UI and Ark are headless behaviour libraries with three different opinions
about where the delay lives; React Aria is the one that names a warmup and a
cooldown and gives them the longest defaults in the field.

Three names hide the same capability. Radix's `Content` is Base UI's `Popup`
and Ark's `Content`; Base UI's and Ark's `Positioner` is the element Radix's
`Content` doubles as; Radix's `Close` is Ark's `CloseTrigger`. React Aria has
no anatomy at all for the tooltip: `Tooltip` is one element and the arrow is a
separate component the consumer nests.

---

## 2. Table stakes

Two or more of the surveyed implementations ship every row. The verdict column
is this library's, and a `decline` names what owns the capability instead.

### 2.1 Shared by both families

| Capability                                                     | Who ships it                             | Verdict                    | Reason                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controlled and uncontrolled `open`, plus a change request      | Radix, Base UI, Ark, React Aria          | adopt                      | `docs/state-and-events.md` requires it of every mutable value. `createControllable` holds it.                                                                                                              |
| A reason on the request                                        | Base UI (`eventDetails.reason`)          | adopt                      | Base UI is the only one of the four, and this repository requires it of every family. The vocabulary is the closed one, not Base UI's.                                                                      |
| A cancellable request                                          | Base UI (`eventDetails.cancel()`)        | adopt                      | Same source, same reason. `ChangeRequest.cancel()` already exists in `@slotted/core/state`.                                                                                                                |
| `side` — the preferred edge                                    | all four                                 | adopt                      | `positioner`'s option, six values including `inline-start` and `inline-end`.                                                                                                                               |
| `align` — start, center, end                                   | Radix, Base UI, Ark                      | adopt                      | React Aria folds it into `placement` as `top start`; the split axis is the one three of four ship and the one a stylesheet can select on.                                                                   |
| `sideOffset` and `alignOffset`                                 | Radix, Base UI, Ark (React Aria: `offset`, `crossOffset`) | adopt     | Four for four under two names.                                                                                                                                                                             |
| Flip on collision                                              | all four                                 | adopt                      | `positioner`'s `flip`, default `true`.                                                                                                                                                                     |
| Shift along the side                                           | Radix (`sticky`), Base UI, Ark           | adopt                      | `positioner`'s `shift`, default `true`.                                                                                                                                                                    |
| Collision boundary and padding                                 | Radix, Base UI, Ark, React Aria (`containerPadding`) | adopt          | A layer inside a scrolling panel collides with the panel, not with the viewport.                                                                                                                            |
| An arrow, drawn by the family and placed by the engine         | Radix, Base UI, Ark, React Aria          | adopt                      | `positioner` writes `--slotted-positioner-arrow-x` and `-y`; the family owns the geometry.                                                                                                                 |
| `arrowPadding` — the arrow stays off the corner                | Radix, Base UI, Ark                      | adopt                      | Without it a `start`-aligned layer puts the arrow over its own rounded corner.                                                                                                                             |
| Portal, with an opt-out                                        | Radix, Base UI, Ark (`portalled`), React Aria | adopt                 | `portal`, which also mirrors `dir`, theme, scheme and density onto the layer.                                                                                                                               |
| A named portal container set once for the application          | Ark, React Aria (`UNSTABLE_portalContainer`) | adopt                  | `setPortalContainer` already exists; the two bindings wrap it.                                                                                                                                             |
| Stay mounted through the exit animation                        | Radix (`forceMount`), Base UI (`keepMounted`), Ark (`unmountOnExit`, `lazyMount`) | adapt | One `mount` axis with three values rather than three booleans that admit meaningless combinations, which is the shape `collapsible` already settled.                                                        |
| `data-side` and `data-align` on the layer                      | Radix, Base UI, Ark, React Aria (`data-placement`) | adopt          | `positioner` writes both.                                                                                                                                                                                  |
| Anchor size and remaining space as custom properties           | Radix, Base UI, React Aria (`--trigger-width`) | adopt                  | `--slotted-positioner-anchor-width`, `-available-height` and the rest, already written by `positioner`.                                                                                                     |
| A transform origin that grows from the anchor                  | Radix, Base UI                           | adopt                      | `--slotted-positioner-transform-origin`.                                                                                                                                                                   |
| `hideWhenDetached` — the anchor scrolled out of its clipper    | Radix, Base UI (`trackAnchor`), Ark      | adopt                      | `positioner`'s option; `data-detached` is what the stylesheet reads.                                                                                                                                        |
| A virtual anchor — a rectangle rather than an element          | Base UI (`anchor` accepts a VirtualElement), Ark | adopt              | `PositionerAnchor` already accepts anything with `getBoundingClientRect`. `context-menu` in wave 8 is the second consumer.                                                                                  |
| `strategy` — absolute or fixed                                 | Base UI, Ark (Floating UI's own option)  | adopt                      | A layer inside `overflow: hidden` needs `fixed`; one inside a `transform` needs `absolute`. Neither default is right for both.                                                                              |
| Disabled: the layer never opens                                | Base UI, Ark, React Aria (`isDisabled`)  | adopt                      | Distinct from a disabled trigger element, which is the consumer's.                                                                                                                                         |
| A `render` prop / `asChild` for the trigger                    | Radix, Base UI, Ark, React Aria          | adapt                      | React gets `render`; Angular gets a directive the consumer puts on their own element, which is what that ecosystem composes with.                                                                           |
| Application defaults set once                                  | Radix (`Tooltip.Provider`), Base UI (`Tooltip.Provider`), Ark (none) | adopt  | A provider in React, an injection token and `provideX()` in Angular, for both families rather than the tooltip alone.                                                                                       |
| The platform's own Popover API and top layer                   | the platform (Baseline 2025)             | decline — see §2.4          | Declined by `docs/superpowers/specs/2026-09-03-overlay-infrastructure-design.md`, which owns the stacking decision. Restated with its cost below rather than re-decided here.                                |

### 2.2 Tooltip

| Capability                                                | Who ships it                                                                    | Verdict            | Reason                                                                                                                                                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `role="tooltip"` on the layer                             | APG, Radix, Ark, React Aria                                                       | adopt              | The pattern's one required role.                                                                                                                                                                   |
| `aria-describedby` from the trigger to the layer          | APG, Radix, Ark, React Aria                                                       | adopt              | The pattern's one required relationship.                                                                                                                                                           |
| The tooltip as the trigger's *name* instead               | Ark (`aria-label` on the root), React Aria (Spectrum guidance for an icon button) | adapt              | An icon-only button whose only label is its tooltip needs `aria-labelledby`, not `aria-describedby`. One `describes` axis with two values rather than a second component.                            |
| An open delay on hover                                    | Radix `delayDuration` 700, Base UI `delay` 600, Ark `openDelay`, React Aria `delay` 1500 | adopt      | Four for four, four different numbers. The default is decided in the design document, not here.                                                                                                     |
| A close delay                                             | Base UI `closeDelay` 0, Ark `closeDelay` 150, React Aria `closeDelay` 500          | adopt              | Three for four.                                                                                                                                                                                    |
| A group timeout — the second tooltip opens instantly      | Radix `skipDelayDuration` 300, Base UI Provider `timeout` 400, React Aria (built in) | adopt           | Moving along a toolbar re-paying the warmup at every button is the defect all three fixed.                                                                                                          |
| Opens instantly on keyboard focus                         | Radix (Tab opens without delay), Base UI, Ark, React Aria                          | adopt              | A delay a reader cannot shorten by moving faster is a delay for nothing.                                                                                                                            |
| Hover only, focus only, or both                           | React Aria (`trigger: 'hover' \| 'focus'`)                                        | adopt              | One of four ships it, and it is what an element that already opens something else on hover needs. Kept because the axis costs one value and its absence costs a wrapper.                             |
| Hoverable content — the pointer may cross into the layer  | Radix (`disableHoverableContent`), Base UI, Ark (`interactive`)                    | adopt              | WCAG 2.2 SC 1.4.13 Hoverable requires it. It is a criterion before it is a feature, so the axis defaults to on.                                                                                     |
| Escape dismisses                                          | APG, Radix, Ark (`closeOnEscape`)                                                 | adopt              | The pattern's whole keyboard table is this one key. SC 1.4.13 Dismissible is the same requirement stated by WCAG.                                                                                   |
| Closes when the trigger is pressed                        | Radix, Base UI (`closeOnClick`), Ark (`closeOnClick`), React Aria (`shouldCloseOnPress`) | adopt      | Four for four. A tooltip left open over the dialog its button just opened is the defect.                                                                                                            |
| Closes on pointer-down anywhere                           | Ark (`closeOnPointerDown`)                                                        | adapt              | One of four, and it is the same event as the row above seen from the layer rather than from the trigger. Folded into `closeOnPress`, which covers the trigger and the page.                          |
| Closes on scroll                                          | Ark (`closeOnScroll`)                                                             | decline            | One of four. `positioner` already tracks scroll and repositions, and `hideWhenDetached` answers the anchor leaving. Closing as well would take a tooltip away from a reader scrolling to read it.    |
| Focus leaving the trigger dismisses                       | APG note 2, Radix, Base UI, Ark, React Aria                                       | adopt              | "If the tooltip is invoked when the trigger element receives focus, then it is dismissed when it no longer has focus."                                                                              |
| The layer never receives focus                            | APG, all four                                                                     | adopt              | "Tooltip widgets do not receive focus." The layer is `pointer-events` transparent to the tab sequence and carries no focusable content.                                                             |
| Interactive content inside the tooltip                    | none — APG forbids it                                                             | decline            | "A hover that contains focusable elements can be made using a non-modal dialog." That is `popover`, the other half of this session, and `preview-card` in wave 8 for the hover-opened case.          |

### 2.3 Popover

| Capability                                                       | Who ships it                                                     | Verdict                | Reason                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="dialog"` on the layer                                      | Radix, Base UI, Ark, React Aria                                    | adopt                  | There is no popover role. A non-modal dialog is what the APG names for a hover or click surface holding focusable elements.                                                                        |
| `aria-haspopup="dialog"` and `aria-expanded` on the trigger       | Ark, Base UI                                                       | adopt                  | `aria-expanded` is what tells a reader the button is a disclosure; `aria-haspopup` is what says what it discloses.                                                                                 |
| A `Title` part, referenced by `aria-labelledby`                   | Base UI, Ark                                                       | adopt                  | A dialog without an accessible name is a dialog a reader cannot identify.                                                                                                                         |
| A `Description` part, referenced by `aria-describedby`            | Base UI, Ark                                                       | adopt                  | Same source.                                                                                                                                                                                     |
| A `Close` part                                                    | Radix, Base UI, Ark                                                | adopt                  | Three for four. The keyboard has Escape; the pointer needs a target, and a touch reader has no Escape key at all.                                                                                 |
| An `Anchor` part distinct from the trigger                        | Radix, Ark                                                         | adopt                  | The button that opens it and the box it points at are not always the same element — a row's action menu anchored to the row.                                                                       |
| Escape dismisses and focus returns to the trigger                 | Radix, Base UI, Ark (`closeOnEscape`), React Aria                  | adopt                  | `dismissable-layer` reports Escape from the topmost layer only; the family moves the focus.                                                                                                       |
| Outside press dismisses                                           | Radix, Base UI, Ark (`closeOnInteractOutside`), React Aria         | adopt                  | `dismissable-layer`, on `pointerdown`, with the stack that keeps a descendant layer from closing its ancestor.                                                                                    |
| A predicate deciding which outside presses count                  | React Aria (`shouldCloseOnInteractOutside`), Ark (`persistentElements`) | adopt              | `DismissableLayerOptions.outsidePress` already takes one. A popover beside a `toast` that must survive a press on the toast is the case.                                                          |
| Focus moves into the layer on open                                | Radix (`onOpenAutoFocus`), Base UI (`initialFocus`), Ark (`autoFocus`) | adopt              | Three for four, and Tab from a portalled trigger reaches nothing without it.                                                                                                                     |
| A named element to focus first                                    | Base UI (`initialFocus`), Ark (`initialFocusEl`)                    | adopt                  | The first focusable element is wrong for a popover whose first control is a destructive action.                                                                                                  |
| A named element to focus on close                                 | Base UI (`finalFocus`), Ark (`finalFocusEl`)                        | adopt                  | A popover that removes the row its trigger was in has nowhere to return to.                                                                                                                      |
| `modal` — inert background, scroll lock, focus contained          | Radix, Base UI, Ark, React Aria (`isNonModal` inverted)            | decline — defer to `dialog` | `docs/component-features.md` §8 defines this family as "conteúdo interativo **não modal** ancorado" and states "Não captura foco global quando não modal". Focus containment is `dialog`'s, three items later in this wave, per `docs/build-order.md`. |
| Opens on hover                                                    | Base UI (`openOnHover`, `delay`, `closeDelay`)                     | decline — defer to `preview-card` | One of four. `docs/component-features.md` §8 gives a hover-opened rich surface to Preview Card / Hover Card, Extended, wave 8. Two families opening on hover would be two answers to one question.  |
| A backdrop part                                                   | Base UI (`Popover.Backdrop`)                                       | decline                | It exists to darken the page behind a modal popover, and this family is not modal. It arrives with `dialog`.                                                                                      |
| The trigger reflects open state for styling                       | Ark (`Popover.Indicator`), Radix (`data-state` on Trigger)         | adopt                  | `data-open` on the trigger, which is the vocabulary `specs/contract.schema.mjs` already holds. The indicator glyph is the consumer's content; the state is the family's.                          |

### 2.4 The platform's Popover API, declined with its cost

`popover="auto"` gives light dismiss, Escape, the top layer and a `toggle`
event with no script at all, and it is Baseline 2025. It is declined for this
wave, and the decision is not this family's to take: the stacking model was
settled by `docs/superpowers/specs/2026-09-03-overlay-infrastructure-design.md`,
which adopted `--slotted-layer-depth` over the top layer because the top layer
"brings its own dismissal, stacking and focus rules, which would have to be
either adopted whole or fought", and by the wave-5 scope paragraph in
`docs/build-order.md`, which says "pilha única de z-index".

What it costs, written rather than avoided:

- A layer still needs script to be shown, so a page with JavaScript disabled
  opens nothing. The platform's `popovertarget` would have opened it.
- The library keeps a z-index stack, so an application that puts an overlay of
  its own in the top layer renders it above every Slotted layer regardless of
  order. An application in that position sets its own container with
  `setPortalContainer` and owns the stacking from there.
- `popover="hint"` expresses exactly the tooltip's dismissal policy — a hint
  closes when another hint opens and does not close an open `auto` popover —
  and the family reimplements it. The group timeout in §2.2 is that same rule
  written in script.

The vocabulary here is deliberately the specification's — side, align, offset,
boundary, arrow, dismiss — so the swap stays available.

---

## 3. Differentiators

| What                                                                     | Where it comes from                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A layer that keeps the theme it was opened from                          | `portal` mirrors `dir`, `data-slotted-theme`, `data-slotted-scheme` and `data-slotted-density` onto each layer's own element. Every surveyed library drops the layer at `document.body`; in a library with one theme that is invisible, and here a tooltip opened inside a dark region would render light. |
| Logical sides                                                            | `inline-start` and `inline-end` resolve against the layer's own computed direction at every update. Base UI ships the same two values; Radix, Ark and React Aria name physical sides only and leave a right-to-left consumer to mirror in script.           |
| A dismissal request that carries a reason and can be refused             | One `onOpenChange` with `pointer`, `keyboard`, `escape`, `outsidePress`, `blur`, `dismiss` or `programmatic`, cancellable before anything moves. Radix reports four separate events and leaves the consumer to unify them; Base UI carries a reason and is the only one of the four that does. |
| Three colour schemes and three densities on a floating surface           | The two families answer `scheme`, `density` and `forced-colors` through the foundation, so a tooltip is a different size in `dense` and the same tooltip. No surveyed library ships a density axis at all.                                                  |
| Two first-class bindings over one behaviour                              | Angular gets a directive on the consumer's own trigger element with `exportAs`, an injection token for defaults and `takeUntilDestroyed` teardown; React gets `render`, a context provider and `ComponentPropsWithRef`. Radix, Base UI and React Aria are React-only; Ark is multi-framework and its Angular binding wraps a state machine rather than using signals. |
| A tooltip that can be the trigger's name instead of its description      | The `describes` axis. Ark exposes `aria-label` on the root for the same problem and React Aria documents it in prose; neither makes it one decision on the family.                                                                                        |

---

## 4. Gaps

What no surveyed implementation handles well, and a product hits anyway.

| Gap                                                                                     | The answer this family ships                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A tooltip on a **disabled** control. A `disabled` button fires no pointer events, so the one explanation of why it is disabled is the one a reader cannot reach. | Every surveyed library leaves this to the consumer, who wraps the button in a `span`. The family ships the wrapper decision instead: the trigger directive accepts a disabled control and listens on the element that still reports the pointer, and the reference page shows it. |
| **Touch.** There is no hover on a coarse pointer, and a tooltip bound to hover is invisible on half the devices a product runs on. | Long press opens; a tap does not, because a tap is the button's own action. `docs/component-features.md` §2.7 states that no important behaviour may depend on hover, so a tooltip may never be the only place a fact is written — the reference page says so rather than the API pretending otherwise. |
| **Extreme content.** A single unbroken 60-character token, a translated string three times the English length, a right-to-left string inside a left-to-right page. | A measure the family owns, `overflow-wrap: anywhere`, and `unicode-bidi: isolate` on the text. The harness carries a scene for each.                                                                                                                              |
| **A popover taller than the space left.** Every surveyed library exposes the available height as a custom property and none of them uses it. | The body part is the scroll container, bounded by `--slotted-positioner-available-height`, so the title and the footer stay put while the middle scrolls. That is why the anatomy has a header, a body and a footer rather than one content box.                    |
| **Two layers at once**: a tooltip on a button inside a popover, or a popover whose trigger is inside another popover. | `dismissable-layer` records each layer's parent at creation, so a press inside the descendant does not dismiss the ancestor. The harness and the reference page both carry the nested scene, which is the one every library documents and none demonstrates.        |
| **Reduced motion.** A layer that scales in from its anchor is motion a reader may have asked not to see. | Durations come from the motion scale, which collapses to `1ms` under `prefers-reduced-motion`, and `presence` completes the exit in the same task rather than waiting for an animation that will not run.                                                          |
| **An interrupted interaction**: the pointer leaves during the open delay, or the trigger is removed while the layer is open. | The delay is a timer the family clears on leave; `hideWhenDetached` reports an anchor removed from the document as `data-detached`, and the family closes on it rather than leaving a layer pointing at nothing.                                                    |
| **Server rendering.** A layer measured during render is a hydration mismatch. | No module touches `document` at import time, ids come from `useId` and an application-scoped factory, and nothing measures until the layer is in the document.                                                                                                    |

---

## 5. What the two families do not share

The one decision this session exists to take once.

| Question                     | `tooltip`                                                              | `popover`                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Role                         | `tooltip`                                                              | `dialog`, non-modal                                                          |
| Opens on                     | hover after a delay, focus instantly, long press                       | press, and `Enter` or `Space` on a native button                             |
| Wired to the trigger by      | `aria-describedby`, or `aria-labelledby` under `describes="label"`     | `aria-expanded` and `aria-haspopup="dialog"`                                 |
| Takes focus                  | never                                                                  | on open, and returns it on close                                             |
| Core modules composed        | `positioner`, `presence`, `portal`, `dismissable-layer`                | the same four                                                                |
| Dismissed by                 | pointer leave, blur, Escape, trigger press, outside press              | Escape, outside press, the Close part, the trigger again                      |
| Holds focusable content      | never — the APG forbids it                                             | that is what it is for                                                       |
| Its place in the layer stack | the topmost layer while it is open, so Escape reaches it first and it draws above the popover it was opened inside | one layer, and a tooltip opened inside it is a layer above |
