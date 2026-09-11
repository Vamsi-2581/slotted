import { useEffect } from 'react';

import { HeadingLevel } from '../typography';
import { useSection } from './section';
import type {
  SectionDescriptionProps,
  SectionEyebrowProps,
  SectionHeadingProps,
  SectionHeadingRootProps,
  SectionPartComponentProps,
  SectionPartProps,
} from './section.types';

function part(name: string, displayName: string) {
  function Part({
    children,
    className,
    ref,
    render,
    style,
    ...nativeProps
  }: SectionPartComponentProps) {
    const rootProps: SectionPartProps = {
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

/**
 * The row above the body: the title column and the actions. It hands the
 * root its element, so a sticky header's height reaches the stylesheet.
 */
export function SectionHeader({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: SectionPartComponentProps) {
  const { registerHeader } = useSection();
  const setRef = (node: HTMLElement | null) => {
    registerHeader(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const rootProps: SectionPartProps = {
    ...nativeProps,
    children,
    className,
    'data-part': 'header',
    style,
  };
  if (render !== undefined) return render({ ...rootProps, ref: setRef });
  return <div {...rootProps} ref={setRef} />;
}
/** Eyebrow, heading, description, in that order. */
export const SectionTitle = part('title', 'SectionTitle');
/** The end of the header row: a Button, a Toolbar, a Link. */
export const SectionActions = part('actions', 'SectionActions');

/** A short overline above the heading — a count, a category. Structural, not status. */
export function SectionEyebrow({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: SectionEyebrowProps) {
  const rootProps: SectionPartProps = {
    ...nativeProps,
    children,
    className,
    'data-part': 'eyebrow',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <span {...rootProps} ref={ref} />;
}

/**
 * The heading, at the rank the section resolved. Rendering it is what makes
 * the section a region: the root names it through `aria-labelledby`.
 */
export function SectionHeading({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: SectionHeadingProps) {
  const { headingId, level, registerHeading } = useSection();

  useEffect(() => {
    registerHeading(true);
    return () => registerHeading(false);
  }, [registerHeading]);

  const rootProps: SectionHeadingRootProps = {
    ...nativeProps,
    children,
    className,
    'data-part': 'heading',
    id: headingId,
    style,
  };
  if (render !== undefined) {
    return render({ ...rootProps, role: 'heading', 'aria-level': level });
  }
  const Heading = `h${level}` as 'h2';
  return <Heading {...rootProps} ref={ref} />;
}

/** A paragraph under the heading, in the muted text, with a measure. */
export function SectionDescription({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: SectionDescriptionProps) {
  const rootProps: SectionPartProps = {
    ...nativeProps,
    children,
    className,
    'data-part': 'description',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <p {...rootProps} ref={ref} />;
}

/** The content, one outline step deeper. */
export function SectionBody({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: SectionPartComponentProps) {
  const rootProps: SectionPartProps = {
    ...nativeProps,
    children: <HeadingLevel>{children}</HeadingLevel>,
    className,
    'data-part': 'body',
    style,
  };
  if (render !== undefined) return render(rootProps);
  return <div {...rootProps} ref={ref} />;
}
