import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import {
  deltaE,
  evaluateRecipe,
  fitBound,
  parseSeed,
  relativeLuminance,
  SCHEMES,
  SEED_NAMES,
  seedGrid,
} from '../packages/theme/dist/index.js';

/**
 * Generates `recipes.standard` from the default theme's colours as they stood
 * before the recipe existed (`packages/themes/src/default/reference.json`):
 *
 * 1. each token becomes a derivation of its seed that reproduces its value —
 *    a `-solid`, `-solid-active`, `-border` or `-text` of a coloured tone
 *    follows the seed's lightness by an offset, every other token keeps a
 *    fixed lightness, a `-solid-hover` mixes its solid, a `var()` stays an alias;
 * 2. chroma is capped: 0.25 where the token follows the seed, 0.06 on the
 *    neutral, the reference chroma + 0.01 (at least 0.06) on a tinted surface;
 * 3. each solid, hover, active, tone text and the accent edge gets one bound
 *    per side, against the worst ground or ink of its scheme over `seedGrid()`.
 *
 * Run after `pnpm --filter @slotted/theme build`; rebuild afterwards.
 */

export const DEFAULT_SEEDS = {
  accent: '#1d4ed8',
  neutral: '#64748b',
  success: '#15803d',
  warning: '#facc15',
  danger: '#dc2626',
};

/** The share the hover moves toward white, per scheme — the rule of the retired `tone-hover.mjs`. */
const HOVER_SHARE = { light: 0.06, dark: 0.08, 'high-contrast': 0.06 };
const REQUIREMENT = { light: 4.5, dark: 4.5, 'high-contrast': 7 };
const TONE = /^--slotted-tone-(accent|secondary|success|warning|danger)-/;
const FOLLOWS_SEED = /-(solid|solid-active|border|text)$/;
const round = (value, digits) => Number(value.toFixed(digits));

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
      const follows =
        name !== 'neutral' &&
        !token.endsWith('-on-solid') &&
        FOLLOWS_SEED.test(token) &&
        target.c > 0.03;
      const scale = seed.c > 0 ? round(target.c / seed.c, 3) : 0;
      const max =
        target.c < 0.004
          ? 0
          : name === 'neutral'
            ? 0.06
            : follows
              ? 0.25
              : round(Math.max(0.06, target.c + 0.01), 3);
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
  await writeFile(new URL('../packages/theme/src/recipes/standard.ts', import.meta.url), source);
  console.log(JSON.stringify(deviations, null, 2));
}
