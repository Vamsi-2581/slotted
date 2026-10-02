import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  TextField,
} from '@slotted/react';

export default function DialogBasic() {
  return (
    <Dialog>
      <DialogTrigger>Edit project</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>The name is visible to the whole workspace.</DialogDescription>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <TextField defaultValue="Home page redesign" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" tone="secondary">
            Cancel
          </Button>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
