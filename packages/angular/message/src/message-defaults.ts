import { inject, InjectionToken } from '@angular/core';
import type { ChangeReason } from '@slotted/core/state';

export type MessageAlign = 'start' | 'end';
export type MessageLayout = 'bubble' | 'thread';
export type MessageActionsVisibility = 'always' | 'hover';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'streaming';
export type BubbleVariant = 'solid' | 'soft' | 'outline' | 'plain';
export type BubbleTone = 'accent' | 'secondary' | 'success' | 'warning' | 'danger';
export type MessageActivityStepStatus = 'complete' | 'current' | 'pending';

/** Why a version, a reaction or a clamp moved. */
export type MessageChangeReason = Extract<ChangeReason, 'pointer' | 'keyboard'>;

/** A request to send a message again. It carries no value. */
export interface MessageRetryRequest {
  readonly reason: MessageChangeReason;
  readonly source: Event;
}

export interface MessageMessages {
  actions: string;
  versions: string;
  versionLabel: string;
  previousVersion: string;
  nextVersion: string;
  reactions: string;
  typing: string;
  more: string;
  less: string;
  retry: string;
  sending: string;
  sent: string;
  delivered: string;
  read: string;
  failed: string;
  streaming: string;
}

export interface MessageDefaults {
  layout: MessageLayout;
  actionsVisibility: MessageActionsVisibility;
  variant: BubbleVariant;
  tone: BubbleTone;
  messages: MessageMessages;
}

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

export const MESSAGE_DEFAULTS = new InjectionToken<MessageDefaults>('slotted message defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

type MessageDefaultsInput = Partial<Omit<MessageDefaults, 'messages'>> & {
  messages?: Partial<MessageMessages>;
};

/**
 * An application decides once how its messages are laid out, when their
 * actions show, what a bubble paints when nothing infers it, and the words
 * the family writes. A group, a row or a bubble that states any of them
 * still wins.
 */
export function provideMessageDefaults(defaults: MessageDefaultsInput) {
  return {
    provide: MESSAGE_DEFAULTS,
    useFactory: (): MessageDefaults => ({
      layout: defaults.layout ?? FALLBACK.layout,
      actionsVisibility: defaults.actionsVisibility ?? FALLBACK.actionsVisibility,
      variant: defaults.variant ?? FALLBACK.variant,
      tone: defaults.tone ?? FALLBACK.tone,
      messages: { ...FALLBACK.messages, ...defaults.messages },
    }),
  };
}

export function injectMessageDefaults(): MessageDefaults {
  return inject(MESSAGE_DEFAULTS);
}

export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    values[name] === undefined ? whole : String(values[name]),
  );
}

/** A click from Enter or Space has no detail. */
export function reasonOf(event: Event): MessageChangeReason {
  return (event as MouseEvent).detail === 0 ? 'keyboard' : 'pointer';
}
