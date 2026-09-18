import { inject, Injectable, InjectionToken } from '@angular/core';
import type { TimestampValue } from '@slotted/core/timeline';

/** The popover's step and the page's. */
export type NotificationCenterSize = 'sm' | 'md';

/** The rank of the header's heading; group labels take the rank below. */
export type NotificationCenterLevel = '2' | '3' | '4';

/** How more is loaded: never, on a button, or when the end scrolls into view. */
export type NotificationCenterGrowing = 'none' | 'button' | 'scroll';

/** Whether keys that arrive while the reader reads are held behind `fresh`. */
export type NotificationCenterArrivals = 'hold' | 'show';

/** How the item's time is written. */
export type NotificationCenterTimeFormat = 'relative' | 'absolute';

/** Which of the family's two item controls are drawn. */
export type NotificationCenterControls = 'both' | 'read' | 'dismiss' | 'none';

/** The item's tone: the family's visual and the wash an unread item stands on. */
export type NotificationCenterTone = 'accent' | 'secondary' | 'success' | 'warning' | 'danger';

/** Why the view moved. */
export type NotificationCenterViewReason = 'pointer' | 'keyboard' | 'programmatic';

/** Why an item was pressed, marked or removed. */
export type NotificationCenterPressReason = 'pointer' | 'keyboard';

/** Why a read change was asked for: the two presses, or the instance. */
export type NotificationCenterReadReason = NotificationCenterPressReason | 'programmatic';

/** Why more was asked for: the two presses, or the end scrolling into view. */
export type NotificationCenterLoadReason = NotificationCenterPressReason | 'scroll';

/** A request the family makes that carries no value of its own: a reason, the event, a refusal. */
export interface NotificationCenterRequest<Reason extends string> {
  readonly reason: Reason;
  readonly event?: Event | undefined;
  readonly cancelled: boolean;
  /** Refuses the request. The family does nothing further with it. */
  cancel(): void;
}

/** What `readRequest` asks: these keys become this. */
export interface NotificationCenterReadRequest extends NotificationCenterRequest<NotificationCenterReadReason> {
  readonly keys: readonly string[];
  readonly read: boolean;
}

/** What `removeRequest` and `openRequest` name. */
export interface NotificationCenterItemRequest extends NotificationCenterRequest<NotificationCenterPressReason> {
  readonly key: string;
}

/** What `revealRequest` carries: how many were held. */
export interface NotificationCenterRevealRequest extends NotificationCenterRequest<NotificationCenterReadReason> {
  readonly count: number;
}

/** One notification as the consumer's store holds it. */
export interface NotificationItem {
  /** Identifies the item across renders; what every request names. */
  key: string;
  /** The words that name it: a link when `href`, text otherwise. */
  title: string;
  /** The body, clamped at three lines by the stylesheet. */
  description?: string | undefined;
  /** When it happened: a plain date-time or an ISO instant. */
  time: TimestampValue;
  /** Whether the reader has seen it. The consumer's fact; the family asks to change it. */
  read: boolean;
  /** Where the title goes. */
  href?: string | undefined;
  /** The visual's glyph and the unread wash. Accent when unstated. */
  tone?: NotificationCenterTone | undefined;
  /** Whatever the consumer's templates need: an avatar's initials, a record. */
  data?: unknown;
}

/** One entry of the views strip. */
export interface NotificationView {
  value: string;
  label: string;
  /** A count drawn as a chip after the label. */
  count?: number | undefined;
}

/** What the family says on the reader's behalf. */
export interface NotificationCenterMessages {
  /** The header's heading, and the root's name when the consumer gives none. */
  title: string;
  /** The mark-all control. */
  markAll: string;
  /** The read-toggle's name while the item is unread. */
  markRead: string;
  /** The read-toggle's name while the item is read. */
  markUnread: string;
  /** The dismiss control's name. */
  dismiss: string;
  /** The fresh control, and the announcement of held arrivals. */
  fresh: (count: number) => string;
  /** The announcement of the unread count. */
  unread: (count: number) => string;
  /** The more button. */
  loadMore: string;
  /** The waiting row under growing. */
  loading: string;
  /** The empty page under any view but unread. */
  empty: string;
  /** The empty page under the unread view. */
  caughtUp: string;
  /** The built-in `all` view's label. */
  all: string;
  /** The built-in `unread` view's label. */
  unreadView: string;
  /** The views strip's accessible name. */
  views: string;
}

/** What an application sets once for every centre under it. */
export interface NotificationCenterDefaults {
  arrivals: NotificationCenterArrivals;
  controls: NotificationCenterControls;
  growing: NotificationCenterGrowing;
  level: NotificationCenterLevel;
  locale?: string | undefined;
  messages: NotificationCenterMessages;
  size: NotificationCenterSize;
  timeFormat: NotificationCenterTimeFormat;
  timeZone?: string | undefined;
}

/** The strings the family says before an application says otherwise. */
export const DEFAULT_NOTIFICATION_CENTER_MESSAGES: NotificationCenterMessages = {
  all: 'Todas',
  caughtUp: 'Tudo lido',
  dismiss: 'Dispensar',
  empty: 'Nenhuma notificação',
  fresh: (count) => `${count} novas notificações`,
  loadMore: 'Carregar mais',
  loading: 'A carregar notificações',
  markAll: 'Marcar tudo como lido',
  markRead: 'Marcar como lida',
  markUnread: 'Marcar como não lida',
  title: 'Notificações',
  unread: (count) => `${count} não lidas`,
  unreadView: 'Não lidas',
  views: 'Vistas',
};

const FALLBACK: NotificationCenterDefaults = {
  arrivals: 'hold',
  controls: 'both',
  growing: 'none',
  level: '2',
  messages: DEFAULT_NOTIFICATION_CENTER_MESSAGES,
  size: 'md',
  timeFormat: 'relative',
};

export const NOTIFICATION_CENTER_DEFAULTS = new InjectionToken<NotificationCenterDefaults>(
  'slotted notification-center defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once how its notifications read — the size, the
 * rank, how more loads, whether arrivals are held, how time is written, the
 * locale and time zone, the words — rather than repeating them on every
 * screen. A centre that states any of them itself still wins.
 */
export function provideNotificationCenterDefaults(
  defaults: Partial<Omit<NotificationCenterDefaults, 'messages'>> & {
    messages?: Partial<NotificationCenterMessages>;
  },
) {
  return {
    provide: NOTIFICATION_CENTER_DEFAULTS,
    useFactory: (): NotificationCenterDefaults => ({
      ...FALLBACK,
      ...defaults,
      messages: { ...FALLBACK.messages, ...defaults.messages },
    }),
  };
}

export function injectNotificationCenterDefaults(): NotificationCenterDefaults {
  return inject(NOTIFICATION_CENTER_DEFAULTS);
}

@Injectable({ providedIn: 'root' })
export class SlNotificationCenterIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-notification-center-${this.count}`;
  }
}
