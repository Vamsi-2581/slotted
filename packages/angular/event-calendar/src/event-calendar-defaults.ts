import { inject, InjectionToken } from '@angular/core';
import type { PlainDate, PlainDateTime, PlainTime } from '@slotted/core/date';
import type {
  CalendarEvent,
  EventCalendarCalendar,
  EventCalendarListRange,
  EventCalendarView,
  EventCalendarWeekends,
  EventOccurrence,
  WorkingHours,
} from '@slotted/core/event-calendar';

export type {
  CalendarEvent,
  EventCalendarCalendar,
  EventCalendarListRange,
  EventCalendarView,
  EventCalendarWeekends,
  EventOccurrence,
  WorkingHours,
};

/**
 * What the reader chose to act on: a run of days, the last one inclusive, or a
 * stretch of one day's hours, the end exclusive — the two ends a calendar's
 * events already have.
 */
export type EventCalendarSelection =
  | { readonly start: PlainDate; readonly end: PlainDate }
  | { readonly start: PlainDateTime; readonly end: PlainDateTime };

export type EventCalendarSelectionMode = 'none' | 'range';
/** What happens to the month and the week below the compact size class. */
export type EventCalendarCompact = 'list' | 'keep';
export type EventCalendarHourCycle = 'h12' | 'h23';

/**
 * Where the reader asked an occurrence to go: dates with the last day
 * inclusive for an all-day event, date-times with the end exclusive for a
 * timed one — what the application writes back into the event. `occurrence`
 * is the date the occurrence stood on, which is what an application moving
 * one occurrence of a series writes as its `occurrence`.
 */
export type EventCalendarEventChange = {
  readonly key: string;
  readonly event: CalendarEvent;
  readonly occurrence: PlainDate;
  readonly recurring: boolean;
  readonly kind: 'move' | 'resize';
} & (
  | { readonly start: PlainDate; readonly end: PlainDate }
  | { readonly start: PlainDateTime; readonly end: PlainDateTime }
);

/** The period in view, emitted after it changes so an application can fetch it. */
export interface EventCalendarRange {
  readonly start: PlainDate;
  /** The last day drawn, inclusive. */
  readonly end: PlainDate;
  readonly view: EventCalendarView;
}

/** Every word the family writes. Replace any of them on the provider or the instance. */
export interface EventCalendarLabels {
  navigation: string;
  previous: Record<EventCalendarView, string>;
  next: Record<EventCalendarView, string>;
  today: string;
  views: string;
  view: Record<EventCalendarView, string>;
  calendars: string;
  allDay: string;
  timed: string;
  weekNumber: string;
  more: string;
  moreEvents: (count: number) => string;
  events: (count: number) => string;
  empty: Record<'week' | 'month' | 'day', string>;
  loading: string;
  continues: string;
  recurring: string;
  tentative: string;
  cancelled: string;
  from: (time: string) => string;
  until: (time: string) => string;
  offsetChange: (minutes: number, at: string) => string;
  offsetChangeShort: (minutes: number, at: string) => string;
  selected: (text: string) => string;
  /** Said when a key press finds no destination `canDrop` allows. */
  dropInvalid: (title: string) => string;
  eventDetail: string;
  dayEvents: (day: string) => string;
}

const hours = (minutes: number) => Math.abs(minutes) / 60;

/**
 * Every word the family writes, in English — the same words the React
 * binding writes, so an application translating both translates one list.
 */
export const EVENT_CALENDAR_LABELS: EventCalendarLabels = {
  navigation: 'Move the calendar',
  previous: {
    month: 'Previous month',
    week: 'Previous week',
    day: 'Previous day',
    list: 'Previous period',
  },
  next: { month: 'Next month', week: 'Next week', day: 'Next day', list: 'Next period' },
  today: 'Today',
  views: 'View',
  view: { month: 'Month', week: 'Week', day: 'Day', list: 'List' },
  calendars: 'Calendars',
  allDay: 'All day',
  timed: 'Timed events',
  weekNumber: 'Week',
  more: 'more',
  moreEvents: (count) => (count === 1 ? '1 more event' : `${count} more events`),
  events: (count) => (count === 0 ? 'no events' : count === 1 ? '1 event' : `${count} events`),
  empty: {
    week: 'No events this week.',
    month: 'No events this month.',
    day: 'No events this day.',
  },
  loading: 'Loading events',
  continues: 'continues',
  recurring: 'repeats',
  tentative: 'tentative',
  cancelled: 'cancelled',
  from: (time) => `from ${time}`,
  until: (time) => `until ${time}`,
  offsetChange: (minutes, at) =>
    `Clocks go ${minutes > 0 ? 'forward' : 'back'} ${hours(minutes)} ${hours(minutes) === 1 ? 'hour' : 'hours'} at ${at}`,
  offsetChangeShort: (minutes, at) => `${minutes > 0 ? '+' : '−'}${hours(minutes)} h at ${at}`,
  selected: (text) => `Selected ${text}`,
  dropInvalid: (title) => `${title} cannot move there`,
  eventDetail: 'Event',
  dayEvents: (day) => `Events on ${day}`,
};

/** What an application sets once for every event calendar under it. */
export interface EventCalendarDefaults {
  compact: EventCalendarCompact;
  dayHours: readonly [number, number];
  firstDayOfWeek: number | undefined;
  fixedWeeks: boolean;
  hourCycle: EventCalendarHourCycle | undefined;
  labels: EventCalendarLabels;
  listRange: EventCalendarListRange;
  loadingDelay: number;
  loadingMinDuration: number;
  locale: string | undefined;
  maxColumns: number;
  maxEvents: number;
  scrollTime: PlainTime;
  /** Minutes, 5 to 120: the lighter rules and the step of a selection or a drag. */
  slotDuration: number;
  timeZone: string | undefined;
  weekends: EventCalendarWeekends;
  weekNumbers: boolean;
}

export const EVENT_CALENDAR_FALLBACK: EventCalendarDefaults = {
  compact: 'list',
  dayHours: [0, 24],
  firstDayOfWeek: undefined,
  fixedWeeks: false,
  hourCycle: undefined,
  labels: EVENT_CALENDAR_LABELS,
  listRange: 'week',
  loadingDelay: 200,
  loadingMinDuration: 400,
  locale: undefined,
  maxColumns: 6,
  maxEvents: 3,
  scrollTime: { hour: 7, minute: 0, second: 0 },
  slotDuration: 30,
  timeZone: undefined,
  weekends: 'shown',
  weekNumbers: false,
};

export const EVENT_CALENDAR_DEFAULTS = new InjectionToken<EventCalendarDefaults>(
  'slotted event calendar defaults',
  { providedIn: 'root', factory: () => EVENT_CALENDAR_FALLBACK },
);

/**
 * An application decides once which locale writes its days, which zone
 * answers "today", when its working day starts, how tall an hour is and what
 * every word says. `labels` merge word by word over the English ones.
 */
export function provideEventCalendarDefaults(
  defaults: Partial<Omit<EventCalendarDefaults, 'labels'>> & {
    labels?: Partial<EventCalendarLabels>;
  },
) {
  return {
    provide: EVENT_CALENDAR_DEFAULTS,
    useFactory: (): EventCalendarDefaults => ({
      ...EVENT_CALENDAR_FALLBACK,
      ...defaults,
      labels: { ...EVENT_CALENDAR_LABELS, ...defaults.labels },
    }),
  };
}

export function injectEventCalendarDefaults(): EventCalendarDefaults {
  return inject(EVENT_CALENDAR_DEFAULTS);
}

/** What `ng-template[slEventCalendarEvent]` receives. */
export interface EventCalendarEventContext {
  readonly $implicit: EventOccurrence;
  readonly layout: 'lane' | 'bar' | 'block' | 'list';
  readonly date: PlainDate;
  /** The time the family would write, for a template that keeps it. */
  readonly time: string | null;
}

/** What `ng-template[slEventCalendarDetail]` receives. */
export interface EventCalendarDetailContext {
  readonly $implicit: EventOccurrence;
  /** Asks to close the detail, with the reason `programmatic`. */
  readonly close: () => void;
}

/**
 * What a secondary click, a long press or `Shift+F10` pointed at: an event,
 * or a stretch of the grid — the selection when the pointer was inside it,
 * otherwise one step of the hours or one day.
 */
export type EventCalendarContextTarget =
  | { readonly kind: 'event'; readonly occurrence: EventOccurrence }
  | { readonly kind: 'slot'; readonly slot: EventCalendarSelection };

/** What `ng-template[slEventCalendarContextMenu]` receives. */
export interface EventCalendarContextMenuContext {
  readonly $implicit: EventCalendarContextTarget;
}

/** What `ng-template[slEventCalendarDayContent]` receives. */
export interface EventCalendarDayContentContext {
  readonly $implicit: PlainDate;
  readonly view: EventCalendarView;
}
