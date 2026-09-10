import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { operatorsFor, setFilter } from '@slotted/core/filter';
import type { NumberFilter, SetFilter, TextFilter } from '@slotted/core/filter';
import type { ChangeRequest } from '@slotted/core/state';
import { SlTable } from './table';
import { SlTableContent } from './table-content';
import { provideTableDefaults, TABLE_LABELS } from './table-defaults';
import type { TableSortDescriptor } from './table-defaults';
import { SlTableNumberFilter, SlTableSetFilter, SlTableTextFilter } from './table-filter';
import {
  SlTableBody,
  SlTableCaption,
  SlTableCell,
  SlTableColumnActions,
  SlTableColumnHeader,
  SlTableDetail,
  SlTableExpander,
  SlTableHead,
  SlTableRow,
  SlTableRowHeader,
  SlTableSelect,
  SlTableSelectAll,
  SlTableSort,
  SlTableSummary,
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
    [cellAlign]="cellAlign()"
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
  readonly cellAlign = signal<'start' | 'center' | 'end' | undefined>(undefined);
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
 * Both ends of the same box, and a selection column pinned beside the column
 * that names the record. Two columns pinned to the same edge both resolve
 * against the scroller, so the second is drawn over the first unless the offset
 * is stated — which the family states rather than measures.
 */
@Component({
  standalone: true,
  imports: [
    SlTable,
    SlTableBody,
    SlTableCell,
    SlTableColumnHeader,
    SlTableContent,
    SlTableHead,
    SlTableRow,
    SlTableRowHeader,
    SlTableSelect,
    SlTableSelectAll,
    SlTableSummary,
  ],
  template: `<div
    slTable
    [columns]="2"
    stickyHeader
    [stickyFooter]="pinned()"
    selectionMode="multiple"
  >
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableSelectAll sticky="start"></th>
          <th slTableColumnHeader sticky="start" stickyOffset="3rem">Invoice</th>
        </tr>
      </thead>
      <tbody slTableBody>
        <tr slTableRow value="INV-1042">
          <td slTableSelect sticky="start"></td>
          <th slTableRowHeader sticky="start" stickyOffset="3rem">INV-1042</th>
        </tr>
      </tbody>
      <tfoot slTableSummary>
        <tr slTableRow>
          <td slTableCell [colSpan]="2">One invoice</td>
        </tr>
      </tfoot>
    </div>
  </div>`,
})
class PinnedHost {
  readonly pinned = signal(false);
}

describe('pinning', () => {
  it('marks each end the table asks to hold, and pins a selection column beside a header', async () => {
    await TestBed.configureTestingModule({ imports: [PinnedHost] }).compileComponents();
    const fixture = TestBed.createComponent(PinnedHost);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('[data-ui="table"]') as HTMLElement;
    /* Both written as bare attributes, because that is the form a template
       writes and the one that breaks first: an input exercised only through a
       binding passes a spec and leaves the attribute on a table doing nothing. */
    /* The head is held by a bare attribute, which is the form a template
       writes and the one that breaks first; the summary is held by a binding,
       so the two paths into the same axis are both exercised. */
    expect(root.getAttribute('data-sticky-header')).toBe('');
    expect(root.hasAttribute('data-sticky-footer')).toBe(false);

    fixture.componentInstance.pinned.set(true);
    fixture.detectChanges();
    expect(root.getAttribute('data-sticky-footer')).toBe('');

    const chooser = fixture.nativeElement.querySelector('[data-part="selection"]') as HTMLElement;
    expect(chooser.getAttribute('data-sticky')).toBe('start');
    expect(chooser.style.getPropertyValue('--slotted-table-sticky-inset')).toBe('');

    const header = fixture.nativeElement.querySelector(
      '[data-part="column-header"]',
    ) as HTMLElement;
    expect(header.style.getPropertyValue('--slotted-table-sticky-inset')).toBe('3rem');
  });
});

/**
 * The filter, and the thing that makes it one: the panel edits a draft and
 * nothing reaches the consumer until Apply.
 */
@Component({
  standalone: true,
  imports: [
    SlTable,
    SlTableBody,
    SlTableColumnActions,
    SlTableColumnHeader,
    SlTableContent,
    SlTableSetFilter,
    SlTableHead,
    SlTableRow,
  ],
  template: `<div slTable [columns]="1">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader column="status">
            Status
            <span slTableColumnActions>
              <span
                slTableSetFilter
                columnLabel="status"
                [options]="options"
                [(value)]="chosen"
              ></span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody slTableBody></tbody>
    </div>
  </div>`,
})
class FilterHost {
  readonly options = [
    { count: 2, value: 'Paid' },
    { count: 1, value: 'Overdue' },
    { value: 'Draft' },
  ];
  readonly chosen = signal<SetFilter | null>(null);
}

/**
 * A typed column, and the two operators that change the panel's shape rather
 * than its comparison.
 */
@Component({
  standalone: true,
  imports: [
    SlTable,
    SlTableBody,
    SlTableColumnActions,
    SlTableColumnHeader,
    SlTableContent,
    SlTableHead,
    SlTableNumberFilter,
    SlTableRow,
    SlTableTextFilter,
  ],
  template: `<div slTable [columns]="1">
    <div slTableContent>
      <thead slTableHead>
        <tr slTableRow>
          <th slTableColumnHeader column="amount">
            Amount
            <span slTableColumnActions>
              @if (kind() === 'text') {
                <span slTableTextFilter columnLabel="amount" [(value)]="text"></span>
              } @else {
                <span slTableNumberFilter columnLabel="amount" [(value)]="amount"></span>
              }
            </span>
          </th>
        </tr>
      </thead>
      <tbody slTableBody></tbody>
    </div>
  </div>`,
})
class TypedFilterHost {
  readonly kind = signal<'number' | 'text'>('text');
  readonly text = signal<TextFilter | null>(null);
  readonly amount = signal<NumberFilter | null>(null);
}

describe('where a cell sits in its row', () => {
  it('centres by default, and lets a table and a cell each say otherwise', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('[data-ui="table"]') as HTMLElement;
    expect(root.getAttribute('data-cell-align')).toBe('center');

    fixture.componentInstance.cellAlign.set('start');
    fixture.detectChanges();
    expect(root.getAttribute('data-cell-align')).toBe('start');
  });
});

describe('the column filter', () => {
  const panelButton = (label: string) =>
    [...document.querySelectorAll('[data-part="filter-actions"] button')].find(
      (button) => (button.textContent ?? '').trim() === label,
    ) as HTMLElement;

  it('reports nothing until Apply, and reports the descriptor the engine reads', async () => {
    await TestBed.configureTestingModule({ imports: [FilterHost] }).compileComponents();
    const fixture = TestBed.createComponent(FilterHost);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-part="filter"]') as HTMLElement;
    expect(trigger.getAttribute('aria-label')).toBe('Filter status');
    expect(trigger.hasAttribute('data-filtered')).toBe(false);

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const boxes = [
      ...document.querySelectorAll('[data-part="filter-option"] input[type="checkbox"]'),
    ] as HTMLInputElement[];
    /* The covering checkbox, then one per value: three values draw no search. */
    expect(boxes.length).toBe(4);
    expect(document.querySelector('[data-part="filter-search"]')).toBeNull();

    boxes[1]?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.chosen()).toBeNull();

    panelButton('Apply').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.chosen()).toEqual(setFilter(['Paid']));
    expect(trigger.getAttribute('data-filtered')).toBe('');
    expect(trigger.getAttribute('aria-label')).toBe('Filter status: Is any of Paid');
  });

  /**
   * The vocabulary is the engine's, and the panel offers exactly what the kind
   * holds. A list written here instead would be a second definition of what a
   * text column can be asked.
   */
  it('offers every operator its kind holds, and no other', async () => {
    await TestBed.configureTestingModule({ imports: [TypedFilterHost] }).compileComponents();
    const fixture = TestBed.createComponent(TypedFilterHost);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-part="filter"]') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    (
      document.querySelector('[data-part="filter-operator"] [role="combobox"]') as HTMLElement
    ).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const offered = [...document.querySelectorAll('[role="option"]')].map((option) =>
      (option.textContent ?? '').trim(),
    );
    expect(offered).toEqual(
      operatorsFor('text').map((operator) => TABLE_LABELS.filterOperators[operator]),
    );
  });

  it('takes two operands for a range and none for a blank test', async () => {
    await TestBed.configureTestingModule({ imports: [TypedFilterHost] }).compileComponents();
    const fixture = TestBed.createComponent(TypedFilterHost);
    fixture.componentInstance.kind.set('number');
    fixture.componentInstance.amount.set({
      conditions: [{ end: 20, operator: 'between', value: 10 }],
      join: 'and',
      kind: 'number',
    });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-part="filter"]') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const condition = document.querySelector('[data-part="filter-condition"]') as HTMLElement;
    expect(condition.getAttribute('data-operands')).toBe('2');
    expect(condition.querySelectorAll('[data-part="filter-operand"] input').length).toBe(2);
    /* The range is complete, so the second condition stands beside it with one
       operand of its own — which is the reveal, not a third end of the range. */
    expect(document.querySelectorAll('[data-part="filter-condition"]').length).toBe(2);
  });

  /**
   * AG Grid's own reveal, and the join that comes with it. The common case is
   * one condition, so the panel never opens as a form.
   */
  it('reveals the second condition and its join once the first is complete', async () => {
    await TestBed.configureTestingModule({ imports: [TypedFilterHost] }).compileComponents();
    const fixture = TestBed.createComponent(TypedFilterHost);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-part="filter"]') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('[data-part="filter-join"]')).toBeNull();

    const operand = document.querySelector(
      '[data-part="filter-operand"] input',
    ) as HTMLInputElement;
    operand.value = 'ana';
    operand.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(document.querySelector('[data-part="filter-join"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-part="filter-condition"]').length).toBe(2);

    panelButton('Apply').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.text()).toEqual({
      conditions: [{ operator: 'contains', value: 'ana' }],
      join: 'and',
      kind: 'text',
    });
  });

  /** The one key the family takes, and the reason it is a recorded departure. */
  it('applies on Enter in an operand', async () => {
    await TestBed.configureTestingModule({ imports: [TypedFilterHost] }).compileComponents();
    const fixture = TestBed.createComponent(TypedFilterHost);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-part="filter"]') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const operand = document.querySelector(
      '[data-part="filter-operand"] input',
    ) as HTMLInputElement;
    operand.value = 'ana';
    operand.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    operand.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.text()).toEqual({
      conditions: [{ operator: 'contains', value: 'ana' }],
      join: 'and',
      kind: 'text',
    });
  });

  it('empties the filter on Clear', async () => {
    await TestBed.configureTestingModule({ imports: [FilterHost] }).compileComponents();
    const fixture = TestBed.createComponent(FilterHost);
    fixture.componentInstance.chosen.set(setFilter(['Paid']));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-part="filter"]') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    panelButton('Clear').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.chosen()).toBeNull();
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
