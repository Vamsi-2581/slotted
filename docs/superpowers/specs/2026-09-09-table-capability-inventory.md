# Table capability inventory

Produced before the family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. The family is new:
`specs/components/table/` does not exist, and `docs/build-order.md` wave 6 lists
`table` as item 7 with no scope paragraph. The paragraph written from this
inventory lands in the same commit.

Sources were read on 9 September 2026.

---

## 1. Surveyed

Six implementations, chosen so they disagree: the platform and the norm, a
headless behaviour library for React, the only surveyed answer written for
Angular, and three opinionated design systems that each answer the responsive
question differently.

| Implementation           | Calls it                                                                         | Read at                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML Standard §4.9       | `table`, `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, `colgroup`      | <https://html.spec.whatwg.org/multipage/tables.html> and <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table>                |
| WAI-ARIA APG             | Table Pattern; Grid Pattern; Grid and Table Properties                           | <https://www.w3.org/WAI/ARIA/apg/patterns/table/>, `content/patterns/table/table-pattern.html` in `w3c/aria-practices`, and the two practice pages   |
| React Aria Components    | `Table`, `TableHeader`, `Column`, `TableBody`, `Row`, `Cell`, `TableFooter`      | <https://react-spectrum.adobe.com/react-aria/Table.html>                                                                                            |
| Angular CDK and Material | `CdkTable` / `MatTable`, `matSort`, `MatTableDataSource`                         | `src/cdk/table/table.md` and `src/material/table/table.md` in `angular/components`                                                                   |
| Carbon                   | `DataTable`                                                                      | <https://carbondesignsystem.com/components/data-table/usage/> and its accessibility page                                                            |
| PatternFly               | `Table`                                                                          | <https://www.patternfly.org/components/table/>                                                                                                      |
| Ant Design               | `Table`                                                                          | <https://ant.design/components/table>                                                                                                               |

Two names hide the same capability and are worth stating once. What React Aria
calls a **row header** is what HTML calls `th` with `scope="row"` and what
Carbon calls the row's title cell. What Ant calls **fixed** columns and header,
PatternFly calls **sticky**, and Material calls **sticky** as well; this family
uses `sticky` throughout, because it is what CSS calls the position that
produces it.

The choice that separates the sources is the role. React Aria's Table is a
`grid`: its rows are focusable, arrow keys move a cell cursor, and the whole
table is one tab stop. Everything else surveyed renders a `table`, where the
APG is explicit — "it is not an interactive widget. Thus, its cells are not
focusable or selectable" — and every control inside is its own tab stop. This
family takes the `table` role, and §4 of the design document records the cost.

---

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability                                        | Who ships it                                     | Verdict                | Reason                                                                                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic structure: caption, head, body, foot      | HTML, APG, all five components                   | adopt                  | The platform supplies the roles, the row and column relationships and the header association. Section 2.8 asks for native HTML before ARIA.                                                                    |
| Column header with `scope`, row header with `scope="row"` | HTML, React Aria (`isRowHeader`), Carbon, Ant | adopt                  | §12 requires it by name. A row header is what makes a screen reader announce which record a cell belongs to.                                                                                                    |
| Accessible name from a caption or a label         | HTML, APG, Carbon                                | adopt                  | The `caption` part is visible or visually hidden; `aria-labelledby` points at it either way.                                                                                                                    |
| Alignment by data type                            | Ant (`align`), PatternFly, Carbon, Material      | adopt                  | §12 asks for it. It is a cell axis — `start`, `center`, `end` — resolved through logical properties so RTL mirrors it.                                                                                          |
| Tabular figures on numeric cells                  | Spectrum, Carbon                                 | adopt                  | §12 asks for it by name: "números alinham por tabular figures quando disponíveis". `font-variant-numeric: tabular-nums` follows the numeric alignment rather than being a second axis.                          |
| Single-column sort, three states, `aria-sort`     | APG sortable example, React Aria, Material, Ant, Carbon, PatternFly | adopt | The header text is wrapped in a `button`, `aria-sort` is written on the sorted header only, and the cycle is ascending → descending → none.                                                                     |
| Multi-column sort                                 | Ant, PatternFly                                  | decline → `data-grid`  | ARIA has no way to state a sort level, and the practice page says so: "there is limited value to applying `aria-sort` with a value other than `none` to more than one column". §12 puts multiple sorting in Data Grid's query model. |
| Row selection with checkboxes                     | React Aria, Carbon, Ant, PatternFly, Polaris     | adopt                  | §12 names selection as a capability a Table may hold. The reducer is `nextSelection` from `@slotted/core/collection`, already shared with `listbox`.                                                            |
| Select-all with an indeterminate header checkbox  | React Aria, Carbon, Ant, PatternFly              | adopt                  | The header checkbox covers the rows in the DOM and says how many in its own accessible name, which is the half every surveyed implementation leaves ambiguous.                                                  |
| Range selection with `Shift`                      | React Aria, Ant                                  | adapt                  | `nextSelection` already implements the range action against an anchor. The pointer gesture is adopted; the keyboard half belongs to the checkbox each row owns, because the row is not focusable under the `table` role. |
| Row activation — a whole row that navigates       | React Aria (`onRowAction`), Polaris              | decline → `link`, `data-grid` | A `tr` cannot be an anchor, and under the `table` role a row is not a widget. The composition is a `link` in the row-header cell, which is what Carbon, Primer and the HTML standard produce. Row-level activation belongs to the grid pattern, which is `data-grid` in wave 8. |
| Expandable row detail                             | React Aria, Carbon, PatternFly, Ant              | adopt                  | Four of six. The expander is a `button` with `aria-expanded` and `aria-controls`; the detail is a second `tr` whose single cell spans the row. Nothing is removed from the DOM when it closes — it is not rendered until it opens, and the button says so.  |
| Sticky header                                     | Carbon, PatternFly, Ant, Material                | adopt                  | It sticks inside the family's own scroll region rather than to the viewport, which is what makes it correct inside a drawer or a dialog.                                                                        |
| Sticky columns                                    | PatternFly, Ant, Material                        | adopt                  | A cell axis, `start` or `end`, resolved logically. The intersection with the sticky header is a gap; see §4.                                                                                                    |
| Horizontal scroll with an affordance              | PatternFly, Ant, Carbon, §12                     | adopt                  | The `scroll` part takes `role="region"`, `tabindex="0"` and a name **only while it overflows**, measured by `@slotted/core/overflow` — the rule `prose` already holds.                                          |
| Zebra striping                                    | Carbon, PatternFly, Ant                          | adopt                  | A boolean, off by default: striping helps a wide table and costs a row its own state colours when it is on. The stripe is drawn under the state, never over it.                                                 |
| Border and plain treatments                       | PatternFly (`borders`, `isPlain`), Ant (`bordered`), Carbon | adopt      | One axis with the vocabulary `description-list` already uses: `plain`, `ruled`, `framed`. A second word for the same idea is what the terminology rule forbids.                                                 |
| A size axis                                       | Carbon (five sizes), Ant (three), PatternFly (compact) | decline → the density axis | The theme restates the control scale at `comfortable`, `compact` and `dense`, and the row reads `--slotted-control-height-*` for its own height. A family-owned size step would be a second scale answering the same question — the argument `description-list` recorded. |
| Text treatment for a long cell value              | PatternFly (five modifiers), Ant (`ellipsis`)    | adapt                  | Three values rather than five: `wrap` (the default, breaking an unbroken token), `truncate` (one line with an ellipsis, the full value still in the DOM), `nowrap`. The briefing's decision holds: truncation never removes content. |
| Empty state                                       | React Aria, Carbon, PatternFly, Ant              | adopt                  | The `empty` part is one cell spanning the table, and it takes a `result-state`. The family draws no illustration of its own.                                                                                    |
| Loading                                           | Carbon (skeleton), Ant, React Aria               | adopt                  | Two shapes, because they are two states: a first load draws skeleton rows in the `empty` slot, and a refresh over rows already shown writes `aria-busy` and dims them without moving anything.                  |
| Footer or summary row                             | React Aria (`TableFooter`), Material, Ant        | adopt                  | The `foot` part is a `tfoot`, which the platform already places and keeps with the table when it prints.                                                                                                        |
| Multi-level column headers                        | Ant, Material, PatternFly                        | adopt                  | Composition, not API: a second `row` inside `head` with the native `colspan` and `rowspan` passing through. The family adds nothing and takes nothing away.                                                     |
| A stable key per row                              | Material (`trackBy`), React Aria (`id`), Ant (`rowKey`) | adopt           | The row takes `value`, which is the key selection and expansion are held by. It is required only when one of those two is on.                                                                                   |
| Column resizing                                   | React Aria, Ant                                  | decline → `data-grid`  | §12 puts `width/min/max` and resize in Data Grid's column model. It needs a per-column width state, a pointer and a keyboard gesture, and a persisted preference — the three things that separate a grid from a table. |
| Virtualisation and incremental loading            | React Aria, Ant, Material (`cdk-virtual-scroll`) | decline → `data-grid`  | §2.10 makes virtualisation an optional capability of a collection, and a collection is what this family deliberately does not own: the rows are the consumer's own children. `listbox` holds the engine's windowing today and `data-grid` takes it for rows in wave 8. |
| Pagination controls                               | Carbon, Ant, Material                            | adapt                  | `pagination` owns the page, the range and the keyboard, and this family owns the two halves it cannot: the `footer` part — the bar under the table and inside its frame, which is where all three surveyed draw it — and `aria-rowcount`/`aria-rowindex`, so a paged table still says how large the whole set is. |
| A search and filter toolbar                       | Carbon, Ant, PatternFly                          | decline → `toolbar`, `filter-bar` | `toolbar` ships and holds the controls; `filter-bar` in wave 8 holds the typed rules. A toolbar built into the table would be a second answer to a question two families already answer.                          |
| A control inside a column header — filter, menu   | Ant, PatternFly, Carbon                          | adapt                  | The **place** is this family's and ships as the `column-actions` part; the **state** is not. The control has to sit inside a cell this family lays out, and with the sort control filling the header there was nowhere for a second target — a consumer would have had to reach past the family for a button that cannot live anywhere else. What the filter holds is the consumer's query, and `filter-bar` owns the typed rules. Added after the visual gate raised the listing-screen question. |
| A batch action bar over the selection             | Carbon, Polaris, PatternFly                      | decline → `action-bar` | Wave 7 builds it. This family supplies the selection and its count; where the actions are drawn is the page's decision, not the table's.                                                                        |
| Column visibility, order and pinning management   | Ant, PatternFly, Carbon                          | decline → `column-manager` | §12 gives it its own Extended family in wave 8, and it is the family that can refuse to hide a mandatory column. The table honours the result: a column the consumer does not render is not there.               |
| Drag to reorder rows                              | React Aria, PatternFly, Ant                      | decline → `drag-and-drop` | §3 makes drag-and-drop its own Extended module in wave 8, with the keyboard alternative a gesture bolted onto this family would not have. The family exposes `data-dragging` for it and adds no gesture.        |
| A card or stacked layout below a breakpoint       | PatternFly (`gridBreakPoint`), Polaris (condensed) | decline → `data-list` | §12 names the recipe and §12 also forbids the shape PatternFly ships: "nunca converte células em cards sem labels". `data-list` in wave 8 is the family that carries the labels with the values.                 |

---

## 3. Differentiators

| Capability                                                                 | Where it comes from                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A scroll region that is a tab stop **only while it overflows**             | `@slotted/core/overflow` and the rule `prose` set. PatternFly and Ant leave a permanent tab stop or none at all; a table that fits and still takes a tab stop makes the reader press Tab for nothing.                                       |
| The sort change announced, not only attributed                             | `aria-sort` is a property, and a property that changes silently is a change no reader hears. `@slotted/core/live-announcer` says the column and the direction politely. None of the six surveyed announces it.                              |
| `aria-rowcount` and `aria-rowindex` written exactly when the DOM holds a page | The APG practice requires the pair precisely when the DOM is not the whole set, which is every paged table. None of the surveyed components writes it, and it is the difference between "row 3 of 20" and "row 3 of 400".                    |
| Three colour schemes, three densities and RTL through logical properties   | `high-contrast` is a scheme an application selects here; no surveyed implementation offers one. The row height, the cell type and the cell inset all read tokens the theme restates per density, so a dense table is smaller and says the same thing. |
| A sticky header that sticks inside the family's own scroller               | Carbon and PatternFly stick to the nearest scrolling ancestor, which is the page. A table inside a drawer then has a header that leaves. The `scroll` part is the scroller and the header sticks to it.                                     |
| Two first-class bindings, and the selection reaching Angular's forms       | The selection is a `ControlValueAccessor` in Angular, which makes a bulk-action screen a reactive form rather than a component with a callback. Material's table has no forms integration of any kind.                                       |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap                                                                       | What this family does                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The corner where a sticky header meets a sticky column                     | Both stick, so the cell needs both offsets and a stacking order above each of them; with one `z-index` the header slides under the pinned column or the pinned column over the header. The header cell that is also sticky takes the higher step, stated once in the stylesheet. |
| A cell holding one unbroken sixty-character token — a hash, a URL, an id   | Every surveyed table lets it set the column's width and push the rest of the table sideways. `wrap` breaks it with `overflow-wrap: anywhere`, and `truncate` keeps it on one line with the whole value still in the DOM.                                          |
| An empty table and a table emptied by a filter are the same picture        | Carbon distinguishes them in guidance and in no API. The `empty` part takes a `result-state`, whose `status` axis already separates `empty` from `no-results`, so the two say different things without this family owning a word for either.                     |
| What "select all" means when the page shows 20 of 400 rows                 | The header checkbox covers the rows in the DOM and says so in its accessible name, with the count. A selection over the whole result set is a decision only the consumer's query can make, and it belongs in the `action-bar` beside the count.                   |
| Loading over rows a reader is already looking at                           | A refresh that swaps rows for skeletons loses the reader's place and their scroll position. The first load draws skeleton rows; a refresh writes `aria-busy` on the table, holds every column width, and dims the body without moving it.                          |
| A numeric column in a right-to-left document                               | Alignment stated as `end` is mirrored by the browser, and the tabular figures follow the alignment rather than the writing direction. A column aligned with `text-align: right` — which is what four of the six surveyed write — is wrong in Arabic.              |
| A table printed                                                            | A sticky header, a scroller and a fixed height are all wrong on paper. `thead` repeats on every printed page by the platform's own rule once the family stops fighting it, so the print block releases the scroller's height and the sticky offsets.              |
