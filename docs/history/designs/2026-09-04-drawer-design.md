# Drawer design

Written before either binding, as step 5 of `.claude/skills/component/SKILL.md`
requires. It records the decisions the family takes and what each one costs. The
survey and the verdict on every capability are in
`2026-09-04-drawer-capability-inventory.md` and are not repeated here.

---

## 1. Its own family, not a member of `dialog`

`docs/process/build-order.md` wave 5 item 4 names `drawer` as its own session, and
`specs/components/dialog/contract.json` already declines `edgePlacement` with
`deferTo: drawer`. The question left open is whether the layer should still
carry `data-ui="dialog"`, the way `alertDialog` does.

It should not, and one fact decides it: **a persistent drawer has no `dialog`
role at all.** An alert dialog is a dialog — same role family, same keyboard,
same modality — so a consumer writing `[data-ui='dialog']` means it too. An
inline drawer is a region of the page: nothing is inert, nothing is contained,
the panel is in the flow, and `role="dialog"` on it would be a lie the APG
explicitly warns against. A consumer's rule for "every dialog on this page"
must not reach it.

`data-ui="drawer"` therefore, and its own stylesheet. The cost is real and worth
naming: the header's three columns, the words' overflow handling, the close
button's geometry and the forced-colours rule are the same shapes
`packages/styles/src/dialog/dialog.css` already holds, and
`packages/styles/src/identity.test.mjs` forbids reaching for them. That is
roughly eighty lines written twice. What it buys is that the two families can
move apart without one breaking the other, which is what happened the first time
a family keyed on another family's identifier — recorded in
`packages/styles/src/accordion/accordion.css`.

---

## 2. One member, and `mode` as an axis

Fluent ships `OverlayDrawer` and `InlineDrawer` as two components, with a third
that picks between them. Angular Material and MUI ship one component with a mode
input. `docs/component-features.md` §8 asks for both shapes — "modal ou
persistente conforme viewport" — so only the packaging is open.

**One member, `drawer`, with `mode: 'overlay' | 'inline'`.**

The reason is the switch itself. §8's word is *conforme viewport*: the same
drawer is an overlay on a phone and a persistent panel on a desktop, and an
application binds the axis to its own breakpoint. Two components mean the
consumer swaps one element for another at that breakpoint, and React and Angular
both destroy the subtree when they do: the panel's scroll position goes, focus
goes, and every uncontrolled input inside it resets. An axis changes an
attribute. That is the whole argument, and it is why Fluent's own `Drawer`
wrapper exists.

The cost is that one component holds two behaviours, and the parts that only one
of them uses — `backdrop` — render nothing in the other. §4 says what each mode
composes.

### Where the responsive switch lives

Not here. The breakpoint at which a product moves from a persistent sidebar to
an overlay is an application decision, not a component's, and a family that
owned a viewport media query would be the thing
`.claude/skills/component/references/rubric.md` dimension 3 refuses. It is also
not a container query: an overlay drawer has no place in the layout to measure.

The consumer binds it, which is what Fluent, MUI and Angular Material all
document, and the reference page carries the two lines.

---

## 3. Anatomy

| Part          | Element             | In            | Holds                                                                                         |
| ------------- | ------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `root`        | `div`               | both          | the layer, or the flow box. `data-ui`, every axis, `data-open`, `data-loading`, `data-dragging` |
| `trigger`     | `button`            | both          | the control that opens it. Rendered in place, never in the layer                               |
| `backdrop`    | `div`               | overlay+modal | the scrim                                                                                      |
| `panel`       | `div`               | both          | the surface. `role="dialog"` under `overlay`, no role under `inline`                           |
| `resizer`     | `div`               | both          | `role="separator"`, `tabindex="0"`. The edge a reader drags or arrows                          |
| `header`      | `header`            | both          | title, description and the close button                                                        |
| `title`       | `h2`                | both          | `aria-labelledby`'s target, and the resizer's accessible name                                  |
| `description` | `p`                 | both          | `aria-describedby`'s target                                                                    |
| `body`        | `div`               | both          | the one row that scrolls                                                                       |
| `footer`      | `footer`            | both          | the actions                                                                                    |
| `close`       | `button`            | both          | the ✕. Closes with `dismiss`, carrying its `value` as the result                               |

Two boxes in the layer, not three. `dialog` needs a `viewport` between the layer
and the panel because its root declares `container-type: inline-size`, which
applies `contain: layout`, which makes a scrim positioned inside a scrolling
root part of what scrolls. A drawer's root declares no container and never
scrolls: the panel is pinned to an edge and bounded to the layer by
construction. `backdrop` and `panel` are two cells of one one-cell grid, and
nothing is positioned.

### The panel renders `div` in both modes, and the role changes

Under `inline` the panel is not a dialog and writes no role. It is not given
`role="region"` either: a navigation drawer is a `navigation` landmark and a
filter panel is `complementary`, and a family that cannot know which one guesses
wrong half the time. The consumer reaches for `render` — React — or
`ngProjectAs` on their own element — Angular — and the reference page shows both.

The element stays a `div` in both modes for the reason §2 gives: changing the
tag at a breakpoint destroys the subtree, which is exactly what the axis exists
to avoid.

### The resizer is a track of the panel's grid, not an overlay on it

The panel's grid gains one track on the side the reader reaches from:

| `side`   | `grid-template-areas`                                        |
| -------- | ------------------------------------------------------------ |
| `end`    | `'resizer header' 'resizer body' 'resizer footer'`           |
| `start`  | `'header resizer' 'body resizer' 'footer resizer'`           |
| `bottom` | `'resizer' 'header' 'body' 'footer'`                         |
| `top`    | `'header' 'body' 'footer' 'resizer'`                         |

Grid areas are placed in writing order, so `'resizer header'` puts the resizer
at inline-start and mirrors itself in a right-to-left document with no second
rule.

A track rather than an absolutely positioned strip, because the track's width is
`--slotted-target-min` — the WCAG 2.2 floor of 24 pixels — and a 24-pixel strip
lying over the panel's inner edge would eat the pointer on whatever is under it:
a scrollbar, the start of a field, the first character of a line. When no
resizer is rendered the track is `auto` and collapses to nothing, so the
ordinary drawer pays no geometry for it.

**Rendering the part is the capability.** There is no `resizable` prop. A
consumer who wants a resizable drawer renders `Drawer.Resizer`; one who does not
renders nothing. It is the shape `title`, `description` and `close` already
have, and it means the two cannot disagree — a `resizable` prop with no resizer
part, or a resizer part a prop has switched off, are both states this family
cannot be in.

---

## 4. What each mode composes

| Module              | `overlay`, modal | `overlay`, non-modal | `inline` |
| ------------------- | ---------------- | -------------------- | -------- |
| `portal`            | yes              | yes                  | no       |
| `dismissable-layer` | yes              | yes                  | no       |
| `presence`          | yes              | yes                  | yes      |
| `focus`             | contain, restore | restore              | restore  |

`positioner` is not composed: a drawer is anchored to an edge of the layer, not
to an element, so there is nothing to position against and no collision to
resolve. `live-announcer` is not composed under `overlay`, where the `dialog`
role announces the layer; under `inline` the trigger's `aria-expanded` is what a
reader hears, which is what a disclosure already means.

**Focus under `inline` contains nothing and moves nothing on open.** A
persistent drawer is part of the page, and a sidebar that stole focus every time
a breakpoint crossed would be unusable. It still restores: `createFocusScope`
moves focus back only when focus is inside the scope or on `document.body`, so
closing an inline drawer whose control the reader is standing on returns them to
the trigger, and closing one they had already left moves nothing. That is
`{ contain: false, initial: false }`, and it needs no new code in
`packages/core`. Angular Material takes the same split — `autoFocus` defaults to
the first tabbable element in `over` and `push`, and to nothing in `side`.

**The closed panel is `inert` in both modes.** Under `mount="eager"` or `lazy`
the overlay layer stays in the document, and under `inline` the collapsed panel
always does. A panel the eye reads as closed whose controls are still in the tab
sequence is the defect MUI's `persistent` variant ships; `inert` plus
`content-visibility: hidden` makes the collapse and the tab order agree.

---

## 5. Axes

| Axis           | Values                             | Default   |
| -------------- | ---------------------------------- | --------- |
| `mode`         | `overlay` `inline`                 | `overlay` |
| `side`         | `start` `end` `top` `bottom`       | `end`     |
| `size`         | `sm` `md` `lg` `xl` `full`         | `md`      |
| `mount`        | `active` `lazy` `eager`            | `active`  |
| `modal`        | boolean                            | `true`    |
| `escape`       | `close` `none`                     | `close`   |
| `outsidePress` | `close` `none`                     | `close`   |

`side` is logical. Vaul says `left`, MUI says `anchor="left"` and Ant says
`placement="left"`; `docs/component-features.md` §2.4 decides against all three,
and grid alignment is flow-relative already, so the whole layout mirrors without
a second stylesheet. Only the exit `translate` is physical, and it takes one
`:dir(rtl)` rule per inline side.

`size` is the resting measure, five named steps, the shape `dialog` took and for
the same reason: a theme retunes a step and cannot retune `width: 400px`. A
consumer needing an exact measure sets `--slotted-drawer-extent` on the element,
which is the token the steps resolve into.

`modal` is fixed at `false` under `inline` and not a prop a consumer can turn
back on. A panel in the flow that claimed `aria-modal` while the page around it
stayed reachable is the failure the APG calls severe, and it is the one thing in
this family that cannot be left to a consumer's memory.

**`scroll` is not an axis.** `dialog` has one because a centred panel can be
taller than the layer and the reader has to choose which box moves. A drawer's
panel is exactly the layer's block extent on a side, and its own extent on a top
or bottom, so it never exceeds the layer and there is no second thing that could
scroll. The body is the row that scrolls; Ant, Fluent and MUI all agree and none
of them ships an axis for it.

---

## 6. State

Two mutable values, both through `@slotted/core/state`.

```json
"open": {
  "controlled": "open",
  "uncontrolled": "defaultOpen",
  "request": "onOpenChange",
  "reasons": ["pointer", "keyboard", "dismiss", "escape", "outsidePress", "programmatic"]
},
"extent": {
  "controlled": "extent",
  "uncontrolled": "defaultExtent",
  "request": "onExtentChange",
  "reasons": ["pointer", "keyboard", "programmatic"]
}
```

| Source                            | Reason         |
| --------------------------------- | -------------- |
| trigger, pointer                  | `pointer`      |
| trigger, `Enter` or `Space`       | `keyboard`     |
| `close`                           | `dismiss`      |
| Escape                            | `escape`       |
| a press outside the layer         | `outsidePress` |
| the imperative handle             | `programmatic` |
| dragging the resizer              | `pointer`      |
| an arrow, `Home`, `End`, `Enter`  | `keyboard`     |

`submit` is not in the list, and the difference from `dialog` is deliberate:
`alertDialog` owns a part whose meaning *is* confirmation, and this family owns
none. A drawer's Apply button is the consumer's own control, and it closes the
drawer by setting `open` or by calling the handle.

The result rides on the close request exactly as it does in `dialog` —
`close` takes a `value`, and it reaches `onOpenChange` as `request.result`. It
is not a second state model, because nothing about a result is controlled and
there is no initial one.

### `extent` is a fraction, and it is a new word in the vocabulary

`specs/contract.schema.mjs` had no capability for a measure the reader moves.
`size` is there and is deliberately not mutable; `measurement` is a quantity the
consumer states and the family draws; `value` is the text a control holds. None
of them is "how much of the layer this panel takes, which the reader can
change".

`extent` is added to `KNOWN_CAPABILITIES` and to `MUTABLE_CAPABILITIES`, in its
own commit, before this family — as `docs/build-briefing.md` requires of every
shared tool. It binds a second family already: `splitter`, wave 8, holds exactly
the same value between two panes, and the Window Splitter pattern this family
sources is that family's pattern too. The word comes from
`docs/component-features.md` §8, which asks for "extent com limites".

The value is **a fraction of the layer along the resize axis**, in `[0, 1]`, and
not a CSS length. Three things follow from that and none of them holds for a
length:

- `aria-valuenow`, `aria-valuemin` and `aria-valuemax` are the fraction times a
  hundred, which is the range the Window Splitter pattern calls typical;
- `minExtent`, `maxExtent` and `snapPoints` are the same kind of number, so one
  clamp covers all three;
- a keyboard step is a proportion — five per cent of the layer per arrow press —
  so the family carries no pixel literal and needs no token for one.

`extent` unset means the `size` step decides, and the stylesheet says so:
`--_extent: var(--slotted-drawer-extent, var(--_step))`. The binding writes
`--slotted-drawer-extent` as an inline custom property once the reader has moved
it. That property is a theme-owned decision as well — an application setting one
measure for every drawer writes it on `[data-ui='drawer']` — which is why it is
in `drawer.tokens.json` and not in
`packages/styles/src/runtime-properties.mjs`.

### The request is cancellable, and that is the whole close policy

Every request carries `cancel()`. A drawer that must not close while a filter is
saving calls it, and the same guard covers Escape, the outside press, the close
button and the handle. Angular Material's `disableClose` refuses two of the four
and cannot refuse the third; Ant needs `keyboard` and `mask.closable` and still
cannot refuse the close button.

---

## 7. Resizing, and how a keyboard performs it

Sourced from the WAI-ARIA Authoring Practices, read on 4 September 2026:
<https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/>, "Window Splitter
Pattern". The panel is the pattern's *primary pane*.

| APG requirement                                                          | Answer                                                                                             |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| The focusable splitter has role `separator`                               | `resizer`, with `tabindex="0"`                                                                     |
| `aria-valuenow` is the current position                                   | the extent fraction times a hundred, rounded                                                       |
| `aria-valuemin` is where the primary pane is smallest                     | `minExtent` times a hundred, default `20`                                                          |
| `aria-valuemax` is where it is largest                                    | `maxExtent` times a hundred, default `100`                                                         |
| The separator is labelled by the primary pane's visible label             | `aria-labelledby` the `title` part; a consumer without one writes `aria-label` on the resizer       |
| `aria-controls` refers to the primary pane                                | the `panel`'s id                                                                                   |
| Left Arrow moves a vertical splitter left                                 | yes — physically left, whatever the side and the direction                                         |
| Right Arrow moves a vertical splitter right                               | yes                                                                                                |
| Up Arrow moves a horizontal splitter up                                   | yes, for `side="top"` and `side="bottom"`                                                          |
| Down Arrow moves a horizontal splitter down                               | yes                                                                                                |
| `Enter` collapses the pane, and restores it from collapsed                | yes: to `minExtent`, and back to the extent it left                                                |
| `Home` (optional) gives the pane its smallest size                        | yes                                                                                                |
| `End` (optional) gives it its largest                                     | yes                                                                                                |
| `F6` (optional) cycles panes                                              | no. There are no panes to cycle: a drawer has one, and the page behind it is either inert or reached with `Tab` |
| `aria-orientation`                                                        | `vertical` for `start` and `end`, `horizontal` for `top` and `bottom`                              |

The arrows are physical rather than logical, and that is the pattern's own
reading: the key names a direction on the screen. `ArrowLeft` grows an
`end`-side drawer in a left-to-right document and shrinks it in a right-to-left
one, because in the second the panel is on the left and the reader is pushing
its edge toward the wall. `slider` already resolved the same question the same
way for its inline arrows.

Two departures, each with its cost:

- **No `aria-valuetext`.** A reader hears "40" rather than "40 per cent". The
  string would have to be built from a locale this family does not take, and a
  hard-coded `%` is wrong in the locales that place it differently. The range is
  0 to 100, which is what makes the bare number legible.
- **`Enter` collapses to `minExtent`, not to closed.** The pattern's "collapses
  the pane" would mean closing the drawer, and `Escape` already means that. A
  reader who presses `Enter` on a separator expects the separator to still be
  there afterwards.

### Snap points, and the condition §8 puts on them

`docs/component-features.md` §8 allows snap points "somente quando acrescentam
valor e continuam operáveis por teclado". They are the discrete form of the same
separator, which is the only reading under which the condition can be met:

- `snapPoints` is an array of fractions. Empty by default;
- with snap points, an arrow moves to the adjacent one and `Home`/`End` go to
  the first and last;
- `minExtent` and `maxExtent` default to the first and the last;
- a drag releases onto the nearest.

Vaul is the only surveyed implementation with snap points and they are reachable
by dragging alone.

### Dragging, and dragging past the floor

Pointer capture on the resizer, the same idiom `slider` uses. While the pointer
is down the root carries `data-dragging`, the extent follows the pointer without
its transition, and the floor is not enforced — a bottom sheet the reader is
pulling down has to follow the hand.

On release, one rule: **an extent below `minExtent` asks to close, carrying
`pointer`; anything else commits the clamped value.** A close the consumer
cancels leaves the panel at `minExtent`. That is what MUI's `SwipeableDrawer`
and Vaul's dismiss gesture both do, expressed as a consequence of the resize
rather than as a second mechanism.

**Dragging the panel itself is declined.** Vaul supports it and spends most of
its complexity there: telling a drag from a scroll, telling it from a text
selection, and `repositionInputs` for the keyboard that opens under it. The
resizer is the drag target, it is 24 pixels of real estate, and it is the same
control the keyboard uses. The cost is that a reader cannot flick a bottom sheet
away from its middle, and that the handle has to be rendered for the gesture to
exist at all.

---

## 8. Keyboard, roles and the dialog comparison

Sourced on 4 September 2026:
<https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>, "Dialog (Modal)
Pattern". It applies to `mode="overlay"` only.

| APG requirement                                                       | Answer                                                                                        |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| On open, focus moves to an element inside the dialog                   | `createFocusScope` with `initial: 'first'`, under `overlay` only — §4                          |
| `Tab` moves to the next tabbable, wrapping from last to first          | the scope's `keydown` wrap, while modal                                                        |
| `Shift+Tab` wraps the other way                                        | the same                                                                                       |
| `Escape` closes the dialog                                             | `dismissable-layer`, topmost layer only; refused when `escape="none"`                          |
| The container has role `dialog`                                        | `panel`, under `overlay`. Under `inline` it has none — §3                                      |
| Everything needed to operate it descends from that element             | `header`, `body`, `footer` and `resizer` are all inside `panel`; `backdrop` holds no control    |
| `aria-modal="true"` on the container                                   | written only while `modal` is true and the background is genuinely inert                       |
| `aria-labelledby` to a visible title, or `aria-label`                  | `aria-labelledby` when a `title` part is present; a consumer's own `aria-label` survives        |
| `aria-describedby`, optional                                           | written when a `description` part is present                                                   |

The trigger writes `aria-haspopup="dialog"` and `aria-expanded` under `overlay`,
and `aria-expanded` alone under `inline`. An inline drawer is a disclosure, not
a popup, and `aria-haspopup` on it would promise a layer that never arrives.
None of the six surveyed implementations makes that distinction.

---

## 9. Motion

| Transition            | Property                    | Duration                    | Easing                   |
| --------------------- | --------------------------- | --------------------------- | ------------------------ |
| backdrop, in          | `opacity`                   | `--slotted-duration-medium` | `--slotted-easing-enter` |
| backdrop, out         | `opacity`                   | `--slotted-duration-short`  | `--slotted-easing-exit`  |
| panel, in (overlay)   | `translate`                 | `--slotted-duration-medium` | `--slotted-easing-enter` |
| panel, out (overlay)  | `translate`                 | `--slotted-duration-short`  | `--slotted-easing-exit`  |
| root, in (inline)     | `inline-size`/`block-size`  | `--slotted-duration-medium` | `--slotted-easing-enter` |
| root, out (inline)    | `inline-size`/`block-size`  | `--slotted-duration-short`  | `--slotted-easing-exit`  |
| while `data-dragging` | none                        | —                           | —                        |

The panel slides and does not fade. It arrives from outside the layer, so its
position already carries the whole change; adding opacity would make one motion
read as two. `dialog` fades and scales because a centred panel has nowhere to
come from.

Leaving is shorter than arriving, for the reason `dialog` records: a reader who
has decided to close is waiting. Reduced motion is inherited from the theme,
which collapses all four motion-scale durations to `1ms`. Nothing here loops.

`@slotted/core/presence` holds the layer mounted for the exit and completes it on
a timer when the animation event never arrives.

---

## 10. React

### Idiom

Function components; `useId` for the four identifiers; one context for the family
and a second for the application's defaults; `render` on every part; native props
spread onto the element that owns them; `ComponentPropsWithRef<'…'>` as the base
of every part's props.

`Drawer` renders no DOM: the trigger has to be a descendant of it while the layer
is portalled out. `DrawerPanel` renders the root, the backdrop and the panel, and
its `render` substitutes the panel element — which is how an inline drawer
becomes a `<nav>`.

### Integration

| Question                                                          | Answered by                                                                                                                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason | yes: `open`/`defaultOpen`/`onOpenChange(open, request)` and `extent`/`defaultExtent`/`onExtentChange(extent, request)`, each request carrying `reason` and `cancel()` |
| Defaults set once for the application                             | yes: `DrawerDefaultsProvider` and `useDrawerDefaults`, over `side`, `size`, `mode`, `mount`, `modal`, `escape` and `outsidePress`                                  |
| A consumer can substitute the rendered element of each public part | yes: `render` on `Drawer`, `Trigger`, `Panel`, `Resizer`, `Header`, `Title`, `Description`, `Body`, `Footer` and `Close`                                           |
| The consumer's own handler still runs                             | yes: `onClick`, `onKeyDown` and `onPointerDown` run first, and the family's behaviour is skipped when the consumer called `preventDefault`                          |
| The native element and the imperative action                      | yes: `ref` on every part, and a handle on `Drawer`'s `ref` with `open()`, `close(result)` and `focus()` — and nothing more, because the extent is already declarative |
| Server rendering without a hydration mismatch                     | yes: `useId` for every id; the portal container is resolved in an effect, so the server renders the trigger and nothing else                                        |
| Every state a consumer may style is in the DOM                    | yes: `data-open`, `data-loading`, `data-dragging`, and the seven axes as `data-*`                                                                                   |
| Part props are the native element's, extended                     | yes: `ComponentPropsWithRef<'div'>`, `<'button'>`, `<'h2'>`, `<'p'>`, `<'header'>`, `<'footer'>`                                                                    |

---

## 11. Angular

### Idiom

Standalone components; `input()`, `model()` and `output()`; `computed` for
everything derived; `host` metadata rather than decorators; `exportAs`;
`inject()`; `ViewEncapsulation.None` over the one authored stylesheet; imports
between entry points only through `@slotted/angular/<name>`.

`<sl-drawer>` renders `display: contents` and stays where the consumer wrote it.
The layer is the `div` in its template. Under `overlay` that `div` is moved into
the portal container and given back to the host before it is destroyed; under
`inline` it never moves, which is what makes the host's own parent the drawer's
place in the layout. `<sl-drawer>` is also the portal's *origin* in both modes,
so the layer keeps the scheme, density, theme and direction of the region it was
written in whether or not a trigger exists — the asymmetry `dialog` already
recorded against React, which has to use the trigger for that.

### Integration

| Question                                                      | Answered by                                                                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the form the ecosystem expects                | yes: `open = model<boolean>(false)` and `extent = model<number \| undefined>(undefined)`, plus `openChangeRequest` and `extentChangeRequest` outputs |
| Reactive Forms and template forms                              | no: a drawer holds no value a form submits. A form *inside* one is the consumer's own, and the layer neither wraps nor intercepts it              |
| Defaults set once for the application                          | yes: `provideDrawerDefaults()` and `DRAWER_DEFAULTS`, the same seven axes as React                                                               |
| A template can reach the instance                              | yes: `exportAs: 'slDrawer'`, and the trigger directive takes it — `<button slDrawerTrigger [drawer]="d">`                                        |
| Projected content, kept lazy                                   | yes: `<ng-content>` for the panel's rows, and `mount="active"` builds the layer's template only while open                                        |
| Zoneless and `OnPush`                                          | yes: signals throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`                                                                      |
| Every subscription and listener torn down                      | yes: the layer, the scope, the presence and the portal are released in `DestroyRef`, and the pointer listeners are released with the capture      |
| A static attribute the consumer wrote survives                 | yes: `HostAttributeToken` reads `aria-label` on the host before the host bindings are written                                                     |
| An entry point that others depend on stays a single class      | yes: `@slotted/angular/drawer` exports `SlDrawer`, its parts and the defaults function                                                            |

---

## 12. What `packages/core` gains

One module, `packages/core/src/extent`, for the arithmetic both bindings need
and neither should own. It is the shape `packages/core/src/slider` already has,
and `splitter` in wave 8 is its second consumer.

```ts
export function fractionAtPoint(request: ExtentPointRequest): number;
export function nearestSnap(fraction: number, snapPoints: readonly number[]): number;
export function stepExtent(request: ExtentStepRequest): number;
```

`fractionAtPoint` turns a pointer position, the layer's rectangle, the side and
the document's direction into a fraction. `stepExtent` moves a fraction by an
amount or to the adjacent snap point, and clamps it. Neither touches the DOM, so
both are tested without one.

`clamp` is already in `@slotted/core/measure` and is composed rather than
rewritten.

---

## 13. What is not built

- **Push mode.** Angular Material's `push` and MUI's `persistent` shift the page
  content aside. `mode="inline"` puts the drawer *in* the consumer's own grid or
  flex row, and the sibling reflows because the layout says so rather than
  because a family wrote a margin on an element it does not own. The two or three
  lines are on the reference page.
- **A parent drawer sliding aside for a child.** Ant's `push`. The depth comes
  from `dismissable-layer`'s single stack and the layers overlap; animating the
  parent would mean this family owning the geometry of a layer it no longer
  controls.
- **Whole-panel drag.** §7, with its cost.
- **A drawer service that instantiates a component.** Declined for the reason
  `dialog` records: with `@if` and signals it is three lines in the consumer's
  own template, and the data injection is the component's own inputs.
- **`scrollStrategy`.** A drawer is not anchored, so `reposition` describes
  nothing; `block` is what the scroll lock does; `noop` is `modal={false}`.
- **An empty state.** An empty list inside a drawer is `result-state`, which owns
  the seven statuses and their marks. The composition is on the reference page.
- **A viewport breakpoint that picks the mode.** §2, with the two lines that
  replace it.
