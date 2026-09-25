import '@slotted/styles/datetime-picker/datetime-picker.css';

import {
  createDateTimeFormat,
  dateBoundsOf,
  dayWindow,
  hourJump,
  isDateTimeInRange,
  isSameDate,
  isSameDateTime,
  isSameTime,
  isTruncated,
  nearestIndex,
  nowDateTimeIn,
  timeList,
  toISOTime,
} from '@slotted/core/date';
import type { PlainDate, PlainDateTime, PlainTime, TimeOption } from '@slotted/core/date';
import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import { createPortalRoot } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import { createTypeahead, isPrintable } from '@slotted/core/typeahead';
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

import { Calendar } from '../calendar';
import type { CalendarHandle, CalendarView } from '../calendar';
import { DateTimeField } from '../datetime-field';
import type { DateTimeFieldHandle } from '../datetime-field';
import { useField } from '../field';
import { Glyph, Icon } from '../icon';
import { useDateTimePickerDefaults } from './datetime-picker-defaults';
import type {
  DateTimePickerHighlight,
  DateTimePickerProps,
  DateTimePickerRootProps,
} from './datetime-picker.types';

/**
 * Below this width, on a finger, the surface is a sheet rather than a popover.
 * §2.7 of `docs/component-features.md` asks for it by name. The number is here
 * as well as in the stylesheet because the DOM has to say which presentation it
 * is in, and a media query cannot write an attribute.
 */
const SHEET_QUERY = '(max-width: 480px) and (pointer: coarse)';

/** What an empty panel steps from before the browser has said what time it is. */
const SSR_REFERENCE: PlainDateTime = {
  date: { year: 2000, month: 1, day: 1 },
  time: { hour: 12, minute: 0, second: 0 },
};

/**
 * A datetime field, a trigger, and the only panel in the library that holds two
 * surfaces.
 *
 * **Both surfaces are in the DOM at every width.** A `tablist` that exists on a
 * narrow container and not on a wide one tells assistive technology two
 * different stories about the same component, which is the arrangement Kendo
 * and MUI ship and this family declines. `openTo` decides where focus lands,
 * not what is drawn.
 *
 * **The decision this family owes, in one sentence:** the press that leaves the
 * value incomplete carries focus to the half that is missing, and the press
 * that completes the value closes the panel. That is what lets it need no
 * confirm button, where Ant adds `needConfirm` and Kendo adds Set.
 *
 * **The list answers the day the reader is on**, not a day already committed —
 * so arrowing across a closed Saturday empties the list and draws the empty
 * state while the reader is still deciding. Ant recomputes `disabledTime(date)`
 * only for a date already chosen and cannot say this.
 *
 * **Two pairs of bounds apply at once.** `min`/`max` bound the whole value and
 * `minTime`/`maxTime` bound every day inside the range, which MUI's own
 * validation page records that it cannot combine.
 */
export function DateTimePicker({
  calendar,
  changeLabel,
  chooseLabel,
  className,
  clearable = false,
  closeOnSelect,
  defaultHighlighted,
  defaultOpen = false,
  defaultValue,
  disabled,
  emptyLabel,
  firstDayOfWeek,
  footer,
  granularity,
  highlighted,
  hourCycle,
  invalid,
  isDateUnavailable,
  isTimeUnavailable,
  locale,
  max,
  maxOptions,
  maxTime,
  min,
  minTime,
  months,
  name,
  nowLabel,
  onHighlightedChange,
  onKeyDown,
  onOpenChange,
  onValueChange,
  open,
  openTo,
  options,
  placement,
  presets,
  readOnly,
  ref,
  referenceDateTime,
  relative,
  render,
  renderOption,
  required,
  size,
  step,
  style,
  timeZone,
  truncatedLabel,
  unavailableOptions,
  value,
  variant,
  weekNumbers,
  ...nativeProps
}: DateTimePickerProps) {
  const field = useField();
  const defaults = useDateTimePickerDefaults();
  const rootRef = useRef<HTMLElement | null>(null);
  const fieldHandle = useRef<DateTimeFieldHandle | null>(null);
  const calendarHandle = useRef<CalendarHandle | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const datePanelRef = useRef<HTMLDivElement | null>(null);
  const contentId = useId();
  const listLabelId = `${contentId}-time`;

  const [layerNode, setLayerNode] = useState<HTMLElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState<PresenceStatus>('unmounted');
  const [positioned, setPositioned] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [view, setView] = useState<CalendarView>('day');

  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const [ownValue, setOwnValue] = useState<PlainDateTime | null>(defaultValue ?? null);
  const held = value ?? ownValue;

  const resolvedLocale = locale ?? defaults.locale;
  const resolvedTimeZone = timeZone ?? defaults.timeZone;
  const resolvedGranularity = granularity ?? defaults.granularity;
  const resolvedHourCycle = hourCycle ?? defaults.hourCycle;
  const resolvedCalendar = calendar ?? defaults.calendar;
  const resolvedSize = size ?? field?.size ?? defaults.size;
  const resolvedVariant = variant ?? defaults.variant;
  const resolvedPlacement = placement ?? defaults.placement;
  const resolvedOpenTo = openTo ?? defaults.openTo;
  const resolvedCloseOnSelect = closeOnSelect ?? defaults.closeOnSelect;
  const resolvedStep = step ?? defaults.step;
  const resolvedMaxOptions = maxOptions ?? defaults.maxOptions;
  const resolvedUnavailable = unavailableOptions ?? defaults.unavailableOptions;
  const resolvedDisabled = disabled ?? field?.disabled;
  const resolvedReadOnly = readOnly ?? field?.readOnly;
  const resolvedRequired = required ?? field?.required;
  const editable = resolvedDisabled !== true && resolvedReadOnly !== true;

  const format = useMemo(
    () =>
      createDateTimeFormat({
        granularity: resolvedGranularity,
        hourCycle: resolvedHourCycle,
        locale: resolvedLocale,
        ...(firstDayOfWeek === undefined ? {} : { firstDayOfWeek }),
      }),
    [firstDayOfWeek, resolvedGranularity, resolvedHourCycle, resolvedLocale],
  );

  const [clock, setClock] = useState<PlainDateTime>(() => SSR_REFERENCE);
  useEffect(() => setClock(nowDateTimeIn(resolvedTimeZone)), [resolvedTimeZone]);
  const anchor = referenceDateTime ?? clock;

  const bounds = useMemo(() => ({ max, maxTime, min, minTime }), [max, maxTime, min, minTime]);

  /**
   * Validity the family owns, beside the validity the consumer states.
   *
   * Both pairs of bounds are asked, and the day-level predicate as well as the
   * time-level one: this control is the only thing that knows all four.
   */
  const heldWindow = held === null ? null : dayWindow(held.date, bounds);
  const outOfRange =
    held !== null &&
    (!isDateTimeInRange(held, min, max) ||
      heldWindow === null ||
      isDateUnavailable?.(held.date) === true ||
      isTimeUnavailable?.(held.time, held.date) === true);
  const resolvedInvalid = invalid ?? (outOfRange ? true : field?.invalid);

  /* ── Where the reader is ─────────────────────────────────────────────── */

  const [ownHighlight, setOwnHighlight] = useState<DateTimePickerHighlight>(
    () =>
      defaultHighlighted ?? {
        date: (defaultValue ?? referenceDateTime ?? SSR_REFERENCE).date,
        time: null,
      },
  );
  const highlight = highlighted ?? ownHighlight;

  /**
   * Whether the reader has moved the highlight themselves.
   *
   * Until they have, the day the panel is on follows the value and then the
   * reference — so a panel opened on an empty field opens on *this* month,
   * rather than on whatever the first paint held before the clock was read.
   * After they have moved it, it is theirs.
   */
  const movedByReader = useRef(false);

  /**
   * The day the list answers.
   *
   * The date half of the value when there is one, and the day the calendar has
   * focused when there is not — so a reader moving through the month sees the
   * times of the day under their cursor rather than the times of a day they
   * have not chosen.
   */
  const listDate = held?.date ?? highlight.date;

  const requestHighlight = useCallback(
    (
      next: DateTimePickerHighlight,
      reason: 'pointer' | 'keyboard' | 'programmatic',
      source: unknown,
    ) => {
      const state = createControllable<DateTimePickerHighlight>({
        controlled: highlighted,
        initial: highlight,
        equals: (a, b) => isSameDate(a.date, b.date) && isSameTime(a.time ?? null, b.time ?? null),
        onRequest: (request) => onHighlightedChange?.(request.value, request),
      });
      if (reason !== 'programmatic') movedByReader.current = true;
      if (state.request(next, reason, source)) setOwnHighlight(next);
    },
    [highlight, highlighted, onHighlightedChange],
  );

  /* The day the panel is on, before the reader has said otherwise. */
  useEffect(() => {
    if (movedByReader.current || highlighted !== undefined) return;
    const date = held?.date ?? anchor.date;
    if (isSameDate(date, highlight.date)) return;
    requestHighlight({ date, time: highlight.time }, 'programmatic', undefined);
  }, [anchor, held]);

  /* ── The list ────────────────────────────────────────────────────────── */

  /**
   * The window this day is open for, from both pairs of bounds at once. `null`
   * is a day the range refuses outright, and a day whose two bounds crossed.
   */
  const window = useMemo(() => dayWindow(listDate, bounds), [bounds, listDate]);

  const listOptions = useMemo(
    () => ({
      isTimeUnavailable:
        isTimeUnavailable === undefined
          ? undefined
          : (time: PlainTime) => isTimeUnavailable(time, listDate),
      max: window?.latest,
      maxOptions: resolvedMaxOptions,
      min: window?.earliest,
      options,
      step: resolvedStep,
    }),
    [isTimeUnavailable, listDate, options, resolvedMaxOptions, resolvedStep, window],
  );

  const list = useMemo<TimeOption[]>(() => {
    if (window === null || isDateUnavailable?.(listDate) === true) return [];
    const built = timeList(listOptions);
    return resolvedUnavailable === 'hide' ? built.filter((option) => !option.unavailable) : built;
  }, [isDateUnavailable, listDate, listOptions, resolvedUnavailable, window]);

  const truncated = useMemo(() => isTruncated(listOptions), [listOptions]);
  const labels = useMemo(
    () => list.map((option) => format.time.format(option.time)),
    [format, list],
  );

  /**
   * Where the list opens: on the chosen time, on the nearest step to the
   * reference when nothing is chosen, and on the first available option when
   * that is refused.
   */
  const openingIndex = useCallback(() => {
    if (list.length === 0) return -1;
    const wanted = held?.time ?? anchor.time;
    const near = nearestIndex(list, wanted);
    if (near >= 0 && list[near]?.unavailable !== true) return near;
    const first = list.findIndex((option) => !option.unavailable);
    return first >= 0 ? first : 0;
  }, [anchor, held, list]);

  const highlightIndex = useMemo(
    () =>
      highlight.time === null
        ? -1
        : list.findIndex((option) => isSameTime(option.time, highlight.time)),
    [highlight, list],
  );

  const moveHighlight = useCallback(
    (index: number, source: unknown) => {
      const option = list[Math.max(0, Math.min(list.length - 1, index))];
      if (option === undefined) return;
      requestHighlight({ date: listDate, time: option.time }, 'keyboard', source);
    },
    [list, listDate, requestHighlight],
  );

  /* ── State the surfaces share ────────────────────────────────────────── */

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
    (next: PlainDateTime | null, request: { reason: string; source?: unknown }) => {
      const state = createControllable<PlainDateTime | null>({
        controlled: value,
        initial: held,
        equals: isSameDateTime,
        onRequest: (asked) => onValueChange?.(asked.value, asked as never),
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
    if (typeof window === 'undefined' || typeof globalThis.matchMedia !== 'function') return;
    const query = globalThis.matchMedia(SHEET_QUERY);
    const read = () => setSheet(query.matches);
    read();
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);

  useEffect(() => {
    if (layerNode === null || rootRef.current === null || sheet) return;
    let live = true;

    const anchorElement =
      rootRef.current.querySelector<HTMLElement>('[data-part="control"]') ?? rootRef.current;
    const [side, align = 'center'] = resolvedPlacement.split('-') as [
      'top' | 'bottom',
      'start' | 'end' | undefined,
    ];

    const handle = createPositioner(anchorElement, layerNode, { align, side });
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
   * `Escape` is staged, and here it has three steps rather than two.
   *
   * `dismissable-layer` asks in the capture phase, so a handler inside the
   * surface would already have lost the panel by the time it ran — the decision
   * is taken here. The field takes the key first while an expression is open
   * (its own handler stops it before this ever runs); then the calendar's view
   * walks down from year or month; then the panel closes.
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

  /**
   * The highlight's **time** lands where the list opens.
   *
   * The date half is the effect above's: one of the two has to own it, or the
   * two write over each other in the same commit and the panel opens on
   * whichever ran last. The day is the value's or the reference's; the time is
   * the list's.
   */
  useEffect(() => {
    if (!isOpen) return;
    const index = openingIndex();
    const time = index < 0 ? null : (list[index]?.time ?? null);
    if (isSameTime(time, highlight.time ?? null)) return;
    requestHighlight({ date: highlight.date, time }, 'programmatic', undefined);
    /* Only when the surface opens or the list under it changes: a highlight the
       reader moved is theirs until one of those happens. */
  }, [isOpen, list]);

  /**
   * A highlight moved by a key lands whole rather than half under the edge —
   * and a panel that opens on a chosen time opens *at* it rather than at
   * midnight.
   *
   * It is a callback ref on the row that carries the highlight rather than an
   * effect over an index, because the element is what the scroll needs and the
   * element is the one thing an effect could not be sure of: closing and
   * reopening the panel inside the exit animation left the list ref pointing at
   * the panel on its way out, the reveal ran against nothing, and a panel
   * opened on 15:30 showed 00:00 to 03:30 — asking the reader to scroll six
   * hours to their own time. A ref fires on the element that actually mounted.
   *
   * The observer is the second half of the same problem: the list's height is
   * the panel's, the panel's is the layer's, and the layer has not been
   * measured on the frame it mounts, so the first call is made against a box
   * with nothing to scroll. A reader's own scrolling resizes nothing, so this
   * never fights them.
   *
   * `scrollIntoView` is called optionally because jsdom does not implement it,
   * and a test environment without a scroller is not a reason for the family to
   * throw where a browser would scroll.
   */
  const revealRow = useCallback((row: HTMLDivElement | null) => {
    if (row === null) return undefined;
    const reveal = () => row.scrollIntoView?.({ block: 'nearest' });
    reveal();
    if (typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(reveal);
    observer.observe(row.parentElement ?? row);
    return () => observer.disconnect();
  }, []);

  const typeahead = useRef(createTypeahead({ locale: () => resolvedLocale }));
  useEffect(() => {
    const handle = typeahead.current;
    return () => handle.destroy();
  }, []);

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
   * The trigger's accessible name. Focus returns here when the panel closes, so
   * this is where the reader is told what was chosen.
   */
  const spoken =
    held === null
      ? (chooseLabel ?? defaults.chooseLabel)
      : `${changeLabel ?? defaults.changeLabel}, ${format.describe(held)}`;

  /* ── Focus follows the missing half ──────────────────────────────────── */

  const focusOption = useCallback((index: number) => {
    listRef.current?.querySelectorAll<HTMLElement>('[data-part="option"]')[index]?.focus();
  }, []);

  const enterList = useCallback(
    (source: unknown) => {
      const index = highlightIndex >= 0 ? highlightIndex : openingIndex();
      if (index < 0) return;
      moveHighlight(index, source);
      /* The list is rendered by the time the layer is on screen; focus after
         the paint that mounted it. */
      requestAnimationFrame(() => focusOption(index));
    },
    [focusOption, highlightIndex, moveHighlight, openingIndex],
  );

  const enterCalendar = useCallback(() => {
    requestAnimationFrame(() => {
      const day = datePanelRef.current?.querySelector<HTMLElement>(
        '[data-part="day"][tabindex="0"]',
      );
      if (day !== null && day !== undefined) day.focus();
      else calendarHandle.current?.focus();
    });
  }, []);

  const enterSurface = useCallback(
    (surface: 'date' | 'time', source: unknown) => {
      if (surface === 'time') enterList(source);
      else enterCalendar();
    },
    [enterCalendar, enterList],
  );

  /**
   * The rule, in one place.
   *
   * A press that leaves the value incomplete carries focus to the half that is
   * missing; a press that completes it closes the panel; and a press on a value
   * that was already whole changes one half and leaves the panel where it is —
   * because a value that was already whole is not completed by anything, and a
   * reader who opened a filled field came to change something.
   */
  const afterPress = useCallback(
    (next: PlainDateTime | null, wasWhole: boolean, wrote: 'date' | 'time', source: unknown) => {
      const nowWhole = next !== null;
      if (nowWhole && !wasWhole && resolvedCloseOnSelect !== 'never') {
        setOpen(false, 'select', source);
        triggerRef.current?.focus({ preventScroll: true });
        return;
      }
      if (nowWhole && wasWhole && resolvedCloseOnSelect === 'always') {
        setOpen(false, 'select', source);
        triggerRef.current?.focus({ preventScroll: true });
        return;
      }
      if (!nowWhole) enterSurface(wrote === 'date' ? 'time' : 'date', source);
    },
    [enterSurface, resolvedCloseOnSelect, setOpen],
  );

  /**
   * A day pressed in the calendar.
   *
   * The time half is the one the value already holds, or `referenceDateTime`'s
   * — midnight is the platform's answer and it is wrong for every booking flow,
   * which is the conclusion Ant reached with `showTime.defaultOpenValue`.
   */
  const selectDate = useCallback(
    (date: PlainDate, source: unknown) => {
      if (!editable) return;
      const wasWhole = held !== null;
      const next: PlainDateTime = { date, time: held?.time ?? anchor.time };
      requestValue(next, { reason: 'select', source });
      requestHighlight({ date, time: highlight.time }, 'pointer', source);
      afterPress(next, wasWhole, 'date', source);
    },
    [afterPress, anchor, editable, held, highlight, requestHighlight, requestValue],
  );

  const selectTime = useCallback(
    (option: TimeOption, source: unknown) => {
      if (option.unavailable || !editable) return;
      const wasWhole = held !== null;
      const next: PlainDateTime = { date: listDate, time: option.time };
      requestValue(next, { reason: 'select', source });
      requestHighlight({ date: listDate, time: option.time }, 'pointer', source);
      afterPress(next, wasWhole, 'time', source);
    },
    [afterPress, editable, held, listDate, requestHighlight, requestValue],
  );

  /* ── Keyboard ────────────────────────────────────────────────────────── */

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event as never);
    if (event.defaultPrevented || !editable) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) setOpen(true, 'keyboard', event);
      enterSurface(resolvedOpenTo, event);
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event as never);
    if (event.defaultPrevented) return;

    const at = highlightIndex >= 0 ? highlightIndex : 0;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveHighlight(at + 1, event);
        focusOption(Math.min(list.length - 1, at + 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveHighlight(at - 1, event);
        focusOption(Math.max(0, at - 1));
        return;
      case 'Home':
        event.preventDefault();
        moveHighlight(0, event);
        focusOption(0);
        return;
      case 'End':
        event.preventDefault();
        moveHighlight(list.length - 1, event);
        focusOption(list.length - 1);
        return;
      case 'PageDown': {
        event.preventDefault();
        const next = hourJump(list, at, 1);
        moveHighlight(next, event);
        focusOption(next);
        return;
      }
      case 'PageUp': {
        event.preventDefault();
        const previous = hourJump(list, at, -1);
        moveHighlight(previous, event);
        focusOption(previous);
        return;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const option = list[at];
        if (option !== undefined) selectTime(option, event);
        return;
      }
      default:
        break;
    }

    /* Type-ahead, which the pattern recommends above seven options and this
       list passes at every step it offers. */
    if (isPrintable(event.key, typeahead.current.query.length > 0)) {
      const found = typeahead.current.match(event.key, labels, at);
      if (found < 0) return;
      event.preventDefault();
      moveHighlight(found, event);
      focusOption(found);
    }
  };

  /**
   * The chord both sibling pickers took, with the same recorded cost: ChromeOS
   * turns it into `PageDown` before the browser sees it, so the trigger is
   * always drawn and this is only a shortcut. Focus stays in the field, so
   * every key the segments had still works.
   */
  const onControlKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as never);
    if (event.defaultPrevented || !editable) return;
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true, 'keyboard', event);
    }
  };

  /* ── The panel ───────────────────────────────────────────────────────── */

  /** What the head says the reader has so far, with the missing half muted. */
  const headValue: ReactNode =
    held !== null ? (
      format.describe(held)
    ) : (
      <>
        {format.describeDate(highlight.date)}
        {', '}
        <span data-placeholder="">{placeholderTime(format.granularity)}</span>
      </>
    );

  const surface: ReactNode = mounted ? (
    <div
      data-part="positioner"
      data-presentation={sheet ? 'sheet' : 'popover'}
      data-ui="datetime-picker"
      ref={setLayerNode}
      {...(isOpen ? { 'data-open': '' } : {})}
      {...(positioned ? { 'data-positioned': '' } : {})}
    >
      <div
        aria-label={spoken}
        data-granularity={resolvedGranularity}
        data-open-to={resolvedOpenTo}
        data-part="content"
        id={contentId}
        role="dialog"
        {...(truncated ? { 'aria-description': truncatedLabel ?? defaults.truncatedLabel } : {})}
      >
        <div data-part="head">
          <span data-part="head-value">{headValue}</span>
          {presets === undefined ? null : <div data-part="presets">{presets}</div>}
          <button
            data-part="now"
            onClick={(event) => {
              const wasWhole = held !== null;
              requestValue(anchor, { reason: 'select', source: event });
              requestHighlight({ date: anchor.date, time: anchor.time }, 'pointer', event);
              afterPress(anchor, wasWhole, 'time', event);
            }}
            type="button"
          >
            <Icon size="sm">
              <Glyph name="clock" />
            </Icon>
            {nowLabel ?? defaults.nowLabel}
          </button>
        </div>

        <div data-part="panels">
          <div data-part="date-panel" ref={datePanelRef}>
            <Calendar
              focusedDate={highlight.date}
              isDateUnavailable={isDateUnavailable}
              locale={resolvedLocale}
              months={months}
              onFocusedDateChange={(date, request) =>
                requestHighlight(
                  { date, time: highlight.time },
                  request.reason === 'pointer' ? 'pointer' : 'keyboard',
                  request.source,
                )
              }
              onValueChange={(next, request) => {
                const date = Array.isArray(next) ? next[0] : next;
                if (date !== null && date !== undefined && !Array.isArray(date)) {
                  selectDate(date as PlainDate, request.source);
                }
              }}
              onViewChange={setView}
              readOnly={resolvedReadOnly}
              selectionMode="single"
              timeZone={resolvedTimeZone}
              value={held?.date ?? null}
              view={view}
              weekNumbers={weekNumbers}
              {...dateBoundsOf(bounds)}
              {...(firstDayOfWeek === undefined ? {} : { firstDayOfWeek })}
              ref={calendarHandle}
            />
          </div>

          <div data-part="time-panel">
            {list.length === 0 ? (
              <div data-part="empty">{emptyLabel ?? defaults.emptyLabel}</div>
            ) : (
              <div
                aria-label={format.describeDate(listDate, 'short')}
                data-part="list"
                id={listLabelId}
                onKeyDown={onListKeyDown}
                ref={listRef}
                role="listbox"
                {...(truncated ? { 'data-truncated': '' } : {})}
              >
                {list.map((option, index) => {
                  const label = labels[index] ?? '';
                  const selected =
                    held !== null &&
                    isSameDate(held.date, listDate) &&
                    isSameTime(option.time, held.time);
                  const current = index === highlightIndex;
                  return (
                    <div
                      aria-disabled={option.unavailable ? true : undefined}
                      aria-selected={selected}
                      data-part="option"
                      key={toISOTime(option.time)}
                      onClick={(event) => selectTime(option, event)}
                      ref={current ? revealRow : undefined}
                      role="option"
                      tabIndex={current ? 0 : -1}
                      {...(option.unavailable ? { 'data-disabled': '' } : {})}
                      {...(selected ? { 'data-selected': '' } : {})}
                      {...(current ? { 'data-current': '' } : {})}
                    >
                      {renderOption === undefined
                        ? label
                        : renderOption({
                            current,
                            date: listDate,
                            label,
                            selected,
                            time: option.time,
                            unavailable: option.unavailable,
                          })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {footer === undefined ? null : <div data-part="footer">{footer}</div>}
      </div>
    </div>
  ) : null;

  const children: ReactNode = (
    <>
      <div data-part="control" onKeyDown={onControlKeyDown}>
        <DateTimeField
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
              onClick={(event) => {
                setOpen(!isOpen, 'pointer', event);
                if (!isOpen) enterSurface(resolvedOpenTo, event);
              }}
              onKeyDown={onTriggerKeyDown}
              ref={triggerRef}
              type="button"
            >
              <Icon>
                <Glyph name="calendar" />
              </Icon>
            </button>
          }
          granularity={resolvedGranularity}
          invalid={resolvedInvalid}
          isDateUnavailable={isDateUnavailable}
          isTimeUnavailable={isTimeUnavailable}
          locale={resolvedLocale}
          max={max}
          maxTime={maxTime}
          min={min}
          minTime={minTime}
          name={name}
          onValueChange={(next, request) => requestValue(next, request)}
          readOnly={resolvedReadOnly}
          ref={fieldHandle}
          required={resolvedRequired}
          size={resolvedSize}
          timeZone={resolvedTimeZone}
          value={held}
          variant={resolvedVariant}
          {...(firstDayOfWeek === undefined ? {} : { firstDayOfWeek })}
          {...(resolvedHourCycle === undefined ? {} : { hourCycle: resolvedHourCycle })}
          {...(referenceDateTime === undefined ? {} : { referenceDateTime })}
          {...(relative === undefined ? {} : { relative })}
        />
      </div>
      {container === null ? surface : null}
    </>
  );

  const rootProps: DateTimePickerRootProps = {
    ...nativeProps,
    children,
    className,
    style,
    ...(resolvedDisabled === true ? { 'data-disabled': '' } : {}),
    ...(resolvedInvalid === true ? { 'data-invalid': '' } : {}),
    ...(resolvedReadOnly === true ? { 'data-readonly': '' } : {}),
    ...(resolvedRequired === true ? { 'data-required': '' } : {}),
    ...(isOpen ? { 'data-open': '' } : {}),
    'data-granularity': resolvedGranularity,
    'data-part': 'root',
    'data-size': resolvedSize,
    'data-ui': 'datetime-picker',
    'data-variant': resolvedVariant,
    ref: rootRef,
  };

  return (
    <>
      {render === undefined ? (
        <div {...(rootProps as DateTimePickerRootProps & { ref?: React.Ref<HTMLDivElement> })} />
      ) : (
        render(rootProps)
      )}
      {/* The layer is moved out of the flow, so nothing between the control and
          the page's root can clip it. */}
      {container === null ? null : createPortal(surface, container)}
    </>
  );
}

/**
 * The shape the missing time half is drawn as in the head.
 *
 * It is dashes rather than the locale's own `hh:mm`, because the head is a
 * sentence about the value and not a second field: the field below already says
 * the format, and repeating it here would read as a second control.
 */
function placeholderTime(granularity: 'hour' | 'minute' | 'second'): string {
  if (granularity === 'hour') return '--';
  return granularity === 'second' ? '--:--:--' : '--:--';
}
