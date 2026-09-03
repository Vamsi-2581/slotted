import { Directive } from '@angular/core';

/**
 * An adornment before the value in the reading direction: a currency mark, a
 * unit, an icon. Named for the direction rather than for a side, so the same
 * markup puts the mark before the amount in both directions.
 *
 * It is a sibling of the number rather than part of it. A symbol that belongs
 * *inside* the value — the `R$` of a currency format, a percent sign — is
 * `format`'s job and arrives through `Intl` as part of the string the control
 * holds; this one is never selected, never copied and never parsed.
 */
@Directive({
  selector: '[slNumberFieldStart]',
  standalone: true,
  exportAs: 'slNumberFieldStart',
  host: { 'data-part': 'start' },
})
export class SlNumberFieldStart {}

/** An adornment after the value in the reading direction. */
@Directive({
  selector: '[slNumberFieldEnd]',
  standalone: true,
  exportAs: 'slNumberFieldEnd',
  host: { 'data-part': 'end' },
})
export class SlNumberFieldEnd {}
