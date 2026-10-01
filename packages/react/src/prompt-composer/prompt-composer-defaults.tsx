import { createContext, useContext } from 'react';

import type {
  PromptComposerDefaults,
  PromptComposerDefaultsProviderProps,
} from './prompt-composer.types';

/**
 * The words the composer's buttons and announcements say. Constants, because
 * the only translation layer this library has is the consumer's.
 */
export const PROMPT_COMPOSER_SEND_LABEL = 'Send';
export const PROMPT_COMPOSER_STOP_LABEL = 'Stop';
export const PROMPT_COMPOSER_RETRY_LABEL = 'Retry';
export const PROMPT_COMPOSER_ATTACH_LABEL = 'Attach files';
export const PROMPT_COMPOSER_SENDING_LABEL = 'Sending';
export const PROMPT_COMPOSER_STOPPED_LABEL = 'Stopped';

const FALLBACK: PromptComposerDefaults = {
  attachLabel: PROMPT_COMPOSER_ATTACH_LABEL,
  retryLabel: PROMPT_COMPOSER_RETRY_LABEL,
  sendLabel: PROMPT_COMPOSER_SEND_LABEL,
  sendingLabel: PROMPT_COMPOSER_SENDING_LABEL,
  size: 'md',
  stopLabel: PROMPT_COMPOSER_STOP_LABEL,
  stoppedLabel: PROMPT_COMPOSER_STOPPED_LABEL,
  submitOn: 'enter',
  variant: 'raised',
};

const PromptComposerDefaultsContext = createContext<PromptComposerDefaults>(FALLBACK);

export function usePromptComposerDefaults(): PromptComposerDefaults {
  return useContext(PromptComposerDefaultsContext);
}

/**
 * An application decides once how its composers look, which key sends, and
 * what the buttons say. A composer that states any of them itself still wins.
 */
export function PromptComposerDefaultsProvider({
  children,
  ...defaults
}: PromptComposerDefaultsProviderProps) {
  const inherited = usePromptComposerDefaults();
  const value = { ...inherited };
  for (const [key, entry] of Object.entries(defaults)) {
    if (entry !== undefined) (value as Record<string, unknown>)[key] = entry;
  }
  return (
    <PromptComposerDefaultsContext.Provider value={value}>
      {children}
    </PromptComposerDefaultsContext.Provider>
  );
}
