# Dialog and Alert Dialog design

Written before either binding, as step 5 of `.claude/skills/component/SKILL.md`
requires. It records the decisions the pair takes and what each one costs. The
survey and the verdict on every capability are in
`2026-09-04-dialog-and-alert-dialog-capability-inventory.md` and are not
repeated here.

---

## 1. One family, two members

`docs/build-order.md` wave 5 names the session `dialog alert-dialog`, and
`docs/component-features.md` §8 gives each its own paragraph. The library ships
them as **one family, `dialog`, with two members: `dialog` and `alertDialog`**,
both carrying `data-ui="dialog"`.

The precedent is `button`, whose contract declares `button`, `buttonLink`,
`iconButton` and `toggleButton` under one identifier, while
`docs/component-features.md` §5 gives Icon Button a section of its own. A
section in the guide describes a component a consumer reaches for; it does not
decide a public identifier.

What decides it here is `packages/styles/src/identity.test.mjs`: a family
stylesheet may not key on another family's `data-ui`. Two families would mean
two stylesheets restating the same layer, the same panel geometry, the same
scroll model, the same motion and the same forced-colours rule — around three
hundred lines, in two places, drifting from the first correction onward. The
alternative to duplication is coupling one family's DOM to another's stylesheet,
which `packages/styles/src/accordion/accordion.css` already records as the thing
that rule exists to prevent.

The reading is also the right one: an alert dialog **is** a dialog. A consumer
writing `[data-ui='dialog']` in their own CSS means every dialog, and an alert
dialog is not an exception they have to remember.

**Cost.** `specs/components/alert-dialog/` does not exist, and someone looking
for it finds nothing. The delta is recorded in `docs/build-order.md` when the
family lands. A consumer distinguishes the two in the DOM by
`[data-ui='dialog'][data-tone]`, which only the alert member writes, and in
either binding by the component name — `AlertDialog` and `slAlertDialog` are
their own public exports and their own reference page.

---

## 2. The layer, and why it is not `<dialog>`

The inventory declines the platform element and writes the cost. What follows is
what replaces it.

Three modules of `packages/core` are composed, and no fourth:

| Module              | Answers                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `portal`            | where the layer lives, and that it keeps the theme of the region that opened it |
| `dismissable-layer` | Escape, outside press, `inert`, the scroll lock, and the one z-index stack   |
| `presence`          | that the layer stays mounted long enough to leave                            |
| `focus`             | containment, the initial target, and restoration — §3                        |

`positioner` is not composed: a dialog is anchored to the viewport, not to an
element, so there is nothing to position against and no collision to resolve.
`live-announcer` is not composed: the `dialog` role announces the layer itself,
and a second announcement would be the same message twice.

### Three elements, and why the third one is not optional

Base UI puts a `Viewport` between the layer and the panel; Ark calls the same
element `Positioner`. The first draft of this family had neither, with `root`
doing the centring and the scrolling and `backdrop` positioned inside it. That
does not hold, and the reason is worth writing down because it is not obvious
from either library's documentation.

`root` declares `container-type: inline-size`, which applies `contain: layout`,
which makes `root` the containing block for every positioned descendant inside
it. A `backdrop` positioned inside a `root` that scrolls is therefore part of
what scrolls: under `scroll="viewport"` the scrim slides off the top of the
layer and the page reappears behind the panel. Taking the backdrop out of the
scrolling box is the only fix, and a box that is outside the scroller and inside
the layer is the third element.

So: `root` is the layer, `position: fixed`, `inset: 0`, the z-index from
`--slotted-z-index-overlay` plus `--slotted-layer-depth`, the query container,
and a one-cell grid. `backdrop` and `viewport` are both placed in that one cell,
which stacks them with no positioning at all. `viewport` centres the panel and,
under `scroll="viewport"`, scrolls. `content` is the panel.

`viewport` centres with `align-content: safe center`, not `center`. A panel
taller than the layer centred by the unsafe keyword overflows equally at both
ends, and the end that carries the title is the one that goes off screen.

### Positioning is `fixed`, and the harness could not show it

`position: fixed` resolves against the viewport unless an ancestor is a
containing block for fixed descendants. Every harness scene renders inside
`.stage`, which is not one, so nine cells of one page would each paint a
full-viewport layer on top of the page and on top of each other.

That is a defect in `tools/harness/build.mjs` rather than in this family, and
every overlay family in wave 5 meets it. It is fixed first, in its own commit,
as `docs/build-briefing.md` requires: a scene may declare `data-fixed` on its
`<section>`, and the stage it becomes carries `contain: layout paint` — which
makes it a containing block for fixed descendants and clips them to itself.
Nothing changes for a scene that does not declare it.

---

## 3. Focus, which is new in `packages/core`

`docs/build-order.md` wave 5 item 3 orders it: the two capabilities
`docs/component-features.md` §3 asks of `focus` and `focus` does not have —
containment in an overlay and restoration to the trigger — arrive here, with
their own test, before the family's parts. They are not in
`dismissable-layer`, which would answer the same question a second time.

```ts
export function createFocusScope(node: HTMLElement, options?: FocusScopeOptions): FocusScopeHandle;
```

| Option    | Answers                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `contain` | Tab and Shift+Tab wrap inside the node, and focus that lands outside is pulled back. Default `true`.            |
| `initial` | `'first'`, `'container'`, a function returning an element, or `false`. Default `'first'`.                       |
| `restore` | The element focus returns to on `destroy`, or `false`. Defaults to the element focused when the scope was made. |

Three decisions inside it are worth writing down.

**Containment is a `keydown` wrap plus a `focusin` recovery, not sentinel
nodes.** Radix and React Aria both insert two focusable spans around the layer.
A sentinel is DOM the consumer did not write, appears in their own
`querySelectorAll`, and is the first thing a screen reader's element list shows.
The wrap needs neither: the last tabbable plus Tab is the first tabbable, and
anything that moves focus out some other way — a browser's find bar, a
consumer's own `focus()` — is caught by the `focusin` listener.

**Restoration checks where focus actually is.** It moves focus back only when
focus is still inside the scope or on `document.body`. A consumer who focused
something else while closing meant it, and a scope that overrode them would be
the bug with no local explanation.

**Restoration survives a trigger that is gone.** A dialog that deletes the row
it was opened from has no trigger to return to, and every surveyed library
leaves focus on `body`, which starts the next Tab at the top of the page. The
scope falls back to the nearest connected ancestor of the origin that can hold
focus, and `createRemovalFocus` in the same module already established that this
is where focus belongs.

**What the platform would have given.** The browser contains focus in a
`<dialog>` opened with `showModal()` and returns it on close. This code exists
because the inventory declined the top layer; it is the price, and it is paid
once for every overlay family rather than by each of them.

---

## 4. Anatomy

| Part          | Element  | In        | Holds                                                                    |
| ------------- | -------- | --------- | ------------------------------------------------------------------------ |
| `root`        | `div`    | both      | the layer. `data-ui`, every axis, `data-open`, the depth                 |
| `trigger`     | `button` | both      | the control that opens it. Rendered in place, never in the layer         |
| `backdrop`    | `div`    | both      | the scrim                                                                |
| `viewport`    | `div`    | both      | the box that centres the panel, and scrolls under `scroll="viewport"`    |
| `content`     | `div`    | both      | `role="dialog"` or `role="alertdialog"`, `aria-modal`, the panel         |
| `header`      | `header` | both      | title, description and — in `dialog` — the close button                  |
| `icon`        | `span`   | alert     | the tone's own mark, drawn from a glyph token                            |
| `title`       | `h2`     | both      | `aria-labelledby`'s target                                               |
| `description` | `p`      | both      | `aria-describedby`'s target. Required in `alertDialog`                   |
| `body`        | `div`    | both      | the scrolling row                                                        |
| `footer`      | `footer` | both      | the actions                                                              |
| `close`       | `button` | `dialog`  | the ✕. Closes with `dismiss`                                             |
| `cancel`      | `button` | alert     | the least destructive action. Closes with `dismiss`, and takes initial focus |
| `action`      | `button` | alert     | the action being confirmed. Closes with `submit`                         |

`alertDialog` has no `close`: a confirmation is answered, not dismissed by an ✕
in the corner, and a corner ✕ next to Cancel is two controls for one outcome.

The header places four parts in a three-column grid, and **everything else a
consumer writes there lands in the words column**, under the description and
aligned with the title. Before that rule those children auto-placed into whichever
cell was free — column one whenever no icon was rendered, which is where an alert
dialog's mark goes — so a status indicator beside a title moved as soon as a tone
was set. Where it goes is now a rule rather than an accident of the grid.

`content` is a three-row grid — `auto minmax(0, 1fr) auto` — inside a bounded
block size. That single declaration is what keeps the footer on screen when the
body is long, which §4 of the inventory records as the gap every library leaves
to the consumer's own CSS.

The `trigger` is the one part a consumer usually replaces, because a real
application's trigger is a `Button`. Both bindings compose rather than wrap:
React's `Dialog.Trigger` takes `render`, and Angular's `slDialogTrigger` is a
directive the consumer puts on their own control. `dialog.css` writes no
appearance for it, so a substituted trigger loses nothing.

---

## 5. Axes

| Axis          | Values                          | Default (`dialog`) | Default (`alertDialog`) |
| ------------- | ------------------------------- | ------------------ | ----------------------- |
| `size`        | `sm` `md` `lg` `xl` `full`      | `md`               | `sm`                    |
| `surface`     | `panel` `plain`                 | `panel`            | `panel`                 |
| `placement`   | `center` `top`                  | `center`           | `center`                |
| `scroll`      | `content` `viewport`            | `content`          | `content`               |
| `mount`       | `active` `lazy` `eager`         | `active`           | `active`                |
| `fullScreen`  | `never` `narrow` `always`       | `narrow`           | `never`                 |
| `modal`       | boolean                         | `true`             | `true` (fixed)          |
| `escape`      | `close` `none`                  | `close`            | `close`                 |
| `outsidePress`| `close` `none`                  | `close`            | `none` (fixed)          |
| `tone`        | the five semantic tones         | —                  | `danger`                |

`size` is five named steps rather than a pixel string. A theme retunes a step;
it cannot retune `width: '600px'`, and a family that accepted one would be
carrying a second scale — which `docs/token-foundation.md` gives the three
layers to prevent. `full` is the step a document-sized dialog uses, and a
consumer needing an exact measure still writes `max-inline-size` on `content`.

`surface` is the one axis that turns the family's own paint off. `render`
substitutes the element the panel is drawn on and not the drawing, so a consumer
who wanted the mechanism around a box of their own — a card, a media viewer, an
image at its own aspect ratio — had no way to say so. `plain` removes the
ground, the border, the radius, the shadow, the three rows and the padding, and
keeps the portal, the scrim, `presence`, the focus containment and restoration,
the dismissal policy and the single z-index stack. It is where this library meets
a headless one: Radix and Base UI ship no panel at all, so `plain` is what their
`Content` already is. The cost is that a plain panel does not keep its footer on
screen for a long body, because the rows go with the paint.

`fullScreen: 'narrow'` is a container query at a literal breakpoint on `root`,
which `docs/token-foundation.md` rule 4 requires: a container condition cannot
hold a custom property. Below it the panel loses its radius, its margins and its
maximum measure, and `content` fills the layer. `docs/component-features.md` §8
asks for exactly this — "em mobile pode ocupar tela" — and §2.7 asks that the
responsive mode be testable deterministically, which a container query is and a
`pointer: coarse` query is not.

`alertDialog` fixes `outsidePress` at `none` and `modal` at `true`. Those are
the two rules §8 states, and they are defaults of the member rather than props a
consumer sets: Ark and React Aria make the role a prop, so a consumer who sets
`role="alertdialog"` and forgets the dismissal policy ships a destructive
confirmation a stray click dismisses.

`escape` stays an axis on both. §8 says Escape is accepted "só quando cancelar é
seguro", and cancelling is safe whenever a Cancel action exists — which
`alertDialog` requires. A consumer whose cancel is not safe writes
`escape="none"`, and the reference page says so beside the prop.

---

## 6. State

One mutable value, `open`, through `@slotted/core/state`:

```json
"open": {
  "controlled": "open",
  "uncontrolled": "defaultOpen",
  "request": "onOpenChange",
  "reasons": ["pointer", "keyboard", "dismiss", "escape", "outsidePress", "submit", "programmatic"]
}
```

| Source                     | Reason         |
| -------------------------- | -------------- |
| trigger, pointer           | `pointer`      |
| trigger, `Enter` or `Space`| `keyboard`     |
| `close` or `cancel`        | `dismiss`      |
| `action`                   | `submit`       |
| Escape                     | `escape`       |
| a press outside the layer  | `outsidePress` |
| the imperative handle      | `programmatic` |

`docs/component-features.md` §8 names `closeButton` as a source; the reason
vocabulary in `docs/state-and-events.md` is closed and holds `dismiss`, which is
what a close button means. Adding a twelfth reason is a change to a contract
outside this family and is not taken for a word the vocabulary already has.

### The result is on the request, not a second state model

`docs/component-features.md` §8 asks for a "resultado", the platform calls it
`returnValue`, and Angular Material returns it from `afterClosed()`. It rides on
the close request:

```ts
onOpenChange(false, { reason: 'submit', result: 'confirm', source: event })
```

`close`, `cancel` and `action` each take a `value`, which becomes the result.
It is not a second `stateModel` entry, and the reason is what a state model
means: nothing about a result is controlled, there is no initial one, and a
consumer owning it would own a value only the family can produce.

### The request is cancellable, and that is the whole close policy

`@slotted/core/state` gives every request a `cancel()`. A dialog that must not
close while a form is saving calls it, and the same guard covers all six close
sources. Radix reports the same policy through `onOpenChange`,
`onEscapeKeyDown`, `onPointerDownOutside` and `onInteractOutside`, and a
consumer writes the guard three times.

---

## 7. Keyboard, roles and the APG comparison

Sourced from the WAI-ARIA Authoring Practices, read on 4 September 2026:
<https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/> and
<https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/>.

| APG requirement                                                     | Answer                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| On open, focus moves to an element inside the dialog                 | `createFocusScope` with `initial: 'first'`; `alertDialog` overrides it to the `cancel` part |
| `Tab` moves to the next tabbable, wrapping from the last to the first| the scope's `keydown` wrap                                                                  |
| `Shift+Tab` moves to the previous, wrapping from the first to the last| the same                                                                                   |
| `Escape` closes the dialog                                           | `dismissable-layer`, which asks the topmost layer only; refused when `escape="none"`        |
| The container has role `dialog`                                      | `content`, or `alertdialog` for the alert member                                            |
| Everything needed to operate it is a descendant of that element      | `header`, `body` and `footer` are inside `content`; `backdrop` holds no control             |
| `aria-modal="true"` on the container                                 | written only when `modal` is true and the background is genuinely inert — the APG's own condition |
| `aria-labelledby` to a visible title, or `aria-label`                | `aria-labelledby` when a `title` part is present; otherwise the consumer's `aria-label` survives |
| `aria-describedby`, optional for `dialog`                            | written when a `description` part is present, and omitted when `scroll="viewport"` holds structured content — the APG's own advice |
| `aria-describedby`, **required** for `alertdialog`                   | the member requires a `description`, and both bindings fail loudly without one              |
| Focus placement on an irreversible step is the least destructive action | `alertDialog` focuses `cancel`                                                            |

Two APG notes are deliberate departures and carry their cost:

- **`aria-modal` is not written for a non-modal dialog.** The APG warns that
  marking a dialog modal when the application does not make the background inert
  has "severe negative ramifications". `modal={false}` writes neither
  `aria-modal` nor `inert`, contains no focus and locks no scroll. The cost is
  that a non-modal dialog is reachable by Tab from the page behind it, which is
  what a non-modal dialog is.
- **The trigger writes `aria-haspopup="dialog"` for both members.** `aria-haspopup`
  has no `alertdialog` token; `dialog` is the correct value for both, and the
  role on the layer is what distinguishes them.

---

## 8. Motion

| Transition                | Property                                | Duration                       | Easing                      |
| ------------------------- | --------------------------------------- | ------------------------------ | --------------------------- |
| backdrop, in              | `opacity`                               | `--slotted-duration-medium`    | `--slotted-easing-enter`    |
| backdrop, out             | `opacity`                               | `--slotted-duration-short`     | `--slotted-easing-exit`     |
| panel, in                 | `opacity`, `translate`, `scale`         | `--slotted-duration-medium`    | `--slotted-easing-enter`    |
| panel, out                | `opacity`, `translate`                  | `--slotted-duration-short`     | `--slotted-easing-exit`     |

A dialog appearing is a state change the eye has to follow — the page it covers
is still visible behind it — so it transitions rather than snapping. Leaving is
shorter than arriving, because a reader who has decided to close is waiting.
Reduced motion is inherited from the theme, which collapses all four
motion-scale durations to `1ms`; nothing here loops, so nothing needs the
explicit stop `docs/token-foundation.md` requires of infinite animation.

`@slotted/core/presence` holds the layer mounted for the exit and completes it on
a timer when the animation event never arrives.

---

## 9. React

### Idiom

Function components; `useId` for the four ids; one context for the family and a
second for the application's defaults; `render` on every part; native props
spread onto the element that owns them; `ComponentPropsWithRef<'…'>` as the base
of every part's props.

`Dialog` renders no DOM. It is the provider, and the trigger has to be a
descendant of it while the layer is portalled out — the shape Radix, Base UI and
Ark all reach. Angular needs no equivalent, and §10 says why.

### Integration

| Question                                                                  | Answered by                                                                                                                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason         | yes: `open` / `defaultOpen` / `onOpenChange(open, request)`, where `request` carries `reason`, `result`, `source` and `cancel()`             |
| Defaults set once for the application                                     | yes: `DialogDefaultsProvider` and `useDialogDefaults`, over `size`, `placement`, `scroll`, `mount`, `fullScreen`, `escape` and `outsidePress` |
| A consumer can substitute the rendered element of each public part         | yes: `render` on `Dialog`, `Trigger`, `Content`, `Header`, `Title`, `Description`, `Body`, `Footer`, `Close`, `Cancel` and `Action`          |
| The consumer's own handler still runs                                     | yes: `onClick`, `onKeyDown` and `onPointerDown` are called first, and the family's own behaviour is skipped when the consumer called `preventDefault` |
| The native element and the imperative action                              | yes: `ref` on every part, and a handle on `Dialog`'s `ref` with `open()`, `close(result)` and `focus()`                                       |
| Server rendering without a hydration mismatch                             | yes: `useId` for every id; the portal container is resolved in an effect, so the server renders the trigger and nothing else                 |
| Every state a consumer may style is in the DOM                            | yes: `data-open`, `data-loading`, and the seven axes as `data-*`                                                                             |
| Part props are the native element's, extended                             | yes: `ComponentPropsWithRef<'div'>`, `<'button'>`, `<'h2'>`, `<'p'>`, `<'header'>`, `<'footer'>`                                             |

---

## 10. Angular

### Idiom

Standalone components; `input()`, `model()` and `output()`; `computed` for
everything derived; `host` metadata rather than decorators; `exportAs`;
`inject()`; `ViewEncapsulation.None` over the one authored stylesheet; imports
between entry points only through `@slotted/angular/<name>`.

`<sl-dialog>` **is** the layer: its host element carries `data-ui="dialog"` and
`data-part="root"`, and the component moves that host element into the portal
container when it opens and takes it back when it closes. Angular keeps the
view alive across the move, so projected content, bindings and change detection
are untouched.

There is no Angular equivalent of React's no-DOM `Dialog`, and there does not
need to be: a template reference variable plus `exportAs` links a trigger to a
dialog anywhere in the template, where React needs a provider around both. That
is the asymmetry `references/frameworks.md` asks to be recorded rather than
levelled away.

### Integration

| Question                                                        | Answered by                                                                                                                              |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the form the ecosystem expects                  | yes: `open = model<boolean>(false)`, plus `openChangeRequest = output<DialogChangeRequest>()` for the reason, the result and `cancel()`   |
| Reactive Forms and template forms                                | no: a dialog holds no value a form submits. A form *inside* a dialog is the consumer's own, and the layer neither wraps nor intercepts it |
| Defaults set once for the application                            | yes: `provideDialogDefaults()` and `DIALOG_DEFAULTS`, the same seven axes as React                                                        |
| A template can reach the instance                                | yes: `exportAs: 'slDialog'`, and the trigger directive takes it — `<button slDialogTrigger [dialog]="d">`                                 |
| Projected content, kept lazy                                     | yes: `<ng-content>` for the panel's rows, and `mount="active"` renders the layer's template only while open, so a heavy body is not built until asked |
| Zoneless and `OnPush`                                            | yes: signals throughout, `ChangeDetectionStrategy.OnPush`, and no `markForCheck`                                                          |
| Every subscription and listener torn down                        | yes: the layer, the scope, the presence and the portal are all released in `DestroyRef`, and the document listeners belong to `dismissable-layer`, which counts its own |
| A static attribute the consumer wrote survives                   | yes: `HostAttributeToken` reads `role` and `aria-label` on the host before the host bindings are written                                  |
| An entry point others depend on stays a single class             | yes: `@slotted/angular/dialog` exports `SlDialog`, `SlAlertDialog`, their parts and the defaults function                                 |

---

## 11. What is not built

- **Drag, resize and minimise.** `floating-window`, wave 8.
- **Edge placement, gestures and snap points.** `drawer`, wave 5 item 4.
- **A service that instantiates a component.** Declined, with the three lines
  that replace it, in the inventory.
- **`scrollStrategy`.** Declined; a dialog is not anchored.
- **A scroll cue on the body.** `scroll-state()` container queries would let the
  stylesheet know the body is scrolled and draw a rule only then. It is limited
  availability, the same ground on which `collapsible` declined
  `interpolate-size`, and the family draws the header and footer rules
  unconditionally instead. The cost is a rule under a header that has nothing
  above it to separate.
