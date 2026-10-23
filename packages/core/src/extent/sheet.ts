/**
 * The gesture a sheet answers anywhere on its panel: a touch that moves it, and
 * hands itself to the scroll of what the sheet holds when that is what it is.
 *
 * Touch events and not pointer events, and the reason is the platform's. With
 * a `touch-action` that admits vertical panning the browser takes the gesture
 * and sends `pointercancel`; with `none` the body would stop scrolling at all.
 * A non-passive `touchmove` is the one listener that can decide per gesture,
 * by cancelling the first move or leaving it alone.
 *
 * The decision is taken once, when the touch has travelled
 * `SHEET_DRAG_SLOP_PX`. A `touchmove` stops being cancelable once scrolling has
 * begun, so a scroll that reaches the top in the middle of a gesture does not
 * become a drag; the next gesture does. Material hands over mid-gesture through
 * nested scrolling, which a page cannot reach.
 *
 * Nothing here knows about fractions or stops. It reports a distance and a
 * speed, both positive while the sheet grows, and the family decides.
 */
import { addExtentSample, extentVelocity, SHEET_DRAG_SLOP_PX } from './extent';
import type { ExtentSample } from './extent';

export interface SheetDragOptions {
  /** Read at the start of every gesture: the family may have turned it off. */
  readonly enabled: () => boolean;
  /** Whether an upward gesture should grow the sheet rather than scroll it. */
  readonly canGrow: () => boolean;
  readonly onStart: () => void;
  /** Pixels the hand has moved since the gesture was claimed, upward positive. */
  readonly onMove: (distance: number) => void;
  /** Pixels per second at release, upward positive. */
  readonly onEnd: (velocity: number) => void;
}

/** What a touch that starts here keeps for itself. */
const OWNS_THE_TOUCH =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-part="resizer"], [data-drawer-drag="none"]';

/** `touch-action` values under which a vertical pan is still the browser's to give. */
function admitsVerticalPan(value: string): boolean {
  if (value === '' || value === 'auto' || value === 'manipulation') return true;
  return /pan-y|pan-up|pan-down/.test(value);
}

function claimedElsewhere(target: Element, panel: HTMLElement): boolean {
  const owned = target.closest(OWNS_THE_TOUCH);
  if (owned !== null && panel.contains(owned)) return true;

  const view = panel.ownerDocument.defaultView;
  for (
    let node: Element | null = target;
    node !== null && node !== panel;
    node = node.parentElement
  ) {
    const value = view?.getComputedStyle(node).touchAction ?? '';
    if (!admitsVerticalPan(value)) return true;
  }
  return false;
}

/** Whether something between the touch and the panel is scrolled away from its top. */
function scrolledAway(target: Element, panel: HTMLElement): boolean {
  for (let node: Element | null = target; node !== null; node = node.parentElement) {
    if (node.scrollTop > 0 && node.scrollHeight > node.clientHeight) return true;
    if (node === panel) break;
  }
  return false;
}

function hasSelection(panel: HTMLElement): boolean {
  const selection = panel.ownerDocument.getSelection();
  return selection !== null && !selection.isCollapsed && selection.toString() !== '';
}

/** Listens on the panel and returns the function that stops listening. */
export function attachSheetDrag(panel: HTMLElement, options: SheetDragOptions): () => void {
  let origin: { x: number; y: number; target: Element } | null = null;
  let owner: 'pending' | 'sheet' | 'other' = 'other';
  /** Upward is positive: the `fraction` of a sample here is the negated `clientY`. */
  let samples: ExtentSample[] = [];

  const reset = () => {
    origin = null;
    owner = 'other';
    samples = [];
  };

  const start = (event: TouchEvent) => {
    reset();
    if (event.touches.length !== 1 || !options.enabled()) return;
    const touch = event.touches[0] as Touch;
    const target = event.target instanceof Element ? event.target : null;
    if (target === null || claimedElsewhere(target, panel) || hasSelection(panel)) return;
    origin = { x: touch.clientX, y: touch.clientY, target };
    owner = 'pending';
  };

  const move = (event: TouchEvent) => {
    if (origin === null || owner === 'other') return;
    const touch = event.touches[0];
    if (touch === undefined) return;
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;

    if (owner === 'pending') {
      if (Math.hypot(dx, dy) < SHEET_DRAG_SLOP_PX) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        owner = 'other';
        return;
      }
      const down = dy > 0;
      owner = down
        ? scrolledAway(origin.target, panel)
          ? 'other'
          : 'sheet'
        : options.canGrow()
          ? 'sheet'
          : 'other';
      if (owner === 'other') return;
      /* The distance counts from here: counted from the touch, the slop the
         decision waited for would arrive as one step under the hand. */
      origin = { ...origin, y: touch.clientY };
      options.onStart();
    }

    if (event.cancelable) event.preventDefault();
    samples = addExtentSample(samples, { at: event.timeStamp, fraction: -touch.clientY });
    options.onMove(origin.y - touch.clientY);
  };

  const end = (event: TouchEvent) => {
    /* A cancelled touch was not let go: it has no speed to carry on. */
    if (owner === 'sheet')
      options.onEnd(event.type === 'touchcancel' ? 0 : extentVelocity(samples, event.timeStamp));
    reset();
  };

  panel.addEventListener('touchstart', start, { passive: true });
  panel.addEventListener('touchmove', move, { passive: false });
  panel.addEventListener('touchend', end);
  panel.addEventListener('touchcancel', end);

  return () => {
    panel.removeEventListener('touchstart', start);
    panel.removeEventListener('touchmove', move);
    panel.removeEventListener('touchend', end);
    panel.removeEventListener('touchcancel', end);
  };
}
