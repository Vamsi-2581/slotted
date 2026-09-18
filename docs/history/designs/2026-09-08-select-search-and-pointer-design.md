# Select search and pointer affordance — design

Follow-up pass on `select` and `combobox`. Inventory:
`docs/history/designs/2026-09-08-select-search-and-pointer-capability-inventory.md`.
The pair's first design is
`docs/history/designs/2026-09-04-select-and-combobox-design.md`; every
decision there still stands except where this document names it.

## 1. The cursor

`button/button.css` draws `cursor: pointer` on every button in the library.
`select`'s trigger is a button and drew `default`; the options in both popups
drew `default` as well. The three rules came from the native `select`, whose
popup the operating system draws — the element this family refused, and for the
reason that its popup is not a web surface.

| Element | Was | Is |
| ------- | --- | -- |
| `select` `trigger` | `default` | `pointer` |
| `select` `item` | `default` | `pointer` |
| `combobox` `item` | `default` | `pointer` |
| either, disabled | `not-allowed` | unchanged |
| either, loading | `progress` | unchanged |

`menu`, `menubar` and `listbox` keep `cursor: default`, and the divergence is
deliberate rather than overlooked. A menu item is a command and follows the
platform's own menus, which draw an arrow; `listbox` is a standalone widget
whose rows are the page's own content rather than a popup a reader opened to
answer one question. What these two families have that those three do not is a
control that was pressed to open a surface, and a surface that closes the moment
a row is taken.

## 2. Search, and why it is not `combobox`

`combobox` is the family whose **typed text is a value**: `inputValue` is a
contract, `allowsCustomValue` decides whether the text can become the key, and
`aria-autocomplete` says how the two relate. A reader choosing one of two
hundred known offices does not want to own that text.

`select`'s search is a **transient query**. It never becomes a value, it is
cleared when an option is committed, it is cleared when the popup closes, and
the control shows the chosen label the whole time. `docs/component-features.md`
§6 says the select takes no free-text entry, and this keeps that: **the control
takes no text at all.** The field is inside the popup.

The paragraph's second sentence — "Grande volume ou busca explícita usa
Combobox" — is amended in the same commit, because a select that can search a
long list is what the first half of the paragraph asks for.

## 3. The pattern, transcribed

Source pages, read 2026-09-08:

- Combobox Pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/>
- Date Picker Combobox Example — <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/>

The pattern already holds this shape, and the wiring below is its own:

| Requirement, quoted | Where it is answered |
| ------------------- | -------------------- |
| "The popup is an element that has role `listbox`, `tree`, `grid`, or `dialog`." | With `search`, `content` carries `role="dialog"`. Without it, `content` carries `role="listbox"`, unchanged. |
| "If the popup has a role other than `listbox`, the element with role `combobox` has `aria-haspopup` set to a value that corresponds to the popup type. That is, `aria-haspopup` is set to `grid`, `tree`, or `dialog`." | The trigger writes `aria-haspopup="dialog"` with `search`, and `listbox` without it. |
| "Unlike other combobox popups, dialogs do not support `aria-activedescendant` so DOM focus moves into the dialog from the combobox." | Focus moves to the search field as the popup opens — however it was opened, a press on the trigger included — and the trigger takes it back when the popup closes by `Escape`, by a commit or by any key. An outside press and a blur leave focus where the reader put it. |
| "Down Arrow: If the popup is available, moves focus into the popup … places focus on the first focusable element in the popup." | The search field is the first, and the only, focusable element in the layer. |
| Listbox pattern, on the popup inside the dialog | The search field is itself `role="combobox"` over the `list`, which carries `role="listbox"`: DOM focus stays on the field and the highlight is `aria-activedescendant`, exactly as the pair already works. |

So the family holds **two comboboxes when it searches, and one when it does
not**: the trigger, over a dialog, and the field inside that dialog, over the
listbox. Each has one popup and one `aria-expanded`, which is what the pattern
describes and what a reader hears one at a time — the trigger's is announced
while the popup is closed, the field's while it is open, and focus is never on
both.

## 4. Anatomy

Nothing changes when `search` is off. With it on, one element is added inside
`content` and one is added around the options:

```
┌─ positioner ─ div ─ data-ui='select' ─ portalled ─────────┐
│ ┌─ content ─ role=dialog ─ data-search ────────────────┐  │
│ │ ┌─ search ─────────────────────────────────────────┐ │  │
│ │ │ search-icon │ search-input ─ role=combobox       │ │  │
│ │ └──────────────────────────────────────────────────┘ │  │
│ │ ┌─ list ─ role=listbox ─ scrolls ──────────────────┐ │  │
│ │ │ item ▸ indicator │ icon │ label ▸ match │ desc   │ │  │
│ │ └──────────────────────────────────────────────────┘ │  │
│ │ empty ▸ "No options"      status ▸ "12 results"      │  │
│ └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

Four new parts: `search`, `search-icon`, `search-input`, `list`. All four exist
only under `search`, which is what makes this an opt-in rather than a break: a
consumer who does not set it renders the DOM they rendered yesterday.

`content` is the painted surface in both shapes, which is the one selector a
consumer writes. What moves is the **scroller**: without `search` it is
`content`; with it, `content` is a two-row column — the field, then the list —
and `list` scrolls under a field that stays. A search that scrolled away with
its own results is a search a reader loses on the fourth row.

`match` is the same part `combobox` marks a label with, from the same
`splitByMatch`, drawn as a `mark` for the same reason.

## 5. State

One capability is added to §7 of the pair's design:

| Capability | Controlled | Uncontrolled | Request | Reasons |
| ---------- | ---------- | ------------ | ------- | ------- |
| `value` | `searchValue` | `defaultSearchValue` | `onSearchValueChange` | `keyboard`, `select`, `clear`, `programmatic` |

It is filed under `value` because that is where `combobox` files `inputValue`,
and the two are the same kind of thing: text a control carries that is not the
key it commits. The reset the popup performs when it opens and when it closes
carries `clear`, which is what happened — the field was emptied — rather than a
fifth word in `CHANGE_REASONS` that only this family would ever emit.

The query is **not** a value and never becomes one: `onValueChange` is not
emitted when the query changes, and no request carries both.

## 6. Keyboard, transcribed against §4.2 of the pair's design

Closed, with `search` on: unchanged, except that a printable character seeds the
query rather than the typeahead — the popup opens and the character is the first
in the field. Typeahead is off while `search` is on, in both states: the reader
types into a field, and a second search running on the same keys would move the
highlight twice per character.

Open, with focus in the search field:

| Key | Effect | Departure |
| --- | ------ | --------- |
| `ArrowDown` / `ArrowUp` | Moves the highlight. `loop` decides whether it wraps. | — |
| `PageDown` / `PageUp` | Moves the highlight ten options. | — |
| `Home` / `End` | The browser's caret movement. Not bound. | From §4.2, where they highlight the first and last option. The pattern's own editable branch returns them to the caret, and `combobox` already answers this way. |
| `Enter` | Commits the highlighted option; closes unless `multiple` keeps it open. | — |
| `Space` | Types a space. Not bound. | From §4.2, where it commits. A field the reader is typing into cannot spend the space bar on a commit. |
| `Escape` | Query first: a non-empty query is cleared and the popup stays; an empty one closes the popup and returns focus to the trigger. | The pattern makes the clearing branch optional and names it. |
| `Tab` | Commits the highlighted option, closes, and moves on. | None in effect. The mechanism departs: focus is inside a portalled layer at the end of the document, so the browser's own next element is not the element after the control. `tabbables()` from `@slotted/core/focus` reads the document's tab order with the layer's own subtree excluded, the trigger is found in it, and focus goes to the entry beside it — before it under `Shift`. Returning focus to the trigger and stopping there was the first answer and it cost a second `Tab` to leave a control the reader had finished with. |
| Printable, `Backspace`, `Delete` | The browser's text editing. Never bound. | — |
| `ArrowLeft` / `ArrowRight` | The browser's caret movement. Never bound. | — |

## 7. Decisions taken, with their cost

| Decision | Cost |
| -------- | ---- |
| The field is inside the popup, not in the control. | The reader presses the control, then types — one gesture more than `combobox` asks for. What it buys is that the two families stay distinguishable and the control keeps showing the chosen label while the query is being typed. |
| Focus enters the layer, for the first time in this family. | `focus.guards` was declined on the grounds that focus never enters; that reason now holds only while `search` is off. There is exactly one focusable element in the layer and `Tab` is bound, so no guard is needed — but the contract records the two shapes rather than one. |
| The field takes focus however the popup was opened, a press on the trigger included. | A reader who reached for the mouse gets a caret they did not ask for. The alternative is a control that behaves differently by device, and a keyboard reader who pressed `Enter` would then have to press `Tab` to reach the field the popup exists for. |
| The trigger takes focus back on `Escape`, on a commit and on any key — and not on an outside press or a blur. | Two closing paths restore and two do not, which is one rule more than "always restore". What it buys is that a reader who clicked into the next field is left in the next field. |
| The two-step `Escape` is decided in the layer's `onDismiss`, not in the field's `keydown`. | `packages/core/src/dismissable-layer` listens in the capture phase, so the layer asks to close before anything inside it sees the key; a field that handled it first emptied the query *and* took the surface with it. `onDismiss` is an ask, and not calling `setOpen` is how a family refuses. The field keeps a handler for the one case the layer is silent — `closeOnEscape={false}` — and it only empties the query there. |
| `Tab` reads the document's tab order to find where to go. | One walk of the document's tabbable elements per `Tab` press, at the moment the interaction ends. The alternative was a second `Tab` on every exit. |
| The `chosen` band still carries no remove control. | The reason it was given — focus never enters this layer — is now true only while `search` is off, so it is restated rather than kept: the layer's one `Tab` is spent commiting and leaving the control, and a remove control in the band would be reachable by pointer and by nothing else. Giving it one would mean spending `Tab` on the band instead, which is the answer the round before this one rejected. |
| The query is cleared on commit and on close. | A consumer who wants the query kept between opens owns `searchValue`. The uncontrolled family forgets, which is what every surveyed implementation does. |
| `filter` is an adapter defaulting to `createFilter`, and `null` turns filtering off. | The same prop, the same default and the same escape hatch as `combobox`, so a server-filtered select and a server-filtered combobox are configured identically. |
| Options filter themselves, as `combobox`'s do. | The popup's DOM is the result set, so the count, the empty row and every movement key read one answer. A group whose options all fell away hides itself. |
| No clear button in the search row. | `Escape` is the only way to empty the field without pressing `Backspace`. Recorded in the inventory, and shown on both reference pages. |
| A new glyph token, `--slotted-icon-search`. | One row in `packages/theme-default/src/glyphs.json` and one in `packages/tokens/src/contract.json`, both append-only. A search field with no magnifier is a text field, and every glyph in this library comes from the token layer rather than from a family's own path data. |
| Typeahead is off while `search` is on. | `typeahead` still defaults to `true` and still runs for every select that does not search. |

## 8. Framework integration

Only the lines the new capability changes; every other line of §9 and §10 of the
pair's design stands.

| Question | React | Angular |
| -------- | ----- | ------- |
| Controlled and uncontrolled pair with a reason | `createControllable` for `searchValue`, as for the other three. | `model()` for `searchValue`, `output()` for `onSearchValueChange`. |
| Application-wide defaults | `search`, `highlightMatch`, `searchPlaceholder`, `searchLabel`, `countLabel` join `SelectDefaultsProvider`. | The same five join `SELECT_DEFAULTS`. |
| Substituting the rendered element | `SelectSearch` is a part component with its own `render`, and `SelectContent` takes its props as `searchProps`: it is **rendered by the family rather than placed by the consumer**, because the two elements it sits between — the dialog and the listbox — are wiring the family owns, and a consumer who placed it could put it inside the listbox. Every native attribute of the input, its glyph and its `render` are reachable through that one prop. | The field is part of the popup template. Its words are inputs — `searchPlaceholder`, `searchLabel` — for the same reason. |
| Reaching the native element | The field is a real `input`; `ref` reaches it through the part. | `exportAs: 'slSelectSearch'`. |
| Server rendering | The popup does not exist while closed under `mount="active"`; the field is built with it. | The `ng-template` is instantiated on open, as the rest of the popup is. |
