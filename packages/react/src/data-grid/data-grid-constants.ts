import type { ResolvedGridColumn } from '@slotted/core/grid';
import type { CSSProperties } from 'react';

/** The two gutter columns the family adds before the model's own. */
export const SELECTION_COLUMN = '__selection';
export const EXPANDER_COLUMN = '__expander';
export const SELECTION_WIDTH = 48;
export const EXPANDER_WIDTH = 40;

/** The single widget a cell may hold, which takes the focus in the cell's place. */
export const SIMPLE_WIDGET =
  'a[href], button, input[type="checkbox"], input[type="radio"], [role="switch"], [role="button"], [role="checkbox"]';
export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** The place of a cell in the template, and its pin offset. */
export function cellStyle<Row>(column: ResolvedGridColumn<Row>, index: number): CSSProperties {
  const style: Record<string, string> = { '--slotted-data-grid-column': String(index) };
  if (column.pinned) style['--slotted-data-grid-pin-offset'] = `${column.pinOffset}px`;
  return style as CSSProperties;
}

/** The attributes every cell of a column carries, in the header and the body. */
export function columnAttributes<Row>(column: ResolvedGridColumn<Row>) {
  return {
    ...(column.align ? { 'data-align': column.align } : {}),
    ...(column.numeric ? { 'data-numeric': '' } : {}),
    ...(column.pinned ? { 'data-pinned': column.pinned } : {}),
    ...(column.pinEdge ? { 'data-pin-edge': '' } : {}),
    'data-column': column.id,
  };
}
