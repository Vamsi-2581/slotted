# Toast design

The decisions taken for the `toast` family, from the inventory in
`docs/superpowers/specs/2026-09-04-toast-capability-inventory.md`. It is a new
family: item 6 of wave 5 in `docs/build-order.md`, whose scope paragraph is
written from this document in the same commit.

---

## 1. The pattern, item by item

There is no toast, notification or snackbar pattern in the WAI-ARIA Authoring
Practices. The closest official guidance is the **Alert Pattern**,
<https://www.w3.org/WAI/ARIA/apg/patterns/alert/>, read on 4 September 2026.

| The pattern says                                                                                    | This family                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "The widget has a role of `alert`."                                                                   | **Deliberate departure.** The visible message is not an `alert`; see §2. The announcement carries the urgency the role would have carried.                                                                              |
| "Keyboard Interaction: Not applicable."                                                               | Departure with the same cause: a message with an Undo control needs the keyboard. §6 is the keyboard table the pattern does not have.                                                                                  |
| "It is crucial they do not affect keyboard focus."                                                    | **Adopted without exception.** A message arriving never moves focus. The only thing that moves focus is the reader pressing `F6`, or a message that held focus being removed by its own control.                        |
| "Avoid designing alerts that disappear automatically" (citing SC 2.2.3 and SC 2.2.4).                 | Adopted as far as a transient family can: §5. A message carrying an action never expires on its own, an application turns expiry off in one place, and the announcement is not tied to how long the box stays on screen. |
| "Screen readers do not inform users of alerts that are present on the page before page load completes." | The region is empty at first paint and the announcer's regions are built before any message exists, which is the ARIA 1.2 §6.4 requirement `packages/core/src/live-announcer` was written for.                          |

WCAG 2.2 SC 2.2.1 Timing Adjustable is the criterion the timer answers, and §5
records which of its six ways out this family takes.

---

## 2. The announcement, and why the visible message is not a live region

Radix, Ark and Fluent all put a live role on the visible node. MDN's `alert`
role reference states that the role "should only be used for text content, not
interactive elements such as links or buttons", and a toast worth shipping has a
close control and often an Undo. `alert` in this library already settled the
same question by making a text-only `content` part the live region and leaving
the controls outside it.

That answer does not transfer here. An alert's element exists before its text
changes; a toast's element is created and filled in the same task, and ARIA 1.2
§6.4 requires the region to be in the accessibility tree first. A fresh live
region per message is the case `packages/core/src/live-announcer` exists to
prevent.

**Decision.** The region is a landmark and nothing else: `role="region"` by way
of a named `section`. Announcement goes through the shared announcer, at the
politeness the message declares. Nothing in the family writes `aria-live`.

The cost, written rather than hidden:

- A reader hears the message once, from a node they cannot navigate to, and then
  finds the same words in the region by pressing `F6`. In Radix's model they
  hear it in place and can leave focus where it is. The reason to prefer this
  one is that Radix's reader also hears "Close, button" and "Undo, button" as
  part of the sentence.
- The announcement is a string. A message whose content is a component the
  consumer wrote announces the text of its title and description, and nothing
  else; a message that renders only custom content announces what the consumer
  passes as `announcement`, and nothing at all if they pass nothing. That is
  stated on both reference pages.

---

## 3. Where the work lives

Three layers, and the guide's sentence — "serviço imperativo é fachada
conveniente; também deve existir host declarativo e modelo observável" — is what
decides the split.

**`packages/core/src/toast`** — the model, framework-free and the only place the
rules live: the ordered queue, the visible window and what waits behind it,
identifiers, deduplication by id, timers with pause and resume on remaining
time, the three pause conditions, the promise lifecycle, and the request that
carries a reason. It subscribes in the shape `useSyncExternalStore` and an
Angular signal both read: `subscribe(listener)` plus a `snapshot` getter.

It imports nothing else from `packages/core`. `presence`, `portal`,
`live-announcer` and `focus/removal-focus` are composed by the bindings, which
is the rule the overlay infrastructure was delivered under.

**The bindings** — React reads the store with `useSyncExternalStore` and
renders; Angular wraps it in a root-provided `SlToastService` whose reads are
signals and whose writes are the same store methods.

**The stylesheet** — one authored file, as every family.

---

## 4. Anatomy

Ten parts. The root is the **region**, not a message: a message cannot own the
corner of the screen, and the family's job begins with the place the messages
go.

| Part          | Element   | Always present | What it is                                                                                                |
| ------------- | --------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| `root`        | `section` | yes            | The region. Named, focusable by `F6`, fixed against the viewport, carrying the container query.            |
| `list`        | `ol`      | yes            | The order the messages are in. A separate element because `container-type` on the root does not answer itself — the decision `docs/build-briefing.md` records for `stepper` and `description-list`. |
| `item`        | `li`      | one per message | One message: the tone, the variant, the states, the swipe.                                                |
| `icon`        | `span`    | no             | The tone's mark, a mask from a glyph token, or the consumer's own node.                                   |
| `content`     | `div`     | yes            | Title and description, and the column that is allowed to shrink.                                          |
| `title`       | `div`     | no             | The message's name. A `div`, not a heading: a transient message is not part of the document outline.      |
| `description` | `p`       | no             | The message.                                                                                              |
| `actions`     | `div`     | no             | The consumer's own buttons, outside the text.                                                             |
| `close`       | `button`  | no             | Puts the message away. Rendered when `dismissible`, which defaults to `true`.                             |
| `progress`    | `div`     | no             | How much of the duration is left. Rendered when the message expires and `progress` is on.                 |

The consumer's Undo is a `Button` inside `actions`; the family does not own what
a button is. Sonner's `cancel` slot is the same element by another name, which
is why the inventory declines it.

---

## 5. Timing

**Resolution of a message's duration**, first that answers:

1. the message's own `duration`;
2. `0` — never expires — when the message carries an action and states no
   duration of its own. Angular Material's guidance, applied rather than quoted;
3. `0` when the message is `loading`, which is the state a promise starts in;
4. the defaults provider's `duration`;
5. `5000`, which is Radix's and Base UI's default and the floor React Aria's own
   documentation recommends.

**`0` means never.** Not `Infinity`: a queue a consumer can own is a value that
gets serialised, and `Infinity` does not survive `JSON.stringify`. Base UI's
choice, for a reason Base UI does not have.

**The timer starts when the message becomes visible**, never when it is created.
A message waiting behind the limit has no timer, so "five seconds" is five
seconds of being on screen.

**Three pause conditions**, and the timer resumes on the time that was left:

- the pointer is over the region — `pauseOnHover`, default on;
- focus is inside the region — not an axis. Turning it off would expire the
  message under the keyboard that is using it, and SC 2.2.1 is the reason;
- the document is hidden — `pauseWhenHidden`, default on, through the Page
  Visibility API.

The three are resolved in script, and the result is written as one runtime
custom property so the remaining-time bar cannot disagree with the timer. See
§9.

**Coming back to a hidden tab.** Every timer resumes, the region still shows
`limit` messages, and the announcer is asked for the newest one only. Four
sentences about a screen the reader has not looked at yet is worse than one.

**SC 2.2.1.** The family takes the criterion's first way out — the time limit
can be turned off before it is encountered — by making `duration: 0` settable
once, on the defaults provider, for the whole application. Exposing that switch
to the reader is the application's work, and both reference pages say so instead
of implying the family has discharged the criterion on its own.

---

## 6. Keyboard

| Key           | Precondition           | Effect                                                          | Focus lands on                                    | Source   |
| ------------- | ---------------------- | --------------------------------------------------------------- | ------------------------------------------------- | -------- |
| `F6`          | at least one message   | Moves focus into the region                                      | the newest message's element                      | family   |
| `Tab`         | focus inside a message | Moves to the next control in the region, then out of it          | the next focusable element                        | platform |
| `Shift+Tab`   | focus inside a message | Moves to the previous control                                    | the previous focusable element                    | platform |
| `Escape`      | focus inside a message | Closes that message, with the reason `escape`                    | where focus was before `F6`, or the next message  | family   |
| `Enter`       | focus on a control     | Activates it                                                     | unchanged, or per the rule below                  | platform |
| `Space`       | focus on a control     | Activates it                                                     | unchanged, or per the rule below                  | platform |

The hotkey is an axis, because the field's five implementations chose five
different keys. `F6` is the default for the reason two of them give: it is the
landmark-navigation key and the region is a landmark.

**When a message that holds focus is removed** — by its own close control, or by
its action — focus moves to the next message, and to the element focus came from
when there is none. `packages/core/src/focus/removal-focus` already answers
exactly this and is composed rather than reimplemented.

A message never expires while it holds focus, so the timer can never cause this.

---

## 7. Placement, attachment and stacking

**`placement`** — six values, named logically: `top-start`, `top`, `top-end`,
`bottom-start`, `bottom`, `bottom-end`. Default `bottom-end`. Resolved with
logical properties, so a right-to-left document mirrors the region and the
capture proves it. Sonner's `bottom-right` is `bottom-right` in Arabic.

**`attach`** — one axis with three values rather than two booleans that admit a
meaningless combination, which is the shape `collapsible` settled and `tooltip`
reused:

| Value    | What it does                                                                                 |
| -------- | -------------------------------------------------------------------------------------------- |
| `portal` | Fixed against the viewport, rendered at the end of the document. The default.                |
| `viewport` | Fixed against the viewport, rendered where it is written. For a shell that owns its own stacking context. |
| `inline` | Absolute against the nearest positioned ancestor. For a region that belongs to one panel — and it is what makes the family demonstrable on a documentation page. |

Fluent is the one surveyed implementation with the third; it calls it `inline`.

**`stacking`** — `list` (default) or `stack`.

`list` is what Radix, Ark, Fluent and Material draw: every message at its full
height, separated by the gap.

`stack` is Sonner's and Base UI's: the messages share one anchor and the ones
behind step back by a distance and a scale, and the whole stack expands when the
pointer is over the region or focus is inside it.

Closed, the messages are positioned against the region's own edge — the edge
`placement` already names — and step back by a token distance and a scale
computed from `--slotted-toast-index`. Open, each one returns to its own height
and its own place in the column. Both states are positioned, so one becomes the
other by a translate, a scale and a height rather than by a snap.

**It measures, and the first draft did not.** The claim was that the same
picture could be had from arithmetic alone: it can, while the pile is closed,
and opening it then jumps, because a column of messages that are not all the
same height cannot be laid out without their heights. Three measurements buy
it — `--slotted-toast-height` per message, `--slotted-toast-front-height` for
the one at the edge, and `--slotted-toast-stack-offset` for the room the
messages in front of it take. The cost is one `ResizeObserver` per region, and
it is written in the contract rather than discovered by the next family.

**Swipe.** Default on. The direction follows `placement`: a region at the block
end swipes down, one at the block start swipes up, and both swipe toward the
inline edge they sit on. The threshold is a token. A swipe on a control inside
the message never starts, because the control is what the pointer came for.

**Pointer events.** The region takes none and the messages take their own, so a
region pinned over a page's content never eats a press meant for the page.

---

## 8. State, and two additions to the shared vocabulary

The family holds one mutable value: **the ordered queue of messages**. Every
other axis is a fact the consumer states.

Two words the vocabulary does not have, both added in their own commit before
the family, as `docs/build-briefing.md` requires of a shared tool that cannot
express the right contract:

**`queue`, a capability.** `specs/contract.schema.mjs` knows `value`,
`selection`, `files` and seven more, and none of them is a collection the
component both holds and expires on its own. `files` is the closest — a list the
component holds — and it is a list the reader chose. Filing this under `content`
would say the queue is not mutable, which is the one thing it is.

**`timeout`, a change reason.** The vocabulary has eleven reasons and not one of
them says *the time this was given ran out*. `dismiss` is the reader pressing
the control, `programmatic` is the application asking, and a consumer who has to
tell an expiry from a dismissal by elimination writes the wrong handler — which
is the failure `docs/state-and-events.md` opens with. `toast` is the first
family in the library with a timer; `alert`'s optional auto-dismissal and any
later family with one will read the same word.

The state model:

```json
"queue": {
  "controlled": "toasts",
  "uncontrolled": "defaultToasts",
  "request": "onToastsChange",
  "reasons": ["programmatic", "dismiss", "escape", "keyboard", "pointer", "timeout", "clear"]
}
```

Controlled means the consumer holds the array — an application whose
notifications live in a store of its own renders the region from it and the
family asks. Uncontrolled means the family's own store holds it, which is what
the imperative facade writes to. The mode is decided once, by whether `toasts`
is present, and `@slotted/core/state` is what holds both so the two bindings
cannot disagree.

`pointer` is in the list because a swipe is a dismissal by pointer and not by
the control.

---

## 9. Runtime custom properties

Values a stylesheet needs and only script can produce, under names that say so,
registered in `packages/styles/src/runtime-properties.mjs` beside the
positioner's:

| Property                     | Written by       | What it is                                                                    |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `--slotted-toast-index`        | the message | How far it is from the front of the stack. `0` is the frontmost.               |
| `--slotted-toast-count`        | the region  | How many messages are visible, so one rule serves any depth.                   |
| `--slotted-toast-duration`     | the message | The time this message was given, which the remaining-time bar runs for.        |
| `--slotted-toast-height`       | the message | Its own measured height, which is what it returns to when the pile opens.      |
| `--slotted-toast-front-height` | the region  | The frontmost message's height, which is what the pile is while it is closed.  |
| `--slotted-toast-stack-offset` | the message | The room the messages in front of it take, gaps included.                      |
| `--slotted-toast-play-state`   | the region  | `running` or `paused`, resolved from all three pause conditions at once.       |
| `--slotted-toast-swipe-x`      | the message | How far the pointer has taken it, along the inline axis.                       |
| `--slotted-toast-swipe-y`      | the message | The same along the block axis.                                                 |

None of them is a design token: no theme can answer "how far has the pointer
dragged this", and a reference page that printed them under theme-owned
decisions would send a consumer looking for a value no theme can hold.

---

## 10. Tokens and geometry

Component tokens, each reaching a foundation token:

- `--slotted-toast-measure` — the region's greatest inline size, `24rem`. A
  message has to be wide enough for a sentence and narrow enough not to be a
  dialog.
- `--slotted-toast-offset` — the distance from the viewport's edge,
  `var(--slotted-space-6)`, stepping down to `var(--slotted-space-4)` under the
  narrow container query.
- `--slotted-toast-gap` — between two messages, `var(--slotted-space-4)`.
- `--slotted-toast-stack-step` — how far a collapsed message steps back,
  `var(--slotted-space-3)`.
- padding, radius, border width, shadow, the close control's size and the
  progress bar's thickness, in the shape `alert` already declares them, so an
  application that retunes one family's inset finds the same name here.

Type and glyph come from the control scales — the only ones the theme restates
per density — so a toast inside a dense application shrinks with it. The
region's own inset comes from the space scale, which does not, and that is the
cost `card` and `alert` both accepted and recorded.

The elevation is `--slotted-shadow-lg`: the region floats over content the
family does not own, and it is the only surface in the library that has to read
as lifted off an unknown ground.

The three variants are `raised` (the neutral raised surface with the tone in the
mark and the edge — the default, because a message that floats over arbitrary
content should not tint it), `soft` (the tone's own surface, `alert`'s default)
and `solid` (the tone's fill). The five tones are the theme's five, and each
carries the glyph `alert` and `status-indicator` already share.

---

## 11. React integration

Every line of `references/frameworks.md` answered.

| Question                                                                    | Answer                                                                                                                                                             |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason           | yes — `toasts` / `defaultToasts` / `onToastsChange(toasts, request)` on `ToastRegion`, with `createControllable` under it.                                          |
| Application defaults set once                                               | yes — `ToastDefaultsProvider` and `useToastDefaults`, holding placement, attach, limit, duration, stacking, swipe, hotkey, the region's label and the close label.  |
| Substituting the rendered element of each public part                       | yes — `render` on `ToastRegion`, `ToastList`, `Toast`, `ToastContent`, `ToastTitle`, `ToastDescription`, `ToastActions`, `ToastClose`.                              |
| The consumer's own handler still runs                                       | yes — composed, never replaced: `onClick` on the close control runs before the family's, and `event.preventDefault()` refuses the dismissal.                        |
| The native element, and the imperative action                               | yes — `ref` on every part, and the store itself is the imperative surface: `toast.show`, `.update`, `.dismiss`, `.clear`, `.pauseAll`, `.resumeAll`, `.promise`.    |
| Server rendering without a hydration mismatch                               | yes — identifiers come from the store's own counter, created on the client; the region renders empty on the server and reads no layout during render.               |
| Every state a consumer may style is in the DOM                              | yes — `data-open`, `data-loading`, `data-tone`, `data-variant`, `data-placement`, `data-stacking`, `data-swiping`, plus the runtime properties of §9.               |
| Each part's props type is the native element's, extended                    | yes — `ComponentPropsWithRef<'section' \| 'ol' \| 'li' \| 'div' \| 'p' \| 'button'>` per part.                                                                      |

## 12. Angular integration

| Question                                                    | Answer                                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form the ecosystem expects      | yes — `[toasts]` as an `input`, `(toastsChange)` as an `output` carrying the full `ChangeRequest`. No `[(toasts)]`: a two-way binding has one slot and cannot carry the reason, the previous value or `cancel()` — the shape `alert` settled. |
| Reactive Forms                                              | no — a transient message is not a form control and holds no value to write back.                                                                             |
| Application defaults set once                               | yes — `TOAST_DEFAULTS` and `provideToastDefaults()`, and `SlToastService` is `providedIn: 'root'`, which is the surface Angular Material's consumers already know. |
| A template can reach the instance                           | yes — `exportAs: 'slToastRegion'`.                                                                                                                           |
| Projected content, kept lazy                                | yes — `<ng-template slToastContent let-toast>` rendered through `NgTemplateOutlet`, which is what re-renders per message; the default template is used when none is projected. `MAT_SNACK_BAR_DATA`'s equivalent is the template's own context. |
| Zoneless and `OnPush`                                       | yes — the store's snapshot is read into a signal, and nothing calls `markForCheck`.                                                                           |
| Every subscription torn down                                | yes — `DestroyRef` unsubscribes the store, the visibility listener and the hotkey listener.                                                                   |
| A static attribute the consumer wrote survives              | yes — `HostAttributeToken` for `tabindex` and `aria-label` on the region, as `alert` does for `tabindex`.                                                     |
| An entry point others depend on stays one class             | yes — `@slotted/angular/toast` exports the region, the parts, the service, the token and the types.                                                          |

The asymmetry, recorded rather than levelled: Angular's imperative surface is an
injectable service and React's is a module-level store with a hook. Both wrap
the same object; neither is made to look like the other.

---

## 13. What this family does not hold

- **A message anchored to an element** — `popover`, this wave. Base UI ships it
  on its toast; a message pinned to a control is a popover with a timer, and a
  second family drawing an arrow would be two answers to one question.
- **A modal interruption** — `alert-dialog`, this wave. The APG names it for the
  case where interrupting the reader is necessary.
- **A message that stays on the page** — `alert`, wave 4. A toast is transient
  by definition; a message the reader must be able to come back to is an alert
  in the layout.
- **A message beside a field** — `inline-message`, wave 4.
- **The announcer itself** — `packages/core/src/live-announcer`, wave 5.
  `docs/component-features.md` §3 says it does not become a toast API, and
  nothing about toasts is added to it.

---

## 14. Contract break

None. The family is new. The two vocabulary additions in §8 are additive: no
existing contract, family or test changes meaning, and a family that declares
neither is unaffected.
