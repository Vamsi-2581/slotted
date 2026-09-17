import Dexie, { type Table } from 'dexie';

import type {
  ProbeName,
  ProbeResult,
  ReadinessState,
  ScaleProfile,
  StrategyName,
} from '../contracts';
import { digestValue } from '../digest';
import {
  calibrationRecordAt,
  generateCalibrationTableBatches,
  GENERATION_ORDER,
  representativeRecordId,
  scanStockMovementLocatorBatches,
} from '../generate';
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

export async function executeVirtualProbe(
  profile: ScaleProfile,
  name: ProbeName,
  batchSize = 512,
  onBatch?: StrategyObserver['onBatch'],
): Promise<ProbeResult> {
  const customerId = representativeRecordId(profile, 'customers', 0);
  const skuId = representativeRecordId(profile, 'skus', 0);
  const yieldEveryBatches = batchSize <= 4 ? 8 : batchSize <= 8 ? 64 : 256;
  let batchesSinceYield = 0;
  const observe = async (records: number, started: number): Promise<void> => {
    onBatch?.({ records, durationMs: now() - started });
    batchesSinceYield += 1;
    if (batchesSinceYield === yieldEveryBatches) {
      batchesSinceYield = 0;
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  };

  if (name === 'orders-page') {
    const orders: SalesOrderRecord[] = [];
    let chunkRecords = 0;
    let chunkStarted = now();
    for (let index = profile.counts.salesOrders - 1; index >= 0 && orders.length < 50; index -= 1) {
      const order = calibrationRecordAt(profile, 'salesOrders', index) as SalesOrderRecord;
      chunkRecords += 1;
      if (order.status === 'shipped') orders.push(order);
      if (chunkRecords === batchSize) {
        await observe(chunkRecords, chunkStarted);
        chunkRecords = 0;
        chunkStarted = now();
      }
    }
    if (chunkRecords > 0) await observe(chunkRecords, chunkStarted);
    return completeResult(
      name,
      orders.map((record) => record.id),
      profile.counts.salesOrders,
    );
  }

  if (name === 'historical-point-lookup') {
    const started = now();
    const historical = calibrationRecordAt(
      profile,
      'stockMovements',
      Math.floor(profile.counts.stockMovements / 2),
    ) as StockMovementRecord;
    await observe(1, started);
    return completeResult(name, [historical.id], 1);
  }

  if (name === 'inventory-ledger') {
    const matchingIndices: number[] = [];
    let matchingCount = 0;
    const batches = scanStockMovementLocatorBatches(profile, skuId, 'wh-sp-01', 512);
    for (;;) {
      const started = now();
      const next = batches.next();
      if (next.done) break;
      matchingCount += next.value.matchingIndices.length;
      for (const index of next.value.matchingIndices) {
        matchingIndices.push(index);
        if (matchingIndices.length > 50) matchingIndices.shift();
      }
      onBatch?.({ records: next.value.scannedRecords, durationMs: now() - started });
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    const visible = matchingIndices
      .reverse()
      .map(
        (index) =>
          (calibrationRecordAt(profile, 'stockMovements', index) as StockMovementRecord).id,
      );
    return completeResult(name, visible, matchingCount);
  }

  const customer =
    name === 'customer-360'
      ? (calibrationRecordAt(profile, 'customers', 0) as CustomerRecord)
      : undefined;
  const customerRelated: CalibrationRecord[] = [];
  let customerRelatedCount = 0;
  let invoiceCount = 0;
  let paymentCount = 0;
  let invoiceTotal = 0;
  let invoiceBalance = 0;
  let paymentTotal = 0;
  const tables: readonly RecordTable[] =
    name === 'customer-360'
      ? ['contacts', 'salesOrders', 'supportTickets']
      : ['invoices', 'payments'];

  for (const table of tables) {
    const batches = generateCalibrationTableBatches(profile, table, batchSize);
    for (;;) {
      const started = now();
      const next = batches.next();
      if (next.done) break;
      const batch = next.value;
      for (const record of batch.records) {
        if (name === 'customer-360') {
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
      }
      await observe(batch.records.length, started);
    }
  }

  switch (name) {
    case 'customer-360': {
      return completeResult(
        name,
        customer
          ? [customer.id, ...customerRelated.slice(0, 49).map((record) => record.id)]
          : customerRelated.slice(0, 50).map((record) => record.id),
        (customer ? 1 : 0) + customerRelatedCount,
      );
    }
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
  private backgroundError: unknown;
  private storedBytes = 0;
  private readonly storedAuxiliaryBytes = new Map<string, number>();
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
    await this.writeMetadata('strategy', this.name);
    await this.writeMetadata('profile', this.profile.id);
    this.observer.onReadiness(this.snapshot());
  }

  protected async writeMetadata(key: string, value: string): Promise<void> {
    const row = { key, value };
    await this.database.metadata.put(row);
    this.trackAuxiliaryRow(`metadata:${key}`, row);
  }

  private trackAuxiliaryRow(key: string, row: MetadataRow | PartitionRow): void {
    const bytes = JSON.stringify(row).length;
    this.storedBytes += bytes - (this.storedAuxiliaryBytes.get(key) ?? 0);
    this.storedAuxiliaryBytes.set(key, bytes);
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
    if (this.state === 'failed' && this.backgroundError !== undefined) {
      throw this.backgroundError instanceof Error
        ? this.backgroundError
        : new Error(String(this.backgroundError));
    }
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
    const partitionRow = {
      id: partitionId,
      table: batch.table,
      partition: batch.partition,
      records: partitionCount,
    };
    const partitionWrite = this.database.partitions.put(partitionRow);
    blockingDurationMs = Math.max(blockingDurationMs, now() - finalizeStarted);
    await partitionWrite;
    this.trackAuxiliaryRow(`partition:${partitionId}`, partitionRow);
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
    this.background = execution.catch((error: unknown) => {
      this.backgroundError = error;
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
