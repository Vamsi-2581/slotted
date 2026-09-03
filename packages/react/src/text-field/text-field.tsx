import '@slotted/styles/text-field/text-field.css';

import { createControllable } from '@slotted/core/state';
import type { ChangeReason } from '@slotted/core/state';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent, ReactNode } from 'react';

import { useField } from '../field';
import { useTextFieldDefaults } from './text-field-defaults';
import type { TextFieldProps, TextFieldRootProps } from './text-field.types';

/**
 * A native button fires the same `click` for a pointer, for Space and for
 * Enter. A click synthesised by the keyboard reports no detail; a real one
 * reports the click count — the rule `button` and `tag` both write.
 */
function activationReason(event: MouseEvent): ChangeReason {
  return event.detail === 0 ? 'keyboard' : 'pointer';
}

/**
 * One line of text, and everything that sits inside its border.
 *
 * **The frame is not the control.** The element carrying `data-ui` is a `div`
 * with no role; the `input` inside it holds the value, the identifier and every
 * native attribute. WAI-ARIA settles the shape: a `textbox` may hold only
 * non-interactive, presentational children, so the clear and reveal buttons are
 * the control's siblings rather than its children.
 *
 * **The element owns the characters.** In uncontrolled mode nothing is written
 * back to the `input`: `defaultValue` reaches it as the native attribute, a
 * native `form.reset()` restores it, and the family keeps only what it has to
 * draw — whether the value is empty, and how long it is. A control that took
 * ownership of an uncontrolled value would re-render on every keystroke to show
 * the characters the browser had already painted, and would break `reset()`
 * while doing it.
 *
 * **Unset means ask the field.** `disabled`, `readOnly` and `invalid` default to
 * `undefined` rather than `false`, which is what makes "not disabled" and "said
 * nothing" different answers.
 */
export function TextField({
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  className,
  clearable = false,
  clearLabel,
  countMax,
  defaultRevealed = false,
  defaultValue,
  disabled,
  end,
  id,
  invalid,
  maxLength,
  mono,
  onChange,
  onRevealedChange,
  onValueChange,
  readOnly,
  ref,
  render,
  revealable = false,
  revealed,
  revealLabel,
  showCount = false,
  size,
  start,
  style,
  type = 'text',
  value,
  variant,
  ...nativeProps
}: TextFieldProps) {
  const field = useField();
  const defaults = useTextFieldDefaults();
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * What the family knows about the value, which is not the value itself. In
   * controlled mode the consumer's string is the truth; in uncontrolled mode
   * the element's is, and this only mirrors it so the clear button and the
   * count have something to read.
   */
  const [mirrored, setMirrored] = useState(defaultValue ?? '');
  const [ownRevealed, setOwnRevealed] = useState(defaultRevealed);
  const current = value ?? mirrored;
  const isRevealed = revealed ?? ownRevealed;

  const resolvedSize = size ?? field?.size ?? defaults.size;
  const resolvedVariant = variant ?? defaults.variant;
  const resolvedMono = mono ?? defaults.mono;
  const resolvedDisabled = disabled ?? field?.disabled;
  const resolvedReadOnly = readOnly ?? field?.readOnly;
  const resolvedInvalid = invalid ?? field?.invalid;

  const register = field?.registerControl;
  useEffect(() => register?.(), [register]);

  /**
   * A native reset restores the element's own value and tells nothing, so the
   * mirror would keep the last thing typed and the clear button would offer to
   * clear an empty control. The form is reached through the element rather than
   * through a prop, because `form` may name a form anywhere in the document.
   */
  useEffect(() => {
    const form = inputRef.current?.form;
    if (form === null || form === undefined) return;
    const onReset = () => setMirrored(defaultValue ?? '');
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [defaultValue]);

  /**
   * The count is published to the field, which draws it in the spare column of
   * its label row. `length` is in UTF-16 code units, which is what `maxLength`
   * counts: a counter that disagreed with the limit the browser enforces would
   * be wrong at exactly the moment it is read.
   */
  const setCount = field?.setCount;
  const limit = countMax ?? maxLength ?? undefined;
  useEffect(() => {
    if (!showCount || setCount === undefined) return;
    setCount({ length: current.length, max: limit });
    return () => setCount(undefined);
  }, [current, limit, setCount, showCount]);

  /** Where the caret was before the type swapped, so the swap does not move it. */
  const selection = useRef<[number, number] | null>(null);
  useLayoutEffect(() => {
    const held = selection.current;
    const element = inputRef.current;
    if (held === null || element === null) return;
    selection.current = null;
    element.focus();
    element.setSelectionRange(held[0], held[1]);
  }, [isRevealed]);

  const requestValue = (next: string, reason: ChangeReason, source: unknown) => {
    const state = createControllable<string>({
      controlled: value,
      initial: current,
      onRequest: (request) => onValueChange?.(request.value, request),
    });
    if (state.request(next, reason, source)) setMirrored(next);
  };

  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    const element = inputRef.current;
    /* Uncontrolled, the element owns the characters, so they are removed from
       it rather than from a copy the family keeps. */
    if (value === undefined && element !== null) element.value = '';
    requestValue('', 'clear', event);
    element?.focus();
  };

  const toggleReveal = (event: MouseEvent<HTMLButtonElement>) => {
    const element = inputRef.current;
    selection.current =
      element === null ? null : [element.selectionStart ?? 0, element.selectionEnd ?? 0];

    const state = createControllable<boolean>({
      controlled: revealed,
      initial: isRevealed,
      onRequest: (request) => onRevealedChange?.(request.value, request),
    });
    if (state.request(!isRevealed, activationReason(event), event)) setOwnRevealed(!isRevealed);
  };

  const isPassword = type === 'password';
  const showClear =
    clearable && current !== '' && resolvedDisabled !== true && resolvedReadOnly !== true;
  const showReveal = revealable && isPassword && resolvedDisabled !== true;

  const control = (
    <input
      {...nativeProps}
      aria-describedby={[describedBy, field?.describedBy].filter(Boolean).join(' ') || undefined}
      aria-invalid={ariaInvalid ?? (resolvedInvalid === true ? true : undefined)}
      aria-required={ariaRequired ?? (field?.required === true ? true : undefined)}
      data-part="input"
      disabled={resolvedDisabled}
      id={id ?? field?.ids.control}
      maxLength={maxLength}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        /* The consumer's handler first, and it always runs: the family composes
           with it rather than replacing it. */
        onChange?.(event);
        requestValue(event.currentTarget.value, 'keyboard', event);
      }}
      readOnly={resolvedReadOnly}
      ref={(element: HTMLInputElement | null) => {
        inputRef.current = element;
        if (typeof ref === 'function') ref(element);
        else if (ref !== null && ref !== undefined) ref.current = element;
      }}
      type={isPassword && isRevealed ? 'text' : type}
      {...(value === undefined ? { defaultValue } : { value })}
    />
  );

  const children: ReactNode = (
    <>
      {start === undefined ? null : <span data-part="start">{start}</span>}
      {control}
      {showClear ? (
        <button
          aria-label={clearLabel ?? defaults.clearLabel}
          data-part="clear"
          onClick={clear}
          type="button"
        />
      ) : null}
      {showReveal ? (
        <button
          aria-label={revealLabel ?? defaults.revealLabel}
          aria-pressed={isRevealed}
          data-part="reveal"
          onClick={toggleReveal}
          type="button"
        />
      ) : null}
      {end === undefined ? null : <span data-part="end">{end}</span>}
    </>
  );

  const rootProps: TextFieldRootProps = {
    children,
    className,
    style,
    ...(resolvedDisabled === true ? { 'data-disabled': '' } : {}),
    ...(resolvedInvalid === true ? { 'data-invalid': '' } : {}),
    ...(resolvedMono ? { 'data-mono': '' } : {}),
    ...(resolvedReadOnly === true ? { 'data-readonly': '' } : {}),
    'data-part': 'root',
    'data-size': resolvedSize,
    'data-ui': 'text-field',
    'data-variant': resolvedVariant,
  };

  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}
