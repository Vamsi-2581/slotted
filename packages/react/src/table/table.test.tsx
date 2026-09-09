import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/table/contract.json';
import { Table } from './table';
import { TableContent } from './table-content';
import { TableDefaultsProvider } from './table-defaults';
import {
  TableBody,
  TableCaption,
  TableCell,
  TableColumnHeader,
  TableDetail,
  TableExpander,
  TableHead,
  TableRow,
  TableRowHeader,
  TableSelect,
  TableSelectAll,
  TableSort,
} from './table-parts';
import type { TableProps, TableSortDescriptor } from './table.types';

const ROWS = [
  { amount: '1,240.00', client: 'Northwind Trading', id: 'INV-1042' },
  { amount: '18.50', client: 'Cascade Logistics', id: 'INV-1043' },
  { amount: '9,802.75', client: 'Bright Harbor', id: 'INV-1044' },
];

function Invoices({
  disabledRow,
  ...props
}: Partial<TableProps> & { disabledRow?: string | undefined }) {
  return (
    <Table columns={4} {...props}>
      <TableContent>
        <TableCaption>Invoices</TableCaption>
        <TableHead>
          <TableRow>
            <TableSelectAll />
            <TableColumnHeader column="invoice">
              <TableSort>Invoice</TableSort>
            </TableColumnHeader>
            <TableColumnHeader column="client">
              <TableSort>Client</TableSort>
            </TableColumnHeader>
            <TableColumnHeader numeric>Amount</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow disabled={row.id === disabledRow} key={row.id} value={row.id}>
              <TableSelect />
              <TableRowHeader>{row.id}</TableRowHeader>
              <TableCell>{row.client}</TableCell>
              <TableCell numeric>{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}

/**
 * The APG is explicit: a table "is not an interactive widget", and every role
 * the structure needs is what the platform's own elements carry. A family that
 * wrote one by hand would restate what the browser states and drift from it.
 */
describe('the structure', () => {
  it('takes every role from the platform and writes none', () => {
    render(<Invoices />);

    const table = screen.getByRole('table');
    expect(table.tagName).toBe('TABLE');
    expect(table).not.toHaveAttribute('role');
    expect(table.closest('[data-ui="table"]')).toHaveAttribute('data-part', 'root');
    expect(screen.getAllByRole('rowgroup').length).toBeGreaterThan(1);
  });

  it('names the table by its caption, without an authored reference', () => {
    render(<Invoices />);

    expect(screen.getByRole('table', { name: 'Invoices' })).not.toHaveAttribute('aria-labelledby');
  });

  it('scopes a column header to its column and a row header to its row', () => {
    render(<Invoices />);

    expect(screen.getByText('Client').closest('th')).toHaveAttribute('scope', 'col');
    expect(screen.getByText('INV-1042')).toHaveAttribute('scope', 'row');
  });

  it('holds alignment and numerals apart', () => {
    render(<Invoices />);

    const amount = screen.getByText('1,240.00');
    expect(amount).toHaveAttribute('data-numeric', '');
    expect(amount).not.toHaveAttribute('data-align');
  });
});

describe('sorting', () => {
  it('cycles ascending, descending, then none', () => {
    const onSortChange = vi.fn();
    render(<Invoices onSortChange={onSortChange} />);

    const trigger = screen.getByRole('button', { name: 'Client' });
    const header = trigger.closest('th') as HTMLElement;

    fireEvent.click(trigger);
    expect(header).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(trigger);
    expect(header).toHaveAttribute('aria-sort', 'descending');

    fireEvent.click(trigger);
    expect(header).not.toHaveAttribute('aria-sort');

    expect(onSortChange.mock.calls.map(([value]) => value)).toEqual([
      { column: 'client', direction: 'ascending' },
      { column: 'client', direction: 'descending' },
      null,
    ]);
  });

  /**
   * ARIA has no way to say which sort key came first, so a second sorted column
   * would be silent or a lie. Sorting a new column moves the property with it.
   */
  it('writes the property on the sorted header and on no other', () => {
    render(<Invoices />);

    fireEvent.click(screen.getByRole('button', { name: 'Client' }));
    fireEvent.click(screen.getByRole('button', { name: 'Invoice' }));

    const sorted = screen
      .getAllByRole('columnheader')
      .filter((cell) => cell.hasAttribute('aria-sort'));
    expect(sorted).toHaveLength(1);
    expect(sorted[0]?.textContent).toBe('Invoice');
  });

  it('says the column and the direction out loud', async () => {
    render(<Invoices />);

    fireEvent.click(screen.getByRole('button', { name: 'Client' }));

    /* The announcer queues, so the message lands a frame later. */
    await waitFor(() => expect(document.body.textContent).toContain('Client, sorted ascending'));
  });

  /** A controlled table reports and waits: it never moves its own value. */
  it('leaves a controlled descriptor to the consumer', () => {
    const onSortChange = vi.fn();
    const sort: TableSortDescriptor = { column: 'client', direction: 'ascending' };
    render(<Invoices onSortChange={onSortChange} sort={sort} />);

    fireEvent.click(screen.getByRole('button', { name: 'Client' }));

    expect(onSortChange).toHaveBeenCalledWith(
      { column: 'client', direction: 'descending' },
      expect.anything(),
    );
    expect(screen.getByRole('button', { name: 'Client' }).closest('th')).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });

  it('runs the consumer own handler first, and stops when it refuses', () => {
    const onSortChange = vi.fn();
    render(
      <Table columns={1} onSortChange={onSortChange}>
        <TableContent>
          <TableHead>
            <TableRow>
              <TableColumnHeader column="client">
                <TableSort onClick={(event) => event.preventDefault()}>Client</TableSort>
              </TableColumnHeader>
            </TableRow>
          </TableHead>
          <TableBody />
        </TableContent>
      </Table>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Client' }));
    expect(onSortChange).not.toHaveBeenCalled();
  });
});

describe('selection', () => {
  /**
   * A row is not selectable under the `table` role, so the state is painted on
   * the row and announced by the checkbox that owns it.
   */
  it('paints the row and writes no aria-selected', () => {
    render(<Invoices selectionMode="multiple" />);

    fireEvent.click(screen.getByRole('checkbox', { name: /INV-1042/ }));

    const row = screen.getByText('INV-1042').closest('tr') as HTMLElement;
    expect(row).toHaveAttribute('data-selected', '');
    expect(row).not.toHaveAttribute('aria-selected');
  });

  it('selects a range from the anchor when Shift is held', () => {
    const onValueChange = vi.fn();
    render(<Invoices onValueChange={onValueChange} selectionMode="multiple" />);

    fireEvent.click(screen.getByRole('checkbox', { name: /INV-1042/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /INV-1044/ }), { shiftKey: true });

    expect(onValueChange).toHaveBeenLastCalledWith(
      ['INV-1042', 'INV-1043', 'INV-1044'],
      expect.anything(),
    );
  });

  it('covers the rows in the DOM with the header checkbox, and says how many', () => {
    render(<Invoices selectionMode="multiple" />);

    const all = screen.getByRole('checkbox', { name: /Select all rows/ });
    fireEvent.click(all);
    expect(
      screen.getAllByRole('row').filter((row) => row.hasAttribute('data-selected')),
    ).toHaveLength(3);

    fireEvent.click(screen.getByRole('checkbox', { name: /INV-1043/ }));
    /* The state is painted on the checkbox's own root, which is the element
       that draws the bar; the input carries the property the platform holds. */
    const header = screen.getByRole('checkbox', { name: /2 selected/ }) as HTMLInputElement;
    expect(header.closest('[data-ui="checkbox"]')).toHaveAttribute('data-indeterminate', '');
  });

  it('leaves a disabled row out of the set the header covers', () => {
    render(<Invoices disabledRow="INV-1043" selectionMode="multiple" />);

    fireEvent.click(screen.getByRole('checkbox', { name: /Select all rows/ }));

    expect(
      screen.getAllByRole('row').filter((row) => row.hasAttribute('data-selected')),
    ).toHaveLength(2);
  });
});

describe('expansion', () => {
  function Expandable() {
    return (
      <Table columns={2}>
        <TableContent>
          <TableHead>
            <TableRow>
              <TableColumnHeader>Invoice</TableColumnHeader>
              <TableColumnHeader>Client</TableColumnHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow value="INV-1042">
              <TableCell>
                <TableExpander />
              </TableCell>
              <TableRowHeader>INV-1042</TableRowHeader>
            </TableRow>
            <TableDetail value="INV-1042">Two reminders sent.</TableDetail>
          </TableBody>
        </TableContent>
      </Table>
    );
  }

  it('renders nothing while it is closed, and says so', () => {
    render(<Expandable />);

    const expander = screen.getByRole('button');
    expect(expander).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Two reminders sent.')).toBeNull();

    fireEvent.click(expander);
    expect(expander).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Two reminders sent.')).toBeInTheDocument();
    expect(document.getElementById(expander.getAttribute('aria-controls') ?? '')).toHaveAttribute(
      'data-part',
      'detail',
    );
  });
});

describe('the size of a set the DOM does not hold', () => {
  it('writes the pair only when the consumer states a total', () => {
    const { rerender } = render(<Invoices />);
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-rowcount');

    rerender(
      <Table columns={1}>
        <TableContent totalRowCount={128}>
          <TableBody>
            <TableRow rowIndex={41} value="INV-1042">
              <TableCell>Northwind Trading</TableCell>
            </TableRow>
          </TableBody>
        </TableContent>
      </Table>,
    );

    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '128');
    expect(screen.getByRole('row')).toHaveAttribute('aria-rowindex', '41');
  });
});

describe('the scrolling region', () => {
  /**
   * `jsdom` lays nothing out: every element measures zero, so a scroller is
   * whatever the test says it is.
   */
  function measure(element: Element, { client, scroll }: { client: number; scroll: number }) {
    Object.defineProperty(element, 'clientWidth', { configurable: true, value: client });
    Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scroll });
  }

  it('takes a tab stop only while the table overflows', () => {
    const { container, rerender } = render(<Invoices />);
    const scroll = container.querySelector('[data-part="scroll"]') as HTMLElement;

    expect(scroll).not.toHaveAttribute('tabindex');
    expect(scroll).not.toHaveAttribute('role');

    measure(scroll, { client: 320, scroll: 900 });
    rerender(<Invoices striped />);
    fireEvent.scroll(scroll);

    expect(scroll).toHaveAttribute('role', 'region');
    expect(scroll).toHaveAttribute('tabindex', '0');
    expect(scroll).toHaveAttribute('data-overflowing', '');
    expect(scroll).toHaveAccessibleName('Table, scrollable');
  });
});

describe('an application setting the family once', () => {
  it('is overridden by a table that states the axis itself', () => {
    render(
      <TableDefaultsProvider labels={{ scroll: 'Tabela rolável' }} variant="plain">
        <Invoices />
        <Invoices variant="framed" />
      </TableDefaultsProvider>,
    );

    const [plain, framed] = screen.getAllByRole('table').map((table) => table.closest('[data-ui]'));
    expect(plain).toHaveAttribute('data-variant', 'plain');
    expect(framed).toHaveAttribute('data-variant', 'framed');
  });
});

describe('the contract', () => {
  it('renders every part the contract declares', () => {
    const { container } = render(<Invoices selectionMode="multiple" />);
    const rendered = new Set(
      [...container.querySelectorAll('[data-part]')].map((node) => node.getAttribute('data-part')),
    );

    for (const part of [
      'root',
      'scroll',
      'table',
      'caption',
      'head',
      'body',
      'row',
      'column-header',
      'row-header',
      'cell',
      'sort',
      'selection',
    ]) {
      expect(rendered.has(part), part).toBe(true);
    }
    expect(contract.members.table.parts).toContain('footer');
  });
});
