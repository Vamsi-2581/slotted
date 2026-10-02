import { signal } from '@angular/core';
import type { Theme } from '@slotted/theme';

import type { Customisation } from './customisation';

/** What a compile of a customisation needs from `custom-theme.ts`, which is loaded by `import()`. */
export type CustomThemeModule = Pick<typeof import('./custom-theme'), 'applyCustomTheme'>;

/**
 * One builder sheet on the page, under one name: the saved customisation that
 * `html` names, or the candidate the preview shows. A request is compiled
 * after `delay` ms in which no other request arrived, so a burst of changes —
 * a slider dragged across its range — compiles once, with its last value. A
 * request for what is already on the page compiles nothing. The compile
 * replaces the sheet in place (`applyTheme`), so the name never goes without
 * one once it has had one.
 */
export class CustomSheet {
  /** The theme on the page and what it was compiled from; `null` before the first compile. */
  readonly compiled = signal<{ readonly signature: string; readonly theme: Theme } | null>(null);

  private timer: ReturnType<typeof setTimeout> | undefined;
  private wanted: string | null = null;
  private dispose: (() => void) | null = null;
  private ended = false;

  constructor(
    readonly name: string,
    private readonly document: Document,
    private readonly delay: number,
    private readonly load: () => Promise<CustomThemeModule> = () => import('./custom-theme'),
  ) {}

  /** The key a customisation of a theme compiles under. */
  static signature(theme: string, customisation: Customisation): string {
    return JSON.stringify([theme, customisation]);
  }

  /** Asks for `customisation` of `theme`; the latest request within `delay` is the one compiled. */
  request(theme: string, customisation: Customisation): void {
    const signature = CustomSheet.signature(theme, customisation);
    this.wanted = signature;
    clearTimeout(this.timer);
    if (signature === this.compiled()?.signature) return;
    this.timer = setTimeout(() => {
      this.load().then(
        ({ applyCustomTheme }) => {
          if (this.ended || this.wanted !== signature) return;
          const applied = applyCustomTheme(theme, customisation, this.name, this.document);
          this.dispose = applied.dispose;
          this.compiled.set({ signature, theme: applied.theme });
        },
        () => undefined,
      );
    }, this.delay);
  }

  /** The compiled theme when it was compiled over `theme`, else `null`; a signal read. */
  themeOver(theme: string): Theme | null {
    const compiled = this.compiled();
    return compiled !== null && (JSON.parse(compiled.signature) as [string])[0] === theme
      ? compiled.theme
      : null;
  }

  /**
   * Drops any pending request and stops naming what is on the page: the
   * next customisation shows nothing older than itself. The sheet stays, to
   * be replaced in place by the next compile.
   */
  forget(): void {
    clearTimeout(this.timer);
    this.wanted = null;
    this.compiled.set(null);
  }

  /** Whether the sheet on the page is the one `customisation` of `theme` compiles to. */
  holds(theme: string, customisation: Customisation): boolean {
    return this.compiled()?.signature === CustomSheet.signature(theme, customisation);
  }

  /** Stops a pending compile and removes the sheet. */
  end(): void {
    this.ended = true;
    clearTimeout(this.timer);
    this.dispose?.();
  }
}
