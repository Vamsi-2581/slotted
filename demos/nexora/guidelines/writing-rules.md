# Writing a rule

A rule is read by a model deciding what to draw, and by a reviewer deciding
whether a screen is done. Both need the same thing: one testable statement,
its reason, and a way to check it. Everything else is weight.

## One topic file

```
---
topic: <one noun phrase>
prefix: <two capital letters, unique across the directory>
triggers: [<words a task would contain: "pagination", "tab", "popover">]
families: [<the families the topic's rules name>]
---

# <Topic title>

<Two to four sentences: what the topic decides and where the library stops.>

### <PREFIX>-<NN> · <Title, five words or fewer>

Level: MUST | SHOULD | MAY
Applies to: <parts, families or situations, as a list>
Rule: <one sentence, in the imperative or the indicative, testable>
Why: <one sentence>
Do: <prose: the composition that satisfies the rule>
Don't: <prose: the anti-pattern, as it was seen>
Seen in: Nexora · <screen or region> · <ledger row, commit, or "corrected">
Check: <a step a reviewer performs, or the spec that covers it>
```

Fields follow the heading after one blank line, in this order, each on its own line, each once. `Seen in` is
optional for a rule adopted from a published source; every other field is
required. A rule with no `Check` does not enter `index.md`.

## Levels

RFC 2119, three words:

- `MUST` — broken, the screen has a defect. Reserved for what a reader
  cannot recover from: a wait shown as nothing, a control that fires twice.
- `SHOULD` — broken, the screen has a review finding with a stated reason to
  deviate. Most layout rules live here.
- `MAY` — a permission the library does not grant on its own.

## Identity

- The ID is the topic prefix, a hyphen and two digits: `AF-03`. Numbers are
  given in order of writing and never reused.
- A retired rule keeps its heading, gains `Status: retired · <reason or
destination>` as its first field, and loses its body. It leaves `index.md`.
- A rule that changes meaning is retired and rewritten under a new number. A
  rule whose wording improves keeps its number.

## What a rule does not contain

- **Code.** No snippet, no template, no selector. A rule names families,
  parts, states and tokens by their published names — `popover` `body`,
  `data-loading`, `--slotted-app-shell-row-inset` — and nothing that a
  refactor would falsify. The demo's source is the example; the rule points
  at the screen.
- **File paths or line numbers.** `Seen in` names a screen or a region and a
  ledger row or a commit. Paths move; screens and commits do not.
- **Pixel values that are tokens.** "one row inset", not "8px"; "the medium
  control height", not "34px". A literal appears only when the value is a
  literal in the library too — a breakpoint, a latency threshold.
- **Binding-specific API.** No input name, no directive selector, no React
  prop. Where the two bindings differ, the rule names the capability and the
  reference page names the API.
- **Justification beyond `Why`.** One sentence. A rule that needs a paragraph
  to defend is two rules or a design document.
- **Qualifiers without a measure.** "generous", "clean", "modern" do not
  test. "one space step more than the bar's own gap" does.

## Vocabulary

One word per thing, the reference pages' word:

| Say         | Not                           | Meaning                                                                      |
| ----------- | ----------------------------- | ---------------------------------------------------------------------------- |
| pending     | loading (as a noun), fetching | a request has started and no answer has arrived                              |
| busy        | refreshing, updating          | content is shown and a newer answer is on its way                            |
| empty       | no data, nothing              | an answer arrived and it holds zero items                                    |
| placeholder | skeleton row, shimmer         | the family `skeleton` standing in for a row                                  |
| waits       | spinner, loading button       | a control in its `loading` state: refuses activation and shows the indicator |
| region      | area, section, container      | the element carrying the state for a subtree                                 |
| row inset   | padding, gutter               | `--slotted-app-shell-row-inset`                                              |
| mark        | icon column, avatar slot      | the row's first column, `--slotted-app-shell-row-mark` wide                  |

## Evidence

`Seen in` is the rule's proof. It names the Nexora screen where the
anti-pattern was met and one of:

- the `LIBRARY-FEEDBACK.md` row, when the observation also produced a ledger
  entry;
- the commit that corrected the demo;
- `corrected`, when the fix landed in the same change as the rule.

A screenshot in `../angular/screenshots/` may be named; it is evidence of the
picture, never of the rule.

## Before a rule enters the index

1. The statement is one sentence and a reviewer can answer yes or no to it.
2. `Check` is a step or a spec, not "verify visually".
3. No word in the forbidden list above appears in the body.
4. The demo satisfies the rule, or the rule says which ledger row blocks it.
5. `index.md` gains one line: ID, level, statement, file.
