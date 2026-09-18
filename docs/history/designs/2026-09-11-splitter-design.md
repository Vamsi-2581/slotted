# Splitter design

Step 5 of `.claude/skills/component/SKILL.md`, written after the capability
inventory in `2026-09-11-splitter-capability-inventory.md` and before either
binding.

`2026-08-31-splitter-design.md` is superseded. The splitter sections of
`2026-09-11-splitter-and-overlay-gestures-design.md` are superseded by this
document; its `drawer` and `dialog` sections stand and belong to the two runs
that follow.

---

## 1. The family is the separator. It holds no panels

One focusable bar with a grip, between two regions the consumer owns. It holds
the value, the limits, the snap points, the keyboard and the whole ARIA
contract. It holds no layout: the consumer applies the value to their own grid
or flex.

```tsx
const aside = useRef<HTMLElement>(null);

<div className="workspace">
  <aside ref={aside}>…</aside>
  <Splitter for={aside} defaultValue={0.24} min="200px" max={0.6} collapsible />
  <main>…</main>
</div>
```

This is a decision against the field, taken deliberately and reaffirmed three
times by the invocation. Seven of seven surveyed implementations hold panels.
What the panels buy is two things, and both are declined here with their owner
named:

- **Coupling between more than two regions** — moving one separator pushing a
  neighbour past its minimum. Declined: the consumer holds the layout, so the
  consumer holds the policy. Two adjacent bars each clamp independently, and a
  layout that needs them to negotiate is a layout whose owner already knows what
  should give.
- **Applying the measure** — declined, with §4 as the compensation: the bar
  writes the value as a custom property on the element it was handed, so the
  common case needs no state and no template.

The pane-manager capabilities the inventory listed — `collapsedSize` per panel,
nested groups, the responsive stack, persistence of a multi-panel layout — go to
`app-shell` in wave 8, which is the family that owns a page's regions. The
inventory's delta section records this.

**What is not lost.** The APG's whole Window Splitter pattern lands on the
separator, including `Enter`. A bar that owns `value`, `min` and `max` collapses
and restores without knowing what a panel is. Nothing in §7 is a departure.

**Cost.** A consumer wiring two bars in one layout writes two pieces of state
and decides which one absorbs a shrinking container. A consumer who wants a
panel to collapse to a rail rather than to nothing writes `collapsedValue`
rather than `collapsedSize` on a panel — the same number in a different place.

## 2. `orientation` is the bar's own line

The bar has no panels to describe, so `orientation` describes the bar, and
`aria-orientation` takes the same value. The two cannot disagree, which is the
one thing the superseded document's perpendicular rule existed to prevent.

| `orientation` | The bar | Regions | Arrow keys |
| --- | --- | --- | --- |
| `vertical` (default) | a vertical line | side by side | Left, Right |
| `horizontal` | a horizontal line | stacked | Up, Down |

`horizontal` is the default value of `aria-orientation` on `role="separator"`,
so the attribute is written only for the vertical bar. That is the rule
`divider` already follows: write the departure from the element's own semantics,
never the agreement with it.

The arrow pair is the one perpendicular to the line. The other pair is left
alone, so a page that scrolls still scrolls — the reason `tabs` declares
`crossAxisNavigates: false`.

## 3. The value is a fraction; the limits may be lengths

`value` is the fraction of the container taken by the region before the bar, in
`[0, 1]`.

`packages/core/src/extent/extent.ts:5-11` fixes the unit for this pattern and
line 17 already names `splitter` as its second consumer: `aria-valuenow`,
`aria-valuemin` and `aria-valuemax` are the fraction times a hundred, one clamp
covers the value and both limits, and no caller carries a pixel literal. Zag,
Ark and PrimeNG are percentage-only for the same reason.

**The limits are not required to be fractions.** `min` and `max` take a fraction
or a CSS length string, resolved against the container measured at the moment of
the clamp, through `resolveExtentLimit` added to `@slotted/core/extent`. Not one
of the seven can express "this navigation panel never goes below two hundred
pixels", and it is the commonest real constraint the family has. This is the
family's first differentiator.

A limit resolving outside `[0, 1]` is clamped to it, so a container narrower than
`min` reports a reachable number rather than one nothing can produce. The
reported value is always the clamped one: the announcement and the layout cannot
disagree.

## 4. The bar writes the measure on the element it was handed

`for` names the element the bar sizes — a ref in React, a template reference in
Angular. Omitted, it is the previous element sibling.

On that element the bar writes `--slotted-splitter-value`, the fraction as a
bare number, so the common case is CSS and needs no state at all:

```html
<aside style="inline-size: calc(var(--slotted-splitter-value, 0.24) * 100%)">
```

Writing a property on an element the family does not own would normally be the
family deciding someone else's layout — the argument `drawer.css` makes against
a push mode. It is not that here: `for` is the consumer handing the element over
by name, and the property is inert until a rule reads it. A consumer who wants
the value in state takes `onValueChange` instead and ignores the property.

`aria-controls` names the same element, so the thing the bar sizes and the thing
it announces are one thing rather than two that can drift.

**Cost.** The element must have an id for `aria-controls`; the family writes one
with `useId` when the consumer has not.

## 5. Anatomy

| Part | Element | Present | What it is |
| --- | --- | --- | --- |
| `root` | `div[role=separator][tabindex=0]` | always | The bar. The target, the tab stop, and the whole family |
| `line` ×2 | `span` | always | A hairline each side of the grip |
| `grip` | `span[aria-hidden]` | always | The mark in the middle |

Three elements, one of them the root. `drawer` keeps its own part named
`resizer` and this family's root is `splitter`: one gutter on a panel's edge and
one bar between two regions are not the same shape, and one word meaning two
things across two families is what `identity.test.mjs` exists to keep out.

## 6. The painting, from SAP, with the accent reserved for the keyboard

Derived from `SAP/fundamental-styles` `packages/styles/src/splitter.scss` and
`stories/BTP/splitter/grip-anatomy.example.html`, read in the source rather than
in the rendered page.

| State | Lines |
| --- | --- |
| rest | `var(--slotted-space-12)` long, gradient to transparent, `--slotted-border-subtle` |
| `:hover`, `[data-dragging]` | `flex-grow: 1` — the whole track — solid, `--slotted-border-strong` |
| `:focus-visible` | the whole track, `--slotted-focus-ring-color` |
| `[data-disabled]` | rest, at the disabled step; hover and press are held back, as `states.test.mjs` requires |

The grip sits `var(--slotted-space-9)` from each line, SAP's own `2rem` gap. The
track is `var(--slotted-space-6)` thick and the pointer reach is
`--slotted-target-min`, drawn by a transparent pseudo-element centred on it —
the construction `drawer`'s resizer already uses to make a thin picture a
WCAG 2.2 target.

**The accent appears only under keyboard focus.** SAP is the only one of the
seven that distinguishes hover from focus, and it is the correction the
invocation asked for by name: a separator whose resting and hovered states are
both drawn in the accent has spent the one colour that means "the keyboard is
here" on the two states where it is not.

Under forced colours the lines take `ButtonBorder` at rest and `Highlight` under
focus, because a gradient resolves to nothing there.

`cursor` is `col-resize` or `row-resize` by orientation, held across the whole
drag by `holdResizeGesture`, which `@slotted/core/extent` already exports.

## 7. Keyboard, against the pattern

Transcribed from `https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/`.

| Key | Effect | Focus | Source |
| --- | --- | --- | --- |
| `Tab` | Reaches the bar, which is the widget form of the role | the bar | platform |
| Arrow toward the start edge | Moves `EXTENT_STEP_PX`, or `EXTENT_LARGE_STEP_PX` with `Shift`; with snap points, to the adjacent stop | stays | `@slotted/core/extent` |
| Arrow toward the end edge | The mirror of it | stays | `@slotted/core/extent` |
| `Home` | To `min` | stays | `@slotted/core/extent` |
| `End` | To `max` | stays | `@slotted/core/extent` |
| `Enter` | Collapses to `collapsedValue` when `collapsible`, or restores the fraction held before the collapse | stays | the family |
| `F6` | Not implemented | — | — |

Double click does what `Enter` does not: it returns the bar to `defaultValue`.
The pattern assigns it nothing, and the seven surveyed implementations that ship
a reset all put it there.

`F6` is optional in the pattern and is a window-management convention belonging
to the application composing the regions, not to the separator. A deliberate
departure; its cost is that an application wanting pane cycling writes it, and
nothing here is in its way.

In a mirrored document the arrow that grows the region is the other one.
`anchorsAtStart` is the one fact both the pointer and the keyboard read, so they
cannot come to disagree about which way is bigger.

## 8. Wiring

- `role="separator"`, `tabindex="0"`, on the root.
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`: the fraction and the
  resolved limits, times a hundred, rounded.
- `aria-controls`: the element `for` names.
- `aria-labelledby`: that element's heading where it has one, or the consumer's
  own `aria-label`. A separator is named for the region it sizes, which is the
  pattern's own rule.
- `aria-orientation`: written only for the vertical bar, per §2.
- `aria-disabled` when resize is off; the tab stop stays, so a reader can still
  read the value.
- The grip is `aria-hidden`. It is a mark, and the bar around it is already named
  and already valued.

## 9. State

Two mutable values, each with the pair and the request `docs/state-and-events.md`
requires.

| Capability | Controlled | Uncontrolled | Request | Reasons |
| --- | --- | --- | --- | --- |
| `extent` | `value` | `defaultValue` | `onValueChange` | `pointer`, `keyboard`, `programmatic` |
| `open` | `collapsed` | `defaultCollapsed` | `onCollapsedChange` | `keyboard`, `pointer`, `programmatic` |

Collapse is its own state and not a value of the layout, because
`react-resizable-panels` persists the geometry alone and a restored panel comes
back indistinguishable from a very small one — the second gap the inventory
found. The restore fraction is held by the family: collapsing stores it,
expanding returns it, and a consumer receives both halves in the two requests.

`onResizeEnd` fires once when a drag settles, distinct from `onValueChange`,
which fires throughout. A consumer saving a layout saves once rather than sixty
times. Persistence is emitted and never written: a library reaching for
`localStorage` has decided a policy for the application.

The bar carries `data-dragging` while a drag is live, `data-expanded` while
collapsible and not collapsed, and `data-disabled`.

## 10. React integration

| Question | Answer |
| --- | --- |
| Controlled and uncontrolled pair, plus a request carrying a reason | yes — both rows of §9 |
| Defaults set once for the family | yes — `SplitterDefaultsProvider` and `useSplitterDefaults`, the shape `drawer` established |
| Substitute the rendered element of each part | yes — `render` on `Splitter`; `line` and `grip` are fixed, because a separator whose mark is a consumer's element is a separator that can contain a tab stop |
| The consumer's handler still runs | yes — composed, never replaced, on every pointer and key handler |
| Native element and the imperative action | yes — `ref`, and a `SplitterHandle` with `collapse()`, `expand()`, `reset()` and `focus()`. Responsive collapse cannot be expressed declaratively without the consumer duplicating the clamp |
| Server render without a hydration mismatch | yes — `useId` for the controlled element's id; no layout read during render, the first measure is in an effect |
| Every state a consumer may style is in the DOM | yes — `data-dragging`, `data-expanded`, `data-disabled`, `data-orientation` |
| Each part's props type is the native element's, extended | yes — `ComponentPropsWithRef<'div'>` |

## 11. Angular integration

| Question | Answer |
| --- | --- |
| Two-way value in the signal form | yes — `model()` for `value` and `collapsed`, `output()` for `valueChange` and `resizeEnd` carrying the request |
| Reactive Forms | no — a separator's position is not a form control; the family holds no value a form would submit |
| Defaults set once | yes — `SPLITTER_DEFAULTS` and `provideSplitterDefaults()` |
| A template can reach the instance | yes — `exportAs: 'slSplitter'` |
| Substitute projected content, kept lazy | no — the bar projects nothing. Its two children are its own picture, and a consumer's content inside a separator would be content outside the accessibility tree |
| Zoneless and `OnPush` | yes — signals throughout, `computed` for the ARIA triple; no `markForCheck` |
| Every subscription torn down | yes — `takeUntilDestroyed` on the `ResizeObserver` and on the document listeners a drag installs |
| A static attribute the consumer wrote survives | yes — `HostAttributeToken` for `aria-label` and `aria-orientation` |
| A single entry point | yes — `@slotted/angular/splitter` |

`for` in Angular is a template reference rather than a ref: `[for]="aside"` with
`#aside` on the element. Where it is omitted, the directive reads
`previousElementSibling`, which is what the React binding does too.

## 12. What this deliberately does not do

- **Panels**, and everything that follows from holding them. §1, with the owner
  named.
- **Responsive stack, tabs or master–detail.** `docs/component-features.md:223`
  asks for it. Deferred to `app-shell`, wave 8: turning two regions into tabs is
  choosing a navigation model. This family supplies the imperative collapse the
  shell drives.
- **Storage.** §9.
- **`F6`.** §7.
- **A grip that is a button.** SAP renders one, `tabindex="-1"`, performing
  nothing the separator does not. One tab stop, and no nested control for a
  screen reader to announce.

## 13. Scenarios the reference pages must carry

`playground`, `orientation`, `value`, `limits` (fractions and lengths side by
side), `collapse`, `snapPoints`, `reset`, `disabled`, `keyboard`, `two-bars`,
`persistence`, `composition`, `defaults`, `accessibility`.
