---
topic: overviews
prefix: OV
triggers:
  [overview, dashboard, flagship, figure, stat card, exception, summary, chart, door, phone, narrow]
families: [stat-card, chart, list, list-item, table, section, grid]
---

# Overviews

How a screen that summarises a module is composed: what its figures lead to,
what a phone keeps first, and when a chart earns its place. The library gives
`stat-card` a figure and an action, `chart` a comparison and its table, and
`list` rows that are destinations; it does not say that a figure is a door, in
which order a phone reads a summary, or that a comparison of one is not a
chart.

### OV-01 · Every figure opens the list it counts

Level: SHOULD
Applies to: a `stat-card` on an overview whose number counts records a list page holds
Rule: The figure leads to the list page of the records it counts, and that list opens with the figure's condition applied as the bar's own pills, which the reader removes like any other.
Why: A number the reader cannot open is a question with no way to its answer, and a list opened without the condition makes the reader rebuild the filter the figure already stood for.
Do: Put the door in the card's `action` part at the desk. Keep the list a destination of its own in the navigation, and let the overview summarise and lead rather than hold the list in its body. Carry the condition in the address, so the door is a link a colleague can paste.
Don't: Draw a figure with no way to the records, open the unfiltered list, or narrow the list through a place the bar does not show.
Seen in: Nexora · Inventory overview, the four exception figures and the stock list they open · corrected
Check: Press each figure's door: the list's bar shows the figure's pill and its count equals the figure.

### OV-02 · A phone reads the summary in the order it is acted on

Level: SHOULD
Applies to: an overview in the compact size class
Rule: Below 600 pixels the figures are one `list` of rows that are destinations — label, comparison, number — followed by the records to act on, the work in flight, the charts, and the history last.
Why: Five cards two by two fill a phone's first screen before a single record is named, and each card's door wraps under its label below the label's floor.
Do: Draw the same figures as `list-item` rows whose content is the link and whose `end` holds the number, and place the regions by one grid whose areas change at the expanded size class.
Don't: Keep the desk's card grid on a phone, or put the charts above the records a reader acts on.
Seen in: Nexora · Inventory overview at 390 pixels, five cards filling the first screen · corrected
Check: At 390 pixels with a coarse pointer, the first screen holds the four figures as rows at least a touch target tall and the heading of the records to act on.

### OV-03 · A comparison of one is a sentence

Level: SHOULD
Applies to: a `chart` that compares categories whose number depends on the reader's scope — warehouses, teams, regions
Rule: Where the reader's scope holds one category, the chart is not drawn and one sentence states the numbers it would have compared.
Why: A bar chart of one category compares nothing, and it takes a chart's height to say three numbers.
Do: Decide the chart from the scope the page already reads, and write the sentence with the numbers and their unit.
Don't: Draw one group of bars, or leave an empty chart region for a reader scoped to one place.
Seen in: Nexora · Inventory overview read by a warehouse operator scoped to CHI-01 · corrected
Verified in: Sign in as Jordan Wells: the overview has no warehouse chart and says CHI-01's three counts in one sentence
Check: Sign in as a reader whose scope holds one category: the overview draws no comparison chart, and one sentence states that category's numbers.

### OV-04 · A threshold is said, not painted

Level: SHOULD
Applies to: a figure of an overview whose reading changes at a share the product states — overdue receivables against all receivables
Rule: The thresholds are stated once in words beside the figures, and a figure past one says so in its own comparison line, on the line the placeholder reserves.
Why: The figure card's tone is the trend's and paints nothing on a card without one, and a mark added beside the label moves the card's header to a second line.
Do: Keep the shares in one place of the page's code and one sentence on screen ("a warning from 20 percent of receivables and a danger from 33"), and end the crossed figure's comparison with the threshold it passed ("26% of receivables, above 20%").
Don't: Set a tone on a card with no trend and expect it to read, or add a badge to the card's header for the crossing.
Seen in: Nexora · Finance overview, overdue receivables in healthy and in collections pressure (ledger row "stat-card, tone is the trend's") · corrected
Verified in: the finance overview suite, "turns the overdue figure to a warning and a danger at the shares the page states" and "reads differently under collections pressure: the overdue share crosses the danger".
Check: Bring a figure past each stated threshold: the threshold sentence stands beside the figures, and the figure's own comparison line says it crossed, on the line its placeholder reserved.

### OV-05 · A chart is framed only as a tile

Level: SHOULD
Applies to: `chart` and `stat-card` on an overview, a record's figures or a list's chart tab
Rule: A chart takes the `card` `variant` when it is one of two or more peer tiles in one grid with no section heading of its own, and stays `plain` when it is the body of a titled section or the only content of a tab.
Why: The section's heading and its space already frame a chart that is its body, and a card around it draws a second frame; peer tiles without headings need the frame to read as separate answers of the same height.
Do: Give a plain chart a `title` that names the measure and not the section's words again; in a grid of peer tiles, let the chart's title be the tile's title and share the row's height, as `stat-card` always does.
Don't: Frame every chart by habit, or leave a chart plain among framed tiles where it reads as the page's background.
Seen in: Nexora · inventory and finance overviews, receiving's chart tab: every chart is the plain body of a titled section · corrected
Check: For each chart, name what frames it: a titled section (plain) or a grid of peers (card); a chart with neither frame, or with both, is a finding.

### OV-06 · The stat-cards of one row share their structure

Level: SHOULD
Applies to: a row of `stat-card`s on an overview or a record page
Rule: The cards of one row carry a label of at most three words, the figure, and the same optional parts on every card — a comparison of one line on each, or on none.
Why: One card with a long label and a wrapping comparison beside three cards with a label and a value made four boxes of the tallest card's height, three of them mostly empty, and the row read as broken.
Do: Give every card a short label, its figure and one comparison line; detail that only one card has goes into its comparison or a tooltip.
Don't: Lengthen one card's label to carry its detail, or give one card of the row a part the others lack.
Seen in: equori · Categories › Rules, the coverage row · corrected in `699fa5c`
Check: In every row of `stat-card`s, every label has three words or fewer, and either every card has a comparison or none does.
