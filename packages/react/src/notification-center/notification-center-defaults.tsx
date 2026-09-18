import { createContext, useContext } from 'react';

import type {
  NotificationCenterDefaults,
  NotificationCenterDefaultsProviderProps,
  NotificationCenterMessages,
} from './notification-center.types';

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

const NotificationCenterDefaultsContext = createContext<NotificationCenterDefaults>(FALLBACK);

/** What a notification centre renders as here, before it states anything of its own. */
export function useNotificationCenterDefaults(): NotificationCenterDefaults {
  return useContext(NotificationCenterDefaultsContext);
}

/**
 * An application decides once how its notifications read — the size, the
 * rank, how more loads, whether arrivals are held, how time is written, the
 * locale and time zone, the words — rather than repeating them on every
 * screen. A centre that states any of them itself still wins.
 */
export function NotificationCenterDefaultsProvider({
  children,
  messages,
  ...defaults
}: NotificationCenterDefaultsProviderProps) {
  const inherited = useNotificationCenterDefaults();

  return (
    <NotificationCenterDefaultsContext.Provider
      value={{
        arrivals: defaults.arrivals ?? inherited.arrivals,
        controls: defaults.controls ?? inherited.controls,
        growing: defaults.growing ?? inherited.growing,
        level: defaults.level ?? inherited.level,
        locale: defaults.locale ?? inherited.locale,
        messages: { ...inherited.messages, ...messages },
        size: defaults.size ?? inherited.size,
        timeFormat: defaults.timeFormat ?? inherited.timeFormat,
        timeZone: defaults.timeZone ?? inherited.timeZone,
      }}
    >
      {children}
    </NotificationCenterDefaultsContext.Provider>
  );
}
