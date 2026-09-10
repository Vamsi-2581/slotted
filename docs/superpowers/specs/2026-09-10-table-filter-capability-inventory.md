# Table filter capability inventory

The subject is column filtering, not the whole `table` family:
`docs/superpowers/specs/2026-09-09-table-capability-inventory.md` inventoried the
rest and nothing there is reopened. This inventory is produced from the field
rather than from what shipped, and §5 puts the two side by side.

`data-grid` (wave 8) uses this base unchanged and `filter-bar` (wave 8) composes
over it, so what is decided here is the library's filter vocabulary rather than
one family's feature.

---

## 1. Surveyed

Six implementations, read on 10 September 2026. Four ship typed conditions, one
ships a chosen set only, and one ships neither — chosen so the sources disagree.

| Implementation                     | What it calls this                                                                | Read at                                                                                                                                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AG Grid (React Data Grid, v34 docs) | **Column Filters**: Text Filter, Number Filter, Date Filter, Set Filter, Advanced Filter, Quick Filter | `ag-grid.com/react-data-grid/filter-text`, `/filter-number`, `/filter-date`, `/filter-conditions`, `/filter-advanced`                                                                                                |
| MUI X Data Grid                    | **Filtering**: `GridFilterModel`, filter panel, quick filter                       | `github.com/mui/mui-x/blob/master/docs/data/data-grid/filtering/index.md`, `/filtering/quick-filter.md`, `docsTech/filtering.md`                                                                                     |
| PrimeReact DataTable               | **Filter Menu**: `FilterMatchMode`, `FilterOperator`, `DataTableOperatorFilterMetaData` | `github.com/primefaces/primereact/blob/master/_autodocs/api-reference/filter-service.md`, `/datatable.md`                                                                                                            |
| Ant Design Table (v6.6)            | **Column filters**: `filters`, `filteredValue`, `filterDropdown`, `filterMode`, `filterSearch` | `ant.design/components/table` (Column API table)                                                                                                                                                                    |
| Microsoft Excel                    | **AutoFilter**: filter by list value, Text Filters, Number Filters, Custom AutoFilter | `support.microsoft.com/en-us/office/filter-data-in-a-range-or-table-01832226-31b5-4568-8806-38c37dcc180e`                                                                                                            |
| Carbon Data Table                  | **Table toolbar**: search and filtering                                            | `carbondesignsystem.com/components/data-table/usage/`                                                                                                                                                               |

The two answers the sources give to the same question:

- **Typed condition.** AG Grid, MUI X, PrimeReact and Excel each pick an
  operator from a vocabulary the column's type decides, then take one or two
  operands. AG Grid: `filterType: 'number', type: 'greaterThan', filter: 23`.
  MUI X: `{ field: 'rating', operator: '>', value: '4' }`. PrimeReact:
  `{ value, matchMode: 'gte' }`. Excel: the Custom AutoFilter dialog.
- **Chosen set.** Ant Design's `filters` array with `onFilter`, AG Grid's Set
  Filter, Excel's "filter by a list value". Excel states the two are mutually
  exclusive per column; AG Grid and MUI X let one column hold either.

Carbon ships neither: its data table filters through a toolbar search over the
whole table, and its documentation has no per-column operator. It is in the list
as the boundary case — a table that declines typed filtering entirely and sends
the reader to a search field.

## 2. Table stakes

Every capability two or more of the six ship.

| Capability                                                     | Who ships it                                        | Verdict                | Reason                                                                                                                                                                                                    |
| -------------------------------------------------------------- | --------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Set filter: a checkbox list of the column's values             | AG Grid, Ant, Excel                                 | adopt                  | Shipped. Becomes one of five kinds rather than the only one.                                                                                                                                              |
| Search inside the set list                                     | AG Grid (mini filter), Ant (`filterSearch`), Excel  | adopt                  | Shipped. Moves from an NFD fold to the locale collator — §3.                                                                                                                                              |
| A covering checkbox over what the search left                  | AG Grid, Excel                                      | adopt                  | Shipped.                                                                                                                                                                                                  |
| Text conditions: contains, not contains, equals, not equals, starts with, ends with | AG Grid, MUI X, PrimeReact, Excel                   | adopt                  | The defect this pass exists to fix. AG Grid's default option is `contains`; this family takes the same default.                                                                                            |
| Number conditions: =, ≠, >, ≥, <, ≤                            | AG Grid, MUI X, PrimeReact, Excel                   | adopt                  | PrimeReact's `numeric` match modes are exactly these six.                                                                                                                                                 |
| A range condition (`between` / `inRange`)                      | AG Grid, PrimeReact, Excel                          | adopt                  | The one operator that changes the panel's shape by taking two operands.                                                                                                                                   |
| Date conditions: is, is not, before, after, between            | AG Grid, MUI X, PrimeReact, Excel                   | adopt                  | PrimeReact's `date` match modes are `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`; AG Grid adds Between.                                                                                                |
| Boolean condition                                              | MUI X (`is` with `'true'`/`'false'`), PrimeReact (TriStateCheckbox), AG Grid (boolean via set) | adopt                  | Three values, not two: true, false, and "not filtered".                                                                                                                                                   |
| Blank / not blank                                              | AG Grid (text, number and date), MUI X (`isEmpty`, `isNotEmpty`) | adopt                  | The second operator that changes the panel's shape, by taking no operand at all.                                                                                                                          |
| Two conditions joined AND/OR                                   | AG Grid (`maxNumConditions`, default 2), PrimeReact (`constraints` + `operator`), Excel (Custom AutoFilter) | adopt                  | AG Grid's `ICombinedSimpleModel` is the shape: `{ filterType, operator: 'AND' \| 'OR', conditions: [...] }`.                                                                                               |
| More than two conditions, or nested groups                     | AG Grid Advanced Filter, MUI X (`items` is unbounded) | defer to `filter-bar`  | Wave 8. Nesting needs an expression tree, an editor for it and a readable text summary, which is `docs/component-features.md` §12 Filter Builder. Two conditions is where AG Grid's own per-column panel stops. |
| A serialisable model, the same shape on client and server      | AG Grid (`filterModel`), MUI X (`GridFilterModel`), PrimeReact (`DataTableFilterMeta`) | adopt                  | §12 of the feature guide asks for it in the same sentence for both. The descriptor is a plain object with no class, no `Date` and no function.                                                             |
| Apply and Clear rather than filtering on every keystroke       | AG Grid (`buttons: ['apply','clear']`), Ant (OK/Reset), Excel (OK/Cancel) | adopt                  | Shipped, as a draft the panel edits.                                                                                                                                                                      |
| A mark on the header saying the column is filtered             | Excel (the funnel changes), Ant (highlighted icon), AG Grid | adopt                  | Shipped as `data-filtered`.                                                                                                                                                                               |
| Case and diacritic insensitivity in matching                   | AG Grid (`textFormatter`), Ant, Excel                | adapt                  | The collator, not a fold — §3.                                                                                                                                                                            |
| The consumer can replace the panel's body                      | Ant (`filterDropdown`), AG Grid (custom filter component), MUI X (custom operators) | adopt                  | Every kind's operand area is projected content with the family's own as the default.                                                                                                                      |
| The family applies the predicate to the rows                   | AG Grid, MUI X, PrimeReact, Ant (`onFilter`)         | adapt                  | The family reports the descriptor and the engine exports the predicate. The rows are the consumer's children, which is the same division `sort` already records and the line §1 of the design draws against `data-grid`. |
| Controlled and uncontrolled filter value                       | Ant (`filteredValue` / `defaultFilteredValue`), MUI X (`filterModel` / `initialState`) | adopt                  | Shipped, and `docs/state-and-events.md` requires it of every mutable value anyway.                                                                                                                         |
| Quick filter: one field searching every column                 | AG Grid (Quick Filter), MUI X (quick filter)         | defer to `filter-bar`  | It belongs to no column, so no column header can hold it. Wave 8, over the same engine: a quick filter is one text condition evaluated against every column's value.                                       |
| A floating filter row under the header                         | AG Grid (`floatingFilter`)                           | decline                | It is a second, permanently visible presentation of the same descriptor, and it costs a row of the table's own geometry. A consumer who wants filters always visible puts them in a `toolbar` above, which is what `filter-bar` is; the descriptor is the same object either way. |
| Tree-shaped set filter                                         | Ant (`filterMode: 'tree'`), AG Grid (grouped set filter) | defer to `filter-bar`  | The list of values becomes a `tree`, and `tree` shipped in wave 6 with its own selection cascade. Composing the two is a panel body, and the operand area is projected — a consumer can do it today; the family ships it when `filter-bar` needs it. |
| Top ten / above average / by colour                            | Excel only                                           | decline                | One implementation, and each is a statistic over the whole column rather than a condition on one value — the family holds no column of values to compute it from. A consumer computes the threshold and uses `≥`.  |
| Reset to a default set rather than to empty                    | Ant only (`filterResetToDefaultFilteredValue`)       | decline                | One implementation. Clear empties, and a consumer who wants a floor writes `onValueChange` back to their default in two lines: `setFilter(next ?? initial)`.                                              |
| A count beside each value in the set list                      | none of the six                                      | keep                   | Shipped, optional, and the consumer's own number. §3.                                                                                                                                                     |

## 3. Differentiators

| What                                                                    | Against the field                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The engine is a package, not a grid's internals                         | AG Grid's model is readable but only a grid evaluates it; MUI X's `GridFilterModel` is coupled to `GridColDef`; PrimeReact's `FilterService` is closest and is still bound to the DataTable's props. `@slotted/core/filter` has no DOM, no framework and no table in it, so a server route, a `data-grid`, a `filter-bar` and a consumer's own list all evaluate one predicate. |
| Locale-sensitive matching                                              | AG Grid lower-cases with `toLowerCase` and asks for a `textFormatter` for anything else; the shipped version of this panel stripped combining marks with `normalize('NFD')`, which is an English answer wearing a Unicode one — it turns `ø` into `ø` and leaves `ß` alone. `createFilter` in `@slotted/core/collection` already builds an `Intl.Collator` at `usage: 'search'` for `combobox`, and the same collator answers `contains`, `startsWith` and `equals` here. |
| A query-string codec that round-trips                                  | None of the six ships one. A listing screen that filters and then shares its URL is the ordinary case, and every application writes the encoder again. `serializeFilter` and `parseFilter` are total: an unknown kind or operator parses to `null` rather than throwing, so a bookmarked URL from an older version degrades to no filter instead of a blank screen. |
| Typed per kind in both bindings                                        | AG Grid and MUI X hand the consumer a union and a `filterType` discriminant to switch on. Here a text filter's value is a text filter's value, in React's types and in Angular's `model()` alike, and the consumer never unwraps a union to read it.                                                                                                                       |
| Three schemes, three densities and RTL in the panel                    | The four typed panels surveyed are fixed-width boxes with a left-to-right assumption: AG Grid's is 200 px, MUI's panel is a flex row of fixed inputs. This panel answers `dense`, `high-contrast` and `dir="rtl"` because every family here does.                                                                                                                          |
| Counts beside values                                                   | None of the six shows how many records carry a value. It is the consumer's fact about their own query rather than the column's, so the family takes it and never computes it.                                                                                                                                                                                             |
| The empty condition rule is stated and tested                          | AG Grid drops an incomplete condition silently and MUI X's behaviour depends on the operator. Here it is one line of law: a condition with a missing operand is inactive, an inactive condition is dropped before the join, and a filter with no active condition matches everything.                                                                                      |

## 4. Gaps

What no surveyed implementation handles well and a listing screen still hits.

| Gap                                                                                 | What this family does                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `between` whose ends are inverted — the reader types 100 then 10                   | AG Grid returns no rows and says nothing. The predicate orders the pair before comparing, so `between 100 and 10` is `between 10 and 100`. A range that matched nothing and explained nothing is the same defect as a silent sort. |
| A number typed in a locale that separates decimals with a comma                      | AG Grid's number filter reads `parseFloat`, so `1,5` is `1`. The operand is a `number-field`, which parses through `@slotted/core/number` in the reader's locale, and the descriptor carries a `number` rather than a string.       |
| A date column whose values carry a time                                              | AG Grid needs a `comparator` for it and Excel groups by day. The predicate compares plain dates: a value with a time is reduced to its day in the stated time zone before comparing, and `is 10 September` matches 09:14 on that day. |
| A long translated operator name in a narrow panel                                    | "Não contém" and "Ist nicht leer" are wider than "≠". The operator chooser is a `select`, which truncates its own button and shows the full name in its list, and the panel's width is a floor rather than a fixed size.            |
| An interrupted interaction: two conditions typed, then Escape                        | The draft is discarded and the change is announced. Nothing reaches the consumer, which is the shipped rule extended to the new fields.                                                                                            |
| A bookmarked URL written by an older version of the application                      | `parseFilter` returns `null` for an unknown kind, an unknown operator or a malformed operand. A filter that cannot be read is no filter, never a thrown error on first paint.                                                       |
| A column of values that are all empty                                                | The set list is empty and the panel says so; the typed panels still offer `is empty`, which is the condition that column is for.                                                                                                   |
| A reader who cannot see the panel change shape                                       | Choosing `between` adds a second operand and choosing `is empty` removes both. The change is announced through the live announcer, because a form that grows under a reader who cannot see it says nothing otherwise.               |

## 5. What shipped, and the delta

`TableFilter` and `SlTableFilter` shipped a set filter and nothing else: a
checkbox list, a search past eight values, a covering checkbox, optional counts,
Clear and Apply, a draft that reaches the consumer only on Apply, Escape and
outside press cancelling, `data-filtered` and a count in the trigger's
accessible name. Seven parts, one state model, one scenario with four scenes.

| Capability                            | Shipped | The field | This family                                                                    |
| ------------------------------------- | ------- | --------- | ------------------------------------------------------------------------------ |
| Set filter with search and select-all | yes     | yes       | kept, and its matching moves to the collator                                   |
| Text, number, date, boolean condition | no      | yes ×4    | added                                                                          |
| Operator vocabulary per type          | no      | yes ×4    | added, in the engine                                                           |
| Blank / not blank                     | no      | yes ×2    | added                                                                          |
| Range with two operands               | no      | yes ×3    | added                                                                          |
| Two conditions joined AND/OR          | no      | yes ×3    | added                                                                          |
| Predicate a consumer can apply        | no      | yes ×4    | added, in the engine, pure                                                     |
| Query-string round trip               | no      | none      | added, in the engine                                                           |
| Draft, Apply, Clear                   | yes     | yes       | kept                                                                           |
| `data-filtered`, count in the name    | yes     | partial   | kept                                                                           |
| Counts beside values                  | yes     | none      | kept                                                                           |

The one capability shipped that the field does not have is the count, and it is
kept: it costs the family nothing, since the number is the consumer's.

`declined.typedFilterRules` in `specs/components/table/contract.json` deferred
typed rules to `filter-bar` and is wrong: it defers the vocabulary rather than
the editor. It is removed, and what remains deferred is nesting, presets and the
quick filter — the three things that need a rule set the column does not hold.

## 6. The break

`value` changes shape, from `readonly string[]` to a descriptor. It is a
contract break, recorded under §18.12 of `docs/component-features.md` in
`docs/superpowers/specs/2026-09-10-table-filter-design.md` §9 with the migration
written out.
