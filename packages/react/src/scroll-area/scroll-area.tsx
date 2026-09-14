import '@slotted/styles/scroll-area/scroll-area.css';
import {
  createScrollEdges,
  NO_SCROLL_EDGES,
  scrollEdgeAttributes,
  type ScrollEdgesHandle,
  type ScrollEdgesState,
} from '@slotted/core/overflow';
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Ref, UIEvent } from 'react';

import { useScrollAreaDefaults } from './scroll-area-defaults';
import type {
  ScrollAreaContentProps,
  ScrollAreaHandle,
  ScrollAreaProps,
} from './scroll-area.types';

/**
 * The consumer's own ref is answered from the same callback that starts the
 * measurement, so a consumer keeps its element and the family keeps its
 * observer. Composing rather than replacing is the rule for handlers, and a
 * ref is the same promise.
 */
function assign<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref !== null && ref !== undefined) ref.current = value;
}

/**
 * A scrollport, and the box that frames it.
 *
 * The scrollbar is the platform's, themed by the stylesheet through
 * `scrollbar-color`; the keyboard is the platform's too. What this component
 * adds is the measurement of whether the content overflows and which of its
 * ends show, published on the frame for CSS and reported to the consumer, and
 * the tab stop a scrolling region owes a keyboard together with the name that
 * tab stop owes a screen reader — both written only while the content actually
 * overflows, which is the pattern `prose` shipped first for one block inside a
 * document.
 *
 * The scroll position is never held. The browser moves it on a wheel, a
 * fling, a `Tab` into a child, an anchor navigation and a printed page, and a
 * consumer holding the value would have to accept every one of those or fight
 * the platform. It is reported, and the handle moves it.
 */
export function ScrollArea({
  axis,
  children,
  className,
  fade,
  gutter,
  label,
  labelledBy,
  maxBlockSize,
  maxInlineSize,
  onOverflowChange,
  onScrollChange,
  overscroll,
  ref,
  render,
  scrollbars,
  style,
  tabbable = true,
  viewportProps,
  ...rest
}: ScrollAreaProps) {
  const defaults = useScrollAreaDefaults();
  const resolvedAxis = axis ?? defaults.axis;
  const resolvedScrollbars = scrollbars ?? defaults.scrollbars;
  const resolvedGutter = gutter ?? defaults.gutter;
  const resolvedFade = fade ?? defaults.fade;
  const resolvedOverscroll = overscroll ?? defaults.overscroll;

  const root = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const edges = useRef<ScrollEdgesHandle | null>(null);

  /**
   * The measurement, as state, so the attributes it becomes are rendered.
   * Before the first effect it is the state of content that fits — four ends
   * showing and nothing overflowing — which paints no veil and writes no tab
   * stop, so a server render and its hydration agree and the veil does not
   * flash on before the browser has said whether there is anything behind it.
   */
  const [state, setState] = useState<ScrollEdgesState>(NO_SCROLL_EDGES);
  const [sideways, setSideways] = useState(false);

  const latestOverflowChange = useRef(onOverflowChange);
  latestOverflowChange.current = onOverflowChange;

  const attachViewport = useCallback(
    (node: HTMLDivElement | null) => {
      setViewport(node);
      assign(viewportProps?.ref, node);
    },
    [viewportProps?.ref],
  );

  /**
   * Never during render, so the server renders a plain scrollport and
   * hydration finds the same DOM. The wiring appears in the first effect after
   * mount, which is also the first moment a browser can say whether the
   * content overflows at all.
   */
  useEffect(() => {
    if (viewport === null) return undefined;

    /* The first measurement is reported synchronously, before the handle is
       returned, so the writing mode is read from the ref once it holds one. */
    const handle = createScrollEdges(viewport, {
      onChange: (next) => {
        setState(next);
        if (edges.current !== null) setSideways(edges.current.sideways());
        latestOverflowChange.current?.(next);
      },
    });
    edges.current = handle;
    setState(handle.state());
    setSideways(handle.sideways());

    return () => {
      handle.destroy();
      edges.current = null;
    };
  }, [viewport]);

  useImperativeHandle<ScrollAreaHandle, ScrollAreaHandle>(
    ref,
    () => ({
      get root() {
        return root.current;
      },
      get viewport() {
        return viewport;
      },
      state: () => edges.current?.state() ?? NO_SCROLL_EDGES,
      position: () => edges.current?.position() ?? { block: 0, inline: 0 },
      scrollTo: (target) => edges.current?.scrollTo(target),
      scrollToEdge: (edge) => edges.current?.scrollToEdge(edge),
      reveal: (element) => edges.current?.reveal(element),
      refresh: () => edges.current?.refresh(),
      focus: () => viewport?.focus(),
    }),
    [viewport],
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    viewportProps?.onScroll?.(event);
    if (onScrollChange !== undefined && edges.current !== null) {
      onScrollChange(edges.current.position(), event);
    }
  };

  const overflowing = state.block.overflowing || state.inline.overflowing;
  const wired = overflowing && tabbable;

  /**
   * The scrollport's role, tab stop and name are the family's own, and
   * `ScrollAreaViewportProps` leaves them out by type: a consumer states a name
   * through `label` and `labelledBy`, which is the one place it can be resolved
   * in order. Everything else in `viewportProps` reaches the element; the two
   * the family composes are taken out here so they are not spread twice.
   */
  const viewportRest = { ...viewportProps };
  delete viewportRest.onScroll;
  delete viewportRest.ref;
  const viewportElement = (
    <div
      {...viewportRest}
      data-part="viewport"
      onScroll={handleScroll}
      ref={attachViewport}
      {...(wired
        ? {
            role: 'region',
            tabIndex: 0,
            ...(labelledBy !== undefined
              ? { 'aria-labelledby': labelledBy }
              : { 'aria-label': label ?? defaults.label }),
          }
        : {})}
    >
      {children}
    </div>
  );

  const props = {
    ...rest,
    className,
    'data-axis': resolvedAxis,
    'data-fade': resolvedFade,
    'data-gutter': resolvedGutter,
    'data-overscroll': resolvedOverscroll,
    'data-part': 'root',
    'data-scrollbars': resolvedScrollbars,
    'data-ui': 'scroll-area',
    ...(sideways ? { 'data-sideways': '' } : {}),
    ...scrollEdgeAttributes(state),
    ref: root,
    style:
      maxBlockSize === undefined && maxInlineSize === undefined
        ? style
        : {
            ...(maxBlockSize === undefined ? {} : { maxBlockSize }),
            ...(maxInlineSize === undefined ? {} : { maxInlineSize }),
            ...style,
          },
    children: viewportElement,
  };

  if (render !== undefined) return render(props);
  return <div {...props} />;
}

/**
 * The inset that scrolls with the content.
 *
 * Padding on a scrollport is not applied at the end edge of its scrollable
 * overflow in every engine, so an inset that has to survive a scroll to the
 * end goes on an element inside it. The family states no inset of its own: the
 * part exists to give the consumer's one a place to live, and an area whose
 * content already carries its own inset renders no `Content` at all.
 */
function ScrollAreaContent({ render, ...rest }: ScrollAreaContentProps) {
  const props = { ...rest, 'data-part': 'content' as const };
  if (render !== undefined) return render(props);
  return <div {...props} />;
}

ScrollArea.Content = ScrollAreaContent;
