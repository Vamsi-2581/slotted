import { splitByMatch } from '@slotted/core/collection';
import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent, ReactNode, Ref } from 'react';

import { useCombobox } from './combobox';
import type { ComboboxGroupProps, ComboboxItemProps } from './combobox.types';

/**
 * One option, and the one that decides whether it belongs in the results.
 *
 * **Each option filters itself.** The family holds the query and the
 * comparison; the option holds its own label, which is the only place the two
 * meet without the consumer having to hand the whole collection over twice. An
 * option that does not match renders nothing, so the popup's DOM *is* the
 * result set — which is what makes the count, the keyboard and the empty row
 * all read the same answer.
 *
 * The text it filters on is `textValue`, or its children when they are a
 * string. Children that are elements cannot be compared, so such an option is
 * always shown and `textValue` is how a consumer says what it reads as.
 */
export function ComboboxItem({
  children,
  description,
  disabled = false,
  icon,
  position,
  ref,
  textValue,
  value,
  ...nativeProps
}: ComboboxItemProps) {
  const combobox = useCombobox();
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const registered = useRef<string | null>(null);

  const text = textValue ?? (typeof children === 'string' ? children : undefined);

  useEffect(() => {
    if (node === null) return;
    const label = text ?? node.querySelector("[data-part='label']")?.textContent?.trim() ?? '';
    if (label === '' || label === registered.current) return;
    registered.current = label;
    combobox.registerLabel(value, label);
  }, [combobox, node, text, value]);

  /**
   * The label, split into the runs the query matched and the runs it did not,
   * from the same collator the filter used. An `indexOf` beside a
   * locale-sensitive filter marks nothing on the row it has just matched, and
   * the reader is left asking why an option with no visible match is in the
   * list.
   */
  const marked = useMemo((): ReactNode => {
    if (!combobox.highlightMatch || combobox.query === '' || text === undefined) return children;
    const runs = splitByMatch(text, combobox.query, { locale: combobox.locale });
    /* `some(matched)` rather than a length check: a query that matches the whole
       label returns exactly one run, and reading "one run" as "no match" left
       the option a reader had typed in full as the only one with no mark. */
    if (!runs.some((run) => run.matched)) return children;
    return runs.map((run, index) =>
      run.matched ? (
        <mark data-part="match" data-ui="highlight" key={index}>
          {run.text}
        </mark>
      ) : (
        <Fragment key={index}>{run.text}</Fragment>
      ),
    );
  }, [children, combobox.highlightMatch, combobox.locale, combobox.query, text]);

  /* The filter cannot judge an option whose label is not text, so it keeps it. */
  if (text !== undefined && !combobox.matches(text)) return null;

  const selected = combobox.value === value;
  const current = combobox.highlighted === value;

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    combobox.setHighlighted(value, 'pointer', event.nativeEvent);
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    combobox.select(value, 'pointer', event.nativeEvent);
    combobox.setInputValue(combobox.labelFor(value) ?? text ?? value, 'select', event.nativeEvent);
    if (combobox.closeOnSelect) combobox.setOpen(false, 'select', event.nativeEvent);
    combobox.inputNode?.focus({ preventScroll: true });
  };

  return (
    <div
      {...nativeProps}
      aria-disabled={disabled ? true : undefined}
      aria-posinset={position}
      aria-selected={selected}
      aria-setsize={position === undefined ? undefined : combobox.total}
      data-part="item"
      data-value={value}
      {...(text === undefined ? {} : { 'data-text-value': text })}
      {...(disabled ? { 'data-disabled': '' } : {})}
      {...(selected ? { 'data-selected': '' } : {})}
      {...(current ? { 'data-current': '' } : {})}
      id={nativeProps.id ?? combobox.optionId(value)}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      ref={(element: HTMLDivElement | null) => {
        setNode(element);
        if (typeof ref === 'function') ref(element);
        else if (ref !== null && ref !== undefined) ref.current = element;
      }}
      role="option"
    >
      {icon === undefined ? null : <span data-part="icon">{icon}</span>}
      <span data-part="label">{marked}</span>
      {description === undefined ? null : <span data-part="description">{description}</span>}
      <span data-part="indicator" />
    </div>
  );
}

/**
 * A set of options under a heading, named by `aria-labelledby` pointing at its
 * own label — which the listbox pattern requires of every option group.
 *
 * A group whose every option was filtered away renders nothing at all: a
 * heading with no options under it says a category matched when none did.
 */
export function ComboboxGroup({ children, label, ...nativeProps }: ComboboxGroupProps) {
  const labelId = `${useId()}group`;
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (node === null) return;
    setEmpty(node.querySelector("[data-part='item']") === null);
  });

  return (
    <div
      {...nativeProps}
      aria-labelledby={labelId}
      data-part="group"
      hidden={empty}
      ref={setNode}
      role="group"
    >
      <div data-part="group-label" id={labelId}>
        {label}
      </div>
      {children}
    </div>
  );
}

export function ComboboxSeparator(props: { ref?: Ref<HTMLDivElement> }) {
  return <div data-part="separator" ref={props.ref} role="separator" />;
}
