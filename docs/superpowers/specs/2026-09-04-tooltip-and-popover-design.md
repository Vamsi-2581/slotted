# Tooltip and Popover — design

Wave 5, items 1 and 2 of `docs/build-order.md`, built in one session because
`docs/build-schedule.md` says why: they are the same positioning with two
dismissal policies, and deciding that twice produces two answers.

The inventory is
`docs/superpowers/specs/2026-09-04-tooltip-and-popover-capability-inventory.md`.
The infrastructure they compose is
`docs/superpowers/specs/2026-09-03-overlay-infrastructure-design.md`, and every
decision that document already took — the engine, the portal, the layer stack,
the top layer declined — is carried here rather than retaken.

---

## What each family is, and what it is not

`tooltip` is a short, non-interactive, supplementary sentence about the element
under the pointer or under focus. It never holds a control, never takes focus,
and is never the only place a fact is written. `docs/component-features.md` §8
and the APG both say the same thing: "Tooltip widgets do not receive focus. A
hover that contains focusable elements can be made using a non-modal dialog."

`popover` is that non-modal dialog: anchored, interactive, opened by a press,
holding a title, a body and actions. It is not modal — the guide's own
sentence is "conteúdo interativo **não modal** ancorado" — and it is not a
`dialog`, which is modal and arrives two items later in this wave.

---

## Two families, one mechanism

Both compose the same four modules of `@slotted/core`, and neither reimplements
any of them.

| Module              | What each family asks of it                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `positioner`        | Side, alignment, offsets, flipping, shifting, the boundary, the arrow's coordinates and the six custom properties a stylesheet cannot compute. |
| `presence`          | The layer stays in the document through its exit animation, and leaves in the same task under reduced motion.                          |
| `portal`            | The layer lives at the end of the body and keeps the `dir`, theme, scheme and density of the region it was opened from.                |
| `dismissable-layer` | Escape on the topmost layer only, outside press on `pointerdown`, and `--slotted-layer-depth` so a layer opened later draws above one opened earlier. |

**The tooltip is a dismissable layer too**, which is the one place this design
departs from the inventory's first reading. Three things follow from it and all
three are wanted: Escape dismisses it, which the APG requires and WCAG 2.2 SC
1.4.13 requires again under the name Dismissible; a press anywhere outside
dismisses it, which is Ark's `closeOnPointerDown` obtained from the shared
mechanism rather than from a second document listener; and a tooltip opened on a
button inside an open popover is a layer above that popover, so it draws above
it and answers Escape before it. The trigger is registered as a **branch** of
the layer, so a press on the trigger is not an outside press — the family closes
on it deliberately, with the reason `pointer`, rather than by accident with the
reason `outsidePress`.

Neither family is modal. `createDismissableLayer` is given `modal: false` and
`scrollLock: false`, so nothing outside becomes `inert` and the page keeps
scrolling.

### Stacking

Both layers write

```css
z-index: calc(var(--slotted-z-index-popover) + var(--slotted-layer-depth, 0));
```

No new step is added to the stacking scale. A tooltip is above a popover because
it is a later layer, not because it was given a larger number — which is the
single-stack decision the infrastructure already took, and the reason a tooltip
inside a popover needs no coordination between the two families.

---

## Anatomy

Both families are a **layer** and a **surface**, and the split is the reason
they can animate at all. The positioner writes `position`, `left` and `top` on
the layer and deliberately leaves `transform` alone; the layer is what scales
and fades. The surface inside it is what is painted, and for `popover` it is
what holds a header the body may scroll under.

### tooltip

| `data-part` | Element                                | Always | What it is                                                                                                                  |
| ----------- | -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `root`      | `div`                                  | yes    | The layer. Carries `data-ui="tooltip"`, `data-side`, `data-align`, `data-open`, `data-detached` and the animation.           |
| `content`   | `div`, `role="tooltip"`                | yes    | The painted surface and the text.                                                                                            |
| `arrow`     | `div`                                  | no     | A rotated square, a child of the layer and painted behind the surface at `z-index: -1`, so its inner half never shows.       |

The trigger is **not** a part. It is the consumer's own element, and the family
writes only `aria-describedby` (or `aria-labelledby`) and `data-open` on it. See
**The trigger is not a part** below.

### popover

| `data-part`   | Element                                     | Always | What it is                                                                                                                       |
| ------------- | ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `root`        | `div`                                       | yes    | The layer. `data-ui="popover"`, `data-side`, `data-align`, `data-open`, `data-detached`.                                          |
| `content`     | `div`, `role="dialog"`, `tabindex="-1"`     | yes    | The panel. `aria-labelledby` names the title, `aria-describedby` the description, `aria-modal` is never written.                  |
| `header`      | `div`                                       | no     | The title, the description and the close control, on one line that stays put while the body scrolls.                             |
| `title`       | `div`, or the element `render` returns      | no     | The panel's accessible name. A `div` rather than a heading, for the reason `result-state` records: only the page knows whether this belongs in its outline. |
| `description` | `p`                                         | no     | One line under the title, referenced rather than announced.                                                                      |
| `body`        | `div`                                       | no     | The scroll container, bounded by `--slotted-positioner-available-height`.                                                        |
| `footer`      | `div`                                       | no     | The actions row.                                                                                                                 |
| `close`       | `button type="button"`                      | no     | Draws `--slotted-icon-x` as a mask. Its accessible name comes from the defaults provider so one application translates it once.   |
| `arrow`       | `div`                                       | no     | As the tooltip's.                                                                                                                |
| `focus-guard` | `span tabindex="0" aria-hidden="true"` (×2) | yes    | The two sentinels that make Tab leave a portalled non-modal layer sensibly. See **Focus** below.                                  |

The trigger and the anchor are not parts either. The trigger carries
`aria-expanded`, `aria-haspopup="dialog"`, `aria-controls` and `data-open`; the
anchor carries nothing at all and is only measured.

## The trigger is not a part

`data-part` names a part of the family that owns the element. A trigger is the
consumer's own element, and in this library it is very often another family's
root: a `button`, a `badge`, an `avatar`, a `checkbox`. Sixteen stylesheets in
`packages/styles` key on `[data-part='root']`, so writing `trigger` over one
would silently unstyle it and no test would report it.

So the family writes on the trigger only what it has to: the ARIA relationship,
and `data-open` so a consumer can style their own element while the layer is
showing. Nothing is lost — a trigger is not inside the layer, so no stylesheet
of this family could have reached it through a descendant selector anyway.

The same hazard exists today in `field`, whose `slFieldControl` directive writes
`data-part="control"` onto whatever element the consumer puts it on. It belongs
to that family and is recorded in `docs/BUILD-LOG.md` rather than fixed here.

Both families render the same shape, so a reader who has written one has written
the other:

```tsx
<Tooltip>
  <TooltipTrigger render={<Button aria-label="Save" />} />
  <TooltipLayer>
    <TooltipContent>
      Saves the draft without publishing it
      <TooltipArrow />
    </TooltipContent>
  </TooltipLayer>
</Tooltip>
```

`Tooltip` and `Popover` own the state and render nothing at all: the trigger
stays where the consumer wrote it and the layer is portalled, so no single
element can hold both. That is why the family's namesake component is not the
one that renders `data-part="root"` here, which is the one place these two
families depart from every other family in the library, and it is written into
the anatomy table of both reference pages rather than left to be discovered.

---

## State

One mutable value each, and the model is `docs/state-and-events.md`'s.

```json
"stateModel": {
  "open": {
    "controlled": "open",
    "uncontrolled": "defaultOpen",
    "request": "onOpenChange",
    "reasons": ["pointer", "keyboard", "escape", "blur", "programmatic"]
  }
}
```

`popover`'s reasons are `pointer`, `keyboard`, `escape`, `outsidePress`,
`dismiss` and `programmatic`. It does not declare `blur`: the only way focus
leaves a popover is through a focus guard, and a guard is reached by `Tab`,
which is `keyboard`. `dismiss` is the Close part.

| Reason         | `tooltip`                                                     | `popover`                                          |
| -------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `pointer`      | hover in, hover out, the trigger pressed, a long press on touch | the trigger pressed                                |
| `keyboard`     | focus arriving on the trigger                                 | `Enter` or `Space` on the trigger, the focus guard  |
| `escape`       | Escape, from the topmost layer                                | Escape, from the topmost layer                     |
| `blur`         | focus leaving the trigger                                     | not emitted                                        |
| `outsidePress` | not emitted — see below                                       | a press outside the layer and outside its branches  |
| `dismiss`      | not emitted                                                   | the Close part                                     |
| `programmatic` | `open()` / `close()` on the handle, and a detached anchor      | the same                                           |

A tooltip dismissed by a press outside reports `pointer` rather than
`outsidePress`: from the reader's side it is the same gesture as pressing the
trigger, and a consumer writing one handler for "the pointer took it away"
should not have to write two.

Every request is cancellable. `createControllable` refuses to move an
uncontrolled value when the consumer calls `cancel()`, and a controlled family
notifies and waits, which is what lets an application hold a popover open while
a save is in flight.

---

## Delays, and the group timeout

Only `tooltip` has them.

| Value        | Default | Why this number                                                                                                                                                    |
| ------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openDelay`  | `600`   | Long enough that a pointer crossing a toolbar opens nothing, short enough that a deliberate hover is answered before the reader gives up. The field spans 600 to 1500. |
| `closeDelay` | `150`   | The window in which the pointer can cross the `sideOffset` gap into the layer. Zero makes a hoverable tooltip unreachable, which is WCAG 2.2 SC 1.4.13 Hoverable failing. |
| `groupDelay` | `400`   | After a tooltip closes, the next one within this window opens with no delay at all. Reading a row of icon buttons pays the warmup once.                             |

Focus never waits: a tooltip opened by keyboard focus opens in the same task,
because a delay a reader cannot shorten by moving faster is a delay for nothing.

The group timeout is held by the defaults provider, which is also where an
application sets the three numbers once. It is a shared mutable timestamp per
provider, not per tooltip, which is what makes "the next one" mean anything.

---

## Dismissal, side by side

| Gesture                                   | `tooltip`                                              | `popover`                                                    |
| ----------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| Pointer leaves trigger and layer          | closes after `closeDelay`                              | nothing                                                      |
| Trigger pressed                           | closes (`closeOnPress`, default on)                    | toggles                                                      |
| Press outside                             | closes                                                 | closes (`closeOnOutsidePress`, default on)                   |
| Escape                                    | closes                                                 | closes, and focus returns to the trigger                     |
| Focus leaves the trigger                  | closes                                                 | nothing — focus is inside the layer                          |
| Scroll                                    | nothing; the layer follows its anchor                  | nothing                                                      |
| The anchor leaves the document or clipper | closes (`hideWhenDetached`, default on)                | stays (`hideWhenDetached`, default off)                      |

The last row is the one asymmetry worth stating. A hint whose anchor scrolled
away has nothing left to explain; a task the reader is halfway through must not
vanish because the row behind it scrolled.

---

## Keyboard

### tooltip

| Key                | Effect                                                                             | Focus lands            | Source                        |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------- | ----------------------------- |
| `Escape`           | dismisses the tooltip                                                              | stays on the trigger   | APG                           |
| `Tab` / `Shift+Tab`| moves to the next or previous focusable element; a tooltip opened by focus dismisses | the next element       | APG, note 2                   |
| `Enter` / `Space`  | activates the trigger, which is the consumer's own control, and dismisses          | stays on the trigger   | platform, plus `closeOnPress` |

The layer is never in the tab sequence and holds nothing focusable. That is the
pattern's requirement, not a limitation: a tooltip that can be tabbed into is a
non-modal dialog wearing the wrong role.

### popover

| Key                 | Effect                                                                     | Focus lands                        | Source              |
| ------------------- | -------------------------------------------------------------------------- | ---------------------------------- | ------------------- |
| `Enter`             | toggles the popover                                                        | the panel, or `initialFocus`       | platform (`button`) |
| `Space`             | toggles the popover                                                        | the panel, or `initialFocus`       | platform (`button`) |
| `Escape`            | closes                                                                     | the trigger, or `finalFocus`       | APG dialog          |
| `Tab`               | moves through the panel; past the last element it closes the popover        | the trigger                        | family              |
| `Shift+Tab`         | moves back through the panel; before the first element it closes the popover | the trigger                       | family              |

---

## Focus

`popover` moves focus into the panel on open and returns it to the trigger on
close. Three of the four surveyed implementations do, and without it `Tab` from
the trigger reaches the next element on the page rather than the panel, which is
at the end of the document.

- `autoFocus` (default `true`) focuses the panel itself, which carries
  `tabindex="-1"`, rather than its first control. A reader hears the panel's
  name before its contents, and a popover whose first control is destructive
  does not arrive pre-armed.
- `initialFocus` takes an element, a ref or a selector for the case where the
  first control is the point — a filter popover opening onto its search field.
- `finalFocus` takes the destination for the case where the trigger is gone by
  the time the popover closes, which is the row-actions popover that deleted its
  own row.

**Focus containment is not here.** `docs/build-order.md` puts it in
`packages/core/src/focus` with `dialog`, three items later in this wave, and
`dialog` is being built in a parallel session. A non-modal popover must not
contain focus anyway, so nothing is missing; when `dialog` lands the shared
containment, `modal` becomes a question for that family and not for this one.

**The focus guards** are the answer to a question every surveyed library leaves
open: what `Tab` does at the end of a portalled non-modal layer. Two
`tabindex="0"` sentinels sit inside the layer, one before the panel and one
after. Focus reaching either one arrived from the keyboard and has nowhere
useful to go, so the family closes the popover with the reason `keyboard` and
puts focus back on the trigger — from which the reader's next `Tab` continues
down the page in document order. It costs one extra `Tab` and it is the only
answer that keeps the reading order intact without trapping focus in a layer
that is not modal.

---

## Accessible wiring

### tooltip

`role="tooltip"` on the surface, and the trigger references it. The `describes`
axis decides which relationship is written:

| `describes`             | The trigger gets                | For                                                                    |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| `description` (default) | `aria-describedby`              | a labelled control with an extra sentence about it                     |
| `label`                 | `aria-labelledby`               | an icon-only button whose only words are in the tooltip                |

The second value exists because the first is wrong for the most common tooltip
in any product. An icon button with `aria-describedby` and no label is a button
called "button"; Ark exposes `aria-label` on its root for the same problem and
React Aria documents it in prose, and neither makes it one decision the family
records.

The reference is written while the tooltip is closed as well as open, so a
reader who focuses the trigger before the layer exists still hears the sentence.
The layer is therefore in the document whenever `describes="label"`, and `mount`
is forced to `eager` in that case rather than silently producing a button with
no name.

### popover

`role="dialog"` on the panel, named by its title through `aria-labelledby` and
described by its description through `aria-describedby`. `aria-modal` is never
written, because it is not modal and writing it would tell a reader the rest of
the page is gone when it is not.

The trigger carries `aria-expanded`, `aria-haspopup="dialog"` and
`aria-controls` pointing at the panel. A popover with no `title` part gets no
`aria-labelledby`; the family does not invent a name, and the reference page
says that a popover without a title should carry `aria-label` on its content.

---

## Touch

There is no hover on a coarse pointer. `docs/component-features.md` §2.7 is
explicit that no important behaviour may depend on it, so:

- a **long press** (`pointerdown` held for `touchDelay`, default 500 ms, with no
  movement past a small threshold) opens the tooltip with the reason `pointer`;
- a **tap** does not, because a tap is the control's own action;
- the next press anywhere dismisses it, through the same dismissable layer.

The reference page states the consequence rather than hiding it: a tooltip is
supplementary by definition, and a fact only reachable by long press is a fact
half the readers of a product will not find.

## A tooltip on a disabled control

A `disabled` button fires no pointer events, so the one explanation of why it is
disabled is the one nobody can reach. Every surveyed library leaves the consumer
to wrap the control in a `span`. The family ships the decision instead: the
trigger listens on the element it is put on, and the reference page demonstrates
the two supported shapes — `aria-disabled="true"` on a control that stays
focusable and still reports pointer events, which is the shape this library
prefers, and a wrapping element carrying the trigger for a control that must
keep the native `disabled` attribute.

---

## Motion

The layer scales and fades from the anchor.

```css
opacity: 0;
scale: 0.96;
transform-origin: var(--slotted-positioner-transform-origin, center);
transition:
  opacity var(--slotted-duration-short) var(--slotted-easing-exit),
  scale var(--slotted-duration-short) var(--slotted-easing-exit),
  overlay var(--slotted-duration-short) allow-discrete;
```

`[data-open]` moves both to their open values on `--slotted-duration-medium`
with `--slotted-easing-enter`, so entering is a shade slower than leaving, which
is what makes a layer feel placed rather than thrown. Every duration is a motion
token, so `prefers-reduced-motion` collapses all of them to `1ms` in one query
in the theme, and `presence` completes an exit in the same task under reduced
motion rather than waiting for an animation that will not run.

`scale` is used rather than `transform: scale()` so that the property the
animation owns is not the property the positioner was told to leave alone — and
so a consumer animating `translate` of their own does not fight it.

---

## The stylesheet, and what it reads

Both families are painted from the foundation and neither adds a step to any
scale.

| Decision                | `tooltip`                                                                  | `popover`                                                    |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Surface                 | `--slotted-surface-inverse` (`inverse` variant) / `--slotted-surface-raised` (`surface`) | `--slotted-surface-raised`                      |
| Text                    | `--slotted-text-inverse` / `--slotted-text`                                | `--slotted-text`                                             |
| Border                  | none on `inverse`; `--slotted-border-subtle` on `surface`                  | `--slotted-border-subtle`                                    |
| Elevation               | `--slotted-shadow-sm`                                                      | `--slotted-shadow-lg`                                        |
| Radius                  | `--slotted-radius-sm`                                                      | `--slotted-radius-lg`                                        |
| Inline padding          | `--slotted-control-padding-inline-sm` / `-md`                              | `--slotted-space-5` / `-6` / `-7` by size                    |
| Block padding           | `--slotted-control-gap-sm` / `-md`                                         | `--slotted-space-4` / `-5` / `-6` by size                    |
| Type                    | `--slotted-control-font-size-sm` / `-md`                                   | `--slotted-font-size-md`, title `--slotted-font-size-lg`      |
| Measure                 | `18rem` for `md`, `14rem` for `sm`                                         | `16rem` / `20rem` / `24rem` by size, or the anchor's width    |

The three control scales vary by density, which is how both families answer
`comfortable`, `compact` and `dense` without a rule of their own. `high-contrast`
is a scheme the theme repaints; `forced-colors` is the theme's block, and neither
family writes one, because neither paints anything the theme cannot reach.

Every measure is a `max-inline-size`, never an `inline-size`, and it is capped
again by `--slotted-positioner-available-width` so a layer near the edge of a
narrow viewport narrows instead of overflowing. `popover`'s body is capped by
`--slotted-positioner-available-height` and scrolls, which is the one capability
every surveyed library exposes a custom property for and none of them uses.

### The arrow

A square rotated 45°, sized by `--slotted-<family>-arrow-size`, painted with the
surface's own background and border, sitting at `z-index: -1` inside the layer
so the panel paints over its inner half and only the two outer edges show. The
engine measures it and writes `--slotted-positioner-arrow-x` and `-arrow-y`; the
family places it against `data-side`.

Those two coordinates are **physical**, measured from the layer's own left and
top, exactly as `--slotted-positioner-transform-origin` is physical and for the
same reason: `transform-origin` and an engine's rectangle are both physical
things. Placing them therefore takes physical insets, which
`packages/styles/src/logical.test.mjs` refuses. That is a defect in the shared
test rather than a reason to mirror an already-correct number, and it is fixed
first, in its own commit — see below.

---

## The two shared-tool defects, fixed first

`docs/build-order.md` predicted one of them; the second was found beside it.
Both are the same lesson: `packages/styles`' shared tests had never met a value
that script measures at runtime.

1. **`tokens.test.mjs` would file a runtime value as a theme token.** It requires
   every `--slotted-*` a stylesheet reads to appear in that family's
   `tokens.json`, and each family's reference page prints that list as
   "Theme-owned decisions". `--slotted-positioner-arrow-x` is not a theme
   decision and cannot be given a foundation fallback; the briefing already
   records these properties as "runtime values, not design tokens". The fix is a
   shared list, `packages/styles/src/runtime-properties.mjs`, naming the two
   prefixes with the reason, which `tokens.test.mjs` subtracts before comparing —
   plus a test that a runtime property never appears in a `tokens.json`.
2. **`logical.test.mjs` refuses the arrow.** Its rule — no `top`, `right`,
   `bottom` or `left` in a stylesheet — is right for every rule a person writes
   and wrong for the one rule whose inputs are already physical. The exemption is
   narrow and stated: a physical inset is permitted only in a rule whose selector
   names `[data-part='arrow']`. Every other physical inset in the repository
   still fails, and the test asserts that it does.

Both land in one commit before either family, because they are one lesson and
because `menu`, `select`, `combobox` and `date-picker` will each meet them next.

---

## Axes and defaults

### tooltip

| Axis               | Values                                                              | Default        |
| ------------------ | ------------------------------------------------------------------- | -------------- |
| `variant`          | `inverse`, `surface`                                                | `inverse`      |
| `size`             | `sm`, `md`                                                          | `md`           |
| `describes`        | `description`, `label`                                              | `description`  |
| `openOn`           | `hover`, `focus`, `manual`                                          | `hover`        |
| `side`             | `top`, `bottom`, `inline-start`, `inline-end`, `left`, `right`      | `top`          |
| `align`            | `start`, `center`, `end`                                            | `center`       |
| `mount`            | `active`, `lazy`, `eager`                                           | `active`       |
| `openDelay`        | milliseconds                                                        | `600`          |
| `closeDelay`       | milliseconds                                                        | `150`          |
| `groupDelay`       | milliseconds, provider only                                         | `400`          |
| `touchDelay`       | milliseconds                                                        | `500`          |
| `hoverable`        | boolean                                                             | `true`         |
| `closeOnPress`     | boolean                                                             | `true`         |
| `sideOffset`       | pixels                                                              | `8`            |
| `alignOffset`      | pixels                                                              | `0`            |
| `collisionPadding` | pixels                                                              | `8`            |
| `arrowPadding`     | pixels                                                              | `8`            |
| `flip` / `shift`   | boolean                                                             | `true`         |
| `strategy`         | `absolute`, `fixed`                                                 | `absolute`     |
| `hideWhenDetached` | boolean                                                             | `true`         |
| `portal`           | boolean                                                             | `true`         |
| `disabled`         | boolean                                                             | `false`        |

### popover

The positioning axes are the tooltip's, with `side` defaulting to `bottom` and
`hideWhenDetached` to `false`. On top of them:

| Axis                  | Values                       | Default   |
| --------------------- | ---------------------------- | --------- |
| `size`                | `sm`, `md`, `lg`             | `md`      |
| `width`               | `auto`, `anchor`             | `auto`    |
| `autoFocus`           | boolean                      | `true`    |
| `initialFocus`        | element, ref or selector     | —         |
| `finalFocus`          | element, ref or selector     | —         |
| `closeOnEscape`       | boolean                      | `true`    |
| `closeOnOutsidePress` | boolean, or a predicate      | `true`    |
| `closeLabel`          | string, provider or instance | `Close`   |

The consumer's own value always wins over the provider, and the provider wins
over the fallback. Nothing is derived over an explicit value.

### Deliberate departure from §2.5

Neither family declares a `disabled` **visual state**, and both hold the
`disabled` **capability**. A disabled tooltip or popover never opens, so under
the default `mount: 'active'` there is no element to carry `data-disabled` and
nothing to paint. Declaring the state would put a selector in the contract that
selects a box a reader never sees. The capability is answered where it is
observable: the trigger keeps `data-open` absent, and the behavioural tests
assert that no layer is created.

---

## Integration, answered for both bindings

### React

| Question                                                       | Answered by                                                                                                                                                                              |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request with a reason? | `open` / `defaultOpen` / `onOpenChange(open, reason, event)`, held by `createControllable` from `@slotted/core/state`.                                                                    |
| Application defaults set once?                                 | `TooltipDefaultsProvider` and `PopoverDefaultsProvider`, with `useTooltipDefaults` / `usePopoverDefaults`. The tooltip provider also holds the group timestamp, and a `container` for the portal. |
| Substitute the rendered element of each public part?           | `render` on `TooltipTrigger`, `PopoverTrigger`, `PopoverAnchor`, `PopoverTitle`, `PopoverClose` and every surface part. The layer is fixed: it is the element the positioner writes to, and substituting it would substitute the contract. |
| Does the consumer's own handler still run?                      | Every listener the family adds composes: it calls the consumer's handler first, and does nothing if that handler called `preventDefault`. No family listener calls `stopPropagation`.     |
| Reach the native element and the imperative action?             | `ref` on every part, and a `TooltipHandle` / `PopoverHandle` through `useImperativeHandle` carrying `open()`, `close()` and `reposition()` — the three a consumer cannot express declaratively. |
| Server render without a hydration mismatch?                     | `useId` for every id, nothing measured during render, and the portal container resolved in an effect. A layer with `mount: 'active'` renders nothing on the server.                       |
| Every state a consumer may style in the DOM?                    | `data-open` on the layer and on the trigger, `data-side`, `data-align` and `data-detached` on the layer, all from the contract's declared vocabulary.                                    |
| Props type native-extended rather than a subset?                | `ComponentPropsWithRef<'div'>`, `'button'`, `'p'` and `'span'` per part, extended with the family's own axes.                                                                             |

### Angular

| Question                                            | Answered by                                                                                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form?                    | `model<boolean>()` for `open` on `SlTooltip` and `SlPopover`, and `output<TooltipOpenRequest>()` for the request that carries the reason.                                                     |
| Reactive Forms and template forms?                   | No. Neither family is a form control and neither holds a value a form would submit. A control inside a popover is the consumer's own and reaches its form untouched.                          |
| Application defaults set once?                       | `TOOLTIP_DEFAULTS` and `POPOVER_DEFAULTS` injection tokens with `provideTooltipDefaults()` and `providePopoverDefaults()`, plus `provideSlottedPortalContainer()` calling `setPortalContainer`. |
| Template reach the instance?                         | `exportAs: 'slTooltip'` and `'slPopover'` on the state owners, and `'slPopoverClose'` on the close control.                                                                                   |
| Substitute projected content, kept lazy?             | `ng-content` in every surface part, and `@if` on `mount` so `active` and `lazy` never build content that is not shown. A consumer needing re-rendered content passes an `ng-template`.        |
| Correct with zoneless change detection and `OnPush`? | Signals throughout, `ChangeDetectionStrategy.OnPush`, and every core callback written into a signal rather than into a field. No `markForCheck`.                                              |
| Every subscription and listener torn down?           | `DestroyRef` calls `destroy()` on the presence, positioner, dismissable-layer and portal handles, and clears every delay timer. `takeUntilDestroyed` for the pointer streams.                  |
| Static attribute survives the host bindings?         | `HostAttributeToken` reads a consumer's own `role`, `id` and `aria-describedby` on the trigger before the directive writes its own, and keeps theirs.                                          |
| Entry point stays a single class?                    | `@slotted/angular/tooltip` and `@slotted/angular/popover`, each with its own `public-api.ts`, importing nothing of the other.                                                                 |

### Where the two bindings are deliberately different

`Tooltip` and `Popover` render nothing in React; in Angular the state owner is a
directive written on `<ng-container>`, which renders nothing either and still
gives its content children an injector. React exposes `render` for element
substitution; Angular does not need it, because the directive is already on the
consumer's own element. Angular gets `exportAs` and DI-provided defaults; React
gets a context provider and a ref handle. Neither is levelled down to the other.

---

## What is deliberately not here

| Not shipped              | Owner                | Why                                                                                                                              |
| ------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `modal` on `popover`     | `dialog`             | The guide defines this family as non-modal. Focus containment lands in `packages/core/src/focus` with `dialog`, later in this wave. |
| Opening on hover         | `preview-card`       | A rich surface opened by hover is Preview Card / Hover Card, Extended, wave 8.                                                    |
| A backdrop               | `dialog`             | It exists to darken the page behind a modal, and this one is not modal.                                                          |
| Closing on scroll        | nobody               | `positioner` repositions on scroll and `hideWhenDetached` answers the anchor leaving. Closing as well takes a hint away from a reader who is scrolling to read it. |
| Interactive tooltips     | `popover`            | The APG forbids it in the pattern this family answers, and names the non-modal dialog as the answer — which is the other half of this session. |
| The platform's top layer | the overlay infrastructure | Decided on 3 September 2026, with its cost written in the inventory §2.4. Not retaken here.                                  |
