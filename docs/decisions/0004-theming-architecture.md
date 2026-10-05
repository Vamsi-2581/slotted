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
- The neutral grounds follow the `neutral` seed in `light` and `dark` (2026-10-02). `recipes.standard` gives `--slotted-surface`, `--slotted-surface-raised`, `--slotted-surface-sunken` and the dark `--slotted-surface-inverse` 0.22 of the seed's chroma, capped at the chroma sRGB holds at each ground's lightness, and the light grounds stand at lightness 0.985 rather than 1. The default theme's light page, card and field are `#f8fafe`, not `#ffffff`. `high-contrast` keeps achromatic grounds.
- Every token of the `neutral` seed in `light` and `dark` takes the seed's hue with no offset and at least the grounds' 0.22 of its chroma, capped at 0.06 and at the chroma sRGB holds at its lightness (2026-10-02). A line, highlight or fill drawn over a ground carries at least the ground's chroma, so the step from the ground points at the seed's hue. `high-contrast` keeps achromatic grounds, lines and inks; its `--slotted-text-muted` keeps the seed under the same gamut cap.
- The runtime path enforces the build's selector policy (2026-10-05), reversing §10.2 of the design, where `applyTheme` did not validate. `ruleErrors` in `packages/theme/src/rule-policy.ts` is the one implementation: `slotted-build-theme` calls it after lightningcss reads the syntax, and `defineTheme`, `extendTheme`, `renderTheme` and `applyTheme` call it on every rule given as text, with the same refusals and messages. A rule given as a URL is checked by the build only. The policy and the hook index `src/generated/hooks.json` ship in `dist/index.js`: 212,420 bytes and 33.20 kB gzip, against 177,510 bytes and 24.50 kB before the policy.
- The policy reaches past §10.2 of the design, which governs selectors and reads (2026-10-05). `@scope`, `@import` and `@layer` are refused at any depth, with the line and the at-rule, because the compiler writes them; `processRules` no longer checks them. A declaration that writes a private property (`--_*`) is refused. `&` outside a style rule is refused, as `:scope` is. `data-ui` and `data-part` take only `=` or no value. Attribute names match without regard to case, and escapes in function and property names are decoded before the checks.
