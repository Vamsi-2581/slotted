import { describe, expect, it } from 'vitest';
import { addDays, DomainError, makeId, money, newMetadata, parseId, toBusinessDate, touch } from './index';

describe('ids', () => {
  it('formats prefix and six-digit sequence', () => {
    expect(makeId('usr', 21)).toBe('usr_000021');
    expect(parseId('inv_028910')).toEqual({ prefix: 'inv', sequence: 28910 });
  });
  it('rejects a malformed id', () => {
    expect(() => parseId('usr-1')).toThrow(DomainError);
  });
});

describe('time', () => {
  it('writes the business date in the organization timezone', () => {
    expect(toBusinessDate('2026-09-04T15:00:00Z', 'America/Chicago')).toBe('2026-09-04');
    expect(toBusinessDate('2026-09-05T03:30:00Z', 'America/Chicago')).toBe('2026-09-04');
  });
  it('adds days as instants', () => {
    expect(addDays('2026-09-04T15:00:00Z', 7)).toBe('2026-09-11T15:00:00.000Z');
  });
});

describe('metadata', () => {
  it('starts at version 1 and increments on touch', () => {
    const m = newMetadata('usr_000001', 'org_000001', 'system', '2026-09-04T15:00:00Z');
    expect(m.version).toBe(1);
    const t = touch(m, 'usr_000002', '2026-09-05T15:00:00Z');
    expect(t.version).toBe(2);
    expect(t.updatedBy).toBe('usr_000002');
    expect(m.version).toBe(1);
  });
});

describe('money', () => {
  it('rounds to cents', () => {
    expect(money(86420.004, 'USD')).toEqual({ amount: 86420, currency: 'USD' });
  });
});
