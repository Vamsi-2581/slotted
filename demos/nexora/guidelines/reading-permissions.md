---
topic: reading under permissions
prefix: PM
triggers:
  [
    permission,
    role,
    persona,
    cost,
    price,
    pricing,
    hidden,
    blank,
    zero,
    redacted,
    column,
    figure,
    absent,
    forbidden,
    scope,
  ]
families: [data-grid, table, stat-card, inline-message, tabs, filter-bar]
---

# Reading under permissions

What a screen draws when the answer it received was shaped by the reader's
role rather than by the record. A backend that refuses a whole resource is
answered by the route's own refusal; a backend that answers and writes one
field down to a placeholder is answered here. The library draws whatever it
is handed and has no way to know that a zero is a redaction.

### PM-01 · A value a permission blanks is absent, not drawn

Level: MUST
Applies to: a field the backend writes down or empties for a reader who lacks a permission — a cost written to nought, a list of prices returned empty
Rule: The column, the figure and the section that would carry the value are not built for that reader; nothing is drawn for the value, and nothing is hidden in a place the reader can bring back.
Why: A redacted value drawn as a value is the screen lying with the backend's own numbers: a cost of nought reads as free, and the margin computed from it reads as a hundred percent.
Do: Decide the column model and the filter fields from the permissions, so the value is absent from the model rather than hidden in it — a hidden column is one the reader restores through the family's own column control, and what would come back is the redaction. Where a whole section is empty for the same reason, leave the section out with its tab.
Don't: Hide the column, grey the number, or draw an em dash where a value the reader may not see would have been: an em dash says the record has no value, and the record has one.
Seen in: Nexora · the SKU record and the SKU list, a representative's cost of nought and a warehouse operator's empty price list · corrected
Check: Sign in as a representative and read the SKU: no margin figure, no cost column, no currency amount of nought anywhere. Spec: the SKU store suite, "a representative may be shown the price and never the cost"; the catalogue list screens suite, "the price and the cost are absent from the model, not hidden in it".

### PM-02 · What is missing is named once, with who sees it

Level: SHOULD
Applies to: a screen that left a value out under PM-01, where its absence changes what the remaining numbers mean
Rule: One statement names the permission the value needs and the roles that hold it; two missing permissions are one statement, not two.
Why: A figure row with a hole in it reads as a screen that failed rather than as a screen that was told not to say; and a reader who holds neither permission does not need to be told twice in two tones.
Do: Put the statement where the absence changes the reading — under the figures on a record, above the rows on a list — and use the permission's own name, which is what a reader asks an administrator for.
Don't: Repeat the statement per tab, per column or per card, or leave the absence unexplained where the rest of the numbers depend on it.
Seen in: Nexora · the SKU record read as a warehouse operator · corrected
Check: A reader holding neither pricing nor cost sees one sentence naming both. Spec: the SKU page suite, "a warehouse operator is shown neither price nor cost, and the page says so once".

### PM-03 · A price paid is a cost

Level: MUST
Applies to: every value that states what is paid to a supplier — a purchase order's unit costs, line totals and total, a supplier's price list and its spend, a goods receipt's unit cost
Rule: A price paid to a supplier is read under the cost permission on every screen that draws it, and PM-01 and PM-02 apply to it as to a standard cost.
Why: The catalogue already withholds a supplier's unit cost from a reader without the cost permission, and the same number on an order or a receipt would hand back what the catalogue withheld.
Do: Decide the money columns, figures and summary rows of a procurement screen from the cost permission, never from the answer; state once, with the roles, who sees them. A preview that needs the cost — the approval an order will ask for — states its rule in words for a reader without it (FM-11).
Don't: Treat the purchase-order permission as a licence to read its money, or draw an order's total because the list answer carries it.
Seen in: Nexora · purchase orders, suppliers and goods receipts read by a warehouse operator · corrected, and the backend writes the money down to nought for that reader (ledger row "the money of an order")
Check: Spec: the procurement module suite, "leaves the spend and the totals out of the models without cost.view" and "never reads the totals GET /purchase-orders hands a warehouse operator".
