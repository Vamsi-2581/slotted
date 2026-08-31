import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { LAYER_ORDER_STATEMENT } from '@slotted/tokens/layer-order';
import { assertValidTheme } from '@slotted/tokens/validate-theme';

/**
 * Every list this renderer emits is derived from the contract it is handed, so
 * a theme built against a different contract emits that contract's tokens.
 */
function tokenNames(contract, axis) {
  return contract.tokens.filter((token) => token.axis === axis).map((token) => token.name);
}

function reducedMotionNames(contract) {
  return contract.tokens.filter((token) => token.reducedMotion).map((token) => token.name);
}

function forcedColorMap(contract) {
  return Object.fromEntries(
    contract.tokens
      .filter((token) => token.forcedColor !== undefined)
      .map((token) => [token.name, token.forcedColor]),
  );
}

function declarations(names, values, indent = '    ') {
  return names.map((name) => `${indent}${name}: ${values[name]};`).join('\n');
}

function schemeSelectors(theme, scheme) {
  return [
    `  [data-slotted-theme="${theme.name}"][data-slotted-scheme="${scheme}"]`,
    `  [data-slotted-theme="${theme.name}"] [data-slotted-scheme="${scheme}"]`,
  ];
}

function densitySelectors(theme, density) {
  return [
    `  [data-slotted-theme="${theme.name}"][data-slotted-density="${density}"]`,
    `  [data-slotted-theme="${theme.name}"] [data-slotted-density="${density}"]`,
  ];
}

export function renderThemeCss(contract, theme) {
  const blocks = [
    `  [data-slotted-theme="${theme.name}"] {\n${declarations(tokenNames(contract, 'base'), theme.base)}\n  }`,
  ];

  for (const [scheme, values] of Object.entries(theme.schemes)) {
    blocks.push(
      `${schemeSelectors(theme, scheme).join(',\n')} {\n` +
        `${declarations(tokenNames(contract, 'scheme'), values)}\n  }`,
    );
  }

  for (const [density, values] of Object.entries(theme.densities)) {
    blocks.push(
      `${densitySelectors(theme, density).join(',\n')} {\n` +
        `${declarations(tokenNames(contract, 'density'), values)}\n  }`,
    );
  }

  /**
   * A coarse pointer cannot hit what a mouse can. Every control grows to the
   * comfortable target on touch, at the density the application chose, so a
   * dense table stays dense in its type and spacing while its controls stay
   * operable. `max()` keeps a theme whose control is already larger untouched.
   */
  const targets = tokenNames(contract, 'density').filter((name) =>
    /^--slotted-control-height-(sm|md|lg)$/.test(name),
  );
  blocks.push(
    `  @media (pointer: coarse) {\n` +
      Object.entries(theme.densities)
        .map(
          ([density, values]) =>
            `${densitySelectors(theme, density)
              .map((selector) => `  ${selector}`)
              .join(',\n')} {\n` +
            targets
              .map(
                (name) => `      ${name}: max(${values[name]}, var(--slotted-target-comfortable));`,
              )
              .join('\n') +
            `\n    }`,
        )
        .join('\n\n') +
      `\n  }`,
  );

  /**
   * Under forced colours the operating system replaces the palette. A family
   * that reads a semantic token therefore keeps working, because the token is
   * remapped here rather than in each stylesheet. The selector list repeats
   * the scheme selectors so the mapping carries their specificity; a media
   * query adds none of its own.
   */
  const forced = forcedColorMap(contract);
  const forcedSelectors = [
    `  [data-slotted-theme="${theme.name}"]`,
    ...Object.keys(theme.schemes).flatMap((scheme) => schemeSelectors(theme, scheme)),
  ];
  blocks.push(
    `  @media (forced-colors: active) {\n` +
      `${forcedSelectors.map((selector) => `  ${selector}`).join(',\n')} {\n` +
      `${tokenNames(contract, 'scheme')
        .map((name) => `      ${name}: ${forced[name]};`)
        .join('\n')}\n` +
      `    }\n  }`,
  );

  /**
   * One query collapses every duration token, so a family honours the
   * preference by reaching for a token rather than by writing its own rule.
   * It is emitted last because a media query adds no specificity: source
   * order is what makes it win.
   *
   * An animation that loops forever needs more than a short duration — it
   * needs to stop — so those families keep their own rule.
   */
  blocks.push(
    `  @media (prefers-reduced-motion: reduce) {\n` +
      `    [data-slotted-theme="${theme.name}"] {\n` +
      `${declarations(reducedMotionNames(contract), theme.reducedMotion, '      ')}\n` +
      `    }\n  }`,
  );

  /**
   * The order statement opens every distributed stylesheet. A layer takes its
   * position from the first mention of its name, so an entry point that omits
   * it leaves the order to whatever the application loaded first.
   */
  return `${LAYER_ORDER_STATEMENT}\n@layer slotted.theme {\n${blocks.join('\n\n')}\n}\n`;
}

async function build() {
  const contract = JSON.parse(
    await readFile(new URL('../../../tokens/src/contract.json', import.meta.url), 'utf8'),
  );
  const theme = JSON.parse(await readFile(new URL('../src/theme.json', import.meta.url), 'utf8'));
  assertValidTheme(contract, theme);
  const distUrl = new URL('../dist/', import.meta.url);
  await mkdir(distUrl, { recursive: true });
  await writeFile(new URL('styles.css', distUrl), renderThemeCss(contract, theme));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await build();
}
