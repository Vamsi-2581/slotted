import { inject, InjectionToken } from '@angular/core';
import { FULLSCREEN_MESSAGES } from '@slotted/core/fullscreen';
import type {
  FullscreenMessages,
  FullscreenNavigationUI,
  FullscreenPolicy,
} from '@slotted/core/fullscreen';

export type FullscreenTriggerSize = 'sm' | 'md' | 'lg';

/** `ghost` inside a bar that is already framed; `outline` over content. */
export type FullscreenTriggerVariant = 'ghost' | 'outline';

export interface FullscreenDefaults {
  mode: FullscreenPolicy;
  navigationUI: FullscreenNavigationUI;
  size: FullscreenTriggerSize;
  variant: FullscreenTriggerVariant;
  messages: FullscreenMessages;
}

const FALLBACK: FullscreenDefaults = {
  mode: 'auto',
  navigationUI: 'auto',
  size: 'md',
  variant: 'ghost',
  messages: FULLSCREEN_MESSAGES,
};

export const FULLSCREEN_DEFAULTS = new InjectionToken<FullscreenDefaults>(
  'slotted fullscreen defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/**
 * An application decides once whether its regions ask the platform, how the
 * control is drawn and what it says. Messages merge key by key; a region or a
 * control that states any of them itself still wins.
 */
export function provideFullscreenDefaults(
  defaults: Partial<Omit<FullscreenDefaults, 'messages'>> & {
    messages?: Partial<FullscreenMessages>;
  },
) {
  return {
    provide: FULLSCREEN_DEFAULTS,
    useFactory: (): FullscreenDefaults => ({
      ...FALLBACK,
      ...defaults,
      messages: { ...FALLBACK.messages, ...defaults.messages },
    }),
  };
}

export function injectFullscreenDefaults(): FullscreenDefaults {
  return inject(FULLSCREEN_DEFAULTS);
}
