import { ORGANIZATION_TIMEZONE } from './common';

/**
 * Time helpers (section 53.6). Instants are UTC ISO-8601 strings; business
 * dates are `YYYY-MM-DD` in the organization timezone unless stated otherwise.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
export const DAY_MS = 24 * HOUR;

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let cached = formatterCache.get(timeZone);
  if (!cached) {
    cached = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    formatterCache.set(timeZone, cached);
  }
  return cached;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function zonedParts(instant: string | number, timeZone = ORGANIZATION_TIMEZONE): ZonedParts {
  const parts = formatter(timeZone).formatToParts(new Date(instant));
  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '0';
  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    hour: Number(read('hour')) % 24,
    minute: Number(read('minute')),
    second: Number(read('second')),
    weekday: WEEKDAYS.indexOf(read('weekday')),
  };
}

/** Offset of `timeZone` from UTC in milliseconds at the given instant. */
export function zoneOffsetMs(instantMs: number, timeZone = ORGANIZATION_TIMEZONE): number {
  const parts = zonedParts(instantMs, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - Math.floor(instantMs / 1000) * 1000;
}

/** Converts wall-clock components in `timeZone` to a UTC instant (ms). */
export function zonedToInstantMs(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  timeZone = ORGANIZATION_TIMEZONE,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const candidate = guess - zoneOffsetMs(guess, timeZone);
  const offset = zoneOffsetMs(candidate, timeZone);
  return guess - offset;
}

export function toIsoInstant(ms: number): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function instantMs(instant: string): number {
  return Date.parse(instant);
}

export function addMs(instant: string, ms: number): string {
  return toIsoInstant(instantMs(instant) + ms);
}

export function addHours(instant: string, hours: number): string {
  return addMs(instant, hours * HOUR);
}

export function addMinutes(instant: string, minutes: number): string {
  return addMs(instant, minutes * MINUTE);
}

/** Business date (`YYYY-MM-DD`) of an instant in the given timezone. */
export function businessDateOf(instant: string, timeZone = ORGANIZATION_TIMEZONE): string {
  const parts = zonedParts(instant, timeZone);
  return formatBusinessDate(parts.year, parts.month, parts.day);
}

export function formatBusinessDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseBusinessDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  return { year, month, day };
}

/** Calendar-day arithmetic on business dates (no timezone involved). */
export function addDays(date: string, days: number): string {
  const { year, month, day } = parseBusinessDate(date);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return formatBusinessDate(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

export function diffDays(later: string, earlier: string): number {
  const a = parseBusinessDate(later);
  const b = parseBusinessDate(earlier);
  return Math.round((Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day)) / DAY_MS);
}

export function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function weekdayOf(date: string): number {
  const { year, month, day } = parseBusinessDate(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function isBusinessDay(date: string): boolean {
  const weekday = weekdayOf(date);
  return weekday !== 0 && weekday !== 6;
}

export function addBusinessDays(date: string, days: number): string {
  let current = date;
  let remaining = days;
  const step = days < 0 ? -1 : 1;
  while (remaining !== 0) {
    current = addDays(current, step);
    if (isBusinessDay(current)) remaining -= step;
  }
  return current;
}

export function lastBusinessDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let date = formatBusinessDate(year, month, lastDay);
  while (!isBusinessDay(date)) date = addDays(date, -1);
  return date;
}

/** Instant for a business date at a wall-clock time in the organization timezone. */
export function businessDateToInstant(
  date: string,
  hour = 9,
  minute = 0,
  timeZone = ORGANIZATION_TIMEZONE,
): string {
  const { year, month, day } = parseBusinessDate(date);
  return toIsoInstant(zonedToInstantMs(year, month, day, hour, minute, 0, timeZone));
}

export const BUSINESS_DAY_START_HOUR = 8;
export const BUSINESS_DAY_END_HOUR = 18;

/**
 * Business minutes between two instants, counting Monday–Friday 08:00–18:00
 * in the organization timezone (section 68.3).
 */
export function businessMinutesBetween(start: string, end: string): number {
  let cursor = instantMs(start);
  const finish = instantMs(end);
  if (finish <= cursor) return 0;
  let minutes = 0;
  while (cursor < finish) {
    const parts = zonedParts(cursor);
    const dayStart = zonedToInstantMs(parts.year, parts.month, parts.day, BUSINESS_DAY_START_HOUR);
    const dayEnd = zonedToInstantMs(parts.year, parts.month, parts.day, BUSINESS_DAY_END_HOUR);
    const nextDay = zonedToInstantMs(parts.year, parts.month, parts.day + 1, 0);
    if (parts.weekday === 0 || parts.weekday === 6 || cursor >= dayEnd) {
      cursor = nextDay;
      continue;
    }
    const from = Math.max(cursor, dayStart);
    const to = Math.min(finish, dayEnd);
    if (to > from) minutes += (to - from) / MINUTE;
    cursor = nextDay;
  }
  return Math.round(minutes);
}

/** Adds business minutes to an instant, skipping nights and weekends. */
export function addBusinessMinutes(start: string, businessMinutes: number): string {
  let cursor = instantMs(start);
  let remaining = businessMinutes;
  for (let guard = 0; guard < 10_000; guard += 1) {
    const parts = zonedParts(cursor);
    const dayStart = zonedToInstantMs(parts.year, parts.month, parts.day, BUSINESS_DAY_START_HOUR);
    const dayEnd = zonedToInstantMs(parts.year, parts.month, parts.day, BUSINESS_DAY_END_HOUR);
    const nextDayStart = zonedToInstantMs(parts.year, parts.month, parts.day + 1, BUSINESS_DAY_START_HOUR);
    if (parts.weekday === 0 || parts.weekday === 6 || cursor >= dayEnd) {
      cursor = nextDayStart;
      continue;
    }
    if (cursor < dayStart) cursor = dayStart;
    const availableMinutes = (dayEnd - cursor) / MINUTE;
    if (remaining <= availableMinutes) return toIsoInstant(cursor + remaining * MINUTE);
    remaining -= availableMinutes;
    cursor = nextDayStart;
  }
  throw new RangeError('addBusinessMinutes exceeded its iteration guard');
}

export function addBusinessHours(start: string, hours: number): string {
  return addBusinessMinutes(start, hours * 60);
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
