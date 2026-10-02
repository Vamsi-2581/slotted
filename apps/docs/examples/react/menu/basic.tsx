import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@slotted/react';

export default function MenuBasic() {
  return (
    <Menu>
      <MenuTrigger
        render={(props) => (
          <Button {...props} variant="outline">
            Document
          </Button>
        )}
      />
      <MenuContent>
        <MenuItem shortcut="Mod+D">Duplicate</MenuItem>
        <MenuItem disabled>Publish</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger">Delete…</MenuItem>
      </MenuContent>
    </Menu>
  );
}
