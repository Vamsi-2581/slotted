import { execFileSync } from 'node:child_process';

import type { Level, Topic } from './guidelines.ts';

/**
 * Every rule id ever issued, with its level and status. An id is never removed
 * or reused, and an active rule keeps its level: a change of meaning or level
 * retires the rule and issues a new id.
 */
export interface RegistryEntry {
  level: Level;
  status: 'active' | 'retired';
  replacedBy?: string;
}
export type Registry = Record<string, RegistryEntry>;

export const REGISTRY_PATH = 'tools/agent-docs/content/guidelines/ids.json';

export function registryErrors(
  topics: readonly Topic[],
  current: Registry,
  previous: Registry | undefined,
): string[] {
  const errors: string[] = [];
  const rules = new Map(
    topics.flatMap((topic) => topic.rules.map((rule) => [rule.id, rule] as const)),
  );
  for (const [id, rule] of rules) {
    const entry = current[id];
    if (entry === undefined) {
      errors.push(`${id}: in a topic, not in ids.json`);
      continue;
    }
    if (entry.status !== rule.status)
      errors.push(`${id}: ids.json says ${entry.status}, the topic says ${rule.status}`);
    else if (rule.status === 'active' && entry.level !== rule.level)
      errors.push(`${id}: ids.json says ${entry.level}, the topic says ${rule.level}`);
  }
  for (const id of Object.keys(current))
    if (!rules.has(id)) errors.push(`${id}: in ids.json, in no topic`);
  if (previous !== undefined) {
    for (const [id, before] of Object.entries(previous)) {
      const now = current[id];
      if (now === undefined) errors.push(`${id}: released before, gone from ids.json`);
      else if (before.status === 'retired' && now.status === 'active')
        errors.push(`${id}: retired before, active again`);
      else if (before.status === 'active' && now.status === 'active' && before.level !== now.level)
        errors.push(
          `${id}: level changed from ${before.level} to ${now.level}; retire it and issue a new id`,
        );
    }
  }
  return errors.sort();
}

/** `ids.json` as the last `v*` tag has it; none before the first release that carries it. */
export function previousRegistry(root: string): Registry | undefined {
  try {
    const tag = execFileSync('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return JSON.parse(
      execFileSync('git', ['show', `${tag}:${REGISTRY_PATH}`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    ) as Registry;
  } catch {
    return undefined;
  }
}
