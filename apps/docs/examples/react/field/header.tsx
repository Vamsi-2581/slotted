import {
  Badge,
  Field,
  FieldAction,
  FieldHeader,
  FieldHelp,
  FieldIndicator,
  FieldLabel,
  Stack,
  TextField,
} from '@slotted/react';

export default function FieldHeaderExample() {
  return (
    <Stack gap={5}>
      <Field required>
        <FieldHeader>
          <FieldLabel>Password</FieldLabel>
          <FieldHelp>At least eight characters, with letters and numbers.</FieldHelp>
          <FieldAction render={(props) => <a {...props} href="#reset" />}>
            Forgot password?
          </FieldAction>
        </FieldHeader>
        <TextField type="password" />
      </Field>
      <Field>
        <FieldHeader>
          <FieldLabel>Webhook URL</FieldLabel>
          <FieldIndicator>
            <Badge size="sm" tone="accent" variant="soft">
              Beta
            </Badge>
          </FieldIndicator>
        </FieldHeader>
        <TextField type="url" placeholder="https://" />
      </Field>
    </Stack>
  );
}
