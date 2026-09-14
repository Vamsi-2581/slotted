import { InjectionToken, inject } from '@angular/core';
import type {
  TimelineConnector,
  TimelineGrowing,
  TimelineOrder,
  TimelinePlacement,
  TimelineSide,
  TimelineTimeFormat,
  TimestampValue,
} from '@slotted/core/timeline';

export type TimelineMode = 'list' | 'feed';
export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineVariant = 'solid' | 'outline' | 'subtle' | 'plain';
export type TimelineTone = 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
export type TimelineSize = 'sm' | 'md' | 'lg';
export type TimelineLevel = 2 | 3 | 4 | 5 | 6;
export type TimelineOpenReason = 'pointer' | 'keyboard' | 'programmatic';
export type TimelineLoadMoreReason = 'pointer' | 'keyboard' | 'scroll';
export type TimelineRevealReason = 'pointer' | 'keyboard';
export type {
  TimelineConnector,
  TimelineGrowing,
  TimelineOrder,
  TimelinePlacement,
  TimelineSide,
  TimelineTimeFormat,
  TimestampValue,
};

/** The wording the family speaks, so an application translates once. */
export interface TimelineMessages {
  loadMore: string;
  loading: string;
  freshItems: (count: number) => string;
  empty: string;
  current: string;
  expand: string;
  collapse: string;
}

export const TIMELINE_DEFAULT_MESSAGES: TimelineMessages = {
  collapse: 'Hide events',
  current: 'current',
  empty: 'No events yet',
  expand: 'Show events',
  freshItems: (count) => `${count} new events`,
  loadMore: 'Load more',
  loading: 'Loading more events',
};

export const TIMELINE_DEFAULT_MODE: TimelineMode = 'list';
export const TIMELINE_DEFAULT_ORIENTATION: TimelineOrientation = 'vertical';
export const TIMELINE_DEFAULT_PLACEMENT: TimelinePlacement = 'end';
export const TIMELINE_DEFAULT_ORDER: TimelineOrder = 'oldest-first';
export const TIMELINE_DEFAULT_VARIANT: TimelineVariant = 'outline';
export const TIMELINE_DEFAULT_TONE: TimelineTone = 'secondary';
export const TIMELINE_DEFAULT_SIZE: TimelineSize = 'md';
export const TIMELINE_DEFAULT_GROWING: TimelineGrowing = 'none';
export const TIMELINE_DEFAULT_TIME_FORMAT: TimelineTimeFormat = 'absolute';
export const TIMELINE_DEFAULT_LEVEL: TimelineLevel = 3;

export interface TimelineDefaults {
  mode?: TimelineMode;
  orientation?: TimelineOrientation;
  placement?: TimelinePlacement;
  order?: TimelineOrder;
  variant?: TimelineVariant;
  tone?: TimelineTone;
  size?: TimelineSize;
  growing?: TimelineGrowing;
  timeFormat?: TimelineTimeFormat;
  locale?: string;
  timeZone?: string;
  /** The moment relative readings count from, in epoch milliseconds. */
  now?: number;
  level?: TimelineLevel;
  messages?: Partial<TimelineMessages>;
}

export const TIMELINE_DEFAULTS_TOKEN = new InjectionToken<TimelineDefaults>(
  'slotted timeline defaults',
  { providedIn: 'root', factory: (): TimelineDefaults => ({}) },
);

/**
 * An application decides once which way its timelines run, which side the
 * events take, how a timestamp is written and in which zone, the moment a
 * relative reading counts from, and what the family says in the language it
 * ships. A timeline that states any of those itself still wins: an explicit
 * input is never overridden by the token.
 */
export function provideTimelineDefaults(defaults: TimelineDefaults) {
  return { provide: TIMELINE_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectTimelineDefaults(): TimelineDefaults {
  return inject(TIMELINE_DEFAULTS_TOKEN);
}
