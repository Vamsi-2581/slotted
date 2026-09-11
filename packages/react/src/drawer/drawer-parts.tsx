import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import {
  anchorsAtStart,
  EXTENT_LARGE_STEP_PX,
  EXTENT_STEP_PX,
  extentAtPoint,
  holdResizeGesture,
  isInlineSide,
  nearestSnap,
  stepAmountFromPixels,
  stepExtent,
} from '@slotted/core/extent';
import { createFocusScope } from '@slotted/core/focus';
import { clamp } from '@slotted/core/measure';
import { createPortalRoot } from '@slotted/core/portal';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useDrawer } from './drawer';
import type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerContextValue,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOpenReason,
  DrawerPanelProps,
  DrawerPanelRootProps,
  DrawerResizerProps,
  DrawerTitleProps,
  DrawerTriggerProps,
  DrawerTriggerRootProps,
} from './drawer.types';

/**
 * A click synthesised by the keyboard reports no detail; a real one reports the
 * click count. It is how `Enter`, `Space` and a pointer are told apart without
 * a key listener existing for something the platform already handles.
 */
function activationReason(event: MouseEvent): DrawerOpenReason {
  return event.detail === 0 ? 'keyboard' : 'pointer';
}

/** Layout on the client, and nothing at all on the server. */
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

function isRtl(node: HTMLElement | null): boolean {
  return node !== null && getComputedStyle(node).direction === 'rtl';
}

/**
 * The box the panel's measure is a fraction of: the layer under `overlay`,
 * which is fixed to the viewport, and the drawer's own parent under `inline`,
 * where the drawer is what is being sized and cannot measure itself.
 */
function measuringBox(layer: HTMLElement | null, mode: DrawerContextValue['mode']) {
  if (layer === null) return null;
  return mode === 'inline' ? layer.parentElement : layer;
}

/**
 * The control that opens the drawer.
 *
 * It stays where it is written while an overlay layer is portalled out, which
 * is why it is also the layer's *branch*: a press on it is inside the layer as
 * far as `dismissable-layer` is concerned, or opening would immediately be read
 * as an outside press and close what it just opened.
 *
 * `aria-haspopup` is written only under `mode="overlay"`. An inline drawer is a
 * disclosure, not a popup, and the property would promise a layer that never
 * arrives — a distinction none of the six surveyed implementations makes.
 */
export function DrawerTrigger({
  children,
  className,
  onClick,
  ref,
  render,
  style,
  ...nativeProps
}: DrawerTriggerProps) {
  const drawer = useDrawer();

  const rootProps: DrawerTriggerRootProps = {
    ...nativeProps,
    'aria-controls': drawer.mounted ? drawer.panelId : undefined,
    'aria-expanded': drawer.open,
    ...(drawer.mode === 'overlay' ? { 'aria-haspopup': 'dialog' as const } : {}),
    children,
    className,
    'data-part': 'trigger',
    ...(drawer.open ? { 'data-open': '' } : {}),
    id: drawer.triggerId,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      /* The consumer's handler runs first, and preventDefault() refuses the
         open — composed with, never replaced. */
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (drawer.open) drawer.close(activationReason(event), undefined, event);
      else drawer.openWith(activationReason(event), event);
    },
    ref: (node: HTMLButtonElement | null) => {
      drawer.nodes.trigger = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    style,
    type: 'button',
  };

  if (render !== undefined) return render(rootProps);
  return <button {...rootProps} />;
}

/** Where an overlay layer is placed, and what it inherits once it is there. */
function usePortalContainer(drawer: DrawerContextValue): Element | null {
  const [container, setContainer] = useState<Element | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (drawer.mode === 'inline' || !drawer.mounted) return;

    /**
     * The trigger is the origin, and that is a rule rather than a fallback: it
     * is the element the layer was opened from, so its region is the one whose
     * scheme, density, theme and direction the layer inherits. A layer opened
     * from code has no trigger, and the document is then the honest origin.
     *
     * Angular has it better — `<sl-drawer>`'s host element is written in place,
     * so its own parent is the origin whether a trigger exists or not — and the
     * design document records the asymmetry rather than levelling both down.
     */
    const root = createPortalRoot({
      origin: drawer.nodes.trigger,
      ...(drawer.container === undefined ? {} : { container: drawer.container }),
    });
    setContainer(root.container);

    return () => {
      setContainer(null);
      root.release();
    };
  }, [drawer.container, drawer.mode, drawer.mounted, drawer.nodes]);

  return container;
}

/**
 * The measure as a length the stylesheet can use.
 *
 * The public value is a fraction, because that is what the separator's three
 * ARIA values, the limits and the snap points all are. What CSS needs is a
 * length, and a percentage would not do: under `inline` the drawer *is* the box
 * being sized, so a percentage of its own containing block resolves against a
 * track whose size depends on it. The fraction is turned into pixels against
 * the measuring box, and a `ResizeObserver` keeps the two in step so a window
 * resize cannot leave the panel and its reported value disagreeing.
 */
function useExtentLength(
  drawer: DrawerContextValue,
  layer: HTMLElement | null,
): string | undefined {
  const [length, setLength] = useState<string | undefined>(undefined);
  const { extent, mode, side } = drawer;

  useIsomorphicLayoutEffect(() => {
    const box = measuringBox(layer, mode);
    if (box === null || extent === undefined) {
      setLength(undefined);
      return;
    }

    const measure = () => {
      const rect = box.getBoundingClientRect();
      const span = isInlineSide(side) ? rect.width : rect.height;
      if (span > 0) setLength(`${Math.round(extent * span)}px`);
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [extent, layer, mode, side]);

  return length;
}

/**
 * The layer, the scrim and the panel.
 *
 * Two boxes rather than `dialog`'s three. That family needs a viewport between
 * its layer and its panel because its root declares `container-type:
 * inline-size`, which applies `contain: layout`, which makes a scrim positioned
 * inside a scrolling root part of what scrolls. This root declares no container
 * and never scrolls: the panel is pinned to an edge and bounded to the layer by
 * construction, so the scrim and the panel are two cells of one grid.
 *
 * `render` substitutes the **panel**, not the layer. That is the element a
 * consumer needs to change: an inline navigation drawer is a `<nav>` and a
 * filter panel is an `<aside>`, and the family cannot know which.
 */
export function DrawerPanel({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: DrawerPanelProps) {
  const drawer = useDrawer();
  const portal = usePortalContainer(drawer);
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  const extentLength = useExtentLength(drawer, layer);

  const overlay = drawer.mode === 'overlay';
  const labelled = drawer.titleId !== '' && nativeProps['aria-label'] === undefined;

  /**
   * One stable callback, because an inline one is re-run with `null` on every
   * render and `presence` reads that as the exit being over. See
   * `registerLayer` in `drawer.tsx` for what it cost.
   */
  const { registerLayer } = drawer;
  const attachLayer = useCallback(
    (node: HTMLDivElement | null) => {
      setLayer(node);
      registerLayer(node);
    },
    [registerLayer],
  );

  /**
   * Everything the drawer does while it is open, taken down when it closes
   * rather than when the node unmounts — `presence` keeps the node mounted
   * through the exit, and a layer still holding the scroll lock and the
   * background's `inert` for those milliseconds is a page nobody can touch.
   */
  useEffect(() => {
    if (panel === null || layer === null || !drawer.open) return;

    const branches = drawer.nodes.trigger === null ? [] : [drawer.nodes.trigger];
    const dismissable = overlay
      ? /* The panel is what a press is inside of; the scrim is the way out, on
           the click rather than the pointerdown so a selection dragged out of
           the panel is not a press on the scrim. */
        createDismissableLayer(layer, {
          branches,
          content: panel,
          escape: drawer.escape === 'close',
          modal: drawer.modal,
          onDismiss: (request) => {
            if (request.reason === 'outsidePress' && drawer.outsidePress === 'none') {
              return request.cancel();
            }
            drawer.close(request.reason as DrawerOpenReason, undefined, request.source);
          },
          outsidePress: drawer.outsidePress === 'close',
          outsidePressEvent: 'click',
        })
      : null;

    /**
     * An inline drawer contains nothing and moves nothing on open: a sidebar
     * that stole focus every time a breakpoint crossed would be unusable, and
     * Angular Material makes the same split. It still *restores*, because the
     * scope moves focus back only when focus is inside it or on the body — so
     * closing a drawer the reader is standing in returns them to the trigger,
     * and closing one they had already left moves nothing.
     */
    const wanted = drawer.initialFocus;
    const returnTo = drawer.finalFocus;
    const scope = createFocusScope(panel, {
      contain: overlay && drawer.modal,
      initial: !overlay
        ? false
        : typeof wanted === 'object' && wanted !== null
          ? () => wanted.current
          : wanted,
      ...(returnTo === undefined
        ? {}
        : { restore: returnTo === false ? (false as const) : () => returnTo.current }),
    });
    scope.enter();

    return () => {
      scope.destroy();
      dismissable?.destroy();
    };
  }, [drawer, layer, overlay, panel]);

  if (!drawer.mounted) return null;
  if (overlay && portal === null) return null;

  const panelProps: DrawerPanelRootProps = {
    ...nativeProps,
    ...(drawer.descriptionId === '' ? {} : { 'aria-describedby': drawer.descriptionId }),
    ...(labelled ? { 'aria-labelledby': drawer.titleId } : {}),
    ...(drawer.modal ? { 'aria-modal': true } : {}),
    children,
    className,
    'data-part': 'panel',
    id: drawer.panelId,
    ref: (node: HTMLDivElement | null) => {
      setPanel(node);
      drawer.nodes.panel = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    /* Under `inline` the panel is a region of the page rather than a window
       over it, so it writes no role: a navigation drawer is a navigation
       landmark and a filter panel is complementary, and a family that cannot
       know which one guesses wrong half the time. `render` is how a consumer
       says which. */
    ...(overlay ? { role: 'dialog' as const } : {}),
    style,
  };

  const layerNode: ReactNode = (
    <div
      data-mode={drawer.mode}
      data-mount={drawer.mount}
      data-part="root"
      data-side={drawer.side}
      data-size={drawer.size}
      data-ui="drawer"
      {...(drawer.dragging ? { 'data-dragging': '' } : {})}
      {...(drawer.loading ? { 'data-loading': '' } : {})}
      {...(drawer.modal ? { 'data-modal': '' } : {})}
      {...(drawer.visible ? {} : { inert: true })}
      {...(drawer.visible ? { 'data-open': '' } : {})}
      ref={attachLayer}
      style={
        extentLength === undefined
          ? undefined
          : ({ '--slotted-drawer-extent': extentLength } as CSSProperties)
      }
    >
      {/* The scrim belongs to the layer, not to the dismissal policy: `modal`
          decides what happens to the page behind it and never what is painted.
          `dialog` draws it the same way, and a consumer who wants none sets
          `--slotted-drawer-scrim: transparent`. */}
      {overlay ? <div data-part="backdrop" /> : null}
      {render === undefined ? <div {...panelProps} /> : render(panelProps)}
    </div>
  );

  return overlay && portal !== null ? createPortal(layerNode, portal) : layerNode;
}

/**
 * The separator the reader moves, from the WAI-ARIA Window Splitter pattern.
 *
 * **Rendering it is the capability.** There is no `resizable` prop, so a prop
 * with no separator, and a separator a prop had switched off, are both states
 * this family cannot be in.
 *
 * The arrows are physical rather than logical, which is the pattern's own
 * reading: the key names a direction on the screen. `ArrowLeft` grows an
 * `end`-side panel in a left-to-right document and shrinks it in a mirrored
 * one, because there the panel is on the left and the reader is pushing its
 * edge toward the wall.
 */
export function DrawerResizer({
  className,
  largeStep = EXTENT_LARGE_STEP_PX,
  onDoubleClick,
  onKeyDown,
  onPointerDown,
  ref,
  render,
  step = EXTENT_STEP_PX,
  style,
  ...rest
}: DrawerResizerProps) {
  const drawer = useDrawer();
  const node = useRef<HTMLDivElement | null>(null);
  /** Where the pointer last was, which is what decides a dismissal on release. */
  const dragged = useRef<number | null>(null);
  /** What `Enter` restores to once it has collapsed the panel. */
  const restore = useRef<number | null>(null);
  /** What the document looked like before the drag, and how to put it back. */
  const gesture = useRef<(() => void) | null>(null);

  const inline = isInlineSide(drawer.side);
  const current = drawer.extent ?? drawer.minExtent;
  const percent = (value: number) => Math.round(clamp(value, 0, 1) * 100);

  const layerRect = () => {
    const box = measuringBox(drawer.nodes.layer, drawer.mode);
    return box === null ? null : box.getBoundingClientRect();
  };

  const move = (fraction: number, source: unknown) => {
    dragged.current = fraction;
    drawer.requestExtent(fraction, 'pointer', source);
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;

    const rect = layerRect();
    if (rect === null) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    /* The cursor has to survive the pointer leaving the separator, and a drag
       across the page must not select the text under it. Both are the
       document's and neither is reachable from the family's own stylesheet. */
    gesture.current?.();
    gesture.current = holdResizeGesture(
      node.current?.ownerDocument,
      inline ? 'col-resize' : 'row-resize',
    );
    drawer.setDragging(true);
    move(
      extentAtPoint({
        point: { x: event.clientX, y: event.clientY },
        rect,
        rtl: isRtl(node.current),
        side: drawer.side,
      }),
      event,
    );
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawer.dragging) return;
    const rect = layerRect();
    if (rect === null) return;
    move(
      extentAtPoint({
        point: { x: event.clientX, y: event.clientY },
        rect,
        rtl: isRtl(node.current),
        side: drawer.side,
      }),
      event,
    );
  };

  /**
   * One rule on release: a measure below the floor asks to close, carrying
   * `pointer`; anything else commits the nearest stop. A close the consumer
   * cancels leaves the panel at the floor. MUI's `SwipeableDrawer` and Vaul's
   * dismiss gesture both do this, expressed here as a consequence of the resize
   * rather than as a second mechanism.
   */
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawer.dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gesture.current?.();
    gesture.current = null;
    drawer.setDragging(false);

    const last = dragged.current ?? current;
    dragged.current = null;

    if (last < drawer.minExtent) {
      drawer.close('pointer', undefined, event);
      drawer.requestExtent(drawer.minExtent, 'pointer', event);
      return;
    }
    drawer.requestExtent(
      nearestSnap(clamp(last, drawer.minExtent, drawer.maxExtent), drawer.snapPoints),
      'pointer',
      event,
    );
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const atStart = anchorsAtStart(drawer.side, isRtl(node.current));
    const towardFirstEdge = inline ? 'ArrowLeft' : 'ArrowUp';
    const towardLastEdge = inline ? 'ArrowRight' : 'ArrowDown';

    /**
     * A distance and not a proportion. Five per cent of a twelve-hundred-pixel
     * layer is sixty pixels, which is a jump rather than an adjustment; the
     * fraction is still what the family stores, and the pixels are converted
     * against the layer measured at the moment of the press.
     */
    const by = (direction: 1 | -1) => {
      event.preventDefault();
      const rect = layerRect();
      const amount =
        rect === null
          ? 0
          : stepAmountFromPixels({
              pixels: event.shiftKey ? largeStep : step,
              rect,
              side: drawer.side,
            });
      drawer.requestExtent(
        stepExtent({
          amount,
          direction,
          fraction: current,
          max: drawer.maxExtent,
          min: drawer.minExtent,
          snapPoints: drawer.snapPoints,
        }),
        'keyboard',
        event,
      );
    };

    switch (event.key) {
      case towardFirstEdge:
        return by(atStart ? -1 : 1);
      case towardLastEdge:
        return by(atStart ? 1 : -1);
      case 'Home':
        event.preventDefault();
        return drawer.requestExtent(drawer.minExtent, 'keyboard', event);
      case 'End':
        event.preventDefault();
        return drawer.requestExtent(drawer.maxExtent, 'keyboard', event);
      /**
       * The pattern's own key, and the one departure from it: "collapses the
       * pane" would mean closing the drawer, and Escape already means that. A
       * reader who presses Enter on a separator expects the separator to still
       * be there afterwards.
       */
      case 'Enter': {
        event.preventDefault();
        if (current > drawer.minExtent) {
          restore.current = current;
          return drawer.requestExtent(drawer.minExtent, 'keyboard', event);
        }
        return drawer.requestExtent(restore.current ?? drawer.maxExtent, 'keyboard', event);
      }
      default:
        return;
    }
  };

  /**
   * Back to the measure the size step gives it, which is what `undefined`
   * means for this state. It is the one gesture in the family that restores
   * rather than moves, and every desktop pane divider answers a double click
   * with it.
   */
  const doubleClick = (event: MouseEvent<HTMLDivElement>) => {
    onDoubleClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    drawer.requestExtent(drawer.defaultExtent, 'pointer', event);
  };

  const rootProps = {
    'aria-controls': drawer.panelId,
    ...(drawer.titleId === '' ? {} : { 'aria-labelledby': drawer.titleId }),
    'aria-orientation': (inline ? 'vertical' : 'horizontal') as 'vertical' | 'horizontal',
    'aria-valuemax': percent(drawer.maxExtent),
    'aria-valuemin': percent(drawer.minExtent),
    'aria-valuenow': percent(clamp(current, drawer.minExtent, drawer.maxExtent)),
    ...rest,
    className,
    'data-part': 'resizer' as const,
    onDoubleClick: doubleClick,
    onKeyDown: keyDown,
    onLostPointerCapture: endDrag,
    onPointerDown: pointerDown,
    onPointerMove: pointerMove,
    onPointerUp: endDrag,
    role: 'separator' as const,
    style,
    tabIndex: 0,
  };

  const attach = (element: HTMLDivElement | null) => {
    node.current = element;
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  };

  if (render !== undefined) return render({ ...rootProps, ref: attach } as never);
  return <div {...rootProps} ref={attach} />;
}

export function DrawerHeader({
  children,
  className,
  ref,
  render,
  style,
  ...rest
}: DrawerHeaderProps) {
  const rootProps = { ...rest, children, className, 'data-part': 'header' as const, style };
  if (render !== undefined) return render(rootProps);
  return <header {...rootProps} ref={ref} />;
}

/** The visible name, which `aria-labelledby` points at — on the panel and, as
 *  the Window Splitter pattern requires, on the separator that sizes it. */
export function DrawerTitle({
  children,
  className,
  ref,
  render,
  style,
  ...rest
}: DrawerTitleProps) {
  const drawer = useDrawer();
  useEffect(() => drawer.announce('title'), [drawer]);

  const rootProps = {
    ...rest,
    children,
    className,
    'data-part': 'title' as const,
    id: drawer.titleId === '' ? undefined : drawer.titleId,
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <h2 {...rootProps} ref={ref} />;
}

/** The sentence that says what the drawer is about. */
export function DrawerDescription({
  children,
  className,
  ref,
  render,
  style,
  ...rest
}: DrawerDescriptionProps) {
  const drawer = useDrawer();
  useEffect(() => drawer.announce('description'), [drawer]);

  const rootProps = {
    ...rest,
    children,
    className,
    'data-part': 'description' as const,
    id: drawer.descriptionId === '' ? undefined : drawer.descriptionId,
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <p {...rootProps} ref={ref} />;
}

/**
 * The one row that scrolls, and the row `aria-busy` belongs to while the
 * content is still on its way — the header, the close button, Escape and the
 * separator all stay operable, because a drawer a reader cannot leave is the
 * worse failure of the two.
 */
export function DrawerBody({
  children,
  className,
  inset,
  ref,
  render,
  style,
  ...rest
}: DrawerBodyProps) {
  const drawer = useDrawer();
  const rootProps = {
    ...rest,
    ...(drawer.loading ? { 'aria-busy': true } : {}),
    children,
    className,
    ...(inset === undefined ? {} : { 'data-inset': inset }),
    'data-part': 'body' as const,
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <div {...rootProps} ref={ref} />;
}

export function DrawerFooter({
  children,
  className,
  ref,
  render,
  style,
  ...rest
}: DrawerFooterProps) {
  const rootProps = { ...rest, children, className, 'data-part': 'footer' as const, style };
  if (render !== undefined) return render(rootProps);
  return <footer {...rootProps} ref={ref} />;
}

/**
 * The ✕ in the corner. It carries `dismiss`, which is the word the closed
 * vocabulary in `docs/state-and-events.md` already has for what a close button
 * means, and its `value` rides out on the request as the result.
 */
export function DrawerClose({
  children,
  className,
  onClick,
  ref,
  render,
  style,
  value,
  ...rest
}: DrawerCloseProps) {
  const drawer = useDrawer();

  const rootProps = {
    'aria-label': 'Close',
    ...rest,
    children,
    className,
    'data-part': 'close' as const,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      drawer.close('dismiss', value, event);
    },
    style,
    type: 'button' as const,
  };
  if (render !== undefined) return render(rootProps);
  return <button {...rootProps} ref={ref} />;
}
