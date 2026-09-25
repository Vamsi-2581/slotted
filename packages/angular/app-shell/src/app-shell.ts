import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import type { DismissableLayerHandle } from '@slotted/core/dismissable-layer';
import { createFocusScope } from '@slotted/core/focus';
import { COMPACT_BELOW, createWidthGate } from '@slotted/core/measure';
import { setPortalContainer } from '@slotted/core/portal';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
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
import { SlGlyph, SlIcon } from '@slotted/angular/icon';

import { injectAppShellDefaults } from './app-shell-defaults';
import type {
  AppShellAsideMode,
  AppShellAsideOpenReason,
  AppShellCanvas,
  AppShellCollapsedTo,
  AppShellDismissPolicy,
  AppShellMessages,
  AppShellNavMode,
  AppShellNavSide,
  AppShellOpenReason,
  AppShellOpenRequest,
  AppShellPrimary,
  AppShellScroll,
  AppShellSize,
} from './app-shell-defaults';

export type {
  AppShellAsideMode,
  AppShellAsideOpenReason,
  AppShellCanvas,
  AppShellCollapsedTo,
  AppShellDefaults,
  AppShellDismissPolicy,
  AppShellMessages,
  AppShellNavMode,
  AppShellNavSide,
  AppShellOpenReason,
  AppShellOpenRequest,
  AppShellPrimary,
  AppShellScroll,
  AppShellSize,
} from './app-shell-defaults';

/**
 * The inline size the navigation stops being a column at. The stylesheet needs
 * it literal — `@container (inline-size: var(--x))` is invalid CSS — and the
 * script needs it to know whether `Escape`, the focus scope and `inert` are in
 * play. It is the limit of the compact size class, `COMPACT_BELOW`;
 * `specs/components/app-shell/contract.json` states it once, and
 * `app-shell.styles.test.mjs` compares the stylesheet's own condition to it.
 */
export const APP_SHELL_OVERLAY_AT = COMPACT_BELOW;

let nextId = 0;

/**
 * The outer frame of a route: the regions that do not change when the content
 * does.
 *
 * **The layer is composed from `packages/core` and rewritten nowhere.**
 * `measure` answers the shell's own inline size, `dismissable-layer` owns
 * `Escape`, the outside press and the single stack, `focus` contains the
 * keyboard and gives it back to the toggle, and `portal` is told once that this
 * shell is where an overlay belongs.
 *
 * **The element is the consumer's.** `<div slAppShell>` is the frame and the
 * directive adds the grid, the skip links, the veil and the portal root around
 * whatever is projected into it.
 */
@Component({
  selector: '[slAppShell]',
  standalone: true,
  exportAs: 'slAppShell',
  template: `@if (skipTargets().length > 0) {
      <div data-part="skip">
        @for (target of skipTargets(); track target.href) {
          <a [href]="'#' + target.href">{{ target.label }}</a>
        }
      </div>
    }
    <ng-content />
    @if (veilStatus() !== 'unmounted') {
      <div data-part="scrim" [attr.data-status]="veilStatus()" #scrim></div>
    }
    <div data-part="layer" #layer></div>`,
  styleUrl: '../../../styles/src/app-shell/app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-ui': 'app-shell',
    'data-part': 'root',
    '[attr.data-primary]': 'resolvedPrimary()',
    '[attr.data-canvas]': 'resolvedCanvas()',
    '[attr.data-nav-mode]': 'resolvedMode()',
    '[attr.data-aside-mode]': 'resolvedAsideMode()',
    '[attr.data-nav-side]': 'resolvedNavSide()',
    '[attr.data-nav-size]': 'resolvedNavSize()',
    '[attr.data-aside-size]': 'resolvedAsideSize()',
    '[attr.data-collapsed-to]': 'resolvedCollapsedTo()',
    '[attr.data-scroll]': 'resolvedScroll()',
    '[attr.data-dividers]': "resolvedDividers() ? '' : null",
    '[attr.data-open]': "navOpen() ? '' : null",
    '(click)': 'onClick($event)',
  },
})
export class SlAppShell {
  /** Whether the navigation region is showing its full panel. Two-way. */
  readonly navOpen = model<boolean>(true);
  /** Whether the secondary pane is showing. Two-way. */
  readonly asideOpen = model<boolean>(true);

  /** Defaults to the provider, then `banner`. */
  readonly primary = input<AppShellPrimary | undefined>(undefined);
  /** Defaults to the provider, then `inset`. */
  readonly canvas = input<AppShellCanvas | undefined>(undefined);
  /** Defaults to the provider, then `auto`. */
  readonly navMode = input<AppShellNavMode | undefined>(undefined);
  /** Defaults to the provider, then `start`. */
  readonly navSide = input<AppShellNavSide | undefined>(undefined);
  /** Defaults to the provider, then `md`. */
  readonly navSize = input<AppShellSize | undefined>(undefined);
  /** Defaults to the provider, then `auto`. */
  readonly asideMode = input<AppShellAsideMode | undefined>(undefined);
  /** Defaults to the provider, then `md`. */
  readonly asideSize = input<AppShellSize | undefined>(undefined);
  /** Defaults to the provider, then `rail`. */
  readonly collapsedTo = input<AppShellCollapsedTo | undefined>(undefined);
  /** Defaults to the provider, then `content`. */
  readonly scroll = input<AppShellScroll | undefined>(undefined);
  /** Defaults to the provider, then `true`. */
  readonly dividers = input<boolean | undefined>(undefined, { transform: optionalBoolean });
  /** Defaults to the provider, then `true`. */
  readonly modal = input<boolean | undefined>(undefined, { transform: optionalBoolean });
  /** Defaults to the provider, then `close`. */
  readonly escape = input<AppShellDismissPolicy | undefined>(undefined);
  /** Defaults to the provider, then `close`. */
  readonly outsidePress = input<AppShellDismissPolicy | undefined>(undefined);
  /**
   * The platform's way back — a phone's gesture, a browser's button — closes
   * a modal layer instead of leaving the page. Defaults to the provider, then `close`.
   */
  readonly back = input<AppShellDismissPolicy | undefined>(undefined);
  /** Defaults to the provider, then `true`. */
  readonly closeOnNavigate = input<boolean | undefined>(undefined, { transform: optionalBoolean });
  /** Strings for this shell, over the provider's and over the family's own. */
  readonly messages = input<Partial<AppShellMessages> | undefined>(undefined);

  /**
   * The request, before anything commits. `reason` is what tells the reader's
   * own choice from the one the layout forced, which is the line
   * `docs/component-features.md` §15 asks for when it says sidebar persistence
   * belongs to the product.
   */
  readonly navOpenChangeRequest = output<AppShellOpenRequest>();
  /** The pane's request, with the same shape and the reasons a pane can carry. */
  readonly asideOpenChangeRequest = output<AppShellOpenRequest>();

  private readonly defaults = injectAppShellDefaults();
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly narrow = signal<boolean | undefined>(undefined);

  /**
   * Stable ids, and not `crypto.randomUUID()`: a server render and the
   * hydration that follows it have to produce the same string, and a random one
   * produces two.
   */
  private readonly seq = (nextId += 1);
  readonly navId = `slotted-app-shell-${this.seq}-nav`;
  readonly mainId = `slotted-app-shell-${this.seq}-main`;
  readonly asideId = `slotted-app-shell-${this.seq}-aside`;
  readonly toggleId = `slotted-app-shell-${this.seq}-toggle`;
  readonly asideToggleId = `slotted-app-shell-${this.seq}-aside-toggle`;

  /** The nodes the layer, the focus scope and the `inert` pass need. */
  readonly nodes: {
    aside: HTMLElement | null;
    asideToggle: HTMLElement | null;
    banner: HTMLElement | null;
    footer: HTMLElement | null;
    main: HTMLElement | null;
    nav: HTMLElement | null;
    toggle: HTMLElement | null;
  } = {
    aside: null,
    asideToggle: null,
    banner: null,
    footer: null,
    main: null,
    nav: null,
    toggle: null,
  };

  private readonly regions = signal<{ nav: boolean; main: boolean; aside: boolean }>({
    nav: false,
    main: false,
    aside: false,
  });

  readonly resolvedPrimary = computed(() => this.primary() ?? this.defaults.primary);
  readonly resolvedCanvas = computed(() => this.canvas() ?? this.defaults.canvas);
  readonly resolvedNavSide = computed(() => this.navSide() ?? this.defaults.navSide);
  readonly resolvedNavSize = computed(() => this.navSize() ?? this.defaults.navSize);
  readonly resolvedAsideSize = computed(() => this.asideSize() ?? this.defaults.asideSize);
  private readonly wantedAsideMode = computed(() => this.asideMode() ?? this.defaults.asideMode);
  /** The pane's mode, resolved the same way against the same width. */
  readonly resolvedAsideMode = computed<'inline' | 'overlay' | null>(() => {
    const wanted = this.wantedAsideMode();
    if (wanted !== 'auto') return wanted;
    const narrow = this.narrow();
    return narrow === undefined ? null : narrow ? 'overlay' : 'inline';
  });
  readonly asideOverlay = computed(
    () => this.resolvedAsideMode() === 'overlay' && this.asideOpen(),
  );
  readonly resolvedCollapsedTo = computed(() => this.collapsedTo() ?? this.defaults.collapsedTo);
  readonly resolvedScroll = computed(() => this.scroll() ?? this.defaults.scroll);
  readonly resolvedDividers = computed(() => this.dividers() ?? this.defaults.dividers);
  readonly resolvedModal = computed(() => this.modal() ?? this.defaults.modal);
  readonly resolvedEscape = computed(() => this.escape() ?? this.defaults.escape);
  readonly resolvedBack = computed(() => this.back() ?? this.defaults.back);
  readonly resolvedOutsidePress = computed(() => this.outsidePress() ?? this.defaults.outsidePress);
  readonly resolvedCloseOnNavigate = computed(
    () => this.closeOnNavigate() ?? this.defaults.closeOnNavigate,
  );
  readonly resolvedMessages = computed<AppShellMessages>(() => ({
    ...this.defaults.messages,
    ...this.messages(),
  }));

  private readonly wantedMode = computed(() => this.navMode() ?? this.defaults.navMode);

  /**
   * `null` until the gate has measured, which is what keeps `data-nav-mode` off
   * the host through a server render: below the breakpoint the stylesheet shows
   * the overlaid panel only under `[data-nav-mode='overlay'][data-open]`, so the
   * frame before hydration draws the narrow shell closed.
   */
  readonly resolvedMode = computed<'inline' | 'overlay' | null>(() => {
    const wanted = this.wantedMode();
    if (wanted !== 'auto') return wanted;
    const narrow = this.narrow();
    return narrow === undefined ? null : narrow ? 'overlay' : 'inline';
  });

  readonly overlay = computed(() => this.resolvedMode() === 'overlay' && this.navOpen());

  /**
   * The veil has a presence of its own, as a dialog's backdrop does. The
   * stylesheet fades it in from `entering` and out through `exiting`, and a
   * veil mounted straight at `open` gave that transition no closed style to
   * start from: it appeared in one frame beside a panel that took two hundred
   * milliseconds to arrive, and left the same way. One presence for both
   * layers, because there is one veil: with both regions overlaid and both
   * open it stays, and it leaves when the last of them does.
   */
  private readonly veil = computed(
    () => (this.overlay() || this.asideOverlay()) && this.resolvedModal(),
  );
  protected readonly veilStatus = signal<PresenceStatus>('unmounted');
  private readonly veilRef = viewChild<ElementRef<HTMLElement>>('scrim');
  /** Created on the first resolved value, so a veil the template opens with does not fade in. */
  private veilPresence: PresenceHandle | null = null;

  protected readonly skipTargets = computed(() => {
    const messages = this.resolvedMessages();
    const regions = this.regions();
    const targets: { href: string; label: string }[] = [];
    if (regions.main) targets.push({ href: this.mainId, label: messages.skipToMain });
    if (regions.nav) targets.push({ href: this.navId, label: messages.skipToNav });
    /* A link to a pane the reader closed is a dead destination. */
    if (regions.aside && this.asideOpen()) {
      targets.push({ href: this.asideId, label: messages.skipToAside });
    }
    return targets;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const veil = this.veil();
      if (this.veilPresence === null) {
        this.veilPresence = createPresence({
          present: veil,
          onStatusChange: (next) => this.veilStatus.set(next),
        });
        this.veilStatus.set(this.veilPresence.status);
        return;
      }
      this.veilPresence.sync(veil);
    });
    effect(() => {
      this.veilPresence?.setNode(this.veilRef()?.nativeElement ?? null);
    });
    destroyRef.onDestroy(() => this.veilPresence?.destroy());

    afterNextRender(() => {
      const layer = this.host.querySelector<HTMLElement>(':scope > [data-part="layer"]');
      if (layer !== null) {
        setPortalContainer(layer);
        destroyRef.onDestroy(() => setPortalContainer(null, layer.ownerDocument));
      }

      /* The shell answers its own inline size and not the window's, which is
         what makes a shell inside a splitter, a preview frame or a Storybook
         stage behave like the narrow window it is the width of. */
      if (typeof ResizeObserver === 'undefined') return;
      const gate = createWidthGate(this.host, {
        at: APP_SHELL_OVERLAY_AT,
        onChange: (narrow) => this.narrow.set(narrow),
      });
      this.narrow.set(gate.narrow());
      destroyRef.onDestroy(() => gate.destroy());
    });

    /**
     * Crossing into the overlaid mode with the region open closes it, and says
     * `resize`. A product persisting the reader's own choice writes
     * `if (reason !== 'resize') persist(next)` and keeps the wide preference
     * through every narrow window the reader ever opens.
     */
    /* `undefined` until the first resolved mode is seen: a mode *forced* to
       overlay is the region's starting point, not a crossing, and the first
       run closed a region the template had just opened. Only a mode the width
       decided — `auto` resolving narrow — is a crossing on first sight. */
    let wasOverlay: boolean | undefined;
    effect(() => {
      const mode = this.resolvedMode();
      if (mode === null) return;
      const overlay = mode === 'overlay';
      const first = wasOverlay === undefined;
      const entered = overlay && (first ? this.wantedMode() === 'auto' : !wasOverlay);
      wasOverlay = overlay;
      if (!entered) return;
      queueMicrotask(() => {
        if (this.navOpen()) this.request(false, 'resize', undefined);
      });
    });
    let asideWasOverlay: boolean | undefined;
    effect(() => {
      const mode = this.resolvedAsideMode();
      if (mode === null) return;
      const overlay = mode === 'overlay';
      const first = asideWasOverlay === undefined;
      const entered = overlay && (first ? this.wantedAsideMode() === 'auto' : !asideWasOverlay);
      asideWasOverlay = overlay;
      if (!entered) return;
      queueMicrotask(() => {
        if (this.asideOpen()) this.requestAside(false, 'resize', undefined);
      });
    });

    /**
     * The overlaid region is a dismissable layer with a focus scope over it.
     * `@slotted/core/dismissable-layer` inerts every sibling of the layer while
     * it is modal, which is the whole of the modal contract: the reader is in
     * the panel, and the ways out are `Escape`, the veil, a destination, and
     * whatever control the consumer put inside the panel. The toggle is inert
     * with the rest of the shell, exactly as a dialog's trigger is, and is
     * registered as a branch so a press on it is never read as a press outside.
     *
     * No surveyed implementation inerts anything: Vaadin and PatternFly draw
     * the veil and leave what is under it operable.
     */
    /**
     * One layer per region, and the same three modules for both: the pane's
     * layer is the navigation's with the region, the trigger and the request
     * swapped. `@slotted/core/dismissable-layer` keeps one stack, so with both
     * open — only possible with both modes forced — `Escape` reaches the topmost.
     */
    const raise = (
      open: () => boolean,
      panel: () => HTMLElement | null,
      trigger: () => HTMLElement | null,
      close: (reason: AppShellAsideOpenReason, source: unknown) => void,
    ) => {
      let layer: DismissableLayerHandle | null = null;
      let release: (() => void) | null = null;
      effect(() => {
        const isOpen = open();
        const modal = this.resolvedModal();
        const escape = this.resolvedEscape();
        const outsidePress = this.resolvedOutsidePress();
        /* A history entry is a modal layer's: a layer the page stays reachable
           under has no claim on the way back. */
        const back = modal && this.resolvedBack() === 'close';

        release?.();
        release = null;
        layer?.destroy();
        layer = null;
        if (!isOpen) return;

        queueMicrotask(() => {
          const node = panel();
          if (node === null || !open()) return;

          const control = trigger();
          layer = createDismissableLayer(node, {
            ...(control === null ? {} : { branches: [control] }),
            back,
            content: node,
            escape: escape === 'close',
            modal,
            onDismiss: (request) => {
              if (request.reason === 'outsidePress' && outsidePress === 'none') {
                return request.cancel();
              }
              close(request.reason as AppShellAsideOpenReason, request.source);
            },
            outsidePress: outsidePress === 'close',
            outsidePressEvent: 'click',
          });

          const scope = createFocusScope(node, {
            contain: modal,
            initial: 'first',
            ...(control === null ? {} : { restore: () => control }),
          });
          scope.enter();

          release = () => scope.destroy();
        });
      });
      destroyRef.onDestroy(() => {
        release?.();
        layer?.destroy();
      });
    };

    raise(
      () => this.overlay(),
      () => this.nodes.nav,
      () => this.nodes.toggle,
      (reason, source) => this.request(false, reason, source),
    );
    raise(
      () => this.asideOverlay(),
      () => this.nodes.aside,
      () => this.nodes.asideToggle,
      (reason, source) => this.requestAside(false, reason, source),
    );
  }

  /** A region says it exists, so a skip link is never written to a target nobody rendered. */
  registerRegion(region: 'nav' | 'main' | 'aside'): () => void {
    this.regions.update((current) => ({ ...current, [region]: true }));
    return () => this.regions.update((current) => ({ ...current, [region]: false }));
  }

  /** Asks to move the region, carrying the reason and the originating event. */
  request(next: boolean, reason: AppShellOpenReason, source: unknown) {
    if (next === this.navOpen()) return;

    let cancelled = false;
    const state = createControllable<boolean>({
      initial: this.navOpen(),
      onRequest: (raw) => {
        cancelled = raw.cancelled;
        this.navOpenChangeRequest.emit({
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

    if (!state.request(next, reason, source) || cancelled) return;
    this.navOpen.set(next);
  }

  /** Asks to move the pane, carrying the reason and the originating event. */
  requestAside(next: boolean, reason: AppShellAsideOpenReason, source: unknown) {
    if (next === this.asideOpen()) return;

    let cancelled = false;
    const state = createControllable<boolean>({
      initial: this.asideOpen(),
      onRequest: (raw) => {
        cancelled = raw.cancelled;
        this.asideOpenChangeRequest.emit({
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

    if (!state.request(next, reason, source) || cancelled) return;
    this.asideOpen.set(next);
  }

  /** Asks to show the pane, with the reason `programmatic`. */
  openAside() {
    this.requestAside(true, 'programmatic', undefined);
  }
  /** Asks to hide it, with the reason `programmatic`. */
  closeAside() {
    this.requestAside(false, 'programmatic', undefined);
  }

  /** Asks to show the region, with the reason `programmatic`. */
  openNav() {
    this.request(true, 'programmatic', undefined);
  }
  /** Asks to hide it, with the reason `programmatic`. */
  closeNav() {
    this.request(false, 'programmatic', undefined);
  }
  /** Moves focus into the content region, which is where a skip link sends it. */
  focusMain() {
    this.nodes.main?.focus();
  }

  /**
   * A click that lands on an `a[href]` inside the region asks to close, in the
   * overlaid mode only. Vaadin and PatternFly both do it, and without it a
   * phone costs two taps per destination. `defaultPrevented` is no refusal
   * here: a client-side router prevents the native navigation of every link it
   * routes. A disabled destination (`aria-disabled="true"`) stays open; any
   * other refusal cancels the request.
   */
  protected onClick(event: MouseEvent) {
    if (!this.overlay() || !this.resolvedCloseOnNavigate()) return;
    const link = (event.target as Element | null)?.closest?.('a[href]');
    if (!link || this.nodes.nav?.contains(link) !== true) return;
    if (link.getAttribute('aria-disabled') === 'true') return;
    this.request(false, 'select', event);
  }
}

function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined ? undefined : booleanAttribute(value);
}

/** Attaches a region's element to the shell and takes it off again on destroy. */
function attach(slot: 'aside' | 'asideToggle' | 'banner' | 'footer' | 'main' | 'nav' | 'toggle') {
  const shell = inject(SlAppShell);
  const node: HTMLElement = inject(ElementRef).nativeElement;
  shell.nodes[slot] = node;
  inject(DestroyRef).onDestroy(() => {
    if (shell.nodes[slot] === node) shell.nodes[slot] = null;
  });
  return shell;
}

/**
 * The `banner` landmark: a `header` in the context of the `body`, so it needs
 * no `role`.
 */
@Directive({
  selector: 'header[slAppShellBanner]',
  standalone: true,
  exportAs: 'slAppShellBanner',
  host: { 'data-part': 'banner' },
})
export class SlAppShellBanner {
  constructor() {
    attach('banner');
  }
}

/** The start cluster of the banner: the toggle, the mark, the name of the workspace. */
@Directive({
  selector: '[slAppShellBrand]',
  standalone: true,
  exportAs: 'slAppShellBrand',
  host: { 'data-part': 'brand' },
})
export class SlAppShellBrand {}

/** The middle of the bar, and the one cluster that grows: a search, a trail, a route title. */
@Directive({
  selector: '[slAppShellCentre]',
  standalone: true,
  exportAs: 'slAppShellCentre',
  host: { 'data-part': 'centre' },
})
export class SlAppShellCentre {}

/** The end cluster, pushed there by the space it takes. */
@Directive({
  selector: '[slAppShellActions]',
  standalone: true,
  exportAs: 'slAppShellActions',
  host: { 'data-part': 'actions' },
})
export class SlAppShellActions {}

/**
 * The `navigation` landmark, and the one element all three modes share. A
 * document with more than one `navigation` needs a unique label on each, so
 * this one carries the family's unless the consumer wrote another.
 */
@Directive({
  selector: 'nav[slAppShellNav]',
  standalone: true,
  exportAs: 'slAppShellNav',
  host: {
    'data-part': 'nav',
    '[attr.id]': 'elementId',
    '[attr.aria-label]': 'label()',
  },
})
export class SlAppShellNav {
  private readonly shell = attach('nav');
  private readonly written = inject(new HostAttributeToken('aria-label'), { optional: true });
  private readonly writtenId = inject(new HostAttributeToken('id'), { optional: true });

  protected readonly elementId = this.writtenId ?? this.shell.navId;
  protected readonly label = computed(() => this.written ?? this.shell.resolvedMessages().nav);

  constructor() {
    const remove = this.shell.registerRegion('nav');
    inject(DestroyRef).onDestroy(remove);
  }
}

/** The pinned top of the navigation column. */
@Directive({
  selector: '[slAppShellNavHeader]',
  standalone: true,
  exportAs: 'slAppShellNavHeader',
  host: { 'data-part': 'nav-header' },
})
export class SlAppShellNavHeader {}

/** The middle, and the only part of the column that scrolls. */
@Directive({
  selector: '[slAppShellNavBody]',
  standalone: true,
  exportAs: 'slAppShellNavBody',
  host: { 'data-part': 'nav-body' },
})
export class SlAppShellNavBody {}

/** The pinned bottom: the account, the collapse control. */
@Directive({
  selector: '[slAppShellNavFooter]',
  standalone: true,
  exportAs: 'slAppShellNavFooter',
  host: { 'data-part': 'nav-footer' },
})
export class SlAppShellNavFooter {}

/**
 * The `main` landmark, and the skip link's destination.
 *
 * `tabindex="-1"` is not decoration: a `main` without it takes the scroll and
 * leaves the focus behind in Safari and in Firefox, so the link appears to work
 * and moves nothing a screen reader follows.
 */
@Directive({
  selector: 'main[slAppShellMain]',
  standalone: true,
  exportAs: 'slAppShellMain',
  host: {
    'data-part': 'main',
    tabindex: '-1',
    '[attr.id]': 'elementId',
  },
})
export class SlAppShellMain {
  private readonly shell = attach('main');
  private readonly writtenId = inject(new HostAttributeToken('id'), { optional: true });
  protected readonly elementId = this.writtenId ?? this.shell.mainId;

  constructor() {
    const remove = this.shell.registerRegion('main');
    inject(DestroyRef).onDestroy(remove);
  }
}

/**
 * The `complementary` landmark. It opens and closes the way the navigation
 * region does — a column beside the content or a layer over it, by
 * `asideMode` — and carries its own `data-open`, because the host's is the
 * navigation's and every selector written over it still reads the navigation.
 */
@Directive({
  selector: 'aside[slAppShellAside]',
  standalone: true,
  exportAs: 'slAppShellAside',
  host: {
    'data-part': 'aside',
    '[attr.id]': 'elementId',
    '[attr.aria-label]': 'label()',
    '[attr.data-open]': "shell.asideOpen() ? '' : null",
  },
})
export class SlAppShellAside {
  protected readonly shell = attach('aside');
  private readonly written = inject(new HostAttributeToken('aria-label'), { optional: true });
  private readonly writtenId = inject(new HostAttributeToken('id'), { optional: true });
  protected readonly elementId = this.writtenId ?? this.shell.asideId;
  protected readonly label = computed(() => this.written ?? this.shell.resolvedMessages().aside);

  constructor() {
    const remove = this.shell.registerRegion('aside');
    inject(DestroyRef).onDestroy(remove);
  }
}

/** The pinned top of the pane: its title, and the control that closes it. */
@Directive({
  selector: '[slAppShellAsideHeader]',
  standalone: true,
  exportAs: 'slAppShellAsideHeader',
  host: { 'data-part': 'aside-header' },
})
export class SlAppShellAsideHeader {}

/** The middle, and the only part of the pane that scrolls. */
@Directive({
  selector: '[slAppShellAsideBody]',
  standalone: true,
  exportAs: 'slAppShellAsideBody',
  host: { 'data-part': 'aside-body' },
})
export class SlAppShellAsideBody {}

/** The pinned bottom: the actions that close the task the pane holds. */
@Directive({
  selector: '[slAppShellAsideFooter]',
  standalone: true,
  exportAs: 'slAppShellAsideFooter',
  host: { 'data-part': 'aside-footer' },
})
export class SlAppShellAsideFooter {}

/**
 * The pane's disclosure control, with the navigation control's wiring: it can
 * stand in the pane's own header, in the banner's actions, or anywhere else,
 * and there is still exactly one control carrying the pane's state.
 */
@Component({
  selector: 'button[slAppShellAsideToggle]',
  standalone: true,
  exportAs: 'slAppShellAsideToggle',
  imports: [SlGlyph, SlIcon],
  /* The panel mark says what a press does, unless the consumer wrote content of their own. */
  template: `<ng-content
    ><span slIcon
      ><svg slGlyph [name]="shell.asideOpen() ? 'panel-close' : 'panel-open'"></svg></span
  ></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-part': 'aside-toggle',
    type: 'button',
    '[attr.id]': 'elementId',
    '[attr.aria-controls]': 'controls',
    '[attr.aria-expanded]': 'shell.asideOpen()',
    '[attr.aria-label]': 'label()',
    '(click)': 'press($event)',
  },
})
export class SlAppShellAsideToggle {
  protected readonly shell = attach('asideToggle');
  private readonly written = inject(new HostAttributeToken('aria-label'), { optional: true });
  private readonly writtenId = inject(new HostAttributeToken('id'), { optional: true });
  private readonly writtenControls = inject(new HostAttributeToken('aria-controls'), {
    optional: true,
  });

  protected readonly elementId = this.writtenId ?? this.shell.asideToggleId;
  protected readonly controls = this.writtenControls ?? this.shell.asideId;
  protected readonly label = computed(() => {
    if (this.written !== null) return this.written;
    const messages = this.shell.resolvedMessages();
    return this.shell.asideOpen() ? messages.closeAside : messages.openAside;
  });

  protected press(event: MouseEvent) {
    const reason: AppShellAsideOpenReason = event.detail === 0 ? 'keyboard' : 'pointer';
    this.shell.requestAside(!this.shell.asideOpen(), reason, event);
  }
}

/** The `contentinfo` landmark: the application's footer, not the page's action bar. */
@Directive({
  selector: 'footer[slAppShellFooter]',
  standalone: true,
  exportAs: 'slAppShellFooter',
  host: { 'data-part': 'footer' },
})
export class SlAppShellFooter {
  constructor() {
    attach('footer');
  }
}

/**
 * The disclosure control, by the APG's Disclosure pattern: a `button` carrying
 * `aria-expanded` and `aria-controls`, which `Enter` and `Space` activate
 * natively. It takes its wiring from the shell rather than from its position,
 * so it can stand in the banner, in the navigation's own footer, or anywhere
 * else, and there is still exactly one control carrying the state.
 */
@Component({
  selector: 'button[slAppShellNavToggle]',
  standalone: true,
  exportAs: 'slAppShellNavToggle',
  imports: [SlGlyph, SlIcon],
  /* The panel mark says what a press does, unless the consumer wrote content of their own. */
  template: `<ng-content
    ><span slIcon><svg slGlyph [name]="shell.navOpen() ? 'panel-close' : 'panel-open'"></svg></span
  ></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-part': 'nav-toggle',
    type: 'button',
    '[attr.id]': 'elementId',
    '[attr.aria-controls]': 'controls',
    '[attr.aria-expanded]': 'shell.navOpen()',
    '[attr.aria-label]': 'label()',
    '(click)': 'press($event)',
  },
})
export class SlAppShellNavToggle {
  protected readonly shell = attach('toggle');
  private readonly written = inject(new HostAttributeToken('aria-label'), { optional: true });
  private readonly writtenId = inject(new HostAttributeToken('id'), { optional: true });
  private readonly writtenControls = inject(new HostAttributeToken('aria-controls'), {
    optional: true,
  });

  protected readonly elementId = this.writtenId ?? this.shell.toggleId;
  protected readonly controls = this.writtenControls ?? this.shell.navId;
  protected readonly label = computed(() => {
    if (this.written !== null) return this.written;
    const messages = this.shell.resolvedMessages();
    return this.shell.navOpen() ? messages.close : messages.open;
  });

  protected press(event: MouseEvent) {
    /* A click synthesised by the keyboard reports no detail; a real one does.
       The reason is the difference between a product that persists a press and
       one that cannot tell which gesture it saw. */
    const reason: AppShellOpenReason = event.detail === 0 ? 'keyboard' : 'pointer';
    this.shell.request(!this.shell.navOpen(), reason, event);
  }
}
