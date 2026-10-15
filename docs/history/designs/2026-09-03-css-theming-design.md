# CSS theming design

A theme is a customization written on top of the library's public API. It may
come from the consumer's application, from a package in this repository, or
from a third party. This document defines what a theme may reach, how it is
written, what the library guarantees, and how a theme is validated.

It supersedes the token-set decisions in
`docs/history/designs/2026-09-03-theme-axis-design.md`, whose defect
analysis still stands.

## Why the JSON theme is not the answer

A theme expressed as a token map can only restate values the contract already
declares. It cannot add a shadow to one variant, change what focus looks like
on one family, or state a rule the library never anticipated. Those are the
customizations a design system is asked for, and none of them is a value.

The JSON theme also asks every theme for 348 entries, including 20 icon data
URIs no theme varies, which puts a complete rewrite between a consumer and a
changed accent colour.

## Decisions

| # | Decision | Precedent |
| - | -------- | --------- |
| 1 | A theme reaches tokens, public selectors, and hooks each family declares | `[part]` in Vaadin, `::part` in web components, `data-*` in Radix |
| 2 | A theme is authored in CSS; free rules are allowed beside the token block | `@theme` in Tailwind v4, Open Props |
| 3 | Free rules land in a layer after the families | Cascade layers in Bootstrap 5.3, Tailwind v4 |
| 4 | Every rule is scoped by `[data-slotted-theme="<name>"]`, enforced by tooling | `.radix-themes`, `.sl-theme-*`, `.spectrum--*` |
| 5 | Each family declares its themable surface beside its stylesheet | Component custom-property tables in Spectrum and Vaadin |
| 6 | A theme is a **base** (complete) or a **patch** (partial, over a named base) | Shoelace's recommended override file |
| 7 | Contract-derived blocks are emitted once by the library, not per theme | — |
| 8 | Theme identity is the scope selector; nothing new is invented | — |

## Layers

```
@layer slotted.reset, slotted.tokens, slotted.theme,
       slotted.components, slotted.theme-overrides, slotted.preferences;
```

A layer takes its position from the first mention of its name, so appending
`theme-overrides` and `preferences` to the published statement reorders
nothing that already ships.

`slotted.overrides` is not revived. Decision 0001 removed that name because a
layer the library names is a layer whose position the library controls, which
made it the wrong home for rules an application owns — and because an
application that mentioned the name before the library's statement reached the
document registered the layer below `slotted.components` and lost every rule
in it, silently.

`slotted.theme-overrides` names its owner. A theme is not arbitrary
application CSS: it is scoped by an attribute the library defines, it is
checked by the library's validator, and the validator requires every theme
file to open with `LAYER_ORDER_STATEMENT` — which is what closes the failure
mode above, and is what no application file was ever obliged to do. An
application that wrote into `slotted.overrides` before decision 0001 is
unaffected: that name stays retired and keeps meaning what it meant.

- `slotted.theme` — a theme's token block, where it is emitted today.
- `slotted.theme-overrides` — a theme's free rules. Beats every family declaration
  without needing specificity, which is what lets a theme add a shadow or
  change a focus treatment without `!important` and without out-specifying a
  selector it does not own.
- `slotted.preferences` — the blocks derived from the contract, emitted once
  by `@slotted/tokens`. It is last because an operating-system preference has
  to beat both the theme's values and the theme's own rules. A theme that
  states a duration still collapses under reduced motion, including a theme
  the library has never seen.

## What the library emits

`@slotted/tokens/styles.css` today carries the layer statement and nothing
else. It gains four blocks, all of them inside `@layer slotted.preferences`,
all written against the theme, scheme and density attributes, and none of them
naming a theme.

**The user-agent hint.** One rule per scheme, so no theme author writes
`color-scheme` and no theme can forget it:

```css
[data-slotted-scheme='light'], [data-slotted-scheme='high-contrast'] { color-scheme: light }
[data-slotted-scheme='dark'] { color-scheme: dark }
```

**Forced colours.** Every scheme token mapped to the system colour the
contract declares for it. A later layer beats an earlier one on the same
element, and on no other: a custom property declared by the theme on a
scheme-carrying descendant is not reached by a rule that targets only the
theme root, because inheritance applies where nothing is declared. The block
therefore names the same elements the theme's scheme blocks do — without
naming a scheme, since any value of the attribute is one of them.

```css
@media (forced-colors: active) {
  [data-slotted-theme],
  [data-slotted-theme][data-slotted-scheme],
  [data-slotted-theme] [data-slotted-scheme] {
    --slotted-focus-ring-color: Highlight;
    /* … */
  }
}
```

**Touch targets.** The generic rule cannot apply `max()` to the token it
defines — that is a cycle — so each control height is two tokens: the theme
declares `--slotted-control-height-{sm,md,lg}-base`, and the library computes
`--slotted-control-height-{sm,md,lg}`, which is what the families read and
what their stylesheets already name. It is emitted on the density selectors
rather than on the theme root, because that is where the base value is
declared and a computed value inherited from an ancestor would carry the
wrong density down.

```css
[data-slotted-theme][data-slotted-density='compact'],
[data-slotted-theme] [data-slotted-density='compact'] {
  --slotted-control-height-md: var(--slotted-control-height-md-base);
}

@media (pointer: coarse) {
  [data-slotted-theme][data-slotted-density='compact'],
  [data-slotted-theme] [data-slotted-density='compact'] {
    --slotted-control-height-md: max(
      var(--slotted-control-height-md-base),
      var(--slotted-target-comfortable)
    );
  }
}
```

**Reduced motion.** The collapsed duration becomes library policy rather than
theme data. `reducedMotion` leaves the theme's surface; the contract keeps the
`reducedMotion` flag, which is what says *which* tokens collapse.

```css
@media (prefers-reduced-motion: reduce) {
  [data-slotted-theme] { --slotted-duration-short: 1ms; /* … */ }
}
```

## What a theme looks like

One or more `.css` files. A base states the full token set; a patch states
only what changes and names the base it is applied over.

```css
@layer slotted.theme {
  [data-slotted-theme='acme'] {
    --slotted-radius-sm: 8px;
    --slotted-control-height-md-base: 40px;
    /* … */
  }

  [data-slotted-theme='acme'][data-slotted-scheme='light'],
  [data-slotted-theme='acme'] [data-slotted-scheme='light'] {
    --slotted-tone-accent-solid: #6d28d9;
    /* … */
  }
}

@layer slotted.theme-overrides {
  [data-slotted-theme='acme'] [data-ui='button'][data-variant='solid'] {
    box-shadow: 0 1px 0 0 rgb(255 255 255 / 0.25) inset;
  }

  [data-slotted-theme='acme'] [data-ui='button']:focus-visible {
    outline-style: dashed;
  }

  [data-slotted-theme='acme'] [data-ui='avatar'] {
    --_edge: var(--slotted-tone-accent-border);
  }
}
```

The name is the value inside the scope selector. Nothing else declares it, so
nothing else can disagree with it. At runtime the applied theme is already
readable as `element.dataset.slottedTheme`.

`kind` and the base a patch extends are facts the validator needs and no
stylesheet consumes. They are arguments to the validator, or fields of an
optional manifest for a theme distributed as a package.

## Scope rules

1. Every style rule's selector begins with `[data-slotted-theme="<name>"]`,
   and one theme uses one name throughout.
2. `@keyframes` and `@font-face` cannot be scoped by a selector. Their names
   carry the theme name as a prefix instead: `acme-pulse`, not `pulse`.
3. Contract tokens are declared in `slotted.theme`. Every other rule — a hook
   set on a family, a shadow, a focus treatment — belongs to
   `slotted.theme-overrides`. A theme that writes outside those two layers, or that
   declares a contract token from `slotted.theme-overrides`, is rejected.

Two themes loaded together therefore touch disjoint elements, which is what
lets an application switch themes by writing an attribute.

## The themable surface

`packages/styles/src/<family>/<family>.tokens.json` becomes an object:

```json
{
  "reads": ["--slotted-tone-accent-solid"],
  "hooks": ["--_edge"]
}
```

- `reads` is derived from the stylesheet and held equal to it, exactly as the
  array in that file is held today.
- `hooks` is declared by hand. A hook is a custom property a theme may set
  from `slotted.theme-overrides` and the family promises to keep reading. It starts
  empty for every family and grows only when a real theme needs one; the rest
  of a family's `--_` properties stay internal and free to change.

`packages/styles/src/surface.json`, exported as `@slotted/styles/surface.json`,
aggregates them for consumers outside this repository: for each family, its
`ui` identifier, its parts and state attributes taken from
`specs/components/<family>/contract.json`, and its `reads` and `hooks`. It is
generated, checked in, and held equal to its sources by a test, which is how
every derived file in this repository is already handled.

## The validator

`@slotted/theme-tools` — a command-line package, consumed as a
devDependency by whoever writes a theme. It reads CSS with PostCSS. The
library's runtime packages keep their zero dependencies; nothing in this
package reaches a browser.

```
slotted-theme check acme.css
slotted-theme check acme-dark.css --kind patch --extends default
```

It reads `@slotted/tokens/contract.json` and `@slotted/styles/surface.json`,
and reports, per file:

| Check | Applies to |
| ----- | ---------- |
| The file opens with `LAYER_ORDER_STATEMENT` | base and patch |
| One scope name, present on every style rule | base and patch |
| `@keyframes` and `@font-face` names prefixed with the theme name | base and patch |
| Token declarations only in `slotted.theme`, other rules only in `slotted.theme-overrides` | base and patch |
| Every contract token declared, on its axis, for three schemes and three densities | base |
| A token never references a deeper layer, and a non-root token composes rather than restates | base and patch |
| Text contrast: AA in `light` and `dark`, AAA in `high-contrast` | resolved result |
| Border, focus ring and disabled text at 3:1 | resolved result |
| Control height at or above `--slotted-target-min` | resolved result |
| Glyph payloads complete, encoded, and one `viewBox` | declared glyphs |
| Every `--_` property the CSS sets is declared as a hook by that family | base and patch |

"Resolved result" is the patch applied over its base. A patch validated
without `--extends` is checked only for what it declares, and the command says
so in its output rather than reporting a pass it cannot support.

Exit code is non-zero when any check fails. Every message names the file, the
selector and the token.

## Consequences inside this repository

- `packages/theme-default/src/theme.json` is converted, once, to authored
  CSS. Keeping a JSON generator for one theme would leave two ways to author
  the same artifact.
- `packages/tokens/src/render-theme.mjs`, `theme-conformance.mjs` and the
  `slotted-build-theme` bin are absorbed by the validator. The contrast,
  glyph and target rules they carry move into it unchanged.
- `THEMES` in the workbench stops being a literal list and reads the themes
  the workspace publishes; the workbench test that holds the two equal stays.
- `packages/styles/src/*/*.tokens.json` change shape, and `tokens.test.mjs`
  with them — mechanical, and generated.
- The contract gains `--slotted-control-height-{sm,md,lg}-base` and the
  families keep reading `--slotted-control-height-{sm,md,lg}`, unchanged.

## Delivery order

Two plans, each leaving the repository green and useful on its own.

**Plan one — the cascade.** The two new layer names, the four blocks in
`slotted.preferences`, and the `-base` split for control heights. The theme
renderer loses the three blocks the library now emits, so what a theme states
shrinks to values. The default theme stays generated from JSON and keeps every
check it has today.

**Plan two — the surface and the validator.** The per-family surface files,
`surface.json`, `@slotted/theme-tools`, and then the default theme converted
to authored CSS, followed by the retirement of `render-theme.mjs`,
`theme-conformance.mjs` and `slotted-build-theme`.

The conversion belongs to plan two and not to plan one: the checks that hold
the default theme read a token map, and until the validator can read CSS,
converting the default theme would leave it unchecked between the two plans.

## Non-goals

- No theme inheritance beyond one level. A patch names one base.
- No JavaScript theme API. A theme is CSS; selecting one is an attribute.
- No promotion of every `--_` property to public API.
- No change to how a family is written. A family that reads a token and
  publishes `data-ui` and `data-part` is already themable under this design.

## Risks

- The layer statement changes for every consumer that already loads the
  library. Appending names is safe by specification; a consumer that wrote its
  own `@layer` statement mentioning `slotted.components` before
  `slotted.theme-overrides` would order them differently, and that is documented
  rather than defended against.
- `slotted.theme-overrides` beating every family declaration is the point of the
  design and also its sharpest edge: a theme can break a family's layout. The
  hooks list exists so the supported path is narrower than the possible one.
- Contrast is checked on declared values. A theme that computes a colour with
  `color-mix()` or `light-dark()` cannot be checked statically; the validator
  reports those declarations as unchecked rather than passing them silently.
