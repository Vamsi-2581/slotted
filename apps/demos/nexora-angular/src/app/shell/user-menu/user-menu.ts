import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SlAvatar } from '@slotted/angular/avatar';
import { SlTopNavigationAccount } from '@slotted/angular/top-navigation';

import { SessionStore } from '../../core/session/session.store';

/** Replaced by the full menu in the user-menu task. */
@Component({
  selector: 'app-user-menu',
  imports: [SlAvatar, SlTopNavigationAccount],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button slTopNavigationAccount aria-label="Account">
      <span slAvatar size="xs" tone="accent" variant="soft" [name]="session.user()?.displayName"></span>
    </button>
  `,
})
export class UserMenu {
  readonly session = inject(SessionStore);
}
