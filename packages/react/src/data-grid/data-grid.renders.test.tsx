import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataGrid } from './data-grid';
import type { DataGridColumn } from './data-grid.types';

interface Entry {
  id: string;
  payee: string;
  amount: number;
}

const ROWS: Entry[] = Array.from({ length: 30 }, (_, index) => ({
  id: `E${index}`,
  payee: `Payee ${index}`,
  amount: index * 10,
}));

const COLUMNS: DataGridColumn<Entry>[] = [
  { id: 'payee', label: 'Payee', rowHeader: true },
  { id: 'amount', label: 'Amount', kind: 'number' },
];

/**
 * Every row re-rendered on each selection change and each scroll step: the row
 * is memoised, but it and its cells read the whole grid context, whose value
 * changes with the selection and the window.
 */
describe('DataGrid row renders', () => {
  it('re-renders only the row whose selection changed', () => {
    const rendered: string[] = [];
    render(
      <DataGrid<Entry>
        aria-label="Entries"
        cellRenderers={{
          payee: ({ row, text }) => {
            rendered.push(row.id);
            return <span>{text}</span>;
          },
        }}
        columns={COLUMNS}
        rowKey="id"
        rows={ROWS}
        selectionMode="multiple"
        virtualize={false}
      />,
    );
    rendered.length = 0;

    const checkbox = screen.getAllByRole('checkbox', { name: /Payee 3/ })[0]!;
    fireEvent.click(checkbox);

    expect(new Set(rendered)).toEqual(new Set(['E3']));
  });
});
