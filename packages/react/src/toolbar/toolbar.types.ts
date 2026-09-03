import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from 'react';

/** Which way the bar runs. */
export type ToolbarOrientation = 'horizontal' | 'vertical';

/** The step the bar's own inset, gap and separator sit at. */
export type ToolbarSize = 'sm' | 'md' | 'lg';

/** Whether the bar paints a ground of its own. */
export type ToolbarVariant = 'plain' | 'outline';

/**
 * What a bar does with more controls than it has room for. `wrap` keeps every
 * one of them visible on a second row, and the arrows wrap from row to row
 * because the item list is linear. The overflow menu that Primer, Kendo and
 * Fluent reach for arrives with `menu`.
 */
export type ToolbarOverflow = 'wrap' | 'scroll';

/** What an application sets once for every toolbar under it. */
export interface ToolbarDefaults {
  loop: boolean;
  orientation: ToolbarOrientation;
  overflow: ToolbarOverflow;
  size: ToolbarSize;
  variant: ToolbarVariant;
}

export interface ToolbarDefaultsProviderProps extends Partial<ToolbarDefaults> {
  children?: ReactNode | undefined;
}

/** What `render` receives for the bar. */
export interface ToolbarRootProps extends HTMLAttributes<HTMLElement> {
  'data-orientation': ToolbarOrientation;
  'data-overflow': ToolbarOverflow;
  'data-part': string;
  'data-size': ToolbarSize;
  'data-ui': string;
  'data-variant': ToolbarVariant;
  role: 'toolbar';
}

export interface ToolbarProps extends ComponentPropsWithRef<'div'> {
  /** Whether the arrows wrap past the ends of the bar. */
  loop?: boolean | undefined;
  /** Defaults to the provider, then to `horizontal`. */
  orientation?: ToolbarOrientation | undefined;
  /** Defaults to the provider, then to `wrap`. */
  overflow?: ToolbarOverflow | undefined;
  /** Renders the bar into another element. */
  render?: ((props: ToolbarRootProps) => ReactNode) | undefined;
  /** Defaults to the provider, then to `md`. Sizes the bar, never its controls. */
  size?: ToolbarSize | undefined;
  /** Defaults to the provider, then to `plain`. */
  variant?: ToolbarVariant | undefined;
}

export interface ToolbarGroupProps extends ComponentPropsWithRef<'div'> {
  /** Renders the group into another element. */
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}

export interface ToolbarSeparatorProps extends ComponentPropsWithRef<'div'> {
  /** Renders the rule into another element. */
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}

export interface ToolbarSpacerProps extends ComponentPropsWithRef<'div'> {
  /** Renders the spacer into another element. */
  render?: ((props: HTMLAttributes<HTMLElement>) => ReactNode) | undefined;
}
