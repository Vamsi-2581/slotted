# Collection engine review

Wave 6 item 1. Ordered by `docs/build-order.md`: "Revisão de
`packages/core/collection`: chaves estáveis, seções, typeahead, seleção,
carregamento incremental e virtualização como capacidade opcional." It lands in
its own commit, before `listbox`, as `docs/build-briefing.md` requires of every
shared tool a family finds wanting.

## 1. What was there

One function, `virtualWindow`, ninety lines including its comment. It was
written for `virtual-list`, the family `docs/build-order.md` retires here, and
its own comment states the terms of this review:

> Written against VirtualList, its first and so far only caller. […] this
> signature is provisional until Listbox and Calendar have had their say in T3.
> It assumes every row is the same size.

Nothing else in the module. Stable keys, sections, selection, disabled sets,
typeahead labels and incremental loading were each answered per family or not at
all: `menu` built `packages/core/src/typeahead` for the third of them, and the
other five had no consumer yet.

## 2. The verdict on `virtualWindow`

The arithmetic is right and stays. Four things were designed against a caller
that had no selection, and Listbox is the caller that contradicts them.

### 2.1 The window is a function of the scroll offset alone

A windowed listbox has an **active option** — the one `aria-activedescendant`
points at — and the active option is not a function of the scroll offset. A
reader who arrows to option 40 and then flicks the list with a touchscreen
scrolls option 40 out of the window, at which point the element the property
references is removed from the DOM. The reference dangles: the property is
still written, the id resolves to nothing, and the screen reader reports no
focused option in a widget the reader is actively operating.

`virtualWindow` gains `pinned`, a list of indices that are rendered whether or
not the viewport covers them. The family pins the active option and the range
anchor. The pinned rows are returned separately from the contiguous slice, so a
caller renders `[...pinnedBefore, ...slice, ...pinnedAfter]` and never
de-duplicates by hand.

The alternative — clamping the scroll so the active option cannot leave — was
rejected: it takes the scrollbar away from the reader to protect an attribute.

### 2.2 A roving `tabindex` cannot survive recycling

The second half of the same failure, and it is worse, because the platform
rather than a screen reader loses the thread: the element carrying
`tabindex="0"` is removed **while it holds DOM focus**, focus falls to
`document.body`, and the next `Tab` restarts at the top of the page.

This is not fixed in the engine. It is fixed by the family choosing
`aria-activedescendant` whenever a window exists, which is what `focusMode:
'auto'` resolves to. The engine's part is to make the choice a fact rather than
a guess: `virtualWindow` is only called when the family is windowed, so
"windowed" is exactly "the caller passed a window".

### 2.3 Every row is the same size

True of a flat list and false of a grouped one: a `section-label` row is not an
option row, and multiplying one `itemSize` by an index that counts both drifts
further from the canvas with every group.

The module gains `createRowMetrics(sizes)`, a prefix-sum table with a binary
search, and `virtualWindow` accepts either shape:

- `itemSize: number` — two multiplications, unchanged, and the path every
  ungrouped list takes;
- `metrics: RowMetrics` — `offsetOf`, `sizeOf`, `indexAt` and `totalSize`, built
  once per row list rather than per frame.

The measured variant the original comment deferred is still deferred: these
sizes are stated by the caller, not read from the DOM. A row whose height
depends on how its text wrapped is not answered here, and the family says so by
refusing to window a list whose options carry descriptions of unknown length —
`itemSize` is a required input of the `virtual` axis, not an optional one.

### 2.4 There is no arithmetic for "scroll to this index"

`Home` in a windowed list of ten thousand moves the active index to 0, which is
not in the window. The scroll must be driven from the index, and the number must
be the same in React and in Angular.

`offsetForIndex(index, align, window)` answers it — `start`, `end`, `center` and
`nearest`, where `nearest` is what a keyboard step needs and the other three are
what `scrollToKey()` takes.

## 3. What the module gains besides the window

| Export                                                | Answers                                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `createCollection({ items, getKey, … })`              | Stable keys, sections, the flat row list, the label per key for typeahead, the disabled set, and `setSize`/`posInSet` per key.           |
| `nextSelection(request)`                              | The three modes, the two behaviours, the range anchor, select-all, and the refusal of an empty selection.                                |
| `shouldLoadMore(window, count, threshold)`            | When the window has come close enough to the end of the loaded set to ask for more.                                                     |
| `createRowMetrics(sizes)`                             | The prefix-sum table §2.3 needs.                                                                                                        |
| `virtualWindow(input)`                                | As before, plus `pinned`, `metrics` and the two indices the pinned rows come back in.                                                   |
| `offsetForIndex(input)`                               | §2.4.                                                                                                                                   |

Every one of them is pure. Nothing in the module touches the DOM, React or
Angular, which is what lets one test hold the behaviour both bindings claim.

## 3.1 Movement is `moveIndex`, and this review does not write a second one

The `select` and `combobox` session added `navigation.ts` and `filter.ts` to
this module while this review was being written. `moveIndex` answers the
question a listbox's arrow keys ask — which index does the highlight move to,
over an enabled mask, without wrapping past a page — so this review deletes the
duplicate it had drafted rather than shipping two functions for one question in
one module. That duplication is the whole of what the engine exists to prevent.

Two things Listbox needs and `moveIndex` already has, once they are read the
right way:

- **The `navigateDisabled` axis** is the `enabled` mask, not a second option.
  Turning the axis on hands `moveIndex` a mask of all `true`, and the APG's
  "discoverability is crucial" case is then one line at the call site rather
  than a parameter nobody else passes.
- **A row step in a two-dimensional arrangement** is `pageDown` with
  `page: columns`. The page arithmetic is exactly what a row step needs — it
  clamps rather than wrapping, and it lands on the nearest enabled option
  inward before it looks outward — so `columns` is a number at the call site
  instead of two more intents in the vocabulary.

`filter.ts` belongs to `combobox` and is not consumed here.

## 4. What the module deliberately does not gain

- **A store.** The engine answers questions; it holds no state. Controlled and
  uncontrolled ownership is `packages/core/src/state`'s, and a second copy of
  that decision inside the collection is how the two would drift apart.
- **A comparator.** The CDK's `compareWith` exists because its value holds the
  consumer's own objects. Here a key is a string, produced once by `getKey`, and
  the consumer's object never enters the contract.
- **Filtering.** `combobox` is wave 6 item 4. Filtering changes which rows exist,
  which is `createCollection`'s input, so the engine is already the place it will
  be composed — but nothing is written for it before its caller exists.
- **Measurement.** §2.3. Reading a laid-out row's height is a DOM concern, and
  the family that needs it will bring the policy for scroll anchoring with it.
- **Drag and drop.** `docs/component-features.md` §3 makes it its own
  `[Extended]` module in wave 8.

## 5. `virtual-list` is retired

`docs/build-order.md` retires the family here. It was already gone from
`specs/components/`, `packages/react/src`, `packages/angular` and
`packages/styles/src` — removed with the schema-5 sweep — so this review removes
nothing and records the fact instead: no entry remained to retract, and the
capability now lives where §2.10 of the feature guide says it belongs.
