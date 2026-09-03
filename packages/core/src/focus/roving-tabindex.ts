export type Orientation = 'horizontal' | 'vertical';

export type Direction = 'ltr' | 'rtl';

export interface RovingTabindexOptions {
  /** Selects the items the tab stop moves between, within the container. */
  itemSelector: string;
  /** Wrap past the ends. Defaults to true. */
  loop?: boolean;
  /** Reports movement. The caller decides what movement means. */
  onMove?: (index: number, item: HTMLElement) => void;
  /** Read at the time of each key, so a consumer may change it at runtime. */
  orientation?: () => Orientation;
  /**
   * Which way the container is read. Defaults to the container's own computed
   * `direction`, so a caller that inherits the document's `dir` says nothing.
   */
  direction?: () => Direction;
  /**
   * Whether the arrows across the flow move focus as well.
   *
   * The APG lets a toolbar duplicate them — "Up Arrow and Down Arrow can
   * duplicate Left Arrow and Right Arrow" — and forbids a horizontal `tablist`
   * from listening for them at all, so that the page keeps scrolling with
   * focus inside the list. Default `false`, which is the stricter of the two.
   */
  crossAxis?: boolean;
  /**
   * Which keys an item keeps for itself.
   *
   * The APG's advice for a control that needs the navigation pair — "include
   * only one such control and make it the last element in the toolbar" — is a
   * rule the container can enforce instead: a text field keeps `ArrowLeft`,
   * `ArrowRight`, `Home` and `End` for its caret, and focus leaves it on the
   * cross axis or with `Tab`. Returning nothing, which is the default, is the
   * behaviour every other caller wants.
   */
  ownedKeys?: (item: HTMLElement) => readonly string[];
  /**
   * Whether an item carrying `aria-disabled="true"` stays in the ring.
   *
   * The APG allows a focusable disabled control "in circumstances where
   * discoverability of a function is crucial". An item carrying the *native*
   * attribute is skipped either way, because the platform will not focus it
   * and no option here can change that. Default `false`.
   */
  includeAriaDisabled?: boolean;
}

export interface RovingTabindexHandle {
  /** Removes the listener and leaves every item as it stands. */
  destroy: () => void;
  /** Re-reads the item list after one is added or removed. */
  refresh: () => void;
  /** Moves the tab stop without moving focus. */
  setActive: (index: number) => void;
}

const HORIZONTAL_KEYS = { next: 'ArrowRight', previous: 'ArrowLeft' } as const;
const MIRRORED_KEYS = { next: 'ArrowLeft', previous: 'ArrowRight' } as const;
const VERTICAL_KEYS = { next: 'ArrowDown', previous: 'ArrowUp' } as const;

/** One frozen array, so the default `ownedKeys` allocates nothing per key. */
const EMPTY: readonly string[] = Object.freeze([]);

/**
 * `:disabled` rather than the attribute alone, because a control inside a
 * disabled `fieldset` carries no attribute of its own and still cannot be
 * focused. That is how a whole bar or a whole set of controls is taken out of
 * action with one word, and a ring that wrote its tab stop on one of them would
 * hand the reader a stop the platform refuses to honour.
 */
function isDisabled(item: HTMLElement, includeAriaDisabled: boolean) {
  if (item.hasAttribute('disabled')) return true;
  if (typeof item.matches === 'function' && item.matches(':disabled')) return true;
  return !includeAriaDisabled && item.getAttribute('aria-disabled') === 'true';
}

/**
 * The arrow keys follow the reading direction, which is what the APG means by
 * "the next item": in a right-to-left document the next item is to the left,
 * and a component that always answered `ArrowRight` ran its collection
 * backwards for half the world. Nothing above the block axis changes, because
 * `dir` does not mirror it.
 *
 * The direction is read from the container rather than accepted as a value, so
 * a caller that simply inherits the document's `dir` — which is every caller —
 * says nothing and is still correct. A document without a layout engine
 * reports nothing, and left-to-right is the right last resort there.
 */
function readDirection(container: HTMLElement): Direction {
  const view = container.ownerDocument?.defaultView;
  const computed = view?.getComputedStyle?.(container)?.direction;
  return computed === 'rtl' ? 'rtl' : 'ltr';
}

export function createRovingTabindex(
  container: HTMLElement,
  options: RovingTabindexOptions,
): RovingTabindexHandle {
  const loop = options.loop ?? true;
  const orientation = options.orientation ?? (() => 'horizontal' as const);
  const direction = options.direction ?? (() => readDirection(container));
  const crossAxis = options.crossAxis ?? false;
  const includeAriaDisabled = options.includeAriaDisabled ?? false;
  const ownedKeys = options.ownedKeys ?? (() => EMPTY);

  let items: HTMLElement[] = [];
  let activeIndex = 0;

  function readItems() {
    items = [...container.querySelectorAll<HTMLElement>(options.itemSelector)];
  }

  function applyTabindex() {
    for (const [index, item] of items.entries()) {
      item.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
    }
  }

  function firstEnabled() {
    const index = items.findIndex((item) => !isDisabled(item, includeAriaDisabled));
    return index === -1 ? 0 : index;
  }

  function step(from: number, delta: number) {
    const count = items.length;
    if (count === 0) return -1;

    let index = from;
    for (let taken = 0; taken < count; taken += 1) {
      index += delta;
      if (index < 0 || index >= count) {
        if (!loop) return -1;
        index = (index + count) % count;
      }
      if (!isDisabled(items[index]!, includeAriaDisabled)) return index;
    }
    return -1;
  }

  function edge(delta: 1 | -1) {
    const from = delta === 1 ? -1 : items.length;
    let index = from;
    for (let taken = 0; taken < items.length; taken += 1) {
      index += delta;
      if (index < 0 || index >= items.length) return -1;
      if (!isDisabled(items[index]!, includeAriaDisabled)) return index;
    }
    return -1;
  }

  /**
   * `from` is where the key was pressed, which is not always where the tab stop
   * is: a control the reader clicked, or a script focused, holds focus while
   * `activeIndex` still points at the item the stop was written on. Comparing
   * the destination with the tab stop rather than with the origin is what made
   * the first arrow after a click do nothing at all — measured in a toolbar
   * whose text field owns the inline arrows, where the one key that could take
   * focus out of the field was the one key that was ignored.
   */
  function moveTo(index: number, from: number) {
    if (index === -1 || index === from) return;
    activeIndex = index;
    applyTabindex();
    const item = items[index]!;
    item.focus();
    options.onMove?.(index, item);
  }

  function handleKeydown(event: KeyboardEvent) {
    readItems();
    const vertical = orientation() === 'vertical';
    const keys = vertical
      ? VERTICAL_KEYS
      : direction() === 'rtl'
        ? MIRRORED_KEYS
        : HORIZONTAL_KEYS;
    /**
     * The pair across the flow. It navigates only when the caller asked for
     * it, and it is never mirrored: `dir` turns the inline axis and leaves the
     * block axis where it is.
     */
    const cross = vertical ? HORIZONTAL_KEYS : VERTICAL_KEYS;
    const from = items.findIndex((item) => item.contains(event.target as Node));
    const origin = from === -1 ? activeIndex : from;

    /**
     * A key the focused item keeps is not the container's to read. The item
     * has already had it — this listener is on the container, so the event
     * arrived by bubbling — and stopping here leaves the caret, the value or
     * the selection inside the item exactly where the item put it.
     */
    const item = from === -1 ? undefined : items[from];
    if (item !== undefined && ownedKeys(item).includes(event.key)) return;

    if (event.key === keys.next || (crossAxis && event.key === cross.next)) {
      moveTo(step(origin, 1), origin);
    } else if (event.key === keys.previous || (crossAxis && event.key === cross.previous)) {
      moveTo(step(origin, -1), origin);
    } else if (event.key === 'Home') moveTo(edge(1), origin);
    else if (event.key === 'End') moveTo(edge(-1), origin);
    else return;

    event.preventDefault();
  }

  readItems();
  activeIndex = firstEnabled();
  applyTabindex();
  container.addEventListener('keydown', handleKeydown);

  return {
    destroy: () => container.removeEventListener('keydown', handleKeydown),
    refresh: () => {
      readItems();
      if (activeIndex >= items.length) activeIndex = firstEnabled();
      applyTabindex();
    },
    setActive: (index) => {
      readItems();
      if (index < 0 || index >= items.length) return;
      activeIndex = index;
      applyTabindex();
    },
  };
}
