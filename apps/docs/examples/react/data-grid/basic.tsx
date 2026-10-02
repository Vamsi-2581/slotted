import type { GridColumn } from '@slotted/core/grid';
import { DataGrid } from '@slotted/react';

interface Shipment {
  id: string;
  customer: string;
  destination: string;
  weight: number;
}

const shipments: Shipment[] = [
  { id: 'SHP-1042', customer: 'Northwind Traders', destination: 'Rotterdam', weight: 1240 },
  { id: 'SHP-1043', customer: 'Contoso Foods', destination: 'Lyon', weight: 860 },
  { id: 'SHP-1044', customer: 'Fabrikam Steel', destination: 'Hamburg', weight: 3125 },
];

const columns: GridColumn<Shipment>[] = [
  { id: 'id', label: 'Shipment', accessor: 'id', rowHeader: true },
  { id: 'customer', label: 'Customer', accessor: 'customer', sortable: true },
  { id: 'destination', label: 'Destination', accessor: 'destination', sortable: true },
  { id: 'weight', label: 'Weight (kg)', accessor: 'weight', numeric: true, sortable: true },
];

export default function DataGridBasic() {
  return (
    <DataGrid
      columns={columns}
      height="20rem"
      aria-label="Shipments"
      rowKey="id"
      rows={shipments}
      selectionMode="multiple"
    />
  );
}
