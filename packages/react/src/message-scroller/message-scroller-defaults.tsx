import { createContext, useContext } from 'react';

import type {
  MessageScrollerDefaults,
  MessageScrollerDefaultsProviderProps,
  MessageScrollerMessages,
} from './message-scroller.types';

export const MESSAGE_SCROLLER_MESSAGES: MessageScrollerMessages = {
  label: 'Mensagens',
  jumpToEnd: 'Ir para a mais recente',
  jumpToStart: 'Ir para a primeira',
  jumpCount: '{count, plural, one {# nova} other {# novas}}',
  loader: 'A carregar mensagens anteriores',
  unread: 'Novas mensagens',
  busy: 'A responder',
  idle: 'Resposta completa',
};

const FALLBACK: MessageScrollerDefaults = {
  follow: false,
  defaultPosition: 'last-anchor',
  peek: 64,
  scrollMargin: 0,
  locale: undefined,
  messages: MESSAGE_SCROLLER_MESSAGES,
};

const DefaultsContext = createContext<MessageScrollerDefaults>(FALLBACK);

export function useMessageScrollerDefaults(): MessageScrollerDefaults {
  return useContext(DefaultsContext);
}

/**
 * An application decides once whether its conversations follow a reply,
 * where a saved one opens, how much of the previous turn stays in view and
 * the words the scroller writes. A scroller that states any of them wins.
 */
export function MessageScrollerDefaultsProvider({
  children,
  messages,
  ...defaults
}: MessageScrollerDefaultsProviderProps) {
  const inherited = useMessageScrollerDefaults();
  const own = Object.fromEntries(
    Object.entries(messages ?? {}).filter(([, value]) => value !== undefined),
  ) as Partial<MessageScrollerMessages>;
  return (
    <DefaultsContext.Provider
      value={{
        follow: defaults.follow ?? inherited.follow,
        defaultPosition: defaults.defaultPosition ?? inherited.defaultPosition,
        peek: defaults.peek ?? inherited.peek,
        scrollMargin: defaults.scrollMargin ?? inherited.scrollMargin,
        locale: defaults.locale ?? inherited.locale,
        messages: { ...inherited.messages, ...own },
      }}
    >
      {children}
    </DefaultsContext.Provider>
  );
}
