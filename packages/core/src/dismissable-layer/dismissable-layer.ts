/**
 * Whether a layer should still be open, and what the page behind it may do
 * while it is.
 *
 * Three things decide that an overlay is over: Escape, a press somewhere else,
 * and focus leaving. Radix reports them as `onEscapeKeyDown`,
 * `onPointerDownOutside` and `onFocusOutside`, and every consumer then writes
 * the same function three times. Here there is one request carrying one reason
 * from the closed vocabulary of `docs/state-and-events.md`, which calls two
 * events for one transition "the same failure stated twice".
 *
 * The hard part is not any of the three. It is the word *outside*: a submenu is
 * outside its parent menu in the DOM — it was portalled to the end of the body
 * — and inside it in every sense that matters. Each layer therefore records the
 * layer that was topmost when it opened, and a press is inside a layer when it
 * lands on that layer, on a node the layer claims, or anywhere inside a layer
 * descended from it. That is what makes `docs/component-features.md` §3's rule
 * a mechanism instead of an intention.
 *
 * The module reports and never closes. The family owns its open state, so a
 * dismissal is a request it may refuse — and a layer that refuses stops the
 * request from reaching the layers underneath it, because a layer left standing
 * on an ancestor that closed is worse than one that would not close.
 *
 * Focus containment and restoration are not here. They are `focus`'s, and two
 * modules answering one question is the failure this file avoids elsewhere.
 */

/** The subset of the closed reason vocabulary a layer can be dismissed for. */
export type DismissReason = 'escape' | 'outsidePress' | 'blur' | 'programmatic';

export interface DismissRequest {
  readonly reason: DismissReason;
  /** The event that caused it, where one exists. */
  readonly source?: Event | undefined;
  readonly cancelled: boolean;
  /** Refuses the dismissal. The layers below this one are not asked either. */
  cancel: () => void;
}

/** Whether a press lands outside. `true` for every press the layer does not own. */
export type OutsidePress = boolean | ((target: EventTarget | null, event: Event) => boolean);

export interface DismissableLayerOptions {
  /** Called once per dismissal, with the reason and the event behind it. */
  onDismiss: (request: DismissRequest) => void;
  /** Escape closes the topmost layer. Default `true`. */
  escape?: boolean;
  /** Default `true`. A predicate decides which outside presses count. */
  outsidePress?: OutsidePress;
  /** Which press decides. Default `pointerdown`. */
  outsidePressEvent?: 'pointerdown' | 'click';
  /** Focus leaving the layer dismisses it. Default `false`. */
  focusOutside?: boolean;
  /** Everything outside the layer becomes `inert`. Default `false`. */
  modal?: boolean;
  /** Locks the document scroll. Defaults to whatever `modal` is. */
  scrollLock?: boolean;
  /** Nodes outside the layer that count as inside it — the trigger, first of all. */
  branches?: Iterable<Element>;
  /**
   * What a press is inside of, where that is less than the node. A dialog's
   * node is the whole frame — a scrim and a viewport around a panel — and the
   * frame is what carries the depth and the `inert` boundary; the panel is the
   * only part a press is *in*. Defaults to the node.
   */
  content?: Element;
}

export interface DismissableLayerHandle {
  /** Position in the document's stack, counting from zero. */
  readonly depth: number;
  readonly topmost: boolean;
  /** Claims a node as part of the layer. Returns the function that gives it back. */
  addBranch: (node: Element) => () => void;
  /** Dismisses from code, through the same request. */
  dismiss: (source?: Event) => void;
  destroy: () => void;
}

export interface ScrollLockHandle {
  release: () => void;
}

/**
 * The single stack, as a number a stylesheet can add to a token:
 * `z-index: calc(var(--slotted-z-index-popover) + var(--slotted-layer-depth))`.
 */
export const LAYER_DEPTH_PROPERTY = '--slotted-layer-depth';

interface Layer {
  node: HTMLElement;
  /** What a press is inside of: the node, or the part of it the consumer named. */
  content: Element;
  options: DismissableLayerOptions;
  /** The layer that was topmost when this one opened, or none. */
  parent: Layer | null;
  branches: Set<Element>;
  releaseInert: (() => void) | null;
  releaseScroll: (() => void) | null;
}

interface DocumentStack {
  layers: Layer[];
  /**
   * Where the pointer went down, for the layers that wait for the click. A
   * click is dispatched wherever the pointer comes up, so a reader who selects
   * text in a panel and lets go over the scrim clicks the scrim — and a press
   * that began inside is not a press outside, whatever ends it.
   */
  pressStart: EventTarget | null;
  detach: () => void;
}

interface DocumentLock {
  count: number;
  overflow: string;
  padding: string;
}

/** Per document, so two copies of the library on one page keep two stacks. */
const stacks = new WeakMap<Document, DocumentStack>();
const locks = new WeakMap<Document, DocumentLock>();

function documentStack(doc: Document): DocumentStack {
  const existing = stacks.get(doc);
  if (existing) return existing;

  const state: DocumentStack = { layers: [], pressStart: null, detach: () => {} };

  const onKeyDown = (event: Event) => handleKeyDown(state, event as KeyboardEvent);
  const onPress = (event: Event) => handlePress(state, event);
  const onFocusIn = (event: Event) => handleFocusIn(state, event);

  /* Capture, so a layer answers before a consumer's own handler stops the event. */
  doc.addEventListener('keydown', onKeyDown, true);
  doc.addEventListener('pointerdown', onPress, true);
  doc.addEventListener('click', onPress, true);
  doc.addEventListener('focusin', onFocusIn, true);

  state.detach = () => {
    doc.removeEventListener('keydown', onKeyDown, true);
    doc.removeEventListener('pointerdown', onPress, true);
    doc.removeEventListener('click', onPress, true);
    doc.removeEventListener('focusin', onFocusIn, true);
    stacks.delete(doc);
  };

  stacks.set(doc, state);
  return state;
}

function isDescendant(candidate: Layer, ancestor: Layer): boolean {
  let current = candidate.parent;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

function claims(layer: Layer, target: Node): boolean {
  if (layer.content.contains(target)) return true;
  for (const branch of layer.branches) if (branch.contains(target)) return true;
  return false;
}

/** Inside the layer, inside a node it claims, or inside a layer descended from it. */
function owns(state: DocumentStack, layer: Layer, target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  if (claims(layer, target)) return true;
  return state.layers.some((other) => isDescendant(other, layer) && claims(other, target));
}

function request(layer: Layer, reason: DismissReason, source?: Event): boolean {
  let cancelled = false;
  layer.options.onDismiss({
    reason,
    source,
    get cancelled() {
      return cancelled;
    },
    cancel() {
      cancelled = true;
    },
  });
  return !cancelled;
}

function handleKeyDown(state: DocumentStack, event: KeyboardEvent) {
  /* A key ends the pointer sequence: a click the keyboard makes began nowhere. */
  state.pressStart = null;
  if (event.key !== 'Escape') return;
  /* A held key closes one layer; Escape cancelling an IME composition closes none. */
  if (event.repeat || event.isComposing) return;

  const top = state.layers.at(-1);
  if (!top) return;
  /* A topmost layer that refuses Escape swallows it: the key belongs to the top. */
  if (top.options.escape === false) return;
  request(top, 'escape', event);
}

function handlePress(state: DocumentStack, event: Event) {
  if (event.type === 'pointerdown') state.pressStart = event.target;
  const began = event.type === 'click' ? state.pressStart : null;
  if (event.type === 'click') state.pressStart = null;

  /* Top down, so a submenu is asked before the menu it opened from. */
  for (const layer of [...state.layers].reverse()) {
    const wanted = layer.options.outsidePressEvent ?? 'pointerdown';
    if (event.type !== wanted) continue;

    const outside = layer.options.outsidePress ?? true;
    if (outside === false) continue;
    if (owns(state, layer, event.target)) continue;
    if (began !== null && owns(state, layer, began)) continue;
    if (typeof outside === 'function' && !outside(event.target, event)) continue;

    if (!request(layer, 'outsidePress', event)) return;
  }
}

function handleFocusIn(state: DocumentStack, event: Event) {
  for (const layer of [...state.layers].reverse()) {
    if (layer.options.focusOutside !== true) continue;
    if (owns(state, layer, event.target)) continue;
    if (!request(layer, 'blur', event)) return;
  }
}

function reindex(state: DocumentStack) {
  for (const [index, layer] of state.layers.entries()) {
    layer.node.style.setProperty(LAYER_DEPTH_PROPERTY, String(index));
  }
}

/**
 * Everything outside the layer, made unreachable by the one attribute that
 * answers both halves of the question. Radix blocks the pointer and leaves the
 * page behind a modal in the accessibility tree, so a screen reader walks
 * straight through it.
 */
function applyInert(node: HTMLElement): () => void {
  const undo: (() => void)[] = [];
  const root = node.ownerDocument.documentElement;
  let current: Element = node;

  while (current !== root && current.parentElement) {
    for (const sibling of current.parentElement.children) {
      if (sibling === current || sibling.hasAttribute('inert')) continue;
      sibling.setAttribute('inert', '');
      undo.push(() => sibling.removeAttribute('inert'));
    }
    current = current.parentElement;
  }

  return () => {
    for (const step of undo.reverse()) step();
  };
}

/**
 * Where the pointer went down for the press still in flight, or `null` when
 * none is. The stack already records it so that a layer deciding on the click
 * does not read a press that began inside it as a press outside; the same
 * question is asked by a control that loses focus mid-press.
 *
 * A press on a node that cannot hold focus takes focus off whatever had it, and
 * the `blur` that follows carries `relatedTarget: null` — so a control cannot
 * tell "the reader left" from "the reader pressed something of mine". This
 * answers it, and answers it from the record the stack was already keeping
 * rather than from a second document listener (CB11).
 *
 * Reads and never attaches: with no layer open there is no stack, and no press
 * is being tracked.
 */
export function pressOrigin(doc?: Document): EventTarget | null {
  const target = doc ?? (globalThis as { document?: Document }).document;
  if (!target) return null;
  return stacks.get(target)?.pressStart ?? null;
}

/**
 * One lock per document, counted, with the inline styles it found recorded at
 * the first lock and restored at the last. A counter without the recorded
 * originals leaves an `overflow: hidden` behind whenever two locks release out
 * of the order they were taken.
 */
export function createScrollLock(doc?: Document): ScrollLockHandle {
  const target = doc ?? (globalThis as { document?: Document }).document;
  if (!target?.body) return { release: () => {} };

  const body = target.body;
  let state = locks.get(target);

  if (!state) {
    state = { count: 0, overflow: body.style.overflow, padding: body.style.paddingInlineEnd };
    locks.set(target, state);

    /**
     * A document that reports no client width has no scrollbar to take away,
     * which is every server-rendered and every headless one.
     */
    const view = target.defaultView;
    const client = target.documentElement.clientWidth;
    const gap = view && client > 0 ? view.innerWidth - client : 0;

    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingInlineEnd = `${gap}px`;
  }

  state.count += 1;
  let released = false;

  return {
    release() {
      if (released) return;
      released = true;
      const current = locks.get(target);
      if (!current) return;

      current.count -= 1;
      if (current.count > 0) return;

      body.style.overflow = current.overflow;
      body.style.paddingInlineEnd = current.padding;
      if (body.getAttribute('style') === '') body.removeAttribute('style');
      locks.delete(target);
    },
  };
}

export function createDismissableLayer(
  node: HTMLElement,
  options: DismissableLayerOptions,
): DismissableLayerHandle {
  const doc = node.ownerDocument;
  const state = documentStack(doc);

  const layer: Layer = {
    node,
    content: options.content ?? node,
    options,
    /* The layer that was topmost when this one opened is its ancestor. */
    parent: state.layers.at(-1) ?? null,
    branches: new Set(options.branches ?? []),
    releaseInert: null,
    releaseScroll: null,
  };

  state.layers.push(layer);
  reindex(state);

  if (options.modal === true) layer.releaseInert = applyInert(node);
  if (options.scrollLock ?? options.modal === true) {
    const lock = createScrollLock(doc);
    layer.releaseScroll = lock.release;
  }

  let destroyed = false;

  return {
    get depth() {
      return state.layers.indexOf(layer);
    },
    get topmost() {
      return state.layers.at(-1) === layer;
    },
    addBranch(branch) {
      layer.branches.add(branch);
      return () => layer.branches.delete(branch);
    },
    dismiss(source) {
      if (destroyed) return;
      request(layer, 'programmatic', source);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;

      layer.releaseInert?.();
      layer.releaseScroll?.();
      node.style.removeProperty(LAYER_DEPTH_PROPERTY);
      if (node.getAttribute('style') === '') node.removeAttribute('style');

      const index = state.layers.indexOf(layer);
      if (index !== -1) state.layers.splice(index, 1);
      /* A layer that opened over this one keeps its own ancestry, minus this link. */
      for (const other of state.layers) {
        if (other.parent === layer) other.parent = layer.parent;
      }
      reindex(state);

      if (state.layers.length === 0) state.detach();
    },
  };
}
