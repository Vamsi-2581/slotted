# Description List — capability inventory

Produced before the family was designed, as
`.claude/skills/component/references/capability.md` requires.
`specs/components/description-list/` does not exist, so this is a first build
against the current foundation; `docs/build-order.md` lists the family as
`refazer` because a schema-4 family of the same name was removed on 2026-09-02
with the rest of that generation. Nothing of it survives in the tree, so there
is no delta section: what shipped is not readable and is not a constraint.

`docs/build-order.md` carries no scope paragraph for this family. The scope is
derived here from section 10 of `docs/component-features.md` and written into
`docs/build-order.md` as part of the work.

## 1. Surveyed

| #   | Source, read 2026-09-03                                                                             | What it calls the family                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | PatternFly React — `patternfly.org/components/description-list`                                      | `DescriptionList`, `DescriptionListGroup`, `DescriptionListTerm`, `DescriptionListDescription`, `DescriptionListTermHelpText` |
| 2   | Ant Design 6.6.2 — `ant.design/components/descriptions`                                              | `Descriptions`, `Descriptions.Item` (`items` array with `label`, `children`, `span`)                        |
| 3   | GOV.UK Design System — `design-system.service.gov.uk/components/summary-list/`                        | Summary list: `govuk-summary-list`, `__row`, `__key`, `__value`, `__actions`; summary card wraps it         |
| 4   | Carbon — `carbondesignsystem.com/components/structured-list/usage/`                                   | Structured list: column header, data row; alignment `hang` and `flush`                                      |
| 5   | HTML Standard §4.4.9 and MDN — `html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element`, `developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl` | `dl`, `dt`, `dd`; name-value groups                                                                       |
| 6   | HTML-AAM 1.0, WD 2026-08-29 — `w3.org/TR/html-aam-1.0/`                                              | `dl` → `list`, `dt` → `term`, `dd` → `definition`                                                          |

The four implementations disagree on the element. PatternFly and GOV.UK render
`dl`/`dt`/`dd`; Ant renders a `table` with `th` and `td`; Carbon renders `div`
elements with `role` attributes. The disagreement is the first decision the
design has to take, and section 10 of `docs/component-features.md` already takes
it: the family keeps `<dl>/<dt>/<dd>` or an equivalent semantic.

### What the platform supplies, transcribed

`dl` permits either zero or more groups of one or more `dt` followed by one or
more `dd`, or one or more `div` elements each holding such a group. The `div`
form is the one that makes a per-pair grid cell possible, and it is in the
WHATWG standard and in W3C HTML 5.2 and later.

`dl` maps to the `list` role, `dt` to `term`, `dd` to `definition`. MDN records
that screen readers expose `dl` differently from one another and warns that
writing the ARIA `term` and `definition` roles by hand changes how VoiceOver
announces the construct. The family therefore writes no role at all: the
elements already carry them.

A `dt` may be followed by more than one `dd`. GOV.UK uses the second `dd` for
the row's action, which is why an action needs no invented semantics.

## 2. Table stakes

Every capability two or more of the surveyed implementations ship.

| Capability                                | Who ships it                                                            | Verdict                     | Reason                                                                                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dl`/`dt`/`dd` with a per-pair group       | PatternFly (`DescriptionListGroup` → `div`), GOV.UK (`__row` → `div`), HTML §4.4.9 | adopt                       | The group is the grid cell and the row rule. The platform permits it and two implementations depend on it.                                                       |
| Term beside the value, or above it         | PatternFly `isHorizontal`/`orientation`, Ant `layout`                    | adopt as `layout`           | `row` and `stack`. Section 10 requires the stacked form on a narrow screen, so the axis exists whether or not a consumer sets it.                                |
| More than one column of pairs              | PatternFly `columnModifier` (`1Col`–`3Col`), Ant `column` (default 3)    | adopt as `columns`          | A details panel with twelve pairs in one column is a scroll; three surveyed products ship the same three counts.                                                 |
| The arrangement changes with available space | PatternFly (breakpoint maps on `orientation` and `columnModifier`), Ant (`column` per screen) | adapt                       | Both key on the viewport. This family keys on its own inline size, because the same list sits in a 320-pixel drawer and in a 1200-pixel page on one screen.       |
| Term column width                          | PatternFly `termWidth`, `horizontalTermWidthModifier`; Ant (table layout) | adapt                       | Exposed as one public custom property. The default is not a number: the terms share a track sized to the widest of them, which is what neither implementation does. |
| A framed presentation with internal rules  | Ant `bordered`, Carbon (row borders), GOV.UK (rule under every row)      | adopt as `variant`          | `plain`, `ruled`, `framed` — the vocabulary `collapsible` already uses for the same three ideas.                                                                 |
| A compact step                             | PatternFly `isCompact`, `displaySize`; Ant `size`                        | decline → the density axis  | The theme restates the control scale at `comfortable`, `compact` and `dense`, and a family-owned size step would be a second scale answering the same question. `stepper` declined the same row for the same reason. |
| An item wider than one column              | Ant `span` (and `filled`), PatternFly `isFillColumns`                    | adopt as `span`             | A description that holds an address or a paragraph needs the whole row; without it the consumer reorders the list to hide the problem.                           |
| An action on the row                       | GOV.UK `__actions`; PatternFly (a `Button` inside the description)       | adopt as an `action` part   | Section 10 names actions in the family's own paragraph. The second `dd` is the platform's answer and GOV.UK's.                                                   |
| A value that is missing                    | GOV.UK ("Showing missing information"), Ant (an empty cell)              | adapt as a `placeholder`    | An empty cell is a row a reader cannot tell from a bug. The placeholder is drawn geometry plus text a screen reader reads.                                       |
| An icon beside the term                    | PatternFly `DescriptionListTerm icon`, Ant (`label` takes any node)      | adapt                       | The term takes arbitrary content and the stylesheet puts an icon on the term's optical line. `icon` owns the glyph; this family owns the alignment.              |
| A title and an action area above the list   | Ant `title` and `extra`, GOV.UK summary card                             | decline → `card`            | `card` already has `header`, `actions` and `body`. Two lines compose it: `<Card><CardHeader>Billing<CardActions>…</CardActions></CardHeader><CardBody><DescriptionList>…</DescriptionList></CardBody></Card>`. PatternFly reaches the same conclusion and says so on its own page. |

Four capabilities appear in one surveyed implementation each and are recorded
here rather than in the table, because one source is not a table stake:

- **A colon after the term** (Ant `colon`, default true). Declined. The grid
  already separates the term from the value, and the colon is wrong in the
  stacked arrangement — which is the arrangement every narrow container gets.
  A consumer who wants one writes it in the term.
- **Auto-fitting columns** (PatternFly `isAutoFit` with `autoFitMinModifier`).
  Declined. The container query already changes the count, and a count a
  consumer can predict is worth more in a details panel than one that varies
  with a minimum track size.
- **Help text on a term, in a popover** (PatternFly
  `DescriptionListTermHelpText`). Deferred to `popover` and `tooltip`, wave 5 of
  `docs/build-order.md`. The static half of it ships now as the `hint` part, so
  the term can explain itself without an overlay.
- **Inline grid** (PatternFly `isInlineGrid`). Declined. A description list that
  shrink-wraps is a list that stops answering its own width, and every
  responsive decision in this family reads that width.

## 3. Differentiators

| Capability                                                        | Where it comes from                                                                                                                                                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Terms share one track across every item, sized to the widest term    | CSS subgrid. PatternFly needs a stated `termWidth` and Ant needs a real `table` to line two rows up; a `dl` of independent groups cannot align without it. The width stays overridable by one token. |
| The arrangement answers the container, not the viewport              | `container-type: inline-size` and a family-owned `container-name`, which the foundation already requires of a reflowing family. Neither PatternFly nor Ant can be correct inside a drawer.           |
| Three colour schemes, three densities, RTL and forced colours, from one authored stylesheet | The token foundation. The surveyed implementations ship light and dark, one density, and mirror by shipping a second stylesheet.                                                                     |
| A value the reader can copy                                          | Section 10 asks for it in the family's own paragraph, and no surveyed description list ships it: PatternFly composes a separate `ClipboardCopy` component into the value.                            |
| A long value clamped with the whole text still in the DOM, and a control that reveals it | Section 10 forbids truncating without access, and `docs/build-briefing.md` already decided that truncation never removes content. Ant and PatternFly clip with CSS and lose the rest.                |
| A hint under the term                                                | PatternFly needs a popover for the same job. A dense back-office panel explains a field more often than it needs a layer.                                                                            |
| A row action named by its own term through `aria-describedby`        | GOV.UK repeats the term inside every action as visually hidden text, which a template system has to do. A reference to the `dt` says the same thing once and cannot drift from it.                   |

## 4. Gaps

What no surveyed implementation handles well, and a real product still hits.

| Case                                                                | What breaks in the field                                                                                         | The answer here                                                                                                       |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| A value that is one unbroken token — a hash, an ARN, a URL           | A `max-content` term track and an intrinsic value track both grow, and the row leaves the box                     | The value track is `minmax(0, 1fr)` and breaks anywhere; read at 240 pixels                                            |
| A term longer than its value, in the `row` arrangement, in a narrow box | The term column starves the value column until the value breaks one letter per line                              | The container query stacks before that point, rather than at a viewport width the component cannot see                 |
| A translated term — a German compound is twice the English            | A stated term width clips it or a `max-content` track takes half the row                                          | The term track is `minmax(0, max-content)` under a public maximum, and the long-content scene carries a real compound  |
| An empty value                                                       | Ant renders an empty cell; a reader cannot tell an empty value from a broken one                                  | The `placeholder` part: a drawn rule with the reason in text a screen reader reads                                     |
| Twelve rows where two matter                                         | Nothing marks a row as the one that matters                                                                       | Declined. Emphasis inside a read-only list is a decision about content, and the value slot takes `tag`, `badge` or `status-indicator`, all of which exist |
| A panel rendered before its data arrives                             | Every surveyed implementation renders empty rows                                                                  | Declined → `skeleton`. The value slot takes a `Skeleton`, and the story proves it                                      |
| Copying where the asynchronous clipboard is unavailable or refused   | PatternFly's `ClipboardCopy` reports success either way                                                           | The request carries the outcome, the control returns to rest, and the value stays selectable text                     |
| A reader who asked for reduced motion                                | An animated reveal moves text under the eye                                                                       | The reveal changes no height over time; only colour transitions, from the motion scale                                 |

## Exit condition

A reader who knows this family from PatternFly, Ant Design or GOV.UK can point
at nothing in those three that is not answered above: adopted, adapted,
declined with the family that owns it, or deferred with the wave that builds it.
