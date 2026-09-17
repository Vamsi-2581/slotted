import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { SlButtonLink, SlIconButton } from '@slotted/angular/button';
import { SlList } from '@slotted/angular/list';
import {
  SlListItem,
  SlListItemBody,
  SlListItemContent,
  SlListItemDescription,
  SlListItemLabel,
} from '@slotted/angular/list-item';
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
import { SlBadge, SlBadgeAnchor } from '@slotted/angular/badge';

import { ApprovalsStore } from '../../core/activity/approvals.store';
import { ClockService } from '../../core/session/clock.service';

@Component({
  selector: 'app-approvals-popover',
  imports: [
    CurrencyPipe,
    RouterLink,
    NgIcon,
    SlButtonLink,
    SlIconButton,
    SlList,
    SlListItem,
    SlListItemBody,
    SlListItemContent,
    SlListItemDescription,
    SlListItemLabel,
    SlPopover,
    SlPopoverBody,
    SlPopoverContent,
    SlPopoverFooter,
    SlPopoverHeader,
    SlPopoverLayer,
    SlPopoverTitle,
    SlPopoverTrigger,
    SlBadge,
    SlBadgeAnchor,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .empty {
      margin: 0;
      padding: var(--slotted-space-4);
      color: var(--slotted-text-muted);
    }
  `,
  template: `
    <ng-container slPopover side="bottom" align="end" (openChangeRequest)="opened($event.value)">
      <span slBadgeAnchor>
        <button
          slIconButton
          slPopoverTrigger
          size="sm"
          tone="secondary"
          variant="ghost"
          [attr.aria-label]="label()"
        >
          <ng-icon name="lucideClipboardCheck" size="16" />
        </button>
        @if (store.pending() > 0) {
          <span slBadge size="sm" tone="accent" variant="solid" [count]="store.pending()"></span>
        }
      </span>
      <ng-template slPopoverLayer>
        <div slPopoverContent style="--slotted-popover-measure: 26rem">
          <div slPopoverHeader><div slPopoverTitle>Approvals</div></div>
          <div slPopoverBody>
            @if (store.items().length === 0) {
              <p class="empty">Nothing waiting for you.</p>
            } @else {
              <ul slList>
                @for (a of store.items().slice(0, 6); track a.id) {
                  <li slListItem size="sm">
                    <div slListItemContent>
                      <div slListItemBody>
                        <span slListItemLabel>{{ a.targetNumber }} · {{ a.targetLabel }}</span>
                        <span slListItemDescription>
                          @if (a.amount) {
                            {{ a.amount.minor / 100 | currency: a.amount.currency }} ·
                          }
                          {{ a.reasons.join(', ') }} · {{ clock.relative(a.metadata.createdAt) }}
                        </span>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
          <div slPopoverFooter>
            <a slButtonLink routerLink="/sales/approvals" size="sm" variant="ghost">
              Open approval queue
            </a>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class ApprovalsPopover {
  readonly label = input.required<string>();
  readonly store = inject(ApprovalsStore);
  readonly clock = inject(ClockService);

  opened(open: boolean): void {
    if (open) void this.store.load();
  }
}
