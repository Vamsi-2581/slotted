import { inject, InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'outline' | 'subtle' | 'plain';
export type SelectSide = 'bottom' | 'top' | 'inline-start' | 'inline-end' | 'left' | 'right';
export type SelectAlign = 'start' | 'center' | 'end';
export type SelectWidth = 'anchor' | 'content';
export type SelectMount = 'active' | 'lazy' | 'eager';
export type SelectStrategy = 'absolute' | 'fixed';

export type SelectOptionValue = string;
export type SelectSelection = SelectOptionValue | readonly SelectOptionValue[] | null;

export type SelectOpenReason =
  | 'pointer'
  | 'keyboard'
  | 'escape'
  | 'outsidePress'
  | 'select'
  | 'dismiss'
  | 'blur'
  | 'programmatic';

export type SelectValueReason = 'pointer' | 'keyboard' | 'clear' | 'select' | 'programmatic';
export type SelectHighlightReason = 'pointer' | 'keyboard' | 'programmatic';

/** Enough to name a value the popup has never rendered. */
export interface SelectOption {
  value: SelectOptionValue;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: readonly SelectOption[];
}

export type SelectItems = readonly (SelectOption | SelectOptionGroup)[];

export interface SelectDefaults {
  align: SelectAlign;
  alignOffset: number;
  clearable: boolean;
  clearLabel: string;
  /** The accessible name of a chip's remove control. `{label}` is the value's own label. */
  removeLabel: string;
  /** What a control too narrow for chips says instead. `{count}` is how many are chosen. */
  summaryLabel: string;
  closeOnEscape: boolean;
  closeOnOutsidePress: boolean;
  closeOnSelect: boolean;
  collisionPadding: number;
  disabled: boolean;
  emptyLabel: string;
  flip: boolean;
  fullWidth: boolean;
  hideWhenDetached: boolean;
  invalid: boolean;
  loading: boolean;
  loadingLabel: string;
  loop: boolean;
  mount: SelectMount;
  multiple: boolean;
  portal: boolean;
  readOnly: boolean;
  required: boolean;
  shift: boolean;
  side: SelectSide;
  sideOffset: number;
  size: SelectSize;
  strategy: SelectStrategy;
  typeahead: boolean;
  typeaheadTimeout: number;
  variant: SelectVariant;
  width: SelectWidth;
}

/**
 * The numbers, and why they are these numbers. The reasoning is the React
 * binding's, written out in `packages/react/src/select/select-defaults.tsx`;
 * the two tables are checked against each other by the contract, which holds
 * every one of them as a declared default.
 */
export const SELECT_FALLBACK: SelectDefaults = {
  align: 'start',
  alignOffset: 0,
  clearable: false,
  clearLabel: 'Clear selection',
  removeLabel: 'Remove {label}',
  summaryLabel: '{count} selected',
  closeOnEscape: true,
  closeOnOutsidePress: true,
  closeOnSelect: true,
  collisionPadding: 8,
  disabled: false,
  emptyLabel: 'No options',
  flip: true,
  fullWidth: true,
  hideWhenDetached: true,
  invalid: false,
  loading: false,
  loadingLabel: 'Loading…',
  loop: false,
  mount: 'active',
  multiple: false,
  portal: true,
  readOnly: false,
  required: false,
  shift: true,
  side: 'bottom',
  sideOffset: 4,
  size: 'md',
  strategy: 'absolute',
  typeahead: true,
  typeaheadTimeout: 500,
  variant: 'outline',
  width: 'anchor',
};

export const SELECT_DEFAULTS = new InjectionToken<SelectDefaults>('SELECT_DEFAULTS', {
  providedIn: 'root',
  factory: () => SELECT_FALLBACK,
});

/**
 * The decisions an application takes once, in its bootstrap, rather than on
 * every select it renders. A select that states one of them itself still wins.
 */
export function provideSelectDefaults(defaults: Partial<SelectDefaults>): Provider {
  return { provide: SELECT_DEFAULTS, useValue: { ...SELECT_FALLBACK, ...defaults } };
}

export function injectSelectDefaults(): SelectDefaults {
  return inject(SELECT_DEFAULTS);
}
