# 0004 — Theming architecture

Status: accepted, 2026-10-01. Design: `docs/history/designs/2026-10-01-theming-architecture-design.md`. Supersedes the sublayer table of `0001-cascade-layer-contract.md`.

## Context

A theme was a JSON file of literal token values. It could not carry a rule, a font or a component-level decision, and changing the accent meant editing nine tokens in each of three schemes. No colour could be chosen at runtime.

## Decision

**A theme is a module.** `defineTheme` from `@slotted/theme` takes seeds, a recipe, token values on the three axes, component tokens, fonts and CSS rules, and is typed against the token contract and the component tokens the family stylesheets read. `extendTheme` builds one theme on another. `slotted-build-theme` compiles a theme module to `<name>.css`, `<name>.js` and `<name>.d.ts`; `applyTheme` compiles and applies one at runtime.

**Colour is derived from seeds in CSS.** Five seeds (`accent`, `neutral`, `success`, `warning`, `danger`) are registered custom properties. Every colour token is an `oklch(from var(--slotted-seed-*) …)` derivation with a lightness bound that depends on hue and chroma, so any seed keeps the contrast ratios; `evaluateRecipe` computes the same values in JavaScript.

**Schemes are scoped.** Each scheme block is an `@scope` whose nearest root wins; an element with `data-slotted-seeds` derives every colour from its own seeds. `data-slotted-scheme="system"` follows `prefers-color-scheme`.

**Theme rules have their own sublayer.** The published order is `@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components, slotted.theme-rules;`. A theme's rules are emitted inside `@scope ([data-slotted-theme="<name>"]) to ([data-slotted-theme]:not([data-slotted-theme="<name>"]))` and may select only `data-ui`, `data-part` and the public attributes, and read only tokens.

## Consequences

- Minimum browsers: Chrome 119, Safari 18, Firefox 146.
- `@slotted/tokens` and `@slotted/theme-default` are gone; `@slotted/theme` and `@slotted/themes` replace them.
- A family that adds a component token makes `pnpm --filter @slotted/theme generate` necessary; `packages/theme/test/generated.test.mjs` fails until it runs.
