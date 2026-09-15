import { describe, expect, it } from 'vitest';

import { SCALE_PROFILES } from './profiles';

describe('Nexora calibration scale profiles', () => {
  it('preserves every canonical mature-data count', () => {
    expect(SCALE_PROFILES.canonical.counts).toEqual({
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
    });
  });

  it('applies Enterprise multipliers only to their declared families', () => {
    expect(SCALE_PROFILES.enterprise.counts).toEqual({
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
    });
  });
});
