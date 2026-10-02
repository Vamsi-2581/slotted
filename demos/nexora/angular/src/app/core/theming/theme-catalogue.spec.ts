import { parseSeed } from '@slotted/theme';
import { describe, expect, it } from 'vitest';

import { NEUTRAL_PRESETS } from './appearance';
import { nexoraTheme } from './nexora-themes';
import { RUNTIME_THEME_IDS, THEME_CATALOGUE } from './theme-catalogue';

describe('theme catalogue', () => {
  it('names one definition per entry, and only the runtime themes leave `default`', () => {
    expect(THEME_CATALOGUE.map((entry) => nexoraTheme(entry.id).name)).toEqual(
      THEME_CATALOGUE.map((entry) => entry.id),
    );
    expect(RUNTIME_THEME_IDS).toEqual(['nexora-soft', 'nexora-sharp', 'nexora-editorial']);
    for (const entry of THEME_CATALOGUE) {
      if (entry.neutral !== null) expect(nexoraTheme(entry.id).seeds.neutral).toBe(entry.neutral);
    }
  });

  /**
   * A grey the reader picks has to read as a choice beside the theme's own:
   * every pair of greys offered — the three presets and the themes' own — is
   * apart by 25° of hue or 0.01 of chroma (OKLCH).
   */
  it('offers greys apart from one another and from every theme’s own', () => {
    const greys = [
      ...NEUTRAL_PRESETS.flatMap((preset) => (preset.color === null ? [] : [preset.color])),
      ...THEME_CATALOGUE.flatMap((entry) => (entry.neutral === null ? [] : [entry.neutral])),
    ];
    for (const [index, a] of greys.entries()) {
      for (const b of greys.slice(index + 1)) {
        const [x, y] = [parseSeed(a)!, parseSeed(b)!];
        const hue = Math.abs(x.h - y.h) % 360;
        const apart = Math.min(hue, 360 - hue) >= 25 || Math.abs(x.c - y.c) >= 0.01;
        expect(apart, `${a} beside ${b}`).toBe(true);
      }
    }
  });

  /** The Editorial theme sets the contract's heading face; no rule writes a face of its own. */
  it('gives Editorial its serif through the heading token', () => {
    const editorial = nexoraTheme('nexora-editorial');
    expect(editorial.base?.['--slotted-font-family-heading']).toMatch(/^ui-serif,.*serif$/);
    for (const entry of THEME_CATALOGUE) {
      expect((nexoraTheme(entry.id).rules ?? []).join('\n'), entry.id).not.toMatch(
        /font-family\s*:/,
      );
    }
  });
});
