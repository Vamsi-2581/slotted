import { Component } from '@angular/core';
import {
  SlTable,
  SlTableBody,
  SlTableCaption,
  SlTableCell,
  SlTableColumnHeader,
  SlTableContent,
  SlTableHead,
  SlTableRow,
  SlTableRowHeader,
} from '@slotted/angular/table';

@Component({
  selector: 'app-table-basic',
  imports: [
    SlTable,
    SlTableBody,
    SlTableCaption,
    SlTableCell,
    SlTableColumnHeader,
    SlTableContent,
    SlTableHead,
    SlTableRow,
    SlTableRowHeader,
  ],
  template: `
    <div slTable [columns]="3">
      <table slTableContent>
        <caption slTableCaption>
          Invoices
        </caption>
        <thead slTableHead>
          <tr slTableRow>
            <th slTableColumnHeader>Invoice</th>
            <th slTableColumnHeader>Client</th>
            <th slTableColumnHeader numeric>Amount</th>
          </tr>
        </thead>
        <tbody slTableBody>
          @for (invoice of invoices; track invoice.id) {
            <tr slTableRow [value]="invoice.id">
              <th slTableRowHeader>{{ invoice.id }}</th>
              <td slTableCell>{{ invoice.client }}</td>
              <td slTableCell numeric>{{ invoice.amount }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TableBasic {
  readonly invoices = [
    { id: 'INV-2041', client: 'Northwind Traders', amount: '$1,240.00' },
    { id: 'INV-2042', client: 'Contoso Foods', amount: '$860.50' },
  ];
}
