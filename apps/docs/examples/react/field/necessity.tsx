import { Field, FieldLabel, Stack, TextField } from '@slotted/react';

export default function FieldNecessity() {
  return (
    <Stack gap={5}>
      <Field required>
        <FieldLabel>Company name</FieldLabel>
        <TextField />
      </Field>
      <Field necessity="optional">
        <FieldLabel>Purchase order</FieldLabel>
        <TextField />
      </Field>
      <Field necessity="words" required>
        <FieldLabel>Tax ID</FieldLabel>
        <TextField />
      </Field>
    </Stack>
  );
}
