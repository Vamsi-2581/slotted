import { describe, expect, it } from 'vitest';

import type { ScaleProfile } from './contracts';
import { generateCalibrationBatches } from './generate';
import { SCALE_PROFILES } from './profiles';
import { createNamespacedRandom } from './random';
import type { CalibrationRecord, RecordTable } from './records';

function collect(profile: ScaleProfile, batchSize = 64) {
  const iterator = generateCalibrationBatches(profile, batchSize);
  const records: CalibrationRecord[] = [];
  const batchSizes: number[] = [];

  for (;;) {
    const next = iterator.next();
    if (next.done) return { records, batchSizes, summary: next.value };
    batchSizes.push(next.value.records.length);
    records.push(...next.value.records);
  }
}

function firstIds(profile: ScaleProfile, table: RecordTable, limit: number): string[] {
  return collect(profile)
    .records.filter((record) => record.table === table)
    .slice(0, limit)
    .map((record) => record.id);
}

function withSalesOrders(profile: ScaleProfile, salesOrders: number): ScaleProfile {
  return Object.freeze({
    ...profile,
    counts: Object.freeze({ ...profile.counts, salesOrders }),
  });
}

function countTables(records: readonly CalibrationRecord[]): Record<RecordTable, number> {
  const counts = Object.fromEntries(
    [
      'customers',
      'contacts',
      'suppliers',
      'skus',
      'salesOrders',
      'salesOrderLines',
      'stockMovements',
      'purchaseOrders',
      'invoices',
      'payments',
      'supportTickets',
    ].map((table) => [table, 0]),
  ) as Record<RecordTable, number>;

  for (const record of records) counts[record.table] += 1;
  return counts;
}

function relationshipProblems(records: readonly CalibrationRecord[]): string[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  const problems: string[] = [];
  const date = (value: string) => Date.parse(value);

  for (const record of records) {
    const requireParent = (id: string, table: RecordTable, childTime: string) => {
      const parent = byId.get(id);
      if (!parent || parent.table !== table) {
        problems.push(`${record.id} references missing ${table} ${id}`);
        return;
      }
      if (date(childTime) < date(parent.createdAt)) {
        problems.push(`${record.id} predates ${parent.id}`);
      }
    };

    switch (record.table) {
      case 'contacts':
        requireParent(record.customerId, 'customers', record.createdAt);
        break;
      case 'salesOrders':
        requireParent(record.customerId, 'customers', record.placedAt);
        break;
      case 'salesOrderLines':
        requireParent(record.orderId, 'salesOrders', record.createdAt);
        requireParent(record.skuId, 'skus', record.createdAt);
        break;
      case 'stockMovements':
        requireParent(record.skuId, 'skus', record.occurredAt);
        break;
      case 'purchaseOrders':
        requireParent(record.supplierId, 'suppliers', record.orderedAt);
        break;
      case 'invoices':
        requireParent(record.orderId, 'salesOrders', record.issuedAt);
        requireParent(record.customerId, 'customers', record.issuedAt);
        break;
      case 'payments':
        requireParent(record.invoiceId, 'invoices', record.receivedAt);
        requireParent(record.customerId, 'customers', record.receivedAt);
        break;
      case 'supportTickets':
        requireParent(record.customerId, 'customers', record.createdAt);
        break;
    }

    if (date(record.createdAt) > date(SCALE_PROFILES.smoke.demoTime)) {
      problems.push(`${record.id} is in the future`);
    }
  }

  return problems;
}

describe('calibration data generation', () => {
  it('isolates child streams without consuming the parent namespace', () => {
    const firstRoot = createNamespacedRandom(SCALE_PROFILES.smoke.seed, 'test');
    const secondRoot = createNamespacedRandom(SCALE_PROFILES.smoke.seed, 'test');

    firstRoot.fork('ignored').nextFloat();

    expect(firstRoot.nextFloat()).toBe(secondRoot.nextFloat());
    expect(firstRoot.fork('customers').nextFloat()).not.toBe(firstRoot.fork('orders').nextFloat());
  });

  it('repeats IDs and payloads for the same seed', () => {
    const first = collect(SCALE_PROFILES.smoke);
    const second = collect(SCALE_PROFILES.smoke);
    expect(second).toEqual(first);
  });

  it('does not shift customers when transaction counts change', () => {
    const base = firstIds(SCALE_PROFILES.smoke, 'customers', 20);
    const changed = firstIds(withSalesOrders(SCALE_PROFILES.smoke, 999), 'customers', 20);
    expect(changed).toEqual(base);
  });

  it('emits every exact smoke count', () => {
    const result = collect(SCALE_PROFILES.smoke);
    expect(countTables(result.records)).toEqual(SCALE_PROFILES.smoke.counts);
    expect(result.summary.counts).toEqual(SCALE_PROFILES.smoke.counts);
  });

  it('never references a future or missing parent', () => {
    expect(relationshipProblems(collect(SCALE_PROFILES.smoke).records)).toEqual([]);
  });

  it('keeps transactional ownership and monetary values internally coherent', () => {
    const { records } = collect(SCALE_PROFILES.smoke);
    const byId = new Map(records.map((record) => [record.id, record]));
    const linesByOrder = new Map<string, number>();

    for (const record of records) {
      if (record.table === 'salesOrderLines') {
        linesByOrder.set(
          record.orderId,
          (linesByOrder.get(record.orderId) ?? 0) + record.lineTotalMinor,
        );
      }
    }

    for (const record of records) {
      if (record.table === 'salesOrders') {
        expect(record.totalMinor).toBe(linesByOrder.get(record.id));
      }
      if (record.table === 'invoices') {
        const order = byId.get(record.orderId);
        expect(order?.table).toBe('salesOrders');
        if (order?.table === 'salesOrders') {
          expect(record.customerId).toBe(order.customerId);
          expect(record.totalMinor).toBe(order.totalMinor);
        }
      }
      if (record.table === 'payments') {
        const invoice = byId.get(record.invoiceId);
        expect(invoice?.table).toBe('invoices');
        if (invoice?.table === 'invoices') {
          expect(record.customerId).toBe(invoice.customerId);
          expect(record.amountMinor).toBe(invoice.totalMinor);
        }
      }
    }
  });

  it('never retains work by emitting a batch above the requested limit', () => {
    const result = collect(SCALE_PROFILES.smoke, 37);
    expect(Math.max(...result.batchSizes)).toBe(37);
    expect(result.summary.maxBatchSize).toBe(37);
  });
});
