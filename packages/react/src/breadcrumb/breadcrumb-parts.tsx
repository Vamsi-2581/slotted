import { Children, isValidElement, type ReactNode } from 'react';

import { BreadcrumbItemProvider, useBreadcrumb, useBreadcrumbItem } from './breadcrumb';
import type {
  BreadcrumbItemProps,
  BreadcrumbItemRootProps,
  BreadcrumbLinkProps,
  BreadcrumbLinkRootProps,
  BreadcrumbListProps,
  BreadcrumbListRootProps,
  BreadcrumbPageProps,
  BreadcrumbPageRootProps,
} from './breadcrumb.types';

/**
 * Which crumbs survive a collapse, as indices into the trail.
 *
 * A collapsed trail is always the same shape — so many at the start, the
 * ellipsis, so many at the end — whatever it is folding, which is what makes
 * `maxItems` a number a consumer can predict from. It refuses only when there
 * is nothing left in the middle to hide.
 *
 * It once refused to hide a single crumb as well, on the reasoning that
 * replacing one crumb with one button saves nothing. That reasoning is wrong
 * twice: the crumb may be a forty-character compound and the button is one
 * target wide, and it made `maxItems` mean different things at different
 * depths.
 */
export function collapsedRange(count: number, before: number, after: number) {
  const kept = Math.max(0, before) + Math.max(0, after);
  if (count <= kept) return undefined;
  return { start: Math.max(0, before), end: count - Math.max(0, after) };
}

/**
 * The ordered list, and the one part that knows how many crumbs there are.
 *
 * It maps its children rather than rendering them straight through, because
 * three facts about a crumb can only be known from the outside: whether it is
 * the last one — the last draws no separator — whether the collapse is hiding
 * it, and whether it is the first one an expansion reveals, which is where
 * focus goes when the ellipsis stops existing.
 */
export function BreadcrumbList({ children, ref, render, ...nativeProps }: BreadcrumbListProps) {
  const trail = useBreadcrumb();
  const items = Children.toArray(children).filter((child) => isValidElement(child));
  const collapsed =
    trail.expanded || trail.maxItems <= 0 || items.length <= trail.maxItems
      ? undefined
      : collapsedRange(items.length, trail.itemsBeforeCollapse, trail.itemsAfterCollapse);

  const laidOut: ReactNode[] = [];
  for (const [index, child] of items.entries()) {
    if (collapsed !== undefined && index === collapsed.start) {
      laidOut.push(
        <BreadcrumbEllipsis
          key="slotted-breadcrumb-ellipsis"
          hidden={collapsed.end - collapsed.start}
          last={false}
        />,
      );
    }
    const hidden = collapsed !== undefined && index >= collapsed.start && index < collapsed.end;
    laidOut.push(
      <BreadcrumbItemProvider
        key={child.key ?? index}
        value={{
          hidden,
          last: index === items.length - 1,
          revealedId: index === (collapsed?.start ?? -1) ? trail.firstRevealedId : undefined,
        }}
      >
        {child}
      </BreadcrumbItemProvider>,
    );
  }

  const rootProps: BreadcrumbListRootProps = {
    ...nativeProps,
    children: laidOut,
    'data-part': 'list',
  };

  return render === undefined ? <ol {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * The separator, drawn after every crumb but the last. It is `aria-hidden`
 * because the `nav` and the `ol` already say what it means, which is the
 * reasoning the APG example gives for drawing it in CSS.
 */
function Separator({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" data-part="separator">
      {children}
    </span>
  );
}

/**
 * The control that reveals what the collapse hides.
 *
 * Its accessible name carries the count, because three dots say nothing about
 * how much is behind them. It is a `button` with `aria-expanded`, so a reader
 * hears that it opens something before pressing it.
 */
function BreadcrumbEllipsis({ hidden, last }: { hidden: number; last: boolean }) {
  const trail = useBreadcrumb();

  return (
    <li data-part="item">
      <button
        aria-expanded={false}
        aria-label={`Show ${hidden} hidden ${hidden === 1 ? 'level' : 'levels'}`}
        data-part="ellipsis"
        onClick={(event) => trail.expand('pointer', event)}
        onKeyDown={(event) => {
          /* `Enter` and `Space` both activate a button, and the browser turns
             each into a click. This is the reason the request carries, and it
             is the difference between a press and a key. */
          if (event.key === 'Enter' || event.key === ' ') trail.expand('keyboard', event);
        }}
        type="button"
      >
        {'…'}
      </button>
      {last ? null : <Separator>{trail.separator}</Separator>}
    </li>
  );
}

/**
 * One ancestor, or the current page. It carries the separator after it, so a
 * consumer never writes one and never leaves a trailing one behind.
 */
export function BreadcrumbItem({ children, ref, render, ...nativeProps }: BreadcrumbItemProps) {
  const trail = useBreadcrumb();
  const item = useBreadcrumbItem();

  const rootProps: BreadcrumbItemRootProps = {
    ...nativeProps,
    children: (
      <>
        {children}
        {item?.last === true ? null : <Separator>{trail.separator}</Separator>}
      </>
    ),
    'data-part': 'item',
    hidden: item?.hidden === true ? true : nativeProps.hidden,
  };

  return render === undefined ? <li {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * An ancestor that can be reached. It is a plain anchor, so the role, `Enter`,
 * the context menu and every modified click come from the platform; `render`
 * substitutes it for a router's own link and hands over the destination.
 */
export function BreadcrumbLink({ children, ref, render, ...nativeProps }: BreadcrumbLinkProps) {
  const item = useBreadcrumbItem();

  const rootProps: BreadcrumbLinkRootProps = {
    ...nativeProps,
    children,
    'data-part': 'link',
    /* Focus lands here when the ellipsis that hid this crumb stops existing. */
    id: nativeProps.id ?? item?.revealedId,
  };

  return render === undefined ? <a {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * The page the reader is on. It is text rather than a link, because a link to
 * the page you are already on goes nowhere, and it carries `aria-current="page"`
 * — the value the ARIA specification names for a link within a set of pages.
 */
export function BreadcrumbPage({ children, ref, render, ...nativeProps }: BreadcrumbPageProps) {
  const rootProps: BreadcrumbPageRootProps = {
    ...nativeProps,
    'aria-current': 'page',
    children,
    'data-part': 'page',
  };

  return render === undefined ? <span {...rootProps} ref={ref} /> : render(rootProps);
}
