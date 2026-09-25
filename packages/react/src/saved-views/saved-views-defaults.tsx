import { createContext, useContext } from 'react';

import type {
  SavedViewsDefaults,
  SavedViewsLabels,
  SavedViewsProviderProps,
} from './saved-views.types';

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

const SavedViewsDefaultsContext = createContext<SavedViewsDefaults>(FALLBACK);

/** What a saved-views control says here, before it states anything of its own. */
export function useSavedViewsDefaults(): SavedViewsDefaults {
  return useContext(SavedViewsDefaultsContext);
}

/**
 * An application translates the family once rather than on every grid. A
 * control that states its own labels still wins, word by word.
 */
export function SavedViewsProvider({ children, labels }: SavedViewsProviderProps) {
  const inherited = useSavedViewsDefaults();
  return (
    <SavedViewsDefaultsContext.Provider value={{ labels: { ...inherited.labels, ...labels } }}>
      {children}
    </SavedViewsDefaultsContext.Provider>
  );
}
