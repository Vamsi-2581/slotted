/**
 * Shared value types from sections 53 and 89.1 of the Nexora domain contract.
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

/** Integer minor units (cents for the three supported currencies). */
export interface Money {
  readonly currency: CurrencyCode;
  readonly minor: number;
}

/** Decimal string with at most 3 fractional digits. */
export type Quantity = string;
/** Same precision rules as `Quantity`; may be negative. */
export type SignedQuantity = string;

export type UnitOfMeasure = 'EA' | 'PK' | 'FT' | 'M' | 'KG';
export type QuantityPrecision = 0 | 1 | 2 | 3;

export type PaymentTermsCode = 'DUE_ON_RECEIPT' | 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60';

export type CustomerSegment = 'smb' | 'mid_market' | 'enterprise' | 'strategic';

export type OrderRiskFlag =
  | 'credit_limit_exceeded'
  | 'low_margin'
  | 'high_discount'
  | 'inventory_shortage'
  | 'requested_date_at_risk'
  | 'customer_on_hold'
  | 'overdue_receivables';

export interface EntityMetadata {
  id: string;
  organizationId: string;
  /** UTC ISO-8601 instant. */
  createdAt: string;
  /** User id or system actor id. */
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  /** Starts at 1 and increments after every successful mutation. */
  version: number;
  archivedAt?: string;
}

export interface AddressSnapshot {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
}

export type PermissionScope =
  | { type: 'all' }
  | { type: 'own' }
  | { type: 'team'; teamIds: string[] }
  | { type: 'warehouse'; warehouseIds: string[] };

export interface TaxProfile {
  type: 'taxable' | 'exempt';
  exemptionReason?: string;
}

export const ORGANIZATION_ID = 'org_000001';
export const SYSTEM_ACTOR_ID = 'usr_system';
export const AUTOMATION_ACTOR_ID = 'usr_system_automation';
export const ORGANIZATION_TIMEZONE = 'America/Chicago';
export const CANONICAL_SEED_INSTANT = '2026-09-04T15:00:00Z';
export const SEED_VERSION = 'nexora-v1';
export const SCHEMA_VERSION = 1;
