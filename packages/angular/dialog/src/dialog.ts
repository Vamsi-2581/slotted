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
  Directive,
  effect,
  ElementRef,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { injectDialogDefaults, SlDialogIdFactory } from './dialog-defaults';
import type {
  DialogChangeRequest,
  DialogDismissPolicy,
  DialogFinalFocus,
  DialogFullScreen,
  DialogInitialFocus,
  DialogMount,
  DialogOpenReason,
  DialogPlacement,
  DialogScroll,
  DialogSize,
  DialogSurface,
  DialogTone,
} from './dialog-defaults';

/**
 * A window over the page, and the scrim that says the page is out of reach.
 *
 * The layer is composed from `packages/core` and rewritten nowhere: `portal`
 * decides where it lives and keeps the theme of the region that opened it,
 * `dismissable-layer` owns Escape, outside press, `inert`, the scroll lock and
 * the single z-index stack, `presence` keeps it mounted long enough to leave,
 * and `focus` contains the keyboard and gives it back to the trigger.
 *
 * **The host is not the layer.** `<sl-dialog>` renders `display: contents` and
 * stays exactly where the consumer wrote it; the layer is the `div` in the
 * template, and it is that `div` which is moved into the portal. Two things
 * follow, and both are better than the alternative: `mount="active"` can remove
 * the layer outright, as React's does, and the host is the portal's *origin* —
 * so the layer inherits the scheme, density, theme and direction of the region
 * the consumer wrote it in, whether a trigger exists or not. React has to use
 * the trigger for that, and the design document records the asymmetry.
 */
@Directive()
export abstract class SlDialogBase {
  protected abstract readonly member: 'dialog' | 'alertDialog';

  /** Whether the layer is open. Two-way, so a template may bind it directly. */
  readonly open = model<boolean>(false);

  readonly size = input<DialogSize | undefined>(undefined);
  readonly placement = input<DialogPlacement | undefined>(undefined);
  readonly scroll = input<DialogScroll | undefined>(undefined);
  readonly surface = input<DialogSurface | undefined>(undefined);
  readonly mount = input<DialogMount | undefined>(undefined);
  readonly fullScreen = input<DialogFullScreen | undefined>(undefined);
  readonly escape = input<DialogDismissPolicy | undefined>(undefined);
  /** Whether the layer's content is still on its way. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** A parent for this layer alone, instead of the shared portal root. */
  readonly container = input<Element | null | undefined>(undefined);
  readonly initialFocus = input<DialogInitialFocus | undefined>(undefined);
  readonly finalFocus = input<DialogFinalFocus | undefined>(undefined);

  /** One output for one transition, carrying the reason, the result and the event. */
  readonly openChangeRequest = output<DialogChangeRequest>();
  /**
   * What `afterClosed()` is in Angular Material, as an output. It fires once the
   * layer has actually closed, with the result the close carried.
   */
  readonly closed = output<string | undefined>();

  protected readonly defaults = injectDialogDefaults();
  protected readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseId = inject(SlDialogIdFactory).next();

  /** The element the consumer wrote us beside, recorded before anything moves. */
  private readonly origin = this.host.parentElement;

  /**
   * A consumer's own `aria-label` on `<sl-dialog>`, read before the host
   * bindings are written and moved to the panel, which is the element the role
   * is on. Without this a label written on the host would name a box with
   * `display: contents` and no role at all.
   */
  private readonly writtenLabel = inject(new HostAttributeToken('aria-label'), {
    optional: true,
  });

  protected readonly layerRef = viewChild<ElementRef<HTMLElement>>('layer');
  protected readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  /** The parts that have said they exist, so only what was rendered is wired. */
  readonly hasTitle = signal(false);
  readonly hasDescription = signal(false);
  readonly cancelNode = signal<HTMLElement | null>(null);
  readonly triggerNode = signal<HTMLElement | null>(null);

  readonly titleId = `${this.baseId}-title`;
  readonly descriptionId = `${this.baseId}-description`;
  readonly contentId = `${this.baseId}-content`;
  readonly triggerId = `${this.baseId}-trigger`;

  /**
   * The status rather than a boolean. `entering` is one frame long and it is
   * the whole reason it exists: a layer that appears already open gives its CSS
   * transition no closed style to start from.
   */
  private readonly status = signal<PresenceStatus>('unmounted');
  private readonly presence: PresenceHandle = createPresence({
    present: false,
    onStatusChange: (next) => this.status.set(next),
  });

  /** Whether this layer has ever been open, which is what `lazy` reads. */
  private readonly seen = signal(false);
  private readonly result = signal<string | undefined>(undefined);

  readonly isAlert = computed(() => this.member === 'alertDialog');
  readonly resolvedModal = computed(() => (this.isAlert() ? true : this.modalInput()));
  readonly resolvedOutsidePress = computed<DialogDismissPolicy>(() =>
    this.isAlert() ? 'none' : this.outsidePressInput(),
  );
  readonly resolvedMount = computed(() => this.mount() ?? this.defaults.mount);
  readonly resolvedSize = computed(
    () => this.size() ?? (this.isAlert() ? 'sm' : this.defaults.size),
  );
  readonly resolvedPlacement = computed(() => this.placement() ?? this.defaults.placement);
  readonly resolvedScroll = computed(() => this.scroll() ?? this.defaults.scroll);
  readonly resolvedSurface = computed(() => this.surface() ?? this.defaults.surface);
  readonly resolvedFullScreen = computed(
    () => this.fullScreen() ?? (this.isAlert() ? 'never' : this.defaults.fullScreen),
  );
  readonly resolvedEscape = computed(() => this.escape() ?? this.defaults.escape);
  readonly resolvedInitialFocus = computed<DialogInitialFocus>(
    () => this.initialFocus() ?? (this.isAlert() ? 'cancel' : 'first'),
  );
  readonly resolvedTone = computed<DialogTone | null>(() =>
    this.isAlert() ? this.toneInput() : null,
  );

  /** Overridden by the member that has them; the base has neither. */
  protected modalInput(): boolean {
    return this.defaults.modal;
  }
  protected outsidePressInput(): DialogDismissPolicy {
    return this.defaults.outsidePress;
  }
  protected toneInput(): DialogTone {
    return 'danger';
  }

  readonly mounted = computed(() => {
    const mount = this.resolvedMount();
    if (mount === 'eager') return true;
    if (mount === 'lazy') return this.seen();
    return this.status() !== 'unmounted';
  });

  /** What the stylesheet keys on, which is a frame behind what was asked. */
  readonly visible = computed(() => this.status() === 'open');

  readonly labelledBy = computed(() =>
    this.hasTitle() && this.writtenLabel === null ? this.titleId : null,
  );
  readonly describedBy = computed(() => (this.hasDescription() ? this.descriptionId : null));
  readonly label = computed(() => this.writtenLabel);
  readonly role = computed(() => (this.isAlert() ? 'alertdialog' : 'dialog'));

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
     * Everything the layer does while it is open, taken down when it closes
     * rather than when the node leaves — `presence` keeps the node mounted
     * through the exit, and a layer still holding the scroll lock and the
     * background's `inert` for those milliseconds is a page nobody can touch.
     */
    effect((onCleanup) => {
      const node = this.layerRef()?.nativeElement;
      const panel = this.panelRef()?.nativeElement;
      if (!this.open() || node === undefined || panel === undefined) return;

      const escape = this.resolvedEscape() === 'close';
      const outsidePress = this.resolvedOutsidePress() === 'close';
      const modal = this.resolvedModal();
      const trigger = this.triggerNode();

      /* The frame is the layer and the panel is what a press is inside of: the
         scrim and the viewport around the panel are the way out. The click, not
         the pointerdown, so a selection dragged out of the panel is not a press
         on the scrim. */
      this.layer = createDismissableLayer(node, {
        branches: trigger === null ? [] : [trigger],
        content: panel,
        escape,
        modal,
        onDismiss: (request) => {
          if (request.reason === 'outsidePress' && !outsidePress) return request.cancel();
          this.request(false, request.reason as DialogOpenReason, undefined, request.source);
        },
        outsidePress,
        outsidePressEvent: 'click',
      });

      const wanted = this.resolvedInitialFocus();
      const returnTo = this.finalFocus();
      this.scope = createFocusScope(panel, {
        contain: modal,
        initial:
          wanted === 'cancel'
            ? () => this.cancelNode()
            : wanted instanceof HTMLElement
              ? () => wanted
              : wanted,
        ...(returnTo === undefined
          ? {}
          : { restore: returnTo === false ? (false as const) : () => returnTo }),
      });
      this.scope.enter();

      onCleanup(() => {
        this.scope?.destroy();
        this.scope = null;
        this.layer?.destroy();
        this.layer = null;
        this.closed.emit(this.result());
        this.result.set(undefined);
      });
    });

    this.destroyRef.onDestroy(() => {
      this.scope?.destroy();
      this.layer?.destroy();
      this.presence.destroy();
      this.releasePortal();
    });
  }

  /**
   * The layer element is given back to the host before the portal goes, so
   * Angular removes a node that is where its own view expects it to be.
   */
  private releasePortal() {
    if (this.portal === null) return;
    const node = this.layerRef()?.nativeElement;
    if (node !== undefined) this.host.append(node);
    this.portal.release();
    this.portal = null;
  }

  /** Asks to move, carrying the reason, the result and the originating event. */
  request(next: boolean, reason: DialogOpenReason, result: string | undefined, source: unknown) {
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
    if (!next) this.result.set(result);
    this.open.set(next);
  }

  /** Opens the layer from code, carrying `programmatic`. */
  openDialog() {
    this.request(true, 'programmatic', undefined, undefined);
  }

  /** Closes it from code, carrying `programmatic` and the result given. */
  close(result?: string) {
    this.request(false, 'programmatic', result, undefined);
  }

  /** Moves focus into the layer, as opening does. */
  focus() {
    this.panelRef()?.nativeElement.focus();
  }
}

/**
 * One template for the two members. `tag` already names its own the same way,
 * which is what says the compiler folds it: `entry-points.source.test.mjs`
 * refuses an identifier for `styleUrl` because that one needs a file resolved
 * at build time, and a template string needs nothing resolved at all.
 */
const LAYER_TEMPLATE = `
  @if (mounted()) {
    <div
      #layer
      data-ui="dialog"
      data-part="root"
      [attr.data-size]="resolvedSize()"
      [attr.data-placement]="resolvedPlacement()"
      [attr.data-scroll]="resolvedScroll()"
      [attr.data-surface]="resolvedSurface()"
      [attr.data-mount]="resolvedMount()"
      [attr.data-full-screen]="resolvedFullScreen()"
      [attr.data-outside-press]="resolvedOutsidePress()"
      [attr.data-tone]="resolvedTone()"
      [attr.data-modal]="resolvedModal() ? '' : null"
      [attr.data-open]="visible() ? '' : null"
      [attr.data-loading]="loading() ? '' : null"
      [attr.inert]="visible() ? null : ''"
    >
      <div data-part="backdrop"></div>
      <div data-part="viewport">
        <div
          #panel
          data-part="content"
          [id]="contentId"
          [attr.role]="role()"
          [attr.aria-modal]="resolvedModal() ? 'true' : null"
          [attr.aria-label]="label()"
          [attr.aria-labelledby]="labelledBy()"
          [attr.aria-describedby]="describedBy()"
        >
          <ng-content />
        </div>
      </div>
    </div>
  }`;

@Component({
  selector: 'sl-dialog',
  standalone: true,
  exportAs: 'slDialog',
  template: LAYER_TEMPLATE,
  styleUrl: '../../../styles/src/dialog/dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  /* The host is the origin the layer inherits its theme from, and nothing else. */
  host: { '[style.display]': "'contents'" },
  providers: [{ provide: SlDialogBase, useExisting: forwardRef(() => SlDialog) }],
})
export class SlDialog extends SlDialogBase {
  protected readonly member = 'dialog' as const;

  /**
   * Whether the background is inert, the scroll is locked and focus is
   * contained. A non-modal layer writes no `aria-modal`, which the APG requires
   * of anything that does not actually make the background unreachable.
   */
  readonly modal = input(true, { transform: booleanAttribute });
  readonly outsidePress = input<DialogDismissPolicy | undefined>(undefined);

  protected override modalInput() {
    return this.modal();
  }

  protected override outsidePressInput() {
    return this.outsidePress() ?? this.defaults.outsidePress;
  }
}

/**
 * A dialog that interrupts to confirm something irreversible.
 *
 * Two rules are fixed rather than left to an input: outside press never closes
 * it, and it is always modal. Ark and React Aria make the role a prop, so a
 * consumer who sets `role="alertdialog"` and forgets the dismissal policy ships
 * a destructive confirmation a stray click dismisses.
 *
 * Focus lands on `slAlertDialogCancel` rather than on the first tabbable
 * element, which is the APG's own advice for a step that is not easily
 * reversible.
 */
@Component({
  selector: 'sl-alert-dialog',
  standalone: true,
  exportAs: 'slAlertDialog',
  template: LAYER_TEMPLATE,
  styleUrl: '../../../styles/src/dialog/dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[style.display]': "'contents'" },
  providers: [{ provide: SlDialogBase, useExisting: forwardRef(() => SlAlertDialog) }],
})
export class SlAlertDialog extends SlDialogBase {
  protected readonly member = 'alertDialog' as const;

  readonly tone = input<DialogTone>('danger');

  constructor() {
    super();

    /**
     * The alert dialog pattern *requires* `aria-describedby`. A confirmation
     * announced as a title and two buttons, with the sentence saying what is
     * about to be destroyed left out, is the failure the requirement exists
     * for — so it fails loudly rather than shipping.
     *
     * The DOM rather than the signal: projected content is created before this
     * effect flushes, so the element is there and the signal it sets may not
     * have been read yet.
     */
    effect(() => {
      const panel = this.panelRef()?.nativeElement;
      if (!this.open() || panel === undefined) return;
      if (panel.querySelector('[data-part="description"]') !== null) return;
      throw new Error(
        'sl-alert-dialog requires an element with slDialogDescription: the alertdialog pattern makes aria-describedby mandatory.',
      );
    });
  }

  protected override toneInput() {
    return this.tone();
  }
}
