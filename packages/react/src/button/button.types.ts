import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import type {
  BUTTON_SHAPES,
  BUTTON_SIZES,
  BUTTON_TONES,
  BUTTON_VARIANTS,
} from './button.constants';

export type ButtonTone = (typeof BUTTON_TONES)[number];
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type ButtonShape = (typeof BUTTON_SHAPES)[number];
export type ButtonType = 'button' | 'submit' | 'reset';

/** The three axes every member paints itself from. */
export interface ButtonAppearanceProps {
  fullWidth?: boolean | undefined;
  size?: ButtonSize | undefined;
  tone?: ButtonTone | undefined;
  variant?: ButtonVariant | undefined;
}

/**
 * What an application sets once for every button under it. Each axis is
 * optional: an unset one leaves each member its own default rather than
 * flattening four members into one appearance.
 */
export interface ButtonDefaults {
  size?: ButtonSize | undefined;
  tone?: ButtonTone | undefined;
  variant?: ButtonVariant | undefined;
}

export interface ButtonDefaultsProviderProps extends ButtonDefaults {
  children: ReactNode;
}

export interface ButtonContentProps {
  children: ReactNode;
  /** Content before the label in the reading order, mirrored in a right-to-left document. */
  start?: ReactNode;
  /** Content after the label in the reading order, mirrored in a right-to-left document. */
  end?: ReactNode;
}

/**
 * Being unavailable and being unreachable are two decisions, and the platform
 * only offers them together. A disabled `button` leaves the tab sequence, which
 * takes its tooltip and its explanation with it — so a control that has to stay
 * discoverable keeps its place and announces `aria-disabled` instead.
 */
export interface ButtonDisabledProps {
  disabled?: boolean | undefined;
  focusableWhenDisabled?: boolean | undefined;
}

export interface ButtonLoadingProps {
  loading?: boolean | undefined;
  /**
   * How long the wait must last before the indicator is drawn. The activation
   * is refused from the first millisecond either way; this is only about not
   * showing a spinner for an action that takes ninety of them.
   */
  loadingDelay?: number | undefined;
  /** What the indicator announces itself as. It is a progress bar, so it has a name. */
  loadingLabel?: string | undefined;
}

/**
 * A change is a request. It carries the value, the value it replaces, the
 * reason — `pointer` or `keyboard`, told apart by whether the activation came
 * from a real pointer — the originating event, and `cancel()`. The value comes
 * first because reading it is what almost every consumer does.
 */
export type PressedChangeHandler = (pressed: boolean, request: ChangeRequest<boolean>) => void;

export interface ButtonPressedProps {
  /**
   * The consumer's value. Passing it puts the state in controlled mode for
   * good. `undefined` is written explicitly rather than left to the optional
   * marker, because absence is what decides the mode and the two must not
   * become interchangeable under `exactOptionalPropertyTypes`.
   */
  pressed?: boolean | undefined;
  /** The value an uncontrolled toggle starts from, read once. */
  defaultPressed?: boolean | undefined;
  onPressedChange?: PressedChangeHandler | undefined;
}

export type ButtonRootProps = ComponentPropsWithRef<'button'>;

/**
 * Hands the root's own props to something else to render. It is how a consumer
 * puts this surface on a framework's link component, a tooltip trigger or a
 * menu trigger without the family growing a prop for each of them.
 */
export type ButtonRender<Props> = (rootProps: Props) => ReactElement;

export interface ButtonProps
  extends
    Omit<ComponentPropsWithRef<'button'>, 'children' | 'type'>,
    ButtonAppearanceProps,
    ButtonContentProps,
    ButtonDisabledProps,
    ButtonLoadingProps {
  render?: ButtonRender<ButtonRootProps> | undefined;
  type?: ButtonType | undefined;
}

interface ButtonLinkSharedProps extends ButtonAppearanceProps, ButtonContentProps {
  disabled?: boolean | undefined;
}

export type ButtonLinkRootProps = ComponentPropsWithRef<'a'>;

type NativeButtonLinkProps = ButtonLinkSharedProps &
  Omit<ComponentPropsWithRef<'a'>, keyof ButtonLinkSharedProps | 'href'> & {
    href: string;
    render?: never;
  };

type AdaptedButtonLinkProps = ButtonLinkSharedProps &
  Omit<ComponentPropsWithRef<'a'>, keyof ButtonLinkSharedProps | 'href'> & {
    href?: never;
    /** Hands the root props to a router's own link component. */
    render: ButtonRender<ButtonLinkRootProps>;
  };

export type ButtonLinkProps = NativeButtonLinkProps | AdaptedButtonLinkProps;

/**
 * An icon carries no text, so the name cannot be computed from the content.
 * The union makes one of the two naming attributes mandatory at the type level
 * rather than at run time.
 */
type IconButtonAccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-label'?: never; 'aria-labelledby': string };

export type IconButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'aria-label' | 'aria-labelledby' | 'aria-pressed' | 'children' | 'type'
> &
  Omit<ButtonAppearanceProps, 'fullWidth'> &
  ButtonDisabledProps &
  ButtonLoadingProps &
  ButtonPressedProps &
  IconButtonAccessibleName & {
    children: ReactNode;
    render?: ButtonRender<ButtonRootProps> | undefined;
    shape?: ButtonShape | undefined;
    type?: ButtonType | undefined;
  };

export interface ToggleButtonProps
  extends
    Omit<ComponentPropsWithRef<'button'>, 'aria-pressed' | 'children' | 'type'>,
    ButtonAppearanceProps,
    ButtonContentProps,
    ButtonDisabledProps,
    ButtonLoadingProps,
    ButtonPressedProps {
  render?: ButtonRender<ButtonRootProps> | undefined;
  type?: ButtonType | undefined;
}
