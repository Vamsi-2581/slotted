import { describe, expect, it } from 'vitest';

import { defaultTail, graphemes, truncateMiddle } from './index';

const within = (max: number) => (candidate: string) => graphemes(candidate).length <= max;

describe('truncateMiddle', () => {
  it('returns the text untouched when it fits', () => {
    expect(truncateMiddle('Painel', within(10))).toBe('Painel');
  });

  /** Two names that differ only at the end stay two names. */
  it('keeps the tail, so names that differ at the end stay apart', () => {
    const setembro = truncateMiddle('Relatório mensal · setembro', within(18));
    const outubro = truncateMiddle('Relatório mensal · outubro', within(18));
    expect(setembro).toBe('Relatório…setembro');
    expect(outubro).toBe('Relatório…outubro');
    expect(setembro).not.toBe(outubro);
  });

  it('keeps the last word when it is short and six clusters otherwise', () => {
    expect(defaultTail('Relatório mensal · setembro')).toBe(8);
    expect(defaultTail('https://aurora.example/relatorios/2026')).toBe(6);
    expect(defaultTail('Cargas ')).toBe(6);
  });

  it('finds the longest head that fits', () => {
    const result = truncateMiddle('abcdefghijklmnopqrstuvwxyz', within(12), { keepTail: 3 });
    expect(result).toBe('abcdefgh…xyz');
    expect(graphemes(result).length).toBe(12);
  });

  it('never splits a grapheme cluster', () => {
    const result = truncateMiddle('👩‍👩‍👧 família 👨‍👩‍👦 reunida', within(9), { keepTail: 3 });
    expect(graphemes(result).every((cluster) => cluster.length > 0)).toBe(true);
    expect(result.endsWith('ida')).toBe(true);
    expect(result.startsWith('👩‍👩‍👧')).toBe(true);
  });

  /** The tail is what tells a name from its neighbour, so it is given up last. */
  it('gives the tail up one cluster at a time when it is what does not fit', () => {
    expect(truncateMiddle('abcdefghij', within(4), { keepTail: 6 })).toBe('…hij');
  });

  it('answers with the ellipsis alone when nothing fits', () => {
    expect(truncateMiddle('abc', () => false)).toBe('…');
  });

  it('trims the space a cut would leave before the ellipsis', () => {
    expect(truncateMiddle('Por região norte', within(11), { keepTail: 5 })).toBe('Por r…norte');
    expect(truncateMiddle('Por regi norte', within(10), { keepTail: 5 })).toBe('Por…norte');
  });
});
