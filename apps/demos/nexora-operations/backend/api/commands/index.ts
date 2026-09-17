import type { ApprovalRequest } from '../../domain';
import { Transaction, type ApiRuntime } from '../runtime';
import type { SalesReadModels } from '../resources/sales';
import { createApprovalCommands, type ApprovalDecisionHooks } from './approvals';
import { createCrmCommands } from './crm';
import { createFinanceCommands } from './finance';
import { createFulfillmentCommands } from './fulfillment';
import { createInventoryCommands } from './inventory';
import { createPlatformCommands } from './platform';
import { createProcurementCommands } from './procurement';
import { createSalesCommands } from './sales';
import { createSupportCommands } from './support';

/** Section 79 — the canonical domain operation catalog, grouped by module. */
export function createCommands(runtime: ApiRuntime, models: SalesReadModels) {
  const crm = createCrmCommands(runtime);
  const sales = createSalesCommands(runtime, models);
  const fulfillment = createFulfillmentCommands(runtime, sales);
  const inventory = createInventoryCommands(runtime);
  const procurement = createProcurementCommands(runtime, inventory);
  const finance = createFinanceCommands(runtime, sales);
  const support = createSupportCommands(runtime);
  const platform = createPlatformCommands(runtime);
  const hooks: Record<ApprovalRequest['targetType'], ApprovalDecisionHooks> = {
    sales_order: sales.hooks.sales_order,
    quote: sales.hooks.quote,
    purchase_order: procurement.hooks.purchase_order,
    invoice_write_off: finance.hooks.invoice_write_off,
    cycle_count: inventory.hooks.cycle_count,
  };
  const approvals = createApprovalCommands(runtime, () => hooks);

  /** Section 69.5 and 68.5 — time-derived transitions evaluated when the demo clock moves. */
  const onClockAdvanced = (): { expiredQuotes: number; closedTickets: number } => {
    let expiredQuotes = 0;
    let closedTickets = 0;
    runtime.projections.refreshCollectionStates();
    const tx = new Transaction(runtime, runtime.actor, runtime.correlationId());
    try {
      expiredQuotes = sales.quotes.expire(tx);
      closedTickets = support.autoClose(tx);
      for (const order of runtime.store.dataset.salesOrders.values()) {
        if (order.status === 'confirmed' || order.status === 'on_hold') runtime.projections.recalculateOrder(order);
      }
      runtime.store.invalidate('salesOrders');
    } catch (error) {
      tx.rollback();
      throw error;
    }
    return { expiredQuotes, closedTickets };
  };

  return {
    customers: crm,
    quotes: sales.quotes,
    orders: sales.orders,
    shipments: fulfillment.shipments,
    returns: fulfillment.returns,
    inventory: { adjust: inventory.adjust, transfers: inventory.transfers, cycleCounts: inventory.cycleCounts },
    suppliers: procurement.suppliers,
    purchaseOrders: procurement.purchaseOrders,
    invoices: finance.invoices,
    payments: finance.payments,
    creditMemos: finance.creditMemos,
    refunds: finance.refunds,
    bankTransactions: finance.bankTransactions,
    tickets: support,
    approvals,
    workflows: platform.workflows,
    notifications: platform.notifications,
    tasks: platform.tasks,
    savedViews: platform.savedViews,
    imports: platform.imports,
    onClockAdvanced,
  };
}

export type Commands = ReturnType<typeof createCommands>;
