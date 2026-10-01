export { SlPromptComposer } from './prompt-composer';
export {
  injectPromptComposerDefaults,
  PROMPT_COMPOSER_ATTACH_LABEL,
  PROMPT_COMPOSER_DEFAULTS,
  PROMPT_COMPOSER_RETRY_LABEL,
  PROMPT_COMPOSER_SEND_LABEL,
  PROMPT_COMPOSER_SENDING_LABEL,
  PROMPT_COMPOSER_STOP_LABEL,
  PROMPT_COMPOSER_STOPPED_LABEL,
  providePromptComposerDefaults,
  SlPromptComposerControl,
} from './prompt-composer-defaults';
export type {
  PromptComposerAttachEvent,
  PromptComposerDefaults,
  PromptComposerSize,
  PromptComposerStatus,
  PromptComposerStopEvent,
  PromptComposerSubmitOn,
  PromptComposerSubmitReason,
  PromptComposerVariant,
} from './prompt-composer-defaults';
export { SlPromptComposerInput } from './prompt-composer-input';
export {
  SlPromptComposerAction,
  SlPromptComposerAttach,
  SlPromptComposerFooter,
  SlPromptComposerHeader,
  SlPromptComposerSubmit,
} from './prompt-composer-parts';
