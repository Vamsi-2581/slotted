# Build Log

One entry per component, appended as it lands. Written for a reader with no
memory of the session that produced it.

## VisuallyHidden — 2026-08-31

- Decisions: `focusable` joins the shared capability vocabulary rather than
  being left out of the contract. The skip-link variant cannot be assembled by
  a consumer from the plain one, because the reveal has to cancel the same
  declarations that hide it. The stylesheet expresses that as one rule that
  stops matching under `:focus-within`, not as a hiding rule plus an undoing
  rule. The token list is empty on purpose: nothing about clipping is a theme
  decision.
- Decisions: the Angular selector is the bare attribute `[slVisuallyHidden]`,
  the second element-agnostic selector in the library after `slFieldControl`,
  because the element is the consumer's choice. It is a component rather than a
  directive only because a directive carries no `styleUrl`.
- Defects found: `packages/angular/button/src/bundle.styles.test.mjs` asserted
  the bundled-style invariant against one hard-coded entry point, so field and
  tabs were never checked. Generalized to walk every directory holding an
  `ng-package.json` and moved to `packages/angular/src/`.
- Deviations: none.
- Follow-on: Spinner reuses `visually-hidden.css` for its status label instead
  of duplicating the clip technique. An Angular component can list several
  entries in `styleUrls`; React imports both stylesheets. This keeps Spinner
  free of a dependency on the VisuallyHidden component while sharing its one
  authored rule.

## Divider — 2026-08-31

- Decisions: `decorative` joins the shared capability vocabulary. The rendered
  element is `hr`, so the separator role arrives from the platform and the
  component writes only its two departures from it: `role="none"` when the rule
  is decoration, `aria-orientation` when it runs vertically. Tests assert both
  absences, since setting them unconditionally would pass everything else.
- Decisions: the rule is painted with `background-color` on a border-less
  element, not with a border, so one thickness token serves both orientations.
  A vertical rule carries a minimum length, because `block-size: 100%` resolves
  to nothing in a plain block container and the rule would vanish.
- Decisions: the Angular selector is `hr[slDivider]`, element-bound, while
  React reaches other elements through `render`. Conceptual parity, not
  identical APIs.
- Defects found: none.
- Deviations: none.
- Follow-on: the family has no labelled variant — the "OR" rule with text in
  the middle — because `hr` admits no children. If one is wanted it is a
  different element and a second member, not a prop on this one. Menu (T5) will
  need a separator inside a `ul`, where `hr` is not valid content; React can use
  `render`, and Angular will need either a second selector or a `li[slDivider]`
  member. Decide it when Menu is designed.

## Spinner — 2026-08-31

- Decisions: `size` joins the vocabulary as a capability distinct from
  `appearance`. `appearance` obliges a member to document a variant, a fill and
  a size; a spinner has one axis, and claiming the larger capability would have
  meant documenting two props that do not exist.
- Decisions: `decorative` is reused from Divider rather than a second word
  invented for the same removal from the accessibility tree. A vocabulary entry
  earning its second caller is the evidence it was named at the right altitude.
- Decisions: the label is a rendered part carrying the shared
  `slotted-visually-hidden` class, not an `aria-label`. The root is a polite
  live region, and a live region announces the content it gains; an attribute
  is not content, and a string in the template is the one a translation pass
  finds. This is the first family to reach for another family's stylesheet —
  Angular through a second entry in `styleUrls`, React through a second import.
- Decisions: under `prefers-reduced-motion` the ring slows rather than stops. A
  stopped ring still claims a wait is in progress while reporting nothing about
  it.
- Defects found: none.
- Deviations: none.
- Follow-on: the Button family paints its own loading ring with
  `.slotted-button__spinner` and its own `--slotted-button-loading-indicator-*`
  tokens, which now duplicates `spinner.css`. Consolidating means pointing
  Button's default indicator at the spinner stylesheet and retiring those
  tokens from `packages/tokens/src/contract.json`, which is a token-contract
  change and a theme revalidation. It is worth doing and it is not a T1 task;
  take it as its own change with both frameworks in one commit. The class is
  internal, so no public contract moves.

## Link — 2026-08-31

- Decisions: underline is a per-instance axis, not a theme token. The same
  application under one theme wants an underline in prose and none in a
  sidebar, so a token could not express it. `always` is the default because
  colour alone does not mark a link for a reader who cannot see the difference.
- Decisions: the underline returns under `forced-colors: active` whatever the
  axis says. The palette flattens the contrast a bare link relies on, and the
  axis is a stylistic preference that must not survive into a mode chosen for
  legibility.
- Decisions: `external` sets `target`, `rel` and a hidden warning, all three
  yielding to values the consumer passed. The warning's wording is a prop with
  a contract-declared default, so it is translatable and so the two frameworks
  cannot drift to different sentences.
- Defects found: none.
- Deviations: the external hint's leading space lives inside the string, not as
  a template text node. Accessible name computation concatenates adjacent
  alternatives without a separator, and Angular strips a whitespace-only text
  node before it reaches the DOM. The React tests assert the rendered text
  rather than the computed name's spacing: `dom-accessibility-api` trims each
  alternative, so asserting spacing there would test the test library.
- Follow-on: Breadcrumb, Sidebar and EmptyState all consume this family.
  Breadcrumb will want `underline="hover"` throughout; if a third caller wants
  the same, consider whether the default belongs to a context rather than a
  prop. Angular snippets must stay under roughly 70 characters on one line —
  Prettier's angular printer breaks a longer element onto a hanging `>` even
  well inside printWidth 100, and the snippet format test then fails.

## Badge — 2026-08-31

- Decisions: the variant axis is asserted equal to the button family's rather
  than retyped, so the two cannot drift into naming the same five tones
  differently.
- Decisions: the fill axis is `solid` and `outline` only. A `subtle` fill needs
  a resting tint and the theme has none — it has `--slotted-tone-*-subtle-hover`
  and `-subtle-active`, which are interaction states and would be a lie at rest.
  Extending the token contract for a single caller is the mistake the
  core-module rule exists to prevent.
- Decisions: `appearance` covers all three axes, which obliged the family to
  have a size axis. `sm` and `md` are real: a badge in a table row and a badge
  beside a heading are not the same size.
- Decisions: no role, on either side. What a badge means comes from where it
  sits. The reference pages carry the consequence — a bare count needs an
  accessible name from the consumer.
- Defects found: `button.css` set `min-height` three times, breaking the
  logical-properties rule that had never been written as a test. The per-family
  checks added earlier tonight searched for the substring `height:`, which
  `line-height` contains, so they could not have found it. Replaced by one
  `packages/styles/src/logical.test.mjs` that walks every stylesheet, matches at
  a token boundary, and names the logical counterpart in the failure.
- Deviations: none.
- Follow-on: Tag and Alert (T2) both want a subtle fill. When the second of them
  arrives, add `--slotted-tone-*-subtle` to `packages/tokens/src/contract.json`
  and both schemes of the default theme, then give Badge, Tag and Alert the
  third fill in one change.

## Avatar — 2026-08-31

- Decisions: three members, not one component with `src` and `initials` props.
  The fallback is arbitrary content — initials, an icon, a company mark — and
  the consumer owns it.
- Decisions: `loaded` joins the state vocabulary as one boolean on the root.
  Pending and failed are the same situation for everything that reads the
  state, so a three-valued attribute would have added a distinction nothing
  acts on, and invariant 5 forbids a single-valued `data-state` anyway.
- Decisions: both parts are always rendered and the stylesheet removes one with
  `display: none`. Conditional rendering would have put the decision in two
  different places in the two frameworks, and Angular cannot project content
  inside a control-flow block without a wrapper. `display: none` also keeps the
  picture and the initials from ever both reaching the accessibility tree.
- Decisions: no shape axis. Whether avatars are round is a brand decision taken
  once per application, so it is `--slotted-avatar-radius`.
- Decisions: the image reports through a callback ref (React) and
  `ngAfterViewInit` (Angular) as well as through the load event. A picture
  already in cache finishes before the listener is attached; without the check,
  every page after the first shows initials over a picture that is already
  there. Both suites assert it by replacing the `complete` and `naturalWidth`
  getters on `HTMLImageElement.prototype`.
- Defects found: none.
- Deviations: none.
- Follow-on: an avatar group — overlapping avatars with a "+7" overflow — is a
  separate family, not a prop here. It needs a stacking direction and a
  z-ordering rule, neither of which belongs on a single avatar.

## Skeleton — 2026-08-31

- Decisions: `shape` joins the vocabulary, distinct from `size`. A text
  placeholder takes a line's height and the width available, a circle takes an
  aspect ratio, a rectangle takes what the consumer gives it — three
  relationships to the surrounding layout, not three points on one scale.
- Decisions: `aria-hidden="true"` by default, with `aria-hidden="false"` as the
  explicit escape hatch on both sides. Announcing the wait belongs to the
  region the placeholders fill, through `aria-busy`.
- Decisions: the animation pulses opacity. A gradient sweep needs a second,
  lighter colour that the theme does not own, and inventing that token to serve
  an effect is backwards.
- Decisions: under reduced motion the animation stops outright, where Spinner's
  only slows. A spinner reports through motion and says nothing once still; a
  skeleton reports through shape, which does not move.
- Defects found: none.
- Deviations: none.
- Follow-on: React's `render` prop takes an `undefined`-valued prop as absent,
  so "pass undefined to remove the default" cannot work as an API. Any later
  component with a defaulted ARIA attribute should use an explicit value as its
  escape hatch, as this one does.

## Kbd — 2026-08-31

- Decisions: one key per element. A combination is several elements with a
  separator the consumer writes, because the separator is text in their
  language and the order of modifiers differs between platforms — a component
  rendering "Ctrl+K" from a string would have to decide both.
- Decisions: each size reads one token for both the minimum block size and the
  minimum inline size, so a single key is square whatever the type size is. The
  style test asserts the two read the same token, not that they happen to hold
  equal values today.
- Decisions: the reference pages say where a shortcut is actually announced —
  `aria-keyshortcuts` on the control that responds to it. The printed key is a
  picture of the shortcut and announces nothing.
- Defects found: none.
- Deviations: React and Angular landed in one commit rather than two. The family
  has no behaviour to speak of, and splitting it would have left the library
  inconsistent between commits for no gain.
- Follow-on: Command (T7) and Tooltip (T5) print shortcuts. If either needs a
  combination rendered from data rather than written out, the separator and the
  platform-dependent modifier order are the two questions to answer first.

## ProgressBar — 2026-08-31

- Decisions: a div with `role="progressbar"`, not the native `progress`. A
  native progress bar can only be painted through engine-specific
  pseudo-elements (`::-webkit-progress-value`, `::-moz-progress-bar`) that sit
  outside the CSS specification and cannot be written once for both engines,
  and one authored stylesheet is the library's rule.
- Decisions: `measurement` joins the capability vocabulary and `indeterminate`
  joins the state vocabulary. Checkbox in T3 needs the same state word for the
  same meaning — a value that exists but cannot be given.
- Decisions: the root is the track. A separate track part would be a second
  element that adds a name and nothing else.
- Decisions: a value outside the range is clamped, and the clamped value is
  what `aria-valuenow` reports, so the announcement and the painted bar cannot
  disagree. Progress is usually computed from numbers the application does not
  fully control.
- Decisions: a missing accessible name is a `console.warn` in development, not
  a throw. IconButton throws because a nameless icon button is unusable; a
  nameless progress bar still reports visually, and taking down a screen
  mid-upload is worse than the defect.
- Decisions: the indeterminate bar travels by animating `inset-inline-start`,
  so it runs the way the document reads. A translation runs the same way in
  both directions, which is wrong in one of them.
- Defects found: every family's token check was a copy of one pattern anchored
  directly to the token name, so it missed any `var(` Prettier had wrapped —
  the longest declarations, exactly. `skeleton.tokens.json` was short one entry,
  and nothing could notice, because the generator and the assertion shared the
  flaw. Replaced by `packages/styles/src/tokens.test.mjs`, one test over every
  family, which also fails a family shipping a stylesheet with no token list.
- Deviations: none.
- Follow-on: LoadingBar and Stepper (T2) and FileUpload (T2) build on this.
  LoadingBar is the page-level case and will want to sit fixed at the top of the
  viewport; that is a positioning decision, not a new measurement.

## DescriptionList — 2026-08-31

- Decisions: `orientation` is reused rather than a `layout` word invented for
  the same idea. The axis a term and its details are arranged along is an
  orientation. `vertical` is the default because a stacked pair survives a
  narrow column and a two-column one does not.
- Decisions: in the horizontal arrangement each part is pinned to a grid
  column. One term followed by several `dd` elements is valid HTML, and under
  auto-placement the second value takes the next term's cell and shears the
  rest of the list. Both Storybooks show that case.
- Decisions: no role anywhere. `dl`, `dt` and `dd` carry the pairing, and the
  tests assert each absence.
- Defects found: none.
- Deviations: none.
- Follow-on: the layout requires `dt` and `dd` as direct children of the `dl`.
  A wrapping `div` per pair is valid HTML and would fall out of the grid;
  `display: contents` on such a wrapper would fix the layout, and it is not
  added speculatively. If a consumer reports it, that is the one-line answer.

## Splitter — 2026-08-31

- Design: `docs/superpowers/specs/2026-08-31-splitter-design.md`. The only T1
  component with real interaction, and the only one that needed a document.
- Decisions: two panes, one separator. N panes need a policy for which
  neighbour absorbs a constraint violation, and no two libraries choose the
  same one; three regions are two nested splitters, which both Storybooks show.
- Decisions: `orientation` describes the panes and `aria-orientation` describes
  the separator, and they are perpendicular. `horizontal` is the ARIA
  attribute's own default, so it is written only for side-by-side panes.
- Decisions: the position is the first grid track's size, written inline. The
  rejected alternative was a custom property read into `flex-basis` on
  `:first-child`, which makes DOM order load-bearing and relies on the one part
  of the style-binding API whose support differs between the frameworks.
- Decisions: no `@slotted/core` module. A rectangle, a fraction and a clamp are
  four lines that read better where they are used, and a module extracted here
  would have its signature fixed by one caller with no second to confirm it.
- Decisions: the arrow pair along the separator is ignored, so a scrollable
  pane still scrolls. Both suites assert the absence.
- Defects found: the design document said the handle would set `aria-controls`
  at the pane it resizes. Implementing it means the root identifying which
  projected child is the first pane — child inspection or a mount-order
  registry in React, a content query in Angular — for an attribute the
  `separator` role does not require, and the registry misbehaves under a
  double-invoked render. Corrected in the same commit as the React
  implementation; the consumer passes it and the pages show that.
- Deviations: the React implementation was written before its tests. The
  design document had settled the behaviour and the component is large; the
  tests were written immediately after and both frameworks assert the same
  seventeen behaviours. Angular followed the usual order.
- Follow-on: T1 is complete. The next tier begins with Card, Tag, Alert,
  Collapsible and Breadcrumb. Tag and Alert both want the subtle fill Badge
  deferred, so that is the point to add `--slotted-tone-*-subtle` to the token
  contract and both schemes of the default theme, and to give Badge, Tag and
  Alert the third fill in one change.

## Tone surface, Badge subtle fill — 2026-08-31

- Decisions: `--slotted-tone-<tone>-surface` is a new role, not another step on
  the `subtle-hover` / `subtle-active` ladder. Those two are what a transparent
  control becomes on interaction; using one as a resting fill would make the
  name a lie and leave an interactive component nowhere to move on hover. The
  defaults reuse palette steps the theme already names, so the change adds no
  colour decisions.
- Decisions: the rejected alternative was shifting `subtle-hover` and
  `subtle-active` up a step to make room, which changes how the shipped Button
  family looks for a reason no consumer asked for.
- Decisions: Badge's third fill landed across contract, stylesheet, both
  frameworks and both reference pages in one commit, because a public axis
  gained a value and no commit may leave the frameworks disagreeing.

## Card — 2026-08-31

- Decisions: no axes at all. Every difference between one card and another in
  an application is a token decision, and a variant prop would be the library
  guessing which differences matter.
- Decisions: transparent surface with a border. The theme owns no neutral
  surface colour and adding one to serve a single component is backwards;
  `--slotted-card-background` fills a card when a theme wants that.
- Decisions: a region at either end takes the padding its missing neighbour
  would have carried, so a card of only a body is not visibly tighter than a
  full one. Asserted, because that is the case a three-region layout usually
  gets wrong.
- Deviations: the Angular card stories import Badge and Divider by relative
  path across entry points. Stories are not reachable from any `public-api.ts`,
  so this is not a runtime dependency and ng-packagr builds unchanged. Keeping
  the two Storybooks scenario for scenario is worth more than an import purity
  no check measures.

## Tag — 2026-08-31

- Decisions: two members — the value and the control that removes it. The
  appearance axes are asserted equal to Badge's rather than retyped.
- Decisions: selection is absent. A selectable tag is a toggle, and the button
  family already owns that behaviour.
- Decisions: the cross on the remove control is drawn in CSS, so neither
  framework ships a glyph and the two cannot drift. The bars are centred with
  `inset: 0; margin: auto`, which is symmetric in either reading direction — a
  logical inset plus a physical percentage translation is not.
- Decisions: the hover and press washes mix `currentColor`, so they lighten a
  solid tag and darken a subtle one without a token per case.
- Defects found: none.
- Follow-on: the library now has two answers for a missing accessible name.
  IconButton throws; ProgressBar, SplitterHandle and TagRemove warn. The rule
  that fits the evidence is: throw when the component cannot do its job without
  the name, warn when it still does its job and only the announcement suffers.
  Worth writing down as a policy the next component can follow rather than
  rediscover.

## Alert — 2026-08-31

- Decisions: `live` joins the capability vocabulary — `off` sets no role,
  `polite` sets `role="status"`, `assertive` sets `role="alert"`. Whether a
  message interrupts is the one thing the library cannot infer, and `off` is
  the default because most alerts are on the page before anyone reads it.
- Decisions: the four regions are placed by grid area, not source order, so a
  message with no title or no icon collapses that track instead of shifting
  everything else. The icon spans both rows.
- Decisions: only the solid fill takes the tone as its text colour. Tone-
  coloured body text on a tinted surface is harder to read, and the surface and
  the icon already carry the tone.
- Decisions: the icon is `aria-hidden` by default, with the explicit
  `aria-hidden="false"` escape hatch Skeleton established.
- Defects found: none.
- Deviations: a shell heredoc generating the Angular part directives produced
  `selector: ''` — zsh reads `$el[...]` as an array subscript. Caught by the
  Angular compiler before the commit; the files are now generated from Python.
- Follow-on: Alert has no dismiss member. Dismissal is a button the consumer
  puts in `alertActions`, and the focus that button leaves behind is an
  application decision. Revisit if Toast (T4) needs the same affordance, which
  would be its second caller.

## Breadcrumb — 2026-08-31

- Decisions: no separator member. A slash between crumbs is decoration a screen
  reader should not read, so the stylesheet draws it from a token on every item
  after the first. The contract records `separator: "stylesheet"` so the
  absence reads as a decision.
- Decisions: `current` joins both vocabularies — the capability and the
  `data-current` state. The current crumb keeps its href and carries
  `aria-current="page"`, as the Authoring Practices example does; dropping the
  link would take it out of the tab order and out of the enumerable links.
- Decisions: the nav takes a default name of "Breadcrumb", which steps aside
  when the consumer passes `aria-labelledby`. Two unnamed navigation landmarks
  give a screen reader two identical entries.
- Defects found: the separator's colour originally fell back to `GrayText`,
  which the fallbacks test forbids in a decorative pseudo-element. Removed: with
  no theme the declaration is invalid and the separator takes the colour around
  it, which is what decoration should do.

## Collapsible — 2026-08-31

- Decisions: `details` and `summary`, not a button and a div. The disclosure
  role, the expanded state, Enter and Space, and find-in-page reaching text
  inside a closed region all come from the platform. The costs are real and
  recorded: `details` does not animate its own height, and the trigger must be
  the first child.
- Decisions: the state is read from the platform's `open` attribute, recorded
  as `openAttribute`, rather than duplicated as a `data-expanded` that nothing
  would keep in step.
- Decisions: a controlled React Collapsible is put back where the consumer says
  it is. A `details` opens itself and React re-renders nothing when the consumer
  ignores the change, so without the reassignment "controlled" would have meant
  "notified". Angular's `model` writes the change back instead, which is the
  same guarantee reached the framework's own way.
- Defects found: none.
- Deviations: Angular's `model()` accepts no `transform`, unlike `input()`, so
  `open` is a plain boolean model. Worth remembering for every later component
  with a two-way boolean.
- Follow-on: Accordion (T3) is a group of these. `<details name="...">` gives
  exclusive opening natively and would mean Accordion adds a name and nothing
  else; check the support floor when it is planned.

## core/measure, LoadingBar — 2026-08-31

- Decisions: `@slotted/core/measure` is written now because three callers wanted
  the same arithmetic. ProgressBar wrote it inline, Splitter wrote a second
  copy, and LoadingBar would have been the third; the rule that a core module
  stays malleable until a second caller confirms it had been satisfied twice
  over. It is arithmetic only — no DOM, no framework, no state — so "a value
  outside the range is clamped, not rejected" means one thing library-wide.
  ProgressBar and Splitter were refactored onto it with every behaviour test
  unchanged.
- Decisions: LoadingBar's contract asserts what it shares with ProgressBar by
  reading that contract — role, minimum, parts, indeterminate state — rather
  than repeating it. `placement` is the only real difference and joins the
  vocabulary.
- Decisions: `value` defaults to null, so a LoadingBar is indeterminate unless
  told otherwise. A page-level bar usually does not know how much is left, and
  defaulting to zero would report a position nobody claimed.
- Decisions: the track is transparent where ProgressBar's is painted. A
  page-level bar on a permanent grey band reads as a rule under the header.
- Defects found: the Angular LoadingBar reference page carried a `tsx` snippet
  showing React code. Every check passed — the snippet formatter parsed it
  happily, because it was valid TSX. Added `pnpm test:docs`
  (`scripts/verify-docs-snippets.test.mjs`), which walks every reference page in
  both packages and fails a snippet whose language or id belongs to the other
  framework. It runs inside `pnpm check`.
- Deviations: none.
- Follow-on: FileUpload and Stepper both report progress and can now take the
  same measurement from core/measure rather than a fourth inline copy.

## Stepper — 2026-08-31

- Decisions: where a step sits is an axis with three values, not two booleans.
  `upcoming`, `current` and `complete` are mutually exclusive, and a pair of
  flags would admit a step that is both. Invariant 5 forbids a single-valued
  `data-state`, and this is not one: `data-status` is an appearance axis like
  `data-fill`, chosen from a closed set the contract names.
- Decisions: the current step is marked by a thicker ring as well as a tone, so
  it is not colour alone; the style test asserts the ring rather than the tone.
- Decisions: the marker is `aria-hidden`. It repeats what the label and
  `aria-current` already say.
- Decisions: the connector has no member and is drawn by the stylesheet, as the
  breadcrumb separator is.
- Defects found: none.
- Deviations: none.

## Pagination — 2026-08-31

- Decisions: a `ul`, where Breadcrumb and Stepper use `ol`. The pages are
  siblings a reader may visit in any order; numbering them twice tells a screen
  reader nothing. Recorded as `listReason` so the difference reads as a
  decision rather than an inconsistency.
- Decisions: a page control is a button by default and an anchor through
  `render` (React) or by putting the attribute on an anchor (Angular). A page
  with an address should be a link — bookmarking page four and opening page five
  in a new tab are things a button cannot do.
- Decisions: Angular binds the native `disabled` attribute only when the element
  is a button, because an anchor cannot carry one and writing it there would be
  a lie nothing acts on. A test asserts the absence.
- Decisions: the previous and next controls at the ends are disabled rather than
  removed, so the row does not change length as the reader moves through it.
- Defects found: none.
- Follow-on: Toolbar, VirtualList and FileUpload are what remain in T2. Toolbar
  needs `core/focus`, which already exists from Tabs and will get its second
  caller there — the point at which its signature stops being provisional.

## Toolbar — 2026-08-31

- Decisions: no item member. A toolbar groups controls the consumer already
  has, and asking each to be wrapped would put a component between the consumer
  and the control they meant to use. The toolbar finds its focusable children;
  the contract records `items: "focusable-children"`.
- Decisions: this is the second caller of `core/focus`. Its `itemSelector` was
  designed against Tabs, where the items are elements the family renders
  itself; here they are elements it has never seen, and the signature took that
  unchanged. That is the confirmation the core rule asks for, and
  `createRovingTabindex` can now be treated as settled.
- Decisions: a MutationObserver refreshes the tab stop as the consumer's
  controls come and go. Without it a control added after mount keeps its own tab
  stop and the single-Tab promise quietly becomes two. Both suites assert it.
- Decisions: the item selector matches disabled controls. The core skips them
  when moving, and excluding them would renumber the others whenever one was
  disabled.
- Defects found: none.
- Deviations: none.
- Follow-on: VirtualList and FileUpload are what remain in T2. VirtualList needs
  `core/collection`, which does not exist yet and will be written against it.

## VirtualList — 2026-08-31

- Decisions: uniform `itemSize` rather than measured heights. Measured heights
  need a per-row size cache, an observer per row, a prefix-sum offset table and
  a scroll-anchoring policy — and the last of those is a product decision, not
  an implementation detail. Uniform rows make an index and an offset the same
  number in both directions. `docs/superpowers/specs/2026-08-31-virtual-list-design.md`
  records the full argument.
- Decisions: the root is the scroll container, so the component never has to
  find, observe and position itself inside an element it does not own.
- Decisions: the full length reaches assistive technology through `aria-setsize`
  and `aria-posinset` on the rendered rows. A screen reader that counts DOM rows
  announces a false number, not a degraded one. The canvas between the list and
  its rows is `role="none"` so the rows stay owned by the list.
- Decisions: the root carries `tabindex="0"` and the family binds no keys at
  all. A scrollable region with nothing focusable in it cannot be scrolled from
  the keyboard, and a focused scroll container already answers the arrows, the
  Page keys, Home and End better than a reimplementation would. Listbox is where
  selection and roving focus arrive.
- Decisions: `core/collection` exports one function, `virtualWindow`, returning
  the window, its offset and the canvas size together. Given four numbers a
  caller derives three and takes one, and that derivation is where the window
  and the scrollbar drift apart. Its signature stays provisional until Listbox
  and Calendar confirm it, as `core/measure` did.
- Decisions: an unmeasured viewport is nought, which is what a server render and
  the first client render both see, so hydration is quiet. `overscan` applies
  regardless of viewport size, so that first window holds four rows rather than
  none. Neither is a branch in `virtualWindow`; both fall out of its clamps.
- Decisions: the row is placed with `inset-block-start`, not `translateY`.
  A translation moves along the physical axis, which is the wrong one in a
  vertical writing mode.
- Decisions: `overflow: auto` rather than the logical `overflow-block`. The
  axis-neutral form needs no right-to-left counterpart and leaves a row wider
  than the list reachable instead of clipped. The design document said
  `overflow-block` before the sheet existed and was corrected with it.
- Decisions: one new shared vocabulary entry, `virtualization`, obliging a
  reference page to document `itemCount`, `itemSize` and `overscan`.
- Defects found: an uncommitted, complete and tested change was sitting in the
  working tree at session start — the two Storybook managers moved onto the
  workbench neutral ramp. It was committed first, before anything else was
  touched.
- Defects found: §5.3 of `docs/autonomous-build-prompt.md` gives a token-list
  generator whose regexp is `var\((--slotted-…)`, missing the `\s*` that
  `packages/styles/src/tokens.test.mjs` allows for. Prettier inserts that space
  whenever a declaration wraps, so the snippet under-reports exactly the tokens
  in the longest declarations — the failure the tokens test's own comment
  describes. Corrected in the prompt.
- Deviations: none.
- Follow-on: FileUpload is all that remains of T2.
- Follow-on: the family is block-axis only. A horizontal virtual list is the
  same arithmetic on the other axis and was left out rather than half-built.
- Follow-on: React types the story args by giving `meta.args` a default row
  renderer, because `children` is a required function prop and Storybook cannot
  see that `render` supplies it. Any later family with a required render prop
  will meet the same thing.

## FileUpload — 2026-08-31

- Decisions: the dropzone is a `<label>` and the `<input type="file">` sits
  inside it. That answers the accessible-name question the catalog raised with
  no generated id and no click handler: a label names the control it contains
  and activates it. The alternatives were a div with `role="button"`, which
  means reimplementing Enter, Space, the picker, form association and
  `:disabled`, and an `aria-labelledby` pairing, which needs an id generator
  React and Angular solve differently in exchange for what a label already does.
  `docs/superpowers/specs/2026-08-31-file-upload-design.md` records the rest.
- Decisions: the input is hidden with the clip technique. `display: none` and
  `visibility: hidden` remove it from the tab order and the accessibility tree,
  which is exactly what the label pairing exists to prevent. A style test
  refuses both by name.
- Decisions: the focus ring is on the region, via `:has(:focus-visible)`. The
  focused element is a one-pixel invisible input.
- Decisions: the drag tracker counts enters rather than trusting leaves.
  `dragleave` fires when the pointer crosses a child, and clearing there makes
  the highlight flicker across the whole zone. Both suites assert the
  child-crossing case. `dragover` is cancelled on every event, without which
  the browser refuses the drop and navigates to the file instead.
- Decisions: the component validates `accept` and `maxSize` itself. The
  attribute filters the picker's dialog and constrains a drop not at all, so
  without a check the component would accept by drop what it refuses by picker.
- Decisions: refused files are reported, not dropped and not thrown, with one
  of three reasons. `multiple` is one of them: a single-file upload handed three
  files refuses two and says so rather than truncating.
- Decisions: no `progress` prop. The library never uploads, so it has no
  progress of its own; the row is an `li` and a consumer who has the number
  composes a ProgressBar into it. That is what the catalog's ProgressBar
  dependency amounts to.
- Decisions: the list is `aria-live="polite"`. A drop is otherwise silent.
- Decisions: `core/files` carries the accept matcher and the rejection policy.
  The test applied was not "will a second component call it" but "must both
  frameworks answer identically" — a drift between two copies of a three-form
  parser is drop and picker disagreeing in one framework and not the other.
  `clampPosition` stays duplicated because four lines cannot drift.
- Defects found: the catalog's core-module table listed no module for
  FileUpload. Corrected in the same commit as the design document, with the
  reasoning above.
- Deviations: none.
- Follow-on: T2 is complete. T3 begins with the form controls, and Listbox and
  Calendar are the callers that will confirm or change `core/collection`.
- Follow-on: nothing is de-duplicated. Whether two files are the same file is a
  question about name, size, modification time or content, and the answer
  differs by application, so it is left to the consumer.
- Follow-on: `FileRestrictions` in core spells each optional field
  `| undefined`, because under `exactOptionalPropertyTypes` a caller cannot
  otherwise forward an optional prop as `{ maxSize: props.maxSize }`. Any core
  interface a component forwards props into needs the same.

## Input — 2026-08-31

- Decisions: a control this library ships reads the field itself, so
  `<Input />` and `<input slInput>` are wired with nothing else written.
  `fieldControl` stays, but only for controls the library has never seen. The
  Angular alternative — `<input slInput slFieldControl>` — needs no dependency
  between entry points and was rejected because forgetting the second directive
  leaves a label whose `for` resolves to nothing.
  `docs/superpowers/specs/2026-08-31-field-aware-controls-design.md` carries the
  argument, and it applies to the whole of T3, not only to Input.
- Decisions: every state a control shares with its field is `undefined` by
  default, not `false`. Unset defers to the field; set wins over it in both
  directions. Both suites assert an explicitly enabled input inside a disabled
  field.
- Decisions: the resolved state is mirrored onto the control's own element, so
  the stylesheet is one class-and-attribute selector and an input outside a
  field looks the same as one inside it. A style test refuses any mention of
  `.slotted-field` in the sheet.
- Decisions: `data-required` is not mirrored. The required marker belongs to the
  label the field already draws, and an attribute that paints nothing is an
  attribute nothing reads. `aria-required` is still set.
- Decisions: the invalid rule is written after the hover rule and a test asserts
  that order, so a field reporting an error keeps looking wrong while the
  pointer is over it.
- Decisions: `size` shadows the native `size` attribute of a text input, which
  sets a width in characters. Every family in this library names its scale
  `size`, and the vocabulary is worth more than a rarely-used native attribute.
- Decisions: `@slotted/angular/input` is the package's first entry point to
  depend on another. It imports `SlField` by the published path, never
  relatively — ng-packagr refuses the relative form, and the refusal is the
  useful kind, because a build that duplicated the class would produce two
  injection tokens and fail silently. `packages/angular/src/bundle.boundaries.test.mjs`
  states that against the built bundles.
- Decisions: no equivalent test for React. Rollup deduplicates a shared module
  into one chunk by construction — the build was checked and `input.js` and
  `field.js` do import the same `field-context` chunk — and a test of that
  would be a test of Rollup.
- Defects found: the design document claimed the Angular path mapping was
  deliberately kept out of ng-packagr's `tsconfig.lib.json`. The root typecheck
  spans every package, so the mapping has to be in `tsconfig.base.json`, which
  `tsconfig.lib.json` extends. Measured rather than assumed: ng-packagr resolves
  entry points before the inherited paths apply, and a build from a clean `dist`
  still emits one `SlField`. The document was corrected in the same commit.
- Defects found: none in shipped code.
- Deviations: the Angular Storybook was built once here rather than at the end
  of the batch, because the Vite alias that resolves `@slotted/angular/*` is new
  infrastructure and no other gate exercises it. It builds.
- Follow-on: leading and trailing adornments — an icon inside the control, a
  unit after it — are deliberately absent. They are a layout problem with their
  own answers about click targets and padding.
- Follow-on: `Textarea`, `Switch` and `Fieldset` complete this batch and follow
  the same mechanism. None of them needs a design document.

## Textarea, Switch, Fieldset — 2026-08-31

Three components, taken together because they share one batch and one set of
decisions with `Input`.

- Decisions (Textarea): auto-sizing is `field-sizing: content` and nothing
  else. The classic implementation — reset the height, read `scrollHeight`,
  write the height — runs on every keystroke, thrashes layout, and needs its
  own answers for paste and programmatic change. `rows` stays the floor and is
  recorded in the contract as such, so a browser without the property shows a
  smaller box rather than a broken one. The caveat is stated on the reference
  page rather than hidden.
- Decisions (Textarea): the resize handle is withdrawn while auto-sizing and
  while disabled. A control that resizes itself and a handle that fixes its
  size disagree on the next keystroke.
- Decisions (Switch): drawn on a `<button>` reporting `aria-checked`, not on an
  `<input type="checkbox">`. Drawing a track and a thumb on a checkbox needs
  pseudo-elements on a replaced element, which no specification promises. The
  cost is that the control does not submit with a form; the reference pages say
  so and tell the consumer to add a hidden input.
- Decisions (Switch): no read-only state, and the contract says `unsupported`
  rather than leaving it unmentioned. Simulating one by swallowing clicks
  produces a control that looks operable and is not.
- Decisions (Switch): the thumb travels by `margin-inline-start: auto` rather
  than a translation, so the travel is whatever the track has left. A theme
  changing the padding or the thumb size cannot push it outside the track, and
  right-to-left needs no second rule.
- Decisions (Fieldset): native `<fieldset>` and `<legend>`, and no ARIA at all.
  `disabled` sets the native attribute and stops there — the platform disables
  every control inside, including ones this library has never seen.
- Decisions (Fieldset): `invalid` marks the group and colours its legend and
  reaches into no control. Which field is at fault is the field's own to say.
- Decisions (Fieldset): the stylesheet resets the border, margin, padding and
  the `min-inline-size: min-content` a `<fieldset>` carries, and puts the
  `<legend>` back into the flex layout the browser floats it out of. Both are
  pinned by tests, because both look arbitrary to anyone who has not hit them.
- Defects found: Input, Textarea and Switch keyed their disabled appearance on
  `data-disabled` alone. A disabled `<fieldset>` disables every control inside
  it and never tells them, so such a control was entirely inert and looked
  entirely operable. Each sheet now matches `:disabled` alongside the attribute
  and holds its hover rule back for it, and a test in each family states the
  pairing. Fixed in its own commit, before Fieldset was implemented.
- Defects found: two of the assertions written for this batch were wrong rather
  than the code. `toBeRequired()` counts `aria-required`, so it cannot express
  "not natively required"; the native attribute is now asserted directly. And
  `input.disabled` reflects the control's own attribute and stays `false`
  inside a disabled fieldset, by specification — what changes is that the
  control matches `:disabled`. Both suites now assert that, which is also the
  property the stylesheet fix rests on.
- Deviations: none.
- Follow-on: `Checkbox` and `RadioGroup` inherit the `checked` state this batch
  added to the shared vocabulary. Both will have to answer the pseudo-element
  question Switch avoided, because a checkmark has to be drawn on something.
- Follow-on: `size` on Input and Textarea shadows the native `size` attribute
  of a text input. Every family here names its scale `size`, and the vocabulary
  is worth more than a rarely-used native attribute, but a consumer who wants
  the native one cannot reach it in React.

## Token foundation — 2026-08-31

- Decisions: added the space, radius, type size, line-height, font-weight,
  motion, shadow, stacking, control-geometry, and intrinsic-glyph scales to
  the token contract and default theme in lockstep.
- Decisions: `packages/tokens/test/resolve.test.mjs` resolves token references
  and holds the pre-scale values of existing tokens, so scale aliases are
  value-preserving rather than merely claimed to be.
- Decisions: only the four motion-scale duration tokens collapse to `1ms` under
  `prefers-reduced-motion`; existing
  family-specific durations are not automatically covered until their family is
  refined. Intrinsic glyph data URIs are mask sources rather than character
  icons.
- Boundaries: no component stylesheet consumes these scales yet, except Task
  6's Button token-name correction. Family-by-family scale consumption is
  later visual work.
- Defects found: none.
- Deviations: none.

## Where the queue stands — 2026-08-31

**T1 and T2 are complete.** Button, Field and Tabs were already shipped. T1
added Link, VisuallyHidden, Divider, Spinner, ProgressBar, Badge, Avatar,
Skeleton, Kbd, DescriptionList and Splitter. T2 added Card, Tag, Alert,
Collapsible, Breadcrumb, Pagination, Stepper, LoadingBar, Toolbar, VirtualList
and FileUpload.

**T3 is four of thirteen.** `Input`, `Textarea`, `Switch` and `Fieldset` have
landed as one batch, and the mechanism every remaining field-aware control
follows is settled and written down in
`docs/superpowers/specs/2026-08-31-field-aware-controls-design.md`. Read that
before writing another control; it is short, and it answers the three questions
each one would otherwise reopen.

**Remaining in T3:** `Checkbox`, `RadioGroup`, `Slider`, `Accordion`,
`EmptyState`, `Sidebar`, `Listbox`, `Tree`, `Calendar`.

Take `Checkbox`, `RadioGroup` and `Slider` next, in that order:

- `Checkbox` and `RadioGroup` share the `checked` state Switch added to the
  vocabulary, and share the question Switch sidestepped by drawing on a
  `<button>`: a checkmark and a radio dot have to be drawn on something, and an
  `<input>` is a replaced element that no specification promises will render a
  pseudo-element. Decide it once, for both, and write it down — an inline SVG
  child is the obvious candidate and was not investigated here.
- `Checkbox` also brings `indeterminate`, which is already in the shared
  vocabulary from ProgressBar and means something different here: a third
  visual state, set through a DOM property that no attribute reflects.
- `RadioGroup` and `Slider` are the next callers of `core/focus`. Toolbar
  already confirmed `createRovingTabindex` against items it had never seen, so
  expect to use it unchanged rather than to change it.

Then `Accordion`, `EmptyState` and `Sidebar`, which compose Collapsible and
Card and raise little that is new.

Leave `Listbox`, `Tree` and `Calendar` until last. Each needs a design document,
and the first two are the callers `core/collection` is waiting on:

- `Listbox` brings filtering and comparison, plus selection and roving focus.
  It is also the first component that will want windowed rows and a selection
  at once, which is the test of whether `virtualWindow` was drawn correctly.
- `Calendar` brings date arithmetic, which shares nothing with the windowing
  maths but is named against the same module in the catalog. Decide when you
  get there whether it belongs beside it or in its own entry point.
- `Tree` needs a design document for its own reasons: what the DOM shape is,
  and where the expanded state lives.

Do not start T4 until T3 is complete. `Dialog` must be the first overlay.

**Conventions worth knowing before writing a line:**

- Contract first, and assert shared vocabulary by reading the other contract
  rather than retyping it. Textarea's contract reads Input's; Badge, Tag and
  Alert all name the same five tones and none of them repeats the list.
- Both frameworks in one commit whenever a public contract changes.
- `pnpm check` per component, `pnpm check:full` per batch, then push.
- Every reference page is written by copying the other framework's and editing
  it. `pnpm test:docs` now fails a snippet left in the wrong language, which is
  the one edit that copy reliably forgets.
- A snippet's `source` must be exactly what Prettier produces from it under the
  repository's own config — `printWidth: 100`, single quotes — and
  `defineSnippet` supplies the trailing newline. Format the candidate through
  Prettier and paste the result rather than guessing where it wraps.
- A React family with no `render` prop must not export a root props type. It
  cannot be produced, and the unused import trips the lint gate.
- A React family with a _required_ function prop cannot satisfy Storybook's
  types from `render` alone. Give `meta.args` a default for it; VirtualList
  passes a default row renderer that way.
- `exactOptionalPropertyTypes` is on. Never write `{ maxSize: undefined }` in
  story args or into an interface whose field is `maxSize?: number` — declare
  the field `| undefined` where a component forwards an optional prop into it,
  and omit the key everywhere else.
- Angular snippets must fit on one line under roughly seventy characters, or
  Prettier's angular printer breaks them onto a hanging `>` and the format test
  fails.
- `model()` takes no `transform`, unlike `input()`. `input.required` does take
  one, written `input.required<number, unknown>({ transform: numberAttribute })`.
- A new `@slotted/core` entry point must be built before any framework package
  can import it: `pnpm --filter @slotted/core build`.
- One Angular entry point reaches another **only** by its published path,
  `@slotted/angular/<name>`. The mapping lives in `tsconfig.base.json`; the
  Storybook aliases it in Vite. A relative path is refused by ng-packagr, and
  `packages/angular/src/bundle.boundaries.test.mjs` keeps the artefacts honest.
- The Angular spec tsconfig has `noUncheckedIndexedAccess`. An indexed access in
  a spec needs `!`, which the React suite does not require.
- A demonstration component in an Angular stories file must declare real
  `input()`s. A plain public field cannot be bound to from a story template.
- Two assertions read as though they mean something they do not.
  `toBeRequired()` counts `aria-required`, so assert the native attribute
  directly. And a control inside a disabled `<fieldset>` keeps its own
  `disabled` property `false` — it matches `:disabled` instead, which is what
  every control stylesheet keys on.

## Layered token foundation, state model, ratchet — 2026-08-31

- Decisions: the token contract is one list carrying two independent facts per
  token — the layer, which says what may reference it, and the axis, which says
  which CSS block emits it. Grouping by axis alone made the layer invisible, so
  a component token sat beside a primitive and nothing objected. Validation now
  refuses a reference that reaches a deeper layer, and refuses a token that is
  not a scale root and restates a literal without recording why. Fourteen
  literals carry their reason in the contract.
- Decisions: `--slotted-surface`, `-raised`, `-sunken`, `-inverse`,
  `--slotted-text-inverse`, `--slotted-border-strong` and `--slotted-scrim`
  close the gap that made every family invent its own neutral background. Card,
  Popover, Dialog and Table would each have decided it separately.
- Decisions: `high-contrast` is a scheme the application selects and is held to
  7:1 for text; the operating system's own mode is served by the
  `forced-colors` block the theme emits, which maps all 64 scheme tokens to
  system colours. A scheme token without a mapping fails contract validation, so
  the mapping cannot fall behind the palette.
- Decisions: the coarse-pointer block raises control height per density to
  `max(<value>, var(--slotted-target-comfortable))` rather than switching the
  application to a larger density. A dense table keeps its type and spacing on
  touch while its controls stay hittable.
- Decisions: schema 5 adds `data-ui` and `stateModel`. A family had no public
  selector — classes are explicitly not contract — and no shared answer for
  controlled versus uncontrolled, so Splitter and Switch had each invented one.
  `packages/core/src/state/` holds the one implementation both bindings will
  use, including the change request with an enumerated reason, an opaque source
  event, and cancellation before commit.
- Decisions: `specs/legacy-families.json` is the ratchet. The 29 families built
  before the foundation stay on schema 4 and are exempt from the motion,
  precedence and identity laws; a family leaves the list when it is rebuilt, and
  `specs/rebuild-ledger.test.mjs` refuses to let the list grow. Without it,
  either the new law would be unenforceable or 29 families slated for rebuild
  would have to be edited first.
- Defects found: the light scheme's `--slotted-text-muted` measured 4.47:1
  against the new sunken surface, and `--slotted-border-strong` measured 2.56:1
  in light and 2.40:1 in dark against the surface it separates. Both were
  darkened. The contrast test that found them did not exist before this change;
  the old one checked solid tones only.
- Defects found: `renderThemeCss` and `validateTheme` both took a contract
  argument and then read token names from the module singleton, so a theme built
  against a different contract would have emitted this one's tokens. Both now
  derive every list from the argument.
- Deviations: only the four motion-scale duration tokens collapse under reduced
  motion. The three new loop durations do not, because an endless animation has
  to stop rather than hurry.
- Follow-on: the harness captures six combinations per family, and the review
  page multiplies scenes by three schemes and three widths. Density and
  direction are page-wide query parameters instead, or the review view would
  carry 54 cells per scene.
- Follow-on: `docs/rebuild-order.md` holds the order the 29 families are
  rebuilt in. Wave 1 starts at `typography` and `icon`, because the type scale
  and the glyph system are what every later family reads.

## Divider, rebuilt — 2026-09-01

- Decisions: the rule is drawn as a border on the axis it divides, not as a
  painted box. The element then occupies the thickness it draws and nothing
  else, which is what lets a vertical rule take its length from the container
  instead of from a box the family invented.
- Decisions: a label changes the element. `hr` takes no content, so a labelled
  rule is a `div` carrying `role="separator"`, and the contract states the swap
  in `labelledElement` because it is the one fact the props do not reveal. The
  name comes from `aria-label` rather than from the text inside: `separator` is
  _Children Presentational: True_ in ARIA 1.2, so the visible label never
  reaches the accessibility tree and the rule would otherwise be announced
  empty. A decorative labelled rule carries no name at all, because `role=none`
  prohibits one, and its text is read in document order like any other text.
- Decisions: the label is a string, not projected content. Angular can then
  render it from the template without a second directive to detect it, and the
  same string reaches `aria-label` in both bindings. A consumer who needs a
  richer label composes their own root through `render` in React.
- Decisions: the family writes `role="separator"` only when the element is not
  an `hr` — the `li` a menu separator has to be, or the `div` a label needs.
  Writing it on the `hr` as well would be ARIA restating what the element
  already means. Angular reads the host tag name; React knows what it renders,
  and a consumer using `render` gets the explicit role because the element is
  unknowable from there.
- Decisions: the vertical minimum length is `1em`, a literal, because the floor
  has to follow the type size at the point of use and no scale holds such a
  value. A taller floor from the control scale would grow the row a rule stands
  in between two lines of text. `--slotted-divider-min-length` is how a theme
  fixes it instead.
- Decisions: `inset` defaults to `--slotted-control-padding-inline-md`, so a
  rule inside a menu or list built from controls lines up with their text at
  every density. It is a boolean rather than a scale: a rule that stops short
  is one decision, and the amount belongs to the theme.
- Decisions: the two halves of a labelled rule never shrink below
  `--slotted-space-5`. In a narrow container the label wraps and the rule still
  reads as a rule; letting the halves collapse would turn the component
  silently into a line of text.
- Deviations: `variant` from the feature guide is declined. No family in the
  rebuild needs a dashed rule, and dash length and gap have no token to hold
  them, so it would be a second private scale.
- Defects found: the first stylesheet claimed only `align-self`, which is the
  cross size in flex and the block size in grid. A grid with
  `justify-items: start` — `.slotted-demo-stack` in the workbench, and every
  packed container like it — therefore sized a horizontal rule from its own
  content, which is nothing, and several reference stories showed no rule at
  all. Both axes are claimed now, and the harness carries a `packed` scene that
  reproduces the container.
- Defects found: two reference stories leaned on demo containers that shrink to
  their content — a stack inside the flex stage, and a `ul` inside a grid that
  packs its items — so the rule filled a container narrower than the scene it
  was illustrating. The stories state their own width, and the menu scene
  carries the surface it needs rather than borrowing the demo stack.
- Follow-on: Menu (wave 5) consumes the separator through the element swap
  rather than through a Menu-specific rule; the harness `menu` scene is the
  shape it is expected to take. Toolbar (wave 4) uses the vertical rule the
  same way.

## VisuallyHidden, rebuilt — 2026-09-01

- Decisions: the family leaves `specs/legacy-families.json` and is selected by
  `data-ui="visually-hidden"`. The class `slotted-visually-hidden` is gone.
  Four consumers were reaching the primitive through that class — Spinner and
  Link in both bindings, and two Button reference pages — and they move to the
  attribute in the same commit, because the primitive's public selector changed
  under them and the alternative is four private copies of the hiding rule.
- Decisions: a composed hidden element carries `data-ui="visually-hidden"` and
  keeps the composing family's own `data-part`, as Spinner's `label` and Link's
  `external-hint` now do. `data-ui` says what the element is; `data-part` says
  what it does for the family that placed it, so the two do not compete. The
  cost is that `[data-ui='x'] [data-part='y']` can still reach into a nested
  family, which is a property the vocabulary already had.
- Decisions: one selector,
  `[data-ui='visually-hidden']:not([data-focusable]:focus-within)`. The revealed
  variant is the absence of the hiding rule rather than its undo, so nothing has
  to be restored declaration by declaration.
- Decisions: the family paints nothing on the revealed state. What appears is
  the consumer's own anchor, with the user agent's focus ring, because how a
  skip link looks belongs to the link. The cost is that revealing re-enters the
  flow and moves the content below it — which WCAG 2.2 technique G1 accepts, and
  which a consumer who wants otherwise controls by positioning their element.
- Decisions: the rule set is WCAG 2.2 technique C7 without its `clip: rect()`
  companion, which every engine the library supports superseded with
  `clip-path`. `border` and `padding` are zeroed on top of it, because the
  element is whichever one the consumer brought and an anchor arrives with a
  frame of its own.
- Decisions: `margin: -1px` stays, and is measured rather than inherited.
  Inside a scrolling container that is also the element's containing block —
  `position: relative` plus `overflow: auto` — the one-pixel box adds one pixel
  of block-direction scrollable overflow without it, and none with it. The other
  three probes measured zero either way.
- Decisions: `user-select: none` is declined. Hidden text is content: a
  selection that copies it agrees with what assistive technology reads, and
  suppressing it would make the two disagree silently.
- Decisions: the token list stays empty. A hiding technique has nothing a theme
  retunes — the box is one pixel because a screen reader needs a rendered box,
  not because a scale said so — and `visually-hidden.styles.test.mjs` holds the
  emptiness so it reads as a decision rather than an omission.
- Decisions: `focusable` keeps its name, matching React Aria's `isFocusable`,
  and declares no `stateModel`: the browser owns focus, the component neither
  reads it nor asks for it to change, so a model would name a request no one
  can send.
- Defects found: the harness could not photograph focus at all, so a focus ring
  and a rule that reveals content only under `:focus-within` existed in no
  capture the visual loop is required to read. `--focus <selector>` fixes it.
  The shooter also asked for `scale: 2` on a clip already rendered at twice the
  device scale: every capture came out at four times, and Chrome filled the
  region it never rendered by repeating the top of the document below the last
  scene. Both are fixed in their own commits before this family.
- Follow-on: `packages/storybook-workbench/src/workbench.css` keeps a private
  copy of the hiding rule under the old class name, now the only
  `.slotted-visually-hidden` in the tree. It is workbench chrome rather than a
  family, and the file carried other uncommitted work, so it is left for the
  workbench's own turn.

## Stack, Inline and Grid — 2026-09-01

- Decisions: one invocation, three families. `button` groups five members under
  one identifier because they are one control with different jobs; Stack, Inline
  and Grid are three engines — flex column, flex row with wrapping, and grid —
  and `align` names a different axis in each. A single family would publish
  `[data-ui='layout'][data-flow='stack']` as the selector for a stack, which is
  a group name in front of the only word the consumer means. The cost is that
  the thirteen-rule gap map is written three times, once per family.
- Decisions: `align` positions children across the flow and `justify` positions
  them along it, in all three families. Grid takes `justify-items` rather than
  `justify-content`, because its tracks already fill the row and distributing
  them has nothing to distribute; its `justify` therefore has four values where
  the other two have six.
- Decisions: no axis reorders anything — no `reverse`, no `order`, no
  `grid-auto-flow: dense`. WCAG 2.2 SC 1.3.2 is failed by F1, positioning
  information with CSS, and satisfied by C27, making the DOM order match the
  visual order. A layout primitive that can reverse its children makes that
  failure a one-word prop, and focus order breaks with the reading order. A
  consumer who wants the opposite order writes the children in it.
- Decisions: `gap` is a step from `--slotted-space-1` to `-12`, plus `0`, and
  resolves to the same length under all three densities. A named step has to
  mean one value: `gap={6}` meaning 1rem on one page and 0.75rem on another
  makes the scale unreadable, and the space scale carries a `base` axis for
  exactly that reason. Density in this library is control geometry, which a
  layout family owns none of. Cost: the `dense` capture of all three families is
  byte-identical to `comfortable`, verified by comparing the two PNGs. A page
  rhythm that must follow density belongs to `page` and `section` in wave 7.
- Decisions: the defaults differ by family because the families mean different
  things. Stack and Grid separate at step 6 (1rem), at or above the line height
  of the default type step, so blocks read as separate; Inline separates at step
  4 (0.5rem), below it, so a run reads as one line.
- Decisions: Grid reflows with one track function and no breakpoint. Without a
  count it is `repeat(auto-fit, minmax(min(100%, <min-item>), 1fr))`; with one
  it is `repeat(auto-fill, minmax(min(100%, max(<min-item>, (100% - (<n> - 1) *
<gap>) / <n>)), 1fr))`, which yields exactly `n` tracks while each would stay
  at or above `minItemWidth`, fewer as the container narrows, and one at 240
  pixels. `min(100%, …)` is what keeps a minimum wider than the container from
  overflowing it instead of reflowing. `auto-fill` with a stated count so two
  cells in a three-column grid occupy two thirds; `auto-fit` without one so a
  lone cell fills the row.
- Decisions: `minItemWidth` is a five-step family scale — 8, 12, 16, 20 and 24
  rem — rather than a length, because a length is the CSS dialect these families
  exist to avoid. The five tokens state their values: the foundation holds no
  measure scale, and these are cell minima rather than reading measure.
- Decisions: no per-item `span`, no `rows`, no `areas`, and no
  `container-type: inline-size`. Exposing spans is exposing placement;
  establishing containment on the consumer's element is a side effect a layout
  primitive has no reason to impose. A child that must cross two tracks sets
  `grid-column: span 2` on itself.
- Decisions: measure belongs to `container` alone. `docs/rebuild-briefing.md`
  named "`container` and `stack`" as its future owners; `docs/rebuild-order.md`
  already assigns it to `container`, and two families offering a maximum measure
  would be two answers to one question. The briefing line now names one.
- Decisions: `arrangement` joins `KNOWN_CAPABILITIES`, and
  `packages/storybook-workbench/src/scenarios.tsx` maps it to the API rows
  `gap`, `align` and `justify`. None of the twenty-eight existing capabilities
  describes arranging children, so a layout family could only have declared an
  empty capability list and published a reference page omitting all three.
- Defects found: `snippetFormatErrors` in the workbench resolved the Prettier
  configuration from `process.cwd()`. Prettier searches from the _parent_ of the
  path it is given, so the repository root resolved to nothing while a package
  directory resolved to the repository's own config. Snippets were therefore
  measured at printWidth 100 under Vitest and at Prettier's default 80 under
  `ng test`, and a typography snippet 84 characters long failed in one runner
  and passed in the other. It now resolves from the module's own path. Fixed in
  its own commit, before the families.
- Deviations: no APG pattern covers a layout primitive. The nearest name, Grid
  (Interactive Tabular Data or Layout Container), is a composite widget with one
  tab stop and author-managed arrow-key navigation; this family navigates
  nothing, so it carries no `role="grid"` and no ARIA at all. The applicable law
  is the platform's: SC 1.3.2 for order, SC 1.4.10 for reflow, and the
  consumer's own element for semantics.
- Follow-on: adding a subpath export to `@slotted/styles` is invisible to a
  Vite dev server that was already running, so a Storybook started before the
  export existed serves the family's `*.docs.ts` as a 404 and the reference page
  never mounts. Both Storybooks need a restart when a new family lands, and the
  story glob alone is not enough.

## Icon — 2026-09-01

- Decisions: Icon is the box a glyph is drawn in, and the library ships no glyph
  catalogue — not a package, not a `@slotted/core` entry point, not a public set
  of glyph tokens. The rebuild order asked where the registry lives, and
  `PROJECT-PRD.md` §49 listed the icon strategy as an open architectural
  question; both are answered by owning the frame and not the artwork. Nothing
  changed since the 2026-08-29 design deferred a published icon package: Slotted
  still owns no original glyph, still needs no semantic alias across upstream
  families, and re-exporting Lucide would buy a version to maintain. The
  consequence for tree-shaking is that there is nothing to shake. Written in
  `docs/superpowers/specs/2026-09-01-icon-family-design.md`.
- Decisions: the family is the box every other family was about to reimplement.
  `button.css` already carries it three times, for its `icon`, `leading` and
  `trailing` slots. A container sizes everything inside it by setting
  `--slotted-icon-size` once, and an instance overrides that container through
  `data-size`, because the `[data-size]` rule sets the same token on the element
  itself. A rebuilt Button therefore needs to know nothing about this API.
- Decisions: `size` is `text`, `sm`, `md`, `lg`. The three named steps read
  `--slotted-control-icon-size-*`, so an icon shrinks with density exactly as
  the control beside it does; `text` is `1em`, because a 16px glyph inside a
  `3xl` heading is not an icon. `md` is painted by the base rule and never
  written as an attribute.
- Decisions: the family sets `color` and never `fill` or `stroke`. Stroked
  artwork declares `stroke="currentColor"` and filled artwork declares
  `fill="currentColor"`, and painting either would break the other. `tone`
  reuses Typography's eight values and tokens, so an icon and its label are one
  colour by default.
- Decisions: the rebuild order's stroke/fill axis is declined, and the two
  halves of it fail for different reasons. Outline versus solid needs a
  catalogue holding both drawings of a glyph, and there is no catalogue. Stroke
  _weight_ is a fairer question and the paint argument does not answer it:
  measured in a browser, an author rule overrides the `stroke-width`
  presentation attribute Lucide writes, and is inert on filled artwork, so the
  family could set it without breaking anything. It does not, because the
  convention belongs to the icon set rather than to the icon; because `data-ui`
  is public contract, so an application already decides it once with
  `[data-ui='icon'] svg { stroke-width: … }` and needs no API; and because a
  family rule would silently override a `strokeWidth` the consumer set on their
  own glyph component. The cost, recorded: a 2-unit stroke on a 24-unit grid
  renders at 1.17px at `sm` and 1.5px at `lg`, so a stroked set reads lighter at
  small steps. The right correction depends on a grid the library did not
  choose.
- Decisions: there is no `decorative` prop. The icon is decorative when it has
  no name and meaningful when it has one, which makes named-and-hidden
  unrepresentable. `role="img"` appears only once a name exists, because
  WAI-ARIA 1.2 §5.2.8 lists `img` among the roles for which a name is required.
- Defects found in the design: a host binding of `[attr.aria-label]` deletes an
  `aria-label` the consumer wrote on the element, which would have hidden a
  named icon in the one arrangement a consumer writes without reading the
  documentation. Both bindings read `aria-label`, `aria-labelledby` and `role`
  from the element — Angular through `HostAttributeToken`, React through props —
  and treat any of them as the name.
- Decisions: `:dir(rtl)` rather than an ancestor `[dir='rtl']` selector, because
  a mirrored icon inside a left-to-right island inside a right-to-left page has
  to read the directionality that actually applies to it. Only artwork the
  consumer declares `directional` mirrors: an arrow and a chevron do, a clock
  does not.
- Defects found in the family: the optical shift was the constant `-0.125em`,
  which is right at one ratio of box to type and wrong at every other, and wrong
  by more the larger the ratio. The `baseline` harness scene was extended with
  the `lg` step inside `xs` text — an 18-pixel mark in 12-pixel type — and the
  mark rode visibly above the line it belonged to. The default became
  `calc(0.5cap - 0.5 * var(--_size))`, which puts the box's centre on the text's
  optical centre at every combination; at `1em` it resolves near `-0.125em`,
  which is why the conventional constant looked right until the ratio changed.
  `cap` is a recent platform primitive, permitted by `PROJECT-PRD.md` §33, and
  it constrains nothing `:dir()` and `scale` did not already constrain. The
  family's one optical decision had no test; it has one now, written first and
  watched fail against the constant it replaced.
- Decisions: the shift stays a token a theme can override outright, and it stays
  inert inside a flex or grid parent, where alignment is the parent's decision.
  Only the default changed.
- Deviations: the six `--slotted-icon-*` mask tokens keep their names. Renaming
  them to `--slotted-glyph-*` was considered, because every family's hook prefix
  is `--slotted-<family>-*`. There is no mechanical conflict — a family hook
  never enters the token contract, so the Glyph table cannot see one — and
  `visually-hidden` already consumes `--slotted-icon-x` and
  `--slotted-icon-check`. A rename with no defect behind it is not a
  shared-tooling fix. The boundary is what matters: a component draws a mark
  with a mask when it has no slot to put content in, and frames the consumer's
  artwork with Icon when it does.
- Deviations: no APG pattern covers an icon. The sourced law is WAI-ARIA 1.2
  §5.4 `img` (authors MUST provide a label), §5.2.8 (name required), §7.1
  (`aria-hidden` excludes an element and its descendants), and the W3C WAI
  Images tutorial for the decorative/informative split.
- Deviations: React has no `render` prop here. Substituting the root would put
  the identity on the consumer's own `svg` and save one node, and Angular could
  not match it — a component selector cannot sit on `<ng-icon>`, because Angular
  refuses two components on one element. One documented shape in both bindings
  is worth more than one node.
- Follow-on: the harness fragment carries geometry authored for that page rather
  than copied artwork, because a framework-free page cannot import Lucide and a
  copy would be an unmaintained second catalogue. The reference pages use the
  real thing, through `lucide-react` and `@ng-icons/lucide`.
- Decisions: an application sets this family's defaults in CSS, and the family
  ships no provider and no injection token. Four of the five surveyed libraries
  ship one — Chakra's `IconPropsProvider`, MUI's theme `defaultProps`, Angular
  Material's `MAT_ICON_DEFAULT_OPTIONS`, ng-icons' `provideNgIconsConfig` — so
  the capability is table stakes and is adapted rather than declined.
  `--slotted-icon-size` on any ancestor sets the size, a `[data-ui='icon']` rule
  sets anything else, and an instance that states its own value still wins. The
  cascade scopes per subtree rather than per injector, needs no import, and is
  one mechanism instead of two that could disagree. A DI token would have been
  the second answer.
- Defects found in shared tooling: a workbench snippet could only be `angular`
  or `tsx`, so the answer above — a stylesheet rule that is correct in both
  bindings — had nowhere to go in either reference page. Card's entry predicted
  this limit would bite again. `SnippetLanguage` gains `css`; the prettier
  parser and the drawer label became maps keyed by the language, so a fourth one
  is a compile error at both sites rather than a snippet measured against the
  wrong grammar. Fixed in its own commit before the family.
- Defects found in shared tooling: `scripts/verify-docs-snippets.test.mjs`
  refused any snippet whose language was not the page's own and required every
  id to name a framework. Both rules exist to catch a copied page showing React
  code under an Angular badge, and both also refused the correct case. `css` is
  now a neutral language, exempt from the framework rule and required to name
  neither framework in its id. The scan also became per `defineSnippet` call
  reading only the keys before `source`: the pages do not agree on key order, so
  the previous loose scan could not tell which language an id belonged to, and a
  new test fails loudly when a snippet's id or language cannot be read rather
  than skipping it. Fixed in its own commit before the family.
- Defects found in shared tooling: a filtered harness page kept the review
  view's `repeat(auto-fill, minmax(320px, 1fr))` grid. At `--width 720` the
  viewport is 800 pixels, which fits two tracks of about 400, so each 720-pixel
  stage overflowed its track and the shooter clipped every line of text at the
  viewport edge. The 240 and 420 steps fit one track, which is why the defect
  survived every family until one read a 720 capture — the width `rubric.md`
  names for Responsiveness. A filtered page is now one column. Fixed in its own
  commit before the family.
- Defects found in the reference pages: every scene laid its icons out with
  `.slotted-demo-row`, which is `display: flex`, where `vertical-align` is inert
  — so the one purely optical decision the family makes was visible nowhere in
  either Storybook. A `baseline` scenario joined the contract, written first as
  a failing test, and both pages now show the shift against running text.
- Defects found in the rendered evidence: the `tone` scene listed `inherit` as a
  swatch beside `default`, and the two are pixel-identical in all three schemes
  because the surrounding text is `--slotted-text`. The scene claimed the icon
  takes the colour of its context and proved nothing. `inherit` moved into a
  callout that paints its own surface and text, which is both the proof and the
  shape that actually uses it — an alert's status icon.

## Card, rebuilt — 2026-09-01

- Decisions: one member, seven parts — `root`, `media`, `header`, `actions`,
  `body`, `footer`, `link`. A member is a component with a root of its own; a
  card region exists only inside a card, so the regions are parts and the family
  declares one member. Schema 4 had made `cardHeader` a member beside `card`,
  which is also what would have put `data-ui` on four elements.
- Decisions: the header is a two-column grid, and `actions` is its corner. Five
  of the six surveyed implementations put a badge, a status or a menu there —
  shadcn's `CardAction`, Ant's `extra`, MUI's `CardHeader action`, PatternFly's
  `CardActions` — and the first build of this family had nowhere to put one, so
  a badge pushed the description sideways. The corner is pinned to the first
  row, so a title that wraps to two lines does not drag it down.
- Decisions: no `title` or `description` part, against five of six. The header
  decides two distances and the corner; the strings are `Heading` and `Text`.
  Adding them here would be a second answer to the type question Typography
  already owns, and the header grid is what those libraries actually needed the
  parts for.
- Decisions: `fill` is `outline`, `elevated` or `subtle`, reversing the "no
  axes" decision the first Card recorded. Four of six ship the axis — Chakra's
  `elevated | outline | subtle`, Ant's `outlined | borderless`, MUI's `raised`,
  Mantine's `withBorder` plus `shadow` — and a page uses more than one at once:
  a grid of list cards and a summary that lifts appear on the same screen. It is
  named `fill` and not `variant` because `variant` is this library's word for
  tone, which a card does not carry. `elevated` keeps its hairline, so the card
  still has an edge in a forced-colours document, where a shadow is removed.
- Decisions: `size` is `sm`, `md` or `lg`, scaling the inset and the distance
  between regions. Chakra and Ant both ship it, and it is not density: density
  is the application's choice and governs control geometry, while a compact card
  in a dense list and a summary card can stand on the same page.
- Decisions: the card holds no state. `selected` and `disabled` are written by
  the consumer and mirror state that belongs to the control inside — a radio in
  a plan chooser, a disabled button in a footer — so they are states and props
  and not capabilities. A `disabled` capability would claim the card can refuse
  an interaction, and only the control can; `selection` would claim it holds a
  value. The family declares `orientation` and `size`, and no `stateModel`.
- Decisions: a card that resolves to one destination stretches the hit area of
  one `<a href>` marked `data-part="link"` across the surface, rather than
  rendering the root as the anchor. A root anchor takes every string in the card
  into the link's accessible name, which is the defect in MUI's `CardActionArea`
  as it is usually written. The APG Link Pattern asks for a native anchor; the
  stretched link keeps the element, its name, Enter, the context menu and
  middle-click, and keeps them on the title alone. Three costs, all on the
  reference pages: text over the stretched area cannot be selected with the
  pointer; an interactive element outside `actions` and `footer` has to raise
  itself; and a card carries at most one link.
- Decisions: the stretched target is a link and never a command. A whole surface
  that fires a non-undoable action on any click, with no visible control
  boundary, is a misclick generator; whole-card _selection_ is a `<label>` with
  a native input, which the platform already makes clickable edge to edge. Both
  answers are on the reference pages.
- Decisions: a rule between two regions is a `Divider` written between them, not
  an axis of this family. Mantine's `Card.Section withBorder` and Ant's header
  border are the two surveyed answers; composition gives the same picture with
  no new API, because each region owns its inset and `inset` on the rule lines
  it up with the text. The family only keeps the rule from being squashed and
  places it in the content column of a horizontal card. Demonstrated in the
  `sections` harness scene and the `appearance` story on both pages.
- Decisions: an application sets the defaults once. React ships
  `CardDefaultsProvider` and `useCardDefaults`; Angular ships `CARD_DEFAULTS`
  and `provideCardDefaults`. An explicit prop or input always wins over the
  provider, and a nested provider inherits what it does not restate. None of the
  six surveyed implementations offers this in both a React and an Angular
  binding; Chakra does it at build time through the recipe theme and Ant through
  a React-only `ConfigProvider`.
- Decisions: vertical rhythm is each region's own block padding rather than a
  gap on the root. A gap survives the region it separated, which is what makes a
  card with no body show two gaps; padding lets an absent region collapse to
  nothing, and it is also what makes an empty grid row cost nothing in the
  horizontal layout. Outer inset is `--slotted-space-6` at `md` and each side of
  a region boundary is `--slotted-space-4`, so a region at either end absorbs
  the padding its missing neighbour would have carried.
- Decisions: the root never sets `overflow`. Media rounds the corners it touches
  and clips itself instead, at the card's radius less its border width, so a
  popover opened inside a card in wave 5 is not cut off by the card. MUI, Ant
  and Mantine all clip the root.
- Decisions: the card's inset does not vary with density, matching Stack, Inline
  and Grid from the same wave. Density is control geometry, and the space scale
  carries a `base` axis for exactly that reason; a dense card is denser because
  the controls inside it are, and `size` is what changes the inset per instance.
- Decisions: the media column is `minmax(0, 1fr)` against `minmax(0, 2fr)`
  rather than a length. A thumbnail size is not a scale the foundation holds;
  `--slotted-card-media-size` takes a track size when a theme wants a fixed
  strip.
- Defects found: `container-type: inline-size` removes the inline contribution
  of the element it is on, so a horizontal card in any shrink-to-fit context —
  including both Storybook demo stages, which are `display: flex` — collapsed to
  min-content and wrapped its text one word per line. Reproduced in the `packed`
  harness scene, then fixed by `inline-size: 100%` on the horizontal root: a
  card that reflows on its own inline size cannot also be sized by its content.
  The scene stays as the regression.
- Defects found: `subtle` and `disabled` both painted `--slotted-surface-sunken`,
  so a disabled subtle card was indistinguishable from an operable one. The
  disabled ground is now `--slotted-disabled-background`, which the foundation
  owns for exactly this.
- Defects found: `packages/styles/src/fallbacks.test.mjs` listed the foundation
  token prefixes the theme owns outright and had never been updated for the
  surfaces and the scrim wave 0 added. Card is the first family to read
  `--slotted-surface-raised` in a stylesheet, and the rule would have called its
  system-colour last resort a component-token violation. `--slotted-surface` and
  `--slotted-scrim` joined the list, in its own commit, before the family.
- Deviations: there is no card pattern in the WAI-ARIA Authoring Practices. The
  full list at <https://www.w3.org/WAI/ARIA/apg/patterns/> holds twenty-nine
  patterns and none of them is a card, because a card is structure rather than a
  widget. The applicable guidance is Structural Roles: use the HTML element that
  already carries the meaning. The root is a `div` with no role, and the page
  substitutes `article`, `section`, `li` or `label`.
- Deviations: the Angular reference page carries no snippet for
  `provideCardDefaults`. `SnippetLanguage` in the workbench is `angular | tsx`,
  and `scripts/verify-docs-snippets.test.mjs` requires an Angular page to carry
  only `angular` snippets, which are formatted as HTML — so a provider written
  in TypeScript cannot be shown. It is documented in the API table instead. The
  same limit will bite every `provideX` in wave 3, and the fix belongs to the
  workbench rather than to this family.
- Deviations: the reference pages use the platform `<button>` and `<a>` rather
  than the Button and Link families, which are being rebuilt in wave 2. What
  Card has to demonstrate is the surface around a control rather than the
  control.
- Follow-on: `progress-indicator`, `alert` and every later family that needs a
  bounded surface reads `--slotted-surface-raised` and the card's inset scheme
  rather than restating either. `loading` is deferred to `skeleton`, expandable
  to `collapsible`, a card with tabs to `tabs`, and a gallery of cards to `grid`
  — all four are Ant or PatternFly capabilities this family declines by naming
  the family that owns them.

## `card` — interaction and appearance states

Second pass over the family, from a review finding: the three fills were one
picture, the selected card was a blue block, and the chooser was a
browser-default radio dropped beside a heading. The first two were visual
defects; the third was an anatomy defect recorded as a decision. The design is
`docs/superpowers/specs/2026-09-01-card-interaction-states-design.md`.

- Decision: selection is painted by the **inverse surface**, not the accent.
  `--slotted-focus-ring-color` and `--slotted-tone-accent-border` both resolve to
  `#2563eb` in the light scheme, so a focused card and a selected card were the
  same image. Carbon (`$layer-selected-inverse`), Fluent
  (`colorNeutralStroke1Selected`) and Spectrum (`gray-1000`) all refuse the
  accent here too. `--slotted-surface-inverse` inverts by definition, so one
  declaration reads as a near-black edge on a light card and a near-white edge on
  a dark one — which also fixes a state that shouted in light and vanished in
  dark, because `--slotted-tone-accent-surface` is `#dbeafe` in one scheme and
  four units from the card's own background in the other.
- Decision: selection paints **no fill at all**. A tone surface is calibrated on
  a badge; the same value at card area floods. Carbon paints no fill on a
  selected tile either.
- Decision: the edge moves to a `::before` over the border box and the root
  draws none. A real border has to reserve its width, so a hairline becoming a
  2px selected edge shifted every region by a pixel. Five of the six surveyed
  systems that solve this solve it the same way, three with a comment naming the
  reason. It stays a border rather than a box-shadow so it survives forced
  colours.
- Decision: `data-part="selection"` is a new part — the column a choice card
  keeps for its control, leading rather than trailing because `actions` owns the
  corner. It is the **slot and not the glyph**: `checkbox radio-group` in wave 3
  owns where a check and a dot are drawn, and a card drawing its own would be the
  second answer to that question. The card sizes the control from
  `--slotted-control-icon-size-md` and tints the platform's check with
  `accent-color`.
- Decision: every interactive rule was gated on `[data-part='link']`, so the
  chooser — the whole-card selection this family documents — answered no hover,
  no press and no ring. The gate is now a destination **or** a choice.
- Decision: each fill answers a state in the property that fill is made of, which
  is Fluent's model. `outline` moves its edge and never fills on hover;
  `elevated` moves its elevation and holds its edge; `subtle` moves its fill. All
  three fill on **press**, because a press is momentary and arrives with the
  pointer already down. Removing the hover shadow instead was tried, photographed
  and rejected: it gave an outlined card no readable feedback.
- Decision: `elevated` rests at `--slotted-shadow-md`. The small step under a
  hairline does not separate on a white page and is invisible on a near-black
  one, which is why two of three fills were one picture.
- Decision: the region gap drops one step below the card's inset at every size.
  It had resolved to exactly the inset (`md`: 1rem and 1rem; `lg`: 1.5rem and
  1.5rem), so header, body and footer sat as far from each other as from the
  card's own edge and nothing grouped.
- Decision reversed on evidence: `subtle` was given no edge, on Fluent's rule for
  the same appearance. Rendered in the high-contrast scheme it had neither fill
  nor edge — `--slotted-surface-sunken` and `--slotted-surface` are both white
  there — and stopped being a card. The hairline is back. A redundant-looking
  edge in two schemes fails more loudly than a card that disappears in the third.
- Decision: the control's own focus ring is suppressed where the card draws one,
  as the link's already was and inside `:has()` for the same reason. The card is
  the label and the click target, so the card is what the ring is about.
- Defect found, fixed first: the theme declared no `color-scheme`, so every
  native control, scrollbar and form widget kept the light user-agent style in
  every scheme — an unchecked radio on a dark card rendered as a solid white dot
  that read as checked. Card is the first rebuilt family to render a native
  control, and it is where this surfaced. `light`, `dark` and `light` for
  high-contrast, emitted in the scheme blocks that already exist. It is not a
  token: no family reads it, the user agent does, from the element the scheme is
  selected on. Every later control family inherits the fix.
- Defect found, fixed first: `tools/harness/build.mjs` baked captions as
  `name · scheme · width`, so a `--density dense --dir rtl` capture carried the
  same label as a comfortable LTR one and the two could not be told apart inside
  the image. Captions now name every axis.
- Defect found, fixed first: the harness could not photograph `:hover` or
  `:active` at all — a headless page has no pointer — so the family painted a
  hover fill nobody had ever looked at, and it turned out to be the same grey as
  the disabled card beside it. `shoot.mjs` gained `--hover` and `--active`,
  forcing the pseudo-classes through `CSS.forcePseudoState` rather than
  simulating a mouse, which also scrolls, hovers whatever it passes, and cannot
  hold `:active` for the length of a capture.
- Defect found in the harness fragment: the page repeats each scene once per
  scheme and width, so nine radios shared one `name` and only the last `checked`
  one survived — the selected card photographed with an unchecked control. The
  choice group is wrapped in a `<form>`, which is what scopes a radio group's
  name and is also the real markup.
- Deviation: in the dark scheme `elevated` separates from `outline` less than it
  does in light. Both rest on `--slotted-surface-raised` and the difference is
  carried by a shadow, which is a light-scheme device; Material 3 and Fluent
  express dark elevation with a lighter _surface_ instead, and this theme's three
  surfaces offer no fourth step to lift to. Left as it is rather than adding a
  surface step to the foundation for one fill of one family.
- Defect found at review, fixed: hovering an `elevated`, a `subtle` or **any**
  selected card removed its edge outright. A state value referenced the value the
  state sets — `--_card-edge-hover: var(--_card-edge)`, meant as "hold the edge
  still", against a hover rule setting `--_card-edge` from `--_card-edge-hover`.
  CSS resolves a cycle to the guaranteed-invalid value, so the `border` shorthand
  became invalid at computed-value time and fell back to no border. Resting,
  state and current are now three names — `-rest`, `-hover`/`-active`, and the
  live one — and a state value may only reference a resting one.
  `card.styles.test.mjs` holds that rule for all three properties, because the
  visual loop did not catch it: only the `outline` card was ever hovered, and it
  is the one fill with no cycle. Every fill and the selected card are now
  photographed hovered, and the destination card in the harness became `elevated`
  so that fill reaches a scene where hover and press can be captured at all.
- Defect found at review, fixed: an interactive card showed the default arrow.
  The link's stretched hit area carried the pointer already, so only the chooser
  was left without one over a surface that is entirely clickable. The interactive
  card sets `cursor: pointer`, and a choice card's descendants inherit it rather
  than reverting to a text caret over a `<label>` that will not make a selection.
- Decision reversed on evidence: `accent-color` on the selection control is gone.
  The accent is a dark blue, so on a dark card the platform had to draw the
  checked radio's mark and ring in white against it — a white ring brighter than
  the card's own selected edge. Untinted, the control follows `color-scheme` and
  reads correctly in both schemes. It is the same boundary the part is drawn on:
  tinting the check was already reaching into what `checkbox radio-group` owns.
- Defect found in the family test itself: its CSS normalizer collapsed whitespace
  around `{};,:` but not inside parentheses, so a declaration the formatter had
  wrapped across lines read as `var( --token` and was reported absent purely for
  having grown too long for one line.
- Follow-on: when `checkbox radio-group` ships in wave 3, its control drops into
  `data-part="selection"` with no change to this family — the slot already gives
  it the column, the size, the optical alignment and the surrounding states, and
  the brand-coloured check arrives with the family that owns the geometry.

## Button family, rebuilt again — 2026-09-01

The first rebuild reached the human gate and was refused there: "a aparência dos
botões não me agrada, a variante soft é desnecessária, botões mudando de estado
estão alterando tamanho, features faltando, sem refino." Four complaints, three
of them measurable. This entry records what each one turned out to be.

- **The layout shift was real, and it was the pressed toggle.** `[data-pressed]`
  raised `border-width` from thin to thick. The comment beside it claimed a
  border-box control does not change size, which is true only when the size is
  definite: a button is intrinsically sized, so its inline size is content plus
  padding plus border, and every control beside a toggle moved two pixels when
  it was switched on. The second attempt moved the extra weight to a `::after`
  ring inside the border box, which cost no space and was refused at the gate
  in turn — "por que os toggles estão com duas bordas" — because a ring one
  pixel inside a border of the same colour is a control with two edges. A
  pressed toggle is now the tone's fill and one edge, like every other control,
  and `aria-pressed` is what announces the state.
  `button.styles.test.mjs` gained a test that walks every stateful selector in
  the sheet and refuses `border-width`,
  `padding`, `margin`, `inline-size` or `block-size` under any of them, so the
  defect cannot come back by a different route.
- **A second layout defect nobody had reported.** `padding-block: var(--slotted-space-2)`
  is added to the label's line box, and at the `dense` density the small step is
  24px, the medium 26px, and the line box already 17.4px — so four pixels of
  padding took both steps to the same 27.4 pixels. Density stopped meaning the
  height the theme states and two steps of the scale collapsed into one. The
  padding is gone; a wrapped label is kept off the border by the half-leading
  its own line height already carries, which is the same three pixels. The test
  now computes the line box against every density and step.
- **`soft` is removed**, as the reviewer asked. Three ways to paint one tone is
  one more than a page can tell apart, and the pale tinted fill read as a
  control on its way to being unavailable rather than as a quieter action. The
  `surface` role each tone carries goes unread by this family and stays with the
  families a tinted rectangle is — `badge`, `tag`, `alert`. Consumers move
  `variant="soft"` to `variant="outline"` for a bounded quiet action and to
  `variant="ghost"` for an unbounded one.
- **The appearance, in three changes.** An outline button's edge is now neutral
  (`--slotted-border-strong`) and its label carries the tone: a saturated border
  on all five tones turned a row of actions into a row of status chips, and the
  eye read five colours of rectangle before it read a single word. A solid
  button's edge is its own fill rather than the tone's `border` role, which read
  as a halo around the shape. And the side of a control that holds a glyph is
  inset less than the side that holds a letter, because a glyph reaches closer
  to the edge of its box — measuring one padding against two different shapes is
  what made icons look pushed towards the middle.
- **One fill cannot be its own edge, and how strong that edge may be took three
  attempts.** Against the surface they sit on, `--slotted-tone-secondary-solid`
  is 1.23:1 in light, 1.25:1 in dark and 1.00:1 in `high-contrast`, where it is
  the page's own white. The first attempt gave it — and `warning`, at 1.53:1 —
  `--slotted-border-strong`, a neutral. The second gave both the tone's own
  `border` role. Both were refused, and the second refusal named the answer:
  "a borda do secondary solid tem que ser bem suave, apenas um pouco mais escura
  que o bg; a borda do warning solid deve ser a mesma cor do bg." So `warning`
  has no override at all — its edge is its fill — and `secondary` takes the next
  step of its own ramp, `--_solid-hover`, which is one shade darker than the
  resting fill and nothing more. A filled neutral button is a quiet control, and
  an edge that announces itself turns it into an outline button wearing a fill.
  With `--_border` unread, the family no longer consumes the tone `border` role
  at all; it stays with the families that need a stated boundary.
- **The missing features were four, and all four are in the field.** The step-3
  inventory put ten implementations beside the family and named them:
  substituting the rendered element (`render`, shipped by Base UI, Chakra, MUI
  and Radix; Angular needed none, because every member there is a directive on
  the element the consumer wrote); setting the family's defaults once for an
  application (`ButtonDefaultsProvider` and `provideButtonDefaults`, the pattern
  `card` already ships, and shipped by Ant, MUI and Chakra); staying focusable
  while unavailable (`focusableWhenDisabled`, shipped by Fluent as
  `disabledFocusable`, by Primer as `inactive`, and implied by React Aria's
  pending button); and a wait that keeps the label.
- **Loading was rebuilt around what the field does better.** The ring takes the
  first visual slot the control has — Primer's decision — because that box was
  already the size of it, so the label stays readable and nothing moves. Only a
  control with no slot fades its label under a centred ring. The wait is
  announced by a named `progressbar` in the accessibility tree with the control
  carrying `aria-disabled` and keeping focus, which is what React Aria's pending
  button and Primer's loading button both do; `aria-busy` is gone, because it is
  not reliably announced on a button and two mechanisms for one fact is one too
  many. `loadingDelay` separates the refusal from the picture: the action is
  refused from the first millisecond and the spinner can wait, so a ninety
  millisecond action does not flash one. Ant Design is the only surveyed library
  that separates the two. `toggleButton` gained `loading` as well — "Follow" and
  "Subscribe" reach a server before the state is true, and while it waits the
  toggle holds the state it still has.
- Decision: the ring's stroke is `calc(var(--_icon-size) / 8)` rather than a step
  of the border scale. That scale holds two widths, and two pixels is a sixth of
  the ring at the dense small step and a ninth of it at the large one — the same
  ring reading as a thin hoop in one control and a thick donut in another.
- Decision: `--slotted-control-radius` was left alone at 4px. Raising it to 6px
  would have been the single largest change to how the family reads, and it is a
  semantic token twenty-four stylesheets consume; changing it here would restyle
  the legacy families the rebuild has not reached, without rebuilding them.
- Decision: no motion on press. The `:active` colour step already carries "the
  control received the press", and the motion law refuses a transition that
  carries no information the control does not already state.
- Decision: `focusableWhenDisabled` is the shape of the `disabled` capability
  rather than a capability of its own. `focusable` already exists in the shared
  vocabulary with a different meaning — `visually-hidden` uses it for content
  that appears on focus — and one name for two ideas is worse than a longer prop.
- Defect found, fixed first: the workbench could express a snippet only as
  `angular`, `css` or `tsx`. An application sets a family's defaults in a
  bootstrap file, which is TypeScript and not a template, so the Angular page
  could not show its own answer without mislabelling it. `SnippetLanguage`
  gained `ts`, and `verify-docs-snippets.test.mjs` grew the distinction the
  addition exposed: a language that is not the _other_ framework's code, and a
  snippet that is the _same snippet_ on both pages. Only a stylesheet is the
  second, so only a stylesheet snippet's id may name no framework.
- Deviation, and it is the one place the family does not fully answer: in the
  `high-contrast` scheme `--slotted-tone-secondary-solid` is the page's own
  white, so a pressed neutral toggle paints a white chip with a soft edge next
  to an unpressed outline toggle whose edge is black — the state reads, but it
  reads _weaker_ than the state it replaced. Two attempts to correct it inside
  the family were refused at the gate and both were right to be: a thicker
  border moves the row, and a second edge is a second edge. A `solid` role whose
  value equals the surface is not a fill, and that is where it is fixed. The
  ramp is not retuned here because `badge`, `tag`, `alert` and `avatar` consume
  it and are still on schema 4. Recorded rather than papered over.
- Deviation: `--slotted-tone-warning-solid` is 1.53:1 against the surface in
  light and in high contrast. Left as the tone states it, on the reviewer's
  instruction that a warning fill takes no edge but its own.
- Follow-on: when `progress-indicator` ships later in this wave, the ring stops
  being drawn by `button.css` and reads that family instead. The `progressbar`
  role and the accessible name are already where they need to be.

## Container — 2026-09-01

- **The family is a three-track grid, not a box with a maximum.** The root lays
  a start gutter, the bounded column and an end gutter, every child is placed in
  the column, and a `breakout` child spans all three. A box bounded by its own
  `max-inline-size` has no track to offer a child that must reach both edges,
  and the inset for the same reason is a floor on the two gutters rather than
  padding on the box — padding would inset the breakout too, which is the one
  thing it exists not to be. `align` is the growth limit of a gutter: `1fr`
  takes a share of the free space, `var(--_inset)` pins the gutter to its floor.
  Track order follows the writing direction, so `start` and `end` mirror with no
  second rule; verified in the right-to-left capture.
- **Measure is counted in characters.** `size="measure"` states `65ch`. Eight of
  the nine surveyed sources state a maximum in pixels, and a pixel maximum gets
  _longer_ in characters when the reader enlarges the text, which is the
  opposite of what a measure is for. Only Tailwind Typography counts characters,
  and it is not a container. WCAG SC 1.4.8 caps a line at eighty characters and
  technique C20 asks for a relative measurement; `ch` is the advance of "0",
  wider than the average glyph in a proportional face, so sixty-five of them
  land under the ceiling rather than over it. Counted in the 720-pixel capture:
  the bounded line breaks at sixty-eight characters, the unbounded one at
  eighty-eight.
- **The missing capability was one, and one library ships it.** The step-3
  inventory put nine implementations beside the family. Everything else was
  either already in the scope paragraph or declined with the family that owns it
  named. The exception is the escape from the bound: only Mantine ships it, and
  only behind a `strategy` axis whose job is to change the container's
  formatting context, so the breakout works in half the containers and the
  consumer has to know which half. Here `breakout` is a part with no switch. It
  answers the container rather than the viewport, so unlike the common
  `margin-inline: calc(50% - 50vw)` recipe it is still correct nested, inside a
  scroll region, and in a container that does not fill the page.
- Decision: the size steps are named for what they bound — `measure`,
  `content`, `wide`, `full` — and not `sm`/`md`/`lg`. That triple is this
  library's word for control geometry, and a container's maximum is chosen by
  what is inside it; a letter hides the choice. Departure from the naming
  convention `button` and `card` follow, taken deliberately. There is no `form`
  step: it would sit between `measure` and `content` close enough to either to
  be a coin toss, and a step nobody can choose correctly is worse than one
  fewer.
- Decision: the default is `content` and not `wide`. All four surveyed libraries
  that state a default choose their widest bounded step. A dashboard that
  inherits `content` looks too narrow the first time it is opened and is
  corrected; a settings page that inherits `wide` merely has lines that are
  somewhat too long, which nobody reports. The briefing's tiebreaker is the
  option that fails more loudly.
- Decision: the root is always a grid, and the cost is that a run of text
  written directly inside it becomes an anonymous item nothing can select, so it
  is auto-placed into the start gutter. Photographed rather than asserted, in
  the `extremes` scene: the string sits flush to the start edge, inside the
  gutter, with no inset. Accepted because `stack` and `inline` are flex
  containers and `grid` is a grid container, so every layout family here already
  turns its children into items; because the alternative is Mantine's opt-in
  axis; and because the failure is visible the first time it renders. Written on
  both reference pages and in the family's own comment.
- Decision: no container query and no `container-type: inline-size` on the root.
  The family answers its own inline size intrinsically — `min()` collapses the
  column, `minmax()` floors the gutters — continuously, with no step to be
  unstable around. Declaring `container-type` would remove the container's
  inline contribution to its parent's sizing, the cost `card` records for its
  horizontal orientation, and buy nothing, because nothing here reflows.
- Decision: the inset does not answer density, and neither does any maximum.
  Density in this foundation is control geometry, and `stack` already wrote the
  rule for the layout families. A page frame that moved every time a table got
  denser would be the page reflowing for no reason. Confirmed by capture: the
  dense and comfortable images are identical but for the caption word.
- Decision: `--slotted-container-measure`, `-content` and `-wide` stay family
  tokens and are not proposed for `packages/tokens/src/contract.json`. The
  foundation has no scale of widths — space stops at `4rem` and is about
  separation, not extent — so all three state a literal, each with its reason in
  the stylesheet. Three values read by one family is not a scale. If `page`,
  `app-shell` or `page-header` later need the same maxima they read these three,
  and promotion becomes a decision with evidence behind it.
- Decision: the declared capability is `size` alone. `arrangement` obliges a
  reference page to document `gap` and `justify`, and this family ships neither:
  separation is Stack's, and there is one thing to place.
- Deviation: none. No token was retuned, no shared tool was changed, and no
  defect in the harness, the schema or the workbench was found while building
  the family.
- Follow-on: `page` and `section` in wave 4 own the block rhythm and the
  header/body/footer regions, which is why Container injects no vertical page
  padding. When they land they compose with this family rather than restating
  the bound.

## Badge, rebuilt — 2026-09-01

Wave 2, mode `refazer`, guide section 10. Design and capability inventory in
`docs/superpowers/specs/2026-09-01-badge-family-design.md`.

What shipped: one member, three parts — `root`, `icon`, `anchor` — with the axes
`tone`, `variant`, `size`, `shape`, `live`, and `placement`/`overlap` on the
frame. `count`, `max`, `showZero` and `locale` are the counting inputs.
`BadgeDefaultsProvider` and `provideBadgeDefaults` set them once for an
application. `badge` leaves `specs/legacy-families.json` in the same commit.

- Decision: the inline metadata chip and the count anchored to another element
  are one family. Four of the eleven surveyed implementations ship only the
  first, four only the second, and Fluent ships both as separate components.
  They are one box here — one tone, one edge, one type scale — and the
  anchoring is a frame around it. No other family owns it: `avatar` owns its own
  slot and `status-indicator` owns a standalone operational state.
- Decision: `anchor` is a part, and it is the one part in the library that
  contains its family's root instead of sitting inside it. It therefore carries
  `data-ui="badge"` itself, and every rule in the stylesheet names both
  `data-ui` and `data-part` so a rule meant for the box never reaches the frame.
  A `data-part` with no reachable family identifier would be selectable only by
  a name no family owns; a second member would put two `data-ui` roots inside
  each other with the same `root` part name and no way to tell them apart.
- Decision: `variant` and `tone` swap places, and `subtle` becomes `soft`. The
  old contract had `variant` naming the colour and `fill` naming the painting,
  which is the reverse of what `button` settled. Cost: a rename at four call
  sites — the Collapsible and VirtualList reference pages in both bindings — and
  a break table in the design.
- Decision: the default `variant` moves from `solid` to `soft`. A badge is
  metadata, and a page of solid grey pills reads as a page of controls. A badge
  that relied on the default now renders tinted; `variant="solid"` restores it.
- Decision, taken at the human gate after the first pass drew a rim on every
  filled chip: `solid` draws no edge — its edge is its own fill, so the chip is
  one shape. A rim on a filled badge reads as a second, quieter chip behind the
  first, and it was what made the three variants look like three weights of one
  rimmed chip instead of like filled, tinted and outlined. `soft` and `outline`
  keep the tone's `border` role; `soft` needs it because in `high-contrast`
  every tone `surface` collapses to the page's own white, and there it converges
  with `outline`, which is what that scheme is for.
- Decision: `secondary` is the one exception to both rules, because it is the
  one tone whose fill is the page's own colour. Its `solid` role is `#ffffff` in
  `high-contrast` and 1.23:1 against the light surface, and it is the same value
  as its `surface` role in all three schemes — so a filled neutral badge was
  invisible in one scheme and identical to a tinted one in the others. It now
  fills with the tone's `solid-hover` step (1.48:1 in `light`, 1.78:1 in `dark`,
  and `#e6e6e6` in `high-contrast`) and keeps the tone `border` as its edge.
  Every other tone carries its own boundary. Button reached the opposite
  conclusion for its `outline` — a neutral edge, tone in the label — because a
  row of actions is not a row of status chips. A badge is a status chip.
- Decision: the words get a box of their own, `label`, and the glyphs move to
  `start` and `end` — the anatomy `button` already uses. It is what makes the
  family's one real typographic problem solvable. A flex container centres the
  line box, and a line box is not symmetric around the letters inside it:
  measured here, a word with no descender sat 2.19 pixels high in a 24-pixel
  badge, six pixels of clearance above the ink and eight below, while a word
  with a descender looked correct. `text-box: trim-both cap alphabetic` trims
  the line to the cap and the baseline so the _ink_ is what gets centred; it
  needs a block container, and a flex container's own text lives in an anonymous
  item no selector can reach. Measured in Chrome 150: the declaration takes an
  18.19-pixel line box to 9 on an `inline-block` and does nothing at all on an
  `inline-flex`. With the part in place the clearance is 7.59 above and 7.59
  below at every size, and `Paid` and `Pending` sit on the same optical centre.
  Guarded by `@supports`, so an engine without it renders what this family
  rendered before. The split also replaces the bespoke single `icon` part with
  Mantine's two-slot shape rather than Fluent's slot-plus-position-axis.
- Decision: no height token. The block size is the badge's own line box plus a
  symmetric inset, restated as `--_block-size` for the minimum that keeps an
  icon-only badge the height of a text one and the minimum inline size that
  rounds a one-figure count. A unitless `0` inside that sum made the whole
  calculation invalid at `sm`, so `min-block-size` silently fell back to `auto`
  for the one size that stated it; found by measuring the harness through the
  DevTools protocol rather than by reading the image.
- Decision: `dot` is a disc the width of the type it stands beside, and its rim
  is `--slotted-border-strong`. It is the only badge whose whole meaning is a
  graphic, so WCAG 2.2 1.4.11 binds its edge rather than decorating it, and
  `--slotted-border-strong` is the only border token the theme holds to 3:1
  against the surface — a `secondary` dot rimmed with its own tone border
  measures 2.56:1 in `light` and 1.78:1 in `dark`. The diameter took two
  readings of the harness: at six pixels the rim left four pixels of tone and
  every small dot read as dark, and at a free sixteen the large dot stood taller
  than the fourteen-pixel words beside it.
- Decision: the family does not animate, and the one candidate was refused with
  a reason. A count appearing at the corner of a button is a change the eye
  should follow, and `@starting-style` is how CSS would carry it — but it fires
  on every insertion, including the first paint, so a page of twenty badges
  would pop on load to buy one useful transition. CSS cannot tell a first render
  from a later change. It returns with `presence`, guide section 3.
- Decision: `live` is `off` by default. A page of twenty badges that all
  announce is a page no screen reader user can read, and WCAG 2.2 4.1.3 is about
  messages rather than every piece of metadata on a screen. `polite` writes
  `role="status"`, `assertive` writes `role="alert"`, and a `role` the consumer
  wrote is read first and never replaced — `HostAttributeToken` in Angular, the
  destructured prop in React.
- Decision: the words a dot or a colour cannot say are `visually-hidden`
  content, not a `label` part. Wave 1 shipped the family whose whole purpose is
  hidden text, and inside a flex badge it is out of flow, so `gap` reserves no
  room for it. Polaris auto-generates that label; here it would have to be an
  English string this library cannot yet translate.
- Decision: `count`, `max`, `showZero` and `locale` live in a new
  `@slotted/core/count`. Two bindings that must produce the same characters is
  two callers today, and `tag` and `avatar-group` ship the same `+N` summary
  later in this wave. The number is formatted with `Intl.NumberFormat`, which
  none of the eleven surveyed implementations does. Cost, written on both
  reference pages: an application that server-renders a count above its locale's
  grouping threshold must set `locale` on both sides, and only `max={false}`
  reaches that threshold at all.
- Decision: a count of nought removes the badge rather than leaving an empty
  pill. React returns nothing; Angular writes `display: none`, because a
  directive on an element the consumer owns cannot un-write it. Same outcome —
  no box, no layout, nothing in the accessibility tree — recorded as an
  asymmetry rather than levelled down.
- Decision: `focus-visible` is painted and `hover` and `active` are not. A badge
  is never a command, but `render` can make its root an `<a>`, and a ring that
  appears only where a family expects focus is a ring that goes missing.
- Decision, reversed at the human gate: a badge is one line and clips it with an
  ellipsis; it does not wrap. The first pass wrapped, reading the briefing's
  "truncation never removes content from the DOM" as a ban on truncating at all.
  It is not: `text-overflow` shortens nothing, so the whole string stays in the
  DOM, in the accessibility tree and findable by a page search — the rule
  forbids removing content, not clipping it. And a badge holds a count, a status
  or a short piece of metadata, so a badge that reflowed into a paragraph would
  have stopped being one: the length is the content's error and the family
  reports it. `tag` holds an entity's name and answers the same question for
  itself. An anchored count is exempt — it is short by construction and hangs
  outside its host's box, so `max-inline-size: none`.
- Finding from that change: `text-box` and `overflow: hidden` collide. A box
  trimmed to the cap and the baseline puts descenders and tall diacritics
  outside itself, and the clip beheaded them — a `g` in `Awaiting` lost its tail
  in the first capture. The label carries `padding-block: 0.3em` and a matching
  negative margin, so the clip region gains the room and the layout spends none:
  measured, the badge is still 24.19 pixels tall and the trimmed line still sits
  7.59 pixels from each edge.
- Finding, measured not argued: Chrome drops `box-shadow` outright under
  `forced-colors: active`, so the anchored badge loses its separating ring
  there. No rule was added. The ring buys breathing room over a host the badge
  overlaps; under forced colours the badge's ground is opaque `Canvas` and its
  edge is a `CanvasText` rim, so it still occludes the host's border and still
  reads as a distinct shape. Every variant of every tone was read through the
  DevTools protocol with the mode emulated, and all of them keep a one-pixel
  `CanvasText` edge on a `Canvas` ground.
- Deviation: two shared-tooling defects, each fixed first and committed on its
  own. `packages/themes/default/test/contrast.test.mjs` held every tone's
  `solid` role against its `on-solid` and never held its `surface` role against
  its `text` — the tinted pair `badge`, `tag` and `alert` are made of, and the
  one Button handed to them when `soft` left its painting axis. The theme
  already satisfies the new assertion, 4.57:1 at worst. And `alert` and `tag`
  each read their five tones out of `badge`'s contract, which held only while
  all three were on schema 4; the list belongs to the theme, so `TONES` now
  lives in `specs/contract.schema.mjs` and both tests read it from there.
  Neither legacy contract was touched.
- Follow-on: `tag` is the next invocation of this wave and converges on these
  axes; `progress-indicator` and `status-indicator` take the operational-status
  dot; `presence` returns the appear transition; `avatar-group` reuses
  `@slotted/core/count` for its `+N`.

## Button group — 2026-09-01

- **The family styles direct children and wraps nothing.** Primer's ButtonGroup
  puts every child in a `div` of its own and pays for it twice: its stylesheet
  reaches two levels down to find the control (`.Item button, .Item a`), and an
  empty wrapper needs a `:has(div:last-child:empty)` clause to undo the corners
  it caused. Here the group selects `> *`, so the DOM is the one the consumer
  wrote and every selector is one level deep. Cost: the group cannot reach a
  control nested inside a wrapper the consumer adds — the same constraint
  Mantine documents, and the same one Bootstrap's flex row has.
- **The bar's edge belongs to the bar, not to the controls in it.** This was
  wrong first and the captures are what said so. `button` repaints its whole
  border when it is pressed or unavailable — correctly, for a control standing
  on its own — and inside a joined bar that punches a hole in the frame exactly
  where that control sits: a vertical segmented control with its middle segment
  on had a visible gap in its left edge, and a bar with one segment unavailable
  had the same. The group now states the edge for `outline` and `ghost`, and
  states it for the states that would otherwise overwrite it. The control keeps
  its fill, its label and its cursor; what it gives up is the right to redraw
  the bar around itself. Specificity is the mechanism, so it is what
  `packages/styles/src/button-group/button-group.styles.test.mjs` holds: every
  border rule the group writes must outrank every border rule `button` writes,
  whatever order the two sheets happen to load in.
- **The seam between two filled controls is the darkest step of the control's
  own tone.** Also wrong first. `button` paints a filled control's edge with its
  own fill — deliberately, so the edge is not a halo — so two overlapped solid
  controls are one uninterrupted rectangle. The first attempt painted the shared
  column with `--slotted-surface`, and it failed twice: a white line through a
  filled bar cuts it into separate buttons instead of dividing one bar, and
  because the rule keyed only on the child's own variant it also appeared on the
  boundary between an outline control and a filled one, where no boundary
  belonged at all. The tone's `solid-active` role is what Primer, Material UI,
  Ant Design and Bootstrap all reach for, and it is read from `data-tone`, which
  `button` declares in public. Both inner edges are painted, not only the
  leading one, so a control raised by focus cannot show its own fill in the
  shared column and empty the seam beside it.
- **Two coincident borders are not one line, and page zoom is where that
  shows.** The joined bar overlapped its controls by one border width, which put
  two borders of the same colour and the same width in the same one-pixel
  column. That is one line at 100% and comes apart above it: the browser snaps
  each border box to device pixels on its own, so one boundary lands on a single
  column while the next lands across two, and a bar of equal dividers renders
  with one of them visibly twice as thick. Measured across 100, 110, 125, 150,
  175 and 200 per cent: five of fifteen boundaries came out uneven. Exactly one
  border is painted there now — the leading edge of the control that follows —
  and the trailing edge of the control before it is taken out of the paint. Out
  of the paint, not out of the box: a narrower border box would move the glyph
  inside an icon-only control by half a pixel, which trades one misalignment for
  another. Zero uneven boundaries at every zoom after the change.
- **Shared tool fixed for the second time: the shooter could not photograph a
  zoomed page.** The defect above reached a human review because no capture
  could show it, and the rubric's own question — whether the component holds at
  200% browser zoom — had been answered by assertion rather than by an image.
  `tools/harness/shoot.mjs` takes `--zoom <percentage>` and names it in the file,
  applying it the way the browser does. A capture taken without the axis keeps
  the name it had.
- **Only focus is lifted.** Primer, Polaris and shadcn raise a joined control on
  hover and press because in those libraries a touched control repaints its own
  edge. Here the edge is the group's, so nothing about it changes and there is
  nothing to lift. Focus is the exception: its ring is an outline drawn two
  pixels outside the border box, and without the lift it is cut by whichever
  neighbour follows it in the DOM.
- **`attached` and `collapse="stack"` do not combine, and that is a decision.**
  A joined bar does not wrap and does not stack: its shape is the point of it,
  and no surveyed implementation flips that shape at a width the consumer cannot
  see coming. Bootstrap's vertical group is a second explicit class; Spectrum's
  group is never joined at all. A joined column is `orientation="vertical"`,
  written by the consumer. Cost: a joined bar of many controls in a very narrow
  container overflows rather than reflowing. It is mitigated rather than hidden —
  every joined child but an icon-only one takes `min-inline-size: 0`, so
  `button`'s own `overflow-wrap: anywhere` breaks the label instead of the bar
  breaking the page — and photographed at 240 pixels.
- **The reflow is a container query, not a `ResizeObserver`.** Spectrum and
  Carbon both measure in JavaScript to decide whether a row becomes a column.
  `collapse="stack"` declares `container-type: inline-size` and a
  `container-name`, and every child takes `flex: 1 0 100%` below `360px`. It is
  correct in a server render, correct before hydration, and correct with
  JavaScript disabled. Cost, stated in both API tables rather than hidden: an
  element cannot both be an inline-size container and size itself to its
  contents, so a stacking group claims the inline size of its parent. `justify`
  is what places the buttons on the claimed line. `360px` is a literal because
  CSS forbids a custom property in a container condition; it sits between the
  harness's 240 and 420 steps, so both sides of the decision are photographed
  rather than argued.
- **Nothing is reordered when the group stacks.** Carbon's ButtonSet sorts its
  children by emphasis and reverses that order when stacked. Visual order would
  stop matching DOM order, which is WCAG 2.2 SC 1.3.2 failure F1 and breaks the
  Tab sequence — the same capability `stack`, `inline` and `grid` refused for
  the same reason.
- **Two devices for a boundary, and they measure the same.** A nested group
  stands half a gap further out on each side; a separator stands in the same
  place. Both derive from the group's own `gap` rather than stating a step:
  shadcn's nested spacing is a fixed half rem, which puts the clusters of a
  loosely spaced group closer together than the buttons inside them. Cost: the
  margin reads the nested group's own gap, which is the parent's whenever the
  two agree, and when they disagree the cluster is spaced by its own rhythm
  rather than by a constant.
- **Decision: the separator is a part of this family, not the `divider`
  family.** Its geometry belongs to the group — inset from the controls in a
  separated group, and inside a joined bar it takes the column the shared border
  already occupies and is drawn at the thick step. Styling `divider`'s rendered
  box from `button-group.css` would make one family's DOM a private API of
  another, which is the coupling `identity.test.mjs` exists to refuse. Cost: one
  more 1px rule in the library.
- **Decision: the rule is one border width, and a framed bar does not use one.**
  Two attempts were wrong before this. A hairline that broke the joined bar into
  two runs with a gap read as two groups with a stray line between them; a
  `--slotted-border-width-thick` line drawn to make it visible against the
  hairlines around it was worse — the capture of a vertical joined bar with a
  rule before its destructive action showed a grey slab cutting the component in
  half. The rule is a hairline everywhere. In a quiet icon toolbar it is the only
  divider there is and it is the right device; in a framed bar the shared edges
  are already that colour and that width, so a rule laid among them is the same
  line drawn twice. A framed bar separates its runs with a nested group —
  distance rather than weight — and both reference pages show it in both
  orientations. `button-group.styles.test.mjs` refuses the thick step outright.
- **Decision: the gap does not answer density.** `--slotted-control-gap-*` was
  considered and rejected: that token names the space _inside_ a control,
  between its glyph and its label, and borrowing it for the space _between_ two
  controls would be a token whose name hides its purpose. Separation between
  controls is a layout rhythm and comes from the space scale, which is
  density-invariant. Cost: at `dense` the controls shrink and the gap does not,
  so a dense group reads proportionally looser. Photographed and judged
  acceptable; a consumer who wants it tighter states `gap={3}`.
- **Decision: no group-level `disabled`.** MUI and Spectrum both ship it.
  Availability is a fact about one control, and shipping it as a provided
  default would require `button` to tell an absent `disabled` from an explicit
  `false`, which a boolean attribute cannot do — and that is `button`'s public
  contract, not this family's. The composition is two lines:
  `{actions.map((a) => <Button key={a.id} disabled={saving}>{a.label}</Button>)}`.
- **Decision: no `label` prop or input.** The element already accepts
  `aria-label` and `aria-labelledby`. A second way to name one thing is a second
  thing to get wrong, and the state-and-events law already refuses two ways to
  say one fact.
- **Decision: `role="group"` is always written, and always losable.** A group of
  buttons is several tab stops; the arrow-key model of the APG Toolbar pattern
  is one tab stop and belongs to `toolbar` in wave 4 — the line Primer draws too
  (`useFocusZone({ disabled: role !== 'toolbar' })`). The consumer's explicit
  role wins in both bindings, and each ecosystem gets the escape its syntax
  offers: React takes `role={undefined}`, Angular reads `role=""` with
  `HostAttributeToken`, which ARIA already defines as "use the implicit role".
  That is what lets a substituted `nav` keep its landmark.
- **Decision: the separator's axis is derived, never accepted.** A rule that
  could disagree with the group it divides is a rule that eventually does.
  Inside a `collapse="stack"` group it states no axis at all: which way the
  group runs is decided by the width the page turns out to have, and an
  attribute that is right above the breakpoint and wrong below it is worse than
  the one ARIA already defaults to.
- **Decision: an empty group takes no room.** `:empty` removes it from the
  layout. An actions area built from a permission filter renders an empty group
  often, and no surveyed implementation answers it — the empty box still eats a
  gap in the row that holds it, so the toolbar beside it drifts for a reason
  nobody can see in the markup.
- **Shared tool fixed first, in its own commit: the harness could not render a
  family whose subject is composition.** `tools/harness/build.mjs` loaded exactly
  one family stylesheet, so a `button-group` page showed unstyled boxes and there
  was nothing to judge. It now reads the `data-ui` values out of the fragment and
  loads those families' stylesheets before the family under review. Nothing new
  has to be declared, because the fragment already names them in the same
  attribute that is the public identifier.
- **Contract change outside this family:** `BUTTON_DEFAULTS_TOKEN` is now
  exported from `@slotted/angular/button`, and Angular's `ButtonDefaults` writes
  `| undefined` on each axis to match React's. Both are additions, neither is a
  break. The token is what lets the group provide `tone`, `variant` and `size`
  to the buttons under it through the button family's own mechanism, which is
  what keeps an explicit input on a button winning over the group. The value
  travels through getters so a button's `computed` tracks the group's signals; a
  snapshot would have fixed the paint at the moment the first button was created.
- **Deferred, with the family and the wave named:** roving focus and one tab
  stop to `toolbar` (wave 4); overflow into a menu to `menu` (wave 5), already
  recorded in `docs/rebuild-order.md`. Text and input addons inside a joined
  shape are declined to `input`/`field` in wave 3: an addon belongs to the
  field's box, reads the field's height and its invalid state, and does not
  belong to a family whose name says it groups buttons.

## Link — 2026-09-02

- **The hover of the shipped family made a link harder to read.** It painted
  `--slotted-tone-accent-solid-hover`, a fill role. In the light scheme a fill
  that darkens is also a text colour that darkens, so the defect never showed;
  in the dark scheme that token is `#1d4ed8` over a `#131316` ground. Hover now
  mixes the link's own colour toward `--slotted-text`, the colour the theme
  already holds to the highest ratio in every scheme, so the direction is
  correct without a `text-hover` role the tone scale does not have. Adding one
  would have been fifteen values across five tones and three schemes, decided
  from inside one family, for families the rebuild has not reached.
- **The underline carries the state as well as the colour.** At rest it is
  `color-mix(in oklab, currentColor 55%, transparent)` and from hover onward it
  is `currentColor`. That is what gives `variant="inverse"` a hover at all: on a
  solid surface the text colour is already the strongest one available.
- **`external` is sugar, and the warning follows the fact.** The safe `rel`, the
  visible marker and the announced hint all key on the resolved `target`, so a
  consumer who writes `target="_blank"` by hand is warned about exactly like one
  who writes `external`, and `target="_self"` alongside `external` turns it into
  a no-op. A `rel` the consumer wrote is kept rather than rewritten, because
  modern browsers already imply `noopener` for a new tab and a silently
  rewritten `rel` is a surprise nothing in the DOM explains.
- Decision: the current link is painted from `[aria-current]`, not from a
  mirrored `data-current`. `current` sits in `MUTABLE_CAPABILITIES` because
  `tabs` and `pagination` move it; a link is told. The one attribute a React
  consumer and Angular's `routerLinkActive` both already write is the platform's,
  and a family that waited for its own mirror would paint nothing for the
  consumer who never adopted one. The contract declares neither the capability
  nor the state, and `link.styles.test.mjs` asserts the absence.
- Decision: no size axis and no tone axis. `typography` owns the type scale — a
  link takes the size of the text it sits in — and `button` owns tone, because
  tone marks the consequence of an action and navigation has none.
- Decision: `visited` is opt-in and is the one rule in this family no test can
  read back. `:visited` is restricted to colour and its computed value is hidden
  from script for privacy, so the stylesheet test asserts the rule's source and
  the harness cannot photograph it.
- Decision: the glyph scale grew by one, `--slotted-icon-external`, in lockstep
  across the contract, the default theme and `docs/token-foundation.md`. A
  component-owned icon is a mask from a glyph token, so shipping the marker
  without it would have meant shipping a character. It mirrors under `:dir(rtl)`
  by the same rule the `icon` family uses: an arrow meaning "away from here"
  points the other way in a right-to-left document.
- Defect found in the visual loop: a link inside a flex or grid container — a
  `Stack`, a table cell — is blockified by the layout, and the focus ring was
  drawn around the whole column instead of around the words. `inline-size:
fit-content` fixes it and is inert for an inline link, where inline-size does
  not apply.
- Defect found in the visual loop, twice over: the marker was first glued to the
  last word with a no-break space, which also inserted a full word space and
  made "published schedule ↗" read as three things. It is a word joiner now —
  U+2060, zero width — and the distance is a token. Prettier then reformatted
  the Angular template and Angular collapsed the new line into one space,
  putting back exactly the break the joiner forbids; the rendered-text assertion
  caught it, and the template carries `// prettier-ignore` with the reason.
- Defect found, fixed first, in its own commit: the workbench's `capabilityApi`
  required an API row named `size` from every family declaring `appearance`.
  That held only while every family that paints itself also scales itself. Link
  paints three variants and takes its type from the text around it, so the table
  demanded a row for a prop the contract does not declare. `appearance` now
  requires nothing; a family that does ship a size step still documents it,
  because every default is required row by row already.
- Deviation: the Angular binding writes `rel` and `target` imperatively, not
  through host bindings. A host binding writes on every change-detection pass
  and the value meaning "leave it alone" is `null`, which removes the attribute
  — so an anchor whose consumer binds `[attr.target]` would lose it to the
  component. The cost is that Angular reads the consumer's own `target` once,
  through `HostAttributeToken`, so a _dynamically_ bound `target="_blank"` does
  not raise the warning there while React derives it from the resolved prop. The
  asymmetry is recorded rather than levelled down.
- Deviation: a disabled link that is also router-driven can still be opened from
  the context menu if the router rewrites `href` after the family withheld it.
  Click, auxclick and Enter are refused in the capture phase either way.
- Follow-on: `--slotted-icon-external` is the glyph `menu` and `breadcrumb` will
  reach for when they ship, so neither needs a second arrow.

## Avatar and Avatar Group — 2026-09-02

- **The rebuilt family was the "box with one attribute" the skill exists to
  catch.** It shipped one capability — `size`, three steps — no name, no
  initials, no colour, no shape, no group, and a `data-loaded` boolean where
  four statuses belong. Six capabilities ship now, and a second family beside
  it.
- **Contract change outside this family: the component layer is no longer
  empty.** `--slotted-avatar-size-{xs,sm,md,lg,xl}` are density-varying scale
  roots in `packages/tokens/src/contract.json`, the default theme and
  `docs/token-foundation.md`, in lockstep. A family answers density only by
  reading a token the theme restates per density, and the three scales that do
  all name a control: `--slotted-control-height-lg` is 38 pixels, so a family
  bounded by it cannot express the 64-pixel avatar every one of the fourteen
  surveyed implementations ships. It is the case the layer was defined for, and
  the bar is now written into the foundation so the next family has to clear the
  same one.
- **Contract change outside this family: the glyph scale grew by one.**
  `--slotted-icon-person` is the last step of the fallback order — reached when
  there is no picture and no name to take initials from — and it is the only
  glyph drawn as a filled silhouette rather than as strokes, because it stands
  in for a photograph rather than annotating text. A character would have been
  the alternative, and no font can be relied on to carry a silhouette.
- **New shared module: `@slotted/core/identity`.** `initialsFrom`, `toneFrom`
  and `formatNameList`, all pure. The four surveyed implementations that derive
  initials use `charAt(0)` and `toUpperCase()`: that returns half of a surrogate
  pair, drops a combining mark onto the wrong letter, and writes Turkish `i` as
  `I` where the language writes `İ`. This one segments with `Intl.Segmenter` and
  cases with `toLocaleUpperCase(locale)`, and it reads a name out of an email
  address, which is what a product passes when it has nothing better.
- **Decision: the name lives on the root, and the picture takes an empty `alt`.**
  Every surveyed implementation names the image instead, which makes the same
  avatar “Ada Lovelace” once the photograph loads and “AL” before it. Here the
  announcement is identical in all four statuses. Cost: a consumer who renders
  their own `<img>` through `renderImage` or `img slAvatarImage` and writes an
  `alt` gets two names; the Angular directive reads a written `alt` with
  `HostAttributeToken` and keeps it, and React passes `alt: ''` which the
  consumer's own spread can override.
- **Decision: `status` is an input with a report beside it, and not a state
  model.** `docs/state-and-events.md` requires a controlled and uncontrolled
  pair with a request carrying a reason for every mutable capability. A load
  event is a fact rather than a request — there is nothing to cancel, and the
  closed vocabulary in `CHANGE_REASONS` has no member that fits `the picture
arrived`. `status` is therefore not in `MUTABLE_CAPABILITIES`, the consumer's
  value simply wins over the derivation, and `onStatusChange` / `(statusChange)`
  reports it. Angular uses `input` + `output` rather than `model()` for the same
  reason: a `model()` would let the component write over the consumer's value
  the first time an image loaded.
- **Decision: `tone="auto"` is the default, and the palette is the library's own
  five.** A list of twenty grey circles is a list nobody scans, which is why
  Fluent, Vaadin, PatternFly and Ant all derive a colour. `PROJECT-PRD.md` 2.4
  refuses an arbitrary colour in the contract, and the five tones are the only
  colours whose text-on-surface ratio the theme already holds. Cost, recorded on
  the reference page rather than hidden: five colours mean collisions are
  certain in a group of six, so the colour is an aid to scanning and the name is
  the identifier. Fluent's thirty colours make the same promise less obviously
  false without making it true.
- **Decision: the group is a family, not a part.** `button-group`'s reason: a
  different element, a different set of decisions, and a member it does not have
  to be. `badge` went the other way with `anchor` because that part contains a
  badge and nothing else.
- **Decision: the summary is named by the members it stands for.** The overflow
  avatar's accessible name is the hidden members' names joined with
  `Intl.ListFormat` for the group's locale. Atlassian's default there is the
  English string “N more people”; MUI, Ant, Fluent, Chakra and HeroUI leave
  `+3` as the whole announcement. No English is shipped to make it. A group
  given a `total` larger than the members it renders knows only the names it
  holds, so it names none of them rather than a third of them, and
  `overflowLabel` is how that page supplies the rest.
- **Decision: the group never provides `tone`.** It provides `size`, `shape` and
  `variant` through the avatar family's own defaults mechanism, which is what
  keeps an explicit value on a member winning. A tone derived from a name is
  that member's identity, and a group that overrode it would paint eight people
  the same colour.
- **Decision: `max` counts the discs the group draws, the summary included.** A
  limit of five never puts six circles in a row, and below the limit nothing is
  summarised — a `+1` beside four faces is one more circle than showing the
  fifth, and says less.
- **Decision: the overlap gives the ring back before it takes its fraction.**
  The ring is drawn outside the box, so a plain negative margin hides the
  fraction asked for plus two pixels more. Measured on the harness: at `md` a
  pair of initials spans the middle 55 per cent of the box, so a quarter covered
  clips the second letter and a fifth does not. Written out rather than folded
  into the fraction, so a theme that thickens the ring does not silently eat
  another letter.
- **Decision: the raise in a stack is instant.** A member covered by the one
  after it would show half a focus ring, so hover and keyboard focus raise it.
  It changes `z-index` and nothing else: a stacking order that took two hundred
  milliseconds would leave the avatar behind its neighbour for most of the time
  the pointer is on it.
- **Decision: one transition, and it is the picture.** The photograph crosses
  over the initials at `--slotted-duration-short`, and the edge crosses with it
  — the tone's own rim gives way to the neutral one a photograph wants. Without
  the second half the rim snapped from red to grey a frame before the face had
  finished appearing.
- **Decision: an interactive avatar corrects its own hit area.** WCAG 2.2 2.5.8
  wants 24 by 24, and `--slotted-avatar-size-xs` is twenty at the two tighter
  densities. A centred `::after` grows the target and moves no layout; it is
  centred by auto margins rather than by a translation, which has no logical
  form. Cost: inside a stack the enlarged area can reach under a neighbour, and
  the raised member wins the pointer. Fluent ships a 16-pixel avatar and
  Atlassian a 16- and a 20-pixel one, and both accept a click on it as it
  stands.
- Defect found in the visual loop: `render` can make the root a `<button>`, and
  the browser draws two pixels of `outset ButtonBorder` on one. The family owns
  the edge, so the root now starts from `appearance: none; border: 0; padding: 0`
  whatever element it was written on.
- Defect found in the visual loop: a disabled photograph reduced with
  `grayscale(1)` alone keeps every luminance, so a deactivated portrait was the
  strongest thing in a row of disabled avatars. It loses part of its opacity as
  well, through one token, so the disabled ground shows through.
- Defect found in the visual loop: a filled `secondary` avatar had no edge in
  `high-contrast`, where its fill is `#e6e6e6` on the page's own white — the
  same defect `badge` fixed for the same colour. `--_solid-edge` is the tone's
  own fill for four tones and its border role for the neutral one.
- **Shared tool fixed first, in its own commit:
  `scripts/verify-token-foundation.test.mjs` read `\Z` as a regular
  expression.** JavaScript has no `\Z`: it matches the letter Z. The section
  capture therefore ended at the first capital Z in the document, which nothing
  noticed until a glyph's path data ended in the `Z` that closes an SVG subpath,
  and the row holding it was read half a cell short.
- **Shared tool fixed first, in its own commit: the same file refused any
  density token outside `--slotted-control-`.** Its stated rule is about
  aliases — the theme raises the control tokens under `@media (pointer: coarse)`
  and a family reading an alias never sees the larger target — and its
  implementation was about names. It now refuses a density token whose _value_
  reaches the control scale, and requires any other density scale to be
  documented the way control geometry is.
- **Contract break, and how a consumer moves.** `class="slotted-avatar"` and
  `data-slotted-component` become `data-ui="avatar"`; `data-loaded` becomes
  `data-status="loaded"`; `sm`/`md`/`lg` at 28, 40 and 56 pixels become five
  density-varying steps, where `sm → sm`, `md → lg` and `lg → xl` reproduce the
  old sizes most closely at `comfortable`; React's `AvatarImage` and
  `AvatarFallback` become `src`, `children` and `renderImage`; Angular's
  required `span[slAvatarFallback]` child becomes optional, and
  `img[slAvatarImage]` stays. The full table is in
  `docs/superpowers/specs/2026-09-02-avatar-family-design.md`.
- **Deferred, with the family and the wave named:** the tooltip carrying each
  member's full name to `tooltip` (wave 5) — the name is not lost meanwhile, it
  is the avatar's own accessible name in every status; the overflow that opens
  the hidden members to `popover` and `menu` (wave 5), with `render` on the
  member avatar as the composition until then; presence and status marks on the
  corner to `badge`, which shipped in this wave with the `anchor` part and
  `overlap="circle"` built for exactly this.
- **Not verified on this machine:** the harness runs headless Chrome with no CJK
  font, so the Japanese name in the `identity` scene photographs as two tofu
  boxes. The initials themselves are correct — `@slotted/core/identity` is
  tested against `山田 太郎`, `Ада Лавлейс` and `محمد صلاح` — but what a reader
  with those fonts installed sees has not been photographed here.

## Tag, rebuilt — 2026-09-02

- **Mode:** `refazer`, wave 2, guide section 10. The family leaves
  `specs/legacy-families.json` in the same commit. The design, the twelve-source
  capability inventory and the itemized pattern comparison are in
  `docs/superpowers/specs/2026-09-02-tag-family-design.md`.
- **Decision: the root is never the interactive element.** A `button` cannot
  contain a `button` and an `a` cannot contain either, so a chip that both acts
  and removes has to put its two controls side by side. One anatomy answers
  every case — `root` (span) › `body` (span, button or anchor) + `remove`
  (button) — which is what removes the branch Primer carries
  (`hasMultipleActionTargets`), the two sibling components Fluent ships, and the
  grid React Aria and Angular Material reach for. The cost is one element on a
  static tag, paid for by one selector set, one padding decision, one clipping
  rule and one harness fragment instead of two of each.
- **Decision: four members, because the guide's rule is structural.** "Nunca
  vários comportamentos implícitos ao mesmo tempo" is enforced by which member
  you reach for rather than by documentation. There is no prop that adds a
  second behaviour. In Angular the element _is_ the member: `slTagBody` on a
  `span`, a `button` or an `a`, which is what keeps `routerLink`, `type` and
  `download` on the element that owns them.
- **Decision: the group is a Toolbar, not a Grid.** APG has no tag pattern —
  the pattern index was read programmatically, thirty-two entries, neither
  "tag" nor "chip" occurs. Toolbar is one tab stop with arrow keys over every
  control in DOM order, which reaches the remove button without a second axis.
  Grid buys that axis at the price of two wrapper elements per chip and a
  `gridcell` role over every button, and a single wrapping run does not need
  it. Cost recorded: a screen reader announces "toolbar" rather than "list,
  five items"; a run of static tags is written `role="list"` instead.
- **Decision: a selected chip announces `aria-pressed`.** `aria-selected` is
  only valid inside a `listbox`, a `grid` or a `tree`, and an `option` may not
  contain the remove control this family puts beside the label. Carbon's
  `SelectableTag` reaches the same conclusion; Angular Material reaches the
  other one and gives up the remove button inside `MatChipListbox`. The
  family keeps `selected` as its own word and writes `data-selected`.
- **Decision: removal is a request and never state.** The tag does not own
  whether it exists; its consumer's collection does. Ant is the one surveyed
  implementation that removes itself, and a component that renders nothing while
  the consumer's array still holds the item is the desync
  `docs/state-and-events.md` exists to prevent. `cancel()` still means
  something: it is what stops the group from moving focus.
- **Decision: the remove control's name is composed, not repeated.**
  `aria-labelledby` joins a hidden word to the tag's own label, so it announces
  "Remove Design". Four surveyed implementations make the consumer write that
  string by hand and keep it in step with a value that changes.
- **Decision: the chip's height is floored at `--slotted-target-min`, and the
  remove control is a square as tall as the chip.** `docs/token-foundation.md`
  names this family's remove control as the case a theme cannot correct on the
  family's behalf. A hidden hit area larger than the chip would reach past it
  and take the pointer from the neighbour in a wrapped run, so the geometry is
  the target rather than a box drawn around one.
- **Decision, and a gap in the foundation: a tinted chip's hover is a state
  layer.** The tone ramp has no step past `surface` for a tinted ground —
  measured in the light scheme, `subtle-hover` is `#f1f5f9` against a `#e2e8f0`
  ground and `subtle-active` is that ground exactly — so a `soft` chip hovering
  to a tinted role either lightened or did nothing. `solid` and `outline` step
  along the ramp as `button` does; `soft` mixes its own text colour over
  whatever ground it has, at a strength two component tokens carry. The
  foundation could instead grow a `surface-hover` and a `surface-active` role
  per tone: thirty authored values across five tones and three schemes, plus
  their contrast rows. Raised at the gate rather than taken here.
- **Decision: `unicode-bidi: plaintext` on the label.** A tag holds a value
  somebody typed, and its direction is the value's own rather than the page's.
  The right-to-left capture asked the question: a Latin value with leading
  punctuation was reordered by the paragraph around it.
- **Shared tool fixed first, in its own commit: `createRovingTabindex` ignored
  reading direction.** It treated `ArrowRight` as "next" in every document, so
  a collection ran backwards in a right-to-left page. It now reads the
  container's computed `direction`. `tabs` is the only existing caller and is
  unaffected in a left-to-right document.
- **Shared tool fixed first, in its own commit: the contract schema had no
  capability for removal.** `removable` joins `KNOWN_CAPABILITIES` and stays out
  of `MUTABLE_CAPABILITIES`, because a removal request carries no value a
  consumer can own.
- **Shared tool fixed first, in its own commit: the reference-page gate demanded
  the wrong prop for `selection`.** `capabilityApi.selection` required an API row
  named `value`, which is the shape `tabs` has and not the shape a single
  selectable chip has. Every declared default is already required row by row, so
  the entry is empty and both families document their own.
- **Core gained one module: `@slotted/core/focus` `createRemovalFocus`.** Where
  the keyboard goes when the item it was on is taken away — the control that
  took its place, then the last control, then the container. React Aria and
  Angular Material both move focus to a neighbour and neither says what happens
  when there is no neighbour left; the third step is why the group carries
  `tabindex="-1"`. It observes the DOM rather than being told, so it is correct
  whichever way the item left, and the two bindings cannot disagree.
- **Contract break, with the moves written:** `variant` → `tone`, `fill` →
  `variant` (`subtle` → `soft`), the class selector → `data-ui`,
  `data-slotted-component` → `data-ui`, `<TagRemove>` → the `remove` part
  rendered by `onRemove`, the words → the `label` part, and a third size step.
  The full table is in the design document.
- **Asymmetry recorded:** React infers `removable` from whether `onRemove` was
  passed; Angular states it, because Angular cannot see whether an output was
  subscribed. The same asymmetry `button` recorded for its own toggle.
- **Deferred, with the family and the wave named:** the tooltip that discloses a
  truncated value, to `tooltip` (wave 5, guide section 8) — Carbon and PatternFly
  both ship it, and measuring whether the ellipsis is active is a layout read the
  family would do on every render. The editable chip, to `tags-input` (guide
  section 6): it is a text field wearing a chip and needs the field's validity
  and its commit-and-revert keys. The overflow "+N" surface, to `popover` and
  `tooltip` (wave 5); the count itself composes today, and the three lines are on
  the reference page.
- **Declined, with the composition written:** selection across a group. The
  group would have to own a collection whose members are also individually
  removable and individually navigable, which is a listbox with the wrong
  element inside every option. Each `tagToggle` owns its own `selected`; a set
  is the consumer's own state and one `selected={set.has(id)}` in its map.
- Defect found at the gate: the initials read the last "word" of a name even
  when that word is not part of the name. `Ada Lovelace (she/her)` reduced to
  `AS` and `Ada Lovelace <ada@example.com>` to `AA`. Bracketed content — round,
  square, curly and angle — is dropped before the words are counted, and read
  anyway when dropping it would leave nothing, so `(anonymous)` still gives `A`.
  Fluent is the only surveyed implementation that removes parenthesised content;
  the other three that derive initials all read it. Leading punctuation was
  already stepped over and is now held by a test of its own — `¿Ada?`, `“Ada”`,
  `@ada`, `🎉Ada` all give `A`.
- Decision: a figure is an initial only when the word holds no letter. A digit
  is content rather than punctuation — `3M` and `7-Eleven` are names whose
  initial is one — so `3M` reads `M`, `Studio 54` reads `S5`, and a name that is
  only figures still gets its figure rather than nothing.

## Twenty-one families removed — 2026-09-02

- **What went.** `alert`, `breadcrumb`, `collapsible`, `description-list`,
  `field`, `fieldset`, `file-upload`, `input`, `kbd`, `loading-bar`,
  `pagination`, `progress-bar`, `skeleton`, `spinner`, `splitter`, `stepper`,
  `switch`, `tabs`, `textarea`, `toolbar` and `virtual-list` — their contracts,
  stylesheets, both bindings, both reference pages and every entry point.
  Eighty-four directories, and the export maps, barrel exports and build
  entries that named them.
- **Why.** They were written before the `/component` skill existed, so none of
  them went through a capability inventory, a sourced pattern, a render-and-look
  loop or a human gate. Each is being rewritten from zero, and a rewrite starts
  cleaner from nothing than from a shape nobody would keep.
- **What stays.** The fifteen families that were built through the skill:
  the button family, `avatar`, `avatar-group`, `badge`, `button-group`, `card`,
  `container`, `divider`, `grid`, `icon`, `inline`, `link`, `stack`, `tag`,
  `typography` and `visually-hidden`.
- **The entries above this one are not deleted.** A build log is the memory of
  why things are the way they are, and several of those entries carry decisions
  that still bind the families that remain — the tone surface, `core/measure`,
  the layered token foundation and the ratchet. An entry describing a family
  that no longer exists is history; this entry is what stops it from being read
  as inventory.
- **Consequence: `specs/legacy-families.json` is empty.** Every family in the
  repository now satisfies schema 5, so the ledger has nothing left to hold. It
  stays as the ratchet it is — the list may only shrink, and nothing may be
  added — and it is now a list of nothing.
- **`docs/rebuild-order.md` is unchanged.** The queue is the plan for writing
  these families again, and every one of the twenty-one is still in it, in its
  wave, with its scope paragraph. None of them claimed to be delivered.
- Defect found at the gate, and the worst one in this family: every avatar's
  edge painted over every neighbour. The edge is a `::before` carrying
  `z-index: 1`, and a positive `z-index` on a pseudo-element of a box whose own
  `z-index` is `auto` promotes it into the nearest ancestor stacking context
  rather than into its own — so in a stack each member's rim was drawn across
  the face on top of it. It was inconsistent as well as wrong: the one member
  the pointer had raised carried `z-index: 1` on the root and therefore did
  create a stacking context, so it alone behaved. `isolation: isolate` on the
  root makes an avatar paint as one thing, which is what it is. It was visible
  in the captures before the gate and was read past.

## Button — the ink, and the wait — 2026-09-02

Two changes to the family that was already rebuilt twice, both asked for by
name: `text-box` on the label, and a loading treatment shaped like JetBrains
Ring UI's rather than a spinner.

- **Decision: the label's line is trimmed to the cap and the baseline.** A flex
  container centres the line box, and a line box is not symmetric around the
  letters in it. Measured on this family before the change, the ink sat 1.2
  pixels above the centre of the glyph beside it at every step of every density
  except two, where the rounding of the font size made it 0.92 and 0.16 — the
  label and the icon were centred against different things.
  `text-box: trim-both cap alphabetic` centres the ink instead, and the residual
  is 0.13 to 0.41 pixels, which is the difference between the engine's `cap` and
  a canvas measurement of it. Guarded by `@supports`.
- **Finding, and the reason `badge`'s pattern could not be copied:** trimming a
  label that _wraps_ also takes the half-leading off the top and bottom of the
  whole block, and in this family that half-leading is the only thing keeping a
  wrapped word off the border — the root carries `padding-block: 0` deliberately,
  because a padding there collapsed two density steps into one. Measured, the
  bare trim took a two-line control from 36.78 pixels to 28.39 and put its
  descenders two pixels _below_ the bottom edge. `badge` pays for the trim with
  `padding-block` and a matching negative margin, which cancels: it needs the
  room only for a clip, and `badge` does not wrap. This family pays with
  `padding-block` and no margin, so the leading comes back symmetrically — the
  ink stays centred and the two-line control measures 36.77 against 36.78.
- **Decision: the wait is a band crossing the control, not a ring over its
  label.** What it buys is the words. The ring had to be drawn over the label of
  a control with no visual slot, so the reader lost the name of the action they
  had just pressed; the band is painted behind everything on `::after`, and the
  label and the glyph both stay where they were. The ring stays in the document
  — it is the element carrying `progressbar` and the name of the wait — and
  steps out of the flow rather than out of the tree, which also gives the glyph
  its width back.
- **`currentColor` is the band, and that is what makes it answer every tone and
  every variant without a token of its own.** It is the ink the control is
  already writing its label with, so it contrasts with that control's ground by
  construction: the on-tone colour over a filled control, the tone itself over a
  bare one, and whatever the scheme remapped either to. Read in `light`, `dark`
  and `high-contrast`, and the one adjustment is strength.
- **The two grounds do not take the same ink the same way, and the first pair of
  numbers had it backwards.** A saturated fill is already far from the page, so
  the band has only the distance between the fill and the label to work in and
  needs most of it; a bare variant lays the same ink straight on the page, where
  nothing dilutes it and half as much reads louder. 0.22 filled against 0.14
  bare was refused at the gate — "o shine dos sólidos estão mais difíceis de
  perceber" — and 0.34 against 0.18 is what three levels read against each other
  in `light` and `dark` settled on. 0.46 was the level above: the band stops
  being a band and becomes a gloss over the fill, and on `warning`, the one tone
  whose label is dark, it turns into a shadow.
- **The band is a tile, and the tile is what sets the speed.** One repeating
  tile of `--_sweep-width`, travelled exactly once per cycle, is a loop with no
  seam, and moving the background rather than the box keeps it inside the
  control with no second element to clip it. Two control heights per
  `--slotted-duration-loop` puts two or three bands across a button that holds a
  phrase — a train crossing the control is what reads as waiting, and a single
  band wide enough to cover it reads as a gradient someone left on. Five heights
  was tried first and read as exactly that.
- **Decision: the ring is what the family does, and the band is the
  enhancement.** Both conditions are written as what the band needs —
  `prefers-reduced-motion: no-preference` and `not (forced-colors: active)` —
  rather than as an undo, so an engine that drops either is left with a state
  rather than with nothing. The band has no still form: one frozen halfway
  across a control is a rendering fault. Under forced colours the engine drops
  its gradient outright, which is the same class of finding as `box-shadow`
  under the same mode in `badge`. An icon-only control keeps the ring for a
  third reason: it has no label to spare, and a sweep across a box the size of
  one glyph is a flicker rather than a direction.
- **The band travels with the reading direction.** `:dir(rtl)` mirrors the
  gradient and reverses the animation; a band running against the text reads as
  undoing rather than as progressing.
- **A test was narrowed rather than satisfied.** `says pressed with a fill` had
  been written as a ban on `::after` anywhere in the sheet, which was a proxy
  for the second edge an earlier rebuild drew on a pressed toggle. It stopped
  holding the moment the family had a second thing to draw. The guard is now on
  the pressed selector, which is what it was always about.
- **Defect found while looking, and not caused by either change:** the React
  `states` story passed its trash glyph as children, so it landed inside
  `[data-part='label']` instead of the start slot and rendered at Lucide's own
  24 pixels inside a 26-pixel dense control. Every other story in the file uses
  the `start` prop. The trim made it obvious rather than made it happen — a
  trimmed line box no longer grows to accommodate an oversized inline glyph.
- **The `loading` scenario now carries the matrix.** One row of the interactive
  trio, then every tone against every variant with and without a glyph, then the
  three sizes — in both bindings, under the scenario id the contract already
  declares, so nothing in `specs/components/button/contract.json` moved.

## Skeleton, rebuilt — 2026-09-02

- **What it was.** One `span` with one attribute: `shape`, three values, one
  part, one state, keyed on `.slotted-skeleton`, identified by
  `data-slotted-component`, animating a literal `1.6s`, with a circle hard-coded
  to `2.5rem`. The August entry ended by handing the announcement to "the region
  the placeholders are in" — a region that did not exist. This rebuild builds it.
- **Three components, one family, five parts.** `Skeleton` is one box,
  `SkeletonText` is the rows of a paragraph, and `SkeletonRegion` is the loading
  fact for a subtree: `aria-busy`, the single announcement, the timing, and the
  animation phase. `region` contains `root` and `text` the way `badge`'s
  `anchor` contains `badge`'s `root`.
- **Decision: the text bar has no size axis.** A row is `1lh` and the bar inside
  it is `1cap`, so `n` rows occupy exactly the `n` line boxes of the paragraph
  they stand in, at every type size and every density, including scales this
  library does not own. Every one of the thirteen implementations surveyed types
  a pixel height instead and is therefore right at one density and wrong at the
  others. Measured on the rendered page: three rows, 60px; three lines of the
  same paragraph, 60px.
- **Decision: `1cap` rather than `1em`, and it was found by measuring.** At `1em`
  the bar filled 16 of a 20-pixel line box — 80% — and a paragraph of them read
  as a barcode, because real prose fills a little over half its leading. At
  `1cap` it fills 58.2%, which is where the ink actually is. It also makes
  `vertical-align` resolve to zero for the default bar: a box one cap tall on the
  baseline occupies exactly the band a capital letter occupies.
- **Decision: `circle` and `square` take Avatar's two words and Avatar's scale.**
  Nine round placeholders in ten stand in for an avatar, and the scale exists.
  Measured against the real thing on the page: 24, 28, 36, 48, 64 for both.
  `size` therefore has five steps, not the type scale's seven, and means nothing
  on `text` or `block` — stated in the contract and tested rather than left to
  be discovered.
- **Decision: the fill is derived, not taken.** `--slotted-disabled-background`
  alone is one step from the dark surface — `#18181b` on `#131316` — and a page
  of placeholders read as an empty page in the first dark capture. Carried 8%
  toward `--slotted-text` it sits 0.129, 0.086 and 0.081 from the light, dark and
  high-contrast grounds, against 0.071, 0.022 and 0.000 unmixed. A hairline
  `--slotted-border-subtle` rim is invisible in light, where it is the fill's own
  colour, and is the whole box in high contrast, where the fill is the page.
- **Decision: the August refusal of a shimmer is reversed, and `shimmer` is the
  default.** The band is the fill carried further along the same axis, so it
  separates from the fill in all three schemes with no token of its own —
  darker in light, lighter in dark, which is Ant Design's answer to the same
  problem. `pulse` is the quiet alternative, and its trough is the same idea
  toward `surface-sunken`.
- **Decision: neither animation touches `opacity`.** The pulse moves
  `background-color` and the shimmer moves `background-position`. Fading the
  whole box took the rim with it, so once a cycle the shape came within a hair
  of the dark ground and came back — a flicker the reviewer saw and no capture
  could. Measured after the change: opacity is `1` on every frame of both
  animations, eighty distinct fills and eighty distinct band positions across
  eighty frames.
- **Defect: the shimmer was in the stylesheet and almost never on the screen.**
  `background-position` places the image inside the box _minus_ the image, so
  multiplying a percentage by three and by a direction sign put the band outside
  the box for most of every cycle. A background three times the box's width and
  a phase spanning `0%`–`100%` carries a narrow band in at one edge, across, and
  out at the other, with a rest between passes.
- **Defect: a region collapsed to two pixels.** With no definite inline size it
  is a flex item that shrinks to its content, and its content is a percentage of
  it — measured at 2px inside a 599-pixel column, with every placeholder in it
  2px wide. The region now takes `--slotted-skeleton-inline-size`, default
  `100%`. Four of the reference page's demonstrations were unreadable because of
  it, and a right-to-left demonstration was unreadable because the story wrapped
  it in a bare `div` that shrank the same way.
- **Decision: one animation per region, in CSS.** `@property
--slotted-skeleton-phase` is registered with `inherits: true`; a region
  animates it and every placeholder inside reads it, so a region pulses as one
  surface and a box that mounts late inherits the phase the others are at. React
  Spectrum needs the Web Animations API and `animation.startTime = 0` for this;
  HeroUI needs a parent class and `animationType="none"` on every child. A
  hundred rows cost one animated property rather than a hundred timelines.
- **Decision: the family holds no state a consumer can own.** `loading` is a
  fact about the consumer's data and a placeholder cannot decide that data
  arrived, so there is no state model — asserted in the contract test rather
  than left implied. What the family does own is whether the placeholder is
  _painted_, which is `loading` plus `delay` plus `minDuration`, and
  `SkeletonRegion` emits `onReveal` / `(reveal)` at the withdrawal because that
  is the moment focus can move, and it is later than the input.
- **Decision: `delay` and `minDuration` default to zero.** They prevent the two
  flashes no surveyed library addresses, and they live on the region and the
  provider rather than on a box, because a load has one boundary and twenty
  timers would reveal at twenty moments. Zero because the family cannot know a
  consumer's latency and a non-zero default renders a blank page wherever the
  data is already absent; the recommended pair is on both reference pages.
- **New entry point: `@slotted/core/loading`.** The timing is one pure state
  machine driven by both bindings, for the reason `@slotted/core/state` exists:
  a difference between React and Angular here would be invisible — the same
  prop revealing at two different moments, and no test looking at one binding
  alone would say so.
- **Contract break, and how a consumer moves.** `data-slotted-component` →
  `data-ui="skeleton"`; `.slotted-skeleton` → `[data-ui='skeleton']`;
  `shape="rectangle"` → `shape="block"`; `--slotted-skeleton-circle-size` →
  `size` on the avatar scale; `--slotted-skeleton-duration` →
  `--slotted-duration-loop-slow`. Kept from August: `shape` as a vocabulary
  distinct from `size`, `aria-hidden` by default with the explicit `false`
  escape hatch, and the animation stopping rather than shortening under reduced
  motion. The design is in
  `docs/superpowers/specs/2026-09-02-skeleton-family-design.md`.
- **Defects found in shared tooling, fixed first.** Three in the workbench, all
  found by reading the rendered page rather than by a test, each now carrying
  one: a long import was clipped because only the `pre` wrapped and the `code`
  inside it computes `white-space: pre`; the API table's type column had no
  floor, so `Ref<HTMLSpanElement | HTMLDivElement>` came out as a ribbon one
  character wide and four hundred pixels tall; and the import-facts block lost
  its padding to the docs theme's `dl` reset and had a `1fr` track whose
  min-content floor pushed the labels out of line. Two families' token lists
  were also stale against their own stylesheets — `avatar-group` was missing
  `--slotted-duration-short` and `--slotted-easing-standard`, `button` was
  missing `--slotted-duration-loop` — and `packages/styles/package.json` still
  named twenty deleted families in its `test` and `typecheck` scripts, so
  `pnpm --filter @slotted/styles verify` could not run at all.
- **Defect found at the gate, in the family itself.** The covering placeholder
  kept `color: transparent` and `visibility: hidden` after the content arrived,
  so a loaded row rendered as an empty line beside its avatar. The paint is now
  guarded on `[data-loading]`; the geometry is not, because a loaded placeholder
  is `display: contents` and has no box to describe.
- **Deviations: none.**
- **Follow-on.** There is no tool for photographing a rendered reference page,
  and step 10 of the skill requires reading one. This family's pages were read
  through a scratchpad script driving Chrome over CDP at an `http` URL — the
  same technique `tools/harness/shoot.mjs` uses for a `file:` URL. A
  `tools/harness/page.mjs` would make it the harness's job rather than each
  session's.

## Kbd — 2026-09-02

- Built from nothing. The family removed on 2 September declared schema 4, one
  axis (`size: sm|md`), one capability, one part, and a comment saying a
  combination "is two elements and a separator the consumer writes, because the
  separator is text in their language and the order of modifiers differs between
  platforms". Both of those facts are true and neither is a reason to ship
  nothing: they are the two things this family now does.
- Twelve implementations surveyed, plus the platform. **There is no kbd pattern
  in the WAI-ARIA Authoring Practices** — the index carries no entry — and ARIA
  in HTML (W3C Recommendation, 11 August 2026) maps `kbd` to **no corresponding
  role** and declares it **Naming Prohibited**. That one fact decided the
  family's accessibility model: `aria-label` is not available, so every word a
  reader hears is content. The legend is hidden with `aria-hidden` and a `name`
  part carries the word. HeroUI is the only surveyed implementation that
  supplies the word at all, and it uses `title`, which is not announced by every
  reader, is unreachable by keyboard and is invisible on touch.
- Decision: a combination is a `kbd` inside a `kbd`, which is what the HTML
  Standard says the nested form means. shadcn's `KbdGroup` is a `div`; Chakra
  and Radix put the whole combination inside one `kbd` as text. It is a part
  rather than a second family — the shape `badge` proved with `anchor`.
- Decision: `mod` and `meta` are two keys. `mod` is the platform's primary
  accelerator (⌘ on a Mac, Ctrl elsewhere) and `meta` is the physical Meta key
  (⌘, the Windows key, Super). Nuxt's `useKbd` holds one entry for both
  meanings, so the same authored string tells a Windows reader to press ⌘ or a
  Mac reader to press the Windows key depending on which meaning the author had.
- Decision: the modifiers are reordered into the platform's own convention —
  the Apple Style Guide writes Fn, Control, Option, Shift, Command, and
  Microsoft writes the Windows key ahead of Ctrl, Alt and Shift — and the
  separator is not rendered at all on a Mac, which joins with nothing. No
  surveyed implementation does either. The escape hatch is composition: a
  combination whose keys are authored one by one is rendered as written.
- Decision: whitespace in `keys` is a step break, so `g i` is `G then I`. The
  step word is read aloud where the plus is not, because it is the only thing
  that tells a sequence from a chord. Nothing surveyed can express a sequence.
- Decision: `size="inherit"`, the step no surveyed implementation ships. Every
  size axis in the field is absolute, which makes a key inside an `h2` a stamp
  and one in fine print a slab.
- Decision: no `tone` axis, against Chakra and Nuxt. A key cap depicts a
  physical object and its colour belongs to the keyboard rather than to the
  message; where a shortcut carries a tone it is the row that carries it. The
  three-line override is written on the reference page.
- Decision: the keys inside a combination keep their left-to-right order in a
  right-to-left document. A combination is one formula, the bidi algorithm
  renders the same string as one left-to-right run inside an Arabic paragraph,
  and a mirrored `K + ⌘` is a shortcut no operating system displays. Arrow
  legends are never mirrored either: `←` is the physical Left arrow key.
- Decision, measured rather than argued: the modifier symbols are characters,
  not masks from new glyph tokens. `fc-list` reports every one of
  U+2318 U+2325 U+2303 U+21E7 U+21A9 U+232B U+21E5 U+21EA U+21DE U+21DF U+2196
  U+2198 in DejaVu Sans Mono, which is what the mono stack falls back to here;
  on macOS, the only platform that draws them, every system face has them. No
  token was added to the contract for this family.
- Decision: `@slotted/core/keys` is a new entry point. Which key a token names,
  which word replaces a symbol, what order the modifiers go in and what joins
  them are four decisions that would otherwise be taken twice, with no test able
  to prove the two copies agree.
- Recorded asymmetry between the bindings, kept rather than levelled down:
  React resolves the platform through `useSyncExternalStore`, which is right on
  the first paint of a client-rendered page _and_ free of hydration mismatches
  on a server-rendered one. Angular exposes no equivalent, so it resolves
  synchronously in the browser — right for a client-rendered application — and
  warns in development on the server, where `provideKbdDefaults({ platform })`
  is the answer.
- Finding, from the captures rather than from a test: the monospaced face is
  chosen for its Latin and its symbol coverage is incidental. `⌘ ⇧ ⌥ ⌃ ↩ ⌫ ↑`
  all rendered visibly thinner and smaller than `Esc` in the same cap. A mark
  now takes the interface face at `1.15em`, and it is **not** trimmed: `cap
alphabetic` are Latin metrics, and a box trimmed to them centred the cap band
  while the marks sat high in it. The trim stays for every word, where it is
  what makes `K`, `Página` and `jgpqy` share one optical centre.
- Finding: `outline` owned no ground and still owned `--slotted-text`. Read on
  `--slotted-surface-inverse` it was near-black type on a near-black ground —
  the one variant meant to survive an unknown surface was the one that could
  not. A box that borrows its ground borrows its foreground with it.
- Finding: `soft` had no edge, and in the `high-contrast` scheme the neutral
  surface is the page's own white, so the chip was gone outright and `Ctrl + B`
  was a run of text. It now draws the tone's own border, as every `badge`
  variant does — which also removed the `forced-colors` rule this family had
  drafted. It writes none: every ground it paints is a token the theme already
  remaps, and there is no filled variant whose edge is its own fill.
- Finding: the wrapping the design promised was a coincidence. An `inline-flex`
  box is sized by its content, so a five-key combination in a 360-pixel column
  ran out of it rather than breaking inside it; `max-inline-size: 100%` is what
  makes "wraps between caps and never inside one" true.
- Finding: at the shared gap, a Mac combination was as loose as the space
  between two separate shortcuts, so `⌥⇧⌘P` and `⌘K` on one line read as one run
  of six keys. With no separator the gap is the only thing holding a combination
  together, and it is now one step tighter.
- Two workbench defects, fixed there with tests before this family's work
  continued: `.slotted-demo-surface` was a plain block, so four examples placed
  on it touched — a surface is a ground and a ground owns the distance between
  the examples on it; and `.slotted-demo-rows` had no way to show a row whose
  item is unavailable, which a family whose bare variant inherits its colour
  cannot be demonstrated without.
- Repair, not a decision: `@slotted/styles`'s `test` and `typecheck` scripts
  still named twenty families removed on 2 September. Both are now generated
  from the directories that exist.
- Open question left to the reviewer, because it changes a token outside this
  family: `--slotted-text-muted` (#5b6b7f) and `--slotted-disabled-foreground`
  (#64748b) are close enough in the light scheme that a `plain` key in an
  already-muted column barely changes when it is disabled. The family works
  around it — the row dims as a unit, which is what a real menu does — but the
  two tokens being one step apart is a foundation observation rather than a kbd
  one.

## Status Indicator — 2026-09-02

New family, wave 2, guide 9. The operational state of something the
application observes: a mark, the word it stands for, and a name a reader
always hears. Design and survey in
`docs/superpowers/specs/2026-09-02-status-indicator-design.md`.

- **Nine implementations surveyed, and they split two ways.** Spectrum, Chakra
  and Ant Design draw a coloured disc and put the words beside it; Fluent,
  Carbon and Primer draw a symbol, and the symbol is what tells two statuses
  apart without colour. Spectrum, Chakra, Carbon, Primer and Atlassian put the
  mark inline; Ant, Mantine, Fluent and Carbon's badge put it on a corner.
  Radix, Base UI, Ark UI and React Aria ship no member of this family at all,
  because it holds no interaction for a behaviour library to hold.
- **Decision: six statuses, closed.** `neutral`, `info`, `success`, `warning`,
  `danger`, `unknown`, each mapping to one of the five shared tones and one
  glyph. The map is in the contract rather than in the stylesheet, and the CSS
  is checked against it. A seventh value would carry no tone, no glyph and no
  fallback word, which are the three things the family exists to supply; an
  application with a domain status maps it onto one of the six and retunes
  `--slotted-status-indicator-mark-image` if it wants its own artwork.
- **Decision: six glyph tokens added to the foundation.**
  `--slotted-icon-circle`, `-circle-info`, `-circle-check`, `-triangle-alert`,
  `-circle-x` and `-circle-question`, in lockstep across
  `packages/tokens/src/contract.json`,
  `packages/themes/default/src/theme.json` and `docs/token-foundation.md`;
  the primitive layer goes from 62 tokens to 68. They carry their own
  container, which is what separates them from the bare `check`, `minus` and
  `x` a checkbox and a tag's remove button draw inside a box the control
  already provides. `alert` and `inline-message`, the next two entries in this
  wave, are required to say their five tones by icon as well as by colour and
  consume the same six.
- **Decision: the name is text, never an attribute.** Given words, those words
  are the accessible name; given none, the status's own word is rendered and
  clipped by `visually-hidden`. `role="img"` with an `aria-label` — Fluent's
  answer — is refused, because real text is what lets a live region announce
  its own contents, lets an `aria-labelledby` elsewhere point at it, and lets a
  page search find the word. Spectrum asks the consumer for an `aria-label` and
  ships a nameless dot when they forget; Fluent's table is English and cannot
  be replaced. This one falls back to a table the provider replaces in one
  decision.
- **Angular answers the "did the consumer supply a label?" question with
  `<ng-content>` fallback content**, which is the same question React answers
  with `children === undefined`. Nothing inspects the DOM, and the two bindings
  render one shape.
- **Decision: the label wraps where `badge` clips.** A status is frequently a
  sentence, and half a sentence is a wrong instruction rather than a short one.
  The mark is therefore given a box `1lh` tall and centred in it, so it sits on
  the first line however far the words run.
- **`overflow-wrap: break-word`, not `anywhere`, and the difference was found
  on the rendered page.** Both break an unbreakable token; only `anywhere` also
  reports a min-content size of one character, and inside an auto-sized grid
  column that collapsed “Build 4821 failed” into fourteen lines of one letter.
  `break-word` alone then let a container digest size the track instead — a
  220-pixel column measured 420 and painted past its own edge — so the root
  carries `min-inline-size: 0` as well, which hands the width back to the
  container and leaves the token to break at whatever width it is given.
- **The dot is `1cap`, not `1em`.** `badge` sizes its own dot on the whole font
  size and is right to: a badge's dot is a chip standing alone. Read at 420
  pixels beside a word, the same thirteen pixels is a bullet — it outweighs the
  letters it belongs to. One cap is 9.4 pixels at `md` and leaves 7.4 of tone
  inside the rim, above the six at which `badge` recorded a dot reading as dark.
- **The rim is the tone's own text role rather than `--slotted-border-strong`.**
  Read at 250%, the neutral rim was a grey ring that took the saturation out of
  the four tones whose fill already cleared 3:1 on its own. A tone `text` role
  is held by the theme's contrast test to the 4.5:1 reading ratio, which clears
  WCAG 2.2 1.4.11's 3:1 for a meaningful graphic with room over. `badge` keeps
  the neutral rim for the reason it should: its dot sits on the corner of a
  photograph, where the ground is not the surface the tone was calibrated
  against.
- **`neutral` is filled with `--slotted-border-strong`.** The tone's own
  `solid-hover` step — `badge`'s choice for a chip the size of a word — is one
  shade off the surface, and on a nine-pixel disc it read as a rim around
  nothing: `neutral` and `unknown` were both hollow, and hollow is the word this
  family reserved for “nobody knows”. `unknown` keeps the hollow ring and draws
  it dashed, so the two greys are told apart by shape in every scheme.
- **The pulse hangs off the root, not off the mark.** An icon mark carries a
  `mask-image`, a mask clips the element's pseudo-elements with it, and the ring
  behind the warning triangle was cut into the shape of that triangle and then
  disappeared. Photographed at 300% before it was moved.
- **Two defects in the harness, both fixed before the family's own work.**
  `--at <milliseconds>` moves every animation on the page to one moment and
  pauses it, because a page is photographed the instant it loads and the start
  of a cycle is where an expanding ring looks like nothing at all. `--motion
reduce|no-preference` states the reader's preference, because headless Chrome
  answers `prefers-reduced-motion: reduce` by default — so every capture this
  harness has ever taken was taken with motion switched off, and this family's
  pulse was missing from five images before anyone asked why.
- **Not shipped, and why:** placing a mark on the corner of something else, and
  a count in the mark. Both are `badge`'s, which already ships `anchor`,
  `placement` and `overlap`; the composition is written out on both reference
  pages, and the cost — a corner mark cannot carry this family's glyph — is
  written beside it. A `busy` status, which Ant and Carbon both ship, is
  declined too: `pulse` says “changing now” on any of the six, which Ant's
  single `processing` value cannot say about a failing deploy, and a
  determinate wait belongs to `progress-indicator`.

## Alert — 2026-09-02

Wave 2, guide 9, rebuilt from nothing: the family had been removed with the
twenty others on 2 September, so the previous contract, stylesheet and bindings
survive only in git. Ten implementations were surveyed before any of them was
read again, and the delta is written in
`docs/superpowers/specs/2026-09-02-alert-family-design.md`.

- Decision, and the one the family exists for: **the box is a landmark and the
  text is the live region.** MDN's `alert` role reference says the role "should
  only be used for text content, not interactive elements such as links or
  buttons", and every alert worth shipping has a dismiss control. Polaris, MUI,
  Spectrum and Carbon's inline notification all write a live role on the box and
  put buttons inside it; Primer and GOV.UK write none and announce nothing;
  Carbon's actionable notification escapes by becoming `role="alertdialog"` with
  a focus trap. Here the root is a `section` named by its own title, and
  `content` — the title and the description, nothing else — carries
  `role="status"` or `role="alert"`. The actions and the dismiss control are its
  siblings.
- Decision: `live` defaults to `off`, because the APG records that "screen
  readers do not inform users of alerts that are present on the page before page
  load completes". MUI's default is `role="alert"` regardless, which ships a
  promise the platform does not keep.
- Decision: closing hides rather than unmounts. A live region has to be in the
  document before its text changes, and `data-open` is only a state a consumer
  can style if the element is there to carry it. The cost is written on the
  reference page: an application that must not pay for the hidden subtree
  renders the alert conditionally and never passes `defaultOpen`.
- Capability none of the ten ships: a controlled **and** uncontrolled dismissal.
  All five that dismiss are controlled only, so a banner nobody has written
  state for cannot be dismissed at all.
- Gap none of the ten fills: where the keyboard goes when the message goes. The
  reader tabs to the dismiss control, activates it, the control is destroyed and
  focus falls to the body. The family records where focus entered from and sends
  it back; `restoreFocus` turns that off for an application that manages focus
  itself.
- Recorded asymmetry, kept rather than levelled down: React replaces the mark
  with a node in `icon`; Angular projects `[slAlertIcon]`. Angular also exposes
  `setOpen()` and `focus()` through `exportAs`, because a template has no other
  way to reach them, and it is the only binding that emits `programmatic`.
- Finding, from the tone ramp rather than from a capture: the dismiss control
  cannot step along the tone's subtle roles. In the light scheme
  `--slotted-tone-accent-subtle-hover` is #eff6ff against a #dbeafe ground —
  _lighter_ than the alert it sits in — and `subtle-active` is that ground
  exactly, so press changed nothing at all. `tag` measured the same thing for a
  tinted chip. Both states are a state layer now: `currentcolor` at 8% and 14%
  over whatever ground the control already has, which is the one mechanism that
  answers `soft`, `outline` and `solid` together.
- Finding, measured before it was drawn: `--slotted-focus-ring-color` reads
  1.30 : 1 against `--slotted-tone-accent-solid` in light, 1.03 against
  `success` and 1.07 against `danger`. The ring the theme calibrated against the
  page's surface disappears on the tone's own fill, so a `solid` alert draws it
  in `--_on-solid` — the one colour the contrast test holds against that fill.
- Finding, from the rendered reference page and invisible to every test:
  `container-type: inline-size` applies `contain: inline-size`, so the box's
  intrinsic width is zero. In normal flow nothing was wrong; on a stage that
  shrink-wraps its children every alert collapsed to one character wide and
  broke its text one letter per line. The width is stated now, and the workbench
  gained the stage layout a block-level family needs.
- Finding, same page: `.slotted-reference-page p` was colouring and resizing
  every paragraph a family renders inside a canvas. `alert`'s description is a
  `p`, so on a `solid` alert the page drew it in the workbench's muted grey on a
  saturated ground — a contrast the family does not ship, on the one page a
  reader judges it from. A layer cannot fix that from the component's side:
  `@layer slotted.components` loses to every unlayered rule by construction,
  which is exactly what lets an application retune the library.
- Three workbench defects fixed there, with tests, before this family's work
  continued: the missing block-level stage layout, that layout's wrapping
  column — which resolved a grid circularity by growing a 156-pixel
  demonstration to 1292 — and the prose rule above. One harness defect too: the
  scene parser stopped at the first closing `</section>`, so a family whose own
  root is a `section` closed the scene around it and every alert after the first
  vanished from the capture with nothing to say so.
- Open question raised at the gate rather than decided here, because it changes
  a token scale outside this family: there is no density-varying space scale.
  Type and glyph read the control scales and shrink with density; the box's
  inset reads the space scale and does not, so a `dense` alert is relatively
  airier than a `comfortable` one. `card` accepted the same cost for the same
  reason.

## Inline Message — 2026-09-02

New family, wave 2, guide 9. One sentence about a field, a section or an
action: help, an error, a warning, a confirmation, or a wait. Design and survey
in `docs/superpowers/specs/2026-09-02-inline-message-design.md`.

- **Thirteen sources surveyed, and nine of them ship no component at all.** In
  Fluent, Spectrum, Carbon, Chakra, Mantine and Polaris the message is a string
  prop on the field — `validationMessage`, `errorMessage`, `invalidText` — so a
  consumer needing a message beside a section, an action or a control the
  library never saw has nothing to render. Primer, Base UI, Material UI and
  GOV.UK ship an element; only GOV.UK answers what a reader _hears_.
- **Decision: the severity is a word, not only a colour and a mark.** The
  `prefix` part is real text — `Error:`, `Warning:`, `Success:` — clipped by the
  WCAG 2.2 technique C7 rule set, first in the DOM, and out of flow so it takes
  no grid cell. GOV.UK publishes the idea for errors in one hard-coded template;
  here it is a word per severity and a table an application replaces once
  through the defaults provider. It is the capability none of the other twelve
  ships, and the reason is measurable: neither the red ink nor the crossed
  circle reaches the accessibility tree, so “Informe um CNPJ válido” carries no
  evidence of being an error rather than a hint.
- **Decision: the live role goes on the root.** `alert` puts its role on an
  inner part because MDN's `alert` role reference restricts the role to text
  content and an alert has a dismiss button beside its text. This family owns no
  controls, so the element that _is_ the text is the element that announces, and
  a second element to hold what the first one already is would be structure with
  no job. `live` still defaults to `off`, for the reason the APG records: a
  message present before the page finished loading is announced by nothing.
- **Decision: `secondary` is the help tone, and it reads the neutral muted
  ink.** `--slotted-tone-secondary-text` is `#172033` in the light scheme — a
  label colour calibrated for that tone's tinted ground — and text at that
  strength under a field reads as loud as the label above it. Help therefore
  takes `--slotted-text-muted`, which the theme already darkened to meet 4.5 : 1
  against the sunken surface. One tone reading a different token from the other
  four, recorded rather than hidden: `secondary` is not a severity in this
  family, it is the absence of one, and it draws no mark and speaks no word for
  the same reason.
- **Decision: progress is a state, not a sixth tone.** The guide names
  “progresso” as a kind of inline message and not one of the thirteen ships it.
  `loading` turns the mark into the ring `button` draws, at
  `--slotted-duration-loop-fast`, in the same box — so “Verificando
  disponibilidade…” becomes “Nome disponível” with no geometry moving. It stops
  under reduced motion, and it stops for a disabled message too, because
  `STATE_PRECEDENCE` puts `disabled` above `loading`.
- **Decision: `reserve` holds one line box open, and the family draws nothing in
  it.** Material UI reserves the same line by asking the consumer to pass a
  space character, which defeats an emptiness check and leaves the mark and the
  severity word standing beside nothing. Here the sentence lives in a `text`
  part the family writes — React wraps `children`, Angular wraps `<ng-content>`
  — so `[data-part='text']:empty` is an exact question, and
  `:has([data-part='text']:empty)` withdraws the mark and the word. Measured in
  the browser: an empty reserved message and a one-line message are both
  eighteen pixels tall at `sm`, so a form rendering its error unconditionally
  does not move when the error arrives.
- **Decision: the family holds no mutable value, and therefore no state model.**
  It is told what to say; when it appears is the consumer's own render. The
  contract declares no `stateModel` and the reference pages carry no event
  table, and the contract test asserts the absence so it stays a decision.
- **Decision: `disabled` is `undefined` rather than `false`, and is not in the
  contract's `defaults`.** That is the invariant
  `docs/superpowers/specs/2026-08-31-field-aware-controls-design.md` states from
  the other side: a message defaulting to `false` would quietly override a
  disabled `field` in wave 3. There is no field to ask today, so it renders as
  not disabled; no consumer changes a line when `field` lands.
- **The identifier is generated and the wiring is the control's.** MDN's
  `aria-errormessage` reference: `aria-invalid="true"` on the control, then
  `aria-errormessage` at the message's id. Angular hands the generated value
  back through `exportAs` — `#m="slInlineMessage"` then
  `[attr.aria-errormessage]="m.messageId"` — and React's consumer uses the same
  `useId` the family does. The asymmetry is real and recorded: an Angular
  template has no other way to reach an instance.
- **A role the consumer wrote survives the host binding.** Angular's host
  binding wins over a static attribute, so `role` is read with
  `HostAttributeToken` before the binding is computed — the same treatment `id`
  gets. React needed none: a consumer's prop spreads over the family's.
- **Correction made in the visual loop rather than by a test.** Read at 420
  pixels, the `md` mark sat proportionally closer to its own sentence than the
  `sm` mark did: one gap value beside two glyph sizes reads as generous next to
  fourteen pixels and as tight next to sixteen. `md` now steps the gap with the
  mark.
- **Accepted cost, recorded rather than fixed.** A message with a mark starts
  its text one mark plus one gap further in than a message without one, so a
  help line and an error line under the same field have different left edges.
  Primer, Carbon and Fluent all ship the same difference, and the mark is what
  says the message is an error — an error indented past the help it replaced is
  a legible difference rather than a misalignment.

## Field and Field Group — 2026-09-02

Consolidates `field` and `fieldset`, both of which shipped on schema 4 before
the token foundation, the state vocabulary and the identity rule. The capability
inventory is `docs/superpowers/specs/2026-09-02-field-capability-inventory.md`
and the design is `docs/superpowers/specs/2026-09-02-field-and-field-group-design.md`.

- **Decision: two families, not one with two roots.** A group's description sits
  _before_ its controls and a field's _after_ its own, and a `fieldset` cannot be
  a member of a family whose `nativeElement` is a `div` without one of the two
  lying. The two contracts cross-check each other: `field-group`'s test asserts
  `messagePlacement` is `before` where the field's is `after`, and that the group
  provides every default a field reads.
- **Decision: the label axis is `labelPlacement`, not `orientation`.** Fluent
  calls it `orientation`, Primer `layout`, Spectrum `labelPosition`. `orientation`
  means "the direction children flow" in every other family here, and
  `field-group` uses it in exactly that sense, so the field takes the shared
  `placement` capability and a longer prop name rather than giving one word two
  meanings.
- **Decision: necessity has three forms and the glyph is hidden.**
  `requiredMark` is `mark`, `text` or `none`, which unifies Spectrum's
  `necessityIndicator`, Angular Material's `hideRequiredMarker` and Chakra's and
  Ark's `fallback`. The asterisk is `aria-hidden` because `aria-required` on the
  control already says it and a form of twenty required fields would otherwise
  read "asterisk" twenty times; `(required)` and `(optional)` are not hidden,
  because they are information, and both words are in the provider so an
  application translates them once.
- **Decision: the label is never repainted when the field is invalid.** The
  shipped family turned it red. A red marker on a red label is a marker nobody
  can see, and the error already says the same thing in words, in colour and in
  a glyph.
- **Decision: GOV.UK's red inline-start border on the form group is declined.**
  It is drawn on a box that always reserves the space; here a field has no ground
  of its own, and reserving twenty pixels of inline padding on every field to
  show it on one would change every form's rhythm.
- **Decision: the counter sits at the end of the label row**, where Carbon puts
  it. Angular Material puts it in the subscript, where a count that appears on
  the first keystroke shares a row with the error and pushes it.
- **Defect found by the capture, not by a test: an element cannot query its own
  container.** `container-type` makes a box a container for what is _inside_ it,
  so the `grid-template-columns` written under `@container` applied to nothing
  while the child rules beside it applied normally — a label holding 235 pixels
  and its control 185, at one width, looking almost right. The template is now
  stated once outside the query and only the children move.
  `field.styles.test.mjs` asserts the query contains no `grid-template-columns`.
- **Defect found by the capture: a long label ran under its control.**
  `overflow-wrap: anywhere` on the label, and `normal` on the necessity mark —
  which the 240-pixel capture caught breaking `(required)` into `(re` and
  `quired)`.
- **Defect found by the right-to-left capture: the necessity marker lost its
  gap.** Latin label text in an RTL document forms one left-to-right run and the
  marker joined it, so `margin-inline-start` landed outside the run.
  `unicode-bidi: isolate` makes the marker its own run.
- **Correction made in the visual loop: a group's message stepped with a
  field's.** `inline-message` defines `md` as the message of a section and `sm`
  as the message of a field; held at `sm`, a sentence about a whole set read as
  the help under the control above it. A group's messages now start at `md`.
- **Correction made in the visual loop: what is said about a set stood as close
  to the set as its fields stand to each other.** The content gap is one step
  wider than the field gap.
- **Defect fixed in a shared tool first, in its own commit.** The workbench's
  `capabilityApi` required a prop named exactly `placement` from any family
  declaring the `placement` capability. The table cannot know what a family
  places — an overlay places itself, a field places its label — so `placement`
  now requires no name, with the reasoning `selection` and `appearance` already
  carry, and a test states it.
- **Additive change to `inline-message`, in its own commit.** `SlInlineMessage`
  gained an `id` input. A family that composes with it — the field, whose
  description and error _are_ inline messages — needs to give it an identifier
  derived from its own base, which a static attribute cannot express and a
  directive on the same element cannot write. `messageId` stayed a value getter,
  so every template already reading `m.messageId` is unchanged.
- **Recorded asymmetry: Angular's field renders its own messages.**
  `SlInlineMessage` takes its values as `input()` signals and nothing outside the
  template that instantiates it can write one, so the page writes
  `<span slFieldError>` and the field puts it inside a `<p slInlineMessage>` it
  renders itself. React's `FieldDescription` renders `<InlineMessage>` directly,
  because a React component may compute another component's props.
- **Recorded asymmetry: `FieldGroupContent` is a React component and an Angular
  content slot.** Angular's group draws the element around its catch-all
  `ng-content`; React cannot split children without inspecting them, so the part
  is written.
- **Decision: the group answers a class, not a token value.** Angular creates
  every directive a template declares _before_ it binds any input, so a group
  providing a snapshot of `FIELD_DEFAULTS` would hand its fields the values its
  inputs held before the consumer's bindings ran. `SlFieldDefaultsSource` is an
  abstract class the group answers with a method, which also keeps the dependency
  running one way: `@slotted/angular/field` never learns that `field-group`
  exists.
- **Accepted cost, recorded rather than fixed.** `ref` reaches the default
  element only. A part rendered through `render` is written by the consumer, so
  they attach their own ref to it; the props `render` receives are typed against
  `HTMLAttributes<HTMLElement>` precisely so they can be spread onto a `textarea`,
  an `output` or a `ul`, which a props object typed for the default element
  cannot.
- **Two literals, both recorded in the contracts.**
  `--slotted-field-label-inline-size` at `12rem` and
  `--slotted-field-group-track-min` at `14rem` are line lengths, and
  `docs/token-foundation.md` holds no scale of those. The 320-pixel reflow
  breakpoint is literal because CSS forbids a custom property in a container
  condition.

## Text Field and Textarea — 2026-09-02

Two families built together, replacing the deleted `input` and `textarea`. The
weighing is in
`docs/superpowers/specs/2026-09-02-text-field-and-textarea-capability-inventory.md`
and the decisions it forced are in
`docs/superpowers/specs/2026-09-02-text-field-and-textarea-design.md`.

- **Decision: `text-field` is a frame around its control and `textarea` is not.**
  Eight of the thirteen surveyed implementations put content inside the
  control's border, and no void element can hold a child; WAI-ARIA settles the
  rest by limiting the children of a `textbox` to non-interactive,
  presentational elements, so the clear and reveal buttons are the control's
  siblings inside a box with no role. Nothing surveyed puts an adornment inside
  a textarea — the corner is where the resize handle goes — so the multi-line
  control keeps the simplest anatomy that works. The two families differ on
  purpose rather than matching for symmetry.
- **Recorded asymmetry: Angular pays one element for that frame and React pays
  none.** React renders the wrapper from inside the component; an Angular
  directive cannot create a box around its own host. `slTextFieldInput` injects
  `SlTextField` without `optional`, so a control written without the frame
  fails at construction rather than silently losing its border, its ring and
  the place its buttons stand.
- **Contract break against `input`, recorded rather than aliased.** `<Input />`
  becomes `<TextField />`; `<input slInput>` becomes
  `<div slTextField><input slTextFieldInput></div>`; `.slotted-input` becomes
  `[data-ui='text-field']`; `--slotted-input-*` becomes
  `--slotted-text-field-*`. `slInput` is not kept as an alias: an alias that
  resolved to a control with no frame would place an adornment nowhere and
  paint the focus ring on the wrong box, which looks like a stylesheet problem
  rather than a rename.
- **Shared vocabulary gained two capabilities, in its own commit.**
  `specs/contract.schema.mjs` had no word for the text a control holds, which
  is how the deleted `input` came to declare five capabilities, none of them
  mutable, and no state model for the one thing the control does. `value` and
  `revealed` are now known and mutable, so every future text control has to
  declare a model. `capabilityApi` in the workbench asks a family holding a
  value for both halves of the pair, because unlike `selection` and `placement`
  the names are fixed by `docs/state-and-events.md` rather than by the family.
- **Decision: every user edit is one reason.** `keyboard` names the control's
  own editing surface rather than the input device, so typing, pasting,
  dropping text, an IME commit and an autofill all arrive as one reason and the
  consumer reads the originating event when the device matters. `clear` is the
  only other origin the family can create.
- **Additive change to `field`, raised at the gate.** The control counts and
  the field places the count: a control publishes `{ length, max }` and the
  field draws a counter in the spare column of its label row when the page
  wrote none. `field`'s own inventory recorded the number as this wave's work,
  and a page that writes `<FieldCounter>` or `<span slFieldCounter>` still
  wins, because a count over words, bytes or line items is one only the page
  can compute. `SlFieldCounter` moved into `field-counter.ts` so `field.ts` can
  look for it without importing the parts that inject `SlField`.
- **Accepted cost: the count is UTF-16 code units, so an emoji counts as two.**
  `maxLength` counts the same units, and a counter that disagreed with the
  limit the browser enforces would be wrong at exactly the moment it is read.
- **Two glyphs joined the scale, in lockstep.** `--slotted-icon-eye` and
  `--slotted-icon-eye-off` are one pair rather than two marks — the same
  artwork with a stroke added — so a password toggle reads as one control
  changing. The contract, the default theme and `docs/token-foundation.md`
  moved together, and the primitive count went from 68 to 70.
- **Decision: nothing is bound to Escape.** Some user agents clear a
  `type="search"` input on the key. A control that swallowed it inside a dialog
  would be one a keyboard user cannot leave, and WCAG 2.1.4 exists for the
  class of defect single-key shortcuts produce. The clear button is a real,
  focusable button instead, and WebKit's own search decorations are withdrawn
  so a search control never shows two.
- **Decision: the reveal toggle keeps one label.** `aria-pressed` carries the
  state, which is the APG's rule for a toggle and the rule `tag`'s own toggle
  already records. The caret is captured before the type swaps and restored
  after it, so revealing a password in the middle of an edit does not send the
  cursor to the end.
- **Decision: growing is the platform's job.** `autoSize` is
  `field-sizing: content`, Baseline since June 2026. Angular CDK caches a line
  height and writes a height on every `DoCheck`; Mantine ships a third-party
  component. Nothing here measures anything, and the same rule works in the
  harness, in React and in Angular.
- **Defect found by the capture: the ceiling showed four lines and part of a
  fifth.** A scroll container's bottom padding belongs to the _end_ of its
  scroll range rather than to the bottom of what is on screen, so a ceiling
  that reserved both paddings left forty per cent of a line under the border.
  `--_scroll-frame` reserves one padding, and the 240-pixel capture now clips
  on the line boundary.
- **Defect found by the capture: `rows` was outranked by the stylesheet.** The
  floor was stated for every control rather than only for one that sizes
  itself, so three two-row controls drew three rows tall. While `autoSize` is
  off the platform's `rows` is the height and nothing else states one.
- **Defect found by the right-to-left capture: `R$` printed as `$R`.** A Latin
  letter and a currency symbol joined the value's bidi run and reordered.
  `unicode-bidi: isolate` was not enough — the isolated run was still ordered
  by the document — so the adornments take `plaintext` and are ordered by their
  own first strong character.
- **Correction made in the visual loop: the trailing glyph did not agree with
  the leading text.** The frame gives its end padding back to a trailing button
  by exactly the button's own gutter, so the mark ends the same distance from
  the border as the value begins from it, at every step and every density.
- **Correction made in the visual loop: read-only looked like nothing.** The
  sunken surface is barely a colour against white, so read-only was
  indistinguishable from the default state in both schemes. It takes
  `--slotted-tone-secondary-subtle-hover` instead, keeps full-strength ink and
  keeps its handle; disabled is the one that loses both.
- **Recorded asymmetry: a controlled value behaves differently in the two
  bindings.** React owns a controlled input's DOM and re-renders the value the
  consumer sent back, so a consumer that cancels the request visibly refuses
  the keystroke. Angular writes the element when `value()` changes and never
  fights the browser for it, which is what `DefaultValueAccessor` does; the
  request is still a request, and `cancel()` still stops the form and the
  mirror from moving.
- **Defect fixed in a shared tool first, in its own commit.**
  `packages/angular/src/bundle.styles.test.mjs` asserted that a bundle's styles
  _start_ with `@layer slotted.components`. `@property` cannot take effect
  inside a layer, so a family that registers one writes it before the layer,
  and `skeleton` does: the assertion reported a family whose stylesheet was
  entirely correct. It now asserts that the layer is in the styles rather than
  first in them.
- **`@angular/forms` is a new peer dependency of `@slotted/angular`.** It is
  the first family that needs `ControlValueAccessor`, and a control that
  belongs in a form has to be usable in one as it stands.
- **Two literals, both recorded.** `--slotted-textarea-rows` defaults to 3
  rather than the platform's 2, because a two-row box reads as a mistyped
  input, and `--slotted-textarea-max-rows` defaults to 12 rather than to
  nothing: a control that grows forever pushes the page out from under the
  caret, which is the defect every auto-grow implementation ships first.

## Text Field and Textarea — visual refinement — 2026-09-02

Six items of finish on the two families already built, and the foundation
decisions three of them forced. No contract, anatomy or state model moved.

### The foundation moved, and this is what moved

| Token                                     | Before            | After                                                                                                         |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `--slotted-control-shadow`                | `none`, base axis | `0 1px 1px rgb(15 23 42 / 0.04)` light, `0 1px 1px rgb(0 0 0 / 0.32)` dark, `none` high-contrast, scheme axis |
| `--slotted-control-shadow-focus-geometry` | absent            | `0 1px 4px -1px`, base axis                                                                                   |
| `--slotted-control-border-color`          | absent            | `#8190a2` light, `#6a6a73` dark, `#000000` high-contrast                                                      |
| `--slotted-focus-ring-color-invalid`      | absent            | `var(--slotted-tone-danger-border)` in all three schemes                                                      |
| `--slotted-focus-ring-color`              | `#d4d4d8` dark    | `#60a5fa` dark                                                                                                |

- **The shadow varies by scheme, and the focus geometry does not.** The ink of
  a shadow is not the same value in a light scheme and a dark one, every other
  shadow in the foundation already varies on that axis, and only a scheme token
  may declare what forced colours replace it with — three reasons pointing the
  same way, so `--slotted-control-shadow` left the base axis. `high-contrast`
  states `none`, because a control there already carries a black edge and a
  second one would only thicken it.

  The focus shadow is the opposite case. Its geometry is the same in every
  scheme and its ink is the state's, so it is a base-axis offset, blur and
  spread with no colour, drawn as
  `var(--slotted-control-shadow-focus-geometry) var(--slotted-focus-ring-color)`.
  A complete shadow token cannot do that job: a custom property composed on
  `:root` resolves its `var()` calls there, so the element's own ring colour
  would never reach it and an invalid control would lift in the accent colour.

- **The control edge is its own step, not `--slotted-border-strong`.** Moving
  the strong border would have moved every separator and every essential border
  in the library to answer a question about controls. The new step sits between
  `subtle` and `strong`, and it clears the 3:1 floor
  `docs/component-features.md` §2.6 sets against **every** surface a control can
  be placed on rather than against `--slotted-surface` alone: 3.26:1 and 3.06:1
  in light, 3.46:1 and 3.17:1 in dark. Nothing is below the floor, so the
  shadow is not carrying part of the separation and no cost is owed here.

  `packages/themes/default/test/contrast.test.mjs` now measures both borders
  and the focus ring against `--slotted-surface`, `--slotted-surface-raised`
  and `--slotted-surface-sunken`. Holding only the default surface is what let
  a softened edge fall under the floor on one of the other two with nothing
  saying so.

- **The dark focus ring is the accent border step.** `#d4d4d8` was a neutral
  where light used a hue, so the ring meant one thing in one scheme and another
  in the other. `#60a5fa` is the same value `--slotted-tone-accent-border`
  holds in dark, which makes the rule "the ring is the accent border step of
  its scheme" true in both. It reads at 6.68:1 against the raised surface, well
  past the 3:1 a non-text element owes.

- **Invalid retargets the ring rather than repainting it.** A family answers
  `[data-invalid]` with one declaration —
  `--slotted-focus-ring-color: var(--slotted-focus-ring-color-invalid)` — and
  every rule that draws focus follows, because they all read that one name: the
  frame's outline, the shadow under it, and the ring on the clear and reveal
  buttons. `checkbox`, `radio-group` and `switch` inherit the rule rather than
  restate it. Under forced colours the invalid ring maps to `Highlight` like
  the ring it replaces, because a focus indicator is a focus indicator before
  it is an error.

- **Two rendered values left the "no pixel changed" table on purpose.**
  `--slotted-control-shadow` and the dark `--slotted-focus-ring-color` are
  recorded under **Current boundary** in `docs/token-foundation.md`, beside
  `--slotted-text-muted` and `--slotted-border-strong`. A row leaves
  `packages/tokens/test/resolve.test.mjs` with its token, or with a change
  written into that section; the second reason is new and is written into the
  test's own comment.

- **`button` gains the resting shadow and the dark ring.** It already read
  `--slotted-control-shadow` and every family reads
  `--slotted-focus-ring-color`, so both changes reach it without a line of its
  own. Neither is a regression in the harness; the focus shadow does not reach
  it, because `button` does not draw one.

### The two families

- **The drawn button and the target are two measurements.**
  `[data-part='clear']` and `[data-part='reveal']` were `block-size: 100%` and
  24 pixels wide, so they touched both borders and the frame had no vertical
  air. The drawn box is now square, sized by its glyph with half a space step
  of gutter on each side and bounded by the frame, so two pixels of the frame's
  inner box always show above and below it — 24 pixels at `md` comfortable, 18
  at `sm` dense.

  The WCAG 2.2 minimum cannot be that box: at `sm` with `dense` the whole
  control is 24 pixels tall, so nothing drawn inside it can also be 24. It is
  recovered outside the paint, by a transparent `::after` whose `inset` is
  `min(0px, calc((100% - var(--slotted-target-min)) / 2))` — the target grows
  to the minimum in both axes and a box already larger is left alone. That is
  the correction `docs/token-foundation.md` leaves to the family rather than to
  the theme.

  The end padding the frame gives back was calibrated against a 24-pixel box
  and now reads the same custom property the box does, so the glyph still ends
  the same distance from the border as the text begins from it at every step
  and every density. `--slotted-text-field-action-size` keeps its name and now
  overrides the drawn box; the hit floor is not themeable, because it is WCAG's
  and not a theme's.

- **A text adornment is inset by an eighth of the glyph box.** A glyph fills
  the whole `--_icon-size` box but its artwork is drawn inside a 24-unit grid
  that leaves two to three units of margin on each side; `@` and `R$` fill only
  their own advance width. Placed at the same padding edge the two boxes start
  together and the two marks do not, so a currency prefix hung roughly two
  pixels outside the magnifier stacked above it.

  An adornment that draws no glyph — `:not(:has(svg, img, [data-ui='icon']))` —
  now takes that margin on **both** sides. Both, because the same inset then
  keeps the gap to the value equal as well, and because a symmetric padding
  cannot disagree with `unicode-bidi: plaintext` about which side is which. The
  value is stated in terms of the glyph box rather than per density, so it
  follows every step and every density on its own.

- **A disabled control carries no shadow.** Nothing a person cannot reach is
  lifted off the page, and the state is stronger than every other in
  `STATE_PRECEDENCE`. Read-only keeps the shadow: the value is real, focusable
  and submitted.

### What was verified, and what was not

- `node --test` over both families' style tests, `states`, `fallbacks`,
  `identity` and `motion`, plus the whole `@slotted/styles` suite: 457 pass.
- `@slotted/tokens`, `@slotted/theme-default` and `pnpm test:docs`: pass.
- Harness captures read: `text-field` adornments in dark at compact,
  `text-field` actions with focus on the input in light, `textarea` default in
  light, and `button` variants in dark for the ring and the new resting shadow.
- The full visual loop and `pnpm check:full` were not run; visual validation
  for this pass is the reviewer's, in the browser.
- **A defect fixed in a shared tool first.**
  `scripts/verify-token-foundation.test.mjs` split the scheme tables by name
  prefix, so a shadow that does not begin with `--slotted-shadow-` was demanded
  in the colour table. It reads the declared `type` from the contract instead.

## Checkbox, Checkbox Group and Radio Group — 2026-09-03

Wave 3 item 4, invoked as `radio-group` and built as the pair
`docs/rebuild-order.md` declares. It became three families rather than two, and
the reason is written under **The split** below. Every decision here is in
`docs/superpowers/specs/2026-09-03-choice-controls-design.md`, with the survey
of fourteen implementations that produced it.

### Where the check and the dot are drawn

The decision the rebuild order reserved for this invocation. The control is a
native `input` with `appearance: none` and it draws the box; the mark is its
**next sibling**, a `span` carrying `mask-image` from the glyph scale.

Three alternatives were tried on paper and refused with a reason each:

- a pseudo-element of the control — Firefox renders neither `::before` nor
  `::after` on an `input`, so the mark would be absent in one engine;
- the control's own `background-image` — a glyph token is authored black so it
  can be masked, and a baked-in colour answers one scheme out of three;
- a mask on the control itself — a mask clips the element it is set on, so the
  border and the ground would go with the mark.

It costs one element, which is the count Ark, Radix, Material and Mantine all
pay. Painting reads `:checked` and `:indeterminate` rather than the mirrored
attributes, so the picture cannot disagree with the element; the attributes are
still written, because they are what a consumer styles against.

### The split, and why a radio is not a family

`checkbox` is one control and is usable alone. `checkbox-group` holds the array
and the parent box. `radio-group` holds the value and its items, and a radio is
`data-part="item"` of it — outside a group it has no exclusive set to belong to,
and the platform's whole keyboard model is defined over the set.

`specs/contract.schema.mjs` forces the shape: one `data-ui` per family, and
every member's root part carrying it. Two members each with a `root` part would
be one selector for two different boxes. The same split already exists three
times — `avatar` / `avatar-group`, `button` / `button-group`, `field` /
`field-group`.

`checkbox-group` was not on the wave-3 line and was added: four of the surveyed
implementations ship it, and declining it would have had to name the family that
owns an array of chosen values instead. `field-group` owns the grouping and the
legend; it does not own the value.

### Roving focus is the platform's, and the price is a generated name

Native radios sharing a `name` within one form owner already implement the APG's
entire table — Tab onto the checked item or the first, `Space`, both arrow axes
moving focus and selection together, wrapping, and skipping disabled items — in
a right-to-left document too. A roving `tabindex` would have reimplemented all
of it twice, once per binding, and would have had to relearn the arrow
directions of a mirrored document.

So a group with no `name` generates one. The cost is written rather than
avoided: such a group inside a `form` submits under a generated key. React Aria
makes the same trade.

### Read-only has no platform answer, and the platform still owns the correction

`input[type=checkbox]` and `input[type=radio]` ignore `readonly`, so the state is
enforced: the activation is refused on the `click` a pointer and `Space` share,
`aria-readonly` announces it, and the control keeps its tab stop, its ring and
its full contrast.

Refusing the activation is also what keeps a controlled control honest, and it
is the whole correction — **nothing in either binding writes the element**. The
HTML standard's canceled activation behaviour for a checkbox is
`checked = !checked` rather than a restore of a saved value, so a family that
corrected the element inside its own listener has that correction toggled back
out from under it. That was measured, not reasoned: the first run of the Angular
spec showed a controlled box that stayed ticked after its consumer had said no,
and two attempts to fix it by writing the element made it worse before the
standard's text explained why.

A radio needs one thing more. The same canceled behaviour restores the _clicked_
element and not the neighbour it unchecked, and Angular writes a property
binding only when its value changes — so the previously chosen option stayed
unchecked. `SlRadioGroup.restoreElements()` writes every item from the value
after a refused change. React needs no equivalent: its own controlled-input
restore already re-syncs every radio sharing a name.

### Decisions taken that would otherwise have been open questions

- **The label is a sibling, not a wrapper.** The root is a two-column grid, and a
  wrapping label would be one grid item holding both columns, so the description
  could no longer align under the label text. The gap between box and text is
  the label's own `padding-inline-start`, so the target is continuous.
- **These two controls never take the field's `id`.** They own their own label,
  and a field's label would name the same control twice. It is the one departure
  from `2026-08-31-field-aware-controls-design.md`, whose table says `always`;
  everything else in that table holds. `wiring.id` is `"never"` in both
  contracts, and the field's own value is asserted beside it.
- **`labelPlacement` is never inherited from a field.** The field's axis answers
  where a _field's_ label sits relative to its control. Two families sharing a
  name and not a meaning is a collision, and the resolution order records it by
  omission: `["prop", "group", "defaults", "end"]`.
- **The role is withdrawn inside a `field-group`.** A `fieldset` with a `legend`
  is already a named group; a `radiogroup` inside it, named by the same legend,
  is the same set announced twice. A consumer's own `role` wins over both.
- **`start` placement spreads to the end of the row.** `max-content` was tried
  first and looked better in one row than in five: it sizes each item's column
  from its own label, so a column of choices ended with the boxes at five
  different distances from the edge. A control that does not line up with the
  control above it is a worse picture than a control at the end of its row.
- **Invalid thickens the border as well as reddening it.** The `high-contrast`
  scheme paints `--slotted-tone-danger-border` the same black as every other
  border, so colour alone would make an invalid control identical to a valid one
  in exactly the scheme that exists for people who need the difference.
- **Read-only takes `--slotted-tone-secondary-subtle-hover` as its ground**, the
  one `textarea` already uses. The sunken surface was tried and is `#f6f8fb`
  against white: a state that existed in the accessibility tree and nowhere on
  screen.
- **The box reads `--slotted-control-icon-size-*`.** A `--slotted-choice-size-*`
  scale was designed and then refused: it would restate a scale that exists,
  which is the one thing the component layer's bar forbids. The component layer
  is unchanged, and so are the token contract and the theme.
- **The target is the label row.** At `dense`/`sm` the box is twelve pixels,
  under WCAG 2.2 SC 2.5.8's twenty-four, so the label carries
  `min-block-size: var(--slotted-target-min)` — the correction
  `docs/token-foundation.md` says belongs to the family and not to the theme.

### The capability nobody asked for

`checkbox-group` publishes how many of `allValues` are selected to the `field`
around it, through the channel `text-field` opened for characters. The field
draws `2/5` in the spare column of its label row, where a reader already looks
for a count. Nothing surveyed publishes a selection count anywhere.

### A defect fixed in a shared tool first

`packages/storybook-workbench` gained `.slotted-demo-list`, with a test: a set of
choices is a list, a family whose root can be substituted for a `li` needs
somewhere valid to put it, and a `ul` brings a marker and an inset that a
demonstration must not show.

### What was verified, and what was not

- `node --test specs/components/{checkbox,checkbox-group,radio-group}/*.test.mjs`:
  37 pass. Whole contract suite: 453 pass.
- `pnpm --filter @slotted/styles verify`: 504 pass, including the three new
  style tests and the shared `states`, `motion`, `logical`, `fallbacks`,
  `identity` and `tokens` rules.
- `pnpm --filter @slotted/react exec vitest run src/checkbox src/checkbox-group src/radio-group`:
  71 pass across six files.
- `pnpm --filter @slotted/angular verify`: 538 unit tests, the package build, and
  9 bundle-boundary and entry-point tests.
- `pnpm lint`, `pnpm test:contracts`, `pnpm test:package-layers` and
  `pnpm test:docs` pass.
- Harness captures read at light, dark and high-contrast at 420, at light 240,
  at dense, at RTL, and with focus on four separate controls, across all three
  families. Four defects were found by looking and corrected: nine copies of a
  radio scene forming one group of twenty-seven radios, `start` placement
  breaking the alignment of a column, a read-only ground invisible in `light`,
  and a label that stayed at full contrast inside a disabled `fieldset`.
- **Not verified here:** a real screen reader, a physical touch device, and the
  two Storybook reference pages — the servers on 6006 and 6007 were not running
  during this work, and both need a restart before the new families appear.
- `pnpm format:check` and `pnpm typecheck` fail on files this work never
  touched: `switch`, `number-field`, `packages/core/src/number/number.ts` and
  `docs/token-foundation.md`, which are another session's work in progress in
  the same tree. Every file this work owns passes both.

## Switch — 2026-09-03

Wave 3, item 5. `docs/rebuild-order.md` calls it a rebuild; the schema-4 family
had already been deleted with the rest of the old library, so the work was a
build against the field, with `git show HEAD:specs/components/switch/contract.json`
read beside the inventory as the delta.

The inventory is `docs/superpowers/specs/2026-09-03-switch-capability-inventory.md`
— ten implementations surveyed — and the design is
`docs/superpowers/specs/2026-09-03-switch-design.md`.

### The decisions

- **The control is `input[type=checkbox][role=switch]`.** Six of the ten
  surveyed build on the native checkbox; the four that build on a `button` pay
  for it, and the family that shipped here before submitted nothing with a
  form. Space, the label association, `name`/`value`, `form.reset()`,
  `:disabled` inside a disabled `fieldset` and `:checked` all come from the
  platform. The contract break and the move a consumer makes are written in the
  design document.
- **No `aria-checked`.** The APG's switch pattern states that a checkbox-based
  switch uses the HTML `checked` attribute instead, and writing both is the
  state said twice by two things that can disagree.
- **Enter is not bound.** The APG lists it as optional; inside a form it
  submits, and a switch that stole it would break the form. Cost: a reader who
  expects Enter presses Space.
- **The click is the request**, because it is the one event that fires for a
  pointer, for Space and for `element.click()` — and the one that can be
  refused before the element moves. The reason is read from the event:
  `detail > 0` is a pointer, `detail === 0` with `isTrusted` is the keyboard,
  and neither is a script. A refused move cancels the click and restores the
  element in a microtask, because jsdom performs the platform's own revert for
  `element.click()` and not for a dispatched one.
- **Read-only is implemented, not declared.** The native `readonly` attribute
  does nothing on a checkbox, so it is `aria-readonly` plus a refused
  activation: focusable, announced, still submitted. It replaces Fluent's
  `disabledFocusable` and Material's `disabledInteractive`.
- **`loading` is the capability nobody asked for.** A switch's defining
  property is that it takes effect immediately, which in a real product means a
  write in flight. Activation is refused at the click, the geometry does not
  change, the thumb draws a three-quarter arc where its mark was, and the
  pending label reaches a live region two seconds in — Primer's number, for
  Primer's reason.
- **The label and the description are the family's own**, with
  `labelPlacement`. The first draft gave the label to `field` and drew a status
  word instead; the reviewer rejected it, and `checkbox` — settled one item
  earlier in the same wave — had already answered the question the other way.
  The metrics are `checkbox`'s metrics, so two binary controls in one list line
  up. The status word went with the draft: the mark carries the state without
  colour and without position, and a third text saying "On" beside a labelled
  control is the same fact three times.
- **The identifier is the field's when there is a field.** A field writes `for`
  at its label whether or not the control draws one, so a switch keeping its own
  identifier inside a field would orphan that label. `checkbox` generates its
  own and leaves it orphaned; the difference is raised at the gate rather than
  copied.
- **The knob is one colour in both states and all three schemes.** Reading
  `--slotted-surface` inverted the relationship between scheme and state — a
  white knob on a light track in `light`, a near-black one on a lighter track
  in `dark` — which is two components rather than one.
- **The thumb travels on `inset-inline-start`**, so a right-to-left document
  mirrors the movement with no direction-specific rule at all.

### What was verified, and what was not

- `node --test specs/components/switch/*.test.mjs`: 17 pass.
- `node --test packages/styles/src/switch/switch.styles.test.mjs` plus the
  shared `identity`, `logical`, `motion` and `states` rules: 27 pass.
- React: 27 pass across the unit spec and the stories spec.
- Angular: the package suite is green with the family's 16 specs in it.
- `pnpm typecheck`, `pnpm lint`, `pnpm test:contracts`, `pnpm test:docs` pass.
- Harness captures read at light, dark and high-contrast at 420, at light 240,
  at dense, at RTL, and with focus on the control in two scenes. Defects found
  by looking and corrected: a check that filled the knob, a knob that inverted
  between schemes, a pending arc that read as a half-moon rather than a
  spinner, a read-only ring drawn in the same blue as the focus ring two pixels
  away, and a caption promising a wrap the demonstration did not show.
- **Found by the reviewer, not by the tests:** pressing the pill did nothing —
  the track shares the control's grid cell and paints over it, so every pointer
  press landed on the paint and only the label toggled. `z-index: 1` on the
  control fixes it, `pointer-events: none` on the track states it, and the
  styles test now holds both.
- The React reference page was read rendered at 1280 and 720, in light and in
  dark, at `http://localhost:6006/iframe.html?viewMode=docs&id=components-switch--reference`.
- **Not verified here:** a real screen reader, a physical touch device, and the
  Angular reference page — `@slotted/angular/switch` is a new entry point and
  the Storybook on 6007 reads `packages/angular/` once at startup, so it serves
  the raw source until the reviewer restarts it.
- `pnpm format:check` fails on three `specs/components/{checkbox,checkbox-group,radio-group}/contract.json`
  files this work never touched, and `packages/styles/package.json` had lost the
  exports of a dozen rebuilt families to a concurrent session; its `exports` map
  and test scripts are now derived from `packages/styles/src` rather than
  hand-listed.

## Currency Field — 2026-09-03

One monetary amount, in one currency, typed the way a cash register is typed.
The family entered wave 3 out of the queue's order, by direct invocation, and
its scope paragraph was written with it into `docs/rebuild-order.md`.

### Decisions

- **It is a family rather than a mode of `number-field`.** The guide's rule —
  "moeda e percentual são formatações, não tipos numéricos distintos" — is about
  formatting, and it still holds: `number-field` keeps
  `format={{ style: 'currency' }}` and nothing here duplicates it. What this
  family adds is a **typing model**: under `entry="cents"` the digits are the
  value, they enter at the minor unit and shift left, and the text is rewritten
  on every keystroke — the exact rule `number-field` forbids itself. Two
  contradictory text models cannot live under one `data-ui` and one stylesheet.
- **Rewriting the text on every keystroke is legal here** because there is no
  typed text to protect: the string is generated, the separator can never be
  typed, and the caret has exactly one legal position — after the last digit and
  before whatever affix the locale writes at the end. Both bindings put it there
  after every edit.
- **A paste is parsed, not accumulated.** `R$ 1.480,00` copied from a bank
  statement is one thousand four hundred and eighty, not fourteen and eighty.
  Every surveyed masked input loses that, and it is the one case where the
  cash-register rule would lose the reader's own data.
- **The sign is a key, not a digit.** `-` and `+` are refused at `beforeinput`
  and set the sign instead, so pressing `-` twice does not produce two signs and
  the sign never enters the digit run. Typing `-` into an empty amount is
  remembered until the first digit arrives, which a sign derived from the text
  could not express.
- **There is no `allowNegative`.** `min={0}` already says it, in the vocabulary
  the range is written in; a boolean beside a range is a second answer to one
  question, and the two can disagree.
- **The currency governs and the locale writes.** The minor units, the symbol
  and the shift come from the ISO 4217 code; the separators, the symbol's
  position and the numbering system come from the locale. `pt-BR` plus `USD` is
  `US$ 1.480,00`, and it is a demonstration on both pages because it is the
  combination a hand-configured mask gets wrong.
- **A missing currency throws** where the control is written, in both bindings.
  A field that guessed two minor digits would write `¥12,34`.
- **The request carries the exact integer of minor units**, which no surveyed
  implementation does. A consumer who wrote `Math.round(value * 100)` would lose
  a cent on every half; under cents-first entry the integer is what the reader
  typed, so it is exact by construction.
- **`stepper` defaults to `none`** where `number-field` defaults to `stacked`,
  and `step` is one major unit. An invoice total is typed, not nudged.
- **`align` defaults to `end`**, and it is the one place this family names a
  physical side: `unicode-bidi: plaintext` pins the value's run left-to-right,
  so a logical `text-align` would resolve against the pinned run instead of the
  document. Both alignments are written under a `:dir()` guard.
- **The two families meet in core, not in a binding.** `@slotted/core/currency`
  composes `@slotted/core/number`; nothing is imported from the sibling family's
  React or Angular source. The cost is that the frame, the repeat timer and the
  field wiring are written once per family in each binding, which is preferred
  to a shared internal class no contract describes.

### Defects found

- `@slotted/core/number` kept `digitsOf` private, so a second module could not
  read a locale's own ten digits. It is exported now — the one change outside
  this family, and additive.
- Three amounts in the first harness fragment were strings `Intl` does not
  write: a lowercase currency name, a name CLDR spells differently, and an
  accounting negative in a locale that writes a minus sign instead. All three
  were replaced with the formatter's own output, checked against
  `Intl.NumberFormat` rather than against memory.
- The `adornments` demonstration showed `R$` twice — once beside the value and
  once inside it — because the family forces `style: 'currency'` and `Intl` has
  no option that hides a currency. `currencyDisplay="none"` is this library's
  own fifth value: a plain decimal with the currency's own fraction digits, so
  the symbol can live in an adornment while the code still decides the shift.
  Found by reading the rendered reference page, not by a test.
- The split arrangement inset the amount by the gap rather than by the frame's
  padding, so a column mixing arrangements put the digits five pixels apart —
  which is the comparison `align="end"` exists to make. Found in the capture.

### What was verified, and what was not

- `node --test specs/components/currency-field/*.test.mjs`: 28 pass.
- `node --test packages/styles/src/currency-field/currency-field.styles.test.mjs`
  plus the shared `fallbacks`, `identity`, `logical`, `motion`, `states` and
  `tokens` rules: 65 pass.
- `@slotted/core`: 29 tests for `currency`, and the package's 198 all pass.
- React: 55 pass across the unit spec and the stories spec.
- Angular: the package suite is green at 644 with this family's 40 in it, and
  `@slotted/angular/currency-field` builds as its own entry point.
- `pnpm test:contracts` (529), `pnpm test:package-layers` (10) and
  `pnpm test:docs` (15) pass.
- Harness captures read at light, dark and high-contrast at 420, at light 240
  and 720, at dense, in right-to-left, and with focus photographed on the
  control in two schemes and on a stepper.
- **Not verified here:** a real screen reader, a physical touch device, and both
  reference pages. `currency-field` is a new family in both Storybooks — the
  React one resolves `@slotted/styles/currency-field/tokens.json` through a
  subpath export a running Vite server has not seen, and the Angular one reads
  `packages/angular/` once at startup — so both need a restart the reviewer owns.
- **Concurrent sessions:** `pnpm check` fails on `slider` and `form` files this
  work never touched — `packages/core/src/form/form.ts` (lint), the same file's
  test (typecheck), fourteen unformatted files, and an
  `@slotted/angular/form` entry point whose `src/public-api.ts` does not exist
  yet, which stops the Angular library build after this family's own entry point
  has already been built.

## Slider and Form — 2026-09-03

Wave three, items seven and eight, built together because the second one needs
a form of real controls to coordinate and the first one is the last control the
wave was missing.

### The decision that shaped Slider

**Every thumb is a real `input[type="range"]`, in both bindings.** The surveyed
field disagrees about this more than about anything else: Angular Material's
thumbs are `input[matSliderThumb]` elements and Base UI's `Slider.Thumb` renders
a `div` with a nested range input, while Radix and Ark write `role="slider"` on
a `span` and React Aria and Mantine render neither. The element was taken
because it supplies six things the library would otherwise write and test twice
— the role, the value set, form submission, form reset, `disabled` and the tab
order — and nobody ships it in both frameworks.

Its cost is that the element has to be invisible and unhittable: `opacity: 0`
and `pointer-events: none`, filling the thumb it lives in. The thumb a reader
sees is the family's own element, the drag is the family's own gesture, and the
focus ring is drawn by `[data-part='thumb']:has(> [data-part='input']:focus-visible)`
— the technique `number-field`'s frame already uses.

Two consequences worth writing down. **Each thumb's own `min` and `max` follow
its neighbour**, which is not an implementation convenience: the APG's
multi-thumb pattern requires the announced range of a dependent slider to be
updated when the value changes, and an attribute is how a native slider says it.
Radix and Ark clamp in script and leave the announced range wrong. And
**`readonly` is the family's**, because `input[type=range]` is not in the list of
types the attribute applies to; the family refuses every pointer and key change
and writes `aria-readonly`.

**The keyboard is the family's too.** Chrome moves Page Up on a range input by a
tenth of the range and Firefox by one step, so `largeStep` could not mean one
thing without binding the whole table. The inline arrows follow the reading
direction and the block arrows do not — a scale has a direction and bidi is not
it — which is what the pattern's note about reversing the direction means in a
mirrored document.

### The decision that shaped Form

**It owns the errors and nothing else.** `docs/component-features.md` § 6 puts
the boundary there, and the family holds to it: values come from `FormData`,
validity from `checkValidity()`, dirtiness from the controls' own `input`
events, and the values themselves stay with Reactive Forms in Angular and with
the consumer's own state in React.

`novalidate` is written so the browser's bubble does not appear beside a message
the `field` is already drawing, and constraint validation still runs — the
platform's `validationMessage` is localized by the operating system in a way no
library can better. Three sources merge into one map, latest last, and the map
is ordered by `form.elements` rather than by its own keys: document order is the
order a reader will fix the fields in, and an object's key order is the
server's.

The summary is the GOV.UK error summary item for item, including the one thing
that is free here: its messages are the same strings the fields show, because
one map feeds both.

### The capability nobody asked for

Slider: **a mark's label becomes the announced value.** The APG names
`aria-valuetext` for a value that is not user-friendly and gives "Monday" as its
example; a mark that already carries a label is that string, so a five-step
quality scale announces "Médio" rather than "50". Ark and Mantine both make the
consumer write the function.

Form: **`guardUnsaved`**, a `beforeunload` while anything in the form has been
edited. None of the nine surveyed implementations guards it. It is off by
default, because a page that refuses to close after one character is a trap.

### Two defects fixed in shared tooling first

`specs/contract.schema.mjs` had no word for the state a form holds. `validity`
was added to `KNOWN_CAPABILITIES` and to `MUTABLE_CAPABILITIES` with a test,
rather than calling an error map a `value`. It is raised at the gate, because
the vocabulary is a public contract outside this family.

`packages/storybook-workbench/src/scenarios.tsx` then had no API pair for it, so
`validity` was given `errors` and `defaultErrors` — the pair
`docs/state-and-events.md` names — with its own test.

### What the pictures changed

- **A rail is a channel, not a line.** Painted as one flat neutral it cannot
  hold 3:1 against the page and still show a fill inside it — in the
  `high-contrast` scheme every neutral is the same black, and the first capture
  was a black rail with a nearly black fill on it. It is now a sunken interior
  with a control-weight edge.
- **Marks are ruler ticks beside the rail, not dots on it.** A dot on the rail
  has to be legible against the fill and against the empty channel at once.
- **A read-only slider painted nothing** and was identical to the one above it,
  which is the defect `number-field` found in the same state. The scale steps
  onto a neutral ink and the thumb takes the control edge rather than the
  disabled one, which the theme keeps apart in every scheme.
- **The label at the end of a scale is aligned inside**, because centred on its
  own tick half of "Máximo" hung off the control.
- **The bubble's room is reserved whether or not it is showing**, less the gap
  the root already puts there. Added, the value landed on the read-out; added
  whole, the two distances stacked.
- **Neither root claimed a width.** Both were found in the rendered reference
  pages rather than in the harness: in a shrink-to-fit stage the slider
  collapsed to three bare thumbs with no rail, and the form printed every label
  one character per line and every button as a vertical strip. Both now take the
  width they are offered, the way every other control in the library does.
- **A container query was written and taken out.** A label of one long word
  cannot wrap at any cap, so it only ever moved multi-word labels. The slider is
  fluid rather than reflowing, and the stylesheet says so.

### What was verified, and what was not

- `node --test specs/components/{slider,form}/*.test.mjs`: 42 pass. Whole
  contract suite and the shared style laws: 1139 pass.
- `pnpm --filter @slotted/core exec vitest run src/slider src/form`: 48 pass.
- `pnpm --filter @slotted/styles test`: 574 pass, including the two new family
  suites and the shared `states`, `motion`, `logical`, `fallbacks`, `identity`
  and `tokens` rules.
- `pnpm --filter @slotted/react exec vitest run src/slider src/form`: 65 pass.
- `pnpm --filter @slotted/angular verify`: 693 unit tests, the package build,
  and 9 bundle-boundary and entry-point tests.
- `pnpm check` passes end to end: format, lint, typecheck, contracts, package
  layers and docs.
- Harness captures read at light, dark and high-contrast at 420, light at 240,
  dense at 420, RTL at 420, single scenes for `marks`, `orientation`, `states`,
  `summary`, `actions` and `composition`, and two focus captures.
- The React reference pages were read rendered, at 1280 pixels in light, and
  both collapse defects above were found there.
- **Not verified here:** a real screen reader, a physical touch device, and the
  two Angular reference pages. The Angular Storybook reads the directories of
  `packages/angular/` once at startup, so a family added since answers
  `SyntaxError: Unexpected token 'export'`; both servers need a restart before
  the four new pages can be read.

## Button, Number Field and Currency Field — two corrections — 2026-09-03

Two defects the reviewer found on a rebuilt library, fixed together: a shadow
that reached a variant that has no frame, and a formatting model that made the
reader wait for the one thing the format is for.

### A shadow belongs to the frame, not to the family

`--slotted-control-shadow` was written on `[data-ui='button']`, so every member
of the family took it — including `ghost`, which draws neither a fill nor an
edge. A label that casts a shadow is a rectangle nobody drew, and a toolbar of
ghost actions read as a row of invisible cards.

The token's own definition settles where it goes: `docs/token-foundation.md`
calls it "the shadow a framed control carries at rest". `solid` and `outline`
draw a frame and carry it; `ghost` does not and does not. A `ghost` toggle that
is **on** has taken the tone's fill and edge, so it is framed at that moment and
carries it too — otherwise one toggle would be lifted or flat depending on the
variant it happened to be written as. Disabled loses it under every variant, for
the reason `text-field` already states: nothing a person cannot reach is lifted
off the page. `box-shadow` joined the transition list, so the pressed state
arrives with the fill rather than after it.

`packages/styles/src/button/button.styles.test.mjs` holds all five clauses, and
it was watched failing against the previous sheet before the sheet changed.

### The number field now formats as it is typed

`formatOn: 'change' | 'commit'`, default `change`, on `number-field` and on
`currency-field` under `entry="natural"`. A contract break, recorded rather than
avoided.

What shipped rewrote the text only at a commit, on the ground that
"reformatting mid-keystroke moves the caret under the reader's hands". That is
true of an implementation and false of the idea. Grouping is what makes a long
number scannable, and the moment a reader most needs to check a magnitude is
the moment they are getting it wrong; a `BRL` field went from `1234567` to
`R$ 1.234.567,00` in one silent jump at blur.

The field is split six to five, so neither model is "what the field does". What
settled it: both commit-formatting sources this family was built from carry a
request for the other behaviour — `mui/base-ui#3350`, open, with the current
behaviour described as "just onBlur", and `adobe/react-spectrum#9018`. The
accessibility argument against live formatting is folklore: no WCAG criterion,
no APG guidance, no screen-reader matrix covers it. What the sources do contain
is React Aria's `commitAndAnnounce()`, an **assertive** live announcement fired
on blur because a silent rewrite there is what needs compensating — and this
library's `live-announcer` is wave 5 and does not exist yet. And
`currency-field`'s default `entry="cents"` already regrouped after every edit,
so waiting for blur in `number-field` made one library answer one question two
ways.

The engineering is in `@slotted/core/number`, shared by both bindings:

| Hazard                                  | What was done                                                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The caret after a new separator         | Counted in the reader's own characters — digits, decimal separator, sign — not in string indices. A grouping separator is the family's and is not counted.                                                          |
| A nought or separator still being typed | The fraction is never handed to `Intl`: the whole part is regrouped through `formatToParts` and the typed fraction is spliced in after the last integer part, which is the end of the number and not of the string. |
| Backspace against a separator           | `deleteAcrossSeparator` takes the digit the reader meant. react-number-format hops the caret instead; this takes imask's side, because a key that deletes something beats a key that moves the caret.               |
| An IME run                              | A composing keystroke sets the text and nothing else. react-number-format's `#843` is this defect, still open.                                                                                                      |

Three formats are left to the commit rather than guessed at: past fifteen
integer digits, where a double stops holding the integer exactly; a
significant-digit format, which rewrites the whole part itself; and
`currencySign: 'accounting'`, where reshaping `-12` into `(R$ 12)` puts the next
keystroke outside a bracket the parser strips and the amount loses its sign.

### Three defects found by looking, after the tests were green

**A keystroke inside a prefix broke the field.** Typing into a live `BRL`
control in the browser, with the caret placed between the `R` and the `$` and
Backspace pressed: the text stayed `R 12.345` and `aria-valuenow` went to null.
`formatWhileTyping` reached the text through `normalise`, the parser's route,
which removes an affix only whole — and `R ` matches no affix. It now builds the
number from the reader's own characters and regenerates everything else, so the
affix is put back and the caret is pushed out of it onto the first character the
reader owns. Formatting on commit had the same exposure and hid it: the affix
was only on screen after the field was left.

**Four empty boxes demonstrating nothing.** The first `formatOn` scene rendered
as four blank controls in a mostly empty canvas — the axis it exists to show is
invisible at rest. Both scenes now hold the same two amounts, and the captions
carry what changes between two keystrokes, which is the only place the
difference lives.

**A reference page that no test could fail.** The docs scene `formatOn` was
declared and the story existed, and `scenarioCoverageErrors` proved the pairing
— but `bindScenes` looked the story up in a hand-written table, the new line was
missing from it, and the whole React reference page rendered as
`Scene "formatOn" is bound to no story`. Every test passed. `bindScenes` now
falls back to the scenario a story declares through `scenario()`, which is the
same fact the coverage gate already checks, so a table that has fallen behind
still binds; the table still wins where it answers, so a deliberate pairing
stands. Fixed in `packages/storybook-workbench` with four tests of its own,
before the family's work continued, and it closes this for every family rather
than for this one.

**A defect found on the way.** A percent format writes no fraction by default,
so `formatToParts` gives it no `decimal` part and `createNumberFormat` fell back
to the literal `.` — which is the grouping separator in every locale that groups
with a full stop. The two were indistinguishable, and under `pt-BR` percent the
caret counted every group separator as a character the reader had typed:
`1.234` then `5` came out as `12.354`. A second formatter, asked for a fraction
it cannot refuse, now names the separator the locale would use if it had one.

**How a consumer moves.** `formatOn="commit"` on the control, or
`formatOn: 'commit'` on `NumberFieldDefaultsProvider` /
`provideNumberFieldDefaults` for a whole application. Nothing else changed: the
value, the reasons, the clamp policy, the keyboard and the commit are what they
were.

### What was verified, and what was not

- `pnpm --filter @slotted/core exec vitest run src/number src/currency`: 70 pass, including 16 new cases over
  `formatWhileTyping` and `deleteAcrossSeparator` in `pt-BR`, `en-US`, `de-DE`,
  `fr-FR` and `ar-EG`, under plain, currency and percent formats.
- `node --test specs/components/{button,number-field,currency-field}/*.test.mjs`
  and the shared style laws: all pass.
- `pnpm --filter @slotted/react exec vitest run src/number-field src/currency-field src/button`:
  204 pass. `pnpm --filter @slotted/angular test`: 721 pass.
  `pnpm --filter @slotted/storybook-workbench test`: 38 pass.
  `pnpm --filter @slotted/styles test`: 575 pass.
  Both bindings carry a keystroke-by-keystroke caret test and a
  backspace-against-a-separator test, written against real `InputEvent`s rather
  than a whole-value change.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:package-layers` and `pnpm test:docs`
  pass. `pnpm format:check` and `pnpm test:contracts` fail only on
  `progress-indicator`, `tabs` and `toolbar` — a concurrent session's untracked
  work in the same worktree, untouched here.
- Harness: `button` read at light, dark and high-contrast, `variants` and
  `states` scenes, which is where the ghost shadow was seen and where its
  absence was confirmed.
- The live React control was driven over CDP with real key events. Typing
  `1234567` into a `pt-BR` field gives `1`, `12`, `123`, `1.234`, `12.345`,
  `123.456`, `1.234.567` with the caret at 1, 2, 3, 5, 6, 7, 9 and
  `aria-valuenow` tracking every keystroke; Backspace with the caret after a
  separator in `12.345` leaves `1.345`, which is the digit the reader meant.
- The React reference page was read rendered at 1280 pixels in light and dark,
  with every code drawer opened.
- **Not verified here:** a real screen reader on the reshaped text, and a mobile
  soft keyboard — react-number-format re-applies its caret inside a
  `setTimeout(0)` for mobile Chrome, and whether this implementation needs the
  same could not be tested on this machine. Both reference pages need reading
  in a running Storybook.

## ProgressIndicator — 2026-09-03

- **One family, three components, one member.** `progress-indicator` absorbs
  `spinner`, `progress-bar` and `loading-bar`, which had already been deleted
  from `specs/components/`, and adds a fourth recipe the three never had. The
  contract declares one member and the anatomy names which component renders
  each part — the shape `skeleton` established for `Skeleton`, `SkeletonText`
  and `SkeletonRegion`, and the only shape the reference-page contract can
  express, because `createReferencePage` takes one member and one scenario list.
  `ProgressBar` is the linear recipe, `ProgressCircle` the circular one and the
  spinner both, and `Loader` is M3 Expressive's shape-morphing loading
  indicator. `data-shape` is `linear`, `circular` or `morph`, written by the
  component and never chosen: a consumer picks the component, and a shape prop
  would be a fourth way to say what they already said.
- **Decision: `measurement` stops being mutable, and that is a change to the
  shared vocabulary.** `progress-bar` put the word in `KNOWN_CAPABILITIES` and
  schema 5 filed it under `MUTABLE_CAPABILITIES`, which would have obliged this
  family to declare a request nothing can emit and a `reason` no vocabulary
  holds. A progress indicator cannot decide it has progressed. `measurement` is
  now a quantity the consumer states and the family draws; a value the reader
  moves is `value`, which is what `slider` and every field declare. No contract
  declared `measurement`, so nothing else moved.
- **Decision, and it decided the anatomy: `progressbar` is children
  presentational.** ARIA 1.3 gives the role **Children Presentational: True**
  (<https://w3c.github.io/aria/#progressbar>), so every element inside the one
  holding the role is pruned from the accessibility tree. A `role="status"`
  child of a progress indicator is a live region no reader ever hears. `live`
  and `announceStep` were designed, written into the contract and then removed
  for that reason: the words that carry a wait belong to `inline-message`, which
  section 9 of the feature guide already names for "ajuda, erro, warning,
  success ou progresso" with an announcement policy of its own — and there the
  sighted reader sees the same sentence the screen reader speaks. The role stays
  on the root, which is Base UI's and React Aria's anatomy; the cost is written
  on both reference pages, because content a consumer puts inside an indicator
  is silent.
- **Decision: the indicator is the tone's `text` role, not its `solid` one.**
  The indicator is a graphic bearing meaning, so WCAG 2.2 1.4.11 binds it at
  3:1, and the `text` roles are the steps the theme's contrast test holds to
  4.5:1 against every surface. It is also the only choice that makes
  `secondary` work: `--slotted-tone-secondary-solid` is the surface's own
  colour in `light` and the page's own white in `high-contrast`, the deviation
  `button` recorded and could not fix inside its own family. `secondary` is the
  one tone whose ink is neither — `--slotted-tone-secondary-text` is `#172033`
  in light and `#000000` in high contrast, and the first capture showed a
  background job drawn as the darkest thing on the page. It reads
  `--slotted-border-strong` instead, which the theme holds to exactly the 3:1 a
  graphic needs, the substitution `badge` and `status-indicator` make for their
  own neutral marks.
- **Decision: the track is a computed tint rather than the tone's `surface`
  role.** That role is `#dbeafe` in light — right — and then `#181b22` in dark,
  one step off a `#131316` page, and `#ffffff` in high contrast, which _is_ the
  page. A track painted from it disappears in two schemes out of three. The
  track is `color-mix(in oklab, <ink> 24%, var(--slotted-surface))`, which moves
  away from the ground in every scheme because the ink is the far end of each
  scheme's own range — the reasoning `skeleton` recorded for its own fill.
- **Decision: M3's gap and stop indicator are one thickness, not 4dp.** M3
  specifies 4dp for the track, the indicator–track gap and the stop indicator
  alike. Making the gap and the dot equal to the thickness is the proportional
  form of the same decision: a 4-pixel gap in the 2-pixel `sm` bar would be
  wider than the bar is tall. The trailing track is a `::before` starting one
  gap past the further of the value and the buffer, so the indicator and the
  remainder are two fully rounded bars with air between them.
- **Decision: the rings read the control height scale.** A circular indicator
  is exactly as tall as a control of the same step, so a spinner beside a button
  matches it at every density, and the component layer of the token contract
  stays as `avatar` left it. `--slotted-progress-indicator-size` is the
  unstepped escape hatch `icon`, `avatar` and `skeleton` established, and it is
  what Button will set to put this ring in an icon slot. The stroke is six of
  forty-eight viewBox units, which is one eighth of the diameter at every size
  — the ratio `button` derived for its own ring, so the two are the same object.
- **Decision: `delay` withholds the paint entirely.** The root carries the HTML
  `hidden` attribute until the wait is worth reporting: no box, no role, no
  reserved band. A bar that held a four-pixel band open for a wait it had
  decided not to report would shift the page twice for one load. The stylesheet
  carries one rule for it, because the root's own `display` wins over the user
  agent's `[hidden]`.
- **Decision: `decorative` is one switch and not two.** It removes the role as
  well as hiding the box; an indicator a reader can reach and that announces
  nothing is worse than either half. A consumer's own `aria-hidden` is passed
  through rather than overwritten, and the way back into the tree is to stop
  saying `decorative`.
- **Decision: the data attributes are empty strings in both bindings.** React
  renders a `true`-valued `data-*` as `data-x="true"` while a template and the
  harness fragment write `data-x=""`. Both match `[data-x]`, so nothing breaks —
  and three writings of one DOM that differ in a value nobody reads is three
  writings a reader has to compare character by character. This is the one place
  the family deliberately differs from `skeleton`.
- **Two capabilities declined, each naming what owns it instead.** Segments —
  Primer's `ProgressBar.Item` and Ant's `steps` — are a row of bars, and the
  family that arranges a row of things is `inline`; a sequence of _named_ steps
  is `stepper`. A dashboard arc is `gauge`, which section 13 of the guide
  already names, and the Meter pattern draws the same line: a level is not a
  task.
- **Defect found in a shared tool, fixed first.** The workbench had no ground a
  fixed-position demonstration could be pinned inside, so `placement="page"`
  would have drawn one bar across the top of the reference page, over the
  navigation, with every scene declaring one landing in the same place.
  `.slotted-demo-viewport` was added to `workbench.css` with a test in
  `workbench.styles.test.mjs`: `contain: paint` makes the box the containing
  block for a fixed descendant, and the scene's caption says it stands in for
  the viewport.
- **Defects found by looking, and corrected.** The first wavy bar had one period
  every three thicknesses and read as a sawtooth; five is the wavelength M3
  specifies at 8dp. The wavy ring took three attempts: 32 samples smoothed into
  cubics cost four times the characters and drew a spiked star; one quadratic
  per half-crest, smooth in the arithmetic, drew a rounded hexagon, because a
  quadratic whose control point sits on the base radius is nearly a chord at a
  small angular step; one cubic per half-crest with the standard sine control
  points is a wave. At the 38-pixel `lg` step it was still a scalloped disc, so
  a wavy ring is drawn half again as wide as its step — the decision M3 takes at
  52dp against 44dp. An empty ring carried a gap at twelve o'clock for an
  indicator that was not there, so the arc gap collapses to nothing at nought
  per cent by the same clamp the indicator's opacity uses. And the words sat
  four pixels above the bar, which was tight at the thick step.
- **Defect the core test caught.** `PROGRESS_WAVE_RING_PATH` and the harness
  fragment had drifted: the fragment carried the third attempt while the
  constant still held the second. The test asserts the path's extent inside the
  `0 0 48 48` box and its own length, which is what noticed.
- **The loader's motion was rebuilt twice after the reviewer looked at it, and
  the second time corrected my own reasoning rather than a number.** The first
  pass slowed the morph and left the rotation `linear`, on the argument that an
  eased infinite turn hesitates twice a revolution. That is true of a single
  turn and false of this one. Reading
  `LoadingIndicatorAnimatorDelegate.java` settled it: M3 decomposes the
  rotation into `CONSTANT_ROTATION_PER_SHAPE_DEGREES = 50` advanced by a linear
  clock plus `EXTRA_ROTATION_PER_SHAPE_DEGREES = 90` driven by the _same_
  `SpringAnimation` that drives the morph, summed. Sixty-four per cent of the
  turn lurches with the shape; the linear parcel is the minority and exists so
  the object never freezes between forms. A constant turn is the _old_ circular
  indicator's behaviour, which the loading indicator was introduced to replace,
  so the family had shipped the thing M3 wrote the component to get away from.
- CSS cannot add two animations of one property without
  `animation-composition`, so the sum is expressed geometrically: the container
  carries the linear parcel, the shape inside it carries the sprung one, and
  nested rotations multiply. The container is a circle with a flat fill, so
  turning it is invisible — it is turning its child. Both animations take
  `--slotted-easing-emphasized` at the same period and on the same keyframe
  boundaries, because in M3 they are one spring; `cubic-bezier(0.3, 0, 0, 1.3)`
  is that spring's approximation, and the `1.3` is what carries the outline and
  the rotation a little past each target before they settle.
- The period is now twice the slow loop rather than three times it: 3.2 seconds
  over five shapes is 640 milliseconds each, against M3's own
  `DURATION_PER_SHAPE_IN_MS = 650`. The first pass had guessed 960.
- The reviewer's proposed curve, `cubic-bezier(.03,.47,.97,.59)`, was declined
  with the arithmetic rather than an opinion: with the `x` control points at the
  extremes and the `y` values near the middle, velocity runs 15.7 at the start
  of a segment, 0.58 through the middle and 13.7 at the end. Half the morph
  would be covered in the first three per cent of the segment, the rest a crawl
  through the midpoint blob, then a snap. The five named shapes would disappear
  and five jolts take their place. Its own transpose is the curve the proposal
  was reaching for, and the scale already holds an equivalent with the spring
  attached.
- Verified by freezing both animations at three phases inside one 640-millisecond
  segment: between 0.66 and 0.80 seconds the outline goes from four petals to
  five _and_ the orientation moves about 56 degrees, which is the throw and the
  change of form being one movement. Under reduced motion the container's drift
  stops with everything else.
- And the contained shape was off its own centre at `md` and not at `lg`. A grid
  centres by splitting the remainder in half, and 79 per cent of a 34-pixel box
  is 26.86, so the half-pixel rasterised to one side; at `lg` the same ratio
  happens to land on 30 inside 38 and the shape was centred. The shape is now
  `round(nearest, calc(0.79 * <size>), 2px)`. Every control height this family
  reads is even at every density, so an even shape leaves an even remainder and
  both halves are whole pixels. Confirmed by freezing the morph to a circle and
  photographing all three steps side by side.
- Deviations: none. The one thing the family does not answer inside itself is
  the `secondary` tone's `solid` role, which it routes around rather than fixes;
  the ramp belongs to the theme, and `button` has that recorded already.
- Verification: `node --test specs/components/progress-indicator/*.test.mjs`
  (19), `pnpm --filter @slotted/core exec vitest run src/progress` (17),
  `pnpm --filter @slotted/react exec vitest run src/progress-indicator` (36),
  `pnpm --filter @slotted/angular test` (727 across every family), the shared
  style laws in `packages/styles/src`, and
  `pnpm --filter @slotted/storybook-workbench test` (21 in the styles suite).
  `pnpm typecheck`, `pnpm test:contracts` (631), `pnpm test:package-layers` and
  `pnpm test:docs` pass. `pnpm format:check` and `pnpm lint` fail only on
  `tabs`, `toolbar`, `overflow`, `pagination` and `stepper` — a concurrent
  session's work in the same worktree, untouched here; every file this family
  owns passes both.
- Harness: `/home/dreco/dev/slotted/tools/harness/out/progress-indicator.html`,
  eleven scenes, read in `light`, `dark` and `high-contrast` at 420, at 240 and
  720 for the linear and content scenes, at `dense`, and in `rtl`. The morph
  sequence was read frame by frame by freezing the animation at five phases in
  the built page, and the reduced-motion rest positions the same way.
- **Not verified here:** both reference pages in a running Storybook — neither
  port answered while this was built, and a new family needs both restarted
  anyway. A real screen reader on `aria-valuetext` and on the pruned subtree,
  and a physical touch device.
- Follow-on, and it is the one the rebuild order asked for: Button's loading
  ring can now read this family instead of drawing its own border spinning.
  It was deliberately not done here — `packages/react/src/button`,
  `packages/angular/button` and `packages/styles/src/button` are all being
  edited by a concurrent session in this worktree, and the edit is two
  declarations plus one element in three files. The ring's geometry already
  matches: set `--slotted-progress-indicator-size` to the control's own icon
  size and the circle drops into the first icon slot at the same stroke ratio.
- Follow-on: `useLoadingVisibility` now exists twice in React — once in
  `skeleton` and once here — as a thin adapter over one shared rule in
  `@slotted/core/loading`. Both are twenty-five lines of binding glue rather
  than logic, which is the same relationship Angular's two copies have to the
  same rule, and hoisting them into a shared React internal is worth doing when
  neither family is in flight.

## Tabs and Toolbar — 2026-09-03

Wave 4, one invocation for two families, because they answer the same question
about focus from opposite ends: a `tablist` is a composite whose one tab stop
selects, and a `toolbar` is a composite whose one tab stop commands. The
inventory is
`docs/superpowers/specs/2026-09-03-tabs-and-toolbar-capability-inventory.md`
and the design is
`docs/superpowers/specs/2026-09-03-tabs-and-toolbar-design.md`.

### Where the boundary runs, now that three families arrange controls in a row

`button-group` owns the **shape** of a run of actions — gap, alignment,
stacking, one joined bar. `toolbar` owns the **keyboard** — the role, the label,
one tab stop, arrows, groups. `tabs` owns the **selection** of one view and the
panels under it. So `toolbar` declares no arrangement axis at all: a joined run
inside a bar is a `button-group` inside a bar, and the arrows still reach its
buttons, because items are found by being focusable rather than by being
children. `tag` keeps its own toolbar for its chips; reaching for this family
there would put one family's roving focus inside another's.

### Decisions that would otherwise have been open questions

- **The marker is not measured.** Every surveyed indicator reads the active
  tab's box; Base UI ships `renderBeforeHydration` because of it. Here the root
  records `data-activation-direction` from the two indices and the stylesheet
  turns that into a transform origin, so the outgoing and incoming markers move
  the same way and the family is right in a server response. The cost is
  written: the bar does not physically cross the tabs in between.
- **The dismiss control is out of the arrow ring and inside the accessibility
  tree.** In the ring it would double the arrow presses it takes to cross a
  list; hidden from the tree it would be a control only a mouse can reach. It
  is `tabindex="-1"`, and the tab announces `aria-keyshortcuts="Delete"`.
- **A dismissal moves the selection to the neighbour**, with the reason
  `remove`: the following tab, or the preceding one when the dismissed tab was
  last. It is the APG's own focus rule applied to the value, which Carbon and
  Cloudscape both leave to the consumer.
- **`activation` is an axis, not a capability.** The shared vocabulary files
  `activation` under the mutable list, where declaring it would oblige the
  family to name a request for a value nothing can move.
- **Toolbar declines `disabled`.** A container cannot disable controls it does
  not own, and a bar that refused interaction while its controls still looked
  operable is the defect `packages/styles/src/states.test.mjs` exists to
  prevent. `<fieldset disabled>` around the bar is the platform's own answer,
  and it takes the ring with it: a natively disabled control cannot be focused,
  so the arrows skip exactly those.
- **The paging controls stand beside the list rather than over it.** An overlay
  would need a gradient the width of the control, mirrored for a right-to-left
  document, and it would cover the hairline it sits on. Two `auto` grid tracks
  collapse to nothing while the controls are absent.
- **A wrapping bar can leave a rule at the end of a row.** CSS cannot see where
  a flex line breaks, so the rule stays where the DOM puts it. It is the cost of
  keeping every control visible; `overflow="scroll"` is the other answer, and
  the menu the field agrees on arrives in wave 5.

### Shared tooling fixed first, in its own commits

- `@slotted/core/focus` moved the tab stop relative to `activeIndex` rather than
  to the item the key was pressed on, so the first arrow after a click or a
  scripted focus did nothing. Found in a toolbar whose text field owns the
  inline arrows, where the one key that could take focus out of the field was
  the one key that was ignored.
- The same helper skipped only a control carrying `disabled` itself, so every
  control inside a disabled `fieldset` still received a tab stop the platform
  refuses to honour. It reads `:disabled` now.
- `createScrollAffordance` assumed `scrollIntoView` and `scrollBy` exist; a
  document with no layout engine implements neither, and every consumer's unit
  test crashed on a family that scrolls a row.
- `@slotted/storybook-workbench` demanded a prop called `removeLabel` from any
  family declaring `removable`. A chip is removed and a tab is dismissed — the
  APG's own word — so the table asked `tabs` to document a prop it does not
  have. It is the third name that table claimed and could not know, after
  `selection` and `placement`.

### New in `@slotted/core`

- `createRovingTabindex` gained `crossAxis`, `ownedKeys` and
  `includeAriaDisabled`. The second is the APG's "avoid including controls whose
  operation requires the pair of arrow keys" written as behaviour rather than as
  advice for the author.
- `@slotted/core/overflow` is new: whether a row overflows, whether either end
  is reached, how far one page is, and which way that is in a mirrored scroller.
  The arithmetic is a pure function over four numbers, so the decision that
  draws a paging control is tested without a layout engine.
- `@slotted/core/focus` also holds `TOOLBAR_ITEM_SELECTOR` and
  `toolbarOwnedKeys`, because a control React walks and Angular skips would be a
  family whose keyboard depends on the framework that rendered it.

### Defects found by looking, after the tests were green

- The tabs in a narrow list shrank below their labels and printed over each
  other. A flex item shrinks below its content unless it is told otherwise; the
  list scrolls instead.
- The contained track ran the full width with three pills at one end. It hugs
  its tabs now; the `line` variant keeps the full width, because there the track
  is the edge of the panel below it.
- A vertical list centred its labels, which is a ragged left edge nobody can
  scan.
- The focus ring on a selected tab met the marker and the two became one blue
  shape that said neither thing. The ring is inset by the marker's own width on
  top of the usual offset — and it is inset at all because the list is a scroll
  container, which clips an outward ring on the first and last tab.
- The panel's ring was drawn through the first line of the consumer's content.
  It is the library's outward ring there.
- An `outline` bar at the small step padded itself by two pixels, so a focused
  control's ring sat on the bar's own edge. The padding is floored at the ring's
  reach.

### What was verified, and what was not

- Contracts, stylesheets and both bindings: `node --test` on the two contract
  tests, the six style-law tests and the two family style tests; Vitest on the
  React families (47 tests) and on `@slotted/core` (37 in `focus`, 9 in
  `overflow`).
- Harness: `/home/dreco/dev/slotted/tools/harness/out/tabs.html` and
  `/home/dreco/dev/slotted/tools/harness/out/toolbar.html`, read in `light`,
  `dark` and `high-contrast` at 420, at 240, at `dense` and in `rtl`, plus focus
  captures for the tab, the dismiss control, the panel and a control inside a
  framed bar.
- **Not verified here:** both reference pages in a running Storybook — neither
  port answered while this was built, and two new families need both restarted
  anyway. A real screen reader on `aria-keyshortcuts` and on the dismiss
  control, a physical touch device, and the operating system's own forced-colors
  mode, which the `high-contrast` scheme stands in for.
- A concurrent session in this worktree is mid-way through `breadcrumb`:
  `specs/reference-pages.test.mjs` fails on that family alone, and no file this
  family owns is involved.
