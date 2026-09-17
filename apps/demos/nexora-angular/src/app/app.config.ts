import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideBoxes,
  lucideCircleHelp,
  lucideLayoutDashboard,
  lucideMoon,
  lucideSettings,
  lucideSun,
  lucideTruck,
  lucideUsers,
} from '@ng-icons/lucide';
import { provideAppShellDefaults } from '@slotted/angular/app-shell';
import { providePageDefaults } from '@slotted/angular/page';
import { providePageHeaderDefaults } from '@slotted/angular/page-header';
import { provideSideNavigationDefaults } from '@slotted/angular/side-navigation';

import { provideNexoraBackend } from './core/backend/nexora-backend.provider';

import { routes } from './app.routes';

/**
 * Nexora is an English product. The library's spoken defaults are not, so
 * every family that speaks is told once, here, what to say. There is no single
 * provider for this yet: one per family is the current cost of a translated
 * application, and this file is where that cost is measured.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNexoraBackend(),
    provideRouter(routes),
    provideIcons({
      lucideBell,
      lucideBoxes,
      lucideCircleHelp,
      lucideLayoutDashboard,
      lucideMoon,
      lucideSettings,
      lucideSun,
      lucideTruck,
      lucideUsers,
    }),
    provideAppShellDefaults({
      messages: {
        nav: 'Main navigation',
        open: 'Open navigation',
        close: 'Close navigation',
        aside: 'Side panel',
        openAside: 'Open side panel',
        closeAside: 'Close side panel',
        skipToMain: 'Skip to content',
        skipToNav: 'Skip to navigation',
        skipToAside: 'Skip to side panel',
      },
    }),
    provideSideNavigationDefaults({ messages: { navigation: 'Navigation' } }),
    providePageDefaults({ messages: { footer: 'Page actions' } }),
    providePageHeaderDefaults({
      messages: {
        expand: 'Expand header',
        collapse: 'Collapse header',
        pin: 'Pin header',
        unpin: 'Unpin header',
        headerArea: 'Page header',
      },
    }),
  ],
};
