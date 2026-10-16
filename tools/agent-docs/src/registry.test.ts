import { describe, expect, it } from 'vitest';

import type { Topic } from './guidelines.ts';
import { previousRegistry, registryErrors, type Registry } from './registry.ts';

function topic(rules: Topic['rules']): Topic {
  return {
    file: 'x.md',
    topic: 'x',
    prefix: 'AF',
    triggers: [],
    families: [],
    frontmatter: '',
    title: 'X',
    intro: '',
    rules,
  };
}
const active = (id: string, level: 'MUST' | 'SHOULD' = 'MUST') =>
  ({
    id,
    title: id,
    status: 'active',
    level,
    fields: [['Level', level]],
  }) as Topic['rules'][number];
const retired = (id: string) =>
  ({ id, title: id, status: 'retired', statusText: 'x', fields: [] }) as Topic['rules'][number];

describe('registryErrors', () => {
  it('accepts a registry that matches the topics, with no previous registry', () => {
    const current: Registry = { 'AF-01': { level: 'MUST', status: 'active' } };
    expect(registryErrors([topic([active('AF-01')])], current, undefined)).toEqual([]);
  });

  it('reports a rule missing from the registry and an entry with no rule', () => {
    const current: Registry = { 'AF-02': { level: 'MUST', status: 'active' } };
    expect(registryErrors([topic([active('AF-01')])], current, undefined)).toEqual([
      'AF-01: in a topic, not in ids.json',
      'AF-02: in ids.json, in no topic',
    ]);
  });

  it('reports a status or level that differs from the topic', () => {
    const current: Registry = { 'AF-01': { level: 'SHOULD', status: 'retired' } };
    expect(registryErrors([topic([active('AF-01')])], current, undefined)).toEqual([
      'AF-01: ids.json says retired, the topic says active',
    ]);
  });

  it('against the previous release: an id removed, a level changed, a retired id reused', () => {
    const previous: Registry = {
      'AF-01': { level: 'MUST', status: 'active' },
      'AF-02': { level: 'SHOULD', status: 'active' },
      'AF-03': { level: 'MUST', status: 'retired' },
    };
    const current: Registry = {
      'AF-01': { level: 'SHOULD', status: 'active' },
      'AF-03': { level: 'MUST', status: 'active' },
    };
    const topics = [topic([active('AF-01', 'SHOULD'), active('AF-03')])];
    expect(registryErrors(topics, current, previous)).toEqual([
      'AF-01: level changed from MUST to SHOULD; retire it and issue a new id',
      'AF-02: released before, gone from ids.json',
      'AF-03: retired before, active again',
    ]);
  });

  it('with no tag or no ids.json at the tag, there is no previous registry', () => {
    expect(previousRegistry('/nonexistent')).toBeUndefined();
  });

  it('a retired rule keeps its entry', () => {
    const current: Registry = {
      'AF-01': { level: 'MUST', status: 'retired', replacedBy: 'AF-02' },
      'AF-02': { level: 'MUST', status: 'active' },
    };
    expect(
      registryErrors([topic([retired('AF-01'), active('AF-02')])], current, undefined),
    ).toEqual([]);
  });
});
