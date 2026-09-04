# Toast capability inventory

Produced before the family was designed or read, as
`.claude/skills/component/references/capability.md` requires. The family is new.
`docs/build-order.md` lists it as item 6 of wave 5 and carries no scope
paragraph for it, so the paragraph written from this inventory lands in the same
commit.

Sources were read on 4 September 2026.

---

## 1. Surveyed

Nine implementations, chosen so they disagree: two norms, three headless
behaviour libraries, two opinionated design systems, the one library that
defined how a toast is expected to *look*, and the only surveyed answer written
for Angular.

| Implementation                | Calls it                                                                                                  | Read at                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| WAI-ARIA APG                  | Alert Pattern. There is no toast, notification or snackbar pattern.                                        | <https://www.w3.org/WAI/ARIA/apg/patterns/alert/>                                                                                              |
| WCAG 2.2                      | SC 2.2.1 Timing Adjustable (Level A), and the SC 2.2.3 / 2.2.4 the Alert pattern cites against auto-dismissal | <https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html>                                                                           |
| Radix Primitives              | `Toast.Provider/Root/Title/Description/Action/Close` plus `Toast.Viewport`                                  | <https://www.radix-ui.com/primitives/docs/components/toast>                                                                                    |
| Base UI 1.7.0                 | `Toast.Provider/Portal/Viewport/Root/Content/Title/Description/Action/Close`, plus `useToastManager`        | <https://base-ui.com/react/components/toast>                                                                                                   |
| Ark UI 5.39.1 (Zag)           | `createToaster` + `Toaster` + `Toast.Root/Title/Description/ActionTrigger/CloseTrigger`                     | <https://ark-ui.com/docs/components/toast>                                                                                                     |
| React Aria Components (alpha) | `ToastRegion/Toast/ToastContent` + `ToastQueue`                                                            | <https://react-spectrum.adobe.com/react-aria/Toast.html>                                                                                       |
| Fluent UI React v9            | `Toaster` + `Toast/ToastTitle/ToastBody/ToastFooter` + `useToastController`                                 | <https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-toast/library/src/state/types.ts>                            |
| Angular Material              | `MatSnackBar` service, `MatSnackBarRef`, `MAT_SNACK_BAR_DEFAULT_OPTIONS`                                    | <https://github.com/angular/components/blob/main/src/material/snack-bar/snack-bar.md>                                                          |
| Sonner 2.x                    | `<Toaster />` + `toast()`                                                                                   | <https://sonner.emilkowal.ski/toast>, <https://sonner.emilkowal.ski/toaster>                                                                    |

The same capability hides under four names. Radix's `Viewport` is Base UI's
`Viewport`, Ark's `Toaster`, React Aria's `ToastRegion` and Fluent's `Toaster`.
Radix's `type: 'foreground' | 'background'` is Base UI's `priority: 'high' |
'low'`, Fluent's `politeness`, and Material's `politeness` — one concept, four
spellings. Ark's `type` is Fluent's `intent` and Sonner's `toast.success` /
`toast.error`.

Four of them disagree about the one number everybody ships: Fluent's default
timeout is `3000`, Sonner's `4000`, Radix's and Base UI's `5000`, and Ark's is
"determined by the type of the toast". Angular Material has no default duration
at all and warns against setting one when the snack bar carries an action.

Two of them disagree about the one thing this family exists to do. React Aria
makes the region a **landmark** and never a live region, reachable with F6.
Fluent renders a separate imperative `AriaLive` component inside the toaster and
narrates through it. Radix does both: the visible toast carries a live role and
a hidden announcer duplicates it. Angular Material announces through an
`aria-live` region and explicitly does not move focus.

---

## 2. Table stakes

Every row is shipped by two or more of the surveyed implementations. The verdict
is this library's; a `decline` names what owns the capability instead or the
composition that replaces it.

### 2.1 The region

| Capability                                              | Who ships it                                                              | Verdict | Reason                                                                                                                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One host rendered once, holding every message           | all nine                                                                  | adopt   | It is the family's root part. A message cannot own the corner of the screen; the region does.                                                                                                                |
| Portalled to the end of the document                    | Radix, Base UI, Ark, Fluent (`mountNode`), Sonner                          | adopt   | `packages/core/src/portal`, which also mirrors `dir`, theme, scheme and density onto the layer — the defect every surveyed library has, because none of them has three schemes to lose.                       |
| Placement                                               | Ark (`placement`), Fluent (`position`), Sonner (`position`)               | adopt   | Six values, named logically: `top-start`, `top`, `top-end`, `bottom-start`, `bottom`, `bottom-end`. Sonner's `left`/`right` do not mirror in a right-to-left document; Fluent's already do.                   |
| More than one region, addressed by name                 | Fluent (`toasterId`), Sonner (`toasterId`)                                | adopt   | An application shell with a canvas and a global chrome needs two, and routing a message to one of them is one string.                                                                                         |
| A visible limit, with the rest queued                   | Base UI (`limit`, default 3), Ark (`max`, default 24), Sonner (`visibleToasts`, default 3), Fluent (`limit`) | adopt   | Three surveyed defaults out of four are 3. The queued ones wait; their timers do not start until they are visible, which is §4's answer to a stale message.                                                   |
| An offset from the edge of the viewport                 | Ark (`offsets`, `1rem`), Sonner (`offset` 32px / `mobileOffset` 16px), Fluent (`offset`) | adopt   | A component token that answers the narrow viewport, so the region never sits under a mobile browser's own chrome.                                                                                             |
| A gap between messages                                  | Ark (`gap`, 16), Sonner (`gap`, 14)                                        | adopt   | The space scale, not a number of the family's own.                                                                                                                                                           |
| Application defaults set once                           | Ark (`createToaster`), Fluent (`Toaster` props), Sonner (`Toaster` props), Material (`MAT_SNACK_BAR_DEFAULT_OPTIONS`), Base UI (`Toast.Provider`) | adopt   | A React provider with its hook, an Angular injection token with `provideToastDefaults()`. Material is the only surveyed implementation whose defaults are dependency-injected, and Angular is where that belongs. |
| A keyboard shortcut that puts focus in the region       | Radix (`F8`), Base UI (`F6`), React Aria (`F6` / `Shift+F6`), Ark (`Alt+T`), Sonner (`Alt+T`) | adopt   | Five for nine, five different keys. `F6` is the one two of them chose for the reason that generalises: it is the landmark-navigation key, and the region is a landmark. Configurable, because Radix's `F8` and Sonner's `Alt+T` are equally defensible. |
| The region is a named landmark                          | Radix (`label`, `"Notifications ({hotkey})"`), React Aria, Sonner (`containerAriaLabel`, `"Notifications"`) | adopt   | A `region` role with an accessible name, so the shortcut has somewhere to land and a reader can find it without one.                                                                                          |
| Clear every message at once                             | Ark (`toaster.dismiss()`), Fluent (`dismissAllToasts`), React Aria (`clear()`), Sonner (`toast.dismiss()`) | adopt   | A route change invalidates every message on the screen.                                                                                                                                                      |
| Pause and resume every timer imperatively               | React Aria (`pauseAll`/`resumeAll`), Fluent (`play`/`pause`)               | adopt   | The application knows things the family cannot see: a modal opened, a long upload started.                                                                                                                   |

### 2.2 The message

| Capability                                                   | Who ships it                                                                       | Verdict | Reason                                                                                                                                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An id returned on creation, used to update and to dismiss    | all nine                                                                           | adopt   | Without it a message cannot be revoked when it goes stale, which is the case React Aria's own documentation opens with.                                                                                    |
| Update a message already on screen                           | Base UI (`update`), Ark (`update`, `upsert`), Fluent (`updateToast`), Sonner (`toast(msg, {id})`) | adopt   | An upload that reaches 100% is the same message, not a second one.                                                                                                                                        |
| Deduplication by id — create or update                       | Ark (`upsert`)                                                                     | adopt   | One of nine, and `docs/component-features.md` §14 requires "política de deduplicação/limite" of this family by name. Adopted on the guide's authority rather than the field's.                              |
| A promise message: loading, then success or failure          | Base UI (`promise`), Ark (`toaster.promise`), Sonner (`toast.promise`)              | adopt   | Three for nine, and it is the one composition that a consumer writing it by hand gets wrong — the loading message has to be *updated*, not replaced, or a reader hears the sentence twice.                 |
| An auto-dismiss duration, overridable per message            | all nine except the APG, which advises against it                                  | adopt   | With the rule §2.3 states, because the APG's advice is about the message that vanishes before it is read, not about transience itself.                                                                     |
| A duration that never expires                                | Base UI (`timeout: 0`), Ark (`Infinity`), Sonner (`Infinity`), Material (no default) | adopt   | `0`, following Base UI: `Infinity` does not survive `JSON.stringify`, and a queue a consumer can own is a value that gets serialised.                                                                      |
| A dismiss control                                            | all nine                                                                           | adopt   | The `close` part. A touch reader has no Escape key, and the pointer needs a target.                                                                                                                       |
| An action that acts and then closes                          | Radix (`Action`, with `altText`), Base UI (`actionProps`), Ark (`ActionTrigger`), Material (`open(msg, action)`), Sonner (`action`) | adopt   | Five for nine. It is what makes "Message archived — Undo" a toast rather than a notice.                                                                                                                   |
| Tone: information, success, warning, failure                 | Fluent (`intent`), Ark (`type`), Base UI (`type`), Sonner (`toast.success` and friends) | adapt   | The library already speaks five tones and no family invents its own list. `loading` is not one of them: it is a state, it is already in the state vocabulary, and a message can be `accent` *and* loading. |
| A mark per tone                                              | Fluent, Sonner (`icons`), Ark (recipe)                                             | adopt   | The glyph tokens `alert` and `status-indicator` already share, so a toast about a failure draws the same silhouette as the alert about it. WCAG 2.2 SC 1.4.1, and the only thing left under forced colours. |
| Announcement politeness, separate from tone                  | Radix (`type: foreground \| background`), Base UI (`priority: high \| low`), Fluent (`politeness`), Material (`politeness`) | adopt   | Four for nine, and the four agree that the loudness of the announcement is not the colour of the box. A `danger` toast a background job produced must not interrupt a sentence.                            |
| A lifecycle callback                                         | Ark (`onStatusChange`), Fluent (`onStatusChange`), Base UI (`onClose`, `onRemove`), Material (`afterDismissed`, `onAction`), React Aria (`onClose`) | adopt   | One request carrying a reason, which is this repository's shape, plus the status the exit animation reports.                                                                                              |
| Pause on hover                                               | Radix, Base UI, Ark, Sonner, Fluent (`pauseOnHover`, default `false`)               | adopt   | Default on. Fluent is the only one that defaults it off, and a message that expires under the pointer that came to read it is the defect this exists to prevent.                                           |
| Pause while the tab is hidden                                | Fluent (`pauseOnWindowBlur`), Ark (`pauseOnPageIdle`), Sonner (`pauseWhenPageIsHidden`) | adopt   | Three for nine. A five-second message shown to a tab nobody is looking at was never shown.                                                                                                                |
| Pause while focus is inside the message                      | Radix, Base UI, React Aria                                                          | adopt   | A message that removes the button the keyboard is on drops the focus, and WCAG 2.2 SC 2.2.1 is the reason it must not.                                                                                     |
| Resume on the time that was left, not from the start         | Radix, Base UI, Fluent                                                              | adopt   | Restarting turns a hover into an extension, which is a different feature nobody asked for.                                                                                                                |
| Stay mounted through the exit animation                      | Radix, Base UI (`transitionStatus`), Ark (`removeDelay`, 200)                        | adopt   | `packages/core/src/presence`, which also completes an exit the browser never reports.                                                                                                                     |
| Swipe to dismiss                                             | Radix (`swipeDirection`, `swipeThreshold` 50), Base UI (`swipeDirection`, `['down','right']`), Sonner (`swipeDirections`) | adopt   | Three for nine. On touch it is the gesture the platform trained the reader to expect, and the alternative is a 24-pixel target at the corner of a moving box.                                              |
| Custom content in place of title and description             | Material (`openFromComponent`), Sonner (`custom`, `headless`), Ark (render prop), Base UI (children) | adopt   | The parts are the answer in React; a projected template is the answer in Angular. Material's `MAT_SNACK_BAR_DATA` is the shape Angular consumers already know.                                            |
| State attributes for styling                                 | Radix, Base UI (`data-expanded`, `data-limited`, `data-swiping`), Ark               | adopt   | The `data-*` vocabulary `specs/contract.schema.mjs` declares, plus the runtime custom properties named in §3.                                                                                             |
| A collapsed stack that expands on hover                      | Sonner (`expand`, `visibleToasts`), Base UI (`data-expanded`, `--toast-index`)      | adapt   | Two for nine, and it is what makes a run of four messages readable instead of a wall. Adapted: see §3, and the cost is written there.                                                                     |

### 2.3 Timing, and the rule the field does not enforce

Angular Material is alone in stating it, and it is the only guidance in the
field that follows from a WCAG criterion rather than from taste:

> Avoid setting a `duration` for snackbars that have an action available, as
> screen reader users may want to navigate to the snackbar element to activate
> the action.

The APG's Alert pattern says the same thing from the other side — "it is also
important to avoid designing alerts that disappear automatically" — and cites SC
2.2.3 and SC 2.2.4.

**Adopted as a default rather than as advice.** A message that carries an action
does not expire unless the consumer states a duration for it. No surveyed
implementation does this; five of them ship the action and the timer and leave
the combination to the consumer.

WCAG 2.2 SC 2.2.1 offers six ways out, and the family takes the first: the
application turns the time limit off before the reader meets it, in one place,
by setting `duration: 0` on the defaults provider. The family provides the
switch; exposing it to the reader is the application's, and the reference pages
say so rather than implying the family has discharged the criterion.

### 2.4 Declined

| Capability                          | Who ships it                              | Verdict                    | Reason                                                                                                                                                                                                                                     |
| ----------------------------------- | ----------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A secondary "cancel" control        | Sonner (`cancel`)                         | decline — composition      | One of nine. The `actions` part takes the consumer's own buttons, so a second control is `<Button variant="ghost" onClick={close}>Cancel</Button>` inside it. A named slot for one of the two buttons would privilege one arrangement.        |
| Anchored toasts positioned to an element | Base UI (`Toast.Positioner`, `Toast.Arrow`) | decline — defer to `popover` | One of nine. A message pinned to a control is a popover with a timer; `popover` shipped in this wave with the positioner, the arrow and the collision handling, and a second family drawing an arrow would be two answers to one question. |
| Only one message on screen at a time | Angular Material                          | decline                     | One of nine, and it is a policy rather than a capability: `limit: 1` produces it, and the guide asks for "ordem e tempo previsíveis" rather than for a queue of one.                                                                        |
| A visible live role on the message  | Radix, Ark, Fluent (on the visible node)  | decline — see §3           | The reading is duplicated and the controls inside the region are read with it. The replacement is `packages/core/src/live-announcer`, and the cost is written in §3.                                                                        |
| Rich colours as a global switch     | Sonner (`richColors`)                     | decline — it is an axis    | `variant` already decides how a tone is painted, on the message and per message, which is where an application that wants a solid `danger` and a quiet `success` needs it.                                                                  |
| `toast.custom` / `headless`         | Sonner                                    | decline — composition      | The family renders the parts a consumer arranges. A message that draws none of them is the `content` part with the consumer's own node in it, and there is nothing left for a second API to add.                                            |

---

## 3. Differentiators

What the best of the field offers that the others do not, and what this library
can offer because of what it already owns.

| Differentiator                                                                                       | Where it comes from                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One announcement, deduplicated and spaced.**                                                       | Fluent is the only surveyed implementation that narrates through a separate imperative region; the others make the visible node live, so a reader hears the message and then the labels of the two buttons in it. `packages/core/src/live-announcer` already builds its regions before the first message, alternates two nodes so a repeat is heard, and spaces two announcements by `ANNOUNCE_GAP`. Four messages arriving together are four sentences here and one lost sentence everywhere else. |
| **Three colour schemes, forced colours, and three densities on a floating surface.**                 | No surveyed implementation has more than a light and a dark theme. A toast is the one surface that floats over content the family does not own, so `high-contrast` and `forced-colors` decide whether it is a box at all.                                                                                                                                |
| **A placement that mirrors.**                                                                        | Sonner's `bottom-right` is `bottom-right` in Arabic. The axis is `bottom-end`, resolved with logical properties, and the right-to-left capture is what proves it.                                                                                                                                                                                       |
| **A timer and its picture that cannot disagree.**                                                    | The pause conditions are hover, focus inside, and a hidden document; the third is invisible to CSS. The family writes one runtime custom property, `--slotted-toast-play-state`, and the remaining-time bar reads it — so the bar is frozen exactly when the timer is, rather than approximately.                                                          |
| **An action suspends the timer by default.**                                                         | §2.3. Five surveyed implementations ship both and leave the combination to the consumer.                                                                                                                                                                                                                                                                |
| **Two first-class bindings.**                                                                        | Every surveyed implementation but Angular Material ships React alone, and Angular Material ships no React. Here the store is framework-free in `packages/core/src/toast`, React reads it with `useSyncExternalStore`, and Angular exposes it as a root-provided service whose reads are signals.                                                          |
| **The collapsed stack, adapted so it needs no measurement.**                                         | Sonner and Base UI both measure every message's height and write it back as a custom property. Here the collapsed messages share one anchor at the region's own edge and step back by a token distance and a scale, so the picture is the same and there is no `ResizeObserver` in the family, no reflow per message, and nothing to be wrong on the first frame. The cost: messages of different heights align on the anchored edge rather than on both, which is visible only while collapsed and is what the expand-on-hover exists to resolve. |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap                                                                                              | The answer this family ships                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **The message that expired while it was queued.** Ark queues past `max` and Base UI marks the overflow `limited`; in both, a message can be created, wait behind three others, and be shown after the thing it is about has changed. | A queued message has no timer. The duration starts when it becomes visible, which is the only reading of "five seconds" a reader can check.                                                                                                                                                        |
| **The tab that was hidden the whole time.** Pausing while hidden is right, and it means that a reader returning after ten minutes meets every message at once.                                                                    | The pause is kept, and the region still shows `limit` at a time. What changes is the announcement: the announcer is asked for the newest message only, because a screen reader reading four is four sentences about a screen the reader has not looked at yet.                                     |
| **The keyboard that was inside the message when it left.** Only React Aria answers it, and only for its own close control.                                                                                                          | Focus never expires with a message: a message holding focus does not run its timer. When one is removed by its own action, `packages/core/src/focus/removal-focus` moves focus to the next message, and to where it came from when there is no next.                                                |
| **A message longer than the box.** A deployment id, a container digest, a translated string half again as long.                                                                                                                     | The rule `alert` settled: `overflow-wrap: break-word` on the description, `minmax(0, 1fr)` on the text column, and nothing removed from the DOM. The region is capped by a measure token and never by the viewport alone.                                                                          |
| **A hostile string.** Every surveyed React implementation takes a `ReactNode`, so the escaping is the consumer's.                                                                                                                   | The announcement is written with `textContent` by the announcer, which has no HTML path into the region. The visible text is the framework's own escaping, which is the platform's answer rather than the family's.                                                                                |
| **The reader at 200% zoom on a 320-pixel viewport.** A fixed region with a fixed width is off the screen.                                                                                                                            | The region's inline size is `min(100vw - 2 × offset, measure)`, its offset steps down under a container query, and the 240-pixel capture is the check.                                                                                                                                            |
| **Reduced motion.** Sonner and Base UI both animate the stack with transforms and neither stops.                                                                                                                                     | Durations come from the motion scale, which the theme collapses under `prefers-reduced-motion`. The remaining-time bar is a finite animation, so it is allowed to keep running; nothing in the family loops.                                                                                       |
| **Server rendering.** Material and React Aria both keep the queue outside the component tree, which is right and says nothing about the first paint.                                                                                 | The region renders empty on the server and mounts nothing until a message exists. No identifier is generated during render, and the portal asks for a container that does not exist yet and is told so.                                                                                           |

---

## 5. What the PRD and the guide add

`PROJECT-PRD.md` §20 lists toasts among the overlay concepts that must share one
strategy, and §20.1 names stacking, z-index, portals, overlay containers, focus
restoration and viewport boundaries. Every one of those is answered by composing
`packages/core` rather than by anything written here: `portal` for the container
and the theme, `presence` for the exit, `--slotted-z-index-toast` for the layer,
`focus/removal-focus` for the keyboard. §21 asks for container queries where the
component depends on the space available, which is what the region's narrow
breakpoint is. §22 and §23 are answered in §4 above.

`docs/component-features.md` §14 asks for six things by name: `id`, `tone`,
`title`, `description`, actions, `duration`, `dismissible`, `placement`, and a
deduplication and limit policy; a pause on hover, focus and an inactive
document; predictable order and timing; an action that stays focusable without
making the message disappear while it is in use; and — the sentence that decides
the shape — "serviço imperativo é fachada conveniente; também deve existir host
declarativo e modelo observável". Three surfaces over one store, and the store
is the model.

§3 of the same guide says the announcer "não vira API de toast". It does not:
the announcer stays a message channel with priority, deduplication and
clearing, and this family composes it. Nothing about toasts enters
`packages/core/src/live-announcer`.
