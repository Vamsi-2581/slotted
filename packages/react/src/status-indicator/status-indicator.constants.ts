import type { StatusIndicatorLabels, StatusIndicatorStatus } from './status-indicator.types';

export const STATUS_INDICATOR_DEFAULT_STATUS: StatusIndicatorStatus = 'neutral';

/**
 * The word a reader hears when the consumer supplied no visible label.
 *
 * It is a table rather than a sentence built at the call site, because it is
 * the one thing every surveyed implementation of this family gets wrong.
 * React Spectrum's page says an `aria-label` “must be provided” and ships a
 * nameless dot when nobody does; Fluent builds one from its own
 * `DEFAULT_STRINGS`, which is English and cannot be replaced. Here the table
 * is the fallback and the whole of it is replaceable in one decision, through
 * `StatusIndicatorDefaultsProvider`.
 *
 * The words are deliberately about the status rather than about a domain: a
 * product that means “deploy failed” writes that, and what this table owes it
 * is never to leave a mark silent.
 */
export const STATUS_INDICATOR_LABELS: Required<StatusIndicatorLabels> = {
  neutral: 'Neutral',
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
  unknown: 'Unknown',
};
