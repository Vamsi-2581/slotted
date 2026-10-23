/**
 * The motion of a bottom sheet under a hand and after it lets go.
 *
 * A drag that resized the panel laid it out on every move. Here the panel is
 * laid out once, at the highest extent the gesture can reach, and moved down
 * by `translate` to the extent it had: from then on a move writes one
 * compositor property and reads nothing. The release animates the same
 * property from where the hand left it, at the speed the hand had, so a
 * fling leaves in one motion and a settle arrives without a step.
 *
 * Lengths are pixels and extents are the visible height of the panel, from the
 * bottom edge of its layer. Nothing here knows about fractions, stops or state:
 * the family decides where the release lands and asks for it.
 *
 * One panel has one motion: the body and the separator of a sheet share it, so
 * a hand that takes the panel again mid-settle takes it from where it is drawn.
 */

/** The fastest a settle may be, and the slowest. */
const SETTLE_MIN_MS = 160;
const SETTLE_MAX_MS = 480;
/** The speed a settle with no fling in it is paced by, in pixels per second. */
const SETTLE_REST_PX_PER_S = 900;
/** Past the panel's own height, so a shadow leaves with it. */
const EXIT_MARGIN_PX = 32;
/** How much steeper than its average a flung settle starts: it decelerates from the hand's speed. */
const FLING_SLOPE = 2;
/** The shortest exit: a faster hand still leaves over a few frames. */
const EXIT_MIN_MS = 120;
/** The x of the curve's first control point; its y sets the slope the motion starts at. */
const CURVE_X1 = 0.2;

export interface SheetMotion {
  /**
   * Starts a gesture. `rest` is the visible height now and `top` the highest the
   * hand may take it; the panel is sized to `top` when that is taller. When a
   * settle is in flight the panel is taken from where it is drawn instead of
   * `rest`, and the settle never resolves. Returns the visible height the
   * gesture starts from.
   */
  begin(rest: number, top: number): number;
  /**
   * The visible height while the motion holds the panel — under the hand, or
   * where a settle in flight has it now — and `null` when the stylesheet does.
   */
  visible(): number | null;
  /** Whether the motion holds the panel: its measure is then the gesture's, not the stylesheet's. */
  holds(): boolean;
  /**
   * Puts the visible height under the hand. Writes `translate`, reads nothing;
   * past the height the panel was laid out at, the panel grows to it.
   */
  follow(extent: number): void;
  /**
   * Animates from where the panel is to a visible height — `0` is out of sight —
   * at `velocity` pixels per second, positive toward a taller sheet. Resolves
   * when the panel has arrived, or at once when the motion is reduced; never
   * when a new gesture or `end` takes the panel first.
   * A panel leaving (`0`) keeps the hand's speed, or the rest pace when the hand
   * was slower, and speeds up out of sight: it never slows down near the edge.
   * `duration` caps that exit, in milliseconds, at the time something else
   * waits on it — presence unmounts the panel when the layer's exit ends.
   */
  settle(extent: number, velocity: number, duration?: number): Promise<void>;
  /** Gives the panel back to its stylesheet, in one frame and without easing. */
  end(): void;
}

const motions = new WeakMap<HTMLElement, SheetMotion>();

/**
 * Whether a gesture or its settle holds the panel. What measures the panel at
 * rest skips while it does: the height it would read is the gesture's.
 */
export function sheetMotionHolds(panel: HTMLElement): boolean {
  return motions.get(panel)?.holds() ?? false;
}

/** The vertical length of a computed `translate`: `none`, `x` or `x y [z]`. */
function translatedY(value: string): number {
  const y = Number.parseFloat(value.split(' ')[1] ?? '');
  return Number.isFinite(y) ? y : 0;
}

export function createSheetMotion(panel: HTMLElement): SheetMotion {
  const existing = motions.get(panel);
  if (existing !== undefined) return existing;

  const view = panel.ownerDocument.defaultView;
  /** The height the panel is laid out at, and how far down it is moved. */
  let box = 0;
  let offset = 0;
  /** Whether the inline styles are the motion's, and the settle in flight. */
  let held = false;
  let cancelSettle: (() => void) | null = null;

  const write = (next: number) => {
    offset = next;
    panel.style.translate = `0 ${String(next)}px`;
  };
  const layOut = (height: number) => {
    box = height;
    panel.style.blockSize = `${String(height)}px`;
  };

  const motion: SheetMotion = {
    begin(rest, top) {
      const from = motion.visible() ?? rest;
      cancelSettle?.();
      /* The stylesheet eases the measure and the slide and caps the height; a
         gesture is none of those. */
      panel.style.transition = 'none';
      panel.style.maxBlockSize = 'none';
      held = true;
      /* `box` is 0 unless a gesture already laid the panel out. */
      layOut(Math.max(from, top, box));
      write(box - from);
      return from;
    },

    holds() {
      return held;
    },

    visible() {
      if (!held) return null;
      /* A settle in flight is a transition: its value now is the computed one. */
      if (cancelSettle !== null && view !== null)
        return Math.max(0, box - translatedY(view.getComputedStyle(panel).translate));
      return Math.max(0, box - offset);
    },

    follow(extent) {
      if (extent > box) layOut(extent);
      write(box - extent);
    },

    settle(extent, velocity, fixed) {
      cancelSettle?.();
      const to = extent <= 0 ? box + EXIT_MARGIN_PX : box - extent;
      const distance = Math.abs(to - offset);
      const reduced =
        typeof view?.matchMedia === 'function' &&
        view.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (distance < 1 || reduced || view === null) {
        panel.style.transition = 'none';
        write(to);
        return Promise.resolve();
      }
      /* The hand's speed toward the target; against it, it counts as none. */
      const toward = Math.max(0, to > offset ? -velocity : velocity);
      const leaving = extent <= 0;
      const flung = toward >= SETTLE_REST_PX_PER_S;
      const cap = fixed !== undefined && fixed > 0 ? fixed : SETTLE_MAX_MS;
      const duration = leaving
        ? Math.min(
            cap,
            Math.max(EXIT_MIN_MS, (distance / Math.max(toward, SETTLE_REST_PX_PER_S)) * 1000),
          )
        : Math.min(
            cap,
            Math.max(
              SETTLE_MIN_MS,
              flung
                ? ((FLING_SLOPE * distance) / toward) * 1000
                : (distance / SETTLE_REST_PX_PER_S) * 1000,
            ),
          );
      /* The curve's first stretch is as steep as the hand was, so the panel
         goes on at the speed it was let go. Onto a stop it then decelerates;
         out of sight its last control point is (1, 1), so it only speeds up. */
      const slope = (toward * duration) / 1000 / distance;
      const y1 = Math.min(1, slope * CURVE_X1).toFixed(3);
      const easing = leaving
        ? `cubic-bezier(${String(CURVE_X1)}, ${y1}, 1, 1)`
        : `cubic-bezier(${String(CURVE_X1)}, ${y1}, 0, 1)`;
      /* A transition and not an animation object: presence waits for the leaving
         panel by the transition the node declares, and this is the one it
         declares. Reading the value commits the start the transition leaves. */
      void view.getComputedStyle(panel).translate;
      panel.style.transition = `translate ${String(Math.round(duration))}ms ${easing}`;
      write(to);
      return new Promise<void>((resolve) => {
        const arrived = (event: Event) => {
          if (event.target === panel && (event as TransitionEvent).propertyName === 'translate')
            settled(true);
        };
        const timer = setTimeout(() => settled(true), duration + 60);
        function settled(reached: boolean) {
          clearTimeout(timer);
          panel.removeEventListener('transitionend', arrived);
          panel.removeEventListener('transitioncancel', arrived);
          if (cancelSettle === cancel) cancelSettle = null;
          if (reached) resolve();
        }
        const cancel = () => settled(false);
        panel.addEventListener('transitionend', arrived);
        panel.addEventListener('transitioncancel', arrived);
        cancelSettle = cancel;
      });
    },

    end() {
      cancelSettle?.();
      if (!held) return;
      held = false;
      /* Nothing eases while the stylesheet takes the measure back: the panel is
         drawn at the extent the family has just requested, in the same frame. */
      panel.style.transition = 'none';
      panel.style.removeProperty('block-size');
      panel.style.removeProperty('max-block-size');
      panel.style.removeProperty('translate');
      box = 0;
      offset = 0;
      const release = () => {
        if (!held) panel.style.removeProperty('transition');
      };
      if (view === null) release();
      else view.requestAnimationFrame(release);
    },
  };
  motions.set(panel, motion);
  return motion;
}
