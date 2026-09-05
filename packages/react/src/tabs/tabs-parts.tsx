import { useCallback } from 'react';
import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { useTabs } from './tabs';
import type {
  TabActionsProps,
  TabListProps,
  TabListRootProps,
  TabPanelProps,
  TabPanelRootProps,
  TabProps,
  TabRootProps,
  TabsSelectionReason,
} from './tabs.types';

/**
 * A click synthesised by the keyboard reports no detail; a real one reports the
 * click count. It is the rule every activating family in this library writes,
 * and it is why `Enter`, `Space` and a pointer are told apart without a key
 * listener existing for activation.
 */
function activationReason(event: MouseEvent<HTMLElement>): TabsSelectionReason {
  return event.detail === 0 ? 'keyboard' : 'pointer';
}

/**
 * The list of tabs, and the one tab stop the family holds.
 *
 * It hands its element to the root, which owns the roving tab stop, the removal
 * focus and the overflow observer — all three are about this element, and the
 * root is what holds the value they act on. `tabIndex={-1}` is the last resort
 * of the removal focus: a list emptied by its final dismissal keeps focus
 * rather than returning it to the top of the page.
 *
 * Its accessible name is the consumer's own `aria-label` or `aria-labelledby`.
 * The family writes neither: only the page knows what the set of views is for.
 */
export function TabList({ children, ref, render, ...nativeProps }: TabListProps) {
  const tabs = useTabs();

  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      tabs.attachList(node);
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref, tabs.attachList],
  );

  const rootProps: TabListRootProps = {
    tabIndex: -1,
    ...nativeProps,
    ...(tabs.orientation === 'vertical' ? { 'aria-orientation': 'vertical' as const } : {}),
    children,
    'data-part': 'list',
    role: 'tablist',
  };

  return render === undefined ? (
    <div {...rootProps} ref={attach} />
  ) : (
    render({ ...rootProps, ref: attach } as TabListRootProps)
  );
}

/**
 * One tab, in the box that holds it.
 *
 * The box is presentational and it exists for two reasons a `button` cannot
 * answer: a `button` may not contain a `button`, so a dismissible tab needs
 * somewhere to put its second control, and the marker has to span the pair
 * rather than only the label.
 *
 * `className`, `style` and `render` reach that box; every native prop and the
 * `ref` reach the control, which is what `radio-group` does with its own item
 * and control. `href` makes the control an anchor, and a click carrying a
 * modifier key is left to the browser so a deep link still opens in a new
 * browser tab.
 */
export function Tab({
  children,
  className,
  disabled,
  dismissLabel,
  dismissible = false,
  href,
  onClick,
  onKeyDown,
  ref,
  render,
  style,
  value,
  ...nativeProps
}: TabProps) {
  const tabs = useTabs();
  const { panelId, tabId } = tabs.identify(value);

  const selected = tabs.value === value;
  /**
   * A family out of action takes every tab with it, and a tab's own prop can
   * only add to that. `disabled={false}` on a tab inside a disabled family says
   * nothing about the family.
   */
  const resolvedDisabled = tabs.disabled === true || disabled === true;

  function handleClick(event: MouseEvent<HTMLElement>) {
    onClick?.(event as MouseEvent<HTMLButtonElement>);
    if (event.defaultPrevented) return;
    if (resolvedDisabled) return;
    /* A modifier click on a link is the reader asking the browser for a new
       window or a new browser tab, and swallowing it is what turns a real
       destination into a decoration. */
    if (href !== undefined && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) {
      return;
    }
    if (href !== undefined) event.preventDefault();
    tabs.select(value, activationReason(event), event);
  }

  /**
   * `Delete` closes the tab, which is the key the APG names for it. A held key
   * repeats, and a repeat would close the tab focus has just landed on.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event as KeyboardEvent<HTMLButtonElement>);
    if (event.defaultPrevented || event.repeat) return;
    if (!dismissible || resolvedDisabled) return;
    if (event.key !== 'Delete') return;

    event.preventDefault();
    tabs.dismiss(value, 'keyboard', event);
  }

  const control =
    href === undefined ? (
      <button
        {...nativeProps}
        aria-controls={panelId}
        aria-keyshortcuts={dismissible ? 'Delete' : undefined}
        aria-selected={selected}
        data-part="tab"
        data-value={value}
        disabled={resolvedDisabled}
        id={tabId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={ref}
        role="tab"
        tabIndex={selected ? 0 : -1}
        type="button"
      >
        <span data-part="label">{children}</span>
      </button>
    ) : (
      <a
        {...(nativeProps as HTMLAttributes<HTMLAnchorElement>)}
        aria-controls={panelId}
        aria-disabled={resolvedDisabled === true ? true : undefined}
        aria-keyshortcuts={dismissible ? 'Delete' : undefined}
        aria-selected={selected}
        data-part="tab"
        data-value={value}
        href={href}
        id={tabId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        role="tab"
        tabIndex={selected ? 0 : -1}
      >
        <span data-part="label">{children}</span>
      </a>
    );

  const rootProps: TabRootProps = {
    children: (
      <>
        {control}
        {dismissible ? (
          <button
            aria-label={dismissLabel}
            data-part="dismiss"
            disabled={resolvedDisabled}
            onClick={(event) => {
              /* The dismiss control sits inside the item, and the item's click
                 would otherwise select the tab that is being closed. */
              event.stopPropagation();
              tabs.dismiss(value, 'pointer', event);
            }}
            /**
             * Out of the arrow ring, so the pattern's own model is untouched,
             * and inside the accessibility tree, so it is not a control only a
             * mouse can reach. The keyboard path is `Delete`, which the tab
             * announces through `aria-keyshortcuts`.
             */
            tabIndex={-1}
            type="button"
          />
        ) : null}
      </>
    ),
    className,
    'data-part': 'item',
    ...(selected ? { 'data-selected': '' } : {}),
    role: 'presentation',
    style,
  };

  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}

/**
 * The content of one tab.
 *
 * It is in the page's tab sequence, which is where `Tab` from the list goes,
 * and it is hidden with the attribute rather than with a class: a screen
 * reader, find-in-page and `:target` all already understand `hidden`.
 *
 * Whether it exists at all is what `mount` decides — `active` builds it on
 * selection, `lazy` keeps it once built, `eager` builds every panel up front.
 */
export function TabPanel({ children, ref, render, value, ...nativeProps }: TabPanelProps) {
  const tabs = useTabs();
  const { panelId, tabId } = tabs.identify(value);

  const selected = tabs.value === value;
  const present = selected || tabs.mount === 'eager' || (tabs.mount === 'lazy' && tabs.seen(value));
  if (!present) return null;

  const rootProps: TabPanelRootProps = {
    ...nativeProps,
    'aria-labelledby': tabId,
    children,
    'data-part': 'panel',
    hidden: !selected,
    id: panelId,
    role: 'tabpanel',
    tabIndex: 0,
  };

  return render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * The slot beside the list, on the same row.
 *
 * What belongs in it is a `toolbar`: one tab stop for however many actions the
 * page puts there, which is what keeps the distance between the tab list and
 * the panel to the two stops the pattern asks for.
 */
export function TabActions({ children, ref, render, ...nativeProps }: TabActionsProps) {
  useTabs();

  const rootProps: HTMLAttributes<HTMLElement> & { 'data-part': string } = {
    ...nativeProps,
    children,
    'data-part': 'actions',
  };

  return render === undefined ? <div {...rootProps} ref={ref} /> : (render(rootProps) as ReactNode);
}
