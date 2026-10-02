import { createScrollAffordance } from '@slotted/core/overflow';
import type { OverflowState, ScrollAffordanceHandle } from '@slotted/core/overflow';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  numberAttribute,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { SlTable } from './table';

/**
 * The scroller and the table it holds.
 *
 * Two elements and one component, because neither is a decision a consumer
 * makes: the `table` carries the semantics and the host carries the overflow.
 * Angular pays one element for the host and draws the other in its template,
 * which is the same division `checkbox` records.
 *
 * **The region wiring is written only while the table overflows.** `role`,
 * `tabindex` and a name arrive together, measured by `@slotted/core/overflow` —
 * the rule `prose` set. A tab stop on a table that fits makes a reader press Tab
 * for nothing, and a wide table with no tab stop is unreachable without a
 * pointer. Nothing is measured until the first render after mount, so the
 * server renders a plain scroller and hydration finds the same DOM.
 */
@Component({
  selector: 'div[slTableContent]',
  standalone: true,
  exportAs: 'slTableContent',
  template: `<table
    data-part="table"
    [attr.aria-busy]="table.loading() ? 'true' : null"
    [attr.aria-rowcount]="totalRowCount() ?? null"
  >
    <ng-content />
  </table>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'scroll',
    '[attr.data-overflowing]': "state().overflowing ? '' : null",
    '[attr.data-at-start]': "state().overflowing && state().atStart ? '' : null",
    '[attr.data-at-end]': "state().overflowing && state().atEnd ? '' : null",
    '[attr.role]': "state().overflowing ? 'region' : null",
    '[attr.tabindex]': "state().overflowing ? '0' : null",
    '[attr.aria-label]': 'regionLabel()',
    '[attr.aria-labelledby]': 'regionLabelledBy()',
  },
})
export class SlTableContent {
  /**
   * The total number of rows behind a paged or filtered table. Written as
   * `aria-rowcount`, with `aria-rowindex` on every row, and only then: the
   * practice requires the pair exactly when the DOM is not the whole set.
   */
  readonly totalRowCount = input<number | undefined, number | string | undefined>(undefined, {
    transform: (count) => (count === undefined ? undefined : numberAttribute(count)),
  });
  /** The element that names it instead, which is usually the caption. */
  readonly scrollLabelledBy = input<string | undefined>(undefined);

  readonly table = inject(SlTable);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** The host's own `aria-label`, which wins over the catalog's name for the region. */
  private readonly ownLabel = inject(new HostAttributeToken('aria-label'), { optional: true });
  private affordance: ScrollAffordanceHandle | null = null;

  readonly state = signal<OverflowState>({ overflowing: false, atStart: true, atEnd: true });

  readonly regionLabel = computed(() =>
    this.state().overflowing && this.scrollLabelledBy() === undefined
      ? (this.ownLabel ?? this.table.t('scroll'))
      : null,
  );

  readonly regionLabelledBy = computed(() =>
    this.state().overflowing ? (this.scrollLabelledBy() ?? null) : null,
  );

  constructor() {
    afterNextRender(() => {
      /**
       * Nothing is measured under `stickyTo="page"`: the family has released its
       * own scroll container so the header can stick to what scrolls outside it,
       * and a box that does not scroll has no overflow to answer and no tab stop
       * to earn.
       */
      if (this.table.resolvedStickyTo() === 'page') return;

      const handle = createScrollAffordance(this.host.nativeElement, {
        onChange: (next) => this.state.set(next),
      });
      this.affordance = handle;
      this.state.set(handle.state());
    });

    inject(DestroyRef).onDestroy(() => {
      this.affordance?.destroy();
      this.affordance = null;
    });
  }

  /** Brings one row into view by the shortest movement that does it. */
  scrollToRow(value: string) {
    const row = this.host.nativeElement.querySelector(
      `[data-part="row"][data-value="${CSS.escape(value)}"]`,
    );
    if (row !== null) this.affordance?.reveal(row);
  }

  /** Measures again, after rows arrive or a column changes width. */
  refresh() {
    this.affordance?.refresh();
  }
}
