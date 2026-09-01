/**
 * The toolbar has to offer every axis the theme emits, or the reviewer cannot
 * see what the law requires. High contrast, the dense density and a
 * right-to-left document are as much part of a family's contract as light and
 * dark, and a family is judged in Storybook before it is judged anywhere else.
 */
export const SCHEMES = ['light', 'dark', 'high-contrast'] as const;
export const DENSITIES = ['comfortable', 'compact', 'dense'] as const;
export const DIRECTIONS = ['ltr', 'rtl'] as const;

export type WorkbenchScheme = (typeof SCHEMES)[number];
export type WorkbenchDensity = (typeof DENSITIES)[number];
export type WorkbenchDirection = (typeof DIRECTIONS)[number];

/** The canvas each scheme is previewed against, outside the component's surface. */
const CANVAS: Record<WorkbenchScheme, string> = {
  light: '#f4f6f8',
  dark: '#09090b',
  'high-contrast': '#ffffff',
};

export const INITIAL_GLOBALS = {
  theme: 'default',
  scheme: 'light',
  density: 'comfortable',
  direction: 'ltr',
} as const;

export const GLOBAL_TYPES = {
  theme: { toolbar: { icon: 'paintbrush', items: ['default'] as string[] } },
  scheme: { toolbar: { icon: 'contrast', items: [...SCHEMES] as string[] } },
  density: { toolbar: { icon: 'component', items: [...DENSITIES] as string[] } },
  direction: { toolbar: { icon: 'transfer', items: [...DIRECTIONS] as string[] } },
} as const;

type StorybookGlobals = Record<string, unknown> | undefined;

function oneOf<T extends string>(values: readonly T[], value: unknown, fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

export function resolveWorkbenchGlobals(globals: StorybookGlobals) {
  const scheme = oneOf(SCHEMES, globals?.['scheme'], 'light');
  const density = oneOf(DENSITIES, globals?.['density'], 'comfortable');
  const direction = oneOf(DIRECTIONS, globals?.['direction'], 'ltr');

  return {
    background: CANVAS[scheme],
    density,
    direction,
    scheme,
    theme: 'default',
  } as const;
}
