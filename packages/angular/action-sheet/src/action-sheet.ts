import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import type { DismissableLayerHandle } from '@slotted/core/dismissable-layer';
import { createFocusScope } from '@slotted/core/focus';
import type { FocusScopeHandle } from '@slotted/core/focus';
import { createPortalRoot } from '@slotted/core/portal';
import type { PortalRootHandle } from '@slotted/core/portal';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { injectActionSheetDefaults, SlActionSheetIdFactory } from './action-sheet-defaults';
import type {
  ActionSheetChangeRequest,
  ActionSheetDismissPolicy,
  ActionSheetMount,
  ActionSheetOpenReason,
} from './action-sheet-defaults';

const optionalBoolean = (given: boolean | string | undefined) =>
  given === undefined ? undefined : booleanAttribute(given);

/**
 * Where focus enters, from the dialog pattern's first note: the first action
 * that can run, unless it is destructive, in which case the least destructive
 * action — the cancel, or the first action that is not `danger`, or the panel.
 */
export function entryTarget(panel: HTMLElement): HTMLElement {
  const items = [...panel.querySelectorAll<HTMLElement>("[data-part='list'] [data-part='item']")];
  const enabled = items.filter(
    (item) => item.dataset['disabled'] === undefined && item.dataset['loading'] === undefined,
  );
  const first = enabled[0];
  if (first !== undefined && first.dataset['tone'] !== 'danger') return first;
  const cancel = panel.querySelector<HTMLElement>("[data-part='cancel']");
  if (cancel !== null) return cancel;
  return enabled.find((item) => item.dataset['tone'] !== 'danger') ?? panel;
}

/**
 * A short list of actions that rises from the bottom edge, and the explicit
 * way out beneath it.
 *
 * The layer is composed from `packages/core`, the modules `drawer` composes:
 * `portal`, `dismissable-layer`, `presence` and `focus`.
 * `docs/history/designs/2026-09-24-action-sheet-design.md` §4.1 says why the
 * family does not render `drawer`'s parts.
 *
 * The host renders `display: contents` and stays where the consumer wrote it;
 * the layer is the `div` in the template, moved into the portal while mounted
 * and given back before it is destroyed. The host is the portal's origin, so
 * the layer keeps the theme of the region it was written in with or without a
 * trigger.
 */
@Component({
  selector: 'sl-action-sheet',
  standalone: true,
  exportAs: 'slActionSheet',
  template: `
    @if (mounted()) {
      <div
        #layer
        data-ui="action-sheet"
        data-part="root"
        [attr.data-mount]="resolvedMount()"
        [attr.data-modal]="resolvedModal() ? '' : null"
        [attr.data-open]="visible() ? '' : null"
        [attr.inert]="interactive() ? null : ''"
      >
        <div data-part="backdrop"></div>
        <div
          #panel
          data-part="panel"
          role="dialog"
          tabindex="-1"
          [id]="panelId"
          [attr.aria-modal]="resolvedModal() ? 'true' : null"
          [attr.aria-label]="writtenLabel"
          [attr.aria-labelledby]="labelledBy()"
          [attr.aria-describedby]="describedBy()"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
  styleUrls: [
    '../../../styles/src/action-sheet/action-sheet.css',
    '../../../styles/src/spinner/spinner.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[style.display]': "'contents'" },
})
export class SlActionSheet {
  /** Whether the sheet is open. Two-way, so a template may bind it directly. */
  readonly open = model<boolean>(false);

  readonly modal = input(undefined, { transform: optionalBoolean });
  readonly mount = input<ActionSheetMount | undefined>(undefined);
  readonly escape = input<ActionSheetDismissPolicy | undefined>(undefined);
  readonly outsidePress = input<ActionSheetDismissPolicy | undefined>(undefined);
  /** The platform's way back closes the sheet instead of leaving the page, while modal. */
  readonly back = input<ActionSheetDismissPolicy | undefined>(undefined);
  readonly closeOnSelect = input(undefined, { transform: optionalBoolean });
  /** The words the cancel shows when it is given none. */
  readonly cancelLabel = input<string | undefined>(undefined);
  /** A parent for this layer alone, instead of the shared portal root. */
  readonly container = input<Element | null | undefined>(undefined);
  /**
   * Where focus goes when the sheet opens. Unstated, the first action that can
   * run, or the least destructive one when that action is `danger`. `false`
   * moves nothing, for a sheet that stands open beside the reader's work.
   */
  readonly initialFocus = input<HTMLElement | false | undefined>(undefined);
  /** Where focus goes when the sheet closes. Defaults to what held it on opening. */
  readonly finalFocus = input<HTMLElement | false | undefined>(undefined);

  /** One output per transition, carrying its reason, its result and its event. */
  readonly openChangeRequest = output<ActionSheetChangeRequest>();
  /** Fires once the sheet has closed, with the value of the item chosen. */
  readonly closed = output<string | undefined>();

  private readonly defaults = injectActionSheetDefaults();
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseId = inject(SlActionSheetIdFactory).next();
  private readonly origin = this.host.parentElement;

  /**
   * A consumer's `aria-label` on `<sl-action-sheet>`, read before the host
   * bindings are written and moved to the panel, which carries the role.
   */
  protected readonly writtenLabel = inject(new HostAttributeToken('aria-label'), {
    optional: true,
  });

  protected readonly layerRef = viewChild<ElementRef<HTMLElement>>('layer');
  protected readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  readonly hasTitle = signal(false);
  readonly hasMessage = signal(false);
  readonly triggerNode = signal<HTMLElement | null>(null);

  readonly titleId = `${this.baseId}-title`;
  readonly messageId = `${this.baseId}-message`;
  readonly panelId = `${this.baseId}-panel`;
  readonly triggerId = `${this.baseId}-trigger`;

  private readonly status = signal<PresenceStatus>('unmounted');
  private readonly presence: PresenceHandle = createPresence({
    present: false,
    onStatusChange: (next) => this.status.set(next),
  });

  private readonly seen = signal(false);
  private result: string | undefined = undefined;
  private lastReason: ActionSheetOpenReason | null = null;
  /** A sheet torn down while open emits no `closed`: nothing is listening. */
  private destroyed = false;

  readonly resolvedModal = computed(() => this.modal() ?? this.defaults.modal);
  readonly resolvedMount = computed(() => this.mount() ?? this.defaults.mount);
  readonly resolvedCloseOnSelect = computed(
    () => this.closeOnSelect() ?? this.defaults.closeOnSelect,
  );
  readonly resolvedCancelLabel = computed(() => this.cancelLabel() ?? this.defaults.cancelLabel);
  private readonly resolvedEscape = computed(() => this.escape() ?? this.defaults.escape);
  private readonly resolvedBack = computed(() => this.back() ?? this.defaults.back);
  private readonly resolvedOutsidePress = computed(
    () => this.outsidePress() ?? this.defaults.outsidePress,
  );

  readonly mounted = computed(() => {
    const mount = this.resolvedMount();
    if (mount === 'eager') return true;
    if (mount === 'lazy') return this.seen();
    return this.status() !== 'unmounted';
  });

  /** What the stylesheet keys on, which is a frame behind what was asked. */
  readonly visible = computed(() => this.status() === 'open');
  /** `entering` counts: the focus scope enters in that frame. */
  readonly interactive = computed(() => {
    const status = this.status();
    return status === 'entering' || status === 'open';
  });

  protected readonly labelledBy = computed(() =>
    this.hasTitle() && this.writtenLabel === null ? this.titleId : null,
  );
  protected readonly describedBy = computed(() => (this.hasMessage() ? this.messageId : null));

  private portal: PortalRootHandle | null = null;
  private layer: DismissableLayerHandle | null = null;
  private scope: FocusScopeHandle | null = null;

  constructor() {
    effect(() => {
      if (this.open()) this.seen.set(true);
      this.presence.sync(this.open());
    });

    /** Where the layer lives, for as long as it is in the document. */
    effect(() => {
      const node = this.layerRef()?.nativeElement ?? null;
      this.presence.setNode(node);
      if (node === null) {
        this.releasePortal();
        return;
      }
      if (this.portal !== null) return;
      const named = this.container();
      this.portal = createPortalRoot({
        origin: this.origin,
        ...(named === undefined ? {} : { container: named }),
      });
      this.portal.container?.append(node);
    });

    /**
     * Everything the sheet does while it is open, taken down when it closes
     * rather than when the node leaves: `presence` keeps the node through the
     * exit, and a layer still holding the scroll lock and the page's `inert`
     * for those milliseconds is a page nobody can touch.
     */
    effect((onCleanup) => {
      const node = this.layerRef()?.nativeElement;
      const panel = this.panelRef()?.nativeElement;
      if (!this.open() || node === undefined || panel === undefined) return;

      this.lastReason = null;
      const modal = this.resolvedModal();
      const outsidePress = this.resolvedOutsidePress() === 'close';
      const trigger = this.triggerNode();

      this.layer = createDismissableLayer(node, {
        back: modal && this.resolvedBack() === 'close',
        branches: trigger === null ? [] : [trigger],
        content: panel,
        escape: this.resolvedEscape() === 'close',
        modal,
        onDismiss: (request) => {
          if (request.reason === 'outsidePress' && !outsidePress) return request.cancel();
          this.request(false, request.reason as ActionSheetOpenReason, undefined, request.source);
        },
        outsidePress,
        outsidePressEvent: 'click',
      });

      const origin = panel.ownerDocument.activeElement as HTMLElement | null;
      const returnTo = this.finalFocus();
      const wanted = this.initialFocus();
      this.scope = createFocusScope(panel, {
        contain: modal,
        initial: wanted === false ? false : () => wanted ?? entryTarget(panel),
        restore:
          returnTo === false
            ? false
            : () => {
                /* A press on the live page behind a non-modal sheet was the
                   reader going somewhere; taking focus back would fight them. */
                if (!modal && this.lastReason === 'outsidePress') return null;
                const target = returnTo ?? origin;
                const usable =
                  target !== null && target.isConnected && target !== target.ownerDocument.body;
                return usable ? target : this.triggerNode();
              },
      });
      this.scope.enter();

      onCleanup(() => {
        this.scope?.destroy();
        this.scope = null;
        this.layer?.destroy();
        this.layer = null;
        if (!this.destroyed) this.closed.emit(this.result);
        this.result = undefined;
      });
    });

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.scope?.destroy();
      this.layer?.destroy();
      this.presence.destroy();
      this.releasePortal();
    });
  }

  /** The layer is given back to the host before the portal goes. */
  private releasePortal() {
    if (this.portal === null) return;
    const node = this.layerRef()?.nativeElement;
    if (node !== undefined) this.host.append(node);
    this.portal.release();
    this.portal = null;
  }

  /** Asks to open or close, carrying the reason, the result and the event. */
  request(
    next: boolean,
    reason: ActionSheetOpenReason,
    result: string | undefined,
    source: unknown,
  ) {
    if (next === this.open()) return;

    let cancelled = false;
    const state = createControllable<boolean>({
      initial: this.open(),
      onRequest: (raw) => {
        cancelled = raw.cancelled;
        this.openChangeRequest.emit({
          cancel: () => raw.cancel(),
          get cancelled() {
            return raw.cancelled;
          },
          previous: raw.previous,
          reason,
          result,
          source: raw.source,
          value: raw.value,
        });
      },
    });

    if (!state.request(next, reason, source) || cancelled) return;
    if (!next) {
      this.result = result;
      this.lastReason = reason;
    }
    this.open.set(next);
  }

  /** Opens the sheet from code, carrying `programmatic`. */
  show() {
    this.request(true, 'programmatic', undefined, undefined);
  }

  /** Closes it from code, carrying `programmatic`. */
  close() {
    this.request(false, 'programmatic', undefined, undefined);
  }

  /** Moves focus to the item the list holds as its stop. */
  focus() {
    const panel = this.panelRef()?.nativeElement;
    const stop = panel?.querySelector<HTMLElement>("[data-part='item'][tabindex='0']");
    (stop ?? panel)?.focus();
  }
}
