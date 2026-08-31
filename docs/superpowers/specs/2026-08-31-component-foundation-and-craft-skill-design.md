# Component Foundation and Craft Skill Design

## Outcome

Two things, in order. A design foundation that makes a component beautiful by
default and retunable by a theme, and a manually invoked skill that builds or
refines one component against it — including a step where the component is
rendered, looked at, and corrected.

The second cannot work without the first. A skill that says "refine the
spacing" against a library with no spacing scale asks each execution to invent
one, which is the failure being corrected.

## The Diagnosis

The library shipped thirty component families through a rigorous process —
contract first, tests first, both frameworks, both Storybooks, a green gate on
every commit — and produced components that are visually poor. The process was
not skipped. It was measuring the wrong things.

What the foundation actually contains, measured rather than recalled:

| Layer | Reality |
| --- | --- |
| Colour | Mature. Five tones by nine roles, validated against a contract |
| Everything else | Ten generic control tokens. Fourteen of the twenty-four `base` keys are Button's alone |

There is no scale for space, type, radius, motion, elevation, or stacking. The
consequence is visible in the stylesheets: every family invented its own
literals as fallbacks — `0.625rem`, `0.8125rem`, `0.375rem` — so nothing shares
a rhythm and a theme can retune colour and nothing else.

Three specific defects follow from it, and each maps to a rule below:

- `breadcrumb.css` draws its separator as the character `/`, and `field.css`
  draws its required marker as `*`. Both contradict
  `2026-08-29-icon-foundation-button-integration-design.md`, which the families
  built after it did not follow because it answers only the consumer-supplied
  case.
- No stylesheet in the repository contains a `@container` query. There is no
  component-level responsiveness of any kind.
- Six families of roughly thirty handle `prefers-reduced-motion`, each with its
  own block.

## Part 1 — The Foundation

### The rule that governs every name

No existing token is renamed or removed. Tokens that carry a literal today are
redefined in terms of a scale step: `--slotted-control-radius` keeps its name,
keeps working, and becomes `var(--slotted-radius-sm)`. Consumers see no change;
the scale becomes the single source.

The density layer already has the right shape and the wrong scope. It holds
`--slotted-button-height-{sm,md,lg}` and its padding, font-size and icon-size
companions. Those are generalised to `--slotted-control-*`, and the Button
tokens become aliases of them. That generalisation — not a new parallel scale —
is what makes a Button and an Input the same height beside each other.

### Naming philosophy

Three forms, chosen by the nature of what is named:

| Nature | Form | Reason |
| --- | --- | --- |
| A continuum | numeric | Space has no "medium", only a position on a ruler, and step thirteen must not become `md-plus` |
| A named set of variants | `sm`/`md`/`lg` | What the repository already uses, and what a component actually exposes |
| An intention | the intention's word | Easing genuinely encodes one: what enters decelerates, what leaves accelerates |

### The scales

| Group | Tokens | Layer |
| --- | --- | --- |
| Space | `--slotted-space-1` … `-12` | base |
| Type | `--slotted-font-size-{xs,sm,md,lg,xl}` paired with `--slotted-line-height-{xs…xl}` | base |
| Weight | `--slotted-font-weight-{regular,medium,semibold}` | base |
| Radius | `--slotted-radius-{xs,sm,md,lg,full}` | base |
| Duration | `--slotted-duration-{instant,short,medium,long}` | base |
| Easing | `--slotted-easing-{standard,enter,exit,emphasized}` | base |
| Shadow | `--slotted-shadow-{xs,sm,md,lg}` | scheme |
| Stacking | `--slotted-z-index-{sticky,overlay,popover,toast}` | base |
| Control geometry | `--slotted-control-{height,padding-inline,font-size,icon-size,gap}-{sm,md,lg}` | density |
| Glyph | `--slotted-icon-{check,minus,dot,x,chevron-right,chevron-down}` | base |

The space scale widens as it climbs, so that the small steps stay adjustable
and the large ones stay few. Written in `rem`, its twelve steps correspond to
`2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64` pixels at the browser default —
`0.125rem` through `4rem`. The progression is part of this design even though
the exact values belong to the implementation plan, because a linear scale
produces twelve indistinguishable gaps and a purely geometric one produces no
usable small step.

Type sizes take the variant form rather than the numeric one because they pair
with control sizes. `--slotted-font-size-md` is the size a control at `md`
uses, and that pairing is what produces vertical alignment.

`--slotted-font-size-md` and `--slotted-control-font-size-md` are both present
and are not duplicates. The first is the type scale, fixed, and answers text
the library does not size by density — a Field's label and description. The
second lives in the density layer and is what `compact` shrinks. A control
reaches for the second; everything else reaches for the first.

Shadow sits in `scheme` because a shadow that reads on a light ground does not
read on a dark one.

Stacking is `--slotted-z-index-*` and not `--slotted-layer-*`, which would
collide with the `@layer slotted.components` the stylesheets already use.

The tokens are named `height` rather than `block-size`. The existing token is
`--slotted-button-height-md`, the CSS consuming it stays in logical properties,
and renaming would be a breaking change for no gain.

No `--slotted-icon-size-*` is added. An icon inside a control takes
`--slotted-control-icon-size-*`; a standalone icon takes `1em`.

### Reduced motion is resolved once, not per family

The theme redefines every duration token inside a single
`@media (prefers-reduced-motion: reduce)` block. Every family that reaches for
a duration token honours the preference without writing a line, which replaces
six hand-written blocks and covers the twenty-four families that have none.

One case is not covered by collapsing durations and stays explicit: an
animation that loops forever must stop, not merely run fast. Spinner and
Skeleton keep their own rule, and a test requires one wherever `infinite`
appears.

### Intrinsic icons

An icon the component owns — the Breadcrumb separator, the Checkbox check, the
Select chevron — is drawn with `mask-image` from a `data:` URI holding Lucide
geometry, inside the single authored stylesheet.

The existing icon design covers only icons the consumer supplies, which is
correct for a Button's leading glyph and wrong for a checkmark: asking a
consumer to supply the check is like asking them to supply the border.

Living in CSS is what makes it work. Both frameworks receive the same glyph
with no duplicated markup, the colour comes from `currentColor`, and a theme
substitutes the glyph by pointing the token at another mask. The mechanism was
verified in headless Chrome before being specified: a check renders crisp and
white inside a filled box, and a chevron replaces the Breadcrumb's `/` at the
right size and weight.

Glyph tokens are named for the drawing, not the use, because one chevron serves
Breadcrumb, Select and Accordion. The artwork's direction is physical because
the artwork genuinely points one way; choosing between `chevron-right` and
`chevron-left` for a right-to-left document is the family's decision, in the
family's stylesheet.

`forced-colors` needs its own answer, since a masked element paints nothing
there. Each family that uses a mask carries a `forced-colors` rule, the way
several already do for borders.

### The constraint that shapes responsiveness

A container breakpoint cannot be a token. `@container (min-width: var(--x))` is
invalid CSS. The convention is therefore: a family that reflows declares
`container-type: inline-size` and a `container-name` of its own, and writes its
breakpoints literally, documented in the rubric. It is the only scale that is
not a token, and by the language's imposition rather than by choice.

### Density

`comfortable` and `compact` exist and currently modulate Button alone. Once the
control geometry is generalised they modulate every control.

Control geometry stays in `px`, as it is today. Space, type and radius are in
`rem`. The mismatch is inherited rather than introduced, and changing control
geometry to `rem` — which would let it scale with the reader's font-size
preference, an accessibility gain — is a visual change to every shipped
component and belongs to its own decision, not to this one.

### One inherited naming defect

`--slotted-button-icon-size` previously held `1em` in `base`, while
`--slotted-button-icon-size-{sm,md,lg}` in `density` holds pixel values. Task
6 removes the ambiguous base token; each matching Button size rule now uses
its density-scoped token with a direct `1em` fallback. The package is still
unpublished, so removing rather than renaming the ambiguous token costs no
consumer.

### The breaking change, stated plainly

The theme validator requires exact correspondence between contract and theme in
both directions. Adding required tokens breaks any third-party theme. The
package is `private: true` at version `0.0.0` with no consumer, so the cost is
zero now and a major version after 1.0.

## Part 2 — The Family Checker

Five rules, each one a defect the library actually shipped, in
`tools/harness/check.mjs`:

| Rule | What it refuses |
| --- | --- |
| Scales | A family token falling back to a literal. Exempt: `0`, `none`, `auto`, `100%`, `transparent`, `currentColor`, `inherit` |
| Glyphs | A character used as an icon — the `'/'` and the `'*'` this library shipped |
| Motion | A duration or easing written by hand |
| Looping motion | An `infinite` animation with no reduced-motion rule |
| Container | A `@container` query from a stylesheet declaring no container of its own |

It runs against one family, invoked by the skill at step 7 and again before the
human gate. It is deliberately not part of `pnpm check`: a permanent gate would
need a dispensation list naming all thirty unrefined families, and that list is
machinery for a problem the human gate already answers.

## Part 3 — The Skill

### Shape and invocation

```
.claude/skills/component/
  SKILL.md                  the process, short
  references/rubric.md      the rubric, versioned
  references/foundation.md  which scale answers which property
  references/harness.md     building and reading the harness
  references/frameworks.md  what "modern API" requires of each framework
  references/patterns.md    sourcing and verifying the APG pattern
```

Invoked manually: `/component checkbox`, or `/component checkbox radio-group`
for a tightly related pair, optionally followed by a list of features,
behaviours or ideas. The skill's description states that it runs only when
invoked, never by inference.

### Process

| # | Step | Note |
| --- | --- | --- |
| 0 | Load the law | Rubric, foundation reference, BUILD-LOG conventions. Before reading any component code |
| 1 | Detect the mode | `specs/components/<family>/` exists → refine; otherwise → create |
| 2 | Weigh the request | Each supplied idea gets **adopt / adapt / decline** with a reason, judged against the PRD. Presented before any code is written |
| 3 | Source the pattern | The APG looked up, not recalled. In refine mode, also: list the current defects against the rubric |
| 4 | Design | A document only where an architectural question arises |
| 5 | Contract and its test | Test first |
| 6 | Stylesheet against the foundation | No literals |
| 7 | Visual loop | Render, capture, **look**, correct, repeat |
| 8 | Both frameworks | Each framework's modern idioms |
| 9 | Reference pages | — |
| 10 | Automatic gates | `pnpm check` and the five new tests |
| 11 | Self-assessment against the rubric | Written, across all eight dimensions, with anything below the bar fixed |
| 12 | Human gate | The harness path and a short report. Free-form evaluation. Iterate |
| 13 | Commit and leave the list | Only after approval |

Step 7 is what separates this from the process that produced the current
components. Without it the remainder is the checklist that already passed while
the components were poor.

### The harness

`packages/styles/src/<family>/<family>.harness.html` holds a small markup
fragment beside the stylesheet it exercises, because it is literally a fixture
for it. `tools/harness/` assembles the full page: every state, both schemes
side by side, and width rulers that make a container query observable.
Screenshots are taken with headless Chrome, verified available on this machine,
and written to the scratchpad rather than the repository.

The framework-free harness is faithful because of a property the library
already has: one authored stylesheet serves both frameworks, so plain HTML
carrying the theme and the family's CSS previews both. It renders in
milliseconds, where a Storybook build takes tens of seconds — and refinement
needs many iterations, not two.

The fragment is a third place the DOM is written, after React and Angular, and
that drifts. The mitigation is a test requiring every `data-part` in the
contract to appear in the fragment and every declared state to be exercised. It
does not eliminate drift; it makes the likely drift detectable.

### The rubric

Eight dimensions, each with its meaning, its verification, and what fails it:

| # | Dimension | Verification |
| --- | --- | --- |
| 1 | Icons | `glyphs` test, and the eye on the capture |
| 2 | Motion | `motion` test, and captures across the transition |
| 3 | Responsiveness | Captures at three container widths |
| 4 | Refinement | The eye: alignment, rhythm, optical balance |
| 5 | Tokens | `scales` test, and reading the names |
| 6 | Patterns | The APG checked item by item |
| 7 | Accessibility | Name, role, state, keyboard, focus, `forced-colors` |
| 8 | Native API | Read against `references/frameworks.md` |

Half is mechanical and runs unattended. Dimensions 4, 6, 7 and 8 require
judgement, which is why step 11 writes the self-assessment down: it gives the
human something specific to disagree with at step 12.

### The human gate

The rubric is versioned so the criterion survives between sessions and the
skill can assess itself before asking. The human's evaluation is free-form,
against the harness page in a real browser, where hover, focus, keyboard and
resizing behave. Nothing is committed until that approval.

## Sequencing

Two implementation plans, strictly ordered:

1. The foundation: contract, theme, the redefinition of existing tokens as
   scale steps, and the generalisation of the density layer.
2. The skill and its tools, proven by refining one family end to end.

An earlier version of this design placed enforcement between them: five tests
wired into the repository gate, and an `unrefined.json` holding every published
family so the gate could stay green while thirty of them were non-compliant.
That was dropped after the foundation landed, and the reason is worth keeping.
A permanent gate needs the dispensation list, the list is machinery, and the
machinery answers a question the skill's human gate already answers better. The
five rules survive as `tools/harness/check.mjs`, which the skill runs against
the one family in hand — where there is nothing to dispense, because that family
is compliant by the time the skill finishes.

The family proving the skill should be Breadcrumb: it is small, and it carries
the character-glyph defect, so a successful run is visible rather than
argued.

## Out of Scope

Refining the thirty published families is not this design. It is what the skill
exists to do, one family at a time, each with its own human gate.

Moving control geometry from `px` to `rem` is deferred, with its reason
recorded above.

A published Slotted icon package remains deferred, as the existing icon design
already concluded. Masks in the stylesheet are not a step towards one; they are
component-owned drawings that never become a consumer-facing catalogue.
