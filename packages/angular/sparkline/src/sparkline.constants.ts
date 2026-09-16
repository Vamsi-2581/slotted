import type { SparklineMessages } from '@slotted/core/sparkline';

export type SparklineType = 'line' | 'bar';
export type SparklineSize = 'sm' | 'md' | 'lg';
export type SparklineCurve = 'linear' | 'monotone';
export type SparklineTone = 'neutral' | 'accent' | 'secondary' | 'success' | 'warning' | 'danger';
export type SparklineSeries = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * The sentences a screen reader hears in place of the drawing, in the
 * language the family ships. An application replaces them once through
 * `provideSparklineDefaults`, or per sparkline.
 */
export const SPARKLINE_MESSAGES: SparklineMessages = {
  up: '{last}, up {change} since {first}',
  down: '{last}, down {change} since {first}',
  flat: '{last}, unchanged since {first}',
  noData: 'no data',
};

/** The bar's corner and the space between two bars, in pixels; the stylesheet's geometry. */
export const SPARKLINE_BAR_GAP = 2;
export const SPARKLINE_BAR_RADIUS = 2;
