import { createContext, useContext } from 'react';

import type { ColorPickerDefaults, ColorPickerDefaultsProviderProps } from './color-picker.types';

/** What the picker's controls are called; an application translates them once. */
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

const ColorPickerDefaultsContext = createContext<ColorPickerDefaults>(FALLBACK);

export function useColorPickerDefaults(): ColorPickerDefaults {
  return useContext(ColorPickerDefaultsContext);
}

/** An application decides once its notation, its palette and its words. */
export function ColorPickerDefaultsProvider({
  children,
  ...defaults
}: ColorPickerDefaultsProviderProps) {
  const inherited = useColorPickerDefaults();
  const value = { ...inherited };
  for (const [key, entry] of Object.entries(defaults)) {
    if (entry !== undefined) (value as Record<string, unknown>)[key] = entry;
  }
  return (
    <ColorPickerDefaultsContext.Provider value={value}>
      {children}
    </ColorPickerDefaultsContext.Provider>
  );
}
