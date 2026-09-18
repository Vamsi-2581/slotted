import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
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
import { SlTopNavigationAction, SlTopNavigationCount } from '@slotted/angular/top-navigation';

import { TasksStore } from '../../core/activity/tasks.store';
import { ClockService } from '../../core/session/clock.service';

@Component({
  selector: 'app-tasks-popover',
  imports: [
    NgIcon,
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
    SlTopNavigationAction,
    SlTopNavigationCount,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .panel {
      inline-size: min(28rem, calc(100vw - 2rem));
    }
    .empty {
      margin: 0;
      padding: var(--slotted-space-4);
      color: var(--slotted-text-muted);
    }
  `,
  template: `
    <ng-container slPopover size="lg" side="bottom" align="end" (openChangeRequest)="opened($event.value)">
      <button slTopNavigationAction slPopoverTrigger [label]="label()">
        <ng-icon name="lucideListTodo" />
        @if (store.open() > 0) {
          <span slTopNavigationCount>{{ store.open() }}</span>
        }
      </button>
      <ng-template slPopoverLayer>
        <div slPopoverContent class="panel">
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
