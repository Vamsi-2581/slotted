import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { SlIconButton } from '@slotted/angular/button';
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
  SlPopoverHeader,
  SlPopoverLayer,
  SlPopoverTitle,
  SlPopoverTrigger,
} from '@slotted/angular/popover';
import { SlBadge, SlBadgeAnchor } from '@slotted/angular/badge';

import { TasksStore } from '../../core/activity/tasks.store';
import { ClockService } from '../../core/session/clock.service';

@Component({
  selector: 'app-tasks-popover',
  imports: [
    NgIcon,
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
          <ng-icon name="lucideListTodo" size="16" />
        </button>
        @if (store.open() > 0) {
          <span slBadge size="sm" tone="accent" variant="solid" [count]="store.open()"></span>
        }
      </span>
      <ng-template slPopoverLayer>
        <div slPopoverContent style="--slotted-popover-measure: 24rem">
          <div slPopoverHeader><div slPopoverTitle>Tasks</div></div>
          <div slPopoverBody>
            @if (store.items().length === 0) {
              <p class="empty">No open tasks.</p>
            } @else {
              <ul slList>
                @for (t of store.items().slice(0, 6); track t.id) {
                  <li slListItem size="sm" [tone]="t.overdue ? 'danger' : undefined">
                    <div slListItemContent>
                      <div slListItemBody>
                        <span slListItemLabel>{{ t.title }}</span>
                        <span slListItemDescription>
                          @if (t.dueDate) {
                            {{ t.overdue ? 'Overdue' : 'Due' }} {{ clock.formatDate(t.dueDate) }} ·
                          }
                          {{ t.priority }} priority
                        </span>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class TasksPopover {
  readonly label = input.required<string>();
  readonly store = inject(TasksStore);
  readonly clock = inject(ClockService);

  opened(open: boolean): void {
    if (open) void this.store.refresh();
  }
}
