# Status Indicator — family design

Wave 2, guide 9, new family. Written before any code, as
`.claude/skills/component/SKILL.md` step 5 requires, because the family decides
responsibility, anatomy, composition and cross-framework behaviour for the
first time and it adds six tokens to the foundation's glyph scale.

Scope, from `docs/build-order.md`: “ponto, ícone ou rótulo curto de estado
operacional, sempre com texto acessível e alternativa não cromática. Pulso só
para mudança viva, respeitando reduced motion.”

---

## 1. Surveyed

Nine implementations, read on 2026-09-02. They disagree with each other on
purpose: two ship the mark alone, three ship a vocabulary of statuses, two ship
artwork per status, and two ship the animation.

| Library                      | What it calls the family      | Source                                                                                                                      |
| ---------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| React Spectrum (Adobe)       | `StatusLight`                 | <https://react-spectrum.adobe.com/react-spectrum/StatusLight.html>                                                          |
| Chakra UI v3                 | `Status.Root` / `.Indicator`  | <https://chakra-ui.com/docs/components/status>, recipe `packages/react/src/theme/recipes/status.ts`                          |
| Ant Design v6                | `Badge` with `status`, `text` | <https://ant.design/components/badge>, style `components/badge/style/index.ts`                                              |
| Fluent UI React v9           | `PresenceBadge`               | `packages/react-components/react-badge/library/src/components/PresenceBadge/{PresenceBadge.types.ts,usePresenceBadge.tsx}`   |
| Carbon (IBM)                 | Status indicator (a pattern)  | <https://carbondesignsystem.com/patterns/status-indicator-pattern/>                                                         |
| Primer (GitHub)              | `StateLabel`                  | <https://primer.style/components/state-label>                                                                               |
| Mantine v8                   | `Indicator`                   | <https://mantine.dev/core/indicator/>, `Indicator.tsx` and `Indicator.module.css`                                            |
| Shoelace                     | `sl-badge` with `pulse`       | `src/components/badge/badge.{component,styles}.ts`                                                                          |
| Atlassian Design System      | `Lozenge`                     | <https://atlassian.design/components/lozenge/examples>                                                                      |

Radix Primitives, Base UI, Ark UI and React Aria Components ship no member of
this family at all: it holds no interaction, so a headless behaviour library
has nothing to hold. That is the reason the field's answers are so different
from one another — every one of them is a design system's opinion rather than a
pattern's implementation.

Two divisions run through the nine.

- **What the mark is.** Spectrum, Chakra and Ant draw a coloured disc and put
  the words beside it. Fluent, Carbon and Primer draw a symbol, and the symbol
  is what tells two statuses apart without colour.
- **Where it sits.** Spectrum, Chakra, Carbon's icon and shape indicators,
  Primer and Atlassian put the mark inline, beside its own name. Ant, Mantine,
  Fluent and Carbon's badge indicator put it on the corner of something else.

## 2. Table stakes

Every capability two or more of the nine ship.

| Capability                                       | Who ships it                                                     | Verdict                | Reason                                                                                                                                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A closed vocabulary of statuses                  | Spectrum, Chakra, Ant, Fluent, Carbon, Primer                    | adopt                  | Six values — `neutral`, `info`, `success`, `warning`, `danger`, `unknown` — each mapping to one of the library's five tones and to one glyph.                                                              |
| A coloured disc as the compact mark              | Spectrum, Chakra, Ant, Mantine                                   | adopt                  | `mark="dot"`, the default, drawn as `badge`'s dot is: one em across, rimmed with `--slotted-border-strong` so it clears 3:1 in all three schemes.                                                          |
| A symbol per status                              | Fluent, Carbon, Primer                                           | adopt                  | `mark="icon"`, six glyph tokens added to the foundation. This is the family's non-chromatic alternative, and section 5 records what it cost.                                                               |
| A visible label beside the mark                  | Spectrum, Chakra, Ant, Carbon, Primer, Atlassian                 | adopt                  | The projected content is the label. It wraps rather than truncating — section 5 says why this family differs from `badge` here.                                                                            |
| An accessible name when no label is visible      | Spectrum (`aria-label`, required), Fluent (`aria-label`, built)  | adapt                  | Neither is enough. Spectrum leaves a nameless dot if the consumer forgets; Fluent hard-codes English. This family renders a real, clipped word from a replaceable table, so it is named and it translates. |
| Three size steps                                 | Chakra, Fluent, Primer, Carbon (two)                             | adopt                  | `sm`, `md`, `lg`, reading the control type and glyph scales so they answer density.                                                                                                                       |
| An animation for “changing now”                  | Ant (`processing`), Mantine (`processing`), Shoelace (`pulse`)   | adapt                  | `pulse`, a ring expanding out of the mark. All three surveyed animations loop forever with a literal duration and no reduced-motion guard; ours takes `--slotted-duration-loop-slow` and stops. Section 4. |
| Placing the mark on the corner of something      | Ant, Mantine, Fluent, Carbon                                     | decline — `badge` owns | `badge` already ships `anchor`, `placement` and `overlap`. Composition is written out below.                                                                                                               |
| A count in the mark                              | Ant, Mantine, Carbon                                             | decline — `badge` owns | A number is metadata, which is `badge`'s subject; this family reports an operational state, which has no cardinality.                                                                                      |
| An arbitrary colour on the mark                  | Ant (`color`), Mantine (`color`), Spectrum (label colours)       | decline                | The five tones are the library's shared vocabulary and the status vocabulary maps onto them. A seventh colour is retuned per context through the family's own tokens, which section 5 lists.                |
| A live region around the status                  | Spectrum (advises `role="status"`), Shoelace (writes it, always) | adapt                  | `live="off" \| "polite" \| "assertive"`, off by default. Shoelace makes every badge a live region, which announces text nobody changed.                                                                    |

The decline for anchoring, written as the consumer code that replaces it:

```tsx
<BadgeAnchor overlap="circle">
  <Avatar name="Ada Lovelace" />
  <Badge shape="dot" tone="success">
    <VisuallyHidden>Online</VisuallyHidden>
  </Badge>
</BadgeAnchor>
```

The cost is real and is recorded rather than hidden: a corner mark composed
this way carries `badge`'s dot, so it cannot carry this family's status glyph.
A product that needs the glyph on a corner puts the whole indicator there
itself. Two families placing a mark on a corner would be two answers to one
question, which is the objection `docs/build-briefing.md` records against
two families owning measure.

## 3. Differentiators

| Capability                                              | Why no surveyed implementation has it                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A name that cannot be forgotten, in the reader's language | Spectrum's page says an `aria-label` “must be provided”, and nothing enforces it; Fluent builds one from `DEFAULT_STRINGS`, which is English and not replaceable. Here the fallback name is rendered as clipped text, and the whole table is replaceable through the defaults provider — one decision per application, as `kbd` does for its key names.            |
| Three colour schemes and three densities on one markup    | Every surveyed implementation ships one scheme's palette and one density. The mark reads the tone roles and the control scales, so `high-contrast` and `dense` are answered without a second stylesheet.                                                                                                                                                          |
| A pulse that stops rather than hurries                    | Mantine animates `processing 1000ms linear infinite` and Shoelace `pulse 1.5s infinite`; neither writes a `prefers-reduced-motion` rule, and Ant's `badgeProcessingDuration` is a theme number outside any such query. Ours is a loop-scale token, and the ring is withdrawn under reduced motion because a ring frozen mid-expansion is a rendering fault.        |
| A label that wraps instead of being cut                   | Primer, Atlassian and Ant all keep the status text on one line. A status is often a sentence — “Waiting for approval from the security team” — and half of it is a wrong instruction rather than a shorter one. The mark holds the first line's cap height, so a two-line status still reads as one object.                                                        |
| The mark's artwork is retunable without a new component   | `--slotted-status-indicator-mark-image` is a mask a consumer can replace per context, so a product's own status — “syncing”, “quarantined” — is a CSS rule keyed on the tone it borrows, not a fork of the family.                                                                                                                                                |

## 4. Gaps

What no surveyed implementation handles well, and a product hits anyway.

| Gap                                                | What this family does                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A status that changes while the page is open       | The three that animate say nothing about announcing. `live` decides the role once — `status` for polite, `alert` for assertive — and the region is the whole indicator, so the mark and its word are announced together rather than as two events.                                                     |
| The unnamed dot                                    | Ant renders `<Badge status="success" />` with no text at all and no name; Mantine's indicator is a `div` with a background colour. Here a mark with no visible label still carries its word, clipped.                                                                                                  |
| Reduced motion on an endless animation             | Three of the nine loop forever with no guard. Ours stops; the label and the glyph carry what the pulse was saying.                                                                                                                                                                                     |
| A status inside a dense table, hundreds of rows    | The mark is one em and takes its type from the control scale, so a `dense` table shrinks the indicator with the rest of the row instead of pushing the row taller. There is no per-row animation unless the row asked for one.                                                                         |
| Forced colours                                     | Carbon's shape indicators and Ant's ripple are backgrounds and gradients, which the operating system does not remap. The mark is a border and a background painted from tone roles the theme remaps, and the glyph is a mask over `background-color`, so it survives; the pulse ring is a border.       |
| A single unbroken token as the label               | None of the nine says. `overflow-wrap: anywhere` on the label, so a 40-character deployment id breaks instead of widening the table column past the viewport.                                                                                                                                          |

The inventory's exit condition: a reader who knows `StatusLight`,
`PresenceBadge` or Ant's `Badge status` can point at anchoring, counts,
arbitrary colours and per-status shapes, and find each one answered above.

---

## 5. Decisions

### 5.1 The status vocabulary, and what each value paints

Six values. Each names an operational state, maps to one of the library's five
tones, and owns one glyph. The words in the last column are the fallback name,
and they are what a reader hears when there is no visible label.

| `status`   | Tone        | Glyph                              | Stands for                              | Fallback name |
| ---------- | ----------- | ---------------------------------- | --------------------------------------- | ------------- |
| `neutral`  | `secondary` | `--slotted-icon-circle`            | Draft, archived, not started, inactive  | Neutral       |
| `info`     | `accent`    | `--slotted-icon-circle-info`       | Live, active, in use, published         | Information   |
| `success`  | `success`   | `--slotted-icon-circle-check`      | Succeeded, complete, healthy, online    | Success       |
| `warning`  | `warning`   | `--slotted-icon-triangle-alert`    | Degraded, needs attention, expiring     | Warning       |
| `danger`   | `danger`    | `--slotted-icon-circle-x`          | Failed, error, offline, breached        | Error         |
| `unknown`  | `secondary` | `--slotted-icon-circle-question`   | No data, unreachable, not reported      | Unknown       |

`neutral` and `unknown` share a tone and differ by mark: `neutral`'s dot is
filled and `unknown`'s is hollow, which is the difference between “nothing is
happening” and “nobody knows”. Colour never separates them, so the distinction
survives the `high-contrast` scheme and greyscale.

Declined: a `busy` or `processing` status, which Ant and Carbon both ship.
`pulse` expresses “changing now” on any of the six — a failing deploy pulses
`danger`, which Ant cannot say — and a determinate wait is
`progress-indicator`'s, which the same wave consolidated for exactly this
reason.

### 5.2 Two marks, and no third

`mark="dot"` is the compact form and `mark="icon"` is the non-chromatic one.

The dot is drawn as `badge`'s dot is drawn, and deliberately so: a status dot
and a badge dot on the same page are the same object. One em across, so it is
the height of the type it stands beside at every size and every density, and
rimmed with `--slotted-border-strong` — the one border token the theme holds to
3:1 against the surface it separates — because a mark whose whole meaning is a
graphic is bound by WCAG 2.2 1.4.11 rather than merely decorated by it.

The icon is the glyph in the tone's own `text` role, on no ground of its own.
Two readings decided against the filled disc with a knocked-out symbol that
Fluent and Carbon both draw: at `sm` the knockout is 1.75 device pixels of
stroke inside a 14-pixel disc, and the tone `text` roles are the ones the
theme's contrast test holds to the 4.5:1 text ratio, which is more than the
3:1 a meaningful graphic needs and more than a knocked-out symbol can promise
across five tones and three schemes.

Declined: Carbon's shape indicator, a third mark whose silhouettes — circle,
diamond, triangle, square — carry severity without a symbol. The icon mark
already gives each status a distinct silhouette, five circles and one triangle,
and a second non-chromatic system would be two answers to one question.

### 5.3 Six glyph tokens added to the foundation

This is the one decision that reaches outside the family, and
`docs/build-briefing.md` names that as something to state at the gate rather
than to ask about.

`--slotted-icon-circle`, `--slotted-icon-circle-info`,
`--slotted-icon-circle-check`, `--slotted-icon-triangle-alert`,
`--slotted-icon-circle-x` and `--slotted-icon-circle-question` join the glyph
scale in `packages/tokens/src/contract.json`,
`packages/themes/default/src/theme.json` and `docs/token-foundation.md`, in
lockstep, taking the primitive layer from 62 tokens to 68.

The justification the foundation asks for:

- The existing eight glyphs cannot say “caution”, “no data” or “information”,
  and the three that could be borrowed — `check`, `x`, `minus` — are the bare
  marks a checkbox and a tag's remove button draw *inside* a container the
  control provides. A status icon carries its own container, so the circled
  forms are the right artwork rather than a stylistic preference.
- They are the wave's icon set rather than this family's luxury. `alert`
  and `inline-message`, the next two entries in wave 2, are both required by
  `docs/build-order.md` to communicate their five tones “por texto e ícone
  além de cor”, and they consume the same six.
- They are drawn in the same idiom as the eight already there: a 24-unit view
  box, `stroke="black"` with round caps and joins, so the mask reads the same
  weight as `check` and `chevron-down` beside it.

### 5.4 The name is text, never a label attribute

`role="img"` with an `aria-label`, which is Fluent's answer, is refused. The
name is real text in the document, either the visible label the consumer wrote
or a word this family clipped from view with `visually-hidden`.

Three things follow that an `aria-label` cannot give: the region announces its
own content when `live` is on, an `aria-labelledby` elsewhere on the page can
point at it, and a reader searching the page finds the word. The cost is one
extra element in the tree when there is no visible label, and a `:has()` rule
that takes the gap back when that element is all the label holds.

The fallback words are English in the default table and replaceable in one
decision per application, through `StatusIndicatorDefaultsProvider` in React
and `provideStatusIndicatorDefaults` in Angular — the shape `kbd` established
for its key names.

### 5.5 The label wraps

`badge` clips its label to one line with an ellipsis, and records why: a badge
holds a count or a word, and a badge that reflows into a paragraph has stopped
being one. This family decides the opposite, because a status is frequently a
sentence and half a sentence is a wrong instruction rather than a short one.

The mark therefore cannot be centred on the whole box: it is given a box one
line tall and centred inside that, so it sits on the first line's cap whether
the label runs to one line or four. The rule is the one `skeleton` uses to put
an inline bar on the cap line, and `1lh` is what makes it answer density
without a number.

### 5.6 The pulse

A ring expanding out of the mark and fading, on `::after`, taking
`--slotted-duration-loop-slow` from the motion scale.

It is an enhancement rather than the state: the status is already carried by
the tone, the glyph and the word, so withdrawing the ring under
`prefers-reduced-motion: reduce` loses nothing. It is withdrawn rather than
frozen, for the reason `button` recorded about its loading band — a ring
stopped halfway through an expansion is a rendering fault, not a state.

`pulse` is a boolean rather than a status value, so a product can pulse any of
the six. The reference page says what it is for and what it is not: a live
change the reader has to notice, never decoration on a status that has been
`success` for a week.

### 5.7 No state model

The family holds no mutable value. `status` is the application's, reported and
never requested — the same relationship `progress` declares in
`specs/contract.schema.mjs` — so there is no controlled and uncontrolled pair
and no change request to carry a reason. A component that moved its own status
would be lying about a system it cannot observe.

---

## 6. Sourcing the accessibility pattern

`.claude/skills/component/references/patterns.md` asks for the applicable APG
pattern, read rather than recalled.

**There is none.** The pattern index at
<https://www.w3.org/WAI/ARIA/apg/patterns/> (read 2026-09-02) lists thirty
patterns — accordion, alert, alertdialog, breadcrumb, button, carousel,
checkbox, combobox, dialog-modal, disclosure, feed, grid, landmarks, link,
listbox, menubar, menu-button, meter, radio, slider, slider-multithumb,
spinbutton, switch, table, tabs, toolbar, tooltip, treeview, treegrid,
windowsplitter — and none of them is a status indicator. The page does not
contain the word.

The closest official guidance, and what each contributes:

| Source                                                                                                                                 | What it requires                                                                                                                                                                            | Where this family answers it                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ARIA `status` role — <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role>                      | A live region with implicit `aria-live="polite"` and `aria-atomic="true"`. Do not move focus when it updates. Naming a status is optional.                                                   | `live="polite"` writes `role="status"` on the root. Nothing in the family takes focus.                             |
| APG Alert pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/alert/>                                                                   | `role="alert"` interrupts; it is for a message that needs immediate attention and must not be used for routine updates.                                                                      | `live="assertive"` writes `role="alert"`, and the page says the word “interrupts” rather than recommending it.      |
| WCAG 2.2 SC 1.4.1 Use of Color (Level A) — <https://www.w3.org/TR/WCAG22/#use-of-color>                                                 | Colour is not the only visual means of conveying information.                                                                                                                               | The visible label, or `mark="icon"`, or both. A dot with no label still carries its clipped word.                  |
| WCAG 2.2 SC 1.4.11 Non-text Contrast (Level AA)                                                                                        | A graphical object required to understand the content needs 3:1 against what is adjacent.                                                                                                   | The dot's rim is `--slotted-border-strong`, held to 3:1 by the theme. The glyph is a tone `text` role, held to 4.5:1. |
| ARIA `img` role — <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role>                            | A group of elements read as one image; requires a name.                                                                                                                                     | Deliberately not used — section 5.4 records the cost.                                                              |

Keyboard: the family has none, because it holds no interaction. The root is
focusable only when a consumer substitutes it for an `<a>` or a `<button>`
through `render` or through their own element, and the family paints
`:focus-visible` for exactly that case — the decision `badge` took first.

---

## 7. Integration, both bindings

`.claude/skills/component/references/frameworks.md` asks every line to be
answered before either binding is written.

### React

| Question                                                          | Answer                                                                                                                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, and a request carrying a reason? | No mutable value. `status` is reported by the application and never moved by the family — section 5.7.                                                        |
| Application-wide defaults?                                        | `StatusIndicatorDefaultsProvider` and `useStatusIndicatorDefaults`, holding `mark`, `size`, `live`, `pulse` and the `labels` table.                           |
| Substituting the rendered element of each public part?            | `render(props)` on the root. `mark` and `label` are the family's own boxes and are documented as such; a consumer replacing them would take the paint with it. |
| Does the consumer's handler still run?                            | The family binds no handler at all, so every native listener the consumer writes reaches the element untouched.                                               |
| Native element and imperative action?                             | `ref` reaches the root. There is no imperative handle: the family has no action a page cannot express declaratively.                                          |
| Server render without a hydration mismatch?                       | No identifier is generated, no layout is read during render, and the fallback label is a pure function of `status` and the provider.                          |
| Every state a consumer may style in the DOM?                      | `data-ui`, `data-part`, `data-status`, `data-mark`, `data-size`, `data-pulse`. `focus-visible` is the pseudo-class.                                           |
| Props typed as the native element's, extended?                    | `ComponentPropsWithRef<'span'>` plus the family's own.                                                                                                       |

### Angular

| Question                                          | Answer                                                                                                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form?                 | None to hold. Every input is `input()`; there is no `model()` and no `output()`, and section 5.7 says why.                                                                     |
| Reactive Forms and template forms?                 | No. The family reports a state; it holds no value a form could submit.                                                                                                        |
| Application-wide defaults?                        | `STATUS_INDICATOR_DEFAULTS_TOKEN`, `provideStatusIndicatorDefaults()` and `injectStatusIndicatorDefaults()`.                                                                   |
| Template reaching the instance?                   | `exportAs: 'slStatusIndicator'`.                                                                                                                                              |
| Substituting projected content, kept lazy?        | A single default `<ng-content>` with **fallback content** — the clipped word renders only when the consumer projects nothing, which is how Angular answers what React answers with `children === undefined`. |
| Zoneless and `OnPush`?                            | Signals throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`.                                                                                                      |
| Every subscription torn down?                     | None is opened. The pulse is CSS.                                                                                                                                             |
| A static attribute the consumer wrote surviving?  | `role` is read once with `HostAttributeToken` before `live` writes one, so a consumer's own role is never replaced.                                                            |
| An entry point others depend on staying one class? | Published as `@slotted/angular/status-indicator` with one `ng-package.json`; `visually-hidden`'s stylesheet is imported by path, as `skeleton` imports it.                     |

### Both

The consumer's explicit value wins over the provider in every case. The
conceptual contract is shared; the two APIs are not identical, and the one
asymmetry is deliberate: Angular's fallback `ng-content` does the work React's
`children` check does, because that is each ecosystem's own way of asking
whether the consumer supplied a label.

---

## 8. Anatomy

| Part           | Element | Always present | What it is                                                                                                             |
| -------------- | ------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `root`         | `span`  | yes            | Carries `data-ui="status-indicator"`, the axes as data attributes, the live role when `live` is on, and native props.  |
| `mark`         | `span`  | yes            | The disc or the glyph. A box one line tall, so the mark sits on the first line's cap however far the label wraps.      |
| `label`        | `span`  | yes            | The words. Wraps, breaks an unbroken token, and shrinks inside the flex root.                                          |
| `announcement` | `span`  | no             | The status's own word, clipped by `visually-hidden`, rendered only when the consumer supplied no visible label.        |

## 9. States and combinations

| State           | When                                            | What is painted                                                                     |
| --------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| `default`       | always                                          | Tone, mark, label.                                                                  |
| `focus-visible` | the root became a link or a button through `render` or the consumer's own element | The focus ring at the shared offset — the case `badge` paints for the same reason. |

There is no `disabled`, no `hover` and no `active`: the family is furniture,
and a status that dimmed itself would be reporting something about the reader
rather than about the system. `pulse` is an appearance, not a state, and is
therefore an attribute the stylesheet reads rather than a member of the state
vocabulary.

## 10. Density, direction, schemes, extremes

- **Density.** Type from `--slotted-control-font-size-*`, glyph from
  `--slotted-control-icon-size-*`, dot from the resolved font size, gap from
  the space scale. A `dense` row shrinks the indicator with the rest of it.
- **Direction.** Every rule logical. Nothing in the artwork is directional, so
  no glyph mirrors; the mark leads in both directions because it leads the
  reading order in both.
- **Schemes.** `light`, `dark` and `high-contrast` are the tone roles' problem
  and the family reads them. Forced colours are the theme's, and the family
  writes no rule of its own beyond keeping the glyph a mask over a background
  colour rather than an image the system will not remap.
- **Loading.** Not applicable: the family reports a state rather than fetching
  one. A status not yet known is `unknown`, which is a value.
- **Empty.** A label of no words is the clipped fallback word.
- **Error.** `danger`, which is a value rather than a failure of the family.
- **Extreme content.** A four-line label, a translated one, a single unbroken
  40-character token, and a 240-pixel container: all four are scenes in the
  harness fragment and demonstrations on both reference pages.
