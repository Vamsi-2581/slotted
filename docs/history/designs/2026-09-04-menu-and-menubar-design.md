# Menu and Menubar design

The decisions this pair takes, and what each one costs. The capabilities and
their sources are in
`docs/history/designs/2026-09-04-menu-and-menubar-capability-inventory.md`;
nothing is re-argued here.

## 1. Two families, one machine

`menu` is the surface: a layer holding commands, opened from a control the
consumer owns, from an item of another menu, or from a trigger on a bar.
`menubar` is the bar: a row of triggers with one tab stop, holding `menu`
unchanged.

Base UI reached the same split and Radix did not: its `Menubar` re-exports
sixteen parts that its `DropdownMenu` already has, and the two copies are free
to drift. The cost of this split is one indirection — a `menu` has to know
whether it sits inside a `menubar`, inside another `menu`, or on its own — and
it is paid once, in a context each binding already has to carry.

The same rule decides the submenu: a submenu is a `menu` nested in a `menu`,
not a second component. What changes is the trigger and three keys, and both
follow from the surrounding context rather than from a prop the consumer sets.

| Where a `menu` is                | Its trigger renders                                       | What changes                                                                                            |
| -------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| On its own                       | the consumer's element, wired                              | `bottom` / `start`, opens on press                                                                        |
| Inside a `menubar`               | `[data-ui='menubar'] [data-part='trigger']`, `role="menuitem"` | opens on press, and on pointer entry once the bar has a menu open; inline arrows move to the next trigger |
| Inside another `menu`            | `[data-ui='menu'] [data-part='item']`, `aria-haspopup="menu"` | `inline-end` / `start`, opens on hover after a delay and on the inline-end arrow                       |

## 2. Anatomy

### 2.1 `menu`

```
┌─ root ─ the layer, positioned and animated ───────────────┐
│  ┌─ content ─ role="menu" ─ scrolls ──────────────────┐   │
│  │ group ─ role="group"                               │   │
│  │   group-label                                      │   │
│  │   item ─ role="menuitem" ────────────────────────┐ │   │
│  │   │ indicator │ icon │ label      │ shortcut    │ │ │   │
│  │   │           │      │ description│             │ │ │   │
│  │   └──────────────────────────────────────────────┘ │   │
│  │ separator ─ role="separator"                       │   │
│  │ item ─ role="menuitemcheckbox" ─ aria-checked      │   │
│  │ item ─ aria-haspopup="menu" ─ opens a submenu      │   │
│  │ empty                                              │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

Twelve parts: `root`, `content`, `group`, `group-label`, `item`, `indicator`,
`icon`, `label`, `description`, `shortcut`, `separator`, `empty`.

The gap between the trigger and the surface is the layer's own padding, as
`tooltip` and `popover` set it: the pointer never crosses page on its way from a
parent item to a submenu, which is half of why the grace area has anything to
work with.

There is no `trigger` part, for the reason `popover`'s contract records: a
standalone menu's trigger is the consumer's own element, very often another
family's root, and writing `data-part="trigger"` over it would silently unstyle
it. The family writes the wiring and `data-open` on it and nothing else. In a
menubar the trigger is the bar's own element and carries `data-part="trigger"`
of `menubar`; in a submenu it is `data-part="item"` of the parent `menu`.

There is no arrow. A menu hangs from its own button at `align="start"`, so the
button is what says where the menu came from; `popover` owns the anchored panel
that points at something.

The chevron on an item that opens a submenu is drawn by the stylesheet from
`--slotted-icon-chevron-right`, mirrored in a right-to-left document. It is
furniture rather than a part: the family owns the statement "this opens a
submenu", the same way it owns the check in a checkbox item.

### 2.2 `menubar`

```
┌─ root ─ role="menubar" ─ one tab stop ────────────────────┐
│  trigger   trigger   trigger   trigger                    │
└───────────────────────────────────────────────────────────┘
```

Two parts: `root` and `trigger`. Everything a bar holds beyond that is the
`menu` family, which is the point of the split in §1.

### 2.3 The item is a grid, and the content owns its columns

The content declares `grid-template-columns: auto auto 1fr auto` — indicator,
icon, label, shortcut — and every item, group and group label passes through
those columns with `grid-template-columns: subgrid`. Four consequences, and they
are the reason the item is not a flex row:

- Labels line up across a menu whether or not the item above has an icon, which
  is what Radix's userland `inset` class exists to approximate.
- The shortcut column is as wide as the widest shortcut and never narrower, so a
  long translated label wraps at its own measure instead of eating it.
- A column with nothing in it collapses to zero width, and the content drops its
  gap for it with `:not(:has(…))`, so a menu of plain commands has no empty
  gutter.
- A group is a grid area that spans every column, so its items keep the menu's
  columns instead of starting a second set.

## 3. State

| Family    | Capability  | Controlled | Uncontrolled     | Request            | Reasons                                                              |
| --------- | ----------- | ---------- | ---------------- | ------------------ | -------------------------------------------------------------------- |
| `menu`    | `open`      | `open`     | `defaultOpen`    | `onOpenChange`     | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `dismiss`, `programmatic` |
| `menu`    | `checked`   | `checked`  | `defaultChecked` | `onCheckedChange`  | `pointer`, `keyboard`                                                 |
| `menu`    | `selection` | `value`    | `defaultValue`   | `onValueChange`    | `pointer`, `keyboard`                                                 |
| `menubar` | `value`     | `value`    | `defaultValue`   | `onValueChange`    | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `dismiss`, `programmatic` |

`select` is the reason a menu closes because an item ran, and it is what tells a
consumer's handler apart from a dismissal. `checked` belongs to the checkbox
item and `selection` to the radio group, each holding its own value: a menu with
three checkbox items has three independent states, and a radio group has one.

A menubar holds the identity of the open menu rather than a boolean per menu,
which is the only model that cannot represent two open menus at once. A `menu`
inside a bar reads its own `open` from that value and asks the bar to change it,
so the two state models compose instead of competing: the menu's `onOpenChange`
still fires, and the bar's `onValueChange` is what an application listens to.

Every request is cancellable, as `@slotted/core/state` makes every request
cancellable. A menu that guards unsaved work refuses the close in the handler.

## 4. The pattern, item by item

Source: **Menu and Menubar Pattern**, WAI-ARIA Authoring Practices,
<https://www.w3.org/WAI/ARIA/apg/patterns/menubar/>, read 2026-09-04, and
**Menu Button Pattern**, <https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/>,
same date. The keyboard table below is transcribed from the first, in its order.

| Key                        | The pattern's effect                                                                                                                               | Where focus lands                          | Answered by                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `Tab` into a menubar       | First time: the first item. Afterwards: optionally the item that last had focus, otherwise the first enabled one                                    | a menubar trigger                            | `roving-tabindex`; the bar keeps the last stop, which is the optional half     |
| `Tab` in a menu or menubar | Move focus out and close every menu and submenu                                                                                                    | the next element in the page                 | the family's own key handler; `Tab` is never used to move between items        |
| `Enter`                    | On an item with a submenu: open it and focus its first item. Otherwise: activate the item and close the menu                                        | the submenu's first item, or the trigger     | the item; `closeOnSelect` decides the second half and defaults to `true`       |
| `Space`                    | Optional: toggles a checkbox item without closing; checks a radio item without closing; opens a submenu; activates a plain item                     | unchanged, or the submenu's first item       | all four optional behaviours are taken                                          |
| `ArrowDown`                | In a menubar, on an item with a submenu: open it and focus its first item. In a menu: next item, optionally wrapping                                | the next item                                | `arrow-navigation`, `loop` default `true`                                       |
| `ArrowUp`                  | In a menu: previous item, optionally wrapping. Optional: in a menubar, open the submenu and focus its **last** item                                 | the previous item, or the submenu's last item | the optional half is taken: `ArrowUp` on a bar trigger opens onto the last item |
| `ArrowRight`               | In a menubar: next trigger, optionally wrapping. In a menu on an item with a submenu: open it and focus its first item. In a menu on an item without one: close every menu, move to the next menubar trigger, and — recommended — open its menu without moving focus into it | as described                                 | the family, reading the menubar context; the recommended variant is taken       |
| `ArrowLeft`                | In a menubar: previous trigger. In a submenu of a menu item: close it and return focus to the parent item. In a submenu of a menubar item: close it, move to the previous trigger, and open its menu without entering it | as described                                 | the family, same context                                                        |
| `Home`                     | First item of the current menu or menubar                                                                                                          | the first item                               | `arrow-navigation`, which ships it whether or not wrapping is on                |
| `End`                      | Last item                                                                                                                                          | the last item                                | `arrow-navigation`                                                              |
| A printable character      | Optional: move to the next item whose label begins with it                                                                                         | the matched item                             | `packages/core/src/typeahead`, adopted rather than optional                     |
| `Escape`                   | Close the menu holding focus and return focus to whatever opened it                                                                                | the trigger, or the parent item              | `dismissable-layer` for the topmost-layer rule, `focus-scope` for the return    |

Both axes are mirrored: in a right-to-left document `ArrowLeft` and
`ArrowRight` exchange roles, which `arrow-navigation`'s `direction` already
does. A vertical menubar swaps the pairs as the pattern's note 5 requires.

The pattern's four notes, and this family's answer:

1. **Disabled items are focusable and cannot be activated.** Taken.
   `arrow-navigation`'s `includeAriaDisabled` keeps an `aria-disabled` item in
   the ring; the item is never a natively disabled `button`, so the platform
   does not remove it.
2. **A separator is not focusable or interactive.** Taken.
3. **Escape or Enter may return focus to an invoking context.** Taken, as the
   `finalFocus` escape hatch; the default destination is the trigger.
4. **An item that both acts and opens a submenu.** Not taken. The pattern
   recommends against it and a consumer who needs it composes an item with a
   submenu trigger of their own.

Roles, states and properties, from the same page:

| Requirement                                                              | Answered by                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `role="menu"` or `role="menubar"` on the container                       | `content`, and `menubar`'s `root`                                                                 |
| Items are `menuitem`, `menuitemcheckbox` or `menuitemradio`              | `item`, whose role follows the kind of item it is                                                 |
| A submenu's `menu` is the sibling immediately after its parent item      | Departure. The layer is portalled, so `aria-controls` from the parent item names it instead — recorded with its cost in §8 |
| Parent item has `aria-haspopup="menu"` and `aria-expanded`               | the item, both written                                                                            |
| Roving `tabindex`, or `aria-activedescendant`                            | Roving. Real focus is what lets `:focus` paint the highlight and what a screen reader follows      |
| `aria-checked` on a checked checkbox or radio item                       | the item                                                                                          |
| `aria-disabled` on a disabled item                                       | the item                                                                                          |
| Groups separated by `role="separator"` with a consistent `aria-orientation` | `separator`, `horizontal` in a vertical menu                                                    |
| A menubar is named by `aria-labelledby` or `aria-label`                  | the consumer's, and the reference page says so                                                    |
| `aria-orientation="vertical"` on a vertical menubar                      | `menubar`'s `orientation`                                                                         |
| A menu is named by the item or button that controls it                   | `aria-labelledby` to the trigger, and an instance may state `aria-label` instead                   |

The Menu Button pattern adds `Enter`, `Space`, `ArrowDown` (opens onto the first
item) and `ArrowUp` (opens onto the last) on the trigger. All four are taken.

## 5. What lands in `packages/core` first

Both modules are new ground, and `docs/build-briefing.md` requires them to be
justified at the gate and committed before the family that found them.

### `packages/core/src/typeahead`

One question: which item a sequence of printable characters selects.

```ts
createTypeahead({ timeout = 500, locale })
  → { query, match(character, labels, from), reset(), destroy() }
```

- The buffer accumulates while the reader keeps typing and resets after
  `timeout` of silence.
- The same character pressed repeatedly cycles through the items starting with
  it, which is how a menu with four items beginning with `S` is reachable.
- Matching is locale-sensitive, through `Intl.Collator` at base sensitivity, as
  `docs/component-features.md` §2.9 requires of typeahead. `Ä` matches `a`.
- It matches labels, not elements: the caller supplies the strings and gets an
  index back, so nothing about it knows what a menu is. Wave 6's collection
  review inherits it for `listbox`, `select` and `combobox`.

### `packages/core/src/pointer-intent`

One question: is the pointer moving toward that rectangle.

```ts
createPointerIntent({ target, origin, timeout = 300, onSettled })
  → { destroy() }
headingTo(previous, current, rect) → boolean
```

- The submenu stays open while the pointer's own path, from where it was to
  where it is, still points into the submenu's rectangle — so the pointer may
  cross three items on the diagonal without the submenu closing under it.
- The grace ends when the path stops pointing there, or after `timeout` with no
  movement, whichever comes first. Both are needed: a pointer parked on another
  item is not travelling anywhere.
- The rectangle is the submenu's, as `positioner` resolved it, so a submenu that
  flipped to the other inline side gets a grace area on the side it actually
  landed on. `preview-card` in wave 8 is the second consumer.

## 6. React

Idiom, from `.claude/skills/component/references/frameworks.md`: function
components, `useId`, context for the compound family, `render` for element
substitution, native props forwarded, `undefined` defaults so an unset value
defers to the provider.

```tsx
<Menu open={open} onOpenChange={(request) => …} size="md" side="bottom" align="start">
  <MenuTrigger render={<Button variant="outline" />}>Actions</MenuTrigger>
  <MenuContent>
    <MenuGroup>
      <MenuGroupLabel>File</MenuGroupLabel>
      <MenuItem onSelect={open} shortcut="Mod+O">Open…</MenuItem>
      <MenuItem onSelect={save} shortcut="Mod+S" disabled>Save</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>Wrap lines</MenuCheckboxItem>
    <MenuRadioGroup value={theme} onValueChange={setTheme}>
      <MenuRadioItem value="light">Light</MenuRadioItem>
      <MenuRadioItem value="dark">Dark</MenuRadioItem>
    </MenuRadioGroup>
    <MenuSeparator />
    <Menu>
      <MenuTrigger>Export</MenuTrigger>
      <MenuContent>
        <MenuItem>PDF</MenuItem>
      </MenuContent>
    </Menu>
    <MenuSeparator />
    <MenuItem tone="danger" onSelect={remove}>Delete…</MenuItem>
  </MenuContent>
</Menu>
```

A `Menu` inside a `MenuContent` is a submenu, and a `Menu` inside a `Menubar` is
one of the bar's menus. Neither needs a prop to say so, and the trigger renders
the right element in all three places.

| Question                                                            | Answered by                                                                                                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason  | `open` / `defaultOpen` / `onOpenChange(request)`, and the same shape for `checked` and for the radio group's `value`                    |
| Application defaults set once                                       | `MenuDefaultsProvider` and `useMenuDefaults`, `MenubarDefaultsProvider` and `useMenubarDefaults`, as `tooltip` and `popover` hold them  |
| Substituting the rendered element of each public part               | `render` on trigger, content, item, group, separator; an item that is a link is `render={<a href=… />}` and keeps `role="menuitem"`     |
| The consumer's own handler still runs                               | composed, never replaced: the family calls the consumer's `onClick`, `onKeyDown` and `onPointerEnter` and then does its own work        |
| The native element and the imperative actions                       | `ref` on every part; `useMenu()` returns `{ open, close, focus, focusItem }`, which is what a keyboard shortcut outside the menu needs |
| Server rendering without a hydration mismatch                       | `useId` for the trigger, content and group-label identifiers; no layout read during render — positioning happens in an effect           |
| Every state a consumer may style is in the DOM                      | `data-open`, `data-disabled`, `data-checked`, `data-loading`, `data-side`, `data-align`, `data-tone`, `data-size`                       |
| Each part's props type is the native element's, extended            | `ComponentPropsWithRef<'div'>`, `<'button'>` on the trigger and the item                                                                |

### 7. Angular

Idiom: standalone, `input()` / `model()` / `output()`, `computed`, `host`
metadata, `ViewEncapsulation.None`, `exportAs`, `inject()`, entry points.

```html
<button slMenuTrigger [slMenu]="fileMenu">Actions</button>

<sl-menu #fileMenu [(open)]="open" size="md" side="bottom" align="start">
  <sl-menu-group>
    <sl-menu-group-label>File</sl-menu-group-label>
    <button slMenuItem shortcut="Mod+O" (select)="open()">Open…</button>
  </sl-menu-group>
  <sl-menu-separator />
  <button slMenuItem slMenuCheckboxItem [(checked)]="wrap">Wrap lines</button>
</sl-menu>
```

| Question                                                    | Answered by                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A two-way value in the form the ecosystem expects           | `model()` for `open`, `checked` and the radio group's `value`; `output()` for `openChange` carrying the reason                                     |
| A control that belongs in a form                            | No. A menu is a list of commands, not a control with a value a form submits — `docs/component-features.md` §8: "itens representam comandos". A checkbox item's state belongs to the application, and `checkbox` is the family a form uses |
| Application defaults set once                               | `MENU_DEFAULTS` and `provideMenuDefaults()`, `MENUBAR_DEFAULTS` and `provideMenubarDefaults()`                                                     |
| A template reaching the instance                             | `exportAs: 'slMenu'`, `'slMenuItem'`, `'slMenubar'`                                                                                              |
| Substituting projected content, and keeping it lazy         | `ng-content` in the surface; the content of a menu with `mount="lazy"` is an `ng-template` rendered by `NgTemplateOutlet` on the first open        |
| Zoneless and `OnPush`                                       | signals throughout; the open state, the highlighted index and the resolved side are all `computed`                                                 |
| Every subscription and listener torn down                   | `DestroyRef` releases the positioner, the layer, the presence, the typeahead and the pointer intent, in that order                                 |
| A static attribute the consumer wrote survives              | `HostAttributeToken` for `role`, `aria-label` and `tabindex` on the trigger and the item                                                          |
| An entry point others depend on stays a single class        | `@slotted/angular/menu`; `@slotted/angular/menubar` imports it through that path and never reaches into its source                                 |

The asymmetry the two tables record: React composes the submenu by nesting
components, Angular by nesting `<sl-menu>` elements with a directive on the
parent item, because a directive on the consumer's own element is what that
ecosystem composes with and a `render` prop has no equivalent there.

## 8. Deliberate departures, and what each costs

| Departure                                                                                   | Cost                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The submenu is portalled, so it is not the DOM sibling of its parent item as the APG describes | The structural relationship is carried by `aria-controls` and `aria-haspopup` rather than by document order. Every surveyed implementation that portals makes the same trade; the alternative is a layer clipped by its own menu's `overflow`. |
| A menu item is a `button` element with `role="menuitem"`, not a `div`                       | The platform gives the press, the `Enter` and `Space` handling and the disabled semantics for free; `role="menuitem"` replaces `role="button"`, so a reader hears the item and not a button. Base UI and Ark render a `div` and reimplement all three. A native `disabled` would remove the item from the ring the APG wants it in, so a disabled item carries `aria-disabled` and `data-disabled` and keeps its `tabindex`. |
| No `modal`                                                                                  | An application that needs the page frozen behind a menu writes a dialog. Recorded with the reason in the inventory, §2.1.                                                                                                       |
| No arrow                                                                                    | A consumer who wants a pointing surface holding a list writes a `popover`. Recorded in the inventory, §2.1.                                                                                                                     |
| `hideWhenDetached` defaults to `true`, against `popover`'s `false`                          | A menu whose anchor scrolled away is a command list for a control the reader can no longer see. A consumer whose menu must survive that sets the flag.                                                                          |

## 9. Visual decisions

| Decision                | Value                                                                                                              | Reason                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Item height             | `--slotted-control-height-sm` / `-md` / `-lg` by size, as a minimum rather than a fixed height                      | An item with a description is taller and still hits the target minimum; density comes from the token rather than from a rule |
| Item inset              | `--slotted-control-padding-inline-*`                                                                                | A menu's inset is a control's inset, because an item is a control                                                          |
| Columns and gaps        | `--slotted-control-gap-*`                                                                                           | The gap between an icon and its label is the same gap a button uses                                                        |
| Surface                 | `--slotted-surface-raised`, `--slotted-border-subtle`, `--slotted-radius-lg`, `--slotted-shadow-md`                 | The same panel `popover` paints, because it is the same kind of layer                                                     |
| Highlight               | `--slotted-tone-secondary-subtle-hover` on `:focus`, `-subtle-active` on `:active`                                  | Painted on focus rather than hover, so exactly one item is highlighted whichever device is driving                         |
| Tone                    | the tone's `text` for the label and the icon, its `surface` for the highlight                                       | A destructive command reads as destructive before it is read at all                                                        |
| Measure                 | `14rem` / `16rem` / `20rem` by size, and `--slotted-positioner-available-height` bounds the content                 | Wide enough for a command with a shortcut, narrow enough to hang off a button                                              |
| Motion                  | `scale` and `opacity` from `--slotted-positioner-transform-origin`, `--slotted-duration-short` on exit, `-medium` on enter | The same grammar `tooltip` and `popover` use, so three layers do not open three different ways                       |
| Submenu chevron         | `--slotted-icon-chevron-right`, mirrored in right-to-left                                                           | Real geometry from the glyph scale; a character is never an icon                                                          |
| Checkbox and radio mark | `--slotted-icon-check` and `--slotted-icon-dot`                                                                     | The two marks the scale already holds, and the two a reader already knows from `checkbox` and `radio-group`               |
