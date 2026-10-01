import { CAROUSEL_MESSAGES, DEFAULT_AUTOPLAY_DELAY } from '@slotted/core/carousel';
import { createContext, useContext } from 'react';

import type { CarouselDefaults, CarouselDefaultsProviderProps } from './carousel.types';

const FALLBACK: CarouselDefaults = {
  align: 'start',
  arrows: 'inset',
  autoplayDelay: DEFAULT_AUTOPLAY_DELAY,
  draggable: true,
  locale: undefined,
  loop: false,
  messages: CAROUSEL_MESSAGES,
  orientation: 'horizontal',
  size: 'md',
  transition: 'slide',
};

const CarouselDefaultsContext = createContext<CarouselDefaults>(FALLBACK);

/** What a carousel renders as here, before it states anything of its own. */
export function useCarouselDefaults(): CarouselDefaults {
  return useContext(CarouselDefaultsContext);
}

/**
 * An application decides once how its carousels look and move, and in which
 * words they speak. A carousel that states any of it itself still wins.
 */
export function CarouselDefaultsProvider({
  children,
  messages,
  ...defaults
}: CarouselDefaultsProviderProps) {
  const inherited = useCarouselDefaults();

  return (
    <CarouselDefaultsContext.Provider
      value={{
        align: defaults.align ?? inherited.align,
        arrows: defaults.arrows ?? inherited.arrows,
        autoplayDelay: defaults.autoplayDelay ?? inherited.autoplayDelay,
        draggable: defaults.draggable ?? inherited.draggable,
        locale: defaults.locale ?? inherited.locale,
        loop: defaults.loop ?? inherited.loop,
        messages: { ...inherited.messages, ...messages },
        orientation: defaults.orientation ?? inherited.orientation,
        size: defaults.size ?? inherited.size,
        transition: defaults.transition ?? inherited.transition,
      }}
    >
      {children}
    </CarouselDefaultsContext.Provider>
  );
}
