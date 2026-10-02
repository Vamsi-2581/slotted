import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableColumnHeader,
  TableContent,
  TableHead,
  TableRow,
  TableRowHeader,
} from '@slotted/react';

const invoices = [
  { id: 'INV-2041', client: 'Northwind Traders', amount: '$1,240.00' },
  { id: 'INV-2042', client: 'Contoso Foods', amount: '$860.50' },
];

export default function TableBasic() {
  return (
    <Table columns={3}>
      <TableContent>
        <TableCaption>Invoices</TableCaption>
        <TableHead>
          <TableRow>
            <TableColumnHeader>Invoice</TableColumnHeader>
            <TableColumnHeader>Client</TableColumnHeader>
            <TableColumnHeader numeric>Amount</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} value={invoice.id}>
              <TableRowHeader>{invoice.id}</TableRowHeader>
              <TableCell>{invoice.client}</TableCell>
              <TableCell numeric>{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}
