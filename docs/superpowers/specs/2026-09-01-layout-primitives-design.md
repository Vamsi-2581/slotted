# Stack, Inline and Grid — layout primitives

Wave 1 of `docs/build-order.md`, mode `novo`, guide section 4. One invocation,
three families. This document records the architecture decisions the invocation
forced; the mechanical work is not described here.

## Purpose

Predictable composition of layout without a CSS DSL. A consumer arranges
children along one axis (Stack, Inline) or across two (Grid), choosing
separation and alignment from a closed set of values that the token foundation
bounds.

Anti-use: page shell, reading measure, surface, padding of a card, and every
other decision another family owns. These three families paint nothing, hold no
state, and add no semantics.

## One family or three

Three families: `stack`, `inline`, `grid`, each carrying its own `data-ui`.

`button` groups five members under one family because they are one control with
different jobs. Stack, Inline and Grid are three engines — flex column, flex row
with wrapping, and grid — and `align` names a different axis in each. A single
family would have to publish `[data-ui='layout'][data-flow='stack']` as the
selector for a stack, which is a group name in front of the only word the
consumer actually means.

Cost: the gap map is written three times, once per family, and the invocation
produces three contracts, three stylesheets, three harness pages and three
commits. The duplication is thirteen single-declaration rules per family, and
each copy resolves a different axis, so a shared abstraction would have to
explain which axis it meant before it could be read.

## `align` is across the flow, `justify` is along it

One rule covers the three families, so the two words never swap meaning:

| Family   | Flow                    | `align` resolves    | `justify` resolves |
| -------- | ----------------------- | ------------------- | ------------------ |
| `stack`  | block                   | `align-items`       | `justify-content`  |
| `inline` | inline, wrapping        | `align-items`       | `justify-content`  |
| `grid`   | inline, across a track  | `align-items`       | `justify-items`    |

Grid takes `justify-items` rather than `justify-content` because its tracks
already fill the row: distributing them has nothing to distribute. Its `justify`
therefore accepts `start`, `center`, `end` and `stretch`, and not the three
distribution values the other two accept.

## No axis reorders anything

There is no `reverse`, no `order`, and no `grid-auto-flow: dense`.

WCAG 2.2 SC 1.3.2 Meaningful Sequence is failed by F1, "changing the meaning of
content by positioning information with CSS", and satisfied by C27, "making the
DOM order match the visual order". A layout primitive that can reverse its
children makes that failure a one-word prop, and the reading order a screen
reader announces then disagrees with the order a sighted reader sees. Focus
order follows the DOM, so SC 2.4.3 breaks with it.

Cost: a consumer who wants the opposite order writes the children in the
opposite order. This is the intended answer, not a workaround.

## Separation is a step on the space scale, and density does not move it

`gap` names a step from `--slotted-space-1` to `--slotted-space-12`, plus `0`.
The value the step resolves to is the same under `comfortable`, `compact` and
`dense`.

A named step has to resolve to one value. `gap={6}` meaning `1rem` on one page
and `0.75rem` on another makes the scale unreadable, and the space scale carries
a `base` axis for exactly that reason: it is stated once, not restated per
density. Density in this library is control geometry — height, inset, control
font size — and a layout family owns none of it.

Cost: the `dense` capture of all three families is identical to `comfortable`.
An application that wants tighter composition under a dense theme picks a
smaller step. Should the rhythm of a whole page need to follow density, that
belongs to `page` and `section` in wave 7, which can read a density-axis token
without making `gap={6}` ambiguous.

Defaults differ by family because the families mean different things. Stack and
Grid default to step 6 (`1rem`), which sits at or above the line height of the
default type step, so blocks read as separate. Inline defaults to step 4
(`0.5rem`), which sits below it, so a run of items reads as one line.

## Grid reflows without a breakpoint

`columns` is absent, meaning as many as fit, or an integer from 1 to 12.
`minItemWidth` is a step — `xs`, `sm`, `md`, `lg`, `xl` — resolving to a family
token.

Absent `columns`, the track list is
`repeat(auto-fit, minmax(min(100%, <min-item>), 1fr))`.

With `columns`, it is

```
repeat(
  auto-fill,
  minmax(min(100%, max(<min-item>, (100% - (<n> - 1) * <gap>) / <n>)), 1fr)
)
```

which yields exactly `n` tracks while each would stay at or above
`minItemWidth`, fewer as the container narrows, and one track at 240 pixels. The
`min(100%, …)` term is what keeps a `minItemWidth` larger than the container
from overflowing it instead of reflowing.

No container query and no breakpoint is involved, so nothing in the family is a
literal width and nothing has to be retuned per theme. `container-type:
inline-size` is deliberately not declared: it establishes containment on the
consumer's element, which is a side effect a layout primitive has no reason to
impose.

`auto-fill` is used with a stated `columns` so two items in a three-column grid
occupy two thirds rather than stretching; `auto-fit` is used without one so a
lone item fills the row rather than sitting at its minimum.

Cost: no per-item `span`. A child that must cross two tracks sets
`grid-column: span 2` on itself. Exposing spans means exposing placement, and
placement is the CSS DSL this family exists to avoid.

## Measure belongs to `container`, not to `stack`

`docs/build-briefing.md` records that measure belongs to the container and
names "`container` and `stack`" as its future owners. This invocation resolves
that to `container` alone, which `docs/build-order.md` already describes as
"o dono da medida confortável de texto". Two families offering a maximum measure
would be two answers to one question.

## The accessibility pattern

`https://www.w3.org/WAI/ARIA/apg/patterns/` lists thirty patterns. None covers a
layout primitive.

The nearest name is Grid (Interactive Tabular Data or Layout Container),
`https://www.w3.org/WAI/ARIA/apg/patterns/grid/`, and it is a different thing:
"A grid widget is a container that enables users to navigate the information or
interactive elements it contains using directional navigation keys", one tab
stop, author-managed focus movement. The `grid` family here manages no focus,
owns no cells and takes no keys, so it carries no `role="grid"` and no
`aria-*`. Naming collision, not pattern collision.

The applicable law is therefore the platform's, not APG's:

- SC 1.3.2 Meaningful Sequence, techniques C27 and F1 — no reordering axis.
- SC 1.4.10 Reflow, 320 CSS pixels without scrolling in two dimensions — the
  Grid track function above, and the 240-pixel capture that checks it.
- The element is the consumer's. A Stack is a `ul` when it holds list items and
  a `form` when it holds fields, so native semantics are the consumer's to
  choose and the family's to preserve.

## The shared vocabulary gains one capability

`specs/contract.schema.mjs` closes `KNOWN_CAPABILITIES`, and none of its
twenty-eight entries describes arranging children. `arrangement` is added, and
`packages/storybook-workbench/src/scenarios.tsx` maps it to the API rows `gap`,
`align` and `justify`, so a layout family cannot publish a reference page that
omits one of them.

This is a change to a public contract outside the three families, and it is
raised at the human gate for that reason. It ships in its own commit, before
them.

## Framework shape

Shared: the contract, the authored stylesheet, the attribute names, the closed
value sets, and the absence of state.

React exposes `Stack`, `Inline` and `Grid` as function components rendering a
`div`, with the `render` prop the typography family established, so the element
can be a `ul`, a `form` or a `section`.

Angular exposes `[slStack]`, `[slInline]` and `[slGrid]` as components with an
attribute selector, so the consumer writes the element and the family only
arranges what is inside it.

Both write the count a grid needs as `--slotted-grid-columns`, because a track
function cannot read an integer from an attribute — the mechanism Text already
uses for its line clamp.
