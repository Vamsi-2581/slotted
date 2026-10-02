import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@slotted/react';

export default function SelectBasic() {
  return (
    <Select>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Choose a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
      </SelectContent>
    </Select>
  );
}
