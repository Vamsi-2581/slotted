import { describe, expect, it } from 'vitest';

import { parseSkill, renderContent, skillErrors } from './skills.ts';

const source = `---
name: waiting-states
description: Use when a screen waits for data.
---

# Waiting states

Read \`{{docsDir}}/skeleton.md\` from \`{{package}}\`. AF-01 applies.
`;

describe('skills', () => {
  it('parses the frontmatter', () => {
    expect(parseSkill(source)).toMatchObject({
      name: 'waiting-states',
      description: 'Use when a screen waits for data.',
    });
  });

  it('accepts a skill whose name matches its directory and whose ids are active', () => {
    expect(skillErrors('waiting-states', parseSkill(source), new Set(['AF-01']))).toEqual([]);
  });

  it('reports a name unlike the directory, a description not starting "Use when", an inactive id', () => {
    const broken = source.replace('Use when a screen', 'Shows a screen');
    expect(skillErrors('other', parseSkill(broken), new Set())).toEqual([
      'other: name is waiting-states',
      'other: description does not start with "Use when"',
      'other: cites AF-01, which is not an active rule',
    ]);
  });

  it('substitutes the docs directory and the package per binding', () => {
    expect(renderContent(source, 'angular')).toContain(
      'Read `node_modules/@slotted/angular/docs/skeleton.md` from `@slotted/angular`.',
    );
    expect(renderContent(source, 'react')).toContain(
      '`node_modules/@slotted/react/dist/docs/skeleton.md`',
    );
  });
});
