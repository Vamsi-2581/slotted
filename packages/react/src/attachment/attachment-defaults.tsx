import { createContext, useContext } from 'react';

import type { AttachmentDefaults, AttachmentDefaultsProviderProps } from './attachment.types';

const FALLBACK: AttachmentDefaults = {
  layout: 'list',
  locale: undefined,
  orientation: 'horizontal',
  removeLabel: 'Remove',
  size: 'md',
};

const AttachmentDefaultsContext = createContext<AttachmentDefaults>(FALLBACK);

/** What an attachment renders as here, before its group or itself states anything. */
export function useAttachmentDefaults(): AttachmentDefaults {
  return useContext(AttachmentDefaultsContext);
}

/**
 * An application decides once how large its attachments are, how a set of
 * them is arranged, which locale writes their sizes and what the remove
 * control says. A group or an attachment that states any of them still wins.
 */
export function AttachmentDefaultsProvider({
  children,
  ...defaults
}: AttachmentDefaultsProviderProps) {
  const inherited = useAttachmentDefaults();

  return (
    <AttachmentDefaultsContext.Provider
      value={{
        layout: defaults.layout ?? inherited.layout,
        locale: defaults.locale ?? inherited.locale,
        orientation: defaults.orientation ?? inherited.orientation,
        removeLabel: defaults.removeLabel ?? inherited.removeLabel,
        size: defaults.size ?? inherited.size,
      }}
    >
      {children}
    </AttachmentDefaultsContext.Provider>
  );
}
