import {
  ORGANIZATION_ID,
  addDays,
  addMs,
  diffDays,
  formatId,
  type ImportJob,
  type Notification,
  type SavedView,
  type Task,
  type Workflow,
  type WorkflowRun,
} from '../../domain';
import type { SeedContext } from './context';
import { instantOn, metadataAt } from './orders';
import type { TenantSeedResult } from './tenant';

export function seedCrossCutting(context: SeedContext, tenant: TenantSeedResult): void {
  seedWorkflows(context, tenant);
  seedNotificationsAndTasks(context, tenant);
  seedSavedViews(context, tenant);
  seedImportJob(context, tenant);
}

function seedWorkflows(context: SeedContext, tenant: TenantSeedResult): void {
  const { dataset, now, today } = context;
  const random = context.random('workflows');
  const admin = tenant.personaUserIds.get('maya-chen') as string;
  const sofia = tenant.personaUserIds.get('sofia-ramirez') as string;
  const priya = tenant.personaUserIds.get('priya-shah') as string;
  const marcus = tenant.personaUserIds.get('marcus-lee') as string;
  const definitions: Omit<Workflow, 'id' | 'organizationId' | 'metadata' | 'runCount' | 'lastRunAt'>[] = [
    {
      name: 'Flag high-value orders for manager review',
      description: 'Orders above $50,000 from non-strategic customers are routed for review before confirmation.',
      status: 'active',
      trigger: { type: 'order.created' },
      conditions: {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'order.total', operator: 'gte', value: 5_000_000 },
          {
            type: 'group',
            operator: 'or',
            children: [
              { type: 'condition', field: 'customer.segment', operator: 'neq', value: 'strategic' },
              { type: 'condition', field: 'order.riskFlags', operator: 'contains', value: 'low_margin' },
            ],
          },
        ],
      },
      actions: [
        { type: 'request_approval', config: { role: 'sales_manager' } },
        { type: 'send_notification', config: { userId: sofia, title: 'High-value order awaiting review' } },
      ],
      ownerId: sofia,
    },
    {
      name: 'Notify AE when a strategic customer is placed on hold',
      status: 'active',
      trigger: { type: 'customer.status_changed' },
      conditions: {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'customer.status', operator: 'eq', value: 'on_hold' },
          { type: 'condition', field: 'customer.segment', operator: 'in', value: ['strategic', 'enterprise'] },
        ],
      },
      actions: [
        { type: 'send_notification', config: { target: 'account_owner', title: 'Key account placed on hold' } },
        { type: 'create_task', config: { assignee: 'account_owner', title: 'Call customer about credit hold', priority: 'high' } },
      ],
      ownerId: sofia,
    },
    {
      name: 'Create reorder task when inventory drops below reorder point',
      status: 'active',
      trigger: { type: 'inventory.below_reorder_point' },
      conditions: {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'sku.reorderPolicy.mode', operator: 'eq', value: 'min_max' },
          { type: 'condition', field: 'sku.status', operator: 'eq', value: 'active' },
          { type: 'condition', field: 'inventory.inbound', operator: 'eq', value: '0' },
        ],
      },
      actions: [
        { type: 'create_purchase_order_draft', config: { supplier: 'preferred' } },
        { type: 'create_task', config: { assignee: marcus, title: 'Review suggested purchase order' } },
      ],
      ownerId: marcus,
    },
    {
      name: 'Escalate overdue invoices above $25,000 to Finance',
      status: 'active',
      trigger: { type: 'invoice.overdue' },
      conditions: {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'invoice.outstanding', operator: 'gte', value: 2_500_000 },
          { type: 'condition', field: 'invoice.collectionState', operator: 'neq', value: 'disputed' },
        ],
      },
      actions: [
        { type: 'add_tag', config: { tag: 'collections' } },
        { type: 'send_notification', config: { userId: priya, title: 'Large invoice overdue' } },
      ],
      ownerId: priya,
    },
    {
      name: 'Assign urgent tickets to the escalation team',
      status: 'active',
      trigger: { type: 'ticket.escalated' },
      conditions: {
        type: 'group',
        operator: 'or',
        children: [
          { type: 'condition', field: 'ticket.priority', operator: 'eq', value: 'urgent' },
          {
            type: 'group',
            operator: 'and',
            children: [
              { type: 'condition', field: 'ticket.priority', operator: 'eq', value: 'high' },
              { type: 'condition', field: 'customer.segment', operator: 'in', value: ['enterprise', 'strategic'] },
            ],
          },
        ],
      },
      actions: [{ type: 'assign_user', config: { userId: tenant.personaUserIds.get('aisha-grant') } }],
      ownerId: admin,
    },
    {
      name: 'Weekly digest of delayed purchase orders',
      status: 'active',
      trigger: { type: 'schedule.weekly', config: { weekday: 'monday', hour: 7 } },
      conditions: { type: 'group', operator: 'and', children: [{ type: 'condition', field: 'purchaseOrder.exceptionFlags', operator: 'contains', value: 'delayed' }] },
      actions: [{ type: 'send_notification', config: { userId: marcus, title: 'Delayed purchase orders this week' } }],
      ownerId: marcus,
    },
    {
      name: 'Auto-tag marketplace orders for review',
      status: 'paused',
      trigger: { type: 'order.confirmed' },
      conditions: { type: 'group', operator: 'and', children: [{ type: 'condition', field: 'order.customerPoNumber', operator: 'is_empty', value: null }] },
      actions: [{ type: 'add_tag', config: { tag: 'no-po' } }],
      ownerId: sofia,
    },
    {
      name: 'Daily check of expiring quotes',
      status: 'error',
      trigger: { type: 'schedule.daily', config: { hour: 6 } },
      conditions: { type: 'group', operator: 'and', children: [{ type: 'condition', field: 'quote.expirationDate', operator: 'lte', value: '{{today+3}}' }] },
      actions: [
        { type: 'send_notification', config: { target: 'quote_owner', title: 'Quote expiring soon' } },
        { type: 'create_task', config: { assignee: 'quote_owner', title: 'Follow up on expiring quote' } },
      ],
      ownerId: sofia,
    },
    {
      name: 'Place order on hold when credit exposure exceeds limit',
      status: 'draft',
      trigger: { type: 'order.value_changed' },
      conditions: { type: 'group', operator: 'and', children: [{ type: 'condition', field: 'customer.creditUtilizationBps', operator: 'gt', value: 10_000 }] },
      actions: [{ type: 'place_order_on_hold', config: { reason: 'Credit exposure exceeds approved limit' } }],
      ownerId: priya,
    },
    {
      name: 'Legacy: notify on every order',
      status: 'archived',
      trigger: { type: 'order.created' },
      conditions: { type: 'group', operator: 'and', children: [{ type: 'condition', field: 'order.total', operator: 'gt', value: 0 }] },
      actions: [{ type: 'send_notification', config: { userId: admin, title: 'New order' } }],
      ownerId: admin,
    },
  ];
  for (const [index, definition] of definitions.entries()) {
    const id = formatId('workflow', index + 1);
    const createdAt = addMs(now, -random.int(30, 600) * 24 * 3_600_000);
    const runCount = definition.status === 'active' ? random.int(20, 900) : definition.status === 'error' ? random.int(5, 60) : definition.status === 'paused' ? random.int(1, 40) : 0;
    const workflow: Workflow = {
      id,
      organizationId: ORGANIZATION_ID,
      ...definition,
      runCount,
      metadata: metadataAt(createdAt, definition.ownerId, addMs(now, -random.int(1, 30) * 24 * 3_600_000), definition.ownerId, random.int(1, 6)),
      ...(runCount > 0 ? { lastRunAt: addMs(now, -random.int(1, 72) * 3_600_000) } : {}),
    };
    if (definition.status === 'archived') workflow.metadata.archivedAt = addMs(now, -random.int(30, 200) * 24 * 3_600_000);
    dataset.workflows.set(id, workflow);
    if (index === 0) dataset.fixtures.set('edge.workflow.nested_conditions', id);

    // Recent runs
    const runs = Math.min(runCount, definition.status === 'active' ? random.int(8, 24) : definition.status === 'error' ? 6 : 3);
    const orders = [...dataset.salesOrders.values()].slice(-200);
    for (let position = 0; position < runs; position += 1) {
      const startedAt = addMs(now, -random.int(1, 40 * 24) * 3_600_000);
      const failed = definition.status === 'error' ? position < 3 : random.chance(0.04);
      const skipped = !failed && random.chance(0.2);
      const affected = orders.length > 0 ? random.pick(orders) : undefined;
      const run: WorkflowRun = {
        id: formatId('workflowRun', index * 100 + position + 1),
        organizationId: ORGANIZATION_ID,
        workflowId: id,
        triggerEventId: `evt_${random.digits(10)}`,
        status: failed ? 'failed' : skipped ? 'skipped' : 'succeeded',
        startedAt,
        completedAt: addMs(startedAt, random.int(120, 4_000)),
        actionResults: definition.actions.map((_, actionIndex) => ({
          actionIndex,
          status: failed && actionIndex === 0 ? 'failed' : skipped ? 'skipped' : 'succeeded',
          ...(failed && actionIndex === 0 ? { errorCode: 'ACTION_TARGET_NOT_FOUND', message: 'Quote owner is deactivated; notification target unresolved.' } : {}),
        })),
        ...(affected ? { affectedEntityType: 'sales_order', affectedEntityId: affected.id } : {}),
        ...(failed ? { errorCode: 'ACTION_TARGET_NOT_FOUND' } : {}),
      };
      dataset.workflowRuns.set(run.id, run);
      if (failed && !dataset.fixtures.has('edge.workflow.failed_run')) dataset.fixtures.set('edge.workflow.failed_run', run.id);
    }
  }
  void today;
}

function seedNotificationsAndTasks(context: SeedContext, tenant: TenantSeedResult): void {
  const { dataset, now, today } = context;
  const random = context.random('notifications');
  const pendingApprovals = [...dataset.approvalRequests.values()].filter((request) => request.status === 'pending');
  const overdueInvoices = [...dataset.invoices.values()].filter((invoice) => invoice.collectionState === 'overdue').slice(0, 60);
  const delayedPos = [...dataset.purchaseOrders.values()].filter((po) => po.exceptionFlags.includes('delayed')).slice(0, 40);
  const escalatedTickets = [...dataset.tickets.values()].filter((ticket) => ticket.status === 'escalated').slice(0, 40);
  const recentShipments = [...dataset.shipments.values()].filter((shipment) => shipment.status === 'exception');
  let counter = 0;
  const add = (userId: string, type: Notification['type'], title: string, body: string, entityType: string | undefined, entityId: string | undefined, hoursAgo: number, read: boolean): void => {
    counter += 1;
    const createdAt = addMs(now, -hoursAgo * 3_600_000);
    const notification: Notification = {
      id: formatId('notification', counter),
      organizationId: ORGANIZATION_ID,
      userId,
      type,
      title,
      body,
      createdAt,
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(read ? { readAt: addMs(createdAt, random.int(5, 600) * 60_000) } : {}),
    };
    dataset.notifications.set(notification.id, notification);
  };
  for (const [personaKey, userId] of tenant.personaUserIds) {
    const count = random.int(9, 22);
    for (let index = 0; index < count; index += 1) {
      const hoursAgo = Math.round(random.logNormal(20, 1.1));
      const read = hoursAgo > 30 ? random.chance(0.85) : random.chance(0.35);
      const roll = random.next();
      if (roll < 0.25 && pendingApprovals.length > 0 && (personaKey === 'sofia-ramirez' || personaKey === 'priya-shah' || personaKey === 'maya-chen')) {
        const approval = random.pick(pendingApprovals);
        add(userId, 'action_required', `Approval requested: ${approval.targetNumber}`, `${approval.reasons.join('; ')}.`, 'approval_request', approval.id, hoursAgo, read);
      } else if (roll < 0.45 && overdueInvoices.length > 0 && (personaKey === 'priya-shah' || personaKey === 'noah-bennett' || personaKey === 'sofia-ramirez')) {
        const invoice = random.pick(overdueInvoices);
        const customer = dataset.customers.get(invoice.customerId);
        add(userId, 'warning', `Invoice ${invoice.invoiceNumber} is ${diffDays(today, invoice.dueDate)} days overdue`, `${customer?.displayName ?? 'Customer'} owes ${(invoice.outstanding.minor / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`, 'invoice', invoice.id, hoursAgo, read);
      } else if (roll < 0.6 && delayedPos.length > 0 && (personaKey === 'marcus-lee' || personaKey === 'jordan-wells')) {
        const po = random.pick(delayedPos);
        add(userId, 'warning', `${po.purchaseOrderNumber} is past its expected date`, `Expected ${po.expectedDate}; supplier has not confirmed a new date.`, 'purchase_order', po.id, hoursAgo, read);
      } else if (roll < 0.75 && escalatedTickets.length > 0 && (personaKey === 'aisha-grant' || personaKey === 'evan-brooks')) {
        const ticket = random.pick(escalatedTickets);
        add(userId, 'action_required', `Ticket ${ticket.ticketNumber} escalated`, ticket.subject, 'support_ticket', ticket.id, hoursAgo, read);
      } else if (roll < 0.85 && recentShipments.length > 0) {
        const shipment = random.pick(recentShipments);
        add(userId, 'warning', `Shipment ${shipment.shipmentNumber} reported an exception`, shipment.exceptionMessage ?? 'Carrier exception.', 'shipment', shipment.id, hoursAgo, read);
      } else {
        add(userId, random.pick(['info', 'success']), random.pick(['Weekly digest is ready', 'Your saved view was shared', 'Import completed with warnings', 'Password will expire in 7 days', 'New release notes available']), random.pick(['Open the report to review last week\'s numbers.', 'The Finance team can now see "Overdue > 60 days".', '2 of 240 rows were skipped.', 'Update it from your profile settings.', 'Highlights: faster order search, new inventory filters.']), undefined, undefined, hoursAgo, read);
      }
    }
  }

  // Tasks
  let taskCounter = 0;
  const addTask = (task: Omit<Task, 'id' | 'organizationId' | 'createdAt'> & { daysAgo: number }): void => {
    taskCounter += 1;
    const { daysAgo, ...rest } = task;
    const record: Task = { id: formatId('task', taskCounter), organizationId: ORGANIZATION_ID, createdAt: instantOn(addDays(today, -daysAgo), random), ...rest };
    if (record.status === 'completed') record.completedAt = addMs(record.createdAt, random.int(2, 96) * 3_600_000);
    dataset.tasks.set(record.id, record);
  };
  const noah = tenant.personaUserIds.get('noah-bennett') as string;
  const sofia = tenant.personaUserIds.get('sofia-ramirez') as string;
  const priya = tenant.personaUserIds.get('priya-shah') as string;
  const marcus = tenant.personaUserIds.get('marcus-lee') as string;
  const aisha = tenant.personaUserIds.get('aisha-grant') as string;
  const meridian = dataset.fixtures.get('flagship.customer.meridian');
  addTask({ title: 'Prepare Meridian renewal pricing on top 20 SKUs', description: 'Include contract price comparison and OTD metrics for the QBR.', assigneeId: noah, createdBy: sofia, dueDate: addDays(today, 6), priority: 'high', status: 'open', daysAgo: 3, ...(meridian ? { relatedEntityType: 'customer', relatedEntityId: meridian } : {}) });
  addTask({ title: 'Call Meridian AP about INV-2026-02891', assigneeId: priya, createdBy: priya, dueDate: today, priority: 'high', status: 'open', daysAgo: 1, ...(meridian ? { relatedEntityType: 'customer', relatedEntityId: meridian } : {}) });
  for (const [index, invoice] of overdueInvoices.slice(0, 14).entries()) {
    const customer = dataset.customers.get(invoice.customerId);
    addTask({ title: `Collections follow-up: ${customer?.displayName ?? invoice.customerId}`, assigneeId: index % 3 === 0 ? priya : random.pick(overdueActors(context, tenant)), createdBy: priya, dueDate: addDays(today, random.int(-2, 10)), priority: invoice.outstanding.minor > 2_500_000 ? 'high' : 'normal', status: random.chance(0.3) ? 'completed' : 'open', relatedEntityType: 'invoice', relatedEntityId: invoice.id, daysAgo: random.int(1, 20) });
  }
  for (const po of delayedPos.slice(0, 10)) {
    addTask({ title: `Confirm new ship date for ${po.purchaseOrderNumber}`, assigneeId: marcus, createdBy: marcus, dueDate: addDays(today, random.int(0, 5)), priority: 'normal', status: random.chance(0.25) ? 'completed' : 'open', relatedEntityType: 'purchase_order', relatedEntityId: po.id, daysAgo: random.int(1, 12) });
  }
  for (const ticket of escalatedTickets.slice(0, 8)) {
    addTask({ title: `Escalation review: ${ticket.ticketNumber}`, assigneeId: aisha, createdBy: aisha, dueDate: addDays(today, random.int(0, 2)), priority: ticket.priority === 'urgent' ? 'high' : 'normal', status: 'open', relatedEntityType: 'support_ticket', relatedEntityId: ticket.id, daysAgo: random.int(0, 4) });
  }
  addTask({ title: 'Review reorder suggestions for CHI-01', assigneeId: marcus, createdBy: 'usr_system_automation', dueDate: addDays(today, 2), priority: 'normal', status: 'open', daysAgo: 1 });
  addTask({ title: 'Archive inactive suppliers without POs in 18 months', assigneeId: marcus, createdBy: tenant.personaUserIds.get('maya-chen') as string, dueDate: addDays(today, 30), priority: 'low', status: 'open', daysAgo: 9 });
  addTask({ title: 'Cancelled: migrate legacy price list', assigneeId: tenant.personaUserIds.get('maya-chen') as string, createdBy: tenant.personaUserIds.get('maya-chen') as string, priority: 'low', status: 'cancelled', daysAgo: 40 });
}

function overdueActors(context: SeedContext, tenant: TenantSeedResult): string[] {
  const accountant = tenant.roleIdsByKey.get('accountant');
  const actors = [...context.dataset.roleAssignments.values()].filter((assignment) => assignment.roleId === accountant && context.dataset.users.get(assignment.userId)?.status === 'active').map((assignment) => assignment.userId);
  return actors.length > 0 ? actors : [tenant.personaUserIds.get('priya-shah') as string];
}

function seedSavedViews(context: SeedContext, tenant: TenantSeedResult): void {
  const { dataset, now } = context;
  const random = context.random('saved-views');
  const definitions: { persona: string; resource: SavedView['resource']; name: string; isDefault: boolean; filters: SavedView['state']['filters']; sort: SavedView['state']['sort']; columns: string[] }[] = [
    { persona: 'sofia-ramirez', resource: 'orders', name: 'Pending my approval', isDefault: true, filters: [{ field: 'status', operator: 'eq', value: 'pending_approval' }], sort: [{ field: 'total', direction: 'desc' }], columns: ['orderNumber', 'customer', 'total', 'grossMarginBps', 'riskFlags', 'orderDate'] },
    { persona: 'sofia-ramirez', resource: 'orders', name: 'Central region — this month', isDefault: false, filters: [{ field: 'salesTeamId', operator: 'eq', value: tenant.teamIdsByCode.get('SALES-C') }, { field: 'orderDate', operator: 'gte', value: `${context.today.slice(0, 7)}-01` }], sort: [{ field: 'orderDate', direction: 'desc' }], columns: ['orderNumber', 'customer', 'status', 'fulfillmentStatus', 'total'] },
    { persona: 'sofia-ramirez', resource: 'customers', name: 'At-risk accounts', isDefault: false, filters: [{ field: 'health', operator: 'eq', value: 'at_risk' }], sort: [{ field: 'creditUtilizationBps', direction: 'desc' }], columns: ['displayName', 'segment', 'health', 'grossReceivables', 'accountOwner'] },
    { persona: 'noah-bennett', resource: 'customers', name: 'My accounts', isDefault: true, filters: [{ field: 'accountOwnerId', operator: 'eq', value: tenant.personaUserIds.get('noah-bennett') }], sort: [{ field: 'displayName', direction: 'asc' }], columns: ['displayName', 'status', 'health', 'ordersLast12Months', 'primaryContact'] },
    { persona: 'noah-bennett', resource: 'orders', name: 'My open orders', isDefault: true, filters: [{ field: 'ownerId', operator: 'eq', value: tenant.personaUserIds.get('noah-bennett') }, { field: 'status', operator: 'in', value: ['confirmed', 'on_hold', 'pending_approval'] }], sort: [{ field: 'orderDate', direction: 'desc' }], columns: ['orderNumber', 'customer', 'status', 'allocationStatus', 'fulfillmentStatus', 'total'] },
    { persona: 'priya-shah', resource: 'invoices', name: 'Overdue > 60 days', isDefault: true, filters: [{ field: 'collectionState', operator: 'eq', value: 'overdue' }, { field: 'daysOverdue', operator: 'gte', value: 60 }], sort: [{ field: 'outstanding', direction: 'desc' }], columns: ['invoiceNumber', 'customer', 'dueDate', 'daysOverdue', 'outstanding'] },
    { persona: 'priya-shah', resource: 'invoices', name: 'Disputed', isDefault: false, filters: [{ field: 'collectionState', operator: 'eq', value: 'disputed' }], sort: [{ field: 'issueDate', direction: 'desc' }], columns: ['invoiceNumber', 'customer', 'disputeReason', 'outstanding'] },
    { persona: 'marcus-lee', resource: 'purchase_orders', name: 'Delayed POs', isDefault: true, filters: [{ field: 'exceptionFlags', operator: 'contains', value: 'delayed' }], sort: [{ field: 'expectedDate', direction: 'asc' }], columns: ['purchaseOrderNumber', 'supplier', 'expectedDate', 'status', 'total'] },
    { persona: 'jordan-wells', resource: 'inventory', name: 'CHI-01 below reorder point', isDefault: true, filters: [{ field: 'warehouseId', operator: 'eq', value: tenant.warehouseIdsByCode.get('CHI-01') }, { field: 'belowReorderPoint', operator: 'eq', value: true }], sort: [{ field: 'available', direction: 'asc' }], columns: ['sku', 'name', 'onHand', 'reserved', 'available', 'inbound'] },
    { persona: 'aisha-grant', resource: 'tickets', name: 'My queue', isDefault: true, filters: [{ field: 'assigneeId', operator: 'eq', value: tenant.personaUserIds.get('aisha-grant') }, { field: 'status', operator: 'in', value: ['new', 'open', 'escalated', 'pending_internal'] }], sort: [{ field: 'resolutionDueAt', direction: 'asc' }], columns: ['ticketNumber', 'subject', 'customer', 'priority', 'status', 'resolutionSla'] },
    { persona: 'aisha-grant', resource: 'tickets', name: 'SLA at risk', isDefault: false, filters: [{ field: 'resolutionSla', operator: 'in', value: ['at_risk', 'breached'] }], sort: [{ field: 'priority', direction: 'desc' }], columns: ['ticketNumber', 'subject', 'priority', 'firstResponseSla', 'resolutionSla'] },
    { persona: 'owen-price', resource: 'audit', name: 'Finance mutations — last 7 days', isDefault: true, filters: [{ field: 'entityType', operator: 'in', value: ['invoice', 'payment', 'credit_memo'] }], sort: [{ field: 'occurredAt', direction: 'desc' }], columns: ['occurredAt', 'actor', 'action', 'entityType', 'entityId'] },
    { persona: 'evan-brooks', resource: 'customers', name: 'Strategic accounts', isDefault: true, filters: [{ field: 'segment', operator: 'eq', value: 'strategic' }], sort: [{ field: 'lifetimeRevenue', direction: 'desc' }], columns: ['displayName', 'health', 'lifetimeRevenue', 'ordersLast12Months', 'accountOwner'] },
  ];
  for (const [index, definition] of definitions.entries()) {
    const userId = tenant.personaUserIds.get(definition.persona) as string;
    const createdAt = addMs(now, -random.int(5, 300) * 24 * 3_600_000);
    const view: SavedView = {
      id: formatId('savedView', index + 1),
      organizationId: ORGANIZATION_ID,
      userId,
      resource: definition.resource,
      name: definition.name,
      isDefault: definition.isDefault,
      state: {
        filters: definition.filters,
        sort: definition.sort,
        visibleColumns: definition.columns,
        columnOrder: definition.columns,
        density: random.chance(0.4) ? 'compact' : 'comfortable',
        pageSize: random.pick([25, 50, 50, 100]),
      },
      metadata: metadataAt(createdAt, userId, createdAt, userId, 1),
    };
    dataset.savedViews.set(view.id, view);
  }
}

function seedImportJob(context: SeedContext, tenant: TenantSeedResult): void {
  const { dataset, now } = context;
  const admin = tenant.personaUserIds.get('maya-chen') as string;
  const createdAt = addMs(now, -3 * 24 * 3_600_000);
  const job: ImportJob = {
    id: formatId('importJob', 1),
    organizationId: ORGANIZATION_ID,
    type: 'customers',
    fileName: 'tradeshow-leads-2026-08.csv',
    status: 'completed_with_errors',
    createdBy: admin,
    columns: ['Company', 'Contact Email', 'Phone', 'State', 'Segment', 'Rep', 'Terms'],
    mapping: { Company: 'Company Name', 'Contact Email': 'Primary Email', Phone: 'Phone', Segment: 'Segment', Rep: 'Account Owner', Terms: 'Payment Terms' },
    sampleRows: [
      ['Larkspur Bottling Co.', 'purchasing@larkspurbottling.example', '(312) 555-0142', 'IL', 'SMB', 'Noah Bennett', 'NET 30'],
      ['Crestview Composites', 'ap@crestviewcomposites.example', '', 'TX', 'Mid-Market', 'Unknown Rep', 'NET 45'],
      ['', 'info@example.com', '(404) 555-0199', 'GA', 'SMB', 'Noah Bennett', 'NET 30'],
    ],
    issues: [
      { row: 3, field: 'Company Name', severity: 'error', code: 'REQUIRED', message: 'Company Name is required.' },
      { row: 2, field: 'Account Owner', severity: 'warning', code: 'UNRESOLVED_OWNER', message: 'Account owner "Unknown Rep" not found; defaulted to importer.' },
      { row: 17, field: 'Payment Terms', severity: 'warning', code: 'UNKNOWN_TERMS', message: 'Payment terms "NET 90" are not supported; defaulted to NET_30.' },
      { row: 41, field: 'Primary Email', severity: 'error', code: 'INVALID_EMAIL', message: 'Value is not a valid email address.' },
    ],
    result: { totalRows: 240, validRows: 228, warningRows: 9, errorRows: 3, importedRows: 237, skippedRows: 3 },
    metadata: metadataAt(createdAt, admin, addMs(createdAt, 240_000), admin, 5),
  };
  dataset.importJobs.set(job.id, job);
}
