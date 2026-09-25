import { inject, Injectable, InjectionToken } from '@angular/core';
import type { GridView, SavedViewsState } from '@slotted/core/grid';
import type { ChangeRequest } from '@slotted/core/state';

/** What the reader did. One state object answers seven different presses. */
export type SavedViewsAction =
  'apply' | 'save' | 'create' | 'rename' | 'delete' | 'default' | 'revert';

/** Why the views moved. `submit` is a form; `remove` a confirmed delete. */
export type SavedViewsReason = 'pointer' | 'keyboard' | 'submit' | 'remove' | 'programmatic';

/** Why the layer opened or closed: the popover's own reasons. */
export type SavedViewsOpenReason = Extract<
  ChangeRequest<boolean>['reason'],
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'dismiss' | 'programmatic'
>;

/**
 * The request every change carries: the state asked for, the one it
 * replaces, the reason, what the reader did, the originating event, and a
 * refusal that stops the change before anything commits.
 */
export interface SavedViewsRequest {
  readonly value: SavedViewsState;
  readonly previous: SavedViewsState;
  readonly reason: SavedViewsReason;
  readonly action: SavedViewsAction;
  readonly source?: Event | undefined;
  readonly cancelled: boolean;
  /** Refuses the request. Nothing commits and no view is applied. */
  cancel(): void;
}

/** What `viewApply` emits: the view to write into the grid, and the request that caused it. */
export interface SavedViewApply {
  readonly view: GridView;
  readonly request: SavedViewsRequest;
}

/** What the family says. `{name}` is replaced with the view's name. */
export interface SavedViewsLabels {
  label: string;
  builtIn: string;
  modified: string;
  revert: string;
  save: string;
  saveAs: string;
  name: string;
  create: string;
  rename: string;
  setDefault: string;
  isDefault: string;
  delete: string;
  confirmDelete: string;
  cancel: string;
  actions: string;
  applied: string;
  saved: string;
  renamed: string;
  deleted: string;
  defaultChanged: string;
  duplicate: string;
  empty: string;
}

/** The decisions an application takes once. */
export interface SavedViewsDefaults {
  labels: SavedViewsLabels;
}

/** The words the family says before an application says otherwise. */
export const DEFAULT_SAVED_VIEWS_LABELS: SavedViewsLabels = {
  label: 'Views',
  builtIn: 'Default',
  modified: 'Modified',
  revert: 'Revert',
  save: 'Save',
  saveAs: 'Save as new view…',
  name: 'View name',
  create: 'Save view',
  rename: 'Rename',
  setDefault: 'Set as default',
  isDefault: 'default',
  delete: 'Delete',
  confirmDelete: 'Delete “{name}”?',
  cancel: 'Cancel',
  actions: 'Actions for {name}',
  applied: 'View {name} applied',
  saved: 'View {name} saved',
  renamed: 'View renamed to {name}',
  deleted: 'View {name} deleted',
  defaultChanged: '{name} is now the default view',
  duplicate: 'A view with this name already exists',
  empty: 'Enter a name for the view',
};

const FALLBACK: SavedViewsDefaults = { labels: DEFAULT_SAVED_VIEWS_LABELS };

export const SAVED_VIEWS_DEFAULTS = new InjectionToken<SavedViewsDefaults>(
  'slotted saved-views defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application translates the family once rather than on every grid. A
 * control that states its own labels still wins, word by word.
 */
export function provideSavedViewsDefaults(defaults: { labels?: Partial<SavedViewsLabels> }) {
  return {
    provide: SAVED_VIEWS_DEFAULTS,
    useFactory: (): SavedViewsDefaults => ({
      labels: { ...FALLBACK.labels, ...defaults.labels },
    }),
  };
}

export function injectSavedViewsDefaults(): SavedViewsDefaults {
  return inject(SAVED_VIEWS_DEFAULTS);
}

@Injectable({ providedIn: 'root' })
export class SlSavedViewsIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-saved-views-${this.count}`;
  }
}

let counter = 0;

/** `crypto.randomUUID()` where the platform has it, and a counter otherwise. */
export function newSavedViewId(): string {
  const crypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
  counter += 1;
  return `view-${Date.now().toString(36)}-${counter}`;
}
