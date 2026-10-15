# Slider and Form self-assessment

Against `.claude/skills/component/references/rubric.md`. Each dimension names
the one change that would most improve it and says whether it was made.

## 1. Icons

Neither family owns an icon, and neither draws a character as one. The slider's
marks are geometry — a one-pixel tick beside the rail — and the summary's
messages are words. No glyph token is read by either stylesheet, which
`packages/styles/src/slider/slider.tokens.json` and its form counterpart show.

**One change:** a chevron on each end of a slider's scale, the way Kendo draws
one. Not made: an affordance that repeats what the rail already says, and two
more targets under the WCAG minimum.

## 2. Motion

Three transitions, each carrying information a reader's eye follows: the thumb's
fill under hover, its `scale` under press and drag, and the bubble's opacity as
it appears. All three read `--slotted-control-transition-duration`, so all three
collapse under `prefers-reduced-motion`. The value's own movement is not
animated — a thumb that lagged the pointer is a control that feels broken — and
nothing loops.

**One change:** the bubble now appears with no movement at all, which reads as
a flicker at 120ms. Not made: a translate would move under a reader who asked
for stillness, and the reservation that stops the layout shifting is what made
the opacity-only transition possible.

## 3. Responsiveness

The slider is fluid: the rail shrinks, the thumb, the type and the target do
not, and every capture from 240 to 720 pixels holds. The form's action row is
the reflowing part, and it reflows from its own container rather than the
viewport — `@container slotted-form (max-width: 360px)` turns the row into a
column of full-width actions with the primary one first, which the 240-pixel
capture shows.

**One change made:** a container query on the slider was written and taken out
again. A label of one long word cannot wrap at any cap, so it only ever moved
multi-word labels, and the family is honestly fluid rather than reflowing. The
stylesheet records the removal and `slider.styles.test.mjs` holds it.

## 4. Refinement

Twenty-one harness captures read at full size across both families: light, dark
and high-contrast at 420; light at 240; dense at 420; RTL at 420; single scenes
for `marks`, `orientation`, `states`, `summary`, `actions` and `composition`;
and two focus captures. Six defects were found by looking and corrected:

1. a mark's label drawn under the thumb, which the vertical capture showed as a
   "50" with a thumb through it;
2. `Máximo` clipped by the edge of its cell, because the label at the end of the
   scale was centred on its own tick;
3. a read-only slider that painted nothing at all and was identical to the one
   above it;
4. a rail whose fill was nearly its own colour in the `high-contrast` scheme,
   fixed by drawing the rail as a channel with an edge rather than as a line;
5. the bubble landing on the read-out, fixed by reserving its room whether or
   not it is showing;
6. the reserved room stacking on the root's gap, which put the read-out a
   finger's width above its own rail.

Two more were found in the rendered reference pages rather than in the harness,
and both were the same defect in two families: neither root claimed a width, so
in a shrink-to-fit stage the slider collapsed to three bare thumbs with no rail
and the form printed every label one character per line.

**One change made:** the last of those six — the gap between the read-out and
the rail. What would come next is the empty channel's interior, which is a
1.03:1 difference against a white page and does no work; the edge carries the
ratio and the interior is what a fill is seen inside, so it stays.

## 5. Tokens

Every value either reads a foundation token or is arithmetic over two of them.
The thumb is the control glyph plus a space step, the rail is a space step, the
band is floored at `--slotted-target-min`, the bubble's reserved room is its own
type times its own line height. No component-layer token was added: the family
may not restate a scale that exists, and neither of these met the bar Avatar
cleared. Two `literals` entries in the slider's contract record why the rail's
weight does not vary by size and why the thumb's is arithmetic; the form's one
entry records why its breakpoint is a literal.

**One change:** `--slotted-slider-length`, the vertical slider's own length, is
`calc(var(--_thumb-size) * 10)` and could be a scale. Not made: one family
wanting a length is not a scale, which is the same bar the component layer sets.

## 6. Patterns

Sourced, transcribed and checked item by item. The slider is the APG's Slider
Pattern and Slider (Multi-Thumb) Pattern, read at
<https://www.w3.org/WAI/ARIA/apg/patterns/slider/> and `.../slider-multithumb/`
on 3 September 2026. Every key in the pattern's table is in
`specs/components/slider/contract.json` and asserted key by key; the optional
Page Up and Page Down are bound; the multi-thumb pattern's two requirements —
that a dependent slider's announced range follow its neighbour, and that the tab
order not change with the values — are `boundsFollowNeighbour` and `tabOrder`,
both tested in both bindings. The role and the value set come from the platform,
so nothing can drift from the element.

The form has no APG pattern. The contract records `apgPattern: null` and names
the three sources that decide what it does instead: WCAG 2.2 SC 3.3.1, the
GOV.UK error summary, and the HTML `form` element. The summary answers the four
things GOV.UK states a summary must do, one test per thing.

**Deliberate departures, with their cost:**

- The slider binds the whole keyboard rather than leaving the arrows to the
  element. Cost: `preventDefault()` on eight keys, and a table that has to be
  kept honest by tests rather than by the browser. Reason: Chrome moves Page Up
  by a tenth of the range and Firefox by one step.
- `readonly` is `aria-readonly` and a refusal, not the native attribute.
  `input[type=range]` is not in the list of types `readonly` applies to. Cost: a
  consumer reading the DOM sees no `readonly` attribute.
- Angular has no `[(value)]`. Cost: a two-way binding a reader might expect.
  Reason: a request carrying a reason and a `cancel()` does not fit one slot,
  and it is the decision `number-field` already recorded.

## 7. Accessibility

Name, role, state, keyboard, focus, forced colours and target are complete for
every supported state, and eight sentences on each reference page name a
decision rather than a virtue. The slider's role, `aria-valuenow`,
`aria-valuemin` and `aria-valuemax` are the element's; `aria-valuetext` carries
the formatted string, and a mark's label replaces it at that value. The band is
floored at 24 CSS pixels. Forced colours get one block per family, because the
theme cannot repaint three backgrounds into three different things.

**One change made:** the bubble is `aria-hidden`, so the value is announced once
rather than twice.

**Not verified here:** a real screen reader and a physical touch device.

## 8. Native API

React is React and Angular is Angular. React ships `render`, a `handle`, props
typed as `ComponentPropsWithRef<'input'>` less the six it redeclares, and
context providers. Angular ships `input()`, `output()`, `computed`, host
metadata, `exportAs`, `HostAttributeToken` for every static attribute a consumer
may have written, `ViewEncapsulation.None` over the one authored stylesheet, and
`ControlValueAccessor`. Neither imitates the other, and every native prop
reaches the element that owns it.

**One change:** React's `Form` has no `render`. Not made, and documented as a
decision rather than an omission: a submit event has nowhere else to come from,
`FormData` reads a `form`, and `requestSubmit()` and `reset()` are the element's
own.

## 9. Capability

Measured against the step 3 inventory in
`docs/history/designs/2026-09-03-slider-and-form-capability-inventory.md`.
Every table-stakes row is `adopt`, `adapt`, `defer` or a `decline` that names
what answers it instead. Both families declare a state model with a controlled
and uncontrolled pair, a request carrying a reason, and every state in the
matrix. The slider ships twenty-one inputs, ten parts, a twelve-key table and
two orientations; the form ships twelve inputs, six parts, four validation
policies, four imperative actions and two Angular integrations.

**One change made:** `validity` was added to `KNOWN_CAPABILITIES` and
`MUTABLE_CAPABILITIES` rather than calling the form's error map a `value`. The
briefing's rule is that a shared tool which cannot express the right contract is
a defect in that tool, fixed first.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`docs/history/designs/2026-09-03-slider-and-form-design.md`. The asymmetry is
recorded rather than levelled down: Angular has two form systems in version 22
and React has none, so `SlForm` reads Reactive Forms through `ControlContainer`
and a message registry, and the React binding gets `FormData`, a context and two
hooks instead. Signal Forms binds a `ControlValueAccessor`, which every Slotted
control provides, so `[field]` works today and the family adds no second
integration — a fact checked against `node_modules/@angular/forms/types/`
rather than recalled.

**One change:** a `Validator` on `SlSlider`, so a range could report its own
`min`/`max` failures to a form. Not made: the element already refuses a value
outside the scale, so the validator would have nothing to report.

## 11. Documentation

Four reference pages, each with the import, ten anatomy rows for the slider and
six for the form, one captioned demonstration per declared scenario with the
code that produced it, every input, every output, the composition surface, at
least six accessibility sentences and the two closing snippets.
`specs/reference-pages.test.mjs` and `referencePageErrors` pass for all four.

**One change made:** the pages were read rendered rather than as source, and
that is what found the two collapse defects. The React pages were read at 1280
pixels in light; the Angular pages could not be read, because the Angular
Storybook resolves its entry-point aliases once at startup and answers
`SyntaxError: Unexpected token 'export'` for a family added since. That is the
restart the briefing names, and it is raised at the gate.
