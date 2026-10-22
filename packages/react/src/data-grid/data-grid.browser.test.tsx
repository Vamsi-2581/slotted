import { act, render } from '@testing-library/react';
import { useState } from 'react';
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

/**
 * A grid without a height grows to its rows and an ancestor scrolls. Its own
 * scroller was as tall as its content, so the end of the rows was always
 * "within the threshold" and every page was requested at mount, with no
 * scroll at all. The next page is asked for when the end nears the visible
 * area of whatever scrolls.
 */
describe('DataGrid loading more inside a scrolling ancestor', () => {
  it('asks for one page at mount and one more after the ancestor scrolls to the end', async () => {
    let calls = 0;
    function Feed() {
      const [count, setCount] = useState(30);
      return (
        <div data-testid="ancestor" style={{ blockSize: 600, overflow: 'auto' }}>
          <DataGrid<Entry>
            aria-label="Entries"
            columns={COLUMNS}
            hasMore={count < 450}
            onLoadMore={() => {
              calls += 1;
              setCount((current) => current + 30);
            }}
            rowHeight={56}
            rowKey="id"
            rows={MANY.slice(0, count)}
          />
        </div>
      );
    }
    const { getByTestId } = render(<Feed />);
    for (let index = 0; index < 10; index += 1) await act(frame);
    expect(calls).toBeLessThanOrEqual(1);

    const before = calls;
    const ancestor = getByTestId('ancestor');
    ancestor.scrollTop = ancestor.scrollHeight;
    for (let index = 0; index < 10; index += 1) await act(frame);
    expect(calls).toBe(before + 1);
  });
});

const MANY: Entry[] = Array.from({ length: 450 }, (_, index) => ({
  id: `M${String(index)}`,
  payee: `Payee ${String(index)}`,
  amount: index,
}));
