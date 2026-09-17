import { describe, expect, it } from 'vitest';
import { PERMISSION_CATALOG, ROLE_GRANTS, ROLE_NAMES, permissionArea } from './index';

describe('catalog', () => {
  it('has the 107 permissions of §55.4, unique', () => {
    expect(new Set(PERMISSION_CATALOG).size).toBe(PERMISSION_CATALOG.length);
    expect(PERMISSION_CATALOG.length).toBe(107);
    expect(permissionArea('orders.approve')).toBe('sales');
    expect(permissionArea('audit.export')).toBe('administration');
  });
});

describe('roles', () => {
  it('has the 13 roles of §55.5 and grants only catalog permissions', () => {
    expect(ROLE_NAMES.length).toBe(13);
    for (const name of ROLE_NAMES) {
      for (const grant of ROLE_GRANTS[name]) expect(PERMISSION_CATALOG).toContain(grant.permission);
    }
  });
  it('gives Administrator everything and Auditor nothing mutable', () => {
    expect(ROLE_GRANTS['Administrator'].length).toBe(PERMISSION_CATALOG.length);
    const auditor = ROLE_GRANTS['Auditor'].map((g) => g.permission);
    expect(auditor).toContain('audit.export');
    expect(auditor.filter((p) => /\.(create|edit|manage|approve|record|adjust)/.test(p))).toEqual([]);
  });
  it('lets a Warehouse Operator ship but not adjust', () => {
    const operator = ROLE_GRANTS['Warehouse Operator'].map((g) => g.permission);
    expect(operator).toContain('shipments.ship');
    expect(operator).not.toContain('inventory.adjust');
    expect(ROLE_GRANTS['Warehouse Operator'].every((g) => g.defaultScope === 'warehouse')).toBe(true);
  });
});
