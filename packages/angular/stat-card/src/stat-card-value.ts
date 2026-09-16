import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { inject } from '@angular/core';
import { SlSkeleton } from '@slotted/angular/skeleton';

import { SlStatCard } from './stat-card';

/**
 * The number. A numeric `value` is formatted with the card's locale and
 * `formatOptions` — `notation: 'compact'` is how 12,900 becomes 12.9K — and
 * projected content is the consumer's own rendering, unit and all, after
 * it. A missing or failed value is the dash the messages name; a loading
 * one is a placeholder five figures wide, on the value's own line.
 */
@Component({
  selector: '[slStatCardValue]',
  standalone: true,
  imports: [SlSkeleton],
  template: `@if (card.loading()) {
      <span slSkeleton inlineSize="5ch"></span>
    } @else if (card.status() !== 'ready') {
      {{ card.resolvedMessages().empty }}
    } @else {
      {{ formatted() }}<ng-content />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'slStatCardValue',
  host: { 'data-part': 'value' },
})
export class SlStatCardValue {
  /** A number, formatted with the card's locale and `formatOptions`; the text otherwise. */
  readonly value = input<number | string | undefined>(undefined);
  readonly formatOptions = input<Intl.NumberFormatOptions | undefined>(undefined);

  protected readonly card = inject(SlStatCard);

  readonly formatted = computed(() => {
    const value = this.value();
    if (typeof value !== 'number') return value ?? '';
    return new Intl.NumberFormat(
      this.card.resolvedLocale(),
      this.formatOptions() ?? this.card.resolvedFormatOptions(),
    ).format(value);
  });
}
