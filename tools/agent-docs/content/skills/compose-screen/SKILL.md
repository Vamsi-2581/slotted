---
name: compose-screen
description: Use when writing or changing a screen of an application built with {{package}} — a list of records, the page of one record, a form that writes one, an overview, a report, a tree beside a list, a rule builder, a conversation or a ledger. Applies the Slotted guidelines in order and ends with each Check of the rules read.
---

# Compose a screen

A screen is composed from the families' own parts first. An element of the
screen's own exists only where no family names a place for it.

## 1. Name the domain values

Name the values the product is about on this screen — money, a period, a day,
an account, a person — and the task the reader performs with each: enter it in
one motion, step it, compare it. For each, write which family accepts the
value and whether that family performs the task in one step with the value's
own words. When it does not, CP-04 applies before any family is chosen: a
family that technically accepts a value does not answer the reader's task by
that fact.

## 2. Classify the screen

| The screen                                            | Topic              |
| ----------------------------------------------------- | ------------------ |
| Lists records, searches, filters, pages               | `list-pages.md`    |
| Shows one record, its figures and its related records | `record-pages.md`  |
| Creates or edits a record                             | `forms.md`         |
| Summarises a domain in figures and charts             | `overviews.md`     |
| Places a list beside a tree of its places             | `browsing.md`      |
| Reads records over a chosen period                    | `reports.md`       |
| Writes or reads a rule the system runs later          | `builders.md`      |
| Holds a conversation the reader answers               | `conversations.md` |
| Works a queue against candidates in three regions     | `workspaces.md`    |
| Lists immutable changes with their cause and balance  | `ledgers.md`       |

A screen can be two of these: a record with an edit form in place reads both
topics.

## 3. Read

1. `{{docsDir}}/guidelines/index.md`.
2. `{{docsDir}}/guidelines/composition.md`, always.
3. The topic of step 2. Add `layout-alignment.md` and `shell-composition.md`
   when the screen places controls in a row or in the application frame.
4. Add `errors-and-conflicts.md` and `reading-permissions.md` when the screen
   writes data or reads under a role.
5. When the screen writes an element of its own, follow
   `{{docsDir}}/skills/build-own-element/SKILL.md`.

## 4. Read each family before writing beside it

For each family the screen uses, read `{{docsDir}}/<family>.md` — its anatomy,
its slots, its axes (CP-01). When the family names a slot for an element, the
element stands in that slot.

## 5. Compose

- Every destination of the navigation is `full`, and a list adds `fill`; a
  create or edit form is `wide`; preferences read as prose are `measure`
  (CP-10).
- Siblings of the screen's own stand in `inline` (one row) or `stack` (one
  column) with a gap from the space scale; text of the screen's own takes its
  size from the `typography` family's `text` member (CP-02).
- A track that holds a family which scrolls states a zero minimum, so the
  family's scroller is what scrolls (CP-03).
- An element of the screen's own paints only with theme tokens; a literal is
  written only beside a comment that says why no token covers it (CP-05).
- A state a family already draws is set on the family and stated once, with
  nothing louder beside it (CP-06).
- A control that switches what a region holds changes words and values, never
  the size or the position of a box (CP-08).
- A control that switches a region — tabs, a route, a filter — updates its
  own state at once and renders the region from a deferred value (in React,
  useDeferredValue or startTransition) (CP-09). A list longer than a hundred
  rows is a `data-grid`, which windows its rows (LP-14).
- Where no anatomy answers the problem, the screen writes an element of its
  own instead of bending a family into a shape it does not have (CP-04). That
  element is built with `{{docsDir}}/skills/build-own-element/SKILL.md`.

## 6. Waits

Every region filled by a request and every control that starts one follow
`{{docsDir}}/skills/waiting-states/SKILL.md`.

## 7. Done

1. Each `MUST` rule of the topics read: its `Check` passes.
2. Each `SHOULD` rule not followed is listed with its reason.
3. No CSS of the screen's own targets a family's parts; a family's appearance
   changes through its axes.
4. In a browser with the CPU throttled 4×, each control that switches a region
   paints its new state in the next frame, with no long task between the input
   and that paint.
5. For each value named in step 1, the control that edits it was chosen
   against the task, and the reason is written beside it.
