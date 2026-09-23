import { createNumberFormatter, fillMessage } from './format';
import { categoryIndex, type ChartModel, seriesOf, visibleSeries } from './model';
import type { ChartKind, ChartPoint, ChartZoom } from './types';
import { zoomRange } from './navigation';

/**
 * Every sentence the family says, in the language it ships. An application
 * replaces them once through its binding's defaults, or per chart. The
 * placeholders are `{name}` and every one is listed beside its message.
 */
export interface ChartMessages {
  /** The plot's `aria-roledescription`. */
  readonly roledescription: string;
  /** The legend toolbar's name. */
  readonly legend: string;
  readonly kinds: Readonly<Record<ChartKind | 'mixed', string>>;
  /** `{kind}`, `{series}`, `{points}`, `{first}`, `{last}`. */
  readonly summary: string;
  /** `{series}`, `{first}`, `{last}`, `{min}`, `{minAt}`, `{max}`, `{maxAt}`. */
  readonly seriesRange: string;
  /** `{kind}`, `{count}`, `{total}`. */
  readonly summaryPie: string;
  /** `{label}`, `{value}`, `{share}`. */
  readonly slice: string;
  /** `{count}`. */
  readonly excluded: string;
  /** `{series}`, `{category}`, `{value}`. */
  readonly point: string;
  /** Appended to a point the reader has selected. */
  readonly selected: string;
  /** `{series}`. */
  readonly shown: string;
  /** `{series}`. */
  readonly hidden: string;
  /** `{first}`, `{last}`. */
  readonly zoomed: string;
  readonly zoomReset: string;
  readonly resetZoom: string;
  /** The toolbar's name. */
  readonly toolbar: string;
  /** The view toggle's name; it is pressed while the table stands in the plot. */
  readonly tableView: string;
  readonly fullscreen: string;
  readonly exitFullscreen: string;
  readonly more: string;
  readonly downloadCsv: string;
  readonly downloadImage: string;
  /** The help control's name. */
  readonly help: string;
  /** `{count}`: the control that holds the legend entries that do not fit. */
  readonly moreSeries: string;
  /** The plot's text while it waits for its data or its engine. */
  readonly loading: string;
  readonly noData: string;
  readonly allHidden: string;
  readonly showAll: string;
  readonly error: string;
  readonly retry: string;
  readonly total: string;
  /** `{shown}`, `{count}`: the table's note when it lists only the first rows. */
  readonly truncated: string;
  /** The table's first column when the x axis has no label. */
  readonly category: string;
}

export const CHART_MESSAGES: ChartMessages = {
  roledescription: 'chart',
  legend: 'Series',
  kinds: {
    line: 'Line chart',
    area: 'Area chart',
    bar: 'Bar chart',
    pie: 'Pie chart',
    scatter: 'Scatter chart',
    mixed: 'Combined chart',
  },
  summary: '{kind} with {series} series and {points} points, from {first} to {last}.',
  seriesRange:
    '{series}: from {first} to {last}; lowest {min} at {minAt}, highest {max} at {maxAt}.',
  summaryPie: '{kind} with {count} slices, totalling {total}.',
  slice: '{label}: {value}, {share}.',
  excluded: '{count} negative values are not drawn.',
  point: '{series}, {category}: {value}.',
  selected: 'selected',
  shown: '{series} shown.',
  hidden: '{series} hidden.',
  zoomed: 'Showing {first} to {last}.',
  zoomReset: 'Showing all data.',
  resetZoom: 'Reset zoom',
  toolbar: 'Chart actions',
  tableView: 'Show as table',
  fullscreen: 'Full screen',
  exitFullscreen: 'Exit full screen',
  more: 'More actions',
  downloadCsv: 'Download CSV',
  downloadImage: 'Download image',
  help: 'About this chart',
  moreSeries: '+{count}',
  loading: 'Loading chart',
  noData: 'No data to show',
  allHidden: 'Every series is hidden',
  showAll: 'Show all series',
  error: 'The chart could not be drawn',
  retry: 'Try again',
  total: 'Total',
  truncated: 'Showing the first {shown} of {count} rows.',
  category: 'Category',
};

export function mergeMessages(...layers: (Partial<ChartMessages> | undefined)[]): ChartMessages {
  let merged = CHART_MESSAGES;
  for (const layer of layers) {
    if (!layer) continue;
    merged = { ...merged, ...layer, kinds: { ...merged.kinds, ...(layer.kinds ?? {}) } };
  }
  return merged;
}

function kindOf(model: ChartModel, messages: ChartMessages) {
  const kinds = new Set(visibleSeries(model).map((series) => series.kind));
  if (kinds.size === 1) return messages.kinds[[...kinds][0]!];
  return messages.kinds.mixed;
}

function share(value: number, total: number, locale: string | undefined) {
  return createNumberFormatter(
    { style: 'percent', maximumFractionDigits: 1 },
    locale,
  )(total ? value / total : 0);
}

/**
 * The sentence a screen reader hears in place of the drawing: what kind of
 * chart, how much of it, its span, and for each visible series where it
 * starts, ends, peaks and bottoms. It is what Highcharts' and ECharts'
 * generated descriptions say, and it is written from the model, so it cannot
 * describe a series the chart has hidden.
 */
export function describeChart(model: ChartModel, messages: ChartMessages = CHART_MESSAGES): string {
  if (model.empty === 'no-data') return messages.noData;
  if (model.empty === 'all-hidden') return messages.allHidden;

  if (model.shape === 'pie') {
    const series = model.series[0]!;
    const slices = model.categories
      .filter((category) => category.visible && (series.values[category.index] ?? 0) > 0)
      .map((category) =>
        fillMessage(messages.slice, {
          label: category.label,
          value: series.format(series.values[category.index]!),
          share: share(series.values[category.index]!, model.total, model.locale),
        }),
      );
    const parts = [
      fillMessage(messages.summaryPie, {
        kind: messages.kinds.pie,
        count: slices.length,
        total: series.format(model.total),
      }),
      ...slices,
    ];
    if (model.excluded > 0) parts.push(fillMessage(messages.excluded, { count: model.excluded }));
    return parts.join(' ');
  }

  const visible = visibleSeries(model);
  const categories = model.categories;
  const parts = [
    fillMessage(messages.summary, {
      kind: kindOf(model, messages),
      series: visible.length,
      points: categories.length,
      first: categories[0]!.label,
      last: categories[categories.length - 1]!.label,
    }),
  ];
  for (const series of visible) {
    const drawn = series.values
      .map((value, index) => ({ value, index }))
      .filter((entry): entry is { value: number; index: number } => entry.value !== null);
    if (drawn.length === 0) continue;
    const min = drawn.reduce((low, entry) => (entry.value < low.value ? entry : low));
    const max = drawn.reduce((high, entry) => (entry.value > high.value ? entry : high));
    parts.push(
      fillMessage(messages.seriesRange, {
        series: series.label,
        first: series.format(drawn[0]!.value),
        last: series.format(drawn[drawn.length - 1]!.value),
        min: series.format(min.value),
        minAt: categories[min.index]!.label,
        max: series.format(max.value),
        maxAt: categories[max.index]!.label,
      }),
    );
  }
  return parts.join(' ');
}

/** What the live announcer says when the keyboard lands on a point. */
export function describePoint(
  model: ChartModel,
  point: ChartPoint,
  selection: ChartPoint | null,
  messages: ChartMessages = CHART_MESSAGES,
): string {
  const series = seriesOf(model, point.series);
  const index = categoryIndex(model, point.key);
  if (!series || index < 0) return '';
  const value = series.values[index];
  const category = model.categories[index]!;
  const text =
    model.shape === 'pie'
      ? fillMessage(messages.slice, {
          label: category.label,
          value: value === null || value === undefined ? '' : series.format(value),
          share: share(value ?? 0, model.total, model.locale),
        })
      : fillMessage(messages.point, {
          series: series.label,
          category: category.label,
          value: value === null || value === undefined ? '' : series.format(value),
        });
  const selected = selection?.series === point.series && selection.key === point.key;
  return selected ? `${text} ${messages.selected}` : text;
}

/** What the live announcer says when the window of the domain moves. */
export function describeZoom(
  model: ChartModel,
  zoom: ChartZoom | null,
  messages: ChartMessages = CHART_MESSAGES,
): string {
  const [first, last] = zoomRange(model, zoom);
  if (!zoom || (zoom.start <= 0 && zoom.end >= 1) || last < first) return messages.zoomReset;
  return fillMessage(messages.zoomed, {
    first: model.categories[first]!.label,
    last: model.categories[last]!.label,
  });
}
