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

function section(name) {
  const match = foundation.match(new RegExp(`^## ${name}\\n([\\s\\S]*?)(?=^## |\\Z)`, 'm'));
  assert.ok(match, `Missing ${name} section`);
  return match[1];
}

function assertContractTokens(tokens) {
  const names = new Set([
    ...contract.base,
    ...contract.scheme,
    ...contract.density,
    ...contract.reducedMotion,
  ]);

  for (const name of tokens) {
    assert.ok(names.has(name), `Contract is missing ${name}`);
  }
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
  const entries = Object.entries(theme.base).filter(([name]) => name.startsWith(prefix));
  assertContractTokens(entries.map(([name]) => name));
  assertExactTable(
    title,
    ['Token', 'Default value'],
    entries.map(([name, value]) => [`\`${name}\``, `\`${value}\``]),
  );
}

test('documents every foundation value in its source-specific table', () => {
  assertBaseTable('Space', '--slotted-space-');
  assertBaseTable('Radius', '--slotted-radius-');
  assertBaseTable('Type size', '--slotted-font-size-');
  assertBaseTable('Line height', '--slotted-line-height-');
  assertBaseTable('Font weight', '--slotted-font-weight-');
  assertBaseTable('Stacking', '--slotted-z-index-');
  assertBaseTable('Glyph', '--slotted-icon-');

  const motionTokens = [
    ...Object.keys(theme.base).filter((name) => name.startsWith('--slotted-duration-')),
    ...Object.keys(theme.base).filter((name) => name.startsWith('--slotted-easing-')),
  ];
  assertContractTokens([...motionTokens, ...Object.keys(theme.reducedMotion)]);
  assertExactTable(
    'Motion',
    ['Token', 'Default value', 'Reduced-motion value'],
    motionTokens.map((name) => {
      const reduced = theme.reducedMotion[name] ?? 'unchanged';
      return [
        `\`${name}\``,
        `\`${theme.base[name]}\``,
        reduced === 'unchanged' ? reduced : `\`${reduced}\``,
      ];
    }),
  );

  const shadowNames = Object.keys(theme.schemes.light).filter((name) =>
    name.startsWith('--slotted-shadow-'),
  );
  assertContractTokens(shadowNames);
  assertExactTable(
    'Shadow',
    ['Token', 'Light', 'Dark'],
    shadowNames.map((name) => [
      `\`${name}\``,
      `\`${theme.schemes.light[name]}\``,
      `\`${theme.schemes.dark[name]}\``,
    ]),
  );

  const geometryNames = Object.keys(theme.densities.comfortable).filter((name) =>
    name.startsWith('--slotted-control-'),
  );
  const aliasPrefixes = ['height', 'padding-inline', 'font-size', 'icon-size'];
  const aliases = Object.keys(theme.densities.comfortable).filter((name) =>
    aliasPrefixes.some((prefix) => name.startsWith(`--slotted-button-${prefix}-`)),
  );
  assertContractTokens([...geometryNames, ...aliases]);
  assertExactTable(
    'Control geometry',
    ['Token', 'Comfortable', 'Compact', 'Legacy Button alias'],
    geometryNames.map((name) => {
      const [, geometryName, size] = name.match(/^--slotted-control-(.+)-(sm|md|lg)$/) ?? [];
      const alias = aliases.find(
        (candidate) => candidate === `--slotted-button-${geometryName}-${size}`,
      );
      return [
        `\`${name}\``,
        `\`${theme.densities.comfortable[name]}\``,
        `\`${theme.densities.compact[name]}\``,
        alias ? `\`${alias}: ${theme.densities.comfortable[alias]}\`` : '—',
      ];
    }),
  );
});

test('scopes the law and reduced motion to a family migration', () => {
  assert.match(foundation, /binding for newly created or refined families/i);
  assert.match(
    foundation,
    /existing\s+unrefined families[\s\S]*literals[\s\S]*ad-hoc motion[\s\S]*family-by-family/i,
  );
  assert.match(foundation, /only the four motion-scale\s+duration tokens\s+collapse/i);
  assert.match(foundation, /motion-scale duration token[\s\S]*honors `prefers-reduced-motion`/i);
  assert.match(
    foundation,
    /infinite animations must stop or disable[\s\S]*shortening is insufficient/i,
  );

  assert.match(buildLog, /only the four motion-scale\s+duration tokens\s+collapse/i);
  assert.match(buildLog, /existing\s+family-specific durations are not automatically covered/i);
});
