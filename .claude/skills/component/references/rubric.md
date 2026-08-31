# Component craft rubric

Assess every dimension in writing before the human gate. A checker pass is evidence for mechanical rules, not a substitute for looking at the component or reading its APIs.

## 1. Icons

**Meaning:** Every component-owned icon is real geometry from a glyph token, never a character or emoji. The component supplies intrinsic icons instead of asking the consumer to supply its own semantics.

**Verify:** Run `node tools/harness/check.mjs <family>`, inspect each icon in light and dark captures, and inspect the family's `forced-colors` rule. Confirm directional artwork behaves deliberately in right-to-left documents.

**Fails when:** `content` draws `/`, `*`, or another character; an expected glyph is absent; a mask disappears in forced colors; direction-sensitive geometry points the wrong way.

## 2. Motion

**Meaning:** State changes that benefit from continuity use duration and easing tokens. Reduced motion is inherited from the theme, while infinite animation stops explicitly.

**Verify:** Run the checker, exercise every animated state in a real browser, and emulate `prefers-reduced-motion: reduce` for looping motion.

**Fails when:** A useful transition snaps without reason; a duration or easing is handwritten; an animation loops under reduced motion; decorative motion blocks interaction.

## 3. Responsiveness

**Meaning:** The component answers its own inline size rather than the viewport. A reflowing family declares `container-type: inline-size`, owns a `container-name`, and uses literal breakpoints because CSS forbids custom properties in container conditions.

**Verify:** Read captures at 240, 420, and 720 pixels. Resize the harness stage around each breakpoint and inspect long, translated, and stateful content.

**Fails when:** Content overflows or wraps accidentally at 240 pixels; a viewport query controls component layout; `@container` exists without a family-owned container; the transition around a breakpoint is unstable.

## 4. Refinement

**Meaning:** Alignment, spacing rhythm, type, and optical balance form a deliberate whole rather than a collection of valid declarations.

**Verify:** Read every capture at full size in both schemes. Compare related edges, baselines, gaps, hit areas, focus rings, glyph weight, and text centring. Inspect interactive states in the live harness.

**Fails when:** An edge sits on a half-pixel without intent; a gap breaks the foundation rhythm; text is optically off-centre; focus changes layout; the component looks unfinished despite passing automated checks.

## 5. Tokens

**Meaning:** Every visual decision that a theme may retune is a correctly scoped, honestly named token. Family tokens reach foundation tokens instead of encoding a second scale.

**Verify:** Run the checker, read `docs/token-foundation.md`, inspect `packages/styles/src/<family>/<family>.tokens.json`, and trace each fallback to the appropriate foundation layer.

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
