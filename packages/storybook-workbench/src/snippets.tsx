/**
 * A snippet is not always framework code. A family whose public contract is
 * `data-ui` answers questions — the default every icon takes, the stroke weight
 * an icon set needs — with a stylesheet rule that belongs to neither binding,
 * and a drawer that can only say React or Angular leaves that answer
 * undocumented in both reference pages.
 */
export type SnippetLanguage = 'angular' | 'css' | 'tsx';

export interface WorkbenchSnippet {
  id: string;
  label: string;
  language: SnippetLanguage;
  source: string;
}

export function defineSnippet(snippet: WorkbenchSnippet): WorkbenchSnippet {
  return Object.freeze({ ...snippet, source: `${snippet.source.trim()}\n` });
}
