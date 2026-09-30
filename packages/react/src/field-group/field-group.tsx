import '@slotted/styles/field-group/field-group.css';

import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';

import { FieldDefaultsProvider, useFieldDefaults } from '../field';
import type {
  FieldGroupContextValue,
  FieldGroupIds,
  FieldGroupProps,
  FieldGroupRootProps,
} from './field-group.types';

export const FieldGroupContext = createContext<FieldGroupContextValue | undefined>(undefined);

/** What the group around this component says, or `undefined` if there is none. */
export function useFieldGroup(): FieldGroupContextValue | undefined {
  return useContext(FieldGroupContext);
}

/** The three identifiers a group derives from its base, in one place. */
export function deriveFieldGroupIds(base: string): FieldGroupIds {
  return {
    description: `${base}-description`,
    error: `${base}-error`,
    legend: `${base}-legend`,
  };
}

/**
 * A set of fields under one name.
 *
 * **The platform does the work.** The element is a native `fieldset` and the
 * name is a native `legend` — the technique the APG's naming practice calls for
 * under its Rule 3, prefer native techniques — so the `group` role and the
 * accessible name arrive without a single ARIA attribute. `disabled` is the
 * native attribute, and every control inside is disabled by the browser with
 * nothing passed down.
 *
 * **What is said about the set is said before the set.** The description and
 * the error come between the legend and the fields, which is where GOV.UK's
 * fieldset example puts a hint and an error, and the opposite of where a single
 * field puts its own.
 *
 * **`aria-describedby` goes on the fieldset.** A reader entering any control in
 * the group hears the group's hint and its error once, from the element that
 * names them both.
 *
 * **The group provides for its fields.** `size`, `labelPlacement`,
 * `necessity`, the necessity words, the help label, `disabled` and `readOnly` reach every
 * field inside through the same provider an application uses, so a compact
 * section is one attribute rather than one per field. `required` is not
 * provided: it is a fact about one value, and a section cannot know it.
 */
export function FieldGroup({
  'aria-describedby': describedBy,
  children,
  disabled,
  helpLabel,
  id,
  invalid,
  labelPlacement,
  necessity,
  necessityWords,
  orientation,
  readOnly,
  ref,
  render,
  required,
  size,
  ...nativeProps
}: FieldGroupProps) {
  const defaults = useFieldDefaults();
  const generatedId = useId();
  const ids = useMemo(
    () => deriveFieldGroupIds(id ?? `slotted-field-group-${generatedId}`),
    [generatedId, id],
  );

  const [messages, setMessages] = useState<readonly ('description' | 'error')[]>([]);
  const registerMessage = useCallback((slot: 'description' | 'error', present: boolean) => {
    setMessages((current) => {
      if (present === current.includes(slot)) return current;
      return present ? [...current, slot] : current.filter((candidate) => candidate !== slot);
    });
  }, []);

  const resolvedSize = size ?? defaults.size;
  const resolvedNecessity = necessity ?? defaults.necessity;
  const resolvedWords = { ...defaults.necessityWords, ...necessityWords };

  const merged =
    [
      describedBy,
      messages.includes('description') ? ids.description : undefined,
      messages.includes('error') ? ids.error : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const value: FieldGroupContextValue = {
    ids,
    /**
     * One step louder than a field's own. `inline-message` defines `md` as the
     * message of a section and `sm` as the message of a field, and what a group
     * says is about the section — held at the field's step, the sentence about
     * a whole set read as the help under the control above it.
     */
    messageSize: resolvedSize === 'sm' ? 'sm' : 'md',
    necessityWords: resolvedWords,
    necessity: resolvedNecessity,
    registerMessage,
    required,
    size: resolvedSize,
  };

  const rootProps: FieldGroupRootProps = {
    ...nativeProps,
    'aria-describedby': merged,
    children,
    ...(disabled === true ? { 'data-disabled': '' } : {}),
    ...(invalid === true ? { 'data-invalid': '' } : {}),
    ...(readOnly === true ? { 'data-readonly': '' } : {}),
    ...(required === true ? { 'data-required': '' } : {}),
    'data-orientation': orientation ?? 'vertical',
    'data-necessity': resolvedNecessity,
    'data-part': 'root',
    'data-size': resolvedSize,
    'data-ui': 'field-group',
    disabled,
  };

  return (
    <FieldGroupContext.Provider value={value}>
      <FieldDefaultsProvider
        disabled={disabled}
        helpLabel={helpLabel}
        labelPlacement={labelPlacement}
        necessity={resolvedNecessity}
        necessityWords={resolvedWords}
        readOnly={readOnly}
        size={resolvedSize}
      >
        {render === undefined ? <fieldset {...rootProps} ref={ref} /> : render(rootProps)}
      </FieldDefaultsProvider>
    </FieldGroupContext.Provider>
  );
}
