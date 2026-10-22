import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/**
 * Runs Prettier or ESLint on the files this branch changed, and on nothing
 * else: the files changed since the merge base with `origin/main` (the
 * commits not pushed yet), the uncommitted ones and the untracked ones. The
 * whole repository took 126 s to format-check and 116 s to lint; the changed
 * files take seconds. `pnpm check:full` still checks every file.
 *
 *   node scripts/check-changed.mjs format | lint
 */
const tool = process.argv[2];
if (tool !== 'format' && tool !== 'lint') {
  console.error('usage: node scripts/check-changed.mjs format|lint');
  process.exit(2);
}

const git = (...args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  return result.status === 0 ? result.stdout : null;
};

const base = git('merge-base', 'HEAD', 'origin/main')?.trim() || 'HEAD';
const listed = [
  git('diff', '--name-only', '--diff-filter=ACMR', base) ?? '',
  git('diff', '--name-only', '--diff-filter=ACMR') ?? '',
  git('ls-files', '--others', '--exclude-standard') ?? '',
]
  .join('\n')
  .split('\n')
  .filter((file) => file !== '' && existsSync(file));
const files = [...new Set(listed)].filter(
  (file) => tool === 'format' || /\.(?:[cm]?js|tsx?)$/.test(file),
);

if (files.length === 0) {
  console.log(`${tool}: no changed files`);
  process.exit(0);
}

const command =
  tool === 'format'
    ? [
        'prettier',
        '--check',
        '--cache',
        '--cache-strategy',
        'content',
        '--ignore-unknown',
        ...files,
      ]
    : [
        'eslint',
        '--max-warnings=0',
        '--no-warn-ignored',
        '--cache',
        '--cache-strategy',
        'content',
        '--cache-location',
        'node_modules/.cache/eslint/',
        ...files,
      ];
const result = spawnSync('pnpm', ['exec', ...command], { stdio: 'inherit' });
process.exit(result.status ?? 1);
