import { FULLSCREEN_MESSAGES } from '@slotted/core/fullscreen';
import { createContext, useContext } from 'react';

import type { FullscreenDefaults, FullscreenDefaultsProviderProps } from './fullscreen.types';

export const FULLSCREEN_FALLBACK: FullscreenDefaults = {
  mode: 'auto',
  navigationUI: 'auto',
  size: 'md',
  variant: 'ghost',
  messages: FULLSCREEN_MESSAGES,
};

const FullscreenDefaultsContext = createContext<FullscreenDefaults>(FULLSCREEN_FALLBACK);

export function useFullscreenDefaults(): FullscreenDefaults {
  return useContext(FullscreenDefaultsContext);
}

/**
 * An application decides once whether its regions ask the platform, how the
 * control is drawn and what it says; a region or a control that states any of
 * them itself still wins. Messages merge key by key.
 */
export function FullscreenDefaultsProvider({
  children,
  messages,
  ...defaults
}: FullscreenDefaultsProviderProps) {
  const inherited = useFullscreenDefaults();

  return (
    <FullscreenDefaultsContext.Provider
      value={{
        mode: defaults.mode ?? inherited.mode,
        navigationUI: defaults.navigationUI ?? inherited.navigationUI,
        size: defaults.size ?? inherited.size,
        variant: defaults.variant ?? inherited.variant,
        messages: { ...inherited.messages, ...messages },
      }}
    >
      {children}
    </FullscreenDefaultsContext.Provider>
  );
}
