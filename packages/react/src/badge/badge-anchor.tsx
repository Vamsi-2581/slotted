import type { BadgeAnchorProps, BadgeAnchorRootProps } from './badge.types';

/**
 * The frame that places a badge on the corner of something else. It wraps the
 * host rather than rewriting it: React cannot safely reach into an element it
 * did not render, and a frame that only worked when the host was one of the
 * elements it knew would fail silently on every other one.
 *
 * The consequence is written on the reference page: the badge is read after the
 * host in document order, and an interactive host whose name must carry the
 * count wires `aria-describedby` to the badge's own id, or names the count in
 * its own `aria-label`.
 *
 * The badge is the anchor's last child, after the host it sits on.
 */
export function BadgeAnchor({
  overlap = 'rectangle',
  placement = 'top-end',
  render,
  ...nativeProps
}: BadgeAnchorProps) {
  const rootProps: BadgeAnchorRootProps = {
    ...nativeProps,
    'data-overlap': overlap,
    'data-part': 'anchor',
    'data-placement': placement,
    'data-ui': 'badge',
  };

  return render === undefined ? <span {...rootProps} /> : render(rootProps);
}
