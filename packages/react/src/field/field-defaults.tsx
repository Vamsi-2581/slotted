import { createContext, useContext, useMemo } from 'react';

import type { FieldDefaults, FieldDefaultsProviderProps, FieldNecessityWords } from './field.types';

/**
 * The two words `requiredMark="text"` writes.
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

const FALLBACK: FieldDefaults = {
  disabled: undefined,
  labelPlacement: 'top',
  necessityWords: FIELD_NECESSITY_WORDS,
  readOnly: undefined,
  requiredMark: 'mark',
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
  labelPlacement,
  necessityWords,
  readOnly,
  requiredMark,
  size,
}: FieldDefaultsProviderProps) {
  const inherited = useFieldDefaults();
  const value = useMemo<FieldDefaults>(
    () => ({
      disabled: disabled ?? inherited.disabled,
      labelPlacement: labelPlacement ?? inherited.labelPlacement,
      necessityWords: { ...inherited.necessityWords, ...necessityWords },
      readOnly: readOnly ?? inherited.readOnly,
      requiredMark: requiredMark ?? inherited.requiredMark,
      size: size ?? inherited.size,
    }),
    [disabled, inherited, labelPlacement, necessityWords, readOnly, requiredMark, size],
  );

  return <FieldDefaultsContext.Provider value={value}>{children}</FieldDefaultsContext.Provider>;
}
