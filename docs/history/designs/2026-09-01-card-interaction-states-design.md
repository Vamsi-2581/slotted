# Card interaction and appearance states

Second rebuild of `card`. The first one (`2026-09-01-card-family-design.md`)
settled anatomy, layout and surface. This one settles what the surface does when
a person touches it, and it changes the anatomy once: a choice card gets a place
for its control.

The trigger is a review finding: the three fills are one picture, the selected
card is a blue block, and the chooser is a browser-default radio dropped beside
a heading. The first two are visual defects. The third is an anatomy defect that
was recorded as a decision — "whole-card selection is a `<label>` around a native
input, which the platform already makes clickable edge to edge" — and then never
given a part, a column, a size or a state.

## Capability inventory

### Surveyed

Ten implementations, read on 1 September 2026. The three that matter most here
are the three that ship a real selection control inside the card.

| Source | Reference | What it calls the selectable form |
| ------ | --------- | --------------------------------- |
| IBM Carbon | <https://carbondesignsystem.com/components/tile/usage/>, `_tile.scss`, `RadioTile.tsx` | `SelectableTile` (`role="checkbox"` on the container) and `RadioTile` (hidden native input + sibling `<label>`) |
| Microsoft Fluent 2 | <https://fluent2.microsoft.design/components/web/react/core/card/usage>, `useCardStyles.styles.ts`, `useCardSelectable.ts` | `Card` with a visually hidden `checkbox` slot and an opt-in `floatingAction` |
| AWS Cloudscape | <https://cloudscape.design/components/cards/>, `src/item-card/styles.scss` | `Cards` with `selectionType` and `entireCardClickable`; a real native input in an absolutely positioned corner |
| Adobe Spectrum 2 | `@react-spectrum/s2/src/Card.tsx` | `Card` with a `slot="selection"` checkbox, top-leading, `excludeFromTabOrder` |
| Mantine | <https://mantine.dev/core/checkbox/>, `CheckboxCard.module.css` | `Checkbox.Card` / `Radio.Card` — a `<button>` carrying `role="checkbox"`, indicator placed by the consumer |
| Material Design 3 | `material-web/tokens/versions/v0_192`, `labs/card/internal/_shared.scss` | `Card` in elevated, filled and outlined; **no selectable card exists** |
| PatternFly | <https://www.patternfly.org/components/card/accessibility> | `Card isSelectable` + `CardHeader selectableActions` rendering a real `Radio`/`Checkbox` |
| Shopify Polaris | `polaris-react/src/components/Card/Card.tsx` | none — three props, no state at all; selection is `ChoiceList` |
| Nord | <https://nordhealth.design/components/card/> | none — "Card is a presentational surface and applies no implicit ARIA role" |
| Atlassian | <https://atlassian.design/components> | none — no Card component exists |

The WAI-ARIA Authoring Practices carry no card pattern
(<https://www.w3.org/WAI/ARIA/apg/patterns/>). The applicable patterns are
Checkbox (Space toggles), Radio Group (arrows move and check; Tab enters at the
checked button) and Link (Enter activates).

### Table stakes

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| A named part for the selection control | Fluent `checkbox` slot, PatternFly `CardSelectableActions`, Cloudscape `.selection-control`, Spectrum `slot="selection"` | **adopt** | `data-part="selection"`. Four of ten reserve a place for it; this family painted `data-selected` and reserved none. |
| Per-fill state paint | Fluent (four appearances, four state columns each), M3 (three variants, per-variant elevation ramps), Spectrum (four variants) | **adopt** | Each fill answers hover and press in the property that fill is made of. This is the defect the review named. |
| A pressed state | Fluent (`:active` per appearance), M3 (`pressed` per variant), Spectrum, HeroUI (`data-pressed`) | **adopt** | `active`. The family had none: a whole-surface target gave no feedback that it had been hit. |
| Selected plus hover as its own state | Carbon (`hover selected` is a documented row), Fluent (`selected + hover` column in all four appearances) | **adopt** | A selected card still has to answer the pointer. |
| Selection painted by a neutral inverse edge, not the brand accent | Carbon `$layer-selected-inverse`, Fluent `colorNeutralStroke1Selected`, Spectrum `gray-1000` | **adopt** | Three of the strongest systems refuse the accent here. It is also the only way to keep selection distinct from focus in this theme, where `--slotted-focus-ring-color` and `--slotted-tone-accent-border` are the same hex. |
| An edge that changes width without moving layout | Fluent `::after`, Cloudscape `::before`, M3 `.outline`, Carbon and Mantine reserve a transparent border | **adopt** | One pseudo-element carries the edge at every state. The family drew a real border *and* a second ring at a different radius. |
| Selection control at the inline start | Spectrum (top-leading), Mantine (leading, beside the label) | **adopt** | Trailing is taken: `actions` owns that corner. Carbon, Fluent and Cloudscape put selection trailing because none of them has an `actions` corner in the header. |
| `subtle` carries no border | Fluent — "`subtle`: similar to filled-alternative, but no border is applied" | **decline** | Adopted, rendered, and reverted on the evidence. Fluent's subtle background differs from its page; the high-contrast scheme here paints `--slotted-surface-sunken` and `--slotted-surface` the same white, so an edgeless subtle card had neither fill nor edge and stopped being a card. A hairline that reads as slightly redundant in two schemes fails more loudly than a card that disappears in the third. |
| Whole-card click and selection at once | Fluent (`shouldRestrictTriggerAction`), PatternFly (`isClickable` + `isSelectable`) | **decline** | Both platform families that allow it need JavaScript to suppress the toggle for nested focusables. Carbon and Cloudscape forbid it outright — "Don't use this property if the card has any other interactive elements." A card is a destination or a choice, never both. Recorded as a documented prohibition rather than a runtime guard. |
| The check and the dot geometry | Carbon (`CheckboxCheckedFilled`), Mantine (`Checkbox.Indicator`) | **defer to `checkbox radio-group`** | Wave 3, item 4, whose scope is "decisão única sobre onde desenhar o check e o dot". A card that draws its own check is the second answer to that question. Card ships the slot, its column, its size and its optical alignment; the glyph arrives with the family that owns it and needs no change here. |
| Focus trapping inside a card (`focusMode`) | Fluent only | **decline** | One implementation of ten, and it needs Tabster. Reaching the actions in a card is Tab, which is what every other surveyed system does. |
| A skeleton while loading | Ant Design only | **defer to `skeleton`** | Wave 2. Unchanged from the first design. |

### Differentiators

| Offered here | Not in any surveyed implementation |
| ------------ | ---------------------------------- |
| Selection that reads identically in light, dark and a 7:1 high-contrast scheme, from one declaration | Carbon, Fluent and Spectrum each hand-pick a selected colour per theme. `--slotted-surface-inverse` inverts by definition, so the selected edge is near-black on a light card and near-white on a dark one without a second value being authored. |
| A hover that never borrows the disabled grey | Fluent's `colorNeutralBackground1Hover` (`#f5f5f9`) and its disabled ground are both neutral greys one step apart. This family's `outline` hover moves the edge and the elevation and leaves the surface alone, so hover cannot be mistaken for disabled. |
| The selection control follows control density | Carbon reserves a fixed `1rem` icon; Fluent hides its checkbox entirely. Here the control reads `--slotted-control-icon-size-*`, so a card in a dense application gets a dense control — the axis the family previously answered nowhere. |
| Three fills whose state answers are each made of the property that fill is made of | Fluent is the only surveyed system that does this, and only for four appearances in one scheme pair. |

### Gaps

| Gap | What this family does |
| --- | --------------------- |
| Focus and selection painted in the same colour | The theme resolves `--slotted-focus-ring-color` and `--slotted-tone-accent-border` to `#2563eb` in the light scheme. A focused card and a selected card were the same image. Selection moves to the inverse surface; focus keeps the accent and stays outside the card at an offset. They now differ in colour, in width and in position. |
| A selected state calibrated on a badge and applied at card area | `--slotted-tone-accent-surface` is `#dbeafe` in light and `#181b22` in dark — four units from the card's own `#1c1c20`. The same token shouted at card scale in one scheme and vanished in the other. Selection no longer fills. |
| An elevated card that is not elevated | `--slotted-shadow-sm` under a hairline on white does not separate, and `0 1px 3px rgb(0 0 0 / 0.5)` on a `#131316` page is invisible. `elevated` rests at `--slotted-shadow-md`. |
| Nothing groups inside the card | Region gap equalled the outer inset at every size by construction (`md`: 1rem and 1rem). The header, the body and the footer sat as far from each other as from the card's edge. The region gap drops one step below the inset at every size. |
| A choice card with no title | The selection control lives in the header, because the string that names the choice is also the string that labels the control. A card with no header has nothing to label the control with, and the reference pages say so. |

## What changes

### Anatomy

One new part. Everything else is unchanged.

| Part | Attribute | Holds |
| ---- | --------- | ----- |
| selection | `data-part="selection"` | The control that makes the card a choice: a native checkbox or radio today, `<Checkbox>` when wave 3 ships it |

The header becomes a three-column grid when a selection is present: the control,
the title stack, the corner. `actions` moves from `grid-column: 2` to
`grid-column: -2 / -1`, which is the last column whether there are two or three.

The control is centred on the title's first row, like `actions`, and is sized
from `--slotted-control-icon-size-md`. It is raised above the stretched hit area
for the same reason `footer` and `actions` are.

### The interactive card

A card is interactive when it contains a destination or a choice:

```css
:has(:is([data-part='link'], [data-part='selection'] :is(input, button)):not(:disabled))
```

Every interactive rule was previously gated on `[data-part='link']` alone, which
is why the chooser — the one case the first design called "whole-card selection"
— answered nothing. The gate is written once and the states read variables it
sets.

`selected` and `disabled` stay mirrored, and neither becomes a capability. The
reasoning from the first design is unchanged: only the control can refuse an
interaction, and only the control holds the value. Wave 3 does not change that
either; it changes what is drawn inside the slot.

### The state palette

Resting and state values are custom properties declared per fill, and one gated
rule per state swaps them. Each fill answers a state in the property that fill is
made of, which is Fluent's model and the answer to the review's first complaint.

| Fill | Rest | Hover | Press | Selected |
| ---- | ---- | ----- | ----- | -------- |
| `outline` | raised surface, subtle edge, no shadow | edge → `border-strong`, shadow → `shadow-xs` | fill → `secondary-subtle-active` | edge → `surface-inverse` at 2px |
| `elevated` | raised surface, subtle edge, `shadow-md` | `shadow-lg` | `shadow-sm`, fill → `secondary-subtle-active` | edge → `surface-inverse` at 2px |
| `subtle` | sunken surface, subtle edge | surface → raised | surface → `secondary-subtle-active` | edge → `surface-inverse` at 2px |

`outline` never fills on *hover*. That is the fix for the finding that a hovered
card took the same grey as the disabled card beside it. It does fill on *press*,
and so does every other fill: a press is momentary and arrives with the pointer
already down, so the fill is unambiguous, and one press language across the three
fills is what makes the gesture feel the same everywhere on a page. Removing the
hover shadow instead was tried and photographed, and gave an outlined card no
readable feedback at all.

Selection paints an edge and nothing else. Carbon paints no fill on a selected
tile either; Fluent's selected background is a neutral, never its accent.

### The edge

One pseudo-element carries the edge at every state, over the whole border box:

```css
[data-ui='card']::before {
  border: var(--_card-edge-width) solid var(--_card-edge);
  border-radius: inherit;
  inset: 0;
  pointer-events: none;
  position: absolute;
}
```

The root keeps `border: none` and pays the inset in padding instead, so a 1px
hairline becoming a 2px selected edge moves no text. Five of the six systems that
solve this solve it the same way, three of them with a comment naming the reason.

The edge is a border rather than a box-shadow so that it survives
`forced-colors`, where a shadow is removed outright. Selection stays legible
there because the edge is *thicker*, not merely another colour — the rule the
first design established and this one keeps.

### Density

The card's inset stays on the `size` axis, unchanged: density governs control
geometry and `size` is the card's own inset. The selection control is control
geometry, so it reads `--slotted-control-icon-size-*` and the card now answers
density where density means something. Before this the comfortable and dense
captures of the card were byte-identical.

## Accessibility

The control is a real native input, so the platform supplies the role, the
checked state, Space, and — for radios sharing a `name` — the arrow-key
behaviour the APG Radio Group pattern requires. The card is the `<label>`, so the
whole surface is the click target with no script and no `role` on the container.

Carbon's `SelectableTile` and Mantine's `Checkbox.Card` put `role="checkbox"` on
the container instead and re-implement Space and the arrows. Both are declined:
the platform already does it, and a container carrying the role cannot also hold
the description text without absorbing it into the accessible name.

The control's box is 16px at comfortable density, below the WCAG 2.2 minimum of
24 × 24. The target is not the control: the card is the label, so the hit area is
the card. The token foundation asks a family to correct a small target by
expanding the hit area, and the hit area here is the whole surface.

Focus is the input's, and the ring is drawn on the card by `:has()`, matching how
the link's ring already works. Carbon does the same thing with
`.cds--tile-input:focus + .cds--tile`.

## Ecosystem integration

Both tables from the first design stand; only the rows that move are restated.

### React

| Question | Answered by |
| -------- | ----------- |
| Substituting the rendered element of each part | `render` on `CardSelection`, as on every other part |
| Part props are the native element's, extended | `CardSelectionProps extends ComponentPropsWithRef<'span'>` |
| Every state a consumer may style in the DOM | unchanged, plus `active` and `selected` answered together |

### Angular

| Question | Answered by |
| -------- | ----------- |
| A template reaching the instance | `exportAs: 'slCardSelection'` |
| Substituting projected content | `SlCardSelection` is a directive on the consumer's own element |
| Reactive and template forms | Still not the card's: the native input inside `selection` keeps its own accessor, and `[(ngModel)]` on it works untouched. |

## The contract break

| Was | Is | Move |
| --- | -- | ---- |
| six parts | seven parts, adding `selection` | Additive. Nothing moves. |
| states `default`, `hover`, `focus-visible`, `selected`, `disabled` | adds `active` | Additive. |
| `actions` at `grid-column: 2` | `grid-column: -2 / -1` | Internal; `data-part="actions"` is unchanged. |
| root drew its own `border` | root draws no border; `::before` carries the edge | A consumer styling `[data-ui='card'] { border: … }` now sets a border the family no longer reserves space for. Set `--slotted-card-border-color` and `--slotted-card-border-width` instead, which is what the tokens were always for. |
| `--slotted-card-selected-ring-width` / `-color` | `--slotted-card-edge-width-selected` / `--slotted-card-edge-color-selected` | Rename. The ring and the border are one thing now, so two names for two layers became one name for one. |
