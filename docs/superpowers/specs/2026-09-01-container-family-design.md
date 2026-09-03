# Container Family Design

## Outcome

`Container` bounds the inline size of a region, insets it from the edge of the
space it was given, and places it inside that space. It is the owner of
comfortable measure, which `docs/rebuild-briefing.md` assigned to this family
and to no other while Typography, Stack, Inline and Grid were built.

It paints nothing, separates nothing and claims no semantics. Separation is
Stack's, surface is Card's, and the element is the consumer's.

One capability the field ships in one implementation only comes with it: a
child may escape the bound and span the container edge to edge, so a page can
hold a bounded reading column and a full-width table without a second layout.

## Capability inventory

### Surveyed

| Implementation      | Called                | Read at                                                                                                 |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| Radix Themes 3      | `Container`           | <https://www.radix-ui.com/themes/docs/components/container>, and `packages/radix-ui-themes/src/components/container.css` on `main` |
| Material UI 7       | `Container`           | <https://mui.com/material-ui/react-container/>                                                          |
| Mantine 8.2         | `Container`           | <https://mantine.dev/core/container/>, and `packages/@mantine/core/src/components/Container/Container.module.css` on `master` |
| Chakra UI 3         | `Container`           | <https://chakra-ui.com/docs/components/container>                                                       |
| Bootstrap 5.3       | `.container`          | <https://getbootstrap.com/docs/5.3/layout/containers/>                                                  |
| Primer (GitHub)     | `PageLayout`          | <https://primer.style/components/page-layout>                                                           |
| Tailwind CSS 4.3    | `max-w-*`, `container`| <https://tailwindcss.com/docs/container>                                                                |
| Tailwind Typography | `prose`               | `src/styles.js` on `master`, `maxWidth: '65ch'`                                                          |
| IBM Carbon          | 2x Grid               | <https://carbondesignsystem.com/elements/2x-grid/overview/>                                             |
| W3C                 | SC 1.4.8, SC 1.4.10   | <https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html>, <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html> |

The nine implementations disagree usefully. Bootstrap and Carbon step the
maximum at viewport breakpoints; Radix, Mantine, MUI and Chakra state one
maximum and let it collapse; Primer folds the container into a page layout;
Tailwind refuses to centre or pad at all and makes both the consumer's job.
Only Mantine ships an escape from the bound. Only Tailwind Typography states a
maximum in characters rather than pixels, and it is the only one of the nine
whose maximum survives a reader enlarging the text.

Their maxima, for reference:

| Library      | Steps                                                        |
| ------------ | ------------------------------------------------------------ |
| Radix Themes | 448 · 688 · 880 · 1136 px, default `4`                       |
| Mantine      | 540 · 720 · 960 · 1140 · 1320 px, default `md`               |
| MUI          | breakpoint names `xs`–`xl`, default `lg`                      |
| Chakra       | recipe `maxW`, default `8xl` = 1440 px                        |
| Bootstrap    | 540 · 720 · 960 · 1140 · 1320 px, stepped by viewport         |
| Primer       | `medium` · `large` · `xlarge` · `full`, default `xlarge`       |

### Table stakes

| Capability                                    | Who ships it                                                     | Verdict            | Reason                                                                                                                                                                                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A maximum inline size, chosen from named steps | all nine                                                          | adapt              | `size`, four steps named by what they bound rather than by t-shirt letters. See "The size scale is named by intent".                                                                                                                          |
| A step that removes the maximum                | MUI `maxWidth={false}`, Mantine `fluid`, Chakra `fluid`, Bootstrap `.container-fluid`, Primer `full`, Tailwind `max-w-none` | adopt              | `size="full"`. The inset still applies, which is the difference between "no maximum" and "no container".                                                                                                                                       |
| Centring the bounded column                    | all nine                                                          | adopt              | The base rule. Nothing to switch on.                                                                                                                                                                                                          |
| An inset from the edge of the available space  | MUI `disableGutters`, Mantine, Chakra, Bootstrap, Primer `padding` | adapt              | `inset`, a step of the same space scale Stack, Inline and Grid take their `gap` from, so a page gutter and a stack gap come from one rhythm. `0` is the absence of an inset, which is what `disableGutters` buys.                              |
| Substituting the rendered element              | Radix `asChild`, MUI `component`, Chakra `as`/`asChild`, Mantine `component` | adopt              | `render` in React, on both parts. Angular needs nothing: `[slContainer]` is written on the element the consumer already chose, which is how `stack` and `card` answer the same question.                                                        |
| Defaults for a whole application               | MUI theme `defaultProps`, Mantine `theme.components`, Chakra recipe, Radix theme variables | adopt              | `ContainerDefaultsProvider` and `provideContainerDefaults`, the pattern `card` and `button` already ship. An explicit prop always wins.                                                                                                        |
| A maximum that steps at viewport breakpoints   | Bootstrap, Carbon, Tailwind `container`, Radix `Responsive<>`, Primer responsive objects | decline            | `docs/component-features.md` §2.7 and the rubric both bind a family to its own inline size, not the viewport. `min(100% − 2 × inset, max)` already collapses the column smoothly, with no step to be unstable around. An application that genuinely wants a different maximum per viewport writes one media query over `--slotted-container-content`. |
| Padding and margin props on the container      | Radix `p`/`px`/`m`/`mx`, Chakra style props                       | decline            | This library has no style-prop system, and `stack`, `inline`, `grid` and `card` all ship none. Spacing around a container is the parent layout's: `<Stack gap={9}><Container/><Container/></Stack>`.                                            |
| Vertical page padding                          | Radix `Section`, Primer `PageLayout` `padding`                    | defer to `page`    | §4 of the feature guide gives `page` and `section` the header, body and footer regions and the block rhythm between them, and states outright that Container "não injeta background, card ou padding vertical de página". Wave 4.               |
| Hiding the container responsively              | Radix `display`, Primer `hidden`                                   | decline            | Not a bounding decision. Two lines of consumer code: `{visible ? <Container/> : null}` in React, `@if (visible) { … }` in Angular.                                                                                                             |
| Centring the *children* inside the column      | Chakra `centerContent`                                             | decline            | `<Container><Stack align="center">…</Stack></Container>`. Stack owns alignment across its flow, and a second answer to one question is the defect the briefing named when it gave measure to this family alone.                                 |

### Differentiators

| Capability                                      | Where it comes from                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A measure counted in characters, not pixels     | Tailwind Typography is the only surveyed source that does this, and it is not a container. `size="measure"` states `65ch`, so the column follows the inherited text size and the reader's zoom. The other eight state pixels: raise the base font and their measure gets *longer* in characters, which is the opposite of what a measure is for. WCAG SC 1.4.8 caps a line at 80 characters; `ch` is the advance of "0", which is wider than the average glyph in a proportional face, so 65 `ch` lands under that ceiling rather than over it. |
| A child that escapes the bound                  | Only Mantine ships it (`strategy="grid"` plus `data-breakout`), and only behind an opt-in that changes the container's formatting context. Here `breakout` is a part of the family with no switch, so every container can hold a full-width table. It answers the container, not the viewport, so it is still correct nested, inside a scroll region, and in a container that does not fill the page — which the common `margin-inline: calc(50% - 50vw)` recipe is not. |
| `align`, so a bounded column need not be centred | Radix is the only surveyed library with it. A settings column pinned to the start of a wide page is a real layout, and a library that only centres has made that decision silently. Written as track sizes, so `start` and `end` are logical and a right-to-left document is the same component mirrored. |
| One inset that is a step of the shared space scale | None of the nine share one scale between page gutters and layout gaps: Mantine spends its own spacing scale, Bootstrap a Sass variable, Primer a named triple. Reading `--slotted-space-*` means a theme retunes the page gutter and the stack gap together. |
| Three colour schemes, three densities, RTL       | Nothing to do, and that is the finding: the family paints nothing, so scheme and forced colours cost it no rule, and its geometry is not control geometry, so density changes nothing. Recorded rather than assumed — see "Density". |

### Gaps

| Gap                                                              | What this family does                                                                                                                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A single unbroken token wider than the column                     | None of the nine says what happens; in most, the child pushes the column wider and the page scrolls sideways, which fails WCAG SC 1.4.10. Every child gets `min-inline-size: 0`, so the column holds its bound and the overflow is the child's to resolve. |
| The reader enlarges text to 200%                                  | A pixel maximum keeps the same column and gets fewer, longer-wrapping lines. `measure` grows with the text, so the line count stays and SC 1.4.4 is met by the family rather than by the page around it.                                          |
| A container nested inside another container                       | The bound is `min(100% − 2 × inset, max)`, so an inner container never exceeds its outer one and the insets add rather than fight. Bootstrap and MUI both warn against nesting; here it is the mechanism for returning bounded content inside a breakout. |
| A breakout inside a scroll region or a non-full-width parent       | The viewport recipe (`50% - 50vw`) overflows both. The grid track answers the container's own inline size, so neither case is special.                                                                                                            |
| A very narrow container — 240 CSS pixels, or 320 at 400% zoom      | The inset is a floor on the side tracks rather than padding on the box, so the column is never negative and the breakout still reaches both edges. Below twice the inset the column would reach zero; at the default that is 32 px, well under any width SC 1.4.10 asks for. |
| Extreme content: an empty container                                | Nothing is drawn, so an empty container is a zero-height row. Exercised in the harness rather than assumed.                                                                                                                                      |

## Anatomy

| Part       | Element         | Role                                                                                       |
| ---------- | --------------- | ------------------------------------------------------------------------------------------ |
| `root`     | `div`, or the consumer's | Establishes the three tracks: a start gutter, the bounded column, an end gutter.     |
| `breakout` | `div`, or the consumer's | A child placed across all three tracks, escaping both the maximum and the inset.     |

There is no `content` part. The column is a grid track, not an element: an
element would be a second box for a consumer to style, and a second place for
the bound to be stated.

## Structure

One structure, always. The root is a three-track grid; every child is placed in
the middle track; a `breakout` child is placed across all three.

```css
[data-ui='container'] {
  display: grid;
  grid-template-columns:
    [full-start] minmax(var(--_inset), var(--_start-track))
    [content-start] min(100% - 2 * var(--_inset), var(--_max))
    [content-end] minmax(var(--_inset), var(--_end-track))
    [full-end];
  inline-size: 100%;
}

[data-ui='container'] > * {
  grid-column: content;
  min-inline-size: 0;
}

[data-ui='container'] > [data-part='breakout'] {
  grid-column: full;
}
```

The inset is a floor on the two side tracks rather than padding on the box.
Padding would inset the breakout as well, which is the one thing a breakout
exists not to be.

`align` is expressed by the growth limit of a side track: `1fr` shares the free
space, and the inset itself pins the track to its floor.

| `align`  | `--_start-track`  | `--_end-track`    |
| -------- | ----------------- | ----------------- |
| `center` | `1fr`             | `1fr`             |
| `start`  | `var(--_inset)`   | `1fr`             |
| `end`    | `1fr`             | `var(--_inset)`   |

Track order follows the writing direction, so `start` and `end` are logical and
a right-to-left document needs no second rule.

### The cost of always being a grid

A grid container wraps each run of text directly inside it in an anonymous
item, and an anonymous item cannot be selected, so it is auto-placed into the
first track — the start gutter — instead of the column.

Accepted, with the cost written here and on both reference pages: wrap text in
an element. Three arguments carry it.

1. `stack` and `inline` are flex containers and `grid` is a grid container, so
   every layout family in this library already turns its children into items.
   Container behaving differently would be the inconsistency.
2. The alternative is Mantine's: a `strategy` axis whose only job is to change
   the formatting context, so the breakout works in half the containers and the
   consumer has to know which half.
3. The failure is loud. Text lands visibly in the gutter at the start edge,
   which is seen the first time it is rendered — not a quiet reflow that
   survives to production.

Two other consequences of the grid are improvements rather than costs: adjacent
children no longer collapse their margins, which is what "ausência de margens
implícitas" already asks of the layout families, and `justify-items: stretch`
keeps a block child filling the column exactly as it would in a block box.

## The size scale is named by intent

`sm` / `md` / `lg` is this library's word for control geometry — `button`
height, `card` inset. A container's maximum is not that: it is chosen by what
is inside it, and a letter hides the choice. The steps say what they bound.

| Step      | Maximum                            | What it bounds                                                          |
| --------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `measure` | `65ch`                             | Running text. The family's ownership of comfortable measure.             |
| `content` | `56rem` (896 px)                   | A page of prose with figures, a settings page, a form.                   |
| `wide`    | `80rem` (1280 px)                  | A dense application page: a table, a dashboard, a two-pane view.         |
| `full`    | the available space, less the inset | No maximum. The gutters remain.                                          |

Four bounded steps is the field's own range: Radix ships four, Primer four,
MUI and Mantine five.

`measure` and `content` are separated by more than a name: at the library's
body size `65ch` lands near 460 px, roughly half of `content`.

There is no `form` step. It would sit between `measure` and `content` close
enough to either to be a coin toss, and a step nobody can choose correctly is
worse than one fewer step.

### Why `content` is the default and not `wide`

The four libraries that state a default all choose their widest bounded step.
This one does not, and the reason is which failure is visible.

A dashboard that inherits `content` looks too narrow immediately and is fixed
with `size="wide"` the first time it is opened. A settings page that inherits
`wide` has lines that are merely somewhat too long, which nobody reports. The
briefing's tiebreaker is to take the option that fails more loudly.

## Density

The inset does not change with density, and neither does any maximum.

Density in this foundation is control geometry: heights, control padding,
control type. `stack` already wrote the rule for the layout families — "how
tightly controls are packed is not a composition decision" — and a page gutter
that shrank with density would move the page frame every time a table got
denser. Recorded here so the absence is a decision rather than an omission.

## Responsiveness

No container query and no breakpoint. The family answers its own inline size
intrinsically: `min()` collapses the column and `minmax()` floors the gutters,
continuously, with no step to be unstable around.

The root does **not** declare `container-type: inline-size`. Doing so would
remove the container's inline contribution to its parent's sizing — the cost
`card` records for its horizontal orientation — and buy nothing, because
nothing in this family reflows. A consumer who wants to query the column
declares their own container inside it.

## Tokens

The foundation has no scale of widths. Space stops at `4rem`, and control
geometry is control-sized. Three family tokens hold the maxima, each stating a
literal, each with its reason recorded in the stylesheet:

| Token                         | Value    | Reason for the literal                                                                    |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `--slotted-container-measure` | `65ch`   | A measure is counted in characters. No scale in the foundation is denominated in characters. |
| `--slotted-container-content` | `56rem`  | A page maximum. The space scale ends at `4rem` and is about separation, not extent.         |
| `--slotted-container-wide`    | `80rem`  | The same.                                                                                   |

They are family tokens, not foundation tokens, and they are not proposed for
`packages/tokens/src/contract.json`. Three values read by one family is not a
scale; promoting them would make the foundation carry a fourth axis for a
single consumer. If `page`, `app-shell` or `page-header` later need the same
maxima, they read these three, and promotion becomes a decision with evidence
behind it.

The inset reads `--slotted-space-*` directly, step by step, exactly as `stack`
reads it for `gap`.

## Contract

```
family      container
ui          container
members     container
parts       root, breakout
capabilities size
states      default
axes        size  = measure | content | wide | full
            inset = 0 … 12
            align = center | start | end
defaults    size = content, inset = 6, align = center
```

No `stateModel`. Nothing here is mutable: a container is told what to bound and
bounds it.

`size` is the declared capability. `arrangement` is not, although the family
does place things: the shared vocabulary binds `arrangement` to `gap`, `align`
and `justify`, and this family ships no `gap` — separation is Stack's — and no
`justify`, because there is one thing to place. Claiming `arrangement` would
oblige the reference page to document two axes that do not exist.

## Accessibility

No APG pattern applies. The applicable guidance is the platform's and WCAG's:

| Source                                       | Requirement                              | Where it is met                                                                      |
| -------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| WCAG SC 1.4.8 (AAA), technique C20            | No more than 80 characters per line       | `size="measure"`, at `65ch`, using a relative measurement as C20 asks.                 |
| WCAG SC 1.4.4 (AA)                            | Text resizes to 200% without loss         | `measure` is denominated in `ch`; every other step is `rem`.                            |
| WCAG SC 1.4.10 (AA)                           | Reflow at 320 CSS pixels, no two-axis scroll | `min()` on the column, `min-inline-size: 0` on every child.                          |
| WCAG SC 1.3.2 (A)                             | Meaningful sequence                       | No axis reorders children. Grid placement is one column; DOM order is reading order.   |
| HTML                                          | A layout box carries no role              | The root renders a `div` and adds no ARIA. `<main>`, `<section>` and `<article>` are the consumer's, through `render` in React and through the element the Angular directive is written on. |

A breakout does not change reading order: it is placed where it is written.

## Bindings

### React

```tsx
<Container size="measure">
  <Stack gap={6}>…</Stack>
  <ContainerBreakout>
    <Container size="wide">…</Container>
  </ContainerBreakout>
</Container>
```

`Container`, `ContainerBreakout`, `ContainerDefaultsProvider`,
`useContainerDefaults`. Both parts take `render` and extend
`ComponentPropsWithRef<'div'>`, as `card` does.

### Angular

```html
<div slContainer size="measure">
  <div slStack [gap]="6">…</div>
  <div slContainerBreakout>
    <div slContainer size="wide">…</div>
  </div>
</div>
```

`SlContainer` and `SlContainerBreakout` as attribute selectors on the element
the consumer wrote, `exportAs`, `input()` signals, `computed` for the three
resolved values, `CONTAINER_DEFAULTS` with `provideContainerDefaults` and
`injectContainerDefaults`.

### Integration tables

Both tables from `references/frameworks.md`, answered line by line.

#### React

| Question                                           | Answer                                                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, request with reason | No. The family holds no mutable value; `size`, `inset` and `align` are the consumer's, read and never moved.                        |
| Application-wide defaults                          | Yes. `ContainerDefaultsProvider`, and `useContainerDefaults` for anything reading them.                                              |
| Substituting the rendered element of each part     | Yes. `render` on `Container` and on `ContainerBreakout`.                                                                             |
| The consumer's handler still runs                  | No handler. Native props and events spread onto the element untouched.                                                               |
| Native element and imperative action               | `ref` reaches the element through the props spread. No imperative action exists: there is nothing to open, focus or scroll.          |
| Server rendering without hydration mismatch        | Yes. No identifier is generated, no layout is read, and nothing branches on a client-only value.                                     |
| Every stylable state in the DOM                    | Yes, and the set is `data-ui`, `data-part`, `data-size`, `data-inset`, `data-align`. The contract declares no state beyond `default`. |
| Props type is the native element's, extended       | Yes. `ComponentPropsWithRef<'div'>`.                                                                                                 |

#### Angular

| Question                                           | Answer                                                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form                   | No two-way value exists. Three `input()` signals, no `model()` and no `output()`, because nothing is requested.                       |
| Reactive Forms and template forms                  | No. A layout box is not a form control and holds no value to write.                                                                  |
| Application-wide defaults                          | Yes. `CONTAINER_DEFAULTS` and `provideContainerDefaults`.                                                                            |
| Template reaches the instance                      | Yes. `exportAs: 'slContainer'` and `exportAs: 'slContainerBreakout'`.                                                                |
| Substituting projected content, kept lazy          | Yes. A single unnamed `ng-content`, so anything the consumer writes — including an `ng-template` outlet — is projected once, untouched. |
| Zoneless and `OnPush`                              | Yes. `input()` and `computed` throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`.                                        |
| Subscriptions torn down                            | None exist. No listener, no observable, no timer.                                                                                    |
| A static attribute the consumer wrote survives     | Yes. The host writes only `data-ui`, `data-part` and the three axis attributes; no `class`, `style`, `id`, `role` or `aria-*` is written, so nothing the consumer wrote is overwritten. `HostAttributeToken` has no attribute to read back. |
| An entry point others depend on stays a single class | `@slotted/angular/container` exports two classes and three symbols and imports no other entry point.                              |

## Decisions

1. The size steps are named by intent, not `sm`/`md`/`lg`. Departure from the
   library's convention for control geometry, recorded here and in the build log.
2. The default is `content`, against the field's four-of-four preference for the
   widest bounded step, because the narrow default fails visibly.
3. The root is always a grid, with the anonymous-text cost accepted and written.
4. `measure` is stated in `ch`, which is a literal, and the reason is that
   characters are the unit the thing is defined in.
5. The three maxima stay family tokens and are not promoted to the foundation.
6. The inset does not answer density.
7. No container query and no `container-type` on the root.
8. `breakout` is a part with no opt-in switch, rather than Mantine's `strategy`
   axis.
