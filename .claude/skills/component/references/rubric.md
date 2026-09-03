# Component craft rubric

Assess every dimension in writing before the human gate. Dimensions 1 through 8 judge the quality of what exists; 9 and 10 judge whether enough exists, and they are the two a minimal component fails; 11 judges whether a consumer can find any of it. This rubric directs attention; it is not an exhaustive rule set. Do not turn it into regex enforcement or assume every valid decision can be enumerated ahead of time. Use behavioural evidence, rendered output, source reading, and component context.

## 1. Icons

**Meaning:** Every component-owned icon is real geometry from a glyph token, never a character or emoji. The component supplies intrinsic icons instead of asking the consumer to supply its own semantics.

**Verify:** Inspect each icon in light and dark captures, read how its geometry is produced, and inspect the family's `forced-colors` rule. Confirm directional artwork behaves deliberately in right-to-left documents.

**Fails when:** `content` draws `/`, `*`, or another character; an expected glyph is absent; a mask disappears in forced colors; direction-sensitive geometry points the wrong way.

## 2. Motion

**Meaning:** The rule has two sides and only one of them has been enforced. A state change a person's eye has to follow — a panel opening, a control filling, a value moving — carries a transition from the motion scale. Motion that carries no information is refused. Reduced motion is inherited from the theme, while infinite animation stops explicitly.

**Verify:** Exercise every animated state in a real browser, read the timing choices in context, and emulate `prefers-reduced-motion: reduce` for looping motion. For every state pair the family can move between, say whether it transitions and why.

**Fails when:** A useful transition snaps without reason; a state change the eye must follow happens instantly because animating felt risky; a duration or easing is handwritten; an animation loops under reduced motion; decorative motion blocks interaction.

## 3. Responsiveness

**Meaning:** The component answers its own inline size rather than the viewport. A reflowing family declares `container-type: inline-size`, owns a `container-name`, and uses literal breakpoints because CSS forbids custom properties in container conditions.

**Verify:** Read captures at 240, 420, and 720 pixels. Resize the harness stage around each breakpoint and inspect long, translated, and stateful content.

**Fails when:** Content overflows or wraps accidentally at 240 pixels; a viewport query controls component layout; `@container` exists without a family-owned container; the transition around a breakpoint is unstable.

## 4. Refinement

**Meaning:** Alignment, spacing rhythm, type, and optical balance form a deliberate whole rather than a collection of valid declarations — at rest and in every state the component can be in.

**Verify:** Read every capture at full size in both schemes, including the state captures from step 8. Compare related edges, baselines, gaps, hit areas, glyph weight, and text centring. Then work the detail list: the focus ring's distance from the border and whether it survives on a tinted surface; whether hover is legible at a glance without shouting; whether press gives feedback; whether disabled stays readable rather than merely faded; whether a state change shifts anything by a pixel; whether an icon sits on the same optical line as its label; whether the component holds at 200% browser zoom. Inspect interactive states in the live harness.

**Fails when:** An edge sits on a half-pixel without intent; a gap breaks the foundation rhythm; text is optically off-centre; focus changes layout; a state is styled but was never looked at; the component looks unfinished despite passing automated checks.

**Not finished when:** you cannot name the detail you would change with another hour. Name it, then change it.

## 5. Tokens

**Meaning:** Every visual decision that a theme may retune is a correctly scoped, honestly named token. Family tokens reach foundation tokens instead of encoding a second scale.

**Verify:** Read `docs/token-foundation.md`, inspect `packages/styles/src/<family>/<family>.tokens.json`, and trace each fallback to the appropriate foundation layer. Record any intentional literal or departure with its reason instead of assuming a source pattern is always defective.

**Fails when:** A family token falls back to a literal outside the documented exemptions; a token name hides its actual purpose; density, scheme, or base concerns live in the wrong layer; the stylesheet invents a parallel scale.

## 6. Patterns

**Meaning:** The implementation follows the applicable APG pattern item by item, prefers native platform semantics, and exposes composition instead of accumulating configuration.

**Verify:** Follow `patterns.md`. Record the source URL, keyboard table, roles, properties, states, labelling, and focus rules, then check each item against the contract and both frameworks.

**Fails when:** The report only says “checked against APG”; required keyboard behaviour or state is absent; ARIA duplicates or contradicts native semantics; a deliberate departure has no written cost.

## 7. Accessibility

**Meaning:** Name, role, state, keyboard, focus, forced colors, reduced motion, reading order, and target behaviour are complete for every supported state.

**Verify:** Exercise keyboard interaction and visible focus in the live harness. Inspect the accessibility tree where needed. Test forced colors and reduced motion. Confirm disabled, invalid, required, expanded, selected, or current state only when applicable.

**Fails when:** A control lacks an accessible name; role and state disagree; keyboard behaviour diverges from the sourced pattern; focus is hidden or trapped; color alone communicates state; forced-colors or reduced-motion behaviour is missing.

## 8. Native API

**Meaning:** Each framework uses its modern idioms and preserves capabilities the underlying element already gives consumers. Shared concepts do not require identical framework APIs.

**Verify:** Read both implementations against `frameworks.md`. Confirm native attributes, events, refs or instances, forms behaviour, and explicit consumer values reach the correct element.

**Fails when:** React imitates Angular or Angular imitates React; native props or events are swallowed; internal DOM becomes an undocumented API; derived state overrides an explicit consumer value; one framework loses a supported capability.

## 9. Capability

**Meaning:** The family holds what a team building a real product needs from it, and every absence is a decision someone can read. Measured against the inventory from step 3, not against the scope paragraph.

**Verify:** Put the inventory beside the shipped contract. Every table-stakes row is `adopt`, `adapt`, or a `decline` that names the family owning the capability instead or the composition that replaces it. Check that each mutable value has a controlled and uncontrolled pair, a request carrying a reason, and a row in the state matrix. Check the keyboard table against the sourced pattern, key by key, including the focus destination.

**Fails when:** A capability two surveyed implementations ship is absent with no written reason; a mutable value has no state model; the differentiators or gaps section is empty without the sentence saying why; the contract was narrowed to satisfy a shared test, schema, or workbench map; the family is a box with one attribute and the other eight dimensions score well.

## 10. Ecosystem integration

**Meaning:** Each binding reaches the real integration points of its ecosystem, not only its syntax. React idiom is not the same as React integration, and passing the idiom list while failing this one is how a family ends up usable in a demo and not in an application.

**Verify:** Read both integration tables in `frameworks.md` against the implementation. Every line answered, with the file that answers it or the sentence that says why the family does not need it. Confirm the Angular control belongs in a Reactive Form where a form is where it belongs, that an application can set family defaults once in both bindings, and that a consumer's own event handler still runs.

**Fails when:** A line is unanswered; the two bindings were levelled down to the smaller shape so they would look alike; a control that belongs in a form has no `ControlValueAccessor`; defaults can only be set per instance; the family's handler replaces the consumer's instead of composing with it; state a consumer must style is not in the DOM.

## Scoring

A dimension that merely passes is not finished. For each of the eleven, name the one change that would most improve it, then say whether it was made and why. A self-assessment with eleven passes and no named improvements has not been written; it has been asserted.

## 11. Documentation

**Meaning:** The family's two reference pages let a consumer build with it without reading its source. What to import, what it is made of, one captioned demonstration per declared scenario with the code that produced it, every input, every output, the composition surface, and the accessibility decisions.

**Verify:** Follow `stories.md`. Open both pages rendered — `iframe.html?viewMode=docs&id=components-<family>--reference` — at 1280 and 720 pixels, in light and in dark. Read them as a consumer who has never seen the family: try to write the first three lines of usage from the page alone. Check each demonstration against its snippet and each declared default against the API table.

**Fails when:** The page shows the component and never shows how it is written; a scenario the contract declares has no demonstration; a caption repeats the title; a demonstration sits in a mostly empty canvas; two examples touch because the story laid itself out; a table is clipped; an output is undocumented while the contract declares a state model; a story paints its own ground with an inline style.

**Not finished when:** you have read the story files instead of the rendered pages. The defects this dimension exists to catch — the empty canvas, the collision, the clipped table — are invisible in the source and obvious in the picture.
