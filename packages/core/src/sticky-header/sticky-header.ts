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
/** How long after a reveal begins a small scroll is taken for an anchoring correction, in milliseconds. */
export const REVEAL_SETTLE_WINDOW = 400;
/** The largest scroll, in pixels, that scroll anchoring is taken to have made on its own. */
export const ANCHOR_CORRECTION = 24;
/** How long an armed fold waits for the area to shrink before the transition is given back, in milliseconds. */
export const FOLD_TIMEOUT = 600;

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
  /**
   * The root is travelling back to its offset after a reveal ended, and the
   * area is still in the scrollport on the way: an "in" report during that
   * travel is the reveal's own geometry, not a scroll back. Honouring it set
   * `scrolled` false, the area's track went to `0fr`, the content shortened,
   * the scroll position moved, the observer reported again, and the header
   * expanded and collapsed without end. The report is ignored until the area
   * is out again or the reader scrolls up.
   */
  let settling = false;
  /**
   * When the last reveal began. The title grows by a few pixels as the header
   * expands, everything under it moves by as much, and scroll anchoring moves
   * the scroll position by the same few pixels to keep the content still —
   * a scroll event the reader did not make, arriving one or two frames after
   * the reveal. Inside that window a small delta is the correction, not a
   * scroll, and the reveal holds.
   */
  let revealedAt = 0;
  /**
   * A fold the engine armed while the page was scrolled. The area's track
   * going to `0fr` takes its height out of the flow above the reader, and
   * everything under it would jump up by that much — the jump the stylesheet
   * warns about. So the fold is instant, and as it lands the scroll position
   * moves up by what was lost, before paint, and nothing on screen moves.
   */
  let folding: { from: number; timer: ReturnType<typeof setTimeout> } | null = null;
  /** The area's height as last published, before any fold under way. */
  let measuredArea = 0;
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
    if (next) revealedAt = now();
    options.onRevealed(next);
  }

  function now() {
    return typeof performance === 'undefined' ? Date.now() : performance.now();
  }

  function setScrollTop(next: number) {
    if (scroller !== null) scroller.scrollTop = next;
    else view?.scrollTo({ top: next });
    lastTop = next;
  }

  function armFold() {
    const area = options.area();
    if (area === null || scrollTop() <= 0) return;
    if (folding !== null) clearTimeout(folding.timer);
    /* What the flow will lose: the height last published, because once the
       transition is cancelled the area measures as already folded. */
    const from = Math.max(measuredArea, height(area));
    /* `transition-property: none` rather than a zero duration: a transition
       that a forced layout already started keeps its own duration, and only
       a property it no longer matches cancels it. The root's offset is
       cancelled with it and the collapse offset goes to nothing in the same
       step, so the root does not set off for the old offset and slide back. */
    area.style.transitionProperty = 'none';
    root.style.transitionProperty = 'none';
    root.style.setProperty(COLLAPSE_PROPERTY, '0px');
    folding = {
      from,
      /* A fold that never lands — the binding kept the area — gives the transition back. */
      timer: setTimeout(() => releaseFold(), FOLD_TIMEOUT),
    };
  }

  function releaseFold() {
    if (folding === null) return;
    clearTimeout(folding.timer);
    folding = null;
    options.area()?.style.removeProperty('transition-property');
    root.style.removeProperty('transition-property');
  }

  /** Runs in the size observer's callback: after layout and before paint. */
  function landFold() {
    if (folding === null) return;
    const current = height(options.area());
    const lost = folding.from - current;
    /* Whatever the flow lost this frame, the scroll gives back — every frame,
       so a fold that still transitions somewhere compensates step by step,
       and the fold is over once the area is at nothing. */
    if (lost > 0) {
      setScrollTop(Math.max(0, scrollTop() - lost));
      folding.from = current;
    }
    if (current === 0) releaseFold();
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
    if (folding === null) measuredArea = area;
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

  const sizes =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => {
          landFold();
          schedule();
        });
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
    /* An area the control folded to nothing has no box to report on, and an
       area cannot have been scrolled past while nothing is scrolled. */
    if (entry.boundingClientRect?.height === 0) return;
    const out = !entry.isIntersecting;
    if (out && scrollTop() <= 0) return;
    if (settling) {
      if (!out) return;
      settling = false;
    }
    const wasScrolled = scrolled;
    if (!out && wasScrolled && !expanded && collapsedBy !== 'scroll') {
      /* The control folded it while scrolled and the reader is back: the
         area folds here rather than re-opening, with the scroll compensated. */
      armFold();
    }
    setScrolled(out);
    if (out) {
      /**
       * Only the crossing asks the area to collapse. The observer is rebuilt
       * whenever the title changes height, and its first report repeats the
       * fact it already knew; in Angular that report landed between the
       * control setting `expanded` and the binding telling the engine, and
       * the repeat asked the area to close again before it had opened.
       */
      if (!wasScrolled && expanded && !pinned) {
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
    if (settling && delta < 0) {
      /* The reader is scrolling up through the travel: the observer decides again. */
      settling = false;
      observeArea();
      return;
    }
    if (!revealed) return;
    if (delta < 0) {
      /**
       * Scrolling up keeps the reveal: the reader is heading where the area
       * shows anyway, and ending it here snapped the title and re-opened it
       * a frame later. Once the root leaves the scroller's edge the area is
       * at its natural place, and the reveal is over without anything moving.
       */
      if (scrollTop() > 0 && stuck()) return;
      revealed = false;
      options.onRevealed(false);
      setScrolled(false);
      collapsedBy = null;
      return;
    }
    if (delta <= REVEAL_SCROLL_THRESHOLD) return;
    if (now() - revealedAt < REVEAL_SETTLE_WINDOW && delta <= ANCHOR_CORRECTION) return;
    setRevealed(false);
    if (scrolled) settling = true;
    else armFold(); /* Revealed from a fold: it folds again, compensated. */
    collapsedBy = 'scroll';
    options.onScrollRequest(false);
  }
  scrollSource?.addEventListener('scroll', onScroll, { passive: true });

  /* ── What the binding tells us ─────────────────────────────────────────── */

  function expandedChanged(expanded: boolean, by: 'control' | 'pin' | 'programmatic' | 'scroll') {
    if (expanded) {
      const { pinned } = options.state();
      /* Scrolled past the area, or stuck with the area folded: open in place. */
      if (by !== 'scroll' && !pinned && (scrolled || stuck())) {
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
      if (revealed && scrolled) settling = true;
      else if (!scrolled) armFold();
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
    releaseFold();
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
