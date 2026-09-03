import type { SyntheticEvent } from 'react';

import { ButtonContent } from './button-content';
import { BUTTON_LINK_DEFAULTS } from './button.constants';
import { blockActivation, rootData, useAppearance } from './button-root';
import type { ButtonLinkProps, ButtonLinkRootProps } from './button.types';

/**
 * Navigation wearing the action surface. It is the button surface applied to
 * an anchor, never a button emulating a link: the element is an `a`, the
 * activation is the platform's, and Space does not activate it because Space
 * does not activate a link.
 *
 * A disabled ButtonLink renders no `href` at all. An anchor that keeps its
 * destination and only blocks `click` still navigates on a middle click and on
 * a modified click; taking the destination away is what actually disables it.
 * It stays in the tab sequence with `role="link"` and `aria-disabled`, because
 * a control a keyboard user cannot reach is one they cannot discover is
 * unavailable.
 */
export function ButtonLink({
  children,
  disabled = false,
  end,
  fullWidth = false,
  href,
  onAuxClick,
  onAuxClickCapture,
  onClick,
  onClickCapture,
  onKeyDown,
  onKeyDownCapture,
  render,
  size,
  start,
  tone,
  variant,
  ...anchorProps
}: ButtonLinkProps) {
  const appearance = useAppearance({ size, tone, variant }, BUTTON_LINK_DEFAULTS);

  const block = (event: SyntheticEvent) => {
    if (!disabled) return false;
    blockActivation(event);
    return true;
  };

  const rootProps: ButtonLinkRootProps = {
    ...anchorProps,
    ...rootData({ disabled, fullWidth, ...appearance }),
    'aria-disabled': disabled || undefined,
    children: (
      <ButtonContent end={end} start={start}>
        {children}
      </ButtonContent>
    ),
    role: disabled ? 'link' : undefined,
    tabIndex: disabled ? (anchorProps.tabIndex ?? 0) : anchorProps.tabIndex,
    ...(render === undefined && !disabled ? { href } : {}),
    onAuxClick: (event) => {
      if (block(event)) return;
      onAuxClick?.(event);
    },
    onAuxClickCapture: (event) => {
      if (block(event)) return;
      onAuxClickCapture?.(event);
    },
    onClick: (event) => {
      if (block(event)) return;
      onClick?.(event);
    },
    onClickCapture: (event) => {
      if (block(event)) return;
      onClickCapture?.(event);
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' && block(event)) return;
      onKeyDown?.(event);
    },
    onKeyDownCapture: (event) => {
      if (event.key === 'Enter' && block(event)) return;
      onKeyDownCapture?.(event);
    },
  };

  return render === undefined ? <a {...rootProps} /> : render(rootProps);
}
