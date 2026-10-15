# Table filter operands design

Decisions taken from
`docs/history/designs/2026-09-14-table-filter-operands-capability-inventory.md`,
before the engine and the two bindings were touched. It extends
`docs/history/designs/2026-09-10-table-filter-design.md`; everything there
stands, and the sections below say where a sentence of it is superseded.

Nothing shipped changes shape. The descriptor, the predicate, the codec and the
summary keep their signatures, and every query a consumer wrote on 10 September
is read unchanged.

---

## 1. Two kinds in the engine, one vocabulary

`FilterKind` gains `time` and `datetime`. Both use the `date` operators — `is`,
`isNot`, `before`, `after`, `between`, `empty`, `notEmpty` — with `is` as the
default, because the sentence a reader composes is the same one: "starts at
09:00", "created before 14 September at 10:00".

```ts
type TimeFilter = FilterShape<'time', DateOperator, string>;
type DateTimeFilter = FilterShape<'datetime', DateOperator, string>;
type FilterDescriptor = TextFilter | NumberFilter | DateFilter | TimeFilter | DateTimeFilter | BooleanFilter | SetFilter;
```

`TimeOperator` and `DateTimeOperator` are exported as aliases of `DateOperator`
so a consumer can name the narrow type without learning that the three are one.

### 1.1 The operand is ISO text, at the precision the reader wrote

The `date` kind holds `YYYY-MM-DD` for three reasons §3.1 of the 10 September
design states: the descriptor stays JSON, two of them compare as strings, and
the serialised form is the stored form. The same three hold here, with one
addition: the text carries its own precision.

| Kind       | Accepted forms                                                                   | Canonical full form       |
| ---------- | -------------------------------------------------------------------------------- | ------------------------- |
| `time`     | `HH`, `HH:MM`, `HH:MM:SS`                                                        | `HH:MM:SS`                |
| `datetime` | `YYYY-MM-DD`, `YYYY-MM-DDTHH`, `YYYY-MM-DDTHH:MM`, `YYYY-MM-DDTHH:MM:SS`          | `YYYY-MM-DDTHH:MM:SS`     |

Each accepted form is a prefix of the canonical one cut at a field boundary,
which is what makes the comparison rule one line.

### 1.2 The comparison rule

A row value is reduced to its canonical full form. The comparison is then made
between the operand and the row value **cut to the operand's length**:

```
held.slice(0, operand.length) <op> operand
```

So `is 09:14` matches 09:14:00 through 09:14:59; `after 09:14` starts at
09:15:00; `between 2026-09-14 and 2026-09-14T12:00` runs from midnight to
12:00:59. It is the rule the `date` kind already applies to a timestamp — the
value is reduced to the operand's unit before every operator — extended to
every unit the text can name.

The field survey found the opposite in every implementation: MUI X zeroes the
seconds on both sides, so a second can never be filtered on; PrimeReact compares
a day for `is` and a millisecond for `before`. Here the reader decides the unit
by what they write, and a `time-picker` at `granularity="second"` writes seconds.

**Cost.** A consumer who writes an operand by hand and pads it to seconds gets a
second-precision comparison they may not have meant. The two components write
the granularity they are given, so the panel never produces it by accident.

### 1.3 A time `between` that crosses midnight

`between 22:00 and 02:00` matches 23:00 and 01:00. The number and date kinds
order the pair, because `100` then `10` has one sensible reading; `22:00` then
`02:00` has a different one — the overnight shift, the maintenance window — and
no surveyed implementation has a time kind to have answered it.

The rule: when the first operand is later than the second, the window wraps.
`describeFilter` writes the pair in the order given, so the summary and the
trigger's name say "between 22:00 and 02:00", which is what the reader typed.

**Cost.** A reader who inverted the pair by mistake gets the complement of what
they meant rather than a silent reorder. The summary in the trigger's name is
where they see it. The `datetime` kind does not wrap: a date-time pair has an
order.

### 1.4 The row value

| Kind       | The row value is read as                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `time`     | ISO time text, padded to seconds; the time half of ISO date-time text; a `{ hour, minute, second }`; the time half of a `{ date, time }`; a `Date` or epoch number, as wall-clock in `timeZone` |
| `datetime` | ISO date-time text, padded to seconds; ISO day text, at midnight; a `{ date, time }`; a `{ year, month, day }`, at midnight; a `Date` or epoch number, as wall-clock in `timeZone` |

The shapes are duck-typed, the way `PlainDateLike` already is in
`predicate.ts`: the engine keeps its one import (`../collection`) and pulls no
date arithmetic. A `Date` is read through `Intl.DateTimeFormat` with
`hourCycle: 'h23'`, which is the only way to get `00` rather than `24` at
midnight.

### 1.5 The codec and the summary

`readOperand` in `serialize.ts` validates the two grammars of §1.1 and returns
`null` for anything else, so `parseFilter` stays total. `encodeURIComponent`
writes the colon as `%3A`, and `URLSearchParams` reads it back.

`describeFilter` needs nothing: the kind reaches `format.value`, and the family
formats the ISO text through its own `Intl.DateTimeFormat` there.

## 2. Two components per binding

`TableTimeFilter` and `TableDateTimeFilter`; `slTableTimeFilter` and
`slTableDateTimeFilter`. Both run in the shell unchanged, the way §8 of the
10 September design says every kind does.

| Component             | Operand           | Props it carries to the picker                                      | Writes                                              |
| --------------------- | ----------------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| `TableTimeFilter`     | `time-picker`     | `locale`, `hourCycle`, `granularity`, `step`, `options`, `min`, `max` | `toISOTime(value, granularity)`                     |
| `TableDateTimeFilter` | `datetime-picker` | `locale`, `hourCycle`, `granularity`, `step`, `min`, `max`, `timeZone` | `toISODate(date) + 'T' + toISOTime(time, granularity)` |

`min` and `max` are ISO text, as they are on `TableDateFilter`, and are parsed
on the way to the picker. `granularity` defaults to the picker's own default
(`minute`), and is what decides the precision §1.2 compares at.

`between` on both draws two pickers, as the `date` kind did until today.
`time-range-picker` and `datetime-range-picker` are wave 8 and not built; when
each lands, it replaces its pair here in a pass of `/component table`, and
`docs/process/build-order.md` records that pending item on the family that supplies it.

## 3. `between` on a date is one `date-range-picker`

Supersedes the sentence in §5.2 of the 10 September design that draws two
`date-picker`s for the range.

The control is `date-range-picker` with `startLabel` and `endLabel` set from
`filterFrom` and `filterTo`, so the accessible names are the ones the two
pickers had. Its `onValueChange` hands back `{ start, end }`; the shell gains
`setOperands(value, end)` beside `setOperand(slot, value)`, because two calls to
the latter from one event would each read the draft the other did not write.

The descriptor is unchanged: `{ operator: 'between', value: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }`.
The picker accepts the run in either order and reports it ordered, so the
predicate's own ordering never has work to do for a range drawn here.

`filter-operand` carries `data-range` while one control holds both operands.
The operand grid is `repeat(auto-fit, minmax(7rem, 1fr))`, which would put a
single child in the first of two columns; `data-range` collapses it to one.

`TableDateFilter` gains `presets`: React takes a `ReactNode` of
`DateRangePickerPreset`s and Angular a `TemplateRef`, rendered inside the
picker's own `presets` slot while the operator is `between`. It is Excel's
"This Week" and "This Month" as the application's own list, and the descriptor
still receives two ISO days.

A consumer's `renderOperand` is unchanged: called once per operand slot, it
replaces the range picker as it replaced the pair.

## 4. The set operand as chips

`TableSetFilter` gains `operand: 'list' | 'tags'`, default `list`, and
`options` becomes optional with `[]` as its default.

| `operand` | Draws                                                              | `options`                                   |
| --------- | ------------------------------------------------------------------ | ------------------------------------------- |
| `list`    | the search, the covering checkbox and the values — shipped, unchanged | the list; empty shows `filterEmpty`         |
| `tags`    | `tags-input` holding the chosen values as chips                    | a `datalist` of suggestions, and the set a typed value must belong to; empty admits any value |

With `options`, a typed value outside them is refused by `tags-input`'s own
`validate` and announced by that family; `formatLabel` shows the option's label
on the chip while the descriptor holds the value. Without `options`, any value
is admitted, because a list too long to tick is often a list the page does not
hold — an identifier, an SKU, an e-mail.

The suggestions are the platform's: `tags-input` renders the consumer's own
`<input>`, and a `list` attribute pointing at a `<datalist>` of the options
gives native completion in every engine without a second listbox in the panel.
When no `options` are given there is no `datalist`.

`filter-operand` carries `data-operand="tags"` for the stylesheet, which lets
the input take the panel's width and wrap its chips.

The operator stays `anyOf` / `noneOf` and the value stays `readonly string[]`:
a saved view written by the list is read by the chips and back. That is the
difference from MUI X, whose `isAnyOf` is a separate operator from `is`.

## 5. The contract

- `filter.kinds` gains `time` and `datetime`, in that order after `date`.
- `filter.kinds.date.operand` says one `date-range-picker` for `between`.
- `filter.kinds.set.operand` says the two operands and `options` optional.
- `filter.attributes` names `data-range` and `data-operand` on `filter-operand`.
- `filter.precision` and `filter.wrap` state §1.2 and §1.3, because both bind
  `filter-bar` and `data-grid`.
- `scenarios.table` gains `filter-time`, `filter-datetime`, `filter-range` and
  `filter-tags`, one demonstration each on both reference pages.
- `filter.composition` names the four families added.

No state model changes: the filter's value is the same mutable value with the
same request.

## 6. React

Only the lines the delta touches; the rest of the table in §11 of the
10 September design stands.

| Question                                                        | Answer                                                                                                                                                                                  |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair with a reason                  | unchanged — the two new components are two more callers of the shell                                                                                                                    |
| Defaults set once                                               | the operator names already sit in `TableDefaultsProvider`; the pickers' and `tags-input`'s own words come from their own providers, which is where an application already translates them |
| Substitute the rendered element                                 | `renderOperand` unchanged, and it still replaces the whole operand — the range picker and the chips included                                                                             |
| The consumer's handler still runs                               | `Enter` in a picker or in the chips input runs the family's own key handling first and applies only when the event was not defaulted, as the text field does                            |
| Reach the native element                                        | unchanged                                                                                                                                                                              |
| Server render                                                   | `useId` for the `datalist`; no layout read                                                                                                                                             |
| Every state in the DOM                                          | `data-range` and `data-operand` on `filter-operand`, beside `data-kind`                                                                                                                 |
| Native props type                                               | unchanged                                                                                                                                                                              |

## 7. Angular

| Question                                                        | Answer                                                                                                                                                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in signal form                                    | `value = model<TimeFilter \| null>(null)` and `model<DateTimeFilter \| null>(null)` on the two new components                                                                               |
| Reactive Forms                                                  | no — unchanged: a column filter is a query, and the pickers and `tags-input` it draws are each a `ControlValueAccessor` where a consumer wants one                                            |
| Defaults set once                                               | `provideTableDefaults` unchanged; `provideTimePickerDefaults`, `provideDateTimePickerDefaults`, `provideDateRangePickerDefaults` and `provideTagsInputDefaults` reach the operands |
| Template reaches the instance                                   | `exportAs: 'slTableTimeFilter'` and `'slTableDateTimeFilter'`                                                                                                                                |
| Projected content, kept lazy                                    | `presets` is a `TemplateRef` rendered by `NgTemplateOutlet` inside the picker while the operator is `between`, so it is never built for a closed panel                                        |
| Zoneless and `OnPush`                                           | signals throughout, as the shell already is                                                                                                                                                 |
| Every listener torn down                                        | the pickers and `tags-input` own theirs                                                                                                                                                     |
| Static attribute survives                                       | unchanged                                                                                                                                                                                  |
| Single class per entry point                                    | the two new components ship from `@slotted/angular/table`; the operands are imported through `@slotted/angular/time-picker`, `/datetime-picker`, `/date-range-picker` and `/tags-input`       |

## 8. What a wrong answer costs

For the visual gate.

| If this is wrong                                    | Now                                       | After step 13                                                                       |
| --------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| Precision follows the operand                       | one function in the predicate and its tests | the two components' `granularity` handling, the docs of both pages, `filter-bar`'s chips |
| A time range wraps at midnight                      | one branch in the predicate               | the summary text, the tests and the scene that shows it                              |
| One range picker rather than two                    | one body in `TableDateFilter`             | `setOperands` in both shells, `data-range` in the stylesheet, two scenes             |
| Chips as a second operand rather than a second kind | one prop on `TableSetFilter`              | the descriptor a saved view holds, and every consumer that reads it                  |
| `HH` and `YYYY-MM-DDTHH` as accepted forms          | two regular expressions                   | every bookmark that carries an hour-precision operand                               |
