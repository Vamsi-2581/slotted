#!/usr/bin/env node
/**
 * Runs the agent-material evaluation: each case, per binding, with and without
 * the snippet, `runs` times, through `claude -p`, in a fresh copy of a fixture
 * that installs the beta tarballs of `demos/.registry`; a case with a `seed`
 * starts from `eval/seeds/<seed>/<binding>/`, copied over `src/`.
 *   pnpm eval:agent-docs --dry-run
 *   pnpm eval:agent-docs --case orders-list --binding react --runs 1 --condition with
 *   pnpm eval:agent-docs --case orders-list --binding react --runs 1 --condition with --keep
 *     (keeps each session's directory and prints its path)
 * Prerequisite: `node scripts/pack-beta.mjs --only @slotted/react,@slotted/angular,@slotted/core,@slotted/theme,@slotted/themes`.
 */
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { assertionPasses, familyComponents } from '../src/eval/assertions.ts';
import { parseStream, triggered } from '../src/eval/stream.ts';
import { renderReport, summarize } from '../src/eval/summary.ts';
import { renderAgentsSnippet } from '../src/render.ts';

const root = resolve(import.meta.dirname, '../../..');
const evalDir = resolve(import.meta.dirname, '../eval');
const { values } = parseArgs({
  options: {
    case: { type: 'string' },
    binding: { type: 'string' },
    condition: { type: 'string' },
    runs: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    keep: { type: 'boolean', default: false },
  },
});

const config = JSON.parse(readFileSync(join(evalDir, 'cases.json'), 'utf8'));
const runs = Number(values.runs ?? config.runs);
const bindings = values.binding ? [values.binding] : config.bindings;
const conditions = values.condition ? [values.condition] : ['with', 'without'];
const cases = config.cases.filter((entry) => !values.case || entry.id === values.case);
const sessions = bindings.length * cases.length * runs * conditions.length;
console.log(`${sessions} session(s), model ${config.model}`);
if (values['dry-run']) process.exit(0);

const registry = JSON.parse(readFileSync(join(root, 'demos/.registry/index.json'), 'utf8'));
const PACKAGES = {
  react: ['@slotted/react', '@slotted/core', '@slotted/theme', '@slotted/themes'],
  angular: ['@slotted/angular', '@slotted/core', '@slotted/theme', '@slotted/themes'],
};

/** One installed copy per binding; each session copies it. */
function template(binding) {
  const dir = join(tmpdir(), `slotted-eval-${binding}`);
  rmSync(dir, { recursive: true, force: true });
  cpSync(join(evalDir, 'fixtures', binding), dir, { recursive: true });
  const tarballs = PACKAGES[binding].map((name) =>
    join(root, 'demos/.registry', registry[name].tarball),
  );
  const install = spawnSync('npm', ['install', '--no-audit', '--no-fund', ...tarballs], {
    cwd: dir,
    stdio: 'inherit',
  });
  if (install.status !== 0) throw new Error(`npm install failed for ${binding}`);
  return dir;
}

function sourceFiles(dir) {
  const files = new Map();
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      if (entry === 'node_modules') continue;
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx?|html|css|scss)$/.test(entry))
        files.set(relative(dir, path), readFileSync(path, 'utf8'));
    }
  };
  walk(join(dir, 'src'));
  return files;
}

const components = new Map(
  readdirSync(join(root, 'packages/react/src'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [entry.name, join(root, 'packages/react/src', entry.name, 'index.ts')])
    .filter(([, index]) => existsSync(index))
    .map(([family, index]) => [family, familyComponents(readFileSync(index, 'utf8'))]),
);
const env = { ...process.env };
delete env.CLAUDECODE;
// Every install runs before the first session, so a failed one costs no session.
const bases = Object.fromEntries(bindings.map((binding) => [binding, template(binding)]));
const results = [];
for (const binding of bindings) {
  const base = bases[binding];
  for (const entry of cases)
    for (const condition of conditions)
      for (let run = 0; run < runs; run += 1) {
        const dir = mkdtempSync(join(tmpdir(), `slotted-eval-${entry.id}-`));
        cpSync(base, dir, { recursive: true });
        if (entry.seed)
          cpSync(join(evalDir, 'seeds', entry.seed, binding), join(dir, 'src'), {
            recursive: true,
          });
        writeFileSync(
          join(dir, 'CLAUDE.md'),
          condition === 'with' ? renderAgentsSnippet(binding) : '',
        );
        const session = spawnSync(
          'claude',
          [
            '-p',
            entry.prompt,
            '--output-format',
            'stream-json',
            '--verbose',
            '--model',
            config.model,
            '--setting-sources',
            'project,local',
            '--permission-mode',
            'acceptEdits',
            '--allowedTools',
            'Read,Write,Edit,Glob,Grep,Bash(ls:*),Bash(cat:*)',
          ],
          { cwd: dir, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
        );
        const trace = parseStream(session.stdout.split('\n'));
        // A session the CLI refused (a usage limit, a login) costs nothing and must not count.
        if (session.status !== 0 || trace.costUsd === 0)
          throw new Error(
            `${binding} ${entry.id} ${condition} #${run + 1} did not run (status ${session.status}): ${(session.stdout + session.stderr).trim().slice(-400)}`,
          );
        const files = sourceFiles(dir);
        const failed = entry.assertions.filter(
          (assertion) => !assertionPasses(assertion, binding, files, components),
        );
        const passed = entry.assertions.length - failed.length;
        results.push({
          caseId: entry.id,
          binding,
          skill: entry.skill,
          condition,
          triggered: triggered(trace, entry.skill),
          passed,
          total: entry.assertions.length,
          trace,
        });
        console.log(
          `${binding} ${entry.id} ${condition} #${run + 1}: triggered=${triggered(trace, entry.skill)} ${passed}/${entry.assertions.length} $${trace.costUsd.toFixed(2)}${failed.length > 0 ? ` failed: ${failed.map((assertion) => JSON.stringify(assertion)).join(' ')}` : ''}`,
        );
        if (values.keep) console.log(`kept: ${dir}`);
        else rmSync(dir, { recursive: true, force: true });
      }
}

const date = new Date().toISOString().slice(0, 10);
const out = join(root, 'docs/history/evals');
mkdirSync(out, { recursive: true });
const file = join(out, `${date}-agent-docs.md`);
writeFileSync(file, renderReport(date, config.model, summarize(results)));
console.log(`report: ${relative(root, file)}`);
