# Session Prompt — Build the Component Craft Tooling and Skill

You are implementing **Tasks 1 through 4** of one written plan. Task 5 is not
yours; it is explained at the end so you know what you are building towards.
Report when Task 4 is committed.

Repository: `/home/dreco/dev/slotted`
Plan: `docs/history/plans/2026-08-31-component-craft-skill.md`
Spec: `docs/history/designs/2026-08-31-component-foundation-and-craft-skill-design.md`

## 1. Orient, once

```bash
cd /home/dreco/dev/slotted
git status --short --branch
git log --oneline -5
cat docs/history/plans/2026-08-31-component-craft-skill.md
cat docs/history/designs/2026-08-31-component-foundation-and-craft-skill-design.md
cat docs/token-foundation.md
```

Read all three before writing anything. The plan is what you execute; the spec
is why; `docs/token-foundation.md` is the law the tooling enforces and the skill
cites.

Toolchain, installed: Node 24, pnpm 11.24.0, Google Chrome at
`/usr/bin/google-chrome`. Nothing in this plan adds a dependency, so do not run
`pnpm install` unless a command fails for a missing one.

## 2. What you are building, and why it exists

`slotted` is a multi-framework component library. Thirty families were shipped
through a rigorous process — contract first, tests first, both frameworks, a
green gate on every commit — and the components came out visually poor. The
process was not skipped; it never rendered anything, and a checklist does not
detect ugly.

You are building the two evidence tools and the skill that fix that: a harness
that turns a family's stylesheet into a browser page, a shooter that captures
it, and the skill that sequences behavioural tests, source reading and those
visual artefacts around a step where the component is actually looked at.

## 3. Scope

**Do Tasks 1, 2, 3 and 4. Stop after Task 4's commit.**

Do **not** do Task 5. It refines the Breadcrumb by invoking the skill, and the
skill is a Claude Code skill in `.claude/skills/` — it runs in that harness, not
this one. Writing its files is Task 4 and is yours; running it is not.

Task 5 also ends at a human approval gate. Nothing about the Breadcrumb gets
committed by an agent working alone.

## 4. Rules

**The plan is the instruction; the steps are in order.** Task 1 is a TDD cycle
written out: write the failing test, run it and confirm it fails for the stated
reason, implement, run it and confirm it passes, commit. Do not skip the "watch
it fail" step — it is what proves the test tests something. Task 3 is an
automation boundary and deliberately creates no artifact or commit.

**Never weaken a test to make code pass.**

**One commit per artifact-bearing task**, using the message the plan gives
verbatim, trailer included.

**`git add` names files, never directories.** Directory-wide staging has twice
swept unintended files into commits here.

**Never pipe a verification command into `tail`, `head` or `grep` and trust the
result** — the pipe discards the exit status. Redirect and check `$?`.

**Run Prettier before committing.** `pnpm format:check` is part of the gate:

```bash
npx prettier --write <the files you changed>
```

## 5. Do not touch

Ten files under `apps/storybook-angular/.storybook/` and
`apps/storybook-react/.storybook/` are modified and uncommitted. They are
someone else's work in progress on an unrelated feature.

Leave them exactly as they are: do not stage, commit, revert or stash them. If
`git status --short` shows those ten and nothing else at the start, that is the
expected state.

Do not touch any component stylesheet. Task 1 adds
`packages/styles/src/breadcrumb/breadcrumb.harness.html`, which is a new file
beside `breadcrumb.css`; `breadcrumb.css` itself is Task 5's, not yours.

## 6. Verification

| When               | Command                        | Expected           |
| ------------------ | ------------------------------ | ------------------ |
| Inside a task      | the exact command in that step | as the step states |
| Before each commit | `pnpm check`                   | exit 0             |
| After Task 4       | `pnpm check:full`              | exit 0             |

```bash
pnpm check > /tmp/check.log 2>&1; echo "EXIT=$?"
```

Two checks in this plan are visual, and you may not be able to see an image.
Verify them mechanically and hand the paths over:

- **Task 1, step 6** — the built page. Confirm the file exists and that it
  contains one `id="…-light-240"` cell per scene. Report the absolute path.
- **Task 2, step 2** — the two PNGs. Confirm each exists, is larger than 2 KB,
  and is reported by `file` as a PNG of roughly the requested width times two
  (the shooter renders at `--force-device-scale-factor=2`). A file under 2 KB is
  almost certainly a blank page, which means the query filter in the page script
  and the `id` pattern in the builder disagree — fix that before continuing.
  Report both paths.

## 7. When something is wrong

**A test fails for a reason you do not understand.** Stop guessing. Read the
first error only, form one hypothesis, test that hypothesis specifically. Do not
change three things at once.

**The plan is wrong.** It can be — it was written against the repository but not
executed against it. Correct the plan file in the same commit as the code that
revealed the problem and say so in the commit body. Do not silently deviate and
do not stop.

**Task 4 is documentation, not code.** The plan specifies its content rather
than dictating every line. Write the files so they are usable by an agent with
no context: exact commands, exact file paths, no advice that cannot be acted on.
The frontmatter in step 1 is given verbatim and must match exactly, because it
is what keeps the skill from being invoked by inference.

**You are genuinely blocked** — something the plan requires is impossible rather
than merely different. Stop, record what you tried, report it. Do not improvise
a substitute.

## 8. Report when done

```markdown
## Result

<done through Task 4 | blocked at Task N>

## Tasks

| #   | Task | Commit | Notes |
| --- | ---- | ------ | ----- |
| 1   | ...  | <sha>  | ...   |

## Artefacts to open

- harness page: <absolute path>
- captures: <absolute path>, <absolute path>

## Gate

pnpm check:full → exit <n>

## Deviations from the plan

<each one: what the plan said, what was true, what you did. "none" if none.>

## Left for the reader

<anything out of scope worth knowing. "nothing" if nothing.>
```

Do not push. Leave every commit on local `main`. The next step after your report
is a Claude Code session running `/component breadcrumb`, which is Task 5.
