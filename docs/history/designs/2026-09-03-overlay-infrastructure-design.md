# Overlay infrastructure — design

Five modules of `packages/core`, built in one invocation because they are one
mechanism cut into the pieces a family composes: `presence`,
`dismissable-layer`, `portal`, `positioner`, `live-announcer`. Wave 5's first
item in `docs/process/build-order.md`.

The inventory is
`docs/history/designs/2026-09-03-overlay-infrastructure-capability-inventory.md`.

None of the five renders. There is no stylesheet, no harness page and no
reference page for any of them, and the visual gate of
`.claude/skills/component/SKILL.md` has nothing to look at. What replaces it is
the same evidence in another form: a test per module, and the first consumer —
`tooltip` — arriving next in the same wave.

## Where the boundaries run

Six modules now answer a question about an overlay, and each owns exactly one:

| Module              | Owns                                                                                        | Knows about the others                                       |
| ------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `presence`          | **When** a node may leave the tree.                                                             | nothing                                                        |
| `portal`            | **Where** in the tree it lives, and what theme it inherits there.                               | nothing                                                        |
| `positioner`        | **Where on screen** it sits, and what the stylesheet needs to know about that.                  | nothing                                                        |
| `dismissable-layer` | **Whether it should still be open**, and what the page behind it may do while it is.            | nothing                                                        |
| `focus`             | **Where the keyboard is** — the ring inside a collection, and the destination after a removal.  | nothing                                                        |
| `live-announcer`    | **What was said** to a screen reader, and when it may be said again.                            | nothing                                                        |

None of the six imports another. A family composes them; that is the whole
design. A tooltip takes `positioner` and `presence` and neither of the other
two; a modal dialog takes all but `positioner`; a toast takes `presence`,
`portal` and `live-announcer`. Any module that imported another would decide
that composition on the family's behalf.

`focus` is reviewed against the inventory rather than rewritten, and the review
found the two capabilities `docs/component-features.md` §3 asks of it that it
does not hold — containment in an overlay, and restoration to the trigger.
Neither has a consumer until `dialog`, three families later in this wave, and
adding them here would put an untested answer in `packages/core` for a question
nobody is yet asking. The requirement is written into `dialog`'s scope in
`docs/process/build-order.md` instead, where the family that needs it will find it.

## Decision: Floating UI is the positioning engine

`@floating-ui/dom` 1.8.0, MIT, adopted as a runtime dependency of
`@slotted/core` and imported only by `src/positioner`.

`docs/product/prd.md` decides this twice before it is asked. §20.1: "Established
specialized dependencies such as **Floating UI** may be used when they provide
substantial value and reduce the risk of an in-house implementation." §24:
"Established dependencies that solve complex, well-defined problems—such as
overlay positioning—are preferable to fragile in-house implementations." §40's
"prefer a dependency" list is four for four here: the problem has significant
complexity, the edge cases are meaningful, an established implementation
exists, and replicating it would increase risk.

The edge cases are the argument. Measuring an anchor correctly means answering
a scaled or rotated ancestor, a nested scroll container that clips, an
`offsetParent` that is not the containing block, a `position: fixed` subtree, a
document in an iframe and a right-to-left writing mode. The library that has
answered them for six years is a better bet than the answer written here in an
afternoon.

**What it costs, written rather than avoided:**

- `@slotted/core` gains its first runtime dependency, and with it
  `@floating-ui/core` and `@floating-ui/utils`. Only the `positioner` entry
  point imports them, and the package builds one file per entry point, so a
  consumer that never positions anything never loads them. The build marks
  `@floating-ui/*` external — bundling it would ship a second copy to every
  application that already has one, and to every framework package that
  re-bundles this one. `dist/positioner` is 4.61 kB with the engine outside it
  and 28.53 kB with it inside.
- The engine becomes replaceable only as long as it stays invisible. No type,
  option name or return value from `@floating-ui/dom` appears in this module's
  public surface — `docs/component-features.md` §3 requires it, and a test holds
  it: `packages/core/src/positioner/positioner.test.ts` names the module's whole
  export list and asserts that nothing the engine exports is in it.
- `docs/product/prd.md` §48 open question 8, "Will Floating UI be officially
  adopted?", is answered yes for the DOM layer. Its React and Angular packages
  are **not** adopted: the bindings consume this module, not the engine.

The alternative considered and declined is CSS Anchor Positioning. It is the
right long-term answer and it is not yet answerable by every engine this
library supports; `position-try-fallbacks` has no polyfill worth shipping. The
module's vocabulary — side, align, offset, boundary, fallback list, visibility
— is deliberately the specification's, so the engine can be swapped for the
platform later without moving the contract.

## `presence`

```ts
type PresenceStatus = 'unmounted' | 'entering' | 'open' | 'exiting';
createPresence(options: PresenceOptions): PresenceHandle;
```

The status is the contract, and it has four values rather than two because an
enter animation needs a frame in which the node is in the tree and still
closed. `entering` is that frame. `exiting` is the mirror: the node is out of
the consumer's model and still in the document.

| Option                 | Default          | Why                                                                                                                |
| ---------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `present`              | —                | Controlled presence, per `docs/state-and-events.md`.                                                                |
| `initialPresent`       | `false`          | The uncontrolled start, read once.                                                                                  |
| `forceMount`           | `false`          | `mounted` is true in every status. Measurement, SSR and a consumer animating for itself.                             |
| `immediate`            | `false`          | Never wait. A route change must not be held by a 200 ms transition.                                                  |
| `skipInitialAnimation` | `true`           | A layer open on first paint does not animate in. Every surveyed library learned this from a page that flashed.        |
| `exitGrace`            | `50`             | Milliseconds allowed past the declared duration before the exit completes without its event.                          |
| `reducedMotion`        | reads the query  | Under `reduce` there is nothing to wait for and the exit completes in the same task.                                 |
| `onRequest`            | —                | The cancellable request, carrying a reason.                                                                          |
| `onStatusChange`       | —                | What the binding renders from.                                                                                       |
| `onExitComplete`       | —                | Fires only for an exit that finished. An exit interrupted by a re-open never fires it.                               |

`present` is a mutable capability, so it takes the whole of
`docs/state-and-events.md`: `createControllable` holds it, `request` carries a
`ChangeReason` from the closed vocabulary, and a consumer can cancel a
dismissal before anything moves. No surveyed presence implementation offers
that; this repository requires it of every mutable value, and presence is one.

**The module writes nothing to the DOM.** It reads the node's computed style
and listens to its animation events. Statuses become attributes in the family's
own contract — `data-open` and the rest of the schema's vocabulary — because
`docs/state-and-events.md` says the DOM state vocabulary is
`specs/contract.schema.mjs`'s, and a core module inventing `data-presence`
would be a second vocabulary nobody declared.

**How an exit ends.** In order, first match wins:

1. `immediate`, or reduced motion, or `forceMount` was never set and there is no
   node attached: complete in the same task.
2. One frame after the status becomes `exiting` — which is when the family's own
   attribute flip has landed and the exit animation has actually started — the
   computed `animation-duration`, `animation-delay`, `transition-duration` and
   `transition-delay` are read. All zero: complete.
3. `animationend`, `animationcancel`, `transitionend` or `transitioncancel`
   whose `target` is the node itself. An event that bubbled from a descendant is
   ignored, or a spinner inside a panel would end the panel's exit.
4. A timer at the longest declared duration plus delay plus `exitGrace`.

Step 4 is the differentiator, and it exists because the CSS specifications
permit an engine never to fire step 3's event: a `display: none` ancestor, a
removed stylesheet or a backgrounded tab all withhold it, and Radix, Zag and
Base UI all leave the node mounted forever when they do.

`setNode` is on the handle rather than an argument to the factory, because the
node a binding renders is not the node it re-renders. Re-attaching moves the
listeners and keeps the status; a consumer replacing the element mid-exit does
not restart the exit.

## `portal`

```ts
createPortalRoot(options: PortalRootOptions): PortalRootHandle;
setPortalContainer(container: Element | null, doc?: Document): void;
getPortalContainer(doc?: Document): Element | null;
```

One shared root per document, `<div data-slotted-portal>` at the end of
`<body>`, created on first use and removed when the last layer releases it. The
stack is only single if the nodes share a parent, and a test can only assert an
empty `body` if the root leaves with the last layer.

Each layer gets **its own element inside** that root, and the theme is mirrored
onto that element rather than onto the root, because two layers opened from two
differently themed regions need two answers.

**The mirrored attributes**: `dir`, `data-slotted-theme`, `data-slotted-scheme`
and `data-slotted-density`, resolved from the nearest ancestor of the origin
that carries each, and kept in sync by one attribute-filtered
`MutationObserver` per root. Every surveyed portal drops the layer at
`document.body` and loses them; in a library with one theme that is invisible,
and in this one a popover opened inside a dark region renders light. This is
the differentiator that only exists because of what the repository already
owns.

`setPortalContainer` is the **configuration once** the capability reference
asks for: an application shell that builds its own stacking context names its
container in one place, and `document.body` is the default only in its absence.

Nothing touches `document` at import time. `container` is `null` until a
document exists, which is what makes the module safe to import on a server.

## `positioner`

```ts
createPositioner(anchor: PositionerAnchor, floating: HTMLElement, options): PositionerHandle;
```

The anchor is an `Element` or anything with `getBoundingClientRect` — the
virtual anchor a context menu and a text selection both need.

| Option                          | Default               | Notes                                                                                              |
| ------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| `side`                          | `'bottom'`            | `top`, `bottom`, `left`, `right`, **`inline-start`**, **`inline-end`**.                              |
| `align`                         | `'center'`            | `start`, `center`, `end`.                                                                            |
| `sideOffset` / `alignOffset`    | `0` / `0`             | An arrow needs the first, a menu the second.                                                         |
| `flip` / `fallbackSides`        | `true` / derived      | The opposite side first, then the list.                                                              |
| `shift` / `boundaryPadding`     | `true` / `0`          | Sliding along the side is what keeps a wide panel on screen after flipping cannot.                   |
| `boundary`                      | clipping ancestors    | A layer inside a scrolling panel collides with the panel.                                            |
| `strategy`                      | `'absolute'`          | `fixed` for a layer inside `overflow: hidden`; `absolute` for one inside a transform.                |
| `arrow` / `arrowPadding`        | none / `0`            | The family draws it; the module places it.                                                           |
| `hideWhenDetached`              | `false`               | The anchor scrolled out of its clipper, or removed from the document.                                |
| `onPositioned`                  | —                     | The resolved placement, for a binding that needs it in its own state.                                |

**Logical sides.** `inline-start` and `inline-end` resolve against the
floating element's computed `direction` at each update. Every surveyed
positioner names physical sides only, leaving a right-to-left consumer to
mirror in script — in a repository whose law is logical properties everywhere,
that is the one place the law would have been broken.

**What lands on the floating element**, and it is the whole output contract:

| Written                                      | Kind             | For                                                              |
| -------------------------------------------- | ---------------- | ------------------------------------------------------------------ |
| `position`, `left`, `top`                    | inline style     | the placement                                                     |
| `data-side`, `data-align`                    | attribute        | a stylesheet that draws a different arrow per side                  |
| `data-detached`                              | attribute        | the anchor left the screen or the document                          |
| `--slotted-positioner-anchor-width` / `-height`   | custom property | a listbox the width of its input                             |
| `--slotted-positioner-available-width` / `-height` | custom property | a menu that scrolls rather than overflows                   |
| `--slotted-positioner-transform-origin`      | custom property  | a scale-in that grows from the anchor                              |
| `--slotted-positioner-arrow-x` / `-y`        | custom property  | the arrow the family draws                                         |

`left` and `top` carry the position and **`transform` is left alone**, against
Radix, which translates. The presence-driven enter and exit animations of every
family in this wave are transforms, and a positioner that owns `transform`
takes the property those animations need.

The custom properties are runtime values under a name that says so. They are
not design tokens and they are not in `packages/tokens/src/contract.json`. The
first family stylesheet to read one will meet
`packages/styles/src/tokens.test.mjs`, which requires every `--slotted-*` a
stylesheet reads to be declared in that family's `tokens.json` with a
foundation fallback — a runtime value has no foundation fallback. That is a
defect in the shared test rather than a reason to rename the properties, and it
is written into `tooltip`'s scope in `docs/process/build-order.md`, to be fixed in its
own commit before the family that finds it, as the briefing requires.

## `dismissable-layer`

```ts
createDismissableLayer(node: HTMLElement, options): DismissableLayerHandle;
createScrollLock(doc?: Document): ScrollLockHandle;
```

**One request, four reasons.** Radix reports `onEscapeKeyDown`,
`onPointerDownOutside`, `onFocusOutside` and `onInteractOutside` and leaves the
consumer to unify them. Here there is one `onDismiss`, carrying `escape`,
`outsidePress`, `blur` or `programmatic` from the closed `ChangeReason`
vocabulary, and cancellable — `docs/state-and-events.md` calls two events for
one transition "the same failure stated twice".

**The stack, and what "outside" means.** Every layer records, at creation, the
layer that was topmost then, as its parent. A press or a focus move is *inside*
a layer when it lands on that layer's node, on one of its branches, or anywhere
inside a layer descended from it. That is what makes
`docs/component-features.md` §3's rule — "não fecha uma camada ancestral ao
interagir com overlay descendente" — a mechanism rather than an intention: a
submenu is outside its parent menu in the DOM and inside it in the stack.

Escape is answered by the topmost layer alone, ignoring `event.repeat` so a
held key closes one layer, and ignoring `event.isComposing` so cancelling an
IME composition does not close anything.

Outside press is decided on `pointerdown` by default. A `click` that starts
inside and ends outside is a text selection dragged past the edge, not a
dismissal, and `outsidePressEvent: 'click'` is there for the family that needs
the other answer.

**`inert`, not `pointer-events: none`.** A modal layer applies `inert` to every
sibling on the path from itself to `<body>`, and removes it in reverse. Radix
blocks the pointer and leaves the blocked page in the accessibility tree, so a
screen reader still walks behind a modal. One attribute answers both, and it is
the platform's own answer.

**Scroll lock** is reference counted per document, records the original inline
`overflow` and `padding-inline-end` at the first lock, restores them at the
last, and compensates the scrollbar width so the page does not jump. Releasing
out of order cannot leave `overflow: hidden` behind, which is the failure a
counter without recorded originals produces.

**The single z-index stack** is `--slotted-layer-depth`, written on each layer
node as its position in the stack, so a stylesheet composes
`z-index: calc(var(--slotted-z-index-popover) + var(--slotted-layer-depth))`
from a token that already exists. The alternative — the platform's top layer,
via `popover="manual"` or `dialog.showModal()` — was considered and declined
for now: it is the better mechanism and it brings its own dismissal, stacking
and focus rules, which would have to be either adopted whole or fought. The
scope paragraph decides it too: "pilha única de z-index".

**Focus containment and restoration are not here.** They are `focus`'s, and
putting them in this module would give `packages/core` two answers to one
question.

## `live-announcer`

```ts
getLiveAnnouncer(doc?: Document): LiveAnnouncerHandle;   // the shared one
createLiveAnnouncer(doc?: Document): LiveAnnouncerHandle; // a fresh one, for tests
```

Two regions, `polite` and `assertive`, both `aria-atomic="true"`, both created
the moment the announcer is, because ARIA 1.2 §6.4 requires a live region to be
in the accessibility tree before the message enters it. A region created and
filled in one task is silent, and that is the single fact that makes this a
module instead of a `div`.

Each region holds **two children and alternates** between them, so a message
identical to the one before it is still a change in the tree and is still read.
Announcing "3 results" twice is otherwise silence, which is React Aria's reason
for the same design.

**A queue with a minimum gap**, which neither React Aria nor Angular CDK has.
Both write straight into the node, so a component announcing a filter change
and a result count in one update loses the first. Here the second waits
`ANNOUNCE_GAP` milliseconds and both are heard.

Deduplication is against the immediately previous message of that politeness
level only, so "5", "6", "5" says all three, and `repeat: true` turns it off for
the caller that means it.

`clearAfter` empties the region so a stale message is not read on the next
unrelated focus change, and `clear()` retracts one on demand. The message is
written with `textContent`: there is no interpolation and no HTML path into the
region, so a hostile or translated string is text.

It is not a toast API — `docs/component-features.md` §3 — and `toast`, later in
this wave, is the family that shows a message rather than says it.

## Shared state is per document

The layer stack, the portal root and the announcer are stored on a `WeakMap`
keyed by `Document`, not in a module-level variable. Two copies of the library
on one page — a micro-frontend, or a Storybook running two versions — would
otherwise keep two stacks, two portal roots and two announcers, and a screen
reader would read every message twice. It also gives every test an isolated
document to work in.

## Integration, answered before either binding exists

No binding is written in this invocation: these five modules have no UI, and
their first consumer is `tooltip`, next in the wave. The two tables of
`.claude/skills/component/references/frameworks.md` are still answered here,
because a module designed without them produces a binding that cannot answer
them later.

### React

| Question                                                            | Answer                                                                                                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason?  | yes, for the one mutable value in the five: `presence`'s `present`, held by `createControllable` with `onRequest`. The other four modules hold no consumer-owned value.     |
| Application defaults set once?                                       | yes: `setPortalContainer` for the portal container; the announcer is a per-document singleton. The binding wraps both in a provider when `tooltip` needs one.               |
| Substitute the rendered element of each part?                        | not applicable: no module renders. Every one is handed a node the consumer already rendered.                                                                                |
| Does the consumer's own handler still run?                           | yes: every listener is added on the document or on the given node and none calls `preventDefault` or `stopPropagation`. Dismissal is reported, never enforced.              |
| Reach the native element and the imperative action?                  | yes: the consumer owns the element; `dismiss()`, `finish()`, `update()`, `setAnchor()` and `announce()` are the imperative actions, each named for what it cannot express.  |
| Server render without a hydration mismatch?                          | yes: no module touches `document` at import time, the portal container is `null` until a document exists, and nothing measures during a render.                             |
| Every state a consumer may style in the DOM?                         | yes: `data-side`, `data-align`, `data-detached` and `--slotted-positioner-*` from `positioner`, `--slotted-layer-depth` from `dismissable-layer`. `presence` deliberately writes none — its status becomes the family's own `data-open`. |
| Props type native-extended rather than a hand-written subset?        | not applicable: these are functions, not components. The binding's own props are `tooltip`'s to answer.                                                                     |

### Angular

| Question                                              | Answer                                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form?                      | yes, in the binding: `presence`'s handle is read into a signal and `model()` exposes it; the module is signal-free by design, so React is not paying for Angular's reactivity. |
| Reactive Forms and template forms?                     | no: none of the five is a form control, and none holds a value a form would submit.                                                                          |
| Application defaults set once?                         | yes: `setPortalContainer` is called from a `provideSlottedOverlay()` factory when `tooltip` lands; the module takes the container as an argument so DI stays the binding's. |
| Template reach the instance?                           | yes, in the binding, through `exportAs` on the directive that owns the handle.                                                                                |
| Substitute projected content, kept lazy?               | not applicable: no module renders or projects.                                                                                                               |
| Correct with zoneless change detection and `OnPush`?   | yes: every callback is invoked from a DOM event or a frame, and the binding runs it inside its own signal write. Nothing schedules a change detection pass.   |
| Every subscription and listener torn down?             | yes: every factory returns a handle with `destroy()`, and every one removes its listeners, observers and timers. The test for each module asserts it.        |
| Static attribute survives the host bindings?           | yes: the modules write `data-side`, `data-align`, `data-detached`, `left`, `top`, `position` and their own custom properties, and touch nothing else on the node the consumer gave them. |
| Entry point stays a single class?                      | not applicable: `@slotted/core` is not an Angular entry point. It is imported as `@slotted/core/<module>` by both bindings alike.                             |

## Verification

```bash
pnpm --filter @slotted/core test
pnpm --filter @slotted/core build
pnpm check:affected
```

The build is the one that matters at the end: `@slotted/core` publishes one
file per entry point, and a module missing from `vite.config.ts`,
`package.json` `exports` or `src/index.ts` typechecks locally and cannot be
imported by either framework package.
