# `tags-input` — design

Wave 8, round 11. Inventory in
`docs/superpowers/specs/2026-09-14-tags-input-capability-inventory.md`, written
first and from the field.

## 1. What the family is, and where it stops

A text field whose value is a list of texts the reader wrote. Each text is a
chip, the input beside them is a plain text box, and what is typed becomes a
value on `Enter`, on a delimiter, on a paste, or on leaving the control.

The boundary against `multi-select` is **what the value is**, because the
control is the same shape — the two families share the frame, the chip row, the
grid pattern and the `Backspace` rule, and differ in everything the value
touches:

|                        | `multi-select`                                                 | `tags-input`                                                                                   |
| ---------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| The value              | an ordered set of keys, resolved to labels by a collection     | an ordered list of texts; the text is the label                                                |
| Where a value comes from | a listbox popup, and the typed text under `creatable`        | the typed text, always                                                                         |
| The input              | `role="combobox"` over a popup                                 | a text box; `list` reaches the browser's own datalist                                          |
| A value that fails     | refused and reported                                           | held, marked, described, and reported — `invalidValues="refuse"` is the other answer           |
| Who judges             | `validateValue`, the consumer                                  | `validate`, or the input's own constraints through the browser                                 |
| Composes               | positioner, presence, portal, dismissable-layer, collection, … | `@slotted/core/tags`, overflow, measure, focus, live-announcer, clipboard                       |
| `selection` capability | held                                                           | not held: there is no collection. The list and the pending text are both `value`               |

Nothing in `multi-select` changes in this session. The wider blur axis this
family takes (§3) is recorded for it in `docs/build-order.md`.

## 2. Anatomy

```
div            data-ui="tags-input" data-part="root"
  div          data-part="control"  role="grid"   aria-label="{label}, {count} values"
    div        data-part="chips"    role="row"    aria-describedby="…hint"
      span     data-ui="tag" data-part="root"  role="gridcell" tabindex="-1"  data-value
        span   data-part="start"                 ← the alert mark, only while invalid
        span   data-part="body" > span data-part="label"
        span   data-part="message"               ← the reason, visually hidden, only while invalid
        button data-part="remove"  tabindex="-1"
      …
      span     data-ui="tag" data-count role="gridcell" tabindex="-1"   ← +N, collapse only
      span     data-part="field"    role="gridcell"
        input  data-part="input"    type="text | email | …"
  span         data-part="counter"                ← only while max is set, or the frame is narrow
  button       data-part="clear"
  span         data-part="hint"                   ← visually hidden; names Delete, and Enter when editable
  input        type="hidden" name="…"  × one per value   (React)
```

Four decisions are worth their sentence.

**The chip is a `tag`**, worn as `data-ui` beside this family's own parts, as
`select` and `multi-select` already do. An invalid chip is the same `tag` in
its `danger` tone with `--slotted-icon-circle-alert` in its `start` slot: the
family adds two states to the pill and no geometry.

**The input has no role.** It is a text box that opens nothing, so the
combobox pattern does not apply and nothing is written that would claim it
does. What the input keeps is everything the platform gives a text box:
`type`, `pattern`, `list`, `inputmode`, `enterkeyhint`, `autocomplete`, the
caret, IME composition, and constraint validation.

**Only the `message` and `hint` parts are hidden.** They are for assistive
technology and the stylesheet hides them visually; nothing else in the family
is hidden from anyone.

**The counter is drawn only while `max` is set** or the frame is too narrow
for a chip — `multi-select`'s reason: a counter with nothing to count against
is furniture.

## 3. State

| Capability     | Controlled   | Uncontrolled        | Request              | Reasons                                                |
| -------------- | ------------ | ------------------- | -------------------- | ------------------------------------------------------ |
| `value.tags`   | `value`      | `defaultValue`      | `onValueChange`      | `submit`, `remove`, `clear`, `keyboard`, `programmatic` |
| `value.text`   | `inputValue` | `defaultInputValue` | `onInputValueChange` | `keyboard`, `submit`, `clear`, `blur`, `programmatic`   |

One capability, two models: both are text the control holds, and the schema
lets a capability carry a set of named models. `selection` is not declared,
because nothing here is a selection over a collection.

- `submit` — typed text became a value: `Enter`, a delimiter, a paste, blur
  under `pendingOnBlur="commit"`, or a chip's edit committed.
- `remove` — one value left, by its remove control, by `Delete`, by
  `Backspace`, or by `Ctrl+X`.
- `clear` — every value left at once.
- `keyboard` — the list is the same and its order changed. Reorder emits no
  other reason.
- `programmatic` — the imperative handle.

**The value is ordered and the order is the reader's.** Inherited from
`multi-select`, for the same reason: reorder is meaningless otherwise.

**What is refused is reported, not dropped.** `onValueRefuse(values, { cause,
source })` with `cause` of `duplicate | limit | invalid` — `invalid` only under
`invalidValues="refuse"`. It is not a state model: nothing is held.

**Validity is derived, not held.** Every value in the list is judged at render
by `validate`, or by the input's constraints when `validate` is absent; the
verdict is `data-invalid` on the chip, `data-invalid` on the root, `aria-invalid`
and a description on the cell, `setCustomValidity` on the input, and the
`invalidValues` error of the Angular `Validator`. A consumer who owns the value
and holds an invalid entry in it sees it marked, because the judgement is a
function of the value alone.

**The edited text of a chip is not modelled.** It exists between one `Enter`
and the next, and committing it emits `submit`.

## 4. The pattern, item by item

One page answers this family, read on 2026-09-14 from the rendered pattern:
[Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), **Layout Grids
for Grouping Widgets**. It names this control: "a list of recipients for a
message may be a grid where each cell contains a link that represents a
recipient. The grid may initially have a single row but then wrap into multiple
rows as recipients are added."

### 4.1 Roles, states and properties

| Requirement                                                                 | Answer                                                                                                                                                                                 |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container has role `grid`                                                   | the `control` part                                                                                                                                                                     |
| Each row has role `row`                                                     | the `chips` part, exactly one                                                                                                                                                          |
| Each cell has role `gridcell`                                               | each chip, the `+N` chip, and the field holding the input                                                                                                                              |
| Labelled                                                                    | `aria-label` on the grid carrying the field's label and the count, so a reader landing on it hears how many values there are before hearing all of them                                |
| `aria-describedby`                                                          | the row names the `hint` part, which says `Delete` removes and — when editable — `Enter` edits. Angular Material's own guidance for an editable chip                                    |
| Only one element of the grid is in the tab sequence                         | the input. A chip is reached with an arrow, never with `Tab`                                                                                                                           |
| Disabled cells                                                              | a locked value's chip carries `data-disabled`, draws no remove control, is skipped by `Backspace`, and is still reachable by arrow                                                       |
| The input                                                                   | a native text box: no ARIA role, `aria-invalid` only while the list holds an invalid value, `aria-describedby` from the field around it                                                 |

### 4.2 Keyboard — the layout-grid table

| Pattern key                                     | Pattern effect                                                                                    | Here                                                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Right Arrow`                                   | one cell to the right; optionally wraps to the next row; no move from the last cell               | one cell toward the end of the row, **mirrored under `dir="rtl"`**. On the input, the caret's while the text is not empty                                                          |
| `Left Arrow`                                    | one cell to the left; optionally wraps; no move from the first cell                               | one cell toward the start; mirrored. On the input, the caret's while the text is not empty                                                                                          |
| `Down Arrow` / `Up Arrow`                       | one cell down / up                                                                                | **departure**: not answered. There is one DOM row; the wrap onto several lines is CSS, so there is no cell above or below any cell. Binding the keys would make "down" mean "next" |
| `Page Down` / `Page Up` (optional)              | an author-determined number of rows                                                               | not shipped; one row                                                                                                                                                              |
| `Home` / `End`                                  | first / last cell in the row                                                                      | over the chips, yes. On the input, the caret's while the text is not empty — the pattern's own "if the cell contains editable content" branch                                      |
| `Control + Home` / `Control + End` (optional)   | first / last cell of the grid                                                                     | not shipped; one row makes them `Home` and `End`                                                                                                                                  |
| Cell with one widget → focus the widget; cell with text → focus the cell | | **departure**: a chip cell holds text *and* a remove button. Focus is on the cell, the button is `tabindex="-1"`, and its function is on `Delete` and `Backspace` — the resolution React Aria's `TagGroup` and Angular Material's chip grid both take, and the one `multi-select` records |
| Alphanumeric keys place focus in the editable cell | | a printable character on a chip moves focus to the input and types it there                                                                                                       |
| `Enter` disables grid navigation and places focus in an input field; `Escape` restores it | | `Enter` on a chip, under `editable`, turns the cell into a field; `Escape` reverts; `Enter` commits                                                                                 |
| Selection functions (`Control + A`, `Shift + Arrow`) | | not shipped — the inventory's decline. The reader's selection is the list itself                                                                                                  |

### 4.3 The keys this family owns

| Key                                | Where                                    | Effect                                                                                                                                              |
| ---------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Enter`                            | input, text not empty                    | commits the text as a value and is never submitted to the form                                                                                      |
| `Enter`                            | input, text empty                        | the platform's implicit submission, uncaptured                                                                                                      |
| a delimiter (`,` by default)       | input                                    | commits the typed text and is never typed                                                                                                           |
| `Backspace`                        | input, text empty, first press           | moves focus to the last chip; removes nothing                                                                                                       |
| `Backspace`                        | input, text empty, second press          | removes that chip                                                                                                                                   |
| `Delete` / `Backspace`             | a chip                                   | removes it                                                                                                                                          |
| `Alt` + next/previous arrow        | a chip, under `reorderable`              | moves it one place, direction-aware, announced                                                                                                      |
| `Alt` + `Home` / `End`             | a chip, under `reorderable`              | moves it to either end                                                                                                                              |
| `Ctrl`/`⌘` + `C`                   | a chip                                   | copies its value                                                                                                                                    |
| `Ctrl`/`⌘` + `X`                   | a chip, not locked, not read-only        | copies its value and removes it                                                                                                                     |
| `Ctrl`/`⌘` + `C`                   | input, text empty                        | copies the whole list, joined by the first delimiter and a space                                                                                    |
| `Escape`                           | a chip                                   | returns focus to the input                                                                                                                          |
| `Escape`                           | input                                    | clears the pending text. It never clears the list                                                                                                   |
| double click                       | a chip, under `editable`                 | edits it, for the pointer reader who has no `Enter`                                                                                                 |
| `Tab`                              | anywhere in the control                  | leaves. Under `pendingOnBlur="commit"` the text is committed first; under `discard` it is emptied; under `keep` it stays                            |

## 5. Focus

| Event                        | Where focus goes                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A chip is removed            | the chip that took its index, then the previous one, then the input — `createRemovalFocus`                   |
| The list is cleared          | the input                                                                                                    |
| A duplicate is typed         | the chip that already holds it, which wears `data-current` for one motion-scale duration                     |
| A chip edit ends             | the chip's cell                                                                                              |
| The control gains focus      | under `overflow="collapse"`, the row expands to every chip (`data-expanded` on the root); it collapses when focus leaves |
| The `+N` chip is pressed     | the input, which expands the row                                                                             |

## 6. Judging a value

`@slotted/core/tags` holds the arithmetic, so the two bindings cannot disagree
about it:

- `splitValues(text, delimiters)` — the paste split: the delimiters and every
  line break, trimmed, empties dropped. Replaceable per instance by `split`.
- `admitValues(candidates, state)` — normalise, judge, deduplicate, cap, and
  return `{ next, refused: { duplicate, limit, invalid } }`. Under
  `invalidValues="keep"` an invalid value is in `next`; under `refuse` it is in
  `refused.invalid`.
- `constraintVerdict(input, text)` — the platform's judgement: a detached input
  cloned from the visible one's `type`, `pattern`, `minlength`, `maxlength`,
  given the text, and asked `validity.valid` and `validationMessage`.

`validate(text) => boolean | string`: `true` is valid, `false` is invalid with
`invalidLabel`, a string is invalid with that reason. When `validate` is
absent, the constraint verdict is the judgement — so `<TagsInput type="email">`
marks `jhon.company` with the browser's own sentence and no consumer code.

## 7. Composition and configuration once

React: one component. Its props are the input's (`ComponentPropsWithRef<'input'>`
less `value`, `defaultValue`, `size`, `type`), so `placeholder`, `pattern`,
`list`, `name`, `form`, `required`, every `aria-*` and every handler reach the
input; `className` and `style` reach the frame. `render` replaces the frame.
`formatLabel(value)` draws a chip's text from its value, for a value that is
an address and a label that is a name. `ref` is the input, as `text-field`'s
is; `handleRef` is the imperative handle — `focus()`, `clear()`,
`setValue(values, reason)`.

Angular: one directive on the consumer's own `<input slTagsInput>`, which is the
shape `text-field` and `multi-select` take; the frame, the row and the buttons
are rendered around it. `ControlValueAccessor` and `Validator`; `model()` for
`value` and `inputValue`; `output()` for each request and for `valueRefuse`;
`exportAs: 'slTagsInput'`; `formatLabel` as an input.

Defaults once: `TagsInputDefaultsProvider` and `useTagsInputDefaults`;
`TAGS_INPUT_DEFAULTS` and `provideTagsInputDefaults()`. The explicit prop wins
over the provider, and the provider over the built-in default.

## 8. React integration

| Question                                               | Answer                                                                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair with a reasoned request | two of them, §3                                                                                                                                       |
| Defaults set once                                      | `TagsInputDefaultsProvider`                                                                                                                             |
| Every public part substitutable                        | `render` on the frame; the input is the consumer's props. The chip is `tag`'s and `formatLabel` is its text; the remove, clear, counter and hint parts are fixed, because each carries an accessible name the family owns |
| The consumer's handler still runs                      | composed: the family's `onKeyDown`, `onPaste`, `onBlur`, `onChange` run after the consumer's and do nothing when `defaultPrevented`                      |
| Native element and imperative action                   | `ref` to the input; `handleRef` for `focus()`, `clear()`, `setValue()`                                                                                  |
| Server rendering                                       | `useId` for every id; the collapse and the width gate are effects; nothing is measured during render                                                    |
| Every state in the DOM                                 | `data-size`, `data-variant`, `data-overflow`, `data-full-width`, `data-expanded`, `data-narrow`, `data-complete`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`; per chip `data-value`, `data-invalid`, `data-disabled`, `data-current` |
| Part props are the native element's, extended          | the component's own props extend `ComponentPropsWithRef<'input'>`                                                                                       |

Form: one `<input type="hidden">` per value under the same `name`, with `form`
on each — a plain `FormData` receives several values under one key. The
visible input carries `required` only while the list is empty, and
`setCustomValidity` while the list holds an invalid value or exceeds `max`, so
a native submit is refused with the browser's bubble on the control.

## 9. Angular integration

| Question                                     | Answer                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form             | `model()` for `value` and `inputValue`; `output()` for `valueChange`, `inputValueChange` with the reason, and `valueRefuse`                    |
| Reactive Forms and template forms            | `ControlValueAccessor` and `Validator`: `required`, `tooMany` `{ max, actual }`, `invalidValues` `string[]`, `duplicate` when one arrived anyway |
| Defaults set once                            | `TAGS_INPUT_DEFAULTS` and `provideTagsInputDefaults()`                                                                                        |
| A template can reach the instance            | `exportAs: 'slTagsInput'`                                                                                                                     |
| Projected content, kept lazy                 | none needed: the chips are drawn from the value and their text from `formatLabel`; there is no slot a consumer fills                          |
| Zoneless and `OnPush`                        | signals throughout; no `markForCheck`                                                                                                         |
| Every subscription torn down                 | `DestroyRef` for the collapse handle, the width gate, the removal focus and the arrow navigation                                              |
| A static attribute the consumer wrote survives | `HostAttributeToken` for `id`, `aria-label`, `aria-describedby`, `type`, `pattern`                                                          |
| One class per entry point                    | `@slotted/angular/tags-input`                                                                                                                 |

The asymmetry is recorded rather than levelled: Angular gets a `Validator`
that puts `invalidValues` in a Reactive Form; React gets the platform's
`setCustomValidity` on the visible input and `render` on the frame.

## 10. Visual decisions

| Decision              | Value                                                      | Why                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frame                 | `text-field`'s arithmetic, `--slotted-control-*` read directly | The same control on the same form; `multi-select` states the same numbers                                                                                            |
| Minimum height        | `--slotted-control-height-<size>`                          | An empty control is exactly a text field beside it                                                                                                                       |
| Chip                  | `tag`'s `sm` step, `soft` variant, its block inset yielding to the frame's room | The chip never touches the frame: at `compact` and `dense` the inset shrinks to keep two pixels of air, the type stays 12px, and the remove target is `tag`'s halo |
| Invalid chip          | `tag`'s `danger` tone, the alert mark in `start`           | Colour, mark and a description: §2.5 refuses colour alone                                                                                                                |
| Row wrap              | three rows, then scrolls, no scrollbar                     | `multi-select`'s decision and its reasons                                                                                                                                 |
| `overflow="collapse"` | one row and `+N` at rest; every chip while focus is within | UI5's tokenizer. There is no popup to hold the hidden values, so the row is where they are shown — and it is shown exactly when the reader is about to act on them       |
| Expand motion         | none                                                       | The row's height changes as focus arrives; a transition would make the reader wait for the chip they are about to reach. The announcement and the ring carry the change  |
| Narrow width          | under 120 px there is no chip; the counter answers         | `createWidthGate`, `multi-select`'s reason                                                                                                                                |
| Duplicate flash       | `data-current` on the existing chip for one `--slotted-duration-long` | Long enough to be seen after focus lands; the chip's own outline variant already says "here"                                                                |
| Chip arrival, reorder | no transition                                              | Inherited from `multi-select`                                                                                                                                             |

## 11. Declined and deferred

| Item                                | Verdict                     | Reason                                                                                                          |
| ----------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A suggestion popup                  | defer to `multi-select`     | The listbox half is that family. `list` and a `<datalist>` pass through for the browser's own completion        |
| Pointer drag to reorder             | defer to `drag-and-drop`    | `packages/core` holds no drag infrastructure; the keyboard alternative is built first                            |
| Selecting several chips             | decline                     | UI5's selection exists to delete several tokens; here `Ctrl+X` per chip is the same number of presses            |
| A highlighted chip as a value       | decline                     | Focus on the cell is the pattern's own model; `onFocus` on the row reads it                                      |
| Sorting                             | decline                     | `onValueChange={(v) => setValue([...v].sort(collator.compare))}`                                                 |
| A minimum count                     | decline                     | `required` is the platform's "at least one"; more is `Validators.minLength` or a submit handler                  |
| Holding values past `max`           | decline                     | A control that keeps accepting past the number it shows is a counter that lies; the refused values are reported |

## 12. What a wrong answer at the visual gate costs

- **The invalid chip is held, in the danger tone with the mark.** It is the
  reason the family exists beside `multi-select`. Changing it to a refusal
  afterwards removes the `message` part, the `invalidValues` axis, the
  constraint verdict, `setCustomValidity` and the `Validator` error — most of
  what the bindings and their tests are.
- **The collapsed row expands while focused, with no popup.** It decides
  whether the family needs the overlay infrastructure at all. A popup added
  afterwards is `multi-select`'s second subtree, its portal and its positioner.
- **Chips inside the frame, three rows, then scroll.** Inherited and not
  re-decided; a different answer here would be a different answer for
  `multi-select` too.
