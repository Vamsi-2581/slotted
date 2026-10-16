# Tokens, elementos próprios e manutenção — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o agente consumidor escreve elementos próprios com os tokens e estados da biblioteca, e cada informação do material de agente tem uma fonte única validada pelo build.

**Architecture:** `packages/theme/src/contract.json` ganha `groups`; `packages/theme/src/token-groups.ts` casa tokens com grupos e acusa lacunas. `tools/agent-docs/src/tokens.ts` gera `tokens.md` a partir do contrato e de `packages/themes/src/default/values.json`. O registro de IDs passa a ser derivado dos tópicos (`registry.ts`), e `ids.json` sai.

**Tech Stack:** TypeScript 6 (type stripping do Node para `.ts` importado por `.mjs`), Vitest 4, `node:test`, Astro (site `apps/docs`).

**Spec:** `docs/history/designs/2026-10-16-tokens-and-own-elements-design.md`

## Global Constraints

- Texto publicado (tópicos, skills, `tokens.md`) em inglês; nomes entre crases só os que o catálogo resolve (`unresolvedNames`); nada que case com `PUBLISHED_FORBIDDEN`.
- `tokens.md` põe entre crases só nomes de token; valores, padrões e valores de dimensão vão sem crases.
- `index.md` tem orçamento de 8192 bytes (`BUDGETS.index`); hoje mede 7752.
- `.claude/skills/` não é alterado.
- Nunca `git add -A`; cada commit adiciona só os arquivos da tarefa. A sessão concorrente em `main` é dona de dashboard-grid, chart, tabs, progress-indicator e `.claude/progress/current.md`.
- Checkpoint deste trabalho: `.claude/progress/product-agent-material.md`, sobrescrito ao fim de cada fatia de até 3 tarefas.
- `pnpm eval:agent-docs` não roda sem aprovação explícita.

## Review Focus

- Um token novo no contrato sem grupo: o teste de `@slotted/theme` falha nomeando o token (Task 1, Task 2).
- Um valor ausente numa densidade ou uma cadeia `var()` sem destino: a célula mostra `—` ou o `var()` intacto, nunca texto vazio (Task 3).
- Uma regra reescrita com outra redação de status: `registryOf` só reconhece `rewritten as XX-NN`; `writing-rules.md` fixa a frase (Task 7).
- Um arquivo solto em `content/skills/`: o carregador o ignora em vez de procurar `SKILL.md` dentro dele (Task 8).
- O índice passa do orçamento com a seção Tokens: o build lança `BudgetError` (Task 4, teste de build).

---

### Task 1: casamento de tokens com grupos em `@slotted/theme`

**Files:**
- Create: `packages/theme/src/token-groups.ts`
- Create: `packages/theme/src/token-groups.test.ts`
- Modify: `packages/theme/scripts/generate-sources.mjs` (`contractSource`)

**Interfaces:**
- Produces: `TokenGroup`, `groupCovers(group, name): boolean`, `dimensionValues(group, name): Record<string, string>`, `groupErrors(tokens, groups): string[]`.

- [ ] **Step 1: Write the failing test** — `packages/theme/src/token-groups.test.ts`

```ts
import { describe, expect, it } from 'vitest';

import type { TokenDefinition } from './contract-types';
import { dimensionValues, groupCovers, groupErrors, type TokenGroup } from './token-groups';

const token = (name: string, layer: TokenDefinition['layer'] = 'semantic'): TokenDefinition => ({
  name,
  layer,
  axis: 'scheme',
  type: 'color',
});

const tone: TokenGroup = {
  id: 'tone',
  purpose: 'p',
  reader: 'application',
  pattern: '--slotted-tone-{tone}-{role}',
  dimensions: {
    tone: { accent: 'a', danger: 'd' },
    role: { solid: 's', 'on-solid': 'o' },
  },
};
const space: TokenGroup = {
  id: 'space',
  purpose: 'p',
  reader: 'application',
  pattern: '--slotted-space-{step}',
  dimensions: { step: 'open' },
};
const surface: TokenGroup = {
  id: 'surface',
  purpose: 'p',
  reader: 'application',
  tokens: { '--slotted-surface': 's' },
};
const toneTokens = ['accent', 'danger'].flatMap((t) =>
  ['solid', 'on-solid'].map((r) => token(`--slotted-tone-${t}-${r}`)),
);

describe('groupCovers', () => {
  it('a pattern covers the names its dimensions spell, a list covers its names', () => {
    expect(groupCovers(tone, '--slotted-tone-danger-on-solid')).toBe(true);
    expect(groupCovers(tone, '--slotted-tone-warning-solid')).toBe(false);
    expect(groupCovers(space, '--slotted-space-12')).toBe(true);
    expect(groupCovers(surface, '--slotted-surface')).toBe(true);
    expect(groupCovers(surface, '--slotted-surface-raised')).toBe(false);
  });

  it('reads the value of each dimension, the longest value first', () => {
    expect(dimensionValues(tone, '--slotted-tone-accent-on-solid')).toEqual({
      tone: 'accent',
      role: 'on-solid',
    });
  });
});

describe('groupErrors', () => {
  it('accepts tokens each covered by one group', () => {
    expect(
      groupErrors([...toneTokens, token('--slotted-space-1', 'primitive'), token('--slotted-surface')], [
        tone,
        space,
        surface,
      ]),
    ).toEqual([]);
  });

  it('reports a token in no group and a token in two', () => {
    const wide: TokenGroup = { ...space, id: 'wide', pattern: '--slotted-{step}' };
    expect(groupErrors([token('--slotted-space-1'), token('--slotted-gap')], [space, wide])).toEqual([
      '--slotted-space-1: in groups space, wide',
    ]);
    expect(groupErrors([token('--slotted-gap')], [surface])).toEqual([
      '--slotted-gap: in no group',
      'surface: --slotted-surface is not in the contract',
      'surface: covers no token',
    ]);
  });

  it('reports a missing combination, an empty meaning and a listed name the contract lacks', () => {
    const empty: TokenGroup = { ...tone, dimensions: { ...tone.dimensions, role: { solid: '', 'on-solid': 'o' } } };
    expect(groupErrors(toneTokens.slice(1), [empty])).toEqual([
      'tone: --slotted-tone-accent-solid is missing',
      'tone: role solid has no meaning',
    ]);
    expect(
      groupErrors([token('--slotted-surface')], [{ ...surface, tokens: { '--slotted-surface': 's', '--slotted-x': 'x' } }]),
    ).toEqual(['surface: --slotted-x is not in the contract']);
  });

  it('reports a component token read by the application, and a malformed group', () => {
    expect(groupErrors([token('--slotted-surface', 'component')], [surface])).toEqual([
      '--slotted-surface: a component token in the application group surface',
    ]);
    const both: TokenGroup = { ...surface, pattern: '--slotted-surface' };
    const slot: TokenGroup = { ...space, dimensions: { other: 'open' } };
    expect(groupErrors([token('--slotted-surface'), token('--slotted-space-1')], [both, slot])).toEqual([
      'space: dimension other is not in the pattern',
      'space: slot {step} has no dimension',
      'surface: has a pattern or tokens, not both',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @slotted/theme exec vitest run src/token-groups.test.ts`
Expected: FAIL — `Failed to resolve import "./token-groups"`.

- [ ] **Step 3: Write minimal implementation** — `packages/theme/src/token-groups.ts`

```ts
import type { TokenDefinition } from './contract-types';

/**
 * What each token of the contract is for. A group covers its tokens by a
 * pattern of `{dimension}` slots or by a list of names. The published token
 * page is generated from the groups, and `groupErrors` holds them complete:
 * every token in exactly one group, every meaning stated.
 */
export interface TokenGroup {
  readonly id: string;
  readonly purpose: string;
  /** `application`: an element of the application's own reads it. `family`: only its family does. */
  readonly reader: 'application' | 'family';
  readonly pattern?: string;
  /** Per slot: the meaning of each value, or `open` for values with no meaning of their own. */
  readonly dimensions?: Readonly<Record<string, Readonly<Record<string, string>> | 'open'>>;
  readonly tokens?: Readonly<Record<string, string>>;
}

const SLOT = /\{([a-z]+)\}/g;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function slots(group: TokenGroup): string[] {
  return [...(group.pattern ?? '').matchAll(SLOT)].map(([, name]) => name!);
}

function patternRegExp(group: TokenGroup): RegExp {
  const source = (group.pattern ?? '')
    .split(/(\{[a-z]+\})/)
    .map((piece) => {
      const slot = /^\{([a-z]+)\}$/.exec(piece)?.[1];
      if (slot === undefined) return escape(piece);
      const dimension = group.dimensions?.[slot];
      if (dimension === undefined || dimension === 'open') return '([a-z0-9]+(?:-[a-z0-9]+)*)';
      const values = Object.keys(dimension).sort((a, b) => b.length - a.length);
      return `(${values.map(escape).join('|')})`;
    })
    .join('');
  return new RegExp(`^${source}$`);
}

export function groupCovers(group: TokenGroup, name: string): boolean {
  if (group.tokens !== undefined) return name in group.tokens;
  return group.pattern !== undefined && patternRegExp(group).test(name);
}

/** The value a token takes in each slot of its group's pattern. */
export function dimensionValues(group: TokenGroup, name: string): Record<string, string> {
  const match = patternRegExp(group).exec(name);
  if (match === null) return {};
  return Object.fromEntries(slots(group).map((slot, index) => [slot, match[index + 1]!]));
}

function combinations(group: TokenGroup): string[] | undefined {
  let names = [group.pattern ?? ''];
  for (const slot of slots(group)) {
    const dimension = group.dimensions?.[slot];
    if (dimension === undefined || dimension === 'open') return undefined;
    names = names.flatMap((name) =>
      Object.keys(dimension).map((value) => name.replace(`{${slot}}`, value)),
    );
  }
  return names;
}

export function groupErrors(
  tokens: readonly TokenDefinition[],
  groups: readonly TokenGroup[],
): string[] {
  const errors: string[] = [];
  const names = new Set(tokens.map((token) => token.name));
  for (const group of groups) {
    if ((group.pattern === undefined) === (group.tokens === undefined))
      errors.push(`${group.id}: has a pattern or tokens, not both`);
    const declared = Object.keys(group.dimensions ?? {});
    for (const slot of slots(group))
      if (!declared.includes(slot)) errors.push(`${group.id}: slot {${slot}} has no dimension`);
    for (const dimension of declared)
      if (!slots(group).includes(dimension))
        errors.push(`${group.id}: dimension ${dimension} is not in the pattern`);
    for (const [dimension, meanings] of Object.entries(group.dimensions ?? {}))
      if (meanings !== 'open')
        for (const [value, meaning] of Object.entries(meanings))
          if (meaning.trim() === '')
            errors.push(`${group.id}: ${dimension} ${value} has no meaning`);
    for (const [name, meaning] of Object.entries(group.tokens ?? {})) {
      if (!names.has(name)) errors.push(`${group.id}: ${name} is not in the contract`);
      if (meaning.trim() === '') errors.push(`${group.id}: ${name} has no meaning`);
    }
    if (group.pattern !== undefined && group.tokens === undefined)
      for (const name of combinations(group) ?? [])
        if (!names.has(name)) errors.push(`${group.id}: ${name} is missing`);
    if (!tokens.some((token) => groupCovers(group, token.name)))
      errors.push(`${group.id}: covers no token`);
  }
  for (const token of tokens) {
    const covering = groups.filter((group) => groupCovers(group, token.name));
    if (covering.length === 0) errors.push(`${token.name}: in no group`);
    if (covering.length > 1)
      errors.push(`${token.name}: in groups ${covering.map((group) => group.id).join(', ')}`);
    if (token.layer === 'component')
      for (const group of covering)
        if (group.reader === 'application')
          errors.push(`${token.name}: a component token in the application group ${group.id}`);
  }
  return errors.sort();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @slotted/theme exec vitest run src/token-groups.test.ts`
Expected: PASS, 6 tests. A divergence of message order is fixed in the test only when the implementation sorts (it does: `errors.sort()`).

- [ ] **Step 5: `contractSource` leaves `groups` out of the runtime contract**

In `packages/theme/scripts/generate-sources.mjs`, `contractSource()`:

```js
export function contractSource() {
  const contract = readJson(join(PACKAGE, 'src/contract.json'));
  // `groups` documents the tokens for the published page; no theme reads it at run time.
  delete contract.groups;
```

The rest of the function reads `contract` as before.

Run: `pnpm --filter @slotted/theme generate && git diff --stat packages/theme/src/generated`
Expected: no change in `src/generated/` (the contract has no `groups` yet).

- [ ] **Step 6: Commit**

```bash
git add packages/theme/src/token-groups.ts packages/theme/src/token-groups.test.ts packages/theme/scripts/generate-sources.mjs
git commit -m "feat(theme): token-groups — cada token do contrato casa com um grupo por padrão de dimensões ou por lista de nomes; groupErrors acusa token sem grupo, token em dois grupos, combinação ausente, significado vazio e token de componente num grupo da aplicação"
```

---

### Task 2: os grupos do contrato

**Files:**
- Modify: `packages/theme/src/contract.json` (nova chave `groups`, depois de `requiredDensities`)
- Modify: `packages/theme/src/token-groups.test.ts` (teste sobre o contrato real)
- Modify: `docs/token-foundation.md` (frases "This scale answers…")

**Interfaces:**
- Consumes: `groupErrors` (Task 1).
- Produces: `contract.json#groups`, lido pela Task 3 e pela Task 6.

- [ ] **Step 1: Write the failing test** — acrescentar a `token-groups.test.ts`

```ts
import { readFileSync } from 'node:fs';

import type { TokenContract } from './contract-types';

describe('the contract', () => {
  it('every token is in exactly one group, every meaning stated', () => {
    const contract = JSON.parse(
      readFileSync(new URL('./contract.json', import.meta.url), 'utf8'),
    ) as TokenContract & { groups?: TokenGroup[] };
    expect(groupErrors(contract.tokens, contract.groups ?? [])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @slotted/theme exec vitest run src/token-groups.test.ts`
Expected: FAIL — 266 linhas `<token>: in no group`.

- [ ] **Step 3: Add `groups` to `contract.json`**, entre `requiredDensities` e `tokens`:

```json
"groups": [
  { "id": "space", "reader": "application", "purpose": "How much separation or inset a layout needs, smallest first; a gap or an inset is one step.", "pattern": "--slotted-space-{step}", "dimensions": { "step": "open" } },
  { "id": "radius", "reader": "application", "purpose": "How rounded a box or a part is drawn, from none to full.", "pattern": "--slotted-radius-{step}", "dimensions": { "step": "open" } },
  { "id": "font-family", "reader": "application", "purpose": "The typeface text is set in.", "pattern": "--slotted-font-family-{family}", "dimensions": { "family": { "sans": "The typeface of the interface's text.", "mono": "The typeface of code and of values read character by character.", "heading": "The typeface of headings; a theme may point it at a face of its own." } } },
  { "id": "font-size", "reader": "application", "purpose": "What size text is set in, smallest first; text of the application's own takes its size from the `typography` family before this scale.", "pattern": "--slotted-font-size-{step}", "dimensions": { "step": "open" } },
  { "id": "line-height", "reader": "application", "purpose": "The line height that pairs with the font-size step of the same name.", "pattern": "--slotted-line-height-{step}", "dimensions": { "step": "open" } },
  { "id": "font-weight", "reader": "application", "purpose": "How much typographic emphasis text carries.", "pattern": "--slotted-font-weight-{weight}", "dimensions": { "weight": { "regular": "Running text.", "medium": "Text that stands out from running text without heading it.", "semibold": "A heading, a control's label, a figure that leads." } } },
  { "id": "border-width", "reader": "application", "purpose": "How thick an edge or a ring is drawn.", "pattern": "--slotted-border-width-{width}", "dimensions": { "width": { "thin": "The edge of a box, a control or a divider.", "medium": "The weight between thin and thick.", "thick": "The heaviest edge." } } },
  { "id": "duration", "reader": "application", "purpose": "How long a transition or one cycle of a loop takes. The steps from instant to long collapse under reduced motion; the loops do not, so a repeating animation stops there instead.", "pattern": "--slotted-duration-{step}", "dimensions": { "step": { "instant": "A change that must not read as motion.", "short": "A control changing state: a ground, a border, a mark.", "medium": "A part appearing or leaving: a popover, a menu, a tooltip.", "long": "A surface travelling across the screen: a drawer, a sheet.", "loop-fast": "One cycle of a fast repeating animation.", "loop": "One cycle of a repeating animation.", "loop-slow": "One cycle of a slow repeating animation." } } },
  { "id": "easing", "reader": "application", "purpose": "How the velocity of a transition changes.", "pattern": "--slotted-easing-{curve}", "dimensions": { "curve": { "standard": "A change within the screen.", "enter": "A part arriving.", "exit": "A part leaving.", "emphasized": "A change meant to be noticed; it overshoots its end." } } },
  { "id": "z-index", "reader": "application", "purpose": "Which layer an element occupies above the page.", "pattern": "--slotted-z-index-{layer}", "dimensions": { "layer": { "sticky": "A header or a column that stays in place while its region scrolls.", "overlay": "A modal surface and the scrim under it.", "popover": "A popover, a menu or a tooltip; above an overlay, so one opens from a dialog.", "toast": "A toast; above every other layer." } } },
  { "id": "shadow", "reader": "application", "purpose": "What elevation a surface has above the one under it, smallest first; under forced colours every step is none.", "pattern": "--slotted-shadow-{step}", "dimensions": { "step": "open" } },
  { "id": "surface", "reader": "application", "purpose": "The grounds content stands on.", "tokens": { "--slotted-surface": "The ground of the page's content and of a card.", "--slotted-surface-raised": "The ground of a surface above another: a popover, a menu, a dialog; paired with a step of `shadow`.", "--slotted-surface-sunken": "The canvas under the content: the ground a card and a field stand out from.", "--slotted-surface-inverse": "A ground in the opposite lightness, with `--slotted-text-inverse` on it." } },
  { "id": "text", "reader": "application", "purpose": "The colours text is painted in.", "tokens": { "--slotted-text": "Text on a surface.", "--slotted-text-muted": "Text that ranks below the text beside it: a caption, a hint, a secondary value.", "--slotted-text-inverse": "Text on `--slotted-surface-inverse`." } },
  { "id": "border", "reader": "application", "purpose": "The colours of lines between and inside surfaces.", "tokens": { "--slotted-border-subtle": "A rule inside a surface: a divider, the edge of a region, the seam under a header.", "--slotted-border-strong": "The line between two surfaces; it holds 3:1 against every surface a control stands on." } },
  { "id": "disabled", "reader": "application", "purpose": "How an unavailable control is painted.", "pattern": "--slotted-disabled-{role}", "dimensions": { "role": { "background": "The ground of an unavailable control.", "foreground": "The text and icons of an unavailable control.", "border": "The edge of an unavailable control, a step lighter than the edge of an available one." } } },
  { "id": "focus-ring", "reader": "application", "purpose": "The outline every focused element draws.", "tokens": { "--slotted-focus-ring-width": "The thickness of the focus outline.", "--slotted-focus-ring-offset": "The distance between the element and its focus outline.", "--slotted-focus-ring-color": "The colour of the focus outline.", "--slotted-focus-ring-color-invalid": "The colour of the focus outline of a control in error; an element in error points `--slotted-focus-ring-color` at it." } },
  { "id": "target", "reader": "application", "purpose": "How small an interactive target may be.", "tokens": { "--slotted-target-min": "The smallest target in both axes: 24 by 24 CSS pixels.", "--slotted-target-comfortable": "The size a target grows to under a coarse pointer." } },
  { "id": "tone", "reader": "application", "purpose": "What an element carrying an intent is painted with: five tones, each with the same nine roles.", "pattern": "--slotted-tone-{tone}-{role}", "dimensions": { "tone": { "accent": "The product's intent: the primary action, the chosen option, the current place.", "secondary": "A second intent beside accent, for an action or a mark that must not compete with it.", "success": "A result that completed or a state that is healthy.", "warning": "A state that needs attention before it becomes a failure.", "danger": "A failure, an error or an action that destroys data." }, "role": { "solid": "A filled ground: the primary button of the tone.", "solid-hover": "The filled ground under the pointer.", "solid-active": "The filled ground while pressed.", "on-solid": "Text and icons on the filled ground.", "surface": "A tinted ground; a state that must be seen pairs it with the tone's border.", "subtle-hover": "The tint under the pointer of an element with no filled ground.", "subtle-active": "That tint while pressed.", "border": "An edge in the tone, at the non-text contrast ratio against the page and against its own surface.", "text": "Text in the tone on a surface." } } },
  { "id": "data", "reader": "application", "purpose": "What a series of data is painted with: a line, a bar, a slice. Slots are assigned in order and never skipped.", "pattern": "--slotted-data-{slot}", "dimensions": { "slot": "open" } },
  { "id": "control", "reader": "application", "purpose": "What a control's text and frame look like at every size.", "tokens": { "--slotted-control-font-family": "The typeface of a control's text.", "--slotted-control-font-weight": "The weight of a control's label.", "--slotted-control-line-height": "The line height of a control's text.", "--slotted-control-letter-spacing": "The letter spacing of a control's text.", "--slotted-control-border-width": "The edge width of a control at rest.", "--slotted-control-radius": "The corner of a control.", "--slotted-control-shadow-focus-geometry": "Offset, blur and spread of the shadow a focused control draws, with no colour; drawn with `--slotted-focus-ring-color`.", "--slotted-control-transition-duration": "How long a control takes to change state.", "--slotted-control-transition-easing": "The curve of a control's change of state.", "--slotted-control-invalid-edge-width": "The edge an invalid control adds inside its border, so the state reads where colour cannot.", "--slotted-control-border-color": "The edge colour of a control at rest.", "--slotted-control-surface": "The ground of a control at rest: a field, an outline button.", "--slotted-control-shadow": "The shadow of a control at rest." } },
  { "id": "control-size", "reader": "application", "purpose": "The size and inner spacing of a control at each size step; every value follows density.", "pattern": "--slotted-control-{part}-{size}", "dimensions": { "part": { "height": "The block size of the control.", "padding-inline": "The inline space between the control's edge and its content.", "font-size": "The size of the control's text.", "icon-size": "The size of an icon inside the control.", "gap": "The space between items inside the control, and between one choice and the next in a group.", "label-gap": "The space between a binary control — a box, a circle, a switch — and its own label.", "inner-size": "The block size of what stands inside the control: a key, a chip, a clear mark." }, "size": { "sm": "The small step.", "md": "The medium step.", "lg": "The large step." } } },
  { "id": "selection", "reader": "application", "purpose": "The size of a selection control and of the halo behind it.", "tokens": { "--slotted-selection-size-sm": "The box of a checkbox and the circle of a radio at the small step.", "--slotted-selection-size-md": "The box and the circle at the medium step.", "--slotted-selection-size-lg": "The box and the circle at the large step.", "--slotted-selection-halo-opacity": "The share of `--slotted-tone-accent-text` in the halo behind a selection control under the pointer." } },
  { "id": "highlight", "reader": "application", "purpose": "How strong the band behind a matched span is.", "tokens": { "--slotted-highlight-tint-opacity": "The share of `--slotted-tone-accent-text` in the band behind a matched span." } },
  { "id": "current", "reader": "application", "purpose": "How the place the reader is on is marked.", "tokens": { "--slotted-current-edge": "The edge of the row the reader is on, drawn over its tone ground." } },
  { "id": "scrim", "reader": "application", "purpose": "The veil under a modal surface.", "tokens": { "--slotted-scrim": "The veil between the page and a modal surface above it." } },
  { "id": "icon", "reader": "family", "purpose": "The geometry of an icon a family draws itself; an icon of the application's own is drawn with the `icon` family.", "pattern": "--slotted-icon-{glyph}", "dimensions": { "glyph": "open" } },
  { "id": "upload-kind", "reader": "family", "purpose": "The tile colours of file kinds in `upload` and `attachment`.", "pattern": "--slotted-upload-kind-{kind}", "dimensions": { "kind": "open" } },
  { "id": "code", "reader": "family", "purpose": "The colours of syntax scopes in `code-block`.", "pattern": "--slotted-code-{scope}", "dimensions": { "scope": "open" } },
  { "id": "rating", "reader": "family", "purpose": "The edge of a star in `rating`.", "tokens": { "--slotted-rating-edge": "The edge of a star." } },
  { "id": "avatar-size", "reader": "family", "purpose": "The sizes of `avatar`, smallest first.", "pattern": "--slotted-avatar-size-{size}", "dimensions": { "size": "open" } }
],
```

Run `pnpm exec prettier --write packages/theme/src/contract.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @slotted/theme exec vitest run src/token-groups.test.ts`
Expected: PASS, 7 tests. Uma linha restante aponta um nome deste plano que difere do contrato; o grupo é corrigido para o nome do contrato.

- [ ] **Step 5: Conferir os exemplos de `duration` contra as famílias**

Run: `for s in short medium long; do echo "$s: $(grep -rl -- "--slotted-duration-$s" packages/styles/src --include='*.css' | xargs -n1 basename | tr '\n' ' ')"; done`
Expected: `medium` aparece em `popover`, `menu` ou `tooltip`; `long` em `drawer` ou `action-sheet`. Um exemplo que nenhuma família confirma é trocado por uma família listada na saída (Ruling no ledger).

- [ ] **Step 6: `docs/token-foundation.md` perde as frases de propósito**

Remover cada parágrafo que começa por "This scale answers" quando ele é uma única frase; quando o parágrafo continua (Glyph, Selection geometry, Highlight), remover só a primeira frase. Acrescentar ao fim da seção "Layers":

```markdown
What each group of tokens is for is stated once, in `groups` of
`packages/theme/src/contract.json`; the published `tokens.md` of each binding
is generated from it.
```

Run: `grep -c "This scale answers" docs/token-foundation.md`
Expected: `0`.

- [ ] **Step 7: Regenerate and run the package tests**

Run: `pnpm --filter @slotted/theme generate && pnpm --filter @slotted/theme test`
Expected: PASS; `src/generated/contract.ts` sem `groups` (`grep -c groups packages/theme/src/generated/contract.ts` → `0`).

- [ ] **Step 8: Commit**

```bash
git add packages/theme/src/contract.json packages/theme/src/token-groups.test.ts docs/token-foundation.md packages/theme/src/generated
git commit -m "feat(theme): o contrato diz para que serve cada token — 30 grupos, 25 lidos pela aplicação e 5 só pela família; token-foundation remete aos grupos em vez de repetir o propósito"
```

---

### Task 3: `tokens.md` renderizado

**Files:**
- Create: `tools/agent-docs/src/tokens.ts`
- Create: `tools/agent-docs/src/tokens.test.ts`
- Modify: `tools/agent-docs/src/references.ts` (`loadCatalog`: ids de grupo)
- Modify: `tools/agent-docs/src/references.test.ts`

**Interfaces:**
- Consumes: `groupCovers`, `dimensionValues`, `TokenGroup` de `packages/theme/src/token-groups.ts`.
- Produces: `loadTokenSource(root): TokenSource`, `renderTokens(source): string`, `resolveValue(value, scope, base): string`; nomes de kind `token-group` no catálogo.

- [ ] **Step 1: Write the failing test** — `tools/agent-docs/src/tokens.test.ts`

```ts
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadTokenSource, renderTokens, resolveValue, type TokenSource } from './tokens.ts';

const source: TokenSource = {
  tokens: [
    { name: '--slotted-space-1', layer: 'primitive', axis: 'base' },
    { name: '--slotted-space-2', layer: 'primitive', axis: 'base' },
    { name: '--slotted-duration-short', layer: 'primitive', axis: 'base' },
    { name: '--slotted-control-height-md', layer: 'semantic', axis: 'density' },
    { name: '--slotted-tone-accent-solid', layer: 'semantic', axis: 'scheme' },
    { name: '--slotted-surface', layer: 'semantic', axis: 'scheme' },
    { name: '--slotted-rating-edge', layer: 'component', axis: 'scheme' },
  ],
  groups: [
    { id: 'space', reader: 'application', purpose: 'Separation.', pattern: '--slotted-space-{step}', dimensions: { step: 'open' } },
    { id: 'duration', reader: 'application', purpose: 'Time.', pattern: '--slotted-duration-{step}', dimensions: { step: { short: 'A control changing state.' } } },
    { id: 'control-size', reader: 'application', purpose: 'Size.', pattern: '--slotted-control-{part}-{size}', dimensions: { part: { height: 'The block size.' }, size: { md: 'The medium step.' } } },
    { id: 'tone', reader: 'application', purpose: 'Intent.', pattern: '--slotted-tone-{tone}-{role}', dimensions: { tone: { accent: 'The intent.' }, role: { solid: 'A filled ground.' } } },
    { id: 'surface', reader: 'application', purpose: 'Grounds.', tokens: { '--slotted-surface': 'The ground of a card.' } },
    { id: 'rating', reader: 'family', purpose: 'A star.', tokens: { '--slotted-rating-edge': 'The edge.' } },
  ],
  values: {
    base: {
      '--slotted-space-1': '0.125rem',
      '--slotted-space-2': 'calc(var(--slotted-space-1) * 2)',
      '--slotted-duration-short': '120ms',
    },
    densities: {
      comfortable: { '--slotted-control-height-md': '34px' },
      compact: { '--slotted-control-height-md': '28px' },
      dense: {},
    },
    reducedMotion: { '--slotted-duration-short': '1ms' },
  },
};

describe('resolveValue', () => {
  it('replaces each var() by its value, and leaves one with no value', () => {
    expect(resolveValue('calc(var(--slotted-space-1) * 2)', {}, source.values.base)).toBe('calc(0.125rem * 2)');
    expect(resolveValue('var(--slotted-x)', {}, {})).toBe('var(--slotted-x)');
  });
});

describe('renderTokens', () => {
  const page = renderTokens(source);

  it('a base token has its resolved value, a reduced-motion value is stated', () => {
    expect(page).toContain('| `--slotted-space-2` | — | calc(0.125rem * 2) |');
    expect(page).toContain('| `--slotted-duration-short` | A control changing state. | 120ms; 1ms under reduced motion |');
  });

  it('a density token has a value per density, and a missing one reads as a dash', () => {
    expect(page).toContain(
      '| `--slotted-control-height-md` | The block size. The medium step. | comfortable 34px, compact 28px, dense — |',
    );
  });

  it('a pattern group states its names and its dimensions; a colour has no value', () => {
    expect(page).toContain('Names: --slotted-tone-{tone}-{role}');
    expect(page).toContain('| accent | The intent. |');
    expect(page).not.toContain('`--slotted-tone-accent-solid`');
    expect(page).toContain('| `--slotted-surface` | The ground of a card. | by scheme |');
  });

  it('a family group is listed last, outside the application groups', () => {
    const family = page.indexOf('## Read by their family only');
    expect(family).toBeGreaterThan(page.indexOf('## surface'));
    expect(page.slice(family)).toContain('- rating: A star. Names: --slotted-rating-edge');
  });

  it('puts between backticks only token names', () => {
    for (const [, name] of page.matchAll(/`([^`]+)`/g)) expect(name).toMatch(/^--slotted-[a-z0-9-]+$/);
  });
});

describe('the theme', () => {
  it('every application token of the contract is on the page', () => {
    const real = loadTokenSource(resolve(import.meta.dirname, '../../..'));
    const page = renderTokens(real);
    expect(real.groups.length).toBeGreaterThan(0);
    expect(page).toContain('`--slotted-space-6`');
    expect(page).toContain('Names: --slotted-tone-{tone}-{role}');
    expect(page).not.toContain('`--slotted-icon-check`');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/tokens.test.ts`
Expected: FAIL — `Failed to resolve import "./tokens.ts"`.

- [ ] **Step 3: Write minimal implementation** — `tools/agent-docs/src/tokens.ts`

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  dimensionValues,
  groupCovers,
  type TokenGroup,
} from '../../../packages/theme/src/token-groups.ts';

/**
 * The published `tokens.md`: the theme's groups an element of the
 * application's own reads, with the default theme's values. Generated from
 * `packages/theme/src/contract.json` and
 * `packages/themes/src/default/values.json`; never written by hand.
 */
export interface ThemeToken {
  name: string;
  layer: string;
  axis: 'base' | 'scheme' | 'density';
}
export interface ThemeValues {
  base: Record<string, string>;
  densities: Record<string, Record<string, string>>;
  reducedMotion: Record<string, string>;
}
export interface TokenSource {
  tokens: ThemeToken[];
  groups: TokenGroup[];
  values: ThemeValues;
}

const DENSITIES = ['comfortable', 'compact', 'dense'] as const;

export function loadTokenSource(root: string): TokenSource {
  const read = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));
  const contract = read('packages/theme/src/contract.json') as {
    tokens: ThemeToken[];
    groups?: TokenGroup[];
  };
  return {
    tokens: contract.tokens,
    groups: contract.groups ?? [],
    values: read('packages/themes/src/default/values.json') as ThemeValues,
  };
}

/** `value` with each `var()` replaced by its value in `scope`, then in `base`; one with no value stays. */
export function resolveValue(
  value: string,
  scope: Record<string, string>,
  base: Record<string, string>,
  depth = 0,
): string {
  return value.replace(/var\((--slotted-[a-z0-9-]+)\)/g, (whole, name: string) => {
    const next = scope[name] ?? base[name];
    return next === undefined || depth > 8 ? whole : resolveValue(next, scope, base, depth + 1);
  });
}

function valueCell(token: ThemeToken, values: ThemeValues): string {
  if (token.axis === 'scheme') return 'by scheme';
  if (token.axis === 'density')
    return DENSITIES.map((density) => {
      const scope = values.densities[density] ?? {};
      const value = scope[token.name];
      return `${density} ${value === undefined ? '—' : resolveValue(value, scope, values.base)}`;
    }).join(', ');
  const value = values.base[token.name];
  const resolved = value === undefined ? '—' : resolveValue(value, {}, values.base);
  const reduced = values.reducedMotion[token.name];
  return reduced === undefined ? resolved : `${resolved}; ${reduced} under reduced motion`;
}

function meaningCell(group: TokenGroup, name: string): string {
  if (group.tokens !== undefined) return group.tokens[name] ?? '—';
  const meanings = Object.entries(dimensionValues(group, name)).flatMap(([slot, value]) => {
    const dimension = group.dimensions?.[slot];
    return dimension === undefined || dimension === 'open' ? [] : [dimension[value] ?? ''];
  });
  return meanings.length === 0 ? '—' : meanings.join(' ');
}

const INTRO = [
  '# Tokens',
  '',
  "The theme states every value the families draw with. An element of the application's own reads the groups on this page, never a literal, and never a token of a group under \"Read by their family only\" (CP-05, OE-01).",
  '',
  'A primitive is a step on a scale; a semantic token says what a value is for. Values are the default theme\'s. A colour has no value here: it changes with the scheme — light, dark, high-contrast — and is chosen by its role. A value that follows density is given for comfortable, compact and dense.',
  '',
];

export function renderTokens(source: TokenSource): string {
  const lines = [...INTRO];
  const members = (group: TokenGroup) =>
    source.tokens.filter((token) => groupCovers(group, token.name));
  for (const group of source.groups.filter((group) => group.reader === 'application')) {
    lines.push(`## ${group.id}`, '', group.purpose, '');
    const dimensions = Object.entries(group.dimensions ?? {});
    if (group.pattern !== undefined) {
      lines.push(`Names: ${group.pattern}`, '');
      for (const [slot, meanings] of dimensions)
        if (meanings !== 'open')
          lines.push(
            `| ${slot} | Meaning |`,
            '| --- | --- |',
            ...Object.entries(meanings).map(([value, meaning]) => `| ${value} | ${meaning} |`),
            '',
          );
    }
    const tokens = members(group);
    const derivable =
      group.pattern !== undefined && dimensions.every(([, meanings]) => meanings !== 'open');
    if (derivable && tokens.every((token) => token.axis === 'scheme')) continue;
    lines.push(
      '| Token | Meaning | Default value |',
      '| --- | --- | --- |',
      ...tokens.map(
        (token) =>
          `| \`${token.name}\` | ${meaningCell(group, token.name)} | ${valueCell(token, source.values)} |`,
      ),
      '',
    );
  }
  const family = source.groups.filter((group) => group.reader === 'family');
  if (family.length > 0)
    lines.push(
      '## Read by their family only',
      '',
      "A family adjusts these for itself. An element of the application's own does not read them.",
      '',
      ...family.map(
        (group) =>
          `- ${group.id}: ${group.purpose.replaceAll('`', '')} Names: ${group.pattern ?? Object.keys(group.tokens ?? {}).join(', ')}`,
      ),
      '',
    );
  return lines.join('\n');
}
```

O propósito de um grupo da aplicação pode citar uma família entre crases (`typography`) e um id de grupo (`shadow`); o teste "puts between backticks only token names" usa o fixture, que não cita nenhum. O teste de conteúdo da Task 4 verifica a página real contra o catálogo.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/tokens.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Write the failing test** — em `references.test.ts`, dentro do `describe` de `loadCatalog`:

```ts
it('names each token group of the theme', () => {
  const catalog = loadCatalog(root);
  expect(catalog.names.get('z-index')).toBe('token-group');
  expect(catalog.names.get('duration')).toBe('token-group');
});
```

(`root` é a constante do topo do arquivo; se o arquivo a nomeia de outro jeito, usar esse nome.)

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/references.test.ts`
Expected: FAIL — `expected undefined to be 'token-group'`.

- [ ] **Step 6: Implement** — em `loadCatalog`, trocar a leitura do tema por:

```ts
  const theme = JSON.parse(
    readFileSync(join(root, 'packages/theme/src/contract.json'), 'utf8'),
  ) as {
    tokens: { name: string }[];
    groups?: { id: string }[];
  };
  for (const token of theme.tokens) add(token.name, 'token');
  for (const group of theme.groups ?? []) add(group.id, 'token-group');
```

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/references.test.ts src/tokens.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add tools/agent-docs/src/tokens.ts tools/agent-docs/src/tokens.test.ts tools/agent-docs/src/references.ts tools/agent-docs/src/references.test.ts
git commit -m "feat(agent-docs): renderTokens — tokens.md a partir dos grupos do contrato e dos valores do tema padrão: valor resolvido, três densidades, nenhum valor para cor; o catálogo resolve os ids de grupo"
```

---

### Task 4: o build publica `tokens.md`

**Files:**
- Modify: `tools/agent-docs/src/build.ts`
- Modify: `tools/agent-docs/src/render.ts` (`renderIndex`)
- Modify: `tools/agent-docs/src/render.test.ts`
- Modify: `tools/agent-docs/src/build.test.ts`
- Modify: `tools/agent-docs/src/content.test.ts` (`published`, `local`)

**Interfaces:**
- Consumes: `loadTokenSource`, `renderTokens` (Task 3).
- Produces: `<docs>/tokens.md` em cada binding; seção `## Tokens` em `index.md`.

- [ ] **Step 1: Write the failing tests**

`render.test.ts`, no teste que já verifica `## Guidelines` e `## Skills` com `renderIndex`, acrescentar:

```ts
    expect(index).toContain(
      "## Tokens\n\nWhat each theme token is for, with its default value: `./tokens.md`. An element of the application's own reads only these.",
    );
```

`build.test.ts`, no primeiro teste de `buildDocs`, depois de `expect(files).toContain('AGENTS.snippet.md');`:

```ts
    expect(files).toContain('tokens.md');
    expect(readFileSync(join(a, 'tokens.md'), 'utf8')).toContain('`--slotted-space-6`');
```

`content.test.ts`: importar `loadTokenSource, renderTokens` de `./tokens.ts`, e

```ts
const published = [
  ...content.topics.map((topic) => [topic.file, renderTopic(topic)] as const),
  ['README.md', content.readme] as const,
  ['tokens.md', renderTokens(loadTokenSource(root))] as const,
  ...[...content.skills].map(([name, skill]) => [`skills/${name}`, skill.source] as const),
];
```

e acrescentar a `local`: `'tokens.md'` e `'{{docsDir}}/tokens.md'`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/render.test.ts src/build.test.ts src/content.test.ts`
Expected: FAIL em `render.test.ts` (sem `## Tokens`) e `build.test.ts` (sem `tokens.md`). `content.test.ts` passa ou falha nomeando um nome entre crases de um `purpose`; um nome que não resolve sai das crases no grupo do contrato (Ruling no ledger).

- [ ] **Step 3: Implement**

`render.ts`, em `renderIndex`, antes do bloco `if (content.topics.length > 0)`:

```ts
  lines.push(
    '## Tokens',
    '',
    "What each theme token is for, with its default value: `./tokens.md`. An element of the application's own reads only these.",
    '',
  );
```

`build.ts`: importar `loadTokenSource, renderTokens` de `./tokens.ts`; depois de escrever `AGENTS.snippet.md`:

```ts
  writeFileSync(join(out, 'tokens.md'), renderTokens(loadTokenSource(root)));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/render.test.ts src/build.test.ts src/content.test.ts`
Expected: PASS. Um teste de `render.test.ts` que compara o índice inteiro ganha a seção Tokens no texto esperado. Um `BudgetError` do índice é resolvido encurtando a frase da seção Tokens, não o orçamento.

- [ ] **Step 5: Commit**

```bash
git add tools/agent-docs/src/build.ts tools/agent-docs/src/render.ts tools/agent-docs/src/render.test.ts tools/agent-docs/src/build.test.ts tools/agent-docs/src/content.test.ts
git commit -m "feat(agent-docs): cada binding publica tokens.md, citado pelo index.md; o texto passa pelo catálogo e pelo filtro de publicação"
```

---

### Task 5: o site serve `tokens.md`

**Files:**
- Modify: `apps/docs/src/lib/agent-docs.ts`
- Create: `apps/docs/src/pages/[framework]/tokens.md.ts`
- Modify: `apps/docs/src/pages/llms.txt.ts`
- Modify: `apps/docs/scripts/agent-outputs.test.mjs`

**Interfaces:**
- Consumes: `packages/<binding>/dist/docs/tokens.md` (Task 4).
- Produces: rota `/<binding>/tokens.md`; seção `## <Binding> tokens` em `llms.txt`.

- [ ] **Step 1: Write the failing test** — `agent-outputs.test.mjs`

```js
test('tokens.md is served per binding, as the package ships it', () => {
  for (const binding of ['react', 'angular'])
    assert.equal(
      readFileSync(`${dist}${binding}/tokens.md`, 'utf8'),
      readFileSync(`${packageDocs[binding]}tokens.md`, 'utf8'),
      `${binding}/tokens.md`,
    );
});
```

e, no teste de `llms.txt`, o total esperado ganha uma página por binding:

```js
      sum + families.length + guidelinePages(binding).length + skillNames(binding).length + 1,
```

- [ ] **Step 2: Build the bindings and run to verify it fails**

Run: `pnpm --filter @slotted/react build && pnpm --filter @slotted/angular build && pnpm --filter @slotted/docs build && pnpm --filter @slotted/docs test:outputs`
Expected: FAIL — `ENOENT ... dist/react/tokens.md`.

- [ ] **Step 3: Implement**

`agent-docs.ts`: `const NOT_PAGES = new Set(['index', 'AGENTS.snippet', 'tokens']);` e

```ts
/** The token page a binding ships: `tokens.md`. */
export function agentTokens(binding: AgentBinding): string {
  return readFileSync(resolve(docsDir(binding), 'tokens.md'), 'utf8');
}
```

`apps/docs/src/pages/[framework]/tokens.md.ts`:

```ts
import type { APIRoute, GetStaticPaths } from 'astro';

import { AGENT_BINDINGS, agentTokens, type AgentBinding } from '../../lib/agent-docs';

/** The token page of both bindings, as the package ships it. */
export const getStaticPaths = (() =>
  AGENT_BINDINGS.map((framework) => ({ params: { framework } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(agentTokens(params['framework'] as AgentBinding), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
```

`llms.txt.ts`, depois do laço dos componentes:

```ts
    lines.push('', `## ${AGENT_BINDING_LABELS[binding]} tokens`, '');
    lines.push(`- [tokens](/${binding}/tokens.md)`);
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter @slotted/docs verify`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/lib/agent-docs.ts "apps/docs/src/pages/[framework]/tokens.md.ts" apps/docs/src/pages/llms.txt.ts apps/docs/scripts/agent-outputs.test.mjs
git commit -m "feat(docs): o site serve tokens.md de cada binding e o lista no llms.txt"
```

---

### Task 6: tópico `own-elements.md`

**Files:**
- Create: `tools/agent-docs/content/guidelines/own-elements.md`
- Modify: `tools/agent-docs/content/guidelines/ids.json` (OE-01..OE-10; o arquivo sai na Task 7)
- Modify: `tools/agent-docs/src/references.ts` (`REFERENCE_EXCEPTIONS`)
- Modify: `tools/agent-docs/content/guidelines/README.md` (passo 3)
- Modify: `tools/agent-docs/content/skills/compose-screen/SKILL.md`
- Test: `tools/agent-docs/src/content.test.ts` (existente)

**Interfaces:**
- Consumes: ids de grupo no catálogo (Task 3), `{{docsDir}}/tokens.md` em `local` (Task 4).
- Produces: regras ativas OE-01..OE-10.

- [ ] **Step 1: Conferir as regras contra as famílias**

Run: `grep -n "focus-visible" -A3 packages/styles/src/button/button.css | head; grep -n "surface-raised\|shadow-md\|z-index-popover" packages/styles/src/popover/popover.css`
Expected: `button` desenha `outline` com `--slotted-focus-ring-width`, `--slotted-focus-ring-color` e `outline-offset` com `--slotted-focus-ring-offset`; `popover` lê `--slotted-surface-raised`, `--slotted-shadow-md` e `--slotted-z-index-popover`. Divergência → a regra segue a família (Ruling).

- [ ] **Step 2: Write the topic** — `tools/agent-docs/content/guidelines/own-elements.md`

```markdown
---
topic: own elements
prefix: OE
triggers:
  [custom element, own component, bespoke, widget, CSS, style, token, hover, focus, animation]
families: [button, typography]
---

# Own elements

How an element no family draws is built from the theme: which tokens it reads,
how its states yield, and what it keeps under focus, touch, forced colours and
reduced motion. The families meet each rule below; an element of the
application's own meets them through the same tokens. Where a family answers
the problem, the family is used instead (CP-04).

### OE-01 · Own elements read application tokens

Level: MUST
Applies to: every element of the application's own that paints, spaces or moves
Rule: An element of the application's own reads only tokens of the groups `{{docsDir}}/tokens.md` lists for the application.
Why: A token of a family-only group is that family's adjustment and changes with it; an application group is the theme's promise.
Do: A strip of day cells spaces with `--slotted-space-2`, paints a busy day with `--slotted-tone-warning-surface` and rounds with `--slotted-radius-sm`.
Don't: A cell takes its height from `--slotted-avatar-size-sm` because the number fit.
Check: Every custom property of the element's own CSS that starts with --slotted- is listed in a group of tokens.md above "Read by their family only".

### OE-02 · Weaker states yield

Level: MUST
Applies to: an interactive element of the application's own
Rule: Where two states hold at once, the element draws the stronger, in the order `disabled`, `loading`, `readonly`, `invalid`, `checked`, `selected`, `pressed`, `current`, `complete`, `active`, `hover`, `focus-visible`.
Why: A disabled element that lights under the pointer reads as operable and answers nothing.
Do: The hover rule of a day cell excludes the disabled and the selected cell, so a selected day keeps its ground under the pointer.
Don't: A hover ground declared after the selected ground repaints the chosen day while the pointer crosses it.
Check: Put the pointer over a disabled, a selected and a current instance: each keeps the appearance of its stronger state.

### OE-03 · Focus draws the theme's ring

Level: MUST
Applies to: every element of the application's own that takes focus
Rule: In its `focus-visible` state the element draws an outline of `--slotted-focus-ring-width` in `--slotted-focus-ring-color`, offset by `--slotted-focus-ring-offset`.
Why: The ring is the one focus indicator the families share, and the theme maps its colour to the system highlight under forced colours.
Do: A day cell draws the outline in `focus-visible` and keeps it while selected; in error it points `--slotted-focus-ring-color` at `--slotted-focus-ring-color-invalid`.
Don't: `outline: none` on the cell, with a change of ground as the only sign of focus.
Check: Move focus with the keyboard in the light, dark and high-contrast schemes: the ring is drawn at the theme's width and offset in each.

### OE-04 · Targets meet the minimum

Level: MUST
Applies to: every element of the application's own that a pointer activates
Rule: The element's hit area measures at least `--slotted-target-min` in both axes, and at least `--slotted-target-comfortable` under `pointer: coarse`.
Why: A target below the minimum fails WCAG 2.2 target size, and a fingertip misses a target sized for a mouse.
Do: A day cell narrower than the minimum keeps its drawing and extends its hit area to the minimum.
Don't: Day cells 16 pixels wide, side by side with no gap.
Check: Measure the hit area of the smallest instance with a fine pointer and under coarse-pointer emulation.

### OE-05 · One control size step

Level: SHOULD
Applies to: an element of the application's own that stands in a row of controls
Rule: The element takes its height, inline padding, font size and gap from `--slotted-control-*` tokens of one size step, the step of the controls beside it.
Why: The control tokens follow density; a control sized by hand keeps its height when the row around it shrinks.
Do: A week picker beside a `button` at the medium step reads `--slotted-control-height-md`, `--slotted-control-padding-inline-md`, `--slotted-control-font-size-md` and `--slotted-control-gap-md`.
Don't: A height taken from the space scale that matches the button only at the comfortable density.
Check: Switch the density among comfortable, compact and dense: the element's height equals the height of the button beside it in each.

### OE-06 · Forced colours keep states

Level: MUST
Applies to: an element of the application's own that shows a state
Rule: Under `forced-colors: active`, each state the element shows differs from rest by a border, an outline or text, not by a ground or a shadow alone.
Why: The system replaces every ground with its own and removes shadows, so a state carried by colour alone disappears.
Do: A selected day adds an edge of `--slotted-border-width-thick` to its tinted ground.
Don't: A selected day told apart only by `--slotted-tone-accent-surface`.
Check: Emulate forced colours and step through every state: each reads differently from rest.

### OE-07 · Motion follows the scale

Level: MUST
Applies to: every transition and animation of an element of the application's own
Rule: A transition takes its duration from the `duration` group and its curve from the `easing` group, and an animation that repeats stops under `prefers-reduced-motion: reduce`.
Why: The theme collapses transition durations under reduced motion; a literal duration and a loop stay outside that collapse.
Do: A cell eases its ground over `--slotted-duration-short` with `--slotted-easing-standard`; its pulsing marker stops under reduced motion and keeps its shape.
Don't: A 300 ms transition written as a literal, and a pulse that only slows down.
Check: Emulate reduced motion: no animation of the element runs, and its transitions complete at once.

### OE-08 · Own CSS stays outside families

Level: SHOULD
Applies to: the stylesheet and the markup of an element of the application's own
Rule: The element's rules stand in a layer of the application ordered after the library's, and never select or set `data-ui` or `data-part`.
Why: Those attributes name a family and its parts; a rule keyed on them changes a family, and a node that carries them is taken for one.
Do: The strip's layer is declared after the library's in the application's entry stylesheet, and its rules key on its own class names.
Don't: A rule keyed on a family's `data-part` that restyles the family beside the strip.
Check: Search the element's CSS and markup for data-ui and data-part, and read the application's layer statement: the library's layer comes first.

### OE-09 · Reflow follows the container

Level: SHOULD
Applies to: an element of the application's own that changes layout with width
Rule: The element reflows by a container query on a `container-name` of its own; a change that follows the page uses the size classes, at 600 and 1024 pixels.
Why: The families reflow by their own container and the page by its size class; a viewport query disagrees with both inside a split view.
Do: The strip names its container and drops to two rows of cells below its own threshold.
Don't: A viewport media query that folds the strip after its panel is already narrow.
Check: At a fixed viewport, resize the element's container across its threshold and the page across 600 and 1024 pixels.

### OE-10 · Elevation pairs surface and shadow

Level: SHOULD
Applies to: an element of the application's own that stands above another surface
Rule: A surface above another takes `--slotted-surface-raised` with one step of the `shadow` group, and a layer that floats over the page takes its stacking order from the `z-index` group.
Why: The theme pairs each elevation with a ground per scheme and drops shadows under forced colours; a shadow or a stacking order written by hand stays outside both.
Do: A day's detail card floats with `--slotted-surface-raised`, `--slotted-shadow-md` and `--slotted-z-index-popover`.
Don't: A shadow written as a literal and a stacking order of 9999.
Check: Every shadow and every stacking order of the element's own CSS reads a token of these two groups.
```

Run: `pnpm exec prettier --write tools/agent-docs/content/guidelines/own-elements.md`

- [ ] **Step 3: Register the ids** — em `ids.json`, entre `LP-*` e `OV-*` na ordem alfabética do arquivo:

```json
  "OE-01": { "level": "MUST", "status": "active" },
  "OE-02": { "level": "MUST", "status": "active" },
  "OE-03": { "level": "MUST", "status": "active" },
  "OE-04": { "level": "MUST", "status": "active" },
  "OE-05": { "level": "SHOULD", "status": "active" },
  "OE-06": { "level": "MUST", "status": "active" },
  "OE-07": { "level": "MUST", "status": "active" },
  "OE-08": { "level": "SHOULD", "status": "active" },
  "OE-09": { "level": "SHOULD", "status": "active" },
  "OE-10": { "level": "SHOULD", "status": "active" },
```

seguido de `pnpm exec prettier --write tools/agent-docs/content/guidelines/ids.json`.

- [ ] **Step 4: Run to see which names fail**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: FAIL em `own-elements.md names only what the library publishes` com `["data-ui","data-part","container-name"]`.

- [ ] **Step 5: Add the exceptions** — em `REFERENCE_EXCEPTIONS`:

```ts
  'data-ui': 'the attribute that names a family on its root (OE-08)',
  'data-part': 'the attribute that names a part of a family (OE-08)',
  'container-name': 'the CSS property an element of its own names its container with (OE-09)',
```

- [ ] **Step 6: The reading guide and `compose-screen` cite the topic**

`content/guidelines/README.md`, passo 3 do protocolo:

```markdown
3. Before writing an element beside a family, read that family's page in
   `{{docsDir}}`. Before writing an element no family draws, read
   `own-elements.md` and `{{docsDir}}/tokens.md`.
```

`compose-screen/SKILL.md`, passo 2, novo item 5:

```markdown
5. Add `own-elements.md` when the screen writes an element of its own.
```

e, no passo 4, o último item passa a:

```markdown
- Where no anatomy answers the problem, the screen writes an element of its
  own instead of bending a family into a shape it does not have (CP-04). That
  element follows `own-elements.md` and reads its tokens from
  `{{docsDir}}/tokens.md`.
```

- [ ] **Step 7: Run to verify it passes**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts src/build.test.ts`
Expected: PASS. Um nome entre crases ainda não resolvido sai das crases no texto da regra (Ruling).

- [ ] **Step 8: Commit**

```bash
git add tools/agent-docs/content/guidelines/own-elements.md tools/agent-docs/content/guidelines/ids.json tools/agent-docs/content/guidelines/README.md tools/agent-docs/content/skills/compose-screen/SKILL.md tools/agent-docs/src/references.ts
git commit -m "feat(agent-docs): tópico own-elements (OE-01..OE-10) — tokens da aplicação, precedência de estados, anel de foco, alvo mínimo, tamanho de controle, forced colors, movimento, camada própria, refluxo por container e elevação; compose-screen e o guia de leitura remetem a ele e a tokens.md"
```

---

### Task 7: registro de IDs derivado dos tópicos

**Files:**
- Modify: `tools/agent-docs/src/registry.ts` (reescrito)
- Modify: `tools/agent-docs/src/registry.test.ts` (reescrito)
- Modify: `tools/agent-docs/src/content.ts` (exporta `NOT_TOPICS`)
- Modify: `tools/agent-docs/src/content.test.ts`
- Modify: `scripts/release.mjs`
- Modify: `scripts/release.test.mjs` (nome de um teste)
- Modify: `tools/agent-docs/content/guidelines/writing-rules.md`
- Delete: `tools/agent-docs/content/guidelines/ids.json`

**Interfaces:**
- Produces: `registryOf(topics): Registry`, `registryErrors(current, previous): string[]`, `registryAt(root, ref): Registry | undefined`, `previousRegistry(root)`, `currentRegistry(root)`. `RegistryEntry` = `{ status; level?; replacedBy? }`.

- [ ] **Step 1: Write the failing test** — `registry.test.ts` inteiro:

```ts
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { Topic } from './guidelines.ts';
import { registryAt, registryErrors, registryOf, type Registry } from './registry.ts';

const root = resolve(import.meta.dirname, '../../..');

function topic(rules: Topic['rules']): Topic {
  return { file: 'x.md', topic: 'x', prefix: 'AF', triggers: [], families: [], frontmatter: '', title: 'X', intro: '', rules };
}
const active = (id: string, level: 'MUST' | 'SHOULD' = 'MUST') =>
  ({ id, title: id, status: 'active', level, fields: [['Level', level]] }) as Topic['rules'][number];
const retired = (id: string, statusText: string) =>
  ({ id, title: id, status: 'retired', statusText, fields: [] }) as Topic['rules'][number];

describe('registryOf', () => {
  it('reads each rule: an active one with its level, a retired one with what replaced it', () => {
    expect(
      registryOf([
        topic([
          active('AF-01'),
          retired('AF-02', 'rewritten as AF-03, which keeps one scroller'),
          active('AF-03', 'SHOULD'),
          retired('AF-04', 'a domain rule'),
        ]),
      ]),
    ).toEqual({
      'AF-01': { status: 'active', level: 'MUST' },
      'AF-02': { status: 'retired', replacedBy: 'AF-03' },
      'AF-03': { status: 'active', level: 'SHOULD' },
      'AF-04': { status: 'retired' },
    });
  });
});

describe('registryErrors', () => {
  it('with no previous release, nothing to compare', () => {
    expect(registryErrors({}, undefined)).toEqual([]);
  });

  it('against the previous release: an id removed, a level changed, a retired id reused', () => {
    const previous: Registry = {
      'AF-01': { status: 'active', level: 'MUST' },
      'AF-02': { status: 'active', level: 'SHOULD' },
      'AF-03': { status: 'retired' },
    };
    const current: Registry = {
      'AF-01': { status: 'active', level: 'SHOULD' },
      'AF-03': { status: 'active', level: 'MUST' },
    };
    expect(registryErrors(current, previous)).toEqual([
      'AF-01: level changed from MUST to SHOULD; retire it and issue a new id',
      'AF-02: released before, gone from the topics',
      'AF-03: retired before, active again',
    ]);
  });
});

describe('registryAt', () => {
  it('reads the topics a commit has', () => {
    expect(registryAt(root, 'HEAD')?.['AF-01']?.status).toBe('active');
  });

  it('a commit without the guidelines, or no repository, has none', () => {
    expect(registryAt(root, 'v0.1.0-beta.0')).toBeUndefined();
    expect(registryAt('/nonexistent', 'HEAD')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/registry.test.ts`
Expected: FAIL — `registryOf is not a function` (ou erro de import equivalente).

- [ ] **Step 3: Write the implementation** — `registry.ts` inteiro:

```ts
import { execFileSync } from 'node:child_process';

import { loadContent, NOT_TOPICS } from './content.ts';
import { parseTopic, type Level, type Topic } from './guidelines.ts';

/**
 * Every rule id the topics hold, with its status, its level while active, and
 * the id that rewrote it. Read from the topics themselves: the heading is the
 * id, `Level` the level, `Status: retired · rewritten as XX-NN` the rewrite.
 * Against the last release, an id is never removed or reused, and an active
 * rule keeps its level.
 */
export interface RegistryEntry {
  status: 'active' | 'retired';
  level?: Level;
  replacedBy?: string;
}
export type Registry = Record<string, RegistryEntry>;

const GUIDELINES = 'tools/agent-docs/content/guidelines';
const REWRITTEN = /\brewritten as ([A-Z]{2}-\d{2})\b/;

export function registryOf(topics: readonly Topic[]): Registry {
  const registry: Registry = {};
  for (const topic of topics)
    for (const rule of topic.rules) {
      if (rule.status === 'active') {
        registry[rule.id] = { status: 'active', level: rule.level! };
        continue;
      }
      const replacedBy = REWRITTEN.exec(rule.statusText ?? '')?.[1];
      registry[rule.id] =
        replacedBy === undefined ? { status: 'retired' } : { status: 'retired', replacedBy };
    }
  return registry;
}

export function registryErrors(current: Registry, previous: Registry | undefined): string[] {
  const errors: string[] = [];
  for (const [id, before] of Object.entries(previous ?? {})) {
    const now = current[id];
    if (now === undefined) errors.push(`${id}: released before, gone from the topics`);
    else if (before.status === 'retired' && now.status === 'active')
      errors.push(`${id}: retired before, active again`);
    else if (before.status === 'active' && now.status === 'active' && before.level !== now.level)
      errors.push(
        `${id}: level changed from ${before.level} to ${now.level}; retire it and issue a new id`,
      );
  }
  return errors.sort();
}

function git(root: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/** The registry of the topics `ref` holds; none when `ref` has no guidelines. */
export function registryAt(root: string, ref: string): Registry | undefined {
  try {
    const files = git(root, ['ls-tree', '--name-only', ref, `${GUIDELINES}/`])
      .split('\n')
      .map((path) => path.slice(GUIDELINES.length + 1))
      .filter((file) => file.endsWith('.md') && !NOT_TOPICS.has(file));
    if (files.length === 0) return undefined;
    return registryOf(
      files.map((file) => parseTopic(file, git(root, ['show', `${ref}:${GUIDELINES}/${file}`]))),
    );
  } catch {
    return undefined;
  }
}

/** The registry of the last `v*` tag; none before the first release that carries guidelines. */
export function previousRegistry(root: string): Registry | undefined {
  try {
    return registryAt(root, git(root, ['describe', '--tags', '--abbrev=0', '--match', 'v*']).trim());
  } catch {
    return undefined;
  }
}

export function currentRegistry(root: string): Registry {
  return registryOf(loadContent(root).topics);
}
```

Em `content.ts`: `export const NOT_TOPICS = new Set(['README.md', 'writing-rules.md', 'index.md']);`

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/registry.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: The content test reads the derived registry; `ids.json` goes**

Em `content.test.ts`, trocar o teste `ids.json matches the topics and the last release` por:

```ts
  it('every id the last release carried is still in a topic, at its level or retired', () => {
    expect(registryErrors(registryOf(content.topics), previousRegistry(root))).toEqual([]);
  });
```

com o import `import { previousRegistry, registryErrors, registryOf } from './registry.ts';` e sem `contentDir`/`Registry` se não restar uso.

Run: `git rm -q tools/agent-docs/content/guidelines/ids.json && pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: PASS.

- [ ] **Step 6: The release reads the same registry**

`scripts/release.mjs`: importar `import { currentRegistry, registryAt } from '../tools/agent-docs/src/registry.ts';`; trocar o bloco de `idsPath` por

```js
  const guidelines = guidelineChanges(
    registryAt(repositoryRoot, previous) ?? {},
    currentRegistry(repositoryRoot),
  );
```

e o comentário de `guidelineChanges` por `/** The guideline ids a release adds, retires and rewrites, read from the topics at the last tag and now. */`. Em `release.test.mjs`, o teste `the first release with ids.json lists its active rules as added, and no retired one` passa a se chamar `the first release with guidelines lists its active rules as added, and no retired one`.

Run: `pnpm test:release`
Expected: PASS.

- [ ] **Step 7: `writing-rules.md` sem `ids.json`**

Na seção "Identity", depois do item sobre a regra aposentada:

```markdown
- A rule rewritten under a new number says so in its status:
  `Status: retired · rewritten as LP-12, which …`. The release notes read the
  new id from those words.
```

No passo 5 de "Before a rule enters the index":

```markdown
5. The heading's id is new in its topic; `index.md` and the release notes
   are generated from the topics.
```

Run: `grep -rn "ids.json" tools/agent-docs scripts AGENTS.md docs/README.md | grep -v node_modules`
Expected: nenhuma linha.

- [ ] **Step 8: Commit**

```bash
git add tools/agent-docs/src/registry.ts tools/agent-docs/src/registry.test.ts tools/agent-docs/src/content.ts tools/agent-docs/src/content.test.ts scripts/release.mjs scripts/release.test.mjs tools/agent-docs/content/guidelines/writing-rules.md
git commit -m "refactor(agent-docs): o registro de ids é lido dos tópicos, agora e na última tag; ids.json sai, e uma regra nova é editada num arquivo só; o release lê o mesmo registro"
```

---

### Task 8: guias do mantenedor e de skills

**Files:**
- Create: `tools/agent-docs/README.md`
- Create: `tools/agent-docs/content/skills/writing-skills.md`
- Modify: `tools/agent-docs/src/content.ts` (`loadContent`: só diretórios)
- Modify: `tools/agent-docs/src/content.test.ts` (casos por skill)
- Modify: `AGENTS.md` (parágrafo "Layout")

**Interfaces:**
- Consumes: `eval/cases.json` (`cases[].skill`).

- [ ] **Step 1: Write the failing test** — em `content.test.ts`, `describe('skills')`:

```ts
  it('every skill has an evaluation case, and every case names a skill', () => {
    const cases = (
      JSON.parse(readFileSync(join(root, 'tools/agent-docs/eval/cases.json'), 'utf8')) as {
        cases: { skill: string }[];
      }
    ).cases;
    expect([...content.skills.keys()].filter((name) => !cases.some((c) => c.skill === name))).toEqual([]);
    expect(cases.map((c) => c.skill).filter((skill) => !content.skills.has(skill))).toEqual([]);
  });
```

Criar `tools/agent-docs/content/skills/writing-skills.md` com o conteúdo do Step 3.

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: FAIL — `ENOTDIR` / `ENOENT ... writing-skills.md/SKILL.md` ao carregar as skills.

- [ ] **Step 2: Implement** — em `loadContent`:

```ts
  for (const name of existsSync(skillsDir) ? readdirSync(skillsDir).sort() : [])
    if (existsSync(join(skillsDir, name, 'SKILL.md')))
      skills.set(name, parseSkill(readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8')));
```

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts src/build.test.ts`
Expected: PASS.

- [ ] **Step 3: `content/skills/writing-skills.md`**

~~~markdown
# Writing a product skill

A product skill is a procedure the consumer's agent runs on its own
application. It ships in `@slotted/react` and `@slotted/angular` under
`docs/skills/<name>/SKILL.md`; the snippet of each binding names it.

## One directory per skill

`<name>/SKILL.md`, and nothing else in the directory. This file is the only
file of `content/skills/` that is not a skill; it is never published.

```
---
name: <the directory's name>
description: Use when <the task, in the words a request would contain>. <What the skill decides.>
---
```

The content test fails when `name` differs from the directory, when the
description does not start with "Use when", or when the file passes 500 lines.

## What a skill may write

- `{{docsDir}}`, replaced by the docs directory of the binding, and
  `{{package}}`, replaced by the package name. No other placeholder.
- Rule ids of active rules only (`AF-05`). A rule retired later fails the
  content test until the skill cites its replacement.
- Between backticks, only what the catalog resolves: families, parts, states,
  axes, tokens, token groups, topic files, `{{docsDir}}/…` paths that exist.
- No code block, no relative link, no name of the repository's demo.

## Evaluation

Every skill has at least one case in `tools/agent-docs/eval/cases.json`; the
content test fails without one. A case states a prompt a consumer would write
and the assertions a conforming answer passes. A change to a skill, or to a
rule a skill cites, is followed by `pnpm eval:agent-docs` before the next
release; the report is committed in `docs/history/evals/`.
~~~

- [ ] **Step 4: `tools/agent-docs/README.md`**

```markdown
# @slotted/agent-docs

Builds the documentation an agent reads from the installed package —
`dist/docs` of `@slotted/react`, `docs` of `@slotted/angular` — and checks the
material published with it: guidelines, product skills and the token page.

## What to edit

| Change                       | Edit                                                                 | Verify                                              | Evaluation before release |
| ---------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- | ------------------------- |
| New rule                     | its topic in `content/guidelines/`, by `writing-rules.md`            | `pnpm --filter @slotted/agent-docs verify`          | yes                       |
| Rule reworded, same meaning  | the rule's fields; the id stays                                      | same                                                | yes                       |
| Rule changes meaning or level | `Status: retired · rewritten as XX-NN` on the old id, a new id below | same                                                | yes                       |
| Rule retired                 | `Status: retired · <reason>`; the body goes                          | same                                                | yes                       |
| New topic                    | a file in `content/guidelines/` with a new two-letter prefix         | same                                                | yes                       |
| New or changed skill         | `content/skills/<name>/SKILL.md`, by `content/skills/writing-skills.md`; a case in `eval/cases.json` | same | yes                       |
| New theme token              | `packages/theme/src/contract.json`: the token and its group          | `pnpm --filter @slotted/theme test`, then the line above | no                   |
| Snippet                      | `agents-snippet.react.md`, `agents-snippet.angular.md`               | `pnpm --filter @slotted/agent-docs verify`          | yes                       |

## Generated, never edited

- `guidelines/index.md` of each binding, from the topics.
- `tokens.md`, from the groups of `packages/theme/src/contract.json` and the
  values of `packages/themes/src/default/values.json`.
- The reference catalog the content test resolves names against, from the
  family contracts, the theme contract and the stylesheets.
- The release notes' guideline block, from the topics at the last tag and now.
- The site routes and `llms.txt` of `apps/docs`, from the built packages.

## Release

1. Build the bindings: `pnpm --filter @slotted/react build && pnpm --filter @slotted/angular build`.
2. Pack the betas: `node scripts/pack-beta.mjs --only @slotted/react,@slotted/angular,@slotted/core,@slotted/theme,@slotted/themes`.
3. When `content/` changed since the last tag: `pnpm eval:agent-docs`, and
   commit the report it writes in `docs/history/evals/`.
4. `pnpm release`.
```

Run: `pnpm exec prettier --write tools/agent-docs/README.md tools/agent-docs/content/skills/writing-skills.md`
Expected: os dois arquivos formatados.

- [ ] **Step 5: `AGENTS.md`** — no parágrafo de "Layout" que começa por "Agent material published to consumers", acrescentar ao fim:

```markdown
What to edit for each change, what is generated, and the release sequence are in `tools/agent-docs/README.md`.
```

- [ ] **Step 6: Run the package check**

Run: `pnpm --filter @slotted/agent-docs verify`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add tools/agent-docs/README.md tools/agent-docs/content/skills/writing-skills.md tools/agent-docs/src/content.ts tools/agent-docs/src/content.test.ts AGENTS.md
git commit -m "docs(agent-docs): guia do mantenedor (o que editar, o que é gerado, sequência de release) e guia de escrita de skills; cada skill exige um caso de avaliação e cada caso uma skill existente"
```

---

### Task 9: caso de avaliação `own-element`

**Files:**
- Modify: `tools/agent-docs/eval/cases.json`

- [ ] **Step 1: Add the case** — ao fim de `cases`:

```json
{
  "id": "own-element",
  "skill": "compose-screen",
  "prompt": "Write the team capacity screen in src/: a strip of the next 30 days, one focusable and selectable cell per day, each cell tinted by the day's load (low, normal, high, over), with the selected day's assignments listed below the strip; read from fetchCapacity() in src/api.ts, which you also write as a stub returning a Promise.",
  "assertions": [
    { "kind": "no-literal" },
    { "kind": "mentions", "pattern": "focus-visible[\\s\\S]{0,400}--slotted-focus-ring-" },
    { "kind": "mentions", "pattern": "--slotted-tone-" }
  ]
}
```

- [ ] **Step 2: Dry run**

Run: `pnpm eval:agent-docs --dry-run`
Expected: `108 session(s), model claude-sonnet-5-5`.

- [ ] **Step 3: Content test**

Run: `pnpm --filter @slotted/agent-docs exec vitest run src/content.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tools/agent-docs/eval/cases.json
git commit -m "test(agent-docs): caso own-element — uma faixa de dias que nenhuma família desenha, conferida por ausência de literal, anel de foco do tema e tons"
```

---

### Task 10: verificação final

- [ ] **Step 1:** `pnpm check` → verde.
- [ ] **Step 2:** `pnpm --filter @slotted/theme test` → verde.
- [ ] **Step 3:** `pnpm --filter @slotted/agent-docs verify` → verde.
- [ ] **Step 4:** `pnpm --filter @slotted/docs verify` (bindings construídos na Task 5) → verde.
- [ ] **Step 5:** `pnpm test:release` → verde.
- [ ] **Step 6:** atualizar `.claude/progress/product-agent-material.md` com o estado e a próxima ação: rodada `pnpm eval:agent-docs` (108 sessões, cerca de US$ 37) quando aprovada.
