# Splitter capability inventory

Step 3 of `.claude/skills/component/SKILL.md`, produced from the field before
reading any implementation and before the design.

Mode: **create**. `specs/components/splitter/` does not exist.

---

## 1. Surveyed

Seven sources, chosen to disagree with each other: two headless behaviour
libraries, three opinionated design systems, one application-grade layout
library, and the pattern itself.

| Source | What it calls the family | Read at |
| --- | --- | --- |
| W3C WAI-ARIA APG | Window Splitter | `https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/` |
| Zag.js | Splitter — `root`, `panel`, `resize-trigger` | `https://zagjs.com/components/react/splitter` |
| Ark UI | Splitter — `Root`, `Panel`, `ResizeTrigger` | `https://ark-ui.com/docs/components/splitter` |
| react-resizable-panels | PanelGroup, Panel, PanelResizeHandle | `https://github.com/bvaughn/react-resizable-panels` README |
| SAP Fundamental Styles | BTP/Splitter — `pane-container`, `split-pane`, `resizer` | `SAP/fundamental-styles` `packages/styles/src/splitter.scss`, `stories/BTP/splitter/*.html` |
| PrimeNG | Splitter, SplitterPanel | `https://primeng.org/splitter` |
| Kendo UI for Angular | Splitter, SplitterPane | `https://www.telerik.com/kendo-angular-ui/components/layout/splitter/` |
| allotment | Allotment, Allotment.Pane | `https://github.com/johnwalley/allotment` README |

Radix Primitives, Base UI, React Aria and Angular Material ship no splitter at
all. That absence is itself a finding: the family is not table stakes for a
primitive library, and every source that does ship it ships a pane manager.

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability | Who ships it | Verdict | Reason |
| --- | --- | --- | --- |
| Panels as parts, each with an `id` | Zag, Ark, RRP, SAP, PrimeNG, Kendo, allotment | defer to `app-shell`, wave 8 | Seven of seven, and declined here anyway: the family is the separator. `aria-controls` names the element `for` hands it, and `Enter` collapses a value the bar owns, so neither of the two things a panel was needed for is lost. A page's regions belong to the shell |
| More than two panels | Zag, Ark, RRP, PrimeNG, allotment | decline | The consumer holds the layout, so the consumer holds the coupling policy. Two adjacent bars each clamp independently; a layout needing them to negotiate is one whose owner already knows what should give |
| Per-panel `min` and `max` | all seven | adapt | The limits live on the bar, which is the thing that enforces them. One bar, one pair |
| Initial size, and a controlled value | Zag, Ark, RRP, PrimeNG, Kendo, allotment | adapt | `value` / `defaultValue` / `onValueChange` — one fraction rather than an array, because one bar has one position |
| Collapse, with a collapsed size | Zag, Ark, RRP, Kendo, allotment | adapt | **The APG pattern's `Enter` requires it**, and a bar owning `value`, `min` and `max` collapses and restores without knowing what a panel is. `collapsedValue` on the bar rather than `collapsedSize` on a panel |
| Resize start and resize end, distinct from resize | Zag, Ark, PrimeNG, RRP | adapt | One `onLayoutChange` carrying a reason, plus `onResizeEnd`. A consumer saving a layout must not save sixty times per drag |
| Imperative collapse, expand, resize, reset | Zag, Ark, RRP | adopt | The handle in React and `exportAs` in Angular. Responsive collapse cannot be expressed declaratively without the consumer duplicating the clamp |
| Nested groups | RRP, PrimeNG, allotment | decline | A bar inside a region the consumer already owns is nesting, and it needs nothing from this family to work. The composing code is a second `<Splitter>` in the inner container |
| Disabled resize | Zag, RRP, Kendo | adopt | `disabled` on the root and on the trigger, held back for the stronger states as `states.test.mjs` requires |
| Configurable keyboard step | Zag (`keyboardResizeBy`), RRP | adopt | Defaults to `EXTENT_STEP_PX` / `EXTENT_LARGE_STEP_PX`, which `drawer` already uses |
| A visible grip on the separator | SAP, PrimeNG (`gutterSize`), Kendo | adopt | A resizable edge nobody can see is a capability nobody finds. This is what the invocation asked for by name |
| Cursor held across the whole drag | RRP (`disableCursor`), SAP | adopt | `holdResizeGesture` in `@slotted/core/extent` already does it |
| Snap to stops | allotment, RRP | adapt | `snapPoints` as fractions, through `nearestSnap`, which `drawer` already consumes |
| Layout persistence | RRP (`autoSaveId`), PrimeNG (`stateKey`, `stateStorage`) | adapt | The family emits and accepts; it does not write storage. A library that reaches for `localStorage` has made a policy decision for the application. The composing lines are three: `<Splitter defaultLayout={JSON.parse(localStorage.getItem('k') ?? 'null') ?? undefined} onResizeEnd={(l) => localStorage.setItem('k', JSON.stringify(l))}>` |
| Responsive stack, tabs or master–detail | PrimeNG, SAP (pagination) | defer to `app-shell`, wave 8 | Turning two panes into tabs is choosing a navigation model, and the family that owns navigation models is the shell. `docs/component-features.md:223` asks for it; the splitter supplies the imperative collapse the shell drives |

## 3. Differentiators

| What | Who has it | What this family does |
| --- | --- | --- |
| Limits expressible as a length **or** a fraction | none | Zag states plainly that it "only supports setting percentage values"; PrimeNG, Ark and allotment are percentage-only too. "This navigation panel never goes below two hundred pixels" is the commonest real constraint in the family and not one of the seven can state it. `min` and `max` take a fraction or a CSS length, resolved against the measured container |
| The accent colour reserved for keyboard focus | SAP, partly | SAP moves its decorations to the focus colour on focus and to a neutral on hover, and it is the only one of the seven that distinguishes the two. This family takes that rule and states it in the contract, so a theme cannot collapse hover and focus into one picture |
| Three schemes, three densities, logical properties | none | Six of the seven ship one scheme and physical properties. `dir="rtl"` mirrors the whole family, including which arrow key grows which panel, through `anchorsAtStart` |
| Two first-class bindings | Kendo and PrimeNG (Angular only), the rest (React only) | React and Angular from one contract, neither a wrapper over the other |
| The arithmetic shared with `drawer` | none | `@slotted/core/extent` is already the clamp, the snap and the step for `drawer`'s resizer. The splitter is its second consumer rather than its second implementation |

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap | What happens in the field | What this family does |
| --- | --- | --- |
| A container narrower than the sum of the minimums | RRP throws in development; Zag clamps silently and the last panel is crushed; PrimeNG overflows | The minimums are scaled down proportionally and `data-constrained` is written on the root, so the consumer can show the stack their layout actually needs |
| Collapse restored after a reload | RRP persists the layout but not which panel was collapsed; the panel comes back at its collapsed size and is indistinguishable from a very small panel | The collapsed set is part of the emitted layout, so restoring it restores the state and not only the geometry |
| A panel whose content has not arrived | none of the seven | `data-loading` on a panel keeps a floor under it, the way `drawer`'s body already does, so the layout does not jump when the data lands |
| Touch | Zag and allotment support it; the rest are pointer-only in practice because the target is the gutter's own width | The reach is `--slotted-target-min` drawn by a transparent pseudo-element centred on the gutter, which `drawer`'s resizer already establishes |
| A long panel label in the separator's accessible name | none name the separator at all beyond `aria-label` | `aria-labelledby` points at the panel's own heading where it has one, which is what the APG asks and what `drawer` already does |

## Exit

A reader who knows this family from Zag, from react-resizable-panels or from
SAP can point at collapse, at persistence, at N panels, at the resize-end event,
at nested groups and at the responsive stack, and find each one in a row above
with its verdict. The two the field does not have — limits as lengths, and a
container too small for its own minimums — are in Differentiators and Gaps.

## The decision against the field, and what it costs

The invocation asked three times for the separator alone — "só a barra divisória
mesmo", "um componente que é apenas o splitter", "apenas o 'grip' não o
componente de panel splitter". That is the decision, and
`2026-09-11-splitter-design.md` §1 is where it is recorded with its owner.

It is a decision against seven of seven surveyed implementations, so the reason
each declined capability is not lost matters more here than usual:

| What a panel manager buys | Where it goes instead |
| --- | --- |
| A thing for `aria-controls` to name | `for`, the element the consumer hands the bar |
| A thing for `Enter` to collapse | `value` and `collapsedValue`, which the bar owns. **The APG's whole Window Splitter pattern lands on the separator**; nothing in the keyboard table is unimplementable without panels |
| Applying the measure | `--slotted-splitter-value`, written on the `for` element, so the common case is CSS with no state |
| Coupling between three or more regions | The consumer, who owns the layout and therefore the policy |
| Collapse to a rail, nesting, the responsive stack | `app-shell`, wave 8 |

**The cost, stated plainly.** A consumer building the two-bar workspace the
invocation cited — the SAP Help Portal layout — writes two pieces of state and
decides which bar absorbs a shrinking container. Every one of the seven would
have decided that for them. The trade is that none of the seven can express a
two-hundred-pixel floor, which this one can, and that this one is the bar the
invocation wanted rather than a layout engine wrapped around it.

The prior design at `2026-09-11-splitter-and-overlay-gestures-design.md` was
written at step 5 without step 3. Its splitter sections are superseded. Its
`drawer` and `dialog` sections — the scrim's parity, the resizer's repaint, the
sheet's gesture — are unaffected and belong to the two runs that follow.
