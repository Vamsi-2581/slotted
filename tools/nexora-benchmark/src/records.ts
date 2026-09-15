/**
 * Storage-pressure models for the Nexora materialization laboratory.
 *
 * These shapes deliberately resemble the indexed fields, relationships, and serialized
 * payload sizes described by the product domain. They are calibration fixtures, not Nexora
 * business entities: values such as totals, balances, and statuses are representative and do
 * not claim to implement the product's accounting, inventory, or support rules.
 */

export type RecordTable =
  | 'customers'
  | 'contacts'
  | 'suppliers'
  | 'skus'
  | 'salesOrders'
  | 'salesOrderLines'
  | 'stockMovements'
  | 'purchaseOrders'
  | 'invoices'
  | 'payments'
  | 'supportTickets';

interface BaseRecord<TTable extends RecordTable> {
  readonly table: TTable;
  readonly id: string;
  readonly partition: string;
  readonly createdAt: string;
}

export interface CustomerRecord extends BaseRecord<'customers'> {
  readonly name: string;
  readonly segment: 'enterprise' | 'mid-market' | 'small-business';
  readonly status: 'active' | 'at-risk' | 'inactive';
  readonly joinedAt: string;
  readonly creditLimitMinor: number;
  readonly currentBalanceMinor: number;
  readonly searchText: string;
}

export interface ContactRecord extends BaseRecord<'contacts'> {
  readonly customerId: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'buyer' | 'finance' | 'operations' | 'executive';
  readonly phone: string;
}

export interface SupplierRecord extends BaseRecord<'suppliers'> {
  readonly name: string;
  readonly status: 'approved' | 'probation' | 'inactive';
  readonly country: string;
  readonly paymentTermsDays: number;
  readonly searchText: string;
}

export interface SkuRecord extends BaseRecord<'skus'> {
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly status: 'active' | 'discontinued' | 'backorder';
  readonly unitPriceMinor: number;
  readonly unitCostMinor: number;
  readonly leadTimeDays: number;
  readonly description: string;
}

export interface SalesOrderRecord extends BaseRecord<'salesOrders'> {
  readonly customerId: string;
  readonly status: 'draft' | 'confirmed' | 'picking' | 'shipped' | 'cancelled';
  readonly placedAt: string;
  readonly totalMinor: number;
  readonly currency: 'BRL';
  readonly lineCount: number;
  readonly channel: 'portal' | 'sales' | 'marketplace';
  readonly notes: string;
}

export interface SalesOrderLineRecord extends BaseRecord<'salesOrderLines'> {
  readonly orderId: string;
  readonly skuId: string;
  readonly quantity: number;
  readonly unitPriceMinor: number;
  readonly lineTotalMinor: number;
  readonly description: string;
}

export interface StockMovementRecord extends BaseRecord<'stockMovements'> {
  readonly skuId: string;
  readonly warehouseId: string;
  readonly type: 'receipt' | 'allocation' | 'shipment' | 'adjustment' | 'return';
  readonly occurredAt: string;
  readonly quantity: number;
  readonly reference: string;
}

export interface PurchaseOrderRecord extends BaseRecord<'purchaseOrders'> {
  readonly supplierId: string;
  readonly status: 'draft' | 'issued' | 'partially-received' | 'received' | 'cancelled';
  readonly orderedAt: string;
  readonly expectedAt: string;
  readonly totalMinor: number;
  readonly buyerName: string;
}

export interface InvoiceRecord extends BaseRecord<'invoices'> {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: 'open' | 'overdue' | 'paid' | 'void';
  readonly issuedAt: string;
  readonly dueAt: string;
  readonly totalMinor: number;
  readonly balanceMinor: number;
  readonly documentNumber: string;
}

export interface PaymentRecord extends BaseRecord<'payments'> {
  readonly invoiceId: string;
  readonly customerId: string;
  readonly receivedAt: string;
  readonly amountMinor: number;
  readonly method: 'pix' | 'bank-transfer' | 'card' | 'boleto';
  readonly reconciliationReference: string;
}

export interface SupportTicketRecord extends BaseRecord<'supportTickets'> {
  readonly customerId: string;
  readonly priority: 'low' | 'normal' | 'high' | 'urgent';
  readonly status: 'open' | 'waiting-customer' | 'resolved' | 'closed';
  readonly subject: string;
  readonly messageCount: number;
  readonly summary: string;
}

export type CalibrationRecord =
  | CustomerRecord
  | ContactRecord
  | SupplierRecord
  | SkuRecord
  | SalesOrderRecord
  | SalesOrderLineRecord
  | StockMovementRecord
  | PurchaseOrderRecord
  | InvoiceRecord
  | PaymentRecord
  | SupportTicketRecord;

export interface RecordBatch {
  readonly table: RecordTable;
  readonly partition: string;
  readonly records: readonly CalibrationRecord[];
}

export interface GenerationSummary {
  readonly counts: Readonly<Record<RecordTable, number>>;
  readonly maxBatchSize: number;
  readonly firstTimestamp: string;
  readonly lastTimestamp: string;
}
