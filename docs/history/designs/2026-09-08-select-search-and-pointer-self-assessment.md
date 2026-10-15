# Select search and pointer affordance — self-assessment

Against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18. Scope: `select` and `combobox`, second pass.

## The eleven dimensions

| Dimension | State | The one change that would most improve it | Made |
| --------- | ----- | ---------------------------------------- | ---- |
| Icons | The magnifier is a mask from a new glyph token, `--slotted-icon-search`, drawn at `--_content-icon-size` and muted. It takes `forced-color-adjust: none` beside the chevron and the check. | Nothing outstanding. The token was the change. | Yes |
| Motion | Untouched. The popup still arrives on the block axis and fades; the field draws no motion of its own, and neither does the mark — `highlight/highlight.css` refuses a transition on a run that is re-split on every keystroke. | Nothing. A field that animated its own results would move the list under the reader's eyes. | — |
| Responsiveness | The search scene holds at 240px and at 420px, in `comfortable`, `compact` and `dense`, and mirrors in `rtl`. The row is `--_item-height` tall, so it shrinks with the control scale rather than beside it. | Nothing outstanding. | — |
| Refinement | The magnifier opens the same column the labels open: the row adds the surface's inset to the option's, which the first capture showed four pixels out. The rule under the row is the border scale's, the same rule the `chosen` band draws. | The `status` row's block padding is `--slotted-space-5` above and below, which under a three-row result reads as a lot of air. It is `combobox`'s treatment for the same part and changing it changes both families; left, and named here. | No |
| Tokens | Two new family tokens — `--slotted-select-search-icon` and `--slotted-select-search-icon-color` — both listed in `select.tokens.json`, and one new primitive glyph in the token contract and the default theme. No literal in either sheet. | Nothing outstanding. | — |
| Patterns | Transcribed on 2026-09-08 from the Combobox pattern and the Date Picker Combobox example, both cited in the contract. The composition is the pattern's own: a `dialog` popup, `aria-haspopup="dialog"` on the trigger, DOM focus into the layer, and a second `combobox` over the listbox inside. | Nothing outstanding. The four keys that depart are each named in `searchKeyboard` with their source. | — |
| Accessibility | Two comboboxes, one at a time, and focus never on both. The count is announced by a live region; the marked span is a `mark`; a group emptied by the filter is hidden from the tree; the field is named by `searchLabel`. | A screen-reader pass. This machine cannot run one, and it is the one thing below not verified here. | No |
| Native API | The field is a real `input` with `type="text"` and every native prop reachable through `searchProps`; the caret, the selection, the IME, `Home`, `End` and the space bar are all the browser's. `filter` and `locale` are adapters, not opinions. | Nothing outstanding. | — |
| Capability | The inventory surveyed twelve implementations and adopted six of the eight it names. Seven of the twelve ship a search on the select; nine of the twelve draw `pointer` on an option. | Nothing outstanding — the declines each name what owns the capability instead. | — |
| Ecosystem integration | React: `createControllable` for the query, `searchProps` for the field, `focusSearch()` on the handle. Angular: `model()` and a request output, inputs for the field's words, `focusSearch()` on the instance. The asymmetry is `sl-select-item`'s `label` input, recorded where `combobox` already records its own. | Nothing outstanding. | — |
| Documentation | Both reference pages gain a `search` scenario with three demonstrations in React and two in Angular, ten API rows, one event row, five anatomy rows and the amended `chosen` row. | Reading both pages rendered. Neither Storybook was restarted this pass — see §Open below. | No |

## Section 18

**Anatomy.** Unchanged without `search`. With it, `content` becomes
`role="dialog"` and gains `data-search`; four parts appear inside it — `search`,
`search-icon`, `search-input` and `list` — and `match` appears inside a label.
Every one of the five is absent when the axis is off.

**Controlled and uncontrolled.** One capability added, filed under `value`
because that is where `combobox` files `inputValue`: `searchValue` /
`defaultSearchValue` / `onSearchValueChange`, reasons `keyboard`, `select`,
`clear`, `programmatic`. Angular holds it as a `model()` and a request output.
The query is never the selection and no request carries both.

**State matrix.** No new state attribute. The field takes no ring, because it
holds focus for the whole time the layer is open and a ring there would be a
permanent border rather than a state; the caret is what says where focus is.

**Density and direction.** The row reads the control scale, so it shrinks with
the options rather than beside them. Logical properties throughout; the RTL
capture puts the magnifier at the inline end and right-aligns the query.

**Loading.** The field stays and the list shows the three skeleton rows; the
live region carries the loading sentence rather than the count, because a count
of a list that has not arrived is a count of nothing.

**Empty.** A query matching nothing draws the `empty` row inside the list and
the count row draws nothing.

**Error.** Unchanged: the frame retargets its ring and the field's own invalid
treatment is the control's.

**Extreme content.** The `search` harness scene holds a disabled option, a
description, and a marked run inside each; the `multiple` scene holds the chips
band under the field. Both hold at 240px.

## Evidence

- Captures: `tools/harness/out/review-loop/sl11/` — `select-search-*` in
  `light`, `dark`, `high-contrast`, `rtl`, `dense`, 240px and 420px, and
  `select-multiple-*` for the two together.
- Harness: `/home/dreco/dev/slotted/tools/harness/out/select.html`, scenes
  `search` and `multiple`.
- Behaviour: `packages/react/src/select/select.test.tsx` (15 new cases under
  `describe('search')`), `packages/angular/select/src/select.spec.ts` (15 new
  cases under `SlSelect, searching`).
- Contract: `specs/components/select/contract.json` and its test — 27 cases.
- Shared tool: `tools/storybook-workbench/src/scenarios.tsx` and its test,
  fixed before the family, in its own commit.
- Defects with a lesson: `docs/history/build-log.md`, entry of 2026-09-08.
- Suites, run 2026-09-08: `pnpm check` exit 0; `@slotted/react` 1663 in 117
  files; `@slotted/angular` 1248 in 115 files; `@slotted/styles`,
  `@slotted/storybook-workbench` (27), `@slotted/theme-default` and
  `@slotted/tokens` all green.
- `tools/harness/audit.mjs` on the React reference page: exit 0 at 1280px, at
  620px and at 1280px in `dense`.

## Open

**Neither reference page was read rendered.** `tools/harness/audit.mjs` measured
the React page and found nothing — no collapsed stage, no spill — at both widths
and in `dense`, but measuring is not looking, and this pass has no way to
photograph an arbitrary URL. The Angular Storybook on 6007 answers nothing at
all. Restarting either server interrupts the other lane in this worktree, which
`docs/build-briefing.md` says to ask about rather than do, so it is the one step
of the skill left open and it is left open deliberately.

**No screen-reader pass.** Two comboboxes in one family, one announced at a
time, is the decision most worth hearing rather than reading. What stands in its
place: the roles and properties are asserted in both bindings' tests, and the
composition is transcribed from the pattern's own dialog-popup example.
