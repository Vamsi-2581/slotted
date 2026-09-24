import { inject, InjectionToken } from '@angular/core';
import type { Entity } from '@slotted/core/entity-picker';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';

export type {
  Entity,
  EntityAvatar,
  EntitySearchRequest,
  EntitySearchResult,
  EntitySource,
} from '@slotted/core/entity-picker';

export type EntityPickerSize = 'sm' | 'md' | 'lg';
export type EntityPickerVariant = 'outline' | 'subtle' | 'plain';
export type EntityPickerMedia = 'avatar' | 'none';
export type EntityPickerOverflow = 'collapse' | 'wrap';
export type EntityPickerOpenOn = 'input' | 'focus';
export type EntityPickerSide = 'bottom' | 'top';
export type EntityPickerWidth = 'anchor' | 'content';
export type EntityPickerStrategy = 'absolute' | 'fixed';
export type EntityPickerSelectionMode = 'single' | 'multiple';

/** An id in `single`, an array of ids in `multiple`. */
export type EntityPickerValue = string | null | readonly string[];

export type EntityPickerValueReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'select' | 'remove' | 'clear' | 'submit' | 'programmatic'
>;
export type EntityPickerInputReason = Extract<
  ChangeReason,
  'keyboard' | 'select' | 'clear' | 'blur' | 'programmatic'
>;
export type EntityPickerOpenReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'select' | 'blur' | 'programmatic'
>;
export type EntityPickerHighlightReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'programmatic'
>;
export type EntityPickerScopeReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'programmatic'
>;

/** A request to change the chosen ids, carrying the records known for them. */
export interface EntityPickerValueRequest extends ChangeRequest<EntityPickerValue> {
  readonly entities: readonly Entity[];
}

export interface EntityPickerScope {
  readonly id: string;
  readonly label: string;
}

/** What an option template receives. */
export interface EntityPickerOptionContext {
  readonly $implicit: Entity;
  readonly query: string;
  readonly selected: boolean;
  readonly current: boolean;
  readonly disabled: boolean;
}

/** What a chip template receives. */
export interface EntityPickerChipContext {
  readonly $implicit: Entity;
}

/** Every sentence the family says. `{name}` slots are filled where they occur. */
export interface EntityPickerLabels {
  clear: string;
  trigger: string;
  empty: string;
  loading: string;
  count: string;
  minQuery: string;
  create: string;
  error: string;
  retry: string;
  chosen: string;
  favorites: string;
  recent: string;
  results: string;
  unresolved: string;
  remove: string;
  scope: string;
  chips: string;
  more: string;
  moreLabel: string;
  added: string;
  removed: string;
  complete: string;
}

/** What an application sets once for every picker under it. */
export interface EntityPickerDefaults {
  clearable: boolean;
  disabled: boolean;
  fullWidth: boolean;
  highlightMatch: boolean;
  invalid: boolean;
  labels: EntityPickerLabels;
  loop: boolean;
  media: EntityPickerMedia;
  minQueryLength: number;
  openOn: EntityPickerOpenOn;
  overflow: EntityPickerOverflow;
  portal: boolean;
  readOnly: boolean;
  required: boolean;
  searchDelay: number;
  side: EntityPickerSide;
  size: EntityPickerSize;
  strategy: EntityPickerStrategy;
  variant: EntityPickerVariant;
  width: EntityPickerWidth;
}

/** The words the family says before an application says otherwise. */
export const DEFAULT_ENTITY_PICKER_LABELS: EntityPickerLabels = {
  clear: 'Clear',
  trigger: 'Show results',
  empty: 'No results',
  loading: 'Loading…',
  count: '{count} results',
  minQuery: 'Type {count} or more characters',
  create: 'Create “{query}”',
  error: 'Couldn’t load results',
  retry: 'Try again',
  chosen: 'Chosen',
  favorites: 'Favorites',
  recent: 'Recent',
  results: 'Results',
  unresolved: 'Unavailable',
  remove: 'Remove {label}',
  scope: 'Search in',
  chips: '{label}, {count} chosen',
  more: '+{count}',
  moreLabel: '{count} more chosen',
  added: '{label} added, {count} chosen',
  removed: '{label} removed, {count} chosen',
  complete: 'Limit of {max} reached',
};

/** The contract's defaults, `specs/components/entity-picker/contract.json`. */
export const ENTITY_PICKER_FALLBACK: EntityPickerDefaults = {
  clearable: true,
  disabled: false,
  fullWidth: true,
  highlightMatch: true,
  invalid: false,
  labels: DEFAULT_ENTITY_PICKER_LABELS,
  loop: false,
  media: 'avatar',
  minQueryLength: 0,
  openOn: 'focus',
  overflow: 'collapse',
  portal: true,
  readOnly: false,
  required: false,
  searchDelay: 250,
  side: 'bottom',
  size: 'md',
  strategy: 'absolute',
  variant: 'outline',
  width: 'anchor',
};

export const ENTITY_PICKER_DEFAULTS = new InjectionToken<EntityPickerDefaults>(
  'slotted entity picker defaults',
  { providedIn: 'root', factory: () => ENTITY_PICKER_FALLBACK },
);

/**
 * An application decides once how its pickers look, how long they wait and
 * what they say. A picker that states any of it itself still wins, and a
 * nested provider overrides only what it names.
 */
export function provideEntityPickerDefaults(
  defaults: Partial<Omit<EntityPickerDefaults, 'labels'>> & {
    labels?: Partial<EntityPickerLabels>;
  },
) {
  return {
    provide: ENTITY_PICKER_DEFAULTS,
    useFactory: (): EntityPickerDefaults => {
      const inherited = inject(ENTITY_PICKER_DEFAULTS, { skipSelf: true, optional: true });
      const base = inherited ?? ENTITY_PICKER_FALLBACK;
      const merged: EntityPickerDefaults = {
        ...base,
        labels: { ...base.labels, ...defaults.labels },
      };
      for (const [key, value] of Object.entries(defaults)) {
        if (key !== 'labels' && value !== undefined) {
          (merged as unknown as Record<string, unknown>)[key] = value;
        }
      }
      return merged;
    },
  };
}

export function injectEntityPickerDefaults(): EntityPickerDefaults {
  return inject(ENTITY_PICKER_DEFAULTS);
}
