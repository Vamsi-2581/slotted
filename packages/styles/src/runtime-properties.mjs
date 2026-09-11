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
   * stack, how many are visible, how tall each one is and how much room the
   * ones in front of it take, how long this one was given, whether the timers
   * are running, and how far the pointer has taken a message it is dragging
   * away.
   *
   * Two of them are the ones that look like something else and are not.
   * `--slotted-toast-duration` looks like a motion token: it is the time *this
   * message* was given, stated per message, which no theme can know, and the
   * remaining-time bar reads it so the picture and the timer are one number.
   * `--slotted-toast-height` looks like a size token: it is the height this
   * message turned out to be, measured, and it is what lets a collapsed pile
   * open into a readable column instead of snapping into one.
   *
   * They are named one by one rather than by a `--slotted-toast-` prefix,
   * because the family also owns theme tokens under that prefix — its measure,
   * its offset, its gap — and a prefix would file every one of them as a value
   * no theme can retune.
   */
  '--slotted-toast-count',
  '--slotted-toast-duration',
  '--slotted-toast-front-height',
  '--slotted-toast-height',
  '--slotted-toast-index',
  '--slotted-toast-play-state',
  '--slotted-toast-stack-offset',
  '--slotted-toast-swipe-x',
  '--slotted-toast-swipe-y',
  /**
   * `page-header` and `page` — the geometry of the chrome that stays while the
   * page scrolls. `--slotted-page-header-collapse` is the measured height of
   * the header area, which is the root's negative sticky offset: the first
   * that many pixels leave the scrollport and the title area stays.
   * `--slotted-page-sticky-top` is the height of everything that stays at the
   * top, and `--slotted-page-sticky-bottom` the height of the footer, both
   * written on the scroll container so a section's sticky header and a table's
   * sticky column header can stop under the chrome rather than behind it. No
   * theme can know any of the three: they are what the header turned out to
   * be, measured.
   */
  '--slotted-page-header-collapse',
  '--slotted-page-sticky-top',
  '--slotted-page-sticky-bottom',
  /**
   * `tree` — how deep in the hierarchy one node sits. The stylesheet multiplies
   * it by the indent step to inset the row, and no theme can know it: it is a
   * fact about the consumer's data, stated per node, in the same category as
   * the measured values above rather than in the category of a value a theme
   * retunes. The step itself is `--slotted-tree-indent`, which is a token and
   * is in the contract.
   *
   * It is named on its own rather than by a `--slotted-tree-` prefix, because
   * the family owns fifteen theme tokens under that prefix and a prefix would
   * file every one of them as unreachable by a theme.
   */
  '--slotted-tree-depth',
  /**
   * `tree` — where one row sits on a windowed canvas, in pixels. It is written
   * only on a row the window does not cover and the family renders anyway: the
   * active node, and the anchor a range is measured from. The number is the
   * product of a measured viewport and a scroll position, so no theme can hold
   * it, and a row without it is a row in flow that does not read it.
   */
  '--slotted-tree-row-offset',
  /**
   * `upload` — how many rows of the file list are shown before the rest is
   * scrolled to. It is `maxRows`, stated per instance, and no theme can hold
   * it: a form that takes one avatar and a page that takes a folder of four
   * hundred invoices want different numbers from the same theme: it is a fact
   * about this consumer's data rather than a value a theme retunes.
   *
   * `maxRows: 0` means no bound, and the binding says so by writing the file
   * count rather than a second property: a cap that is the content's own
   * height is a cap nothing reaches.
   *
   * Named on its own rather than by a `--slotted-upload-` prefix, because the
   * family owns thirty-three theme tokens under that prefix and a prefix would
   * file every one of them as unreachable by a theme.
   */
  '--slotted-upload-visible-rows',
];

/** Whether a custom property is written by script rather than by a theme. */
export function isRuntimeProperty(name) {
  return RUNTIME_PROPERTY_PREFIXES.some((prefix) => name.startsWith(prefix));
}
