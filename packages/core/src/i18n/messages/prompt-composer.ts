import type { MessageFamily } from '../translator';
import type { Message } from '../types';

/** Every word `prompt-composer` writes on its own. */
export interface PromptComposerMessages {
  readonly attach: Message;
  readonly retry: Message;
  readonly send: Message;
  readonly sending: Message;
  readonly stop: Message;
  readonly stopped: Message;
}

export const en: PromptComposerMessages = {
  attach: 'Attach files',
  retry: 'Retry',
  send: 'Send',
  sending: 'Sending',
  stop: 'Stop',
  stopped: 'Stopped',
};

export const promptComposerMessages: MessageFamily<'promptComposer', PromptComposerMessages> = {
  name: 'promptComposer',
  base: en,
};
