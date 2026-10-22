# Slotted Repository Instructions

## Scope

`docs/product/prd.md` is product context, not an automatic backlog. Implement only the requested task and preserve unrelated user work.

React and Angular must remain idiomatic to their frameworks. Share specifications and contracts when useful; do not force shared implementation without demonstrated need.

The packages are published on npm as `0.x` betas under the `latest` tag, and every package README states that the public API changes between beta releases without deprecation. Inside this repository the only consumer is `demos/*`, built to exercise the library and surface defects.

Backward compatibility is therefore not a constraint, and must not be treated as one. No deprecation aliases, no compatibility shims, no migration layers, no staged renames, no reasoning about "breaking existing users". When a public API is wrong, change it to the correct shape in one pass and update the demo. Compatibility cost never enters a design decision, and never narrows the design space considered.

## Layout

One top-level directory holds one type of content (`docs/decisions/0002-repository-layout.md`). `docs/README.md` indexes every document by reading class: law at the root, `process/` edited each session, `history/` append-only, `archive/` closed. Session design documents go to `docs/history/designs/`, plans to `docs/history/plans/`, checkpoints to `.claude/progress/`.

Agent material published to consumers — guidelines and product skills — has its source in `tools/agent-docs/content/`; `.claude/skills/` holds the repository's own development skills. A release that changes `tools/agent-docs/content/` runs `pnpm eval:agent-docs` first and commits the report in `docs/history/evals/`. What to edit for each change, what is generated, and the release sequence are in `tools/agent-docs/README.md`.

## Working Loop

1. Read only the context required for the task.
2. Define or infer a bounded, observable outcome.
3. Change the smallest coherent set of files.
4. Select verification from the changed surface and risk.
5. Resolve related failures and report concrete evidence.

Do not impose a hard time limit on implementation. When work becomes long or changes phase, report the result obtained, available evidence, current obstacle, and next materially different attempt. Reassess or split work when attempts repeat without new evidence.

## Verification

- Isolated documentation or configuration: run its specific checker.
- One task-bearing package: run that package's filtered checks.
- Shared contract or dependency edge: run affected packages and dependents.
- Toolchain, release, or cross-cutting change: run `pnpm check:full`.
- Security-sensitive or otherwise high-risk behavior: add independent review.

Use `pnpm check` for the normal fast gate, `pnpm check:affected` for changed packages and dependents, and `pnpm check:full` only when the change surface warrants it. `pnpm check` runs its gates in parallel and format-checks and lints only the files changed since `origin/main` (`scripts/check-changed.mjs`); `pnpm check:full` checks every file. Prettier, ESLint and the typecheck keep caches in `node_modules/.cache`.

Except for `pnpm format`, verification commands must not modify files.

## Browser Automation

Do not use Playwright for exploratory browsing, generic UI inspection, broad screenshot collection, or open-ended visual review. Browser automation is allowed only for a named deterministic scenario with explicit assertions and clear failure semantics.

## Demo Feedback Loop

`demos/*` consume the library as published packages (`docs`: `CONTRIBUTING.md` › "The beta channel"). A problem seen in a demo is triaged with the `demo-triage` skill before any change: package defect → fixed in the family with a test, then `pnpm demo:refresh`; demo mistake → fixed in the demo. Both are recorded in `demos/<app>/LIBRARY-FEEDBACK.md`, the ledger the public-API review reads. A package defect is never worked around inside a demo.

## Loading States

Anything a person waits in front of — a skeleton, a spinner, a progress bar, an overlay, a control's own `loading`, and the empty and error states beside them — is built with the `loading-states` skill. It decides which indicator answers which wait, and it holds one rule above the rest: a skeleton is the anatomy of the content it stands in for, and the loaded screen and the loading screen occupy the same boxes.

## Restraint

Do not add dependencies, abstractions, packages, planning artifacts, or reviewers by default. Introduce them only when current scope or risk justifies them.

Subagents are dispatched only after the user approves the batch (count, model, deliverable, estimated cost), and each runs bounded: one narrow deliverable, a tool-call budget, no browser or screenshot loops, verification of the changed surface only, a short report. No scope, risk, skill, or plan replaces the approval.

Do not run every available check merely for reassurance. Completion means the requested result is present, relevant checks pass, and remaining limitations are explicit.
