# Session Prompt — Execute the Token Foundation Plan

You are implementing one written plan, end to end, in an existing repository. The
plan is detailed and was written for someone with no context for this codebase.
Follow it. Report when it is done.

Repository: `/home/dreco/dev/slotted`
Plan: `docs/history/plans/2026-08-31-token-foundation.md`
Spec: `docs/history/designs/2026-08-31-component-foundation-and-craft-skill-design.md`

## 1. Orient, once

```bash
cd /home/dreco/dev/slotted
git status --short --branch
git log --oneline -5
cat docs/history/plans/2026-08-31-token-foundation.md
cat docs/history/designs/2026-08-31-component-foundation-and-craft-skill-design.md
```

Read both documents in full before writing anything. The plan is what you
execute; the spec is why, and you need it when the plan leaves a judgement to
you.

Toolchain, already installed: Node 24, pnpm 11.24.0. Do not run `pnpm install`
unless a command fails for a missing dependency — nothing in this plan adds one.

## 2. What you are building, in three sentences

`slotted` is a multi-framework component library. It has a mature colour token
system and no scale for anything else, so thirty component families each
invented their own literals for spacing, type, radius and motion, and a theme
can retune colour and nothing more. This plan adds those scales without renaming
a token, removing a token, or changing a single rendered pixel.

## 3. Rules

**The plan is the instruction; the steps are in order.** Each task is a TDD
cycle written out: write the failing test, run it and confirm it fails for the
stated reason, implement, run it and confirm it passes, commit. Do not skip the
"watch it fail" step — it is what proves the test tests something.

**Never weaken a test to make code pass.** If a test fails, the code is wrong
until you have evidence otherwise.

**One commit per task**, using the commit message the plan gives verbatim. Every
message ends with the trailer already in the plan; keep it.

**`git add` names files, never directories.** Directory-wide staging has twice
swept unintended files into commits in this repository.

**Never pipe a verification command into `tail`, `head` or `grep` and trust the
result** — the pipe discards the exit status. Redirect to a file and check `$?`.

**The contract and the theme are edited together, always.** `validateTheme`
errors on a token present in one and absent in the other, in both directions, so
a task that touches one and not the other fails.

**Run Prettier before committing.** `pnpm format:check` is part of the gate:

```bash
npx prettier --write <the files you changed>
```

## 4. Do not touch

Ten files under `apps/storybook-angular/.storybook/` and
`apps/storybook-react/.storybook/` are modified and uncommitted. They are
someone else's work in progress on an unrelated feature.

Leave them exactly as they are. Do not stage them, do not commit them, do not
revert them, do not stash them. Every `git add` in this plan names specific
files, so following the plan already avoids them.

If `git status --short` shows those ten and nothing else at the start, that is
the expected state.

## 5. Verification

| When                 | Command                        | Expected           |
| -------------------- | ------------------------------ | ------------------ |
| Inside a task        | the exact command in that step | as the step states |
| Before each commit   | `pnpm check`                   | exit 0             |
| After the final task | `pnpm check:full`              | exit 0             |

`pnpm check` runs formatting, lint, typecheck, the contract tests, the layer
rule and the docs tests. `pnpm check:full` adds every package's own build and
test suite and takes a few minutes.

Check the exit status directly:

```bash
pnpm check > /tmp/check.log 2>&1; echo "EXIT=$?"
```

The single most important check is in Task 1 and runs in every later task:
`packages/tokens/test/resolve.test.mjs` holds a frozen table of what every
pre-existing token resolved to before the scales existed. If it fails, a
redefinition changed a value, and the value is what must change back — not the
table.

## 6. When something is wrong

**A test fails for a reason you do not understand.** Stop guessing. Read the
first error only, form one hypothesis, test that hypothesis specifically. Do not
change three things at once.

**The plan is wrong.** It can be. It was written against the repository but not
executed against it. If a step names a line that is not there, or an assumption
that does not hold, correct the plan file in the same commit as the code that
revealed the problem and say so in the commit body. Do not silently deviate and
do not stop.

**You are genuinely blocked** — something the plan requires is impossible rather
than merely different from what you expected. Stop. Do not improvise a
substitute. Record what you tried and report it.

## 7. Report when done

Finish with a report in exactly this shape:

```markdown
## Result

<done | blocked at Task N>

## Tasks

| #   | Task | Commit | Notes |
| --- | ---- | ------ | ----- |
| 1   | ...  | <sha>  | ...   |

## Gate

pnpm check:full → exit <n>

## Deviations from the plan

<each one: what the plan said, what was actually true, what you did.
"none" if none.>

## Left for the reader

<anything you noticed that is out of this plan's scope and worth someone
knowing. "nothing" if nothing.>
```

Do not push. Leave every commit on local `main` and let the report be the
handover.
