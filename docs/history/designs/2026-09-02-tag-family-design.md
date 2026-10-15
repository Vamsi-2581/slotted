# Tag family design

Rebuild of `tag` against schema 5 and the token foundation. Wave 2, mode
`refazer`, guide section 10. The family leaves `specs/legacy-families.json` in
the same commit. The public API breaks in every axis; the moves are at the end.

## Capability inventory

### Surveyed

Twelve implementations, read on 2 September 2026. Sources chosen to disagree:
two are headless behaviour libraries that model the family as a collection,
four are opinionated design systems that model it as four separate components,
four ship one component with a `closable` flag, and two ship a box with one
prop.

| Source | Reference | What it calls the family |
| ------ | --------- | ------------------------ |
| React Aria Components | <https://react-spectrum.adobe.com/react-aria/TagGroup.html> | `TagGroup` + `TagList` + `Tag`, a collection: `selectionMode`, `selectedKeys`/`defaultSelectedKeys`/`onSelectionChange`, `disabledKeys`, `disallowEmptySelection`, `selectionBehavior`, `escapeKeyBehavior`, `onRemove`, `renderEmptyState`, `Button slot="remove"`; `role="grid"` with `row`/`gridcell`; render-prop states `[data-hovered]`, `[data-pressed]`, `[data-selected]`, `[data-focus-visible]`, `[data-disabled]`, `[data-allows-removing]` |
| Fluent UI v9 | `Tag.types.ts`, `TagGroup.types.ts`, `InteractionTag.types.ts` <https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-tags> | three components: `Tag` (`appearance`, `shape`, `size`, `dismissible`, `selected`, `disabled`, `value`, slots `media`/`icon`/`primaryText`/`secondaryText`/`dismissIcon`), `InteractionTag` = `InteractionTagPrimary` + `InteractionTagSecondary` as two sibling controls, `TagGroup` (`onDismiss`, `size`, `appearance`, `selectedValues`, `onTagSelect`) |
| Angular Material | `chips.md` <https://github.com/angular/components/tree/main/src/material/chips> | `MatChipSet`/`MatChipListbox`/`MatChipGrid` with `MatChip`/`MatChipOption`/`MatChipRow`, plus the `matChipRemove`, `matChipAvatar` and `matChipTrailingIcon` directives; arrow keys move between chips and Space selects; a chip grid is `role="grid"` and an editable chip asks for an `aria-description` naming the edit key; `hideSingleSelectionIndicator` |
| MUI | <https://mui.com/material-ui/react-chip/> | `Chip` (`variant` `filled\|outlined`, `color` ×8, `size` `small\|medium`, `label`, `avatar`, `icon`, `deleteIcon`, `onDelete`, `onClick`, `clickable`, `component`, `disabled`, `skipFocusWhenDisabled`); a deletable or clickable chip is a button in the tab order, and `Backspace`/`Delete` on `keyup` call `onDelete` while `Escape` blurs |
| Ant Design | <https://ant.design/components/tag> | `Tag` (`color`, `variant`, `bordered`, `closable`, `closeIcon`, `onClose` cancellable with `preventDefault`, `icon`, `disabled`, `href`, `target`, `classNames`/`styles` per semantic part) plus `Tag.CheckableTag` (`checked`, `onChange`) |
| Carbon | <https://carbondesignsystem.com/components/tag/usage/>, `Tag.tsx` <https://github.com/carbon-design-system/carbon> | four components: `Tag` (read-only), `DismissibleTag`, `SelectableTag`, `OperationalTag`; `size` `sm\|md\|lg`, a component-token colour list, decorative icon, and a title truncated with an ellipsis whose full text is disclosed in a tooltip on hover and on focus (`isEllipsisActive` + `DefinitionTooltip`) |
| GitHub Primer | `Token.tsx` <https://github.com/primer/react/tree/main/packages/react/src/Token> | `Token` (`text`, `size` ×4, `leadingVisual`, `onRemove`, `hideRemoveButton`, `href`, `onClick`, `isSelected`); when a token both acts and removes, the interactive props move off the outer box and onto the inner text container, and the token renders `<VisuallyHidden> (press backspace or delete to remove)</VisuallyHidden>` |
| PatternFly | <https://www.patternfly.org/components/label/> | `Label` (`color` ×8, `variant` `filled\|outline`, `isCompact`, `icon`, `onClose`, `closeBtnAriaLabel`, `href`, `onClick`, `isEditable`/`onEditComplete`, `isDisabled`, `textMaxWidth` with a tooltip on overflow) plus `LabelGroup` (`numLabels`, `isCompact`, `categoryName`, overflow into “N more”) |
| Chakra UI v3 | <https://chakra-ui.com/docs/components/tag> | `Tag.Root` + `Tag.StartElement` + `Tag.Label` + `Tag.EndElement` + `Tag.CloseTrigger`; composition only, no behaviour |
| Mantine | <https://mantine.dev/core/pill/> | `Pill` (`withRemoveButton`, `onRemove`, `size`, `radius`, `disabled`) plus `Pill.Group`, designed to sit inside an input |
| Shoelace / Web Awesome | <https://shoelace.style/components/tag> | `sl-tag` (`variant` ×5, `size`, `pill`, `removable`, `sl-remove` event) |
| Atlassian | <https://atlassian.design/components/tag/examples> | `Tag` (`text`, `color` ×10, `appearance` `default\|rounded`, `href`, `removeButtonLabel`, `onBeforeRemoveAction` cancellable, `onAfterRemoveAction`) plus `TagGroup` |

Radix Primitives and Base UI ship no tag: the behaviour they would make
headless is a collection, and both put it in a combobox instead.

**The pattern.** The WAI-ARIA Authoring Practices carry no tag or chip pattern.
The pattern index at <https://www.w3.org/WAI/ARIA/apg/patterns/> holds
thirty-two entries and neither string occurs on the page; the list was read
programmatically rather than recalled. The applicable official guidance is the
**Toolbar** pattern (“a container for grouping a set of controls, such as
buttons”), the **Grid** pattern’s “Layout Grids for Grouping Widgets” section,
the **Button** pattern for a chip that acts and for the remove control, and
`aria-pressed` in WAI-ARIA 1.2 for a chip that holds a selection. The itemized
comparison is in the accessibility section below.

### Table stakes

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Tone or semantic colour | all twelve | adopt | `tone`: the library’s five. A tag accepting an arbitrary colour is the contract violation `docs/product/prd.md` 2.4 names, and Carbon’s and Atlassian’s ten-colour lists are a categorisation device the consumer can build from five tones plus its own token. |
| Painting axis | Fluent (`appearance`), MUI (`variant`), Ant (`variant`), PatternFly (`variant`), Shoelace, Primer | adopt | `variant`: `solid`, `soft`, `outline` — the same three words `badge` and `button` use. |
| Size scale | Fluent, MUI, Carbon, Primer, Mantine, Shoelace, Ant | adopt | `size`: `sm`, `md`, `lg`, reading the control type, glyph and gap scales so a tag shrinks with density beside the controls it sits with. |
| Pill and square shape | Fluent (`shape`), Shoelace (`pill`), Atlassian (`appearance: rounded`), Mantine (`radius`) | adopt | `shape`: `pill`, `square`. |
| A static chip that only labels | all twelve | adopt | member `tag`. |
| A chip that runs a command | Carbon (`OperationalTag`), Fluent (`InteractionTag`), MUI (`onClick`), PatternFly (`onClick`), Primer (`onClick`) | adopt | member `tagButton`. |
| A chip that navigates | Ant (`href`), PatternFly (`href`), Primer (`href`), Atlassian (`href`) | adopt | member `tagLink`. |
| A chip that holds a selection | Carbon (`SelectableTag`), Ant (`CheckableTag`), Fluent (`selected`), React Aria (`selectionMode`), Angular Material (`MatChipOption`), Primer (`isSelected`) | adopt | member `tagToggle`, with the full controlled/uncontrolled pair the six of them do not ship between them. |
| Removal | all twelve | adopt | `onRemove`, a cancellable request carrying a reason. Available on every member, because a filter chip that acts *and* removes is the common case and is the one MUI and Primer both had to solve. |
| Keyboard removal from the chip itself | MUI (`Backspace`/`Delete` on `keyup`), Primer (same, and it announces the shortcut), React Aria, Angular Material | adopt | `Backspace` and `Delete` on any control inside a removable tag. |
| Focus lands somewhere sensible after a removal | React Aria, Angular Material | adopt | the `group` part restores focus to the control that took the removed one’s place, then to the previous one, then to the group itself. |
| A named remove control with its own accessible name | Ant (`closeIcon`), PatternFly (`closeBtnAriaLabel`), Atlassian (`removeButtonLabel`), Carbon, Fluent (`dismissIcon`), Primer | adapt | the `remove` part, named by `aria-labelledby` over the word and the tag’s own label, so it announces “Remove Design” rather than “Remove”. Four of the six make the consumer repeat the value in a string. |
| A cancellable removal | Ant (`onClose` + `preventDefault`), Atlassian (`onBeforeRemoveAction`) | adopt | `@slotted/core/state` already models a request that can be refused; the removal request uses the same object. |
| A glyph or avatar before the words | Fluent (`media`/`icon`), MUI (`avatar`/`icon`), Carbon, Ant, Primer (`leadingVisual`), Mantine, Chakra, PatternFly | adopt | `start` and `end`, the anatomy `button` and `badge` already use. |
| A group that lays the chips out and owns the keyboard | React Aria (`TagGroup`), Fluent (`TagGroup`), Angular Material (`MatChipSet`), Mantine (`Pill.Group`), PatternFly (`LabelGroup`), Atlassian (`TagGroup`) | adopt | the `group` part: wrapping layout, one tab stop, arrow navigation, and the focus restoration above. |
| One tab stop for a run of chips | React Aria, Fluent, Angular Material | adopt | roving tabindex over every control in the group, from `@slotted/core/focus`. |
| Disabled | Fluent, MUI, Ant, PatternFly, Mantine, React Aria (`disabledKeys`) | adopt | `disabled` on every member, and separately on the `remove` control. |
| Element substitution | MUI (`component`), Primer (`as`), Chakra (`asChild`), Carbon (polymorphic) | adopt | `render` in React; in Angular the directive is written on the consumer’s own element. |
| Truncation of a long value | Carbon, PatternFly (`textMaxWidth`) | adapt | one line, clipped with an ellipsis; the whole string stays in the DOM, in the accessibility tree and findable by page search. The disclosure both of them ship is deferred below. |
| Per-part styling hooks | Ant (`classNames`/`styles`), Fluent (slots), Chakra (parts) | adapt | `data-part` selectors, which are contract here; class names explicitly are not (`docs/product/prd.md` 14). |
| Defaults for the whole application | Ant (`ConfigProvider`) | adopt | `TagDefaultsProvider` and `provideTagDefaults`. One implementation, adopted anyway because the library already treats it as table stakes: `button`, `badge` and `card` all ship it, and a family that did not would be the odd one. |
| Disclosure of a truncated value | Carbon (`DefinitionTooltip` on hover and focus), PatternFly (tooltip on overflow) | defer to `tooltip` | Guide section 8, wave 5. Both implementations disclose with a tooltip, and measuring whether the ellipsis is active is a layout read this family would have to do on every render; the family that owns hover-and-focus disclosure should own it once. |
| Editable chip | Angular Material (`editable`), PatternFly (`isEditable`) | defer to `tags-input` | Guide section 6, `MultiSelect / Tags Input`, listed in `docs/process/build-order.md` among the deferred families. An editable chip is a text field wearing a chip, and it needs the field’s validity, its commit-and-revert keys and its own state model. |
| Overflow into “N more” | PatternFly (`numLabels`), Carbon, Atlassian | defer to `tooltip` and `popover` | The overflow control is a disclosure: it needs a surface to reveal the hidden chips in, and the two families that own surfaces arrive in wave 5. The count itself composes today — the consumer slices its own array and puts a `tagButton` at the end. The three lines are in the reference page. |
| Selection across a group | React Aria (`selectionMode`, `selectedKeys`), Fluent (`selectedValues`), Angular Material (`MatChipListbox`) | decline | The group would have to own a collection, and a collection of chips whose members are also individually removable and individually navigable is a listbox with the wrong element inside every option. Each `tagToggle` owns its own `selected`; a set is `useState<Set<string>>` and a `selected={set.has(id)}` in the consumer’s map, which is the three lines the reference page shows. `combobox` and `tags-input` own real multi-selection, in wave 5 and later. |
| A count or a secondary line inside the chip | Fluent (`secondaryText`) | decline | One implementation. Two lines contradict the family’s own decision that a tag is one line; the second line composes as `end` content. |
| Chip as a form control | Angular Material (`MatChipGrid` with `ControlValueAccessor`) | defer to `tags-input` | The value being edited is a collection of strings inside an input, not the chip. `tagToggle` is a button, not a form control, and it submits nothing — the same line `switch` and `button` already draw. |
| Drag to reorder | none | — | No surveyed implementation ships it for this family. |

### Differentiators

| Offered here | Not in any surveyed implementation |
| ------------ | ---------------------------------- |
| Four named members instead of one component with implicit modes | The guide’s own rule — “nunca vários comportamentos implícitos ao mesmo tempo” — made structural. MUI, Ant, Primer and PatternFly all reach that state through prop combinations, and Primer needed a `hasMultipleActionTargets` branch to keep the DOM legal when two of them met. Here the branch does not exist: the root is never the interactive element, and which element the body is decided by which member you reached for. |
| A removal request that says *how* it was asked for | Every surveyed removal is a bare callback. `reason` separates the X being clicked (`remove`) from `Backspace` on the chip (`keyboard`), which is the difference between “the person aimed at this” and “the person was typing”; a confirmation dialog wants one and not the other. |
| A removal that can be refused before anything commits | Only Ant (`preventDefault`) and Atlassian (`onBeforeRemoveAction`) offer it, each in its own shape. Here it is the same `ChangeRequest` object every other family in the library refuses with. |
| `selected` with a controlled and an uncontrolled mode, decided once | Carbon’s `SelectableTag`, Ant’s `CheckableTag` and Primer’s `isSelected` are controlled only; Fluent’s `selected` is presentational and the state lives in `TagGroup`. None ships the pair. |
| Three colour schemes, three densities, logical properties, one authored stylesheet | No surveyed implementation ships a high-contrast scheme *and* three densities *and* right-to-left from the same sheet. Carbon and Fluent ship two schemes; MUI and Ant mirror with a separate RTL build. |
| Two first-class bindings over one conceptual contract | React Aria, Fluent, MUI, Ant, Primer, Carbon, Chakra, Mantine, Shoelace and Atlassian ship one binding each; Angular Material ships the other one. Nobody ships both. |
| The remove control’s name composed from the tag’s own label | Four implementations make the consumer write “Remove design” by hand on every chip, which is the string that goes stale when the value changes. |

### Gaps

| What a real product hits | What no surveyed implementation answers | What this family does |
| ------------------------ | --------------------------------------- | --------------------- |
| The last tag in a group is removed | React Aria and Angular Material move focus to a neighbour; neither says what happens when there is no neighbour, and focus falls to the document body, which sends the keyboard back to the top of the page | the `group` takes `tabindex="-1"` and receives focus itself, so the next `Tab` continues from where the person was |
| A group renders empty because a permission filter removed every chip | none | `[data-part='group']:empty` takes no room, the lesson `button-group` recorded when an empty actions area still ate a gap in its row |
| The value is one unbroken 60-character token in a 240-pixel container | Carbon and PatternFly cap the width and disclose the rest in a tooltip; the other ten reflow the chip into a paragraph or overflow the container | one line, clipped with an ellipsis, the whole string still in the DOM and findable — the same answer `badge` gave, for the same reason |
| A removal has to be confirmed, or fails at the server | none — every surveyed callback is fire-and-forget | the request is refusable (`request.cancel()`), so a confirmation flow refuses it and nothing moves until the consumer says so |
| A chip is both a filter to press and a filter to remove | MUI puts a non-button delete icon inside a button; Primer branches on `hasMultipleActionTargets`; Angular Material and React Aria reach for a grid | one anatomy: the root is never interactive, the body is the primary target and the remove is its sibling |

## Anatomy

One anatomy, for every member and every combination.

```
[data-ui="tag"][data-part="group"]        div     — the run of tags; one tab stop
  [data-ui="tag"][data-part="root"]       span    — the chip box: tone, edge, radius, height
    [data-part="body"]     span | button | a      — the content box, and the primary target
      [data-part="indicator"]             span    — the selection check, on tagToggle only
      [data-part="start"]                 span    — a glyph or an avatar before the words
      [data-part="label"]                 span    — the words; one line, clipped
      [data-part="end"]                   span    — a glyph after the words
    [data-part="remove"]                  button  — removes the tag
```

**The root is never the interactive element.** A `button` cannot contain a
`button` and an `a` cannot contain either, so a chip that both acts and removes
has to put its two controls side by side. Primer reaches the same conclusion
through a `hasMultipleActionTargets` branch that moves the interactive props
between two elements; Fluent reaches it by shipping `InteractionTagPrimary` and
`InteractionTagSecondary` as siblings; React Aria and Angular Material reach it
by making the chip a grid row with two cells. Deciding it once, for every case,
is what removes the branch: `body` is a `span` when the tag does nothing, and
the element the member names when it does.

The cost is one element on a static tag — `span > span > span` for a word. It
is paid for by one selector set, one padding decision, one gap, one clipping
rule and one harness fragment instead of two of each, and by a `remove` button
that is a plain sibling in every case rather than a nested control in some.

**`group` is a part, not a member.** It contains tag roots rather than sitting
inside one, so it carries `data-ui` itself — the second part in the library to
do so, after `badge`’s `anchor`, and for the same reason: a `data-part` with no
reachable family identifier is selectable only by a name no family owns.

## Members and axes

| Member | Root | `body` element | Adds |
| ------ | ---- | -------------- | ---- |
| `tag` | `span` | `span` | — |
| `tagButton` | `span` | `button` | a command |
| `tagLink` | `span` | `a` | a destination |
| `tagToggle` | `span` | `button` + `aria-pressed` | the `selected` state model |

| Axis | Values | Default | Where |
| ---- | ------ | ------- | ----- |
| `tone` | `accent`, `secondary`, `success`, `warning`, `danger` | `secondary` | root |
| `variant` | `solid`, `soft`, `outline` | `soft` | root |
| `size` | `sm`, `md`, `lg` | `md` | root |
| `shape` | `pill`, `square` | `pill` | root |
| `orientation` | `horizontal`, `vertical` | `horizontal` | group |

`soft` is the default for the reason `badge` recorded: a page of solid grey
pills reads as a page of controls. A `tagToggle` that is on takes the tone’s
solid fill whatever its variant, which is the rule `button` set for `pressed`.

`secondary` is the exception to both, and it is the same exception `badge`
found: the tone’s `solid` role is the colour of the page itself in all three
schemes, so a selected neutral chip with no edge is a run of text. It fills
with `solid-hover` and keeps the tone border.

## State and events

```json
"stateModel": {
  "selection": {
    "controlled": "selected",
    "uncontrolled": "defaultSelected",
    "request": "onSelectedChange",
    "reasons": ["pointer", "keyboard"]
  }
}
```

Removal holds no state and therefore declares no model. The tag does not own
whether it exists — its consumer’s collection does — so `onRemove` is a request
and never a value. Ant is the one surveyed implementation that removes itself,
and a component that renders `null` while the consumer’s array still holds the
item is the desync `docs/state-and-events.md` exists to prevent.

`reason` is `remove` when the X was activated and `keyboard` when `Backspace`
or `Delete` was pressed on the chip.

### State matrix

| State | Attribute | Where it is painted | Held back for |
| ----- | --------- | ------------------- | ------------- |
| `default` | — | root | — |
| `hover` | — | body, remove | `disabled` |
| `active` | — | body, remove | `disabled` |
| `focus-visible` | — | body, remove | — |
| `selected` | `data-selected` | root | `disabled` |
| `disabled` | `data-disabled` | root, body, remove | — |

`focus-visible` is not held back: a control that keeps its place in the tab
sequence while unavailable still has to show where focus is.

## Keyboard

| Key | Where | Effect | Focus after |
| --- | ----- | ------ | ----------- |
| `Tab` | outside the group | enters at the group’s one tab stop | that control |
| `Tab` | inside the group | leaves the group entirely | the next tab stop on the page |
| `ArrowRight` / `ArrowLeft` | any control in a horizontal group | the next / previous control in reading order | that control |
| `ArrowDown` / `ArrowUp` | any control in a vertical group | the next / previous control | that control |
| `Home` / `End` | any control in a group | the first / last enabled control | that control |
| `Enter` / `Space` | `tagButton` body | activates | unchanged |
| `Enter` / `Space` | `tagToggle` body | requests the opposite selection, reason `keyboard` | unchanged |
| `Enter` | `tagLink` body | follows the destination | the destination |
| `Enter` / `Space` | `remove` | requests removal, reason `remove` | the control that took its place |
| `Backspace` / `Delete` | any control inside a removable tag | requests removal, reason `keyboard` | the control that took its place |

Arrow keys follow the reading direction: in a right-to-left document
`ArrowLeft` is the next control. `@slotted/core/focus` did not know about
direction and is fixed first, in its own commit, before this family uses it.

The roving order is every control in the group, in DOM order — `body`,
`remove`, `body`, `remove`. That is the Toolbar pattern read literally, and it
is what makes the remove button reachable without a second axis. React Aria and
Angular Material reserve one axis for “the next chip” and the other for “the
next control inside this chip”, which needs a grid: two wrapper elements per
chip and a `gridcell` role over every button. A single wrapping run does not
need the second dimension, and the cost of buying it is two elements a chip.

## Accessibility

Itemized against the sourced patterns.

| Requirement | Source | Where it is answered |
| ----------- | ------ | -------------------- |
| The group is a container for a set of controls, with an accessible name | APG Toolbar | `role="toolbar"` on `[data-part='group']`, `aria-label` required by both bindings’ types and checked in the reference page |
| The toolbar is one tab stop; a roving `tabindex` moves inside it | APG Toolbar, APG *Developing a Keyboard Interface* | `createRovingTabindex` from `@slotted/core/focus` |
| Arrow keys move focus inside the container; `Home` and `End` reach the ends | APG Toolbar | the keyboard table above |
| `aria-orientation` when the toolbar is not horizontal | APG Toolbar | written on the group for `vertical` only, because `horizontal` is the role’s own default |
| A control that acts is a button | APG Button | `tagButton` and `remove` are `<button type="button">` |
| A control that navigates is a link | APG Link | `tagLink` is an `<a href>` |
| A two-state control announces its state and keeps its label | APG Button, WAI-ARIA 1.2 `aria-pressed` | `tagToggle` writes `aria-pressed`; the label is the consumer’s and the family never rewrites it |
| A disabled control announces its state | WAI-ARIA 1.2 | native `disabled`, or `aria-disabled` with the activation refused when the consumer keeps it focusable |
| A group of items that are not controls is a list | ARIA | `role="list"` written by the consumer on the group turns roving off, and each root takes `role="listitem"` |
| State is not conveyed by colour alone | WCAG 2.2 1.4.1 | a selected `tagToggle` grows a check glyph as well as changing ground |
| The focus indicator is visible in all three schemes | WCAG 2.2 2.4.7, 1.4.11 | `--slotted-focus-ring-*`, drawn on `body` and on `remove`, never on the root |
| An interactive target is at least 24 × 24 CSS pixels | WCAG 2.2 2.5.8 | the remove control’s hit area is `--slotted-target-min` at every size and density, larger than its glyph |
| Text contrast | WCAG 2.2 1.4.3 | the tone `text` and `on-solid` roles, held by `packages/theme-default/test/contrast.test.mjs` |

**Deliberate departure, with its cost.** A selected chip announces “pressed”,
not “selected”. `aria-selected` is only valid on an element inside a `listbox`,
`grid`, `tabpanel` or `tree`, and putting a chip inside a `listbox` would forbid
the remove button inside every option — an `option` may not contain a focusable
control. Carbon’s `SelectableTag` reaches the same conclusion and writes
`aria-pressed`; Angular Material reaches the other one and gives up the remove
button inside `MatChipListbox`. The family keeps `selected` as its own word,
because that is what the field calls it and what a consumer will look for, and
writes `data-selected` for styling.

**Deliberate departure, with its cost.** A group announces “toolbar” rather
than “list, five items”. The item count is what a list gives and a toolbar does
not; the tab stop, the arrow keys and the reachable remove buttons are what a
toolbar gives and a list does not. A group whose tags are all static gets the
list instead, by writing `role="list"` on it.

## Responsiveness, direction and density

The group wraps. Nothing else about the family is width-dependent, so it
declares no container and no breakpoint: a chip is as wide as its content up to
the width it is given, and past that its label clips.

Direction is inherited. Every rule is logical; the only direction-sensitive
decisions are which corner of the chip each segment rounds, expressed in
`border-start-start-radius` and its three siblings, and which arrow key moves
forward, which is read from the container’s computed direction.

Density moves the type, the glyph and the gap through the control scale, and
the chip’s height follows its own line box, so no density can leave a tag
clipped and none can leave the remove control under the WCAG minimum.

## Motion

| State pair | Transitions | Why |
| ---------- | ----------- | --- |
| default → hover, hover → active | yes, `--slotted-control-transition-*` | the same ground change every control in the library makes, and the same tokens |
| unselected → selected | yes, on the check’s inline size and opacity, `--slotted-duration-short` / `--slotted-easing-standard` | the check arrives from nothing and the words move to make room; an eye that does not follow it reads the row as having jumped |
| present → removed | no | the tag leaves the DOM, and an exit animation needs a family that can hold an element past its own unmounting. `presence`, guide section 3 |
| enabled → disabled | no | a state the person did not cause |

No animation loops, so nothing needs stopping under reduced motion beyond the
theme’s own collapse of the duration scale.

## Ecosystem integration

### React

| Question | Answer |
| -------- | ------ |
| A mutable value with a controlled and uncontrolled pair, and a request carrying a reason | yes — `selected` / `defaultSelected` / `onSelectedChange(selected, request)` on `TagToggle`, over `@slotted/core/state` |
| Application-wide defaults | yes — `TagDefaultsProvider` and `useTagDefaults` |
| Substituting the rendered element of each public part | yes — `render` on every member and on `TagGroup`; `body` is substituted by reaching for a different member |
| The consumer’s own handler still runs | yes — `onClick` is called first and `event.defaultPrevented` refuses the family’s own move, as `ToggleButton` does |
| Reaching the native element and the imperative action | yes — `ref` reaches the root of every member; there is no imperative action, because focus lands on the `body` a consumer can already reach and removal is the consumer’s own commit |
| Server rendering without a hydration mismatch | yes — `useId` for the label and remove-word ids, no layout read during render |
| Every state a consumer may style is in the DOM | yes — `data-selected`, `data-disabled`, plus the pseudo-states |
| Each part’s props type is the native element’s, extended | yes — `ComponentPropsWithRef<'span' \| 'button' \| 'a'>` per member |

### Angular

| Question | Answer |
| -------- | ------ |
| Two-way value in the signal form the ecosystem expects | yes — `model()` for `selected` on `SlTagToggle`, `output()` for `selectedChange` carrying the request, and `output()` for `remove` |
| Reactive Forms | no — a tag is a button, not a form control. The collection a form submits belongs to `tags-input`, guide section 6 |
| Application-wide defaults | yes — `TAG_DEFAULTS` and `provideTagDefaults()` |
| A template can reach the instance | yes — `exportAs` on every directive |
| Substituting projected content, kept lazy | yes — every part is a directive on the consumer’s own element, so the content is the consumer’s template and nothing is re-rendered by the family |
| Zoneless and `OnPush` | yes — signals throughout, no `markForCheck` |
| Every subscription and listener torn down | yes — the roving handle is destroyed through `DestroyRef` |
| A static attribute the consumer wrote survives | yes — `role` and `aria-label` are read with `HostAttributeToken` before the host bindings write over them |
| One class per entry point | yes — imported through `@slotted/angular/tag` |

The asymmetry is deliberate and is the one `references/frameworks.md` names.
React’s members render the whole chip from props, because a React consumer
composes with elements the family creates and `render` is how it substitutes
one. Angular’s members are directives the consumer writes on its own elements,
because that is the only way `routerLink`, `routerLinkActive` and a template
reference stay on the element the page owns. The two contracts are the same
family; the two APIs are each their ecosystem’s.

## The contract break

`tag` was schema 4, keyed on a class, with one part, no state, no keyboard and
no group. Everything below changes.

| Was | Is | How a consumer moves |
| --- | -- | -------------------- |
| `.slotted-tag` class selector | `[data-ui='tag'][data-part='root']` | a stylesheet keyed on the class keys on the attribute pair instead; the class is gone, and was never contract |
| `data-slotted-component="tag"` | `data-ui="tag"` | rename the attribute in tests and selectors |
| `variant` naming the colour | `tone` | `variant="danger"` → `tone="danger"` |
| `fill` naming the painting | `variant` | `fill="subtle"` → `variant="soft"`; `fill="solid"` → `variant="solid"`; `fill="outline"` → `variant="outline"` |
| `size` of `sm \| md` | `sm \| md \| lg` | unchanged for the two that existed |
| `<TagRemove>` as a sibling component the consumer places | the `remove` part, rendered by `onRemove` | `<Tag>Design <TagRemove aria-label="Remove design"/></Tag>` → `<Tag onRemove={…}>Design</Tag>` |
| `SlTagRemove` directive on the consumer’s button | `[slTagRemove]` kept, and the tag emits `(remove)` | the directive keeps its name and gains the request; a button that only called the consumer’s own handler still works |
| the words as the root’s direct text | the `label` part | React wraps children automatically; an Angular consumer writes `<span slTagLabel>` |
| no `soft`/`solid`/`outline` default | `soft` | a tag that showed a solid grey pill now shows a tinted one; write `variant="solid"` to keep it |
| nothing between a static and an interactive tag | four members | a chip that had an `onClick` on the root reaches for `TagButton` |

The break is recorded here rather than avoided, as guide section 18 point 12
requires. The family had one capability and thirty-four axes’ worth of missing
ones; carrying the old shape forward would have meant carrying the reason it
was empty.

## Shared tools fixed first, each in its own commit

1. **`@slotted/core/focus` did not know about reading direction.**
   `createRovingTabindex` treats `ArrowRight` as “next” in every document, so in
   a right-to-left page the arrow keys ran backwards. It now reads the
   container’s computed `direction` and swaps the horizontal pair. `tabs` is the
   only existing caller and is unaffected in a left-to-right document.
2. **`specs/contract.schema.mjs` had no capability for removal.**
   `removable` is added to `KNOWN_CAPABILITIES`, and not to
   `MUTABLE_CAPABILITIES`, because a removal request carries no value the
   consumer can own.
3. **The reference-page gate demanded the wrong prop for `selection`.**
   `capabilityApi.selection` required an API row named `value`, which is the
   shape `tabs` has and not the shape a single selectable chip has. The required
   row is dropped: every declared default is already required row by row, so
   `tabs` documents `value` and `tag` documents `selected` without the table
   having to know which.

## Self-assessment

Ten dimensions of `references/rubric.md`. Each names the one change that would
most improve it, and whether it was made.

### 1. Icons

Two component-owned glyphs, both masks from glyph tokens: `--slotted-icon-x` on
the remove control's `::before` and `--slotted-icon-check` on the selection
indicator. No character is used as an icon, and
`packages/styles/src/tag/tag.styles.test.mjs` asserts both, plus the absence of
any `content:'…'` string in the sheet. Neither glyph is direction-sensitive: a
cross and a check mean the same thing mirrored, so neither takes a `:dir()`
rule — unlike `link`'s external arrow, which does. Under forced colours both
are painted `currentColor`, so they survive the palette being replaced.

The one change that would most improve it: the previous implementation drew its
cross from two rotated `::before`/`::after` bars, which was the family's own
geometry rather than the foundation's. **Made** — both glyphs now come from the
theme's glyph scale, so a brand that redraws its cross redraws this one.

### 2. Motion

Two transitions, one state pair each.

| State pair | Transitions | Why |
| ---------- | ----------- | --- |
| default → hover → active, on either control | yes, `--slotted-control-transition-*` | the same ground change every control in the library makes, from the same tokens |
| unselected → selected | yes, on the indicator's inline size, its margin and its opacity, `--slotted-duration-short` / `--slotted-easing-standard` | the check arrives from nothing and the words move to make room; an eye that cannot follow that reads the row as having jumped |
| present → removed | no | the tag leaves the DOM, and an exit animation needs a family that can hold an element past its own unmounting — `presence`, guide section 3 |
| enabled → disabled | no | a state the person did not cause |
| focus arriving | no | a ring that fades in is a ring that is not there yet |

No animation loops, so nothing needs stopping under reduced motion beyond the
theme's own collapse of the duration scale; `packages/styles/src/motion.test.mjs`
holds the absence of a literal duration.

The one change that would most improve it: Angular Material takes the layout
jump when its selection mark appears and offers `hideSingleSelectionIndicator`
to avoid it. **Made** — the mark grows from zero inline size, and the negative
margin that hides the flex gap grows with it, so the words slide rather than
snap and an unselected chip pays nothing for the mark it is not showing.

### 3. Responsiveness

The group wraps; nothing else about the family is width-dependent, so it
declares no container and no breakpoint — a chip is as wide as its content up to
the width it is given, and past that its label clips. Read at 240, 420 and 720
pixels: at 240 the four-filter run wraps to four rows, the long value clips with
an ellipsis, and the sentence scene keeps the inline chip on the text's centre.

The one change that would most improve it: at 240 pixels a chip whose value is
one unbroken 60-character token was the case most likely to overflow its
container. **Made** — `max-inline-size: 100%` on the root with `min-inline-size:
0` on the body and the label is what lets a flex item shrink below its content,
which is the condition `text-overflow` needs to have anything to do. The German
compound in the `content` scene is the capture that holds it.

### 4. Refinement

Read at full size in all three schemes, at three widths, in `dense` and in
`rtl`, plus five state captures and four at 200–250% zoom. Corrections the
captures produced, in order:

1. `soft` and `outline` were the same rectangle when disabled — both painted
   transparent with the same rim. Three variants now become two, and the filled
   one keeps a rim.
2. In `high-contrast` a disabled filled chip had no edge at all, because the
   disabled ground is the page's own white and the chip drew its ground as its
   edge. The rim is `--slotted-disabled-border` for every filled chip now.
3. The hovered remove segment read *paler* than the chip it sits in, because
   the tinted ramp's hover role is lighter than its surface. Replaced with a
   state layer.
4. The focus ring's outer edge landed exactly on the chip's own border and read
   as a thickened rim. Moved in by a second ring width.
5. A one-character removable chip was mostly air: the label sat closer to the
   start edge than to the X, because the body's full trailing inset was added to
   the remove control's own centring. The body gives back most of that inset
   when a remove control follows it.

The one change that would most improve it, after those five: nothing in the
picture is now wrong, and the honest remaining item is the one I would spend
another hour on — the two segments of a removable chip are indistinguishable
until the pointer or the keyboard reaches one of them. Fluent draws a hairline
between them. **Not made**, and the reason is written rather than assumed: a
divider inside a 24-pixel chip is a third edge beside the chip's own rim and the
X's own weight, and at `sm` it lands two pixels from both. The X is already the
affordance, and the hover and focus captures show each target announcing itself
the moment it is reached. It is the first thing to revisit if a reviewer at a
real screen reads the chip as one target.

### 5. Tokens

Seventy-seven custom properties, four of them the family's own:
`--slotted-tag-border-width`, `--slotted-tag-font-family`,
`--slotted-tag-font-weight`, `--slotted-tag-group-gap`, plus the two state-layer
strengths. Every one falls back to a foundation token or to a documented
exemption; `packages/styles/src/fallbacks.test.mjs` and
`packages/styles/src/tokens.test.mjs` hold both facts. The family declares no
height: the block size is its own line box plus a symmetric inset, floored at
`--slotted-target-min`.

Two intentional departures, both recorded above and in `docs/history/build-log.md`:
`--_state-hover` and `--_state-active` compose `currentColor` and `transparent`
— both universally exempt values — at a percentage the theme retunes, because
the tinted ramp carries no step past `surface`; and `--_inner-radius` derives
from the outer radius rather than naming a scale step, because an inner corner
is arithmetic on an outer one.

The one change that would most improve it: the missing tinted hover step is a
gap in the foundation, not in this family, and the honest fix is a
`surface-hover` and a `surface-active` role per tone. **Not made** — thirty
authored values across five tones and three schemes plus their contrast rows is
a change to a public contract outside this family, which the briefing sends to
the gate rather than to the invocation.

### 6. Patterns

Sourced, not recalled. The APG pattern index at
<https://www.w3.org/WAI/ARIA/apg/patterns/> was fetched and parsed
programmatically: thirty-two patterns, and neither "tag" nor "chip" occurs on
the page. The applicable official guidance and the itemized comparison are in
the accessibility section above — Toolbar for the group, Button for a chip that
acts and for the remove control, Link for one that navigates, `aria-pressed` in
WAI-ARIA 1.2 for one that holds a selection, and the Grid pattern's "Layout
Grids for Grouping Widgets" as the alternative that was weighed and declined.
Every keyboard row is in the table above and every one is tested, in both
bindings.

Two deliberate departures, each with its cost written: `aria-pressed` rather
than `aria-selected`, and `toolbar` rather than `list`.

The one change that would most improve it: the previous implementation cited no
pattern at all and shipped no keyboard. **Made** — nine keys, a focus
destination for each, and the three that move focus after a removal.

### 7. Accessibility

Name, role, state, keyboard, focus, forced colours, reduced motion, reading
order and target size are answered in the table above. Exercised in the harness
and in the tests: the composed remove name ("Remove Ana Reis"), `aria-pressed`
on the selection, `aria-disabled` and the withheld `href` on a chip that cannot
be followed, the roving tab stop, the arrow keys mirrored by reading direction,
and the three-step focus restoration. `--focus` captures photograph the ring on
both controls in all three schemes rather than describing it.

What remains to be seen on a real machine: a screen reader reading the composed
remove name and the `toolbar` announcement, and a physical touch device meeting
the 24-pixel remove control. Named at the gate.

The one change that would most improve it: focus fell to the document body when
the last chip in a run was removed, which is what every surveyed implementation
does and what sends the next `Tab` back to the top of the page. **Made** — the
group takes focus itself, which is why it carries `tabindex="-1"`, and
`createRemovalFocus` is a core module so both bindings agree about where focus
went.

### 8. Native API

React: function components, `useId` for the two ids, context for the family
defaults, `render` on every member, native props typed as the element's own and
forwarded to the element that owns them, `ref` reaching that element,
`exactOptionalPropertyTypes` respected, and the consumer's handler composed
rather than replaced — `onClick` runs first and `preventDefault` refuses the
family's move.

Angular: standalone components and directives on the consumer's own elements,
`input()` and `output()` signals, `computed` for every derived value, `host`
metadata rather than `@HostBinding`, `ViewEncapsulation.None` with the one
authored stylesheet, `exportAs` on every part, `inject()` throughout,
`HostAttributeToken` for the `role` a consumer wrote, and `DestroyRef` for every
listener and observer.

The one change that would most improve it: an interactive member's own props
land on its control, which left the chip box unreachable. **Made** —
`rootProps` in React, and in Angular the chip box is the consumer's own element
to begin with.

### 9. Capability

Twenty-five table-stakes rows, twenty-one adopted or adapted, three deferred to
a named family and a named wave, three declined with the composition written out.
Seven differentiators, five gaps. Every mutable value has a controlled and
uncontrolled pair, a request carrying a reason from the closed vocabulary, and a
row in the state matrix. The keyboard table is checked key by key against the
sourced patterns, including the focus destination after each one.

Measured against the inventory rather than against the scope paragraph: the
scope paragraph asked for four behaviours, separate press and remove events, and
focus returning to the next logical item. The inventory added the group, the
uncontrolled selection, the cancellable request, the composed remove name, the
application-wide defaults, the vertical orientation and the list mode.

The one change that would most improve it: the previous family had one
capability — `appearance` — one part, no state, no keyboard and no group, and it
scored well on every other dimension. **Made** — that is the whole rebuild.

### 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line above.
React reaches its integration points: a context provider for defaults, `render`
for element substitution, composed handlers, `ref`, `useId` for server
rendering, the `data-*` vocabulary in the DOM, and props types that extend the
native element's. Angular reaches its own: an injection token and
`provideTagDefaults()`, `exportAs`, named content projection, signals throughout
with `OnPush`, `takeUntilDestroyed`-equivalent teardown through `DestroyRef`,
`HostAttributeToken` for a consumer's static `role`, and one entry point.

One line is answered `no` with a reason: Reactive Forms. A tag is a button, not
a form control, and the collection a form submits belongs to `tags-input`.

The asymmetry is deliberate and recorded rather than levelled away: React's
members render the chip from props because a React consumer composes with
elements the family creates; Angular's members are directives on the consumer's
own elements because that is the only way `routerLink`, `routerLinkActive` and a
template reference stay on the element the page owns.

The one change that would most improve it: an Angular consumer could not put
`routerLink` on a chip that navigates. **Made** — the element is the member, so
the anchor is theirs.

## Definition of done — guide section 18

1. **Purpose, use and anti-use.** An entity, a filter or a compact value.
   Anti-use: metadata that is not a value — that is `badge`; a collection a form
   submits — that is `tags-input`; a chip that is two behaviours at once, which
   the four members make impossible.
2. **Anatomy and public parts.** `root`, `body`, `start`, `label`, `indicator`,
   `end`, `remove`, `group`. Stable, declared in the contract, and the only
   selectors that are contract.
3. **Controlled and uncontrolled contract, and events with a reason.**
   `selected` / `defaultSelected` / `onSelectedChange`, over
   `@slotted/core/state`, with reasons `pointer` and `keyboard`. Removal is a
   request rather than state, with reasons `remove` and `keyboard`, and both are
   refusable.
4. **State matrix.** Above: `default`, `hover`, `active`, `focus-visible`,
   `selected`, `disabled`, with what each is painted on and what it is held back
   for. `packages/styles/src/states.test.mjs` holds the precedence.
5. **Keyboard, focus, ARIA, touch and screen reader.** The keyboard table above,
   tested in both bindings. Touch: the remove control is at least 24 × 24 CSS
   pixels at every size and density, and the theme's `pointer: coarse` block
   raises the chip further. Screen reader remains to be verified on a real
   machine.
6. **Size, density, variant and tone recipes, through tokens.** Three sizes,
   three densities, three paintings, five tones, two shapes — all from the
   foundation scales, none inventing one.
7. **Responsive, RTL, locale and reduced motion.** The group wraps; every rule
   is logical; the arrow keys follow the reading direction; the label is a bidi
   isolate with its own direction; the one transition collapses with the theme's
   duration scale.
8. **Loading, empty, error, disabled and extreme content.** Empty: a group with
   no chips takes no room. Disabled: per member and separately for the remove
   control, with the variant collapse recorded. Extreme content: one line,
   clipped, with the whole value still in the DOM. Loading and error are not
   this family's — a removal that reaches a server is refused by the consumer
   until it answers, which is what `cancel()` is for.
9. **SSR, hydration, performance, virtualization.** `useId` in React and an
   application-scoped id factory in Angular, so the server and the client agree.
   No layout read during render. The group's observers are one `MutationObserver`
   and two listeners, torn down with the component. Virtualization is not this
   family's: a run of chips that needs it is a collection, and `virtual-list`
   owns that.
10. **Examples, composition, edge cases, theming and use in context.** Five
    reference pages per binding, fifteen scenarios, and a harness fragment with
    six scenes.
11. **Behavioural tests shared between the bindings.** Thirty-seven in React
    and twenty in Angular, over the same conceptual contract; fifteen contract
    tests and thirteen stylesheet tests over the shared declaration, plus eleven
    in `@slotted/core/focus` for the two things both bindings borrow from it.
12. **Changelog, stability and migration.** The contract break and its move
    table are above and in `docs/history/build-log.md`.
