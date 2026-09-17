import { Injectable, signal } from '@angular/core';

/** Completed in the shortcuts task; the dialog flag is what the menus need now. */
@Injectable({ providedIn: 'root' })
export class ShortcutsService {
  readonly dialogOpen = signal(false);

  openDialog(): void {
    this.dialogOpen.set(true);
  }
}
