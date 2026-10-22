import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REGISTRY_DIRECTORY } from './pack-beta.mjs';

/**
 * Puts the packed packages of `demos/.registry/` into the `node_modules` of an
 * application outside this repository, without touching its manifest or its
 * lockfile. The application keeps resolving React and every other dependency
 * from its own tree; only the files of `@slotted/*` change, and they are the
 * files a registry install would write.
 *
 * The package directory is deleted before the tarball is extracted. pnpm
 * hard-links those files to its global store, and an extraction over them
 * would rewrite the store.
 *
 * The application returns to the published packages with
 * `pnpm install --frozen-lockfile --force`.
 */
export function syncPackage({ tarball, destination }) {
  const directory = realpathSync(destination);
  rmSync(directory, { recursive: true, force: true });
  mkdirSync(directory, { recursive: true });
  execFileSync('tar', ['-xzf', tarball, '--strip-components=1', '-C', directory]);
}

/**
 * Vite pre-bundles the packages into `node_modules/.vite`; a running dev
 * server keeps serving the copy it bundled, so it is restarted after a sync.
 */
export function syncConsumer({ registry, consumer, names }) {
  const index = JSON.parse(readFileSync(join(registry, 'index.json'), 'utf8'));
  const synced = [];
  for (const name of names) {
    const { version, tarball } = index[name] ?? {};
    if (!tarball) throw new Error(`${name} is not in ${join(registry, 'index.json')}`);
    const destination = join(consumer, 'node_modules', name);
    if (!existsSync(destination)) continue;
    syncPackage({ tarball: join(registry, tarball), destination });
    synced.push(`${name}@${version}`);
  }
  rmSync(join(consumer, 'node_modules', '.vite'), { recursive: true, force: true });
  return synced;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [consumer, packages = ''] = process.argv.slice(2);
  const names = packages.split(',').filter(Boolean);
  if (!consumer || names.length === 0) {
    throw new Error(
      'usage: node scripts/sync-consumer.mjs <application directory> <@slotted/a,@slotted/b>',
    );
  }
  const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
  const synced = syncConsumer({
    registry: join(repositoryRoot, REGISTRY_DIRECTORY),
    consumer,
    names,
  });
  console.log(
    `${consumer}: ${synced.length === 0 ? 'no @slotted package installed' : synced.join(', ')}`,
  );
}
