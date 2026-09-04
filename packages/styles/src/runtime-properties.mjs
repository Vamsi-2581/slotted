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
  /**
   * `packages/core/src/toast` — how far a message is from the front of the
   * stack, how many are visible, how long this one was given, whether the
   * timers are running, and how far the pointer has taken a message it is
   * dragging away.
   *
   * `--slotted-toast-duration` is the one that looks like a motion token and is
   * not: it is the time *this message* was given, which a consumer states per
   * message and no theme can know. The remaining-time bar reads it so the
   * picture and the timer are the same number.
   *
   * They are named one by one rather than by a `--slotted-toast-` prefix,
   * because the family also owns theme tokens under that prefix — its measure,
   * its offset, its gap — and a prefix would file every one of them as a value
   * no theme can retune.
   */
  '--slotted-toast-index',
  '--slotted-toast-count',
  '--slotted-toast-duration',
  '--slotted-toast-play-state',
  '--slotted-toast-swipe-x',
  '--slotted-toast-swipe-y',
];

/** Whether a custom property is written by script rather than by a theme. */
export function isRuntimeProperty(name) {
  return RUNTIME_PROPERTY_PREFIXES.some((prefix) => name.startsWith(prefix));
}
