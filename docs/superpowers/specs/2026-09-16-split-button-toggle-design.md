# Split button and toggle design

Decisions taken before either family was written, as
`.claude/skills/component/references/frameworks.md` step 5 requires. The
capability inventory this rests on is
`docs/superpowers/specs/2026-09-16-split-button-toggle-capability-inventory.md`;
what it decided in one sentence: **`split-button` is a group of two `button`s
over `menu`, and `toggle` is the mode switch `toggle-group` paints, standing on
its own** — neither family paints a button of its own.

---

## 1. Anatomy

### `split-button`

```html
<div data-ui="split-button" data-part="root" role="group" data-tone="accent" data-variant="solid" data-size="md">
  <button data-ui="button" data-part="primary" data-tone="accent" data-variant="solid" data-size="md" type="button">
    <span data-part="label">Save</span>
  </button>
  <button data-ui="button" data-part="menu-trigger" data-tone="accent" data-variant="solid" data-size="md" data-shape="square"
          type="button" aria-label="More save options" aria-haspopup="menu" aria-expanded="false">
    <span data-part="icon" aria-hidden="true"></span>
  </button>
</div>
```

| Part           | Element  | Always | For                                                                                                           |
| -------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `root`         | `div`    | yes    | The group. `role="group"`, the three appearance axes, `data-disabled`, `data-loading`, `data-full-width`.     |
| `primary`      | `button` | yes    | `button`'s Button. The action, with `start`, `label`, `end` and `indicator` as its own parts.                 |
| `menu-trigger` | `button` | yes    | `button`'s IconButton, rendered as `menu`'s trigger. The chevron is drawn by this family in its `icon` part.  |

The two buttons carry `data-ui="button"` and a part name of this family. That
is composition against `button`'s contract: `button` selects itself by
`data-ui` alone (`packages/styles/src/button/button.css` l. 23) and reads no
`data-part` on its root, so the part slot is free for the family that owns the
composition, and both React and Angular write it after `button` has. The
alternative — the family painting two buttons of its own — is the second
`button` stylesheet the inventory refuses.

The menu is `menu` unchanged and none of it is re-exported: its content, items,
groups, separators and submenus are imported from `menu`, as `context-menu`
and `menubar` hold it.

### `toggle`

```html
<button data-ui="toggle" data-part="root" type="button" aria-pressed="true" data-pressed
        data-size="md" data-variant="outline">
  <span data-part="icon" aria-hidden="true"></span>
  <span data-part="label">Wrap</span>
</button>
```

| Part    | Element  | Always | For                                                                              |
| ------- | -------- | ------ | -------------------------------------------------------------------------------- |
| `root`  | `button` | yes    | The control. `aria-pressed` in both states, `data-pressed`, the two axes.        |
| `icon`  | `span`   | no     | The mark, aligned to the label's text rather than to its line box.               |
| `label` | `span`   | no     | The words. Absent on an icon-only toggle, which then draws square.               |

The element cannot become an `a`: `aria-pressed` on a link is a link announcing
a state a link does not hold. `render` in React and the directive in Angular
keep it a `button`.

## 2. Two toggles, and why

`button`'s ToggleButton is an **action that persists**: Follow, Subscribe,
Watch. It reaches a server, so it waits; it is one of five tones and three
variants, because it stands beside the other actions of a page. `toggle` is a
**mode**: Bold, Wrap, Pin. It is true the moment it is pressed, it is neutral
until on, and on is one colour across the library — the accent border around
the accent ground — because a mode is not a call to action. The two hold the
same state model, from `@slotted/core/state`, and the reference page of
`toggle` says which to reach for.

`toggle-group`'s item is the picture `toggle` paints. The design of 2026-09-10
kept the item inside the group so the group is the value's only owner, and
that stands. The reopen is recorded in `docs/build-order.md`: `toggle-group`'s
item becomes `toggle` deferring to the group's context, and the duplicated
paint leaves. Until then the two sheets are written twice, and each says so.

## 3. State

| Family         | Capability  | Controlled | Uncontrolled     | Request           | Value type            | Reasons                                                                     |
| -------------- | ----------- | ---------- | ---------------- | ----------------- | --------------------- | --------------------------------------------------------------------------- |
| `split-button` | `open`      | `open`     | `defaultOpen`    | `onOpenChange`    | `boolean`             | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `dismiss`, `programmatic` |
| `split-button` | `selection` | `value`    | `defaultValue`   | `onValueChange`   | `string \| undefined` | `pointer`, `keyboard`                                                       |
| `toggle`       | `pressed`   | `pressed`  | `defaultPressed` | `onPressedChange` | `boolean`             | `pointer`, `keyboard`                                                       |

`open` is the menu's own model surfaced through the family — the same reasons
in the same order, so a handler moved from a menu changes nothing. In React the
menu part forwards the three props to `Menu`; in Angular the state is
`sl-menu [(open)]` itself, and the family adds no second owner.

`selection` exists only under `remember`. The menu's items are then `menu`'s
radio items bound to the family's value, and choosing one is a `pointer` or a
`keyboard` request — the reasons `MenuRadioGroup` emits. Without `remember`
there is no value: the items are actions, and the primary does what its label
says. The silent update is refused because it changes what the next click does,
which is what `docs/build-order.md` states; with `remember` the reader has
been told, because the item they chose is announced as a checked radio and the
primary's label is the one they chose.

Neither family emits a request for a value equal to the one it holds.

## 4. Keyboard, sourced

### `split-button` — APG Button and APG Menu Button

Read at <https://www.w3.org/WAI/ARIA/apg/patterns/button/> and
<https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/> on 16 September 2026.
There is no APG split-button pattern; the primary is the Button pattern's
button and the trigger is the Menu Button pattern's, and every surveyed
implementation gives each its own tab stop.

| Key                     | On            | Effect                                                              | Focus lands on                          | Source                    |
| ----------------------- | ------------- | ------------------------------------------------------------------- | --------------------------------------- | ------------------------- |
| `Tab`                   | —             | Reaches the primary, then the menu trigger                          | Each in turn                            | platform                  |
| `Space` / `Enter`       | primary       | Runs the action                                                     | Stays                                   | platform                  |
| `Space` / `Enter`       | menu trigger  | Opens the menu                                                      | The first item                          | `menu`, Menu Button §Keyboard |
| `ArrowDown`             | menu trigger  | Opens the menu                                                      | The first item                          | `menu`, Menu Button §Keyboard (optional) |
| `ArrowUp`               | menu trigger  | Opens the menu                                                      | The last item                           | `menu`, Menu Button §Keyboard (optional) |
| `Escape`                | inside menu   | Closes the menu                                                     | The menu trigger                        | `menu`                    |
| `Tab`                   | inside menu   | Closes every surface and moves on                                   | The next element after the trigger      | `menu`                    |

`ArrowDown` on the primary does not open the menu. Fluent, Atlassian, PrimeNG
and Carbon bind nothing there, and a key that opens a surface from a button
whose name says "Save" is a surprise.

Roles and properties: root `role="group"`, named by the consumer's `aria-label`
when the pair needs one; primary is a `button` named by its content; trigger
`aria-haspopup="menu"`, `aria-expanded`, `aria-controls` while open, all
written by `menu`'s trigger, and `aria-label` written by the consumer, required
by the type. `disabled` on the root is the native attribute on both; `loading`
makes the trigger `aria-disabled` and keeps it focusable, so a reader who
reaches it hears why nothing opens.

### `toggle` — APG Button (toggle)

Read at <https://www.w3.org/WAI/ARIA/apg/patterns/button/> on 16 September
2026.

| Key               | Effect                    | Focus lands on | Source   |
| ----------------- | ------------------------- | -------------- | -------- |
| `Space` / `Enter` | Toggles the control       | Stays          | platform |

Roles and properties: `button` with `aria-pressed="true|false"` always present;
the label does not change with the state; `disabled` native. Inside `toolbar`
the bar owns the tab stop and the arrows; the toggle writes no listener.

## 5. Composition

`SplitButton` hands `tone`, `variant` and `size` to both halves through
`button`'s own defaults provider, the mechanism `button-group` uses; the
family's own defaults provider fills the three first. `disabled` and `loading`
travel through the family's context: the primary reads both, the trigger
reads `disabled` and reads `loading` as `aria-disabled`.

The menu part renders `Menu` with the trigger inside it and the consumer's
`MenuContent` as its children. Under `remember` it also wraps the content's
items in `MenuRadioGroup` bound to the family's value — so a consumer writes
`MenuRadioItem value="squash"` and nothing else. In Angular the consumer's
`sl-menu` sits inside the root and the radio group carries
`slSplitButtonChoices`, a directive that binds the group's value to the
directive's model both ways; the DI tree is the template tree, so the group
finds the split button above it however the layer is portaled.

## 6. Visual decisions

**The join is `button-group`'s, for two children.** Overlap of one border
width; one border painted in the shared column, the leading edge of the
trigger; corners on the ends only; the seam between two solid halves in the
tone's darkest step; the frame stated by the family for `outline` and `ghost`
under `pressed` and `disabled`, so a half does not redraw the bar around
itself; only focus raised. Each rule cites the measurement `button-group`
made. The trigger is square from the control height and never shrinks;
`fullWidth` grows the primary alone.

**The chevron.** `--slotted-icon-chevron-down` at `--slotted-control-icon-size-*`,
masked in `currentColor` on the IconButton's `icon` part. Under `data-open`
it does not turn: none of the six surveyed split buttons turns it, and a mark
that flips says the surface will close while the surface below is what the
reader is looking at. `select` turns its own because a select's arrow
discloses the value's list; a menu button's chevron is a promise, not a
state.

**`toggle` paints what `toggle-group`'s item paints.** The same tokens under
the family's own prefix — `--slotted-toggle-*` — the same accent pair when on,
the same neutral hover, the same press timing, the same disabled-and-on
reading, the same icon alignment to the text. A standalone control has room
around it, so the ring is held off the edge at `--slotted-focus-ring-offset`;
the joined bar's inward ring is the group's.

**Motion.** Colour changes take `--slotted-control-transition-duration`; a press
enters at `--slotted-duration-instant`. The menu's entry and exit are the
menu's. Nothing else moves.

**Density, direction, schemes.** Both read `--slotted-control-*`, so all three
densities are the theme's; every rule is logical, so `dir="rtl"` mirrors the
join and the chevron stays a chevron-down; both read semantic tokens only and
write no `forced-colors` block — the pressed toggle's edge is `Highlight`
through the theme, and `data-pressed` carries the state beside the colour.

## 7. Axes and defaults

| Family         | Axis        | Values                                              | Default    |
| -------------- | ----------- | --------------------------------------------------- | ---------- |
| `split-button` | `tone`      | `accent` `secondary` `success` `warning` `danger`   | `accent`   |
| `split-button` | `variant`   | `solid` `outline` `ghost`                           | `solid`    |
| `split-button` | `size`      | `sm` `md` `lg`                                      | `md`       |
| `split-button` | `fullWidth` | boolean                                             | `false`    |
| `split-button` | `remember`  | boolean                                             | `false`    |
| `split-button` | `disabled`  | boolean                                             | `false`    |
| `split-button` | `loading`   | boolean                                             | `false`    |
| `toggle`       | `size`      | `sm` `md` `lg`                                      | `md`       |
| `toggle`       | `variant`   | `outline` `ghost`                                   | `outline`  |
| `toggle`       | `disabled`  | boolean                                             | `false`    |

Resolution order: the consumer's prop, then the family's defaults provider,
then the value above. For the split button's three appearance axes, `button`'s
own provider sits between the two: a `ButtonDefaultsProvider` around a split
button with no axes of its own paints the pair.

## 8. React integration

| Question                                                                | `split-button`                                                                                                                                                                  | `toggle`                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason      | `open` / `defaultOpen` / `onOpenChange` on `SplitButtonMenu`, forwarded to `Menu`; `value` / `defaultValue` / `onValueChange(value, request)` on `SplitButton` under `remember` | `pressed` / `defaultPressed` / `onPressedChange(pressed, request)`, from `@slotted/core/state`                 |
| Defaults set once for the application                                  | `SplitButtonDefaultsProvider` / `useSplitButtonDefaults` — `tone`, `variant`, `size`                                                                                            | `ToggleDefaultsProvider` / `useToggleDefaults` — `size`, `variant`                                              |
| Substituting the rendered element of each public part                  | `render` on the root; `render` on `SplitButtonPrimary` and `SplitButtonMenuTrigger`, composed with `button`'s own                                                                | `render` on the root, kept a button                                                                             |
| The consumer's own handler still runs                                  | `onClick` on either half runs first and `defaultPrevented` is honoured, which is `button`'s rule; the menu's `onOpenChange` is the consumer's                                    | `onClick` runs first; a prevented click moves nothing                                                           |
| The native element and the imperative action                           | `ref` on every part; `ref` on `SplitButtonMenu` is `menu`'s handle — `open()`, `close()`, `focus()`                                                                              | `ref` to the button. No handle: nothing a toggle does is beyond its value                                       |
| Server rendering without a mismatch                                    | `menu`'s `useId`; nothing read from layout during render                                                                                                                         | Nothing generated                                                                                               |
| Every state a consumer may style is in the DOM                         | `data-disabled`, `data-loading`, `data-full-width` on the root; `data-open`, `data-disabled` on the trigger from `menu`; `button`'s own on both halves                            | `data-pressed`, `data-disabled`, `data-size`, `data-variant`                                                     |
| Each part's props type is the native element's, extended               | `ComponentPropsWithRef<'div'>`; `ButtonProps` and `IconButtonProps` minus the axes                                                                                               | `ComponentPropsWithRef<'button'>`                                                                                |

## 9. Angular integration

| Question                                              | `split-button`                                                                                                                                                                                           | `toggle`                                                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Two-way value in the signal form                     | `[(open)]` is `sl-menu`'s; `value` input, `defaultValue` and `valueChange` output of `ChangeRequest<string>` on `slSplitButton`, the shape `toggle-group` takes so the request carries its reason          | `pressed` input, `defaultPressed`, `pressedChange` output of `ChangeRequest<boolean>` — `SlToggleButton`'s shape, for the reason it records: a `model()` has one slot and cannot carry the reason |
| Reactive Forms and template forms                    | No. A split button is two actions; the primary's `type="submit"` submits the form it is in.                                                                                                              | No. `docs/component-features.md` §5: not a form control. `checkbox` and `switch` are.          |
| Defaults set once                                    | `provideSplitButtonDefaults()`                                                                                                                                                                           | `provideToggleDefaults()`                                                                      |
| A template can reach the instance                    | `exportAs: 'slSplitButton'`, `'slSplitButtonPrimary'`, `'slSplitButtonMenuTrigger'`                                                                                                                       | `exportAs: 'slToggle'`                                                                         |
| Substituting projected content, kept lazy            | Every part is a directive on the consumer's own element; the menu's content is the consumer's `sl-menu` template                                                                                        | The label is projected; `slToggleIcon` marks the icon on the consumer's own element              |
| Zoneless and `OnPush`                                | Signals throughout                                                                                                                                                                                       | Signals throughout                                                                              |
| Every listener torn down                             | `DestroyRef` for the click capture; the menu's listeners are `menu`'s                                                                                                                                    | `DestroyRef` for the two click listeners, as `SlToggleButton` does                              |
| A static attribute the consumer wrote survives       | `HostAttributeToken` for `role` and `aria-label` on the root; `data-part` on the trigger is a host binding of this component and outranks the null `slMenuTriggerFor` writes, verified by the spec        | `HostAttributeToken` for `type`                                                                 |
| An entry point others depend on stays a single class | `@slotted/angular/split-button` imports `@slotted/angular/button` and `@slotted/angular/menu`; `@slotted/angular/toggle` imports nothing of the library                                                   | leaf                                                                                            |

## 10. Declined, with the owner instead

| Declined                                        | Owner instead       | Why                                                                                                                                                           |
| ----------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A vertical split button                         | —                   | No surveyed implementation. A column of two is `button-group` vertical.                                                                                        |
| The menu's items as data (`model`, `items`)     | `menu`              | PrimeNG and Kendo take an array; here the items are elements, so a submenu, a separator and a shortcut are what `menu` already ships.                          |
| A chevron that turns while open                 | —                   | No surveyed split button turns it; a menu button's chevron is a promise, not a state.                                                                          |
| Opening the menu from the primary's ArrowDown   | —                   | A key that opens a surface from a button whose name says the action; no surveyed implementation binds it.                                                     |
| `loading` on `toggle`                           | `button`            | ToggleButton waits; a mode does not.                                                                                                                           |
| Five tones on `toggle`                          | `button`            | A mode is one colour, the pair the foundation names for the chosen toggle.                                                                                    |
| `value` on `toggle`                             | `toggle-group`      | The group owns its item; reopen recorded.                                                                                                                      |
| `ControlValueAccessor` on either                | `checkbox`, `switch`, `segmented-control` | Neither is a form control.                                                                                                                  |
| An indicator part on `toggle`                   | the consumer        | `[data-pressed]` on the root and the `icon` part; two lines, no reserved width.                                                                                |
