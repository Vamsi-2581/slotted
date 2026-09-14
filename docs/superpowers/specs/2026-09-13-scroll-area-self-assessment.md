# Scroll Area self-assessment

Step 13 of `.claude/skills/component/SKILL.md`, against the eleven dimensions
of `references/rubric.md` and section 18 of `docs/component-features.md`.

`splitter` was invoked alongside and is not assessed here: its rebuild was
delivered on 2026-09-11 with its own assessment in
`2026-09-12-splitter-and-drawer-self-assessment.md`, and this pass changed none
of its files. Section 6 of the inventory states the delta, which is empty.

Captures are in the session's scratchpad; every one named below was read at
full size. The harness page is `tools/harness/out/scroll-area.html`.

---

## 1. Icons

The family draws no icon. The scrollbar's stepper arrows, where a platform
draws them, are the platform's own and are not glyph tokens. No `forced-colors`
rule paints a mask that carries meaning — the one mask in the sheet is the
veil, and it is removed there.

**The change that would most improve it:** none is applicable. Not made.

## 2. Motion

The veil moves rather than appears: the four edge lengths are registered with
`@property` as `<length-percentage>` and transition on
`--slotted-duration-short` with `--slotted-easing-standard`, so a scroll off an
edge grows the veil over 120 ms instead of switching it. `mask-image` itself
is not animatable, which is why the lengths inside it are what move. The
`hover` scrollbar policy transitions `scrollbar-color` on the same step.
Nothing loops, so nothing needs stopping under reduced motion; a programmatic
scroll reads `prefers-reduced-motion` in `@slotted/core/overflow` and drops to
`behavior: 'auto'`, because a browser honours `smooth` whatever the setting.

**The change that would most improve it:** the scroll-driven timeline, so the
veil tracks the scroll position continuously rather than growing once at the
edge. Not made — recorded in the design, section 5, and in the family's scope
in `docs/build-order.md`: the property is not Baseline, and a second paint
path for one veil is a second thing to keep right.

## 3. Responsiveness

The family declares no container query and needs none: it takes the box it is
given and scrolls what does not fit, which is the whole of its answer to
width. The harness at 240 pixels (`scroll-area-light-comfortable-ltr-240-scrollbars.png`)
shows every scene shrunk to the stage with the veil and bar intact, once the
scenes were told `inline-size: min(22rem, 100%)` — the first capture showed
the stage scrolling, which was the scene's defect and not the family's. The
reference page was audited at 1280 and 620 pixels with no finding.

**The change that would most improve it:** none named. The stage primitives
at three columns give a 150-pixel area on the docs page, which is narrow for
release notes and was answered by showing a list of short region names there
instead.

## 4. Refinement

Read in light, dark and high-contrast at 420, in dense, in RTL, with focus in
light and dark. Four things were changed by looking:

- the frame and the scrollport became two elements, because the veil faded
  the border across the ends and left it crisp down the sides;
- the focus ring moved to the root, because the veil cut it on the bottom
  edge;
- the veil's reach was capped at a fifth of the box, because a fixed 1.5 rem is
  a third of a short panel and at a third it stops being a hint;
- the scrollbar took `thin`, because the system's full-width bar with stepper
  buttons took thirty-two pixels off a 176-pixel panel and read as a control
  from another decade beside the rest of the library.

The scrollport inherits the root's radius, so content and veil clip to the
frame's corners rather than running square into them.

**The change that would most improve it:** the veil fades the scrollbar's own
ends where the bar meets a veiled edge, because the bar is painted by the
element the mask is on. Not made: the only fix is a third element between
the scroller and the bar, which the platform does not offer, and the thumb
sits mid-track whenever both ends are veiled.

## 5. Tokens

Four family tokens, each falling back to a foundation token and none stated as
a literal: `--slotted-scroll-area-thumb-color` → `--slotted-border-strong`
(the non-text 3:1 step), `--slotted-scroll-area-track-color` →
`--slotted-surface-sunken`, `--slotted-scroll-area-fade-size` →
`--slotted-space-8`, `--slotted-scroll-area-inset` → `--slotted-space-5`.
Durations and easings come from the motion scale with no literal. The four
registered edge lengths are `--_scroll-area-fade-*`: private, family-named so
the global `@property` registration cannot collide, and outside `tokens.json`
because no theme can retune a length the measurement decides.

Density: the family answers by holding still. Nothing it draws is a control,
and the one thing it draws is a veil over the consumer's content; scaling that
with density would change how much content is hidden rather than how much
space is used. The dense capture is identical to comfortable by design, and the
content inside answers density through its own families' tokens.

**The change that would most improve it:** none named.

## 6. Patterns

There is no APG pattern, and the contract says so rather than inventing one:
`pattern: null`, with four governing requirements cited by URL. The keyboard
table lists ten keys; the family writes one (`Tab`) and the contract marks the
other nine `platform`, key by key, with the focus destination. Native
semantics are preferred throughout: `overflow`, `scrollbar-color`,
`scrollbar-gutter`, `overscroll-behavior`, and the browser's own scrolling
keys.

**The change that would most improve it:** none named.

## 7. Accessibility

- **Name, role, state.** The scrollport is `role="region"` with a name —
  `labelledBy`, then `label`, then the provider's — and `tabindex="0"`, all
  three present only while the content overflows. Base UI and Zag write
  `role="presentation"` beside their tab stop, which passes the axe rule and
  fails SC 4.1.2; this family passes both.
- **Keyboard.** The nine movement keys are the platform's; `tabbable={false}`
  gives `Tab` back when a child already takes focus.
- **Focus.** The ring is on the root, outside the frame, complete on all four
  sides in light and dark (`scroll-area-default-focus-…-light-…png`,
  `scroll-area-scrolled-focus-…-dark-…png`).
- **Forced colours.** The veil is removed and `scrollbar-color: auto` hands
  the bar back to the system.
- **Reduced motion.** The transition collapses through the theme;
  programmatic scrolls read the query in `@slotted/core/overflow`.
- **The `high-contrast` scheme keeps the veil**, decided rather than left
  open: the veil marks content that is already leaving the scrollport, the
  scheme's promise is measured over token pairs and the family changes no
  token, and removing it would put the library's first scheme-conditional rule
  in a family stylesheet, which is a foundation decision rather than this
  family's.

**Not verifiable here:** a screen reader, a touch device, a real print dialog.
Checked in their place: the accessible name and role in both bindings' tests,
`@media print` in the stylesheet test, and the region wiring in the harness.

**The change that would most improve it:** none named.

## 8. Native API

React: `ComponentPropsWithRef<'div'>` on the frame and on `Content`;
`viewportProps` for the scrollport, with `onScroll` and `ref` composed rather
than replaced; `render` on both parts; `useId` is not needed because the family
generates no id. Angular: signals throughout, `input()` and `output()`,
`exportAs`, `DestroyRef`, `afterNextRender` so a server render builds nothing
it cannot measure; the host is the consumer's element and nothing on it is
written over, because the wiring goes on the viewport the family renders.

**The change that would most improve it:** a `viewportProps.ref` change in
React destroys and recreates the measurement, because the ref callback is
memoised on it. Not made: a consumer changing a viewport ref between renders
is a consumer passing an inline function, and the cost is one measurement.

## 9. Capability

Against the inventory: nineteen table-stakes rows, every one `adopt`, `adapt`
or a `decline` naming the owner or the composition; four differentiators; six
gaps. The corrections the inventory took from the field are in the contract:
logical edge names where Zag's are physical and Base UI's are axial, a named
region where both write `presentation`, a themed native bar where all five
draw one. No mutable value, and the reason is in the contract's `state` field
with a test that has to be deleted before a controlled `scrollTop` can be
added. The capability nobody asked for is printing: `@media print` releases the
maximum and the clip, which none of the five surveyed implementations does.

**The change that would most improve it:** the `content` part gained a
default inset during the reference-page step, because a part that only held
the consumer's padding was a part nobody would use. Made.

## 10. Ecosystem integration

Every line of both integration tables is answered in the design, sections 9
and 10, with the file that answers it. `ScrollAreaDefaultsProvider` and
`provideScrollAreaDefaults` set six defaults once; the handle and the instance
expose the same nine actions; `ControlValueAccessor` is a written no, because
a scrollport holds no value a form submits.

**The change that would most improve it:** none named.

## 11. Documentation

Both pages carry the import, the three-part anatomy, twelve captioned
demonstrations with their source, the inputs with every declared default, the
two outputs, the composition surface and five accessibility decisions. The
React page was read rendered at 1280 in light and dark and audited at 1280 and
620 with no finding; the `both` scene was rewritten after reading, because the
`Grid` family reflowed the capacity grid into two columns and the axis had
nothing to scroll. The Angular page passes the same offline contract but was
not read rendered: the Angular Storybook on 6007 reads its entry points at
startup and does not yet list this family, as the briefing says it will not
until it is restarted.

**The change that would most improve it:** the headless capture of the Vite
served page paints no native scrollbar, though the computed styles are right
and the gutter is measurably reserved; the same CSS paints the bar in the
harness under the same Chrome. Not resolved. The reviewer's live browser is
the check, and the harness captures are the evidence.

---

## Section 18

1. **Purpose.** A bounded region that scrolls, with the platform's bar and
   keyboard, an affordance for what is hidden, and the wiring a keyboard user
   needs. Anti-use: a list with a data model (`data-grid`), a carousel
   (`scroll-snap-*` on the part), a page that scrolls (`page`).
2. **Anatomy.** `root`, `viewport`, `content`; contract and design section 2.
3. **Contract.** No controlled value. Reports: `onScrollChange` /
   `scrollChange` with the logical position, `onOverflowChange` /
   `overflowChange` with the two-axis state. Imperative: `scrollTo`,
   `scrollToEdge`, `reveal`, `refresh`, `focus`.
4. **State matrix.** `default`, `hover` (the `hover` scrollbar policy only),
   `focus-visible` (the region); the measurement as `data-overflowing` and four
   `data-at-*`; `data-sideways` for a vertical writing mode.
5. **Keyboard, focus, ARIA.** Contract `keyboard` and `wiring`; tests in
   `scroll-area.test.tsx` and `scroll-area.spec.ts`.
6. **Recipes.** Five axes through tokens and attributes; no `size`, no `tone`.
7. **Responsive, RTL, locale, reduced motion.** Sections 3, 7 above; RTL by
   `:dir(rtl)` and the magnitude-based measurement; the fallback name is the
   one locale-bearing string and a provider sets it.
8. **Loading, empty, error, extreme content.** No loading or error state of
   its own. Empty and fitting content: no veil, no bar, no tab stop. Extreme
   content: the `content` scenario — unbroken tokens, a doubled translation,
   three short lines.
9. **SSR, performance, virtualisation.** No layout read during render in
   either binding; one `ResizeObserver` and one passive scroll listener per
   area; no mask when `fade="none"`; virtualisation deferred to `data-grid`.
10. **Examples.** Twelve scenarios per page, one product.
11. **Shared behavioural tests.** 28 React, 24 Angular, 14 contract, 9
    stylesheet, 47 in `@slotted/core/overflow`.
12. **Stability.** New family; no consumer moves.
