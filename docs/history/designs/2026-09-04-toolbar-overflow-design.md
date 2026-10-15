# Toolbar overflow — design

The refinement `docs/process/build-order.md` names at the end of wave 5: a bar that
moves what does not fit into a menu. `toolbar` shipped on 2026-09-03 with
`overflow: wrap | scroll` and a `declined.overflowMenu` block pointing at a
family that did not exist yet; `menu` and `menubar` landed on 2026-09-04.

The inventory is
`docs/history/designs/2026-09-04-toolbar-overflow-capability-inventory.md`.
The family's own design is
`docs/history/designs/2026-09-03-tabs-and-toolbar-design.md`, and every
decision there stands unless this document changes it.

## The one rule the shape follows

The primary action stays visible. What enters the overflow is what is left
over, not what is convenient to hide.

Two decisions follow from it and nothing else in this document contradicts
them:

1. **The order is the bar's own order, reversed.** The last collapsible unit
   gives way first. There is no priority prop, because a priority is a way of
   saying "hide this one" and the bar is not supposed to have an opinion about
   which control matters — the author already stated that by placing it.
2. **A unit that cannot become a menu item cannot be hidden.** Pinning is the
   absence of a counterpart, not a second switch. A control with nothing to
   turn into stays where it is, and a bar whose pinned units alone exceed it
   scrolls rather than clipping.

## Anatomy

Two parts join the four the family already has.

| Part       | Element                            | Always | What it is                                                                                                                                                                                                                                              |
| ---------- | ---------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `item`     | `div`                              | no     | One unit the bar may collapse. It holds one control, or a run of them, and carries the node that control becomes in the menu. Under `overflow="menu"` it is what makes a control collapsible; under any other value it is a box with no behaviour and no reason to be written. |
| `overflow` | `button`, from `menu`'s `MenuTrigger` | no     | The control that opens what did not fit. It prints U+2026 and its accessible name carries the count. It is `hidden` while nothing is collapsed.                                                                                                          |

`group` gains the same counterpart declaration `item` carries, so a whole run
collapses into a menu group without a wrapper around it. `separator` and
`spacer` gain nothing: a separator's fate is derived from its neighbours', and
a spacer of zero width has nothing to hide.

**A unit is a direct child of the root.** That is the whole definition, and it
is deliberately not the same definition as an item's: the keyboard finds items
by being focusable, at any depth, and the collapse acts on the boxes the bar
lays out. A `button-group` in the bar is one unit and four items.

The sentence in the family's anatomy — "the items are not parts" — stands for
the keyboard and stops being true for the collapse. A control that can
disappear has to be a box the family owns, because the family is the thing that
hides it.

## The axis

`overflow: wrap | scroll | menu`, default `wrap`, unchanged.

| Value    | What the bar does                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------- |
| `wrap`   | Every control stays visible on a second row. The arrows wrap row to row because the item list is linear. |
| `scroll` | The bar scrolls on its flow axis and the arrows reveal what is past the edge.                            |
| `menu`   | The bar is one line; the units that do not fit are hidden and reachable through the `overflow` part.      |

`menu` with no `overflow` part written is `scroll` with extra steps, so the
family says so: with no trigger present, nothing is collapsible and the bar
scrolls. That is the same degradation a bar of pinned units gets, and it is one
rule rather than two.

## The measurement

`@slotted/core/overflow` gains a second half. The first is `overflowState` and
`createScrollAffordance` — whether a row overflows and how far a page is. The
second is the collapse:

| Export           | What it is                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `collapseState`  | A pure function over numbers: unit sizes, which of them are collapsible, the room available, the gap, and the room the trigger needs. Returns the indices that collapse. Tested without a layout engine. |
| `createCollapse` | The DOM half: it measures, applies `hidden`, and reports. One implementation, so React and Angular cannot disagree about what fits.                     |

### Why the measurement is cached

Hiding a unit removes it from the flow, so a second measurement taken after the
first collapse would report a bar that fits and reveal the unit again — the
oscillation every naive overflow implementation lands in. Each unit's size is
therefore recorded while it is visible and read from the cache while it is not.
A unit that returns is measured again on the next pass, and a unit whose
contents change while it is visible is measured again by the `ResizeObserver`
that watches it.

### Why the trigger is measured in the same pass

Primer keeps its "More items" button rendered at all times and marks it
inactive, which spends a control's width on a menu with nothing in it. Here the
trigger is `hidden` until it is needed, which leaves the question of how to
measure something that is not laid out.

The answer is one synchronous pass: the callback removes `hidden` from the
trigger, reads its width — which forces layout — and then writes `hidden` on
the units that have to go. Every mutation happens before the browser paints, so
there is no frame with a trigger nobody needs and no frame with a bar that
overflows.

### Focus is moved before the control is hidden

A control that holds focus and is then hidden leaves focus on `document.body`,
which is the defect `@slotted/core/focus` exists to prevent everywhere else in
this library. `createCollapse` therefore moves focus to the trigger before it
writes `hidden`, when the active element is inside a unit that is about to go.
The reader lands on the control that now holds the one they were on.

### An item that cannot be focused is not an item

`createArrowNavigation` collected every element matching the item selector,
including one inside a `hidden` subtree. A hidden control cannot take focus, so
the ring wrote a tab stop the platform refuses to honour — which is the sentence
already written above `isNavigationDisabled` for the disabled case. The
collection now skips an element inside `[hidden]` and one whose computed
`visibility` is `hidden` or `collapse`.

This is a change to shared behaviour and it lands in its own commit. It can
only remove stops that never worked: `tag`, `tabs`, `menu`, `menubar`,
`accordion` and `toolbar` all reach the same engine, and none of them puts a
hidden control in its ring on purpose.

## The separator

A separator between two runs is a boundary. When the run after it is entirely
collapsed the boundary divides nothing, so the family hides it too. When it
sits between two collapsed units it arrives in the surface as a `MenuSeparator`
— the bar's own structure, kept.

Both facts are derived from the collapsed set rather than declared, because the
bar is the thing that hid the units and it is the only participant that knows.
Fluent asks the consumer to wire `useIsOverflowGroupVisible` for the same
outcome.

## The trigger's name

U+2026 as text, for the reason `breadcrumb` records: rule 3 of
`docs/token-foundation.md` forbids drawing an icon from a character, and U+2026
stands in for nothing — it is the typographic mark for omitted content, which
is exactly what the control holds. It also survives `forced-colors`, where a
painted mask is replaced by the page's own background, and it scales with the
type. No icon token is added.

The accessible name carries the count. `label` takes a string used verbatim, or
a function of the number of hidden units; the default is the function, because
three dots say nothing about how much is behind them and a bar in a language
this library does not ship needs the sentence replaced rather than translated.

## Keyboard

Nothing is added to the bar's own table. The trigger is a control in the bar
and the ring reaches it like any other; the surface is `menu`'s, and its
keyboard is `menu`'s.

| Key                                    | Effect                                                     | Source                    |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| `ArrowRight` / `ArrowLeft` / `Home` / `End` | Reach the trigger, as they reach any other control      | `@slotted/core/focus`     |
| `Enter` / `Space` / `ArrowDown`        | Open the surface and land on its first item                | `menu`                    |
| `Escape`                               | Close the surface and return focus to the trigger          | `menu`                    |
| Anything, while nothing is collapsed   | The trigger is `hidden`, so it is not in the ring at all   | this family               |

## State

The collapsed set is a measurement, not a value. It gets no controlled pair and
no request, for the reason `progress-indicator` records about `measurement`: a
consumer who owned it could assert a bar fits that the layout says does not, and
the DOM would then contradict the model. `overflow` therefore enters
`KNOWN_CAPABILITIES` and stays out of `MUTABLE_CAPABILITIES`.

What the consumer does get is the fact, in the DOM and in a callback:
`data-collapsed` on the root carries the count, and `onOverflowChange` /
`(overflowChange)` reports it once per change — enough for an application that
wants to log it or to switch layout, and not enough to fight the measurement.

## React integration

Every line of `.claude/skills/component/references/frameworks.md`, answered
before the binding was written.

| Question                                                    | Answer                                                                                                                                                                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controlled and uncontrolled pair plus a reason              | No mutable value is added. The collapsed set is a measurement, as above, and the surface's own open state belongs to `menu`, which already ships the pair.                                                                          |
| Defaults set once for a subtree                             | Yes. `overflow` is already in `ToolbarDefaults`; `menu`'s own surface defaults come from `MenuDefaultsProvider`, so an application sets the placement of every overflow surface once.                                               |
| Substituting the element of each public part                | Yes. `render` on `ToolbarItem` and on `ToolbarOverflow`; the latter receives `menu`'s trigger props, so a consumer's own `IconButton` becomes the trigger without losing the wiring.                                                |
| The consumer's handler still runs                           | Yes. `ToolbarOverflow` composes `onClick` and `onKeyDown` through `MenuTrigger`, which already composes rather than replaces.                                                                                                       |
| Reaching the native element and the imperative action       | Yes. `ref` on both new parts. The imperative action is `menu`'s `MenuHandle`, reached with a `ref` on the `Menu` the consumer can pass through `ToolbarOverflow`'s `menuRef`.                                                       |
| Server rendering without a hydration mismatch               | Yes. Nothing is measured during render: the first pass runs in an effect, so the server and the first client render agree that everything is visible.                                                                               |
| Every state a consumer may style is in the DOM              | Yes. `hidden` on a collapsed unit, `data-collapsed` on the root, and `menu`'s own `data-open` on the trigger.                                                                                                                        |
| Props typed as the native element's, extended               | Yes. `ComponentPropsWithRef<'div'>` for `ToolbarItem`, `ComponentPropsWithRef<'button'>` for `ToolbarOverflow`.                                                                                                                      |

## Angular integration

| Question                                                    | Answer                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the shape the ecosystem expects            | Not applicable for the same reason as React. `output()` carries `overflowChange`; nothing is two-way.                                                                                                                                  |
| Reactive Forms and template forms                           | No. A bar runs commands and holds no value.                                                                                                                                                                                            |
| Defaults set once                                           | Yes. `provideToolbarDefaults()` already carries `overflow`, and `provideMenuDefaults()` carries the surface.                                                                                                                            |
| A template reaching the instance                            | Yes. `exportAs`: `slToolbarItem`, `slToolbarOverflow`.                                                                                                                                                                                 |
| Substituting projected content, kept lazy                   | Yes, and this is where the two bindings differ most. The counterpart is an `ng-template` referenced by input and rendered with `NgTemplateOutlet` only while its unit is collapsed, so a menu item that is never reached builds nothing. React's `ReactNode` is built with the element that declares it, which is React's own idiom and its own cost. |
| Zoneless and `OnPush`                                       | Yes. The collapsed set is a signal written from the core callback; every derived value is `computed`.                                                                                                                                   |
| Every subscription and listener torn down                   | Yes. `DestroyRef.onDestroy` releases the collapse handle beside the roving handle and the `MutationObserver`.                                                                                                                           |
| A static attribute the consumer wrote survives              | Yes. `HostAttributeToken` reads `aria-label` on the trigger before the host binding writes the counted name.                                                                                                                            |
| An entry point that others depend on stays a single class   | `@slotted/angular/toolbar` imports `@slotted/angular/menu`, as `avatar-group` imports `avatar` and `button-group` imports `button`. `SlToolbarOverflow` is a standalone component of its own, so a bar that never overflows drops the menu with it. |

## Tokens

No new token and no new step. The trigger is a control at the bar's own size —
`--slotted-control-height-*` through the `--_height` the stylesheet already
computes — and its ink is the muted text colour `tabs` uses for the same kind of
control. The `item` part paints nothing at all: it is a box that exists to be
measured and hidden.

## Public API

Nothing is removed and nothing changes meaning, so there is no migration to
write. A bar authored against the family as it shipped on 2026-09-03 renders
identically.

| Added                                                          | What a consumer does with it                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `overflow="menu"` on the root                                   | Turns the collapse on. Without an `overflow` part in the bar it scrolls instead.   |
| `ToolbarItem` / `slToolbarItem`                                  | Makes one control collapsible, and carries what it becomes.                        |
| `ToolbarOverflow` / `sl-toolbar-overflow`                        | The trigger and the surface.                                                       |
| `counterpart` on `ToolbarItem` and `ToolbarGroup`                | What the unit becomes in the surface. Its absence is what pins a unit.              |
| `onOverflowChange` / `(overflowChange)` on the root              | The count, once per change.                                                        |

One name changes, and it is a type rather than a value.

| Before                                          | After                                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ToolbarOverflow`, the union of the axis values | `ToolbarOverflowMode`. The name goes to the part, as `ToolbarGroup` and `ToolbarSeparator` already have it. |

A consumer who imported the type renames the import; nothing else moves, and no
runtime value changes.

The counterpart is deliberately not called `overflow`. That word is the bar's
own axis, and one term with two meanings in one family is the ambiguity the
contract exists to prevent — `tools/storybook-workbench` refuses two API rows
under one name for the same reason.
