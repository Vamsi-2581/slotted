import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { syncConsumer } from './sync-consumer.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'sync-consumer-'));
  const registry = join(root, 'registry');
  const store = join(root, 'store');
  const consumer = join(root, 'app');
  mkdirSync(registry);
  mkdirSync(store);

  const source = join(root, 'package');
  mkdirSync(join(source, 'package', 'dist'), { recursive: true });
  writeFileSync(join(source, 'package', 'dist', 'index.js'), 'local');
  execFileSync('tar', ['-czf', join(registry, 'slotted-core-1.0.0.tgz'), '-C', source, 'package']);
  writeFileSync(
    join(registry, 'index.json'),
    JSON.stringify({ '@slotted/core': { version: '1.0.0', tarball: 'slotted-core-1.0.0.tgz' } }),
  );

  const installed = join(
    consumer,
    'node_modules',
    '.pnpm',
    'core',
    'node_modules',
    '@slotted',
    'core',
  );
  mkdirSync(join(installed, 'dist'), { recursive: true });
  writeFileSync(join(store, 'index.js'), 'published');
  linkSync(join(store, 'index.js'), join(installed, 'dist', 'index.js'));
  writeFileSync(join(installed, 'stale.js'), 'removed in the new version');
  mkdirSync(join(consumer, 'node_modules', '@slotted'), { recursive: true });
  symlinkSync(installed, join(consumer, 'node_modules', '@slotted', 'core'));
  mkdirSync(join(consumer, 'node_modules', '.vite'));

  return { root, registry, store, consumer };
}

test('the package files are replaced and the pnpm store file is left as it was', () => {
  const { root, registry, store, consumer } = fixture();
  try {
    const synced = syncConsumer({ registry, consumer, names: ['@slotted/core'] });

    const installed = join(consumer, 'node_modules', '@slotted', 'core');
    assert.deepEqual(synced, ['@slotted/core@1.0.0']);
    assert.equal(readFileSync(join(installed, 'dist', 'index.js'), 'utf8'), 'local');
    assert.equal(readFileSync(join(store, 'index.js'), 'utf8'), 'published');
    assert.throws(() => readFileSync(join(installed, 'stale.js')), { code: 'ENOENT' });
    assert.throws(() => readFileSync(join(consumer, 'node_modules', '.vite')), { code: 'ENOENT' });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a package the application does not install is skipped', () => {
  const { root, registry, consumer } = fixture();
  try {
    rmSync(join(consumer, 'node_modules', '@slotted'), { recursive: true });

    assert.deepEqual(syncConsumer({ registry, consumer, names: ['@slotted/core'] }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a package that was not packed is an error', () => {
  const { root, registry, consumer } = fixture();
  try {
    assert.throws(() => syncConsumer({ registry, consumer, names: ['@slotted/react'] }), /not in/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
