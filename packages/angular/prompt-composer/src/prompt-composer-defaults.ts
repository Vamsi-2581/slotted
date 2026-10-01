import { inject, InjectionToken } from '@angular/core';
import type { Signal } from '@angular/core';
import type { UploadFile } from '@slotted/core/upload';

export type PromptComposerSize = 'sm' | 'md' | 'lg';
/**
 * `raised` is the chat composer, a surface lifted off the page; `outline` and
 * `subtle` are a composer inside a form, with a one-line control's geometry.
 */
export type PromptComposerVariant = 'raised' | 'outline' | 'subtle';
/** Whether Enter sends, or only Mod+Enter does. Shift+Enter always breaks a line. */
export type PromptComposerSubmitOn = 'enter' | 'mod-enter';
/** Where the request stands. The application owns it. */
export type PromptComposerStatus = 'ready' | 'submitted' | 'streaming' | 'error';
export type PromptComposerSubmitReason = 'keyboard' | 'pointer';

/** Files from the attach button, a paste or a drop, after the selection rules. */
export interface PromptComposerAttachEvent {
  files: File[];
  reason: 'pointer' | 'paste' | 'drop';
  rejected: UploadFile[];
  source: Event;
}

export interface PromptComposerStopEvent {
  reason: PromptComposerSubmitReason;
  source: Event;
}

export const PROMPT_COMPOSER_SEND_LABEL = 'Send';
export const PROMPT_COMPOSER_STOP_LABEL = 'Stop';
export const PROMPT_COMPOSER_RETRY_LABEL = 'Retry';
export const PROMPT_COMPOSER_ATTACH_LABEL = 'Attach files';
export const PROMPT_COMPOSER_SENDING_LABEL = 'Sending';
export const PROMPT_COMPOSER_STOPPED_LABEL = 'Stopped';

export interface PromptComposerDefaults {
  attachLabel: string;
  retryLabel: string;
  sendLabel: string;
  sendingLabel: string;
  size: PromptComposerSize;
  stopLabel: string;
  stoppedLabel: string;
  submitOn: PromptComposerSubmitOn;
  variant: PromptComposerVariant;
}

const FALLBACK: PromptComposerDefaults = {
  attachLabel: PROMPT_COMPOSER_ATTACH_LABEL,
  retryLabel: PROMPT_COMPOSER_RETRY_LABEL,
  sendLabel: PROMPT_COMPOSER_SEND_LABEL,
  sendingLabel: PROMPT_COMPOSER_SENDING_LABEL,
  size: 'md',
  stopLabel: PROMPT_COMPOSER_STOP_LABEL,
  stoppedLabel: PROMPT_COMPOSER_STOPPED_LABEL,
  submitOn: 'enter',
  variant: 'raised',
};

export const PROMPT_COMPOSER_DEFAULTS = new InjectionToken<PromptComposerDefaults>(
  'slotted prompt composer defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once how its composers look, which key sends, and
 * what the buttons say. A composer that states any of them itself still wins.
 */
export function providePromptComposerDefaults(defaults: Partial<PromptComposerDefaults>) {
  return {
    provide: PROMPT_COMPOSER_DEFAULTS,
    useFactory: (): PromptComposerDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

export function injectPromptComposerDefaults(): PromptComposerDefaults {
  return inject(PROMPT_COMPOSER_DEFAULTS);
}

/**
 * What the composer needs of the textarea inside it. An abstract class rather
 * than an import, so the two directives depend on each other without a cycle.
 */
export abstract class SlPromptComposerControl {
  /** What the element shows. */
  abstract readonly current: Signal<string>;
  abstract readonly resolvedDisabled: Signal<boolean | undefined>;
  abstract readonly resolvedReadOnly: Signal<boolean | undefined>;
  abstract readonly resolvedInvalid: Signal<boolean | undefined>;
  /** Empties the value after an accepted send, with reason `submit`. */
  abstract clearAfterSubmit(source: Event): void;
  abstract focus(): void;
}
