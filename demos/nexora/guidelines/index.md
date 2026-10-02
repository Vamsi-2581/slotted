# Index

Every active rule, one line each. Load this first; load a topic file when the
task matches its `triggers`.

| ID    | Level  | Rule                                                                                                                                                                          | File                   |
| ----- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| AF-01 | MUST   | A region whose first answer has not arrived shows its pending state; the empty state waits for an answer of zero items                                                        | `async-feedback.md`    |
| AF-02 | SHOULD | A region with no items draws placeholders; a region showing items keeps them and marks itself busy                                                                            | `async-feedback.md`    |
| AF-03 | MUST   | The control that starts a request is in its `loading` state until the answer: refuses activation, shows the indicator                                                         | `async-feedback.md`    |
| AF-04 | SHOULD | A change of view or page removes the rows on screen and draws placeholders until the answer                                                                                   | `async-feedback.md`    |
| AF-05 | MAY    | A control's indicator may be delayed by the family's loading delay; a region's placeholders never are                                                                         | `async-feedback.md`    |
| LA-01 | SHOULD | A pager under a paged region is aligned to the end of the line                                                                                                                | `layout-alignment.md`  |
| LA-02 | MUST   | A consumer's row in the column's pinned parts reads the row inset and starts with a mark column                                                                               | `layout-alignment.md`  |
| SC-01 | MUST   | Below the bar's medium step the magnifier opens the palette; the search region never expands over the bar                                                                     | `shell-composition.md` |
| SC-02 | MUST   | A layer-only component host inside the banner contributes no box to the banner's row                                                                                          | `shell-composition.md` |
| SC-03 | SHOULD | A popover around a query container states the content's inline size and block cap on the content                                                                              | `shell-composition.md` |
| SC-04 | SHOULD | The search region carries one space step of leading margin when it follows the brand directly                                                                                 | `shell-composition.md` |
| SC-05 | SHOULD | Below the bar's high step a product's own `action` leaves the bar; the bar holds the search toggle, the bell, the help and the account                                        | `shell-composition.md` |
| LA-03 | SHOULD | Below the header's narrow step the actions beside a plain title stay on its line: icon-only, or a toolbar that folds                                                          | `layout-alignment.md`  |
| SC-06 | SHOULD | Where the primary input is a touch screen, a shortcut drawn as a hint is not shown                                                                                            | `shell-composition.md` |
| LA-04 | SHOULD | Tabs that change the page's content stand in the header's `tabs` slot, not in the body                                                                                        | `layout-alignment.md`  |
| LA-05 | MUST   | Fields on one line align to the start of the block axis, so every control and the line's button share one top and height whatever stands under them                           | `layout-alignment.md`  |
| CP-01 | MUST   | Before writing an element beside a family, its anatomy is read; a slot the family names for it is where it stands                                                             | `composition.md`       |
| LP-01 | SHOULD | Below 600 pixels, or on a touch screen below 1024, a grid shows the selection column, the row header and the columns of highest priority; the rest move into the row's pop-in | `list-pages.md`        |
| LP-02 | SHOULD | Search, filter pills and saved views stand in one `filter-bar` above the grid; the header keeps the title and the actions that create or leave the list                       | `list-pages.md`        |
| LP-03 | SHOULD | A selection's actions stand in an `action-bar` in the page footer, open while the selection is not empty; on a phone the mutations alone                                      | `list-pages.md`        |
| LP-04 | MUST   | A value longer than its column truncates with its title; a cell template carries the cut, the title and the value's own maximum; the row never grows with a value             | `list-pages.md`        |
| LP-05 | SHOULD | The filter bar states the count of the query and of the tenant; the pager states the range; the grid's own range is off; no page size on a phone                              | `list-pages.md`        |
| LP-06 | SHOULD | A change of query empties the rows before the request; a mutation read back keeps them under the grid's loading state                                                         | `list-pages.md`        |
| RP-01 | SHOULD | A record's title row holds its visual, name, two small `tag` marks (state, health) and one subheading (identifier · owner · place); the way back is the header's `back` part  | `record-pages.md`      |
| RP-02 | SHOULD | A record's figures are `stat-card`s in a grid at the top of the body, on every section; not in the header's collapsible area                                                  | `record-pages.md`      |
| RP-03 | SHOULD | Related records are the header's tabs with counts; each a `table` with a caption (a `timeline` for activity); fixed layout on a phone                                         | `record-pages.md`      |
| RP-04 | MUST   | A missing record keeps the header and the way back and answers with the page's own `result-state`; the URL stays                                                              | `record-pages.md`      |
| CP-02 | MUST   | Siblings of the page's own stand in `inline` or `stack` with a space-scale gap; text of the page's own takes the typography family's size                                     | `composition.md`       |
| FM-01 | SHOULD | A create form stands on its own route under the list it returns to; the way back is the header's `back` part                                                                  | `forms.md`             |
| FM-02 | MUST   | A control is named as the backend names the field, and the error map is keyed by that name                                                                                    | `forms.md`             |
| FM-03 | MUST   | One error map feeds the form's summary and each field's message; a refusal is never a toast alone                                                                             | `forms.md`             |
| FM-04 | SHOULD | A value a permission lets the reader see and not change is a read-only field, not an absent one                                                                               | `forms.md`             |
| FM-05 | SHOULD | A create form's draft lives in the screen's store: leaving and returning finds it; a successful create empties it                                                             | `forms.md`             |
| FM-06 | MAY    | An optional group of fields stands behind a checkbox that opens it, and its fields are required while it is open                                                              | `forms.md`             |
| FM-07 | SHOULD | A record's facts are edited in the section they are read in; header, figures and tabs stay                                                                                    | `forms.md`             |
| FM-08 | MUST   | A stale version is answered field by field: what moved, what the form holds, and two ways out                                                                                 | `forms.md`             |
| FM-09 | SHOULD | An edit carries the fields whose value moved since the form opened, not the whole form                                                                                        | `forms.md`             |
| RP-05 | SHOULD | The action that adds to a tab stands in the record header's toolbar while that tab is open                                                                                    | `record-pages.md`      |
| CP-03 | MUST   | A track holding a family that scrolls states a zero minimum, so the family's scroller scrolls                                                                                 | `composition.md`       |
| LP-08 | SHOULD | Every number on a list page names what it counts, in the words the families draw                                                                                              | `list-pages.md`        |
| FM-10 | MUST   | Partial success reports both counts and one line per refused record, with its position and reason                                                                             | `forms.md`             |
| CP-04 | MAY    | Where the anatomies answer no part of the problem, the screen composes its own element instead of bending a family                                                            | `composition.md`       |
| CP-05 | MUST   | An element of the page's own paints only with the theme's tokens; a literal colour, type size or gap is a defect                                                              | `composition.md`       |

| ER-01 | MUST | A refusal is classed — conflict, transport, permission, state — and the class is what the screen says | `errors-and-conflicts.md` |
| ER-02 | MUST | A conflict re-reads the record before the message, and the message says it has | `errors-and-conflicts.md` |
| ER-03 | MUST | The version a command carries is the number the page read, never one taken from a held answer | `errors-and-conflicts.md` |
| ER-04 | SHOULD | A conflict and a transport failure carry different tones and different next steps | `errors-and-conflicts.md` |
| RP-06 | SHOULD | A record with a lifecycle shows where it stands, and what that step waits on, above its contents | `record-pages.md` |
| CP-06 | SHOULD | A state the family already draws is stated once; no louder axis and no second mark beside it | `composition.md` |
| CP-07 | SHOULD | A list page is `bleed` with `fill`; records and overviews `wide`; forms `content`; prose preferences `measure` | `composition.md` |
| BR-01 | SHOULD | A branch chosen in a tree is the list's place — its heading and its trail — and never one of the bar's pills | `browsing.md` |
| BR-02 | MUST | A place covers the branch and everything under it, and the page states how many nodes that is | `browsing.md` |
| BR-03 | MUST | A node's own count and its branch's count are two numbers, and the row says which it draws | `browsing.md` |
| BR-04 | SHOULD | One concept at two grains is two lists with their own filters, and each names the other | `browsing.md` |
| PM-01 | MUST | A value a permission blanks is absent from the model, not hidden in it and not drawn as a zero | `reading-permissions.md` |
| PM-02 | SHOULD | What a permission withholds is named once, with the permission and the roles that hold it | `reading-permissions.md` |
| RP-07 | SHOULD | A table that takes a figure apart ends in the summary row that adds it back up | `record-pages.md` |
| RP-08 | SHOULD | A figure over records that share no unit counts records; a quantity is summed only under one unit | `record-pages.md` |
| AF-06 | SHOULD | Placeholders once painted are held for the application's own minimum, so no region blinks | `async-feedback.md` |
| AF-07 | SHOULD | A record or list another actor changes offers Refresh in the header's actions; the refresh keeps the values and marks the page busy | `async-feedback.md` |
| FM-11 | MUST | A threshold the backend enforces is applied as the reader types: the field becomes required and says why, before the submit | `forms.md` |
| FM-12 | SHOULD | A form written in place is a query parameter: the back gesture closes it, and a save leaves the history as it came | `forms.md` |
| RP-09 | SHOULD | A step waiting on a decision the reader cannot give names who gives it, and no control is drawn for the command it gates | `record-pages.md` |
| OV-01 | SHOULD | Every figure of an overview opens the list it counts, with its condition as the bar's own pills | `overviews.md` |
| OV-02 | SHOULD | Below 600 pixels an overview's figures are a list of doors, followed by what to act on, the work in flight, the charts and the history | `overviews.md` |
| OV-03 | SHOULD | A comparison chart over a scope of one category is not drawn; one sentence states its numbers | `overviews.md` |
| LG-01 | SHOULD | A ledger row states the signed change, its cause as words that lead to the record or to what it moved, the place, the time and the actor; never a raw id | `ledgers.md` |
| LG-02 | SHOULD | A running balance is drawn only where the ledger is one item in one place, walked back from its current quantity | `ledgers.md` |
| PM-03 | MUST | A price paid to a supplier is a cost: order totals, unit costs and spend are read under the cost permission on every screen | `reading-permissions.md` |
| LP-09 | SHOULD | A queue with no endpoint is the list of the records its work is written against, narrowed by the states that make the work, as the page's place | `list-pages.md` |
| LP-10 | SHOULD | A chart about a filling list's records is the header's second tab, never a block above the list | `list-pages.md` |
| FM-13 | MUST | A submission that will wait on an approval states the steps, the roles and each reason before it is sent, and its control says it asks for approval | `forms.md` |
| FM-14 | SHOULD | A quantity split into destinations states, before the confirm, what each destination receives and what the record becomes | `forms.md` |
| RP-10 | SHOULD | A score is compared with its peers' median and says what it counts; a score with nothing behind it is not drawn as a number | `record-pages.md` |
| LP-11 | SHOULD | Where the primary input is touch, the list tools leave out the density, which the theme makes a no-op, and keep sort, views and columns on one line | `list-pages.md` |
| LP-12 | MUST | One scroller: from 600 pixels the grid fills the body and scrolls its rows; below 600 the page scrolls and the grid is as tall as its rows | `list-pages.md` |
| RP-11 | MUST | A command whose authority depends on an amount states the authority the current value needs, in the policy's unit, before any control, and is drawn only in that authority's form | `record-pages.md` |
| RP-12 | SHOULD | A document with no destination lives under the destination whose records it changes, before its record address, and those records link to it | `record-pages.md` |
| FM-15 | SHOULD | An action no command writes is written through the record that says the same, with a prefix naming its document, and read back by it | `forms.md` |
| FM-16 | SHOULD | A date entered in a form is a `date-picker` with the backend's limits; a `date-field` alone is not used in a form | `forms.md` |
| OV-04 | SHOULD | Thresholds are stated in words beside the figures, and a crossed figure says so in its comparison line | `overviews.md` |
| OV-05 | SHOULD | A chart is `card` only as one of two or more peer tiles with no section heading; the body of a titled section or a tab stays `plain` | `overviews.md` |
| WS-01 | SHOULD | Below 600 pixels a three-region workspace shows the queue; a row opens its own address holding the other two regions; the back gesture returns | `workspaces.md` |
| WS-02 | SHOULD | A score a person confirms is a table of its criteria and points ending in the sum, with one band mark and one sentence of thresholds | `workspaces.md` |
