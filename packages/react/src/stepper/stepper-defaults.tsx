import { createContext, useContext } from 'react';

import type { StepperDefaults, StepperDefaultsProviderProps } from './stepper.types';

const StepperDefaultsContext = createContext<StepperDefaults>({});

export function useStepperDefaults(): StepperDefaults {
  return useContext(StepperDefaultsContext);
}

/**
 * An application decides once which way its flows run, where the labels sit,
 * whether a header can be pressed, whether the order is enforced, and what a
 * step announces in the language it ships. A stepper that states any of those
 * itself still wins: an explicit prop is never overridden by context.
 *
 * `labels` is merged rather than replaced, so an application translating one
 * word keeps the other five.
 */
export function StepperDefaultsProvider({ children, ...defaults }: StepperDefaultsProviderProps) {
  const inherited = useStepperDefaults();

  return (
    <StepperDefaultsContext.Provider
      value={{
        label: defaults.label ?? inherited.label,
        labelPlacement: defaults.labelPlacement ?? inherited.labelPlacement,
        labels: { ...inherited.labels, ...defaults.labels },
        linear: defaults.linear ?? inherited.linear,
        navigation: defaults.navigation ?? inherited.navigation,
        orientation: defaults.orientation ?? inherited.orientation,
      }}
    >
      {children}
    </StepperDefaultsContext.Provider>
  );
}
