import { Component } from '@angular/core';
import { SlCombobox, SlComboboxItem } from '@slotted/angular/combobox';

@Component({
  selector: 'app-combobox-basic',
  imports: [SlCombobox, SlComboboxItem],
  template: `
    <sl-combobox aria-label="Fruit" placeholder="Search fruit">
      <sl-combobox-item value="apple" label="Apple" />
      <sl-combobox-item value="blueberry" label="Blueberry" />
      <sl-combobox-item value="raspberry" label="Raspberry" />
    </sl-combobox>
  `,
})
export class ComboboxBasic {}
