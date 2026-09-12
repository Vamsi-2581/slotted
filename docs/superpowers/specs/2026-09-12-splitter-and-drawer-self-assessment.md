# Splitter and drawer — self-assessment

Step 13 of `.claude/skills/component/SKILL.md`, for the `splitter` family and for
the corrections made to `drawer` in the same session.

---

## The eleven dimensions

For each: the one change that would most improve it, and whether it was made.

| Dimension | The change that would most improve it | Made |
| --- | --- | --- |
| **Icons** | The grip is a gradient rather than an icon, so a theme cannot swap it for something that carries meaning. It is not an icon and should not be in the icon scale | yes, by construction |
| **Motion** | The scrim's pair read from `dialog` rather than restated, so the two cannot drift again | yes — `scrim-motion.test.mjs` |
| **Responsiveness** | The bar's geometry stated against the track rather than in fixed rems, so a short gutter still draws a line | yes — `gap: min(2rem, 12%)`, `flex-basis: min(4rem, 20%)` |
| **Refinement** | The accent spent once. It was on rest, hover and focus at the start of the session in one family and on hover in the other | yes — focus ring only, in both |
| **Tokens** | `--slotted-disabled-opacity` was invented and removed; every value now names a step that exists | yes |
| **Patterns** | The APG keyboard table answered key by key, including `Enter`, which was the argument for holding panels | yes |
| **Accessibility** | `aria-controls` naming the element the bar actually sizes rather than nothing | yes, and it was broken until a test caught it |
| **Native API** | `render` / a directive host, so the bar is the element the consumer's layout wanted | yes |
| **Capability** | Limits in a CSS length, which not one of the seven surveyed implementations offers | yes |
| **Ecosystem integration** | Both bindings from one contract, neither a wrapper over the other | yes |
| **Documentation** | Fourteen scenarios, each answering a line of the inventory | yes, with the caveat below |

**The caveat.** The reference pages carry a caption twice: the scenario title
comes from the docs file in English and the scene repeats it in Portuguese
immediately beneath. `references/stories.md` names "a caption that says the
title again" as a defect of step 11, and it is one. It is not fixed.

## Section 18

**Anatomy.** `splitter`: `root`, `line` ×2, `grip`. `drawer` gained `line` and
`grip` inside `resizer`. They are elements and not pseudo-elements for one
reason: `packages/styles/src/fallbacks.test.mjs` forbids a system colour inside
`::before` or `::after`, and both steps the picture takes have one as their last
resort.

**Controlled and uncontrolled.** `splitter` models two values — `extent` as
`value`/`defaultValue`/`onValueChange`, and `open` as
`collapsed`/`defaultCollapsed`/`onCollapsedChange`. Collapse is separate from the
measure because `react-resizable-panels` persists geometry alone and a restored
panel comes back indistinguishable from a very small one.

**State matrix.** `default`, `hover`, `active`, `focus-visible`, `disabled`,
`dragging`, `expanded`. Hover and press are held back for `disabled` in both
families, which `states.test.mjs` enforces.

**Density and direction.** Every measure is a step of the space scale, so
density moves the geometry without moving the meaning. `anchorsAtStart` is the
one fact the pointer and the keyboard both read, so a mirrored document cannot
have them disagree about which way is bigger.

**Loading, empty, error, extreme content.** A bar has no content of its own. The
container cases are in the inventory's Gaps: a container narrower than its own
minimums scales them proportionally rather than crushing the last region, which
is what `react-resizable-panels` throws on and Zag does silently.

## What the session found, and what found it

Seven defects. The instrument that caught each one is the point.

| Defect | Caught by |
| --- | --- |
| Lines crushed to nothing in a short gutter | reading the capture |
| The bar invisible at rest in `light` | reading the capture |
| `data-dragging` identical to rest | reading the capture |
| The accent said twice inside twelve pixels | reading the capture |
| `aria-controls` always `null` | a behavioural test |
| `ResizeObserver` unguarded in an Angular constructor | a behavioural test |
| A cancelled request that moved anyway | a behavioural test |

And one that no instrument here could have caught:

**The React stylesheet was never imported.** Every React family loads its own on
the first line of its component; `splitter.tsx` did not. jsdom applies no CSS,
the harness loads the sheet itself, and `audit.mjs` measures collapse within a
stage — so three green checks all saw a correct DOM with no rules on it. The
element rendered at zero width, which is invisible. The user found it by opening
the page.

The lesson is narrow and worth writing down: **nothing in this repository
verifies that a React family's stylesheet reaches a browser.** The harness proves
the picture with the sheet it loads itself; the reference page is the only place
the family's own import is exercised, and nothing reads it automatically.

## Method failures in this session

Two, both mine, and neither caught by a test.

**Step 8 was left before it was finished.** Six baseline combinations were
captured and four were read. `dense` and `rtl` were shot and never opened. The
skill's exit condition for that step is having looked, not having captured.

**A screenshot was read at one-sixth scale and reported as fact.** Twice: an
empty band below every demonstration that the DOM measurement then disproved —
canvas 526, stage 398, header the difference, no dead space and no duplicate
canvas. The correction came from `Runtime.evaluate` against the live page, which
is the instrument that should have been used first.

## Deliberately not done, and where each goes

- **Drag-versus-scroll arbitration on a sheet.** The gesture starts on the
  separator, which is not inside the scrollport, so the conflict the arbitration
  exists for cannot arise today. It becomes real when the header is made
  draggable, and it belongs with that change.
- **Rubber-band resistance past the largest stop.** Cosmetic; the clamp already
  holds the panel inside its range.
- **Panels, N-pane coupling, the responsive stack.** `app-shell`, wave 8, by the
  decision in `2026-09-11-splitter-design.md` §1.
- **The doubled caption on the reference pages.** Named above rather than hidden.
- **`dialog`.** Its scrim was measured and accepted by the reviewer; its
  reference page is a run of its own and has not been touched.
