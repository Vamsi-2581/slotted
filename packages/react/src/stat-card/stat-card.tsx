import '@slotted/styles/stat-card/stat-card.css';

import { useId, useMemo } from 'react';

import { StatCardProvider, toneOf, trendOf } from './stat-card-context';
import { useStatCardDefaults } from './stat-card-defaults';
import type {
  StatCardContextValue,
  StatCardMessages,
  StatCardProps,
  StatCardRootProps,
} from './stat-card.types';

/**
 * What a screen reader hears beside a change, and what stands in for a value
 * that is not there, in the language the family ships. An application
 * replaces them once through `StatCardDefaultsProvider`, or per card.
 */
export const STAT_CARD_MESSAGES: StatCardMessages = {
  up: 'up',
  down: 'down',
  flat: 'unchanged',
  empty: '—',
};

/**
 * A metric with its name, its change and its trend, in a frame.
 *
 * The root holds the facts the parts read — which way is good, the change,
 * the status, whether it is loading — and derives the one thing two parts
 * have to agree on: the tone of the change, which the delta wears and the
 * trend hands to its sparkline. It is derived here, synchronously, from
 * `delta` and `goodWhen`, so the first paint on the server already carries
 * it; a delta that reported its tone upward after mounting would paint one
 * frame in the wrong colour and mismatch on hydration.
 *
 * The root is a group named by its label, so a reader who lands on the
 * action inside it hears which metric it belongs to. It carries `aria-busy`
 * while loading; the placeholders are `skeleton`s, and a consumer who wants
 * one announcement for a whole dashboard wraps it in a `SkeletonRegion`.
 */
export function StatCard({
  children,
  delta,
  fill,
  formatOptions,
  goodWhen,
  layout,
  loading = false,
  locale,
  messages,
  render,
  size,
  status = 'ready',
  tone,
  ...nativeProps
}: StatCardProps) {
  const defaults = useStatCardDefaults();
  const labelId = useId();
  const resolved = {
    fill: fill ?? defaults.fill ?? 'outline',
    goodWhen: goodWhen ?? defaults.goodWhen ?? 'up',
    layout: layout ?? defaults.layout ?? 'inline',
    size: size ?? defaults.size ?? 'md',
    locale: locale ?? defaults.locale,
    formatOptions: formatOptions ?? defaults.formatOptions,
  };
  const resolvedTone =
    tone ?? (delta === undefined ? undefined : toneOf(trendOf(delta), resolved.goodWhen));

  const context = useMemo<StatCardContextValue>(
    () => ({
      delta,
      formatOptions: resolved.formatOptions,
      goodWhen: resolved.goodWhen,
      labelId,
      loading,
      locale: resolved.locale,
      messages: { ...STAT_CARD_MESSAGES, ...defaults.messages, ...messages },
      size: resolved.size,
      status,
      tone: resolvedTone,
    }),
    [
      delta,
      resolved.formatOptions,
      resolved.goodWhen,
      labelId,
      loading,
      resolved.locale,
      defaults.messages,
      messages,
      resolved.size,
      status,
      resolvedTone,
    ],
  );

  const rootProps: StatCardRootProps = {
    'aria-labelledby': labelId,
    ...nativeProps,
    'aria-busy': loading || undefined,
    children: (
      <StatCardProvider value={context}>
        <div data-part="body">{children}</div>
      </StatCardProvider>
    ),
    'data-fill': resolved.fill,
    'data-good-when': resolved.goodWhen,
    'data-layout': resolved.layout,
    'data-loading': loading || undefined,
    'data-part': 'root',
    'data-size': resolved.size,
    'data-status': status,
    'data-tone': resolvedTone,
    'data-ui': 'stat-card',
    role: 'group',
  };

  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}
