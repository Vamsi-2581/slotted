import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '../button';
import { DataGrid } from './data-grid';
import type { DataGridColumn } from './data-grid.types';

interface Entry {
  id: string;
  payee: string;
  amount: number;
}

const ROWS: Entry[] = Array.from({ length: 200 }, (_, index) => ({
  id: `E${String(index)}`,
  payee: `Payee ${String(index)}`,
  amount: index * 10,
}));

const COLUMNS: DataGridColumn<Entry>[] = [
  { id: 'payee', label: 'Payee', rowHeader: true },
  { id: 'amount', label: 'Amount', kind: 'number' },
];

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * A scroll step re-rendered every row of the window: the window range is part
 * of the grid's state, and every row read the whole grid context. A step that
 * moves the window by one row renders the row that enters it, and the row that
 * leaves it at most.
 */
describe('DataGrid scrolling', () => {
  it('renders at most two rows when the window moves by one row', async () => {
    const rendered: string[] = [];
    const { container } = render(
      <DataGrid<Entry>
        aria-label="Entries"
        cellRenderers={{
          payee: ({ row, text }) => {
            rendered.push(row.id);
            return <span>{text}</span>;
          },
        }}
        columns={COLUMNS}
        height={400}
        rowHeight={40}
        rowKey="id"
        rows={ROWS}
        selectionMode="multiple"
      />,
    );
    await frame();
    await frame();
    const scroller = container.querySelector<HTMLElement>('[data-part="scroll"]')!;
    rendered.length = 0;

    scroller.scrollTop = 40;
    scroller.dispatchEvent(new Event('scroll'));
    await frame();
    await frame();

    expect(rendered.length).toBeGreaterThan(0);
    expect(new Set(rendered).size).toBeLessThanOrEqual(2);
  });
});

/**
 * A control a cell renderer draws stood as tall as the row, and its hover
 * ground covered the cursor's trace: the button seemed to jump out of the cell.
 * The row restates the control scale so the control stands inside the trace.
 */
describe('DataGrid cursor around a control', () => {
  it('keeps a small ghost button inside the current cell’s ring on all four sides', async () => {
    const { container } = render(
      <DataGrid<Entry>
        aria-label="Entries"
        cellRenderers={{
          payee: ({ text }) => (
            <Button size="sm" variant="ghost">
              {text}
            </Button>
          ),
        }}
        columns={COLUMNS}
        defaultCurrent={{ row: 'E1', column: 'payee' }}
        rowKey="id"
        rows={ROWS.slice(0, 5)}
        virtualize={false}
      />,
    );
    await frame();
    const cell = container.querySelector('[data-row="E1"] [data-column="payee"]') as HTMLElement;
    const button = cell.querySelector('[data-ui="button"]') as HTMLElement;
    expect(cell).toHaveAttribute('data-current');
    /* `--slotted-focus-ring-width`, the trace's width. */
    const ring = 2;
    const outer = cell.getBoundingClientRect();
    const inner = button.getBoundingClientRect();

    expect(inner.top).toBeGreaterThanOrEqual(outer.top + ring);
    expect(inner.bottom).toBeLessThanOrEqual(outer.bottom - ring);
    expect(inner.left).toBeGreaterThanOrEqual(outer.left + ring);
    expect(inner.right).toBeLessThanOrEqual(outer.right - ring);
  });
});
