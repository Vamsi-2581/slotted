import { setPortalContainer } from '@slotted/core/portal';
import { formatTourProgress } from '@slotted/core/tour';
import { createContext, useContext, useEffect } from 'react';

import type { TourDefaults, TourDefaultsProviderProps, TourLabels } from './tour.types';

export const DEFAULT_TOUR_LABELS: TourLabels = {
  close: 'Close tour',
  done: 'Done',
  next: 'Next',
  preparing: 'Preparing the next step',
  prev: 'Back',
  progress: formatTourProgress,
  skip: 'Skip tour',
};

/**
 * `closeOnOutsidePress` is off: a press on the scrim is the easiest press on
 * the page to make by accident, and it would throw away where the reader was.
 * `targetTimeout` is zero: a wait shows nothing new, so a consumer whose
 * target renders late says how late.
 */
export const TOUR_FALLBACK: TourDefaults = {
  align: 'center',
  alignOffset: 0,
  arrow: true,
  arrowPadding: 12,
  autoFocus: true,
  closeOnEscape: true,
  closeOnOutsidePress: false,
  collisionPadding: 8,
  keyboardNavigation: true,
  labels: DEFAULT_TOUR_LABELS,
  layout: 'auto',
  missing: 'center',
  modal: true,
  scrollIntoView: true,
  side: 'bottom',
  sideOffset: 0,
  size: 'md',
  spotlight: true,
  targetTimeout: 0,
};

const TourDefaultsContext = createContext<TourDefaults>(TOUR_FALLBACK);

/** What a tour renders as here, before it states anything of its own. */
export function useTourDefaults(): TourDefaults {
  return useContext(TourDefaultsContext);
}

/**
 * An application decides once how its tours behave and what their controls
 * say. A tour that states any of them itself still wins, and so does a step.
 */
export function TourDefaultsProvider({
  children,
  container,
  labels,
  ...defaults
}: TourDefaultsProviderProps) {
  const inherited = useTourDefaults();
  const value: TourDefaults = {
    ...inherited,
    ...stated(defaults),
    labels: { ...inherited.labels, ...stated(labels ?? {}) },
  };

  useEffect(() => {
    if (container === undefined) return;
    setPortalContainer(container);
    return () => setPortalContainer(null);
  }, [container]);

  return <TourDefaultsContext.Provider value={value}>{children}</TourDefaultsContext.Provider>;
}

/** A provider that states nothing must not overwrite what it inherited with `undefined`. */
function stated<T extends object>(values: T): Partial<T> {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}
