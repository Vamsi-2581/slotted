import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  GridCell,
  GridColumn,
  GridColumnState,
  GridQuery,
  GridRange,
} from '@slotted/core/grid';
import { emptyQuery } from '@slotted/core/grid';
import type { ChangeRequest } from '@slotted/core/state';
import contract from '../../../../specs/components/data-grid/contract.json';
import { SlDataGrid } from './data-grid';
import { provideDataGridDefaults } from './data-grid-defaults';
import type {
  DataGridActivateEvent,
  DataGridColumnStateRequest,
  DataGridEditCommit,
  DataGridQueryRequest,
  DataGridSelection,
  DataGridSelectionMode,
} from './data-grid-defaults';
import { SlDataGridDetailTemplate } from './data-grid-templates';

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

@Component({
  standalone: true,
  imports: [SlDataGrid, SlDataGridDetailTemplate],
  template: `
    <sl-data-grid
      id="grid-1"
      label="Shipments"
      rowKey="id"
      [rows]="rows()"
      [columns]="columns"
      [selectionMode]="selectionMode()"
      [filterRow]="filterRow()"
      [filterDebounce]="10"
      [rowHeight]="rowHeight()"
      [activatable]="activatable()"
      [loading]="loading()"
      [error]="error()"
      [totalCount]="totalCount()"
      [hasMore]="hasMore()"
      [(query)]="query"
      [(columnState)]="columnState"
      [(value)]="value"
      [(range)]="range"
      [(current)]="current"
      (queryChangeRequest)="queryRequests.push($event)"
      (columnStateChangeRequest)="stateRequests.push($event)"
      (valueChangeRequest)="valueRequests.push($event)"
      (rangeChangeRequest)="rangeRequests.push($event)"
      (currentChangeRequest)="currentRequests.push($event)"
      (editCommit)="onCommit($event)"
      (activate)="activations.push($event)"
      (retry)="retries = retries + 1"
      (loadMore)="loads = loads + 1"
    >
      @if (detail()) {
        <ng-template slDataGridDetail let-row>
          <p>Detail of {{ row.id }}</p>
        </ng-template>
      }
    </sl-data-grid>
  `,
})
class Host {
  readonly grid = viewChild.required(SlDataGrid);
  readonly columns = COLUMNS;
  readonly rows = signal<readonly Shipment[]>(ROWS);
  readonly rowHeight = signal<number | 'auto' | undefined>(undefined);
  readonly selectionMode = signal<DataGridSelectionMode>('none');
  readonly filterRow = signal(false);
  readonly activatable = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null | undefined>(undefined);
  readonly totalCount = signal<number | undefined>(undefined);
  readonly hasMore = signal<boolean | undefined>(undefined);
  readonly detail = signal(false);
  readonly query = signal<GridQuery>(emptyQuery());
  readonly columnState = signal<Partial<GridColumnState> | undefined>(undefined);
  readonly value = signal<DataGridSelection>(null);
  readonly range = signal<GridRange | null>(null);
  readonly current = signal<GridCell | null>(null);
  readonly queryRequests: DataGridQueryRequest[] = [];
  readonly stateRequests: DataGridColumnStateRequest[] = [];
  readonly valueRequests: ChangeRequest<DataGridSelection>[] = [];
  readonly rangeRequests: ChangeRequest<GridRange | null>[] = [];
  readonly currentRequests: ChangeRequest<GridCell | null>[] = [];
  readonly commits: DataGridEditCommit<Shipment>[] = [];
  readonly activations: DataGridActivateEvent[] = [];
  retries = 0;
  loads = 0;
  commitOutcome: Promise<void> | null = null;

  onCommit(commit: DataGridEditCommit<Shipment>) {
    this.commits.push(commit);
    if (this.commitOutcome) commit.wait(this.commitOutcome);
  }
}

describe('SlDataGrid', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const root = () => fixture.nativeElement.querySelector('[role="grid"]') as HTMLElement;
  const cell = (row: string, column: string) =>
    root().querySelector<HTMLElement>(`[data-row="${row}"] [data-column="${column}"]`)!;
  const header = (column: string) =>
    root().querySelector<HTMLElement>(`[data-part="column-header"][data-column="${column}"]`)!;
  const press = (target: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
    );
    fixture.detectChanges();
  };
  const type = (input: HTMLInputElement, text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };
  const menuItem = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
      (item) => item.textContent?.trim() === name,
    )!;
  const settle = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is a grid of rows and cells, with every count written', () => {
    expect(root().getAttribute('data-ui')).toBe('data-grid');
    expect(root().getAttribute('aria-label')).toBe('Shipments');
    expect(root().getAttribute('id')).toBe('grid-1');
    expect(root().getAttribute('aria-colcount')).toBe('6');
    expect(root().getAttribute('aria-rowcount')).toBe('6');
    expect(root().querySelectorAll('[role="rowgroup"]')).toHaveLength(3);
    expect(root().querySelectorAll('[role="columnheader"]')).toHaveLength(6);
    expect(root().querySelectorAll('[role="rowheader"]')).toHaveLength(4);
    expect(cell('S1', 'customer').getAttribute('aria-colindex')).toBe('2');
    expect(cell('S1', 'customer').closest('[role="row"]')!.getAttribute('aria-rowindex')).toBe('2');
    /* One tab stop always: the header's first cell until the reader has been anywhere. */
    const stops = root().querySelectorAll('[tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(header('id'));
  });

  it('declares every part the contract names on the elements it names', () => {
    host.selectionMode.set('multiple');
    host.filterRow.set(true);
    host.detail.set(true);
    fixture.detectChanges();
    const parts = new Set(
      [...root().querySelectorAll<HTMLElement>('[data-part]')].map((node) => node.dataset['part']),
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
    host.current.set({ row: 'S1', column: 'customer' });
    fixture.detectChanges();
    expect(cell('S1', 'customer').getAttribute('tabindex')).toBe('0');
    expect(cell('S1', 'customer').hasAttribute('data-current')).toBe(true);
    cell('S1', 'customer').focus();
    press(cell('S1', 'customer'), 'ArrowRight');
    expect(cell('S1', 'carrier').getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(cell('S1', 'carrier'));
    press(cell('S1', 'carrier'), 'ArrowDown');
    expect(document.activeElement).toBe(cell('S2', 'carrier'));
    press(cell('S2', 'carrier'), 'End');
    expect(document.activeElement).toBe(cell('S2', 'priority'));
    press(cell('S2', 'priority'), 'Home', { ctrlKey: true });
    expect(document.activeElement).toBe(cell('S1', 'id'));
    press(cell('S1', 'id'), 'ArrowUp');
    expect(document.activeElement).toBe(header('id'));
    press(header('id'), 'End', { ctrlKey: true });
    expect(document.activeElement).toBe(cell('S4', 'priority'));
  });

  it('asks before the cursor moves, with the reason', () => {
    host.current.set({ row: 'S1', column: 'id' });
    fixture.detectChanges();
    press(cell('S1', 'id'), 'ArrowDown');
    expect(host.currentRequests.at(-1)).toMatchObject({
      value: { row: 'S2', column: 'id' },
      reason: 'keyboard',
    });
    cell('S3', 'customer').dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, bubbles: true }),
    );
    fixture.detectChanges();
    expect(host.currentRequests.at(-1)).toMatchObject({
      value: { row: 'S3', column: 'customer' },
      reason: 'pointer',
    });
    expect(host.current()).toEqual({ row: 'S3', column: 'customer' });
  });

  it('keeps the cursor on the same index when its row leaves', () => {
    host.current.set({ row: 'S2', column: 'customer' });
    fixture.detectChanges();
    host.query.set({ ...emptyQuery(), search: 'Nord' });
    fixture.detectChanges();
    expect(root().querySelector('[data-current][data-part="cell"]')).toBe(cell('S3', 'customer'));
  });

  it('sorts by one key on a press, cycles it, and appends with Shift', () => {
    header('weight').click();
    fixture.detectChanges();
    expect(header('weight').getAttribute('aria-sort')).toBe('ascending');
    expect(host.queryRequests.at(-1)).toMatchObject({
      value: { sort: [{ column: 'weight', direction: 'ascending' }] },
      reason: 'pointer',
      change: 'sort',
    });
    expect(
      [...root().querySelectorAll('[role="rowheader"]')].map((node) => node.textContent?.trim()),
    ).toEqual(['S2', 'S4', 'S1', 'S3']);
    header('weight').click();
    fixture.detectChanges();
    expect(header('weight').getAttribute('aria-sort')).toBe('descending');
    header('customer').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();
    expect(header('weight').getAttribute('aria-sort')).toBe('descending');
    expect(header('customer').hasAttribute('aria-sort')).toBe(false);
    expect(header('customer').querySelector('[data-part="sort"]')!.getAttribute('data-index')).toBe(
      '2',
    );
    header('weight').click();
    fixture.detectChanges();
    expect(header('weight').hasAttribute('aria-sort')).toBe(false);
  });

  it('sorts on a press on the name while the scroller is a tab stop, and never on the handle', () => {
    root().querySelector('[data-part="scroll"]')!.setAttribute('tabindex', '0');
    header('customer').querySelector('span')!.click();
    fixture.detectChanges();
    expect(header('customer').getAttribute('aria-sort')).toBe('ascending');
    header('customer').querySelector<HTMLElement>('[data-part="resizer"]')!.click();
    fixture.detectChanges();
    expect(header('customer').getAttribute('aria-sort')).toBe('ascending');
  });

  it('sorts from the keyboard on the header cell', () => {
    host.current.set({ row: 'header', column: 'customer' });
    fixture.detectChanges();
    press(header('customer'), 'Enter');
    expect(header('customer').getAttribute('aria-sort')).toBe('ascending');
  });

  it('applies a column filter from the filter row after the debounce', async () => {
    host.filterRow.set(true);
    fixture.detectChanges();
    const input = root().querySelector<HTMLInputElement>(
      '[data-part="filter-cell"][data-column="customer"] input',
    )!;
    type(input, 'ver');
    expect(host.queryRequests).toHaveLength(0);
    await new Promise((resolve) => setTimeout(resolve, 30));
    fixture.detectChanges();
    expect(host.queryRequests.at(-1)).toMatchObject({
      change: 'filter',
      value: {
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
      },
    });
    expect(root().querySelectorAll('[data-part="row"]')).toHaveLength(1);
    expect(header('customer').hasAttribute('data-filtered')).toBe(true);
  });

  it('edits the panel as a draft and reports on Apply', async () => {
    host.current.set({ row: 'header', column: 'customer' });
    fixture.detectChanges();
    press(header('customer'), 'Enter', { ctrlKey: true });
    await settle();
    menuItem('Filter…').click();
    await settle();
    const panel = document.querySelector<HTMLElement>('[data-part="filter-panel"]')!;
    expect(panel.getAttribute('data-ui')).toBe('data-grid');
    const input = panel.querySelector<HTMLInputElement>('[data-part="filter-operand"] input')!;
    type(input, 'au');
    expect(host.queryRequests).toHaveLength(0);
    [...panel.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Apply')!
      .click();
    await settle();
    expect(host.queryRequests).toHaveLength(1);
    expect(root().querySelectorAll('[data-part="row"]')).toHaveLength(1);
  });

  it('shows the empty state a filter left, and clears it from there', () => {
    host.query.set({ ...emptyQuery(), search: 'zzz' });
    fixture.detectChanges();
    expect(root().querySelector('[data-part="empty"]')!.textContent).toContain(
      'No rows match the current filters',
    );
    [...root().querySelectorAll<HTMLButtonElement>('[data-part="empty"] button')]
      .find((button) => button.textContent?.trim() === 'Clear filters')!
      .click();
    fixture.detectChanges();
    expect(root().querySelectorAll('[data-part="row"]')).toHaveLength(4);
  });

  it('pages in client mode and states the range in the footer', () => {
    host.query.set(emptyQuery({ index: 1, size: 3 }));
    fixture.detectChanges();
    expect(root().querySelectorAll('[data-part="row"]')).toHaveLength(1);
    expect(root().querySelector('[data-range]')!.textContent).toContain('4–4 of 4');
  });

  it('draws the rows it is given in server mode, with the stated total', () => {
    host.totalCount.set(3412);
    host.query.set(emptyQuery({ index: 2, size: 4 }));
    fixture.detectChanges();
    expect(root().getAttribute('aria-rowcount')).toBe('3413');
    expect(root().querySelector('[data-range]')!.textContent).toContain('9–12 of 3,412');
  });

  it('groups, with counts and aggregates, and closes a group with the left arrow', () => {
    host.query.set({ ...emptyQuery(), group: ['carrier'] });
    host.current.set({ row: 'group:carrier=DHL', column: 'id' });
    fixture.detectChanges();
    const groups = root().querySelectorAll('[data-part="group-row"]');
    expect(groups).toHaveLength(3);
    expect(groups[0]!.getAttribute('aria-level')).toBe('1');
    expect(groups[0]!.getAttribute('aria-expanded')).toBe('true');
    expect(groups[0]!.textContent).toContain('2 rows');
    expect(groups[0]!.querySelector('[data-aggregate]')!.textContent).toContain('206.8');
    press(groups[0]!.querySelector<HTMLElement>('[role="gridcell"]')!, 'ArrowLeft');
    expect(
      root().querySelectorAll('[data-part="group-row"]')[0]!.getAttribute('aria-expanded'),
    ).toBe('false');
    expect(root().querySelectorAll('[data-part="row"]')).toHaveLength(2);
  });

  it('draws a summary row from the aggregating columns', () => {
    expect(
      root().querySelector('[data-part="summary"] [data-column="weight"]')!.textContent,
    ).toContain('225');
  });

  it('selects rows with the checkbox, extends with Shift, and covers the set from the header', () => {
    host.selectionMode.set('multiple');
    fixture.detectChanges();
    expect(root().getAttribute('aria-multiselectable')).toBe('true');
    cell('S1', '__selection').querySelector<HTMLInputElement>('input')!.click();
    fixture.detectChanges();
    expect(host.valueRequests.at(-1)).toMatchObject({ value: ['S1'], reason: 'pointer' });
    expect(cell('S1', 'id').closest('[role="row"]')!.getAttribute('aria-selected')).toBe('true');
    cell('S3', '__selection')
      .querySelector<HTMLInputElement>('input')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();
    expect(host.value()).toEqual(['S1', 'S2', 'S3']);
    const all = root().querySelector<HTMLElement>('[data-part="head"] [data-part="selection"]')!;
    expect(all.textContent).toContain('Select all 4 rows');
    all.querySelector<HTMLInputElement>('input')!.click();
    fixture.detectChanges();
    expect(host.valueRequests.at(-1)).toMatchObject({
      value: ['S1', 'S2', 'S3', 'S4'],
      reason: 'select',
    });
  });

  it('toggles the row with Shift+Space from any cell, and selects everything with Ctrl+A', () => {
    host.selectionMode.set('multiple');
    host.current.set({ row: 'S2', column: 'customer' });
    fixture.detectChanges();
    press(cell('S2', 'customer'), ' ', { shiftKey: true });
    expect(host.valueRequests.at(-1)).toMatchObject({ value: ['S2'], reason: 'keyboard' });
    press(cell('S2', 'customer'), 'a', { ctrlKey: true });
    expect(host.value()).toEqual(['S1', 'S2', 'S3', 'S4']);
  });

  it('selects a range of cells with Shift and the arrows, names its edges, and copies it', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: write } });
    host.selectionMode.set('range');
    host.current.set({ row: 'S1', column: 'customer' });
    fixture.detectChanges();
    press(cell('S1', 'customer'), 'ArrowDown', { shiftKey: true });
    press(cell('S2', 'customer'), 'ArrowRight', { shiftKey: true });
    expect(host.rangeRequests.at(-1)).toMatchObject({
      value: { anchor: { row: 'S1', column: 'customer' }, focus: { row: 'S2', column: 'carrier' } },
      reason: 'keyboard',
    });
    expect(cell('S1', 'customer').getAttribute('data-range-edge')).toBe('top start');
    expect(cell('S2', 'carrier').getAttribute('data-range-edge')).toBe('bottom end');
    expect(cell('S1', 'customer').getAttribute('aria-selected')).toBe('true');
    expect(cell('S3', 'customer').hasAttribute('data-in-range')).toBe(false);
    press(cell('S2', 'carrier'), 'c', { ctrlKey: true });
    await settle();
    expect(write).toHaveBeenCalledWith('Aurora\tDHL\nBloom\tUPS');
    press(cell('S2', 'carrier'), 'Escape');
    expect(host.rangeRequests.at(-1)).toMatchObject({ value: null, reason: 'clear' });
  });

  it('opens an editor on Enter, commits on Enter and moves down, cancels on Escape', async () => {
    host.current.set({ row: 'S1', column: 'customer' });
    fixture.detectChanges();
    press(cell('S1', 'customer'), 'Enter');
    await settle();
    expect(cell('S1', 'customer').hasAttribute('data-editing')).toBe(true);
    type(cell('S1', 'customer').querySelector<HTMLInputElement>('input')!, 'Aurora Textiles');
    press(cell('S1', 'customer'), 'Enter');
    await settle();
    expect(host.commits.at(-1)).toMatchObject({
      key: 'S1',
      column: 'customer',
      value: 'Aurora Textiles',
      previous: 'Aurora',
      reason: 'keyboard',
    });
    expect(cell('S2', 'customer').hasAttribute('data-current')).toBe(true);
    press(cell('S2', 'customer'), 'F2');
    await settle();
    type(cell('S2', 'customer').querySelector<HTMLInputElement>('input')!, 'x');
    press(cell('S2', 'customer'), 'Escape');
    expect(cell('S2', 'customer').hasAttribute('data-editing')).toBe(false);
    expect(host.commits).toHaveLength(1);
  });

  it('opens the editor with the typed key as its first character', async () => {
    host.current.set({ row: 'S1', column: 'customer' });
    fixture.detectChanges();
    press(cell('S1', 'customer'), 'Z');
    await settle();
    expect(cell('S1', 'customer').querySelector<HTMLInputElement>('input')!.value).toBe('Z');
  });

  it('keeps the draft and marks the cell when validation fails, and when the commit rejects', async () => {
    host.commitOutcome = Promise.reject(new Error('Offline'));
    host.commitOutcome.catch(() => undefined);
    host.current.set({ row: 'S1', column: 'weight' });
    fixture.detectChanges();
    press(cell('S1', 'weight'), 'Enter');
    await settle();
    type(cell('S1', 'weight').querySelector<HTMLInputElement>('input')!, '-4');
    press(cell('S1', 'weight'), 'Enter');
    await settle();
    expect(cell('S1', 'weight').hasAttribute('data-invalid')).toBe(true);
    expect(cell('S1', 'weight').getAttribute('aria-invalid')).toBe('true');
    expect(cell('S1', 'weight').getAttribute('title')).toBe('A weight is not negative');
    expect(host.commits).toHaveLength(0);
    type(cell('S1', 'weight').querySelector<HTMLInputElement>('input')!, '40');
    press(cell('S1', 'weight'), 'Enter');
    await settle();
    await settle();
    expect(host.commits).toHaveLength(1);
    expect(cell('S1', 'weight').getAttribute('title')).toBe('Offline');
    expect(cell('S1', 'weight').hasAttribute('data-editing')).toBe(true);
  });

  it('marks a cell whose row changed under the editor as a conflict', async () => {
    host.current.set({ row: 'S1', column: 'customer' });
    fixture.detectChanges();
    press(cell('S1', 'customer'), 'Enter');
    await settle();
    host.rows.set([{ ...ROWS[0]!, customer: 'Changed' }, ...ROWS.slice(1)]);
    fixture.detectChanges();
    expect(cell('S1', 'customer').hasAttribute('data-invalid')).toBe(true);
    expect(cell('S1', 'customer').getAttribute('title')).toBe(
      'This value changed while you were editing',
    );
  });

  it('activates a row on Enter when activatable, and never on an editable cell', async () => {
    host.activatable.set(true);
    host.current.set({ row: 'S1', column: 'id' });
    fixture.detectChanges();
    press(cell('S1', 'id'), 'Enter');
    expect(host.activations.at(-1)).toMatchObject({ key: 'S1', reason: 'keyboard' });
    press(cell('S1', 'customer'), 'Enter');
    await settle();
    expect(cell('S1', 'customer').hasAttribute('data-editing')).toBe(true);
    expect(host.activations).toHaveLength(1);
  });

  it('writes aria-readonly on a cell that does not edit while others do', () => {
    expect(cell('S1', 'id').getAttribute('aria-readonly')).toBe('true');
    expect(cell('S1', 'customer').hasAttribute('aria-readonly')).toBe(false);
  });

  it('resizes from the keyboard by a step, clamped, and announces', () => {
    host.current.set({ row: 'header', column: 'customer' });
    fixture.detectChanges();
    press(header('customer'), 'ArrowRight', { ctrlKey: true, shiftKey: true });
    expect(host.stateRequests.at(-1)).toMatchObject({
      value: { widths: { customer: 168 } },
      reason: 'keyboard',
      change: 'width',
    });
    expect(root().style.getPropertyValue('--slotted-data-grid-template')).toContain('168px');
  });

  it('moves a column with Alt and the arrows, inside its zone', () => {
    host.current.set({ row: 'header', column: 'customer' });
    fixture.detectChanges();
    press(header('customer'), 'ArrowRight', { altKey: true });
    expect(host.stateRequests.at(-1)).toMatchObject({
      value: { order: ['id', 'carrier', 'customer', 'weight', 'shipped', 'priority'] },
      change: 'order',
    });
    expect(
      [...root().querySelectorAll('[data-part="column-header"]')].map((node) =>
        node.getAttribute('data-column'),
      ),
    ).toEqual(['id', 'carrier', 'customer', 'weight', 'shipped', 'priority']);
  });

  it('pins, hides and fits through the column menu', async () => {
    host.current.set({ row: 'header', column: 'weight' });
    fixture.detectChanges();
    press(header('weight'), 'Enter', { ctrlKey: true });
    await settle();
    menuItem('Pin to end').click();
    await settle();
    expect(host.stateRequests.at(-1)).toMatchObject({
      value: { pinned: { start: [], end: ['weight'] } },
      change: 'pinned',
    });
    expect(header('weight').getAttribute('data-pinned')).toBe('end');
    expect(header('weight').hasAttribute('data-pin-edge')).toBe(true);
    expect(header('weight').style.getPropertyValue('--slotted-data-grid-pin-offset')).toBe('0px');
    press(header('weight'), 'Enter', { ctrlKey: true });
    await settle();
    menuItem('Hide column').click();
    await settle();
    expect(root().querySelector('[data-part="column-header"][data-column="weight"]')).toBeNull();
    expect(root().getAttribute('aria-colcount')).toBe('5');
  });

  it('takes a controlled column state and normalises it', () => {
    host.columnState.set({
      order: ['weight', 'id'],
      widths: {},
      hidden: ['priority', 'ghost'],
      pinned: { start: ['id'], end: [] },
    });
    fixture.detectChanges();
    expect(
      [...root().querySelectorAll('[data-part="column-header"]')].map((node) =>
        node.getAttribute('data-column'),
      ),
    ).toEqual(['id', 'weight', 'customer', 'carrier', 'shipped']);
  });

  it('opens a detail row under an expandable row, reachable by the arrows', () => {
    host.detail.set(true);
    host.current.set({ row: 'S1', column: '__expander' });
    fixture.detectChanges();
    press(cell('S1', '__expander'), 'ArrowRight');
    const detail = root().querySelector<HTMLElement>('[data-part="detail"]')!;
    expect(detail.getAttribute('role')).toBe('row');
    expect(detail.textContent).toContain('Detail of S1');
    expect(cell('S1', '__expander').querySelector('button')!.getAttribute('aria-expanded')).toBe(
      'true',
    );
    press(cell('S1', '__expander'), 'ArrowLeft');
    expect(root().querySelector('[data-part="detail"]')).toBeNull();
  });

  it('exposes the imperative surface', async () => {
    host.grid().focusCell({ row: 'S3', column: 'weight' });
    await settle();
    expect(document.activeElement).toBe(cell('S3', 'weight'));
    host.grid().startEdit({ row: 'S3', column: 'customer' });
    await settle();
    expect(cell('S3', 'customer').hasAttribute('data-editing')).toBe(true);
    expect(host.grid().getVisibleRows()).toHaveLength(4);
  });

  it('draws the loading, empty and error states', () => {
    host.loading.set(true);
    host.rows.set([]);
    fixture.detectChanges();
    expect(root().querySelector('[data-part="loader"]')).not.toBeNull();
    host.loading.set(false);
    fixture.detectChanges();
    expect(root().querySelector('[data-part="empty"]')!.textContent).toContain('No rows');
    host.error.set('Timed out');
    fixture.detectChanges();
    [...root().querySelectorAll<HTMLButtonElement>('[data-part="empty"] button')]
      .find((button) => button.textContent?.trim() === 'Try again')!
      .click();
    expect(host.retries).toBe(1);
    host.error.set(undefined);
    host.rows.set(ROWS);
    host.loading.set(true);
    fixture.detectChanges();
    expect(root().getAttribute('aria-busy')).toBe('true');
  });

  it('offers load more when the total is unknown and more exists', () => {
    host.hasMore.set(true);
    host.query.set(emptyQuery({ cursor: null, size: 4 }));
    fixture.detectChanges();
    expect(root().getAttribute('aria-rowcount')).toBe('0');
    [...fixture.nativeElement.querySelectorAll('[data-part="footer"] button')]
      .find((button: HTMLButtonElement) => button.textContent?.trim() === 'Load more')!
      .click();
    expect(host.loads).toBeGreaterThanOrEqual(1);
    expect(fixture.nativeElement.querySelector('[data-range]').textContent).toContain('1–4');
  });
});

@Component({
  standalone: true,
  imports: [SlDataGrid],
  providers: [provideDataGridDefaults({ variant: 'framed', labels: { empty: 'Nada' } })],
  template: `<sl-data-grid rowKey="id" [rows]="[]" [columns]="columns" />`,
})
class Provided {
  readonly columns = COLUMNS;
}

describe('SlDataGrid, defaults', () => {
  it('fits every column in one request, each to its own content', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[role="grid"]') as HTMLElement;
    const widths: Record<string, number> = {
      id: 60,
      customer: 140,
      carrier: 90,
      weight: 70,
      shipped: 100,
      priority: 50,
    };
    /* jsdom lays nothing out: the value's measured width is the column's. */
    /* jsdom's Range has no geometry at all; the method is defined for the test. */
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value(this: Range) {
        const cell = (this.startContainer as Element).closest<HTMLElement>('[data-column]');
        const width = cell ? (widths[cell.dataset['column']!] ?? 0) : 0;
        return { width, height: 0, x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0 };
      },
    });
    const requests = fixture.componentInstance.stateRequests;
    fixture.componentInstance.grid().autofit();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toEqual(
      expect.objectContaining({ change: 'width', reason: 'programmatic' }),
    );
    expect(requests[0]!.value.widths).toEqual(
      Object.fromEntries(Object.entries(widths).map(([id, width]) => [id, width])),
    );
    delete (Range.prototype as { getBoundingClientRect?: unknown }).getBoundingClientRect;
  });

  it('writes a numeric row height to the frame, so the drawn row is the windowed row', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.rowHeight.set(56);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[role="grid"]') as HTMLElement;
    expect(root.style.getPropertyValue('--slotted-data-grid-row-block-size')).toBe('56px');
  });

  it('reads defaults from the provider, an explicit input winning', async () => {
    await TestBed.configureTestingModule({ imports: [Provided] }).compileComponents();
    const fixture = TestBed.createComponent(Provided);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[role="grid"]') as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('framed');
    expect(root.querySelector('[data-part="empty"]')!.textContent).toContain('Nada');
  });
});
