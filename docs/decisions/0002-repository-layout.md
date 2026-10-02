# 0002 — Repository layout by content type

Status: accepted, 2026-09-18.

## Context

The tree grew one directory at a time. `apps/` held both Storybook workbenches
and, under `apps/demos/`, a consumer application and the simulated backend it
reads. `packages/` held a tooling package nobody publishes beside the six that
ship, and a theme one level deeper than every other package. `docs/` listed
four reading classes in its index while the files of three of them sat flat at
the root, and two product documents sat at the repository root beside the
README. Session design documents lived under a directory named after the tool
that wrote them.

## Decision

A top-level directory holds one type of content, and a path names what it is.

| Directory   | Holds                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `packages/` | Published packages only. A theme is `packages/theme-<name>`; its manifest name matches.         |
| `tools/`    | Workspace packages that are never published: the visual harness, the Storybook workbench.       |
| `apps/`     | The two Storybook workbenches and the documentation site (`apps/docs`).                         |
| `demos/`    | Consumer applications, one directory per product: `demos/<product>/{<binding>,backend,domain}`. |
| `specs/`    | The public contract of each family and the test that verifies it.                               |
| `scripts/`  | Repository scripts, flat, named by verb (`verify-`, `pack-`, `generate-`).                      |
| `docs/`     | The law at the root; `decisions/`, `product/`, `process/`, `history/`, `archive/` below it.     |

Within `docs/`, a file at the root binds every family. `process/` is edited
every session, `history/` only receives new entries, `archive/` is closed.
Session design documents are history: `docs/history/designs/`, indexed by
`README.md` there, and `docs/history/plans/`. Both stay out of `format:check`
because a session writes them mid-work.

The beta channel tarballs live in `demos/.registry/`, beside the applications
that install them, and are ignored by git.

The repository root keeps `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `LICENSE`
and tool configuration. Product documents are `docs/product/`.

## Consequences

- `pnpm-workspace.yaml` lists `apps/*`, `demos/*/*`, `packages/*`, `tools/*`.
- `scripts/verify-package-layers.mjs` reads every workspace root, so a tooling
  package placed under `tools/` is still held to the layer rule.
- A demo installs `@slotted/*` from `../../.registry/`; `pnpm demo:refresh`
  rewrites the tarballs in place.
- `angular.json` stays at the root: the Angular CLI locates the workspace file
  by walking up from the directory an `ng` command runs in, and
  `packages/angular` is the only project it declares.
- A new theme is `packages/theme-<name>` with `@slotted/theme-<name>` as its
  manifest name; the Storybook workbench discovers it by that prefix.
- `packages/angular/<family>/` stays beside `src/` and `package.json`:
  ng-packagr names a secondary entry point by its path under the package root,
  so `packages/angular/button/` is what makes `@slotted/angular/button`
  importable. Moving the families under `src/` would put `src` in every import.
- Agent skills have one source, `.claude/skills/<skill>/`. `.codex/skills/`
  links to it and adds only `agents/openai.yaml`; a skill edited in one place
  is read the same by both agents.
- `.claude/progress/` holds a checkpoint only for a family with uncommitted
  work or an open gate. A delivered family's checkpoint is deleted; its history
  is the commit log and `docs/history/`.
