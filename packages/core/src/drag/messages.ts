/**
 * What a screen reader hears, in English, until the family or the
 * application says it otherwise. Every sentence is built from labels the
 * consumer supplied and the two numbers the APG's rearrangeable listbox says
 * after every move: the position and the count.
 */

import type { DragMessageContext, DragMessages } from './types';

function where({ state, position, total, targetLabel }: DragMessageContext): string {
  const target = state.target;
  if (target === null) return '';
  if (target.kind === 'on') return targetLabel === null ? '' : ` on ${targetLabel}`;
  if (target.kind === 'root') return targetLabel === null ? '' : ` in ${targetLabel}`;
  const at = position === null || total === null ? '' : ` position ${position} of ${total}`;
  const container = targetLabel === null ? '' : ` in ${targetLabel}`;
  return `${at}${container}`;
}

function sentence(item: string, verb: string, context: DragMessageContext): string {
  const place = where(context).trim();
  return place === '' ? `${item} ${verb}.` : `${item} ${verb}, ${place}.`;
}

export const DEFAULT_DRAG_MESSAGES: DragMessages = {
  instructions:
    'Press Space or Enter to pick up. Use the arrow keys to move, Space or Enter to drop, and Escape to cancel.',
  pickedUp: (context) => sentence(context.item, 'picked up', context),
  moved: (context) => {
    const place = where(context).trim();
    return place === '' ? `${context.item} moved.` : `${context.item}, ${place}.`;
  },
  dropped: (context) =>
    sentence(context.item, context.operation === 'copy' ? 'copied' : 'dropped', context),
  cancelled: (context) => `Drag cancelled. ${context.item} returned.`,
  nowhere: () => 'No place to drop.',
};
