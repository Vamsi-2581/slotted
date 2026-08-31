# Token foundation

This is the repository law for the default token foundation. The contract and
the default theme change in lockstep: each declares the same token names for a
group, and validation rejects a name missing from either side. The tables below
are the default theme's authored values.

These rules are binding for every family the rebuild has reached. A family
listed in `specs/legacy-families.json` predates this foundation and is exempt
until it is rebuilt in the order `docs/rebuild-order.md` sets; that list only
shrinks, and nothing may be added to it.

## Layers

Every token belongs to exactly one layer, and the layer says what may reference
it: a token composes its value from its own layer or a shallower one, never a
deeper one. `packages/tokens/src/validate-theme.mjs` rejects a theme that
breaks the direction, so the layering is a checked fact rather than a naming
convention.

| Layer       | Holds                                                          | Tokens |
| ----------- | -------------------------------------------------------------- | ------ |
| `primitive` | A value with no meaning attached: a step on a scale.           | 56     |
| `semantic`  | What a value is for: a surface, a border, a control, a target. | 91     |
| `component` | One family adjusting a semantic value for itself.              | 26     |

A token is a **scale root** when it states a value rather than composing one: a
primitive, a colour a scheme paints, or the geometry a density defines. Every
other token must reference another token. A root that restates a literal is
what the three layers exist to prevent — a component deciding, on its own, what
`4px` means.

A non-root token may still state a literal when the contract records why, in
its `literal` field. There are fourteen such tokens, each carrying its reason;
`transparent` and an optical radius correction are the two kinds that recur.

Every token varies on one axis: `base` is stated once, `scheme` is restated by
each colour scheme, and `density` by each density. The axis decides which CSS
block emits the token; the layer decides who may read it.

## Space

This scale answers how much separation or inset a layout needs.

| Token                | Default value |
| -------------------- | ------------- |
| `--slotted-space-1`  | `0.125rem`    |
| `--slotted-space-2`  | `0.25rem`     |
| `--slotted-space-3`  | `0.375rem`    |
| `--slotted-space-4`  | `0.5rem`      |
| `--slotted-space-5`  | `0.75rem`     |
| `--slotted-space-6`  | `1rem`        |
| `--slotted-space-7`  | `1.25rem`     |
| `--slotted-space-8`  | `1.5rem`      |
| `--slotted-space-9`  | `2rem`        |
| `--slotted-space-10` | `2.5rem`      |
| `--slotted-space-11` | `3rem`        |
| `--slotted-space-12` | `4rem`        |

## Radius

This scale answers how rounded a component or part should be.

| Token                   | Default value |
| ----------------------- | ------------- |
| `--slotted-radius-none` | `0px`         |
| `--slotted-radius-xs`   | `2px`         |
| `--slotted-radius-sm`   | `4px`         |
| `--slotted-radius-md`   | `6px`         |
| `--slotted-radius-lg`   | `8px`         |
| `--slotted-radius-full` | `9999px`      |

## Type size

This scale answers what text size a component needs.

| Token                    | Default value |
| ------------------------ | ------------- |
| `--slotted-font-size-xs` | `0.75rem`     |
| `--slotted-font-size-sm` | `0.8125rem`   |
| `--slotted-font-size-md` | `0.875rem`    |
| `--slotted-font-size-lg` | `1rem`        |
| `--slotted-font-size-xl` | `1.125rem`    |

## Line height

This scale answers how much vertical rhythm a text size needs.

| Token                      | Default value |
| -------------------------- | ------------- |
| `--slotted-line-height-xs` | `1.4`         |
| `--slotted-line-height-sm` | `1.45`        |
| `--slotted-line-height-md` | `1.5`         |
| `--slotted-line-height-lg` | `1.5`         |
| `--slotted-line-height-xl` | `1.45`        |

## Font weight

This scale answers how much typographic emphasis text needs.

| Token                            | Default value |
| -------------------------------- | ------------- |
| `--slotted-font-weight-regular`  | `400`         |
| `--slotted-font-weight-medium`   | `500`         |
| `--slotted-font-weight-semibold` | `600`         |

## Font family

This scale answers which typeface a component sets text in.

| Token                        | Default value                                    |
| ---------------------------- | ------------------------------------------------ |
| `--slotted-font-family-sans` | `ui-sans-serif, system-ui, sans-serif`           |
| `--slotted-font-family-mono` | `ui-monospace, SFMono-Regular, Menlo, monospace` |

## Border width

This scale answers how thick a border or ring is drawn.

| Token                          | Default value |
| ------------------------------ | ------------- |
| `--slotted-border-width-thin`  | `1px`         |
| `--slotted-border-width-thick` | `2px`         |

## Motion

This scale answers how long a transition takes and how its velocity changes.

| Token                          | Default value                     | Reduced-motion value |
| ------------------------------ | --------------------------------- | -------------------- |
| `--slotted-duration-loop-fast` | `700ms`                           | unchanged            |
| `--slotted-duration-loop`      | `1.1s`                            | unchanged            |
| `--slotted-duration-loop-slow` | `1.6s`                            | unchanged            |
| `--slotted-duration-instant`   | `1ms`                             | `1ms`                |
| `--slotted-duration-short`     | `120ms`                           | `1ms`                |
| `--slotted-duration-medium`    | `200ms`                           | `1ms`                |
| `--slotted-duration-long`      | `320ms`                           | `1ms`                |
| `--slotted-easing-standard`    | `cubic-bezier(0.2, 0, 0, 1)`      | unchanged            |
| `--slotted-easing-enter`       | `cubic-bezier(0.05, 0.7, 0.1, 1)` | unchanged            |
| `--slotted-easing-exit`        | `cubic-bezier(0.3, 0, 0.8, 0.15)` | unchanged            |
| `--slotted-easing-emphasized`  | `cubic-bezier(0.3, 0, 0, 1.3)`    | unchanged            |

Only the four motion-scale duration tokens collapse under
`prefers-reduced-motion`. The three loop durations do not, because an animation
that repeats forever needs to stop rather than to hurry: infinite animations
must stop or disable under reduced motion, and shortening is insufficient.

Durations and easings come from this scale. Reaching for a motion-scale
duration token honors `prefers-reduced-motion`; a literal duration sits outside
the query that collapses them, and
`packages/styles/src/motion.test.mjs` rejects one in any family the rebuild has
reached.

## Stacking

This scale answers which layer an element occupies relative to the application.

| Token                       | Default value |
| --------------------------- | ------------- |
| `--slotted-z-index-sticky`  | `100`         |
| `--slotted-z-index-overlay` | `1000`        |
| `--slotted-z-index-popover` | `1100`        |
| `--slotted-z-index-toast`   | `1200`        |

## Glyph

This scale answers which intrinsic mask geometry a component-owned icon uses.
Each value is the exact authored data URI; the black paint becomes the mask's
alpha when it is used with `mask-image`.

| Token                          | Default value                                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--slotted-icon-check`         | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")` |
| `--slotted-icon-minus`         | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E")`                                |
| `--slotted-icon-dot`           | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3C/svg%3E")`                                                                           |
| `--slotted-icon-x`             | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M18 6 6 18M6 6l12 12'/%3E%3C/svg%3E")`                    |
| `--slotted-icon-chevron-right` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")`   |
| `--slotted-icon-chevron-down`  | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`    |

A component-owned icon is a mask from a glyph token; a character is never an
icon.

## Target size

This scale answers how small an interactive target may be.

| Token                          | Default value |
| ------------------------------ | ------------- |
| `--slotted-target-min`         | `24px`        |
| `--slotted-target-comfortable` | `44px`        |

`--slotted-target-min` is the WCAG 2.2 minimum of 24 × 24 CSS pixels. Theme
validation rejects a density whose control height falls below it, so no density
can be added that makes a control unhittable.

`--slotted-target-comfortable` is the size a control grows to under
`@media (pointer: coarse)`. The theme emits that block itself, per density, as
`max(<density height>, var(--slotted-target-comfortable))`: a dense table keeps
its type and spacing on touch while its controls stay operable, and a theme
whose control is already larger is left alone.

A target smaller than the minimum in one axis — an icon-only control, a remove
button inside a tag — is corrected by the family, either by expanding the hit
area or by spacing the targets apart. Neither is something the theme can do on
the family's behalf.

## Control typography

These tokens answer what a control's text and frame look like before any family
adjusts them.

| Token                                   | Default value                         |
| --------------------------------------- | ------------------------------------- |
| `--slotted-control-font-family`         | `var(--slotted-font-family-sans)`     |
| `--slotted-control-font-weight`         | `var(--slotted-font-weight-semibold)` |
| `--slotted-control-line-height`         | `1`                                   |
| `--slotted-control-letter-spacing`      | `0`                                   |
| `--slotted-control-border-width`        | `var(--slotted-border-width-thin)`    |
| `--slotted-control-radius`              | `var(--slotted-radius-sm)`            |
| `--slotted-control-shadow`              | `none`                                |
| `--slotted-control-transition-duration` | `var(--slotted-duration-short)`       |
| `--slotted-control-transition-easing`   | `var(--slotted-easing-standard)`      |

## Semantic colour

These tokens answer what a surface, its text, its border and its states are
painted with. `high-contrast` is a scheme an application selects, held to the
AAA text ratio by `packages/themes/default/test/contrast.test.mjs`; the
operating system's own high-contrast mode is handled by forced colours instead.

| Token                                 | Light                  | Dark                | High contrast       |
| ------------------------------------- | ---------------------- | ------------------- | ------------------- |
| `--slotted-focus-ring-color`          | `#2563eb`              | `#d4d4d8`           | `#000000`           |
| `--slotted-border-subtle`             | `#e2e8f0`              | `#27272a`           | `#000000`           |
| `--slotted-text`                      | `#0f172a`              | `#fafafa`           | `#000000`           |
| `--slotted-text-muted`                | `#5b6b7f`              | `#a1a1aa`           | `#1f2937`           |
| `--slotted-disabled-background`       | `#e2e8f0`              | `#18181b`           | `#ffffff`           |
| `--slotted-disabled-foreground`       | `#64748b`              | `#71717a`           | `#595959`           |
| `--slotted-disabled-border`           | `#cbd5e1`              | `#27272a`           | `#595959`           |
| `--slotted-surface`                   | `#ffffff`              | `#131316`           | `#ffffff`           |
| `--slotted-surface-raised`            | `#ffffff`              | `#1c1c20`           | `#ffffff`           |
| `--slotted-surface-sunken`            | `#f6f8fb`              | `#0c0c0e`           | `#ffffff`           |
| `--slotted-surface-inverse`           | `#172033`              | `#fafafa`           | `#000000`           |
| `--slotted-text-inverse`              | `#f8fafc`              | `#18181b`           | `#ffffff`           |
| `--slotted-border-strong`             | `#78899c`              | `#71717a`           | `#000000`           |
| `--slotted-scrim`                     | `rgb(15 23 42 / 0.45)` | `rgb(0 0 0 / 0.62)` | `rgb(0 0 0 / 0.75)` |
| `--slotted-button-outline-background` | `transparent`          | `transparent`       | `transparent`       |
| `--slotted-button-ghost-background`   | `transparent`          | `transparent`       | `transparent`       |

The five tones — `accent`, `secondary`, `success`, `warning` and `danger` —
each carry the same nine roles: `solid`, `solid-hover`, `solid-active`,
`on-solid`, `surface`, `subtle-hover`, `subtle-active`, `border` and `text`.
Their values are not tabled here because the set is one hundred and thirty-five
entries; the contract holds every name and the contrast test holds every ratio.

## Shadow

This scale answers what elevation a surface needs in each colour scheme.

| Token                 | Light                                                            | Dark                                                       | High contrast       |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------- |
| `--slotted-shadow-xs` | `0 1px 2px rgb(15 23 42 / 0.06)`                                 | `0 1px 2px rgb(0 0 0 / 0.40)`                              | `0 0 0 1px #000000` |
| `--slotted-shadow-sm` | `0 1px 3px rgb(15 23 42 / 0.10), 0 1px 2px rgb(15 23 42 / 0.06)` | `0 1px 3px rgb(0 0 0 / 0.50), 0 1px 2px rgb(0 0 0 / 0.40)` | `0 0 0 1px #000000` |
| `--slotted-shadow-md` | `0 4px 12px rgb(15 23 42 / 0.10)`                                | `0 4px 12px rgb(0 0 0 / 0.55)`                             | `0 0 0 2px #000000` |
| `--slotted-shadow-lg` | `0 12px 32px rgb(15 23 42 / 0.14)`                               | `0 12px 32px rgb(0 0 0 / 0.65)`                            | `0 0 0 2px #000000` |

## Forced colours

Under `forced-colors: active` the operating system replaces the palette. Each
scheme token is remapped to a system colour once, in the theme, so a family
that reads a semantic token keeps working without writing a rule of its own.

| Token                                 | Replacement    |
| ------------------------------------- | -------------- |
| `--slotted-focus-ring-color`          | `Highlight`    |
| `--slotted-border-subtle`             | `ButtonBorder` |
| `--slotted-text`                      | `CanvasText`   |
| `--slotted-text-muted`                | `GrayText`     |
| `--slotted-disabled-background`       | `Canvas`       |
| `--slotted-disabled-foreground`       | `GrayText`     |
| `--slotted-disabled-border`           | `GrayText`     |
| `--slotted-shadow-xs`                 | `none`         |
| `--slotted-shadow-sm`                 | `none`         |
| `--slotted-shadow-md`                 | `none`         |
| `--slotted-shadow-lg`                 | `none`         |
| `--slotted-surface`                   | `Canvas`       |
| `--slotted-surface-raised`            | `Canvas`       |
| `--slotted-surface-sunken`            | `Canvas`       |
| `--slotted-surface-inverse`           | `CanvasText`   |
| `--slotted-text-inverse`              | `Canvas`       |
| `--slotted-border-strong`             | `CanvasText`   |
| `--slotted-scrim`                     | `Canvas`       |
| `--slotted-button-outline-background` | `transparent`  |
| `--slotted-button-ghost-background`   | `transparent`  |

Every tone maps by rule rather than by row: `accent` is the selected tone and
takes `Highlight` and `HighlightText`; the other four take `ButtonFace` and
`ButtonText`. Every tone surface becomes `Canvas`, every tone border
`ButtonBorder`, and every tone text `CanvasText`.

## Control geometry

This scale answers the physical size and internal spacing of a control at each
density. The legacy Button aliases preserve their values by referencing the
corresponding control token; they are not a competing scale.

| Token                                 | Comfortable | Compact | Dense  | Legacy Button alias                  |
| ------------------------------------- | ----------- | ------- | ------ | ------------------------------------ |
| `--slotted-control-height-sm`         | `30px`      | `26px`  | `24px` | `--slotted-button-height-sm`         |
| `--slotted-control-height-md`         | `34px`      | `28px`  | `26px` | `--slotted-button-height-md`         |
| `--slotted-control-height-lg`         | `38px`      | `32px`  | `30px` | `--slotted-button-height-lg`         |
| `--slotted-control-padding-inline-sm` | `10px`      | `8px`   | `6px`  | `--slotted-button-padding-inline-sm` |
| `--slotted-control-padding-inline-md` | `13px`      | `10px`  | `8px`  | `--slotted-button-padding-inline-md` |
| `--slotted-control-padding-inline-lg` | `16px`      | `12px`  | `10px` | `--slotted-button-padding-inline-lg` |
| `--slotted-control-font-size-sm`      | `12px`      | `12px`  | `12px` | `--slotted-button-font-size-sm`      |
| `--slotted-control-font-size-md`      | `13px`      | `12px`  | `12px` | `--slotted-button-font-size-md`      |
| `--slotted-control-font-size-lg`      | `14px`      | `13px`  | `12px` | `--slotted-button-font-size-lg`      |
| `--slotted-control-icon-size-sm`      | `14px`      | `13px`  | `12px` | `--slotted-button-icon-size-sm`      |
| `--slotted-control-icon-size-md`      | `16px`      | `14px`  | `13px` | `--slotted-button-icon-size-md`      |
| `--slotted-control-icon-size-lg`      | `18px`      | `16px`  | `14px` | `--slotted-button-icon-size-lg`      |
| `--slotted-control-gap-sm`            | `6px`       | `4px`   | `4px`  | —                                    |
| `--slotted-control-gap-md`            | `8px`       | `6px`   | `4px`  | —                                    |
| `--slotted-control-gap-lg`            | `8px`       | `6px`   | `6px`  | —                                    |

## Rules for component tokens and containers

1. A component token's value is another token, unless the contract records the
   reason for the literal. The universally exempt values are `0`, `none`,
   `auto`, `100%`, `transparent`, `currentColor`, and `inherit`.
2. Durations and easings come from the motion scale. Infinite animations must
   stop or disable under reduced motion; shortening is insufficient.
3. A component-owned icon is a mask from a glyph token; a character is never an
   icon.
4. A container breakpoint cannot be a token because
   `@container (min-width: var(--x))` is invalid. A reflowing family declares
   `container-type: inline-size` and its own `container-name`; its breakpoints
   are literal.
5. A family is selected in public by `data-ui` and its parts by `data-part`. A
   class name is not contract, and `packages/styles/src/identity.test.mjs`
   rejects a stylesheet that keys on one.
6. A weaker state holds itself back for every stronger one, in the order
   `STATE_PRECEDENCE` declares. `packages/styles/src/states.test.mjs` rejects a
   hover or active rule that does not.

## Current boundary

The foundation changes one rendered value on purpose: `--slotted-text-muted` in
the light scheme darkened to meet 4.5:1 against the sunken surface, and
`--slotted-border-strong` in both schemes darkened to meet 3:1 against the
surface it separates. Everything else the theme emitted before this foundation
resolves to the same value, which
`packages/tokens/test/resolve.test.mjs` holds.

Consumption is the rebuild's work: the families listed in
`specs/legacy-families.json` do not yet read these scales, and each one starts
doing so when it is rebuilt.
