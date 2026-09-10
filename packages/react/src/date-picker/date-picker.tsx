import '@slotted/styles/date-picker/date-picker.css';

import { createDateFormat, isDateInRange } from '@slotted/core/date';
import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import { createPortalRoot } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Calendar, asDates, isRange } from '../calendar';
import type { CalendarValue, CalendarView } from '../calendar';
import { DateField } from '../date-field';
import type { DateFieldHandle } from '../date-field';
import { useField } from '../field';
import { useDatePickerDefaults } from './date-picker-defaults';
import type { DatePickerProps, DatePickerRootProps } from './date-picker.types';

/**
 * Below this width, on a finger, the surface is a sheet rather than a popover.
 * §2.7 of `docs/component-features.md` asks for it by name. The number is here
 * as well as in the stylesheet because the DOM has to say which presentation it
 * is in, and a media query cannot write an attribute.
 */
const SHEET_QUERY = '(max-width: 480px) and (pointer: coarse)';

/**
 * A date field, a trigger, and a calendar behind them.
 *
 * **It composes the other two families and redraws neither.** The field keeps
 * its own `data-ui` and the calendar keeps its own; this family owns the box the
 * positioner measures, the trigger inside the field's end slot, and the layer
 * the calendar stands on. A second segmented field or a second month grid would
 * be two places to fix one defect.
 *
 * **The trigger's name carries the chosen date.** Focus returns to it when the
 * surface closes, so the name is where the reader is told what was chosen —
 * which the APG's own example names as an accessibility feature.
 *
 * **`Escape` is staged.** `dismissable-layer` asks in the capture phase, so a
 * handler inside the surface is too late; the family decides there instead, and
 * walks the calendar's view down rather than closing while a month or year grid
 * is showing.
 */
export function DatePicker({
  calendar,
  changeLabel,
  chooseLabel,
  className,
  clearable = false,
  closeOnSelect,
  defaultOpen = false,
  defaultValue,
  defaultView,
  disabled,
  firstDayOfWeek,
  fixedWeeks = true,
  footer,
  invalid,
  isDateUnavailable,
  locale,
  max,
  min,
  months,
  name,
  onKeyDown,
  onOpenChange,
  onValueChange,
  open,
  placement,
  presets,
  readOnly,
  ref,
  render,
  required,
  selectionMode = 'single',
  size,
  style,
  timeZone,
  value,
  variant,
  weekNumbers,
  yearPivot,
  ...nativeProps
}: DatePickerProps) {
  const field = useField();
  const defaults = useDatePickerDefaults();
  const rootRef = useRef<HTMLElement | null>(null);
  const fieldHandle = useRef<DateFieldHandle | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentId = useId();

  const [layerNode, setLayerNode] = useState<HTMLElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState<PresenceStatus>('unmounted');
  const [positioned, setPositioned] = useState(false);
  const [sheet, setSheet] = useState(false);

  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const [ownValue, setOwnValue] = useState<CalendarValue>(defaultValue ?? null);
  const held = value ?? ownValue;
  const [view, setView] = useState<CalendarView>(defaultView ?? 'day');

  const resolvedLocale = locale ?? defaults.locale;
  const resolvedTimeZone = timeZone ?? defaults.timeZone;
  const resolvedCalendar = calendar ?? defaults.calendar;
  const resolvedSize = size ?? field?.size ?? defaults.size;
  const resolvedVariant = variant ?? defaults.variant;
  const resolvedPlacement = placement ?? defaults.placement;
  const resolvedCloseOnSelect = closeOnSelect ?? defaults.closeOnSelect;
  const resolvedDisabled = disabled ?? field?.disabled;
  const resolvedReadOnly = readOnly ?? field?.readOnly;
  /**
   * Validity the family owns, beside the validity the consumer states. A date
   * outside the bounds or refused by the predicate is invalid whatever the
   * field around it says, because this control is the only thing that knows.
   */
  const outOfRange = () =>
    asDates(value ?? ownValue).some(
      (date) => !isDateInRange(date, min, max) || isDateUnavailable?.(date) === true,
    );
  const resolvedInvalid = invalid ?? (outOfRange() ? true : field?.invalid);
  const resolvedRequired = required ?? field?.required;
  const editable = resolvedDisabled !== true && resolvedReadOnly !== true;

  const format = useMemo(() => createDateFormat({ locale: resolvedLocale }), [resolvedLocale]);

  const setOpen = useCallback(
    (
      next: boolean,
      reason: 'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'select',
      source: unknown,
    ) => {
      const state = createControllable<boolean>({
        controlled: open,
        initial: isOpen,
        onRequest: (request) => onOpenChange?.(request.value, request),
      });
      if (state.request(next, reason, source)) setOwnOpen(next);
    },
    [isOpen, onOpenChange, open],
  );

  const requestValue = useCallback(
    (next: CalendarValue, request: { reason: string; source?: unknown }) => {
      const state = createControllable<CalendarValue>({
        controlled: value,
        initial: held,
        equals: () => false,
        onRequest: (asked) => onValueChange?.(asked.value, asked),
      });
      if (state.request(next, request.reason as never, request.source)) setOwnValue(next);
    },
    [held, onValueChange, value],
  );

  /** The presence of the layer, so an exit animation is allowed to finish. */
  const presence = useRef<PresenceHandle | null>(null);
  useEffect(() => {
    const handle = createPresence({ present: isOpen, onStatusChange: setStatus });
    presence.current = handle;
    setStatus(handle.status);
    return () => {
      handle.destroy();
      presence.current = null;
    };
    /* Created once; the effect below keeps it in step with the state. */
  }, []);
  useEffect(() => presence.current?.sync(isOpen), [isOpen]);
  useEffect(() => presence.current?.setNode(layerNode), [layerNode]);

  const mounted = status !== 'unmounted';

  useEffect(() => {
    if (!mounted) {
      setContainer(null);
      return;
    }
    const handle = createPortalRoot({ origin: triggerRef.current, disabled: false });
    setContainer(handle.container as HTMLElement);
    return () => handle.release();
  }, [mounted]);

  /** Which presentation the surface is in, as a fact the DOM carries. */
  useEffect(() => {
    /* `matchMedia` is absent in a server render and in some test environments,
       and the popover is the right answer wherever it cannot be asked. */
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(SHEET_QUERY);
    const read = () => setSheet(query.matches);
    read();
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);

  useEffect(() => {
    if (layerNode === null || rootRef.current === null || sheet) return;
    let live = true;

    /* The anchor is the control rather than the trigger inside it, so the
       surface hangs from the box the reader sees. */
    const anchor =
      rootRef.current.querySelector<HTMLElement>('[data-part="control"]') ?? rootRef.current;
    const [side, align = 'center'] = resolvedPlacement.split('-') as [
      'top' | 'bottom',
      'start' | 'end' | undefined,
    ];

    const handle = createPositioner(anchor, layerNode, {
      align: align === undefined ? 'center' : align,
      side,
    });
    void handle.update().then(() => {
      if (live) setPositioned(true);
    });

    return () => {
      live = false;
      handle.destroy();
      setPositioned(false);
    };
  }, [layerNode, resolvedPlacement, sheet]);

  /**
   * One layer in the single stack, with the trigger as a branch so pressing it
   * again closes the surface instead of dismissing and reopening it in one
   * gesture.
   */
  const viewRef = useRef(view);
  viewRef.current = view;
  useEffect(() => {
    if (layerNode === null || !isOpen) return;
    const branches: Element[] = triggerRef.current === null ? [] : [triggerRef.current];

    const layer = createDismissableLayer(layerNode, {
      branches,
      escape: true,
      focusOutside: false,
      modal: false,
      outsidePress: true,
      scrollLock: false,
      onDismiss: (request) => {
        /**
         * The view first, the surface second. The layer listens in the capture
         * phase, so a handler on the calendar would already have lost the
         * surface by the time it ran; the decision is taken here, and the
         * layer is simply not asked to close.
         */
        if (request.reason === 'escape' && viewRef.current !== 'day') {
          setView(viewRef.current === 'year' ? 'month' : 'day');
          return;
        }
        setOpen(false, request.reason === 'escape' ? 'escape' : 'outsidePress', request.source);
        /* Focus goes back to the trigger on a key and stays where the reader
           put it on a press outside. */
        if (request.reason === 'escape') triggerRef.current?.focus({ preventScroll: true });
      },
    });
    return () => layer.destroy();
  }, [isOpen, layerNode, setOpen]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => fieldHandle.current?.focus(),
      open: () => setOpen(true, 'keyboard', undefined),
      close: () => setOpen(false, 'keyboard', undefined),
    }),
    [setOpen],
  );

  /**
   * The trigger's accessible name. Focus returns here when the surface closes,
   * so this is where the reader is told what was chosen — the APG names it as
   * an accessibility feature of its own example.
   */
  const chosen = asDates(held);
  const spoken =
    chosen.length === 0
      ? (chooseLabel ?? defaults.chooseLabel)
      : `${changeLabel ?? defaults.changeLabel}, ${chosen.map((date) => format.describe(date)).join(' – ')}`;

  const closesOnSelect =
    resolvedCloseOnSelect === 'always' ||
    (resolvedCloseOnSelect === 'auto' && selectionMode === 'single');

  const onControlKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as never);
    if (event.defaultPrevented || !editable) return;
    /* Angular Material records the platform note this inherits: ChromeOS turns
       the chord into PageDown before the browser sees it, which is why the
       trigger button is always drawn and this is only a shortcut. */
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true, 'keyboard', event);
    }
  };

  const singleValue = isRange(held) || Array.isArray(held) ? undefined : (held ?? null);

  const surface: ReactNode = mounted ? (
    <div
      data-part="positioner"
      data-presentation={sheet ? 'sheet' : 'popover'}
      data-ui="date-picker"
      ref={setLayerNode}
      {...(isOpen ? { 'data-open': '' } : {})}
      {...(positioned ? { 'data-positioned': '' } : {})}
    >
      <div aria-label={spoken} data-part="content" id={contentId} role="dialog">
        {presets === undefined ? null : <div data-part="presets">{presets}</div>}
        <Calendar
          fixedWeeks={fixedWeeks}
          isDateUnavailable={isDateUnavailable}
          locale={resolvedLocale}
          max={max}
          min={min}
          months={months}
          onValueChange={(next, request) => {
            requestValue(next, request);
            if (closesOnSelect) {
              setOpen(false, 'select', request.source);
              triggerRef.current?.focus({ preventScroll: true });
            }
          }}
          onViewChange={setView}
          readOnly={resolvedReadOnly}
          selectionMode={selectionMode}
          timeZone={resolvedTimeZone}
          value={held}
          view={view}
          weekNumbers={weekNumbers}
          {...(firstDayOfWeek === undefined ? {} : { firstDayOfWeek })}
        />
        {footer === undefined ? null : <div data-part="footer">{footer}</div>}
      </div>
      <span aria-hidden="true" data-part="arrow" />
    </div>
  ) : null;

  const children: ReactNode = (
    <>
      <div data-part="control" onKeyDown={onControlKeyDown}>
        <DateField
          calendar={resolvedCalendar}
          clearable={clearable}
          disabled={resolvedDisabled}
          end={
            <button
              aria-controls={isOpen ? contentId : undefined}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-label={spoken}
              data-part="trigger"
              disabled={!editable}
              onClick={(event) => setOpen(!isOpen, 'pointer', event)}
              ref={triggerRef}
              type="button"
            />
          }
          invalid={resolvedInvalid}
          isDateUnavailable={isDateUnavailable}
          locale={resolvedLocale}
          max={max}
          min={min}
          name={name}
          onValueChange={(next, request) => requestValue(next, request)}
          readOnly={resolvedReadOnly}
          ref={fieldHandle}
          required={resolvedRequired}
          size={resolvedSize}
          timeZone={resolvedTimeZone}
          variant={resolvedVariant}
          {...(firstDayOfWeek === undefined ? {} : { firstDayOfWeek })}
          {...(yearPivot === undefined ? {} : { yearPivot })}
          {...(singleValue === undefined ? {} : { value: singleValue })}
        />
      </div>
      {container === null ? surface : null}
    </>
  );

  const rootProps: DatePickerRootProps = {
    ...nativeProps,
    children,
    className,
    style,
    ...(resolvedDisabled === true ? { 'data-disabled': '' } : {}),
    ...(resolvedInvalid === true ? { 'data-invalid': '' } : {}),
    ...(resolvedReadOnly === true ? { 'data-readonly': '' } : {}),
    ...(resolvedRequired === true ? { 'data-required': '' } : {}),
    ...(isOpen ? { 'data-open': '' } : {}),
    'data-calendar': resolvedCalendar,
    'data-part': 'root',
    'data-size': resolvedSize,
    'data-ui': 'date-picker',
    'data-variant': resolvedVariant,
    ref: rootRef,
  };

  return (
    <>
      {render === undefined ? (
        <div {...(rootProps as DatePickerRootProps & { ref?: React.Ref<HTMLDivElement> })} />
      ) : (
        render(rootProps)
      )}
      {/* The layer is moved out of the flow, so nothing between the control
          and the page's root can clip it. */}
      {container === null ? null : createPortal(surface, container)}
    </>
  );
}
