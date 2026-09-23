// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { createChartModel, type ChartSpec, type ChartTheme } from '../chart/index';
import { loadEngine } from './loader';
import { buildChartOption, chooseRenderer, requiredChunks } from './option';

const theme: ChartTheme = {
  slots: [
    '#2563eb',
    '#ea580c',
    '#0891b2',
    '#dc2626',
    '#7c3aed',
    '#a16207',
    '#c026d3',
    '#16a34a',
  ].map((hex) => hex),
  tones: {
    neutral: 'rgb(71, 85, 105)',
    accent: 'rgb(37, 99, 235)',
    secondary: 'rgb(100, 116, 139)',
    success: 'rgb(22, 163, 74)',
    warning: 'rgb(202, 138, 4)',
    danger: 'rgb(220, 38, 38)',
  },
  overflow: 'rgb(100, 116, 139)',
  text: 'rgb(15, 23, 42)',
  label: 'rgb(71, 85, 105)',
  grid: 'rgb(216, 222, 230)',
  axis: 'rgb(148, 163, 184)',
  reference: 'rgb(100, 116, 139)',
  surface: 'rgb(255, 255, 255)',
  fontFamily: 'sans-serif',
  labelSize: 12,
  lineWidth: 2,
  markerSize: 6,
  barRadius: 4,
  areaOpacity: 0.16,
  inset: 8,
  duration: 320,
  easing: [0.2, 0, 0, 1],
  forcedColors: false,
};

const spec: ChartSpec = {
  x: { field: 'm' },
  data: [
    { m: 'Jan', a: 1, b: 4 },
    { m: 'Feb', a: 3, b: 2 },
    { m: 'Mar', a: 2, b: 5 },
  ],
  series: [
    { kind: 'area', field: 'a' },
    { kind: 'bar', field: 'b' },
  ],
};

describe('buildChartOption', () => {
  it('leaves tooltip, legend, title and toolbox to the family', () => {
    const { option } = buildChartOption({ model: createChartModel(spec), theme });
    for (const key of ['tooltip', 'legend', 'title', 'toolbox', 'axisPointer']) {
      expect(option).not.toHaveProperty(key);
    }
  });

  it('drops a hidden series and keeps the others’ indexes', () => {
    const result = buildChartOption({ model: createChartModel(spec, { hidden: ['a'] }), theme });
    expect((result.option['series'] as { id: string }[]).map((series) => series.id)).toEqual(['b']);
    expect(result.seriesIndex.get('b')).toBe(0);
  });

  it('paints each series from the theme, and never from the engine’s palette', () => {
    const { option } = buildChartOption({ model: createChartModel(spec), theme });
    const [area, bar] = option['series'] as {
      lineStyle?: { color: string };
      itemStyle: { color: string };
    }[];
    expect(area!.lineStyle!.color).toBe('#2563eb');
    expect(bar!.itemStyle.color).toBe('#ea580c');
    expect(option).not.toHaveProperty('color');
  });

  it('does not animate under reduced motion', () => {
    const { option } = buildChartOption({
      model: createChartModel(spec),
      theme: { ...theme, duration: 1 },
    });
    expect(option['animation']).toBe(false);
  });

  it('keeps the wheel for the page unless a modifier is held', () => {
    const { option } = buildChartOption({
      model: createChartModel(spec),
      theme,
      zoomable: true,
      zoom: { start: 0.25, end: 0.75 },
    });
    const [zoom] = option['dataZoom'] as { start: number; end: number; zoomOnMouseWheel: string }[];
    expect(zoom).toMatchObject({ start: 25, end: 75, zoomOnMouseWheel: 'ctrl' });
  });

  it('asks only for the chunks the view draws', () => {
    expect(requiredChunks({ model: createChartModel(spec), theme }).sort()).toEqual(
      ['bar', 'base', 'cartesian', 'line'].sort(),
    );
    const pie = createChartModel({
      x: { field: 'k' },
      data: [{ k: 'a', v: 1 }],
      series: [{ kind: 'pie', field: 'v' }],
    });
    expect(requiredChunks({ model: pie, theme }).sort()).toEqual(['base', 'pie']);
    expect(requiredChunks({ model: pie, theme: { ...theme, forcedColors: true } })).toContain(
      'texture',
    );
  });

  it('draws on canvas past the threshold when asked for auto', () => {
    const many = createChartModel({
      x: { field: 'i' },
      data: Array.from({ length: 5000 }, (_, i) => ({ i, v: i })),
      series: [{ kind: 'line', field: 'v' }],
    });
    expect(chooseRenderer({ model: many, theme })).toBe('canvas');
    expect(chooseRenderer({ model: many, theme, renderer: 'svg' })).toBe('svg');
  });

  it('hands the option to the escape hatch last', () => {
    const { option } = buildChartOption({
      model: createChartModel(spec),
      theme,
      extendOption: (option) => ({ ...option, extra: true }),
    });
    expect(option['extra']).toBe(true);
  });
});

/**
 * The option is also held against ECharts itself: rendered to an SVG string
 * in node, through the same chunks the browser loads. An option ECharts
 * refused or misread would draw nothing, and the count of marks says so.
 */
describe('the engine draws the option', () => {
  async function render(model: ReturnType<typeof createChartModel>, chunks: string[]) {
    const { init } = await loadEngine(chunks);
    const chart = init(null as unknown as HTMLElement, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 400,
      height: 240,
    });
    chart.setOption(buildChartOption({ model, theme: { ...theme, duration: 1 } }, 400).option);
    const svg = chart.renderToSVGString();
    chart.dispose();
    return svg;
  }

  it('draws a line, its area and three bars', async () => {
    const model = createChartModel(spec);
    const svg = await render(model, requiredChunks({ model, theme }));
    expect(svg).toContain('#2563eb');
    expect(svg).toContain('#ea580c');
    expect(svg.match(/<path/g)?.length ?? 0).toBeGreaterThan(5);
  });

  it('draws every slice of a pie in its own slot', async () => {
    const model = createChartModel({
      x: { field: 'k' },
      data: [
        { k: 'a', v: 1 },
        { k: 'b', v: 2 },
        { k: 'c', v: 3 },
      ],
      series: [{ kind: 'pie', field: 'v', innerRadius: 0.6 }],
    });
    const svg = await render(model, requiredChunks({ model, theme }));
    for (const color of ['#2563eb', '#ea580c', '#0891b2']) expect(svg).toContain(color);
  });

  /* Two groups sharing one x field leave a gap in each series wherever the
     other group has a record; the size callback met them as nothing and threw. */
  it('draws a scatter whose series have gaps, with and without bubble sizes', async () => {
    for (const sizeField of [undefined, 'size']) {
      const model = createChartModel({
        x: { field: 'x', type: 'value' },
        data: [
          { x: 1, a: 2, b: null, size: 3 },
          { x: 2, a: null, b: 4, size: 9 },
        ],
        series: [
          { kind: 'scatter', field: 'a', sizeField },
          { kind: 'scatter', field: 'b', sizeField },
        ],
      });
      const svg = await render(model, requiredChunks({ model, theme }));
      expect(svg).toContain('#2563eb');
      expect(svg).toContain('#ea580c');
    }
  });
});
