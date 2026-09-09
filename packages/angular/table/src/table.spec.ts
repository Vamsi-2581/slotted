import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ChangeRequest } from '@slotted/core/state';
import { SlTable } from './table';
import { SlTableContent } from './table-content';
import { provideTableDefaults } from './table-defaults';
import type { TableSortDescriptor } from './table-defaults';
import {
  SlTableBody,
  SlTableCaption,
  SlTableCell,
  SlTableColumnHeader,
  SlTableDetail,
  SlTableExpander,
  SlTableHead,
  SlTableRow,
  SlTableRowHeader,
  SlTableSelect,
  SlTableSelectAll,
  SlTableSort,
} from './table-parts';

const ROWS = [
  { amount: '1,240.00', client: 'Northwind Trading', id: 'INV-1042' },
  { amount: '18.50', client: 'Cascade Logistics', id: 'INV-1043' },
  { amount: '9,802.75', client: 'Bright Harbor', id: 'INV-1044' },
];

@Component({
  standalone: true,
  imports: [
    SlTable,
    SlTableBody,
    SlTableCaption,
    SlTableCell,
    SlTableColumnHeader,
    SlTableContent,
    SlTableDetail,
    SlTableExpander,
    SlTableHead,
    SlTableRow,
    SlTableRowHeader,
    SlTableSelect,
    SlTableSelectAll,
    SlTableSort,
  ],
  template: `<div
    slTable
    [columns]="4"
    [selectionMode]="selectionMode()"
    [(sort)]="sort"
    [(value)]="value"
    [(expanded)]="expanded"
    [variant]="variant()"
    (sortChangeRequest)="sortRequests.push($event)"
    (valueChangeRequest)="valueRequests.push($event)"
  >
    <div slTableContent [totalRowCount]="totalRowCount()">
      <caption slTableCaption>
        Invoices
      </caption>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableSelectAll></th>
          <th slTableColumnHeader column="invoice"><button slTableSort>Invoice</button></th>
          <th slTableColumnHeader column="client"><button slTableSort>Client</button></th>
          <th slTableColumnHeader numeric>Amount</th>
        </tr>
      </thead>
      <tbody slTableBody>
        @for (row of rows(); track row.id) {
          <tr slTableRow [value]="row.id" [disabled]="row.id === disabledRow()">
            <td slTableSelect></td>
            <th slTableRowHeader>
              <button slTableExpander></button>
              {{ row.id }}
            </th>
            <td slTableCell>{{ row.client }}</td>
            <td slTableCell numeric>{{ row.amount }}</td>
          </tr>
          @if (expanded().includes(row.id)) {
            <tr slTableDetail [value]="row.id">
              Two reminders sent.
            </tr>
          }
        }
      </tbody>
    </div>
  </div>`,
})
class Host {
  readonly rows = signal(ROWS);
  readonly sort = signal<TableSortDescriptor | null>(null);
  readonly value = signal<readonly string[]>([]);
  readonly expanded = signal<readonly string[]>([]);
  readonly selectionMode = signal<'none' | 'single' | 'multiple'>('multiple');
  readonly variant = signal<'plain' | 'ruled' | 'framed' | undefined>(undefined);
  readonly disabledRow = signal<string | undefined>(undefined);
  readonly totalRowCount = signal<number | undefined>(undefined);
  readonly sortRequests: ChangeRequest<TableSortDescriptor | null>[] = [];
  readonly valueRequests: ChangeRequest<readonly string[]>[] = [];
}

function query(fixture: ComponentFixture<Host>, selector: string) {
  return fixture.nativeElement.querySelector(selector) as HTMLElement;
}

function queryAll(fixture: ComponentFixture<Host>, selector: string) {
  return [...fixture.nativeElement.querySelectorAll(selector)] as HTMLElement[];
}

describe('SlTable', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  /**
   * The APG is explicit: a table "is not an interactive widget", and every role
   * the structure needs is what the platform's own elements carry.
   */
  it('takes every role from the platform and writes none', () => {
    const table = query(fixture, 'table');
    expect(table).toBeTruthy();
    expect(table.hasAttribute('role')).toBe(false);
    expect(query(fixture, '[data-ui="table"]').getAttribute('data-part')).toBe('root');
    expect(query(fixture, '[data-part="scroll"]')).toBeTruthy();
  });

  it('scopes a column header to its column and a row header to its row', () => {
    expect(query(fixture, '[data-part="column-header"]').getAttribute('scope')).toBe('col');
    expect(query(fixture, '[data-part="row-header"]').getAttribute('scope')).toBe('row');
  });

  it('cycles ascending, descending, then none', () => {
    const trigger = queryAll(fixture, '[data-part="sort"]')[1] as HTMLElement;
    const header = trigger.closest('th') as HTMLElement;

    trigger.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('ascending');

    trigger.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('descending');

    trigger.click();
    fixture.detectChanges();
    expect(header.hasAttribute('aria-sort')).toBe(false);

    expect(fixture.componentInstance.sortRequests.map((request) => request.value)).toEqual([
      { column: 'client', direction: 'ascending' },
      { column: 'client', direction: 'descending' },
      null,
    ]);
  });

  /** ARIA cannot state a sort level, so a second sorted column would be a lie. */
  it('writes the property on the sorted header and on no other', () => {
    const [invoice, client] = queryAll(fixture, '[data-part="sort"]');
    client?.click();
    fixture.detectChanges();
    invoice?.click();
    fixture.detectChanges();

    const sorted = queryAll(fixture, '[data-part="column-header"]').filter((cell) =>
      cell.hasAttribute('aria-sort'),
    );
    expect(sorted).toHaveLength(1);
    expect(sorted[0]?.textContent?.trim()).toBe('Invoice');
  });

  it('paints the selection on the row and writes no aria-selected', () => {
    /* The body's own checkbox: the header's is the first in document order. */
    query(fixture, '[data-part="body"] [data-part="selection"] input').click();
    fixture.detectChanges();

    const row = queryAll(fixture, '[data-part="body"] [data-part="row"]')[0] as HTMLElement;
    expect(row.hasAttribute('data-selected')).toBe(true);
    expect(row.hasAttribute('aria-selected')).toBe(false);
    expect(fixture.componentInstance.value()).toEqual(['INV-1042']);
  });

  it('selects a range from the anchor when Shift is held', () => {
    const boxes = queryAll(fixture, '[data-part="body"] [data-part="selection"] span[slCheckbox]');
    boxes[0]?.click();
    fixture.detectChanges();
    boxes[2]?.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual(['INV-1042', 'INV-1043', 'INV-1044']);
  });

  it('leaves a disabled row out of the set the header covers', () => {
    fixture.componentInstance.disabledRow.set('INV-1043');
    fixture.detectChanges();

    query(fixture, '[data-part="head"] [data-part="selection"] span[slCheckbox]').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual(['INV-1042', 'INV-1044']);
  });

  it('states the count the header checkbox covers', () => {
    query(fixture, '[data-part="body"] [data-part="selection"] span[slCheckbox]').click();
    fixture.detectChanges();

    const header = query(fixture, '[data-part="head"] [data-part="selection"]');
    expect(header.textContent).toContain('1 selected');
    expect(header.querySelector('[data-ui="checkbox"]')?.hasAttribute('data-indeterminate')).toBe(
      true,
    );
  });

  it('opens a row detail through the disclosure pattern', () => {
    const expander = query(fixture, '[data-part="expander"]');
    expect(expander.getAttribute('aria-expanded')).toBe('false');
    expect(query(fixture, '[data-part="detail"]')).toBeNull();

    expander.click();
    fixture.detectChanges();

    expect(expander.getAttribute('aria-expanded')).toBe('true');
    const detail = query(fixture, '[data-part="detail"]');
    expect(detail.id).toBe(expander.getAttribute('aria-controls'));
    expect(detail.querySelector('td')?.getAttribute('colspan')).toBe('4');
  });

  /**
   * The practice requires the pair exactly when the DOM is not the whole set,
   * so a complete table writes neither and never counts itself twice.
   */
  it('states the size of a set the DOM does not hold, and only then', () => {
    expect(query(fixture, 'table').hasAttribute('aria-rowcount')).toBe(false);

    fixture.componentInstance.totalRowCount.set(128);
    fixture.detectChanges();

    expect(query(fixture, 'table').getAttribute('aria-rowcount')).toBe('128');
  });

  it('takes a tab stop only while the table overflows', () => {
    const scroll = query(fixture, '[data-part="scroll"]');
    expect(scroll.hasAttribute('tabindex')).toBe(false);
    expect(scroll.hasAttribute('role')).toBe(false);
  });
});

describe('an application setting the family once', () => {
  it('is overridden by a table that states the axis itself', async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideTableDefaults({ variant: 'plain' })],
    }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(query(fixture, '[data-ui="table"]').getAttribute('data-variant')).toBe('plain');

    fixture.componentInstance.variant.set('framed');
    fixture.detectChanges();
    expect(query(fixture, '[data-ui="table"]').getAttribute('data-variant')).toBe('framed');
  });
});

/**
 * The asymmetry `frameworks.md` asks to be recorded rather than levelled away:
 * a bulk-action screen is a reactive form here, and no surveyed Angular table
 * offers forms integration at all.
 */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SlTable, SlTableBody, SlTableContent, SlTableRow, SlTableSelect],
  template: `<div slTable selectionMode="multiple" [formControl]="chosen">
    <div slTableContent>
      <tbody slTableBody>
        <tr slTableRow value="INV-1042">
          <td slTableSelect></td>
        </tr>
      </tbody>
    </div>
  </div>`,
})
class FormHost {
  readonly chosen = new FormControl<readonly string[]>(['INV-1042']);
}

describe('the selection as a form value', () => {
  it('writes the control into the table and reports back to it', async () => {
    await TestBed.configureTestingModule({ imports: [FormHost] }).compileComponents();
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('[data-part="row"]') as HTMLElement;
    expect(row.hasAttribute('data-selected')).toBe(true);

    (fixture.nativeElement.querySelector('span[slCheckbox]') as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.chosen.value).toEqual([]);
  });
});
