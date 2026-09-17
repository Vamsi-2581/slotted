import type { GridColumn } from '@slotted/core/grid';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataGrid } from './data-grid';
import { usePersistedGridView, type GridViewStorage } from './use-persisted-grid-view';

interface Item {
  id: string;
  name: string;
  size: number;
}

const COLUMNS: GridColumn<Item>[] = [
  { id: 'id', label: 'Id', width: 80 },
  { id: 'name', label: 'Name', width: 160 },
  { id: 'size', label: 'Size', kind: 'number', width: 100 },
];
const ROWS: Item[] = [
  { id: 'a', name: 'Anvil', size: 3 },
  { id: 'b', name: 'Bolt', size: 1 },
  { id: 'c', name: 'Crate', size: 2 },
];

function memoryStorage(initial: Record<string, string> = {}): GridViewStorage & {
  readonly entries: Map<string, string>;
} {
  const entries = new Map(Object.entries(initial));
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => void entries.set(key, value),
    removeItem: (key) => void entries.delete(key),
  };
}

function Items({ storage }: { storage: GridViewStorage | null }) {
  const view = usePersistedGridView({
    key: 'items',
    columns: COLUMNS,
    storage,
    defaultQuery: { sort: [], filter: null, search: '', page: { index: 0, size: 2 }, group: [] },
  });
  return (
    <>
      <button onClick={view.reset}>reset</button>
      <DataGrid<Item> {...view} columns={COLUMNS} label="Items" rowKey="id" rows={ROWS} />
    </>
  );
}

const header = (column: string) =>
  screen
    .getByRole('grid')
    .querySelector<HTMLElement>(`[data-part="column-header"][data-column="${column}"]`)!;

describe('usePersistedGridView', () => {
  it('writes the view after a change, and reads it back on the next mount', () => {
    const storage = memoryStorage();
    const { unmount } = render(<Items storage={storage} />);
    expect(storage.entries.size).toBe(0);
    fireEvent.click(header('size'));
    expect(storage.entries.get('items')).toBe('sort=size%3Aasc&size=2');
    fireEvent.keyDown(header('size'), { key: 'Enter', ctrlKey: true });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hide column' }));
    expect(storage.entries.get('items')).toBe('sort=size%3Aasc&size=2&columns=h%3Dsize');
    unmount();

    render(<Items storage={storage} />);
    expect(header('name')).not.toHaveAttribute('aria-sort');
    expect(screen.getByRole('grid').querySelector('[data-column="size"]')).toBeNull();
    expect(screen.getByRole('grid')).toHaveAttribute('aria-colcount', '2');
  });

  it('drops a saved column the model no longer has, and keeps the default page when the entry has none', () => {
    const storage = memoryStorage({
      items: 'sort=size%3Adesc&columns=h%3Dsize%2Cgone%3Bw%3Dgone%3A30',
    });
    render(<Items storage={storage} />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-colcount', '2');
    expect(
      screen.getByRole('grid').querySelectorAll('[data-part="body"] > [data-part="row"]'),
    ).toHaveLength(2);
  });

  it('resets to the defaults and removes the entry', () => {
    const storage = memoryStorage({ items: 'sort=size%3Adesc&size=2' });
    render(<Items storage={storage} />);
    expect(header('size')).toHaveAttribute('aria-sort', 'descending');
    fireEvent.click(screen.getByText('reset'));
    expect(header('size')).not.toHaveAttribute('aria-sort');
    expect(storage.entries.has('items')).toBe(false);
  });

  it('lives in memory without a store, and when the store throws', () => {
    render(<Items storage={null} />);
    fireEvent.click(header('size'));
    expect(header('size')).toHaveAttribute('aria-sort', 'ascending');
    const throwing: GridViewStorage = {
      getItem: () => {
        throw new Error('refused');
      },
      setItem: () => {
        throw new Error('refused');
      },
      removeItem: () => undefined,
    };
    render(<Items storage={throwing} />);
    const grids = screen.getAllByRole('grid');
    const second = grids[1]!.querySelector<HTMLElement>(
      '[data-part="column-header"][data-column="size"]',
    )!;
    fireEvent.click(second);
    expect(second).toHaveAttribute('aria-sort', 'ascending');
  });
});
