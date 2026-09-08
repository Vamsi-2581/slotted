/**
 * How much of the space available to it a panel takes, and how a pointer or a
 * keyboard moves that number.
 *
 * The value is a **fraction of the layer**, in `[0, 1]`, rather than a length.
 * Three things follow from that and none of them holds for a length: the
 * WAI-ARIA Window Splitter pattern's `aria-valuenow`, `aria-valuemin` and
 * `aria-valuemax` are the fraction times a hundred, which is the range that
 * pattern calls typical; the limits and the snap points are the same kind of
 * number, so one clamp covers all three; and a keyboard step is a proportion,
 * so no caller carries a pixel literal.
 *
 * Nothing here touches the DOM. The caller measures the rectangle and this
 * module does the arithmetic, which is the split `packages/core/src/slider`
 * already has — and the reason both are testable without a browser.
 *
 * `drawer` is the first consumer. `splitter`, in wave 8, holds the same value
 * between two panes and answers the same pattern.
 */
import { clamp } from '../measure';

/** Which edge the panel is anchored to. Logical, as the guide's §2.4 requires. */
export type ExtentSide = 'start' | 'end' | 'top' | 'bottom';

/** The rectangle the fraction is measured against, in client coordinates. */
export interface ExtentRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ExtentPointRequest {
  /** Where the pointer is, in client coordinates. */
  readonly point: { readonly x: number; readonly y: number };
  /** The layer the panel is measured against. */
  readonly rect: ExtentRect;
  readonly side: ExtentSide;
  /** Whether the document reads right to left. Only `start` and `end` care. */
  readonly rtl?: boolean;
}

export interface ExtentStepRequest {
  readonly fraction: number;
  /** `1` grows the panel, `-1` shrinks it. */
  readonly direction: 1 | -1;
  /** How much of the layer one press moves, when there are no snap points. */
  readonly amount: number;
  readonly min: number;
  readonly max: number;
  /** The stops the panel lands on. Empty means the range is continuous. */
  readonly snapPoints?: readonly number[];
}

/**
 * What one arrow press and one `Shift`+arrow press move, in pixels.
 *
 * They are lengths and not fractions because a reader adjusting a pane is
 * placing an edge against the content beside it, and five per cent of a
 * twelve-hundred-pixel layer is sixty pixels — a jump, not an adjustment. SAP's
 * Splitter, VS Code's sash and the Window Splitter pattern's own examples all
 * move a fixed distance. The fraction is still what the family stores; this is
 * converted against the measured layer at the moment of the press.
 */
export const EXTENT_STEP_PX = 16;
export const EXTENT_LARGE_STEP_PX = 64;

/**
 * A distance in pixels as a fraction of the layer along the panel's own axis.
 *
 * A layer with no extent along that axis answers nought rather than infinity,
 * which is what a press against an unmeasured or collapsed layer has to do.
 */
export function stepAmountFromPixels({
  pixels,
  rect,
  side,
}: {
  readonly pixels: number;
  readonly rect: ExtentRect;
  readonly side: ExtentSide;
}): number {
  const span = isInlineSide(side) ? rect.width : rect.height;
  return span > 0 ? pixels / span : 0;
}

/** Whether the panel's extent grows along the inline axis. */
export function isInlineSide(side: ExtentSide): boolean {
  return side === 'start' || side === 'end';
}

/**
 * Whether the panel is anchored at the physically first edge of its axis — the
 * left in a left-to-right document, the top always.
 *
 * It is the one fact both halves of the pattern need. A pointer's distance is
 * measured from the anchored edge, and a key that moves the separator toward
 * the physically first edge grows the panel exactly when the panel is *not*
 * anchored there. Deriving it twice is how the pointer and the keyboard come to
 * disagree about which way is bigger in a mirrored document.
 */
export function anchorsAtStart(side: ExtentSide, rtl = false): boolean {
  if (side === 'start') return !rtl;
  if (side === 'end') return rtl;
  return side === 'top';
}

/**
 * The stops in ascending order, with anything outside `[0, 1]` dropped and
 * duplicates removed. A caller's array is not modified.
 */
export function orderSnapPoints(snapPoints: readonly number[]): number[] {
  return [...new Set(snapPoints.filter((point) => point >= 0 && point <= 1))].sort((a, b) => a - b);
}

/**
 * Where a pointer sits, as a fraction of the layer along the panel's own axis.
 *
 * The panel is anchored to `side`, so the fraction is the distance from the
 * *opposite* edge: dragging the inner edge of an `end` panel toward the start
 * of the layer makes the panel larger. `rtl` flips only the inline sides,
 * because `start` and `end` are the two that the reading direction names.
 */
export function extentAtPoint({ point, rect, rtl = false, side }: ExtentPointRequest): number {
  const inline = isInlineSide(side);
  const span = inline ? rect.width : rect.height;
  if (span <= 0) return 0;

  const fromFirstEdge = inline ? (point.x - rect.x) / span : (point.y - rect.y) / span;
  const measured = anchorsAtStart(side, rtl) ? fromFirstEdge : 1 - fromFirstEdge;
  return clamp(measured, 0, 1);
}

/**
 * The stop nearest `fraction`. An empty list has no nearest stop and the
 * fraction is its own answer, which is what makes a continuous range the
 * default rather than a second code path.
 */
export function nearestSnap(fraction: number, snapPoints: readonly number[]): number {
  const stops = orderSnapPoints(snapPoints);
  if (stops.length === 0) return fraction;

  return stops.reduce((closest, stop) =>
    Math.abs(stop - fraction) < Math.abs(closest - fraction) ? stop : closest,
  );
}

/**
 * One press of an arrow key.
 *
 * With snap points the separator moves to the adjacent stop, which is the only
 * reading under which `docs/component-features.md` §8's condition — snap points
 * "continuam operáveis por teclado" — is met. Without them it moves by
 * `amount`. Either way the result is held inside `[min, max]`.
 *
 * A fraction that sits between two stops moves to the stop on the side it is
 * travelling toward rather than skipping one, so a drag that ended off a stop
 * and an arrow press afterwards do not disagree about where the panel is.
 */
export function stepExtent({
  amount,
  direction,
  fraction,
  max,
  min,
  snapPoints = [],
}: ExtentStepRequest): number {
  const stops = orderSnapPoints(snapPoints).filter((stop) => stop >= min && stop <= max);

  if (stops.length > 0) {
    const next =
      direction === 1
        ? stops.find((stop) => stop > fraction + Number.EPSILON)
        : [...stops].reverse().find((stop) => stop < fraction - Number.EPSILON);
    return next ?? clamp(fraction, min, max);
  }

  return clamp(fraction + direction * amount, min, max);
}

/**
 * Where `Home` and `End` land, and where `Enter` collapses to and restores
 * from. The limits are the first and last stop when there are stops, because a
 * range whose ends are not reachable is a range with two values nothing can
 * produce.
 */
export function extentBounds(
  snapPoints: readonly number[],
  min: number,
  max: number,
): { min: number; max: number } {
  const stops = orderSnapPoints(snapPoints);
  if (stops.length === 0) return { min: clamp(min, 0, 1), max: clamp(max, 0, 1) };
  return { min: stops[0] as number, max: stops.at(-1) as number };
}
