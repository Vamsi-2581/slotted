import { InjectionToken, inject } from '@angular/core';
import type { StepOrientation } from '@slotted/core/steps';

export type StepperOrientation = StepOrientation;
export type StepperLabelPlacement = 'end' | 'bottom';
/** What a step header is: a control, a destination, or neither. */
export type StepperNavigation = 'button' | 'link' | 'none';
export type StepperStepReason = 'pointer' | 'keyboard' | 'programmatic';

/** The wording every step announces, so an application translates once. */
export interface StepperLabels {
  position: (index: number, count: number) => string;
  complete: string;
  current: string;
  invalid: string;
  loading: string;
  unavailable: string;
}

export const STEPPER_DEFAULT_LABELS: StepperLabels = {
  complete: 'completed',
  current: 'current',
  invalid: 'needs attention',
  loading: 'checking',
  position: (index, count) => `Step ${index + 1} of ${count}`,
  unavailable: 'unavailable',
};

export const STEPPER_DEFAULT_LABEL = 'Progress';
export const STEPPER_DEFAULT_ORIENTATION: StepperOrientation = 'horizontal';
export const STEPPER_DEFAULT_LABEL_PLACEMENT: StepperLabelPlacement = 'end';
export const STEPPER_DEFAULT_NAVIGATION: StepperNavigation = 'button';

export interface StepperDefaults {
  label?: string;
  labelPlacement?: StepperLabelPlacement;
  labels?: Partial<StepperLabels>;
  linear?: boolean;
  navigation?: StepperNavigation;
  orientation?: StepperOrientation;
}

export const STEPPER_DEFAULTS_TOKEN = new InjectionToken<StepperDefaults>(
  'slotted stepper defaults',
  { providedIn: 'root', factory: (): StepperDefaults => ({}) },
);

/**
 * An application decides once which way its flows run, where the labels sit,
 * whether a header can be pressed, whether the order is enforced, and what a
 * step announces in the language it ships. A stepper that states any of those
 * itself still wins: an explicit input is never overridden by the token.
 */
export function provideStepperDefaults(defaults: StepperDefaults) {
  return { provide: STEPPER_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectStepperDefaults(): StepperDefaults {
  return inject(STEPPER_DEFAULTS_TOKEN);
}
