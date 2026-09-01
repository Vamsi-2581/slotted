import assert from 'node:assert/strict';
import test from 'node:test';

import { DENSITIES, DIRECTIONS, SCHEMES, WIDTHS, renderHarness } from './build.mjs';
import { captureClip, captureName, parseArguments } from './shoot.mjs';

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

test('gives a filtered page one column, so the widest stage is not clipped', () => {
  const html = render();
  assert.match(html, /body\[data-only\] main \{ grid-template-columns: 1fr \}/);
  assert.ok(
    html.indexOf('body[data-only] main') > html.indexOf('main { display: grid'),
    'the single-column rule has to come after the review grid to win',
  );
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

/**
 * A capture is evidence only while it says which axes it was taken on. The
 * caption is baked at build time and cannot know them, so two captures of the
 * same scene at two densities carried the same label and the reader had no way
 * to tell them apart inside the image.
 */
test('names the density and the direction in every caption it captions', () => {
  const html = render();
  assert.match(html, /<span data-axes><\/span>/);
  assert.match(html, /querySelectorAll\('\[data-axes\]'\)/);
  assert.match(html, /documentElement\.dataset\.slottedDensity/);
  assert.match(html, /documentElement\.dir/);
});

test('paints each stage on the theme surface it is judged against', () => {
  assert.match(render(), /background: var\(--slotted-surface\)/);
});

test('defaults every axis and names each one in the file it writes', () => {
  const options = parseArguments(['demo']);
  assert.deepEqual(options, {
    family: 'demo',
    outDir: options.outDir,
    active: undefined,
    focus: undefined,
    hover: undefined,
    scene: undefined,
    scheme: 'light',
    width: '420',
    density: 'comfortable',
    dir: 'ltr',
  });
  assert.equal(captureName(options), 'demo-light-comfortable-ltr-420.png');
});

test('captures a focused element, because a focus ring is judged from an image', () => {
  const options = parseArguments(['demo', '--focus', '[data-focusable] a']);
  assert.equal(options.focus, '[data-focusable] a');
  assert.equal(captureName(options), 'demo-focus-data-focusable-a-light-comfortable-ltr-420.png');
});

/**
 * Hover and press exist in no capture the shooter could take before this: a
 * headless page has no pointer, so a family could paint a hover fill nobody
 * ever looked at. The pseudo-class is forced through the protocol instead of
 * simulated with a mouse, because a moved pointer also scrolls, hovers whatever
 * it passes over, and cannot reach `:active` at all without holding a button
 * down for the length of the capture.
 */
test('captures hover and press, which a headless page has no pointer to produce', () => {
  const hovered = parseArguments(['demo', '--hover', "[data-ui='card']"]);
  assert.equal(hovered.hover, "[data-ui='card']");
  assert.equal(captureName(hovered), 'demo-hover-data-ui-card-light-comfortable-ltr-420.png');

  const pressed = parseArguments(['demo', '--active', "[data-ui='card']"]);
  assert.equal(pressed.active, "[data-ui='card']");
  assert.equal(captureName(pressed), 'demo-active-data-ui-card-light-comfortable-ltr-420.png');
});

test('keeps a hovered capture and a pressed capture of one element apart', () => {
  const hovered = parseArguments(['demo', '--hover', 'a']);
  const pressed = parseArguments(['demo', '--active', 'a']);
  assert.notEqual(captureName(hovered), captureName(pressed));
});

test('keeps two focus targets in the same combination in two files', () => {
  const first = parseArguments(['demo', '--focus', 'a']);
  const second = parseArguments(['demo', '--focus', 'button']);
  assert.notEqual(captureName(first), captureName(second));
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

test('narrows a capture to one scene and says so in the file name', () => {
  const options = parseArguments(['demo', '--scene', 'emphasis']);
  assert.equal(options.scene, 'emphasis');
  assert.equal(captureName(options), 'demo-emphasis-light-comfortable-ltr-420.png');
  assert.match(render(), /q\.get\('scene'\)/);
  assert.match(render(), /id\.startsWith\(scene \+ '-'\)/);
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

test('photographs the page once, at the scale the emulation already set', () => {
  const clip = captureClip({ width: '420', contentHeight: 553 });
  assert.equal(clip.scale, 1, 'a second scale factor repeats the top of the page below the fold');
  assert.equal(clip.width, 500);
  assert.equal(clip.height, 553);
});

test('clips to the content, not to the viewport floor a short page never reaches', () => {
  assert.equal(captureClip({ width: '420', contentHeight: 553.4 }).height, 554);
  assert.equal(captureClip({ width: '420', contentHeight: 0 }).height, 1);
});
