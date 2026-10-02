import { SCHEMES } from '@slotted/theme';
import { describe, expect, it } from 'vitest';

import { CONTRAST_TOKENS, contrastReadings } from './contrast-reading';
import { nexoraTheme } from './nexora-themes';
import { catalogueTheme, THEME_CATALOGUE } from './theme-catalogue';

describe('contrastReadings', () => {
  it('reads four pairs in each of the three schemes, against the floors of recipe-checks', () => {
    const readings = contrastReadings('default', { accent: '#7c3aed' });

    expect(readings.map((reading) => reading.scheme)).toEqual(['light', 'dark', 'high-contrast']);
    for (const reading of readings) {
      expect(reading.pairs.map((pair) => pair.id)).toEqual([
        'text',
        'accent-text',
        'accent-border',
        'on-solid',
      ]);
    }
    const floors = (scheme: string) =>
      readings.find((reading) => reading.scheme === scheme)!.pairs.map((pair) => pair.floor);
    expect(floors('light')).toEqual([4.5, 4.5, 3, 4.5]);
    expect(floors('dark')).toEqual([4.5, 4.5, 3, 4.5]);
    expect(floors('high-contrast')).toEqual([7, 7, 3, 7]);
    for (const pair of readings.flatMap((reading) => reading.pairs)) {
      expect(pair.ratio).toBeGreaterThan(1);
      expect(pair.passes).toBe(pair.ratio >= pair.floor);
    }
  });

  it('moves the accent pairs with the brand and the text pair with the neutral', () => {
    const light = (seeds: Parameters<typeof contrastReadings>[1]) =>
      Object.fromEntries(
        contrastReadings('default', seeds)[0]!.pairs.map((pair) => [pair.id, pair.ratio]),
      );
    const violet = light({ accent: '#7c3aed' });
    const amber = light({ accent: '#d97706' });
    const warm = light({ accent: '#7c3aed', neutral: '#78716c' });

    expect(amber['accent-text']).not.toBe(violet['accent-text']);
    expect(amber['on-solid']).not.toBe(violet['on-solid']);
    expect(amber['text']).toBe(violet['text']);
    expect(warm['text']).not.toBe(violet['text']);
    expect(warm['on-solid']).toBe(violet['on-solid']);
  });

  /** A theme's own neutral holds when the reader writes none. */
  it('reads the theme’s own seeds under the reader’s', () => {
    const sage = catalogueTheme('nexora-editorial').neutral!;
    const own = contrastReadings('nexora-editorial', { accent: '#7c3aed' })[0]!.pairs[0]!.ratio;
    const same = contrastReadings('default', { accent: '#7c3aed', neutral: sage })[0]!.pairs[0]!
      .ratio;
    expect(own).toBe(same);
  });

  /**
   * The readings are the recipe's arithmetic; a value a theme declares over the
   * recipe is not in them. Every theme of the catalogue leaves the six tokens
   * to the recipe, in `base`, in `components` and in every scheme.
   */
  it('reads only tokens no catalogue theme declares over the recipe', () => {
    for (const entry of THEME_CATALOGUE) {
      const theme = nexoraTheme(entry.id);
      const declared = [
        theme.base,
        theme.components,
        ...SCHEMES.map((scheme) => theme.schemes?.[scheme]),
      ].flatMap((values) => Object.keys(values ?? {}));
      expect(
        CONTRAST_TOKENS.filter((token) => declared.includes(token)),
        entry.id,
      ).toEqual([]);
    }
  });
});
