import { FormDefaultsContext, useFormDefaults } from './form-context';
import type { FormDefaultsProviderProps } from './form.types';

/**
 * An application decides once how its forms behave: when they validate, where
 * focus goes after a failed submit, what the summary is called, and how its
 * action row is arranged. A form that states any of them itself still wins.
 *
 * `summaryTitle` is the one worth setting first, because it is the only string
 * this family writes and the only place a reader is told, in words, that
 * something is wrong.
 */
export function FormDefaultsProvider({ children, ...defaults }: FormDefaultsProviderProps) {
  const inherited = useFormDefaults();

  return (
    <FormDefaultsContext.Provider
      value={{
        align: defaults.align ?? inherited.align,
        errorFocus: defaults.errorFocus ?? inherited.errorFocus,
        nativeValidation: defaults.nativeValidation ?? inherited.nativeValidation,
        summary: defaults.summary ?? inherited.summary,
        summaryDescription: defaults.summaryDescription ?? inherited.summaryDescription,
        summaryTitle: defaults.summaryTitle ?? inherited.summaryTitle,
        validate: defaults.validate ?? inherited.validate,
      }}
    >
      {children}
    </FormDefaultsContext.Provider>
  );
}
