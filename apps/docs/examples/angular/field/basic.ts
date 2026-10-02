import { Component } from '@angular/core';
import { SlField, SlFieldControl, SlFieldDescription, SlFieldLabel } from '@slotted/angular/field';
import { SlTextField } from '@slotted/angular/text-field';

@Component({
  selector: 'app-field-basic',
  imports: [SlField, SlFieldControl, SlFieldDescription, SlFieldLabel, SlTextField],
  template: `
    <div slField required>
      <label slFieldLabel>Email</label>
      <input slFieldControl slTextField type="email" autocomplete="email" />
      <span slFieldDescription>Invoices are sent to this address.</span>
    </div>
  `,
})
export class FieldBasic {}
