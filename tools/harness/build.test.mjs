import assert from 'node:assert/strict';
import test from 'node:test';

import { DENSITIES, DIRECTIONS, SCHEMES, WIDTHS, renderHarness } from './build.mjs';
import { parseArguments } from './shoot.mjs';

const fragment = `
<section data-scene="default"><b class="x">one</b></section>
<section data-scene="current"><b class="x">two</b></section>
`;

const render = () =>
  renderHarness({
    family: 'demo',
    fragment,
    familyCss: '.x { color: red }',
    themeCss: '[data-slotted-theme="default"] { --t: 1px }',
  });

test('emits one document carrying both stylesheets', () => {
  const html = render();
  assert.match(html, /^<!doctype html>/i);
  assert.ok(html.includes('.x { color: red }'), 'the family stylesheet is missing');
  assert.ok(html.includes('--t: 1px'), 'the theme is missing');
});

test('renders every scene in every scheme at every width', () => {
  const html = render();
  for (const scene of ['default', 'current']) {
    for (const scheme of SCHEMES) {
      for (const width of WIDTHS) {
        assert.ok(
          html.includes(`id="${scene}-${scheme}-${width}"`),
          `missing cell ${scene}-${scheme}-${width}`,
        );
      }
    }
  }
});

test('gives each cell the scheme attribute the theme selects on', () => {
  assert.match(render(), /data-slotted-scheme="dark"/);
});

test('captures the high-contrast scheme, not only light and dark', () => {
  assert.deepEqual(SCHEMES, ['light', 'dark', 'high-contrast']);
  assert.match(render(), /data-slotted-scheme="high-contrast"/);
});

test('applies density and direction to the page rather than to each cell', () => {
  const html = render();
  assert.deepEqual(DENSITIES, ['comfortable', 'compact', 'dense']);
  assert.deepEqual(DIRECTIONS, ['ltr', 'rtl']);
  assert.match(html, /q\.get\('density'\)/);
  assert.match(html, /q\.get\('dir'\)/);
  assert.match(html, /documentElement\.dataset\.slottedDensity = density/);
  assert.match(html, /documentElement\.dir = direction/);
});

test('paints each stage on the theme surface it is judged against', () => {
  assert.match(render(), /background: var\(--slotted-surface\)/);
});

test('defaults every axis and names each one in the file it writes', () => {
  const options = parseArguments(['demo']);
  assert.deepEqual(options, {
    family: 'demo',
    outDir: options.outDir,
    scheme: 'light',
    width: '420',
    density: 'comfortable',
    dir: 'ltr',
  });
});

test('reads every axis by name', () => {
  const options = parseArguments([
    'demo',
    '--scheme',
    'high-contrast',
    '--density',
    'dense',
    '--dir',
    'rtl',
    '--width',
    '240',
    '--out',
    '/somewhere',
  ]);
  assert.equal(options.scheme, 'high-contrast');
  assert.equal(options.density, 'dense');
  assert.equal(options.dir, 'rtl');
  assert.equal(options.width, '240');
  assert.equal(options.outDir, '/somewhere');
});

test('refuses an axis value the harness cannot render', () => {
  assert.throws(() => parseArguments(['demo', '--density', 'roomy']), /density must be one of/);
  assert.throws(() => parseArguments(['demo', '--scheme']), /needs a value/);
  assert.throws(() => parseArguments(['--scheme', 'dark']), /usage/);
});

test('sizes each cell so a container query has something to answer', () => {
  assert.match(render(), /inline-size:\s*240px/);
});

test('refuses a fragment that declares no scene', () => {
  assert.throws(
    () =>
      renderHarness({ family: 'demo', fragment: '<b>no scene</b>', familyCss: '', themeCss: '' }),
    /no scene/i,
  );
});

test('keeps the scene markup verbatim, so the harness shows the real DOM', () => {
  assert.ok(render().includes('<b class="x">one</b>'));
});
