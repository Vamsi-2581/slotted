import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '@slotted/react';

export default function ComboboxBasic() {
  return (
    <Combobox>
      <ComboboxInput aria-label="Fruit" placeholder="Search fruit" />
      <ComboboxContent>
        <ComboboxItem value="apple">Apple</ComboboxItem>
        <ComboboxItem value="blueberry">Blueberry</ComboboxItem>
        <ComboboxItem value="raspberry">Raspberry</ComboboxItem>
      </ComboboxContent>
    </Combobox>
  );
}
