import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SlAppShellNavToggle } from '@slotted/angular/app-shell';

import { BrandMark } from './brand-mark';

/** Replaced by the top-navigation banner in the next task. */
@Component({
  selector: 'app-banner',
  imports: [SlAppShellNavToggle, BrandMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button slAppShellNavToggle></button><app-brand-mark /> Nexora`,
})
export class Banner {}
