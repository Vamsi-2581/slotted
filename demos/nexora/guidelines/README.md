# Guidelines

Rules for composing screens from the `@slotted/*` families: what the library
does not say. The packages state what each family is — its parts, states,
tokens and keyboard. They do not state where a pager stands, what a region
shows before its first answer, or which family a bar's search slot is for.
Those are product decisions, and this directory records the ones the Nexora
demo has settled.

Rules that hold for any application ship in `@slotted/angular/docs/guidelines/`
and are read from `node_modules`; this directory keeps the rules of the Nexora
domain.

Every rule here was met on a Nexora screen first. A rule without an
observation is not written; an observation without a rule is a row in
`../angular/LIBRARY-FEEDBACK.md`.

## Files

| File                      | Prefix | Holds                                                                          |
| ------------------------- | ------ | ------------------------------------------------------------------------------ |
| `index.md`                | —      | Every active rule in one line each. The only file a reader always loads        |
| `writing-rules.md`        | —      | How a rule is written, numbered, evidenced and retired                         |
| `list-pages.md`           | `LP`   | How a screen that lists records is composed: bar, grid, footer, phone          |
| `record-pages.md`         | `RP`   | How the page of one record is composed: header, figures, sections, missing     |
| `forms.md`                | `FM`   | How a form that writes a record is placed, refused, read-only and left         |
| `errors-and-conflicts.md` | `ER`   | How a refusal is classed, and what a conflict re-reads before it speaks        |
| `browsing.md`             | `BR`   | How a tree and a list share a place, and one concept reads at two grains       |
| `reading-permissions.md`  | `PM`   | What a screen draws when the reader's role shaped the answer                   |
| `ledgers.md`              | `LG`   | How an immutable record of changes reads: the movement, its cause, the balance |
| `workspaces.md`           | `WS`   | How a queue worked against candidates reads on a phone and shows its scores    |
| `conversations.md`        | `CV`   | How a conversation with a clock is read and answered, and its queues kept      |
| `reports.md`              | `RE`   | How a report reads a period, says what is not kept, opens what it counts       |
| `builders.md`             | `BD`   | How a rule a person writes reads, states its limits, moves and narrows         |

## Reading protocol

For a reader with a task — a person or a model about to write or review a
screen:

1. Load `index.md`. It is short; every rule is one line with its level and its
   file.
2. Match the task against the `triggers` in each topic file's front matter.
   Load the topic files that match, and no other.
3. Apply the rules by level: a `MUST` is a defect when broken, a `SHOULD` is a
   review finding, a `MAY` is a permission.
4. Verify with each rule's `Check` line before reporting the screen done.

A reader adding a rule loads `writing-rules.md` first.

## Lifecycle

```
observation on a Nexora screen
  → row in ../angular/LIBRARY-FEEDBACK.md (a defect or friction of the library)
  → or a rule here (a product decision the library does not make)
  → the demo is corrected so the rule's "Seen in" points at a fixed screen
  → the rule enters index.md
```

A rule that stops being true is retired, not deleted: `writing-rules.md`
says how. Rules promoted to library law move to `docs/` at the repository
root and leave a retired entry here that names the destination.
