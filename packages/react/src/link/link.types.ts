import type { ComponentPropsWithRef, ReactNode } from 'react';

export type LinkUnderline = 'always' | 'hover' | 'none';
export type LinkVariant = 'accent' | 'neutral' | 'inverse';

/**
 * What every link on the page looks like before it states anything of its own.
 * `externalHint` is here as well as on the instance because it is the family's
 * one string, and a translated application sets a string once.
 */
export interface LinkDefaults {
  externalHint?: string | undefined;
  underline?: LinkUnderline | undefined;
  variant?: LinkVariant | undefined;
  visited?: boolean | undefined;
}

export interface LinkDefaultsProviderProps extends LinkDefaults {
  children?: ReactNode;
}

export interface LinkRootProps extends ComponentPropsWithRef<'a'> {
  children: ReactNode;
  'data-disabled': true | undefined;
  'data-part': string;
  'data-ui': string;
  'data-underline': LinkUnderline;
  'data-variant': LinkVariant;
  'data-visited': true | undefined;
}

export interface LinkProps extends ComponentPropsWithRef<'a'> {
  /**
   * Unavailable, and still discoverable. The rendered anchor keeps its place
   * in the tab sequence and loses its destination, which is what stops a
   * middle click as well as a left one.
   */
  disabled?: boolean;
  /** Opens the destination in a new browsing context, and says so. */
  external?: boolean;
  /** The wording of that warning, for translation. */
  externalHint?: string;
  /** Substitutes the rendered element — a router's own link, typically. */
  render?: (props: LinkRootProps) => ReactNode;
  underline?: LinkUnderline;
  variant?: LinkVariant;
  /** Paints a destination the reader has already followed. */
  visited?: boolean;
}
