import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, ReactNode } from 'react';

/** The term beside its value, or above it. */
export type DescriptionListLayout = 'row' | 'stack';

/** How many pairs stand side by side before the container narrows. */
export type DescriptionListColumns = 1 | 2 | 3;

/** Nothing between pairs, a rule between them, or a framed table. */
export type DescriptionListVariant = 'plain' | 'ruled' | 'framed';

/** Only two things can ask to reveal a value: a press and a key. */
export type DescriptionListRevealReason = 'pointer' | 'keyboard' | 'programmatic';

export type DescriptionListChangeRequest = ChangeRequest<boolean>;

/**
 * What happened when a value was copied. It is not a `ChangeRequest`: the
 * clipboard belongs to the platform, so there is no previous value, nothing to
 * cancel, and no state the family holds. The event reports, after the fact,
 * what a consumer may want to log or announce differently.
 */
export interface DescriptionListCopyRequest {
  /** The exact text handed to the clipboard. */
  readonly value: string;
  readonly reason: 'pointer' | 'keyboard';
  /** `false` when the platform refused the write or offers no clipboard. */
  readonly copied: boolean;
  readonly source?: unknown;
}

/**
 * The words the family says. They are here rather than inside the components
 * because an application translates them once, and a reader of a Portuguese
 * page should not meet "Show more" in the one place a family forgot.
 */
export interface DescriptionListLabels {
  /** The accessible name of the copy control. */
  copy?: string | undefined;
  /** Announced, politely, once a value has reached the clipboard. */
  copied?: string | undefined;
  /** The control that shows the rest of a clamped value. */
  reveal?: string | undefined;
  /** The same control, once the value is whole. */
  collapse?: string | undefined;
  /** What a screen reader reads in place of a value that is missing. */
  placeholder?: string | undefined;
}

export interface DescriptionListDefaults {
  columns?: DescriptionListColumns | undefined;
  labels?: DescriptionListLabels | undefined;
  layout?: DescriptionListLayout | undefined;
  /** The maximum width of the term column, as a CSS length. */
  termWidth?: string | undefined;
  variant?: DescriptionListVariant | undefined;
}

export interface DescriptionListDefaultsProviderProps extends DescriptionListDefaults {
  children?: ReactNode;
}

/** Every label answered, after the prop, the provider and the default. */
export type DescriptionListResolvedLabels = {
  [K in keyof DescriptionListLabels]-?: NonNullable<DescriptionListLabels[K]>;
};

export interface DescriptionListContextValue {
  columns: DescriptionListColumns;
  labels: DescriptionListResolvedLabels;
  layout: DescriptionListLayout;
  variant: DescriptionListVariant;
}

export interface DescriptionListItemContextValue {
  /** The `dt`'s identifier, which the row's action is described by. */
  termId: string;
}

export interface DescriptionListRootProps extends ComponentPropsWithRef<'div'> {
  'data-columns': string;
  'data-layout': DescriptionListLayout;
  'data-part': string;
  'data-ui': string;
  'data-variant': DescriptionListVariant;
}

export interface DescriptionListProps extends ComponentPropsWithRef<'div'> {
  columns?: DescriptionListColumns | undefined;
  labels?: DescriptionListLabels | undefined;
  layout?: DescriptionListLayout | undefined;
  render?: ((props: DescriptionListRootProps) => ReactNode) | undefined;
  /** The maximum width of the term column, as a CSS length. */
  termWidth?: string | undefined;
  variant?: DescriptionListVariant | undefined;
}

export interface DescriptionListItemRootProps extends ComponentPropsWithRef<'div'> {
  'data-part': string;
  'data-span': string | undefined;
}

export interface DescriptionListItemProps extends ComponentPropsWithRef<'div'> {
  render?: ((props: DescriptionListItemRootProps) => ReactNode) | undefined;
  /** How many columns the pair takes, clamped to the count the list has. */
  span?: DescriptionListColumns | undefined;
}

export interface DescriptionListTermRootProps extends ComponentPropsWithRef<'dt'> {
  'data-part': string;
}

export interface DescriptionListTermProps extends ComponentPropsWithRef<'dt'> {
  render?: ((props: DescriptionListTermRootProps) => ReactNode) | undefined;
}

export interface DescriptionListHintRootProps extends ComponentPropsWithRef<'span'> {
  'data-part': string;
}

export interface DescriptionListHintProps extends ComponentPropsWithRef<'span'> {
  render?: ((props: DescriptionListHintRootProps) => ReactNode) | undefined;
}

export interface DescriptionListDescriptionRootProps extends ComponentPropsWithRef<'dd'> {
  'data-clamp': '' | undefined;
  'data-part': string;
  'data-revealed': '' | undefined;
}

export interface DescriptionListDescriptionProps extends Omit<
  ComponentPropsWithRef<'dd'>,
  'onCopy'
> {
  /** Lines the value is held to before it is revealed. `0` never clamps. */
  clamp?: number | undefined;
  /** Draws the control that puts the value on the clipboard. */
  copy?: boolean | undefined;
  /**
   * The text the control copies. Absent, the rendered text of the value is
   * read at the moment of the press, which is what a formatted value needs.
   */
  copyValue?: string | undefined;
  /** The value an uncontrolled description starts from, read once. */
  defaultRevealed?: boolean | undefined;
  /** Draws the placeholder. React also treats nullish children as empty. */
  empty?: boolean | undefined;
  onCopy?: ((request: DescriptionListCopyRequest) => void) | undefined;
  onRevealedChange?:
    ((revealed: boolean, request: DescriptionListChangeRequest) => void) | undefined;
  /** What is read in place of a value that is missing. */
  placeholder?: ReactNode | undefined;
  render?: ((props: DescriptionListDescriptionRootProps) => ReactNode) | undefined;
  /** Present means controlled, for the life of the component. */
  revealed?: boolean | undefined;
}

export interface DescriptionListActionRootProps extends ComponentPropsWithRef<'dd'> {
  'data-part': string;
}

export interface DescriptionListActionProps extends ComponentPropsWithRef<'dd'> {
  render?: ((props: DescriptionListActionRootProps) => ReactNode) | undefined;
}
