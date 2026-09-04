/**
 * Custom properties a stylesheet reads and no theme writes.
 *
 * `docs/build-briefing.md` records the decision under _Decisions already
 * taken_: "A value a stylesheet needs and only script can measure is a custom
 * property under the name that says so." The overlay infrastructure writes
 * these from `packages/core` at runtime — where the anchor is, how much room is
 * left, where the arrow ended up, how deep in the layer stack a layer sits.
 *
 * They are not design tokens. They are absent from
 * `packages/tokens/src/contract.json`, they have no foundation fallback because
 * no foundation value could answer "where is the arrow", and a reference page
 * that printed them under "Theme-owned decisions" would be telling a consumer
 * to retune something no theme can reach.
 *
 * `tokens.test.mjs` subtracts them before comparing a stylesheet to its
 * `tokens.json`, which is the whole reason this list is shared rather than
 * inlined there: the next family that meets one should find the reason written.
 */
export const RUNTIME_PROPERTY_PREFIXES = [
  /** `packages/core/src/positioner` — the anchor's size, the space left, the transform origin, the arrow. */
  '--slotted-positioner-',
  /** `packages/core/src/dismissable-layer` — this layer's position in the single stack. */
  '--slotted-layer-depth',
];

/** Whether a custom property is written by script rather than by a theme. */
export function isRuntimeProperty(name) {
  return RUNTIME_PROPERTY_PREFIXES.some((prefix) => name.startsWith(prefix));
}
