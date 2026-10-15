# Overlay infrastructure — capability inventory

Five modules of `packages/core`, produced before any of them was designed or
written, as `.claude/skills/component/references/capability.md` requires:
`presence`, `dismissable-layer`, `portal`, `positioner`, `live-announcer`.
They are wave 5's first item in `docs/process/build-order.md` and they carry no
stylesheet, no harness page and no reference page — nothing here renders.

`focus` is the sixth module of that list and already exists. It is reviewed
against this inventory under **Against what shipped**, not rewritten.

The scope paragraph in `docs/process/build-order.md` is the floor:

> 1. `presence` — montagem durante animação de saída, `forceMount`.
> 2. `dismissable-layer` e `portal` — Escape, press externo, scroll lock,
>    `inert`, pilha única de z-index.
> 3. `positioner` — âncora, placement, colisão, atualização em scroll e resize,
>    sem expor a engine.
> 4. `live-announcer` — prioridade, deduplicação e limpeza.

## 1. Surveyed

Every version below was read from the npm registry on 2026-09-03; every URL was
the source for the API it is cited for.

| #   | Modules                          | Source, version                                                                                      | What it calls them                                                                    |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | presence                         | Radix Primitives — `@radix-ui/react-presence` 1.1.10, `radix-ui.com/primitives/docs/guides/animation`  | `Presence`, `usePresence`, `forceMount` on every overlay part                          |
| 2   | presence                         | Ark UI / Zag — `@zag-js/presence` 1.43.3, `ark-ui.com/docs/utilities/presence`                         | `usePresence`: `present`, `onExitComplete`, `immediate`, `skipAnimationOnMount`, `unmountOnExit` |
| 3   | presence                         | Base UI — `@base-ui-components/react` 1.0.0-rc.0, `base-ui.com/react/utils/use-transition-status`      | `useTransitionStatus`, `keepMounted`, `data-starting-style`, `data-ending-style`, `actionsRef.unmount` |
| 4   | presence                         | Motion — `motion.dev/docs/react-animate-presence`                                                      | `AnimatePresence`: `initial`, `mode`, `onExitComplete`                                  |
| 5   | presence                         | Angular 22.1.4 — `animate.enter` / `animate.leave` template bindings (verified in `node_modules/@angular/core`) | the framework's own exit hold, no library needed                             |
| 6   | dismissable-layer                | Radix — `@radix-ui/react-dismissable-layer` 1.1.19                                                     | `DismissableLayer`, `DismissableLayerBranch`: `disableOutsidePointerEvents`, `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`, `onInteractOutside`, `onDismiss` |
| 7   | dismissable-layer                | Floating UI React — `floating-ui.com/docs/usedismiss`                                                  | `useDismiss`: `escapeKey`, `referencePress`, `outsidePress`, `outsidePressEvent`, `ancestorScroll`, `bubbles`, `capture` |
| 8   | dismissable-layer                | Ark UI / Zag — `@zag-js/dismissable` 1.43.3                                                            | `trackDismissableElement`: `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`, `onInteractOutside`, `exclude`, `persistentElements` |
| 9   | dismissable-layer, portal        | Angular CDK 22.1.5 — `material.angular.dev/cdk/overlay/overview`                                       | `OverlayRef.keydownEvents()`, `.outsidePointerEvents()`, `.backdropClick()`, `ScrollStrategy` (`noop`/`close`/`block`/`reposition`), `OverlayContainer`, `FocusTrap` |
| 10  | dismissable-layer, portal        | The platform — `html.spec.whatwg.org` `popover`, `<dialog>`, `inert`                                   | `popover="auto"` light dismiss and top layer, `showModal()` close request, `inert` |
| 11  | portal                           | Radix — `@radix-ui/react-portal` 1.1.17; Base UI `Portal`; Ark UI `Portal`                              | `container`, `disabled`                                                                 |
| 12  | portal                           | React Aria — `@react-aria/overlays` 3.32.1                                                             | `UNSAFE_PortalProvider`, `getContainer`                                                 |
| 13  | positioner                       | Floating UI — `@floating-ui/dom` 1.8.0, MIT, `floating-ui.com/docs/computePosition`                    | `computePosition`, `autoUpdate`, middleware `offset`/`flip`/`shift`/`arrow`/`size`/`hide`/`inline`/`autoPlacement`, `platform`, virtual elements |
| 14  | positioner                       | Ark UI / Zag — `@zag-js/popper` 1.43.3 (wraps Floating UI)                                             | `getPlacement`: `placement`, `offset`, `gutter`, `flip`, `slide`, `overlap`, `sameWidth`, `overflowPadding`, `arrowPadding` |
| 15  | positioner                       | Radix — `Popper` (`side`, `align`, `sideOffset`, `alignOffset`, `avoidCollisions`, `collisionBoundary`, `collisionPadding`, `sticky`, `hideWhenDetached`, `--radix-popper-*` custom properties) |                                    |
| 16  | positioner                       | Angular CDK 22.1.5 — `FlexibleConnectedPositionStrategy`                                              | `withPositions`, `withPush`, `withFlexibleDimensions`, `withViewportMargin`, `withGrowAfterOpen`, `withLockedPosition` |
| 17  | positioner                       | CSS Anchor Positioning — `drafts.csswg.org/css-anchor-position-1/`                                     | `anchor-name`, `position-anchor`, `anchor()`, `position-area`, `position-try-fallbacks`, `position-visibility` |
| 18  | live-announcer                   | React Aria — `@react-aria/live-announcer` 3.5.1                                                        | `announce(message, assertiveness, timeout)`, `clearAnnouncer`, `destroyAnnouncer`; two alternating nodes per politeness |
| 19  | live-announcer                   | Angular CDK 22.1.5 — `LiveAnnouncer`                                                                   | `announce(message, politeness?, duration?)`, `clear()`, one shared element, `LIVE_ANNOUNCER_DEFAULT_OPTIONS` |
| 20  | live-announcer                   | Ark UI / Zag — `@zag-js/live-region` 1.43.3                                                            | `createLiveRegion`: `level`, `politeness`, `announce`, `destroy`                        |
| 21  | live-announcer                   | WAI-ARIA 1.2 — `w3.org/TR/wai-aria-1.2/#aria-live`, APG `w3.org/WAI/ARIA/apg/practices/names-and-descriptions/` | `aria-live`, `aria-atomic`, `aria-relevant`, `role="status"`, `role="alert"`, `role="log"` |
| 22  | all five                         | This repository — `packages/core/src/focus/`, `packages/core/src/state/state.ts`, `docs/state-and-events.md`, `docs/component-features.md` §3 | `createRovingTabindex`, `createRemovalFocus`, `createControllable`, `ChangeReason` |

### The pattern, transcribed

No WAI-ARIA APG pattern covers these five: the APG documents composite widgets,
and none of these renders anything. `references/patterns.md` step 1 asks for the
closest official guidance where no direct pattern exists, and it is platform
specification rather than APG for four of the five.

**Presence.** No specification. The requirement it serves is WCAG 2.2 SC 2.2.2
Pause, Stop, Hide and SC 2.3.3 Animation from Interactions, both of which are
answered by honouring `prefers-reduced-motion`, and the CSS Animations and CSS
Transitions specifications, which define the events an exit has to be waited on:
`animationend`, `animationcancel`, `transitionend`, `transitioncancel`. The
specifications guarantee `animationend` fires **only** while the document is
capable of running the animation; a `display: none` ancestor, a removed
stylesheet or a backgrounded tab can withhold it indefinitely.

**Dismissable layer.** The platform's own answer is the `popover` attribute:
`popover="auto"` gives light dismiss, Escape, the top layer and a stacking model
tied to the invoker, and `<dialog>.showModal()` gives the top layer, an inert
document behind it and the "close request" that Escape and a platform gesture
both trigger. `inert` is the platform's answer to blocking interaction and
removing a subtree from the accessibility tree in one attribute. The APG's
Dialog (Modal) pattern contributes the two keyboard rules that survive here:
Escape closes the dialog, and `Tab`/`Shift + Tab` stay inside it — the second
belonging to `focus`, not to this module.

**Portal.** No specification. ARIA 1.2 §5.2.7 `aria-owns` is the only mechanism
that repairs the reading order a portal breaks, and the APG advises against
relying on it. The rule that survives is: a portalled layer keeps its
relationship to its trigger through `aria-controls`, `aria-expanded` and
`aria-labelledby`, and through focus order rather than DOM order.

**Positioner.** CSS Anchor Positioning Level 1 is the specification, and it is
not yet answerable by every engine the library supports, so the module owns the
same vocabulary in script: an anchor, a side, an alignment, an offset, a
boundary, a fallback list and a visibility rule.

**Live announcer.** ARIA 1.2 §6.4 defines `aria-live` (`off`, `polite`,
`assertive`), `aria-atomic`, `aria-relevant` and `aria-busy`, and defines
`status`, `alert` and `log` as roles with implicit live values: `status` is
`polite` and `atomic`, `alert` is `assertive` and `atomic`, `log` is `polite`
and not atomic. The specification requires the live region to be **in the
accessibility tree before** the message is placed in it; a region created and
filled in the same task is not announced. That single rule is what makes an
announcer a module rather than a `div`.

## 2. Table stakes

Every capability two or more surveyed implementations ship. The verdict
vocabulary is `adopt`, `adapt`, `decline`, `defer to <module>`.

### 2.1 `presence`

| Capability                                                | Who ships it                    | Verdict | Reason                                                                                                                                                                     |
| --------------------------------------------------------- | ------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hold the node mounted until the exit animation ends        | Radix, Zag, Base UI, Motion     | adopt   | The whole purpose of the module.                                                                                                                                            |
| A status a stylesheet can select on, not only a boolean     | Zag (`unmounted`/`mounted`), Base UI (`starting`/`ending`) | adapt | Four statuses — `unmounted`, `entering`, `open`, `exiting` — written to the node as `data-presence`, because an enter animation needs a frame in the start state and a boolean has no name for it. |
| `forceMount`                                              | Radix, Base UI (`keepMounted`)  | adopt   | Named in the scope paragraph. Measurement, SSR and a consumer that owns its own animation all need the node in the tree with the state still tracked.                        |
| Skip the enter animation on the first mount                | Zag (`skipAnimationOnMount`), Motion (`initial={false}`) | adopt | An overlay that is open on first paint must not animate in; every surveyed library learned this from a page that flashed. |
| Unmount immediately, no animation waited for                | Zag (`immediate`), Base UI (`actionsRef.unmount`) | adopt | A route change or a parent unmount must not be held by a 200 ms transition.                                                                                                 |
| Report when the exit finished                              | Radix (internal), Zag (`onExitComplete`), Motion | adopt | The trigger cannot take focus back until the layer is gone.                                                                                                                 |
| Honour `prefers-reduced-motion`                            | Zag, Base UI                    | adapt   | The theme already owns reduced motion for CSS. The module answers the other half: under `reduce` there is nothing to wait for, so the exit completes in the same task.       |
| CSS animation **and** CSS transition                      | Radix (animation only), Zag, Base UI, Motion | adopt   | Radix waits on `animationName` alone, so a family that animates with `transition` unmounts instantly. Both are waited on here.                                              |
| Ignore an animation that bubbled from a descendant         | Radix, Zag                      | adopt   | An icon spinner inside a panel would otherwise end the panel's exit.                                                                                                        |

### 2.2 `dismissable-layer`

| Capability                                        | Who ships it                          | Verdict | Reason                                                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Escape dismisses the topmost layer only            | Radix, Zag, Floating UI, CDK, `<dialog>` | adopt   | Named in the scope paragraph. One key press closes one layer.                                                                                                                       |
| Outside press dismisses                            | Radix, Zag, Floating UI, CDK          | adopt   | Named in the scope paragraph.                                                                                                                                                       |
| `pointerdown` rather than `click` as the outside signal | Radix, Zag; Floating UI makes it an option | adapt | The default is `pointerdown`, because a `click` that starts inside and ends outside is a text selection, not a dismissal. Configurable, since a menu that acts on `click` needs the other. |
| Focus leaving the layer dismisses                  | Radix (`onFocusOutside`), Zag         | adopt   | Tabbing out of a non-modal popover closes it; nothing else notices that transition.                                                                                                 |
| A press inside a descendant layer does not dismiss the ancestor | Radix, Zag, Floating UI               | adopt   | Written as law in `docs/component-features.md` §3. A submenu is outside its parent's DOM and inside its meaning.                                                                     |
| Nodes that count as inside though they are elsewhere | Radix (`Branch`), Zag (`exclude`, `persistentElements`) | adopt   | The trigger is the first one: a press on it must not both dismiss and reopen.                                                                                                       |
| Block pointer events outside a modal layer         | Radix (`disableOutsidePointerEvents`), CDK (`hasBackdrop`), `<dialog>` | adapt   | Answered with `inert` on the siblings rather than `pointer-events: none` on the body, so the blocked content also leaves the accessibility tree.                                     |
| Scroll lock                                        | CDK (`BlockScrollStrategy`), Radix (via `react-remove-scroll`) | adopt   | Named in the scope paragraph.                                                                                                                                                       |
| Scroll lock without a layout shift                 | CDK, `react-remove-scroll`            | adopt   | Compensating the scrollbar width is what separates a lock from a visible jump.                                                                                                      |
| A single z-index stack                             | Radix (layer count), CDK (one container) | adopt   | Named in the scope paragraph.                                                                                                                                                       |
| Reposition or close on ancestor scroll             | CDK (`ScrollStrategy`), Floating UI (`ancestorScroll`) | defer to `positioner` | Repositioning is the positioner's; the choice to close instead is the family's, expressed by calling `dismiss`.                                                                     |
| Focus containment and restoration                  | CDK (`FocusTrap`), Radix, React Aria   | defer to `focus` | `focus` owns it and is reviewed in this wave. This module reports the transition; it does not move focus.                                                                            |

### 2.3 `portal`

| Capability                                       | Who ships it                            | Verdict | Reason                                                                                                                                                     |
| ------------------------------------------------ | --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A default container at the end of `document.body` | Radix, Base UI, Ark UI, CDK             | adopt   | The only ancestor guaranteed not to clip, transform or stack against a layer.                                                                                |
| A container the consumer chooses                  | Radix, Base UI, Ark UI, React Aria      | adopt   | A modal inside a fullscreen element or a shadow root has to portal into that root, not out of it.                                                            |
| An application-wide container set once            | React Aria (`UNSAFE_PortalProvider`), CDK (`OverlayContainer`) | adopt | Named in the capability reference as **configuration once**. An application shell with its own stacking context sets it in one place.                        |
| Disabling the portal                              | Ark UI (`disabled`), Base UI            | adopt   | A test, a print stylesheet and a server render all need the layer in place.                                                                                  |
| One shared root rather than one node per layer    | CDK, React Aria                         | adopt   | The stack is only single if the nodes share a parent.                                                                                                        |
| SSR safety                                        | Radix, Base UI, Ark UI                  | adopt   | Nothing touches `document` at import time; the root is created on first use.                                                                                 |
| Removing the root when the last layer leaves      | Radix (per-instance node), Base UI      | adapt   | The shared root is created once and released by reference count, so a test can assert an empty `body` and a long-lived application does not thrash the DOM.  |

### 2.4 `positioner`

| Capability                                            | Who ships it                                    | Verdict | Reason                                                                                                                                                    |
| ----------------------------------------------------- | ----------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Side and alignment                                    | Floating UI, Zag, Radix, CDK                    | adopt   | Named in the scope paragraph.                                                                                                                             |
| Offset along the side and along the alignment axis    | Floating UI (`offset`), Zag (`gutter`, `offset`), Radix (`sideOffset`, `alignOffset`) | adopt   | Two distances, because an arrow needs the first and a menu needs the second.                                                                               |
| Flip to the opposite side on collision                 | Floating UI (`flip`), Zag, Radix, CDK (`withPositions`) | adopt   | Named in the scope paragraph.                                                                                                                             |
| Slide along the side to stay in view                   | Floating UI (`shift`), Zag (`slide`), CDK (`withPush`) | adopt   | Flipping alone leaves a wide panel clipped at the inline edge.                                                                                             |
| A collision boundary and its padding                   | Floating UI, Radix, CDK (`withViewportMargin`)  | adopt   | A layer inside a scrolling panel collides with the panel, not with the viewport.                                                                           |
| Arrow position, and the side it points at              | Floating UI (`arrow`), Zag (`arrowPadding`), Radix | adopt   | An arrow the family draws needs a coordinate it cannot compute.                                                                                            |
| Anchor width available to the stylesheet               | Zag (`sameWidth`), Radix (`--radix-popper-anchor-width`) | adopt | Named in `docs/component-features.md` §3. A combobox listbox is the width of its input.                                                                     |
| Available width and height available to the stylesheet | Floating UI (`size`), Radix (`--radix-popper-available-height`) | adopt   | A menu near the bottom of the viewport scrolls rather than overflows.                                                                                       |
| Transform origin available to the stylesheet          | Radix (`--radix-popper-transform-origin`), Zag  | adopt   | Named in `docs/component-features.md` §3. A scale-in animation grows from the anchor, and the origin is only known after the side is resolved.               |
| Update on scroll, resize and content change           | Floating UI (`autoUpdate`), CDK (`reposition`)  | adopt   | Named in the scope paragraph.                                                                                                                             |
| Hide when the anchor is scrolled out of its clipper    | Floating UI (`hide`), Radix (`hideWhenDetached`) | adopt   | A tooltip left floating over a scrolled-away anchor points at nothing.                                                                                     |
| `absolute` and `fixed` strategies                     | Floating UI, CDK                                 | adopt   | A layer inside a transformed ancestor cannot use `fixed`; one inside `overflow: hidden` cannot use `absolute`.                                              |
| A virtual anchor                                      | Floating UI, Zag, CDK (`FlexibleConnectedPositionStrategy` accepts a point) | adopt   | A context menu is anchored to a pointer position, and a text selection to a range.                                                                          |
| The engine is not the contract                        | Zag, Radix (both wrap Floating UI)               | adopt   | Written as law in `docs/component-features.md` §3.                                                                                                         |

### 2.5 `live-announcer`

| Capability                                       | Who ships it                     | Verdict | Reason                                                                                                                                                     |
| ------------------------------------------------ | -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two politeness levels                            | React Aria, CDK, Zag, ARIA 1.2   | adopt   | Named in the scope paragraph as priority.                                                                                                                  |
| The region exists before the message enters it   | React Aria, CDK, Zag             | adopt   | ARIA 1.2 §6.4 requires it. A region created and filled in one task is silent.                                                                              |
| One shared announcer per document                | React Aria, CDK                  | adopt   | Two announcers make two regions, and a screen reader reads the same message twice.                                                                          |
| Clearing after a delay                           | React Aria (`timeout`), CDK (`duration`) | adopt   | A stale message read on the next unrelated focus change is the defect this prevents.                                                                        |
| Clearing on demand                               | React Aria (`clearAnnouncer`), CDK (`clear`) | adopt   | A cancelled operation retracts its own message.                                                                                                             |
| Repeating an identical message is still heard    | React Aria (two alternating nodes) | adopt   | A region whose text does not change is not re-announced; "3 results" after "3 results" is silence.                                                          |
| Visually hidden without leaving the layout       | React Aria, CDK, Zag             | adapt   | The rule is `visually-hidden`'s, and the module writes the same declarations inline rather than depending on a stylesheet that may not be loaded.            |
| Not a toast API                                  | ARIA 1.2, `docs/component-features.md` §3 | adopt   | Announcing is not showing. `toast` owns the visible one, later in this wave.                                                                                |
| `destroy` for tests                              | React Aria (`destroyAnnouncer`), Zag | adopt   | A shared node that outlives a test suite makes the next test's assertion pass for the wrong reason.                                                          |

## 3. Differentiators

What the best surveyed implementation offers that the others do not, and what
this library can offer because of what it already owns.

| #   | Module            | Capability                                                                                                                                                                                                                                                        | Why here                                                                                                                                                                                                                                        |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | presence          | The exit is bounded by the declared duration. The longest `animation` or `transition` duration plus delay is read from the node, and a timer at that length plus a margin completes the exit if no end event ever arrives.                                          | Radix, Zag and Base UI all wait on an event that the CSS specifications permit the engine never to fire. The failure is a layer that stays in the DOM forever, and it appears in a backgrounded tab or under a `display: none` ancestor.        |
| 2   | presence          | Both halves of `state-and-events.md` law: the request to change presence carries a `reason` from the closed vocabulary and can be cancelled before it commits.                                                                                                     | No surveyed presence implementation carries a reason. This repository requires one of every mutable capability, and presence is one.                                                                                                             |
| 3   | dismissable-layer | The dismissal is a cancellable request carrying `escape`, `outsidePress`, `blur` or `programmatic`, rather than four separate callbacks.                                                                                                                            | Radix reports four events and leaves the consumer to unify them; `docs/state-and-events.md` calls two events for one transition "the same failure stated twice".                                                                                 |
| 4   | dismissable-layer | `inert` on the siblings rather than `pointer-events: none` on the body.                                                                                                                                                                                            | Radix's approach blocks the pointer and leaves the blocked content in the accessibility tree, so a screen reader still reaches the page behind a modal. `inert` is one attribute and answers both.                                              |
| 5   | portal            | The portal root carries the theme of the subtree the layer came from: `dir`, `data-slotted-theme`, `data-slotted-scheme` and `data-slotted-density` are copied from the origin and kept in sync.                                                                     | Every surveyed portal drops a layer at `document.body` and loses the scheme of the region that opened it. This library has three schemes, three densities and two directions, so the defect is visible here in a way it is not in a single-theme library. |
| 6   | positioner        | Logical sides: `inline-start` and `inline-end` resolve against the document's direction, alongside the physical four.                                                                                                                                              | Every surveyed positioner names physical sides only, so a right-to-left consumer writes the mirroring itself. The repository's law is logical properties everywhere, and a positioner that only speaks `left` and `right` breaks it in script.  |
| 7   | positioner        | Every output the stylesheet needs is a custom property on the floating element under one prefix, resolved before the first paint: anchor size, available size, transform origin and arrow offsets.                                                                  | Radix ships this and Floating UI does not; Zag ships part of it. It is what lets a family animate and size itself in CSS instead of in script.                                                                                                   |
| 8   | live-announcer    | Two messages sent in the same frame are both heard: the announcer queues with a minimum gap instead of overwriting.                                                                                                                                                | React Aria and CDK both write straight into the node, so the second message replaces the first before a screen reader has read it. A component that announces a filter change and a result count in one update loses one of them.                |
| 9   | all five          | One implementation, two bindings, no framework in the module. Radix's is React-only; CDK's is Angular-only; Zag's is portable but ships a machine runtime.                                                                                                          | The repository's law: React and Angular share the conceptual contract and nothing else. A module written once cannot let the two disagree.                                                                                                       |

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| #   | Module            | Gap                                                                                                                                                                     | Answer                                                                                                                                                                                                                    |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | presence          | An exit interrupted by a re-open. The node is mid-fade-out when `present` goes true again, and the enter animation starts from the exit's current frame or not at all.    | The status returns to `open` and the exit's pending completion is cancelled, so `onExitComplete` never fires for an exit that did not finish. The node is never unmounted between the two.                                  |
| 2   | presence          | A node replaced while exiting. The consumer re-renders the layer with a different element; the listeners are on the old node.                                            | `setNode` is part of the contract, not an argument to the factory. Re-attaching moves the listeners and keeps the status.                                                                                                    |
| 3   | dismissable-layer | Escape held down, or an Escape that also cancels an IME composition. The first repeat closes two layers; a composition cancel closes a layer the person did not mean to.  | The key handler ignores repeats and ignores a key event whose `isComposing` is true.                                                                                                                                        |
| 4   | dismissable-layer | A press that starts inside the layer and ends outside — a text selection dragged past the edge, or a slider dragged off a popover.                                       | The outside test runs on the press that starts the interaction, so a drag that began inside is inside.                                                                                                                       |
| 5   | dismissable-layer | Scroll lock on a document that is already locked by something else, and a lock released in a different order than it was taken.                                          | Reference counted, with the original inline styles recorded at the first lock and restored at the last, so an out-of-order release cannot leave `overflow: hidden` behind.                                                    |
| 6   | portal            | The application shell mounts its own stacking context and every layer renders behind it, because `document.body` is not the top of the paint order the shell built.       | The application container is set once, and the default is `document.body` only in its absence.                                                                                                                               |
| 7   | positioner        | The anchor is removed from the DOM while the layer is open — a row deleted under an open menu.                                                                            | The anchor's disconnection is observed, `data-slotted-detached` is written, and the update loop stops rather than positioning against a stale rect.                                                                          |
| 8   | positioner        | The floating element's own content grows after it was positioned — an async list arriving in an open popover.                                                             | The update loop watches the floating element's size as well as the anchor's, which `autoUpdate`'s `elementResize` provides and CDK's reposition strategy does not.                                                            |
| 9   | live-announcer    | A message that is only a number, or a string that repeats a previous one after an unrelated announcement — "5", then "6", then "5".                                       | Deduplication is against the immediately previous message per politeness level, not against everything said, and it can be turned off per call.                                                                              |
| 10  | live-announcer    | A long translated string, or a hostile one. A message is text and must never become markup.                                                                              | The message is written with `textContent`. There is no interpolation and no HTML path into the region.                                                                                                                       |
| 11  | all five          | Two of these modules running in a document that another copy of the library also loaded — a micro-frontend, or a Storybook with two versions on the page.                 | The shared state — the layer stack, the portal root, the announcer — is per `Document`, keyed on the document object, rather than in a module-level variable that a second bundle would duplicate.                            |

## Against what shipped

`focus` shipped in an earlier wave and is reviewed, not rewritten. Read against
this inventory, it holds four capabilities — `createArrowNavigation`,
`createRovingTabindex`, `createRemovalFocus`, `toolbarOwnedKeys` — and the
overlay half of `docs/component-features.md` §3 is absent from it:

| Capability named in §3                     | In `focus` today | Verdict                                                                                                                                                 |
| ------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roving focus, orientation, RTL, disabled, loop | yes           | keep                                                                                                                                                    |
| Focus destination after an item is removed | yes              | keep                                                                                                                                                    |
| Focus containment in an overlay            | no               | defer to `focus`, in this wave's own review — `dialog` is the first consumer and it is the third family of wave 5, so containment lands before it. |
| Focus restoration to the trigger           | no               | defer to `focus`, same review.                                                                                                                          |

Neither absence is this invocation's to fill: containment and restoration are
`focus`'s, they have no consumer until `dialog`, and adding them here would put
two answers to one question in `packages/core`. The review is recorded in
`docs/process/build-order.md` against the `dialog alert-dialog` entry rather than left
to be rediscovered.
