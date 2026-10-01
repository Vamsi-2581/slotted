import { createContext, useContext } from 'react';

import type {
  MessageDefaults,
  MessageDefaultsProviderProps,
  MessageMessages,
} from './message.types';

export const MESSAGE_MESSAGES: MessageMessages = {
  actions: 'Ações da mensagem',
  versions: 'Versões',
  versionLabel: '{current} de {total}',
  previousVersion: 'Versão anterior',
  nextVersion: 'Versão seguinte',
  reactions: 'Reações',
  typing: 'A escrever',
  more: 'Mostrar mais',
  less: 'Mostrar menos',
  retry: 'Tentar enviar de novo',
  sending: 'A enviar',
  sent: 'Enviada',
  delivered: 'Entregue',
  read: 'Lida',
  failed: 'Não enviada',
  streaming: 'A responder',
};

const FALLBACK: MessageDefaults = {
  layout: 'bubble',
  actionsVisibility: 'hover',
  variant: 'soft',
  tone: 'secondary',
  messages: MESSAGE_MESSAGES,
};

const MessageDefaultsContext = createContext<MessageDefaults>(FALLBACK);

/** What a message renders as here, before its group or itself states anything. */
export function useMessageDefaults(): MessageDefaults {
  return useContext(MessageDefaultsContext);
}

/**
 * An application decides once how its messages are laid out, when their
 * actions show, what a bubble paints when nothing infers it, and the words
 * the family writes. A group, a row or a bubble that states any of them
 * still wins.
 */
export function MessageDefaultsProvider({
  children,
  messages,
  ...defaults
}: MessageDefaultsProviderProps) {
  const inherited = useMessageDefaults();

  return (
    <MessageDefaultsContext.Provider
      value={{
        layout: defaults.layout ?? inherited.layout,
        actionsVisibility: defaults.actionsVisibility ?? inherited.actionsVisibility,
        variant: defaults.variant ?? inherited.variant,
        tone: defaults.tone ?? inherited.tone,
        messages: { ...inherited.messages, ...stripUndefined(messages ?? {}) },
      }}
    >
      {children}
    </MessageDefaultsContext.Provider>
  );
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}

/** A message template with `{name}` values. */
export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    values[name] === undefined ? whole : String(values[name]),
  );
}
