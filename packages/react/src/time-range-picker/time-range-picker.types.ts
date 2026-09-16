import type { PlainTime, TimeGranularity, TimeOption, TimeRangeValue } from '@slotted/core/date';
import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, Ref } from 'react';

import type { TimeFieldHourCycle } from '../time-field';

/** A run of times, either end of which may be open. */
export type TimeRange = TimeRangeValue;

/** Where the surface opens, before the positioner has read the room. */
export type TimeRangePickerPlacement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';

/**
 * Whether choosing closes the surface. `auto` closes when the work becomes
 * whole — by a press in a list, by `now` or by a preset — and stays open
 * while an end is still missing, because the next press has to reach the
 * same surface.
 */
export type TimeRangePickerCloseOnSelect = 'auto' | 'always' | 'never';

/** What a time a bound or the predicate refuses looks like in a list. */
export type TimeRangePickerUnavailableOptions = 'disable' | 'hide';

export type TimeRangePickerSize = 'sm' | 'md' | 'lg';
export type TimeRangePickerVariant = 'outline' | 'subtle' | 'plain';

/** The end being edited: the field and the panel carrying `data-current`. */
export type TimeRangePickerPosition = 'start' | 'end';

/** The highlighted option of each list. */
export interface TimeRangePickerHighlight {
  readonly start: PlainTime | null;
  readonly end: PlainTime | null;
}

export type TimeRangePickerValueReason = Extract<
  ChangeRequest<TimeRange | null>['reason'],
  'pointer' | 'keyboard' | 'select' | 'clear' | 'blur' | 'programmatic'
>;

/**
 * What the hint says, in the product's own words. `{end}` is replaced by the
 * current end's label.
 */
export interface TimeRangePickerHintLabels {
  /** While the current end is missing; `{end}` is replaced by its label. */
  choose: string;
  /** The work is whole and the end comes before the start. */
  order: string;
  /** The work is whole and its duration falls outside minLength or maxLength. */
  length: string;
  /** The work is whole and crosses an unavailable time. */
  unavailable: string;
  /** The work is whole and an end falls outside min or max. */
  bounds: string;
}

/** What an application sets once for every time range picker under it. */
export interface TimeRangePickerDefaults {
  /** The trigger's name once a range is chosen, before the two times. */
  changeLabel: string;
  /** The trigger's name, and the frame's placeholder, while nothing is chosen. */
  chooseLabel: string;
  clearLabel: string;
  closeOnSelect: TimeRangePickerCloseOnSelect;
  /** What a panel says when its end has no time available at all. */
  emptyLabel: string;
  /** The accessible name of the end field and the label of its panel. */
  endLabel: string;
  granularity: TimeGranularity;
  hourCycle: TimeFieldHourCycle | undefined;
  /** "2 hr 30 min", in the product's own words; seconds in, and the family's locale. */
  lengthLabel: (seconds: number, locale: string | undefined) => string;
  /** "30 min to 4 hr": what the band says while a limit is set; seconds in, and the locale. */
  limitLabel: (
    min: number | undefined,
    max: number | undefined,
    locale: string | undefined,
  ) => string;
  locale: string | undefined;
  /** How many rows a list may reach before it is cut. */
  maxOptions: number;
  /** The control in the band that writes the current time into the current end. */
  nowLabel: string;
  /** The button at the end of the footer that closes with what is written. */
  doneLabel: string;
  /** What the hint says: what to choose next, or what is wrong. */
  hintLabels: TimeRangePickerHintLabels;
  placement: TimeRangePickerPlacement;
  size: TimeRangePickerSize;
  /** The accessible name of the start field and the label of its panel. */
  startLabel: string;
  /** Seconds between two offered times. */
  step: number;
  timeZone: string | undefined;
  /** What a panel says when its list stops short of the configuration. */
  truncatedLabel: string;
  unavailableOptions: TimeRangePickerUnavailableOptions;
  variant: TimeRangePickerVariant;
}

export interface TimeRangePickerDefaultsProviderProps extends Partial<
  Omit<TimeRangePickerDefaults, 'hintLabels'>
> {
  children?: ReactNode | undefined;
  hintLabels?: Partial<TimeRangePickerHintLabels> | undefined;
}

export interface TimeRangePickerRootProps extends HTMLAttributes<HTMLElement> {
  'data-disabled'?: '' | undefined;
  'data-granularity': TimeGranularity;
  'data-invalid'?: '' | undefined;
  'data-open'?: '' | undefined;
  'data-part': string;
  'data-readonly'?: '' | undefined;
  'data-required'?: '' | undefined;
  'data-size': TimeRangePickerSize;
  'data-ui': string;
  'data-variant': TimeRangePickerVariant;
  ref?: Ref<HTMLElement> | undefined;
}

/** The imperative actions a consumer cannot express declaratively. */
export interface TimeRangePickerHandle {
  /** Puts focus on the trigger, which is the frame. */
  focus(): void;
  open(): void;
  close(): void;
}

/** What `renderOption` receives: the row's own state, and the time it holds. */
export interface TimeRangePickerOptionState {
  readonly position: TimeRangePickerPosition;
  readonly time: PlainTime;
  /** The whole time in the locale's shape, which is what the row draws. */
  readonly label: string;
  /** The duration the run would have with the other end as it stands, in words; `null` when the row carries none. */
  readonly duration: string | null;
  readonly selected: boolean;
  readonly current: boolean;
  readonly unavailable: boolean;
}

export interface TimeRangePickerProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange' | 'ref'
> {
  /** Present means the consumer owns the value. */
  value?: TimeRange | null | undefined;
  defaultValue?: TimeRange | null | undefined;
  onValueChange?:
    ((value: TimeRange | null, request: ChangeRequest<TimeRange | null>) => void) | undefined;

  /** Present means the consumer owns whether the surface is showing. */
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, request: ChangeRequest<boolean>) => void) | undefined;

  /** Present means the consumer owns which end is being edited. */
  position?: TimeRangePickerPosition | undefined;
  defaultPosition?: TimeRangePickerPosition | undefined;
  onPositionChange?:
    | ((position: TimeRangePickerPosition, request: ChangeRequest<TimeRangePickerPosition>) => void)
    | undefined;

  /** Where the reader is in each list. Present means the consumer owns it. */
  highlighted?: TimeRangePickerHighlight | undefined;
  defaultHighlighted?: TimeRangePickerHighlight | undefined;
  onHighlightedChange?:
    | ((value: TimeRangePickerHighlight, request: ChangeRequest<TimeRangePickerHighlight>) => void)
    | undefined;

  min?: PlainTime | undefined;
  max?: PlainTime | undefined;
  isTimeUnavailable?: ((time: PlainTime) => boolean) | undefined;
  /**
   * Whether a run may cross an unavailable time. On, and with a start chosen,
   * the options beyond the first unavailable one are refused in the end list;
   * off, the run may jump over it. A typed run whose end is unavailable is
   * invalid either way.
   */
  contiguous?: boolean | undefined;
  /** The shortest and longest run allowed, in seconds. */
  minLength?: number | undefined;
  maxLength?: number | undefined;
  lengthLabel?: TimeRangePickerDefaults['lengthLabel'] | undefined;
  limitLabel?: TimeRangePickerDefaults['limitLabel'] | undefined;

  /** Seconds between two offered times. Ignored when `options` states the list. */
  step?: number | undefined;
  /** The times to offer, stated rather than stepped; the same list for both ends. */
  options?: readonly PlainTime[] | undefined;
  /** How many rows a list may reach before it is cut. */
  maxOptions?: number | undefined;
  unavailableOptions?: TimeRangePickerUnavailableOptions | undefined;

  locale?: string | undefined;
  timeZone?: string | undefined;
  hourCycle?: TimeFieldHourCycle | undefined;
  granularity?: TimeGranularity | undefined;
  /** What "now" is, for a story or a test; the clock otherwise. */
  referenceTime?: PlainTime | undefined;

  size?: TimeRangePickerSize | undefined;
  variant?: TimeRangePickerVariant | undefined;
  placement?: TimeRangePickerPlacement | undefined;
  closeOnSelect?: TimeRangePickerCloseOnSelect | undefined;

  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;

  /** Draws one clear on the frame, which empties both ends. */
  clearable?: boolean | undefined;
  /** Whether the two fields in the band take the relative expression. */
  relative?: boolean | undefined;
  clearLabel?: string | undefined;
  chooseLabel?: string | undefined;
  changeLabel?: string | undefined;
  startLabel?: string | undefined;
  endLabel?: string | undefined;
  nowLabel?: string | undefined;
  doneLabel?: string | undefined;
  hintLabels?: Partial<TimeRangePickerHintLabels> | undefined;
  emptyLabel?: string | undefined;
  truncatedLabel?: string | undefined;

  /** The names of the two hidden inputs a plain form post reads. */
  startName?: string | undefined;
  endName?: string | undefined;

  /** The consumer's own shortcuts, as `TimeRangePickerPreset` elements. */
  presets?: ReactNode | undefined;
  /** The consumer's own actions, under the lists. */
  footer?: ReactNode | undefined;
  /** What one row draws. The row is the family's; what is in it is not. */
  renderOption?: ((state: TimeRangePickerOptionState) => ReactNode) | undefined;

  render?: ((props: TimeRangePickerRootProps) => ReactNode) | undefined;
  ref?: Ref<TimeRangePickerHandle> | undefined;
}

export interface TimeRangePickerPresetRootProps extends HTMLAttributes<HTMLElement> {
  'data-part': string;
  'data-selected'?: '' | undefined;
  disabled?: boolean | undefined;
  type: 'button';
  ref?: Ref<HTMLElement> | undefined;
}

export interface TimeRangePickerPresetProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'value' | 'ref'
> {
  /** The range the press writes, or a function resolving it at the press. */
  value: TimeRange | (() => TimeRange);
  render?: ((props: TimeRangePickerPresetRootProps) => ReactNode) | undefined;
  ref?: Ref<HTMLButtonElement> | undefined;
}

export type { TimeOption };
