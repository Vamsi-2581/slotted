import { useCallback, useEffect } from 'react';
import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';

import { Glyph, Icon } from '../icon';
import { useAppShell } from './app-shell';
import type {
  AppShellActionsProps,
  AppShellAsideProps,
  AppShellAsideSectionProps,
  AppShellAsideToggleProps,
  AppShellBannerProps,
  AppShellBrandProps,
  AppShellCentreProps,
  AppShellContextValue,
  AppShellFooterProps,
  AppShellMainProps,
  AppShellNavProps,
  AppShellNavSectionProps,
  AppShellNavToggleProps,
} from './app-shell.types';

/**
 * Keeps the consumer's own ref and gives the shell the node its layer, its
 * focus scope and its `inert` pass need. A part that took one and dropped the
 * other would be the defect `docs/build-briefing.md` records under _A family
 * that renders another family's part composes its ref, not only its props_.
 */
function useNode(
  slot: keyof AppShellContextValue['nodes'],
  ref: Ref<never> | undefined,
): (node: HTMLElement | null) => void {
  const shell = useAppShell();
  return useCallback(
    (node: HTMLElement | null) => {
      shell.nodes[slot] = node;
      if (typeof ref === 'function') (ref as (value: HTMLElement | null) => void)(node);
      else if (ref !== null && ref !== undefined) {
        (ref as { current: HTMLElement | null }).current = node;
      }
    },
    [ref, shell.nodes, slot],
  );
}

/** A region says it exists, so a skip link is never written to a target nobody rendered. */
function useRegion(region: 'nav' | 'main' | 'aside') {
  const shell = useAppShell();
  useEffect(() => shell.register(region), [region, shell]);
}

function part(props: HTMLAttributes<HTMLElement>, render: ((p: never) => ReactNode) | undefined) {
  return render === undefined ? null : render(props as never);
}

/**
 * The `banner` landmark: a `header` in the context of the `body`, so it needs
 * no `role`. What goes in it is the consumer's — `top-navigation` fills it in
 * wave 8 — and where it goes is the shell's, which is what `brand` and
 * `actions` are.
 */
export function AppShellBanner({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellBannerProps) {
  const attach = useNode('banner', ref as never);
  const rootProps = { ...nativeProps, children, className, 'data-part': 'banner', style };
  return part(rootProps, render) ?? <header {...rootProps} ref={attach} />;
}

/** The start cluster of the banner: the toggle, the mark, the name of the workspace. */
export function AppShellBrand({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellBrandProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'brand', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/**
 * The middle of the bar, and the one cluster that grows: a search, a trail, a
 * route title, tabs. Without it a bar is two clusters and a void.
 */
export function AppShellCentre({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellCentreProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'centre', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/** The end cluster, pushed there by the space it takes, so an empty one costs nothing. */
export function AppShellActions({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellActionsProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'actions', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/**
 * The `navigation` landmark, and the one element all three modes share: the
 * rail is this `nav` at another inline size, which is what keeps the focus and
 * the scroll position where the reader left them.
 *
 * A document with more than one `navigation` needs a unique label on each, so
 * this one carries the family's, replaceable per instance.
 */
export function AppShellNav({
  'aria-label': ariaLabel,
  children,
  className,
  id,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellNavProps) {
  const shell = useAppShell();
  const attach = useNode('nav', ref as never);
  useRegion('nav');

  const rootProps = {
    ...nativeProps,
    'aria-label': ariaLabel ?? shell.messages.nav,
    children,
    className,
    'data-part': 'nav',
    id: id ?? shell.navId,
    style,
  };
  return part(rootProps, render) ?? <nav {...rootProps} ref={attach} />;
}

/** The pinned top of the navigation column. */
export function AppShellNavHeader({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellNavSectionProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'nav-header', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/** The middle, and the only part of the column that scrolls. */
export function AppShellNavBody({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellNavSectionProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'nav-body', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/** The pinned bottom: the account, the collapse control. */
export function AppShellNavFooter({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellNavSectionProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'nav-footer', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/**
 * The `main` landmark, and the skip link's destination.
 *
 * `tabIndex={-1}` is not decoration: a `main` without it takes the scroll and
 * leaves the focus behind in Safari and in Firefox, so the link appears to work
 * and moves nothing a screen reader follows.
 */
export function AppShellMain({
  children,
  className,
  id,
  ref,
  render,
  style,
  tabIndex,
  ...nativeProps
}: AppShellMainProps) {
  const shell = useAppShell();
  const attach = useNode('main', ref as never);
  useRegion('main');

  const rootProps = {
    ...nativeProps,
    children,
    className,
    'data-part': 'main',
    id: id ?? shell.mainId,
    style,
    tabIndex: tabIndex ?? -1,
  };
  return part(rootProps, render) ?? <main {...rootProps} ref={attach} />;
}

/**
 * The `complementary` landmark. It opens and closes the way the navigation
 * region does — a column beside the content or a layer over it, by
 * `asideMode` — and carries its own `data-open`, because the root's is the
 * navigation's and every selector written over it still reads the navigation.
 *
 * A document with more than one `complementary` region needs a label on each,
 * so this one carries the family's unless the consumer wrote another.
 */
export function AppShellAside({
  'aria-label': ariaLabel,
  children,
  className,
  id,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellAsideProps) {
  const shell = useAppShell();
  const attach = useNode('aside', ref as never);
  useRegion('aside');

  const rootProps = {
    ...nativeProps,
    'aria-label': ariaLabel ?? shell.messages.aside,
    children,
    className,
    ...(shell.asideOpen ? { 'data-open': '' as const } : {}),
    'data-part': 'aside',
    id: id ?? shell.asideId,
    style,
  };
  return part(rootProps, render) ?? <aside {...rootProps} ref={attach} />;
}

/** The pinned top of the pane: its title, and the control that closes it. */
export function AppShellAsideHeader({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellAsideSectionProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'aside-header', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/** The middle, and the only part of the pane that scrolls. */
export function AppShellAsideBody({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellAsideSectionProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'aside-body', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/** The pinned bottom: the actions that close the task the pane holds. */
export function AppShellAsideFooter({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellAsideSectionProps) {
  const rootProps = { ...nativeProps, children, className, 'data-part': 'aside-footer', style };
  return part(rootProps, render) ?? <div {...rootProps} ref={ref as never} />;
}

/** The `contentinfo` landmark: the application's footer, not the page's action bar. */
export function AppShellFooter({
  children,
  className,
  ref,
  render,
  style,
  ...nativeProps
}: AppShellFooterProps) {
  const attach = useNode('footer', ref as never);
  const rootProps = { ...nativeProps, children, className, 'data-part': 'footer', style };
  return part(rootProps, render) ?? <footer {...rootProps} ref={attach} />;
}

/**
 * The disclosure control, by the APG's Disclosure pattern: a `button` carrying
 * `aria-expanded` and `aria-controls`, which `Enter` and `Space` activate
 * natively.
 *
 * It takes its wiring from the shell's context rather than from its position,
 * so it can be rendered in the banner, in the navigation's own footer, or
 * anywhere else the consumer wants it, and there is still exactly one control
 * carrying the state.
 */
export function AppShellNavToggle({
  'aria-controls': ariaControls,
  'aria-label': ariaLabel,
  children,
  className,
  id,
  onClick,
  ref,
  render,
  style,
  type,
  ...nativeProps
}: AppShellNavToggleProps) {
  const shell = useAppShell();
  const attach = useNode('toggle', ref as never);

  const press = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event as never);
      if (event.defaultPrevented) return;
      /* A click synthesised by the keyboard reports no detail; a real one does.
         The reason is the difference between a product that persists a press
         and one that cannot tell which gesture it saw. */
      const reason = event.detail === 0 ? 'keyboard' : 'pointer';
      shell.setOpen(!shell.open, reason, event.nativeEvent);
    },
    [onClick, shell],
  );

  const rootProps = {
    ...nativeProps,
    'aria-controls': ariaControls ?? shell.navId,
    'aria-expanded': shell.open,
    'aria-label': ariaLabel ?? (shell.open ? shell.messages.close : shell.messages.open),
    /* The panel mark says what a press does: open while closed, close while open. */
    children: children ?? (
      <Icon>
        <Glyph name={shell.open ? 'panel-close' : 'panel-open'} />
      </Icon>
    ),
    className,
    'data-part': 'nav-toggle',
    id: id ?? shell.toggleId,
    onClick: press,
    style,
    type: type ?? ('button' as const),
  };
  return part(rootProps, render) ?? <button {...rootProps} ref={attach} />;
}

/**
 * The pane's disclosure control, by the same pattern and with the same wiring
 * as the navigation's: it can stand in the pane's own header, in the banner's
 * actions, or anywhere else, and there is still exactly one control carrying
 * the pane's state.
 */
export function AppShellAsideToggle({
  'aria-controls': ariaControls,
  'aria-label': ariaLabel,
  children,
  className,
  id,
  onClick,
  ref,
  render,
  style,
  type,
  ...nativeProps
}: AppShellAsideToggleProps) {
  const shell = useAppShell();
  const attach = useNode('asideToggle', ref as never);

  const press = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event as never);
      if (event.defaultPrevented) return;
      const reason = event.detail === 0 ? 'keyboard' : 'pointer';
      shell.setAsideOpen(!shell.asideOpen, reason, event.nativeEvent);
    },
    [onClick, shell],
  );

  const rootProps = {
    ...nativeProps,
    'aria-controls': ariaControls ?? shell.asideId,
    'aria-expanded': shell.asideOpen,
    'aria-label':
      ariaLabel ?? (shell.asideOpen ? shell.messages.closeAside : shell.messages.openAside),
    children: children ?? (
      <Icon>
        <Glyph name={shell.asideOpen ? 'panel-close' : 'panel-open'} />
      </Icon>
    ),
    className,
    'data-part': 'aside-toggle',
    id: id ?? shell.asideToggleId,
    onClick: press,
    style,
    type: type ?? ('button' as const),
  };
  return part(rootProps, render) ?? <button {...rootProps} ref={attach} />;
}
