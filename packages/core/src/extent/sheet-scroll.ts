/**
 * A bottom sheet the platform's own scroll moves.
 *
 * The layer is a scroll container whose `scrollTop` is the visible height of
 * the panel: a spacer the height of the layer comes first, then the panel, so
 * scrolling down the layer lifts the panel into view. The stops are snap
 * points — zero-height markers at each visible height, and the panel's own end
 * for the highest — with `scroll-snap-type: y mandatory`. The finger, the
 * fling and the landing are then the compositor's, as smooth as any scroll on
 * the page and indifferent to a busy main thread. This module only reads where
 * the scroll came to rest and lays the stops out.
 *
 * Lengths are pixels and extents are fractions of the layer's height.
 */

import { orderSnapPoints } from './extent';
import { measureLength } from './gesture';

/** How long a scroll with no event is taken as ended where `scrollend` is missing. */
const SCROLL_IDLE_MS = 150;
/** Two positions this close are the same stop. */
const SAME_PX = 2;

/** `scrollTo` where the element has it; a document with no layout engine only has `scrollTop`. */
function scrollLayer(layer: HTMLElement, top: number, behavior: ScrollBehavior) {
  if (typeof layer.scrollTo === 'function') layer.scrollTo({ behavior, top });
  else layer.scrollTop = top;
}

export interface SheetScrollOptions {
  /** The consumer's snap points, fractions of the layer. */
  readonly snapPoints: () => readonly number[];
  /** Whether the sheet rests at the height of its content (`size="content"`) or at its size step. */
  readonly content: () => boolean;
  /**
   * What a content sheet leaves above itself, a CSS length; and the size step,
   * a CSS length the panel resolves (`var(--_step)`).
   */
  readonly reserve: string;
  readonly step: string;
  /** Whether a scroll to the bottom closes the sheet. */
  readonly dismissible: () => boolean;
  /** A scroll came to rest: on a stop, or out of sight. */
  readonly onSettle: (at: number | 'close') => void;
  /** Every scrolled frame, the visible fraction. Passive; leave it out when nothing reads it. */
  readonly onScroll?: (at: number) => void;
}

export interface SheetScroll {
  /**
   * Measures the stops, lays the markers and the panel out, and puts the sheet
   * at `extent` at once. Called on opening and when what it measures changes.
   */
  layout(extent: number): void;
  /** Where the sheet rests with no extent asked for: the content's height or the size step. */
  rest(): number;
  /** The stops, lowest first, as last laid out. */
  stops(): readonly number[];
  /** Lays out, then scrolls the sheet up from out of sight to `extent`: the opening. */
  enter(extent: number): void;
  /** Moves the sheet to `extent` on the platform's smooth scroll, or at once. */
  scrollTo(extent: number, smooth: boolean): void;
  /** The visible fraction now; `1` while the content scrolls under a sheet at the top. */
  at(): number;
  /**
   * A drag that is not a touch — a mouse on the grabber — which no scroll
   * takes. The snap is off while it moves; the end goes to the nearest stop.
   */
  drag(): { move(distance: number): void; end(): void };
  destroy(): void;
}

export function attachSheetScroll(
  layer: HTMLElement,
  panel: HTMLElement,
  options: SheetScrollOptions,
): SheetScroll {
  const document = layer.ownerDocument;
  const view = document.defaultView;
  const markers = document.createElement('div');
  markers.setAttribute('data-part', 'stops');
  markers.setAttribute('data-part-stops', '');
  layer.append(markers);

  let stops: number[] = [];
  let span = 0;

  const height = () => layer.clientHeight;
  /**
   * How far the panel's top is from the top of what scrolls: the layer's
   * height, or nothing while the spacer is folded away (see `anchor`).
   */
  let shift = 0;
  /** Where the sheet is, in the coordinates of an unfolded layer. */
  const position = () => layer.scrollTop + shift;
  const at = () => (span > 0 ? Math.min(position(), span) / span : 0);

  /**
   * The panel's own height, which the minimum the stops write would hide:
   * content shorter than the highest stop is laid out at that stop.
   */
  const natural = () => {
    panel.style.minBlockSize = '0px';
    const measured = panel.offsetHeight;
    panel.style.removeProperty('min-block-size');
    return measured;
  };

  /** The rest, as a fraction: the content's height capped short of the layer, or the size step. */
  let restAt = 1;
  const measureRest = (own: number) => {
    restAt = options.content()
      ? Math.min(own, span - measureLength(options.reserve, panel)) / span
      : Math.min(measureLength(options.step, panel, span), span) / span;
  };

  const lay = () => {
    span = height();
    if (shift > 0) shift = span;
    const own = natural();
    const scrolls = own > span + SAME_PX;
    layer.toggleAttribute('data-sheet-scrolls', scrolls);
    measureRest(own);
    const snaps = orderSnapPoints(options.snapPoints());
    /* Past the top of a panel taller than the layer the content scrolls: it is no stop, the top is. */
    const candidates =
      snaps.length === 0 ? [restAt] : options.content() && !scrolls ? [...snaps, restAt] : snaps;
    stops = [...new Set(candidates)].filter((stop) => stop > 0).sort((a, b) => a - b);
    if (scrolls && (stops.at(-1) ?? 0) < 1) stops.push(1);
    const top = stops.at(-1) ?? 1;
    panel.style.setProperty('--slotted-drawer-sheet-height', `${String(Math.round(top * span))}px`);
    layer.style.setProperty(
      '--slotted-drawer-sheet-floor',
      `${String(Math.round((stops[0] ?? top) * span))}px`,
    );
    const positions = [...(options.dismissible() ? [0] : []), ...stops];
    markers.replaceChildren(
      ...positions.map((stop) => {
        const marker = document.createElement('div');
        marker.setAttribute('data-part', 'stop');
        marker.setAttribute('data-part-stop', '');
        marker.style.insetBlockStart = `${String(Math.round(stop * span))}px`;
        return marker;
      }),
    );
  };

  /** The fraction a resting scroll is at: the stop it sits on, exactly. */
  const resting = (): number | 'close' => {
    const top = position();
    if (options.dismissible() && top <= SAME_PX) return 'close';
    const stop = stops.find((value) => Math.abs(value * span - top) <= SAME_PX);
    return stop ?? at();
  };

  const markTop = () => {
    const top = stops.at(-1);
    layer.toggleAttribute(
      'data-top-stop',
      top !== undefined && Math.abs(top * span - position()) <= SAME_PX,
    );
  };

  /**
   * Content past the top is read with the snap off (`data-sheet-content`):
   * with it on, any layout — a render, a row arriving — re-snaps the panel to
   * its start and throws the reader back to the top of the list. The snap is
   * back the moment the sheet is below the top again.
   */
  let reading = false;
  const read = (on: boolean) => {
    if (on === reading) return;
    reading = on;
    layer.toggleAttribute('data-sheet-content', on);
  };

  /**
   * While content is read and no finger is down, the spacer above the panel is
   * folded away (`data-sheet-anchored`) and `scrollTop` moves by as much in the
   * same frame, so nothing on screen moves. The top of the content is then the
   * top of what scrolls: a fling out of the content ends there, on the
   * platform's own edge, as a nested list's does. Neither a written
   * `scrollTop` nor a hidden overflow ends a fling in Chrome; an edge does. A
   * finger on the sheet unfolds it first, so a pull from the top of the
   * content goes on moving the sheet down.
   */
  const anchor = (on: boolean) => {
    if (on === shift > 0) return;
    const top = position();
    shift = on ? span : 0;
    layer.toggleAttribute('data-sheet-anchored', on);
    layer.scrollTop = top - shift;
  };

  /** Off while a mouse drags, so a written `scrollTop` is not snapped under it. */
  let dragging = false;
  /** Fingers on the sheet: a scroll they move is a hand's, one without them a fling's. */
  let fingers = 0;
  /** Between an opening's first frame, out of sight, and its arrival: that bottom is no close. */
  let entering = false;
  const settle = () => {
    moving = false;
    if (dragging) return;
    if (entering) {
      if (position() <= SAME_PX) return;
      entering = false;
    }
    markTop();
    const inContent = position() > span + SAME_PX;
    read(inContent);
    if (inContent && fingers === 0) anchor(true);
    options.onSettle(resting());
  };

  const touched = (event: TouchEvent) => {
    fingers = event.touches.length;
    if (fingers > 0) anchor(false);
    else if (reading) anchor(true);
  };
  layer.addEventListener('touchstart', touched, { passive: true });
  layer.addEventListener('touchend', touched, { passive: true });
  layer.addEventListener('touchcancel', touched, { passive: true });

  const native = view !== null && 'onscrollend' in view;
  let idle: ReturnType<typeof setTimeout> | undefined;
  /** Between the first scroll event and the settle: a written position would cut it short. */
  let moving = false;
  const scrolled = () => {
    moving = true;
    const top = position();
    /* Past the top the content is read with no snap, from the frame the scroll gets there. */
    if (!reading && top > span + SAME_PX) read(true);
    else if (reading && top < span - SAME_PX) read(false);
    options.onScroll?.(at());
    if (native) return;
    clearTimeout(idle);
    idle = setTimeout(settle, SCROLL_IDLE_MS);
  };
  layer.addEventListener('scroll', scrolled, { passive: true });
  if (native) layer.addEventListener('scrollend', settle);

  const observer =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          /* Content scrolled past the top keeps its place; a sheet on a stop keeps its stop. */
          const raw = position();
          const scrolled = raw > span + SAME_PX;
          const extent = at();
          lay();
          /* A scroll in flight — an opening, a close, a fling — keeps going. */
          if (entering || moving) return;
          layer.scrollTop = (scrolled ? raw : extent * span) - shift;
        });
  observer?.observe(layer);
  observer?.observe(panel);

  return {
    layout(extent) {
      anchor(false);
      read(false);
      lay();
      layer.scrollTop = extent * span;
      markTop();
    },

    rest() {
      if (span === 0) lay();
      /* With snap points the rest is the stop nearest to it, so an opening lands on one. */
      return stops.reduce(
        (best, stop) => (Math.abs(stop - restAt) < Math.abs(best - restAt) ? stop : best),
        stops[0] ?? restAt,
      );
    },

    stops: () => stops,

    enter(extent) {
      anchor(false);
      read(false);
      lay();
      layer.scrollTop = 0;
      entering = true;
      this.scrollTo(extent, true);
      /* An opening that arrived at once — reduced motion, no smooth scroll — is over. */
      if (Math.abs(position() - extent * span) <= SAME_PX) entering = false;
    },

    scrollTo(extent, smooth) {
      anchor(false);
      const reduced =
        typeof view?.matchMedia === 'function' &&
        view.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollLayer(layer, extent * span, smooth && !reduced ? 'smooth' : 'instant');
    },

    at,

    drag() {
      anchor(false);
      dragging = true;
      const from = layer.scrollTop;
      layer.style.scrollSnapType = 'none';
      return {
        move(distance) {
          layer.scrollTop = from + distance;
        },
        end() {
          const top = layer.scrollTop;
          const positions = [...(options.dismissible() ? [0] : []), ...stops].map(
            (stop) => stop * span,
          );
          const nearest = positions.reduce(
            (best, value) => (Math.abs(value - top) < Math.abs(best - top) ? value : best),
            positions[0] ?? top,
          );
          const restore = () => {
            layer.removeEventListener('scrollend', restore);
            layer.style.removeProperty('scroll-snap-type');
            dragging = false;
            settle();
          };
          if (native && Math.abs(nearest - top) > 1) layer.addEventListener('scrollend', restore);
          scrollLayer(layer, nearest, 'smooth');
          if (!native || Math.abs(nearest - top) <= 1) restore();
        },
      };
    },

    destroy() {
      observer?.disconnect();
      clearTimeout(idle);
      layer.removeEventListener('scroll', scrolled);
      layer.removeEventListener('touchstart', touched);
      layer.removeEventListener('touchend', touched);
      layer.removeEventListener('touchcancel', touched);
      layer.removeEventListener('scrollend', settle);
      markers.remove();
      panel.style.removeProperty('--slotted-drawer-sheet-height');
      layer.style.removeProperty('--slotted-drawer-sheet-floor');
      layer.removeAttribute('data-top-stop');
      layer.removeAttribute('data-sheet-scrolls');
      layer.removeAttribute('data-sheet-content');
      layer.removeAttribute('data-sheet-anchored');
    },
  };
}
