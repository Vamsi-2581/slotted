import { Component } from '@angular/core';
import { SlButton } from '@slotted/angular/button';
import { SlMenu, SlMenuItem, SlMenuSeparator, SlMenuTrigger } from '@slotted/angular/menu';

@Component({
  selector: 'app-menu-basic',
  imports: [SlButton, SlMenu, SlMenuItem, SlMenuSeparator, SlMenuTrigger],
  template: `
    <button slButton variant="outline" [slMenuTriggerFor]="document">Document</button>
    <sl-menu #document>
      <button slMenuItem shortcut="Mod+D">Duplicate</button>
      <button slMenuItem [disabled]="true">Publish</button>
      <hr slMenuSeparator />
      <button slMenuItem tone="danger">Delete…</button>
    </sl-menu>
  `,
})
export class MenuBasic {}
