import { inject, type Type } from '@angular/core';
import type { ResolveFn, Routes } from '@angular/router';

import { sessionReady, signedOut } from './core/nav/guards';
import { SessionStore } from './core/session/session.store';
import { NAV_MODULES } from './core/nav/nav.model';
import { isLazy, lazyPage, PermissionGate, type LazyPage } from './core/nav/permission-gate';
import { CategoriesPage } from './pages/catalog/categories-page';
import { PriceListsPage } from './pages/catalog/price-lists-page';
import { ProductsPage } from './pages/catalog/products-page';
import { SkusPage } from './pages/catalog/skus-page';
import { CustomerPage } from './pages/customers/customer-page';
import { CustomersPage } from './pages/customers/customers-page';
import { NewCustomerPage } from './pages/customers/new-customer-page';
import { ContactsPage } from './pages/contacts/contacts-page';
import { ImportPage } from './pages/imports/import-page';
import { ApprovalsPage } from './pages/approvals/approvals-page';
import { OrderPage } from './pages/orders/order-page';
import { OrdersPage } from './pages/orders/orders-page';
import { NewQuotePage } from './pages/quotes/new-quote-page';
import { QuotePage } from './pages/quotes/quote-page';
import { QuotesPage } from './pages/quotes/quotes-page';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { NotFoundPage } from './pages/not-found/not-found-page';
import { PlaceholderPage } from './pages/placeholder/placeholder-page';
import { SignInPage } from './pages/sign-in/sign-in-page';
import { ShellLayout } from './shell/shell-layout';

const strip = (path: string) => path.replace(/^\//, '');

/**
 * The destinations with a screen; the rest open on the placeholder until their
 * slice. The inventory's, procurement's and finance's screens, and the catalogue's
 * records, are fetched when first opened, so they stay out of the initial bundle.
 */
const PAGES: Record<string, Type<unknown> | LazyPage> = {
  '/crm/customers': CustomersPage,
  '/crm/customers/new': NewCustomerPage,
  '/crm/customers/:id': CustomerPage,
  '/crm/contacts': ContactsPage,
  '/crm/imports': ImportPage,
  '/crm/imports/:id': ImportPage,
  '/sales/orders': OrdersPage,
  '/sales/orders/:id': OrderPage,
  '/sales/approvals': ApprovalsPage,
  '/sales/quotes': QuotesPage,
  '/sales/quotes/new': NewQuotePage,
  '/sales/quotes/:id': QuotePage,
  '/catalog/products': ProductsPage,
  '/catalog/products/:id': lazyPage(() => import('./pages/catalog/product-page').then((m) => m.ProductPage)),
  '/catalog/skus': SkusPage,
  '/catalog/skus/:id': lazyPage(() => import('./pages/catalog/sku-page').then((m) => m.SkuPage)),
  '/catalog/categories': CategoriesPage,
  '/catalog/price-lists': PriceListsPage,
  '/inventory/overview': lazyPage(() => import('./pages/inventory/overview-page').then((m) => m.OverviewPage)),
  '/inventory/stock': lazyPage(() => import('./pages/inventory/stock-page').then((m) => m.StockPage)),
  '/inventory/stock/:id': lazyPage(() => import('./pages/inventory/position-page').then((m) => m.PositionPage)),
  '/inventory/warehouses': lazyPage(() => import('./pages/inventory/warehouses-page').then((m) => m.WarehousesPage)),
  '/inventory/warehouses/:id': lazyPage(() => import('./pages/inventory/warehouse-page').then((m) => m.WarehousePage)),
  '/inventory/movements': lazyPage(() => import('./pages/inventory/movements-page').then((m) => m.MovementsPage)),
  '/inventory/movements/:id': lazyPage(() => import('./pages/inventory/movements-page').then((m) => m.MovementsPage)),
  '/inventory/transfers': lazyPage(() => import('./pages/inventory/transfers-page').then((m) => m.TransfersPage)),
  '/inventory/transfers/new': lazyPage(() => import('./pages/inventory/new-transfer-page').then((m) => m.NewTransferPage)),
  '/inventory/transfers/:id': lazyPage(() => import('./pages/inventory/transfer-page').then((m) => m.TransferPage)),
  '/inventory/cycle-counts': lazyPage(() => import('./pages/inventory/cycle-counts-page').then((m) => m.CycleCountsPage)),
  '/inventory/cycle-counts/new': lazyPage(() => import('./pages/inventory/new-cycle-count-page').then((m) => m.NewCycleCountPage)),
  '/inventory/cycle-counts/:id': lazyPage(() => import('./pages/inventory/cycle-count-page').then((m) => m.CycleCountPage)),
  '/procurement/suppliers': lazyPage(() => import('./pages/procurement/suppliers-page').then((m) => m.SuppliersPage)),
  '/procurement/suppliers/new': lazyPage(() => import('./pages/procurement/new-supplier-page').then((m) => m.NewSupplierPage)),
  '/procurement/suppliers/:id': lazyPage(() => import('./pages/procurement/supplier-page').then((m) => m.SupplierPage)),
  '/procurement/purchase-orders': lazyPage(() => import('./pages/procurement/purchase-orders-page').then((m) => m.PurchaseOrdersPage)),
  '/procurement/purchase-orders/new': lazyPage(() => import('./pages/procurement/new-purchase-order-page').then((m) => m.NewPurchaseOrderPage)),
  '/procurement/purchase-orders/:id': lazyPage(() => import('./pages/procurement/purchase-order-page').then((m) => m.PurchaseOrderPage)),
  '/procurement/receiving': lazyPage(() => import('./pages/procurement/receiving-page').then((m) => m.ReceivingPage)),
  // No endpoint lists goods receipts: a receipt's one address is the receiving destination's `:id`.
  '/procurement/receiving/:id': lazyPage(() => import('./pages/procurement/goods-receipt-page').then((m) => m.GoodsReceiptPage)),
  '/finance/overview': lazyPage(() => import('./pages/finance/overview-page').then((m) => m.FinanceOverviewPage)),
  '/finance/invoices': lazyPage(() => import('./pages/finance/invoices-page').then((m) => m.InvoicesPage)),
  '/finance/invoices/:id': lazyPage(() => import('./pages/finance/invoice-page').then((m) => m.InvoicePage)),
  // Credit memos have no destination of their own: they live under Invoices, before its `:id`.
  '/finance/invoices/credit-memos': lazyPage(() => import('./pages/finance/credit-memos-page').then((m) => m.CreditMemosPage)),
  '/finance/invoices/credit-memos/new': lazyPage(() => import('./pages/finance/new-credit-memo-page').then((m) => m.NewCreditMemoPage)),
  '/finance/invoices/credit-memos/:id': lazyPage(() => import('./pages/finance/credit-memo-page').then((m) => m.CreditMemoPage)),
  '/finance/payments': lazyPage(() => import('./pages/finance/payments-page').then((m) => m.PaymentsPage)),
  '/finance/payments/new': lazyPage(() => import('./pages/finance/record-payment-page').then((m) => m.RecordPaymentPage)),
  '/finance/payments/:id': lazyPage(() => import('./pages/finance/payment-page').then((m) => m.PaymentPage)),
  '/finance/reconciliation': lazyPage(() => import('./pages/finance/reconciliation-page').then((m) => m.ReconciliationPage)),
  // A bank transaction is read in the workspace: its `:id` is the one the workspace has open.
  '/finance/reconciliation/:id': lazyPage(() => import('./pages/finance/reconciliation-page').then((m) => m.ReconciliationPage)),
};

/**
 * Fetches every lazy page once the shell has painted. The gate draws nothing
 * while a page's chunk is on its way — the page's own placeholders live in the
 * chunk — so the chunks are taken ahead of the first visit instead, outside
 * the initial bundle.
 */
export function preloadLazyPages(): void {
  for (const page of Object.values(PAGES)) if (isLazy(page)) void page.load();
}

/**
 * What a destination fetches before it draws: the chart engine's chunks, ahead
 * of the first chart. The loader itself is imported on demand, so the initial
 * bundle carries neither the engine nor the chart family.
 */
const RESOLVERS: Record<string, Record<string, ResolveFn<unknown>>> = {
  '/inventory/overview': {
    chart: () =>
      import('@slotted/core/chart-echarts').then((engine) => engine.preloadChartEngine(['bar'])),
  },
  '/procurement/receiving': {
    chart: () =>
      import('@slotted/core/chart-echarts').then((engine) => engine.preloadChartEngine(['bar'])),
  },
  '/finance/overview': {
    chart: () =>
      import('@slotted/core/chart-echarts').then((engine) => engine.preloadChartEngine(['bar'])),
  },
};

const gate = (path: string, title: string, permissions: string[] = []) => ({
  path: strip(path),
  component: PermissionGate,
  title,
  data: { permissions, page: PAGES[path] ?? PlaceholderPage, title, path },
  ...(RESOLVERS[path] ? { resolve: RESOLVERS[path] } : {}),
});

/** Every destination of the Appendix A route map, gated by the module's or its own permission. */
const moduleRoutes: Routes = NAV_MODULES.flatMap((m) => {
  if (m.id === 'home') return [];
  if (m.destinations.length === 0) return [gate(m.path, m.label, m.permissions)];
  return [
    {
      path: strip(m.path),
      pathMatch: 'full' as const,
      // The module opens on the first destination the reader may open: a representative sent to
      // /finance reads the invoices, not the overview their role does not hold.
      redirectTo: () => {
        const session = inject(SessionStore);
        const open = m.destinations.find(
          (x) => (x.permissions ?? m.permissions ?? []).length === 0 || session.canAny(...(x.permissions ?? m.permissions ?? [])),
        );
        return strip((open ?? m.destinations[0]!).path);
      },
    },
    ...m.destinations.flatMap((x) => [
      gate(x.path, x.label, x.permissions ?? m.permissions),
      // A destination with no record of its own leaves `:id` to the not-found page.
      ...(x.record === false
        ? []
        : [gate(`${x.path}/:id`, x.label, x.permissions ?? m.permissions)]),
    ]),
  ];
});

export const routes: Routes = [
  { path: 'sign-in', component: SignInPage, title: 'Sign in', canMatch: [signedOut] },
  {
    path: '',
    component: ShellLayout,
    canMatch: [sessionReady],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPage, title: 'Dashboard' },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page').then((m) => m.NotificationsPage),
        title: 'Notifications',
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile-page').then((m) => m.ProfilePage),
        title: 'Your profile',
      },
      {
        path: 'settings/preferences',
        loadComponent: () =>
          import('./pages/preferences/preferences-page').then((m) => m.PreferencesPage),
        title: 'Preferences',
      },
      // Before the module's own `:id`, which would take `new` for an account number.
      gate('/crm/customers/new', 'New customer', ['customers.create']),
      gate('/sales/quotes/new', 'New quote', ['quotes.create']),
      gate('/inventory/transfers/new', 'New transfer', ['inventory.transfer']),
      gate('/inventory/cycle-counts/new', 'Plan a count', ['inventory.cycle_count']),
      gate('/procurement/suppliers/new', 'New supplier', ['suppliers.manage']),
      gate('/procurement/purchase-orders/new', 'New purchase order', ['purchase_orders.create']),
      gate('/finance/payments/new', 'Record payment', ['payments.record']),
      gate('/finance/invoices/credit-memos/new', 'New credit memo', ['credit_memos.create']),
      gate('/finance/invoices/credit-memos', 'Credit memos', ['credit_memos.view']),
      gate('/finance/invoices/credit-memos/:id', 'Credit memo', ['credit_memos.view']),
      ...moduleRoutes,
      { path: '**', component: NotFoundPage, title: 'Not found' },
    ],
  },
];
