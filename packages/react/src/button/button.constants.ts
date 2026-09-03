/**
 * The five colours are tones in `docs/token-foundation.md`, so the axis that
 * selects one is `tone`. `variant` names what it actually selects: how the
 * chosen tone is painted.
 */
export const BUTTON_TONES = ['accent', 'secondary', 'success', 'warning', 'danger'] as const;
export const BUTTON_VARIANTS = ['solid', 'outline', 'ghost'] as const;
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export const BUTTON_SHAPES = ['square', 'circle'] as const;

export const BUTTON_DEFAULTS = { tone: 'accent', variant: 'solid', size: 'md' } as const;
export const BUTTON_LINK_DEFAULTS = BUTTON_DEFAULTS;
export const ICON_BUTTON_DEFAULTS = {
  tone: 'secondary',
  variant: 'ghost',
  size: 'md',
  shape: 'square',
} as const;
export const TOGGLE_BUTTON_DEFAULTS = {
  tone: 'secondary',
  variant: 'outline',
  size: 'md',
} as const;

/**
 * What the ring announces itself as when the consumer says nothing. It is a
 * progress bar, so it needs a name; an application replaces it per instance or
 * translates it once at the call site.
 */
export const BUTTON_LOADING_LABEL = 'Loading';
