import { describe, expect, it } from 'vitest';

import { describeFilter } from './describe';
import { emptyFilter, setFilter } from './descriptor';

const en = {
  operator: (operator: string) =>
    ({
      contains: 'contains',
      startsWith: 'starts with',
      greaterThan: 'greater than',
      between: 'between',
      empty: 'is empty',
      is: 'is',
      anyOf: 'is any of',
    })[operator] ?? operator,
  join: (join: 'and' | 'or') => (join === 'and' ? 'and' : 'or'),
};

describe('describeFilter', () => {
  it('reads one condition as a sentence', () => {
    expect(
      describeFilter(
        { kind: 'text', join: 'and', conditions: [{ operator: 'contains', value: 'ana' }] },
        en,
      ),
    ).toBe('contains ana');
  });

  it('leaves out an operand the operator does not take', () => {
    expect(
      describeFilter({ kind: 'text', join: 'and', conditions: [{ operator: 'empty' }] }, en),
    ).toBe('is empty');
  });

  it('joins two conditions with the word the format gives it', () => {
    expect(
      describeFilter(
        {
          kind: 'text',
          join: 'or',
          conditions: [
            { operator: 'contains', value: 'ana' },
            { operator: 'startsWith', value: 'b' },
          ],
        },
        en,
      ),
    ).toBe('contains ana or starts with b');
  });

  it('puts the same word between the two ends of a range', () => {
    expect(
      describeFilter(
        { kind: 'number', join: 'and', conditions: [{ operator: 'between', value: 10, end: 20 }] },
        en,
      ),
    ).toBe('between 10 and 20');
  });

  it('lists a chosen set', () => {
    expect(describeFilter(setFilter(['paid', 'refunded']), en)).toBe('is any of paid, refunded');
  });

  it('says nothing for a filter that holds nothing', () => {
    expect(describeFilter(emptyFilter('text'), en)).toBe('');
    expect(describeFilter(null, en)).toBe('');
  });

  it('formats an operand through the format when it is given one', () => {
    expect(
      describeFilter(
        { kind: 'date', join: 'and', conditions: [{ operator: 'is', value: '2026-09-10' }] },
        { ...en, value: (value) => `10 September 2026 (${String(value)})` },
      ),
    ).toBe('is 10 September 2026 (2026-09-10)');
  });
});
