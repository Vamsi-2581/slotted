import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideArchive,
  lucideBell,
  lucideBuilding2,
  lucideChartColumn,
  lucideCheck,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideCircleHelp,
  lucideClipboardCheck,
  lucideClipboardList,
  lucideCornerDownRight,
  lucideFileText,
  lucideFlaskConical,
  lucideInfo,
  lucideLandmark,
  lucideLayoutDashboard,
  lucideLifeBuoy,
  lucideListTodo,
  lucideMoon,
  lucidePackage,
  lucidePlus,
  lucideReceipt,
  lucideScrollText,
  lucideSearch,
  lucideSettings,
  lucideShoppingCart,
  lucideSun,
  lucideTriangleAlert,
  lucideTruck,
  lucideUser,
  lucideUsers,
  lucideWarehouse,
  lucideWorkflow,
} from '@ng-icons/lucide';
import { provideAppShellDefaults } from '@slotted/angular/app-shell';
import { providePageDefaults } from '@slotted/angular/page';
import { providePageHeaderDefaults } from '@slotted/angular/page-header';
import { provideSideNavigationDefaults } from '@slotted/angular/side-navigation';
import { provideTopNavigationDefaults } from '@slotted/angular/top-navigation';

import { provideNexoraBackend } from './core/backend/nexora-backend.provider';
import { NexoraTitleStrategy } from './core/nav/title.strategy';

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
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useClass: NexoraTitleStrategy },
    provideIcons({
      lucideActivity,
      lucideArchive,
      lucideBell,
      lucideBuilding2,
      lucideChartColumn,
      lucideCheck,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideCircleHelp,
      lucideClipboardCheck,
      lucideClipboardList,
      lucideCornerDownRight,
      lucideFileText,
      lucideFlaskConical,
      lucideInfo,
      lucideLandmark,
      lucideLayoutDashboard,
      lucideLifeBuoy,
      lucideListTodo,
      lucideMoon,
      lucidePackage,
      lucidePlus,
      lucideReceipt,
      lucideScrollText,
      lucideSearch,
      lucideSettings,
      lucideShoppingCart,
      lucideSun,
      lucideTriangleAlert,
      lucideTruck,
      lucideUser,
      lucideUsers,
      lucideWarehouse,
      lucideWorkflow,
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
    provideTopNavigationDefaults({
      messages: {
        navigation: 'Navigation',
        more: 'More',
        search: 'Search',
        closeSearch: 'Close search',
        help: 'Help',
        notifications: 'Notifications',
        account: 'Account',
        skip: 'Skip to content',
      },
    }),
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
