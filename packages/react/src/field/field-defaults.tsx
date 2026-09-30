import { createContext, useContext, useMemo } from 'react';

import type { FieldDefaults, FieldDefaultsProviderProps, FieldNecessityWords } from './field.types';

/**
 * The two words `necessity="optional"` and `necessity="words"` write.
 *
 * Spectrum's `necessityIndicator="label"` publishes the idea and localises the
 * pair itself; here it is a value an application replaces, because a library
 * that shipped its own translations would be a library an application has to
 * agree with about Portuguese.
 */
export const FIELD_NECESSITY_WORDS: FieldNecessityWords = {
  optional: '(optional)',
  required: '(required)',
};

/**
 * The accessible name of the help control. The hint itself describes the
 * button, so the name says what the button is for rather than repeating the
 * hint; an application translates it once, and a page that wants the label in
 * the name writes `aria-label` on the one control.
 */
export const FIELD_HELP_LABEL = 'More information';

const FALLBACK: FieldDefaults = {
  disabled: undefined,
  helpLabel: FIELD_HELP_LABEL,
  labelPlacement: 'top',
  necessity: 'mark',
  necessityWords: FIELD_NECESSITY_WORDS,
  readOnly: undefined,
  size: 'md',
};

const FieldDefaultsContext = createContext<FieldDefaults>(FALLBACK);

/** What a field renders as here, before it states anything of its own. */
export function useFieldDefaults(): FieldDefaults {
  return useContext(FieldDefaultsContext);
}

/**
 * An application decides once what its fields look like and what its necessity
 * words are, rather than repeating the same props on every field in a form.
 * `FieldGroup` renders one of these for the fields inside it, so a compact
 * section — or a disabled one — is one attribute rather than one per field.
 *
 * Among the surveyed implementations only Angular Material ships
 * application-wide defaults, and only for Angular.
 *
 * `disabled` and `readOnly` are here and `invalid` and `required` are not. The
 * first two describe a context a whole section can be in; the second two are
 * facts about one value, and a provider that set them would mark every field in
 * a section as required for a reason no field could name.
 */
export function FieldDefaultsProvider({
  children,
  disabled,
  helpLabel,
  labelPlacement,
  necessity,
  necessityWords,
  readOnly,
  size,
}: FieldDefaultsProviderProps) {
  const inherited = useFieldDefaults();
  const value = useMemo<FieldDefaults>(
    () => ({
      disabled: disabled ?? inherited.disabled,
      helpLabel: helpLabel ?? inherited.helpLabel,
      labelPlacement: labelPlacement ?? inherited.labelPlacement,
      necessity: necessity ?? inherited.necessity,
      necessityWords: { ...inherited.necessityWords, ...necessityWords },
      readOnly: readOnly ?? inherited.readOnly,
      size: size ?? inherited.size,
    }),
    [disabled, helpLabel, inherited, labelPlacement, necessity, necessityWords, readOnly, size],
  );

  return <FieldDefaultsContext.Provider value={value}>{children}</FieldDefaultsContext.Provider>;
}
