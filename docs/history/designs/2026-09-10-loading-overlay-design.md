# Loading overlay design

Decisions and their cost. The candidates were produced in
`2026-09-10-loading-overlay-capability-inventory.md`; what follows is what the
family does with them, and it is written before either binding.

---

## 1. Responsibility

One sentence: **it covers content that is already on the page, keeps that
content measured and in the DOM, and takes it out of reach until a wait the
consumer owns has ended.**

Everything it does not do is owned elsewhere:

| Not this family              | Owned by                                                      |
| ---------------------------- | ------------------------------------------------------------- |
| The spinner, bar or circle  | `progress-indicator`, rendered into the `indicator` part      |
| Standing in for absent content | `skeleton`                                                    |
| The portal, the scroll lock, the `inert` boundary, `Escape` | `@slotted/core/dismissable-layer` |
| When a placeholder is painted | `@slotted/core/loading`                                       |
| Where focus goes and returns | `@slotted/core/focus`                                         |
| The exit transition          | `@slotted/core/presence`                                      |

---

## 2. The accessibility pattern

The WAI-ARIA APG pattern index (<https://www.w3.org/WAI/ARIA/apg/patterns/>,
read 2026-09-10) publishes no pattern for a loading overlay, a busy region or a
blocking layer. That is recorded rather than approximated: writing “checked
against the Dialog pattern” would import focus containment, `aria-modal` and a
close affordance into a component that is not a dialog and has no reader-owned
open state.

The closest official guidance is normative and comes from three places.

**ARIA 1.2, `progressbar` role** (<https://www.w3.org/TR/wai-aria-1.2/>): “If
the `progressbar` is describing the loading progress of a particular region of a
page, the author SHOULD use `aria-describedby` to point to the status, and set
the `aria-busy` attribute to `true` on the region until it is finished loading.”
This is the family's own sentence: it names a region, a busy state on that
region, and a status the reader is pointed at. The family writes `aria-busy` on
`root` and holds the status in `announcement`.

**ARIA 1.2, `status` role**: an implicit `aria-live="polite"` and an implicit
`aria-atomic="true"`, and “authors SHOULD ensure an element with role `status`
does not receive focus as a result of change in status.” The announcement is a
visually-hidden `span`, never focusable, and never the target focus is moved to.

**ARIA 1.2, `aria-modal`**: “When a modal element is displayed, authors SHOULD
mark all other contents as inert.” Page scope does exactly that, through
`dismissable-layer`, and does **not** write `aria-modal`, because
`aria-modal` inherits only into `dialog` and `alertdialog` and this layer is
neither.

**HTML, `inert`** (<https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert>):
“An inert element, along with its descendants, gets removed from the tab order
and accessibility tree.” Baseline widely available since April 2023.

### Keyboard

There is no pattern table to transcribe, so the family declares its own and the
contract holds it.

| Key           | Precondition                                   | Effect                                                        | Focus destination                          |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| `Tab`         | region scope, focus in the panel               | leaves the layer for the next tabbable after the region        | the next tabbable outside `root`           |
| `Tab`         | page scope                                     | wraps inside the layer                                         | the next tabbable inside the layer         |
| `Shift+Tab`   | page scope                                     | wraps inside the layer                                         | the previous tabbable inside the layer     |
| `Escape`      | a `cancel` part exists, and focus is in the layer | asks to cancel, carrying the reason `escape`                   | unchanged; the consumer's abort ends the wait |
| `Enter`, `Space` | focus on `cancel`                            | the platform's own button activation, carrying `dismiss`        | unchanged                                  |

The covered content answers no key at all, which is the point: it is `inert`.

`Escape` is bound only when a `cancel` part is present. A key that appears to do
something and does nothing is worse than a key that is not bound, and an overlay
with nothing to cancel has nothing for the key to ask for.

---

## 3. Anatomy

Nine parts. The two that are not obvious are `content` and `announcement`, and
both exist for a reason a shorter anatomy cannot reach.

| Part           | Element         | Holds                                                                                    |
| -------------- | --------------- | ---------------------------------------------------------------------------------------- |
| `root`         | `div`           | The region. `position: relative`, `aria-busy` while blocking. Deliberately **not** the query container — §10 |
| `announcement` | `span`          | One `role="status"`, visually hidden, **always mounted**                                  |
| `content`      | `div`           | The consumer's own content. `inert` while blocking. `display: contents`                   |
| `scrim`        | `div`           | The wash, the one-cell grid that centres the panel, and the query container               |
| `panel`        | `div`           | The box the reader reads: indicator, text, control                                        |
| `indicator`    | `span`          | The mark. Default `progress-indicator`'s loader, **contained**; replaceable                |
| `label`        | `span`          | The short line — “Saving…”                                                                |
| `description`  | `span`          | The second line, for what the first cannot hold                                           |
| `cancel`       | `button`        | Asks to stop. Optional, and absent by default                                             |

### Why `content` exists, and why it is `display: contents`

The covered content has to become `inert`, and `inert` is inherited by every
flat-tree descendant with no escape but a modal `<dialog>`. So `inert` cannot go
on `root`: it would silence the announcement — an inert subtree is out of the
accessibility tree — and it would make `cancel` unpressable. It has to go on an
element that wraps the content and excludes the layer, and that element is
`content`.

A wrapper with a box would break the consumer's layout: a `root` that is a grid
would suddenly have one grid item instead of six. `display: contents` generates
no box, so the consumer's children remain `root`'s own layout children while the
element still carries the attribute. Inertness is a flat-tree property and does
not depend on the box, so the two compose.

The cost is written rather than hidden. `display: contents` means `content` can
never be painted — no ground, no padding, no border on it — and any future rule
that needs one has to reopen this decision. And a `root` that is a `table` or a
`tbody` cannot legally hold a `div`, so a family covering table internals covers
the table instead. Both are recorded here and in the stylesheet beside the rule.

### Why `announcement` is a child of `root` and not of `panel`

The scrim leaves when the wait ends, and `presence` holds it only through its
exit. An announcement inside it would be removed from the document at the exact
moment it has something to say — a live region that is deleted announces
nothing. It sits beside `content` instead, mounted for the life of the family,
which is where `skeleton`'s region already puts its own.

### Why the default mark is contained

`progress-indicator`'s `contained` is M3's 38-in-48 ratio, and this family takes
it for two reasons both found in captures rather than in reasoning.

The shape turns, and a turning box overflows the box that holds it: a square 27
pixels across sweeps a 38-pixel diagonal. Measured on the page, 2 to 9 pixels of
scrollable overflow, rising and falling on the beat of the animation — and the
panel, which was a scroll container at the time, answered with a scrollbar that
flickered for as long as the wait lasted. `contained` takes most of that out by
shrinking the shape; the panel's own padding absorbs the rest and the panel
clips rather than scrolls.

And the mark is the one thing that sits directly on the wash, in the smallest
regions, where the panel has given up its ground. On a dark scheme that reads —
the wash is near black and the accent is a light blue. On a light one it does
not. `contained` gives the mark the ground the panel gave up, at the 3:1
`progress-indicator` holds between a contained shape and its container, in every
scheme rather than in one.

The clip is written on this family's own `indicator` part and never on the mark:
another family's stylesheet is not this one's to edit.

### Page scope

`scope="page"` renders the same layer through `@slotted/core/portal`, fixed to
the viewport, and renders **no `content` part**: what is covered is the
application, which the family does not own. The blocking is
`dismissable-layer`'s in modal mode — it writes `inert` on every sibling of the
portal root and locks the document scroll — and `aria-busy` is not written at
all, because the busy region would be the document root and this family has no
claim on it.

---

## 4. State ownership

`loading` is the consumer's fact and the family never moves it. There is no
controlled/uncontrolled pair, no request for it, and therefore no `stateModel` —
the same shape `skeleton` and `progress-indicator` hold, and the same reason
`removable` and `measurement` are declared immutable in `specs/contract.schema.mjs`:
a family that moved a value it cannot know would render a reachable region while
the request was still in flight.

What the family does emit is a **cancel request**, and it is a request in the
full sense: it carries a reason and an originating event, and nothing commits
until the consumer acts.

| Request    | Reasons                | What the family does after emitting |
| ---------- | ---------------------- | ----------------------------------- |
| `onCancel` | `dismiss`, `escape`    | nothing                             |
| `onReveal` | —                      | nothing; it reports the withdrawal  |

`onReveal` reports the moment the content becomes reachable again, which is
later than `loading` turning false whenever `minDuration` is holding the layer.
It is adopted from `skeleton`, which found that an application moving focus on
the prop moved it into placeholders.

### The two moments that are not the prop

`@slotted/core/loading` decides when the layer is *painted*: `delay` before it
appears, `minDuration` holding it once it has. Both default to zero, so a family
that sets neither costs no timer.

`@slotted/core/presence` decides when the layer *leaves the DOM*: the scrim
fades on exit. The two are stacked deliberately — `painted` drives `present`,
and the exit runs after — and `inert` is released when `painted` turns false,
not when the exit ends. Holding focus out of the content for another two hundred
milliseconds after the wait is over would be the family being slower than the
data.

---

## 5. Focus

The defect none of the surveyed implementations has, because none of them makes
anything inert: making an element inert while it holds focus drops focus to the
body, and the reader who was typing loses their place.

| Moment                            | What happens                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| The layer is painted, focus inside `content` | A focus scope is created on `panel`. Focus moves to `cancel` when it exists, to `panel` itself otherwise — the `'container'` option the APG advises for content that must be read before it is operated |
| The layer is painted, focus elsewhere | Nothing moves. A background save does not steal the caret from another form                    |
| Region scope                      | `contain: false`. Only this region is blocked, so `Tab` leaves it for the rest of the page      |
| Page scope                        | `contain: true`. There is nothing else to reach                                                |
| The layer is withdrawn            | The scope is destroyed and focus returns to the element that held it, or its nearest connected ancestor when that element has since left the document |

`createFocusScope` already holds every line of that table; the family supplies
the options and the two moments.

---

## 6. Composition

| Surface                       | React                                               | Angular                                                           |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| The covered content           | `children`                                          | default `ng-content`                                               |
| A different mark              | `indicator` prop, any node                          | `ng-content select="[slLoadingOverlayIndicator]"`                  |
| A determinate wait            | `indicator={<ProgressBar value={62} />}`            | the same slot, holding `<sl-progress-bar [value]="62" />`          |
| A cancel control              | `cancel` prop, any node; the part's props are spread onto it | `ng-content select="[slLoadingOverlayCancel]"`                     |
| Any part's element            | `render` on the part                                | the projected element is the consumer's own                        |

A determinate progress is composition rather than a prop, which is the decline
recorded in the inventory. The two lines it replaces are the two lines above.

---

## 7. Cross-framework behaviour

Shared: the parts, the `data-*` vocabulary, the axes and their defaults, when
the layer is painted, when it leaves, what goes inert, where focus goes, what
`Escape` does, and the text of the announcement.

Asymmetric, and recorded rather than levelled:

- **Angular** ships an injection token and `provideLoadingOverlayDefaults()`;
  React ships a context provider and `useLoadingOverlayDefaults()`. Both set the
  same six defaults once for an application.
- **Angular** exposes the instance through `exportAs`, so a template can read
  `painted` without a signal of its own. React has no equivalent and does not
  invent one; a React consumer already holds the boolean it passed in.
- **No `ControlValueAccessor`.** The family holds no value, belongs in no form,
  and a form control that blocked its own form would be a contradiction.

---

## 8. Integration tables

`.claude/skills/component/references/frameworks.md` asks every line below to be
answered before either binding is written.

### React

| Question                                                            | Answer                                                                                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controlled and uncontrolled pair, plus a request carrying a reason  | No mutable value exists — §4. The one request is `onCancel(reason, event)`, carrying `dismiss` or `escape`                                        |
| Application-wide defaults                                           | `LoadingOverlayDefaultsProvider` and `useLoadingOverlayDefaults()`, holding `veil`, `size`, `live`, `label`, `delay`, `minDuration`               |
| Substituting the rendered element of each part                      | `render` on `root`, `scrim`, `panel`, `indicator`, `label`, `description`, `cancel`. `content` and `announcement` are fixed: one is a `display: contents` box whose element is never seen, the other is the live region and swapping its element swaps its role |
| The consumer's handler still runs                                   | The `cancel` node's own `onClick` is called before the family's request is emitted, and a `preventDefault()` on it stops the request              |
| Native element and imperative action                                | `ref` on `root`. No imperative handle: nothing here cannot be expressed by the props — the family opens nothing and focuses nothing on demand      |
| Server rendering                                                    | `useId` for the `announcement` and `label` identifiers; no layout read during render; the layer's first paint is decided by the same `loading` prop on both sides |
| Every state a consumer may style is in the DOM                      | `data-loading` on `root` and `scrim`, `data-scope`, `data-veil`, `data-size` on `root`; `cancel` is a native `button`, so `:disabled` is the platform's own |
| Each part's props type is the native element's, extended            | `ComponentPropsWithRef<'div'>`, `<'span'>`, `<'button'>`                                                                                          |

### Angular

| Question                                          | Answer                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form                  | No two-way value exists — §4. `output()` for `cancel` and `reveal`; `input()` for everything else                                              |
| Reactive Forms and template forms                 | No. The family holds no value and belongs in no form — §7                                                                                     |
| Application-wide defaults                         | `LOADING_OVERLAY_DEFAULTS_TOKEN` and `provideLoadingOverlayDefaults()`                                                                        |
| Template reaching the instance                    | `exportAs: 'slLoadingOverlay'`                                                                                                                |
| Substituting projected content, lazily            | Named `ng-content` slots for the indicator and the cancel control; the covered content is the default slot and is never re-rendered by the family |
| Zoneless and `OnPush`                             | `signal`, `computed` and `effect` throughout; `ChangeDetectionStrategy.OnPush`; no `markForCheck`                                              |
| Every subscription and listener torn down         | `DestroyRef` releases the visibility timer, the focus scope, the dismissable layer and the portal                                              |
| A static attribute the consumer wrote survives    | The family owns its own host element and adds no second directive to it, so nothing overwrites a consumer's attribute. The rule `menu` and `toolbar` record does not apply |
| An entry point others depend on stays one class   | `@slotted/angular/loading-overlay`, one component plus two marker directives for the projection slots                                          |

---

## 9. Axes and defaults

| Axis    | Values                      | Default  | Why                                                                                                           |
| ------- | --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `scope` | `region`, `page`            | `region` | The guide's own warning: “Não torna a página inteira inacessível para uma operação local.” The safer of the two is the default |
| `veil`  | `wash`, `blur`, `none`      | `wash`   | `wash` is `--slotted-scrim`. `blur` adds `backdrop-filter`. `none` blocks without dimming, for a wait short enough that a wash would read as a flash |
| `size`  | `sm`, `md`, `lg`            | `md`     | The same three steps `progress-indicator` uses, so a replaced indicator matches the default one                |
| `live`  | `polite`, `off`             | `polite` | `skeleton`'s own axis and vocabulary. `off` is for a page that already announces the wait somewhere else       |

The axis is named `scope` and the capability it declares is `placement`: the
vocabulary in `specs/contract.schema.mjs` has one word for where a family is
placed, and inventing a second for the same idea is what that file's comments
repeatedly record as the failure. The axis keeps the name a consumer reads,
because “scope” is what the guide calls it.

---

## 10. Responsiveness

**`scrim` is the query container**, named `slotted-loading-overlay`, and the
root is not. This is the opposite of the split `docs/build-briefing.md` records
and it is right for a reason that split does not cover: `container-type` applies
containment, and the root's other child is the consumer's own content. A family
that covers a box has no business changing how that box lays itself out. The
scrim is absolutely positioned to the root's padding box, so it measures the
same inline size and contains nothing but the panel.

It carries `container-type: size` rather than `inline-size`, which is what makes
a block-size condition legal. Only an element with a block size the browser can
resolve without its content may do that, and the scrim is exactly that element:
its size comes from `inset: 0`. The root could never have been — its block size
is the covered content's own.

Three arrangements, chosen by the region rather than by the consumer:

| The region                                       | The panel                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| taller than 168px                                | a **column**: mark, label, description, control, centred          |
| 168px or shorter, and wider than 260px           | a **bar**: mark, the two lines stacked beside it, control at the end |
| 220px or narrower, 88px or shorter, or short and under 260px wide | the **mark alone**, and the panel gives up its ground |

Nothing is dropped between the first two — the bar is 60 pixels tall and carries
everything the column carried. The third drops the two lines, and they are not
lost: `announcement` holds the same sentence for the one reader who was getting
it from there anyway.

The numbers are literals because a container condition cannot hold a custom
property. Each was set by a capture rather than chosen: 168 by a panel taller
than the card it was centred in, 260 by a bar at 240 pixels that broke a
sentence into two-word lines beside a control, 88 by the height of a bar plus
its own padding.

Two smaller decisions belong with them:

- **The inset is the panel's margin, not the layer's padding.** Container query
  units measure the container's content box, so padding on the scrim would make
  every `cqb` in the sheet smaller than the region it is asking about.
- **The mark is capped at `100cqb`** where the panel has given up its ground, so
  a 30-pixel table row gets a 30-pixel mark rather than one hanging over both its
  edges. Where the panel still holds a control it keeps its natural size, and the
  panel's block padding is spent down by `clamp` instead — a 30-pixel row gets a
  30-pixel pill that fits inside it.

---

## 11. Motion

| Transition                       | Token                                                 |
| -------------------------------- | ------------------------------------------------------- |
| The scrim appearing              | `--slotted-duration-medium`, `--slotted-easing-enter` |
| The scrim leaving                | `--slotted-duration-short`, `--slotted-easing-exit`   |
| The panel's own entrance         | none                                                  |

The wash fades and the panel does not move. A panel that slid or scaled would be
a dialog's entrance, and this layer is not something the reader asked for — it
arrives while they are looking at the thing it covers, and the eye should find
it, not follow it.

**Both directions are transitions**, and the scrim is in the document from the
moment the family is, which is what makes that possible. `menu` reaches for a
keyframe because its layer is mounted at the moment it opens and a transition has
no last style to start from; this layer has no reason to be mounted late. The
first capture is what settled it: a keyframe on the open rule fires on every
first paint, including a layer that was already blocking when the page loaded, so
the shutter caught a half-faded wash with the covered text reading through the
panel. A transition does not fire on an initial style, which is exactly the rule
a layer already open on first mount needs.

What the scrim does not hold at rest is its panel. `@slotted/core/presence`
mounts that, so nothing animates a mark nobody is looking at and the resting
layer holds no control for `Tab` to find.

The mark's own animation is `progress-indicator`'s and stops under reduced motion
there. The scrim's fade collapses to `1ms` through the motion scale, which is
what the theme's `prefers-reduced-motion` block does to every duration in it.

---

## 12. What a wrong answer costs

Written for the visual gate, as the skill asks.

- **The `content` wrapper.** Changing it after both bindings exist changes the
  DOM in three places and every test that asserts inertness. Now it costs the
  stylesheet.
- **Nine parts.** Removing one later is a contract break with a migration note;
  adding one is not. The anatomy is the cheapest thing to correct at the gate.
- **`loading` with no state model.** If this is wrong, the family gets a
  controlled `open` and every prop name changes. It is the single decision most
  expensive to reverse, and §4 is the argument for it.
- **The wash as the default rather than `none`.** A default is one line; every
  demonstration, capture and reference page built on it is not.
