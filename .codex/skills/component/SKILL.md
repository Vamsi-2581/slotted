---
name: component
description: Use when explicitly invoked as $component <family> in the Slotted repository to build or rebuild one component family, or a tightly related pair; do not infer it from a request to change component code.

Important execution constraints:

Do not emit suggestions, prompts, or detours about explaining work in a web browser, generating mockups/diagrams in chat, or opening a local URL for visuals. Do not route this skill through a brainstorming flow; execute the sequence in this document directly and report only the project artifacts/files and test results required by the steps.
---

# Component craft

Build or rebuild one family, or a tightly related pair, without hiding framework-native APIs. The same bar applies whether the family exists or not.

Two steps are the reason this skill exists, and they fail in opposite directions.

Step 8 answers _is the picture right_. The library already had a rigorous checklist; it passed while the components looked poor. Do not leave the visual loop because the code is finished. Leave it because the picture is right.

Step 3 answers _is there enough component here_. Every other step in this skill can be satisfied by a box with one attribute, and the rubric will score it well: fourteen of the library's families shipped with exactly one capability, `toolbar` shipped with one part and no keyboard, and one family in thirty-four declares a state model. A lawful, beautiful, empty component is the failure this step exists to catch. Do not leave the capability inventory because the scope paragraph is covered. Leave it because a team building a real product would not have to reach past the family.

The target is a family a team would choose over the best headless library plus their own CSS. The anti-goal is a styled `div` with one prop — an unstyled Bootstrap, with neither the features nor the looks.

## Permission

Read as much as the family needs. There is no budget on sources, no limit on how many times you go back to read more, and no need to ask before researching further. When the design raises a question the survey did not answer, return to step 3 and answer it. When two sources disagree, find a third.

Ship the capability the inventory justifies, including one nobody asked for. Adding a well-argued capability is not scope creep, and it is not a question for the reviewer: it is a decision, recorded like every other decision, and a decision to include needs no more justification than a decision to exclude.

Composition over configuration is a rule about the **shape** of an API, not about how much a family does. It says: expose parts a consumer arranges, not thirty props on one element. A family with eight parts, a full keyboard model and a state model for every mutable value obeys it. A family with one part and one prop is not obeying it — it is empty. The same holds for the platform-first and no-DOM-promises rules: all three constrain how a capability is expressed, never whether it exists. Using any of them as a reason to ship less is a misreading, and it is the misreading that produced the families listed above.

## Execution discipline (to avoid unnecessary loops)

The goal is fast progress with full quality, not a longer loop. Use this sequence:

1. Define a concrete acceptance list before editing (2–6 explicit checks).
2. Make one focused code pass that targets all items in that list.
3. Run the minimal verification for this pass, then stop.
4. Fix all root-cause issues from the failure report in one consolidated edit.
5. Re-run verification once.

Do not rerun broad edits in search of improvement. If one issue persists after two full fix attempts, escalate:

- state the repeated failure,
- list 1–2 concrete hypotheses,
- and ask for an explicit unblock decision before continuing.

Do not create intermediate human gates for process control. Record decisions in artifacts, then continue to the next step; only stop for explicit release-level review at Step 13.

When reading source, prefer the narrowest useful set. Read the next source only when a dependency or decision point requires it; do not broaden scope merely because it is faster to "have all context first."

## Process

Follow these steps in order. Replace `<family>` with the invoked family name. When the invocation names a tightly related pair, apply every step and every gate to both.

1. **Load the law before component code.** Read `docs/build-briefing.md` first — it holds the environment, the constraints and the decisions already taken. Then `docs/token-foundation.md`, `docs/state-and-events.md`, `references/rubric.md`, and `references/capability.md`. Read the section of `docs/component-features.md` that covers this family, and its sections 2 and 18. Read `references/stories.md` before step 10 rather than after it: what the reference page has to prove decides which demonstrations the stories are written as. For a form control, also read `docs/history/designs/2026-08-31-field-aware-controls-design.md`. Do not inspect the family implementation first.

2. **Detect the mode. Both modes reach the same bar.** If `specs/components/<family>/` exists, rebuild the family; otherwise, create it. A family listed in `specs/legacy-families.json` moves to the current contract schema and leaves that list in the same commit.

   Rebuild is not touch-up. What shipped is evidence of a past decision, not a constraint on this one: the contract, the parts, the props, the element, the state model and the stylesheet are all open. Change the public API when the inventory shows the shape is wrong — a renamed prop, a prop that becomes a part, a part that becomes a family, a boolean that becomes a state model. An existing API is never a reason to ship less than the inventory justifies.

   The cost of a break is written, not avoided: record what changed and how a consumer moves, as `docs/component-features.md` section 18 requires of a contract break. That note is the price of the change, and it is cheaper than carrying a shape the family has outgrown.

3. **Survey the field, then inventory the capabilities.** Follow `references/capability.md`. Produce the inventory before any design or code, in four named sections, in this order: **Surveyed**, **Table stakes**, **Differentiators**, **Gaps**. Read `docs/product/prd.md` and weigh every item the invocation named inside the same inventory.

   The inventory is produced in both modes, from the field rather than from the family. In rebuild mode, produce it before reading the current implementation, then put the two side by side and name the delta: what shipped, what the field ships, and what this family will ship. A capability the family already has is not automatically kept — it is inventoried like every other, and dropped if the field and this library's own context say it was wrong.

   The scope paragraph in `docs/process/build-order.md` is a floor, not a ceiling. A capability two or more surveyed implementations ship is adopted or adapted; declining one requires naming the family that owns it instead, or the two or three lines of consumer code that compose it. "Not needed yet" is not a reason, and neither is a shared tool that cannot express it.

   Present the inventory before writing code.

4. **Source the pattern.** Follow `references/patterns.md`. Look up the applicable WAI-ARIA Authoring Practices pattern; never rely on recall. In rebuild mode, read `packages/styles/src/<family>/<family>.css` against `references/rubric.md`, then write the current defects, open questions, and context-dependent decisions. The rubric guides inspection; it is not a closed rule set or a substitute for judgement.

5. **Design the family, and both bindings' ergonomics, before either is written.** Answer both integration tables in `references/frameworks.md` in writing — every line gets the place that answers it, or one sentence naming why this family does not need it. A blank line is an unanswered question, not a no.

   When responsibility, anatomy, state ownership, composition, cross-framework behaviour, or a public API break needs a decision, write a design in `docs/history/designs/` and proceed after recording the decision and rationale. A rebuild that changes any of those needs the document as much as a new family does; only a change that alters no decision skips it, and the integration tables are answered either way.

6. **Change the contract and its test first.** Create or update `specs/components/<family>/contract.json` and its contract test. The contract declares `ui`, the parts, the states from the shared vocabulary, and a `stateModel` for every mutable capability. Run the focused test, watch it fail for the intended missing behaviour, implement the smallest contract change, and run it again:

   ```bash
   node --test specs/components/<family>/*.test.mjs
   ```

   Never weaken a test to make an implementation pass, and never narrow the contract to fit a shared tool. A schema, a workbench map or a story check that cannot express the right contract is a defect in that tool, fixed first, in its own commit, as `docs/build-briefing.md` requires.

7. **Write the stylesheet against the foundation.** Work in `packages/styles/src/<family>/<family>.css` and its token file. Read each visual decision against `docs/token-foundation.md`, but evaluate it in the component's context. Document intentional departures and their cost. Do not create or run a regex-based policy gate over CSS; open-ended design rules cannot be made complete that way. Progress using behavioural tests, rendered evidence, and explicit review.

8. **Render, capture, look, and correct.** Follow `references/harness.md`. Build the page and capture at least these combinations:

   ```bash
   node tools/harness/build.mjs <family>
   node tools/harness/shoot.mjs <family> --scheme light --width 420
   node tools/harness/shoot.mjs <family> --scheme dark --width 420
   node tools/harness/shoot.mjs <family> --scheme high-contrast --width 420
   node tools/harness/shoot.mjs <family> --scheme light --width 240
   node tools/harness/shoot.mjs <family> --scheme light --density dense
   node tools/harness/shoot.mjs <family> --scheme light --dir rtl
   ```

   Then photograph the states. A family that paints a state and never captures it has not been looked at:

   ```bash
   node tools/harness/shoot.mjs <family> --scheme light --focus '<selector>'
   node tools/harness/shoot.mjs <family> --scheme dark --focus '<selector>'
   ```

   Capture every state the contract declares — hover, focus-visible, active, disabled, loading, checked, selected, open, invalid — in the scene that shows it, and in both light and dark. A state that only exists live is exercised in the browser at the gate and named in the assessment.

   Read every image. Judge alignment, spacing rhythm, type, optical balance, scheme contrast, whether density changes size without changing meaning, whether the mirrored layout is the same component, and whether the narrow container holds. Then judge the states against each other: does the focus ring sit at the right distance from the border, does hover read at a glance without shouting, does press give feedback, does disabled stay legible, does the transition between two states help the eye or merely happen. Correct the component and repeat all affected captures.

   Code completion is not the exit condition, and neither is a correct picture. The exit condition is a picture with nothing left to fix — and the way to find what is left is to name, in writing, the one detail you would change if you had another hour, then change it.

9. **Implement both frameworks.** Follow `references/frameworks.md`. Keep the conceptual contract shared, React idiomatic to React, and Angular idiomatic to Angular. Preserve native props, events, and explicit consumer values.

10. **Write both reference pages, then read them rendered.** Follow `references/stories.md`. The pages are where a consumer meets the family's API, and they are held to a contract of their own: the import, the anatomy, one captioned demonstration per declared scenario with the code that produced it, the inputs, the outputs, the composition surface, and the accessibility decisions. Two demonstrations and no source is the shape this step used to produce, and `specs/reference-pages.test.mjs` now refuses it.

    Lay every demonstration out with the workbench primitives; the stage owns the gap between examples, and a story that reaches for an inline style is refused. Then, if a Storybook reference page is already running, read it at 1280 and 720 pixels, in light and in dark — the page, not the story file:

    ```
    http://localhost:6006/iframe.html?viewMode=docs&id=components-<family>--reference
    http://localhost:6007/iframe.html?viewMode=docs&id=components-<family>--reference
    ```

    Validate on a Storybook server only if it is already running:
    http://localhost:6006 for React or http://localhost:6007 for Angular. Do not start new Storybook processes for validation.

    Read every story the family declares in `viewMode=story` as well, and read the page in dense as well as comfortable. The docs page and the story view lay the same scene out under different rules, and a scene that holds inside one can escape its stage in the other: a matrix was drawn out of an 88-pixel box and over the two scenes below it in the story view alone. Open every code drawer before judging the page — a closed `<details>` is a snippet nobody looked at, and the one inside it was set in a proportional face for as long as the drawers stayed shut.

    A demonstration in a mostly empty canvas, two examples with no distance between them, a caption that repeats the title, a clipped table, a snippet that no longer matches the demonstration above it, a snippet whose columns do not line up, or anything drawn outside the box that owns it — each is a defect of this step, and each was found by looking rather than by a test.

    A defect in the workbench is fixed in the workbench, with a test in `tools/storybook-workbench`, before the family's own work continues — as step 6 requires of every shared tool.

11. **Run the automatic gates.** Format every changed file, then require:

    ```bash
    pnpm check
    ```

    Do not pipe a verification command into `head`, `tail`, or `grep`; preserve its exit status.

12. **Write the self-assessment.** Assess all eleven dimensions in `references/rubric.md`: Icons, Motion, Responsiveness, Refinement, Tokens, Patterns, Accessibility, Native API, Capability, Ecosystem integration, and Documentation. Follow its Scoring rule: for each dimension name the one change that would most improve it, and say whether it was made. Then state, against `docs/component-features.md` section 18, the family's anatomy, its controlled and uncontrolled contract with reasons, its state matrix, its density and direction behaviour, and its loading, empty, error and extreme-content cases. Cite capture paths, behavioural tests, the APG checklist, relevant code, and the reasoning behind context-dependent choices. Fix anything below the bar before continuing.

13. **Stop at the human gate.** Decide every open question first, as `docs/build-briefing.md` requires: the gate carries decisions already taken, not questions for the reviewer. Hand over the absolute harness path, the reference-page URLs with the widths and schemes they were read at, the step 3 capability inventory with its four sections, the eleven-dimension self-assessment, and the decisions taken. Ask the person to open the harness and, if storybook is already running on 6006 (React) or 6007 (Angular), open that one reference page and exercise hover, focus, keyboard, and resizing; do not start a Storybook server solely to satisfy this step.

14. **Commit after the human gate.** Make one commit per step of substance, name every staged file explicitly, and include only this family's work. Do not stage a directory. Record the completed family in `docs/history/build-log.md` when the active plan requires it.
