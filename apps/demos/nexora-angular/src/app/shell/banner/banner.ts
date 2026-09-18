import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { SlAppShellNavToggle } from '@slotted/angular/app-shell';
import { SlIconButton } from '@slotted/angular/button';
import { SlCommandPaletteTrigger } from '@slotted/angular/command-palette';
import { SlIcon } from '@slotted/angular/icon';
import { SlShortcut } from '@slotted/angular/kbd';
import {
  SlTooltip,
  SlTooltipContent,
  SlTooltipLayer,
  SlTooltipTrigger,
} from '@slotted/angular/tooltip';
import {
  SlTopNavigation,
  SlTopNavigationActions,
  SlTopNavigationBrand,
  SlTopNavigationContext,
  SlTopNavigationHome,
  SlTopNavigationMark,
  SlTopNavigationName,
  SlTopNavigationSearch,
} from '@slotted/angular/top-navigation';

import { ApprovalsStore } from '../../core/activity/approvals.store';
import { NotificationsStore } from '../../core/activity/notifications.store';
import { TasksStore } from '../../core/activity/tasks.store';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';
import { DemoDrawer } from '../demo/demo-drawer';
import { NotificationsPopover } from '../notifications/notifications-popover';
import { CommandPalette } from '../palette/command-palette';
import { UserMenu } from '../user-menu/user-menu';
import { ApprovalsPopover } from './approvals-popover';
import { BrandMark } from './brand-mark';
import { HelpMenu } from './help-menu';
import { TasksPopover } from './tasks-popover';

@Component({
  selector: 'app-banner',
  imports: [
    NgIcon,
    SlAppShellNavToggle,
    SlIconButton,
    SlCommandPaletteTrigger,
    SlIcon,
    SlShortcut,
    SlTooltip,
    SlTooltipContent,
    SlTooltipLayer,
    SlTooltipTrigger,
    SlTopNavigation,
    SlTopNavigationActions,
    SlTopNavigationBrand,
    SlTopNavigationContext,
    SlTopNavigationHome,
    SlTopNavigationMark,
    SlTopNavigationName,
    SlTopNavigationSearch,
    BrandMark,
    ApprovalsPopover,
    TasksPopover,
    HelpMenu,
    UserMenu,
    NotificationsPopover,
    CommandPalette,
    DemoDrawer,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  readonly session = inject(SessionStore);
  readonly approvals = inject(ApprovalsStore);
  readonly tasks = inject(TasksStore);
  readonly notifications = inject(NotificationsStore);
  readonly preferences = inject(PreferencesStore);
  readonly palette = viewChild.required(CommandPalette);
  readonly demo = viewChild.required(DemoDrawer);

  /** The organization, and the warehouse when the session is scoped to fewer than all. */
  readonly context = computed(() => {
    const s = this.session.session();
    if (s === null) return '';
    const scoped = s.warehouseIds !== 'all';
    const warehouses = this.session.warehouses();
    if (!scoped || warehouses.length === 0) return s.organization.displayName;
    const first = warehouses[0]!;
    const rest = warehouses.length - 1;
    return `${s.organization.displayName} · ${first.code} ${first.name}${rest > 0 ? ` +${rest}` : ''}`;
  });
  readonly approvalsLabel = computed(() => `Approvals, ${this.approvals.pending()} pending`);
  readonly tasksLabel = computed(() => `Tasks, ${this.tasks.open()} open`);
  readonly notificationsLabel = computed(
    () => `Notifications, ${this.notifications.unread()} unread`,
  );

  constructor() {
    effect(() => this.palette().drawer.set(this.demo()));
  }
}
