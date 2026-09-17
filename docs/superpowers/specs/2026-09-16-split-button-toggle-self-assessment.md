# Split button and toggle — self-assessment

Against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18. Inventory:
`2026-09-16-split-button-toggle-capability-inventory.md`; decisions:
`2026-09-16-split-button-toggle-design.md`. Captures in
`/tmp/claude-1000/-home-dreco-dev-slotted/cfcfee17-fd21-46db-8726-3b3dd0212338/scratchpad/shots/`
(`split-button-*`, `toggle-*`: light, dark, high-contrast at 420; light at 240;
dense; rtl; focus on the trigger, the primary, a pressed toggle and an off
toggle).

## The eleven dimensions

| Dimension       | Evidence                                                                                                                                                                                                                                                                                                                                         | The one change that would most improve it, and whether it was made                                                                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icons           | The chevron is a mask from `--slotted-icon-chevron-down` painted in `currentColor`, kept under forced colours by `forced-color-adjust: none` in the family's media block (`masked-glyph.test.mjs` passes). `toggle` draws no glyph of its own; the consumer's mark sits in the `icon` part. Read in light, dark and high contrast.               | Give the chevron the `--slotted-split-button-chevron` hook so a theme can swap it for the ellipsis. Made.                                                                                                                                                                                         |
| Motion          | Colour changes on the control step; a press enters at `--slotted-duration-instant`. The chevron does not turn while open (six surveyed split buttons hold it still). The menu's entry and exit are `menu`'s. `motion.test.mjs` passes.                                                                                                             | None named: there is no state change here the eye has to follow that a colour transition does not carry.                                                                                                                                                                                         |
| Responsiveness  | Neither family answers its own width with a query: a control is as wide as its words. `split-button`'s root states `min-inline-size: 0` and the primary wraps inside its own control (240 capture, width scene); `toggle`'s label clamps at the ellipsis (`data-demo-narrow`, 9rem).                                                              | Photograph the split button at 240 with `fullWidth` inside a real form row. Not made: the harness's 240 column already holds the full-width scene, and the picture is the same one.                                                                                                              |
| Refinement      | Every capture read at full size. The seam sits in one column at 100 %; the trigger is square at all three sizes and all three densities; the disabled solid bar takes the disabled border for its seam; the loading trigger keeps its tone (the first pass painted it grey and read as two controls — corrected).                                    | The focus ring of the trigger lands on 4 px of the primary's fill at the seam. `toggle-group`'s inward ring was considered and refused: on a solid fill an inward accent ring is invisible. Named, not changed; it is `button-group`'s reading for the same bar.                                    |
| Tokens          | `split-button.tokens.json` lists 12 tokens, `toggle.tokens.json` 50, each generated from the sheet and held by `tokens.test.mjs`; every family token falls back to a foundation token (`fallbacks.test.mjs`). No literal outside the exempt values. No new foundation token.                                                                       | Share `toggle`'s and `toggle-group`'s item tokens under one prefix. Not made: the reopen recorded in `docs/build-order.md` makes the group's item this family, and the duplicate sheet leaves with it.                                                                                            |
| Patterns        | Split button: APG Button on the primary and Menu Button on the trigger, transcribed key by key in the design §4 and held by the contract's `keyboard` list; `ArrowDown` on the primary declined in writing. Toggle: APG Button (toggle), two keys, `aria-pressed` in both states, label held.                                                       | None named: both patterns are fully transcribed and every row has a source.                                                                                                                                                                                                                        |
| Accessibility   | Trigger name required (TS in React, `SlIconButton`'s dev check in Angular); `aria-haspopup`, `aria-expanded`, `aria-controls` from `menu`; `aria-disabled` while loading, written back after `button`'s own; radio semantics under `remember`; native `disabled` on both halves. Toggle: `aria-pressed` both states, `aria-label` for icon-only. | Announce the loading trigger's reason ("saving") beside its name. Not made: `aria-disabled` is what every waiting control in the library announces, and `button`'s progress bar on the primary already names the wait.                                                                              |
| Native API      | React: `ComponentPropsWithRef` on every part, `render` on the root and both halves composed with `button`'s and `menu`'s, refs attached beside the anchor's. Angular: directives on the consumer's elements, `SlButton` and `SlIconButton` extended, `slMenuTriggerFor` hosted, `HostAttributeToken` for `role` and `type`.                          | Let the Angular primary keep the consumer's `type` through `HostAttributeToken` as `toggle` does. Not needed: `SlButton` already binds `[attr.type]` from its `type` input, which the consumer sets as an attribute.                                                                              |
| Capability      | Every table-stakes row of the inventory is `adopt`, `adapt` or a `decline`/`defer` naming the owner. Both mutable values of `split-button` (`open`, `selection`) and the one of `toggle` (`pressed`) have controlled and uncontrolled pairs, a request with a reason and a row in the contract. `remember` is the differentiator no survey ships.   | Add the one capability nobody asked for: `SplitButtonChoices` / `slSplitButtonChoices`, so `remember` is one line for the consumer rather than a hand-wired radio group. Made.                                                                                                                    |
| Ecosystem       | Both integration tables answered in the design §8 and §9. React: two providers, `useSplitButton`, `useToggleDefaults`, `MenuHandle` through the menu part's ref. Angular: two `provide*Defaults()`, four `exportAs`, `BUTTON_DEFAULTS_TOKEN` handed down with getters, `hostDirectives` for the trigger, `DestroyRef` teardown.                    | Export `button`'s composition helpers (`BUTTON_WAIT`, `resolveInertness`, `resolveLoadingIndicator`, `stateAttribute`, `blockActivation`) from `@slotted/angular/button` so a family may extend a member without reaching into its source. Made, and recorded in `docs/build-order.md`.            |
| Documentation   | Four pages: import (with `selector` and `exportAs` in Angular), anatomy per part, one demonstration per scenario (10 for `split-button`, 11 for `toggle`), every input with its default, the outputs, composition, five accessibility sentences, anatomy and theming snippets. Snippets formatted and checked; `referencePageErrors` empty on all four. | Read all four pages rendered at 1280 and 720. **Not made in this session**: the React Storybook on 6006 does not see the new subpath exports until it is restarted, and the Angular Storybook on 6007 answers nothing. Asked for at the gate.                                                     |

## Section 18

1. **Purpose and anti-use.** `split-button`: one action and the menu of its
   alternatives; not a column of actions (`button-group`), not a menu button
   alone (`menu`'s trigger). `toggle`: a mode; not an action that persists
   (`ToggleButton`), not a form value (`checkbox`, `switch`), not an item of a
   set (`toggle-group`).
2. **Anatomy.** `split-button`: `root`, `primary`, `menu-trigger`; the two
   halves are `button`'s elements carrying this family's part. `toggle`:
   `root`, `icon`, `label`.
3. **State.** `split-button`: `open` — `menu`'s model surfaced —, `selection`
   under `remember`. `toggle`: `pressed`. Each controlled/uncontrolled with a
   request carrying a reason; nothing emitted for an equal value.
4. **State matrix.** `split-button`: default, open (trigger), disabled (root or
   half), loading (root; primary indicator, trigger `aria-disabled` and
   painted). `toggle`: default, hover, active, focus-visible, pressed, disabled,
   and pressed + disabled keeping both facts. Precedence per
   `STATE_PRECEDENCE`; `states.test.mjs` passes.
5. **Keyboard, focus, ARIA.** Design §4; contract `keyboard` lists; both specs
   exercise `ArrowDown` on the trigger and on the primary, the loading refusal
   and, for `toggle`, the toolbar's roving tabindex. Touch: the trigger is
   square from the control height and the theme grows it to 44 px under a
   coarse pointer.
6. **Recipes.** `split-button`: five tones × three variants × three sizes,
   all `button`'s. `toggle`: two variants × three sizes. Density from
   `--slotted-control-*`.
7. **Responsive, RTL, motion.** Captures at 240 and `rtl`; every rule logical;
   durations from the motion scale.
8. **Loading, empty, error, disabled, extreme content.** Loading on the split
   root; disabled on root and halves; a 36-character German action wrapping in
   a 12 rem room; a 24-character German toggle label clamping in 9 rem. Empty
   and error do not apply to a control.
9. **SSR.** Nothing read from layout in render; `menu`'s `useId`.
10. **Examples.** Ten and eleven demonstrations per page, one domain each (a
    document's save actions and a repository's merge button; an editor bar and
    a log viewer).
11. **Shared behavioural tests.** React 54 (`toggle` 14 + stories 4,
    `split-button` 14 + stories 4 → 36 in the two test files plus 8 story
    checks); Angular 30 (`toggle` 11 + 4, `split-button` 11 + 4). Contracts 21.
12. **Migration.** Two new families; nothing breaks. `button`'s Angular
    public API grows five exports; `toggle-group`'s reopen is recorded.

## Verification run

- `node --test specs/components/{split-button,toggle}/*.test.mjs packages/styles/src/*.test.mjs` — pass.
- `pnpm -C packages/react exec vitest run src/toggle src/split-button` — 62 pass.
- `pnpm -C packages/angular exec ng test slotted-angular --include='**/{toggle,split-button}/src/*.spec.ts'` — 30 pass.
- `pnpm check`: `format:check` fails on two files outside this family
  (`docs/nexora-op-demo-domain.md`, `packages/styles/src/stat-card/stat-card.harness.html`);
  the remaining steps were run individually and are reported at the gate.
