# Context menu and hover card — self-assessment

Against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18. Each dimension names the one change that
would most improve it and says whether it was made. Captures are in
`/tmp/claude-1000/-home-dreco-dev-slotted/90b58719-e073-493e-b6ef-44a0a92707ca/scratchpad/shots/`;
the harness pages are `tools/harness/out/context-menu.html` and
`tools/harness/out/hover-card.html`.

## The eleven dimensions

| #   | Dimension             | State                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | The one change                                                                                                                                                                                                            | Made                                                                                                                                                                           |
| --- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Icons                 | Neither family draws a glyph of its own. The submenu chevron, the check and the close mark on the surfaces are `menu`'s and `popover`'s, from the glyph scale.                                                                                                                                                                                                                                                                                                              | None owed by these two families.                                                                                                                                                                                          | —                                                                                                                                                                              |
| 2   | Motion                | The surfaces animate as `menu` and `popover` do. The two roots transition one property each from the motion scale: the target's open mark (`box-shadow`, `--slotted-duration-short`) and the trigger's tint, halo and underline. Neither loops.                                                                                                                                                                                                                             | The open mark fading in on a row that is already framed reads as a second border appearing; a `--slotted-duration-instant` there would be honest about a state that is binary.                                             | No. The transition is the same one the surface arrives with, and two things changing at two speeds would read as two events.                                                     |
| 3   | Responsiveness        | Neither root reflows: the target is the consumer's region and the trigger is inline. Both harness pages hold at 240 with the layers clamped where `shift` would move them (`hover-card-light-comfortable-ltr-240.png`, `context-menu-light-comfortable-ltr-240.png`); the card narrows to `--slotted-positioner-available-width`. Docs pages read at 1280 and 720; `audit.mjs` clean at 1280 and 620 on both React pages.                                                    | A link that wraps onto two lines anchors to the box around both (inventory §6); `inline()` in `positioner` is the fix.                                                                                                     | No — recorded in `docs/build-order.md` as a reopening of `positioner`, because a second engine option is that module's decision.                                                  |
| 4   | Refinement            | Open mark inward at one pixel in `--slotted-border-strong`, laid over the content as a pseudo-element so a card's own ground cannot cover it, square on a row and rounded on a card; tint at 7.5 % of `accent-text` with a `--slotted-space-1` halo, and the line under it does not move (`hover-card-states-*.png`, all three schemes). Focus rings at the foundation's offset (`*-focus-*.png`). The arrow's tip stands 4 px off the word (`hover-card-anatomy-light-comfortable-ltr-420-zoom300.png`). | The mark as an inset shadow on the target showed only at the corners under a card that paints its own ground — the reviewer saw it on the reference page.                                                          | Yes: the mark is a `::after` overlay with `border-radius: inherit`, and the page's tiles are the target itself rather than a wrapper around a card (`context-menu-states-light-comfortable-ltr-420.png`). |
| 5   | Tokens                | `context-menu.tokens.json` (9) and `hover-card.tokens.json` (15) list exactly what the sheets read; every family token falls back to a foundation token; the tint reads `--slotted-highlight-tint-opacity` rather than a literal share; no runtime property is filed as a token.                                                                                                                                                                                              | `--slotted-hover-card-halo` falls back to `--slotted-space-1`, a step of the space scale used as a shadow spread.                                                                                                          | Kept: the halo is a distance, and the space scale is where distances live.                                                                                                       |
| 6   | Patterns              | Design §2.4 and §3.2, contracts `keyboard[]`. Context menu: the APG has no pattern; the surface keys are `menu`'s, the target keys are the platform's two, the menu-button keys are declined with the reason. Hover card: WCAG 1.4.13 item by item, the APG tooltip page's non-modal dialog for the navigable card.                                                                                                                                                             | The contract says `role="presentation"` for a non-navigable card; `generic` would be the ARIA 1.2 word for a `div` that is nothing, but `presentation` is what removes the role from the tree.                            | Kept `presentation`.                                                                                                                                                             |
| 7   | Accessibility         | Focus returns to what held it (`context-menu.test.tsx` "returns focus to the element that held it"); no `aria-haspopup` on a generic target and the other path shown; the card never takes focus, `blur` closes it, focus the family returns does not reopen it (tests "does not reopen"); navigable cards are dialogs named by their title with the wiring on the link; forced colours: the mark and the tint vanish with backgrounds, and the open link's underline thickens. | A long press, the iOS callout and a screen reader's reading of `role="presentation"` are not verifiable on this machine.                                                                                                    | Stated here in their place; jsdom and the harness verified everything else.                                                                                                     |
| 8   | Native API            | React: `ComponentPropsWithRef<'div'>` and `<'a'>` extended, `render` on both roots, every listener composed after the consumer's (`onContextMenu` preventDefault stops the family — tested). Angular: `input()`, `computed`, `signal`, host metadata, `HostAttributeToken` for `data-part` and `id`, `DestroyRef`; `SlHoverCard` extends `SlPopover` and provides itself as one, so `[(open)]`, `openChangeRequest` and every `slPopover*` part are inherited rather than restated. | In Angular the two triggers are components, so `a[slLink]` and `button[slButton]` cannot also carry them; a directive would compose but could not carry the stylesheet.                                                     | No — the library's own rule (`slMenuItem`, `slLink`) is that the element that enters the stylesheet is a component; the reference page states the consequence.                  |
| 9   | Capability            | Every table-stakes row of the inventory is `adopt`, `adapt` or a `decline` naming the owner or the composition. Beyond the scope paragraph: keyboard opening anchored to the target (none of four libraries has it), focus return to the previously focused element, `data-pressed`, the shared card over many triggers, `navigable`, the grace area, the touch tap. One state model each, with reasons.                                                                       | A `payload` on the trigger (Base UI's) would spare the consumer the two lines that read `currentTarget`.                                                                                                                  | No: it would add a second mutable value (`current`) with a model of its own for two lines of consumer code, and the reference pages show the lines.                              |
| 10  | Ecosystem integration | Both tables of `frameworks.md` answered in design §4 and §5, line by line. Defaults once in both bindings; `MenuHandle` / `PopoverHandle` refs; `exportAs` on every class; `provide*Defaults()`; no form integration because neither is a form control (stated).                                                                                                                                                                                                                | The Angular `context-menu` has no state owner of its own — the state is `sl-menu`'s — so `disabled` is the menu's input and there is no `disabled` default in `provideContextMenuDefaults()`; the React provider has it. | Kept: a second `disabled` would be a second copy of one value, which is the drift the whole design refuses. The asymmetry is written in the Angular docs' API table.               |
| 11  | Documentation         | Both React pages read at 1280 and 720, light and dark, every drawer open; `audit.mjs` clean at 1280 and 620. Each page: import, anatomy, eight or nine captioned demonstrations with source, inputs with every contract default, events, composition, four accessibility decisions, DOM and theming snippets. The Angular pages pass `referencePageErrors` but were not read rendered: port 6007 answered nothing.                                                             | Read the Angular pages rendered.                                                                                                                                                                                          | Not possible in this session; named at the gate.                                                                                                                                 |

## Section 18

**Anatomy.** One part each, `root`: the target region (`div`, `render` for a
row) and the trigger link (`a`, `render` for `Link`). The surfaces are
`data-ui="menu"` and `data-ui="popover"`, unchanged, and nothing of them is
re-exported (design §1).

**Controlled and uncontrolled.** `open` / `defaultOpen` / `onOpenChange` on
`ContextMenu` (forwarded to `Menu`) and on `HoverCard` (owned, with the
`Popover` inside controlled). Angular: `sl-menu [(open)]` for the context
menu, because the state is the menu's and a second owner would be a second
copy; `slHoverCard [(open)]` inherited from `SlPopover`. Reasons: the menu's
seven for the context menu; the popover's six plus `blur` for the hover card.

**State matrix.**

| Family         | State          | Painted                                                        | Written                                    |
| -------------- | -------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `context-menu` | `default`      | nothing                                                        | —                                          |
| `context-menu` | `open`         | inset 1 px `--slotted-border-strong`                           | `data-open`                                |
| `context-menu` | `pressed`      | nothing; `user-select: none`                                   | `data-pressed`                             |
| `context-menu` | `disabled`     | nothing; the browser's menu opens                              | `data-disabled`                            |
| `hover-card`   | `default`      | accent text, underline at 40 %                                 | —                                          |
| `hover-card`   | `hover`        | underline fills                                                | —                                          |
| `hover-card`   | `focus-visible`| the foundation ring                                            | —                                          |
| `hover-card`   | `open`         | 7.5 % tint, `--slotted-space-1` halo, underline fills          | `data-open`, ARIA wiring when `navigable`  |

Precedence: `pressed` and `open` never coincide with `disabled` because the
family does nothing while disabled; `hover` under `open` adds nothing the open
state has not already painted.

**Density and direction.** Neither root has geometry of its own to scale; the
surfaces take the menu's and the popover's density. RTL: `inset-inline-start`
in the harness scenes, logical properties only in both sheets; the RTL captures
show the same component mirrored.

**Loading, empty, error, extreme content.** A loading preview is the consumer's
`skeleton` inside `PopoverBody` (inventory §6). A menu with no items is `menu`'s
`empty` part. A handle that is one unbroken token breaks inside the card
(`hover-card-light-comfortable-ltr-240.png`, scene `long`); a bio the consumer
did not shorten wraps at the popover's measure. A target whose text is not a
name gets `aria-label` on `MenuContent`, and the reference page shows it.

**Not verifiable here.** A real long press on a touch screen, the iOS callout,
and what a screen reader says of a `presentation` card. Each is named in the
contract with the decision it depends on.

## Decisions taken at the gates

- Shape: root-owned trigger holding the core unchanged, no re-exports
  (visual gate, confirmed).
- `sideOffset` 4 px on the hover card, recorded as an override in the contract
  after the reviewer saw the arrow's tip on the halo.
- The arrow's border reads thinner than the panel's by rotation antialiasing:
  a reopening of `popover` and `tooltip` in `docs/build-order.md`, not a change
  here.
- `menu` gained `anchor` and `finalFocus`, `popover` honours the consumer's
  `role`: three core commits before the families.
