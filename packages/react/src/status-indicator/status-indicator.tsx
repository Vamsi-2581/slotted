import '@slotted/styles/status-indicator/status-indicator.css';
import '@slotted/styles/visually-hidden/visually-hidden.css';

import { useStatusIndicatorDefaults } from './status-indicator-defaults';
import {
  STATUS_INDICATOR_DEFAULT_STATUS,
  STATUS_INDICATOR_LABELS,
} from './status-indicator.constants';
import type { StatusIndicatorProps, StatusIndicatorRootProps } from './status-indicator.types';

/**
 * What `live` writes on the root. The names are the platform's: `status` is a
 * polite live region with an implicit `aria-atomic`, so the mark and its word
 * are announced as one thing; `alert` interrupts, which the APG's Alert
 * pattern reserves for a message that needs immediate attention.
 */
const ROLE = { off: undefined, polite: 'status', assertive: 'alert' } as const;

/**
 * The operational state of something the application observes.
 *
 * The family reports; it never moves the value. That is why there is no
 * controlled and uncontrolled pair and no change request here — `status` is
 * the application's fact about a system this component cannot see, the same
 * relationship a progress range has to the work it reports.
 *
 * It is always named. Given words, those words are the name; given none, the
 * status's own word is rendered and clipped from view. Neither branch reaches
 * for `role="img"` and an `aria-label`, which is what Fluent's presence badge
 * does: real text in the document is what lets a live region announce its own
 * contents, lets an `aria-labelledby` elsewhere point at it, and lets a page
 * search find the word.
 */
export function StatusIndicator({
  children,
  label,
  live,
  mark,
  pulse = false,
  render,
  role,
  size,
  status = STATUS_INDICATOR_DEFAULT_STATUS,
  ...nativeProps
}: StatusIndicatorProps) {
  const defaults = useStatusIndicatorDefaults();
  const resolved = {
    live: live ?? defaults.live ?? 'off',
    mark: mark ?? defaults.mark ?? 'dot',
    size: size ?? defaults.size ?? 'md',
  };

  const name = label ?? defaults.labels?.[status] ?? STATUS_INDICATOR_LABELS[status];

  const rootProps: StatusIndicatorRootProps = {
    ...nativeProps,
    /**
     * The mark is hidden rather than left to be ignored. It is an empty box
     * painted by a background and a mask, so nothing would be announced
     * either way — but a family whose whole subject is what a reader hears
     * should say which of its parts is not for them.
     *
     * The label part is always rendered, even holding nothing but the clipped
     * word, so the two bindings and the harness write one shape rather than
     * three. The stylesheet takes the gap back when that is all it holds.
     */
    children: (
      <>
        <span aria-hidden="true" data-part="mark" />
        <span data-part="label">
          {children ?? (
            <span data-part="announcement" data-ui="visually-hidden">
              {name}
            </span>
          )}
        </span>
      </>
    ),
    'data-mark': resolved.mark,
    'data-part': 'root',
    'data-pulse': pulse || undefined,
    'data-size': resolved.size,
    'data-status': status,
    'data-ui': 'status-indicator',
    /* An explicit role the consumer wrote is never replaced by an inferred one. */
    ...(role === undefined ? {} : { role }),
    ...(role === undefined && ROLE[resolved.live] !== undefined
      ? { role: ROLE[resolved.live] }
      : {}),
  };

  return render === undefined ? <span {...rootProps} /> : render(rootProps);
}
