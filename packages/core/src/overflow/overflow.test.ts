import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createScrollAffordance, NOT_OVERFLOWING, overflowState } from './overflow';

describe('overflowState', () => {
  it('reports a row that fits as having nothing to reach', () => {
    expect(overflowState({ clientSize: 400, scrollSize: 400, scrollStart: 0 })).toEqual(
      NOT_OVERFLOWING,
    );
  });

  it('reports both ends of a row that has not been scrolled', () => {
    expect(overflowState({ clientSize: 400, scrollSize: 900, scrollStart: 0 })).toEqual({
      overflowing: true,
      atStart: true,
      atEnd: false,
    });
  });

  it('reports the far end once the row has been scrolled to it', () => {
    expect(overflowState({ clientSize: 400, scrollSize: 900, scrollStart: 500 })).toEqual({
      overflowing: true,
      atStart: false,
      atEnd: true,
    });
  });

  /**
   * A right-to-left scroller counts from zero at its own start, downwards. The
   * magnitude is the distance from the start in both directions, which is what
   * lets one rule answer for both.
   */
  it('reads a mirrored scroller by the distance rather than by the sign', () => {
    expect(overflowState({ clientSize: 400, scrollSize: 900, scrollStart: -500 })).toEqual({
      overflowing: true,
      atStart: false,
      atEnd: true,
    });
  });

  /**
   * Sub-pixel layout leaves a scroller a fraction short of its own end, and a
   * paging control that never disables is a control that does nothing when it
   * is pressed.
   */
  it('counts a fraction short of an end as being at it', () => {
    expect(overflowState({ clientSize: 400, scrollSize: 900.4, scrollStart: 499.6 }).atEnd).toBe(
      true,
    );
    expect(overflowState({ clientSize: 400, scrollSize: 400.5, scrollStart: 0 }).overflowing).toBe(
      false,
    );
  });
});

function mount(sizes: { client: number; scroll: number; start?: number }) {
  document.body.innerHTML = '<div id="row"></div>';
  const container = document.getElementById('row') as HTMLElement;
  Object.defineProperty(container, 'clientWidth', { value: sizes.client, configurable: true });
  Object.defineProperty(container, 'scrollWidth', { value: sizes.scroll, configurable: true });
  container.scrollLeft = sizes.start ?? 0;
  container.scrollBy = vi.fn();
  return container;
}

describe('createScrollAffordance', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('measures once on creation', () => {
    const container = mount({ client: 300, scroll: 800 });
    const handle = createScrollAffordance(container);

    expect(handle.state()).toEqual({ overflowing: true, atStart: true, atEnd: false });
    handle.destroy();
  });

  it('reports a change and only a change', () => {
    const container = mount({ client: 300, scroll: 800 });
    const onChange = vi.fn();
    const handle = createScrollAffordance(container, { onChange });

    handle.refresh();
    container.scrollLeft = 500;
    container.dispatchEvent(new Event('scroll'));

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual({
      overflowing: true,
      atStart: false,
      atEnd: true,
    });
    handle.destroy();
  });

  it('moves most of a view rather than all of it, so the eye keeps a landmark', () => {
    const container = mount({ client: 300, scroll: 800 });
    const handle = createScrollAffordance(container);

    handle.page(1);

    expect(container.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: 240 }),
    );
    handle.destroy();
  });

  it('stops measuring after destroy', () => {
    const container = mount({ client: 300, scroll: 800 });
    const onChange = vi.fn();
    const handle = createScrollAffordance(container, { onChange });
    onChange.mockClear();

    handle.destroy();
    container.scrollLeft = 500;
    container.dispatchEvent(new Event('scroll'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
