import { inject, InjectionToken } from '@angular/core';
import type { MessageScrollerPosition } from '@slotted/core/message-scroller';

export interface MessageScrollerMessages {
  label: string;
  jumpToEnd: string;
  jumpToStart: string;
  /** ICU plural with `count`. */
  jumpCount: string;
  loader: string;
  unread: string;
  busy: string;
  idle: string;
}

export interface MessageScrollerDefaults {
  follow: boolean;
  defaultPosition: MessageScrollerPosition;
  peek: number;
  scrollMargin: number;
  locale: string | undefined;
  messages: MessageScrollerMessages;
}

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

export const MESSAGE_SCROLLER_DEFAULTS = new InjectionToken<MessageScrollerDefaults>(
  'slotted message-scroller defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

type Input = Partial<Omit<MessageScrollerDefaults, 'messages'>> & {
  messages?: Partial<MessageScrollerMessages>;
};

/**
 * An application decides once whether its conversations follow a reply,
 * where a saved one opens, how much of the previous turn stays in view and
 * the words the scroller writes. A scroller that states any of them wins.
 */
export function provideMessageScrollerDefaults(defaults: Input) {
  return {
    provide: MESSAGE_SCROLLER_DEFAULTS,
    useFactory: (): MessageScrollerDefaults => ({
      follow: defaults.follow ?? FALLBACK.follow,
      defaultPosition: defaults.defaultPosition ?? FALLBACK.defaultPosition,
      peek: defaults.peek ?? FALLBACK.peek,
      scrollMargin: defaults.scrollMargin ?? FALLBACK.scrollMargin,
      locale: defaults.locale ?? FALLBACK.locale,
      messages: { ...FALLBACK.messages, ...defaults.messages },
    }),
  };
}

export function injectMessageScrollerDefaults(): MessageScrollerDefaults {
  return inject(MESSAGE_SCROLLER_DEFAULTS);
}
