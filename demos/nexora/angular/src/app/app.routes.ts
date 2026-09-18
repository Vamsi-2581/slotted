import type { Routes } from '@angular/router';

import { sessionReady, signedOut } from './core/nav/guards';
import { NAV_MODULES } from './core/nav/nav.model';
import { PermissionGate } from './core/nav/permission-gate';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { NotFoundPage } from './pages/not-found/not-found-page';
import { PlaceholderPage } from './pages/placeholder/placeholder-page';
import { SignInPage } from './pages/sign-in/sign-in-page';
import { ShellLayout } from './shell/shell-layout';

const strip = (path: string) => path.replace(/^\//, '');

const gate = (path: string, title: string, permissions: string[] = []) => ({
  path: strip(path),
  component: PermissionGate,
  title,
  data: { permissions, page: PlaceholderPage, title, path },
});

/** Every destination of the Appendix A route map, gated by the module's or its own permission. */
const moduleRoutes: Routes = NAV_MODULES.flatMap((m) => {
  if (m.id === 'home') return [];
  if (m.destinations.length === 0) return [gate(m.path, m.label, m.permissions)];
  return [
    { path: strip(m.path), pathMatch: 'full' as const, redirectTo: strip(m.destinations[0]!.path) },
    ...m.destinations.flatMap((x) => [
      gate(x.path, x.label, x.permissions ?? m.permissions),
      gate(`${x.path}/:id`, x.label, x.permissions ?? m.permissions),
    ]),
  ];
});

export const routes: Routes = [
  { path: 'sign-in', component: SignInPage, title: 'Sign in', canMatch: [signedOut] },
  {
    path: '',
    component: ShellLayout,
    canMatch: [sessionReady],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPage, title: 'Dashboard' },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page').then((m) => m.NotificationsPage),
        title: 'Notifications',
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile-page').then((m) => m.ProfilePage),
        title: 'Your profile',
      },
      {
        path: 'settings/preferences',
        loadComponent: () =>
          import('./pages/preferences/preferences-page').then((m) => m.PreferencesPage),
        title: 'Preferences',
      },
      ...moduleRoutes,
      { path: '**', component: NotFoundPage, title: 'Not found' },
    ],
  },
];
