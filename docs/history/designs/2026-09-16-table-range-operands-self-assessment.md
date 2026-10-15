# Table range operands self-assessment

The second reopening of `table`, wave 10: `between` on a time and on a
date-time drawn as one range picker, and a cell holding a `plain` control giving
its inset to the control. Inventory in
`docs/history/designs/2026-09-16-table-range-operands-capability-inventory.md`,
decisions in `docs/history/designs/2026-09-16-table-range-operands-design.md`.
The 14 September self-assessment stands for everything this pass did not touch.

Captures: `/tmp/claude-1000/-home-dreco-dev-slotted/ca0a0302-6505-4594-82f8-34b576d7285b/scratchpad/shots/`
(harness) and `…/scratchpad/sb/` (Storybook, React).

## The eleven dimensions

| Dimension             | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                    | The one change that would most improve it, and whether it was made                                                                                                                                                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icons                 | No glyph added. The clock and the calendar on the range frames are `time-range-picker`'s and `datetime-range-picker`'s.                                                                                                                                                                                                                                                                                                     | None needed.                                                                                                                                                                                                                                                                                                                    |
| Motion                | No transition added; the picker's surface opens with the picker's own presence.                                                                                                                                                                                                                                                                                                                                             | None needed.                                                                                                                                                                                                                                                                                                                    |
| Responsiveness        | `filter-operand[data-range]` collapses the grid to one column for `time` and `datetime` as for `date`; `[data-kind='time']:not([data-range])` keeps the eight-rem floor for a consumer's own two pickers. Captures at 240 for both filter scenes; `editing` at 420 and 720, dense and rtl.                                                                                                                                | Made: the time floor rule stood after the collapsing rule at equal specificity and won; guarded with `:not([data-range])`, and `table.styles.test.mjs` holds the order.                                                                                                                                                       |
| Refinement            | Thirty harness captures read. The first `editing` capture showed a row with a control ten pixels taller than the rows around it; the cell now hands its block inset to the control's height and the rows are equal at every density. The invalid edge stands square on the cell.                                                                                                                                             | Made: `--slotted-control-height-*: var(--_row-min-block)` on the cell. Not made, by rule: a `plain` `number-field` in a numeric cell aligns its digits to the start (`number-field`'s input does not inherit `text-align`); recorded in `docs/process/build-order.md` for that family.                                                   |
| Tokens                | No token added. The cell rule reads `--_pad-inline` and `--_row-min-block`, both resolved on the root, and writes the six control tokens the fourteen families already read.                                                                                                                                                                                                                                                 | None needed.                                                                                                                                                                                                                                                                                                                    |
| Patterns              | No new keyboard or role. `Enter` on the range picker's trigger opens it (contract `filter.enter`); the single pickers keep `applyOnEnter`.                                                                                                                                                                                                                                                                                  | None needed.                                                                                                                                                                                                                                                                                                                    |
| Accessibility         | The range picker's fields and lists are named `From` and `To` through `startLabel` / `endLabel` (React `table.test.tsx`, Angular `table.spec.ts`). The picker's surface is a third `dismissable-layer` over the panel's, as the calendar already was.                                                                                                                                                                       | Not made, outside this family: the overnight pair reads as invalid on the end field while the filter accepts it; `wrap` on `time-range-picker` is recorded.                                                                                                                                                                    |
| Native API            | React: `presets: ReactNode` on `TableTimeFilter` and `TableDateTimeFilter`, the rest unchanged; the picker takes `locale`, `hourCycle`, `granularity`, `step`, `options`, `timeZone`, `min`, `max` as the single picker did. Angular: `presets: TemplateRef`, rendered by `NgTemplateOutlet` inside the picker's `Presets` part.                                                                                          | None needed.                                                                                                                                                                                                                                                                                                                    |
| Capability            | Inventory §2: four adopts and one decline naming `data-grid`. §3: the run's length said, the end list bounded, one inset rule for fourteen families. §4: seven gaps answered, the overnight window among them.                                                                                                                                                                                                             | Made: `presets` on both filters, unasked by the scope, because the picker carries them and `TableDateFilter` already does.                                                                                                                                                                                                      |
| Ecosystem integration | Design §4 and §5 answer every line. Defaults once through the pickers' own providers. `rangeOperand` is true for the three range kinds in Angular; the React shell takes `rangeOperand` from the two components.                                                                                                                                                                                                            | None needed.                                                                                                                                                                                                                                                                                                                    |
| Documentation         | Three scenes per page touched or added (`filter-time`, `filter-datetime`, `editing`), each with a caption over forty characters and a Prettier-checked snippet; the docs notes state the overnight contradiction and where it is resolved. React page read at 1280 in light and dark for the three stories, the panel and the picker open; the audit at 1280 reports findings only in the `content` scene, untouched. | Not made: the Angular page was not read — port 6007 answered nothing during this session.                                                                                                                                                                                                                                      |

## Against §18

1. **Purpose.** One control for both ends of a time or date-time window, and
   an editable cell whose value stands where the read value stood. Anti-use:
   cell and row edit modes, which are `data-grid`'s.
2. **Anatomy.** No part added. `filter-operand` carries `data-range` for the
   three range kinds; `cellControl` states the cell rule.
3. **Controlled and uncontrolled.** Unchanged.
4. **State matrix.** Unchanged; `data-range` is the shape the panel took.
5. **Keyboard and ARIA.** `Enter` on the range trigger opens the picker; the
   picker's own keys inside its surface; `From` / `To` names on its fields.
6. **Recipes.** `size="sm"` on every operand; the cell rule takes any size
   step and gives the control the row's height.
7. **Responsive, RTL, locale.** Captures at 240 and in RTL for the two filter
   scenes and `editing`; `locale`, `hourCycle`, `timeZone` reach the pickers.
8. **Loading, empty, error, extreme.** An open end on a date-time `between`
   is an inactive condition (React test: Apply reports nothing). The overnight
   pair reaches the descriptor and is applied as the window. An empty required
   description in a cell paints the invalid edge, square.
9. **SSR.** Unchanged.
10. **Examples.** Two filter scenes updated and one scene added per page, in
    the dispatch desk and the stock take.
11. **Shared behavioural tests.** React 40 (`table.test.tsx`) + 4
    (`table.stories.test.ts`); Angular 26 (`table.spec.ts`) + 4
    (`table.stories.spec.ts`). The same behaviours in each: one range picker
    for `between` and the single picker otherwise, `Enter` on the trigger
    applying nothing, the ISO text written from a stepped segment.
12. **Break and migration.** None: `presets` is added, no shipped prop changes
    meaning. A consumer's `renderOperand` is called once per slot as before.

## Verification

- `node --test specs/components/table/*.test.mjs` — 39/39.
- `node --test packages/styles/src/table/table.styles.test.mjs` — 3/3;
  `plain-variant.test.mjs` — 42/42 with it.
- `packages/react`: `table.test.tsx` 40/40, `table.stories.test.ts` 4/4.
- `packages/angular`: `table.spec.ts` 26/26, `table.stories.spec.ts` 4/4,
  through `ng test --include`.
- `pnpm typecheck` — clean. `eslint` on this family's four directories — clean.
  `prettier --check` on this family's paths — clean.
- `pnpm test:contracts` 1664/1664, `test:package-layers` 12/12, `test:docs`
  25/25.
- `pnpm check:affected` fails outside this family: `format:check` on
  `sparkline`, `stat-card` and `demos/nexora/domain.md`; `lint` on
  `sparkline.test.ts`, `toggle-group.tsx`, `toggle-group.styles.test.mjs`;
  `@slotted/tokens` verify one failure; `@slotted/styles` five failures in
  `alert`, `breadcrumb`, `tabs`, `tag`, `text-field`. Every table test in the
  styles run passes (1188 pass).
- `tools/harness/audit.mjs` on the React page at 1280 and 620: 41 stages;
  findings only in the `content` scene and, at 620, the `stickyTo="page"`
  scene — the `max-content` debt recorded in
  `docs/archive/build-order-pass-1.md` — both untouched by this pass. The
  three scenes of this pass report nothing at either width. The Angular page
  was not audited: port 6007 answered nothing.
