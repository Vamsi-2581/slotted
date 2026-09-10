import { inject, InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

export type MultiSelectSize = 'sm' | 'md' | 'lg';
export type MultiSelectVariant = 'outline' | 'subtle' | 'plain';
export type MultiSelectSide = 'bottom' | 'top' | 'inline-start' | 'inline-end' | 'left' | 'right';
export type MultiSelectAlign = 'start' | 'center' | 'end';
export type MultiSelectWidth = 'anchor' | 'content';
export type MultiSelectMount = 'active' | 'lazy' | 'eager';
export type MultiSelectStrategy = 'absolute' | 'fixed';

/** What the row does with more chips than fit on one line. */
export type MultiSelectOverflow = 'wrap' | 'collapse';
/** Whether an option already in the set stays in the list, marked, or leaves it. */
export type MultiSelectChosenOptions = 'show' | 'hide';

export type MultiSelectOptionValue = string;

export type MultiSelectOpenReason =
  | 'pointer'
  | 'keyboard'
  | 'escape'
  | 'outsidePress'
  | 'select'
  | 'dismiss'
  | 'blur'
  | 'programmatic';

/**
 * Why the set moved. The six words the React binding states in full, and for
 * the same reason: a consumer writes a different handler for each, and
 * `keyboard` is reorder alone.
 */
export type MultiSelectValueReason =
  'select' | 'submit' | 'remove' | 'clear' | 'keyboard' | 'programmatic';

export type MultiSelectInputReason =
  'keyboard' | 'select' | 'submit' | 'clear' | 'blur' | 'programmatic';

export type MultiSelectHighlightReason = 'pointer' | 'keyboard' | 'programmatic';

/** Why a value the reader offered did not get in. */
export type MultiSelectRefuseCause = 'duplicate' | 'limit' | 'invalid';

/**
 * Whether an option answers a query. `null` turns filtering off entirely, which
 * is what a list a server has already filtered needs.
 */
export type MultiSelectFilter = ((label: string, query: string) => boolean) | null;

/** Whether text the reader typed may become a value at all. */
export type MultiSelectValidator = (
  text: string,
  values: readonly MultiSelectOptionValue[],
) => boolean;

export interface MultiSelectOption {
  value: MultiSelectOptionValue;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectOptionGroup {
  label: string;
  options: readonly MultiSelectOption[];
}

export type MultiSelectItems = readonly (MultiSelectOption | MultiSelectOptionGroup)[];

export interface MultiSelectDefaults {
  addOnPaste: boolean;
  align: MultiSelectAlign;
  alignOffset: number;
  allowDuplicates: boolean;
  chosenLabel: string;
  chosenOptions: MultiSelectChosenOptions;
  clearable: boolean;
  clearLabel: string;
  closeOnEscape: boolean;
  closeOnOutsidePress: boolean;
  closeOnSelect: boolean;
  collisionPadding: number;
  commitOnBlur: boolean;
  countLabel: string;
  counterLabel: string;
  creatable: boolean;
  createLabel: string;
  /** The characters that commit the typed text, and split a paste. */
  delimiters: readonly string[];
  disabled: boolean;
  editable: boolean;
  emptyLabel: string;
  flip: boolean;
  fullWidth: boolean;
  hideWhenDetached: boolean;
  highlightMatch: boolean;
  invalid: boolean;
  loading: boolean;
  loadingLabel: string;
  loop: boolean;
  /** The most values the set may hold, or `null` for no limit. */
  max: number | null;
  mount: MultiSelectMount;
  overflow: MultiSelectOverflow;
  portal: boolean;
  readOnly: boolean;
  removeLabel: string;
  reorderable: boolean;
  reorderLabel: string;
  required: boolean;
  shift: boolean;
  side: MultiSelectSide;
  sideOffset: number;
  size: MultiSelectSize;
  strategy: MultiSelectStrategy;
  triggerLabel: string;
  variant: MultiSelectVariant;
  width: MultiSelectWidth;
}

/**
 * The numbers, and why they are these numbers. The React binding's
 * `MULTI_SELECT_FALLBACK` states the reasoning; the values are the same, and
 * they have to be — an application that renders both bindings would otherwise
 * ship two controls that behave differently under the same name.
 */
export const MULTI_SELECT_FALLBACK: MultiSelectDefaults = {
  addOnPaste: true,
  align: 'start',
  alignOffset: 0,
  allowDuplicates: false,
  chosenLabel: '{count} chosen',
  chosenOptions: 'show',
  clearable: true,
  clearLabel: 'Clear',
  closeOnEscape: true,
  closeOnOutsidePress: true,
  closeOnSelect: false,
  collisionPadding: 8,
  commitOnBlur: true,
  countLabel: '{count} results',
  counterLabel: '{count} of {max}',
  creatable: false,
  createLabel: 'Add “{query}”',
  delimiters: [','],
  disabled: false,
  editable: false,
  emptyLabel: 'No matches',
  flip: true,
  fullWidth: true,
  hideWhenDetached: true,
  highlightMatch: true,
  invalid: false,
  loading: false,
  loadingLabel: 'Loading…',
  loop: false,
  max: null,
  mount: 'active',
  overflow: 'wrap',
  portal: true,
  readOnly: false,
  removeLabel: 'Remove {label}',
  reorderable: false,
  reorderLabel: '{label}, position {position} of {count}',
  required: false,
  shift: true,
  side: 'bottom',
  sideOffset: 4,
  size: 'md',
  strategy: 'absolute',
  triggerLabel: 'Show options',
  variant: 'outline',
  width: 'anchor',
};

export const MULTI_SELECT_DEFAULTS = new InjectionToken<MultiSelectDefaults>(
  'MULTI_SELECT_DEFAULTS',
  { providedIn: 'root', factory: () => MULTI_SELECT_FALLBACK },
);

/** The decisions an application takes once, including the eight sentences. */
export function provideMultiSelectDefaults(defaults: Partial<MultiSelectDefaults>): Provider {
  return { provide: MULTI_SELECT_DEFAULTS, useValue: { ...MULTI_SELECT_FALLBACK, ...defaults } };
}

export function injectMultiSelectDefaults(): MultiSelectDefaults {
  return inject(MULTI_SELECT_DEFAULTS);
}
