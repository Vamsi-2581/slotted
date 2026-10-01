import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import defaultTheme from '../../../packages/themes/src/default/theme.mjs';
import {
  deltaE,
  evaluateRecipe,
  parseSeed,
  renderTheme,
  SEED_NAMES,
} from '../../../packages/theme/dist/index.js';
import { buildTheme } from '../../../packages/theme/cli/build.mjs';
import { attachScript, bundleScript } from '../script.mjs';
import { launch } from '../shoot.mjs';

/**
 * Theme B (`proof`, dark, its own accent seed) inside theme A (`default`,
 * light), with a `default` island inside B:
 *
 * 1. B's rules apply in B and nowhere else — not in A, not in the island;
 * 2. B derives its colours from its own seed, A from the theme's;
 * 3. a layer opened from inside B and moved to the end of the body keeps
 *    B's theme, scheme and seed, and B's rules apply inside it;
 * 4. a layer opened from inside a React `ThemeScope` carries the theme,
 *    scheme and seed the binding wrote.
 *
 * A stand-in family stylesheet gives every `[data-ui]` a border and a radius
 * in `slotted.components`, the layer a theme rule has to win against.
 *
 * `bundleScript` resolves a bare import from `packages/core`, which has no
 * React; the binding and React are imported by their paths in the repository,
 * and React resolves from `packages/react`, where it is installed.
 *
 * Run: node tools/harness/scenarios/theme-scope-nesting.mjs
 * Exits non-zero when an assertion fails.
 */

const ROOT = new URL('../../../', import.meta.url);
const inRepository = (path) => JSON.stringify(fileURLToPath(new URL(path, ROOT)));
const out = new URL('../out/theme-scope-nesting/', import.meta.url);
await mkdir(out, { recursive: true });
const proof = await buildTheme(
  fileURLToPath(new URL('packages/theme/test/fixtures/proof/theme.mjs', ROOT)),
  fileURLToPath(out),
);

const SCOPE_SEED = '#e11d48';
/** `--slotted-seed-*` is registered as `<color>`, so its computed value is `rgb()`. */
const SCOPE_SEED_COMPUTED = 'rgb(225, 29, 72)';

const html = `<!doctype html><html><head><style>
${renderTheme(defaultTheme)}
${proof.css}
@layer slotted.components { [data-ui] { display: block; border: 1px solid; border-radius: 3px; } }
</style></head><body>
<div id="a" data-slotted-theme="default" data-slotted-scheme="light">
  <i id="a-probe"></i>
  <div id="a-button" data-ui="button"></div>
  <div id="a-field" data-ui="text-field"></div>
  <div id="b" data-slotted-theme="proof" data-slotted-scheme="dark" data-slotted-seeds style="--slotted-seed-accent: #16a34a">
    <i id="b-probe"></i>
    <div id="b-button" data-ui="button"></div>
    <div id="b-field" data-ui="text-field"></div>
    <span id="b-trigger"></span>
    <div id="island" data-slotted-theme="default" data-slotted-scheme="light">
      <div id="island-button" data-ui="button"></div>
    </div>
  </div>
</div>
<div id="react-mount"></div>
</body></html>`;

const script = await bundleScript(
  `import { createPortalRoot } from '@slotted/core/portal';
   import { createElement } from ${inRepository('packages/react/node_modules/react/index.js')};
   import { flushSync } from ${inRepository('packages/react/node_modules/react-dom/index.js')};
   import { createRoot } from ${inRepository('packages/react/node_modules/react-dom/client.js')};
   import { ThemeScope } from ${inRepository('packages/react/src/theme/index.ts')};
   window.openLayer = (id) => {
     const portal = createPortalRoot({ origin: document.getElementById(id) });
     portal.container.innerHTML = '<i id="layer-probe"></i><div id="layer-button" data-ui="button"></div>';
     return true;
   };
   window.openScopeLayer = () => {
     const root = createRoot(document.getElementById('react-mount'));
     flushSync(() =>
       root.render(
         createElement(
           ThemeScope,
           { theme: 'proof', scheme: 'dark', seeds: { accent: ${JSON.stringify(SCOPE_SEED)} } },
           createElement('span', { id: 'scope-trigger' }),
         ),
       ),
     );
     const portal = createPortalRoot({ origin: document.getElementById('scope-trigger') });
     return portal.container;
   };
`,
  ROOT,
);
const page = new URL('page.html', out);
await writeFile(page, attachScript(html, script));

const READ = `(() => {
  window.openLayer('b-trigger');
  const layer = document.getElementById('layer-probe').parentElement;
  const scopeLayer = window.openScopeLayer();
  const accent = (id) => {
    const probe = document.getElementById(id);
    probe.style.color = 'var(--slotted-tone-accent-solid)';
    return getComputedStyle(probe).color;
  };
  const radius = (id) => getComputedStyle(document.getElementById(id)).borderTopLeftRadius;
  const carried = (element) => ({
    theme: element.getAttribute('data-slotted-theme'),
    scheme: element.getAttribute('data-slotted-scheme'),
    seeds: element.hasAttribute('data-slotted-seeds'),
    seed: element.style.getPropertyValue('--slotted-seed-accent'),
  });
  return {
    radius: { a: radius('a-button'), b: radius('b-button'), island: radius('island-button'), layer: radius('layer-button') },
    fieldTop: { a: getComputedStyle(document.getElementById('a-field')).borderTopWidth, b: getComputedStyle(document.getElementById('b-field')).borderTopWidth },
    accent: { a: accent('a-probe'), b: accent('b-probe'), layer: accent('layer-probe') },
    layer: carried(layer),
    scope: { ...carried(scopeLayer), moved: scopeLayer.closest('#react-mount') === null },
  };
})()`;

const { devtools, close } = await launch();
let reading;
try {
  await devtools.send('Page.enable');
  await devtools.send('Runtime.enable');
  const loaded = devtools.once('Page.loadEventFired');
  await devtools.send('Page.navigate', { url: pathToFileURL(fileURLToPath(page)).href });
  await loaded;
  const { result, exceptionDetails } = await devtools.send('Runtime.evaluate', {
    expression: READ,
    returnByValue: true,
  });
  if (exceptionDetails)
    throw new Error(exceptionDetails.exception?.description ?? 'the scene did not run');
  reading = result.value;
} finally {
  devtools.close();
  await close();
}
console.log(JSON.stringify(reading, null, 2));

const oklch = (text) => {
  const match = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+|none)/.exec(text);
  assert.ok(match, `the browser wrote ${text}`);
  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: match[3] === 'none' ? 0 : Number(match[3]),
  };
};
const seedsOf = (theme, overrides = {}) =>
  Object.fromEntries(
    SEED_NAMES.map((name) => [name, parseSeed(overrides[name] ?? theme.seeds[name])]),
  );
const proofTheme = (await import(new URL('proof.js', out).href)).default;
const expected = {
  a: evaluateRecipe(defaultTheme.recipe, seedsOf(defaultTheme), 'light')[
    '--slotted-tone-accent-solid'
  ],
  b: evaluateRecipe(proofTheme.recipe, seedsOf(proofTheme, { accent: '#16a34a' }), 'dark')[
    '--slotted-tone-accent-solid'
  ],
};

assert.equal(reading.radius.a, '3px', 'theme A carries no rule for button');
assert.equal(reading.radius.b, '9999px', "theme B's rule rounds its button");
assert.equal(reading.radius.island, '3px', "theme B's rule stops at an element of another theme");
assert.equal(reading.fieldTop.a, '1px');
assert.equal(reading.fieldTop.b, '0px', "theme B's rule removes the field's top edge");
assert.ok(deltaE(oklch(reading.accent.a), expected.a) < 0.005, 'A derives from its own seed');
assert.ok(
  deltaE(oklch(reading.accent.b), expected.b) < 0.005,
  'B derives from the seed it carries',
);
assert.equal(reading.layer.theme, 'proof');
assert.equal(reading.layer.scheme, 'dark');
assert.ok(reading.layer.seeds, 'the layer is marked to derive from its seeds');
assert.ok(reading.layer.seed.length > 0, 'the layer carries the seed of the region');
assert.ok(
  deltaE(oklch(reading.accent.layer), expected.b) < 0.005,
  'the layer derives what B derives',
);
assert.equal(reading.radius.layer, '9999px', "theme B's rule applies inside the layer");
assert.deepEqual(
  reading.scope,
  { theme: 'proof', scheme: 'dark', seeds: true, seed: SCOPE_SEED_COMPUTED, moved: true },
  'a layer opened inside a ThemeScope carries the theme, scheme and seed the binding wrote',
);
console.log(
  'ok — rules stay in their theme, seeds derive per scope, and a layer keeps its region, a ThemeScope included',
);
