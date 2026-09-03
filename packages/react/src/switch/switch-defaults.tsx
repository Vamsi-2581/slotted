import { createContext, useContext } from 'react';

import type { SwitchDefaults, SwitchDefaultsProviderProps } from './switch.types';

/**
 * What a pending switch announces. It is a constant rather than a string built
 * inside the component, because the only translation layer this library has is
 * the consumer's — a provider at the top of the application, or a prop on the
 * control.
 */
export const SWITCH_LOADING_LABEL = 'Saving';

/**
 * How long a pending switch stays silent. A save that returns in two hundred
 * milliseconds should say nothing at all, and a live region that spoke on
 * every toggle would make a settings page unusable with a screen reader.
 * Primer measured the same number against the same problem.
 *
 * It is a constant of the family rather than a prop: an application that needs
 * longer sets a `loadingLabel` a reader can wait for.
 */
export const SWITCH_LOADING_ANNOUNCE_DELAY = 2000;

const FALLBACK: SwitchDefaults = {
  indicator: 'mark',
  labelPlacement: 'end',
  loadingLabel: SWITCH_LOADING_LABEL,
  size: 'md',
};

const SwitchDefaultsContext = createContext<SwitchDefaults>(FALLBACK);

/** What a switch renders as here, before it states anything of its own. */
export function useSwitchDefaults(): SwitchDefaults {
  return useContext(SwitchDefaultsContext);
}

/**
 * An application decides once what its switches look like, rather than
 * repeating the same props on every row of a settings page. A switch that
 * states any of them itself still wins.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a switch
 * inside a field takes the field's step and this provider answers only outside
 * one. Among the surveyed implementations only Angular Material and Mantine
 * ship application-wide defaults, and neither ships them for two frameworks.
 */
export function SwitchDefaultsProvider({ children, ...defaults }: SwitchDefaultsProviderProps) {
  const inherited = useSwitchDefaults();

  return (
    <SwitchDefaultsContext.Provider
      value={{
        indicator: defaults.indicator ?? inherited.indicator,
        labelPlacement: defaults.labelPlacement ?? inherited.labelPlacement,
        loadingLabel: defaults.loadingLabel ?? inherited.loadingLabel,
        size: defaults.size ?? inherited.size,
      }}
    >
      {children}
    </SwitchDefaultsContext.Provider>
  );
}
