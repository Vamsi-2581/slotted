# Table filter design

Decisions taken from
`docs/superpowers/specs/2026-09-10-table-filter-capability-inventory.md`, before
the engine and the two bindings were written. It replaces the `filter` paragraphs
of `docs/superpowers/specs/2026-09-09-table-design.md` §3.1 and §5; everything
else in that document stands.

The subject is one layer down from a family. `data-grid` (wave 8) uses the engine
unchanged and `filter-bar` (wave 8) composes over it, so the vocabulary decided
here is the library's rather than this family's.

---

## 1. Three layers, and where the line between them falls

| Layer                              | Holds                                                                                                  | Where                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| The engine                         | the operator vocabulary, the descriptor, the predicate, the codec and the readable summary             | `packages/core/src/filter`          |
| The panel                          | the draft, the controls that edit it, the announcements and the two actions                            | `table`, both bindings              |
| The query                          | applying the descriptor to rows, on a client or a server                                               | the consumer                        |

The third line is the one this family already draws for `sort`: the rows are the
consumer's own children, and a family that reordered or removed them would own
the data. What changes here is that the consumer no longer has to write the
comparison — the engine exports the predicate, and applying it is one call.

## 2. The engine lives at `@slotted/core/filter`, and is not in the barrel

Two reasons, and each alone would decide it.

`@slotted/core/collection` already exports `createFilter`, `Filter` and
`FilterOptions` — a locale-sensitive **string matcher** that `combobox` filters
its options with. `packages/core/src/index.ts` re-exports every module it holds
with `export * from`, so a second module exporting a type called `Filter` is a
duplicate export and the build says so. The subpath keeps the two apart, and the
new module's names are chosen not to collide even where both are imported:
`createFilterPredicate`, never `createFilter`.

And a family that imports a button should not pull a filter engine. `currency`
and `date` are outside the barrel for that reason (PRD §23.1) and this module
joins them, as an entry in `packages/core/vite.config.ts` and an export in
`packages/core/package.json`.

The pre-existing name is not renamed. `collection`'s `createFilter` is imported
by `combobox`, `select` and `multi-select`, none of which is this session's to
edit, and the briefing's rule for a shared worktree is explicit about it.

## 3. The descriptor

One shape for five kinds, so a reader of `data-grid`'s query state or of a
serialised URL learns it once.

```ts
type FilterJoin = 'and' | 'or';

interface FilterCondition<Operator extends string, Value> {
  readonly operator: Operator;
  /** The first operand, or null where the operator takes none. */
  readonly value?: Value | null;
  /** The second operand, which only `between` has. */
  readonly end?: Value | null;
}

interface FilterShape<Kind extends FilterKind, Operator extends string, Value> {
  readonly kind: Kind;
  readonly join: FilterJoin;
  readonly conditions: readonly FilterCondition<Operator, Value>[];
}

type TextFilter = FilterShape<'text', TextOperator, string>;
type NumberFilter = FilterShape<'number', NumberOperator, number>;
type DateFilter = FilterShape<'date', DateOperator, string>;
type BooleanFilter = FilterShape<'boolean', BooleanOperator, boolean>;
type SetFilter = FilterShape<'set', SetOperator, readonly string[]>;

type FilterDescriptor = TextFilter | NumberFilter | DateFilter | BooleanFilter | SetFilter;
```

It is AG Grid's `ICombinedSimpleModel` with the column taken out and the operand
count made explicit: `{ filterType, operator: 'AND' | 'OR', conditions: [...] }`
becomes `{ kind, join, conditions: [...] }`. The column is not in it because the
descriptor is the value of one filter, and which column that is, is the record
key the consumer already holds — the same reason MUI X's `GridFilterItem` needs a
`field` and this does not.

Every field is JSON, and that is a requirement rather than a happy result:
§12 asks for one serialisable query model shared by client and server. No class,
no `Date`, no function.

### 3.1 A date operand is an ISO day, not a `Date`

`YYYY-MM-DD`, which is what `toISODate` in `@slotted/core/date` produces from the
`PlainDate` a `date-picker` holds.

Three things follow, and each is why: the descriptor stays JSON; two ISO days
compare correctly as strings, so the predicate needs no date arithmetic and the
module needs no import from `date`; and the query string carries the operand
unchanged, because the serialised form and the stored form are the same text.

The cost is at the edges. A consumer holding a `Date` converts on the way in, and
the predicate converts on the way out — a **row value** may be a `Date`, an ISO
string or a `PlainDate`, and it is reduced to its day before comparing. Which day
a `Date` falls on depends on a time zone, so `timeZone` is an option on the
predicate and defaults to the runtime's.

### 3.2 A set condition holds a list, and there is only ever one of them

`SetFilter`'s `Value` is `readonly string[]`: the chosen values are one operand,
not many conditions.

The join control is not drawn for a set, and the panel allows one condition. Two
set conditions say nothing new — `anyOf A and anyOf B` is `anyOf (A ∩ B)` and
`anyOf A or anyOf B` is `anyOf (A ∪ B)`, so every pair collapses to a single
list. AG Grid's Set Filter has no conditions either, for the same reason.

### 3.3 An inactive condition is dropped, and an empty filter matches everything

One rule, stated once and tested in the engine:

1. a condition is **active** when it has every operand its operator needs —
   `operandCount(operator)` is 0, 1 or 2, and `between` is the only 2;
2. an inactive condition is removed before the join, under `and` and `or` alike;
3. a filter with no active condition matches every value.

AG Grid drops an incomplete condition silently and MUI X's answer depends on the
operator. The third clause is the one that has to be written down: under `or`, a
condition that "matches everything" would otherwise make the whole filter match
everything, so an inactive condition is not an always-true condition — it is not
a condition at all.

A set condition is active when its list is non-empty, which is the same rule: an
empty list is a missing operand.

## 4. The operators

Taken from the four surveyed implementations that ship typed conditions, named
once here, and cited in the inventory.

| Kind      | Operators                                                                                                       | Default      | Operands                                       |
| --------- | ---------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------- |
| `text`    | `contains`, `notContains`, `equals`, `notEquals`, `startsWith`, `endsWith`, `empty`, `notEmpty`                  | `contains`   | 1, except `empty` and `notEmpty`               |
| `number`  | `equals`, `notEquals`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `between`, `empty`, `notEmpty` | `equals`     | 1; `between` 2; `empty` and `notEmpty` 0       |
| `date`    | `is`, `isNot`, `before`, `after`, `between`, `empty`, `notEmpty`                                                 | `is`         | 1; `between` 2; `empty` and `notEmpty` 0       |
| `boolean` | `is`, `empty`, `notEmpty`                                                                                        | `is`         | 1; `empty` and `notEmpty` 0                    |
| `set`     | `anyOf`, `noneOf`                                                                                                | `anyOf`      | 1, and it is a list                            |

`contains` is AG Grid's default for text and `equals` its default for number;
both are kept rather than re-decided.

Date and boolean say `is` rather than `equals` because that is the sentence the
reader is composing — "date is 10 September", "paid is true" — and because
`equals` beside a string operator of the same name would read as the same
comparison, which it is not: an ISO day is compared as a day and a string is
compared through a collator.

A consumer narrows the list with `operators`, which is AG Grid's `filterOptions`,
and picks the starting one with `defaultOperator`.

## 5. The panel

One shape for all five kinds. The set filter keeps everything it shipped and
gains the operator chooser above it.

```
┌ filter-panel ────────────────────────────┐
│ ┌ filter-condition ────────────────────┐ │
│ │ [ filter-operator      ▾ ]           │ │
│ │ ┌ filter-operand ──────────────────┐ │ │
│ │ │ text-field | number-field |      │ │ │
│ │ │ date-picker | radio-group |      │ │ │
│ │ │ filter-search + filter-list      │ │ │
│ │ └──────────────────────────────────┘ │ │
│ └──────────────────────────────────────┘ │
│ ( filter-join: ○ E  ○ OU )               │
│ ┌ filter-condition ────────────────────┐ │
│ │ …the second, once the first is active│ │
│ └──────────────────────────────────────┘ │
│ ┌ filter-actions ──────────────────────┐ │
│ │ Limpar                       Aplicar │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 5.1 Four new parts

| Part               | Element | What it is                                                                       |
| ------------------ | ------- | -------------------------------------------------------------------------------- |
| `filter-condition` | `div`   | One condition: its operator chooser and its operands                             |
| `filter-operator`  | `div`   | The chooser, which is the `select` family                                        |
| `filter-operand`   | `div`   | The input area, whose contents the kind decides and the consumer can replace     |
| `filter-join`      | `div`   | The `radio-group` between the two conditions                                     |

`filter-search`, `filter-list`, `filter-option` and `filter-empty` keep their
meaning and move inside `filter-operand` for the set kind, which is the only kind
that draws them.

The chooser is the `select` family rather than a control of this family's own:
`list-item` recorded the rule and the selection column follows it — a chooser
here would be a second answer to the question `select` owns. It opens a layer of
its own inside the panel's layer, which `dismissable-layer` already stacks; the
gate exercises `Escape` inside the open chooser, where the top layer is the one
that closes.

### 5.2 The second condition appears when the first is active

Not a button, and not two rows from the start.

AG Grid reveals the second condition once the first has a value, and it is the
behaviour that costs the reader least: an "add condition" button is one more word
to translate and one more press before the common case, and a second row drawn
empty is noise in every panel that never needs it. The cost is that the panel
grows under the reader, which is why the reveal is announced — see §7.

`conditions={1}` suppresses the reveal entirely, which is AG Grid's
`maxNumConditions: 1`, and the set kind is fixed at 1 by §3.2.

The date operand is the whole `date-picker` rather than the `date-field` alone.
AG Grid, MUI X and PrimeReact each open a grid to point at, and a reader made to
type a date they could have pointed at is the one thing a date filter exists to
spare them. It costs a third layer — the calendar inside the panel inside the
page — which `dismissable-layer` already stacks for the operator chooser beside
it, and which the gate exercises.

### 5.3 The operand area is replaceable

`filterDropdown` in Ant, a custom filter component in AG Grid and a custom
operator in MUI X all exist because a column's values sometimes need a control
the library does not have — a currency, a duration, a tag picker. Here the whole
panel is not replaced; only `filter-operand` is, through a `render` prop in React
and a projected `ng-template` in Angular, and it receives the condition, the
operand index and the setter. Everything else — the draft, the operator chooser,
the join, the actions, the announcements — is kept.

### 5.4 The draft is unchanged

The panel edits a draft, Apply commits it, Clear empties it, and Escape or an
outside press restores what the panel opened with. Nothing about that changes;
what changes is that the draft is now a descriptor instead of an array.

`Enter` in an operand applies and closes, which is what AG Grid does and what a
reader who has just typed a value expects. It is the family's one new key.

## 6. Matching

`createFilterPredicate(filter, options)` returns `(value: unknown) => boolean`,
and builds whatever it needs — one collator, one date formatter — once. The
convenience `matchesFilter(filter, value, options)` delegates to it, and is for a
single comparison rather than for ten thousand rows.

| Kind      | The row value is read as                                                                      |
| --------- | ----------------------------------------------------------------------------------------------- |
| `text`    | `String(value)`; `null`, `undefined` and a blank string are blank                              |
| `number`  | a `number`, or `Number(value)` when it converts; `NaN` is blank                                |
| `date`    | an ISO day, taken from a `Date`, an ISO string or a `PlainDate`, in the stated time zone       |
| `boolean` | a `boolean`; anything else is blank                                                            |
| `set`     | `String(value)`, or every element of an array value                                            |

Two of these are the gaps §4 of the inventory names. An array row value matching
element-wise is what a column of tags needs and what AG Grid asks for a
`keyCreator` to get. And `between` orders its pair before comparing, so a reader
who typed 100 then 10 gets the rows between 10 and 100 rather than the silence AG
Grid returns.

Text comparison is the collator from `@slotted/core/collection`, at
`usage: 'search'` and `sensitivity: 'base'` by default: `contains`, `startsWith`
and `equals` are its three methods, and `notContains`, `notEquals` and `endsWith`
are derived from them. It replaces the `normalize('NFD')` fold the shipped panel
searched with, which is an English answer wearing a Unicode one — it leaves `ß`
alone and does nothing for `ø`.

`createRowPredicate(filters, read, options)` composes one predicate per column
and joins them with `and`, which is what makes the acceptance case one line:

```tsx
const keep = createRowPredicate(filters, (row, column) => row[column]);
const shown = useMemo(() => rows.filter(keep), [rows, keep]);
```

## 7. What is said out loud

Through `@slotted/core/live-announcer`, politely, and each one exists because a
reader who cannot see the panel would otherwise get nothing.

| When                                       | What                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| the search narrows the set list            | the number of values left — shipped, kept                                |
| the operator changes the number of operands | the operator's name and the fields it now takes                          |
| the second condition appears               | that there is a second condition                                         |
| Apply commits                              | the column and the readable summary of what was applied                  |
| Clear empties                              | the column and that the filter was removed — shipped, kept               |

The summary is `describeFilter(filter, format)` in the engine, which composes the
operator names and operands the family passes it into one sentence: "contains ana
or starts with b". §12 asks for a readable text expression of a filter, and
writing it in the engine means `filter-bar`'s chips and this family's
announcement say the same sentence.

The trigger's accessible name uses it too. Unfiltered it is "Filter Status";
filtered it is "Filter Status: contains ana". Excel's own tooltip on a filtered
header reads "Equals a red cell color" or "Larger than 150" — the name states
what is applied rather than how many values were ticked, which is what the
shipped version could say and no longer needs to.

## 8. Five components, not one with a `kind`

The decision the invocation asked to be recorded.

**Chosen: `TableTextFilter`, `TableNumberFilter`, `TableDateFilter`,
`TableBooleanFilter`, `TableSetFilter`, and `slTableTextFilter` and its four
siblings.**

| | Five components | One with `kind` |
| --- | --- | --- |
| The consumer's value type | `TextFilter`, exact | `FilterDescriptor`, a union of five |
| Reading `value.conditions[0].value` | `string` | `string \| number \| boolean \| readonly string[]`, after narrowing on `kind` |
| Angular | `model<TextFilter \| null>()` on each | `model<FilterDescriptor \| null>()`, and no way to narrow it per instance |
| Kind-specific props | `options` on the set filter, `min`/`max` on the date filter, `step` on the number filter, each where it belongs | every prop on one component, most of them meaningless for any given `kind` |
| A column whose kind is data | writes the component the column's type names | passes the kind through |
| Bundle | a table of text columns pulls no `date-picker` | every kind's operand control is in the one component |

The union is the cost the invocation named — "o consumidor de um filtro de texto
não deve desembrulhar união" — and Angular decides it outright: an input cannot
retype a `model()` per instance, so a single component would hand every Angular
consumer the union with no way to narrow it.

What it costs: five public names per binding instead of one, and a consumer
rendering a column whose kind arrives as data writes a five-arm switch **once**,
over components. That is not the switch the acceptance criterion forbids, which
is a switch over operators to apply the filter — that one is `matchesFilter`.

Internally there is one implementation. A shell holds the popover, the draft, the
conditions, the join, the actions and the announcements; the five public
components pass their kind, their operators and their operand body into it.

## 9. The break, and how a consumer moves

Required by §18.12 of `docs/component-features.md`.

| Before                                            | After                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `<TableFilter options={…} value={string[]} />`    | `<TableSetFilter options={…} value={SetFilter \| null} />`             |
| `<span slTableFilter [options]="…" [value]="…">`  | `<span slTableSetFilter [options]="…" [value]="…">`                    |
| `value: readonly string[]`                        | `value: SetFilter \| null`                                             |
| `onValueChange(next: readonly string[], request)` | `onValueChange(next: SetFilter \| null, request)`                      |
| `rows.filter((row) => value.includes(row.status))` | `rows.filter(createFilterPredicate(value))`                            |

Two lines move a filtered listing:

```ts
// before
const [status, setStatus] = useState<readonly string[]>([]);
const shown = status.length === 0 ? rows : rows.filter((row) => status.includes(row.status));

// after
const [status, setStatus] = useState<SetFilter | null>(null);
const shown = useMemo(() => rows.filter(createFilterPredicate(status)), [rows, status]);
```

`setFilter(values)` in the engine builds a `SetFilter` from a bare array, so a
consumer restoring a saved view written by the old shape converts it in one call
rather than by hand.

The old name is removed rather than deprecated. The family is pre-1.0 and the
build order rebuilds every family in the same pass; two names for one control,
one of them holding a shape the engine cannot evaluate, is the ambiguity the
rebuild exists to remove.

## 10. The boundary, redecided

`declined.typedFilterRules` in the contract said typed rules were `filter-bar`'s.
It deferred the vocabulary rather than the editor, and it is removed.

| Capability                                            | Owner                        | Why there                                                                                                                       |
| ----------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Operators, descriptor, predicate, codec, summary      | `@slotted/core/filter`       | Three families hold it. A family-local vocabulary would be three families disagreeing about one descriptor, which is the argument that put `sort` in the shared schema. |
| One column's condition, edited in its header          | `table`                      | The control has to sit inside a cell this family lays out, which is why `column-actions` exists.                                 |
| The same condition, edited in a bar above the table   | `filter-bar` (wave 8)        | It stands on the page's own ground, not in a cell. It reads and writes the same descriptor, so a screen can offer both.          |
| Conditions across several columns, chips, presets     | `filter-bar`                 | §12's Filter Builder: rule groups, presets, validation and a readable expression. The expression is `describeFilter`.            |
| Nesting beyond two conditions, AND/OR groups          | `filter-bar`                 | It needs an expression tree and an editor for it. Two conditions is where AG Grid's own per-column panel stops.                  |
| One field searching every column                      | `filter-bar`                 | It belongs to no column, so no column header can hold it. It is a text condition evaluated against every column's value.         |
| Filtering the rows                                    | the consumer, or `data-grid` | The rows are the consumer's children here. `data-grid` owns a data model and applies the predicate itself.                       |
| A floating filter row under the header                | declined                     | A second permanent presentation of the same descriptor, costing a row of the table's geometry. `filter-bar` is the answer above the table. |

`columnControls.state` in the contract said the slot holds no state and that
`filter-bar` owns the typed rules. The first half stands — the slot holds a
control and none of its state — and the second is rewritten to point at the
engine.

## 11. React

| Question                                                                                            | Answer                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a mutable value ship a controlled and uncontrolled pair, plus the request carrying a reason?   | yes — `value` / `defaultValue` / `onValueChange(value, request)` on each of the five, with reasons `pointer`, `keyboard`, `clear`, `programmatic`, through `createControllable` |
| Can an application set this family's defaults once, rather than per instance?                       | yes — `TableDefaultsProvider` already carries `labels`, and the operator names join it, so an application translates the vocabulary once                                  |
| Can a consumer substitute the rendered element of each public part?                                 | the operand body, through `render` on `operand`; the trigger through `render`, as `PopoverTrigger` already gives it. The panel's frame is fixed, and §5.3 says why       |
| Does the consumer's own handler still run when the family handles the same event?                   | yes — composed, never replaced; `Enter` in an operand runs the consumer's `onKeyDown` first and applies only if it was not defaulted                                     |
| Can a consumer reach the native element, and the imperative action it cannot express declaratively? | yes — `ref` on the trigger, and `open` / `defaultOpen` / `onOpenChange` for the panel, which is what `popover` already exposes                                            |
| Does it render on the server without a hydration mismatch?                                          | yes — `useId` for the operand and list identifiers, no layout read during render                                                                                         |
| Does every state a consumer may style appear in the DOM?                                            | yes — `data-filtered` on the trigger and the header, `data-kind` on the panel, `data-operands` on the condition, `data-covering` on the covering option                   |
| Is each part's props type the native element's, extended?                                           | yes — `ComponentPropsWithRef<'div'>` and its siblings on every part                                                                                                      |

## 12. Angular

| Question                                                                           | Answer                                                                                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a two-way value use the signal form the ecosystem expects?                    | yes — `value = model<TextFilter \| null>(null)` on each of the five, and `valueChange` carries the request                                                         |
| Does a control that belongs in a form work with Reactive Forms and template forms? | no — a column filter is not a form control. It is a query the reader composes, and the operand controls it draws are `text-field`, `number-field` and `date-picker`, each already a `ControlValueAccessor` where a consumer wants one |
| Can an application set this family's defaults once, rather than per instance?      | yes — `provideSlTableDefaults` already exists and carries `labels`; the operator names join it                                                                     |
| Can a template reach the instance?                                                 | yes — `exportAs: 'slTableTextFilter'` and its four siblings                                                                                                       |
| Can a consumer substitute projected content, and keep it lazy?                     | yes — the operand body is an `ng-template` with `NgTemplateOutlet`, so it re-renders per condition and is never built for a panel that is closed                   |
| Is it correct with zoneless change detection and `OnPush`?                         | yes — signals throughout, `computed` for the derived draft, no `markForCheck`                                                                                     |
| Is every subscription and listener torn down?                                      | yes — the panel adds no listener of its own; `popover` and `dismissable-layer` own theirs and tear them down                                                       |
| Does a static attribute the consumer wrote survive the host bindings?              | yes — `data-part` is written by the family on its own element, and the trigger reads `HostAttributeToken` for a consumer's own `aria-label` before writing its own |
| Does an entry point that others depend on stay a single class?                     | yes — the five ship from `@slotted/angular/table`, and the engine is imported as `@slotted/core/filter`                                                            |

## 13. Tokens and the picture

The panel keeps its width floor of `15rem` and gains a second: an operator name
and a value field side by side need more room than a checkbox and a count, so the
panel states `min-inline-size` rather than a fixed `inline-size`, and the
operator chooser truncates its own button rather than pushing the panel wider.
That is the answer to the long-translated-operator gap.

The panel also declares the tokens it uses rather than reading them from the
root. Every `--_` in this stylesheet is declared on `[data-part='root']`, and a
portalled panel is not inside it: `gap: var(--_gap)` resolved to nothing and the
panel lost its rhythm entirely, silently, in the arrangement `popover` uses by
default. Found by reading the rule rather than by a test, and it is the shipped
panel's defect as much as the new one's.

The floor is seventeen rem, and it is measured rather than chosen: the widest
operator name is 146 pixels of text, the chooser adds its own inset and chevron,
and a range wants two seven-rem fields on one row. Fifteen rem left 193 pixels of
content, a squeezed chooser and a stacked range; seventeen leaves 248 and
neither.

The room the floor gives way to is `--slotted-positioner-available-width`, the
number the engine measured, rather than `100%`. Two readings got that wrong
before it was measured: a bare `15rem` beat `max-inline-size: 100%` — a minimum
always does — and stood eight pixels outside its layer at a 240-pixel viewport;
`min(15rem, 100%)` then resolved its percentage against a containing block that
is itself shrink-to-fit and came out at 217 pixels, twenty-three under the floor
it was meant to hold.

`between` needs no container query and no second element. Its two operands are
one `auto-fit` grid of `minmax(7rem, 1fr)`, which sits them on one row at the
floor and stacks them when the room is less — the narrow viewport, and nothing
else.

## 14. What a wrong answer costs

For the visual gate, so the reviewer knows what is cheap now.

| If this is wrong                         | Now                                    | After step 13                                                                    |
| ---------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| The descriptor's shape                   | the engine and its tests               | both bindings, both reference pages, `data-grid`'s query state and every consumer's saved view |
| Five components rather than one          | five thin wrappers                     | every public name, both docs pages and every consumer's imports                  |
| The reveal of the second condition       | one condition in the shell             | the announcement, the tests and the scene that shows it                          |
| The operator chooser being `select`      | one part's markup                      | the panel's geometry, the nested-layer behaviour and the keyboard scene          |
| The panel's width floor                  | one declaration                        | every capture, and the reference pages at two widths                             |
