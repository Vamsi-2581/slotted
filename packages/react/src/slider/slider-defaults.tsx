import { createContext, useContext } from 'react';

import type { SliderDefaults, SliderDefaultsProviderProps } from './slider.types';

const FALLBACK: SliderDefaults = {
  locale: undefined,
  orientation: 'horizontal',
  size: 'md',
  valueLabel: 'auto',
};

const SliderDefaultsContext = createContext<SliderDefaults>(FALLBACK);

/** What a slider renders as here, before it states anything of its own. */
export function useSliderDefaults(): SliderDefaults {
  return useContext(SliderDefaultsContext);
}

/**
 * An application decides once what its sliders look like and which locale their
 * values are written in, rather than repeating the same props on every scale. A
 * slider that states any of them itself still wins.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a slider inside
 * a field takes the field's step and this provider answers only outside one.
 */
export function SliderDefaultsProvider({ children, ...defaults }: SliderDefaultsProviderProps) {
  const inherited = useSliderDefaults();

  return (
    <SliderDefaultsContext.Provider
      value={{
        locale: defaults.locale ?? inherited.locale,
        orientation: defaults.orientation ?? inherited.orientation,
        size: defaults.size ?? inherited.size,
        valueLabel: defaults.valueLabel ?? inherited.valueLabel,
      }}
    >
      {children}
    </SliderDefaultsContext.Provider>
  );
}
