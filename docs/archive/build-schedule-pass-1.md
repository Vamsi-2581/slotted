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

- **A barra das páginas de referência subiu.** Demos fiéis à realidade e não
  espécimes, cobertura exaustiva do que a família faz e não uma amostra, e
  palco do tamanho do que a família é. Está em _Demonstrations_ e em _How much
  room a demonstration gets_, em `.claude/skills/component/references/stories.md`,
  que o passo 11 da skill lê. Uma família que ocupa uma tela inteira usa
  `.slotted-demo-viewport` com `data-size="screen"`.

Quando uma rodada tem mais de um bloco, cada prompt carrega o aviso de
concorrência. Ele não é decoração: sem ele a sessão roda `pnpm format` ou
`git add -A` e leva junto o trabalho da outra.

## Onde estamos — 2026-09-10

Rodadas 1 a 7 passaram. Da rodada 8 passou uma sessão de quatro,
`date-field calendar date-picker`. A árvore está verde.

**Uma família ficou para trás de uma barreira que já foi ultrapassada:**
`loading-overlay`, da rodada 5. Nunca foi construída e as rodadas 6, 7 e 8
seguiram sem ela. Não depende de nada que falte, e está realojada na rodada 8,
que é a rodada corrente.

`alert-dialog` não está em falta: foi entregue dentro de `dialog`, como uma
família com dois papéis, e por isso não tem `specs/components/alert-dialog/`.

Falta ainda ver, e não é uma sessão de família: as páginas de referência já
entregues foram escritas antes da barra de _Demonstrations_ em
`references/stories.md` — demos fiéis à realidade, cobertura exaustiva das
capacidades, e palco do tamanho do que a família é. Uma passagem de revisão
sobre elas é trabalho a agendar, não um defeito de nenhuma família.

A rodada 12 é a única que volta a uma família entregue. O filtro por coluna do
`table` está construído sobre `@slotted/core/filter`, e três famílias que ainda
não existem trazem operandos que o motor ainda não sabe dizer — a cadeia de
hora, `date-range-picker` e `tags-input`. Está agendada e não é dívida: o que
está entregue não muda de forma.

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

## Rodada 5 — o que depende dos overlays · 1 sessão, mais um refino em seguida

```
/component drawer

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

`loading-overlay` era a segunda sessão desta rodada e não foi executada. Está
realojada na rodada 8; ver _Onde estamos_.

E, quando `drawer` passar, o refino que estava esperando `menu`:

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

## Rodada 8 — o resto do Core · 6 sessões

`date-field calendar date-picker` já passou; as outras cinco continuam abertas.

```
/component date-field calendar date-picker

Uma sessão só: os três compartilham a aritmética de data e o formato por locale.
Decida onde essa aritmética vive — ao lado de core/collection ou em entrada
própria — antes de escrever a primeira.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component time-field time-picker

Logo depois de date-field calendar date-picker, que já passou e que deixou o
motor pronto. Uma sessão só, e nesta ordem: o picker compõe o campo.

Core, não Extended: um formulário que sabe dizer quando precisa da hora, e
entregar o campo de data sem o de hora deixa o consumidor escrever o dele contra
o motor que esta biblioteca publicou.

Não há motor novo aqui: packages/core/src/date/segments.ts percorre um número
dentro de um intervalo, dá a volta, aceita algarismos e termina a sequência
quando mais nenhum cabe, sem saber o que o campo significa. fieldRange é o único
lugar onde os campos são nomeados. Hora, minuto e segundo são uma união mais
larga e três linhas ali.

O painel de horas é uma lista no passo que o consumidor definiu, o que é listbox
e não grid: compõe select, não calendar. O valor é PlainTime, nunca um instante
com fuso — a razão está em "Decisions already taken" no briefing.

O revisor pediu que esta cadeia seja mais inventiva que o campo pesquisado. A
abertura que a onda 7 encontrou e não tomou: uma hora escrita como duração a
partir de agora, resolvida à vista antes de ser aceita. Está em
docs/superpowers/specs/2026-09-09-date-design.md §12.

De todas as sessões desta rodada é a que menos toca em arquivo compartilhado:
@slotted/core/date já é uma entrada, então nem package.json nem vite.config.ts
de core mudam.

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

A referência é a Dynamic Page do SAP Fiori, e a ideia é a mesma com mais
robustez e mais refino. Não é um cabeçalho com um título: é uma casca de tela
com mecânica própria — área de título sempre visível, área de cabeçalho que
encolhe ao rolar e reabre, fixador para quem quer o cabeçalho aberto enquanto
rola, título encolhido diferente do expandido, ações de navegação entre
registros, e barra inferior flutuante para as ações que fecham a tarefa.

Peça ao revisor, antes de inventariar, a implementação de page-header que ele
tem em outro repositório. O inventário parte dela e do Fiori. Sem ela, pare e
pergunte: essa é a única pergunta bloqueante desta sessão.

Nenhuma demo desta família cabe em um palco de painel. Use
.slotted-demo-viewport com data-size="screen" e leia "How much room a
demonstration gets" em references/stories.md antes de escrever a primeira
story.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component multi-select

`select` entrega multiple com um resumo no gatilho, e o contrato dele diz por
escrito que as fichas removíveis, a criação, os limites, os duplicados, a
reordenação e a colagem são desta família. Enquanto ela não existir, essas seis
capacidades não existem em lugar nenhum da biblioteca.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component loading-overlay

Atrasada: é da onda 5 e as rodadas 6, 7 e 8 seguiram sem ela. Consome a infra de
overlay da rodada 3, que já existe. A fronteira a decidir é com skeleton e com
progress-indicator: um scrim sobre uma região que já tem conteúdo não é o mesmo
que um esqueleto no lugar de conteúdo que ainda não chegou, e a família precisa
dizer qual das duas é.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 9 — datetime e composições · 3 sessões

As duas composições dependem de `page` e das coleções. `datetime-field` e
`datetime-picker` dependem da cadeia de hora, que é a razão de estarem aqui e
não uma rodada acima.

```
/component datetime-field datetime-picker

Depois de time-field e time-picker, que estas duas compõem junto com date-field
e calendar. É a razão de estarem nesta rodada e não na anterior, ao lado da
cadeia de hora: compõem o que ela entrega.

datetime-field é uma moldura, um group e um valor só: PlainDateTime, que é um
PlainDate ao lado de um PlainTime. datetime-picker é a única família da
biblioteca que segura duas superfícies, e a decisão que ela deve é qual delas
abre primeiro — e o que acontece com a outra quando o leitor termina na
primeira.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

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

## Rodada 11 — Extended, segunda leva · 5 sessões

Cada uma depende de algo da rodada 10, das coleções ou da cadeia de data.

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
/component date-range-picker

Dois campos e o modo range que calendar já tem, atrás de um gatilho. Não depende
da cadeia de hora. O revisor pediu que o comprimento do intervalo seja dito
enquanto ele está sendo desenhado, e não só as duas pontas; a razão está em
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

## Rodada 12 — a volta ao filtro do `table` · 1 sessão

A única rodada que volta a uma família já entregue, e por uma razão que já está
escrita: o filtro por coluna do `table` foi construído sobre
`@slotted/core/filter`, e cada família que a rodada 9 e a rodada 11 entregam
traz um operando que o motor ainda não tem palavra para dizer. Não é um remendo
e não é dívida: uma espécie nova é vocabulário no motor, um componente por
binding e uma cena. Nada do que já está entregue muda — o descritor de `between`
continua `{ operator, value, end }`, e o que troca é o controlo dentro de
`filter-operand`, que é a parte que a família já deixa substituir.

Depois da rodada 11 porque precisa das três: `time-picker` e `datetime-picker`
da rodada 9, `date-range-picker` e `tags-input` da rodada 11. Uma sessão só, e
não três, porque as três mexem no mesmo módulo do motor e nos mesmos cinco
componentes: separá-las seria abrir o mesmo ficheiro três vezes e gastar três
gates onde um chega.

```
/component table

Volta ao filtro por coluna, agora que existem os controlos que faltavam quando
ele foi construído. Três trabalhos, um por família nova:

- espécies `time` e `datetime` em @slotted/core/filter, com os operadores de
  `date` sobre um PlainTime e um PlainDateTime, e TableTimeFilter e
  TableDateTimeFilter nos dois bindings. O descritor guarda o texto ISO, pela
  mesma razão que a espécie `date` guarda YYYY-MM-DD.
- date-range-picker como operando único de `between` na espécie `date`, onde
  hoje o painel desenha dois date-picker lado a lado.
- tags-input como operando do filtro de conjunto quando a lista de valores é
  grande demais para caixas de seleção.

O que está entregue não muda de forma: o descritor, o predicado, o codec e o
resumo continuam os mesmos, e nenhuma consulta escrita por um consumidor deixa
de ser lida. Decisões em
docs/superpowers/specs/2026-09-10-table-filter-design.md, e o âmbito de cada uma
das três está escrito na família que a fornece, em docs/build-order.md.

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
