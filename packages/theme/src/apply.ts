import type { Theme } from './define';
import { renderTheme } from './render';

/** Dispatched on the document when a theme stylesheet is applied or removed. */
export const THEME_CHANGE_EVENT = 'slotted-themechange';

export interface ThemeChangeDetail {
  readonly name: string;
  readonly applied: boolean;
}

/**
 * Which call most recently wrote a theme's sheet. Two live `applyTheme` calls
 * for the same name share the element — a second call updates it in place
 * rather than creating another one — so a disposer must not act on its
 * element's mere presence: that would let the first call's disposer remove a
 * sheet the second call still owns, after the first unmounts later than the
 * second re-applied. A disposer acts only when its own token is still the
 * element's current one.
 */
const OWNER = new WeakMap<HTMLStyleElement, symbol>();

/**
 * Puts a theme on the page without a build: one `<style>` per theme name in
 * the head, replaced in place when the same name is applied again. The
 * returned function removes it, but only while its call is still the latest
 * one to have applied that name; a call a later one has superseded disposes
 * to a no-op, as does calling the same disposer more than once.
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

  const element = sheet;
  const token = Symbol('slotted-theme-sheet-owner');
  OWNER.set(element, token);

  const announce = (applied: boolean) =>
    doc.dispatchEvent(
      new CustomEvent<ThemeChangeDetail>(THEME_CHANGE_EVENT, {
        detail: { name: theme.name, applied },
      }),
    );
  announce(true);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    if (OWNER.get(element) !== token) return;
    OWNER.delete(element);
    if (!element.isConnected) return;
    element.remove();
    announce(false);
  };
}
