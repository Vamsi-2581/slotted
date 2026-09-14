/*
 * Two sheets: this family's own, and `tag`'s, worn as `data-ui` by every chip.
 * A family that renders another's identifier and does not import its sheet
 * draws an element with no rules at all.
 */
import '@slotted/styles/tags-input/tags-input.css';
import '@slotted/styles/tag/tag.css';

import { writeToClipboard } from '@slotted/core/clipboard';
import { createFilter } from '@slotted/core/collection';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createWidthGate } from '@slotted/core/measure';
import { createControllable } from '@slotted/core/state';
import { admitValues, joinValues, judgeValue, splitValues } from '@slotted/core/tags';
import type { TagsVerdict } from '@slotted/core/tags';
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  Ref,
} from 'react';

import { useField } from '../field';
import { CHIP_SELECTOR, ChipRow } from './tags-input-chips';
import type { TagsInputChipsContext } from './tags-input-chips';
import { TAGS_INPUT_FALLBACK, useTagsInputDefaults } from './tags-input-defaults';
import type {
  TagsInputDefaults,
  TagsInputInputReason,
  TagsInputNativeProps,
  TagsInputProps,
  TagsInputRootProps,
  TagsInputValueReason,
} from './tags-input.types';

/** The width, in CSS pixels, under which a chip has no room for a word. */
export const NARROW_WIDTH = 120;

const AXES = Object.keys(TAGS_INPUT_FALLBACK) as (keyof TagsInputDefaults)[];

function compose<E extends { defaultPrevented: boolean }>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
) {
  return (event: E) => {
    theirs?.(event);
    if (!event.defaultPrevented) ours(event);
  };
}

function attach<T>(node: T, ...refs: (Ref<T> | undefined)[]) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node);
    else if (ref !== null && ref !== undefined) ref.current = node;
  }
}

function same(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

/** How long the chip that answered a duplicate stays marked: the theme's long step. */
function longDuration(element: HTMLElement | null) {
  const raw = element?.ownerDocument.defaultView
    ?.getComputedStyle(element)
    .getPropertyValue('--slotted-duration-long')
    .trim();
  if (raw === undefined || raw === '') return 320;
  const number = Number.parseFloat(raw);
  if (!Number.isFinite(number)) return 320;
  return raw.endsWith('ms') ? number : number * 1000;
}

/**
 * A frame of typed values, with a field that adds more.
 *
 * **The value is a list of texts, and the text is the label.** There is no
 * collection behind it, which is what separates this family from
 * `multi-select`: a value comes from the reader's keyboard or clipboard and
 * from nowhere else.
 *
 * **A value that fails is held and shown.** Every value in the list is judged
 * at render — by `validate`, or by the input's own constraints through the
 * browser — and a value that fails wears the danger tone, the alert mark and a
 * description, marks the root, and blocks the native submit through
 * `setCustomValidity`. Every surveyed implementation drops it instead, and a
 * recipients field that silently drops `jhon.company` has told the reader John
 * was invited. `invalidValues="refuse"` is that behaviour, for the operand of
 * a filter, where a bad value has nowhere to go.
 *
 * **What is refused is reported, not dropped.** A duplicate, a value past the
 * limit, and — under `refuse` — an invalid one each leave through
 * `onValueRefuse` with the cause.
 */
export function TagsInput({
  className,
  defaultInputValue = '',
  defaultValue = [],
  formatLabel,
  handleRef,
  inputValue,
  locale,
  lockedValues = [],
  normalize,
  onValueCopy,
  onInputValueChange,
  onValueChange,
  onValueRefuse,
  ref,
  render,
  split,
  style,
  type = 'text',
  validate,
  value,
  ...rest
}: TagsInputProps) {
  const defaults = useTagsInputDefaults();
  const field = useField();

  const axes: Partial<TagsInputDefaults> = {};
  const nativeProps: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(rest)) {
    if ((AXES as string[]).includes(key)) (axes as Record<string, unknown>)[key] = entry;
    else nativeProps[key] = entry;
  }
  const native = nativeProps as TagsInputNativeProps;

  const generated = useId();
  const inputId = `${generated}input`;
  const hintId = `${generated}hint`;

  const [ownValue, setOwnValue] = useState<readonly string[]>(defaultValue);
  const [ownInput, setOwnInput] = useState(defaultInputValue);
  const [inputNode, setInputNode] = useState<HTMLInputElement | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);

  const resolved: TagsInputDefaults = { ...defaults };
  for (const key of AXES) {
    const given = axes[key];
    if (given !== undefined) (resolved as unknown as Record<string, unknown>)[key] = given;
  }
  resolved.disabled = axes.disabled ?? field?.disabled ?? defaults.disabled;
  resolved.readOnly = axes.readOnly ?? field?.readOnly ?? defaults.readOnly;
  resolved.required = axes.required ?? field?.required ?? defaults.required;
  resolved.invalid = axes.invalid ?? field?.invalid ?? defaults.invalid;
  resolved.size = axes.size ?? field?.size ?? defaults.size;

  const currentValue = value ?? ownValue;
  const currentInput = inputValue ?? ownInput;
  const frozen = resolved.disabled || resolved.readOnly;
  const full = resolved.max !== null && currentValue.length >= resolved.max;

  const collator = useMemo(() => createFilter({ locale }), [locale]);
  const normalise = normalize ?? ((text: string) => text.trim());

  const judge = useCallback(
    (text: string): TagsVerdict => judgeValue(text, validate, inputNode),
    [validate, inputNode],
  );

  /**
   * Validity is a function of the value alone, judged at render, so a consumer
   * who owns the value and holds an invalid entry in it sees it marked. The
   * input's constraints are read through the node, so the attributes are in
   * the dependencies by name: a `pattern` that changes re-judges the list.
   */
  const verdicts = useMemo(
    () => currentValue.map((entry) => judge(entry)),
    [currentValue, judge, type, native.pattern, native.minLength, native.maxLength],
  );
  const firstFailure = verdicts.find((verdict) => !verdict.valid);
  const invalid =
    resolved.invalid ||
    firstFailure !== undefined ||
    (full && resolved.max !== null && currentValue.length > resolved.max);

  const register = field?.registerControl;
  useEffect(() => register?.(), [register]);

  /**
   * The platform's own gate. While the list holds an invalid value, or more
   * than `max`, the visible input carries the verdict as its custom validity,
   * so a plain `<form>` refuses to submit and shows the browser's bubble on the
   * control the reader is looking at.
   */
  useEffect(() => {
    if (inputNode === null) return;
    const message =
      firstFailure === undefined
        ? resolved.max !== null && currentValue.length > resolved.max
          ? fill(resolved.counterLabel, { count: currentValue.length, max: resolved.max })
          : ''
        : firstFailure.message || resolved.invalidLabel;
    inputNode.setCustomValidity(message);
  }, [
    inputNode,
    firstFailure,
    currentValue.length,
    resolved.max,
    resolved.counterLabel,
    resolved.invalidLabel,
  ]);

  /**
   * Under 120 pixels there is no room for a chip at all, and the counter
   * answers instead. A width and a callback rather than a container query:
   * `container-type: inline-size` would stop the frame's own width depending
   * on its contents, which is how a control that is not `fullWidth` is
   * measured.
   */
  useEffect(() => {
    const element = frame.current;
    if (element === null) return;
    const gate = createWidthGate(element, { at: NARROW_WIDTH, onChange: setNarrow });
    return () => gate.destroy();
  }, []);

  /* The chip that answered a duplicate stays marked for one long step. */
  useEffect(() => {
    if (duplicate === null) return;
    const timer = setTimeout(() => setDuplicate(null), longDuration(frame.current));
    return () => clearTimeout(timer);
  }, [duplicate]);

  const announce = useCallback(
    (message: string) => {
      if (message === '') return;
      getLiveAnnouncer(inputNode?.ownerDocument).announce(message, { repeat: true });
    },
    [inputNode],
  );

  const labelFor = useCallback(
    (entry: string) => (formatLabel === undefined ? entry : formatLabel(entry)),
    [formatLabel],
  );

  const latest = useRef({
    currentInput,
    currentValue,
    inputValue,
    onInputValueChange,
    onValueChange,
    onValueRefuse,
    value,
  });
  latest.current = {
    currentInput,
    currentValue,
    inputValue,
    onInputValueChange,
    onValueChange,
    onValueRefuse,
    value,
  };

  const setInputValue = useCallback(
    (next: string, reason: TagsInputInputReason, source?: unknown) => {
      const state = latest.current;
      if (next === state.currentInput) return;
      const controllable = createControllable<string>({
        controlled: state.inputValue,
        initial: state.currentInput,
        onRequest: (request) => state.onInputValueChange?.(request.value, request),
      });
      if (controllable.request(next, reason, source)) setOwnInput(next);
    },
    [],
  );

  /** One request for one transition, whatever moved the list. */
  const commit = useCallback(
    (next: readonly string[], reason: TagsInputValueReason, source?: unknown) => {
      const state = latest.current;
      if (same(next, state.currentValue)) return false;
      const controllable = createControllable<readonly string[]>({
        controlled: state.value,
        initial: state.currentValue,
        onRequest: (request) => state.onValueChange?.(request.value, request),
      });
      if (!controllable.request(next, reason, source)) return false;
      setOwnValue(next);
      return true;
    },
    [],
  );

  /**
   * The one door into the list. Every candidate runs the sequence
   * `@slotted/core/tags` states — normalise, judge, deduplicate, cap — and each
   * refusal is reported under its cause rather than dropped.
   */
  const admit = useCallback(
    (candidates: readonly string[], source?: unknown, replacing?: number) => {
      const state = latest.current;
      const result = admitValues({
        values: state.currentValue,
        candidates,
        max: resolved.max,
        allowDuplicates: resolved.allowDuplicates,
        invalidValues: resolved.invalidValues,
        normalize: normalise,
        judge,
        equals: collator.equals,
        ...(replacing === undefined ? {} : { replacing }),
      });

      if (result.added.length > 0 && commit(result.next, 'submit', source)) {
        const last = result.added[result.added.length - 1] as string;
        const verdict = judge(last);
        const said = fill(resolved.addedLabel, {
          label: labelFor(last),
          count: result.next.length,
        });
        announce(verdict.valid ? said : `${said}. ${verdict.message || resolved.invalidLabel}`);
      }

      for (const cause of ['duplicate', 'limit', 'invalid'] as const) {
        if (result.refused[cause].length === 0) continue;
        state.onValueRefuse?.(result.refused[cause], { cause, source });
      }
      if (result.existing.length > 0) {
        const existing = result.existing[0] as string;
        setDuplicate(existing);
        announce(fill(resolved.duplicateLabel, { label: labelFor(existing) }));
      }
      if (result.refused.limit.length > 0 && resolved.max !== null) {
        announce(fill(resolved.counterLabel, { count: resolved.max, max: resolved.max }));
      }
      if (result.refused.invalid.length > 0) {
        announce(judge(result.refused.invalid[0] as string).valid ? '' : resolved.invalidLabel);
      }
      return result;
    },
    [announce, collator, commit, judge, labelFor, normalise, resolved],
  );

  const remove = useCallback(
    (index: number, source?: unknown) => {
      const state = latest.current;
      const target = state.currentValue[index];
      if (target === undefined || lockedValues.includes(target)) return;
      const next = state.currentValue.filter((_, at) => at !== index);
      if (commit(next, 'remove', source)) {
        announce(fill(resolved.removedLabel, { label: labelFor(target), count: next.length }));
      }
    },
    [announce, commit, labelFor, lockedValues, resolved.removedLabel],
  );

  const clear = useCallback(
    (source?: unknown) => {
      const state = latest.current;
      const kept = state.currentValue.filter((entry) => lockedValues.includes(entry));
      commit(kept, 'clear', source);
      setInputValue('', 'clear', source);
    },
    [commit, lockedValues, setInputValue],
  );

  /** Reorder: one value moving to one index, with reason `keyboard`. */
  const move = useCallback(
    (from: number, to: number, source?: unknown) => {
      const state = latest.current;
      const held = state.currentValue;
      if (from < 0 || from >= held.length) return;
      const target = Math.min(Math.max(to, 0), held.length - 1);
      if (target === from) return;
      const next = [...held];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved as string);
      if (!commit(next, 'keyboard', source)) return;
      announce(
        fill(resolved.reorderLabel, {
          label: labelFor(moved as string),
          position: target + 1,
          count: next.length,
        }),
      );
    },
    [announce, commit, labelFor, resolved.reorderLabel],
  );

  const copy = useCallback(
    async (values: readonly string[]) => {
      if (values.length === 0) return;
      const outcome = await writeToClipboard(
        joinValues(values, resolved.delimiters),
        frame.current?.ownerDocument,
      );
      onValueCopy?.(values, outcome);
      if (outcome !== 'refused') announce(fill(resolved.copiedLabel, { count: values.length }));
    },
    [announce, onValueCopy, resolved.copiedLabel, resolved.delimiters],
  );

  /** The typed text, committed as one or several values. */
  const commitText = useCallback(
    (source?: unknown) => {
      const text = latest.current.currentInput;
      if (text.trim() === '') return false;
      admit(split === undefined ? splitValues(text, resolved.delimiters) : split(text), source);
      setInputValue('', 'submit', source);
      return true;
    },
    [admit, resolved.delimiters, setInputValue, split],
  );

  useImperativeHandle(
    handleRef,
    () => ({
      clear: () => clear(),
      focus: () => inputNode?.focus({ preventScroll: true }),
      setValue: (values, reason = 'programmatic') => commit([...values], reason),
    }),
    [clear, commit, inputNode],
  );

  const chips = () => [...(frame.current?.querySelectorAll<HTMLElement>(CHIP_SELECTOR) ?? [])];

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (resolved.disabled) return;
    const meta = event.ctrlKey || event.metaKey;

    if (!frozen && resolved.delimiters.includes(event.key) && !event.altKey && !meta) {
      event.preventDefault();
      commitText(event.nativeEvent);
      return;
    }

    switch (event.key) {
      case 'Enter':
        /* With text, commits and never submits; with none, the platform's
           implicit submission is left alone. */
        if (frozen) return;
        if (commitText(event.nativeEvent)) event.preventDefault();
        return;
      case 'Escape':
        if (currentInput === '') return;
        event.preventDefault();
        setInputValue('', 'clear', event.nativeEvent);
        return;
      case 'Backspace': {
        /* §6's rule: from an empty field the first press moves focus to the
           last chip the reader may remove and removes nothing; the second
           press — on the chip — removes it. */
        if (currentInput !== '' || frozen) return;
        if (event.currentTarget.selectionStart !== 0) return;
        const last = chips()
          .reverse()
          .find((chip) => !chip.hasAttribute('data-disabled') && !chip.hasAttribute('data-count'));
        if (last === undefined) return;
        event.preventDefault();
        last.focus({ preventScroll: true });
        return;
      }
      case 'c':
      case 'C':
        if (!meta || currentInput !== '' || currentValue.length === 0) return;
        event.preventDefault();
        void copy(currentValue);
        return;
      default:
        break;
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value, 'keyboard', event.nativeEvent);
  };

  /** A paste that carries several values, split by the same rule the key reads. */
  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!resolved.addOnPaste || frozen) return;
    const text = event.clipboardData.getData('text');
    const parts = split === undefined ? splitValues(text, resolved.delimiters) : split(text);
    if (parts.length < 2) return;
    event.preventDefault();
    admit(parts, event.nativeEvent);
    setInputValue('', 'submit', event.nativeEvent);
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && frame.current?.contains(next) === true) return;
    if (frozen) return;
    if (resolved.pendingOnBlur === 'commit') commitText(event.nativeEvent);
    else if (resolved.pendingOnBlur === 'discard') setInputValue('', 'blur', event.nativeEvent);
  };

  /* The collapsed row opens while focus is anywhere inside the frame. */
  const onFrameFocus = () => setExpanded(true);
  const onFrameBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && frame.current?.contains(next) === true) return;
    setExpanded(false);
  };

  const onClear = (event: MouseEvent<HTMLButtonElement>) => {
    clear(event.nativeEvent);
    inputNode?.focus({ preventScroll: true });
  };

  const setInput = useCallback(
    (element: HTMLInputElement | null) => {
      setInputNode(element);
      attach(element, ref);
    },
    [ref],
  );

  const describedBy = [native['aria-describedby'], field?.describedBy].filter(Boolean).join(' ');
  const count = fill(resolved.countLabel, { count: currentValue.length });
  const ownLabel = native['aria-label'];
  const showClear =
    resolved.clearable &&
    (currentValue.some((entry) => !lockedValues.includes(entry)) || currentInput !== '') &&
    !frozen;

  const counter = (() => {
    if (resolved.max !== null) {
      return fill(resolved.counterLabel, { count: currentValue.length, max: resolved.max });
    }
    if (narrow && currentValue.length > 0) return count;
    return null;
  })();

  const hint = resolved.editable
    ? `${resolved.hintLabel} ${resolved.editHintLabel}`
    : resolved.hintLabel;

  const chipsContext: TagsInputChipsContext = {
    announce,
    collapsing: resolved.overflow === 'collapse' && !expanded,
    copy: (entry) => void copy([entry]),
    disabled: resolved.disabled,
    duplicate,
    editable: resolved.editable && !frozen,
    inputNode,
    invalidLabel: resolved.invalidLabel,
    labelFor,
    lockedValues,
    move,
    readOnly: resolved.readOnly,
    remove,
    removeLabel: resolved.removeLabel,
    reorderable: resolved.reorderable && !frozen,
    reorderLabel: resolved.reorderLabel,
    replace: (index, text, source) => admit([text], source, index),
    value: currentValue,
    verdicts,
  };

  const rootProps: TagsInputRootProps = {
    ref: frame,
    className,
    style,
    onBlur: onFrameBlur,
    onFocus: onFrameFocus,
    'data-overflow': resolved.overflow,
    'data-part': 'root',
    'data-size': resolved.size,
    'data-ui': 'tags-input',
    'data-variant': resolved.variant,
    ...(resolved.fullWidth ? { 'data-full-width': '' } : {}),
    ...(resolved.disabled ? { 'data-disabled': '' } : {}),
    ...(resolved.readOnly ? { 'data-readonly': '' } : {}),
    ...(invalid ? { 'data-invalid': '' } : {}),
    ...(resolved.required ? { 'data-required': '' } : {}),
    ...(full ? { 'data-complete': '' } : {}),
    ...(narrow ? { 'data-narrow': '' } : {}),
    ...(resolved.overflow === 'collapse' && expanded ? { 'data-expanded': '' } : {}),
  };

  const inner = (
    <>
      <div
        aria-label={ownLabel === undefined ? undefined : `${ownLabel}, ${count}`}
        aria-labelledby={
          ownLabel === undefined && field !== undefined ? field.ids.label : undefined
        }
        data-part="control"
        role="grid"
      >
        <ChipRow context={chipsContext} describedBy={hintId} label={count}>
          <span data-part="field" role="gridcell">
            <input
              {...native}
              aria-describedby={describedBy === '' ? undefined : describedBy}
              aria-invalid={invalid ? true : undefined}
              data-part="input"
              disabled={resolved.disabled}
              id={native.id ?? field?.ids.control ?? inputId}
              onBlur={compose(native.onBlur, onBlur)}
              onChange={compose(native.onChange, onChange)}
              onKeyDown={compose(native.onKeyDown, onKeyDown)}
              onPaste={compose(native.onPaste, onPaste)}
              readOnly={resolved.readOnly}
              ref={setInput}
              required={resolved.required && currentValue.length === 0}
              type={type}
              value={currentInput}
            />
          </span>
        </ChipRow>
      </div>
      {counter === null ? null : (
        <span aria-hidden="true" data-part="counter">
          {counter}
        </span>
      )}
      {showClear ? (
        <button
          aria-label={resolved.clearLabel}
          data-part="clear"
          onClick={onClear}
          type="button"
        />
      ) : null}
      <span data-part="hint" id={hintId}>
        {hint}
      </span>
      {/*
        One hidden input per value, all under the same name: that is how a plain
        `FormData` receives several values under one key.
      */}
      {native.name === undefined
        ? null
        : currentValue.map((entry, index) => (
            <input
              form={native.form}
              key={`${index}-${entry}`}
              name={native.name}
              type="hidden"
              value={entry}
            />
          ))}
    </>
  );

  if (render !== undefined) return render({ ...rootProps, children: inner });
  return <div {...rootProps}>{inner}</div>;
}
