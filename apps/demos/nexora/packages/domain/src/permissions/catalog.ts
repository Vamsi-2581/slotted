export const PERMISSION_CATALOG = [
  // organization and identity
  'organization.view', 'organization.edit', 'users.view', 'users.invite', 'users.edit', 'users.suspend',
  'teams.view', 'teams.manage', 'roles.view', 'roles.manage',
  // crm
  'customers.view', 'customers.create', 'customers.edit', 'customers.archive', 'customers.export',
  'customers.credit_view', 'customers.credit_edit', 'contacts.view', 'contacts.manage',
  'notes.view', 'notes.create', 'notes.delete_own',
  // catalog
  'catalog.view', 'catalog.manage', 'pricing.view', 'pricing.manage', 'cost.view',
  // sales
  'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.send', 'quotes.approve', 'quotes.convert',
  'orders.view', 'orders.create', 'orders.edit_draft', 'orders.edit_confirmed', 'orders.submit',
  'orders.approve', 'orders.hold', 'orders.release_hold', 'orders.cancel', 'orders.override_price', 'orders.export',
  // inventory and fulfillment
  'inventory.view', 'inventory.allocate', 'inventory.deallocate', 'inventory.adjust', 'inventory.transfer',
  'inventory.cycle_count', 'shipments.view', 'shipments.create', 'shipments.pick', 'shipments.pack',
  'shipments.ship', 'shipments.mark_delivered', 'returns.view', 'returns.create', 'returns.authorize',
  'returns.receive', 'returns.inspect',
  // procurement
  'suppliers.view', 'suppliers.manage', 'purchase_orders.view', 'purchase_orders.create',
  'purchase_orders.edit', 'purchase_orders.submit', 'purchase_orders.approve', 'purchase_orders.send',
  'purchase_orders.cancel', 'receipts.view', 'receipts.create',
  // finance
  'finance.dashboard', 'invoices.view', 'invoices.create', 'invoices.edit_draft', 'invoices.open',
  'invoices.send', 'invoices.void', 'invoices.write_off', 'payments.view', 'payments.record',
  'payments.reverse', 'credit_memos.view', 'credit_memos.create', 'credit_memos.open', 'refunds.create',
  'reconciliation.view', 'reconciliation.manage',
  // support
  'support.view', 'support.create', 'support.reply', 'support.assign', 'support.change_status',
  'support.escalate', 'support.manage',
  // workflow and administration
  'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.activate', 'workflows.archive',
  'analytics.view', 'audit.view', 'audit.export', 'notifications.manage_own', 'saved_views.manage_own',
  'imports.run',
] as const;

export type Permission = (typeof PERMISSION_CATALOG)[number];

export type PermissionArea =
  | 'identity' | 'crm' | 'catalog' | 'sales' | 'inventory' | 'procurement' | 'finance' | 'support' | 'administration';

const AREA_BY_PREFIX: Record<string, PermissionArea> = {
  organization: 'identity', users: 'identity', teams: 'identity', roles: 'identity',
  customers: 'crm', contacts: 'crm', notes: 'crm',
  catalog: 'catalog', pricing: 'catalog', cost: 'catalog',
  quotes: 'sales', orders: 'sales',
  inventory: 'inventory', shipments: 'inventory', returns: 'inventory',
  suppliers: 'procurement', purchase_orders: 'procurement', receipts: 'procurement',
  finance: 'finance', invoices: 'finance', payments: 'finance', credit_memos: 'finance', refunds: 'finance', reconciliation: 'finance',
  support: 'support',
  workflows: 'administration', analytics: 'administration', audit: 'administration',
  notifications: 'administration', saved_views: 'administration', imports: 'administration',
};

export function permissionArea(permission: Permission): PermissionArea {
  const prefix = permission.split('.')[0] ?? '';
  return AREA_BY_PREFIX[prefix] ?? 'administration';
}

export const isPermission = (value: string): value is Permission =>
  (PERMISSION_CATALOG as readonly string[]).includes(value);
