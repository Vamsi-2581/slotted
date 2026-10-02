# Plano — documentação para agentes de código

> **Para agentes executores:** sub-skill obrigatória: `superpowers:subagent-driven-development` ou `superpowers:executing-plans`. Passos em checkbox (`- [ ]`).

**Objetivo:** documentação versionada dentro de `@slotted/react` e `@slotted/angular`, e as mesmas saídas no site, para agentes de código.

**Arquitetura:** `tools/agent-docs` converte `*.docs.ts`, `contract.json`, `tokens.json` e os exemplos do site em Markdown e JSON; o build de cada pacote grava a saída em `dist/docs/`, e `apps/docs` serve os mesmos arquivos como rotas estáticas.

**Stack:** Node 24 (`node:test`), Vite 8.2.2 (`runnerImport`), TypeScript 6.0.3, Angular CLI 22, Vitest, Astro 7.3.5.

**Desenho:** `docs/history/designs/2026-10-01-agent-docs-design.md`. Checkpoint: `.claude/progress/agent-docs.md`.

## Restrições globais

- Inglês em todo material gerado.
- Um arquivo Markdown por binding; sem abas.
- O gerador não escreve prosa própria. Texto fixo permitido: títulos de seção, cabeçalhos de tabela, rótulos `Example` e `Excerpt — not a complete module`, e o modelo de `AGENTS.snippet.md`.
- Orçamentos: `index.md` ≤ 8192 bytes; `<family>.md` ≤ 24576 bytes; `AGENTS.snippet.md` ≤ 2048 bytes. Excedido → o build falha.
- Gate de exemplo: só compilação. Nenhuma heurística textual (`…`, acentos, palavras, imports por regex) reprova geração.
- Nenhuma execução de agente nem chamada de API em qualquer passo.
- Pacote nunca depende de `apps/docs`.

## Ajustes ao desenho

| Desenho | Plano | Motivo verificável |
| --- | --- | --- |
| `dist/docs/` nos dois pacotes | React: `packages/react/dist/docs/` → `node_modules/@slotted/react/dist/docs/`. Angular: `packages/angular/dist/docs/` → `node_modules/@slotted/angular/docs/` | `packages/angular/package.json` publica de `dist` (`publishConfig.directory`) |
| Propósito em uma frase e categoria no índice | Campos novos `summary` e `group` em `contract.json` | Nenhuma entrada atual contém propósito ou categoria; `group` hoje vive só no frontmatter MDX de `apps/docs` |
| Rules a partir de "regras com `reason`" | Rules = `ReferenceDocs.accessibility` | `reason` aparece 1022 vezes em estruturas heterogêneas; a renderização genérica produziria texto de justificativa, não regra |
| Gate Angular com componente gerado em torno do snippet | Só módulo `ts` com `@Component` é candidato a Example; template `angular` é Excerpt | Envolver o template exige adivinhar imports, o que é heurística |
| `apps/docs` importa a função de renderização | `apps/docs` serve os arquivos que `buildDocs` gravou em `packages/<binding>/dist/docs/` | Conteúdo idêntico por construção; o site não recarrega `*.docs.ts` nem recompila exemplos |
| Linha do índice com link e propósito | `- <family>: <summary>`, com `summary` ≤ 56 caracteres; o caminho `./<family>.md` é dito uma vez no topo | 123 linhas com link e frase de 160 caracteres somam ≈ 23 KB, acima de 8 KB |

## Foco de revisão

1. Família legada (36 páginas em `specs/legacy-reference-pages.json`) sem `imports`, `anatomy` ou `scenes`: o arquivo sai com as seções presentes, sem falhar. Teste na Tarefa 2.
2. Snippet com `"Loading…"` em texto de interface: classificado só pela compilação. Testes nas Tarefas 2 e 3.
3. Tipo com `|` (`'sm' | 'md' | 'lg'`) ou quebra de linha numa célula: a tabela mantém o número de colunas. Teste na Tarefa 2.
4. Snippet que contém uma cerca de três crases (família `markdown`): a cerca externa é maior que a interna. Teste na Tarefa 2.
5. Família com contrato e sem `tokens.json`: `tokens: []`, seção Tokens omitida, sem falha. Teste na Tarefa 3.

---

## Fatia 1 — gerador

### Tarefa 1: `summary` e `group` no contrato

**Arquivos:**
- Modificar: `specs/contract.schema.mjs`, `specs/contract.schema.test.mjs`, `specs/components/*/contract.json` (123)
- Modificar: `apps/docs/src/lib/nav.ts`, `apps/docs/src/content.config.ts`, `apps/docs/src/content/components/field.mdx` (o grupo passa a vir do contrato)

**Interfaces produzidas:**

```js
// specs/contract.schema.mjs
export const GROUPS = ['Actions', 'Forms', 'Data display', 'Feedback', 'Navigation', 'Overlays', 'Layout'];
export const SUMMARY_MAX = 56;
// contract.summary: string, uma frase em inglês, termina em ponto, ≤ SUMMARY_MAX caracteres ("Filterable, sortable grid of records.")
// contract.group: um de GROUPS
```

- [ ] **Passo 1: teste que falha** em `specs/contract.schema.test.mjs`:

```js
test('every contract states its group and a one-sentence summary', () => {
  for (const family of families()) {
    const contract = readContract(family);
    assert.ok(GROUPS.includes(contract.group), `${family}: group ${contract.group} is not one of ${GROUPS.join(', ')}`);
    assert.equal(typeof contract.summary, 'string', `${family}: summary missing`);
    assert.ok(contract.summary.length <= SUMMARY_MAX, `${family}: summary exceeds ${SUMMARY_MAX} characters`);
    assert.match(contract.summary, /^[A-Z].*\.$/, `${family}: summary is not one sentence ending in a period`);
    assert.equal(contract.summary.split(/\.\s/).length, 1, `${family}: summary holds more than one sentence`);
  }
});

test('the index lines of every family fit the 8 KB index budget', () => {
  // `- <family>: <summary>\n` per family, plus 512 bytes for the heading, the path line and the group headings
  const bytes = families().reduce((sum, f) => sum + Buffer.byteLength(`- ${f}: ${readContract(f).summary}\n`), 512);
  assert.ok(bytes <= 8192, `index lines total ${bytes} bytes`);
});
```

`families()` e `readContract()` seguem o padrão já presente no arquivo de teste; se ausentes, ler `specs/components/*/contract.json` com `readdirSync`.

- [ ] **Passo 2:** `node --test specs/contract.schema.test.mjs` → FAIL em 123 famílias.
- [ ] **Passo 3:** escrever `group` e `summary` nas 123 famílias. Fonte de cada `summary`: a descrição da família em `docs/process/build-order.md` traduzida, conferida contra `members` e `scenarios` do próprio contrato; frase descritiva do que a família é, sem adjetivo de qualidade. Fonte de cada `group`: o frontmatter MDX quando existe; nos demais, o grupo do papel principal (`Forms` para controles de entrada, `Overlays` para camadas sobre a página).
- [ ] **Passo 4:** `apps/docs` lê `group` do contrato (`nav.ts` passa a importar o JSON do contrato por família); o campo `group` sai do schema da coleção e do frontmatter.
- [ ] **Passo 5:** `pnpm test:contracts` → PASS; `pnpm --filter @slotted/docs build` → sucesso, navegação com Field em Forms.

### Tarefa 2: função pura de renderização

**Arquivos:**
- Criar: `tools/agent-docs/package.json`, `tools/agent-docs/src/types.ts`, `tools/agent-docs/src/render.ts`, `tools/agent-docs/src/markdown.ts`, `tools/agent-docs/src/agents-snippet.react.md`, `tools/agent-docs/src/agents-snippet.angular.md`, `tools/agent-docs/tsconfig.json`
- Teste: `tools/agent-docs/src/render.test.ts`, `tools/agent-docs/src/fixtures/*.ts`

**Interfaces produzidas:**

```ts
// tools/agent-docs/src/types.ts
import type { ReferenceDocs } from '@slotted/storybook-workbench';

export type Binding = 'react' | 'angular';
export type BlockVerdict = 'example' | 'excerpt';

export interface ContractInput {
  family: string;
  ui: string;
  summary: string;
  group: string;
  axes?: Readonly<Record<string, readonly string[]>>;
  provides?: Readonly<Record<string, readonly string[]>>;
  members: Readonly<Record<string, { nativeElement: string; defaults?: Readonly<Record<string, unknown>>; parts?: readonly string[]; states?: readonly string[] }>>;
}

export interface SiteExample {
  /** Nome do arquivo sem extensão; casa com `ReferenceSceneMeta.id`. */
  id: string;
  fileName: string;
  language: 'tsx' | 'ts';
  source: string;
}

export interface FamilyInput {
  binding: Binding;
  contract: ContractInput;
  /** Chave = membro do contrato; valor = entrada de `<BINDING>_<FAMILY>_DOCS`. */
  docs: Readonly<Record<string, ReferenceDocs>>;
  tokens: readonly string[];
  examples: readonly SiteExample[];
  /** Chave = id do snippet ou `site:<id>`; ausente = excerpt. */
  verdicts: ReadonlyMap<string, BlockVerdict>;
}

export interface RenderedFamily {
  /** `<family>.md`; `<family>.examples.md` quando Examples excede o orçamento. */
  files: ReadonlyArray<{ path: string; content: string }>;
}

export const BUDGETS = { index: 8192, family: 24576, snippet: 2048 } as const;
export const DOCS_DIR: Readonly<Record<Binding, string>> = {
  react: 'node_modules/@slotted/react/dist/docs',
  angular: 'node_modules/@slotted/angular/docs',
};
```

```ts
// tools/agent-docs/src/render.ts
export function renderFamily(input: FamilyInput): RenderedFamily;
export function renderIndex(inputs: readonly FamilyInput[], binding: Binding): string;
export function renderAgentsSnippet(binding: Binding): string;
export function renderFamilyJson(input: FamilyInput): Record<string, unknown>;
export class BudgetError extends Error {}
```

Estrutura de `<family>.md` (títulos fixos; seção sem dados é omitida):

```md
<!-- index: ./index.md -->
# <family>

`data-ui="<ui>"` · <summary>

## Import
```<tsx|ts>
<docs[primeiro membro].imports.source>
```
<Angular: `Selector: <selector>` · `exportAs: <exportAs>` quando presentes>

## Minimal example
<rótulo> + bloco

## Anatomy
| Part | Element | Required |
<anatomy de cada membro, `data-part` = part>

## Props
| Name | Type | Default | Applies to | Description |
<api e composition de cada membro>

## Events
| Name | Payload | When |

## Axes and defaults
| Axis | Values | Default |
<contract.axes × members[*].defaults>

## Rules
- <accessibility[i]>

## Tokens
<tokens, separados por vírgula, em code spans>

## Examples
### <scene.title | fileName>
<scene.note>
<rótulo> + bloco
```

Rótulo de bloco: `Example` quando `verdicts.get(id) === 'example'`, senão `Excerpt — not a complete module`. Minimal example: exemplo do site `basic` com veredito example; senão a primeira cena com veredito example; senão a primeira cena, rotulada excerpt. Exemplo do site substitui a cena de mesmo `id`.

Orçamento de `<family>.md`: se excede, a seção Examples vai para `<family>.examples.md` e a seção passa a conter só o link; se ainda excede, `BudgetError` com família e tamanho.

`agents-snippet.<binding>.md` é texto fixo, escrito à mão, com `{{docsDir}}` substituído por `DOCS_DIR[binding]`. Conteúdo React:

```md
## Slotted UI (@slotted/react)

Before writing or changing UI, read `{{docsDir}}/index.md` and the file of each family used. These files match the installed version; prefer them over prior knowledge of the library.

- Import from `@slotted/react` or its family subpath, as each file's Import section shows.
- Styling: `@slotted/react/styles.css` and `@slotted/theme-default/styles.css` are imported once, in that order. Do not restyle families with custom CSS; use their `size`, `variant` and `tone` props.
- Theme, scheme and density are attributes on any ancestor: `data-slotted-theme`, `data-slotted-scheme` (`light`, `dark`, `high-contrast`), `data-slotted-density` (`comfortable`, `compact`, `dense`).
- Spacing, color and radius in application CSS use `var(--slotted-*)` tokens, never literal values.
- To render a family on another element (a router link, a trigger), pass `render`; do not wrap it.
- Select a family in CSS or tests by `[data-ui="<ui>"]` and its parts by `[data-part="<part>"]`.
```

A versão Angular troca a linha de import por `Import standalone directives from `@slotted/angular/<family>`` e a de render pela forma Angular. Antes de gravar, cada regra é conferida contra o código: ordem dos estilos (`packages/react/README.md`, `demos/nexora/angular/src/styles.css`), valores de esquema e densidade (`packages/styles`), existência de `render` em React e do equivalente Angular. Regra sem confirmação sai do texto.

- [ ] **Passo 1: testes que falham** (`tools/agent-docs/src/render.test.ts`, Vitest), com fixtures mínimos em `src/fixtures/`:

```ts
import { describe, expect, it } from 'vitest';
import { BUDGETS, BudgetError, renderAgentsSnippet, renderFamily, renderIndex } from './render';
import { fieldInput, legacyInput, longExamplesInput, markdownFamilyInput } from './fixtures';

describe('renderFamily', () => {
  it('writes the fixed sections in order and omits those without data', () => {
    const [file] = renderFamily(legacyInput).files;
    const headings = file.content.match(/^## .+$/gm);
    expect(headings).toEqual(['## Props', '## Rules']);
  });

  it('labels a block by its compile verdict, never by its text', () => {
    const content = renderFamily(fieldInput).files[0].content;
    expect(content).toContain('Excerpt — not a complete module');
    // the fixture snippet whose source is `<Button>Loading…</Button>` compiled
    expect(content).toMatch(/Example\n+```tsx\n<Button>Loading…<\/Button>/);
  });

  it('a site example replaces the scene with the same id', () => {
    const content = renderFamily(fieldInput).files[0].content;
    expect(content).toContain('### necessity.tsx');
    expect(content).not.toContain(fieldInput.docs.field.scenes![1].snippet.source.trim());
  });

  it('moves Examples to a linked file over budget, and fails when that is not enough', () => {
    const files = renderFamily(longExamplesInput).files;
    expect(files.map((f) => f.path)).toEqual(['field.md', 'field.examples.md']);
    expect(Buffer.byteLength(files[0].content)).toBeLessThanOrEqual(BUDGETS.family);
    expect(() => renderFamily({ ...longExamplesInput, tokens: Array(5000).fill('--slotted-x') })).toThrow(BudgetError);
  });

  it('every line is a fixed heading, a table header, a label or a copy of an input field', () => {
    const content = renderFamily(fieldInput).files[0].content;
    const inputs = collectStrings(fieldInput); // all strings reachable from the input
    for (const line of content.split('\n')) expect(isTraceable(line, inputs)).toBe(true);
  });

  it('is deterministic', () => {
    expect(renderFamily(fieldInput)).toEqual(renderFamily(fieldInput));
  });

  it('keeps the column count when a cell holds a pipe or a line break', () => {
    const content = renderFamily(fieldInput).files[0].content; // fixture type: "'sm' | 'md' | 'lg'", description with "\n"
    const props = content.split('## Props')[1].split('\n## ')[0];
    const rows = props.split('\n').filter((line) => line.startsWith('|'));
    for (const row of rows) expect(row.split(/(?<!\\)\|/).length).toBe(7);
  });

  it('fences a snippet that itself holds a three-backtick fence with a longer one', () => {
    const content = renderFamily(markdownFamilyInput).files[0].content; // snippet source contains "```md"
    expect(content).toContain('````');
  });
});

describe('renderIndex and the snippet', () => {
  it('fits the index of 123 families in its budget', () => {
    const inputs = Array.from({ length: 123 }, (_, i) => ({ ...fieldInput, contract: { ...fieldInput.contract, family: `family-${i}`, ui: `family-${i}` } }));
    expect(Buffer.byteLength(renderIndex(inputs, 'react'))).toBeLessThanOrEqual(BUDGETS.index);
  });

  it('points each binding at its installed path', () => {
    expect(renderAgentsSnippet('react')).toContain('node_modules/@slotted/react/dist/docs/index.md');
    expect(renderAgentsSnippet('angular')).toContain('node_modules/@slotted/angular/docs/index.md');
    expect(Buffer.byteLength(renderAgentsSnippet('angular'))).toBeLessThanOrEqual(BUDGETS.snippet);
  });
});
```

`collectStrings` e `isTraceable` ficam em `src/trace.ts` (exportados, testados por este arquivo): uma linha é rastreável quando, retirados a marcação Markdown (`#`, `|`, `` ` ``, `- `, cercas) e os textos fixos listados em `FIXED_TEXT`, cada célula ou fragmento restante é uma das strings de entrada ou uma linha de uma delas.

Formato do índice:

```md
# Slotted for <React|Angular>

Each family is documented in `./<family>.md`.

## <group>
- <family>: <summary>
```

Grupos na ordem de `GROUPS`; famílias em ordem alfabética dentro do grupo. O orçamento é garantido pelo teste da Tarefa 1 sobre os summaries reais.

- [ ] **Passo 2:** `pnpm --filter @slotted/agent-docs test` → FAIL.
- [ ] **Passo 3:** implementar `markdown.ts` (tabela com escape de `|` e quebras de linha; cerca com comprimento maior que a maior sequência de crases do conteúdo), `trace.ts`, `render.ts`.
- [ ] **Passo 4:** `pnpm --filter @slotted/agent-docs test` → PASS; `pnpm --filter @slotted/agent-docs typecheck`.

### Tarefa 3: carga, gate de compilação e build dos pacotes

**Arquivos:**
- Criar: `tools/agent-docs/src/load.ts`, `tools/agent-docs/src/compile-react.ts`, `tools/agent-docs/src/compile-angular.ts`, `tools/agent-docs/src/build.ts`, `tools/agent-docs/bin/build.mjs`, `tools/agent-docs/src/language-report.ts`
- Teste: `tools/agent-docs/src/compile.test.ts`, `tools/agent-docs/src/build.test.ts`
- Modificar: `packages/react/package.json` (`build`), `packages/angular/package.json` (`build`), `turbo.json` (entradas do build incluem `tools/agent-docs/src/**`, `specs/components/**/contract.json`, `apps/docs/examples/**`)

**Interfaces:**
- Consome: `FamilyInput`, `renderFamily`, `renderIndex`, `renderAgentsSnippet`, `BudgetError` (Tarefa 2); `summary`, `group` (Tarefa 1).
- Produz:

```ts
export async function loadFamilies(binding: Binding, root: string): Promise<Omit<FamilyInput, 'verdicts'>[]>;
export async function compileReact(blocks: ReadonlyArray<{ id: string; source: string }>, typesRoot: string): Promise<Map<string, BlockVerdict>>;
export async function compileAngular(blocks: ReadonlyArray<{ id: string; source: string }>, distRoot: string): Promise<Map<string, BlockVerdict>>;
export async function buildDocs(options: { binding: Binding; root: string; out: string }): Promise<{ families: number; examples: number; excerpts: number }>;
// grava em `out`: index.md, AGENTS.snippet.md, <family>.md, <family>.examples.md quando houver, <family>.json (renderFamilyJson)
```

`loadFamilies`: `runnerImport` do Vite 8 em `packages/react/src/<family>/<family>.docs.ts` ou `packages/angular/<family>/src/<family>.docs.ts`, export `<BINDING>_<FAMILY_SNAKE_UPPER>_DOCS`; `specs/components/<family>/contract.json`; `packages/styles/src/<family>/<family>.tokens.json` quando existe; `apps/docs/examples/<binding>/<family>/*.{tsx,ts}`. Família com contrato e sem `*.docs.ts` → erro com a família (garantia de cobertura).

`compileReact`: cada bloco `tsx`/`ts` vira `<tmp>/<n>.tsx`; um `tsc --noEmit` com `jsx: react-jsx`, `strict`, `moduleResolution: bundler`, `paths` para `packages/react/dist/types` e `packages/core/dist/types`; cada arquivo sem diagnóstico → `example`, com diagnóstico → `excerpt`. `compileAngular`: só blocos `ts` que contêm `@Component(`; `ngc -p` com `strictTemplates: true`, `paths` para `packages/angular/dist`; demais blocos → `excerpt` sem compilar.

- [ ] **Passo 1: testes que falham**

```ts
// tools/agent-docs/src/compile.test.ts
import { describe, expect, it } from 'vitest';
import { compileReact } from './compile-react';

describe('compileReact', () => {
  it('judges by the compiler alone', async () => {
    const verdicts = await compileReact(
      [
        { id: 'complete', source: "import { Button } from '@slotted/react';\nexport const A = () => <Button>Loading…</Button>;\n" },
        { id: 'fragment', source: '<Field required>…</Field>;\n' },
        { id: 'invented-prop', source: "import { Button } from '@slotted/react';\nexport const A = () => <Button colour=\"red\">Save</Button>;\n" },
      ],
      'packages/react/dist/types',
    );
    expect(Object.fromEntries(verdicts)).toEqual({ complete: 'example', fragment: 'excerpt', 'invented-prop': 'excerpt' });
  });
});
```

```ts
// tools/agent-docs/src/build.test.ts
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildDocs } from './build';
import { loadFamilies } from './load';

describe('buildDocs', () => {
  it('writes one file per contract, the index and the snippet', async () => {
    const out = mkdtempSync(join(tmpdir(), 'docs-'));
    const contracts = readdirSync('specs/components', { withFileTypes: true }).filter((e) => e.isDirectory()).length;
    const result = await buildDocs({ binding: 'react', root: process.cwd(), out });
    const files = readdirSync(out);
    expect(result.families).toBe(contracts);
    expect(files).toContain('index.md');
    expect(files).toContain('AGENTS.snippet.md');
    expect(files.filter((f) => /^[a-z0-9-]+\.md$/.test(f) && f !== 'index.md').length).toBeGreaterThanOrEqual(contracts);
    expect(files.filter((f) => f.endsWith('.json')).length).toBe(contracts);
  });

  it('a family without a tokens file loads with no tokens', async () => {
    const families = await loadFamilies('react', process.cwd());
    const withoutFile = families.filter((f) => !existsSync(`packages/styles/src/${f.contract.family}/${f.contract.family}.tokens.json`));
    for (const family of withoutFile) expect(family.tokens).toEqual([]);
  });

  it('two builds over the same inputs are byte-identical', async () => {
    const a = mkdtempSync(join(tmpdir(), 'docs-'));
    const b = mkdtempSync(join(tmpdir(), 'docs-'));
    await buildDocs({ binding: 'react', root: process.cwd(), out: a });
    await buildDocs({ binding: 'react', root: process.cwd(), out: b });
    for (const f of readdirSync(a)) expect(readFileSync(join(a, f), 'utf8')).toBe(readFileSync(join(b, f), 'utf8'));
  });
});
```

Os testes rodam com cwd na raiz do repositório (`vitest.config.ts` de `tools/agent-docs` define `root: '../..'`) e exigem `packages/react/dist/types` construído; o script `test` executa `pnpm --filter @slotted/react build` antes quando `dist/types` está ausente.

- [ ] **Passo 2:** `pnpm --filter @slotted/agent-docs test` → FAIL.
- [ ] **Passo 3:** implementar `load.ts`, `compile-react.ts`, `compile-angular.ts`, `build.ts`, `bin/build.mjs` (`node tools/agent-docs/bin/build.mjs --binding react --out packages/react/dist/docs`).
- [ ] **Passo 4:** ligar aos builds: `packages/react` → `... && node package-boundary.verify.mjs && node ../../tools/agent-docs/bin/build.mjs --binding react --out dist/docs`; `packages/angular` → `ng build slotted-angular && node ../../tools/agent-docs/bin/build.mjs --binding angular --out dist/docs`.
- [ ] **Passo 5:** `language-report.ts` imprime, por binding, os snippets cujo `source` contém caracteres fora de ASCII imprimível exceto `…`, `—`, `–`, `’`, `“`, `”`, `·`; saída informativa, código 0 sempre. Script: `pnpm --filter @slotted/agent-docs report:language`.
- [ ] **Passo 6:** `pnpm --filter @slotted/agent-docs test` → PASS; `pnpm --filter @slotted/react build` e `pnpm --filter @slotted/angular build` → `dist/docs/index.md` presente; `pnpm pack:beta` → `tar -tzf demos/.registry/slotted-react-*.tgz | grep docs/index.md` e o mesmo para Angular (`package/docs/index.md`) retornam uma linha cada.
- [ ] **Passo 7:** `pnpm check:affected`.

**Checkpoint da fatia 1.**

---

## Fatia 2 — correção de fonte e site

### Tarefa 4: snippets em inglês e módulos completos nas famílias de uso frequente

**Arquivos:**
- Modificar: `packages/react/src/<family>/<family>.docs.ts` e `packages/angular/<family>/src/<family>.docs.ts` listados pelo relatório de idioma; `*.docs.ts` de `button`, `field`, `menu`, `dialog`, `data-grid`, `table`, `tabs`, `combobox`, `select`, `toast`, `app-shell`, `side-navigation`.

- [ ] **Passo 1:** `pnpm --filter @slotted/agent-docs report:language` → lista inicial (estado em 2026-10-01: 10 arquivos React, 9 Angular). Guardar no checkpoint.
- [ ] **Passo 2:** traduzir cada string de interface em português para inglês, nos dois bindings, mantendo a cena equivalente entre eles (`scripts/verify-docs-snippets.test.mjs` compara os pares).
- [ ] **Passo 3:** nessas doze famílias, reescrever a cena `playground` (ou a primeira cena) de cada binding como módulo completo: imports de `imports.source` usados, componente exportado; Angular como `ts` com `@Component({ selector, imports: [...], template })`.
- [ ] **Passo 4:** `pnpm --filter @slotted/react build`, `pnpm --filter @slotted/angular build` → no resumo de `buildDocs`, cada uma das doze famílias tem Minimal example rotulado `Example`.
- [ ] **Passo 5:** `pnpm --filter @slotted/agent-docs report:language` → lista vazia; `pnpm test:docs`; testes de stories das famílias tocadas (`pnpm --filter @slotted/react test -- <family>`, `npx ng test slotted-angular --watch=false --include='packages/angular/<family>/**/*.spec.ts'`).

### Tarefa 5: saídas no site

**Arquivos:**
- Criar: `apps/docs/src/pages/[framework]/components/[family].md.ts`, `apps/docs/src/pages/[framework]/components/[family].json.ts`, `apps/docs/src/pages/llms.txt.ts`
- Modificar: `apps/docs/src/layouts/Base.astro` (prop `markdownHref`), `apps/docs/src/pages/[framework]/components/[family].astro`, `apps/docs/package.json`, `turbo.json`
- Teste: `apps/docs/scripts/agent-outputs.test.mjs` (lê `apps/docs/dist` após o build)

**Interfaces:**
- Consome: `packages/react/dist/docs/` e `packages/angular/dist/docs/` gravados por `buildDocs` (Tarefa 3): `<family>.md`, `<family>.examples.md`, `<family>.json`; `summary` dos contratos (Tarefa 1).
- O endpoint `.md` devolve o arquivo do pacote sem alteração, exceto a primeira linha `<!-- index: ./index.md -->`, trocada por `<!-- index: /llms.txt -->`. `<family>.examples.md` é servido em `/<framework>/components/<family>.examples.md`.
- `turbo.json`: a tarefa `build` de `@slotted/docs` depende de `@slotted/react#build` e `@slotted/angular#build`; `apps/docs/package.json` declara `@slotted/angular: workspace:*` se ausente.

`getStaticPaths` dos endpoints: toda família com contrato × `FRAMEWORKS_WITH_DOCS = ['react', 'angular']`. `llms.txt`:

```md
# Slotted

> <frase de `apps/docs/src/content/foundations/introduction.mdx` frontmatter `description`>

## React components
- [<family>](/react/components/<family>.md): <summary>

## Angular components
- [<family>](/angular/components/<family>.md): <summary>
```

Páginas HTML de componente: `<link rel="alternate" type="text/markdown" href="/<framework>/components/<family>.md">` e `<link rel="describedby" href="/llms.txt">` em `<head>`.

- [ ] **Passo 1: teste que falha**

```js
// apps/docs/scripts/agent-outputs.test.mjs
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const dist = new URL('../dist/', import.meta.url).pathname;
const families = readdirSync(new URL('../../../specs/components/', import.meta.url), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

test('every family has a Markdown and a JSON route per binding', () => {
  for (const binding of ['react', 'angular']) for (const family of families) {
    assert.ok(existsSync(`${dist}${binding}/components/${family}.md`), `${binding}/${family}.md`);
    assert.ok(existsSync(`${dist}${binding}/components/${family}.json`), `${binding}/${family}.json`);
  }
});

test('llms.txt links only routes that exist', () => {
  const llms = readFileSync(`${dist}llms.txt`, 'utf8');
  for (const [, href] of llms.matchAll(/\]\((\/[^)]+)\)/g)) assert.ok(existsSync(`${dist}${href.slice(1)}`), href);
});

test('a component page declares its Markdown and its index', () => {
  const html = readFileSync(`${dist}react/components/field/index.html`, 'utf8');
  assert.match(html, /<link rel="alternate" type="text\/markdown" href="\/react\/components\/field\.md">/);
  assert.match(html, /<link rel="describedby" href="\/llms\.txt">/);
});
```

Script em `apps/docs/package.json`: `"test:outputs": "node --test scripts/agent-outputs.test.mjs"`; `verify` passa a `astro check && astro build && pnpm test:outputs`.

- [ ] **Passo 2:** `pnpm --filter @slotted/docs build && pnpm --filter @slotted/docs test:outputs` → FAIL.
- [ ] **Passo 3:** implementar endpoints e `<link>`.
- [ ] **Passo 4:** → PASS. `diff <(tail -n +2 apps/docs/dist/react/components/field.md) <(tail -n +2 packages/react/dist/docs/field.md)` → sem saída.
- [ ] **Passo 5:** `pnpm check:affected`.

**Checkpoint da fatia 2.**

## Pendência — tradução dos snippets restantes

Registrada em 2026-10-01; execução adiada por decisão do usuário.

- Escopo: snippets de `*.docs.ts` com texto em português, e as mesmas strings nas stories, fora das 12 famílias da Tarefa 4. Estado medido por `pnpm --filter @slotted/agent-docs report:language`: 56 famílias React e 54 Angular, 243 snippets em cada binding.
- Famílias: accordion, action-bar, alert, badge, carousel, chart, checkbox, checkbox-group, code-block, collapsible, color-picker, currency-field, datetime-field, datetime-picker, datetime-range-picker, detail-panel, entity-picker, field-group, filter-bar, form, fullscreen, highlight, import-export-center, inline-message, loading-overlay, markdown, message, notification-center, number-field, otp-input, page, page-header, prompt-composer, radio-group, rating, result-state, section, segmented-control, slider, split-button, stack, switch, table-of-contents, tag, textarea, text-field, time-field, timeline, time-picker, time-range-picker, toggle, toggle-group, toolbar, top-navigation, tour, upload.
- Método da Tarefa 4: mapa de tradução por família aplicado a docs, stories e stories tests dos dois bindings; identificadores em português (`value`, `href`) incluídos; apóstrofo tipográfico `’` em strings com aspas simples; testes da família nos dois bindings.
- Execução em lotes de até três famílias por fatia, coordenada com as sessões que editam a mesma família.
- Aceite: `report:language` sem português nas famílias do lote; `node --test scripts/verify-docs-snippets.test.mjs` verde; testes da família verdes.
