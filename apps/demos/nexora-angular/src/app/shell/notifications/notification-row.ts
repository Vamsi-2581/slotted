import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  SlListItemActions,
  SlListItemBody,
  SlListItemDescription,
  SlListItemLabel,
  SlListItemStart,
} from '@slotted/angular/list-item';
import type { Notification, NotificationType } from '@slotted/demo-nexora-operations';

import { ClockService } from '../../core/session/clock.service';

const ICON: Record<NotificationType, string> = {
  info: 'lucideInfo',
  success: 'lucideCircleCheck',
  warning: 'lucideTriangleAlert',
  action_required: 'lucideCircleAlert',
};
const TONE: Record<NotificationType, string> = {
  info: 'secondary',
  success: 'success',
  warning: 'warning',
  action_required: 'danger',
};

@Component({
  selector: '[appNotificationRow]',
  imports: [
    NgIcon,
    SlListItemBody,
    SlListItemDescription,
    SlListItemLabel,
    SlListItemStart,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .glyph {
      display: inline-grid;
      place-items: center;
      inline-size: 2rem;
      block-size: 2rem;
      border-radius: var(--slotted-radius-full);
      background: var(--slotted-tone-secondary-surface);
      color: var(--slotted-tone-secondary-text);
    }
    .glyph[data-tone='success'] {
      background: var(--slotted-tone-success-surface);
      color: var(--slotted-tone-success-text);
    }
    .glyph[data-tone='warning'] {
      background: var(--slotted-tone-warning-surface);
      color: var(--slotted-tone-warning-text);
    }
    .glyph[data-tone='danger'] {
      background: var(--slotted-tone-danger-surface);
      color: var(--slotted-tone-danger-text);
    }
    .title {
      font-weight: 500;
      text-align: start;
      background: none;
      border: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    :host-context([data-unread]) .title {
      font-weight: 600;
    }
    :host-context([data-unread]) .title::after {
      content: '';
      display: inline-block;
      inline-size: 0.5rem;
      block-size: 0.5rem;
      margin-inline-start: var(--slotted-space-2);
      border-radius: 50%;
      background: var(--slotted-tone-accent-solid);
      vertical-align: middle;
    }
  `,
  template: `
      <span slListItemStart>
        <span class="glyph" [attr.data-tone]="tone()"><ng-icon [name]="icon()" size="16" /></span>
      </span>
      <div slListItemBody>
        <button type="button" class="title" slListItemLabel (click)="open.emit(notification())">
          {{ notification().title }}
        </button>
        <span slListItemDescription>
          {{ notification().body }} · {{ clock.relative(notification().createdAt) }}
        </span>
      </div>
  `,
})
export class NotificationRow {
  readonly notification = input.required<Notification>();
  readonly open = output<Notification>();
  readonly clock = inject(ClockService);
  readonly unread = computed(() => this.notification().readAt === undefined);
  readonly icon = computed(() => ICON[this.notification().type]);
  readonly tone = computed(() => TONE[this.notification().type]);
}
