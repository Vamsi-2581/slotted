/**
 * Brings a row of a popup list into view without moving the page: the
 * nearest scrolling box between the row and the popup surface is scrolled, by
 * the least distance that shows the whole row, and nothing past it.
 * `scrollIntoView` scrolls every ancestor too, and on the first open it runs
 * before the popup is positioned — a control far down a page sent the page to
 * its top.
 */
export function revealWithin(option: HTMLElement, surface: HTMLElement): void {
  let box: HTMLElement = surface;
  for (
    let node = option.parentElement;
    node !== null && node !== surface;
    node = node.parentElement
  ) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') {
      box = node;
      break;
    }
  }
  const row = option.getBoundingClientRect();
  const top = box.getBoundingClientRect().top + box.clientTop;
  const bottom = top + box.clientHeight;
  if (row.top < top) box.scrollTop -= top - row.top;
  else if (row.bottom > bottom) box.scrollTop += Math.min(row.bottom - bottom, row.top - top);
}
