import { inject, Injectable, InjectionToken } from '@angular/core';
import type { GridColumnState, GridColumnStateChange } from '@slotted/core/grid';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';

/** Where the panel stands: a popover on the trigger, a drawer at the end, or in place. */
export type ColumnManagerPresentation = 'popover' | 'drawer' | 'inline';

/** Whether every action asks at once, or edits a draft that Apply asks for once. */
export type ColumnManagerApply = 'live' | 'confirm';

export type ColumnManagerColumnReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'clear' | 'submit' | 'programmatic'
>;

export type ColumnManagerOpenReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'back' | 'programmatic'
>;

/** The column request: `data-grid`'s, with every key that moved beside the first. */
export interface ColumnManagerRequest extends ChangeRequest<GridColumnState> {
  readonly reason: ColumnManagerColumnReason;
  readonly change: GridColumnStateChange;
  readonly changes: readonly GridColumnStateChange[];
}

export type ColumnManagerOpenRequest = ChangeRequest<boolean>;

/** The words the family says. `{slot}` is filled in. */
export interface ColumnManagerLabels {
  title: string;
  search: string;
  noResults: string;
  showAll: string;
  reset: string;
  apply: string;
  cancel: string;
  pinnedStart: string;
  unpinned: string;
  pinnedEnd: string;
  pin: string;
  pinStart: string;
  pinEnd: string;
  unpin: string;
  reorder: string;
  moved: string;
  required: string;
  hiddenBySpace: string;
  inRow: string;
  hiddenCountOne: string;
  hiddenCountOther: string;
  visibleCount: string;
}

export interface ColumnManagerDefaults {
  presentation: ColumnManagerPresentation;
  apply: ColumnManagerApply;
  labels: ColumnManagerLabels;
}

export const DEFAULT_COLUMN_MANAGER_LABELS: ColumnManagerLabels = {
  title: 'Columns',
  search: 'Search columns',
  noResults: 'No columns match',
  showAll: 'Show all',
  reset: 'Restore defaults',
  apply: 'Apply',
  cancel: 'Cancel',
  pinnedStart: 'Pinned to start',
  unpinned: 'Columns',
  pinnedEnd: 'Pinned to end',
  pin: 'Pin {column}',
  pinStart: 'Pin to start',
  pinEnd: 'Pin to end',
  unpin: 'Unpin',
  reorder: 'Reorder {column}',
  moved: '{column} moved to position {position}',
  required: 'Required',
  hiddenBySpace: 'Hidden for space',
  inRow: 'Shown in row',
  hiddenCountOne: '1 hidden column',
  hiddenCountOther: '{count} hidden columns',
  visibleCount: '{visible} of {total} shown',
};

const FALLBACK: ColumnManagerDefaults = {
  presentation: 'popover',
  apply: 'live',
  labels: DEFAULT_COLUMN_MANAGER_LABELS,
};

export const COLUMN_MANAGER_DEFAULTS = new InjectionToken<ColumnManagerDefaults>(
  'slotted column-manager defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once where its managers stand, whether they apply at
 * once, and what they say. A manager that states any of them itself still wins.
 */
export function provideColumnManagerDefaults(
  defaults: Partial<Omit<ColumnManagerDefaults, 'labels'>> & {
    labels?: Partial<ColumnManagerLabels>;
  },
) {
  return {
    provide: COLUMN_MANAGER_DEFAULTS,
    useFactory: (): ColumnManagerDefaults => ({
      ...FALLBACK,
      ...defaults,
      labels: { ...FALLBACK.labels, ...defaults.labels },
    }),
  };
}

export function injectColumnManagerDefaults(): ColumnManagerDefaults {
  return inject(COLUMN_MANAGER_DEFAULTS);
}

@Injectable({ providedIn: 'root' })
export class SlColumnManagerIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-column-manager-${this.count}`;
  }
}

/** Fills `{name}` slots in a label. */
export function fillLabel(label: string, slots: Record<string, string | number>): string {
  return label.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in slots ? String(slots[name]) : match,
  );
}
