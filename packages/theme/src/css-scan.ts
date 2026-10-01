/**
 * Walks CSS text once, tracking whether each character sits inside a quoted
 * string or a `/* ... *\/` comment. Every reader of raw, interpolated CSS
 * text — splitting a theme's rules into statements, or checking that a value
 * carries no structural character — needs the same state, because `;`, `{`
 * and `}` only mean what they look like when neither a string nor a comment
 * is open. `handlers.onCodeChar` runs for every other character;
 * `handlers.onComment` runs once a comment closes, with its start index and
 * the index right after it.
 */

export interface ScanHandlers {
  readonly onCodeChar?: (char: string, index: number) => void;
  readonly onComment?: (start: number, end: number) => void;
}

export interface ScanEnd {
  /** The quote character still open at the end of the text, or `null`. */
  readonly openQuote: string | null;
  /** The index of a `/*` that never found its `*\/`, or `null`. */
  readonly openCommentAt: number | null;
}

export function scanCssText(text: string, handlers: ScanHandlers = {}): ScanEnd {
  let quote: string | null = null;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && text[index + 1] === '*') {
      const end = text.indexOf('*/', index + 2);
      if (end === -1) return { openQuote: null, openCommentAt: index };
      handlers.onComment?.(index, end + 2);
      index = end + 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    handlers.onCodeChar?.(char, index);
  }
  return { openQuote: quote, openCommentAt: null };
}
