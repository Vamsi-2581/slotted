# Listbox self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. Wave 6 item 2, with the engine review of
item 1 underneath it.

Evidence: the harness page at `tools/harness/out/listbox.html`; the captures
listed in §12; 66 React behavioural tests in
`packages/react/src/listbox/listbox.test.tsx`; 47 Angular behavioural tests in
`packages/angular/listbox/src/listbox.spec.ts`; 22 contract assertions in
`specs/components/listbox/contract.test.mjs`; and 113 engine tests in
`packages/core/src/collection`.

---

## 1. Icons

**State.** One component-owned mark: the indicator, a mask from
`--slotted-icon-check`. No character anywhere. The icon part paints a mask from
`--slotted-listbox-option-icon` and falls back to a **transparent gradient**
rather than to `none` — `mask-image: none` masks nothing, so an icon box with no
artwork would have painted a solid square of the option's colour beside every
label. Nothing in the family is direction-sensitive, so nothing is mirrored.

**The one change that would most improve it:** the selected mark could be an
`indeterminate`-style dash in a `multiple` listbox where a range is partially
covered. **Not made** — the pattern has no such state on `option`, and inventing
one would be a third selection vocabulary beside `aria-selected` and the
forbidden `aria-checked`.

## 2. Motion

**State.** Two transitions and one loop. The option's ground and text move on
`--slotted-control-transition-duration`; the indicator's opacity moves on
`--slotted-duration-short`, so a mark appears rather than blinking into place.
The loader pulses on `--slotted-duration-loop` and **stops** under
`prefers-reduced-motion`, which is the rule for an infinite animation — the
stylesheet sets `animation: none` and holds it at `opacity: 0.7` so the row is
still legibly different from an option.

The three states that deliberately do not transition: the focus ring, which must
be where the reader is on the frame it moves; the selected bar, because a border
that grew would read as the row resizing; and the scroll, which is driven by
`offsetForIndex` and must not be animated over.

**The one change that would most improve it:** the ring could slide between two
options rather than cutting. **Not made** — it would lag the keyboard at the
repeat rate a reader holds an arrow key down at, and the rubric's own rule is
that motion which carries no information is refused.

## 3. Responsiveness

**State.** The family declares no `container-type`, so it takes a `block` stage
and `specs/story-layout.test.mjs` is satisfied. It answers width three ways:
`max-inline-size: var(--slotted-listbox-measure, 24rem)` caps it, which is
visible at 720 in `listbox-content-light-comfortable-ltr-720.png`; the label
column is the only track that gives way, so a long label wraps and the value
column does not move; and `overflow-wrap: anywhere` holds an unbroken URL.

Read at 240, 420 and 720. Two defects were found at 240 and both were fixed: the
`variant` and `states` scenes had labels longer than a two-row box could show,
and the grid demonstration at three columns broke words one letter per line.

**The one change that would most improve it:** `columns` could fall back to
fewer at a narrow width. **Not made, and recorded as a cost.** The number is
stated rather than measured precisely so the picture and the keyboard cannot
disagree — React Aria reads the laid-out geometry during a key press, and the
arrows then follow whatever the layout did. A consumer restates `columns` at
their own breakpoint; the reference page says so.

## 4. Refinement

**State.** Four corrections came out of reading the captures, and three of them
were defects no test could see.

1. **The window rendered nothing.** A grid with a definite block size stretches
   its automatic rows, so eight options inside a six-thousand-pixel canvas became
   eight rows of eight hundred and fifty. `align-content: start` and
   `grid-auto-rows: min-content` on the canvas.
2. **A hovered option and the active option were the same picture.** The active
   ground is now painted only while the keyboard is somewhere it can be —
   `:focus-within` under `roving`, and unconditionally under
   `activedescendant`, where a `combobox` legitimately holds focus elsewhere.
3. **Selection inverted in `high-contrast`.** The accent surface *is* the plain
   surface there, so a chosen option read as less emphatic than the merely
   highlighted one. A start-edge bar was added — a bar rather than a ring,
   because a ring is what the active option draws and two rings a pixel apart in
   weight is a reader guessing.
4. **Disabled lost to selected.** A disabled, chosen option kept the accent
   ground. `STATE_PRECEDENCE` says disabled outranks selected; the mark stays and
   the ground goes.

The mark sits `1lh` tall in a line box the option states, so it lands on the
first line of a label that wrapped onto three rather than in the middle of the
option. The columns carry no `column-gap`, so a listbox with no marks opens with
no gutter.

**The one change I would make with another hour:** the selected bar and the
active ring touch when the two options are adjacent, because options are
contiguous. **Not made** — separating them needs a gap between rows, and a
listbox is a list rather than a stack of chips. It is named here rather than left
unsaid.

## 5. Tokens

**State.** Seventy-five tokens in `listbox.tokens.json`, generated from the
stylesheet by the same regex the test uses, so the two cannot drift. Every
family token reaches a foundation token; no literal outside the documented
exemptions. An option is a control, so its height, inset, type, glyph and gap all
read control geometry, which is what answers the three densities without a rule
of its own.

`--slotted-listbox-rows` and `--slotted-listbox-columns` are theme tokens with a
literal default that the family overrides per instance, and they are
deliberately **not** runtime properties: a runtime property is a value only
script can measure, and a theme that wanted every listbox five options tall can
retune these. The two values script does own — the canvas height and the offset
the window starts at — are private `--_` properties no theme is asked to know.

**The one change that would most improve it:** `--slotted-listbox-measure` could
be a semantic token shared with `menu`, which caps itself the same way at a
different number. **Not made** — a shared measure would make one number answer
"how wide is a menu" and "how wide is a listbox", and the two have different
content in the same page.

## 6. Patterns

**State.** The pattern is
<https://www.w3.org/WAI/ARIA/apg/patterns/listbox/>, read on 4 September 2026
both as the rendered page and as `content/patterns/listbox/listbox-pattern.html`
in `w3c/aria-practices` — the second because the rendered page's chunking hid
the whole of the multiple-selection section, which is where **both** selection
models live. Twenty-two keys are transcribed into `contract.json` with the source
of each, and the itemised comparison is
`2026-09-04-listbox-design.md` §4.

Implemented item by item: the roles, the required accessible name, the group and
its required name, `aria-multiselectable` only in `multiple`, `aria-selected` on
every selectable option and `aria-checked` on none, `aria-setsize`/`aria-posinset`
under the pattern's own condition, `aria-orientation` only when horizontal, both
selection models, the optional keys (`Home`, `End`, `Shift`+arrow,
`Shift`+`Space`, `Control`+`Shift`+`Home`/`End`, `Control`+`A` and its optional
second half), typeahead, and the two focus models.

Three deliberate departures, each with its cost in `contract.json` `departures`:
`Enter` selects where the pattern defines nothing; `div`/`div` rather than
`ul`/`li`; and hover does not move the active option, unlike `menu`.

**The one change that would most improve it:** the pattern's "if selecting or
unselecting all options is an important function, implementing separate controls
significantly improves accessibility" is advice the family cannot follow on its
own. **Partly made** — `Control`+`A` is implemented and `disallowSelectAll`
exists, and the reference page tells a consumer to add the two buttons. The
family cannot draw them without deciding where they go.

## 7. Accessibility

**State.** One tab stop for the whole set, under both focus models. `focusMode:
'auto'` reads whether the set is windowed and answers `activedescendant` when it
is — because a roving `tabindex` cannot survive its own element being recycled,
which is the failure §4 of the engine review names. The active option and the
range anchor are pinned into the window, so the property never references an id
that is not in the document.

Forced colours: the selected ground becomes `Highlight`, the bar becomes
`HighlightText`, and a disabled option becomes `GrayText` — the ground alone
would vanish, which is the SC 1.4.1 failure the bar exists to prevent.
`prefers-reduced-motion` stops the loader.

A disabled option carries `aria-disabled` and keeps its place in the set;
`navigateDisabled` is the APG's "discoverability is crucial" case.

**What this machine cannot verify:** a real screen reader. Nothing here has been
heard. What was checked in its place: the accessibility-relevant attributes are
asserted in 113 places across the two binding suites, and the roles, states and
properties were read item by item against the pattern source rather than against
recall.

**The one change that would most improve it:** a live-region announcement of how
many options are now selected after `Control`+`A`. **Not made** — `live-announcer`
exists in `packages/core` and the announcement's wording is a locale string the
family would have to own, which `docs/component-features.md` §2.9 refuses. It is
written into the reference page as the consumer's to add.

## 8. Native API

**State.** Read against both tables in `references/frameworks.md`; every line is
answered in `2026-09-04-listbox-design.md` §8 and §9.

React: function components, `useId` for the option id prefix, context for the
compound family, `render` on the root, the option, the group, the empty message
and the loader, `ComponentPropsWithRef<'div'>` extended rather than a hand-written
subset, `ref` to the root plus a named `ListboxHandle`, and handlers that compose
— `onKeyDown`, `onFocus`, `onBlur`, `onClick` and `onPointerDown` all run the
consumer's first and stop when it calls `preventDefault()`.

Angular: standalone throughout, `input()`/`output()` signals, `computed` for
every derived value, host metadata rather than `@HostBinding`, `exportAs` on the
three components a template reaches, `ViewEncapsulation.None` with the one
authored stylesheet, `HostAttributeToken` reading a `role` the consumer wrote
before the host bindings run, `inject()` everywhere, and `DestroyRef` for the
typeahead handle, the resize observer and the scroll listener.

**The one change that would most improve it:** `model()` for `value`.
**Refused, with the reason recorded** — a model cannot express the mode being
decided once, and every other stateful family in this library spells a controlled
value `value` + `defaultValue` + a request.

## 9. Capability

**State.** Measured against the step-3 inventory, not against a scope paragraph.
Every table-stakes row is `adopt`, `adapt`, or a `decline`/`defer` naming what
owns it instead: `trigger` → `select`, `filtering` → `combobox`, `dragToReorder`
→ `drag-and-drop`, `action` → `menu`, `separator` → the group's own edge,
`checkboxOption` → the indicator column, `measure` → `container`, `compareWith` →
`getKey`.

Two mutable values, each with a controlled pair, a request carrying a reason, and
a row in the state matrix. Twenty-two keys. Fourteen capabilities. Twelve parts.
Nineteen axes an application can set once.

The two headline capabilities are the ones wave 6 exists for, and both are real
rather than declared: windowing renders a slice of four thousand options in both
bindings, with the active option pinned, the whole set reported to the reader,
and `offsetForIndex` driving the scroll; incremental loading asks for a page when
the window reaches the end of what has been loaded.

**The one change that would most improve it:** `sections` and `virtual` compose,
but only for rows whose height the caller states. A group label whose text wraps
would drift. **Not made, and stated as a required input** — `itemSize` is
required whenever `virtual` is set rather than optional, so the measured variant
is refused loudly instead of silently producing a list that drifts.

## 10. Ecosystem integration

**State.** Angular reaches `ControlValueAccessor` **and** `Validator` — the
second because "choose one" is a fact about the collection that no single option
can see — plus `LISTBOX_DEFAULTS` and `provideListboxDefaults()`. React reaches a
context provider, a `render` prop on five parts, hidden inputs under a `name` so
a bare `<form>` carries the set, and `useField` for `disabled`, `readOnly`,
`invalid`, `required`, `size` and `aria-describedby`.

Three asymmetries are recorded rather than levelled away, in
`2026-09-04-listbox-design.md` §9: `emptyContent`/`loaderContent` are React-only
because Angular projects content; `renderOption` is a function there and an
`ng-template` here; and each ecosystem's own defaults mechanism is used.

**The one change that would most improve it:** the React binding could ship a
`useListboxState` hook for a consumer building their own markup. **Not made** —
that is a headless surface, and this library's answer to "I want other markup" is
`render` on every part, which already exists.

## 11. Documentation

**State.** Two reference pages, sixteen scenes each, one per scenario the
contract declares. Every scene carries a caption over the forty-character floor
that says what to look at rather than repeating the title, and a curated snippet
that is Prettier-formatted and checked. Anatomy names all twelve parts with the
element each renders. The API table carries a row for every declared default,
every state-model name, and every input; the event table names all three outputs
with payload and moment; composition names the provider, the render surface, the
handle and the handlers that compose.

Accessibility is six paragraphs on the React page and seven on the Angular one,
each naming a decision rather than a virtue.

**The one change that would most improve it:** the pages have not been read
rendered. **Not made, and it is the gap this assessment is most exposed on** —
see §12.

---

## 12. What was looked at, and what was not

**Harness.** `/home/dreco/dev/slotted/tools/harness/out/listbox.html`, ten
scenes. Captured and read: light/dark/high-contrast at 420, light at 240 and
720, dense at 420, right-to-left at 420, plus `--focus` on the active option in
light and dark, `--hover` on the first option, and the `windowed` scene on its
own in three schemes.

**Reference pages.** Both servers answer — 6006 and 6007 each return 200 — and
neither renders this family. `tools/harness/audit.mjs` was run against both:

```
node tools/harness/audit.mjs "http://localhost:6006/iframe.html?viewMode=docs&id=components-listbox--reference"
node tools/harness/audit.mjs "http://localhost:6007/iframe.html?viewMode=docs&id=components-listbox--reference"
→ rendered no demonstration stage within 15 seconds
```

That is the restart `docs/build-briefing.md` names: the React server resolved
`packages/styles/package.json` at startup and cannot see the new
`./listbox/listbox.css` subpath, and the Angular server read its entry-point
directories once and cannot see `packages/angular/listbox`. Restarting either
interrupts the other session working in this worktree, so it is asked for at the
gate rather than done. **Neither page has been read rendered, and the audit has
not passed.** That is the one step of this skill left open, and it is left open
deliberately.

The offline half of the same contract is green: `specs/reference-pages.test.mjs`
lists no listbox failure, `specs/story-layout.test.mjs` passes, and the
per-family stories specs pass in both bindings — scenario coverage, the API
table against every declared default and both state models, the reference-page
contract, and Prettier over every curated snippet.

**Concurrency.** Another session was writing `packages/core/src/collection` in
this same worktree while this family was built. It added `navigation.ts`,
`filter.ts` and its own entries in `index.ts`. This session deleted the duplicate
movement function it had drafted and composed with `moveIndex` instead — two
functions answering one question in one module is the duplication the engine
exists to prevent — and merged rather than overwrote the barrel. That session's
`packages/angular/combobox` has an `ng-package.json` and no `public-api.ts`, so
`ng build` fails on it; the Angular listbox was typechecked in isolation and its
two suites were run by name.

---

## 13. Section 18, item by item

1. **Purpose, uses, anti-uses.** The primitive `select`, `combobox`,
   `multi-select` and the pickers are built on. Not for a list of commands, which
   is `menu`; not for a list of interactive elements, which the pattern itself
   sends to `grid`; not on its own without a label.
2. **Anatomy.** Twelve parts, listed in §1 of the design and in both anatomy
   tables.
3. **Controlled and uncontrolled, with reasons.** `value`/`defaultValue`/
   `onValueChange` and `activeKey`/`defaultActiveKey`/`onActiveKeyChange`;
   reasons `pointer`, `keyboard`, `select`, `clear`, `programmatic` and
   `pointer`, `keyboard`, `programmatic`.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `selected`,
   `current`, `disabled`, `loading`, `readonly`, `invalid`, `required`.
   Precedence: disabled outranks selected and current; readonly refuses a change
   and keeps the option reachable; the active ground is drawn only while the
   keyboard can be there.
5. **Keyboard, focus, ARIA, touch, screen reader.** §6 and §7 above; the screen
   reader is the one thing not verified.
6. **Recipes through tokens.** `size` × 3, `variant` × 2, `indicator` × 2,
   `columns`, `orientation` × 2, three densities, three schemes.
7. **Responsive, RTL, locale, reduced motion.** §3 and §2. Typeahead compares
   with `Intl.Collator` at base sensitivity, which `docs/component-features.md`
   §2.9 asks for by name. The arrows mirror on the inline axis, read from the
   element's own computed direction.
8. **Loading, empty, error, disabled, extreme content.** `loading` writes
   `aria-busy`; `empty` is a part inside the listbox; error is the field's
   `invalid`; disabled is both the control and one option; extreme content is the
   `content` scene in the harness and on both pages.
9. **SSR, performance, virtualization.** The first frame renders the overscan
   buffer, which is what the engine returns for an unmeasured viewport, so
   server-rendered markup holds the top of the list rather than an empty box.
   `aria-setsize`/`aria-posinset` are written only where React can know them
   without reading the DOM during render. Windowing is §9.
10. **Examples.** Sixteen scenes per page, including the family in a form, beside
    a field, and under a defaults provider.
11. **Behavioural tests shared between bindings.** 66 React and 47 Angular,
    covering the same behaviours; the pure reducers underneath both are covered
    by 113 engine tests.
12. **Changelog and migration.** The family is new, so nothing breaks. The one
    contract change outside it is `packages/storybook-workbench`, where the
    `virtualization` capability stopped demanding an `itemCount` prop that
    belonged to the retired `virtual-list`; it is committed on its own with its
    own test.
