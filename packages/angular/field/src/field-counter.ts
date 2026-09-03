import { booleanAttribute, Directive, input } from '@angular/core';

/**
 * What a control tells the field about its own value, so the field can draw the
 * count in the spare column of its label row. The control counts and the field
 * places it: the number belongs to the value, and the row belongs to the field.
 *
 * `length` is in UTF-16 code units, which is what `maxLength` counts, so an
 * emoji counts as two. A counter that disagreed with the limit the browser
 * enforces would be wrong at exactly the moment it is read.
 */
export interface FieldCount {
  length: number;
  max: number | undefined;
}

/**
 * How a count reads: `12/280` when there is a limit and `12` when there is
 * none. Carbon and Polaris both write the pair; Angular Material writes it in
 * the subscript, where a count that appears on the first keystroke shares a row
 * with the error and pushes it.
 */
export function formatFieldCount(count: FieldCount): string {
  return count.max === undefined ? String(count.length) : `${count.length}/${count.max}`;
}

/** Whether a count has passed the limit it was given. */
export function isFieldCountOver(count: FieldCount): boolean {
  return count.max !== undefined && count.length > count.max;
}

/**
 * A count the page writes itself, at the end of the label row — which is where
 * Carbon puts it. Angular Material puts it in the subscript beside the error,
 * where a count that appears on the first keystroke shares a row with the
 * message and pushes it.
 *
 * A field whose control publishes a count gets a counter drawn by the field, so
 * this directive is for the page that counts something the control cannot:
 * words, bytes, line items. Writing one withdraws the field's own, because two
 * counters in one row is one row too many.
 *
 * It lives in a module of its own so `field.ts` can look for it without
 * importing the parts that inject `SlField`, which would be a cycle.
 */
@Directive({
  selector: '[slFieldCounter]',
  standalone: true,
  exportAs: 'slFieldCounter',
  host: {
    'data-part': 'counter',
    '[attr.data-invalid]': "invalid() ? '' : null",
  },
})
export class SlFieldCounter {
  /**
   * The count has passed its limit. It is the counter's own state rather than
   * the field's: a count can pass its maximum while validation has not run, and
   * a counter that only turned at submit would say nothing at the moment it is
   * being read.
   */
  readonly invalid = input(false, { transform: booleanAttribute });
}
