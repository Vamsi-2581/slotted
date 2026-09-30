import { createContext, useContext } from 'react';

import type { TextFieldDefaults, TextFieldDefaultsProviderProps } from './text-field.types';

/**
 * The words the family's own buttons and marks announce. They are constants rather
 * than strings built inside the component, because the only translation layer
 * this library has is the consumer's — a provider at the top of the
 * application, or a prop on the control.
 *
 * The reveal label does not change with the state. That is the APG's rule for a
 * toggle: `aria-pressed` says whether the password is showing, and a label that
 * changed with it would say the same thing twice and disagree with itself in
 * the moment between.
 */
export const TEXT_FIELD_CLEAR_LABEL = 'Clear';
export const TEXT_FIELD_REVEAL_LABEL = 'Show password';
export const TEXT_FIELD_COPY_LABEL = 'Copy';
export const TEXT_FIELD_COPIED_LABEL = 'Copied';
export const TEXT_FIELD_COPY_FAILED_LABEL = 'Copy failed';
export const TEXT_FIELD_CAPS_LOCK_LABEL = 'Caps Lock is on';

const FALLBACK: TextFieldDefaults = {
  capsLockLabel: TEXT_FIELD_CAPS_LOCK_LABEL,
  clearLabel: TEXT_FIELD_CLEAR_LABEL,
  copiedLabel: TEXT_FIELD_COPIED_LABEL,
  copyFailedLabel: TEXT_FIELD_COPY_FAILED_LABEL,
  copyLabel: TEXT_FIELD_COPY_LABEL,
  mono: false,
  revealLabel: TEXT_FIELD_REVEAL_LABEL,
  size: 'md',
  variant: 'outline',
};

const TextFieldDefaultsContext = createContext<TextFieldDefaults>(FALLBACK);

/** What a text field renders as here, before it states anything of its own. */
export function useTextFieldDefaults(): TextFieldDefaults {
  return useContext(TextFieldDefaultsContext);
}

/**
 * An application decides once what its text fields look like and what their two
 * buttons are called, rather than repeating the same props on every control in
 * a form. A control that states any of them itself still wins.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a control
 * inside a field takes the field's step and this provider answers only outside
 * one. Among the surveyed implementations only Angular Material ships
 * application-wide defaults, and only for Angular.
 */
export function TextFieldDefaultsProvider({
  children,
  ...defaults
}: TextFieldDefaultsProviderProps) {
  const inherited = useTextFieldDefaults();

  return (
    <TextFieldDefaultsContext.Provider
      value={{
        capsLockLabel: defaults.capsLockLabel ?? inherited.capsLockLabel,
        clearLabel: defaults.clearLabel ?? inherited.clearLabel,
        copiedLabel: defaults.copiedLabel ?? inherited.copiedLabel,
        copyFailedLabel: defaults.copyFailedLabel ?? inherited.copyFailedLabel,
        copyLabel: defaults.copyLabel ?? inherited.copyLabel,
        mono: defaults.mono ?? inherited.mono,
        revealLabel: defaults.revealLabel ?? inherited.revealLabel,
        size: defaults.size ?? inherited.size,
        variant: defaults.variant ?? inherited.variant,
      }}
    >
      {children}
    </TextFieldDefaultsContext.Provider>
  );
}
