import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, type Type } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ForbiddenPage } from '../../pages/forbidden/forbidden-page';
import { SessionStore } from '../session/session.store';

/**
 * The route keeps its URL when access is denied: the page is replaced in
 * place, so a deep link a colleague pasted still says where it was pointing.
 */
@Component({
  selector: 'app-permission-gate',
  imports: [NgComponentOutlet, ForbiddenPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (missing(); as permission) {
      <app-forbidden-page [permission]="permission" />
    } @else {
      <ng-container *ngComponentOutlet="page()" />
    }
  `,
})
export class PermissionGate {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionStore = inject(SessionStore);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  readonly page = computed(() => this.data()['page'] as Type<unknown>);
  readonly missing = computed(() => {
    const permissions = (this.data()['permissions'] ?? []) as string[];
    void this.sessionStore.session();
    if (permissions.length === 0 || permissions.some((p) => this.sessionStore.can(p))) return null;
    return permissions[0] ?? null;
  });
}
