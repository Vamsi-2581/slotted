import { DEFAULT_IMPORT_EXPORT_MESSAGES } from '@slotted/core/import-export-center';
import { createContext, useContext } from 'react';

import type {
  ImportExportCenterDefaults,
  ImportExportCenterDefaultsProviderProps,
} from './import-export-center.types';

const FALLBACK: ImportExportCenterDefaults = {
  growing: 'none',
  level: '2',
  messages: DEFAULT_IMPORT_EXPORT_MESSAGES,
  size: 'md',
  timeFormat: 'relative',
};

const ImportExportCenterDefaultsContext = createContext<ImportExportCenterDefaults>(FALLBACK);

/** What a job centre renders as here, before it states anything of its own. */
export function useImportExportCenterDefaults(): ImportExportCenterDefaults {
  return useContext(ImportExportCenterDefaultsContext);
}

/**
 * An application decides once how its job centre reads — the size, the rank,
 * how history loads, how time is written, the locale and zone, the words —
 * rather than on every screen. A centre that states any of them still wins.
 */
export function ImportExportCenterDefaultsProvider({
  children,
  messages,
  ...defaults
}: ImportExportCenterDefaultsProviderProps) {
  const inherited = useImportExportCenterDefaults();

  return (
    <ImportExportCenterDefaultsContext.Provider
      value={{
        growing: defaults.growing ?? inherited.growing,
        level: defaults.level ?? inherited.level,
        locale: defaults.locale ?? inherited.locale,
        messages: { ...inherited.messages, ...messages },
        size: defaults.size ?? inherited.size,
        timeFormat: defaults.timeFormat ?? inherited.timeFormat,
        timeZone: defaults.timeZone ?? inherited.timeZone,
      }}
    >
      {children}
    </ImportExportCenterDefaultsContext.Provider>
  );
}
