import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const ROOT = new URL('..', import.meta.url).pathname;
const contract = JSON.parse(readFileSync(join(ROOT, 'packages/tokens/src/contract.json'), 'utf8'));
const theme = JSON.parse(
  readFileSync(join(ROOT, 'packages/themes/default/src/theme.json'), 'utf8'),
);
const foundation = readFileSync(join(ROOT, 'docs/token-foundation.md'), 'utf8');
const buildLog = readFileSync(join(ROOT, 'docs/BUILD-LOG.md'), 'utf8');

const SCHEMES = ['light', 'dark', 'high-contrast'];
const DENSITIES = ['comfortable', 'compact', 'dense'];

function section(name) {
  const match = foundation.match(new RegExp(`^## ${name}\\n([\\s\\S]*?)(?=^## |\\Z)`, 'm'));
  assert.ok(match, `Missing ${name} section`);
  return match[1];
}

function tokens(predicate) {
  return contract.tokens.filter(predicate);
}

function names(predicate) {
  return tokens(predicate).map((token) => token.name);
}

function rows(content) {
  return content
    .split('\n')
    .filter((line) => line.startsWith('| '))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter((cells) => !cells.every((cell) => /^-+$/.test(cell)));
}

function assertExactTable(title, header, expectedRows) {
  const content = section(title);
  const [actualHeader, ...actualRows] = rows(content);
  assert.deepEqual(actualHeader, header, `${title} has the wrong table headers`);

  const actualKeys = actualRows.map((row) => JSON.stringify(row));
  const expectedKeys = expectedRows.map((row) => JSON.stringify(row));
  assert.equal(
    new Set(actualKeys).size,
    actualKeys.length,
    `${title} contains duplicate token rows`,
  );
  assert.deepEqual(
    new Set(actualKeys),
    new Set(expectedKeys),
    `${title} has stale or missing token rows`,
  );
}

function assertBaseTable(title, prefix) {
  const entries = names((token) => token.axis === 'base' && token.name.startsWith(prefix));
  assert.ok(entries.length > 0, `${title} documents no token`);
  assertExactTable(
    title,
    ['Token', 'Default value'],
    entries.map((name) => [`\`${name}\``, `\`${theme.base[name]}\``]),
  );
}

function assertSchemeTable(title, predicate) {
  const entries = names((token) => token.axis === 'scheme' && predicate(token.name));
  assert.ok(entries.length > 0, `${title} documents no token`);
  assertExactTable(
    title,
    ['Token', 'Light', 'Dark', 'High contrast'],
    entries.map((name) => [
      `\`${name}\``,
      ...SCHEMES.map((scheme) => `\`${theme.schemes[scheme][name]}\``),
    ]),
  );
}

test('documents every foundation value in its source-specific table', () => {
  assertBaseTable('Space', '--slotted-space-');
  assertBaseTable('Radius', '--slotted-radius-');
  assertBaseTable('Type size', '--slotted-font-size-');
  assertBaseTable('Line height', '--slotted-line-height-');
  assertBaseTable('Font weight', '--slotted-font-weight-');
  assertBaseTable('Font family', '--slotted-font-family-');
  assertBaseTable('Border width', '--slotted-border-width-');
  assertBaseTable('Stacking', '--slotted-z-index-');
  assertBaseTable('Glyph', '--slotted-icon-');
  assertBaseTable('Target size', '--slotted-target-');
});

test('documents the layer every token belongs to', () => {
  const declared = rows(section('Layers')).slice(1);
  assert.deepEqual(
    declared.map(([layer]) => layer),
    contract.layers.map((layer) => `\`${layer}\``),
    'The layer table must name every layer the contract declares, in order',
  );

  for (const layer of contract.layers) {
    const counted = tokens((token) => token.layer === layer).length;
    const row = declared.find(([name]) => name === `\`${layer}\``);
    assert.equal(row?.at(-1), String(counted), `${layer} states the wrong token count`);
  }
});

test('documents the motion scale with the value each duration collapses to', () => {
  const motion = names(
    (token) =>
      token.axis === 'base' &&
      (token.name.startsWith('--slotted-duration-') || token.name.startsWith('--slotted-easing-')),
  );
  assertExactTable(
    'Motion',
    ['Token', 'Default value', 'Reduced-motion value'],
    motion.map((name) => {
      const reduced = theme.reducedMotion[name] ?? 'unchanged';
      return [
        `\`${name}\``,
        `\`${theme.base[name]}\``,
        reduced === 'unchanged' ? reduced : `\`${reduced}\``,
      ];
    }),
  );
});

test('documents the control typography every family shares', () => {
  assertBaseTable('Control typography', '--slotted-control-');
});

test('documents each scheme colour in all three schemes', () => {
  assertSchemeTable('Shadow', (name) => name.startsWith('--slotted-shadow-'));
  assertSchemeTable(
    'Semantic colour',
    (name) => !name.startsWith('--slotted-shadow-') && !name.startsWith('--slotted-tone-'),
  );
});

test('documents what forced colours replace each scheme token with', () => {
  const entries = tokens(
    (token) => token.axis === 'scheme' && !token.name.startsWith('--slotted-tone-'),
  );
  assertExactTable(
    'Forced colours',
    ['Token', 'Replacement'],
    entries.map((token) => [`\`${token.name}\``, `\`${token.forcedColor}\``]),
  );
});

test('documents the control geometry of every density', () => {
  const geometry = names(
    (token) => token.axis === 'density' && token.name.startsWith('--slotted-control-'),
  );
  const aliases = names(
    (token) => token.axis === 'density' && token.name.startsWith('--slotted-button-'),
  );

  assertExactTable(
    'Control geometry',
    ['Token', 'Comfortable', 'Compact', 'Dense', 'Legacy Button alias'],
    geometry.map((name) => {
      const [, geometryName, size] = name.match(/^--slotted-control-(.+)-(sm|md|lg)$/) ?? [];
      const alias = aliases.find(
        (candidate) => candidate === `--slotted-button-${geometryName}-${size}`,
      );
      return [
        `\`${name}\``,
        ...DENSITIES.map((density) => `\`${theme.densities[density][name]}\``),
        alias ? `\`${alias}\`` : '—',
      ];
    }),
  );
});

test('states the rules the contract enforces rather than leaving them to habit', () => {
  assert.match(foundation, /scale root/i);
  assert.match(foundation, /literal/i);
  assert.match(foundation, /forced-colors/i);
  assert.match(foundation, /pointer: coarse/i);
  assert.match(foundation, /24 × 24/);
});

test('scopes the law to the families the rebuild has reached', () => {
  assert.match(foundation, /binding for every family the rebuild has reached/i);
  assert.match(foundation, /legacy-families\.json/);
  assert.match(
    foundation,
    /infinite animations\s+must stop or disable[\s\S]*shortening is insufficient/i,
  );

  assert.match(buildLog, /only the four motion-scale\s+duration tokens\s+collapse/i);
});
