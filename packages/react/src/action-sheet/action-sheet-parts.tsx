import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import { createFocusScope, createRovingTabindex } from '@slotted/core/focus';
import type { RovingTabindexHandle } from '@slotted/core/focus';
import { createPortalRoot } from '@slotted/core/portal';
import { createTypeahead, isPrintable } from '@slotted/core/typeahead';
import type { TypeaheadHandle } from '@slotted/core/typeahead';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, KeyboardEvent, MouseEvent, PointerEvent, Ref } from 'react';
import { createPortal } from 'react-dom';

import { useActionSheet } from './action-sheet';
import type {
  ActionSheetCancelProps,
  ActionSheetCancelRootProps,
  ActionSheetContentProps,
  ActionSheetContentRootProps,
  ActionSheetContextValue,
  ActionSheetGroupLabelProps,
  ActionSheetGroupProps,
  ActionSheetHeaderProps,
  ActionSheetItemProps,
  ActionSheetItemRootProps,
  ActionSheetListProps,
  ActionSheetMessageProps,
  ActionSheetMessageRootProps,
  ActionSheetOpenReason,
  ActionSheetSelectEvent,
  ActionSheetSeparatorProps,
  ActionSheetTitleProps,
  ActionSheetTitleRootProps,
  ActionSheetTriggerProps,
  ActionSheetTriggerRootProps,
} from './action-sheet.types';

/** Layout on the client, and nothing at all on the server. */
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

const ITEM_SELECTOR = "[data-part='item']";

/** Two refs on one element: the family's, and whatever the consumer passed. */
function attach<T>(node: T, ...refs: (Ref<T> | undefined)[]) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node);
    else if (ref !== null && ref !== undefined) ref.current = node;
  }
}

/**
 * The family's handler runs after the consumer's, and only if the consumer has
 * not called `preventDefault` — the rule every family in this library composes by.
 */
function compose<E extends { defaultPrevented: boolean }>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
) {
  return (event: E) => {
    theirs?.(event);
    if (!event.defaultPrevented) ours(event);
  };
}

/**
 * A click synthesised by the keyboard reports no detail; a real one reports the
 * click count. It tells `Enter` and `Space` from a press without a key listener
 * for something the platform already handles.
 */
function activationReason(event: MouseEvent): 'pointer' | 'keyboard' {
  return event.detail === 0 ? 'keyboard' : 'pointer';
}

const items = (list: HTMLElement | null) =>
  list === null ? [] : [...list.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];

/** What typeahead matches on: what the item says it is, or its label. */
const textOf = (item: HTMLElement) =>
  item.dataset['textValue'] ??
  item.querySelector("[data-part='label']")?.textContent?.trim() ??
  item.textContent?.trim() ??
  '';

const operable = (item: HTMLElement) =>
  item.dataset['disabled'] === undefined && item.dataset['loading'] === undefined;

/**
 * Where focus enters, from the dialog pattern's first note: the first action
 * that can run, unless it is destructive, in which case the least destructive
 * action — the cancel, or the first action that is not `danger`, or the panel.
 */
export function entryTarget(panel: HTMLElement): HTMLElement {
  const list = panel.querySelector<HTMLElement>("[data-part='list']");
  const enabled = items(list).filter(operable);
  const first = enabled[0];
  if (first !== undefined && first.dataset['tone'] !== 'danger') return first;
  const cancel = panel.querySelector<HTMLElement>("[data-part='cancel']");
  if (cancel !== null) return cancel;
  return enabled.find((item) => item.dataset['tone'] !== 'danger') ?? panel;
}

/**
 * The control that opens the sheet. It is also the layer's branch: a press on
 * it counts as inside the layer, or opening would be read as an outside press
 * and close what it had just opened.
 */
export function ActionSheetTrigger({
  children,
  onClick,
  ref,
  render,
  ...nativeProps
}: ActionSheetTriggerProps) {
  const sheet = useActionSheet();

  const rootProps: ActionSheetTriggerRootProps = {
    ...nativeProps,
    'aria-controls': sheet.mounted ? sheet.panelId : undefined,
    'aria-expanded': sheet.open,
    'aria-haspopup': 'dialog',
    children,
    'data-part': 'trigger',
    ...(sheet.open ? { 'data-open': '' } : {}),
    id: nativeProps.id ?? sheet.triggerId,
    onClick: compose(onClick, (event: MouseEvent<HTMLButtonElement>) => {
      if (sheet.open) sheet.close(activationReason(event), undefined, event.nativeEvent);
      else sheet.openWith(activationReason(event), event.nativeEvent);
    }) as ActionSheetTriggerRootProps['onClick'],
    ref: (node: HTMLElement | null) => {
      sheet.nodes.trigger = node;
      attach(node as HTMLButtonElement | null, ref);
    },
    type: 'button',
  };

  if (render !== undefined) return render(rootProps);
  return <button {...(rootProps as ActionSheetTriggerProps)} />;
}

/** Where the layer is placed, and what it inherits once it is there. */
function usePortalContainer(sheet: ActionSheetContextValue): Element | null {
  const [container, setContainer] = useState<Element | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!sheet.mounted) return;
    /* The trigger is the origin: its region's scheme, density, theme and
       direction are the layer's. A sheet opened from code has no trigger, and
       the document is then the honest origin. */
    const root = createPortalRoot({
      origin: sheet.nodes.trigger,
      ...(sheet.container === undefined ? {} : { container: sheet.container }),
    });
    setContainer(root.container);
    return () => {
      setContainer(null);
      root.release();
    };
  }, [sheet.container, sheet.mounted, sheet.nodes]);

  return container;
}

/**
 * The layer, the scrim and the panel. `render` substitutes the panel, which is
 * the element with the role.
 */
export function ActionSheetContent({
  children,
  ref,
  render,
  ...nativeProps
}: ActionSheetContentProps) {
  const sheet = useActionSheet();
  const portal = usePortalContainer(sheet);
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  const labelled = sheet.titleId !== '' && nativeProps['aria-label'] === undefined;

  const { registerLayer } = sheet;
  const attachLayer = useCallback(
    (node: HTMLDivElement | null) => {
      setLayer(node);
      registerLayer(node);
    },
    [registerLayer],
  );

  /**
   * Everything the sheet does while it is open, taken down when it closes
   * rather than when the node unmounts: `presence` keeps the node through the
   * exit, and a layer still holding the scroll lock and the page's `inert` for
   * those milliseconds is a page nobody can touch.
   */
  useEffect(() => {
    if (panel === null || layer === null || !sheet.open) return;

    sheet.lastReason.current = null;
    const branches = sheet.nodes.trigger === null ? [] : [sheet.nodes.trigger];
    const dismissable = createDismissableLayer(layer, {
      /* A history entry is a modal layer's: a sheet the page stays reachable
         under has no claim on the way back. */
      back: sheet.modal && sheet.back === 'close',
      branches,
      content: panel,
      escape: sheet.escape === 'close',
      modal: sheet.modal,
      onDismiss: (request) => {
        if (request.reason === 'outsidePress' && sheet.outsidePress === 'none') {
          return request.cancel();
        }
        sheet.close(request.reason as ActionSheetOpenReason, undefined, request.source);
      },
      outsidePress: sheet.outsidePress === 'close',
      /* The click rather than the pointerdown, so a scroll of the page that
         began on the scrim is not a press on it. */
      outsidePressEvent: 'click',
    });

    const origin = panel.ownerDocument.activeElement as HTMLElement | null;
    const returnTo = sheet.finalFocus;
    const wanted = sheet.initialFocus;
    const scope = createFocusScope(panel, {
      contain: sheet.modal,
      initial: wanted === false ? false : () => wanted?.current ?? entryTarget(panel),
      restore:
        returnTo === false
          ? false
          : () => {
              /* A press on the live page behind a non-modal sheet was the
                 reader going somewhere; taking focus back would fight them. */
              if (!sheet.modal && sheet.lastReason.current === 'outsidePress') return null;
              const target = returnTo?.current ?? origin;
              const usable =
                target !== null && target.isConnected && target !== target.ownerDocument.body;
              return usable ? target : sheet.nodes.trigger;
            },
    });
    scope.enter();

    return () => {
      scope.destroy();
      dismissable.destroy();
    };
  }, [sheet, layer, panel]);

  if (!sheet.mounted || portal === null) return null;

  const panelProps: ActionSheetContentRootProps = {
    ...nativeProps,
    ...(sheet.messageId === '' ? {} : { 'aria-describedby': sheet.messageId }),
    ...(labelled ? { 'aria-labelledby': sheet.titleId } : {}),
    ...(sheet.modal ? { 'aria-modal': true } : {}),
    children,
    'data-part': 'panel',
    id: sheet.panelId,
    ref: (node: HTMLElement | null) => {
      setPanel(node);
      sheet.nodes.panel = node;
      attach(node as HTMLDivElement | null, ref);
    },
    role: 'dialog',
    /* The panel takes focus when the pointer leaves an item, so one row is
       never left lit under a pointer that has moved on. */
    tabIndex: -1,
  };

  const layerNode = (
    <div
      data-mount={sheet.mount}
      data-part="root"
      data-ui="action-sheet"
      {...(sheet.modal ? { 'data-modal': '' } : {})}
      {...(sheet.interactive ? {} : { inert: true })}
      {...(sheet.visible ? { 'data-open': '' } : {})}
      ref={attachLayer}
    >
      <div data-part="backdrop" />
      {render === undefined ? (
        <div {...(panelProps as ActionSheetContentProps)} />
      ) : (
        render(panelProps)
      )}
    </div>
  );

  return createPortal(layerNode, portal);
}

export function ActionSheetHeader(props: ActionSheetHeaderProps) {
  return <header data-part="header" {...props} />;
}

/** The name of the dialog and of the list. */
export function ActionSheetTitle({ ref, render, ...nativeProps }: ActionSheetTitleProps) {
  const { announce, baseId } = useActionSheet();
  useEffect(() => announce('title'), [announce]);

  const rootProps: ActionSheetTitleRootProps = {
    ...nativeProps,
    'data-part': 'title',
    id: `${baseId}title`,
    ref: (node) => attach(node as HTMLHeadingElement | null, ref),
  };
  if (render !== undefined) return render(rootProps);
  return <h2 {...(rootProps as ActionSheetTitleProps)} />;
}

/** The dialog's description. */
export function ActionSheetMessage({ ref, render, ...nativeProps }: ActionSheetMessageProps) {
  const { announce, baseId } = useActionSheet();
  useEffect(() => announce('message'), [announce]);

  const rootProps: ActionSheetMessageRootProps = {
    ...nativeProps,
    'data-part': 'message',
    id: `${baseId}message`,
    ref: (node) => attach(node as HTMLParagraphElement | null, ref),
  };
  if (render !== undefined) return render(rootProps);
  return <p {...(rootProps as ActionSheetMessageProps)} />;
}

/**
 * The menu: one tab stop for every action, the arrows, `Home`, `End` and
 * typeahead. It is fixed as a `div` with `role="menu"`, because the role and
 * the keyboard are what it is.
 */
export function ActionSheetList({ onFocus, onKeyDown, ref, ...nativeProps }: ActionSheetListProps) {
  const sheet = useActionSheet();
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const roving = useRef<RovingTabindexHandle | null>(null);
  const typeahead = useRef<TypeaheadHandle | null>(null);

  useEffect(() => {
    if (list === null) return;
    const handle = createRovingTabindex(list, {
      includeAriaDisabled: true,
      itemSelector: ITEM_SELECTOR,
      orientation: () => 'vertical',
    });
    roving.current = handle;
    const search = createTypeahead();
    typeahead.current = search;
    return () => {
      handle.destroy();
      search.destroy();
      roving.current = null;
      typeahead.current = null;
    };
  }, [list]);

  /* An item added, removed or disabled moves the stop; the list re-reads its
     items on every render rather than guessing which change mattered. */
  useEffect(() => {
    roving.current?.refresh();
  });

  const labelled = sheet.titleId !== '' && nativeProps['aria-label'] === undefined;

  return (
    <div
      aria-orientation="vertical"
      {...(labelled ? { 'aria-labelledby': sheet.titleId } : {})}
      {...nativeProps}
      data-part="list"
      onFocus={compose(onFocus, (event) => {
        /* Focus that arrived by the pointer or by entry moves the stop with
           it, so `Tab` out and back returns to the same item. */
        const index = items(list).indexOf(event.target as HTMLElement);
        if (index !== -1) roving.current?.setActive(index);
      })}
      onKeyDown={compose(onKeyDown, (event: KeyboardEvent<HTMLDivElement>) => {
        const search = typeahead.current;
        if (search === null || event.ctrlKey || event.metaKey || event.altKey) return;
        if (!isPrintable(event.key, search.query.length > 0)) return;
        event.preventDefault();
        const all = items(list);
        const from = all.indexOf(event.target as HTMLElement);
        const index = search.match(event.key, all.map(textOf), from);
        all[index]?.focus();
      })}
      ref={(node) => {
        setList(node);
        sheet.nodes.list = node;
        attach(node, ref);
      }}
      role="menu"
    />
  );
}

export function ActionSheetGroupLabel(props: ActionSheetGroupLabelProps) {
  return <div data-part="group-label" {...props} />;
}

/** A run of related actions, named by its label when it has one. */
export function ActionSheetGroup({ children, label, ...nativeProps }: ActionSheetGroupProps) {
  const labelId = `${useId()}label`;
  return (
    <div
      {...(label === undefined ? {} : { 'aria-labelledby': labelId })}
      {...nativeProps}
      data-part="group"
      role="group"
    >
      {label === undefined ? null : (
        <ActionSheetGroupLabel id={labelId}>{label}</ActionSheetGroupLabel>
      )}
      {children}
    </div>
  );
}

export function ActionSheetSeparator(props: ActionSheetSeparatorProps) {
  return <hr data-part="separator" role="separator" {...props} />;
}

/**
 * One action. A native `button` with `role="menuitem"`, as in `menu`: the
 * platform gives the press, `Enter` and `Space`, and the role makes it an item
 * of the list. A disabled or loading item keeps its tab index and takes
 * `aria-disabled`, because the pattern keeps disabled items in the ring.
 */
export function ActionSheetItem({
  children,
  closeOnSelect,
  description,
  disabled,
  icon,
  loading,
  onClick,
  onPointerLeave,
  onPointerMove,
  onSelect,
  ref,
  render,
  textValue,
  tone,
  value,
  ...nativeProps
}: ActionSheetItemProps) {
  const sheet = useActionSheet();
  const descriptionId = `${useId()}description`;
  const inert = disabled === true || loading === true;

  const select = (reason: 'pointer' | 'keyboard', source: Event) => {
    if (inert) return;
    let prevented = false;
    const event: ActionSheetSelectEvent = {
      reason,
      source,
      value,
      get defaultPrevented() {
        return prevented;
      },
      preventDefault: () => {
        prevented = true;
      },
    };
    onSelect?.(event);
    if (prevented) return;
    if (closeOnSelect ?? sheet.closeOnSelect) sheet.close('select', value, source);
  };

  const rootProps: ActionSheetItemRootProps = {
    ...(nativeProps as Omit<typeof nativeProps, 'type'>),
    type: 'button',
    children: (
      <>
        {icon === undefined && loading !== true ? null : (
          <span aria-hidden="true" data-part="icon">
            {loading === true ? <span data-ui="spinner" /> : icon}
          </span>
        )}
        <span data-part="label">{children}</span>
        {description === undefined ? null : (
          <span data-part="description" id={descriptionId}>
            {description}
          </span>
        )}
      </>
    ),
    ...(description === undefined ? {} : { 'aria-describedby': descriptionId }),
    ...(inert ? { 'aria-disabled': true } : {}),
    ...(loading === true ? { 'aria-busy': true, 'data-loading': '' } : {}),
    ...(disabled === true ? { 'data-disabled': '' } : {}),
    ...(textValue === undefined ? {} : { 'data-text-value': textValue }),
    ...(tone === undefined ? {} : { 'data-tone': tone }),
    ...(value === undefined ? {} : { 'data-value': value }),
    'data-part': 'item',
    onClick: compose(onClick, (event: MouseEvent<HTMLButtonElement>) =>
      select(activationReason(event), event.nativeEvent),
    ) as ActionSheetItemRootProps['onClick'],
    /**
     * A mouse or a pen over an item focuses it, so exactly one row is lit
     * whichever device is driving. A finger does not: focus moving under a
     * touch that is about to scroll the list would light rows at random.
     */
    onPointerMove: compose(onPointerMove, (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'touch') return;
      const item = event.currentTarget;
      if (item.ownerDocument.activeElement !== item) item.focus({ preventScroll: true });
    }) as ActionSheetItemRootProps['onPointerMove'],
    onPointerLeave: compose(onPointerLeave, (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'touch') return;
      const item = event.currentTarget;
      if (item.ownerDocument.activeElement === item)
        sheet.nodes.panel?.focus({ preventScroll: true });
    }) as ActionSheetItemRootProps['onPointerLeave'],
    ref: (node: HTMLElement | null) => attach(node as HTMLButtonElement | null, ref),
    role: 'menuitem',
    tabIndex: -1,
  };

  if (render !== undefined) return render(rootProps);
  return <button {...(rootProps as unknown as ComponentPropsWithRef<'button'>)} />;
}

/**
 * The footer and the explicit way out. Never disabled: a sheet that cannot be
 * left is a trap, which is also Ionic's reading.
 */
export function ActionSheetCancel({
  children,
  onClick,
  ref,
  render,
  ...nativeProps
}: ActionSheetCancelProps) {
  const sheet = useActionSheet();

  const rootProps: ActionSheetCancelRootProps = {
    ...nativeProps,
    children: children ?? sheet.cancelLabel,
    'data-part': 'cancel',
    onClick: compose(onClick, (event: MouseEvent<HTMLButtonElement>) =>
      sheet.close('dismiss', undefined, event.nativeEvent),
    ) as ActionSheetCancelRootProps['onClick'],
    ref: (node: HTMLElement | null) => attach(node as HTMLButtonElement | null, ref),
    type: 'button',
  };

  return (
    <div data-part="footer">
      {render === undefined ? (
        <button {...(rootProps as ActionSheetCancelProps)} disabled={false} />
      ) : (
        render(rootProps)
      )}
    </div>
  );
}
