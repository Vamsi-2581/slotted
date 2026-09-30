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
 * implementation draws on a required field; `optional` writes `(optional)` on
 * the fields a reader may skip and nothing on the others, which is what GOV.UK
 * and Carbon recommend for a form where most fields are required; `words`
 * writes `(required)` on a required field and `(optional)` on one that is not;
 * `none` says nothing, for a form where every field is required and the form
 * says so once.
 */
export type FieldNecessity = 'mark' | 'optional' | 'words' | 'none';

/** The two words `necessity="optional"` and `necessity="words"` write, so an application translates them once. */
export interface FieldNecessityWords {
  required: string;
  optional: string;
}

/** The identifiers a field derives from one base. */
export interface FieldIds {
  control: string;
  counter: string;
  description: string;
  error: string;
  help: string;
  indicator: string;
  label: string;
}

/**
 * The parts that join the control's `aria-describedby`, in the order the
 * contract reads them: what qualifies the field, the help behind the icon, the
 * description, the count, the error.
 */
export type FieldDescribedSlot = 'indicator' | 'help' | 'description' | 'counter' | 'error';

export const FIELD_DESCRIBED_ORDER: readonly FieldDescribedSlot[] = [
  'indicator',
  'help',
  'description',
  'counter',
  'error',
];

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

export interface FieldDefaults {
  disabled: boolean | undefined;
  /** The accessible name of every help control, until one states its own. */
  helpLabel: string;
  labelPlacement: FieldLabelPlacement;
  necessity: FieldNecessity;
  necessityWords: FieldNecessityWords;
  readOnly: boolean | undefined;
  size: FieldSize;
}

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
      helpLabel: defaults.helpLabel ?? FALLBACK.helpLabel,
      labelPlacement: defaults.labelPlacement ?? FALLBACK.labelPlacement,
      necessity: defaults.necessity ?? FALLBACK.necessity,
      necessityWords: { ...FALLBACK.necessityWords, ...defaults.necessityWords },
      readOnly: defaults.readOnly ?? FALLBACK.readOnly,
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

/** The identifiers a field derives from its base, in one place. */
export function deriveFieldIds(base: string): FieldIds {
  return {
    control: `${base}-control`,
    counter: `${base}-counter`,
    description: `${base}-description`,
    error: `${base}-error`,
    help: `${base}-help`,
    indicator: `${base}-indicator`,
    label: `${base}-label`,
  };
}

/**
 * What the necessity mark says, and whether a reader hears it. The asterisk is
 * hidden, because `aria-required` on the control already carries the fact and a
 * form of twenty required fields does not need "asterisk" twenty times; the
 * words are not, because `(optional)` is information rather than decoration.
 * `null` when nothing is drawn. `slFieldGroupLegend` draws its mark with the
 * same answer.
 */
export function necessityMark(
  necessity: FieldNecessity,
  required: boolean,
  words: FieldNecessityWords,
): { hidden: boolean; text: string } | null {
  switch (necessity) {
    case 'mark':
      return required ? { hidden: true, text: '*' } : null;
    case 'optional':
      return required ? null : { hidden: false, text: words.optional };
    case 'words':
      return { hidden: false, text: required ? words.required : words.optional };
    case 'none':
      return null;
  }
}

/**
 * The field as the parts that live in a module `field.ts` imports see it — the
 * counter today. Provided by `SlField` as itself, so the counter reaches the
 * field's identifiers without importing it, which would be a cycle.
 */
export abstract class SlFieldContext {
  abstract ids(): FieldIds;
}

/**
 * The parts the field looks for without importing them. Each part provides
 * its marker as itself, and the field queries the marker; importing the part
 * classes into `field.ts` would be a cycle, since every one of them injects
 * `SlField`.
 */
export abstract class SlFieldHeaderSlot {}
export abstract class SlFieldHelpSlot {}
export abstract class SlFieldIndicatorSlot {}

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
