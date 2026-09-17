import type { PermissionGrant } from '../identity';
import { PERMISSION_CATALOG, permissionArea, type Permission, type PermissionArea } from './catalog';

export const ROLE_NAMES = [
  'Administrator', 'Executive', 'Sales Manager', 'Sales Representative', 'Finance Manager', 'Accountant',
  'Procurement Manager', 'Buyer', 'Warehouse Manager', 'Warehouse Operator', 'Support Manager',
  'Support Agent', 'Auditor',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

type Scope = PermissionGrant['defaultScope'];

const grant = (permissions: readonly Permission[], scope: Scope = 'all'): PermissionGrant[] =>
  permissions.map((permission) => ({ permission, defaultScope: scope }));

const area = (...areas: PermissionArea[]): Permission[] =>
  PERMISSION_CATALOG.filter((p) => areas.includes(permissionArea(p)));

const readOnly = (permissions: readonly Permission[]): Permission[] =>
  permissions.filter((p) => /\.(view|dashboard|credit_view)$/.test(p));

const ALL: Permission[] = [...PERMISSION_CATALOG];
const EVERY_VIEW = readOnly(ALL);

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  Administrator: 'Every permission, every scope.',
  Executive: 'Reads all business data, dashboards and the audit log.',
  'Sales Manager': 'Runs CRM and sales, approves quotes and orders.',
  'Sales Representative': 'Works customers, quotes and orders for an assigned team.',
  'Finance Manager': 'Owns receivables, credit and finance approvals.',
  Accountant: 'Records invoices, payments and reconciliation.',
  'Procurement Manager': 'Manages suppliers and approves purchase orders.',
  Buyer: 'Creates and sends purchase orders.',
  'Warehouse Manager': 'Runs inventory and fulfillment for assigned warehouses.',
  'Warehouse Operator': 'Picks, packs, ships and receives in assigned warehouses.',
  'Support Manager': 'Runs support and reads related records.',
  'Support Agent': 'Answers tickets and reads related records.',
  Auditor: 'Reads everything and exports the audit log.',
};

export const ROLE_GRANTS: Record<RoleName, readonly PermissionGrant[]> = {
  Administrator: grant(ALL),
  Executive: grant([...new Set([...EVERY_VIEW, 'analytics.view', 'finance.dashboard', 'audit.view'] as Permission[])]),
  'Sales Manager': grant([
    ...area('crm').filter((p) => p !== 'customers.credit_edit'), 'catalog.view', 'pricing.view',
    ...area('sales'), 'inventory.view', 'shipments.view', 'invoices.view', 'support.view', 'analytics.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Sales Representative': [
    ...grant(['customers.view', 'contacts.view', 'notes.view', 'catalog.view', 'pricing.view', 'quotes.view',
      'orders.view', 'inventory.view', 'shipments.view', 'invoices.view', 'support.view', 'analytics.view',
      'customers.credit_view', 'notifications.manage_own', 'saved_views.manage_own']),
    ...grant(['customers.create', 'customers.edit', 'contacts.manage', 'notes.create', 'quotes.create',
      'quotes.edit', 'quotes.send', 'quotes.convert', 'orders.create', 'orders.edit_draft', 'orders.submit'], 'team'),
  ],
  'Finance Manager': grant([
    ...area('finance'), 'customers.view', 'customers.credit_view', 'customers.credit_edit', 'contacts.view',
    'orders.view', 'orders.approve', 'orders.hold', 'orders.release_hold', 'quotes.view', 'analytics.view',
    'audit.view', 'notifications.manage_own', 'saved_views.manage_own',
  ]),
  Accountant: grant([
    'finance.dashboard', 'invoices.view', 'invoices.create', 'invoices.edit_draft', 'invoices.open', 'invoices.send',
    'payments.view', 'payments.record', 'payments.reverse', 'credit_memos.view', 'credit_memos.create',
    'reconciliation.view', 'reconciliation.manage', 'customers.view', 'customers.credit_view', 'orders.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Procurement Manager': grant([
    ...area('procurement'), 'inventory.view', 'catalog.view', 'cost.view', 'analytics.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  Buyer: grant([
    'suppliers.view', 'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.edit',
    'purchase_orders.submit', 'purchase_orders.send', 'receipts.view', 'inventory.view', 'catalog.view',
    'cost.view', 'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Warehouse Manager': grant([...area('inventory'), 'catalog.view', 'orders.view', 'purchase_orders.view',
    'receipts.view', 'receipts.create', 'notifications.manage_own', 'saved_views.manage_own'], 'warehouse'),
  'Warehouse Operator': grant([
    'inventory.view', 'shipments.view', 'shipments.pick', 'shipments.pack', 'shipments.ship',
    'receipts.view', 'receipts.create', 'returns.view', 'returns.receive', 'inventory.cycle_count',
    'catalog.view', 'orders.view', 'notifications.manage_own',
  ], 'warehouse'),
  'Support Manager': grant([
    ...area('support'), 'customers.view', 'contacts.view', 'orders.view', 'invoices.view', 'catalog.view',
    'shipments.view', 'analytics.view', 'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Support Agent': grant([
    'support.view', 'support.create', 'support.reply', 'support.change_status', 'support.escalate',
    'customers.view', 'contacts.view', 'orders.view', 'invoices.view', 'catalog.view', 'shipments.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  Auditor: grant([...EVERY_VIEW, 'audit.export']),
};
