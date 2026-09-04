import { describe, expect, it } from 'vitest';

import { createFilter, matchRanges, splitByMatch } from './index';

describe('createFilter', () => {
  const filter = createFilter();

  it('matches a substring anywhere in the label', () => {
    expect(filter.contains('Blueberry', 'berry')).toBe(true);
    expect(filter.contains('Blueberry', 'cherry')).toBe(false);
  });

  it('anchors startsWith to the opening of the label', () => {
    expect(filter.startsWith('Blueberry', 'Blue')).toBe(true);
    expect(filter.startsWith('Blueberry', 'berry')).toBe(false);
  });

  /** §2.9: comparison is locale-sensitive, not an English fold. */
  it('reads an accent and a capital as the same letter at base sensitivity', () => {
    expect(filter.contains('Resumé', 'resume')).toBe(true);
    expect(filter.contains('ÅNGSTRÖM', 'angstrom')).toBe(true);
  });

  it('keeps them apart when asked to', () => {
    expect(createFilter({ sensitivity: 'variant' }).contains('Resumé', 'resume')).toBe(false);
  });

  it('treats an empty query as matching everything', () => {
    expect(filter.contains('Blueberry', '')).toBe(true);
    expect(filter.startsWith('Blueberry', '')).toBe(true);
  });

  it('compares two whole words for equality', () => {
    expect(filter.equals('Resumé', 'resume')).toBe(true);
    expect(filter.equals('Resumés', 'resume')).toBe(false);
  });
});

describe('matchRanges', () => {
  it('reports the span the filter matched, in the label’s own code units', () => {
    expect(matchRanges('Blueberry', 'berry')).toEqual([[4, 9]]);
  });

  it('reports the span an accented label matched', () => {
    expect(matchRanges('Resumé', 'resume')).toEqual([[0, 6]]);
  });

  it('reports nothing for an empty or blank query', () => {
    expect(matchRanges('Blueberry', '')).toEqual([]);
    expect(matchRanges('Blueberry', '   ')).toEqual([]);
  });

  it('reports nothing when the label does not match', () => {
    expect(matchRanges('Blueberry', 'cherry')).toEqual([]);
  });
});

describe('splitByMatch', () => {
  it('splits a label into the runs a caller marks', () => {
    expect(splitByMatch('Blueberry', 'berry')).toEqual([
      { text: 'Blue', matched: false },
      { text: 'berry', matched: true },
    ]);
  });

  it('opens with a matched run when the query is a prefix', () => {
    expect(splitByMatch('Blueberry', 'blue')).toEqual([
      { text: 'Blue', matched: true },
      { text: 'berry', matched: false },
    ]);
  });

  it('returns one unmatched run when nothing matched', () => {
    expect(splitByMatch('Blueberry', 'cherry')).toEqual([{ text: 'Blueberry', matched: false }]);
  });

  it('never emits an empty run', () => {
    for (const run of splitByMatch('Blueberry', 'Blueberry')) expect(run.text).not.toBe('');
  });
});
