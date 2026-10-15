# Prose self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` section 18. Each dimension names the one change
that would most improve it and says whether it was made.

Captures read from
`/tmp/claude-1000/-home-dreco-dev-slotted/cab88441-4758-49e5-a6ed-c2962cbf603e/scratchpad/prose/`,
harness page at `/home/dreco/dev/slotted/tools/harness/out/prose.html`.

---

## 1. Icons

The family draws no icon and owns none. The bullet and the number beside a list
row are the native `::marker`, kept deliberately: `list-item` draws its own
because its row is a grid and CSS has no `display` that is both `list-item` and
a grid, while an editorial `li` is not a grid — and removing the marker costs
the list semantics Safari drops with it
(<https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html>). The `#`
beside a heading is the consumer's own content, written by
`rehype-autolink-headings`; the family owns its placement, its target size and
its reveal, not its glyph.

**The one change:** the marker's colour was `currentColor`, which made a bullet
as heavy as the text it introduces. It reads `--slotted-text-muted` now — made.

## 2. Motion

One transition: the heading anchor's opacity, on `--slotted-duration-short` with
`--slotted-easing-standard`, so the theme's reduced-motion query collapses it.
Nothing else moves, and nothing loops. Every other state pair in this family is
a change of content rather than of state — a block arriving, a heading being
scrolled to — and animating those is what the streaming rule exists to prevent.

`packages/styles/src/motion.test.mjs` passes: no literal duration, no infinite
animation.

**The one change:** the scroll region's focus ring could transition in like a
control's. It was not made and should not be: a focus indicator that fades is a
focus indicator that is not there yet.

## 3. Responsiveness

`container-type: inline-size` and `container-name: slotted-prose` on the root.
The query restyles descendants only, never the root's own tracks, so one
element is enough where `description-list` needed two. Two literal breakpoints,
because CSS forbids a custom property in a container condition: 34rem steps the
display ratios down, 22rem halves the quotation inset and narrows the list
indent.

Read at 240, 420 and 720 pixels. At 240 nothing overflows the cell: the table
and the fence scroll inside their own boxes, the h1 wraps to two balanced lines,
the four-level list still leaves a column to read in, and the German compound in
the quotation breaks rather than escaping.

**The one change:** the table was squeezed into the column instead of scrolling,
and the inherited `overflow-wrap: anywhere` then broke "Environment" across two
lines. A table inside `data-part='scroll'` now takes `inline-size: max-content`
with a `100%` floor — made, and it is the defect the first capture found.

## 4. Refinement

Read at full size in light, dark and high contrast, plus the focus captures for
the anchor and the scrolling block in both schemes.

The rhythm is one number. The gap above a heading is stated in the heading's own
`em`, so it grows with the level — 48 pixels above an `h2` and 40 above an `h3`
at the default step, which is where Tailwind's six hand-tuned per-level values
land. The gap below a heading is half the flow, so a heading binds to the text
it introduces; two consecutive headings therefore do not collapse into one
block.

Three defects were found by looking rather than by a test, and all three were
fixed:

- the focused anchor was **clipped by the region's own edge**, because it hung
  in a start gutter the page had not given it. It sits on the heading's line
  now, holding its box whether visible or not, with a word joiner before it so
  it wraps with the last word rather than onto a line of its own;
- `blockquote` and `figure` kept the user agent's **forty-pixel inline margin**,
  so a quotation's rule stood a whole indent right of the paragraph above it;
- the fence was **aligned to the right** in a right-to-left document, with its
  check marks trailing.

**The one change:** the gap after the lead was the same as between two ordinary
paragraphs, so the opening did not read as its own movement. It is 1.35 times
the flow now — made.

## 5. Tokens

Every colour, radius, border width, duration, easing and font family is a
foundation token. The family's own literals are two, both recorded with their
reason in the stylesheet and in `contract.json`:

- **the heading ladder** — `2em` down to `0.875em`, through
  `--slotted-prose-h<n>-size`. A heading in editorial content is sized relative
  to the text it introduces; the foundation type scale is a scale of absolute
  control steps that stops at 1.5rem because no control needs more. This is the
  exemption `docs/token-foundation.md` rule 1 grants a family token whose reason
  is written, and it is the one `container` already used for its three page
  widths.
- **the three `flow` steps** — `0.75em`, `1.15em`, `1.6em`, for the same reason:
  block rhythm that did not follow the type would tighten as a reader enlarged
  it.

Three bare tags read another family's token rather than inventing one:
`--slotted-link-color` for `a`, `--slotted-divider-color` for `hr`,
`--slotted-kbd-radius` and its siblings for `kbd`. No selector in this
stylesheet names another family's `data-ui`, which is the rule `accordion` and
`collapsible` set.

`packages/styles/src/tokens.test.mjs` and `fallbacks.test.mjs` pass.

**The one change:** leading was going to be taken per step from the scale, which
pairs 1.45 with the two largest — under the 1.5 SC 1.4.8 asks a paragraph for.
It is stated once, through `--slotted-prose-line-height`, defaulting to
`--slotted-line-height-md` — made.

## 6. Patterns

There is no APG pattern, and the absence is recorded with evidence rather than
left as a silence: `contract.json` names the index
(<https://www.w3.org/WAI/ARIA/apg/patterns/>) and the four sources that govern
in its place — the HTML grouping-content specification, SC 1.4.8, SC 1.4.12 and
the axe rule `scrollable-region-focusable`.

The platform is preferred throughout. The family writes no `role` on the region,
no `role` on a list, no ARIA on a heading. The one role it does write is
`region`, on the scrolling block, and only because that block takes focus:
Adrian Roselli's "Under-Engineered Responsive Tables" is the source, and the
departure from it is stated — he writes `:focus`, this family writes
`:focus-visible`, because a pointer press inside a `tabindex` box focuses it and
a ring drawn then is a ring nobody asked for.

**The one change:** the ring keys on `[data-part='scroll'][tabindex]` rather
than on the part, so it cannot match markup that is not operable. That is
Roselli's own selector trick, and adopting it was the change — made.

## 7. Accessibility

- **The scrolling block.** `role="region"`, `tabindex="0"` and a name, written
  together and only while the block actually overflows, measured by
  `@slotted/core/overflow`. The axe rule makes an unreachable scroller a WCAG
  2.2 level A failure; anything that takes focus then needs a name and a role or
  it fails SC 4.1.2. A block that fits takes none of the three, because a tab
  stop on it is a tab stop that does nothing. Name resolution:
  `labelledBy` → `label` → the provided `scrollLabel`.
- **The heading anchor.** Hidden with `opacity`, never `display: none` or
  `visibility: hidden`, so it stays in the tab sequence and in the accessible
  tree. Revealed on the heading's hover **and** on its own `:focus-visible`.
  Target 24 × 24 CSS pixels — SC 2.5.8.
- **Text spacing.** No fixed `block-size`, no `overflow: hidden` on a text box,
  so a reader's own line height, paragraph spacing, tracking and word spacing
  lose nothing — SC 1.4.12.
- **Forced colours and high contrast.** Read in the `high-contrast` capture:
  the inline code chip and the fence keep a border, which is what still says
  where the code starts once the theme's grounds collapse to one system colour.
  The quotation's rule and the table's rules are borders for the same reason.
- **Direction.** Every rule in logical properties; `logical.test.mjs` passes.
  The fence is the one exception, forced left to right, because the order of the
  characters is what the code means.
- **Reader hears.** Nothing the family invented. Bare tags keep their platform
  semantics, and the family adds no live region — a region that announced every
  appended token would read a whole answer twice.

Both bindings' behavioural tests cover the two operable things: React 14 tests,
Angular 9.

**The one change:** the anchor was reachable but clipped at the region's edge, so
a keyboard reader could focus something they could not see. Moving it onto the
line fixed the focus ring as well as the picture — made.

## 8. Native API

React is React: function components, `render` on every part, native props and
the consumer's own handlers spread through, `ComponentPropsWithRef` as the base
of every props type, `useLayoutEffect`-free render with the measurement in an
effect, and `useImperativeHandle` for the one action a consumer cannot express
declaratively.

Angular is Angular: standalone directives on the consumer's own element,
`input()` and `computed()` throughout, host metadata rather than
`@HostBinding`, `ViewEncapsulation.None` with the one authored stylesheet,
`exportAs` on the region and on the scrolling block, `DestroyRef` releasing the
observer, and `HostAttributeToken` reading a `role` or an `aria-label` the
template wrote before anything is bound over it.

The asymmetry is recorded rather than levelled: Angular reads a
consumer-written attribute through a token React has no equivalent of, so the
React part reads the same two values off its own props and keeps them the same
way.

**The one change:** the React scroll part overwrote a `role` the consumer had
written, where the Angular one kept it. React keeps it now — made, and it is why
the two bindings behave the same rather than merely looking alike.

## 9. Capability

Measured against
`docs/history/designs/2026-09-04-prose-capability-inventory.md`, not against a
scope paragraph — there was none, and the one this work writes into
`docs/process/build-order.md` is derived from the inventory rather than the reverse.

Twenty-six table-stakes rows. Every one is `adopt`, `adapt`, or a `decline`
naming the family that owns it instead — `container` for measure, `checkbox`
plus two lines of the page's own CSS for task lists, `code-block` for
highlighting, `table` for table behaviour, the consumer's renderer for
per-element components, the page for the live region and the renderer for
sanitisation. Six differentiators, ten gaps.

The family holds no mutable value, and the absence is asserted with its reason
in the contract test rather than left to be noticed.

The capability nobody asked for is the scrolling block's conditional wiring:
none of the four surveyed implementations makes a wide table reachable without a
pointer, and this one does it without leaving a useless tab stop behind.

**The one change:** the heading anchor was going to be left to the consumer
entirely. Primer and Nuxt both ship one, its reveal has a keyboard consequence
nobody gets right by accident, and it is now a part — made.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`docs/history/designs/2026-09-04-prose-design.md` sections 12 and 13. Four
lines are `no` with a sentence: the family holds no mutable value, so there is
no controlled/uncontrolled pair, no request carrying a reason, no `model()` and
no `ControlValueAccessor` — a region of rendered text is not a form control and
has no value to write back.

Defaults are set once in both: `ProseDefaultsProvider` in React, an injection
token plus `provideProseDefaults()` in Angular. Both carry `size`, `flow` and
`scrollLabel`, and an explicit value always wins.

**The one change:** `scrollLabel` began as a required prop on the scrolling
part, which a Markdown renderer's component map cannot supply. It is a provided
default with a per-instance override — made, and it is what lets
`components={{ table: ProseScroll }}` work with no arguments.

## 11. Documentation

Two reference pages, each with the import, six anatomy rows, twelve captioned
demonstrations with their source, the input table, the composition surface,
eight accessibility statements and the public tokens.
`specs/reference-pages.test.mjs` and both stories specs pass.

**Not finished, and stated rather than hidden:** the pages have not been read
rendered. Both Storybook servers answer, and both are stale — the React one
cannot see the new `@slotted/styles/prose/prose.css` subpath export, and
`tools/harness/audit.mjs` reports the page rendering no demonstration stage
within fifteen seconds. `docs/build-briefing.md` requires both to be restarted
when a family lands and requires asking first, because a restart interrupts the
other lane in this worktree. The request is at the release gate.

**The one change:** the demonstrations were going to reuse one specimen for
every scene. Three scenes need the same words twice to be comparable — `size`,
`flow` and `lead` — and the rest need their own; the demo module holds the
shared fragments and each scene composes what it needs — made.

---

## Section 18

1. **Purpose, use, anti-use.** The typography of a region the application did
   not author element by element. Anti-use: text the application does author,
   which is `Text` and `Heading`; and sanitisation, which is the renderer's.
2. **Anatomy.** One member, six parts: `root`, `lead`, `anchor`, `scroll`,
   `exclude`, `footnotes`.
3. **Controlled and uncontrolled.** Neither: the family holds no mutable value.
   `size` and `flow` are appearance the consumer states, the scrolling block's
   `tabindex` is a measurement, and the content belongs to the renderer. The
   contract declares no `stateModel` and the test asserts the absence.
4. **State matrix.** `default`, `hover` (a heading, which reveals its anchor)
   and `focus-visible` (the anchor, a link, a summary, the scrolling block).
   `disabled` on an anchor is honoured by the hover rule, which holds itself
   back for it as `states.test.mjs` requires.
5. **Keyboard, focus, ARIA, touch, screen reader.** The keyboard surface is the
   platform's: Tab reaches the anchor, any link in the text, a `summary`, and
   the scrolling block while it overflows. No key is bound, no focus is moved,
   no roving index exists. Touch targets: the anchor holds 24 × 24. Documented
   in both pages' accessibility sections and tested in both bindings.
6. **Recipes.** `size` over the type scale, `flow` over an `em` rhythm, three
   schemes with no second palette. Density is refused with its reason, and the
   two captures are byte-identical in height, which is the evidence.
7. **Responsive, RTL, locale, reduced motion.** Container query at 34rem and
   22rem; logical properties throughout; `:lang()` correction on the tracked
   `h6`, which the Arabic script does not take; one transition, from the motion
   scale.
8. **Loading, empty, error, disabled, extreme content.** No loading and no error
   state: the family draws content that has already arrived, and the region that
   stands in for content that has not is `result-state`. An empty region is zero
   high, because every gap lives on a child. Extreme content is a scene of its
   own: an unbroken 96-character destination, four levels of list, a body
   starting at `h3`, two headings in a row and a right-to-left paragraph.
9. **SSR, performance, virtualisation.** No layout is read during render in
   either binding; the server emits a plain scroller and the wiring appears in
   the first effect after mount, so hydration finds the same DOM. One
   `ResizeObserver` per scrolling block and none anywhere else. Virtualisation
   is not applicable: the consumer owns the tree.
10. **Examples.** Twelve scenes per page, including the family in a real
    composition — inside `Container`, with a real `Link` in the running text —
    and content the family did not choose.
11. **Shared behavioural tests.** React 14, Angular 9, over the same concepts:
    the identifier and every part, the defaults and an explicit value beating
    them, the element and attributes the page wrote surviving, the word joiner,
    and the scrolling block's three-step name resolution and conditional wiring.
12. **Changelog and migration.** A new family; nothing to migrate. The scope
    paragraph lands in `docs/process/build-order.md` in the same commit, as the briefing
    requires of a family whose scope was missing.
