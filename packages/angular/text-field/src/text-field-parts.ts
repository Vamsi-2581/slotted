import { Directive } from '@angular/core';

/**
 * An adornment before the value in the reading direction: a currency mark, a
 * unit, an icon, an `@`. Named for the direction rather than for a side, so the
 * same markup puts the mark before the amount in both directions —
 * `docs/component-features.md` §2.4 states the preference and `tag` already
 * ships parts by these names.
 *
 * It is a directive on the consumer's own element, so an `icon`, a `kbd` or a
 * `span` all work and none of them loses its own semantics. The stylesheet
 * sizes any icon inside it from the control's own glyph scale.
 */
@Directive({
  selector: '[slTextFieldStart]',
  standalone: true,
  exportAs: 'slTextFieldStart',
  host: { 'data-part': 'start' },
})
export class SlTextFieldStart {}

/** An adornment after the value in the reading direction. */
@Directive({
  selector: '[slTextFieldEnd]',
  standalone: true,
  exportAs: 'slTextFieldEnd',
  host: { 'data-part': 'end' },
})
export class SlTextFieldEnd {}
