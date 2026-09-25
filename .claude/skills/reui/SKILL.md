---
name: reui
description: Use when explicitly invoked as /reui <family> [survey|polish|build] in the Slotted repository, to raise a component family's visual and interaction craft — measurements, hover, press, focus, motion — using the ReUI library (reui.io — primitives, free c-* examples, Pro blocks) as measured reference wherever it draws the family or an analogue of it. Temporary development skill; do not infer it from a generic request to change component code.
---

# ReUI reference craft

> Qualidade de execução: obsessão por craft. Pixel-perfect, refinamento extremo,
> microinterações exclusivas, animações premium, hovers/actives/focus
> cuidadosamente desenhados e zero aparência de template ou AI-slop. Cada pixel
> deve ser intencional.

The craft bar below turns this motto into pass conditions.

Temporary. The skill, its `scripts/` and `tools/harness/out/reui/` are removed at
the end of the project; dossiers already written stay in
`docs/history/designs/` as history.

The target is the craft bar, applied to the Slotted family. ReUI is a source of
ideas and of measurements: capabilities, flexibility, compositions, states and
microinteractions it ships, and the computed values behind its picture and
motion. It is never the source of the API, the code, or the way a capability is
built. The bar holds whether ReUI draws the family, an analogue of it, or
nothing comparable.

An idea taken from ReUI is redesigned in Slotted terms before it enters the
family: the shape of its API follows `/component` — parts a consumer arranges,
native props and events, a controlled and uncontrolled pair with a reason,
React and Angular idioms — and the Slotted shape improves on the ReUI shape in
at least one named respect or the dossier records that the two coincide.

The output is a Slotted family — CSS on Slotted tokens, idiomatic React and
Angular bindings, a Slotted contract — that passes every criterion of the bar,
adopting a ReUI value only where the specimens show it is the better one.

The failure this skill exists to stop: a pass that looks at ReUI screenshots,
copies what it remembers of Tailwind class names, and ships values nobody
measured. Every number in this skill's output comes from a computed style read
by `scripts/capture.mjs`, on both sides.

## Invocation

`/reui <family> [survey|polish|build]`. Without a mode: `polish` when
`specs/components/<family>/` exists, `build` otherwise.

| Mode     | Output                                        | Stops at                   |
| -------- | --------------------------------------------- | -------------------------- |
| `survey` | Dossier                                       | Dossier written            |
| `polish` | Dossier, then the delta applied to the family | Dossier gate, then report  |
| `build`  | Dossier, then `/component <family>` fed by it | The two `/component` gates |

`polish` changes stylesheets, token files, and binding markup that the contract
already declares. A delta row that edits `contract.json` moves the run to
`build`.

## Evidence

`scripts/capture.mjs` is the only browser automation this skill runs. It is a
fixed scenario with failure semantics, as `AGENTS.md` › Browser Automation
requires: one preview route, one style, theme and width, exit 1 when the route
fails, the page is the not-found page, the ready marker is absent after one
reload, or the state selector matches nothing. It reuses the harness launcher
and writes to `tools/harness/out/reui/<item or family>/`.

```bash
# ReUI side. c-* names are free examples; any other name is a Pro block.
node .claude/skills/reui/scripts/capture.mjs <item> --theme light --states '<selector>'
node .claude/skills/reui/scripts/capture.mjs <item> --theme dark  --states '<selector>'

# Slotted side: same readings from the harness page. --width is 240, 420 or 720.
node tools/harness/build.mjs <family>
node .claude/skills/reui/scripts/capture.mjs --family <family> --theme light --width 720 --states '<selector>'
```

| Axis                   | Flag                                                                  | Sides   |
| ---------------------- | --------------------------------------------------------------------- | ------- |
| Scheme                 | `--theme light\|dark` (Slotted also `high-contrast`)                  | both    |
| Page width             | `--width` (ReUI default 1280; Slotted 240, 420, 720)                  | both    |
| Reduced motion         | `--motion reduce`                                                     | both    |
| Forced colours         | `--forced-colors active`                                              | both    |
| Density, direction     | `--density dense`, `--dir rtl`                                        | Slotted |
| State behind a click   | `--click <selector>`, repeatable, applied in order before the capture | both    |
| Elements per state run | `--limit <n>`, default 6: the first n rendered matches of `--states`  | both    |

Every axis away from its default, the `--click` selectors and the `--states`
selector enter the file stem, so runs never overwrite each other. Each run writes `<stem>.png` (full
page, 2×), `<stem>.json` (the specimen), and for `--states` one clipped picture
per element and state.

The specimen holds `parts` — every `data-slot`, `data-ui` and `data-part`
element, their direct children, every `svg` and every interactive element, each
with rect, class, data and aria attributes, `focusable`, `ground` (the first
opaque background behind it), 56 computed properties, and the same properties
for a `::before` or `::after` that paints — plus `tokens` (root
custom properties), `keyframes`, and `states[]` with the computed delta of
hover, active and focus-visible against rest, pseudo-elements included.
`deltas.focus` is `null` on an element that cannot take focus.

`--states` names the element a person interacts with. A family whose
interactive form is a rendering variant (`a`, `button`) is captured twice: once
on the static part, once on the interactive variant.

Read the specimen with `ctx_execute_file` and print only the rows the dossier
needs. Read, as images, the rest and state clips of the elements compared in
sections 3, 4 and 7 — one element per role on each side — and the full-page
picture of each item in both themes.

## Process

1. **Load.** `references/translation.md`, `references/dossier.md`, and for the
   family: `specs/components/<family>/contract.json`,
   `packages/styles/src/<family>/`, its entry in `docs/component-features.md`,
   and the assertions of the tests in `packages/styles/src/*.test.mjs` that
   scan every family (focus ring, motion, logical properties, states,
   fallbacks). In `build` mode, read these after the
   `/component` step 1 law, not instead of it.
2. **Select.** Fetch the catalog once per session:
   `curl -sL https://reui.io/llms-full.txt -o tools/harness/out/reui/llms-full.txt`.
   Search it for the family, its synonyms, the
   primitive names that compose it, and the parts and interactions it shares
   with other components (a row, a drop zone, a progress track, a popover
   list). Classify the coverage and choose the items § Seleção in
   `references/dossier.md` requires for it, at base `base` and style `nova`; a second
   style enters only when the dossier names what it adds. Thumbnails triage the
   choice; they are never evidence. Pro blocks show the family in product
   context — density next to other controls, truncation, counts, status — and
   are the reason to include them.
3. **Capture.** A first run of each item without `--states` lists its `parts`;
   the `--states` selector and `--limit` are chosen from that list, one element
   per role. Then both themes and `--motion reduce` for every selected item, and
   `--click` runs for each state behind an interaction. Then the Slotted side,
   after `node tools/harness/build.mjs <family>`: light, dark and high-contrast;
   `--motion reduce`; `--forced-colors active`; `--density dense`; `--dir rtl`.
4. **Write the dossier.** Every section of `references/dossier.md`, from the
   specimens. A value without a specimen path is removed.
5. **Gate** (`polish` only). Hand over the dossier path, sections 3, 4, 7 and 8,
   and the pairs of pictures that show the largest differences. Wait for the
   answer and incorporate it. `survey` ends at step 4. `build` continues at
   `/component <family>` step 1, with the dossier as the ReUI row of step 3,
   sections 3–5 as the target of step 7, and ReUI captures beside the harness
   captures in step 8.
6. **Apply** (`polish`). The delta rows of this family in order. Every value on
   a token; a value without a step is written as the dossier recorded it. Rows
   marked `outra família` are not applied; the report lists them.
7. **Recapture and compare.** The Slotted side again with `capture.mjs`, then
   the `/component` step 8 set from `.claude/skills/component/references/harness.md`
   (light, dark, high-contrast, 240, dense, rtl, and each declared state). Each
   dossier row in sections 3, 4 and 7 is either at its target, with the new
   computed value, or reopened with the reason.
8. **Verify.** `pnpm check:affected`, exit status preserved.
9. **Report and commit** (`polish`). Dossier path, before and after pictures
   per changed state, check output. One commit naming every file, as
   `/component` step 15 requires.

## The craft bar

Section 7 of the dossier checks each criterion on both sides. "Premium" in this
repository means these numbers, not an adjective.

| Criterion       | Pass condition                                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pixel grid      | The block size of every framed part (a part that paints a border, a background or a ring) is a whole pixel at 1×, comfortable density. Inline size of content-sized parts and text parts are exempt.                                                                                                                                                                            |
| Hover           | Every interactive part has a non-empty hover delta; a surface step is ≥ 0.02 OKLab L on each surface (`packages/tokens/src/theme-conformance.mjs`).                                                                                                                                                                                                                             |
| Press           | The active delta differs from the hover delta.                                                                                                                                                                                                                                                                                                                                  |
| Focus           | On every `focusable` part: indicator ≥ 2px, ≥ 3:1 between the indicator colour and the part's `ground`, in light, dark and high-contrast (WCAG 2.4.13); offset clears the part's border.                                                                                                                                                                                        |
| Transition      | Every property in a hover or active delta that paints is listed in `transition-property`; no declared `all` with a non-zero duration; durations and easings are motion tokens. A property paints unless its box draws nothing with it (a border colour on a zero-width border, an outline colour with `outline-style: none`). The focus indicator is governed by the Focus row. |
| Reduced motion  | Motion-scale durations collapse; infinite animations stop.                                                                                                                                                                                                                                                                                                                      |
| Disabled        | Label contrast holds the token-foundation value; no bare `opacity: 0.5`.                                                                                                                                                                                                                                                                                                        |
| Schemes         | High-contrast and forced-colours captures read as the same component. ReUI ships neither.                                                                                                                                                                                                                                                                                       |
| Density and RTL | Dense and rtl captures keep the anatomy; lengths scale, meaning does not change.                                                                                                                                                                                                                                                                                                |
| Target size     | Interactive parts meet § Target size of `docs/token-foundation.md`.                                                                                                                                                                                                                                                                                                             |
| Motion          | A part that appears, disappears, moves or resizes has an enter and an exit transition on motion tokens; enter uses `--slotted-easing-enter`, exit `--slotted-easing-exit`. A colour-only swap does not satisfy it.                                                                                                                                                              |
| Intent          | Every value in the family stylesheet is a token or a value recorded in the dossier with its section. A value with neither is removed or recorded.                                                                                                                                                                                                                               |

A criterion Slotted fails is a delta row, whatever ReUI does. When the failing
value belongs to a composed family (a `progress-indicator` inside a job row),
the row names that family's files and is marked `outra família`. A criterion ReUI
fails and Slotted passes is recorded as `superar` and not changed.

## Common mistakes

| Mistake                                                    | Correction                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Measuring by eye from a screenshot                         | Copy the computed value from the specimen JSON.                                                              |
| Reading `px-2` or `rounded-md` as the value                | Class names locate a rule; the specimen holds the value.                                                     |
| Capturing only ReUI                                        | The dossier compares two specimens; the Slotted side is captured first and after.                            |
| Hover captured as empty on ReUI                            | `capture.mjs` launches Chrome with a fine pointer; an empty delta is a finding, not a capture error.         |
| A literal colour or duration copied into a stylesheet      | Semantic token by role; motion token. `motion.test.mjs` rejects literal durations.                           |
| Opening reui.io pages for general browsing                 | `capture.mjs` on a named item; the cached `llms-full.txt` for search; `ctx_fetch_and_index` for a docs page. |
| Treating ReUI as the ceiling                               | Section 7 is where Slotted exceeds it; every `superar` row names the number.                                 |
| Stopping because ReUI has no such family                   | Coverage `análogo` or `nenhuma`; the craft bar still produces the delta.                                     |
| Copying an analogue's value into a part with another role  | An analogue informs only the part with the same role and interaction.                                        |
| Porting a ReUI prop list or `cva` variant table as the API | Section 6 records the ReUI shape and designs the Slotted shape with `/component` rules.                      |
