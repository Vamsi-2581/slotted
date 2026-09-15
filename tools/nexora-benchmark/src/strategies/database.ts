import Dexie, { type Table } from 'dexie';

import type {
  ProbeName,
  ProbeResult,
  ReadinessState,
  ScaleProfile,
  StrategyName,
} from '../contracts';
import { digestValue } from '../digest';
import { generateCalibrationBatches, GENERATION_ORDER, representativeRecordId } from '../generate';
import type {
  CalibrationRecord,
  CustomerRecord,
  InvoiceRecord,
  PaymentRecord,
  RecordBatch,
  RecordTable,
  SalesOrderRecord,
  StockMovementRecord,
} from '../records';
import type { ReadinessSnapshot, StrategyObserver, StrategySession } from '../query-contract';

interface MetadataRow {
  readonly key: string;
  readonly value: string;
}

interface PartitionRow {
  readonly id: string;
  readonly table: RecordTable;
  readonly partition: string;
  readonly records: number;
}

const PROBE_TABLES: Readonly<Record<ProbeName, readonly RecordTable[]>> = {
  'orders-page': ['salesOrders'],
  'customer-360': ['customers', 'contacts', 'salesOrders', 'supportTickets'],
  'inventory-ledger': ['skus', 'stockMovements'],
  'finance-summary': ['invoices', 'payments'],
  'historical-point-lookup': ['stockMovements'],
};

function emptyCounts(): Record<RecordTable, number> {
  return Object.fromEntries(GENERATION_ORDER.map((table) => [table, 0])) as Record<
    RecordTable,
    number
  >;
}

function now(): number {
  return typeof performance === 'undefined' ? 0 : performance.now();
}

function compareRecent(
  left: Pick<CalibrationRecord, 'createdAt' | 'id'>,
  right: Pick<CalibrationRecord, 'createdAt' | 'id'>,
): number {
  return right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id);
}

function retainRecent<T extends Pick<CalibrationRecord, 'createdAt' | 'id'>>(
  records: T[],
  record: T,
  limit = 50,
): void {
  if (records.length < limit) {
    records.push(record);
    records.sort(compareRecent);
    return;
  }
  if (compareRecent(record, records[records.length - 1]!) >= 0) return;
  records.push(record);
  records.sort(compareRecent);
  records.length = limit;
}

function completeResult(
  probe: ProbeName,
  visibleRecords: readonly string[],
  total: number,
): ProbeResult {
  const payload = { probe, visibleRecords, total, completeness: 'complete' as const };
  return { ...payload, digest: digestValue(payload) };
}

export function notReadyResult(probe: ProbeName): ProbeResult {
  const payload = {
    probe,
    visibleRecords: [] as readonly string[],
    total: 0,
    completeness: 'not-ready' as const,
  };
  return { ...payload, digest: digestValue(payload) };
}

export class CalibrationDatabase extends Dexie {
  readonly metadata!: Table<MetadataRow, string>;
  readonly partitions!: Table<PartitionRow, string>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      metadata: 'key',
      partitions: 'id, table, partition, [table+partition]',
      customers: 'id, partition, status, joinedAt, name',
      contacts: 'id, partition, customerId, createdAt, [customerId+createdAt+id]',
      suppliers: 'id, partition, status, name',
      skus: 'id, partition, status, category, code',
      salesOrders:
        'id, partition, customerId, status, placedAt, [placedAt+id], [customerId+placedAt+id]',
      salesOrderLines: 'id, partition, orderId, skuId, [orderId+id], [skuId+id]',
      stockMovements:
        'id, partition, skuId, warehouseId, occurredAt, [skuId+warehouseId], [skuId+warehouseId+occurredAt+id], [occurredAt+id]',
      purchaseOrders: 'id, partition, supplierId, status, orderedAt, [supplierId+orderedAt]',
      invoices: 'id, partition, orderId, customerId, status, issuedAt, [customerId+issuedAt]',
      payments: 'id, partition, invoiceId, customerId, receivedAt, [customerId+receivedAt]',
      supportTickets:
        'id, partition, customerId, status, priority, createdAt, [customerId+createdAt+id]',
    });
  }

  records(table: RecordTable): Table<CalibrationRecord, string> {
    return this.table<CalibrationRecord, string>(table);
  }
}

export async function databaseExists(name: string): Promise<boolean> {
  return Dexie.exists(name);
}

async function storedOrdersPage(database: CalibrationDatabase): Promise<ProbeResult> {
  const orders = database.records('salesOrders') as Table<SalesOrderRecord, string>;
  const [total, page] = await Promise.all([
    orders.count(),
    orders
      .orderBy('[placedAt+id]')
      .reverse()
      .filter((order) => order.status === 'shipped')
      .limit(50)
      .toArray(),
  ]);
  return completeResult(
    'orders-page',
    page.map((record) => record.id),
    total,
  );
}

async function storedCustomer360(
  database: CalibrationDatabase,
  profile: ScaleProfile,
): Promise<ProbeResult> {
  const customerId = representativeRecordId(profile, 'customers', 0);
  const customer = (await database.records('customers').get(customerId)) as
    CustomerRecord | undefined;
  const [contactCount, orderCount, ticketCount, contacts, orders, tickets] = await Promise.all([
    database.records('contacts').where('customerId').equals(customerId).count(),
    database.records('salesOrders').where('customerId').equals(customerId).count(),
    database.records('supportTickets').where('customerId').equals(customerId).count(),
    database
      .records('contacts')
      .where('[customerId+createdAt+id]')
      .between([customerId, '', ''], [customerId, '\uffff', '\uffff'])
      .reverse()
      .limit(50)
      .toArray(),
    database
      .records('salesOrders')
      .where('[customerId+placedAt+id]')
      .between([customerId, '', ''], [customerId, '\uffff', '\uffff'])
      .reverse()
      .limit(50)
      .toArray(),
    database
      .records('supportTickets')
      .where('[customerId+createdAt+id]')
      .between([customerId, '', ''], [customerId, '\uffff', '\uffff'])
      .reverse()
      .limit(50)
      .toArray(),
  ]);
  const related = [...contacts, ...orders, ...tickets].sort(compareRecent);
  const visible = customer
    ? [customer.id, ...related.slice(0, 49).map((record) => record.id)]
    : related.slice(0, 50).map((record) => record.id);
  return completeResult(
    'customer-360',
    visible,
    (customer ? 1 : 0) + contactCount + orderCount + ticketCount,
  );
}

async function storedInventoryLedger(
  database: CalibrationDatabase,
  profile: ScaleProfile,
): Promise<ProbeResult> {
  const skuId = representativeRecordId(profile, 'skus', 0);
  const [total, matching] = await Promise.all([
    database
      .records('stockMovements')
      .where('[skuId+warehouseId]')
      .equals([skuId, 'wh-sp-01'])
      .count(),
    database
      .records('stockMovements')
      .where('[skuId+warehouseId+occurredAt+id]')
      .between([skuId, 'wh-sp-01', '', ''], [skuId, 'wh-sp-01', '\uffff', '\uffff'])
      .reverse()
      .limit(50)
      .toArray() as Promise<StockMovementRecord[]>,
  ]);
  return completeResult(
    'inventory-ledger',
    matching.map((record) => record.id),
    total,
  );
}

async function storedFinanceSummary(database: CalibrationDatabase): Promise<ProbeResult> {
  let invoiceTotal = 0;
  let invoiceBalance = 0;
  let paymentTotal = 0;
  const invoices = database.records('invoices') as Table<InvoiceRecord, string>;
  const payments = database.records('payments') as Table<PaymentRecord, string>;
  await invoices.each((invoice) => {
    invoiceTotal += invoice.totalMinor;
    invoiceBalance += invoice.balanceMinor;
  });
  await payments.each((payment) => {
    paymentTotal += payment.amountMinor;
  });
  const [invoiceCount, paymentCount] = await Promise.all([invoices.count(), payments.count()]);
  return completeResult(
    'finance-summary',
    [
      `invoice-total:${invoiceTotal}`,
      `invoice-balance:${invoiceBalance}`,
      `payment-total:${paymentTotal}`,
    ],
    invoiceCount + paymentCount,
  );
}

async function storedHistoricalLookup(
  database: CalibrationDatabase,
  profile: ScaleProfile,
): Promise<ProbeResult> {
  const index = Math.floor(profile.counts.stockMovements / 2);
  const id = representativeRecordId(profile, 'stockMovements', index);
  const record = await database.records('stockMovements').get(id);
  return completeResult('historical-point-lookup', record ? [record.id] : [], record ? 1 : 0);
}

export async function executeStoredProbe(
  database: CalibrationDatabase,
  profile: ScaleProfile,
  name: ProbeName,
): Promise<ProbeResult> {
  switch (name) {
    case 'orders-page':
      return storedOrdersPage(database);
    case 'customer-360':
      return storedCustomer360(database, profile);
    case 'inventory-ledger':
      return storedInventoryLedger(database, profile);
    case 'finance-summary':
      return storedFinanceSummary(database);
    case 'historical-point-lookup':
      return storedHistoricalLookup(database, profile);
  }
}

export function executeVirtualProbe(profile: ScaleProfile, name: ProbeName): ProbeResult {
  const customerId = representativeRecordId(profile, 'customers', 0);
  const skuId = representativeRecordId(profile, 'skus', 0);
  const movementId = representativeRecordId(
    profile,
    'stockMovements',
    Math.floor(profile.counts.stockMovements / 2),
  );
  let customer: CustomerRecord | undefined;
  const customerRelated: CalibrationRecord[] = [];
  const orders: SalesOrderRecord[] = [];
  const movements: StockMovementRecord[] = [];
  let orderCount = 0;
  let customerRelatedCount = 0;
  let movementCount = 0;
  let invoiceCount = 0;
  let paymentCount = 0;
  let invoiceTotal = 0;
  let invoiceBalance = 0;
  let paymentTotal = 0;
  let historical: StockMovementRecord | undefined;

  const lastRequiredTable: Record<ProbeName, RecordTable> = {
    'orders-page': 'salesOrders',
    'customer-360': 'supportTickets',
    'inventory-ledger': 'stockMovements',
    'finance-summary': 'payments',
    'historical-point-lookup': 'stockMovements',
  };
  const lastRequiredIndex = GENERATION_ORDER.indexOf(lastRequiredTable[name]);

  for (const batch of generateCalibrationBatches(profile, 512)) {
    if (GENERATION_ORDER.indexOf(batch.table) > lastRequiredIndex) break;
    for (const record of batch.records) {
      if (name === 'orders-page' && record.table === 'salesOrders') {
        orderCount += 1;
        if (record.status === 'shipped') retainRecent(orders, record);
      }
      if (name === 'customer-360') {
        if (record.table === 'customers' && record.id === customerId) customer = record;
        if (
          (record.table === 'contacts' ||
            record.table === 'salesOrders' ||
            record.table === 'supportTickets') &&
          record.customerId === customerId
        ) {
          customerRelatedCount += 1;
          retainRecent(customerRelated, record);
        }
      }
      if (
        name === 'inventory-ledger' &&
        record.table === 'stockMovements' &&
        record.skuId === skuId &&
        record.warehouseId === 'wh-sp-01'
      ) {
        movementCount += 1;
        retainRecent(movements, record);
      }
      if (name === 'finance-summary') {
        if (record.table === 'invoices') {
          invoiceCount += 1;
          invoiceTotal += record.totalMinor;
          invoiceBalance += record.balanceMinor;
        }
        if (record.table === 'payments') {
          paymentCount += 1;
          paymentTotal += record.amountMinor;
        }
      }
      if (
        name === 'historical-point-lookup' &&
        record.table === 'stockMovements' &&
        record.id === movementId
      ) {
        historical = record;
      }
    }
  }

  switch (name) {
    case 'orders-page': {
      return completeResult(
        name,
        orders.map((record) => record.id),
        orderCount,
      );
    }
    case 'customer-360': {
      return completeResult(
        name,
        customer
          ? [customer.id, ...customerRelated.slice(0, 49).map((record) => record.id)]
          : customerRelated.slice(0, 50).map((record) => record.id),
        (customer ? 1 : 0) + customerRelatedCount,
      );
    }
    case 'inventory-ledger':
      return completeResult(
        name,
        movements.map((record) => record.id),
        movementCount,
      );
    case 'finance-summary':
      return completeResult(
        name,
        [
          `invoice-total:${invoiceTotal}`,
          `invoice-balance:${invoiceBalance}`,
          `payment-total:${paymentTotal}`,
        ],
        invoiceCount + paymentCount,
      );
    case 'historical-point-lookup':
      return completeResult(name, historical ? [historical.id] : [], historical ? 1 : 0);
  }
}

export abstract class DatabaseStrategySession implements StrategySession {
  readonly database: CalibrationDatabase;
  protected readonly committedCounts = emptyCounts();
  protected readonly completeTables = new Set<RecordTable>();
  protected readonly committedPartitions = new Set<string>();
  protected readonly partitionCounts = new Map<string, number>();
  protected disposed = false;
  private state: ReadinessState = 'empty';
  private background: Promise<void> | undefined;
  private storedBytes = 0;
  private pendingPartitions = 0;

  constructor(
    readonly name: StrategyName,
    protected readonly profile: ScaleProfile,
    protected readonly observer: StrategyObserver,
    databaseName: string,
    protected readonly batchSize: number,
  ) {
    this.database = new CalibrationDatabase(databaseName);
  }

  async open(): Promise<void> {
    await this.database.open();
    await this.database.metadata.put({ key: 'strategy', value: this.name });
    await this.database.metadata.put({ key: 'profile', value: this.profile.id });
    this.observer.onReadiness(this.snapshot());
  }

  protected snapshot(): ReadinessSnapshot {
    return {
      state: this.state,
      committedCounts: { ...this.committedCounts },
      committedPartitions: this.committedPartitions.size,
      pendingPartitions: this.pendingPartitions,
    };
  }

  async readiness(): Promise<ReadinessSnapshot> {
    return this.snapshot();
  }

  protected setReadiness(state: ReadinessState): void {
    const rank: Record<ReadinessState, number> = {
      empty: 0,
      operational: 1,
      complete: 2,
      failed: 3,
    };
    if (rank[state] < rank[this.state] || state === this.state) return;
    this.state = state;
    this.observer.onReadiness(this.snapshot());
  }

  protected setPendingPartitions(value: number): void {
    this.pendingPartitions = Math.max(0, value);
  }

  protected markTableComplete(table: RecordTable): void {
    this.completeTables.add(table);
    this.committedCounts[table] = this.profile.counts[table];
  }

  protected markTableAvailable(table: RecordTable): void {
    this.completeTables.add(table);
  }

  protected markAllTablesComplete(): void {
    for (const table of GENERATION_ORDER) this.markTableComplete(table);
  }

  protected async writeBatch(batch: RecordBatch): Promise<void> {
    if (this.disposed || batch.records.length === 0) return;
    const writeStarted = now();
    const write = this.database.records(batch.table).bulkPut(batch.records);
    let blockingDurationMs = now() - writeStarted;
    await write;
    if (this.disposed) return;
    const finalizeStarted = now();
    this.committedCounts[batch.table] += batch.records.length;
    const partitionId = `${batch.table}:${batch.partition}`;
    this.committedPartitions.add(partitionId);
    const partitionCount = (this.partitionCounts.get(partitionId) ?? 0) + batch.records.length;
    this.partitionCounts.set(partitionId, partitionCount);
    this.storedBytes += JSON.stringify(batch.records).length;
    const partitionWrite = this.database.partitions.put({
      id: partitionId,
      table: batch.table,
      partition: batch.partition,
      records: partitionCount,
    });
    blockingDurationMs = Math.max(blockingDurationMs, now() - finalizeStarted);
    await partitionWrite;
    this.observer.onBatch({ records: batch.records.length, durationMs: blockingDurationMs });
  }

  protected trackCommittedBatch(batch: RecordBatch, durationMs: number): void {
    this.committedCounts[batch.table] += batch.records.length;
    const partitionId = `${batch.table}:${batch.partition}`;
    this.committedPartitions.add(partitionId);
    this.partitionCounts.set(
      partitionId,
      (this.partitionCounts.get(partitionId) ?? 0) + batch.records.length,
    );
    this.storedBytes += JSON.stringify(batch.records).length;
    this.observer.onBatch({ records: batch.records.length, durationMs });
  }

  protected startBackground(task: () => Promise<void>): Promise<void> {
    const execution = task();
    this.background = execution.catch(() => {
      if (!this.disposed) this.setReadiness('failed');
    });
    return execution;
  }

  protected requiredTablesReady(name: ProbeName): boolean {
    return PROBE_TABLES[name].every((table) => this.completeTables.has(table));
  }

  async runProbe(name: ProbeName): Promise<ProbeResult> {
    if (!this.requiredTablesReady(name)) return notReadyResult(name);
    return executeStoredProbe(this.database, this.profile, name);
  }

  async correctnessDigest(): Promise<string> {
    const probes: ProbeResult[] = [];
    for (const name of Object.keys(PROBE_TABLES) as ProbeName[]) {
      probes.push(await this.runProbe(name));
    }
    return digestValue({
      counts: this.profile.counts,
      representatives: Object.fromEntries(
        GENERATION_ORDER.map((table) => [
          table,
          [
            representativeRecordId(this.profile, table, 0),
            representativeRecordId(this.profile, table, Math.floor(this.profile.counts[table] / 2)),
            representativeRecordId(this.profile, table, this.profile.counts[table] - 1),
          ],
        ]),
      ),
      probes,
    });
  }

  async storageEstimate(): Promise<number> {
    return this.storedBytes;
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    await this.background;
    this.database.close();
    await this.database.delete();
  }
}
