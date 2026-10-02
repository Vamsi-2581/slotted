import { Component } from '@angular/core';
import { SlDataGrid } from '@slotted/angular/data-grid';
import type { GridColumn } from '@slotted/core/grid';

interface Shipment {
  id: string;
  customer: string;
  destination: string;
  weight: number;
}

@Component({
  selector: 'app-data-grid-basic',
  imports: [SlDataGrid],
  template: `
    <sl-data-grid
      aria-label="Shipments"
      rowKey="id"
      height="20rem"
      selectionMode="multiple"
      [rows]="shipments"
      [columns]="columns"
    />
  `,
})
export class DataGridBasic {
  readonly shipments: Shipment[] = [
    { id: 'SHP-1042', customer: 'Northwind Traders', destination: 'Rotterdam', weight: 1240 },
    { id: 'SHP-1043', customer: 'Contoso Foods', destination: 'Lyon', weight: 860 },
    { id: 'SHP-1044', customer: 'Fabrikam Steel', destination: 'Hamburg', weight: 3125 },
  ];

  readonly columns: GridColumn<Shipment>[] = [
    { id: 'id', label: 'Shipment', accessor: 'id', rowHeader: true },
    { id: 'customer', label: 'Customer', accessor: 'customer', sortable: true },
    { id: 'destination', label: 'Destination', accessor: 'destination', sortable: true },
    { id: 'weight', label: 'Weight (kg)', accessor: 'weight', numeric: true, sortable: true },
  ];
}
