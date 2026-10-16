import type { Binding } from '../types.ts';

export type Assertion =
  | { kind: 'uses-family'; family: string }
  | { kind: 'no-literal' }
  | { kind: 'mentions'; pattern: string }
  | { kind: 'absent'; pattern: string };

/** Lengths the library itself writes as literals (`specs/demo-screen-tokens.test.mjs`). */
const ALLOWED_PX = new Set(['0px', '1px', '0.5px']);

function pascal(family: string): string {
  return family.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase());
}

export function assertionPasses(
  assertion: Assertion,
  binding: Binding,
  files: ReadonlyMap<string, string>,
): boolean {
  const all = [...files.values()].join('\n');
  switch (assertion.kind) {
    case 'uses-family':
      return binding === 'react'
        ? new RegExp(`<${pascal(assertion.family)}[\\s>/.]`).test(all)
        : all.includes(`@slotted/angular/${assertion.family}`);
    case 'no-literal': {
      if (/#[0-9a-fA-F]{3,8}\b/.test(all) || /\b(rgba?|hsla?)\(/.test(all)) return false;
      return [...all.matchAll(/(\d+(?:\.\d+)?px)/g)].every(([, value]) => ALLOWED_PX.has(value!));
    }
    case 'mentions':
      return new RegExp(assertion.pattern).test(all);
    case 'absent':
      return !new RegExp(assertion.pattern).test(all);
  }
}
