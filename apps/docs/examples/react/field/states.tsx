import { Field, FieldError, FieldLabel, Stack, TextField } from '@slotted/react';

export default function FieldStates() {
  return (
    <Stack gap={5}>
      <Field invalid required>
        <FieldLabel>Card number</FieldLabel>
        <TextField inputMode="numeric" defaultValue="4242 4242 42" />
        <FieldError>Six digits are missing.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Workspace</FieldLabel>
        <TextField defaultValue="northwind" />
      </Field>
      <Field readOnly>
        <FieldLabel>Account ID</FieldLabel>
        <TextField defaultValue="acct_9f2c41" />
      </Field>
    </Stack>
  );
}
