import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, type OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  SlAppShell,
  SlAppShellBanner,
  SlAppShellMain,
  SlAppShellNav,
  SlAppShellNavBody,
  SlAppShellNavFooter,
  SlAppShellNavHeader,
  SlAppShellNavToggle,
} from '@slotted/angular/app-shell';
import { SlAvatar } from '@slotted/angular/avatar';
import { SlButton } from '@slotted/angular/button';
import {
  SlResultState,
  SlResultStateActions,
  SlResultStateContent,
  SlResultStateDescription,
  SlResultStateTitle,
} from '@slotted/angular/result-state';
import {
  SlSideNavigation,
  SlSideNavigationCount,
  SlSideNavigationGroup,
  SlSideNavigationIcon,
  SlSideNavigationItem,
  SlSideNavigationLabel,
  SlSideNavigationLink,
  SlSideNavigationList,
  SlSideNavigationSection,
  SlSideNavigationSectionLabel,
  SlSideNavigationSkeleton,
  SlSideNavigationTrigger,
} from '@slotted/angular/side-navigation';
import { SlSkeleton, SlSkeletonRegion, SlSkeletonText } from '@slotted/angular/skeleton';
import { filter, map, startWith } from 'rxjs';

import { ApprovalsStore } from '../core/activity/approvals.store';
import { NotificationsStore } from '../core/activity/notifications.store';
import { TasksStore } from '../core/activity/tasks.store';
import {
  destinationFor,
  moduleFor,
  SECTION_LABELS,
  visibleModules,
  type NavDestination,
  type NavModule,
} from '../core/nav/nav.model';
import { SessionStore } from '../core/session/session.store';
import { Banner } from './banner/banner';
import { ConnectionStatus } from './status/connection-status';

interface Section {
  id: NavModule['section'];
  label: string | null;
  modules: NavModule[];
}

@Component({
  selector: 'app-shell-layout',
  imports: [
    RouterLink,
    RouterOutlet,
    NgIcon,
    Banner,
    ConnectionStatus,
    SlAppShell,
    SlAppShellBanner,
    SlAppShellMain,
    SlAppShellNav,
    SlAppShellNavBody,
    SlAppShellNavFooter,
    SlAppShellNavHeader,
    SlAppShellNavToggle,
    SlAvatar,
    SlButton,
    SlResultState,
    SlResultStateActions,
    SlResultStateContent,
    SlResultStateDescription,
    SlResultStateTitle,
    SlSideNavigation,
    SlSideNavigationCount,
    SlSideNavigationGroup,
    SlSideNavigationIcon,
    SlSideNavigationItem,
    SlSideNavigationLabel,
    SlSideNavigationLink,
    SlSideNavigationList,
    SlSideNavigationSection,
    SlSideNavigationSectionLabel,
    SlSideNavigationSkeleton,
    SlSideNavigationTrigger,
    SlSkeleton,
    SlSkeletonRegion,
    SlSkeletonText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.css',
})
export class ShellLayout implements OnInit {
  readonly session = inject(SessionStore);
  readonly approvals = inject(ApprovalsStore);
  readonly tasks = inject(TasksStore);
  readonly notifications = inject(NotificationsStore);
  private readonly router = inject(Router);

  readonly navOpen = signal(this.readNavOpen());
  readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly modules = computed(() => {
    void this.session.session();
    return visibleModules((p) => this.session.can(p));
  });
  readonly sections = computed<Section[]>(() =>
    (['home', 'operate', 'insight', 'manage'] as const)
      .map((id) => ({
        id,
        label: SECTION_LABELS[id],
        modules: this.modules().filter((m) => m.section === id),
      }))
      .filter((s) => s.modules.length > 0),
  );
  readonly current = computed(
    () => destinationFor(this.url())?.destination.id ?? moduleFor(this.url())?.id ?? null,
  );
  readonly expanded = computed(() => {
    const m = moduleFor(this.url());
    return m === undefined ? [] : [m.id];
  });
  readonly role = computed(() => this.session.session()?.roles[0]?.name ?? '');
  readonly organization = computed(() => this.session.session()?.organization ?? null);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(this.navKey(), String(this.navOpen()));
      } catch {
        /* storage unavailable */
      }
    });
  }

  ngOnInit(): void {
    if (this.session.status() === 'ready') {
      void Promise.all([
        this.approvals.refresh(),
        this.tasks.refresh(),
        this.notifications.refreshCount(),
      ]);
    }
  }

  /** Keyboard selection in the column: the link's router navigation covers the pointer. */
  navigate(request: { value: string | null }): void {
    const target = this.modules()
      .flatMap((m): (NavModule | NavDestination)[] => [m, ...m.destinations])
      .find((x) => x.id === request.value);
    if (target !== undefined && this.router.url !== target.path) {
      void this.router.navigateByUrl(target.path);
    }
  }

  countFor(destination: NavDestination): number | null {
    return destination.count === 'approvals' ? this.approvals.pending() : null;
  }

  retry(): void {
    void this.session.load();
  }

  private navKey(): string {
    return `nexora:nav-open:${this.session.user()?.id ?? 'anonymous'}`;
  }

  private readNavOpen(): boolean {
    try {
      return localStorage.getItem(this.navKey()) !== 'false';
    } catch {
      return true;
    }
  }
}
