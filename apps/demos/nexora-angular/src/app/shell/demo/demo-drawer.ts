import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SlDrawer, SlDrawerBody, SlDrawerHeader, SlDrawerTitle } from '@slotted/angular/drawer';

/** Replaced by the full panel in the demo task. */
@Component({
  selector: 'app-demo-drawer',
  imports: [SlDrawer, SlDrawerBody, SlDrawerHeader, SlDrawerTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sl-drawer [(open)]="open" side="end" aria-label="Demo controls">
      <header slDrawerHeader><h2 slDrawerTitle>Demo controls</h2></header>
      <div slDrawerBody></div>
    </sl-drawer>
  `,
})
export class DemoDrawer {
  readonly open = signal(false);

  openAt(_section?: 'persona' | 'scenario' | 'reset'): void {
    this.open.set(true);
  }
}
