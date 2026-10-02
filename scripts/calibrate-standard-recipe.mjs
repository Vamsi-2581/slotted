import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { format, resolveConfig } from 'prettier';

import {
  deltaE,
  evaluateRecipe,
  fitBound,
  parseSeed,
  relativeLuminance,
  SCHEMES,
  SEED_NAMES,
  seedGrid,
  toLinearSrgb,
} from '../packages/theme/dist/index.js';

/**
 * Generates `recipes.standard` from the default theme's colours as they stood
 * before the recipe existed (`packages/themes/src/default/reference.json`):
 *
 * 1. each token becomes a derivation of its seed that reproduces its value —
 *    a `-solid`, `-solid-active`, `-border` or `-text` of a coloured tone
 *    follows the seed's lightness by an offset, every other token keeps a
 *    fixed lightness, a `-solid-hover` mixes its solid, a `var()` stays an alias;
 * 2. chroma is capped: 0.25 where the token follows the seed, the reference
 *    chroma + 0.01 (at least 0.06) on a tinted surface; a reference colour
 *    with no chroma keeps none;
 * 3. a token of the neutral seed takes the seed's hue with no offset, and its
 *    chroma is capped at 0.06 and at the chroma sRGB holds at its lightness
 *    for every hue; in light and dark it keeps at least `NEUTRAL_SHARE` of the
 *    seed's chroma, the grounds' share, achromatic reference or not;
 * 4. the neutral grounds and the light neutral highlight take `GROUNDS` in
 *    place of the fit;
 * 5. each solid, hover, active, tone text and the accent edge gets one bound
 *    per side, against the worst ground or ink of its scheme over `seedGrid()`.
 *
 * Run after `pnpm --filter @slotted/theme build`; rebuild afterwards. The
 * source is written through the repository's Prettier options, so a run on
 * unchanged inputs leaves `standard.ts` byte for byte as it was.
 */

export const DEFAULT_SEEDS = {
  accent: '#1d4ed8',
  neutral: '#64748b',
  success: '#15803d',
  warning: '#facc15',
  danger: '#dc2626',
};

/** The share the hover moves toward white, per scheme — the rule the JSON pipeline applied before the recipe. */
const HOVER_SHARE = { light: 0.06, dark: 0.08, 'high-contrast': 0.06 };
const REQUIREMENT = { light: 4.5, dark: 4.5, 'high-contrast': 7 };
const TONE = /^--slotted-tone-(accent|secondary|success|warning|danger)-/;
const FOLLOWS_SEED = /-(solid|solid-active|border|text)$/;
const round = (value, digits) => Number(value.toFixed(digits));

/**
 * The share of the neutral seed's chroma every neutral token of light and dark
 * keeps at least. The reference is slate, and a fit to it gave each line,
 * highlight and ink a fixed slate share of the seed and a hue offset slate
 * has: a dark highlight kept 0.137 of the seed over grounds that keep 0.22,
 * so the step from a pink ground to it pointed at the opposite hue and read
 * green, and the near-white inks kept no chroma at all.
 */
const NEUTRAL_SHARE = 0.22;

/** The highest chroma, to three decimals, that sRGB holds at lightness `l` for every hue. */
function gamutCeiling(l) {
  const inside = (c, h) =>
    toLinearSrgb({ l, c, h }).every((channel) => channel >= 0 && channel <= 1);
  let ceiling = 0.4;
  for (let h = 0; h < 360; h += 0.25) {
    let low = 0;
    let high = ceiling;
    for (let step = 0; step < 30; step += 1) {
      const middle = (low + high) / 2;
      if (inside(middle, h)) low = middle;
      else high = middle;
    }
    ceiling = low;
  }
  return Math.floor(ceiling * 1000) / 1000;
}

/**
 * The grounds every panel, page and field is painted with. The reference has
 * them achromatic, and a fit to it gave them none of the neutral seed: a
 * neutral seed recoloured lines and text and left every card, popover, dialog
 * and menu where it was. Each ground keeps 0.22 of the seed's chroma, enough
 * for a seed of chroma 0.027 to reach 0.006, and is capped at the chroma sRGB
 * holds at its lightness for every hue, so the tint a screen paints is the one
 * `evaluateRecipe` computes. sRGB holds no chroma at lightness 1, so the light
 * grounds move to 0.985 and the sunken one to 0.97, where `--slotted-data-8`
 * still reads 3:1 on it; the neutral highlight keeps the 0.011 step below the
 * sunken ground the reference had, and with it the 0.02 step from the grounds.
 * `high-contrast` keeps the fit: its grounds and every tone ground are the
 * page's own white, its lines and inks are achromatic, and
 * `--slotted-text-muted` is the one neutral of that scheme that carries the
 * seed.
 */
export const GROUNDS = {
  light: {
    '--slotted-surface': { l: 0.985, c: { scale: 0.22, max: 0.006 } },
    '--slotted-surface-raised': { l: 0.985, c: { scale: 0.22, max: 0.006 } },
    '--slotted-surface-sunken': { l: 0.97, c: { scale: 0.22, max: 0.012 } },
    '--slotted-tone-secondary-subtle-hover': { l: 0.959 },
  },
  dark: {
    '--slotted-surface': { l: 0.188, c: { scale: 0.22, max: 0.03 } },
    '--slotted-surface-raised': { l: 0.205, c: { scale: 0.22, max: 0.03 } },
    '--slotted-surface-sunken': { l: 0.155, c: { scale: 0.22, max: 0.025 } },
    '--slotted-surface-inverse': { l: 0.985, c: { scale: 0.22, max: 0.006 } },
  },
};

function seedOf(token) {
  const match = TONE.exec(token);
  return !match || match[1] === 'secondary' ? 'neutral' : match[1];
}

function fit(reference, seeds) {
  const recipe = {};
  for (const scheme of SCHEMES) {
    recipe[scheme] = {};
    for (const [token, value] of Object.entries(reference[scheme])) {
      const alias = /^var\((--[a-z0-9-]+)\)$/.exec(value);
      if (alias) {
        recipe[scheme][token] = { alias: alias[1] };
        continue;
      }
      if (token.endsWith('-solid-hover')) {
        recipe[scheme][token] = { mix: token.replace(/-hover$/, ''), share: HOVER_SHARE[scheme] };
        continue;
      }
      const name = seedOf(token);
      const seed = seeds[name];
      const target = parseSeed(value);
      if (!target) throw new Error(`${scheme} ${token}: ${value} is not a seed notation`);
      const ground = GROUNDS[scheme]?.[token];
      if (name === 'neutral') {
        const l = ground?.l ?? round(target.l, 3);
        const tinted = scheme !== 'high-contrast';
        const scale = target.c < 0.004 ? 0 : round(target.c / seed.c, 3);
        recipe[scheme][token] = {
          seed: name,
          l,
          c: tinted
            ? { scale: Math.max(scale, NEUTRAL_SHARE), max: Math.min(0.06, gamutCeiling(l)) }
            : { scale, max: scale === 0 ? 0 : Math.min(0.06, gamutCeiling(l)) },
          ...ground,
        };
        continue;
      }
      const follows = !token.endsWith('-on-solid') && FOLLOWS_SEED.test(token) && target.c > 0.03;
      const scale = seed.c > 0 ? round(target.c / seed.c, 3) : 0;
      const max = target.c < 0.004 ? 0 : follows ? 0.25 : round(Math.max(0.06, target.c + 0.01), 3);
      let shift = target.h - seed.h;
      if (shift > 180) shift -= 360;
      if (shift < -180) shift += 360;
      recipe[scheme][token] = {
        seed: name,
        l: follows ? { offset: round(target.l - seed.l, 3) } : round(target.l, 3),
        c: { scale: target.c < 0.004 ? 0 : scale, max },
        ...(target.c >= 0.02 && Math.abs(shift) > 3 ? { h: Math.round(shift) } : {}),
      };
    }
    recipe[scheme]['--slotted-focus-ring-color'] = { alias: '--slotted-tone-accent-border' };
    recipe[scheme]['--slotted-focus-ring-color-invalid'] = {
      alias: '--slotted-tone-danger-border',
    };
  }
  return recipe;
}

/** The lowest and highest luminance a token takes over the grid of its own seed. */
function luminanceRange(recipe, seeds, scheme, token) {
  const rule = recipe[scheme][token];
  const varied = rule.seed ?? null;
  let low = 1;
  let high = 0;
  for (const seed of varied ? seedGrid() : [null]) {
    const values = evaluateRecipe(recipe, varied ? { ...seeds, [varied]: seed } : seeds, scheme);
    const { raw, clipped } = relativeLuminance(values[token]);
    low = Math.min(low, raw, clipped);
    high = Math.max(high, raw, clipped);
  }
  return [low, high];
}

function addBounds(recipe, seeds) {
  for (const scheme of SCHEMES) {
    const required = REQUIREMENT[scheme];
    const lightGround = scheme !== 'dark';
    const targets = {};
    const want = (token, side, target) => {
      const key = `${token}|${side}`;
      const stricter = side === 'ceiling' ? Math.min : Math.max;
      targets[key] = key in targets ? stricter(targets[key], target) : target;
    };
    const ranges = new Map();
    const range = (token) => {
      if (!ranges.has(token))
        ranges.set(token, luminanceRange(recipe, seeds, scheme, `--slotted-${token}`));
      return ranges.get(token);
    };
    const against = (token, grounds, ratio) => {
      if (lightGround) {
        const lowest = Math.min(...grounds.map((ground) => range(ground)[0]));
        want(token, 'ceiling', (lowest + 0.05) / ratio - 0.05);
      } else {
        const highest = Math.max(...grounds.map((ground) => range(ground)[1]));
        want(token, 'floor', ratio * (highest + 0.05) - 0.05);
      }
    };
    for (const tone of ['accent', 'success', 'warning', 'danger']) {
      const [inkLow, inkHigh] = range(`tone-${tone}-on-solid`);
      const whiteInk = inkLow > 0.5;
      for (const state of ['solid', 'solid-hover', 'solid-active']) {
        if (whiteInk) want(`tone-${tone}-${state}`, 'ceiling', (inkLow + 0.05) / required - 0.05);
        else want(`tone-${tone}-${state}`, 'floor', required * (inkHigh + 0.05) - 0.05);
      }
      against(
        `tone-${tone}-text`,
        [`tone-${tone}-surface`, 'surface', 'surface-raised', 'surface-sunken'],
        required,
      );
    }
    against(
      'tone-accent-border',
      ['surface', 'surface-raised', 'surface-sunken', 'tone-accent-surface'],
      3,
    );
    for (const [key, target] of Object.entries(targets)) {
      const [token, side] = key.split('|');
      const rule = recipe[scheme][`--slotted-${token}`];
      if (!rule || 'alias' in rule) continue;
      rule.bounds = [...(rule.bounds ?? []), fitBound(target, side, 0.25)];
    }
  }
  return recipe;
}

export async function calibrate() {
  const reference = JSON.parse(
    await readFile(
      new URL('../packages/themes/src/default/reference.json', import.meta.url),
      'utf8',
    ),
  );
  const seeds = Object.fromEntries(
    SEED_NAMES.map((name) => [name, parseSeed(DEFAULT_SEEDS[name])]),
  );
  const recipe = addBounds(fit(reference, seeds), seeds);

  const deviations = [];
  for (const scheme of SCHEMES) {
    const values = evaluateRecipe(recipe, seeds, scheme);
    for (const [token, value] of Object.entries(reference[scheme])) {
      if (value.startsWith('var(')) continue;
      const distance = deltaE(values[token], parseSeed(value));
      if (distance > 0.02)
        deviations.push({ scheme, token, from: value, distance: round(distance, 4) });
    }
  }
  return { recipe, deviations };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { recipe, deviations } = await calibrate();
  const source =
    '// Generated by scripts/calibrate-standard-recipe.mjs from packages/themes/src/default/reference.json. Do not edit.\n' +
    "import type { Recipe } from '../recipe';\n\n" +
    `export const standard: Recipe = ${JSON.stringify(recipe, null, 2)};\n`;
  const target = fileURLToPath(
    new URL('../packages/theme/src/recipes/standard.ts', import.meta.url),
  );
  const options = await resolveConfig(target);
  await writeFile(target, await format(source, { ...options, filepath: target }));
  console.log(JSON.stringify(deviations, null, 2));
}
