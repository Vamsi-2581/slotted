import { createRovingTabindex, TOOLBAR_ITEM_SELECTOR, toolbarOwnedKeys } from '@slotted/core/focus';
import type { RovingTabindexHandle } from '@slotted/core/focus';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';

import { injectToolbarDefaults } from './toolbar-defaults';
import type {
  ToolbarOrientation,
  ToolbarOverflow,
  ToolbarSize,
  ToolbarVariant,
} from './toolbar-defaults';

export type {
  ToolbarDefaults,
  ToolbarOrientation,
  ToolbarOverflow,
  ToolbarSize,
  ToolbarVariant,
} from './toolbar-defaults';

/**
 * A set of controls that share one tab stop.
 *
 * **The keyboard is the whole point of the role.** `Tab` enters the bar once and
 * lands on the control that last had focus, the arrows of the flow axis move
 * between the controls and wrap — from row to row when the bar wrapped, because
 * the item list is linear — and `Home` and `End` reach the ends. The cross axis
 * duplicates the pair, which the APG permits and which is what gives focus a way
 * out of an item that keeps the flow arrows for itself.
 *
 * **The items are the consumer's own controls.** Anything focusable inside the
 * bar is an item, found through `TOOLBAR_ITEM_SELECTOR`, so this library's
 * `button`, `link`, `checkbox`, `switch` and `text-field` — and a menu trigger,
 * and a consumer's own control — drop in unwrapped.
 *
 * **The bar paints itself and nothing inside it.** A bar out of action is
 * `<fieldset disabled>` around it: the platform disables every control inside,
 * and a natively disabled control cannot be focused, so the arrows skip exactly
 * those.
 */
@Component({
  selector: '[slToolbar]',
  standalone: true,
  exportAs: 'slToolbar',
  template: '<ng-content />',
  styleUrl: '../../../styles/src/toolbar/toolbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-ui': 'toolbar',
    'data-part': 'root',
    role: 'toolbar',
    '[attr.data-orientation]': 'resolvedOrientation()',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-variant]': 'resolvedVariant()',
    '[attr.data-overflow]': 'resolvedOverflow()',
    '[attr.aria-orientation]': 'ariaOrientation()',
  },
})
export class SlToolbar {
  readonly orientation = input<ToolbarOrientation | undefined>(undefined);
  readonly size = input<ToolbarSize | undefined>(undefined);
  readonly variant = input<ToolbarVariant | undefined>(undefined);
  readonly overflow = input<ToolbarOverflow | undefined>(undefined);
  /** Whether the arrows wrap past the ends of the bar. */
  readonly loop = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (state) => (state === undefined ? undefined : booleanAttribute(state)),
  });

  private readonly defaults = injectToolbarDefaults();
  private readonly element = inject(ElementRef<HTMLElement>).nativeElement;

  readonly resolvedOrientation = computed(() => this.orientation() ?? this.defaults.orientation);
  readonly resolvedSize = computed(() => this.size() ?? this.defaults.size);
  readonly resolvedVariant = computed(() => this.variant() ?? this.defaults.variant);
  readonly resolvedOverflow = computed(() => this.overflow() ?? this.defaults.overflow);
  readonly resolvedLoop = computed(() => this.loop() ?? this.defaults.loop);

  protected readonly ariaOrientation = computed(() =>
    this.resolvedOrientation() === 'vertical' ? 'vertical' : null,
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const tabindex: RovingTabindexHandle = createRovingTabindex(this.element, {
        crossAxis: true,
        includeAriaDisabled: true,
        itemSelector: TOOLBAR_ITEM_SELECTOR,
        loop: this.resolvedLoop(),
        orientation: () => this.resolvedOrientation(),
        ownedKeys: (item) => toolbarOwnedKeys(item, this.resolvedOrientation()),
      });

      /**
       * A control arriving or leaving has to reach the tab stop, and neither
       * binding can be told by the other's change detection. The DOM is the one
       * thing they agree on.
       */
      const observer = new MutationObserver(() => tabindex.refresh());
      observer.observe(this.element, { childList: true, subtree: true });

      destroyRef.onDestroy(() => {
        observer.disconnect();
        tabindex.destroy();
      });
    });
  }
}

/**
 * A run of related controls, announced as a group.
 *
 * The distance inside it is half the bar's gap and the distance around it is a
 * gap and a half, so the boundary between two groups reads wider than the
 * boundary between two controls. Its accessible name is the consumer's own
 * `aria-label`.
 *
 * The arrows do not stop at its edge: a group is a label around a run, not a
 * second keyboard.
 */
@Directive({
  selector: '[slToolbarGroup]',
  standalone: true,
  exportAs: 'slToolbarGroup',
  host: { 'data-part': 'group', role: 'group' },
})
export class SlToolbarGroup {}

/**
 * A hairline between two runs.
 *
 * It is a part of this family rather than a `divider`, because its geometry
 * belongs to the bar: it is measured against the controls beside it, and it
 * turns with the bar. `aria-orientation` states the axis of the rule itself,
 * which is perpendicular to the one the controls run along.
 */
@Directive({
  selector: '[slToolbarSeparator]',
  standalone: true,
  exportAs: 'slToolbarSeparator',
  host: {
    'data-part': 'separator',
    role: 'separator',
    '[attr.aria-orientation]': 'ariaOrientation()',
  },
})
export class SlToolbarSeparator {
  private readonly toolbar = inject(SlToolbar);

  protected readonly ariaOrientation = computed(() =>
    this.toolbar.resolvedOrientation() === 'vertical' ? 'horizontal' : 'vertical',
  );
}

/**
 * The free space between two runs, so what follows sits at the end of the bar.
 *
 * It replaces a `justify` axis: an axis decides the placement of every control
 * at once, and what a bar needs is one boundary — the editing controls at the
 * start, the destructive one at the end.
 */
@Directive({
  selector: '[slToolbarSpacer]',
  standalone: true,
  exportAs: 'slToolbarSpacer',
  host: { 'data-part': 'spacer', 'aria-hidden': 'true' },
})
export class SlToolbarSpacer {}
