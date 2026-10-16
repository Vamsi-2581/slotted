# Material de agente do produto — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** publicar em `dist/docs` dos dois bindings as guidelines genéricas de composição de tela e as skills `compose-screen` e `waiting-states`, verificadas contra os contratos e medidas por uma avaliação de eficácia.

**Architecture:** a fonte fica em `tools/agent-docs/content/`. O build existente (`tools/agent-docs/src/build.ts`) passa a validar e renderizar essa fonte ao lado das páginas de família. Módulos novos e independentes cuidam da análise e validação de tópicos (`guidelines.ts`), da resolução de nomes (`references.ts`), do registro de IDs (`registry.ts`) e das skills (`skills.ts`). Um teste de conteúdo roda em `pnpm check`. O harness de avaliação (`src/eval/*.ts`, `bin/eval.mjs`) executa `claude -p` sobre projetos consumidores mínimos.

**Tech Stack:** TypeScript executado por Node 24 com type stripping, Vitest 4, Astro (apps/docs), `node:test` (scripts), Claude Code CLI 2.1.301.

**Spec:** `docs/history/designs/2026-10-16-product-agent-material-design.md`

## Global Constraints

- Texto publicado (guidelines, skills, snippet, README de pacote) em inglês; documentos de `docs/` em pt-BR.
- Nenhuma dependência nova em `package.json`.
- `.claude/skills/` não é alterado.
- Caminho de docs por binding vem de `DOCS_DIR` (`tools/agent-docs/src/types.ts`): `node_modules/@slotted/react/dist/docs` e `node_modules/@slotted/angular/docs`. Nenhum caminho de pacote escrito à mão em conteúdo; conteúdo usa `{{docsDir}}` e `{{package}}`.
- Campos de regra, nesta ordem: `Level`, `Applies to`, `Rule`, `Why`, `Do`, `Don't`, `Seen in` (opcional), `Verified in` (opcional), `Check`. Regra aposentada: só `Status: retired · <motivo>`.
- `Seen in` e `Verified in` existem só na fonte; o build os remove.
- Texto publicado não contém: `Nexora`, `the demo`, `simulated backend`, `Spec:`, bloco de código cercado, link Markdown relativo.
- Orçamentos de bytes: `index.md` 8192, `AGENTS.snippet.md` 2048 (`BUDGETS`).
- `description` de skill começa por `Use when`; corpo ≤ 500 linhas.
- Limiares da avaliação: disparo ≥ 0.90, conformidade ≥ 0.85, por skill.
- Volume da rodada completa: 2 bindings × 8 casos × 3 execuções × 2 condições = 96 sessões; a rodada completa só roda com aprovação explícita do usuário.
- Commits no estilo do repositório: `tipo(escopo): descrição em português`.
- Protocolo de fatia (`~/.claude/CLAUDE.md`): checkpoint em `.claude/progress/current.md` ao fim de cada fatia (Tasks 1–3, 4–6, 7–9, 10–12, 13–15, 16).

## Review Focus

1. Regra com campo em linha quebrada (Prettier envolvendo `Applies to` longo) — o parser junta continuação à linha do campo anterior em vez de rejeitar o tópico; teste na Task 1.
2. Tópico com regra aposentada que mantém corpo — validação acusa; teste na Task 1.
3. Tag `v*` anterior sem `ids.json` (primeiro release após este plano) ou clone sem tags — o registro valida só a consistência atual e não falha; teste na Task 3.
4. Nome entre crases com curinga (`--slotted-space-*`) ou declaração CSS única (`min-inline-size: 0`) — resolve como token-curinga e declaração; teste na Task 2.
5. Build executado duas vezes — saída de `guidelines/` e `skills/` byte a byte idêntica; teste na Task 4.

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `tools/agent-docs/src/guidelines.ts` | analisa, valida e renderiza tópicos; gera `guidelines/index.md` |
| `tools/agent-docs/src/references.ts` | catálogo de nomes publicados; nomes não resolvidos de um texto |
| `tools/agent-docs/src/registry.ts` | consistência de `ids.json` com tópicos e com a tag anterior |
| `tools/agent-docs/src/skills.ts` | analisa, valida e renderiza `SKILL.md` |
| `tools/agent-docs/src/content.ts` | carrega `content/` inteiro (tópicos, README, skills) |
| `tools/agent-docs/src/content.test.ts` | teste do conteúdo real; roda em `pnpm check` |
| `tools/agent-docs/src/build.ts` | escreve `guidelines/` e `skills/` |
| `tools/agent-docs/src/render.ts` | seções novas em `index.md` |
| `tools/agent-docs/src/agents-snippet.{react,angular}.md` | tabela tarefa → skill |
| `tools/agent-docs/content/**` | fonte do material publicado |
| `tools/agent-docs/src/eval/*.ts`, `tools/agent-docs/bin/eval.mjs`, `tools/agent-docs/eval/**` | avaliação de eficácia |
| `apps/docs/src/lib/agent-docs.ts`, rotas, `llms.txt.ts` | site |
| `scripts/release.mjs` | bloco "Guidelines" no changelog |
| `demos/nexora/**` | demo como consumidora |

---

### Task 1: Análise e validação de tópicos

**Files:**
- Create: `tools/agent-docs/src/guidelines.ts`
- Test: `tools/agent-docs/src/guidelines.test.ts`

**Interfaces:**
- Produces:
  - `type Level = 'MUST' | 'SHOULD' | 'MAY'`
  - `const RULE_FIELDS: readonly string[]` (ordem dos campos de regra ativa)
  - `const SOURCE_ONLY_FIELDS: readonly string[]` = `['Seen in', 'Verified in']`
  - `interface Rule { id: string; title: string; status: 'active' | 'retired'; statusText?: string; fields: [string, string][]; level?: Level }`
  - `interface Topic { file: string; topic: string; prefix: string; triggers: string[]; families: string[]; frontmatter: string; title: string; intro: string; rules: Rule[] }`
  - `parseTopic(file: string, source: string): Topic`
  - `topicErrors(topic: Topic, source: string): string[]`
  - `renderTopic(topic: Topic): string`
  - `renderGuidelinesIndex(topics: readonly Topic[]): string`
  - `const PUBLISHED_FORBIDDEN: readonly RegExp[]`

- [ ] **Step 1: Escrever o teste com fixture**

```ts
import { describe, expect, it } from 'vitest';

import { parseTopic, renderGuidelinesIndex, renderTopic, topicErrors } from './guidelines.ts';

const source = `---
topic: async feedback
prefix: AF
triggers:
  [
    loading,
    pending,
  ]
families: [skeleton, button]
---

# Async feedback

What a screen shows between a request starting and its answer arriving.

### AF-01 · Pending is not empty

Level: MUST
Applies to: any region filled by a request — a \`popover\` body, a \`list\`,
  a \`data-grid\`
Rule: A region whose first answer has not arrived shows its pending state.
Why: An empty state is a statement about the data.
Do: Draw placeholders until the answer.
Don't: Draw the empty words before the answer.
Seen in: a screen · corrected
Verified in: the banner suite, "pending, not empty"
Check: Throttle the network, open the region cold; the empty words do not appear before the answer.

### AF-02 · Old rule

Status: retired · rewritten as AF-03
`;

describe('parseTopic', () => {
  it('reads the frontmatter, the intro and each rule, joining a wrapped field line', () => {
    const topic = parseTopic('async-feedback.md', source);
    expect(topic.prefix).toBe('AF');
    expect(topic.triggers).toEqual(['loading', 'pending']);
    expect(topic.families).toEqual(['skeleton', 'button']);
    expect(topic.title).toBe('Async feedback');
    expect(topic.intro).toBe('What a screen shows between a request starting and its answer arriving.');
    const [first, second] = topic.rules;
    expect(first!.id).toBe('AF-01');
    expect(first!.level).toBe('MUST');
    expect(first!.fields.find(([key]) => key === 'Applies to')![1]).toBe(
      'any region filled by a request — a `popover` body, a `list`, a `data-grid`',
    );
    expect(second!.status).toBe('retired');
    expect(second!.statusText).toBe('rewritten as AF-03');
  });
});

describe('topicErrors', () => {
  it('accepts a well-formed topic', () => {
    expect(topicErrors(parseTopic('async-feedback.md', source), source)).toEqual([]);
  });

  it('reports fields out of order, a missing Check, a foreign prefix and a retired rule with a body', () => {
    const broken = source
      .replace('Why: An empty state', 'Why: moved\nRule: duplicate')
      .replace(/Check: Throttle.*\n/, '')
      .replace('### AF-02', '### LP-02')
      .replace('Status: retired · rewritten as AF-03', 'Status: retired · x\nLevel: MUST');
    const errors = topicErrors(parseTopic('async-feedback.md', broken), broken);
    expect(errors).toContain('async-feedback.md AF-01: fields out of order or repeated');
    expect(errors).toContain('async-feedback.md AF-01: no Check');
    expect(errors).toContain('async-feedback.md LP-02: id does not start with prefix AF');
    expect(errors).toContain('async-feedback.md LP-02: a retired rule keeps only its Status');
  });

  it('reports a fenced block and a forbidden qualifier', () => {
    const broken = `${source}\n\`\`\`css\na {}\n\`\`\`\nA clean layout.\n`;
    const errors = topicErrors(parseTopic('async-feedback.md', broken), broken);
    expect(errors).toContain('async-feedback.md: fenced code block');
    expect(errors).toContain('async-feedback.md: forbidden word "clean"');
  });
});

describe('renderTopic', () => {
  it('drops the source-only fields and keeps a retired rule as heading and status', () => {
    const out = renderTopic(parseTopic('async-feedback.md', source));
    expect(out).not.toContain('Seen in:');
    expect(out).not.toContain('Verified in:');
    expect(out).toContain('Check: Throttle the network');
    expect(out).toContain('### AF-02 · Old rule\n\nStatus: retired · rewritten as AF-03\n');
    expect(out.startsWith('---\ntopic: async feedback\n')).toBe(true);
  });
});

describe('renderGuidelinesIndex', () => {
  it('lists active rules only, one row each, with the Rule text', () => {
    const out = renderGuidelinesIndex([parseTopic('async-feedback.md', source)]);
    expect(out).toContain(
      '| AF-01 | MUST | A region whose first answer has not arrived shows its pending state. | `async-feedback.md` |',
    );
    expect(out).not.toContain('AF-02');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/guidelines.test.ts`
Expected: FAIL — `Cannot find module './guidelines.ts'`.

- [ ] **Step 3: Implementar**

```ts
/**
 * A guideline topic: frontmatter, a title, an intro, and rules in the form
 * `content/guidelines/writing-rules.md` states. Parsed to validate and to render
 * the published copy, which drops the fields only the source keeps.
 */
export type Level = 'MUST' | 'SHOULD' | 'MAY';

export const RULE_FIELDS = [
  'Level',
  'Applies to',
  'Rule',
  'Why',
  'Do',
  "Don't",
  'Seen in',
  'Verified in',
  'Check',
] as const;
const REQUIRED_FIELDS = ['Level', 'Applies to', 'Rule', 'Why', 'Do', "Don't", 'Check'];
export const SOURCE_ONLY_FIELDS = ['Seen in', 'Verified in'] as const;
const LEVELS = new Set(['MUST', 'SHOULD', 'MAY']);

/** Qualifiers `writing-rules.md` names as untestable. */
const FORBIDDEN_WORDS = ['generous', 'clean', 'modern'];

/** Text that names the repository's demo or its tests; never in a published file. */
export const PUBLISHED_FORBIDDEN: readonly RegExp[] = [
  /\bNexora\b/,
  /\bthe demo\b/i,
  /\bsimulated backend\b/i,
  /\bSpec:/,
  /^```/m,
  /\]\((?!https:\/\/)[^)]+\)/,
];

export interface Rule {
  id: string;
  title: string;
  status: 'active' | 'retired';
  statusText?: string;
  fields: [string, string][];
  level?: Level;
}

export interface Topic {
  file: string;
  topic: string;
  prefix: string;
  triggers: string[];
  families: string[];
  frontmatter: string;
  title: string;
  intro: string;
  rules: Rule[];
}

const HEADING = /^### ([A-Z]{2}-\d{2}) · (.+)$/;
const FIELD = /^(Status|Level|Applies to|Rule|Why|Do|Don't|Seen in|Verified in|Check): (.*)$/;

function list(frontmatter: string, key: string): string[] {
  const match = new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]`, 'm').exec(frontmatter);
  if (match === null) return [];
  return match[1]!
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function scalar(frontmatter: string, key: string): string {
  return new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1]?.trim() ?? '';
}

export function parseTopic(file: string, source: string): Topic {
  const end = source.indexOf('\n---\n', 4);
  if (!source.startsWith('---\n') || end === -1) throw new Error(`${file}: no frontmatter`);
  const frontmatter = source.slice(4, end);
  const body = source.slice(end + 5).split('\n');

  const title = (body.find((line) => line.startsWith('# ')) ?? '').slice(2).trim();
  const firstRule = body.findIndex((line) => HEADING.test(line));
  const introLines = body.slice(body.findIndex((line) => line.startsWith('# ')) + 1, firstRule === -1 ? undefined : firstRule);
  const intro = introLines.join('\n').trim();

  const rules: Rule[] = [];
  let current: Rule | undefined;
  for (const line of firstRule === -1 ? [] : body.slice(firstRule)) {
    const heading = HEADING.exec(line);
    if (heading !== null) {
      current = { id: heading[1]!, title: heading[2]!, status: 'active', fields: [] };
      rules.push(current);
      continue;
    }
    if (current === undefined || line.trim() === '') continue;
    const field = FIELD.exec(line);
    if (field === null) {
      const last = current.fields.at(-1);
      if (last !== undefined) last[1] = `${last[1]} ${line.trim()}`;
      continue;
    }
    const [, key, value] = field as unknown as [string, string, string];
    if (key === 'Status') {
      current.status = 'retired';
      current.statusText = value.replace(/^retired · /, '');
    } else {
      current.fields.push([key, value]);
      if (key === 'Level') current.level = value as Level;
    }
  }

  return {
    file,
    topic: scalar(frontmatter, 'topic'),
    prefix: scalar(frontmatter, 'prefix'),
    triggers: list(frontmatter.replace(/\n\s+/g, ' '), 'triggers'),
    families: list(frontmatter.replace(/\n\s+/g, ' '), 'families'),
    frontmatter,
    title,
    intro,
    rules,
  };
}

export function topicErrors(topic: Topic, source: string): string[] {
  const errors: string[] = [];
  const at = (rule: Rule) => `${topic.file} ${rule.id}`;
  if (!/^[A-Z]{2}$/.test(topic.prefix)) errors.push(`${topic.file}: prefix "${topic.prefix}"`);
  if (topic.title === '') errors.push(`${topic.file}: no title`);
  for (const rule of topic.rules) {
    if (!rule.id.startsWith(`${topic.prefix}-`))
      errors.push(`${at(rule)}: id does not start with prefix ${topic.prefix}`);
    if (rule.status === 'retired') {
      if (rule.fields.length > 0) errors.push(`${at(rule)}: a retired rule keeps only its Status`);
      continue;
    }
    const keys = rule.fields.map(([key]) => key);
    const expected = RULE_FIELDS.filter((key) => keys.includes(key));
    if (keys.join('|') !== expected.join('|')) errors.push(`${at(rule)}: fields out of order or repeated`);
    for (const key of REQUIRED_FIELDS)
      if (!keys.includes(key)) errors.push(key === 'Check' ? `${at(rule)}: no Check` : `${at(rule)}: no ${key}`);
    if (rule.level !== undefined && !LEVELS.has(rule.level)) errors.push(`${at(rule)}: level "${rule.level}"`);
  }
  if (/^```/m.test(source)) errors.push(`${topic.file}: fenced code block`);
  const prose = source.replace(/`[^`\n]*`/g, '');
  for (const word of FORBIDDEN_WORDS)
    if (new RegExp(`\\b${word}\\b`, 'i').test(prose)) errors.push(`${topic.file}: forbidden word "${word}"`);
  const ids = topic.rules.map((rule) => rule.id);
  for (const id of new Set(ids))
    if (ids.indexOf(id) !== ids.lastIndexOf(id)) errors.push(`${topic.file}: ${id} appears twice`);
  return errors;
}

export function renderTopic(topic: Topic): string {
  const lines = ['---', topic.frontmatter, '---', '', `# ${topic.title}`, ''];
  if (topic.intro !== '') lines.push(topic.intro, '');
  for (const rule of topic.rules) {
    lines.push(`### ${rule.id} · ${rule.title}`, '');
    if (rule.status === 'retired') {
      lines.push(`Status: retired · ${rule.statusText ?? ''}`, '');
      continue;
    }
    for (const [key, value] of rule.fields)
      if (!(SOURCE_ONLY_FIELDS as readonly string[]).includes(key)) lines.push(`${key}: ${value}`);
    lines.push('');
  }
  return lines.join('\n');
}

export function renderGuidelinesIndex(topics: readonly Topic[]): string {
  const lines = [
    '# Guidelines index',
    '',
    'Every active rule, one line each. Load this first; load a topic file when the task matches its `triggers`.',
    '',
    '| ID | Level | Rule | File |',
    '| --- | --- | --- | --- |',
  ];
  for (const topic of [...topics].sort((a, b) => a.file.localeCompare(b.file)))
    for (const rule of topic.rules) {
      if (rule.status === 'retired') continue;
      const text = rule.fields.find(([key]) => key === 'Rule')?.[1] ?? '';
      lines.push(`| ${rule.id} | ${rule.level} | ${text.replaceAll('|', '\\|')} | \`${topic.file}\` |`);
    }
  return `${lines.join('\n')}\n`;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/guidelines.test.ts && pnpm --filter @slotted/agent-docs typecheck`
Expected: PASS; typecheck sem erros. Se `pnpm exec prettier --check tools/agent-docs/src` acusar formatação, rodar `pnpm format` e repetir.

- [ ] **Step 5: Commit**

```bash
git add tools/agent-docs/src/guidelines.ts tools/agent-docs/src/guidelines.test.ts
git commit -m "feat(agent-docs): análise, validação e renderização dos tópicos de guidelines — campos na ordem de writing-rules, Seen in e Verified in só na fonte, índice gerado das regras ativas"
```

---

### Task 2: Resolução de nomes contra contratos e tokens

**Files:**
- Create: `tools/agent-docs/src/references.ts`
- Test: `tools/agent-docs/src/references.test.ts`

**Interfaces:**
- Produces:
  - `interface Catalog { names: Map<string, string>; tokens: string[] }`
  - `loadCatalog(root: string): Catalog`
  - `nameKind(name: string, catalog: Catalog, ruleIds: ReadonlySet<string>): string | undefined`
  - `unresolvedNames(markdown: string, catalog: Catalog, ruleIds: ReadonlySet<string>): string[]`
  - `const REFERENCE_EXCEPTIONS: Readonly<Record<string, string>>` (nome → motivo)

- [ ] **Step 1: Escrever o teste**

```ts
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadCatalog, nameKind, unresolvedNames } from './references.ts';

const root = resolve(import.meta.dirname, '../../..');
const catalog = loadCatalog(root);
const rules = new Set(['AF-01']);

describe('nameKind', () => {
  it.each([
    ['data-grid', 'family'],
    ['body', 'part'],
    ['data-loading', 'state'],
    ['bleed', 'axis-value'],
    ['--slotted-app-shell-row-inset', 'token'],
    ['--slotted-space-*', 'token-wildcard'],
    ['aria-busy', 'aria'],
    ['AF-01', 'rule'],
    ['min-inline-size: 0', 'css-declaration'],
  ])('%s resolves as %s', (name, kind) => {
    expect(nameKind(name, catalog, rules)).toBe(kind);
  });

  it.each(['size="sm"', '/crm/customers/new', 'customers.credit_view', 'AF-99', '--slotted-nope-*'])(
    '%s does not resolve',
    (name) => {
      expect(nameKind(name, catalog, rules)).toBeUndefined();
    },
  );
});

describe('unresolvedNames', () => {
  // `css-declaration` takes a lowercase, hyphenated property: binding API in camelCase stays unresolved.
  it('returns each unresolved backticked name once, in order', () => {
    expect(
      unresolvedNames('A `data-grid` with `rowHeader: true` and `rowHeader: true`, then `x.y`.', catalog, rules),
    ).toEqual(['rowHeader: true', 'x.y']);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/references.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

```ts
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

/** A name that resolves against nothing above and stays, with the reason it stays. */
export const REFERENCE_EXCEPTIONS: Readonly<Record<string, string>> = {};

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
    for (const part of Object.keys((contract['elements'] as object) ?? {})) add(part, 'part');
    const states = contract['stateAttributes'];
    for (const state of Array.isArray(states) ? states : Object.keys((states as object) ?? {})) {
      add(`data-${state}`, 'state');
      add(String(state), 'state');
    }
    for (const [axis, values] of Object.entries((contract['axes'] as Record<string, unknown>) ?? {})) {
      add(axis, 'axis');
      if (Array.isArray(values)) for (const value of values) add(String(value), 'axis-value');
    }
  }
  const theme = JSON.parse(readFileSync(join(root, 'packages/theme/src/contract.json'), 'utf8')) as {
    tokens: { name: string }[];
  };
  for (const token of theme.tokens) add(token.name, 'token');
  for (const file of walk(join(root, 'packages/styles/src'))) {
    if (file.endsWith('.tokens.json'))
      for (const [token] of readFileSync(file, 'utf8').matchAll(/--slotted-[a-z0-9-]+/g)) add(token, 'token');
    if (file.endsWith('.css'))
      for (const [, property] of readFileSync(file, 'utf8').matchAll(/(--slotted-[a-z0-9-]+)\s*:/g))
        add(property!, 'token');
  }
  return { names, tokens: [...names].filter(([, kind]) => kind === 'token').map(([name]) => name) };
}

export function nameKind(name: string, catalog: Catalog, ruleIds: ReadonlySet<string>): string | undefined {
  const known = catalog.names.get(name);
  if (known !== undefined) return known;
  if (/^[A-Z]{2}-\d{2}$/.test(name)) return ruleIds.has(name) ? 'rule' : undefined;
  if (ARIA.has(name)) return 'aria';
  const wildcard = /^(--slotted-[a-z0-9-]+-)\*$/.exec(name);
  if (wildcard !== null) return catalog.tokens.some((token) => token.startsWith(wildcard[1]!)) ? 'token-wildcard' : undefined;
  if (/^[a-z-]+: [^;:]+$/.test(name)) return 'css-declaration';
  if (name in REFERENCE_EXCEPTIONS) return 'exception';
  return undefined;
}

export function unresolvedNames(markdown: string, catalog: Catalog, ruleIds: ReadonlySet<string>): string[] {
  const found: string[] = [];
  for (const [, name] of markdown.matchAll(/`([^`\n]+)`/g))
    if (nameKind(name!, catalog, ruleIds) === undefined && !found.includes(name!)) found.push(name!);
  return found;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/references.test.ts && pnpm --filter @slotted/agent-docs typecheck`
Expected: PASS. Se `body` ou `bleed` resolverem com outro tipo, o primeiro registro venceu: imprimir `catalog.names.get('body')` e trocar no teste o nome por outro do mesmo tipo em `specs/components/*/contract.json`, sem mudar a regra de precedência.

- [ ] **Step 5: Commit**

```bash
git add tools/agent-docs/src/references.ts tools/agent-docs/src/references.test.ts
git commit -m "feat(agent-docs): resolução dos nomes entre crases contra contratos, tema, tokens e propriedades declaradas nas folhas — família, parte, estado, eixo, token, ARIA, regra e declaração CSS única"
```

---

### Task 3: Registro de IDs

**Files:**
- Create: `tools/agent-docs/src/registry.ts`
- Test: `tools/agent-docs/src/registry.test.ts`

**Interfaces:**
- Consumes: `Topic`, `Level` (Task 1).
- Produces:
  - `interface RegistryEntry { level: Level; status: 'active' | 'retired'; replacedBy?: string }`
  - `type Registry = Record<string, RegistryEntry>`
  - `registryErrors(topics: readonly Topic[], current: Registry, previous: Registry | undefined): string[]`
  - `previousRegistry(root: string): Registry | undefined` (lê `ids.json` na última tag `v*`; `undefined` sem tag ou sem arquivo)

- [ ] **Step 1: Escrever o teste**

```ts
import { describe, expect, it } from 'vitest';

import type { Topic } from './guidelines.ts';
import { previousRegistry, registryErrors, type Registry } from './registry.ts';

function topic(rules: Topic['rules']): Topic {
  return { file: 'x.md', topic: 'x', prefix: 'AF', triggers: [], families: [], frontmatter: '', title: 'X', intro: '', rules };
}
const active = (id: string, level: 'MUST' | 'SHOULD' = 'MUST') =>
  ({ id, title: id, status: 'active', level, fields: [['Level', level]] }) as Topic['rules'][number];
const retired = (id: string) => ({ id, title: id, status: 'retired', statusText: 'x', fields: [] }) as Topic['rules'][number];

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
    const current: Registry = { 'AF-01': { level: 'MUST', status: 'retired', replacedBy: 'AF-02' }, 'AF-02': { level: 'MUST', status: 'active' } };
    expect(registryErrors([topic([retired('AF-01'), active('AF-02')])], current, undefined)).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/registry.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

```ts
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
  const rules = new Map(topics.flatMap((topic) => topic.rules.map((rule) => [rule.id, rule] as const)));
  for (const [id, rule] of rules) {
    const entry = current[id];
    if (entry === undefined) {
      errors.push(`${id}: in a topic, not in ids.json`);
      continue;
    }
    if (entry.status !== rule.status) errors.push(`${id}: ids.json says ${entry.status}, the topic says ${rule.status}`);
    else if (rule.status === 'active' && entry.level !== rule.level)
      errors.push(`${id}: ids.json says ${entry.level}, the topic says ${rule.level}`);
  }
  for (const id of Object.keys(current)) if (!rules.has(id)) errors.push(`${id}: in ids.json, in no topic`);
  if (previous !== undefined) {
    for (const [id, before] of Object.entries(previous)) {
      const now = current[id];
      if (now === undefined) errors.push(`${id}: released before, gone from ids.json`);
      else if (before.status === 'retired' && now.status === 'active') errors.push(`${id}: retired before, active again`);
      else if (before.status === 'active' && now.status === 'active' && before.level !== now.level)
        errors.push(`${id}: level changed from ${before.level} to ${now.level}; retire it and issue a new id`);
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/registry.test.ts && pnpm --filter @slotted/agent-docs typecheck`
Expected: PASS.

- [ ] **Step 5: Commit e checkpoint da fatia**

```bash
git add tools/agent-docs/src/registry.ts tools/agent-docs/src/registry.test.ts
git commit -m "feat(agent-docs): registro de IDs das guidelines — nenhum id removido ou reutilizado, nível de regra ativa fixo, comparação com ids.json da última tag v*"
```

Escrever `.claude/progress/current.md` (campos do protocolo de fatia; próxima ação: Task 4 Step 1).

---

### Task 4: Skills, carregamento do conteúdo e escrita no build

**Files:**
- Create: `tools/agent-docs/src/skills.ts`, `tools/agent-docs/src/content.ts`, `tools/agent-docs/src/skills.test.ts`
- Create: `tools/agent-docs/content/guidelines/ids.json` (`{}`), `tools/agent-docs/content/guidelines/.gitkeep` não é usado — o diretório nasce com `ids.json`
- Modify: `tools/agent-docs/src/build.ts`, `tools/agent-docs/src/render.ts` (`renderIndex`), `tools/agent-docs/src/build.test.ts`, `turbo.json` (inputs dos dois builds)

**Interfaces:**
- Consumes: `parseTopic`, `renderTopic`, `renderGuidelinesIndex`, `Topic` (Task 1).
- Produces:
  - `interface Skill { name: string; description: string; source: string }`
  - `parseSkill(source: string): Skill`
  - `skillErrors(dir: string, skill: Skill, activeRuleIds: ReadonlySet<string>): string[]`
  - `renderContent(source: string, binding: Binding): string` — troca `{{docsDir}}` por `DOCS_DIR[binding]` e `{{package}}` por `@slotted/<binding>`
  - `interface Content { readme: string; topics: Topic[]; topicSources: Map<string, string>; skills: Map<string, Skill> }`
  - `loadContent(root: string): Content`
  - `renderIndex(inputs, binding, content: Content)` — assinatura nova

- [ ] **Step 1: Escrever os testes**

`tools/agent-docs/src/skills.test.ts`:

```ts
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
    expect(parseSkill(source)).toMatchObject({ name: 'waiting-states', description: 'Use when a screen waits for data.' });
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
    expect(renderContent(source, 'react')).toContain('`node_modules/@slotted/react/dist/docs/skeleton.md`');
  });
});
```

Em `tools/agent-docs/src/build.test.ts`, no `describe('buildDocs')`, acrescentar:

```ts
  it('writes the guidelines and the skills, identically twice, the same text in both bindings but the package', async () => {
    const react = mkdtempSync(join(tmpdir(), 'docs-'));
    const again = mkdtempSync(join(tmpdir(), 'docs-'));
    const angular = mkdtempSync(join(tmpdir(), 'docs-'));
    await buildDocs({ binding: 'react', root, out: react });
    await buildDocs({ binding: 'react', root, out: again });
    await buildDocs({ binding: 'angular', root, out: angular });

    const content = loadContent(root);
    const guidelines = ['README.md', 'index.md', ...content.topics.map((topic) => topic.file)];
    expect(readdirSync(join(react, 'guidelines')).sort()).toEqual(guidelines.sort());
    const skills = [...content.skills.keys()].map((name) => `skills/${name}/SKILL.md`);
    const files = [...guidelines.map((file) => `guidelines/${file}`), ...skills];
    for (const file of files) {
      const a = readFileSync(join(react, file), 'utf8');
      expect(readFileSync(join(again, file), 'utf8'), file).toBe(a);
      const b = readFileSync(join(angular, file), 'utf8');
      expect(b.replaceAll('node_modules/@slotted/angular/docs', 'node_modules/@slotted/react/dist/docs').replaceAll('@slotted/angular', '@slotted/react'), file).toBe(a);
    }
    const index = readFileSync(join(react, 'index.md'), 'utf8');
    expect(index).toContain('## Guidelines');
    for (const name of content.skills.keys()) expect(index).toContain(`./skills/${name}/SKILL.md`);
  });
```

e o import `import { loadContent } from './content.ts';`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/skills.test.ts src/build.test.ts`
Expected: FAIL — módulos `skills.ts` e `content.ts` inexistentes.

- [ ] **Step 3: Implementar `skills.ts`**

```ts
import { DOCS_DIR, type Binding } from './types.ts';

/** A product skill: `content/skills/<name>/SKILL.md`, published per binding. */
export interface Skill {
  name: string;
  description: string;
  source: string;
}

export const SKILL_MAX_LINES = 500;

export function parseSkill(source: string): Skill {
  const end = source.indexOf('\n---\n', 4);
  const frontmatter = source.startsWith('---\n') && end !== -1 ? source.slice(4, end) : '';
  const field = (key: string) => new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1]?.trim() ?? '';
  return { name: field('name'), description: field('description'), source };
}

export function skillErrors(dir: string, skill: Skill, activeRuleIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  if (skill.name !== dir) errors.push(`${dir}: name is ${skill.name || 'missing'}`);
  if (!skill.description.startsWith('Use when')) errors.push(`${dir}: description does not start with "Use when"`);
  if (skill.source.split('\n').length > SKILL_MAX_LINES) errors.push(`${dir}: more than ${SKILL_MAX_LINES} lines`);
  const cited = new Set([...skill.source.matchAll(/\b[A-Z]{2}-\d{2}\b/g)].map(([id]) => id));
  for (const id of cited)
    if (!activeRuleIds.has(id)) errors.push(`${dir}: cites ${id}, which is not an active rule`);
  const placeholders = [...skill.source.matchAll(/\{\{(\w+)\}\}/g)].map(([, name]) => name);
  for (const name of placeholders)
    if (name !== 'docsDir' && name !== 'package') errors.push(`${dir}: unknown placeholder {{${name}}}`);
  return errors;
}

export function renderContent(source: string, binding: Binding): string {
  return source.replaceAll('{{docsDir}}', DOCS_DIR[binding]).replaceAll('{{package}}', `@slotted/${binding}`);
}
```

- [ ] **Step 4: Implementar `content.ts`**

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseTopic, type Topic } from './guidelines.ts';
import { parseSkill, type Skill } from './skills.ts';

/** Files of `content/guidelines` that are not topics; `writing-rules.md` is never published. */
const NOT_TOPICS = new Set(['README.md', 'writing-rules.md', 'index.md']);

export interface Content {
  readme: string;
  topics: Topic[];
  topicSources: Map<string, string>;
  skills: Map<string, Skill>;
}

export function contentDir(root: string): string {
  return join(root, 'tools/agent-docs/content');
}

export function loadContent(root: string): Content {
  const guidelines = join(contentDir(root), 'guidelines');
  const skillsDir = join(contentDir(root), 'skills');
  const topicSources = new Map<string, string>();
  for (const file of existsSync(guidelines) ? readdirSync(guidelines).sort() : [])
    if (file.endsWith('.md') && !NOT_TOPICS.has(file)) topicSources.set(file, readFileSync(join(guidelines, file), 'utf8'));
  const skills = new Map<string, Skill>();
  for (const name of existsSync(skillsDir) ? readdirSync(skillsDir).sort() : [])
    skills.set(name, parseSkill(readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8')));
  const readmePath = join(guidelines, 'README.md');
  return {
    readme: existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : '',
    topics: [...topicSources].map(([file, source]) => parseTopic(file, source)),
    topicSources,
    skills,
  };
}
```

- [ ] **Step 5: Integrar em `render.ts` e `build.ts`**

Em `render.ts`, `renderIndex` recebe `content: Content` (import de `./content.ts`) e, antes do controle de orçamento, acrescenta:

```ts
  if (content.topics.length > 0)
    lines.push(
      '## Guidelines',
      '',
      'Rules for composing screens from these families: `./guidelines/index.md`. Read it before writing a screen.',
      '',
    );
  if (content.skills.size > 0)
    lines.push(
      '## Skills',
      '',
      ...[...content.skills.values()].map((skill) => `- ${skill.name}: \`./skills/${skill.name}/SKILL.md\` — ${skill.description}`),
      '',
    );
```

Localizar as chamadas existentes com `grep -rn "renderIndex(" tools/agent-docs/src` e atualizar cada uma fora de `build.ts` para `renderIndex(families, binding, { readme: '', topics: [], topicSources: new Map(), skills: new Map() })`.

Em `build.ts`, após o laço das famílias:

```ts
  const content = loadContent(root);
  if (content.topics.length > 0) {
    mkdirSync(join(out, 'guidelines'));
    writeFileSync(join(out, 'guidelines/README.md'), renderContent(content.readme, binding));
    writeFileSync(join(out, 'guidelines/index.md'), renderGuidelinesIndex(content.topics));
    for (const topic of content.topics)
      writeFileSync(join(out, 'guidelines', topic.file), renderContent(renderTopic(topic), binding));
  }
  for (const [name, skill] of content.skills) {
    mkdirSync(join(out, 'skills', name), { recursive: true });
    writeFileSync(join(out, 'skills', name, 'SKILL.md'), renderContent(skill.source, binding));
  }
```

e trocar `renderIndex(families, binding)` por `renderIndex(families, binding, content)`, movendo `const content = loadContent(root);` para antes dessa linha. Imports: `loadContent` de `./content.ts`; `renderGuidelinesIndex`, `renderTopic` de `./guidelines.ts`; `renderContent` de `./skills.ts`.

Criar `tools/agent-docs/content/guidelines/ids.json` com `{}\n`.

Em `turbo.json`, nos `inputs` de `@slotted/angular#build` e `@slotted/react#build`, acrescentar `"$TURBO_ROOT$/tools/agent-docs/content/**"` depois de `"$TURBO_ROOT$/tools/agent-docs/bin/**"`.

- [ ] **Step 6: Rodar e ver passar**

Run: `pnpm --filter @slotted/agent-docs test && pnpm --filter @slotted/agent-docs typecheck`
Expected: PASS. Com `content/` ainda sem tópicos e sem skills, o teste novo de build passa com listas vazias, exceto `readdirSync(join(react, 'guidelines'))`, que lança `ENOENT`. Proteger essa asserção com `if (content.topics.length > 0)`; a Task 7 a exercita com conteúdo real.

- [ ] **Step 7: Commit**

```bash
git add tools/agent-docs/src tools/agent-docs/content/guidelines/ids.json turbo.json
git commit -m "feat(agent-docs): o build escreve guidelines/ e skills/ a partir de tools/agent-docs/content, com {{docsDir}} e {{package}} por binding; index.md ganha as seções Guidelines e Skills; turbo reconstrói os bindings quando content/ muda"
```

---

### Task 5: Teste do conteúdo real em `pnpm check`

**Files:**
- Create: `tools/agent-docs/src/content.test.ts`
- Modify: `package.json` (raiz, script `test:docs`)

**Interfaces:**
- Consumes: `loadContent`, `topicErrors`, `renderTopic`, `PUBLISHED_FORBIDDEN`, `loadCatalog`, `unresolvedNames`, `registryErrors`, `previousRegistry`, `skillErrors`, `renderContent`, `renderAgentsSnippet`.
- Produces: o gate de conteúdo que as Tasks 6–11 tornam verde.

- [ ] **Step 1: Escrever o teste**

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contentDir, loadContent } from './content.ts';
import { PUBLISHED_FORBIDDEN, renderTopic, topicErrors } from './guidelines.ts';
import { loadCatalog, unresolvedNames } from './references.ts';
import { previousRegistry, registryErrors, type Registry } from './registry.ts';
import { renderAgentsSnippet } from './render.ts';
import { renderContent, skillErrors } from './skills.ts';

/**
 * The published guidelines and skills, read from `tools/agent-docs/content`:
 * every rule well formed, every name resolved, every id registered, nothing
 * that names the repository's demo.
 */
const root = resolve(import.meta.dirname, '../../..');
const content = loadContent(root);
const catalog = loadCatalog(root);
const active = new Set(
  content.topics.flatMap((topic) => topic.rules.filter((rule) => rule.status === 'active').map((rule) => rule.id)),
);
const published = [
  ...content.topics.map((topic) => [topic.file, renderTopic(topic)] as const),
  ['README.md', content.readme] as const,
  ...[...content.skills].map(([name, skill]) => [`skills/${name}`, renderContent(skill.source, 'react')] as const),
];

describe('guidelines', () => {
  it('every topic is well formed', () => {
    expect(content.topics.flatMap((topic) => topicErrors(topic, content.topicSources.get(topic.file)!))).toEqual([]);
  });

  it('every prefix belongs to one topic, and to no demo', () => {
    const prefixes = content.topics.map((topic) => topic.prefix);
    expect(prefixes.filter((prefix, index) => prefixes.indexOf(prefix) !== index)).toEqual([]);
    const demos = join(root, 'demos');
    const demoPrefixes = readdirSync(demos)
      .map((demo) => join(demos, demo, 'guidelines'))
      .filter(existsSync)
      .flatMap((dir) =>
        readdirSync(dir).map((file) => /^prefix:\s*([A-Z]{2})$/m.exec(readFileSync(join(dir, file), 'utf8'))?.[1]),
      )
      .filter((prefix): prefix is string => prefix !== undefined);
    expect(demoPrefixes.filter((prefix) => prefixes.includes(prefix))).toEqual([]);
  });

  it('ids.json matches the topics and the last release', () => {
    const registry = JSON.parse(readFileSync(join(contentDir(root), 'guidelines/ids.json'), 'utf8')) as Registry;
    expect(registryErrors(content.topics, registry, previousRegistry(root))).toEqual([]);
  });
});

describe('published text', () => {
  it.each(published)('%s names only what the library publishes', (_file, text) => {
    expect(unresolvedNames(text, catalog, active)).toEqual([]);
  });

  it.each(published)('%s names neither the demo nor its tests', (_file, text) => {
    expect(PUBLISHED_FORBIDDEN.filter((pattern) => pattern.test(text)).map(String)).toEqual([]);
  });
});

describe('skills', () => {
  it('every skill is well formed and cites active rules', () => {
    expect([...content.skills].flatMap(([name, skill]) => skillErrors(name, skill, active))).toEqual([]);
  });

  it('the snippet of each binding names every skill', () => {
    for (const binding of ['react', 'angular'] as const) {
      const snippet = renderAgentsSnippet(binding);
      for (const name of content.skills.keys()) expect(snippet, `${binding} ${name}`).toContain(`/skills/${name}/SKILL.md`);
    }
  });
});
```

`published` contém sempre a entrada `README.md` (texto vazio antes da Task 6), por isso `it.each` nunca recebe lista vazia.

- [ ] **Step 2: Rodar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: PASS com `content/` vazio, exceto `the snippet of each binding names every skill` (sem skills, passa vazio). Se `ids.json matches` falhar por `previousRegistry` devolver um registro antigo, investigar: com o arquivo ausente na última tag, a função devolve `undefined`.

- [ ] **Step 3: Ligar ao `pnpm check`**

Em `package.json` da raiz, `test:docs` passa a:

```json
"test:docs": "node --test scripts/verify-docs-snippets.test.mjs scripts/verify-typecheck-projects.test.mjs && pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts src/guidelines.test.ts src/references.test.ts src/registry.test.ts src/skills.test.ts",
```

Run: `pnpm test:docs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tools/agent-docs/src/content.test.ts package.json
git commit -m "test(agent-docs): o conteúdo publicado entra em pnpm check — tópicos bem formados, prefixos únicos entre pacote e demos, ids.json contra a última tag, nomes resolvidos, nenhum texto da demo, skills citadas no snippet"
```

---

### Task 6: Protocolos de escrita e de leitura

**Files:**
- Create (via `git mv`): `tools/agent-docs/content/guidelines/writing-rules.md` (de `demos/nexora/guidelines/writing-rules.md`)
- Create: `tools/agent-docs/content/guidelines/README.md`
- Create: `demos/nexora/guidelines/writing-rules.md` (remissão)
- Modify: `demos/nexora/guidelines/README.md`

- [ ] **Step 1: Mover `writing-rules.md`**

```bash
git mv demos/nexora/guidelines/writing-rules.md tools/agent-docs/content/guidelines/writing-rules.md
```

- [ ] **Step 2: Atualizar o protocolo de escrita**

Em `tools/agent-docs/content/guidelines/writing-rules.md`:

1. Bloco do formato: entre `Seen in:` e `Check:` acrescentar a linha `Verified in: <the demo test that pins the rule, optional>`.
2. Substituir a frase "`Seen in` is optional for a rule adopted from a published source; every other field is required." por: "`Seen in` and `Verified in` are optional and stay in the source: the build removes both from the published copy. Every other field is required."
3. Acrescentar a seção:

```markdown
## Where a rule lives

A rule about composing screens from the families lives here and ships in
`@slotted/react` and `@slotted/angular`. A rule that holds only for one
product's domain — its permissions, its records, its routes — lives in that
demo's `guidelines/`. One prefix belongs to one place; the content test fails
when a demo declares a prefix this directory declares.

## Check is for the consumer

`Check` is published. It names a step any application can perform — throttle
the network, resize to a size class, read the accessibility tree — or a
property of the markup. It never names a demo panel, a demo route or a demo
test; those go to `Verified in`.
```

4. Na lista "Before a rule enters the index", trocar o item 5 por: "5. `ids.json` gains the id with its level and `active`; `index.md` is generated."
5. Trocar todas as ocorrências de "the Nexora screen" / "a Nexora screen" que descrevem a origem por "a demo screen".

- [ ] **Step 3: Escrever `content/guidelines/README.md` (publicado)**

```markdown
# Guidelines

Rules for composing screens from the Slotted families: what the reference
pages do not state. A family's page states what it is — its parts, states,
tokens and keyboard. It does not state where a pager stands, what a region
shows before its first answer, or which family a bar's search slot is for.

## Reading protocol

For a reader with a task — a person or a model about to write or review a
screen:

1. Read `index.md`: every active rule in one line.
2. Read the topic file whose `triggers` match the task, and `composition.md`
   always.
3. Before writing an element beside a family, read that family's page in
   `{{docsDir}}`.
4. A `MUST` broken is a defect. A `SHOULD` broken is stated with its reason.
   A `MAY` is a permission.
5. A screen is done when each `Check` of the rules read passes.

## Rule identity

An id (`AF-03`) never changes meaning. A rule whose meaning or level changes
is retired, keeps its heading with `Status: retired`, and is rewritten under a
new id. The release notes of each version list the ids added and retired.
```

Comparar com a seção "Reading protocol" de `demos/nexora/guidelines/README.md` (linhas 40 em diante). Cada passo do protocolo da Nexora que não cite a demo entra aqui com o mesmo conteúdo. Um passo que cite a demo fica só na demo.

- [ ] **Step 4: Remissões na demo**

`demos/nexora/guidelines/writing-rules.md`:

```markdown
# Writing a rule

The protocol has one source: `tools/agent-docs/content/guidelines/writing-rules.md`.
A rule in this directory follows it, and holds only for the Nexora domain.
```

Em `demos/nexora/guidelines/README.md`: a tabela "Files" perde as linhas dos tópicos que migram nas Tasks 7–9 (fazer na task correspondente); nesta task, a frase de abertura ganha: "Rules that hold for any application ship in `@slotted/angular/docs/guidelines/` and are read from `node_modules`; this directory keeps the rules of the Nexora domain."

- [ ] **Step 5: Verificar e commitar**

Run: `pnpm test:docs && pnpm exec prettier --check tools/agent-docs/content demos/nexora/guidelines`
Expected: PASS. Em falha de `PUBLISHED_FORBIDDEN` no README publicado, reescrever a frase acusada.

```bash
git add -A tools/agent-docs/content demos/nexora/guidelines
git commit -m "docs(guidelines): o protocolo de escrita passa a ter fonte única em tools/agent-docs/content, com Verified in só na fonte e Check escrito para o consumidor; protocolo de leitura publicado; a demo remete aos dois"
```

Escrever o checkpoint da fatia (próxima ação: Task 7 Step 1).

---

### Task 7: Migração — AF, LA, SC, CP

**Files:**
- Move: `demos/nexora/guidelines/{async-feedback,layout-alignment,shell-composition,composition}.md` → `tools/agent-docs/content/guidelines/`
- Modify: `tools/agent-docs/content/guidelines/ids.json`, `demos/nexora/guidelines/index.md`, `demos/nexora/guidelines/README.md`, `tools/agent-docs/src/references.ts` (só se uma exceção for necessária)

Procedimento por tópico (o mesmo nas Tasks 8 e 9):

- [ ] **Step 1: Mover**

```bash
for t in async-feedback layout-alignment shell-composition composition; do
  git mv demos/nexora/guidelines/$t.md tools/agent-docs/content/guidelines/$t.md
done
```

- [ ] **Step 2: Registrar os IDs**

Para cada `### XX-NN` dos quatro arquivos, acrescentar a `ids.json` `"XX-NN": { "level": "<Level>", "status": "active" }`, ou `"status": "retired"` com `"replacedBy"` para regra aposentada. Gerar a lista com:

```bash
grep -hE '^### |^Level:|^Status:' tools/agent-docs/content/guidelines/{async-feedback,layout-alignment,shell-composition,composition}.md
```

Ordenar as chaves de `ids.json` alfabeticamente.

- [ ] **Step 3: Rodar o gate e ler as falhas**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: FAIL. As falhas listam por arquivo: nomes não resolvidos, padrões de `PUBLISHED_FORBIDDEN` e erros de forma.

- [ ] **Step 4: Reescrever até o gate passar**

Regras de reescrita, em ordem:

1. `Check` com passo da demo ("Set the transport to degraded in the demo panel", "Spec: the banner suite, …") → mover a parte da demo para um campo `Verified in:` novo, antes de `Check`. Em `Check`, escrever o passo equivalente para qualquer aplicação: "Throttle the network to a slow profile", "Resize below the compact size class", "Read the region's `aria-busy`". O conteúdo verificado não muda.
2. Introdução que cita a demo ("The simulated backend answers in 120–650 ms…") → manter só o que vale para qualquer aplicação. Exemplo para AF: "A request answers in tens of milliseconds on a fast network and in seconds on a slow one; a screen that shows nothing for that long reads as a stall, and a screen that shows its empty state reads as an answer."
3. Nome não resolvido que é API de binding (`size="sm"`, `rowHeader: true`, `cellAlign="start"`) → nomear a capacidade pelo eixo ou parte do contrato (`size` `sm`, a parte `row-header`), conforme `writing-rules.md` "Binding-specific API".
4. Nome não resolvido que é rota, permissão ou código de erro da Nexora (`/crm/customers/new`, `customers.credit_view`, `STALE_VERSION`) → descrever em prosa sem crases ("the create route under the list", "a permission that withholds a value", "the backend's stale-version refusal").
5. Trecho CSS de mais de uma declaração ou com `var()`/`calc()` → prosa que nomeia o token e a relação ("offsets from `--slotted-page-sticky-top` plus one space step").
6. Caminho de arquivo da demo (`tools/look.mjs`, `specs/demo-screen-tokens.test.mjs`) → `Verified in`.
7. Só quando nenhum dos itens acima se aplica e o nome é vocabulário legítimo de CSS ou HTML (`minmax(0, 1fr)`, `dd`), acrescentar a `REFERENCE_EXCEPTIONS` com o motivo em uma frase.

Nenhuma reescrita muda `Level` nem o sentido de `Rule`. Uma regra que só passa mudando o sentido fica na demo: mover o arquivo de volta não é permitido; aposentar a regra no pacote (`Status: retired · domain rule, kept by the application that observed it`), com `ids.json` `retired`, e copiar o corpo original para um tópico da demo com prefixo próprio.

Repetir Step 3 até PASS.

- [ ] **Step 5: Atualizar a demo**

- `demos/nexora/guidelines/index.md`: remover as linhas `AF-*`, `LA-*`, `SC-*`, `CP-*`.
- `demos/nexora/guidelines/README.md`: remover as linhas dos quatro tópicos da tabela "Files".
- Listar, sem editar, as referências a esses arquivos fora da demo e do pacote:

```bash
grep -rn "nexora/guidelines/\(async-feedback\|layout-alignment\|shell-composition\|composition\)" --include=*.md . | grep -v node_modules
```

Registrar a saída no checkpoint (campo "known problems"); `.claude/skills/` não é editado.

- [ ] **Step 6: Build e commit**

Run: `pnpm --filter @slotted/react build && pnpm --filter @slotted/agent-docs test && pnpm test:docs && pnpm exec prettier --check tools/agent-docs/content demos/nexora/guidelines`
Expected: PASS; `packages/react/dist/docs/guidelines/` contém `README.md`, `index.md` e os quatro tópicos. Remover a guarda `if (content.topics.length > 0)` do teste de build da Task 4.

```bash
git add -A tools/agent-docs demos/nexora/guidelines
git commit -m "docs(guidelines): AF, LA, SC e CP passam ao pacote — Check reescrito para qualquer aplicação, passos e testes da demo em Verified in, API de binding nomeada pela capacidade; ids.json com as regras migradas"
```

---

### Task 8: Migração — LP, RP, FM

**Files:**
- Move: `demos/nexora/guidelines/{list-pages,record-pages,forms}.md` → `tools/agent-docs/content/guidelines/`
- Modify: `ids.json`, `demos/nexora/guidelines/{index,README}.md`

- [ ] **Step 1: Mover**

```bash
for t in list-pages record-pages forms; do
  git mv demos/nexora/guidelines/$t.md tools/agent-docs/content/guidelines/$t.md
done
```

- [ ] **Step 2: Registrar os IDs** — mesmo comando de Task 7 Step 2 sobre os três arquivos. `LP-07` (ou o ID que o arquivo marca `Status: retired · rewritten as LP-12`) entra com `"status": "retired", "replacedBy": "LP-12"`.

- [ ] **Step 3: Rodar o gate**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: FAIL com a lista do lote.

- [ ] **Step 4: Reescrever até o gate passar** — regras 1–7 da Task 7 Step 4. Pontos conhecidos deste lote, da sondagem de 2026-10-16: `RP` e `FM` têm 10 `Check` com `Spec:`; `FM` cita `name="displayName"`, `fieldErrors`, `contact.firstName`, `customers.credit_view`; `RP` cita `/crm/customers/cus_does_not_exist`; `LP` cita `columnOverflow: 'auto'`, `popin: false`, `pageSize`.

- [ ] **Step 5: Atualizar a demo** — índice e README sem `LP-*`, `RP-*`, `FM-*`; listar referências externas como na Task 7 Step 5.

- [ ] **Step 6: Build e commit**

Run: `pnpm --filter @slotted/react build && pnpm --filter @slotted/agent-docs test && pnpm test:docs && pnpm exec prettier --check tools/agent-docs/content demos/nexora/guidelines`
Expected: PASS.

```bash
git add -A tools/agent-docs demos/nexora/guidelines
git commit -m "docs(guidelines): LP, RP e FM passam ao pacote — rotas, campos e permissões da demo descritos em prosa, testes da demo em Verified in"
```

---

### Task 9: Migração — ER, BR, OV e divisão de PM

**Files:**
- Move: `demos/nexora/guidelines/{errors-and-conflicts,browsing,overviews,reading-permissions}.md` → `tools/agent-docs/content/guidelines/`
- Create: `demos/nexora/guidelines/procurement-costs.md`
- Modify: `ids.json`, `demos/nexora/guidelines/{index,README}.md`

- [ ] **Step 1: Mover**

```bash
for t in errors-and-conflicts browsing overviews reading-permissions; do
  git mv demos/nexora/guidelines/$t.md tools/agent-docs/content/guidelines/$t.md
done
```

- [ ] **Step 2: Dividir PM**

1. Criar `demos/nexora/guidelines/procurement-costs.md` com frontmatter `topic: procurement costs`, `prefix: PC`, `triggers: [cost, price, supplier, purchase order, receipt, spend]`, `families: [data-grid, stat-card, table]`, título `# Procurement costs`, uma frase de introdução ("What a procurement screen reads under the cost permission."), e a regra `### PC-01 · A price paid is a cost` com o corpo de `PM-03` sem alteração, mais `Seen in` original.
2. Em `tools/agent-docs/content/guidelines/reading-permissions.md`, `PM-03` vira:

```markdown
### PM-03 · A price paid is a cost

Status: retired · a domain rule, kept by the application that observed it
```

3. Retirar de `reading-permissions.md` os `triggers` e `families` que só `PM-03` usava (`cost`, `price`, `pricing` se não aparecem em PM-01/PM-02).
4. `ids.json`: `PM-01`, `PM-02` ativos com seus níveis; `"PM-03": { "level": "MUST", "status": "retired" }`.
5. Na demo, `grep -rn "PM-03" demos/nexora --exclude-dir=node_modules` e trocar cada citação por `PC-01`.

- [ ] **Step 3: Registrar os IDs de ER, BR, OV** — comando da Task 7 Step 2.

- [ ] **Step 4: Rodar o gate e reescrever até passar** — regras da Task 7 Step 4. Pontos conhecidos: `ER` tem 3 `Check` com `Spec:` e cita `ORDER_ALREADY_CANCELLED`, `APPROVAL_ALREADY_DECIDED`, `INVENTORY_CHANGED`, `record.metadata.version`; `OV` cita `/automations/workflows/wfl_000001?edit=1`.

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: PASS ao fim.

- [ ] **Step 5: Atualizar a demo** — `index.md` contém só `PC-01`, `LG-*`, `CV-*`, `WS-*`, `BD-*` e uma linha inicial: "Rules for any application: `node_modules/@slotted/angular/docs/guidelines/index.md`." `README.md`: tabela "Files" com `procurement-costs.md`, `ledgers.md`, `conversations.md`, `workspaces.md`, `builders.md`, `index.md`, `writing-rules.md`.

- [ ] **Step 6: Build, verificação e commit**

Run: `pnpm --filter @slotted/react build && pnpm --filter @slotted/angular build && pnpm --filter @slotted/agent-docs test && pnpm test:docs && pnpm exec prettier --check tools/agent-docs/content demos/nexora/guidelines`
Expected: PASS; `ls demos/nexora/guidelines` lista só `README.md`, `index.md`, `writing-rules.md` e os cinco tópicos de domínio.

```bash
git add -A tools/agent-docs demos/nexora/guidelines
git commit -m "docs(guidelines): ER, BR, OV e PM passam ao pacote; PM-03 aposentada no pacote e reescrita na Nexora como PC-01, regra de domínio de compras; a demo guarda só as regras do seu domínio"
```

Escrever o checkpoint da fatia (próxima ação: Task 10 Step 1).

---

### Task 10: Skill `waiting-states`

**Files:**
- Create: `tools/agent-docs/content/skills/waiting-states/SKILL.md`
- Modify: `tools/agent-docs/src/agents-snippet.react.md`, `tools/agent-docs/src/agents-snippet.angular.md`

- [ ] **Step 1: Escrever a tabela de tarefas no snippet (o gate de Task 5 passa a exigir a skill)**

Acrescentar ao fim dos dois templates:

```markdown

### Tasks

| Task | Read first |
| --- | --- |
| Show what a screen draws while it waits, and its empty and error states | `{{docsDir}}/skills/waiting-states/SKILL.md` |
```

- [ ] **Step 2: Escrever a skill**

Ponto de partida: `.claude/skills/loading-states/SKILL.md` (lido, não alterado). Estrutura obrigatória:

```markdown
---
name: waiting-states
description: Use when building or reviewing anything a person waits in front of in an application built with {{package}} — a skeleton, a spinner, a progress bar, a loading overlay, a control's own loading state, or the empty and error states beside them. Decides which indicator answers which wait and how a skeleton is built from the anatomy it stands in for.
---

# Waiting states
```

Seções, nesta ordem, com o conteúdo das seções 1–8 da origem: "1. Which indicator answers which wait", "2. The skeleton is the anatomy, not a rectangle", "3. The test: nothing moves", "4. Timing", "5. Announcement and focus", "6. Motion", "7. Pending, empty and error are three states", "8. Before calling a wait done".

Transformações sobre a origem:

1. Remover todo caminho de `demos/`, `packages/`, `apps/` e toda menção ao processo do repositório (testes da biblioteca, `/component`, Storybook).
2. Cada família citada entre crases (`skeleton`, `loading-overlay`, `progress-indicator`, `spinner`, `result-state`) ganha, na primeira citação, a instrução "its page: `{{docsDir}}/<family>.md`".
3. Onde a origem repete o texto de uma regra AF, substituir pela citação do ID (`AF-01`…`AF-07`) e uma frase do que ela decide.
4. Vocabulário de `writing-rules.md`: `pending`, `busy`, `empty`, `placeholder`, `waits`, `region`.
5. A seção 8 termina com: "Each `Check` of AF-01 to AF-07 passes."

- [ ] **Step 3: Rodar o gate**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: PASS. Falha de nome não resolvido → regras 3–7 da Task 7 Step 4; falha de `PUBLISHED_FORBIDDEN` → reescrever a frase.

- [ ] **Step 4: Build e orçamento**

Run: `pnpm --filter @slotted/react build && pnpm --filter @slotted/angular build && wc -c packages/react/dist/docs/AGENTS.snippet.md packages/react/dist/docs/index.md`
Expected: build sem `BudgetError`; snippet < 2048 bytes; index < 8192 bytes.

- [ ] **Step 5: Commit**

```bash
git add tools/agent-docs/content/skills tools/agent-docs/src/agents-snippet.react.md tools/agent-docs/src/agents-snippet.angular.md
git commit -m "feat(agent-docs): skill de produto waiting-states — indicador por espera, skeleton como anatomia, temporização, anúncio, pendente, vazio e erro; cita AF-01 a AF-07 e as páginas das famílias; o snippet a nomeia"
```

---

### Task 11: Skill `compose-screen`

**Files:**
- Create: `tools/agent-docs/content/skills/compose-screen/SKILL.md`
- Modify: os dois `agents-snippet.*.md`

- [ ] **Step 1: Linha no snippet**

Na tabela "Tasks" dos dois templates, antes da linha de `waiting-states`:

```markdown
| Compose or change a screen: a list, a record, a form, an overview | `{{docsDir}}/skills/compose-screen/SKILL.md` |
```

- [ ] **Step 2: Escrever a skill**

```markdown
---
name: compose-screen
description: Use when writing or changing a screen of an application built with {{package}} — a list of records, the page of one record, a form that writes one, an overview, or a tree beside a list. Applies the Slotted guidelines in order and ends with each Check of the rules read.
---

# Compose a screen

A screen is composed from the families' own parts first. An element of the
screen's own exists only where no family names a place for it.

## 1. Classify the screen

| The screen | Topic |
| --- | --- |
| Lists records, searches, filters, pages | `list-pages.md` |
| Shows one record, its figures and its related records | `record-pages.md` |
| Creates or edits a record | `forms.md` |
| Summarises a domain in figures and charts | `overviews.md` |
| Places a list beside a tree of its places | `browsing.md` |

A screen can be two of these: a record with an edit form in place reads both
topics.

## 2. Read

1. `{{docsDir}}/guidelines/index.md`.
2. `{{docsDir}}/guidelines/composition.md`, always.
3. The topic of step 1, and `layout-alignment.md` and `shell-composition.md`
   when the screen places controls in a row or in the application frame.
4. `errors-and-conflicts.md` and `reading-permissions.md` when the screen
   writes data or reads under a role.

## 3. Read each family before writing beside it

For each family the screen uses, read `{{docsDir}}/<family>.md` — its
anatomy, its slots, its axes (CP-01). A slot the family names for an element
is where that element stands.

## 4. Compose

- Siblings of the screen's own stand in `inline` or `stack` with a space-scale
  gap; text of the screen's own takes the `text` family's size (CP-02).
- An element of the screen's own paints only with theme tokens; a literal
  colour, type size or gap is a defect (CP-05).
- A state a family already draws is stated once (CP-06).
- The page width follows the screen: a list `bleed` with `fill`; records and
  overviews `wide`; forms `content` (CP-07).
- Where no anatomy answers the problem, compose an element of the screen's own
  instead of bending a family (CP-04).

## 5. Waits

Every region filled by a request and every control that starts one:
`{{docsDir}}/skills/waiting-states/SKILL.md`.

## 6. Done

1. Each `MUST` rule of the topics read: its `Check` passes.
2. Each `SHOULD` rule not followed is listed with its reason.
3. No CSS of the screen's own targets a family's parts
   (`[data-part]`); appearance changes through the family's axes.
```

Antes de commitar, conferir em `composition.md` (já no pacote) o texto de `CP-02`, `CP-04` a `CP-07` e alinhar as frases do passo 4. Conferir também que `text`, `inline`, `stack`, `bleed`, `fill`, `wide`, `content` resolvem no catálogo; um nome de família inexistente (por exemplo, se a família de tipografia não se chama `text`) é substituído pelo nome do contrato.

- [ ] **Step 3: Rodar o gate, o build e o orçamento**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts && pnpm --filter @slotted/react build && pnpm --filter @slotted/angular build && wc -c packages/react/dist/docs/AGENTS.snippet.md packages/angular/dist/docs/AGENTS.snippet.md`
Expected: PASS; snippets < 2048 bytes.

- [ ] **Step 4: Commit**

```bash
git add tools/agent-docs/content/skills/compose-screen tools/agent-docs/src/agents-snippet.react.md tools/agent-docs/src/agents-snippet.angular.md
git commit -m "feat(agent-docs): skill de produto compose-screen — classificar a tela, ler índice, composition e o tópico, ler cada família antes de escrever ao lado dela, compor com tokens e slots, delegar esperas a waiting-states, concluir pelos Check"
```

---

### Task 12: Site — rotas, `llms.txt` e README dos pacotes

**Files:**
- Modify: `apps/docs/src/lib/agent-docs.ts`, `apps/docs/src/pages/llms.txt.ts`, `apps/docs/scripts/agent-outputs.test.mjs`
- Create: `apps/docs/src/pages/[framework]/guidelines/[page].md.ts`, `apps/docs/src/pages/[framework]/skills/[skill]/SKILL.md.ts`
- Modify: `packages/react/README.md`, `packages/angular/README.md`

- [ ] **Step 1: Teste do site**

Em `apps/docs/scripts/agent-outputs.test.mjs`, acrescentar:

```js
const guidelinePages = (binding) =>
  readdirSync(`${packageDocs[binding]}guidelines`).filter((file) => file.endsWith('.md'));
const skillNames = (binding) => readdirSync(`${packageDocs[binding]}skills`);

test('every guideline page and skill is served per binding, as the package ships it', () => {
  for (const binding of ['react', 'angular']) {
    for (const file of guidelinePages(binding))
      assert.equal(
        readFileSync(`${dist}${binding}/guidelines/${file}`, 'utf8'),
        readFileSync(`${packageDocs[binding]}guidelines/${file}`, 'utf8'),
        `${binding}/guidelines/${file}`,
      );
    for (const skill of skillNames(binding))
      assert.equal(
        readFileSync(`${dist}${binding}/skills/${skill}/SKILL.md`, 'utf8'),
        readFileSync(`${packageDocs[binding]}skills/${skill}/SKILL.md`, 'utf8'),
        `${binding}/skills/${skill}`,
      );
  }
});
```

e trocar, no teste de `llms.txt`, `assert.equal(hrefs.length, families.length * 2);` por:

```js
  const expected = ['react', 'angular'].reduce(
    (sum, binding) => sum + families.length + guidelinePages(binding).length + skillNames(binding).length,
    0,
  );
  assert.equal(hrefs.length, expected);
```

(mover `guidelinePages` e `skillNames` para antes do teste de `llms.txt`).

- [ ] **Step 2: Implementar**

Em `apps/docs/src/lib/agent-docs.ts`:

```ts
/** The guideline pages a binding ships: `guidelines/*.md`. */
export function agentGuidelines(binding: AgentBinding): string[] {
  const dir = resolve(docsDir(binding), 'guidelines');
  return existsSync(dir)
    ? readdirSync(dir).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -'.md'.length)).sort()
    : [];
}

export function agentGuideline(binding: AgentBinding, page: string): string {
  return readFileSync(resolve(docsDir(binding), 'guidelines', `${page}.md`), 'utf8');
}

/** The product skills a binding ships: `skills/<name>/SKILL.md`. */
export function agentSkills(binding: AgentBinding): string[] {
  const dir = resolve(docsDir(binding), 'skills');
  return existsSync(dir) ? readdirSync(dir).sort() : [];
}

export function agentSkill(binding: AgentBinding, skill: string): string {
  return readFileSync(resolve(docsDir(binding), 'skills', skill, 'SKILL.md'), 'utf8');
}
```

`apps/docs/src/pages/[framework]/guidelines/[page].md.ts`:

```ts
import type { APIRoute, GetStaticPaths } from 'astro';

import { AGENT_BINDINGS, agentGuideline, agentGuidelines, type AgentBinding } from '../../../lib/agent-docs';

/** Each guideline page of both bindings, as the package ships it. */
export const getStaticPaths = (() =>
  AGENT_BINDINGS.flatMap((framework) =>
    agentGuidelines(framework).map((page) => ({ params: { framework, page } })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(agentGuideline(params['framework'] as AgentBinding, params['page'] as string), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
```

`apps/docs/src/pages/[framework]/skills/[skill]/SKILL.md.ts`:

```ts
import type { APIRoute, GetStaticPaths } from 'astro';

import { AGENT_BINDINGS, agentSkill, agentSkills, type AgentBinding } from '../../../../lib/agent-docs';

/** Each product skill of both bindings, as the package ships it. */
export const getStaticPaths = (() =>
  AGENT_BINDINGS.flatMap((framework) =>
    agentSkills(framework).map((skill) => ({ params: { framework, skill } })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(agentSkill(params['framework'] as AgentBinding, params['skill'] as string), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
```

Em `llms.txt.ts`, dentro do laço por binding, depois da lista de componentes:

```ts
    lines.push(`## ${AGENT_BINDING_LABELS[binding]} guidelines`, '');
    for (const page of agentGuidelines(binding))
      lines.push(`- [${page}](/${binding}/guidelines/${page}.md)`);
    lines.push('', `## ${AGENT_BINDING_LABELS[binding]} skills`, '');
    for (const skill of agentSkills(binding))
      lines.push(`- [${skill}](/${binding}/skills/${skill}/SKILL.md)`);
    lines.push('');
```

com `agentGuidelines` e `agentSkills` no import.

- [ ] **Step 3: README dos pacotes**

Acrescentar a `packages/react/README.md` e `packages/angular/README.md`, antes de `## License`:

```markdown
## Agents

`dist/docs/AGENTS.snippet.md` (React) / `docs/AGENTS.snippet.md` (Angular) is the section an application adds to the instructions its coding agent reads: `AGENTS.md`, or `CLAUDE.md` for Claude Code, directly or through `@AGENTS.md`. It points the agent at the family pages, the guidelines and the skills of the installed version.
```

Em cada README, manter só a frase do próprio binding (React: `dist/docs/AGENTS.snippet.md`; Angular: `docs/AGENTS.snippet.md`).

- [ ] **Step 4: Verificar**

Run: `pnpm --filter @slotted/docs verify`
Expected: PASS (inclui `astro build` e `test:outputs`).

- [ ] **Step 5: Commit e checkpoint**

```bash
git add apps/docs packages/react/README.md packages/angular/README.md
git commit -m "feat(docs): o site serve guidelines e skills de cada binding como o pacote os publica, e llms.txt os lista; os README dos bindings dizem onde o snippet entra"
```

Checkpoint da fatia (próxima ação: Task 13 Step 1).

---

### Task 13: Nexora como consumidora e documentação do repositório

**Files:**
- Create: `demos/nexora/angular/AGENTS.md`, `demos/nexora/angular/CLAUDE.md`
- Modify: `tools/agent-docs/src/content.test.ts`, `demos/nexora/README.md`, `AGENTS.md`, `docs/README.md`

- [ ] **Step 1: Teste**

Em `content.test.ts`, no `describe('skills')`:

```ts
  it('the Nexora instructions carry the Angular snippet as published', () => {
    const agents = readFileSync(join(root, 'demos/nexora/angular/AGENTS.md'), 'utf8');
    expect(agents).toContain(renderAgentsSnippet('angular'));
  });
```

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: FAIL — `ENOENT`.

- [ ] **Step 2: Arquivos da demo**

`demos/nexora/angular/AGENTS.md`: o conteúdo exato de `packages/angular/dist/docs/AGENTS.snippet.md` (após `pnpm --filter @slotted/angular build`), seguido de:

```markdown

## Nexora domain rules

`../guidelines/index.md` holds the rules of the Nexora domain; they apply with the library's.
```

`demos/nexora/angular/CLAUDE.md`:

```markdown
@AGENTS.md
```

Run: o teste do Step 1. Expected: PASS.

- [ ] **Step 3: Documentação do repositório**

- `demos/nexora/README.md`, linha de `guidelines/`: "Rules of the Nexora domain. Rules for any application ship in the package (`tools/agent-docs/content/guidelines/`)."
- `AGENTS.md`, seção "Layout", acrescentar uma frase: "Agent material published to consumers — guidelines and product skills — has its source in `tools/agent-docs/content/`; `.claude/skills/` holds the repository's own development skills. A release that changes `tools/agent-docs/content/` runs `pnpm eval:agent-docs` first and commits the report in `docs/history/evals/`."
- `docs/README.md`, na tabela de `history/`: acrescentar `history/evals/` — "Resultado de cada rodada de `pnpm eval:agent-docs`."

- [ ] **Step 4: Verificar e commitar**

Run: `pnpm test:docs && pnpm exec prettier --check AGENTS.md docs/README.md demos/nexora`
Expected: PASS.

```bash
git add demos/nexora AGENTS.md docs/README.md tools/agent-docs/src/content.test.ts
git commit -m "docs(nexora): a demo lê as instruções de agente como um consumidor — AGENTS.md com o snippet publicado e as regras do domínio, CLAUDE.md importa-o; AGENTS.md e docs/README dizem onde vive o material de agente do produto"
```

---

### Task 14: Bloco "Guidelines" no changelog

**Files:**
- Modify: `scripts/release.mjs`, `scripts/release.test.mjs`

**Interfaces:**
- Produces: `guidelineChanges(previous: Record<string, {status, replacedBy?}>, current: same): string[]`; `changelogEntry(version, date, subjects, guidelines = [])`.

- [ ] **Step 1: Testes**

Em `scripts/release.test.mjs`, importar `guidelineChanges` e acrescentar:

```js
test('lists the guideline ids a release adds, retires and rewrites', () => {
  const previous = {
    'AF-01': { level: 'MUST', status: 'active' },
    'LP-07': { level: 'SHOULD', status: 'active' },
    'PM-03': { level: 'MUST', status: 'active' },
  };
  const current = {
    'AF-01': { level: 'MUST', status: 'active' },
    'AF-08': { level: 'SHOULD', status: 'active' },
    'LP-07': { level: 'SHOULD', status: 'retired', replacedBy: 'LP-12' },
    'LP-12': { level: 'SHOULD', status: 'active' },
    'PM-03': { level: 'MUST', status: 'retired' },
  };
  assert.deepEqual(guidelineChanges(previous, current), [
    '- Added: AF-08',
    '- Retired: PM-03',
    '- Rewritten: LP-07 → LP-12',
  ]);
  assert.deepEqual(guidelineChanges(current, current), []);
});

test('the first release with ids.json lists its active rules as added, and no retired one', () => {
  const current = {
    'AF-01': { level: 'MUST', status: 'active' },
    'LP-07': { level: 'SHOULD', status: 'retired', replacedBy: 'LP-12' },
    'LP-12': { level: 'SHOULD', status: 'active' },
  };
  assert.deepEqual(guidelineChanges({}, current), ['- Added: AF-01, LP-12']);
});

test('an entry carries the guideline block when there is one', () => {
  assert.equal(
    changelogEntry('0.1.0-beta.2', '2026-10-20', ['feat(x): y'], ['- Added: AF-08']),
    ['## 0.1.0-beta.2 — 2026-10-20', '', '- feat(x): y', '', '### Guidelines', '', '- Added: AF-08', ''].join('\n'),
  );
});
```

Run: `pnpm test:release`
Expected: FAIL — `guidelineChanges` não exportado.

- [ ] **Step 2: Implementar**

```js
/** The guideline ids a release adds, retires and rewrites, read from two `ids.json`. */
export function guidelineChanges(previous, current) {
  // Only a rule released as active can be retired or rewritten in a release.
  const newlyRetired = Object.keys(current)
    .filter((id) => current[id].status === 'retired' && previous[id]?.status === 'active')
    .sort();
  const retired = newlyRetired.filter((id) => current[id].replacedBy === undefined);
  const rewritten = newlyRetired.filter((id) => current[id].replacedBy !== undefined);
  const replacements = new Set(rewritten.map((id) => current[id].replacedBy));
  const added = Object.keys(current)
    .filter((id) => current[id].status === 'active' && previous[id] === undefined && !replacements.has(id))
    .sort();
  const lines = [];
  if (added.length > 0) lines.push(`- Added: ${added.join(', ')}`);
  if (retired.length > 0) lines.push(`- Retired: ${retired.join(', ')}`);
  if (rewritten.length > 0)
    lines.push(`- Rewritten: ${rewritten.map((id) => `${id} → ${current[id].replacedBy}`).join(', ')}`);
  return lines;
}

export function changelogEntry(version, date, subjects, guidelines = []) {
  const lines = subjects
    .filter((subject) => !BOOKKEEPING.some((pattern) => pattern.test(subject)))
    .map((subject) => `- ${subject.split(' — ')[0].trim()}`);
  const block = guidelines.length > 0 ? ['', '### Guidelines', '', ...guidelines] : [];
  return [`## ${version} — ${date}`, '', ...lines, ...block, ''].join('\n');
}
```

Em `prepare`, depois do cálculo de `subjects`:

```js
  const idsPath = 'tools/agent-docs/content/guidelines/ids.json';
  const before = spawnSync('git', ['show', `${previous}:${idsPath}`], { cwd: repositoryRoot, encoding: 'utf8' });
  const guidelines = guidelineChanges(
    before.status === 0 ? JSON.parse(before.stdout) : {},
    JSON.parse(readFileSync(join(repositoryRoot, idsPath), 'utf8')),
  );
  const entry = changelogEntry(version, new Date().toISOString().slice(0, 10), subjects, guidelines);
```

substituindo a linha `const entry = …` existente.

- [ ] **Step 3: Verificar e commitar**

Run: `pnpm test:release && pnpm release --dry-run 2>&1 | tail -20`
Expected: testes PASS. O dry-run imprime a entrada com `### Guidelines` e `- Added:` listando todas as regras migradas, porque `ids.json` não existe na tag atual. Se `pnpm release` não aceitar `--dry-run`, ler o cabeçalho de `scripts/release.mjs` para a flag de ensaio e usar essa.

```bash
git add scripts/release.mjs scripts/release.test.mjs
git commit -m "feat(release): a entrada do changelog lista as regras de guideline adicionadas, aposentadas e reescritas, pelo diff de ids.json contra a tag anterior"
```

---

### Task 15: Avaliação de eficácia — núcleo testável

**Files:**
- Create: `tools/agent-docs/src/eval/stream.ts`, `tools/agent-docs/src/eval/assertions.ts`, `tools/agent-docs/src/eval/summary.ts`, `tools/agent-docs/src/eval/eval.test.ts`

**Interfaces:**
- Produces:
  - `interface SessionTrace { readPaths: string[]; inputTokens: number; outputTokens: number; costUsd: number; isError: boolean }`
  - `parseStream(lines: readonly string[]): SessionTrace`
  - `triggered(trace: SessionTrace, skill: string): boolean`
  - `type Assertion = { kind: 'uses-family'; family: string } | { kind: 'no-literal' } | { kind: 'mentions'; pattern: string }`
  - `assertionPasses(assertion: Assertion, binding: Binding, files: ReadonlyMap<string, string>): boolean`
  - `interface RunResult { caseId: string; binding: Binding; skill: string; condition: 'with' | 'without'; triggered: boolean; passed: number; total: number; trace: SessionTrace }`
  - `summarize(results: readonly RunResult[]): SkillSummary[]` com `interface SkillSummary { skill: string; condition: 'with' | 'without'; runs: number; triggerRate: number; conformance: number; costUsd: number }`
  - `renderReport(date: string, model: string, summaries: readonly SkillSummary[]): string`
  - `const THRESHOLDS = { trigger: 0.9, conformance: 0.85 }`

- [ ] **Step 1: Testes**

```ts
import { describe, expect, it } from 'vitest';

import { assertionPasses } from './assertions.ts';
import { parseStream, triggered } from './stream.ts';
import { renderReport, summarize, type RunResult } from './summary.ts';

const stream = [
  JSON.stringify({ type: 'system', subtype: 'init' }),
  JSON.stringify({
    type: 'assistant',
    message: { content: [{ type: 'tool_use', name: 'Read', input: { file_path: '/tmp/x/node_modules/@slotted/react/dist/docs/skills/waiting-states/SKILL.md' } }] },
  }),
  JSON.stringify({
    type: 'assistant',
    message: { content: [{ type: 'tool_use', name: 'Bash', input: { command: 'cat node_modules/@slotted/react/dist/docs/skeleton.md' } }] },
  }),
  JSON.stringify({ type: 'result', is_error: false, total_cost_usd: 0.42, usage: { input_tokens: 1000, output_tokens: 200 } }),
  'not json',
];

describe('parseStream', () => {
  it('collects the paths each tool call read, the usage and the cost', () => {
    const trace = parseStream(stream);
    expect(trace.readPaths).toEqual([
      '/tmp/x/node_modules/@slotted/react/dist/docs/skills/waiting-states/SKILL.md',
      'cat node_modules/@slotted/react/dist/docs/skeleton.md',
    ]);
    expect(trace).toMatchObject({ inputTokens: 1000, outputTokens: 200, costUsd: 0.42, isError: false });
    expect(triggered(trace, 'waiting-states')).toBe(true);
    expect(triggered(trace, 'compose-screen')).toBe(false);
  });
});

describe('assertionPasses', () => {
  const react = new Map([['src/Orders.tsx', "import { DataGrid } from '@slotted/react';\nexport const O = () => <DataGrid style={{ color: '#fff' }} />;"]]);
  const angular = new Map([['src/orders.ts', "import { SlDataGrid } from '@slotted/angular/data-grid';"]]);

  it('uses-family reads the JSX tag in React and the entry point in Angular', () => {
    expect(assertionPasses({ kind: 'uses-family', family: 'data-grid' }, 'react', react)).toBe(true);
    expect(assertionPasses({ kind: 'uses-family', family: 'data-grid' }, 'angular', angular)).toBe(true);
    expect(assertionPasses({ kind: 'uses-family', family: 'skeleton' }, 'react', react)).toBe(false);
  });

  it('no-literal fails on a hex colour, and passes on 0px and 1px', () => {
    expect(assertionPasses({ kind: 'no-literal' }, 'react', react)).toBe(false);
    expect(assertionPasses({ kind: 'no-literal' }, 'react', new Map([['a.css', 'a { border: 1px solid var(--slotted-border); margin: 0px; }']]))).toBe(true);
    expect(assertionPasses({ kind: 'no-literal' }, 'react', new Map([['a.css', 'a { gap: 12px; }']]))).toBe(false);
  });

  it('mentions matches a pattern in any file', () => {
    expect(assertionPasses({ kind: 'mentions', pattern: 'aria-busy|data-loading' }, 'react', new Map([['a.tsx', '<div aria-busy="true" />']]))).toBe(true);
  });
});

describe('summarize and renderReport', () => {
  it('rates trigger and conformance per skill and condition, and states the threshold verdict', () => {
    const base = { binding: 'react' as const, skill: 'waiting-states', trace: { readPaths: [], inputTokens: 0, outputTokens: 0, costUsd: 0.5, isError: false } };
    const results: RunResult[] = [
      { ...base, caseId: 'a', condition: 'with', triggered: true, passed: 3, total: 3 },
      { ...base, caseId: 'a', condition: 'with', triggered: false, passed: 1, total: 3 },
      { ...base, caseId: 'a', condition: 'without', triggered: false, passed: 1, total: 3 },
    ];
    const summaries = summarize(results);
    expect(summaries).toEqual([
      { skill: 'waiting-states', condition: 'with', runs: 2, triggerRate: 0.5, conformance: 4 / 6, costUsd: 1 },
      { skill: 'waiting-states', condition: 'without', runs: 1, triggerRate: 0, conformance: 1 / 3, costUsd: 0.5 },
    ]);
    const report = renderReport('2026-10-20', 'claude-sonnet-5-5', summaries);
    expect(report).toContain('| waiting-states | 2 | 0.50 | 0.67 | 0.00 | 0.33 | 1.50 | abaixo |');
  });
});
```

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/eval/eval.test.ts`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 2: Implementar `stream.ts`**

```ts
/** One `claude -p --output-format stream-json` session, reduced to what the evaluation reads. */
export interface SessionTrace {
  readPaths: string[];
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  isError: boolean;
}

interface ToolUse {
  type: string;
  input?: Record<string, unknown>;
}

export function parseStream(lines: readonly string[]): SessionTrace {
  const trace: SessionTrace = { readPaths: [], inputTokens: 0, outputTokens: 0, costUsd: 0, isError: false };
  for (const line of lines) {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (event['type'] === 'assistant') {
      const content = ((event['message'] as { content?: ToolUse[] }) ?? {}).content ?? [];
      for (const block of content) {
        if (block.type !== 'tool_use' || block.input === undefined) continue;
        const target = block.input['file_path'] ?? block.input['path'] ?? block.input['command'] ?? block.input['pattern'];
        if (typeof target === 'string') trace.readPaths.push(target);
      }
    }
    if (event['type'] === 'result') {
      const usage = (event['usage'] as { input_tokens?: number; output_tokens?: number }) ?? {};
      trace.inputTokens = usage.input_tokens ?? 0;
      trace.outputTokens = usage.output_tokens ?? 0;
      trace.costUsd = Number(event['total_cost_usd'] ?? 0);
      trace.isError = event['is_error'] === true;
    }
  }
  return trace;
}

export function triggered(trace: SessionTrace, skill: string): boolean {
  return trace.readPaths.some((path) => path.includes(`skills/${skill}/SKILL.md`));
}
```

- [ ] **Step 3: Implementar `assertions.ts`**

```ts
import type { Binding } from '../types.ts';

export type Assertion =
  | { kind: 'uses-family'; family: string }
  | { kind: 'no-literal' }
  | { kind: 'mentions'; pattern: string };

/** Lengths the library itself writes as literals (`specs/demo-screen-tokens.test.mjs`). */
const ALLOWED_PX = new Set(['0px', '1px', '0.5px']);

function pascal(family: string): string {
  return family.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase());
}

export function assertionPasses(assertion: Assertion, binding: Binding, files: ReadonlyMap<string, string>): boolean {
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
  }
}
```

- [ ] **Step 4: Implementar `summary.ts`**

```ts
import type { Binding } from '../types.ts';
import type { SessionTrace } from './stream.ts';

export const THRESHOLDS = { trigger: 0.9, conformance: 0.85 } as const;

export interface RunResult {
  caseId: string;
  binding: Binding;
  skill: string;
  condition: 'with' | 'without';
  triggered: boolean;
  passed: number;
  total: number;
  trace: SessionTrace;
}

export interface SkillSummary {
  skill: string;
  condition: 'with' | 'without';
  runs: number;
  triggerRate: number;
  conformance: number;
  costUsd: number;
}

export function summarize(results: readonly RunResult[]): SkillSummary[] {
  const groups = new Map<string, RunResult[]>();
  for (const result of results) {
    const key = `${result.skill}\u0000${result.condition}`;
    groups.set(key, [...(groups.get(key) ?? []), result]);
  }
  return [...groups]
    .map(([key, runs]) => {
      const [skill, condition] = key.split('\u0000') as [string, 'with' | 'without'];
      const total = runs.reduce((sum, run) => sum + run.total, 0);
      return {
        skill,
        condition,
        runs: runs.length,
        triggerRate: runs.filter((run) => run.triggered).length / runs.length,
        conformance: total === 0 ? 0 : runs.reduce((sum, run) => sum + run.passed, 0) / total,
        costUsd: runs.reduce((sum, run) => sum + run.trace.costUsd, 0),
      };
    })
    .sort((a, b) => a.skill.localeCompare(b.skill) || (a.condition === 'with' ? -1 : 1));
}

export function renderReport(date: string, model: string, summaries: readonly SkillSummary[]): string {
  const lines = [
    `# Avaliação do material de agente — ${date}`,
    '',
    `Modelo: \`${model}\`. Limiares: disparo ≥ ${THRESHOLDS.trigger}, conformidade ≥ ${THRESHOLDS.conformance}.`,
    '',
    '| Skill | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const skill of [...new Set(summaries.map((summary) => summary.skill))]) {
    const withSnippet = summaries.find((s) => s.skill === skill && s.condition === 'with');
    const without = summaries.find((s) => s.skill === skill && s.condition === 'without');
    const cost = (withSnippet?.costUsd ?? 0) + (without?.costUsd ?? 0);
    const meets =
      withSnippet !== undefined &&
      withSnippet.triggerRate >= THRESHOLDS.trigger &&
      withSnippet.conformance >= THRESHOLDS.conformance;
    lines.push(
      `| ${skill} | ${withSnippet?.runs ?? 0} | ${(withSnippet?.triggerRate ?? 0).toFixed(2)} | ${(withSnippet?.conformance ?? 0).toFixed(2)} | ${(without?.triggerRate ?? 0).toFixed(2)} | ${(without?.conformance ?? 0).toFixed(2)} | ${cost.toFixed(2)} | ${meets ? 'atende' : 'abaixo'} |`,
    );
  }
  return `${lines.join('\n')}\n`;
}
```

- [ ] **Step 5: Rodar e commitar**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/eval/eval.test.ts && pnpm --filter @slotted/agent-docs typecheck`
Expected: PASS.

```bash
git add tools/agent-docs/src/eval
git commit -m "feat(agent-docs): núcleo da avaliação de eficácia — leitura do stream-json do claude -p, disparo por leitura do SKILL.md, asserções estáticas sobre o código gerado, resumo por skill e condição com os limiares"
```

Checkpoint da fatia (próxima ação: Task 16 Step 1).

---

### Task 16: Avaliação de eficácia — casos, fixtures, executor

**Files:**
- Create: `tools/agent-docs/eval/cases.json`, `tools/agent-docs/eval/fixtures/react/package.json`, `tools/agent-docs/eval/fixtures/react/src/main.tsx`, `tools/agent-docs/eval/fixtures/angular/package.json`, `tools/agent-docs/eval/fixtures/angular/src/main.ts`, `tools/agent-docs/bin/eval.mjs`
- Modify: `package.json` (raiz, script `eval:agent-docs`), `tools/agent-docs/tsconfig.json` (nada: `bin` já incluído)

- [ ] **Step 1: `cases.json`**

```json
{
  "model": "claude-sonnet-5-5",
  "runs": 3,
  "bindings": ["react", "angular"],
  "cases": [
    {
      "id": "orders-list",
      "skill": "compose-screen",
      "prompt": "Write the orders list screen in src/: a searchable, filterable, paged list of orders (number, customer, status, total, date) read from fetchOrders(query) in src/api.ts, which you also write as a stub returning a Promise.",
      "assertions": [{ "kind": "uses-family", "family": "data-grid" }, { "kind": "uses-family", "family": "filter-bar" }, { "kind": "uses-family", "family": "pagination" }, { "kind": "no-literal" }]
    },
    {
      "id": "customer-record",
      "skill": "compose-screen",
      "prompt": "Write the page of one customer in src/: its name, status, three figures (open orders, lifetime revenue, overdue balance) and two related lists, orders and activity, read from fetchCustomer(id) in src/api.ts, which you also write as a stub.",
      "assertions": [{ "kind": "uses-family", "family": "page-header" }, { "kind": "uses-family", "family": "stat-card" }, { "kind": "uses-family", "family": "tabs" }, { "kind": "no-literal" }]
    },
    {
      "id": "customer-form",
      "skill": "compose-screen",
      "prompt": "Write the create-customer form in src/: name, email, phone, credit limit; submit calls createCustomer(input) in src/api.ts, a stub that can reject with field errors keyed by field name.",
      "assertions": [{ "kind": "uses-family", "family": "form" }, { "kind": "uses-family", "family": "field" }, { "kind": "mentions", "pattern": "loading" }, { "kind": "no-literal" }]
    },
    {
      "id": "sales-overview",
      "skill": "compose-screen",
      "prompt": "Write a sales overview screen in src/: four figures for this month and a chart of revenue per week, read from fetchOverview() in src/api.ts, a stub.",
      "assertions": [{ "kind": "uses-family", "family": "stat-card" }, { "kind": "uses-family", "family": "chart" }, { "kind": "no-literal" }]
    },
    {
      "id": "metrics-card-loading",
      "skill": "waiting-states",
      "prompt": "In src/, write a card that shows three metrics read from fetchMetrics() in src/api.ts (a stub that resolves after two seconds). Show what the card draws while it waits.",
      "assertions": [{ "kind": "uses-family", "family": "skeleton" }, { "kind": "uses-family", "family": "card" }, { "kind": "no-literal" }]
    },
    {
      "id": "save-button-wait",
      "skill": "waiting-states",
      "prompt": "In src/, write a settings panel with a Save button that calls saveSettings(values) in src/api.ts, a stub that resolves after one second. A second press while saving must do nothing.",
      "assertions": [{ "kind": "uses-family", "family": "button" }, { "kind": "mentions", "pattern": "loading" }, { "kind": "no-literal" }]
    },
    {
      "id": "notifications-empty",
      "skill": "waiting-states",
      "prompt": "In src/, write a notifications list read from fetchNotifications() in src/api.ts, a stub that can resolve to an empty array or reject. Handle every state the list can be in.",
      "assertions": [{ "kind": "uses-family", "family": "skeleton" }, { "kind": "uses-family", "family": "result-state" }, { "kind": "no-literal" }]
    },
    {
      "id": "report-export-progress",
      "skill": "waiting-states",
      "prompt": "In src/, write an Export button for a report; exportReport(onProgress) in src/api.ts is a stub that reports percent done ten times over three seconds.",
      "assertions": [{ "kind": "uses-family", "family": "progress-indicator" }, { "kind": "no-literal" }]
    }
  ]
}
```

Antes de gravar, conferir que cada família citada existe: `ls specs/components | grep -xE 'data-grid|filter-bar|pagination|page-header|stat-card|tabs|form|field|chart|skeleton|card|button|result-state|progress-indicator'` deve listar 14 nomes. Um nome ausente é trocado pelo nome do contrato equivalente.

- [ ] **Step 2: Fixtures**

`tools/agent-docs/eval/fixtures/react/package.json`:

```json
{
  "name": "slotted-eval-react",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

`tools/agent-docs/eval/fixtures/react/src/main.tsx`:

```tsx
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(null);
```

`tools/agent-docs/eval/fixtures/angular/package.json`:

```json
{
  "name": "slotted-eval-angular",
  "private": true,
  "type": "module",
  "dependencies": {
    "@angular/common": "21.0.0",
    "@angular/core": "21.0.0",
    "@angular/platform-browser": "21.0.0"
  }
}
```

`tools/agent-docs/eval/fixtures/angular/src/main.ts`:

```ts
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({ selector: 'app-root', template: '' })
class App {}

bootstrapApplication(App);
```

Versões de React e Angular: copiar as de `packages/react/package.json` (`peerDependencies`/`devDependencies`) e de `demos/nexora/angular/package.json`, em vez das escritas acima, se diferirem.

- [ ] **Step 3: Executor `bin/eval.mjs`**

```js
#!/usr/bin/env node
/**
 * Runs the agent-material evaluation: each case, per binding, with and without
 * the snippet, `runs` times, through `claude -p`, in a fresh copy of a fixture
 * that installs the beta tarballs of `demos/.registry`.
 *   pnpm eval:agent-docs --dry-run
 *   pnpm eval:agent-docs --case orders-list --binding react --runs 1 --condition with
 * Prerequisite: `node scripts/pack-beta.mjs --only @slotted/react,@slotted/angular,@slotted/core,@slotted/theme,@slotted/themes`.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { assertionPasses } from '../src/eval/assertions.ts';
import { parseStream, triggered } from '../src/eval/stream.ts';
import { renderReport, summarize } from '../src/eval/summary.ts';
import { renderAgentsSnippet } from '../src/render.ts';

const root = resolve(import.meta.dirname, '../../..');
const evalDir = resolve(import.meta.dirname, '../eval');
const { values } = parseArgs({
  options: {
    case: { type: 'string' },
    binding: { type: 'string' },
    condition: { type: 'string' },
    runs: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});

const config = JSON.parse(readFileSync(join(evalDir, 'cases.json'), 'utf8'));
const runs = Number(values.runs ?? config.runs);
const bindings = values.binding ? [values.binding] : config.bindings;
const conditions = values.condition ? [values.condition] : ['with', 'without'];
const cases = config.cases.filter((entry) => !values.case || entry.id === values.case);
const sessions = bindings.length * cases.length * runs * conditions.length;
console.log(`${sessions} session(s), model ${config.model}`);
if (values['dry-run']) process.exit(0);

const registry = JSON.parse(readFileSync(join(root, 'demos/.registry/index.json'), 'utf8'));
const PACKAGES = { react: ['@slotted/react', '@slotted/core', '@slotted/theme', '@slotted/themes'], angular: ['@slotted/angular', '@slotted/core', '@slotted/theme', '@slotted/themes'] };

/** One installed copy per binding; each session copies it. */
function template(binding) {
  const dir = join(tmpdir(), `slotted-eval-${binding}`);
  rmSync(dir, { recursive: true, force: true });
  cpSync(join(evalDir, 'fixtures', binding), dir, { recursive: true });
  const tarballs = PACKAGES[binding].map((name) => join(root, 'demos/.registry', registry[name].tarball));
  const install = spawnSync('npm', ['install', '--no-audit', '--no-fund', ...tarballs], { cwd: dir, stdio: 'inherit' });
  if (install.status !== 0) throw new Error(`npm install failed for ${binding}`);
  return dir;
}

function sourceFiles(dir) {
  const files = new Map();
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      if (entry === 'node_modules') continue;
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx?|html|css|scss)$/.test(entry)) files.set(relative(dir, path), readFileSync(path, 'utf8'));
    }
  };
  walk(join(dir, 'src'));
  return files;
}

const env = { ...process.env };
delete env.CLAUDECODE;
const results = [];
for (const binding of bindings) {
  const base = template(binding);
  for (const entry of cases)
    for (const condition of conditions)
      for (let run = 0; run < runs; run += 1) {
        const dir = mkdtempSync(join(tmpdir(), `slotted-eval-${entry.id}-`));
        cpSync(base, dir, { recursive: true });
        writeFileSync(join(dir, 'CLAUDE.md'), condition === 'with' ? renderAgentsSnippet(binding) : '');
        const session = spawnSync(
          'claude',
          ['-p', entry.prompt, '--output-format', 'stream-json', '--verbose', '--model', config.model,
           '--setting-sources', 'project,local', '--permission-mode', 'acceptEdits',
           '--allowedTools', 'Read,Write,Edit,Glob,Grep,Bash(ls:*),Bash(cat:*)'],
          { cwd: dir, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
        );
        const trace = parseStream(session.stdout.split('\n'));
        const files = sourceFiles(dir);
        const passed = entry.assertions.filter((assertion) => assertionPasses(assertion, binding, files)).length;
        results.push({ caseId: entry.id, binding, skill: entry.skill, condition, triggered: triggered(trace, entry.skill), passed, total: entry.assertions.length, trace });
        console.log(`${binding} ${entry.id} ${condition} #${run + 1}: triggered=${triggered(trace, entry.skill)} ${passed}/${entry.assertions.length} $${trace.costUsd.toFixed(2)}`);
        rmSync(dir, { recursive: true, force: true });
      }
}

const date = new Date().toISOString().slice(0, 10);
const out = join(root, 'docs/history/evals');
mkdirSync(out, { recursive: true });
const file = join(out, `${date}-agent-docs.md`);
writeFileSync(file, renderReport(date, config.model, summarize(results)));
console.log(`report: ${relative(root, file)}`);
```

Em `package.json` da raiz: `"eval:agent-docs": "node tools/agent-docs/bin/eval.mjs"`.

- [ ] **Step 4: Ensaio sem custo**

Run: `pnpm eval:agent-docs --dry-run`
Expected: `96 session(s), model claude-sonnet-5-5`.

Run: `pnpm --filter @slotted/agent-docs typecheck`
Expected: sem erros (o `bin/` está no `include`; erros de tipo de `.mjs` não são verificados sem `checkJs`).

- [ ] **Step 5: Uma sessão real**

Pré-requisito: `pnpm --filter @slotted/react build && pnpm --filter @slotted/angular build && node scripts/pack-beta.mjs --only @slotted/react,@slotted/angular,@slotted/core,@slotted/theme,@slotted/themes`.

Run: `pnpm eval:agent-docs --case metrics-card-loading --binding react --runs 1 --condition with`
Expected: uma linha `react metrics-card-loading with #1: triggered=… n/3 $…` e `report: docs/history/evals/<data>-agent-docs.md`. Falhas possíveis e ação:
- `--setting-sources` rejeitado → remover o argumento e registrar no relatório que as configurações do usuário se aplicam.
- `readPaths` vazio com `is_error` falso → imprimir as 20 primeiras linhas de `session.stdout` e ajustar `parseStream` ao formato real; acrescentar o caso ao teste da Task 15.

Apagar o relatório desta sessão única (`rm docs/history/evals/<data>-agent-docs.md`): ele não é uma rodada.

- [ ] **Step 6: Commit**

```bash
git add tools/agent-docs/eval tools/agent-docs/bin/eval.mjs package.json
git commit -m "feat(agent-docs): pnpm eval:agent-docs — oito casos por binding, com e sem snippet, sobre fixtures que instalam as betas; relatório em docs/history/evals"
```

- [ ] **Step 7: Rodada completa — só com aprovação**

Apresentar ao usuário: 96 sessões, modelo, custo medido da sessão do Step 5 × 96. Rodar `pnpm eval:agent-docs` só após aprovação explícita. Commitar o relatório:

```bash
git add docs/history/evals
git commit -m "docs(evals): primeira rodada da avaliação do material de agente"
```

Um veredito `abaixo` em disparo registra no checkpoint a abertura do subprojeto do instalador; em conformidade, a revisão do conteúdo da skill antes do próximo release.

---

## Verificação final

Run: `pnpm check && pnpm check:affected`
Expected: PASS. `git status` limpo, exceto o trabalho do usuário anterior a este plano (arquivos de `dashboard-grid`, `progress-indicator`, `tabs`, `chart/theme` listados no início da sessão), que nenhum commit deste plano inclui.
