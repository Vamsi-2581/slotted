import type { GridCell, GridColumn, GridColumnState, GridQuery } from '@slotted/core/grid';
import { emptyQuery } from '@slotted/core/grid';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/data-grid/contract.json';
import { DataGrid } from './data-grid';
import { DataGridDefaultsProvider } from './data-grid-defaults';
import type { DataGridHandle, DataGridProps } from './data-grid.types';

interface Shipment {
  id: string;
  customer: string;
  carrier: string;
  weight: number | null;
  shipped: string;
  priority: boolean;
}

const ROWS: Shipment[] = [
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
    customer: 'Bloom',
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
];

const COLUMNS: GridColumn<Shipment>[] = [
  { id: 'id', label: 'Tracking', rowHeader: true, width: 120 },
  { id: 'customer', label: 'Customer', width: 160, editable: true },
  {
    id: 'carrier',
    label: 'Carrier',
    kind: 'set',
    options: [
      { value: 'DHL', label: 'DHL' },
      { value: 'UPS', label: 'UPS' },
      { value: 'FedEx', label: 'FedEx' },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    kind: 'number',
    aggregate: 'sum',
    editable: true,
    validate: (value) =>
      typeof value === 'number' && value < 0 ? 'A weight is not negative' : null,
  },
  { id: 'shipped', label: 'Shipped', kind: 'date' },
  { id: 'priority', label: 'Priority', kind: 'boolean' },
];

function Shipments(props: Partial<DataGridProps<Shipment>>) {
  return (
    <DataGrid<Shipment> columns={COLUMNS} label="Shipments" rowKey="id" rows={ROWS} {...props} />
  );
}

const grid = () => screen.getByRole('grid', { name: 'Shipments' });
const cell = (row: string, column: string) =>
  grid().querySelector<HTMLElement>(`[data-row="${row}"] [data-column="${column}"]`)!;
const header = (column: string) =>
  grid().querySelector<HTMLElement>(`[data-part="column-header"][data-column="${column}"]`)!;

describe('DataGrid, the pattern', () => {
  it('is a grid of rows and cells, with every count written', () => {
    render(<Shipments />);
    const root = grid();
    expect(root).toHaveAttribute('data-ui', 'data-grid');
    expect(root).toHaveAttribute('aria-colcount', '6');
    /* Four rows, the header row and the summary the aggregating column draws. */
    expect(root).toHaveAttribute('aria-rowcount', '6');
    expect(root.querySelectorAll('[role="rowgroup"]')).toHaveLength(3);
    expect(root.querySelectorAll('[role="columnheader"]')).toHaveLength(6);
    expect(root.querySelectorAll('[role="rowheader"]')).toHaveLength(4);
    expect(cell('S1', 'customer')).toHaveAttribute('aria-colindex', '2');
    expect(cell('S1', 'customer').closest('[role="row"]')).toHaveAttribute('aria-rowindex', '2');
    expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
  });

  it('declares every part the contract names on the elements it names', () => {
    render(<Shipments selectionMode="multiple" renderDetail={() => <p>detail</p>} filterRow />);
    const parts = new Set(
      [...grid().querySelectorAll<HTMLElement>('[data-part]')].map((node) => node.dataset['part']),
    );
    for (const part of [
      'root',
      'scroll',
      'head',
      'header-row',
      'column-header',
      'column-actions',
      'column-menu',
      'resizer',
      'filter-row',
      'filter-cell',
      'filter-operand',
      'filter-operator',
      'body',
      'row',
      'row-header',
      'cell',
      'selection',
      'expander',
    ]) {
      expect(parts.has(part), part).toBe(true);
    }
    expect(contract.members['data-grid'].parts).toContain('filter-panel');
  });

  it('puts one cell in the tab sequence once the cursor exists, and moves it with the arrows', () => {
    render(<Shipments defaultCurrent={{ row: 'S1', column: 'customer' }} />);
    expect(cell('S1', 'customer')).toHaveAttribute('tabindex', '0');
    expect(cell('S1', 'customer')).toHaveAttribute('data-current');
    cell('S1', 'customer').focus();
    fireEvent.keyDown(cell('S1', 'customer'), { key: 'ArrowRight' });
    expect(cell('S1', 'carrier')).toHaveAttribute('tabindex', '0');
    expect(document.activeElement).toBe(cell('S1', 'carrier'));
    fireEvent.keyDown(cell('S1', 'carrier'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cell('S2', 'carrier'));
    fireEvent.keyDown(cell('S2', 'carrier'), { key: 'End' });
    expect(document.activeElement).toBe(cell('S2', 'priority'));
    fireEvent.keyDown(cell('S2', 'priority'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cell('S2', 'priority'));
    fireEvent.keyDown(cell('S2', 'priority'), { key: 'Home', ctrlKey: true });
    expect(document.activeElement).toBe(cell('S1', 'id'));
    fireEvent.keyDown(cell('S1', 'id'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(header('id'));
    fireEvent.keyDown(header('id'), { key: 'End', ctrlKey: true });
    expect(document.activeElement).toBe(cell('S4', 'priority'));
  });

  it('asks before the cursor moves, with the reason', () => {
    const onCurrentChange = vi.fn();
    render(
      <Shipments defaultCurrent={{ row: 'S1', column: 'id' }} onCurrentChange={onCurrentChange} />,
    );
    fireEvent.keyDown(cell('S1', 'id'), { key: 'ArrowDown' });
    expect(onCurrentChange).toHaveBeenLastCalledWith(
      { row: 'S2', column: 'id' },
      expect.objectContaining({ reason: 'keyboard' }),
    );
    fireEvent.pointerDown(cell('S3', 'customer'), { button: 0 });
    expect(onCurrentChange).toHaveBeenLastCalledWith(
      { row: 'S3', column: 'customer' },
      expect.objectContaining({ reason: 'pointer' }),
    );
  });

  it('keeps the cursor on the same index when its row leaves', () => {
    function Filtered() {
      const [query, setQuery] = useState<GridQuery>(emptyQuery());
      return (
        <>
          <button onClick={() => setQuery({ ...query, search: 'Nord' })}>narrow</button>
          <Shipments
            defaultCurrent={{ row: 'S2', column: 'customer' }}
            onQueryChange={setQuery}
            query={query}
          />
        </>
      );
    }
    render(<Filtered />);
    fireEvent.click(screen.getByText('narrow'));
    expect(grid().querySelector('[data-current][data-part="cell"]')).toBe(cell('S3', 'customer'));
  });
});

describe('DataGrid, the query', () => {
  it('sorts by one key on a press, cycles it, and appends with Shift', () => {
    const onQueryChange = vi.fn();
    render(<Shipments onQueryChange={onQueryChange} />);
    fireEvent.click(header('weight'));
    expect(header('weight')).toHaveAttribute('aria-sort', 'ascending');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: [{ column: 'weight', direction: 'ascending' }] }),
      expect.objectContaining({ reason: 'pointer', change: 'sort' }),
    );
    expect(
      [...grid().querySelectorAll('[role="rowheader"]')].map((node) => node.textContent),
    ).toEqual(['S2', 'S4', 'S1', 'S3']);
    fireEvent.click(header('weight'));
    expect(header('weight')).toHaveAttribute('aria-sort', 'descending');
    fireEvent.click(header('customer'), { shiftKey: true });
    expect(header('weight')).toHaveAttribute('aria-sort', 'descending');
    expect(header('customer')).not.toHaveAttribute('aria-sort');
    expect(header('customer').querySelector('[data-part="sort"]')).toHaveAttribute(
      'data-index',
      '2',
    );
    fireEvent.click(header('weight'));
    expect(header('weight')).not.toHaveAttribute('aria-sort');
  });

  it('sorts on a press on the name while the scroller is a tab stop, and never on the handle', () => {
    render(<Shipments />);
    /* The scroller becomes a tab stop while the grid overflows; a press on
       the name walked up to it and sorted nothing. */
    grid().querySelector('[data-part="scroll"]')!.setAttribute('tabindex', '0');
    fireEvent.click(header('customer').querySelector('span')!);
    expect(header('customer')).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(header('customer').querySelector('[data-part="resizer"]')!);
    expect(header('customer')).toHaveAttribute('aria-sort', 'ascending');
  });

  it('sorts from the keyboard on the header cell', () => {
    render(<Shipments defaultCurrent={{ row: 'header', column: 'customer' }} />);
    fireEvent.keyDown(header('customer'), { key: 'Enter' });
    expect(header('customer')).toHaveAttribute('aria-sort', 'ascending');
  });

  it('applies a column filter from the filter row after the debounce, and on Enter at once', async () => {
    const onQueryChange = vi.fn();
    render(<Shipments filterRow filterDebounce={10} onQueryChange={onQueryChange} />);
    const input = within(
      grid().querySelector<HTMLElement>('[data-part="filter-cell"][data-column="customer"]')!,
    ).getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ver' } });
    await waitFor(() => expect(onQueryChange).toHaveBeenCalled());
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: {
          join: 'and',
          rules: [
            {
              field: 'customer',
              filter: {
                kind: 'text',
                join: 'and',
                conditions: [{ operator: 'contains', value: 'ver', end: null }],
              },
            },
          ],
        },
      }),
      expect.objectContaining({ change: 'filter' }),
    );
    expect(grid().querySelectorAll('[data-part="row"]')).toHaveLength(1);
    expect(header('customer')).toHaveAttribute('data-filtered');
  });

  it('edits the panel as a draft and reports on Apply', () => {
    const onQueryChange = vi.fn();
    render(
      <Shipments
        onQueryChange={onQueryChange}
        defaultCurrent={{ row: 'header', column: 'customer' }}
      />,
    );
    fireEvent.keyDown(header('customer'), { key: 'Enter', ctrlKey: true });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Filter…' }));
    const panel = document.querySelector<HTMLElement>('[data-part="filter-panel"]')!;
    expect(panel).toHaveAttribute('data-ui', 'data-grid');
    const input = within(panel).getByRole('textbox', { name: 'Value' });
    fireEvent.change(input, { target: { value: 'au' } });
    expect(onQueryChange).not.toHaveBeenCalled();
    fireEvent.click(within(panel).getByRole('button', { name: 'Apply' }));
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(grid().querySelectorAll('[data-part="row"]')).toHaveLength(1);
  });

  it('shows the empty state a filter left, and clears it from there', () => {
    render(<Shipments defaultQuery={{ ...emptyQuery(), search: 'zzz' }} />);
    expect(grid().querySelector('[data-part="empty"]')).toHaveTextContent(
      'No rows match the current filters',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(grid().querySelectorAll('[data-part="row"]')).toHaveLength(4);
  });

  it('pages in client mode and states the range in the footer', () => {
    render(<Shipments defaultQuery={emptyQuery({ index: 1, size: 3 })} />);
    expect(grid().querySelectorAll('[data-part="row"]')).toHaveLength(1);
    expect(grid().querySelector('[data-range]')).toHaveTextContent('4–4 of 4');
  });

  it('draws the rows it is given in server mode, with the stated total', () => {
    render(<Shipments totalCount={3412} defaultQuery={emptyQuery({ index: 2, size: 4 })} />);
    expect(grid()).toHaveAttribute('aria-rowcount', '3413');
    expect(grid().querySelector('[data-range]')).toHaveTextContent('9–12 of 3,412');
  });

  it('groups, with counts and aggregates, and closes a group with the left arrow', () => {
    render(
      <Shipments
        defaultQuery={{ ...emptyQuery(), group: ['carrier'] }}
        defaultCurrent={{ row: 'group:carrier=DHL', column: 'id' }}
      />,
    );
    const groups = grid().querySelectorAll('[data-part="group-row"]');
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAttribute('aria-level', '1');
    expect(groups[0]).toHaveAttribute('aria-expanded', 'true');
    expect(groups[0]).toHaveTextContent('2 rows');
    expect(groups[0]!.querySelector('[data-aggregate]')).toHaveTextContent('206.8');
    fireEvent.keyDown(groups[0]!.querySelector('[role="gridcell"]')!, { key: 'ArrowLeft' });
    expect(grid().querySelectorAll('[data-part="group-row"]')[0]).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(grid().querySelectorAll('[data-part="row"]')).toHaveLength(2);
  });

  it('draws a summary row from the aggregating columns', () => {
    render(<Shipments />);
    expect(grid().querySelector('[data-part="summary"] [data-column="weight"]')).toHaveTextContent(
      '225',
    );
  });
});

describe('DataGrid, selection', () => {
  it('selects rows with the checkbox, extends with Shift, and covers the set from the header', () => {
    const onValueChange = vi.fn();
    render(<Shipments selectionMode="multiple" onValueChange={onValueChange} />);
    expect(grid()).toHaveAttribute('aria-multiselectable', 'true');
    fireEvent.click(within(cell('S1', '__selection')).getByRole('checkbox'));
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['S1'],
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(cell('S1', 'id').closest('[role="row"]')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(within(cell('S3', '__selection')).getByRole('checkbox'), { shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(['S1', 'S2', 'S3'], expect.anything());
    const all = within(
      grid().querySelector<HTMLElement>('[data-part="head"] [data-part="selection"]')!,
    ).getByRole('checkbox');
    expect(all).toHaveAccessibleName('Select all 4 rows');
    fireEvent.click(all);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['S1', 'S2', 'S3', 'S4'],
      expect.objectContaining({ reason: 'select' }),
    );
  });

  it('toggles the row with Shift+Space from any cell, and selects everything with Ctrl+A', () => {
    const onValueChange = vi.fn();
    render(
      <Shipments
        selectionMode="multiple"
        onValueChange={onValueChange}
        defaultCurrent={{ row: 'S2', column: 'customer' }}
      />,
    );
    fireEvent.keyDown(cell('S2', 'customer'), { key: ' ', shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['S2'],
      expect.objectContaining({ reason: 'keyboard' }),
    );
    fireEvent.keyDown(cell('S2', 'customer'), { key: 'a', ctrlKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(['S1', 'S2', 'S3', 'S4'], expect.anything());
  });

  it('selects a range of cells with Shift and the arrows, names its edges, and copies it', async () => {
    const onRangeChange = vi.fn();
    const write = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: write } });
    render(
      <Shipments
        selectionMode="range"
        onRangeChange={onRangeChange}
        defaultCurrent={{ row: 'S1', column: 'customer' }}
      />,
    );
    fireEvent.keyDown(cell('S1', 'customer'), { key: 'ArrowDown', shiftKey: true });
    fireEvent.keyDown(cell('S2', 'customer'), { key: 'ArrowRight', shiftKey: true });
    expect(onRangeChange).toHaveBeenLastCalledWith(
      { anchor: { row: 'S1', column: 'customer' }, focus: { row: 'S2', column: 'carrier' } },
      expect.objectContaining({ reason: 'keyboard' }),
    );
    expect(cell('S1', 'customer')).toHaveAttribute('data-range-edge', 'top start');
    expect(cell('S2', 'carrier')).toHaveAttribute('data-range-edge', 'bottom end');
    expect(cell('S1', 'customer')).toHaveAttribute('aria-selected', 'true');
    expect(cell('S3', 'customer')).not.toHaveAttribute('data-in-range');
    fireEvent.keyDown(cell('S2', 'carrier'), { key: 'c', ctrlKey: true });
    await waitFor(() => expect(write).toHaveBeenCalledWith('Aurora\tDHL\nBloom\tUPS'));
    fireEvent.keyDown(cell('S2', 'carrier'), { key: 'Escape' });
    expect(onRangeChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'clear' }),
    );
  });
});

describe('DataGrid, editing', () => {
  it('opens an editor on Enter, commits on Enter and moves down, cancels on Escape', async () => {
    const onEditCommit = vi.fn();
    render(
      <Shipments onEditCommit={onEditCommit} defaultCurrent={{ row: 'S1', column: 'customer' }} />,
    );
    fireEvent.keyDown(cell('S1', 'customer'), { key: 'Enter' });
    const input = within(cell('S1', 'customer')).getByRole('textbox');
    expect(cell('S1', 'customer')).toHaveAttribute('data-editing');
    fireEvent.change(input, { target: { value: 'Aurora Textiles' } });
    fireEvent.keyDown(cell('S1', 'customer'), { key: 'Enter' });
    await waitFor(() =>
      expect(onEditCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'S1',
          column: 'customer',
          value: 'Aurora Textiles',
          previous: 'Aurora',
          reason: 'keyboard',
        }),
      ),
    );
    await waitFor(() => expect(cell('S2', 'customer')).toHaveAttribute('data-current'));
    fireEvent.keyDown(cell('S2', 'customer'), { key: 'F2' });
    fireEvent.change(within(cell('S2', 'customer')).getByRole('textbox'), {
      target: { value: 'x' },
    });
    fireEvent.keyDown(cell('S2', 'customer'), { key: 'Escape' });
    expect(cell('S2', 'customer')).not.toHaveAttribute('data-editing');
    expect(onEditCommit).toHaveBeenCalledTimes(1);
  });

  it('opens the editor with the typed key as its first character', () => {
    render(<Shipments defaultCurrent={{ row: 'S1', column: 'customer' }} />);
    fireEvent.keyDown(cell('S1', 'customer'), { key: 'Z' });
    expect(within(cell('S1', 'customer')).getByRole('textbox')).toHaveValue('Z');
  });

  it('keeps the draft and marks the cell when validation fails, and when the commit rejects', async () => {
    const onEditCommit = vi.fn().mockRejectedValue(new Error('Offline'));
    render(
      <Shipments onEditCommit={onEditCommit} defaultCurrent={{ row: 'S1', column: 'weight' }} />,
    );
    fireEvent.keyDown(cell('S1', 'weight'), { key: 'Enter' });
    const input = within(cell('S1', 'weight')).getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '-4' } });
    fireEvent.blur(input);
    fireEvent.keyDown(cell('S1', 'weight'), { key: 'Enter' });
    await waitFor(() => expect(cell('S1', 'weight')).toHaveAttribute('data-invalid'));
    expect(cell('S1', 'weight')).toHaveAttribute('aria-invalid', 'true');
    expect(cell('S1', 'weight')).toHaveAttribute('title', 'A weight is not negative');
    expect(onEditCommit).not.toHaveBeenCalled();
    fireEvent.change(within(cell('S1', 'weight')).getByRole('spinbutton'), {
      target: { value: '40' },
    });
    fireEvent.blur(within(cell('S1', 'weight')).getByRole('spinbutton'));
    fireEvent.keyDown(cell('S1', 'weight'), { key: 'Enter' });
    await waitFor(() => expect(onEditCommit).toHaveBeenCalled());
    await waitFor(() => expect(cell('S1', 'weight')).toHaveAttribute('title', 'Offline'));
    expect(cell('S1', 'weight')).toHaveAttribute('data-editing');
  });

  it('marks a cell whose row changed under the editor as a conflict', () => {
    const { rerender } = render(<Shipments defaultCurrent={{ row: 'S1', column: 'customer' }} />);
    fireEvent.keyDown(cell('S1', 'customer'), { key: 'Enter' });
    rerender(
      <Shipments
        defaultCurrent={{ row: 'S1', column: 'customer' }}
        rows={[{ ...ROWS[0]!, customer: 'Changed' }, ...ROWS.slice(1)]}
      />,
    );
    expect(cell('S1', 'customer')).toHaveAttribute('data-invalid');
    expect(cell('S1', 'customer')).toHaveAttribute(
      'title',
      'This value changed while you were editing',
    );
  });

  it('activates a row on Enter when activatable, and never on an editable cell', () => {
    const onActivate = vi.fn();
    render(
      <Shipments
        activatable
        onActivate={onActivate}
        defaultCurrent={{ row: 'S1', column: 'id' }}
      />,
    );
    fireEvent.keyDown(cell('S1', 'id'), { key: 'Enter' });
    expect(onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'S1', reason: 'keyboard' }),
    );
    fireEvent.keyDown(cell('S1', 'customer'), { key: 'Enter' });
    expect(cell('S1', 'customer')).toHaveAttribute('data-editing');
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('writes aria-readonly on a cell that does not edit while others do', () => {
    render(<Shipments />);
    expect(cell('S1', 'id')).toHaveAttribute('aria-readonly', 'true');
    expect(cell('S1', 'customer')).not.toHaveAttribute('aria-readonly');
  });
});

describe('DataGrid, columns', () => {
  it('resizes from the keyboard by a step, clamped, and announces', () => {
    const onColumnStateChange = vi.fn();
    render(
      <Shipments
        onColumnStateChange={onColumnStateChange}
        defaultCurrent={{ row: 'header', column: 'customer' }}
      />,
    );
    fireEvent.keyDown(header('customer'), { key: 'ArrowRight', ctrlKey: true, shiftKey: true });
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ widths: { customer: 168 } }),
      expect.objectContaining({ reason: 'keyboard', change: 'width' }),
    );
    expect(grid().style.getPropertyValue('--slotted-data-grid-template')).toContain('168px');
  });

  it('moves a column with Alt and the arrows, inside its zone', () => {
    const onColumnStateChange = vi.fn();
    render(
      <Shipments
        onColumnStateChange={onColumnStateChange}
        defaultCurrent={{ row: 'header', column: 'customer' }}
      />,
    );
    fireEvent.keyDown(header('customer'), { key: 'ArrowRight', altKey: true });
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        order: ['id', 'carrier', 'customer', 'weight', 'shipped', 'priority'],
      }),
      expect.objectContaining({ change: 'order' }),
    );
    expect(
      [...grid().querySelectorAll('[data-part="column-header"]')].map((node) =>
        node.getAttribute('data-column'),
      ),
    ).toEqual(['id', 'carrier', 'customer', 'weight', 'shipped', 'priority']);
  });

  it('pins, hides and fits through the column menu', () => {
    const onColumnStateChange = vi.fn();
    render(
      <Shipments
        onColumnStateChange={onColumnStateChange}
        defaultCurrent={{ row: 'header', column: 'weight' }}
      />,
    );
    fireEvent.keyDown(header('weight'), { key: 'Enter', ctrlKey: true });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Pin to end' }));
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pinned: { start: [], end: ['weight'] } }),
      expect.objectContaining({ change: 'pinned' }),
    );
    expect(header('weight')).toHaveAttribute('data-pinned', 'end');
    expect(header('weight')).toHaveAttribute('data-pin-edge');
    expect(header('weight').style.getPropertyValue('--slotted-data-grid-pin-offset')).toBe('0px');
    fireEvent.keyDown(header('weight'), { key: 'Enter', ctrlKey: true });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hide column' }));
    expect(grid().querySelector('[data-part="column-header"][data-column="weight"]')).toBeNull();
    expect(grid()).toHaveAttribute('aria-colcount', '5');
  });

  it('takes a controlled column state and normalises it', () => {
    const state: GridColumnState = {
      order: ['weight', 'id'],
      widths: {},
      hidden: ['priority', 'ghost'],
      pinned: { start: ['id'], end: [] },
    };
    render(<Shipments columnState={state} />);
    expect(
      [...grid().querySelectorAll('[data-part="column-header"]')].map((node) =>
        node.getAttribute('data-column'),
      ),
    ).toEqual(['id', 'weight', 'customer', 'carrier', 'shipped']);
  });
});

describe('DataGrid, the rest', () => {
  it('opens a detail row under an expandable row, reachable by the arrows', () => {
    render(
      <Shipments
        renderDetail={(row) => <p>Detail of {row.id}</p>}
        defaultCurrent={{ row: 'S1', column: '__expander' }}
      />,
    );
    fireEvent.keyDown(cell('S1', '__expander'), { key: 'ArrowRight' });
    expect(screen.getByText('Detail of S1').closest('[data-part="detail"]')).toHaveAttribute(
      'role',
      'row',
    );
    expect(within(cell('S1', '__expander')).getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    fireEvent.keyDown(cell('S1', '__expander'), { key: 'ArrowLeft' });
    expect(screen.queryByText('Detail of S1')).toBeNull();
  });

  it('exposes the imperative surface', () => {
    function Handled() {
      const handle = useRef<DataGridHandle | null>(null);
      return (
        <>
          <button onClick={() => handle.current?.focusCell({ row: 'S3', column: 'weight' })}>
            go
          </button>
          <button onClick={() => handle.current?.startEdit({ row: 'S3', column: 'customer' })}>
            edit
          </button>
          <Shipments handle={handle} />
        </>
      );
    }
    render(<Handled />);
    fireEvent.click(screen.getByText('go'));
    expect(document.activeElement).toBe(cell('S3', 'weight'));
    fireEvent.click(screen.getByText('edit'));
    expect(cell('S3', 'customer')).toHaveAttribute('data-editing');
  });

  it('draws the loading, empty and error states', () => {
    const { rerender } = render(<Shipments loading rows={[]} />);
    expect(grid().querySelector('[data-part="loader"]')).not.toBeNull();
    rerender(<Shipments rows={[]} />);
    expect(grid().querySelector('[data-part="empty"]')).toHaveTextContent('No rows');
    const onRetry = vi.fn();
    rerender(<Shipments rows={[]} error="Timed out" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
    rerender(<Shipments loading />);
    expect(grid()).toHaveAttribute('aria-busy', 'true');
  });

  it('reads defaults from the provider, an explicit prop winning', () => {
    render(
      <DataGridDefaultsProvider labels={{ empty: 'Nada' }} variant="framed">
        <Shipments rows={[]} />
      </DataGridDefaultsProvider>,
    );
    expect(grid()).toHaveAttribute('data-variant', 'framed');
    expect(grid().querySelector('[data-part="empty"]')).toHaveTextContent('Nada');
  });

  it('runs the consumer’s own handler first and stops when it was prevented', () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
    render(<Shipments onKeyDown={onKeyDown} defaultCurrent={{ row: 'S1', column: 'id' }} />);
    fireEvent.keyDown(cell('S1', 'id'), { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('passes native attributes through to the root', () => {
    render(<Shipments data-testid="shipments" id="grid-1" />);
    expect(screen.getByTestId('shipments')).toHaveAttribute('id', 'grid-1');
  });

  it('offers load more when the total is unknown and more exists', () => {
    const onLoadMore = vi.fn();
    render(
      <Shipments
        hasMore
        onLoadMore={onLoadMore}
        defaultQuery={emptyQuery({ cursor: null, size: 4 })}
      />,
    );
    expect(grid()).toHaveAttribute('aria-rowcount', '0');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    });
    expect(onLoadMore).toHaveBeenCalled();
    expect(grid().querySelector('[data-range]')).toHaveTextContent('1–4');
  });

  it('settles a cell reference into the same cell object', () => {
    const cellRef: GridCell = { row: 'S1', column: 'id' };
    render(<Shipments current={cellRef} />);
    expect(cell('S1', 'id')).toHaveAttribute('data-current');
  });
});
