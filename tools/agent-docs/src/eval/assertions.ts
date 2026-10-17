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

/** The component names a family's entry point exports (`packages/react/src/<family>/index.ts`). */
export function familyComponents(source: string): string[] {
  return [...source.matchAll(/^export \{([^}]*)\}/gm)].flatMap(([, names]) =>
    names!
      .split(',')
      .map((name) => name.trim())
      .filter((name) => /^[A-Z]/.test(name)),
  );
}

/**
 * `components` maps a React family to the components it exports; a family it
 * does not list is read by its own name.
 */
export function assertionPasses(
  assertion: Assertion,
  binding: Binding,
  files: ReadonlyMap<string, string>,
  components: ReadonlyMap<string, readonly string[]> = new Map(),
): boolean {
  const all = [...files.values()].join('\n');
  switch (assertion.kind) {
    case 'uses-family': {
      if (binding === 'angular') return all.includes(`@slotted/angular/${assertion.family}`);
      if (new RegExp(`@slotted/react/${assertion.family}['"]`).test(all)) return true;
      const names = components.get(assertion.family) ?? [pascal(assertion.family)];
      return names.some((name) => new RegExp(`<${name}[\\s>/.]`).test(all));
    }
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
