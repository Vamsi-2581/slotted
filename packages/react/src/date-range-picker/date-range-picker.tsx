import '@slotted/styles/date-range-picker/date-range-picker.css';

import {
  blockedAround,
  compareDate,
  createDateFormat,
  isDateRefusedInRun,
  isSameDate,
  orderedRun,
  rangeLength,
  rangeProblems,
} from '@slotted/core/date';
import type { PlainDate } from '@slotted/core/date';
import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import { createPortalRoot } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Calendar, isSameValue } from '../calendar';
import type { CalendarHandle, CalendarValue, CalendarView, DateRange } from '../calendar';
import { DateField } from '../date-field';
import type { DateFieldHandle } from '../date-field';
import { useField } from '../field';
import { Glyph, Icon } from '../icon';
import { useDateRangePickerDefaults } from './date-range-picker-defaults';
import type {
  DateRangePickerPosition,
  DateRangePickerPresetProps,
  DateRangePickerPresetRootProps,
  DateRangePickerProps,
  DateRangePickerRootProps,
  DateRangePickerValueReason,
} from './date-range-picker.types';

/**
 * Below this width, on a finger, the surface is a sheet rather than a popover.
 * The number is here as well as in the stylesheet because the DOM has to say
 * which presentation it is in, and a media query cannot write an attribute.
 */
const SHEET_QUERY = '(max-width: 480px) and (pointer: coarse)';

/** How far `contiguous` looks for an unavailable day when no `maxLength` bounds it. */
const CONTIGUOUS_SEARCH = 366;

type PositionReason = 'pointer' | 'keyboard' | 'select' | 'clear' | 'programmatic';

interface PresetContextValue {
  readonly held: DateRange | null;
  choose(range: DateRange, event: MouseEvent<HTMLElement>): void;
}

const PresetContext = createContext<PresetContextValue | null>(null);

/** The one word for nothing: a value whose both ends are `null` is `null`. */
function normalize(range: DateRange | null): DateRange | null {
  return range === null || (range.start === null && range.end === null) ? null : range;
}

/**
 * Two date fields in one frame, a trigger, and `calendar` in range mode behind
 * them.
 *
 * **It composes the three and redraws none of them.** The two fields keep their
 * `data-ui` and so does the calendar; this family owns the frame, the trigger,
 * the layer, and the band that says what the reader has so far.
 *
 * **The band says how long the run is while it is being drawn.** The calendar
 * reports the pending end — the day under the pointer, or the focused day —
 * and `length` says "4 nights" for it, in a live region, so a reader hears it
 * on every arrow as much as they see it on every hover.
 *
 * **A press that leaves the run with one end is a draft, not the value.** The
 * second press emits the whole run; `Escape`, an outside press and the trigger
 * abandon the draft and the previous value stands.
 */
export function DateRangePicker({
  calendar,
  changeLabel,
  chooseLabel,
  className,
  clearable = false,
  clearLabel,
  closeOnSelect,
  contiguous = true,
  count,
  defaultOpen = false,
  defaultPosition = 'start',
  defaultValue,
  disabled,
  endLabel,
  endName,
  firstDayOfWeek,
  fixedWeeks = true,
  footer,
  invalid,
  isDateUnavailable,
  lengthLabel,
  limitLabel,
  locale,
  max,
  maxLength,
  min,
  minLength,
  months,
  onKeyDown,
  onOpenChange,
  onPositionChange,
  onValueChange,
  open,
  placement,
  position,
  presets,
  readOnly,
  ref,
  render,
  required,
  size,
  startLabel,
  startName,
  style,
  timeZone,
  value,
  variant,
  weekNumbers,
  yearPivot,
  ...nativeProps
}: DateRangePickerProps) {
  const field = useField();
  const defaults = useDateRangePickerDefaults();
  const rootRef = useRef<HTMLElement | null>(null);
  const startHandle = useRef<DateFieldHandle | null>(null);
  const endHandle = useRef<DateFieldHandle | null>(null);
  const calendarHandle = useRef<CalendarHandle | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentId = useId();

  const [layerNode, setLayerNode] = useState<HTMLElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState<PresenceStatus>('unmounted');
  const [positioned, setPositioned] = useState(false);
  const [sheet, setSheet] = useState(false);

  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const [ownValue, setOwnValue] = useState<DateRange | null>(normalize(defaultValue ?? null));
  const held = value === undefined ? ownValue : normalize(value);
  const [ownPosition, setOwnPosition] = useState<DateRangePickerPosition>(defaultPosition);
  const currentPosition = position ?? ownPosition;
  const [view, setView] = useState<CalendarView>('day');

  /**
   * The start the reader pressed in the grid while the run is still open. It
   * is not the value: a half-drawn run never reaches a form without the
   * reader having seen it in the field.
   */
  const [draft, setDraft] = useState<PlainDate | null>(null);
  /** The pending end the calendar reports, or `null` while no run is open. */
  const [preview, setPreview] = useState<PlainDate | null>(null);

  const resolvedLocale = locale ?? defaults.locale;
  const resolvedTimeZone = timeZone ?? defaults.timeZone;
  const resolvedCalendar = calendar ?? defaults.calendar;
  const resolvedSize = size ?? field?.size ?? defaults.size;
  const resolvedVariant = variant ?? defaults.variant;
  const resolvedPlacement = placement ?? defaults.placement;
  const resolvedCloseOnSelect = closeOnSelect ?? defaults.closeOnSelect;
  const resolvedCount = count ?? defaults.count;
  const resolvedMonths = months ?? defaults.months;
  const resolvedLengthLabel = lengthLabel ?? defaults.lengthLabel;
  const resolvedLimitLabel = limitLabel ?? defaults.limitLabel;
  const resolvedDisabled = disabled ?? field?.disabled;
  const resolvedReadOnly = readOnly ?? field?.readOnly;
  const resolvedRequired = required ?? field?.required;
  const editable = resolvedDisabled !== true && resolvedReadOnly !== true;

  const start = held?.start ?? null;
  const end = held?.end ?? null;
  const ordered = start !== null && end !== null && compareDate(start, end) <= 0;

  /**
   * Validity the family owns, beside the validity the consumer states: the
   * bounds, the predicate over every day of the run, the order of the two
   * ends and the length. A value that fails any of them is invalid whatever the
   * field around it says, because this control is the only thing that knows.
   */
  const problems = useMemo(
    () =>
      rangeProblems(held, {
        contiguous,
        count: resolvedCount,
        max,
        maxLength,
        min,
        minLength,
        unavailable: isDateUnavailable,
      }),
    [contiguous, held, isDateUnavailable, max, maxLength, min, minLength, resolvedCount],
  );
  const resolvedInvalid = invalid ?? (problems.length > 0 ? true : field?.invalid);

  const format = useMemo(() => createDateFormat({ locale: resolvedLocale }), [resolvedLocale]);
  /* The band writes each end short — "12 Sep" — because the whole date in
     words is the trigger's, and a band that repeats it twice runs past the
     panel at 240 pixels. */
  const short = useMemo(
    () =>
      new Intl.DateTimeFormat(resolvedLocale, { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    [resolvedLocale],
  );
  const writeShort = (date: PlainDate) =>
    short.format(Date.UTC(date.year, date.month - 1, date.day));

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
      /* Closed by anything, the draft is abandoned. */
      if (!next) setDraft(null);
    },
    [isOpen, onOpenChange, open],
  );

  const requestValue = useCallback(
    (next: DateRange | null, reason: DateRangePickerValueReason, source: unknown) => {
      const normalized = normalize(next);
      const state = createControllable<DateRange | null>({
        controlled: value === undefined ? undefined : held,
        initial: held,
        equals: (a, b) => isSameValue(a, b),
        onRequest: (request) => onValueChange?.(request.value, request),
      });
      if (state.request(normalized, reason, source)) setOwnValue(normalized);
    },
    [held, onValueChange, value],
  );

  const requestPosition = useCallback(
    (next: DateRangePickerPosition, reason: PositionReason, source: unknown) => {
      const state = createControllable<DateRangePickerPosition>({
        controlled: position,
        initial: currentPosition,
        onRequest: (request) => onPositionChange?.(request.value, request),
      });
      if (state.request(next, reason, source)) setOwnPosition(next);
    },
    [currentPosition, onPositionChange, position],
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
    /* The anchor is the frame, so the surface hangs from the box the reader sees. */
    const anchor =
      rootRef.current.querySelector<HTMLElement>('[data-part="control"]') ?? rootRef.current;
    const [side, align = 'center'] = resolvedPlacement.split('-') as [
      'top' | 'bottom',
      'start' | 'end' | undefined,
    ];
    const handle = createPositioner(anchor, layerNode, { align, side });
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
   * again closes the surface instead of dismissing and reopening it.
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
        /* The view first, the surface second: the layer asks in the capture
           phase, so the decision is taken here and the layer simply not asked. */
        if (request.reason === 'escape' && viewRef.current !== 'day') {
          setView(viewRef.current === 'year' ? 'month' : 'day');
          return;
        }
        setOpen(false, request.reason === 'escape' ? 'escape' : 'outsidePress', request.source);
        if (request.reason === 'escape') triggerRef.current?.focus({ preventScroll: true });
      },
    });
    return () => layer.destroy();
  }, [isOpen, layerNode, setOpen]);

  /**
   * Opened from the trigger, focus lands on the cell of the current end, or
   * on today when it is empty — the APG's rule for its "Choose Date" button.
   * Opened with the chord, focus stays in the field so typing keeps working.
   */
  const focusOnOpen = useRef(false);
  useEffect(() => {
    if (!isOpen || layerNode === null || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    const target = currentPosition === 'end' ? end : start;
    const handle = calendarHandle.current;
    if (handle === null) return;
    if (target !== null) handle.focusDate(target);
    handle.focus();
  }, [currentPosition, end, isOpen, layerNode, start]);

  const focusField = useCallback(
    (which: DateRangePickerPosition) =>
      (which === 'end' ? endHandle : startHandle).current?.focus(),
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      focus: (which?: DateRangePickerPosition) => focusField(which ?? currentPosition),
      open: () => setOpen(true, 'keyboard', undefined),
      close: () => setOpen(false, 'keyboard', undefined),
    }),
    [currentPosition, focusField, setOpen],
  );

  /**
   * What the calendar is shown. A pressed start replaces the value while the
   * run is open; with the end as the current position, the end is withheld so
   * the next press writes it instead of restarting the run — `nextValue` in
   * `calendar` restarts on a whole run, and that is its only rule.
   */
  const calendarValue: CalendarValue =
    draft !== null
      ? { start: draft, end: null }
      : currentPosition === 'end' && start !== null
        ? { start, end: null }
        : held;
  const openStart =
    calendarValue !== null && !Array.isArray(calendarValue) && 'start' in calendarValue
      ? calendarValue.end === null
        ? calendarValue.start
        : null
      : null;

  /**
   * The days the grid refuses while a start is chosen: beyond the first
   * unavailable one while the run must be contiguous, and outside the length
   * limits. The search for the block runs once per start, never per cell.
   */
  const blocked = useMemo(
    () =>
      openStart === null || !contiguous
        ? { before: null, after: null }
        : blockedAround(
            openStart,
            isDateUnavailable ?? (() => false),
            maxLength ?? CONTIGUOUS_SEARCH,
          ),
    [contiguous, isDateUnavailable, maxLength, openStart],
  );
  const gridUnavailable = useCallback(
    (date: PlainDate) =>
      openStart === null
        ? isDateUnavailable?.(date) === true
        : isDateRefusedInRun(
            openStart,
            date,
            {
              contiguous,
              count: resolvedCount,
              maxLength,
              minLength,
              unavailable: isDateUnavailable,
            },
            blocked,
          ),
    [blocked, contiguous, isDateUnavailable, maxLength, minLength, openStart, resolvedCount],
  );

  /** The run as it would close on the pending end, ordered the way the press will order it. */
  const pendingRun = openStart !== null && preview !== null ? orderedRun(openStart, preview) : null;
  const shownStart = pendingRun?.start ?? draft ?? start;
  const shownEnd = pendingRun?.end ?? (draft !== null ? null : end);
  const startPending = pendingRun !== null && !isSameDate(pendingRun.start, openStart);
  const endPending = pendingRun !== null && !startPending;

  const spokenLength =
    pendingRun !== null
      ? resolvedLengthLabel(
          rangeLength(pendingRun.start, pendingRun.end, resolvedCount),
          resolvedCount,
        )
      : ordered
        ? resolvedLengthLabel(rangeLength(start, end, resolvedCount), resolvedCount)
        : '';
  const limitText =
    minLength === undefined && maxLength === undefined
      ? null
      : resolvedLimitLabel(minLength, maxLength, resolvedCount);

  /** The trigger's accessible name: focus returns here when the surface closes. */
  const spoken = ordered
    ? `${changeLabel ?? defaults.changeLabel}, ${format.describe(start)} – ${format.describe(end)}, ${spokenLength}`
    : (chooseLabel ?? defaults.chooseLabel);

  const closeAfter = (whole: boolean, source: unknown) => {
    const closes =
      resolvedCloseOnSelect === 'always' || (resolvedCloseOnSelect === 'auto' && whole);
    if (!closes) return;
    setOpen(false, 'select', source);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const onCalendarValue = (next: CalendarValue, request: ChangeRequest<CalendarValue>) => {
    if (next === null || Array.isArray(next) || !('start' in next)) return;
    if (next.end === null) {
      /* The first press: a draft, and the next press writes the end. */
      setDraft(next.start);
      requestPosition('end', 'select', request.source);
      closeAfter(false, request.source);
      return;
    }
    setDraft(null);
    requestValue(next, 'select', request.source);
    requestPosition('start', 'select', request.source);
    closeAfter(true, request.source);
  };

  const choosePreset = (range: DateRange, event: MouseEvent<HTMLElement>) => {
    setDraft(null);
    requestValue(range, 'select', event);
    requestPosition('start', 'select', event);
    closeAfter(true, event);
  };

  /** Focus entering one end names it; a pointer press before it names the reason. */
  const pointerFocus = useRef(false);
  const onFieldFocus = (which: DateRangePickerPosition) => (event: FocusEvent<HTMLElement>) => {
    const reason = pointerFocus.current ? 'pointer' : 'keyboard';
    pointerFocus.current = false;
    if (which !== currentPosition) requestPosition(which, reason, event);
  };

  const onControlKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as never);
    if (event.defaultPrevented || !editable) return;
    /* ChromeOS turns the chord into PageDown before the browser sees it, which
       is why the trigger button is always drawn and this is only a shortcut. */
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true, 'keyboard', event);
    }
  };

  const presetContext: PresetContextValue = { held, choose: choosePreset };

  const surface: ReactNode = mounted ? (
    <div
      data-part="positioner"
      data-presentation={sheet ? 'sheet' : 'popover'}
      data-ui="date-range-picker"
      ref={setLayerNode}
      {...(isOpen ? { 'data-open': '' } : {})}
      {...(positioned ? { 'data-positioned': '' } : {})}
    >
      <div aria-label={spoken} data-part="content" id={contentId} role="dialog">
        <div data-part="head">
          <span
            data-part="head-start"
            {...(shownStart === null ? { 'data-placeholder': '' } : {})}
            {...(startPending ? { 'data-pending': '' } : {})}
          >
            {shownStart === null ? (startLabel ?? defaults.startLabel) : writeShort(shownStart)}
          </span>
          {' – '}
          <span
            data-part="head-end"
            {...(shownEnd === null ? { 'data-placeholder': '' } : {})}
            {...(endPending ? { 'data-pending': '' } : {})}
          >
            {shownEnd === null ? (endLabel ?? defaults.endLabel) : writeShort(shownEnd)}
          </span>
          <span
            aria-live="polite"
            data-part="length"
            {...(pendingRun === null ? {} : { 'data-pending': '' })}
          >
            {spokenLength}
          </span>
          {limitText === null ? null : <span data-part="limit">{limitText}</span>}
        </div>
        <div data-part="panels">
          {presets === undefined ? null : (
            <PresetContext.Provider value={presetContext}>
              <div data-part="presets">{presets}</div>
            </PresetContext.Provider>
          )}
          <Calendar
            fixedWeeks={fixedWeeks}
            isDateUnavailable={gridUnavailable}
            locale={resolvedLocale}
            max={max}
            min={min}
            months={resolvedMonths}
            onPreviewChange={setPreview}
            onValueChange={onCalendarValue}
            onViewChange={setView}
            readOnly={resolvedReadOnly}
            ref={calendarHandle}
            selectionMode="range"
            timeZone={resolvedTimeZone}
            value={calendarValue}
            view={view}
            weekNumbers={weekNumbers}
            {...(firstDayOfWeek === undefined ? {} : { firstDayOfWeek })}
          />
        </div>
        {footer === undefined ? null : <div data-part="footer">{footer}</div>}
      </div>
    </div>
  ) : null;

  /* Crossed bounds, while the order holds: the start cannot step past the end
     nor the end before the start. Reversed, each field keeps the outer bounds
     and the end field alone says the order is wrong. */
  const startMax = ordered ? (max === undefined || compareDate(end, max) < 0 ? end : max) : max;
  const endMin = ordered ? (min === undefined || compareDate(start, min) > 0 ? start : min) : min;

  const fieldProps = {
    calendar: resolvedCalendar,
    disabled: resolvedDisabled,
    isDateUnavailable,
    locale: resolvedLocale,
    readOnly: resolvedReadOnly,
    required: resolvedRequired,
    size: resolvedSize,
    timeZone: resolvedTimeZone,
    variant: 'plain' as const,
    ...(firstDayOfWeek === undefined ? {} : { firstDayOfWeek }),
    ...(yearPivot === undefined ? {} : { yearPivot }),
  };

  const children: ReactNode = (
    <>
      <div
        data-part="control"
        onKeyDown={onControlKeyDown}
        onPointerDownCapture={() => {
          pointerFocus.current = true;
        }}
      >
        <div
          data-part="start"
          onFocus={onFieldFocus('start')}
          {...(currentPosition === 'start' ? { 'data-current': '' } : {})}
        >
          <DateField
            {...fieldProps}
            aria-label={startLabel ?? defaults.startLabel}
            max={startMax}
            min={min}
            name={startName}
            onValueChange={(next, request) =>
              requestValue(
                { start: next, end },
                request.reason as DateRangePickerValueReason,
                request.source,
              )
            }
            ref={startHandle}
            value={start}
          />
        </div>
        <span aria-hidden="true" data-part="separator">
          –
        </span>
        <div
          data-part="end"
          onFocus={onFieldFocus('end')}
          {...(currentPosition === 'end' ? { 'data-current': '' } : {})}
        >
          <DateField
            {...fieldProps}
            aria-label={endLabel ?? defaults.endLabel}
            invalid={problems.includes('order') ? true : undefined}
            max={max}
            min={endMin}
            name={endName}
            onValueChange={(next, request) =>
              requestValue(
                { start, end: next },
                request.reason as DateRangePickerValueReason,
                request.source,
              )
            }
            ref={endHandle}
            value={end}
          />
        </div>
        {clearable && held !== null ? (
          <button
            aria-label={clearLabel ?? defaults.clearLabel}
            data-part="clear"
            disabled={!editable}
            onClick={(event) => {
              requestValue(null, 'clear', event);
              requestPosition('start', 'clear', event);
              focusField('start');
            }}
            type="button"
          >
            <Icon>
              <Glyph name="x" />
            </Icon>
          </button>
        ) : null}
        <button
          aria-controls={isOpen ? contentId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={spoken}
          data-part="trigger"
          disabled={!editable}
          onClick={(event) => {
            focusOnOpen.current = !isOpen;
            setOpen(!isOpen, 'pointer', event);
          }}
          ref={triggerRef}
          type="button"
        >
          <Icon>
            <Glyph name="calendar" />
          </Icon>
        </button>
      </div>
      {container === null ? surface : null}
    </>
  );

  const rootProps: DateRangePickerRootProps = {
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
    'data-count': resolvedCount,
    'data-part': 'root',
    'data-size': resolvedSize,
    'data-ui': 'date-range-picker',
    'data-variant': resolvedVariant,
    ref: rootRef,
  };

  return (
    <>
      {render === undefined ? (
        <div {...(rootProps as DateRangePickerRootProps & { ref?: React.Ref<HTMLDivElement> })} />
      ) : (
        render(rootProps)
      )}
      {container === null ? null : createPortal(surface, container)}
    </>
  );
}

/**
 * One shortcut. It writes its range with the `select` reason and carries
 * `data-selected` while the value equals it. The list is the product's — "last
 * 7 days" is a business calendar — and the family ships the button, not the
 * list.
 */
export function DateRangePickerPreset({
  children,
  onClick,
  ref,
  render,
  value,
  ...nativeProps
}: DateRangePickerPresetProps) {
  const context = useContext(PresetContext);
  const range = typeof value === 'function' ? value() : value;
  const selected = context !== null && isSameValue(context.held, range);

  const rootProps: DateRangePickerPresetRootProps = {
    ...nativeProps,
    children,
    'data-part': 'preset',
    ...(selected ? { 'data-selected': '' } : {}),
    onClick: (event: MouseEvent<HTMLElement>) => {
      onClick?.(event as MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      context?.choose(typeof value === 'function' ? value() : value, event);
    },
    ref: ref as React.Ref<HTMLElement>,
    type: 'button',
  };

  return render === undefined ? (
    <button
      {...(rootProps as DateRangePickerPresetRootProps & { ref?: React.Ref<HTMLButtonElement> })}
    />
  ) : (
    render(rootProps)
  );
}
