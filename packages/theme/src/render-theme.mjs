import { LAYER_ORDER_STATEMENT } from '../dist/layer-order.js';

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

/**
 * The theme name is what every block is scoped by, so it is also what selects
 * the theme on the page. An application that writes a name no loaded
 * stylesheet carries leaves the subtree with no custom property defined at
 * all: the families fall through to the system colours they keep as a last
 * resort, and a `transition` that names an undefined duration is dropped
 * whole. Two themes are two disjoint selector sets, which is what lets both
 * stylesheets be loaded at once and the attribute decide between them.
 */
export function renderThemeCss(contract, theme) {
  const blocks = [
    `  [data-slotted-theme="${theme.name}"] {\n${declarations(tokenNames(contract, 'base'), theme.base)}\n  }`,
  ];

  /**
   * A scheme is a palette and a hint to the user agent. Without `color-scheme`
   * every native control, scrollbar and form widget keeps the light user-agent
   * style whatever scheme the application selected: an unchecked radio on a
   * dark card renders as a solid white dot, which reads as checked.
   *
   * It is not a token. A token names a value a family reads, and no family
   * reads this one — the user agent does, from the element the scheme is
   * selected on, which is exactly where these blocks already are.
   *
   * `high-contrast` is a light scheme here: it paints black on white, so the
   * light widget style is the one that matches it.
   */
  const UA_SCHEME = { light: 'light', dark: 'dark', 'high-contrast': 'light' };

  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const ua = UA_SCHEME[scheme];
    if (ua === undefined) {
      throw new Error(`${scheme}: no user-agent colour scheme is declared for it`);
    }
    blocks.push(
      `${schemeSelectors(theme, scheme).join(',\n')} {\n` +
        `    color-scheme: ${ua};\n` +
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
