import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';

import { SlTabs } from './tabs';
import type { TabsDismissReason, TabsSelectionReason } from './tabs';

/**
 * A click synthesised by the keyboard reports no detail; a real one reports the
 * click count. It is why `Enter`, `Space` and a pointer are told apart without a
 * key listener existing for activation.
 */
function activationReason(event: Event): TabsSelectionReason {
  return event instanceof MouseEvent && event.detail === 0 ? 'keyboard' : 'pointer';
}

/**
 * The list of tabs, and the one tab stop the family holds.
 *
 * It hands its element to the root, which owns the roving tab stop, the removal
 * focus and the overflow observer. `tabindex="-1"` is the last resort of the
 * removal focus: a list emptied by its final dismissal keeps focus rather than
 * returning it to the top of the page.
 *
 * Its accessible name is the consumer's own `aria-label` or `aria-labelledby`:
 * only the page knows what the set of views is for.
 */
@Directive({
  selector: '[slTabList]',
  standalone: true,
  exportAs: 'slTabList',
  host: {
    'data-part': 'list',
    role: 'tablist',
    tabindex: '-1',
    '[attr.aria-orientation]': 'ariaOrientation()',
  },
})
export class SlTabList {
  private readonly tabs = inject(SlTabs);

  protected readonly ariaOrientation = computed(() =>
    this.tabs.resolvedOrientation() === 'vertical' ? 'vertical' : null,
  );

  constructor() {
    this.tabs.attachList(inject(ElementRef<HTMLElement>).nativeElement);
  }
}

/**
 * One tab, in the box that holds it.
 *
 * The host is that box, and it is presentational for two reasons a `button`
 * cannot answer: a `button` may not contain a `button`, so a dismissible tab
 * needs somewhere to put its second control, and the marker has to span the
 * pair rather than only the label.
 *
 * `href` makes the control an anchor, and a click carrying a modifier key is
 * left to the browser so a deep link still opens in a new browser tab.
 */
@Component({
  selector: '[slTab]',
  standalone: true,
  exportAs: 'slTab',
  template: `@if (href(); as destination) {
      <a
        #control
        data-part="tab"
        role="tab"
        [attr.id]="tabId()"
        [attr.href]="destination"
        [attr.data-value]="value()"
        [attr.aria-controls]="panelId()"
        [attr.aria-selected]="selected()"
        [attr.aria-disabled]="resolvedDisabled() ? 'true' : null"
        [attr.aria-keyshortcuts]="dismissible() ? 'Delete' : null"
        [attr.tabindex]="selected() ? 0 : -1"
        (click)="onClick($event)"
        (keydown)="onKeydown($event)"
        ><span data-part="label"><ng-content /></span
      ></a>
    } @else {
      <button
        #control
        data-part="tab"
        role="tab"
        type="button"
        [attr.id]="tabId()"
        [attr.data-value]="value()"
        [attr.aria-controls]="panelId()"
        [attr.aria-selected]="selected()"
        [attr.aria-keyshortcuts]="dismissible() ? 'Delete' : null"
        [disabled]="resolvedDisabled()"
        [attr.tabindex]="selected() ? 0 : -1"
        (click)="onClick($event)"
        (keydown)="onKeydown($event)"
      >
        <span data-part="label"><ng-content /></span>
      </button>
    }
    @if (dismissible()) {
      <button
        data-part="dismiss"
        type="button"
        tabindex="-1"
        [attr.aria-label]="dismissLabel()"
        [disabled]="resolvedDisabled()"
        (click)="onDismiss($event)"
      ></button>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'item',
    role: 'presentation',
    '[attr.data-selected]': "selected() ? '' : null",
  },
})
export class SlTab {
  /** What this tab selects. It is what the family's value holds. */
  readonly value = input.required<string>();
  /** Unstated rather than `false`, so the tab defers to the family. */
  readonly disabled = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (state) => (state === undefined ? undefined : booleanAttribute(state)),
  });
  /** Whether this tab carries a control that closes it. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** The accessible name of that control. Required whenever it is drawn. */
  readonly dismissLabel = input<string | undefined>(undefined);
  /** Makes the control an anchor, for a view a router can deep-link to. */
  readonly href = input<string | undefined>(undefined);
  /**
   * The id of the element this tab controls, when it is not a panel of this
   * family: a strip over one region whose content the value filters — a
   * feed, a table — names that region here, and `aria-controls` says so.
   */
  readonly controls = input<string | undefined>(undefined);

  /** The family this tab belongs to. Public, because a template may read it. */
  readonly tabs = inject(SlTabs);

  readonly selected = computed(() => this.tabs.holds(this.value()));
  /**
   * A family out of action takes every tab with it. The tab's own input can
   * only add to that, never subtract: a consumer that writes `[disabled]="false"`
   * on a tab inside a disabled family is saying nothing about that family, and a
   * template that binds an expression writes `false` where it means "not this
   * one" — which is how every tab stayed operable while the family reported
   * itself disabled.
   */
  readonly resolvedDisabled = computed(() => this.tabs.disabled() || (this.disabled() ?? false));

  protected readonly tabId = computed(() => this.tabs.identify(this.value()).tabId);
  protected readonly panelId = computed(
    () => this.controls() ?? this.tabs.identify(this.value()).panelId,
  );

  protected onClick(event: MouseEvent) {
    if (event.defaultPrevented || this.resolvedDisabled()) return;
    /* A modifier click on a link is the reader asking the browser for a new
       window, and swallowing it is what turns a real destination into a
       decoration. */
    if (
      this.href() !== undefined &&
      (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    ) {
      return;
    }
    if (this.href() !== undefined) event.preventDefault();
    this.tabs.select(this.value(), activationReason(event), event);
  }

  /**
   * `Delete` closes the tab, which is the key the APG names for it. A held key
   * repeats, and a repeat would close the tab focus has just landed on.
   */
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.repeat) return;
    if (!this.dismissible() || this.resolvedDisabled()) return;
    if (event.key !== 'Delete') return;

    event.preventDefault();
    this.tabs.dismiss(this.value(), 'keyboard' satisfies TabsDismissReason, event);
  }

  protected onDismiss(event: MouseEvent) {
    /* The control sits inside the item, whose click would otherwise select the
       tab that is being closed. */
    event.stopPropagation();
    this.tabs.dismiss(this.value(), 'pointer', event);
  }
}

/**
 * The content of one tab.
 *
 * It is in the page's tab sequence, which is where `Tab` from the list goes, and
 * it is hidden with the attribute rather than with a class: a screen reader,
 * find-in-page and `:target` all already understand `hidden`.
 *
 * Whether its content exists at all is what `mount` decides. `active` renders it
 * only while the tab is selected, which is why the content is a template rather
 * than projected markup: projected markup is built by the consumer's own view
 * whether this panel shows it or not.
 */
@Component({
  selector: '[slTabPanel]',
  standalone: true,
  exportAs: 'slTabPanel',
  template: `@if (present()) {
    <ng-content />
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'panel',
    role: 'tabpanel',
    tabindex: '0',
    '[attr.id]': 'panelId()',
    '[attr.aria-labelledby]': 'tabId()',
    '[attr.hidden]': "selected() ? null : ''",
  },
})
export class SlTabPanel {
  /** The tab this panel belongs to. */
  readonly value = input.required<string>();

  private readonly tabs = inject(SlTabs);

  readonly selected = computed(() => this.tabs.holds(this.value()));

  protected readonly panelId = computed(() => this.tabs.identify(this.value()).panelId);
  protected readonly tabId = computed(() => this.tabs.identify(this.value()).tabId);
  protected readonly present = computed(() => {
    const mount = this.tabs.resolvedMount();
    if (mount === 'eager') return true;
    if (this.selected()) return true;
    return mount === 'lazy' && this.tabs.hasSeen(this.value());
  });
}

/**
 * The slot beside the list, on the same row.
 *
 * What belongs in it is a `toolbar`: one tab stop for however many actions the
 * page puts there, which is what keeps the distance between the tab list and the
 * panel to the two stops the pattern asks for.
 */
@Directive({
  selector: '[slTabActions]',
  standalone: true,
  exportAs: 'slTabActions',
  host: { 'data-part': 'actions' },
})
export class SlTabActions {}
