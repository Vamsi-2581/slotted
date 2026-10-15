# `markdown` — self-assessment

Against the eleven dimensions of `.claude/skills/component/references/rubric.md`
and section 18 of `docs/component-features.md`. Decisions are in
`docs/history/designs/2026-09-24-markdown-design.md`.

## Evidence

- Harness: `tools/harness/out/markdown.html`, eight scenes. Captures read:
  light, dark and high-contrast at 420; light at 240; dense; RTL; focus on the
  back link (light, dark), the editable task (light, dark) and the heading
  anchor (light).
- Contract: `specs/components/markdown/contract.test.mjs`, 10 tests.
- Core: `packages/core/src/markdown/markdown.test.ts`, 27 tests — URL policy
  with eight hostile spellings, slugs, fence metadata, references, alerts,
  tasks, tables, footnotes, `completeMarkdown`, `fromMarkedTokens`.
- React: `markdown.test.tsx` 18, `markdown.stories.test.ts` 4.
- Angular: `markdown.spec.ts` 14, `markdown.stories.spec.ts` 4.
- Workbench: `highlight.test.ts` gains the Markdown case.

## The eleven dimensions

Each names the change that would most improve it, and whether it was made.

1. **Icons.** One glyph of the family's own, the footnote back link:
   `arrow-left` turned a quarter, masked, 0.9em in a 24-pixel target. Every
   other mark belongs to a composed family. Change: the back link sat below the
   baseline because an `inline-flex` box takes its baseline from its item.
   Made — `inline-block` with the glyph positioned inside.
2. **Motion.** None of the family's own; the heading anchor's reveal is
   `prose`'s, on the motion scale. Streaming appends without remounting what is
   drawn (keys are paths), which is the motion question this family has.
   Change: none outstanding.
3. **Responsiveness.** Tables scroll in `prose`'s scroll part at 240; the error
   part wraps its button under the message; a task's box stays in the marker's
   gutter at every width. Change: the wide table in the harness has no measured
   `tabindex`, because the harness has no script; the bindings measure it.
   Recorded, not a defect.
4. **Refinement.** Change: task text started 4 pixels before an ordinary
   item's text. Made — the item is shifted by the list inset alone and its
   first column is inset plus marker gap. The alerts touched each other. Made —
   the `embed` part.
5. **Tokens.** Two family tokens (`--slotted-markdown-task-gap`,
   `--slotted-markdown-backref-size`); `prose`'s list and flow tokens are read,
   not restated. One literal: `62%` for the placeholder's last line, the value
   `skeleton`'s own harness uses. Change: none outstanding.
6. **Patterns.** No APG pattern; the absence is recorded in the contract with
   CommonMark, GFM and the footnote wiring of mdast-util-to-hast. Every
   operable element is a composed family with its own pattern.
7. **Accessibility.** No input string reaches `innerHTML`; raw HTML and
   executable schemes are refused by default. Headings are real, movable with
   `headingOffset`; anchors are named "Link to section: …"; tasks are
   `aria-readonly`, not disabled; footnote references carry
   `aria-describedby` to the hidden section heading and each back link names
   its reference; alerts are `live="off"`; `aria-busy` while loading or
   streaming. Not verified on this machine: a screen reader. Change: none
   outstanding.
8. **Native API.** React: `ComponentPropsWithRef<'div'>` on the root, `render`.
   Angular: an attribute selector on the consumer's element. Links, images,
   tables and headings are native elements.
9. **Capability.** The inventory's table stakes are all adopted or deferred
   by name; the differentiators shipped: mdast input and a marked adapter, one
   prepared document for both bindings, GitHub alerts, editable tasks by
   request, fence metadata, the outline, the heading offset, logical table
   alignment, `completeMarkdown`. Change: a second adapter for markdown-it.
   Not made: its token stream is flat and needs a stack-based fold, and no
   consumer in this repository uses it.
10. **Ecosystem integration.** React: `MarkdownDefaultsProvider`, `renderers`,
    `extensions`, `ref`. Angular: `provideMarkdownDefaults`,
    `ng-template[slMarkdownNode]`, `[slMarkdownChildren]`, `[slMarkdownEmpty]`,
    `exportAs` with `document()`, signals throughout, the loading timer torn
    down with `DestroyRef`. The asymmetry — `editableTasks` and `retryable` in
    Angular — is recorded in the design, §7.
11. **Documentation.** Two reference pages with fourteen demonstrations each
    in one domain (a platform team's runbook), the import, the anatomy, the
    inputs, the events, the composition and five accessibility decisions.
    Change: reading the pages rendered. Not made: both Storybooks need a
    restart to see the new entry, which waits on the reviewer.

## Section 18

- **Purpose.** Render a document the application did not author, from a
  tree. Anti-use: authored text is `typography`; a rich-text editor is not
  this family; raw HTML is not accepted.
- **Anatomy.** `root`, `embed`, `alert-body`, `task-list`, `task`,
  `task-body`, `backref`, `empty`, `error`, around `prose`'s region.
- **Controlled and uncontrolled.** Neither: the family holds no value. Tasks
  and retry are requests with a reason; the consumer's tree is the only state.
- **State matrix.** `ready` · `error` × `loading` × `streaming` × empty. Error
  wins over loading; loading, once painted, wins over empty; empty is drawn only
  when not loading. `streaming` only adds `aria-busy`.
- **Density and direction.** Density does not move the region (prose's
  decision); composed controls answer it themselves. RTL mirrors the task
  gutter, the table alignment and the back link's place; code stays LTR
  (`code-block`).
- **Loading, empty, error, extreme content.** Loading: three lines, the last
  shorter, after `skeleton`'s delay. Empty: `labels.empty` or the consumer's
  node. Error: `inline-message` plus retry. Extremes: an unbroken URL wraps;
  a long heading keeps its anchor on its last word; a hostile source renders
  as text.
- **SSR.** `prepareMarkdown` is pure; ids come from the tree and `idPrefix`,
  never from a generated id.
- **Tests shared in intent.** The same fourteen behaviours are asserted in
  both bindings.
- **Break and migration.** New family; no consumer to migrate.
