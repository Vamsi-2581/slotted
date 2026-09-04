import { createContext, useContext } from 'react';

import type {
  DescriptionListDefaults,
  DescriptionListDefaultsProviderProps,
  DescriptionListLabels,
  DescriptionListResolvedLabels,
} from './description-list.types';

/**
 * The words the family says when nothing else says them. They are English
 * because the package is, and every one of them is replaceable in two places:
 * once for an application, through the provider below, and once for a list.
 */
export const DEFAULT_DESCRIPTION_LIST_LABELS: DescriptionListResolvedLabels = {
  collapse: 'Show less',
  copied: 'Copied',
  copy: 'Copy',
  placeholder: 'Not provided',
  reveal: 'Show more',
};

/**
 * An explicit value wins, and an absent one defers. Spreading two objects would
 * not do it: a property written as `undefined` is a property, and it would
 * overwrite the answer the provider above had already given.
 */
export function resolveLabels(
  ...sources: (DescriptionListLabels | undefined)[]
): DescriptionListLabels {
  const answered: DescriptionListLabels = {};
  for (const source of sources) {
    for (const key of Object.keys(source ?? {}) as (keyof DescriptionListLabels)[]) {
      answered[key] = source?.[key] ?? answered[key];
    }
  }
  return answered;
}

const DescriptionListDefaultsContext = createContext<DescriptionListDefaults>({});

export function useDescriptionListDefaults(): DescriptionListDefaults {
  return useContext(DescriptionListDefaultsContext);
}

/**
 * An application decides once how its details panels are arranged and what
 * their controls are called. A list that states any of it itself still wins:
 * an explicit prop is never overridden by context.
 */
export function DescriptionListDefaultsProvider({
  children,
  ...defaults
}: DescriptionListDefaultsProviderProps) {
  const inherited = useDescriptionListDefaults();

  return (
    <DescriptionListDefaultsContext.Provider
      value={{
        columns: defaults.columns ?? inherited.columns,
        labels: resolveLabels(inherited.labels, defaults.labels),
        layout: defaults.layout ?? inherited.layout,
        termWidth: defaults.termWidth ?? inherited.termWidth,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </DescriptionListDefaultsContext.Provider>
  );
}
