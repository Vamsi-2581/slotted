import { Field, FieldLabel, Stack, TextField } from '@slotted/react';

export default function FieldSizes() {
  return (
    <Stack gap={5}>
      <Field size="sm">
        <FieldLabel>Small</FieldLabel>
        <TextField placeholder="Used in dense toolbars" />
      </Field>
      <Field size="md">
        <FieldLabel>Medium</FieldLabel>
        <TextField placeholder="The default step" />
      </Field>
      <Field size="lg">
        <FieldLabel>Large</FieldLabel>
        <TextField placeholder="Used in sparse forms" />
      </Field>
    </Stack>
  );
}
