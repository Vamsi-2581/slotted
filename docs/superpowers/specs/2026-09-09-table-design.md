# Table design

Decisions taken before the family was written, from
`docs/superpowers/specs/2026-09-09-table-capability-inventory.md`. The family is
new. Every decision below is the one the contract, the stylesheet and both
bindings are held to; where a decision costs something, the cost is written next
to it rather than left for a reader to find.

---

## 1. What the family is, and what it is not

`docs/component-features.md` §12: a semantic table for moderate tabular data —
caption, columns, rows, header and footer, alignment by type, empty and loading
states — where "ordenação simples, seleção e ação de linha podem ser
capabilities, mas não justificam transformar toda Table em Data Grid".

So the line between this family and `data-grid` (wave 8) is drawn once, and it
is the ARIA role rather than a feature count:

- a **table** is a static structure. Its cells are not focusable, it is not a
  composite widget, and every control inside it is its own tab stop;
- a **grid** is a composite widget with a cell cursor, one tab stop, and arrow
  keys that move focus between cells.

This family is the first. Column resizing, virtualisation, multi-column sort and
row-level activation are the four capabilities that need the second, and the
inventory defers all four to it by name.

## 2. Pattern, sourced

Read on 9 September 2026 from the rendered page and from
`content/patterns/table/table-pattern.html` in `w3c/aria-practices`, so the text
quoted is the source rather than the page's summary.

- Pattern: <https://www.w3.org/WAI/ARIA/apg/patterns/table/>
- Example with sorting:
  <https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/>
- Practice for the properties:
  <https://www.w3.org/WAI/ARIA/apg/practices/grid-and-table-properties/>
- Platform: <https://html.spec.whatwg.org/multipage/tables.html> §4.9

### 2.1 Keyboard

The pattern has no keyboard interaction section, and that is the finding rather
than an omission: "Like an HTML `table` element, a WAI-ARIA `table` is a static
tabular structure … it is not an interactive widget. Thus, its cells are not
focusable or selectable." And: "Since a table is not a widget, each widget
contained in a table is a separate stop in the page tab sequence."

Every key this family answers therefore belongs to the platform, and the
contract records it with `source: "platform"`:

| Key                             | Effect                                                                                       | Focus after                    |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| `Tab`                           | Moves to the next control: the scroll region while it overflows, then each sort button, selection checkbox, expander and consumer control in DOM order | that control                   |
| `Shift+Tab`                     | The same, backwards                                                                          | the previous control           |
| `Enter`                         | Activates the focused button: sorts the column, or opens and closes a row's detail            | stays on the control           |
| `Space`                         | Activates the focused button; on a checkbox, changes the selection of that row                | stays on the control           |
| `Shift+Space`, `Shift`+press    | On a row's checkbox, selects every row from the anchor to this one                            | stays on the control           |
| `ArrowDown` / `ArrowUp`         | Scrolls the region while it holds focus                                                       | stays on the region            |
| `ArrowLeft` / `ArrowRight`      | The same, along the inline axis, mirrored in a right-to-left document                          | stays on the region            |
| `PageDown` / `PageUp`, `Home` / `End` | Scroll the region by a view, or to either end                                            | stays on the region            |

The one departure is `Shift+Space` and `Shift`+press, and §5 records its cost.

### 2.2 Roles, properties and states

| Requirement                                                    | Who satisfies it              | Where                                                         |
| -------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------- |
| `table`, `row`, `rowgroup`, `columnheader`, `rowheader`, `cell` | the platform                  | `table`, `tr`, `thead`/`tbody`/`tfoot`, `th`, `td`             |
| The header–cell relationship                                   | the platform, through `scope` | `scope="col"` on a column header, `scope="row"` on a row header |
| Accessible name                                                | the family                    | `caption`, referenced by `aria-labelledby` on the `table`      |
| Description                                                    | the consumer                  | `aria-describedby` passes through untouched                    |
| `aria-sort` on the sorted header, and on no other              | the family                    | written on the `th`, removed when the sort moves               |
| `aria-rowcount` / `aria-rowindex`                              | the family                    | only when the consumer states a total larger than the DOM      |
| `aria-colcount` / `aria-colindex`                              | declined                      | §5: the family never renders a subset of the columns           |
| `aria-busy` while loading                                      | the family                    | on the `table`                                                 |
| `aria-expanded` / `aria-controls` on the expander              | the family                    | borrowed from the Disclosure pattern                           |
| `aria-selected` on a selected row                              | declined                      | §5: the row is not selectable under this role; the checkbox is |
| A scrollable region reachable by keyboard                      | the family                    | `role="region"` and `tabindex="0"` **while it overflows**      |

## 3. Anatomy

The root is the frame and the scroller is one element in. Both boxes are needed
and each answers a different question: `position: sticky` resolves against the
nearest scrolling ancestor, which is the scroller either way, while what the
root holds is everything that must **not** move when the table is scrolled
sideways — the border, the radius, the clip, and the footer bar where a paged
listing puts its control. Read the other way round, with the root scrolling, a
framed table and its pagination were two boxes with a seam between them and the
consumer had to draw the frame themselves. `prose` makes the same division for
the same reason.

| Part            | Element               | Always present | What it is                                                                     |
| --------------- | --------------------- | -------------- | ------------------------------------------------------------------------------ |
| `root`          | `div`                 | yes            | The frame. Carries `data-ui` and every axis                                    |
| `scroll`        | `div`                 | yes            | The scroller, and the region wiring while it overflows                         |
| `table`         | `table`               | yes            | The tabular structure itself                                                   |
| `caption`       | `caption`             | no             | The table's name, visible or visually hidden                                   |
| `head`          | `thead`               | no             | The header row group; sticky when the axis says so                             |
| `body`          | `tbody`               | yes            | The rows                                                                       |
| `summary`       | `tfoot`               | no             | The column summaries, which is the HTML Standard's own word for a `tfoot`'s rows |
| `footer`        | `div`                 | no             | The bar under the table and inside the frame: pagination, a count, a page size |
| `row`           | `tr`                  | yes            | One record. Carries `data-selected` and `data-expanded`                        |
| `column-header` | `th[scope="col"]`     | no             | A column's name. Carries `aria-sort` when it is the sorted one                 |
| `row-header`    | `th[scope="row"]`     | no             | The cell that identifies the record, which a screen reader repeats             |
| `cell`          | `td`                  | yes            | One value. Carries the alignment and the text treatment                        |
| `sort`          | `button`              | no             | The control inside a column header, wrapping its text                          |
| `column-actions`| `span`                | no             | The slot beside a column's name for the controls it carries: a filter trigger, a column menu, a help hint |
| `selection`     | `th` or `td`          | no             | The cell holding the checkbox, in the header and in every row                  |
| `expander`      | `button`              | no             | Opens and closes one row's detail                                              |
| `detail`        | `tr` with one `td`    | no             | The open row's detail, spanning every column                                   |
| `empty`         | `td` spanning the row | no             | What is shown when there is nothing: takes a `result-state`                    |
| `loader`        | `tbody`               | no             | Skeleton rows during a first load                                              |

Multi-level headers need no part: a second `row` inside `head` with the
platform's own `colspan` and `rowspan` is the whole feature, and both bindings
pass those through.

### 3.1 The listing screen, and where it stops

This family is what a listing screen reaches for, so the boundary is worth
stating in the terms that screen uses rather than in ARIA's.

Buildable with `table` and the families beside it: sorting, selection with bulk
actions in an `action-bar`, an identifier column pinned to the leading edge, an
actions column pinned to the trailing one, a filter or a menu inside a column
header, a filter bar above in `toolbar`, paging in `pagination`, sticky header,
density, empty and loading.

Not buildable, and the four are the same four §1 defers: resizing a column,
windowing thousands of rows, ordering by two keys at once, and moving between
cells with the arrow keys. A screen that needs one of those needs the grid
pattern, and `data-grid` is where it lives.

The `column-actions` part exists because of the first list. The control a
listing screen puts in a header — a filter trigger, a column menu — has to sit
inside a cell this family lays out, and with the sort control filling the header
there was nowhere for it to go: a consumer would have had to reach past the
family for a button that cannot live anywhere else. The slot holds the control
and none of its state; a typed rule set is `filter-bar`'s, and a table that
owned one would own the query.

Its room is stated rather than measured — one target at the WCAG minimum by
default, retuned with `--slotted-table-column-actions-size` — for the reason
`listbox` states its column count: measuring would mean reading the layout
during render, and a number both the design and the keyboard can see is one they
cannot disagree about.

The header stays a table cell. `display: flex` on a `th` takes it out of the
table's formatting context and the browser wraps it in an anonymous cell; read
at the gate, two flex headers stacked into one column and took the table's
geometry with them. The slot is positioned against the cell instead.

The `footer` part exists for the same reason and answers the other half of the
screen. Every surveyed implementation that pages draws the control attached to
the table — Carbon and Ant render it themselves, Material puts `MatPaginator` in
the same card — and a control floating under a framed box reads as a defect. It
is a sibling of the scroller rather than a child, so a table scrolled sideways
does not take its pagination with it; that is what put the frame outside the
scroller.

The bar gives its last item the room that is left, and that is not a preference:
`pagination` answers its own inline size, and an element with
`container-type: inline-size` contributes no intrinsic width. Dropped into a bar
that shrink-wrapped its children it resolved to nothing, hid its page list under
its own 22rem query and left two chevrons in an empty row —
`references/stories.md` records the same trap for the story stages. So the bar
states the room instead of asking for it.

What stands in the bar is the consumer's own: `pagination` holds the page, the
range and the keyboard; `action-bar` in wave 7 holds the bulk actions. The
family holds the place, the rule above it and the inset around it.

There is one slot rather than two. A bar above was weighed and declined: the
footer had to be a part for two reasons a bar above does not share — pagination
sits flush under the last row with no ground of its own, and it must not scroll
sideways with the table — while a toolbar stands on its own ground and the
page's own stack places it. The naming cost decided it: this anatomy already
holds `head` for the `thead`, and `head` beside `header` is the pair a reader
mistypes. If `action-bar` in wave 7 finds the seam is real, the slot is added
there and the name is decided once.

## 4. State

Three mutable values, three models. Each is controlled or uncontrolled, decided
once, through `@slotted/core/state`.

| Capability  | Controlled | Uncontrolled     | Request           | Reasons                                       |
| ----------- | ---------- | ---------------- | ----------------- | --------------------------------------------- |
| `sort`      | `sort`     | `defaultSort`    | `onSortChange`    | `pointer`, `keyboard`, `clear`, `programmatic` |
| `selection` | `value`    | `defaultValue`   | `onValueChange`   | `pointer`, `keyboard`, `select`, `clear`, `programmatic` |
| `open`      | `expanded` | `defaultExpanded`| `onExpandedChange`| `pointer`, `keyboard`, `programmatic`         |

### 4.1 `sort` is a new word in the shared vocabulary

`specs/contract.schema.mjs` had no capability for "which column the rows are
ordered by, and which way". `selection` is the reader's own choice of records,
`current` is where the reader is, `value` is the text a control holds, and
`measurement` is a quantity the consumer states and the family only draws. None
of them says this.

So `sort` joins `KNOWN_CAPABILITIES` and `MUTABLE_CAPABILITIES`, in its own
commit before the family, as `docs/build-briefing.md` requires of a shared tool
that cannot express the right contract. `data-grid`, `tree-grid` and `pivot-grid`
each hold the same value later, and a family-local word would have been three
families inventing it separately.

### 4.2 The family holds the sort and does not reorder the rows

The descriptor is `{ column, direction }` or `null`. Pressing a sortable header
cycles ascending → descending → none, which is the third state Material and Ant
both ship and Carbon does not; a reader who sorted a column by accident has no
other way back.

The rows are the consumer's own children, so reordering them would mean owning
the data. The family therefore asks, and the consumer applies the descriptor to
its own array or its own query — three lines, on the reference page:

```tsx
const rows = useMemo(() => sortRows(data, sort), [data, sort]);
```

This is what React Aria does with `sortDescriptor` and what Material's
`matSortChange` does before `MatTableDataSource` gets involved. The cost is that
a consumer who wants client-side sorting writes the comparator; the alternative —
a `sorter` per column, which is Ant's shape — is a data model, and a data model
is the line §1 draws between this family and `data-grid`.

`aria-sort` is written on the sorted header and removed from every other, and the
change is announced politely through `@slotted/core/live-announcer`: "Sorted by
Name, ascending". A property that changes silently is a change no reader hears,
and none of the six surveyed implementations announces it.

### 4.3 Selection is the shared reducer, and the checkbox is the `checkbox` family

`nextSelection` from `@slotted/core/collection` already implements toggle,
replace, range, all and clear for `listbox`, `select`, `combobox` and `tree`. A
second reducer here would be a second definition of what `multiple` means.

The rows carry `data-selected`; the checkbox announces it. `list-item` recorded
the rule this follows — a chooser of its own would be a second answer to the
question `checkbox` already owns — and this family goes one step further than
`list-item` because it holds the set: the header checkbox is `indeterminate`
while some rows are selected, and its accessible name states the count it covers.

`Shift` while pressing a row's checkbox, by pointer or with `Space`, selects
every row from the anchor to that one. The anchor is the last plain press.

### 4.4 Expansion is `open`, and it is a set

The capability is `open` and the state attribute is `data-expanded`, which is the
distinction the vocabulary already draws: `open` is what the value is called and
`expanded` is what a disclosure paints. The detail row is not rendered while it
is closed — nothing is hidden in the DOM, so nothing is announced that a reader
cannot reach — and the expander says `aria-expanded="false"` in that state,
which is what the Disclosure pattern requires.

## 5. Declined, with the cost

| Declined                                    | Instead                                                       | Cost                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `role="grid"` and a cell cursor             | the `table` role                                              | A table with twelve controls is twelve tab stops. The APG says so explicitly, and `data-grid` is the family that fixes it by being a composite widget. |
| `aria-selected` on the row                  | the row's own checkbox                                        | The selection is announced when the checkbox is reached rather than when the row is. Under this role a row is not selectable, and writing the property would be a promise the role breaks. |
| `aria-colcount` / `aria-colindex`           | nothing                                                        | Only a family that renders a subset of its columns needs them, and this one never does — the consumer writes every column it wants. `column-manager` in wave 8 removes columns from the data, not from a window over it. |
| Row-level activation                        | a `link` in the row header cell                               | A consumer who wants the whole row clickable writes a handler and loses the keyboard equivalent. The composition that keeps it is one link in the cell that names the record. |
| Multi-column sort                           | `data-grid`                                                    | ARIA cannot state a sort level, so a second sorted column would be either silent or a lie. |
| A `size` axis                               | the density axis                                              | A consumer who wants one small table inside a comfortable page sets `data-density` on the region rather than a prop on the table. |

## 6. Axes

| Axis           | Values                          | Where       | Default   |
| -------------- | ------------------------------- | ----------- | --------- |
| `variant`      | `plain`, `ruled`, `framed`      | root        | `ruled`   |
| `striped`      | `true`, `false`                 | root        | `false`   |
| `stickyHeader` | `true`, `false`                 | root        | `false`   |
| `selectionMode`| `none`, `single`, `multiple`    | root        | `none`    |
| `layout`       | `auto`, `fixed`                 | root        | `auto`    |
| `align`        | `start`, `center`, `end`        | cell        | `start`   |
| `numeric`      | `true`, `false`                 | cell        | `false`   |
| `text`         | `wrap`, `truncate`, `nowrap`    | cell        | `wrap`    |
| `sticky`       | `start`, `end`                  | cell        | unset     |

`numeric` is separate from `align` because they are two facts: a number is set in
tabular figures whichever way it is aligned, and a right-aligned label is not a
number. Setting `numeric` aligns to `end` unless `align` says otherwise, which is
the one inference in the family and the consumer's explicit value still wins.

`layout: fixed` is `table-layout: fixed`, and it is what makes a column's stated
width hold and a `truncate` cell truncate at all. Under `auto` the browser sizes
columns from their content, which is right for a table of names and wrong for a
table with one column of hashes.

## 7. Density, tokens and the picture

The row reads `--slotted-control-height-*` for its minimum height, the cell reads
`--slotted-control-padding-inline-*` for its inset and `--slotted-control-font-size-*`
for its type — the three scales the theme restates per density. `list-item`
recorded the same decision for the same reason: one theme decision retunes the
rows and the buttons together, and a family-owned scale would be a second answer.

`PROJECT-PRD.md` §8 and §13.1 name `table.row.height` and
`table.row.hover.background` as the two decisions an application retunes. Both
are family tokens over foundation values — `--slotted-table-row-min-block-size`
and `--slotted-table-row-surface-hover` — so the PRD's example is answerable
without a new step in any theme scale.

The sort indicator is a mask from `--slotted-icon-chevron-down`, rotated a half
turn for ascending. An unsorted sortable column draws the same mark at
`--slotted-text-muted` and reveals it on hover and focus, so the column says it
can be sorted without a second glyph in the foundation. The cost is that a
pointer is what discovers sortability first; the button's accessible name says it
either way, and the mark is drawn permanently on the sorted column.

Stripes are painted under the state colours, never over them: `states.test.mjs`
holds the precedence, and a striped row that is selected reads as selected.

Four things the first captures were wrong about, each with the cause rather than
the correction alone:

- **The sort mark sat at the top of its line.** The control is a flex box and
  the mark states its own block size, so the default `stretch` resolved to
  `flex-start`. It is centred on the text now.
- **The expander sat at the top of its own box**, for the neighbouring reason:
  `place-content` aligns lines, and a single-line flex container has one, so the
  item fell back to `align-items: stretch`. Both axes are stated separately now.
- **The expander stood two pixels under the identifier it opens**, because the
  24-pixel target is taller than the 19.5-pixel line it stands beside. It is
  pulled back onto that line with a negative block margin of exactly the
  overshoot, which the cell's own inset absorbs — so the row is still measured
  by its text.
- **The controls read as scattered.** With the sort mark set immediately after
  the name it landed at a different distance in every column, and beside a
  filter trigger pinned to the trailing edge the pair read as two unrelated
  marks. The name now sits at the leading edge and every control at the
  trailing one, so the header row is one line of triggers on the column
  boundaries — the arrangement Ant and Carbon ship. An aligned column keeps its
  name over its values and the mark follows the name.

Hover on the header band goes **darker**. The band is a tinted ground and the
step every neutral row hovers with is lighter than it, so a hovered header was a
pale hole rather than a control answering the pointer; the value is mixed from
the ink, as the stripe is.

The band itself is mixed too, and for a reason the second reading found: taken
from `--slotted-tone-secondary-surface` it was both too blue and too dark in
light. That tone is calibrated to enclose a chip, and a chip is a few characters
wide; a band that runs the width of the page needs a fraction of the same idea.
Mixed from the ink at 8% it stays neutral, keeps its direction in every scheme —
darker than the page in light, lighter in dark — and sits one step above the
stripe, which is the same mix at 5%. In `high-contrast` it also gives the header
a ground it did not have, at 17:1 against the text, where before it was white on
white and carried only by its rule.

Both header controls take the **hand**. A sortable header is a control and a
target that does not say so is one a pointer reader finds by accident; `select`
restored the same cursor to its trigger and its options.

The control in the `column-actions` slot is drawn by this family rather than
taken from `button`. A library button at its smallest step is thirty pixels tall
against a line of nineteen and a half — the control scale is right for a control
in a form and wrong for a mark in a header — and its ghost hover is lighter than
this band. So the slot's button takes the expander's geometry, the header's own
darker hover, and the family's glyph size for whatever artwork the consumer puts
in it. The consumer keeps the behaviour: what the trigger opens is their popover
or their menu.

The corner where a sticky header meets a sticky column is one rule rather than
two: a `th` that is both takes both offsets and the higher stacking step, stated
once.

Under `@media print` the scroller releases its height and its sticky offsets, so
the platform's own rule — a `thead` repeats on each printed page — applies
instead of being fought.

## 8. React

| Question                                                                    | Answered by                                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Controlled and uncontrolled pair, plus a request carrying a reason           | Three pairs: `sort`/`defaultSort`/`onSortChange`, `value`/`defaultValue`/`onValueChange`, `expanded`/`defaultExpanded`/`onExpandedChange` |
| Defaults set once for the application                                       | `TableDefaultsProvider` and `useTableDefaults`, carrying `variant`, `striped`, `stickyHeader`, `layout`, `selectionMode` and the family's labels |
| Substituting the rendered element of a part                                 | `render` on `Table`, `TableRow`, `TableCell`, `TableColumnHeader`, `TableSort` and `TableExpander`; `caption`, `head`, `body` and `foot` are fixed because their element is what places them |
| The consumer's own handler still running                                    | Composed, never replaced: the family calls the consumer's `onClick` and `onKeyDown` first and does nothing when it was prevented |
| Reaching the native element and the imperative action                       | `ref` on every part, and `scrollToRow(key)` on the root's handle — the one action a consumer cannot express declaratively |
| Server rendering without a hydration mismatch                               | `useId` for the caption and the detail relationships; the overflow measurement runs in an effect, so the region wiring appears after the first paint rather than during render |
| Every state a consumer may style, in the DOM                                | `data-selected`, `data-expanded`, `data-disabled`, `data-loading`, `data-sorted`, plus `data-align`, `data-text`, `data-sticky`, `data-numeric` |
| Props types are the native element's, extended                              | `ComponentPropsWithRef<'div' \| 'table' \| 'tr' \| 'th' \| 'td' \| 'button'>` per part                              |

`TableSelect` and `TableSelectAll` render the library's own `Checkbox`, wired to
the family's selection. It is the same family a consumer would reach for, so
nothing is duplicated and `render` still substitutes it.

## 9. Angular

| Question                                                        | Answered by                                                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| A two-way value in the shape the ecosystem expects               | `model()` for `sort`, `value` and `expanded`; `output()` for `sortChange`, `valueChange` and `expandedChange`, each carrying a reason |
| A control that belongs in a form                                 | `ControlValueAccessor` on the root for the selection, so a bulk-action screen is a reactive form. Material's table has no forms integration at all |
| Defaults set once for the application                            | `SL_TABLE_DEFAULTS` and `provideTableDefaults()`                                                                                 |
| A template reaching the instance                                 | `exportAs` on every directive: `slTable`, `slTableRow`, `slTableSort`, `slTableSelect`, `slTableExpander`                        |
| Substituting projected content, kept lazy                        | The root is a component that draws the `table` and projects everything else; the detail row uses `NgTemplateOutlet`, so a closed detail is not built |
| Zoneless change detection and `OnPush`                           | Signals throughout, `computed` for every derived value, no `markForCheck`                                                        |
| Every subscription and listener torn down                        | `takeUntilDestroyed` and `DestroyRef` for the `ResizeObserver` behind the overflow measurement                                   |
| A static attribute surviving the host bindings                   | `HostAttributeToken` for `data-part` and `role`, read before either is written                                                   |
| An entry point others depend on staying a single class           | Imported through `@slotted/angular/checkbox` for the selection control, never by path                                            |

The asymmetry is deliberate and recorded: React ships `TableSelect`, a component
that renders a wired `Checkbox`; Angular ships `slTableSelect`, a directive the
consumer puts on the `input[slCheckbox]` they already write. Levelling the two
down to one shape would take the `ControlValueAccessor` away from Angular and the
composition away from React.

## 10. What a wrong answer costs

At the visual gate, the anatomy and the picture are what is cheap to change. The
root being the scroller decides where the border, the radius and the sticky
offsets live, and moving it afterwards moves every one of them. `numeric` being
a separate axis from `align` decides two attributes in every binding and every
demonstration. The sort indicator being a rotated chevron rather than a new glyph
decides whether the foundation gains a token that four later families would
inherit.
