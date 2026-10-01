import type { ChartColor, ChartSlot, ChartTone } from './types';

/**
 * The chart's look, read from the stylesheet rather than written in script.
 *
 * The engine draws in its own renderer and cannot read `var()`: an ECharts
 * theme is an object of resolved values. So the family stylesheet declares,
 * on the plot part, the private properties below — each one a token with its
 * fallback — and this module resolves them in the element's own context: a
 * scheme set on an ancestor, a density, a token a consumer overrode on a
 * wrapper, and the system colours of forced-colors mode all reach the engine
 * through the cascade, with no second source of truth in script.
 *
 * A custom property's computed value is its text with `var()` substituted and
 * nothing else resolved — `color-mix()`, `0.75rem` and `CanvasText` all come
 * back as written — so every value is resolved through a probe element that
 * asks the browser what it means.
 */

export interface ChartTheme {
  readonly slots: readonly string[];
  readonly tones: Readonly<Record<ChartTone, string>>;
  readonly overflow: string;
  readonly text: string;
  readonly label: string;
  readonly grid: string;
  readonly axis: string;
  readonly reference: string;
  readonly surface: string;
  readonly fontFamily: string;
  /** Pixels. */
  readonly labelSize: number;
  readonly lineWidth: number;
  readonly markerSize: number;
  readonly barRadius: number;
  readonly areaOpacity: number;
  /** The inset between the plot's edge and the marks, in pixels. */
  readonly inset: number;
  /** Milliseconds; 1 or less under reduced motion. */
  readonly duration: number;
  readonly easing: readonly [number, number, number, number];
  readonly forcedColors: boolean;
}

export const CHART_THEME_PROPERTIES = {
  text: '--_chart-text',
  label: '--_chart-label',
  grid: '--_chart-grid',
  axis: '--_chart-axis',
  reference: '--_chart-reference',
  surface: '--_chart-surface',
  overflow: '--_chart-overflow',
  labelSize: '--_chart-label-size',
  lineWidth: '--_chart-line-width',
  markerSize: '--_chart-marker-size',
  barRadius: '--_chart-bar-radius',
  areaOpacity: '--_chart-area-opacity',
  inset: '--_chart-inset',
  duration: '--_chart-duration',
  easing: '--_chart-easing',
} as const;

const TONES: readonly ChartTone[] = [
  'neutral',
  'accent',
  'secondary',
  'success',
  'warning',
  'danger',
];

export function slotProperty(slot: ChartSlot | number) {
  return `--_chart-slot-${slot}`;
}

export function toneProperty(tone: ChartTone) {
  return `--_chart-tone-${tone}`;
}

/** The colour a legend entry or a series is painted in, from a theme. */
export function colorOf(theme: ChartTheme, color: ChartColor): string {
  if (color.type === 'tone') return theme.tones[color.tone];
  if (color.type === 'slot') return theme.slots[color.slot - 1] ?? theme.overflow;
  return theme.overflow;
}

function parseDuration(value: string) {
  const match = /^(-?[\d.]+)(ms|s)$/.exec(value.trim());
  if (!match) return 0;
  return Number(match[1]) * (match[2] === 's' ? 1000 : 1);
}

function parseEasing(value: string): [number, number, number, number] {
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  const numbers = match?.[1]?.split(',').map((part) => Number(part.trim()));
  if (numbers?.length === 4 && numbers.every(Number.isFinite)) {
    return numbers as [number, number, number, number];
  }
  return [0.2, 0, 0, 1];
}

/**
 * Reads the theme at an element. The element is the plot part, whose
 * stylesheet declares the properties; any element under a chart's root works.
 */
export function readChartTheme(element: Element): ChartTheme {
  const view = element.ownerDocument.defaultView!;
  const style = view.getComputedStyle(element);
  const raw = (name: string) => style.getPropertyValue(name).trim();

  const probe = element.ownerDocument.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;inline-size:0;block-size:0;overflow:hidden';
  element.appendChild(probe);
  const probeStyle = view.getComputedStyle(probe);

  const color = (name: string, fallback: string) => {
    const value = raw(name);
    probe.style.color = '';
    probe.style.color = value || fallback;
    return probeStyle.color || fallback;
  };
  const length = (name: string, fallback: number) => {
    const value = raw(name);
    if (!value) return fallback;
    probe.style.inlineSize = '';
    probe.style.inlineSize = value;
    const pixels = Number.parseFloat(probeStyle.inlineSize || probeStyle.width);
    probe.style.inlineSize = '0';
    return Number.isFinite(pixels) ? pixels : fallback;
  };
  const number = (name: string, fallback: number) => {
    const value = Number.parseFloat(raw(name));
    return Number.isFinite(value) ? value : fallback;
  };

  try {
    const text = color(CHART_THEME_PROPERTIES.text, 'CanvasText');
    return {
      slots: Array.from({ length: 8 }, (_, index) => color(slotProperty(index + 1), text)),
      tones: Object.fromEntries(
        TONES.map((tone) => [tone, color(toneProperty(tone), text)]),
      ) as Record<ChartTone, string>,
      overflow: color(CHART_THEME_PROPERTIES.overflow, 'GrayText'),
      text,
      label: color(CHART_THEME_PROPERTIES.label, 'GrayText'),
      grid: color(CHART_THEME_PROPERTIES.grid, 'GrayText'),
      axis: color(CHART_THEME_PROPERTIES.axis, 'GrayText'),
      reference: color(CHART_THEME_PROPERTIES.reference, 'GrayText'),
      surface: color(CHART_THEME_PROPERTIES.surface, 'Canvas'),
      fontFamily: style.fontFamily,
      labelSize: length(CHART_THEME_PROPERTIES.labelSize, 12),
      lineWidth: length(CHART_THEME_PROPERTIES.lineWidth, 2),
      markerSize: length(CHART_THEME_PROPERTIES.markerSize, 6),
      barRadius: length(CHART_THEME_PROPERTIES.barRadius, 4),
      areaOpacity: number(CHART_THEME_PROPERTIES.areaOpacity, 0.16),
      inset: length(CHART_THEME_PROPERTIES.inset, 8),
      duration: parseDuration(raw(CHART_THEME_PROPERTIES.duration)),
      easing: parseEasing(raw(CHART_THEME_PROPERTIES.easing)),
      forcedColors: view.matchMedia?.('(forced-colors: active)').matches ?? false,
    };
  } finally {
    probe.remove();
  }
}

export function sameTheme(a: ChartTheme | null, b: ChartTheme | null) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Calls back when anything that can change the theme at an element changes:
 * the scheme, theme or density attribute anywhere in the document, a class or
 * an inline style (a token overridden on a wrapper), and the three media
 * features the foundation answers. The caller re-reads and compares; this
 * only says when to look.
 *
 * One observer per chart, on the document, filtered to attributes and then
 * to the chart's own ancestors: a token inherits down the tree and nowhere
 * else, and the engine, the tooltip and the probe rewrite `style` inside the
 * chart on every pointer move, which would otherwise re-read the theme sixty
 * times a second.
 */
export function observeChartTheme(element: Element, onChange: () => void): () => void {
  const document = element.ownerDocument;
  const view = document.defaultView;
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame =
      view?.requestAnimationFrame(() => {
        frame = 0;
        onChange();
      }) ?? 0;
  };
  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.target.contains(element))) schedule();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: [
      'data-slotted-scheme',
      'data-slotted-theme',
      'data-slotted-density',
      'class',
      'style',
      'dir',
    ],
  });
  const queries = [
    '(prefers-color-scheme: dark)',
    '(forced-colors: active)',
    '(prefers-reduced-motion: reduce)',
  ]
    .map((query) => view?.matchMedia?.(query))
    .filter((query): query is MediaQueryList => Boolean(query));
  for (const query of queries) query.addEventListener('change', schedule);
  /* A theme applied at runtime changes no attribute: its stylesheet announces itself (`@slotted/theme` › `THEME_CHANGE_EVENT`). */
  document.addEventListener('slotted-themechange', schedule);
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  let live = true;
  fonts?.ready.then(() => live && schedule());

  return () => {
    live = false;
    observer.disconnect();
    for (const query of queries) query.removeEventListener('change', schedule);
    document.removeEventListener('slotted-themechange', schedule);
    if (frame) view?.cancelAnimationFrame(frame);
  };
}
