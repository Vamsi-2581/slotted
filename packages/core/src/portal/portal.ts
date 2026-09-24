/**
 * Where a layer lives in the document, and what it inherits once it is there.
 *
 * A portal exists for one reason: an overlay rendered where it is written is
 * clipped by an `overflow: hidden` ancestor, transformed by a `transform` one,
 * and stacked against whichever ancestor happens to have created a stacking
 * context. Every library answers that the same way, by moving the node to the
 * end of the body.
 *
 * What every surveyed library then loses is the theme. A layer opened from
 * inside a region carrying `data-slotted-scheme="dark"` renders light at the
 * end of the body, because the region it inherited from is no longer an
 * ancestor. In a library with one theme that is invisible; this one has three
 * schemes, three densities, a theme axis and two directions, so it is a defect
 * you can see. The layer element carries the four attributes of the region it
 * came from, and one observer keeps them current while the layer is open.
 *
 * Nothing here reads `document` at import time, so a server can load the module
 * and a layer can ask for a container that does not exist yet and be told so.
 */

/** Marks the one element per document that every layer is placed inside. */
export const PORTAL_ROOT_ATTRIBUTE = 'data-slotted-portal';

/**
 * What a layer inherits from the region that opened it. `dir` is the platform's;
 * the other three are this library's theme axes, and every one of them is
 * inherited in CSS, which is exactly why moving the node loses them.
 */
export const MIRRORED_ATTRIBUTES = [
  'dir',
  'data-slotted-theme',
  'data-slotted-scheme',
  'data-slotted-density',
] as const;

export interface PortalRootOptions {
  /**
   * The node the layer was written beside. Its theme and direction are what the
   * layer inherits, and its document is the one the layer is placed in.
   */
  origin?: Element | null;
  /** A parent for this layer alone. Overrides the application container. */
  container?: Element | null;
  /** Renders in place: the handle reports no container. */
  disabled?: boolean;
}

export interface PortalRootHandle {
  /** The element to render into, or `null` when there is nowhere to render yet. */
  readonly container: Element | null;
  /** Removes the layer element, and the shared root with the last layer. */
  release: () => void;
}

interface DocumentPortals {
  /** Created with the first layer that has no container of its own. */
  root: Element | null;
  /** How many layers are inside the shared root. */
  shared: number;
  /** Every layer of this document and the node whose theme it inherits. */
  layers: Map<Element, Element | null>;
  observer: MutationObserver | null;
  /** Moves the shared root in and out of the element the page made full screen. */
  onFullscreen: (() => void) | null;
}

const FULLSCREEN_EVENTS = ['fullscreenchange', 'webkitfullscreenchange'] as const;

/** Elements whose children the agent does not paint; a layer inside one is invisible. */
const REPLACED = new Set(['VIDEO', 'IFRAME', 'CANVAS', 'IMG', 'EMBED', 'OBJECT']);

/**
 * Where the shared root belongs right now. While an element is full screen the
 * agent paints that element and nothing else, so a layer at the end of the body
 * — a select opened from a region in full screen — opens where nobody can see
 * it. The root moves inside the fullscreen element and comes back when it
 * leaves; the Angular CDK's `FullscreenOverlayContainer` gives the same answer.
 * The whole document in full screen already contains the body, and a replaced
 * element paints no children, so both keep the application container.
 */
function rootParent(doc: Document): Element | null {
  const prefixed = doc as Document & { webkitFullscreenElement?: Element | null };
  const full = doc.fullscreenElement ?? prefixed.webkitFullscreenElement ?? null;
  if (full && full !== doc.documentElement && full !== doc.body && !REPLACED.has(full.tagName)) {
    return full;
  }
  return getPortalContainer(doc) ?? doc.body;
}

/**
 * Per document rather than per module. Two copies of the library on one page —
 * a micro-frontend, or a Storybook running two versions — would otherwise share
 * one count, and the first release would take the other copy's layers with it.
 */
const portals = new WeakMap<Document, DocumentPortals>();
const containers = new WeakMap<Document, Element>();

function ownerDocument(options: PortalRootOptions): Document | null {
  const found =
    options.origin?.ownerDocument ??
    options.container?.ownerDocument ??
    (globalThis as { document?: Document }).document;
  return found ?? null;
}

/**
 * The parent the shared root is placed in, for the whole application. An
 * application shell that builds its own stacking context names it once here
 * rather than on every overlay it contains.
 */
export function setPortalContainer(container: Element | null, doc?: Document): void {
  const target =
    doc ?? container?.ownerDocument ?? (globalThis as { document?: Document }).document;
  if (!target) return;
  if (container) containers.set(target, container);
  else containers.delete(target);
}

export function getPortalContainer(doc?: Document): Element | null {
  const target = doc ?? (globalThis as { document?: Document }).document;
  if (!target) return null;
  return containers.get(target) ?? target.body ?? null;
}

/** The value the layer inherits for one attribute, or `null` where nothing declares it. */
function inherited(origin: Element | null | undefined, attribute: string): string | null {
  return origin?.closest(`[${attribute}]`)?.getAttribute(attribute) ?? null;
}

function mirror(layer: Element, origin: Element | null) {
  for (const attribute of MIRRORED_ATTRIBUTES) {
    const value = inherited(origin, attribute);
    if (value === layer.getAttribute(attribute)) continue;
    if (value === null) layer.removeAttribute(attribute);
    else layer.setAttribute(attribute, value);
  }
}

function documentPortals(doc: Document): DocumentPortals {
  const existing = portals.get(doc);
  if (existing) return existing;

  const state: DocumentPortals = {
    root: null,
    shared: 0,
    layers: new Map(),
    observer: null,
    onFullscreen: null,
  };

  /* A move, not a re-creation: every open layer keeps its node and its state. */
  state.onFullscreen = () => {
    if (!state.root) return;
    const parent = rootParent(doc);
    if (parent && state.root.parentElement !== parent) parent.append(state.root);
  };
  for (const type of FULLSCREEN_EVENTS) doc.addEventListener(type, state.onFullscreen);

  /**
   * Attributes only, which is what a theme switch is. Watching the tree for
   * structure would make every unrelated render re-resolve every layer.
   */
  const view = doc.defaultView;
  if (view && typeof view.MutationObserver === 'function') {
    state.observer = new view.MutationObserver((records) => {
      /**
       * A layer's own attribute is the answer, not the question. Re-resolving
       * on it would answer the write this observer just caused, and the two
       * would take turns for the life of the page.
       */
      if (records.every((record) => state.layers.has(record.target as Element))) return;
      for (const [layer, origin] of state.layers) mirror(layer, origin);
    });
    state.observer.observe(doc.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: [...MIRRORED_ATTRIBUTES],
    });
  }

  portals.set(doc, state);
  return state;
}

function sharedRoot(doc: Document, state: DocumentPortals): Element {
  if (!state.root) {
    state.root = doc.createElement('div');
    state.root.setAttribute(PORTAL_ROOT_ATTRIBUTE, '');
    rootParent(doc)?.append(state.root);
  }
  state.shared += 1;
  return state.root;
}

function release(doc: Document, layer: Element, wasShared: boolean) {
  const state = portals.get(doc);
  if (!state || !state.layers.has(layer)) return;

  state.layers.delete(layer);
  layer.remove();

  if (wasShared) {
    state.shared -= 1;
    if (state.shared === 0) {
      state.root?.remove();
      state.root = null;
    }
  }

  if (state.layers.size > 0) return;
  state.observer?.disconnect();
  if (state.onFullscreen) {
    for (const type of FULLSCREEN_EVENTS) doc.removeEventListener(type, state.onFullscreen);
  }
  portals.delete(doc);
}

export function createPortalRoot(options: PortalRootOptions = {}): PortalRootHandle {
  const doc = ownerDocument(options);
  if (options.disabled || !doc) {
    return { container: null, release: () => {} };
  }

  const origin = options.origin ?? null;
  const layer = doc.createElement('div');
  mirror(layer, origin);

  const state = documentPortals(doc);
  state.layers.set(layer, origin);

  /**
   * A named container is the layer's parent directly, so nothing else's
   * lifetime depends on this layer. The layer element is still its own, so
   * releasing it never removes a node the consumer wrote.
   */
  const parent = options.container ?? sharedRoot(doc, state);
  const shared = !options.container;
  parent.append(layer);

  return {
    get container() {
      return layer;
    },
    release() {
      release(doc, layer, shared);
    },
  };
}
