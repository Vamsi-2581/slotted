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

/**
 * Rows read again stay on screen and refuse the press. The refusal is a veil
 * over the body rather than an inherited `pointer-events`, so the point a
 * reader presses lands on the body, not on the cell under it.
 */
describe('a grid reading its rows again', () => {
  it('refuses a press on a row while it is busy', () => {
    const { rerender } = render(
      <DataGrid<Entry>
        aria-label="Entries"
        columns={COLUMNS}
        rowKey="id"
        rows={ROWS.slice(0, 5)}
      />,
    );
    const cell = document.querySelector('[data-part="body"] [role="gridcell"]') as HTMLElement;
    const box = cell.getBoundingClientRect();
    const centre = () => document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    expect(cell.contains(centre())).toBe(true);

    rerender(
      <DataGrid<Entry>
        aria-label="Entries"
        columns={COLUMNS}
        loading
        rowKey="id"
        rows={ROWS.slice(0, 5)}
      />,
    );
    expect(cell.contains(centre())).toBe(false);
  });
});

/**
 * A template that fits the frame scrolls nothing. The last column's resizer
 * is held inside the row, but the rule found it as the row's last child, and
 * with columns that yield to the frame the pop-in header comes after it: half
 * a resizer hung past the template, twelve pixels of horizontal scroll.
 */
describe('DataGrid with a template that fits its frame', () => {
  it('has no horizontal overflow', async () => {
    const { container } = render(
      <div style={{ inlineSize: 372 }}>
        <DataGrid<Entry>
          aria-label="Entries"
          columns={[
            { id: 'date', label: 'Date', accessor: () => '2026-10-22', width: 104 },
            { id: 'payee', label: 'Payee', rowHeader: true, flex: 2, minWidth: 150 },
            {
              id: 'category',
              label: 'Category',
              accessor: () => 'Food',
              flex: 1,
              minWidth: 160,
              maxWidth: 280,
              priority: 2,
            },
            {
              id: 'tags',
              label: 'Tags',
              accessor: () => 'a, b',
              width: 160,
              priority: 5,
              popin: false,
            },
            { id: 'amount', label: 'Amount', kind: 'number', width: 148, priority: 1 },
          ]}
          defaultColumnState={{ hidden: ['date'] }}
          rowKey="id"
          rows={ROWS.slice(0, 5)}
          selectionMode="multiple"
          virtualize={false}
        />
      </div>,
    );
    await frame();
    await frame();
    const scroller = container.querySelector('[data-part="scroll"]') as HTMLElement;
    expect(scroller.scrollWidth - scroller.clientWidth).toBe(0);
  });
});
