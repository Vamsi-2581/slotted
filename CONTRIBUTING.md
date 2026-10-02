# Contributing to Slotted

Slotted is experimental. Architectural and public API decisions should remain small, explicit, and reversible until stabilized through a dedicated decision record.

## Prerequisites

- Node.js 24
- pnpm 11.24.0

Enable the pinned package manager and install dependencies:

```bash
corepack enable
corepack install --global pnpm@11.24.0
pnpm install --frozen-lockfile
```

## Running It

- `pnpm dev`: builds whatever the servers need, then starts both Storybooks —
  React on 6006 and Angular on 6007. `pnpm dev:react` and `pnpm dev:angular`
  start one.
- `pnpm build`: every generated artefact, in dependency order. Turbo caches it,
  so a second run with nothing changed finishes in well under a second. When in
  doubt, run it.

### What is generated, and when a change needs a build

Component work needs no build at all: both Storybooks read `packages/styles`,
`packages/react/src`, `packages/angular/*/src` and `packages/core/src` straight
from source, and a saved file is on the page before the editor loses focus.

There is no watch mode and there should not be one. A watcher would still leave
a process to run, a lag between saving and the artefact appearing, and a window
in which a reader sees neither the old value nor the new one. Resolving to
source removes the artefact from the loop instead of racing it —
`scripts/source-aliases.mjs` does that for `@slotted/core`, and the Angular
Storybook already did it for `@slotted/angular/*`. Only what cannot be resolved
to source is left to a build, and that is the table below.

Each input below reaches what reads it through the step beside it, and a change
to it is invisible until that step runs:

| Changed                                                | Build                                        | Because                                                                                                                                                      |
| ------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/theme/src/contract.json`                     | `pnpm build:tokens`                          | the token stylesheet and the layer order are emitted from the contract                                                                                       |
| `packages/themes/src/default/theme.mjs`, `values.json` | `pnpm build:tokens`                          | the glyphs are drawn into `values.json` from `glyphs.json`, and `slotted-build-theme` emits the theme stylesheet from `theme.mjs`, which reads `values.json` |
| `packages/theme/src/generated/*`                       | `pnpm --filter @slotted/theme generate`      | the contract and the public hooks are generated from a family's `tokens.json`                                                                                |
| `packages/theme/src/recipes/standard.ts`               | `node scripts/calibrate-standard-recipe.mjs` | generated from `reference.json`; run after `pnpm --filter @slotted/theme build`                                                                              |
| `packages/core/src/**`                                 | none for Storybook or tests                  | aliased to source by `scripts/source-aliases.mjs`; build only before publishing                                                                              |
| `packages/react/src/**`, `packages/angular/*/src/**`   | none for Storybook                           | `pnpm build` before publishing or before reading `dist`; the servers use source                                                                              |

`pnpm build` covers all of them and is the answer whenever the table is more
trouble than the wait.

### A stale `dist` must never reach a dev server

`apps/storybook-react/.storybook/preview.tsx` used to import
`@slotted/react/styles.css`, which resolves to `packages/react/dist` — a bundle
of every family's CSS from the last build. The stories render from source and
each component imports its own sheet, so the bundle was a second, older copy of
every rule, loaded later and winning the cascade. A stylesheet fixed in source
stayed broken on the page until somebody rebuilt a package the dev server does
not need. That import is gone; the Angular preview never had one. Do not add a
`dist` stylesheet to a preview: the layer order comes from
`@slotted/theme/styles.css`, which is imported first.

## Repository layout

```
apps/       storybook-react, storybook-angular
demos/      nexora/{angular,backend,domain.md}; .registry/ (beta tarballs, ignored)
packages/   core, react, angular, styles, theme, themes — the published set
tools/      harness, storybook-workbench — workspace packages, never published
specs/      one contract.json and its test per family
scripts/    repository scripts, flat, named by verb
docs/       the law at the root; decisions/, product/, process/, history/, archive/
```

`docs/decisions/0002-repository-layout.md` records the rule; `docs/README.md`
indexes every document.

## The beta channel

`demos/` holds applications that consume the library as a published
package: a separate pnpm installation each, no workspace link, every
`@slotted/*` installed from a tarball in `demos/.registry/`. The
directory is not committed; it is written by:

- `pnpm pack:beta`: builds every package and packs the ones that declare a
  published surface (`files` or `publishConfig.directory`) at their current
  version.
- `pnpm release:beta`: moves every published package to the next
  `0.x.y-beta.N`, then does the above.

- `pnpm demo:refresh`: the loop after one library change — builds
  `@slotted/angular`, `@slotted/core` and `@slotted/themes`, repacks only
  those three at the current version and reinstalls, so
  `demos/nexora/angular` sees the change on its next `pnpm start` (a
  running dev server is restarted).
- `pnpm demo:nexora`: `demo:refresh` followed by `ng serve` of
  `demos/nexora/angular`, from the repository root.

A demo names the version it consumes in its own `package.json` and moves to a
newer one deliberately, the way a consumer would. `pnpm test:release` checks
that the published set and the shared version stay what this section says.

## Validation Commands

- `pnpm check`: normal fast repository gate.
- `pnpm check:affected`: changed task-bearing packages and their dependents.
- `pnpm check:full`: all task-bearing packages and root checks.
- `pnpm format`: explicitly rewrite supported files with Prettier.

Choose the smallest command that covers the changed surface. Pull requests that alter toolchain or cross-package contracts should use `pnpm check:full`.

## Product Direction

Read [`docs/product/prd.md`](docs/product/prd.md) for product context. Its phases and open questions are not an automatic implementation checklist.
