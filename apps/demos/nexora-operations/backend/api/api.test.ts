import { beforeAll, describe, expect, it } from 'vitest';
import { MERIDIAN } from '../data/seed/curated';
import { NexoraApiError } from '../domain';
import { createNexoraBackend, type NexoraApi } from './index';

let api: NexoraApi;

beforeAll(() => {
  api = createNexoraBackend({ scale: 'smoke', latency: 'none' });
});

async function expectApiError(promise: Promise<unknown>, code: string): Promise<NexoraApiError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(NexoraApiError);
    expect((error as NexoraApiError).code).toBe(code);
    return error as NexoraApiError;
  }
  throw new Error(`expected ${code}`);
}

describe('session and personas', () => {
  it('signs in Sofia Ramirez by default with sales-manager permissions', async () => {
    const session = await api.session.get();
    expect(session.user.displayName).toBe('Sofia Ramirez');
    expect(session.permissions).toContain('orders.approve');
    expect(session.permissions).not.toContain('payments.record');
    expect(session.personas).toHaveLength(9);
  });

  it('enforces permissions per persona', async () => {
    await api.demo.setPersona('jordan-wells');
    await expectApiError(api.finance.invoices.list(), 'FORBIDDEN');
    const inventory = await api.inventory.list({ pageSize: 25 });
    expect(inventory.data.every((position) => position.warehouseCode === 'CHI-01')).toBe(true);
    await api.demo.setPersona('sofia-ramirez');
  });
});

describe('customers and the Meridian narrative', () => {
  it('lists customers with projections and searches by name', async () => {
    const page = await api.customers.list({ q: 'meridian', pageSize: 25 });
    expect(page.page.totalItems).toBeGreaterThanOrEqual(1);
    const meridian = page.data.find((customer) => customer.accountNumber === MERIDIAN.accountNumber);
    expect(meridian).toBeDefined();
    expect(meridian?.health).toBe('at_risk');
    expect(meridian?.summary.overdueReceivables.minor).toBeGreaterThanOrEqual(MERIDIAN.invoiceOutstandingMinor);
  });

  it('resolves the cross-module story to the same ids', async () => {
    const fixtures = api.demo.fixtures();
    const order = await api.orders.get(fixtures['flagship.order.meridian'] as string);
    expect(order.order.orderNumber).toBe(MERIDIAN.orderNumber);
    expect(order.order.total.minor).toBe(MERIDIAN.orderTotalMinor);
    expect(order.order.fulfillmentStatus).toBe('partially_fulfilled');
    expect(order.order.riskFlags).toContain('inventory_shortage');
    expect(order.shipments.map((shipment) => shipment.shipmentNumber)).toContain(MERIDIAN.shipmentNumber);
    const invoice = order.invoices.find((entry) => entry.invoiceNumber === MERIDIAN.invoiceNumber);
    expect(invoice?.outstanding.minor).toBe(MERIDIAN.invoiceOutstandingMinor);
    expect(invoice?.collectionState).toBe('overdue');
    const mx240 = order.lines.find((line) => line.skuId === fixtures['flagship.sku.mx240']);
    expect(mx240?.backorderedQuantity).toBe(String(MERIDIAN.backorderedUnits));
    const ticket = await api.support.tickets.get(fixtures['flagship.ticket.meridian'] as string);
    expect(ticket.ticket.ticketNumber).toBe(MERIDIAN.ticketNumber);
    expect(ticket.relatedOrder?.orderNumber).toBe(MERIDIAN.orderNumber);
  });
});

describe('list queries', () => {
  it('filters, sorts and paginates orders across both tiers', async () => {
    const page = await api.orders.list({ filter: { status: 'confirmed,on_hold' }, sort: '-total', pageSize: 25 });
    expect(page.data.length).toBeGreaterThan(0);
    expect(page.data.every((order) => order.status === 'confirmed' || order.status === 'on_hold')).toBe(true);
    expect(page.data[0]!.total.minor).toBeGreaterThanOrEqual(page.data[page.data.length - 1]!.total.minor);
    const all = await api.orders.list({ pageSize: 25 });
    expect(all.page.totalItems).toBeGreaterThan(api.store.dataset.salesOrders.size);
  });

  it('rejects unknown sort fields', async () => {
    await expectApiError(api.orders.list({ sort: 'nope' }), 'INVALID_SORT');
    await expectApiError(api.orders.list({ pageSize: 30 }), 'INVALID_QUERY');
  });

  it('expands a historical order on demand', async () => {
    const page = await api.orders.list({ filter: { historical: true }, pageSize: 25 });
    const historical = page.data[0]!;
    const detail = await api.orders.get(historical.id);
    expect(detail.order.historical).toBe(true);
    expect(detail.lines.length).toBe(historical.lineCount);
    expect(detail.order.total.minor).toBe(historical.total.minor);
  });
});

describe('order to cash', () => {
  it('creates, submits, allocates, ships, invoices and pays an order', async () => {
    await api.demo.setPersona('maya-chen');
    const customers = await api.customers.list({ filter: { status: 'active' }, pageSize: 25 });
    const customer = customers.data[0]!;
    const skus = await api.catalog.skus({ filter: { status: 'active', available: { gte: '5' } }, pageSize: 25 });
    const sku = skus.data.find((candidate) => candidate.unitOfMeasure === 'EA')!;
    const warehouse = (await api.inventory.sku(sku.id)).positions.find((position) => Number(position.available) >= 5)!;

    const created = await api.orders.create({ customerId: customer.id, defaultWarehouseId: warehouse.warehouseId, lines: [{ skuId: sku.id, quantity: '2' }], freightMinor: 2_500 });
    expect(created.order.status).toBe('draft');
    const submitted = await api.orders.submit(created.order.id, { ifMatch: created.order.metadata.version });
    expect(['confirmed', 'pending_approval']).toContain(submitted.order.status);
    let order = submitted;
    if (order.order.status === 'pending_approval') {
      const approval = await api.approvals.list({ filter: { targetId: order.order.id } });
      await api.demo.setPersona('sofia-ramirez');
      await api.approvals.approve(approval.data[0]!.id, {}, { ifMatch: approval.data[0]!.metadata.version });
      await api.demo.setPersona('maya-chen');
      order = await api.orders.get(order.order.id);
    }
    expect(order.order.status).toBe('confirmed');
    expect(order.order.allocationStatus).toBe('allocated');

    await expectApiError(api.orders.hold(order.order.id, { reason: 'x' }), 'PRECONDITION_REQUIRED');
    await expectApiError(api.orders.hold(order.order.id, { reason: 'x' }, { ifMatch: 999 }), 'STALE_VERSION');

    const shipment = await api.shipments.create({ orderId: order.order.id, warehouseId: warehouse.warehouseId });
    let version = shipment.shipment.metadata.version;
    const picking = await api.shipments.startPicking(shipment.shipment.id, { ifMatch: version });
    version = picking.shipment.metadata.version;
    const packed = await api.shipments.pack(shipment.shipment.id, {}, { ifMatch: version });
    const ready = await api.shipments.ready(shipment.shipment.id, {}, { ifMatch: packed.shipment.metadata.version });
    const shipped = await api.shipments.ship(shipment.shipment.id, {}, { ifMatch: ready.shipment.metadata.version });
    expect(shipped.shipment.status).toBe('shipped');
    order = await api.orders.get(order.order.id);
    expect(order.order.fulfillmentStatus).toBe('fulfilled');
    const positionAfter = (await api.inventory.sku(sku.id)).positions.find((position) => position.warehouseId === warehouse.warehouseId)!;
    expect(Number(positionAfter.onHand)).toBe(Number(warehouse.onHand) - 2);

    const invoice = await api.finance.invoices.createFromOrder({ orderId: order.order.id });
    expect(invoice.invoice.lifecycle).toBe('draft');
    const opened = await api.finance.invoices.open(invoice.invoice.id, { ifMatch: invoice.invoice.metadata.version });
    expect(opened.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
    expect(opened.invoice.total.minor).toBe(order.order.total.minor);
    const payment = await api.finance.payments.record({ customerId: customer.id, amountMinor: opened.invoice.total.minor, method: 'ach', allocations: [{ invoiceId: opened.invoice.id, amountMinor: opened.invoice.total.minor }] });
    expect(payment.payment.unappliedAmount.minor).toBe(0);
    const paid = await api.finance.invoices.get(opened.invoice.id);
    expect(paid.invoice.settlement).toBe('paid');
    order = await api.orders.get(order.order.id);
    expect(order.order.status).toBe('closed');
    const audit = await api.audit({ filter: { entityId: order.order.id } });
    expect(audit.page.totalItems).toBeGreaterThan(2);
    await api.demo.setPersona('sofia-ramirez');
  });

  it('rolls back a failed command atomically', async () => {
    await api.demo.setPersona('maya-chen');
    const before = api.store.dataset.salesOrders.size;
    await expectApiError(api.orders.create({ customerId: 'cus_missing', lines: [] }), 'NOT_FOUND');
    expect(api.store.dataset.salesOrders.size).toBe(before);
    await api.demo.setPersona('sofia-ramirez');
  });

  it('honours idempotency keys', async () => {
    await api.demo.setPersona('maya-chen');
    const customers = await api.customers.list({ filter: { status: 'active' }, pageSize: 25 });
    const customer = customers.data[1]!;
    const first = await api.customers.notes.add(customer.id, { body: 'Idempotent note' }, { idempotencyKey: 'note-1' });
    const second = await api.customers.notes.add(customer.id, { body: 'Idempotent note' }, { idempotencyKey: 'note-1' });
    expect(second.id).toBe(first.id);
    await expectApiError(api.customers.notes.add(customer.id, { body: 'Different' }, { idempotencyKey: 'note-1' }), 'IDEMPOTENCY_KEY_REUSED');
    await api.demo.setPersona('sofia-ramirez');
  });
});

describe('analytics and scenarios', () => {
  it('produces a dashboard, finance overview and search results', async () => {
    const dashboard = await api.analytics.dashboard();
    expect(dashboard.kpis.length).toBeGreaterThan(8);
    expect(dashboard.monthly.length).toBeGreaterThan(12);
    await api.demo.setPersona('priya-shah');
    const overview = await api.finance.overview();
    expect(overview.receivables.minor).toBeGreaterThan(0);
    expect(overview.aging).toHaveLength(5);
    await api.demo.setPersona('sofia-ramirez');
    const search = await api.search('MX-240');
    expect(search.groups.find((group) => group.type === 'sku')?.hits.length).toBeGreaterThan(0);
  });

  it('advances the demo clock and re-evaluates time-derived state', async () => {
    const before = await api.finance.invoices.list({ filter: { collectionState: 'overdue' }, pageSize: 25 });
    const advanced = await api.demo.advanceClock(24 * 40);
    expect(advanced.demo.today > '2026-09-04').toBe(true);
    const after = await api.finance.invoices.list({ filter: { collectionState: 'overdue' }, pageSize: 25 });
    expect(after.page.totalItems).toBeGreaterThan(before.page.totalItems);
  });

  it('applies the inventory crisis scenario deterministically', async () => {
    const session = await api.demo.setScenario('inventory_crisis');
    expect(session.user.displayName).toBe('Marcus Lee');
    const low = await api.inventory.list({ filter: { belowSafetyStock: true }, pageSize: 100 });
    expect(low.page.totalItems).toBeGreaterThanOrEqual(42);
    const delayed = await api.purchaseOrders.list({ filter: { exceptionFlags: { contains: 'delayed' } }, pageSize: 25 });
    expect(delayed.page.totalItems).toBeGreaterThanOrEqual(8);
    await api.reset('healthy');
  });
});
