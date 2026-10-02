# Internacionalização — plano

> **For agentic workers:** executar tarefa a tarefa, na ordem, segundo "Protocolo de execução" abaixo — que prevalece sobre qualquer fluxo de plano com pontos de revisão. Os passos usam `- [ ]` para acompanhamento.

Substitui `2026-09-22-internationalization.md`, nunca executado.

**Goal:** Uma aplicação declara o locale num ponto e a biblioteca inteira fala essa língua; a troca em runtime reflete sem recarregar; duas subárvores da mesma página podem falar línguas diferentes; `en-US` e `pt-BR` são publicados; nenhuma família guarda texto de cromo próprio.

**Architecture:** Catálogo por família em `@slotted/core/i18n`, com `en-US` incluído e `pt-BR` em entrada própria. Um parser de mensagem em subconjunto ICU (`plural`, `select`). Provider raiz em cada binding (`SlottedProvider`, `provideSlotted`) alimenta texto e locale de formatação. Em Angular o locale é `Signal`, lido na chamada de `injectMessages`. Sobreposição por instância pelo input/prop `messages`. Trava de conformidade em `scripts/verify-i18n.mjs`.

**Tech Stack:** TypeScript 6.0, `Intl.PluralRules`, `Intl.NumberFormat`, React 19.2, Angular 22.1 (signals), vitest, `node --test`, ng-packagr, Vite.

**Spec:** `docs/history/designs/2026-10-01-internationalization-design.md`. Referências `D<n>` e `§<n>` apontam para esse documento.

## Global Constraints

- Execução contínua: sem gates humanos entre tarefas. O resultado avaliado é o final.
- Sem compatibilidade retroativa (`AGENTS.md` › Scope): `labels` e as props de texto de cromo desaparecem do repositório, sem alias nem camada de transição. As constantes de texto e as funções de preenchimento são apagadas, não reexportadas.
- Nenhuma dependência nova. `Intl.PluralRules` e `Intl.NumberFormat` são plataforma.
- Toda a chave de mensagem é declarada uma vez, em `packages/core/src/i18n/messages/<família>.ts`. Nenhuma família, nenhum contrato e nenhuma story declara texto de cromo próprio.
- React e Angular expõem o mesmo conjunto de chaves por família. Onde as superfícies divergem hoje (Apêndice B), fecham na união.
- `dir` e `lang` do documento ficam com a aplicação; nenhuma tarefa os move para a biblioteca.
- Outras sessões editam o tree em paralelo. Cada tarefa toca só os ficheiros das famílias que nomeia, mais `packages/core/src/i18n/`.
- Formatação: `pnpm exec prettier --write <paths>` a partir da raiz.

## Protocolo de execução

Especializa `AGENTS.md` › Verification e o protocolo de fatias do `CLAUDE.md` do utilizador para este plano. O que está aqui prevalece sobre o hábito de confirmar.

### Orçamento de verificação

- Cada tarefa nomeia os seus comandos. Correm uma vez, depois da passagem de edição completa dessa tarefa. Não correm antes, nem a meio, nem por tranquilidade.
- Um comando cujo input não mudou não volta a correr.
- `pnpm check:full` corre exatamente duas vezes em todo o plano: no fecho da tarefa 13 e na tarefa 17. Nunca por família, nunca por binding.
- `pnpm check` e `pnpm check:affected` não são usados nas tarefas 6 a 11.
- Nas tarefas 6 a 11, cada comando corre uma vez por tarefa, sobre o grupo inteiro de famílias.
- Nenhuma captura de ecrã, nenhuma navegação exploratória. A única automação de browser do plano é o cenário 15.4.

### Falha

1. Ler o relatório inteiro antes de editar. Agrupar as falhas por causa, não por ficheiro.
2. Uma passagem de correção consolidada que ataque todas as causas identificadas.
3. Uma nova execução do mesmo comando.
4. Se a mesma falha sobreviver a duas passagens: registar em `.claude/progress/current.md` › problemas conhecidos, com a mensagem literal e a hipótese, e seguir para a tarefa seguinte. As falhas adiadas são julgadas na tarefa 17.

Não é permitido: repetir o mesmo comando à espera de resultado diferente; alargar a verificação para procurar contexto que o relatório já dá; reler um ficheiro já lido nesta fatia; reconstruir o plano a partir do zero.

### Fatias e checkpoint

Fatia é fronteira de contexto, não gate humano: termina, escreve o checkpoint, continua em contexto novo sem pedir autorização.

| Fatia | Tarefas |
| --- | --- |
| 1 | 1–3 |
| 2 | 4–5 |
| 3 | 6 |
| 4 | 7 |
| 5 | 8 |
| 6 | 9 |
| 7 | 10 |
| 8 | 11–12 |
| 9 | 13–14 |
| 10 | 15 |
| 11 | 16–17 |

`.claude/progress/current.md` é reescrito no fim de cada tarefa e regista a próxima ação como comando ou edição concreta. Uma fatia retomada lê esse ficheiro antes de qualquer outra coisa.

### Fonte de trabalho

`docs/process/i18n-inventory.json`, produzido na tarefa 1, é a lista de trabalho das tarefas 3 e 6 a 12. Nenhuma dessas tarefas redescobre chaves por pesquisa no código: o que não está no inventário não existe, e uma lacuna encontrada corrige o inventário antes de corrigir a família.

### Subagentes

Nenhum. As tarefas são sequenciais e partilham o catálogo.

## Tarefas

### 1. Inventário fechado

- [ ] 1.1 `scripts/extract-i18n.mjs` percorre o código de runtime de `packages/react/src`, `packages/angular` e `packages/core/src` (exclusões de §2) e emite `docs/process/i18n-inventory.json`: por família, por binding, cada texto de cromo com chave, texto atual, slots, forma (string, string ICU, função) e ficheiro de origem. Cobre catálogos nomeados, defaults inline, props de texto soltas, literais em atributos e os 7 catálogos de `core`.
- [ ] 1.2 Cada prop de texto é classificada pelo D2: com valor por omissão → `chrome`; sem valor por omissão → `content`. Só `chrome` entra no catálogo.
- [ ] 1.3 Cada texto por omissão é marcado com a língua (`en`, `pt`).
- [ ] 1.4 O relatório marca cada divergência entre bindings: chave presente num e ausente no outro, e mesma chave com textos diferentes.
- [ ] 1.5 O relatório marca cada mensagem com slot de contagem sem `plural`.

Verificação: `node scripts/extract-i18n.mjs` produz o ficheiro; as 83 famílias do Apêndice A aparecem; as 13 famílias com texto `pt` de §2 aparecem marcadas; os literais de `dialog` e `color-picker` aparecem.

### 2. Motor em `@slotted/core/i18n`

- [ ] 2.1 `types.ts`: `SlotValue`, `MessageSlots`, `MessageFn`, `Message`, `SlottedMessages`, `Catalog`, `PartialCatalog`.
- [ ] 2.2 `format.ts`: `formatMessage()` com a gramática de §5.
- [ ] 2.3 `negotiate.ts`: `negotiateLocale()` por lookup RFC 4647, base `en-US`.
- [ ] 2.4 `translator.ts`: `createTranslator()` e `Translator.family()`, com a ordem de resolução de §4.1 e a fusão do D10.
- [ ] 2.5 `index.ts` exporta o contrato público do módulo.

Verificação: `pnpm --filter @slotted/core test`. Testes cobrem: os casos atuais de `formatRatingMessage` e `formatScrollerMessage`, copiados para `format.test.ts`; `select`; ramo `=N` antes da categoria; `#` formatado; slot dentro de ramo; apóstrofo; negociação com e sem região; queda por chave ausente; plural em `pt-BR` e `en-US`; formatação numérica por locale; `resolve` a ganhar ao catálogo; sobreposição a fundir registo e substituir valor.

### 3. Catálogos

- [ ] 3.1 `messages/<família>.ts`: uma interface por família do Apêndice A, com as chaves `chrome` do inventário e os slots tipados.
- [ ] 3.2 `locales/en-US.ts`: `EN_US: Catalog`. Texto inglês em todas as chaves (D8); as 13 famílias `pt` recebem texto inglês novo. Mensagens com contagem usam `plural`.
- [ ] 3.3 `locales/pt-BR.ts`: `PT_BR: Catalog`, cobertura total, partindo do texto `pt` atual onde existe, plural em `one`/`other`, slots idênticos aos de `en-US`.
- [ ] 3.4 `packages/core/vite.config.ts` ganha as entradas `i18n` e `i18n/pt-BR`; `packages/core/package.json` ganha os `exports` `./i18n` e `./i18n/pt-BR`.

Verificação: `pnpm --filter @slotted/core test` e `pnpm --filter @slotted/core build`. O tipo `Catalog` fecha as duas traduções; o teste de paridade de slots corre já nesta tarefa.

### 4. Provider React

- [ ] 4.1 `packages/react/src/i18n/`: `SlottedProvider`, `useLocale`, `useTranslator`, `useMessages`, com aninhamento a herdar `catalogs` e `resolve` e a substituir `locale`.
- [ ] 4.2 Sem provider, a árvore resolve `en-US` sobre `EN_US`.
- [ ] 4.3 Entrada `i18n` em `packages/react/vite.config.ts`, `exports` `./i18n` em `packages/react/package.json`.

Verificação: `pnpm --filter @slotted/react test`. Teste de dois providers aninhados com locales diferentes a renderizarem os dois textos no mesmo render.

### 5. Provider Angular

- [ ] 5.1 `packages/angular/i18n/` com `ng-package.json` e `src/`: `provideSlotted`, `injectLocale`, `injectTranslator`, `injectMessages`.
- [ ] 5.2 `locale` aceita `string` ou `Signal<string>`; `injectMessages` devolve função que lê o signal na chamada.
- [ ] 5.3 `provideSlotted` declarado nos `providers` de um componente vale para a subárvore.

Verificação: `pnpm --filter @slotted/angular test`. Teste que altera o signal de locale e assere o texto renderizado sem recriar o componente; teste de subárvore com locale próprio.

### Procedimento por família (tarefas 6 a 11)

Aplicado a cada família do grupo, nos dois bindings:

1. Apagar constantes, tipos, funções de preenchimento e funções de fusão de texto da família, no binding e em `core`.
2. Consumir por `useMessages`/`injectMessages`. O input/prop de texto passa a `messages: Partial<FamilyMessages>`; `labels` e as props `chrome` saem.
3. Retirar texto do provider de defaults da família. O `locale` cai em `useLocale`/`injectLocale` quando a instância não o declara.
4. Atualizar specs, stories e `.docs.ts` da família.
5. Em Angular, um teste por família que altera o signal de locale e assere uma mensagem da família.

Verificação comum: `pnpm --filter @slotted/core test`, `pnpm --filter @slotted/react test`, `pnpm --filter @slotted/angular test`, `pnpm test:contracts`.

### 6. Famílias — dados

- [ ] 6.1 Grupo `dados` do Apêndice A.
- [ ] 6.2 Apagar em `core`: `CHART_MESSAGES`, `fillMessage`, `DEFAULT_DASHBOARD_GRID_LABELS`, `formatDashboardLabel`, `DEFAULT_DATA_LIST_LABELS`, `formatDataListMessage`. Nos bindings: `resolveLabels` (`data-grid`, `table`), `resolveDataGridLabels`, `resolveFilterBarLabels`, `fillLabel` (`data-grid`, `column-manager`, `transfer`).
- [ ] 6.3 `groupCount` e restantes contagens passam a `plural`.

### 7. Famílias — seleção e entrada

- [ ] 7.1 Grupo `seleção e entrada` do Apêndice A.
- [ ] 7.2 Apagar em `core`: `formatRatingMessage`, `formatEntityLabel`. Apagar `injectDocumentLocale` (D11).
- [ ] 7.3 `color-picker`: `2D slider` passa a chave do catálogo.

### 8. Famílias — data e hora

- [ ] 8.1 Grupo `data e hora` do Apêndice A.
- [ ] 8.2 Teste por binding que troca o locale e assere simultaneamente o texto e o formato de data.

### 9. Famílias — shell, navegação e conteúdo

- [ ] 9.1 Grupo `shell, navegação e conteúdo` do Apêndice A.
- [ ] 9.2 Apagar em `core`: `CAROUSEL_MESSAGES`, `formatCarouselMessage`.

### 10. Famílias — sobreposição, estado e feedback

- [ ] 10.1 Grupo `sobreposição, estado e feedback` do Apêndice A.
- [ ] 10.2 Apagar em `core`: `FULLSCREEN_MESSAGES`, `formatScrollerMessage`. Nos bindings: `formatMessage` (`message`), `resolveLabels` (`description-list`).
- [ ] 10.3 `dialog`: `Close` e `Full screen` passam a chaves do catálogo, nos dois bindings.

### 11. Famílias — formulário, ficheiros e arrasto

- [ ] 11.1 Grupo `formulário e ficheiros` do Apêndice A.
- [ ] 11.2 Apagar em `core`: `DEFAULT_IMPORT_EXPORT_MESSAGES`, `DEFAULT_DRAG_MESSAGES`. `drag` passa a entrada do catálogo, consumida por `column-manager`, `dashboard-grid`, `data-grid` e `transfer`; as frases compostas mantêm a forma função ou passam a `select` sobre `operation`.
- [ ] 11.3 Fechar as divergências do Apêndice B que as tarefas 6 a 10 não fecharam.

Verificação: a comum, mais `rg -n "_LABELS\b|_MESSAGES\b|fillLabel|fillMessage|format[A-Za-z]*Message\b|resolve[A-Za-z]*Labels" packages --glob '!**/i18n/**' --glob '!**/dist/**' --glob '!**/node_modules/**'` sem resultados.

### 12. Contratos

- [ ] 12.1 Nos 33 contratos com bloco `labels` ou `messages`, substituir o bloco por `messages`: lista ordenada de chaves. `labelsReason` passa a `messagesReason`.
- [ ] 12.2 Atualizar `specs/components/<família>/contract.test.mjs` para asserir a lista contra as chaves de `EN_US`.
- [ ] 12.3 Onde `specs/contract.schema.mjs` referir o campo, acompanhar o novo nome.

Verificação: `pnpm test:contracts`; `rg -n '"labels"' specs/components/*/contract.json` sem resultados.

### 13. Trava de conformidade

- [ ] 13.1 `scripts/verify-i18n.mjs` com as cinco asserções de §7.
- [ ] 13.2 `scripts/verify-i18n.test.mjs` cobre o detetor com casos positivos e negativos, incluindo a exclusão de `throw new Error`, de ficheiros `*-demo` e de literais de atributo técnico.
- [ ] 13.3 `test:i18n` em `package.json`, incluído em `check`.

Verificação: `pnpm test:i18n` passa; introduzir um literal de texto numa família faz falhar; `pnpm check:full`.

### 14. Storybook

- [ ] 14.1 `tools/storybook-workbench/src/globals.tsx` ganha `LOCALES = ['en-US', 'pt-BR']`, entrada em `INITIAL_GLOBALS` e em `GLOBAL_TYPES`, e `resolveWorkbenchGlobals` devolve o locale.
- [ ] 14.2 `globals.test.ts` cobre o eixo novo.
- [ ] 14.3 Os decoradores de `apps/storybook-react` e `apps/storybook-angular` envolvem a story no provider com o locale do global.

Verificação: `pnpm --filter @slotted/storybook-workbench test`; `pnpm --filter @slotted/storybook-react build:storybook`; `pnpm --filter @slotted/storybook-angular build:storybook`.

### 15. Demo Nexora

- [ ] 15.1 `pnpm demo:refresh`. Em `demos/nexora/angular/src/app/app.config.ts`: apagar `provideAppShellDefaults`, `provideSideNavigationDefaults`, `provideTopNavigationDefaults`, `providePageDefaults`, `providePageHeaderDefaults` e `provideNotificationCenterMessages` (com `core/activity/notifications.messages.ts`); retirar `label` de `provideSkeletonDefaults`; acrescentar `provideSlotted({ locale, catalogs: { 'pt-BR': PT_BR } })`.
- [ ] 15.2 Estado de idioma persistido, com `<html lang>` a acompanhar, e seletor no shell junto às restantes preferências.
- [ ] 15.3 As 37 linhas de `demos/nexora/angular/src` que passam `labels` ou `messages` passam ao input `messages` ou desaparecem quando só repetem `EN_US`.
- [ ] 15.4 Cenário determinista de browser: abrir a página de grelha, trocar para `pt-BR`, asserir texto de `data-grid`, `filter-bar` e `pagination`, trocar de volta, asserir `en-US`; sem recarregamento entre os passos.
- [ ] 15.5 Linhas 7, 33 e 143 de `demos/nexora/angular/LIBRARY-FEEDBACK.md` marcadas como resolvidas; qualquer defeito novo de pacote registado pelo processo do `demo-triage`.

Verificação: `pnpm --filter @slotted/demo-nexora-angular test`, `pnpm --filter @slotted/demo-nexora-angular build:demo`; o cenário 15.4 passa.

### 16. Lei e documentação

- [ ] 16.1 ADR `docs/decisions/0003-internationalization.md`: os dois lugares do texto de cromo, o critério do D2, o catálogo em `core`, a gramática ICU, o signal em Angular, a ausência de catálogo assíncrono. Linha correspondente em `docs/README.md` › Lei.
- [ ] 16.2 `docs/component-features.md` §2.9: `messages` como a superfície de texto de cromo de qualquer família, o critério do D2 e a gramática de §5.
- [ ] 16.3 Passo no skill `component` para que família nova nasça com entrada de catálogo, sem texto próprio e sem prop `labels`.
- [ ] 16.4 `CONTRIBUTING.md` descreve como acrescentar um locale.

Verificação: `pnpm test:docs`.

### 17. Fecho

- [ ] 17.1 `pnpm format`.
- [ ] 17.2 `pnpm check:full`.
- [ ] 17.3 `pnpm demo:refresh` e o cenário 15.4 sobre os tarballs reconstruídos.
- [ ] 17.4 Julgar as falhas adiadas em `.claude/progress/current.md`.

## Critérios de aceitação

1. `pnpm check:full` passa.
2. `pnpm test:i18n` passa, e um literal de texto introduzido em qualquer família faz falhar.
3. Nenhuma ocorrência de `labels` como superfície pública em `packages/` ou `specs/`.
4. Nenhum catálogo nem função de preenchimento de texto fora de `packages/core/src/i18n/`.
5. `PT_BR` cobre 100% das chaves de `EN_US`, com os mesmos slots por chave.
6. `EN_US` não contém texto em português.
7. `groupCount` rende `1 linha` e `2 linhas` em `pt-BR`, `1 row` e `2 rows` em `en-US`.
8. Trocar o locale em runtime muda todo o texto da biblioteca nos dois bindings, sem recriar componentes em Angular e sem recarregar na demo.
9. Duas subárvores com locales diferentes renderizam em simultâneo, nos dois bindings.
10. As 83 famílias do Apêndice A expõem o mesmo conjunto de chaves nos dois bindings.
11. A toolbar dos dois storybooks oferece o eixo `locale`.

## Apêndice A — famílias com texto, por grupo

Medição de 2026-10-01 (§2 do desenho). A tarefa 1 confirma ou corrige a lista.

| Grupo | Tarefa | Famílias |
| --- | --- | --- |
| dados (13) | 6 | chart, column-manager, dashboard-grid, data-grid, data-list, filter-bar, pagination, saved-views, sparkline, stat-card, table, transfer, tree |
| seleção e entrada (17) | 7 | cascader, color-picker, combobox, command-palette, currency-field, entity-picker, listbox, multi-select, number-field, prompt-composer, rating, select, slider, switch, tag, tags-input, text-field |
| data e hora (11) | 8 | calendar, date-field, date-picker, date-range-picker, datetime-field, datetime-picker, datetime-range-picker, event-calendar, time-field, time-picker, time-range-picker |
| shell, navegação e conteúdo (16) | 9 | app-shell, carousel, code-block, kbd, link, markdown, page, page-header, prose, side-navigation, stepper, table-of-contents, tabs, top-navigation, tour, wizard |
| sobreposição, estado e feedback (20) | 10 | action-sheet, alert, avatar, avatar-group, button, description-list, detail-panel, dialog, fullscreen, loading-overlay, message, message-scroller, notification-center, popover, progress-indicator, result-state, skeleton, status-indicator, timeline, toast |
| formulário e ficheiros (6) | 11 | attachment, field, field-group, form, import-export-center, upload |

## Apêndice B — divergências entre bindings

| Família | Hoje | Fecho |
| --- | --- | --- |
| `avatar`, `result-state` | texto só em React | chaves iguais nos dois |
| `avatar-group` | texto só em Angular | chaves iguais nos dois |
| `listbox` | `labels` só em React, `showLabel` só em Angular | chaves iguais nos dois |
| `alert`, `chart`, `combobox`, `data-list`, `event-calendar`, `filter-bar`, `import-export-center`, `multi-select`, `popover`, `progress-indicator`, `rating`, `select`, `side-navigation`, `table`, `tour`, `upload` | props de texto soltas diferentes por binding | a tarefa 1 separa `chrome` de `content` e de campos internos; as chaves `chrome` fecham na união |

## Riscos

- O procedimento por família muda a forma de leitura dos defaults nas 130 atribuições `inject*Defaults()` de Angular: maior superfície de regressão do conjunto. Mitigação: o teste de troca de locale de cada família é escrito na tarefa que a migra.
- O texto inglês das 13 famílias `pt` e a tradução de `pt-BR` são caminho crítico da tarefa 3 e são trabalho de conteúdo. A paridade de slots e o tipo `Catalog` impedem que uma tradução incompleta passe.
- O critério do D2 depende de existir valor por omissão; uma prop `content` classificada como `chrome` perde a superfície da instância. Mitigação: a classificação da tarefa 1.2 fica no inventário, revisível antes da tarefa 6.
- O detetor da tarefa 13 pode produzir falso positivo sobre literais técnicos. Mitigação: o teste do detetor cobre os casos de exclusão antes de a trava entrar em `check`.
- Sessões paralelas editam famílias dos grupos 6 a 11. Conflito de edição é resolvido sobre a versão mais recente do ficheiro, sem reverter trabalho alheio.
