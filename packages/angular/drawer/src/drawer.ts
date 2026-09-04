import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import type { DismissableLayerHandle } from '@slotted/core/dismissable-layer';
import { extentBounds, isInlineSide } from '@slotted/core/extent';
import { createFocusScope } from '@slotted/core/focus';
import type { FocusScopeHandle } from '@slotted/core/focus';
import { clamp } from '@slotted/core/measure';
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

import { injectDrawerDefaults, SlDrawerIdFactory } from './drawer-defaults';
import type {
  DrawerChangeRequest,
  DrawerDismissPolicy,
  DrawerExtentReason,
  DrawerExtentRequest,
  DrawerFinalFocus,
  DrawerInitialFocus,
  DrawerMode,
  DrawerMount,
  DrawerOpenReason,
  DrawerSide,
  DrawerSize,
} from './drawer-defaults';

const NO_SNAP_POINTS: readonly number[] = [];

/**
 * A panel that comes in from an edge, and either covers the page or stands
 * beside it.
 *
 * The layer is composed from `packages/core` and rewritten nowhere: `portal`
 * decides where it lives and keeps the theme of the region that opened it,
 * `dismissable-layer` owns Escape, outside press, `inert`, the scroll lock and
 * the single z-index stack, `presence` keeps it mounted long enough to leave,
 * `focus` contains the keyboard and gives it back to the trigger, and `extent`
 * holds the arithmetic the separator's pointer and keyboard share.
 *
 * **The host is not the layer.** `<sl-drawer>` renders `display: contents` and
 * stays exactly where the consumer wrote it; the layer is the `div` in the
 * template. Under `mode="overlay"` that `div` is moved into the portal and
 * given back before it is destroyed; under `mode="inline"` it never moves,
 * which is what makes the host's own parent the drawer's place in the layout.
 * Either way the host is the portal's *origin*, so the layer keeps the scheme,
 * density, theme and direction of the region it was written in whether or not
 * a trigger exists — React has to use the trigger for that, and
 * `docs/superpowers/specs/2026-09-04-drawer-design.md` §11 records the
 * asymmetry rather than levelling both down.
 */
@Component({
  selector: 'sl-drawer',
  standalone: true,
  exportAs: 'slDrawer',
  template: `
    @if (mounted()) {
      <div
        #layer
        data-ui="drawer"
        data-part="root"
        [attr.data-mode]="resolvedMode()"
        [attr.data-side]="resolvedSide()"
        [attr.data-size]="resolvedSize()"
        [attr.data-mount]="resolvedMount()"
        [attr.data-modal]="resolvedModal() ? '' : null"
        [attr.data-open]="visible() ? '' : null"
        [attr.data-loading]="loading() ? '' : null"
        [attr.data-dragging]="dragging() ? '' : null"
        [attr.inert]="visible() ? null : ''"
        [style.--slotted-drawer-extent]="extentLength()"
      >
        @if (showBackdrop()) {
          <div data-part="backdrop"></div>
        }
        <div
          #panel
          data-part="panel"
          [id]="panelId"
          [attr.role]="role()"
          [attr.aria-modal]="resolvedModal() ? 'true' : null"
          [attr.aria-label]="label()"
          [attr.aria-labelledby]="labelledBy()"
          [attr.aria-describedby]="describedBy()"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
  styleUrl: '../../../styles/src/drawer/drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  /* The host is the origin the layer inherits its theme from, and nothing else. */
  host: { '[style.display]': "'contents'" },
})
export class SlDrawer {
  /** Whether the drawer is open. Two-way, so a template may bind it directly. */
  readonly open = model<boolean>(false);

  /**
   * How much of the box the panel is measured in it takes, in `[0, 1]`. Unset
   * means the `size` step decides. It is a fraction rather than a length so
   * that the separator's three ARIA values, the limits and the snap points are
   * all the same kind of number.
   */
  readonly extent = model<number | undefined>(undefined);

  readonly mode = input<DrawerMode | undefined>(undefined);
  readonly side = input<DrawerSide | undefined>(undefined);
  readonly size = input<DrawerSize | undefined>(undefined);
  readonly mount = input<DrawerMount | undefined>(undefined);
  readonly escape = input<DrawerDismissPolicy | undefined>(undefined);
  readonly outsidePress = input<DrawerDismissPolicy | undefined>(undefined);
  /**
   * Whether the background is inert, the scroll is locked and focus is
   * contained. Fixed at `false` under `mode="inline"`: a panel in the flow that
   * claimed `aria-modal` while the page around it stayed reachable is the
   * failure the APG calls severe.
   */
  readonly modal = input(true, { transform: booleanAttribute });
  /** Whether the panel's content is still on its way. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** The smallest the reader may make it. A drag released below it asks to close. */
  readonly minExtent = input(0.2);
  readonly maxExtent = input(1);
  /** The stops the separator lands on. Empty means the range is continuous. */
  readonly snapPoints = input<readonly number[]>(NO_SNAP_POINTS);
  /** A parent for this layer alone, instead of the shared portal root. */
  readonly container = input<Element | null | undefined>(undefined);
  readonly initialFocus = input<DrawerInitialFocus | undefined>(undefined);
  readonly finalFocus = input<DrawerFinalFocus | undefined>(undefined);

  /** One output per transition, each carrying its reason and its event. */
  readonly openChangeRequest = output<DrawerChangeRequest>();
  readonly extentChangeRequest = output<DrawerExtentRequest>();
  /**
   * What `afterClosed()` is in Angular Material, as an output. It fires once
   * the drawer has actually closed, with the result the close carried.
   */
  readonly closed = output<string | undefined>();

  private readonly defaults = injectDrawerDefaults();
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseId = inject(SlDrawerIdFactory).next();

  /** The element the consumer wrote us beside, recorded before anything moves. */
  private readonly origin = this.host.parentElement;

  /**
   * A consumer's own `aria-label` on `<sl-drawer>`, read before the host
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
  readonly triggerNode = signal<HTMLElement | null>(null);
  /** Whether the reader has the separator under the pointer. */
  readonly dragging = signal(false);

  readonly titleId = `${this.baseId}-title`;
  readonly descriptionId = `${this.baseId}-description`;
  readonly panelId = `${this.baseId}-panel`;
  readonly triggerId = `${this.baseId}-trigger`;

  /**
   * The status rather than a boolean. `entering` is one frame long and it is
   * the whole reason it exists: a panel that appears already open gives its CSS
   * transition no closed style to start from.
   */
  private readonly status = signal<PresenceStatus>('unmounted');
  private readonly presence: PresenceHandle = createPresence({
    present: false,
    onStatusChange: (next) => this.status.set(next),
  });

  /** Whether this drawer has ever been open, which is what `lazy` reads. */
  private readonly seen = signal(false);
  private readonly result = signal<string | undefined>(undefined);
  /** The measured length the stylesheet reads, kept in step by an observer. */
  private readonly measured = signal<string | null>(null);

  readonly resolvedMode = computed(() => this.mode() ?? this.defaults.mode);
  readonly resolvedSide = computed(() => this.side() ?? this.defaults.side);
  readonly resolvedSize = computed(() => this.size() ?? this.defaults.size);
  readonly resolvedMount = computed(() => this.mount() ?? this.defaults.mount);
  readonly resolvedModal = computed(() =>
    this.resolvedMode() === 'inline' ? false : this.modal(),
  );
  readonly resolvedEscape = computed<DrawerDismissPolicy>(() =>
    this.resolvedMode() === 'inline' ? 'none' : (this.escape() ?? this.defaults.escape),
  );
  readonly resolvedOutsidePress = computed<DrawerDismissPolicy>(() =>
    this.resolvedMode() === 'inline' ? 'none' : (this.outsidePress() ?? this.defaults.outsidePress),
  );

  /**
   * The limits are the first and last stop when there are stops, because a
   * range whose ends no stop can reach has two values nothing produces.
   */
  readonly bounds = computed(() =>
    extentBounds(this.snapPoints(), this.minExtent(), this.maxExtent()),
  );

  /**
   * An inline drawer is always in the document: its own measure is what opens
   * and closes, and a box that left the layout would take the page's columns
   * with it every time the reader closed the panel.
   */
  readonly mounted = computed(() => {
    if (this.resolvedMode() === 'inline') return true;
    const mount = this.resolvedMount();
    if (mount === 'eager') return true;
    if (mount === 'lazy') return this.seen();
    return this.status() !== 'unmounted';
  });

  /** What the stylesheet keys on, which is a frame behind what was asked. */
  readonly visible = computed(() =>
    this.resolvedMode() === 'inline' ? this.open() : this.status() === 'open',
  );

  protected readonly showBackdrop = computed(
    () => this.resolvedMode() === 'overlay' && this.resolvedModal(),
  );
  protected readonly extentLength = computed(() => this.measured());
  protected readonly labelledBy = computed(() =>
    this.hasTitle() && this.writtenLabel === null ? this.titleId : null,
  );
  protected readonly describedBy = computed(() =>
    this.hasDescription() ? this.descriptionId : null,
  );
  protected readonly label = computed(() => this.writtenLabel);
  /**
   * Under `inline` the panel is a region of the page rather than a window over
   * it, so it writes no role: a navigation drawer is a navigation landmark and
   * a filter panel is complementary, and a family that cannot know which one
   * guesses wrong half the time. A consumer names it on their own element.
   */
  protected readonly role = computed(() => (this.resolvedMode() === 'overlay' ? 'dialog' : null));

  private portal: PortalRootHandle | null = null;
  private layer: DismissableLayerHandle | null = null;
  private scope: FocusScopeHandle | null = null;

  constructor() {
    effect(() => {
      if (this.open()) this.seen.set(true);
      this.presence.sync(this.open());
    });

    /** Where an overlay layer lives, for as long as it is in the document. */
    effect(() => {
      const node = this.layerRef()?.nativeElement ?? null;
      this.presence.setNode(node);

      if (node === null || this.resolvedMode() === 'inline') {
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
     * The measure as a length the stylesheet can use. The public value is a
     * fraction; a percentage would not do, because under `inline` the drawer is
     * the box being sized and a percentage of its own containing block resolves
     * against a track whose size depends on it. The observer is what keeps the
     * pixels and the fraction in step when the window changes.
     */
    effect((onCleanup) => {
      const box = this.measuringBox();
      const fraction = this.extent();
      const inline = isInlineSide(this.resolvedSide());

      if (box === null || fraction === undefined) {
        this.measured.set(null);
        return;
      }

      const measure = () => {
        const rect = box.getBoundingClientRect();
        const span = inline ? rect.width : rect.height;
        if (span > 0) this.measured.set(`${Math.round(fraction * span)}px`);
      };

      measure();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(measure);
      observer.observe(box);
      onCleanup(() => observer.disconnect());
    });

    /**
     * Everything the drawer does while it is open, taken down when it closes
     * rather than when the node leaves — `presence` keeps the node mounted
     * through the exit, and a layer still holding the scroll lock and the
     * background's `inert` for those milliseconds is a page nobody can touch.
     *
     * An inline drawer composes neither the layer nor containment: it is a box
     * in the page, nothing is inert and nothing is contained. It still enters a
     * focus scope, because the scope is what returns focus to the trigger when
     * a panel the reader is standing in closes underneath them.
     */
    effect((onCleanup) => {
      const node = this.layerRef()?.nativeElement;
      const panel = this.panelRef()?.nativeElement;
      if (!this.open() || node === undefined || panel === undefined) return;

      const overlay = this.resolvedMode() === 'overlay';
      const escape = this.resolvedEscape() === 'close';
      const outsidePress = this.resolvedOutsidePress() === 'close';
      const modal = this.resolvedModal();
      const trigger = this.triggerNode();

      if (overlay) {
        this.layer = createDismissableLayer(node, {
          branches: trigger === null ? [] : [trigger],
          escape,
          modal,
          onDismiss: (request) => {
            if (request.reason === 'outsidePress' && !outsidePress) return request.cancel();
            this.request(false, request.reason as DrawerOpenReason, undefined, request.source);
          },
          outsidePress,
        });
      }

      const wanted = this.initialFocus() ?? 'first';
      const returnTo = this.finalFocus();
      this.scope = createFocusScope(panel, {
        contain: overlay && modal,
        initial: !overlay ? false : wanted instanceof HTMLElement ? () => wanted : wanted,
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
   * The box the panel's measure is a fraction of: the layer under `overlay`,
   * which is fixed to the viewport, and the drawer's own parent under `inline`,
   * where the drawer is what is being sized and cannot measure itself.
   */
  measuringBox(): HTMLElement | null {
    const node = this.layerRef()?.nativeElement ?? null;
    if (node === null) return null;
    return this.resolvedMode() === 'inline' ? node.parentElement : node;
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

  /** Asks to open or close, carrying the reason, the result and the event. */
  request(next: boolean, reason: DrawerOpenReason, result: string | undefined, source: unknown) {
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

  /**
   * Asks to move the measure. While the pointer is down the floor is not
   * enforced — a sheet the reader is pulling down has to follow the hand — and
   * the separator decides on release whether that means a smaller panel or a
   * closed one.
   */
  requestExtent(next: number, reason: DrawerExtentReason, source: unknown) {
    const wanted = clamp(next, 0, this.bounds().max);
    if (wanted === this.extent()) return;

    let cancelled = false;
    const state = createControllable<number>({
      initial: this.extent() ?? this.bounds().min,
      onRequest: (raw) => {
        cancelled = raw.cancelled;
        this.extentChangeRequest.emit({
          cancel: () => raw.cancel(),
          get cancelled() {
            return raw.cancelled;
          },
          previous: raw.previous,
          reason,
          source: raw.source,
          value: raw.value,
        });
      },
    });

    if (!state.request(wanted, reason, source) || cancelled) return;
    this.extent.set(wanted);
  }

  /** Opens the drawer from code, carrying `programmatic`. */
  openDrawer() {
    this.request(true, 'programmatic', undefined, undefined);
  }

  /** Closes it from code, carrying `programmatic` and the result given. */
  close(result?: string) {
    this.request(false, 'programmatic', result, undefined);
  }

  /** Moves focus into the panel, as opening an overlay drawer does. */
  focus() {
    this.panelRef()?.nativeElement.focus();
  }
}
