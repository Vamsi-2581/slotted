# Progress Indicator self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven
dimensions, and section 18 of `docs/component-features.md`. The Scoring rule
is followed: each dimension names the one change that would most improve it,
and whether it was made.

Captures live under
`/tmp/claude-1000/-home-dreco-dev-slotted/6fa152d0-e5a0-4282-b5c6-957ad6bca9fb/scratchpad/shots`
and `/tmp`, from
`/home/dreco/dev/slotted/tools/harness/out/progress-indicator.html`.

## 1. Icons

The family owns no icon and draws none. Its three marks are geometry: a
rectangle, an SVG arc, and a `clip-path` polygon. Nothing is a character, and
the only artwork is the two wavy paths, the ring's and the bar's, both of
which are shapes rather than glyphs.

Two consequences were checked in the pictures. Both waves are strokes on a
real path, so a forced palette reaches them the way it reaches the plain ring:
the path takes `Highlight` and keeps its crests. And the morphing loader keeps
its silhouette under forced colours, which is the whole reason it is a shape
and not a ring.

Direction: nothing mirrors, and that is deliberate. A clock runs the same way
in every language, so the arc turns clockwise in `rtl` as it does in `ltr`,
which is the `docs/component-features.md` §2.9 rule for an icon with no
direction. Everything with a direction — the fill, the gap, the stop dot, the
wave's travel, the label and the value — mirrors, and the `rtl` captures show
all five.

**The one change:** a status icon on a finished or failed bar, as Carbon
draws. Not made, and it is a decline with a family named: the icon and the
sentence belong to `inline-message`, which the accessibility scene composes.

## 2. Motion

Every state pair, and whether it moves:

| From → to | Moves | Why |
| --------- | ----- | --- |
| value → value | yes, `--slotted-duration-medium`, `easing-standard` | the eye follows a bar filling; a bar that jumped would report a different number without showing the change |
| determinate → indeterminate | no | it is a different report, not a movement of the same one |
| indeterminate loop | yes, `--slotted-duration-loop-slow` | M3's disjoint indicator: a short bar crosses and swells |
| circular indeterminate | yes, `loop` rotation over `loop-slow` sweep | two periods that do not divide, so no frame repeats in the same orientation |
| loader morph | yes, `2 × loop-slow` on `emphasized` | 640 ms a shape, which is M3's own 650. The `1.3` overshoot is the spring: the outline carries past each target and settles |
| loader rotation | yes, and it is the point | two parcels summed, as `LoadingIndicatorAnimatorDelegate.java` decomposes them — 90° a shape on the morph's own spring and boundaries, 50° a shape linear underneath. The sprung parcel is 64% of the turn, so the object throws itself around as it changes form |
| wave travel, bar | yes, `loop-fast`, linear | M3's own `PHASE_ANIMATION_DURATION_MS = 1000` with a null interpolator. One registered `<number>` carries the phase; the path moves by it and the dash hides the same distance, so the window always starts at the track and ends in a round cap on whatever crest is there |
| wave travel, ring | yes, `loop-fast`, linear | a rotation of one crest, which for `R + A·sin(Nθ)` *is* a travelling wave and loops without a seam. The dash follows it back by the same 12.5 of 100 path units, so the arc holds twelve o'clock to within 0.6° — measured across the cycle, not asserted |
| wave amplitude, bar | yes, `long`, `standard` on and `exit` off | full only between a tenth and ninety-five hundredths, per M3's two constants. A registered switch the transitioning percentage throws, a style query that reads it, and `d` transitioning to the same path at amplitude nought — M3's own animator, with its own two easings. `pathLength` is the path's reach, so the end stays at the value while the amplitude is mid-transition |
| wave amplitude, ring | yes, `long`, `standard` on and `exit` off | the same switch and the same transition, between the wound sine and the same fitting at amplitude nought |
| withheld → painted | no | it appears because `delay` elapsed, which is already a deliberate wait; a fade on top would delay it twice |
| painted → withdrawn | no | the same, in reverse: `minDuration` is the delay, and a fade would extend it |
| → complete | yes, by the same value transition | the gap and the stop dot are removed at the end of the fill rather than during it |

Every duration and easing is a token. `packages/styles/src/motion.test.mjs`
finds no time literal, and the three loop tokens are the ones the theme
deliberately does not shorten.

Reduced motion stops every loop rather than shortening it, which is the law and
the opposite of what the deleted `spinner` did. The cost is paid in the open:
the two indeterminate shapes rest at a length that reads as a fraction — the
bar at 46 per cent starting at 27, the arc at 34 of 100 — rather than at nought
or at full, which would each report a number the indicator does not have. Read
in the frozen captures under `shots/still`.

**The three changes, made, and the first was a correction of my own reasoning.**
The rotation was `linear` on the argument that an eased infinite turn stutters.
That is true of a *single* turn and false of this one, and reading
`LoadingIndicatorAnimatorDelegate.java` is what settled it: M3 sums a linear 50°
a shape with a sprung 90° a shape, and the sprung parcel — the majority — shares
the morph's own spring. A constant turn is the old circular indicator, which the
loading indicator exists to replace. The rotation now lurches with the form and
drifts underneath. The morph's easing moved from `standard` to `emphasized` for
the same reason, and its period from three times the slow loop to two, which is
640 ms a shape against M3's 650.

Named for the next hour: the indeterminate bar's travel is one eased keyframe
sequence, and M3 runs two overlapping bars on separate curves. Not made: one bar
that swells reads as a wait already, and the second bar is two more elements and
a second timeline for a difference no capture showed.

## 3. Responsiveness

The family answers its own inline size without a query of any kind, which is
why it declares no container: the bar is a grid whose first row is
`1fr auto` and whose second spans both columns, so a label that needs two
lines takes two lines and the number never wraps. Read at 240, 420 and 720.

At 240 the four-word Portuguese label wraps to two lines and the bar stays the
width of the column; the container digest breaks at the character across three
lines and the value column keeps its own width. Nothing overflows at any
width, in any scheme.

`min-inline-size: 0` on the root is what stops the family from widening a grid
or flex parent to its longest word — the correction `status-indicator`
recorded after a digest pushed a 220-pixel column out to 420.

**The one change:** the circular recipe puts its label and number beside the
ring on one line, and in a 240-pixel column a long label wraps beside a ring
rather than under it. Not made: the flex row wraps correctly and the ring keeps
its own box; a breakpoint that stacked them would be a second layout for the
same three elements.

## 4. Refinement

Read at full size, in `light`, `dark` and `high-contrast`, at three widths,
at `dense`, and in `rtl`; the states read against each other in the same
scenes.

- Alignment: the label and the value share a baseline; the ring, its label and
  its number share a centre; the loader's shape and its label share a centre.
- Rhythm: the words sit one `--slotted-space-3` above the bar, `space-4` at
  `lg`. This was the detail named and changed: four pixels was tight under an
  eight-pixel bar, and the two captures are the before and after.
- The gap and the stop indicator are one thickness each, so the M3 language
  scales instead of being copied at one size.
- At four per cent the indicator is a rounded stub and the stop dot is what
  makes it read as four per cent of something. At a hundred both go, so a
  finished bar is one bar rather than a bar with a notch.
- At nought per cent the ring is a closed ring: both the round cap's dot and
  the arc gap collapse, each by a clamp rather than by an attribute.
- The contained loader's shape is rounded to an even number of pixels, so the
  remainder a grid splits in half is two whole pixels rather than one and a
  half. This was the second detail the reviewer named: at `md` the shape sat
  off its own centre and at `lg` it did not, because 79 per cent of 34 is 26.86
  and of 38 is 30.02. Photographed at all three steps with the morph frozen to
  a circle, which is the only frame in which the eye can judge a centre.
- Density changes the type and the ring's diameter and leaves the bar's
  thickness alone, which is correct: thickness is graphic weight, not control
  geometry.
- The mirrored layout is the same component and not a rearranged one.
- No state changes geometry: `data-complete` removes two pseudo-elements and
  moves nothing.
- There is no focus ring, and that is the one place the family differs from
  `status-indicator` on purpose. That family paints one because its root is
  routinely a link in a table row; a progress indicator is never the thing a
  reader clicks, and a `progressbar` on an anchor is broken rather than
  unstyled.

**The two changes, named and made:** the row gap above the bar, and the
contained shape's centring. Named for the
next hour: the value part is muted while the label is full ink, which is right
in a row of bars and slightly quiet beside a finished green one. Left as it is
— the number annotates the bar rather than naming it, and Carbon and Fluent
both keep helper text neutral.

## 5. Tokens

`packages/styles/src/progress-indicator/progress-indicator.tokens.json` lists
forty custom properties and is generated from the stylesheet, so
`tokens.test.mjs` holds them equal.

Every component token falls back to a foundation token, never to a literal
outside the documented exemptions and never to a system colour:
`fallbacks.test.mjs` passes. The internal `--_` variables are where the
composition happens, and they are the only place a system colour appears as a
last resort.

Two departures, both recorded in the stylesheet with the measurement behind
them: the indicator is the tone's `text` role rather than its `solid` one, and
the track is a computed mix rather than the tone's `surface` role. Both exist
because the `high-contrast` scheme paints every tone `surface` the page's own
white and `secondary-solid` likewise. The family invents no scale: thickness is
the space scale, diameter the control height scale, type the control type
scale, radius the radius scale, stacking the z-index scale, and the component
layer of the token contract is untouched.

**The one change:** a `--slotted-progress-indicator-*` size scale in the
component layer, so a consumer could retune all three steps at once. Not made,
and it would fail the bar `avatar` cleared: it would restate a scale that
already exists.

## 6. Patterns

There is no WAI-ARIA Authoring Practices pattern for a progress indicator. The
index at <https://www.w3.org/WAI/ARIA/apg/patterns/> was read on 3 September
2026: it lists Accordion through Window Splitter and contains no entry, and
`patterns/progress` does not occur on the page. The Meter pattern rules itself
out in writing — "The meter should not be used to indicate progress… To
communicate progress, use the `progressbar` role instead" — so the sourced
pattern is the ARIA 1.3 role itself. The itemized comparison, requirement by
requirement, is in
`docs/history/designs/2026-09-03-progress-indicator-family-design.md` under
**Accessibility**; every row passes, and the one deliberate departure — a `div`
rather than the native `progress` element — carries the cost that the role and
every range attribute are written by hand, which is the decision the family
this one replaces recorded and the reason it holds: a native progress bar can
only be painted through engine-specific pseudo-elements outside the CSS
specification.

Keyboard: there is none, and the role says why — "It is not possible for the
user to alter the value of a `progressbar` because it is always read-only". The
family takes no focus, declares no mutable capability and ships no state model.

Composition over configuration: three components rather than one with a shape
prop, five parts a consumer can style by `data-part`, `render` in React and a
bare attribute selector in Angular, and one provider per binding.

**The one change:** nothing outstanding. The comparison is complete and the
single departure is priced.

## 7. Accessibility

- Name: required, three ways to give one, and a development warning naming the
  component when there are none. Exercised in both bindings' tests.
- Role and range: `role="progressbar"`, `aria-valuemin` and `aria-valuemax`
  always written for a measured indicator, `aria-valuenow` absent exactly while
  indeterminate, `aria-valuetext` whenever there is text. Both bindings assert
  each of these.
- The clamped value is what the paint and `aria-valuenow` both read, from one
  call to `progressGeometry`.
- Children presentational: verified in the spec rather than recalled, and it is
  the fact that removed `live` from this family. Written on both pages.
- The region: `aria-busy` and `aria-describedby` are the consumer's to write,
  and the accessibility scene writes them.
- Forced colours: the track takes a `ButtonBorder` edge on a real element
  rather than a pseudo-element — a decorative rule may not name a system colour
  at all — the indicator takes `Highlight` — the wavy path along with the ring — and
  the loader keeps its silhouette.
- Reduced motion: every loop stops, and the rest positions were photographed.
- Target size: nothing is a target. The family has no hit area, which is why
  `--slotted-target-min` does not appear.
- Colour alone: the tone never carries the meaning by itself — the label and
  the number say it, and `data-complete` is available to CSS.

**The one change:** a real screen-reader pass on `aria-valuetext` while a value
climbs, to hear how much a determinate bar actually says on its own. Not made:
this machine has none, and it is named at the gate as the thing that remains
to be heard.

## 8. Native API

React: function components; `useId` for the label id; `ComponentPropsWithRef<'div'>`
extended for all three; `render` on each; `ref` to the root; the timing
machine's first answer computed during render rather than in an effect, which
is the hydration finding `skeleton` recorded; `exactOptionalPropertyTypes`
respected — the defaults interface admits `undefined` and the props do not.

Angular: standalone components; `input()` and `output()` throughout, with no
`model()` because nothing here is two-way; `computed` for every derived value;
host bindings in `host` metadata; `exportAs` on each; `inject()` rather than
constructor parameters; `HostAttributeToken` for the three ARIA attributes a
consumer may have written on their own element; one `setTimeout` cleared in
`DestroyRef.onDestroy`; `@Directive()` on the abstract base, which is what
makes the shared inputs inheritable at all.

The asymmetry is recorded rather than levelled: React substitutes an element
through `render`, and Angular needs no equivalent because every member is a
directive on the element the consumer wrote. Angular's loader projects content;
React's takes children through the same `label` prop and nothing else, because
a React consumer composes around the component instead.

**The one change:** an Angular `ControlValueAccessor`. Not made, and it would
be wrong: a progress indicator has no value a form submits, no validity and no
user input, and it would put a nameless entry in every form group.

## 9. Capability

Measured against the step 3 inventory in the design document, not against the
scope paragraph. Every table-stakes row is `adopt`, `adapt`, `decline` naming
the family that owns it instead, or `defer` naming the family and the wave.

Shipped: a determinate value with a range, indeterminate by absence, three
recipes, a rendered label, a hidden label, rendered value text, a consumer's
own format and locale, three sizes, five tones, a buffer, a page placement, a
delay, a minimum duration, a withdrawal event, a decorative mode, an
application-wide provider per binding, `render`, the M3 wave and the M3
container.

Declined with a family named: segments and steps (`inline`, `stepper`), a
gauge (`gauge`, wave 13), a status icon and message (`inline-message`), a
spoken announcement (`inline-message`, on the spec fact above), multi-colour
indeterminate (an arbitrary colour is refused by `docs/product/prd.md` §2.4), and a
reversed indeterminate direction (`dir`, not a prop).

No mutable capability, and the absence is asserted rather than implied: the
contract test walks the capability list against `MUTABLE_CAPABILITIES`, because
the next reader's first question is why a family with a number has no state
model.

**The one change:** an imperative `start()` / `done()` façade, which is the
NProgress shape a router integration reaches for. Not made: it is `loading`
and `value` spelled twice, and the reference page shows the two-line
composition instead.

## 10. Ecosystem integration

Both integration tables in `references/frameworks.md` are answered line by
line in the design document, with the file that answers each. The four that
matter most here:

- Defaults once: `ProgressIndicatorDefaultsProvider` and
  `provideProgressIndicatorDefaults`, tested on both sides for the appearance,
  the timing and the language.
- The consumer's handler: the family handles no DOM event, so there is nothing
  to compose with; `onWithdraw` / `(withdraw)` is its own output and replaces
  nothing.
- Every state a consumer may style is in the DOM: `data-indeterminate`,
  `data-complete`, `data-buffered`, `data-wave`, `data-contained`,
  `data-placement`, `data-shape`, `data-size`, `data-tone`, and the percentage
  as a registered custom property.
- Zoneless and `OnPush`: signals throughout, one `effect` with `untracked` for
  the timing, no `markForCheck`.

**The one change:** Button reading this family for its own loading ring, which
is the follow-on the rebuild order named. Not made here, and the reason is
written in `docs/history/build-log.md`: all three of Button's packages are being
edited by a concurrent session in this worktree. The geometry was built so the
swap is two declarations.

## 11. Documentation

Both pages carry the import, the anatomy with all five parts, fourteen
captioned demonstrations with the source that produced each, an API table with
every declared default, the one output, the composition surface including the
two ARIA attributes the consumer writes, seven accessibility decisions, the
public tokens and the anatomy as it reaches the DOM.
`specs/reference-pages.test.mjs`, `referencePageErrors`, `apiMetadataErrors`,
`scenarioCoverageErrors` and the snippet formatter all pass on both.

Every demonstration is laid out with the workbench primitives, and the one
ground they did not have — a box a fixed-position bar can be pinned inside —
was added to the workbench with a test before the stories were written.

**The one change, and it is the gap:** neither page was read rendered. Both
Storybook ports were unanswered for the whole of this work, the skill forbids
starting a server for validation, and a new family needs both restarted
anyway. Named at the gate as the one thing a reviewer has to do that this
session could not.

## Section 18 — definition of done

1. **Purpose, use and anti-use.** A quantity a task has covered, or a wait with
   no number. Anti-use: content with a known structure, which is `skeleton`; a
   level rather than a task, which is `gauge`; and a spinner where a shape does
   better, which is the loader.
2. **Anatomy.** `root`, `label`, `value`, `track`, `indicator`, declared in the
   contract and tabled on both pages.
3. **Controlled and uncontrolled.** Neither, and the reason is the contract: a
   progress indicator never moves its own value. The one thing the family
   decides for itself is whether it is painted, which the consumer owns through
   `loading` and hears about through `onWithdraw`.
4. **State matrix.** `default`, `indeterminate` (no value; `aria-valuenow`
   absent; whole track; travelling bar or breathing arc), `complete` (value at
   maximum; gap and stop indicator removed; ring closed). No interactive
   states, because the family is not a control.
5. **Keyboard, focus, ARIA, touch, screen reader.** No keyboard and no focus by
   the role's own definition. ARIA documented and tested. Touch: nothing is a
   target. Screen reader: named at the gate as unverified on this machine.
6. **Recipes by size, density, variant and tone, via tokens.** Three sizes,
   three densities, five tones, two appearances (`wave`, `contained`) and one
   placement, all through tokens the theme owns.
7. **Responsive, RTL, locale, reduced motion.** All four, and all four
   photographed.
8. **Loading, empty, error, disabled, extreme content.** Loading is the family.
   Empty is nought per cent, which is drawn as a closed ring rather than a dot.
   Error is `tone="danger"` beside an `inline-message`. Disabled does not exist
   and the contract says so. Extreme content: a four-word label, an unbreakable
   digest, and Arabic digits, at 240 pixels.
9. **SSR, performance, virtualization.** `useId` in React and a per-document
   counter in Angular, so a hydrated id matches. One `Intl.NumberFormat` per
   locale and option set, cached, because a dashboard renders a column of bars
   that each re-render on every tick. No virtualization: there is no collection.
10. **Examples, composition, edge cases, theming, in context.** Fourteen scenes
    per page, including an upload row, a defaults provider, a page-level bar and
    the region wiring.
11. **Behavioural tests shared between bindings.** The same eleven behaviours
    are asserted in `progress-indicator.test.tsx` and
    `progress-indicator.spec.ts`, and the rules they share live in
    `@slotted/core/progress` and `@slotted/core/loading` with seventeen tests of
    their own.
12. **Changelog, stability, migration.** `docs/history/build-log.md` carries the entry;
    the design document carries the six moves a consumer of `spinner`,
    `progress-bar` or `loading-bar` makes.
