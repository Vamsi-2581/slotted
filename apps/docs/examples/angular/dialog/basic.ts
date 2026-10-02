import { Component, signal } from '@angular/core';
import { SlButton } from '@slotted/angular/button';
import {
  SlDialog,
  SlDialogBody,
  SlDialogClose,
  SlDialogDescription,
  SlDialogFooter,
  SlDialogHeader,
  SlDialogTitle,
  SlDialogTrigger,
} from '@slotted/angular/dialog';
import { SlTextField } from '@slotted/angular/text-field';

@Component({
  selector: 'app-dialog-basic',
  imports: [
    SlButton,
    SlDialog,
    SlDialogBody,
    SlDialogClose,
    SlDialogDescription,
    SlDialogFooter,
    SlDialogHeader,
    SlDialogTitle,
    SlDialogTrigger,
    SlTextField,
  ],
  template: `
    <button slButton [slDialogTrigger]="d">Edit project</button>
    <sl-dialog #d="slDialog" [(open)]="open">
      <header slDialogHeader>
        <h2 slDialogTitle>Edit project</h2>
        <p slDialogDescription>The name is visible to the whole workspace.</p>
        <button slDialogClose></button>
      </header>
      <div slDialogBody>
        <input slTextField aria-label="Name" value="Home page redesign" />
      </div>
      <footer slDialogFooter>
        <button slButton variant="ghost" tone="secondary" (click)="open.set(false)">Cancel</button>
        <button slButton (click)="open.set(false)">Save</button>
      </footer>
    </sl-dialog>
  `,
})
export class DialogBasic {
  readonly open = signal(false);
}
