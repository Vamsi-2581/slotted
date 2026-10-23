import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  attachSheetDrag,
  dampenExtent,
  settleExtent,
  SHEET_FLING_PX_PER_S,
  sheetStops,
} from './index';

describe('settleExtent', () => {
  const span = 800;

  it('closes a slow release nearer to closed than to the lowest stop', () => {
    expect(settleExtent({ fraction: 0.1, velocity: 0, span, stops: [0.3] })).toBe('close');
    expect(settleExtent({ fraction: 0.2, velocity: 0, span, stops: [0.3] })).toBe(0.3);
  });

  it('goes to the next stop in the direction of a fling, whatever the distance', () => {
    const fast = (SHEET_FLING_PX_PER_S + 1) / span;
    expect(settleExtent({ fraction: 0.52, velocity: fast, span, stops: [0.5, 0.9] })).toBe(0.9);
    expect(settleExtent({ fraction: 0.48, velocity: -fast, span, stops: [0.5, 0.9] })).toBe(
      'close',
    );
    expect(settleExtent({ fraction: 0.95, velocity: fast, span, stops: [0.5, 0.9] })).toBe(0.9);
  });

  it('settles a slow release on the stop nearest where it was heading', () => {
    expect(settleExtent({ fraction: 0.66, velocity: 0.4, span, stops: [0.5, 0.9] })).toBe(0.9);
    expect(settleExtent({ fraction: 0.66, velocity: 0, span, stops: [0.5, 0.9] })).toBe(0.5);
  });

  it('never closes a sheet that is not dismissible', () => {
    expect(
      settleExtent({ dismissible: false, fraction: 0.05, velocity: -2, span, stops: [0.3] }),
    ).toBe(0.3);
  });
});

describe('dampenExtent', () => {
  it('follows the hand up to the highest stop and resists past it', () => {
    expect(dampenExtent(0.4, 0.5)).toBe(0.4);
    const past = dampenExtent(0.7, 0.5);
    expect(past).toBeGreaterThan(0.5);
    expect(past).toBeLessThan(0.6);
    expect(dampenExtent(3, 0.99)).toBeLessThanOrEqual(1);
  });
});

describe('sheetStops', () => {
  it('adds the content rest to the snap points only when it is a stop', () => {
    expect(sheetStops({ rest: 0.3, restIsStop: true, snapPoints: [0.9] })).toEqual([0.3, 0.9]);
    expect(sheetStops({ rest: 0.3, restIsStop: false, snapPoints: [0.9] })).toEqual([0.9]);
  });

  it('makes the rest the only stop when there are no snap points', () => {
    expect(sheetStops({ rest: 0.4, restIsStop: false, snapPoints: [] })).toEqual([0.4]);
  });
});

function touch(target: Element, type: string, y: number, x = 0, at = 0): TouchEvent {
  const point = { clientX: x, clientY: y, identifier: 1, target } as unknown as Touch;
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [point],
  });
  Object.defineProperty(event, 'timeStamp', { value: at });
  return event;
}

describe('attachSheetDrag', () => {
  const panel = document.createElement('div');
  const body = document.createElement('div');
  const field = document.createElement('input');
  panel.append(body, field);
  document.body.append(panel);
  let detach: () => void = () => undefined;

  afterEach(() => {
    detach();
    body.scrollTop = 0;
  });

  const listen = (canGrow = true) => {
    const calls = { start: 0, moves: [] as number[], end: [] as number[] };
    detach = attachSheetDrag(panel, {
      canGrow: () => canGrow,
      enabled: () => true,
      onEnd: (velocity) => calls.end.push(velocity),
      onMove: (distance) => calls.moves.push(distance),
      onStart: () => (calls.start += 1),
    });
    return calls;
  };

  it('claims a downward gesture past the slop, cancels its move and counts from the claim', () => {
    const calls = listen();
    body.dispatchEvent(touch(body, 'touchstart', 100));
    body.dispatchEvent(touch(body, 'touchmove', 104, 0, 10));
    expect(calls.start).toBe(0);
    const move = touch(body, 'touchmove', 140, 0, 20);
    body.dispatchEvent(move);
    expect(calls.start).toBe(1);
    expect(move.defaultPrevented).toBe(true);
    /* The distance counts from the claim, so the slop does not arrive as one step. */
    expect(calls.moves.at(-1)).toBe(0);
    body.dispatchEvent(touch(body, 'touchmove', 160, 0, 25));
    expect(calls.moves.at(-1)).toBe(-20);
    body.dispatchEvent(touch(body, 'touchend', 160, 0, 30));
    expect(calls.end).toHaveLength(1);
  });

  /** 200 px in 100 ms, upward, let go at once: 2000 px/s toward a taller sheet. */
  it('carries the speed of a hand let go while it moves', () => {
    const calls = listen(true);
    body.dispatchEvent(touch(body, 'touchstart', 500, 0, 0));
    body.dispatchEvent(touch(body, 'touchmove', 480, 0, 10));
    for (let step = 1; step <= 10; step += 1) {
      body.dispatchEvent(touch(body, 'touchmove', 480 - step * 20, 0, 10 + step * 10));
    }
    body.dispatchEvent(touch(body, 'touchend', 280, 0, 110));
    expect(calls.end[0]).toBeCloseTo(2000, -1);
  });

  /** The same flick held still for longer than the window before lifting is not a fling. */
  it('reads no speed from a hand that stopped before it lifted', () => {
    const calls = listen(true);
    body.dispatchEvent(touch(body, 'touchstart', 500, 0, 0));
    body.dispatchEvent(touch(body, 'touchmove', 480, 0, 10));
    for (let step = 1; step <= 10; step += 1) {
      body.dispatchEvent(touch(body, 'touchmove', 480 - step * 20, 0, 10 + step * 10));
    }
    body.dispatchEvent(touch(body, 'touchend', 280, 0, 260));
    expect(calls.end).toEqual([0]);
  });

  it('leaves a sideways gesture and a field alone', () => {
    const calls = listen();
    body.dispatchEvent(touch(body, 'touchstart', 100, 0));
    body.dispatchEvent(touch(body, 'touchmove', 102, 30));
    body.dispatchEvent(touch(body, 'touchmove', 140, 30));
    field.dispatchEvent(touch(field, 'touchstart', 100));
    field.dispatchEvent(touch(field, 'touchmove', 140));
    expect(calls.start).toBe(0);
  });

  it('hands a downward gesture to a scroll that is away from its top', () => {
    const calls = listen();
    Object.defineProperty(body, 'scrollHeight', { configurable: true, value: 900 });
    Object.defineProperty(body, 'clientHeight', { configurable: true, value: 300 });
    body.scrollTop = 50;
    body.dispatchEvent(touch(body, 'touchstart', 100));
    const move = touch(body, 'touchmove', 140);
    body.dispatchEvent(move);
    expect(calls.start).toBe(0);
    expect(move.defaultPrevented).toBe(false);
  });

  it('scrolls an upward gesture once the sheet cannot grow', () => {
    const calls = listen(false);
    body.dispatchEvent(touch(body, 'touchstart', 100));
    body.dispatchEvent(touch(body, 'touchmove', 60));
    expect(calls.start).toBe(0);
  });

  it('stops listening when detached', () => {
    const spy = vi.fn();
    detach = attachSheetDrag(panel, {
      canGrow: () => true,
      enabled: () => true,
      onEnd: spy,
      onMove: spy,
      onStart: spy,
    });
    detach();
    body.dispatchEvent(touch(body, 'touchstart', 100));
    body.dispatchEvent(touch(body, 'touchmove', 140));
    expect(spy).not.toHaveBeenCalled();
  });
});
