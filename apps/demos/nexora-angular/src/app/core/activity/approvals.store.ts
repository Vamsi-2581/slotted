import { inject, Injectable, signal } from '@angular/core';
import type { ApprovalListItem } from '@slotted/demo-nexora-operations';

import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';

@Injectable({ providedIn: 'root' })
export class ApprovalsStore {
  private readonly backend = inject(NEXORA_BACKEND);
  readonly pending = signal(0);
  readonly items = signal<ApprovalListItem[]>([]);

  async refresh(): Promise<void> {
    const api = await this.backend.ready();
    this.pending.set((await api.session.get()).pendingApprovals);
  }

  async load(): Promise<void> {
    const api = await this.backend.ready();
    const r = await api.approvals.list({ filter: { status: 'pending' }, pageSize: 25 });
    this.items.set(r.data.filter((a) => a.actionable));
    this.pending.set(this.items().length);
  }
}
