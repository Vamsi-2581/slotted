# Tokens, elementos próprios e manutenção do material de agente — desenho

Data: 2026-10-16. Subprojeto 2 de 4 do material de IA da Slotted. Segue [2026-10-16-product-agent-material-design.md](2026-10-16-product-agent-material-design.md).

## Objetivo

O agente de quem consome `@slotted/react` ou `@slotted/angular` escreve um elemento próprio — o que nenhuma família desenha — com os tokens e os estados da biblioteca, lendo apenas o pacote instalado. Cada informação do material de agente tem uma fonte; o resto é gerado e validado pelo build.

Elemento próprio: nó que a aplicação escreve e estiliza ela mesma, fora de qualquer família (CP-04).

## Escopo

Dentro:

- significado de cada token no contrato de `@slotted/theme`;
- `tokens.md` gerado nos docs de cada binding;
- tópico de guidelines `own-elements.md`, prefixo `OE`;
- registro de IDs derivado dos tópicos, sem `ids.json`;
- guia do mantenedor e guia de escrita de skills;
- um caso de avaliação para elementos próprios.

Fora:

- generalização das regras da demo (`RE`, `BD`, `CV`, `WS`, `LG`): ciclo seguinte;
- skill dedicada a elementos próprios: subprojeto 3;
- tabelas de valores de `docs/token-foundation.md`, que duplicam `packages/themes/src/default/values.json` sem validação;
- exportação de design system: subprojeto 4.

## 1. Significado no contrato

`packages/theme/src/contract.json` ganha `groups`. Cada grupo tem `id`, `purpose` (uma frase), `reader` e uma de duas formas:

- `pattern` e `dimensions`: `pattern` usa marcadores `{nome}`; cada dimensão é `"scale"` (passos ordenados, sem significado por valor) ou um mapa valor → significado;
- `tokens`: mapa nome → significado, para nomes sem padrão.

```json
{
  "id": "tone",
  "purpose": "What an element carrying an intent is painted with.",
  "reader": "application",
  "pattern": "--slotted-tone-{tone}-{role}",
  "dimensions": {
    "tone": { "accent": "…", "danger": "…" },
    "role": { "solid": "…", "on-solid": "…" }
  }
}
```

`reader` é `application` (uma aplicação lê) ou `family` (só a família lê). São `family`: todo token da camada `component`, os glifos `--slotted-icon-*`.

Um teste de `@slotted/theme` falha quando:

- um token do contrato casa com nenhum grupo ou com mais de um;
- um grupo casa com nenhum token;
- um valor de dimensão presente nos tokens não tem significado;
- um token `component` está num grupo `application`.

As frases "This scale answers…" de `docs/token-foundation.md` são removidas; o `purpose` do grupo é a fonte.

## 2. `tokens.md` gerado

O build de `tools/agent-docs` escreve `<docs>/tokens.md` em `@slotted/react` e `@slotted/angular`.

- Abertura: as três camadas e a regra de leitura — uma aplicação lê os grupos `application`.
- Uma seção por grupo `application`: `purpose` e tabela token · significado ou passo · valor.
- Valor por eixo do token: `base` — valor do tema padrão resolvido até o literal; `density` — três colunas `comfortable`, `compact`, `dense`; `scheme` — sem valor.
- Fim: grupos `family` como lista de nomes sob "Read by their family only".

`index.md` ganha a seção "Tokens"; `apps/docs` ganha a rota `[framework]/tokens.md` e a entrada em `llms.txt`. A página passa por `PUBLISHED_FORBIDDEN` e pelo catálogo de referências.

## 3. Tópico `own-elements.md`

Escrito à mão em `tools/agent-docs/content/guidelines/`, no formato de `writing-rules.md`. `triggers`: custom element, own component, bespoke, widget, CSS, style, token, hover, focus, animation.

| ID    | Nível  | Regra                                                                                                                                                                                                   |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OE-01 | MUST   | Um elemento próprio lê tokens de grupos `application` e nenhum de grupo `family`.                                                                                                                       |
| OE-02 | MUST   | Um estado mais fraco cede ao mais forte, na ordem disabled, loading, readonly, invalid, checked, selected, pressed, current, complete, active, hover, focus-visible.                                    |
| OE-03 | MUST   | `:focus-visible` desenha o anel do tema com `--slotted-focus-ring-width`, `--slotted-focus-ring-offset` e `--slotted-focus-ring-color`.                                                                 |
| OE-04 | MUST   | O alvo mede pelo menos `--slotted-target-min` nos dois eixos e cresce até `--slotted-target-comfortable` sob `pointer: coarse`.                                                                         |
| OE-05 | SHOULD | Um controle próprio toma altura, padding, fonte e gap de `--slotted-control-*` num único passo de tamanho.                                                                                              |
| OE-06 | MUST   | Sob `forced-colors: active`, cada estado se distingue por borda ou outline.                                                                                                                             |
| OE-07 | MUST   | O movimento lê `duration` e `easing`; uma animação infinita para sob `prefers-reduced-motion: reduce`.                                                                                                  |
| OE-08 | SHOULD | O CSS próprio fica na camada da aplicação, declarada depois de `slotted`, e não seleciona nem atribui `data-ui` ou `data-part`.                                                                          |
| OE-09 | SHOULD | O refluxo pelo container usa um `container-name` próprio; o refluxo pela página usa as classes de tamanho, limites `600px` e `1024px`.                                                                  |
| OE-10 | SHOULD | Uma superfície acima de outra combina `--slotted-surface-raised` com um passo de `shadow`; uma camada flutuante lê a escala `z`.                                                                         |

Cada regra tem `Check` executável por qualquer aplicação. A redação de cada regra é conferida contra o CSS das famílias antes de entrar; uma regra que contradiz a biblioteca não entra.

`compose-screen`: o passo 2 lê `own-elements.md` quando a tela escreve um elemento próprio; o item da CP-04 no passo 4 remete a `own-elements.md` e a `{{docsDir}}/tokens.md`.

## 4. Manutenção

### Registro de IDs

`ids.json` é removido. O registro é derivado dos tópicos: `{ id: { level, status } }` de cada `### XX-NN`. O registro anterior é o mesmo cálculo sobre os tópicos da última tag `v*`, lidos com `git show`; uma tag sem `tools/agent-docs/content/guidelines/` não tem registro anterior. Erros mantidos: ID lançado que sumiu, ID aposentado reativado, nível mudado sem ID novo. `scripts/release.mjs` (`guidelineChanges`) importa a função de `tools/agent-docs/src/registry.ts`. O passo 5 de `writing-rules.md` deixa de citar `ids.json`.

### Guia do mantenedor

`tools/agent-docs/README.md`, não publicado:

- tabela mudança · arquivo editado · comando de verificação · exige avaliação, para regra nova, regra reescrita, regra aposentada, tópico novo, skill nova ou alterada, grupo de tokens e snippet;
- o que é gerado e nunca editado à mão: `index.md`, `tokens.md`, catálogo de referências, rotas do site;
- a sequência de release: build dos bindings, empacotamento das betas, `pnpm eval:agent-docs`, relatório em `docs/history/evals/`.

O parágrafo "Layout" de `AGENTS.md` aponta para esse arquivo.

### Guia de skills

`tools/agent-docs/content/skills/writing-skills.md`, só na fonte: frontmatter, `description` iniciada por "Use when", limite de linhas, placeholders `{{docsDir}}` e `{{package}}`, citação só de IDs ativos, um caso de avaliação por skill. Um teste de conteúdo falha quando uma skill não tem caso em `tools/agent-docs/eval/cases.json` ou um caso nomeia uma skill inexistente.

## 5. Avaliação

Caso novo `own-element`, skill `compose-screen`: o prompt pede uma tela com um elemento que nenhuma família desenha. Asserções: nenhum literal de cor; `:focus-visible` lê `--slotted-focus-ring-*`. A rodada completa passa a 108 sessões, estimadas em US$ 37, e roda só com aprovação.

## 6. Verificação

- `pnpm --filter @slotted/theme test`: cobertura dos grupos.
- `pnpm --filter @slotted/agent-docs verify`: render de `tokens.md`, registro derivado, conteúdo de `own-elements.md`, casos por skill.
- `pnpm --filter @slotted/docs verify`: rota e `llms.txt`.
- `pnpm test:release`: `guidelineChanges` sobre o registro derivado.
- `pnpm check`.
