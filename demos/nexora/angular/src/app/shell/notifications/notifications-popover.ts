import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { SlButton, SlButtonLink, SlIconButton } from '@slotted/angular/button';
import { SlList, SlListSection, SlListSectionLabel, SlListSectionList } from '@slotted/angular/list';
import { SlListItem, SlListItemActions, SlListItemContent } from '@slotted/angular/list-item';
import {
  SlPopover,
  SlPopoverBody,
  SlPopoverContent,
  SlPopoverFooter,
  SlPopoverHeader,
  SlPopoverLayer,
  SlPopoverTitle,
  SlPopoverTrigger,
} from '@slotted/angular/popover';
import { SlTopNavigationCount, SlTopNavigationNotifications } from '@slotted/angular/top-navigation';
import type { Notification } from '@slotted/demo-nexora-backend';

import { NotificationsStore } from '../../core/activity/notifications.store';
import { ClockService } from '../../core/session/clock.service';
import { NotificationRow } from './notification-row';

@Component({
  selector: 'app-notifications-popover',
  imports: [
    RouterLink,
    NgIcon,
    SlButton,
    SlIconButton,
    SlButtonLink,
    SlList,
    SlListItem,
    SlListItemActions,
    SlListItemContent,
    SlListSection,
    SlListSectionLabel,
    SlListSectionList,
    SlPopover,
    SlPopoverBody,
    SlPopoverContent,
    SlPopoverFooter,
    SlPopoverHeader,
    SlPopoverLayer,
    SlPopoverTitle,
    SlPopoverTrigger,
    SlTopNavigationCount,
    SlTopNavigationNotifications,
    NotificationRow,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .empty {
      margin: 0;
      padding: var(--slotted-space-6);
      text-align: center;
      color: var(--slotted-text-muted);
    }
    .panel {
      inline-size: min(28rem, calc(100vw - 2rem));
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--slotted-space-2);
      inline-size: 100%;
    }
  `,
  template: `
    <ng-container
      slPopover
      size="lg"
      side="bottom"
      align="end"
      [(open)]="open"
      (openChangeRequest)="$event.value && load()"
    >
      <button slTopNavigationNotifications slPopoverTrigger aria-label="Notifications">
        @if (store.unread() > 0) {
          <span slTopNavigationCount>{{ store.unread() }}</span>
        }
      </button>
      <ng-template slPopoverLayer>
        <div slPopoverContent class="panel">
          <div slPopoverHeader>
            <div class="head">
              <div slPopoverTitle>
                Notifications
                @if (store.unread() > 0) {
                  <span>({{ store.unread() }})</span>
                }
              </div>
              <button
                slButton
                size="sm"
                variant="ghost"
                tone="secondary"
                [disabled]="store.unread() === 0"
                (click)="store.markAllRead()"
              >
                Mark all as read
              </button>
            </div>
          </div>
          <div slPopoverBody>
            @if (store.items().length === 0) {
              <p class="empty">You're all caught up.</p>
            } @else {
              <ul slList>
                @for (group of groups(); track group.label) {
                  <li slListSection>
                    <span slListSectionLabel>{{ group.label }}</span>
                    <ul slListSectionList>
                      @for (n of group.items; track n.id) {
                        <li slListItem size="sm" [attr.data-unread]="n.readAt === undefined ? '' : null">
                          <div
                            slListItemContent
                            appNotificationRow
                            [notification]="n"
                            (open)="openNotification($event)"
                          ></div>
  <div slListItemActions>
    @if (n.readAt === undefined) {
      <button slIconButton size="sm" tone="secondary" variant="ghost" [attr.aria-label]="'Mark as read: ' + n.title" (click)="store.markRead(n.id)">
        <ng-icon name="lucideCheck" />
      </button>
    }
    @if (!n.archivedAt) {
      <button slIconButton size="sm" tone="secondary" variant="ghost" [attr.aria-label]="'Archive: ' + n.title" (click)="store.archive(n.id)">
        <ng-icon name="lucideArchive" />
      </button>
    }
  </div>
                        </li>
                      }
                    </ul>
                  </li>
                }
              </ul>
            }
          </div>
          <div slPopoverFooter>
            <a slButtonLink routerLink="/notifications" size="sm" variant="ghost" (click)="open.set(false)">
              View all
            </a>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class NotificationsPopover {
  readonly label = input.required<string>();
  readonly store = inject(NotificationsStore);
  readonly clock = inject(ClockService);
  private readonly router = inject(Router);
  readonly open = signal(false);
  readonly groups = computed(() => {
    const items = this.store.items().slice(0, 10);
    const today = items.filter((n) => this.clock.isToday(n.createdAt));
    const earlier = items.filter((n) => !this.clock.isToday(n.createdAt));
    return [
      { label: 'Today', items: today },
      { label: 'Earlier', items: earlier },
    ].filter((g) => g.items.length > 0);
  });

  load(): void {
    this.store.view.set('all');
    void this.store.loadPage(1, 25);
  }

  async openNotification(n: Notification): Promise<void> {
    if (n.readAt === undefined) await this.store.markRead(n.id);
    this.open.set(false);
    const route = this.store.routeFor(n);
    if (route !== null) await this.router.navigateByUrl(route);
  }
}
