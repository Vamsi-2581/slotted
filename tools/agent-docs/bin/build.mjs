#!/usr/bin/env node
/**
 * Writes the agent documentation of one binding:
 *   node tools/agent-docs/bin/build.mjs --binding react --out packages/react/dist/docs
 * `--report-language` prints the snippets with characters outside English
 * punctuation instead, and always exits 0.
 */
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { buildDocs } from '../src/build.ts';
import { nonEnglishSnippets } from '../src/language-report.ts';
import { loadFamilies } from '../src/load.ts';

const { values } = parseArgs({
  options: {
    binding: { type: 'string' },
    out: { type: 'string' },
    'report-language': { type: 'boolean', default: false },
  },
});

const root = resolve(import.meta.dirname, '../../..');
const bindings = values.binding === undefined ? ['react', 'angular'] : [values.binding];
for (const binding of bindings) {
  if (binding !== 'react' && binding !== 'angular') throw new Error(`unknown binding ${binding}`);
}

if (values['report-language']) {
  for (const binding of bindings) {
    const findings = nonEnglishSnippets(await loadFamilies(binding, root));
    for (const finding of findings) {
      console.log(`${finding.binding}\t${finding.family}\t${finding.key}\t${finding.characters}`);
    }
    console.log(`${binding}: ${findings.length} snippet(s)`);
  }
} else {
  if (values.binding === undefined || values.out === undefined) {
    throw new Error('--binding and --out are required');
  }
  const result = await buildDocs({ binding: values.binding, root, out: resolve(values.out) });
  console.log(
    `agent docs (${values.binding}): ${result.families} families, ${result.examples} examples, ${result.excerpts} excerpts`,
  );
}
