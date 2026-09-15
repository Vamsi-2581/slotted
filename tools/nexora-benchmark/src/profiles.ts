import type { ScaleCounts, ScaleProfile } from './contracts';

const SEED = 'nexora-calibration-v1';
const DEMO_TIME = '2026-09-15T15:00:00.000Z';

function profile(id: ScaleProfile['id'], counts: ScaleCounts): ScaleProfile {
  return Object.freeze({
    id,
    seed: SEED,
    demoTime: DEMO_TIME,
    counts: Object.freeze(counts),
  });
}

export const SCALE_PROFILES = Object.freeze({
  smoke: profile('smoke', {
    customers: 64,
    contacts: 128,
    suppliers: 32,
    skus: 256,
    salesOrders: 400,
    salesOrderLines: 1_200,
    stockMovements: 3_000,
    purchaseOrders: 100,
    invoices: 240,
    payments: 180,
    supportTickets: 120,
  }),
  canonical: profile('canonical', {
    customers: 4_800,
    contacts: 11_000,
    suppliers: 1_200,
    skus: 18_000,
    salesOrders: 80_000,
    salesOrderLines: 250_000,
    stockMovements: 600_000,
    purchaseOrders: 15_000,
    invoices: 45_000,
    payments: 35_000,
    supportTickets: 20_000,
  }),
  enterprise: profile('enterprise', {
    customers: 19_200,
    contacts: 44_000,
    suppliers: 1_200,
    skus: 54_000,
    salesOrders: 400_000,
    salesOrderLines: 1_250_000,
    stockMovements: 3_000_000,
    purchaseOrders: 75_000,
    invoices: 225_000,
    payments: 175_000,
    supportTickets: 100_000,
  }),
});
