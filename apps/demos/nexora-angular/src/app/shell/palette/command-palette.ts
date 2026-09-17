import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { SlCommandPalette } from '@slotted/angular/command-palette';

import type { DemoDrawer } from '../demo/demo-drawer';

/** Replaced by the full palette in the command palette task. */
@Component({
  selector: 'app-command-palette',
  imports: [SlCommandPalette],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<sl-command-palette [items]="[]" hotkey="mod+k" label="Search or jump to" />`,
})
export class CommandPalette {
  readonly palette = viewChild.required(SlCommandPalette);
  readonly drawer = signal<DemoDrawer | null>(null);
}
