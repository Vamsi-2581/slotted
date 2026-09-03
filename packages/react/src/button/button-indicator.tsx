/**
 * The ring, and the only thing that announces the wait.
 *
 * `role="progressbar"` with a name rather than `aria-busy` on the control:
 * `aria-busy` is not reliably announced on a button, and React Aria's pending
 * button and Primer's loading button both put a named progress element in the
 * accessibility tree instead. With the label kept at `opacity: 0` rather than
 * removed, the two names combine — "Save changes, Loading" — so the person
 * hears which action they are waiting for.
 *
 * It carries no value: the family knows that work is happening and never how
 * much of it is done. A progress bar with no `aria-valuenow` is indeterminate,
 * which is exactly the claim being made.
 */
export function ButtonIndicator({ label }: { label: string }) {
  return <span aria-label={label} data-part="indicator" role="progressbar" />;
}
