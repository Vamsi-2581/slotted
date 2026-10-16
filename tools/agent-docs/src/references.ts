import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every name a published rule or skill may write between backticks, read from
 * the sources that define it: the family contracts, the theme contract, the
 * token files and the custom properties the stylesheets declare.
 */
export interface Catalog {
  names: Map<string, string>;
  tokens: string[];
}

/** WAI-ARIA 1.2 states and properties. */
const ARIA = new Set(
  'activedescendant atomic autocomplete braillelabel brailleroledescription busy checked colcount colindex colindextext colspan controls current describedby description details disabled errormessage expanded flowto haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowcount rowindex rowindextext rowspan selected setsize sort valuemax valuemin valuenow valuetext'
    .split(' ')
    .map((name) => `aria-${name}`),
);

/** The words of the guideline format itself (`writing-rules.md`): levels, fields, front matter. */
const GUIDELINE_FORMAT = new Set([
  'MUST',
  'SHOULD',
  'MAY',
  'Level',
  'Applies to',
  'Rule',
  'Why',
  'Do',
  "Don't",
  'Check',
  'Status: retired',
  'topic',
  'prefix',
  'triggers',
  'families',
]);

/** A name that resolves against nothing above and stays, with the reason it stays. */
export const REFERENCE_EXCEPTIONS: Readonly<Record<string, string>> = {
  'minmax(0, 1fr)': 'the CSS grid track with a zero minimum that lets a family scroll (CP-03)',
  '(hover: none) and (pointer: coarse)':
    'the media query that identifies a touch-primary device (SC-06)',
};

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

export function loadCatalog(root: string): Catalog {
  const names = new Map<string, string>();
  const add = (name: string, kind: string) => {
    if (!names.has(name)) names.set(name, kind);
  };
  const specs = join(root, 'specs/components');
  const contracts = readdirSync(specs)
    .map((family) => join(specs, family, 'contract.json'))
    .filter((file) => existsSync(file))
    .map((file) => JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>);
  // Families first: a family name that is also another family's part resolves as the family.
  for (const contract of contracts) {
    add(String(contract['family']), 'family');
    add(String(contract['ui']), 'family');
    for (const member of Object.keys((contract['members'] as object) ?? {})) add(member, 'family');
  }
  for (const contract of contracts) {
    // A family declares its parts, states and options per member, and some parts also under
    // `anatomy` or `elements`.
    for (const member of Object.values((contract['members'] as Record<string, unknown>) ?? {})) {
      const { parts, states, defaults } = member as {
        parts?: unknown;
        states?: unknown;
        defaults?: object;
      };
      if (Array.isArray(parts)) for (const part of parts) add(String(part), 'part');
      if (Array.isArray(states)) for (const state of states) add(String(state), 'state');
      for (const option of Object.keys(defaults ?? {})) add(option, 'option');
    }
    for (const part of Object.keys((contract['anatomy'] as object) ?? {})) add(part, 'part');
    for (const part of Object.keys((contract['elements'] as object) ?? {})) add(part, 'part');
    const states = contract['stateAttributes'];
    for (const state of Array.isArray(states) ? states : Object.keys((states as object) ?? {})) {
      add(`data-${state}`, 'state');
      add(String(state), 'state');
    }
    for (const [axis, values] of Object.entries(
      (contract['axes'] as Record<string, unknown>) ?? {},
    )) {
      add(axis, 'axis');
      if (Array.isArray(values)) for (const value of values) add(String(value), 'axis-value');
    }
  }
  const theme = JSON.parse(
    readFileSync(join(root, 'packages/theme/src/contract.json'), 'utf8'),
  ) as {
    tokens: { name: string }[];
  };
  for (const token of theme.tokens) add(token.name, 'token');
  for (const file of walk(join(root, 'packages/styles/src'))) {
    if (file.endsWith('.tokens.json'))
      for (const [token] of readFileSync(file, 'utf8').matchAll(/--slotted-[a-z0-9-]+/g))
        add(token, 'token');
    if (file.endsWith('.css'))
      for (const [, property] of readFileSync(file, 'utf8').matchAll(/(--slotted-[a-z0-9-]+)\s*:/g))
        add(property!, 'token');
  }
  return { names, tokens: [...names].filter(([, kind]) => kind === 'token').map(([name]) => name) };
}

export function nameKind(
  name: string,
  catalog: Catalog,
  ruleIds: ReadonlySet<string>,
  local: ReadonlySet<string> = new Set(),
): string | undefined {
  if (local.has(name)) return 'local';
  const known = catalog.names.get(name);
  if (known !== undefined) return known;
  if (/^[A-Z]{2}-\d{2}$/.test(name)) return ruleIds.has(name) ? 'rule' : undefined;
  if (ARIA.has(name)) return 'aria';
  if (GUIDELINE_FORMAT.has(name)) return 'guideline-format';
  const wildcard = /^(--slotted-[a-z0-9-]+-)\*$/.exec(name);
  if (wildcard !== null)
    return catalog.tokens.some((token) => token.startsWith(wildcard[1]!))
      ? 'token-wildcard'
      : undefined;
  if (/^[a-z-]+: [^;:]+$/.test(name))
    return [...name.matchAll(/--slotted-[a-z0-9-]+/g)].every(([token]) =>
      catalog.tokens.includes(token),
    )
      ? 'css-declaration'
      : undefined;
  if (name in REFERENCE_EXCEPTIONS) return 'exception';
  return undefined;
}

export function unresolvedNames(
  markdown: string,
  catalog: Catalog,
  ruleIds: ReadonlySet<string>,
  local: ReadonlySet<string> = new Set(),
): string[] {
  const found: string[] = [];
  for (const [, name] of markdown.matchAll(/`([^`\n]+)`/g))
    if (nameKind(name!, catalog, ruleIds, local) === undefined && !found.includes(name!))
      found.push(name!);
  return found;
}
