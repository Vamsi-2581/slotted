---
name: component
description: Build or refine one slotted component family, or a tightly related pair, against the token foundation — with a render-and-look loop and a human gate. Use ONLY when explicitly invoked as /component <family>; never infer it from a request to change component code.
---

# Component craft

Build or refine one family, or a tightly related pair, without hiding framework-native APIs.

Step 8 is the reason this skill exists. The library already had a rigorous checklist; it passed while the components were poor. Do not leave the visual loop because the code is finished. Leave it because the picture is right.

## Process

Follow these steps in order. Replace `<family>` with the invoked family name. When the invocation names a tightly related pair, apply every step and every gate to both.

1. **Load the law before component code.** Read `docs/token-foundation.md` and `references/rubric.md`. For a form control, also read `docs/superpowers/specs/2026-08-31-field-aware-controls-design.md`. Do not inspect the family implementation first.

2. **Detect the mode.** If `specs/components/<family>/` exists, refine the family. Otherwise, create it.

3. **Weigh the request.** If the invocation includes features, behaviours, or ideas, read `PROJECT-PRD.md` and judge each item against composition over configuration, platform first, no internal DOM promises, and YAGNI. Write `adopt`, `adapt`, or `decline` plus one sentence of reason for every item, and present the weighing before writing code. Do not adopt an idea merely because it was requested or decline it merely because it is unfamiliar.

4. **Source the pattern.** Follow `references/patterns.md`. Look up the applicable WAI-ARIA Authoring Practices pattern; never rely on recall. In refine mode, also run:

   ```bash
   node tools/harness/check.mjs <family>
   ```

   Read `packages/styles/src/<family>/<family>.css` against `references/rubric.md`, then write the current defect list. A non-zero checker exit is expected until the stylesheet is refined.

5. **Design only when architecture is in question.** When responsibility, anatomy, state ownership, composition, or cross-framework behaviour needs a decision, write a design in `docs/superpowers/specs/` and obtain approval before implementation. Do not create a design document for a mechanical refinement.

6. **Change the contract and its test first.** Create or update `specs/components/<family>/contract.json` and its contract test. Run the focused test, watch it fail for the intended missing behaviour, implement the smallest contract change, and run it again:

   ```bash
   node --test specs/components/<family>/*.test.mjs
   ```

   Never weaken a test to make an implementation pass.

7. **Write the stylesheet against the foundation.** Work in `packages/styles/src/<family>/<family>.css` and its token file. A component token falls back to a foundation token, not a literal. Component-owned icons use glyph masks; motion uses the motion scale; an infinite animation stops under reduced motion; a reflowing family owns its container. Do not continue until this exits `0`:

   ```bash
   node tools/harness/check.mjs <family>
   ```

8. **Render, capture, look, and correct.** Follow `references/harness.md`. Build the page and capture at least these combinations:

   ```bash
   node tools/harness/build.mjs <family>
   node tools/harness/shoot.mjs <family> light 420
   node tools/harness/shoot.mjs <family> dark 420
   node tools/harness/shoot.mjs <family> light 240
   ```

   Read every image. Judge alignment, spacing rhythm, type, optical balance, scheme contrast, and whether the narrow container holds. Correct the component and repeat all affected captures. Code completion is not the exit condition; a right picture is.

9. **Implement both frameworks.** Follow `references/frameworks.md`. Keep the conceptual contract shared, React idiomatic to React, and Angular idiomatic to Angular. Preserve native props, events, and explicit consumer values.

10. **Update both reference pages.** Add or update the family pages under `apps/storybook-react/` and `apps/storybook-angular/`. Exercise the documented states, interaction, density, and the behaviour that matters at narrow width.

11. **Run the automatic gates.** Format every changed file, then require:

    ```bash
    pnpm check
    ```

    Do not pipe a verification command into `head`, `tail`, or `grep`; preserve its exit status.

12. **Write the self-assessment.** Assess all eight dimensions in `references/rubric.md`: Icons, Motion, Responsiveness, Refinement, Tokens, Patterns, Accessibility, and Native API. Cite the checker output, capture paths, APG checklist, and relevant code. Fix anything below the bar before continuing.

13. **Stop at the human gate.** Hand over the absolute harness path, the step 3 weighing, the eight-dimension self-assessment, and every remaining uncertainty. Ask the person to open the harness in a real browser and exercise hover, focus, keyboard, and resizing. Wait. Incorporate the response and repeat the necessary checks. Nothing is committed before approval.

14. **Commit after approval.** Make one commit per step of substance, name every staged file explicitly, and include only this family's work. Do not stage a directory. Record the completed family in `docs/BUILD-LOG.md` when the active plan requires it.
