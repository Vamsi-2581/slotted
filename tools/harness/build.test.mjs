import assert from 'node:assert/strict';
import test from 'node:test';

import { renderHarness } from './build.mjs';

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

test('renders every scene in both schemes at every width', () => {
  const html = render();
  for (const scene of ['default', 'current']) {
    for (const scheme of ['light', 'dark']) {
      for (const width of [240, 420, 720]) {
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
