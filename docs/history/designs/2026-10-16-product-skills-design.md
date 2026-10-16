# Skills de produto: revisão de tela, elemento próprio e tema — desenho

Data: 2026-10-16. Subprojeto 3 de 4 do material de IA da Slotted. Segue [2026-10-16-tokens-and-own-elements-design.md](2026-10-16-tokens-and-own-elements-design.md). Decisões tomadas sem revisão do usuário, por delegação ("pode seguir com tudo que achar necessário").

## Objetivo

O agente de quem consome `@slotted/react` ou `@slotted/angular` revisa uma tela existente contra as guidelines, escreve um elemento que nenhuma família desenha e muda a aparência da aplicação pelo tema, lendo apenas o pacote instalado.

## Escopo

Dentro:

- skill `review-screen`;
- skill `build-own-element`;
- skill `theme-app`;
- catálogo de nomes com a API pública de `@slotted/theme`;
- placeholder `{{themeScope}}`, resolvido por binding;
- casos de avaliação com uma tela-semente e a asserção `absent`.

Fora:

- página de tematização gerada nos docs do binding: a skill `theme-app` carrega o procedimento, e a API citada é validada pelo catálogo;
- exportação de design system: subprojeto 4.

## 1. Skills

| Skill               | Dispara quando a tarefa…                                          | Decide                                                                                         |
| ------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `review-screen`     | revisa, audita ou corrige uma tela existente                      | quais regras ler, a varredura mecânica, o formato do achado e a ordem de correção              |
| `build-own-element` | escreve um componente, widget ou elemento que nenhuma família tem | a prova de que nenhuma família serve, o que é livre e o que é fixo, tokens por decisão visual  |
| `theme-app`         | muda cor de marca, esquema, densidade, fonte ou forma de controle | o nível de alcance (seed, token de controle, token de família, regra de tema) e onde declará-lo |

`compose-screen` remete a `build-own-element` no passo em que hoje remete a `own-elements.md`.

## 2. Catálogo

`loadCatalog` passa a ler:

- `theme-api`: exportações de valor de `packages/theme/src/index.ts`, o comando de `bin` de `packages/theme/package.json` e os subcaminhos de `exports` de `@slotted/theme` e `@slotted/themes`;
- `theme-attribute`: os atributos de eixo de tema de `packages/theme/src/rule-policy.ts`;
- `seed`: `--slotted-seed-<nome>` para cada nome de `SEED_NAMES`;
- `layer`: os nomes de `LAYER_NAMES`.

Um nome renomeado na API faz o teste de conteúdo falhar na skill que o cita.

## 3. Placeholder `{{themeScope}}`

React: o componente `ThemeScope` de `@slotted/react/theme`. Angular: a diretiva `slThemeScope` de `@slotted/angular/theme`. Um teste lê os dois nomes do código-fonte dos bindings.

## 4. Avaliação

- `cases.json` aceita `seed`: diretório em `eval/seeds/<seed>/<binding>/`, copiado sobre `src/` antes da sessão.
- Nova asserção `absent`: passa quando o padrão não ocorre nos arquivos.
- Casos: `review-orders` (tela-semente com cor literal, CSS sobre parte de família e botão sem espera), `seat-map` (elemento próprio com forced colors), `brand-theme` (seed de marca e esquema do sistema).
- Um teste de conteúdo falha quando um caso cita uma semente ausente em algum binding.

## 5. Snippet

As linhas de tarefa do snippet passam de tabela a lista, para que cinco skills caibam no orçamento de 2048 bytes.
