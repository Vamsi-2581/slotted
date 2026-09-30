import { inject, InjectionToken } from '@angular/core';
import type { Signal } from '@angular/core';

/** The type step the control sits at, matching the field around it. */
export type TextFieldSize = 'sm' | 'md' | 'lg';

/**
 * How much frame the control shows. `outline` takes the ground it is placed on,
 * `subtle` sinks into the page, and `plain` shows nothing at rest — which is
 * what a dense table needs: a cell that is only a control while it is used, and
 * that keeps the same box so the row does not reflow under the pointer.
 */
export type TextFieldVariant = 'outline' | 'subtle' | 'plain';

/**
 * The six text types. Anything else an `input` accepts still reaches the
 * element, because the consumer writes it there; the six are the ones this
 * family paints, sizes and reveals.
 */
export type TextFieldType = 'text' | 'search' | 'email' | 'url' | 'tel' | 'password';

/**
 * The words the family's own buttons and marks announce.
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

export interface TextFieldDefaults {
  capsLockLabel: string;
  clearLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
  copyLabel: string;
  mono: boolean;
  revealLabel: string;
  size: TextFieldSize;
  variant: TextFieldVariant;
}

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

export const TEXT_FIELD_DEFAULTS = new InjectionToken<TextFieldDefaults>(
  'slotted text field defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once what its text fields look like and what their two
 * buttons are called, rather than repeating the same inputs on every control in
 * a form. A control that states any of them itself still wins.
 *
 * `size` is the one the field outranks: a `size="sm"` field holding an `md`
 * control is a field and a control disagreeing about one row, so a control
 * inside a field takes the field's step and this token answers only outside
 * one.
 */
export function provideTextFieldDefaults(defaults: Partial<TextFieldDefaults>) {
  return {
    provide: TEXT_FIELD_DEFAULTS,
    useFactory: (): TextFieldDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

/** What a text field renders as here, before it states anything of its own. */
export function injectTextFieldDefaults(): TextFieldDefaults {
  return inject(TEXT_FIELD_DEFAULTS);
}

/**
 * What the frame needs to know about the control inside it, and what the
 * control needs the frame to call.
 *
 * It is an abstract class rather than an import so the two directives can
 * depend on each other without a cycle — the shape `SlFieldDefaultsSource`
 * already has in `field`. The input provides itself as this, and the frame
 * queries for it.
 */
export abstract class SlTextFieldControl {
  /** Whether there is anything to clear. */
  abstract readonly empty: Signal<boolean>;
  /** Whether the control is a password, which is what the toggle is for. */
  abstract readonly password: Signal<boolean>;
  /** Whether the password is currently showing. */
  abstract readonly revealed: Signal<boolean>;
  /** Whether Caps Lock is on while a password has focus. */
  abstract readonly capsLock: Signal<boolean>;
  /** What the element shows, for the copy button. */
  abstract readonly currentValue: Signal<string>;
  abstract readonly resolvedDisabled: Signal<boolean | undefined>;
  abstract readonly resolvedReadOnly: Signal<boolean | undefined>;
  abstract readonly resolvedInvalid: Signal<boolean | undefined>;
  /** Empties the value with reason `clear` and returns focus to the control. */
  abstract clear(source: Event): void;
  /** Turns the password from dots into characters, and holds the caret. */
  abstract toggleReveal(source: Event): void;
}

/** What a finished copy reports: whether the clipboard took it, and why it was asked. */
export interface TextFieldCopyDetail {
  copied: boolean;
  reason: 'pointer' | 'keyboard';
  source: Event;
  value: string;
}
