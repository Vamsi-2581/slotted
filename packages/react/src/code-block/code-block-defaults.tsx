import { createContext, useContext } from 'react';

import type {
  CodeBlockDefaults,
  CodeBlockDefaultsProviderProps,
  CodeBlockLabels,
} from './code-block.types';

export const CODE_BLOCK_LABELS: CodeBlockLabels = {
  region: 'Code',
  copy: 'Copy code',
  copied: 'Copied',
  copyFailed: 'Copy failed',
  wrap: 'Wrap lines',
  unwrap: 'Unwrap lines',
  reveal: 'Show {count} more lines',
  collapse: 'Show less',
  loading: 'Loading code',
};

const CodeBlockDefaultsContext = createContext<CodeBlockDefaults>({});

export function useCodeBlockDefaults(): CodeBlockDefaults {
  return useContext(CodeBlockDefaultsContext);
}

/**
 * An application that has loaded an engine once hands it to every block on
 * the page here — Mantine's `CodeHighlightAdapterProvider` — along with
 * whether blocks number their lines, whether they carry a copy control, and
 * what the family says in the language it ships. A block that states any of
 * those itself still wins.
 */
export function CodeBlockDefaultsProvider({
  children,
  ...defaults
}: CodeBlockDefaultsProviderProps) {
  const inherited = useCodeBlockDefaults();

  return (
    <CodeBlockDefaultsContext.Provider
      value={{
        copy: defaults.copy ?? inherited.copy,
        highlight: defaults.highlight ?? inherited.highlight,
        labels: { ...inherited.labels, ...defaults.labels },
        lineNumbers: defaults.lineNumbers ?? inherited.lineNumbers,
      }}
    >
      {children}
    </CodeBlockDefaultsContext.Provider>
  );
}
