# Arquitetura de tematização — desenho

Subprojeto 1 de 3. O subprojeto 2 é o catálogo de presets; o subprojeto 3 é a troca de tema em runtime nas docs e na demo Nexora. As medições de §2 são de 2026-10-01, sobre o ramo `review/implementation-pass-1`.

## 1. Termos

- **tema**: objeto produzido por `defineTheme`, compilado para CSS e selecionado por `data-slotted-theme`.
- **preset**: tema publicado em `@slotted/themes`.
- **semente**: cor de entrada, declarada como custom property `--slotted-seed-<nome>`, da qual a receita deriva os tokens de cor.
- **receita**: estrutura de dados que associa cada token de cor, por esquema, a uma derivação de uma semente.
- **token de componente**: custom property pública de uma família, sem valor por omissão, lida com fallback para um token semântico.
- **regra de tema**: regra CSS transportada por um tema, emitida com o escopo desse tema.

## 2. Estado substituído

| Facto | Medida |
| --- | --- |
| Formato de um tema | `packages/theme-default/src/theme.json`, 541 linhas, só valores de token |
| Tokens no contrato (`packages/tokens/src/contract.json`) | 264: 121 primitivos, 115 semânticos, 28 de componente |
| Tokens de cor por esquema | 99 (76 semânticos, 23 de componente), em hex literal |
| Tokens editados para trocar a cor de destaque | 9 `--slotted-tone-accent-*` × 3 esquemas |
| Tokens de componente no contrato de tokens | 28, em 4 grupos: `upload-kind`, `code`, `rating`, `avatar-size` |
| Tokens de componente lidos pelas famílias fora do contrato | 2293, em 118 famílias, cada um lido com fallback e listado no `<família>.tokens.json` da família; nenhum tema os define; `button` não tem nenhum |
| Famílias com folha em `packages/styles/src` | 123 contratos em `specs/components`; 83 896 linhas de CSS |
| Variáveis lidas pelas famílias para cor e geometria | privadas (`--_*`), atribuídas a partir de tokens semânticos |
| Regras CSS dentro de um tema | não suportadas pelo formato |
| Troca em runtime nas docs e na Nexora | esquema e densidade; tema fixo em `default` |
| Atributos espelhados por um portal (`packages/core/src/portal/portal.ts`) | `dir`, `data-slotted-theme`, `data-slotted-scheme`, `data-slotted-density` |

## 3. Requisitos

1. Um tema transporta tokens nos três níveis (primitivo, semântico, componente) e regras CSS com escopo de tema. Um preset pode alterar a aparência de uma família por sobreposição de propriedades.
2. Uma cor-semente arbitrária, definida em runtime, gera todos os tokens de cor dos três esquemas sem build.
3. Os nomes de token são tipados contra o contrato. Um tema compõe-se a partir de outro.
4. O mesmo tema compila no build (CSS estático) e em runtime (folha injetada).

## 4. Pacotes

| Pacote | Conteúdo |
| --- | --- |
| `@slotted/theme` | Substitui `@slotted/tokens`. Exporta `contract.json`, o tipo `TokenName` gerado do contrato, `defineTheme`, `extendTheme`, `renderTheme`, `applyTheme`, `seedStyle`, `recipes` e os testes de conformidade reutilizáveis. `renderTheme` e `applyTheme` não importam módulos de Node. |
| `@slotted/theme/cli` | Binário `slotted-build-theme`. Lê o módulo do tema, valida as regras com lightningcss 1.33.0 (versão já resolvida no lockfile por `vite`) e escreve `dist/<nome>.css` e `dist/<nome>.js`. |
| `@slotted/themes` | Substitui `@slotted/theme-default`. Um preset por subpath: `@slotted/themes/<preset>.css` e `@slotted/themes/<preset>` (objeto do tema). |

Um tema de terceiros é um pacote que depende só de `@slotted/theme`.

## 5. Camadas

```css
@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components, slotted.theme-rules;
```

- `slotted.theme`: valores de token por tema, esquema e densidade.
- `slotted.theme-rules`: regras de tema. Vence `slotted.components` pela ordem de camada.
- A declaração de ordem abre cada folha distribuída, como hoje. `LAYER_NAMES` em `layer-order.mjs` recebe `theme-rules`.
- A ADR `docs/decisions/0004-theming-architecture.md` regista a nova ordem e substitui a tabela de subcamadas da ADR 0001.

## 6. Seleção e escopo

- `data-slotted-theme`, `data-slotted-scheme` e `data-slotted-density` mantêm a semântica atual e são aninháveis.
- `data-slotted-scheme="system"` resolve para `light` ou `dark` por `@media (prefers-color-scheme: dark)`. O compilador emite o bloco `dark` dentro dessa media query para o seletor `system`.
- As sementes são custom properties registadas com `@property` (`syntax: '<color>'`, `inherits: true`, `initial-value: gray`). O registo é comum a todos os temas; o valor de cada tema é declarado no seu bloco base. Um valor que não é cor computa como `gray`.
- Cada bloco de esquema é emitido com escopo:
  ```css
  @scope ([data-slotted-theme="t"][data-slotted-scheme="s"], [data-slotted-theme="t"] [data-slotted-scheme="s"], [data-slotted-scheme="s"] [data-slotted-theme="t"])
    to ([data-slotted-scheme], [data-slotted-theme]) {
    :scope, [data-slotted-seeds] { color-scheme: …; /* tokens do esquema */ }
  }
  ```
  O limite exclui os subárvores com outro esquema ou tema. A raiz de escopo mais próxima vence pela proximidade de escopo da cascata. Medido no Chrome 150: um `[data-slotted-seeds]` dentro de `dark` dentro de `light` recebe a derivação de `dark`; a raiz não é excluída pelo seu próprio limite.
- Um elemento com o atributo `data-slotted-seeds` volta a derivar os tokens de cor a partir das sementes que tem, dentro do esquema mais próximo. Sem esse atributo, nem `data-slotted-theme` nem `data-slotted-scheme`, um elemento herda os tokens já derivados do ancestral.
- O terceiro seletor de raiz cobre um `data-slotted-theme` aninhado sem esquema próprio.

## 7. Objeto do tema

```ts
type Scheme = 'light' | 'dark' | 'high-contrast';
type Density = 'comfortable' | 'compact' | 'dense';
type SeedName = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';
type TokenValues<T extends TokenName> = Partial<Record<T, string>>;

interface ThemeDefinition {
  name: string;                                   // [a-z][a-z0-9-]*
  seeds: Record<SeedName, string>;                // #rrggbb ou oklch(L C H)
  recipe: Recipe;
  base?: TokenValues<BaseToken>;
  schemes?: Partial<Record<Scheme, TokenValues<SchemeToken>>>;
  densities?: Partial<Record<Density, TokenValues<DensityToken>>>;
  reducedMotion?: TokenValues<MotionToken>;
  components?: TokenValues<ComponentToken>;
  fonts?: FontFace[];                             // { family, src, weight?, style?, display? }
  rules?: (string | URL)[];                       // CSS em texto, ou URL de um ficheiro .css
}
```

- `defineTheme(definition)` valida em runtime o que o tipo não cobre (nome, sementes nos dois formatos aceites) e devolve um `Theme` imutável.
- Uma regra dada como `URL` é lida pelo CLI (§4), que escreve em `dist/<nome>.js` o tema com todas as regras em texto. `renderTheme` e `applyTheme` recusam um tema com uma regra `URL` por ler.
- O parser de sementes vive em `@slotted/theme`. `scripts/verify-package-layers.mjs` coloca `@slotted/theme` na camada 10 e `@slotted/core` na 20; uma camada inferior não importa uma superior.
- `extendTheme(base, overrides, { name })` faz merge profundo dos objetos de valores, substitui `seeds` e `recipe` quando presentes e concatena `rules` depois das de `base`.
- Precedência por token de cor: receita < `schemes`.
- Um token do contrato sem valor é erro de `defineTheme`. Tokens de componente não têm esta obrigação. Um tema novo parte de `extendTheme(default, ...)` para herdar os valores que não altera.

## 8. Receita

### 8.1 Estrutura

```ts
interface Bound {
  side: 'ceiling' | 'floor';  // teto ou piso da luminosidade
  l: number;                  // valor com croma 0
  k: number[];                // 27 coeficientes: potências 1–3 do croma × {1, cos nh, sin nh}, n = 1–4
}

interface SeedDerivation {
  seed: SeedName;
  l: number | { offset: number; min?: number; max?: number }; // fixo, ou clamp(min, l da semente + offset, max)
  c: { scale: number; max: number };                          // min(c da semente × scale, max)
  h?: number;                                                 // deslocamento do matiz; omisso = 0
  bounds?: Bound[];                                           // no máximo um por lado
}

type Derivation =
  | SeedDerivation
  | { mix: TokenName; share: number; bounds?: Bound[] }
  | { alias: TokenName };

type Recipe = Record<Scheme, Partial<Record<ColorToken, Derivation>>>;
```

### 8.2 Emissão CSS

| Derivação | CSS |
| --- | --- |
| `seed` | `oklch(from var(--slotted-seed-accent) clamp(0.38, calc(l + 0.058), 0.56) min(calc(c * 0.99), 0.25) calc(h + 0))` |
| `mix` | `color-mix(in oklch, var(X), oklch(from var(X) clamp(0, calc((0.9 - l) * 1000000), 1) 0 none) 6%)` |
| `bounds` | a cor acima envolvida em `oklch(from <cor> min(l, <P>) c h)` (teto) ou `max(l, <P>)` (piso), com `P = calc(L + c * (T1 + c * (T2 + c * T3)))` e `Tp = k + k·cos(calc(h * 1deg)) + k·sin(calc(h * 1deg)) + … + k·sin(calc(h * 4deg))` |
| `alias` | `var(Y)` |

- `mix` move para branco quando `l ≤ 0.9` e para preto acima disso. É a regra atual de `tone-hover.mjs`. O matiz `none` do alvo faz `color-mix` manter o matiz de `X`.
- O texto sobre um sólido é uma derivação `seed` com luminosidade fixa.
- Um `bound` é o limite de luminosidade acima ou abaixo do qual a cor deixa de cumprir um rácio contra um alvo de luminância. A luminância relativa de uma cor OKLCH depende do matiz e do croma além de `l`: a luminosidade máxima com texto branco a 4.5:1 é 0.568 com croma 0 e varia ±0.13 × croma com o matiz. Um limite independente do matiz não garante o rácio a todos os matizes e reproduz o vermelho atual (`#dc2626`, l 0.577) só a esse matiz. O `bound` é um ajuste por mínimos quadrados do limite exato sobre croma 0–0.25 e matiz 0–357, deslocado pelo maior erro do ajuste para ficar sempre do lado seguro; o maior erro medido é 0.0108.
- Medido no Chrome 150: `oklch(from oklch(from …) min(l, calc(… cos(calc(h * 1deg)) …)) c h)`, `color-mix(in oklch, …, oklch(from … none))` e `@scope … to (…)` calculam os valores do avaliador.

### 8.3 Avaliador

`evaluateRecipe(recipe, seeds, scheme)` em `@slotted/theme` calcula, com a mesma aritmética da tabela de §8.2, a cor OKLCH de cada token. Consumidores: os testes de §13, o painel de tema do subprojeto 3 e `theme-conformance`.

### 8.4 Âmbito da receita

- Derivados: os 45 `--slotted-tone-*`, as 4 superfícies, `--slotted-text`, `--slotted-text-muted`, `--slotted-text-inverse`, `--slotted-border-subtle`, `--slotted-border-strong`, `--slotted-control-border-color`, `--slotted-control-surface`, os 3 `--slotted-disabled-*`, `--slotted-focus-ring-color` e `--slotted-focus-ring-color-invalid`.
- O tom `secondary` deriva da semente `neutral`.
- Literais por tema: `--slotted-shadow-*`, `--slotted-control-shadow`, `--slotted-data-*`, `--slotted-code-*`, `--slotted-upload-kind-*`, `--slotted-current-edge`, `--slotted-scrim`, `--slotted-rating-edge`. Uma receita pode derivá-los.
- `recipes.standard` é a única receita publicada neste subprojeto.

### 8.5 Garantia

Para toda semente da grelha matiz 0–345 em passos de 15, croma {0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35} e luminosidade 0.2–0.95 em passos de 0.05:

1. cada rácio é calculado duas vezes, com a luminância da cor sem corte e com a luminância da cor cortada por canal ao gamut sRGB, e o menor dos dois é o que conta. Um token fora de sRGB é mostrado sem corte num ecrã P3 e cortado num ecrã sRGB;
2. os rácios de `theme-conformance` passam: 4.5:1 texto e 3:1 não-texto em `light` e `dark`, 7:1 texto em `high-contrast`, 1.5:1 para a borda de controlo em repouso, passo de luminosidade OKLab ≥ 0.02 entre realce neutro e superfície.

`packages/theme/scripts/calibrate-standard-recipe.mjs` gera `recipes.standard` a partir dos valores atuais do `default`: ajusta cada token ao valor atual, limita o croma (0.25 nos tokens que seguem a semente, 0.06 nos neutros, o croma atual + 0.01 nas superfícies tingidas) e acrescenta um `bound` a cada sólido, texto de tom, borda de destaque e passo de `hover`/`active`, contra o pior chão ou tinta do mesmo esquema na grelha.

Protótipo medido em 2026-10-01: a grelha passa sem falhas e o `default` reproduz-se com diferença OKLab ≤ 0.02 em todos os tokens exceto dois, `light` `--slotted-tone-success-text` (0.034) e `dark` `--slotted-tone-accent-solid-hover` (0.021).

## 9. Tokens de componente

- O mecanismo já existe: uma família lê `var(--slotted-text-field-radius, var(--slotted-control-radius, 4px))`, o token fica indefinido e o fallback dá o valor atual. `packages/styles/src/tokens.test.mjs` obriga o `<família>.tokens.json` a listar exatamente as custom properties que as folhas da família leem.
- Registo: o conjunto de tokens de componente é a união dos `<família>.tokens.json`, menos os tokens do contrato de tokens, menos as propriedades de runtime de `packages/styles/src/runtime-properties.mjs`. `scripts/generate-token-types.mjs` gera desse conjunto o tipo `ComponentToken` e a lista `COMPONENT_TOKENS`.
- `defineTheme` recusa uma chave de `components` fora de `COMPONENT_TOKENS`.
- Este subprojeto não acrescenta tokens a nenhuma família. `button` lê `--slotted-control-*` diretamente, pelo motivo registado em `button.css` (um alias perdia o aumento sob `pointer: coarse`); um tema diferencia `button` por regra de tema.

## 10. Regras de tema

### 10.1 Emissão

```css
@layer slotted.theme-rules {
  @scope ([data-slotted-theme='aura']) to ([data-slotted-theme]:not([data-slotted-theme='aura'])) {
    /* regras do tema */
  }
}
```

- O limite inferior impede que as regras de um tema exterior se apliquem num subárvore com outro tema.
- `@keyframes`, `@font-face` e `@property` são elevados para fora de `@scope`. O nome de cada `@keyframes` recebe o prefixo `slotted-<tema>-`, e as referências em `animation` e `animation-name` dentro das regras do tema são reescritas.

### 10.2 Validação no build

A validação lê a união dos `contract.json` de `specs/components`. Cada caso abaixo é erro, com mensagem que nomeia o ficheiro, a linha e o seletor:

1. erro de sintaxe CSS;
2. `[data-ui='x']` com `x` ausente de todo contrato;
3. `[data-part='p']` composto com `[data-ui='x']`, com `p` ausente das partes de `x`;
4. atributo `data-*` ausente do índice, exceto os três eixos de tema. O índice une os contratos (`data-<eixo>` de cada chave de `axes`, os valores de `stateAttributes`, as chaves de `dataAttributes`) e os atributos que as folhas de `packages/styles/src` selecionam. Os contratos declaram atributos em campos heterogéneos (`axes` em 118 de 123, `stateAttributes` em 109, `dataAttributes` em 21), por isso as folhas completam o índice;
5. `var(--_*)`;
6. `var(--slotted-*)` ausente do contrato de tokens e de `COMPONENT_TOKENS` (§9);
7. seletor de classe.

`applyTheme` não executa esta validação. O caminho de runtime aceita só temas cujas regras passaram no build do pacote que as publica, ou regras escritas pela aplicação.

## 11. Compilador

`renderTheme(theme)` devolve uma string com, por esta ordem:

1. a declaração de ordem de camadas;
2. `@property` das sementes;
3. `@font-face` de `fonts`;
4. `@layer slotted.theme`: bloco base com sementes, primitivos, semânticos base, glifos e tokens de componente; um bloco de escopo por esquema (§6), com a receita aplicada e as sobreposições; o bloco `system` com os valores de `light` e, dentro de `@media (prefers-color-scheme: dark)`, os de `dark`; um bloco por densidade; `pointer: coarse`; `forced-colors: active`, com os mesmos blocos de escopo por esquema; `prefers-reduced-motion: reduce`;
5. `@keyframes` elevados;
6. `@layer slotted.theme-rules` com o `@scope` de §10.1.

Os blocos de densidade, `pointer: coarse` e `prefers-reduced-motion` mantêm os seletores de `render-theme.mjs`.

## 12. Runtime e bindings

### 12.1 `@slotted/theme`

| Função | Contrato |
| --- | --- |
| `renderTheme(theme): string` | Pura. Usada no build e em SSR. |
| `applyTheme(theme, { document? }): () => void` | Insere ou substitui `<style data-slotted-theme-sheet="<nome>">` no `<head>`. Idempotente por nome. Emite `slotted-themechange` no `document`. O retorno remove a folha e emite o mesmo evento. |
| `seedStyle(seeds: Partial<Record<SeedName, string>>)` | Devolve `{ '--slotted-seed-<nome>': valor }`, para `style` em React e `[style]` em Angular. |

### 12.2 Bindings

- React: `ThemeScope`, com props `theme`, `scheme`, `density`, `seeds` e `render`. Escreve os atributos, o `style` das sementes e, com `seeds`, `data-slotted-seeds` no elemento que renderiza (`div` por omissão) ou no elemento devolvido por `render`.
- Angular: diretiva `slThemeScope`, com inputs `theme`, `scheme`, `density` e `seeds`, aplicada ao elemento hospedeiro, com o mesmo resultado.
- Atributos e `style` escritos à mão produzem o mesmo resultado que os bindings.

### 12.3 Correções em `@slotted/core`

1. `portal/portal.ts`: o elemento da camada recebe, além de `MIRRORED_ATTRIBUTES`, os valores computados de cada `--slotted-seed-*` na origem, escritos em `style`, e `data-slotted-seeds`. O observer existente passa a observar também `style` e `data-slotted-seeds`, filtrado aos registos cujo alvo contém a origem de uma camada.
2. `chart/theme.ts`: `observeChartTheme` agenda a releitura também em `slotted-themechange`.

## 13. Testes

| Alvo | Teste |
| --- | --- |
| Receita | Vitest: grelha de §8.5 com `evaluateRecipe` e os rácios de §8.5. |
| Paridade CSS ↔ JS | Cenário de browser `theme-recipe-parity`: 64 sementes da grelha; diferença OKLab entre a cor computada pelo browser e `evaluateRecipe` < 0.005 por token. |
| Compilador | Snapshot do CSS do tema de prova; presença e ordem dos blocos de §11; `@keyframes` com prefixo e referências reescritas. |
| Validação | Uma fixture negativa por caso de §10.2; cada uma falha com a mensagem esperada. |
| Escopo | Cenário de browser `theme-scope-nesting`: tema B dentro de tema A; nenhuma regra de A se aplica em B; um overlay aberto em B, portado para o `<body>`, tem o tema, o esquema e a semente de destaque de B. |
| Tokens de componente | `COMPONENT_TOKENS` igual à união de §9; `defineTheme` recusa um nome fora dela; um valor em `components` sai no bloco base do tema. |
| Runtime | `applyTheme` idempotente; `dispose` remove a folha; `slotted-themechange` emitido nas duas operações. |
| Bindings | `ThemeScope` e `slThemeScope` escrevem atributos e sementes; um overlay aberto dentro deles herda-os. |
| Tema de prova | Fixture em `packages/theme/test/fixtures/proof/`, não publicada. Usa sementes, `recipes.standard`, dois tokens de componente de `text-field` e `card`, uma regra por sobreposição sobre `button` (raio total) e sobre `text-field` (borda só inferior), uma fonte, um `@keyframes` e um glifo substituído. |

Os dois cenários de browser são os únicos usos de automação de browser deste subprojeto.

## 14. Migração

- `@slotted/themes/default` é escrito com `defineTheme` e `recipes.standard`, com sementes iguais aos sólidos atuais.
- `packages/tokens/test/resolve.test.mjs` é substituído por: os tokens derivados do `default` reproduzem os valores atuais com diferença OKLab ≤ 0.02. Cada token acima da tolerância é registado em `docs/token-foundation.md` › "Current boundary", com valor anterior e novo.
- Consumidores atualizados no mesmo passo: `apps/docs`, `apps/storybook-react`, `apps/storybook-angular`, `demos/nexora/angular`, `tools/harness`, `scripts/`, testes de `packages/styles`, `packages/react` e `packages/angular` que importam o contrato, `specs/components` que o referenciam, `turbo.json` e o `package.json` da raiz.
- Documentos atualizados: `docs/styling.md`, `docs/token-foundation.md`, `docs/README.md`, `CONTRIBUTING.md` (secção dos pacotes), `docs/product/prd.md` §33 (matriz de §15).
- `docs/history/` e `docs/archive/` não são editados.

## 15. Matriz mínima de browsers

Chrome 119, Safari 18, Firefox 146. Requisitos: relative color syntax (`oklch(from ...)`), `@scope` com limite inferior, `@property`, `color-mix()`.

## 16. Fronteira

Fora deste subprojeto:

- presets além de `default` e a lista final de tokens de componente (subprojeto 2);
- catálogo de sementes nomeadas de destaque e de neutro (subprojeto 2);
- painel de tema nas docs, exportação de código `defineTheme` e preferência de tema na Nexora (subprojeto 3);
- adoção de `data-slotted-scheme="system"` em `apps/docs/src/layouts/Base.astro` e em `demos/nexora/angular/src/app/core/session/preferences.store.ts` (subprojeto 3): as folhas do site das docs e da Nexora têm regras próprias sob `[data-slotted-scheme='dark']` que o valor `system` deixaria de aplicar;
- substituição dos nove tokens de destaque que `demos/nexora/angular/src/styles.css` redefine por esquema por uma semente (subprojeto 3);
- receitas além de `recipes.standard`;
- desligar a folha de uma família a partir de um tema.

## 17. Critérios de conclusão

1. `@slotted/theme` e `@slotted/themes` substituem `@slotted/tokens` e `@slotted/theme-default`; nenhum ficheiro fora de `docs/history/` e `docs/archive/` referencia os nomes antigos.
2. Todos os testes de §13 passam, incluindo os dois cenários de browser.
3. `pnpm check:full` passa.
4. O `default` reproduz os valores atuais dentro da tolerância de §14, ou cada desvio está registado.
5. Na página inicial das docs, `document.documentElement.style.setProperty('--slotted-seed-accent', '#e11d48')` recolore os componentes nos três esquemas, sem recarregar.
