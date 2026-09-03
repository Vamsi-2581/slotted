import '@slotted/styles/toolbar/toolbar.css';

import { createRovingTabindex, TOOLBAR_ITEM_SELECTOR, toolbarOwnedKeys } from '@slotted/core/focus';
import { useCallback, useEffect, useRef } from 'react';

import { useToolbarDefaults } from './toolbar-defaults';
import type { ToolbarProps, ToolbarRootProps } from './toolbar.types';

/**
 * A set of controls that share one tab stop.
 *
 * **The keyboard is the whole point of the role.** `Tab` enters the bar once
 * and lands on the control that last had focus, the arrows of the flow axis
 * move between the controls and wrap — from row to row when the bar wrapped,
 * because the item list is linear — and `Home` and `End` reach the ends. The
 * cross axis duplicates the pair, which the APG permits and which is what gives
 * focus a way out of an item that keeps the flow arrows for itself.
 *
 * **The items are the consumer's own controls.** Anything focusable inside the
 * bar is an item, found through `TOOLBAR_ITEM_SELECTOR`, so this library's
 * `button`, `link`, `checkbox`, `switch` and `text-field` — and a menu trigger,
 * and a consumer's own control — drop in unwrapped. Radix and Base UI wrap each
 * item in a component of their own instead. An element that cannot hold focus
 * is not an item.
 *
 * **The bar paints itself and nothing inside it.** Every control keeps its own
 * fill, its own states and its own step, which is what lets one bar hold a
 * small icon button beside a medium select. A bar out of action is
 * `<fieldset disabled>` around it: the platform disables every control inside
 * and, because a natively disabled control cannot be focused, the arrows skip
 * exactly those.
 *
 * The APG uses the role for three or more controls. That is guidance rather
 * than a rule here: a role that disappeared when a permission filter removed a
 * button would be a semantic changing behind the author.
 */
export function Toolbar({
  children,
  className,
  loop,
  orientation,
  overflow,
  ref,
  render,
  size,
  style,
  variant,
  ...nativeProps
}: ToolbarProps) {
  const defaults = useToolbarDefaults();
  const element = useRef<HTMLDivElement | null>(null);

  const resolvedLoop = loop ?? defaults.loop;
  const resolvedOrientation = orientation ?? defaults.orientation;
  const resolvedOverflow = overflow ?? defaults.overflow;
  const resolvedSize = size ?? defaults.size;
  const resolvedVariant = variant ?? defaults.variant;

  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      element.current = node;
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref],
  );

  useEffect(() => {
    const container = element.current;
    if (container === null) return undefined;

    const tabindex = createRovingTabindex(container, {
      /**
       * The APG lets a toolbar duplicate the cross-axis pair, and here it earns
       * its keep twice: it is how focus leaves a text field that owns the flow
       * arrows, and it is what a reader tries first in a bar that wrapped.
       */
      crossAxis: true,
      /**
       * A control that announces `aria-disabled` keeps its place in the ring,
       * which the APG allows where "discoverability of a function is crucial" —
       * and which is exactly what `button`'s `focusableWhenDisabled` renders. A
       * control carrying the native attribute is skipped, because the platform
       * will not focus it either.
       */
      includeAriaDisabled: true,
      itemSelector: TOOLBAR_ITEM_SELECTOR,
      loop: resolvedLoop,
      orientation: () => resolvedOrientation,
      ownedKeys: (item) => toolbarOwnedKeys(item, resolvedOrientation),
    });

    /**
     * A control arriving or leaving has to reach the tab stop, and neither
     * binding can be told by the other's change detection. The DOM is the one
     * thing they agree on.
     */
    const observer = new MutationObserver(() => tabindex.refresh());
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      tabindex.destroy();
    };
  }, [resolvedLoop, resolvedOrientation]);

  const rootProps: ToolbarRootProps = {
    ...nativeProps,
    ...(resolvedOrientation === 'vertical' ? { 'aria-orientation': 'vertical' as const } : {}),
    children,
    className,
    'data-orientation': resolvedOrientation,
    'data-overflow': resolvedOverflow,
    'data-part': 'root',
    'data-size': resolvedSize,
    'data-ui': 'toolbar',
    'data-variant': resolvedVariant,
    role: 'toolbar',
    style,
  };

  return render === undefined ? (
    <div {...rootProps} ref={attach} />
  ) : (
    render({ ...rootProps, ref: attach } as ToolbarRootProps)
  );
}
