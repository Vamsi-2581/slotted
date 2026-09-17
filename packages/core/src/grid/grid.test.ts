import { describe, expect, it } from 'vitest';

import {
  applyQuery,
  cellText,
  columnRange,
  columnTemplate,
  compareValues,
  emptyColumnState,
  emptyQuery,
  fromGridParams,
  moveCursor,
  normalizeColumnState,
  parseColumnState,
  rangeBounds,
  rangeEdges,
  rangeToText,
  rangeCells,
  resolveColumns,
  serializeColumnState,
  settleCursor,
  toGridParams,
  withColumnFilter,
  withColumnMoved,
  withColumnPinned,
  withColumnWidth,
  withPageIndex,
  withSearch,
  withSortPress,
  zoneOf,
  type CursorGrid,
  type GridColumn,
} from './index';

interface Shipment {
  id: string;
  customer: string;
  carrier: string;
  weight: number | null;
  shipped: string;
  priority: boolean;
}

const rows: Shipment[] = [
  {
    id: 'S1',
    customer: 'Aurora',
    carrier: 'DHL',
    weight: 142.5,
    shipped: '2026-09-12',
    priority: true,
  },
  {
    id: 'S2',
    customer: 'bloom',
    carrier: 'UPS',
    weight: 18.2,
    shipped: '2026-09-10',
    priority: false,
  },
  {
    id: 'S3',
    customer: 'Nordwind',
    carrier: 'FedEx',
    weight: null,
    shipped: '2026-09-08',
    priority: true,
  },
  {
    id: 'S4',
    customer: 'Casa Verde',
    carrier: 'DHL',
    weight: 64.3,
    shipped: '2026-09-13',
    priority: false,
  },
  {
    id: 'S5',
    customer: 'Ärger',
    carrier: 'UPS',
    weight: 5.6,
    shipped: '2026-09-11',
    priority: false,
  },
];

const columns: GridColumn<Shipment>[] = [
  { id: 'id', label: 'Tracking', rowHeader: true, width: 120 },
  { id: 'customer', label: 'Customer', width: 180 },
  { id: 'carrier', label: 'Carrier', kind: 'set', options: [{ value: 'DHL', label: 'DHL' }] },
  { id: 'weight', label: 'Weight', kind: 'number', aggregate: 'sum', minWidth: 80, maxWidth: 200 },
  { id: 'shipped', label: 'Shipped', kind: 'date' },
  { id: 'priority', label: 'Priority', kind: 'boolean' },
  { id: 'actions', label: 'Actions', kind: 'actions', width: 72 },
];

const rowKey = (row: Shipment) => row.id;

describe('columns', () => {
  it('normalises a saved state against the model: unknown columns leave, new ones land where declared', () => {
    const state = normalizeColumnState(
      {
        order: ['weight', 'ghost', 'id'],
        widths: { weight: 10, ghost: 99, customer: 300 },
        hidden: ['ghost', 'priority'],
        pinned: { start: ['id', 'ghost'], end: ['id', 'actions'] },
      },
      columns,
    );
    expect(state.order).toEqual([
      'weight',
      'id',
      'customer',
      'carrier',
      'shipped',
      'priority',
      'actions',
    ]);
    expect(state.widths).toEqual({ weight: 80, customer: 300 });
    expect(state.hidden).toEqual(['priority']);
    expect(state.pinned).toEqual({ start: ['id'], end: ['actions'] });
  });

  it('resolves the layout: start zone, middle, end zone, with summed pin offsets and 1-based indices', () => {
    const state = normalizeColumnState(
      { pinned: { start: ['id', 'customer'], end: ['actions'] }, hidden: ['shipped'] },
      columns,
    );
    const resolved = resolveColumns(columns, state);
    expect(resolved.map((column) => column.id)).toEqual([
      'id',
      'customer',
      'carrier',
      'weight',
      'priority',
      'actions',
    ]);
    expect(resolved.map((column) => column.index)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(resolved[0]).toMatchObject({ pinned: 'start', pinOffset: 0, pinEdge: false });
    expect(resolved[1]).toMatchObject({ pinned: 'start', pinOffset: 120, pinEdge: true });
    expect(resolved[5]).toMatchObject({ pinned: 'end', pinOffset: 0, pinEdge: true });
    expect(resolved[3]).toMatchObject({ numeric: true, sortable: true, filterable: true });
    expect(resolved[5]).toMatchObject({ sortable: false, filterable: false, searchable: false });
    /* The gutters a binding pins before the first column push the start zone
       along: without them the first pinned column stood over the chooser. */
    const behindGutters = resolveColumns(columns, state, { leading: 48 });
    expect(behindGutters[0]!.pinOffset).toBe(48);
    expect(behindGutters[1]!.pinOffset).toBe(168);
    expect(behindGutters[5]!.pinOffset).toBe(0);
  });

  it('writes one track per visible column, flex as minmax', () => {
    const resolved = resolveColumns(
      [
        { id: 'a', label: 'A', width: 100 },
        { id: 'b', label: 'B', flex: 1, minWidth: 60 },
      ],
      normalizeColumnState(null, [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ]),
    );
    expect(columnTemplate(resolved, [48])).toBe('48px 100px minmax(60px, 1fr)');
  });

  it('clamps a resize to the column’s bounds', () => {
    const state = withColumnWidth(emptyColumnState(), columns[3]!, 500);
    expect(state.widths['weight']).toBe(200);
    expect(withColumnWidth(state, columns[3]!, 3).widths['weight']).toBe(80);
  });

  it('moves a column inside its zone and never out of it', () => {
    const state = normalizeColumnState({ pinned: { start: ['id'], end: [] } }, columns);
    const resolved = resolveColumns(columns, state);
    const zone = zoneOf(resolved, 'weight');
    expect(zone).toEqual(['customer', 'carrier', 'weight', 'shipped', 'priority', 'actions']);
    const moved = withColumnMoved(state, 'weight', 0, zone);
    expect(moved.order).toEqual([
      'id',
      'weight',
      'customer',
      'carrier',
      'shipped',
      'priority',
      'actions',
    ]);
    expect(moved.pinned.start).toEqual(['id']);
  });

  it('pins and unpins through the state', () => {
    let state = withColumnPinned(emptyColumnState(), 'actions', 'end');
    state = withColumnPinned(state, 'id', 'start');
    expect(state.pinned).toEqual({ start: ['id'], end: ['actions'] });
    expect(withColumnPinned(state, 'id', null).pinned.start).toEqual([]);
  });

  it('round-trips the state through text, and parses anything without throwing', () => {
    const state = normalizeColumnState(
      {
        order: ['weight', 'id'],
        widths: { weight: 120 },
        hidden: ['priority'],
        pinned: { start: ['id'], end: ['actions'] },
      },
      columns,
    );
    const text = serializeColumnState(state, columns);
    expect(text).toBe(
      'o=weight,id,customer,carrier,shipped,priority,actions;w=weight:120;h=priority;ps=id;pe=actions',
    );
    expect(normalizeColumnState(parseColumnState(text), columns)).toEqual(state);
    expect(serializeColumnState(normalizeColumnState(null, columns), columns)).toBe('');
    expect(parseColumnState('garbage;;w=:x;o=')).toEqual(emptyColumnState());
  });
});

describe('query', () => {
  it('cycles a key ascending, descending, gone, and replaces the order on a plain press', () => {
    let move = withSortPress(emptyQuery(), 'customer');
    expect(move.query.sort).toEqual([{ column: 'customer', direction: 'ascending' }]);
    move = withSortPress(move.query, 'customer');
    expect(move.query.sort).toEqual([{ column: 'customer', direction: 'descending' }]);
    move = withSortPress(move.query, 'weight', true);
    expect(move.query.sort).toEqual([
      { column: 'customer', direction: 'descending' },
      { column: 'weight', direction: 'ascending' },
    ]);
    move = withSortPress(move.query, 'customer', true);
    expect(move.query.sort).toEqual([{ column: 'weight', direction: 'ascending' }]);
    move = withSortPress(move.query, 'id');
    expect(move.query.sort).toEqual([{ column: 'id', direction: 'ascending' }]);
    expect(move.change).toBe('sort');
  });

  it('resets the page when the filter or the search moves, and keeps it on a sort of the same page', () => {
    const paged = withPageIndex(emptyQuery({ index: 0, size: 25 }), 3).query;
    expect(paged.page).toEqual({ index: 3, size: 25 });
    expect(withSearch(paged, 'nord').query.page).toEqual({ index: 0, size: 25 });
    expect(
      withColumnFilter(paged, 'customer', {
        kind: 'text',
        join: 'and',
        conditions: [{ operator: 'contains', value: 'a' }],
      }).query.page,
    ).toEqual({ index: 0, size: 25 });
  });

  it('edits one column’s rule in the first level and drops the group when it empties', () => {
    const filtered = withColumnFilter(emptyQuery(), 'carrier', {
      kind: 'set',
      join: 'and',
      conditions: [{ operator: 'anyOf', value: ['DHL'] }],
    }).query;
    expect(filtered.filter?.rules).toHaveLength(1);
    expect(withColumnFilter(filtered, 'carrier', null).query.filter).toBeNull();
  });

  it('round-trips through the URL, and reads a malformed bookmark as the default', () => {
    const query = withSortPress(
      withSearch(
        withColumnFilter(emptyQuery({ index: 2, size: 50 }), 'carrier', {
          kind: 'set',
          join: 'and',
          conditions: [{ operator: 'anyOf', value: ['DHL', 'UPS'] }],
        }).query,
        'nord',
      ).query,
      'weight',
    ).query;
    const withPage = withPageIndex(query, 2).query;
    const params = toGridParams(withPage);
    expect(params.get('sort')).toBe('weight:asc');
    expect(params.get('page')).toBe('3');
    expect(params.get('size')).toBe('50');
    expect(params.get('q')).toBe('nord');
    expect(fromGridParams(params)).toEqual(withPage);
    expect(fromGridParams('sort=weight:sideways&page=abc&size=x')).toEqual(emptyQuery());
    expect(fromGridParams('sort=weight:desc,weight:asc').sort).toEqual([
      { column: 'weight', direction: 'descending' },
    ]);
  });
});

describe('applyQuery', () => {
  it('filters, searches, sorts, groups and pages, in that order', () => {
    const query = {
      ...emptyQuery({ index: 0, size: 2 }),
      sort: [{ column: 'weight' as const, direction: 'descending' as const }],
      search: 'a',
    };
    const result = applyQuery(rows, columns, query, { rowKey });
    /* Every customer with an `a`: Aurora, Casa Verde, Ärger (base sensitivity). */
    expect(result.total).toBe(3);
    expect(result.rows.map((row) => row.id)).toEqual(['S1', 'S4', 'S5']);
    expect(result.nodes.map((node) => node.key)).toEqual(['S1', 'S4']);
    expect(result.hasMore).toBe(true);
    expect(result.aggregates).toEqual({ weight: 212.4 });
  });

  it('sorts by the kind: empty last, text through the collator, numbers as numbers', () => {
    const asc = applyQuery(
      rows,
      columns,
      { ...emptyQuery(), sort: [{ column: 'weight', direction: 'ascending' }] },
      { rowKey },
    );
    expect(asc.rows.map((row) => row.id)).toEqual(['S5', 'S2', 'S4', 'S1', 'S3']);
    const desc = applyQuery(
      rows,
      columns,
      { ...emptyQuery(), sort: [{ column: 'weight', direction: 'descending' }] },
      { rowKey },
    );
    expect(desc.rows.map((row) => row.id)).toEqual(['S1', 'S4', 'S2', 'S5', 'S3']);
    const text = applyQuery(
      rows,
      columns,
      { ...emptyQuery(), sort: [{ column: 'customer', direction: 'ascending' }] },
      { rowKey, locale: 'en' },
    );
    expect(text.rows.map((row) => row.customer)).toEqual([
      'Ärger',
      'Aurora',
      'bloom',
      'Casa Verde',
      'Nordwind',
    ]);
    expect(compareValues('boolean', false, true)).toBeLessThan(0);
    expect(compareValues('date', '2026-09-12', '2026-09-08')).toBeGreaterThan(0);
  });

  it('groups by one or two columns, with counts and aggregates, and closes a group by key', () => {
    const query = {
      ...emptyQuery(),
      group: ['carrier', 'priority'],
      sort: [{ column: 'id' as const, direction: 'ascending' as const }],
    };
    const open = applyQuery(rows, columns, query, { rowKey });
    const keys = open.nodes.map((node) =>
      node.kind === 'group' ? `${node.level}:${node.key}` : node.key,
    );
    expect(keys).toEqual([
      '1:carrier=DHL',
      '2:carrier=DHL/priority=Yes',
      'S1',
      '2:carrier=DHL/priority=No',
      'S4',
      '1:carrier=UPS',
      '2:carrier=UPS/priority=No',
      'S2',
      'S5',
      '1:carrier=FedEx',
      '2:carrier=FedEx/priority=Yes',
      'S3',
    ]);
    const dhl = open.nodes[0]!;
    if (dhl.kind !== 'group') throw new Error('expected a group');
    expect(dhl.count).toBe(2);
    expect(dhl.aggregates).toEqual({ weight: 206.8 });
    const closed = applyQuery(rows, columns, query, {
      rowKey,
      expandedGroups: ['carrier=UPS', 'carrier=UPS/priority=No'],
    });
    expect(closed.nodes.map((node) => node.key)).toEqual([
      'carrier=DHL',
      'carrier=UPS',
      'carrier=UPS/priority=No',
      'S2',
      'S5',
      'carrier=FedEx',
    ]);
  });

  it('formats by kind and by the column’s own format', () => {
    expect(cellText(columns[3]!, rows[0]!, { locale: 'en-US' })).toBe('142.5');
    expect(cellText(columns[3]!, rows[2]!)).toBe('');
    expect(cellText(columns[5]!, rows[0]!, { booleans: { true: 'Sim', false: 'Não' } })).toBe(
      'Sim',
    );
    expect(cellText({ ...columns[4]!, format: (value) => `on ${String(value)}` }, rows[0]!)).toBe(
      'on 2026-09-12',
    );
    expect(cellText(columns[4]!, rows[0]!, { locale: 'en-US' })).toBe('Sep 12, 2026');
  });
});

describe('cursor', () => {
  const grid: CursorGrid = {
    rows: ['header', 'S1', 'S2', 'S3', 'S4', 'S5', 'summary'],
    columns: ['id', 'customer', 'weight'],
    pageSize: 2,
    bodyStart: 1,
    bodyEnd: 6,
  };

  it('moves one cell, stops at the edges, pages and jumps to the body’s corners', () => {
    expect(moveCursor(grid, { row: 'S1', column: 'id' }, 'end')).toEqual({
      row: 'S1',
      column: 'customer',
    });
    expect(moveCursor(grid, { row: 'S1', column: 'weight' }, 'end')).toEqual({
      row: 'S1',
      column: 'weight',
    });
    expect(moveCursor(grid, { row: 'S1', column: 'id' }, 'up')).toEqual({
      row: 'header',
      column: 'id',
    });
    expect(moveCursor(grid, { row: 'header', column: 'id' }, 'up')).toEqual({
      row: 'header',
      column: 'id',
    });
    expect(moveCursor(grid, { row: 'S1', column: 'id' }, 'pageDown')).toEqual({
      row: 'S3',
      column: 'id',
    });
    expect(moveCursor(grid, { row: 'summary', column: 'id' }, 'pageDown')).toEqual({
      row: 'summary',
      column: 'id',
    });
    expect(moveCursor(grid, { row: 'S3', column: 'customer' }, 'first')).toEqual({
      row: 'S1',
      column: 'id',
    });
    expect(moveCursor(grid, { row: 'S3', column: 'customer' }, 'last')).toEqual({
      row: 'S5',
      column: 'weight',
    });
    expect(moveCursor(grid, { row: 'S3', column: 'customer' }, 'rowEnd')).toEqual({
      row: 'S3',
      column: 'weight',
    });
  });

  it('settles on the same index when its row is gone, and on nothing when the grid is empty', () => {
    const shrunk: CursorGrid = { ...grid, rows: ['header', 'S1', 'S2'], bodyEnd: 3 };
    expect(settleCursor(shrunk, { row: 'S5', column: 'weight' }, 5)).toEqual({
      row: 'S2',
      column: 'weight',
    });
    expect(settleCursor(shrunk, { row: 'S2', column: 'ghost' }, 2)).toEqual({
      row: 'S2',
      column: 'id',
    });
    expect(
      settleCursor({ ...grid, rows: [], bodyStart: 0, bodyEnd: 0 }, { row: 'S1', column: 'id' }, 1),
    ).toBeNull();
  });

  it('bounds a range from its two corners and names the edges each cell draws', () => {
    const range = {
      anchor: { row: 'S4', column: 'weight' },
      focus: { row: 'S2', column: 'customer' },
    };
    const bounds = rangeBounds(grid, range);
    expect(bounds).toEqual({ rowStart: 2, rowEnd: 4, columnStart: 1, columnEnd: 2 });
    expect(rangeEdges(grid, bounds, { row: 'S2', column: 'customer' })).toEqual({
      inside: true,
      edges: ['top', 'start'],
    });
    expect(rangeEdges(grid, bounds, { row: 'S3', column: 'weight' })).toEqual({
      inside: true,
      edges: ['end'],
    });
    expect(rangeEdges(grid, bounds, { row: 'S1', column: 'id' })).toEqual({
      inside: false,
      edges: [],
    });
    expect(rangeCells(grid, bounds)).toHaveLength(3);
    expect(rangeToText(rangeCells(grid, bounds), (cell) => `${cell.row}.${cell.column}`)).toBe(
      'S2.customer\tS2.weight\nS3.customer\tS3.weight\nS4.customer\tS4.weight',
    );
    expect(columnRange(grid, 'weight')).toEqual({
      anchor: { row: 'S1', column: 'weight' },
      focus: { row: 'S5', column: 'weight' },
    });
  });
});
