/**
 * The behaviour of a carousel, with no framework in it.
 *
 * A carousel is a scroller with snap, and the platform already pages it under
 * a finger, a trackpad and the keyboard. What the platform does not give is
 * the arithmetic around it — which positions are pages when several slides
 * share a view, which page the reader is on, which slides are in view — and
 * the three movements a scroller cannot make on its own: a scroll that runs on
 * the theme's motion scale, a drag with a mouse, and a swipe between stacked
 * slides. Those are here, once, for both bindings.
 *
 * The hot path stays out of the frameworks. The engine writes the attributes
 * that change on every scroll or resize on the elements themselves —
 * `data-snap`, `data-inview`, `inert`, `data-current` and the default name on
 * each slide, `data-animating` on the viewport — and reports pages, the page
 * under the reader and the end of a gesture through callbacks. The page a
 * consumer owns is the binding's.
 *
 * Every offset is logical: measured from the inline start (or the block start
 * of a vertical carousel), so a right-to-left document, whose `scrollLeft`
 * runs negative in every current engine, is the same arithmetic.
 */

export type CarouselOrientation = 'horizontal' | 'vertical';
export type CarouselAlign = 'start' | 'center';
export type CarouselTransition = 'slide' | 'fade';
/** A number of slides, or `page` for the slides wholly in view. */
export type CarouselSlidesPerMove = number | 'page';
export type CarouselIntent = 'previous' | 'next' | 'first' | 'last';
/** How far an indicator stands from the current one, once the row is adaptive. */
export type CarouselIndicatorDistance = '0' | '1' | '2' | 'far';

/** Every slide's box along the axis, and the viewport's, in logical pixels. */
export interface CarouselMetrics {
  /** The viewport's client size along the axis. */
  viewport: number;
  /** The viewport's padding at the start and end of the axis, which is also its scroll padding. */
  paddingStart: number;
  paddingEnd: number;
  /** How far the viewport can scroll. */
  maxScroll: number;
  /** Each slide's start (from the scroll origin, padding included) and size. */
  slides: readonly { start: number; size: number }[];
}

export interface CarouselPages {
  /** The scroll offset of each page, ascending, never past `maxScroll`. */
  positions: number[];
  /** The first slide of each page. */
  starts: number[];
  /** The page each slide belongs to. */
  pageOfSlide: number[];
}

export const EMPTY_PAGES: CarouselPages = { positions: [], starts: [], pageOfSlide: [] };

/** A slide the engine and both stylesheets recognise. */
export const SLIDE_SELECTOR = '[data-part="slide"]';

/** The rotation's own wait, when the consumer turns it on with `true`. */
export const DEFAULT_AUTOPLAY_DELAY = 5000;

/** Past this many pages, a row of dots becomes adaptive. */
export const ADAPTIVE_FROM = 8;

/** Pixels a mouse moves along the axis before a press becomes a drag. */
export const DRAG_THRESHOLD = 4;

/** Pixels a finger moves along the axis before a swipe between stacked slides counts. */
export const SWIPE_THRESHOLD = 40;

/** A slide is in view when this share of it or more is inside the viewport. */
export const IN_VIEW_THRESHOLD = 0.5;

/** Half a pixel: a position this close to another is the same position. */
const EPSILON = 0.5;

/**
 * The pages of a track, from the slides' own boxes.
 *
 * `start` alignment: a page starts where a slide starts, less the scroll
 * padding, and no page is past the end of the track — the last page is the
 * end, whatever slide sits there. With `page`, the next page starts at the
 * first slide the current page does not show whole, which is how a row of
 * three cards pages by three and a row whose last page holds two still ends
 * flush. With a number, the next page starts that many slides on.
 *
 * `center` alignment: every slide is a page, centred in the viewport; the
 * slides near the ends, whose centre the track cannot reach, share the page
 * at that end.
 */
export function carouselPages(
  metrics: CarouselMetrics,
  options: { align?: CarouselAlign; slidesPerMove?: CarouselSlidesPerMove } = {},
): CarouselPages {
  const { slides, viewport, paddingStart, paddingEnd, maxScroll } = metrics;
  if (slides.length === 0) return { positions: [], starts: [], pageOfSlide: [] };

  const clamp = (value: number) => Math.min(Math.max(value, 0), Math.max(maxScroll, 0));
  const positions: number[] = [];
  const starts: number[] = [];
  const pageOfSlide: number[] = Array.from({ length: slides.length }, () => 0);

  function push(slide: number, position: number): boolean {
    const last = positions.at(-1);
    if (last !== undefined && position <= last + EPSILON) return false;
    positions.push(position);
    starts.push(slide);
    return true;
  }

  if (options.align === 'center') {
    for (const [index, slide] of slides.entries()) {
      push(index, clamp(slide.start + slide.size / 2 - viewport / 2));
      pageOfSlide[index] = positions.length - 1;
    }
    return { positions, starts, pageOfSlide };
  }

  const move = options.slidesPerMove ?? 'page';
  const positionOf = (index: number) => clamp((slides[index]?.start ?? 0) - paddingStart);

  let index = 0;
  while (index < slides.length) {
    const position = positionOf(index);
    push(index, position);
    if (position >= maxScroll - EPSILON) break;

    let next: number;
    if (move === 'page') {
      const visibleEnd = position + viewport - paddingEnd;
      next = index + 1;
      while (next < slides.length) {
        const slide = slides[next];
        if (slide === undefined || slide.start + slide.size > visibleEnd + EPSILON) break;
        next += 1;
      }
      if (next >= slides.length) break;
    } else {
      next = index + Math.max(1, Math.floor(move));
      if (next >= slides.length) {
        /* The end of the track is a page even when the step skips past it. */
        push(slides.length - 1, clamp(maxScroll));
        break;
      }
    }
    index = next;
  }

  for (let slide = 0, page = 0; slide < slides.length; slide += 1) {
    while (page + 1 < starts.length && (starts[page + 1] ?? Infinity) <= slide) page += 1;
    pageOfSlide[slide] = page;
  }
  return { positions, starts, pageOfSlide };
}

/** The page whose position is nearest an offset; `-1` with no pages. */
export function nearestPage(positions: readonly number[], offset: number): number {
  let best = -1;
  let distance = Infinity;
  for (const [index, position] of positions.entries()) {
    const gap = Math.abs(position - offset);
    if (gap < distance - EPSILON) {
      best = index;
      distance = gap;
    }
  }
  return best;
}

/**
 * The page a step lands on. Without a loop a step past an end stays at the
 * end; with one it wraps. `-1` when there are no pages.
 */
export function stepPage(page: number, delta: number, count: number, loop: boolean): number {
  if (count <= 0) return -1;
  const target = page + delta;
  if (loop) return ((target % count) + count) % count;
  return Math.min(Math.max(target, 0), count - 1);
}

/** Whether a step from this page has anywhere to go. */
export function canStep(page: number, delta: number, count: number, loop: boolean): boolean {
  if (count <= 1) return false;
  if (loop) return true;
  const target = page + delta;
  return target >= 0 && target < count;
}

/**
 * What a key asks the viewport for. The arrows of the axis move a page and
 * mirror in a right-to-left document; the cross axis is the page's own, so
 * the document keeps scrolling with focus on a horizontal carousel.
 */
export function carouselKeyIntent(
  key: string,
  orientation: CarouselOrientation,
  direction: 'ltr' | 'rtl',
): CarouselIntent | null {
  switch (key) {
    case 'PageDown':
      return 'next';
    case 'PageUp':
      return 'previous';
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    default:
      break;
  }
  if (orientation === 'vertical') {
    if (key === 'ArrowDown') return 'next';
    if (key === 'ArrowUp') return 'previous';
    return null;
  }
  const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  if (key === forward) return 'next';
  if (key === backward) return 'previous';
  return null;
}

/** The page an intent lands on, or `-1` when it lands nowhere. */
export function intentPage(
  intent: CarouselIntent,
  page: number,
  count: number,
  loop: boolean,
): number {
  if (count <= 0) return -1;
  if (intent === 'first') return 0;
  if (intent === 'last') return count - 1;
  return stepPage(page, intent === 'next' ? 1 : -1, count, loop);
}

/** Which slides have at least `threshold` of their size inside the viewport at an offset. */
export function slidesInView(
  metrics: CarouselMetrics,
  offset: number,
  threshold = IN_VIEW_THRESHOLD,
): boolean[] {
  const from = offset;
  const to = offset + metrics.viewport;
  return metrics.slides.map((slide) => {
    if (slide.size <= 0) return false;
    const visible = Math.min(slide.start + slide.size, to) - Math.max(slide.start, from);
    return visible / slide.size >= threshold - 1e-6;
  });
}

/**
 * How far an indicator is from the current one, for the adaptive row; `null`
 * when the row is short enough to show every dot whole.
 */
export function indicatorDistance(
  index: number,
  current: number,
  count: number,
  adaptiveFrom = ADAPTIVE_FROM,
): CarouselIndicatorDistance | null {
  if (count < adaptiveFrom) return null;
  /* The window keeps five dots whole at the ends, where the current one has no neighbour on one side. */
  const centre = Math.min(Math.max(current, 2), count - 3);
  const distance = Math.abs(index - centre);
  if (index === current || distance === 0) return '0';
  if (distance === 1) return '1';
  if (distance === 2) return '2';
  return 'far';
}

/** A CSS time — `320ms`, `0.32s` — in milliseconds; 0 for anything else. */
export function parseCssTime(value: string): number {
  const match = /^\s*(-?[\d.]+)(ms|s)\s*$/.exec(value);
  if (match === null) return 0;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return 0;
  return match[2] === 's' ? amount * 1000 : amount;
}

/**
 * A cubic Bézier timing function, solved for x by Newton's method with a
 * bisection fallback — the same curve a `transition` with that easing draws.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const x = (t: number) => ((ax * t + bx) * t + cx) * t;
  const y = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  function solve(target: number): number {
    let t = target;
    for (let step = 0; step < 8; step += 1) {
      const error = x(t) - target;
      if (Math.abs(error) < 1e-6) return t;
      const slope = dx(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    let low = 0;
    let high = 1;
    t = target;
    while (low < high) {
      const value = x(t);
      if (Math.abs(value - target) < 1e-6) return t;
      if (target > value) low = t;
      else high = t;
      if (high - low < 1e-7) break;
      t = (high + low) / 2;
    }
    return t;
  }

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return y(solve(t));
  };
}

/** A CSS easing — `cubic-bezier(…)`, `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`. */
export function parseCssEasing(value: string): (t: number) => number {
  const text = value.trim();
  const match = /^cubic-bezier\(\s*([^,]+),([^,]+),([^,]+),([^)]+)\)$/.exec(text);
  if (match !== null) {
    const [x1, y1, x2, y2] = match.slice(1, 5).map(Number);
    if ([x1, y1, x2, y2].every((part) => Number.isFinite(part))) {
      return cubicBezier(x1 as number, y1 as number, x2 as number, y2 as number);
    }
  }
  switch (text) {
    case 'linear':
      return (t) => t;
    case 'ease-in':
      return cubicBezier(0.42, 0, 1, 1);
    case 'ease-out':
      return cubicBezier(0, 0, 0.58, 1);
    case 'ease-in-out':
      return cubicBezier(0.42, 0, 0.58, 1);
    default:
      return cubicBezier(0.25, 0.1, 0.25, 1);
  }
}

/** What the family says, in Portuguese until a provider or an instance says otherwise. */
export interface CarouselMessages {
  /** What the root is, said by a screen reader in place of "region". */
  roleDescription: string;
  /** What a slide is, said in place of "group". */
  slideRoleDescription: string;
  /** The name of a slide: `{index}` and `{count}`. */
  slide: string;
  /** The name of the slide picker. */
  indicators: string;
  /** The name of one indicator: `{page}` and `{count}`. */
  indicator: string;
  previous: string;
  next: string;
  /** The rotation control while the rotation runs. */
  stop: string;
  /** The rotation control while it does not. */
  start: string;
  /** The name of the scroller. */
  viewport: string;
  /** What is said when the reader moves to a page: `{page}` and `{count}`. */
  announce: string;
}

export const CAROUSEL_MESSAGES: CarouselMessages = {
  roleDescription: 'carrossel',
  slideRoleDescription: 'slide',
  slide: '{index} de {count}',
  indicators: 'Escolher slide',
  indicator: 'Slide {page} de {count}',
  previous: 'Slide anterior',
  next: 'Slide seguinte',
  stop: 'Parar a rotação',
  start: 'Retomar a rotação',
  viewport: 'Slides',
  announce: 'Slide {page} de {count}',
};

/** A message filled from numbers counted from one, as a reader counts. */
export function formatCarouselMessage(
  template: string,
  values: { index?: number; page?: number; count?: number },
  locale?: string,
): string {
  const number = new Intl.NumberFormat(locale);
  return template
    .replaceAll('{index}', values.index === undefined ? '' : number.format(values.index))
    .replaceAll('{page}', values.page === undefined ? '' : number.format(values.page))
    .replaceAll('{count}', values.count === undefined ? '' : number.format(values.count));
}

/**
 * Scrolls a strip of indicators — a row of thumbnails — just enough to show
 * one of them whole, and never the page around it: `scrollIntoView` moves
 * every scroller up to the document, and a rotation ticking on a strip half
 * below the fold would drag the page down with it on every page.
 */
export function revealInStrip(strip: HTMLElement, item: HTMLElement, margin = 8): void {
  const outer = strip.getBoundingClientRect();
  const inner = item.getBoundingClientRect();
  if (strip.scrollWidth > strip.clientWidth) {
    if (inner.left < outer.left + margin) strip.scrollLeft -= outer.left + margin - inner.left;
    else if (inner.right > outer.right - margin)
      strip.scrollLeft += inner.right - (outer.right - margin);
  }
  if (strip.scrollHeight > strip.clientHeight) {
    if (inner.top < outer.top + margin) strip.scrollTop -= outer.top + margin - inner.top;
    else if (inner.bottom > outer.bottom - margin)
      strip.scrollTop += inner.bottom - (outer.bottom - margin);
  }
}

/* ── The rotation ─────────────────────────────────────────────────────── */

/** Why the rotation is held for a moment, without the reader having stopped it. */
export type CarouselHold = 'hover' | 'hidden';

export interface CarouselRotationOptions {
  /** Read at each start, so a delay changed while running applies to the next page. */
  delay: () => number;
  onTick: () => void;
  /** Whether anything is holding the rotation, for `data-paused`. */
  onHeldChange?: ((held: boolean) => void) | undefined;
  /** Listens for a hidden document when given. */
  document?: Document | undefined;
}

export interface CarouselRotationHandle {
  /** Runs the clock, or keeps it running; a stopped clock starts a full delay. */
  start: () => void;
  stop: () => void;
  hold: (reason: CarouselHold) => void;
  release: (reason: CarouselHold) => void;
  /** A full delay from now, for a page that changed by another hand. */
  restart: () => void;
  running: () => boolean;
  held: () => boolean;
  destroy: () => void;
}

/**
 * The clock of a rotation. It runs while it is started and nothing holds it,
 * and a hold keeps the time that was left: a reader who hovers for a second
 * on a page two seconds from turning still has two seconds when they leave.
 * The fill of the current indicator pauses with the same hold, so the picture
 * and the clock never disagree.
 */
export function createCarouselRotation(options: CarouselRotationOptions): CarouselRotationHandle {
  let started = false;
  const holds = new Set<CarouselHold>();
  let remaining = Math.max(0, options.delay());
  let since = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const now = () => (typeof performance === 'undefined' ? Date.now() : performance.now());

  function clear() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    clear();
    if (!started || holds.size > 0) return;
    since = now();
    timer = setTimeout(() => {
      timer = null;
      remaining = Math.max(0, options.delay());
      options.onTick();
      schedule();
    }, remaining);
  }

  function consume() {
    if (timer === null) return;
    remaining = Math.max(0, remaining - (now() - since));
    clear();
  }

  const doc = options.document;
  const onVisibility = () => {
    if (doc?.visibilityState === 'hidden') handle.hold('hidden');
    else handle.release('hidden');
  };
  doc?.addEventListener('visibilitychange', onVisibility);

  const handle: CarouselRotationHandle = {
    start() {
      if (started) return;
      started = true;
      remaining = Math.max(0, options.delay());
      schedule();
    },
    stop() {
      started = false;
      clear();
      remaining = Math.max(0, options.delay());
    },
    hold(reason) {
      if (holds.has(reason)) return;
      const was = holds.size > 0;
      consume();
      holds.add(reason);
      if (!was) options.onHeldChange?.(true);
    },
    release(reason) {
      if (!holds.delete(reason)) return;
      if (holds.size === 0) {
        options.onHeldChange?.(false);
        schedule();
      }
    },
    restart() {
      remaining = Math.max(0, options.delay());
      schedule();
    },
    running: () => started && holds.size === 0,
    held: () => holds.size > 0,
    destroy() {
      clear();
      doc?.removeEventListener('visibilitychange', onVisibility);
    },
  };
  if (doc?.visibilityState === 'hidden') holds.add('hidden');
  return handle;
}

/* ── The engine ───────────────────────────────────────────────────────── */

export type CarouselSettleReason = 'scroll' | 'pointer';

export interface CarouselEngineOptions {
  orientation: () => CarouselOrientation;
  align: () => CarouselAlign;
  slidesPerMove: () => CarouselSlidesPerMove;
  transition: () => CarouselTransition;
  draggable: () => boolean;
  /** The page the binding holds, which the engine keeps in view across a resize. */
  page: () => number;
  /** The name a slide gets when the consumer gave it none, or `null` to leave it unnamed. */
  slideLabel?: ((index: number, count: number) => string | null) | undefined;
  /** The prefix of the identifier given to a slide that has none. */
  idPrefix?: string | undefined;
  onPages?: ((pages: CarouselPages, ids: string[]) => void) | undefined;
  /** The page nearest the scroll offset, while a gesture is still moving. */
  onVisualPage?: ((page: number) => void) | undefined;
  /** A gesture ended on a page: a swipe, a trackpad or a wheel (`scroll`), or a mouse drag (`pointer`). */
  onSettle?:
    ((page: number, reason: CarouselSettleReason, event: Event | undefined) => void) | undefined;
  onDraggingChange?: ((dragging: boolean) => void) | undefined;
  /** A swipe between stacked slides, `1` forward and `-1` back. */
  onSwipe?: ((delta: 1 | -1, event: PointerEvent) => void) | undefined;
  /** A press on a slide out of view, which the viewport received in its place. */
  onPeekPress?: ((slide: number, event: MouseEvent) => void) | undefined;
}

export interface CarouselEngineHandle {
  /** Reads the layout again and reports the pages. */
  measure: () => CarouselPages;
  pages: () => CarouselPages;
  /** Moves to a page: animated on the theme's motion scale, or at once. */
  scrollToPage: (page: number, options?: { animate?: boolean }) => void;
  /** Marks the slides of the current page; in `fade` that is what shows them. */
  setCurrent: (page: number) => void;
  /** The logical scroll offset. */
  offset: () => number;
  destroy: () => void;
}

function directionOf(element: Element): 'ltr' | 'rtl' {
  const view = element.ownerDocument.defaultView;
  const value = view?.getComputedStyle(element).direction;
  return value === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * The engine of one viewport. It reads the slides from the DOM every time it
 * measures, so a slide added, removed or resized is a new layout and nothing
 * the binding has to tell it about.
 */
export function createCarouselEngine(
  viewport: HTMLElement,
  options: CarouselEngineOptions,
): CarouselEngineHandle {
  const view = viewport.ownerDocument.defaultView;
  let metrics: CarouselMetrics = {
    viewport: 0,
    paddingStart: 0,
    paddingEnd: 0,
    maxScroll: 0,
    slides: [],
  };
  let pages: CarouselPages = EMPTY_PAGES;
  let animation: number | null = null;
  let programmatic = false;
  let programmaticTimer: ReturnType<typeof setTimeout> | null = null;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;
  let visual = -1;
  let dragging = false;
  let destroyed = false;
  const written = new WeakMap<Element, string>();

  const vertical = () => options.orientation() === 'vertical';

  function slides(): HTMLElement[] {
    return [...viewport.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.matches(SLIDE_SELECTOR),
    );
  }

  function offset(): number {
    if (vertical()) return viewport.scrollTop;
    return Math.abs(viewport.scrollLeft);
  }

  function setOffset(value: number) {
    if (vertical()) {
      viewport.scrollTop = value;
      return;
    }
    viewport.scrollLeft = directionOf(viewport) === 'rtl' ? -value : value;
  }

  function read(): CarouselMetrics {
    const style = view?.getComputedStyle(viewport);
    const box = viewport.getBoundingClientRect();
    const rtl = directionOf(viewport) === 'rtl';
    const scroll = offset();
    if (vertical()) {
      return {
        viewport: viewport.clientHeight,
        paddingStart: Number.parseFloat(style?.paddingTop ?? '') || 0,
        paddingEnd: Number.parseFloat(style?.paddingBottom ?? '') || 0,
        maxScroll: Math.max(0, viewport.scrollHeight - viewport.clientHeight),
        slides: slides().map((slide) => {
          const rect = slide.getBoundingClientRect();
          return { start: rect.top - box.top - viewport.clientTop + scroll, size: rect.height };
        }),
      };
    }
    return {
      viewport: viewport.clientWidth,
      paddingStart:
        Number.parseFloat(rtl ? (style?.paddingRight ?? '') : (style?.paddingLeft ?? '')) || 0,
      paddingEnd:
        Number.parseFloat(rtl ? (style?.paddingLeft ?? '') : (style?.paddingRight ?? '')) || 0,
      maxScroll: Math.max(0, viewport.scrollWidth - viewport.clientWidth),
      slides: slides().map((slide) => {
        const rect = slide.getBoundingClientRect();
        const start = rtl ? box.right - rect.right : rect.left - box.left;
        return { start: start + scroll, size: rect.width };
      }),
    };
  }

  function writeInView() {
    const list = slides();
    const inView =
      options.transition() === 'fade'
        ? list.map((slide) => slide.hasAttribute('data-current'))
        : slidesInView(metrics, offset());
    for (const [index, slide] of list.entries()) {
      const visible = inView[index] ?? false;
      slide.toggleAttribute('data-inview', visible);
      if (visible) slide.removeAttribute('inert');
      else slide.setAttribute('inert', '');
    }
  }

  function measure(): CarouselPages {
    metrics = read();
    pages =
      options.transition() === 'fade'
        ? {
            positions: metrics.slides.map(() => 0),
            starts: metrics.slides.map((_, index) => index),
            pageOfSlide: metrics.slides.map((_, index) => index),
          }
        : carouselPages(metrics, {
            align: options.align(),
            slidesPerMove: options.slidesPerMove(),
          });

    const list = slides();
    const starts = new Set(pages.starts);
    const ids: string[] = [];
    for (const [index, slide] of list.entries()) {
      slide.toggleAttribute('data-snap', starts.has(index));
      if (slide.id === '') slide.id = `${options.idPrefix ?? 'slotted-carousel-slide-'}${index}`;
      ids.push(slide.id);
      const label = options.slideLabel?.(index, list.length) ?? null;
      const current = slide.getAttribute('aria-label');
      const owned =
        slide.hasAttribute('aria-labelledby') ||
        (current !== null && current !== written.get(slide));
      if (label !== null && !owned) {
        slide.setAttribute('aria-label', label);
        written.set(slide, label);
      }
    }
    options.onPages?.(pages, ids);
    return pages;
  }

  function cancelAnimation() {
    if (animation !== null) view?.cancelAnimationFrame(animation);
    animation = null;
    viewport.removeAttribute('data-animating');
  }

  function markProgrammatic() {
    programmatic = true;
    if (programmaticTimer !== null) clearTimeout(programmaticTimer);
    programmaticTimer = setTimeout(() => {
      programmatic = false;
      programmaticTimer = null;
      writeInView();
    }, 120);
  }

  function motion(): { duration: number; easing: (t: number) => number } {
    const style = view?.getComputedStyle(viewport);
    return {
      duration: parseCssTime(style?.getPropertyValue('--_scroll-duration') ?? ''),
      easing: parseCssEasing(style?.getPropertyValue('--_scroll-easing') ?? ''),
    };
  }

  function scrollToPage(page: number, scrollOptions: { animate?: boolean } = {}) {
    if (options.transition() === 'fade') return;
    const target = pages.positions[page];
    if (target === undefined) return;
    visual = page;
    cancelAnimation();
    const from = offset();
    const { duration, easing } = motion();
    if (
      scrollOptions.animate === false ||
      duration <= 1 ||
      Math.abs(target - from) < EPSILON ||
      view === null
    ) {
      markProgrammatic();
      setOffset(target);
      writeInView();
      return;
    }
    programmatic = true;
    viewport.setAttribute('data-animating', '');
    const begin = view.performance.now();
    const frame = (time: number) => {
      const progress = Math.min(1, (time - begin) / duration);
      setOffset(from + (target - from) * easing(progress));
      if (progress < 1) {
        animation = view.requestAnimationFrame(frame);
        return;
      }
      animation = null;
      viewport.removeAttribute('data-animating');
      markProgrammatic();
      writeInView();
    };
    animation = view.requestAnimationFrame(frame);
  }

  function setCurrent(page: number) {
    const list = slides();
    for (const [index, slide] of list.entries()) {
      slide.toggleAttribute('data-current', pages.pageOfSlide[index] === page);
    }
    if (options.transition() === 'fade') writeInView();
  }

  function settle() {
    settleTimer = null;
    if (dragging || programmatic || options.transition() === 'fade') return;
    const page = nearestPage(pages.positions, offset());
    writeInView();
    if (page !== -1) options.onSettle?.(page, 'scroll', undefined);
  }

  const onScroll = () => {
    /* The scroll the engine's own movement caused is not a gesture. */
    if (programmatic) return;
    const page = nearestPage(pages.positions, offset());
    if (page !== visual && page !== -1) {
      visual = page;
      options.onVisualPage?.(page);
    }
    if (settleTimer !== null) clearTimeout(settleTimer);
    /* `scrollend` settles where it is supported; the timer is the fallback for an engine without it. */
    settleTimer = setTimeout(settle, 150);
  };

  const onScrollEnd = () => {
    if (settleTimer !== null) clearTimeout(settleTimer);
    settle();
  };

  /** A reader's own gesture interrupts the engine's movement. */
  const onInterrupt = () => {
    if (animation === null) return;
    cancelAnimation();
    programmatic = false;
  };

  /* ── The mouse drag ── */

  let press: {
    pointer: number;
    x: number;
    y: number;
    offset: number;
    moved: boolean;
    samples: { at: number; value: number }[];
  } | null = null;
  let suppressClick = false;

  function axisDelta(event: PointerEvent): number {
    if (press === null) return 0;
    if (vertical()) return event.clientY - press.y;
    const delta = event.clientX - press.x;
    return directionOf(viewport) === 'rtl' ? -delta : delta;
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    if (options.transition() === 'fade') {
      press = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        offset: 0,
        moved: false,
        samples: [],
      };
      return;
    }
    /* A press on a link or a button inside a slide drags too; the click after a drag is cancelled. */
    if (event.pointerType !== 'mouse' || !options.draggable()) return;
    onInterrupt();
    press = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offset: offset(),
      moved: false,
      samples: [{ at: event.timeStamp, value: 0 }],
    };
  };

  const onPointerMove = (event: PointerEvent) => {
    if (press === null || event.pointerId !== press.pointer || options.transition() === 'fade')
      return;
    const delta = axisDelta(event);
    if (!press.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      press.moved = true;
      dragging = true;
      viewport.setPointerCapture?.(event.pointerId);
      options.onDraggingChange?.(true);
    }
    event.preventDefault();
    const next = Math.min(Math.max(press.offset - delta, 0), metrics.maxScroll);
    setOffset(next);
    press.samples.push({ at: event.timeStamp, value: delta });
    if (press.samples.length > 6) press.samples.shift();
    const page = nearestPage(pages.positions, next);
    if (page !== visual && page !== -1) {
      visual = page;
      options.onVisualPage?.(page);
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (press === null || event.pointerId !== press.pointer) return;
    const current = press;
    press = null;

    if (options.transition() === 'fade') {
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      const along = vertical() ? dy : directionOf(viewport) === 'rtl' ? -dx : dx;
      const across = vertical() ? dx : dy;
      if (Math.abs(along) >= SWIPE_THRESHOLD && Math.abs(along) > Math.abs(across)) {
        suppressClick = true;
        options.onSwipe?.(along < 0 ? 1 : -1, event);
      }
      return;
    }

    if (!current.moved) return;
    dragging = false;
    suppressClick = true;
    viewport.releasePointerCapture?.(event.pointerId);
    options.onDraggingChange?.(false);

    /* The direction of release decides where a short flick goes; a long drag lands on the nearest page. */
    const first = current.samples[0];
    const last = current.samples.at(-1);
    const velocity =
      first !== undefined && last !== undefined && last.at > first.at
        ? (last.value - first.value) / (last.at - first.at)
        : 0;
    const start = nearestPage(pages.positions, current.offset);
    let page = nearestPage(pages.positions, offset());
    if (page === start && Math.abs(velocity) > 0.3) {
      page = stepPage(start, velocity < 0 ? 1 : -1, pages.positions.length, false);
    }
    scrollToPage(page, { animate: true });
    options.onSettle?.(page, 'pointer', event);
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const onClick = (event: MouseEvent) => {
    if (event.target !== viewport) return;
    const list = slides();
    for (const [index, slide] of list.entries()) {
      if (!slide.hasAttribute('inert')) continue;
      const rect = slide.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        options.onPeekPress?.(index, event);
        return;
      }
    }
  };

  const onDragStart = (event: DragEvent) => {
    if (options.draggable()) event.preventDefault();
  };

  viewport.addEventListener('scroll', onScroll, { passive: true });
  viewport.addEventListener('scrollend', onScrollEnd);
  viewport.addEventListener('wheel', onInterrupt, { passive: true });
  viewport.addEventListener('touchstart', onInterrupt, { passive: true });
  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);
  viewport.addEventListener('click', onClickCapture, true);
  viewport.addEventListener('click', onClick);
  viewport.addEventListener('dragstart', onDragStart);

  const resize =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          if (destroyed) return;
          measure();
          const page = Math.min(options.page(), pages.positions.length - 1);
          if (page >= 0 && animation === null && !dragging) scrollToPage(page, { animate: false });
          else writeInView();
        });
  resize?.observe(viewport);

  const mutation =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
          if (destroyed) return;
          for (const slide of slides()) resize?.observe(slide);
          measure();
          setCurrent(options.page());
          writeInView();
        });
  mutation?.observe(viewport, { childList: true });
  for (const slide of slides()) resize?.observe(slide);

  measure();

  return {
    measure,
    pages: () => pages,
    scrollToPage,
    setCurrent,
    offset,
    destroy() {
      destroyed = true;
      cancelAnimation();
      if (settleTimer !== null) clearTimeout(settleTimer);
      if (programmaticTimer !== null) clearTimeout(programmaticTimer);
      resize?.disconnect();
      mutation?.disconnect();
      viewport.removeEventListener('scroll', onScroll);
      viewport.removeEventListener('scrollend', onScrollEnd);
      viewport.removeEventListener('wheel', onInterrupt);
      viewport.removeEventListener('touchstart', onInterrupt);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', onPointerUp);
      viewport.removeEventListener('pointercancel', onPointerUp);
      viewport.removeEventListener('click', onClickCapture, true);
      viewport.removeEventListener('click', onClick);
      viewport.removeEventListener('dragstart', onDragStart);
    },
  };
}
