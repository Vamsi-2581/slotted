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

Two artefacts are generated from something else, and a change to their input is
invisible until they are:

| Changed                                              | Build                       | Because                                                                         |
| ---------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| `packages/tokens/src/contract.json`                  | `pnpm build:tokens`         | the token stylesheet and the layer order are emitted from the contract          |
| `packages/themes/default/src/theme.json`             | `pnpm build:tokens`         | the theme stylesheet is emitted from the theme                                  |
| `packages/core/src/**`                               | none for Storybook or tests | aliased to source by `scripts/source-aliases.mjs`; build only before publishing |
| `packages/react/src/**`, `packages/angular/*/src/**` | none for Storybook          | `pnpm build` before publishing or before reading `dist`; the servers use source |

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
`@slotted/tokens/styles.css`, which is imported first.

## The beta channel

`apps/demos/` holds applications that consume the library as a published
package: a separate pnpm installation each, no workspace link, every
`@slotted/*` installed from a tarball in `apps/demos/.registry/`. The
directory is not committed; it is written by:

- `pnpm pack:beta`: builds every package and packs the ones that declare a
  published surface (`files` or `publishConfig.directory`) at their current
  version.
- `pnpm release:beta`: moves every published package to the next
  `0.x.y-beta.N`, then does the above.

- `pnpm demo:refresh`: the loop after one library change — builds
  `@slotted/angular`, `@slotted/core` and `@slotted/theme-default`, repacks only
  those three at the current version and reinstalls, so
  `apps/demos/nexora-angular` sees the change on its next `pnpm start` (a
  running dev server is restarted).

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

Read [`PROJECT-PRD.md`](PROJECT-PRD.md) for product context. Its phases and open questions are not an automatic implementation checklist.
