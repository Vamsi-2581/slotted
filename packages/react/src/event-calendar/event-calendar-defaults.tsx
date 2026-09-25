import { createContext, useContext } from 'react';

import type {
  EventCalendarDefaults,
  EventCalendarDefaultsProviderProps,
  EventCalendarLabels,
} from './event-calendar.types';

const hours = (minutes: number) => Math.abs(minutes) / 60;

/**
 * Every word the family writes, in English. The only translation layer this
 * library has is the consumer's — a provider at the top of the application, or
 * a prop on the instance — so the words are data rather than strings built
 * inside the component.
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
  eventDetail: 'Event',
  dayEvents: (day) => `Events on ${day}`,
};

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

const EventCalendarDefaultsContext = createContext<EventCalendarDefaults>(EVENT_CALENDAR_FALLBACK);

/** What an event calendar renders as here, before it states anything of its own. */
export function useEventCalendarDefaults(): EventCalendarDefaults {
  return useContext(EventCalendarDefaultsContext);
}

/**
 * An application decides once which locale writes its days, which zone
 * answers "today", when its working day starts, how tall an hour is and what
 * every word says — rather than repeating the same props on every instance.
 * A nested provider changes what it names and inherits the rest; `labels`
 * merge word by word.
 */
export function EventCalendarDefaultsProvider({
  children,
  labels,
  ...defaults
}: EventCalendarDefaultsProviderProps) {
  const inherited = useEventCalendarDefaults();
  const merged = { ...inherited } as Record<string, unknown>;
  for (const [key, value] of Object.entries(defaults)) {
    if (value !== undefined) merged[key] = value;
  }
  merged['labels'] = { ...inherited.labels, ...labels };

  return (
    <EventCalendarDefaultsContext.Provider value={merged as unknown as EventCalendarDefaults}>
      {children}
    </EventCalendarDefaultsContext.Provider>
  );
}
