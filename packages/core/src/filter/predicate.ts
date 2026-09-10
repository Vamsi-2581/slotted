/**
 * Applying a descriptor to a value.
 *
 * The predicate is pure and the family that draws the panel never calls it: a
 * `table` reports the descriptor and the consumer's own query keeps or drops the
 * rows, which is the division `sort` already records. It is exported here so
 * that a client-side listing, a `data-grid` and a server route all evaluate one
 * definition of what `contains` means.
 *
 * Nothing here touches the DOM or a framework.
 */

import { createFilter } from '../collection';
import { activeConditions, type FilterCondition, type FilterDescriptor } from './descriptor';
import type { FilterKind, FilterOperator } from './operators';

export interface FilterMatchOptions {
  /** BCP 47, for the collator text comparisons are made with. */
  locale?: string | undefined;
  /**
   * `base` treats `a`, `á` and `A` as one letter, which is how a reader who
   * types `agua` expects to find `Água`. It is the default for the same reason
   * `combobox` takes it.
   */
  sensitivity?: 'base' | 'accent' | 'case' | 'variant';
  /**
   * The zone a timestamp's day is read in. A row value carrying a time falls on
   * one day here and another there, and a filter that did not say which was
   * choosing silently.
   */
  timeZone?: string | undefined;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;

interface PlainDateLike {
  year: number;
  month: number;
  day: number;
}

function isPlainDateLike(value: unknown): value is PlainDateLike {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['year'] === 'number' &&
    typeof candidate['month'] === 'number' &&
    typeof candidate['day'] === 'number'
  );
}

function pad(value: number, width: number) {
  return String(value).padStart(width, '0');
}

/**
 * The day a value falls on, or null when it is not a date at all.
 *
 * A `Date` is an instant rather than a day, so it is read through a formatter
 * that knows a zone. `en-CA` is not relied on for the order: the parts are read
 * by name and reassembled.
 */
function createDayReader(timeZone: string | undefined) {
  let parts: Intl.DateTimeFormat | undefined;

  const fromDate = (value: Date) => {
    if (Number.isNaN(value.getTime())) return null;
    parts ??= new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const read = parts.formatToParts(value);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      read.find((candidate) => candidate.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  };

  return (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'string') {
      if (ISO_DAY.test(value)) return value.slice(0, 10);
      return fromDate(new Date(value));
    }
    if (value instanceof Date) return fromDate(value);
    if (typeof value === 'number') return fromDate(new Date(value));
    if (isPlainDateLike(value)) {
      return `${pad(value.year, 4)}-${pad(value.month, 2)}-${pad(value.day, 2)}`;
    }
    return null;
  };
}

function readText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function readSet(value: unknown): readonly string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map((item) => String(item));
  return [String(value)];
}

/** The ends of a range, in the order they compare, whichever way they were typed. */
function ordered<Value extends string | number>(from: Value, to: Value): readonly [Value, Value] {
  return from <= to ? [from, to] : [to, from];
}

function textMatcher(options: FilterMatchOptions) {
  const compare = createFilter({
    locale: options.locale,
    sensitivity: options.sensitivity ?? 'base',
  });

  /**
   * The collator has no `endsWith`, so the tail is compared instead. Its width is
   * tried one shorter and one longer for the reason `createFilter` scans that
   * way: two strings of different lengths can still be one word to a collator,
   * `ß` against `ss` among them.
   */
  const endsWith = (label: string, query: string) => {
    if (query === '') return true;
    for (const width of [query.length, query.length - 1, query.length + 1]) {
      if (width <= 0 || width > label.length) continue;
      if (compare.equals(label.slice(label.length - width), query)) return true;
    }
    return false;
  };

  return (operator: FilterOperator, label: string, query: string) => {
    switch (operator) {
      case 'contains':
        return compare.contains(label, query);
      case 'notContains':
        return !compare.contains(label, query);
      case 'equals':
        return compare.equals(label, query);
      case 'notEquals':
        return !compare.equals(label, query);
      case 'startsWith':
        return compare.startsWith(label, query);
      case 'endsWith':
        return endsWith(label, query);
      default:
        return false;
    }
  };
}

function conditionPredicate(
  kind: FilterKind,
  condition: FilterCondition<string, unknown>,
  options: FilterMatchOptions,
  text: ReturnType<typeof textMatcher>,
  day: ReturnType<typeof createDayReader>,
): (value: unknown) => boolean {
  const operator = condition.operator as FilterOperator;

  if (kind === 'set') {
    const chosen = new Set((condition.value as readonly string[] | null | undefined) ?? []);
    return (value) => {
      const found = readSet(value).some((candidate) => chosen.has(candidate));
      return operator === 'noneOf' ? !found : found;
    };
  }

  const read =
    kind === 'text'
      ? readText
      : kind === 'number'
        ? readNumber
        : kind === 'boolean'
          ? readBoolean
          : day;

  if (operator === 'empty') return (value) => read(value) === null;
  if (operator === 'notEmpty') return (value) => read(value) !== null;

  switch (kind) {
    case 'text': {
      const query = String(condition.value);
      return (value) => {
        const label = readText(value);
        return label === null ? false : text(operator, label, query);
      };
    }
    case 'number': {
      const first = condition.value as number;
      if (operator === 'between') {
        const [from, to] = ordered(first, condition.end as number);
        return (value) => {
          const held = readNumber(value);
          return held !== null && held >= from && held <= to;
        };
      }
      return (value) => {
        const held = readNumber(value);
        if (held === null) return false;
        switch (operator) {
          case 'equals':
            return held === first;
          case 'notEquals':
            return held !== first;
          case 'greaterThan':
            return held > first;
          case 'greaterThanOrEqual':
            return held >= first;
          case 'lessThan':
            return held < first;
          default:
            return held <= first;
        }
      };
    }
    case 'boolean': {
      const wanted = condition.value as boolean;
      return (value) => readBoolean(value) === wanted;
    }
    default: {
      const first = day(condition.value);
      if (first === null) return () => false;
      if (operator === 'between') {
        const other = day(condition.end);
        if (other === null) return () => false;
        const [from, to] = ordered(first, other);
        return (value) => {
          const held = day(value);
          return held !== null && held >= from && held <= to;
        };
      }
      return (value) => {
        const held = day(value);
        if (held === null) return false;
        switch (operator) {
          case 'is':
            return held === first;
          case 'isNot':
            return held !== first;
          case 'before':
            return held < first;
          default:
            return held > first;
        }
      };
    }
  }
}

/**
 * The predicate a filter is, built once.
 *
 * A collator and a date formatter each cost more to construct than to use, and a
 * listing evaluates one filter against every row it holds — so they are built
 * here and closed over, rather than inside the comparison.
 */
export function createFilterPredicate(
  filter: FilterDescriptor | null | undefined,
  options: FilterMatchOptions = {},
): (value: unknown) => boolean {
  const conditions = activeConditions(filter);
  if (!filter || conditions.length === 0) return () => true;

  const text = textMatcher(options);
  const day = createDayReader(options.timeZone);
  const predicates = conditions.map((condition) =>
    conditionPredicate(filter.kind, condition, options, text, day),
  );

  if (predicates.length === 1) return predicates[0]!;
  return filter.join === 'or'
    ? (value) => predicates.some((predicate) => predicate(value))
    : (value) => predicates.every((predicate) => predicate(value));
}

/** One comparison. For many, build the predicate once instead. */
export function matchesFilter(
  filter: FilterDescriptor | null | undefined,
  value: unknown,
  options: FilterMatchOptions = {},
): boolean {
  return createFilterPredicate(filter, options)(value);
}

/**
 * One predicate over a record of filters, joined by `and` — which is what makes
 * a listing that filters four columns of four kinds a single call, with no
 * switch of the consumer's own.
 */
export function createRowPredicate<Row>(
  filters: Readonly<Record<string, FilterDescriptor | null | undefined>>,
  read: (row: Row, column: string) => unknown,
  options: FilterMatchOptions = {},
): (row: Row) => boolean {
  const active = Object.entries(filters)
    .map(([column, filter]) => [column, createFilterPredicate(filter, options)] as const)
    .filter(([column]) => filters[column] !== null && filters[column] !== undefined);

  return (row) => active.every(([column, predicate]) => predicate(read(row, column)));
}
