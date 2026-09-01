import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const ROOT = new URL('..', import.meta.url).pathname;

/**
 * A snippet language that belongs to neither binding. A family selected in
 * public by `data-ui` answers real questions with a stylesheet rule — the
 * default every instance takes, a weight the artwork's own grid decides — and
 * that rule is equally correct on both pages. The rule below is about a page
 * showing the *wrong framework's* code, which a stylesheet cannot be.
 */
const NEUTRAL_LANGUAGES = new Set(['css']);

/**
 * Each framework's reference pages are written by copying the other's and
 * editing them, which is how the two Storybooks stay scenario for scenario.
 * The one thing that copy cannot be trusted to change is the snippet language:
 * a `tsx` snippet in an Angular page still formats, still renders, and shows
 * the reader React code under an Angular badge.
 */
const FRAMEWORKS = [
  { language: 'tsx', name: 'React', roots: [join(ROOT, 'packages/react/src')] },
  {
    language: 'angular',
    name: 'Angular',
    roots: readdirSync(join(ROOT, 'packages/angular'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !['dist', 'node_modules'].includes(entry.name))
      .map((entry) => join(ROOT, 'packages/angular', entry.name, 'src')),
  },
];

function docsFiles(roots) {
  return roots.flatMap((root) => {
    let entries;
    try {
      entries = readdirSync(root, { withFileTypes: true });
    } catch {
      return [];
    }
    return entries.flatMap((entry) => {
      const path = join(root, entry.name);
      if (entry.isDirectory()) return docsFiles([path]);
      return entry.name.endsWith('.docs.ts') ? [path] : [];
    });
  });
}

/**
 * Read each `defineSnippet` call as one unit rather than scanning the file for
 * loose `id:` and `language:` lines: the two are paired, the pages do not agree
 * on key order, and an unpaired scan cannot tell which language a given id was
 * written in. Only the keys before `source` are read, so a snippet whose body
 * contains the word `language` is not mistaken for a second declaration.
 */
function declaredSnippets(source) {
  return source
    .split('defineSnippet(')
    .slice(1)
    .map((chunk) => {
      const head = chunk.split(/\bsource:/)[0];
      return {
        id: /id:\s*'([a-z0-9-]+)'/.exec(head)?.[1],
        language: /language:\s*'([a-z]+)'/.exec(head)?.[1],
      };
    });
}

test('reads the id and the language of every declared snippet', () => {
  const unreadable = [];

  for (const { roots } of FRAMEWORKS) {
    for (const path of docsFiles(roots)) {
      for (const snippet of declaredSnippets(readFileSync(path, 'utf8'))) {
        if (snippet.id === undefined || snippet.language === undefined) {
          unreadable.push(`${path.slice(ROOT.length)}: ${JSON.stringify(snippet)}`);
        }
      }
    }
  }

  assert.deepEqual(
    unreadable,
    [],
    `A snippet whose id or language cannot be read is a snippet the rules below skip:\n  ${unreadable.join('\n  ')}`,
  );
});

test('finds the reference pages of both frameworks', () => {
  for (const { name, roots } of FRAMEWORKS) {
    assert.ok(docsFiles(roots).length >= 5, `Found too few ${name} reference pages`);
  }
});

test('writes every snippet in the language of the page it is on', () => {
  const violations = [];

  for (const { language, roots } of FRAMEWORKS) {
    for (const path of docsFiles(roots)) {
      for (const { language: found } of declaredSnippets(readFileSync(path, 'utf8'))) {
        if (found !== language && !NEUTRAL_LANGUAGES.has(found)) {
          violations.push(`${path.slice(ROOT.length)}: a ${found} snippet on a ${language} page`);
        }
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `A reference page must show code in its own framework:\n  ${violations.join('\n  ')}`,
  );
});

test('gives every snippet an id naming the framework it belongs to', () => {
  const violations = [];

  for (const { language, roots } of FRAMEWORKS) {
    const marker = language === 'tsx' ? 'react' : 'angular';
    for (const path of docsFiles(roots)) {
      for (const { id, language: found } of declaredSnippets(readFileSync(path, 'utf8'))) {
        /**
         * A stylesheet snippet is the same rule on both pages, so its id names
         * neither framework — naming one would claim it belongs there, and the
         * other page's copy would then be the wrong name rather than a
         * collision.
         */
        if (NEUTRAL_LANGUAGES.has(found)) {
          if (id.includes('react') || id.includes('angular')) {
            violations.push(`${path.slice(ROOT.length)}: ${found} snippet ${id} names a framework`);
          }
        } else if (!id.includes(marker)) {
          violations.push(`${path.slice(ROOT.length)}: snippet ${id} does not name ${marker}`);
        }
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `A snippet id carries its framework, so a copied page cannot collide:\n  ${violations.join('\n  ')}`,
  );
});
