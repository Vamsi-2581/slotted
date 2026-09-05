# Theme axis design

> Superseded, in its conclusions, by
> `docs/superpowers/specs/2026-09-03-css-theming-design.md`: a theme is
> authored in CSS, not as a token map. The defect analysis below still
> stands and is what the replacement is built on. `@slotted/theme-aurora`,
> written to measure the cost of a second JSON theme, was removed once it
> had answered that question.

The library is themed by data attributes: `data-slotted-theme` selects a token
set, `data-slotted-scheme` selects a palette inside it, `data-slotted-density`
selects a geometry. The scheme and density axes carry more than one value and
are exercised in the workbench. The theme axis carries one value, `default`,
and has never been exercised. This document records what that costs, and the
shape that makes the axis real.

## Defect found

Swapping `packages/themes/default/src/theme.json` for a file with the same
shape and a different `name` removes every token from the page. Components
render grey and motionless.

The chain:

1. `renderThemeCss` namespaces every emitted block by `theme.name` —
   `[data-slotted-theme="${theme.name}"]`.
2. `resolveWorkbenchGlobals` returns the literal `theme: 'default'` and ignores
   the global it is handed. The toolbar offers `items: ['default']`.
3. No selector matches, so no custom property is defined on the subtree.
4. Stylesheets that name a foundation token fall through to the system colour
   they carry as a last resort — `ButtonFace`, `CanvasText`, `GrayText`.
   That is the grey.
5. `--slotted-control-transition-duration` is read without a fallback. An
   unresolved `var()` invalidates the whole `transition` shorthand, and the
   declaration is dropped. That is the stopped motion.

The renamed theme is not the defect. The defect is that one name is compiled
into the only writer of the attribute, so the axis cannot be observed.

## What blocks a second theme

| Blocker | Location |
| ------- | -------- |
| The attribute value is a literal | `packages/storybook-workbench/src/globals.tsx:30,52` |
| The renderer lives inside the default theme | `packages/themes/default/scripts/build-theme.mjs` |
| The theme test suite reads one hard-coded theme | `packages/themes/default/test/*.test.mjs` |
| Package rank is an enumerated map | `scripts/verify-package-layers.mjs:5-15` |
| The harness reads one theme's stylesheet | `tools/harness/build.mjs:208` |
| Both previews import one theme's stylesheet | `apps/storybook-*/.storybook/preview.*` |

## What does not block it

Component stylesheets are fully tokenized: no declaration in
`packages/styles/src/*/*.css` states a literal colour, and `motion.test.mjs`
already holds every duration to the motion scale. Every painted value a family
produces is reachable from a theme.

The stylesheets do, however, carry comments that justify a role choice with the
default theme's own hex values. Those justifications do not transfer to another
palette. The conformance suite is what replaces them: a theme that shifts a
role past a ratio fails its own tests rather than a screenshot review.

## Target shape

`@slotted/tokens` owns the contract, its validation, its resolution, its layer
order, **its renderer**, and **a conformance suite**. A theme package owns a
`theme.json` and nothing else executable.

```
packages/tokens/src/render-theme.mjs        renderThemeCss(contract, theme)
packages/tokens/src/theme-conformance.mjs   themeConformance({contract, theme, distUrl})
packages/tokens/scripts/build-theme-cli.mjs bin: slotted-build-theme
packages/themes/<name>/src/theme.json
packages/themes/<name>/package.json         build: slotted-build-theme
packages/themes/<name>/test/theme.test.mjs  themeConformance(...)
```

Adding a theme is then: one directory, one JSON file, one manifest, one
three-line test, and registration in the workbench theme list.

The conformance suite holds every theme to the rules the default theme is
already held to: three schemes, three densities, AA text contrast in `light`
and `dark`, AAA in `high-contrast`, 3:1 for borders and focus rings, a
non-zero collapsed duration under reduced motion, complete and encoded glyph
payloads, and a control height no smaller than the declared target size.

Assertions that lock the *default theme's chosen values* — its shadow scale,
its stacking scale, its neutral secondary palette, white on solid — stay in
the default theme's own test file. They are that theme's identity, not a rule
another theme has to repeat.

## Customization surface

Every one of the 172 contract tokens stays overridable by every theme. No
token is fixed by the library.

The mandatory surface is the same number stated three times over: a theme
declares 86 base values, 66 scheme values in each of three schemes, 20 density
values in each of three densities, and 4 reduced-motion values — 348 entries.
161 of the 172 tokens are contract scale roots, so most of those entries are
literals rather than references.

20 of them are icon data URIs and 4 are stacking indices, which no theme is
expected to vary. Giving the contract a default value for a token, and letting
a theme state only what it changes, would cut the mandatory surface without
narrowing the customization surface. That change is not made here: the cost is
recorded first, against a real second theme, so the decision is taken against
a measurement.

## Second theme

`@slotted/theme-aurora` exists to disagree with the default on every axis a
theme can move: a violet accent instead of blue, a warm neutral instead of
slate, a serif instead of a system sans, fully rounded controls instead of a
4px corner, thicker borders, wider spacing, and slower durations on different
easing curves. It is held to the same conformance suite.

A theme that agrees with the default proves nothing. This one is the
measurement.
