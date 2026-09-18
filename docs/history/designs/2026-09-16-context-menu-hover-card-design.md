# Context menu and hover card — design

The decisions this pair takes, and what each one costs. The capabilities and
their sources are in
`docs/history/designs/2026-09-16-context-menu-hover-card-capability-inventory.md`;
nothing is re-argued here.

## 1. One shape for both: a root the family owns, holding the core unchanged

`context-menu` is `menu` opened from a point. `hover-card` is `popover` opened
from hover and focus. Neither renders a surface of its own, and neither
re-exports a part of the core it holds: a consumer imports `MenuContent` and
its items from `menu`, and `PopoverLayer`, `PopoverBody`, `PopoverArrow` from
`popover`. This is the shape `menubar` took (`specs/components/menubar/contract.json`,
`holds`), and the reason is the one it recorded: Radix's `ContextMenu` re-exports
sixteen parts its `DropdownMenu` already has, and two copies of one machine
drift.

What each family owns is its **root**, which is the element the reader acts on:

| Family         | Root                         | Default element | `render` / directive                                       | Why it is a part when `menu`'s trigger is not                                                                                                                                              |
| -------------- | ---------------------------- | --------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `context-menu` | the target area              | `div`           | `render={<tr />}`; `[slContextMenuTriggerFor]` on the row  | A context target is a region the consumer wraps — a row, a card, a canvas — not a control that is another family's root. Radix renders a `span`, Base UI a `div`, Ark a `button` and names it a part. |
| `hover-card`   | the trigger                  | `a`             | `render={<Link />}`; `slHoverCardTrigger` on the link      | Radix and Base UI both render the `<a>` themselves. It is the one element the family paints: the state while the card shows.                                                            |

The cost is the one `menubar` paid — one context: the menu has to know its
anchor is a point and where focus goes back, the popover has to know it must not
take focus and what role its panel carries. Both are paid in the cores, once,
as three capabilities the cores had already promised and not shipped:

| Core      | Change                                                                                                       | Promised by                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `menu`    | `anchor`: a `PositionerAnchor` the layer is positioned against instead of the trigger. Positioning only: the trigger stays the portal origin, the branch and the focus destination. React prop on `Menu`; Angular signal on `SlMenu` beside `trigger`, written by a trigger directive. | inventory l. 117: "an anchor that is a point rather than an element, which is adopted here" |
| `menu`    | `finalFocus`: consulted before the trigger when the surface closes. React prop, `PopoverFocusTarget`'s shape; Angular signal. | design §4, note 3: "Taken, as the `finalFocus` escape hatch"           |
| `popover` | The consumer's `role` on `PopoverContent` / `slPopoverContent` wins over `dialog`.                            | `frameworks.md`, Both: "The consumer's explicit value always wins"    |

Each lands in its own commit before the family that found it, as
`docs/build-briefing.md` requires.

Where a consumer renders the root onto another family's element — a `tr` of
`table`, a `Link` — the other family's own props are spread after this one's in
React, so that element keeps its `data-ui` and `data-part`; the wiring and the
state attributes still land. Angular's directive writes no `data-part` when the
host already carries one, the rule `menu-trigger.ts` records for two directives
on one element.

## 2. `context-menu`

### 2.1 Anatomy

```
┌─ root ─ the target area ─ data-open ─ data-pressed ───────────┐
│  the consumer's content: a row, a card, a canvas               │
└────────────────────────────────────────────────────────────────┘
        ┌─ [data-ui='menu'] ─ unchanged ─┐  ← anchored to the point
        │  item  item  ─  item           │
        └────────────────────────────────┘
```

One part, `root`. Attributes the family writes on it: `data-ui="context-menu"`,
`data-part="root"`, `data-open` while the surface shows, `data-pressed` while a
long press is running, `data-disabled` while the family lets the browser's own
menu through, and `id`, which is the menu's `triggerId`, so the surface is named
by the target unless the consumer gives `MenuContent` an `aria-label`. No
`aria-haspopup`: it is not permitted on a generic element, and none of the four
surveyed implementations writes it. A context menu is found by convention, which
is why `docs/component-features.md` §8 requires every action in it to exist by
another path as well, and the reference page shows that path.

### 2.2 Opening

| Gesture                                            | Anchor                          | Reason     | Notes                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contextmenu` (secondary click)                    | a 0×0 rectangle at the pointer  | `pointer`  | `preventDefault` while enabled. While open, the anchor moves to the new point and the surface repositions; no request is emitted.                                          |
| Long press, touch or pen, `longPressDelay` (500 ms) | the pointer at `pointerdown`    | `pointer`  | `data-pressed` from `pointerdown` to release. Movement past 10 px, `pointerup` or `pointercancel` before the delay cancels. A `contextmenu` the platform fires afterwards is prevented and moves nothing. |
| `Shift+F10`, the `ContextMenu` key                 | the target element              | `keyboard` | Focus must be on the target, so the target has to be focusable; the family writes no `tabindex`. The `contextmenu` event Windows fires for the key is prevented and ignored. |
| `open()` on the handle                             | the target element              | `programmatic` |                                                                                                                                                                         |

A primary press on the target while the menu is open closes it with
`outsidePress`: the target is registered as a branch of the layer so the menu's
own machinery treats it as inside, and the family says otherwise for the primary
button alone. `contextmenu` inside the open layer is prevented, so the browser
does not draw its menu over the family's.

`disabled` lets the platform's own menu through rather than suppressing both.

### 2.3 Focus

Focus goes to the first item on open, as the menu does. On close it goes to
**the element that held focus when the menu opened**, captured at that moment,
and to the target when nothing did — `finalFocus` on the menu, a ref the family
updates. The reasons the menu already exempts, `outsidePress` and
`programmatic`, stay exempt.

### 2.4 The pattern

Source: **Menu and Menubar Pattern**, <https://www.w3.org/WAI/ARIA/apg/patterns/menubar/>,
and **Menu Button Pattern**, <https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/>,
both read 2026-09-16. Neither has a context-menu variant. Every key inside the
surface is the menu's, transcribed in `2026-09-04-menu-and-menubar-design.md` §4
and held by `specs/components/menu/contract.json`; the keys on the target are
this family's:

| Key on the target   | Effect                                        | Focus lands            | Source                                     |
| ------------------- | --------------------------------------------- | ---------------------- | ------------------------------------------ |
| `Shift+F10`         | opens the menu, anchored to the target        | the first item         | platform convention (Windows), guide §8    |
| `ContextMenu`       | the same                                      | the first item         | platform convention                        |
| `Escape` (in menu)  | closes; focus returns as §2.3                 | what held it at open   | pattern                                    |
| `Tab` (in menu)     | closes every surface, moves on from the target | the next element after the target | pattern                          |

The Menu Button pattern's four trigger keys (`Enter`, `Space`, `ArrowDown`,
`ArrowUp`) are **not** taken on the target: a region is not a button, and a row
uses those keys for itself.

### 2.5 State

```json
"open": {
  "controlled": "open", "uncontrolled": "defaultOpen", "request": "onOpenChange",
  "reasons": ["pointer", "keyboard", "escape", "outsidePress", "select", "dismiss", "programmatic"]
}
```

The menu's model, surfaced by the family: `ContextMenu` in React renders the
`Menu` and forwards `open`, `defaultOpen`, `onOpenChange`; in Angular the state
is `sl-menu [(open)]` itself, and the directive only asks it to move.

### 2.6 Stylesheet

The root paints nothing at rest — the content is the consumer's. It writes
`-webkit-touch-callout: none` under `(pointer: coarse)`, so a long press on a
link or an image inside the target does not raise the platform's callout, and
`user-select: none` while `data-pressed`, so the press does not become a text
selection and a target that is text stays selectable at rest. While `data-open`
it draws a one-pixel inward mark in `--slotted-border-strong` — the mark
Finder and Explorer leave on the row whose menu is showing — as a
pseudo-element laid over the content with `border-radius: inherit`, because a
shadow on the target's own box is painted over by a card's ground and showed
only at the corners; an outline is the focus ring and nothing else in this
library. Two family tokens, `--slotted-context-menu-mark-width` and
`-mark-color`, let a consumer retune or turn it off.

## 3. `hover-card`

### 3.1 Anatomy

```
  root ─ the trigger ─ <a> ─ data-open
        └─ [data-ui='popover'] ─ unchanged, autoFocus off ─┐
           │ header / body / footer, the consumer's         │
           │ arrow                                          │
           └────────────────────────────────────────────────┘
```

One part, `root`. The family writes `data-ui="hover-card"`, `data-part="root"`,
`data-open`, and — only when `navigable` — `aria-haspopup="dialog"`,
`aria-expanded` and `aria-controls`. A card the keyboard cannot enter is not a
popup the link has, and saying so would be a lie a screen reader repeats.

`HoverCardContent` in React is `PopoverLayer` and `PopoverContent` in one, with
the family's pointer handlers and the panel's role; the arrow is rendered by
the family under the popover's `arrow` axis. In Angular `slHoverCardContent`
composes `slPopoverContent` as a host directive and the consumer writes the
`slPopoverLayer` template around it, as every popover consumer does.

The panel's role is `dialog` when `navigable` and `presentation` when not. The
APG's tooltip page names the non-modal dialog for hover content "that contains
focusable elements"; content with none is not a dialog, and a dialog nothing
points to is what Radix ships.

### 3.2 Opening and closing

| Gesture                                                     | Effect                                                                     | Reason         |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- | -------------- |
| Pointer enters the trigger (mouse, pen)                     | opens after `openDelay` (600 ms); the trigger registers itself as anchor   | `pointer`      |
| Pointer leaves the trigger                                  | pending open cancelled; open card: `pointer-intent` toward the card's rectangle, then `closeDelay` (300 ms) | `pointer` |
| Pointer enters the card                                     | pending close cancelled                                                    | —              |
| Pointer leaves the card                                     | closes after `closeDelay` unless it is back on the trigger                 | `pointer`      |
| Focus arrives on the trigger with `:focus-visible`          | opens now, no delay                                                        | `keyboard`     |
| Focus leaves the trigger, not into the card                 | closes                                                                     | `blur`         |
| `Tab` on the open trigger, `navigable`, card has a tabbable | focus enters the card's first tabbable                                     | —              |
| Focus reaches a focus guard                                 | closes, focus returns to the trigger, which does not reopen                | `keyboard`     |
| `Escape`                                                    | closes; focus stays or returns to the trigger, which does not reopen       | `escape`       |
| Press outside                                               | closes                                                                     | `outsidePress` |
| The `Close` part                                            | closes                                                                     | `dismiss`      |
| Tap on the trigger (touch), card closed                     | opens, and the link is not followed                                        | `pointer`      |
| Tap on the trigger (touch), card open                       | follows the link                                                           | —              |
| `open()` / `close()`                                        |                                                                            | `programmatic` |

"Does not reopen": focus the family itself puts back on the trigger holds the
reopening back until focus leaves the trigger once. Without it a guard would
close the card, focus the trigger, and open the card again — a loop the reader
cannot leave.

WCAG 2.2 SC 1.4.13, item by item: **Dismissible** — Escape, without moving the
pointer; **Hoverable** — the pointer may move onto the card, and the grace area
keeps it open on the way; **Persistent** — the card stays until hover and focus
leave both, until Escape, or until the consumer closes it.

### 3.3 State

```json
"open": {
  "controlled": "open", "uncontrolled": "defaultOpen", "request": "onOpenChange",
  "reasons": ["pointer", "keyboard", "escape", "outsidePress", "blur", "dismiss", "programmatic"]
}
```

`HoverCard` owns the state and renders the `Popover` controlled, so a request
the popover raises — `escape`, `outsidePress`, `dismiss`, the guards'
`keyboard` — reaches the consumer through one handler with one reason
vocabulary. `blur` is the family's own, as `tooltip` declares it. In Angular
`SlHoverCard` extends `SlPopover` and provides itself as it, so every
`slPopover*` part inside it reaches the card.

### 3.4 Stylesheet

The trigger is a link the family draws when it is the family's own `<a>`:
accent text, an underline in a subtle colour that fills on hover and while
open, and while `data-open` a tint of `--slotted-tone-accent-surface` drawn with
a spread shadow so the inline box grows by `--slotted-space-1` without moving a
line. Rendered onto `Link`, the link keeps its own paint and takes only the
attributes. Focus is the foundation ring.

## 4. React

```tsx
<ContextMenu onOpenChange={(open, request) => …}>
  <ContextMenuTrigger render={<tr />}>…</ContextMenuTrigger>
  <MenuContent aria-label="Invoice actions">
    <MenuItem onSelect={duplicate}>Duplicate</MenuItem>
    <MenuItem tone="danger" onSelect={remove}>Delete…</MenuItem>
  </MenuContent>
</ContextMenu>

<HoverCard navigable>
  <HoverCardTrigger href="/people/ana">@ana</HoverCardTrigger>
  <HoverCardContent>
    <PopoverBody>…</PopoverBody>
    <PopoverFooter><Button>Follow</Button></PopoverFooter>
  </HoverCardContent>
</HoverCard>
```

| Question                                                            | `context-menu`                                                                                                                                              | `hover-card`                                                                                                                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason  | `open` / `defaultOpen` / `onOpenChange(open, request)`, forwarded to `Menu`                                                                                 | `open` / `defaultOpen` / `onOpenChange(open, request)`, held by `createControllable`; the `Popover` inside is controlled                                       |
| Application defaults set once                                       | `ContextMenuDefaultsProvider`, `useContextMenuDefaults`: `longPress`, `longPressDelay`, `disabled`; the surface reads `MenuDefaultsProvider`                | `HoverCardDefaultsProvider`, `useHoverCardDefaults`: `openDelay`, `closeDelay`, `navigable`, `disabled`; the panel reads `PopoverDefaultsProvider`               |
| Substituting the rendered element of each public part               | `render` on the root                                                                                                                                        | `render` on the root; `HoverCardContent` is fixed, because it is the layer the positioner writes to                                                           |
| The consumer's own handler still runs                               | composed: `onContextMenu`, `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`, `onKeyDown` run first; `preventDefault` from them stops the family | composed: `onPointerEnter`, `onPointerLeave`, `onPointerDown`, `onClick`, `onFocus`, `onBlur`, `onKeyDown`                                                |
| The native element and the imperative actions                       | `ref` on the root; `ref` on `ContextMenu` is `MenuHandle` — `open()`, `close()`, `focus()`                                                                   | `ref` on the root; `ref` on `HoverCard` is `PopoverHandle` — `open()`, `close()`, `reposition()`                                                              |
| Server rendering without a hydration mismatch                       | the menu's `useId`; the point is state written by an event                                                                                                   | the popover's `useId`; nothing measured during render                                                                                                          |
| Every state a consumer may style is in the DOM                      | `data-open`, `data-pressed`, `data-disabled` on the root                                                                                                     | `data-open` on the root; the panel's states are the popover's                                                                                                 |
| Each part's props type is the native element's, extended            | `ComponentPropsWithRef<'div'>`                                                                                                                              | `ComponentPropsWithRef<'a'>`; `HoverCardContentProps` extends `PopoverLayerProps`                                                                             |

## 5. Angular

```html
<div [slContextMenuTriggerFor]="actions" tabindex="0">…</div>
<sl-menu #actions [(open)]="open" aria-label="Invoice actions">
  <button slMenuItem (select)="duplicate()">Duplicate</button>
</sl-menu>

<ng-container slHoverCard navigable #card="slHoverCard">
  <a slHoverCardTrigger href="/people/ana">@ana</a>
  <ng-template slPopoverLayer>
    <div slHoverCardContent>
      <div slPopoverBody>…</div>
      <div slPopoverArrow></div>
    </div>
  </ng-template>
</ng-container>
```

| Question                                            | `context-menu`                                                                                                                    | `hover-card`                                                                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form                    | `sl-menu [(open)]` and `(openChangeRequest)`: the state is the menu's, and the family has no second copy                            | `model<boolean>()` for `open` and `output<ChangeRequest<boolean>>()` for the request, inherited from `SlPopover`                                            |
| Reactive Forms and template forms                   | No. A menu is a list of commands, as `menu` recorded                                                                                | No. A card is not a control with a value                                                                                                                  |
| Application defaults set once                       | `CONTEXT_MENU_DEFAULTS`, `provideContextMenuDefaults()`                                                                            | `HOVER_CARD_DEFAULTS`, `provideHoverCardDefaults()`                                                                                                        |
| A template reaching the instance                    | `exportAs: 'slContextMenuTrigger'`, and `'slMenu'` on the surface                                                                  | `exportAs: 'slHoverCard'`, `'slHoverCardTrigger'`, `'slHoverCardContent'`                                                                                  |
| Substituting projected content, kept lazy           | the menu's `ng-content` and `mount`                                                                                                 | the popover's `ng-template[slPopoverLayer]` and `mount`                                                                                                    |
| Zoneless and `OnPush`                               | signals throughout; the press state is a signal the host bindings read                                                             | signals throughout; `SlHoverCard` overrides `resolvedAutoFocus` as a `computed`                                                                            |
| Every subscription and listener torn down           | `DestroyRef` clears the long-press timer and the pointer capture                                                                   | `DestroyRef` clears both delay timers and the pointer intent                                                                                               |
| A static attribute the consumer wrote survives      | `data-part` is written only when the host has none — `HostAttributeToken`; `id` is written only when the host has none              | `HostAttributeToken` for `role` and `aria-haspopup` on the trigger                                                                                          |
| An entry point others depend on stays a single class | `@slotted/angular/context-menu` imports `SlMenu` through `@slotted/angular/menu`                                                    | `@slotted/angular/hover-card` imports `SlPopover` and `SlPopoverContent` through `@slotted/angular/popover`; `SlHoverCard` provides itself as `SlPopover`  |

The asymmetry the two tables record: React's `ContextMenu` is a component that
renders the `Menu`, because a React consumer composes by nesting; Angular's
family is one directive on the target and the ordinary `sl-menu`, because the
state already lives on the menu and a second owner would be a second copy.
React's `HoverCard` holds its own state and controls a `Popover`; Angular's
`SlHoverCard` *is* a `SlPopover` by inheritance, because DI is how that
ecosystem hands one instance to many parts.

## 6. Deliberate departures, and what each costs

| Departure                                                                          | Cost                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The target carries no `aria-haspopup`                                              | A screen reader is not told the region has a menu. Every action in it exists elsewhere, and the reference page shows where.                                                                                                                 |
| The family writes no `tabindex` on the target                                      | A target the consumer did not make focusable cannot be opened from the keyboard. The alternative adds a tab stop to every wrapped region, which a grid with roving focus cannot afford.                                                     |
| A non-navigable card is `role="presentation"`                                      | A screen reader in browse mode does not meet the card. What it holds is available at the link's destination, which is the guideline Base UI states and the one the reference page repeats.                                                  |
| A tap on a hover-card trigger opens the card instead of following the link         | One extra tap to navigate on touch. Without it, half the readers of a product never see the preview.                                                                                                                                       |
| The surfaces are `data-ui="menu"` and `data-ui="popover"`                          | A theme retuning `menu` retunes every context menu, and a test selecting `[data-ui='context-menu']` finds the target and not the surface. Both are the composition stated plainly, and the anatomy tables of the reference pages say so.   |
