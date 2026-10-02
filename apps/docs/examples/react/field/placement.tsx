import { Field, FieldDescription, FieldLabel, Stack, TextField } from '@slotted/react';

export default function FieldPlacement() {
  return (
    <Stack gap={5}>
      <Field labelPlacement="side">
        <FieldLabel>Legal name</FieldLabel>
        <TextField defaultValue="Northwind Traders Ltd." />
      </Field>
      <Field labelPlacement="side">
        <FieldLabel>Billing contact</FieldLabel>
        <TextField type="email" defaultValue="billing@northwind.example" />
        <FieldDescription>Below 320px of field width the label stacks.</FieldDescription>
      </Field>
    </Stack>
  );
}
