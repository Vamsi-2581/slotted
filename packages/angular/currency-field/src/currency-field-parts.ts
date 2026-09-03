import { Directive } from '@angular/core';

/**
 * An adornment before the amount in the reading direction: a currency mark, a
 * period, an icon. Named for the direction rather than for a side, so the same
 * markup puts the mark before the amount in both directions.
 *
 * It is a sibling of the number rather than part of it. A symbol that belongs
 * *inside* the amount is what `currency` and `currencyDisplay` write, and it is
 * selected, copied and parsed with the amount; this one is none of those
 * things.
 */
@Directive({
  selector: '[slCurrencyFieldStart]',
  standalone: true,
  exportAs: 'slCurrencyFieldStart',
  host: { 'data-part': 'start' },
})
export class SlCurrencyFieldStart {}

/** An adornment after the amount in the reading direction. */
@Directive({
  selector: '[slCurrencyFieldEnd]',
  standalone: true,
  exportAs: 'slCurrencyFieldEnd',
  host: { 'data-part': 'end' },
})
export class SlCurrencyFieldEnd {}
