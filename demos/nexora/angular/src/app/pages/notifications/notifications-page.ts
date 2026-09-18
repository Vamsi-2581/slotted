import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { SlButton, SlIconButton } from '@slotted/angular/button';
import { SlList } from '@slotted/angular/list';
import { SlListItem, SlListItemActions, SlListItemContent } from '@slotted/angular/list-item';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import {
  SlPageHeader,
  SlPageHeaderActions,
  SlPageHeaderHeading,
  SlPageHeaderTitle,
  SlPageHeaderTitleArea,
  SlPageHeaderTitleRow,
} from '@slotted/angular/page-header';
import {
  SlPagination,
  SlPaginationItems,
  SlPaginationNext,
  SlPaginationPrevious,
} from '@slotted/angular/pagination';
import {
  SlResultState,
  SlResultStateContent,
  SlResultStateTitle,
} from '@slotted/angular/result-state';
import { SlTab, SlTabList, SlTabs } from '@slotted/angular/tabs';
import type { Notification } from '@slotted/demo-nexora-backend';

import { NotificationsStore, type NotificationsView } from '../../core/activity/notifications.store';
import { NotificationRow } from '../../shell/notifications/notification-row';

@Component({
  selector: 'app-notifications-page',
  imports: [
    NgIcon,
    SlButton,
    SlIconButton,
    SlList,
    SlListItem,
    SlListItemActions,
    SlListItemContent,
    SlPage,
    SlPageBody,
    SlPageHeader,
    SlPageHeaderActions,
    SlPageHeaderHeading,
    SlPageHeaderTitle,
    SlPageHeaderTitleArea,
    SlPageHeaderTitleRow,
    SlPagination,
    SlPaginationItems,
    SlPaginationNext,
    SlPaginationPrevious,
    SlResultState,
    SlResultStateContent,
    SlResultStateTitle,
    SlTab,
    SlTabList,
    SlTabs,
    NotificationRow,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .views {
      margin-block-end: var(--slotted-space-4);
    }
    nav[slPagination] {
      margin-block-start: var(--slotted-space-4);
    }
  `,
  template: `
    <div slPage>
      <header slPageHeader>
        <div slPageHeaderTitleArea>
          <div slPageHeaderTitleRow>
            <div slPageHeaderTitle><h1 slPageHeaderHeading>Notifications</h1></div>
            <div slPageHeaderActions>
              <button slButton variant="outline" [disabled]="store.unread() === 0" (click)="store.markAllRead()">
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      </header>
      <div slPageBody>
        <div class="views" slTabs [value]="store.view()" (valueChange)="setView($event.value)">
          <div slTabList aria-label="Views">
            <div slTab value="all">All</div>
            <div slTab value="unread">
              Unread
              @if (store.unread() > 0) {
                ({{ store.unread() }})
              }
            </div>
            <div slTab value="archived">Archived</div>
          </div>
        </div>
        @if (store.items().length === 0 && !store.loading()) {
          <div slResultState status="empty" reach="section">
            <div slResultStateContent><h2 slResultStateTitle>Nothing here</h2></div>
          </div>
        } @else {
          <ul slList>
            @for (n of store.items(); track n.id) {
              <li slListItem [attr.data-unread]="n.readAt === undefined ? '' : null">
                <div
                  slListItemContent
                  appNotificationRow
                  [notification]="n"
                  (open)="open($event)"
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
          <nav
            slPagination
            [page]="store.page()"
            [count]="store.total()"
            [pageSize]="25"
            (pageChange)="store.loadPage($event.value)"
            label="Notifications pages"
          >
            <button slPaginationPrevious type="button"></button>
            <sl-pagination-items />
            <button slPaginationNext type="button"></button>
          </nav>
        }
      </div>
    </div>
  `,
})
export class NotificationsPage implements OnInit {
  readonly store = inject(NotificationsStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.store.loadPage(1, 25);
  }

  setView(view: string | undefined): void {
    this.store.view.set((view ?? 'all') as NotificationsView);
    void this.store.loadPage(1, 25);
  }

  async open(n: Notification): Promise<void> {
    if (n.readAt === undefined) await this.store.markRead(n.id);
    const route = this.store.routeFor(n);
    if (route !== null) await this.router.navigateByUrl(route);
  }
}
