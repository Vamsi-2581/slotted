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
 */

/** The fastest a settle may be, and the slowest. */
const SETTLE_MIN_MS = 140;
const SETTLE_MAX_MS = 420;
/** The speed a settle with no fling in it is paced by, in pixels per second. */
const SETTLE_REST_PX_PER_S = 700;
/** Past the panel's own height, so a shadow leaves with it. */
const EXIT_MARGIN_PX = 32;

export interface SheetMotion {
  /**
   * Starts a gesture. `rest` is the visible height now and `top` the highest the
   * hand may take it; the panel is sized to `top` when that is taller.
   */
  begin(rest: number, top: number): void;
  /** Puts the visible height under the hand. Writes `translate`, reads nothing. */
  follow(extent: number): void;
  /**
   * Animates from where the panel is to a visible height — `0` is out of sight —
   * at `velocity` pixels per second, positive toward a taller sheet. Resolves
   * when the panel has arrived, or at once when the motion is reduced.
   * `duration` fixes the time it takes, in milliseconds, for a panel leaving
   * that something else waits on; the curve is then drawn to leave at `velocity`.
   */
  settle(extent: number, velocity: number, duration?: number): Promise<void>;
  /** Gives the panel back to its stylesheet. The panel stays where it is drawn until then. */
  end(): void;
}

export function createSheetMotion(panel: HTMLElement): SheetMotion {
  const view = panel.ownerDocument.defaultView;
  /** The height the panel is laid out at, and how far down it is moved. */
  let box = 0;
  let offset = 0;
  /** Ends the settle in flight, as if it had arrived. */
  let cancelSettle: (() => void) | null = null;

  const write = (next: number) => {
    offset = next;
    panel.style.translate = `0 ${String(next)}px`;
  };

  return {
    begin(rest, top) {
      cancelSettle?.();
      box = Math.max(rest, top);
      /* The stylesheet eases the measure and the slide; a gesture is neither. */
      panel.style.transition = 'none';
      panel.style.blockSize = `${String(box)}px`;
      write(box - rest);
    },

    follow(extent) {
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
        write(to);
        return Promise.resolve();
      }
      /* Toward the target the hand's own speed paces the motion; against it, or
         slow, the rest speed does. */
      const toward = to > offset ? -velocity : velocity;
      const flung = toward >= SETTLE_REST_PX_PER_S;
      const speed = flung ? toward : SETTLE_REST_PX_PER_S;
      const duration =
        fixed !== undefined && fixed > 0
          ? fixed
          : Math.min(SETTLE_MAX_MS, Math.max(SETTLE_MIN_MS, (distance / speed) * 1000));
      /* A fixed time with a hand's speed: the curve's first stretch is as steep
         as the hand was, so the panel leaves at the speed it was let go. */
      const easing =
        fixed !== undefined && fixed > 0
          ? `cubic-bezier(0.3, ${String(Math.min(1, Math.max(0, (toward * duration) / 1000 / distance) * 0.3).toFixed(3))}, 0.2, 1)`
          : flung
            ? 'linear'
            : 'cubic-bezier(0.2, 0, 0, 1)';
      /* A transition and not an animation object: presence waits for the leaving
         panel by the transition the node declares, and this is the one it
         declares. Reading the value commits the start the transition leaves. */
      void view.getComputedStyle(panel).translate;
      panel.style.transition = `translate ${String(duration)}ms ${easing}`;
      write(to);
      return new Promise<void>((resolve) => {
        const arrived = (event: Event) => {
          if (event.target === panel && (event as TransitionEvent).propertyName === 'translate')
            done();
        };
        const timer = setTimeout(done, duration + 60);
        function done() {
          clearTimeout(timer);
          panel.removeEventListener('transitionend', arrived);
          panel.removeEventListener('transitioncancel', arrived);
          if (cancelSettle === done) cancelSettle = null;
          resolve();
        }
        panel.addEventListener('transitionend', arrived);
        panel.addEventListener('transitioncancel', arrived);
        cancelSettle = done;
      });
    },

    end() {
      cancelSettle?.();
      panel.style.removeProperty('block-size');
      panel.style.removeProperty('translate');
      /* The measure and the slide may ease again only once the stylesheet has
         the new measure, or the panel eases from the old one to it. */
      const release = () => panel.style.removeProperty('transition');
      if (view === null) release();
      else view.requestAnimationFrame(release);
    },
  };
}
