import assert from 'node:assert/strict';
import test from 'node:test';

import { renderThemeCss } from '../src/render-theme.mjs';

/**
 * The renderer is held to a contract it has never seen, so nothing it emits
 * can be read back out of the contract the library ships.
 */
test('renders independent theme, scheme, and density scopes', () => {
  const css = renderThemeCss(
    {
      layers: ['primitive', 'semantic', 'component'],
      axes: ['base', 'scheme', 'density'],
      tokens: [
        { name: '--base', layer: 'primitive', axis: 'base', type: 'length', root: true },
        {
          name: '--scheme',
          layer: 'semantic',
          axis: 'scheme',
          type: 'color',
          root: true,
          forcedColor: 'Canvas',
        },
        { name: '--density', layer: 'semantic', axis: 'density', type: 'length', root: true },
      ],
    },
    {
      name: 'test',
      base: { '--base': '1px' },
      schemes: { light: { '--scheme': '#fff' } },
      densities: { compact: { '--density': '2rem' } },
      reducedMotion: {},
    },
  );

  assert.match(css, /data-slotted-theme="test"/);
  assert.match(css, /data-slotted-scheme="light"/);
  assert.match(css, /data-slotted-density="compact"/);
  assert.match(css, /--scheme: #fff/);
});

test('refuses a scheme it cannot hint to the user agent', () => {
  assert.throws(
    () =>
      renderThemeCss(
        { layers: [], axes: ['base', 'scheme', 'density'], tokens: [] },
        {
          name: 'test',
          base: {},
          schemes: { sepia: {} },
          densities: {},
          reducedMotion: {},
        },
      ),
    /sepia: no user-agent colour scheme is declared for it/,
  );
});
