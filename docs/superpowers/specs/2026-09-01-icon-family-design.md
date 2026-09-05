# Icon Family Design

## Outcome

`Icon` is the box a glyph is drawn in, not a catalogue of glyphs. It owns size,
colour, optical alignment with adjacent text, presence in the accessibility
tree, and mirroring in right-to-left documents. The artwork stays the
consumer's.

This closes the question `docs/build-order.md` leaves open for the family —
where the registry lives — and question 6 of `PROJECT-PRD.md` §49, "what will
the official icon strategy be".

## Capability inventory

### Surveyed

| Implementation                                                     | Called             | Read at                                                                                              |
| ------------------------------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------- |
| MUI Material UI                                                    | `SvgIcon`          | <https://mui.com/material-ui/api/svg-icon/>                                                          |
| Angular Material                                                   | `MatIcon`          | `src/material/icon/icon.ts`, angular/components `main`                                               |
| ng-icons v35.1.0                                                   | `NgIcon`           | <https://ng-icons.github.io/ng-icons/>                                                               |
| Shopify Polaris                                                    | `Icon`             | `polaris-react/src/components/Icon/Icon.tsx`, Shopify/polaris `main`                                 |
| Chakra UI v3                                                       | `Icon`             | `packages/react/src/components/icon/icon.tsx`, chakra-ui `main`                                      |
| Lucide                                                             | per-glyph component | <https://lucide.dev/guide/packages/lucide-react>                                                     |
| W3C                                                                | the image itself   | <https://www.w3.org/WAI/tutorials/images/decorative/>, WAI-ARIA 1.2 §5.2.8 and §5.4                   |

The five component libraries disagree usefully. Polaris ships three props and no
size at all; MUI ships eleven and a `component` escape hatch; Angular Material
ships a font-ligature path, an SVG path and a registry; Chakra ships a styling
recipe and a props provider; ng-icons ships a registration function and no box.

### Table stakes

| Capability                                     | Who ships it                                     | Verdict            | Reason                                                                                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Named size steps                               | MUI `fontSize`, Chakra recipe `size`, Carbon      | adopt              | `sm` / `md` / `lg`, reading the control icon scale so they restate per density.                                                                                                |
| A size that follows the surrounding type       | MUI `fontSize="inherit"`, Angular Material `inline`, ng-icons | adopt  | `size="text"`, stating `1em`.                                                                                                                                                  |
| An arbitrary length                            | Lucide `size`, Chakra `boxSize`, Carbon `size`    | adapt              | `style={{ '--slotted-icon-size': '20px' }}`, or `[style.--slotted-icon-size]="'20px'"`. The token is the size, so a prop would be a second way to set one value.                |
| A colour role set                              | MUI `color`, Polaris `tone`, ng-icons `color`     | adopt              | `tone`, the same eight values Typography uses, reading the same tokens.                                                                                                        |
| Colour inherited by default                    | MUI, Polaris, ng-icons, Chakra                    | adopt              | `tone: 'inherit'` paints nothing and lets `currentColor` carry the text's colour.                                                                                              |
| An accessible name                             | MUI `titleAccess`, Polaris `accessibilityLabel`, Carbon `<title>` | adapt | `label`, plus the `aria-label` and `aria-labelledby` a consumer writes directly. The name goes on the wrapper, so it works when the artwork is a component whose root the family cannot reach. |
| Decorative by default                          | Chakra (`aria-hidden` on the svg), MUI, Polaris   | adapt              | The absence of a name is what hides it. There is no second switch, so named-and-hidden is unrepresentable — see below.                                                          |
| Defaults for the whole application             | Chakra `IconPropsProvider`, MUI theme `defaultProps`, Angular Material `MAT_ICON_DEFAULT_OPTIONS`, ng-icons `provideNgIconsConfig` | adapt | `--slotted-icon-size` on any ancestor, and a `[data-ui='icon']` rule for anything else. No provider and no injection token: the cascade already scopes per subtree, needs no import, and is identical in both bindings. Documented as a CSS snippet on both reference pages. |
| Right-to-left mirroring                        | Fluent `IconDirectionContextProvider`, Angular Material's `[dir]` rules | adopt | `directional`, applied by `:dir(rtl)`.                                                                                                                                          |
| A glyph catalogue or registry                  | Angular Material `MatIconRegistry`, ng-icons `provideIcons`, Polaris `source`, MUI's icon packages | decline | The reasons are in the section below. The artwork stays the consumer's, from wherever they already get it.                                                                       |
| `strokeWidth`                                  | ng-icons, Lucide                                  | decline            | The weight belongs to the icon set, not to the icon, and `[data-ui='icon'] svg { stroke-width: … }` sets it once. Measured behaviour and the recorded cost are in the section below. |
| `focusable="false"` on the artwork             | Chakra, MUI, Carbon                               | decline            | The attribute is honoured only by IE11 and EdgeHTML, which this library already excludes by using `:dir()`, `scale` and container queries. A consumer who needs it writes it on their own glyph: `<Icon><Search focusable={false} /></Icon>`. |
| `viewBox` / `inheritViewBox`                   | MUI                                               | decline            | One implementation, and it exists because MUI renders the `svg` itself. Here the consumer writes the `svg`, so the viewBox is already theirs.                                    |
| Root element substitution                      | MUI `component`, Chakra `asChild`                 | decline            | The box is not a semantic claim: it carries no role of its own until it is named, and then the role is `img` regardless of the tag. Substitution would buy one saved node and a second styling path. |
| A static rotation, or spin                     | Ant Design `rotate` / `spin`                      | decline            | One implementation for rotation; an icon that has to move is a progress indicator, and `progress-indicator` owns that in wave 2. `directional` covers the only rotation that carries meaning. |

### Differentiators

| What                                                              | Why only here                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Size steps that restate per density                               | `sm`/`md`/`lg` read `--slotted-control-icon-size-*`, which the theme restates for `comfortable`, `compact` and `dense`. A dense table shrinks its icons with its controls. None of the five surveyed libraries has a density axis, so none can do this. |
| Named-and-hidden is unrepresentable                               | Chakra's `Icon` writes `aria-hidden="true"` before spreading the consumer's props, so `<Icon aria-label="…" />` renders a named, hidden image unless the consumer also writes `aria-hidden={false}`. Here the name is the switch, so the two cannot disagree. |
| `:dir(rtl)` rather than an ancestor `[dir]` selector or a context | A mirrored icon inside a left-to-right island inside a right-to-left page reads the directionality that actually applies to it. An ancestor selector and a React context both answer with the wrong one.                                              |
| One authored stylesheet, two bindings                             | The box is byte-identical in React and Angular, and a container sizes icons in either by setting one custom property. The surveyed libraries each serve one framework.                                                                                 |
| Three colour schemes without a family rule                        | `tone` reads semantic tokens, so `high-contrast` and forced colours are answered by the theme. The family writes no `forced-colors` rule, which `icon.styles.test.mjs` holds.                                                                         |

### Gaps

| What a real product hits                                    | Answer                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Non-square artwork — a wordmark, a 2:1 logo                 | Squashed, deliberately, and the same in every surveyed library (MUI 1em × 1em, Polaris a fixed 20 × 20, Chakra a recipe size). A mark that is not square is not an icon: it is an `img` or an inline `svg` the consumer sizes. Recorded rather than silently distorted.               |
| A dense control on a coarse pointer                         | The theme grows the control to `--slotted-target-comfortable` on `pointer: coarse` and the icon keeps its dense size, so the target is large and the mark stays small. That is the intended split: the mark's size is a reading decision, the target's is a hitting decision. No surveyed library has the axis, so none hits the case. |
| A glyph component that renders its own host                 | `<ng-icon><svg/></ng-icon>` puts an element between the box and the artwork. The fill rule is written in both the child and the descendant form for exactly this, which the reference pages exercise through `@ng-icons/lucide`.                                                     |
| An icon whose artwork fails to load or is missing           | The box collapses to an empty square of the declared size rather than to zero, because the size is on the wrapper and not on the artwork. Nothing reflows; a hole appears where the mark was.                                                                                        |
| A stroked set read at the smallest step                     | A 2-unit stroke on a 24-unit grid renders at 1.17px at `sm` and 1.5px at `lg`, so the set reads lighter small than large. The cost is recorded and the one-line application rule is documented, because the right value depends on a grid the library did not choose.                 |

## The registry question, decided

Slotted ships no glyph catalogue, in any of the three forms the rebuild order
names: not a package, not a `@slotted/core` entry point, not a public set of
glyph tokens.

`docs/superpowers/specs/2026-08-29-icon-foundation-button-integration-design.md`
deferred a published icon package until Slotted owns original glyphs, needs
stable semantic aliases across upstream families, or needs a framework-neutral
asset format. None of the three has become true. Re-exporting Lucide would add
a version to maintain and a catalogue to keep current without improving a
single component contract.

What has become true is that every family that frames an icon — Button,
IconButton, Alert, Tag, Field, Toolbar — reimplements the same box:
`inline-flex`, a fixed inline and block size, and a rule forcing the child SVG
to fill it. `packages/styles/src/button/button.css` holds that box today,
written across three selector lists for its `icon`, `leading` and `trailing`
slots. Icon is that box, written once.

The consequence is that "tree-shakeable" is answered by having nothing to
shake: a consumer imports the glyphs it names, from wherever it already gets
them, and Icon adds no catalogue to the graph.

### The boundary against glyph tokens

Two mechanisms exist and they do not overlap.

| Need                                                            | Mechanism                                        |
| --------------------------------------------------------------- | ------------------------------------------------ |
| A component draws a mark with no consumer content to draw it in | A mask from a glyph token, painted by the family |
| A consumer places artwork somewhere a component accepts content | `Icon`, framing the consumer's SVG               |

A checkbox's check and a radio's dot have no slot a consumer fills, so the
family draws them from `--slotted-icon-check` and `--slotted-icon-dot`. An
alert's status icon, a button's leading icon and a tag's remove icon are
content, so they are `Icon`.

### The glyph tokens keep their names

`--slotted-icon-check`, `-minus`, `-dot`, `-x`, `-chevron-right` and
`-chevron-down` are left as they are, and the Icon family publishes
`--slotted-icon-size` and `--slotted-icon-baseline-shift` beside them.

Renaming the six to `--slotted-glyph-*` was considered, on the ground that
every family's hook prefix is `--slotted-<family>-*` and Icon should own
`--slotted-icon-*` outright. It was rejected on cost and on evidence.

There is no mechanical conflict. A family hook does not enter
`packages/tokens/src/contract.json` — Typography's three do not — so
`scripts/verify-token-foundation.test.mjs`, which builds the Glyph table from
contract tokens carrying the `--slotted-icon-` prefix, never sees a family
hook. The two sets are separated by layer and by file: the masks are primitive
tokens the theme emits, the hooks are family properties declared in
`packages/styles/src/icon/icon.tokens.json` and read with a fallback.

The cost is real and current. `visually-hidden` already consumes
`--slotted-icon-x` and `--slotted-icon-check` in its harness fragment, and
`packages/themes/default/test/glyphs.test.mjs` names all six; a rename would
rewrite a family being rebuilt in parallel in this same working tree, for a
prefix. A rename with no defect behind it is not a shared-tooling fix.

What matters is the boundary, and the boundary is the table above, not the
spelling.

## Anatomy

One part, `root`, on a `span` carrying `data-ui="icon"`.

```html
<span data-ui="icon" data-part="root" data-size="md" aria-hidden="true">
  <svg viewBox="0 0 24 24">…</svg>
</span>
```

The wrapper is a real element rather than a set of attributes applied to the
consumer's SVG, for three reasons. It gives the box a stable identity when the
glyph arrives as a component whose root element the family cannot reach —
`<ng-icon>` renders its own host, and an Angular component selector cannot be
placed on another component's element. It carries `aria-hidden` or `role="img"`
without touching artwork the consumer owns. And it is the element a container
sizes, which is what makes an icon inside a rebuilt Button need no coordination
with Icon's API at all.

The family normalizes what it contains:

```css
[data-ui='icon'] > *,
[data-ui='icon'] svg {
  block-size: 100%;
  display: block;
  inline-size: 100%;
}
```

This reaches into DOM the consumer wrote, deliberately. A box whose content
decides its own size is not a box. The descendant form is required because a
glyph component renders its own host between the two — `<ng-icon><svg/></ng-icon>`.

## Size

Four steps. Three read the control icon scale, which the theme restates per
density, so an icon shrinks with a dense table exactly as the control beside it
does. The fourth follows the type.

| `size` | Value                              | Comfortable / compact / dense |
| ------ | ---------------------------------- | ----------------------------- |
| `sm`   | `--slotted-control-icon-size-sm`   | 14 / 13 / 12 px               |
| `md`   | `--slotted-control-icon-size-md`   | 16 / 14 / 13 px               |
| `lg`   | `--slotted-control-icon-size-lg`   | 18 / 16 / 14 px               |
| `text` | `1em`                              | the size of the text around it |

`md` is the default and is painted by the base rule, so the attribute is
written only when a consumer decides otherwise — the rule Typography already
follows.

The base rule reads the size through the family token:

```css
[data-ui='icon'] {
  --_size: var(--slotted-icon-size, var(--slotted-control-icon-size-md, 16px));
}
```

A container therefore sizes every icon inside it by setting
`--slotted-icon-size` once, and an instance overrides that container by setting
`data-size`, because a `[data-size]` rule sets `--slotted-icon-size` itself.
That ordering is the library's rule read from both sides: the consumer's
explicit value on the instance wins over context.

`text` exists because 16px inside a `3xl` heading is not an icon, it is a
mistake. It states `1em`, which resolves against the type the icon sits in.

## Colour

`tone` takes the same eight values as Typography, reads the same tokens, and
defaults to `inherit`, which paints nothing and lets `currentColor` carry the
colour of the text the icon sits beside. An icon and its label being the same
colour by default is the behaviour that needs no decision; a tone is how a
consumer asks for a different one.

The family sets `color` and never `fill` or `stroke`. Stroked artwork declares
`stroke="currentColor"` and filled artwork declares `fill="currentColor"`;
painting either would break the other convention, and the family cannot know
which one it holds.

## Stroke weight, and why it is not an axis either

The rebuild order named a `stroke/fill` axis. It covers two different things,
and they are declined for two different reasons.

**Choosing between an outline and a solid** requires a catalogue holding both
drawings of the same glyph. The library ships no catalogue, so there is nothing
to choose between.

**Stroke weight** is a fairer question, and the reason above does not answer it.
`stroke-width` is not paint: measured in a browser, an author rule of
specificity 0,1,1 overrides the `stroke-width` presentation attribute Lucide
writes on its `svg`, and the same rule is inert on filled artwork, which paints
no stroke. So the family *could* set it without breaking anything.

It still does not, for three reasons.

The convention belongs to the icon set, not to the icon. An application picks
one family of artwork and one weight for it; deciding that per instance is how
a page ends up with four weights.

`data-ui` is public contract, so the application can already decide it once,
with no API at all, and per size step if the artwork needs it:

```css
[data-ui='icon'] svg {
  stroke-width: 2.25;
}
```

And a family rule would win an argument it should not be in: because CSS beats
the presentation attribute, a `strokeWidth` the consumer set on their own glyph
component would be silently overridden.

The cost is recorded rather than hidden. Artwork drawn with a 2-unit stroke on
a 24-unit grid renders that stroke at 1.17px at `sm` and 1.5px at `lg`, so a
stroked set reads lighter at small steps than at large ones. An application that
minds writes the rule above; the library does not write it on the application's
behalf, because the right value depends on a grid the library did not choose.

## Optical alignment

An inline box whose bottom edge sits on the baseline reads too high beside
lower-case text, because its centre is half its own height above the baseline
while the text reads centred between the baseline and the cap height. The
family pays that back:

```css
vertical-align: var(--slotted-icon-baseline-shift, calc(0.5cap - 0.5 * var(--_size)));
```

The correction is computed rather than stated, because how much of it is needed
depends on how large the box is against the type it sits in. A constant is right
at one ratio and wrong at every other, and the error grows with the ratio: the
family shipped `-0.125em` until the `baseline` harness scene put the `lg` step
inside `xs` text, where an 18-pixel mark in 12-pixel type rode visibly above the
line it belonged to. `cap` is the cap height of the font the icon inherits and
`--_size` is the box, so the expression puts the box's centre on the text's
optical centre at every combination of the two.

At `1em` the expression resolves near `-0.125em`, which is why that constant —
the conventional value, and the one MUI, Chakra and Tailwind's typography plugin
all reach for — looked right for as long as nobody changed the ratio.

`cap` is a recent platform primitive, which `PROJECT-PRD.md` §33 permits, and it
constrains nothing this family did not already constrain: `:dir()` and `scale`
reached the same engines in the same period.

It applies only in inline flow: inside a flex or grid container the shift is
inert and `align-items` does the work. A theme still overrides the whole
expression through `--slotted-icon-baseline-shift`.

## Direction

Only artwork that points somewhere mirrors, and only the consumer knows which
artwork that is. A `directional` flag declares it, and the mirror is applied by
the document's own directionality:

```css
[data-ui='icon'][data-directional]:dir(rtl) {
  scale: -1 1;
}
```

`:dir()` rather than `[dir='rtl']` because a mirrored icon inside a
left-to-right island inside a right-to-left page has to read the directionality
that actually applies to it, which an ancestor attribute selector cannot.

A chevron, an arrow, a reply and an indent are directional. A search, a
warning, a clock and a user are not, and mirroring them produces a glyph that
is merely wrong.

## Accessibility

There is no `decorative` prop. The icon is decorative when it has no name, and
meaningful when it has one, which makes the invalid combination —
named and hidden — unrepresentable.

| Condition                                                | Emitted                        |
| -------------------------------------------------------- | ------------------------------ |
| No `label`, no `aria-label`, no `aria-labelledby`        | `aria-hidden="true"`           |
| Any of those present, and the consumer set no `role`     | `role="img"` and the name      |

`role="img"` requires a name: WAI-ARIA 1.2 §5.4 states that authors *MUST*
provide a label using `aria-label` or `aria-labelledby` for an element with
that role, and §5.2.8 lists `img` among the roles for which a name is required.
Emitting the role without one would produce an unnamed image, which is worse
than the decorative default.

The naming attributes are read as well as the `label` input, because
`<Icon aria-label="Sorting ascending" />` is the shape a consumer writes
without reading the documentation. Deriving the mode from `label` alone would
answer it with an icon that carries a name and is hidden from the tree — a
silent defect in the most likely mistake.

W3C's Images tutorial is the source for the two categories: a decorative image
is one whose information is already given by adjacent text and which should be
ignored by assistive technology; an informative image carries a concept that a
short phrase can express, and the alternative conveys the meaning rather than
describing the artwork.

## Framework shape

The conceptual contract is shared. The two bindings are not made to look alike.

### React

```tsx
<Icon size="sm" tone="muted">
  <Search />
</Icon>
<Icon label="Sorting ascending" directional>
  <ArrowUp />
</Icon>
```

`children` is the glyph. There is no `render` prop: the box is not a semantic
claim a consumer might need to change, unlike the element `Text` renders into,
and offering root substitution would create a second styling path for one saved
node.

### Angular

```html
<span slIcon size="sm" tone="muted"><ng-icon [svg]="search" /></span>
<span slIcon label="Sorting ascending" directional><ng-icon [svg]="arrowUp" /></span>
```

An attribute selector on an element the consumer writes, as `slText` and
`slVisuallyHidden` already are. It is a component rather than a directive for
the same reason `slVisuallyHidden` is: a directive carries no `styleUrl`.

The consequence, recorded rather than hidden: `<ng-icon slIcon>` is not
available, because Angular refuses two components on one element. Angular
therefore always writes the wrapper, where React could in principle have
avoided it. Both render the same DOM.

## Integration

Every line of both tables in `.claude/skills/component/references/frameworks.md`,
answered.

### React

| Question                                       | Answer                                                                                                                                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, with a reason | No. The family holds no mutable value: an icon is replaced, not changed. `contract.test.mjs` asserts the absence of `stateModel` so this stays a decision rather than an omission.             |
| Application-wide defaults                      | Yes, in CSS rather than in a provider: `--slotted-icon-size` on any ancestor, and a `[data-ui='icon']` rule for the rest. Documented as the `icon-application-defaults` snippet on both pages. |
| Element substitution per part                  | No, by decision. The box carries no semantics a consumer would need to change, and a `render` prop would create a second styling path for one saved node.                                      |
| The consumer's handler still runs              | Yes. The family registers no listener at all; `...nativeProps` reaches the `span` untouched.                                                                                                   |
| Ref, and the imperative escape hatch           | Yes for the ref, through `ComponentPropsWithRef<'span'>` and the spread. No named handle: there is no imperative action a box has that its element does not.                                   |
| Server rendering                               | Yes. No `useId`, no state, no layout read — the component is a pure function of its props.                                                                                                     |
| Every state a consumer may style is in the DOM | Yes, and there is one: `default`. `data-size`, `data-tone` and `data-directional` are written only when a consumer decided them, so an unset axis defers to the cascade.                       |
| Props type is the native element's, extended   | Yes. `IconProps extends ComponentPropsWithRef<'span'>`.                                                                                                                                        |

### Angular

| Question                                        | Answer                                                                                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form                | Not applicable: no mutable value, so no `model()` and no `output()`. All four inputs are `input()`.                                                                                              |
| Reactive Forms                                  | Not applicable: a box that frames artwork is not a form control and holds no value to write back.                                                                                                |
| Application-wide defaults                       | Yes, the same CSS answer as React, and deliberately not an injection token: a token would be a second mechanism scoped to the injector rather than to the subtree, and the two could disagree.   |
| A template can reach the instance               | Yes, `exportAs: 'slIcon'`.                                                                                                                                                                       |
| Projected content, kept lazy                    | Yes, a single unnamed `<ng-content>`; the glyph is never re-rendered by the family.                                                                                                              |
| Zoneless and `OnPush`                           | Yes. `ChangeDetectionStrategy.OnPush`, four `input()` signals, three `computed()`, no `markForCheck`.                                                                                            |
| Subscriptions torn down                         | Not applicable: none are created.                                                                                                                                                                |
| A static attribute the consumer wrote survives  | Yes — this is the reason `HostAttributeToken` is used for `aria-label`, `aria-labelledby` and `role`. A host binding writing `null` would delete a name the consumer wrote and hide the icon they named. |
| A single-class entry point                      | Yes. `packages/angular/icon` exports `SlIcon` alone, imported elsewhere as `@slotted/angular/icon`.                                                                                              |

The asymmetry worth recording: React can read a `role` or `aria-label` passed as
a prop at any time, while Angular reads only the attribute written statically in
the template. That is the correct Angular idiom rather than a lost capability —
a consumer who needs a dynamic name uses the `label` input, which both bindings
have.

## Declined

- **A glyph catalogue**, in any of the three forms — the reasons are above.
- **`stroke` / `fill` as an axis** — outline versus solid needs a catalogue that
  holds both, and stroke weight belongs to the icon set rather than to the icon.
  The reasoning, and the measured behaviour behind it, is in the section above.
- **A `decorative` prop** — the presence of a name already decides it, and a
  second switch would allow the two to disagree.
- **Remote or string-sourced glyphs** — no `name` prop resolving a catalogue,
  no URL, no `dangerouslySetInnerHTML`. The consumer's JSX or template is the
  only way artwork enters, so nothing unsanitized can.
- **Spin, pulse or any built-in motion** — an icon that has to move is a
  progress indicator, and that family exists in wave 2.

## Verification

- `specs/components/icon/contract.test.mjs` — the contract, written first.
- `packages/styles/src/icon/icon.styles.test.mjs` — the size steps, the tone
  steps, the fill-the-box rule, the direction guard, the absence of `fill` and
  `stroke`, and coverage of every declared part by the harness fragment.
- The visual loop in `.claude/skills/component/references/harness.md`, whose
  fragment carries harness-authored geometry rather than copied artwork,
  because the framework-free page cannot import the glyph package the reference
  pages use.
- Reference pages in both Storybooks, using Lucide through `lucide-react` and
  `@ng-icons/lucide`, as the 2026-08-29 design requires of every example.
