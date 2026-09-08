# Select search and pointer affordance — capability inventory

Follow-up pass on the `select` / `combobox` pair. Two items were invoked: the
pointer cursor on every interactive surface of both families, and an opt-in
search inside `select`.

## Surveyed

Read 2026-09-08. Each row records what the implementation ships for a select
whose list is too long to scan, and what cursor its options wear.

| Implementation | Search in a select | Where the query is typed | Match highlight | Option cursor |
| -------------- | ------------------ | ------------------------ | --------------- | ------------- |
| Ant Design `Select` | `showSearch` | in the control | no | `pointer` |
| Mantine `Select` | `searchable` | in the control | no | `pointer` |
| PrimeNG `p-select` | `[filter]="true"` | in the popup, first row | no | `pointer` |
| PrimeReact `Dropdown` | `filter` | in the popup, first row | no | `pointer` |
| ng-select | `searchable` (default on) | in the control | `ng-option-marked` | `pointer` |
| Vuetify `v-select` | via `v-autocomplete` | in the control | `v-list-item-title` mask | `pointer` |
| Semantic UI `Dropdown` | `search` | in the control | no | `pointer` |
| Radix `Select` | none | — | — | `default` |
| Base UI `Select` | none | — | — | `default` |
| Ark UI `Select` | none | — | — | `default` |
| React Aria `Select` | none, defers to `ComboBox` | — | — | `default` |
| Headless UI `Listbox` | none, defers to `Combobox` | — | — | unstyled |

Two readings come out of the table.

**Search.** Seven of twelve ship it on the select itself; the five that decline
are the headless four and Radix, and each of those five publishes a separate
combobox and tells the reader to reach for it. This library publishes that
combobox too — and it is the family a reader **types a value into**. A select
with a hundred known options is a different case: the reader is choosing, not
authoring, and sending them to a family whose typed text is a contract makes
them own an `inputValue` they never wanted.

**Cursor.** Nine of twelve draw `pointer` on an option; the three that draw
`default` are Radix, Base UI and Ark, all three following the native `select`,
whose popup is drawn by the operating system and is not a web surface at all.
This library refused the native element for that exact reason, and then kept
the cursor the refusal was about.

## Table stakes

| Capability | Where it stands |
| ---------- | --------------- |
| `pointer` on the select trigger | **Gap.** `cursor: default`, against `button/button.css`, which draws `pointer` on every button in the library. |
| `pointer` on an option in either popup | **Gap.** `cursor: default` in both stylesheets. |
| `pointer` on the combobox trigger and clear | Shipped. |
| `not-allowed` on a disabled control | Shipped in both. |
| `progress` while the popup is loading | Shipped in both. |
| Filtering compared the way the locale compares | Shipped in `packages/core/src/collection/filter.ts`, consumed by `combobox` alone. |
| Marked spans on a matched label | Shipped as `combobox`'s `match` part, from `splitByMatch`. |
| A live count of what survived a filter | Shipped as `combobox`'s `status` row. |
| An empty row when a filter matches nothing | Shipped in both. |

## Differentiators

| Capability | Decision |
| ---------- | -------- |
| Search inside the popup rather than in the control | **Adopt.** PrimeNG and PrimeReact put it there; it is the only placement that keeps the feature guide's promise that a select takes no typed value, and the only one a reader can tell apart from `combobox` at a glance. |
| The same collator, the same `match` part, the same `<mark>` | **Adopt.** The pair already shares `data-current`, `aria-selected` and `data-part='item'`; a second highlight mechanism would be a second thing to explain. |
| Two-step `Escape`: clear the query, then close | **Adopt.** ng-select and PrimeNG both clear first. A reader who typed four characters and wants the whole list back has no other key. |
| A printable character on a closed searchable select seeds the query | **Adopt.** The pattern already asks that a printable key open the popup; typeahead is what it seeds when there is no search field, and the query is what it seeds when there is. |
| The query is cleared on commit | **Adopt.** Ant, Mantine and PrimeNG all clear it. Under `multiple` the popup stays open, and a list still filtered to one row after the reader took that row is a list that looks broken. |
| A clear button inside the search row | **Decline.** It would be the only focusable element in the layer besides the field, and the layer's `Tab` is already spent returning to the trigger. `Escape` clears, and the row says so through its placeholder. |
| Ranking or fuzzy matching | **Decline.** `filter` is an adapter, as it is in `combobox`; a consumer who wants a rank writes one function. |
| Remote search, debounce | **Decline.** Already declined for `combobox` in the same session and for the same reason: a family that delayed its own request would drop characters from a controlled consumer. `loading` and `filter={null}` are what a server-filtered select sets. |

## Gaps

Everything under **Differentiators** marked _Adopt_, plus the two cursor rows
under **Table stakes**, is new in this pass. Nothing already shipped is dropped.

`docs/component-features.md` §6 currently ends the Select paragraph with "Não
inclui entrada de texto livre. Grande volume ou busca explícita usa Combobox."
The first sentence still holds and this pass does not touch it: the control
takes no text, and nothing the reader types here becomes a value. The second
sentence is amended in the same commit, because a paragraph that routes every
long list to another family contradicts the family this pass ships.
