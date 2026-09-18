# `multi-select` — design

Wave 6 item 5. Inventory in
`docs/history/designs/2026-09-10-multi-select-capability-inventory.md`, which
was written first and from the field.

## 1. What the family is, and where it stops

A frame holding the values a reader has chosen, as chips, beside a real text
input that filters a popup of known options and — when the consumer allows it —
turns what was typed into a value of its own.

The boundary against the two families beside it is the **control element**, and
every difference follows from it.

| | `select` | `combobox` | `multi-select` |
| --- | --- | --- | --- |
| Control | a `button` | an `input` | a frame around an `input` |
| Value | one key, or a set shown as a summary | one key plus the text | an ordered set of keys |
| Chips | above the control, because a button cannot contain the remove button a chip needs | none | inside the control, beside the caret |
| Typed text | only inside the popup, transient | a contract: `inputValue` | a contract, and it can become a value |
| `Backspace` | nothing | the browser's | removes, under the rule §6 names |

`select`'s contract already declines `chips`, creation, limits, duplicates,
reorder and paste here by name, and `combobox` declines `multiple` here. Nothing
in either family changes in this session.

## 2. Anatomy

```
div            data-ui="multi-select" data-part="root"
  div          data-part="control"    role="grid"
    div        data-part="chips"      role="row"
      span     data-ui="tag" data-part="root"   role="gridcell" tabindex="-1"
        span   data-part="body" > span data-part="label"
        button data-part="remove"    tabindex="-1"
      …
      span     data-part="field"     role="gridcell"
        input  data-part="input"     role="combobox"
  span         data-part="counter"
  span         data-part="busy"       data-ui="spinner"
  button       data-part="clear"
  button       data-part="trigger" > span data-part="arrow"
  div          data-part="positioner"                       ← portalled
    div        data-part="content"    role="listbox" aria-multiselectable="true"
      div      data-part="chosen"
      div      data-part="group" > div data-part="group-label"
      div      data-part="item"      role="option"
        span   data-part="indicator"
        span   data-part="icon"
        span   data-part="label" > mark data-part="match"
        span   data-part="description"
      div      data-part="empty"
      div      data-part="status"    role="status"
      div      data-part="placeholder"  data-ui="skeleton"
```

Three decisions are worth their sentence.

**The chip is a `tag`.** It wears `data-ui="tag"` beside this family's own
`data-part`, exactly as `select`'s row does, so the chip a reader removes here
is the chip they know from everywhere else and the pill's geometry — including
the remove control floored at `--slotted-target-min` per density — is stated
once, in `tag.css`.

**`data-ui` is written on the root and on the positioner.** The family is two
subtrees and the popup is portalled out of the first; a stylesheet cannot reach
a subtree that has left the root. This is `select`'s `portalledIdentity`
decision, unchanged.

**The counter is drawn only when `max` is set.** A limit a reader cannot see is
a limit that surprises them, which is one of the gaps the inventory records; a
counter with no limit to count against would be furniture.

## 3. State

| Capability | Controlled | Uncontrolled | Request | Reasons |
| --- | --- | --- | --- | --- |
| `selection` | `value: readonly string[]` | `defaultValue` | `onValueChange` | `select`, `submit`, `remove`, `clear`, `keyboard`, `programmatic` |
| `value` | `inputValue` | `defaultInputValue` | `onInputValueChange` | `keyboard`, `select`, `submit`, `clear`, `blur`, `programmatic` |
| `open` | `open` | `defaultOpen` | `onOpenChange` | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `dismiss`, `blur`, `programmatic` |
| `current` | `highlightedValue` | `defaultHighlightedValue` | `onHighlightedValueChange` | `pointer`, `keyboard`, `programmatic` |

The six selection reasons are distinguished because a consumer writes a
different handler for each, which is the whole argument of
`docs/state-and-events.md`:

- `select` — an option in the popup was chosen or unchosen.
- `submit` — the typed text was committed: by `Enter`, by a delimiter key, by
  paste, or by blur under `commitOnBlur`. It is the only reason that can carry a
  value the collection did not hold.
- `remove` — one value was taken out, by its own control or by `Delete`.
- `clear` — the whole set was taken out at once.
- `keyboard` — the set is the same and its order changed. Reorder emits no other
  reason, so a consumer persisting an order can listen for exactly this one.
- `programmatic` — the imperative handle.

`pointer` is deliberately absent from `selection`: every pointer press on this
family lands on a control whose reason is more specific than "a pointer did it".

**The value is ordered and the order is the reader's.** It is an array, not a
set: the chips are drawn in it, reorder changes it, and a consumer who wants
them alphabetical sorts what they are given. Three of the eight surveyed
implementations hand back an array and none of them says the order is a
contract; here it is, because reorder is meaningless otherwise.

**What is refused is reported, not dropped.** `onValueRefuse(values, cause,
event)` fires with `cause` of `'duplicate' | 'limit' | 'invalid'` and the values
that did not get in. It is not a state model — nothing is held — and it is what
turns the four silences the inventory found into one event a consumer can
answer.

**The edited text of a chip is not modelled.** It exists between `Enter` and
`Enter`, the way a caret exists, and committing it emits `selection` with reason
`submit`. A consumer who owned it would own a value that has no meaning outside
the one keystroke that ends it.

## 4. The pattern, item by item

Two pages answer this family; both were read on 2026-09-10 from the rendered
pattern pages.

- [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — the
  input, the popup, and the whole ARIA list.
- [Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), **Layout Grids
  for Grouping Widgets** — the chip row. The page names this control: "a list of
  recipients for a message may be a grid where each cell contains a link that
  represents a recipient. The grid may initially have a single row but then wrap
  into multiple rows as recipients are added."

### 4.1 Combobox — roles, states and properties

| Requirement | Answer |
| --- | --- |
| The element that serves as an input has role `combobox` | the `input` part; it is a real `<input type="text">`, so every text-editing key, the caret, IME and autofill stay the browser's |
| `aria-controls` refers to the popup | written on the input while the popup is open |
| The popup has role `listbox`, `tree`, `grid` or `dialog` | `listbox`, on the `content` part |
| `aria-haspopup` when the popup is not a listbox | not written; the popup is a listbox and that is the role's implicit value |
| `aria-expanded` false when hidden, true when visible, always present | written on the input |
| DOM focus is on the combobox element | while the reader is typing, yes. While a chip holds focus, DOM focus is on the chip — see the departure in §4.3 |
| `aria-activedescendant` names the focused option | written on the input while the popup is open and something is highlighted |
| `aria-selected` on the option that is the current value | `true` on every chosen option, `false` on every other selectable one |
| Labelled by `label`, `aria-labelledby` or `aria-label` | the input is a real `input`, so `field`'s `label` element labels it natively |
| `aria-autocomplete` matches the behaviour | `list`: the popup presents values that correspond to what was typed, and nothing is completed inline |

### 4.2 Combobox — keyboard, and the two departures

Every key in the pattern's two tables, with what this family does.

| Pattern key | Pattern effect | Here |
| --- | --- | --- |
| `Tab` | the combobox is in the tab sequence; the popup and its descendants are not | as stated. The chips are not a second stop either — §4.3 |
| `Down Arrow` | moves focus into the popup | opens and highlights the first option; open, moves to the next. Focus stays on the input and the highlight is `aria-activedescendant`, which the pattern's own note prescribes |
| `Up Arrow` (optional) | focus on the last element in the popup | adopted, both halves |
| `Alt + Down Arrow` (optional) | display the popup without moving focus | adopted |
| `Alt + Up Arrow` (optional) | return focus and close | adopted |
| `Escape` | dismiss the popup; optionally clear the combobox when already hidden | adopted, both halves: open → close and keep the text; closed → clear the text. It never clears the **selection**, because a set a reader spent six presses building is not something one key should take |
| `Enter` | accept the suggestion; the messaging-application example is "add the accepted value to a list of message recipients and then clear the combobox so the user can add another recipient" | exactly that. The pattern describes this family in its own `Enter` clause |
| Printable characters | type into the combobox | the browser's, filtered afterwards. A delimiter character commits instead — §4.4 |
| Single-line text editing keys | the browser's, uncaptured | the browser's. `Home`, `End`, `ArrowLeft` and `ArrowRight` are the caret's while the caret has anywhere to go |
| Listbox popup: `Enter` accepts and **closes** | | **departure**: the popup stays open, because the set is built by several presses. `closeOnSelect` is an axis and its default is `false`, which is the opposite of `select`'s |
| Listbox popup: `Home` / `End` (optional) | first/last option, or the caret | the caret. The highlight is moved by `PageUp`/`PageDown` instead, which the pattern lists for the grid popup and which `select` and `combobox` both already ship |
| Listbox popup: `Backspace` (optional) | delete the character before the caret | the browser's — except from an empty input, where §4.4 takes it |

**Departure 1 — the popup is multi-selectable.** The pattern's own note says "a
combobox is a single-select widget where selection follows focus in the popup".
This popup writes `aria-multiselectable="true"`, `aria-selected` on more than one
option at a time, and selection does not follow focus: moving the highlight
chooses nothing and `Enter` toggles.

The cost is that a screen reader that reads the note rather than the attribute
will describe the widget as single-select on first encounter. It is paid because
the alternative — a `grid` popup, which the pattern does allow for multiple
values per row — puts the whole grid key table on the popup, and a reader would
then drive one grid inside the control and another inside the surface with the
same four arrows. All four of Base UI, Mantine, PrimeNG and the platform's own
`<select multiple>` write `aria-multiselectable` on a list, and none of them
reaches for a grid.

**Departure 2 — `Enter` does not close.** Stated above; the cost is that a
reader who expects one press to finish has to press `Escape` or `Tab`. The
pattern's own `Enter` example — add a recipient, clear the box, add another —
is the argument, and `closeOnSelect` is there for the consumer who disagrees.

### 4.3 Layout grid — the chip row

The `control` part is `role="grid"` with exactly one `role="row"`. Each chip is
one `role="gridcell"`, and the input's wrapper is the last `gridcell` of the same
row. One DOM row is what makes the cross-axis arrows free, and the visual wrap
onto several lines is CSS `flex-wrap` — the reading order stays linear, so
"previous" and "next" have one meaning each.

| Requirement | Answer |
| --- | --- |
| Container has role `grid` | the `control` part |
| Each row has role `row` | the `chips` part |
| Each cell has role `gridcell` | each chip, and the field holding the input |
| Labelled | `aria-label` carrying the field's label and the count, so a reader landing on the row hears how many chips there are before hearing all of them |
| Only one element of the grid is in the tab sequence | the input, always. A chip is reached with an arrow, never with `Tab` |
| `Right Arrow` / `Left Arrow` move one cell | adopted, and **mirrored under `dir="rtl"`**, which no surveyed implementation does |
| `Home` / `End` | first cell / last cell. On the input they are the caret's, which is the pattern's own "if the combobox is editable" branch |
| `Down Arrow` / `Up Arrow` move one cell | **departure**: never answered by the grid. There is one row, so there is no cell above or below, and the two keys belong to the popup |
| Cell containing one widget → focus the widget; cell containing text → focus the cell | **departure**: a chip cell holds text *and* a remove `button`, which the pattern calls the case that "adds complexity". Focus is set on the cell; the remove button is `tabindex="-1"` and its function is duplicated on `Delete` and `Backspace`. React Aria's `TagGroup` and Angular Material's `MatChipGrid` both resolve it this way. The cost: a reader who has not tried `Delete` may not learn the button is there, which is why the row's own description names the key |
| Alphanumeric keys place focus in the editable cell | adopted: a printable character pressed on a chip moves focus to the input and types it |
| `Enter` disables grid navigation and places focus in an input field | adopted for `editable`: `Enter` on a chip turns its cell into a field. `Escape` restores grid navigation and reverts, `Enter` commits |
| Selection functions (`Control + A`, `Shift + Arrow`) | not shipped. The chips are not a selectable collection; the reader's selection is the set itself |

### 4.4 The keys this family owns

Neither pattern has an answer for these; each is written because the inventory
found no two implementations that agreed.

| Key | Where | Effect |
| --- | --- | --- |
| `Backspace` | input, caret at 0, query empty, first press | moves focus to the last chip. Nothing is removed |
| `Backspace` | input, caret at 0, query empty, second press | removes that chip. This is §6's "regra previsível": one press to see what is about to go, one to let it go |
| `Backspace` | input, query not empty | the browser's |
| a delimiter (`,` by default) | input | commits the typed text as a value, and is never typed |
| `Delete` or `Backspace` | a chip | removes that value |
| `Alt` + next/previous arrow | a chip | moves that value one place along the row, direction-aware, and announces where it landed |
| `Alt` + `Home` / `End` | a chip | moves that value to the start or the end |
| `Escape` | a chip | returns focus to the input |
| any printable character | a chip | returns focus to the input and types it |

## 5. Focus

| Event | Where focus goes |
| --- | --- |
| The popup opens | nowhere. The input keeps it and the highlight is `aria-activedescendant` |
| A chip is removed | the chip that took its index, then the previous chip, then the input. `createRemovalFocus` from `@slotted/core/focus` already implements the three steps, and the third is the one the field gets wrong |
| The whole set is cleared | the input |
| A duplicate is typed | the chip that already holds the value, so the reader is shown where their value is instead of being told nothing happened |
| The popup closes | wherever it was; the input never lost it |
| Chip editing is committed or reverted | the chip's cell |

A disabled chip keeps its place and its label, draws no remove control, is
skipped by `Backspace`, and is reachable by arrow — because the reader still has
to be able to read it.

## 6. Composition and configuration once

Every part takes `render` in React and is a projected slot in Angular. The two
parts a consumer most often replaces are `item`, to draw an option with an
avatar and a description, and the chip, to draw a value with an icon.

Defaults are set once for a subtree in both bindings: `MultiSelectDefaults` — a
React context and its hook — and `provideMultiSelectDefaults()` with an
injection token in Angular. The consumer's explicit prop always wins over the
provider, and the provider over the built-in default, which is the resolution
order every family in this library declares.

## 7. React integration

| Question | Answer |
| --- | --- |
| Controlled and uncontrolled pair plus a request carrying a reason | four of them, tabled in §3 |
| Defaults set once | `MultiSelectDefaultsProvider` and `useMultiSelectDefaults` |
| Every public part substitutable | `render` on root, control, chips, field, input, counter, clear, trigger, content, item and each item part |
| The consumer's handler still runs | composed, never replaced: the family's handler runs after the consumer's and does nothing if the event was defaulted-prevented |
| Native element and imperative action reachable | `ref` to the input, and a handle with `focus()`, `open()`, `close()`, `setValue(values, reason)`, `scrollToKey()` |
| Server rendering without a mismatch | `useId` for every id; nothing is measured during render; the collapse and the width gate are effects |
| Every state a consumer may style is in the DOM | the `data-*` vocabulary the contract declares, including `data-complete` on a full control |
| Part props are the native element's, extended | `ComponentPropsWithRef<'div' \| 'input' \| 'button' \| 'span'>` per part |

Form: one visually hidden `<input type="hidden">` per value, all carrying the
same `name`, plus `required` and `form` on the first — which is how a plain
`FormData` receives several values under one key and how a native `reset()`
restores them.

## 8. Angular integration

| Question | Answer |
| --- | --- |
| Two-way value in the signal form | `model()` for `value`, `inputValue`, `open` and `highlightedValue`; `output()` for each request carrying a reason, and for `valueRefuse` |
| Reactive Forms and template forms | `ControlValueAccessor` **and** `Validator`, reporting `required`, `tooMany` when the set is over `max`, and `duplicate` when duplicates are refused and one arrived anyway |
| Defaults set once | `MULTI_SELECT_DEFAULTS` and `provideMultiSelectDefaults()` |
| A template can reach the instance | `exportAs: 'slMultiSelect'` |
| Projected content, kept lazy | named `ng-content` slots for the item and chip templates; `NgTemplateOutlet` for the item, which is re-rendered per option |
| Zoneless and `OnPush` | signals throughout; no `markForCheck` |
| Every subscription torn down | `takeUntilDestroyed` and `DestroyRef` for the collapse handle, the width gate, the removal focus and the arrow navigation |
| A static attribute the consumer wrote survives | read with `HostAttributeToken` before writing over it |
| One class per entry point | `@slotted/angular/multi-select` |

The asymmetry is recorded rather than levelled: Angular gets a `Validator` that
React has no equivalent of, and React gets a `render` prop that Angular answers
with projection and `NgTemplateOutlet`. Both are the idiomatic answer in their
own ecosystem to the same question.

## 9. Visual decisions

| Decision | Value | Why |
| --- | --- | --- |
| Control geometry | `--slotted-control-*`, read directly | The frame is a control. It is the only family so far whose height is not fixed: it grows by whole rows of chips, and each row is one chip's height plus the row gap |
| Minimum height | `--slotted-control-height-<size>` | An empty control is exactly the height of a text field beside it on the same form |
| Chip size | `tag`'s `sm` step | A chip inside a 34-pixel control at `comfortable` is 24 pixels, which `tag.css` already floors at `--slotted-target-min` for its remove button |
| Row wrap | `flex-wrap: wrap`, bounded to three rows, scrolling past that | §6: overflow summarises without hiding access. Three rows is where the control stops being a field and starts being a panel |
| The row's scrollbar | none | A form control has one frame, and a bar inside that frame takes width from the chips, moves them when it appears, and paints a second edge inside the control's own. The scrolling is kept and the bar refused: the wheel and every arrow key still reach the rows above and below, and what says there is more is the counter, the row's own `aria-label`, and the band in the popup |
| `overflow="collapse"` | one row, `createCollapse`, a `+N` chip that opens the popup | For a control that must stay one line high in a table row. The whole set is then reachable in the popup's `chosen` band, which `select` already draws |
| Narrow width | under 120 px there is no chip; the counter answers instead | `createWidthGate`, not a container query: `container-type: inline-size` would stop the frame's own width depending on its contents, which is how a control that is not `fullWidth` is measured. `select` recorded the same finding |
| Popup motion | `scale` with `opacity`, origin from `--slotted-positioner-transform-origin` | The grammar `tooltip`, `popover`, `menu` and `select` share |
| Chip arrival and departure | no transition | A chip that faded in would delay the row's reflow behind it, and the reader has just pressed a key; the announcement carries the change instead |
| Reorder | no transition | Moving a chip changes the DOM order, and a transition across that needs a measured FLIP on every press. What the eye follows instead is the focus ring, which travels with the chip because focus stays on it, and the announcement, which names the new position |

## 10. Declined and deferred

| Item | Verdict | Reason |
| --- | --- | --- |
| Pointer drag to reorder | defer to the drag-and-drop infrastructure | `docs/component-features.md` §3 files drag-and-drop as `[Extended]` shared infrastructure and `packages/core` holds none of it yet. The keyboard reorder §4.4 defines is the alternative §2.8 requires, and it is built first so that it is not an afterthought of a drag |
| Select all / toggle all | decline | Two lines of consumer code against the imperative handle, and the family cannot answer what "all" means under a limit and under a filter |
| Virtualization | defer to `collection` | §2.10 makes it a capability of the engine. `listbox` already reads `window` from it |
| Modality and a backdrop | defer to `dialog` | The same decline `select`, `menu` and `popover` each recorded: inerting the page would inert the control that closes the popup |
| A popup arrow | defer to `popover` | The popup is as wide as its control and hangs under it, so the control already says where it came from |
| An inline completion string (`aria-autocomplete="both"`) | decline | It selects a range of the input's text, and the input's text here is a query that is about to be emptied. `combobox` ships it, for a family whose text is the value |

## 11. What a wrong answer at the visual gate costs

The anatomy in §2 and the picture are what the five steps after the gate are
built on. Correcting either of the two decisions below afterwards costs the
bindings, the behavioural tests and both reference pages rather than the
stylesheet.

- **Chips inside the frame rather than above it.** It is what makes the control
  a grid, what makes `Backspace` reach a chip, and what makes the control grow
  by rows. Moving them above the control afterwards is `select`'s shape, and
  this family stops being a different family.
- **Three wrapped rows before scrolling, rather than one row and a `+N`.** It
  decides whether the control is a field or a panel, and every capture, every
  demonstration and the whole narrow-width behaviour follow from it.
