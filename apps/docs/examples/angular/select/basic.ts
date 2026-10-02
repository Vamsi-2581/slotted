import { Component } from '@angular/core';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';

@Component({
  selector: 'app-select-basic',
  imports: [SlSelect, SlSelectItem],
  template: `
    <sl-select aria-label="Fruit" placeholder="Choose a fruit">
      <sl-select-item value="apple">Apple</sl-select-item>
      <sl-select-item value="blueberry">Blueberry</sl-select-item>
    </sl-select>
  `,
})
export class SelectBasic {}
