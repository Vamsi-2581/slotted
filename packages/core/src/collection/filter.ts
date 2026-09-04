/**
 * Whether a label answers a query, compared the way the reader's locale
 * compares, and which spans of it did the answering.
 *
 * `docs/component-features.md` §2.9 asks that search, ordering and typeahead use
 * a locale-sensitive comparison, and §6 refuses a family that assumes `contains`
 * and English normalisation. This module is the default a combobox filters with
 * and the adapter a consumer replaces; it is not the family's only answer.
 *
 * It is deliberately not `packages/core/src/typeahead`, which builds a collator
 * of its own for a different job: a typeahead matches a growing prefix against a
 * list, with a reset window and a cycle through repeated first characters. A
 * filter has neither, and merging the two would give each the other's state.
 *
 * Nothing here touches the DOM or a framework.
 */

export interface FilterOptions {
  /**
   * BCP 47. Undefined asks the runtime, which is what a component with no
   * locale provider does.
   */
  locale?: string | undefined;
  /**
   * `base` treats `a`, `á` and `A` as one letter, which is what a reader typing
   * `resume` into a list holding `Resumé` expects. `accent` keeps accents apart
   * and folds case; `variant` keeps both.
   */
  sensitivity?: 'base' | 'accent' | 'case' | 'variant';
}

export interface Filter {
  /** Whether the query appears anywhere in the label. */
  contains: (label: string, query: string) => boolean;
  /** Whether the label opens with the query. */
  startsWith: (label: string, query: string) => boolean;
  /** Whether the two are the same word to this locale. */
  equals: (label: string, query: string) => boolean;
}

/**
 * `Intl.Collator` compares two whole strings and cannot be asked whether one
 * appears inside the other, so a substring search is a scan of every window of
 * the query's length. Two strings can also differ in length and still be equal
 * to the collator — `ß` against `ss` at base sensitivity — so windows one
 * shorter and one longer are tried as well. The alternative, folding both
 * strings with `normalize('NFD')` and stripping combining marks, is an English
 * answer wearing a Unicode one: it turns `ø` into `ø` and leaves `ß` alone.
 */
function scan(collator: Intl.Collator, label: string, query: string, anchored: boolean) {
  const span = query.length;
  const last = anchored ? 0 : label.length - span;
  for (let start = 0; start <= Math.max(last, 0); start += 1) {
    for (const width of [span, span - 1, span + 1]) {
      if (width <= 0 || start + width > label.length) continue;
      if (collator.compare(label.slice(start, start + width), query) === 0) {
        return [start, start + width] as const;
      }
    }
  }
  return null;
}

export function createFilter({ locale, sensitivity = 'base' }: FilterOptions = {}): Filter {
  const collator = new Intl.Collator(locale, { sensitivity, usage: 'search' });

  return {
    contains: (label, query) => query === '' || scan(collator, label, query, false) !== null,
    startsWith: (label, query) => query === '' || scan(collator, label, query, true) !== null,
    equals: (label, query) => collator.compare(label, query) === 0,
  };
}

/**
 * The spans of `label` that `query` matched, in the label's own code units, so
 * a caller can mark them.
 *
 * The same collator finds them, which is the point: an `indexOf` beside a
 * locale-sensitive filter marks nothing on the row it just matched, and the
 * reader is left asking why an option with no visible match is in the list.
 *
 * One span per query, not one per word: a query is what the reader typed, and
 * splitting it into words would mark spans the filter never matched on.
 */
export function matchRanges(
  label: string,
  query: string,
  options: FilterOptions = {},
): readonly (readonly [number, number])[] {
  const trimmed = query.trim();
  if (trimmed === '' || label === '') return [];
  const collator = new Intl.Collator(options.locale, {
    sensitivity: options.sensitivity ?? 'base',
    usage: 'search',
  });
  const found = scan(collator, label, trimmed, false);
  return found === null ? [] : [found];
}

/**
 * The label split into the runs a caller renders: the ones the query matched
 * and the ones it did not, in order, with no empty run between them.
 *
 * A caller that walked the ranges itself would decide the boundaries again,
 * differently, in each of the two bindings — and the boundary is the whole of
 * what this returns.
 */
export function splitByMatch(
  label: string,
  query: string,
  options: FilterOptions = {},
): readonly { text: string; matched: boolean }[] {
  const ranges = matchRanges(label, query, options);
  if (ranges.length === 0) return [{ text: label, matched: false }];

  const runs: { text: string; matched: boolean }[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) runs.push({ text: label.slice(cursor, start), matched: false });
    runs.push({ text: label.slice(start, end), matched: true });
    cursor = end;
  }
  if (cursor < label.length) runs.push({ text: label.slice(cursor), matched: false });
  return runs;
}
