import { execFileSync } from 'node:child_process';

import { loadContent, NOT_TOPICS } from './content.ts';
import { parseTopic, type Level, type Topic } from './guidelines.ts';

/**
 * Every rule id the topics hold, with its status, its level while active, and
 * the id that rewrote it. Read from the topics themselves: the heading is the
 * id, `Level` the level, `Status: retired · rewritten as XX-NN` the rewrite.
 * Against the last release, an id is never removed or reused, and an active
 * rule keeps its level.
 */
export interface RegistryEntry {
  status: 'active' | 'retired';
  level?: Level;
  replacedBy?: string;
}
export type Registry = Record<string, RegistryEntry>;

const GUIDELINES = 'tools/agent-docs/content/guidelines';
const REWRITTEN = /\brewritten as ([A-Z]{2}-\d{2})\b/;

export function registryOf(topics: readonly Topic[]): Registry {
  const registry: Registry = {};
  for (const topic of topics)
    for (const rule of topic.rules) {
      if (rule.status === 'active') {
        registry[rule.id] = { status: 'active', level: rule.level! };
        continue;
      }
      const replacedBy = REWRITTEN.exec(rule.statusText ?? '')?.[1];
      registry[rule.id] =
        replacedBy === undefined ? { status: 'retired' } : { status: 'retired', replacedBy };
    }
  return registry;
}

export function registryErrors(current: Registry, previous: Registry | undefined): string[] {
  const errors: string[] = [];
  for (const [id, before] of Object.entries(previous ?? {})) {
    const now = current[id];
    if (now === undefined) errors.push(`${id}: released before, gone from the topics`);
    else if (before.status === 'retired' && now.status === 'active')
      errors.push(`${id}: retired before, active again`);
    else if (before.status === 'active' && now.status === 'active' && before.level !== now.level)
      errors.push(
        `${id}: level changed from ${before.level} to ${now.level}; retire it and issue a new id`,
      );
  }
  return errors.sort();
}

function git(root: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/** The registry of the topics `ref` holds; none when `ref` has no guidelines. */
export function registryAt(root: string, ref: string): Registry | undefined {
  try {
    const files = git(root, ['ls-tree', '--name-only', ref, `${GUIDELINES}/`])
      .split('\n')
      .map((path) => path.slice(GUIDELINES.length + 1))
      .filter((file) => file.endsWith('.md') && !NOT_TOPICS.has(file));
    if (files.length === 0) return undefined;
    return registryOf(
      files.map((file) => parseTopic(file, git(root, ['show', `${ref}:${GUIDELINES}/${file}`]))),
    );
  } catch {
    return undefined;
  }
}

/** The registry of the last `v*` tag; none before the first release that carries guidelines. */
export function previousRegistry(root: string): Registry | undefined {
  try {
    return registryAt(
      root,
      git(root, ['describe', '--tags', '--abbrev=0', '--match', 'v*']).trim(),
    );
  } catch {
    return undefined;
  }
}

export function currentRegistry(root: string): Registry {
  return registryOf(loadContent(root).topics);
}
