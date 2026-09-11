import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  COLLAPSE_PROPERTY,
  createStickyHeader,
  findScrollParent,
  STICKY_TOP_PROPERTY,
} from './sticky-header';
import type { StickyHeaderHandle, StickyHeaderState } from './sticky-header';

/**
 * The observers are stubs the test drives by hand, because what is under test
 * is the rule — when a scroll collapses, when a return re-opens, when a press
 * reveals — and not a layout engine. Heights are stated on the elements.
 */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly callback: IntersectionObserverCallback;
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  constructor(callback: IntersectionObserverCallback, init?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = init?.root ?? null;
    this.rootMargin = init?.rootMargin ?? '';
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  report(isIntersecting: boolean, height = 1) {
    this.callback(
      [{ isIntersecting, boundingClientRect: { height } } as IntersectionObserverEntry],
      this as never,
    );
  }
}

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  fire() {
    this.callback([], this as never);
  }
}

function sized(element: HTMLElement, height: number) {
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: height });
  return element;
}

function scene({ scrollerHeight = 400 }: { scrollerHeight?: number } = {}) {
  const scroller = document.createElement('div');
  scroller.style.overflowY = 'auto';
  Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: scrollerHeight });
  const root = document.createElement('header');
  const title = sized(document.createElement('div'), 60);
  const area = sized(document.createElement('div'), 120);
  const tabs = sized(document.createElement('div'), 40);
  root.append(title, area, tabs);
  scroller.append(root);
  document.body.append(scroller);

  const state: StickyHeaderState = { expanded: true, pinned: false, collapse: 'scroll' };
  const onScrolled = vi.fn();
  const onRevealed = vi.fn();
  const onScrollRequest = vi.fn((expanded: boolean) => {
    state.expanded = expanded;
    handle.expandedChanged(expanded, 'scroll');
  });
  const handle: StickyHeaderHandle = createStickyHeader({
    root,
    area: () => area,
    chrome: () => [title, tabs],
    state: () => state,
    onScrolled,
    onRevealed,
    onScrollRequest,
  });
  const io = FakeIntersectionObserver.instances.at(-1) as FakeIntersectionObserver;
  return {
    area,
    handle,
    io,
    onRevealed,
    onScrollRequest,
    onScrolled,
    root,
    scroller,
    state,
    title,
  };
}

describe('createStickyHeader', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    FakeIntersectionObserver.instances = [];
    FakeResizeObserver.instances = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('finds the element the header scrolls inside', () => {
    const { root, scroller, handle } = scene();
    expect(findScrollParent(root)).toBe(scroller);
    expect(handle.scroller()).toBe(scroller);
    handle.destroy();
  });

  /**
   * Stuck, the root stops at minus the area's height and the area's bottom
   * edge lands exactly under the title, inside the scrollport and covered. In
   * Chrome an observer over the whole scrollport kept reporting it in, and the
   * header never snapped in Storybook while every fake said it did. The
   * observer's top edge therefore moves down by what stands above the area.
   */
  it('observes the area under a top margin the size of what stands above it', () => {
    const { area, io, root, handle } = scene();
    /* jsdom lays nothing out: the root and the area share a top, so the margin is the one pixel. */
    expect(io.rootMargin).toBe('-1px 0px 0px 0px');

    let top = 60;
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(() => ({ top: 0 }) as DOMRect);
    vi.spyOn(area, 'getBoundingClientRect').mockImplementation(() => ({ top }) as DOMRect);
    handle.refresh();
    expect((FakeIntersectionObserver.instances.at(-1) as FakeIntersectionObserver).rootMargin).toBe(
      '-61px 0px 0px 0px',
    );

    /* The title wrapped to a second line: the size observer fires, the margin follows. */
    top = 84;
    const built = FakeIntersectionObserver.instances.length;
    (FakeResizeObserver.instances.at(-1) as FakeResizeObserver).callback([], {} as ResizeObserver);
    expect(FakeIntersectionObserver.instances.length).toBe(built + 1);
    expect((FakeIntersectionObserver.instances.at(-1) as FakeIntersectionObserver).rootMargin).toBe(
      '-85px 0px 0px 0px',
    );
    handle.destroy();
  });

  it('publishes the collapse height on the root and the chrome height on the scroller', () => {
    const { handle, root, scroller } = scene();
    expect(root.style.getPropertyValue(COLLAPSE_PROPERTY)).toBe('120px');
    expect(scroller.style.getPropertyValue(STICKY_TOP_PROPERTY)).toBe('100px');
    handle.destroy();
    expect(root.style.getPropertyValue(COLLAPSE_PROPERTY)).toBe('');
    expect(scroller.style.getPropertyValue(STICKY_TOP_PROPERTY)).toBe('');
  });

  it('observes the area against the scroller rather than the viewport', () => {
    const { io, scroller, handle } = scene();
    expect(io.root).toBe(scroller);
    handle.destroy();
  });

  /** The scroll passes the area: the fact flips and expanded is asked to move. */
  it('collapses with the reason scroll when the area leaves, and re-opens when it returns', () => {
    const { handle, io, onScrollRequest, onScrolled, scroller, state } = scene();

    /* The reader has scrolled: only then can the area have left. */
    scroller.scrollTop = 300;
    io.report(false);
    expect(onScrolled).toHaveBeenLastCalledWith(true);
    expect(onScrollRequest).toHaveBeenLastCalledWith(false);
    expect(state.expanded).toBe(false);

    io.report(true);
    expect(onScrolled).toHaveBeenLastCalledWith(false);
    expect(onScrollRequest).toHaveBeenLastCalledWith(true);
    expect(state.expanded).toBe(true);
    handle.destroy();
  });

  /** Collapsed by the control, a return scroll does not re-open the area. */
  it('leaves an area the control collapsed alone when the scroll returns', () => {
    const { handle, io, onScrollRequest, state } = scene();
    state.expanded = false;
    handle.expandedChanged(false, 'control');

    io.report(false);
    io.report(true);
    expect(onScrollRequest).not.toHaveBeenCalled();
    handle.destroy();
  });

  /** Expanding by the control while scrolled past reveals in place. */
  it('reveals the area in place when the control opens it while the scroll has passed it', () => {
    const { handle, io, onRevealed, onScrolled, scroller, state } = scene();
    /* The reader has scrolled: only then can the area have left. */
    scroller.scrollTop = 300;
    io.report(false);
    onScrolled.mockClear();

    state.expanded = true;
    handle.expandedChanged(true, 'control');
    expect(onRevealed).toHaveBeenLastCalledWith(true);
    expect(handle.revealed()).toBe(true);

    /* The root at 0 brings the area back into view; the report is ignored. */
    io.report(true);
    expect(onScrolled).not.toHaveBeenCalled();
    expect(handle.scrolled()).toBe(true);
    handle.destroy();
  });

  /** A reveal ends on the next scroll, with the reason scroll. */
  it('ends a reveal on the next scroll of more than two pixels', () => {
    const { handle, io, onRevealed, onScrollRequest, scroller, state } = scene();
    /* The reader has scrolled: only then can the area have left. */
    scroller.scrollTop = 300;
    io.report(false);
    state.expanded = true;
    handle.expandedChanged(true, 'control');
    onScrollRequest.mockClear();

    scroller.scrollTop = 301;
    scroller.dispatchEvent(new Event('scroll'));
    expect(onScrollRequest).not.toHaveBeenCalled();

    scroller.scrollTop = 340;
    scroller.dispatchEvent(new Event('scroll'));
    expect(onRevealed).toHaveBeenLastCalledWith(false);
    expect(onScrollRequest).toHaveBeenLastCalledWith(false);
    handle.destroy();
  });

  /** Pinned, the chrome that stays includes the area. */
  it('counts the area into the chrome while pinned or revealed', () => {
    const { handle, scroller, state } = scene();
    state.pinned = true;
    handle.pinnedChanged(true);
    expect(scroller.style.getPropertyValue(STICKY_TOP_PROPERTY)).toBe('220px');
    state.pinned = false;
    handle.pinnedChanged(false);
    expect(scroller.style.getPropertyValue(STICKY_TOP_PROPERTY)).toBe('100px');
    handle.destroy();
  });

  /** A header taller than six tenths of the scrollport goes to the top instead of revealing. */
  it('scrolls to the top rather than revealing an area taller than the scrollport allows', () => {
    const { area, handle, io, onRevealed, scroller, state } = scene({ scrollerHeight: 150 });
    sized(area, 120);
    scroller.scrollTo = vi.fn();
    /* The reader has scrolled: only then can the area have left. */
    scroller.scrollTop = 300;
    io.report(false);
    state.expanded = true;
    handle.expandedChanged(true, 'control');
    expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 0 });
    expect(onRevealed).not.toHaveBeenCalled();
    handle.destroy();
  });

  /** Under manual collapse no scroll ever moves expanded. */
  /**
   * Scrolled past, revealed by the control, collapsed by the control: the root
   * travels back to its offset and the observer sees the area in on the way.
   * Honoured, that report emptied the area, moved the scroll and started a
   * loop of expand and collapse. It is ignored until the area is out again.
   */
  it('ignores the area coming into view while the root travels back after a reveal', () => {
    const { handle, io, onScrollRequest, onScrolled, scroller, state } = scene();
    /* The reader has scrolled: only then can the area have left. */
    scroller.scrollTop = 300;
    io.report(false);
    expect(state.expanded).toBe(false);
    state.expanded = true;
    handle.expandedChanged(true, 'control');
    expect(handle.revealed()).toBe(true);

    state.expanded = false;
    handle.expandedChanged(false, 'control');
    expect(handle.revealed()).toBe(false);
    onScrolled.mockClear();
    onScrollRequest.mockClear();

    io.report(true);
    expect(onScrolled).not.toHaveBeenCalled();
    expect(onScrollRequest).not.toHaveBeenCalled();
    expect(handle.scrolled()).toBe(true);

    /* Out again: the travel is over and the fact is reported as before. */
    io.report(false);
    io.report(true);
    expect(onScrolled).toHaveBeenLastCalledWith(false);
    handle.destroy();
  });

  it('lets a scroll up through the travel decide again', () => {
    const { handle, io, scroller, state } = scene();
    scroller.scrollTop = 400;
    scroller.dispatchEvent(new Event('scroll'));
    io.report(false);
    state.expanded = true;
    handle.expandedChanged(true, 'control');
    state.expanded = false;
    handle.expandedChanged(false, 'control');
    const built = FakeIntersectionObserver.instances.length;

    scroller.scrollTop = 100;
    scroller.dispatchEvent(new Event('scroll'));
    expect(FakeIntersectionObserver.instances.length).toBe(built + 1);
    handle.destroy();
  });

  /**
   * Folded to nothing by the control, the area is a zero-height box on the
   * observer's edge, and a browser reports it out; honoured, that set
   * `scrolled` at the top of the page and opened the fold again.
   */
  it('ignores a report on an area with no height, and an "out" while nothing is scrolled', () => {
    const { handle, io, onScrolled, scroller } = scene();
    io.report(false, 0);
    expect(onScrolled).not.toHaveBeenCalled();
    scroller.scrollTop = 0;
    io.report(false);
    expect(onScrolled).not.toHaveBeenCalled();
    scroller.scrollTop = 300;
    io.report(false);
    expect(onScrolled).toHaveBeenLastCalledWith(true);
    expect(handle.scrolled()).toBe(true);
    handle.destroy();
  });

  /**
   * The observer is rebuilt when the title changes height and repeats the
   * fact it knew. Between the control setting `expanded` and the binding
   * telling the engine, that repeat asked the area to close again in Angular.
   */
  it('asks to collapse on the crossing only, never on a repeated out report', () => {
    const { handle, io, onScrollRequest, scroller, state } = scene();
    scroller.scrollTop = 300;
    io.report(false);
    expect(onScrollRequest).toHaveBeenCalledTimes(1);
    /* The control set it, the binding has not told the engine yet. */
    state.expanded = true;
    io.report(false);
    expect(onScrollRequest).toHaveBeenCalledTimes(1);
    handle.expandedChanged(true, 'control');
    expect(handle.revealed()).toBe(true);
    handle.destroy();
  });

  /**
   * Scroll anchoring moves the position by the few pixels the title grew as
   * the reveal began; that is not the reader scrolling, and the reveal holds.
   * A real scroll of more than that, or any scroll later on, ends it.
   */
  it('holds a reveal through the small scroll that anchoring makes as the title grows', () => {
    vi.useFakeTimers();
    try {
      const { handle, io, onRevealed, scroller, state } = scene();
      scroller.scrollTop = 300;
      io.report(false);
      state.expanded = true;
      handle.expandedChanged(true, 'control');
      expect(handle.revealed()).toBe(true);

      scroller.scrollTop = 305;
      scroller.dispatchEvent(new Event('scroll'));
      expect(handle.revealed()).toBe(true);

      scroller.scrollTop = 360;
      scroller.dispatchEvent(new Event('scroll'));
      expect(onRevealed).toHaveBeenLastCalledWith(false);
      handle.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  /**
   * The control folded the area while the page was scrolled and the reader
   * comes back up: the area folds here rather than re-opening, and as the fold
   * lands the scroll moves up by what the flow lost, before paint, so nothing
   * on screen moves. Before this the fold animated, the content shortened,
   * the observer reported again, and the header flickered all the way up.
   */
  it('folds instantly and compensates the scroll when a control-folded area comes back into view', () => {
    const { area, handle, io, onScrolled, onScrollRequest, scroller, state } = scene();
    scroller.scrollTop = 300;
    io.report(false);
    state.expanded = true;
    handle.expandedChanged(true, 'control');
    state.expanded = false;
    handle.expandedChanged(false, 'control');
    onScrollRequest.mockClear();

    scroller.scrollTop = 150;
    scroller.dispatchEvent(new Event('scroll'));
    (FakeIntersectionObserver.instances.at(-1) as FakeIntersectionObserver).report(true);
    expect(onScrolled).toHaveBeenLastCalledWith(false);
    expect(onScrollRequest).not.toHaveBeenCalled();
    expect(area.style.transitionProperty).toBe('none');

    /* The binding folded the track: the size observer sees the area at nothing. */
    sized(area, 0);
    (FakeResizeObserver.instances.at(-1) as FakeResizeObserver).callback([], {} as ResizeObserver);
    expect(scroller.scrollTop).toBe(30);
    expect(area.style.transitionProperty).toBe('');
    handle.destroy();
  });

  it('opens a folded header in place while it is stuck', () => {
    const { handle, onRevealed, root, scroller, state } = scene();
    state.expanded = false;
    handle.expandedChanged(false, 'control');
    scroller.scrollTop = 300;
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(() => ({ top: 0 }) as DOMRect);
    vi.spyOn(scroller, 'getBoundingClientRect').mockImplementation(() => ({ top: 0 }) as DOMRect);
    state.expanded = true;
    handle.expandedChanged(true, 'control');
    expect(onRevealed).toHaveBeenLastCalledWith(true);
    handle.destroy();
  });

  /**
   * Scrolling up keeps a reveal; once the root leaves the scroller's edge the
   * area is where it would be anyway and the reveal ends without a move.
   */
  it('keeps a reveal on a scroll up, and lets it go once the root is off the edge', () => {
    const { handle, io, onRevealed, onScrolled, root, scroller, state } = scene();
    scroller.scrollTop = 300;
    io.report(false);
    state.expanded = true;
    handle.expandedChanged(true, 'control');
    /* Stuck: the root sits on the scroller's edge while the reveal holds. */
    const rect = vi
      .spyOn(root, 'getBoundingClientRect')
      .mockImplementation(() => ({ top: 0 }) as DOMRect);
    vi.spyOn(scroller, 'getBoundingClientRect').mockImplementation(() => ({ top: 0 }) as DOMRect);

    scroller.scrollTop = 200;
    scroller.dispatchEvent(new Event('scroll'));
    expect(handle.revealed()).toBe(true);

    /* Above its natural top the root leaves the edge. */
    rect.mockImplementation(() => ({ top: 40 }) as DOMRect);
    scroller.scrollTop = 100;
    scroller.dispatchEvent(new Event('scroll'));
    expect(onRevealed).toHaveBeenLastCalledWith(false);
    expect(onScrolled).toHaveBeenLastCalledWith(false);
    expect(state.expanded).toBe(true);
    handle.destroy();
  });

  it('attaches no intersection observer under manual collapse', () => {
    FakeIntersectionObserver.instances = [];
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    const root = document.createElement('header');
    const area = sized(document.createElement('div'), 80);
    root.append(area);
    scroller.append(root);
    document.body.append(scroller);
    const handle = createStickyHeader({
      root,
      area: () => area,
      chrome: () => [],
      state: () => ({ expanded: true, pinned: false, collapse: 'manual' }),
      onScrolled: vi.fn(),
      onRevealed: vi.fn(),
      onScrollRequest: vi.fn(),
    });
    expect(FakeIntersectionObserver.instances).toHaveLength(0);
    expect(scroller.style.getPropertyValue(STICKY_TOP_PROPERTY)).toBe('80px');
    handle.destroy();
  });

  it('republishes when a chrome part changes height', () => {
    const { handle, scroller, title } = scene();
    sized(title, 90);
    (FakeResizeObserver.instances.at(-1) as FakeResizeObserver).fire();
    expect(scroller.style.getPropertyValue(STICKY_TOP_PROPERTY)).toBe('130px');
    handle.destroy();
  });
});
