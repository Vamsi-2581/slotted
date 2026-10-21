# Findings da revisão do dono do equori — triagem e plano

Fonte: 18 findings do projeto consumidor equori, recebidos em 2026-10-21 sobre `@slotted/react`
`0.1.0-beta.7`. Base do trabalho: `9d2142ce` (`v0.1.0-beta.8`). Uma fatia fecha até três tarefas.
Cada defeito leva o teste que falha antes da mudança. React e Angular recebem a mesma mudança de
contrato. Verificação restrita à superfície alterada; sem lotes de subagentes e sem
`pnpm eval:agent-docs` fora de um release. O conteúdo de `tools/agent-docs/content/` mudou (itens 10–16):
o próximo release corre `pnpm eval:agent-docs` antes de publicar.

## Triagem

| #   | Área                          | Tipo     | Estado na triagem                                                                                                                       |
| --- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | styles (todas as famílias)    | defeito  | Por medir. Mudança de arquitetura de seletores; exige desenho antes da fatia.                                                           |
| 2   | dialog                        | defeito  | Confirmado. `dialog-parts.tsx:231` depende de `[content, dialog]`; o objeto `dialog` muda a cada render da raiz.                        |
| 3   | data-grid                     | defeito  | Por medir. Linha `memo` lê o contexto inteiro da grelha.                                                                                |
| 4   | core focus                    | defeito  | Confirmado. `arrow-navigation.ts:117` chama `getComputedStyle` por item na coleta.                                                      |
| 5   | page                          | defeito  | Por medir. `STICKY_BOTTOM_PROPERTY` escrito em `main`; `runtime-properties.mjs` declara os offsets.                                     |
| 6   | button                        | defeito  | Por medir. `button-content.tsx:51` acrescenta o indicador quando não há slot `start`/`end`.                                            |
| 7   | detail-panel, page-header     | defeito  | Por medir. `detail-panel.css` sob `scroll="self"`.                                                                                      |
| 8   | data-grid, button             | defeito  | Por medir. Anel do cursor como `box-shadow` inset na célula.                                                                           |
| 9   | data-grid                     | melhoria | Confirmado. `data-grid.tsx:3107` mostra o botão sempre que `hasMore && onLoadMore`.                                                     |
| 10  | agent-docs (compose-screen)   | melhoria | Por avaliar contra o texto atual de `tools/agent-docs/content/`.                                                                        |
| 11  | agent-docs (list-pages), data-grid | melhoria | Por avaliar.                                                                                                                      |
| 12  | agent-docs (list-pages, LA-03) | melhoria | Por avaliar.                                                                                                                           |
| 13  | agent-docs (overviews, record-pages, stat-card) | melhoria | Por avaliar.                                                                                                        |
| 14  | data-grid, agent-docs         | melhoria | Por avaliar.                                                                                                                            |
| 15  | agent-docs (async-feedback, waiting-states) | melhoria | Por avaliar.                                                                                                            |
| 16  | agent-docs (composition CP-07) | melhoria | Por avaliar.                                                                                                                           |
| 17  | data-grid                     | defeito  | Confirmado. `data-grid.tsx:553,578` e `data-grid.ts:1814,1851` emitem `groups: []` em modo servidor.                                    |
| 18  | icon (core glyph)             | melhoria | Confirmado. `glyphs.ts` tem `chevron-right`, `chevron-down`, `arrow-left`, `arrow-up` apenas.                                          |

## Fatias

1. Custo de render em camadas e foco: 2, 4, 5.
2. data-grid, re-render de linhas: 3.
3. styles, custo de correspondência de seletores: 1 (desenho, medição, migração).
4. Visual: 6, 7, 8.
5. data-grid, contrato: 17, 9, 14 (API).
6. Glifos e guidelines de lista: 18, 11, 12.
7. Guidelines restantes: 13, 15, 16, 10.

## Resultado

| #   | Estado   |
| --- | -------- |
| 1   | Corrigido: chave de seletor (`data-part-<parte>`, `data-ui-<família>`) ao lado de `data-part`/`data-ui` em todo elemento; CSS-fonte chaveado (19 495 seletores); `@slotted/core/selector-key` (`selectorKeyProps`, `withSelectorKey`, `keyedProps`, `hostSelectorKey`, `writeSelectorKey`); guarda de invariante nos setups React (unit e browser) e Angular. Medição (Chromium headless, estilo apenas): página data-grid 357–470 ms antes; 29 ms acima do documento sem folhas depois (1 499 elementos, 1 440 px). `styles.perf.browser.test.tsx` com orçamento de 45 ms. Restam ~5 ms em ~250 regras de compound final sem chave (`> *`, `:first-child`, `:not()`), sem reescrita que preserve a semântica, e ~15 ms de aplicação de declarações. Partes que o conteúdo do `prose` escreve (`lead`, `exclude`, `footnotes`) ficam por valor. `docs/styling.md` › Selector keys. |
| 2   | Corrigido: o efeito da camada depende de `back`, `escape`, `modal`, `open`, `outsidePress`, `trigger` e do nó; `close`, `nodes.cancel` e o foco lidos por ref. Teste: 5 re-renders com `onOpenChange` inline — 20 mutações de `inert` antes, 0 depois. Angular: foco lido com `untracked`. |
| 3   | Corrigido (React): o contexto do data-grid carrega um proxy estável sobre o valor mais recente; `BodyRow` assina um store (`useSyncExternalStore`) com assinatura por linha (seleção, cursor, edição, expansão, intervalo, alterações) e uma versão global para colunas, renderizadores e idioma. Testes: um clique de checkbox renderiza 1 linha (30 antes, `data-grid.renders.test.tsx`); scroll de uma linha renderiza ≤ 2 (17 antes, `data-grid.browser.test.tsx`). Angular não medido: sinais reavaliam bindings sem reescrever o DOM. |
| 4   | Corrigido: a coleta filtra só `[hidden]`; `visibility` computada lida em `step`/`edge` para o candidato da tecla. Testes: zero `getComputedStyle` na coleta e no tab stop (criação, `refresh`, `setActive`); item `visibility: hidden` saltado na tecla. |
| 5   | Parcial: uma escrita por mudança de altura, sem remover e reescrever; remoção só ao desmontar (React e Angular). Teste: 2 mutações antes, 1 depois; 0 para a mesma altura. Recalc de subárvore mantém-se: os leitores (`section`, `table`, `detail-panel`, `wizard`, elementos do consumidor) estão em profundidade arbitrária e leem por `var()` herdado; `inherits: false` remove o valor deles. O custo por elemento cai com o item 1. |
| 6   | Corrigido (CSS, as duas bindings): o slot (`start`/`end`/`icon`) que contém o anel fica `visibility: hidden` e o anel `visible`, posicionado sobre a caixa do glifo. `button.browser.test.tsx`: glifo oculto, anel visível, caixa do `IconButton` igual à do repouso; 2 falhas antes, 2 passam depois. |
| 7   | Corrigido na origem (core `sticky-header`): a classe compacta, que tira o header de `sticky`, lia a largura do próprio header; passa a ler a largura do frame (telefone). Um painel estreito num frame de desktop mantém o header sticky. Testes core (45/45, um novo), React/Angular page-header ajustados; `detail-panel.browser.test.tsx` (420 × 400 px em 1 440 px, scroll 600 px: topo do header igual ao do painel) falha antes, passa depois. Docs de `data-compact` atualizados. |
| 8   | Corrigido: as linhas do corpo reescrevem `--slotted-control-height-sm/md/lg` e `--slotted-target-min` como a faixa menos o anel e um espaço de cada lado, de modo que um controle do renderizador fica dentro do anel em qualquer densidade (a célula em edição mantém a sua regra). `data-grid.browser.test.tsx`: `Button` ghost `sm` na célula corrente dentro do anel nos quatro lados; falha antes (0,5 px), passa depois. O anel continua `box-shadow` (os pseudo-elementos da célula já servem ao intervalo, ao inválido e à borda fixa). |
| 9   | Feito: `loadMoreTrigger: 'scroll' \| 'button' \| 'both'` (padrão `scroll`, também nos defaults) e `loadMoreFailed`. Em `scroll` o rodapé mostra `role="status"` "Loading more rows…" enquanto carrega e Try again só após falha; o pedido automático pára com `button` ou com falha. React e Angular, mensagem `loadingMore` (en, pt-BR), contrato e docs. Testes React (3, falham antes) e Angular (3). |
| 10  | Feito: `compose-screen` ganha o passo 1 "Name the domain values" (valor, tarefa, família que o aceita, e se a executa num passo; senão CP-04 antes da escolha) e o item 5 do Done; secções renumeradas e `content.test.ts` atualizado. |
| 11  | Feito: LP-15 (grade sobre a superfície da página é `framed`; `ruled` só sob página `bleed`; `plain` dentro de card) e linha de varrimento no `review-screen`. O padrão do data-grid fica `ruled`: a escolha depende do contexto da página, que o componente não lê. |
| 12  | Feito: LP-16 (subheading, controle do período, figuras na `header-area`, ação primária sólida no fim; refresh como `iconButton`, nunca única ação) e linha de varrimento no `review-screen`. |
| 13  | Feito: OV-06 em `overviews.md` (rótulo de até três palavras, mesmas partes opcionais em todos os cards da linha; regra única, aplicada a overviews e record pages) e linha de varrimento no `review-screen`. |
| 14  | Feito. LP-17 (ações fixadas por padrão; row header fixado com `pinned: 'start'` quando é a primeira coluna) e linha de varrimento. API: `GridColumn.pinned`; uma coluna `kind: 'actions'` fica fixada ao fim enquanto o estado de colunas não declara pins; o estado que os declara prevalece; a vista serializada só escreve pins diferentes do modelo (as duas listas, vazias incluídas). A `rowHeader` não é fixada por omissão: fixar move a coluna para o início e reordenaria grades em que ela não é a primeira. Testes core (3) e React. |
| 15  | Feito: AF-08 (MUST) em `async-feedback.md`; item no checklist do `waiting-states` (regiões alteradas por cada escrita, e onde são relidas); linha de varrimento no `review-screen`. |
| 16  | Feito: CP-07 retirado, reescrito como CP-10 (destinos `full`, formulários `wide`, prosa `measure`); `compose-screen` passo de composição atualizado; linha de varrimento no `review-screen`. |
| 17  | Corrigido: core `groupInOrder` agrupa as linhas recebidas na ordem dada (execuções consecutivas; um valor que volta depois de outra execução recebe chave `~2`), com contagem e agregados; o modo servidor do React e do Angular usa-o. Testes: core (3), React e Angular (6 linhas em 3 datas → 3 grupos de 2); o de React falha antes. |
| 18  | Feito: `chevron-left`, `chevron-up`, `arrow-right`, `arrow-down` no core (geometria Lucide, traço 2). Teste das quatro direções de chevron e arrow (`glyph.test.tsx`) falha antes, passa depois. |
