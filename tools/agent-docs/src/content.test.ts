import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contentDir, loadContent } from './content.ts';
import { PUBLISHED_FORBIDDEN, renderTopic, topicErrors } from './guidelines.ts';
import { loadCatalog, unresolvedNames } from './references.ts';
import { previousRegistry, registryErrors, type Registry } from './registry.ts';
import { renderAgentsSnippet } from './render.ts';
import { skillErrors } from './skills.ts';

/**
 * The published guidelines and skills, read from `tools/agent-docs/content`:
 * every rule well formed, every name resolved, every id registered, nothing
 * that names the repository's demo.
 */
const root = resolve(import.meta.dirname, '../../..');
const content = loadContent(root);
const catalog = loadCatalog(root);
const active = new Set(
  content.topics.flatMap((topic) =>
    topic.rules.filter((rule) => rule.status === 'active').map((rule) => rule.id),
  ),
);
const published = [
  ...content.topics.map((topic) => [topic.file, renderTopic(topic)] as const),
  ['README.md', content.readme] as const,
  ...[...content.skills].map(([name, skill]) => [`skills/${name}`, skill.source] as const),
];
/** What the source may name besides the library: placeholders, docs paths that exist, topic files. */
const families = [...catalog.names].filter(([, kind]) => kind === 'family').map(([name]) => name);
const guidelineFiles = ['index.md', 'README.md', ...content.topics.map((topic) => topic.file)];
const local = new Set([
  '{{docsDir}}',
  '{{package}}',
  '{{docsDir}}/<family>.md',
  ...families.map((family) => `{{docsDir}}/${family}.md`),
  ...guidelineFiles,
  ...guidelineFiles.map((file) => `{{docsDir}}/guidelines/${file}`),
  ...[...content.skills.keys()].map((name) => `{{docsDir}}/skills/${name}/SKILL.md`),
]);

describe('guidelines', () => {
  it('every topic is well formed', () => {
    expect(
      content.topics.flatMap((topic) => topicErrors(topic, content.topicSources.get(topic.file)!)),
    ).toEqual([]);
  });

  it('every prefix belongs to one topic, and to no demo', () => {
    const prefixes = content.topics.map((topic) => topic.prefix);
    expect(prefixes.filter((prefix, index) => prefixes.indexOf(prefix) !== index)).toEqual([]);
    const demos = join(root, 'demos');
    const demoPrefixes = readdirSync(demos)
      .map((demo) => join(demos, demo, 'guidelines'))
      .filter(existsSync)
      .flatMap((dir) =>
        readdirSync(dir).map(
          (file) => /^prefix:\s*([A-Z]{2})$/m.exec(readFileSync(join(dir, file), 'utf8'))?.[1],
        ),
      )
      .filter((prefix): prefix is string => prefix !== undefined);
    expect(demoPrefixes.filter((prefix) => prefixes.includes(prefix))).toEqual([]);
  });

  it('ids.json matches the topics and the last release', () => {
    const registry = JSON.parse(
      readFileSync(join(contentDir(root), 'guidelines/ids.json'), 'utf8'),
    ) as Registry;
    expect(registryErrors(content.topics, registry, previousRegistry(root))).toEqual([]);
  });
});

describe('published text', () => {
  it.each(published)('%s names only what the library publishes', (_file, text) => {
    expect(unresolvedNames(text, catalog, active, local)).toEqual([]);
  });

  it.each(published)('%s names neither the demo nor its tests', (_file, text) => {
    expect(PUBLISHED_FORBIDDEN.filter((pattern) => pattern.test(text)).map(String)).toEqual([]);
  });
});

describe('skills', () => {
  it('every skill is well formed and cites active rules', () => {
    expect(
      [...content.skills].flatMap(([name, skill]) => skillErrors(name, skill, active)),
    ).toEqual([]);
  });

  it('the snippet of each binding names every skill', () => {
    for (const binding of ['react', 'angular'] as const) {
      const snippet = renderAgentsSnippet(binding);
      for (const name of content.skills.keys())
        expect(snippet, `${binding} ${name}`).toContain(`/skills/${name}/SKILL.md`);
    }
  });
});
