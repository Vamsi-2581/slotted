/**
 * The rows a widget's content needs, read from the card the widget holds:
 * the card's height less its body's, plus the extent of what the body holds,
 * in rows of the grid's track and gap. The extent is read from the body's
 * last child rather than from the body, which a cell taller than the content
 * stretches; so the measure follows the content both up and down.
 */
export function contentRowsOf(card: HTMLElement, list: HTMLElement): number | null {
  const body = card.querySelector<HTMLElement>(':scope > [data-part="body"]');
  if (body === null) return null;
  const styles = getComputedStyle(list);
  const row = parseFloat(styles.gridAutoRows);
  const gap = parseFloat(styles.rowGap) || 0;
  if (!(row > 0)) return null;
  const own = getComputedStyle(body);
  const top = body.getBoundingClientRect().top - body.scrollTop;
  const last = body.lastElementChild;
  const extent =
    (last === null
      ? parseFloat(own.paddingBlockStart) || 0
      : last.getBoundingClientRect().bottom - top) + (parseFloat(own.paddingBlockEnd) || 0);
  const needed = card.offsetHeight - body.offsetHeight + extent;
  return Math.max(1, Math.ceil((needed + gap) / (row + gap)));
}

/**
 * Calls `onRows` with the rows the card's content needs, now and whenever the
 * card or what its body holds changes size. Returns the teardown.
 */
export function observeContentRows(
  card: HTMLElement,
  list: HTMLElement,
  onRows: (rows: number) => void,
): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {};
  let last: number | null = null;
  const measure = () => {
    const rows = contentRowsOf(card, list);
    if (rows !== null && rows !== last) {
      last = rows;
      onRows(rows);
    }
  };
  const sizes = new ResizeObserver(measure);
  const watch = () => {
    sizes.disconnect();
    sizes.observe(card);
    const body = card.querySelector(':scope > [data-part="body"]');
    for (const child of body?.children ?? []) sizes.observe(child);
  };
  const children = new MutationObserver(() => {
    watch();
    measure();
  });
  const body = card.querySelector(':scope > [data-part="body"]');
  if (body !== null) children.observe(body, { childList: true });
  watch();
  measure();
  return () => {
    sizes.disconnect();
    children.disconnect();
  };
}
