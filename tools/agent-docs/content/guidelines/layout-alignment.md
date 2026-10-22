---
topic: layout alignment
prefix: LA
triggers:
  [
    pagination,
    pager,
    align,
    alignment,
    right,
    end,
    left,
    start,
    header,
    footer,
    column,
    sidebar,
    nav,
    inset,
    padding,
    row,
    avatar,
    workspace,
    sticky,
    preview,
  ]
families: [pagination, page, page-header, app-shell, side-navigation, list]
---

# Layout alignment

Where a control stands inside the row or region that holds it. The library
sizes each family and publishes the measures a frame's rows stand on; it does
not decide which end of a line a pager takes or that a consumer's header row
inside the navigation column reads the same inset the destinations do.

### LA-01 · The pager stands at the end of the line

Level: SHOULD
Applies to: `pagination` under a `list`, a `data-grid` or any paged region
Rule: A pager under a paged region is aligned to the end of the line.
Why: The reader's eye rests at the end of the last row, where the row actions are; a pager at the start sits under the labels and reads as part of the content.
Do: Align the pager's row to the end. Where a summary of the page ("1–25 of 112") accompanies it, the summary takes the start and the pager the end of the same line.
Don't: Leave the pager at the start of the line because that is where a block begins.
Seen in: Nexora · Notifications page · corrected
Check: Under a paged list, the pager's last control ends on the region's end edge, the edge the rows' actions are inset from.

### LA-02 · Pinned rows of the column write the row inset and the mark

Level: MUST
Applies to: what a consumer places in `app-shell`'s `nav-header` and `nav-footer` — a workspace row, an account row, a status row
Rule: A consumer's row in the navigation column's pinned parts is inset by `--slotted-app-shell-row-inset` and starts with a mark column `--slotted-app-shell-row-mark` wide, the avatar centred in it.
Why: The destinations under it are `side-navigation` rows on the same measures; a header row without them stands on the region's edge and its avatar off the icon column.
Do: Read the two published measures on the row. In the rail the words are hidden and the mark stays centred; in the overlay card the frame adds its own inset and the row's inset stacks on it, as the destinations' does.
Don't: Write a bare avatar and text into the header, or pad the header by a number.
Seen in: Nexora · navigation column header, on the overlay card at phone width · ledger rows "nav-header and nav-footer carry block padding only" and "the overlay layer is a card"
Check: The header's avatar and the first destination's icon share a left edge, in the column, in the rail and in the overlay.

### LA-03 · A phone's header keeps its actions on the title's line

Level: SHOULD
Applies to: what a consumer places in `page-header`'s `actions`, beside a plain title — one heading, no visual, no subheading
Rule: Below the header's narrow step the actions beside a plain title fit on the title's line: a labelled action becomes its icon-only form, and two or more actions stand in a `toolbar` that folds into its menu.
Why: The row wraps when the actions cannot share the line with the title, and a wrapped row under a one-line heading puts the title at the start of one line and the actions at the end of the next, aligned with nothing.
Do: Write the action twice — the labelled control and its icon-only twin with the same accessible name, the same states and the same handler — and show one per side of the header's own container query. Under a rich title (visual, marks, subheading), a `toolbar` that folds into its menu takes a full row of its own under the title and folds only what does not fit; `page-header` places it there.
Don't: Leave a labelled button that wraps, or shrink the control under the touch target to make it fit.
Seen in: Nexora · Notifications page on a phone, "Mark all as read" under the title · corrected
Check: At the narrowest phone width with a coarse pointer, the title and its action share one line; the icon-only control has the labelled control's name.

### LA-04 · A page's views are the header's tabs

Level: SHOULD
Applies to: `tabs` that switch what a page's body shows — views, filters by state, sections of one record
Rule: Tabs that change the page's content stand in `page-header`'s `tabs` slot, not in the body.
Why: The header sticks and its tabs slot is the bottom of it, so the views stay in reach while the list scrolls; tabs in the body scroll away with the first rows and the reader loses where they are.
Do: Place the `tabs` root in the header's `tabs` slot; the family draws the rule under the title area and keeps the row pinned.
Don't: Write the tab strip as the first block of the body with a margin under it.
Seen in: Nexora · Notifications page, All / Unread / Archived scrolled out of view · corrected
Check: Scroll a long list under the header: the tab strip stays visible under the title.

### LA-05 · Controls side by side share their top

Level: MUST
Applies to: fields on one line — a table row of editable cells, an inline group of fields, a grid of fields with an action button — where some carry a line of help or an error and others do not
Rule: Fields on one line are aligned to the start of the block axis, so every control of the line starts at the same height and has the same height whatever stands under it. A button on the line stands on the controls' row, not on the labels' or the help's.
Why: Centred or aligned to the end, a field with a line of help under it stands its control higher than its neighbour without one, and the line of controls the eye follows across the row breaks by the help's height.
Do: Set the `cellAlign` axis to `start` on a `table` whose cells hold fields, and the `align` axis to `start` on an `inline` of fields. In a grid of fields with a button, give the grid three rows — label, control, help — each field spanning them with `grid-template-rows: subgrid`, and place the button in the control row; a value read beside the controls is centred on the controls' height.
Don't: Keep the table's centred cells for a row of fields, where a quantity with help stood 21 pixels above the cost beside it. Align a grid of fields with `align-items: end` to bring a button level with the controls: the field with help lifts its control by the help's height.
Seen in: Nexora · new purchase order, the lines table (ledger row "table, field") · corrected. Nexora · new quote, the line picker: Discount with "Percent off the list price." stood 24 pixels above Item and Quantity · corrected
Check: On a line where one field carries help and another does not, every control and the button share one top and one height, measured by bounding box.

### LA-06 · A sticky element of the screen's own stops under the page's chrome

Level: MUST
Applies to: an element a screen makes `position: sticky` inside a page — a preview beside a form, a summary beside a list, a column's own header
Rule: The element's offset starts at the page's published `--slotted-page-sticky-top`, the measured height of the chrome that stays (the stuck page-header's title area, a sticky section's header), and an element that may be taller than what stays visible caps its height by the same property and scrolls inside.
Why: An offset from the scroller's edge alone — `inset-block-start: var(--slotted-space-4)` — sticks the element behind the stuck header, which is painted above it: its top is hidden for as long as it is stuck.
Do: Write `inset-block-start: calc(var(--slotted-page-sticky-top, 0px) + <gap>)` and, when the element can outgrow the view, `max-block-size: calc(100dvh - var(--slotted-page-sticky-top, 0px) - <room for the app's own bars>)` with `overflow: auto`.
Don't: Measure the header in the screen's own code, or hard-code its height: the header collapses, wraps and changes with the density, and the page already measures it.
Seen in: Nexora · the workflow editor, its "As it will run" preview stuck under the page header · corrected
Verified in: tools/look.mjs on the workflow editor at 1440×900, main scrolled to 500 and 700 (208 against 176)
Check: Scroll the page until the header sticks, at two scroll positions: the sticky element's top stands at or below the bottom of the stuck header's title area each time.
