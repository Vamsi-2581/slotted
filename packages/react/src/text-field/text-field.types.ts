import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from 'react';

/** The type step the control sits at, matching the field around it. */
export type TextFieldSize = 'sm' | 'md' | 'lg';

/**
 * How much frame the control shows. `outline` takes the ground it is placed on,
 * `subtle` sinks into the page, and `plain` shows nothing at rest — which is
 * what a dense table needs: a cell that is only a control while it is used, and
 * that keeps the same box so the row does not reflow under the pointer.
 */
export type TextFieldVariant = 'outline' | 'subtle' | 'plain';

/**
 * The six text types. Anything else an `input` accepts still passes through as
 * a string, because the element takes it; the six are the ones this family
 * paints, sizes and reveals.
 */
export type TextFieldType = 'text' | 'search' | 'email' | 'url' | 'tel' | 'password';

/** Why the value moved. A text control can produce exactly these two. */
export type TextFieldValueReason = Extract<ChangeRequest<string>['reason'], 'keyboard' | 'clear'>;

/** Why the password toggle moved. */
export type TextFieldRevealReason = Extract<
  ChangeRequest<boolean>['reason'],
  'pointer' | 'keyboard'
>;

/** What an application sets once for every text field under it. */
export interface TextFieldDefaults {
  clearLabel: string;
  mono: boolean;
  revealLabel: string;
  size: TextFieldSize;
  variant: TextFieldVariant;
}

export interface TextFieldDefaultsProviderProps extends Partial<TextFieldDefaults> {
  children?: ReactNode | undefined;
}

/**
 * What `render` receives for the frame. Written against
 * `HTMLAttributes<HTMLElement>` so it can be spread onto any element, which is
 * what makes the substitution real.
 */
export interface TextFieldRootProps extends HTMLAttributes<HTMLElement> {
  'data-disabled'?: '' | undefined;
  'data-invalid'?: '' | undefined;
  'data-mono'?: '' | undefined;
  'data-part': string;
  'data-readonly'?: '' | undefined;
  'data-size': TextFieldSize;
  'data-ui': string;
  'data-variant': TextFieldVariant;
}

/**
 * `size` is omitted and redeclared: on an `input` it is the visible character
 * count, and this family's axis is a type step. `value` and `defaultValue` are
 * omitted and redeclared as strings, because the contract says the value is
 * text and the element's own type also admits a number and an array.
 *
 * Everything else is the element's, and it reaches the element: `autoComplete`,
 * `inputMode`, `enterKeyHint`, `pattern`, `maxLength`, `spellCheck`,
 * `autoCapitalize`, `name`, `form`, `required`, every `aria-*` and every
 * handler. `className` and `style` are the exception, and they reach the frame,
 * because the frame is what a consumer sees.
 */
export interface TextFieldProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'defaultValue' | 'size' | 'type' | 'value'
> {
  /** Draws a button that empties the value and returns focus to the control. */
  clearable?: boolean | undefined;
  /** The clear button's accessible name. Defaults to the provider's. */
  clearLabel?: string | undefined;
  /**
   * The limit the count is measured against. Defaults to `maxLength`, and set
   * alone it is a soft limit: the value can pass it, and the counter says so
   * before validation runs.
   */
  countMax?: number | undefined;
  /** The value an uncontrolled control starts from, read once. */
  defaultValue?: string | undefined;
  /** Whether the password starts revealed, when the control is uncontrolled. */
  defaultRevealed?: boolean | undefined;
  /**
   * Unstated rather than `false`, so the control defers to the field around it.
   * Stated, it wins, and it is the native attribute.
   */
  disabled?: boolean | undefined;
  /** An adornment after the value in the reading direction. */
  end?: ReactNode | undefined;
  /**
   * Unstated rather than `false`. Writes `aria-invalid` on the control and
   * `data-invalid` on the frame.
   */
  invalid?: boolean | undefined;
  /** Sets the value in the monospaced family, for identifiers, hashes and keys. */
  mono?: boolean | undefined;
  /** Called before the value moves, with the request that carries the reason. */
  onValueChange?: ((value: string, request: ChangeRequest<string>) => void) | undefined;
  /** Called before the password toggle moves. */
  onRevealedChange?: ((revealed: boolean, request: ChangeRequest<boolean>) => void) | undefined;
  /** Unstated rather than `false`. Writes the native `readonly`. */
  readOnly?: boolean | undefined;
  /** Renders the frame into another element. */
  render?: ((props: TextFieldRootProps) => ReactNode) | undefined;
  /** Present means controlled, for the life of the component. */
  revealed?: boolean | undefined;
  /** Draws a toggle that turns a password from dots into characters. */
  revealable?: boolean | undefined;
  /** The reveal button's accessible name. It does not change with the state. */
  revealLabel?: string | undefined;
  /** Publishes the length of the value to the field, which draws the count. */
  showCount?: boolean | undefined;
  /** Defaults to the field, then to the provider, then to `md`. */
  size?: TextFieldSize | undefined;
  /** An adornment before the value in the reading direction. */
  start?: ReactNode | undefined;
  type?: TextFieldType | (string & {}) | undefined;
  /** Present means controlled, for the life of the component. */
  value?: string | undefined;
  /** Defaults to the provider, then to `outline`. */
  variant?: TextFieldVariant | undefined;
}
