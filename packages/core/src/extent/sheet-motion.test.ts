import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSheetMotion } from './sheet-motion';

describe('createSheetMotion', () => {
  let panel: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    panel = document.createElement('div');
    document.body.append(panel);
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });

  afterEach(() => {
    panel.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('sizes the panel once to the highest extent and moves it down to where it was', () => {
    const motion = createSheetMotion(panel);
    motion.begin(300, 600);
    expect(panel.style.blockSize).toBe('600px');
    expect(panel.style.translate).toBe('0 300px');
    expect(panel.style.transition).toBe('none');
  });

  it('follows the hand by translate alone', () => {
    const motion = createSheetMotion(panel);
    motion.begin(300, 600);
    for (const extent of [320, 400, 560]) {
      motion.follow(extent);
      expect(panel.style.translate).toBe(`0 ${String(600 - extent)}px`);
      expect(panel.style.blockSize).toBe('600px');
    }
  });

  it('keeps the panel at its own height when the hand cannot take it higher', () => {
    const motion = createSheetMotion(panel);
    motion.begin(300, 300);
    expect(panel.style.translate).toBe('0 0px');
    motion.follow(200);
    expect(panel.style.translate).toBe('0 100px');
  });

  it('leaves from the release position at the release speed, past the edge', async () => {
    const motion = createSheetMotion(panel);
    motion.begin(300, 300);
    motion.follow(240);
    const done = motion.settle(0, -1500);
    /* 272 px at 1500 px/s, at a constant pace: it inherits the hand's speed. */
    expect(panel.style.transition).toMatch(/^translate 181\.\d+ms linear$/);
    expect(panel.style.translate).toBe('0 332px');
    panel.dispatchEvent(Object.assign(new Event('transitionend'), { propertyName: 'translate' }));
    await done;
  });

  it('leaves in the time it is given, on a curve that starts as steep as the hand was', () => {
    const motion = createSheetMotion(panel);
    motion.begin(300, 300);
    motion.follow(240);
    void motion.settle(0, -1500, 200);
    /* 272 px in 200 ms; the hand's 1500 px/s over that is a first stretch 1.1 times the average slope. */
    expect(panel.style.transition).toBe('translate 200ms cubic-bezier(0.3, 0.331, 0.2, 1)');
    motion.begin(300, 300);
    void motion.settle(0, 0, 200);
    expect(panel.style.transition).toBe('translate 200ms cubic-bezier(0.3, 0.000, 0.2, 1)');
  });

  it('settles at a pace of its own when the release was slow, within a frame or two and a blink', () => {
    const motion = createSheetMotion(panel);
    motion.begin(300, 600);
    motion.follow(450);
    void motion.settle(300, 0);
    const [, duration, easing] = /^translate ([\d.]+)ms (.+)$/.exec(panel.style.transition) ?? [];
    expect(easing).not.toBe('linear');
    expect(Number(duration)).toBeGreaterThanOrEqual(140);
    expect(Number(duration)).toBeLessThanOrEqual(420);
  });

  it('resolves when the transition does not report, a moment after it should have ended', async () => {
    const motion = createSheetMotion(panel);
    motion.begin(300, 300);
    let arrived = false;
    void motion.settle(0, -1500).then(() => {
      arrived = true;
    });
    await vi.advanceTimersByTimeAsync(100);
    expect(arrived).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    expect(arrived).toBe(true);
  });

  it('does not animate when the motion is reduced, and arrives at once', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const motion = createSheetMotion(panel);
    motion.begin(300, 300);
    await motion.settle(0, -1500);
    expect(panel.style.transition).toBe('none');
    expect(panel.style.translate).toBe('0 332px');
  });

  it('gives the panel back to its stylesheet, the easing last', () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    const motion = createSheetMotion(panel);
    motion.begin(300, 600);
    motion.end();
    expect(panel.style.blockSize).toBe('');
    expect(panel.style.translate).toBe('');
    expect(panel.style.transition).toBe('none');
    frames.forEach((callback) => callback(0));
    expect(panel.style.transition).toBe('');
  });
});
