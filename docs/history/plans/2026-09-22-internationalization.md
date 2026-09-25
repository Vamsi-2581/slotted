# Internacionalização — plano

> **For agentic workers:** executar tarefa a tarefa, na ordem, segundo "Protocolo de execução" abaixo — que prevalece sobre qualquer fluxo de plano com pontos de revisão. Os passos usam `- [ ]` para acompanhamento.

**Goal:** Uma aplicação declara o locale num ponto e a biblioteca inteira fala essa língua; a troca em runtime reflete sem recarregar; duas subárvores da mesma página podem falar línguas diferentes; `en-US` e `pt-BR` são publicados; nenhuma família guarda texto próprio.

**Architecture:** Catálogo por família em `@slotted/core/i18n`, com `en-US` incluído e `pt-BR` em entrada própria. Provider raiz em cada binding (`SlottedProvider`, `provideSlotted`) alimenta texto e locale de formatação. Em Angular o locale é `Signal`, lido na chamada de `injectMessages`, o que torna a troca reativa sem recriar componentes. Sobreposição por instância pelo input/prop `messages`. Trava de conformidade em `scripts/verify-i18n.mjs`.

**Tech Stack:** TypeScript 6, `Intl.PluralRules`, `Intl.NumberFormat`, React 19, Angular 22.1 (signals), vitest, `node --test`, ng-packagr, Vite.

**Spec:** `docs/history/designs/2026-09-22-internationalization-design.md`.

## Global Constraints

- Execução contínua: sem gates humanos entre tarefas. O resultado avaliado é o final.
- Sem compatibilidade retroativa (`AGENTS.md` › Scope): `labels` desaparece do repositório, sem alias nem camada de transição. As constantes de texto duplicadas entre bindings são apagadas, não reexportadas.
- Nenhuma dependência nova. `Intl.PluralRules` e `Intl.NumberFormat` são plataforma.
- Toda a chave de mensagem é declarada uma vez, em `packages/core/src/i18n/messages/<família>.ts`. Nenhuma família, nenhum contrato e nenhuma story declara texto inglês próprio.
- React e Angular expõem o mesmo conjunto de chaves por família. Onde as superfícies divergem hoje (Apêndice B), fecham na união.
- `dir` e `lang` do documento ficam com a aplicação; nenhuma tarefa os move para a biblioteca.
- Formatação: `pnpm exec prettier --write <paths>` a partir da raiz.

## Protocolo de execução

Especializa `AGENTS.md` › Verification e o protocolo de fatias do `CLAUDE.md` do utilizador para este plano. O que está aqui prevalece sobre o hábito de confirmar.

### Orçamento de verificação

- Cada tarefa nomeia um comando. Corre uma vez, depois da passagem de edição completa dessa tarefa. Não corre antes, nem a meio, nem por tranquilidade.
- Um comando cujo input não mudou não volta a correr. Se nada foi editado desde a última execução, o resultado é o mesmo.
- `pnpm check:full` corre exatamente duas vezes em todo o plano: no fecho da tarefa 13 e na tarefa 17. Nunca por família, nunca por binding.
- `pnpm check` e `pnpm check:affected` não são usados nas tarefas 6 a 10; as verificações dessas tarefas são as duas filtradas por binding.
- Nas tarefas 6 a 10, o comando corre uma vez por tarefa, sobre o grupo inteiro de famílias — não uma vez por família.
- Nenhuma captura de ecrã, nenhuma navegação exploratória. A única automação de browser do plano é o cenário 15.4.

### Falha

1. Ler o relatório inteiro antes de editar. Agrupar as falhas por causa, não por ficheiro.
2. Uma passagem de correção consolidada que ataque todas as causas identificadas.
3. Uma nova execução do mesmo comando.
4. Se a mesma falha sobreviver a duas passagens: registar em `.claude/progress/current.md` › problemas conhecidos, com a mensagem literal e a hipótese, e seguir para a tarefa seguinte. As falhas adiadas são julgadas na tarefa 17, com o conjunto todo à vista.

Não é permitido: repetir o mesmo comando à espera de resultado diferente; alargar a verificação para procurar contexto que o relatório já dá; reler um ficheiro já lido nesta fatia; reconstruir o plano a partir do zero.

### Fatias e checkpoint

Fatia é fronteira de contexto, não gate humano: termina, escreve o checkpoint, continua em contexto novo sem pedir autorização.

| Fatia | Tarefas |
| --- | --- |
| 1 | 1–3 |
| 2 | 4–5 |
| 3 | 6 |
| 4 | 7 |
| 5 | 8–9 |
| 6 | 10–11 |
| 7 | 12–13 |
| 8 | 14–15 |
| 9 | 16–17 |

`.claude/progress/current.md` é reescrito no fim de cada tarefa, não no fim da fatia, e regista a próxima ação como comando ou edição concreta. Uma fatia retomada lê esse ficheiro antes de qualquer outra coisa; não reconstrói estado a partir do histórico de git nem relendo o plano de ponta a ponta.

### Fonte de trabalho

`docs/process/i18n-inventory.json`, produzido na tarefa 1, é a lista de trabalho das tarefas 3 e 6 a 11. Nenhuma dessas tarefas redescobre chaves por pesquisa no código: o que não está no inventário não existe, e uma lacuna encontrada corrige o inventário antes de corrigir a família.

### Subagentes

Nenhum. As tarefas são sequenciais e partilham o catálogo; delegar multiplica leituras do mesmo ficheiro sem reduzir o trabalho.

## Tarefas

### 1. Inventário fechado

- [ ] 1.1 `scripts/extract-i18n.mjs` percorre o código de runtime dos dois bindings e emite `docs/process/i18n-inventory.json`: por binding, por família, cada chave de texto, o seu texto inglês atual, os seus slots e o ficheiro de origem. Cobre catálogos nomeados, defaults inline, props de texto soltas e literais em atributos.
- [ ] 1.2 O relatório marca cada divergência entre bindings: chave presente num e ausente no outro, e mesma chave com textos diferentes.
- [ ] 1.3 O relatório marca cada mensagem com slot de contagem — candidata a `plural()`.

Verificação: `node scripts/extract-i18n.mjs` produz o ficheiro; o total de chaves é ≥ 539; as 44 famílias React e 41 Angular do Apêndice A aparecem.

### 2. Motor em `@slotted/core/i18n`

- [ ] 2.1 `types.ts`: `SlotValue`, `MessageSlots`, `MessageFn`, `Message`, `PluralForms`, `SlottedMessages`, `Catalog`, `PartialCatalog`.
- [ ] 2.2 `format.ts`: preenchimento de slots, `{{` literal, slot ausente intacto, slot numérico por `Intl.NumberFormat` no locale negociado.
- [ ] 2.3 `plural.ts`: `plural()` sobre `Intl.PluralRules`, categoria a partir do slot `count`, queda em `other`.
- [ ] 2.4 `negotiate.ts`: `negotiateLocale()` por lookup RFC 4647, base `en-US`.
- [ ] 2.5 `translator.ts`: `createTranslator()` e `Translator.family()`, com a ordem de resolução da spec §4.1 e a regra de fusão do D8.
- [ ] 2.6 `index.ts` exporta o contrato público do módulo.

Verificação: `pnpm --filter @slotted/core test`. Testes cobrem: negociação com e sem região; queda por chave ausente; plural em `pt-BR` e `en-US`; formatação numérica por locale; `resolve` da aplicação a ganhar ao catálogo; sobreposição a fundir registo e substituir valor.

### 3. Catálogos

- [ ] 3.1 `messages/<família>.ts`: uma interface por família do Apêndice A, com as chaves do inventário e os slots tipados.
- [ ] 3.2 `locales/en-US.ts`: `EN_US: Catalog`, construído a partir dos textos recolhidos na tarefa 1. Mensagens com contagem passam a `plural()`.
- [ ] 3.3 `locales/pt-BR.ts`: `PT_BR: Catalog`, cobertura total, plural em `one`/`other`, slots idênticos aos de `en-US`.
- [ ] 3.4 `packages/core/vite.config.ts` ganha as entradas `i18n` e `i18n/pt-BR`; `packages/core/package.json` ganha os `exports` `./i18n` e `./i18n/pt-BR`.

Verificação: `pnpm --filter @slotted/core test` e `pnpm --filter @slotted/core build`. O tipo `Catalog` fecha as duas traduções; o teste de paridade de slots corre já nesta tarefa.

### 4. Provider React

- [ ] 4.1 `packages/react/src/i18n/`: `SlottedProvider`, `useLocale`, `useTranslator`, `useMessages`, com aninhamento a herdar `catalogs` e `resolve` e a substituir `locale`.
- [ ] 4.2 Sem provider, a árvore resolve `en-US` sobre `EN_US`.
- [ ] 4.3 Entrada `i18n` em `packages/react/vite.config.ts`, `exports` `./i18n` em `packages/react/package.json`, reexportação em `src/index.ts`.

Verificação: `pnpm --filter @slotted/react test`. Teste de dois providers aninhados com locales diferentes a renderizarem os dois textos no mesmo render.

### 5. Provider Angular

- [ ] 5.1 `packages/angular/i18n/` com `ng-package.json` e `src/`: `provideSlotted`, `injectLocale`, `injectTranslator`, `injectMessages`.
- [ ] 5.2 `locale` aceita `string` ou `Signal<string>`; `injectMessages` devolve função que lê o signal na chamada.
- [ ] 5.3 `provideSlotted` declarado nos `providers` de um componente vale para a subárvore.

Verificação: `pnpm --filter @slotted/angular test`. Teste que altera o signal de locale e assere o texto renderizado sem recriar o componente; teste de subárvore com locale próprio.

### 6. Famílias — grelha, tabela e filtros

- [ ] 6.1 `data-grid`, `table`, `filter-bar`, `upload`, `notification-center`, nos dois bindings: remover constantes e tipos de texto locais, remover `fillLabel` e os `resolve*Labels`, passar a `useMessages`/`injectMessages`, renomear o input/prop para `messages` com `Partial<FamilyMessages>`, retirar o slot de texto do provider de defaults.
- [ ] 6.2 Atualizar specs, stories e docs dessas famílias para o novo nome e para o provider.

Verificação: `pnpm --filter @slotted/react test`, `pnpm --filter @slotted/angular test`, `pnpm test:contracts`.

### 7. Famílias — seleção, entrada e navegação

- [ ] 7.1 `combobox`, `multi-select`, `select`, `listbox`, `tags-input`, `switch`, `slider`, `segmented-control`, `stepper`, `status-indicator`, `pagination`, `tabs`, `menu`, `command-palette`. Props de texto soltas (`emptyLabel`, `triggerLabel`, `clearLabel`, `loadingLabel`, `createLabel`, `removeLabel`, `searchLabel`, `searchPlaceholder`, `editHintLabel`, `hintLabel`, `invalidLabel`, `backLabel`, `closeLabel`, `errorLabel`, `inputLabel`, `recentLabel`, `trueLabel`) entram no catálogo da família e saem da superfície do componente.

Verificação: a mesma da tarefa 6.

### 8. Famílias — data e hora

- [ ] 8.1 `datetime-picker`, `datetime-range-picker`, `time-picker`, `time-range-picker`.
- [ ] 8.2 Nestas famílias o `locale` de formatação passa a vir de `useLocale`/`injectLocale` quando a instância não o declara.

Verificação: a mesma da tarefa 6, mais um teste por binding que troca o locale e assere simultaneamente o texto e o formato de data.

### 9. Famílias — shell, conteúdo e estrutura

- [ ] 9.1 `app-shell`, `page`, `page-header`, `side-navigation`, `top-navigation`, `table-of-contents`, `prose`, `popover`, `dialog`, `detail-panel`, `description-list`, `code-block`.
- [ ] 9.2 `dialog` ganha chaves para `Close` e `Full screen`, hoje fixos nos dois bindings.

Verificação: a mesma da tarefa 6.

### 10. Famílias — estado, feedback e formulário

- [ ] 10.1 `alert`, `inline-message`, `toast`, `badge`, `sparkline`, `stat-card`, `timeline`, `result-state`, `form`, `field`, `field-group`.
- [ ] 10.2 Fechar as divergências do Apêndice B: a família passa a expor o mesmo conjunto de chaves nos dois bindings.

Verificação: a mesma da tarefa 6.

### 11. Núcleo

- [ ] 11.1 `packages/core/src/drag/messages.ts` passa a entrada do catálogo (`drag`), mantendo a forma função. `packages/angular/field/src/field-messages.ts` passa a entrada `field`.
- [ ] 11.2 O `locale` declarado nos defaults de família deixa de ter valor próprio e cai no provider quando a instância não o declara.

Verificação: `pnpm --filter @slotted/core test` e os dois bindings.

### 12. Contratos

- [ ] 12.1 Nos 8 contratos com bloco `labels` (`code-block`, `data-grid`, `description-list`, `filter-bar`, `popover`, `table`, `toast`, `upload`), substituir o objeto por `messages`: lista ordenada de chaves. `labelsReason` passa a `messagesReason`.
- [ ] 12.2 Atualizar `specs/components/<família>/contract.test.mjs` para asserir a lista contra as chaves de `EN_US`, em vez de asserir textos.
- [ ] 12.3 Onde `specs/contract.schema.mjs` referir o campo, acompanhar o novo nome.

Verificação: `pnpm test:contracts`.

### 13. Trava de conformidade

- [ ] 13.1 `scripts/verify-i18n.mjs` com as quatro asserções da spec §7.
- [ ] 13.2 `scripts/verify-i18n.test.mjs` cobre o detetor com casos positivos e negativos, incluindo a exclusão de `throw new Error` e de literais de atributo técnico.
- [ ] 13.3 `test:i18n` em `package.json`, incluído em `check`.

Verificação: `pnpm test:i18n` passa; introduzir um literal de texto numa família faz falhar.

### 14. Storybook

- [ ] 14.1 `tools/storybook-workbench/src/globals.tsx` ganha `LOCALES = ['en-US', 'pt-BR']`, entrada em `INITIAL_GLOBALS` e em `GLOBAL_TYPES`, e `resolveWorkbenchGlobals` devolve o locale.
- [ ] 14.2 `globals.test.ts` cobre o eixo novo.
- [ ] 14.3 Os decoradores de `apps/storybook-react` e `apps/storybook-angular` envolvem a story no provider com o locale do global.

Verificação: `pnpm --filter @slotted/storybook-workbench test`; os dois storybooks constroem.

### 15. Demo Nexora

- [ ] 15.1 Estado de idioma em `demos/nexora/angular`, persistido, com `<html lang>` a acompanhar, e `provideSlotted({ locale, catalogs: { 'pt-BR': PT_BR } })` em `app.config.ts`.
- [ ] 15.2 Seletor de idioma no shell, junto às restantes preferências.
- [ ] 15.3 O texto próprio da demo passa pelo mesmo estado, para que aplicação e biblioteca troquem juntas.
- [ ] 15.4 Cenário determinista de browser: abrir a página de grelha, trocar para `pt-BR`, asserir texto de `data-grid`, `filter-bar` e `pagination`, trocar de volta, asserir `en-US`; sem recarregamento entre os passos.
- [ ] 15.5 Registo em `demos/nexora/angular/LIBRARY-FEEDBACK.md` de qualquer defeito de pacote encontrado pela demo, pelo processo do `demo-triage`.

Verificação: `pnpm --filter @slotted/demo-nexora-angular test` e `build:demo`; o cenário passa.

### 16. Lei e documentação

- [ ] 16.1 ADR `docs/decisions/0003-internationalization.md`: os dois lugares do texto, o catálogo em `core`, o signal em Angular, a ausência de catálogo assíncrono.
- [ ] 16.2 Secção em `docs/component-features.md` a fixar `messages` como a superfície de texto de qualquer família.
- [ ] 16.3 Passo no skill `component` para que família nova nasça com entrada de catálogo e sem texto próprio.
- [ ] 16.4 `CONTRIBUTING.md` descreve como acrescentar um locale.

Verificação: `pnpm test:docs`.

### 17. Fecho

- [ ] 17.1 `pnpm format`.
- [ ] 17.2 `pnpm check:full`.
- [ ] 17.3 `pnpm demo:refresh` e o cenário da tarefa 15 sobre os tarballs reconstruídos.

## Critérios de aceitação

1. `pnpm check:full` passa.
2. `pnpm test:i18n` passa, e um literal de texto introduzido em qualquer família faz falhar.
3. Nenhuma ocorrência de `labels` como superfície pública em `packages/` ou `specs/`.
4. `PT_BR` cobre 100% das chaves de `EN_US`, com os mesmos slots por chave.
5. `groupCount` rende `1 linha` e `2 linhas` em `pt-BR`, `1 row` e `2 rows` em `en-US`.
6. Trocar o locale em runtime muda todo o texto da biblioteca nos dois bindings, sem recriar componentes em Angular e sem recarregar na demo.
7. Duas subárvores com locales diferentes renderizam em simultâneo, nos dois bindings.
8. As 44 famílias React e 41 Angular do Apêndice A expõem o mesmo conjunto de chaves por família.
9. A toolbar dos dois storybooks oferece o eixo `locale`.

## Apêndice A — famílias que emitem texto

**React (44):** alert, app-shell, badge, code-block, combobox, command-palette, data-grid, datetime-picker, datetime-range-picker, description-list, detail-panel, field, field-group, filter-bar, form, inline-message, listbox, menu, multi-select, notification-center, page, page-header, pagination, popover, prose, result-state, segmented-control, select, side-navigation, sparkline, stat-card, status-indicator, stepper, switch, table, table-of-contents, tabs, tags-input, time-picker, time-range-picker, timeline, toast, top-navigation, upload.

**Angular (41):** alert, app-shell, code-block, combobox, command-palette, data-grid, datetime-picker, datetime-range-picker, description-list, detail-panel, field, filter-bar, form, inline-message, listbox, menu, multi-select, notification-center, page, page-header, pagination, popover, prose, segmented-control, select, side-navigation, slider, sparkline, stat-card, status-indicator, stepper, table, table-of-contents, tabs, tags-input, time-picker, time-range-picker, timeline, toast, top-navigation, upload.

`dialog` não aparece em nenhuma das listas e emite texto fixo nos dois bindings; entra pelo ponto 9.2.

## Apêndice B — divergências entre bindings

| Família | Hoje | Fecho |
| --- | --- | --- |
| `badge` | texto só em React | chaves iguais nos dois |
| `field-group` | texto só em React | chaves iguais nos dois |
| `result-state` | texto só em React | chaves iguais nos dois |
| `switch` | texto só em React | chaves iguais nos dois |
| `slider` | texto só em Angular | chaves iguais nos dois |
| `table` | `trueLabel` só em React | chave no catálogo, nos dois |
| `dialog` | `Full screen` só em Angular | chaves iguais nos dois |

## Riscos

- Tarefa 5 muda a forma de leitura dos defaults em todas as famílias Angular: maior superfície de regressão do conjunto. Mitigação: o teste de troca de locale por família é escrito na mesma tarefa em que a família é migrada.
- A tradução de `pt-BR` é caminho crítico da tarefa 3 e é trabalho de conteúdo. A paridade de slots e o tipo `Catalog` impedem que uma tradução incompleta passe.
- O detetor da tarefa 13 pode produzir falso positivo sobre literais técnicos. Mitigação: o teste do detetor cobre os casos de exclusão antes de a trava entrar em `check`.
