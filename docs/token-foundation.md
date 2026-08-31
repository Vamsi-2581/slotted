# Token foundation

This is the repository law for the default token foundation. The contract and
the default theme change in lockstep: each declares the same token names for a
group, and validation rejects a name missing from either side. The tables below
are the default theme's authored values.

These rules are binding for newly created or refined families. Existing
unrefined families may still contain literals and ad-hoc motion until each is
migrated family-by-family; this document does not claim repository-wide
compliance.

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

## Motion

This scale answers how long a transition takes and how its velocity changes.

| Token                         | Default value                     | Reduced-motion value |
| ----------------------------- | --------------------------------- | -------------------- |
| `--slotted-duration-instant`  | `1ms`                             | `1ms`                |
| `--slotted-duration-short`    | `120ms`                           | `1ms`                |
| `--slotted-duration-medium`   | `200ms`                           | `1ms`                |
| `--slotted-duration-long`     | `320ms`                           | `1ms`                |
| `--slotted-easing-standard`   | `cubic-bezier(0.2, 0, 0, 1)`      | unchanged            |
| `--slotted-easing-enter`      | `cubic-bezier(0.05, 0.7, 0.1, 1)` | unchanged            |
| `--slotted-easing-exit`       | `cubic-bezier(0.3, 0, 0.8, 0.15)` | unchanged            |
| `--slotted-easing-emphasized` | `cubic-bezier(0.3, 0, 0, 1.3)`    | unchanged            |

Only the four motion-scale duration tokens collapse under
`prefers-reduced-motion`. Existing family-specific durations are not
automatically covered until their family is refined. Durations and easings for
new or refined families only come from the motion scale. Reaching for a
motion-scale duration token honors `prefers-reduced-motion`. Infinite animations
must stop or disable under reduced motion; shortening is insufficient.

## Shadow

This scale answers what elevation a surface needs in each color scheme.

| Token                 | Light                                                            | Dark                                                       |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `--slotted-shadow-xs` | `0 1px 2px rgb(15 23 42 / 0.06)`                                 | `0 1px 2px rgb(0 0 0 / 0.40)`                              |
| `--slotted-shadow-sm` | `0 1px 3px rgb(15 23 42 / 0.10), 0 1px 2px rgb(15 23 42 / 0.06)` | `0 1px 3px rgb(0 0 0 / 0.50), 0 1px 2px rgb(0 0 0 / 0.40)` |
| `--slotted-shadow-md` | `0 4px 12px rgb(15 23 42 / 0.10)`                                | `0 4px 12px rgb(0 0 0 / 0.55)`                             |
| `--slotted-shadow-lg` | `0 12px 32px rgb(15 23 42 / 0.14)`                               | `0 12px 32px rgb(0 0 0 / 0.65)`                            |

## Stacking

This scale answers which layer an element occupies relative to the application.

| Token                       | Default value |
| --------------------------- | ------------- |
| `--slotted-z-index-sticky`  | `100`         |
| `--slotted-z-index-overlay` | `1000`        |
| `--slotted-z-index-popover` | `1100`        |
| `--slotted-z-index-toast`   | `1200`        |

## Control geometry

This scale answers the physical size and internal spacing of a control at each
density. The legacy Button height, padding-inline, font-size, and icon-size
aliases preserve their existing values by referencing the corresponding control
token; they are not a competing scale.

| Token                                 | Comfortable | Compact | Legacy Button alias                                                            |
| ------------------------------------- | ----------- | ------- | ------------------------------------------------------------------------------ |
| `--slotted-control-height-sm`         | `30px`      | `26px`  | `--slotted-button-height-sm: var(--slotted-control-height-sm)`                 |
| `--slotted-control-height-md`         | `34px`      | `28px`  | `--slotted-button-height-md: var(--slotted-control-height-md)`                 |
| `--slotted-control-height-lg`         | `38px`      | `32px`  | `--slotted-button-height-lg: var(--slotted-control-height-lg)`                 |
| `--slotted-control-padding-inline-sm` | `10px`      | `8px`   | `--slotted-button-padding-inline-sm: var(--slotted-control-padding-inline-sm)` |
| `--slotted-control-padding-inline-md` | `13px`      | `10px`  | `--slotted-button-padding-inline-md: var(--slotted-control-padding-inline-md)` |
| `--slotted-control-padding-inline-lg` | `16px`      | `12px`  | `--slotted-button-padding-inline-lg: var(--slotted-control-padding-inline-lg)` |
| `--slotted-control-font-size-sm`      | `12px`      | `12px`  | `--slotted-button-font-size-sm: var(--slotted-control-font-size-sm)`           |
| `--slotted-control-font-size-md`      | `13px`      | `12px`  | `--slotted-button-font-size-md: var(--slotted-control-font-size-md)`           |
| `--slotted-control-font-size-lg`      | `14px`      | `13px`  | `--slotted-button-font-size-lg: var(--slotted-control-font-size-lg)`           |
| `--slotted-control-icon-size-sm`      | `14px`      | `13px`  | `--slotted-button-icon-size-sm: var(--slotted-control-icon-size-sm)`           |
| `--slotted-control-icon-size-md`      | `16px`      | `14px`  | `--slotted-button-icon-size-md: var(--slotted-control-icon-size-md)`           |
| `--slotted-control-icon-size-lg`      | `18px`      | `16px`  | `--slotted-button-icon-size-lg: var(--slotted-control-icon-size-lg)`           |
| `--slotted-control-gap-sm`            | `6px`       | `4px`   | —                                                                              |
| `--slotted-control-gap-md`            | `8px`       | `6px`   | —                                                                              |
| `--slotted-control-gap-lg`            | `8px`       | `6px`   | —                                                                              |

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

## Rules for component tokens and containers

1. A component token's fallback is another token, never a literal. The exact
   exemptions are `0`, `none`, `auto`, `100%`, `transparent`, `currentColor`,
   and `inherit`.
2. Durations and easings for newly created or refined families only come from
   the motion scale. Reaching for a motion-scale duration token honors
   `prefers-reduced-motion`. Infinite animations must stop or disable under
   reduced motion; shortening is insufficient. Only the four motion-scale
   duration tokens collapse; existing family-specific durations are not
   automatically covered until their family is refined.
3. A component-owned icon is a mask from a glyph token; a character is never
   an icon.
4. A container breakpoint cannot be a token because
   `@container (min-width: var(--x))` is invalid. A reflowing family declares
   `container-type: inline-size` and its own `container-name`; its breakpoints
   are literal.

## Current boundary

The foundation changes no existing rendered value. The contract/theme lockstep
is enforced by theme validation, and `packages/tokens/test/resolve.test.mjs`
resolves the default theme's token references and holds the pre-scale values.
No component stylesheet consumes these scales yet, except Task 6's Button
token-name correction. Scale consumption is later visual work, family by
family.
