import { describe, expect, it } from 'vitest';

import { collapseState } from './collapse';

/**
 * The arithmetic of a bar that has to give something up: which units go, and
 * whether the control that holds them is drawn at all. It is a pure function
 * over numbers so the decision is tested without a layout engine — the same
 * split `overflowState` already makes for a scrolling row.
 */
const unit = (size: number, collapsible = true) => ({ collapsible, size });

describe('collapseState', () => {
  it('collapses nothing and draws no trigger while the bar fits', () => {
    const state = collapseState({
      available: 300,
      gap: 10,
      triggerSize: 30,
      units: [unit(100), unit(100)],
    });

    expect(state).toEqual({ collapsed: [], triggerVisible: false });
  });

  it('takes the room the trigger needs into account before it is drawn', () => {
    /* Three units and two gaps are 320 against 300, so one has to go. Once it
       does, the trigger arrives and takes its own room and its own gap. */
    const state = collapseState({
      available: 300,
      gap: 10,
      triggerSize: 30,
      units: [unit(100), unit(100), unit(100)],
    });

    expect(state).toEqual({ collapsed: [2], triggerVisible: true });
  });

  it('gives way from the end, whatever the sizes are', () => {
    const state = collapseState({
      available: 100,
      gap: 0,
      triggerSize: 20,
      units: [unit(80), unit(10), unit(10), unit(10)],
    });

    expect(state.collapsed).toEqual([1, 2, 3]);
  });

  it('leaves a unit with nowhere to go where it is', () => {
    const state = collapseState({
      available: 100,
      gap: 0,
      triggerSize: 20,
      units: [unit(40), unit(40, false), unit(40)],
    });

    expect(state.collapsed).toEqual([2]);
    expect(state.triggerVisible).toBe(true);
  });

  /**
   * The rule the refinement exists for: a bar of controls that cannot move
   * overflows rather than hiding one of them, and the trigger is not drawn to
   * announce a menu with nothing in it.
   */
  it('draws no trigger when nothing in the bar can collapse', () => {
    const state = collapseState({
      available: 50,
      gap: 0,
      triggerSize: 20,
      units: [unit(40, false), unit(40, false)],
    });

    expect(state).toEqual({ collapsed: [], triggerVisible: false });
  });

  it('collapses everything it can when even that is not enough', () => {
    const state = collapseState({
      available: 30,
      gap: 0,
      triggerSize: 20,
      units: [unit(100, false), unit(40), unit(40)],
    });

    expect(state.collapsed).toEqual([1, 2]);
    expect(state.triggerVisible).toBe(true);
  });

  /**
   * A spacer is passed in as a unit of no size so that it is counted in the
   * gaps and never in the room; it grows into whatever is left, so a bar with
   * one still fits exactly when its controls fit.
   */
  it('counts a gap for every box that is still drawn', () => {
    const fits = collapseState({
      available: 100,
      gap: 10,
      triggerSize: 20,
      units: [unit(40), unit(0, false), unit(40)],
    });

    expect(fits).toEqual({ collapsed: [], triggerVisible: false });

    const overflows = collapseState({
      available: 98,
      gap: 10,
      triggerSize: 20,
      units: [unit(40), unit(0, false), unit(40)],
    });

    expect(overflows.collapsed).toEqual([2]);
  });

  it('holds a bar a fraction of a pixel over its own width', () => {
    const state = collapseState({
      available: 199.6,
      gap: 0,
      triggerSize: 20,
      units: [unit(100), unit(100)],
    });

    expect(state).toEqual({ collapsed: [], triggerVisible: false });
  });

  /**
   * A rule that divides nothing is a stray line. The order alone almost gets
   * there — the end gives way first — and misses when the collapse stops as
   * soon as the bar fits.
   */
  it('takes a rule that is left dividing nothing', () => {
    const state = collapseState({
      available: 100,
      gap: 0,
      triggerSize: 20,
      units: [unit(40), { collapsible: false, divides: true, size: 10 }, unit(60)],
    });

    expect(state.collapsed).toEqual([1, 2]);
  });

  it('leaves a rule that still divides two visible units', () => {
    const state = collapseState({
      available: 120,
      gap: 0,
      triggerSize: 20,
      units: [unit(40), { collapsible: false, divides: true, size: 10 }, unit(40), unit(60)],
    });

    expect(state.collapsed).toEqual([3]);
  });

  it('reports an empty bar as fitting', () => {
    expect(collapseState({ available: 0, gap: 8, triggerSize: 20, units: [] })).toEqual({
      collapsed: [],
      triggerVisible: false,
    });
  });
});
