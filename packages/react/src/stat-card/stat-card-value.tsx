import '@slotted/styles/stat-card/stat-card.css';

import { useMemo } from 'react';

import { Skeleton } from '../skeleton';
import { useStatCard } from './stat-card-context';
import type { StatCardValueProps } from './stat-card.types';

/**
 * The number. A numeric `value` is formatted with the card's locale and
 * `formatOptions` — `notation: 'compact'` is how 12,900 becomes 12.9K — and
 * `children` is the consumer's own rendering, unit and all. A missing or
 * failed value is the dash the messages name; a loading one is a placeholder
 * five figures wide, on the value's own line.
 */
export function StatCardValue({
  children,
  formatOptions,
  render,
  value,
  ...nativeProps
}: StatCardValueProps) {
  const card = useStatCard();
  const options = formatOptions ?? card.formatOptions;
  const formatted = useMemo(() => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat(card.locale, options).format(value);
  }, [value, card.locale, options]);

  const content = card.loading ? (
    <Skeleton inlineSize="5ch" />
  ) : card.status !== 'ready' ? (
    card.messages.empty
  ) : (
    (children ?? formatted)
  );

  const props = { ...nativeProps, children: content, 'data-part': 'value' };
  return render === undefined ? <span {...props} /> : render(props);
}
