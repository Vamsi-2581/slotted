# Build schedule

O que executar, em que ordem, e o que pode rodar ao mesmo tempo. Cada bloco de
código é uma sessão limpa: cole exatamente o que está nele.

`docs/process/build-order.md` diz o que cada família entrega.
`docs/build-briefing.md` é lido pelo passo 1 da skill e carrega o resto.
As rodadas 1 a 12 do passe 1 estão em `docs/archive/build-schedule-pass-1.md`.

## Como ler

- **Rodada** é uma barreira. Nada de uma rodada começa antes de todas as sessões
  da rodada anterior terem passado no gate de release.
- Cada sessão de família para **duas vezes**. A primeira é o gate visual: só o
  harness, sem Storybook e sem binding nenhum. A segunda é o gate de release.
- Dentro de uma rodada, cada bloco é uma sessão. Blocos da mesma rodada rodam
  **ao mesmo tempo**, na mesma worktree.
- Um bloco com duas ou mais invocações é **uma sessão só**, em série: as famílias
  compartilham uma decisão e separá-las significaria decidi-la duas vezes.
- Rodada com um bloco só é sequencial por dependência, não por precaução.
- Quando uma rodada tem mais de um bloco, cada prompt carrega o aviso de
  concorrência. Sem ele a sessão roda `pnpm format` ou `git add -A` e leva
  junto o trabalho da outra.
- Uma rodada de **revisão** não invoca `/component`. O bloco é o comando que
  a inicia.

## Onde estamos — 2026-09-15

O passe 1 terminou: 79 famílias em `specs/components/`, ondas 0 a 8, rodadas 1
a 12. A rodada 12 (operandos `time`, `datetime`, `date-range-picker` e
`tags-input` no filtro do `table`) foi commitada em 2026-09-15.

A sessão `filter-bar code-block` da rodada 11 fechou em `8db03ea`; a decisão
transversal da variante `plain` fechou em `bad653d`. A árvore está limpa.

Seis famílias da onda 8 não foram construídas: `side-navigation`,
`top-navigation`, `command-palette`, `data-grid`, `time-range-picker` e
`datetime-range-picker`. Estão na onda 9.

Duas passagens de revisão ficaram devidas por escrito e não são sessão de
família: as páginas de referência entregues antes da barra de _Demonstrations_
(`.claude/skills/component/references/stories.md`), e o refino das famílias
que o passe 1 deixou instáveis (`docs/process/implementation-review.md`, passe 2). A
segunda depende da triagem por família registrada nesse arquivo.

## Rodada 13 — fechar o passe 1 · 1 sessão

Muda a fundação e por isso corre sozinha.

```
Reabertura da fundação, regra R2 de docs/archive/implementation-review-pass-1.md:
os inner controls (clear, reveal, os steppers de number-field e currency-field
e os restantes de packages/styles/src/inner-control.test.mjs) medem glifo mais
um passo de ar — 22px num controle de 26px em compact — e não a escala
--slotted-control-inner-size-* que kbd e tag já leem dentro de um controle.
Mude a regra 1 de R2 para min(glifo + ar, inner-size) nas 27 partes, atualize
inner-control.test.mjs e recapture cada família tocada nas seis combinações do
harness. Uma sessão só; nenhuma outra corre ao mesmo tempo.
```

## Rodada 14 — revisão das páginas de referência · até 3 sessões

Cada sessão recebe um grupo de famílias e aplica _Demonstrations_ e _How much
room a demonstration gets_ de `.claude/skills/component/references/stories.md`
às duas páginas de referência (React e Angular) de cada uma. Uma família por
commit. Os grupos seguem as ondas para que duas sessões não abram a mesma
família.

```
Revisão das páginas de referência, grupo 1: as famílias das ondas 1 a 3 de
docs/process/build-order.md (tabela "Passe 1 — entregue"). Para cada família, leia
references/stories.md, secções Demonstrations e How much room a demonstration
gets, e reescreva as duas páginas de referência para cumpri-las: demos fiéis
à realidade, cobertura exaustiva das capacidades do contrato, palco do tamanho
do que a família é. Não mude contrato, stylesheet nem binding; um defeito
encontrado vira item [ ] no fim da secção da família em
docs/process/implementation-review.md. Uma família por commit.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
Revisão das páginas de referência, grupo 2: as famílias das ondas 4 e 5.
[mesmas instruções do grupo 1]

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
Revisão das páginas de referência, grupo 3: as famílias das ondas 6 a 8,
exceto as entregues a partir de 2026-09-13 (app-shell, action-bar, scroll-area,
code-block, date-range-picker, filter-bar, tags-input, timeline), que já foram
escritas sob a barra atual.
[mesmas instruções do grupo 1]

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 15 — passe de revisão 2 · 1 loop

Depende da triagem em `docs/process/implementation-review.md`: uma seção por família
com veredito `ajuste` ou `refazer`, cada uma com itens no formato do passe 1.
Sem itens `[ ]` o loop termina na primeira sessão.

```
REVIEW_BRANCH=review/implementation-pass-2 scripts/review-loop.sh
```

Uma família com veredito `refazer` não é item de revisão: é uma invocação
`/component <família>` em modo rebuild, agendada na rodada 16 com as famílias
novas da onda 9, porque o custo é o de uma família inteira.

## Rodada 16 — onda 9, infraestrutura · 1 sessão

```
/component drag-and-drop

Módulo @slotted/core/drag, sem UI. Escopo em docs/process/build-order.md, onda 9. A
alternativa por teclado é construída primeiro e o ponteiro deriva dela. Os
consumidores previstos (data-grid, listbox, tree, tags-input, dashboard-grid)
não são tocados nesta sessão; o módulo entrega o seu próprio teste e um
harness de core, como positioner fez na onda 5.
```

Mais as famílias com veredito `refazer` na rodada 15, uma por bloco, com o
aviso de concorrência.

## Rodada 17 — onda 9, famílias · 5 sessões

Nenhuma depende da outra. `data-grid` depende de `drag-and-drop`, que a rodada
16 fechou.

```
/component side-navigation

Ocupa a região nav de app-shell e lê collapsedTo="rail" dela. Escopo em
docs/process/build-order.md, onda 9. As demonstrações de app-shell que hoje montam a
navegação com list-item passam a usar a família.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component top-navigation

Ocupa a região header de app-shell. Escopo em docs/process/build-order.md, onda 9.
Prioridade de colapso por container query; não é um toolbar.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component command-palette

dialog com combobox e listbox dentro. Escopo em docs/process/build-order.md, onda 9.
menu recusou o menu filtrado por texto para esta família; leia a recusa no
inventário de menu antes de decidir a anatomia.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component time-range-picker datetime-range-picker

Uma sessão só: os dois herdam de date-range-picker a banda, o comprimento dito
enquanto o intervalo é desenhado e o rascunho. Escopo em docs/process/build-order.md,
onda 9. A reabertura de table fica para a rodada 18.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component data-grid

A família que aplica o descritor de @slotted/core/filter e herda as quatro
capacidades que table recusou pelo papel ARIA. Escopo em docs/process/build-order.md,
onda 9. Leia docs/history/designs/2026-09-09-table-design.md §1 antes de
escrever: a linha entre as duas famílias foi traçada lá.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 18 — onda 10, primeira leva · 5 sessões

As reaberturas e as famílias de custo mais baixo.

```
/component table

Reabertura, a segunda: time-range-picker como operando único de between na
espécie time e datetime-range-picker na espécie datetime, no lugar dos dois
pickers de TableTimeFilter e TableDateTimeFilter; e a regra de célula
pendente — uma célula com controle plain cede a inserção ao controle. Escopo
em docs/process/build-order.md, onda 10. Descritor, predicado, codec e resumo não
mudam.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component highlight

A folha partilhada em packages/styles/src/highlight vira família com binding e
motor em @slotted/core/highlight. combobox, select, listbox e menu passam a
usar a família no lugar da folha, na mesma sessão. Escopo em
docs/process/build-order.md, onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component context-menu hover-card

Uma sessão só: os dois são o núcleo de uma família entregue (menu, popover)
atrás de um gatilho novo, e a decisão de quanto do núcleo se reexporta é uma.
Escopo em docs/process/build-order.md, onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component split-button toggle

Uma sessão só: os dois são um button com uma semântica a mais, e o que separa
um toggle de um segmento de toggle-group já foi decidido em
docs/history/designs/2026-09-10-toggle-segmented-design.md. Escopo em
docs/process/build-order.md, onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component otp-input

Um input real, oculto, e N caixas pintadas; uma parada de foco. Escopo em
docs/process/build-order.md, onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 19 — onda 10, segunda leva · 5 sessões

```
/component aspect-ratio image

Uma sessão só: image compõe sobre aspect-ratio e a proporção é uma decisão.
Escopo em docs/process/build-order.md, onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component stat-card sparkline

Uma sessão só: sparkline vive dentro do card e da célula. O primeiro SVG da
biblioteca e a primeira escala de cor de dados; decida a escala no gate visual
e registre-a em docs/token-foundation.md. Escopo em docs/process/build-order.md,
onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component table-of-contents

Responde à capacidade que page adiou (inventário de page, l. 154). Escopo em
docs/process/build-order.md, onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component selection-toolbar column-manager

Uma sessão só: os dois leem o modelo de data-grid e de table, e o modelo comum
de seleção e de colunas em @slotted/core/collection é decidido uma vez. Escopo
em docs/process/build-order.md, onda 10.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component data-list

Escopo em docs/process/build-order.md, onda 10. table sob wrap continua a resposta
para o que cabe; a família começa onde ela não cabe.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 20 — onda 10, composições Core · 2 sessões

```
/component data-entry-form

Composição de form, field-group, section, grid, action-bar e inline-message.
Escopo em docs/process/build-order.md, onda 10. A página de referência é um formulário
de cadastro real, com seções condicionais e resumo de erros.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

```
/component crud-list

page-header + filter-bar + data-grid ou table + pagination + selection-toolbar
+ result-state, com criação, edição e detalhe em drawer ou rota. Escopo em
docs/process/build-order.md, onda 10. O estado de query é o codec de URL de filter-bar
mais ordenação e página.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 21 — onda 11 · 12 sessões, em levas de 3

Nenhuma depende da outra; a leva é o limite de revisão, não de dependência.
Ordem sugerida das levas: (`transfer`, `entity-picker`, `hierarchical-picker`),
(`master-detail`, `dashboard-grid`, `wizard`), (`detail-panel`,
`notification-center`, `markdown`), (`tour`, `action-sheet`, `fullscreen`).
Cada bloco é:

```
/component <família>

Escopo em docs/process/build-order.md, onda 11.

Outra sessão pode estar trabalhando nesta mesma worktree agora. Siga "Working
beside another session" em docs/build-briefing.md.
```

## Rodada 22 — onda 12 · 6 sessões, em levas de 2

Ordem sugerida: (`chart`, `event-calendar`), (`audit-log`, `workflow-tracker`),
(`import-export-center`, `search-results`). `chart` primeiro porque
`audit-log` e `search-results` não dependem dele mas as demonstrações de
`dashboard-grid` e `stat-card` passam a usá-lo. Cada bloco segue o formato da
rodada 21 com "onda 12".

## Quantas sessões ao mesmo tempo

Duas é confortável, três é o teto útil. O limite é a revisão humana em cada
gate, não a máquina. Quando uma rodada tem mais blocos do que a revisão
comporta, os blocos restantes ficam para a mesma rodada depois. A barreira é
entre rodadas, não dentro.

## O que nunca roda em paralelo

- Duas sessões que precisem mudar o contrato de tokens, o tema, o schema de
  contrato ou o vocabulário de estados. A segunda começa depois que a primeira
  commitou.
- Uma sessão de família e uma correção de ferramenta compartilhada — harness,
  workbench, schema, fundação. A correção vai sozinha e primeiro.
- `pnpm check:full` de duas sessões ao mesmo tempo. Cada uma veria a outra pela
  metade.
- `scripts/review-loop.sh` e qualquer outra sessão: o loop exige árvore limpa e
  reverte o que encontra fora do índice.
