import '@slotted/styles/action-sheet/action-sheet.css';
import '@slotted/styles/spinner/spinner.css';

import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useActionSheetDefaults } from './action-sheet-defaults';
import type {
  ActionSheetContextValue,
  ActionSheetHandle,
  ActionSheetOpenReason,
  ActionSheetProps,
} from './action-sheet.types';

const ActionSheetContext = createContext<ActionSheetContextValue | undefined>(undefined);

/**
 * What the sheet around this part says. A part outside one has no sheet to
 * belong to, so this throws rather than rendering an item that closes nothing.
 */
export function useActionSheet(): ActionSheetContextValue {
  const context = useContext(ActionSheetContext);
  if (context === undefined) {
    throw new Error('Every action sheet part must be rendered inside ActionSheet.');
  }
  return context;
}

/**
 * A short list of actions that rises from the bottom edge, and the explicit
 * way out beneath it.
 *
 * The layer is composed from `packages/core`, the modules `drawer` composes:
 * `portal` places it and keeps the theme of the region that opened it,
 * `dismissable-layer` owns Escape, the outside press, the way back, `inert`,
 * the scroll lock and the single z-index stack, `presence` keeps it mounted
 * long enough to leave, and `focus` contains the keyboard and gives it back.
 * `docs/history/designs/2026-09-24-action-sheet-design.md` §4.1 says why the
 * family does not render `drawer`'s parts.
 *
 * This component renders no DOM. It is the provider: the trigger stays where
 * it is written while the layer is portalled out.
 */
export function ActionSheet({
  back,
  cancelLabel,
  children,
  closeOnSelect,
  container,
  defaultOpen,
  escape,
  finalFocus,
  initialFocus,
  modal,
  mount,
  onOpenChange,
  open,
  outsidePress,
  ref,
}: ActionSheetProps) {
  const defaults = useActionSheetDefaults();
  const baseId = useId();

  const [ownOpen, setOwnOpen] = useState<boolean>(defaultOpen ?? false);
  const currentOpen = open ?? ownOpen;

  const resolvedMount = mount ?? defaults.mount;

  /**
   * The status rather than a boolean. `entering` is one frame long, and it is
   * what gives the panel a closed style to transition from.
   */
  const [status, setStatus] = useState<PresenceStatus>(currentOpen ? 'open' : 'unmounted');
  const presence = useRef<PresenceHandle | null>(null);
  if (presence.current === null) {
    presence.current = createPresence({ present: currentOpen, onStatusChange: setStatus });
  }

  useEffect(() => {
    presence.current?.sync(currentOpen);
  }, [currentOpen]);

  useEffect(() => {
    const handle = presence.current;
    return () => handle?.destroy();
  }, []);

  /** Whether this sheet has ever been open, which is what `lazy` reads. */
  const seen = useRef(currentOpen);
  if (currentOpen) seen.current = true;

  const mounted =
    resolvedMount === 'eager'
      ? true
      : resolvedMount === 'lazy'
        ? seen.current
        : status !== 'unmounted';

  const nodes = useRef({
    list: null as HTMLElement | null,
    panel: null as HTMLElement | null,
    trigger: null as HTMLElement | null,
  });
  const lastReason = useRef<ActionSheetOpenReason | null>(null);

  const [titleRendered, setTitleRendered] = useState(false);
  const [messageRendered, setMessageRendered] = useState(false);

  /**
   * A part says it exists, so the panel names only what was rendered: an
   * `aria-labelledby` pointing at an id nothing carries is worse than none.
   */
  const announce = useCallback<ActionSheetContextValue['announce']>((part) => {
    if (part === 'title') setTitleRendered(true);
    else setMessageRendered(true);
    return () => {
      if (part === 'title') setTitleRendered(false);
      else setMessageRendered(false);
    };
  }, []);

  /**
   * Stable for the life of the component. `presence` reads `setNode(null)`
   * during an exit as the exit ending, and an inline ref callback is called
   * with `null` on every render — the lesson `drawer` recorded.
   */
  const registerLayer = useCallback((node: HTMLElement | null) => {
    presence.current?.setNode(node);
  }, []);

  const requestOpen = useCallback(
    (next: boolean, reason: ActionSheetOpenReason, result: string | undefined, source: unknown) => {
      if (next === currentOpen) return;

      let cancelled = false;
      const state = createControllable<boolean>({
        controlled: open,
        initial: currentOpen,
        onRequest: (raw) => {
          cancelled = raw.cancelled;
          onOpenChange?.(raw.value, {
            get cancelled() {
              return raw.cancelled;
            },
            cancel: () => raw.cancel(),
            previous: raw.previous,
            reason,
            result,
            source: raw.source,
            value: raw.value,
          });
        },
      });

      const moved = state.request(next, reason, source);
      if (cancelled) return;
      if (!next) lastReason.current = reason;
      if (moved) setOwnOpen(next);
    },
    [currentOpen, onOpenChange, open],
  );

  useImperativeHandle<ActionSheetHandle, ActionSheetHandle>(
    ref,
    () => ({
      open: () => requestOpen(true, 'programmatic', undefined, undefined),
      close: () => requestOpen(false, 'programmatic', undefined, undefined),
      focus: () => {
        const stop = nodes.current.list?.querySelector<HTMLElement>(
          "[data-part='item'][tabindex='0']",
        );
        (stop ?? nodes.current.panel)?.focus();
      },
    }),
    [requestOpen],
  );

  const value = useMemo<ActionSheetContextValue>(
    () => ({
      announce,
      back: back ?? defaults.back,
      baseId,
      cancelLabel: cancelLabel ?? defaults.cancelLabel,
      close: (reason, result, source) => requestOpen(false, reason, result, source),
      closeOnSelect: closeOnSelect ?? defaults.closeOnSelect,
      container,
      escape: escape ?? defaults.escape,
      finalFocus,
      initialFocus,
      interactive: status === 'entering' || status === 'open',
      lastReason,
      messageId: messageRendered ? `${baseId}message` : '',
      modal: modal ?? defaults.modal,
      mount: resolvedMount,
      mounted,
      nodes: nodes.current,
      open: currentOpen,
      openWith: (reason, source) => requestOpen(true, reason, undefined, source),
      outsidePress: outsidePress ?? defaults.outsidePress,
      panelId: `${baseId}panel`,
      registerLayer,
      titleId: titleRendered ? `${baseId}title` : '',
      triggerId: `${baseId}trigger`,
      /** What the stylesheet keys on, which is a frame behind what was asked. */
      visible: status === 'open',
    }),
    [
      announce,
      back,
      baseId,
      cancelLabel,
      closeOnSelect,
      container,
      currentOpen,
      defaults,
      escape,
      finalFocus,
      initialFocus,
      messageRendered,
      modal,
      mounted,
      outsidePress,
      registerLayer,
      requestOpen,
      resolvedMount,
      status,
      titleRendered,
    ],
  );

  return <ActionSheetContext.Provider value={value}>{children}</ActionSheetContext.Provider>;
}
