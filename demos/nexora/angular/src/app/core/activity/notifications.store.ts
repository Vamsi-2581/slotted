import { inject, Injectable, signal } from '@angular/core';
import type { Notification } from '@slotted/demo-nexora-backend';

import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';
import { TransportHealth } from '../backend/transport-health';

export type NotificationsView = 'all' | 'unread' | 'archived';

const ROUTE_BY_ENTITY: Record<string, string> = {
  customer: '/crm/customers',
  order: '/sales/orders',
  quote: '/sales/quotes',
  invoice: '/finance/invoices',
  product: '/catalog/products',
  sku: '/catalog/products',
  ticket: '/support/tickets',
  shipment: '/inventory/movements',
  purchase_order: '/procurement/purchase-orders',
  supplier: '/procurement/suppliers',
  approval: '/sales/approvals',
};

@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly backend = inject(NEXORA_BACKEND);
  private readonly health = inject(TransportHealth);
  readonly unread = signal(0);
  readonly items = signal<Notification[]>([]);
  readonly view = signal<NotificationsView>('all');
  readonly page = signal(1);
  readonly total = signal(0);
  readonly loading = signal(false);

  async refreshCount(): Promise<void> {
    const api = await this.backend.ready();
    const session = await api.session.get();
    this.unread.set(session.unreadNotifications);
  }

  async loadPage(page = 1, size = 25): Promise<void> {
    this.loading.set(true);
    try {
      const api = await this.backend.ready();
      const view = this.view();
      const r = await api.notifications.list({
        page,
        pageSize: size,
        sort: '-createdAt',
        includeArchived: view === 'archived',
        ...(view === 'unread' ? { filter: { read: 'false' } } : {}),
      });
      const rows = r.data.filter((n) =>
        view === 'archived' ? n.archivedAt !== undefined : n.archivedAt === undefined,
      );
      this.items.set(rows);
      this.page.set(r.page.number);
      this.total.set(view === 'archived' ? rows.length : r.page.totalItems);
    } finally {
      this.loading.set(false);
    }
  }

  private async after(): Promise<void> {
    await Promise.all([this.refreshCount(), this.loadPage(this.page())]);
  }

  async markRead(id: string): Promise<void> {
    await this.health.mutation(async () => (await this.backend.ready()).notifications.markRead(id));
    await this.after();
  }

  async archive(id: string): Promise<void> {
    await this.health.mutation(async () => (await this.backend.ready()).notifications.archive(id));
    await this.after();
  }

  async markAllRead(): Promise<void> {
    await this.health.mutation(async () => (await this.backend.ready()).notifications.markAllRead());
    await this.after();
  }

  /** The backend records what a notification is about, not where it lives; the route is the client's. */
  routeFor(notification: Notification): string | null {
    if (notification.entityType === undefined || notification.entityId === undefined) return null;
    const base = ROUTE_BY_ENTITY[notification.entityType];
    return base === undefined ? null : `${base}/${notification.entityId}`;
  }
}
