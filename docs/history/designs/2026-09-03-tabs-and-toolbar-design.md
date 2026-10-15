# Tabs and Toolbar — design

One invocation, two families, because they answer the same question about focus
from opposite ends: a `tablist` is a composite whose one tab stop *selects*, and
a `toolbar` is a composite whose one tab stop *commands*. Both take their arrow
model from `@slotted/core/focus`, and the two extensions that model needed are
written once here rather than twice in four bindings.

The inventory is
`docs/history/designs/2026-09-03-tabs-and-toolbar-capability-inventory.md`.

## Where the boundary runs

Three families now arrange controls in a row, and each owns exactly one of the
three questions:

| Family         | Owns                                                                                            | Tab stops        |
| -------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| `button-group` | The **shape** of a set of actions: gap, alignment, stacking, one joined bar, one seam.           | one per control  |
| `toolbar`      | The **keyboard** of a set of controls: the role, the label, one tab stop, arrows, groups.        | one per bar      |
| `tabs`         | The **selection** of one view out of several, and the panels beneath it.                          | one per list, plus one per panel |

`button-group` states the rule already: "the arrow-key model of the APG Toolbar
pattern belongs to `toolbar`, which is a different family for a different thing
— a composite control with one tab stop." So `toolbar` declares no arrangement
axis: a joined run of actions inside a toolbar is a `button-group` inside a
toolbar, and the toolbar finds the buttons through it because it looks for
focusable elements rather than for its own children.

`tag` already implements the APG Toolbar pattern for its own chips, on its own
`group` part. That stays: a run of chips is a toolbar of chips, and reaching for
this family to wrap it would put one family's roving focus inside another's.

## What the two families add to `@slotted/core/focus`

`createRovingTabindex` already answers arrows on both axes, `Home`, `End`,
wrapping, the mirrored arrows of a right-to-left document, and skipping a
disabled item. Two facts it could not express are added here, both as options,
so `tag`'s behaviour does not move:

| Option              | Default | Why                                                                                                                                                                                                       |
| ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crossAxis`         | `true`  | Whether the arrows across the flow also navigate. The APG lets a toolbar duplicate them and **forbids** a horizontal `tablist` from listening for `Up`/`Down`, so tabs passes `false` and toolbar takes the default. |
| `ownedKeys`         | none    | What an item keeps for itself. A text field, a `textarea`, a `select`, a slider, a spin button or a `contenteditable` inside a toolbar needs the inline arrows for its own caret or value, and the APG's advice — "include only one such control and make it the last element" — becomes a rule instead: the item keeps the key, and focus still moves on the cross axis. |
| `includeAriaDisabled` | `false` | Whether an item carrying `aria-disabled="true"` stays in the ring. The APG allows a focusable disabled control where discoverability matters; a control carrying the *native* attribute cannot be focused at all, so that one is always skipped and no axis pretends otherwise. |

`@slotted/core/overflow` is new, and it is the arithmetic of a scrolling row:
whether it overflows, whether either end is reached, how far one page is, and
which way to move for a reading direction. The state is a pure function over
four numbers, tested as one; the DOM wrapper observes size and scroll and
reports. It is in core because both bindings of `tabs` need the same answer, and
a measurement written twice is two answers.

## Tabs

### Anatomy

| Part       | Element                                | Always | What it is                                                                                                                                                                                                 |
| ---------- | -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `root`     | `div`, or what `render` gives           | yes    | The family. A two-column, two-row grid carrying `data-ui="tabs"`, the five axes, `data-disabled` and `data-activation-direction`. It renders the two paging controls itself, because it owns the observer that knows whether they are needed. |
| `list`     | `div[role=tablist]`                     | yes    | The scroll container and the roving tab stop. Carries `aria-orientation` when vertical, and its accessible name comes from the consumer's `aria-label` or `aria-labelledby`.                                  |
| `item`     | `div[role=presentation]`                | yes    | One tab and its optional dismiss control, so the dismiss can be a real `button` — a `button` may not contain one. In the contained variant it is the framed surface; in both variants it paints the marker. |
| `tab`      | `button[role=tab]`, or `a[role=tab]` with `href` | yes | The control. Holds `aria-selected`, `aria-controls`, the identifier, the native `disabled`, and every native attribute and `ref` the consumer wrote.                                                          |
| `dismiss`  | `button`                                | no     | Closes the tab. `tabindex="-1"`, so the arrow model stays the APG's; the keyboard path is `Delete`, announced by `aria-keyshortcuts` on the tab, and the button stays in the accessibility tree so a screen reader can still reach and press it. |
| `panel`    | `div[role=tabpanel]`                    | yes    | The content. `aria-labelledby` its tab, `tabindex="0"`, and `hidden` while another tab is selected.                                                                                                          |
| `scroll`   | `button`                                | no     | One paging control per end, `data-direction="start\|end"`. `aria-hidden="true"` and out of the tab sequence: every tab is already reachable through the roving stop, and two extra stops before a tab list is what Cloudscape's own guidance warns about. |
| `actions`  | `div`                                   | no     | A slot beside the list, on the same row. What belongs there is a `toolbar`.                                                                                                                                  |

The grid is what lets the DOM order stay readable while the paint stays right:
the list and both paging controls share cell `1 / 1`, with the controls
`justify-self: start` and `end`; `actions` takes cell `1 / 2`; every panel spans
the second row. A vertical family turns the same grid a quarter: the list takes
column one, the panels column two, and the paging controls are not rendered,
because a vertical list stacks and the page scrolls.

### Keyboard

Every row is checked against the APG transcription in the inventory. `source`
says who implements it.

| Key                                   | Effect                                                                                     | Focus lands on                                    | Source                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------- |
| `Tab`                                 | Enters the list                                                                             | the selected tab                                  | roving tabindex, set from the value |
| `Tab` again                           | Leaves the list                                                                             | the panel, which is the next stop in the page      | platform                        |
| `ArrowRight` / `ArrowLeft`            | Previous and next tab in a horizontal list, wrapping; activates when `activation="automatic"` | the tab moved to                                | `@slotted/core/focus`, direction-aware |
| `ArrowDown` / `ArrowUp`               | The same in a vertical list. A horizontal list does not listen, so the page still scrolls    | the tab moved to                                  | `crossAxis: false`              |
| `Home` / `End`                        | First and last tab that is not disabled; activates when automatic                            | that tab                                          | `@slotted/core/focus`           |
| `Enter` / `Space`                     | Activates the focused tab                                                                    | stays                                             | platform, the control is a `button` |
| `Delete`                              | Dismisses the focused tab when it is dismissible                                             | the following tab, or the preceding one when the dismissed tab was last, or the list itself when none is left | `@slotted/core/focus` removal focus |
| `Shift + F10`                         | Not bound                                                                                    | —                                                 | declined: a tab has no popup menu until `menu` exists, wave 5 |

### The marker, and why nothing is measured

The selected `item` paints a bar on the edge the list runs along — block-end in
a horizontal family, inline-end in a vertical one. Unselected items carry the
same bar scaled to nothing, so the change is a transition rather than an
appearance.

The root records `data-activation-direction` as `forward`, `backward` or `none`
at every selection, from the two indices. The transform origin of the bar is
read from it: leaving, the bar collapses toward the direction of travel;
arriving, it grows from the side the reader came from. The eye reads travel, and
the family reads nothing from the layout.

The cost, written: the bar does not physically cross the tabs in between, so a
jump from the first tab to the fifth is two movements rather than one sweep.
What is bought is a family that renders correctly in a server response and
during the first paint — the failure Base UI answers with
`renderBeforeHydration` and Ark with `setIndicatorRect`.

### Mount, and what `hidden` means

| `mount`  | Before the first activation | While selected | After, once deselected |
| -------- | --------------------------- | -------------- | ---------------------- |
| `active` | not rendered                | rendered       | not rendered            |
| `lazy`   | not rendered                | rendered       | rendered, `hidden`      |
| `eager`  | rendered, `hidden`          | rendered       | rendered, `hidden`      |

`hidden` rather than a class, because the attribute is what a screen reader, a
find-in-page and `:target` all already understand. `active` is the default: a
panel holding a table, a chart or a form should not be built until it is asked
for, and it is the strategy Cloudscape defaults to.

### Dismissal

`removable` is not a mutable capability, and the reason is written in
`specs/contract.schema.mjs`: a component that removed itself would render
nothing while the consumer's array still held the item. So dismissal is a
request, and it is two requests when the dismissed tab was the selected one:

1. `onTabDismiss(value, request)` — reason `pointer` from the control, `keyboard`
   from `Delete`. Cancelling it stops everything.
2. `onValueChange(next, request)` with reason `remove`, where `next` is the
   following tab, or the preceding one when the dismissed tab was last. An
   uncontrolled family also moves its own value; a controlled one waits.

Focus follows the APG's own rule through `createRemovalFocus`, which the list
already owns, and the list is focusable as a last resort so an emptied list does
not send the reader back to the top of the page.

### Axes and resolution

| Axis         | Values                          | Default      | Resolution                          |
| ------------ | ------------------------------- | ------------ | ----------------------------------- |
| `activation` | `automatic`, `manual`           | `automatic`  | prop, defaults provider, `automatic` |
| `orientation`| `horizontal`, `vertical`        | `horizontal` | prop, defaults provider, `horizontal` |
| `size`       | `sm`, `md`, `lg`                | `md`         | prop, defaults provider, `md`        |
| `variant`    | `line`, `contained`             | `line`       | prop, defaults provider, `line`      |
| `fit`        | `auto`, `equal`                 | `auto`       | prop, defaults provider, `auto`      |
| `mount`      | `active`, `lazy`, `eager`       | `active`     | prop, defaults provider, `active`    |

`loop` and `disabled` are booleans on the root rather than axes. `fit="equal"`
divides the line between the tabs and clips a label that outgrows its share,
which is the one place a horizontal label truncates; `auto` never truncates and
scrolls instead.

## Toolbar

### Anatomy

| Part        | Element                     | Always | What it is                                                                                                                                                            |
| ----------- | --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`      | `div[role=toolbar]`          | yes    | The bar. Carries `data-ui="toolbar"`, the three axes, `data-disabled`, `aria-orientation` when vertical, and the label the consumer wrote.                              |
| `group`     | `div[role=group]`            | no     | A run of related controls, with its own label. Its boundary reads wider than the gap inside it, which is what keeps a destructive action off a frequent one.            |
| `separator` | `div[role=separator]`        | no     | A hairline between two runs, `aria-orientation` perpendicular to the bar. It is a part rather than a `divider`, because its geometry is measured against the controls beside it — the same reason `button-group` owns its own. |
| `spacer`    | `div`                        | no     | Consumes the free space, so what follows sits at the end of the bar. It replaces a `justify` axis: a bar is not a layout primitive.                                     |

The items are not parts. Anything focusable inside the bar is an item — this
library's `button`, `link`, `checkbox`, `switch`, `text-field`, a consumer's own
control, a menu trigger — and the family writes `tabindex` on them in DOM order.
The cost is stated in the anatomy: an element that cannot hold focus is not
reachable by the arrows, and a control the consumer disables with the native
attribute is skipped because the platform will not focus it either.

### Keyboard

| Key                        | Effect                                                                                              | Focus lands on                        | Source                            |
| -------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------- |
| `Tab`                      | Enters the bar                                                                                       | the control that last had focus, else the first that is not disabled | roving tabindex   |
| `Shift + Tab`              | Leaves the bar                                                                                       | the previous stop in the page          | platform                          |
| `ArrowRight` / `ArrowLeft` | Previous and next control in a horizontal bar, wrapping, and wrapping from row to row when the bar wrapped | that control                    | `@slotted/core/focus`             |
| `ArrowDown` / `ArrowUp`    | The same, duplicated on the cross axis, which is what the APG allows and what lets focus leave an item that owns the inline arrows | that control | `crossAxis: true`      |
| `Home` / `End`             | First and last control                                                                                | that control                          | `@slotted/core/focus`             |
| `Enter` / `Space`          | Not bound. The control the consumer put in the bar answers them                                       | stays                                 | platform                          |
| `Escape`                   | Not bound. A toolbar is not a layer, and nothing about it is dismissible                              | —                                     | declined                          |

### Axes

| Axis          | Values               | Default      |
| ------------- | -------------------- | ------------ |
| `orientation` | `horizontal`, `vertical` | `horizontal` |
| `size`        | `sm`, `md`, `lg`     | `md`         |
| `variant`     | `plain`, `outline`   | `plain`      |
| `overflow`    | `wrap`, `scroll`     | `wrap`       |

`size` sizes the **bar** — its padding, its gap and the inset of its separators
— and never the controls inside it. That is what lets one bar hold a small
button beside a medium select, and it is why Fluent's context-driven size is
adapted rather than adopted: a family that resized another family's control
would own state it cannot see.

`overflow="scroll"` scrolls the bar on its flow axis and paints no paging
control: the arrows already reach every item and the browser brings the focused
one into view. Paging buttons are declined here and adopted in `tabs` for one
reason — a tab list has no other way to reveal a tab, and a toolbar's real
answer is the overflow menu that arrives with `menu` in wave 5.

## State matrix

| State           | `tabs` paints it on                            | Held back for            |
| --------------- | ----------------------------------------------- | ------------------------ |
| `default`       | tab, dismiss, scroll                            | —                        |
| `hover`         | tab (unselected raises its ink, selected keeps it) and, in `line`, a neutral bar on the item where the mark would go — a fill met the track and read as a button on a line; `contained` keeps the fill; dismiss, scroll | `disabled` |
| `active`        | tab and dismiss press one step further           | `disabled`               |
| `focus-visible` | tab, dismiss, panel, and the list when it is the last resort | nothing      |
| `selected`      | item — the marker, the ink and, in `contained`, the surface | `disabled`   |
| `disabled`      | tab, dismiss, scroll, and the whole root         | —                        |

`toolbar` paints `disabled` on the root and mirrors it to its own parts; every
other state belongs to the control the consumer placed, which is the point of
the family.

## Public API break

Both families shipped before, and `docs/component-features.md` §18 asks for the
move a consumer makes.

| Before                                                    | After                                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `.slotted-tabs`, `.slotted-toolbar` as selectors           | `[data-ui='tabs']`, `[data-ui='toolbar']`. Classes were never contract; these are. |
| `<Tabs value onValueChange>` with no uncontrolled pair     | `value` / `defaultValue` / `onValueChange(value, request)`                          |
| `<TabList>` holding `<Tab>` directly                        | Unchanged in the authored markup; the family renders the `item` wrapper            |
| React `Tabs` had no defaults provider                       | `TabsDefaultsProvider`, `ToolbarDefaultsProvider`                                  |
| Angular `slTabs` emitted `(selectedChange)`                 | `(valueChange)` carrying the request                                               |
| `toolbar` styled a consumer's `slotted-divider`             | `data-part="separator"`, written by this family                                    |
| `toolbar` had no keyboard                                   | One tab stop and the whole APG table                                              |

## React integration

Every line of `.claude/skills/component/references/frameworks.md`, answered
before either binding was written.

| Question                                                    | Answer                                                                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Controlled and uncontrolled pair plus a reason              | Yes. `tabs`: `value` / `defaultValue` / `onValueChange(value, request)`, and `onTabDismiss(value, request)`. `toolbar`: no consumer-owned value — the focused item is DOM focus, and a second copy of it would desynchronise. |
| Defaults set once for a subtree                             | Yes. `TabsDefaultsProvider` with `useTabsDefaults`; `ToolbarDefaultsProvider` with `useToolbarDefaults`.                                    |
| Substituting the element of each public part                | Yes. `render` on `Tabs`, `TabList`, `Tab` (the item), `TabPanel`, `TabActions`, `Toolbar`, `ToolbarGroup`. Fixed: the tab control, because substituting the element that holds the role and the value leaves the family with nothing to be — `href` covers the one substitution that matters. |
| The consumer's handler still runs                           | Yes. Composed, never replaced: the consumer's `onClick` runs first and `preventDefault()` refuses the selection.                            |
| Reaching the native element and the imperative action       | Yes. `ref` on `Tab` reaches the tab control, so `focus()` and `click()` are the element's own. `useTabs()` exposes `select(value, reason)` and `scrollToValue(value)`, which no attribute can express. |
| Server rendering without a hydration mismatch               | Yes. `useId` for every identifier; the marker and the paging controls read nothing from the layout during render, and the paging controls are absent until an effect measures. |
| Every state a consumer may style is in the DOM              | Yes. `data-selected`, `data-disabled`, `data-orientation`, `data-activation-direction`, `data-direction` on the paging control.             |
| Props typed as the native element's, extended               | Yes. `ComponentPropsWithRef<'div'>`, `<'button'>`, `<'a'>` per part.                                                                        |

## Angular integration

| Question                                                    | Answer                                                                                                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the shape the ecosystem expects            | `input()` plus `output()`: `[value]` and `(valueChange)` carrying the request. `model()` is declined for the reason `docs/state-and-events.md` gives — a `model` moves the value itself, and the controlled mode must not. |
| Reactive Forms and template forms                           | No. Neither family is a form control: a tab selects a view and a toolbar runs commands. `field` is where a value belongs.                        |
| Defaults set once                                           | Yes. `TABS_DEFAULTS` with `provideTabsDefaults()`, `TOOLBAR_DEFAULTS` with `provideToolbarDefaults()`.                                            |
| A template reaching the instance                            | Yes. `exportAs` on every directive and component: `slTabs`, `slTabList`, `slTab`, `slTabPanel`, `slTabActions`, `slToolbar`, `slToolbarGroup`.     |
| Substituting projected content, kept lazy                   | Yes. `ng-content` throughout; `slTabPanel` renders its content through `NgTemplateOutlet` under `mount="active"`, so a panel that is not selected builds nothing. |
| Zoneless and `OnPush`                                       | Yes. Signals throughout, `computed` for every derived value, no `markForCheck`.                                                                   |
| Every subscription and listener torn down                   | Yes. `DestroyRef.onDestroy` releases the roving handle, the removal-focus handle, the overflow observer and the `MutationObserver`.                |
| A static attribute the consumer wrote survives              | Yes. `HostAttributeToken` reads `role`, `aria-label`, `aria-labelledby` and `id` before the host bindings write anything.                          |
| An entry point others depend on stays a single class        | Yes. `@slotted/angular/tabs` and `@slotted/angular/toolbar`; neither imports the other.                                                            |

## Tokens

Both families read the control scales — `--slotted-control-height-*`,
`--slotted-control-font-size-*`, `--slotted-control-padding-inline-*`,
`--slotted-control-gap-*`, `--slotted-control-icon-size-*` — so the three sizes
and the three densities are one decision each. Every family token falls back to
a foundation token, and no new step is added to any scale: the marker is
`--slotted-border-width-thick`, the track is `--slotted-border-width-thin`, and
the paging control is one control icon wide.
