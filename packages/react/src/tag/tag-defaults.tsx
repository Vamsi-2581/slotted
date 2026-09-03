import { createContext, useContext } from 'react';

import type { TagDefaults, TagDefaultsProviderProps } from './tag.types';

/**
 * The word the remove control announces before the tag's own label. It is a
 * constant rather than a string built inside the component, because the only
 * translation layer this library has today is the consumer's — a provider at
 * the top of the application, or a prop on the tag.
 */
export const TAG_REMOVE_LABEL = 'Remove';

const FALLBACK: TagDefaults = {
  removeLabel: TAG_REMOVE_LABEL,
  shape: 'pill',
  size: 'md',
  tone: 'secondary',
  variant: 'soft',
};

const TagDefaultsContext = createContext<TagDefaults>(FALLBACK);

/** What a tag renders as here, before it states anything of its own. */
export function useTagDefaults(): TagDefaults {
  return useContext(TagDefaultsContext);
}

/**
 * An application decides once how its tags are painted, how large they are and
 * — the one that matters most — what its remove controls are called, rather
 * than repeating five props on every chip in a filter bar. A tag that states
 * any of them itself still wins: an explicit prop is never overridden by
 * context.
 *
 * Ant Design's `ConfigProvider` is the only surveyed implementation with an
 * equivalent, and it ships one binding.
 */
export function TagDefaultsProvider({ children, ...defaults }: TagDefaultsProviderProps) {
  const inherited = useTagDefaults();

  return (
    <TagDefaultsContext.Provider
      value={{
        removeLabel: defaults.removeLabel ?? inherited.removeLabel,
        shape: defaults.shape ?? inherited.shape,
        size: defaults.size ?? inherited.size,
        tone: defaults.tone ?? inherited.tone,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </TagDefaultsContext.Provider>
  );
}
