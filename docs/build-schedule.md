# Build schedule

O que executar, em que ordem, e o que pode rodar ao mesmo tempo. Cada bloco de
código é uma sessão limpa: cole exatamente o que está nele.

`docs/build-order.md` diz o que cada família entrega.
`docs/build-briefing.md` é lido pelo passo 1 da skill e carrega o resto.

## Como ler

- **Rodada** é uma barreira. Nada de uma rodada começa antes de todas as sessões
  da rodada anterior terem passado no gate de release.
- Cada sessão para **duas vezes**. A primeira é o gate visual: só o harness, sem
  Storybook e sem binding nenhum, e é onde uma anatomia errada custa o
  stylesheet em vez da família inteira. Responda rápido — a sessão fica parada.
  A segunda é o gate de release, a revisão que você já faz.
- Dentro de uma rodada, cada bloco é uma sessão. Blocos da mesma rodada rodam
  **ao mesmo tempo**, na mesma worktree.
- Um bloco com duas ou mais invocações é **uma sessão só**, em série: as famílias
  compartilham uma decisão e separá-las significaria decidi-la duas vezes.
- Rodada com um bloco só é sequencial por dependência, não por precaução.

Quando uma rodada tem mais de um bloco, cada prompt carrega o aviso de
concorrência. Ele não é decoração: sem ele a sessão roda `pnpm format` ou
`git add -A` e leva junto o trabalho da outra.

## Antes de abrir qualquer rodada

Um teste está vermelho: `packages/styles/src/tokens.test.mjs` acusa
`button-group/tokens.json` em desacordo com o stylesheet. Nenhuma rodada
paralela começa sobre uma árvore vermelha — o próximo `check:full` de cada
sessão acusaria o mesmo defeito e cada uma tentaria consertar o que não é seu.

```
Corrija o único teste vermelho do repositório: packages/styles/src/tokens.test.mjs
acusa que button-group/tokens.json discorda dos custom properties que o
stylesheet lê. Ajuste o tokens.json, rode pnpm check:full e commite só esse
arquivo. Não toque em nenhuma outra família.
```

Opcional, e paga rápido em trabalho paralelo:

```
Em packages/styles/package.json, troque as listas explícitas dos scripts test e
typecheck por globs: `node --test "src/**/*.test.mjs"` e
`find src -name '*.test.mjs' -print0 | xargs -0 -n1 node --check`. Verifiquei que
o glob roda o mesmo conjunto de testes. Isso apaga o arquivo que mais conflita
entre sessões paralelas e um passo manual por família. Rode pnpm check:full e
commite só esse arquivo.
```

## Rodada 1 — o que falta da onda 4 · 3 sessões

Nenhuma das três depende da outra.

```
/component description-list

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component list list-item

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component result-state

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 2 — Prose · 1 sessão

Depende de `list` e de `link`, e fecha a onda 4.

```
/component prose
```

## Rodada 3 — infraestrutura de overlay · 1 sessão

Quatro módulos de `packages/core`, sem UI. Um bloco só porque os quatro editam
`packages/core/package.json`, `vite.config.ts` e `src/index.ts` — em sessões
paralelas eles brigariam pelos mesmos três arquivos a cada minuto.

```
/component presence dismissable-layer portal positioner live-announcer

São módulos de packages/core, não famílias de UI: sem stylesheet, sem harness,
sem página de referência. Cada um com teste próprio. `focus` já existe e é
revisado, não reescrito. Ao final, rode pnpm --filter @slotted/core build, ou
nenhum pacote de framework conseguirá importá-los.
```

## Rodada 4 — overlays · 4 sessões

Todos consomem a infra da rodada 3 e nenhum consome o outro.

```
/component tooltip popover

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component dialog alert-dialog

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component menu menubar

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component toast

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

`tooltip popover` é uma sessão só: são o mesmo posicionamento com políticas de
dismissal diferentes, e decidir isso duas vezes produz duas respostas.

## Rodada 5 — o que depende dos overlays · 2 sessões

```
/component drawer

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component loading-overlay

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

E, quando as duas passarem, o refino que estava esperando `menu`:

```
/component toolbar

Refino: o overflow para menu, que ficou de fora quando a família foi construída
porque `menu` ainda não existia. Ação primária permanece visível; o que entra no
overflow é o que sobra, não o que é conveniente esconder.
```

## Rodada 6 — o motor de coleções · 1 sessão

```
/component listbox

Antes da família, revise packages/core/collection: chaves estáveis, seções,
typeahead, seleção, carregamento incremental e virtualização como capacidade
opcional da coleção — nunca uma família paralela. Listbox é o primeiro consumidor
real do motor e o primeiro caso de janela com seleção ao mesmo tempo, que é o
teste de se `virtualWindow` foi desenhado certo.
```

## Rodada 7 — coleções · 3 sessões

```
/component select combobox

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component tree

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component table

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 8 — o resto do Core · 4 sessões

```
/component date-field calendar date-picker

Uma sessão só: os três compartilham a aritmética de data e o formato por locale.
Decida onde essa aritmética vive — ao lado de core/collection ou em entrada
própria — antes de escrever a primeira.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component upload

Consolidação: dropzone, file-input e upload são partes de uma família só.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component page page-header section

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component multi-select

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 9 — composições · 2 sessões

Dependem de `page` e das coleções.

```
/component app-shell

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component action-bar

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

Com isto o Core está inteiro.

## Rodada 10 — Extended, primeira leva · 4 sessões

```
/component scroll-area splitter

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component toggle-group segmented-control

Uma sessão só: os dois são o mesmo grupo de itens exclusivos com aparências
diferentes, e decidir a semântica duas vezes produz duas respostas.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component side-navigation

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component timeline

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 11 — Extended, segunda leva · 7 sessões

Cada uma depende de algo da rodada 10 ou das coleções.

```
/component command-palette

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component data-grid

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component time-field time-picker

Uma sessão só, e nesta ordem: o picker compõe o campo. O motor de segmentos já
existe em packages/core/src/date/segments.ts e não sabe o que um campo
significa — hora, minuto e segundo são uma união mais larga em DateFieldName e
três linhas em fieldRange. O painel de horas é uma lista ao passo que o
consumidor definiu, portanto listbox e não grid: compõe select, não calendar.
O valor é PlainTime, nunca um instante com fuso; a razão está em "Decisions
already taken" no briefing.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component datetime-field datetime-picker

Depois de time-field e time-picker, que estas duas compõem junto com date-field
e calendar. datetime-field é uma moldura, um group e um valor só —
PlainDateTime, que é um PlainDate ao lado de um PlainTime. datetime-picker é a
única família que segura as duas superfícies, e a decisão que deve é qual delas
abre primeiro.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component date-range-picker

Dois campos e o modo range que calendar já tem, atrás de um trigger. Não
depende da cadeia de hora. O revisor pediu que o comprimento do intervalo seja
dito enquanto ele está sendo desenhado; a razão está em
docs/superpowers/specs/2026-09-09-date-design.md §12.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component tags-input

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component filter-bar code-block

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Quantas sessões ao mesmo tempo

Duas é confortável, três é o teto útil. O limite não é a máquina: é você. Cada
sessão para num gate e espera uma revisão sua, e quatro gates abertos ao mesmo
tempo transformam a revisão — que é a única etapa que ninguém pode delegar — no
gargalo que o paralelismo deveria remover.

Quando uma rodada tem mais blocos do que você quer revisar de uma vez, rode os
que quiser e deixe o resto para a mesma rodada depois. A barreira é entre
rodadas, não dentro.

## O que nunca roda em paralelo

- Duas sessões que precisem mudar o contrato de tokens, o tema, o schema de
  contrato ou o vocabulário de estados. A segunda começa depois que a primeira
  commitou.
- Uma sessão de família e uma correção de ferramenta compartilhada — harness,
  workbench, schema. A correção vai sozinha e primeiro.
- `pnpm check:full` de duas sessões ao mesmo tempo. Cada uma veria a outra pela
  metade.
