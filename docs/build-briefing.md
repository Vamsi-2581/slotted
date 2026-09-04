# Build briefing

Read before every `/component` invocation. It holds what does not change between
families. It directs judgement; it does not replace it. Where it decides
something, it says why, and a better reason beats it.

Some families are new and some replace one built before this foundation
existed. `docs/build-order.md` says which, and what each one delivers. If the
invoked family has no scope written there yet, derive it from its section in
`docs/component-features.md`, write it in as part of the work, and carry on.

## Read first

- `docs/token-foundation.md` — layers, scales, schemes, densities, target size
- `docs/state-and-events.md` — controlled and uncontrolled, `reason`, `data-ui`,
  state precedence
- `docs/component-features.md` — the feature guide: the section covering this
  family, plus section 2 (global contract) and section 18 (definition of done)
- `.claude/skills/component/references/rubric.md`
- `.claude/skills/component/references/stories.md` — what the two reference
  pages have to prove

## Environment

Work in this worktree, on the branch already checked out. **Do not create a
branch or a worktree, and do not check anything out.** Storybook runs here and a
human watches it live.

Shell state does not survive between tool calls, and the `node` on `PATH` is
older than `.node-version` requires, so prefix every `node` and `pnpm` command:

```bash
export PATH="$(ls -d ~/.nvm/versions/node/v$(cat .node-version)*/bin | tail -1):$PATH"
```

## Storybook

React on <http://localhost:6006>, Angular on <http://localhost:6007>, started by
the reviewer. A reference page renders on its own at
`iframe.html?viewMode=docs&id=components-<family>--reference`, which is what a
screenshot can be taken of. If a port answers nothing, say so at the gate rather
than assuming the pages were seen.

The toolbar exposes `scheme` (`light`, `dark`, `high-contrast`), `density`
(`comfortable`, `compact`, `dense`) and `direction` (`ltr`, `rtl`). The reviewer
uses all of them.

- **Both Storybooks need a restart when a family lands** — React because the new
  subpath export in `packages/styles/package.json` is invisible to a running Vite
  server, Angular because it reads the entry-point directories once, at startup.
  Say so at the gate rather than restarting unannounced.
- `pnpm build` covers every generated artefact in dependency order and is cached;
  run it rather than deciding which build applies. A token or theme change needs
  it before Storybook and the harness see the new value.
- Nothing else needs building. Both Storybooks read `packages/styles`,
  `packages/react/src`, `packages/angular/*/src` and `packages/core/src` from
  source, so a stylesheet edit is on the page on save. If it is not, a `dist`
  bundle has been imported into a preview again, which `CONTRIBUTING.md` forbids.

## Two gates

The skill stops twice. The **visual gate**, once the stylesheet and the harness
captures are right and before either framework is bound: the anatomy and the
picture are confirmed there, while a correction still costs the stylesheet
rather than the family. The **release gate**, at the end, for everything built
on top of it.

Nothing else is a gate. Between them, record the decision and carry on.

## Leave no uncertainty open

A family is not finished while a question about it is still open. Decide it,
choosing what is right for a durable package rather than what is quickest, and
record the decision and its cost where it belongs — see the routing below. If
two answers are defensible, take the one that fails more loudly.

The gate carries decisions already made. Two things may be raised there instead:
a decision that changes a public contract **outside** this family, and something
this machine cannot verify — a real screen, a screen reader, a touch device —
stated alongside what was checked in its place.

A defect in shared tooling is fixed as part of the work, in its own commit,
before the family that found it. Reported and left in place, the next family
inherits it.

`docs/BUILD-LOG.md` is not a diary, and writing one entry per family is how it
grew past four thousand lines. A decision that binds another family belongs in
_Decisions already taken_ below; a pending item belongs in that family's scope
in `docs/build-order.md`; a convention belongs in the comment of the test that
enforces it. What is left for the log is a defect with a lesson, or a debt
nobody else owns — and nothing at all is a valid entry.

## Constraints

The foundation is enforced by tests, and each one says what it wants when it
fails. In short: tokens are consumed, not restated; a family is selected by
`data-ui` and its parts by `data-part`, never by a class; the contract and its
test come before the implementation; durations come from the motion scale; a
weaker state holds itself back for the stronger ones; and the family answers
every density, `dir="rtl"` and `high-contrast` through logical properties.

Both frameworks share the conceptual contract and nothing else: React stays
idiomatic React, Angular idiomatic Angular, and native props, events and
consumer values survive in both.

A new step in a token scale, a new capability or a new state changes ground that
other families stand on. Justify it at the gate before writing it.

## Decisions already taken

- **Measure belongs to `container`, and to it alone.** No text family or layout
  primitive caps its own line length; two families offering a maximum measure
  would be two answers to one question.
- **Truncation never removes content from the DOM.** A truncated string stays
  readable to assistive technology and reachable in full when it matters.
- **A scheme is chosen by the application; the operating system's own
  high-contrast mode is served by the theme's `forced-colors` block.** A family
  writes no `forced-colors` rule unless it paints something the theme cannot
  reach.
- **Overlay behaviour is composed from `packages/core`, never rewritten in a
  family.** `presence`, `portal`, `positioner`, `dismissable-layer`, `focus` and
  `live-announcer` each own one question and none imports another. An overlay
  family takes the ones it needs and no more.
- **`@floating-ui/dom` is the positioning engine, and it is invisible.** It is
  the only runtime dependency of `@slotted/core`, imported by `src/positioner`
  alone and marked external in the build. No type or option name of it appears
  in any public surface, which is what keeps CSS Anchor Positioning available as
  a replacement. `PROJECT-PRD.md` §48 open question 8 is answered yes for the DOM
  layer; its React and Angular packages are not adopted.
- **A family that changes its own tracks with a container query needs two
  elements.** `container-type: inline-size` makes an element a query container
  for its descendants and not for itself, so a family whose query changes its
  own grid puts the container on the root and the grid one element in — which is
  the split `stepper` already had between its root and its `ol`, and the reason
  `description-list` renders a `div` around its `dl`. A family whose query only
  restyles parts needs no second element.
- **A value a stylesheet needs and only script can measure is a custom property
  under the name that says so.** `--slotted-positioner-*` for the anchor size,
  the space that is left, the transform origin and the arrow, and
  `--slotted-layer-depth` for the single overlay stack. They are runtime values,
  not design tokens, and they are not in `packages/tokens/src/contract.json`.
- **A mark beside a line of text is aligned to the text, not to the line box.**
  A box one line tall with its artwork centred in it lands on the centre of the
  line box, which is not where the words are. Measured on the default theme at
  `comfortable`: the line is 19.5 pixels and its centre 9.75 from the top, the
  baseline is 14 down, a capital is 9 tall and an x is 7 — so the centred mark
  sits a quarter of a pixel below the capitals and three quarters above the band
  the lowercase letters occupy, and it reads high. The two centres agree only
  because this font's ascent and descent happen to make them agree; a theme with
  a deeper descent moves the text and leaves the mark behind.

  The browser is asked for the baseline instead of the number being assumed. The
  slot stays one line box tall and the artwork becomes an inline-block on that
  line, so the browser places it against the same baseline the title's first
  line uses; `vertical-align: calc((<band> - <mark size>) / 2)` then centres the
  mark on whichever band of the text the family names.

  `toast` names the midpoint of the two, `calc((1cap + 1ex) / 2)`, and the three
  candidates were rendered at four times the type size and read against the word
  `Hxp` before one was chosen — every quantity in the rule is font-relative, so
  the ratio judged there is the ratio at thirteen pixels, four times easier to
  see. `1cap` is where a mark drawn at cap height belongs and it reads high,
  because every glyph in the icon scale is taller than a capital — twelve pixels
  of ink against nine — and the overshoot above a cap line has nothing to sit
  against. `1ex` puts the mark's ink where the text's ink is and reads low,
  because the mark then hangs below the descender line. Both readings came from
  the reviewer, one after the other, which is what fixed the answer between
  them.

  `alert`, `inline-message`, `status-indicator`, `list-item` and `badge` still
  centre their marks in the line box: they predate the measurement, and none of
  them is this session's to edit. Each takes the rule when it is next opened.

- **A family that renders another family's part composes its ref, not only its
  props.** `menu`'s trigger hands `render` a `ref` alongside the wiring, and it
  is the anchor the positioner measures against. `toolbar`'s overflow control
  spread the props and then wrote its own `ref` after them, which replaced the
  anchor: the surface opened at the corner of the page with the trigger sitting
  correctly in the bar. Nothing failed — no test, no type, no lint — because a
  ref that is never called is not an error. The rendered page is what showed it.

  So: destructure the `ref` out of what `render` gives you, and attach it beside
  your own. A part that takes a `ref` from another family is taking a
  measurement, and dropping it is dropping the measurement.

## Working beside another session

Another session may be building a different family in this same worktree at the
same time; `docs/build-schedule.md` says which run together. What breaks here is
not recoverable from the index, so:

1. **Write only your own family's files**, plus the shared registries below.
   Another family's file is never yours to fix, however plainly broken.
2. **Treat the registries as append-only**, re-reading each immediately before
   writing: `packages/react/package.json`, `packages/react/src/index.ts`,
   `packages/react/vite.config.ts`, the path mapping in
   `packages/angular/tsconfig.base.json`, `packages/styles/package.json`,
   `docs/BUILD-LOG.md` and `docs/build-order.md`. Insert your entry; reorder and
   reformat nothing.
3. **Keep git narrow.** Stage explicit paths. No `git add -A`, `commit -a`,
   `checkout`, `restore`, `stash` or `clean`. Format with
   `pnpm exec prettier --write <your paths>`, never `pnpm format`.
4. **A failure outside your family is not yours.** `pnpm check:full` sees the
   other lane mid-write. Report it at the gate and carry on.
5. **Ask before restarting a Storybook.** It interrupts the other lane too.

The harness output is yours alone: it is named after the family.

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

The capture is the whole page; `--scene <name>` narrows it to one scene. Read
every image. The exit condition is the right picture, not finished code.

## Verification

```bash
node --test specs/components/<family>/*.test.mjs
pnpm check
pnpm check:full
```

## The gate

Stop before committing and hand over the harness path and the captures read, the
reference-page URLs with the widths and schemes they were read at and the output
of `tools/harness/audit.mjs` on both, the weighing
from step 3, the self-assessment against the rubric and section 18, and the
decisions taken on what would otherwise have been left open. Then wait.
