import { useEffect, useState } from 'react';
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';

import { SkeletonText } from '../skeleton';
import type { SkeletonTextRootProps } from '../skeleton';
import { usePageHeader } from './page-header';

/**
 * The placeholder stands where words stood, inside a heading or a paragraph,
 * so it is phrasing content: a `span` root rather than the skeleton's `div`.
 * The stylesheet addresses the placeholder by its attributes, not its tag.
 */
function placeholder(lines: number) {
  return (
    <SkeletonText
      lines={lines}
      render={(props: SkeletonTextRootProps) => (
        <span {...(props as unknown as ComponentPropsWithRef<'span'>)} />
      )}
    />
  );
}
import type {
  PageHeaderAreaProps,
  PageHeaderAreaRootProps,
  PageHeaderBackProps,
  PageHeaderDescriptionProps,
  PageHeaderHeadingProps,
  PageHeaderHeadingRootProps,
  PageHeaderPartComponentProps,
  PageHeaderPartProps,
  PageHeaderPinProps,
  PageHeaderPinRootProps,
  PageHeaderSubheadingProps,
  PageHeaderToggleProps,
  PageHeaderToggleRootProps,
} from './page-header.types';

/**
 * A click synthesised by the keyboard reports no detail; a real one reports the
 * click count. It is why `Enter`, `Space` and a pointer are told apart without
 * a key listener existing for either control — the platform keeps both keys.
 */
function activationReason(event: MouseEvent) {
  return event.detail === 0 ? ('keyboard' as const) : ('pointer' as const);
}

function attach<T extends HTMLElement>(
  ref: PageHeaderPartComponentProps['ref'] | undefined,
  node: T | null,
) {
  if (typeof ref === 'function') ref(node as never);
  else if (ref !== null && ref !== undefined) (ref as { current: T | null }).current = node;
}

/**
 * The plain parts: a box with a name, laid out by the stylesheet. One
 * definition each, so a consumer sees a component per part and `render` on
 * every one.
 */
function part(name: string, displayName: string) {
  function Part({
    children,
    className,
    ref,
    render,
    style,
    ...nativeProps
  }: PageHeaderPartComponentProps) {
    const rootProps: PageHeaderPartProps = {
      ...nativeProps,
      children,
      className,
      'data-part': name,
      style,
    };
    if (render !== undefined) return render(rootProps);
    return <div {...rootProps} ref={ref} />;
  }
  Part.displayName = displayName;
  return Part;
}

/** The strip that never leaves: nav, title row and controls. Sticky at 0 inside the root. */
export const PageHeaderTitleArea = part('title-area', 'PageHeaderTitleArea');
/** The row above the title: the way back, then the breadcrumbs. */
export const PageHeaderNav = part('nav', 'PageHeaderNav');
/** The slot a Breadcrumb sits in. Hidden below 640 pixels, where the way back says where the reader came from. */
export const PageHeaderBreadcrumbs = part('breadcrumbs', 'PageHeaderBreadcrumbs');
/** Visual, title, actions and navigation, on one row that wraps. */
export const PageHeaderTitleRow = part('title-row', 'PageHeaderTitleRow');
/** The mark before the heading: an Avatar, an Icon, an image. */
export const PageHeaderVisual = part('visual', 'PageHeaderVisual');
/** The column of heading, marks and subheading. */
export const PageHeaderTitle = part('title', 'PageHeaderTitle');
/** The status beside the heading: a Tag, a Badge, a StatusIndicator. */
export const PageHeaderMarks = part('marks', 'PageHeaderMarks');
/** The slot a Toolbar sits in, pushed to the end of the title row. */
export const PageHeaderActions = part('actions', 'PageHeaderActions');
/** The previous and next record, at the far end of the title row. */
export const PageHeaderNavigation = part('navigation', 'PageHeaderNavigation');
/** The picture of the record, a column before the content of the header area. */
export const PageHeaderFigure = part('figure', 'PageHeaderFigure');
/** A column of whatever only makes sense at rest. */
export const PageHeaderContent = part('content', 'PageHeaderContent');
/** The slot a Tabs sits in, last in the root and visible under the title once the area has gone. */
export const PageHeaderTabs = part('tabs', 'PageHeaderTabs');

/**
 * The way back. A link by default, with the arrow the family draws before it;
 * `render` makes it a router's link or a button.
 */
export function PageHeaderBack({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: PageHeaderBackProps) {
  const rootProps: PageHeaderPartProps = {
    ...nativeProps,
    children,
    className,
    'data-part': 'back',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <a {...rootProps} ref={ref} />;
}

/**
 * The heading. `level` decides the element; the full text is repeated in
 * `title`, so a clamped title stays reachable whole. While loading it renders
 * Skeleton's text shape in place of its words — the placeholder is skeleton's,
 * and this family says only how wide it is.
 */
export function PageHeaderHeading({
  children,
  className,
  ref,
  render,
  style,
  title,
  ...nativeProps
}: PageHeaderHeadingProps) {
  const { ids, level, loading } = usePageHeader();
  const text = typeof children === 'string' ? children : undefined;
  const rootProps: PageHeaderHeadingRootProps = {
    ...nativeProps,
    children: loading ? placeholder(1) : children,
    className,
    'data-part': 'heading',
    id: ids.headingId,
    style,
    ...(title !== undefined || text !== undefined ? { title: title ?? text } : {}),
  };
  if (render !== undefined) return render(rootProps);
  const Heading = `h${level}` as 'h1';
  return <Heading {...rootProps} ref={ref} />;
}

/** One line under the heading, in the muted text, part of what stays visible. */
export function PageHeaderSubheading({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: PageHeaderSubheadingProps) {
  const { loading } = usePageHeader();
  const rootProps: PageHeaderPartProps = {
    ...nativeProps,
    children: loading ? placeholder(1) : children,
    className,
    'data-part': 'subheading',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <p {...rootProps} ref={ref} />;
}

/** A paragraph with a measure, inside the header area's content. */
export function PageHeaderDescription({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: PageHeaderDescriptionProps) {
  const { loading } = usePageHeader();
  const rootProps: PageHeaderPartProps = {
    ...nativeProps,
    children: loading ? placeholder(2) : children,
    className,
    'data-part': 'description',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <p {...rootProps} ref={ref} />;
}

/**
 * The region that collapses. Collapsed by the control it is `inert` and
 * hidden from assistive technology, because a 0fr row leaves its controls in
 * the DOM and out of sight; scrolled past it is neither, so a control inside
 * it that receives focus is scrolled back into view and the header re-opens
 * with the reason `scroll`.
 */
export function PageHeaderArea({
  'aria-label': ariaLabel,
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: PageHeaderAreaProps) {
  const { expanded, ids, messages, scrolled } = usePageHeader();
  const [element, setElement] = useState<HTMLElement | null>(null);
  const closedByControl = !expanded && !scrolled;

  useEffect(() => {
    if (element === null) return;
    if (closedByControl) {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('inert');
      element.removeAttribute('aria-hidden');
    }
  }, [element, closedByControl]);

  const rootProps: PageHeaderAreaRootProps = {
    ...nativeProps,
    'aria-label': ariaLabel ?? messages.headerArea,
    children,
    className,
    'data-part': 'header-area',
    id: ids.areaId,
    role: 'region',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return (
    <div
      {...rootProps}
      ref={(node) => {
        setElement(node);
        attach(ref, node);
      }}
    />
  );
}

/**
 * The zero-height row on the chrome's edge, and the pill inside it. The pill
 * is the row's only child; the toggle and the pin are the pill's.
 */
export function PageHeaderControls({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: PageHeaderPartComponentProps) {
  const rootProps: PageHeaderPartProps = {
    ...nativeProps,
    children: <div>{children}</div>,
    className,
    'data-part': 'controls',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <div {...rootProps} ref={ref} />;
}

/**
 * The disclosure control. A `button`, so `Enter` and `Space` are the
 * platform's; `aria-expanded` and `aria-controls` are the pattern's two
 * properties. Focus stays on it after either move.
 */
export function PageHeaderToggle({
  'aria-label': ariaLabel,
  children,
  className,
  onClick,
  ref,
  render,
  style,
  ...nativeProps
}: PageHeaderToggleProps) {
  const { expanded, ids, messages, setExpanded } = usePageHeader();
  const rootProps: PageHeaderToggleRootProps = {
    ...nativeProps,
    'aria-controls': ids.areaId,
    'aria-expanded': expanded,
    'aria-label': ariaLabel ?? (expanded ? messages.collapse : messages.expand),
    children: children as ReactNode,
    className,
    'data-part': 'toggle',
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      /* The consumer's handler runs first, and preventDefault() refuses the move. */
      onClick?.(event);
      if (event.defaultPrevented) return;
      setExpanded(!expanded, activationReason(event), event);
    },
    style,
    type: 'button',
  };
  if (render !== undefined) return render(rootProps);
  return <button {...rootProps} ref={ref} />;
}

/**
 * The pin: a toggle button with `aria-pressed`, which is the `pressed` state
 * the vocabulary has. It exists when it is rendered; there is no prop to hide
 * it.
 */
export function PageHeaderPin({
  'aria-label': ariaLabel,
  children,
  className,
  onClick,
  ref,
  render,
  style,
  ...nativeProps
}: PageHeaderPinProps) {
  const { messages, pinned, setPinned } = usePageHeader();
  const rootProps: PageHeaderPinRootProps = {
    ...nativeProps,
    'aria-label': ariaLabel ?? (pinned ? messages.unpin : messages.pin),
    'aria-pressed': pinned,
    children: children as ReactNode,
    className,
    'data-part': 'pin',
    ...(pinned ? { 'data-pressed': '' } : {}),
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setPinned(!pinned, activationReason(event), event);
    },
    style,
    type: 'button',
  };
  if (render !== undefined) return render(rootProps);
  return <button {...rootProps} ref={ref} />;
}
