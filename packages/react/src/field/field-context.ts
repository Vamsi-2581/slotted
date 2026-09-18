import { createContext, useContext } from 'react';

import type { FieldContextValue, FieldCount, FieldIds } from './field.types';

/**
 * `undefined` outside a field, which is what lets a control this library ships
 * read the field when there is one and behave as itself when there is not.
 */
export const FieldContext = createContext<FieldContextValue | undefined>(undefined);

/**
 * What the field around this component says, or `undefined` if there is none.
 *
 * It is the hook a control reads to take its identifier, its description and
 * its state without being wrapped, which is the mechanism
 * `docs/history/designs/2026-08-31-field-aware-controls-design.md` states: a
 * control that wires itself cannot be written wrong.
 */
export function useField(): FieldContextValue | undefined {
  return useContext(FieldContext);
}

/** The four identifiers a field derives from its base, in one place. */
export function deriveFieldIds(base: string): FieldIds {
  return {
    control: `${base}-control`,
    description: `${base}-description`,
    error: `${base}-error`,
    label: `${base}-label`,
  };
}

/**
 * How a count reads: `12/280` when there is a limit and `12` when there is
 * none. Carbon and Polaris both write the pair; Angular Material writes it in
 * the subscript, where a count that appears on the first keystroke shares a row
 * with the error and pushes it.
 */
export function formatFieldCount(count: FieldCount): string {
  return count.max === undefined ? String(count.length) : `${count.length}/${count.max}`;
}

/** Whether a count has passed the limit it was given. */
export function isFieldCountOver(count: FieldCount): boolean {
  return count.max !== undefined && count.length > count.max;
}
