import { createDismissableLayer, pressOrigin } from '@slotted/core/dismissable-layer';
import { createWidthGate } from '@slotted/core/measure';
import { createPortalRoot } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent, MouseEvent, Ref } from 'react';
import { createPortal } from 'react-dom';

import { useField } from '../field';
import { useMultiSelect } from './multi-select';
import { ChipRow } from './multi-select-chips';
import {
  entryHighlight,
  isCreateRow,
  moveHighlight,
  options,
  revealOption,
  valueOf,
} from './multi-select-collection';
import type {
  MultiSelectContentProps,
  MultiSelectControlProps,
  MultiSelectPositionerProps,
  MultiSelectRootProps,
} from './multi-select.types';

/** The width, in CSS pixels, under which a chip has no room for a word. */
export const NARROW_WIDTH = 120;

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
 * The frame, the grid, the chips, the field and the two buttons.
 *
 * The field is a real `input`, so every text-editing key, the caret, the
 * selection, IME and autofill stay the browser's — the pattern's own IMPORTANT
 * note asks that script not capture the keys a browser uses to edit text, and
 * the handler below binds none of them while there is text to edit.
 *
 * The trigger carries `tabindex="-1"`, and so does every chip: the combobox
 * pattern excludes the popup indicator from the page tab sequence and the grid
 * pattern puts one element of a layout grid in it. The field is that element,
 * and the whole control is one tab stop.
 */
export function MultiSelectControl({ ref, render, ...nativeProps }: MultiSelectControlProps) {
  const multiSelect = useMultiSelect();
  const field = useField();
  const [node, setNode] = useState<HTMLInputElement | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    multiSelect.setInputNode(node);
  }, [multiSelect, node]);

  /**
   * Under 120 pixels there is no room for a chip at all, and the counter
   * answers instead. A width and a callback rather than a container query:
   * `container-type: inline-size` would stop the frame's own width depending on
   * its contents, which is exactly how a control that is not `fullWidth` is
   * measured. `select` recorded the same finding.
   */
  const setNarrow = multiSelect.setNarrow;
  useEffect(() => {
    const element = frame.current;
    if (element === null) return;
    const gate = createWidthGate(element, { at: NARROW_WIDTH, onChange: setNarrow });
    return () => gate.destroy();
  }, [setNarrow]);

  const move = (intent: Parameters<typeof moveHighlight>[2], source: unknown) => {
    const next = moveHighlight(
      multiSelect.contentNode,
      multiSelect.highlighted,
      intent,
      multiSelect.loop,
    );
    if (next !== null) multiSelect.setHighlighted(next, 'keyboard', source);
  };

  const split = (text: string) => {
    const delimiters = multiSelect.delimiters;
    if (delimiters.length === 0) return [text];
    const pattern = new RegExp(
      `[${delimiters.map((mark) => mark.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('')}]`,
    );
    return text.split(pattern);
  };

  /** The typed text, committed as one or several values. */
  const commitQuery = (source: unknown) => {
    if (!multiSelect.creatable) return false;
    const text = multiSelect.inputValue;
    if (text.trim() === '') return false;
    multiSelect.admit(split(text), 'submit', source);
    multiSelect.setInputValue('', 'submit', source);
    return true;
  };

  /** Takes the highlighted option, and empties the query so the next one can be typed. */
  const commitHighlighted = (source: unknown) => {
    const value = multiSelect.highlighted;
    if (value === null) return false;

    if (isCreateRow(multiSelect.contentNode, value)) {
      commitQuery(source);
      return true;
    }

    multiSelect.toggle(value, 'select', source);
    multiSelect.setInputValue('', 'select', source);
    if (multiSelect.closeOnSelect) multiSelect.setOpen(false, 'select', source);
    return true;
  };

  const openWith = (entry: 'first' | 'last' | 'none', source: unknown) => {
    multiSelect.entry.current = entry;
    multiSelect.setOpen(true, 'keyboard', source);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (multiSelect.disabled) return;
    const alt = event.altKey;

    if (multiSelect.delimiters.includes(event.key) && !alt) {
      event.preventDefault();
      commitQuery(event.nativeEvent);
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        if (multiSelect.readOnly) return;
        event.preventDefault();
        if (!multiSelect.open) openWith(alt ? 'none' : 'first', event.nativeEvent);
        else if (!alt) move('next', event.nativeEvent);
        return;
      case 'ArrowUp':
        if (multiSelect.readOnly) return;
        event.preventDefault();
        if (alt) multiSelect.setOpen(false, 'keyboard', event.nativeEvent);
        else if (!multiSelect.open) openWith('last', event.nativeEvent);
        else move('previous', event.nativeEvent);
        return;
      case 'PageDown':
        if (!multiSelect.open) return;
        event.preventDefault();
        move('pageDown', event.nativeEvent);
        return;
      case 'PageUp':
        if (!multiSelect.open) return;
        event.preventDefault();
        move('pageUp', event.nativeEvent);
        return;
      case 'Enter':
        if (commitHighlighted(event.nativeEvent)) {
          event.preventDefault();
          return;
        }
        if (commitQuery(event.nativeEvent)) event.preventDefault();
        return;
      case 'Escape':
        /* Open, it closes and keeps the typed text; closed, it clears the text.
           It never clears the selection: a set a reader spent six presses
           building is not something one key should take. */
        if (multiSelect.open) {
          event.preventDefault();
          multiSelect.setOpen(false, 'escape', event.nativeEvent);
          return;
        }
        if (multiSelect.inputValue === '') return;
        event.preventDefault();
        multiSelect.setInputValue('', 'clear', event.nativeEvent);
        return;
      case 'Backspace': {
        /**
         * §6's rule, and the predictable half of it: from an empty field the
         * first press moves focus to the last chip and removes nothing, and the
         * second press — which lands on the chip — removes it. One press to see
         * what is about to go, one to let it go, and the only rule under which
         * `Backspace` is reversible without an undo.
         */
        if (multiSelect.inputValue !== '') return;
        if (event.currentTarget.selectionStart !== 0) return;
        if (multiSelect.readOnly || multiSelect.value.length === 0) return;
        const chips = frame.current?.querySelectorAll<HTMLElement>(
          "[data-part='chips'] > [role='gridcell']:not([data-part='field'])",
        );
        const last = chips === undefined ? undefined : chips[chips.length - 1];
        if (last === undefined) return;
        event.preventDefault();
        last.focus({ preventScroll: true });
        return;
      }
      case 'Tab':
        if (multiSelect.open) multiSelect.setOpen(false, 'dismiss', event.nativeEvent);
        return;
      default:
        /* Every other key is the browser's. The pattern's IMPORTANT note asks
           that script not capture the keys used to edit text. */
        break;
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.value;
    multiSelect.setInputValue(next, 'keyboard', event.nativeEvent);
    if (!multiSelect.open && !multiSelect.readOnly && next !== '') {
      multiSelect.entry.current = 'none';
      multiSelect.setOpen(true, 'keyboard', event.nativeEvent);
    }
  };

  /**
   * A paste that carries several values. The same delimiters the key reads, so
   * a control cannot accept `a,b` from the clipboard and refuse it from the
   * keyboard; and what the limit turns away is reported rather than dropped,
   * which is the case none of the eight surveyed implementations describes.
   */
  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!multiSelect.addOnPaste || !multiSelect.creatable || multiSelect.readOnly) return;
    const text = event.clipboardData.getData('text');
    const parts = split(text).filter((part) => part.trim() !== '');
    if (parts.length < 2) return;
    event.preventDefault();
    multiSelect.admit(parts, 'submit', event.nativeEvent);
    multiSelect.setInputValue('', 'submit', event.nativeEvent);
  };

  const onBlur = (event: { relatedTarget: EventTarget | null }) => {
    const next = event.relatedTarget;
    if (next instanceof Node && multiSelect.contentNode?.contains(next) === true) return;
    if (next instanceof Node && frame.current?.contains(next) === true) return;
    /* A press on the popup's own surface takes focus off the field and reports
       no `relatedTarget`, which is indistinguishable from the reader leaving.
       The layer stack records where the press in flight went down. */
    const began = pressOrigin(node?.ownerDocument);
    if (began instanceof Node && multiSelect.contentNode?.contains(began) === true) return;

    if (multiSelect.commitOnBlur) commitQuery(event);
    if (multiSelect.open) multiSelect.setOpen(false, 'blur');
  };

  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    multiSelect.clear(event.nativeEvent);
    node?.focus({ preventScroll: true });
  };

  const toggleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (multiSelect.disabled || multiSelect.readOnly) return;
    multiSelect.entry.current = 'none';
    multiSelect.setOpen(!multiSelect.open, 'pointer', event.nativeEvent);
    node?.focus({ preventScroll: true });
  };

  const setInput = useCallback(
    (element: HTMLInputElement | null) => {
      setNode(element);
      attach(element, ref);
    },
    [ref],
  );

  const describedBy = [nativeProps['aria-describedby'], field?.describedBy]
    .filter(Boolean)
    .join(' ');
  const showClear =
    multiSelect.clearable &&
    (multiSelect.value.length > 0 || multiSelect.inputValue !== '') &&
    !multiSelect.disabled &&
    !multiSelect.readOnly;

  const counter = (() => {
    if (multiSelect.max !== null) {
      return multiSelect.counterLabel
        .replace('{count}', String(multiSelect.value.length))
        .replace('{max}', String(multiSelect.max));
    }
    if (multiSelect.narrow && multiSelect.value.length > 0) {
      return multiSelect.chosenLabel.replace('{count}', String(multiSelect.value.length));
    }
    return null;
  })();

  const rootProps: MultiSelectRootProps = {
    /* The frame is measured — the width gate reads it, and `Backspace` finds
       the last chip through it — so a consumer who replaces it with `render`
       hands the ref on rather than losing the measurement. `toolbar` lost an
       anchor exactly this way. */
    ref: frame,
    'data-overflow': multiSelect.overflow,
    'data-part': 'root',
    'data-size': multiSelect.size,
    'data-ui': 'multi-select',
    'data-variant': multiSelect.variant,
    ...(multiSelect.fullWidth ? { 'data-full-width': '' } : {}),
    ...(multiSelect.open ? { 'data-open': '' } : {}),
    ...(multiSelect.disabled ? { 'data-disabled': '' } : {}),
    ...(multiSelect.readOnly ? { 'data-readonly': '' } : {}),
    ...(multiSelect.invalid ? { 'data-invalid': '' } : {}),
    ...(multiSelect.required ? { 'data-required': '' } : {}),
    ...(multiSelect.loading ? { 'data-loading': '' } : {}),
    ...(multiSelect.full ? { 'data-complete': '' } : {}),
    ...(multiSelect.narrow ? { 'data-narrow': '' } : {}),
  };

  const inner = (
    <>
      <div data-part="control" id={multiSelect.controlId} role="grid">
        <ChipRow>
          <span data-part="field" role="gridcell">
            <input
              {...nativeProps}
              aria-activedescendant={
                multiSelect.open && multiSelect.highlighted !== null
                  ? multiSelect.optionId(multiSelect.highlighted)
                  : undefined
              }
              aria-autocomplete="list"
              aria-controls={multiSelect.open ? multiSelect.contentId : undefined}
              aria-describedby={describedBy === '' ? undefined : describedBy}
              aria-expanded={multiSelect.open}
              aria-invalid={multiSelect.invalid ? true : undefined}
              aria-readonly={multiSelect.readOnly ? true : undefined}
              data-part="input"
              disabled={multiSelect.disabled}
              id={nativeProps.id ?? field?.ids.control ?? multiSelect.inputId}
              onBlur={compose(nativeProps.onBlur, onBlur)}
              onChange={compose(nativeProps.onChange, onChange)}
              onKeyDown={compose(nativeProps.onKeyDown, onKeyDown)}
              onPaste={compose(nativeProps.onPaste, onPaste)}
              /* The placeholder names what an empty control takes; beside a
                 chosen value it is a second phrase on the line, and in a frame
                 too narrow for a chip it was a sliver of a word. */
              placeholder={multiSelect.value.length === 0 ? nativeProps.placeholder : undefined}
              readOnly={multiSelect.readOnly}
              ref={setInput}
              required={multiSelect.required && multiSelect.value.length === 0}
              role="combobox"
              type="text"
              value={multiSelect.inputValue}
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
          aria-label={multiSelect.clearLabel}
          data-part="clear"
          onClick={clear}
          type="button"
        />
      ) : null}
      {multiSelect.loading ? (
        <span aria-hidden="true" data-part="busy" data-ui="spinner" />
      ) : (
        <button
          aria-label={multiSelect.triggerLabel}
          data-part="trigger"
          disabled={multiSelect.disabled}
          onClick={toggleOpen}
          tabIndex={-1}
          type="button"
        >
          <span data-part="arrow" />
        </button>
      )}
      {/*
        One hidden input per value, all under the same name: that is how a plain
        `FormData` receives several values under one key and how a native
        `reset()` restores them.
      */}
      {multiSelect.name === undefined
        ? null
        : multiSelect.value.map((value) => (
            <input
              aria-hidden="true"
              form={multiSelect.form}
              key={value}
              name={multiSelect.name}
              readOnly
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
              type="text"
              value={value}
            />
          ))}
    </>
  );

  if (render !== undefined) return render({ ...rootProps, children: inner });
  return <div {...rootProps}>{inner}</div>;
}

/**
 * The layer, the surface it paints, the band of chosen values and the rows that
 * speak for it.
 *
 * `status` is the live region as well as the loading row: a reader who cannot
 * see the list still hears how many options answered their query.
 */
export function MultiSelectContent({
  children,
  chosen = true,
  empty,
  ref,
  render,
  status: statusMessage,
  ...nativeProps
}: MultiSelectContentProps) {
  const multiSelect = useMultiSelect();

  const [layerNode, setLayerNode] = useState<HTMLElement | null>(null);
  const [surfaceNode, setSurfaceNode] = useState<HTMLElement | null>(null);
  const [container, setContainer] = useState<Element | null>(null);
  const [status, setStatus] = useState<PresenceStatus>('unmounted');
  const [positioned, setPositioned] = useState(false);
  const [count, setCount] = useState(0);

  const presence = useRef<PresenceHandle | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const latest = useRef(multiSelect);
  latest.current = multiSelect;

  useEffect(() => {
    const handle = createPresence({ present: latest.current.open, onStatusChange: setStatus });
    presence.current = handle;
    setStatus(handle.status);
    return () => {
      handle.destroy();
      presence.current = null;
    };
  }, []);

  useEffect(() => presence.current?.sync(multiSelect.open), [multiSelect.open]);
  useEffect(() => presence.current?.setNode(layerNode), [layerNode]);
  useEffect(() => multiSelect.setContentNode(surfaceNode), [multiSelect, surfaceNode]);

  const mounted =
    multiSelect.mount === 'eager' ||
    (multiSelect.mount === 'lazy' && multiSelect.seen) ||
    status !== 'unmounted';

  useEffect(() => {
    if (!mounted) {
      setContainer(null);
      return;
    }
    const handle = createPortalRoot({
      origin: multiSelect.inputNode,
      disabled: !multiSelect.portal,
    });
    setContainer(handle.container);
    return () => handle.release();
  }, [multiSelect.inputNode, multiSelect.portal, mounted]);

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
  } = multiSelect;

  useEffect(() => {
    if (layerNode === null || multiSelect.inputNode === null) return;
    let live = true;

    /* The anchor is the frame rather than the field, so the popup is as wide as
       the control the reader sees and not as wide as the caret's cell. */
    const anchor =
      multiSelect.inputNode.closest<HTMLElement>("[data-part='root']") ?? multiSelect.inputNode;

    const handle = createPositioner(anchor, layerNode, {
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
    multiSelect.inputNode,
    shift,
    side,
    sideOffset,
    strategy,
    width,
  ]);

  useEffect(() => {
    if (layerNode === null || !multiSelect.open) return;
    const root = multiSelect.inputNode?.closest<HTMLElement>("[data-part='root']") ?? null;
    const branches = [root].filter((branch): branch is HTMLElement => branch !== null);

    const layer = createDismissableLayer(layerNode, {
      branches,
      escape: multiSelect.closeOnEscape,
      focusOutside: false,
      modal: false,
      outsidePress: multiSelect.closeOnOutsidePress,
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
    multiSelect.closeOnEscape,
    multiSelect.closeOnOutsidePress,
    multiSelect.inputNode,
    multiSelect.open,
    layerNode,
  ]);

  /**
   * How many options the collection put on the surface. The offer to add what
   * was typed is not one of them: it is drawn *because* the count is nought, so
   * counting it would take it away, which would bring it back.
   */
  useLayoutEffect(() => {
    const measured = options(surfaceNode).filter(
      (option) => option.dataset['create'] === undefined,
    ).length;
    setCount((held) => (held === measured ? held : measured));
  });

  /**
   * Where the highlight lands as the popup opens, and where it goes when the
   * filter takes the highlighted option away. Idempotent, because React invokes
   * a layout effect twice per mount under StrictMode.
   */
  useLayoutEffect(() => {
    const state = latest.current;
    if (!state.open || surfaceNode === null) return;
    if (state.entry.current !== 'none') {
      const next = entryHighlight(surfaceNode, state.entry.current, state.loop);
      state.entry.current = 'none';
      if (next !== null) state.setHighlighted(next, 'keyboard');
      return;
    }
    if (state.highlighted === null) return;
    const held = options(surfaceNode).some((option) => valueOf(option) === state.highlighted);
    if (!held) state.setHighlighted(null, 'keyboard');
  }, [multiSelect.open, count, surfaceNode]);

  useEffect(() => {
    revealOption(surfaceNode, multiSelect.highlighted);
  }, [multiSelect.highlighted, surfaceNode]);

  useEffect(() => {
    const target = sentinel.current;
    const root = surfaceNode;
    const onLoadMore = multiSelect.onLoadMore;
    if (target === null || root === null || onLoadMore === undefined) return;
    if (typeof IntersectionObserver !== 'function') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [multiSelect.onLoadMore, count, surfaceNode]);

  if (!mounted) return null;

  const rootProps: MultiSelectPositionerProps = {
    'data-align': align,
    ...(multiSelect.open ? {} : { inert: true }),
    ...(multiSelect.open && positioned ? { 'data-open': '' } : {}),
    'data-part': 'positioner',
    'data-size': multiSelect.size,
    'data-ui': 'multi-select',
    'data-width': multiSelect.width,
  };

  const message = (() => {
    if (statusMessage !== undefined) return statusMessage;
    if (multiSelect.loading) return multiSelect.loadingLabel;
    if (count === 0) return null;
    return multiSelect.countLabel.replace('{count}', String(count));
  })();

  /* The offer stands only while there is something to offer and room to take
     it: a full control refuses every value, so offering one would be an offer
     the next press turns down. */
  const offering =
    !multiSelect.loading &&
    count === 0 &&
    multiSelect.creatable &&
    !multiSelect.full &&
    multiSelect.query.trim() !== '';

  const element = (
    <div
      {...rootProps}
      ref={(element: HTMLDivElement | null) => {
        setLayerNode(element);
        attach(element, ref as Ref<HTMLDivElement> | undefined);
      }}
    >
      <div
        {...nativeProps}
        aria-busy={multiSelect.loading ? true : undefined}
        aria-multiselectable="true"
        data-loading={multiSelect.loading ? '' : undefined}
        data-part="content"
        id={multiSelect.contentId}
        ref={setSurfaceNode}
        role="listbox"
      >
        {/*
          Every chosen value, whatever the row in the control did with them. It
          is what makes `overflow="collapse"` legal against §6: the `+N` chip
          summarises and this band is where the whole set stays reachable. Its
          chips carry no remove control — focus never enters this layer, so one
          would be reachable by pointer and by nothing else.
        */}
        {chosen && multiSelect.value.length > 0 ? (
          <div data-part="chosen">
            {multiSelect.value.map((value) => (
              <span data-part="root" data-size="sm" data-ui="tag" data-variant="soft" key={value}>
                <span data-part="body">
                  <span data-part="label">{multiSelect.labelFor(value) ?? value}</span>
                </span>
              </span>
            ))}
          </div>
        ) : null}
        {children}
        <div ref={sentinel} />
        {offering ? (
          <div
            data-create=""
            data-part="item"
            data-value={multiSelect.query}
            id={multiSelect.optionId(multiSelect.query)}
            onClick={(event) => {
              multiSelect.admit([multiSelect.query], 'submit', event.nativeEvent);
              multiSelect.setInputValue('', 'submit', event.nativeEvent);
              multiSelect.inputNode?.focus({ preventScroll: true });
            }}
            onPointerDown={(event) => {
              if (event.defaultPrevented) return;
              event.preventDefault();
            }}
            onPointerEnter={(event) =>
              multiSelect.setHighlighted(multiSelect.query, 'pointer', event.nativeEvent)
            }
            role="option"
            aria-selected={false}
            {...(multiSelect.highlighted === multiSelect.query ? { 'data-current': '' } : {})}
          >
            <span data-part="icon" />
            <span data-part="label">
              {multiSelect.createLabel.replace('{query}', multiSelect.query)}
            </span>
            <span data-part="indicator" />
          </div>
        ) : null}
        {!multiSelect.loading && count === 0 && !offering ? (
          <div data-part="empty">{empty ?? multiSelect.emptyLabel}</div>
        ) : null}
        {multiSelect.loading ? (
          <div aria-hidden="true" data-part="placeholder">
            {[0, 1, 2].map((row) => (
              <div key={row}>
                <span data-part="root" data-shape="text" data-ui="skeleton" data-loading="" />
              </div>
            ))}
          </div>
        ) : null}
        <div
          aria-live="polite"
          data-part="status"
          {...(multiSelect.loading ? { 'data-loading': '' } : {})}
          role="status"
        >
          {message}
        </div>
      </div>
    </div>
  );

  const rendered = render === undefined ? element : render({ ...rootProps, children });
  return container === null ? rendered : createPortal(rendered, container);
}
