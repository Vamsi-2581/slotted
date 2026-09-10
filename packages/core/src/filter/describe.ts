/**
 * A filter as a sentence.
 *
 * `docs/component-features.md` §12 asks a filter builder for a readable text
 * expression that summarises what is applied. It is written here rather than in
 * a family so that `filter-bar`'s chips, `table`'s announcement and the
 * accessible name of a filtered column's trigger all say the same sentence.
 *
 * The words are the caller's: this module knows the shape, never the language.
 * Excel's own tooltip on a filtered header reads "Larger than 150", which is the
 * form this produces.
 */

import { activeConditions, type FilterDescriptor, type FilterJoin } from './descriptor';
import { operandCount, type FilterKind, type FilterOperator } from './operators';

export interface FilterDescriptionFormat {
  /** The operator's name in the reader's language. */
  operator: (operator: FilterOperator, kind: FilterKind) => string;
  /** The word between two conditions, and between the two ends of a range. */
  join: (join: FilterJoin) => string;
  /** How an operand is written. Defaults to the value itself. */
  value?: (value: unknown, kind: FilterKind) => string;
}

export function describeFilter(
  filter: FilterDescriptor | null | undefined,
  format: FilterDescriptionFormat,
): string {
  const conditions = activeConditions(filter);
  if (!filter || conditions.length === 0) return '';

  const write = (value: unknown) =>
    format.value ? format.value(value, filter.kind) : String(value);

  const sentences = conditions.map((condition) => {
    const operator = condition.operator as FilterOperator;
    const name = format.operator(operator, filter.kind);
    const operands = operandCount(operator);

    if (operands === 0) return name;
    if (filter.kind === 'set') {
      const values = (condition.value as readonly string[]) ?? [];
      return `${name} ${values.map((value) => write(value)).join(', ')}`;
    }
    if (operands === 1) return `${name} ${write(condition.value)}`;
    return `${name} ${write(condition.value)} ${format.join('and')} ${write(condition.end)}`;
  });

  return sentences.join(` ${format.join(filter.join)} `);
}
