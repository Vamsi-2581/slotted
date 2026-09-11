/**
 * The scroll mechanics of a header whose area collapses when the reader
 * scrolls past it and comes back when they return — SAP Fiori's Dynamic
 * Page, as `page-header` rebuilds it on one sticky root.
 *
 * The stylesheet does the moving. The root is `position: sticky` with a
 * negative offset the size of the header area, so scrolling takes the area
 * under the title and leaves the title where it is. What the stylesheet
 * cannot know is measured here and handed to it:
 *
 * - `--slotted-page-header-collapse`, the area's height, on the root;
 * - `--slotted-page-sticky-top`, the height of the chrome that stays, on the
 *   scroll container, so a section's sticky header and a table's sticky column
 *   header stop under it;
 * - whether the scroll has passed the area — `scrolled`, a fact — and whether
 *   the area was shown whole in place after it had — `revealed`, a state.
 *
 * The two bindings own the `expanded` and `pinned` values, because a request
 * with a reason and a cancel is theirs to route. This module tells them when a
 * scroll asks for a move, and they tell it when a value moved and why.
 *
 * Nothing here is framework-specific: an IntersectionObserver, two
 * ResizeObservers, a scroll listener and a few numbers.
 */

export type StickyHeaderCollapse = 'scroll' | 'manual';

export interface StickyHeaderState {
  expanded: boolean;
  pinned: boolean;
  collapse: StickyHeaderCollapse;
}

export interface StickyHeaderOptions {
  /** The header's root: the element that sticks. */
  root: HTMLElement;
  /** The area that collapses, once it exists. */
  area: () => HTMLElement | null;
  /** The parts that stay at the top whatever the area does: the title area and the tabs. */
  chrome: () => HTMLElement[];
  /** The values the binding owns, read whenever a decision is taken. */
  state: () => StickyHeaderState;
  /** The measured fact changed. The binding writes `data-scrolled`. */
  onScrolled: (scrolled: boolean) => void;
  /** The revealed state changed. The binding writes `data-revealed`. */
  onRevealed: (revealed: boolean) => void;
  /** A scroll asks `expanded` to move. The binding requests it with the reason `scroll`. */
  onScrollRequest: (expanded: boolean) => void;
}

export interface StickyHeaderHandle {
  /** Whether the scroll has passed the area. */
  scrolled: () => boolean;
  /** Whether the area is shown whole in place although the scroll has passed it. */
  revealed: () => boolean;
  /** The element the header scrolls inside, or `null` for the viewport. */
  scroller: () => HTMLElement | null;
  /** Whether the root is stuck at the top of its scroller with the scroll past its rest position. */
  stuck: () => boolean;
  /**
   * `expanded` moved. `by` says who moved it: the toggle (`control`), the pin
   * (`pin`), the application (`programmatic`) or this module (`scroll`).
   * Expanding by the control or by the application while the scroll has passed
   * the area reveals it in place; collapsing ends any reveal.
   */
  expandedChanged: (expanded: boolean, by: 'control' | 'pin' | 'programmatic' | 'scroll') => void;
  /** `pinned` moved. Letting go while stuck reveals rather than dropping the root. */
  pinnedChanged: (pinned: boolean) => void;
  /** Measures again and republishes, after something outside moved. */
  refresh: () => void;
  destroy: () => void;
}

/** The custom property the root reads for its negative sticky offset. */
export const COLLAPSE_PROPERTY = '--slotted-page-header-collapse';
/** The custom property the scroller carries for everything that sticks under the chrome. */
export const STICKY_TOP_PROPERTY = '--slotted-page-sticky-top';

/**
 * A reveal ends on the next scroll of more than this many pixels. Two, because
 * a sub-pixel scroll event is what a trackpad emits at rest and a layout
 * change can move the scroll position by a fraction on its own.
 */
export const REVEAL_SCROLL_THRESHOLD = 2;

/**
 * The header area does not re-open in place when it is taller than this share
 * of the scrollport: expanding scrolls to the top instead. sap.f's
 * `_headerBiggerThanAllowedToBeExpandedInTitleArea` takes the same rule.
 */
export const TALL_AREA_FRACTION = 0.6;

/**
 * The nearest ancestor that scrolls along the block axis, or `null` for the
 * viewport. `overflow-y: overlay` is the legacy WebKit spelling of `auto`.
 */
export function findScrollParent(element: HTMLElement): HTMLElement | null {
  const view = element.ownerDocument.defaultView;
  if (view === null) return null;
  let node = element.parentElement;
  while (node !== null && node !== element.ownerDocument.body) {
    const overflow = view.getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay') return node;
    node = node.parentElement;
  }
  return null;
}

const height = (element: HTMLElement | null | undefined) => element?.offsetHeight ?? 0;

export function createStickyHeader(options: StickyHeaderOptions): StickyHeaderHandle {
  const { root } = options;
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  const scroller = findScrollParent(root);
  /** Where the sticky-top property is written: the scroller, or the document. */
  const target = scroller ?? doc.documentElement;
  const scrollSource: EventTarget | null = scroller ?? view;

  let scrolled = false;
  let revealed = false;
  /** Who collapsed the area last, which decides whether a return scroll re-opens it. */
  let collapsedBy: 'control' | 'scroll' | null = null;
  let lastTop = scrollTop();
  let frame = 0;
  let destroyed = false;

  let intersections: IntersectionObserver | undefined;
  /** The margin the observer was built with, so a change in the title re-builds it. */
  let observedAbove = -1;

  /**
   * What stands between the root's top edge and the area: the title area, and
   * whatever the binding put above it. Stuck, the root stops at minus the
   * area's height, so the area's bottom edge lands exactly under the title —
   * inside the scrollport, and covered. An observer over the whole scrollport
   * therefore never reports it out; one whose top edge is moved down by the
   * title's height does, and the extra pixel keeps an edge-adjacent area from
   * counting as intersecting.
   */
  function aboveArea() {
    const area = options.area();
    if (area === null) return 0;
    return Math.max(
      0,
      Math.round(area.getBoundingClientRect().top - root.getBoundingClientRect().top),
    );
  }

  function scrollTop() {
    return scroller?.scrollTop ?? view?.scrollY ?? 0;
  }

  function scrollportHeight() {
    return scroller?.clientHeight ?? view?.innerHeight ?? 0;
  }

  function stuck() {
    const rootTop = root.getBoundingClientRect().top;
    /* The sticky edge is the scroller's padding box: a bordered scroller
       holds the root `clientTop` pixels below its border box. */
    const top = scroller ? scroller.getBoundingClientRect().top + scroller.clientTop : 0;
    return Math.abs(rootTop - top) < 1 && scrollTop() > 0;
  }

  function setScrolled(next: boolean) {
    if (next === scrolled) return;
    scrolled = next;
    options.onScrolled(next);
  }

  function setRevealed(next: boolean) {
    if (next === revealed) return;
    revealed = next;
    options.onRevealed(next);
  }

  /**
   * Publishes both properties, coalesced into one frame. The collapse
   * transition changes the area's height on every frame, and a property
   * written on the scroll container invalidates its whole subtree — so the
   * write waits for the frame and happens once per frame at most.
   */
  function publish() {
    if (destroyed) return;
    const { collapse, pinned } = options.state();
    const area = height(options.area());
    root.style.setProperty(COLLAPSE_PROPERTY, `${area}px`);
    const chrome = options.chrome().reduce((sum, part) => sum + height(part), 0);
    const held = pinned || revealed || collapse === 'manual';
    target.style.setProperty(STICKY_TOP_PROPERTY, `${chrome + (held ? area : 0)}px`);
    /* The title grew or shrank: the observer's margin is stale. */
    if (aboveArea() !== observedAbove) observeArea();
  }

  function schedule() {
    if (frame !== 0 || view === null) return;
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      publish();
    });
  }

  /* ── Sizes ─────────────────────────────────────────────────────────────── */

  const sizes = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
  function observeSizes() {
    if (sizes === undefined) return;
    sizes.disconnect();
    const area = options.area();
    if (area !== null) sizes.observe(area);
    for (const part of options.chrome()) sizes.observe(part);
  }
  observeSizes();
  publish();

  /* ── The fact ──────────────────────────────────────────────────────────── */

  /**
   * Stuck at the negative offset, the area is entirely above the scrollport
   * and the observer reports it out. While revealed the report is ignored: the
   * root at 0 brings the area back into view and the observer would otherwise
   * undo the reveal it just caused. While pinned the area is always in view
   * and the fact is simply false.
   */
  function onIntersection(entries: IntersectionObserverEntry[]) {
    const entry = entries[entries.length - 1];
    if (entry === undefined || destroyed) return;
    const { collapse, expanded, pinned } = options.state();
    if (collapse === 'manual') return;
    if (revealed) return;
    const out = !entry.isIntersecting;
    setScrolled(out);
    if (out) {
      if (expanded && !pinned) {
        collapsedBy = 'scroll';
        options.onScrollRequest(false);
      }
      return;
    }
    if (!expanded && collapsedBy === 'scroll') options.onScrollRequest(true);
  }

  function observeArea() {
    intersections?.disconnect();
    intersections = undefined;
    observedAbove = -1;
    const area = options.area();
    if (area === null || typeof IntersectionObserver === 'undefined') return;
    if (options.state().collapse === 'manual') return;
    observedAbove = aboveArea();
    intersections = new IntersectionObserver(onIntersection, {
      root: scroller,
      rootMargin: `-${observedAbove + 1}px 0px 0px 0px`,
      threshold: 0,
    });
    intersections.observe(area);
  }
  observeArea();

  /* ── The reveal ends on the next scroll ────────────────────────────────── */

  function onScroll() {
    const top = scrollTop();
    const delta = top - lastTop;
    lastTop = top;
    if (!revealed || Math.abs(delta) <= REVEAL_SCROLL_THRESHOLD) return;
    setRevealed(false);
    collapsedBy = 'scroll';
    options.onScrollRequest(false);
  }
  scrollSource?.addEventListener('scroll', onScroll, { passive: true });

  /* ── What the binding tells us ─────────────────────────────────────────── */

  function expandedChanged(expanded: boolean, by: 'control' | 'pin' | 'programmatic' | 'scroll') {
    if (expanded) {
      const { pinned } = options.state();
      if (by !== 'scroll' && !pinned && scrolled) {
        const area = height(options.area());
        if (area > scrollportHeight() * TALL_AREA_FRACTION) {
          /* Too tall to hold under the title: go to the top instead. */
          if (scroller !== null) scroller.scrollTo({ top: 0 });
          else view?.scrollTo({ top: 0 });
        } else {
          setRevealed(true);
        }
      }
      if (by !== 'scroll' && !scrolled) collapsedBy = null;
      if (by === 'scroll') collapsedBy = null;
    } else {
      setRevealed(false);
      if (by !== 'scroll') collapsedBy = 'control';
    }
    lastTop = scrollTop();
    schedule();
  }

  function pinnedChanged(pinned: boolean) {
    if (pinned) {
      setRevealed(false);
    } else if (stuck() && options.state().expanded) {
      /* Let go while stuck: reveal rather than drop the root under the reader. */
      if (!scrolled) setScrolled(true);
      setRevealed(true);
      lastTop = scrollTop();
    }
    schedule();
  }

  function refresh() {
    observeSizes();
    observeArea();
    schedule();
  }

  function destroy() {
    destroyed = true;
    if (frame !== 0) view?.cancelAnimationFrame(frame);
    sizes?.disconnect();
    intersections?.disconnect();
    scrollSource?.removeEventListener('scroll', onScroll);
    root.style.removeProperty(COLLAPSE_PROPERTY);
    target.style.removeProperty(STICKY_TOP_PROPERTY);
  }

  return {
    scrolled: () => scrolled,
    revealed: () => revealed,
    scroller: () => scroller,
    stuck,
    expandedChanged,
    pinnedChanged,
    refresh,
    destroy,
  };
}
