# 0001 — One top-level cascade layer, `slotted`

Status: accepted, 2026-08-31.

## Context

The library shipped four layer names — `slotted.tokens`, `slotted.theme`,
`slotted.components`, `slotted.overrides` — declared in one order statement
emitted by `packages/tokens/scripts/build.mjs`. Two of the four held rules.

The statement reached the document only through `@slotted/tokens/styles.css`.
Angular ships no stylesheet: its component CSS is inlined and injected when a
component first renders, so an Angular application that imported the theme and
nothing else registered no order at all. React had the same gap through
`@slotted/react/styles.css`.

A layer takes its position from the first mention of its name. An application
that mentioned a `slotted` sublayer before the library did — writing into
`slotted.overrides`, the layer the library invited it to use — registered that
layer below `slotted.components`, and its rules lost with no error.

## Decision

`slotted` is the only top-level layer, and the only name in the public
contract. An application orders the entire library against its own CSS with
`@layer slotted, app;`.

The published internal order is
`@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components;`.
It is exported once as `LAYER_ORDER_STATEMENT` from
`@slotted/tokens/layer-order` and emitted at the top of every distributed
stylesheet, so any single import establishes it. Restating it is inert.

`slotted.overrides` is removed. Unlayered application CSS already beats every
layer, and an application that layers everything uses the one-line
declaration. A layer named by the library is a layer whose position the
library controls, which makes it the wrong place for rules the application
owns.

`slotted.reset` and `slotted.tokens` are declared and empty. A name inserted
later would reorder what already shipped; reserving a position costs a string.

## Consequences

`@slotted/theme-default` is the entry that carries the order for Angular. It
was already a required import, since every family reads its values from the
theme.

Three checks hold the contract: `packages/tokens/test/layer-order.test.mjs`
pins the string and the token stylesheet, the theme test pins the theme
stylesheet, and `packages/react/package-boundary.verify.mjs` fails the React
build when the bundled stylesheet does not open with it.

Applications written against `slotted.overrides` before this change move those
rules to their own layer or leave them unlayered.
