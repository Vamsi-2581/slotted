# Autonomous Implementation Review — Session Prompt

You are working alone, overnight, on `slotted`: a multi-framework UI component library for React and Angular. Nobody is available. You will not be interrupted and you must not wait for anyone. Every decision is yours. Record it and keep going.

Your goal: close items in `docs/process/implementation-review.md` by morning. Each closed item is committed, verified, and marked `[x]` in that file.

## 0. No human in the loop

This session runs headless (`claude -p`). Nothing you ask will be answered.

- Never call `AskUserQuestion`. Never end a turn with a question. When a choice is open, take the option `docs/process/implementation-review.md` states, else the first alternative listed, and write the choice in the log.
- Never invoke `superpowers:brainstorming`, `/component`, or any skill that stops at a "gate" or waits for a reviewer. The two gates in `.claude/skills/component/SKILL.md` do not exist here.
- Never `git push`, never change branches, never rewrite history (`rebase`, `reset --hard` beyond the working tree, `commit --amend` of an earlier commit). Never touch files outside this repository.
- Never install global tools, never change `~/.claude`, never modify `.claude/settings*.json`.

## 1. Orient (once per session, cheaply)

Read, in this order:

1. `docs/process/implementation-review.md` — the work queue. Sections "Marcadores", "Layout do repositório relevante", "Regras transversais" (R1–R7) and "Ordem de execução recomendada" are binding.
2. `docs/build-briefing.md` — environment, Storybook ports, the two build rules.
3. `.claude/skills/component/references/harness.md` — how to build a harness page and capture it (`tools/harness/build.mjs`, `tools/harness/shoot.mjs`, `tools/harness/audit.mjs`).
4. `docs/process/implementation-review-log.md` — what previous iterations did. Create the file if it does not exist.

Do not read `docs/process/build-order.md`, `docs/component-features.md` or the designs in `docs/history/designs/` unless an item points at them.

## 2. Pick work

`docs/process/implementation-review.md` is read in full, once, at the start of the session. It is the whole context of the work: the cross-cutting rules explain why individual items exist, and an item fixed without them is fixed wrong.

Take the first `[ ]` item following "Ordem de execução recomendada" at the end of the file. An item is a line starting with `- [ ] **ID`. When an item says "Ver Rn", the rule Rn is the specification. When an item says `#Componente:N`, resolve the referenced item first; both close together. If the item is a rule (R1–R7) applied across components, all listed occurrences are one item.

If an item is marked `(S)`, it goes first regardless of position. An item marked `[!]` is skipped.

This session closes up to {{ITEMS_PER_SESSION}} items, one after another, each with its own reproduction, gates, log entry and commit (section 3). Stop earlier when:

- one item ends BLOCKED (section 4) — finish its log entry and end the session;
- the next item in order has the same family as an item already blocked in this session;
- no `[ ]` item remains.

Before starting each item, append one line to `docs/process/implementation-review-log.md`:

```
START <ID> <ISO timestamp>
```

This line is how the loop outside this session knows which item was attempted if the session dies. Write it before any other change.

Scope discipline: change only what the item requires. No drive-by refactors, no renames, no comment rewrites outside the touched rules. A second defect noticed on the way is added to `docs/process/implementation-review.md` as a new `[ ]` item at the end of its family's section, not fixed now.

## 3. Execute

For each item:

1. **Reproduce.** Before changing anything, prove the symptom: a failing test in the relevant `*.test.ts`/`*.spec.ts`/`*.styles.test.mjs`, or a harness capture under `tools/harness/out/` that shows it. An item without a reproduction cannot be closed.
2. **Fix at the origin.** `(MAOC)` items and rule items are fixed in `packages/core`, `packages/styles`, `packages/tokens` or `packages/themes`, never by a local override. A prop change starts in `specs/components/<family>/contract.json` and its `contract.test.mjs`, then styles, then React, then Angular, then stories and docs.
3. **Verify the acceptance criterion** stated in the item. It is the definition of done. If the criterion names a measurement (px, ratio, fps, count), measure it and write the number in the log.
4. **Run the gates:**
   ```
   pnpm check
   turbo run verify --filter <every package touched>
   ```
   Both must exit 0. Never weaken, skip or delete a test to pass a gate. If a test encodes the old behaviour the item removes (for example `button-group.test.tsx:80` for B5), rewrite the test to encode the new behaviour.
5. **Capture.** Rebuild the harness page of every family touched and capture `light`, `dark`, `high-contrast` at `default` and `compact` densities. Run `tools/harness/audit.mjs` on the page. A finding is a defect of this item.
6. **Record.** Append to `docs/process/implementation-review-log.md`:
   ```
   ## <ID> — <title>  (<ISO timestamp>)
   Files: <paths>
   Reproduction: <test name or capture path>
   Measurement: <value against the acceptance criterion>
   Decision: <any choice the item left open, and why>
   Captures: <paths>
   ```
7. **Mark done.** Change `- [ ] **<ID>` to `- [x] **<ID>` in `docs/process/implementation-review.md`.
8. **Commit.** One commit per item:
   ```
   git add -A
   git commit -m "<type>(<family>): <ID> <short title>"
   ```
   `type` is `fix` for defects, `refactor` for rule applications, `feat` for new props, `chore` for tooling.

## 4. Budget and stop rules

- An item gets at most three fix attempts within a session. On the third failed gate, revert the working tree to the last commit (`git checkout -- . && git clean -fd`), append a `## <ID> — BLOCKED` entry to the log with the failing output and what was tried, change the item to `- [!] **<ID>` in the review file, commit that change as `chore(review): block <ID>`, and end the session.
- An item whose log already shows a `START <ID>` line from an earlier session and no `## <ID>` entry was interrupted once. Read the earlier session's log in `tools/harness/out/review-loop/` before starting it again, and reuse what it found.
- Never leave the working tree dirty at the end of a session. Either the item is committed or the tree is reverted.
- If both Storybook ports (6006 React, 6007 Angular) answer nothing, the harness captures still work; write "Storybook unavailable" in the log and continue.
- If `pnpm check` fails before you touch anything, that is the first item: fix it, commit as `chore: restore green baseline`, and continue.

## 5. Decisions already taken

Do not reopen these. They are stated in `docs/process/implementation-review.md`:

- Rails for state are removed (R1). No exception for `high-contrast`.
- Composite components do not render `Button`/`IconButton` internally (R2).
- Glyphs are generated from Lucide (R4). Write the generator script as part of R4.
- `ButtonGroup.separation` is removed (B5).
- `CurrencyField` types from the right, cursor position ignored (CF1).
- `InlineMessage` (IM1): if `Alert` with `size="sm"` and no title covers every `InlineMessage` story, remove `InlineMessage`. Otherwise keep it and rebuild it by composing `Alert` CSS. Decide by attempting the replacement in the stories first.
- Highlight of filter matches is a shared stylesheet (R6/CB6), consumed by `Combobox`, `Select`, `Listbox`, `Menu`.

Where an item says "Esperado" with two alternatives and "Escolher a primeira", the first is chosen.

## 6. Non-negotiable invariants

Enforced by tests. Fix the code, not the test.

1. Layer dependency rule (`scripts/verify-package-layers.mjs`). `@slotted/core` imports nothing from this repository and no framework. React and Angular never depend on each other.
2. Contract first. Every prop, part and state exists in `specs/components/<family>/contract.json` before it exists in code.
3. One authored stylesheet per family in `packages/styles/src/<family>/`. React and Angular share it. No framework-side CSS.
4. Tokens only. No literal colours, sizes or durations in a family stylesheet outside a `var(..., fallback)` fallback.
5. Both frameworks land together. An item is not closed with React done and Angular pending.

## 7. End of session

Print exactly one line to stdout and stop:

```
SESSION done=<ID,ID,...> blocked=<ID or -> remaining=<count of [ ] items left>
```

`remaining=0` ends the loop. A session that closed nothing and blocked nothing prints `SESSION done=- blocked=- remaining=<n>` and states the reason in the log under `## STALL`.
