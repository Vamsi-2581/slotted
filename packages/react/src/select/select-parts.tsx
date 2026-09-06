import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import { createPortalRoot } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { createTypeahead, isPrintable } from '@slotted/core/typeahead';
import type { TypeaheadHandle } from '@slotted/core/typeahead';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, Ref } from 'react';
import { createPortal } from 'react-dom';

import { useField } from '../field';
import { useSelect } from './select';
import { ChipRow } from './select-tags';
import {
  entryHighlight,
  moveHighlight,
  options,
  revealOption,
  searchable,
  valueOf,
} from './select-collection';
import type {
  SelectContentProps,
  SelectOptionValue,
  SelectPositionerProps,
  SelectTriggerProps,
  SelectTriggerRootProps,
  SelectValueProps,
} from './select.types';

/**
 * The family's own handler runs after the consumer's, and only if the consumer
 * has not called `preventDefault`. Composing rather than replacing is what lets
 * a page put its own `onKeyDown` on a trigger and keep both.
 */
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

/**
 * The frame, the button, the chevron and the clear button.
 *
 * Four elements from one component, as `text-field` renders its frame, its
 * input and its two buttons: the frame draws the border and the focus ring, and
 * the ring can only be drawn by an ancestor of the thing that took focus. The
 * chevron and the clear button are siblings of the button rather than children
 * of it, because a focusable descendant of a `combobox` is a widget inside a
 * widget, and the stylesheet places both against the frame's inline end.
 *
 * `render` replaces the **frame**, which is the element a consumer has a reason
 * to change — a `label` wrapping the whole control, for instance. The button
 * itself carries the role, the wiring and every key in the pattern, and
 * replacing it would replace all three.
 */
export function SelectTrigger({ children, ref, render, ...nativeProps }: SelectTriggerProps) {
  const select = useSelect();
  const field = useField();
  const [node, setNode] = useState<HTMLButtonElement | null>(null);
  /**
   * The frame, and whether it is under the width a chip needs (SL4). The
   * measurement is the frame's rather than the trigger's because the chips
   * stand over the trigger and the sentence stands inside it, and the two have
   * to answer the same width.
   */
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [narrow, setNarrow] = useState(false);

  const pending = useRef<string | null>(null);
  const typeahead = useRef<TypeaheadHandle | null>(null);

  useEffect(() => {
    select.setTriggerNode(node);
  }, [node, select]);

  useEffect(() => {
    if (!select.typeahead) return;
    const handle = createTypeahead({ timeout: select.typeaheadTimeout });
    typeahead.current = handle;
    return () => {
      handle.destroy();
      typeahead.current = null;
    };
  }, [select.typeahead, select.typeaheadTimeout]);

  /**
   * The character that opened the popup, applied once the popup exists. A
   * printable key on a closed control both opens it and moves the highlight —
   * the pattern asks for both — and under `mount="active"` there is no list to
   * search until React has rendered one.
   */
  useEffect(() => {
    if (!select.open || select.contentNode === null) return;
    const character = pending.current;
    pending.current = null;
    if (character === null || typeahead.current === null) return;
    const { elements, labels } = searchable(select.contentNode);
    const index = typeahead.current.match(character, labels, -1);
    if (index !== -1) select.setHighlighted(valueOf(elements[index] as HTMLElement), 'keyboard');
  }, [select, select.contentNode, select.open]);

  const openWith = (entry: 'selected' | 'first' | 'last' | 'none', source?: unknown) => {
    select.entry.current = entry;
    select.setOpen(true, 'keyboard', source);
  };

  const move = (intent: Parameters<typeof moveHighlight>[2], source: unknown) => {
    const next = moveHighlight(select.contentNode, select.highlighted, intent, select.loop);
    if (next !== null) select.setHighlighted(next, 'keyboard', source);
  };

  /** Takes the highlighted option, and says what happens to the popup after. */
  const commitHighlighted = (source: unknown, close: boolean) => {
    if (select.highlighted === null) {
      if (close) select.setOpen(false, 'select', source);
      return;
    }
    select.toggle(select.highlighted, 'keyboard', source);
    if (close) select.setOpen(false, 'select', source);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (select.disabled || select.readOnly) return;
    const alt = event.altKey;

    if (!select.open) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          openWith(alt ? 'none' : 'selected', event.nativeEvent);
          return;
        case 'ArrowUp':
          event.preventDefault();
          /* The example opens onto the first option; the last is the mirror of
             ArrowDown and what every surveyed implementation does. The contract
             records the departure. */
          openWith('last', event.nativeEvent);
          return;
        case 'Enter':
        case ' ':
          event.preventDefault();
          openWith('selected', event.nativeEvent);
          return;
        case 'Home':
          event.preventDefault();
          openWith('first', event.nativeEvent);
          return;
        case 'End':
          event.preventDefault();
          openWith('last', event.nativeEvent);
          return;
        default:
          break;
      }
      if (select.typeahead && !event.ctrlKey && !event.metaKey && !alt && isPrintable(event.key)) {
        event.preventDefault();
        pending.current = event.key;
        openWith('none', event.nativeEvent);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move('next', event.nativeEvent);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (alt) commitHighlighted(event.nativeEvent, true);
        else move('previous', event.nativeEvent);
        return;
      case 'Home':
        event.preventDefault();
        move('first', event.nativeEvent);
        return;
      case 'End':
        event.preventDefault();
        move('last', event.nativeEvent);
        return;
      case 'PageDown':
        event.preventDefault();
        move('pageDown', event.nativeEvent);
        return;
      case 'PageUp':
        event.preventDefault();
        move('pageUp', event.nativeEvent);
        return;
      case 'Enter':
        event.preventDefault();
        commitHighlighted(event.nativeEvent, select.closeOnSelect);
        return;
      case ' ':
        event.preventDefault();
        /* Multiple selection keeps the popup open on Space, which is the
           listbox pattern's recommended model: the reader toggles several
           options without the list closing under them. */
        commitHighlighted(event.nativeEvent, select.multiple ? false : select.closeOnSelect);
        return;
      case 'Escape':
        event.preventDefault();
        select.setOpen(false, 'escape', event.nativeEvent);
        return;
      case 'Tab':
        /* Not prevented: the key commits and then does what Tab does. The
           example states this and notes it differs from a native select, which
           closes and leaves focus where it is. */
        commitHighlighted(event.nativeEvent, true);
        return;
      default:
        break;
    }

    if (!select.typeahead || typeahead.current === null) return;
    if (event.ctrlKey || event.metaKey || alt) return;
    if (!isPrintable(event.key, typeahead.current.query.length > 0)) return;

    event.preventDefault();
    const { elements, labels } = searchable(select.contentNode);
    const from = elements.findIndex((option) => valueOf(option) === select.highlighted);
    const index = typeahead.current.match(event.key, labels, from);
    if (index !== -1) select.setHighlighted(valueOf(elements[index] as HTMLElement), 'keyboard');
  };

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (select.disabled || select.readOnly) return;
    select.entry.current = 'selected';
    select.setOpen(!select.open, 'pointer', event.nativeEvent);
  };

  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    select.clear('clear', event.nativeEvent);
    /* Focus goes back to the control the reader was on: a button that removes
       itself as it is pressed would otherwise leave focus on the document. */
    node?.focus({ preventScroll: true });
  };

  const setButton = useCallback(
    (element: HTMLButtonElement | null) => {
      setNode(element);
      attach(element, ref);
    },
    [ref],
  );

  const describedBy = [nativeProps['aria-describedby'], field?.describedBy]
    .filter(Boolean)
    .join(' ');

  const showClear =
    select.clearable && select.selection.length > 0 && !select.disabled && !select.readOnly;

  const rootProps: SelectTriggerRootProps = {
    'data-part': 'root',
    'data-size': select.size,
    'data-ui': 'select',
    'data-variant': select.variant,
    ...(select.fullWidth ? { 'data-full-width': '' } : {}),
    ...(select.multiple ? { 'data-multiple': '' } : {}),
    ...(select.open ? { 'data-open': '' } : {}),
    ...(select.disabled ? { 'data-disabled': '' } : {}),
    ...(select.readOnly ? { 'data-readonly': '' } : {}),
    ...(select.invalid ? { 'data-invalid': '' } : {}),
    ...(select.required ? { 'data-required': '' } : {}),
    ...(select.loading ? { 'data-loading': '' } : {}),
    ...(narrow ? { 'data-narrow': '' } : {}),
  };

  /**
   * The chips stand over the trigger rather than inside it: the trigger is a
   * `button`, and a remove control inside one is a control inside a control
   * (SL4). The row is a sibling, placed by the stylesheet over the trigger's
   * own content box, and it lets every press it does not want through to the
   * button underneath.
   */
  const chips =
    select.multiple && select.selection.length > 0 ? (
      <ChipRow
        disabled={select.disabled || select.readOnly}
        frame={frame}
        labelFor={select.labelFor}
        onNarrow={setNarrow}
        onRemove={(value, event) => {
          select.toggle(value, 'select', event.nativeEvent);
          node?.focus({ preventScroll: true });
        }}
        removeLabel={select.removeLabel}
        values={select.selection}
      />
    ) : null;

  const inner = (
    <>
      <button
        {...nativeProps}
        aria-activedescendant={
          select.open && select.highlighted !== null
            ? select.optionId(select.highlighted)
            : undefined
        }
        aria-controls={select.open ? select.contentId : undefined}
        aria-describedby={describedBy === '' ? undefined : describedBy}
        aria-expanded={select.open}
        /* Redundant for role="combobox", whose implicit value is listbox, and
           written anyway because the element is a button and the role replaces
           `button` on it. */
        aria-haspopup="listbox"
        aria-invalid={select.invalid ? true : undefined}
        aria-labelledby={
          nativeProps['aria-label'] === undefined && nativeProps['aria-labelledby'] === undefined
            ? field?.ids.label
            : nativeProps['aria-labelledby']
        }
        aria-readonly={select.readOnly ? true : undefined}
        aria-required={select.required ? true : undefined}
        data-part="trigger"
        disabled={select.disabled}
        id={select.triggerId}
        onClick={compose(nativeProps.onClick, onClick)}
        onKeyDown={compose(nativeProps.onKeyDown, onKeyDown)}
        ref={setButton}
        role="combobox"
        type="button"
      >
        {children}
      </button>
      {showClear ? (
        <button aria-label={select.clearLabel} data-part="clear" onClick={clear} type="button" />
      ) : null}
      {/*
        While an answer is travelling the control shows the ring rather than the
        chevron: the chevron says the popup opens, and it does not open onto
        anything yet (SL6). The arc is `spinner`'s, worn as `data-ui` beside
        this family's own part.
      */}
      {chips}
      {select.loading ? (
        <span aria-hidden="true" data-part="busy" data-ui="spinner" />
      ) : (
        <span data-part="arrow" />
      )}
      <NativeSelect />
    </>
  );

  if (render !== undefined) return render({ ...rootProps, children: inner });
  return (
    <div {...rootProps} ref={setFrame}>
      {inner}
    </div>
  );
}

/**
 * The element a plain form submits, and the one a native `reset()` restores.
 *
 * A real `select` with a real `option` for each value, visually hidden rather
 * than `display: none`, because a hidden control is not submitted. Radix ships
 * the same element for the same reason, and it is what makes the browser's own
 * validation bubble point at the right control.
 *
 * It is `aria-hidden` and out of the tab order: the reader operates the button
 * above it, and a second combobox in the accessibility tree would be announced
 * twice.
 */
function NativeSelect() {
  const select = useSelect();
  if (select.name === undefined) return null;

  return (
    <select
      aria-hidden="true"
      disabled={select.disabled}
      form={select.form}
      multiple={select.multiple}
      name={select.name}
      onChange={() => undefined}
      required={select.required}
      style={{
        border: 0,
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: '1px',
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: '1px',
      }}
      tabIndex={-1}
      value={select.multiple ? [...select.selection] : (select.selection[0] ?? '')}
    >
      <option value="" />
      {select.selection.map((value) => (
        <option key={value} value={value}>
          {select.labelFor(value) ?? value}
        </option>
      ))}
    </select>
  );
}

/**
 * What the control shows: the chosen label, the summary of several, or the
 * placeholder.
 *
 * `children` is a function rather than a node, because the only thing a
 * consumer needs to change here is how a *value* becomes words — "three
 * selected", a chip count, a formatted date. It receives the values and the
 * labels the family could resolve, so a consumer who has the records already
 * does not have to resolve them twice.
 */
export function SelectValue({ children, placeholder, ...nativeProps }: SelectValueProps) {
  const select = useSelect();
  const labels = select.selection.map((value) => select.labelFor(value));
  const resolved = labels.filter((label): label is string => label !== undefined);
  const unmatched = select.selection.length > 0 && resolved.length < select.selection.length;

  const summary = (() => {
    if (children !== undefined) return children(select.selection, resolved);
    if (select.selection.length === 0) return placeholder;
    const first = labels[0] ?? select.selection[0];
    if (!select.multiple || select.selection.length === 1) return first;
    /**
     * Several values are the chips beside this element, not a sentence here
     * (SL4). The sentence stays anyway, in its own part: it is the trigger's
     * accessible name, and it is what a control too narrow for a chip shows
     * instead. The stylesheet decides which of the two is seen; the name is
     * the same either way.
     */
    return (
      <span data-part="summary">
        {select.summaryLabel.replace('{count}', String(select.selection.length))}
      </span>
    );
  })();

  return (
    <span
      {...nativeProps}
      data-part="value"
      {...(select.selection.length === 0 ? { 'data-placeholder': '' } : {})}
      {...(unmatched ? { 'data-unmatched': '' } : {})}
    >
      {summary}
    </span>
  );
}

/**
 * The layer and the surface it paints.
 *
 * The layer is what the positioner writes `left` and `top` onto and what scales
 * and fades; the surface is the painted panel, and it is the element carrying
 * `role="listbox"`. Two boxes rather than one, as `tooltip`, `popover` and
 * `menu` are built, because the positioner leaves `transform` alone on purpose.
 */
export function SelectContent({
  children,
  empty,
  ref,
  render,
  status: statusMessage,
  ...nativeProps
}: SelectContentProps) {
  const select = useSelect();

  const [layerNode, setLayerNode] = useState<HTMLElement | null>(null);
  const [surfaceNode, setSurfaceNode] = useState<HTMLElement | null>(null);
  const [container, setContainer] = useState<Element | null>(null);
  const [status, setStatus] = useState<PresenceStatus>('unmounted');
  const [positioned, setPositioned] = useState(false);
  /**
   * How many options the popup is holding, counted from the DOM after every
   * render. It is what decides whether the empty row is drawn, and counting is
   * what lets a consumer render options from any shape — a map, a filter, three
   * groups — without telling the family how many there will be.
   */
  const [count, setCount] = useState(0);

  const presence = useRef<PresenceHandle | null>(null);
  const latest = useRef(select);
  latest.current = select;

  useEffect(() => {
    const handle = createPresence({ present: latest.current.open, onStatusChange: setStatus });
    presence.current = handle;
    setStatus(handle.status);
    return () => {
      handle.destroy();
      presence.current = null;
    };
  }, []);

  useEffect(() => presence.current?.sync(select.open), [select.open]);
  useEffect(() => presence.current?.setNode(layerNode), [layerNode]);
  useEffect(() => select.setContentNode(surfaceNode), [select, surfaceNode]);

  const mounted =
    select.mount === 'eager' || (select.mount === 'lazy' && select.seen) || status !== 'unmounted';

  useEffect(() => {
    if (!mounted) {
      setContainer(null);
      return;
    }
    const handle = createPortalRoot({ origin: select.triggerNode, disabled: !select.portal });
    setContainer(handle.container);
    return () => handle.release();
  }, [mounted, select.portal, select.triggerNode]);

  const {
    align,
    alignOffset,
    collisionPadding,
    flip,
    hideWhenDetached,
    shift,
    side,
    sideOffset,
    strategy,
    width,
  } = select;

  useEffect(() => {
    if (layerNode === null || select.triggerNode === null) return;
    let live = true;

    const handle = createPositioner(select.triggerNode, layerNode, {
      align,
      alignOffset,
      boundaryPadding: collisionPadding,
      flip,
      hideWhenDetached,
      matchWidth: width === 'anchor',
      shift,
      side,
      sideOffset,
      strategy,
    });

    void handle.update().then(() => {
      if (live) setPositioned(true);
    });

    return () => {
      live = false;
      handle.destroy();
      setPositioned(false);
    };
  }, [
    align,
    alignOffset,
    collisionPadding,
    flip,
    hideWhenDetached,
    layerNode,
    select.triggerNode,
    shift,
    side,
    sideOffset,
    strategy,
    width,
  ]);

  /**
   * One layer in the single stack. The control is a branch, so pressing the
   * trigger again toggles the popup instead of dismissing it and reopening it
   * in the same gesture.
   */
  useEffect(() => {
    if (layerNode === null || !select.open) return;
    const branches = [select.triggerNode].filter(
      (branch): branch is HTMLElement => branch !== null,
    );

    const layer = createDismissableLayer(layerNode, {
      branches,
      escape: select.closeOnEscape,
      focusOutside: false,
      modal: false,
      outsidePress: select.closeOnOutsidePress,
      scrollLock: false,
      onDismiss: (request) => {
        latest.current.setOpen(
          false,
          request.reason === 'escape' ? 'escape' : 'outsidePress',
          request.source,
        );
      },
    });
    return () => layer.destroy();
  }, [
    layerNode,
    select.closeOnEscape,
    select.closeOnOutsidePress,
    select.open,
    select.triggerNode,
  ]);

  /**
   * Where the highlight lands as the popup opens. Nothing takes focus — the
   * trigger keeps it for the whole interaction — so this is the whole of what
   * "focus enters the surface" means for this family.
   */
  /**
   * Where the highlight lands as the popup opens. Nothing takes focus — the
   * trigger keeps it for the whole interaction — so this is the whole of what
   * "focus enters the surface" means for this family.
   *
   * The effect is **idempotent**, and deliberately: React invokes a layout
   * effect twice per mount under StrictMode, and the first version of this one
   * consumed `entry` by resetting it — so the second invocation read
   * `'selected'`, and `ArrowUp` opened onto the first option instead of the
   * last. Nothing is consumed here; `setOpen` puts `entry` back when the popup
   * closes, which is the one moment the answer stops being needed.
   */
  useLayoutEffect(() => {
    const state = latest.current;
    if (!state.open || surfaceNode === null) return;
    if (state.entry.current === 'none') return;
    const next = entryHighlight(surfaceNode, state.selection, state.entry.current, state.loop);
    if (next !== null) state.setHighlighted(next, 'keyboard');
  }, [select.open, surfaceNode]);

  useLayoutEffect(() => {
    const measured = options(surfaceNode).length;
    setCount((held) => (held === measured ? held : measured));
  });

  /** A browser scrolls a focused element into view; nothing here is focused. */
  useEffect(() => {
    revealOption(surfaceNode, select.highlighted);
  }, [select.highlighted, surfaceNode]);

  if (!mounted) return null;

  const rootProps: SelectPositionerProps = {
    'data-align': align,
    ...(select.open ? {} : { inert: true }),
    ...(select.open && positioned ? { 'data-open': '' } : {}),
    'data-part': 'positioner',
    'data-size': select.size,
    'data-ui': 'select',
    'data-width': select.width,
  };

  const element = (
    <div
      {...rootProps}
      ref={(node: HTMLDivElement | null) => {
        setLayerNode(node);
        attach(node, ref as Ref<HTMLDivElement> | undefined);
      }}
    >
      <div
        {...nativeProps}
        aria-busy={select.loading ? true : undefined}
        aria-labelledby={nativeProps['aria-label'] === undefined ? select.triggerId : undefined}
        aria-multiselectable={select.multiple ? true : undefined}
        data-loading={select.loading ? '' : undefined}
        data-part="content"
        id={select.contentId}
        ref={setSurfaceNode}
        role="listbox"
      >
        {children}
        {/*
          The two rows a consumer configures rather than places. A popup that
          opens onto nothing is what React Aria refuses to open at all and what
          Radix paints as an empty box; here it opens onto a sentence, and the
          sentence has a default so a family that says nothing still says
          something. The status row keeps the popup's measure while an answer is
          travelling, so nothing jumps when the options land.
        */}
        {select.loading ? (
          /*
            The wait, as the shape of the list that is coming: three rows the
            height of an option, drawn by `skeleton` (SL6). Hidden from
            assistive technology — the status row below is the live region and
            it already says what is happening.
          */
          <div aria-hidden="true" data-part="placeholder">
            {[0, 1, 2].map((row) => (
              <div key={row}>
                <span data-part="root" data-shape="text" data-ui="skeleton" data-loading="" />
              </div>
            ))}
          </div>
        ) : null}
        {select.loading ? (
          <div data-loading="" data-part="status" role="status">
            {statusMessage ?? select.loadingLabel}
          </div>
        ) : null}
        {!select.loading && count === 0 ? (
          <div data-part="empty">{empty ?? select.emptyLabel}</div>
        ) : null}
      </div>
    </div>
  );

  const rendered = render === undefined ? element : render({ ...rootProps, children });
  return container === null ? rendered : createPortal(rendered, container);
}

export type { SelectOptionValue };
