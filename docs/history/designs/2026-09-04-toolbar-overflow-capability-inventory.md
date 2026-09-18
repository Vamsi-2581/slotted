# Toolbar overflow — capability inventory

Produced before the refinement was designed or coded, as
`.claude/skills/component/references/capability.md` requires. It covers one
capability of one family: what a bar does with more controls than it has room
for. The family's own inventory is
`docs/history/designs/2026-09-03-tabs-and-toolbar-capability-inventory.md`,
which deferred this row to `menu`; `menu` and `menubar` landed on 2026-09-04,
so the deferral is now due.

## 1. Surveyed

| #   | Source, read 2026-09-04                                                                                                                    | What it calls the capability                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | WAI-ARIA APG — `w3.org/WAI/ARIA/apg/patterns/toolbar/`                                                                                       | Nothing. The pattern has no overflow; it has a keyboard.                                     |
| 2   | Primer ActionBar — `primer.style/components/action-bar` and `primer/react@main:packages/react/src/ActionBar/ActionBar.tsx`                    | `ActionBar.Menu`, `useActionBarItem`, `OverflowObserverProvider`, `data-overflowing`         |
| 3   | Fluent UI React v9 — `microsoft/fluentui@master:packages/react-components/react-toolbar/stories/src/Toolbar/ToolbarOverflow.stories.tsx`, `.../react-overflow/library/src/types.ts` | `Overflow`, `OverflowItem`, `useOverflowMenu`, `useIsOverflowItemVisible`, `useIsOverflowGroupVisible` |
| 4   | Kendo UI for Angular ToolBar — `telerik.com/kendo-angular-ui/components/toolbar/responsive-toolbar`                                           | `overflow` with a **menu mode** and a **section mode**, plus `popupSettings`                 |
| 5   | Radix Primitives — `radix-ui.com/primitives/docs/components/toolbar`                                                                         | Nothing. `Root`, `Button`, `Link`, `Separator`, `ToggleGroup` and no overflow at all.        |
| 6   | Base UI 1.8.0 — `base-ui.com/react/components/toolbar`                                                                                       | Nothing. `Root`, `Button`, `Link`, `Separator`, `Group`, `Input` and no overflow at all.     |
| 7   | Carbon — `carbondesignsystem.com/components/overflow-menu/usage/`                                                                             | `OverflowMenu`, a family of its own rather than a mode of the bar                            |
| 8   | This repository — `packages/react/src/breadcrumb/breadcrumb-parts.tsx`, `packages/styles/src/breadcrumb/breadcrumb.css`                       | The collapse: `[data-part='ellipsis']`, U+2026 as text, the count in the accessible name     |

### What each one does, transcribed

**Primer.** The bar is a `role="toolbar"` whose items register into
`ActionBarItemsRegistry` and are observed by `OverflowObserverProvider`; a
clipped item carries `data-overflowing`. The menu is **derived**: each item
hands the registry a `ChildProps` — `{ type, label, icon, disabled, onClick }` —
and the bar rebuilds it as an `ActionList.Item`. Deriving is possible because
the item types are Primer's own: `ActionBar.IconButton`, `ActionBar.Button`,
`ActionBar.Divider`, `ActionBar.Menu`. The "More items" `IconButton` is always
rendered and carries `data-more-button-inactive` when nothing overflows.

**Fluent.** Nothing is derived and nothing is measured by the bar. The consumer
wraps the bar in `<Overflow>`, wraps each control in `<OverflowItem id groupId>`,
writes an `OverflowMenu` component of their own, and writes a second
declaration of every control as a `ToolbarOverflowMenuItem` that asks
`useIsOverflowItemVisible(id)` whether to render. A divider between two groups
asks `useIsOverflowGroupVisible(groupId)` separately. The package's own README
says these components "should never be used in product".

**Kendo.** Two modes on one `overflow` property. **Menu mode** turns each tool
that does not fit into an item of an overflow popup, which works because the
tools are Kendo's own types. **Section mode** keeps the tools' original
components and layout and moves them into the popup instead. `popupSettings`
carries animation and a class.

**Carbon.** No bar-level overflow. `OverflowMenu` is a separate family the
author places by hand, "when additional options are available to the user but
there is a space constraint".

**Radix, Base UI, the APG.** No overflow of any kind. The bar is a keyboard and
an anatomy; what does not fit is the author's problem.

## 2. Table stakes

| Capability                                                     | Who ships it                              | Verdict                | Reason                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What does not fit moves into a menu                            | Primer, Fluent, Kendo                     | adopt                  | Axis value `overflow="menu"`, beside `wrap` and `scroll`. `menu` is the family that owns the surface, and the trigger is its own `MenuTrigger` rendered as this family's `overflow` part.                                                                       |
| The set that is hidden is measured, not configured             | Primer, Fluent, Kendo                     | adopt                  | `createCollapse` in `@slotted/core/overflow`: one measurement, two bindings. Both readings of the requirement agree — what goes into the menu is what is left over.                                                                                             |
| A control the bar must never hide                              | Primer (`ActionBar.Menu` is never an item) | adapt                  | Pinning is the absence of a counterpart rather than a second prop: a unit that declares no `overflow` node cannot become a menu item, so it stays. One fact, stated once, in the place a reader is already looking.                                              |
| The trigger has an accessible name of its own                  | Primer (`aria-label` required), Fluent    | adopt                  | `label`, and it takes the count — the rule `breadcrumb` already records: three dots say nothing about how much is behind them.                                                                                                                                  |
| A divider that collapses with the run it divides               | Fluent (`useIsOverflowGroupVisible`)      | adapt                  | Derived rather than asked for. A `separator` with no visible unit after it is hidden; a `separator` between two collapsed units becomes a `MenuSeparator`. Fluent makes the consumer wire both; here the bar knows, because it is the thing that did the hiding. |
| The trigger disappears when nothing is hidden                  | Primer (inactive), Kendo                  | adapt                  | `hidden`, not a dimmed control. Primer keeps the button rendered and reserves its room; a bar that permanently spends a control's width on a menu with nothing in it is a bar that lost a control's width.                                                       |
| An item's own disabled state reaches its counterpart           | Primer (`disabled` in `ChildProps`)       | decline                | The counterpart is the consumer's own node, so its `disabled` is the consumer's own prop on it. A bar copying state between two nodes it does not own is the desync `docs/state-and-events.md` exists to prevent.                                                |
| The surface is configurable — animation, class, width          | Kendo (`popupSettings`)                   | defer to `menu`        | `align`, `side` and `size` pass through to the surface; everything else an application sets once with `MenuDefaultsProvider` / `provideMenuDefaults()`. A second configuration surface over the same layer would be two answers to one question.                 |
| Section mode: the original controls, moved into the surface    | Kendo                                     | decline                | A `menu` surface holds `menuitem`s, and the controls in a bar are the consumer's own `button`s and fields. The counterpart is authored here, so anything `menu`'s own item types express — an item, a checkbox item, a radio group, a submenu — is already reachable; a run of live controls in a layer is `popover` with a `toolbar` inside it, which is two elements of consumer code. |
| A priority that reorders which control gives way first         | Fluent (`priority` on `OverflowItem`)     | decline                | Collapse order is the bar's own order, reversed. What must not collapse is pinned. Two knobs for one question is how a primary action ends up in a menu, and the invocation's own rule is that the overflow takes what is left over rather than what is convenient to hide. |

## 3. Differentiators

| What                                                                | Why this library can                                                                                                                                                                                                                        |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The counterpart is written beside the control it replaces            | `counterpart={<MenuItem>…</MenuItem>}` on the unit, and an `ng-template` beside it in Angular. Fluent makes the consumer keep a second list in sync by hand and Primer can only derive from its own four item types; here the identity is in one place and the item is anything. |
| The overflow keeps the bar's structure                               | A separator between two collapsed units arrives in the menu as a separator. No surveyed implementation carries the bar's own grouping into the surface without the consumer wiring it.                                                        |
| One measurement, two bindings                                        | `createCollapse` is DOM and arithmetic, in core. React and Angular each own the rendering of the counterpart and neither owns the answer to "what fits".                                                                                      |
| The trigger is a control of the bar, not an exception to it          | It is found by the roving ring like any other item, so `Home`, `End` and the arrows reach it, and it leaves the ring the moment it is hidden.                                                                                                 |
| The collapse degrades instead of clipping                            | A bar whose pinned units alone exceed it scrolls rather than cutting a control in half. Primer clips by design — its spacer exists so the first item "can wrap to the next line and get clipped".                                             |
| Three densities and `dir="rtl"` on the same measurement              | The arithmetic reads the flow axis and the computed gap rather than a hard-coded width, so a dense right-to-left bar collapses at the point a dense right-to-left bar actually runs out.                                                      |

## 4. Gaps

| What a product hits and no surveyed implementation answers            | The answer here                                                                                                                                                                                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focus is on the control the bar is about to hide                       | The unit is hidden only after focus is moved to the trigger, so a reader who was on the fifth button lands on the control that now holds it instead of on `body`.                                            |
| The primary action is the widest control in the bar                    | It is pinned, and the bar scrolls past what is left when even the pinned units do not fit. Primer, Fluent and Kendo all hide by position, so the primary action is hidden whenever it is late enough in the bar. |
| A bar that has never overflowed still pays for the trigger             | It does not: the trigger is `hidden` until the first measurement asks for it, and the room it needs is measured in the same synchronous pass that reveals it, so no frame is painted with a trigger nobody needs. |
| The menu is opened and the window is then made wider                   | The collapsed set is recomputed while the surface is open, and a counterpart whose unit came back is removed from the surface. Fluent's own story leaves the stale item in the open menu.                     |
| A control is added to the bar by a permission filter after first paint | The `MutationObserver` the family already runs for the tab stop also invalidates the measurement, so a bar that grows a button collapses one.                                                                |
| The bar is in a container that is itself animating                     | `ResizeObserver` reports every step and the collapsed set only changes when it changes, so an animating panel produces one DOM write per boundary crossed rather than one per frame.                          |

## 5. Against what shipped

| What shipped 2026-09-03                                                       | What ships now                                                                                                                    |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `overflow: wrap \| scroll`, and `declined.overflowMenu` naming the wave-5 debt | `overflow: wrap \| scroll \| menu`, and the `declined` block carries the three decisions that replaced it                            |
| Four parts: `root`, `group`, `separator`, `spacer`                             | Six: `item` and `overflow` join them                                                                                                |
| Three capabilities: `orientation`, `size`, `appearance`                        | Four: `overflow` enters the shared vocabulary, deliberately not mutable                                                             |
| "The items are not parts"                                                      | Still true for the keyboard, and no longer true for the collapse: a unit that can disappear is a box the family owns, which is `item` |
