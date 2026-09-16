# Table range operands design

The second reopening of `table`, wave 10. Two decisions: the `between` operand
of the `time` and `datetime` kinds is one range picker, and a cell holding a
`plain` control gives its inset to the control. The inventory is
`docs/superpowers/specs/2026-09-16-table-range-operands-capability-inventory.md`;
the 14 September design stands for everything this document does not name.

---

## 1. `between` on a time is one `time-range-picker`; on a date-time, one `datetime-range-picker`

Supersedes the two-picker bodies of `TableTimeFilter` and `TableDateTimeFilter`
in §2 of the 14 September design, and follows its §3 line for line.

The control is `time-range-picker` or `datetime-range-picker` with `startLabel`
and `endLabel` set from `filterFrom` and `filterTo`, `size="sm"`, and the
column's `locale`, `hourCycle`, `granularity`, `step`, `options`, `timeZone`,
`min` and `max` passed through where each picker takes them. Its
`onValueChange` hands back `{ start, end }` and the body writes both operands
through `setOperands`. `filter-operand` carries `data-range` while the operator
takes two operands, and the operand grid collapses to one column.

The descriptor is unchanged: `{ operator: 'between', value: 'HH:MM', end: 'HH:MM' }`
and `{ operator: 'between', value: 'YYYY-MM-DDTHH:MM', end: '…' }`, at the
column's granularity.

`TableTimeFilter` and `TableDateTimeFilter` gain `presets`, the way
`TableDateFilter` has it: a `ReactNode` of the picker's `Preset` part in React,
a `TemplateRef` in Angular, rendered inside the picker's `presets` slot while
the operator is `between`.

`applyOnEnter` is not attached to a range picker. Its frame is a button whose
`Enter` opens the surface; the single pickers keep it, because their frame is a
field. `Enter` inside the picker's surface belongs to the picker.

A consumer's `renderOperand` is unchanged.

### The overnight window

The engine reads a time `between` whose start is later than its end as the
window that crosses midnight (contract `filter.wrap`). `time-range-picker`
names the same pair `order` invalid, because a `PlainTime` has no day (its
design §6). The pair still reaches the descriptor unchanged, so the filter the
reader applies is the overnight window; the end field is marked invalid while
it is typed.

Decided: the contradiction is resolved on the picker's side, not the engine's.
`time-range-picker` takes a `wrap` capability — an overnight run is not
`order`, its length is counted through midnight, and the end list does not
strike the times before the start — in a reopening recorded in
`docs/build-order.md`, and this filter passes `wrap` when it lands. Dropping
the engine's rule instead would change `filter-bar` and `data-grid`, which
evaluate the same descriptor, and would make `22:00 – 02:00` an empty set on a
column of shift starts. The picker's files belong to the wave 9 session while
it runs, so the capability is not written here.

## 2. A cell with a `plain` control gives its inset to the control

The rule the header already applies to `sort`, extended to a body cell:

```css
[data-ui='table'] :is([data-part='cell'], [data-part='row-header']):has(
    > [data-part='root'][data-variant='plain']:is(<fourteen families>)
  ) {
  --slotted-control-padding-inline-sm: var(--_pad-inline);
  --slotted-control-padding-inline-md: var(--_pad-inline);
  --slotted-control-padding-inline-lg: var(--_pad-inline);
  --slotted-control-height-sm: var(--_row-min-block);
  --slotted-control-height-md: var(--_row-min-block);
  --slotted-control-height-lg: var(--_row-min-block);
  padding: 0;
}
```

The fourteen families are the ones `plain-variant.test.mjs` holds, named by
`data-ui`: a `kbd`, a `listbox`, a `timeline` or a nested table with a `plain`
variant of its own is not a control and keeps the cell's inset.
`table.styles.test.mjs` holds the list against the shared test.

`--_pad-inline` and `--_row-min-block` resolve on the table root and are
inherited resolved, so the cell's redefinition of the tokens they read does not
feed back into them.

The block inset moves into the control's height. Read with the block padding
kept, a `sm` control stood in a comfortable row ten pixels taller than the rows
around it, which is the reflow the `plain` variant exists to avoid; with the
control at the row's minimum block size, a row with a control in it is as tall
as a row without one, at every density and whatever size step the consumer
wrote. The control's width is the control's own, as it is in a form; the cell's
`text-align` reaches the control through inheritance where the control's own
stylesheet lets it — `text-field` sets `text-align: inherit` on its input and
`number-field` does not, so a `plain` number field in a numeric cell aligns its
digits to the start. That is `number-field`'s file, recorded as a reopening in
`docs/build-order.md`.

## 3. The contract

- `filter.kinds.time.operand` and `filter.kinds.datetime.operand` name the two
  range pickers for `between`.
- `filter.composition` names `time-range-picker` and `datetime-range-picker`.
- `cellControl` states the inset rule and names the test that holds the family
  list.
- Scenario `editing` joins the list: three rows of `plain` controls in body
  cells.
- `scenarios.table` keeps `filter-time` and `filter-datetime`; their `between`
  now draws the range picker.

## 4. React

| Question                                       | Answer                                                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair with a reason | unchanged                                                                                                                                                                    |
| Defaults set once                              | the pickers' own words come from `TimeRangePickerDefaultsProvider` and `DateTimeRangePickerDefaultsProvider`                                                                 |
| Substitute the rendered element                | `renderOperand` unchanged                                                                                                                                                    |
| The consumer's handler still runs              | the range picker takes no `onKeyDown` from the filter; `Enter` on its trigger opens it                                                                                        |
| Reach the native element                       | unchanged                                                                                                                                                                    |
| Server render                                  | unchanged                                                                                                                                                                    |
| Every state in the DOM                         | `data-range` on `filter-operand` for `time` and `datetime` as for `date`                                                                                                     |
| Native props type                              | unchanged                                                                                                                                                                    |

## 5. Angular

| Question                          | Answer                                                                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in signal form      | unchanged                                                                                                                                 |
| Reactive Forms                    | no — unchanged                                                                                                                            |
| Defaults set once                 | `provideTimeRangePickerDefaults` and `provideDateTimeRangePickerDefaults` reach the operands                                              |
| Template reaches the instance     | unchanged                                                                                                                                 |
| Projected content, kept lazy      | `presets` is a `TemplateRef` rendered by `NgTemplateOutlet` inside the picker's `Presets` part while the operator is `between`            |
| Zoneless and `OnPush`             | unchanged                                                                                                                                 |
| Every listener torn down          | the pickers own theirs                                                                                                                    |
| Static attribute survives         | unchanged                                                                                                                                 |
| Single class per entry point      | the operands are imported through `@slotted/angular/time-range-picker` and `@slotted/angular/datetime-range-picker`                       |

## 6. What a wrong answer costs

| If this is wrong                                       | Now                                                     | After step 13                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| One range picker rather than two, on `time`            | one body in `TableTimeFilter`                           | the two bindings, two scenes, the docs notes, the pending `wrap` on `time-range-picker`    |
| One range picker rather than two, on `datetime`        | one body in `TableDateTimeFilter`                       | the two bindings, two scenes                                                               |
| The overnight window resolved on the picker's side     | one line in `docs/build-order.md`                       | a `wrap` capability on `time-range-picker` nobody reads, or an engine rule three families lose |
| The inset rule on the cell, by a list of families      | one selector and one test                               | every editable-table demonstration in `text-field`, `select` and `number-field`            |
| The control at the row's height, never the row at the control's | the same selector                              | the row height of every table with an editable column                                      |
