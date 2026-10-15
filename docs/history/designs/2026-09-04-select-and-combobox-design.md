# Select and Combobox — design

Two families, one session, because they share every decision below and
separating them would mean taking each one twice. Wave 6, items 3 and 4.

Inventory: `docs/history/designs/2026-09-04-select-and-combobox-capability-inventory.md`.

## 1. What each family is

**`select`** — a control that shows the current choice and opens a listbox of
known options. It takes no typed text. It is the family a form reaches for when
the set is known, short enough to scan, and the reader is choosing rather than
searching.

**`combobox`** — a text input with a listbox of options filtered by what was
typed. The typed text and the chosen key are two contracts, not one. It is the
family a form reaches for when the set is large, remote, or the reader knows
what they want and would rather type it.

Anti-use for both: a set of two or three visible choices, which is
`radio-group`; a list of commands, which is `menu`; a set the reader builds,
which is `multi-select` in wave 6 item 5.

## 2. The dependency, and the session running beside this one

`docs/process/build-order.md` puts `listbox` at wave 6 item 2 and the collection-engine
review at item 1, both before these two. When this session opened, neither had
landed: `packages/core/src/collection` held `virtualWindow` and nothing else,
and `specs/components/listbox/` did not exist. A second session began building
`listbox` in this same worktree while this one was writing its stylesheets, and
is writing `packages/core/src/collection/items.ts` and `selection.ts` as it
goes.

The decision taken, rather than left open: **these two families do not compose a
`listbox` family, and never were going to.** A select's popup and a combobox's
popup are each that family's own surface, as they are in all eight surveyed
implementations; a standalone listbox is a third widget with its own role, its
own tab stop and its own selection model. What the three share is behaviour, and
behaviour belongs in `packages/core`.

So this session writes only what its own two families need —
`packages/core/src/collection/navigation.ts` and `filter.ts`, in their own
commit, before the families, as `docs/build-briefing.md` requires of shared
tooling — and imports nothing from the other session's in-flight modules. Two
sessions writing one directory can add files to it; neither may build on the
other's unfinished export. If `createCollection` and `nextSelection` land and
turn out to say what these families say in their own bindings, a later session
reconciles them; the reconciliation is cheap and a mid-write dependency is not.

## 3. The collection engine, as this pair needs it

New in `packages/core/src/collection`, each function answering one question and
importing none of the others:

| Export | Question |
| ------ | -------- |
| `moveIndex` | Which index does a key move to, given the enabled mask, the loop policy, and a page of ten? |
| `createFilter` | Does this label match this query, compared the way the reader's locale compares? |
| `matchRanges` | Which spans of this label did the query match, so they can be marked? |
| `virtualWindow` | Which rows are on screen? Unchanged, and still without a caller. |

`moveIndex` takes an `enabled: readonly boolean[]` rather than the items
themselves, so it is arithmetic with no opinion about what an item is — the rule
the module's own header already states. It answers `first`, `last`, `next`,
`previous`, `pageUp` and `pageDown`, and returns `-1` when nothing is reachable.

`createFilter` wraps `Intl.Collator` at base sensitivity, which is what
`docs/component-features.md` §2.9 asks for: `Ä` matches `a`, and `resumé`
matches `resume`. It returns `contains`, `startsWith` and `equals`. The
`typeahead` module already builds a collator of its own for a different job —
matching a growing prefix against a list — and the two are deliberately not
merged: a typeahead has a reset window and a cycle, and a filter has neither.

`matchRanges` returns `[start, end]` pairs in the label's own code units, found
with the same collator, so the marked span is the span the collator matched and
not a naive `indexOf` that disagrees with it on accents.

## 4. The pattern, transcribed

Source pages, read 2026-09-04:

- Combobox Pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/>
- Select-Only Combobox example — <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/>
- Listbox Pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/>

### 4.1 Roles, states and properties, from the Combobox pattern

| Requirement | Where it is answered |
| ----------- | -------------------- |
| "The element that serves as an input and displays the combobox value has role `combobox`." | `select`'s `trigger` (a `button`) and `combobox`'s `input`. |
| "The combobox element has `aria-controls` set to a value that refers to the element that serves as the popup." | Written while open, on `trigger` / `input`, naming the `content` id. |
| "The popup is an element that has role `listbox`, `tree`, `grid`, or `dialog`." | `content` carries `role="listbox"`. |
| "Elements with role `combobox` have an implicit `aria-haspopup` value of `listbox`." | Not written for `combobox`, whose popup is a listbox. Written explicitly on `select`'s trigger, because the element is a `button` and `role="combobox"` replaces `button`; a reader on an older stack then still hears that it opens a list. Recorded as a deliberate redundancy. |
| "`aria-expanded` … default value of `false`." | Written on both, always, because the control is a `button` and a `div` whose implicit default a reader cannot count on. |
| "When a combobox receives focus, DOM focus is placed on the combobox element." | Both. Focus never enters the popup. |
| "When a descendant of a listbox … popup is focused, DOM focus remains on the combobox and the combobox has `aria-activedescendant`." | The highlight model, §5. |
| "when a suggested value is visually indicated as the currently selected value, the option … has `aria-selected` set to `true`." | `aria-selected` on the committed option; the highlight is `data-current` and `aria-activedescendant`, which is the distinction the Listbox pattern's own note draws between focus and selection. |
| "If the combobox has a visible label and the combobox element is an HTML element that can be labelled using the HTML `label` element … it is labeled using the `label` element." | `combobox`'s `input` is labelled by `field`'s `label` through `for`/`id`. `select`'s trigger is a `button`, which `label` does not reach reliably, so it takes `aria-labelledby` naming the same element. |
| "The combobox element has `aria-autocomplete` set to a value that corresponds to its autocomplete behavior: `none` / `list` / `both`." | `combobox`'s `autocomplete` axis writes it. `select` writes `none`, which is what a popup whose contents never change means. |
| Listbox pattern: "Each option group has an accessible name provided via `aria-label` or `aria-labelledby`." | `group` names itself by `aria-labelledby` pointing at its own `group-label`. |
| Listbox pattern: "If the listbox supports selection of more than one option … `aria-multiselectable` set to `true`." | `select` writes it when `multiple` is set. |
| Listbox pattern: "If the complete set of available options is not present in the DOM due to dynamic loading … `aria-setsize` and `aria-posinset` are set appropriately." | Written by both families on every option whenever `total` is given, which is the prop an incrementally loaded list sets. |

### 4.2 Keyboard, `select` — from the Select-Only Combobox example

Closed:

| Key | Effect | Focus after |
| --- | ------ | ----------- |
| `ArrowDown` | Opens the listbox without changing selection. | DOM focus stays on the trigger; the highlight goes to the selected option, or the first. |
| `Alt+ArrowDown` | Opens the listbox without moving the highlight. | Trigger. |
| `ArrowUp` | Opens and moves the highlight to the last option. The example says "first"; the last is what every surveyed implementation and the Combobox pattern's own optional `ArrowUp` do, and it is the mirror of `ArrowDown`. Recorded as a deliberate departure from the example. | Trigger. |
| `Enter` | Opens. | Trigger. |
| `Space` | Opens. | Trigger. |
| `Home` | Opens and highlights the first option. | Trigger. |
| `End` | Opens and highlights the last option. | Trigger. |
| Printable character | Opens and highlights the first option matching the sequence; the same character repeated cycles. | Trigger. |

Open:

| Key | Effect | Focus after |
| --- | ------ | ----------- |
| `Enter` | Commits the highlighted option and closes. | Trigger. |
| `Space` | Commits and closes. With `multiple`, toggles the highlighted option and keeps the popup open, which is the Listbox pattern's recommended multiple-selection model. | Trigger. |
| `Tab` | Commits the highlighted option, closes, and moves on. The example states this and notes it differs from the native `select`. | The next element in the page. |
| `Escape` | Closes without committing. | Trigger. |
| `ArrowDown` / `ArrowUp` | Moves the highlight. `loop` decides whether it wraps; the example does not wrap and `loop` defaults to `false` for that reason. | Trigger. |
| `Alt+ArrowUp` | Commits and closes. | Trigger. |
| `Home` / `End` | Highlights the first / last option. | Trigger. |
| `PageUp` / `PageDown` | Moves the highlight ten options, or to the end. | Trigger. |
| Printable character | Typeahead, as above. | Trigger. |
| `Backspace` / `Delete` | Nothing. A select has no text to delete. | Trigger. |

### 4.3 Keyboard, `combobox` — from the Combobox pattern

Focus is in the combobox for every row: the pattern's Listbox Popup section
describes a popup that holds focus, and its own note says DOM focus is
maintained on the combobox with `aria-activedescendant`. The two sections are
therefore merged into one table, which is what the pattern's note asks for.

| Key | Effect | Focus after |
| --- | ------ | ----------- |
| `ArrowDown` | If closed, opens and highlights the first option. If open, moves the highlight to the next option. | Input. The caret does not move — the pattern's "Setas navegam sem mover cursor de texto indevidamente". |
| `ArrowUp` | If closed, opens and highlights the last option ("Optional: places focus on the last focusable element in the popup"). If open, moves to the previous. | Input. |
| `Alt+ArrowDown` | Opens without moving the highlight. | Input. |
| `Alt+ArrowUp` | Closes. | Input. |
| `Enter` | Commits the highlighted option, closes, and puts the caret at the end of the accepted value. With no highlight and `allowsCustomValue`, commits the typed text. With no highlight and no custom value, closes and reverts. | Input. |
| `Escape` | Open: closes and keeps the text. Closed: reverts the text to the committed value's label, and clears the selection if the text was already that label. The pattern makes both optional and names them; the two-step is what `text-field`'s reader expects from `Escape` in a form. | Input. |
| `Home` / `End` | The pattern's editable branch: returns to the input and moves the caret. The browser does it; the family binds neither key while the popup is open and editable. | Input. |
| `ArrowLeft` / `ArrowRight` | The browser's caret movement. Never bound. | Input. |
| `Backspace` / `Delete` | The browser's text editing. Never bound; the pattern's IMPORTANT note asks exactly this. | Input. |
| `PageUp` / `PageDown` | Moves the highlight ten options. Optional in the pattern for a grid popup and absent for a listbox one; adopted because a filtered list of two hundred is the case this family exists for. | Input. |
| `Tab` | Closes without committing, unless a completion string is showing, in which case it accepts it. Moves on. | The next element. |
| Printable character | Typed into the input. Never intercepted. | Input. |

`select`'s `Tab` commits and `combobox`'s does not, and the difference is the
pattern's: a select-only combobox's `Tab` "sets the value to the content of the
focused option", while an editable combobox's typed text is the value and a
highlight the reader arrowed past is not a choice they made.

### 4.4 What the platform supplies, and what remains

| Supplied by the platform | Remaining to the family |
| ------------------------ | ----------------------- |
| `button` press from pointer, `Enter` and `Space` — `select`'s trigger. | Everything above. |
| `input` text editing, caret, selection, IME, autofill, `maxlength` — `combobox`'s input. | Filtering, the popup, the highlight. |
| `label` association through `for`/`id` — `combobox`. | `aria-labelledby` for `select`, whose control is a button. |
| Form submission and `reset()` — through the hidden native `select` React renders. | The Angular equivalent, which is `ControlValueAccessor`. |
| `:disabled`, including a disabled ancestor `fieldset`, on both native elements. | `readOnly`, which neither element has. |

A native `<select>` was considered for `select` and refused. It cannot hold a
group with an icon, a description or a check mark; it cannot be styled in any
browser beyond its closed state; and its popup is drawn by the operating system,
which means no density, no scheme and no direction. The cost of refusing it is
written here: every key in §4.2, the whole popup, and a hidden native element
carried alongside purely so a plain form still submits.

## 5. The highlight model, and why both families share it

DOM focus stays on the control. The highlighted option is named by
`aria-activedescendant` on the control and carries `data-current` for the
stylesheet. Committed options carry `aria-selected` and `data-selected`.

`combobox` has no choice: the input must keep focus or the reader cannot type.
`select` does have one — Radix and Ark move real focus into the options, and
`menu` in this library does the same — and takes the same model anyway, for
three reasons.

1. The APG's own select-only example uses it, and §4.2 is transcribed from that
   example.
2. Two families in one session that answered arrows through two mechanisms would
   need two sets of tests, two harness scenes and two explanations, and the
   second would drift.
3. `data-current` and `aria-selected` then mean the same thing in both, which is
   what lets a consumer style one stylesheet for both popups.

The cost: `packages/core/src/focus/arrow-navigation` cannot be used, because it
moves DOM focus. `moveIndex` in the collection engine replaces it, and the two
families own the key handling rather than delegating it. `menu` keeps
`arrow-navigation`; nothing is changed there.

A second cost: an option is not focusable, so a browser will not scroll it into
view on its own. The family calls `scrollIntoView({ block: 'nearest' })` on
every highlight change, and `scrollToKey()` is the imperative escape hatch for a
consumer that has just replaced the list.

## 6. Anatomy

Both families are two subtrees: the control, where the consumer wrote it, and
the popup, portalled to the end of the document. `data-ui` therefore appears
**twice** — once on the control root and once on the portalled positioner —
because a stylesheet has no other way to reach a subtree that is no longer
inside the root. `menu` did not face this: its layer is its root and its trigger
belongs to the consumer. The contract records it under `portalledIdentity`.

### `select`

```
┌─ root ─ div ─ data-ui='select' ────────────────────────────┐
│  ┌─ trigger ─ button ─ role=combobox ──────────┐  clear    │
│  │ value ▸ "Blueberry"                  arrow  │           │
│  └──────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────┘

┌─ positioner ─ div ─ data-ui='select' ─ portalled ──────────┐
│  ┌─ content ─ role=listbox ─ scrolls ──────────────────┐   │
│  │ group ▸ group-label                                 │   │
│  │ item ▸ indicator │ icon │ label      │ description  │   │
│  │ separator                                           │   │
│  │ status ▸ "Loading…"      empty ▸ "No options"       │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

Seventeen parts: `root`, `trigger`, `value`, `arrow`, `clear`, `positioner`,
`content`, `group`, `group-label`, `item`, `indicator`, `icon`, `label`,
`description`, `separator`, `empty`, `status`.

The frame is `text-field`'s frame, and deliberately: the border, radius, shadow,
focus ring, invalid retargeting and disabled treatment come from the same
tokens, so a form holding a text field and a select reads as one row. The
trigger is a borderless button filling the frame, and the frame draws the ring
through `:has(> [data-part='trigger']:focus-visible)` — the rule `text-field`
already writes for its input. `clear` is a sibling of the trigger rather than
its child, because a button inside a `combobox` is a focusable descendant of a
widget and because `text-field` places its own two buttons the same way.

`arrow` is the chevron on the trigger. The name is free because both families
decline the positioner arrow, and `icon` is taken by the option's own artwork —
the same part name `menu` uses for the same thing.

### `combobox`

```
┌─ root ─ div ─ data-ui='combobox' ──────────────────────────┐
│  input ─ role=combobox              clear   trigger▸arrow  │
└────────────────────────────────────────────────────────────┘

┌─ positioner ─ div ─ data-ui='combobox' ─ portalled ────────┐
│  ┌─ content ─ role=listbox ────────────────────────────┐   │
│  │ item ▸ indicator │ icon │ label ▸ match │ desc      │   │
│  │ status ▸ "12 results"    empty ▸ "No matches"       │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

Eighteen parts: the same seventeen with `input` in place of `value`, plus
`trigger` as a real button beside the input, plus `match`.

`match` is the marked span inside a label, drawn from `matchRanges`. It is a
`mark` element, so a reader who cannot see the tint still hears the emphasis in
browsers that expose it, and the family never renders it when `highlightMatch`
is off or the label is not plain text.

## 7. State, and what each request carries

`select`:

| Capability | Controlled | Uncontrolled | Request | Reasons |
| ---------- | ---------- | ------------ | ------- | ------- |
| `selection` | `value` | `defaultValue` | `onValueChange` | `pointer`, `keyboard`, `clear`, `select`, `programmatic` |
| `open` | `open` | `defaultOpen` | `onOpenChange` | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `dismiss`, `blur`, `programmatic` |
| `current` | `highlightedValue` | `defaultHighlightedValue` | `onHighlightedValueChange` | `pointer`, `keyboard`, `programmatic` |

`combobox` holds those three and one more:

| Capability | Controlled | Uncontrolled | Request | Reasons |
| ---------- | ---------- | ------------ | ------- | ------- |
| `value` | `inputValue` | `defaultInputValue` | `onInputValueChange` | `keyboard`, `select`, `clear`, `blur`, `programmatic` |

`current` is the vocabulary's existing word for where the reader is now, which
is exactly what a highlight is, and it carries `data-current`. It is not
`selected`: the Listbox pattern's own note separates focus from selection, and
so does this contract.

The two combobox values move independently and each transition emits exactly
one request. Committing an option emits `onValueChange` with reason `select`
and `onInputValueChange` with reason `select`; typing emits only
`onInputValueChange` with reason `keyboard`.

## 8. Decisions taken, with their cost

| Decision | Cost |
| -------- | ---- |
| `aria-activedescendant` rather than roving focus, in both. | `arrow-navigation` is unusable here; the families bind their own keys, and the highlight has to be scrolled into view by hand. |
| The popup is not modal and draws no backdrop. | A reader can scroll the page behind an open select. `dialog` owns modality, as §8 of the feature guide sets. |
| No `item-aligned` positioning. | A macOS convention is unavailable. The popup hangs under the control at `align="start"` and is as wide as it. |
| `select` ships `multiple` with a summary; chips are `multi-select`'s. | A reader who wants removable chips reaches for a family that does not exist until wave 6 item 5. The summary — "Blueberry +2" by default, or the consumer's own `renderValue` — is what stands in. |
| `combobox` declines `multiple`. | Same, and stated once rather than twice. |
| No `debounce` prop, against the scope paragraph. | A consumer debouncing a remote search writes three lines. Recorded in the inventory and shown on both reference pages. |
| `data-ui` appears on two elements per family. | A consumer's `[data-ui='select']` selector matches the control and the popup. The contract says so under `portalledIdentity`, and both are documented in the anatomy table. |
| `loop` defaults to `false`. | Differs from `menu`, whose `loop` defaults to `true`. A menu is a short list of commands and a wrap is convenient; the APG select-only example does not wrap, and a hundred-option list that jumps from the last option to the first loses the reader's place. |
| The hidden native `select` in React is a real `select` with real `option`s. | It costs one element per option in the DOM. It is what makes a plain `<form>` submit, a `reset()` restore, and a browser's own validation bubble point at the right control. Radix ships the same element for the same reason. |

## 9. React integration

| Question | Answer |
| -------- | ------ |
| Controlled and uncontrolled pair, plus the request carrying a reason | Yes. `@slotted/core/state`'s `createControllable` for each of the three or four capabilities in §7; every request is `(value, request)` where `request` carries `reason`, `previous` and `cancel()`. |
| Application-wide defaults | Yes. `SelectDefaultsProvider` / `useSelectDefaults`, `ComboboxDefaultsProvider` / `useComboboxDefaults`, in `select-defaults.tsx` and `combobox-defaults.tsx`, following `menu-defaults.tsx`. |
| Substituting the rendered element of each public part | Yes. `render` on `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` and the equivalents; `SelectValue` takes `children` as a function of the value. `root`, `positioner` and `content` are documented as fixed in shape — they carry the wiring — and `render` replaces the element, not the attributes. |
| The consumer's own handler still runs | Yes. `compose(theirs, ours)`, the helper `menu-parts.tsx` defines, on every event the family binds. |
| Native element and the imperative action | Yes. `ref` reaches the `button` on `Select` and the `input` on `Combobox`; a named handle exposes `focus()`, `open()`, `close()` and `scrollToKey(key)`. |
| Server rendering | Yes. `useId` for every identifier; no layout read during render — the positioner runs in an effect, and the popup does not exist while closed under the default `mount="active"`. |
| Every state a consumer may style appears in the DOM | Yes. `data-open`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-loading`, `data-selected`, `data-current`, `data-placeholder`, `data-unmatched`, `data-multiple`, `data-empty`. |
| Native props types | Yes. `ComponentPropsWithRef<'div'>`, `'button'`, `'input'`, `'li'` per part, extended rather than restated. |

## 10. Angular integration

| Question | Answer |
| -------- | ------ |
| Two-way value in the signal form | Yes. `model()` for `value`, `open`, `highlightedValue` and `inputValue`; `output()` for each request, carrying `ChangeRequest`. |
| Reactive Forms and template forms | Yes. `SlSelect` and `SlCombobox` implement `ControlValueAccessor` and `Validator`, providing `NG_VALUE_ACCESSOR` and `NG_VALIDATORS`, as `SlRadioGroup` does. `required` and `allowsCustomValue={false}` with an uncommitted string are the two validity errors the families own. |
| Application-wide defaults | Yes. `SELECT_DEFAULTS` / `provideSelectDefaults()` and the combobox pair, following `menu-defaults.ts`. |
| Reaching the instance | Yes. `exportAs: 'slSelect'`, `'slCombobox'`, `'slSelectItem'`, `'slComboboxItem'`. |
| Substituting projected content, kept lazy | Yes. The popup lives in an `ng-template` built into the portal on open — `menu`'s shape — so a hundred options are not constructed until the popup is. `sl-select-item` projects its own content, and `slSelectValue` is a `TemplateRef` the trigger renders through `NgTemplateOutlet` with the current value as context. |
| Zoneless and `OnPush` | Yes. Signals throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`. |
| Teardown | Yes. Every handle — positioner, presence, portal, dismissable layer, typeahead — is released in `DestroyRef.onDestroy`, and the popup's view is destroyed with it. |
| A static attribute the consumer wrote | Yes. `HostAttributeToken` reads `id`, `aria-label` and `aria-labelledby` off the host before the family writes its own. |
| A single class per entry point | Yes. `@slotted/angular/select` and `@slotted/angular/combobox`, each with its own `ng-package.json` and path mapping. |

## 11. Asymmetries, recorded rather than levelled

- Angular's control is a `ControlValueAccessor` and a `Validator`. React's is a
  hidden native `select`. Neither ecosystem has the other's mechanism, and
  neither binding is reduced to the shape both could hold.
- React's `SelectValue` takes a render function; Angular's takes a
  `TemplateRef`. Both substitute the summary; neither imitates the other.
- Angular's popup is an `ng-template` instantiated on open, so `mount="lazy"`
  and `mount="eager"` are a real axis there. React's children are already lazy
  under `mount="active"` because the subtree is not rendered while closed; the
  axis exists in both for the same reasons `menu` gives.
