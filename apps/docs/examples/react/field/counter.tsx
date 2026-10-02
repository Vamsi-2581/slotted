import { Field, FieldLabel, Textarea } from '@slotted/react';

export default function FieldCounterExample() {
  return (
    <Field>
      <FieldLabel>Public description</FieldLabel>
      <Textarea
        autoSize
        countMax={140}
        showCount
        defaultValue="Ships within two business days. Returns are free for thirty days."
      />
    </Field>
  );
}
