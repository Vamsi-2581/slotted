import '@slotted/styles/currency-field/currency-field.css';

import { createCurrencyFormat, MAX_AMOUNT_DIGITS, withAmount } from '@slotted/core/currency';
import { clamp as clampNumber } from '@slotted/core/measure';
import {
  STEP_REPEAT_DELAY,
  STEP_REPEAT_DELAY_COARSE,
  STEP_REPEAT_INTERVAL,
  stepNumber,
} from '@slotted/core/number';
import { createControllable } from '@slotted/core/state';
import type { ChangeReason } from '@slotted/core/state';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';

import { useField } from '../field';
import { useCurrencyFieldDefaults } from './currency-field-defaults';
import type { CurrencyFieldProps, CurrencyFieldRootProps } from './currency-field.types';

/**
 * A native button fires the same `click` for a pointer, for Space and for
 * Enter. A click synthesised by the keyboard reports no detail; a real one
 * reports the click count — the rule `button`, `tag` and `text-field` all write.
 */
function activationReason(detail: number): ChangeReason {
  return detail === 0 ? 'keyboard' : 'pointer';
}

/** The two keys that set the sign under cents-first entry. */
const SIGN_KEYS = new Set(['-', '−', '+', '(']);

/**
 * One amount, in one currency, typed the way a cash register is typed.
 *
 * **The frame is not the control.** The element carrying `data-ui` is a `div`
 * with no role; the `input` inside it holds the value, the identifier and the
 * APG's `spinbutton` role — the shape `number-field` established, and for the
 * same WAI-ARIA reason.
 *
 * **Under `entry="cents"` the digits are the value.** After every edit the
 * family reads the digits out of the text and divides by the currency's minor
 * units, so `1234` is `R$ 12,34`. The text is generated rather than typed,
 * which is why rewriting it on every keystroke is legal here and forbidden in
 * the sibling family: there is no typed text to protect, and the caret has
 * exactly one legal position.
 *
 * **A paste is parsed.** `R$ 1.480,00` copied from a bank statement is one
 * thousand four hundred and eighty, not fourteen and eighty.
 *
 * **Unset means ask the field.** `disabled`, `readOnly` and `invalid` default to
 * `undefined` rather than `false`.
 */
export function CurrencyField({
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  align,
  className,
  clamp,
  currency,
  currencyDisplay,
  decrementLabel,
  defaultValue = null,
  disabled,
  end,
  entry,
  form,
  format,
  formatOn,
  fractionDigits,
  handle,
  id,
  incrementLabel,
  inputMode,
  invalid,
  largeStep,
  locale,
  max,
  min,
  name,
  onBlur,
  onChange,
  onKeyDown,
  onValueChange,
  readOnly,
  ref,
  render,
  size,
  smallStep,
  start,
  step = 1,
  stepFrom,
  stepper,
  style,
  value,
  variant,
  wheel = false,
  ...nativeProps
}: CurrencyFieldProps) {
  const field = useField();
  const defaults = useCurrencyFieldDefaults();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resolvedSize = size ?? field?.size ?? defaults.size;
  const resolvedVariant = variant ?? defaults.variant;
  const resolvedAlign = align ?? defaults.align;
  const resolvedEntry = entry ?? defaults.entry;
  const resolvedFormatOn = formatOn ?? defaults.formatOn;
  const resolvedStepper = stepper ?? defaults.stepper;
  const resolvedClamp = clamp ?? defaults.clamp;
  const resolvedLocale = locale ?? defaults.locale;
  const resolvedDisplay = currencyDisplay ?? defaults.currencyDisplay;
  const resolvedCurrency = currency ?? defaults.currency;
  const resolvedDisabled = disabled ?? field?.disabled;
  const resolvedReadOnly = readOnly ?? field?.readOnly;
  const resolvedInvalid = invalid ?? field?.invalid;

  if (resolvedCurrency === undefined) {
    /* Loudly, and where it is written: a currency field cannot decide how many
       digits a cent has, and one that guessed two would write `¥12,34`. */
    throw new Error(
      'CurrencyField needs a currency: pass `currency`, or set one on CurrencyFieldDefaultsProvider.',
    );
  }

  /**
   * One formatter, rebuilt only when something it reads actually changes. The
   * options object is compared by its own content rather than by identity,
   * because a consumer writing `format={{ currencySign: 'accounting' }}` inline
   * hands a new object on every render.
   */
  const formatKey = format === undefined ? '' : JSON.stringify(format);
  const formatter = useMemo(
    () =>
      createCurrencyFormat({
        currency: resolvedCurrency,
        currencyDisplay: resolvedDisplay,
        ...(resolvedLocale === undefined ? {} : { locale: resolvedLocale }),
        ...(fractionDigits === undefined ? {} : { fractionDigits }),
        ...(format === undefined ? {} : { options: format }),
      }),
    /* `formatKey` stands in for `format`: the options are compared by content,
       so an inline object is not a new format. */
    [resolvedCurrency, resolvedDisplay, resolvedLocale, fractionDigits, formatKey, format],
  );

  /** What the family knows about the amount, which in controlled mode is not it. */
  const [own, setOwn] = useState<number | null>(defaultValue);
  const current = value === undefined ? own : value;

  /** What the element is showing. Never a second copy of the amount. */
  const [text, setText] = useState(() => formatter.format(current));

  const largeAmount = largeStep ?? step * 10;
  const smallAmount = smallStep ?? step / 10;
  const cents = resolvedEntry === 'cents';
  const allowNegative = min === undefined || min < 0;

  /**
   * The sign, while the field holds nothing to carry it. Typing `-` into an
   * empty amount and then a digit produces a debit, which a sign derived from
   * the text alone could not express.
   *
   * It is read at the moment of the edit rather than captured at render: the
   * sign key sets a ref and does not re-render, so a value read from the last
   * render would be the sign the reader had before pressing it.
   */
  const pendingNegative = useRef(false);
  const negativeNow = () => (current === null ? pendingNegative.current : current < 0);

  const register = field?.registerControl;
  useEffect(() => register?.(), [register]);

  /**
   * Asks to move, and says whether anything did. A controlled component and a
   * refused request both answer `false`, and the caller uses that to decide
   * what the element shows.
   *
   * The request carries the currency and the exact integer of minor units:
   * under cents-first entry that integer is what the reader typed, so it is
   * exact by construction rather than by rounding.
   */
  const request = useCallback(
    (next: number | null, reason: ChangeReason, source: unknown, minorUnits?: number | null) => {
      const state = createControllable<number | null>({
        controlled: value,
        initial: current,
        onRequest: (pending) =>
          onValueChange?.(
            pending.value,
            withAmount(pending, formatter.currency, minorUnits ?? formatter.toMinorUnits(next)),
          ),
      });
      const moved = state.request(next, reason, source);
      if (moved) setOwn(next);
      return moved;
    },
    [current, formatter, onValueChange, value],
  );

  /** What the element shows after a move that may not have been accepted. */
  const settle = useCallback(
    (next: number | null, moved: boolean) => {
      setText(formatter.format(moved ? next : current));
    },
    [current, formatter],
  );

  /**
   * Formats what the reader typed and puts the amount back in range. The number
   * is read from the live text rather than from state, because a keystroke and
   * its commit can arrive in the same frame.
   */
  const commit = useCallback(
    (reason: ChangeReason, source: unknown) => {
      let next = formatter.parse(text);
      if (next !== null && resolvedClamp !== 'none') {
        next = clampNumber(next, min ?? Number.NEGATIVE_INFINITY, max ?? Number.POSITIVE_INFINITY);
      }
      settle(next, request(next, reason, source));
    },
    [formatter, max, min, request, resolvedClamp, settle, text],
  );

  const move = useCallback(
    (direction: 1 | -1, amount: number, reason: ChangeReason, source: unknown) => {
      const next = stepNumber({
        value: formatter.parse(text),
        direction,
        step: amount,
        ...(min === undefined ? {} : { min }),
        ...(max === undefined ? {} : { max }),
        ...(stepFrom === undefined ? {} : { stepFrom }),
      });
      settle(next, request(next, reason, source));
    },
    [formatter, max, min, request, settle, stepFrom, text],
  );

  useImperativeHandle(
    handle,
    () => ({
      increment: () => move(1, step, 'programmatic', undefined),
      decrement: () => move(-1, step, 'programmatic', undefined),
    }),
    [move, step],
  );

  /**
   * A native reset restores the element's own value and tells nothing, so the
   * family would keep the last thing typed.
   */
  useEffect(() => {
    const owner = inputRef.current?.form;
    if (owner === null || owner === undefined) return;
    const onReset = () => {
      setOwn(defaultValue);
      setText(formatter.format(defaultValue));
    };
    owner.addEventListener('reset', onReset);
    return () => owner.removeEventListener('reset', onReset);
  }, [defaultValue, formatter]);

  /**
   * A controlled amount the consumer moved is written back into the text — and
   * only then. The comparison is against what the text already *means*, so a
   * consumer echoing the value back does not reformat the text between two
   * keystrokes and move the caret with it.
   */
  const shown = useRef(text);
  shown.current = text;
  useEffect(() => {
    if (value === undefined) return;
    if (Object.is(value, formatter.parse(shown.current))) return;
    setText(formatter.format(value));
  }, [formatter, value]);

  /**
   * The caret, under cents-first entry, put back where the next keystroke
   * means something: after the last digit, and before whatever affix the locale
   * writes at the end. It is a layout effect because the browser must not paint
   * the caret at the end of a symbol first.
   */
  /**
   * Where the caret goes after a keystroke the family reshaped the text around
   * under `entry="natural"`. `null` is "the family did not move it", which is
   * every render that was not a live regrouping.
   */
  const naturalCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const caret = naturalCaret.current;
    if (caret === null) return;
    naturalCaret.current = null;
    const element = inputRef.current;
    if (element === null || element.ownerDocument.activeElement !== element) return;
    element.setSelectionRange(caret, caret);
  });

  const restoreCaret = useRef(false);
  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!restoreCaret.current || element === null) return;
    restoreCaret.current = false;
    if (element.ownerDocument.activeElement !== element) return;

    let position = element.value.length;
    for (let index = element.value.length; index > 0; index -= 1) {
      if (formatter.digitsOf(element.value[index - 1] ?? '') !== '') {
        position = index;
        break;
      }
    }
    element.setSelectionRange(position, position);
  });

  /**
   * The keystroke filter, on the native event rather than on React's synthetic
   * one: `beforeinput` is where a keystroke, a paste and a drop all arrive
   * before the element changes, and it is the only place a character that
   * cannot be part of an amount can be refused without moving the caret.
   */
  useEffect(() => {
    const element = inputRef.current;
    if (element === null) return;

    const onBeforeInput = (event: InputEvent) => {
      if (event.defaultPrevented) return;
      /* An IME commits a whole run; refusing it character by character would
         make a full-width `１２３` untypeable. */
      if (event.isComposing) return;
      if (event.inputType.startsWith('delete')) return;
      /* A paste is parsed rather than filtered: it is the reader's own amount,
         and `editFromText` reads it whole. */
      if (event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop') return;

      const selectionStart = element.selectionStart ?? element.value.length;
      const selectionEnd = element.selectionEnd ?? element.value.length;
      const inserted = event.data ?? '';
      const next =
        element.value.slice(0, selectionStart) + inserted + element.value.slice(selectionEnd);

      if (!cents) {
        if (!formatter.isPartial(next)) {
          event.preventDefault();
          return;
        }
        if (resolvedClamp !== 'strict') return;
        const parsed = formatter.parse(next);
        if (parsed === null) return;
        if ((min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
          event.preventDefault();
        }
        return;
      }

      /* The sign is a key rather than a digit, so `-` pressed twice does not
         produce two signs and never enters the digit run. */
      if (SIGN_KEYS.has(inserted)) {
        event.preventDefault();
        if (!allowNegative) return;
        const wanted = inserted === '+' ? false : true;
        pendingNegative.current = wanted;
        if (current === null || current < 0 === wanted) return;
        const next = -current;
        settle(next, request(next, 'keyboard', event, formatter.toMinorUnits(next)));
        restoreCaret.current = true;
        return;
      }

      if (formatter.digitsOf(inserted).length !== [...inserted].length) {
        event.preventDefault();
        return;
      }
      /* Fifteen digits is where a double stops holding a cent, so the text
         stops growing rather than rounding silently. */
      if (formatter.digitsOf(next).length > MAX_AMOUNT_DIGITS) {
        event.preventDefault();
        return;
      }
      if (resolvedClamp !== 'strict') return;
      const edit = formatter.editFromText({ text: next, negative: negativeNow(), allowNegative });
      if (edit.value === null) return;
      if ((min !== undefined && edit.value < min) || (max !== undefined && edit.value > max)) {
        event.preventDefault();
      }
    };

    element.addEventListener('beforeinput', onBeforeInput);
    return () => element.removeEventListener('beforeinput', onBeforeInput);
  }, [allowNegative, cents, current, formatter, max, min, request, resolvedClamp, settle]);

  /**
   * The wheel, when it is asked for, and never otherwise. It is a native
   * listener because the event has to be cancelled, and React's synthetic
   * wheel handler is passive.
   */
  useEffect(() => {
    const element = inputRef.current;
    if (element === null || !wheel) return;
    if (resolvedDisabled === true || resolvedReadOnly === true) return;

    const onWheel = (event: WheelEvent) => {
      if (element.ownerDocument.activeElement !== element) return;
      if (event.deltaY === 0) return;
      event.preventDefault();
      move(event.deltaY < 0 ? 1 : -1, step, 'pointer', event);
    };

    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [move, resolvedDisabled, resolvedReadOnly, step, wheel]);

  /** The held stepper, cleared on release and on unmount alike. */
  const repeat = useRef<{ delay?: number; interval?: number }>({});
  const stopRepeating = useCallback(() => {
    window.clearTimeout(repeat.current.delay);
    window.clearInterval(repeat.current.interval);
    repeat.current = {};
  }, []);
  useEffect(() => stopRepeating, [stopRepeating]);

  const parsed = formatter.parse(text);
  const atMax = max !== undefined && parsed !== null && parsed >= max;
  const atMin = min !== undefined && parsed !== null && parsed <= min;
  const inert = resolvedDisabled === true || resolvedReadOnly === true;

  const press = (direction: 1 | -1) => (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    /* Focus stays on the amount: the button is out of the tab order and the
       caret is what the reader came back to. */
    event.preventDefault();
    inputRef.current?.focus();
    move(direction, step, activationReason(event.detail), event);

    stopRepeating();
    const delay = event.pointerType === 'touch' ? STEP_REPEAT_DELAY_COARSE : STEP_REPEAT_DELAY;
    repeat.current.delay = window.setTimeout(() => {
      repeat.current.interval = window.setInterval(() => {
        move(direction, step, 'pointer', undefined);
      }, STEP_REPEAT_INTERVAL);
    }, delay);
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || inert) return;

    const amount = event.shiftKey ? largeAmount : event.altKey ? smallAmount : step;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        move(1, amount, 'keyboard', event);
        return;
      case 'ArrowDown':
        event.preventDefault();
        move(-1, amount, 'keyboard', event);
        return;
      case 'PageUp':
        event.preventDefault();
        move(1, largeAmount, 'keyboard', event);
        return;
      case 'PageDown':
        event.preventDefault();
        move(-1, largeAmount, 'keyboard', event);
        return;
      case 'Home':
        if (min === undefined || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        settle(min, request(min, 'keyboard', event));
        return;
      case 'End':
        if (max === undefined || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        settle(max, request(max, 'keyboard', event));
        return;
      case 'Enter':
        /* Committed and not intercepted: a single-line control submits its
           form, which is the platform's behaviour and one a form of one field
           depends on. */
        commit('keyboard', event);
        return;
      default:
    }
  };

  /**
   * The software keyboard, derived from the props rather than from the user
   * agent. Cents-first entry types neither a separator nor a sign into the
   * digits, so the numeric keypad is complete for the task.
   */
  const derivedInputMode = cents
    ? 'numeric'
    : allowNegative
      ? 'text'
      : formatter.maximumFractionDigits > 0
        ? 'decimal'
        : 'numeric';

  const stepperButton = (direction: 1 | -1) => {
    const part = direction === 1 ? 'increment' : 'decrement';
    return (
      <button
        aria-controls={id ?? field?.ids.control}
        aria-label={
          direction === 1
            ? (incrementLabel ?? defaults.incrementLabel)
            : (decrementLabel ?? defaults.decrementLabel)
        }
        data-part={part}
        disabled={inert || (direction === 1 ? atMax : atMin)}
        key={part}
        onLostPointerCapture={stopRepeating}
        onPointerCancel={stopRepeating}
        onPointerDown={press(direction)}
        onPointerLeave={stopRepeating}
        onPointerUp={stopRepeating}
        tabIndex={-1}
        type="button"
      />
    );
  };

  const control = (
    <input
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      {...nativeProps}
      aria-describedby={[describedBy, field?.describedBy].filter(Boolean).join(' ') || undefined}
      aria-invalid={ariaInvalid ?? (resolvedInvalid === true ? true : undefined)}
      aria-required={ariaRequired ?? (field?.required === true ? true : undefined)}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={parsed ?? undefined}
      aria-valuetext={text === '' ? undefined : text}
      data-part="input"
      disabled={resolvedDisabled}
      id={id ?? field?.ids.control}
      inputMode={inputMode ?? derivedInputMode}
      onBlur={(event) => {
        onBlur?.(event);
        commit('blur', event);
      }}
      onChange={(event) => {
        /* The consumer's handler first, and it always runs: the family composes
           with it rather than replacing it. */
        onChange?.(event);
        const next = event.currentTarget.value;

        if (!cents) {
          const native = event.nativeEvent as InputEvent;
          /* An IME commits a whole run, and a run reshaped half way through is
             a run the engine can no longer finish. */
          if (resolvedFormatOn !== 'change' || native.isComposing) {
            setText(next);
            request(formatter.parse(next), 'keyboard', event);
            return;
          }

          const element = event.currentTarget;
          const caret = element.selectionStart ?? next.length;
          const deletion = native.inputType?.startsWith('delete') === true;
          const edited = deletion
            ? formatter.deleteAcrossSeparator(
                text,
                { text: next, caret },
                native.inputType === 'deleteContentForward' ? 1 : -1,
              )
            : { text: next, caret };
          const shaped = formatter.formatWhileTyping(edited);

          /* Written on the element as well as into state, and the caret with it.
             A keystroke that only repaired punctuation leaves the text the state
             already holds, so React has nothing to re-render and the effect below
             never runs — the browser's own caret would stay where the edit left
             it, which is inside the affix it just broke. */
          if (element.value !== shaped.text) element.value = shaped.text;
          if (element.ownerDocument.activeElement === element) {
            element.setSelectionRange(shaped.caret, shaped.caret);
          }
          setText(shaped.text);
          naturalCaret.current = shaped.caret;
          request(formatter.parse(shaped.text), 'keyboard', event);
          return;
        }

        const inputType = (event.nativeEvent as InputEvent).inputType;
        const edit = formatter.editFromText({
          text: next,
          negative: negativeNow(),
          allowNegative,
          ...(inputType === undefined ? {} : { inputType }),
        });
        if (edit.value === null) pendingNegative.current = false;
        else pendingNegative.current = edit.value < 0;
        restoreCaret.current = true;
        settle(edit.value, request(edit.value, 'keyboard', event, edit.minorUnits));
      }}
      onKeyDown={keyDown}
      readOnly={resolvedReadOnly}
      ref={(element: HTMLInputElement | null) => {
        inputRef.current = element;
        if (typeof ref === 'function') ref(element);
        else if (ref !== null && ref !== undefined) ref.current = element;
      }}
      role="spinbutton"
      type="text"
      value={text}
    />
  );

  const steppers =
    resolvedStepper === 'none'
      ? null
      : resolvedStepper === 'split'
        ? [stepperButton(-1), stepperButton(1)]
        : [
            <span data-part="stepper" key="stepper">
              {stepperButton(1)}
              {stepperButton(-1)}
            </span>,
          ];

  /**
   * The split arrangement is written in the order it is painted — decrement,
   * the amount, increment — rather than reordered with `order`, so the reading
   * order and the painted order are the same one.
   */
  const children: ReactNode = (
    <>
      {resolvedStepper === 'split' ? steppers?.[0] : null}
      {start === undefined ? null : <span data-part="start">{start}</span>}
      {control}
      {end === undefined ? null : <span data-part="end">{end}</span>}
      {resolvedStepper === 'split' ? steppers?.[1] : steppers}
      {name === undefined ? null : (
        <input
          form={form}
          name={name}
          type="hidden"
          value={current === null ? '' : String(current)}
        />
      )}
    </>
  );

  const rootProps: CurrencyFieldRootProps = {
    children,
    className,
    style,
    ...(resolvedDisabled === true ? { 'data-disabled': '' } : {}),
    ...(resolvedInvalid === true ? { 'data-invalid': '' } : {}),
    ...(resolvedReadOnly === true ? { 'data-readonly': '' } : {}),
    'data-align': resolvedAlign,
    'data-entry': resolvedEntry,
    'data-part': 'root',
    'data-size': resolvedSize,
    'data-stepper': resolvedStepper,
    'data-ui': 'currency-field',
    'data-variant': resolvedVariant,
  };

  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}
