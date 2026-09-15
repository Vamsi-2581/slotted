import { InjectionToken, inject } from '@angular/core';
import type { CodeHighlighter, CodeMark } from '@slotted/core/code';

export type CodeBlockWrapReason = 'pointer' | 'keyboard' | 'programmatic';
export type CodeBlockRevealedReason = 'pointer' | 'keyboard' | 'escape' | 'programmatic';
export type { CodeMark };

/** What the family says, so an application translates once. */
export interface CodeBlockLabels {
  /** The scroll region's name when the block has no title. */
  region: string;
  copy: string;
  copied: string;
  copyFailed: string;
  wrap: string;
  unwrap: string;
  reveal: (count: number) => string;
  collapse: string;
  loading: string;
}

export const CODE_BLOCK_DEFAULT_LABELS: CodeBlockLabels = {
  collapse: 'Show less',
  copied: 'Copied',
  copy: 'Copy code',
  copyFailed: 'Copy failed',
  loading: 'Loading code',
  region: 'Code',
  reveal: (count) => `Show ${count} more lines`,
  unwrap: 'Unwrap lines',
  wrap: 'Wrap lines',
};

export interface CodeBlockCopyRequest {
  readonly value: string;
  readonly reason: 'pointer' | 'keyboard';
  readonly copied: boolean;
  readonly source?: Event | undefined;
}

export interface CodeBlockDefaults {
  highlight?: CodeHighlighter;
  lineNumbers?: boolean;
  copy?: boolean;
  labels?: Partial<CodeBlockLabels>;
}

export const CODE_BLOCK_DEFAULTS_TOKEN = new InjectionToken<CodeBlockDefaults>(
  'slotted code-block defaults',
  { providedIn: 'root', factory: (): CodeBlockDefaults => ({}) },
);

/**
 * An application that has loaded an engine once hands it to every block here,
 * along with whether blocks number their lines, carry a copy control, and what
 * the family says. A block that states any of those itself still wins.
 */
export function provideCodeBlockDefaults(defaults: CodeBlockDefaults) {
  return { provide: CODE_BLOCK_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectCodeBlockDefaults(): CodeBlockDefaults {
  return inject(CODE_BLOCK_DEFAULTS_TOKEN);
}
