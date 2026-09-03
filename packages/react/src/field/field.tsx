import '@slotted/styles/field/field.css';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { deriveFieldIds, FieldContext, formatFieldCount, isFieldCountOver } from './field-context';
import { useFieldDefaults } from './field-defaults';
import type { FieldContextValue, FieldCount, FieldProps, FieldRootProps } from './field.types';

const isDevelopment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

/**
 * One control, its name, its necessity, its help and its error — and the
 * identifiers that bind the four together.
 *
 * **Every shared state is unset rather than `false`.** `disabled`, `invalid`,
 * `required` and `readOnly` default to `undefined`, so a field defers to the
 * `FieldGroup` around it and the group to the application. A field that
 * defaulted to `false` could not be told from a consumer saying "not disabled",
 * and it would quietly override a disabled section.
 *
 * **The identifiers are derived, not registered.** One base yields four, so
 * `label[for]` resolves to the identifier the control will use with no ordering
 * dependency between siblings and nothing to coordinate during hydration.
 *
 * **`aria-required`, never the native `required`.** The native attribute
 * engages browser constraint validation and changes submit behaviour, which the
 * library must not impose as a side effect of describing a field. A consumer
 * who wants it writes it on the control, and it survives: an explicit value on
 * the control always wins.
 *
 * **The control counts and the field places the count.** A control this library
 * ships publishes the length of its value and the limit it was given; the field
 * draws the counter in the spare column of its label row, and only when the
 * page has written no counter of its own. A count over words, bytes or line
 * items is one only the page can compute, so a written counter always wins.
 */
export function Field({
  children,
  disabled,
  id,
  invalid,
  labelPlacement,
  necessityWords,
  readOnly,
  ref,
  render,
  required,
  requiredMark,
  size,
  ...nativeProps
}: FieldProps) {
  const defaults = useFieldDefaults();
  const generatedId = useId();
  const ids = useMemo(
    () => deriveFieldIds(id ?? `slotted-field-${generatedId}`),
    [generatedId, id],
  );

  const [messages, setMessages] = useState<readonly ('description' | 'error')[]>([]);
  const [count, setCount] = useState<FieldCount | undefined>(undefined);
  const [hasCounter, setHasCounter] = useState(false);
  const hasControl = useRef(false);

  const registerMessage = useCallback((slot: 'description' | 'error', present: boolean) => {
    setMessages((current) => {
      if (present === current.includes(slot)) return current;
      return present ? [...current, slot] : current.filter((candidate) => candidate !== slot);
    });
  }, []);

  const registerControl = useCallback(() => {
    hasControl.current = true;
  }, []);

  const registerCounter = useCallback((present: boolean) => setHasCounter(present), []);

  useEffect(() => {
    if (!isDevelopment || hasControl.current) return;
    console.warn(
      'Field rendered without a control. Wrap the control in FieldControl, or use a control that reads the field, so the label resolves.',
    );
  }, []);

  /**
   * Description first, error second, whatever order the page wrote them in. Two
   * known slots have one correct reading order, and deriving it from
   * registration order would make the accessible description depend on when an
   * effect ran.
   */
  const describedBy =
    [
      messages.includes('description') ? ids.description : undefined,
      messages.includes('error') ? ids.error : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const resolvedSize = size ?? defaults.size;
  const resolvedDisabled = disabled ?? defaults.disabled;
  const resolvedReadOnly = readOnly ?? defaults.readOnly;
  const resolvedRequiredMark = requiredMark ?? defaults.requiredMark;

  const value: FieldContextValue = {
    count,
    describedBy,
    disabled: resolvedDisabled,
    ids,
    invalid,
    /* A message is quieter than the control it is about, so it starts one step
       below and only the largest field's message reaches the second step. */
    messageSize: resolvedSize === 'lg' ? 'md' : 'sm',
    necessityWords: { ...defaults.necessityWords, ...necessityWords },
    readOnly: resolvedReadOnly,
    registerControl,
    registerCounter,
    registerMessage,
    required,
    requiredMark: resolvedRequiredMark,
    setCount,
    size: resolvedSize,
  };

  /**
   * Drawn by the field only when the page drew none. Its place in the DOM does
   * not matter — the stylesheet puts it in the label row's spare column — so it
   * is written last rather than woven into the page's own children.
   */
  const drawnCounter =
    count === undefined || hasCounter ? null : (
      <span {...(isFieldCountOver(count) ? { 'data-invalid': '' } : {})} data-part="counter">
        {formatFieldCount(count)}
      </span>
    );

  const rootProps: FieldRootProps = {
    ...nativeProps,
    children: (
      <>
        {children}
        {drawnCounter}
      </>
    ),
    ...(resolvedDisabled === true ? { 'data-disabled': '' } : {}),
    ...(invalid === true ? { 'data-invalid': '' } : {}),
    ...(resolvedReadOnly === true ? { 'data-readonly': '' } : {}),
    ...(required === true ? { 'data-required': '' } : {}),
    'data-label-placement': labelPlacement ?? defaults.labelPlacement,
    'data-part': 'root',
    'data-required-mark': resolvedRequiredMark,
    'data-size': resolvedSize,
    'data-ui': 'field',
  };

  return (
    <FieldContext.Provider value={value}>
      {render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps)}
    </FieldContext.Provider>
  );
}
