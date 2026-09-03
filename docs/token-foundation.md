# Token foundation

This is the repository law for the default token foundation. The contract and
the default theme change in lockstep: each declares the same token names for a
group, and validation rejects a name missing from either side. The tables below
are the default theme's authored values.

These rules are binding for every family the rebuild has reached. A family
listed in `specs/legacy-families.json` predates this foundation and is exempt
until it is rebuilt in the order `docs/build-order.md` sets; that list only
shrinks, and nothing may be added to it.

## Layers

Every token belongs to exactly one layer, and the layer says what may reference
it: a token composes its value from its own layer or a shallower one, never a
deeper one. `packages/tokens/src/validate-theme.mjs` rejects a theme that
breaks the direction, so the layering is a checked fact rather than a naming
convention.

| Layer       | Holds                                                          | Tokens |
| ----------- | -------------------------------------------------------------- | ------ |
| `primitive` | A value with no meaning attached: a step on a scale.           | 78     |
| `semantic`  | What a value is for: a surface, a border, a control, a target. | 94     |
| `component` | One family adjusting a semantic value for itself.              | 5      |

A token is a **scale root** when it states a value rather than composing one: a
primitive, a colour a scheme paints, or the geometry a density defines. Every
other token must reference another token. A root that restates a literal is
what the three layers exist to prevent — a component deciding, on its own, what
`4px` means.

A non-root token may still state a literal when the contract records why, in
its `literal` field. There are two such tokens, each carrying its reason, and
both describe the same thing: the absence of a value a scale could hold — no
tracking, and a line box that is the control's own height. A third described
the absence of elevation until `--slotted-control-shadow` was given one.

The component layer holds one scale, and holds it for the reason the layer
exists: a family met a size a semantic token cannot be retuned to give. Button
emptied the layer by reading `--slotted-control-*` directly instead of aliasing
it, which is what lets a theme retune every control once; Avatar refilled it,
because control geometry names a control and an avatar is not one. The bar for
adding to this layer is the one Avatar cleared, written out under **Avatar
size** below: a family may not alias a semantic token here, and it may not
restate a scale that already exists.

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

| Token                     | Default value |
| ------------------------- | ------------- |
| `--slotted-font-size-xs`  | `0.75rem`     |
| `--slotted-font-size-sm`  | `0.8125rem`   |
| `--slotted-font-size-md`  | `0.875rem`    |
| `--slotted-font-size-lg`  | `1rem`        |
| `--slotted-font-size-xl`  | `1.125rem`    |
| `--slotted-font-size-2xl` | `1.25rem`     |
| `--slotted-font-size-3xl` | `1.5rem`      |

## Line height

This scale answers how much vertical rhythm a text size needs.

| Token                       | Default value |
| --------------------------- | ------------- |
| `--slotted-line-height-xs`  | `1.4`         |
| `--slotted-line-height-sm`  | `1.45`        |
| `--slotted-line-height-md`  | `1.5`         |
| `--slotted-line-height-lg`  | `1.5`         |
| `--slotted-line-height-xl`  | `1.45`        |
| `--slotted-line-height-2xl` | `1.4`         |
| `--slotted-line-height-3xl` | `1.3`         |

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

| Token                           | Default value                                                                                                                                                                                                                                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--slotted-icon-check`          | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")`                                                                                              |
| `--slotted-icon-minus`          | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E")`                                                                                                                             |
| `--slotted-icon-plus`           | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='M12 5v14'/%3E%3C/svg%3E")`                                                                                                     |
| `--slotted-icon-dot`            | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3C/svg%3E")`                                                                                                                                                                        |
| `--slotted-icon-x`              | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M18 6 6 18M6 6l12 12'/%3E%3C/svg%3E")`                                                                                                                 |
| `--slotted-icon-copy`           | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='14' height='14' x='8' y='8' rx='2'/%3E%3Cpath d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/%3E%3C/svg%3E")` |
| `--slotted-icon-chevron-right`  | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")`                                                                                                |
| `--slotted-icon-chevron-down`   | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`                                                                                                 |
| `--slotted-icon-chevrons-right` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 18 6-6-6-6'/%3E%3Cpath d='m13 18 6-6-6-6'/%3E%3C/svg%3E")`                                                                  |

| `--slotted-icon-eye` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2.6 12C4.6 8.2 8 6.2 12 6.2s7.4 2 9.4 5.8c-2 3.8-5.4 5.8-9.4 5.8S4.6 15.8 2.6 12Z'/%3E%3Ccircle cx='12' cy='12' r='2.8'/%3E%3C/svg%3E")` |
| `--slotted-icon-eye-off` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2.6 12C4.6 8.2 8 6.2 12 6.2s7.4 2 9.4 5.8c-2 3.8-5.4 5.8-9.4 5.8S4.6 15.8 2.6 12Z'/%3E%3Ccircle cx='12' cy='12' r='2.8'/%3E%3Cpath d='M4.4 19.6 19.6 4.4'/%3E%3C/svg%3E")` |
| `--slotted-icon-external` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7 7h10v10'/%3E%3Cpath d='M7 17 17 7'/%3E%3C/svg%3E")` |

| `--slotted-icon-person` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ccircle cx='12' cy='7.8' r='3.6'/%3E%3Cpath d='M12 13.3c-4.3 0-7.7 2.7-7.7 6.1 0 .8.6 1.4 1.4 1.4h12.6c.8 0 1.4-.6 1.4-1.4 0-3.4-3.4-6.1-7.7-6.1Z'/%3E%3C/svg%3E")` |

| `--slotted-icon-circle` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3C/svg%3E")` |

| `--slotted-icon-circle-info` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 11.4v4.6'/%3E%3Cpath d='M12 8h.01'/%3E%3C/svg%3E")` |

| `--slotted-icon-circle-check` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='m8.2 12.3 2.6 2.6 5-5.6'/%3E%3C/svg%3E")` |

| `--slotted-icon-triangle-alert` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10.58 5.54Q12 2.9 13.42 5.54L20.28 18.26Q21.7 20.9 18.7 20.9L5.3 20.9Q2.3 20.9 3.72 18.26Z'/%3E%3Cpath d='M12 10.4v3.6'/%3E%3Cpath d='M12 17.5h.01'/%3E%3C/svg%3E")` |

| `--slotted-icon-circle-alert` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 8v4.4'/%3E%3Cpath d='M12 16h.01'/%3E%3C/svg%3E")` |
| `--slotted-icon-circle-x` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='m9.6 9.6 4.8 4.8'/%3E%3Cpath d='m14.4 9.6-4.8 4.8'/%3E%3C/svg%3E")` |

| `--slotted-icon-circle-question` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M9.5 9.3a2.6 2.6 0 0 1 5.05.87c0 1.73-2.6 2.6-2.6 2.6'/%3E%3Cpath d='M12 16.4h.01'/%3E%3C/svg%3E")` |

| `--slotted-icon-inbox` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 13h-5l-1.6 2.6H9.6L8 13H3'/%3E%3Cpath d='M6.2 4.9 3 13v4.3A1.7 1.7 0 0 0 4.7 19h14.6a1.7 1.7 0 0 0 1.7-1.7V13l-3.2-8.1A1.7 1.7 0 0 0 16.2 3.8H7.8a1.7 1.7 0 0 0-1.6 1.1Z'/%3E%3C/svg%3E")` |

| `--slotted-icon-search-x` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='10.5' cy='10.5' r='6.7'/%3E%3Cpath d='m8.3 8.3 4.4 4.4'/%3E%3Cpath d='m12.7 8.3-4.4 4.4'/%3E%3Cpath d='m20.5 20.5-4.9-4.9'/%3E%3C/svg%3E")` |

| `--slotted-icon-lock` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='10.4' width='16' height='9.6' rx='2.2'/%3E%3Cpath d='M7.8 10.4V7.6a4.2 4.2 0 0 1 8.4 0v2.8'/%3E%3C/svg%3E")` |

| `--slotted-icon-cloud-off` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17.4 18.6H8.9a6.4 6.4 0 0 1-.5-12.7 6.6 6.6 0 0 1 6.7 3.6h2.3a4.5 4.5 0 0 1 3 7.9'/%3E%3Cpath d='M3.6 3.6 20.4 20.4'/%3E%3C/svg%3E")` |

A component-owned icon is a mask from a glyph token; a character is never an
icon.

`--slotted-icon-chevrons-right` is one mark rather than two chevrons a family
draws twice: the distance between the two strokes is part of the artwork, and a
family compositing two masks would decide it again, differently, each time. It
was added for `pagination`, whose first and last triggers are the one pair in
the library that means "all the way to the end" rather than "one step"; like
every chevron it is mirrored by the family that draws it, so the same token
serves both ends of the row.

`--slotted-icon-copy` is two sheets, one behind the other, rather than a pair of
brackets or a page: the mark has to be read at sixteen pixels beside a value, and
the overlap is what says _duplicate_ at that size. It was added for
`description-list`, whose long values are reachable by copying rather than by
truncation, and `code-block` in wave 7 needs the same mark.

`--slotted-icon-person` is the only glyph drawn as a filled silhouette rather
than as strokes, because it is the only one that stands in for a photograph
rather than annotating text. It is the last step of Avatar's fallback order,
reached when there is no picture and no name to take initials from.

The six glyphs from `--slotted-icon-circle` onward are the status set, and they
are the only ones that carry their own container. The bare marks above them —
`check`, `minus`, `plus`, `x`, `copy`, `eye`, `eye-off` — are drawn inside a box
some control already provides: a checkbox, a tag's remove button, a description
list's copy button, a text field's reveal button, a number field's stepper.
`minus` and `plus` are one pair drawn
on one grid — the same bar, with a second crossing it — so a split stepper's two
halves read as one control and not as two marks of different weights. `plus` was
added for `number-field`; the scale had held the half of the pair that a
checkbox's indeterminate mark needed and not the other. `eye` and `eye-off` are one pair rather than two marks, because they
are the same artwork with a stroke added: the two states of a password toggle
then read as one control changing rather than as two icons swapping places. A status icon has no such box, so the circle
and the triangle are part of the artwork rather than a stylistic preference,
and the triangle is the one silhouette that has to be recognised before its
colour is. The set is consumed by `status-indicator`, and by `alert` and
`inline-message`, all three of which are required to say what they mean by icon
as well as by tone.

The last four are the marks that carry a whole region rather than annotate a
line, and they were added for `result-state`, whose `status` axis has seven
values and only three marks that already existed. Each one is a silhouette
nothing in the set above can stand in for: a lock is not an alert, a struck
cloud is not a question, a tray is not a dot, and a magnifier is not in the
scale at all. Without them five of the seven statuses would draw the same
circle, which is the reading the axis exists to pass — WCAG 2.2 SC 1.4.1, and
`forced-colors`, where every tone ground becomes one system colour and the shape
is all that is left. They carry their own container for the reason the status
set does: a result state gives its mark no box.

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

| Token                                     | Default value                         |
| ----------------------------------------- | ------------------------------------- |
| `--slotted-control-font-family`           | `var(--slotted-font-family-sans)`     |
| `--slotted-control-font-weight`           | `var(--slotted-font-weight-semibold)` |
| `--slotted-control-line-height`           | `1`                                   |
| `--slotted-control-letter-spacing`        | `0`                                   |
| `--slotted-control-border-width`          | `var(--slotted-border-width-thin)`    |
| `--slotted-control-radius`                | `var(--slotted-radius-sm)`            |
| `--slotted-control-shadow-focus-geometry` | `0 1px 4px -1px`                      |
| `--slotted-control-transition-duration`   | `var(--slotted-duration-short)`       |
| `--slotted-control-transition-easing`     | `var(--slotted-easing-standard)`      |

`--slotted-control-shadow-focus-geometry` is an offset, a blur and a spread
with no colour, which is what lets the shadow under a focused control take the
colour of the state. A family draws it as
`var(--slotted-control-shadow-focus-geometry) var(--slotted-focus-ring-color)`,
so retargeting the ring colour on the element — which is how a family answers
`[data-invalid]` — moves the outline and the shadow together. A complete shadow
token could not do that: a custom property composed on `:root` resolves its
`var()` calls there, and the element's own ring colour never reaches it.

## Semantic colour

These tokens answer what a surface, its text, its border and its states are
painted with. `high-contrast` is a scheme an application selects, held to the
AAA text ratio by `packages/themes/default/test/contrast.test.mjs`; the
operating system's own high-contrast mode is handled by forced colours instead.

| Token                                | Light                               | Dark                                | High contrast                       |
| ------------------------------------ | ----------------------------------- | ----------------------------------- | ----------------------------------- |
| `--slotted-focus-ring-color`         | `#2563eb`                           | `#60a5fa`                           | `#000000`                           |
| `--slotted-focus-ring-color-invalid` | `var(--slotted-tone-danger-border)` | `var(--slotted-tone-danger-border)` | `var(--slotted-tone-danger-border)` |
| `--slotted-border-subtle`            | `#e2e8f0`                           | `#27272a`                           | `#000000`                           |
| `--slotted-text`                     | `#0f172a`                           | `#fafafa`                           | `#000000`                           |
| `--slotted-text-muted`               | `#5b6b7f`                           | `#a1a1aa`                           | `#1f2937`                           |
| `--slotted-disabled-background`      | `#e2e8f0`                           | `#18181b`                           | `#ffffff`                           |
| `--slotted-disabled-foreground`      | `#64748b`                           | `#71717a`                           | `#595959`                           |
| `--slotted-disabled-border`          | `#cbd5e1`                           | `#27272a`                           | `#595959`                           |
| `--slotted-surface`                  | `#ffffff`                           | `#131316`                           | `#ffffff`                           |
| `--slotted-surface-raised`           | `#ffffff`                           | `#1c1c20`                           | `#ffffff`                           |
| `--slotted-surface-sunken`           | `#f6f8fb`                           | `#0c0c0e`                           | `#ffffff`                           |
| `--slotted-surface-inverse`          | `#172033`                           | `#fafafa`                           | `#000000`                           |
| `--slotted-text-inverse`             | `#f8fafc`                           | `#18181b`                           | `#ffffff`                           |
| `--slotted-border-strong`            | `#78899c`                           | `#71717a`                           | `#000000`                           |
| `--slotted-control-border-color`     | `#8190a2`                           | `#6a6a73`                           | `#000000`                           |
| `--slotted-scrim`                    | `rgb(15 23 42 / 0.45)`              | `rgb(0 0 0 / 0.62)`                 | `rgb(0 0 0 / 0.75)`                 |

`--slotted-control-border-color` is the edge of a control and
`--slotted-border-strong` is the line between two surfaces. Both hold the 3:1
ratio a non-text element needs, against every surface a control can be placed
on, and they do not hold the same weight: the control step is the lighter of
the two, so a form does not read as the darkest thing on the page.
`packages/themes/default/test/contrast.test.mjs` measures both against
`--slotted-surface`, `--slotted-surface-raised` and `--slotted-surface-sunken`.

`--slotted-focus-ring-color-invalid` is the ring a control in error draws, and
it is the only state that changes the ring's colour. A family points
`--slotted-focus-ring-color` at it under `[data-invalid]` rather than repainting
each rule that draws focus. Under forced colours it maps to `Highlight` like
the ring it replaces, because a focus indicator is a focus indicator before it
is an error.

The five tones — `accent`, `secondary`, `success`, `warning` and `danger` —
each carry the same nine roles: `solid`, `solid-hover`, `solid-active`,
`on-solid`, `surface`, `subtle-hover`, `subtle-active`, `border` and `text`.
Their values are not tabled here because the set is one hundred and thirty-five
entries; the contract holds every name and the contrast test holds every ratio.

## Shadow

This scale answers what elevation a surface needs in each colour scheme.

| Token                      | Light                                                            | Dark                                                       | High contrast       |
| -------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------- |
| `--slotted-shadow-xs`      | `0 1px 2px rgb(15 23 42 / 0.06)`                                 | `0 1px 2px rgb(0 0 0 / 0.40)`                              | `0 0 0 1px #000000` |
| `--slotted-shadow-sm`      | `0 1px 3px rgb(15 23 42 / 0.10), 0 1px 2px rgb(15 23 42 / 0.06)` | `0 1px 3px rgb(0 0 0 / 0.50), 0 1px 2px rgb(0 0 0 / 0.40)` | `0 0 0 1px #000000` |
| `--slotted-shadow-md`      | `0 4px 12px rgb(15 23 42 / 0.10)`                                | `0 4px 12px rgb(0 0 0 / 0.55)`                             | `0 0 0 2px #000000` |
| `--slotted-shadow-lg`      | `0 12px 32px rgb(15 23 42 / 0.14)`                               | `0 12px 32px rgb(0 0 0 / 0.65)`                            | `0 0 0 2px #000000` |
| `--slotted-control-shadow` | `0 1px 1px rgb(15 23 42 / 0.04)`                                 | `0 1px 1px rgb(0 0 0 / 0.32)`                              | `none`              |

`--slotted-control-shadow` is the shadow a framed control carries at rest, and
it is a step below `--slotted-shadow-xs` because it separates a control from
its ground rather than lifting a surface off the page. It varies by scheme for
the reason every other shadow does — the ink of a shadow is not the same value
in a light scheme and a dark one — and it is `none` in `high-contrast`, where a
control already carries a black edge and a second one would only thicken it.

## Forced colours

Under `forced-colors: active` the operating system replaces the palette. Each
scheme token is remapped to a system colour once, in the theme, so a family
that reads a semantic token keeps working without writing a rule of its own.

| Token                                | Replacement    |
| ------------------------------------ | -------------- |
| `--slotted-focus-ring-color`         | `Highlight`    |
| `--slotted-focus-ring-color-invalid` | `Highlight`    |
| `--slotted-border-subtle`            | `ButtonBorder` |
| `--slotted-text`                     | `CanvasText`   |
| `--slotted-text-muted`               | `GrayText`     |
| `--slotted-disabled-background`      | `Canvas`       |
| `--slotted-disabled-foreground`      | `GrayText`     |
| `--slotted-disabled-border`          | `GrayText`     |
| `--slotted-shadow-xs`                | `none`         |
| `--slotted-shadow-sm`                | `none`         |
| `--slotted-shadow-md`                | `none`         |
| `--slotted-shadow-lg`                | `none`         |
| `--slotted-surface`                  | `Canvas`       |
| `--slotted-surface-raised`           | `Canvas`       |
| `--slotted-surface-sunken`           | `Canvas`       |
| `--slotted-surface-inverse`          | `CanvasText`   |
| `--slotted-text-inverse`             | `Canvas`       |
| `--slotted-border-strong`            | `CanvasText`   |
| `--slotted-control-border-color`     | `ButtonBorder` |
| `--slotted-control-shadow`           | `none`         |
| `--slotted-scrim`                    | `Canvas`       |

Every tone maps by rule rather than by row: `accent` is the selected tone and
takes `Highlight` and `HighlightText`; the other four take `ButtonFace` and
`ButtonText`. Every tone surface becomes `Canvas`, every tone border
`ButtonBorder`, and every tone text `CanvasText`.

## Control geometry

This scale answers the physical size and internal spacing of a control at each
density. Every control reads it directly: Button aliased it until the family was
rebuilt, and nothing aliases it now.

| Token                                 | Comfortable | Compact | Dense  |
| ------------------------------------- | ----------- | ------- | ------ |
| `--slotted-control-height-sm`         | `30px`      | `26px`  | `24px` |
| `--slotted-control-height-md`         | `34px`      | `28px`  | `26px` |
| `--slotted-control-height-lg`         | `38px`      | `32px`  | `30px` |
| `--slotted-control-padding-inline-sm` | `10px`      | `8px`   | `6px`  |
| `--slotted-control-padding-inline-md` | `13px`      | `10px`  | `8px`  |
| `--slotted-control-padding-inline-lg` | `16px`      | `12px`  | `10px` |
| `--slotted-control-font-size-sm`      | `12px`      | `12px`  | `12px` |
| `--slotted-control-font-size-md`      | `13px`      | `12px`  | `12px` |
| `--slotted-control-font-size-lg`      | `14px`      | `13px`  | `12px` |
| `--slotted-control-icon-size-sm`      | `14px`      | `13px`  | `12px` |
| `--slotted-control-icon-size-md`      | `16px`      | `14px`  | `13px` |
| `--slotted-control-icon-size-lg`      | `18px`      | `16px`  | `14px` |
| `--slotted-control-gap-sm`            | `6px`       | `4px`   | `4px`  |
| `--slotted-control-gap-md`            | `8px`       | `6px`   | `4px`  |
| `--slotted-control-gap-lg`            | `8px`       | `6px`   | `6px`  |

## Avatar size

This scale answers how large the box holding a person's picture is. It is the
whole of the component layer.

| Token                      | Comfortable | Compact | Dense  |
| -------------------------- | ----------- | ------- | ------ |
| `--slotted-avatar-size-xs` | `24px`      | `22px`  | `20px` |
| `--slotted-avatar-size-sm` | `28px`      | `26px`  | `24px` |
| `--slotted-avatar-size-md` | `36px`      | `32px`  | `28px` |
| `--slotted-avatar-size-lg` | `48px`      | `42px`  | `36px` |
| `--slotted-avatar-size-xl` | `64px`      | `56px`  | `48px` |

A family answers density only by reading a token the theme restates per
density, and the three scales that do — control geometry, control type, control
glyphs — all name a control. An avatar is not one: the largest control is 38
pixels tall, and a profile page needs an avatar two thirds larger than that. No
semantic token could be retuned to give the scale without changing what it
means for every control in the library, which is the case the component layer
is for.

`xs` at `comfortable` is exactly `--slotted-target-min`, so the smallest avatar
is hittable without correction. Below that — `xs` at the two tighter densities
— an avatar that is a link or a button expands its own hit area, which is the
family's job rather than the theme's.

Everything else Avatar scales is a proportion of this box rather than a sixth
scale: the initials' type size, the glyph, the square corner radius, and the
overlap in a group. A proportion of a box is geometry, and geometry is not a
token.

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

The foundation changes four rendered values on purpose.
`--slotted-text-muted` in the light scheme darkened to meet 4.5:1 against the
sunken surface, and `--slotted-border-strong` in both schemes darkened to meet
3:1 against the surface it separates. `--slotted-control-shadow` left `none`
for the shadow tabled above, so a framed control is separated from its ground
by something other than its own edge. `--slotted-focus-ring-color` in the dark
scheme left the light grey `#d4d4d8` for `#60a5fa`, the accent border step,
which makes the ring the same idea in both schemes instead of a neutral in one
of them.

Everything else the theme emitted before this foundation resolves to the same
value, which `packages/tokens/test/resolve.test.mjs` holds. A row leaves that
table when its token leaves the contract, or when a change like the two above
is taken deliberately and written here.

Consumption is the rebuild's work: the families listed in
`specs/legacy-families.json` do not yet read these scales, and each one starts
doing so when it is rebuilt.
