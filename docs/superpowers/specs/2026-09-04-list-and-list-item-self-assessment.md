# List and List Item self-assessment

Against `.claude/skills/component/references/rubric.md`, eleven dimensions, and
`docs/component-features.md` section 18. Each dimension names the one change
that would most improve it and says whether it was made.

Captures read from
`/tmp/claude-1000/-home-dreco-dev-slotted/90e924cc-e18f-4a04-9834-cdc902033b81/scratchpad/shots/`.

---

## 1. Icons

The family owns one mark: the bullet. It is `--slotted-icon-dot` as a mask in
the row's own ink, sized to three quarters of the control glyph step
(`packages/styles/src/list-item/list-item.css`, the marker block). No character
is drawn, which is `docs/token-foundation.md` rule 3. The numbered marker is a
CSS counter and stays text, because a number **is** text — the native
`::marker` renders it the same way.

Under forced colours the mask takes `currentcolor`, which the theme has already
remapped, so the mark survives without a rule of its own. In a right-to-left
document the marker column mirrors with the rest of the row; nothing about the
dot is directional
(`list-item-light-comfortable-rtl-420.png`).

**One change:** the marker sat six pixels low, on the baseline rather than
between it and the cap line, because a length in `mask-position` places the
image's leading edge and not its centre. **Made** — half the mask size is
subtracted, and `list-item-markers-light-comfortable-ltr-420.png` is the
capture that shows it corrected.

## 2. Motion

Two transitions, both on `content` and both on a change the eye follows: the
background and the ink, at `--slotted-control-transition-duration` with
`--slotted-control-transition-easing`. A row that fills instantly in a list of
forty reads as a flicker, and the focus ring moves on the same duration so the
outline and its shadow arrive together.

Nothing else moves. There is no enter or exit animation, because rows arrive
and leave with the page's own data; a family that animated them would be
animating a list the consumer re-ordered. No animation loops, so there is
nothing for `prefers-reduced-motion` to stop beyond what the theme's collapsed
duration tokens already do — `packages/styles/src/motion.test.mjs` passes with
no literal duration anywhere in either sheet.

State pairs, and whether each transitions: default↔hover **yes**;
hover↔active **yes**; rest↔selected **yes**, because a fill appearing without a
transition reads as a repaint; rest↔current **no**, the bar is geometry that is
either there or not; rest↔disabled **no**, a control that becomes unavailable
should say so at once; rest↔loading **no**, for the same reason.

**One change:** the selected edge is an inset shadow, and `box-shadow` was left
out of the transition, so a row that became selected faded its fill in and
snapped its edge on — two state changes where there is one. **Made** —
`box-shadow` joined the transition list on `content`.

## 3. Responsiveness

The row declares `container-type: inline-size` and the name
`slotted-list-item`; the set declares no container, because it has no layout
that depends on its own width. Below 22rem the trailing metadata leaves the
inline axis and sits under the title, and the independent targets take a line
of their own. The leading visual stays: it is the row's identity, and moving it
says nothing.

The breakpoint is a literal, which `docs/token-foundation.md` rule 4 requires.
The query changes the tracks of `content`, a **descendant** of the container, so
it satisfies the rule the briefing states about a family that changes its own
tracks.

Two defects here were found by measuring rather than by looking, and both were
about flex rather than about the query:

- **A target never shrinks, so the box beside it did.** Measured on the Angular
  reference page at 620 pixels, a row whose target carried a word rather than a
  glyph left its content eighty-six pixels wide and a one-word timestamp
  spilling out of the column it was in. `actions` now takes its own line below
  the breakpoint.
- **Flex wraps before it shrinks.** With the row wrapping, a box whose basis was
  its own text pushed itself onto a second line the moment the row was narrow —
  at 240 pixels the marker stood alone above its own title. `content` has a
  basis of nought, so nothing wraps but the item that asks for a whole line.

Read at 240, 420 and 720 pixels, and audited on all four reference pages at
1280 and 620: no collapsed element and no overflow on any of them.

**One change:** the 22rem breakpoint was chosen from the design and not
measured. **Not made** — it holds at 240 and at 420 in the captures, and the
value that would replace it is the width at which a timestamp and a title stop
fitting, which depends on the strings a product uses.

## 4. Refinement

Read at full size in light, dark and high contrast, at three widths, in dense,
in right-to-left, with focus forced on a row's box, and with hover forced on a
row that carries a trailing control. Read again on the two rendered reference
pages after a reviewer opened them.

Six defects were found in the harness loop and corrected there:

1. The row stood fifty pixels tall for one line of thirteen-pixel text — the
   floor was read as a content-box height, so the padding was counted twice.
2. The marker floated in the middle of a two-line block instead of sitting on
   the title's first line.
3. The dot sat six pixels below the optical line (dimension 1).
4. The current-row bar disappeared the moment the row was focused: the ring is
   drawn just inside the row's edge, in exactly the two pixels the bar occupies.
5. The group heading and the row titles stood a pixel apart, because the
   heading read a space step and the row read the control padding scale.
6. A rounded fill inside a ruled list fought the rule it sat on. `ruled` and
   `framed` square it; `plain` and `separated` keep the radius.

Five more were found by a reviewer reading the rendered page, and each was a
defect of the family rather than of the picture:

7. **The fill was painted on `content`, and `content` is not the row.** A
   selected row carrying a trailing control showed a filled box that stopped in
   the middle of the row, with a seam where `actions` began. The fill, both
   shadows and their transition moved to the row; hover and press reach it
   through `:has()` on the box the pointer actually lands on.
8. **A one-pixel strip of every ruled row answered nothing.** The rule was a
   `border-block-start` on the row, outside the box that painted hover. Drawn
   outward as a shadow it takes no layout, and `content` now fills the row
   exactly — measured at `gapTop: 0` on every row of the states scene.
9. **A disabled separated row and a selected one were the same colour.**
   `--slotted-disabled-background` and `--slotted-tone-secondary-surface`
   resolve to the same hex in the light scheme. A disabled row recedes onto the
   sunken surface instead, which is `card`'s rule for the same shape.
10. **The variant had to be ordered before the states.** A separated row states
    its own resting fill and a selected row replaces it, and the two selectors
    carry the same weight; read the other way round the resting surface won and
    a selected card kept its edge and lost its tint.
11. **The trailing pair sat on two lines.** With `align="start"` the metadata
    rose to the title's line while `actions` stayed centred on the block, so a
    badge and a delete control ended up on different lines. `actions` follows
    `align`.

**One change:** the disabled row in the `separated` variant, in the dark
scheme, is close to invisible — `--slotted-disabled-foreground` on the sunken
surface is about 3.9:1, which WCAG exempts for a disabled control and which
still reads as a row that is barely there. **Not made:** the pair is the
theme's and every family uses it. It is named at the gate instead.

## 5. Tokens

Two token files, 37 names in `list` and 100 in `list-item`, each falling back to
a foundation token and never to a literal outside the documented exemptions.
`packages/styles/src/tokens.test.mjs` holds the two lists against what the
sheets actually read; `packages/styles/src/fallbacks.test.mjs` holds that no
component token falls back to a system colour.

The row reads the **control** scale for its geometry — height, type, glyph, gap,
inline padding — because a row is a control-sized thing and one theme decision
should retune the rows, the buttons and the fields together. That is also what
makes `@media (pointer: coarse)` grow the row without this family writing a
rule. The marker size and the marker column are proportions of the glyph step,
which is geometry rather than a token.

Nothing was added to `packages/tokens/src/contract.json`: neither family meets a
size the semantic layer cannot be retuned to give.

**One change:** the group heading's letter spacing is `0`, a literal, where
every other value is a token. **Made** — `0` is one of the universally exempt
values in `docs/token-foundation.md` rule 1, so no change was needed; it is
recorded here so the next reader does not have to re-derive it.

## 6. Patterns

There is **no** Authoring Practices pattern for a static list, and recording the
absence with the index that proves it is what `patterns.md` requires in place of
a citation: <https://www.w3.org/WAI/ARIA/apg/patterns/> names Listbox and Grid
for interactive collections and nothing between those and plain content.

What governs instead, item by item, from <https://www.w3.org/TR/wai-aria-1.2/>:

| Requirement                                                     | Where it is answered                           | Verdict |
| --------------------------------------------------------------- | ---------------------------------------------- | ------- |
| `list` requires at least one owned `listitem`                   | the rows are `li` children                     | pass    |
| `aria-busy` on a container whose owned elements have not arrived | `loading` on `list`                            | pass    |
| `listitem` requires context `list`                              | the row is an `li`; the set writes `role=list`  | pass    |
| `listitem` supports `aria-level`, `aria-posinset`, `aria-setsize` | `position`, `setSize`; level is the nesting's  | pass    |
| `aria-current` inherited, not deprecated                        | `current`                                      | pass    |
| **`aria-disabled` deprecated on `listitem`**                    | never written on the `li`                      | pass    |
| `aria-setsize`/`aria-posinset` unnecessary while all present    | written only when stated                       | pass    |

Keyboard, transcribed and checked: `Tab`, `Shift+Tab`, `Enter`, `Space` — all
four the platform's, all four verified in
`packages/react/src/list-item/list-item.test.tsx` and
`packages/angular/list-item/src/list-item.spec.ts`.

Two deliberate departures, each with its cost written:

- **`role="list"` is written unconditionally.** The cost is a role on an element
  that already has it in every browser but Safari. The cause is that the family
  draws its own marker, and it draws its own marker because CSS has no `display`
  that is both `list-item` and a grid.
- **No collection keyboard.** The cost is that a hundred rows are a hundred
  `Tab` presses. It is the platform's own behaviour for a page of links, and the
  alternative — arrows under `role="list"` — is the invented keyboard
  `docs/component-features.md` §10 refuses by name.

## 7. Accessibility

Exercised with the keyboard in the harness and photographed:
`list-item-states-focus-a-data-part-content-light-comfortable-ltr-420.png` and
its dark twin show the ring inside the row and the current bar surviving it.

- Every row's box is named by its own content; the family adds no label.
- `disabled` reaches the element that can refuse an interaction and never the
  `li`. A disabled **link** keeps its destination and takes `aria-disabled`,
  which leaves it focusable — so a reader can reach the row and hear the
  description that says why it is unavailable — and the activation is refused
  instead. A disabled **button** takes the native attribute and leaves the tab
  sequence, which is that element's own way of saying the same thing.
- `loading` writes `aria-busy`, keeps the accessible name and keeps the width.
- `selected` is painted and never announced; the `Checkbox` in `start`
  announces it. `current` is announced, because the roles model allows it.
- Forced colours: the theme remaps every token the family reads. One rule of the
  family's own, for the one thing the theme cannot reach — every tone surface is
  `Canvas` there, so a selection said with a fill alone would vanish.
- High contrast (the scheme, not forced colours): selection carries an edge as
  well as a fill, which is the defect the first high-contrast capture found.
- Reduced motion: no animation loops; the two transitions collapse with the
  theme's duration tokens.

**One change:** a screen-reader pass on the generated `content: counter()`
marker. **Not made — this machine cannot.** What was checked in its place: the
marker is generated content on the `li` rather than inside the row's box, so it
cannot enter the button's or the link's accessible name; that much is
verifiable from the DOM and is verified.

## 8. Native API

React is React and Angular is Angular, and the asymmetry is recorded rather
than levelled away:

- React exports **three** content components, because there the component owns
  the tag and a string that picked between three accessibility trees would turn
  a typo into a `div` no reader can reach.
- Angular exports **one** directive on the element the page wrote, because that
  is what this ecosystem composes with: `routerLink`, form ownership and a
  modified click all stay the page's. The directive reads the element it is on
  to choose how an interaction is refused.
- The same split governs the set's element (`ordered` prop in React, `ul`/`ol`
  the page wrote in Angular) and the group's heading (`level` prop in React, the
  page's own heading in Angular) — which is the choice `collapsible` already
  made for its header.

Native props, events and refs reach the element that owns them in both. In
Angular a `role` and an `aria-current` the page wrote are read with
`HostAttributeToken` before the host binding runs, so the consumer's value wins.

**One change:** Angular's refusal was a host listener on the box, and a
`(click)` the page wrote on the same element ran first — the two are listeners
on one target and the DOM invokes them in registration order. **Made** — the
refusal moved to a capture listener on the row, which is the only ordering the
DOM guarantees, and it refuses only what is inside `content` so a control in
`actions` stays operable. The Angular spec covers both halves.

## 9. Capability

Measured against
`docs/superpowers/specs/2026-09-03-list-and-list-item-capability-inventory.md`,
not against a scope paragraph — there was none, and the one now in
`docs/build-order.md` was written from the inventory.

Every table-stakes row is `adopt`, `adapt`, or a `decline`/`defer` that names
the family taking the capability instead: selection with roving focus →
`listbox` and `table`; virtualization → the collection engine; drag to reorder →
drag-and-drop; a horizontal arrangement → `inline` and `grid`; a landmark → one
line of the page's own; `onAction` → the platform; `inactiveText` → `disabled`
plus a description; `lines` → `align`.

The two families ship **thirteen parts, three content elements, nine axes and
values on the row, six on the set, and eight states**. Neither holds a mutable
value, and that is a decision with a reason rather than an omission: ARIA 1.2
does not permit `aria-selected` on `listitem`, so a state model here would
declare a request nothing can announce.

**One change:** the family could ship the selection model anyway and let a
consumer wire the announcement themselves. **Not made, deliberately.** It would
be the "role=list with an invented keyboard" the feature guide refuses, and it
would put a second answer in front of `listbox` before `listbox` exists.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered in
`docs/superpowers/specs/2026-09-03-list-and-list-item-design.md`, line by line.
Four lines are a reasoned **no**: a controlled/uncontrolled pair, a two-way
signal, Reactive Forms and a teardown — the first two because no value here is
mutable, the third because no control here belongs in a form, the fourth
because the family opens no subscription. The Angular row's one listener is
removed through `DestroyRef`.

Everything else is a yes with the file that answers it: `ListDefaultsProvider`
and `provideListDefaults`, `render` on every part and the directive on the
consumer's element, `ComponentPropsWithRef` throughout, `useId` for the heading
id and an injected counter for the Angular one, `exportAs` on every directive,
signals with `OnPush` and no `markForCheck`.

**One change:** neither binding exposes an imperative handle. **Not made, and
it is the right absence:** there is no action a consumer cannot express
declaratively here, and `scrollIntoView` on their own ref is the platform's.

## 11. Documentation

Four reference pages — two families, two frameworks — each answering
`specs/reference-pages.test.mjs`: the import, one anatomy row per declared part,
one scene per declared scenario with a caption and its own formatted snippet,
the API table with every declared default, the composition surface, and seven to
twelve accessibility sentences each naming a decision.

`list` has nine scenes, `list-item` eleven. Every axis, every state, the family
in a real context (an inbox, a navigation list), content the family did not
choose (unbroken, translated, right-to-left, truncated), composition with
`Checkbox`, `Badge`, `Button`, `Icon` and `Skeleton`, and the keyboard.

All four were read rendered, at 1280 and 620, and audited with
`tools/harness/audit.mjs` at both widths. Three defects came out of that
reading, and two of them were mine rather than the family's:

- **A set inside `slotted-demo-surface` collapsed to one character per line.**
  That primitive is a flex row written for chips, and a row declaring
  `container-type: inline-size` inside a shrink-wrapping parent resolves to
  nothing — the failure `stories.md` warns about. The scene now uses a real
  `Card`, which is the box `inset` exists for, so it demonstrates the actual
  composition instead of a demo ground.
- **The same scene's stage stood 573 pixels tall** where every other stage on
  the page is between 120 and 276. Measured, then removed with the same change.
- **The provider scene claimed a difference its rows could not show.** It said
  the second row is centred while both rows held one line of text, where centre
  and start are the same picture. Both rows now carry a description, and the
  difference is visible.

**One change:** the scenes are read at two widths and in one scheme. **Not
made** — the toolbar switches scheme on the rendered page and the captures
cover all three, but the pages themselves were audited in light only. The next
pass reads them in dark.

---

## Section 18 — definition of done

1. **Purpose, uses, anti-uses.** A vertical run of related rows whose rows may
   each be one action. Anti-use: a collection the reader moves a selection
   through with the keyboard — that is `listbox` or `table`.
2. **Anatomy.** `list`: root, section, section-label, section-list, empty.
   `list-item`: root, content, start, body, label, description, end, actions.
   Stable, and every one on both reference pages.
3. **Controlled/uncontrolled and events.** Neither family holds a mutable
   value, so neither declares a model or emits a request. The reason is written
   in both contracts and both pages.
4. **State matrix.** default, hover, active, focus-visible, selected, current,
   loading, disabled. Precedence is `STATE_PRECEDENCE`'s, and
   `packages/styles/src/states.test.mjs` holds the two guards.
5. **Keyboard, focus, ARIA, touch, screen reader.** Documented in both
   contracts and tested in both bindings. The row grows on
   `@media (pointer: coarse)` because it reads the control height. A screen
   reader pass is the one item this machine cannot run.
6. **Recipes.** `variant`, `size`, `marker`, `inset` on the set; `tone`, `size`,
   `align`, `inset`, `truncate` on the row — all through tokens.
7. **Responsive, RTL, locale, reduced motion.** A container query on the row at
   22rem; logical properties throughout; no string the family owns, so no
   locale of its own; no looping animation.
8. **Loading, empty, error, disabled, extreme content.** All present, and the
   extreme content is a scene of its own on both pages. Error is not this
   family's: a row is not a control with validity.
9. **SSR, performance, virtualization.** `useId` and an injected counter, so no
   id differs between server and browser; no layout is read during render;
   windowing is deferred to the collection engine by name.
10. **Examples.** Nine and eleven scenes, each with the code that produced it.
11. **Shared behavioural tests.** 33 in React, 27 in Angular, over the same
    contract facts.
12. **Changelog and migration.** Both families are new, so no contract breaks.
    The scope paragraph in `docs/build-order.md` is the record.
