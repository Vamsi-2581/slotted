import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  forwardRef,
  HostAttributeToken,
  inject,
  Injector,
  input,
  numberAttribute,
  output,
  signal,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';

import {
  BREADCRUMB_DEFAULT_ITEMS_AFTER,
  BREADCRUMB_DEFAULT_ITEMS_BEFORE,
  BREADCRUMB_DEFAULT_LABEL,
  BREADCRUMB_DEFAULT_MAX_ITEMS,
  collapsedRange,
  injectBreadcrumbDefaults,
  type BreadcrumbExpandReason,
} from './breadcrumb.constants';

/**
 * The trail of ancestors above the current page.
 *
 * **The landmark and the list are the platform's.** `nav` makes the trail
 * findable and `ol` carries the hierarchy and the set size, which is the whole
 * of the APG's Breadcrumb pattern: it lists no keyboard interaction and two
 * attributes, and both are written here rather than reimplemented.
 *
 * **The collapse expands in place.** An overlay would need a layer, a
 * positioner and a dismissal policy; this needs none of them. The hidden
 * crumbs carry `hidden`, so they leave the accessibility tree with the page,
 * and the button that hides them names the count.
 *
 * **It is a component on the consumer's own `nav`.** A directive carries no
 * `styleUrl`, and the element was never the family's to choose.
 */
@Component({
  selector: 'nav[slBreadcrumb]',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrls: ['../../../styles/src/breadcrumb/breadcrumb.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'slBreadcrumb',
  host: {
    'data-ui': 'breadcrumb',
    'data-part': 'root',
    '[attr.aria-label]': 'accessibleLabel()',
    '[attr.data-expanded]': 'expanded() ? "" : null',
  },
})
export class SlBreadcrumb {
  /**
   * Present means controlled, for the life of the component, which is why the
   * unset value is `undefined` rather than `false`: a family that read `false`
   * as a consumer's answer would never own its own state.
   */
  readonly expandedValue = input(undefined, {
    alias: 'expanded',
    transform: (value: boolean | string | undefined) =>
      value === undefined ? undefined : booleanAttribute(value),
  });
  /** What an uncontrolled trail starts from, read once. */
  readonly defaultExpanded = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly maxItems = input(undefined, { transform: optionalNumber });
  readonly itemsBeforeCollapse = input(undefined, { transform: optionalNumber });
  readonly itemsAfterCollapse = input(undefined, { transform: optionalNumber });
  readonly separator = input<TemplateRef<unknown> | undefined>(undefined);

  /**
   * Emitted before the trail expands, carrying the value it replaces, the
   * reason and the event it came from. It is not the second half of
   * `[(expanded)]`: a two-way binding has one slot and can carry none of those.
   */
  readonly expandedChange = output<ChangeRequest<boolean>>();

  private readonly own = signal(false);
  readonly expanded = computed(() => this.expandedValue() ?? this.own());

  private readonly defaults = injectBreadcrumbDefaults();

  /** A static `aria-label` the consumer wrote survives the host binding. */
  private readonly ownLabel = inject(new HostAttributeToken('aria-label'), { optional: true });

  readonly accessibleLabel = computed(
    () => this.ownLabel ?? this.label() ?? this.defaults.label ?? BREADCRUMB_DEFAULT_LABEL,
  );
  readonly maxItemsValue = computed(
    () => this.maxItems() ?? this.defaults.maxItems ?? BREADCRUMB_DEFAULT_MAX_ITEMS,
  );
  readonly beforeValue = computed(
    () =>
      this.itemsBeforeCollapse() ??
      this.defaults.itemsBeforeCollapse ??
      BREADCRUMB_DEFAULT_ITEMS_BEFORE,
  );
  readonly afterValue = computed(
    () =>
      this.itemsAfterCollapse() ??
      this.defaults.itemsAfterCollapse ??
      BREADCRUMB_DEFAULT_ITEMS_AFTER,
  );
  readonly separatorValue = computed(() => this.separator() ?? this.defaults.separator);

  /**
   * Where focus goes once the ellipsis stops existing, registered by the list —
   * the only part that can see which crumb the ellipsis replaced. React reaches
   * the same crumb through an id it generates; Angular reaches it through the
   * query it already has, and neither writes anything the other does not.
   */
  private focusAfterExpand: (() => void) | undefined;

  registerFocusTarget(focus: (() => void) | undefined) {
    this.focusAfterExpand = focus;
  }

  private readonly injector = inject(Injector);

  /**
   * The ellipsis stops existing the moment it is pressed, and focus on a
   * removed element is lost to the body — so it is given to the first crumb the
   * expansion revealed. The move waits a microtask because that crumb is still
   * hidden while this runs.
   */
  expand(reason: BreadcrumbExpandReason, source?: Event) {
    if (this.expanded()) return;
    const state = createControllable<boolean>({
      controlled: this.expandedValue(),
      initial: this.expanded(),
      onRequest: (request) => this.expandedChange.emit(request),
    });
    if (state.request(true, reason, source)) this.own.set(true);
    /**
     * After the render, not after a microtask: the crumb focus moves to is
     * still hidden while this runs, and a microtask fires before Angular has
     * written the DOM. Focus then stayed on a removed button and fell to the
     * body, which the spec caught and nothing else would have.
     */
    afterNextRender(() => this.focusAfterExpand?.(), { injector: this.injector });
  }
}

/**
 * The ordered list, and the one part that knows how many crumbs there are.
 *
 * It queries its items rather than projecting them blindly, because three
 * facts about a crumb can only be known from the outside: whether it is the
 * last — the last draws no separator — whether the collapse is hiding it, and
 * whether it is the first one an expansion reveals.
 *
 * That is where the two bindings differ and the DOM does not: React maps its
 * children, Angular writes the same three facts back onto queried items.
 */
@Directive({
  selector: 'ol[slBreadcrumbList]',
  standalone: true,
  exportAs: 'slBreadcrumbList',
  host: { 'data-part': 'list' },
})
export class SlBreadcrumbList {
  private readonly trail = inject(SlBreadcrumb);
  /* The crumb is declared below this class, and the dev-server transform puts
     the query predicate in a static initializer — a direct reference would read
     the binding before it exists. `forwardRef` defers the read to the query. */
  private readonly items = contentChildren<SlBreadcrumbItem>(forwardRef(() => SlBreadcrumbItem));

  constructor() {
    effect(() => {
      const items = this.items();
      const maxItems = this.trail.maxItemsValue();
      /**
       * The range is computed whether or not the trail is expanded, because two
       * different things read it. The collapse reads it only while folded; the
       * focus target reads it afterwards, and it has to still be there — the id
       * used to disappear with the ellipsis, which left focus on a removed
       * button and therefore on the body.
       */
      const range =
        maxItems <= 0 || items.length <= maxItems
          ? undefined
          : collapsedRange(items.length, this.trail.beforeValue(), this.trail.afterValue());
      const collapsed = this.trail.expanded() ? undefined : range;

      for (const [index, item] of items.entries()) {
        item.last.set(index === items.length - 1);
        item.collapsed.set(
          collapsed !== undefined && index >= collapsed.start && index < collapsed.end,
        );
        item.revealsAfter.set(collapsed !== undefined && index === collapsed.start);
        item.hiddenCount.set(collapsed === undefined ? 0 : collapsed.end - collapsed.start);
      }

      const revealed = range === undefined ? undefined : items[range.start];
      this.trail.registerFocusTarget(revealed === undefined ? undefined : () => revealed.focus());
    });
  }
}

/**
 * One ancestor, or the current page. It carries the ellipsis before it and the
 * separator after it, so a consumer writes neither and never leaves a trailing
 * one behind.
 */
@Component({
  selector: 'li[slBreadcrumbItem]',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (revealsAfter()) {
      <button
        [attr.aria-label]="ellipsisLabel()"
        aria-expanded="false"
        data-part="ellipsis"
        type="button"
        (click)="trail.expand('pointer', $event)"
        (keydown)="onEllipsisKeydown($event)"
      ></button>
      <span aria-hidden="true" data-part="separator">
        <ng-container *ngTemplateOutlet="trail.separatorValue() ?? null"></ng-container>
      </span>
    }
    <ng-content></ng-content>
    @if (!last()) {
      <span aria-hidden="true" data-part="separator">
        <ng-container *ngTemplateOutlet="trail.separatorValue() ?? null"></ng-container>
      </span>
    }
  `,
  styleUrls: ['../../../styles/src/breadcrumb/breadcrumb.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'slBreadcrumbItem',
  host: {
    'data-part': 'item',
    '[attr.hidden]': 'collapsed() ? "" : null',
  },
})
export class SlBreadcrumbItem {
  readonly trail = inject(SlBreadcrumb);

  private readonly element: HTMLElement = inject(ElementRef).nativeElement;

  /** Written by the list, which is the only part that can see the whole trail. */
  readonly last = signal(false);
  readonly collapsed = signal(false);
  readonly revealsAfter = signal(false);
  readonly hiddenCount = signal(0);

  /** The crumb's own control, whatever the consumer made it. */
  focus() {
    this.element.querySelector<HTMLElement>('a, button, [tabindex]')?.focus();
  }

  readonly ellipsisLabel = computed(() => {
    const hidden = this.hiddenCount();
    return `Show ${hidden} hidden ${hidden === 1 ? 'level' : 'levels'}`;
  });

  onEllipsisKeydown(event: KeyboardEvent) {
    /* `Enter` and `Space` both activate a button and the browser turns each
       into a click; this is what tells the two apart in the request. */
    if (event.key === 'Enter' || event.key === ' ') this.trail.expand('keyboard', event);
  }
}

/**
 * An ancestor that can be reached. The directive sits on the consumer's own
 * anchor, so the role, `Enter`, the context menu and every modified click are
 * the platform's — and `routerLink` composes on the same element, because the
 * element was never the family's to begin with.
 */
@Directive({
  selector: 'a[slBreadcrumbLink]',
  standalone: true,
  exportAs: 'slBreadcrumbLink',
  host: { 'data-part': 'link' },
})
export class SlBreadcrumbLink {
  private readonly element: HTMLAnchorElement = inject(ElementRef).nativeElement;

  focus() {
    this.element.focus();
  }
}

/**
 * The page the reader is on. It is text rather than a link, because a link to
 * the page you are already on goes nowhere, and it carries `aria-current="page"`
 * — the value the ARIA specification names for a link within a set of pages.
 */
@Directive({
  selector: '[slBreadcrumbPage]',
  standalone: true,
  exportAs: 'slBreadcrumbPage',
  host: {
    'data-part': 'page',
    'aria-current': 'page',
  },
})
export class SlBreadcrumbPage {}

/**
 * Absence has to survive the transform: `numberAttribute` maps an unset input
 * to `NaN`, and a family that read that would stop deferring to the provider.
 */
function optionalNumber(value: number | string | undefined) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = numberAttribute(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
