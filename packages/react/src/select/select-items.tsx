import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent, Ref } from 'react';

import { useSelect } from './select';
import type { SelectGroupProps, SelectItemProps } from './select.types';

/**
 * One option.
 *
 * A `div` with `role="option"` rather than a `button`, which is where this
 * family parts company with `menu`. The listbox pattern's option is not a
 * button: it is not separately focusable — DOM focus stays on the control for
 * the whole interaction — and a `button` here would put a widget inside a
 * widget and add a tab stop the pattern excludes by name.
 *
 * **The highlight is set by the pointer as well as by the keyboard.** Entering
 * an option with the pointer moves `aria-activedescendant` to it, so exactly one
 * option is highlighted whichever device is driving, and the state a screen
 * reader announces is the state the eye sees. `data-highlighted` in Radix and
 * Ark exists to paper over the case where those two disagree; there is no such
 * case here.
 */
export function SelectItem({
  children,
  description,
  disabled = false,
  icon,
  position,
  ref,
  textValue,
  value,
  ...nativeProps
}: SelectItemProps) {
  const select = useSelect();
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const registered = useRef<string | null>(null);

  /**
   * The label reaches the closed control through here. `textValue` when the
   * consumer gave one, the rendered text when they did not — read from the DOM
   * because the children may be elements, and what a reader sees is the honest
   * answer either way.
   */
  useEffect(() => {
    if (node === null) return;
    const label = textValue ?? node.querySelector("[data-part='label']")?.textContent?.trim() ?? '';
    if (label === '' || label === registered.current) return;
    registered.current = label;
    select.registerLabel(value, label);
  }, [node, select, textValue, value]);

  const selected = select.selection.includes(value);
  const current = select.highlighted === value;

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    select.setHighlighted(value, 'pointer', event.nativeEvent);
  };

  /**
   * The press is taken here as well, and only to stop the browser moving focus
   * off the trigger: an option cannot hold focus, so a press on it would leave
   * `aria-activedescendant` on a button that is no longer the active element
   * (CB11). `listbox` and `combobox` refuse the press for the same reason.
   */
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    nativeProps.onPointerDown?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    select.toggle(value, 'pointer', event.nativeEvent);
    /* Multiple selection keeps the popup open, so a reader can take three
       options without reopening it twice — the listbox pattern's recommended
       model, and what `closeOnSelect` lets an application overrule. */
    if (select.closeOnSelect && !select.multiple) {
      select.setOpen(false, 'select', event.nativeEvent);
    }
  };

  return (
    <div
      {...nativeProps}
      aria-disabled={disabled ? true : undefined}
      aria-posinset={position}
      aria-setsize={position === undefined ? undefined : select.total}
      aria-selected={selected}
      data-part="item"
      data-value={value}
      /* The element `aria-activedescendant` names. Built from the select's own
         identifier and this option's value, so the control can name an option
         it is not rendering — the trigger writes the attribute, and the option
         is in another subtree at the end of the document. */
      id={nativeProps.id ?? select.optionId(value)}
      {...(textValue === undefined ? {} : { 'data-text-value': textValue })}
      {...(disabled ? { 'data-disabled': '' } : {})}
      {...(selected ? { 'data-selected': '' } : {})}
      {...(current ? { 'data-current': '' } : {})}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      ref={(element: HTMLDivElement | null) => {
        setNode(element);
        if (typeof ref === 'function') ref(element);
        else if (ref !== null && ref !== undefined) ref.current = element;
      }}
      role="option"
    >
      {icon === undefined ? null : <span data-part="icon">{icon}</span>}
      <span data-part="label">{children}</span>
      {description === undefined ? null : <span data-part="description">{description}</span>}
      <span data-part="indicator" />
    </div>
  );
}

/**
 * A set of options under a heading.
 *
 * The group names itself by `aria-labelledby` pointing at its own label, which
 * the listbox pattern requires of every option group. The label is a prop
 * rather than a child part, because a group with no accessible name is a
 * pattern violation the type system can refuse.
 */
export function SelectGroup({ children, label, ...nativeProps }: SelectGroupProps) {
  /* `useId` rather than a counter: a counter increments differently on the
     server and on the client, and the two ids then disagree at hydration. */
  const labelId = `${useId()}group`;

  return (
    <div {...nativeProps} aria-labelledby={labelId} data-part="group" role="group">
      <div data-part="group-label" id={labelId}>
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * A line between two sets of options. `role="separator"` inside a listbox is a
 * structural element and takes no orientation: the line is horizontal because
 * the list is vertical, and saying so twice is how two families came to
 * disagree about which axis the word names.
 */
export function SelectSeparator(props: { ref?: Ref<HTMLDivElement> }) {
  return <div data-part="separator" ref={props.ref} role="separator" />;
}
