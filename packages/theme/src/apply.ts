import { parseSeed } from './color';
import type { Theme } from './define';
import { SEED_NAMES, type SeedName } from './recipe';
import { renderTheme } from './render';

/** Dispatched on the document when a theme stylesheet is applied or removed. */
export const THEME_CHANGE_EVENT = 'slotted-themechange';

export interface ThemeChangeDetail {
  readonly name: string;
  readonly applied: boolean;
}

/**
 * Puts a theme on the page without a build: one `<style>` per theme name in
 * the head, replaced in place when the same name is applied again. The
 * returned function removes it.
 */
export function applyTheme(
  theme: Theme,
  options: { readonly document?: Document } = {},
): () => void {
  const doc = options.document ?? globalThis.document;
  if (!doc) throw new Error(`${theme.name}: applyTheme needs a document`);
  const css = renderTheme(theme);
  let sheet = doc.head.querySelector<HTMLStyleElement>(
    `style[data-slotted-theme-sheet="${theme.name}"]`,
  );
  if (!sheet) {
    sheet = doc.createElement('style');
    sheet.setAttribute('data-slotted-theme-sheet', theme.name);
    doc.head.append(sheet);
  }
  if (sheet.textContent !== css) sheet.textContent = css;

  const announce = (applied: boolean) =>
    doc.dispatchEvent(
      new CustomEvent<ThemeChangeDetail>(THEME_CHANGE_EVENT, {
        detail: { name: theme.name, applied },
      }),
    );
  announce(true);

  const element = sheet;
  return () => {
    if (!element.isConnected) return;
    element.remove();
    announce(false);
  };
}

/** The `style` object that gives an element its own seeds, for React `style` and Angular `[style]`. */
export function seedStyle(
  seeds: Readonly<Partial<Record<SeedName, string>>>,
): Record<string, string> {
  const style: Record<string, string> = {};
  for (const name of SEED_NAMES) {
    const value = seeds[name];
    if (value === undefined) continue;
    if (parseSeed(value) === null) {
      throw new Error(`seed ${name} ${JSON.stringify(value)} is neither #rrggbb nor oklch(L C H)`);
    }
    style[`--slotted-seed-${name}`] = value;
  }
  return style;
}
