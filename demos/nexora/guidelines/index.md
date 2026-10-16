# Index

Every active rule, one line each. Load this first; load a topic file when the
task matches its `triggers`.

| ID  | Level | Rule | File |
| --- | ----- | ---- | ---- |

| ER-01 | MUST | A refusal is classed — conflict, transport, permission, state — and the class is what the screen says | `errors-and-conflicts.md` |
| ER-02 | MUST | A conflict re-reads the record before the message, and the message says it has | `errors-and-conflicts.md` |
| ER-03 | MUST | The version a command carries is the number the page read, never one taken from a held answer | `errors-and-conflicts.md` |
| ER-04 | SHOULD | A conflict and a transport failure carry different tones and different next steps | `errors-and-conflicts.md` |
| BR-01 | SHOULD | A branch chosen in a tree is the list's place — its heading and its trail — and never one of the bar's pills | `browsing.md` |
| BR-02 | MUST | A place covers the branch and everything under it, and the page states how many nodes that is | `browsing.md` |
| BR-03 | MUST | A node's own count and its branch's count are two numbers, and the row says which it draws | `browsing.md` |
| BR-04 | SHOULD | One concept at two grains is two lists with their own filters, and each names the other | `browsing.md` |
| PM-01 | MUST | A value a permission blanks is absent from the model, not hidden in it and not drawn as a zero | `reading-permissions.md` |
| PM-02 | SHOULD | What a permission withholds is named once, with the permission and the roles that hold it | `reading-permissions.md` |
| OV-01 | SHOULD | Every figure of an overview opens the list it counts, with its condition as the bar's own pills | `overviews.md` |
| OV-02 | SHOULD | Below 600 pixels an overview's figures are a list of doors, followed by what to act on, the work in flight, the charts and the history | `overviews.md` |
| OV-03 | SHOULD | A comparison chart over a scope of one category is not drawn; one sentence states its numbers | `overviews.md` |
| LG-01 | SHOULD | A ledger row states the signed change, its cause as words that lead to the record or to what it moved, the place, the time and the actor; never a raw id | `ledgers.md` |
| LG-02 | SHOULD | A running balance is drawn only where the ledger is one item in one place, walked back from its current quantity | `ledgers.md` |
| PM-03 | MUST | A price paid to a supplier is a cost: order totals, unit costs and spend are read under the cost permission on every screen | `reading-permissions.md` |
| OV-04 | SHOULD | Thresholds are stated in words beside the figures, and a crossed figure says so in its comparison line | `overviews.md` |
| OV-05 | SHOULD | A chart is `card` only as one of two or more peer tiles with no section heading; the body of a titled section or a tab stays `plain` | `overviews.md` |
| WS-01 | SHOULD | Below 600 pixels a three-region workspace shows the queue; a row opens its own address holding the other two regions; the back gesture returns | `workspaces.md` |
| WS-02 | SHOULD | A score a person confirms is a table of its criteria and points ending in the sum, with one band mark and one sentence of thresholds | `workspaces.md` |
| CV-01 | MUST | A conversation scrolls on its own with the composer under it; on a phone the composer sticks to the screen's bottom and the record opens on its last message | `conversations.md` |
| CV-02 | SHOULD | A service-level clock is said in business time with the hour it falls due; passed by how much; paused as stopped; never raw minutes | `conversations.md` |
| CV-03 | SHOULD | A queue is a view of the list's filter bar, counted by the rows it opens on, never a second filter | `conversations.md` |
| RE-01 | SHOULD | A report's figures are flows over its period; a state of today is the overview's own read, said as of today, with the overview's door | `reports.md` |
| RE-02 | SHOULD | A report's period, comparison and filters are its address; a report opened without them takes the last chosen, and the back gesture returns to them | `reports.md` |
| RE-03 | MUST | A period the records are not kept for is not offered, and a measure they do not cover says not kept and from when, never a number | `reports.md` |
| RE-04 | SHOULD | A change names its base value and period; an amount moves by a percentage, a share by points | `reports.md` |
| RE-05 | SHOULD | An anomaly is flagged only by a rule the page states, and the flag opens the records of the range it flags | `reports.md` |
| RE-06 | SHOULD | A report's filters stand in the header's content under its toggle and pin; on a phone the area opens collapsed | `reports.md` |
| RE-07 | SHOULD | Every figure, bar and cell of a report opens the list it counts, with its condition and period as pills and its ids by name | `reports.md` |
| RE-08 | SHOULD | A ranking chart draws at most ten categories and says so; the table under it holds them all and stands last | `reports.md` |
| RE-09 | SHOULD | A report's download is the table on screen, built from the same answer, for every reader of the report | `reports.md` |
| BD-01 | SHOULD | A stored rule reads as When, If, Then, Otherwise, each later condition led by its join in words, before it is edited in place; a reader without edit is shown no editor | `builders.md` |
| BD-02 | SHOULD | A builder states what each structural limit holds and leaves, and disables the control that would cross one with the limit as its reason | `builders.md` |
| BD-03 | MUST | A refusal the backend gives with no node is computed in the browser by the backend's own check and marked at the node before the request | `builders.md` |
| BD-04 | SHOULD | A node's menu and its grip's drag make the same moves and refuse the same places, with the reason said | `builders.md` |
| BD-05 | SHOULD | A nested builder narrows by stepping in one space step per level and stacking a row's controls; it never scrolls sideways | `builders.md` |
| BD-06 | SHOULD | A rule's record opens on what flowed through it, split by volume where the conditions decide, and sets the rule with each step's figure at the end of its line; a run is its trace on the same rule | `builders.md` |
