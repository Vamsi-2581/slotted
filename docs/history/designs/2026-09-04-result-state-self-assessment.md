# Result State self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` section 18. The inventory is
`docs/history/designs/2026-09-03-result-state-capability-inventory.md` and the
decisions are in `docs/history/designs/2026-09-03-result-state-design.md`.

Each dimension names the one change that would most improve it and says whether
it was made.

---

## 1. Icons

Seven statuses, seven masks from glyph tokens, painted in the status's own tone
role. Nothing is drawn as a character. Four of the tokens did not exist —
`inbox`, `search-x`, `lock`, `cloud-off` — and were added with their reasons in
`docs/token-foundation.md`; without them five of the seven statuses would draw
the same circle. Under `forced-colors` the mark repaints to `CanvasText`, which
is the one rule the family writes there.

None of the seven glyphs is direction-sensitive, so none is mirrored in RTL,
which the `rtl` capture confirms.

**The change that would most improve it, and whether it was made.** `cloud-off`
was an unclosed path and rendered as an arc rather than a cloud at every size;
`search-x` had a handle too short to read at sixteen pixels. Both were redrawn
after the `statuses` capture at 720 pixels. Made.

## 2. Motion

The family animates nothing, and the absence is the decision. There is one state
pair it can move between — default and `focus-visible` — and a focus indicator
that fades in is a focus indicator that is not there yet. Every other change to
this region is the consumer replacing its content, which the family does not own
and cannot animate honestly. `result-state.styles.test.mjs` asserts that no
`transition` and no `animation` appear, so the absence cannot become an
oversight later.

**The change that would most improve it.** An entry transition, so a region
arriving after a filter runs fades in rather than snapping. Not made, and the
reason is `alert`'s: the family does not own the moment it is inserted, and
`@starting-style` fires on first paint, so every empty state already on a page
would animate at once. Arrival belongs to the consumer's own transition.

## 3. Responsiveness

`container-type: inline-size` with the name `slotted-result-state`, and one
literal breakpoint at `20rem`: the actions stack, and the `inline` row becomes a
column. Read at 240, 420 and 720 pixels in the harness; nothing overflows at 240
and the long German title and the sha256 digest both wrap.

`inline-size: 100%` is stated because the containment makes the intrinsic width
zero, which is the defect `collapsible`, `pagination` and `stepper` shipped.

**The change that would most improve it.** A second breakpoint at `page` reach,
so a route-level region tightens its 4rem block inset on a short viewport. Not
made: block inset answers the viewport's height rather than the box's width, and
a container query cannot see height. It is the consumer's `--slotted-result-state-padding-block`.

## 4. Refinement

Read at 240, 420 and 720 in light, dark and high contrast, plus dense and RTL,
and the focus state photographed in light and dark. Three corrections came from
the pictures rather than from a test:

- The title and the description sat one step of the type scale apart at
  `section` and read as one block of text with a line in bold. The ladder is now
  two steps at every reach — `sm`/`xl`/`3xl` over `xs`/`md`/`lg` — and `page`
  moved from `2xl` to `3xl` so the three reaches read as three scopes.
- At `inline` the mark sat 2.4 pixels above the line it was meant to be centred
  on. `1lh` was being read on the mark, where it resolved against the mark's own
  inherited twelve pixels rather than the title's thirteen. The root now carries
  the title's type, and the mark's box is the title's line box.
- A control taller than a line made the `inline` grid row thirty pixels deep, so
  the mark and the words sat at its top while the control sat in its middle.
  That showed up whenever a message had a title and no description. The row of
  controls is now held to the same line box, and centred in it with
  `align-content` rather than `align-items` — a wrapping flex container aligns
  its lines, not its items, and `align-items` left the control exactly half its
  overhang too low.

Measured after the last of them: `mediaCentre`, `actionsCentre` and
`buttonCentre` are all 1339.45 in the same layout.

**The change that would most improve it.** The `page` mark is 57 pixels with a
stroke baked at 1.8 of a 24 unit box, which reads heavier at that size than the
same mark does at 16. A lighter-stroke variant for large sizes would fix it and
would mean a second glyph scale. Not made, and named here so the cost is a
decision rather than an omission.

## 5. Tokens

Forty-nine custom properties, every one of them declared in
`result-state.tokens.json` and every family token falling back to a foundation
token. No literal outside the documented exemptions.

Two deliberate readings are worth stating. Prose sizes come from the type scale,
which does not vary by density, so density reaches the family through the mark
and through the consumer's own buttons; that is the cost `card` and `alert` both
accepted, and the dense captures are read as a decision rather than as a bug.
And the `page` mark is `calc(var(--slotted-control-height-lg) * 1.5)` — a
proportion of the only size scale the theme restates per density, which is
geometry under Avatar's own rule rather than a sixth step on a scale. It
produces whole pixels at all three densities: 57, 48, 45.

**The change that would most improve it.** A `--slotted-result-state-media-color`
so an application can mute a status's mark without repainting its tone. Not
made: the mark takes `--_tone-text`, which is the pair the theme's contrast test
measures, and a separate colour token would be the first place in this family
where an application could put an unmeasured pair on a measured ground.

## 6. Patterns

The WAI-ARIA Authoring Practices pattern list was read on 3 September 2026 at
<https://www.w3.org/WAI/ARIA/apg/patterns/> and holds no empty, error or result
state. That is recorded rather than glossed: the family has no keyboard model
because it is not a widget, and every control inside it is the consumer's.

| Requirement | Source | Where it is answered |
| --- | --- | --- |
| A region landmark must have a label | APG, Region landmark practice | `aria-labelledby` is written only once a title registers; both bindings and both specs assert the unnamed case leaves it off |
| A status message is programmatically determinable without receiving focus | WCAG 2.2 SC 4.1.3, Understanding | `role="status"` on `content`, default `polite` |
| The `alert` role is for text content, not links or buttons | MDN, `alert` role | `content` holds the title and the description alone; `media`, `actions` and `footer` are its siblings |
| Colour is not the only visual means of conveying information | WCAG 2.2 SC 1.4.1 | seven statuses, seven silhouettes; `forced-colors` repaints the mark to `CanvasText` |
| A change of context is not initiated without request | WCAG 2.2 SC 3.2.x | the family never moves focus; `focus()` is the application's to call |

Keyboard: none, and the reason is above. Focus: the root is `tabindex="-1"`,
reachable and outside the tab sequence.

**The change that would most improve it.** Nothing in the pattern list applies,
so the honest improvement is a screen-reader pass on a real machine. Not made
here, and it is stated at the gate as what this machine cannot verify.

## 7. Accessibility

Name, role, state, focus, forced colours and reduced motion are covered above
and in the eight accessibility statements on each reference page. Two are worth
repeating because they are decisions rather than compliance:

`live` defaults to `polite` where `alert`'s defaults to `off`. An alert may be a
standing notice; a result is the outcome of an operation, and WCAG's own example
of a status message is this family's text.

The mark is `aria-hidden`, and so is any artwork the page projects into it. An
illustration that adds information is not decorative, and what it adds belongs
in the description.

**The change that would most improve it.** A `live="polite"` region that a page
mounts and unmounts repeatedly will announce each time, and a consumer whose
table already sits in their own live region hears the message twice. The opt-out
is `live="off"` and both pages say when to reach for it. A deduplicating
announcer belongs to `packages/core/live-announcer`, which wave 5 delivered and
this family deliberately does not import: the text here is real text in the
document, not an announcement queued from script.

## 8. Native API

React: function components, `useId`, context, `render` on six parts,
`ComponentPropsWithRef` throughout, and `exactOptionalPropertyTypes` respected.
Angular: standalone, `input()` signals, `computed`, `host` metadata,
`ViewEncapsulation.None`, `exportAs`, `inject()`, and `HostAttributeToken` for
both `tabindex` and the title's `id`.

The two are not levelled. Angular gets `provideResultStateDefaults()` and
`exportAs`; React gets `render` and a `ref`. Angular needs no `render` because
the directive is already written on the consumer's element, which is why its
anatomy table names the element differently from React's.

**The change that would most improve it, and whether it was made.** The title
reported its presence rather than its identifier, so a consumer writing `id` on
the title won the React spread and left `aria-labelledby` pointing at an element
that did not exist — the two bindings also disagreed, Angular silently dropping
the consumer's attribute instead. Both now report the identifier that actually
won, and both specs assert it. Made.

## 9. Capability

Measured against the inventory, not against the scope paragraph. Every
table-stakes row is `adopt`, `adapt`, or a `decline`/`defer` that names the
family owning the capability instead: measure to `container`, the frame to
`card`, the loading control to `button`, the loading region to `skeleton`, the
group name to `button-group`, and the per-part class hooks refused because
`data-part` is the public selector this library guarantees.

Seven statuses, three reaches, two alignments, three live values, seven parts, a
defaults provider in both bindings, artwork substitution, and a focus escape
hatch. The scope paragraph asked for "empty and error in one visual family with
distinct semantics"; the family ships seven semantics because Ant ships seven
and Carbon writes five of them down, and two of them — `forbidden` and `offline`
— the guide names explicitly.

The family declares no `stateModel`, and the contract test asserts the absence
together with its reason: the family holds no mutable value, which is also why
Radix, Base UI and React Aria ship no such component at all.

**The change that would most improve it.** A `retry` capability — a request the
family emits, with a reason and a cancel — so a consumer does not wire a button
handler. Not made: it would put the family in the business of owning an
operation it cannot see, and `button` already ships `loading` for the half of it
that is real.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`docs/history/designs/2026-09-03-result-state-design.md`, and every answer is
implemented. The two rows that would otherwise be blank are answered rather than
skipped: there is no controlled/uncontrolled pair and no `ControlValueAccessor`,
because the family holds no value and is not a form control.

An application sets the defaults once in both bindings. A consumer's own handler
runs untouched, because the family binds none. Every state a consumer may style
is in the DOM as `data-status`, `data-reach`, `data-align` and `data-live`.

**The change that would most improve it.** A `provideResultStateDefaults` that
also carried the application's own artwork per status, so a product with an
illustration set wires it once instead of on every region. Not made: the
provider carries axes, and artwork is content — a provider that injected content
would be a second place to look for what a region renders.

## 11. Documentation

Both pages carry the import, the anatomy for all seven parts, ten captioned
demonstrations with curated source, the API table with every declared default,
the composition surface, eight accessibility statements, the public tokens and
the anatomy as it reaches the DOM.

The React page was read rendered at 1280 pixels: the top of the docs page, the
API and composition tables with every code drawer opened, and the `reach`,
`actions` and `composition` stories in `viewMode=story`.
`node tools/harness/audit.mjs` reports no collapsed element and no overflow at
1280 or at 620.

The API tables are 723, 818 and 870 pixels wide inside a 710-pixel box that
scrolls, which is the workbench's own behaviour and not this family's: `alert`
measures 723, 810 and 854 in the same place. The `render` row's applies-to cell
was shortened from six component names to "every part" for the 28 pixels it was
worth.

**The change that would most improve it, and whether it was made.** The Angular
page has not been read rendered. The running Storybook on port 6007 computes its
entry-point aliases once, at startup, so every family created today —
`result-state`, `list`, `list-item` and `description-list` — fails there with
`SyntaxError: Unexpected token 'export'` while rendering correctly on 6006. Not
made, because restarting that server interrupts the other lane. It is the first
thing asked for at the gate.

---

## Section 18: definition of done

1. **Purpose, uses and anti-uses.** The region that replaces content that is not
   there. Not `alert`, which sits beside the content it is about; not
   `inline-message`, which is a line under one control; not `skeleton`, which is
   a region that is still loading.
2. **Anatomy and stable parts.** Seven, listed in the contract and on both
   pages.
3. **Controlled/uncontrolled and events with a reason.** None, and the absence
   is asserted with its reason.
4. **State matrix.** `default` and `focus-visible`. `disabled`, `loading`,
   `invalid`, `selected` and `open` are each refused in the contract test,
   because a region reports rather than accepts.
5. **Keyboard, focus, ARIA, touch, screen reader.** No keyboard model; the root
   is focusable programmatically and outside the tab sequence; the live role is
   on the text alone. Touch is not a factor — the family holds no control of its
   own, and every control inside it is `button`'s, which grows under
   `pointer: coarse`. A screen-reader pass on a real machine is what this
   assessment cannot claim.
6. **Recipes through tokens.** Status, reach and align, all from foundation
   tokens with family-level overrides.
7. **Responsive, RTL, locale, reduced motion.** One container breakpoint;
   logical properties throughout; every string is the consumer's, so there is
   nothing to localise inside the family; nothing animates.
8. **Loading, empty, error, disabled, extreme content.** Empty and error are
   what the family is. Loading is `skeleton`'s and disabled is nothing this
   region can be. Extreme content is the `content` scene: an unbreakable German
   compound and a sha256 digest, at 240 pixels.
9. **SSR, performance, virtualization.** `useId` in React and an
   application-scoped counter in Angular, so server and client identifiers
   match. Nothing reads layout during render. Virtualization does not apply.
10. **Examples, composition, edge cases, theming, context.** Ten scenes each,
    including the two compositions the family defers to and the region inside
    the panel it replaces the contents of.
11. **Behavioural tests shared between bindings.** Fifteen in React, fourteen in
    Angular, asserting the same fourteen facts against the same contract file.
12. **Changelog and migration.** The family is new; nothing migrates to it.
    `empty-state` and `error-state` never existed in this repository, so the
    consolidation the guide's section 17 asks for has no consumer to move.
