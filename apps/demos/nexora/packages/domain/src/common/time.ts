export type Instant = string;
export type BusinessDate = string;

const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isInstant = (value: string): value is Instant => INSTANT.test(value);
export const isBusinessDate = (value: string): value is BusinessDate => DATE.test(value);

export function toBusinessDate(instant: Instant, timezone: string): BusinessDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function addHours(instant: Instant, hours: number): Instant {
  return new Date(new Date(instant).getTime() + hours * 3_600_000).toISOString();
}

export function addDays(instant: Instant, days: number): Instant {
  return addHours(instant, days * 24);
}
