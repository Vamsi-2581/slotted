import { Field, FieldDescription, FieldLabel, TextField } from '@slotted/react';

export default function FieldBasic() {
  return (
    <Field required>
      <FieldLabel>Email</FieldLabel>
      <TextField type="email" autoComplete="email" />
      <FieldDescription>Invoices are sent to this address.</FieldDescription>
    </Field>
  );
}
