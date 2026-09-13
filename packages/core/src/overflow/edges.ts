/**
 * The same question `overflow.ts` answers, asked about both axes at once and
 * answered in logical names.
 *
 * `createScrollAffordance` measures one axis, because the family that asked for
 * it — `tabs` — has one. A scroll area has two, and two handles on one element
 * would be two `ResizeObserver`s and two scroll listeners measuring the same
 * box on the same frame.
 *
 * The names are logical because the attributes they become are: a right-to-left
 * document and a vertical writing mode read `block-start` and `inline-end` the
 * same way, so the stylesheet writes each rule once. The arithmetic is
 * `overflowState`, unchanged, which already reads a mirrored scroller by the
 * magnitude of its offset rather than by the sign.
 */

import type { OverflowState } from './overflow';
import { NOT_OVERFLOWING, overflowState } from './overflow';

export interface ScrollEdgesState {
  /** Down the page in a horizontal writing mode, across it in a vertical one. */
  readonly block: OverflowState;
  /** Along the reading direction. */
  readonly inline: OverflowState;
}

export const NO_SCROLL_EDGES: ScrollEdgesState = Object.freeze({
  block: NOT_OVERFLOWING,
  inline: NOT_OVERFLOWING,
});

export interface ScrollEdgesOptions {
  /** Reports a new state, and only a new one. */
  onChange?: (state: ScrollEdgesState) => void;
}

export interface ScrollEdgesHandle {
  /** Releases every observer and listener, and scrolls nothing. */
  destroy: () => void;
  /** Measures again, after content arrives, leaves or changes size. */
  refresh: () => void;
  /** The last measurement. */
  state: () => ScrollEdgesState;
}

/**
 * `writing-mode` values whose block axis runs across the page rather than down
 * it. The CSS Writing Modes keywords are `horizontal-tb`, `vertical-rl`,
 * `vertical-lr`, `sideways-rl` and `sideways-lr`; the last four are the ones
 * that turn the box, and the first is the initial value.
 */
const SIDEWAYS_BLOCK = /^(?:vertical|sideways)/;

function blockRunsAcross(container: HTMLElement): boolean {
  const mode = container.ownerDocument?.defaultView?.getComputedStyle?.(container)?.writingMode;
  return typeof mode === 'string' && SIDEWAYS_BLOCK.test(mode);
}

function same(a: OverflowState, b: OverflowState): boolean {
  return a.overflowing === b.overflowing && a.atStart === b.atStart && a.atEnd === b.atEnd;
}

export function createScrollEdges(
  container: HTMLElement,
  options: ScrollEdgesOptions = {},
): ScrollEdgesHandle {
  let current: ScrollEdgesState = NO_SCROLL_EDGES;

  /**
   * Read when the box is measured and not when it is scrolled.
   * `getComputedStyle` is a layout read, a scroll fires one event per frame,
   * and a writing mode does not change during a scroll — it changes when the
   * element or its ancestors are restyled, which resizes the box.
   */
  let across = blockRunsAcross(container);

  function measure(): ScrollEdgesState {
    const horizontal = overflowState({
      clientSize: container.clientWidth,
      scrollSize: container.scrollWidth,
      scrollStart: container.scrollLeft,
    });
    const vertical = overflowState({
      clientSize: container.clientHeight,
      scrollSize: container.scrollHeight,
      scrollStart: container.scrollTop,
    });
    return across
      ? { block: horizontal, inline: vertical }
      : { block: vertical, inline: horizontal };
  }

  function update(remeasureWritingMode: boolean) {
    if (remeasureWritingMode) across = blockRunsAcross(container);
    const next = measure();
    if (same(next.block, current.block) && same(next.inline, current.inline)) return;
    current = next;
    options.onChange?.(current);
  }

  const onScroll = () => update(false);
  const observer =
    typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => update(true));

  observer?.observe(container);
  container.addEventListener('scroll', onScroll, { passive: true });
  update(false);

  return {
    destroy: () => {
      observer?.disconnect();
      container.removeEventListener('scroll', onScroll);
    },
    refresh: () => update(true),
    state: () => current,
  };
}

/**
 * The measurement as the DOM says it, so both bindings write one vocabulary.
 *
 * An edge attribute says the reader can see that end of the content, which is
 * why a rule paints an affordance in its *absence*: the negative form is the
 * one a stylesheet can write without `:not()` around every selector, and an
 * axis that does not overflow shows both of its ends.
 */
export function scrollEdgeAttributes(state: ScrollEdgesState): Record<string, string> {
  const attributes: Record<string, string> = {};

  const axis =
    state.block.overflowing && state.inline.overflowing
      ? 'both'
      : state.block.overflowing
        ? 'block'
        : state.inline.overflowing
          ? 'inline'
          : undefined;
  if (axis !== undefined) attributes['data-overflowing'] = axis;

  if (state.block.atStart) attributes['data-at-block-start'] = '';
  if (state.block.atEnd) attributes['data-at-block-end'] = '';
  if (state.inline.atStart) attributes['data-at-inline-start'] = '';
  if (state.inline.atEnd) attributes['data-at-inline-end'] = '';

  return attributes;
}
