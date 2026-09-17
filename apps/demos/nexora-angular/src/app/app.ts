import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { probeSession } from './backend-probe';
import {
  SlAppShell,
  SlAppShellActions,
  SlAppShellBanner,
  SlAppShellBrand,
  SlAppShellMain,
  SlAppShellNav,
  SlAppShellNavBody,
  SlAppShellNavFooter,
  SlAppShellNavHeader,
  SlAppShellNavToggle,
} from '@slotted/angular/app-shell';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import { SlBadge } from '@slotted/angular/badge';
import { SlButton, SlIconButton } from '@slotted/angular/button';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import {
  SlPageHeader,
  SlPageHeaderActions,
  SlPageHeaderDescription,
  SlPageHeaderHeading,
  SlPageHeaderTitle,
  SlPageHeaderTitleArea,
  SlPageHeaderTitleRow,
} from '@slotted/angular/page-header';
import {
  SlSideNavigation,
  SlSideNavigationCount,
  SlSideNavigationIcon,
  SlSideNavigationItem,
  SlSideNavigationLabel,
  SlSideNavigationLink,
  SlSideNavigationList,
  SlSideNavigationSection,
  SlSideNavigationSectionLabel,
} from '@slotted/angular/side-navigation';

type Scheme = 'light' | 'dark';

interface Destination {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly count: number | null;
}

@Component({
  selector: 'app-root',
  imports: [
    NgIcon,
    SlAppShell,
    SlAppShellActions,
    SlAppShellBanner,
    SlAppShellBrand,
    SlAppShellMain,
    SlAppShellNav,
    SlAppShellNavBody,
    SlAppShellNavFooter,
    SlAppShellNavHeader,
    SlAppShellNavToggle,
    SlAvatar,
    SlAvatarFallback,
    SlBadge,
    SlButton,
    SlIconButton,
    SlPage,
    SlPageBody,
    SlPageHeader,
    SlPageHeaderActions,
    SlPageHeaderDescription,
    SlPageHeaderHeading,
    SlPageHeaderTitle,
    SlPageHeaderTitleArea,
    SlPageHeaderTitleRow,
    SlSideNavigation,
    SlSideNavigationCount,
    SlSideNavigationIcon,
    SlSideNavigationItem,
    SlSideNavigationLabel,
    SlSideNavigationLink,
    SlSideNavigationList,
    SlSideNavigationSection,
    SlSideNavigationSectionLabel,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly current = signal('dashboard');
  protected readonly navOpen = signal(true);
  protected readonly sessionUser = signal('…');
  constructor() {
    probeSession((text) => this.sessionUser.set(text));
  }
  protected readonly scheme = signal<Scheme>('light');

  protected readonly operations: readonly Destination[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard', count: null },
    { id: 'orders', label: 'Orders', icon: 'lucideBoxes', count: 12 },
    { id: 'shipments', label: 'Shipments', icon: 'lucideTruck', count: 3 },
    { id: 'customers', label: 'Customers', icon: 'lucideUsers', count: null },
  ];

  protected readonly system: readonly Destination[] = [
    { id: 'settings', label: 'Settings', icon: 'lucideSettings', count: null },
  ];

  /**
   * The scheme is an attribute on the document root, read by the theme. The
   * application owns the attribute; the library only reads it.
   */
  protected toggleScheme(): void {
    const next: Scheme = this.scheme() === 'light' ? 'dark' : 'light';
    this.scheme.set(next);
    this.document.documentElement.setAttribute('data-slotted-scheme', next);
  }
}
