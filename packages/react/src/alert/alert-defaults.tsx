import { createContext, useContext } from 'react';

import type { AlertDefaults, AlertDefaultsProviderProps } from './alert.types';

/**
 * The word the dismiss control announces. It is a constant rather than a string
 * built inside the component, because the only translation layer this library
 * has today is the consumer's — the provider below, or a prop on the alert.
 */
export const ALERT_DISMISS_LABEL = 'Dismiss';

const FALLBACK: AlertDefaults = {
  dismissLabel: ALERT_DISMISS_LABEL,
  live: 'off',
  reach: 'section',
  tone: 'accent',
  variant: 'soft',
};

const AlertDefaultsContext = createContext<AlertDefaults>(FALLBACK);

/** What an alert renders as here, before it states anything of its own. */
export function useAlertDefaults(): AlertDefaults {
  return useContext(AlertDefaultsContext);
}

/**
 * An application decides once how its messages are painted, at what reach, and
 * — the one that matters most — what its dismiss controls are called, rather
 * than repeating the same props on every alert in a settings page. An alert
 * that states any of them itself still wins: an explicit prop is never
 * overridden by context.
 *
 * MUI's `DefaultPropsProvider` is the only surveyed implementation with an
 * equivalent, and it ships one binding.
 */
export function AlertDefaultsProvider({ children, ...defaults }: AlertDefaultsProviderProps) {
  const inherited = useAlertDefaults();

  return (
    <AlertDefaultsContext.Provider
      value={{
        dismissLabel: defaults.dismissLabel ?? inherited.dismissLabel,
        live: defaults.live ?? inherited.live,
        reach: defaults.reach ?? inherited.reach,
        tone: defaults.tone ?? inherited.tone,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </AlertDefaultsContext.Provider>
  );
}
