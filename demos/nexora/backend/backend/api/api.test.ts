import { beforeAll, describe, expect, it } from 'vitest';
import { MERIDIAN } from '../data/seed/curated';
import { businessDateOf, NexoraApiError } from '../domain';
import { createNexoraBackend, type NexoraApi } from './index';
import type { InventoryListItem, MovementListItem } from './resources/operations';

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
    // The nine of section 55.6, and the stand-ins a scale seeds a holder for (the light seed has all three).
    expect(
      session.personas.filter(
        (persona) =>
          !persona.key.includes('-lead') &&
          !['finance-controller', 'staff-accountant'].includes(persona.key),
      ),
    ).toHaveLength(9);
  });

  /**
   * Section 55.6 names nine personas and none holds procurement_manager, while
   * every purchase order that needs an approval waits on that role first: the
   * procurement lead is offered as a stand-in persona, a seeded user and not a
   * new one, so a purchase order can be approved in the demo.
   */
  it('offers the procurement lead as a stand-in who decides a purchase order’s procurement step', async () => {
    const session = await api.session.get();
    const lead = session.personas.find((persona) => persona.key === 'procurement-lead');
    expect(lead?.role).toBe('procurement_manager');
    await api.demo.setPersona('marcus-lee');
    const supplier = (
      await api.suppliers.list({
        pageSize: 25,
        filter: {
          status: { eq: 'active' },
          relationshipTier: { eq: 'standard' },
          skuCount: { gte: 1 },
        },
      })
    ).data.find((row) => row.supportedCurrencies[0] === 'USD')!;
    const mapping = (await api.suppliers.get(supplier.id)).mappings[0]!;
    const quantity = String(Math.ceil(3_000_000 / mapping.unitCost.minor));
    const created = await api.purchaseOrders.create({
      supplierId: supplier.id,
      destinationWarehouseId: 'wh_000001',
      lines: [{ skuId: mapping.skuId, quantity, unitCostMinor: mapping.unitCost.minor }],
    });
    const submitted = await api.purchaseOrders.submit(created.purchaseOrder.id, {
      ifMatch: created.purchaseOrder.metadata.version,
    });
    expect(submitted.purchaseOrder.status).toBe('pending_approval');
    await api.demo.setPersona('procurement-lead');
    await api.approvals.approve(
      submitted.approval!.id,
      {},
      { ifMatch: submitted.approval!.metadata.version },
    );
    expect((await api.purchaseOrders.get(created.purchaseOrder.id)).purchaseOrder.status).toBe(
      'approved',
    );
    await api.demo.setPersona('sofia-ramirez');
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
    const meridian = page.data.find(
      (customer) => customer.accountNumber === MERIDIAN.accountNumber,
    );
    expect(meridian).toBeDefined();
    expect(meridian?.health).toBe('at_risk');
    expect(meridian?.summary.overdueReceivables.minor).toBeGreaterThanOrEqual(
      MERIDIAN.invoiceOutstandingMinor,
    );
  });

  it('resolves the cross-module story to the same ids', async () => {
    const fixtures = api.demo.fixtures();
    const order = await api.orders.get(fixtures['flagship.order.meridian'] as string);
    expect(order.order.orderNumber).toBe(MERIDIAN.orderNumber);
    expect(order.order.total.minor).toBe(MERIDIAN.orderTotalMinor);
    expect(order.order.fulfillmentStatus).toBe('partially_fulfilled');
    expect(order.order.riskFlags).toContain('inventory_shortage');
    expect(order.shipments.map((shipment) => shipment.shipmentNumber)).toContain(
      MERIDIAN.shipmentNumber,
    );
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
    const page = await api.orders.list({
      filter: { status: 'confirmed,on_hold' },
      sort: '-total',
      pageSize: 25,
    });
    expect(page.data.length).toBeGreaterThan(0);
    expect(
      page.data.every((order) => order.status === 'confirmed' || order.status === 'on_hold'),
    ).toBe(true);
    expect(page.data[0]!.total.minor).toBeGreaterThanOrEqual(
      page.data[page.data.length - 1]!.total.minor,
    );
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
    const skus = await api.catalog.skus({
      filter: { status: 'active', available: { gte: '5' } },
      pageSize: 25,
    });
    const sku = skus.data.find((candidate) => candidate.unitOfMeasure === 'EA')!;
    const warehouse = (await api.inventory.sku(sku.id)).positions.find(
      (position) => Number(position.available) >= 5,
    )!;

    const created = await api.orders.create({
      customerId: customer.id,
      defaultWarehouseId: warehouse.warehouseId,
      lines: [{ skuId: sku.id, quantity: '2' }],
      freightMinor: 2_500,
    });
    expect(created.order.status).toBe('draft');
    const submitted = await api.orders.submit(created.order.id, {
      ifMatch: created.order.metadata.version,
    });
    expect(['confirmed', 'pending_approval']).toContain(submitted.order.status);
    let order = submitted;
    if (order.order.status === 'pending_approval') {
      const approval = await api.approvals.list({ filter: { targetId: order.order.id } });
      await api.demo.setPersona('sofia-ramirez');
      await api.approvals.approve(
        approval.data[0]!.id,
        {},
        { ifMatch: approval.data[0]!.metadata.version },
      );
      await api.demo.setPersona('maya-chen');
      order = await api.orders.get(order.order.id);
    }
    expect(order.order.status).toBe('confirmed');
    expect(order.order.allocationStatus).toBe('allocated');

    await expectApiError(api.orders.hold(order.order.id, { reason: 'x' }), 'PRECONDITION_REQUIRED');
    await expectApiError(
      api.orders.hold(order.order.id, { reason: 'x' }, { ifMatch: 999 }),
      'STALE_VERSION',
    );

    const shipment = await api.shipments.create({
      orderId: order.order.id,
      warehouseId: warehouse.warehouseId,
    });
    let version = shipment.shipment.metadata.version;
    const picking = await api.shipments.startPicking(shipment.shipment.id, { ifMatch: version });
    version = picking.shipment.metadata.version;
    const packed = await api.shipments.pack(shipment.shipment.id, {}, { ifMatch: version });
    const ready = await api.shipments.ready(
      shipment.shipment.id,
      {},
      { ifMatch: packed.shipment.metadata.version },
    );
    const shipped = await api.shipments.ship(
      shipment.shipment.id,
      {},
      { ifMatch: ready.shipment.metadata.version },
    );
    expect(shipped.shipment.status).toBe('shipped');
    order = await api.orders.get(order.order.id);
    expect(order.order.fulfillmentStatus).toBe('fulfilled');
    const positionAfter = (await api.inventory.sku(sku.id)).positions.find(
      (position) => position.warehouseId === warehouse.warehouseId,
    )!;
    expect(Number(positionAfter.onHand)).toBe(Number(warehouse.onHand) - 2);

    const invoice = await api.finance.invoices.createFromOrder({ orderId: order.order.id });
    expect(invoice.invoice.lifecycle).toBe('draft');
    const opened = await api.finance.invoices.open(invoice.invoice.id, {
      ifMatch: invoice.invoice.metadata.version,
    });
    expect(opened.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
    expect(opened.invoice.total.minor).toBe(order.order.total.minor);
    const payment = await api.finance.payments.record({
      customerId: customer.id,
      amountMinor: opened.invoice.total.minor,
      method: 'ach',
      allocations: [{ invoiceId: opened.invoice.id, amountMinor: opened.invoice.total.minor }],
    });
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
    const first = await api.customers.notes.add(
      customer.id,
      { body: 'Idempotent note' },
      { idempotencyKey: 'note-1' },
    );
    const second = await api.customers.notes.add(
      customer.id,
      { body: 'Idempotent note' },
      { idempotencyKey: 'note-1' },
    );
    expect(second.id).toBe(first.id);
    await expectApiError(
      api.customers.notes.add(customer.id, { body: 'Different' }, { idempotencyKey: 'note-1' }),
      'IDEMPOTENCY_KEY_REUSED',
    );
    await api.demo.setPersona('sofia-ramirez');
  });
});

describe('regions and currencies', () => {
  it('exposes the operating regions and issues Brazilian documents in BRL', async () => {
    const session = await api.session.get();
    expect(session.organization.regions.map((region) => region.code)).toEqual(['US', 'BR']);
    const brazil = await api.customers.list({ filter: { regionCode: 'BR' }, pageSize: 25 });
    expect(brazil.page.totalItems).toBeGreaterThan(0);
    const customer = brazil.data[0]!;
    expect(customer.preferredCurrency).toBe('BRL');
    expect(customer.creditLimit.currency).toBe('BRL');
    expect(customer.summary.grossReceivables.currency).toBe('BRL');
    const orders = await api.orders.list({
      filter: { customerId: customer.id },
      pageSize: 25,
    });
    for (const order of orders.data) {
      expect(order.currency).toBe('BRL');
      expect(order.total.currency).toBe('BRL');
    }
    const invoices = await api.finance.invoices.list({ filter: { currency: 'BRL' }, pageSize: 25 });
    expect(invoices.page.totalItems).toBeGreaterThan(0);
    expect(invoices.data[0]!.fxRateToUsd).toBe('0.18500000');
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
    const before = await api.finance.invoices.list({
      filter: { collectionState: 'overdue' },
      pageSize: 25,
    });
    const advanced = await api.demo.advanceClock(24 * 40);
    expect(advanced.demo.today > '2026-09-04').toBe(true);
    const after = await api.finance.invoices.list({
      filter: { collectionState: 'overdue' },
      pageSize: 25,
    });
    expect(after.page.totalItems).toBeGreaterThan(before.page.totalItems);
  });

  it('applies the inventory crisis scenario deterministically', async () => {
    const session = await api.demo.setScenario('inventory_crisis');
    expect(session.user.displayName).toBe('Marcus Lee');
    const low = await api.inventory.list({ filter: { belowSafetyStock: true }, pageSize: 100 });
    expect(low.page.totalItems).toBeGreaterThanOrEqual(42);
    const delayed = await api.purchaseOrders.list({
      filter: { exceptionFlags: { contains: 'delayed' } },
      pageSize: 25,
    });
    expect(delayed.page.totalItems).toBeGreaterThanOrEqual(8);
    await api.reset('healthy');
  });
});

describe('historical tier', () => {
  it('summarizes the history as seeded, even when a write comes before the first read', async () => {
    const reference = createNexoraBackend({ scale: 'smoke', latency: 'none' });
    const expected = reference.store.history.summaries;
    const summary = expected.find((entry) => entry.kind !== 'cancelled') as (typeof expected)[0];
    const customer = reference.store.dataset.customers.get(summary.customerId);

    const mutated = createNexoraBackend({ scale: 'smoke', latency: 'none' });
    await mutated.customers.update(
      summary.customerId,
      { taxExempt: customer?.taxProfile.type !== 'exempt' },
      { ifMatch: customer?.metadata.version ?? 1 },
    );
    expect(mutated.store.history.summaries).toEqual(expected);
  });
});

describe('stock movements', () => {
  /**
   * The ledger filters by the fields a movement already carries before it joins the SKU, the
   * warehouse and the actor. The answer is the one the joined list would give.
   */
  it('answers a day of the ledger as the whole ledger filtered would', async () => {
    const backend = createNexoraBackend({ scale: 'smoke', latency: 'none' });
    await backend.demo.setPersona('maya-chen');
    const all: MovementListItem[] = [];
    for (let page = 1; ; page++) {
      const answer = await backend.inventory.movements({ page, pageSize: 100 });
      all.push(...answer.data);
      if (page >= answer.page.totalPages) break;
    }
    const day = all[Math.floor(all.length / 2)]!.occurredAt.slice(0, 10);
    const from = `${day}T00:00:00Z`;
    const to = `${new Date(Date.parse(from) + 86_400_000).toISOString().slice(0, 10)}T00:00:00Z`;
    const inside = (item: MovementListItem) =>
      Date.parse(item.occurredAt) >= Date.parse(from) &&
      Date.parse(item.occurredAt) < Date.parse(to);

    const received = await backend.inventory.movements({
      pageSize: 25,
      filter: { occurredAt: { gte: from, lt: to }, onHandDelta: { gt: 0 } },
    });
    expect(received.page.totalItems).toBe(
      all.filter((item) => inside(item) && Number(item.onHandDelta) > 0).length,
    );

    // A filter on a joined field still reaches the joined item.
    const sku = all.find(inside)!;
    const bySku = await backend.inventory.movements({
      pageSize: 100,
      filter: { occurredAt: { gte: from, lt: to }, skuCode: sku.skuCode },
    });
    expect(bySku.data.map((item) => item.id).sort()).toEqual(
      all
        .filter((item) => inside(item) && item.skuCode === sku.skuCode)
        .map((item) => item.id)
        .sort(),
    );
  });

  it('counts the positions a warehouse has below reorder point as the whole list filtered would', async () => {
    const backend = createNexoraBackend({ scale: 'smoke', latency: 'none' });
    await backend.demo.setPersona('maya-chen');
    const all: InventoryListItem[] = [];
    for (let page = 1; ; page++) {
      const answer = await backend.inventory.list({ page, pageSize: 100 });
      all.push(...answer.data);
      if (page >= answer.page.totalPages) break;
    }
    const warehouseId = all[0]!.warehouseId;
    const below = await backend.inventory.list({
      pageSize: 25,
      filter: { warehouseId, belowReorderPoint: 'true' },
    });
    expect(below.page.totalItems).toBe(
      all.filter((item) => item.warehouseId === warehouseId && item.belowReorderPoint).length,
    );
    const byCode = await backend.inventory.list({
      pageSize: 100,
      filter: { warehouseId, skuCode: all[0]!.skuCode },
    });
    expect(byCode.data.map((item) => item.skuId)).toEqual([all[0]!.skuId]);
  });
});

describe('procurement', () => {
  const CHI = 'wh_000001';

  /** A draft of one line from an active standard supplier in dollars, worth about the dollars asked for. */
  async function draft(dollars: number, supplierFilter: Record<string, unknown> = {}) {
    const supplier = (
      await api.suppliers.list({
        pageSize: 100,
        filter: { relationshipTier: { eq: 'standard' }, skuCount: { gte: 1 }, ...supplierFilter },
      })
    ).data.find((row) => row.supportedCurrencies[0] === 'USD')!;
    const mapping = (await api.suppliers.get(supplier.id)).mappings[0]!;
    const quantity = String(Math.max(1, Math.ceil((dollars * 100) / mapping.unitCost.minor)));
    return { supplier, mapping, quantity };
  }

  it('lists and opens to a warehouse operator the purchase orders bound for their warehouse only', async () => {
    await api.demo.setPersona('maya-chen');
    const elsewhere = (
      await api.purchaseOrders.list({ pageSize: 25, filter: { warehouseId: { neq: CHI } } })
    ).data[0]!;
    await api.demo.setPersona('jordan-wells');
    const rows = (await api.purchaseOrders.list({ pageSize: 100 })).data;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.destinationWarehouseId === CHI)).toBe(true);
    await expectApiError(api.purchaseOrders.get(elsewhere.id), 'FORBIDDEN');
    const found = await api.search(elsewhere.purchaseOrderNumber);
    expect(found.groups.flatMap((group) => group.hits).some((hit) => hit.id === elsewhere.id)).toBe(
      false,
    );
    await api.demo.setPersona('sofia-ramirez');
  });

  it('refuses a goods receipt taken outside the reader’s warehouses', async () => {
    await api.demo.setPersona('maya-chen');
    const receipts = (
      await api.purchaseOrders.list({
        pageSize: 100,
        filter: { status: { in: ['received', 'partially_received'] } },
      })
    ).data;
    const outside = receipts.find((po) => po.destinationWarehouseId !== CHI)!;
    const inside = receipts.find((po) => po.destinationWarehouseId === CHI)!;
    const outsideReceipt = (await api.purchaseOrders.get(outside.id)).receipts[0]!;
    const insideReceipt = (await api.purchaseOrders.get(inside.id)).receipts[0]!;
    await api.demo.setPersona('jordan-wells');
    await expectApiError(api.purchaseOrders.receipt(outsideReceipt.id), 'FORBIDDEN');
    expect((await api.purchaseOrders.receipt(insideReceipt.id)).receipt.id).toBe(insideReceipt.id);
    await api.demo.setPersona('sofia-ramirez');
  });

  it('writes a purchase order’s money down to nought for a reader without cost.view, as the catalogue does', async () => {
    await api.demo.setPersona('jordan-wells');
    const row = (
      await api.purchaseOrders.list({
        pageSize: 25,
        filter: { warehouseId: { eq: CHI }, status: { in: ['received'] } },
      })
    ).data[0]!;
    expect(row.total.minor).toBe(0);
    const detail = await api.purchaseOrders.get(row.id);
    expect(detail.purchaseOrder.subtotal.minor).toBe(0);
    expect(
      detail.lines.every((line) => line.unitCost.minor === 0 && line.lineTotal.minor === 0),
    ).toBe(true);
    const receipt = await api.purchaseOrders.receipt(detail.receipts[0]!.id);
    expect(receipt.lines.every((line) => line.unitCost.minor === 0)).toBe(true);
    await api.demo.setPersona('maya-chen');
    expect((await api.purchaseOrders.get(row.id)).purchaseOrder.total.minor).toBeGreaterThan(0);
    await api.demo.setPersona('sofia-ramirez');
  });

  it('refuses to submit an inactive supplier’s draft with the inactive code', async () => {
    await api.demo.setPersona('maya-chen');
    const candidates = (
      await api.suppliers.list({
        pageSize: 100,
        sort: 'openPurchaseOrderCount',
        filter: { status: { eq: 'active' }, skuCount: { gte: 1 } },
      })
    ).data;
    let tried = false;
    for (const supplier of candidates) {
      const mapping = (await api.suppliers.get(supplier.id)).mappings[0]!;
      const created = await api.purchaseOrders.create({
        supplierId: supplier.id,
        destinationWarehouseId: CHI,
        lines: [{ skuId: mapping.skuId, quantity: '1' }],
      });
      const idle = await api.suppliers
        .update(supplier.id, { status: 'inactive' }, { ifMatch: supplier.metadata.version })
        .catch(() => null);
      if (idle === null) continue;
      await expectApiError(
        api.purchaseOrders.submit(created.purchaseOrder.id, {
          ifMatch: created.purchaseOrder.metadata.version,
        }),
        'SUPPLIER_INACTIVE',
      );
      await api.suppliers.update(
        supplier.id,
        { status: 'active' },
        { ifMatch: idle.metadata.version },
      );
      tried = true;
      break;
    }
    expect(tried).toBe(true);
    await api.demo.setPersona('sofia-ramirez');
  });

  it('keeps the reason given for a receipt past the 5% tolerance', async () => {
    await api.demo.setPersona('maya-chen');
    const { supplier, mapping, quantity } = await draft(2_000, { status: { eq: 'active' } });
    const created = await api.purchaseOrders.create({
      supplierId: supplier.id,
      destinationWarehouseId: CHI,
      lines: [{ skuId: mapping.skuId, quantity }],
    });
    const submitted = await api.purchaseOrders.submit(created.purchaseOrder.id, { ifMatch: 1 });
    const sent = await api.purchaseOrders.send(created.purchaseOrder.id, {
      ifMatch: submitted.purchaseOrder.metadata.version,
    });
    const line = sent.lines[0]!;
    const receipt = await api.purchaseOrders.receive(
      created.purchaseOrder.id,
      {
        lines: { [line.id]: { accepted: String(Number(quantity) * 2) } },
        overReceiptReason: 'A full pallet arrived; kept for the backorder.',
      },
      { ifMatch: sent.purchaseOrder.metadata.version },
    );
    expect(receipt.receipt.overReceiptReason).toBe(
      'A full pallet arrived; kept for the backorder.',
    );
    await api.demo.setPersona('sofia-ramirez');
  });

  it('sorts purchase orders by total in US dollars, whatever currency each is written in', async () => {
    await api.demo.setPersona('maya-chen');
    const rows = (await api.purchaseOrders.list({ pageSize: 100, sort: '-total' })).data;
    const usd = rows.map((row) => Math.round(row.total.minor * Number(row.fxRateToUsd ?? '1')));
    for (let index = 1; index < usd.length; index += 1)
      expect(usd[index]!).toBeLessThanOrEqual(usd[index - 1]! + 1);
    await api.demo.setPersona('sofia-ramirez');
  });

  it('states on each mapping the unit cost last accepted from the supplier for the SKU', async () => {
    await api.demo.setPersona('maya-chen');
    const received = (
      await api.purchaseOrders.list({ pageSize: 25, filter: { status: { eq: 'received' } } })
    ).data[0]!;
    const detail = await api.purchaseOrders.get(received.id);
    const line = detail.lines.find((candidate) => Number(candidate.receivedAcceptedQuantity) > 0)!;
    const mapping = (await api.suppliers.get(received.supplierId)).mappings.find(
      (candidate) => candidate.skuId === line.skuId,
    );
    if (mapping) expect(mapping.lastAcceptedUnitCost?.minor).toBeGreaterThan(0);
    await api.demo.setPersona('sofia-ramirez');
  });
});

describe('finance', () => {
  const openInvoices = async (filter: Record<string, unknown> = {}) => {
    const rows = [];
    for (let page = 1; page <= 40; page += 1) {
      const answer = await api.finance.invoices.list({
        page,
        pageSize: 100,
        filter: { lifecycle: 'open', ...filter } as never,
      });
      rows.push(...answer.data);
      if (page >= answer.page.totalPages) break;
    }
    return rows.filter((row) => row.outstanding.minor > 0);
  };
  const usdOf = (row: { outstanding: { minor: number }; fxRateToUsd?: string }) =>
    Math.round(row.outstanding.minor * Number(row.fxRateToUsd ?? '1'));

  /**
   * Section 66.5 states the write-off authority in a USD equivalent. The
   * command measured a balance in the document's own minor units, so an
   * accountant was refused R$1,000 (US$185) as if it were US$1,000.
   */
  it('measures the write-off authority in US dollars, whatever the invoice is written in', async () => {
    await api.demo.setPersona('staff-accountant');
    const session = await api.session.get();
    expect(session.roles.map((role) => role.name)).toContain('Accountant');
    const brl = (await openInvoices({ currency: 'BRL' })).find(
      (row) => row.outstanding.minor > 50_000 && usdOf(row) <= 50_000,
    )!;
    expect(brl).toBeDefined();
    const written = await api.finance.invoices.writeOff(
      brl.id,
      { reason: 'Balance below collection cost' },
      { ifMatch: brl.metadata.version },
    );
    expect(written.invoice.lifecycle).toBe('written_off');

    const usd = (await openInvoices({ currency: 'USD' })).find(
      (row) => row.outstanding.minor > 50_000 && row.outstanding.minor <= 500_000,
    )!;
    const refused = await expectApiError(
      api.finance.invoices.writeOff(
        usd.id,
        { reason: 'Too small to chase' },
        { ifMatch: usd.metadata.version },
      ),
      'WRITE_OFF_LIMIT_EXCEEDED',
    );
    expect(refused.message).toContain('US$500');
    await api.demo.setPersona('sofia-ramirez');
  });

  /**
   * Priya Shah is the one Finance Manager persona and the one who asks for a
   * write-off above US$5,000, which a requester never decides (section 67.4):
   * the step is assigned to the finance controller, a stand-in who decides it.
   */
  it('assigns a write-off above US$5,000 to the finance controller, whose approval writes it off', async () => {
    // The smoke seed's Finance team holds no second Finance Manager; the light seed, the demo's, does.
    const smoke = api;
    api = createNexoraBackend({ scale: 'light', latency: 'none' });
    await api.demo.setPersona('priya-shah');
    const large = (await openInvoices()).find((row) => usdOf(row) > 500_000)!;
    const requested = await api.finance.invoices.writeOff(
      large.id,
      { reason: 'Customer insolvent' },
      { ifMatch: large.metadata.version },
    );
    expect(requested.invoice.lifecycle).toBe('open');
    const approval = requested.approval!;
    expect(approval.status).toBe('pending');
    expect(approval.steps.map((step) => step.requiredRole)).toEqual(['finance_manager']);
    const personas = (await api.session.get()).personas;
    const controller = personas.find((persona) => persona.key === 'finance-controller')!;
    expect(controller.role).toBe('finance_manager');
    expect(approval.steps[0]!.assignedUserId).toBe(controller.userId);
    await expectApiError(
      api.approvals.approve(approval.id, {}, { ifMatch: approval.metadata.version }),
      'FORBIDDEN',
    );
    await expectApiError(
      api.finance.invoices.writeOff(
        large.id,
        { reason: 'Again' },
        { ifMatch: requested.invoice.metadata.version },
      ),
      'APPROVAL_REQUIRED',
    );
    await api.demo.setPersona('finance-controller');
    await api.approvals.approve(
      approval.id,
      { comment: 'Agreed' },
      { ifMatch: approval.metadata.version },
    );
    const after = await api.finance.invoices.get(large.id);
    expect(after.invoice.lifecycle).toBe('written_off');
    expect(after.approval?.status).toBe('approved');
    api = smoke;
  }, 60_000);

  it('states the cash collected this month, its eight-week trend and the disputed balance', async () => {
    await api.demo.setPersona('priya-shah');
    const before = await api.finance.overview();
    expect(before.cashCollectedByWeek).toHaveLength(8);
    const disputed = await openInvoices({ collectionState: 'disputed' });
    expect(before.disputedReceivables.minor).toBe(
      disputed.reduce((sum, row) => sum + usdOf(row), 0),
    );
    const customer = (
      await api.customers.list({ filter: { preferredCurrency: 'USD' }, pageSize: 25 })
    ).data[0]!;
    await api.finance.payments.record({
      customerId: customer.id,
      amountMinor: 123_400,
      method: 'ach',
    });
    const after = await api.finance.overview();
    expect(after.cashCollectedMonthToDate.minor - before.cashCollectedMonthToDate.minor).toBe(
      123_400,
    );
    expect(after.paymentsReceivedMonthToDate).toBe(before.paymentsReceivedMonthToDate + 1);
    expect(
      after.cashCollectedByWeek.at(-1)!.amount.minor -
        before.cashCollectedByWeek.at(-1)!.amount.minor,
    ).toBe(123_400);
    await api.demo.setPersona('sofia-ramirez');
  });

  it('sorts invoices and payments by their amount in US dollars, whatever currency each is written in', async () => {
    await api.demo.setPersona('priya-shah');
    const invoices = await api.finance.invoices.list({
      pageSize: 100,
      sort: '-outstanding',
      filter: { lifecycle: 'open' },
    });
    const values = invoices.data.map(usdOf);
    expect(new Set(invoices.data.map((row) => row.currency)).size).toBeGreaterThan(1);
    expect(values).toEqual([...values].sort((a, b) => b - a));
    const payments = await api.finance.payments.list({ pageSize: 100, sort: '-amount' });
    const amounts = payments.data.map((row) =>
      Math.round(row.amount.minor * Number(row.fxRateToUsd ?? '1')),
    );
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
    await api.demo.setPersona('sofia-ramirez');
  });

  /** The light seed held a credit memo of 7 September and returns of 5 and 6 against a today of 4 September. */
  it('dates no return and no credit memo after the demo’s today, and seeds an invoice a credit memo paid', async () => {
    const light = createNexoraBackend({ scale: 'light', latency: 'none' });
    await light.demo.setPersona('maya-chen');
    const today = (await light.session.get()).demo.today;
    const memos = await light.finance.creditMemos.list({ pageSize: 25, sort: '-issueDate' });
    expect(memos.data[0]!.issueDate <= today, memos.data[0]!.issueDate).toBe(true);
    for (let page = 1; page <= 20; page += 1) {
      const returns = await light.returns.list({ page, pageSize: 100 });
      for (const row of returns.data)
        for (const stamp of [
          row.requestedAt,
          row.authorizedAt,
          row.receivedAt,
          row.inspectedAt,
          row.completedAt,
        ])
          if (stamp)
            expect(businessDateOf(stamp) <= today, `${row.returnNumber} ${stamp}`).toBe(true);
      if (page >= returns.page.totalPages) break;
    }
    // Section 82: the invoice settled by a credit memo is seeded, and a credit application settles it.
    const settled = light.demo.fixtures()['edge.invoice.paid_with_credit_memo'];
    expect(settled).toBeDefined();
    const invoice = await light.finance.invoices.get(settled!);
    expect(invoice.invoice.settlement).toBe('paid');
    expect(invoice.creditApplications.some((application) => application.status === 'active')).toBe(
      true,
    );
  }, 60_000);

  /** §77.7: overdue receivables ×2.2, as the overview reads them — in US dollars. It measured minor units across currencies and reached ×1.70. */
  it('raises the overdue receivables 2.2 times in collections pressure, as the overview measures them', async () => {
    const light = createNexoraBackend({ scale: 'light', latency: 'none', persona: 'priya-shah' });
    const healthy = (await light.finance.overview()).overdueReceivables.minor;
    await light.demo.setScenario('collections_pressure');
    await light.demo.setPersona('priya-shah');
    const pressed = (await light.finance.overview()).overdueReceivables.minor;
    expect(pressed / healthy).toBeGreaterThanOrEqual(2.2);
    expect(pressed / healthy).toBeLessThan(2.35);
  }, 60_000);

  /** The confidence is scored on read; the filter read the stored candidates, which are empty. */
  it('filters bank transactions by the confidence it scores', async () => {
    await api.demo.setPersona('priya-shah');
    const all = await api.finance.bankTransactions.list({
      pageSize: 100,
      filter: { status: { in: ['unmatched', 'suggested', 'needs_review'] } },
    });
    const confidences = new Set(
      all.data.flatMap((row) => (row.bestCandidate ? [row.bestCandidate.confidence] : [])),
    );
    expect(confidences.size).toBeGreaterThan(0);
    for (const confidence of confidences) {
      const narrowed = await api.finance.bankTransactions.list({
        pageSize: 100,
        filter: { confidence },
      });
      expect(narrowed.page.totalItems).toBeGreaterThan(0);
      expect(narrowed.data.every((row) => row.bestCandidate?.confidence === confidence)).toBe(true);
    }
    await api.demo.setPersona('sofia-ramirez');
  });

  /**
   * Section 55.5 gives a sales representative and a support agent read scope
   * over every customer and order, and an order's detail lists its invoices:
   * `invoices.view` answers every invoice to both, as it answers an order.
   */
  it('reads every invoice to a representative and a support agent, as it reads every order', async () => {
    await api.demo.setPersona('maya-chen');
    const total = (await api.finance.invoices.list({ pageSize: 25 })).page.totalItems;
    for (const persona of ['noah-bennett', 'aisha-grant']) {
      await api.demo.setPersona(persona);
      const user = (await api.session.get()).user;
      const answer = await api.finance.invoices.list({ pageSize: 25 });
      expect(answer.page.totalItems).toBe(total);
      const foreign = (await openInvoices()).find(
        (row) => row.customerId && row.customerName && row.sourceOrderId,
      )!;
      const customer = await api.customers.get(foreign.customerId);
      if (customer.customer.accountOwnerId !== user.id) {
        const invoice = await api.finance.invoices.get(foreign.id);
        const order = await api.orders.get(foreign.sourceOrderId!);
        expect(order.invoices.map((row) => row.id)).toContain(invoice.invoice.id);
      }
      await expectApiError(api.finance.payments.list(), 'FORBIDDEN');
    }
    await api.demo.setPersona('sofia-ramirez');
  });
});
