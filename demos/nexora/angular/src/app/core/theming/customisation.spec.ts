import { describe, expect, it } from 'vitest';

import {
  customisedAxes,
  isCustomised,
  NO_CUSTOMISATION,
  readCustomisation,
  type Customisation,
} from './customisation';

describe('customisation', () => {
  const full: Customisation = {
    radius: 12,
    body: 'source-serif',
    heading: 'fraunces',
    scale: 112,
    border: 2,
    shadow: 'strong',
    motion: 'off',
    cards: 'elevated',
    tabs: 'pill',
    chart: 'accent',
  };

  it('keeps every axis a reader set, and leaves the rest to the theme', () => {
    expect(readCustomisation(full)).toEqual(full);
    expect(readCustomisation({ body: 'inter' })).toEqual({ ...NO_CUSTOMISATION, body: 'inter' });
    expect(customisedAxes(readCustomisation({ heading: 'outfit', cards: 'flat' }))).toEqual([
      'heading',
      'cards',
    ]);
  });

  /** A stored value the builder does not offer is the theme's own again, axis by axis. */
  it('reads a value it does not offer as the theme’s own, without losing the others', () => {
    const read = readCustomisation({
      ...full,
      radius: 25,
      body: 'comic-sans',
      heading: 'serif',
      scale: '112',
      border: 3,
      shadow: null,
      motion: 'fast',
      cards: 1,
      tabs: 'segmented',
      chart: 'accent',
    });
    expect(read).toEqual({ ...NO_CUSTOMISATION, chart: 'accent' });
    expect(readCustomisation({ radius: 7 }).radius).toBeNull();
    expect(readCustomisation({ radius: -2 }).radius).toBeNull();
    expect(readCustomisation({ radius: 0 }).radius).toBe(0);
    expect(readCustomisation('serif')).toEqual(NO_CUSTOMISATION);
    expect(readCustomisation(null)).toEqual(NO_CUSTOMISATION);
  });

  it('is customised while any axis is set', () => {
    expect(isCustomised(NO_CUSTOMISATION)).toBe(false);
    expect(isCustomised({ ...NO_CUSTOMISATION, radius: 0 })).toBe(true);
    expect(isCustomised(full)).toBe(true);
  });
});
