/**
 * One mark that travels between the items of a row: the selected tab's
 * underline, drawn once in the row rather than once per item.
 *
 * A mark per item can only appear and disappear, or scale from an edge; one
 * mark can slide, which is the motion that says the selection moved. Sliding
 * needs the position and the length of the item it marks, so this measures
 * them: the target's border box, in the container's scroll coordinates, on the
 * axis the row runs along. The stylesheet decides the rest — the inset from the
 * item's edges, the thickness, the edge it stands on, the transition.
 *
 * The mark is an element this module creates and appends to the container,
 * `aria-hidden` and with the part name the caller gives. It writes two
 * properties on it, `--_indicator-start` and `--_indicator-length`, in pixels,
 * and `hidden` while there is no target. `data-moving` is written with a
 * position whose target changed, and removed with one whose target is the
 * same element measured again — a font that arrived, a list that resized. A
 * transition starts when the style after a change declares one, so a
 * stylesheet that transitions only a moving mark slides it when the selection
 * moves, and places it without motion on the first position and on every
 * re-measurement: a bar that slid and stretched by itself as the page loaded
 * was the defect.
 *
 * It measures when the target can have moved: an item selected, added or
 * removed (a mutation under the container), and the container or the target
 * resized. A scroll moves nothing, because the mark scrolls with the items.
 * Nothing here knows about React or Angular, so the two bindings cannot
 * disagree about where the mark is.
 */

export type IndicatorOrientation = 'horizontal' | 'vertical';

export interface IndicatorOptions {
  /** The element the mark marks, read at each measurement; `null` hides the mark. */
  target: () => HTMLElement | null;
  /** Which way the row runs. Read at each measurement. */
  orientation: () => IndicatorOrientation;
  /** The `data-part` of the mark. Defaults to `indicator`. */
  part?: string;
}

export interface IndicatorHandle {
  /** The mark. */
  element: HTMLElement;
  /** Measures now, for a change the observers cannot see. */
  update: () => void;
  /** Disconnects the observers and removes the mark. */
  destroy: () => void;
}

export function createIndicator(
  container: HTMLElement,
  options: IndicatorOptions,
): IndicatorHandle {
  const doc = container.ownerDocument;
  const element = doc.createElement('span');
  element.setAttribute('data-part', options.part ?? 'indicator');
  element.setAttribute('aria-hidden', 'true');
  element.hidden = true;
  container.append(element);

  let observed: HTMLElement | null = null;
  let start = Number.NaN;
  let length = Number.NaN;
  /** The element the last written position measured. */
  let placed: HTMLElement | null = null;
  let destroyed = false;

  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => update());

  function hide(next: boolean) {
    if (element.hidden !== next) element.hidden = next;
  }

  function update() {
    if (destroyed) return;
    const target = options.target();
    if (target !== observed) {
      if (observed !== null) resize?.unobserve(observed);
      if (target !== null) resize?.observe(target);
      observed = target;
    }
    if (target === null) {
      hide(true);
      return;
    }

    const box = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const horizontal = options.orientation() === 'horizontal';
    const nextStart = horizontal
      ? rect.left - box.left - container.clientLeft + container.scrollLeft
      : rect.top - box.top - container.clientTop + container.scrollTop;
    const nextLength = horizontal ? rect.width : rect.height;
    hide(false);
    if (nextStart === start && nextLength === length) return;

    const moving = placed !== null && target !== placed;
    if (moving !== element.hasAttribute('data-moving')) {
      element.toggleAttribute('data-moving', moving);
    }
    placed = target;
    start = nextStart;
    length = nextLength;
    element.style.setProperty('--_indicator-start', `${start}px`);
    element.style.setProperty('--_indicator-length', `${length}px`);
  }

  const mutations = new MutationObserver((records) => {
    if (records.some((record) => record.target !== element)) update();
  });
  mutations.observe(container, {
    attributeFilter: ['aria-selected', 'data-selected', 'hidden'],
    attributes: true,
    childList: true,
    subtree: true,
  });
  resize?.observe(container);
  update();

  return {
    element,
    update,
    destroy: () => {
      destroyed = true;
      mutations.disconnect();
      resize?.disconnect();
      element.remove();
    },
  };
}
