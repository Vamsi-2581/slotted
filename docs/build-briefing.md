# Rebuild briefing

Read this before every `/component` invocation. It holds what does not change
between families; `docs/rebuild-order.md` holds the queue and the scope of each
one.

## What is being done

The library is being rebuilt family by family, from the primitives outward. The
foundation of tokens, state and identity is law. The families listed in
`specs/legacy-families.json` were built before it, stay on schema 4, and **must
not be touched** until their own turn in `docs/rebuild-order.md`.

## Scope of the invocation

`docs/rebuild-order.md` states the wave, the mode — build, rebuild or
consolidate — and the scope of each family. Read the entry for the invoked
family there first.

If that family has no scope written yet, derive it from its section in
`docs/component-features.md`, write it into `docs/rebuild-order.md` as part of
the work, and proceed. An invocation is never blocked for want of a scope
paragraph.

## Read first

- `docs/token-foundation.md` — layers, scales, schemes, densities, target size
- `docs/state-and-events.md` — controlled and uncontrolled, `reason`, `data-ui`,
  state precedence
- `docs/component-features.md` — the feature guide. Read the section covering
  this family, plus section 2 (global contract) and section 18 (definition of
  done)
- `.claude/skills/component/references/rubric.md`
- `.claude/skills/component/references/stories.md` — what the two reference
  pages have to prove, and the primitives every demonstration is laid out with

## Environment

Work in this worktree, `/home/dreco/dev/slotted`, on the branch already checked
out. **Do not create a branch, do not create a worktree, do not check anything
out.** Storybook runs here and a human watches it live.

The `node` on `PATH` is older than the one `.node-version` requires, and shell
state does not survive between tool calls, so **prefix every `node` and `pnpm`
command** with the resolution below rather than exporting it once:

```bash
export PATH="$(ls -d ~/.nvm/versions/node/v$(cat .node-version)*/bin | tail -1):$PATH"
node -v   # must match .node-version
```

If that path does not exist, `nvm install` against `.node-version` is the fix;
never run the repository's scripts on the older runtime.

## Storybook

Usually already running, started by the reviewer. Do not stop or restart it
without saying why.

- React: <http://localhost:6006>
- Angular: <http://localhost:6007>

If a port answers nothing, say so at the gate rather than assuming the pages
were seen. Starting it is the reviewer's call; the commands are
`pnpm dev:react` and `pnpm dev:angular`, or
`pnpm dev` for both. Each builds the two generated stylesheets first and
nothing else.

The toolbar exposes `scheme` (`light`, `dark`, `high-contrast`), `density`
(`comfortable`, `compact`, `dense`) and `direction` (`ltr`, `rtl`). The reviewer
uses those controls, so the reference pages have to hold up under all of them.

A family's reference page is a docs entry, and it renders on its own at
`iframe.html?viewMode=docs&id=components-<family>--reference`. That URL is what
a screenshot can be taken of, and reading the rendered page — not the story
file — is what `.claude/skills/component/references/stories.md` requires before
the gate.

- A new React story file is picked up by the glob without a restart, but a new
  **family** is not: its `*.docs.ts` imports `@slotted/styles/<family>/tokens.json`,
  and a subpath export added to `packages/styles/package.json` is invisible to a
  Vite dev server that was already running. The story is indexed, the module
  answers 404, and the page never mounts. **Both Storybooks need a restart when
  a family lands.** Say so at the gate rather than restarting unannounced.
- **A new Angular entry point needs the Angular Storybook restarted**, because
  `apps/storybook-angular/.storybook/main.ts` reads the directories of
  `packages/angular/` once, at startup. Say so at the gate rather than
  restarting unannounced.
- A token or theme change needs `pnpm build:tokens` before Storybook and the
  harness see the new value.
- A change under `packages/core/src` needs no build: both Storybooks and the
  React test run resolve `@slotted/core/*` to source through
  `scripts/source-aliases.mjs`. `pnpm build:core` is for publishing, and for
  reading `dist` itself.
- `pnpm build` covers every generated artefact in dependency order and is
  cached: a second run with nothing changed is under a second. Run it rather
  than deciding which applies.
- Nothing else needs a build. Both Storybooks read `packages/styles`,
  `packages/react/src`, `packages/angular/*/src` and `packages/core/src` from
  source. A stylesheet
  edit is on the page on save — and if it is not, a `dist` bundle has been
  imported into a preview again, which `CONTRIBUTING.md` explains and forbids.

## Leave no uncertainty open

A family is not finished while a question about it is still open. For every
question that arises — line measure, a truncation limit, the reach of a `:lang()`
guard, an accessibility criterion, a naming choice — decide it. Choose what is
correct for a durable UI package rather than what is quickest, write the decision
and its cost in `docs/BUILD-LOG.md`, and implement it.

The gate is for handing over decisions already made, not a list of questions for
the reviewer to answer. Exactly two things may be raised there:

1. a decision that changes a **public contract outside this family** — a token
   scale, the shared vocabulary, another family's API;
2. something that cannot be verified on this machine — a real screen, a screen
   reader, a physical touch device. State what was verified in its place and
   what remains to be seen.

Anything else, decide. If two options are defensible, take the one that fails
more loudly, then record why.

A defect in shared tooling — the harness, the schema, the token contract, the
workbench — is fixed as part of the work, in its own commit, before the family
that found it. It is not reported and left in place: the next family inherits it.

## Non-negotiable constraints

1. **Layered tokens.** Consume the existing scales. A component token references
   a semantic or a primitive; a literal needs a reason recorded in the contract.
   A new step in a scale means changing
   `packages/tokens/src/contract.json`, `packages/themes/default/src/theme.json`
   and `docs/token-foundation.md` in lockstep — a decision to justify, not a
   shortcut.
2. **Identity.** The root carries `data-ui="<family>"`; parts carry `data-part`.
   A class selector is refused by `packages/styles/src/identity.test.mjs`.
3. **Contract first.** `specs/components/<family>/contract.json` declares `ui`,
   its members, parts, capabilities and states from the vocabulary in
   `specs/contract.schema.mjs`, plus a `stateModel` for every mutable capability.
   Write the test, watch it fail for the intended reason, then implement.
4. **Motion.** No literal duration. Absent a reason to animate, do not animate.
5. **State precedence.** A `:hover` or `:active` rule with no guard against the
   stronger states is refused by `packages/styles/src/states.test.mjs`.
6. **Density, direction, contrast.** The family answers all three densities,
   `dir="rtl"` and the `high-contrast` scheme. Logical properties are mandatory.
7. **Both frameworks.** The conceptual contract is shared; React stays idiomatic
   React and Angular idiomatic Angular. Native props, events and consumer values
   are preserved.

## Decisions already taken

Inherit these rather than reopening them:

- **Measure belongs to the container, not to Text.** No text family caps its own
  line length, and neither does a layout primitive. `container` owns comfortable
  measure when it is built, and it owns it alone: two families offering a
  maximum measure would be two answers to one question. Decided while Typography
  was built, narrowed to one family while Stack, Inline and Grid were.
- **Truncation never removes content from the DOM.** A truncated string stays
  readable to assistive technology and reachable in full when the content
  matters.
- **A scheme is selected by the application; the operating system's own
  high-contrast mode is served by the theme's `forced-colors` block.** A family
  writes no `forced-colors` rule of its own unless it paints something the theme
  cannot reach.

## Visual loop

```bash
node tools/harness/build.mjs <family>
node tools/harness/shoot.mjs <family> --scheme light --width 420
node tools/harness/shoot.mjs <family> --scheme dark --width 420
node tools/harness/shoot.mjs <family> --scheme high-contrast --width 420
node tools/harness/shoot.mjs <family> --scheme light --width 240
node tools/harness/shoot.mjs <family> --scheme light --density dense
node tools/harness/shoot.mjs <family> --scheme light --dir rtl
```

The capture is the whole page; `--scene <name>` narrows it to one scene when a
detail needs to fill the view. Read every image. The exit condition is the right
picture, not finished code.

## Verification

```bash
node --test specs/components/<family>/*.test.mjs
pnpm check
pnpm check:full
```

## The gate

Stop before committing and hand over:

- the absolute path of the harness page and of the captures read;
- the URLs of the reference pages in both Storybooks, and the widths and
  schemes they were read at;
- the weighing from step 3 — adopt, adapt or decline, one sentence each;
- the self-assessment across the eight rubric dimensions plus section 18 of the
  guide;
- the decisions taken on what would otherwise have been an open question, and
  the two categories above if either applies.

Then wait.
