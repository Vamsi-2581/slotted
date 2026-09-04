/**
 * Putting a value on the clipboard, and saying whether it got there.
 *
 * `navigator.clipboard.writeText` is the whole implementation. The
 * `document.execCommand('copy')` fallback is declined: it exists for insecure
 * contexts, and a details panel showing an account identifier over plain HTTP
 * has a larger problem than a copy button. Where the write is refused — no
 * clipboard, a denied permission, a document without focus — this returns
 * `false`, the control returns to rest, and the value is still selectable
 * text, which is what a reader had before the button existed.
 *
 * The Angular binding holds the same eight lines rather than importing them
 * through `@slotted/core`: a core module exists for behaviour two bindings
 * would otherwise get *differently* wrong, and there is one way to await one
 * promise. `description-list.spec.ts` asserts the same three outcomes.
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard === undefined || typeof clipboard.writeText !== 'function') return false;

  try {
    await clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
