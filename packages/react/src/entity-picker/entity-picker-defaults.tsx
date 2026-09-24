import { createContext, useContext } from 'react';

import type {
  EntityPickerDefaults,
  EntityPickerDefaultsProviderProps,
  EntityPickerLabels,
} from './entity-picker.types';

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

const EntityPickerDefaultsContext = createContext<EntityPickerDefaults>(ENTITY_PICKER_FALLBACK);

/** What an entity picker renders as here, before it states anything of its own. */
export function useEntityPickerDefaults(): EntityPickerDefaults {
  return useContext(EntityPickerDefaultsContext);
}

/**
 * An application decides once how its pickers look, how long they wait and
 * what they say. A picker that states any of it itself still wins, and a
 * nested provider overrides only what it names.
 */
export function EntityPickerDefaultsProvider({
  children,
  labels,
  ...rest
}: EntityPickerDefaultsProviderProps) {
  const inherited = useEntityPickerDefaults();
  const value: EntityPickerDefaults = { ...inherited, labels: { ...inherited.labels, ...labels } };
  for (const [key, given] of Object.entries(rest)) {
    if (given !== undefined) (value as unknown as Record<string, unknown>)[key] = given;
  }
  return (
    <EntityPickerDefaultsContext.Provider value={value}>
      {children}
    </EntityPickerDefaultsContext.Provider>
  );
}
