import { inject, InjectionToken } from '@angular/core';
import type { ColorFormat } from '@slotted/core/color';

export type { ColorFormat };
export type ColorPickerSize = 'sm' | 'md' | 'lg';

export interface ColorPickerDefaults {
  alphaLabel: string;
  areaLabel: string;
  eyedropperLabel: string;
  format: ColorFormat;
  formatLabel: string;
  gamutLabel: string;
  hueLabel: string;
  inputLabel: string;
  presets: readonly string[] | undefined;
  presetsLabel: string;
  previousLabel: string;
  size: ColorPickerSize;
  triggerLabel: string;
}

const FALLBACK: ColorPickerDefaults = {
  alphaLabel: 'Opacity',
  areaLabel: 'Saturation and brightness',
  eyedropperLabel: 'Pick a colour from the screen',
  format: 'hex',
  formatLabel: 'Notation',
  gamutLabel: 'Outside sRGB: the screen shows the nearest colour.',
  hueLabel: 'Hue',
  inputLabel: 'Colour',
  presets: undefined,
  presetsLabel: 'Presets',
  previousLabel: 'Restore',
  size: 'md',
  triggerLabel: 'Choose a colour',
};

export const COLOR_PICKER_DEFAULTS = new InjectionToken<ColorPickerDefaults>(
  'slotted color picker defaults',
  { providedIn: 'root', factory: () => FALLBACK },
);

/** An application decides once its notation, its palette and its words. */
export function provideColorPickerDefaults(defaults: Partial<ColorPickerDefaults>) {
  return {
    provide: COLOR_PICKER_DEFAULTS,
    useFactory: (): ColorPickerDefaults => ({ ...FALLBACK, ...defaults }),
  };
}

export function injectColorPickerDefaults(): ColorPickerDefaults {
  return inject(COLOR_PICKER_DEFAULTS);
}
