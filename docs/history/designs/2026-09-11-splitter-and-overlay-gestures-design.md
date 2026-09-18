# Splitter, and the gestures the overlay families got wrong

Written before any binding. It records seven decisions and what each costs.

It supersedes `2026-08-31-splitter-design.md`, which described a family holding
two panes. The family described here holds none.

The work has one origin: a reading of `drawer` against `dialog` that found four
defects, three of them visible and one of them a missing family. They are taken
together because three of the four share a stylesheet and a core module.

---

## 1. The drawer's scrim reaches parity with the dialog's, and a test holds it there

`dialog` already answered this complaint. `dialog.css:196-209` records the
correction and the measurement behind it: on the entrance curve the scrim was at
57.6 per cent of its ink by the second frame and 83 per cent by the fourth — a
curve written for something that travels, spent on something that only changes
ink. The standard curve over the long step measured 10.8 per cent at 25
milliseconds and 55 per cent at 100.

`drawer` never received it. `drawer.css:281-290` transitions the backdrop with
`--_move` — `--slotted-duration-medium` on `--slotted-easing-enter` — in both
directions, and `--_move` is shared with the inline drawer's own measure and
with a separator released onto a snap point.

The backdrop takes the dialog's pair:

```css
[data-ui='drawer'] > [data-part='backdrop'] {
  transition: opacity var(--slotted-duration-short) var(--slotted-easing-exit);
}
[data-ui='drawer'][data-open] > [data-part='backdrop'] {
  opacity: 1;
  transition: opacity var(--slotted-duration-long) var(--slotted-easing-standard);
}
```

`--_move` keeps the two jobs that are still its own and loses the third. The
comment at `drawer.css:100-110` that reasons about the scrim settling before the
panel lands is removed, because it is no longer what the file does.

**The ratchet.** `packages/styles/src/scrim-motion.test.mjs` reads the
declaration off `dialog`'s backdrop and asserts every other family carrying
`[data-part='backdrop']` matches it. It hard-codes no duration and no easing:
a foundation that retunes the scale retunes both families at once, and a family
added later that writes its own pair fails without anyone having to remember
these numbers.

**Cost.** The two families are coupled through a test. A family that ever needs
a scrim of its own has to state the exception in that file rather than simply
writing different values.

## 2. `splitter` is the bar, and holds no panes

The separator is the whole family. It owns the value, the limits, the snap
points, the keyboard and the ARIA; it owns no layout. The consumer applies the
value to their own grid or flex.

A family that holds panes has to answer what happens to the second pane's
content while the first is being dragged, whether a pane may collapse, what
collapse does to the DOM, and how three regions compose. Those are four product
decisions, and the consumer is already holding a layout in which the answers are
either obvious or already made. The bar answers none of them and fits every one.

It is also what makes the second consumer possible. `drawer`'s resizer is the
same separator against a different container; a family holding panes could not
be the thing inside a drawer's panel.

**Name.** `splitter`, unchanged. `docs/process/build-order.md:1174` and `:1253` already
list it under wave 8, and `docs/component-features.md:219` names the capability.
A rename would edit three documents for nothing.

**Cost.** Two adjacent bars in one layout — the shape the SAP Help Portal uses,
and the shape the reference page demonstrates — need the consumer to keep two
values and to decide which one absorbs a container that shrinks. The family
gives them no help with that beyond clamping each bar independently.

## 3. The value is a fraction; the limits may be lengths

`packages/core/src/extent/extent.ts:5-11` fixes the unit for this pattern: a
fraction of the container in `[0, 1]`, because the Window Splitter pattern's
`aria-valuenow`, `aria-valuemin` and `aria-valuemax` are that fraction times a
hundred, because one clamp then covers the value, the limits and the stops, and
because no caller carries a pixel literal. Line 17 of that file already names
`splitter` as the second family to answer it.

A splitter speaking pixels would use none of `extentAtPoint`, `nearestSnap`,
`stepExtent`, `extentBounds` or `orderSnapPoints`, and would arrive at the same
arithmetic a second time.

So the value is a fraction. The limits are not required to be:

```tsx
<Splitter
  orientation="vertical"
  value={value} onValueChange={setValue}
  min="200px" max={0.6}
  snapPoints={[0.2, 0.34, 0.5]}
  for={navigationRef}
/>
```

`min` and `max` accept a fraction or a CSS length string. A length is resolved
against the container measured at the moment of the clamp, through a new
`resolveExtentLimit` in `@slotted/core/extent`, and the resolved fraction is what
is clamped against and what `aria-valuemin` and `aria-valuemax` report. "This
navigation panel never goes below two hundred pixels" is a real constraint and a
fraction cannot state it; "never past sixty per cent of the window" is equally
real and a length cannot state it either.

The reported value is always the clamped one. A limit that resolves outside
`[0, 1]` is itself clamped to it, so a container narrower than `min` reports a
reachable number rather than one nothing can produce.

**Keyboard step.** `EXTENT_STEP_PX` and `EXTENT_LARGE_STEP_PX` — sixteen pixels,
sixty-four with `Shift` — converted against the measured container by
`stepAmountFromPixels`, which is what `drawer` already does.

**Cost.** The consumer's template multiplies: `` `${value * 100}%` `` rather than
`` `${value}px` ``. Two props take a union of two types, and both units appear in
the reference page because both are used.

## 4. Anatomy, and the painting the SAP splitter established

Three parts inside the separator, derived from
`SAP/fundamental-styles/packages/styles/src/splitter.scss` and its
`grip-anatomy.example.html`:

| Part | Element | Present | What it is |
| --- | --- | --- | --- |
| `bar` | `div[role=separator][tabindex=0]` | always | The target and the tab stop. Carries `aria-orientation`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-controls`, `aria-labelledby` |
| `line` ×2 | `span` | always | A hairline each side of the grip, `--slotted-border-width-thin`, `flex-basis: var(--slotted-space-12)` (4rem), fading to transparent away from the grip |
| `grip` | `span[aria-hidden]` | always | The mark in the middle, `var(--slotted-space-9)` (2rem) from each line |

SAP renders the grip as `button[tabindex=-1]`. Here it is a `span`: it performs
nothing the separator does not, and an element that is neither focusable nor
actionable should not be a button. One tab stop, and no nested control for a
screen reader to announce.

The painting, by state:

| State | Lines |
| --- | --- |
| rest | `var(--slotted-space-12)`, gradient to transparent, `--slotted-border-subtle` |
| `:hover`, `[data-dragging]` | `flex-grow: 1` — the whole track — solid, `--slotted-border-strong` |
| `:focus-visible` | the whole track, `--slotted-focus-ring-color` |

Transition `--slotted-control-transition-duration` on
`--slotted-control-transition-easing`.

The accent appears **only** under keyboard focus. That is the correction: a
separator whose resting and hovered states are both drawn in the accent has
spent the one colour that means "the keyboard is here" on the two states where
the keyboard is not.

**Cost.** The family draws something at rest, which `drawer.css:577`
currently argues against — "a separator that draws something at rest is a
decoration on an edge nobody is touching". That argument is overturned here and
the comment is rewritten with it. A resizable edge nobody can see is a
capability nobody finds, and every desktop application with a resizable pane
marks it.

## 5. `@slotted/core/extent` gains velocity, and no sibling module

No new core module. `extent.ts` holds the arithmetic and `gesture.ts` holds the
cursor and the selection lock, and between them they already cover everything
the pointer and the keyboard do to a continuous, snapped, clamped value.

Two additions, both arithmetic, both tested in `extent.test.ts`:

- `resolveExtentLimit(limit, containerPx)` — a fraction passes through; a CSS
  length is resolved against the container and clamped to `[0, 1]`.
- `projectExtent({ fraction, velocity, horizon })` — where the value is heading.
  A release picks the stop nearest the **projected** position rather than the
  instantaneous one, with a horizon of 150 milliseconds. This is what makes a
  short, fast flick reach the stop the hand was aiming at instead of the one it
  happened to stop on.

`velocity` is a fraction of the container **per second**, signed along the
panel's own axis, sampled by the binding over the last three pointer events so
that one stalled frame before release does not read as a stop. One unit for
velocity everywhere in the family, because two would be a conversion nobody
remembers which way round.

**Cost.** A third thing in `extent` that the name does not obviously cover. The
alternative — a `resize` module beside it — would split one pattern's arithmetic
across two files and leave every caller importing both.

## 6. The drawer's resizer is repainted from the splitter's parts

`[data-part='resizer']` gains the same three children and the same state table.
`--slotted-drawer-resizer-line-color` stops falling back to
`--slotted-tone-accent-border`; the accent is reached only under
`:focus-visible`. The contract's `anatomy.resizer` text — "a two-pixel line in
the accent border under the hand, under focus and under a drag, and no grip, no
dots" — is rewritten to what the family now draws.

One part, two paintings, decided by `data-side`:

- `start`, `end` — the splitter's picture: two hairlines and a grip.
- `top`, `bottom` — the grabber: the lines are not painted and the grip is a
  4 × 36 pixel pill on `--slotted-border-strong`, full radius, centred above the
  header.

No new part and no contract churn. The separator, its role, its tab stop and its
three ARIA values are unchanged on every side; what changes is what a sheet
draws, because a sheet is held differently from a sidebar.

**Cost.** The two families share a picture without sharing a stylesheet —
`packages/styles/src/identity.test.mjs` forbids `drawer` from reaching into
`splitter`'s rules. The declarations are written twice, about thirty lines, and a
third test in `scrim-motion.test.mjs`'s manner is not warranted for a shape this
small.

## 7. The sheet takes the whole mobile gesture model

The grabber is a mobile affordance, so it carries the mobile contract rather
than the half of it that is easy.

- **Reach.** The pill is 4 pixels thick and the target is `--slotted-target-min`,
  drawn by the transparent pseudo-element the resizer already uses.
- **Arbitration.** `touch-action: none` on the separator only; the body keeps
  `pan-y`. A drag starts when the press began on the grabber or on the header,
  or when the body is already at the start of its own scroll. A sheet that
  dismissed itself while the reader was scrolling its content would be a sheet
  nobody could read.
- **Dismissal.** By distance — released below `minExtent`, which
  `specs/components/drawer/contract.json` already declares — **or** by velocity,
  above 0.5 fractions of the container per second in the leaving direction,
  whichever comes first. Velocity is what today's model lacks, and it is why a
  short flick does nothing.
- **Release.** The nearest stop to the projected position, through
  `projectExtent`.
- **Past the end.** Movement beyond the largest stop is damped to a third of the
  pointer's distance, so the panel answers the hand without leaving its box.
- **The edge of the device.** `env(safe-area-inset-bottom)` is added to the
  footer's `padding-block-end` on `side="bottom"`.
- **Reduced motion.** The gesture stays; the settle after release is immediate.
  A preference about animation is not a preference about control.
- **Keyboard.** Unchanged. The grabber is the same separator, `Escape` still
  closes, and the arrow keys still move sixteen pixels.

The close a drag asks for is the family's ordinary cancellable request carrying
`pointer`. A consumer who refuses it leaves the panel at `minExtent`, which is
what the contract already says.

**Cost.** Velocity has to be sampled in both bindings, and a pointer stream that
delivers one event before release yields no velocity — that case falls back to
distance alone rather than guessing.

## 8. The four reference pages are rewritten against one product

`.claude/skills/component/references/stories.md` is binding and the current
pages do not meet it: `mode="inline"` is demonstrated with a `Line` placeholder
and a `Page` stub, which is the specimen the file forbids.

Eight pages — `drawer`, `dialog`, `alert-dialog`, `splitter`, in React and in
Angular — in one domain, **accounts receivable**, so that four families read as
one product rather than four bags of fragments.

| Family | What the scenes are, and what they compose |
| --- | --- |
| `splitter` | A document workspace with two bars in series: a `tree` of accounts, `prose`, and a `table` of entries. Limits as fractions and as lengths, snap points, the keyboard, a mirrored document, and the horizontal orientation |
| `drawer` | An invoice detail (`description-list`, `badge`, `tag`, a `table` of instalments); a filter panel (`form`, `field`, `select`, `date-picker`, `checkbox-group`); a navigation sidebar in `mode="inline"` carrying a real `tree` with the splitter's bar at its edge and the switch to `overlay` at a breakpoint; and a sheet of actions in a narrow viewport |
| `dialog` | Settling an invoice, with a `form`; attaching proof of payment, with `upload`; a reconciliation conflict carrying a `table` under `scroll="content"` |
| `alert-dialog` | An irreversible reversal; a batch cancellation naming its count; a session about to expire |

Coverage is counted against each family's capability inventory rather than
sampled: every axis value, every state, every replaceable part, every prop that
changes what is drawn. Scenes that occupy a screen use `.slotted-demo-viewport`
with `data-size="screen"`.

The scene that is only looked at stays non-modal, takes no focus and cannot be
dismissed, which the current `drawer.stories.tsx` already establishes and which
nothing here changes.

## 9. Accessibility contract

- The separator is `role="separator"` with `tabindex="0"` on every side and in
  both families, which is the focusable widget form the role takes in the
  Window Splitter pattern.
- `aria-valuenow`, `aria-valuemin` and `aria-valuemax` are the fraction times a
  hundred, rounded. The value reported is the clamped one: the announcement and
  the layout cannot disagree.
- `aria-controls` names the element the bar sizes — the `for` ref, or the
  previous element sibling when `for` is omitted. `aria-labelledby` names it too
  where it carries a heading, because a separator is named for the pane it
  sizes.
- `aria-orientation` describes the separator, not the panes: a bar between two
  side-by-side panes is `vertical`. The `orientation` prop describes the bar for
  the same reason, so the prop and the attribute never disagree.
- The grip is `aria-hidden`. It is a mark, and the separator beside it is
  already named and already valued.
- Under forced colours the lines take `ButtonBorder` at rest and `Highlight`
  under focus, because `--slotted-focus-ring-color` resolves to `Highlight`
  there and a gradient resolves to nothing.

## 10. Tests

| File | What it holds |
| --- | --- |
| `packages/core/src/extent/extent.test.ts` | `resolveExtentLimit` for both units and for a container of nought; `projectExtent` including zero velocity and a reversal |
| `packages/styles/src/scrim-motion.test.mjs` | Every `[data-part='backdrop']` matches the dialog's pair, read rather than written |
| `packages/styles/src/splitter/splitter.styles.test.mjs` | The three states, the logical properties, the forced-colours rule |
| `packages/react/src/splitter/splitter.test.tsx`, `packages/angular/splitter/src/splitter.spec.ts` | Clamp, snap, the keyboard map, reset on double click and on `Enter`, the ARIA triple, a mirrored document |
| `packages/react/src/drawer/drawer.test.tsx`, `packages/angular/drawer/src/drawer.spec.ts` | Velocity dismissal, distance dismissal, the refused close, the scroll-versus-drag arbitration |
| `specs/reference-pages.test.mjs` | Already the ratchet; the four families' pages leave `specs/legacy-reference-pages.json` if they are on it |

## 11. What this deliberately does not do

- **No collapse on the splitter.** A pane that collapses to nothing and comes
  back is what `drawer` is, and `side-navigation` in wave 8 is where the
  navigation form of it belongs.
- **No responsive pagination.** SAP's splitter turns into paged panes on a
  narrow viewport. That is a pane manager's behaviour, and this family holds no
  panes.
- **No N-pane coupling.** Three regions are two bars, and the consumer decides
  which one absorbs a shrinking container.
- **No change to the dialog's motion.** It was measured, corrected and accepted.
- **No new `min`/`max` on the drawer.** They exist, with defaults of `0.2` and
  `1`.

## 12. Order of work

Ten slices, each ending in a checkpoint at `.claude/progress/current.md`.

1. `resolveExtentLimit` and `projectExtent` in `@slotted/core/extent`, with tests
2. `packages/styles/src/splitter` — stylesheet, harness, tokens, styles test
3. `packages/react/src/splitter` and `packages/angular/splitter`, with the contract
4. The drawer's backdrop, and `scrim-motion.test.mjs`
5. The drawer's resizer repainted, and the contract's `anatomy.resizer` rewritten
6. The grabber, the velocity dismissal and the arbitration, in both bindings
7. The `splitter` reference pages, React and Angular
8. The `drawer` reference pages, React and Angular
9. The `dialog` and `alert-dialog` reference pages, React and Angular
10. `pnpm check:full`, harness captures, self-assessment

Two changes outside the families named, both consequences: `@slotted/core/extent`
gains two functions, and `docs/process/build-order.md` stops listing `splitter` as
outstanding.
