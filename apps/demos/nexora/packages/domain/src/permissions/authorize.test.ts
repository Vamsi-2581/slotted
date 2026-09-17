import { describe, expect, it } from 'vitest';
import { authorize, type AuthorizationInput } from './index';

const base: AuthorizationInput = {
  userId: 'usr_000004',
  permissions: ['orders.view', 'orders.edit_draft', 'inventory.view'],
  scopes: {
    'orders.view': [{ type: 'all' }],
    'orders.edit_draft': [{ type: 'own' }, { type: 'team', teamIds: ['tem_000001'] }],
    'inventory.view': [{ type: 'warehouse', warehouseIds: ['wh_000001'] }],
  },
};

describe('authorize', () => {
  it('denies a permission the session does not hold', () => {
    expect(authorize(base, 'orders.approve')).toEqual({ allowed: false, reason: 'missing' });
  });
  it('allows without a resource when the permission is held', () => {
    expect(authorize(base, 'orders.edit_draft')).toEqual({ allowed: true });
  });
  it('covers own and team resources', () => {
    expect(authorize(base, 'orders.edit_draft', { ownerId: 'usr_000004' })).toEqual({ allowed: true });
    expect(authorize(base, 'orders.edit_draft', { ownerId: 'usr_000009', teamIds: ['tem_000001'] })).toEqual({ allowed: true });
    expect(authorize(base, 'orders.edit_draft', { ownerId: 'usr_000009', teamIds: ['tem_000002'] })).toEqual({ allowed: false, reason: 'scope' });
  });
  it('covers the warehouse scope', () => {
    expect(authorize(base, 'inventory.view', { warehouseId: 'wh_000001' })).toEqual({ allowed: true });
    expect(authorize(base, 'inventory.view', { warehouseId: 'wh_000002' })).toEqual({ allowed: false, reason: 'scope' });
  });
  it('treats all as covering anything', () => {
    expect(authorize(base, 'orders.view', { warehouseId: 'wh_000005', ownerId: 'x' })).toEqual({ allowed: true });
  });
});
