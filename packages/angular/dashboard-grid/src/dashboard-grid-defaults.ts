import { inject, Injectable, InjectionToken } from '@angular/core';
import {
  DEFAULT_DASHBOARD_GRID_LABELS,
  type DashboardColumnsInput,
  type DashboardGridLabels,
  type DashboardLayout,
  type DashboardLayoutChange,
} from '@slotted/core/dashboard-grid';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';

export type {
  DashboardColumnsInput,
  DashboardGridLabels,
  DashboardLayout,
  DashboardLayoutChange,
  DashboardLayoutItem,
} from '@slotted/core/dashboard-grid';

export type DashboardHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type DashboardLayoutReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'remove' | 'dismiss' | 'programmatic'
>;

export type DashboardEditingReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'submit' | 'dismiss' | 'programmatic'
>;

/** The request for a new layout: the layout, why, and what the gesture was. */
export interface DashboardLayoutRequest extends ChangeRequest<DashboardLayout> {
  readonly reason: DashboardLayoutReason;
  readonly change: DashboardLayoutChange;
}

export interface DashboardEditingRequest extends ChangeRequest<boolean> {
  readonly reason: DashboardEditingReason;
}

export type DashboardWidgetStatus = 'ready' | 'empty' | 'error';

export interface DashboardGridDefaults {
  columns: DashboardColumnsInput;
  editBar: boolean;
  headingLevel: DashboardHeadingLevel;
  labels: DashboardGridLabels;
}

const FALLBACK: DashboardGridDefaults = {
  columns: 12,
  editBar: true,
  headingLevel: 3,
  labels: DEFAULT_DASHBOARD_GRID_LABELS,
};

export const DASHBOARD_GRID_DEFAULTS = new InjectionToken<DashboardGridDefaults>(
  'slotted dashboard-grid defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once how many columns its dashboards have, whether
 * the family draws the edit bar, the level of a widget's title and what the
 * family says. A grid that states any of it itself still wins.
 */
export function provideDashboardGridDefaults(
  defaults: Partial<Omit<DashboardGridDefaults, 'labels'>> & {
    labels?: Partial<DashboardGridLabels>;
  },
) {
  return {
    provide: DASHBOARD_GRID_DEFAULTS,
    useFactory: (): DashboardGridDefaults => ({
      ...FALLBACK,
      ...defaults,
      labels: { ...FALLBACK.labels, ...defaults.labels },
    }),
  };
}

export function injectDashboardGridDefaults(): DashboardGridDefaults {
  return inject(DASHBOARD_GRID_DEFAULTS);
}

@Injectable({ providedIn: 'root' })
export class SlDashboardGridIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-dashboard-grid-${this.count}`;
  }
}
