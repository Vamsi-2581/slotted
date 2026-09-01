import { describe, expect, it } from 'vitest';

import {
  DENSITIES,
  DIRECTIONS,
  GLOBAL_TYPES,
  INITIAL_GLOBALS,
  SCHEMES,
  resolveWorkbenchGlobals,
} from './globals';

describe('resolveWorkbenchGlobals', () => {
  it('returns safe defaults for an absent Storybook context', () => {
    expect(resolveWorkbenchGlobals(undefined)).toEqual({
      background: '#f4f6f8',
      density: 'comfortable',
      direction: 'ltr',
      scheme: 'light',
      theme: 'default',
    });
  });

  it('resolves supported dark compact values', () => {
    expect(
      resolveWorkbenchGlobals({ theme: 'default', scheme: 'dark', density: 'compact' }),
    ).toEqual({
      background: '#09090b',
      density: 'compact',
      direction: 'ltr',
      scheme: 'dark',
      theme: 'default',
    });
  });

  it('keeps initial globals aligned with the resolver', () => {
    expect(resolveWorkbenchGlobals(INITIAL_GLOBALS)).toMatchObject(INITIAL_GLOBALS);
  });

  it('offers every axis the theme emits', () => {
    expect(SCHEMES).toEqual(['light', 'dark', 'high-contrast']);
    expect(DENSITIES).toEqual(['comfortable', 'compact', 'dense']);
    expect(DIRECTIONS).toEqual(['ltr', 'rtl']);
    expect(GLOBAL_TYPES.scheme.toolbar.items).toEqual([...SCHEMES]);
    expect(GLOBAL_TYPES.density.toolbar.items).toEqual([...DENSITIES]);
    expect(GLOBAL_TYPES.direction.toolbar.items).toEqual([...DIRECTIONS]);
  });

  it('resolves the high-contrast scheme, the dense density and a mirrored document', () => {
    expect(
      resolveWorkbenchGlobals({ scheme: 'high-contrast', density: 'dense', direction: 'rtl' }),
    ).toEqual({
      background: '#ffffff',
      density: 'dense',
      direction: 'rtl',
      scheme: 'high-contrast',
      theme: 'default',
    });
  });

  it('falls back to the safe value for an axis it does not recognise', () => {
    expect(
      resolveWorkbenchGlobals({ scheme: 'sepia', density: 'roomy', direction: 'sideways' }),
    ).toMatchObject({ scheme: 'light', density: 'comfortable', direction: 'ltr' });
  });
});
