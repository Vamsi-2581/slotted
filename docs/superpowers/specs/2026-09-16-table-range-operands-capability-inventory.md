# Table range operands capability inventory

The subject is the second reopening of `table`: the `between` operand of the
`time` and `datetime` kinds, drawn as one `time-range-picker` or one
`datetime-range-picker` where two pickers stood, and the cell rule pending since
wave 7 — a cell holding a `plain` control gives its inset to the control.
`docs/superpowers/specs/2026-09-14-table-filter-operands-capability-inventory.md`
inventoried the operands; row "`between` drawn as two inputs" of its §2 and row
"One range control for `between`" of its §3 are the two lines this pass closes.
Nothing else there is reopened. The descriptor, the predicate, the codec and the
summary are unchanged.

Produced from the field before the shipped implementation was reread.

---

## 1. Surveyed

The seven implementations of the 14 September inventory, reread for the two
questions of this pass: what a `between` on a time or a date-time is drawn as,
and what an editable cell does with the control's inset.

| Implementation             | `between` on a time or date-time                                                                                        | A control inside a cell                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AG Grid                    | `inRange`: two date inputs, stacked; a time is not a filter type                                                        | Cell editors fill the cell: `.ag-cell-inline-editing` sets the cell's padding to 0 and the editor's input takes the cell's own left padding                     |
| MUI X Data Grid            | No `between` on `dateTime`; a custom multiple-values operator draws two inputs                                          | `GridEditInputCell` is unpadded inside a cell whose padding is removed while editing, so the value stays where the rendered value stood                          |
| DevExtreme DataGrid        | Filter row `between` opens two editors side by side                                                                     | Editing cell removes its padding; the editor is padded by the same `--dx-cell-padding`                                                                         |
| KendoReact Grid            | No `datetime` and no `time` filter type                                                                                 | `k-grid-edit-cell` sets padding 0 and the inner input carries the padding                                                                                       |
| Ant Design Table v6.6      | A range is a custom `filterDropdown` holding `RangePicker` with `showTime`; one control, two ends                       | Editable rows through `Form.Item` inside the cell; the cell keeps its padding and the input adds its own, which is the doubled inset Ant's own editable example shows |
| PrimeReact                 | No range match mode                                                                                                     | `p-cell-editing` sets padding 0 and the editor input takes the cell inset                                                                                       |
| Microsoft Excel AutoFilter | Custom AutoFilter "is between": two inputs                                                                              | A cell is its editor; there is no second inset                                                                                                                  |

Two answers the sources give:

- **A range is drawn as one control where the library has one.** Ant is the
  one implementation with a range control that takes a time, and its recipe
  puts that one control in the filter. The rest stack two inputs because they
  have no range picker, not because two inputs are the better shape.
- **An editing cell gives its inset to its editor.** Five of the seven remove
  the cell's padding while a control is in it and hand the same inset to the
  control, so the edited value stands where the read value stood. Ant keeps
  both and its own example shows the value shifted in by one inset.

## 2. Table stakes

| Capability                                                     | Who ships it                                     | Verdict | Reason                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `between` on a date-time as one control holding both ends      | Ant (`RangePicker` with `showTime`)              | adopt   | `datetime-range-picker`, the family wave 9 built for it, with `startLabel` and `endLabel` from `filterFrom` and `filterTo`. The descriptor stays `{ operator: 'between', value, end }`.                                                                                       |
| `between` on a time as one control                             | Ant (`TimePicker.RangePicker`)                   | adopt   | `time-range-picker`, the same way. §4 for the overnight window.                                                                                                                                                                                                              |
| Presets inside the range control                               | Ant (`presets` on `RangePicker`), Excel (relative items) | adopt   | `presets` on `TableTimeFilter` and `TableDateTimeFilter`, the way `TableDateFilter` already takes them: a `ReactNode` of the picker's `Preset` part in React, a `TemplateRef` in Angular, rendered while the operator is `between`.                                              |
| The cell's inset given to the control while a control is in it | AG Grid, MUI X, DevExtreme, Kendo, PrimeReact    | adopt   | `padding: 0` on a cell whose direct child is a `plain` control root; `--slotted-control-padding-inline-{sm,md,lg}` set to the cell's `--_pad-inline` and `--slotted-control-height-{sm,md,lg}` to the row's minimum block size on the same cell, which the control reads as its own inset and height. The edited value stands where the read value stood and the row keeps its height. The rule the header already applies to `sort`. |
| An editing state declared on the cell                          | AG Grid, MUI X, DevExtreme, Kendo, PrimeReact    | decline | Those five switch a renderer for an editor; this family renders what the consumer puts in the cell, so the `plain` control root in the cell is the state. `data-grid` owns cell and row edit modes (`docs/build-order.md`, wave 9).                                             |

## 3. Differentiators

| What                                                          | Against the field                                                                                                                                                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The run's length said while it is drawn                       | `time-range-picker` and `datetime-range-picker` write "8 hr" and "3 days 21 hr" in the band as the two ends are chosen; no surveyed filter says how long the window is.                                                                   |
| The end list bounded by the start                             | The end list of the picker refuses the times before the start; two independent pickers offered every time twice.                                                                                                                         |
| The inset rule written once for fourteen families             | One selector on the cell, naming the fourteen `plain` families `plain-variant.test.mjs` holds, rather than an editing class per editor as the five grids do. A `kbd` or a `listbox` with a `plain` variant of its own in a cell is untouched. |

## 4. Gaps

| Gap                                                                           | What this family does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A time `between` whose start is later than its end                            | The engine reads it as the window that crosses midnight (contract `filter.wrap`); `time-range-picker` names the pair `order` invalid (`timeRangeProblems`, its design §6), because a `PlainTime` has no day. The pair still reaches the descriptor — the picker rewrites nothing the reader typed — and the predicate still keeps 23:30 and 01:15. What the reader sees is an end field marked invalid on a window the filter accepts. Resolved outside this family: `time-range-picker` takes a `wrap` capability in a reopening recorded in `docs/build-order.md`, and this filter passes it. Until then the story and the docs note say so. |
| Enter on the picker's trigger                                                 | Opens the picker; it does not apply the filter. `applyOnEnter` stays on the single pickers, whose frame is a field, and is not attached to a range picker, whose frame is a button. Enter inside the picker's own surface is the picker's key.                                                                                                                                                                                                                                                                                                       |
| The picker's surface inside the panel's layer                                 | A third layer over the popover's, the way `date-picker`'s calendar and `date-range-picker`'s surface already stack, through `dismissable-layer`.                                                                                                                                                                                                                                                                                                                                                                                                  |
| A `between` on a date-time whose reader picks the end first                   | `datetime-range-picker` orders the dates and keeps each time on its end (its design §12); the descriptor receives `value` ≤ `end`.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| A `plain` control in a numeric cell                                           | The cell's `text-align: end` reaches the control's input through inheritance where the control's own stylesheet lets it: `text-field` sets `text-align: inherit` on its input and aligns; `number-field` does not, and its digits stand at the start of a numeric cell. Nothing here overrides a control's text alignment; `number-field` takes `text-align: inherit` in a reopening recorded in `docs/build-order.md`.                                                                                                                             |
| A nested `plain` table, list or key in a cell                                 | Not a control; the selector names the fourteen field families and nothing else, and `table.styles.test.mjs` holds the list against `plain-variant.test.mjs`.                                                                                                                                                                                                                                                                                                                                                                                       |
| A consumer's own `renderOperand`                                              | Unchanged: called once per operand slot, it replaces the range picker as it replaced the pair.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## 5. What shipped, and the delta

| Capability                                       | Shipped               | The field                     | This pass                                                                       |
| ------------------------------------------------ | --------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| `between` on a time                              | two `time-picker`s    | two inputs, or Ant's one     | one `time-range-picker`, with `presets`                                          |
| `between` on a date-time                         | two `datetime-picker`s | two inputs, or Ant's one    | one `datetime-range-picker`, with `presets`                                      |
| Cell inset with a `plain` control in it          | doubled               | given to the control ×5       | given to the control                                                             |
| Overnight time window                            | typed in two pickers  | none                          | typed in the range picker, marked `order` invalid by it until `wrap` lands       |
| Descriptor, predicate, codec, summary            | yes                   | —                             | unchanged                                                                        |
