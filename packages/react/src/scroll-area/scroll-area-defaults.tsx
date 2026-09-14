import { createContext, useContext } from 'react';

import type { ScrollAreaDefaults, ScrollAreaDefaultsProviderProps } from './scroll-area.types';

const FALLBACK: ScrollAreaDefaults = {
  axis: 'block',
  fade: 'both',
  gutter: 'stable',
  /**
   * The same words `prose` falls back to for its own scrolling block, so a
   * product that has translated the phrase once has translated it for both.
   */
  label: 'Scrollable content',
  overscroll: 'contain',
  scrollbars: 'auto',
};

const ScrollAreaDefaultsContext = createContext<ScrollAreaDefaults>(FALLBACK);

/** What a scroll area is here, before it states anything of its own. */
export function useScrollAreaDefaults(): ScrollAreaDefaults {
  return useContext(ScrollAreaDefaultsContext);
}

/**
 * An application decides once what its scroll areas look like — whether the
 * bar waits for a hand, whether the veil dims both ends, what a region is
 * called in this language — rather than repeating it on fifty of them.
 *
 * None of the five surveyed implementations has an equivalent: each takes its
 * policy per instance, and Mantine's `type` in particular is written on every
 * call site of every product that uses it.
 *
 * An area that states any of them itself still wins, because an explicit
 * consumer value always does.
 */
export function ScrollAreaDefaultsProvider({
  children,
  ...defaults
}: ScrollAreaDefaultsProviderProps) {
  const inherited = useScrollAreaDefaults();

  return (
    <ScrollAreaDefaultsContext.Provider
      value={{
        axis: defaults.axis ?? inherited.axis,
        fade: defaults.fade ?? inherited.fade,
        gutter: defaults.gutter ?? inherited.gutter,
        label: defaults.label ?? inherited.label,
        overscroll: defaults.overscroll ?? inherited.overscroll,
        scrollbars: defaults.scrollbars ?? inherited.scrollbars,
      }}
    >
      {children}
    </ScrollAreaDefaultsContext.Provider>
  );
}
