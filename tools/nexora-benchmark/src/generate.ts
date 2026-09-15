import type { ScaleCounts, ScaleProfile } from './contracts';
import { createNamespacedRandom, type NamespacedRandom } from './random';
import type { CalibrationRecord, GenerationSummary, RecordBatch, RecordTable } from './records';

export const GENERATION_ORDER = [
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
] as const satisfies readonly RecordTable[];

const DAY_MS = 86_400_000;
const TABLE_PREFIX: Record<RecordTable, string> = {
  customers: 'cus',
  contacts: 'con',
  suppliers: 'sup',
  skus: 'sku',
  salesOrders: 'ord',
  salesOrderLines: 'lin',
  stockMovements: 'mov',
  purchaseOrders: 'pur',
  invoices: 'inv',
  payments: 'pay',
  supportTickets: 'tic',
};

const STARTS = {
  master: Date.parse('2018-01-01T09:00:00.000Z'),
  catalog: Date.parse('2019-01-01T09:00:00.000Z'),
  activity: Date.parse('2022-01-01T09:00:00.000Z'),
};

const COMPANY_FIRST = [
  'Aurora',
  'Horizonte',
  'Nativa',
  'Vértice',
  'Pioneira',
  'Atlas',
  'Serra',
  'Lume',
] as const;
const COMPANY_LAST = [
  'Alimentos',
  'Engenharia',
  'Comercial',
  'Logística',
  'Tecnologia',
  'Distribuição',
  'Indústria',
  'Serviços',
] as const;
const GIVEN_NAMES = [
  'Ana',
  'Bruno',
  'Camila',
  'Diego',
  'Elisa',
  'Fábio',
  'Helena',
  'Igor',
] as const;
const FAMILY_NAMES = [
  'Almeida',
  'Costa',
  'Ferreira',
  'Lima',
  'Oliveira',
  'Pereira',
  'Santos',
  'Souza',
] as const;
const CATEGORIES = [
  'embalagens',
  'escritório',
  'ferramentas',
  'higiene',
  'elétrica',
  'segurança',
] as const;
const COUNTRIES = ['BR', 'AR', 'CL', 'MX', 'PT'] as const;
const WAREHOUSES = ['wh-sp-01', 'wh-sp-02', 'wh-mg-01', 'wh-pr-01', 'wh-pe-01'] as const;

interface GenerationContext {
  readonly profile: ScaleProfile;
  readonly demoMs: number;
  readonly random: NamespacedRandom;
  readonly idTokens: Readonly<Record<RecordTable, string>>;
}

function emptyCounts(): Record<RecordTable, number> {
  return Object.fromEntries(GENERATION_ORDER.map((table) => [table, 0])) as Record<
    RecordTable,
    number
  >;
}

function createContext(profile: ScaleProfile): GenerationContext {
  const random = createNamespacedRandom(profile.seed, 'records');
  const idTokens = Object.fromEntries(
    GENERATION_ORDER.map((table) => [
      table,
      random.fork(`ids/${table}`).integer(0, 0xffff_ffff).toString(36).padStart(7, '0'),
    ]),
  ) as Record<RecordTable, string>;
  return { profile, demoMs: Date.parse(profile.demoTime), random, idTokens };
}

function idFor(context: GenerationContext, table: RecordTable, index: number): string {
  return `${TABLE_PREFIX[table]}_${context.idTokens[table]}_${index.toString(36).padStart(7, '0')}`;
}

function iso(value: number): string {
  return new Date(value).toISOString();
}

function partitionOf(timestamp: string): string {
  return timestamp.slice(0, 7);
}

function timeline(index: number, count: number, start: number, end: number): number {
  if (count <= 1) return end;
  return Math.round(start + ((end - start) * index) / (count - 1));
}

function weightedIndex(random: NamespacedRandom, count: number): number {
  if (count <= 1) return 0;
  return Math.min(count - 1, Math.floor(Math.pow(random.nextFloat(), 2.4) * count));
}

function mix32(value: number): number {
  let mixed = value | 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x21f0_aaad);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x735a_2d97);
  return (mixed ^ (mixed >>> 15)) >>> 0;
}

function stableUnit(
  context: GenerationContext,
  namespace: RecordTable,
  index: number,
  salt: number,
): number {
  const token = Number.parseInt(context.idTokens[namespace].slice(-6), 36) >>> 0;
  return mix32(Math.imul(index + 1, 0x9e37_79b1) ^ token ^ salt) / 0x1_0000_0000;
}

function stableInteger(
  context: GenerationContext,
  namespace: RecordTable,
  index: number,
  salt: number,
  min: number,
  max: number,
): number {
  return min + Math.floor(stableUnit(context, namespace, index, salt) * (max - min + 1));
}

function stableSkewedIndex(
  context: GenerationContext,
  namespace: RecordTable,
  index: number,
  salt: number,
  count: number,
): number {
  if (count <= 1) return 0;
  return Math.min(
    count - 1,
    Math.floor(Math.pow(stableUnit(context, namespace, index, salt), 2.4) * count),
  );
}

function weightedPick<T>(random: NamespacedRandom, values: readonly [T, number][]): T {
  const roll = random.nextFloat();
  let cumulative = 0;
  for (const [value, weight] of values) {
    cumulative += weight;
    if (roll < cumulative) return value;
  }
  return values[values.length - 1]![0];
}

function activityTime(context: GenerationContext, index: number, count: number): number {
  return timeline(index, count, STARTS.activity, context.demoMs);
}

function orderTime(context: GenerationContext, index: number): number {
  return activityTime(context, index, context.profile.counts.salesOrders);
}

function orderCustomerIndex(context: GenerationContext, orderIndex: number): number {
  return stableSkewedIndex(
    context,
    'salesOrders',
    orderIndex,
    0x4355_544f,
    context.profile.counts.customers,
  );
}

function orderLineCount(context: GenerationContext, orderIndex: number): number {
  const orders = context.profile.counts.salesOrders;
  const lines = context.profile.counts.salesOrderLines;
  return Math.floor(lines / orders) + (orderIndex < lines % orders ? 1 : 0);
}

function orderLineValues(context: GenerationContext, lineIndex: number) {
  const quantity = stableInteger(context, 'salesOrderLines', lineIndex, 0x5154_5901, 1, 48);
  const unitPriceMinor = stableInteger(
    context,
    'salesOrderLines',
    lineIndex,
    0x5052_4943,
    450,
    220_000,
  );
  return {
    quantity,
    unitPriceMinor,
    lineTotalMinor: quantity * unitPriceMinor,
  };
}

function orderTotal(context: GenerationContext, orderIndex: number): number {
  let total = 0;
  const orders = context.profile.counts.salesOrders;
  for (let position = 0; position < orderLineCount(context, orderIndex); position += 1) {
    total += orderLineValues(context, orderIndex + position * orders).lineTotalMinor;
  }
  return total;
}

function invoiceTime(context: GenerationContext, index: number): number {
  const orderIndex = index % context.profile.counts.salesOrders;
  return Math.min(context.demoMs, orderTime(context, orderIndex) + (1 + (index % 8)) * DAY_MS);
}

function tableCount(counts: ScaleCounts, table: RecordTable): number {
  return counts[table];
}

function makeRecord(
  context: GenerationContext,
  table: RecordTable,
  index: number,
  random: NamespacedRandom,
): CalibrationRecord {
  const id = idFor(context, table, index);

  switch (table) {
    case 'customers': {
      const createdAt = iso(
        timeline(index, context.profile.counts.customers, STARTS.master, STARTS.catalog),
      );
      const name = `${random.pick(COMPANY_FIRST)} ${random.pick(COMPANY_LAST)} ${index + 1}`;
      return {
        table,
        id,
        partition: partitionOf(createdAt),
        createdAt,
        joinedAt: createdAt,
        name,
        segment: weightedPick(random, [
          ['enterprise', 0.12],
          ['mid-market', 0.38],
          ['small-business', 0.5],
        ]),
        status: weightedPick(random, [
          ['active', 0.84],
          ['at-risk', 0.1],
          ['inactive', 0.06],
        ]),
        creditLimitMinor: random.integer(2_000, 800_000) * 100,
        currentBalanceMinor: random.integer(0, 280_000) * 100,
        searchText: `${name} relacionamento comercial conta corporativa`,
      };
    }
    case 'contacts': {
      const customerIndex = index % context.profile.counts.customers;
      const createdAt = iso(
        timeline(index, context.profile.counts.contacts, STARTS.catalog, STARTS.activity),
      );
      const name = `${random.pick(GIVEN_NAMES)} ${random.pick(FAMILY_NAMES)}`;
      return {
        table,
        id,
        partition: partitionOf(createdAt),
        createdAt,
        customerId: idFor(context, 'customers', customerIndex),
        name,
        email: `${name.toLowerCase().replaceAll(' ', '.')}.${index}@example.test`,
        role: random.pick(['buyer', 'finance', 'operations', 'executive'] as const),
        phone: `+55 11 9${random.integer(1000, 9999)}-${random.integer(1000, 9999)}`,
      };
    }
    case 'suppliers': {
      const createdAt = iso(
        timeline(index, context.profile.counts.suppliers, STARTS.master, STARTS.catalog),
      );
      const name = `${random.pick(COMPANY_FIRST)} ${random.pick(COMPANY_LAST)} Fornecedora ${index + 1}`;
      return {
        table,
        id,
        partition: partitionOf(createdAt),
        createdAt,
        name,
        status: weightedPick(random, [
          ['approved', 0.9],
          ['probation', 0.07],
          ['inactive', 0.03],
        ]),
        country: random.pick(COUNTRIES),
        paymentTermsDays: random.pick([15, 21, 28, 30, 45, 60] as const),
        searchText: `${name} suprimentos compras abastecimento`,
      };
    }
    case 'skus': {
      const createdAt = iso(
        timeline(index, context.profile.counts.skus, STARTS.catalog, STARTS.activity),
      );
      const category = random.pick(CATEGORIES);
      const unitCostMinor = random.integer(250, 180_000);
      return {
        table,
        id,
        partition: partitionOf(createdAt),
        createdAt,
        code: `NX-${(index + 1).toString().padStart(7, '0')}`,
        name: `${category} profissional ${index + 1}`,
        category,
        status: weightedPick(random, [
          ['active', 0.91],
          ['discontinued', 0.04],
          ['backorder', 0.05],
        ]),
        unitPriceMinor: Math.round(unitCostMinor * (1.22 + random.nextFloat() * 0.7)),
        unitCostMinor,
        leadTimeDays: random.integer(1, 75),
        description: `Item ${index + 1} da linha ${category}, especificação comercial completa para busca e separação.`,
      };
    }
    case 'salesOrders': {
      const placedAt = iso(activityTime(context, index, context.profile.counts.salesOrders));
      const customerIndex = orderCustomerIndex(context, index);
      return {
        table,
        id,
        partition: partitionOf(placedAt),
        createdAt: placedAt,
        customerId: idFor(context, 'customers', customerIndex),
        status: weightedPick(random, [
          ['draft', 0.03],
          ['confirmed', 0.11],
          ['picking', 0.08],
          ['shipped', 0.74],
          ['cancelled', 0.04],
        ]),
        placedAt,
        totalMinor: orderTotal(context, index),
        currency: 'BRL',
        lineCount: orderLineCount(context, index),
        channel: random.pick(['portal', 'sales', 'marketplace'] as const),
        notes: `Pedido comercial ${index + 1} com instruções de entrega, faturamento e conferência.`,
      };
    }
    case 'salesOrderLines': {
      const orderIndex = index % context.profile.counts.salesOrders;
      const createdAt = iso(orderTime(context, orderIndex));
      const skuIndex = stableSkewedIndex(
        context,
        'salesOrderLines',
        index,
        0x534b_5501,
        context.profile.counts.skus,
      );
      const values = orderLineValues(context, index);
      return {
        table,
        id,
        partition: partitionOf(createdAt),
        createdAt,
        orderId: idFor(context, 'salesOrders', orderIndex),
        skuId: idFor(context, 'skus', skuIndex),
        ...values,
        description: `Linha ${index + 1} com condições comerciais e referência operacional.`,
      };
    }
    case 'stockMovements': {
      const occurredAt = iso(activityTime(context, index, context.profile.counts.stockMovements));
      const skuIndex = weightedIndex(random, context.profile.counts.skus);
      return {
        table,
        id,
        partition: partitionOf(occurredAt),
        createdAt: occurredAt,
        skuId: idFor(context, 'skus', skuIndex),
        warehouseId: random.pick(WAREHOUSES),
        type: weightedPick(random, [
          ['receipt', 0.22],
          ['allocation', 0.25],
          ['shipment', 0.4],
          ['adjustment', 0.08],
          ['return', 0.05],
        ]),
        occurredAt,
        quantity: random.integer(1, 180),
        reference: `MOV-${partitionOf(occurredAt).replace('-', '')}-${index + 1}`,
      };
    }
    case 'purchaseOrders': {
      const orderedAtMs = activityTime(context, index, context.profile.counts.purchaseOrders);
      const orderedAt = iso(orderedAtMs);
      const expectedAt = iso(
        Math.min(context.demoMs, orderedAtMs + random.integer(3, 45) * DAY_MS),
      );
      return {
        table,
        id,
        partition: partitionOf(orderedAt),
        createdAt: orderedAt,
        supplierId: idFor(
          context,
          'suppliers',
          weightedIndex(random, context.profile.counts.suppliers),
        ),
        status: weightedPick(random, [
          ['draft', 0.04],
          ['issued', 0.12],
          ['partially-received', 0.09],
          ['received', 0.72],
          ['cancelled', 0.03],
        ]),
        orderedAt,
        expectedAt,
        totalMinor: random.integer(25_000, 8_000_000),
        buyerName: `${random.pick(GIVEN_NAMES)} ${random.pick(FAMILY_NAMES)}`,
      };
    }
    case 'invoices': {
      const orderIndex = index % context.profile.counts.salesOrders;
      const issuedAt = iso(invoiceTime(context, index));
      const customerIndex = orderCustomerIndex(context, orderIndex);
      const totalMinor = orderTotal(context, orderIndex);
      const status =
        index < context.profile.counts.payments
          ? ('paid' as const)
          : weightedPick(random, [
              ['open', 0.68],
              ['overdue', 0.27],
              ['void', 0.05],
            ] as const);
      return {
        table,
        id,
        partition: partitionOf(issuedAt),
        createdAt: issuedAt,
        orderId: idFor(context, 'salesOrders', orderIndex),
        customerId: idFor(context, 'customers', customerIndex),
        status,
        issuedAt,
        dueAt: iso(
          Math.min(
            context.demoMs,
            Date.parse(issuedAt) + random.pick([14, 21, 28, 30, 45]) * DAY_MS,
          ),
        ),
        totalMinor,
        balanceMinor: status === 'paid' || status === 'void' ? 0 : totalMinor,
        documentNumber: `NF-${(index + 1).toString().padStart(9, '0')}`,
      };
    }
    case 'payments': {
      const invoiceIndex = index % context.profile.counts.invoices;
      const orderIndex = invoiceIndex % context.profile.counts.salesOrders;
      const customerIndex = orderCustomerIndex(context, orderIndex);
      const receivedAt = iso(
        Math.min(context.demoMs, invoiceTime(context, invoiceIndex) + (1 + (index % 30)) * DAY_MS),
      );
      return {
        table,
        id,
        partition: partitionOf(receivedAt),
        createdAt: receivedAt,
        invoiceId: idFor(context, 'invoices', invoiceIndex),
        customerId: idFor(context, 'customers', customerIndex),
        receivedAt,
        amountMinor: orderTotal(context, orderIndex),
        method: random.pick(['pix', 'bank-transfer', 'card', 'boleto'] as const),
        reconciliationReference: `REC-${partitionOf(receivedAt).replace('-', '')}-${index + 1}`,
      };
    }
    case 'supportTickets': {
      const createdAt = iso(activityTime(context, index, context.profile.counts.supportTickets));
      const customerIndex = weightedIndex(random, context.profile.counts.customers);
      return {
        table,
        id,
        partition: partitionOf(createdAt),
        createdAt,
        customerId: idFor(context, 'customers', customerIndex),
        priority: weightedPick(random, [
          ['low', 0.18],
          ['normal', 0.58],
          ['high', 0.2],
          ['urgent', 0.04],
        ]),
        status: weightedPick(random, [
          ['open', 0.12],
          ['waiting-customer', 0.09],
          ['resolved', 0.34],
          ['closed', 0.45],
        ]),
        subject: `Atendimento ${index + 1}: dúvida sobre pedido, entrega ou cobrança`,
        messageCount: random.integer(1, 18),
        summary: `Histórico resumido do atendimento ${index + 1}, com contexto suficiente para busca e triagem operacional.`,
      };
    }
  }
}

export function* generateCalibrationBatches(
  profile: ScaleProfile,
  batchSize: number,
): Generator<RecordBatch, GenerationSummary> {
  if (!Number.isSafeInteger(batchSize) || batchSize <= 0) {
    throw new RangeError(`Batch size must be a positive safe integer, received ${batchSize}`);
  }
  const demoMs = Date.parse(profile.demoTime);
  if (!Number.isFinite(demoMs)) throw new RangeError(`Invalid demo time: ${profile.demoTime}`);

  const context = createContext(profile);
  const counts = emptyCounts();
  let maxBatchSize = 0;
  let firstMs = Number.POSITIVE_INFINITY;
  let lastMs = Number.NEGATIVE_INFINITY;

  for (const table of GENERATION_ORDER) {
    const random = context.random.fork(`table/${table}`);
    let pending: CalibrationRecord[] = [];
    let pendingPartition = '';
    const flush = (): RecordBatch | undefined => {
      if (pending.length === 0) return undefined;
      const batch = { table, partition: pendingPartition, records: pending } satisfies RecordBatch;
      maxBatchSize = Math.max(maxBatchSize, pending.length);
      pending = [];
      return batch;
    };

    for (let index = 0; index < tableCount(profile.counts, table); index += 1) {
      const record = makeRecord(context, table, index, random);
      if (
        pending.length > 0 &&
        (pending.length === batchSize || record.partition !== pendingPartition)
      ) {
        const batch = flush();
        if (batch) yield batch;
      }
      if (pending.length === 0) pendingPartition = record.partition;
      pending.push(record);
      counts[table] += 1;
      const timestamp = Date.parse(record.createdAt);
      firstMs = Math.min(firstMs, timestamp);
      lastMs = Math.max(lastMs, timestamp);
    }

    const batch = flush();
    if (batch) yield batch;
  }

  return {
    counts,
    maxBatchSize,
    firstTimestamp: Number.isFinite(firstMs) ? iso(firstMs) : profile.demoTime,
    lastTimestamp: Number.isFinite(lastMs) ? iso(lastMs) : profile.demoTime,
  };
}
