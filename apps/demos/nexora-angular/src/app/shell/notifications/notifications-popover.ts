import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SlTopNavigationCount, SlTopNavigationNotifications } from '@slotted/angular/top-navigation';

import { NotificationsStore } from '../../core/activity/notifications.store';

/** Replaced by the popover in the notifications task. */
@Component({
  selector: 'app-notifications-popover',
  imports: [SlTopNavigationCount, SlTopNavigationNotifications],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button slTopNavigationNotifications aria-label="Notifications">
      @if (store.unread() > 0) {
        <span slTopNavigationCount>{{ store.unread() }}</span>
      }
    </button>
  `,
})
export class NotificationsPopover {
  readonly label = input.required<string>();
  readonly store = inject(NotificationsStore);
}
