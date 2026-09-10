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
import type { CalendarWeek, PlainDate } from '@slotted/core/date';
import { createControllable } from '@slotted/core/state';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import type { OnInit } from '@angular/core';

import {
  CALENDAR_NEXT_LABEL,
  CALENDAR_PREVIOUS_LABEL,
  injectCalendarDefaults,
} from './calendar-defaults';
import type {
  CalendarCalendar,
  CalendarOutsideDays,
  CalendarSelectionMode,
  CalendarValue,
  CalendarView,
} from './calendar-defaults';
import { isSameValue, isSelected, nextValue, rangeStateOf } from './calendar-selection';

/** How many years one page of the year view holds. */
const YEAR_PAGE = 12;
/** The heading needs an identifier every grid can point `aria-labelledby` at. */
let sequence = 0;

/**
 * A month grid, and the two pages above it.
 *
 * **It is a real `table` with the `grid` role on it.** The APG's own note is
 * why nothing here writes `row`, `columnheader` or `gridcell`: those are
 * implied by `tr`, `th` and `td`, and writing them again would duplicate
 * semantics the platform already gives.
 *
 * **The date the reader is on and the date the reader has chosen are two
 * values**, and each has a model of its own — a product that pages a calendar
 * from outside it has nowhere else to say so.
 *
 * **A date the predicate refuses stays reachable.** It carries `aria-disabled`
 * rather than being taken out of the grid, so a reader can arrow onto it, hear
 * why it is out, and arrow past it.
 */
@Component({
  selector: '[slCalendar]',
  standalone: true,
  exportAs: 'slCalendar',
  template: `<div data-part="header">
      <button
        data-part="previous"
        type="button"
        [attr.aria-label]="resolvedPreviousLabel()"
        [disabled]="!editable()"
        (click)="page(-1, $event)"
      ></button>
      <!--
        The heading is a live region: paging with a key changes nothing that
        focus lands on, so without this nothing announces the new month.
      -->
      <button
        data-part="heading"
        type="button"
        aria-live="polite"
        [attr.id]="headingId"
        [disabled]="!editable() || currentView() === 'year'"
        (click)="walkUp()"
      >
        {{ heading() }}
      </button>
      <button
        data-part="next"
        type="button"
        [attr.aria-label]="resolvedNextLabel()"
        [disabled]="!editable()"
        (click)="page(1, $event)"
      ></button>
    </div>

    @switch (currentView()) {
      @case ('day') {
        <div data-part="grids">
          @for (month of shownMonths(); track month.year * 12 + month.month) {
            <table data-part="grid" role="grid" [attr.aria-labelledby]="headingId">
              <caption data-part="grid-caption">
                {{
                  captionOf(month)
                }}
              </caption>
              <thead>
                <tr data-part="week-headers">
                  @if (resolvedWeekNumbers()) {
                    <th data-part="week-number" aria-hidden="true"></th>
                  }
                  @for (name of weekdayNarrow(); track $index) {
                    <th data-part="week-header" scope="col" [attr.abbr]="weekdayLong()[$index]">
                      {{ name }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (week of weeksOf(month); track week.weekNumber) {
                  <tr data-part="week">
                    @if (resolvedWeekNumbers()) {
                      <th data-part="week-number" scope="row">{{ week.weekNumber }}</th>
                    }
                    @for (
                      day of week.days;
                      track day.date.year * 400 + day.date.month * 32 + day.date.day
                    ) {
                      <td
                        data-part="cell"
                        [attr.data-outside-month]="day.outsideMonth ? '' : null"
                        [attr.data-unavailable]="unavailable(day.date) ? '' : null"
                        [attr.data-selected]="chosen(day.date) ? '' : null"
                        [attr.data-range-start]="rangeState(day.date) === 'start' ? '' : null"
                        [attr.data-range-end]="rangeState(day.date) === 'end' ? '' : null"
                        [attr.data-in-range]="rangeState(day.date) === 'inside' ? '' : null"
                      >
                        @if (!(day.outsideMonth && resolvedOutsideDays() === 'hidden')) {
                          <span
                            data-part="day"
                            role="button"
                            [attr.data-today]="isToday(day.date) ? '' : null"
                            [attr.aria-selected]="chosen(day.date) ? 'true' : null"
                            [attr.aria-disabled]="refused(day.date) ? 'true' : null"
                            [tabindex]="tabIndexOf(day.date)"
                            (click)="select(day.date, 'pointer', $event)"
                          >
                            {{ day.date.day }}
                          </span>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
      @case ('month') {
        <div data-part="months">
          @for (name of monthNames(); track $index) {
            <button
              data-part="period"
              type="button"
              [attr.data-selected]="focused().month === $index + 1 ? '' : null"
              [attr.aria-selected]="focused().month === $index + 1 ? 'true' : null"
              (click)="pickMonth($index + 1, $event)"
            >
              {{ name }}
            </button>
          }
        </div>
      }
      @default {
        <div data-part="years">
          @for (year of years(); track year) {
            <button
              data-part="period"
              type="button"
              [attr.data-selected]="focused().year === year ? '' : null"
              [attr.aria-selected]="focused().year === year ? 'true' : null"
              (click)="pickYear(year, $event)"
            >
              {{ year }}
            </button>
          }
        </div>
      }
    }`,
  styleUrl: '../../../styles/src/calendar/calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-ui': 'calendar',
    'data-part': 'root',
    '[attr.data-view]': 'currentView()',
    '[attr.data-calendar]': 'resolvedCalendar()',
    '[attr.data-months]': 'resolvedMonths() > 1 ? resolvedMonths() : null',
    '[attr.data-week-numbers]': "resolvedWeekNumbers() ? '' : null",
    '[attr.data-disabled]': "disabled() === true ? '' : null",
    '[attr.data-readonly]': "readOnly() === true ? '' : null",
    '[attr.data-invalid]': "invalid() === true ? '' : null",
    '(keydown)': 'onKeyDown($event)',
  },
})
export class SlCalendar implements OnInit {
  /** Present means the consumer owns the value. */
  readonly value = input<CalendarValue | undefined>(undefined);
  readonly defaultValue = input<CalendarValue | undefined>(undefined);
  /** The date the reader is on. Present means the consumer owns it. */
  readonly focusedDate = input<PlainDate | undefined>(undefined);
  readonly defaultFocusedDate = input<PlainDate | undefined>(undefined);

  readonly min = input<PlainDate | undefined>(undefined);
  readonly max = input<PlainDate | undefined>(undefined);
  readonly isDateUnavailable = input<((date: PlainDate) => boolean) | undefined>(undefined);

  readonly selectionMode = input<CalendarSelectionMode>('single');
  readonly months = input<number | undefined, unknown>(undefined, {
    transform: (value) =>
      value === undefined || value === null ? undefined : numberAttribute(value),
  });
  /** Present means the consumer owns which grid is showing. */
  readonly view = input<CalendarView | undefined>(undefined);
  readonly defaultView = input<CalendarView | undefined>(undefined);

  readonly weekNumbers = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  readonly fixedWeeks = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  readonly outsideDays = input<CalendarOutsideDays | undefined>(undefined);

  readonly locale = input<string | undefined>(undefined);
  readonly timeZone = input<string | undefined>(undefined);
  readonly firstDayOfWeek = input<number | undefined, unknown>(undefined, {
    transform: (value) =>
      value === undefined || value === null ? undefined : numberAttribute(value),
  });
  readonly calendar = input<CalendarCalendar | undefined>(undefined);

  readonly disabled = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  readonly readOnly = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  readonly invalid = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  readonly previousLabel = input<string | undefined>(undefined);
  readonly nextLabel = input<string | undefined>(undefined);

  readonly valueChange = output<ChangeRequest<CalendarValue>>();
  readonly focusedDateChange = output<ChangeRequest<PlainDate>>();
  readonly viewChange = output<CalendarView>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly defaults = injectCalendarDefaults();

  protected readonly headingId = `sl-calendar-${String((sequence += 1))}`;

  private readonly ownValue = signal<CalendarValue>(null);
  private readonly ownFocused = signal<PlainDate>(plainDate(2026, 1, 1));
  private readonly ownView = signal<CalendarView>('day');
  private readonly today = signal<PlainDate | null>(null);
  /** Focus is only moved into the DOM after a key, never on a render. */
  private restoreFocus = false;

  protected readonly held = computed(() => this.value() ?? this.ownValue());
  protected readonly focused = computed(() => this.focusedDate() ?? this.ownFocused());
  /** Which grid is showing. Public, so a template reaches it through `exportAs`. */
  readonly currentView = computed(() => this.view() ?? this.ownView());

  protected readonly resolvedMonths = computed(() =>
    Math.max(1, this.months() ?? this.defaults.months),
  );
  protected readonly resolvedWeekNumbers = computed(
    () => this.weekNumbers() ?? this.defaults.weekNumbers,
  );
  protected readonly resolvedFixedWeeks = computed(
    () => this.fixedWeeks() ?? this.defaults.fixedWeeks,
  );
  protected readonly resolvedOutsideDays = computed(
    () => this.outsideDays() ?? this.defaults.outsideDays,
  );
  protected readonly resolvedCalendar = computed(() => this.calendar() ?? this.defaults.calendar);
  protected readonly resolvedPreviousLabel = computed(
    () => this.previousLabel() ?? this.defaults.previousLabel ?? CALENDAR_PREVIOUS_LABEL,
  );
  protected readonly resolvedNextLabel = computed(
    () => this.nextLabel() ?? this.defaults.nextLabel ?? CALENDAR_NEXT_LABEL,
  );
  protected readonly editable = computed(
    () => this.disabled() !== true && this.readOnly() !== true,
  );

  protected readonly format = computed(() =>
    createDateFormat({
      locale: this.locale() ?? this.defaults.locale,
      firstDayOfWeek: this.firstDayOfWeek() ?? this.defaults.firstDayOfWeek,
    }),
  );

  protected readonly weekdayLong = computed(() => this.format().weekdayNames('long'));
  protected readonly weekdayNarrow = computed(() => this.format().weekdayNames('narrow'));
  protected readonly monthNames = computed(() => this.format().monthNames('short'));
  protected readonly years = computed(() => yearPage(this.focused().year, YEAR_PAGE));
  protected readonly shownMonths = computed(() =>
    visibleMonths(this.focused(), this.resolvedMonths()),
  );

  protected readonly heading = computed(() => {
    const focused = this.focused();
    const format = this.format();
    if (this.currentView() === 'year') {
      const page = this.years();
      return `${String(page[0] ?? focused.year)} – ${String(page.at(-1) ?? focused.year)}`;
    }
    if (this.currentView() === 'month') return String(focused.year);
    if (this.resolvedMonths() === 1) return format.monthYear(focused);
    const last = stepMonth(focused, this.resolvedMonths() - 1).date;
    return `${format.monthYear(focused, 'short')} – ${format.monthYear(last, 'short')}`;
  });

  ngOnInit() {
    this.ownValue.set(this.defaultValue() ?? null);
    this.ownView.set(this.defaultView() ?? 'day');
    this.today.set(todayIn(this.timeZone() ?? this.defaults.timeZone));
    this.ownFocused.set(this.startingDate());
  }

  /** Puts focus on the cell holding the roving tab stop. */
  focus() {
    this.element.querySelector<HTMLElement>('[data-part="day"][tabindex="0"]')?.focus();
  }

  /** Moves the reader to a date, paging the grid to reach it. */
  focusDate(date: PlainDate) {
    this.requestFocused(date, 'programmatic', undefined);
  }

  /** The date, the run or the set the calendar holds. */
  readonly selection = computed(() => this.held());

  protected captionOf(month: { year: number; month: number }) {
    return this.format().monthYear(plainDate(month.year, month.month, 1));
  }

  protected weeksOf(month: { year: number; month: number }): CalendarWeek[] {
    return monthGrid({
      ...month,
      firstDayOfWeek: this.format().firstDayOfWeek,
      fixedWeeks: this.resolvedFixedWeeks(),
    });
  }

  protected unavailable(date: PlainDate): boolean {
    if (!isDateInRange(date, this.min(), this.max())) return true;
    return this.isDateUnavailable()?.(date) === true;
  }

  /** Unavailable, or an outside day the axis says may not be chosen. */
  protected refused(date: PlainDate): boolean {
    if (this.unavailable(date)) return true;
    const shown = this.shownMonths()[0];
    const outside = shown !== undefined && (date.year !== shown.year || date.month !== shown.month);
    return outside && this.resolvedOutsideDays() === 'shown';
  }

  protected chosen(date: PlainDate): boolean {
    return isSelected(date, this.held());
  }

  protected rangeState(date: PlainDate) {
    return rangeStateOf(date, this.held());
  }

  protected isToday(date: PlainDate): boolean {
    const today = this.today();
    return today !== null && isSameDate(date, today);
  }

  protected tabIndexOf(date: PlainDate): number {
    return isSameDate(date, this.focused()) && this.editable() ? 0 : -1;
  }

  protected select(date: PlainDate, reason: ChangeReason, source: Event | undefined) {
    if (!this.editable() || this.unavailable(date)) return;
    this.requestValue(nextValue(date, this.held(), this.selectionMode()), reason, source);
    this.requestFocused(date, reason, source);
  }

  protected page(direction: 1 | -1, source: Event) {
    const focused = this.focused();
    if (this.currentView() === 'day') {
      this.requestFocused(
        stepMonth(focused, direction * this.resolvedMonths()).date,
        'pointer',
        source,
      );
      return;
    }
    const step = this.currentView() === 'month' ? direction : direction * YEAR_PAGE;
    this.requestFocused(stepYear(focused, step).date, 'pointer', source);
  }

  protected walkUp() {
    this.setView(this.currentView() === 'day' ? 'month' : 'year');
  }

  protected pickMonth(month: number, source: Event) {
    this.requestFocused({ ...this.focused(), month, day: 1 }, 'pointer', source);
    this.setView('day');
  }

  protected pickYear(year: number, source: Event) {
    this.requestFocused({ ...this.focused(), year, day: 1 }, 'pointer', source);
    this.setView('month');
  }

  protected onKeyDown(event: KeyboardEvent) {
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    const focused = this.focused();
    const first = this.format().firstDayOfWeek;

    /**
     * A key the grid acted on is the grid's, and nothing above it sees it.
     * An application that binds a bare key guards it with "is the target an
     * editable element", and a `td` is not one — so the arrows a reader walks
     * a month with would fire every shortcut on the page.
     */
    const consume = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    const move = (next: PlainDate) => {
      consume();
      this.requestFocused(next, 'keyboard', event);
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
        return move(startOfWeek(focused, first));
      case 'End':
        return move(endOfWeek(focused, first));
      case 'PageUp':
        return move(event.shiftKey ? stepYear(focused, -1).date : stepMonth(focused, -1).date);
      case 'PageDown':
        return move(event.shiftKey ? stepYear(focused, 1).date : stepMonth(focused, 1).date);
      case 'Enter':
      case ' ':
        consume();
        this.select(focused, 'keyboard', event);
        return;
      case 'Escape':
        /* The view closes before the surface does, which is the staging
           `dismissable-layer` asks a family to do: the key is simply not
           passed on, and no layer is asked to close. */
        /* In the day view the key is left alone, so a surface above the
           calendar may still close on it. */
        if (this.currentView() === 'day') return;
        consume();
        this.setView(this.currentView() === 'year' ? 'month' : 'day');
        return;
      default:
        return;
    }
  }

  /**
   * The first date the reader is put on: what a consumer said, then the value
   * it holds, then today. A calendar that opened on an arbitrary month would
   * make the reader page to now before doing anything at all.
   */
  private startingDate(): PlainDate {
    const stated = this.defaultFocusedDate() ?? this.focusedDate();
    if (stated !== undefined) return stated;
    const held = this.defaultValue() ?? this.value() ?? null;
    if (held !== null) {
      if (Array.isArray(held)) {
        const first = held[0];
        if (first !== undefined) return first;
      } else if ('start' in held) {
        if (held.start !== null) return held.start;
      } else {
        return held;
      }
    }
    return clampDate(this.today() ?? plainDate(2026, 1, 1), this.min(), this.max());
  }

  private setView(next: CalendarView) {
    if (this.view() === undefined) this.ownView.set(next);
    this.viewChange.emit(next);
  }

  private requestValue(next: CalendarValue, reason: ChangeReason, source: Event | undefined) {
    const state = createControllable<CalendarValue>({
      controlled: this.value(),
      initial: this.held(),
      equals: isSameValue,
      onRequest: (request) => this.valueChange.emit(request),
    });
    if (state.request(next, reason, source)) this.ownValue.set(next);
  }

  private requestFocused(next: PlainDate, reason: ChangeReason, source: Event | undefined) {
    const bounded = clampDate(next, this.min(), this.max());
    const state = createControllable<PlainDate>({
      controlled: this.focusedDate(),
      initial: this.focused(),
      equals: (a, b) => isSameDate(a, b),
      onRequest: (request) => this.focusedDateChange.emit(request),
    });
    this.restoreFocus = reason === 'keyboard';
    if (state.request(bounded, reason, source)) this.ownFocused.set(bounded);
    if (this.restoreFocus) queueMicrotask(() => this.focus());
    this.restoreFocus = false;
  }
}
