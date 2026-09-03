# Tabs and Toolbar — capability inventory

Produced before either family was designed or read, as
`.claude/skills/component/references/capability.md` requires. Both families
existed before the rebuild; `3dc5184` removed them with the rest of the
schema-4 tree, so the shipped shape is evidence rather than a constraint, and
the delta is written under **Against what shipped**.

## 1. Surveyed

| #   | Families         | Source, read 2026-09-03                                                                   | What it calls them                                                              |
| --- | ---------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | tabs, toolbar    | WAI-ARIA APG — `w3.org/WAI/ARIA/apg/patterns/tabs/`, `.../patterns/toolbar/`               | Tabs, Toolbar                                                                    |
| 2   | tabs, toolbar    | Radix Primitives — `radix-ui.com/primitives/docs/components/{tabs,toolbar}`                | Tabs: Root/List/Trigger/Content. Toolbar: Root/Button/Link/ToggleGroup/Separator |
| 3   | tabs, toolbar    | Base UI 1.7.0 — `base-ui.com/react/components/{tabs,toolbar}`                              | Tabs: Root/List/Tab/Panel/Indicator. Toolbar: Root/Button/Link/Input/Group/Separator |
| 4   | tabs, toolbar    | React Aria — `react-spectrum.adobe.com/react-aria/{Tabs,Toolbar}.html`                     | Tabs/TabList/Tab/TabPanels/TabPanel/SelectionIndicator; Toolbar/Group            |
| 5   | tabs             | Ark UI 5.39.1 — `ark-ui.com/docs/components/tabs`                                          | Tabs: Root/List/Trigger/Content/Indicator                                        |
| 6   | tabs             | Angular Material — `angular/components@main:src/material/tabs/{tab-group,tab}.ts`          | MatTabGroup, MatTab, MatTabNavBar                                                |
| 7   | tabs             | Carbon — `carbondesignsystem.com/components/tabs/usage/`                                    | Tabs: line, contained, vertical, dismissible                                     |
| 8   | tabs, toolbar    | Fluent UI React v9 — `microsoft/fluentui@master:.../react-tabs/…/{TabList,Tab}.types.ts`, `.../react-toolbar/…/Toolbar.types.ts` | TabList/Tab, Toolbar                        |
| 9   | tabs             | Cloudscape — `cloudscape-design/components@main:src/tabs/interfaces.ts`                    | Tabs                                                                             |
| 10  | toolbar          | Primer — `primer.style/components/action-bar`; Kendo for Angular — `telerik.com/kendo-angular-ui/components/toolbar` | ActionBar, ToolBar                                     |
| 11  | both             | This repository — `packages/react/src/tag/tag-group.tsx` (an APG toolbar already), `packages/styles/src/button-group/button-group.css` | TagGroup, ButtonGroup                    |

### The pattern, transcribed

**Tabs.** `Tab` enters the list on the active tab and leaves it to the panel.
`Left`/`Right` in a horizontal list, `Up`/`Down` in a vertical one, move to the
previous and next tab and wrap at both ends, optionally activating. `Space` and
`Enter` activate a tab that focus did not activate. `Home` and `End` are
optional and move to the first and last tab. `Shift + F10` opens a tab's popup
menu. `Delete` is optional: it closes the tab, moves focus to the tab that
followed it, or to the one that preceded it when the closed tab was last, and
moves focus elsewhere entirely when the list empties. A horizontal list must
not listen for `Up`/`Down`, so those keys keep scrolling the page. `tablist`
defaults to `horizontal` and writes `aria-orientation` only for the other. Each
`tab` carries `aria-controls`; the active one carries `aria-selected="true"`
and every other `aria-selected="false"`; each `tabpanel` carries
`aria-labelledby` pointing back. A panel whose first meaningful content is not
focusable takes `tabindex="0"`.

**Toolbar.** One tab stop. Entry lands on the first control that is not
disabled, or optionally on the control that last had focus. `Left`/`Right`
navigate a horizontal toolbar and `Up`/`Down` a vertical one, wrapping
optionally; the cross axis may duplicate the navigation pair or be reserved for
operating a control. `Home` and `End` are optional. In a toolbar of several
rows, `Left`/`Right` wrap from row to row. A control that needs the navigation
pair should be the only one of its kind and the last element. Disabled controls
may stay focusable where discoverability matters. The role is for groups of
three or more controls.

## 2. Table stakes — tabs

| Capability                                       | Who ships it                                                                                  | Verdict            | Reason                                                                                                                                                                     |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selected value, controlled and uncontrolled      | Radix, Base UI, Ark, React Aria, Fluent, Cloudscape, Material (by index)                       | adopt              | `selection` state model: `value`/`defaultValue`/`onValueChange`, request carrying the reason and `cancel()`.                                                                |
| Automatic or manual activation                   | APG, Radix, Base UI (`activateOnFocus`), Ark, React Aria (`keyboardActivation`), Fluent (`selectTabOnFocus`), Carbon | adopt | Axis `activation`, default `automatic`, which is what the APG recommends when panels are already loaded.                                        |
| Orientation, arrow axis and `aria-orientation`   | all nine                                                                                       | adopt              | Axis `orientation`; a horizontal list refuses `Up`/`Down` so the page keeps scrolling.                                                                                       |
| Per-tab `disabled`, skipped by the arrows        | Radix, Base UI, Ark, React Aria (`disabledKeys`), Fluent, Cloudscape                            | adopt              | The native attribute on the tab's `button`.                                                                                                                                 |
| Disabling the whole family                       | React Aria (`isDisabled`), Fluent (`disabled`)                                                 | adapt              | Stated on the root and reaching every tab, so a page under a running job is one attribute.                                                                                  |
| Wrapping focus at the ends                       | Radix (`loop`), Base UI (`loopFocus`), Ark (`loopFocus`)                                       | adopt              | `loop`, default true, implemented by `@slotted/core/focus`.                                                                                                                 |
| Panel mount strategy                             | Radix (`forceMount`), Base UI (`keepMounted`), Ark (`lazyMount` + `unmountOnExit`), React Aria (`shouldForceMount`), Material (`preserveContent`), Cloudscape (`contentRenderStrategy`) | adapt | One axis with Cloudscape's names — `mount: active \| lazy \| eager` — because two booleans admit a combination that means nothing. |
| A marker that shows and follows the selection    | Base UI (`Indicator`), Ark (`TabIndicator`), React Aria (`SelectionIndicator`), Material (ink bar), Carbon (indicator) | adapt | The selected tab paints it, and the root records the direction of travel so the outgoing and incoming markers move the same way. No layout read: Base UI ships `renderBeforeHydration` because its indicator is measured. |
| A tab list that outgrows its container           | Carbon (scroll + buttons), Material (pagination), Cloudscape (scroll)                          | adopt              | The list scrolls, never wraps and never truncates a horizontal label; two paging controls appear only while there is somewhere to scroll.                                     |
| Dismissible tabs                                 | Carbon, Cloudscape, APG (`Delete`)                                                             | adopt              | A `dismiss` part, the `Delete` key, and the focus destination the APG names.                                                                                                 |
| A tab that is a link                             | Cloudscape (`href`), React Aria (`href` + router), Ark (`navigate`), Material (`MatTabNavBar`)  | adopt              | `href` renders the control as an anchor; a click carrying a modifier key is left to the browser, so a deep link still opens in a new browser tab.                             |
| An icon inside a tab                             | Fluent (`icon` slot), Carbon, Cloudscape                                                       | adopt              | Composition with `icon`: the family owns the box, never the artwork.                                                                                                        |
| A count or a second line beside the label        | Carbon (secondary label), Cloudscape (`action`), Primer UnderlineNav (counter)                 | adapt              | Composition with `badge` inside the tab, whose middle column may shrink.                                                                                                     |
| Size steps                                       | Fluent (`size`), Carbon (line and contained heights), Material                                 | adopt              | `size: sm \| md \| lg`, read from the control scales so a density moves all three.                                                                                           |
| Appearance                                       | Fluent (`appearance`), Carbon (line, contained), Cloudscape (`variant`)                        | adapt              | `variant: line \| contained`, named for what is drawn.                                                                                                                       |
| Equal-width tabs                                 | Material (`stretchTabs`, default true), Carbon (grid-aware)                                    | adopt              | `fit: auto \| equal`.                                                                                                                                                        |
| Actions beside the tab list                      | Cloudscape (`actions`)                                                                          | adopt              | One source, so not table stakes; taken anyway, because the root is already a grid and it is where a `toolbar` belongs.                                                        |
| Deselecting the active tab                       | Ark (`deselectable`)                                                                            | decline            | One source. A tabs family with nothing selected shows no panel; content that closes entirely is `collapsible accordion`.                                                     |
| Panel transition, dynamic height                 | Material (`animationDuration`, `dynamicHeight`)                                                 | decline            | One source. A sliding panel needs a clipping viewport that traps horizontal scrolling and fights the list's own scroll. The panel fades, which is what says it changed.       |
| Lazy label template                              | Material (`matTabLabel`)                                                                        | decline            | One source, and both bindings already project lazily: `ng-content` and children.                                                                                             |

## 3. Table stakes — toolbar

| Capability                                    | Who ships it                                                     | Verdict                     | Reason                                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="toolbar"` with a label                 | APG, Radix, Base UI, React Aria, Fluent, Primer                   | adopt                       | `aria-label` and `aria-labelledby` pass through. The APG's "three or more controls" is documented, not enforced: a role that disappears when a permission filter removes a button is a semantic changing behind the author. |
| One tab stop, roving tabindex                 | APG, Radix, Base UI, React Aria, Fluent, Primer, Kendo            | adopt                       | `@slotted/core/focus`, which `tag` already uses.                                                                                                     |
| Arrows on the flow axis, `Home`, `End`        | APG, Radix, Base UI, React Aria                                   | adopt                       | The whole table, including the mirrored arrows of a right-to-left document.                                                                          |
| Re-entry lands where focus was                | APG (optional), Radix, Base UI                                    | adopt                       | Already the shared handle's behaviour.                                                                                                               |
| Wrapping at the ends                          | Radix (`loop`), Base UI (`loopFocus`)                             | adopt                       | `loop`, default true.                                                                                                                                |
| Orientation and `aria-orientation`            | APG, all                                                          | adopt                       | Axis `orientation`.                                                                                                                                  |
| Separator between runs                        | Radix, Base UI, Fluent, Primer                                    | adopt                       | A `separator` part, perpendicular to the bar.                                                                                                        |
| A group of related controls                   | Base UI (`Group`), React Aria (`Group`), Fluent (`ToolbarGroup`)  | adopt                       | A `group` part with `role="group"`, its own label, and a boundary wider than the gap inside it.                                                       |
| Disabling the whole bar                       | Base UI (`disabled`)                                              | adapt                       | `data-disabled` on the root, mirrored to items, because a `div` cannot disable its children.                                                          |
| Disabled controls that stay focusable         | Base UI (`focusableWhenDisabled`, default true), APG note 2       | adapt                       | A control carrying `aria-disabled` keeps its place in the ring; one carrying the native attribute cannot be focused at all and is skipped. The platform decides, not an axis. |
| An item that owns the navigation keys         | Base UI (`Toolbar.Input`), APG ("reserved for operating controls") | adapt                      | Written as behaviour rather than as advice: an item that owns a key keeps it, and the cross axis moves focus instead.                                 |
| Overflow into a menu                          | Primer, Kendo, Fluent                                             | defer to `menu`, wave 5     | `docs/rebuild-order.md` names the deferral. What ships is the non-menu half: `overflow: wrap \| scroll`.                                              |
| Size steps                                    | Fluent (`size`), Kendo (`size`)                                   | adopt                       | `size: sm \| md \| lg` on the bar's own padding, gap and separator inset. The controls keep their own step.                                           |
| Appearance                                    | Fluent, Kendo                                                     | adapt                       | `variant: plain \| outline`.                                                                                                                         |
| Toggle state held by the bar                  | Fluent (`checkedValues`), Radix (`ToggleGroup`)                   | decline                     | `button` already ships `pressed`, and an exclusive set of segments is `toggle-group`, wave 8. A family holding another family's state is the desync `docs/state-and-events.md` exists to prevent. |
| A wrapper component per item type             | Radix (`Button`, `Link`), Base UI (`Button`, `Link`, `Input`)     | decline                     | Items are found in the DOM by being focusable, so `button`, `link`, `checkbox` and `text-field` drop in unwrapped. The cost — an item that is not focusable is not reachable — is in the anatomy. |

## 4. Differentiators

| What                                              | Why this library can                                                                                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A marker that moves with no layout read           | The direction of travel is an attribute rather than a measurement, so the family is right before hydration and needs no observer per tab.                  |
| A tab change that can be refused                  | The request carries a reason and `cancel()`. An unsaved form in the open panel is the case, and no surveyed tabs implementation can express it.             |
| The selection survives the high-contrast scheme   | The marker is a border and a weight, never a fill, so it stays when tints flatten. Carbon and Fluent both lean on a tint plus a bar.                        |
| Three densities on one contract                   | Tab height, type step and gap come from the control scales; `dense` is a table's toolbar rather than a second component.                                    |
| Right-to-left is the same component               | Logical properties throughout, and the arrow axis is read from the container's computed direction by `@slotted/core/focus`.                                 |
| An item may claim a key from the toolbar          | The APG's "reserved for operating controls" as behaviour: a text field or a slider keeps its own arrows and focus still moves on the cross axis.            |
| Two first-class bindings                          | Angular gets signals, `exportAs` and DI defaults; React gets `render` and context. Neither is levelled down to the other.                                   |

## 5. Gaps

| What a product hits and no surveyed implementation answers | The answer here                                                                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The selected tab is the one dismissed                        | The request names the neighbour taking the selection — the following tab, or the preceding one when the dismissed tab was last, which is the APG's focus rule applied to the value. Carbon and Cloudscape leave both to the consumer. |
| Every tab is dismissed                                       | The list empties without losing focus: the container is the last resort, which is what `@slotted/core/focus` already does for `tag`.                     |
| Twenty tabs in a 320-pixel drawer                            | The list scrolls, the selected tab is brought into view on selection and on arrow movement, and no horizontal label is ever truncated.                    |
| A toolbar that outgrows its bar before `menu` exists         | `overflow="wrap"` keeps every control visible on a second row, and the arrows wrap row to row because the item list is linear — the APG's multi-row bullet, for free. |
| A toolbar holding a text field                               | The field keeps `Left`/`Right`; focus leaves it with `Up`/`Down` or `Tab`. Base UI's answer is a sentence asking the author to place it last.             |
| An unbroken token as a tab label                             | It breaks inside its own tab rather than setting the list's width.                                                                                        |

## 6. Against what shipped

| Family    | What shipped (schema 4)                                                                                              | What ships now                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `tabs`    | Four members, three parts, `activation` and `selection` declared as capabilities with no state model, six scenarios     | One member, eight parts, a `selection` state model, dismissal, scrolling, two variants, three sizes, `fit` |
| `tabs`    | Stylesheet keyed on `.slotted-tabs`, eleven literal lengths, component tokens falling back to `GrayText`/`CanvasText`  | Keyed on `data-ui`, every length from a scale, no system colour behind a component token                   |
| `tabs`    | No hover on a selected tab, no press, no forced-colors rule, no transition                                              | The full state matrix, painted and photographed                                                            |
| `toolbar` | One part, one capability, `loop: true` declared and no keyboard anywhere in either binding                              | Roving focus, groups, separators, a spacer, key ownership, overflow                                        |
| `toolbar` | `.slotted-toolbar > .slotted-divider` — one family styling another family's class                                       | A `separator` part of its own; `divider`'s DOM is not a private API of this family                          |
