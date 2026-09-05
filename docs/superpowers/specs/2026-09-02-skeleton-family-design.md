# Skeleton family design

Rebuild of `skeleton`, wave 2 of `docs/build-order.md`. The family that
shipped in August is one `span` carrying one attribute; this document records
what replaces it and what the replacement costs.

## Responsibility

Skeleton reserves the geometry content will occupy before the content arrives,
and holds the loading fact for the region that geometry belongs to.

It is not `progress-indicator`, which reports how far along a task is. It is
not `loading-overlay`, which blocks a region that already holds content. It is
not an empty state, which reports that there is nothing to show. The guide's
own rule decides between the first two: a spinner is for a wait whose result
has no known structure, and a skeleton is for a wait whose result does.

## Anatomy

One family, one `data-ui`, three components and five parts.

| Component        | Part           | Element        | Always present | Holds                                              |
| ---------------- | -------------- | -------------- | -------------- | -------------------------------------------------- |
| `Skeleton`       | `root`         | `span`         | yes            | One placeholder box.                                |
| `SkeletonText`   | `text`         | `div`          | yes            | The rows of a paragraph placeholder.                |
| `SkeletonText`   | `line`         | `span`         | yes            | One row. Repeated `lines` times.                    |
| `SkeletonRegion` | `region`       | `div`          | yes            | The loading fact: busy, inert, timing, phase.       |
| `SkeletonRegion` | `announcement` | `span`         | yes            | The one visually-hidden `role="status"` per region. |

`region` contains `root` and `text`, as `badge`'s `anchor` contains `badge`'s
`root`. Every rule that reaches a part names the family beside it, so a rule
written for the box can never reach the frame around it.

## The four shapes, and what sizes each one

| `shape`  | Geometry                                            | Sized by                              |
| -------- | --------------------------------------------------- | ------------------------------------- |
| `text`   | A bar `1em` tall, centred in a row exactly `1lh`.   | The inherited type. No axis.          |
| `block`  | Full inline size, height of its content, `1lh` floor. | The consumer, or the content it wraps. |
| `circle` | 1:1, `radius-full`.                                 | `size`, on `--slotted-avatar-size-*`.  |
| `square` | 1:1, the avatar corner.                             | `size`, on `--slotted-avatar-size-*`.  |

`text` deliberately has no size axis. A bar of `1em` inside a row of `1lh` is
the height of the type it is placed in, whatever that type is, at whatever
density — so `n` rows occupy exactly the `n` line boxes of the paragraph they
stand in. An axis would have been a second, coarser copy of the type scale that
a consumer could set to the wrong value, and it would have answered only the
seven steps this library happens to own.

`circle` and `square` take Avatar's words and Avatar's scale, because nine
round placeholders in ten stand in for an avatar and the scale already exists.
`size` therefore has five steps, not the type scale's seven, and it means
nothing on `text` or `block`. That is stated in the contract and tested rather
than left for a reader to discover.

`block` never resolves to nothing: with no content and no stated block size it
is one line tall. A placeholder that is invisible is worse than one that is the
wrong height, because only one of the two can be seen and fixed.

## State ownership

The family holds no state a consumer can own, and therefore declares no
`stateModel`. `loading` is a fact about the consumer's data; a placeholder
cannot decide that data arrived, so there is nothing for it to request. The
schema agrees — `loading` is not in `MUTABLE_CAPABILITIES` — and the contract
test asserts the absence rather than leaving it implied.

What the family does own is **whether the placeholder is painted**, which is
derived from `loading`, `delay` and `minDuration` and is not the same boolean:

- `delay` withholds the paint until the wait has lasted long enough to be worth
  reporting. A skeleton that appears and vanishes inside 80 ms is a flash.
- `minDuration` holds the paint once it has appeared, so a skeleton that did
  appear is not snatched away 30 ms later.

Both live on `SkeletonRegion` and in the defaults provider, and on neither box.
A load has one boundary — the region — and twenty boxes each running their own
timer would reveal at twenty different moments and stagger the page. Both
default to `0`; the recommended pair is documented on the reference pages,
because the family cannot know a consumer's latency and a non-zero default
would leave a blank page wherever data is already absent.

The derivation is one pure state machine in `@slotted/core/loading`, driven by
both bindings, for the reason `@slotted/core/state` exists: two bindings must
not be able to disagree about it.

`SkeletonRegion` announces the moment the paint is actually withdrawn —
`onReveal` in React, `(reveal)` in Angular. That is a notification, not a
request: the consumer does not own the value, so there is nothing to cancel.
It is what lets an application move focus to content the reader can now reach.

## Composition

- `<Skeleton>` with no children draws geometry. With children it takes their
  geometry and covers them, which is the only form in which the placeholder
  cannot disagree with what replaces it.
- `loading` is inherited from the nearest `SkeletonRegion`, then from the
  defaults provider, then `true`. A box that states its own wins, as an
  explicit consumer value wins everywhere in this library.
- `SkeletonText` is `Skeleton` rows in a grid whose tracks are `1lh`. A
  consumer who needs particular per-row widths writes `Skeleton` boxes in a
  `Stack`; the composition demonstration shows both.
- Every part is substitutable: `render` in React, a bare attribute selector in
  Angular so the element stays the consumer's.

## Accessibility

No APG pattern exists — the index holds thirty patterns and none is Skeleton —
so the platform is the source. ARIA 1.2 `aria-busy` says the author "MAY set
`aria-busy` to `true` on the container element before the first change, and
then set it to `false` when the last change is complete", and the `progressbar`
note says to set it "on the region until it is finished loading". That is the
model implemented, minus the progressbar the family is not.

- Every box is `aria-hidden="true"` and `inert` while loading. Reading out the
  absence of something is noise, and focus must not fall into content that is
  not ready. `aria-hidden="false"` remains the explicit escape hatch, as this
  family established in August and `alert` reused.
- The region carries `aria-busy="true"` while loading and holds one
  visually-hidden `role="status"` carrying `label`. On completion the status is
  emptied, which announces nothing, so a load produces exactly one
  announcement. `loadedLabel` opts into a second.
- Under `prefers-reduced-motion` the loop stops rather than shortening: an
  infinite animation that hurries still moves.
- `animation="none"`, and the provider that sets it once, are the author-side
  mechanism WCAG 2.2 SC 2.2.2 asks for; the reader-side mechanism is the
  operating system preference above.

## Contract break

The public API of the shipped family does not survive, and a consumer moves as
follows.

| Was                             | Is                                     | Why                                                                     |
| ------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| `data-slotted-component`        | `data-ui="skeleton"`                   | Schema 5. Every rebuilt family carries the same identifier.             |
| `.slotted-skeleton` in CSS      | `[data-ui='skeleton']`                 | A class is not contract; `identity.test.mjs` refuses one.               |
| `shape="rectangle"`             | `shape="block"`                        | It stands for a block of content, not for a rectangle.                  |
| `--slotted-skeleton-circle-size`| `size` on the avatar scale             | `2.5rem` was a literal in the component layer and matched no avatar.    |
| `--slotted-skeleton-duration`   | `--slotted-duration-loop-slow`         | A literal duration sits outside the query that collapses the scale.     |
| no `loading`                    | `loading`, inherited from the region   | A placeholder with no loading fact cannot ever stop being one.          |
| announcement left to consumers  | `SkeletonRegion`                       | "Announcing the wait belongs to the region" was written and not shipped. |

The August entry ended by handing the announcement to a region that did not
exist. That is what this rebuild builds.

## Tokens

No new foundation token and no new component-layer scale. The family reads
`--slotted-disabled-background`, `--slotted-border-subtle`,
`--slotted-surface-raised`, `--slotted-radius-*`, `--slotted-avatar-size-*`,
`--slotted-duration-loop-slow` and `--slotted-easing-standard`, and derives the
shimmer highlight with `color-mix` toward `surface-raised` rather than
inventing a colour.

The August decision that a shimmer "needs a second, lighter colour that the
theme does not own" is reversed, and `shimmer` is now the default: the band is
the fill carried further along the axis the fill was derived on, so it separates
from the fill in all three schemes with no token of its own. The pulse's trough
is the same idea in the other direction, toward `surface-sunken`.

Neither animation touches `opacity`. Both paint: the pulse moves
`background-color` and the shimmer moves `background-position`. Fading the whole
box took its rim with it, and in the dark scheme that read as a flicker once per
cycle — the shape came within a hair of the ground and came back.

## Integration — React

| Question                                                                | Answer                                                                                                                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason?     | **No.** The family holds no state a consumer can own: `loading` is the consumer's fact and a placeholder cannot move it. `onReveal` announces the withdrawal it does own.  |
| Can an application set the family's defaults once?                      | **Yes.** `SkeletonDefaultsProvider` — `animation`, `delay`, `minDuration`, `label`, `loadedLabel`, `lastLineSize`. `skeleton-defaults.tsx`.                                |
| Can a consumer substitute the rendered element of each public part?     | **Yes.** `render` on `Skeleton`, `SkeletonText` and `SkeletonRegion`, each handed the full root props.                                                                     |
| Does the consumer's own handler still run?                              | **Yes.** The family attaches no listener at all; every native handler reaches the element untouched.                                                                        |
| Can a consumer reach the native element and the imperative action?      | **Yes** for the element — `ComponentPropsWithRef` throughout. **No** imperative action: there is nothing a consumer can ask for that `loading` does not already say.       |
| Does it render on the server without a hydration mismatch?              | **Yes.** `useId` for the announcement relationship, no layout read during render, and the row widths are deterministic — Carbon's pseudo-random widths are the counter-example. |
| Does every state a consumer may style appear in the DOM?                | **Yes.** `data-loading`, plus `data-shape`, `data-size` and `data-animation`.                                                                                              |
| Is each part's props type the native element's, extended?               | **Yes.** `ComponentPropsWithRef<'span'>` and `<'div'>`.                                                                                                                    |

## Integration — Angular

| Question                                                        | Answer                                                                                                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form the ecosystem expects?         | **No `model()`** — nothing is two-way. `input()` throughout, `output()` for `reveal`.                                                                              |
| Reactive Forms and template forms?                              | **No.** A placeholder is not a control and carries no value; `ControlValueAccessor` would be a lie about what it is.                                               |
| Can an application set defaults once?                           | **Yes.** `SKELETON_DEFAULTS_TOKEN` and `provideSkeletonDefaults()`.                                                                                                |
| Can a template reach the instance?                              | **Yes.** `exportAs: 'slSkeleton'`, `'slSkeletonText'`, `'slSkeletonRegion'`.                                                                                       |
| Can a consumer substitute projected content, and keep it lazy?  | **Yes.** `<ng-content>` in every component; the selectors are bare attributes, so the element itself stays the consumer's.                                          |
| Correct with zoneless change detection and `OnPush`?            | **Yes.** Signals throughout, `computed` for every derived value, no `markForCheck`.                                                                                |
| Is every subscription and listener torn down?                   | **Yes.** The only resource is the timer inside the loading machine, cleared through `DestroyRef`.                                                                   |
| Does a static attribute the consumer wrote survive?             | **Yes.** `aria-hidden` is read with `HostAttributeToken` before the host binding writes over it — that is the escape hatch.                                          |
| Does an entry point others depend on stay a single class?       | **Yes.** `@slotted/angular/skeleton` exports the three components and the provider, and nothing reaches into another family's source.                               |

## Asymmetry, recorded rather than levelled

Angular gets a DI token that React answers with context; React gets a `render`
prop that Angular answers by putting the selector on the consumer's own
element. Neither is made to imitate the other, and neither binding is missing a
capability the other has.
