import { inject, Injectable, InjectionToken } from '@angular/core';

/** The type step the field sits at, matching the control it wraps. */
export type FieldSize = 'sm' | 'md' | 'lg';

/**
 * Where the label sits relative to the control. `side` reflows to `top` when
 * the field's own inline size falls below 320 pixels, so a field in a drawer
 * stacks while the same field in a page grid stays beside its control.
 */
export type FieldLabelPlacement = 'top' | 'side';

/**
 * How necessity is said. `mark` draws the asterisk every surveyed
 * implementation draws; `text` writes `(required)` on a required field and
 * `(optional)` on one that is not; `none` says nothing.
 */
export type FieldRequiredMark = 'mark' | 'text' | 'none';

/** The two words `requiredMark="text"` writes, so an application translates them once. */
export interface FieldNecessityWords {
  required: string;
  optional: string;
}

/** The four identifiers a field derives from one base. */
export interface FieldIds {
  control: string;
  description: string;
  error: string;
  label: string;
}

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

export interface FieldDefaults {
  disabled: boolean | undefined;
  labelPlacement: FieldLabelPlacement;
  necessityWords: FieldNecessityWords;
  readOnly: boolean | undefined;
  requiredMark: FieldRequiredMark;
  size: FieldSize;
}

const FALLBACK: FieldDefaults = {
  disabled: undefined,
  labelPlacement: 'top',
  necessityWords: FIELD_NECESSITY_WORDS,
  readOnly: undefined,
  requiredMark: 'mark',
  size: 'md',
};

export const FIELD_DEFAULTS = new InjectionToken<FieldDefaults>('slotted field defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

/**
 * An application decides once what its fields look like and what its necessity
 * words are, rather than repeating the same inputs on every field in a form.
 * `SlFieldGroup` provides an overriding value for its own subtree, so a compact
 * section — or a disabled one — is one attribute rather than one per field.
 *
 * Among the surveyed implementations only Angular Material ships
 * application-wide defaults, and this is that idea taken to both bindings.
 *
 * `disabled` and `readOnly` are here and `invalid` and `required` are not. The
 * first two describe a context a whole section can be in; the second two are
 * facts about one value, and a token that set them would mark every field in an
 * application as required for a reason no field could name.
 */
export function provideFieldDefaults(
  defaults: Partial<Omit<FieldDefaults, 'necessityWords'>> & {
    necessityWords?: Partial<FieldNecessityWords>;
  },
) {
  return {
    provide: FIELD_DEFAULTS,
    useFactory: (): FieldDefaults => ({
      disabled: defaults.disabled ?? FALLBACK.disabled,
      labelPlacement: defaults.labelPlacement ?? FALLBACK.labelPlacement,
      necessityWords: { ...FALLBACK.necessityWords, ...defaults.necessityWords },
      readOnly: defaults.readOnly ?? FALLBACK.readOnly,
      requiredMark: defaults.requiredMark ?? FALLBACK.requiredMark,
      size: defaults.size ?? FALLBACK.size,
    }),
  };
}

/** What a field renders as here, before it states anything of its own. */
export function injectFieldDefaults(): FieldDefaults {
  return inject(FIELD_DEFAULTS);
}

/**
 * A component in the tree answering for the fields under it, which is what
 * `field-group` is. It exists as a class of its own so `@slotted/angular/field`
 * never has to know that `field-group` exists — the dependency runs one way,
 * from the group to the field.
 *
 * It is read rather than snapshotted, because Angular creates every directive
 * in a template before it binds any input: a group that handed its fields a
 * value in its constructor would hand them the value its inputs had before the
 * consumer's bindings ran, which is the default for all six.
 */
export abstract class SlFieldDefaultsSource {
  abstract fieldDefaults(): FieldDefaults;
}

/** The four identifiers a field derives from its base, in one place. */
export function deriveFieldIds(base: string): FieldIds {
  return {
    control: `${base}-control`,
    description: `${base}-description`,
    error: `${base}-error`,
    label: `${base}-label`,
  };
}

/**
 * Application-scoped rather than module-scoped, for the reason `inline-message`
 * records: a module-level counter produces colliding sequences when two
 * applications render in one server process, and the server and the client
 * sequences must match for hydration.
 */
@Injectable({ providedIn: 'root' })
export class SlFieldIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-field-${this.count}`;
  }
}
