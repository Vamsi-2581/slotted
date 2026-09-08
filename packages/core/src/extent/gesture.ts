/**
 * What a resize gesture does to the document while the pointer is down, and
 * undoes when it comes up.
 *
 * Two things, and neither belongs to the family's own stylesheet. The cursor
 * has to survive the pointer leaving the separator — pointer capture keeps the
 * events coming and the cursor is decided by whatever is under the pointer, so
 * a drag that reached the page beside the panel showed a text caret over it.
 * And a drag across text selects it, which is what `user-select` on the
 * document answers; a rule on the family would only cover the family's own box.
 *
 * The previous inline values are put back rather than cleared, so a consumer
 * who had set either keeps it. This is the one file in `@slotted/core/extent`
 * that touches the DOM; the arithmetic beside it touches none.
 */
export type ResizeCursor = 'col-resize' | 'row-resize';

/**
 * Holds the cursor and suspends selection for the life of a drag. Returns the
 * function that puts both back, which is safe to call more than once.
 */
export function holdResizeGesture(
  document: Document | null | undefined,
  cursor: ResizeCursor,
): () => void {
  const body = document?.body;
  const root = document?.documentElement;
  if (body === undefined || body === null || root === undefined || root === null) {
    return () => undefined;
  }

  const priorCursor = body.style.cursor;
  const priorSelect = root.style.userSelect;
  body.style.cursor = cursor;
  root.style.userSelect = 'none';

  let released = false;
  return () => {
    if (released) return;
    released = true;
    body.style.cursor = priorCursor;
    root.style.userSelect = priorSelect;
  };
}
