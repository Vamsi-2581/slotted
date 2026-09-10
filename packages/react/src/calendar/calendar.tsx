import '@slotted/styles/calendar/calendar.css';

import {
  addDays,
  clampDate,
  createDateFormat,
  endOfWeek,
  isDateInRange,
  isSameDate,
  monthGrid,
  plainDate,
  startOfWeek,
  stepMonth,
  stepYear,
  todayIn,
  visibleMonths,
  yearPage,
} from '@slotted/core/date';
import type { PlainDate } from '@slotted/core/date';
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
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { useCalendarDefaults } from './calendar-defaults';
import { isSameValue, isSelected, nextValue, rangeStateOf } from './calendar-selection';
import type {
  CalendarProps,
  CalendarRootProps,
  CalendarValue,
  CalendarView,
} from './calendar.types';

/** The month and year views are drawn four across; a week is seven. */
const VIEW_COLUMNS: Record<CalendarView, number> = { day: 7, month: 4, year: 4 };
/** How many years one page of the year view holds. */
const YEAR_PAGE = 12;

/**
 * A month grid, and the two pages above it.
 *
 * **It is a real `table` with the `grid` role on it.** The APG's own note is
 * why nothing here writes `row`, `columnheader` or `gridcell`: those are
 * implied by `tr`, `th` and `td`, and writing them again would duplicate
 * semantics the platform already gives.
 *
 * **The date the reader is on and the date the reader has chosen are two
 * values.** Every surveyed implementation holds both; three of the seven let a
 * consumer own the second one, and so does this — `focusedDate` is a mutable
 * capability with a model of its own, because a product that pages a calendar
 * from outside it has nowhere else to say so.
 *
 * **A date the predicate refuses stays reachable.** It carries `aria-disabled`
 * rather than being taken out of the grid, so a reader can arrow onto it, hear
 * why it is out, and arrow past it.
 *
 * **Nothing is withdrawn when the box is narrow.** The cell is the room there
 * is divided by the columns there are, bounded by the control height above and
 * the WCAG minimum below, and a month that no longer fits beside another wraps
 * under it. A calendar with a day missing is not a calendar.
 */
export function Calendar({
  calendar,
  className,
  defaultFocusedDate,
  defaultValue,
  defaultView,
  disabled,
  firstDayOfWeek,
  fixedWeeks,
  focusedDate,
  invalid,
  isDateUnavailable,
  locale,
  max,
  min,
  months,
  nextLabel,
  onFocusedDateChange,
  onKeyDown,
  onValueChange,
  onViewChange,
  outsideDays,
  previousLabel,
  readOnly,
  ref,
  render,
  selectionMode = 'single',
  style,
  timeZone,
  value,
  view,
  weekNumbers,
  ...nativeProps
}: CalendarProps) {
  const defaults = useCalendarDefaults();
  const rootRef = useRef<HTMLElement | null>(null);
  const headingId = useId();

  const resolvedLocale = locale ?? defaults.locale;
  const resolvedFirstDay = firstDayOfWeek ?? defaults.firstDayOfWeek;
  const resolvedTimeZone = timeZone ?? defaults.timeZone;
  const resolvedMonths = Math.max(1, months ?? defaults.months);
  const resolvedWeekNumbers = weekNumbers ?? defaults.weekNumbers;
  const resolvedFixedWeeks = fixedWeeks ?? defaults.fixedWeeks;
  const resolvedOutsideDays = outsideDays ?? defaults.outsideDays;
  const resolvedCalendar = calendar ?? defaults.calendar;
  const resolvedPrevious = previousLabel ?? defaults.previousLabel;
  const resolvedNext = nextLabel ?? defaults.nextLabel;
  const editable = disabled !== true && readOnly !== true;

  const format = useMemo(
    () => createDateFormat({ locale: resolvedLocale, firstDayOfWeek: resolvedFirstDay }),
    [resolvedFirstDay, resolvedLocale],
  );

  /**
   * Which day it is, resolved after the first paint rather than during it. A
   * server and a browser in different zones disagree about today, and a value
   * read during render would hydrate to different markup on the two sides.
   */
  const [today, setToday] = useState<PlainDate | null>(null);
  useEffect(() => setToday(todayIn(resolvedTimeZone)), [resolvedTimeZone]);

  const [ownValue, setOwnValue] = useState<CalendarValue>(defaultValue ?? null);
  const held = value ?? ownValue;

  const anchor =
    defaultFocusedDate ??
    (defaultValue !== undefined && defaultValue !== null && !Array.isArray(defaultValue)
      ? 'start' in defaultValue
        ? (defaultValue.start ?? plainDate(2026, 1, 1))
        : defaultValue
      : plainDate(2026, 1, 1));

  const [ownFocused, setOwnFocused] = useState<PlainDate>(anchor);
  const focused = focusedDate ?? ownFocused;
  /** The focus is only moved into the DOM after a key, never on a render. */
  const shouldRestoreFocus = useRef(false);

  const [ownView, setOwnView] = useState<CalendarView>(defaultView ?? 'day');
  const currentView = view ?? ownView;

  /* The reader's first calendar opens on today rather than on an arbitrary
     month, and only while nobody has said otherwise. */
  useEffect(() => {
    if (today === null || defaultFocusedDate !== undefined || focusedDate !== undefined) return;
    setOwnFocused((previous) =>
      isSameDate(previous, anchor) ? clampDate(today, min, max) : previous,
    );
    /* Only on the first resolution of today: the anchor and the bounds are
       read once, and a later change to either is the consumer's to apply. */
  }, [today]);

  const requestValue = useCallback(
    (next: CalendarValue, reason: 'pointer' | 'keyboard' | 'clear', source: unknown) => {
      const state = createControllable<CalendarValue>({
        controlled: value,
        initial: held,
        equals: isSameValue,
        onRequest: (request) => onValueChange?.(request.value, request),
      });
      if (state.request(next, reason, source)) setOwnValue(next);
    },
    [held, onValueChange, value],
  );

  const requestFocused = useCallback(
    (next: PlainDate, reason: 'pointer' | 'keyboard', source: unknown) => {
      const bounded = clampDate(next, min, max);
      const state = createControllable<PlainDate>({
        controlled: focusedDate,
        initial: focused,
        equals: (a, b) => isSameDate(a, b),
        onRequest: (request) => onFocusedDateChange?.(request.value, request),
      });
      shouldRestoreFocus.current = reason === 'keyboard';
      if (state.request(bounded, reason, source)) setOwnFocused(bounded);
    },
    [focused, focusedDate, max, min, onFocusedDateChange],
  );

  const changeView = useCallback(
    (next: CalendarView) => {
      if (view === undefined) setOwnView(next);
      onViewChange?.(next);
    },
    [onViewChange, view],
  );

  /**
   * The cell holding the roving tab stop takes focus back after a key moved
   * it, and only then: a calendar that focused itself on every render would
   * steal the reader's place on the page.
   */
  useEffect(() => {
    if (!shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    rootRef.current?.querySelector<HTMLElement>('[data-part="day"][tabindex="0"]')?.focus();
  });

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        rootRef.current?.querySelector<HTMLElement>('[data-part="day"][tabindex="0"]')?.focus();
      },
      focusDate: (date: PlainDate) => requestFocused(date, 'keyboard', undefined),
    }),
    [requestFocused],
  );

  const unavailable = useCallback(
    (date: PlainDate) => !isDateInRange(date, min, max) || isDateUnavailable?.(date) === true,
    [isDateUnavailable, max, min],
  );

  const select = (date: PlainDate, reason: 'pointer' | 'keyboard', source: unknown) => {
    if (!editable || unavailable(date)) return;
    requestValue(nextValue(date, held, selectionMode), reason, source);
    requestFocused(date, reason, source);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    /* The reader's own handler first, and it always runs. */
    onKeyDown?.(event as never);
    if (event.defaultPrevented) return;

    const rtl = rootRef.current !== null && getComputedStyle(rootRef.current).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';

    const move = (next: PlainDate) => {
      event.preventDefault();
      requestFocused(next, 'keyboard', event);
    };

    switch (event.key) {
      case forward:
        return move(addDays(focused, 1));
      case backward:
        return move(addDays(focused, -1));
      case 'ArrowUp':
        return move(addDays(focused, -7));
      case 'ArrowDown':
        return move(addDays(focused, 7));
      case 'Home':
        return move(startOfWeek(focused, format.firstDayOfWeek));
      case 'End':
        return move(endOfWeek(focused, format.firstDayOfWeek));
      case 'PageUp':
        return move(event.shiftKey ? stepYear(focused, -1).date : stepMonth(focused, -1).date);
      case 'PageDown':
        return move(event.shiftKey ? stepYear(focused, 1).date : stepMonth(focused, 1).date);
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(focused, 'keyboard', event);
        return;
      case 'Escape':
        /* The view closes before the surface does, which is the staging
           `dismissable-layer` asks a family to do: the key is simply not
           passed on, and no layer is asked to close. */
        if (currentView === 'day') return;
        event.preventDefault();
        changeView(currentView === 'year' ? 'month' : 'day');
        return;
      default:
        return;
    }
  };

  const page = (direction: 1 | -1) => (event: MouseEvent<HTMLButtonElement>) => {
    if (currentView === 'day') {
      requestFocused(stepMonth(focused, direction * resolvedMonths).date, 'pointer', event);
      return;
    }
    requestFocused(
      currentView === 'month'
        ? stepYear(focused, direction).date
        : stepYear(focused, direction * YEAR_PAGE).date,
      'pointer',
      event,
    );
  };

  const heading =
    currentView === 'day'
      ? resolvedMonths === 1
        ? format.monthYear(focused)
        : `${format.monthYear(focused, 'short')} – ${format.monthYear(stepMonth(focused, resolvedMonths - 1).date, 'short')}`
      : currentView === 'month'
        ? String(focused.year)
        : `${String(yearPage(focused.year, YEAR_PAGE)[0] ?? focused.year)} – ${String(yearPage(focused.year, YEAR_PAGE).at(-1) ?? focused.year)}`;

  const grids: ReactNode =
    currentView === 'day' ? (
      <div data-part="grids">
        {visibleMonths(focused, resolvedMonths).map((month) => (
          <MonthTable
            editable={editable}
            firstDayOfWeek={format.firstDayOfWeek}
            fixedWeeks={resolvedFixedWeeks}
            focused={focused}
            format={format}
            headingId={headingId}
            key={`${String(month.year)}-${String(month.month)}`}
            month={month}
            onSelect={select}
            outsideDays={resolvedOutsideDays}
            today={today}
            unavailable={unavailable}
            value={held}
            weekNumbers={resolvedWeekNumbers}
          />
        ))}
      </div>
    ) : currentView === 'month' ? (
      <div data-part="months">
        {format.monthNames('short').map((name, index) => (
          <button
            data-part="period"
            key={name}
            onClick={(event) => {
              requestFocused({ ...focused, month: index + 1, day: 1 }, 'pointer', event);
              changeView('day');
            }}
            type="button"
            {...(focused.month === index + 1 ? { 'aria-selected': true, 'data-selected': '' } : {})}
          >
            {name}
          </button>
        ))}
      </div>
    ) : (
      <div data-part="years">
        {yearPage(focused.year, YEAR_PAGE).map((year) => (
          <button
            data-part="period"
            key={year}
            onClick={(event) => {
              requestFocused({ ...focused, year, day: 1 }, 'pointer', event);
              changeView('month');
            }}
            type="button"
            {...(focused.year === year ? { 'aria-selected': true, 'data-selected': '' } : {})}
          >
            {year}
          </button>
        ))}
      </div>
    );

  const children: ReactNode = (
    <>
      <div data-part="header">
        <button
          aria-label={resolvedPrevious}
          data-part="previous"
          disabled={!editable}
          onClick={page(-1)}
          type="button"
        />
        {/* The heading is a live region: paging with a key changes nothing
            focus lands on, so without this nothing announces the new month. */}
        <button
          aria-live="polite"
          data-part="heading"
          disabled={!editable || currentView === 'year'}
          id={headingId}
          onClick={() => changeView(currentView === 'day' ? 'month' : 'year')}
          type="button"
        >
          {heading}
        </button>
        <button
          aria-label={resolvedNext}
          data-part="next"
          disabled={!editable}
          onClick={page(1)}
          type="button"
        />
      </div>
      {grids}
    </>
  );

  const rootProps: CalendarRootProps = {
    ...nativeProps,
    children,
    className,
    onKeyDown: onGridKeyDown,
    style,
    ...(disabled === true ? { 'data-disabled': '' } : {}),
    ...(invalid === true ? { 'data-invalid': '' } : {}),
    ...(readOnly === true ? { 'data-readonly': '' } : {}),
    ...(resolvedWeekNumbers ? { 'data-week-numbers': '' } : {}),
    ...(resolvedMonths > 1 ? { 'data-months': String(resolvedMonths) } : {}),
    'data-calendar': resolvedCalendar,
    'data-columns': String(VIEW_COLUMNS[currentView]),
    'data-part': 'root',
    'data-ui': 'calendar',
    'data-view': currentView,
    ref: rootRef,
  } as CalendarRootProps;

  return render === undefined ? (
    <div {...(rootProps as CalendarRootProps & { ref?: React.Ref<HTMLDivElement> })} />
  ) : (
    render(rootProps)
  );
}

/** One month, as the `table` the grid role belongs on. */
function MonthTable({
  editable,
  firstDayOfWeek,
  fixedWeeks,
  focused,
  format,
  headingId,
  month,
  onSelect,
  outsideDays,
  today,
  unavailable,
  value,
  weekNumbers,
}: {
  editable: boolean;
  firstDayOfWeek: number;
  fixedWeeks: boolean;
  focused: PlainDate;
  format: ReturnType<typeof createDateFormat>;
  headingId: string;
  month: { year: number; month: number };
  onSelect: (date: PlainDate, reason: 'pointer' | 'keyboard', source: unknown) => void;
  outsideDays: 'shown' | 'selectable' | 'hidden';
  today: PlainDate | null;
  unavailable: (date: PlainDate) => boolean;
  value: CalendarValue;
  weekNumbers: boolean;
}) {
  const weeks = monthGrid({ ...month, firstDayOfWeek, fixedWeeks });
  const caption = format.monthYear(plainDate(month.year, month.month, 1));
  const long = format.weekdayNames('long');
  const narrow = format.weekdayNames('narrow');

  return (
    <table aria-labelledby={headingId} data-part="grid" role="grid">
      <caption data-part="grid-caption">{caption}</caption>
      <thead>
        <tr data-part="week-headers">
          {weekNumbers ? <th aria-hidden="true" data-part="week-number" /> : null}
          {narrow.map((name, index) => (
            /* Two characters is what a column holds and is not a weekday; the
               full name reaches assistive technology through `abbr`, which is
               the APG's own answer. */
            <th abbr={long[index]} data-part="week-header" key={long[index]} scope="col">
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr data-part="week" key={week.weekNumber}>
            {weekNumbers ? (
              <th data-part="week-number" scope="row">
                {week.weekNumber}
              </th>
            ) : null}
            {week.days.map((day) => {
              const outside = day.outsideMonth;
              const hidden = outside && outsideDays === 'hidden';
              const refused = unavailable(day.date) || (outside && outsideDays === 'shown');
              const chosen = isSelected(day.date, value);
              const run = rangeStateOf(day.date, value);
              const roving = isSameDate(day.date, focused);

              return (
                <td
                  data-part="cell"
                  key={`${String(day.date.month)}-${String(day.date.day)}`}
                  {...(outside ? { 'data-outside-month': '' } : {})}
                  {...(unavailable(day.date) ? { 'data-unavailable': '' } : {})}
                  {...(chosen ? { 'data-selected': '' } : {})}
                  {...(run === 'start' ? { 'data-range-start': '' } : {})}
                  {...(run === 'end' ? { 'data-range-end': '' } : {})}
                  {...(run === 'inside' ? { 'data-in-range': '' } : {})}
                >
                  {hidden ? null : (
                    <span
                      aria-disabled={refused ? true : undefined}
                      aria-selected={chosen ? true : undefined}
                      data-part="day"
                      {...(today !== null && isSameDate(day.date, today)
                        ? { 'data-today': '' }
                        : {})}
                      onClick={(event) => {
                        if (!refused) onSelect(day.date, 'pointer', event);
                      }}
                      role="button"
                      tabIndex={roving && editable ? 0 : -1}
                    >
                      {day.date.day}
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
