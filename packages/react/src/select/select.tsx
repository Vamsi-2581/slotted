import '@slotted/styles/select/select.css';
import '@slotted/styles/highlight/highlight.css';

import { createControllable } from '@slotted/core/state';
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject } from 'react';

import { useField } from '../field';
import { useSelectDefaults } from './select-defaults';
import type {
  SelectAlign,
  SelectHighlightReason,
  SelectItems,
  SelectMount,
  SelectOpenReason,
  SelectOption,
  SelectOptionGroup,
  SelectOptionValue,
  SelectProps,
  SelectSelection,
  SelectSide,
  SelectSize,
  SelectStrategy,
  SelectValueReason,
  SelectVariant,
  SelectWidth,
} from './select.types';

/** Where the highlight goes when the popup opens, decided by the key that opened it. */
export type SelectEntry = 'selected' | 'first' | 'last' | 'none';

export interface SelectContextValue {
  align: SelectAlign;
  alignOffset: number;
  clear: (reason: SelectValueReason, source?: unknown) => void;
  clearable: boolean;
  clearLabel: string;
  closeOnEscape: boolean;
  closeOnOutsidePress: boolean;
  closeOnSelect: boolean;
  collisionPadding: number;
  contentId: string;
  contentNode: HTMLElement | null;
  disabled: boolean;
  emptyLabel: string;
  entry: MutableRefObject<SelectEntry>;
  flip: boolean;
  form: string | undefined;
  fullWidth: boolean;
  hideWhenDetached: boolean;
  highlighted: SelectOptionValue | null;
  invalid: boolean;
  labelFor: (value: SelectOptionValue) => string | undefined;
  loading: boolean;
  loadingLabel: string;
  loop: boolean;
  mount: SelectMount;
  multiple: boolean;
  name: string | undefined;
  open: boolean;
  optionId: (value: SelectOptionValue) => string;
  portal: boolean;
  readOnly: boolean;
  registerLabel: (value: SelectOptionValue, label: string) => void;
  required: boolean;
  seen: boolean;
  selection: readonly SelectOptionValue[];
  setContentNode: (node: HTMLElement | null) => void;
  setHighlighted: (
    value: SelectOptionValue | null,
    reason: SelectHighlightReason,
    source?: unknown,
  ) => void;
  setOpen: (next: boolean, reason: SelectOpenReason, source?: unknown) => void;
  setTriggerNode: (node: HTMLElement | null) => void;
  shift: boolean;
  side: SelectSide;
  sideOffset: number;
  size: SelectSize;
  strategy: SelectStrategy;
  toggle: (value: SelectOptionValue, reason: SelectValueReason, source?: unknown) => void;
  total: number | undefined;
  triggerId: string;
  triggerNode: HTMLElement | null;
  typeahead: boolean;
  typeaheadTimeout: number;
  variant: SelectVariant;
  width: SelectWidth;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

/**
 * What the select around this part says. A trigger, a popup or an option
 * outside one has no state to report, so this throws rather than rendering
 * markup that looks right and never opens.
 */
export function useSelect(): SelectContextValue {
  const context = useContext(SelectContext);
  if (context === undefined) {
    throw new Error('SelectTrigger, SelectContent and every option have to be inside a Select.');
  }
  return context;
}

/** One value, several, or none — always read as a list, whatever was passed. */
function normalize(selection: SelectSelection | undefined): readonly SelectOptionValue[] {
  if (selection === undefined || selection === null) return [];
  return typeof selection === 'string' ? [selection] : selection;
}

/** The shape a consumer gets back, which is the shape they gave. */
function denormalize(values: readonly SelectOptionValue[], multiple: boolean): SelectSelection {
  if (multiple) return values;
  return values[0] ?? null;
}

const isGroup = (entry: SelectItems[number]): entry is SelectOptionGroup => 'options' in entry;

/** Every option a consumer declared up front, flattened out of its groups. */
function flatten(items: SelectItems | undefined): readonly SelectOption[] {
  if (items === undefined) return [];
  return items.flatMap((entry) => (isGroup(entry) ? entry.options : [entry]));
}

/**
 * A control that shows the current choice and opens a listbox of the rest.
 *
 * This component owns the state and **renders nothing**: the control stays
 * where the consumer wrote it and the popup is portalled to the end of the
 * document, so no single element could hold both. `SelectTrigger` renders the
 * frame and the button; `SelectContent` renders the layer and the list.
 *
 * **Three values a consumer can own, and each one asks before it moves.** What
 * is selected, whether the popup is open, and which option the highlight is on.
 * The third is `aria-activedescendant` rather than focus: DOM focus stays on
 * the trigger for the whole interaction, which is what the APG's own
 * select-only combobox example does and what `combobox` — this family's pair —
 * has no choice about.
 *
 * **Unset means ask the field.** `disabled`, `readOnly`, `invalid`, `required`
 * and `size` default to `undefined` rather than to a value, which is what makes
 * "not disabled" and "said nothing" different answers.
 */
export function Select({
  align,
  alignOffset,
  children,
  clearable,
  clearLabel,
  closeOnEscape,
  closeOnOutsidePress,
  closeOnSelect,
  collisionPadding,
  defaultHighlightedValue = null,
  defaultOpen = false,
  defaultValue,
  disabled,
  emptyLabel,
  flip,
  form,
  fullWidth,
  hideWhenDetached,
  highlightedValue,
  invalid,
  items,
  loading,
  loadingLabel,
  loop,
  mount,
  multiple,
  name,
  onHighlightedValueChange,
  onOpenChange,
  onValueChange,
  open,
  portal,
  readOnly,
  ref,
  required,
  shift,
  side,
  sideOffset,
  size,
  strategy,
  total,
  typeahead,
  typeaheadTimeout,
  value,
  variant,
  width,
}: SelectProps) {
  const defaults = useSelectDefaults();
  const field = useField();

  const generated = useId();
  const contentId = `${generated}listbox`;
  const triggerId = `${generated}trigger`;

  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const [ownSelection, setOwnSelection] = useState<readonly SelectOptionValue[]>(() =>
    normalize(defaultValue),
  );
  const [ownHighlighted, setOwnHighlighted] = useState<SelectOptionValue | null>(
    defaultHighlightedValue,
  );
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const [contentNode, setContentNode] = useState<HTMLElement | null>(null);

  const resolvedMultiple = multiple ?? defaults.multiple;
  const resolvedDisabled = disabled ?? field?.disabled ?? defaults.disabled;
  const resolvedReadOnly = readOnly ?? field?.readOnly ?? defaults.readOnly;

  const currentOpen = (open ?? ownOpen) && !resolvedDisabled;
  const currentSelection = value === undefined ? ownSelection : normalize(value);
  const currentHighlighted = highlightedValue === undefined ? ownHighlighted : highlightedValue;

  const seen = useRef(currentOpen);
  if (currentOpen) seen.current = true;

  const entry = useRef<SelectEntry>('selected');

  /**
   * Labels for values, from three places, in the order a reader needs them.
   *
   * The popup does not exist while the control is closed under the default
   * `mount="active"`, so an option's own label is unavailable exactly when the
   * closed control has to print it. `items` is the answer for a select that
   * knows its options up front; the registry below is the answer for one that
   * does not, filled the first time the popup is built and kept afterwards; and
   * `SelectValue`'s render function is the answer for a value the family cannot
   * resolve at all. When none of the three answers, the control prints the raw
   * value under `data-unmatched` rather than falling back to the placeholder,
   * which is what every surveyed implementation does and what makes a form
   * holding a value look empty.
   */
  const registry = useRef(new Map<SelectOptionValue, string>());
  /**
   * A counter rather than a state Map: the map is written from the options'
   * own effects during the popup's first render, and a new Map per
   * registration would re-render the tree once per option. Bumping a number,
   * and only when a label is new or has changed, batches the whole first open
   * into one render and leaves every later open free.
   */
  const [registered, setRegistered] = useState(0);

  const declared = useMemo(() => {
    const table = new Map<SelectOptionValue, string>();
    for (const option of flatten(items)) table.set(option.value, option.label);
    return table;
  }, [items]);

  const registerLabel = useCallback((optionValue: SelectOptionValue, label: string) => {
    if (registry.current.get(optionValue) === label) return;
    registry.current.set(optionValue, label);
    setRegistered((count) => count + 1);
  }, []);

  const labelFor = useCallback(
    (optionValue: SelectOptionValue) =>
      declared.get(optionValue) ?? registry.current.get(optionValue),
    /* The map it reads is a ref, so the count is what tells React the answer
       may have changed. */
    [declared, registered],
  );

  const optionId = useCallback(
    (optionValue: SelectOptionValue) => `${generated}option-${encodeURIComponent(optionValue)}`,
    [generated],
  );

  const latest = useRef({
    currentHighlighted,
    currentOpen,
    currentSelection,
    highlightedValue,
    onHighlightedValueChange,
    onOpenChange,
    onValueChange,
    open,
    resolvedMultiple,
    triggerNode,
    value,
  });
  latest.current = {
    currentHighlighted,
    currentOpen,
    currentSelection,
    highlightedValue,
    onHighlightedValueChange,
    onOpenChange,
    onValueChange,
    open,
    resolvedMultiple,
    triggerNode,
    value,
  };

  /**
   * `createControllable` returns `false` in controlled mode and after a
   * cancellation, so one call answers both questions: whether the component may
   * move its own copy, and whether anything moved at all.
   */
  const setOpen = useCallback((next: boolean, reason: SelectOpenReason, source?: unknown) => {
    const state = latest.current;
    if (next === state.currentOpen) return;

    const controllable = createControllable<boolean>({
      controlled: state.open,
      initial: state.currentOpen,
      onRequest: (request) => state.onOpenChange?.(request.value, request),
    });
    if (!controllable.request(next, reason, source)) return;
    setOwnOpen(next);
    /* A popup that closes takes its highlight with it, and gives the next open
       back its default entry. Both are put back here rather than when the popup
       opens, because a layout effect runs twice per mount under StrictMode and
       anything consumed there is consumed once too often. */
    if (!next) {
      setOwnHighlighted(null);
      entry.current = 'selected';
    }
  }, []);

  const setHighlighted = useCallback(
    (next: SelectOptionValue | null, reason: SelectHighlightReason, source?: unknown) => {
      const state = latest.current;
      if (next === state.currentHighlighted) return;

      const controllable = createControllable<SelectOptionValue | null>({
        controlled: state.highlightedValue,
        initial: state.currentHighlighted,
        onRequest: (request) => state.onHighlightedValueChange?.(request.value, request),
      });
      if (controllable.request(next, reason, source)) setOwnHighlighted(next);
    },
    [],
  );

  /**
   * A request for a set rather than for a value, so single and multiple are one
   * transition with one reason. `docs/state-and-events.md` refuses a request
   * for a value equal to the current one, and the comparison here is by
   * membership rather than by identity: two arrays holding the same three
   * strings are the same selection.
   */
  const commit = useCallback(
    (next: readonly SelectOptionValue[], reason: SelectValueReason, source?: unknown) => {
      const state = latest.current;
      const same =
        next.length === state.currentSelection.length &&
        next.every((entryValue, index) => entryValue === state.currentSelection[index]);
      if (same) return;

      const controllable = createControllable<SelectSelection>({
        controlled: state.value,
        initial: denormalize(state.currentSelection, state.resolvedMultiple),
        /* Membership was compared above, on the two lists; comparing the
           denormalised shapes here would compare two fresh arrays by identity
           and call every request a change. */
        equals: () => false,
        onRequest: (request) => state.onValueChange?.(request.value, request),
      });
      if (controllable.request(denormalize(next, state.resolvedMultiple), reason, source)) {
        setOwnSelection(next);
      }
    },
    [],
  );

  const toggle = useCallback(
    (optionValue: SelectOptionValue, reason: SelectValueReason, source?: unknown) => {
      const state = latest.current;
      if (!state.resolvedMultiple) {
        commit([optionValue], reason, source);
        return;
      }
      const held = state.currentSelection.includes(optionValue);
      commit(
        held
          ? state.currentSelection.filter((candidate) => candidate !== optionValue)
          : [...state.currentSelection, optionValue],
        reason,
        source,
      );
    },
    [commit],
  );

  const clear = useCallback(
    (reason: SelectValueReason, source?: unknown) => commit([], reason, source),
    [commit],
  );

  useImperativeHandle(
    ref,
    () => ({
      close: () => setOpen(false, 'programmatic'),
      focus: () => latest.current.triggerNode?.focus({ preventScroll: true }),
      open: () => setOpen(true, 'programmatic'),
      scrollToKey: (optionValue) => {
        const option = contentNode?.querySelector<HTMLElement>(
          `[data-part='item'][data-value="${CSS.escape(optionValue)}"]`,
        );
        option?.scrollIntoView({ block: 'nearest' });
      },
    }),
    [contentNode, setOpen],
  );

  const context: SelectContextValue = {
    align: align ?? defaults.align,
    alignOffset: alignOffset ?? defaults.alignOffset,
    clear,
    clearable: clearable ?? defaults.clearable,
    clearLabel: clearLabel ?? defaults.clearLabel,
    closeOnEscape: closeOnEscape ?? defaults.closeOnEscape,
    closeOnOutsidePress: closeOnOutsidePress ?? defaults.closeOnOutsidePress,
    closeOnSelect: closeOnSelect ?? defaults.closeOnSelect,
    collisionPadding: collisionPadding ?? defaults.collisionPadding,
    contentId,
    contentNode,
    disabled: resolvedDisabled,
    emptyLabel: emptyLabel ?? defaults.emptyLabel,
    entry,
    flip: flip ?? defaults.flip,
    form,
    fullWidth: fullWidth ?? defaults.fullWidth,
    hideWhenDetached: hideWhenDetached ?? defaults.hideWhenDetached,
    highlighted: currentHighlighted,
    invalid: invalid ?? field?.invalid ?? defaults.invalid,
    labelFor,
    loading: loading ?? defaults.loading,
    loadingLabel: loadingLabel ?? defaults.loadingLabel,
    loop: loop ?? defaults.loop,
    mount: mount ?? defaults.mount,
    multiple: resolvedMultiple,
    name,
    open: currentOpen,
    optionId,
    portal: portal ?? defaults.portal,
    readOnly: resolvedReadOnly,
    registerLabel,
    required: required ?? field?.required ?? defaults.required,
    seen: seen.current,
    selection: currentSelection,
    setContentNode,
    setHighlighted,
    setOpen,
    setTriggerNode,
    shift: shift ?? defaults.shift,
    side: side ?? defaults.side,
    sideOffset: sideOffset ?? defaults.sideOffset,
    size: size ?? field?.size ?? defaults.size,
    strategy: strategy ?? defaults.strategy,
    toggle,
    total,
    triggerId,
    triggerNode,
    typeahead: typeahead ?? defaults.typeahead,
    typeaheadTimeout: typeaheadTimeout ?? defaults.typeaheadTimeout,
    variant: variant ?? defaults.variant,
    width: width ?? defaults.width,
  };

  return <SelectContext.Provider value={context}>{children}</SelectContext.Provider>;
}
