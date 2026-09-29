import '@slotted/styles/rating/rating.css';

import { formatRating, formatRatingMessage, ratingFills } from '@slotted/core/rating';
import type { CSSProperties, ReactNode } from 'react';

import { Glyph, Icon } from '../icon';
import { useRatingDefaults } from './rating-defaults';
import type { RatingDisplayProps, RatingRootProps, RatingSymbolState } from './rating.types';

/** A share written into a custom property, to four places as the harness writes it. */
export function shareValue(share: number): string {
  return String(Math.round(share * 10_000) / 10_000);
}

/** The star every symbol draws unless `renderSymbol` replaces it. */
export function RatingStar() {
  return (
    <Icon>
      <Glyph name="star" />
    </Icon>
  );
}

/**
 * The two layers of one symbol: the unlit shape, and the same shape clipped to
 * the lit share by the stylesheet. A replacement symbol is drawn in both, so it
 * lights the way the star does.
 */
export function RatingSymbolLayers({
  fill,
  index,
  renderSymbol,
}: RatingSymbolState & {
  renderSymbol: ((state: RatingSymbolState) => ReactNode) | undefined;
}) {
  const symbol = renderSymbol === undefined ? <RatingStar /> : renderSymbol({ index, fill });
  return (
    <>
      <span data-part="symbol">{symbol}</span>
      <span data-part="fill">{symbol}</span>
    </>
  );
}

/**
 * A rating the page reports rather than one the reader gives.
 *
 * It is one image with one name: the symbols, the number and the count are
 * hidden from assistive technology, and `aria-label` says all three once.
 * Each symbol is lit by its own fraction through `--slotted-rating-fill`, so a
 * display draws any value — 4.6 lights six tenths of the fifth star — where
 * the input member offers whole and half steps.
 *
 * `compact` and `histogram` draw one star beside the number, for a row that
 * has no room for five; `histogram` adds one bar per level, each the share of
 * the largest, so the shape of a distribution reads at list density.
 */
export function RatingDisplay({
  'aria-label': ariaLabel,
  className,
  count,
  distribution,
  locale,
  max,
  messages,
  ref,
  render,
  renderSymbol,
  role,
  showValue,
  size,
  style,
  tone,
  value,
  variant,
  ...nativeProps
}: RatingDisplayProps) {
  const defaults = useRatingDefaults();
  const resolvedMax = Math.max(1, Math.floor(max ?? defaults.max));
  const resolvedVariant = variant ?? 'full';
  const resolvedLocale = locale ?? defaults.locale;
  const resolvedMessages = { ...defaults.messages, ...messages };
  const shown = Number.isFinite(value) ? Math.min(Math.max(value, 0), resolvedMax) : 0;
  const single = resolvedVariant !== 'full';
  const fills = single ? [shown > 0 ? 1 : 0] : ratingFills(shown, resolvedMax);
  const numbers = new Intl.NumberFormat(resolvedLocale);
  const largest = Math.max(0, ...(distribution ?? []));

  const rootProps: RatingRootProps = {
    ...nativeProps,
    'aria-label':
      ariaLabel ??
      formatRatingMessage(
        count === undefined
          ? resolvedMessages.displayLabel
          : resolvedMessages.displayLabelWithCount,
        count === undefined
          ? { value: shown, max: resolvedMax }
          : { value: shown, max: resolvedMax, count },
        resolvedLocale,
      ),
    children: (
      <>
        <div data-part="symbols">
          {fills.map((fill, index) => (
            <span
              data-part="item"
              key={index}
              style={{ '--slotted-rating-fill': String(fill) } as CSSProperties}
            >
              <RatingSymbolLayers fill={fill} index={index} renderSymbol={renderSymbol} />
            </span>
          ))}
        </div>
        {showValue === false ? null : (
          <span data-part="value" aria-hidden="true">
            {formatRating(shown, resolvedLocale)}
          </span>
        )}
        {resolvedVariant === 'histogram' && distribution !== undefined ? (
          <span data-part="histogram" aria-hidden="true">
            {distribution.map((part, index) => (
              <span
                data-part="bar"
                key={index}
                style={
                  {
                    '--slotted-rating-share': shareValue(
                      largest === 0 ? 0 : Math.max(0, part) / largest,
                    ),
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
        {count === undefined ? null : (
          <span data-part="count" aria-hidden="true">
            {resolvedVariant === 'histogram' ? numbers.format(count) : `(${numbers.format(count)})`}
          </span>
        )}
      </>
    ),
    className,
    'data-part': 'root',
    'data-size': size ?? defaults.size,
    'data-tone': tone ?? defaults.tone,
    'data-ui': 'rating',
    ...(resolvedVariant === 'full' ? {} : { 'data-variant': resolvedVariant }),
    role: role ?? 'img',
    style,
  };

  return render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps);
}
