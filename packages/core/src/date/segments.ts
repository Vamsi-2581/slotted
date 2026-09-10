/**
 * The entry model of a segmented date field: what a typed digit, a stepped
 * arrow and an emptied segment do to a date the reader is halfway through.
 *
 * It is separate from the value because a half-typed date is not a date. Every
 * surveyed segmented field holds either a whole date or nothing, so a day and
 * a month with no year is a state none of them can name; here the segments are
 * the state and the value is derived, `null` until all three are filled. That
 * is what lets a consumer save a draft, and what makes "empty" and "being
 * typed" two different things in the DOM.
 *
 * Nothing here touches the DOM or a framework.
 */

import { fieldRange } from './format';
import type { DateFieldName, DateFormat } from './format';
import { daysInMonth, plainDate } from './plain-date';
import type { PlainDate } from './plain-date';

export interface SegmentState {
  readonly year: number | null;
  readonly month: number | null;
  readonly day: number | null;
  /**
   * The field being typed into and how many digits have gone in. A run ends
   * when the reader moves, steps, or fills the field.
   */
  readonly typing: { readonly field: DateFieldName; readonly digits: number } | null;
  /**
   * The day the reader last asked for, kept across a month that could not hold
   * it, so stepping January's 31st forward and back returns 31 rather than 28.
   */
  readonly intendedDay: number | null;
}

export const EMPTY_SEGMENTS: SegmentState = {
  year: null,
  month: null,
  day: null,
  typing: null,
  intendedDay: null,
};

export function segmentsOf(date: PlainDate | null): SegmentState {
  if (date === null) return EMPTY_SEGMENTS;
  return { year: date.year, month: date.month, day: date.day, typing: null, intendedDay: date.day };
}

/** The date the segments make, or `null` while any of them is unfilled. */
export function dateOf(segments: SegmentState): PlainDate | null {
  const { year, month, day } = segments;
  if (year === null || month === null || day === null) return null;
  if (year < 1 || month < 1 || day < 1) return null;
  if (day > daysInMonth(year, month)) return null;
  try {
    return plainDate(year, month, day);
  } catch {
    return null;
  }
}

export function isComplete(segments: SegmentState): boolean {
  return dateOf(segments) !== null;
}

/** How wide the day segment's range is, given what is known of the date. */
function rangeFor(field: DateFieldName, segments: SegmentState, reference: PlainDate) {
  return fieldRange(field, {
    year: segments.year ?? reference.year,
    month: segments.month ?? reference.month,
  });
}

/**
 * Steps one segment, wrapping inside it and never carrying into the next — the
 * rule the APG's spin-button example states: December steps up to January and
 * the month does not move to the following year.
 *
 * An empty segment takes the reference date's own value rather than a minimum,
 * because a reader pressing Down on an empty year wants a year near this one,
 * not the year 1.
 */
export function stepSegment(
  segments: SegmentState,
  field: DateFieldName,
  by: number,
  reference: PlainDate,
): SegmentState {
  const { min, max } = rangeFor(field, segments, reference);
  const current = segments[field];

  let next: number;
  if (current === null) {
    next = reference[field];
  } else if (field === 'year') {
    /* A year does not wrap: there is no year after 9999 that a reader means. */
    next = Math.min(max, Math.max(min, current + by));
  } else {
    const span = max - min + 1;
    next = ((((current - min + by) % span) + span) % span) + min;
  }

  const stepped = { ...segments, [field]: next, typing: null } as SegmentState;
  return withDayHeld(stepped, field, reference);
}

/** Moves a segment to the lowest or highest value it can hold. */
export function boundSegment(
  segments: SegmentState,
  field: DateFieldName,
  edge: 'min' | 'max',
  reference: PlainDate,
): SegmentState {
  const range = rangeFor(field, segments, reference);
  const bounded = { ...segments, [field]: range[edge], typing: null } as SegmentState;
  return withDayHeld(bounded, field, reference);
}

/**
 * Keeps the day the reader asked for when the month or the year moved under it.
 * February pulls a 31 back to 28; March gives it back. Discarded whenever the
 * reader states a day themselves, because that is a new intention.
 */
function withDayHeld(
  segments: SegmentState,
  changed: DateFieldName,
  reference: PlainDate,
): SegmentState {
  if (changed === 'day') return { ...segments, intendedDay: segments.day };
  const wanted = segments.intendedDay ?? segments.day;
  if (wanted === null || segments.day === null) return segments;
  const length = daysInMonth(segments.year ?? reference.year, segments.month ?? reference.month);
  return { ...segments, day: Math.min(wanted, length), intendedDay: wanted };
}

export interface TypedDigit {
  readonly segments: SegmentState;
  /** The segment can hold no further digit, so focus moves to the next one. */
  readonly advance: boolean;
}

/**
 * Takes one typed digit.
 *
 * Typing `3` into a month waits, because `30` is not a month but `03` needs no
 * wait; typing `4` after it would be `34`, so the `4` starts a new run and the
 * segment advances. The rule is arithmetic rather than a table: a run ends when
 * the field is full, or when one more digit could not fit under the maximum.
 */
export function typeDigit(
  segments: SegmentState,
  field: DateFieldName,
  digit: number,
  format: DateFormat,
  reference: PlainDate,
): TypedDigit {
  const { max } = rangeFor(field, segments, reference);
  const width = format.widthOf(field);
  const run = segments.typing?.field === field ? segments.typing.digits : 0;
  const held = run === 0 ? 0 : (segments[field] ?? 0);

  let next = held * 10 + digit;
  let digits = run + 1;
  if (next > max) {
    next = digit;
    digits = 1;
  }

  const advance = digits >= width || next * 10 > max;
  const typed = {
    ...segments,
    [field]: next,
    typing: advance ? null : { field, digits },
  } as SegmentState;

  return { segments: withDayHeld(typed, field, reference), advance };
}

/**
 * Ends a typing run. A year left with fewer than four digits is resolved
 * through the format's own pivot, so `26` becomes 2026 by a rule the contract
 * states rather than by a guess made twice in two bindings.
 */
export function commitTyping(segments: SegmentState, format: DateFormat): SegmentState {
  const typing = segments.typing;
  if (typing === null) return segments;
  if (typing.field !== 'year' || segments.year === null || typing.digits > 2) {
    return { ...segments, typing: null };
  }
  return { ...segments, year: format.resolveYear(segments.year), typing: null };
}

/** Empties one segment back to its placeholder. */
export function clearSegment(segments: SegmentState, field: DateFieldName): SegmentState {
  const cleared = { ...segments, [field]: null, typing: null } as SegmentState;
  return field === 'day' ? { ...cleared, intendedDay: null } : cleared;
}
