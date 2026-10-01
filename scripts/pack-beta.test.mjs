import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { isPublishable, readPackageDirectories, tarballName } from './pack-beta.mjs';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

function manifests() {
  return readPackageDirectories(join(repositoryRoot, 'packages')).map((directory) =>
    JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')),
  );
}

test('a package is published when it declares a published surface', () => {
  assert.equal(isPublishable({ files: ['dist'] }), true);
  assert.equal(isPublishable({ publishConfig: { directory: 'dist' } }), true);
  assert.equal(isPublishable({ publishConfig: { access: 'public' } }), false);
  assert.equal(isPublishable({}), false);
});

test('the tarball is named the way pnpm pack names it', () => {
  assert.equal(
    tarballName({ name: '@slotted/themes', version: '0.1.0-beta.3' }),
    'slotted-themes-0.1.0-beta.3.tgz',
  );
});

test('every consumer-facing package is published and the workbench is not', () => {
  const published = manifests()
    .filter(isPublishable)
    .map((manifest) => manifest.name)
    .sort();

  assert.deepEqual(published, [
    '@slotted/angular',
    '@slotted/core',
    '@slotted/react',
    '@slotted/styles',
    '@slotted/theme',
    '@slotted/themes',
  ]);
});

test('every published package carries the same beta version', () => {
  const versions = new Set(
    manifests()
      .filter(isPublishable)
      .map((m) => m.version),
  );
  assert.equal(versions.size, 1, `versions diverged: ${[...versions].join(', ')}`);
  assert.match([...versions][0], /^\d+\.\d+\.\d+-beta\.\d+$/);
});

/**
 * `pnpm pack` rewrites `workspace:*` only from inside a workspace project.
 * The Angular package publishes its `dist`, which is not one, so the rewrite
 * happens only when the pack is run from the source package with
 * `publishConfig.directory` naming the output.
 */
test('the Angular package publishes its ng-packagr output', () => {
  const angular = manifests().find((manifest) => manifest.name === '@slotted/angular');
  assert.equal(angular.publishConfig?.directory, 'dist');
});
