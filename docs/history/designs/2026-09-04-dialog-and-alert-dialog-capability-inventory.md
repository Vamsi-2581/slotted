# Dialog and Alert Dialog capability inventory

Produced before the families were designed or written, as
`.claude/skills/component/references/capability.md` requires. Both families are
new: nothing exists under `specs/components/dialog`, `specs/components/alert-dialog`,
`packages/styles/src/dialog` or `packages/styles/src/alert-dialog`, so there is
no prior implementation to read and no delta to name.

`docs/process/build-order.md` wave 5 item 3 is the scope paragraph, and it is one
sentence: the pair "traz para `packages/core/src/focus` a contenção de foco e a
restauração ao gatilho, com teste próprio, antes das partes da família". That is
a floor. `docs/component-features.md` §8 adds the anatomy — Overlay, Content,
Title, Description, Body, Footer, Close — the cancellable close policy for
`closeButton`, `escape`, `outsidePress` and `programmatic`, and the two rules
that separate Alert Dialog from Dialog.

Sources were read on 4 September 2026.

---

## 1. Surveyed

| Implementation                       | Called                                                                             | Read at                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| HTML Standard, via MDN               | `<dialog>`, with `showModal()`, `::backdrop`, `closedby`, `returnValue`             | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog> |
| WAI-ARIA Authoring Practices         | Dialog (Modal) Pattern, and Alert and Message Dialogs Pattern                       | <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>, <https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/> |
| Radix Primitives                     | `Dialog`, and `AlertDialog` as a second family                                      | <https://www.radix-ui.com/primitives/docs/components/dialog>                 |
| Base UI 1.7                          | `Dialog`, with `AlertDialog` as a second family and `Drawer` as a third             | <https://base-ui.com/react/components/dialog>                               |
| Ark UI 5.39.1 (Zag)                  | `Dialog`, with `role="alertdialog"` as a prop rather than a family                  | <https://ark-ui.com/docs/components/dialog>                                 |
| React Aria Components                | `Modal` + `ModalOverlay` + `Dialog` + `DialogTrigger`, four names for one family    | <https://react-spectrum.adobe.com/react-aria/Dialog.html>                    |
| Angular Material / CDK               | `MatDialog` service, `MatDialogRef`, `MatDialogConfig`; `cdk-dialog` underneath     | `src/material/dialog/dialog.md` and `goldens/material/dialog/index.api.md`   |

The set disagrees on four things, and each disagreement is a decision this pair
has to take rather than inherit.

**Whether the platform element is used.** Nobody in the set uses `<dialog>`.
Every one of the five libraries renders a `div` with `role="dialog"` into a
portal. The platform ships the top layer, `::backdrop`, browser-enforced tab
containment, browser-enforced inertness, Escape as a cancellable `cancel` event,
`returnValue`, and — where `closedby` has landed — light dismiss. Declining all
of that is the largest single decision in this inventory, and §2 carries it with
its cost.

**Whether an alert dialog is a family or a prop.** Radix and Base UI ship a
second family; Ark ships `role="alertdialog"` on the same machine; React Aria
ships `role` on `Dialog`. The invocation names a pair, and §2 records why the
two rules that differ — the dismissal policy and the initial focus target — are
defaults of a family rather than values a consumer remembers to set.

**Where the scroll lives.** Radix and React Aria leave it entirely to the
consumer's CSS. Base UI added a `Viewport` part for it. Ark documents "inside
scroll" and "outside scroll" as two recipes. Material bounds the panel with
`maxHeight` and gives the content its own scroll. `docs/component-features.md`
§8 decides the default — "conteúdo longo rola no body, não perde footer" — and
leaves the other case to be named.

**Whether opening is declarative or imperative.** Four of the five are
declarative and portal-based; Angular Material is a service that instantiates a
component and hands back a `MatDialogRef` with `afterClosed()`. The two are not
the same capability, and §2 names which one this library ships and what replaces
the other.

---

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability                                            | Who ships it                                                       | Verdict            | Reason                                                                                                                                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled open state                | Radix, Base UI, Ark, React Aria, Material                          | adopt              | `open` / `defaultOpen` / `onOpenChange`, through `@slotted/core/state`, as `docs/state-and-events.md` requires of every mutable value.                                                                                                             |
| Trigger part, wired to the layer it opens             | Radix, Base UI, Ark, React Aria                                    | adopt              | `trigger` carries `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`, and is the branch `dismissable-layer` must not treat as outside.                                                                                                  |
| Portal, with a consumer-named container               | Radix (`container`), Base UI, Ark, Material (overlay container)    | adopt              | `@slotted/core/portal`, which additionally mirrors the theme region — see §3.                                                                                                                                                                     |
| Backdrop part                                          | Radix `Overlay`, Base UI `Backdrop`, Ark `Backdrop`, React Aria `ModalOverlay` | adopt   | `backdrop`, painted from `--slotted-scrim`, which the theme already declares per scheme and remaps under forced colours.                                                                                                                           |
| Modal and non-modal                                    | Radix `modal`, Ark `modal`, Material `hasBackdrop`                 | adopt              | `modal` axis. Non-modal writes no `aria-modal`, contains no focus, locks no scroll and inerts nothing, which is the only honest reading of the APG note about marking a dialog modal.                                                              |
| Focus containment while modal                          | Radix, Base UI, Ark, React Aria, Material (`cdkTrapFocus`)         | adopt              | New in `@slotted/core/focus`, with its own test, as `docs/process/build-order.md` orders. Tab and Shift+Tab wrap inside the layer.                                                                                                                         |
| Initial focus target                                   | Base UI `initialFocus`, Ark `initialFocusEl`, Material `autoFocus` | adopt              | `initialFocus` on the content part: the first tabbable element by default, a consumer's element, or the content itself. The APG's own note lists all three cases.                                                                                  |
| Focus restoration on close                             | Base UI `finalFocus`, Ark `finalFocusEl`, Material `restoreFocus`  | adopt              | New in `@slotted/core/focus` alongside containment. Default is the element focused when the layer opened, which is the trigger in the ordinary case and is not the trigger when the layer was opened from code.                                     |
| Escape closes, and the close can be refused            | Radix `onEscapeKeyDown`, Ark `closeOnEscape`, React Aria `isKeyboardDismissDisabled`, Material `disableClose` | adopt | One cancellable request carrying `reason: 'escape'`, not a second callback. `dismissable-layer` already reports it.                                                                                              |
| Outside press closes, and the close can be refused     | Radix, Ark `closeOnInteractOutside`, React Aria `isDismissable`, Material | adopt        | One cancellable request carrying `reason: 'outsidePress'`. Alert Dialog fixes it off — see §3.                                                                                                                                                     |
| Scroll lock while modal                                | Radix, Ark `preventScroll`, Base UI, Material `scrollStrategy`     | adopt              | `dismissable-layer`'s counted lock, which restores the inline styles it found rather than assuming it started clean.                                                                                                                               |
| Background made inert                                  | Radix, Base UI, Ark                                                | adopt              | `dismissable-layer` writes `inert` on every sibling up to the root, which removes the background from the accessibility tree as well as from the pointer. Radix blocks the pointer alone.                                                          |
| Stacked layers on one z-index stack                    | Ark `--layer-index`, Base UI `data-nested-dialog-open`, Material `openDialogs` | adopt   | `--slotted-layer-depth`, already written by `dismissable-layer`, added to `--slotted-z-index-overlay`.                                                                                                                                             |
| Content kept mounted for the exit animation            | Radix `forceMount`, Ark `unmountOnExit` / `lazyMount`, Base UI `data-ending-style`, React Aria `isExiting` | adopt | `@slotted/core/presence`, exposed as the `mount` axis `collapsible` already established — `active`, `lazy`, `eager`.                                                                            |
| Title and description parts, wired by id               | Radix, Base UI, Ark, React Aria, Material (`mat-dialog-title`)     | adopt              | `title` and `description`, referenced by `aria-labelledby` and `aria-describedby` generated from `useId` and Angular's own id.                                                                                                                     |
| Accessible name without a visible title                | Ark `aria-label`, Material `ariaLabel`, React Aria                 | adopt              | The consumer's `aria-label` on the content part survives, and the family writes `aria-labelledby` only when a `title` part is present.                                                                                                             |
| Close part                                             | Radix, Base UI, Ark, React Aria (`slot="close"`), Material (`mat-dialog-close`) | adopt  | `close`, an icon button in the header by default and usable anywhere inside the content.                                                                                                                                                           |
| A result value carried out of the dialog               | HTML `returnValue`, Material `close(result)` + `afterClosed()`     | adopt              | The close request carries `result`, and the `close` part takes a `value`. It is not a second state model: nothing about a result is controlled, and a consumer owning it would own a value only the family can produce.                            |
| Imperative open, close and focus                       | Base UI `actionsRef` and `createHandle`, Ark `useDialog`, Material service | adopt      | React: a handle on `ref` with `open()`, `close(result)` and `focus()`. Angular: `exportAs` on the root plus the same three methods. `docs/component-features.md` §2.2 allows exactly these.                                                         |
| A size axis                                            | Material `width` / `maxWidth`, Carbon `size`, Ant `width`          | adapt              | Five named steps rather than a pixel string, because a pixel string is a second scale a theme cannot retune. A consumer needing an exact width still writes `max-inline-size` on the content part, which is not contract but is not forbidden.     |
| Inside scroll and outside scroll                       | Base UI `Viewport`, Ark (two recipes), Material                    | adopt              | `scroll` axis, `content` and `viewport`. The default is `content`, which is what keeps the footer, and §4 records that keeping it is a gap rather than a preference.                                                                               |
| `role="alertdialog"` with a required description       | Ark `role`, React Aria `role`, Material `role`, APG               | adapt              | A family rather than a prop: the role travels with a dismissal policy and an initial focus target, and a prop leaves both to be remembered. §3 carries the argument.                                                                               |
| Application-wide defaults                              | Material `MAT_DIALOG_DEFAULT_OPTIONS`                              | adopt              | One surveyed implementation ships it, so it is not table stakes by the two-implementation rule; it is adopted anyway because `references/frameworks.md` asks every family the question and this library answers it in both bindings.                |
| A state attribute a stylesheet can select              | Radix `data-state`, Base UI `data-open` / `data-closed`, Ark       | adopt              | `data-open`, from the vocabulary in `specs/contract.schema.mjs`.                                                                                                                                                                                   |
| Nested dialogs                                         | Base UI, Ark, Material                                             | adopt              | `dismissable-layer` already answers "outside" correctly for a descendant layer; the family adds nothing but the scene that proves it.                                                                                                              |
| The native `<dialog>` element and its top layer        | the platform                                                       | decline            | Written out below.                                                                                                                                                                                                                                |
| A service that instantiates a component                | Angular Material alone                                             | decline            | Written out below.                                                                                                                                                                                                                                |
| `scrollStrategy` with four strategies                  | Angular Material alone                                             | decline            | Written out below.                                                                                                                                                                                                                                |
| Drag, resize, minimise                                 | Material `cdkDrag` on a dialog                                     | defer to `floating-window` | `docs/component-features.md` §8 gives a modeless movable window its own `[Specialized]` family, in wave 8. A modal dialog that can be dragged is a floating window with a scrim.                                                             |
| Edge placement, gestures, snap points                  | Base UI `Drawer`, React Aria sheet recipe                          | defer to `drawer`  | `docs/process/build-order.md` wave 5 item 4. Base UI's own usage guideline says the same: a panel needing gestures is Drawer, not Dialog.                                                                                                                  |

### Declining the native `<dialog>` element

`<dialog>` with `showModal()` supplies, at no cost, six things this pair
otherwise builds: the top layer, `::backdrop`, tab containment, background
inertness, Escape as a cancellable `cancel` event, and `returnValue`. It is
Baseline widely available since March 2022. The rule in `references/quick-law.md`
— prefer the native element — points at it, and it is still declined.

The reason is the top layer, and it is not a preference. An element promoted to
the top layer paints above every element in the document regardless of
`z-index`. Every other overlay in this library — `tooltip`, `popover`, `menu`,
`toast`, `drawer`, and the listbox of a `select` — is portalled to the end of
the body and stacked with `--slotted-z-index-*` plus `--slotted-layer-depth`, as
`docs/build-briefing.md` decided when `dismissable-layer` shipped. A `select`
opened inside a `<dialog>` would portal to the body and paint *behind* the
dialog it belongs to, with no z-index able to correct it. The alternatives are
to portal every descendant overlay into the topmost `<dialog>`, which makes the
portal module depend on the dialog family, or to move the whole library onto the
top layer, which is a change to five families that do not exist yet.

Three smaller costs come with it and are recorded rather than used as the
argument, because none of them would decide it alone:

- `closedby`, which is the only declarative light dismiss, is newer than the
  element and not yet Baseline; outside press would need the same listener the
  family already has.
- `::backdrop` is a pseudo-element, so the scrim could not be a `data-part` a
  consumer replaces, and `docs/component-features.md` §2.3 makes the parts the
  composition surface.
- Animating in and out needs `@starting-style`, `overlay` and
  `transition-behavior: allow-discrete`, where `@slotted/core/presence` already
  holds the exit open and — unlike every `animationend` implementation surveyed —
  completes it on a timer when the event never arrives.

The cost of declining is written here and on both reference pages: the family
depends on JavaScript for containment, inertness and Escape, where the platform
would supply all three; a page with scripting disabled has no dialog at all; and
this library maintains a focus trap that browsers already implement. The
decision is revisited when the library's overlay set moves to the top layer as a
whole, which is one decision for the whole of `packages/core` and not one for
this family.

### Declining a service that instantiates a component

`MatDialog.open(SomeComponent, config)` returning a `MatDialogRef` with
`afterClosed()` is the Angular idiom for dialogs, and it is not adopted. It
exists because Angular had no block control flow and no lazily-rendered
standalone component when it was designed; with `@if` and signals the same thing
is three lines in the consumer's own template:

```html
<button (click)="confirm.set(true)">Delete</button>
@if (confirm()) {
  <slotted-dialog [open]="true" (openChange)="confirm.set(false)"> … </slotted-dialog>
}
```

`afterClosed()` is the `(closed)` output carrying the same result;
`MatDialog.closeAll()` is the consumer's own signal; `data` injection is the
component's own inputs, checked by the compiler rather than cast from a token.
What is genuinely lost is opening a dialog from a service with no template in
scope, and the imperative handle adopted above does not recover it. That is
written on the Angular reference page as the one thing this binding does not do.

### Declining `scrollStrategy`

Material offers `block`, `reposition`, `close` and `noop`. A modal dialog is not
anchored to anything, so `reposition` describes nothing; `close` on scroll is a
`tooltip` and `popover` policy, not a dialog's; `noop` is `modal={false}`, which
is already an axis. `block` is the only one that applies, and it is what
`scrollLock` does.

---

## 3. Differentiators

| Capability                                                             | Where it comes from                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One cancellable request carrying one enumerated reason                 | Radix reports a close through `onOpenChange`, `onEscapeKeyDown`, `onPointerDownOutside` and `onInteractOutside`, and a consumer who wants to refuse a close while a form is saving writes the same guard three times. Here it is one request, with `reason` from the closed vocabulary and `cancel()` on it.                              |
| A layer that keeps the theme of the region that opened it              | Every surveyed library portals to the end of the body and loses `data-slotted-scheme`, `data-slotted-density`, `data-slotted-theme` and `dir`. In a library with one scheme that is invisible; with three schemes and three densities it is a defect you can photograph. `@slotted/core/portal` mirrors all four and keeps them current. |
| Three schemes, three densities and RTL on the overlay itself           | The five headless libraries ship no visual layer at all; the design systems ship one scheme and one density. The pair is captured in `light`, `dark` and `high-contrast`, at `comfortable` and `dense`, and mirrored.                                                                                                                    |
| An alert dialog whose two rules are structural rather than remembered  | Ark and React Aria make the role a prop, so a consumer who sets `role="alertdialog"` and forgets `closeOnInteractOutside={false}` ships a destructive confirmation that a stray click dismisses. Here the family fixes outside press off and focuses the `cancel` part first, which is the APG's own advice about irreversible steps.     |
| A tone and an intrinsic mark on the alert dialog                       | No surveyed implementation gives an alert dialog a visual register. `alert`, `inline-message` and `result-state` in this library each answer WCAG 2.2 SC 1.4.1 with a mark as well as a colour, and a destructive confirmation is the place that rule matters most.                                                                       |
| Defaults set once, in both ecosystems                                  | Material has `MAT_DIALOG_DEFAULT_OPTIONS` and no React library in the set has an equivalent. Both bindings get one: a context provider in React, `provideDialogDefaults()` in Angular.                                                                                                                                                    |
| An exit that completes even when its animation event never fires       | Radix, Zag and Base UI all wait on `animationend` alone, and a layer inside a `display: none` ancestor or a backgrounded tab stays in the document for the life of the page. `@slotted/core/presence` treats the declared duration as a floor.                                                                                            |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap                                                                                                                                                                                                                                             | Answer                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The footer leaves the screen. A long body pushes the actions below the fold, and the reader cannot reach Save. Radix and React Aria ship no layout at all, so this is the default outcome of following their examples.                            | The content part is a three-row grid whose middle row is bounded and scrolls: `grid-template-rows: auto minmax(0, 1fr) auto` inside a `max-block-size`. `scroll="viewport"` is the opt-out, for a dialog that is a document rather than a task.                                        |
| A hostile string. A 90-character unbroken token in a title widens the panel past the viewport, and the panel is centred, so both edges leave the screen at once.                                                                                  | `min-inline-size: 0` on every grid child and `overflow-wrap: anywhere` on the title and description. Captured in a scene, not asserted.                                                                                                                                              |
| Forced colours erase the separation. Every library separates the panel from the page with a shadow, and `docs/token-foundation.md` maps every shadow token to `none` under `forced-colors`, while `--slotted-scrim` becomes `Canvas` — an opaque ground with an invisible panel on it. | The content part carries a border of its own, so the panel is bounded by a line rather than by a shadow in that mode.                                                                                                                                                                |
| Content that is not there yet. A dialog opened before its data arrives shows an empty box; no surveyed implementation has a state for it, so the consumer conditionally renders a spinner and the panel jumps to size when the data lands.        | A `loading` state on the root: `aria-busy` on the body, the body held at its declared minimum height so the panel does not resize when content arrives, and the header, the close button and Escape all still operable. A loading dialog a reader cannot leave is the worse failure.  |
| Two hundred per cent zoom, or a 400-pixel-tall window. The panel is taller than the viewport and the top of it — where the title is — is the part that goes off screen.                                                                            | The panel is bounded by the viewport rather than by a fixed height, and `scroll="viewport"` moves the overflow to the layer so the whole panel is reachable. Captured at 240 pixels and at `dense`.                                                                                  |
| Right to left. The close button, the footer's action order and the panel's own padding mirror; the close mark does not, because an ✕ has no direction.                                                                                            | Logical properties throughout, one mirrored capture, and the mark drawn from `--slotted-icon-x`, which is symmetric.                                                                                                                                                                 |
| A dialog opened from a dialog. Material tracks `openDialogs` and Base UI marks `data-nested-dialog-open`; neither says what Escape does, and a consumer discovers that one Escape closes both.                                                    | `dismissable-layer` asks the topmost layer only, and a layer that refuses stops the request reaching the one beneath it. The scene that proves it is in the harness, and the keyboard table says it.                                                                                 |

---

## 5. What the pair ships

Read against the contract at the release gate, per `references/rubric.md`
dimension 9.

- **Dialog parts**: `root`, `trigger`, `backdrop`, `viewport`, `content`,
  `header`, `title`, `description`, `body`, `footer`, `close`.
- **Alert Dialog parts**: the same, plus `icon`, `cancel` and `action`, and
  without `trigger`'s `aria-haspopup` value changing — an alert dialog is still
  `dialog` to `aria-haspopup`, which has no `alertdialog` token.
- **State**: `open`, controlled and uncontrolled, with reasons `pointer`,
  `keyboard`, `dismiss`, `escape`, `outsidePress`, `submit` and `programmatic`,
  and a `result` on the request.
- **Axes**: `size`, `placement`, `scroll`, `mount`, `modal`, `fullScreen` for
  Dialog; `size`, `tone`, `scroll`, `mount`, `escape` for Alert Dialog.
- **Keyboard**: Tab and Shift+Tab contained and wrapping, Escape requesting a
  close on the topmost layer only.
- **Focus**: containment while modal, an initial target, and restoration to the
  element that had focus when the layer opened — the last two new in
  `@slotted/core/focus`, with their own tests, before the family parts.
