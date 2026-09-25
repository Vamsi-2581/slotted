import { createContext, useContext } from 'react';

import type { WizardDefaults, WizardDefaultsProviderProps, WizardLabels } from './wizard.types';

export const DEFAULT_WIZARD_LABELS: WizardLabels = {
  cancel: 'Cancel',
  draftFailed: 'The draft could not be saved',
  edit: 'Change',
  incomplete: 'Complete this step to submit',
  next: 'Next',
  optional: 'Optional',
  position: (index, count) => `Step ${index} of ${count}`,
  previous: 'Back',
  progress: 'Progress',
  restoring: 'Restoring your draft',
  return: 'Save and return',
  saveDraft: 'Save draft',
  saved: (savedAt) =>
    `Draft saved at ${savedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
  saving: 'Saving draft…',
  skip: 'Skip',
  submit: 'Submit',
  submitFailed: 'The submission did not go through',
};

/**
 * `linear` is on: the wave's scope says direct navigation depends on the
 * steps already completed. `delay` and `minDuration` are the loading-states
 * pair, so a restore that answers in eighty milliseconds draws nothing.
 */
export const WIZARD_FALLBACK: WizardDefaults = {
  delay: 200,
  labels: DEFAULT_WIZARD_LABELS,
  level: 2,
  linear: true,
  minDuration: 400,
  progress: 'start',
  scroll: 'ancestor',
};

const WizardDefaultsContext = createContext<WizardDefaults>(WIZARD_FALLBACK);

/** What a wizard behaves like here, before it states anything of its own. */
export function useWizardDefaults(): WizardDefaults {
  return useContext(WizardDefaultsContext);
}

/**
 * An application decides once how its wizards lay out and what their actions
 * say. A wizard that states any of them itself still wins.
 */
export function WizardDefaultsProvider({
  children,
  labels,
  ...defaults
}: WizardDefaultsProviderProps) {
  const inherited = useWizardDefaults();
  const value: WizardDefaults = {
    ...inherited,
    ...stated(defaults),
    labels: { ...inherited.labels, ...stated(labels ?? {}) },
  };
  return <WizardDefaultsContext.Provider value={value}>{children}</WizardDefaultsContext.Provider>;
}

/** A provider that states nothing must not overwrite what it inherited with `undefined`. */
function stated<T extends object>(values: T): Partial<T> {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}
