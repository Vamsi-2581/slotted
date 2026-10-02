import { Field, FieldDescription, FieldError, FieldLabel, Stack, TextField } from '@slotted/react';

export default function FieldMessages() {
  return (
    <Stack gap={5}>
      <Field>
        <FieldLabel>Password</FieldLabel>
        <TextField type="password" defaultValue="summer2024" />
        <FieldError tone="warning">Valid, but easy to guess.</FieldError>
      </Field>
      <Field invalid>
        <FieldLabel>Postal code</FieldLabel>
        <TextField defaultValue="ABC" />
        <FieldDescription>Digits only.</FieldDescription>
        <FieldError reserve>Enter five digits.</FieldError>
      </Field>
    </Stack>
  );
}
